#!/usr/bin/env node

/**
 * ========================================
 * ЯНДЕКС.БИЗНЕС АВТОПОСТЕР v2
 * ========================================
 * 
 * Читает задания из tasks.json (сгенерированного в веб-приложении)
 * и публикует посты в выбранные города.
 * 
 * Использование:
 *   node publish.js                    — читает tasks.json
 *   node publish.js my-tasks.json      — читает указанный файл
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ========================================
// НАСТРОЙКИ ПО УМОЛЧАНИЮ
// ========================================

const DEFAULTS = {
  delayBetweenPosts: 3000,
  delayBetweenCities: 5000,
  headlessMode: false,
  actionTimeout: 15000,
  navigationTimeout: 45000,
  maxRetries: 2,
};

// ========================================
// ПОЛЬЗОВАТЕЛЬСКАЯ ПАПКА
// Если задан CLICK_PROJECT_DIR — работаем в users-data/{dir}/,
// иначе в корне (для совместимости со старыми запусками)
// ========================================

const USER_BASE = process.env.CLICK_PROJECT_DIR
  ? path.join(__dirname, 'users-data', process.env.CLICK_PROJECT_DIR)
  : __dirname;

if (process.env.CLICK_PROJECT_DIR && !fs.existsSync(USER_BASE)) {
  fs.mkdirSync(USER_BASE, { recursive: true });
}

// ========================================
// ЛОГИРОВАНИЕ (простое, в консоль + файл)
// ========================================

const LOG_DIR = path.join(USER_BASE, 'logs');
const logFile = path.join(LOG_DIR, `publish-${new Date().toISOString().slice(0, 10)}.log`);

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const log = (level, msg, data) => {
  const time = new Date().toLocaleTimeString('ru-RU');
  const line = `[${time}] [${level}] ${msg}${data ? ' ' + JSON.stringify(data) : ''}`;
  console.log(line);
  fs.appendFileSync(logFile, line + '\n');
};

const info = (msg, data) => log('INFO', msg, data);
const warn = (msg, data) => log('WARN', msg, data);
const error = (msg, data) => log('ERROR', msg, data);

// ========================================
// УТИЛИТЫ
// ========================================

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const isValidUrl = (str) => {
  try { new URL(str); return true; } catch { return false; }
};

/**
 * Превратить ссылку на страницу-галерею в прямую ссылку на изображение
 * Поддерживает: ibb.co, imgur.com, imgbb.com, Яндекс.Диск (публичные)
 */
const resolveImageUrl = async (url) => {
  // Если это уже прямая ссылка на картинку — возвращаем как есть
  if (/\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i.test(url)) {
    return url;
  }

  // ImgBB: https://ibb.co/XXXXXX → достаём og:image
  if (/ibb\.co\//i.test(url)) {
    info(`  🔍 Страница ImgBB, ищу прямую ссылку...`);
    const html = await fetchText(url);
    // Ищем og:image в <meta>
    const match = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
                  html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
    if (match) {
      info(`  ✅ Найдена прямая ссылка: ${match[1]}`);
      return match[1];
    }
    throw new Error('Не удалось найти прямую ссылку на странице ImgBB');
  }

  // Imgur: https://imgur.com/XXXXX → прямая ссылка i.imgur.com/XXXXX.jpg
  if (/imgur\.com\//i.test(url) && !/i\.imgur\.com/i.test(url)) {
    const id = url.match(/imgur\.com\/([a-zA-Z0-9]+)/)?.[1];
    if (id) {
      const direct = `https://i.imgur.com/${id}.jpg`;
      info(`  ✅ Imgur: ${direct}`);
      return direct;
    }
  }

  // Яндекс.Диск: https://disk.yandex.ru/i/XXX → через API достаём download-ссылку
  if (/disk\.yandex\.[a-z]+/i.test(url)) {
    info(`  🔍 Яндекс.Диск, получаю download-ссылку...`);
    const apiUrl = `https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=${encodeURIComponent(url)}`;
    const resp = await fetchText(apiUrl);
    const parsed = JSON.parse(resp);
    if (parsed.href) {
      info(`  ✅ Яндекс.Диск: получен download-URL`);
      return parsed.href;
    }
    throw new Error('Не удалось получить download-ссылку Яндекс.Диска');
  }

  // Google Drive: https://drive.google.com/file/d/XXX/view → прямая ссылка
  if (/drive\.google\.com/i.test(url)) {
    const id = url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1] || 
               url.match(/id=([a-zA-Z0-9_-]+)/)?.[1];
    if (id) {
      const direct = `https://drive.google.com/uc?export=download&id=${id}`;
      info(`  ✅ Google Drive: ${direct}`);
      return direct;
    }
  }

  // Для остальных URL — пробуем как есть (вдруг редирект на картинку)
  return url;
};

/**
 * Загрузить HTML/текст страницы
 */
const fetchText = (url, redirects = 0) => {
  return new Promise((resolve, reject) => {
    if (redirects > 5) { reject(new Error('Слишком много редиректов')); return; }
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    }, (response) => {
      // Редиректы
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        const nextUrl = response.headers.location.startsWith('http') 
          ? response.headers.location 
          : new URL(response.headers.location, url).href;
        fetchText(nextUrl, redirects + 1).then(resolve).catch(reject);
        return;
      }
      let data = '';
      response.setEncoding('utf-8');
      response.on('data', chunk => { data += chunk; });
      response.on('end', () => resolve(data));
      response.on('error', reject);
    }).on('error', reject);
  });
};

/**
 * Скачать картинку по URL (сначала превращает в прямую ссылку если надо)
 * Делает до 3 попыток с паузами — на случай моргнувшей сети / ImgBB.
 */
const downloadImage = async (url) => {
  // Превращаем ссылку на галерею в прямую ссылку
  const directUrl = await resolveImageUrl(url);

  // ────────────────────────────────────────────────────────
  // RETRY: до 5 попыток скачать. Между попытками — нарастающая пауза.
  // Это спасает от типичных сетевых сбоев:
  //   - "Client network socket disconnected" (TLS обрыв)
  //   - "ETIMEDOUT", "ECONNRESET", "EAI_AGAIN" (DNS / TCP)
  //   - короткие провалы ImgBB / провайдера
  // 5 попыток вместо 3 — некоторые пользователи получают серию из 3-5 обрывов подряд
  // из-за антивируса / нестабильного TLS-соединения.
  // ────────────────────────────────────────────────────────
  const MAX_ATTEMPTS = 5;
  const PAUSES_MS = [0, 2000, 5000, 10000, 20000];  // прогрессивно увеличиваем
  let lastErr = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (PAUSES_MS[attempt] > 0) {
      await sleep(PAUSES_MS[attempt]);
    }
    try {
      return await downloadImageDirect(directUrl);
    } catch (e) {
      lastErr = e;
      const msg = e && e.message ? e.message : String(e);
      if (attempt < MAX_ATTEMPTS - 1) {
        // Тихо логируем неудачу, продолжаем
        try { console.log(`  ↻ Попытка ${attempt + 1}/${MAX_ATTEMPTS} скачать картинку не удалась: ${msg}. Повторяю...`); } catch {}
      }
    }
  }
  // Все попытки исчерпаны — бросаем понятную ошибку
  const reason = lastErr && lastErr.message ? lastErr.message : 'неизвестная сетевая ошибка';
  const isNet = /socket disconnected|TLS|ETIMEDOUT|ECONNRESET|EAI_AGAIN|getaddrinfo|ENOTFOUND/i.test(reason);
  // Понятное человеческое сообщение для отчёта
  const niceMsg = isNet
    ? `Сеть на этом компе нестабильна — не удалось скачать картинку за ${MAX_ATTEMPTS} попыток. Проверьте интернет, антивирус/файрвол или попробуйте через несколько минут (возможно ImgBB временно перегружен).`
    : `Не удалось скачать картинку: ${reason}`;
  throw new Error(niceMsg);
};

/**
 * Скачать файл по прямой ссылке. Один запрос, с таймаутом 20 сек.
 * Если упало — кидаем исключение, retry делается уровнем выше в downloadImage.
 */
const downloadImageDirect = (url, redirects = 0) => {
  return new Promise((resolve, reject) => {
    if (redirects > 5) { reject(new Error('Слишком много редиректов')); return; }

    const tempDir = path.join(USER_BASE, 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    let ext = '.jpg';
    try { ext = path.extname(new URL(url).pathname) || '.jpg'; } catch {}
    // Обрезаем query-параметры у расширения
    ext = ext.split('?')[0];
    if (ext.length > 5) ext = '.jpg';

    const filepath = path.join(tempDir, `img-${Date.now()}${ext}`);
    const protocol = url.startsWith('https') ? https : http;

    const req = protocol.get(url, {
      // Таймаут на установку соединения — 30 сек. Раньше было 20, но на медленных
      // или нестабильных соединениях TLS handshake мог не успевать.
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    }, (response) => {
      // Редиректы
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        const nextUrl = response.headers.location.startsWith('http') 
          ? response.headers.location 
          : new URL(response.headers.location, url).href;
        downloadImageDirect(nextUrl, redirects + 1).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      const file = fs.createWriteStream(filepath);
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(filepath); });
      file.on('error', (err) => { try { fs.unlinkSync(filepath); } catch {} reject(err); });
    });

    req.on('timeout', () => {
      req.destroy(new Error(`Таймаут соединения (30 сек) — сервер не отвечает`));
    });
    req.on('error', reject);
  });
};

/**
 * Очистить временные файлы
 */
const cleanupTemp = () => {
  const tempDir = path.join(USER_BASE, 'temp');
  if (fs.existsSync(tempDir)) {
    fs.readdirSync(tempDir).forEach(f => fs.unlinkSync(path.join(tempDir, f)));
    fs.rmdirSync(tempDir);
  }
};

// ========================================
// ЗАГРУЗКА КОНФИГУРАЦИИ
// ========================================

const loadConfig = () => {
  // Определяем что передали: конкретный файл, папку, или ничего
  const arg = process.argv.find(a => !a.startsWith('-') && (a.endsWith('.json') || a === 'tasks' || a === 'tasks/'));
  // ВАЖНО: tasks ищем в папке ПРОЕКТА (USER_BASE), а не в корне скрипта.
  // Если задан CLICK_PROJECT_DIR=MPE → USER_BASE = users-data/MPE/, и tasks/ = users-data/MPE/tasks/
  const tasksFolder = path.join(USER_BASE, 'tasks');
  const singleFile = arg && arg.endsWith('.json') ? path.resolve(arg) : path.join(USER_BASE, 'tasks.json');

  let configFiles = [];

  // 1. Приоритет: если явно указан файл
  if (arg && arg.endsWith('.json')) {
    if (!fs.existsSync(singleFile)) {
      console.error(`\n❌ Файл не найден: ${singleFile}\n`);
      process.exit(1);
    }
    configFiles = [singleFile];
  }
  // 2. Если есть папка tasks/ с JSON-файлами — обрабатываем все
  else if (fs.existsSync(tasksFolder) && fs.statSync(tasksFolder).isDirectory()) {
    const jsonFiles = fs.readdirSync(tasksFolder)
      .filter(f => f.endsWith('.json'))
      .sort()  // Сортируем по имени — 01-Россия.json, 02-Казахстан.json...
      .map(f => path.join(tasksFolder, f));
    
    if (jsonFiles.length === 0) {
      console.error(`\n❌ В папке tasks/ нет JSON-файлов\n`);
      showHowToUse();
      process.exit(1);
    }
    configFiles = jsonFiles;
  }
  // 3. Фоллбэк: tasks.json в корне
  else if (fs.existsSync(singleFile)) {
    configFiles = [singleFile];
  }
  else {
    console.error(`\n❌ Не найдено ни tasks.json, ни папки tasks/ с файлами\n`);
    showHowToUse();
    process.exit(1);
  }

  // Парсим все найденные файлы
  const configs = [];
  for (const filepath of configFiles) {
    try {
      const raw = fs.readFileSync(filepath, 'utf-8');
      const config = JSON.parse(raw);

      if (!config.credentials?.email || !config.credentials?.password) {
        warn(`⚠️  ${path.basename(filepath)}: нет учётных данных — пропускаю`);
        continue;
      }
      if (!config.tasks || config.tasks.length === 0) {
        warn(`⚠️  ${path.basename(filepath)}: нет заданий — пропускаю`);
        continue;
      }

      config._sourceFile = filepath;
      configs.push(config);
    } catch (err) {
      warn(`⚠️  Ошибка чтения ${path.basename(filepath)}: ${err.message}`);
    }
  }

  if (configs.length === 0) {
    console.error('❌ Нет валидных конфигов для обработки');
    process.exit(1);
  }

  info(`✅ Найдено ${configs.length} конфиг-файл(ов):`);
  configs.forEach((c, i) => {
    info(`   ${i + 1}. ${path.basename(c._sourceFile)} — ${c.country || c.projectName || '—'} (${c.tasks.length} гор.)`);
  });

  return configs;
};

const showHowToUse = () => {
  console.error(`📝 Как использовать:`);
  console.error(`   1. Откройте yandex-poster.html в браузере`);
  console.error(`   2. Создайте пост, выберите города, добавьте в очередь`);
  console.error(`   3. Нажмите "Скачать все JSON" — скачаются файлы`);
  console.error(`   4. Положите их в папку tasks/ рядом с publish.js`);
  console.error(`   5. Запустите: node publish.js\n`);
};

// ========================================
// РАБОТА С БРАУЗЕРОМ
// ========================================

let browser = null;
let page = null;

const COOKIES_PATH = path.join(USER_BASE, 'session', 'cookies.json');
const USER_DATA_DIR = path.join(USER_BASE, 'session', 'browser-data');

const initBrowser = async (headless = false) => {
  info('🌐 Запуск браузера...');
  
  // Создаём папку для сессии если нет
  if (!fs.existsSync(path.join(USER_BASE, 'session'))) {
    fs.mkdirSync(path.join(USER_BASE, 'session'), { recursive: true });
  }

  // Используем userDataDir — браузер сохраняет ВСЕ куки, localStorage, сессии
  // Это значит: залогинился один раз → следующий запуск уже авторизован
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
    // protocolTimeout — сколько Puppeteer ждёт ответа от Chrome через DevTools Protocol.
    // По умолчанию 3 минуты — слишком долго, если Chrome завис, на каждый город терялись минуты.
    // Снижаем до 45 сек: достаточно для штатной работы, быстро падает если Chrome завис.
    protocolTimeout: 45000,
  };

  try {
    browser = await puppeteer.launch(launchOpts);
  } catch (e) {
    // Типичная ошибка после `npm install` — Chrome ещё не скачан Puppeteer'ом.
    // Авто-докачиваем и пробуем снова.
    if (/Could not find Chrome|Failed to launch the browser process/i.test(e.message)) {
      warn(`⚠️ Chrome для Puppeteer не найден. Скачиваю автоматически (~170 MB)...`);
      warn(`   Это разовая процедура, займёт 1-3 минуты. Подождите.`);
      try {
        const { execSync } = require('child_process');
        execSync('npx puppeteer browsers install chrome', {
          stdio: 'inherit',
          cwd: __dirname,
        });
        info(`✅ Chrome скачан. Запускаю браузер...`);
        browser = await puppeteer.launch(launchOpts);
      } catch (installErr) {
        error(`❌ Не удалось скачать Chrome автоматически: ${installErr.message}`);
        error(`   Попробуйте вручную в командной строке (из папки click):`);
        error(`     npx puppeteer browsers install chrome`);
        throw e;
      }
    } else {
      throw e;
    }
  }

  page = await browser.newPage();
  page.setDefaultTimeout(DEFAULTS.actionTimeout);
  page.setDefaultNavigationTimeout(DEFAULTS.navigationTimeout);
  
  // Загружаем куки из файла (дополнительная страховка)
  await loadCookies();
  
  info('✅ Браузер запущен');
};

/**
 * Сохранить куки в файл
 */
const saveCookies = async () => {
  try {
    const cookies = await page.cookies();
    fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2));
    info(`🍪 Куки сохранены (${cookies.length} шт.)`);
  } catch (e) {
    warn(`Не удалось сохранить куки: ${e.message}`);
  }
};

/**
 * Загрузить куки из файла
 */
