"""
streamlit_app.py — интерфейс Click (автопостинг в Яндекс.Бизнес) на Streamlit.

Логика публикации (Puppeteer) НЕ переписана — publish.js и actualize.js остаются
Node-скриптами и запускаются как дочерние процессы (как раньше делал app.js через
child_process.spawn). Этот файл заменяет только app.js (сервер) + _ui.js (фронт).

Файловые связи сохранены 1:1:
  users-data/{projectId}/tasks/*.json          — задачи для publish.js
  users-data/{projectId}/tasks-actualize/*.json — задачи для actualize.js
  users-data/{projectId}/projects-config.json  — email/пароль ЯБ + страны/города
  users-data/{projectId}/session/cookies.json  — сессия Яндекса (создаёт publish.js)
  users-data/{projectId}/reports/, logs/, reports-actualize/, uploads/

Запуск: streamlit run streamlit_app.py
Node (publish.js/actualize.js) вызывается через subprocess — Node должен быть
установлен и доступен в PATH, зависимости (puppeteer) поставлены (npm install).
"""

from __future__ import annotations

import hashlib
import json
import time
from datetime import datetime
from pathlib import Path

import streamlit as st

import projects_data as pd
import yb_playwright as yb
from playwright_worker import PlaywrightWorker

ROOT = Path(__file__).parent


def get_playwright_worker(key: str) -> PlaywrightWorker:
    """
    Постоянный фоновый поток для Playwright — Streamlit выполняет каждую перерисовку
    в новом потоке, а sync-Playwright требует одного и того же потока на всё время
    жизни браузера (см. playwright_worker.py, тот же файл что и в crosspost/).
    """
    state_key = f"pw_worker_{key}"
    if state_key not in st.session_state:
        st.session_state[state_key] = PlaywrightWorker()
    return st.session_state[state_key]
USERS_DATA = ROOT / "users-data"

st.set_page_config(page_title="Click", page_icon="📮", layout="centered")

# ─── ПРОЕКТЫ (перенесено из projects.js) ───────────────────────────
SALT = "click-salt-v1-2026"


def _hash(password: str) -> str:
    return hashlib.pbkdf2_hmac("sha512", password.encode(), SALT.encode(), 100_000, dklen=64).hex()


PROJECTS = {
    "SMU": {
        "name": "СМУ", "fullName": "Стальметгрупп", "color": "#3b82f6", "icon": "🏗",
        "passwordHash": _hash("1501"), "presetCities": pd.SMU_CITIES, "endings": None,
    },
    "IMP": {
        "name": "ИМП", "fullName": "Инметпром", "color": "#10b981", "icon": "🔩",
        "passwordHash": _hash("2205"), "presetCities": pd.IMP_CITIES, "endings": pd.IMP_ENDINGS,
    },
    "MPE": {
        "name": "МПЭ", "fullName": "МетПромЭнерго", "color": "#f59e0b", "icon": "⚡",
        "passwordHash": _hash("1101"), "presetCities": pd.MPE_CITIES, "endings": pd.MPE_ENDINGS,
    },
}


def verify_password(project_id: str, password: str) -> bool:
    return _hash(password) == PROJECTS[project_id]["passwordHash"]


# ─── ФАЙЛОВЫЕ ПУТИ (те же, что в app.js/getProjectBase) ────────────
def project_base(project_id: str) -> Path:
    d = USERS_DATA / project_id
    d.mkdir(parents=True, exist_ok=True)
    return d


def ensure_dirs(project_id: str):
    base = project_base(project_id)
    for sub in ("tasks", "tasks-actualize", "reports", "reports-actualize", "logs", "uploads", "session"):
        (base / sub).mkdir(parents=True, exist_ok=True)


def config_path(project_id: str) -> Path:
    return project_base(project_id) / "projects-config.json"


