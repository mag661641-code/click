"""
yb_playwright.py — вход и публикация в Яндекс.Бизнес через Playwright (headless).

Это ОТДЕЛЬНЫЙ от publish.js способ публикации — для облака (Streamlit Cloud), где нет
Node.js и настоящего браузера с окном. publish.js НЕ удалён и продолжает работать как
раньше при локальном запуске — это просто дополнительный путь.

Селекторы для входа и публикации взяты из publish.js (проверены вживую на реальных
бизнес-аккаунтах — см. LOGIN_SELECTORS/PASSWORD_SELECTORS и комментарии ниже, это
прямой перенос той же логики, просто на Playwright вместо Puppeteer).

Идея та же, что и в crosspost/*_playwright.py: браузер работает headless, для входа
вместо реального окна показываем скриншот в Streamlit и собираем логин/пароль/код
обычными полями. После входа сессия (cookies) сохраняется — дальше публикация идёт
полностью в фоне, без скриншотов и без участия человека.
"""

from __future__ import annotations

import asyncio
import json
import subprocess
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright, Browser, BrowserContext, Page

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

PASSPORT_URL = "https://passport.yandex.ru/auth/welcome?origin=passport_auth2&retpath=https%3A%2F%2Fpassport.yandex.ru%2Fprofile"

# На Streamlit Cloud (и вообще в свежем окружении) браузер Chromium для Playwright
# заранее не установлен — там нет шага "postinstall", который есть локально
# (npm install и т.п. просто ставит зависимости из requirements.txt, а сам браузер
# нужно скачать отдельно). Проверяем при первом запуске и ставим, если его нет.
_chromium_checked = False


def _ensure_chromium_installed():
    global _chromium_checked
    if _chromium_checked:
        return
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=[
        "--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu",
        "--disable-extensions", "--disable-background-networking",
        "--disable-default-apps", "--disable-sync", "--no-first-run",
        "--mute-audio", "--disable-backgrounding-occluded-windows",
        "--single-process", "--no-zygote",
    ])
            browser.close()
    except Exception:
        subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"], check=False)
    _chromium_checked = True

# Те же селекторы, что в publish.js (строки ~700 и ~775) — проверены вживую.
LOGIN_SELECTORS = [
    'input[name="login"]', 'input[data-t="field:input-login"]',
    '#passp-field-login', 'input[type="email"]',
    'input[autocomplete="username"]',
]
PASSWORD_SELECTORS = [
    'input[name="passwd"]', 'input[data-t="field:input-passwd"]',
    '#passp-field-passwd', 'input[type="password"]',
    'input[autocomplete="current-password"]',
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
        _ensure_chromium_installed()
        try:
            self._playwright = sync_playwright().start()
            self.browser = self._playwright.chromium.launch(headless=True, args=[
                "--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu",
                "--disable-extensions", "--disable-background-networking",
                "--disable-default-apps", "--disable-sync", "--no-first-run",
                "--mute-audio", "--disable-backgrounding-occluded-windows",
                "--single-process", "--no-zygote",
            ])
            self.context = self.browser.new_context(viewport={"width": 1280, "height": 900})
            self.page = self.context.new_page()
            self.page.goto(PASSPORT_URL, wait_until="domcontentloaded")
            self.page.wait_for_timeout(1500)
            return self.page.screenshot(full_page=True)
        except Exception:
            # Если что-то упало на середине (например, браузер убило по памяти),
            # обязательно останавливаем playwright — иначе следующий вызов start()
            # в этом же фоновом потоке падает с "Sync API inside asyncio loop",
            # потому что предыдущий (незакрытый) экземпляр уже владеет циклом событий.
            self.close()
            raise

    def submit_phone(self, phone: str) -> bytes:
        """
        Консьюмерский UI Yandex ID (телефон) — встречается на свежей, ранее не
        использовавшейся сессии. ВАЖНО: вводим через клавиатуру (page.keyboard.type),
        а не .fill() — иначе ломается маска номера/страна (та же проблема была
        у Дзена в crosspost, см. память по кросспостингу).
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
        for sel in LOGIN_SELECTORS:
            if self.page.locator(sel).count() > 0:
                self.page.click(sel, click_count=3)
                self.page.keyboard.press("Backspace")
                self.page.type(sel, login_value, delay=60)
                break
        if not _click_exact_button(self.page, ["войти"]):
            self.page.keyboard.press("Enter")
        self.page.wait_for_timeout(3000)
        return self.page.screenshot(full_page=True)

    def submit_password(self, password: str) -> bytes:
        for sel in PASSWORD_SELECTORS:
            if self.page.locator(sel).count() > 0:
                self.page.click(sel, click_count=3)
                self.page.type(sel, password, delay=60)
                break
        if not _click_exact_button(self.page, ["войти"]):
            self.page.keyboard.press("Enter")
        self.page.wait_for_timeout(3000)
        return self.page.screenshot(full_page=True)

    def submit_code(self, code: str) -> bytes:
        """Код подтверждения (SMS/приложение) — если Яндекс его запросит."""
        single_field_candidates = ['input[inputmode="numeric"]', 'input[type="tel"]', 'input[name="code"]']
        for sel in single_field_candidates:
            if self.page.locator(sel).count() == 1:
                self.page.fill(sel, code)
                self.page.wait_for_timeout(2500)
                return self.page.screenshot(full_page=True)
        digit_boxes = self.page.locator('input[maxlength="1"]')
        if digit_boxes.count() >= len(code):
            for i, digit in enumerate(code):
                digit_boxes.nth(i).fill(digit)
            self.page.wait_for_timeout(2500)
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

    _ensure_chromium_installed()
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=[
        "--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu",
        "--disable-extensions", "--disable-background-networking",
        "--disable-default-apps", "--disable-sync", "--no-first-run",
        "--mute-audio", "--disable-backgrounding-occluded-windows",
        "--single-process", "--no-zygote",
    ])
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


import re


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

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=[
        "--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu",
        "--disable-extensions", "--disable-background-networking",
        "--disable-default-apps", "--disable-sync", "--no-first-run",
        "--mute-audio", "--disable-backgrounding-occluded-windows",
        "--single-process", "--no-zygote",
    ])
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
