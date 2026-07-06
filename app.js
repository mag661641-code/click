#!/usr/bin/env node
/**
 * Click v5.9.0 —�� UNIFIED SPA
 * node app.js → одно окно в браузере, без терминала
 * localhost:3847
 */

const http = require('http');
const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const projects = require('./projects.js');

const PORT = 3847;
const ROOT = __dirname;

// ── HELPERS: парсинг cookie из заголовка ────────────────
const parseCookies = (req) => {
  const cookies = {};
  const header = req.headers.cookie;
  if (!header) return cookies;
  header.split(';').forEach(part => {
    const eq = part.indexOf('=');
    if (eq > 0) {
      const k = part.slice(0, eq).trim();
      const v = part.slice(eq + 1).trim();
      cookies[k] = v;
    }
  });
  return cookies;
};

const getCurrentProject = (req) => {
  const sid = parseCookies(req).click_session;
  if (!sid) return null;
  return projects.validateSession(sid);  // вернёт projectId или null
};

const setSessionCookie = (res, sessionId) => {
  // 7 дней. HttpOnly чтобы JS клиента не мог читать (защита от XSS).
  // SameSite=Lax — стандартная защита от CSRF.
  res.setHeader('Set-Cookie', `click_session=${sessionId}; Path=/; Max-Age=${7 * 24 * 60 * 60}; HttpOnly; SameSite=Lax`);
};

const clearSessionCookie = (res) => {
  res.setHeader('Set-Cookie', 'click_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax');
};


// ── FS HELPERS ──────────────────────────────────────────
const ensureDir = (p) => { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); };
const hasDeps = () => fs.existsSync(path.join(ROOT, 'node_modules', 'puppeteer'));

// ── USER-SCOPED PATHS ────────────────────────────────────
// Каждый пользователь работает в своей папке: users-data/{username}/
// Внутри: tasks/, session/, reports/, logs/, tasks-actualize/, reports-actualize/
//
// Сложилась обратная совместимость: если пользователя нет (старая версия Click без логинов),
// используем корневые папки tasks/ session/ как раньше.
const getProjectBase = (username) => {
  if (!username) return ROOT;
  const dirName = username.replace(/[^\w\-\.\u0400-\u04FF]/g, '_');
  const dir = path.join(ROOT, 'users-data', dirName);
  ensureDir(dir);
  return dir;
};
const projectPath = (username, ...parts) => path.join(getProjectBase(username), ...parts);

const hasValidSession = (username) => {
  try {
    const cookiePath = projectPath(username, 'session', 'cookies.json');
    if (!fs.existsSync(cookiePath)) return false;
    const cookies = JSON.parse(fs.readFileSync(cookiePath, 'utf-8'));
    if (!Array.isArray(cookies) || cookies.length === 0) return false;
    return cookies.some(c => c.name === 'Session_id' || c.name === 'yandexuid');
  } catch { return false; }
};

const getTaskFiles = (username) => {
  const dir = projectPath(username, 'tasks');
  ensureDir(dir);
  return fs.readdirSync(dir).filter(f => f.endsWith('.json') && !f.startsWith('.')).sort();
};
const getDoneFiles = (username) => {
  const dir = projectPath(username, 'tasks', 'done');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
};
const getLogFiles = (username) => {
  const dir = projectPath(username, 'logs');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.log')).sort().reverse();
};
const getReports = (username) => {
  const dir = projectPath(username, 'reports');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.startsWith('report-') && f.endsWith('.json')).sort().reverse();
};
const readJSON = (fp) => { try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return null; } };

// ── PROCESS STATE ───────────────────────────────────────
let runningProcess = null;
let processLog = [];
let processStatus = 'idle';
let processAction = null;

// ── HTTP HELPERS ────────────────────────────────────────
const send = (res, code, type, body) => {
  res.writeHead(code, { 'Content-Type': type + '; charset=utf-8' });
  res.end(body);
};
const sendJSON = (res, obj, code = 200) => send(res, code, 'application/json', JSON.stringify(obj));
const sendText = (res, text, code = 200) => send(res, code, 'text/plain', text);
const readBody = (req) => new Promise((resolve, reject) => {
  const chunks = [];
  req.on('data', c => chunks.push(c));
  req.on('end', () => {
    try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf-8') || '{}')); }
    catch (e) { reject(e); }
  });
  req.on('error', reject);
});
const safeFilename = (s) => String(s).replace(/[^a-zA-Zа-яА-Я0-9._-]/g, '_').slice(0, 80);

