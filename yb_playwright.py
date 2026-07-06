"""
yb_playwright.py — вход и публикация в Яндекс.Бизнес через Playwright (headless).

Это ОТДЕЛЬНЫЙ от publish.js способ публикации — для облака (Streamlit Cloud), где нет
Node.js и настоящего браузера с окном. publish.js НЕ удалён и продолжает работать как
раньше при локальном запуске — это просто дополнительный путь.

Селекторы входа записаны через playwright codegen на реальных проходах логина
(ИМП и СМУ) — см. OTHER_METHOD_BUTTON и соседние константы ниже. Селекторы
публикации (publish_to_city/actualize_city) — перенос логики из publish.js/actualize.js.

Идея та же, что и в crosspost/*_playwright.py: браузер работает headless, для входа
вместо реального окна показываем скриншот в Streamlit и собираем логин/пароль/код
обычными полями. После входа сессия (cookies) сохраняется — дальше публикация идёт
полностью в фоне, без скриншотов и без участия человека.
"""

from __future__ import annotations

import asyncio
import json
import re
import subprocess
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright, Browser, BrowserContext, Page

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

PASSPORT_URL = "https://passport.yandex.ru/auth/welcome?origin=passport_auth2&retpath=https%3A%2F%2Fpassport.yandex.ru%2Fprofile"

# На Streamlit Cloud (и вообще в свежем окружении) браузер для Playwright заранее
# не установлен — там нет шага "postinstall", который есть локально (npm install
# и т.п. просто ставит зависимости из requirements.txt, а сам браузер нужно
# скачать отдельно). Проверяем при первом запуске и ставим, если его нет.
#
# Используем Firefox, а не Chromium: на бесплатном тарифе Streamlit Cloud (~1ГБ
# RAM) headless Chromium стабильно падал (TargetClosedError) именно при рендере
# тяжёлой SPA-страницы Яндекс.Паспорта, хотя about:blank открывался нормально —
# похоже на нехватку памяти. У Firefox headless заметно ниже требования к памяти.
_browser_checked = False


def _launch_browser(p, headless: bool = True):
    return p.firefox.launch(headless=headless)


def _ensure_browser_installed():
    global _browser_checked
    if _browser_checked:
        return
    try:
        with sync_playwright() as p:
            browser = _launch_browser(p)
            browser.close()
    except Exception:
        subprocess.run([sys.executable, "-m", "playwright", "install", "firefox"], check=False)
    _browser_checked = True

# Записаны через playwright codegen — реальный проход входа Яндекс.ID
# (звенья: телефон-экран → «Другой способ входа» → «Войти по логину» →
# логин → пароль → 2 экрана-заглушки, которые пропускаем кнопкой Skip).
OTHER_METHOD_BUTTON = '[data-testid="split-add-user-more-button"]'
SWITCH_TO_LOGIN_OPTION = '[data-testid="menu-option-switchToLogin"]'
GENERIC_TEXT_FIELD = '[data-testid="text-field-input"]'
LOGIN_NEXT_BUTTON = '[data-testid="split-add-user-next-login"]'
PASSWORD_NEXT_BUTTON = '[data-testid="password-next"]'
EMAIL_CODE_NEXT_BUTTON = '[data-testid="challenges-email-code-next"]'
POST_LOGIN_SKIP_BUTTONS = [
    '[data-testid="webauthn-reg-later-button"]',
    '[data-testid="identification-promo-start-skip-btn"]',
]


def session_path(project_id: str) -> Path:
    d = Path(__file__).parent / "users-data" / project_id / "session"
    d.mkdir(parents=True, exist_ok=True)
    return d / "yb_storage_state.json"


def _click_exact_button(page: Page, texts: list[str]) -> bool:
    """Из publish.js: ищем кнопку с ТОЧНЫМ текстом (не подстрокой) и кликаем по центру."""
    coords = page.evaluate(
        """(texts) => {
            const buttons = document.querySelectorAll('button, [role="button"]');
            for (const btn of buttons) {
                const t = btn.textContent.trim().toLowerCase();
                if (texts.includes(t)) {
                    const r = btn.getBoundingClientRect();
                    if (r.width > 30 && r.height > 15) return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
                }
            }
            return null;
        }""",
        texts,
    )
    if coords:
        page.mouse.click(coords["x"], coords["y"])
        return True
    return False