def _default_subproject(project_id: str) -> dict:
    """Первичная инициализация — как в app.js/_ui.js: presetCities проекта, если есть."""
    preset = PROJECTS[project_id]["presetCities"]
    countries = []
    if preset:
        by_country: dict[str, list] = {}
        for city in preset:
            by_country.setdefault(city["country"], []).append(
                {"id": f"id-{safe_filename(city['name'])}-{len(by_country.get(city['country'], []))}", "name": city["name"], "url": city["url"]}
            )
        countries = [{"id": f"id-country-{safe_filename(name)}", "name": name, "cities": cities} for name, cities in by_country.items()]
    return {
        "id": f"id-{project_id.lower()}-default",
        "name": PROJECTS[project_id]["fullName"],
        "email": "", "password": "", "countries": countries,
    }


def load_raw_config(project_id: str) -> dict:
    """
    Читает users-data/{project}/projects-config.json КАК ЕСТЬ — реальный формат:
    { projects: [{id, name, email, password, countries: [...]}], activeProjectId, collapsedCountries }
    ВАЖНО: для ИМП там уже настоящие рабочие данные (страны/города), их нельзя терять —
    поэтому не переизобретаем формат, а работаем с тем, что реально лежит на диске.
    """
    fp = config_path(project_id)
    if fp.exists():
        try:
            raw = json.loads(fp.read_text(encoding="utf-8"))
            if raw.get("projects"):
                return raw
        except (json.JSONDecodeError, OSError):
            pass
    sub = _default_subproject(project_id)
    return {"projects": [sub], "activeProjectId": sub["id"], "collapsedCountries": {}}


def get_active_subproject(raw: dict) -> dict:
    active_id = raw.get("activeProjectId")
    for sub in raw["projects"]:
        if sub["id"] == active_id:
            return sub
    return raw["projects"][0]


def load_config(project_id: str) -> dict:
    """Возвращает АКТИВНЫЙ под-проект (email/password/countries) — то, с чем работает UI."""
    raw = load_raw_config(project_id)
    st.session_state[f"_raw_config_{project_id}"] = raw
    return get_active_subproject(raw)


def save_config(project_id: str, config: dict):
    """
    config — это тот же объект активного под-проекта (изменяется на месте вызывающим
    кодом), просто пересохраняем весь raw-файл, в котором он уже находится по ссылке.
    """
    raw = st.session_state.get(f"_raw_config_{project_id}") or load_raw_config(project_id)
    config_path(project_id).write_text(json.dumps(raw, ensure_ascii=False, indent=2), encoding="utf-8")


def extract_company_id(url: str) -> str | None:
    import re
    m = re.search(r"sprav/(\d+)", url or "")
    return m.group(1) if m else None


def safe_filename(s: str) -> str:
    import re
    return re.sub(r"[^a-zA-Zа-яА-Я0-9._-]", "_", str(s))[:80]