const loadCookies = async () => {
  try {
    if (fs.existsSync(COOKIES_PATH)) {
      const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, 'utf-8'));
      if (cookies.length > 0) {
        await page.setCookie(...cookies);
        info(`🍪 Куки загружены (${cookies.length} шт.)`);
      }
    }
  } catch (e) {
    warn(`Не удалось загрузить куки: ${e.message}`);
  }
};

const closeBrowser = async () => {
  if (browser) {
    // Сохраняем куки перед закрытием
    if (page) await saveCookies();
    await browser.close();
    browser = null;
    page = null;
    info('✅ Браузер закрыт (сессия сохранена)');
  }
};

// ========================================
// АВТОРИЗАЦИЯ
// ========================================

const takeScreenshot = async (name) => {
  try {
    const screenshotDir = path.join(USER_BASE, 'screenshots');
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
    const filepath = path.join(screenshotDir, `${name}-${Date.now()}.png`);
    await page.screenshot({ path: filepath, fullPage: true });
    info(`📸 Скриншот сохранён: ${filepath}`);
    return filepath;
  } catch (e) {
    warn(`Не удалось сделать скриншот: ${e.message}`);
    return null;
  }
};

const waitForLogin = async () => {
  // Ждём до 120 секунд, пока пользователь не пройдёт авторизацию вручную
  info('⏳ Ожидание ручной авторизации (до 120 сек)...');
  info('   📱 Введите код 2FA / авторизуйтесь в открытом браузере.');
  info('   ⏰ Скрипт автоматически продолжит, когда вы залогинитесь.');
  for (let i = 0; i < 24; i++) {
    await sleep(5000);
    const url = page.url();
    if (!url.includes('passport.yandex') && !url.includes('auth')) {
      info('✅ Авторизация обнаружена!');
      await saveCookies();
      info('💾 Сессия сохранена — в следующий раз 2FA не понадобится!');
      return true;
    }
  }
  return false;
};

const login = async (email, password) => {
  info('🔐 Проверка авторизации...');

  // СНАЧАЛА проверяем — может уже залогинены (сессия сохранена с прошлого раза)
  await page.goto('https://passport.yandex.ru/profile', { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(2000);
  
  const profileUrl = page.url();
  if (profileUrl.includes('/profile') && !profileUrl.includes('/auth')) {
    info('✅ Уже авторизован (сессия сохранена)! Двухфакторка не нужна.');
    return;
  }

  info('🔐 Нужна авторизация...');

  // Сначала пробуем прямой URL
  info('  🔗 Переход на passport.yandex.ru...');
  await page.goto('https://passport.yandex.ru/auth/welcome?origin=passport_auth2&retpath=https%3A%2F%2Fpassport.yandex.ru%2Fprofile', { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(3000);

  // Проверяем, может уже залогинен
  const currentUrl = page.url();
  if (!currentUrl.includes('passport.yandex') && !currentUrl.includes('/auth') && !currentUrl.includes('pwl-yandex')) {
    info('✅ Уже авторизован');
    return;
  }

  await takeScreenshot('01-start-page');

  // Проверяем — есть ли страница "Выберите аккаунт для входа"
  const hasAccountList = await page.evaluate(() => {
    return document.body.innerText.includes('Выберите аккаунт') || 
           document.body.innerText.includes('аккаунт для входа');
  });

  if (hasAccountList) {
    info('  👤 Страница выбора аккаунта → кликаю по сохранённому...');
    
    // Ищем элемент с email-адресом и кликаем по нему (по координатам центра)
    const accountCoords = await page.evaluate((expectedEmail) => {
      const els = document.querySelectorAll('*');
      // Сначала ищем элемент с полным email
      for (const el of els) {
        const t = (el.textContent || '').trim();
        if (t.includes(expectedEmail) && t.length < 100) {
          // Идём вверх по DOM пока не найдём кликабельный контейнер
          let cur = el;
          for (let i = 0; i < 6; i++) {
            const r = cur.getBoundingClientRect();
            if (r.width > 200 && r.height > 40 && r.height < 120) {
              return { x: r.x + r.width / 2, y: r.y + r.height / 2, text: t.substring(0, 50) };
            }
            if (!cur.parentElement) break;
            cur = cur.parentElement;
          }
        }
      }
      return null;
    }, email);

    if (accountCoords) {
      await page.mouse.click(accountCoords.x, accountCoords.y);
      info(`  ✅ Кликнул по аккаунту "${accountCoords.text}" (${Math.round(accountCoords.x)}, ${Math.round(accountCoords.y)})`);
      await sleep(5000);
      
      // Проверяем — авторизовались?
      const afterClick = page.url();
      if (!afterClick.includes('passport.yandex') && !afterClick.includes('/auth') && !afterClick.includes('pwl-yandex')) {
        info('✅ Авторизация успешна через сохранённый аккаунт!');
        await saveCookies();
        return;
      }
      // Если всё ещё на паспорте — может быть нужен пароль
      info('  🔍 Проверяю что дальше...');
      await takeScreenshot('01b-after-account-click');
    } else {
      warn('  ⚠️  Не нашёл сохранённый аккаунт на странице');
    }
  }

  // Проверяем — телефон или логин?
  const hasPhoneForm = await page.evaluate(() => {
    return document.body.innerText.includes('номер телефона') || document.body.innerText.includes('Введите номер');
  });

  if (hasPhoneForm) {
    info('  📱 Страница с телефоном → переключаюсь на вход по логину...');
    
    // 1. Кликаем "Ещё" по координатам
    const moreCoords = await page.evaluate(() => {
      const els = document.querySelectorAll('*');
      for (const el of els) {
        if (el.textContent.trim() === 'Ещё' && el.children.length === 0) {
          const r = el.getBoundingClientRect();
          if (r.width > 10 && r.height > 10) return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
        }
      }
      for (const el of els) {
        if (el.textContent.trim() === 'Ещё') {
          const r = el.getBoundingClientRect();
          if (r.width > 10 && r.width < 300) return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
        }
      }
      return null;
    });

    if (moreCoords) {
      await page.mouse.click(moreCoords.x, moreCoords.y);
      info(`  ✅ "Ещё" кликнуто (${Math.round(moreCoords.x)}, ${Math.round(moreCoords.y)})`);
    }
    
    await sleep(1500);
    await takeScreenshot('02-menu-opened');
    
    // 2. Кликаем "Войти по логину" — ищем по координатам
    const loginCoords = await page.evaluate(() => {
      const els = document.querySelectorAll('*');
      // Сначала ищем точное совпадение (листовой элемент)
      for (const el of els) {
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (el.children.length === 0 && (t === 'Войти по логину' || t === 'По логину')) {
          const r = el.getBoundingClientRect();
          if (r.width > 10 && r.height > 10 && r.y > 0) {
            return { x: r.x + r.width / 2, y: r.y + r.height / 2, found: 'exact-leaf', text: t };
          }
        }
      }
      // Потом ищем с 1 ребёнком
      for (const el of els) {
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (el.children.length <= 1 && t === 'Войти по логину') {
          const r = el.getBoundingClientRect();
          if (r.width > 10 && r.height > 10 && r.y > 0) {
            return { x: r.x + r.width / 2, y: r.y + r.height / 2, found: 'child<=1', text: t };
          }
        }
      }
      // Ищем любой элемент содержащий "логину" который выглядит как пункт меню
      for (const el of els) {
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (t.includes('логину') && t.length < 30) {
          const r = el.getBoundingClientRect();
          if (r.width > 50 && r.width < 400 && r.height > 15 && r.height < 80 && r.y > 100) {
            return { x: r.x + r.width / 2, y: r.y + r.height / 2, found: 'contains-логину', text: t };
          }
        }
      }
      return null;
    });

    if (loginCoords) {
      await page.mouse.click(loginCoords.x, loginCoords.y);
      info(`  ✅ "${loginCoords.text}" кликнуто [${loginCoords.found}] (${Math.round(loginCoords.x)}, ${Math.round(loginCoords.y)})`);
      await sleep(2000);
    } else {
      // Последний фоллбэк: дамп + скриншот
      warn('  ⚠️  Не нашёл "Войти по логину", дамплю элементы...');
      const dump = await page.evaluate(() => {
        const result = [];
        const els = document.querySelectorAll('*');
        for (const el of els) {
          const r = el.getBoundingClientRect();
          const t = (el.textContent || '').trim();
          if (r.width > 0 && r.height > 0 && r.y > 100 && r.y < 600 && t.length > 2 && t.length < 40 && el.children.length <= 1) {
            result.push(`[${el.tagName}] "${t}" (${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}) ch:${el.children.length}`);
          }
        }
        return result.slice(0, 40);
      });
      dump.forEach(d => info('    ' + d));
      await takeScreenshot('02b-menu-dump');
    }
  }

  await takeScreenshot('03-ready-for-input');

  // ========== ШАГ 2: Ввод логина ==========
  info('  📧 Ввод логина...');
  let loginInput = null;
  const loginSelectors = [
    'input[name="login"]', 'input[data-t="field:input-login"]',
    '#passp-field-login', 'input[type="text"]', 'input[type="email"]',
    'input[autocomplete="username"]', 'input[placeholder*="логин"]',
    'input[placeholder*="mail"]',
  ];

  for (const sel of loginSelectors) {
    try {
      loginInput = await page.waitForSelector(sel, { timeout: 3000, visible: true });
      if (loginInput) { info(`  Поле: ${sel}`); break; }
    } catch {}
  }

  if (!loginInput) {
    await takeScreenshot('03-no-login-field');
    warn('⚠️  Поле логина не найдено. Авторизуйтесь вручную.');
    const ok = await waitForLogin();
    if (!ok) throw new Error('Таймаут авторизации');
    return;
  }

  await loginInput.click({ clickCount: 3 });
  await sleep(200);
  await page.keyboard.press('Backspace');
  await sleep(200);
  await loginInput.type(email, { delay: 80 });
  await sleep(500);
  await takeScreenshot('04-login-typed');

  // ========== ШАГ 3: Нажимаем "Войти" — по координатам чёрной кнопки ==========
  info('  📧 Нажимаю "Войти"...');
  
  // Ищем ИМЕННО кнопку (button) с ТОЧНЫМ текстом "Войти" (не "Войти по логину")
  const submitCoords = await page.evaluate(() => {
    // Сначала ищем button с точным текстом "Войти"
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      const t = btn.textContent.trim();
      if (t === 'Войти') {
        const r = btn.getBoundingClientRect();
        if (r.width > 50 && r.height > 20) {
          return { x: r.x + r.width / 2, y: r.y + r.height / 2, how: 'button-exact' };
        }
      }
    }
    // Потом ищем любой элемент с ролью кнопки
    const els = document.querySelectorAll('[role="button"], [type="submit"], button');
    for (const el of els) {
      const t = el.textContent.trim();
      if (t === 'Войти') {
        const r = el.getBoundingClientRect();
        if (r.width > 50 && r.height > 20) {
          return { x: r.x + r.width / 2, y: r.y + r.height / 2, how: 'role-button' };
        }
      }
    }
    return null;
  });

  if (submitCoords) {
    await page.mouse.click(submitCoords.x, submitCoords.y);
    info(`  ✅ "Войти" кликнуто [${submitCoords.how}] (${Math.round(submitCoords.x)}, ${Math.round(submitCoords.y)})`);
  } else {
    // Фоллбэк: просто нажимаем Enter
    info('  ⏎ Кнопка не найдена, жму Enter...');
    await page.keyboard.press('Enter');
  }

  await sleep(5000);
  await takeScreenshot('05-after-login-submit');

  // ========== ШАГ 4: Ввод пароля ==========
  info('  🔑 Ввод пароля...');
  let passInput = null;
  const passSelectors = [
    'input[name="passwd"]', 'input[data-t="field:input-passwd"]',
    '#passp-field-passwd', 'input[type="password"]',
    'input[autocomplete="current-password"]',
  ];

  for (const sel of passSelectors) {
    try {
      passInput = await page.waitForSelector(sel, { timeout: 5000, visible: true });
      if (passInput) { info(`  Поле пароля: ${sel}`); break; }
    } catch {}
  }

  if (!passInput) {
    await takeScreenshot('06-no-password-field');
    warn('⚠️  Поле пароля не найдено. Капча / 2FA / другое.');
    warn('   Авторизуйтесь вручную в браузере.');
    const ok = await waitForLogin();
    if (!ok) throw new Error('Таймаут авторизации');
    return;
  }

  await passInput.click({ clickCount: 3 });
  await sleep(200);
  await passInput.type(password, { delay: 80 });
  await sleep(500);
  await takeScreenshot('07-password-typed');

  // ========== ШАГ 5: Нажимаем "Войти" после пароля ==========
  info('  🔑 Нажимаю "Войти"...');
  const submitCoords2 = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.trim() === 'Войти') {
        const r = btn.getBoundingClientRect();
        if (r.width > 50 && r.height > 20) return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      }
    }
    return null;
  });

  if (submitCoords2) {
    await page.mouse.click(submitCoords2.x, submitCoords2.y);
    info(`  ✅ "Войти" кликнуто (${Math.round(submitCoords2.x)}, ${Math.round(submitCoords2.y)})`);
  } else {
    await page.keyboard.press('Enter');
    info('  ⏎ Enter');
  }

  await sleep(6000);

  // ========== ШАГ 6: Проверяем результат ==========
  const afterUrl = page.url();
  if (afterUrl.includes('passport.yandex') || afterUrl.includes('/auth') || afterUrl.includes('pwl-yandex')) {
    await takeScreenshot('08-login-stuck');
    warn('⚠️  Авторизация не прошла автоматически.');
    warn('   Авторизуйтесь вручную. Скрипт ждёт...');
    const ok = await waitForLogin();
    if (!ok) throw new Error('Таймаут авторизации');
  } else {
    info('✅ Авторизация успешна!');
    await saveCookies();
    info('💾 Сессия сохранена — в следующий раз 2FA не понадобится!');
  }
};

/**
 * Найти кнопку/ссылку по тексту и кликнуть
 */
const clickButtonByText = async (pg, texts) => {
  // Ищем среди ВСЕХ возможных кликабельных элементов
  const elements = await pg.$$('button, a, [role="button"], [role="menuitem"], li, div, span, p');
  for (const el of elements) {
    const text = await pg.evaluate(e => (e.textContent || '').trim(), el);
    for (const t of texts) {
      // Точное совпадение или вхождение
      if (text.toLowerCase() === t.toLowerCase() || text.toLowerCase().includes(t.toLowerCase())) {
        try {
          const isVisible = await pg.evaluate(e => {
            const r = e.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && r.width < 600; // не слишком большой (не весь body)
          }, el);
          if (isVisible) { await el.click(); return true; }
        } catch { continue; }
      }
    }
  }
  return false;
};

// ========================================
// ПУБЛИКАЦИЯ ОДНОГО ПОСТА В ОДИН ГОРОД
// ========================================

// ======================== HELPERS ========================

const findClickableByText = async (regexSrc, regexFlags = 'i') => {
  return await page.evaluateHandle((src, flags) => {
    const re = new RegExp(src, flags);
    const nodes = document.querySelectorAll('button, a, [role="button"], [role="tab"], [role="menuitem"]');
    for (const el of nodes) {
      const text = (el.textContent || '').trim();
      if (!re.test(text)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 10 || r.height < 10) continue;
      const style = window.getComputedStyle(el);
      if (style.visibility === 'hidden' || style.display === 'none' || style.opacity === '0') continue;
      return el;
    }
    return null;
  }, regexSrc, regexFlags);
};

const waitForTextButton = async (regexSrc, timeoutMs = 10000, regexFlags = 'i') => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const handle = await findClickableByText(regexSrc, regexFlags);
    const isNull = await page.evaluate(h => h === null, handle);
    if (!isNull) return handle;
    await sleep(300);
  }
  return null;
};

const waitForImageAttached = async (timeoutMs = 8000) => {
  try {
    await page.waitForFunction(() => {
      const candidates = document.querySelectorAll(
        'img[src^="blob:"], img[src^="data:"], [class*="image-preview"], [class*="ImagePreview"], [class*="attachment"] img'
      );
      for (const el of candidates) {
        const r = el.getBoundingClientRect();
        if (r.width >= 40 && r.height >= 40) return true;
      }
      const bg = document.querySelectorAll('[style*="background-image"]');
      for (const el of bg) {
        const s = el.getAttribute('style') || '';
        if (s.includes('blob:') || s.includes('data:')) return true;
      }
      return false;
    }, { timeout: timeoutMs });
    return true;
  } catch { return false; }
};