class YbLoginFlow:
    def __init__(self, project_id: str):
        self.project_id = project_id
        self._playwright = None
        self.browser: Browser | None = None
        self.context: BrowserContext | None = None
        self.page: Page | None = None

    def start(self) -> bytes:
        _ensure_browser_installed()
        try:
            self._playwright = sync_playwright().start()
            self.browser = _launch_browser(self._playwright)
            self.context = self.browser.new_context(viewport={"width": 1000, "height": 700})
            # about:blank прошёл нормально, а реальная страница валила браузер —
            # похоже на нехватку памяти при рендеринге тяжёлой SPA. Режем самое
            # тяжёлое (картинки/шрифты/видео), но НЕ css — иначе скриншот для
            # ручного шага (код/капча) станет нечитаемым.
            self.context.route(
                re.compile(r".*\.(png|jpe?g|gif|webp|svg|woff2?|ttf|mp4|webm)(\?.*)?$", re.IGNORECASE),
                lambda route: route.abort(),
            )
            self.page = self.context.new_page()
            # Диагностика: сначала лёгкая about:blank, чтобы понять, падает ли
            # Chromium сам по себе (нехватка ресурсов) или именно на тяжёлой
            # странице Яндекса. Если и это не проходит — дело в контейнере.
            try:
                self.page.goto("about:blank", timeout=10000)
            except Exception as e:
                raise RuntimeError(f"Chromium не пережил даже about:blank (ресурсы контейнера): {e}") from e
            self.page.goto(PASSPORT_URL, wait_until="domcontentloaded")
            self.page.wait_for_timeout(1500)
            # Яндекс по умолчанию открывает форму под телефон — переключаемся
            # на вход по логину/паролю (записано через playwright codegen).
            self._switch_to_login_by_password()
            return self.page.screenshot(full_page=True)
        except Exception:
            # Если что-то упало на середине (например, браузер убило по памяти),
            # обязательно останавливаем playwright — иначе следующий вызов start()
            # в этом же фоновом потоке падает с "Sync API inside asyncio loop",
            # потому что предыдущий (незакрытый) экземпляр уже владеет циклом событий.
            self.close()
            raise

    def _switch_to_login_by_password(self):
        if self.page.locator(OTHER_METHOD_BUTTON).count() > 0:
            self.page.click(OTHER_METHOD_BUTTON)
            self.page.wait_for_timeout(600)
        if self.page.locator(SWITCH_TO_LOGIN_OPTION).count() > 0:
            self.page.click(SWITCH_TO_LOGIN_OPTION)
            self.page.wait_for_timeout(800)

    def _skip_post_login_prompts(self):
        """
        После пароля Яндекс может показать 1-2 экрана-заглушки (предложение
        завести passkey, промо identification) — у обоих есть кнопка Skip.
        """
        for sel in POST_LOGIN_SKIP_BUTTONS:
            if self.page.locator(sel).count() > 0:
                self.page.click(sel)
                self.page.wait_for_timeout(800)

    def submit_phone(self, phone: str) -> bytes:
        """
        Резервный путь, если вдруг открылся именно телефонный экран и
        переключиться на логин не удалось. ВАЖНО: вводим через клавиатуру
        (page.keyboard.type), а не .fill() — иначе ломается маска номера/страна.
        """
        digits = "".join(ch for ch in phone if ch.isdigit())
        if digits.startswith("7") or digits.startswith("8"):
            digits = digits[1:]
        self.page.click('input[type="tel"]')
        self.page.keyboard.type(digits, delay=40)
        self.page.wait_for_timeout(500)
        if not _click_exact_button(self.page, ["log in", "войти"]):
            self.page.keyboard.press("Enter")
        self.page.wait_for_timeout(2500)
        return self.page.screenshot(full_page=True)

    def submit_login(self, login_value: str) -> bytes:
        field = self.page.locator(GENERIC_TEXT_FIELD).first
        field.click()
        field.fill(login_value)
        if self.page.locator(LOGIN_NEXT_BUTTON).count() > 0:
            self.page.click(LOGIN_NEXT_BUTTON)
        else:
            self.page.keyboard.press("Enter")
        self.page.wait_for_timeout(2500)
        return self.page.screenshot(full_page=True)

    def submit_password(self, password: str) -> bytes:
        field = self.page.locator(GENERIC_TEXT_FIELD).first
        field.click()
        field.fill(password)
        if self.page.locator(PASSWORD_NEXT_BUTTON).count() > 0:
            self.page.click(PASSWORD_NEXT_BUTTON)
        else:
            self.page.keyboard.press("Enter")
        self.page.wait_for_timeout(2500)
        self._skip_post_login_prompts()
        return self.page.screenshot(full_page=True)

    def submit_code(self, code: str) -> bytes:
        """
        Код подтверждения, который Яндекс присылает на почту (записано через
        playwright codegen на реальном СМУ-аккаунте) — то же общее поле, что
        и у логина/пароля, плюс отдельная кнопка подтверждения.
        """
        field = self.page.locator(GENERIC_TEXT_FIELD).first
        field.click()
        field.fill(code)
        if self.page.locator(EMAIL_CODE_NEXT_BUTTON).count() > 0:
            self.page.click(EMAIL_CODE_NEXT_BUTTON)
        else:
            self.page.keyboard.press("Enter")
        self.page.wait_for_timeout(2500)
        self._skip_post_login_prompts()
        return self.page.screenshot(full_page=True)

    def is_logged_in(self) -> bool:
        self.page.goto("https://passport.yandex.ru/profile", wait_until="domcontentloaded")
        self.page.wait_for_timeout(1000)
        url = self.page.url
        return "passport" not in url or "profile" in url

    def save_session(self) -> Path:
        path = session_path(self.project_id)
        self.context.storage_state(path=str(path))
        return path

    def close(self):
        try:
            if self.browser:
                self.browser.close()
        finally:
            if self._playwright:
                self._playwright.stop()