# ─── ТЕКСТ ПОСТА (порт buildFinalText из _ui.js) ───────────────────
def build_final_text(project_id: str, country_name: str, post_type: str, body: str) -> str:
    lines = []
    if body.strip():
        lines.append(body.strip())

    endings = PROJECTS[project_id]["endings"]
    if endings and endings.get("__dynamic"):
        contacts = endings["contacts"].get(country_name)
        template = endings["templates"].get(post_type)
        if not template or not contacts:
            return "\n".join(lines)

        def subst_line(ln: str) -> str | None:
            stripped = ln.strip()
            if stripped == "{phoneLine}" and not contacts.get("phone"):
                return None
            if stripped == "{phoneSpecialLine}" and not contacts.get("phone"):
                return None
            if stripped == "{phoneSpecialLineMpe}" and not contacts.get("phone"):
                return None
            phone = contacts.get("phone") or ""
            return (
                ln.replace("{site}", contacts.get("site", ""))
                .replace("{email}", contacts.get("email", ""))
                .replace("{phoneLine}", f"📞 {phone}" if phone else "")
                .replace("{phoneSpecialLine}", f"☎️ {phone}" if phone else "")
                .replace("{phoneSpecialLineMpe}", f"📱 Телефон: {phone}" if phone else "")
                .replace("{phone}", phone)
            )

        subst_lines = [x for x in (subst_line(ln) for ln in template.split("\n")) if x is not None]
        collapsed = []
        for i, ln in enumerate(subst_lines):
            if ln.strip() == "" and collapsed and collapsed[-1].strip() == "":
                continue
            collapsed.append(ln)
        lines.append("")
        lines.append("\n".join(collapsed))
        return "\n".join(lines)

    # СМУ — старая логика по COUNTRY_TEMPLATES
    tpl = pd.COUNTRY_TEMPLATES.get(country_name, pd.COUNTRY_TEMPLATES["Россия"])
    type_def = next((t for t in pd.POST_TYPES if t["id"] == post_type), pd.POST_TYPES[0])
    if type_def["hasContact"]:
        lines.append("")
        lines.append("Ознакомиться с наличием металлопроката в вашем городе, оформить заказ и проконсультироваться с менеджерами можно на нашем сайте:")
        lines.append(f"🌐 {tpl['site']}")
        lines.append(f"📩 {tpl['email']}")
        lines.append(f"📞 {tpl['phone']}")
        lines.append("")
        lines.append(f"{type_def['hashtag']} {pd.COMMON_HASHTAGS_SMU}".strip())
    elif type_def["isInfo"]:
        lines.append("")
        lines.append(f"Ознакомиться с ассортиментом трубного проката и техническими параметрами можно на нашем сайте {tpl['site']}")
    return "\n".join(lines)


# ─── ЗАДАЧИ (тот же JSON-формат, что читает publish.js) ────────────
def save_tasks(project_id: str, config: dict, country_id: str, city_ids: list[str], post_type: str, body: str, image_path: str | None):
    country = next((c for c in config["countries"] if c["id"] == country_id), None)
    if not country:
        return 0
    text = build_final_text(project_id, country["name"], post_type, body)
    tasks = []
    for city in country["cities"]:
        if city["id"] not in city_ids:
            continue
        tasks.append({
            "cityName": city["name"],
            "companyUrl": city["url"],
            "companyId": extract_company_id(city["url"]),
            "postText": text,
            "imageUrl": None,
            "imagePath": image_path,
            "extraImages": None,
            "productPhotos": None,
        })
    if not tasks:
        return 0
    item = {
        "credentials": {"email": config.get("email", ""), "password": config.get("password", "")},
        "projectName": PROJECTS[project_id]["name"],
        "country": country["name"],
        "generatedAt": datetime.utcnow().isoformat(),
        "delayBetweenPosts": 3000,
        "headlessMode": False,
        "tasks": tasks,
    }
    tasks_dir = project_base(project_id) / "tasks"
    tasks_dir.mkdir(parents=True, exist_ok=True)
    ts = int(time.time() * 1000)
    name = f"01-{safe_filename(country['name'])}-{ts}.json"
    (tasks_dir / name).write_text(json.dumps(item, ensure_ascii=False, indent=2), encoding="utf-8")
    return len(tasks)


def list_task_files(project_id: str) -> list[str]:
    tasks_dir = project_base(project_id) / "tasks"
    if not tasks_dir.exists():
        return []
    return sorted(f.name for f in tasks_dir.glob("*.json"))


# ─── ЗАДАЧИ АКТУАЛИЗАЦИИ (формат actualize.js — без текста/картинок и без
# credentials: actualize.js использует уже сохранённую сессию из publish.js --login) ──
def save_actualize_tasks(project_id: str, config: dict, country_id: str, city_ids: list[str]) -> int:
    country = next((c for c in config["countries"] if c["id"] == country_id), None)
    if not country:
        return 0
    tasks = [
        {"cityName": city["name"], "companyUrl": city["url"]}
        for city in country["cities"] if city["id"] in city_ids
    ]
    if not tasks:
        return 0
    item = {"country": country["name"], "tasks": tasks}

    tasks_dir = project_base(project_id) / "tasks-actualize"
    tasks_dir.mkdir(parents=True, exist_ok=True)
    # actualize.js читает ВСЮ папку tasks-actualize/ разом — очищаем старые файлы
    # перед сохранением новой пачки, как делал app.js (/api/actualize/save).
    for old in tasks_dir.glob("*.json"):
        old.unlink()
    ts = int(time.time() * 1000)
    name = f"01-{safe_filename(country['name'])}-{ts}.json"
    (tasks_dir / name).write_text(json.dumps(item, ensure_ascii=False, indent=2), encoding="utf-8")
    return len(tasks)