const closeImageModal = async () => {
  // ВАЖНО: НЕ нажимаем «Добавить» — это может вызвать повторную загрузку файла → дубль картинки.
  // Жмём только однозначные кнопки закрытия модалки.
  try {
    const btn = await findClickableByText('^(готово|применить|прикрепить|ok|ок|сохранить|закрыть)$', 'i');
    const isNull = await page.evaluate(h => h === null, btn);
    if (!isNull) {
      await btn.asElement()?.click();
      await sleep(500);
      return true;
    }
  } catch {}
  // Fallback — Esc (закроет модалку, не жмя кнопок)
  try { await page.keyboard.press('Escape'); await sleep(400); } catch {}
  return false;
};

const ensureCorrectOrganization = async (expectedCompanyId) => {
  try {
    const currentUrl = page.url();
    if (currentUrl.includes('/sprav/' + expectedCompanyId + '/')) return true;
    const picker = await page.evaluateHandle(() => {
      const candidates = document.querySelectorAll(
        '[class*="organization" i], [class*="company-picker" i], [class*="OrgPicker" i], ' +
        '[class*="avatar" i], [aria-label*="компани" i], [aria-label*="организац" i], ' +
        'header button, header [role="button"]'
      );
      for (const el of candidates) {
        const r = el.getBoundingClientRect();
        if (r.width >= 20 && r.height >= 20 && r.top < 120) return el;
      }
      return null;
    });
    const isNull = await page.evaluate(h => h === null, picker);
    if (!isNull) {
      await picker.asElement()?.click();
      await sleep(800);
    }
  } catch {}
  return false;
};

// ======================== ЗАГРУЗКА ФОТО В РАЗДЕЛ «ТОВАРЫ» ========================
//
// Отдельная функция: после успешной публикации поста типа «Отгрузка» можно
// дополнительно залить фотки в раздел /p/edit/photos/ → блок «Товары».
// Полностью изолирована: если упадёт — на статус публикации не влияет.

/**
 * Загружает фотографии в раздел «Фото и видео → Товары» карточки Яндекс.Бизнес.
 *
 * РЕАЛЬНАЯ РАЗМЕТКА ЯНДЕКСА (выяснена через DevTools):
 *   <div class="PhotosPage-Row PhotosPage-Row_type_goods">     ← наша секция
 *     <div class="PhotosPage-Offset">
 *       <div class="PhotosPage-Title">
 *         <div class="PhotosPage-Identifier" id="goods-title">  ← УНИКАЛЬНЫЙ ID
 *         "Товары"
 *         <div class="PhotosPage-Divider">·</div>
 *         <div class="PhotosPage-Count">217</div>
 *       </div>
 *       <div class="PhotosPage-Grid">                           ← сетка плиток
 *         <label>Загрузить фотографии</label> + <input type=file>
 *         ...
 *       </div>
 *     </div>
 *   </div>
 *
 * Стратегия:
 *   1. Найти секцию по `.PhotosPage-Row_type_goods` (тип = goods)
 *   2. Внутри найти `<label>` с текстом «Загрузить фотографии»
 *   3. Через label[for=...] найти связанный input[type=file]
 *   4. Передать файлы в этот input
 *   5. Проверить рост счётчика `.PhotosPage-Count` внутри `.PhotosPage-Row_type_goods`
 *
 * @param {object} task — задача города (companyUrl, cityName)
 * @param {string[]} photoUrls — массив URL фоток для загрузки
 * @returns {Promise<{ uploaded: number, failed: number, errors: string[] }>}
 */
const uploadProductPhotos = async (task, photoUrls) => {
  const result = { uploaded: 0, failed: 0, errors: [] };
  if (!photoUrls || photoUrls.length === 0) return result;

  info(`  📸 Загрузка ${photoUrls.length} фото в раздел «Товары»...`);

  // ─── 1. URL раздела photos ───
  const cId = task.companyId || extractCompanyId(task.companyUrl);
  if (!cId) {
    result.errors.push('Не определён ID компании');
    result.failed = photoUrls.length;
    warn(`  ⚠️ Не определён ID компании`);
    return result;
  }
  const hasPSlash = /\/sprav\/\d+\/p\//.test(task.companyUrl);
  const photosUrl = hasPSlash
    ? `https://yandex.ru/sprav/${cId}/p/edit/photos/`
    : `https://yandex.ru/sprav/${cId}/edit/photos/`;

  // ─── 2. Скачиваем фото локально ───
  const localPaths = [];
  for (const url of photoUrls) {
    try {
      const p = await downloadImage(url);
      localPaths.push({ url, path: p });
    } catch (e) {
      result.failed++;
      result.errors.push(`Не скачать ${url.slice(0, 50)}: ${e.message}`);
      warn(`  ⚠️ Не скачать ${url.slice(0, 50)}: ${e.message}`);
    }
  }
  if (localPaths.length === 0) return result;

  const safeCityName = (task.cityName || 'city').replace(/[^\w-]/g, '_');

  // ─── 3. Переход на /photos/ ───
  // После публикации поста Яндекс мог запустить навигацию/редирект, поэтому
  // даём ему ~1 сек чтобы стабилизироваться, а потом грузим страницу.
  // Если goto упал (например, Target closed из-за навигации) — пробуем ещё раз.
  await sleep(1000);

  const tryOpenPhotosUrl = async () => {
    try {
      await page.goto(photosUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      // Ждём пока сеть успокоится (Яндекс догрузит первичный контент)
      await Promise.race([
        page.waitForNetworkIdle({ idleTime: 500, timeout: 4000 }).catch(() => {}),
        sleep(1200),
      ]);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  };

  let openResult = await tryOpenPhotosUrl();
  if (!openResult.ok) {
    warn(`  ⚠️ Первая попытка открыть /photos/ упала: ${openResult.error}`);
    info(`  🔄 Пробую ещё раз через 2 сек...`);
    await sleep(2000);
    openResult = await tryOpenPhotosUrl();
  }

  if (!openResult.ok) {
    // Третья попытка — через новую вкладку (если контекст совсем поломался)
    warn(`  ⚠️ Вторая попытка тоже упала: ${openResult.error}. Пробую через новую вкладку...`);
    try {
      if (browser) {
        const newPage = await browser.newPage();
        // Восстанавливаем cookies
        try {
          const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, 'utf-8'));
          await newPage.setCookie(...cookies);
        } catch {}
        await newPage.setViewport({ width: 1280, height: 800 });
        try { await page.close(); } catch {}
        page = newPage;
        await sleep(500);
        openResult = await tryOpenPhotosUrl();
      }
    } catch (e) {
      openResult.error = 'не удалось пересоздать вкладку: ' + e.message;
    }
  }

  if (!openResult.ok) {
    result.errors.push(`Не открыть страницу: ${openResult.error}`);
    result.failed = localPaths.length;
    warn(`  ⚠️ Не открыть ${photosUrl}: ${openResult.error}`);
    for (const lp of localPaths) { try { fs.unlinkSync(lp.path); } catch {} }
    return result;
  }

  // ─── 4. УМНЫЙ СКРОЛЛ: скроллим пока не появится секция «Товары» ───
  // Раньше: скроллили всю страницу до низа 3 раза подряд = ~30 сек.
  // Теперь: скроллим шагами, после каждого шага проверяем DOM — если секция уже есть, выходим.
  info(`  📜 Скролл до появления секции «Товары»...`);
  try {
    await page.evaluate(async () => {
      const step = 600;
      const maxIterations = 30; // защита от бесконечного цикла
      for (let i = 0; i < maxIterations; i++) {
        // Проверяем — секция уже в DOM?
        if (document.querySelector('.PhotosPage-Row_type_goods') || document.querySelector('#goods-title')) {
          // Доскроллим немного дальше чтобы Яндекс отрисовал плитку загрузки
          window.scrollBy(0, step);
          await new Promise(r => setTimeout(r, 200));
          window.scrollTo(0, 0);
          return;
        }
        const curY = window.scrollY;
        const docH = document.body.scrollHeight;
        if (curY + window.innerHeight >= docH) {
          // Дошли до низа и секции нет — пробуем ещё одну попытку и выходим
          await new Promise(r => setTimeout(r, 300));
          if (document.querySelector('.PhotosPage-Row_type_goods')) return;
          break;
        }
        window.scrollBy(0, step);
        await new Promise(r => setTimeout(r, 130));
      }
      window.scrollTo(0, 0);
    });
  } catch (e) {
    warn(`  ⚠️ Ошибка при скролле: ${e.message}`);
  }
  await sleep(300);

  // ─── 5. ТОЧНЫЙ ПОИСК секции «Товары» через классы Яндекса ───
  // Реальная разметка: <div class="PhotosPage-Row PhotosPage-Row_type_goods">
  // Это уникальный класс — он есть ТОЛЬКО на секции товаров.
  const sectionInfo = await page.evaluate(() => {
    // Стратегия А (главная): по классу _type_goods
    let section = document.querySelector('.PhotosPage-Row_type_goods');

    // Стратегия Б (fallback): по id="goods-title"
    if (!section) {
      const titleEl = document.querySelector('#goods-title');
      if (titleEl) {
        // Поднимаемся до PhotosPage-Row
        let p = titleEl;
        for (let lvl = 0; lvl < 6 && p; lvl++) {
          if (p.className && /PhotosPage-Row/.test(p.className.toString())) {
            section = p;
            break;
          }
          p = p.parentElement;
        }
      }
    }

    // Стратегия В (fallback): любой PhotosPage-Row содержащий текст «Товары»
    if (!section) {
      const rows = document.querySelectorAll('.PhotosPage-Row, [class*="PhotosPage-Row"], [class*="Row_type"]');
      for (const r of rows) {
        const title = r.querySelector('.PhotosPage-Title, [class*="Title"]');
        if (!title) continue;
        // Прямое содержание Title — без вложенных счётчиков
        const directText = Array.from(title.childNodes)
          .filter(n => n.nodeType === Node.TEXT_NODE)
          .map(n => n.textContent.trim())
          .join('');
        if (/^товары$/i.test(directText)) {
          section = r;
          break;
        }
      }
    }

    if (!section) return { error: 'section-not-found' };

    // Считаем счётчик секции
    const countEl = section.querySelector('.PhotosPage-Count, [class*="Count"]');
    const count = countEl ? parseInt((countEl.textContent || '0').replace(/\D/g, ''), 10) || 0 : 0;

    // Сохраняем ссылку через data-атрибут — для последующих evaluate
    section.setAttribute('data-click-goods-section', '1');

    // Проверяем что в секции есть label с текстом «Загрузить фотографии»
    const labels = section.querySelectorAll('label');
    let uploadLabel = null;
    for (const lbl of labels) {
      const t = (lbl.textContent || '').trim().toLowerCase();
      if (/загрузить\s*(фотограф|фото)/.test(t)) {
        uploadLabel = lbl;
        break;
      }
    }
    if (uploadLabel) uploadLabel.setAttribute('data-click-upload-label', '1');

    // Скроллим к секции чтобы плитка была видима
    section.scrollIntoView({ behavior: 'instant', block: 'start' });

    return {
      ok: true,
      count,
      className: section.className.toString().slice(0, 100),
      hasUploadLabel: !!uploadLabel,
      labelFor: uploadLabel ? uploadLabel.getAttribute('for') : null,
      labelText: uploadLabel ? (uploadLabel.textContent || '').trim().slice(0, 60) : null,
    };
  });

  if (sectionInfo.error) {
    result.errors.push('Секция «Товары» (.PhotosPage-Row_type_goods) не найдена в DOM');
    result.failed = localPaths.length;
    warn(`  ⚠️ Секция «Товары» не найдена. Возможно структура Яндекса изменилась.`);

    // Сохраняем HTML-дамп для диагностики
    try {
      const dumpHtml = await page.content();
      const dumpPath = path.join(USER_BASE, 'screenshots', `photos-${safeCityName}-FULL-DUMP.html`);
      const screenshotsDir = path.join(USER_BASE, 'screenshots');
      if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });
      fs.writeFileSync(dumpPath, dumpHtml, 'utf-8');
      info(`  💾 HTML-дамп: ${dumpPath}`);
    } catch {}
    await takeScreenshot(`photos-${safeCityName}-no-section`);
    for (const lp of localPaths) { try { fs.unlinkSync(lp.path); } catch {} }
    return result;
  }

  info(`  ✅ Секция «Товары» найдена: class="${sectionInfo.className}"`);
  info(`     Текущий счётчик: ${sectionInfo.count} фото`);
  info(`     Кнопка «Загрузить фотографии»: ${sectionInfo.hasUploadLabel ? 'найдена (label for="' + sectionInfo.labelFor + '")' : 'НЕ найдена'}`);

  if (!sectionInfo.hasUploadLabel) {
    result.errors.push('В секции «Товары» нет label «Загрузить фотографии»');
    result.failed = localPaths.length;
    warn(`  ⚠️ В секции «Товары» нет кнопки загрузки фото`);
    await takeScreenshot(`photos-${safeCityName}-no-upload-label`);
    for (const lp of localPaths) { try { fs.unlinkSync(lp.path); } catch {} }
    return result;
  }

  const beforeCount = sectionInfo.count;
  await takeScreenshot(`photos-${safeCityName}-2-section-found`);

  // ─── 6. Поиск input связанного с label ───
  // У Яндекса label имеет атрибут `for` указывающий на ID input'а.
  const inputHandle = await page.evaluateHandle(() => {
    const label = document.querySelector('[data-click-upload-label]');
    if (!label) return null;

    // Способ 1: через label.htmlFor
    const forId = label.getAttribute('for');
    if (forId) {
      const inp = document.getElementById(forId);
      if (inp && inp.tagName === 'INPUT' && inp.type === 'file') return inp;
    }

    // Способ 2: input внутри label
    const inside = label.querySelector('input[type="file"]');
    if (inside) return inside;

    // Способ 3: input как ближайший sibling в той же секции
    const section = document.querySelector('[data-click-goods-section]');
    if (section) {
      const inputs = section.querySelectorAll('input[type="file"]');
      // Если в секции один input — берём его
      if (inputs.length === 1) return inputs[0];
      // Если несколько — берём тот что физически ближе к label (по родителю)
      let best = null;
      let bestDepth = -1;
      for (const inp of inputs) {
        // Считаем общую глубину с label
        let depth = 0;
        let common = inp;
        while (common && !common.contains(label)) {
          common = common.parentElement;
          depth++;
          if (depth > 10) break;
        }
        if (common && (bestDepth === -1 || depth < bestDepth)) {
          best = inp;
          bestDepth = depth;
        }
      }
      if (best) return best;
    }
    return null;
  });

  const inputNull = await page.evaluate(h => h === null, inputHandle);
  if (inputNull) {
    result.errors.push('input[type=file] для секции «Товары» не найден');
    result.failed = localPaths.length;
    warn(`  ⚠️ Не нашли input связанный с label секции «Товары»`);
    await takeScreenshot(`photos-${safeCityName}-no-input`);
    for (const lp of localPaths) { try { fs.unlinkSync(lp.path); } catch {} }
    return result;
  }

  // ─── 7. Передача файлов в input ───
  try {
    const inputEl = inputHandle.asElement();
    await inputEl.uploadFile(...localPaths.map(x => x.path));
    info(`  📤 Файлы переданы в input секции «Товары» (${localPaths.length} шт.)`);
  } catch (e) {
    result.errors.push(`Ошибка передачи файлов: ${e.message}`);
    result.failed = localPaths.length;
    warn(`  ❌ Ошибка uploadFile: ${e.message}`);
    await takeScreenshot(`photos-${safeCityName}-upload-error`);
    for (const lp of localPaths) { try { fs.unlinkSync(lp.path); } catch {} }
    return result;
  }

  // ─── 8. Подтверждение через рост счётчика секции «Товары» ───
  info(`  ⏳ Жду рост счётчика «Товары» (был ${beforeCount})...`);
  const expectedNew = localPaths.length;
  let confirmed = false;
  const waitStart = Date.now();
  const TIMEOUT = 60000;  // 60 сек — обычно загрузка фото в Яндекс < 15 сек
  let lastSeen = beforeCount;

  while (Date.now() - waitStart < TIMEOUT) {
    const cur = await page.evaluate(() => {
      const section = document.querySelector('[data-click-goods-section]') || document.querySelector('.PhotosPage-Row_type_goods');
      if (!section) return null;
      const countEl = section.querySelector('.PhotosPage-Count, [class*="Count"]');
      return countEl ? parseInt((countEl.textContent || '0').replace(/\D/g, ''), 10) || 0 : null;
    });

    if (cur === null) {
      // Возможно перерендерилась секция — ждём
      await sleep(800);
      continue;
    }

    if (cur !== lastSeen) {
      info(`  📈 Счётчик «Товары»: ${beforeCount} → ${cur} (+${cur - beforeCount})`);
      lastSeen = cur;
    }

    if (cur >= beforeCount + expectedNew) {
      confirmed = true;
      result.uploaded = expectedNew;
      info(`  ✅ Все ${expectedNew} фото загружены в «Товары»: ${beforeCount} → ${cur}`);
      break;
    }
    await sleep(500);  // частый опрос вместо 2 сек
  }

  await takeScreenshot(`photos-${safeCityName}-3-after-upload`);

  if (!confirmed) {
    const delta = lastSeen - beforeCount;
    if (delta > 0) {
      result.uploaded = delta;
      warn(`  🟡 Частично: счётчик вырос на ${delta}/${expectedNew}. Возможно ещё загружается.`);
    } else {
      // Не выросло ничего — но файлы передали. Можно посмотреть «Без категории»
      const uncatGrew = await page.evaluate(() => {
        const all = document.querySelectorAll('[class*="PhotosPage-Row"]');
        for (const r of all) {
          const t = (r.textContent || '').slice(0, 100);
          if (/без\s+категори/i.test(t)) {
            const cnt = r.querySelector('.PhotosPage-Count, [class*="Count"]');
            return cnt ? parseInt((cnt.textContent || '0').replace(/\D/g, ''), 10) : null;
          }
        }
        return null;
      });
      if (uncatGrew !== null) {
        warn(`  ⚠️ Счётчик «Товары» не вырос. «Без категории» сейчас: ${uncatGrew}. Возможно фото попали туда — проверьте вручную.`);
      } else {
        warn(`  🟡 Подтверждение не получено за 90 сек. Передали ${expectedNew} — проверьте вручную.`);
      }
      result.uploaded = expectedNew; // оптимистично
    }
  }

  // ─── 9. Чистим временные файлы ───
  for (const lp of localPaths) {
    try { fs.unlinkSync(lp.path); } catch {}
  }

  return result;
};

