#!/usr/bin/env node

/**
 * actualize.js — модуль актуализации данных Яндекс.Бизнес
 *
 * Что делает: для каждого города пробует нажать кнопку «Данные актуальны»
 * (она появляется периодически на странице /p/edit/ карточки). Если кнопки
 * нет — значит актуализация не требуется. После клика ждёт тост
 * «Данные актуализированы» как подтверждение.
 *
 * Использует общую сессию (cookies.json) с publish.js, но НЕ ИМПОРТИРУЕТ
 * никакой код из publish.js — это полностью отдельный модуль чтобы случайно
 * не сломать публикацию.
 *
 * Запуск:
 *   node actualize.js              — читает tasks-actualize/*.json
 *   node actualize.js --file=path  — читает указанный файл
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// ========================================
// ПОЛЬЗОВАТЕЛЬСКАЯ ПАПКА
// ========================================

const USER_BASE = process.env.CLICK_PROJECT_DIR
  ? path.join(__dirname, 'users-data', process.env.CLICK_PROJECT_DIR)
  : __dirname;

if (process.env.CLICK_PROJECT_DIR && !fs.existsSync(USER_BASE)) {
  fs.mkdirSync(USER_BASE, { recursive: true });
}

// ========================================
// КОНСТАНТЫ
// ========================================

const COOKIES_PATH = path.join(USER_BASE, 'session', 'cookies.json');
const USER_DATA_DIR = path.join(USER_BASE, 'session', 'browser-data');
const TASKS_DIR = path.join(USER_BASE, 'tasks-actualize');
const REPORTS_DIR = path.join(USER_BASE, 'reports-actualize');
const LOG_DIR = path.join(USER_BASE, 'logs');
const STOP_FLAG = path.join(USER_BASE, '.STOP_FLAG_ACTUALIZE');

const DEFAULTS = {
  pageLoadTimeout: 30000,
  actionTimeout: 15000,
  delayBetweenCities: 2500,
  buttonWaitTimeout: 4000,  // сколько ждать появления кнопки «Данные актуальны»
  toastWaitTimeout: 6000,   // сколько ждать тоста «Данные актуализированы»
};

// ========================================
// ЛОГИРОВАНИЕ
// ========================================

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
const logFile = path.join(LOG_DIR, `actualize-${new Date().toISOString().slice(0, 10)}.log`);

const log = (level, msg) => {
  const time = new Date().toLocaleTimeString('ru-RU');
  const line = `[${time}] [${level}] ${msg}`;
  console.log(line);
  try { fs.appendFileSync(logFile, line + '\n'); } catch {}
};
const info = (msg) => log('INFO', msg);
const warn = (msg) => log('WARN', msg);
const error = (msg) => log('ERROR', msg);

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ========================================
// ЗАГРУЗКА КОНФИГА
// ========================================

const loadConfigs = (singleFile) => {
  if (singleFile) {
    if (!fs.existsSync(singleFile)) {
      console.error(`❌ Файл не найден: ${singleFile}`);
      process.exit(1);
    }
    return [JSON.parse(fs.readFileSync(singleFile, 'utf-8'))];
  }
  if (!fs.existsSync(TASKS_DIR)) {
    console.error(`❌ Папка ${TASKS_DIR} не существует.`);
    console.error(`   Создайте её и положите туда JSON-файл с задачами актуализации.`);
    process.exit(1);
  }
  const files = fs.readdirSync(TASKS_DIR)
    .filter(f => f.endsWith('.json') && !f.startsWith('.'))
    .map(f => path.join(TASKS_DIR, f))
    .sort();
  if (files.length === 0) {
    console.error(`❌ В ${TASKS_DIR} нет JSON-файлов`);
    process.exit(1);
  }
  return files.map(f => {
    const data = JSON.parse(fs.readFileSync(f, 'utf-8'));
    data._sourceFile = f;
    return data;
  });
};

// ========================================
// БРАУЗЕР
// ========================================

let browser = null;
let page = null;

const initBrowser = async (headless = false) => {
  info('🌐 Запуск браузера...');
  if (!fs.existsSync(path.join(USER_BASE, 'session'))) {
    fs.mkdirSync(path.join(USER_BASE, 'session'), { recursive: true });
  }
  const launchOpts = {
    headless: headless ? 'new' : false,
    userDataDir: USER_DATA_DIR,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1280,900',
    ],
    defaultViewport: { width: 1280, height: 900 },
  };
  try {
    browser = await puppeteer.launch(launchOpts);
  } catch (e) {
    if (/Could not find Chrome|Failed to launch the browser process/i.test(e.message)) {
      console.log('⚠️ Chrome для Puppeteer не найден. Скачиваю автоматически (~170 MB)...');
      console.log('   Это разовая процедура, займёт 1-3 минуты.');
      try {
        const { execSync } = require('child_process');
        execSync('npx puppeteer browsers install chrome', {
          stdio: 'inherit',
          cwd: __dirname,
        });
        browser = await puppeteer.launch(launchOpts);
      } catch (installErr) {
        console.log('❌ Не удалось скачать Chrome: ' + installErr.message);
        throw e;
      }
    } else {
      throw e;
    }
  }
  page = await browser.newPage();
  page.setDefaultTimeout(DEFAULTS.actionTimeout);
  page.setDefaultNavigationTimeout(DEFAULTS.pageLoadTimeout);

  // Загружаем cookies для авторизации
  try {
    if (fs.existsSync(COOKIES_PATH)) {
      const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, 'utf-8'));
      await page.setCookie(...cookies);
      info(`🍪 Куки загружены (${cookies.length} шт.)`);
    }
  } catch (e) {
    warn(`Не удалось загрузить куки: ${e.message}`);
  }
  info('✅ Браузер запущен');
};

const closeBrowser = async () => {
  try { if (browser) await browser.close(); } catch {}
  browser = null; page = null;
};

const saveCookies = async () => {
  try {
    const cookies = await page.cookies();
    fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2));
    info(`🍪 Куки сохранены (${cookies.length} шт.)`);
  } catch (e) {
    warn(`Не удалось сохранить куки: ${e.message}`);
  }
};

// ========================================
// АКТУАЛИЗАЦИЯ ОДНОГО ГОРОДА
// ========================================

/**
 * Преобразует URL карточки в URL раздела «Данные».
 * Из:  https://yandex.ru/sprav/188702920373/p/edit/posts/
 * В:   https://yandex.ru/sprav/188702920373/p/edit/
 *
 * Также поддерживает старый формат (без /p/):
 *   https://yandex.ru/sprav/24038969/edit/posts/  →  /edit/
 */