def list_actualize_task_files(project_id: str) -> list[str]:
    tasks_dir = project_base(project_id) / "tasks-actualize"
    if not tasks_dir.exists():
        return []
    return sorted(f.name for f in tasks_dir.glob("*.json"))


# ─── ЭКРАН ЛОГИНА ───────────────────────────────────────────────────
def show_login():
    st.title("📮 Click")
    project_id = st.session_state.get("selected_project_id")

    cols = st.columns(3)
    for col, (pid, p) in zip(cols, PROJECTS.items()):
        with col:
            if st.button(f"{p['icon']} {p['name']}", key=f"proj-{pid}", use_container_width=True):
                st.session_state.selected_project_id = pid
                st.rerun()

    if project_id:
        with st.form("login_form"):
            password = st.text_input("Пароль", type="password")
            submitted = st.form_submit_button("Войти")
        if submitted:
            if verify_password(project_id, password):
                ensure_dirs(project_id)
                st.session_state.current_project_id = project_id
                st.rerun()
            else:
                st.error("Неверный пароль")


# ─── ВКЛАДКА: НАСТРОЙКИ (email/пароль ЯБ + города) ─────────────────
def tab_settings(project_id: str, config: dict):
    st.subheader("Доступ к Яндекс.Бизнесу")
    email = st.text_input("Email", value=config.get("email", ""))
    password = st.text_input("Пароль", value=config.get("password", ""), type="password")
    if email != config.get("email") or password != config.get("password"):
        config["email"] = email
        config["password"] = password
        save_config(project_id, config)

    tab_yandex_login(project_id, config)

    st.divider()
    st.subheader("Страны и города")

    with st.expander("Добавить страну"):
        new_country = st.text_input("Название страны", key="new-country-name")
        if st.button("Добавить страну") and new_country:
            if not any(c["name"].lower() == new_country.lower() for c in config["countries"]):
                config["countries"].append({"id": f"country_{new_country}_{int(time.time())}", "name": new_country, "cities": []})
                save_config(project_id, config)
                st.rerun()
            else:
                st.warning("Такая страна уже есть")

    for country in config["countries"]:
        with st.expander(f"{country['name']} ({len(country['cities'])} городов)"):
            col1, col2, col3 = st.columns([3, 3, 1])
            with col1:
                city_name = st.text_input("Город", key=f"city-name-{country['id']}")
            with col2:
                city_url = st.text_input("Ссылка на карточку ЯБ", key=f"city-url-{country['id']}")
            with col3:
                st.write("")
                if st.button("+", key=f"add-city-{country['id']}") and city_name and city_url:
                    country["cities"].append({"id": f"city_{city_name}_{int(time.time())}", "name": city_name, "url": city_url})
                    save_config(project_id, config)
                    st.rerun()

            for city in country["cities"]:
                c1, c2 = st.columns([5, 1])
                c1.write(f"**{city['name']}** — {city['url']}")
                if c2.button("Удалить", key=f"del-city-{city['id']}"):
                    country["cities"].remove(city)
                    save_config(project_id, config)
                    st.rerun()

            if st.button("Удалить страну", key=f"del-country-{country['id']}"):
                config["countries"].remove(country)
                save_config(project_id, config)
                st.rerun()