def has_saved_session(project_id: str) -> bool:
    path = session_path(project_id)
    if not path.exists():
        return False
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return bool(data.get("cookies"))
    except (json.JSONDecodeError, OSError):
        return False


def publish_to_city(project_id: str, city_url: str, text: str) -> dict:
    """
    Публикует пост на карточке города, используя сохранённую сессию. Полностью
    headless, без скриншотов и без участия человека — как и просили: "либо скриншот
    для входа, либо фоново просто публикует".

    Логика (кнопка «Добавить пост» → поле текста → кнопка «Создать») перенесена
    из publish.js — тех же самых, уже проверенных вживую, селекторов/паттернов.
    """
    path = session_path(project_id)
    if not path.exists():
        return {"ok": False, "error": "Нет сохранённой сессии Яндекса — сначала войдите на вкладке «Облако»"}

    _ensure_browser_installed()
    with sync_playwright() as p:
        browser = _launch_browser(p)
        context = browser.new_context(storage_state=str(path), viewport={"width": 1280, "height": 900})
        page = context.new_page()
        try:
            page.goto(city_url, wait_until="domcontentloaded", timeout=30000)
            page.wait_for_timeout(2000)

            # Кнопка "Добавить пост" — как в publish.js, несколько вариантов текста.
            if not _click_exact_button(page, ["добавить", "создать", "опубликовать", "добавить пост", "создать пост"]):
                return {"ok": False, "error": "Кнопка «Добавить пост» не найдена"}
            page.wait_for_timeout(1000)

            # Поле текста — тот же селектор, что в publish.js.
            text_field = page.locator('[contenteditable="true"], textarea[name*="text"], textarea[placeholder*="екст"], textarea').first
            text_field.click()
            page.keyboard.press("Control+A")
            page.keyboard.press("Backspace")
            text_field.type(text, delay=0)
            page.wait_for_timeout(1000)

            # Кнопка "Создать"/"Опубликовать" — точное совпадение, как в publish.js.
            if not _click_exact_button(page, ["создать", "опубликовать", "отправить"]):
                return {"ok": False, "error": "Кнопка «Создать»/«Опубликовать» не найдена"}
            page.wait_for_timeout(2500)

            context.storage_state(path=str(path))
            return {"ok": True, "status": "Опубликовано"}
        except Exception as e:  # noqa: BLE001
            return {"ok": False, "error": str(e)}
        finally:
            browser.close()


def _build_edit_url(company_url: str) -> str | None:
    """Из actualize.js: приводим URL карточки к разделу /edit/ (с учётом /p/ или без)."""
    m = re.search(r"/sprav/(\d+)/(p/)?edit", company_url or "")
    if not m:
        return None
    company_id, has_p = m.group(1), m.group(2)
    return f"https://yandex.ru/sprav/{company_id}/p/edit/" if has_p else f"https://yandex.ru/sprav/{company_id}/edit/"


def actualize_city(project_id: str, company_url: str) -> dict:
    """
    Актуализирует данные одного города (жмёт «Данные актуальны», если кнопка
    появилась) — перенесено из actualize.js, та же логика поиска кнопки/тоста.
    Полностью headless, использует сохранённую сессию Яндекса.
    """
    path = session_path(project_id)
    if not path.exists():
        return {"ok": False, "error": "Нет сохранённой сессии Яндекса — сначала войдите на вкладке «Облако»"}

    edit_url = _build_edit_url(company_url)
    if not edit_url:
        return {"ok": False, "error": "Не удалось определить URL раздела «Данные»"}

    _ensure_browser_installed()
    with sync_playwright() as p:
        browser = _launch_browser(p)
        context = browser.new_context(storage_state=str(path), viewport={"width": 1280, "height": 900})
        page = context.new_page()
        try:
            page.goto(edit_url, wait_until="domcontentloaded", timeout=30000)
            page.wait_for_timeout(2500)

            # Кнопка "Данные актуальны" — точный текст, как в actualize.js.
            coords = page.evaluate(
                r"""() => {
                    const btns = document.querySelectorAll('button, [role="button"]');
                    for (const b of btns) {
                        const t = (b.textContent || '').trim().toLowerCase();
                        if (!t || t.length > 50) continue;
                        if (/^данные\s+актуальны$/i.test(t) || /^актуализ[а-я]*\s+данные$/i.test(t)) {
                            const r = b.getBoundingClientRect();
                            if (r.width >= 80 && r.height >= 20 && !b.disabled) {
                                return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
                            }
                        }
                    }
                    return null;
                }"""
            )
            if not coords:
                # Кнопки нет — данные уже актуальны, это нормальный исход, не ошибка.
                return {"ok": True, "status": "not-needed"}

            page.mouse.click(coords["x"], coords["y"])
            page.wait_for_timeout(2000)
            return {"ok": True, "status": "actualized"}
        except Exception as e:  # noqa: BLE001
            return {"ok": False, "error": str(e)}
        finally:
            browser.close()