const buildEditUrl = (companyUrl) => {
  if (!companyUrl) return null;
  // Извлекаем ID
  const m = companyUrl.match(/\/sprav\/(\d+)\/(p\/)?edit/);
  if (!m) return null;
  const id = m[1];
  const hasPSlash = !!m[2];
  return hasPSlash
    ? `https://yandex.ru/sprav/${id}/p/edit/`
    : `https://yandex.ru/sprav/${id}/edit/`;
};

/**
 * Актуализирует данные для одного города.
 * Возвращает: { status, reason, durationMs }
 *   status: 'actualized' (кнопку нажали и тост появился)
 *         | 'not-needed' (кнопки нет — значит данные уже актуальны)
 *         | 'failed' (ошибка)
 */
const actualizeCity = async (task, idx, total) => {
  const startedAt = Date.now();
  const label = `[${idx + 1}/${total}] ${task.cityName}`;
  info(`\n🏙  ${label} — актуализация...`);

  const result = {
    cityName: task.cityName,
    companyUrl: task.companyUrl,
    status: 'failed',
    reason: '',
    durationMs: 0,
  };

  const editUrl = buildEditUrl(task.companyUrl);
  if (!editUrl) {
    result.reason = 'Не удалось определить URL раздела «Данные»';
    error(`  ❌ ${result.reason}`);
    result.durationMs = Date.now() - startedAt;
    return result;
  }

  // 1. Идём на страницу /edit/
  try {
    await page.goto(editUrl, { waitUntil: 'domcontentloaded', timeout: DEFAULTS.pageLoadTimeout });
    await sleep(2500); // даём странице отрендериться (sticky-кнопка появляется не сразу)
  } catch (e) {
    result.reason = 'Не удалось открыть страницу: ' + e.message;
    error(`  ❌ ${result.reason}`);
    result.durationMs = Date.now() - startedAt;
    return result;
  }

  // 2. Ищем кнопку «Данные актуальны» (это sticky-bar внизу страницы)
  // Кнопка появляется не на всех страницах — если её нет, актуализация не нужна.
  let actualizeButton = null;
  const searchStart = Date.now();
  while (Date.now() - searchStart < DEFAULTS.buttonWaitTimeout) {
    actualizeButton = await page.evaluateHandle(() => {
      const btns = document.querySelectorAll('button, [role="button"]');
      for (const b of btns) {
        const text = (b.textContent || '').trim().toLowerCase();
        if (!text || text.length > 50) continue;
        // Точное совпадение «Данные актуальны»
        if (/^данные\s+актуальны$/i.test(text) || /^актуализ[а-я]*\s+данные$/i.test(text)) {
          const r = b.getBoundingClientRect();
          // Видна и кликабельна
          if (r.width >= 80 && r.height >= 20 && !b.disabled) return b;
        }
      }
      return null;
    });
    const isNull = await page.evaluate(h => h === null, actualizeButton);
    if (!isNull) break;
    await sleep(400);
  }

  const buttonNull = await page.evaluate(h => h === null, actualizeButton);
  if (buttonNull) {
    // Кнопки нет — данные уже актуальны (это нормально, не ошибка)
    result.status = 'not-needed';
    result.reason = 'Кнопка «Данные актуальны» не найдена — актуализация не требуется';
    result.durationMs = Date.now() - startedAt;
    info(`  ✓ ${label}: ${result.reason} (${(result.durationMs / 1000).toFixed(1)} сек)`);
    return result;
  }

  // 3. Кнопка есть — кликаем
  try {
    // Скроллим к кнопке на всякий случай
    await actualizeButton.asElement()?.evaluate(b => b.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await sleep(300);
    await actualizeButton.asElement()?.click();
    info(`  🔘 Клик «Данные актуальны»`);
  } catch (e) {
    result.reason = 'Ошибка клика «Данные актуальны»: ' + e.message;
    error(`  ❌ ${result.reason}`);
    result.durationMs = Date.now() - startedAt;
    return result;
  }

  // 4. Ждём тост «Данные актуализированы» (зелёная плашка справа сверху)
  let toastFound = false;
  const toastStart = Date.now();
  while (Date.now() - toastStart < DEFAULTS.toastWaitTimeout) {
    toastFound = await page.evaluate(() => {
      const candidates = document.querySelectorAll(
        '[class*="oast"], [class*="otification"], [class*="otice"], [role="alert"], [role="status"]'
      );
      for (const el of candidates) {
        const text = (el.textContent || '').trim();
        if (!text || text.length < 5 || text.length > 100) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 50 || r.height < 10) continue;
        // Точное «Данные актуализированы» / «Актуализировано» / «Сохранено»
        if (/(данные\s+актуализирован|актуализирован|сохранено|обновлено)/i.test(text)) {
          return true;
        }
      }
      return false;
    });
    if (toastFound) break;
    await sleep(300);
  }

  if (toastFound) {
    result.status = 'actualized';
    result.reason = 'Данные актуализированы (тост подтвердил)';
    result.durationMs = Date.now() - startedAt;
    info(`  ✅ ${label}: ${result.reason} (${(result.durationMs / 1000).toFixed(1)} сек)`);
  } else {
    // Тост не появился — но клик прошёл. Возможно Яндекс просто принял молча.
    result.status = 'actualized';
    result.reason = 'Клик прошёл (тост не появился, но кнопка нажата)';
    result.durationMs = Date.now() - startedAt;
    warn(`  🟡 ${label}: ${result.reason} (${(result.durationMs / 1000).toFixed(1)} сек)`);
  }
  return result;
};