# ─── ВЫБОР ГОРОДОВ: мультиселект + «Выбрать все» / «Снять все» ─────
# ВАЖНО: default пустой (ничего не выбрано) — раньше выбирались все города
# страны сразу, из-за чего можно было случайно опубликовать пост не туда.
def city_multiselect(key_prefix: str, country: dict) -> list[str]:
    city_options = {c["id"]: c["name"] for c in country["cities"]}
    state_key = f"{key_prefix}-cities-{country['id']}"

    col1, col2 = st.columns(2)
    with col1:
        if st.button("Выбрать все города", key=f"{key_prefix}-select-all-{country['id']}"):
            st.session_state[state_key] = list(city_options.keys())
    with col2:
        if st.button("Снять все города", key=f"{key_prefix}-deselect-all-{country['id']}"):
            st.session_state[state_key] = []

    return st.multiselect(
        "Города", options=list(city_options.keys()), default=[],
        format_func=lambda cid: city_options[cid], key=state_key,
    )


# ─── ВКЛАДКА: НОВЫЙ ПОСТ ────────────────────────────────────────────
def tab_compose(project_id: str, config: dict):
    if not config["countries"]:
        st.info("Сначала добавьте страны и города во вкладке «Настройки»")
        return

    post_types = pd.POST_TYPES if project_id == "SMU" else [
        {"id": "arrival", "title": "Поступление"}, {"id": "shipment", "title": "Отгрузка"},
        {"id": "special", "title": "Спецпредложение"}, {"id": "info", "title": "Информационный"},
        {"id": "greeting", "title": "Поздравление"},
    ]
    post_type = st.selectbox("Тип поста", [t["id"] for t in post_types], format_func=lambda pid: next(t["title"] for t in post_types if t["id"] == pid))

    body = st.text_area("Основной текст (без контактов — добавятся автоматически)", height=150)

    country_names = [c["name"] for c in config["countries"]]
    selected_country_name = st.selectbox("Страна", country_names)
    country = next(c for c in config["countries"] if c["name"] == selected_country_name)

    selected_city_ids = city_multiselect("compose", country)

    uploaded_file = st.file_uploader("Картинка (необязательно)", type=["jpg", "jpeg", "png", "gif", "webp"])
    image_path = None
    if uploaded_file:
        uploads_dir = project_base(project_id) / "uploads"
        uploads_dir.mkdir(parents=True, exist_ok=True)
        image_path = str(uploads_dir / f"{int(time.time())}-{safe_filename(uploaded_file.name)}")
        with open(image_path, "wb") as f:
            f.write(uploaded_file.getvalue())

    if body.strip():
        preview = build_final_text(project_id, selected_country_name, post_type, body)
        st.text_area("Превью итогового текста", value=preview, height=200, disabled=True)

    if st.button("Сохранить в задачи", type="primary"):
        if not selected_city_ids:
            st.error("Выберите хотя бы один город")
        else:
            count = save_tasks(project_id, config, country["id"], selected_city_ids, post_type, body, image_path)
            st.success(f"Сохранено {count} городов в задачи")


# ─── ВКЛАДКА: АКТУАЛИЗАЦИЯ ──────────────────────────────────────────
# Полностью отдельный от публикации модуль (actualize.js) — просто нажимает
# «Данные актуальны» на карточке, если кнопка появилась. Не нужен текст/картинка,
# не нужны credentials (использует уже сохранённую сессию из publish.js --login).
def tab_actualize(project_id: str, config: dict):
    if not config["countries"]:
        st.info("Сначала добавьте страны и города во вкладке «Настройки»")
        return

    st.caption("Актуализация — отдельный процесс: проверяет каждую карточку и жмёт «Данные актуальны», если кнопка появилась. Не публикует посты.")

    country_names = [c["name"] for c in config["countries"]]
    selected_country_name = st.selectbox("Страна", country_names, key="actualize-country")
    country = next(c for c in config["countries"] if c["name"] == selected_country_name)

    selected_city_ids = city_multiselect("actualize", country)

    if st.button("Сохранить задачи актуализации", type="primary"):
        if not selected_city_ids:
            st.error("Выберите хотя бы один город")
        else:
            count = save_actualize_tasks(project_id, config, country["id"], selected_city_ids)
            st.success(f"Сохранено {count} городов — теперь можно запустить на вкладке «Запуск»")

    existing = list_actualize_task_files(project_id)
    if existing:
        st.caption(f"Сейчас сохранено файлов задач актуализации: {len(existing)}")