// ── ROUTES ──────────────────────────────────────────────
const handleRoute = async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const p = url.pathname;

  if (p === '/' || p === '/index.html') {
    return send(res, 200, 'text/html', buildHTML());
  }

  // ═══════════════════════════════════════════════════════════════
  // PROJECTS — публичные эндпоинты (не требуют входа)
  // ═══════════════════════════════════════════════════════════════

  if (p === '/api/projects/list' && req.method === 'GET') {
    // Список 3 проектов для экрана выбора
    return sendJSON(res, { projects: projects.listProjectsPublic() });
  }

  if (p === '/api/projects/login' && req.method === 'POST') {
    // Вход в проект: { projectId, password }
    const body = await readBody(req);
    const result = projects.loginProject(body.projectId, body.password);
    if (result.error) return sendJSON(res, { error: result.error }, 401);
    setSessionCookie(res, result.sessionId);
    return sendJSON(res, { ok: true, project: result.project });
  }

  if (p === '/api/auth/state' && req.method === 'GET') {
    // Текущее состояние: какой проект активен (или null)
    const projectId = getCurrentProject(req);
    const projectData = projectId ? projects.getProjectPublic(projectId) : null;
    return sendJSON(res, {
      currentProjectId: projectId,
      project: projectData,
    });
  }

  if (p === '/api/auth/logout' && req.method === 'POST') {
    const sid = parseCookies(req).click_session;
    if (sid) projects.destroySession(sid);
    clearSessionCookie(res);
    return sendJSON(res, { ok: true });
  }

  // ═══════════════════════════════════════════════════════════════
  // AUTH GUARD — все остальные эндпоинты требуют активного проекта
  // ═══════════════════════════════════════════════════════════════
  // Исключение: /api/status можно дёргать без логина, чтобы клиент мог опросить
  // состояние сервера до выбора проекта.

  const currentProjectId = getCurrentProject(req);
  const isPublicEndpoint = p === '/api/status';
  if (p.startsWith('/api/') && !isPublicEndpoint && !currentProjectId) {
    return sendJSON(res, { error: 'Не авторизован', needLogin: true }, 401);
  }

  if (p === '/api/status') {
    return sendJSON(res, {
      deps: hasDeps(),
      session: hasValidSession(currentProjectId),
      tasks: getTaskFiles(currentProjectId).length,
      done: getDoneFiles(currentProjectId).length,
      logs: getLogFiles(currentProjectId).length,
      reports: getReports(currentProjectId).length,
      process: { status: processStatus, action: processAction },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // Серверное хранение настроек проекта (страны, города, шаблоны)
  // Раньше хранилось в localStorage браузера → каждый компьютер имел свои.
  // Теперь — в файле users-data/{projectId}/projects-config.json,
  // → одинаково на всех компьютерах с одной папкой Click.
  // ═══════════════════════════════════════════════════════════════

  // ── МИГРАЦИИ КОНФИГА ──
  // Применяются автоматически при каждом чтении конфига.
  // Идемпотентные: можно вызывать сколько угодно раз, не ломают данные.
  // Если что-то изменилось — возвращают true, и сервер сразу пересохраняет файл.
  const applyConfigMigrations = (projectId, config) => {
    if (!config || typeof config !== 'object') return false;
    let changed = false;

    // Миграция 1: МПЭ — удалить Жанаозен (Казахстан) отовсюду.
    // Рекурсивно проходим всю структуру и вырезаем любой объект-город с именем "Жанаозен".
    // Это надёжнее чем целиться в конкретное место — структура конфига могла поменяться.
    if (projectId === 'MPE') {
      const isZhanaozen = (val) => {
        if (typeof val !== 'string') return false;
        return val.trim().toLowerCase().replace(/ё/g, 'е') === 'жанаозен';
      };
      const removed = { count: 0, where: [] };

      const walk = (node, pathStr) => {
        if (Array.isArray(node)) {
          // Если массив объектов-городов — фильтруем
          const before = node.length;
          for (let i = node.length - 1; i >= 0; i--) {
            const item = node[i];
            if (item && typeof item === 'object') {
              // Город может иметь поле name, title, city, cityName — проверяем все
              const cityName = item.name || item.title || item.city || item.cityName || '';
              if (isZhanaozen(cityName)) {
                removed.count++;
                removed.where.push(`${pathStr}[${i}].${item.name ? 'name' : item.title ? 'title' : '?'}`);
                node.splice(i, 1);
                continue;
              }
              // Также проверяем URL — вдруг кто-то по URL ID попадётся
              if (typeof item.url === 'string' && item.url.includes('121416383557')) {
                removed.count++;
                removed.where.push(`${pathStr}[${i}].url(by-id)`);
                node.splice(i, 1);
                continue;
              }
              // Рекурсивно вглубь
              walk(item, `${pathStr}[${i}]`);
            }
          }
          if (node.length !== before) changed = true;
        } else if (node && typeof node === 'object') {
          for (const k of Object.keys(node)) {
            walk(node[k], `${pathStr}.${k}`);
          }
        }
      };

      walk(config, 'config');

      if (removed.count > 0) {
        console.log(`[migration] MPE: removed ${removed.count} Жанаозен entries`);
        for (const w of removed.where) console.log(`  • ${w}`);
      } else {
        // Диагностика: если Жанаозена нет — посмотрим что вообще в конфиге
        try {
          const summary = [];
          if (Array.isArray(config.projects)) {
            for (const p of config.projects) {
              if (!Array.isArray(p.countries)) continue;
              for (const c of p.countries) {
                if (c.name === 'Казахстан' || c.title === 'Казахстан') {
                  const list = c.cities || c.items || [];
                  const names = (Array.isArray(list) ? list : []).slice(0, 5).map(x => x.name || x.title || '?');
                  summary.push(`KZ in "${p.name||'?'}": ${list.length} cities (first: ${names.join(', ')})`);
                }
              }
            }
          }
          if (summary.length > 0) {
            console.log(`[migration] MPE: Жанаозен не найден. Сейчас в конфиге: ${summary.join(' | ')}`);
          }
        } catch {}
      }
    }

    return changed;
  };

  if (p === '/api/projects/config' && req.method === 'GET') {
    try {
      const fp = projectPath(currentProjectId, 'projects-config.json');
      if (!fs.existsSync(fp)) return sendJSON(res, { config: null });
      const config = JSON.parse(fs.readFileSync(fp, 'utf-8'));
      // Применяем миграции. Если что-то изменилось — сохраняем обратно.
      const changed = applyConfigMigrations(currentProjectId, config);
      if (changed) {
        try {
          fs.writeFileSync(fp, JSON.stringify(config, null, 2), 'utf-8');
        } catch (e) {
          console.error(`[migration] не удалось сохранить мигрированный конфиг: ${e.message}`);
        }
      }
      return sendJSON(res, { config, migrated: changed });
    } catch (e) {
      return sendJSON(res, { error: e.message }, 500);
    }
  }

  if (p === '/api/projects/config' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const fp = projectPath(currentProjectId, 'projects-config.json');
      ensureDir(getProjectBase(currentProjectId));
      fs.writeFileSync(fp, JSON.stringify(body.config || {}, null, 2), 'utf-8');
      return sendJSON(res, { ok: true });
    } catch (e) {
      return sendJSON(res, { error: e.message }, 500);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // ЛОКАЛЬНЫЕ КАРТИНКИ
  // Альтернатива загрузке через ImgBB — пользователь грузит файл прямо в Click.
  // Картинки лежат в users-data/{projectId}/uploads/, доступны через /api/uploads/<имя>
  // и подставляются в задачу как imagePath (локальный путь к файлу).
  // Это решает проблему «Client network socket disconnected» — файл уже на диске,
  // никаких сетевых запросов к ImgBB не нужно.
  // ═══════════════════════════════════════════════════════════════

  // POST /api/upload-image — загрузка картинки (multipart/form-data)
  if (p === '/api/upload-image' && req.method === 'POST') {
    try {
      const uploadsDir = projectPath(currentProjectId, 'uploads');
      ensureDir(uploadsDir);

      // Парсим multipart/form-data без сторонних зависимостей
      const contentType = req.headers['content-type'] || '';
      const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
      if (!boundaryMatch) {
        return sendJSON(res, { error: 'Не указан boundary в multipart' }, 400);
      }
      const boundary = '--' + (boundaryMatch[1] || boundaryMatch[2]).trim();

      // Собираем весь body в Buffer
      const chunks = [];
      let totalSize = 0;
      const MAX_SIZE = 20 * 1024 * 1024; // 20 MB — больше Яндекс всё равно не возьмёт
      for await (const chunk of req) {
        chunks.push(chunk);
        totalSize += chunk.length;
        if (totalSize > MAX_SIZE) {
          return sendJSON(res, { error: 'Файл больше 20 МБ' }, 413);
        }
      }
      const body = Buffer.concat(chunks);

      // Находим начало и конец данных файла (между boundary)
      const boundaryBuf = Buffer.from(boundary);
      const startIdx = body.indexOf(boundaryBuf);
      if (startIdx === -1) return sendJSON(res, { error: 'Не найден boundary в теле' }, 400);

      // После boundary идут заголовки части до \r\n\r\n
      const partStart = startIdx + boundaryBuf.length + 2; // +\r\n
      const headerEnd = body.indexOf('\r\n\r\n', partStart);
      if (headerEnd === -1) return sendJSON(res, { error: 'Не найден разделитель заголовков части' }, 400);

      const headers = body.slice(partStart, headerEnd).toString('utf-8');
      const filenameMatch = headers.match(/filename="([^"]+)"/);
      if (!filenameMatch) return sendJSON(res, { error: 'Не указано имя файла' }, 400);
      const originalName = filenameMatch[1];

      // Данные файла — от конца заголовков до следующего boundary
      const dataStart = headerEnd + 4; // +\r\n\r\n
      const dataEnd = body.indexOf(boundaryBuf, dataStart);
      if (dataEnd === -1) return sendJSON(res, { error: 'Не найден конец данных файла' }, 400);
      const fileData = body.slice(dataStart, dataEnd - 2); // -2 чтобы убрать \r\n перед boundary

      // Имя файла на диске: <timestamp>-<original> для уникальности
      const ext = path.extname(originalName).toLowerCase().slice(0, 5) || '.jpg';
      const validExt = /\.(jpg|jpeg|png|gif|webp)$/i.test(ext) ? ext : '.jpg';
      const safeName = safeFilename(path.basename(originalName, path.extname(originalName)));
      const fileName = `${Date.now()}-${safeName}${validExt}`;
      const filePath = path.join(uploadsDir, fileName);

      fs.writeFileSync(filePath, fileData);

      return sendJSON(res, {
        ok: true,
        fileName,                       // относительное имя файла
        path: filePath,                 // абсолютный путь — пойдёт в task.imagePath
        url: `/api/uploads/${encodeURIComponent(fileName)}`, // URL для превью в UI
        size: fileData.length,
        originalName,
      });
    } catch (e) {
      return sendJSON(res, { error: e.message }, 500);
    }
  }

  // GET /api/uploads/<filename> — отдача локального файла (для превью в UI)
  if (p.startsWith('/api/uploads/') && req.method === 'GET') {
    try {
      const fileName = decodeURIComponent(p.slice('/api/uploads/'.length));
      // Защита от path traversal: только имя файла, без слэшей и точек в начале
      if (!fileName || fileName.includes('/') || fileName.includes('\\') || fileName.startsWith('.')) {
        return send(res, 400, 'text/plain', 'Bad filename');
      }
      const filePath = projectPath(currentProjectId, 'uploads', fileName);
      if (!fs.existsSync(filePath)) {
        return send(res, 404, 'text/plain', 'Not found');
      }
      const ext = path.extname(fileName).toLowerCase();
      const mime = ext === '.png' ? 'image/png'
                 : ext === '.gif' ? 'image/gif'
                 : ext === '.webp' ? 'image/webp'
                 : 'image/jpeg';
      const data = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-cache' });
      res.end(data);
      return;
    } catch (e) {
      return send(res, 500, 'text/plain', 'Error: ' + e.message);
    }
  }

  // DELETE /api/uploads/<filename> — удалить загруженную картинку
  if (p.startsWith('/api/uploads/') && req.method === 'DELETE') {
    try {
      const fileName = decodeURIComponent(p.slice('/api/uploads/'.length));
      if (!fileName || fileName.includes('/') || fileName.includes('\\') || fileName.startsWith('.')) {
        return sendJSON(res, { error: 'Bad filename' }, 400);
      }
      const filePath = projectPath(currentProjectId, 'uploads', fileName);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch {}
      }
      return sendJSON(res, { ok: true });
    } catch (e) {
      return sendJSON(res, { error: e.message }, 500);
    }
  }

  if (p === '/api/tasks' && req.method === 'GET') {
    const files = getTaskFiles(currentProjectId).map(name => {
      const data = readJSON(projectPath(currentProjectId, 'tasks', name));
      return {
        name,
        size: fs.statSync(projectPath(currentProjectId, 'tasks', name)).size,
        country: data?.country || '—',
        project: data?.projectName || '—',
        cities: Array.isArray(data?.tasks) ? data.tasks.length : 0,
      };
    });
    return sendJSON(res, { files });
  }

  if (p === '/api/tasks/save' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const items = Array.isArray(body.items) ? body.items : [];
      if (items.length === 0) return sendJSON(res, { error: 'empty' }, 400);
      ensureDir(projectPath(currentProjectId, 'tasks'));
      const saved = [];
      const ts = Date.now();
      items.forEach((item, idx) => {
        const num = String(idx + 1).padStart(2, '0');
        const country = safeFilename(item.country || 'x');
        const name = `${num}-${country}-${ts}.json`;
        fs.writeFileSync(projectPath(currentProjectId, 'tasks', name), JSON.stringify(item, null, 2), 'utf-8');
        saved.push(name);
      });
      return sendJSON(res, { ok: true, saved });
    } catch (e) { return sendJSON(res, { error: e.message }, 500); }
  }

  if (p === '/api/tasks/delete' && req.method === 'POST') {
    try {
      const { name } = await readBody(req);
      if (!name) return sendJSON(res, { error: 'no name' }, 400);
      const fp = projectPath(currentProjectId, 'tasks', path.basename(name));
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
      return sendJSON(res, { ok: true });
    } catch (e) { return sendJSON(res, { error: e.message }, 500); }
  }

  if (p === '/api/tasks/clear' && req.method === 'POST') {
    try {
      for (const f of getTaskFiles(currentProjectId)) {
        try { fs.unlinkSync(projectPath(currentProjectId, 'tasks', f)); } catch {}
      }
      return sendJSON(res, { ok: true });
    } catch (e) { return sendJSON(res, { error: e.message }, 500); }
  }

  // ── АКТУАЛИЗАЦИЯ ── (отдельный набор эндпоинтов, не пересекается с публикацией)

  if (p === '/api/actualize/save' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const items = Array.isArray(body.items) ? body.items : [];
      if (items.length === 0) return sendJSON(res, { error: 'empty' }, 400);
      ensureDir(projectPath(currentProjectId, 'tasks-actualize'));
      // Чистим старые файлы перед сохранением — чтобы actualize.js не подхватил лишнее
      try {
        const old = fs.readdirSync(projectPath(currentProjectId, 'tasks-actualize')).filter(f => f.endsWith('.json') && !f.startsWith('.'));
        for (const f of old) fs.unlinkSync(projectPath(currentProjectId, 'tasks-actualize', f));
      } catch {}
      const saved = [];
      const ts = Date.now();
      items.forEach((item, idx) => {
        const num = String(idx + 1).padStart(2, '0');
        const country = safeFilename(item.country || 'x');
        const name = `${num}-${country}-${ts}.json`;
        fs.writeFileSync(projectPath(currentProjectId, 'tasks-actualize', name), JSON.stringify(item, null, 2), 'utf-8');
        saved.push(name);
      });
      return sendJSON(res, { ok: true, saved });
    } catch (e) { return sendJSON(res, { error: e.message }, 500); }
  }

  if (p === '/api/actualize/reports') {
    const dir = projectPath(currentProjectId, 'reports-actualize');
    let files = [];
    try {
      if (fs.existsSync(dir)) {
        files = fs.readdirSync(dir)
          .filter(f => f.endsWith('.json') && !f.startsWith('.'))
          .map(name => {
            const data = readJSON(path.join(dir, name));
            return {
              name,
              startedAt: data?.startedAt,
              finishedAt: data?.finishedAt,
              durationSec: data?.durationSec,
              totals: data?.totals || { total: 0, actualized: 0, notNeeded: 0, failed: 0 },
            };
          })
          .sort((a, b) => (b.finishedAt || '').localeCompare(a.finishedAt || ''))
          .slice(0, 30);
      }
    } catch {}
    return sendJSON(res, { files });
  }

  if (p === '/api/actualize/report') {
    const name = url.searchParams.get('name');
    if (!name) return sendText(res, '', 400);
    const fp = projectPath(currentProjectId, 'reports-actualize', path.basename(name));
    if (!fs.existsSync(fp)) return sendText(res, 'not found', 404);
    return send(res, 200, 'application/json', fs.readFileSync(fp, 'utf-8'));
  }

  if (p === '/api/run' && req.method === 'POST') {
    if (runningProcess) return sendJSON(res, { error: 'already running' }, 409);
    const { action } = await readBody(req);
    let cmd, args;
    if (action === 'install') { cmd = 'npm'; args = ['install']; }
    else if (action === 'login') { cmd = 'node'; args = ['publish.js', '--login']; }
    else if (action === 'logout') { cmd = 'node'; args = ['publish.js', '--logout']; }
    else if (action === 'publish') { cmd = 'node'; args = ['publish.js']; }
    else if (action === 'actualize') { cmd = 'node'; args = ['actualize.js']; }
    // Ручной вход через браузер для площадок с браузерной автоматизацией
    // (нет открытого API / вход по SMS-коду). Открывает окно браузера прямо на сервере —
    // сотруднику не нужен терминал, только нажать кнопку в Настройках и ввести код.
    else if (action === 'login-vk') { cmd = 'node'; args = ['vk_automation.js', '--login']; }
    else if (action === 'login-ok') { cmd = 'node'; args = ['ok_automation.js', '--login']; }
    else if (action === 'login-dzen') { cmd = 'node'; args = ['dzen_automation.js', '--login']; }
    else if (action === 'login-max') { cmd = 'node'; args = ['max_automation.js', '--login']; }
    // Честная проверка «сейчас реально авторизован?» — фоновая headless-проверка сохранённой
    // сессии, не полагается на память вкладки браузера. Можно нажимать когда угодно.
    else if (action === 'check-vk') { cmd = 'node'; args = ['vk_automation.js', '--check-session']; }
    else if (action === 'check-ok') { cmd = 'node'; args = ['ok_automation.js', '--check-session']; }
    else if (action === 'check-dzen') { cmd = 'node'; args = ['dzen_automation.js', '--check-session']; }
    else if (action === 'check-max') { cmd = 'node'; args = ['max_automation.js', '--check-session']; }
    else return sendJSON(res, { error: 'unknown action' }, 400);

    processLog = [];
    processStatus = 'running';
    processAction = action;

    // ВАЖНО: передаём текущий проект в скрипт через env
    // — скрипт будет работать с папками users-data/{projectId}/ (tasks, session, reports)
    const projectDirName = currentProjectId ? projects.projectDir(currentProjectId) : null;

    // На Windows npm — это .cmd-файл, нужно явно указать
    if (cmd === 'npm' && process.platform === 'win32') {
      cmd = 'npm.cmd';
    }

    runningProcess = spawn(cmd, args, {
      cwd: ROOT,
      // shell: true НЕ используем — вызывает DeprecationWarning в Node 22
      // и потенциально опасен с пробелами в путях
      env: {
        ...process.env,
        FORCE_COLOR: '0', NO_COLOR: '1',
        CLICK_PROJECT: currentProjectId || '',
        CLICK_PROJECT_DIR: projectDirName || '',
      },
      windowsHide: true,
    });

    const onData = (chunk) => {
      const text = chunk.toString().replace(/\x1b\[[0-9;]*m/g, '');
      processLog.push(text);
      const totalLen = processLog.reduce((s, x) => s + x.length, 0);
      if (totalLen > 1024 * 1024) processLog = processLog.slice(-500);
    };
    runningProcess.stdout.on('data', onData);
    runningProcess.stderr.on('data', onData);

    runningProcess.on('close', (code) => {
      processStatus = code === 0 ? 'done' : 'error';
      processLog.push('\n' + '─'.repeat(44) + '\n' + (code === 0 ? '✅ Завершено успешно' : `❌ Ошибка (код ${code})`) + '\n');
      runningProcess = null;
    });

    if (action === 'publish') {
      setTimeout(() => {
        try { if (runningProcess?.stdin) runningProcess.stdin.write('y\n'); } catch {}
      }, 3500);
    }
    return sendJSON(res, { ok: true, status: processStatus, action: processAction });
  }

  if (p === '/api/stop' && req.method === 'POST') {
    if (runningProcess) {
      // Если идёт публикация или актуализация — мягкая остановка через STOP-флаг
      if (processAction === 'publish') {
        try { fs.writeFileSync(projectPath(currentProjectId, '.STOP_FLAG'), String(Date.now()), 'utf-8'); } catch {}
        processLog.push('\n⏹  Запрошена остановка — завершу после текущего города\n');
      } else if (processAction === 'actualize') {
        try { fs.writeFileSync(projectPath(currentProjectId, '.STOP_FLAG_ACTUALIZE'), String(Date.now()), 'utf-8'); } catch {}
        processLog.push('\n⏹  Запрошена остановка — завершу после текущего города\n');
      } else {
        // Для install/login — жёсткая остановка
        try { runningProcess.kill('SIGINT'); } catch {}
        setTimeout(() => { try { runningProcess?.kill('SIGKILL'); } catch {} }, 2000);
      }
    }
    return sendJSON(res, { ok: true });
  }

  if (p === '/api/log') {
    return sendJSON(res, { log: processLog.join(''), status: processStatus, action: processAction });
  }

  if (p === '/api/logs') return sendJSON(res, { files: getLogFiles(currentProjectId).slice(0, 20) });

  if (p === '/api/reports') {
    const files = getReports(currentProjectId).slice(0, 30).map(name => {
      const data = readJSON(projectPath(currentProjectId, 'reports', name));
      return {
        name,
        startedAt: data?.startedAt,
        finishedAt: data?.finishedAt,
        durationSec: data?.durationSec,
        totals: data?.totals || { total: 0, ok: 0, noImage: 0, failed: 0 },
      };
    });
    return sendJSON(res, { files });
  }

  if (p === '/api/report') {
    const name = url.searchParams.get('name');
    if (!name) return sendText(res, '', 400);
    const fp = projectPath(currentProjectId, 'reports', path.basename(name));
    if (!fs.existsSync(fp)) return sendText(res, 'not found', 404);
    return send(res, 200, 'application/json', fs.readFileSync(fp, 'utf-8'));
  }

  if (p === '/api/log-file') {
    const name = url.searchParams.get('name');
    if (!name) return sendText(res, '', 400);
    const fp = projectPath(currentProjectId, 'logs', path.basename(name));
    if (!fs.existsSync(fp)) return sendText(res, 'not found', 404);
    return sendText(res, fs.readFileSync(fp, 'utf-8'));
  }

  if (p === '/api/open-folder' && req.method === 'POST') {
    const { target } = await readBody(req);
    const map = {
      root: getProjectBase(currentProjectId),
      tasks: projectPath(currentProjectId, 'tasks'),
      done: projectPath(currentProjectId, 'tasks', 'done'),
      logs: projectPath(currentProjectId, 'logs'),
      reports: projectPath(currentProjectId, 'reports'),
    };
    const folder = map[target] || ROOT;
    ensureDir(folder);
    const cmd = process.platform === 'win32' ? `start "" "${folder}"`
              : process.platform === 'darwin' ? `open "${folder}"`
              : `xdg-open "${folder}"`;
    exec(cmd);
    return sendJSON(res, { ok: true });
  }

  send(res, 404, 'text/plain', 'Not Found');
};

const { buildHTML } = require('./_ui.js');

const server = http.createServer(async (req, res) => {
  try { await handleRoute(req, res); }
  catch (e) {
    console.error('ROUTE ERROR:', e);
    try { sendJSON(res, { error: e.message }, 500); } catch {}
  }
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log('');
  console.log('  +-------------------------------------------+');
  console.log('  |  Click - server started                   |');
  console.log('  +-------------------------------------------+');
  console.log(`  |  ${url.padEnd(41)}|`);
  console.log('  +-------------------------------------------+');
  console.log('');
  console.log('  Ctrl+C - stop server');
  console.log('');

  const openCmd = process.platform === 'win32' ? `start "" "${url}"`
                : process.platform === 'darwin' ? `open "${url}"`
                : `xdg-open "${url}"`;
  exec(openCmd);
});

process.on('SIGINT', () => {
  if (runningProcess) { try { runningProcess.kill('SIGINT'); } catch {} }
  console.log('\n  Сервер остановлен\n');
  process.exit(0);
});