// ========================================
// ГЛАВНАЯ ФУНКЦИЯ
// ========================================

const main = async () => {
  // Парсим аргументы
  const args = process.argv.slice(2);
  let singleFile = null;
  for (const a of args) {
    if (a.startsWith('--file=')) singleFile = a.slice(7);
  }

  const configs = loadConfigs(singleFile);
  const totalCities = configs.reduce((s, c) => s + (c.tasks || []).length, 0);

  info(`✅ Найдено ${configs.length} конфиг-файл(ов)`);
  configs.forEach((c, i) => {
    info(`   ${i + 1}. ${path.basename(c._sourceFile || 'inline')} — ${c.country || '?'} (${(c.tasks || []).length} гор.)`);
  });

  console.log('\n' + '═'.repeat(50));
  console.log('  АКТУАЛИЗАЦИЯ ДАННЫХ ЯНДЕКС.БИЗНЕС');
  console.log('═'.repeat(50));
  console.log(`  Конфигов: ${configs.length}`);
  console.log(`  Городов всего: ${totalCities}`);
  console.log('═'.repeat(50) + '\n');

  const startTime = Date.now();
  const runStartedAt = new Date().toISOString();
  let stoppedByUser = false;
  const allResults = [];
  let totalActualized = 0;
  let totalNotNeeded = 0;
  let totalFail = 0;

  // Очистка флага остановки если остался от предыдущего запуска
  try { if (fs.existsSync(STOP_FLAG)) fs.unlinkSync(STOP_FLAG); } catch {}

  try {
    await initBrowser(false);

    for (let cfgIdx = 0; cfgIdx < configs.length; cfgIdx++) {
      const config = configs[cfgIdx];
      const pkgLabel = config.country || `Пакет ${cfgIdx + 1}`;
      info(`\n📦 Пакет ${cfgIdx + 1}/${configs.length}: ${pkgLabel} — ${(config.tasks || []).length} городов`);

      for (let i = 0; i < (config.tasks || []).length; i++) {
        if (fs.existsSync(STOP_FLAG)) {
          info('⏹  Получен сигнал остановки');
          stoppedByUser = true;
          break;
        }
        const task = config.tasks[i];
        let cityResult;
        try {
          cityResult = await actualizeCity(task, i, config.tasks.length);
        } catch (err) {
          cityResult = {
            cityName: task.cityName,
            companyUrl: task.companyUrl,
            status: 'failed',
            reason: 'Критическая ошибка: ' + err.message,
            durationMs: 0,
          };
          error(`  ❌ ${task.cityName}: ${cityResult.reason}`);
        }
        cityResult.country = config.country;
        cityResult.package = pkgLabel;
        allResults.push(cityResult);

        if (cityResult.status === 'actualized') totalActualized++;
        else if (cityResult.status === 'not-needed') totalNotNeeded++;
        else totalFail++;

        // Пауза между городами
        if (i < config.tasks.length - 1) {
          await sleep(DEFAULTS.delayBetweenCities);
        }
      }

      if (stoppedByUser) break;
      if (cfgIdx < configs.length - 1) {
        info('\n⏸  Пауза между странами — 2 сек...');
        await sleep(2000);
      }
    }

    // Сохраняем cookies
    await saveCookies();

  } catch (err) {
    error(`Критическая ошибка: ${err.message}`);
  } finally {
    try { fs.unlinkSync(STOP_FLAG); } catch {}
    await closeBrowser();
  }

  // Архивируем обработанные JSON
  try {
    const doneDir = path.join(TASKS_DIR, 'done');
    if (!fs.existsSync(doneDir)) fs.mkdirSync(doneDir, { recursive: true });
    configs.forEach(c => {
      if (c._sourceFile) {
        try { fs.renameSync(c._sourceFile, path.join(doneDir, path.basename(c._sourceFile))); } catch {}
      }
    });
  } catch {}

  // Пишем JSON-отчёт
  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const duration = ((Date.now() - startTime) / 1000).toFixed(0);
  const reportName = `actualize-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`;

  const cleanResults = allResults.map(r => ({ ...r }));
  const report = {
    type: 'actualize',
    startedAt: runStartedAt,
    finishedAt: new Date().toISOString(),
    durationSec: Number(duration),
    stoppedByUser,
    totals: {
      total: allResults.length,
      actualized: totalActualized,
      notNeeded: totalNotNeeded,
      failed: totalFail,
    },
    results: cleanResults,
  };
  try { fs.writeFileSync(path.join(REPORTS_DIR, reportName), JSON.stringify(report, null, 2), 'utf-8'); } catch {}

  console.log('\n' + '═'.repeat(50));
  console.log('  ИТОГИ АКТУАЛИЗАЦИИ');
  console.log('═'.repeat(50));
  console.log(`  ✅ Актуализировано:     ${totalActualized}`);
  console.log(`  ⊝  Не требовалось:     ${totalNotNeeded}`);
  console.log(`  ❌ Ошибок:             ${totalFail}`);
  console.log(`  ⏱️  Время:              ${duration} сек`);
  console.log(`  📄 Отчёт:              ${reportName}`);
  console.log('═'.repeat(50) + '\n');

  process.exit(totalFail > 0 ? 1 : 0);
};

main();