# ─── ВКЛАДКА: ЗАПУСК ────────────────────────────────────────────────
# Публикация полностью в фоне: нажали кнопку — браузер работает скрыто (headless),
# никакого окна не открывается, ждёте несколько секунд — приходит результат по
# каждому городу. Единственное, что требует участия человека один раз — вход
# в Яндекс (см. вкладку «Настройки» / первый запуск ниже), потому что код из SMS
# может ввести только человек — так устроен сам Яндекс, это не ограничение Click.
def tab_run(project_id: str):
    tasks = list_task_files(project_id)
    st.write(f"Задач в очереди: **{len(tasks)}**")
    if tasks:
        with st.expander("Список файлов задач"):
            for t in tasks:
                st.write(t)
        if st.button("Очистить все задачи"):
            for t in tasks:
                (project_base(project_id) / "tasks" / t).unlink(missing_ok=True)
            st.rerun()

    tab_cloud_run(project_id)


# ─── ВКЛАДКА: ОТЧЁТЫ И ЛОГИ ─────────────────────────────────────────
def tab_reports(project_id: str):
    st.subheader("Отчёты публикации")
    reports_dir = project_base(project_id) / "reports"
    reports = sorted(reports_dir.glob("report-*.json"), reverse=True)[:30] if reports_dir.exists() else []
    if not reports:
        st.info("Отчётов публикации пока нет")
    for r in reports:
        try:
            data = json.loads(r.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        totals = data.get("totals", {})
        with st.expander(f"{r.name} — {totals.get('ok', 0)}/{totals.get('total', 0)} успешно"):
            st.json(data)

    st.divider()
    st.subheader("Отчёты актуализации")
    reports_act_dir = project_base(project_id) / "reports-actualize"
    reports_act = sorted(reports_act_dir.glob("*.json"), reverse=True)[:30] if reports_act_dir.exists() else []
    if not reports_act:
        st.info("Отчётов актуализации пока нет")
    for r in reports_act:
        try:
            data = json.loads(r.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        totals = data.get("totals", {})
        with st.expander(f"{r.name} — {totals.get('actualized', 0)}/{totals.get('total', 0)} актуализировано"):
            st.json(data)

    st.divider()
    st.subheader("Логи")
    logs_dir = project_base(project_id) / "logs"
    logs = sorted(logs_dir.glob("*.log"), reverse=True)[:20] if logs_dir.exists() else []
    for log_file in logs:
        with st.expander(log_file.name):
            st.text(log_file.read_text(encoding="utf-8", errors="replace")[-5000:])


# ─── ВХОД В ЯНДЕКС (вкладка «Настройки», сразу под email/паролем) ───
# Через Playwright, без Node.js — нужен там, где нет реального браузера
# (например, Streamlit Cloud). Сначала пробуем автоматически по
# email/паролю из настроек; если Яндекс просит что-то ещё (код, капчу,
# подтверждение в приложении) — показываем скриншот вместо окна браузера,
# как у входа через Яндекс ID в Дзене. После входа сессия сохраняется,
# и публикация дальше идёт полностью в фоне, без скриншотов.
def tab_yandex_login(project_id: str, config: dict):
    worker = get_playwright_worker("yb")

    st.divider()
    st.subheader("Вход в Яндекс")

    if yb.has_saved_session(project_id):
        st.success("✓ Сессия Яндекса уже сохранена — публикация будет работать без повторного входа.")
        if st.button("Войти заново (сбросить сессию)", key="yb-reset"):
            yb.session_path(project_id).unlink(missing_ok=True)
            st.rerun()
    else:
        step = st.session_state.get("yb_step", "idle")

        if step == "idle":
            if st.button("Начать вход", key="yb-start"):
                old_flow = st.session_state.get("yb_flow")
                if old_flow is not None:
                    worker.call(old_flow.close)
                try:
                    with st.spinner("Открываю браузер..."):
                        flow = yb.YbLoginFlow(project_id)
                        screenshot = worker.call(flow.start)
                except Exception as e:  # noqa: BLE001
                    # Streamlit прячет текст ошибки в своём собственном обработчике
                    # ("original error message is redacted") — показываем сами,
                    # иначе непонятно, что реально пошло не так (память, сеть и т.п.).
                    st.error(f"Не удалось открыть браузер: {type(e).__name__}: {e}")
                    return
                # Полностью ручной ввод по скриншоту на каждом шаге — без попыток
                # авто-логина: они несколько раз ломали реальный вход Яндекса
                # (откатывало на первый экран), а руками получалось стабильно.
                st.session_state.yb_flow = flow
                st.session_state.yb_screenshot = screenshot
                st.session_state.yb_step = "first"
                st.rerun()

        elif step == "first":
            st.image(st.session_state.yb_screenshot, caption="Посмотрите, что просит страница, и заполните нужное поле")
            col1, col2 = st.columns(2)
            with col1:
                st.markdown("**Если просит телефон**")
                phone = st.text_input("Номер телефона", key="yb-phone")
                phone_clicked = st.button("Отправить телефон", key="yb-submit-phone")
            with col2:
                st.markdown("**Если просит логин/e-mail**")
                login_value = st.text_input("Логин или e-mail", key="yb-login")
                login_clicked = st.button("Отправить логин", key="yb-submit-login")

            flow: yb.YbLoginFlow = st.session_state.yb_flow
            screenshot = None
            if phone_clicked and phone:
                with st.spinner("Отправляю номер телефона..."):
                    screenshot = worker.call(flow.submit_phone, phone)
            elif login_clicked and login_value:
                with st.spinner("Отправляю логин..."):
                    screenshot = worker.call(flow.submit_login, login_value)

            if screenshot is not None:
                st.session_state.yb_screenshot = screenshot
                st.session_state.yb_step = "next"
                st.rerun()

        elif step == "next":
            st.image(st.session_state.yb_screenshot, caption="Посмотрите, что просит страница, и заполните нужное поле")
            col1, col2 = st.columns(2)
            with col1:
                st.markdown("**Если просит пароль**")
                password = st.text_input("Пароль", type="password", key="yb-password")
                password_clicked = st.button("Войти по паролю", key="yb-submit-password")
            with col2:
                st.markdown("**Если просит код (SMS/приложение)**")
                code = st.text_input("Код", key="yb-code")
                code_clicked = st.button("Подтвердить код", key="yb-submit-code")

            st.caption("Если экран просит подтвердить вход в приложении — нажмите кнопку ниже после подтверждения там.")
            confirmed_elsewhere = st.button("Я подтвердил(а) в приложении — проверить", key="yb-check-external")

            flow: yb.YbLoginFlow = st.session_state.yb_flow
            screenshot = None
            if password_clicked and password:
                with st.spinner("Проверяю пароль..."):
                    screenshot = worker.call(flow.submit_password, password)
            elif code_clicked and code:
                with st.spinner("Проверяю код..."):
                    screenshot = worker.call(flow.submit_code, code)
            elif confirmed_elsewhere:
                screenshot = st.session_state.yb_screenshot

            if screenshot is not None:
                st.session_state.yb_screenshot = screenshot
                with st.spinner("Проверяю, выполнен ли вход..."):
                    logged_in = worker.call(flow.is_logged_in)
                if logged_in:
                    worker.call(flow.save_session)
                    worker.call(flow.close)
                    for key in ("yb_flow", "yb_screenshot", "yb_step"):
                        st.session_state.pop(key, None)
                    st.success("Вход выполнен, сессия сохранена!")
                else:
                    st.warning("Похоже, вход ещё не завершён — посмотрите на новый снимок ниже.")
                st.rerun()


# ─── ВКЛАДКА «ЗАПУСК»: публикация/актуализация в фоне через Playwright ──
def tab_cloud_run(project_id: str):
    worker = get_playwright_worker("yb")

    if not yb.has_saved_session(project_id):
        st.info("Сначала войдите в Яндекс на вкладке «Настройки».")
        return

    st.subheader("Публикация в фоне")

    tasks = list_task_files(project_id)
    if not tasks:
        st.info("Очередь задач пуста — сначала сохраните пост на вкладке «Новый пост».")
    else:
        st.write(f"Задач в очереди: **{len(tasks)}**")
        if st.button("☁️ Опубликовать в фоне (без Node)", type="primary", key="yb-publish"):
            results = []
            progress = st.progress(0.0)
            status = st.empty()
            tasks_dir = project_base(project_id) / "tasks"
            done_dir = tasks_dir / "done"
            done_dir.mkdir(parents=True, exist_ok=True)

            for i, task_file in enumerate(tasks):
                data = json.loads((tasks_dir / task_file).read_text(encoding="utf-8"))
                for city_task in data.get("tasks", []):
                    status.text(f"Публикую: {city_task['cityName']}...")
                    result = worker.call(yb.publish_to_city, project_id, city_task["companyUrl"], city_task["postText"])
                    results.append((city_task["cityName"], result))
                (tasks_dir / task_file).rename(done_dir / task_file)
                progress.progress((i + 1) / len(tasks))

            status.empty()
            for city_name, result in results:
                if result.get("ok"):
                    st.success(f"✅ {city_name}: {result.get('status')}")
                else:
                    st.error(f"❌ {city_name}: {result.get('error')}")

    st.divider()
    st.subheader("Актуализация в фоне")

    actualize_tasks = list_actualize_task_files(project_id)
    if not actualize_tasks:
        st.info("Очередь актуализации пуста — сначала сохраните на вкладке «Актуализация».")
    else:
        st.write(f"Задач актуализации в очереди: **{len(actualize_tasks)}**")
        if st.button("☁️ Актуализировать в фоне (без Node)", key="yb-actualize"):
            results = []
            progress = st.progress(0.0)
            status = st.empty()
            tasks_dir = project_base(project_id) / "tasks-actualize"

            for i, task_file in enumerate(actualize_tasks):
                data = json.loads((tasks_dir / task_file).read_text(encoding="utf-8"))
                for city_task in data.get("tasks", []):
                    status.text(f"Проверяю: {city_task['cityName']}...")
                    result = worker.call(yb.actualize_city, project_id, city_task["companyUrl"])
                    results.append((city_task["cityName"], result))
                (tasks_dir / task_file).unlink()
                progress.progress((i + 1) / len(actualize_tasks))

            status.empty()
            for city_name, result in results:
                if result.get("ok"):
                    label = "актуализировано" if result.get("status") == "actualized" else "уже актуально"
                    st.success(f"✅ {city_name}: {label}")
                else:
                    st.error(f"❌ {city_name}: {result.get('error')}")


# ─── ГЛАВНЫЙ ЭКРАН ──────────────────────────────────────────────────
def show_main(project_id: str):
    p = PROJECTS[project_id]
    col1, col2 = st.columns([4, 1])
    with col1:
        st.markdown(f"### {p['icon']} {p['fullName']} ({p['name']})")
    with col2:
        if st.button("Выйти"):
            for key in list(st.session_state.keys()):
                del st.session_state[key]
            st.rerun()

    config = load_config(project_id)

    tab1, tab2, tab3, tab4, tab5 = st.tabs(
        ["Публикация", "Актуализация", "Запуск", "Отчёт", "Настройки"]
    )
    with tab1:
        tab_compose(project_id, config)
    with tab2:
        tab_actualize(project_id, config)
    with tab3:
        tab_run(project_id)
    with tab4:
        tab_reports(project_id)
    with tab5:
        tab_settings(project_id, config)


def main():
    project_id = st.session_state.get("current_project_id")
    if project_id:
        show_main(project_id)
    else:
        show_login()


main()