// ======================== ПУБЛИКАЦИЯ ОДНОГО ГОРОДА ========================

const publishToCity = async (task, taskIndex, totalTasks, settings) => {
  const label = `[${taskIndex + 1}/${totalTasks}] ${task.cityName}`;
  const startedAt = Date.now();
  const result = {
    status: 'failed', reason: '', cityName: task.cityName, companyUrl: task.companyUrl,
    steps: { navigate: null, postsSection: null, addButton: null, text: null,
             image: (task.imageUrl || task.imagePath) ? 'pending' : 'skipped', publish: null },
    durationMs: 0,
  };
  info(`\n📍 ${label} — начинаем...`);

  // НОРМАЛИЗАЦИЯ URL: что бы там ни было — `/edit/main`, `/edit/`, `/edit/photos` —
  // нам нужна именно страница `/edit/posts/` или `/p/edit/posts/`.
  const companyId = task.companyId || extractCompanyId(task.companyUrl);
  const postsUrl = buildPostsUrl(task.companyUrl, companyId) || task.companyUrl;
  if (postsUrl !== task.companyUrl) {
    info(`  🔗 Исходный URL: ${task.companyUrl}`);
    info(`  🔗 Нормализован: ${postsUrl}`);
  } else {
    info(`  🔗 URL: ${postsUrl}`);
  }

  // 1. Открываем страницу постов компании СРАЗУ
  try {
    await page.goto(postsUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('body', { timeout: 10000 });
    await sleep(400);
    const actualUrl = page.url();

    // Проверка 404 — если URL невалидный
    const is404 = await page.evaluate(() => {
      const text = (document.body.textContent || '').slice(0, 1500);
      return /Страница\s+не\s+найдена/i.test(text);
    });
    if (is404) {
      result.reason = `Страница не найдена (404): ${postsUrl}. Проверьте URL карточки в «Городах».`;
      result.steps.navigate = '404';
      result.durationMs = Date.now() - startedAt;
      await takeScreenshot(`city-${taskIndex}-${task.cityName}-404`);
      error(`  ❌ ${result.reason}`);
      return result;
    }

    // Если Яндекс редиректнул на другой ID (старый формат → новый),
    // нужно повторно нормализовать URL под новый формат и дозагрузить страницу.
    // Например: /sprav/42876867/edit/main → редирект на /sprav/172526881841/p/edit/posts
    // Также Яндекс может убрать trailing slash → нужен повторный goto на /posts/.
    let redirected = false;
    let effectiveCompanyId = companyId;
    if (companyId && !actualUrl.includes('/sprav/' + companyId + '/')) {
      const newIdMatch = actualUrl.match(/\/sprav\/(\d+)\//);
      if (newIdMatch) {
        effectiveCompanyId = newIdMatch[1];
        redirected = true;
        info(`  ↪️ Яндекс редиректнул: компания ${companyId} → ${effectiveCompanyId}`);
      }
    }

    // Если URL не оканчивается на /posts или /posts/ — приводим к правильному формату.
    // Это нужно потому что после редиректа путь может оказаться /p/edit/main или просто /p/edit
    if (!/\/edit\/posts\/?$/.test(actualUrl.split('?')[0])) {
      const fixedUrl = buildPostsUrl(actualUrl, effectiveCompanyId);
      if (fixedUrl && fixedUrl !== actualUrl) {
        info(`  🔁 Корректирую URL после редиректа: ${fixedUrl}`);
        await page.goto(fixedUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await sleep(400);
      }
    }

    // ВАЖНО: ждём пока интерфейс Яндекса (React-приложение) полностью отрендерится.
    // Без этой паузы скрипт ищет кнопку «Добавить пост» когда страница ещё пустая
    // и видит только спиннеры / шапку. Раньше при идеальных URL это работало
    // потому что страница успевала загрузиться, но при редиректе нужно ждать.
    info(`  ⏳ Жду пока интерфейс прогрузится...`);
    try {
      // Ждём появления ХОТЯ БЫ ОДНОЙ кнопки с текстом (значит React смонтировал UI)
      await page.waitForFunction(() => {
        const btns = document.querySelectorAll('button, [role="button"], a');
        let withText = 0;
        for (const b of btns) {
          const t = (b.textContent || '').trim();
          if (t.length > 1 && t.length < 50) withText++;
          if (withText >= 5) return true;
        }
        return false;
      }, { timeout: 15000 });
      info(`  ✅ Интерфейс прогрузился`);
    } catch (e) {
      warn(`  ⚠️ Интерфейс не успел прогрузиться за 15 сек — продолжаю всё равно`);
    }
    // Дополнительная небольшая пауза на завершение анимаций
    await sleep(800);

    // Запоминаем effectiveCompanyId — он используется ниже для логики поиска
    task._effectiveCompanyId = effectiveCompanyId;

    result.steps.navigate = 'ok';
    result.steps.postsSection = 'direct';
  } catch (e) {
    result.reason = 'Не удалось открыть страницу: ' + e.message;
    result.durationMs = Date.now() - startedAt;
    error(`  ❌ ${result.reason}`);
    return result;
  }

  // ensureCorrectOrganization больше не нужен — мы уже на правильном URL после редиректа
  // (если был редирект — Яндекс сам выбрал правильную организацию)

  // 2. Раздел Посты — мы уже на /posts/, дополнительный клик не нужен
  let postsSectionOk = true;

  // 3. Кнопка Добавить пост — пробуем РАЗНЫЕ варианты
  // На старом формате URL (без /p/) кнопка может быть:
  //   - "Создать пост"
  //   - просто "+"
  //   - <button aria-label="Добавить пост">
  //   - кнопка с иконкой плюса
  let addBtn = await waitForTextButton('(добавить|создать|новый|написать|опубликовать).*(пост|публикац|запис)|^(добавить|создать|опубликовать)$', 6000);
  let addNull = await page.evaluate(h => h === null, addBtn);

  // Альтернатива 1: ищем по aria-label
  if (addNull) {
    addBtn = await page.evaluateHandle(() => {
      const btns = document.querySelectorAll('button, [role="button"]');
      for (const b of btns) {
        const aria = (b.getAttribute('aria-label') || '').toLowerCase();
        const title = (b.getAttribute('title') || '').toLowerCase();
        if (/добавить|создать|новый|опубликовать/.test(aria + ' ' + title) && /пост|публикац/.test(aria + ' ' + title)) {
          const r = b.getBoundingClientRect();
          if (r.width > 20 && r.height > 20 && !b.disabled) return b;
        }
      }
      return null;
    });
    addNull = await page.evaluate(h => h === null, addBtn);
  }

  // Альтернатива 2: ищем кнопку-плюс ("+" или иконка) которая ведёт к созданию поста
  if (addNull) {
    addBtn = await page.evaluateHandle(() => {
      const btns = document.querySelectorAll('button, [role="button"]');
      for (const b of btns) {
        const text = (b.textContent || '').trim();
        // Кнопки с одним символом "+" или коротким текстом, обычно primary-стиль
        if (text === '+' || text === '＋') {
          const r = b.getBoundingClientRect();
          if (r.width > 20 && r.height > 20 && !b.disabled) return b;
        }
      }
      return null;
    });
    addNull = await page.evaluate(h => h === null, addBtn);
  }

  if (addNull) {
    // Диагностика: логируем все кнопки на странице чтобы понять что не нашли
    const allBtns = await page.evaluate(() => {
      const btns = document.querySelectorAll('button, [role="button"]');
      const list = [];
      btns.forEach((b, i) => {
        if (i > 30) return;
        const text = (b.textContent || '').trim().slice(0, 60);
        const r = b.getBoundingClientRect();
        if (r.width < 5 || r.height < 5) return;
        list.push(text || '(no text, aria=' + (b.getAttribute('aria-label') || '') + ')');
      });
      return list;
    });
    info(`  🔬 Кнопки на странице: ${JSON.stringify(allBtns.slice(0, 15))}`);

    result.reason = 'Кнопка «Добавить пост» не найдена';
    result.steps.addButton = 'missing';
    await takeScreenshot(`city-${taskIndex}-${task.cityName}-no-add-btn`);
    result.durationMs = Date.now() - startedAt;
    error(`  ❌ ${result.reason}`);
    return result;
  }
  await addBtn.asElement()?.click();
  await sleep(700);  // 1200 → 700
  result.steps.addButton = 'ok';

  // 4. Текст
  let textField = null;
  try {
    textField = await page.waitForSelector(
      '[contenteditable="true"], textarea[name*="text"], textarea[placeholder*="екст"], textarea',
      { timeout: 8000, visible: true }
    );
  } catch {}
  if (!textField) {
    result.reason = 'Не найдено поле для текста';
    result.steps.text = 'missing';
    result.durationMs = Date.now() - startedAt;
    error(`  ❌ ${result.reason}`);
    return result;
  }
  try {
    await textField.click();
    await sleep(150);
    await page.keyboard.down('Control'); await page.keyboard.press('a'); await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await sleep(100);
    // type с delay: 0 — почти мгновенно, но Yandex видит это как настоящий ввод с клавиатуры
    await textField.type(task.postText, { delay: 0 });

    // ── ВАЖНО ── ждём чтобы DOM реально содержал весь введённый текст.
    // type() возвращает promise сразу, но символы могут «доезжать» в DOM ещё некоторое время.
    // Без этой проверки клик «Создать» происходит до того как текст применился —
    // и Яндекс публикует ОБРЕЗАННЫЙ пост.
    try {
      await page.waitForFunction((expected) => {
        const ae = document.activeElement
          || document.querySelector('[contenteditable="true"], textarea[placeholder*="екст"], textarea');
        if (!ae) return false;
        const actual = (ae.value || ae.textContent || '').replace(/\s+/g, ' ').trim();
        const expectedNorm = expected.replace(/\s+/g, ' ').trim();
        // Достаточно чтобы 95% содержимого совпало (избегаем проблем с whitespace)
        if (actual.length < expectedNorm.length * 0.95) return false;
        // Проверяем начало и конец
        const head = expectedNorm.slice(0, 30);
        const tail = expectedNorm.slice(-30);
        return actual.includes(head) && actual.includes(tail);
      }, { timeout: 10000 }, task.postText);
      info(`  ✓ Текст введён полностью (${task.postText.length} символов)`);
    } catch {
      // Не успели — но всё-таки идём дальше. Пишем предупреждение.
      warn(`  ⚠️  Текст не подтверждён в DOM за 10 сек — публикация может быть с обрезанным текстом`);
      await sleep(2000); // даём ещё немного времени
    }

    await sleep(300);
    result.steps.text = 'ok';
  } catch (e) {
    result.reason = 'Ошибка ввода текста: ' + e.message;
    result.durationMs = Date.now() - startedAt;
    error(`  ❌ ${result.reason}`);
    return result;
  }

  // 5. КАРТИНКА — один раз, без ретраев. Точная проверка по селектору Яндекса.
  // Источник картинки: либо локальный файл (task.imagePath), либо URL (task.imageUrl).
  // Локальный файл предпочтительнее — нет сетевых проблем со скачиванием.
  const hasLocalImage = task.imagePath && typeof task.imagePath === 'string' && fs.existsSync(task.imagePath);
  const hasUrlImage = task.imageUrl && isValidUrl(task.imageUrl);
  if (hasLocalImage || hasUrlImage) {
    info(`  🖼️  Загрузка картинки...`);
    let imagePath = null;
    let uploadOk = false;
    let uploadError = '';

    // Считаем сколько уже есть превью PostPhotosCollection-Photo (на случай если их несколько в ленте)
    const countPostPhotos = async () => {
      try {
        return await page.evaluate(() => {
          // Только превью внутри формы создания/редактирования поста (не уже опубликованные)
          // Главный признак — превью в активной форме PostAddForm
          const form = document.querySelector('[class*="PostAddForm"], [class*="post-add-form"], form[class*="Post"]');
          if (form) {
            const previews = form.querySelectorAll('img[src*="get-sprav-posts"], [style*="get-sprav-posts"], [class*="PhotosCollection"] [class*="Photo"]');
            return previews.length;
          }
          return 0;
        });
      } catch { return 0; }
    };

    try {
      // Если есть локальный файл — используем его напрямую (без скачивания).
      // Иначе — скачиваем по URL.
      if (hasLocalImage) {
        imagePath = task.imagePath;
        info(`  📁 Использую локальный файл: ${path.basename(imagePath)}`);
      } else {
        imagePath = await downloadImage(task.imageUrl);
      }
      const before = await countPostPhotos();
      const tempExtraPaths = [];  // временные доп. файлы (скачанные по URL) — удалим после публикации

      let fileInput = await page.$('input[type="file"]');
      if (!fileInput) {
        const uploadBtn = await waitForTextButton('(прикрепить|добавить\\s*(фото|картинк|изображ)|загрузить)', 3000);
        const uNull = await page.evaluate(h => h === null, uploadBtn);
        if (!uNull) {
          await uploadBtn.asElement()?.click();
          await sleep(400);
          fileInput = await page.waitForSelector('input[type="file"]', { timeout: 4000 }).catch(() => null);
        }
      }

      if (!fileInput) {
        uploadError = 'Поле загрузки файла не найдено';
        warn(`  ⚠️  ${uploadError}`);
      } else {
        // Подготавливаем список путей: основная + extraImages (если есть)
        // Яндекс позволяет максимум 4 фото в посте
        const allImagePaths = [imagePath];
        if (Array.isArray(task.extraImages) && task.extraImages.length > 0) {
          for (const extra of task.extraImages.slice(0, 3)) {  // макс 3 дополнительных = 4 всего
            try {
              const extraPath = typeof extra === 'string' ? extra : (extra.path || extra.url);
              if (!extraPath) continue;

              // Если это локальный файл — используем напрямую
              if (typeof extraPath === 'string' && !extraPath.startsWith('http') && fs.existsSync(extraPath)) {
                allImagePaths.push(extraPath);
              } else {
                // Иначе скачиваем
                const downloaded = await downloadImage(extraPath);
                allImagePaths.push(downloaded);
                tempExtraPaths.push(downloaded);
              }
            } catch (e) {
              const extraStr = typeof extra === 'string' ? extra : (extra.url || extra.path || '?');
              warn(`  ⚠️ Доп. фото не скачано (${String(extraStr).slice(0, 50)}): ${e.message}`);
            }
          }
        }

        if (allImagePaths.length > 1) {
          info(`  🖼️  Загружаю ${allImagePaths.length} фото в пост...`);
        }
        // Загружаем ВСЕ файлы разом — input[type=file] с multiple поддерживает несколько
        await fileInput.uploadFile(...allImagePaths);

        // ТОЧНОЕ ожидание появления превью на CDN Яндекса (get-sprav-posts)
        // Раньше: фиксированная пауза 6 сек. Теперь: ждём максимум 8 сек, выходим как только появилось.
        try {
          await page.waitForFunction(() => {
            const all = document.querySelectorAll('img[src*="get-sprav-posts"], [style*="get-sprav-posts"]');
            // Ищем именно среди тех что в форме создания (большой размер, видимое)
            for (const el of all) {
              const r = el.getBoundingClientRect();
              if (r.width >= 100 && r.height >= 100) return true;
            }
            return false;
          }, { timeout: 8000 });

          // ── ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА ──
          // Превью могло появиться, но Яндекс может всё равно показать тост «Не удалось загрузить»
          // (бывает при больших файлах / неподдерживаемых форматах / временных сбоях CDN).
          // Ждём ещё 1.5 сек и сканируем страницу на наличие красного toast'а.
          await sleep(1500);
          const yandexErrorToast = await page.evaluate(() => {
            // Ищем тост-уведомление с текстом про ошибку
            const candidates = document.querySelectorAll(
              '[class*="oast"], [class*="otification"], [class*="otice"], [role="alert"], [class*="essage"][class*="rror"]'
            );
            for (const el of candidates) {
              const text = (el.textContent || '').trim().toLowerCase();
              if (!text || text.length > 200) continue;
              const r = el.getBoundingClientRect();
              if (r.width < 50 || r.height < 10) continue;
              if (/не\s*удал(ось|ось|ось)\s*загруз|загруз.*не\s*удал|fail.*upload|upload.*fail|невозможно\s*загруз/i.test(text)) {
                return text;
              }
            }
            return null;
          });

          if (yandexErrorToast) {
            uploadOk = false;
            uploadError = 'Яндекс отклонил картинку: ' + yandexErrorToast.slice(0, 100);
            warn(`  ⚠️  ${uploadError} — публикуем без картинки`);
            // Закрываем тост чтобы он не мешал клику «Опубликовать»
            try {
              await page.evaluate(() => {
                document.querySelectorAll('[class*="lose"], [aria-label*="акрыть"], [aria-label*="lose"]').forEach(b => {
                  const r = b.getBoundingClientRect();
                  if (r.width < 50 && r.width > 5) try { b.click(); } catch {}
                });
              });
            } catch {}
            // Также удаляем превью если оно есть — т.к. Яндекс отклонил
            try {
              await page.evaluate(() => {
                document.querySelectorAll('[class*="emove"], [class*="elete"], [aria-label*="алить"]').forEach(b => {
                  if (b.closest('[class*="PostPhotosCollection"], [class*="Post"]')) {
                    try { b.click(); } catch {}
                  }
                });
              });
              await sleep(400);
            } catch {}
          } else {
            uploadOk = true;
            info(`  ✅ Картинка загружена в редактор`);
          }
        } catch {
          // За 8 сек превью не появилось — может быть медленный интернет или Яндекс не отвечает
          uploadError = 'Превью не появилось за 8 секунд';
          warn(`  ⚠️  ${uploadError} — публикуем без картинки`);
        }
      }
    } catch (imgErr) {
      uploadError = imgErr.message;
      warn(`  ⚠️  Ошибка загрузки: ${uploadError}`);
    } finally {
      // Удаляем ВРЕМЕННЫЙ скачанный файл (из papki temp/).
      // НЕ удаляем локальный файл пользователя из uploads/ — он нужен для других городов.
      if (imagePath && !hasLocalImage) {
        try { fs.unlinkSync(imagePath); } catch {}
      }
      // Удаляем временные доп. фото (скачанные по URL).
      // Локальные пути доп. фото — НЕ удаляем (они в uploads/).
      if (typeof tempExtraPaths !== 'undefined' && Array.isArray(tempExtraPaths)) {
        for (const p of tempExtraPaths) {
          try { fs.unlinkSync(p); } catch {}
        }
      }
    }

    if (uploadOk) {
      result.steps.image = 'ok';
    } else {
      result.steps.image = 'failed';
      result.imageError = uploadError;
    }
  }

  // 6. Публикация
  // ── ДИАГНОСТИКА ── скриншот ДО клика + список ВСЕХ кнопок в активной форме
  await takeScreenshot(`city-${taskIndex}-${task.cityName}-1-before-publish`);

  const buttonsBefore = await page.evaluate(() => {
    // Ищем активную форму (модалка или встроенная форма)
    const form = document.querySelector(
      '[class*="PostAddForm"], [class*="post-add-form"], form[class*="Post"], [role="dialog"], [class*="odal"], [class*="opup"]'
    );
    const scope = form || document.body;
    const btns = scope.querySelectorAll('button, [role="button"], [type="submit"]');
    const list = [];
    btns.forEach((b, i) => {
      const text = (b.textContent || '').trim().slice(0, 60);
      const r = b.getBoundingClientRect();
      if (r.width < 5 || r.height < 5) return;
      const disabled = b.disabled || b.getAttribute('aria-disabled') === 'true';
      const cls = (b.className || '').toString().slice(0, 80);
      list.push({
        i, text,
        x: Math.round(r.x), y: Math.round(r.y),
        w: Math.round(r.width), h: Math.round(r.height),
        disabled,
        cls,
        scopeIsForm: !!form,
      });
    });
    return list;
  });
  info(`  🔬 ДИАГНОСТИКА: найдено ${buttonsBefore.length} кнопок на форме:`);
  buttonsBefore.forEach((b, i) => {
    if (i < 20) {  // лимит чтобы не засорять лог
      info(`     [${i}] "${b.text}" pos(${b.x},${b.y}) size(${b.w}x${b.h}) ${b.disabled ? 'DISABLED' : 'enabled'} cls="${b.cls}"`);
    }
  });

  // Поиск кнопки «Создать» / «Опубликовать»
  // Кнопка может быть как внутри формы, так и снаружи (например, под textarea).
  // Ищем по ВСЕМУ документу, но фильтруем строго:
  //   - точное совпадение "Создать"/"Опубликовать"/"Отправить"  ← приоритет
  //   - не disabled, видимая, размер ≥ 30×20
  //   - не "Сохранить черновик", "Отменить", "Удалить", "Закрыть", "Назад"
  const pubBtn = await page.evaluateHandle(() => {
    const allBtns = document.querySelectorAll('button, [role="button"], [type="submit"]');
    const candidates = [];
    for (const b of allBtns) {
      const text = (b.textContent || '').trim();
      if (!text || text.length > 30) continue;
      const textLow = text.toLowerCase();
      // Запрещённые
      if (/(черновик|отмен|удал|закр|назад|отказ|войти|выйти|настрой|регистр)/i.test(textLow)) continue;
      const r = b.getBoundingClientRect();
      if (r.width < 30 || r.height < 18) continue;
      if (r.width === 0 || r.height === 0) continue;
      const disabled = b.disabled || b.getAttribute('aria-disabled') === 'true';
      if (disabled) continue;
      // Видимая (на экране или хотя бы в DOM)
      const style = window.getComputedStyle(b);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      candidates.push({ btn: b, text: textLow, r });
    }

    // 1. Точное совпадение
    const exactNames = ['создать', 'опубликовать', 'отправить', 'publish', 'submit'];
    for (const name of exactNames) {
      for (const c of candidates) {
        if (c.text === name) return c.btn;
      }
    }
    // 2. Содержит ключевые слова
    for (const c of candidates) {
      if (/(опубликовать|создать пост|отправить пост)/i.test(c.text)) return c.btn;
    }
    // 3. Только "создать" в коротком тексте (как в Яндекс.Бизнесе)
    for (const c of candidates) {
      if (c.text === 'создать' || c.text.startsWith('создать ')) return c.btn;
    }
    return null;
  });
  const pubNull = await page.evaluate(h => h === null, pubBtn);
  if (pubNull) {
    result.reason = 'Кнопка «Создать»/«Опубликовать» не найдена среди ' + buttonsBefore.length + ' кнопок';
    result.steps.publish = 'missing';
    await takeScreenshot(`city-${taskIndex}-${task.cityName}-no-publish-btn`);
    result.durationMs = Date.now() - startedAt;
    error(`  ❌ ${result.reason}`);
    return result;
  }

  // Лог: какую именно кнопку нашли
  const pubBtnInfo = await page.evaluate(b => {
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return {
      text: (b.textContent || '').trim().slice(0, 60),
      x: Math.round(r.x), y: Math.round(r.y),
      w: Math.round(r.width), h: Math.round(r.height),
    };
  }, pubBtn);
  info(`  🎯 Найдена кнопка публикации: "${pubBtnInfo.text}" pos(${pubBtnInfo.x},${pubBtnInfo.y}) size(${pubBtnInfo.w}x${pubBtnInfo.h})`);

  // ═══════════════════════════════════════════════════════════════
  // ВЕРИФИКАЦИЯ ПУБЛИКАЦИИ ЧЕРЕЗ ПЕРЕХВАТ API-ОТВЕТОВ
  // ═══════════════════════════════════════════════════════════════
  //
  // Принцип: при клике "Создать" Яндекс делает POST-запрос к своему API
  // (например /sprav/api/posts/create или /sprav/v1/posts/...).
  // Если ответ HTTP 200/201 — пост ТОЧНО создан в системе Яндекса.
  // Это самый надёжный сигнал — он не зависит от навигации, рендеринга ленты,
  // тостов или Execution context destroyed.
  //
  // Чтобы поймать этот ответ, регистрируем listener ПЕРЕД кликом, а после клика
  // ждём его (макс 15 сек). Listener отвязываем в finally.

  /** @type {{ url: string, status: number, method: string, postData?: string } | null} */
  let apiPublishResult = null;
  const apiResponseListener = async (response) => {
    try {
      const url = response.url();
      const method = response.request().method();
      // Интересуют только POST/PUT-запросы к API создания постов в Яндекс.Справочнике
      if (method !== 'POST' && method !== 'PUT') return;
      // Фильтр URL: /sprav/, /api/, /post (различные варианты Яндекса)
      if (!/sprav|\/api\/|\/posts?\b/i.test(url)) return;
      // Игнорируем запросы которые точно не про создание поста
      if (/\/(metric|counter|track|stat|analytics|csp-report|ping|heartbeat)\b/i.test(url)) return;
      // Запоминаем самый поздний "интересный" ответ
      const status = response.status();
      let postDataPreview = '';
      try {
        const reqPostData = response.request().postData();
        if (reqPostData) postDataPreview = reqPostData.slice(0, 200);
      } catch {}
      apiPublishResult = { url, status, method, postData: postDataPreview };
    } catch {}
  };
  page.on('response', apiResponseListener);

  // Запоминаем количество постов в ленте ДО клика (для дополнительной проверки)
  const postsCountBefore = await page.evaluate(() => {
    return document.querySelectorAll('[class*="PostsList"] [class*="card"], [class*="post-card"]').length;
  }).catch(() => 0);

  await sleep(200); // короткая пауза для финализации формы

  let clickError = null;
  try {
    await pubBtn.asElement()?.click();
    info(`  🔘 Клик «${pubBtnInfo.text}» сделан`);
    result.steps.publish = 'clicked';
  } catch (e) {
    clickError = e.message;
  }

  // ──────────────────────────────────────────────────────
  // Ждём API-ответ от Яндекса (главный источник истины)
  // ──────────────────────────────────────────────────────
  const apiWaitStart = Date.now();
  const API_WAIT_TIMEOUT = 8000;  // обычно ответ за 1-3 сек, 8 сек — с большим запасом
  while (Date.now() - apiWaitStart < API_WAIT_TIMEOUT) {
    if (apiPublishResult) break;
    await sleep(150);  // частый опрос — реагируем быстро
  }

  // Отвязываем listener — он больше не нужен
  try { page.off('response', apiResponseListener); } catch {}

  // ──────────────────────────────────────────────────────
  // Анализ результата
  // ──────────────────────────────────────────────────────

  if (apiPublishResult) {
    info(`  📡 API-ответ от Яндекса: ${apiPublishResult.method} ${apiPublishResult.url.slice(0, 100)} → HTTP ${apiPublishResult.status}`);
    if (apiPublishResult.status >= 200 && apiPublishResult.status < 300) {
      // ✅ Яндекс подтвердил создание поста через API
      result.steps.publish = 'api-confirmed';
      result.status = result.steps.image === 'failed' ? 'no-image' : 'ok';
      result.reason = result.status === 'ok' ? 'Пост опубликован (API подтвердил)' : 'Пост опубликован без картинки (API подтвердил)';
      result.durationMs = Date.now() - startedAt;
      info(`  ✅ ${label} — ${result.reason} (${(result.durationMs / 1000).toFixed(1)} сек)`);
      // Минимальная пауза на навигацию — раньше было 2000, теперь 800 хватает
      await sleep(800);
      return result;
    }
    if (apiPublishResult.status >= 400) {
      // Яндекс отклонил публикацию (ошибка валидации, лимит и т.п.)
      result.steps.publish = 'api-rejected';
      result.status = 'failed';
      result.reason = `Яндекс отклонил публикацию: HTTP ${apiPublishResult.status}`;
      result.durationMs = Date.now() - startedAt;
      await takeScreenshot(`city-${taskIndex}-${task.cityName}-api-rejected`);
      error(`  ❌ ${result.reason}`);
      return result;
    }
  }

  // ──────────────────────────────────────────────────────
  // API-ответа не было — fallback на проверку DOM
  // ──────────────────────────────────────────────────────
  // Бывает что API-запрос идёт по нестандартному URL и наш фильтр его пропускает.
  // Тогда полагаемся на закрытие формы и появление поста в ленте.

  if (clickError && !apiPublishResult) {
    // Клик упал, и API-ответа не было — почти всегда это означает что Яндекс начал навигацию
    // ДО того как мы поймали ответ. Это часто бывает при УСПЕШНОЙ публикации.
    // Помечаем как "возможно опубликовано" и НЕ делаем ретрай — лучше пропустить, чем дублировать.
    result.steps.publish = 'click-error-no-api';
    result.status = 'unknown';
    result.reason = `Клик дал ошибку (${clickError.slice(0, 100)}), но API-ответа не было. Возможно опубликовано — проверьте вручную.`;
    result.durationMs = Date.now() - startedAt;
    await takeScreenshot(`city-${taskIndex}-${task.cityName}-uncertain`);
    warn(`  ⚠️ ${result.reason}`);
    return result;
  }

  if (clickError) {
    result.steps.publish = 'click-failed';
    result.status = 'failed';
    result.reason = 'Ошибка клика «Создать»: ' + clickError;
    result.durationMs = Date.now() - startedAt;
    error(`  ❌ ${result.reason}`);
    return result;
  }

  // Клик прошёл, API-ответа не было — проверяем DOM (форма закрылась? пост в ленте?)
  await sleep(2000);
  const fallback = await page.evaluate((needleText) => {
    const result = { formOpen: false, postFound: false };
    // Форма ещё открыта?
    const forms = document.querySelectorAll('[class*="PostAddForm"], [class*="post-add-form"], form[class*="Post"]');
    for (const f of forms) {
      const r = f.getBoundingClientRect();
      if (r.width > 100 && r.height > 100) { result.formOpen = true; break; }
    }
    // Пост в ленте?
    if (needleText && needleText.length >= 10) {
      const needle = needleText.slice(0, 30);
      const posts = document.querySelectorAll('[class*="Post"], [class*="post-card"], [class*="PostsList"] *, [class*="card"]');
      for (const el of posts) {
        if ((el.textContent || '').includes(needle)) {
          const r = el.getBoundingClientRect();
          if (r.width > 100 && r.height > 30) { result.postFound = true; break; }
        }
      }
    }
    return result;
  }, (task.postText || '').trim()).catch(() => ({ formOpen: false, postFound: false }));

  if (fallback.postFound && !fallback.formOpen) {
    result.steps.publish = 'dom-confirmed';
    result.status = result.steps.image === 'failed' ? 'no-image' : 'ok';
    result.reason = result.status === 'ok' ? 'Пост опубликован (по DOM)' : 'Пост опубликован без картинки (по DOM)';
    result.durationMs = Date.now() - startedAt;
    info(`  ✅ ${label} — ${result.reason} (${(result.durationMs / 1000).toFixed(1)} сек)`);
    return result;
  }

  // Ничего не понятно — не делаем ретрай (риск дубля), помечаем как "проверьте вручную"
  result.steps.publish = 'unknown';
  result.status = 'unknown';
  result.reason = 'Публикация не подтверждена ни API, ни DOM. Проверьте вручную.';
  result.durationMs = Date.now() - startedAt;
  await takeScreenshot(`city-${taskIndex}-${task.cityName}-unknown`);
  warn(`  ⚠️ ${result.reason}`);
  return result;
};


// ========================================
// ГЛАВНАЯ ФУНКЦИЯ
// ========================================

const main = async () => {
  const startTime = Date.now();

  // Загружаем все конфиги из папки tasks/ или одного файла
  const configs = loadConfig();
  
  // Берём настройки из первого конфига (или дефолты)
  const settings = {
    ...DEFAULTS,
    delayBetweenPosts: configs[0].delayBetweenPosts || DEFAULTS.delayBetweenPosts,
    headlessMode: configs[0].headlessMode ?? DEFAULTS.headlessMode,
  };

  // Собираем общую статистику
  const totalCities = configs.reduce((sum, c) => sum + c.tasks.length, 0);

  console.log('\n' + '═'.repeat(50));
  console.log('  ЯНДЕКС.БИЗНЕС АВТОПОСТЕР v3');
  console.log('═'.repeat(50));
  console.log(`  Конфигов: ${configs.length}`);
  console.log(`  Городов всего: ${totalCities}`);
  console.log(`  Аккаунт:  ${configs[0].credentials.email}`);
  console.log(`  Задержка: ${settings.delayBetweenPosts / 1000} сек`);
  console.log(`  Браузер:  ${settings.headlessMode ? 'скрытый' : 'видимый'}`);
  console.log('═'.repeat(50) + '\n');

  // Показываем список по странам
  configs.forEach((c, idx) => {
    const label = c.country ? `${c.country} (${c.projectName || ''})` : c.projectName || '—';
    info(`📦 Пакет ${idx + 1}/${configs.length}: ${label} — ${c.tasks.length} городов`);
    c.tasks.forEach((t, i) => {
      info(`    ${i + 1}. ${t.cityName}`);
    });
  });
  console.log('');

  // Спрашиваем подтверждение
  if (process.stdin.isTTY) {
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise(resolve => {
      rl.question(`▶  Начать публикацию (${totalCities} постов)? (y/n): `, resolve);
    });
    rl.close();
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'д') {
      info('⏹  Отменено.');
      process.exit(0);
    }
  }

  let totalSuccess = 0;
  let totalNoImage = 0;
  let totalFail = 0;
  let totalUnknown = 0;
  let totalRetried = 0;
  let cooldownsUsed = 0;          // сколько раз делали паузу чтобы Яндекс остыл
  let stoppedByUser = false;
  const allResults = [];
  const processedFiles = [];
  const runStartedAt = new Date().toISOString();
  const runStartTime = Date.now();

  // ────────────────────────────────────────────────────────
  // ИНКРЕМЕНТАЛЬНЫЙ ОТЧЁТ
  // ────────────────────────────────────────────────────────
  // Раньше отчёт писался ОДИН раз в самом конце. Если процесс падал до этого
  // момента (например необработанная ошибка в браузере) — пользователь не видел
  // вообще ничего: всё сделано, а отчёта нет.
  //
  // Теперь после КАЖДОГО обработанного города мы переписываем JSON-файл
  // с накопленными результатами. Если процесс упадёт — отчёт уже на диске,
  // с фактическим прогрессом до точки падения.
  //
  // Файл инициализируется тем же именем, что и финальный отчёт, чтобы
  // в финале просто перезаписать его финальной версией.
  const reportsDir = path.join(USER_BASE, 'reports');
  try { if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true }); } catch {}
  const reportName = `report-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`;
  const reportPath = path.join(reportsDir, reportName);

  // Атомарная запись через временный файл: пишем в .tmp, потом rename.
  // Так если процесс упадёт прямо во время записи — старый файл целый,
  // а новый либо полностью записался либо его нет (нет «полу-битого» файла).
  const writeIncrementalReport = (state) => {
    try {
      // Очищаем _task из результатов (служебное поле для авто-ретрая)
      const cleanResults = allResults.map(r => {
        const copy = { ...r };
        delete copy._task;
        return copy;
      });
      const report = {
        startedAt: runStartedAt,
        finishedAt: new Date().toISOString(),
        durationSec: Math.round((Date.now() - runStartTime) / 1000),
        account: (configs[0] && configs[0].credentials && configs[0].credentials.email) || '',
        stoppedByUser,
        state: state || 'in-progress',  // 'in-progress' | 'finished' | 'crashed'
        totals: {
          total: allResults.length,
          ok: totalSuccess,
          noImage: totalNoImage,
          failed: totalFail,
          unknown: totalUnknown,
          retried: totalRetried,
          cooldowns: cooldownsUsed,
        },
        results: cleanResults,
      };
      const tmp = reportPath + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(report, null, 2), 'utf-8');
      fs.renameSync(tmp, reportPath);
    } catch (e) {
      // Не падаем из-за ошибки записи — это не критично для самой публикации
      try { console.log(`[report] не удалось записать инкрементальный отчёт: ${e.message}`); } catch {}
    }
  };

  // ────────────────────────────────────────────────────────
  // АВАРИЙНОЕ СОХРАНЕНИЕ ПРИ КРАХЕ
  // ────────────────────────────────────────────────────────
  // Если процесс падает с необработанной ошибкой — нам нужно ВСЁ РАВНО
  // сохранить отчёт с тем что успели сделать. process.on('uncaughtException')
  // ловит ошибки которые не были обёрнуты в try/catch.
  const crashHandler = (err) => {
    try {
      console.log('');
      console.log('━'.repeat(50));
      console.log(`💥 Необработанная ошибка: ${err && err.message ? err.message : err}`);
      console.log(`   Сохраняю отчёт что есть и выхожу...`);
      console.log('━'.repeat(50));
      writeIncrementalReport('crashed');
    } catch {}
    // Даём 200мс на flush stdout и выходим
    setTimeout(() => process.exit(1), 200);
  };
  process.on('uncaughtException', crashHandler);
  process.on('unhandledRejection', crashHandler);

  // Файл-флаг для мягкой остановки от UI
  const STOP_FLAG = path.join(USER_BASE, '.STOP_FLAG');
  try { fs.unlinkSync(STOP_FLAG); } catch {}

  /**
   * Проверка: пост с таким текстом УЖЕ есть на странице компании?
   * Используется перед ретраем — чтобы не публиковать дубль,
   * если первая попытка ушла на сервер несмотря на ошибку UI.
   */
  // ВАЖНО: эта функция определяет был ли пост ОПУБЛИКОВАН ТОЛЬКО ЧТО.
  // Используется во втором проходе чтобы не публиковать дубль если первая попытка
  // на самом деле прошла, просто Click не понял этого.
  //
  // КРИТИЧНО: возвращаем true ТОЛЬКО если уверены что нашли СВЕЖИЙ пост с НАШИМ текстом.
  // Если сомневаемся — возвращаем false → Click попробует опубликовать ещё раз.
  // Лучше дубль (которого не будет благодаря другим защитам) чем потерянная публикация.
  //
  // Два уровня уверенности:
  //  1) (НАДЁЖНО)  Плашка «Публикация на модерации» рядом с нашим текстом
  //     → 100% наш пост (старые посты модерацию уже прошли).
  //  2) (НАДЁЖНО)  Отметка времени «только что» / «N минут назад» рядом с нашим текстом
  //     → Тоже наш пост (модерацию уже прошёл за минуты пока шёл второй проход).
  //  3) (СОМНИТЕЛЬНО) Только текстовое совпадение, без меток свежести → НЕ помечаем.
  const checkPostAlreadyExists = async (task) => {
    try {
      // Берём более длинный фрагмент текста — 80 символов вместо 30.
      // Так меньше шансов совпасть со старым похожим постом.
      const fullText = (task.postText || '').trim();
      if (fullText.length < 20) return { found: false, fresh: false };
      const needle = fullText.slice(0, Math.min(80, fullText.length));

      return await page.evaluate((needle) => {
        // ── Маркеры свежести: метки времени в посте Яндекса ──
        // Яндекс пишет: «только что», «минуту назад», «5 минут назад», «несколько минут назад»
        // Старые посты подписаны датой типа «12 мая» или «вчера».
        const FRESH_TIME = /^(\s*(только что|меньше минуты|минут[уы]?\s+назад|\d+\s+минут[уы]?\s+назад|несколько\s+минут\s+назад)\s*)$/i;
        const isFreshTime = (t) => FRESH_TIME.test((t || '').trim());

        // ── Маркер модерации ──
        // На свежем посте Яндекс рисует плашку «Публикация на модерации».
        // Это САМЫЙ надёжный сигнал что пост только что отправлен.
        const MODERATION = /Публикация\s+на\s+модерации/i;
        const isModerationMark = (t) => MODERATION.test((t || '').trim());

        // Карточки поста — поиск по нескольким селекторам
        const posts = document.querySelectorAll('[class*="Post"], [class*="post-card"], [class*="PostsList"] [class*="card"]');

        for (const el of posts) {
          const text = el.textContent || '';
          // Текст должен содержать наши 80 символов
          if (!text.includes(needle)) continue;
          // Виден ли пост в DOM?
          const r = el.getBoundingClientRect();
          if (r.width < 100 || r.height < 50) continue;

          // Ищем внутри карточки маркеры свежести
          let hasModerationMark = false;
          let hasFreshTimeMark = false;
          const allEls = el.querySelectorAll('*');
          for (const e of allEls) {
            if (e.children.length === 0) {
              // Только листовые узлы (без вложенных) — там лежит чистый текст-метка
              const t = e.textContent;
              if (isModerationMark(t)) { hasModerationMark = true; }
              if (isFreshTime(t))      { hasFreshTimeMark = true; }
            }
            if (hasModerationMark && hasFreshTimeMark) break;
          }

          if (hasModerationMark) {
            // Самый надёжный случай — модерация
            return { found: true, fresh: true, reason: 'moderation' };
          }
          if (hasFreshTimeMark) {
            // Тоже свежий — отметка «только что / N минут назад»
            return { found: true, fresh: true, reason: 'fresh-time' };
          }
          // Текст совпал, но никаких маркеров свежести — это СТАРЫЙ пост
          return { found: true, fresh: false, reason: 'old-match' };
        }
        return { found: false, fresh: false };
      }, needle);
    } catch {
      return { found: false, fresh: false };
    }
  };

  /**
   * Опубликовать один город с автоматическим ретраем:
   * - Первая попытка — обычная
   * - Если упало с "Кнопка «Добавить пост» не найдена" — перезагружаем и пробуем ещё раз
   * - Перед ретраем проверяем что пост ещё не опубликовался (от первой попытки)
   */
  const publishWithRetry = async (task, taskIndex, totalTasks, settings) => {
    const RETRYABLE = /(Кнопка «Добавить пост» не найдена|Execution context was destroyed|Target closed|Не найдено поле для текста)/i;
    let result;

    // Попытка 1
    try {
      result = await publishToCity(task, taskIndex, totalTasks, settings);
    } catch (err) {
      result = {
        status: 'failed', reason: 'Критическая ошибка: ' + err.message,
        cityName: task.cityName, companyUrl: task.companyUrl, steps: {}, durationMs: 0,
      };
      error(`  ❌ ${task.cityName}: ${result.reason}`);
    }

    // Если в результате нет статуса — это баг. Помечаем явно.
    if (!result || !result.status) {
      result = result || {};
      result.status = 'failed';
      result.reason = result.reason || 'Неизвестное состояние (нет статуса)';
      result.cityName = task.cityName;
      result.companyUrl = task.companyUrl;
      error(`  ❌ ${task.cityName}: ${result.reason}`);
    }

    // ───────────────────────────────────────────────────
    // Если первая попытка прошла успешно — выходим
    // ───────────────────────────────────────────────────
    if (result.status === 'ok' || result.status === 'no-image') return result;

    // ───────────────────────────────────────────────────
    // Если первая попытка завершилась неопределённо ('unknown')
    // — это значит что клик «Создать» был сделан, но мы не знаем
    // подтвердил ли Яндекс публикацию. РЕТРАЙ ЗАПРЕЩЁН (риск дубля).
    // Просто возвращаем как есть — пользователь увидит в отчёте
    // и сможет проверить вручную.
    // ───────────────────────────────────────────────────
    if (result.status === 'unknown') {
      warn(`  ⚠️ [${task.cityName}] результат неопределён — ретрай ЗАПРЕЩЁН во избежание дубля`);
      return result;
    }

    // ───────────────────────────────────────────────────
    // Если ошибка не из ретраебельных (например, уже не нашли кнопку
    // «Добавить пост» или авторизация слетела) — выходим
    // ───────────────────────────────────────────────────
    if (!RETRYABLE.test(result.reason || '')) {
      if (!result._logged) error(`  ❌ ${task.cityName}: ${result.reason || 'без причины'}`);
      return result;
    }

    // ───────────────────────────────────────────────────
    // КЛЮЧЕВАЯ ПРОВЕРКА: был ли клик «Создать» в первой попытке?
    // Если да — РЕТРАЙ КАТЕГОРИЧЕСКИ ЗАПРЕЩЁН.
    // Лучше пометить как "проверьте вручную" чем создать дубль.
    // ───────────────────────────────────────────────────
    const firstClickHappened = result.steps && (
      result.steps.publish === 'clicked' ||
      result.steps.publish === 'click-error-no-api' ||
      result.steps.publish === 'unknown'
    );

    if (firstClickHappened) {
      warn(`  ⚠️ [${task.cityName}] клик «Создать» уже был сделан в первой попытке — РЕТРАЙ ЗАПРЕЩЁН во избежание дубля`);
      return {
        status: 'unknown',
        reason: 'Клик «Создать» сделан, но публикация не подтверждена. Проверьте Яндекс.Бизнес вручную — возможно пост опубликован.',
        cityName: task.cityName,
        companyUrl: task.companyUrl,
        steps: result.steps || {},
        durationMs: result.durationMs || 0,
      };
    }

    // ───────────────────────────────────────────────────
    // Клик не успел произойти — значит первая попытка упала ДО клика
    // (например, на загрузке страницы или открытии формы).
    // В этом случае ретрай безопасен — никакого дубля быть не может.
    // ───────────────────────────────────────────────────
    info(`  🔄 [${task.cityName}] первая попытка упала ДО клика «Создать» (${result.reason}). Безопасный ретрай.`);
    try {
      // Если ошибка связана с контекстом — пересоздаём страницу
      const needNewPage = /Execution context was destroyed|Target closed|Protocol error/i.test(result.reason || '');
      if (needNewPage && browser) {
        try {
          info(`  🔄 [${task.cityName}] контекст повреждён — открываю новую вкладку`);
          const newPage = await browser.newPage();
          try { await page.close(); } catch {}
          page = newPage;
          // Восстанавливаем cookies
          try {
            const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, 'utf-8'));
            await page.setCookie(...cookies);
          } catch {}
          await page.setViewport({ width: 1280, height: 800 });
          await sleep(500);
        } catch (e) {
          warn(`  ⚠️ Не удалось пересоздать страницу: ${e.message}`);
        }
      }

      // page.goto не нужен — publishToCity сам откроет правильный URL (/posts/)
      await sleep(500);

      let retryResult;
      try {
        retryResult = await publishToCity(task, taskIndex, totalTasks, settings);
      } catch (err) {
        retryResult = {
          status: 'failed', reason: 'Критическая ошибка при ретрае: ' + err.message,
          cityName: task.cityName, companyUrl: task.companyUrl, steps: {}, durationMs: 0,
        };
        error(`  ❌ [${task.cityName}] ретрай: ${retryResult.reason}`);
      }
      if (!retryResult || !retryResult.status) {
        retryResult = retryResult || {};
        retryResult.status = 'failed';
        retryResult.reason = retryResult.reason || 'Ретрай: неизвестное состояние';
        error(`  ❌ [${task.cityName}] ретрай: ${retryResult.reason}`);
      }
      if (retryResult.status === 'ok' || retryResult.status === 'no-image') {
        retryResult.retried = true;
        retryResult.firstAttemptError = result.reason;
        info(`  ✅ [${task.cityName}] удалось со 2-й попытки`);
      } else if (retryResult.status === 'failed') {
        error(`  ❌ [${task.cityName}] обе попытки провалились: ${retryResult.reason}`);
      }
      return retryResult;
    } catch (e) {
      result.reason = 'Ретрай невозможен: ' + e.message;
      error(`  ❌ [${task.cityName}] ${result.reason}`);
      return result;
    }
  };

  try {
    await initBrowser(settings.headlessMode);
    await login(configs[0].credentials.email, configs[0].credentials.password);

    // ──────────────────────────────────────────────────────
    // ПРОВЕРКА СООТВЕТСТВИЯ АККАУНТА ПРОЕКТУ
    // ──────────────────────────────────────────────────────
    // Защита от случайной публикации не с того аккаунта.
    // Получаем email который сейчас залогинен в Яндексе и сравниваем с ожидаемым.
    const expectedEmail = (configs[0].credentials.email || '').toLowerCase().trim();
    if (expectedEmail) {
      let actualEmail = null;
      try {
        await page.goto('https://passport.yandex.ru/profile', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await sleep(1500);
        actualEmail = await page.evaluate(() => {
          // Яндекс показывает email на странице профиля
          const text = document.body.textContent || '';
          const match = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
          return match ? match[0].toLowerCase().trim() : null;
        });
      } catch (e) {
        warn(`⚠️ Не удалось получить текущий email Яндекса: ${e.message}`);
      }

      if (actualEmail && actualEmail !== expectedEmail) {
        const projName = process.env.CLICK_PROJECT || 'текущего проекта';
        error('');
        error('═'.repeat(60));
        error(`❌ ОСТАНОВКА: В Яндексе залогинен НЕ ТОТ аккаунт!`);
        error('═'.repeat(60));
        error(`   Проект ${projName} ожидает аккаунт: ${expectedEmail}`);
        error(`   А сейчас залогинен:                ${actualEmail}`);
        error('');
        error(`   Это защита от публикации не с того аккаунта.`);
        error(`   Чтобы исправить:`);
        error(`     1. Закройте этот процесс (или подождите завершения)`);
        error(`     2. Во вкладке «Запуск» нажмите «🚪 Выйти из Яндекса»`);
        error(`     3. Войдите заново под нужным аккаунтом ${expectedEmail}`);
        error('═'.repeat(60));
        error('');
        try { await saveCookies(); } catch {}
        await closeBrowser();
        process.exit(2);
      } else if (actualEmail) {
        info(`✓ Аккаунт совпадает: ${actualEmail}`);
      }
    }

    // ────────────────────────────────────────────────────────
    // ДЕТЕКТОР МЕДЛЕННОЙ РАБОТЫ ЯНДЕКСА
    // ────────────────────────────────────────────────────────
    // Когда Яндекс начинает тормозить (антифлуд, нагрузка на сервера),
    // публикация одного города может занимать 2-3 минуты вместо 10 секунд.
    // Если мы видим что подряд несколько городов идут долго —
    // даём Яндексу «остыть» паузой 30 секунд. Часто это сильно помогает.
    //
    // Это работает только как дополнение: ничего в логике публикации не меняется,
    // никаких пропусков городов. Только дополнительная пауза если плохо.
    const recentDurations = [];     // длительности последних N городов в мс
    const SLOW_WINDOW = 3;          // смотрим окно из 3 городов
    const SLOW_THRESHOLD = 60000;   // 60 сек на город — это уже медленно
    const COOLDOWN_PAUSE = 30000;   // пауза 30 сек чтобы Яндекс остыл

    // ────────────────────────────────────────────────────────
    // ДЕТЕКТОР ЗАВИСШЕГО БРАУЗЕРА
    // ────────────────────────────────────────────────────────
    // Если несколько городов подряд падают с `Runtime.callFunctionOn timed out`
    // или `protocolTimeout` — Chrome завис (антифлуд Яндекса, кончилась память,
    // глючит вкладка). Дальнейшие попытки бессмысленны — каждый город отжирает
    // несколько минут. Решение — перезапустить браузер целиком.
    let consecutiveProtocolFails = 0;
    const PROTOCOL_FAIL_RX = /Runtime\.callFunctionOn timed out|protocolTimeout|Target closed|Session closed/i;

    // Стартовая запись отчёта — даже до первого города.
    // Чтобы UI сразу увидел что прогон начался и где будет отчёт.
    writeIncrementalReport('in-progress');

    outer: for (let cfgIdx = 0; cfgIdx < configs.length; cfgIdx++) {
      const config = configs[cfgIdx];
      const pkgLabel = config.country ? `${config.country}` : `Пакет ${cfgIdx + 1}`;
      console.log('\n' + '━'.repeat(50));
      info(`📦 ПАКЕТ ${cfgIdx + 1}/${configs.length}: ${pkgLabel} (${config.tasks.length} городов)`);
      console.log('━'.repeat(50));

      for (let i = 0; i < config.tasks.length; i++) {
        // Проверка STOP-флага перед каждым городом
        if (fs.existsSync(STOP_FLAG)) {
          stoppedByUser = true;
          info(`\n⏹  Получен сигнал остановки — завершаю работу`);
          break outer;
        }

        const task = config.tasks[i];
        const cityResult = await publishWithRetry(task, i, config.tasks.length, settings);
        cityResult.package = pkgLabel;
        cityResult.country = config.country;
        cityResult._task = task; // для авто-ретрая в конце прогона
        allResults.push(cityResult);

        // ── ДОПОЛНИТЕЛЬНЫЙ ШАГ: загрузка фото в раздел «Товары» ──
        // Выполняется только если:
        //   а) у задачи есть task.productPhotos (массив URL)
        //   б) пост успешно опубликован (status === 'ok' или 'no-image')
        // Если этот шаг упадёт — НЕ влияет на статус публикации.
        const shouldUploadPhotos = Array.isArray(task.productPhotos)
          && task.productPhotos.length > 0
          && (cityResult.status === 'ok' || cityResult.status === 'no-image');

        if (shouldUploadPhotos) {
          try {
            const photoResult = await uploadProductPhotos(task, task.productPhotos);
            cityResult.productPhotos = {
              requested: task.productPhotos.length,
              uploaded: photoResult.uploaded,
              failed: photoResult.failed,
              errors: photoResult.errors,
            };
          } catch (e) {
            warn(`  ⚠️ Загрузка фото в «Товары» упала с ошибкой: ${e.message}`);
            cityResult.productPhotos = {
              requested: task.productPhotos.length,
              uploaded: 0,
              failed: task.productPhotos.length,
              errors: [e.message],
            };
          }
        }

        // Гарантированный итог: точно знаем что для каждого города в логе есть результат
        const cityLabel = `[${i + 1}/${config.tasks.length}] ${task.cityName}`;
        const dur = cityResult.durationMs ? ` (${(cityResult.durationMs / 1000).toFixed(1)} сек)` : '';
        const photosNote = cityResult.productPhotos
          ? ` + 📸 ${cityResult.productPhotos.uploaded}/${cityResult.productPhotos.requested} фото`
          : '';
        if (cityResult.status === 'ok') {
          info(`  ✅ ИТОГ ${cityLabel}: ${cityResult.reason || 'Опубликован'}${photosNote}${dur}`);
          totalSuccess++;
        } else if (cityResult.status === 'no-image') {
          warn(`  🟡 ИТОГ ${cityLabel}: ${cityResult.reason || 'Без картинки'}${photosNote}${dur}`);
          totalNoImage++;
        } else if (cityResult.status === 'unknown') {
          warn(`  ⚠️ ИТОГ ${cityLabel}: ${cityResult.reason || 'Неопределённо'}${dur}`);
          totalUnknown++;
        } else {
          error(`  ❌ ИТОГ ${cityLabel}: ${cityResult.reason || 'Неизвестная ошибка'}${dur}`);
          totalFail++;
        }
        if (cityResult.retried) totalRetried++;

        // Сохраняем инкрементальный отчёт — после КАЖДОГО города.
        // Если процесс упадёт дальше — у пользователя будет отчёт со всем что успели.
        writeIncrementalReport('in-progress');

        // ─── Детектор зависшего браузера ───
        // Если города падают подряд с одной и той же ошибкой `Runtime.callFunctionOn timed out` —
        // это значит Chrome завис. Каждый следующий город тоже отвалится по таймауту.
        // Решение — перезапустить браузер целиком.
        if (cityResult.status === 'failed' && PROTOCOL_FAIL_RX.test(cityResult.reason || '')) {
          consecutiveProtocolFails++;
          if (consecutiveProtocolFails >= 3) {
            warn('');
            warn('━'.repeat(50));
            warn(`💀 Браузер завис: 3 города подряд упали с ошибкой "Runtime.callFunctionOn timed out".`);
            warn(`   Перезапускаю браузер чтобы не терять ещё кучу времени...`);
            warn('━'.repeat(50));
            try { await closeBrowser(); } catch {}
            await sleep(3000);
            try {
              await initBrowser(settings.headlessMode);
              info(`✅ Браузер перезапущен. Продолжаю публикацию.`);
              consecutiveProtocolFails = 0;
            } catch (e) {
              error(`❌ Не удалось перезапустить браузер: ${e.message}`);
              error(`   Остановка процесса. Откройте отчёт чтобы увидеть что успели сделать.`);
              break outer;
            }
          }
        } else {
          // Город прошёл нормально (или с другой ошибкой) — счётчик сбрасываем
          consecutiveProtocolFails = 0;
        }

        // Пауза между городами — уменьшена с 10 до 5 сек
        if (i < config.tasks.length - 1) {
          const pause = settings.delayBetweenPosts || 3000;
          info(`⏱️  Пауза ${pause / 1000} сек...`);
          await sleep(pause);
        }

        // ─── Детектор медленности Яндекса ───
        // Записываем длительность этого города в скользящее окно.
        // Если медиана последних N городов выше порога — Яндекс тормозит,
        // даём ему остыть. Эта пауза не заменяет обычную, она ДОПОЛНИТЕЛЬНО.
        if (typeof cityResult.durationMs === 'number' && cityResult.durationMs > 0) {
          recentDurations.push(cityResult.durationMs);
          if (recentDurations.length > SLOW_WINDOW) recentDurations.shift();
        }
        if (recentDurations.length === SLOW_WINDOW && i < config.tasks.length - 1) {
          const sorted = [...recentDurations].sort((a, b) => a - b);
          const median = sorted[Math.floor(SLOW_WINDOW / 2)];
          if (median > SLOW_THRESHOLD) {
            cooldownsUsed++;
            warn(`🐢 Яндекс тормозит (медиана последних ${SLOW_WINDOW} городов = ${Math.round(median / 1000)} сек). Пауза ${COOLDOWN_PAUSE / 1000} сек чтобы остыл...`);
            await sleep(COOLDOWN_PAUSE);
            // После cooldown очищаем окно — даём шанс на «свежий старт»
            recentDurations.length = 0;
          }
        }
      }
      processedFiles.push(config._sourceFile);
      if (cfgIdx < configs.length - 1) {
        info(`\n⏸  Пауза между странами — 3 сек...`);
        await sleep(3000);
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // ВТОРОЙ ПРОХОД ПО ОШИБКАМ — авто-ретрай неудачных городов
    // ═══════════════════════════════════════════════════════════════
    // Собираем все города со статусом failed/unknown в очередь и пробуем ещё раз.
    // Перед каждым ретраем — проверяем что в Яндексе нет уже-опубликованного поста
    // (чтобы не создать дубль).
    if (!stoppedByUser) {
      const failedCities = allResults.filter(r => r.status === 'failed' || r.status === 'unknown');
      if (failedCities.length > 0) {
        info(`\n${'═'.repeat(50)}`);
        info(`🔁 ВТОРОЙ ПРОХОД ПО ОШИБКАМ: ${failedCities.length} городов`);
        info(`${'═'.repeat(50)}`);

        for (let i = 0; i < failedCities.length; i++) {
          if (fs.existsSync(STOP_FLAG)) {
            info(`⏹  Получен сигнал остановки — прерываю второй проход`);
            stoppedByUser = true;
            break;
          }

          const failed = failedCities[i];
          const task = failed._task;
          if (!task) continue;

          info(`\n🔁 [${i + 1}/${failedCities.length}] ${task.cityName} (${failed.country}) — повторная попытка...`);

          // ── ШАГ 1: Идём на страницу постов и проверяем не появился ли пост ──
          let alreadyPublished = false;     // true → точно есть СВЕЖИЙ пост = безопасно отметить как успех
          let freshMarker = '';             // 'moderation' или 'fresh-time' — для лога
          let suspiciousOldMatch = false;   // true → есть текстовое совпадение, но пост НЕ свежий
          try {
            const cId = task.companyId || extractCompanyId(task.companyUrl);
            // ВАЖНО: используем правильный URL — /edit/posts/ или /p/edit/posts/
            // (если делать просто /sprav/{id}/posts/ — Яндекс отдаст 404)
            const postsUrl = buildPostsUrl(task.companyUrl, cId) || task.companyUrl;
            await page.goto(postsUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
            await sleep(3500);

            // Тщательная проверка: 3 попытки с паузами
            for (let attempt = 0; attempt < 3; attempt++) {
              const exists = await checkPostAlreadyExists(task);
              // ВАЖНО: помечаем как «уже опубликован» ТОЛЬКО если пост действительно СВЕЖИЙ
              // — есть плашка «Публикация на модерации» или метка «только что» / «N минут назад».
              // Без этих маркеров мы можем спутать с ПРОШЛОЙ публикацией.
              if (exists && exists.found && exists.fresh) {
                alreadyPublished = true;
                freshMarker = exists.reason || '';
                break;
              }
              if (exists && exists.found && !exists.fresh) {
                // Текст совпал, но никаких меток свежести → это СТАРАЯ публикация
                suspiciousOldMatch = true;
              }
              await sleep(2500);
            }
          } catch (e) {
            warn(`  ⚠️ Не удалось проверить наличие поста: ${e.message}`);
          }

          if (alreadyPublished) {
            // Пост УЖЕ есть и он СВЕЖИЙ — обновляем результат, не публикуем
            const markerText = freshMarker === 'moderation' ? 'плашка «Публикация на модерации»'
                             : freshMarker === 'fresh-time' ? 'метка «только что / минуту назад»'
                             : 'свежий пост';
            info(`  ✅ ${task.cityName}: ${markerText} в ленте — статус обновлён`);
            const idx = allResults.findIndex(r => r === failed);
            if (idx >= 0) {
              allResults[idx] = {
                ...failed,
                status: 'ok',
                reason: `Свежий пост найден в ленте (${markerText})`,
                retried: true,
                durationMs: failed.durationMs || 0,
              };
              if (failed.status === 'failed') totalFail--;
              if (failed.status === 'unknown') totalUnknown--;
              totalSuccess++;
              totalRetried++;
            }
            writeIncrementalReport('in-progress');
            continue;
          }

          if (suspiciousOldMatch) {
            // ВАЖНО: в ленте есть пост с тем же текстом, но он НЕ помечен как свежий.
            // Это означает что нашли СТАРУЮ публикацию, а сегодняшняя — НЕ прошла.
            // Логируем чтобы пользователь увидел и продолжаем как обычно — попробуем опубликовать ещё раз.
            warn(`  ⚠️ ${task.cityName}: в ленте есть старый пост с похожим текстом, но НЕ свежий. Это НЕ сегодняшняя публикация — попробую ещё раз.`);
          }

          // ── ШАГ 2: Поста нет — переинициализируем страницу и пробуем ещё раз ──
          // Закрываем текущую страницу (если она в плохом состоянии) и открываем новую
          try {
            // Создаём НОВУЮ вкладку, закрываем старую — это сбрасывает любые подвисшие контексты
            const newPage = await browser.newPage();
            try { await page.close(); } catch {}
            page = newPage;
            // Восстанавливаем cookies
            try {
              const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, 'utf-8'));
              await page.setCookie(...cookies);
            } catch {}
            await page.setViewport({ width: 1280, height: 800 });
          } catch (e) {
            warn(`  ⚠️ Не удалось переинициализировать страницу: ${e.message}`);
          }

          // Публикуем
          let retryResult;
          try {
            retryResult = await publishToCity(task, i, failedCities.length, settings);
          } catch (err) {
            retryResult = {
              status: 'failed',
              reason: 'Критическая ошибка при втором проходе: ' + err.message,
              cityName: task.cityName, companyUrl: task.companyUrl, steps: {}, durationMs: 0,
            };
          }

          // Обновляем результат
          const idx = allResults.findIndex(r => r === failed);
          if (idx >= 0) {
            // Обновляем счётчики
            if (failed.status === 'failed') totalFail--;
            if (failed.status === 'unknown') totalUnknown--;

            if (retryResult.status === 'ok') {
              info(`  ✅ ${task.cityName}: опубликован со 2-го прохода`);
              totalSuccess++;
              totalRetried++;
              retryResult.retried = true;
              retryResult.firstAttemptError = failed.reason;
            } else if (retryResult.status === 'no-image') {
              info(`  🟡 ${task.cityName}: опубликован без картинки со 2-го прохода`);
              totalNoImage++;
              totalRetried++;
              retryResult.retried = true;
            } else if (retryResult.status === 'unknown') {
              warn(`  ⚠️ ${task.cityName}: всё ещё неопределённо — проверьте вручную`);
              totalUnknown++;
            } else {
              error(`  ❌ ${task.cityName}: и второй проход не помог — ${retryResult.reason}`);
              totalFail++;
            }

            // Сохраняем _task в новом результате чтобы не терять его
            retryResult._task = task;
            retryResult.country = failed.country;
            retryResult.package = failed.package;
            allResults[idx] = retryResult;
          }

          // Сохраняем инкрементальный отчёт после каждого города во 2-м проходе
          writeIncrementalReport('in-progress');

          // Пауза между ретраями
          if (i < failedCities.length - 1) {
            await sleep(settings.delayBetweenPosts || 3000);
          }
        }

        info(`\n🔁 Второй проход завершён`);
      }
    }
  } catch (err) {
    error(`❌ Критическая ошибка: ${err.message}`, { stack: err.stack });
  } finally {
    try { fs.unlinkSync(STOP_FLAG); } catch {}
    await closeBrowser();
    cleanupTemp();
  }

  // Архивируем обработанные JSON
  try {
    if (processedFiles.length > 0) {
      const doneDir = path.join(USER_BASE, 'tasks', 'done');
      if (!fs.existsSync(doneDir)) fs.mkdirSync(doneDir, { recursive: true });
      processedFiles.forEach(f => {
        try { fs.renameSync(f, path.join(doneDir, path.basename(f))); } catch {}
      });
      info(`\n📁 Файлы перемещены в tasks/done/`);
    }
  } catch {}

  // Пишем JSON-отчёт для UI (финальная версия — перезаписываем последнее инкрементальное состояние)
  const duration = ((Date.now() - startTime) / 1000).toFixed(0);
  // Очищаем _task из результатов перед сохранением (это служебное поле для авто-ретрая)
  const cleanResults = allResults.map(r => {
    const copy = { ...r };
    delete copy._task;
    return copy;
  });

  const report = {
    startedAt: runStartedAt,
    finishedAt: new Date().toISOString(),
    durationSec: Number(duration),
    account: configs[0].credentials.email,
    stoppedByUser,
    state: 'finished',
    totals: {
      total: allResults.length,
      ok: totalSuccess,
      noImage: totalNoImage,
      failed: totalFail,
      unknown: totalUnknown,
      retried: totalRetried,
      cooldowns: cooldownsUsed,
    },
    results: cleanResults,
  };
  try {
    const tmp = reportPath + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(report, null, 2), 'utf-8');
    fs.renameSync(tmp, reportPath);
  } catch {}

  // Снимаем crash-handler — публикация прошла нормально, в нём больше нет смысла
  try { process.off('uncaughtException', crashHandler); } catch {}
  try { process.off('unhandledRejection', crashHandler); } catch {}

  // Дублирую финальные итоги через info() чтобы они были видны в файле лога,
  // а не только в stdout. Это помогает диагностировать прогоны постфактум.
  info(`\n═══════════ ИТОГИ ПУБЛИКАЦИИ ═══════════`);
  info(`  ✅ Успешно:        ${totalSuccess}`);
  info(`  🖼️  Без картинки:   ${totalNoImage}`);
  info(`  ⚠️  Проверьте:      ${totalUnknown}`);
  info(`  ❌ Ошибок:         ${totalFail}`);
  info(`  ⏱️  Время:          ${duration} сек`);
  info(`  📄 Отчёт сохранён: ${reportPath}`);
  info(`══════════════════════════════════════════`);

  console.log('\n' + '═'.repeat(50));
  console.log('  ИТОГИ ПУБЛИКАЦИИ');
  console.log('═'.repeat(50));
  console.log(`  ✅ Успешно:        ${totalSuccess}`);
  console.log(`  🖼️  Без картинки:   ${totalNoImage}`);
  console.log(`  ⚠️  Проверьте:      ${totalUnknown}`);
  console.log(`  ❌ Ошибок:         ${totalFail}`);
  console.log(`  ⏱️  Время:          ${duration} сек`);
  console.log(`  📄 Отчёт:          ${reportName}`);
  console.log('─'.repeat(50));

  const byPackage = {};
  allResults.forEach(r => {
    if (!byPackage[r.package]) byPackage[r.package] = [];
    byPackage[r.package].push(r);
  });
  Object.entries(byPackage).forEach(([pkg, results]) => {
    console.log(`\n  📦 ${pkg}:`);
    results.forEach(r => {
      const icon = r.status === 'ok' ? '✅' : r.status === 'no-image' ? '🖼️' : r.status === 'unknown' ? '⚠️' : '❌';
      const suffix = r.status !== 'ok' ? ` — ${r.reason || ''}` : '';
      console.log(`     ${icon} ${r.cityName}${suffix}`);
    });
  });
  console.log('\n' + '═'.repeat(50) + '\n');

  process.exit(totalFail > 0 ? 1 : 0);
};

// ========================================
// ПОМОЩНИКИ
// ========================================

function extractCompanyId(url) {
  const match = url.match(/sprav\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Строит правильный URL раздела «Посты» карточки Яндекс.Бизнес,
 * сохраняя формат исходного URL (со /p/ или без).
 *
 * Примеры:
 *   https://yandex.ru/sprav/40691746/edit/posts/         → https://yandex.ru/sprav/40691746/edit/posts/
 *   https://yandex.ru/sprav/188702920373/p/edit/posts/   → https://yandex.ru/sprav/188702920373/p/edit/posts/
 *   https://yandex.ru/sprav/40691746/edit/photos/        → https://yandex.ru/sprav/40691746/edit/posts/
 *   https://yandex.ru/sprav/188702920373/p/edit/         → https://yandex.ru/sprav/188702920373/p/edit/posts/
 *
 * Если задан только companyId и нет companyUrl — возвращает URL с /p/edit/ (новый формат).
 *
 * Никогда не возвращает /sprav/{id}/posts/ — это путь который НЕ существует и даёт 404.
 */
function buildPostsUrl(companyUrl, companyId) {
  // Пытаемся восстановить из исходного URL
  if (companyUrl) {
    // Ищем /sprav/ID/(p/)?edit/...
    const m = companyUrl.match(/^(https?:\/\/[^\/]+\/sprav\/\d+\/(?:p\/)?edit)\b/);
    if (m) {
      return m[1] + '/posts/';
    }
    // Fallback — если companyUrl задан, но не матчится — пробуем sprav/ID
    const idM = companyUrl.match(/^(https?:\/\/[^\/]+\/sprav\/\d+)/);
    if (idM) {
      // Не знаем какой формат — даём более частый «новый» с /p/
      return idM[1] + '/p/edit/posts/';
    }
  }
  // Только companyId — собираем «новый формат»
  if (companyId) {
    return `https://yandex.ru/sprav/${companyId}/p/edit/posts/`;
  }
  return null;
}

// ========================================
// ОБРАБОТЧИКИ СИГНАЛОВ
// ========================================

process.on('SIGINT', async () => {
  warn('\n⚠️  Прервано пользователем (Ctrl+C)');
  await closeBrowser();
  cleanupTemp();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeBrowser();
  cleanupTemp();
  process.exit(0);
});

// ========================================
// ЗАПУСК
// ========================================

// Режим "только логин" — для предварительной авторизации
if (process.argv.includes('--logout')) {
  // Режим: открыть браузер на passport.yandex.ru/passport?mode=passport (страница со списком аккаунтов)
  // Пользователь сам выходит из аккаунта в открытом окне. Когда закрывает окно браузера —
  // мы удаляем cookies проекта и завершаемся.
  (async () => {
    console.log('\n' + '═'.repeat(50));
    console.log('  РЕЖИМ: Выход из Яндекса');
    console.log('═'.repeat(50));
    if (process.env.CLICK_PROJECT) {
      console.log(`  Проект: ${process.env.CLICK_PROJECT}`);
    }
    console.log('  В открывшемся окне:');
    console.log('  1. Нажмите на свою аватарку справа сверху');
    console.log('  2. Выберите "Выйти из аккаунта" (или "Выйти со всех устройств")');
    console.log('  3. Закройте окно браузера');
    console.log('  Click удалит сохранённые cookies и сессию проекта.\n');

    try {
      await initBrowser(false);
      // Открываем страницу со списком аккаунтов
      try {
        await page.goto('https://passport.yandex.ru/profile', { waitUntil: 'domcontentloaded', timeout: 30000 });
      } catch {
        // Если профиль недоступен — открываем главную passport
        try {
          await page.goto('https://passport.yandex.ru/', { waitUntil: 'domcontentloaded', timeout: 30000 });
        } catch {}
      }

      info('🌐 Окно открыто. Выйдите из аккаунта вручную и закройте окно браузера.');
      info('   Жду пока вы не закроете окно (макс 5 минут)...');

      // Ждём пока пользователь закроет окно браузера
      const start = Date.now();
      while (Date.now() - start < 5 * 60 * 1000) {
        try {
          // Проверяем что браузер ещё жив
          const pages = await browser.pages();
          if (!pages || pages.length === 0) break;
          // Если page закрыта — выходим
          if (page.isClosed && page.isClosed()) break;
        } catch (e) {
          // Браузер закрыт пользователем — это и есть сигнал
          break;
        }
        await new Promise(r => setTimeout(r, 1500));
      }

      info('✓ Окно браузера закрыто.');
    } catch (e) {
      warn(`Ошибка при открытии браузера: ${e.message}`);
    }

    // Удаляем cookies и данные браузера проекта
    try {
      if (fs.existsSync(COOKIES_PATH)) {
        fs.unlinkSync(COOKIES_PATH);
        info(`🗑 Файл cookies удалён: ${COOKIES_PATH}`);
      }
    } catch (e) {
      warn(`Не удалось удалить cookies: ${e.message}`);
    }

    // Удаляем userDataDir (там тоже сохранённая сессия Chrome)
    try {
      if (fs.existsSync(USER_DATA_DIR)) {
        fs.rmSync(USER_DATA_DIR, { recursive: true, force: true });
        info(`🗑 Папка сессии браузера удалена: ${USER_DATA_DIR}`);
      }
    } catch (e) {
      warn(`Не удалось удалить папку сессии: ${e.message}. Это не страшно — браузер всё равно перезапустится.`);
    }

    info('\n✅ Готово. Из Яндекса вы вышли — при следующем входе нужно будет залогиниться заново.\n');

    try { await closeBrowser(); } catch {}
    process.exit(0);
  })();
} else if (process.argv.includes('--login')) {
  (async () => {
    console.log('\n' + '═'.repeat(50));
    console.log('  РЕЖИМ: Только авторизация');
    console.log('═'.repeat(50));
    if (process.env.CLICK_PROJECT) {
      console.log(`  Проект: ${process.env.CLICK_PROJECT}`);
    }
    console.log('  Залогиньтесь один раз — сессия сохранится.');
    console.log('  Следующие запуски пойдут без 2FA.\n');

    let email = null;
    let password = null;

    // Пытаемся найти credentials в папке проекта (НЕ обязательно — если нет, откроем браузер «пустой»)
    try {
      const tasksDir = path.join(USER_BASE, 'tasks');
      let foundPath = null;

      if (fs.existsSync(tasksDir) && fs.statSync(tasksDir).isDirectory()) {
        const files = fs.readdirSync(tasksDir).filter(f => f.endsWith('.json') && !f.startsWith('.')).sort();
        if (files.length > 0) foundPath = path.join(tasksDir, files[0]);
      }
      // Старый формат — tasks.json в корне (для совместимости)
      if (!foundPath && fs.existsSync(path.join(USER_BASE, 'tasks.json'))) {
        foundPath = path.join(USER_BASE, 'tasks.json');
      }

      if (foundPath) {
        const config = JSON.parse(fs.readFileSync(foundPath, 'utf-8'));
        if (config.credentials && config.credentials.email) {
          email = config.credentials.email;
          password = config.credentials.password;
          info(`Учётные данные взяты из: ${path.basename(foundPath)}`);
        }
      }
    } catch (e) {
      warn(`Не удалось прочитать credentials: ${e.message}`);
    }

    if (!email) {
      info('💡 Credentials не найдены — открываю чистый браузер.');
      info('   Введите логин/пароль/2FA в окне Яндекса — сессия сохранится.');
    }

    try {
      await initBrowser(false);
      if (email && password) {
        await login(email, password);
      } else {
        // Без credentials — просто открываем passport и ждём пока юзер залогинится сам
        info('\n🌐 Открываю passport.yandex.ru...');
        await page.goto('https://passport.yandex.ru/', { waitUntil: 'domcontentloaded', timeout: 30000 });
        info('   Войдите в Яндекс в открывшемся окне.');
        info('   Когда увидите главную страницу Яндекса — окно можно закрыть, cookies сохранятся.');

        // Ждём пока пользователь залогинится (макс 5 минут)
        const startWait = Date.now();
        let loggedIn = false;
        while (Date.now() - startWait < 5 * 60 * 1000) {
          try {
            const cookies = await page.cookies('https://yandex.ru');
            if (cookies.some(c => c.name === 'Session_id' || c.name === 'yandex_login')) {
              loggedIn = true;
              break;
            }
          } catch {}
          await sleep(2000);
        }

        if (loggedIn) {
          // Сохраняем cookies
          try {
            const allCookies = await page.cookies();
            fs.writeFileSync(COOKIES_PATH, JSON.stringify(allCookies, null, 2));
            info(`✅ Сессия сохранена (${allCookies.length} cookies)`);
          } catch (e) {
            error(`❌ Не сохранить cookies: ${e.message}`);
          }
        } else {
          warn('⚠️ Время ожидания истекло — вход не выполнен.');
        }
      }

      info('\n✅ Готово! Теперь можете запустить публикацию.');
      info('   Сессия сохранена, 2FA не потребуется.\n');
    } catch (e) {
      error(`❌ Ошибка авторизации: ${e.message}`);
    }

    await sleep(3000);
    await closeBrowser();
    process.exit(0);
  })();
} else {
  main();
}
