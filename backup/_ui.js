/**
 * UI-модуль. Возвращает готовую HTML-страницу.
 * Состоит из CSS + skeleton + client-side JS.
 */

const CSS = `
*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; padding: 0; }

:root {
  --font: 'Inter', -apple-system, 'Segoe UI', 'Roboto', system-ui, sans-serif;
  --mono: 'JetBrains Mono', ui-monospace, 'SF Mono', Consolas, monospace;
  --r-xs: 4px; --r-sm: 8px; --r-md: 12px; --r-lg: 16px; --r-xl: 20px;
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
  --acc: #5b7cfa; --acc-2: #8b5cf6; --grn: #10b981; --red: #ef4444;
  --yel: #f59e0b; --pink: #ec4899;
  color-scheme: dark;
}

:root[data-theme="dark"], :root:not([data-theme]) {
  --bg: #0a0c14; --bg-1: #10131d; --bg-2: #171b28; --bg-3: #1e2333; --bg-4: #272d40;
  --border: #252b3c; --border-2: #323a52; --border-hi: #4a5578;
  --text: #e8eaf3; --text-2: #b4bacf; --muted: #7078a0; --dim: #4a5070;
  --acc-bg: rgba(91,124,250,0.12); --acc-bg-2: rgba(91,124,250,0.2);
  --grn-bg: rgba(16,185,129,0.12); --red-bg: rgba(239,68,68,0.12);
  --yel-bg: rgba(245,158,11,0.12); --pink-bg: rgba(236,72,153,0.12);
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.25); --shadow-md: 0 8px 24px rgba(0,0,0,0.35);
  --shadow-lg: 0 16px 48px rgba(0,0,0,0.5);
  --gradient: linear-gradient(135deg, #5b7cfa 0%, #8b5cf6 100%);
  --gradient-subtle: linear-gradient(135deg, rgba(91,124,250,0.08), rgba(139,92,246,0.08));
  color-scheme: dark;
}

:root[data-theme="light"] {
  --bg: #f7f8fb; --bg-1: #ffffff; --bg-2: #ffffff; --bg-3: #f1f3f8; --bg-4: #e6e9f2;
  --border: #e3e6ef; --border-2: #d1d6e3; --border-hi: #aeb4c7;
  --text: #141824; --text-2: #353d55; --muted: #6b7189; --dim: #9aa0b5;
  --acc-bg: rgba(91,124,250,0.10); --acc-bg-2: rgba(91,124,250,0.18);
  --grn-bg: rgba(16,185,129,0.10); --red-bg: rgba(239,68,68,0.10);
  --yel-bg: rgba(245,158,11,0.12); --pink-bg: rgba(236,72,153,0.10);
  --shadow-sm: 0 1px 3px rgba(20,24,36,0.08); --shadow-md: 0 6px 20px rgba(20,24,36,0.08);
  --shadow-lg: 0 12px 40px rgba(20,24,36,0.14);
  --gradient: linear-gradient(135deg, #5b7cfa 0%, #8b5cf6 100%);
  --gradient-subtle: linear-gradient(135deg, rgba(91,124,250,0.06), rgba(139,92,246,0.06));
  color-scheme: light;
}

html { height: 100%; }
body {
  font-family: var(--font); background: var(--bg); color: var(--text);
  min-height: 100vh; -webkit-font-smoothing: antialiased;
  font-feature-settings: "cv02", "cv11"; line-height: 1.5;
  transition: background-color .25s var(--ease), color .25s var(--ease);
}
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border-2); border-radius: 5px; border: 2px solid var(--bg); }
::-webkit-scrollbar-thumb:hover { background: var(--border-hi); }

button { font: inherit; }
input, textarea, select { font: inherit; color: inherit; }
a { color: var(--acc); text-decoration: none; }

.shell { display: flex; flex-direction: column; min-height: 100vh; }

.topbar {
  display: flex; align-items: center; gap: 18px; padding: 12px 20px;
  background: var(--bg-1); border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 50; backdrop-filter: saturate(160%);
}
.topbar .logo { display: flex; align-items: center; gap: 12px; }
.topbar .logo-icon {
  width: 38px; height: 38px; background: var(--gradient); border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #fff;
  box-shadow: 0 4px 14px rgba(91,124,250,0.35);
  transition: transform .2s var(--ease);
}
.topbar .logo-icon:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(91,124,250,0.45); }
.topbar .logo-icon svg { width: 18px; height: 18px; }
.topbar .logo-title { font-size: 15px; font-weight: 700; letter-spacing: -0.02em; }
.topbar .logo-sub { font-size: 11px; color: var(--muted); font-weight: 500; }
.topbar-spacer { flex: 1; }

.proj-wrap { position: relative; }
.proj-btn {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 9px 14px; min-width: 220px; justify-content: space-between;
  background: var(--bg-2); border: 1px solid var(--border);
  color: var(--text); border-radius: var(--r-sm);
  font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all .15s var(--ease);
}
.proj-btn:hover { border-color: var(--border-hi); }
.proj-dd {
  position: absolute; top: calc(100% + 6px); right: 0; min-width: 300px;
  background: var(--bg-1); border: 1px solid var(--border);
  border-radius: var(--r-md); box-shadow: var(--shadow-lg);
  overflow: hidden; z-index: 200; display: none;
}
.proj-dd.open { display: block; }
.proj-item {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 11px 14px;
  background: transparent; color: var(--text); border: none;
  border-bottom: 1px solid var(--border);
  font-size: 13px; text-align: left; cursor: pointer;
  transition: background .1s var(--ease);
}
.proj-item:hover { background: var(--bg-3); }
.proj-item.active { background: var(--acc-bg); color: var(--acc); }
.proj-item-name { flex: 1; font-weight: 600; }
.proj-item-meta {
  font-size: 11px; font-weight: 600; padding: 2px 9px;
  border-radius: 20px; background: var(--bg-4); color: var(--muted);
}
.proj-add-wrap { padding: 10px; }
.proj-add-row { display: flex; gap: 6px; }
.proj-add-row input {
  flex: 1; padding: 9px 11px; font-size: 13px;
  background: var(--bg-3); border: 1px solid var(--border);
  border-radius: var(--r-sm); color: var(--text); outline: none;
}
.proj-add-row input:focus { border-color: var(--acc); }

.theme-btn {
  width: 40px; height: 40px;
  background: var(--bg-2); border: 1px solid var(--border);
  border-radius: 10px; cursor: pointer; color: var(--text-2);
  display: flex; align-items: center; justify-content: center;
  transition: all .2s var(--ease); font-size: 18px;
}
.theme-btn:hover { border-color: var(--border-hi); color: var(--text); transform: scale(1.05); }

.pills { display: flex; gap: 6px; flex-wrap: wrap; }
.pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 11px; border-radius: 20px;
  font-size: 11px; font-weight: 600; letter-spacing: -0.01em;
}
.pill::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.pill-ok { background: var(--grn-bg); color: var(--grn); }
.pill-err { background: var(--red-bg); color: var(--red); }
.pill-warn { background: var(--yel-bg); color: var(--yel); }
.pill-info { background: var(--acc-bg); color: var(--acc); }

/* ─── AUTH SCREEN ─── */
.auth-overlay {
  position: fixed; inset: 0; z-index: 10000;
  background: var(--bg);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.auth-card {
  background: var(--bg-1); border: 1px solid var(--border);
  border-radius: var(--r); padding: 36px 32px;
  width: 100%; max-width: 420px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}
.auth-logo { font-size: 28px; font-weight: 700; color: var(--acc); margin-bottom: 8px; }
.auth-title { font-size: 20px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
.auth-subtitle { font-size: 13px; color: var(--muted); margin-bottom: 24px; line-height: 1.5; }
.auth-error {
  background: var(--red-bg); color: var(--red); border: 1px solid rgba(239,68,68,0.3);
  padding: 10px 14px; border-radius: var(--r-sm); margin-bottom: 16px;
  font-size: 13px; font-weight: 600;
}
.auth-hint { font-size: 12px; color: var(--muted); margin-top: 14px; text-align: center; }
.auth-card-wide { max-width: 720px; }
.auth-back {
  display: inline-flex; align-items: center; gap: 6px;
  background: transparent; border: none; color: var(--muted);
  font-family: inherit; font-size: 13px; cursor: pointer;
  padding: 4px 0; margin-bottom: 12px;
  transition: color .15s;
}
.auth-back:hover { color: var(--acc); }

/* Плитки проектов */
.project-tiles {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-top: 20px;
}
@media (max-width: 680px) {
  .project-tiles { grid-template-columns: 1fr; }
}
.project-tile {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 24px 14px;
  background: var(--bg-2); border: 2px solid var(--border);
  border-radius: var(--r); cursor: pointer;
  font-family: inherit; color: var(--text);
  transition: all .2s var(--ease);
  position: relative; overflow: hidden;
}
.project-tile::before {
  content: ''; position: absolute; left: 0; right: 0; top: 0; height: 4px;
  background: var(--proj-color); transition: height .2s;
}
.project-tile:hover {
  border-color: var(--proj-color);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}
.project-tile:hover::before { height: 8px; }
.project-tile-icon {
  font-size: 42px; line-height: 1;
  width: 70px; height: 70px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: var(--proj-color); color: white;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--proj-color) 40%, transparent);
}
.project-tile-name { font-size: 18px; font-weight: 700; margin-top: 4px; }
.project-tile-fullname { font-size: 12px; color: var(--muted); }
.project-tile-selected { border-color: var(--proj-color); }

/* Доп. CSS для user-dd info блока */
.user-dd-info {
  padding: 10px 12px;
  background: var(--bg-2);
  border-radius: var(--r-xs);
  margin-bottom: 4px;
}

/* ─── USER MENU ─── */
.user-wrap { position: relative; margin-left: 4px; }
.user-menu { position: relative; }
.user-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 10px 6px 6px; background: var(--bg-2);
  border: 1px solid var(--border); border-radius: 999px;
  cursor: pointer; font-family: inherit; font-size: 13px;
  color: var(--text); transition: all .15s var(--ease);
}
.user-btn:hover { background: var(--bg-3); border-color: var(--acc); }
.user-avatar {
  display: inline-flex; align-items: center; justify-content: center;
  width: 26px; height: 26px; border-radius: 50%;
  background: var(--acc); color: white; font-weight: 700; font-size: 12px;
}
.user-name { font-weight: 600; }
.user-badge {
  display: inline-block; padding: 2px 7px; margin-left: 4px;
  background: var(--yel-bg); color: var(--yel);
  border-radius: 999px; font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.04em;
}
.user-dd {
  position: absolute; right: 0; top: calc(100% + 6px);
  background: var(--bg-1); border: 1px solid var(--border);
  border-radius: var(--r-sm); box-shadow: 0 10px 30px rgba(0,0,0,0.12);
  min-width: 200px; padding: 6px; z-index: 100;
  display: none;
}
.user-dd.open { display: block; }
.user-dd-item {
  display: block; width: 100%; text-align: left;
  padding: 8px 12px; background: transparent; border: none;
  font-family: inherit; font-size: 13px; color: var(--text);
  cursor: pointer; border-radius: var(--r-xs);
  transition: background .12s;
}
.user-dd-item:hover { background: var(--bg-2); }
.user-dd-sep { height: 1px; background: var(--border); margin: 4px 0; }

/* ─── MODAL OVERLAY ─── */
.modal-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.modal-card {
  background: var(--bg-1); border: 1px solid var(--border);
  border-radius: var(--r); padding: 24px;
  width: 100%; max-height: 90vh; overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.modal-title { font-size: 18px; font-weight: 700; color: var(--text); }

/* ─── ADMIN USER ROW ─── */
.admin-users-list { display: flex; flex-direction: column; gap: 8px; }
.admin-user-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; background: var(--bg-2);
  border: 1px solid var(--border); border-radius: var(--r-sm);
}
.admin-user-avatar {
  display: inline-flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--acc); color: white; font-weight: 700; font-size: 15px;
}
.admin-user-name { font-weight: 600; font-size: 14px; color: var(--text); }
.admin-user-date { font-size: 11px; color: var(--muted); margin-top: 2px; }

.tabs-bar {
  display: flex; gap: 2px; padding: 10px 20px 0;
  background: var(--bg-1); border-bottom: 1px solid var(--border);
  overflow-x: auto;
}
.tab {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 16px; background: transparent; color: var(--muted);
  border: 1px solid transparent;
  border-radius: var(--r-sm) var(--r-sm) 0 0;
  font-size: 13px; font-weight: 600; cursor: pointer;
  border-bottom: 2px solid transparent; margin-bottom: -1px;
  transition: all .15s var(--ease); white-space: nowrap;
  line-height: 1.2;
  font-family: inherit;
}
/* Эмодзи в табах — фиксированный размер и инлайн-блок чтобы не съезжали */
.tab > .tab-ico { display: inline-block; font-size: 14px; line-height: 1; width: 16px; text-align: center; }
.tab:hover { color: var(--text); }
.tab.active {
  color: var(--text); background: var(--bg);
  border-color: var(--border); border-bottom-color: var(--bg);
}

main { flex: 1; padding: 22px 32px 60px; max-width: 1240px; width: 100%; margin: 0 auto; }
.view { display: none; }
.view.active { display: block; animation: fadeIn .18s var(--ease); }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.card {
  background: var(--bg-1); border: 1px solid var(--border);
  border-radius: var(--r-md); padding: 22px;
  margin-bottom: 14px; box-shadow: var(--shadow-sm);
}
.card-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px; margin-bottom: 16px; flex-wrap: wrap;
}
.card-title {
  display: inline-flex; align-items: center; gap: 9px;
  font-size: 14px; font-weight: 700; color: var(--text); letter-spacing: -0.01em;
}
.card-title-ico { font-size: 17px; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field + .field { margin-top: 14px; }
.label {
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.04em; color: var(--muted);
}
.input, .textarea {
  width: 100%; padding: 11px 14px;
  background: var(--bg-2); border: 1px solid var(--border);
  color: var(--text); border-radius: var(--r-sm);
  font-size: 13.5px; outline: none;
  transition: border-color .15s, background .15s;
}
.input:focus, .textarea:focus { border-color: var(--acc); background: var(--bg-1); }
.textarea { resize: vertical; min-height: 90px; line-height: 1.55; font-family: var(--font); }
.input-mono { font-family: var(--mono); font-size: 12.5px; }
.hint { font-size: 11.5px; color: var(--dim); margin-top: 4px; }

.pw-wrap { position: relative; }
.pw-wrap .input { padding-right: 40px; }
.pw-toggle {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  background: transparent; border: none; color: var(--muted);
  cursor: pointer; padding: 6px; font-size: 14px;
}

.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px 18px; font-size: 13px; font-weight: 600;
  border: 1px solid transparent; border-radius: var(--r-sm);
  cursor: pointer; transition: all .15s var(--ease);
  white-space: nowrap; user-select: none;
}
.btn:hover { transform: translateY(-1px); }
.btn:active { transform: translateY(0); }
.btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none !important; filter: none !important; }
.btn-primary { background: var(--gradient); color: #fff; box-shadow: 0 4px 14px rgba(91,124,250,.30); }
.btn-primary:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(91,124,250,.45); }
.btn-secondary { background: var(--bg-3); color: var(--text); border-color: var(--border); }
.btn-secondary:hover:not(:disabled) { background: var(--bg-4); border-color: var(--border-hi); }
.btn-ghost { background: transparent; color: var(--text-2); }
.btn-ghost:hover:not(:disabled) { background: var(--bg-3); color: var(--text); }
.btn-danger { background: var(--red-bg); color: var(--red); border-color: transparent; }
.btn-danger:hover:not(:disabled) { background: var(--red); color: #fff; }
.btn-success { background: var(--grn-bg); color: var(--grn); border-color: transparent; }
.btn-success:hover:not(:disabled) { background: var(--grn); color: #fff; }
.btn-warn { background: var(--yel-bg); color: var(--yel); border-color: transparent; }
.btn-warn:hover:not(:disabled) { background: var(--yel); color: #fff; }
.btn-sm { padding: 7px 12px; font-size: 12px; }
.btn-xs { padding: 5px 9px; font-size: 11.5px; gap: 5px; }
.btn-lg { padding: 13px 22px; font-size: 14px; }
.btn-block { width: 100%; }

.row { display: flex; gap: 10px; flex-wrap: wrap; }
.row-between { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 640px) { .grid-2 { grid-template-columns: 1fr; } }

.country-pills { display: flex; flex-wrap: wrap; gap: 7px; }
.country-pill {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 9px 14px; border-radius: 24px;
  background: var(--bg-3); border: 1px solid var(--border);
  color: var(--text-2); font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all .15s var(--ease);
}
.country-pill:hover { border-color: var(--border-hi); color: var(--text); }
.country-pill.active { background: var(--acc-bg); border-color: var(--acc); color: var(--acc); }
.country-pill-count {
  padding: 1px 8px; border-radius: 20px;
  background: var(--bg-4); font-size: 11px; font-weight: 700;
}
.country-pill.active .country-pill-count { background: var(--acc-bg-2); }

.city-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 8px; }
.city-check {
  display: flex; align-items: center; gap: 10px;
  padding: 11px 13px; text-align: left; position: relative;
  background: var(--bg-2); border: 1px solid var(--border);
  border-radius: var(--r-sm); color: var(--text);
  cursor: pointer; transition: all .1s var(--ease);
}
.city-check:hover { border-color: var(--border-hi); background: var(--bg-3); }
.city-check.selected { background: var(--acc-bg); border-color: var(--acc); }
.city-check.in-queue {
  border-color: rgba(16,185,129,0.4);
  background: linear-gradient(135deg, var(--grn-bg), transparent);
}
.city-check.in-queue .city-check-box { background: var(--grn); border-color: var(--grn); }
.city-check-queue-mark {
  position: absolute; top: 6px; right: 6px;
  font-size: 10px; font-weight: 700;
  padding: 1px 6px; border-radius: 10px;
  background: var(--grn); color: #fff;
}
.city-check-box {
  width: 20px; height: 20px; border-radius: 5px; flex-shrink: 0;
  border: 2px solid var(--border-2);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 12px; line-height: 1;
  transition: all .1s var(--ease);
}
.city-check.selected .city-check-box { background: var(--acc); border-color: var(--acc); }
.city-check-name { font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.city-check-info { font-size: 11px; color: var(--dim); font-family: var(--mono);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.city-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; background: var(--bg-2);
  border: 1px solid var(--border); border-radius: var(--r-sm);
  transition: border-color .1s;
}
.city-row:hover { border-color: var(--border-hi); }
.city-row-num { width: 24px; font-family: var(--mono); font-size: 11px; color: var(--dim); font-weight: 700; }
.city-row-name { flex: 0 0 150px; font-size: 13px; font-weight: 600; }
.city-row-url { flex: 1; font-size: 12px; color: var(--muted); font-family: var(--mono);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.city-list { display: flex; flex-direction: column; gap: 6px; }

.country-section { margin-bottom: 14px; }
.country-section-head {
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px; padding: 12px 16px;
  background: var(--bg-2); border: 1px solid var(--border);
  border-radius: var(--r-sm); cursor: pointer;
  transition: border-color .1s;
}
.country-section-head:hover { border-color: var(--border-hi); }
.country-section-body {
  padding: 14px; margin-top: 8px;
  background: var(--bg-1); border: 1px solid var(--border); border-radius: var(--r-sm);
}
.country-section.collapsed .country-section-body { display: none; }
.country-section.collapsed .chevron { transform: rotate(-90deg); }
.chevron { transition: transform .2s var(--ease); color: var(--muted); }

.country-title { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700; }
.country-flag { font-size: 20px; }

.badge {
  display: inline-flex; align-items: center;
  padding: 2px 10px; border-radius: 20px;
  font-size: 11px; font-weight: 600;
}
.badge-muted { background: var(--bg-4); color: var(--muted); }
.badge-accent { background: var(--acc-bg); color: var(--acc); }
.badge-success { background: var(--grn-bg); color: var(--grn); }
.badge-danger { background: var(--red-bg); color: var(--red); }
.badge-warn { background: var(--yel-bg); color: var(--yel); }

.queue-list { display: flex; flex-direction: column; gap: 10px; }
.queue-item {
  padding: 14px 16px;
  background: var(--bg-2); border: 1px solid var(--border);
  border-radius: var(--r-sm);
}
.queue-item-head {
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px; margin-bottom: 8px;
}
.queue-item-title {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 13.5px; font-weight: 700;
}
.queue-item-text {
  font-size: 12.5px; color: var(--text-2); line-height: 1.55;
  white-space: pre-wrap; margin-bottom: 8px; word-break: break-word;
}
.queue-cities { display: flex; flex-wrap: wrap; gap: 4px; }

.file-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px;
  background: var(--bg-2); border: 1px solid var(--border);
  border-radius: var(--r-sm); transition: border-color .1s;
}
.file-row:hover { border-color: var(--border-hi); }
.file-icon { font-size: 20px; flex-shrink: 0; }
.file-meta { flex: 1; min-width: 0; }
.file-name { font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }

.log-box {
  background: #06080e; border: 1px solid var(--border);
  border-radius: var(--r-sm); padding: 14px;
  font-family: var(--mono); font-size: 12px; line-height: 1.75;
  color: #c5cce0; white-space: pre-wrap; word-break: break-word;
  max-height: 480px; overflow-y: auto;
}
:root[data-theme="light"] .log-box { background: #0d1018; color: #e4e7f1; }
.log-placeholder { color: var(--dim); padding: 24px 0; text-align: center; font-size: 12.5px; font-family: var(--font); }
.log-ok { color: #33d298; }
.log-err { color: #ff7c7c; }
.log-warn { color: #fabe23; }
.log-info { color: #8fa8ff; }
.log-dim { color: #5b6485; }

.empty { text-align: center; padding: 48px 20px; color: var(--muted); }
.empty-icon { font-size: 46px; opacity: 0.35; margin-bottom: 14px; }
.empty-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
.empty-desc { font-size: 13px; max-width: 400px; margin: 0 auto; }

.stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
.stat-card {
  padding: 14px;
  background: var(--bg-2); border: 1px solid var(--border);
  border-radius: var(--r-sm);
}
.stat-label { font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; }
.stat-value { font-size: 26px; font-weight: 700; font-family: var(--mono); letter-spacing: -0.02em; }

.divider { height: 1px; background: var(--border); margin: 14px 0; border: none; }

#toast {
  position: fixed; right: 20px; bottom: 20px; z-index: 1000;
  padding: 12px 18px; border-radius: var(--r-sm);
  font-size: 13px; font-weight: 600;
  box-shadow: var(--shadow-lg); display: none;
  animation: slideUp .22s var(--ease);
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.toast-ok { background: var(--grn); color: #fff; }
.toast-err { background: var(--red); color: #fff; }
.toast-info { background: var(--acc); color: #fff; }

.section-label {
  font-size: 11px; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.05em; color: var(--yel);
  display: inline-flex; align-items: center; gap: 6px;
}

@media (max-width: 720px) {
  .topbar { padding: 10px 14px; gap: 10px; }
  .topbar .logo-sub { display: none; }
  .tabs-bar { padding: 8px 14px 0; }
  main { padding: 16px 18px 40px; }
  .card { padding: 16px; }
  .btn { padding: 9px 14px; font-size: 12.5px; }
  .proj-btn { min-width: 150px; font-size: 12px; padding: 7px 12px; }
  .proj-dd { min-width: 260px; }
}

/* STEPPER */
.stepper { display: flex; flex-direction: column; gap: 12px; }
.step {
  display: flex; gap: 16px; padding: 18px 20px;
  background: var(--bg-1); border: 1px solid var(--border);
  border-radius: var(--r-md);
  transition: all .2s var(--ease);
}
.step.step-done { border-color: rgba(16,185,129,0.3); background: linear-gradient(135deg, var(--grn-bg), transparent); }
.step.step-active { border-color: var(--acc); box-shadow: 0 0 0 3px var(--acc-bg); }
.step.step-locked { opacity: 0.5; }
.step-num {
  flex-shrink: 0; width: 42px; height: 42px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 17px;
  background: var(--bg-3); color: var(--muted);
  border: 2px solid var(--border);
}
.step.step-done .step-num { background: var(--grn); color: #fff; border-color: var(--grn); }
.step.step-active .step-num {
  background: var(--gradient); color: #fff; border-color: transparent;
  box-shadow: 0 4px 14px rgba(91,124,250,0.4);
}
.step-body { flex: 1; min-width: 0; }
.step-title { font-size: 15.5px; font-weight: 700; display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.step-sub { font-size: 13px; color: var(--muted); margin-bottom: 14px; line-height: 1.55; }
.step-action { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.step-done-mark {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 11px; border-radius: 20px;
  background: var(--grn-bg); color: var(--grn);
  font-size: 12px; font-weight: 600;
}

/* REPORT */
.report-summary {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px; margin-bottom: 16px;
}
.report-stat { padding: 14px 16px; border-radius: var(--r-sm); border: 1px solid var(--border); }
.report-stat-label { font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; opacity: 0.75; margin-bottom: 4px; }
.report-stat-value { font-size: 26px; font-weight: 800; font-family: var(--mono); letter-spacing: -0.02em; line-height: 1.1; }
.report-stat.ok { background: var(--grn-bg); color: var(--grn); border-color: rgba(16,185,129,0.25); }
.report-stat.noimg { background: var(--yel-bg); color: var(--yel); border-color: rgba(245,158,11,0.25); }
.report-stat.warn { background: var(--yel-bg); color: var(--yel); border-color: rgba(245,158,11,0.4); }
.report-stat.err { background: var(--red-bg); color: var(--red); border-color: rgba(239,68,68,0.25); }
.report-row.warn { border-left-color: var(--yel); }
.report-stat.dur { background: var(--bg-3); }

.report-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; border-radius: var(--r-sm);
  background: var(--bg-2); border: 1px solid var(--border);
}
.report-row + .report-row { margin-top: 6px; }
.report-row.ok { border-left: 3px solid var(--grn); }
.report-row.noimg { border-left: 3px solid var(--yel); }
.report-row.err { border-left: 3px solid var(--red); }
.report-row-ico { font-size: 17px; flex-shrink: 0; }
.report-row-city { font-size: 13.5px; font-weight: 600; flex: 0 0 180px; }
.report-row-reason { flex: 1; font-size: 12.5px; color: var(--text-2); }
.report-row-dur { font-size: 11.5px; color: var(--dim); font-family: var(--mono); flex-shrink: 0; }
@media (max-width: 720px) {
  .report-row-city { flex: 1; }
  .report-row-dur { display: none; }
}

.collapsible-head { cursor: pointer; user-select: none; transition: background .1s var(--ease); }
.collapsible-head:hover { opacity: 0.85; }

.run-progress {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 18px;
  background: var(--gradient-subtle);
  border: 1px solid var(--acc);
  border-radius: var(--r-sm);
  margin-bottom: 12px;
}
.run-progress-ico {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--gradient); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(91,124,250,0.4); }
  50% { transform: scale(1.05); box-shadow: 0 0 0 8px rgba(91,124,250,0); }
}
.run-progress-text { flex: 1; }
.run-progress-title { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
.run-progress-sub { font-size: 12px; color: var(--muted); }

/* ═══════════════════════════════════════════════════════════════
   POST TYPE — плитки выбора типа поста
═══════════════════════════════════════════════════════════════ */
.post-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
}
.post-type-card {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px;
  padding: 16px 10px;
  background: var(--bg-2); border: 1.5px solid var(--border);
  border-radius: var(--r-md);
  color: var(--text); cursor: pointer;
  transition: all .15s var(--ease);
  font-family: inherit;
  text-align: center;
}
.post-type-card:hover {
  border-color: var(--border-hi);
  background: var(--bg-3);
  transform: translateY(-1px);
}
.post-type-card.active {
  border-color: var(--acc);
  background: var(--acc-bg);
  color: var(--acc);
  box-shadow: 0 0 0 3px var(--acc-bg);
}
.post-type-ico {
  font-size: 26px;
  line-height: 1;
  filter: grayscale(0.2);
}
.post-type-card.active .post-type-ico { filter: none; }
.post-type-title {
  font-size: 12.5px; font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

/* ═══════════════════════════════════════════════════════════════
   LIVE PREVIEW — мини-превью прямо в форме
═══════════════════════════════════════════════════════════════ */
.live-preview {
  background: var(--bg-2);
  border: 1px dashed var(--border-2);
  border-radius: var(--r-md);
  padding: 14px 16px;
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: var(--font);
  color: var(--text);
  max-height: 320px;
  overflow-y: auto;
}
.live-preview-empty {
  color: var(--dim);
  font-style: italic;
  padding: 16px 0;
  text-align: center;
}
.live-preview-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
  margin-bottom: 6px;
  margin-top: 14px;
}
.live-preview-label .preview-flag {
  font-size: 14px;
}
.live-preview-img {
  margin-top: 10px;
  padding: 8px;
  background: var(--bg-3);
  border-radius: var(--r-sm);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: var(--muted);
}
.live-preview-img img {
  width: 60px; height: 60px;
  object-fit: cover;
  border-radius: var(--r-xs);
  background: var(--bg-4);
}

/* ═══════════════════════════════════════════════════════════════
   COUNTRY TILES — крупные плитки выбора стран
═══════════════════════════════════════════════════════════════ */
.country-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
}
.country-tile {
  display: flex; align-items: center;
  gap: 10px;
  padding: 11px 14px;
  background: var(--bg-2); border: 1.5px solid var(--border);
  border-radius: var(--r-md);
  color: var(--text); cursor: pointer;
  transition: all .15s var(--ease);
  font-family: inherit; text-align: left;
  position: relative;
  min-width: 0;
}
.country-tile:hover {
  border-color: var(--border-hi);
  background: var(--bg-3);
  transform: translateY(-1px);
}
.country-tile.selected {
  border-color: var(--acc);
  background: var(--acc-bg);
  box-shadow: 0 0 0 2px var(--acc-bg);
}
.country-tile.in-queue {
  border-color: var(--grn);
  background: var(--grn-bg);
}
.country-tile.in-queue::before {
  content: '✓';
  position: absolute;
  top: 6px; right: 8px;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: var(--grn); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700;
}
.country-tile.in-queue.selected {
  border-color: var(--acc);
  background: linear-gradient(135deg, var(--grn-bg), var(--acc-bg));
}
.country-tile-info {
  flex: 1;
  min-width: 0;
  display: flex; flex-direction: column;
  gap: 1px;
}
.country-tile-name {
  font-size: 13px; font-weight: 700;
  letter-spacing: -0.01em;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.country-tile-meta {
  font-size: 11px;
  color: var(--muted);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}
.country-tile-meta .sep { opacity: 0.4; }
.country-tile.selected .country-tile-meta-status {
  color: var(--acc); font-weight: 700;
}
.country-tile.in-queue .country-tile-meta-status {
  color: var(--grn); font-weight: 700;
}

/* Маленький SVG-флажок страны (универсально для всех ОС) */
.country-flag-svg {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  border-radius: 2px;
  overflow: hidden;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.15);
  flex-shrink: 0;
}
.country-flag-svg svg { display: block; }

/* ═══════════════════════════════════════════════════════════════
   PREVIEW APPROVAL — система утверждения текстов по странам
═══════════════════════════════════════════════════════════════ */

/* Прогресс-бар утверждения */
.approve-progress {
  position: relative;
  height: 6px;
  background: var(--bg-3);
  border-radius: 3px;
  overflow: hidden;
  margin: 8px 0 4px;
}
.approve-progress-fill {
  position: absolute;
  top: 0; bottom: 0;
  height: 100%;
  transition: width .3s var(--ease);
  border-radius: 3px;
}
.approve-progress-fill.ok    { background: var(--grn); left: 0; }
.approve-progress-fill.edited { background: #f59e0b; }

/* Шапка превью с цветным состоянием */
.preview-block {
  margin-bottom: 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--r-md);
  overflow: hidden;
  transition: border-color .15s var(--ease);
}
.preview-head {
  padding: 12px 14px;
  background: var(--bg-2);
  display: flex; align-items: center; gap: 10px;
}
.preview-head.status-approved {
  background: var(--grn-bg);
}
.preview-block:has(.status-approved),
.preview-block.has-approved { border-color: var(--grn); }
.preview-head.status-edited {
  background: rgba(245, 158, 11, 0.12);
}
.preview-head.status-pending {
  /* без выделения, обычная серая шапка */
}

/* Бейджи статуса в шапке */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.01em;
  white-space: nowrap;
}
.status-badge.ok {
  background: var(--grn);
  color: #fff;
}
.status-badge.edited {
  background: #f59e0b;
  color: #fff;
}
.status-badge.edited-ok {
  background: linear-gradient(90deg, #f59e0b 0%, var(--grn) 100%);
  color: #fff;
}
.status-badge.pending {
  background: var(--bg-4);
  color: var(--text-2);
  border: 1px solid var(--border);
}

/* Тело превью — БЕЗ max-height, текст влезает целиком */
.preview-body {
  padding: 14px;
  background: var(--bg-1);
  border-top: 1px solid var(--border);
}
.preview-text {
  background: var(--bg-2);
  padding: 14px 16px;
  border-radius: var(--r-sm);
  font-size: 13.5px;
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: var(--font);
  color: var(--text);
  /* НЕТ max-height — пусть растягивается на всю длину */
}

/* Textarea для редактирования */
.preview-textarea {
  width: 100%;
  min-height: 200px;
  padding: 14px 16px;
  background: var(--bg-2);
  border: 2px solid var(--acc);
  border-radius: var(--r-sm);
  color: var(--text);
  font-family: var(--font);
  font-size: 13.5px;
  line-height: 1.65;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
}
.preview-textarea:focus {
  border-color: var(--acc);
  box-shadow: 0 0 0 3px var(--acc-bg);
}

/* Компактные плитки городов в редакторе под выбранной страной */
.city-mini-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 4px;
}
.city-mini {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 9px;
  background: var(--bg-2); border: 1px solid var(--border);
  border-radius: var(--r-xs);
  color: var(--text); cursor: pointer;
  font-family: inherit; text-align: left;
  font-size: 12px;
  transition: all .1s var(--ease);
}
.city-mini:hover {
  border-color: var(--border-hi);
  background: var(--bg-3);
}
.city-mini.selected {
  background: var(--acc-bg);
  border-color: var(--acc);
}
.city-mini-box {
  width: 14px; height: 14px;
  border-radius: 3px;
  border: 1.5px solid var(--border-2);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 9px; color: #fff; line-height: 1;
  flex-shrink: 0;
}
.city-mini.selected .city-mini-box {
  background: var(--acc); border-color: var(--acc);
}
.city-mini-name {
  flex: 1;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* ═══════════════════════════════════════════════════════════════
   PREVIEW APPROVAL — система утверждения текстов
═══════════════════════════════════════════════════════════════ */
.callout {
  border-radius: var(--r-sm);
  padding: 12px 14px;
  font-size: 13px;
  line-height: 1.5;
}
.callout-info {
  background: var(--acc-bg);
  border: 1px solid var(--acc);
  color: var(--text);
}
.callout-muted {
  background: var(--bg-2);
  border: 1px solid var(--border);
  color: var(--text);
}
.preview-block {
  margin-bottom: 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--r-md);
  overflow: hidden;
  background: var(--bg-2);
}
.preview-head {
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: background .15s var(--ease);
}
.preview-head:hover { background: var(--bg-3); }
.preview-block .preview-head.status-approved {
  background: var(--grn-bg);
  border-bottom: 2px solid var(--grn);
}
.preview-block .preview-head.status-edited {
  background: var(--yel-bg);
  border-bottom: 2px solid var(--yel);
}
.preview-block .preview-head.status-pending {
  background: var(--bg-2);
}
.preview-body {
  padding: 16px;
  background: var(--bg-1);
  border-top: 1px solid var(--border);
}
/* Текст превью — БЕЗ скролла, во всю длину */
.preview-text {
  background: var(--bg-2);
  padding: 14px 16px;
  border-radius: var(--r-sm);
  font-size: 13.5px;
  line-height: 1.65;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: var(--font);
  border: 1px solid var(--border);
}
/* Textarea для редактирования — авто-высота */
.preview-textarea {
  width: 100%;
  background: var(--bg-2);
  color: var(--text);
  border: 2px solid var(--acc);
  border-radius: var(--r-sm);
  padding: 14px 16px;
  font-size: 13.5px;
  line-height: 1.65;
  font-family: var(--font);
  resize: vertical;
  min-height: 200px;
  outline: none;
  box-shadow: 0 0 0 3px var(--acc-bg);
}
.preview-textarea:focus {
  border-color: var(--acc);
}

/* Бейджи статуса в шапке */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: 999px;
  letter-spacing: 0.01em;
  white-space: nowrap;
}
.status-badge.ok {
  background: var(--grn);
  color: #fff;
}
.status-badge.edited {
  background: var(--yel);
  color: #fff;
}
.status-badge.edited-ok {
  background: linear-gradient(135deg, var(--yel), var(--grn));
  color: #fff;
}
.status-badge.pending {
  background: var(--bg-3);
  color: var(--muted);
  border: 1px solid var(--border);
}

/* Прогресс-бар утверждения */
.approve-progress {
  position: relative;
  height: 8px;
  background: var(--bg-3);
  border-radius: 999px;
  overflow: hidden;
  margin: 8px 0;
}
.approve-progress-fill {
  position: absolute;
  top: 0; left: 0;
  height: 100%;
  transition: width .3s var(--ease), left .3s var(--ease);
}
.approve-progress-fill.ok {
  background: var(--grn);
}
.approve-progress-fill.edited {
  background: var(--yel);
}

.country-tile-name {
  font-size: 13px; font-weight: 700;
  letter-spacing: -0.01em;
}
/* ═══════════════════════════════════════════════════════════════
   FORM CARD — лучшее визуальное разделение блоков
═══════════════════════════════════════════════════════════════ */
.form-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, var(--border), transparent);
  margin: 18px 0;
  border: none;
}
.preview-section {
  background: var(--bg);
  margin: 14px -22px -22px;
  padding: 16px 22px 18px;
  border-top: 1px solid var(--border);
  border-radius: 0 0 var(--r-md) var(--r-md);
}
@media (max-width: 720px) {
  .preview-section { margin: 14px -16px -16px; padding: 14px 16px 16px; }
}
`;

// ═══════════════════════════════════════════════════════════════
// CLIENT-SIDE SPA (сериализуется через toString)
// ═══════════════════════════════════════════════════════════════

function clientApp() {
  'use strict';

  const STORAGE_KEY_BASE = 'click-data';
  // Ключ привязан к активному проекту — у каждого свои настройки.
  const storageKey = () => state.auth.currentProjectId
    ? STORAGE_KEY_BASE + '__' + state.auth.currentProjectId
    : 'yandex-poster-data-v3';
  const THEME_KEY = 'yandex-poster-theme';

  const COUNTRY_FLAGS = {
    'Россия':'🇷🇺','Russia':'🇷🇺','РФ':'🇷🇺',
    'Казахстан':'🇰🇿','Kazakhstan':'🇰🇿','KZ':'🇰🇿',
    'Беларусь':'🇧🇾','Belarus':'🇧🇾','РБ':'🇧🇾',
    'Украина':'🇺🇦','Ukraine':'🇺🇦',
    'Узбекистан':'🇺🇿','Uzbekistan':'🇺🇿',
    'Киргизия':'🇰🇬','Кыргызстан':'🇰🇬',
    'Таджикистан':'🇹🇯','Армения':'🇦🇲','Азербайджан':'🇦🇿',
    'Грузия':'🇬🇪','Молдова':'🇲🇩','Турция':'🇹🇷',
  };
  const flagOf = (n) => COUNTRY_FLAGS[n] || '🏳️';

  /**
   * Компактный SVG-флажок страны (16×11, как реальный флаг).
   * Рисуется через inline-svg чтобы работало на всех ОС, включая Windows
   * (где эмодзи-флаги не отображаются — показывается код типа RU/KZ).
   */
  function countryFlag(name, height) {
    height = height || 14;
    const w = Math.round(height * 1.5); // соотношение 3:2 как у большинства флагов
    const cleanName = name.replace(/\s*\([^)]*\)\s*/g, '').trim();
    let svg = '';
    switch (cleanName) {
      case 'Россия':
        svg = `<svg viewBox="0 0 9 6" width="${w}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="9" height="2" fill="#fff"/><rect y="2" width="9" height="2" fill="#0039A6"/><rect y="4" width="9" height="2" fill="#D52B1E"/></svg>`;
        break;
      case 'Казахстан':
        svg = `<svg viewBox="0 0 9 6" width="${w}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="9" height="6" fill="#00AFCA"/><circle cx="4.5" cy="3" r="1.2" fill="#FEC50C"/></svg>`;
        break;
      case 'Беларусь':
        svg = `<svg viewBox="0 0 9 6" width="${w}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="9" height="4" fill="#D22730"/><rect y="4" width="9" height="2" fill="#007C30"/><rect width="0.9" height="6" fill="#fff"/></svg>`;
        break;
      case 'Кыргызстан':
      case 'Киргизия':
        svg = `<svg viewBox="0 0 9 6" width="${w}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="9" height="6" fill="#E8112D"/><circle cx="4.5" cy="3" r="1.4" fill="#FFCD00"/></svg>`;
        break;
      case 'Узбекистан':
        svg = `<svg viewBox="0 0 9 6" width="${w}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="9" height="2" fill="#1EB53A"/><rect y="2" width="9" height="2" fill="#fff"/><rect y="4" width="9" height="2" fill="#0099B5"/></svg>`;
        break;
      case 'Азербайджан':
        svg = `<svg viewBox="0 0 9 6" width="${w}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="9" height="2" fill="#00B5E2"/><rect y="2" width="9" height="2" fill="#EF3340"/><rect y="4" width="9" height="2" fill="#509E2F"/></svg>`;
        break;
      case 'Армения':
        svg = `<svg viewBox="0 0 9 6" width="${w}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="9" height="2" fill="#D90012"/><rect y="2" width="9" height="2" fill="#0033A0"/><rect y="4" width="9" height="2" fill="#F2A800"/></svg>`;
        break;
      case 'Украина':
        svg = `<svg viewBox="0 0 9 6" width="${w}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="9" height="3" fill="#005BBB"/><rect y="3" width="9" height="3" fill="#FFD500"/></svg>`;
        break;
      case 'Грузия':
        svg = `<svg viewBox="0 0 9 6" width="${w}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="9" height="6" fill="#fff"/><rect x="4" width="1" height="6" fill="#FF0000"/><rect y="2.5" width="9" height="1" fill="#FF0000"/></svg>`;
        break;
      case 'Молдова':
        svg = `<svg viewBox="0 0 9 6" width="${w}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="3" height="6" fill="#003DA5"/><rect x="3" width="3" height="6" fill="#FFD200"/><rect x="6" width="3" height="6" fill="#CE1126"/></svg>`;
        break;
      case 'Турция':
        svg = `<svg viewBox="0 0 9 6" width="${w}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="9" height="6" fill="#E30A17"/><circle cx="3.5" cy="3" r="1.3" fill="#fff"/><circle cx="3.8" cy="3" r="1.05" fill="#E30A17"/></svg>`;
        break;
      case 'Таджикистан':
        svg = `<svg viewBox="0 0 9 6" width="${w}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="9" height="2" fill="#CC0000"/><rect y="2" width="9" height="2" fill="#fff"/><rect y="4" width="9" height="2" fill="#006600"/></svg>`;
        break;
      default:
        svg = `<svg viewBox="0 0 9 6" width="${w}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="9" height="6" fill="#888"/></svg>`;
    }
    return '<span class="country-flag-svg">' + svg + '</span>';
  }

  // ─── Шаблоны контактов по странам ───
  const COUNTRY_TEMPLATES = {
    'Россия':      { site: 'stalmetural.ru', email: 'info@stalmetural.ru', phone: '+7 (499) 130-36-69',  currency: '₽',   currencyCode: 'RUB' },
    'Казахстан':   { site: 'stalmetural.kz', email: 'info@stalmetural.kz', phone: '+7 (717) 226-90-23',  currency: 'тге', currencyCode: 'KZT' },
    'Беларусь':    { site: 'stalmetural.by', email: 'info@stalmetural.by', phone: '+375 (44) 766-62-58', currency: 'BYN', currencyCode: 'BYN' },
    'Кыргызстан':  { site: 'stalmetural.kg', email: 'info@stalmetural.kg', phone: '+996 (221) 31-88-82', currency: 'с',   currencyCode: 'KGS' },
    'Узбекистан':  { site: 'stalmetural.uz', email: 'info@stalmetural.uz', phone: '+998 90-011-36-88',   currency: 'UZS', currencyCode: 'UZS' },
    'Азербайджан': { site: 'smg.az',         email: 'info@smg.az',         phone: '+994-50-573-28-67',   currency: '₼',   currencyCode: 'AZN' },
    'Армения':     { site: 'stalmetural.am', email: 'info@stalmetural.am', phone: '+7 (963) 449-99-68',  currency: 'AMD', currencyCode: 'AMD' },
  };

  const POST_TYPES = [
    { id: 'arrival',  icon: '📦', title: 'Поступление на склад', hashtag: '#Поступление_СМУ',      hasContact: true,  isInfo: false },
    { id: 'shipment', icon: '🚚', title: 'Отгрузка',              hashtag: '#Отгрузка_СМУ',         hasContact: true,  isInfo: false },
    { id: 'special',  icon: '⚡',  title: 'Спецпредложение',       hashtag: '#СПЕЦПРЕДЛОЖЕНИЕ_СМУ', hasContact: true,  isInfo: false },
    { id: 'info',     icon: 'ℹ️', title: 'Информационный пост',    hashtag: '',                       hasContact: false, isInfo: true  },
    { id: 'greeting', icon: '🎉', title: 'Поздравление',           hashtag: '',                       hasContact: false, isInfo: false },
  ];

  const COMMON_HASHTAGS = '#Стальметурал #СМУ #Металлопрокат';

  const state = {
    auth: {
      checked: false,            // проверили ли мы статус аутентификации
      needLogin: false,          // нужен экран входа
      authError: '',             // последняя ошибка
      projectsList: [],          // список 3 проектов (для экрана выбора)
      pendingProject: null,      // проект на котором сейчас экран ввода пароля
      currentProjectId: null,    // ID активного проекта (SMU/IMP/MPE)
      currentProject: null,      // публичные данные активного проекта
    },
    projects: [],
    activeProjectId: null,
    activeTab: 'run',
    publishQueue: [],
    currentDraft: {
      postType: 'arrival',           // arrival | shipment | special | info | greeting
      body: '',                      // Основной текст (включая заголовок и всё)
      imageUrl: '',
      localImages: [],               // Загруженные локальные файлы [{fileName, url, originalName, path}]
      countryIds: new Set(),         // ВЫБРАННЫЕ СТРАНЫ для этой публикации
      cityIdsByCountry: {},          // { countryId: Set<cityId> } — какие города в каждой стране
      productPhotosEnabled: false,   // включить ли загрузку фото в раздел «Товары»
      productPhotosText: '',         // URL-ы фото (по строке), парсятся при сохранении в очередь
    },
    collapsedCountries: {},
    collapsedCitiesPanel: false,
    server: { deps: false, session: false, tasks: 0, done: 0, logs: 0, reports: 0, process: { status: 'idle', action: null } },
    serverTasks: [],
    bulkMode: {},
    addingCountry: false,
    currentLogView: null,
    logViewContent: '',
    currentReportView: null,
    currentReportData: null,
    reportFilter: 'all',           // all | errors | noimg
    reportCollapsedCountries: {},  // { 'Россия': true } — свёрнута ли страна
    showRawLog: false,
    lastCompletionNotified: null,
    collapsedPreviewCountries: {},       // { countryId: true } — какие страны СВЁРНУТЫ (по умолчанию все развёрнуты)
    expandedCitiesCountry: null,         // какая страна развёрнута для редактирования городов
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => {
    if (s == null) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  };
  const uid = (p) => (p || 'id') + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
  const extractCompanyId = (url) => {
    try { const m = String(url).match(/sprav\/(\d+)/); return m ? m[1] : null; } catch { return null; }
  };

  let toastTimer = null;
  function toast(msg, kind) {
    kind = kind || 'ok';
    const el = $('#toast'); if (!el) return;
    el.className = 'toast-' + kind;
    el.textContent = msg;
    el.style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.style.display = 'none', 2800);
  }

  // ─── СЕРВЕРНОЕ ХРАНИЛИЩЕ ────────────────────────────────
  // Раньше: localStorage (только этот браузер на этом компе)
  // Теперь: файл на сервере (users-data/{projectId}/projects-config.json)
  // — настройки одинаковы на любом компе с этой папкой Click.
  //
  // loadState() — асинхронная (грузит с сервера). При первой загрузке
  // также пытается мигрировать данные из localStorage (если они есть с прошлых версий).
  async function loadState() {
    try {
      const r = await api('/api/projects/config');
      if (r && r.config) {
        state.projects = r.config.projects || [];
        state.activeProjectId = r.config.activeProjectId || null;
        state.collapsedCountries = r.config.collapsedCountries || {};
        // Если сервер применил автоматическую миграцию (например удалил устаревший город) —
        // покажем пользователю уведомление, чтобы было понятно что что-то поменялось.
        if (r.migrated) {
          // Показываем тост чуть позже, после рендера интерфейса
          setTimeout(() => {
            toast('Список городов автоматически обновлён (применены актуальные данные)', 'info');
          }, 800);
        }
        return;
      }
      // ── Миграция из localStorage (один раз) ──
      // Если на сервере пусто, но в браузере есть старые данные — переносим.
      const KEY = storageKey();
      const rawLocal = localStorage.getItem(KEY)
                    || localStorage.getItem('yandex-poster-data-v3')
                    || localStorage.getItem('yandex-poster-data-v2');
      if (rawLocal) {
        const s = JSON.parse(rawLocal);
        state.projects = s.projects || [];
        state.activeProjectId = s.activeProjectId || null;
        state.collapsedCountries = s.collapsedCountries || {};
        // Сохраняем на сервер чтобы остальные компы тоже получили
        await saveState();
        toast('Настройки перенесены из браузера на сервер', 'ok');
      }
    } catch (e) {
      console.error('loadState error:', e);
    }
  }

  // saveState — асинхронная, но мы НЕ ждём её на каждом вызове.
  // Это позволяет UI не блокироваться на сетевых запросах.
  // Запросы накапливаются и отправляются в порядке очереди (через _saveStateQueue).
  let _saveStateInFlight = false;
  let _saveStateQueued = false;
  async function saveState() {
    // Параллельно с дублированием — пишем в localStorage как страховку,
    // на случай если сервер недоступен (откроется в браузере как раньше).
    try {
      const KEY = storageKey();
      localStorage.setItem(KEY, JSON.stringify({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
        collapsedCountries: state.collapsedCountries,
      }));
    } catch {}

    // Если уже идёт запрос — просто отмечаем что нужно ещё один после
    if (_saveStateInFlight) {
      _saveStateQueued = true;
      return;
    }
    _saveStateInFlight = true;
    try {
      await api('/api/projects/config', {
        method: 'POST',
        body: {
          config: {
            projects: state.projects,
            activeProjectId: state.activeProjectId,
            collapsedCountries: state.collapsedCountries,
          },
        },
      });
    } catch (e) {
      console.error('saveState error:', e);
    } finally {
      _saveStateInFlight = false;
      if (_saveStateQueued) {
        _saveStateQueued = false;
        saveState();
      }
    }
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const sys = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    applyTheme(saved || sys);
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    const btn = $('#themeBtn');
    if (btn) btn.textContent = theme === 'light' ? '🌙' : '☀️';
    if (state.activeTab === 'settings') renderContent();
  }
  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  }

  async function api(pathStr, opts) {
    opts = opts || {};
    const init = {
      method: opts.method || 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin', // куки для авторизации
    };
    if (opts.body) init.body = JSON.stringify(opts.body);
    const r = await fetch(pathStr, init);
    const ct = r.headers.get('content-type') || '';
    let data;
    if (ct.includes('json')) data = await r.json();
    else data = await r.text();
    // Если сессия истекла — показываем экран входа
    if (r.status === 401 && typeof data === 'object' && data.needLogin) {
      state.auth.needLogin = true;
      state.auth.currentUser = null;
      renderAuthScreen();
    }
    return data;
  }
  async function refreshServerState() {
    try {
      const prevStatus = state.server?.process?.status;
      const prevAction = state.server?.process?.action;
      const s = await api('/api/status');
      state.server = s;
      const t = await api('/api/tasks');
      state.serverTasks = t.files || [];
      renderStatusPills();

      // Если процесс только что завершился — уведомляем + загружаем отчёт
      const justFinished = prevStatus === 'running' && s.process.status !== 'running';
      const actionName = prevAction || s.process.action;
      if (justFinished) {
        // Браузерное уведомление + звук
        notifyProcessFinished(actionName, s.process.status);

        // Подгрузка свежего отчёта актуализации если это была актуализация
        if (actionName === 'actualize') {
          loadLatestActualizeReport();
        }
      }

      if (state.activeTab === 'run' || state.activeTab === 'report' || state.activeTab === 'actualize') {
        if (state.server.process.status !== 'running') renderContent();
      }
    } catch (e) {}
  }

  // Просим разрешение на уведомления при первом запуске
  function requestNotificationPermission() {
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    } catch {}
  }

  // Показывает уведомление о завершении процесса + воспроизводит звук
  function notifyProcessFinished(action, status) {
    const isOk = status === 'done';
    const actionName = action === 'publish' ? 'Публикация' : action === 'actualize' ? 'Актуализация' : action === 'login' ? 'Вход' : 'Процесс';
    const title = isOk ? `✅ ${actionName} завершена` : `❌ ${actionName} завершилась с ошибкой`;
    const body = isOk ? 'Откройте отчёт чтобы увидеть детали.' : 'Проверьте лог чтобы понять причину.';

    // 1. Toast в углу
    toast((isOk ? '✅ ' : '❌ ') + actionName + ' ' + (isOk ? 'завершена' : 'с ошибкой'), isOk ? 'ok' : 'err');

    // 2. Звук
    try {
      // Простой beep через WebAudio (не требует файлов)
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const playTone = (freq, start, dur) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.value = freq;
          o.type = 'sine';
          g.gain.setValueAtTime(0, ctx.currentTime + start);
          g.gain.linearRampToValueAtTime(0.2, ctx.currentTime + start + 0.02);
          g.gain.linearRampToValueAtTime(0, ctx.currentTime + start + dur);
          o.start(ctx.currentTime + start);
          o.stop(ctx.currentTime + start + dur);
        };
        if (isOk) {
          // 3-тоновый «успех»: до–ми–соль
          playTone(523, 0, 0.15);
          playTone(659, 0.15, 0.15);
          playTone(784, 0.3, 0.25);
        } else {
          // Низкий «бзззт» — ошибка
          playTone(220, 0, 0.3);
          playTone(180, 0.3, 0.3);
        }
      }
    } catch {}

    // 3. Браузерное уведомление (если разрешено)
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        const n = new Notification('Click — ' + title, {
          body,
          icon: '/favicon.ico',
          tag: 'click-finished-' + Date.now(),
          requireInteraction: false,
        });
        // Клик по уведомлению — фокус окну
        n.onclick = () => { window.focus(); n.close(); };
        // Авто-закрытие через 10 сек
        setTimeout(() => { try { n.close(); } catch {} }, 10000);
      }
    } catch {}

    // 4. Меняем title вкладки на короткое время — чтобы пользователь увидел даже на другой вкладке
    try {
      const originalTitle = document.title;
      document.title = (isOk ? '✅ ' : '❌ ') + actionName + ' завершена — Click';
      // Возвращаем через 15 сек или при возврате на вкладку
      let restored = false;
      const restore = () => {
        if (restored) return;
        restored = true;
        document.title = originalTitle;
        document.removeEventListener('visibilitychange', restore);
      };
      document.addEventListener('visibilitychange', restore, { once: true });
      setTimeout(restore, 15000);
    } catch {}
  }

  const activeProject = () => state.projects.find(p => p.id === state.activeProjectId) || null;
  const countryById = (cid) => {
    const p = activeProject();
    return p ? (p.countries || []).find(c => c.id === cid) : null;
  };

  function renderProjectSelector() {
    const p = activeProject();
    const label = $('#projBtnLabel');
    if (label) label.textContent = p ? ('📁 ' + p.name) : '📁 Выберите проект';
    const dd = $('#projDd'); if (!dd) return;
    let html = '';
    state.projects.forEach(proj => {
      const total = (proj.countries || []).reduce((s, c) => s + (c.cities || []).length, 0);
      html += '<button class="proj-item' + (proj.id === state.activeProjectId ? ' active' : '') + '" onclick="window.__app.selectProject(\'' + proj.id + '\')">'
        + '<span class="proj-item-name">' + esc(proj.name) + '</span>'
        + '<span class="proj-item-meta">' + total + ' г.</span>'
        + '</button>';
    });
    html += '<div class="proj-add-wrap" id="projAddWrap">'
      + '<button class="btn btn-ghost btn-sm btn-block" onclick="window.__app.showAddProject()">＋ Новый проект</button>'
      + '</div>';
    dd.innerHTML = html;
  }
  function showAddProject() {
    const wrap = $('#projAddWrap'); if (!wrap) return;
    wrap.innerHTML = '<div class="proj-add-row">'
      + '<input id="newProjName" placeholder="Название..." onkeydown="if(event.key===\'Enter\')window.__app.addProject()">'
      + '<button class="btn btn-primary btn-sm" onclick="window.__app.addProject()">OK</button>'
      + '</div>';
    setTimeout(() => $('#newProjName')?.focus(), 30);
  }
  function addProject() {
    const name = ($('#newProjName')?.value || '').trim();
    if (!name) { toast('Введите название', 'err'); return; }
    const proj = { id: uid('proj'), name, email: '', password: '', countries: [], createdAt: Date.now() };
    state.projects.push(proj);
    state.activeProjectId = proj.id;
    saveState();
    renderAll();
    $('#projDd')?.classList.remove('open');
    toast('Проект создан', 'ok');
  }
  function selectProject(id) {
    state.activeProjectId = id;
    state.publishQueue = [];
    state.currentDraft = {
      postType: 'arrival', body: '', imageUrl: '', localImages: [],
      countryIds: new Set(), cityIdsByCountry: {},
      productPhotosEnabled: false, productPhotosText: '',
    };
    saveState();
    renderAll();
    $('#projDd')?.classList.remove('open');
  }
  function toggleProjectDd() { $('#projDd')?.classList.toggle('open'); }

  function switchTab(tab) {
    state.activeTab = tab;
    $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + tab));
    renderContent();
    if (tab === 'run') refreshServerState();
    if (tab === 'report') refreshReportsList();
    if (tab === 'actualize') loadLatestActualizeReport();
  }

  function renderStatusPills() {
    const el = $('#pills'); if (!el) return;
    const s = state.server;
    const pills = [
      s.deps ? ['ok', 'Программа установлена'] : ['err', 'Не установлено'],
      s.session ? ['ok', 'Авторизован'] : ['warn', 'Требуется вход'],
      s.tasks > 0 ? ['info', s.tasks + ' в очереди'] : ['warn', 'Очередь пуста'],
    ];
    el.innerHTML = pills.map(p => '<span class="pill pill-' + p[0] + '">' + esc(p[1]) + '</span>').join('');
  }

  function renderUserMenu() {
    const el = $('#userWrap'); if (!el) return;
    const proj = state.auth.currentProject;
    if (!proj) {
      el.innerHTML = '';
      return;
    }
    el.innerHTML = '<div class="user-menu">'
      + '<button class="user-btn" onclick="window.__app.toggleUserDd()" title="Активный проект" style="--proj-color: ' + esc(proj.color) + '">'
      + '<span class="user-avatar" style="background: var(--proj-color)">' + esc(proj.icon) + '</span>'
      + '<span class="user-name">' + esc(proj.name) + '</span>'
      + '</button>'
      + '<div class="user-dd" id="userDd">'
      + '<div class="user-dd-info">'
      + '<div style="font-weight:600;color:var(--text)">' + esc(proj.fullName) + '</div>'
      + '<div style="font-size:12px;color:var(--muted);margin-top:2px">📧 ' + esc(proj.yandexEmail) + '</div>'
      + '</div>'
      + '<div class="user-dd-sep"></div>'
      + '<button class="user-dd-item" onclick="window.__app.doLogout()">↻ Сменить проект</button>'
      + '</div>'
      + '</div>';
  }

  function toggleUserDd() {
    $('#userDd')?.classList.toggle('open');
  }

  function renderAll() {
    renderProjectSelector();
    renderStatusPills();
    renderUserMenu();
    renderContent();
  }
  function renderContent() {
    const view = $('#view-' + state.activeTab); if (!view) return;
    const p = activeProject();
    if (state.activeTab === 'run') view.innerHTML = tmplRun(p);
    if (state.activeTab === 'publish') view.innerHTML = tmplPublish(p);
    if (state.activeTab === 'actualize') view.innerHTML = tmplActualize(p);
    if (state.activeTab === 'cities') view.innerHTML = tmplCities(p);
    if (state.activeTab === 'report') view.innerHTML = tmplReport(p);
    if (state.activeTab === 'settings') view.innerHTML = tmplSettings(p);
    bindPublishInputs();
  }

  // ═══════════════════════════════════════════════════════
  // RUN TAB — мастер из 3 шагов
  // ═══════════════════════════════════════════════════════
  function tmplRun(_proj) {
    const s = state.server;
    const files = state.serverTasks;
    const running = s.process.status === 'running';
    const step1Done = s.deps;
    const step2Done = s.session;

    let activeStep = 1;
    if (step1Done) activeStep = 2;
    if (step1Done && step2Done) activeStep = 3;

    const stepCls = (n) => {
      if (running && activeStep === n) return 'step step-active';
      if (n < activeStep) return 'step step-done';
      if (n === activeStep) return 'step step-active';
      return 'step step-locked';
    };

    const step1 = '<div class="' + stepCls(1) + '">'
      + '<div class="step-num">' + (step1Done ? '✓' : '1') + '</div>'
      + '<div class="step-body">'
      + '<div class="step-title">📦 Установка программы</div>'
      + '<div class="step-sub">'
      + (step1Done ? 'Всё готово — программа установлена' : 'Нужно один раз скачать вспомогательные файлы (1–2 минуты)')
      + '</div>'
      + '<div class="step-action">'
      + (step1Done
        ? '<span class="step-done-mark">✓ Готово</span>'
        : '<button class="btn btn-primary" onclick="window.__app.runAction(\'install\')" ' + (running ? 'disabled' : '') + '>📦 Установить</button>')
      + '</div></div></div>';

    const step2 = '<div class="' + stepCls(2) + '">'
      + '<div class="step-num">' + (step2Done ? '✓' : '2') + '</div>'
      + '<div class="step-body">'
      + '<div class="step-title">🔐 Вход в Яндекс</div>'
      + '<div class="step-sub">'
      + (step2Done
        ? 'Вы авторизованы в Яндексе — можно публиковать. Чтобы сменить аккаунт, нажмите «Выйти из Яндекса».'
        : step1Done
          ? 'Откроется окно браузера — введите логин, пароль и код 2FA. Сессия сохранится.'
          : 'Сначала завершите установку (шаг 1)')
      + '</div>'
      + '<div class="step-action">'
      + (step2Done
        ? '<span class="step-done-mark">✓ Авторизован</span>'
          + '<button class="btn btn-ghost btn-sm" onclick="window.__app.doYandexLogout()" ' + (running ? 'disabled' : '') + '>🚪 Выйти из Яндекса</button>'
        : '<button class="btn btn-primary" onclick="window.__app.runAction(\'login\')" ' + (!step1Done || running ? 'disabled' : '') + '>🔐 Войти в Яндекс</button>')
      + '</div></div></div>';

    let step3Action;
    if (!step1Done || !step2Done) {
      step3Action = '<button class="btn btn-primary" disabled>📤 Опубликовать</button>'
        + '<span class="hint" style="margin-left:10px">Завершите предыдущие шаги</span>';
    } else if (files.length === 0) {
      step3Action = '<button class="btn btn-primary" disabled>📤 Опубликовать</button>'
        + '<button class="btn btn-secondary btn-sm" onclick="window.__app.switchTab(\'publish\')">➕ Собрать посты</button>';
    } else {
      step3Action = '<button class="btn btn-primary" onclick="window.__app.runAction(\'publish\')" ' + (running ? 'disabled' : '') + '>📤 Опубликовать (' + files.length + ')</button>'
        + '<button class="btn btn-ghost btn-sm" onclick="window.__app.switchTab(\'publish\')">➕ Добавить ещё</button>';
    }

    const step3 = '<div class="' + stepCls(3) + '">'
      + '<div class="step-num">3</div>'
      + '<div class="step-body">'
      + '<div class="step-title">📤 Публикация постов</div>'
      + '<div class="step-sub">'
      + (files.length === 0
        ? 'В очереди пока нет постов — соберите их во вкладке «📤 Публикация»'
        : files.length + ' пакет(ов) в очереди · ' + files.reduce((sum, f) => sum + (f.cities || 0), 0) + ' городов всего')
      + '</div>'
      + '<div class="step-action">' + step3Action + '</div>'
      + '</div></div>';

    let progressHtml = '';
    if (running) {
      const labels = { install: 'Устанавливаю программу', login: 'Открываю окно входа', publish: 'Публикую посты' };
      progressHtml = '<div class="run-progress">'
        + '<div class="run-progress-ico">⚡</div>'
        + '<div class="run-progress-text">'
        + '<div class="run-progress-title">' + esc(labels[s.process.action] || 'Выполняется') + '…</div>'
        + '<div class="run-progress-sub">Следите за прогрессом ниже. Не закрывайте вкладку.</div>'
        + '</div>'
        + '<button class="btn btn-danger btn-sm" onclick="window.__app.stopAction()">⏹ Остановить</button>'
        + '</div>';
    }

    let liveLogHtml = '';
    if (running || s.process.status === 'done' || s.process.status === 'error') {
      liveLogHtml = '<div class="card">'
        + '<div class="card-header">'
        + '<div class="card-title"><span class="card-title-ico">📡</span>Что происходит сейчас</div>'
        + (!running && state.server.reports > 0
          ? '<button class="btn btn-success btn-sm" onclick="window.__app.switchTab(\'report\')">📊 Посмотреть отчёт</button>'
          : '')
        + '</div>'
        + '<div class="log-box" id="liveLog" style="max-height:320px"><div class="log-placeholder">Ожидание вывода…</div></div>'
        + '</div>';
    }

    let queueHtml = '';
    if (files.length > 0) {
      queueHtml = '<div class="card">'
        + '<div class="card-header">'
        + '<div class="card-title"><span class="card-title-ico">📋</span>Посты в очереди (' + files.length + ' пакет(ов))</div>'
        + '<button class="btn btn-danger btn-sm" onclick="window.__app.clearAllServerTasks()" ' + (running ? 'disabled' : '') + '>🗑 Очистить всё</button>'
        + '</div>'
        + '<div class="queue-list">' + files.map(f =>
          '<div class="file-row">'
          + '<div class="file-icon">' + flagOf(f.country) + '</div>'
          + '<div class="file-meta">'
          + '<div class="file-name">' + esc(f.country) + ' · ' + f.cities + ' городов</div>'
          + '<div class="file-sub">' + esc(f.project) + ' · ' + esc(f.name) + '</div>'
          + '</div>'
          + '<button class="btn btn-ghost btn-xs" onclick="window.__app.deleteServerTask(\'' + esc(f.name) + '\')" ' + (running ? 'disabled' : '') + '>🗑</button>'
          + '</div>').join('')
        + '</div></div>';
    }

    return progressHtml
      + '<div class="card">'
      + '<div class="card-header"><div class="card-title"><span class="card-title-ico">🚀</span>Три простых шага</div></div>'
      + '<div class="stepper">' + step1 + step2 + step3 + '</div>'
      + '</div>'
      + liveLogHtml
      + queueHtml;
  }

  async function runAction(action) {
    try {
      const r = await api('/api/run', { method: 'POST', body: { action } });
      if (r.error) { toast('Ошибка: ' + r.error, 'err'); return; }
      const labels = {
        install: 'Установка запущена',
        login: 'Открываю окно входа',
        logout: 'Открываю окно для выхода из Яндекса',
        publish: 'Публикация запущена',
        actualize: 'Актуализация запущена',
      };
      toast(labels[action] || 'Запущено', 'info');
      startLogPolling();
      await refreshServerState();
      renderContent();
    } catch (e) { toast('Ошибка соединения', 'err'); }
  }

  async function doYandexLogout() {
    const proj = state.auth.currentProject;
    const projName = proj ? proj.name : 'текущего';
    const msg = `Выйти из Яндекса для проекта «${projName}»?\n\nОткроется окно браузера:\n  1. Нажмите на аватарку в углу\n  2. Выберите «Выйти из аккаунта»\n  3. Закройте окно браузера\n\nClick удалит сохранённую сессию и cookies.`;
    if (!confirm(msg)) return;
    await runAction('logout');
  }

  // Удалить загруженный локально файл из черновика
  async function removeLocalImage(index) {
    if (!Array.isArray(state.currentDraft.localImages)) return;
    const img = state.currentDraft.localImages[index];
    if (!img) return;
    // Удаляем с сервера
    try {
      await fetch('/api/uploads/' + encodeURIComponent(img.fileName), { method: 'DELETE' });
    } catch {}
    state.currentDraft.localImages.splice(index, 1);
    renderContent();
    updateLivePreview();
  }
  async function stopAction() {
    if (state.server.process.action === 'publish') {
      if (!confirm('Остановить публикацию?\n\nТекущий город будет дописан до конца, потом скрипт завершится. Это безопасно — никаких дублей не будет.')) return;
    } else {
      if (!confirm('Остановить выполняющийся процесс?')) return;
    }
    try { await api('/api/stop', { method: 'POST' }); toast('Остановка запрошена', 'info'); } catch {}
  }

  let logPollTimer = null;
  function startLogPolling() {
    if (logPollTimer) return;
    logPollTimer = setInterval(async () => {
      try {
        const r = await api('/api/log');
        updateLiveLog(r.log || '');
        const wasRunning = state.server.process.status === 'running';
        state.server.process = { status: r.status, action: r.action };
        if (r.status === 'done' || r.status === 'error') {
          clearInterval(logPollTimer); logPollTimer = null;
          await refreshServerState();
          if (wasRunning && state.server.reports > 0) {
            try {
              const reps = await api('/api/reports');
              const latest = reps.files?.[0];
              if (latest && latest.name !== state.lastCompletionNotified) {
                state.lastCompletionNotified = latest.name;
                const t = latest.totals || {};
                if (t.total > 0) {
                  const ok = t.ok || 0;
                  const failed = (t.failed || 0) + (t.noImage || 0);
                  const msg = '✅ Готово: ' + ok + '/' + t.total + ' успешно'
                    + (failed > 0 ? ', ' + failed + ' с проблемами' : '');
                  toast(msg, failed > 0 ? 'info' : 'ok');
                }
              }
            } catch {}
          }
          setTimeout(() => { if (state.activeTab === 'run') renderContent(); }, 400);
        }
      } catch {}
    }, 900);
  }
  function updateLiveLog(text) {
    const el = $('#liveLog'); if (!el) return;
    if (!text) { el.innerHTML = '<div class="log-placeholder">Запускается…</div>'; return; }
    const html = text.split('\n').map(line => {
      const e = esc(line);
      if (/✅|успешно|INFO/i.test(line)) return '<span class="log-ok">' + e + '</span>';
      if (/❌|ERROR/i.test(line)) return '<span class="log-err">' + e + '</span>';
      if (/⚠️|WARN/i.test(line)) return '<span class="log-warn">' + e + '</span>';
      if (/^\s*\[/.test(line)) return '<span class="log-dim">' + e + '</span>';
      return e;
    }).join('\n');
    el.innerHTML = html;
    el.scrollTop = el.scrollHeight;
  }

  async function deleteServerTask(name) {
    if (!confirm('Удалить файл ' + name + '?')) return;
    await api('/api/tasks/delete', { method: 'POST', body: { name } });
    await refreshServerState(); renderContent();
  }
  async function clearAllServerTasks() {
    if (!confirm('Удалить все файлы из очереди?')) return;
    await api('/api/tasks/clear', { method: 'POST' });
    await refreshServerState(); renderContent();
  }
  async function openFolder(target) { await api('/api/open-folder', { method: 'POST', body: { target } }); }

  // ═══════════════════════════════════════════════════════
  // PUBLISH TAB — новая логика: тип поста + автоконтакты
  // ═══════════════════════════════════════════════════════

  /**
   * Сборка финального текста поста для конкретной страны
   * (то что реально пойдёт в Яндекс.Бизнес)
   */
  function buildFinalText(country, draft) {
    const lines = [];
    const type = POST_TYPES.find(t => t.id === draft.postType);

    // Основной текст (пользователь пишет всё сам, включая цену если она нужна)
    if (draft.body.trim()) lines.push(draft.body.trim());

    // ─── Окончание поста ───
    const projEndings = state.auth?.currentProject?.endings;

    // Динамические окончания для ИМП/МПЭ — для каждого типа поста свой шаблон,
    // в шаблон подставляются контакты страны.
    if (projEndings && projEndings.__dynamic) {
      const contacts = projEndings.contacts[country.name] || null;
      const templates = projEndings.templates || {};
      const template = templates[draft.postType];

      if (!template) {
        // greeting — без окончания (или неизвестный тип)
        return lines.join('\n');
      }
      if (!contacts) {
        // Страны нет в контактах — окончание не вставляем
        return lines.join('\n');
      }

      // Подстановка плейсхолдеров:
      //   {site}, {email}, {phone}                 — простые поля
      //   {phoneLine}, {phoneSpecialLine}, {phoneSpecialLineMpe}
      //                                            — целые строки с префиксом, которые
      //                                              исчезают если phone === null
      const subst = (tpl) => {
        // Сначала разбиваем на строки и для каждой решаем: оставить, заменить или удалить
        const lines2 = tpl.split('\n').map(ln => {
          // Если строка ЦЕЛИКОМ состоит из одного плейсхолдера-телефона —
          // и телефона нет, удаляем строку (вернём null чтобы отфильтровать)
          if (ln.trim() === '{phoneLine}' && !contacts.phone) return null;
          if (ln.trim() === '{phoneSpecialLine}' && !contacts.phone) return null;
          if (ln.trim() === '{phoneSpecialLineMpe}' && !contacts.phone) return null;
          // Иначе делаем замены
          return ln
            .replace(/\{site\}/g, contacts.site || '')
            .replace(/\{email\}/g, contacts.email || '')
            .replace(/\{phone\}/g, contacts.phone || '')
            .replace(/\{phoneLine\}/g, contacts.phone ? `📞 ${contacts.phone}` : '')
            .replace(/\{phoneSpecialLine\}/g, contacts.phone ? `☎️ ${contacts.phone}` : '')
            .replace(/\{phoneSpecialLineMpe\}/g, contacts.phone ? `📱 Телефон: ${contacts.phone}` : '');
        }).filter(ln => ln !== null);
        // Схлопываем подряд идущие пустые строки в одну
        return lines2.filter((ln, idx, arr) => {
          if (ln.trim() !== '') return true;
          if (idx > 0 && arr[idx - 1].trim() === '') return false;
          return true;
        }).join('\n');
      };

      lines.push('');
      lines.push(subst(template));
      return lines.join('\n');
    }

    // ─── Старая логика для СМУ (по странам, через COUNTRY_TEMPLATES) ───
    const tpl = COUNTRY_TEMPLATES[country.name] || COUNTRY_TEMPLATES['Россия'];

    // Концовка
    if (type.hasContact) {
      lines.push('');
      lines.push('Ознакомиться с наличием металлопроката в вашем городе, оформить заказ и проконсультироваться с менеджерами можно на нашем сайте:');
      lines.push(`🌐 ${tpl.site}`);
      lines.push(`📩 ${tpl.email}`);
      lines.push(`📞 ${tpl.phone}`);
      lines.push('');
      lines.push(`${type.hashtag} ${COMMON_HASHTAGS}`.trim());
    } else if (type.isInfo) {
      lines.push('');
      lines.push(`Ознакомиться с ассортиментом трубного проката и техническими параметрами можно на нашем сайте ${tpl.site}`);
    }

    return lines.join('\n');
  }

  function tmplPublish(proj) {
    if (!proj) return emptyNoProject();
    const countries = proj.countries || [];
    if (countries.length === 0) return emptyNoCities('Сначала добавьте страны и города во вкладке «Города»');

    const draft = state.currentDraft;
    const type = POST_TYPES.find(t => t.id === draft.postType) || POST_TYPES[0];

    // ── Шаг 1: Тип поста ──
    const typeButtonsHtml = '<div class="post-type-grid">' + POST_TYPES.map(t => {
      const active = t.id === draft.postType;
      return '<button class="post-type-card' + (active ? ' active' : '') + '" onclick="window.__app.selectPostType(\'' + t.id + '\')">'
        + '<div class="post-type-ico">' + t.icon + '</div>'
        + '<div class="post-type-title">' + esc(t.title) + '</div>'
        + '</button>';
    }).join('') + '</div>';

    // ── Шаг 2: Форма ──
    const bodyField = '<div class="field">'
      + '<label class="label">Основной текст ' + (type.isInfo ? '' : '(без контактов)') + '</label>'
      + '<textarea class="textarea textarea-autogrow" id="fldBody" rows="6" placeholder="Текст поста...">' + esc(draft.body) + '</textarea>'
      + '</div>';

    // Список загруженных локальных файлов (если есть)
    const localImagesHtml = (draft.localImages && draft.localImages.length > 0)
      ? '<div class="local-images-list" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px">'
        + draft.localImages.map((img, idx) =>
            '<div class="local-image-chip" style="position:relative;background:var(--bg-2);border:1px solid var(--border);border-radius:8px;padding:6px 32px 6px 8px;display:flex;align-items:center;gap:8px">'
            + '<img src="' + esc(img.url) + '" style="width:36px;height:36px;object-fit:cover;border-radius:4px" alt="">'
            + '<div style="display:flex;flex-direction:column;gap:2px;min-width:0">'
            + '<span style="font-size:12px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px" title="' + esc(img.originalName || img.fileName) + '">' + esc(img.originalName || img.fileName) + '</span>'
            + '<span style="font-size:10px;color:var(--muted)">локальный файл</span>'
            + '</div>'
            + '<button type="button" class="btn-x" onclick="window.__app.removeLocalImage(' + idx + ')" style="position:absolute;right:6px;top:50%;transform:translateY(-50%);width:20px;height:20px;border-radius:50%;border:none;background:rgba(255,80,80,0.15);color:#ff6464;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;padding:0" title="Удалить файл">×</button>'
            + '</div>'
          ).join('')
        + '</div>'
      : '';

    const imgField = '<div class="field">'
      + '<label class="label">Картинки <span style="color:var(--muted);font-weight:500;text-transform:none;letter-spacing:0">(до 4 для поста)</span></label>'
      + '<div style="display:flex;gap:8px;align-items:flex-start;flex-wrap:wrap">'
      + '<textarea class="textarea input-mono" id="fldImg" rows="3" placeholder="Можно: ссылки (по строке) ИЛИ загрузить файлы кнопкой справа &#10;https://ibb.co/abc/foto1.jpg&#10;https://ibb.co/xyz/foto2.jpg" style="flex:1;min-width:240px">' + esc(draft.imageUrl) + '</textarea>'
      + '<div style="display:flex;flex-direction:column;gap:6px">'
      + '<input type="file" id="fldImgFile" accept="image/jpeg,image/png,image/webp,image/gif" multiple style="display:none">'
      + '<button type="button" class="btn btn-secondary" onclick="document.getElementById(\'fldImgFile\').click()" style="white-space:nowrap">📁 Выбрать файл</button>'
      + '<span style="font-size:11px;color:var(--muted);text-align:center">до 20 МБ</span>'
      + '</div>'
      + '</div>'
      + localImagesHtml
      + '<div class="hint">Можно ссылки (ImgBB / Imgur / Я.Диск) ИЛИ загрузить файлы с компьютера. Если есть проблемы с интернетом — лучше загружайте файлы.</div>'
      + '</div>';

    // ── Доп. блок: загрузка фото в раздел «Товары» (видим только для «Отгрузка») ──
    // Можно расширить условие, если нужно для других типов.
    const showProductPhotos = draft.postType === 'shipment';
    const productPhotosField = showProductPhotos
      ? '<div class="field product-photos-field" style="margin-top:18px;padding:14px;border:1px dashed var(--border);border-radius:var(--r-sm);background:var(--bg-2)">'
        + '<label class="toggle-row" style="display:flex;align-items:center;gap:10px;cursor:pointer;user-select:none">'
        + '<input type="checkbox" id="fldProductPhotosEnabled" ' + (draft.productPhotosEnabled ? 'checked' : '') + ' style="width:18px;height:18px;cursor:pointer;flex:none">'
        + '<span style="font-weight:700;font-size:13px">📸 Загрузить фото в раздел «Фото и видео → Товары»</span>'
        + '</label>'
        + '<div class="hint" style="margin-top:6px">После публикации поста фотографии будут добавлены в раздел <b>«Товары»</b> карточки Яндекс.Бизнес каждого выбранного города.</div>'
        + (draft.productPhotosEnabled
          ? '<div style="margin-top:12px"><label class="label">Ссылки на фото (по одной в строке)</label>'
            + '<textarea class="textarea input-mono" id="fldProductPhotos" rows="4" placeholder="https://i.ibb.co/abc/foto1.jpg&#10;https://i.ibb.co/xyz/foto2.jpg&#10;https://i.ibb.co/def/foto3.jpg">' + esc(draft.productPhotosText || '') + '</textarea>'
            + '<div class="hint">Можно сразу несколько. Загрузятся все вместе. Поддержка ImgBB / прямые ссылки .jpg /.png.</div>'
            + '</div>'
          : '')
        + '</div>'
      : '';

    // ── Шаг 3: Выбор стран ──
    const countryInQueueCount = (cId) => state.publishQueue.filter(item => item.countryId === cId).length;
    const countriesPickerHtml = '<div class="country-grid">' + countries.map(c => {
      const sel = draft.countryIds.has(c.id);
      const queuedTimes = countryInQueueCount(c.id);
      const inQueue = queuedTimes > 0;
      let cls = 'country-tile';
      if (sel) cls += ' selected';
      else if (inQueue) cls += ' in-queue';
      const statusText = sel
        ? '<span class="country-tile-meta-status">● выбрана сейчас</span>'
        : inQueue
        ? '<span class="country-tile-meta-status">в очереди' + (queuedTimes > 1 ? ' ×' + queuedTimes : '') + '</span>'
        : '';
      return '<button class="' + cls + '" onclick="window.__app.toggleCountryInDraft(\'' + c.id + '\')">'
        + countryFlag(c.name, 16)
        + '<div class="country-tile-info">'
        + '<div class="country-tile-name">' + esc(c.name) + '</div>'
        + '<div class="country-tile-meta"><span>' + (c.cities || []).length + ' гор.</span>'
        + (statusText ? '<span class="sep">·</span>' + statusText : '')
        + '</div>'
        + '</div>'
        + '</button>';
    }).join('') + '</div>';

    // ── Под сеткой: редакторы городов для ВЫБРАННЫХ стран ──
    const selectedCountries = countries.filter(c => draft.countryIds.has(c.id));
    let citiesEditorsHtml = '';
    if (selectedCountries.length > 0) {
      citiesEditorsHtml = '<div style="margin-top:14px;display:flex;flex-direction:column;gap:6px">'
        + selectedCountries.map(c => {
          const cityIds = draft.cityIdsByCountry[c.id] || new Set();
          const totalCities = (c.cities || []).length;
          const selectedCount = cityIds.size;
          const allSelected = totalCities > 0 && selectedCount === totalCities;
          const expanded = state.expandedCitiesCountry === c.id;
          const summary = allSelected
            ? '<span style="color:var(--grn);font-weight:700">✓ все ' + totalCities + ' городов</span>'
            : selectedCount === 0
            ? '<span style="color:var(--red);font-weight:700">⚠ ни одного города</span>'
            : '<span style="color:var(--acc);font-weight:700">' + selectedCount + ' из ' + totalCities + '</span>';

          let citiesGrid = '';
          if (expanded) {
            citiesGrid = '<div style="padding:12px 14px;background:var(--bg-1);border-top:1px solid var(--border)">'
              + '<div class="row" style="margin-bottom:10px;align-items:center;gap:8px">'
              + '<button class="btn btn-secondary btn-xs" onclick="window.__app.toggleAllCitiesForCountry(\'' + c.id + '\')">' + (allSelected ? 'Снять все' : 'Выбрать все') + '</button>'
              + '<span class="hint" style="margin:0">Кликайте по городам чтобы исключить/добавить</span>'
              + '</div>'
              + (totalCities === 0
                ? '<div style="padding:10px;color:var(--muted);font-size:12px">Городов нет — добавьте во вкладке «Города»</div>'
                : '<div class="city-mini-grid">' + c.cities.map(city => {
                    const sel = cityIds.has(city.id);
                    return '<button class="city-mini' + (sel ? ' selected' : '') + '" onclick="window.__app.toggleCityForCountry(\'' + c.id + '\',\'' + city.id + '\')">'
                      + '<span class="city-mini-box">' + (sel ? '✓' : '') + '</span>'
                      + '<span class="city-mini-name">' + esc(city.name) + '</span>'
                      + '</button>';
                  }).join('') + '</div>')
              + '</div>';
          }

          return '<div style="border:1px solid var(--border);border-radius:var(--r-sm);overflow:hidden;background:var(--bg-2)">'
            + '<div class="collapsible-head" onclick="window.__app.toggleCitiesEditor(\'' + c.id + '\')" style="padding:10px 14px;display:flex;align-items:center;gap:10px;font-size:13px">'
            + countryFlag(c.name, 14)
            + '<span style="font-weight:700">' + esc(c.name) + '</span>'
            + '<span style="flex:1"></span>'
            + summary
            + '<span style="font-size:11px;color:var(--muted)">' + (expanded ? 'свернуть' : 'изменить') + '</span>'
            + '<span class="chevron" style="' + (expanded ? '' : 'transform:rotate(-90deg)') + '">▾</span>'
            + '</div>'
            + citiesGrid
            + '</div>';
        }).join('')
        + '</div>';
    }

    // ── Шаг 4: Превью по странам — ПРОСТАЯ автогенерация, всегда раскрыто ──
    let previewHtml = '';
    if (selectedCountries.length > 0 && draft.body.trim()) {
      previewHtml = '<div class="card">'
        + '<div class="card-header"><div class="card-title"><span class="card-title-ico">👁</span>Превью по странам · ' + selectedCountries.length + '</div>'
        + '<div class="hint">Текст соберётся автоматически: ваш текст + контакты + хэштеги для страны.</div>'
        + '</div>'
        + selectedCountries.map(c => {
          // Для СМУ — проверяем что страна знакома (есть COUNTRY_TEMPLATES).
          // Для ИМП/МПЭ — окончания одни для всех стран, проверка не нужна.
          const hasProjectEndings3 = !!state.auth?.currentProject?.endings;
          const tpl = COUNTRY_TEMPLATES[c.name];
          if (!hasProjectEndings3 && !tpl) {
            return '<div class="report-row err"><div class="report-row-ico">⚠️</div><div class="report-row-reason">Страна «' + esc(c.name) + '» не имеет шаблона. Переименуйте её во вкладке «Города» в одно из: ' + Object.keys(COUNTRY_TEMPLATES).join(', ') + '</div></div>';
          }
          const finalText = buildFinalText(c, draft);
          const collapsed = state.collapsedPreviewCountries[c.id] === true;
          const cityIds = draft.cityIdsByCountry[c.id] || new Set();
          const totalCities = (c.cities || []).length;
          const selectedCount = cityIds.size;

          return '<div data-preview-country="' + c.id + '" class="preview-block">'
            + '<div class="collapsible-head" onclick="window.__app.togglePreviewCountry(\'' + c.id + '\')" style="padding:12px 14px;background:var(--bg-2);display:flex;align-items:center;gap:10px">'
            + countryFlag(c.name, 16)
            + '<span style="flex:1;font-weight:700">' + esc(c.name) + '</span>'
            + '<span class="badge badge-muted">' + selectedCount + '/' + totalCities + ' гор.</span>'
            + '<span class="chevron" style="' + (collapsed ? 'transform:rotate(-90deg)' : '') + '">▾</span>'
            + '</div>'
            + (collapsed ? '' : '<div class="preview-body">'
              + '<div class="preview-text">' + esc(finalText) + '</div>'
              + ((() => {
                const urls = (draft.imageUrl || '').split(/\r?\n/).map(s => s.trim()).filter(s => /^https?:\/\//i.test(s));
                if (urls.length === 0) return '';
                const first = urls[0];
                const more = urls.length > 1 ? ' <span style="color:var(--acc);font-weight:600">+' + (urls.length - 1) + ' фото</span>' : '';
                return '<div class="live-preview-img" style="margin-top:10px"><img src="' + esc(first) + '" alt="" onerror="this.style.display=\'none\'">📎 ' + esc(first.slice(0, 60)) + (first.length > 60 ? '…' : '') + more + '</div>';
              })())
              + '</div>')
            + '</div>';
        }).join('')
        + '</div>';
    }

    // ── Кнопка добавления в очередь ──
    const totalSelectedCities = selectedCountries.reduce((s, c) => {
      const ids = draft.cityIdsByCountry[c.id] || new Set();
      return s + ids.size;
    }, 0);

    const canAdd = draft.body.trim() && totalSelectedCities > 0;
    const addBtnLabel = canAdd
      ? '➕ Добавить в очередь (' + totalSelectedCities + ' постов)'
      : !draft.body.trim()
        ? '✏️ Заполните основной текст'
        : '🌍 Выберите страны';

    // ── Очередь к сохранению ──
    const queueDraftHtml = state.publishQueue.length > 0 ? '<div class="card">'
      + '<div class="card-header">'
      + '<div class="card-title"><span class="card-title-ico">📦</span>В очереди к сохранению<span class="badge badge-accent">' + state.publishQueue.length + '</span></div>'
      + '<button class="btn btn-ghost btn-sm" onclick="window.__app.clearDraftQueue()">Очистить</button>'
      + '</div>'
      + '<div class="queue-list">' + state.publishQueue.map((item, i) => {
        const country = countries.find(c => c.id === item.countryId);
        const flagHtml = country ? countryFlag(country.name, 14) : '';
        const preview = (item.text || '').slice(0, 100) + ((item.text || '').length > 100 ? '…' : '');
        return '<div class="queue-item">'
          + '<div class="queue-item-head"><div class="queue-item-title">' + flagHtml + '<span>' + esc(country ? country.name : '—') + '</span><span class="badge badge-muted">' + item.cityIds.length + ' г.</span>' + ((item.imageUrl || item.imagePath) ? '<span class="badge badge-success">🖼</span>' : '') + (item.productPhotos && item.productPhotos.length > 0 ? '<span class="badge badge-accent" title="Фото в раздел «Товары»">📸 ' + item.productPhotos.length + '</span>' : '') + '</div>'
          + '<button class="btn btn-ghost btn-xs" onclick="window.__app.removeFromDraftQueue(' + i + ')">🗑</button>'
          + '</div>'
          + '<div class="queue-item-text">' + esc(preview) + '</div>'
          + '</div>';
      }).join('') + '</div>'
      + '<hr class="divider">'
      + '<button class="btn btn-success btn-lg btn-block" onclick="window.__app.saveQueueToServer()">💾 Сохранить ' + state.publishQueue.length + ' в очередь</button>'
      + '</div>' : '';

    return '<div class="card">'
      + '<div class="card-header"><div class="card-title"><span class="card-title-ico">📝</span>Тип поста</div></div>'
      + typeButtonsHtml
      + '</div>'
      + '<div class="card">'
      + '<div class="card-header"><div class="card-title"><span class="card-title-ico">🌍</span>Страны для публикации<span class="badge badge-accent">' + selectedCountries.length + '</span></div>'
      + '<button class="btn btn-ghost btn-sm" onclick="window.__app.toggleAllCountriesInDraft()">' + (selectedCountries.length === countries.length ? 'Снять все' : 'Выбрать все') + '</button>'
      + '</div>'
      + countriesPickerHtml
      + citiesEditorsHtml
      + '</div>'
      + '<div class="card">'
      + '<div class="card-header"><div class="card-title">' + type.icon + ' ' + esc(type.title) + '</div></div>'
      + bodyField
      + imgField
      + productPhotosField
      + '</div>'
      + previewHtml
      + '<div class="card">'
      + '<button class="btn btn-primary btn-lg btn-block" onclick="window.__app.addToDraftQueue()" ' + (canAdd ? '' : 'disabled') + '>'
      + addBtnLabel
      + '</button>'
      + '</div>'
      + queueDraftHtml;
  }

  // Автоподгонка высоты textarea под содержимое
  function autoGrowTextarea(el) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = (el.scrollHeight + 2) + 'px';
  }

  function bindPublishInputs() {
    const b = $('#fldBody');
    if (b) {
      autoGrowTextarea(b);
      b.addEventListener('input', e => {
        autoGrowTextarea(e.target);
        state.currentDraft.body = e.target.value;
        updateLivePreview();
      });
    }
    const i = $('#fldImg');
    if (i) {
      autoGrowTextarea(i);
      i.addEventListener('input', e => {
        autoGrowTextarea(e.target);
        state.currentDraft.imageUrl = e.target.value;
        updateLivePreview();
      });
    }

    // Загрузка локального файла
    const fileInput = $('#fldImgFile');
    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        // Сбрасываем input чтобы повторный выбор того же файла сработал
        e.target.value = '';
        // Загружаем все файлы по очереди
        for (const file of files) {
          if (file.size > 20 * 1024 * 1024) {
            toast(`Файл "${file.name}" больше 20 МБ — пропущен`, 'err');
            continue;
          }
          try {
            const formData = new FormData();
            formData.append('file', file);
            const r = await fetch('/api/upload-image', {
              method: 'POST',
              body: formData,
            });
            const data = await r.json();
            if (data.error) {
              toast(`Ошибка загрузки "${file.name}": ${data.error}`, 'err');
              continue;
            }
            // Добавляем в state.currentDraft.localImages
            if (!Array.isArray(state.currentDraft.localImages)) {
              state.currentDraft.localImages = [];
            }
            // Ограничение: всего не более 4 (включая URL'ы)
            const urlCount = (state.currentDraft.imageUrl || '').split(/\r?\n/).filter(s => s.trim() && /^https?:\/\//i.test(s.trim())).length;
            const totalAfter = state.currentDraft.localImages.length + urlCount + 1;
            if (totalAfter > 4) {
              toast(`В пост можно максимум 4 фото. Уже выбрано ${totalAfter - 1} — файл "${file.name}" не добавлен.`, 'err');
              // Сразу удаляем загруженный файл с сервера чтобы не копился мусор
              try { await fetch('/api/uploads/' + encodeURIComponent(data.fileName), { method: 'DELETE' }); } catch {}
              continue;
            }
            state.currentDraft.localImages.push({
              fileName: data.fileName,
              url: data.url,
              path: data.path,
              originalName: data.originalName,
            });
            toast(`✓ Загружено: ${data.originalName}`, 'ok');
          } catch (err) {
            toast(`Ошибка загрузки: ${err.message}`, 'err');
          }
        }
        renderContent();
        updateLivePreview();
      });
    }

    // Чекбокс включения фото товаров — нужен renderContent чтобы показать/скрыть textarea
    const cb = $('#fldProductPhotosEnabled');
    if (cb) cb.addEventListener('change', e => {
      state.currentDraft.productPhotosEnabled = e.target.checked;
      renderContent();
    });

    // Textarea URL-ов фото — НЕ требует ререндера (сохраняем при каждом вводе)
    const pp = $('#fldProductPhotos');
    if (pp) {
      autoGrowTextarea(pp);
      pp.addEventListener('input', e => {
        autoGrowTextarea(e.target);
        state.currentDraft.productPhotosText = e.target.value;
      });
    }
  }

  /**
   * Обновляет превью раскрытых стран без полного ререндера —
   * чтобы не терять фокус в textarea.
   */
  function updateLivePreview() {
    const p = activeProject();
    if (!p) return;
    const draft = state.currentDraft;
    let needFullRender = false;
    const hasProjectEndings2 = !!state.auth?.currentProject?.endings;
    for (const countryId of draft.countryIds) {
      if (state.collapsedPreviewCountries[countryId]) continue;
      const c = (p.countries || []).find(x => x.id === countryId);
      if (!c) continue;
      if (!hasProjectEndings2 && !COUNTRY_TEMPLATES[c.name]) continue;
      const targetText = buildFinalText(c, draft);
      const box = document.querySelector('[data-preview-country="' + c.id + '"] .preview-text');
      if (box) {
        box.textContent = targetText;
      } else {
        // Превью-блок ещё не отрисован — нужен полный рендер
        needFullRender = true;
      }
    }
    if (needFullRender) {
      renderContent();
      // После ререндера — возвращаем фокус в textarea (renderContent уничтожил)
      const ta = $('#fldBody');
      if (ta) {
        ta.focus();
        try {
          const len = ta.value.length;
          ta.setSelectionRange(len, len);
        } catch {}
      }
    }
  }

  function selectPostType(typeId) {
    const prevType = state.currentDraft.postType;
    state.currentDraft.postType = typeId;
    // При смене типа сбрасываем флаг подавления напоминания —
    // если человек переключился, напоминание снова актуально
    if (prevType !== typeId) state.skipShipmentPhotosWarning = false;
    renderContent();
  }
  function toggleCountryInDraft(countryId) {
    const draft = state.currentDraft;
    const c = countryById(countryId);
    if (!c) return;
    if (draft.countryIds.has(countryId)) {
      draft.countryIds.delete(countryId);
      delete draft.cityIdsByCountry[countryId];
    } else {
      // Проверка: эта страна уже добавлена в очередь (может быть случайно дубль)
      const alreadyInQueue = state.publishQueue.some(item => item.countryId === countryId);
      if (alreadyInQueue) {
        if (!confirm('Страна «' + c.name + '» уже добавлена в очередь.\n\nТочно хотите выбрать её ещё раз? Будет создан второй пост в те же города.')) {
          return;
        }
      }
      draft.countryIds.add(countryId);
      // Автовыбор всех городов
      draft.cityIdsByCountry[countryId] = new Set((c.cities || []).map(x => x.id));
    }
    renderContent();
  }

  function toggleAllCountriesInDraft() {
    const p = activeProject();
    const countries = p?.countries || [];
    const draft = state.currentDraft;
    if (draft.countryIds.size === countries.length) {
      draft.countryIds = new Set();
      draft.cityIdsByCountry = {};
    } else {
      draft.countryIds = new Set(countries.map(c => c.id));
      countries.forEach(c => {
        draft.cityIdsByCountry[c.id] = new Set((c.cities || []).map(x => x.id));
      });
    }
    renderContent();
  }

  function togglePreviewCountry(countryId) {
    state.collapsedPreviewCountries[countryId] = !state.collapsedPreviewCountries[countryId];
    renderContent();
  }


  function toggleCitiesEditor(countryId) {
    state.expandedCitiesCountry = state.expandedCitiesCountry === countryId ? null : countryId;
    renderContent();
  }

  function toggleCityForCountry(countryId, cityId) {
    const draft = state.currentDraft;
    if (!draft.cityIdsByCountry[countryId]) draft.cityIdsByCountry[countryId] = new Set();
    const ids = draft.cityIdsByCountry[countryId];
    if (ids.has(cityId)) ids.delete(cityId); else ids.add(cityId);
    renderContent();
  }

  function toggleAllCitiesForCountry(countryId) {
    const draft = state.currentDraft;
    const c = countryById(countryId);
    if (!c) return;
    const ids = draft.cityIdsByCountry[countryId] || new Set();
    if (ids.size === c.cities.length) {
      draft.cityIdsByCountry[countryId] = new Set();
    } else {
      draft.cityIdsByCountry[countryId] = new Set(c.cities.map(x => x.id));
    }
    renderContent();
  }

  function addToDraftQueue() {
    const p = activeProject();
    const draft = state.currentDraft;
    if (!p.email || !p.password) { toast('Заполните логин/пароль во вкладке «Настройки»', 'err'); return; }
    if (draft.countryIds.size === 0) { toast('Выберите хотя бы одну страну', 'err'); return; }
    if (!draft.body.trim()) { toast('Заполните основной текст', 'err'); return; }

    // ── Напоминание для «Отгрузки» без фото товаров ──
    // Если выбрана «Отгрузка» но не включена загрузка фото в раздел «Товары» —
    // спрашиваем подтверждение. Чтобы не задалбывать, поддерживаем флаг
    // state.skipShipmentPhotosWarning (на сессию) — «больше не спрашивать сейчас».
    if (
      draft.postType === 'shipment'
      && !draft.productPhotosEnabled
      && !state.skipShipmentPhotosWarning
    ) {
      const answer = confirm(
        '⚠️ Вы публикуете «Отгрузку», но не включили загрузку фото в раздел «Товары».\n\n' +
        'Обычно для отгрузки полезно добавить фото товаров в карточку Яндекс.Бизнес.\n\n' +
        'Нажмите:\n' +
        '  • OK — вернуться и включить загрузку фото\n' +
        '  • Отмена — продолжить без фото товаров'
      );
      if (answer) {
        // Пользователь выбрал OK — включаем галочку, делаем фокус на textarea с URL и НЕ добавляем сейчас
        state.currentDraft.productPhotosEnabled = true;
        renderContent();
        setTimeout(() => {
          const ta = $('#fldProductPhotos');
          if (ta) {
            ta.focus();
            ta.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        toast('Введите ссылки на фото и снова нажмите «Добавить в очередь»', 'ok');
        return;
      }
      // Пользователь нажал «Отмена» — на эту сессию больше не спрашиваем
      state.skipShipmentPhotosWarning = true;
    }

    // Парсим URL-ы фото товаров (если включено)
    let productPhotos = [];
    if (draft.postType === 'shipment' && draft.productPhotosEnabled && draft.productPhotosText) {
      productPhotos = draft.productPhotosText
        .split(/\r?\n/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && /^https?:\/\//i.test(s));
      if (productPhotos.length === 0) {
        toast('Включена загрузка фото в «Товары», но не указано ни одной ссылки', 'err');
        return;
      }
    }

    // Парсим картинки поста — URL-ы (по строке) + локально загруженные файлы
    const urlImages = (draft.imageUrl || '')
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(s => /^https?:\/\//i.test(s));
    const localImages = Array.isArray(draft.localImages) ? draft.localImages : [];

    // Объединяем: сначала локальные файлы (они приоритетнее — нет проблем с сетью),
    // потом URL-ы. Максимум 4 в посте.
    // Локальные файлы передаём как объекты { path }, URL-ы — как строки.
    const allPostImages = [
      ...localImages.map(img => ({ path: img.path })),
      ...urlImages,
    ].slice(0, 4);

    // Первая картинка → imageUrl или imagePath (для совместимости с публикатором)
    const first = allPostImages[0];
    const firstImage = (first && typeof first === 'object') ? '' : (first || '');
    const firstImagePath = (first && typeof first === 'object') ? first.path : '';
    // Остальные — в extraImages (могут быть смесью строк и объектов {path})
    const extraImages = allPostImages.slice(1);

    let added = 0;
    for (const countryId of draft.countryIds) {
      const country = countryById(countryId);
      if (!country) continue;
      // Фильтр по COUNTRY_TEMPLATES нужен только для СМУ (где окончания зависят от страны).
      // Для проектов со своими endings (ИМП/МПЭ) — любая страна подходит.
      const hasProjectEndings = !!state.auth?.currentProject?.endings;
      if (!hasProjectEndings && !COUNTRY_TEMPLATES[country.name]) continue;
      const cityIds = draft.cityIdsByCountry[countryId];
      if (!cityIds || cityIds.size === 0) continue;

      const finalText = buildFinalText(country, draft);
      state.publishQueue.push({
        countryId,
        text: finalText,
        imageUrl: firstImage,
        imagePath: firstImagePath,          // локальный путь к основной картинке
        extraImages: extraImages.length > 0 ? extraImages : null,
        cityIds: Array.from(cityIds),
        productPhotos: productPhotos.length > 0 ? productPhotos.slice() : null,
      });
      added++;
    }

    if (added === 0) { toast('Нет городов для публикации', 'err'); return; }

    // Автопереход: ищем первую страну, которой ещё нет в очереди
    const allCountries = p.countries || [];
    const queuedIds = new Set(state.publishQueue.map(item => item.countryId));
    const nextCountry = allCountries.find(c => !queuedIds.has(c.id));

    // Сброс выбора стран (но текст и тип поста остаются — на случай если нужно ещё опубликовать)
    state.currentDraft.countryIds = new Set();
    state.currentDraft.cityIdsByCountry = {};

    if (nextCountry) {
      state.currentDraft.countryIds.add(nextCountry.id);
      state.currentDraft.cityIdsByCountry[nextCountry.id] = new Set((nextCountry.cities || []).map(x => x.id));
      toast('✓ Добавлено · следующая: ' + nextCountry.name, 'ok');
    } else {
      toast('🎉 Все страны добавлены! Сохраните очередь', 'ok');
    }
    renderContent();
  }
  function removeFromDraftQueue(i) { state.publishQueue.splice(i, 1); renderContent(); }
  function clearDraftQueue() {
    if (state.publishQueue.length === 0) return;
    if (!confirm('Очистить очередь (' + state.publishQueue.length + ' постов)?')) return;
    state.publishQueue = [];
    renderContent();
  }
  async function saveQueueToServer() {
    const p = activeProject(); if (!p || state.publishQueue.length === 0) return;
    const items = [];
    for (const q of state.publishQueue) {
      const c = countryById(q.countryId); if (!c) continue;
      const tasks = q.cityIds.map(cid => {
        const city = c.cities.find(x => x.id === cid); if (!city) return null;
        return {
          cityName: city.name, companyUrl: city.url,
          companyId: extractCompanyId(city.url),
          postText: q.text,
          imageUrl: q.imageUrl || null,
          imagePath: q.imagePath || null,
          extraImages: q.extraImages && q.extraImages.length > 0 ? q.extraImages : null,
          productPhotos: q.productPhotos && q.productPhotos.length > 0 ? q.productPhotos : null,
        };
      }).filter(Boolean);
      items.push({
        credentials: { email: p.email, password: p.password },
        projectName: p.name, country: c.name,
        generatedAt: new Date().toISOString(),
        delayBetweenPosts: 3000, headlessMode: false, tasks,
      });
    }
    try {
      const r = await api('/api/tasks/save', { method: 'POST', body: { items } });
      if (r.error) { toast('Ошибка: ' + r.error, 'err'); return; }
      toast('Сохранено файлов: ' + (r.saved?.length || 0), 'ok');
      state.publishQueue = [];
      await refreshServerState();
      renderContent();
      setTimeout(() => switchTab('run'), 600);
    } catch (e) { toast('Ошибка соединения', 'err'); }
  }


  // ═══════════════════════════════════════════════════════
  // ACTUALIZE TAB — актуализация данных «Данные актуальны»
  // ═══════════════════════════════════════════════════════
  // Полностью отдельный модуль от публикации.
  // Использует:
  //   - те же города/страны из проекта (countries[].cities[])
  //   - свой эндпоинт /api/actualize/save для сохранения задач
  //   - свой эндпоинт /api/actualize/reports для отчётов
  //   - свой action='actualize' в /api/run
  //   - свой STOP-флаг через /api/stop (уже умеет различать)

  function tmplActualize(proj) {
    if (!proj) return emptyNoProject();
    const countries = proj.countries || [];
    if (countries.length === 0) {
      return emptyNoCities('Сначала добавьте страны и города во вкладке «Города»');
    }

    // Состояние какие города выбраны для актуализации
    if (!state.actualizeSelection) state.actualizeSelection = {};
    const sel = state.actualizeSelection;
    if (sel._projectId !== proj.id) {
      // При смене проекта — выбираем все по умолчанию
      sel._projectId = proj.id;
      sel.byCountry = {};
      countries.forEach(c => {
        sel.byCountry[c.id] = new Set((c.cities || []).map(x => x.id));
      });
    }
    if (!sel.byCountry) sel.byCountry = {};

    const totalSelected = countries.reduce((sum, c) => {
      const set = sel.byCountry[c.id];
      return sum + (set ? set.size : 0);
    }, 0);
    const totalCities = countries.reduce((sum, c) => sum + (c.cities || []).length, 0);

    // Состояние процесса
    const sp = state.server.process || { status: 'idle', action: null };
    const isRunning = sp.status === 'running' && sp.action === 'actualize';
    const lastFinished = sp.status === 'done' && sp.action === 'actualize';
    const lastError = sp.status === 'error' && sp.action === 'actualize';

    // Карточка стран с городами
    const countriesHtml = countries.map(c => {
      const set = sel.byCountry[c.id] || new Set();
      const total = (c.cities || []).length;
      const selected = set.size;
      const allSelected = total > 0 && selected === total;
      const expanded = state.actualizeExpandedCountries && state.actualizeExpandedCountries[c.id];

      let cities = '';
      if (expanded) {
        cities = '<div style="padding:12px 16px;border-top:1px solid var(--border);background:var(--bg-1)">'
          + '<div class="row" style="margin-bottom:10px;align-items:center;gap:8px">'
          + '<button class="btn btn-secondary btn-xs" onclick="window.__app.actualizeToggleAllCitiesForCountry(\'' + c.id + '\')">' + (allSelected ? 'Снять все' : 'Выбрать все') + '</button>'
          + '</div>'
          + '<div class="city-mini-grid">' + (c.cities || []).map(city => {
              const s = set.has(city.id);
              return '<button class="city-mini' + (s ? ' selected' : '') + '" onclick="window.__app.actualizeToggleCity(\'' + c.id + '\',\'' + city.id + '\')">'
                + '<span class="city-mini-box">' + (s ? '✓' : '') + '</span>'
                + '<span class="city-mini-name">' + esc(city.name) + '</span>'
                + '</button>';
            }).join('') + '</div>'
          + '</div>';
      }

      const summaryHtml = allSelected
        ? '<span style="color:var(--grn);font-weight:700">✓ все ' + total + '</span>'
        : selected === 0
        ? '<span style="color:var(--red);font-weight:700">⚠ ни одного</span>'
        : '<span style="color:var(--acc);font-weight:700">' + selected + ' из ' + total + '</span>';

      return '<div style="border:1px solid var(--border);border-radius:var(--r-sm);overflow:hidden;background:var(--bg-2);margin-bottom:6px">'
        + '<div class="collapsible-head" onclick="window.__app.actualizeToggleCountryExpanded(\'' + c.id + '\')" style="padding:10px 14px;display:flex;align-items:center;gap:10px;font-size:13px">'
        + countryFlag(c.name, 14)
        + '<span style="font-weight:700">' + esc(c.name) + '</span>'
        + '<span style="flex:1"></span>'
        + summaryHtml
        + '<span style="font-size:11px;color:var(--muted)">' + (expanded ? 'свернуть' : 'изменить') + '</span>'
        + '<span class="chevron" style="' + (expanded ? '' : 'transform:rotate(-90deg)') + '">▾</span>'
        + '</div>'
        + cities
        + '</div>';
    }).join('');

    // Карточка прогресса (когда идёт процесс)
    let progressHtml = '';
    if (isRunning) {
      progressHtml = '<div class="card">'
        + '<div class="card-header">'
        + '<div class="card-title"><span class="card-title-ico">🔄</span>Актуализация в процессе...</div>'
        + '<button class="btn btn-danger btn-sm" onclick="window.__app.stopAction()">⏹ Остановить</button>'
        + '</div>'
        + '<pre class="log-box" style="max-height:380px;font-size:12px">' + esc(state.server.process.log || '...') + '</pre>'
        + '</div>';
    } else if (lastFinished || lastError) {
      const icon = lastFinished ? '✅' : '❌';
      const title = lastFinished ? 'Актуализация завершена' : 'Актуализация завершилась с ошибкой';
      progressHtml = '<div class="card">'
        + '<div class="card-header"><div class="card-title"><span class="card-title-ico">' + icon + '</span>' + title + '</div></div>'
        + '<pre class="log-box" style="max-height:280px;font-size:12px">' + esc(state.server.process.log || '...') + '</pre>'
        + '<div class="hint" style="margin-top:10px">Полный отчёт см. ниже.</div>'
        + '</div>';
    }

    // Последний отчёт актуализации
    let lastReportHtml = '';
    if (state.actualizeReports && state.actualizeReports.length > 0) {
      const latest = state.actualizeData;
      if (latest && latest.totals) {
        const t = latest.totals;
        lastReportHtml = '<div class="card">'
          + '<div class="card-header">'
          + '<div class="card-title"><span class="card-title-ico">📊</span>Последний отчёт актуализации</div>'
          + '<div class="hint" style="margin:0">' + esc(new Date(latest.finishedAt || '').toLocaleString('ru-RU')) + '</div>'
          + '</div>'
          + '<div class="report-summary">'
          + '<div class="report-stat ok"><div class="report-stat-label">Актуализировано</div><div class="report-stat-value">' + (t.actualized || 0) + '</div></div>'
          + '<div class="report-stat noimg"><div class="report-stat-label">Не требовалось</div><div class="report-stat-value">' + (t.notNeeded || 0) + '</div></div>'
          + '<div class="report-stat err"><div class="report-stat-label">Ошибок</div><div class="report-stat-value">' + (t.failed || 0) + '</div></div>'
          + '<div class="report-stat dur"><div class="report-stat-label">Время</div><div class="report-stat-value">' + Math.round((latest.durationSec || 0) / 60) + '<span style="font-size:13px;opacity:0.6"> мин</span></div></div>'
          + '</div>'
          + (latest.results && latest.results.length > 0
            ? '<div style="margin-top:14px">'
              + '<button class="btn btn-ghost btn-sm" onclick="window.__app.actualizeToggleResults()">' + (state.actualizeShowResults ? '▴ Скрыть детали' : '▾ Показать детали (' + latest.results.length + ' городов)') + '</button>'
              + (state.actualizeShowResults ? renderActualizeResults(latest.results) : '')
              + '</div>'
            : '')
          + '</div>';
      }
    }

    // Кнопка запуска
    const canRun = totalSelected > 0 && !isRunning;

    return '<div class="card">'
      + '<div class="card-header">'
      + '<div class="card-title"><span class="card-title-ico">🔄</span>Актуализация данных</div>'
      + '</div>'
      + '<div class="hint" style="margin-bottom:14px">'
      + 'Скрипт зайдёт в раздел «Данные» каждого города и нажмёт кнопку <b>«Данные актуальны»</b>, если она там есть. '
      + 'Кнопка появляется на странице периодически — Яндекс просит подтверждать, что данные не изменились. '
      + 'Если кнопки нет — актуализация не требуется.'
      + '</div>'
      + '<div style="margin-top:6px">'
      + '<div class="row" style="margin-bottom:10px;align-items:center;gap:10px">'
      + '<div style="font-weight:700;font-size:13px">Выбрано: <span style="color:var(--acc)">' + totalSelected + '</span> / ' + totalCities + ' городов</div>'
      + '<button class="btn btn-ghost btn-sm" onclick="window.__app.actualizeToggleAllCountries()">' + (totalSelected === totalCities ? 'Снять все' : 'Выбрать все') + '</button>'
      + '</div>'
      + countriesHtml
      + '</div>'
      + '</div>'
      + progressHtml
      + (isRunning ? '' : '<div class="card">'
        + '<button class="btn btn-primary btn-lg btn-block" onclick="window.__app.actualizeStart()" ' + (canRun ? '' : 'disabled') + '>'
        + (canRun ? '🔄 Запустить актуализацию (' + totalSelected + ' городов)' : (totalSelected === 0 ? 'Выберите хотя бы один город' : 'Актуализация уже идёт'))
        + '</button>'
        + '</div>')
      + lastReportHtml;
  }

  function renderActualizeResults(results) {
    if (!results || results.length === 0) return '';
    const byCountry = {};
    results.forEach(r => {
      const k = r.country || r.package || '—';
      if (!byCountry[k]) byCountry[k] = [];
      byCountry[k].push(r);
    });
    let html = '<div style="margin-top:14px;display:flex;flex-direction:column;gap:14px">';
    Object.entries(byCountry).forEach(([country, rows]) => {
      const ok = rows.filter(r => r.status === 'actualized').length;
      const not = rows.filter(r => r.status === 'not-needed').length;
      const fail = rows.filter(r => r.status === 'failed').length;
      html += '<div>'
        + '<div style="font-weight:700;font-size:13px;margin-bottom:6px;display:flex;align-items:center;gap:8px">'
        + countryFlag(country, 14) + '<span>' + esc(country) + '</span>'
        + '<span class="badge badge-success">' + ok + '</span>'
        + (not > 0 ? '<span class="badge badge-muted">⊝ ' + not + '</span>' : '')
        + (fail > 0 ? '<span class="badge badge-danger">' + fail + '</span>' : '')
        + '</div>';
      rows.forEach(r => {
        const cls = r.status === 'actualized' ? 'ok' : (r.status === 'not-needed' ? 'noimg' : 'err');
        const icon = r.status === 'actualized' ? '✅' : (r.status === 'not-needed' ? '⊝' : '❌');
        const reason = r.status === 'not-needed' ? 'Кнопка не появилась — данные актуальны' : esc(r.reason || '');
        const dur = r.durationMs ? (r.durationMs / 1000).toFixed(1) + ' сек' : '';
        html += '<div class="report-row ' + cls + '">'
          + '<div class="report-row-ico">' + icon + '</div>'
          + '<div class="report-row-city">' + esc(r.cityName || '—') + '</div>'
          + '<div class="report-row-reason">' + reason + '</div>'
          + '<div class="report-row-dur">' + dur + '</div>'
          + '</div>';
      });
      html += '</div>';
    });
    html += '</div>';
    return html;
  }

  // ── ACTUALIZE: state mutators ──
  function actualizeToggleCity(countryId, cityId) {
    if (!state.actualizeSelection) state.actualizeSelection = { byCountry: {} };
    if (!state.actualizeSelection.byCountry[countryId]) state.actualizeSelection.byCountry[countryId] = new Set();
    const set = state.actualizeSelection.byCountry[countryId];
    if (set.has(cityId)) set.delete(cityId); else set.add(cityId);
    renderContent();
  }

  function actualizeToggleAllCitiesForCountry(countryId) {
    const c = countryById(countryId); if (!c) return;
    if (!state.actualizeSelection) state.actualizeSelection = { byCountry: {} };
    if (!state.actualizeSelection.byCountry[countryId]) state.actualizeSelection.byCountry[countryId] = new Set();
    const set = state.actualizeSelection.byCountry[countryId];
    const total = (c.cities || []).length;
    if (set.size === total) {
      state.actualizeSelection.byCountry[countryId] = new Set();
    } else {
      state.actualizeSelection.byCountry[countryId] = new Set((c.cities || []).map(x => x.id));
    }
    renderContent();
  }

  function actualizeToggleCountryExpanded(countryId) {
    if (!state.actualizeExpandedCountries) state.actualizeExpandedCountries = {};
    state.actualizeExpandedCountries[countryId] = !state.actualizeExpandedCountries[countryId];
    renderContent();
  }

  function actualizeToggleAllCountries() {
    const p = activeProject(); if (!p) return;
    const countries = p.countries || [];
    if (!state.actualizeSelection) state.actualizeSelection = { byCountry: {} };
    const totalSelected = countries.reduce((s, c) => s + ((state.actualizeSelection.byCountry[c.id] || new Set()).size), 0);
    const totalAll = countries.reduce((s, c) => s + (c.cities || []).length, 0);
    if (totalSelected === totalAll) {
      state.actualizeSelection.byCountry = {};
    } else {
      countries.forEach(c => {
        state.actualizeSelection.byCountry[c.id] = new Set((c.cities || []).map(x => x.id));
      });
    }
    renderContent();
  }

  function actualizeToggleResults() {
    state.actualizeShowResults = !state.actualizeShowResults;
    renderContent();
  }

  // ── Запуск процесса ──
  async function actualizeStart() {
    const p = activeProject(); if (!p) return;
    if (!p.email || !p.password) {
      toast('Сначала заполните логин/пароль во вкладке «Настройки»', 'err');
      return;
    }

    // Собираем задачи
    const sel = state.actualizeSelection || { byCountry: {} };
    const countries = p.countries || [];
    const items = [];
    countries.forEach(c => {
      const set = sel.byCountry[c.id] || new Set();
      if (set.size === 0) return;
      const tasks = (c.cities || [])
        .filter(city => set.has(city.id))
        .map(city => ({
          cityName: city.name,
          companyUrl: city.url,
          companyId: city.companyId || extractCompanyId(city.url),
        }));
      if (tasks.length > 0) {
        items.push({
          country: c.name,
          credentials: { email: p.email, password: p.password },
          tasks,
        });
      }
    });

    if (items.length === 0) { toast('Нет городов для актуализации', 'err'); return; }

    // Сохраняем задачи на сервер
    try {
      const r = await api('/api/actualize/save', { method: 'POST', body: { items } });
      if (r.error) { toast('Ошибка сохранения: ' + r.error, 'err'); return; }
    } catch (e) {
      toast('Не удалось сохранить задачи: ' + e.message, 'err');
      return;
    }

    // Запускаем процесс
    try {
      const r = await api('/api/run', { method: 'POST', body: { action: 'actualize' } });
      if (r.error) { toast('Ошибка запуска: ' + r.error, 'err'); return; }
      toast('Актуализация запущена', 'ok');
      // Сбрасываем кеш отчётов (чтобы загрузился свежий после завершения)
      state.actualizeReports = null;
      state.actualizeData = null;
      renderContent();
    } catch (e) {
      toast('Не удалось запустить: ' + e.message, 'err');
    }
  }

  /** Подтягивает последний отчёт актуализации */
  async function loadLatestActualizeReport() {
    try {
      const list = await api('/api/actualize/reports');
      state.actualizeReports = list.files || [];
      if (state.actualizeReports.length > 0) {
        const latest = state.actualizeReports[0];
        const data = await api('/api/actualize/report?name=' + encodeURIComponent(latest.name));
        state.actualizeData = data;
      }
      if (state.activeTab === 'actualize') renderContent();
    } catch {}
  }


  // ═══════════════════════════════════════════════════════
  // CITIES TAB
  // ═══════════════════════════════════════════════════════
  function tmplCities(proj) {
    if (!proj) return emptyNoProject();
    const countries = proj.countries || [];
    const addCountryHtml = state.addingCountry
      ? '<div class="row" style="align-items:flex-end">'
        + '<div class="field" style="flex:1;min-width:220px">'
        + '<label class="label">Название страны</label>'
        + '<input class="input" id="newCountryName" placeholder="Россия / Казахстан" onkeydown="if(event.key===\'Enter\')window.__app.addCountry()">'
        + '</div>'
        + '<button class="btn btn-primary" onclick="window.__app.addCountry()">＋ Создать</button>'
        + '<button class="btn btn-ghost" onclick="window.__app.cancelAddCountry()">Отмена</button>'
        + '</div>'
      : '<button class="btn btn-primary" onclick="window.__app.showAddCountry()">🌍 ＋ Добавить страну</button>';

    const listHtml = countries.length === 0
      ? emptyBlock('🌍', 'Нет стран', 'Добавьте первую страну кнопкой выше')
      : countries.map(c => tmplCountrySection(c)).join('');

    return '<div class="card">'
      + '<div class="card-header"><div class="card-title"><span class="card-title-ico">🌍</span>Управление странами</div></div>'
      + addCountryHtml
      + '</div>'
      + listHtml;
  }

  function tmplCountrySection(country) {
    const collapsed = !!state.collapsedCountries[country.id];
    const isBulk = !!state.bulkMode[country.id];

    let addHtml;
    if (isBulk) {
      addHtml = '<div style="display:flex;flex-direction:column;gap:10px">'
        + '<textarea class="textarea input-mono" id="bulkText_' + country.id + '" rows="5" '
        + 'placeholder="Москва | https://yandex.ru/sprav/12345/edit/&#10;Санкт-Петербург | https://yandex.ru/sprav/67890/edit/"></textarea>'
        + '<div class="row">'
        + '<button class="btn btn-primary btn-sm" onclick="window.__app.addBulkCities(\'' + country.id + '\')">＋ Добавить все</button>'
        + '<button class="btn btn-ghost btn-sm" onclick="window.__app.toggleBulkMode(\'' + country.id + '\')">По одному</button>'
        + '</div></div>';
    } else {
      addHtml = '<div class="row" style="align-items:flex-end">'
        + '<div class="field" style="flex:0 0 160px">'
        + '<label class="label">Город</label>'
        + '<input class="input" id="newCityName_' + country.id + '" placeholder="Москва" '
        + 'onkeydown="if(event.key===\'Enter\')window.__app.addOneCity(\'' + country.id + '\')">'
        + '</div>'
        + '<div class="field" style="flex:1;min-width:250px">'
        + '<label class="label">Ссылка Яндекс.Бизнес</label>'
        + '<input class="input input-mono" id="newCityUrl_' + country.id + '" placeholder="https://yandex.ru/sprav/.../edit/" '
        + 'onkeydown="if(event.key===\'Enter\')window.__app.addOneCity(\'' + country.id + '\')">'
        + '</div>'
        + '<button class="btn btn-primary btn-sm" onclick="window.__app.addOneCity(\'' + country.id + '\')">＋ Добавить</button>'
        + '<button class="btn btn-ghost btn-sm" onclick="window.__app.toggleBulkMode(\'' + country.id + '\')">Массово</button>'
        + '</div>';
    }

    let citiesListHtml;
    if ((country.cities || []).length === 0) {
      citiesListHtml = '<div style="padding:14px;text-align:center;color:var(--muted);font-size:12.5px;background:var(--bg-2);border-radius:var(--r-sm);border:1px dashed var(--border)">Городов пока нет</div>';
    } else {
      citiesListHtml = '<div class="city-list">' + country.cities.map((c, i) =>
        '<div class="city-row" id="cityRow_' + c.id + '">'
        + '<div class="city-row-num">' + String(i + 1).padStart(2, '0') + '</div>'
        + '<div class="city-row-name">' + esc(c.name) + '</div>'
        + '<div class="city-row-url">' + esc(c.url) + '</div>'
        + '<button class="btn btn-ghost btn-xs" onclick="window.__app.editCity(\'' + country.id + '\',\'' + c.id + '\')">✏️</button>'
        + '<button class="btn btn-ghost btn-xs" onclick="window.__app.removeCity(\'' + country.id + '\',\'' + c.id + '\')">🗑</button>'
        + '</div>').join('') + '</div>';
    }

    return '<div class="country-section' + (collapsed ? ' collapsed' : '') + '">'
      + '<div class="country-section-head" onclick="window.__app.toggleCountryCollapse(\'' + country.id + '\')">'
      + '<div class="country-title">'
      + '<span class="country-flag">' + flagOf(country.name) + '</span>'
      + '<span>' + esc(country.name) + '</span>'
      + '<span class="badge badge-muted">' + (country.cities || []).length + ' городов</span>'
      + '</div>'
      + '<div class="row">'
      + '<button class="btn btn-ghost btn-xs" onclick="event.stopPropagation();window.__app.renameCountry(\'' + country.id + '\')">✏️</button>'
      + '<button class="btn btn-ghost btn-xs" onclick="event.stopPropagation();window.__app.removeCountry(\'' + country.id + '\')">🗑</button>'
      + '<span class="chevron">▾</span>'
      + '</div></div>'
      + '<div class="country-section-body">'
      + addHtml
      + '<div style="margin-top:12px"></div>'
      + citiesListHtml
      + '</div></div>';
  }

  function showAddCountry() { state.addingCountry = true; renderContent(); setTimeout(() => $('#newCountryName')?.focus(), 30); }
  function cancelAddCountry() { state.addingCountry = false; renderContent(); }
  function addCountry() {
    const name = ($('#newCountryName')?.value || '').trim();
    if (!name) { toast('Введите название', 'err'); return; }
    const p = activeProject(); if (!p.countries) p.countries = [];
    if (p.countries.find(c => c.name.toLowerCase() === name.toLowerCase())) { toast('Такая страна уже есть', 'err'); return; }
    p.countries.push({ id: uid('country'), name, cities: [] });
    saveState();
    state.addingCountry = false;
    toast('Страна добавлена', 'ok');
    renderContent();
  }
  function renameCountry(cid) {
    const c = countryById(cid); if (!c) return;
    const name = prompt('Новое название:', c.name);
    if (!name || !name.trim()) return;
    c.name = name.trim(); saveState();
    toast('Переименовано', 'ok'); renderAll();
  }
  function removeCountry(cid) {
    const c = countryById(cid); if (!c) return;
    if (!confirm('Удалить страну «' + c.name + '» (' + (c.cities || []).length + ' городов)?')) return;
    const p = activeProject(); p.countries = p.countries.filter(x => x.id !== cid);
    saveState(); toast('Страна удалена', 'err'); renderAll();
  }
  function toggleCountryCollapse(cid) { state.collapsedCountries[cid] = !state.collapsedCountries[cid]; saveState(); renderContent(); }
  function toggleBulkMode(cid) { state.bulkMode[cid] = !state.bulkMode[cid]; renderContent(); }

  function addOneCity(cid) {
    const c = countryById(cid); if (!c) return;
    const name = ($('#newCityName_' + cid)?.value || '').trim();
    const url = ($('#newCityUrl_' + cid)?.value || '').trim();
    if (!name) { toast('Введите название', 'err'); return; }
    if (!url) { toast('Вставьте ссылку', 'err'); return; }
    c.cities = c.cities || [];
    c.cities.push({ id: uid('city'), name, url });
    saveState(); toast('Город добавлен', 'ok'); renderContent();
  }
  function addBulkCities(cid) {
    const c = countryById(cid); if (!c) return;
    const text = ($('#bulkText_' + cid)?.value || '').trim(); if (!text) return;
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    let n = 0; c.cities = c.cities || [];
    for (const line of lines) {
      const parts = line.split(/[|\t]/).map(s => s.trim()).filter(Boolean);
      if (parts.length >= 2) { c.cities.push({ id: uid('city'), name: parts[0], url: parts[1] }); n++; }
      else if (parts.length === 1 && parts[0].startsWith('http')) {
        const id = extractCompanyId(parts[0]);
        c.cities.push({ id: uid('city'), name: id ? 'Компания ' + id : 'Без имени', url: parts[0] }); n++;
      }
    }
    if (n > 0) {
      saveState(); toast('Добавлено ' + n + ' городов', 'ok');
      state.bulkMode[cid] = false; renderContent();
    } else toast('Не удалось распознать. Формат: Город | URL', 'err');
  }
  function removeCity(cid, cityId) {
    const c = countryById(cid); if (!c) return;
    c.cities = c.cities.filter(x => x.id !== cityId);
    // Удаляем город из всех черновиков
    if (state.currentDraft.cityIdsByCountry[cid]) {
      state.currentDraft.cityIdsByCountry[cid].delete(cityId);
    }
    saveState(); toast('Город удалён', 'err'); renderContent();
  }
  function editCity(cid, cityId) {
    const c = countryById(cid); if (!c) return;
    const city = c.cities.find(x => x.id === cityId); if (!city) return;
    const row = $('#cityRow_' + cityId); if (!row) return;
    row.innerHTML = '<div class="city-row-num"></div>'
      + '<input class="input" id="editName_' + cityId + '" value="' + esc(city.name) + '" style="flex:0 0 150px">'
      + '<input class="input input-mono" id="editUrl_' + cityId + '" value="' + esc(city.url) + '" style="flex:1">'
      + '<button class="btn btn-success btn-xs" onclick="window.__app.saveCityEdit(\'' + cid + '\',\'' + cityId + '\')">✓ OK</button>';
  }
  function saveCityEdit(cid, cityId) {
    const c = countryById(cid); if (!c) return;
    const city = c.cities.find(x => x.id === cityId); if (!city) return;
    city.name = ($('#editName_' + cityId)?.value || '').trim() || city.name;
    city.url = ($('#editUrl_' + cityId)?.value || '').trim() || city.url;
    saveState(); toast('Сохранено', 'ok'); renderContent();
  }

  // ═══════════════════════════════════════════════════════
  // REPORT TAB
  // ═══════════════════════════════════════════════════════
  let reportsCache = [];
  async function refreshReportsList() {
    try {
      const r = await api('/api/reports');
      reportsCache = r.files || [];
      if (!state.currentReportView && reportsCache.length > 0) {
        await openReport(reportsCache[0].name);
        return;
      }
      renderContent();
    } catch {}
  }
  function tmplReport() {
    if (reportsCache.length === 0) {
      return emptyBlock('📊', 'Ещё нет отчётов', 'После первой публикации здесь появится отчёт с итогами');
    }
    const reportsListHtml = reportsCache.map(r => {
      const t = r.totals || {};
      const failed = (t.failed || 0) + (t.noImage || 0);
      const cls = failed === 0 ? 'badge-success' : (t.ok === 0 ? 'badge-danger' : 'badge-warn');
      const txt = failed === 0 ? 'всё ок' : (t.ok === 0 ? 'провал' : 'частично');
      const dateText = r.finishedAt ? new Date(r.finishedAt).toLocaleString('ru-RU') : r.name;
      const active = r.name === state.currentReportView ? ' style="border-color:var(--acc);background:var(--acc-bg)"' : '';
      return '<div class="file-row collapsible-head"' + active + ' onclick="window.__app.openReport(\'' + esc(r.name) + '\')">'
        + '<div class="file-icon">📊</div>'
        + '<div class="file-meta">'
        + '<div class="file-name">' + esc(dateText) + '</div>'
        + '<div class="file-sub">' + (t.total || 0) + ' городов · ' + (r.durationSec || 0) + ' сек</div>'
        + '</div>'
        + '<span class="badge ' + cls + '">' + txt + '</span>'
        + '</div>';
    }).join('');

    if (!state.currentReportData) {
      return '<div class="card">'
        + '<div class="card-header"><div class="card-title"><span class="card-title-ico">📊</span>История отчётов</div></div>'
        + '<div class="queue-list">' + reportsListHtml + '</div>'
        + '</div>';
    }

    const d = state.currentReportData;
    const t = d.totals || { total: 0, ok: 0, noImage: 0, failed: 0, unknown: 0, retried: 0 };
    const finishedStr = d.finishedAt ? new Date(d.finishedAt).toLocaleString('ru-RU') : '';

    // ── Шапка статистики ──
    const unknownCount = t.unknown || 0;
    const summaryHtml = '<div class="report-summary">'
      + '<div class="report-stat ok"><div class="report-stat-label">Успешно</div><div class="report-stat-value">' + (t.ok || 0) + '</div></div>'
      + '<div class="report-stat noimg"><div class="report-stat-label">Без картинки</div><div class="report-stat-value">' + (t.noImage || 0) + '</div></div>'
      + (unknownCount > 0 ? '<div class="report-stat warn"><div class="report-stat-label">Проверьте ⚠️</div><div class="report-stat-value">' + unknownCount + '</div></div>' : '')
      + '<div class="report-stat err"><div class="report-stat-label">Ошибок</div><div class="report-stat-value">' + (t.failed || 0) + '</div></div>'
      + '<div class="report-stat dur"><div class="report-stat-label">Время</div><div class="report-stat-value">' + Math.round((d.durationSec || 0) / 60) + '<span style="font-size:13px;opacity:0.6"> мин</span></div></div>'
      + '</div>';

    const stoppedNote = d.stoppedByUser
      ? '<div class="run-progress" style="background:var(--yel-bg);border-color:var(--yel)"><div class="run-progress-ico" style="background:var(--yel);animation:none">⏹</div><div class="run-progress-text"><div class="run-progress-title">Публикация остановлена пользователем</div><div class="run-progress-sub">Успели обработать ' + (t.total || 0) + ' городов из всех запланированных</div></div></div>'
      : '';

    const retriedNote = (t.retried || 0) > 0
      ? '<div class="hint" style="margin-bottom:14px">⚡ <b>' + t.retried + '</b> ' + (t.retried === 1 ? 'город опубликован' : 'городов опубликовано') + ' со 2-й попытки</div>'
      : '';

    const unknownNote = unknownCount > 0
      ? '<div class="hint" style="margin-bottom:14px;background:var(--yel-bg);padding:10px 14px;border-radius:var(--r-sm);border:1px solid var(--yel)">⚠️ <b>' + unknownCount + '</b> ' + (unknownCount === 1 ? 'город требует' : 'городов требуют') + ' ручной проверки в Яндекс.Бизнесе. Возможно посты опубликованы, но скрипт не смог это автоматически подтвердить.</div>'
      : '';

    // ── Фильтры ──
    const filter = state.reportFilter || 'all';
    const totalFailedShow = (t.failed || 0);
    const totalNoimgShow = (t.noImage || 0);
    const filterCls = (k) => 'btn ' + (filter === k ? 'btn-primary' : 'btn-secondary') + ' btn-sm';
    const filtersHtml = '<div class="row" style="margin-bottom:14px">'
      + '<button class="' + filterCls('all') + '" onclick="window.__app.setReportFilter(\'all\')">Все · ' + (t.total || 0) + '</button>'
      + (totalFailedShow > 0 ? '<button class="' + filterCls('errors') + '" onclick="window.__app.setReportFilter(\'errors\')">🔴 Только ошибки · ' + totalFailedShow + '</button>' : '')
      + (unknownCount > 0 ? '<button class="' + filterCls('unknown') + '" onclick="window.__app.setReportFilter(\'unknown\')">⚠️ Проверьте · ' + unknownCount + '</button>' : '')
      + (totalNoimgShow > 0 ? '<button class="' + filterCls('noimg') + '" onclick="window.__app.setReportFilter(\'noimg\')">🟡 Без картинки · ' + totalNoimgShow + '</button>' : '')
      + '</div>';

    // ── Применяем фильтр к results ──
    const filteredResults = (d.results || []).filter(r => {
      if (filter === 'all') return true;
      if (filter === 'errors') return r.status === 'failed';
      if (filter === 'noimg') return r.status === 'no-image';
      if (filter === 'unknown') return r.status === 'unknown';
      return true;
    });

    // ── Группируем отфильтрованные по странам ──
    const byCountry = {};
    filteredResults.forEach(r => {
      const k = r.country || r.package || '—';
      if (!byCountry[k]) byCountry[k] = [];
      byCountry[k].push(r);
    });

    let bodyHtml = '';
    if (filteredResults.length === 0) {
      bodyHtml = '<div class="empty" style="padding:30px"><div class="empty-icon">🎉</div><div class="empty-title">Пусто</div><div class="empty-desc">' + (filter === 'errors' ? 'Нет ошибок — все посты опубликованы!' : 'Нет постов без картинки') + '</div></div>';
    } else {
      // Если фильтр стоит на ошибках/без_картинки — разворачиваем все, чтобы не пришлось кликать
      const forceOpen = filter !== 'all';
      Object.entries(byCountry).forEach(([country, rows]) => {
        const okCount = rows.filter(r => r.status === 'ok').length;
        const noImgCount = rows.filter(r => r.status === 'no-image').length;
        const failedCount = rows.filter(r => r.status === 'failed').length;
        const isCollapsed = !forceOpen && state.reportCollapsedCountries[country] !== false &&
                             (state.reportCollapsedCountries[country] === true || filter === 'all');
        // По умолчанию: при «Все» страны свёрнуты, кроме Россия (первая большая)
        // А при фильтрах — все развёрнуты автоматически

        const headBadges = ''
          + (okCount > 0 ? '<span class="badge badge-success">✅ ' + okCount + '</span>' : '')
          + (noImgCount > 0 ? '<span class="badge badge-warn">🟡 ' + noImgCount + '</span>' : '')
          + (failedCount > 0 ? '<span class="badge badge-danger">🔴 ' + failedCount + '</span>' : '');

        bodyHtml += '<div class="country-section' + (isCollapsed ? ' collapsed' : '') + '" style="margin-bottom:10px">'
          + '<div class="country-section-head" onclick="window.__app.toggleReportCountry(\'' + esc(country) + '\')">'
          + '<div class="country-title">'
          + '<span class="country-flag">' + flagOf(country) + '</span>'
          + '<span>' + esc(country) + '</span>'
          + '<span class="badge badge-muted">' + rows.length + '</span>'
          + '</div>'
          + '<div class="row">' + headBadges + '<span class="chevron">▾</span></div>'
          + '</div>'
          + '<div class="country-section-body">';

        rows.forEach(r => {
          const cls = r.status === 'ok' ? 'ok' : (r.status === 'no-image' ? 'noimg' : (r.status === 'unknown' ? 'warn' : 'err'));
          const ico = r.status === 'ok' ? (r.retried ? '⚡' : '✅') : (r.status === 'no-image' ? '🟡' : (r.status === 'unknown' ? '⚠️' : '🔴'));
          let reason;
          if (r.status === 'ok') {
            reason = r.retried ? 'Опубликован со 2-й попытки' : 'Опубликован';
          } else if (r.status === 'no-image') {
            reason = 'Без картинки · ' + esc(r.imageError || 'не загрузилась');
          } else if (r.status === 'unknown') {
            reason = '⚠️ ' + esc(r.reason || 'требует ручной проверки');
          } else {
            reason = esc(r.reason || 'неизвестная ошибка');
          }
          // Дописываем информацию про фото товаров
          if (r.productPhotos && r.productPhotos.requested > 0) {
            const pp = r.productPhotos;
            if (pp.uploaded === pp.requested) {
              reason += ' <span class="badge badge-accent" style="margin-left:6px">📸 ' + pp.uploaded + ' фото в Товары</span>';
            } else if (pp.uploaded > 0) {
              reason += ' <span class="badge badge-warn" style="margin-left:6px">📸 ' + pp.uploaded + '/' + pp.requested + ' фото в Товары</span>';
            } else {
              reason += ' <span class="badge badge-danger" style="margin-left:6px">📸 Фото не загружены</span>';
            }
          }
          const dur = r.durationMs ? (r.durationMs / 1000).toFixed(1) + ' сек' : '';
          bodyHtml += '<div class="report-row ' + cls + '">'
            + '<div class="report-row-ico">' + ico + '</div>'
            + '<div class="report-row-city">' + esc(r.cityName || '—') + '</div>'
            + '<div class="report-row-reason">' + reason + '</div>'
            + '<div class="report-row-dur">' + dur + '</div>'
            + '</div>';
        });
        bodyHtml += '</div></div>';
      });
    }

    const showRawBtn = '<button class="btn btn-ghost btn-sm" onclick="window.__app.toggleRawLog()">📄 ' + (state.showRawLog ? 'Скрыть' : 'Подробный лог') + '</button>';
    const rawLogHtml = state.showRawLog ? '<div class="card">'
      + '<div class="card-header"><div class="card-title"><span class="card-title-ico">📜</span>Технические логи</div>'
      + '<div class="row"><button class="btn btn-ghost btn-sm" onclick="window.__app.refreshLogList()">🔄</button>'
      + '<button class="btn btn-ghost btn-sm" onclick="window.__app.openFolder(\'logs\')">📁 Папка</button></div>'
      + '</div>'
      + '<div class="queue-list">' + (logsCache.length === 0 ? '<div class="log-placeholder">Файлов логов нет</div>' : logsCache.map(f =>
        '<div class="file-row" style="cursor:pointer" onclick="window.__app.openLog(\'' + esc(f) + '\')">'
        + '<div class="file-icon">📄</div>'
        + '<div class="file-meta"><div class="file-name">' + esc(f) + '</div></div>'
        + '<button class="btn btn-secondary btn-xs">Открыть</button>'
        + '</div>').join('')) + '</div>'
      + (state.currentLogView
        ? '<hr class="divider"><div class="card-title"><span class="card-title-ico">📄</span>' + esc(state.currentLogView) + ' <button class="btn btn-ghost btn-xs" onclick="window.__app.closeLogView()">Закрыть</button></div><div class="log-box" style="max-height:420px">' + (esc(state.logViewContent) || '<span class="log-placeholder">Пусто</span>') + '</div>'
        : '')
      + '</div>' : '';

    const summaryCollapsed = !!state.reportSummaryCollapsed;
    const collapseToggle = '<button class="btn btn-ghost btn-sm" onclick="window.__app.toggleReportSummary()" title="' + (summaryCollapsed ? 'Развернуть' : 'Свернуть') + '">' + (summaryCollapsed ? '▾ Развернуть сводку' : '▴ Свернуть сводку') + '</button>';

    return stoppedNote
      + '<div class="card">'
      + '<div class="card-header">'
      + '<div class="card-title"><span class="card-title-ico">📊</span>Отчёт от ' + esc(finishedStr) + '</div>'
      + '<div class="row">'
      + collapseToggle
      + '<button class="btn btn-secondary btn-sm" onclick="window.__app.exportReportCSV()">⬇ CSV</button>'
      + showRawBtn
      + '</div></div>'
      + (summaryCollapsed ? '' : summaryHtml + retriedNote + unknownNote)
      + filtersHtml
      + bodyHtml
      + '</div>'
      + rawLogHtml
      + (reportsCache.length > 1 ? '<div class="card"><div class="card-header"><div class="card-title"><span class="card-title-ico">🗂</span>История отчётов (' + reportsCache.length + ')</div></div><div class="queue-list">' + reportsListHtml + '</div></div>' : '');
  }

  function toggleReportSummary() {
    state.reportSummaryCollapsed = !state.reportSummaryCollapsed;
    renderContent();
  }

  function setReportFilter(f) {
    state.reportFilter = f;
    renderContent();
  }
  function toggleReportCountry(country) {
    state.reportCollapsedCountries[country] = !state.reportCollapsedCountries[country];
    renderContent();
  }

  async function openReport(name) {
    state.currentReportView = name;
    try {
      const r = await fetch('/api/report?name=' + encodeURIComponent(name)).then(x => x.json());
      state.currentReportData = r;
    } catch { state.currentReportData = null; }
    renderContent();
  }
  function toggleRawLog() {
    state.showRawLog = !state.showRawLog;
    if (state.showRawLog) refreshLogList();
    else renderContent();
  }
  function exportReportCSV() {
    const d = state.currentReportData; if (!d) return;
    const header = 'Страна;Город;Статус;Причина;Время_сек;URL';
    const rows = (d.results || []).map(r => {
      let status;
      if (r.status === 'ok') status = r.retried ? 'успех_со_2-й_попытки' : 'успех';
      else if (r.status === 'no-image') status = 'без_картинки';
      else status = 'ошибка';
      const reason = (r.reason || '').replace(/[;\n\r]/g, ' ');
      const imgErr = r.imageError ? ' · фото: ' + r.imageError : '';
      return [r.country || '', r.cityName || '', status, reason + imgErr,
        r.durationMs ? (r.durationMs / 1000).toFixed(1) : '', r.companyUrl || ''
      ].map(v => String(v).replace(/[;\n\r]/g, ' ')).join(';');
    });
    const csv = '\uFEFF' + [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report-' + (d.finishedAt || 'export').slice(0, 19).replace(/[:.]/g, '-') + '.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast('CSV скачан', 'ok');
  }

  let logsCache = [];
  async function refreshLogList() {
    try { const r = await api('/api/logs'); logsCache = r.files || []; renderContent(); } catch {}
  }
  async function openLog(name) {
    state.currentLogView = name; state.logViewContent = 'Загрузка…'; renderContent();
    try {
      const txt = await fetch('/api/log-file?name=' + encodeURIComponent(name)).then(r => r.text());
      state.logViewContent = txt; renderContent();
    } catch { state.logViewContent = 'Ошибка'; renderContent(); }
  }
  function closeLogView() { state.currentLogView = null; state.logViewContent = ''; renderContent(); }

  // ═══════════════════════════════════════════════════════
  // SETTINGS TAB
  // ═══════════════════════════════════════════════════════
  function tmplSettings(proj) {
    if (!proj) return emptyNoProject();
    const totalCountries = (proj.countries || []).length;
    const totalCities = (proj.countries || []).reduce((s, c) => s + (c.cities || []).length, 0);
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';

    return '<div class="card">'
      + '<div class="card-header"><div class="card-title"><span class="card-title-ico">⚙️</span>Настройки проекта</div></div>'
      + '<div class="field">'
      + '<label class="label">Название проекта</label>'
      + '<input class="input" id="stName" value="' + esc(proj.name) + '" placeholder="Мой проект">'
      + '</div>'
      + '<hr class="divider">'
      + '<div class="section-label">🔑 Учётные данные Яндекс</div>'
      + '<div class="field" style="margin-top:12px">'
      + '<label class="label">Email / Логин</label>'
      + '<input class="input input-mono" id="stEmail" value="' + esc(proj.email) + '" placeholder="email@yandex.ru">'
      + '</div>'
      + '<div class="field">'
      + '<label class="label">Пароль</label>'
      + '<div class="pw-wrap">'
      + '<input class="input input-mono" id="stPass" type="password" value="' + esc(proj.password) + '" placeholder="••••••••">'
      + '<button class="pw-toggle" onclick="window.__app.togglePw()">👁</button>'
      + '</div>'
      + '<div class="hint">Хранится локально в вашем браузере (localStorage)</div>'
      + '</div>'
      + '<div style="margin-top:16px"><button class="btn btn-primary" onclick="window.__app.saveSettings()">💾 Сохранить</button></div>'
      + '</div>'
      + '<div class="card">'
      + '<div class="card-header"><div class="card-title"><span class="card-title-ico">🎨</span>Внешний вид</div></div>'
      + '<div class="row">'
      + '<button class="btn ' + (cur === 'dark' ? 'btn-primary' : 'btn-secondary') + '" onclick="window.__app.applyTheme(\'dark\')">🌙 Тёмная</button>'
      + '<button class="btn ' + (cur === 'light' ? 'btn-primary' : 'btn-secondary') + '" onclick="window.__app.applyTheme(\'light\')">☀️ Светлая</button>'
      + '</div>'
      + '<div class="hint" style="margin-top:10px">В углу сверху можно переключать быстрее.</div>'
      + '</div>'
      + '<div class="card">'
      + '<div class="card-header"><div class="card-title"><span class="card-title-ico">📊</span>Статистика проекта</div></div>'
      + '<div class="stat-grid">'
      + '<div class="stat-card"><div class="stat-label">Стран</div><div class="stat-value">' + totalCountries + '</div></div>'
      + '<div class="stat-card"><div class="stat-label">Городов всего</div><div class="stat-value">' + totalCities + '</div></div>'
      + '</div>'
      + '</div>'
      + '<div style="margin-top:8px;text-align:right">'
      + '<button class="btn btn-ghost btn-sm" style="color:var(--red)" onclick="window.__app.deleteProject()">🗑 Удалить проект</button>'
      + '</div>';
  }
  function togglePw() {
    const el = $('#stPass'); if (!el) return;
    el.type = el.type === 'password' ? 'text' : 'password';
  }
  function saveSettings() {
    const p = activeProject(); if (!p) return;
    p.name = ($('#stName')?.value || '').trim() || p.name;
    p.email = ($('#stEmail')?.value || '').trim();
    p.password = ($('#stPass')?.value || '');
    saveState(); renderAll(); toast('Сохранено', 'ok');
  }
  function deleteProject() {
    const p = activeProject(); if (!p) return;
    const cityCount = (p.countries || []).reduce((s, c) => s + (c.cities || []).length, 0);
    const msg = 'Удалить проект «' + p.name + '»?\n\n'
      + 'Будут безвозвратно удалены:\n'
      + '  • ' + (p.countries || []).length + ' стран\n'
      + '  • ' + cityCount + ' городов\n'
      + '  • Логин и пароль\n\n'
      + 'Чтобы подтвердить, введите название проекта:';
    const typed = prompt(msg, '');
    if (typed === null) return; // отмена
    if (typed.trim() !== p.name.trim()) {
      toast('Название не совпадает — проект НЕ удалён', 'err');
      return;
    }
    state.projects = state.projects.filter(x => x.id !== state.activeProjectId);
    state.activeProjectId = state.projects.length > 0 ? state.projects[0].id : null;
    state.publishQueue = [];
    saveState();
    toast('Проект «' + p.name + '» удалён', 'err');
    renderAll();
  }

  // ═══════════════════════════════════════════════════════
  // AUTH — выбор проекта, ввод пароля, выход
  // ═══════════════════════════════════════════════════════

  async function bootstrapAuth() {
    try {
      // Загружаем список проектов (доступен без логина)
      const projList = await fetch('/api/projects/list', { credentials: 'same-origin' }).then(r => r.json());
      state.auth.projectsList = projList.projects || [];

      // Проверяем — уже выбран проект?
      const r = await fetch('/api/auth/state', { credentials: 'same-origin' });
      const data = await r.json();
      state.auth.checked = true;
      if (data.currentProjectId && data.project) {
        state.auth.currentProjectId = data.currentProjectId;
        state.auth.currentProject = data.project;
        await startMainApp();
      } else {
        state.auth.needLogin = true;
        renderProjectPicker();
      }
    } catch (e) {
      state.auth.checked = true;
      state.auth.needLogin = true;
      state.auth.authError = 'Не удалось связаться с сервером';
      renderProjectPicker();
    }
  }

  async function startMainApp() {
    state.auth.needLogin = false;
    // Снимаем overlay экрана входа
    document.getElementById('authOverlay')?.remove();

    // Загружаем настройки с сервера. Это асинхронно — ждём прежде чем
    // решить, надо ли применять preset проекта.
    await loadState();

    // Если у пользователя ещё нет ни одного проекта (свежая папка Click),
    // применяем preset из projects.js (зашитые города/настройки для ИМП/МПЭ).
    if (!state.projects || state.projects.length === 0) {
      applyProjectPreset();
    }

    renderAll();
    await refreshServerState();
    setInterval(refreshServerState, 5000);
    requestNotificationPermission();
  }

  // ─── Применение preset проекта ───
  // Применяется только если на сервере ещё НЕТ настроек этого проекта
  // (определяется в startMainApp). После применения сохраняется на сервер,
  // и в следующий раз будет загружаться оттуда.
  function applyProjectPreset() {
    const proj = state.auth.currentProject;
    if (!proj || !proj.presetCities || proj.presetCities.length === 0) return;

    // Группируем города по странам
    const byCountry = {};
    for (const c of proj.presetCities) {
      if (!byCountry[c.country]) byCountry[c.country] = [];
      byCountry[c.country].push({ id: cryptoRandomId(), name: c.name, url: c.url });
    }

    // Создаём проект в state.projects
    const projectEntry = {
      id: cryptoRandomId(),
      name: proj.name + ' / ' + proj.fullName,
      email: proj.yandexEmail,
      password: '',  // заполнит пользователь во вкладке «Настройки»
      countries: Object.keys(byCountry).map(name => ({
        id: cryptoRandomId(),
        name,
        cities: byCountry[name],
      })),
    };

    state.projects = [projectEntry];
    state.activeProjectId = projectEntry.id;
    saveState();  // → сохранится на сервер
    toast(`Настройки проекта «${proj.name}» загружены из шаблона`, 'ok');
  }

  function cryptoRandomId() {
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  // ─── Экран выбора проекта (стартовый) ───
  function renderProjectPicker() {
    document.getElementById('authOverlay')?.remove();

    const list = state.auth.projectsList || [];
    const errorHtml = state.auth.authError
      ? '<div class="auth-error">' + esc(state.auth.authError) + '</div>'
      : '';

    const tilesHtml = list.map(p => {
      return '<button class="project-tile" style="--proj-color: ' + esc(p.color) + '" onclick="window.__app.selectProjectTile(\'' + esc(p.id) + '\')">'
        + '<div class="project-tile-icon">' + esc(p.icon) + '</div>'
        + '<div class="project-tile-name">' + esc(p.name) + '</div>'
        + '<div class="project-tile-fullname">' + esc(p.fullName) + '</div>'
        + '</button>';
    }).join('');

    const html = '<div id="authOverlay" class="auth-overlay">'
      + '<div class="auth-card auth-card-wide">'
      + '<div class="auth-logo">🚀 Click</div>'
      + '<div class="auth-title">Выберите проект</div>'
      + '<div class="auth-subtitle">Каждый проект работает со своим аккаунтом Яндекс.Бизнеса</div>'
      + errorHtml
      + '<div class="project-tiles">' + tilesHtml + '</div>'
      + '</div>'
      + '</div>';
    document.body.insertAdjacentHTML('beforeend', html);
  }

  // ─── Экран ввода пароля для выбранного проекта ───
  function selectProjectTile(projectId) {
    const proj = (state.auth.projectsList || []).find(p => p.id === projectId);
    if (!proj) return;
    state.auth.pendingProject = proj;
    renderProjectPasswordScreen();
  }

  function renderProjectPasswordScreen() {
    document.getElementById('authOverlay')?.remove();
    const proj = state.auth.pendingProject;
    if (!proj) { renderProjectPicker(); return; }

    const errorHtml = state.auth.authError
      ? '<div class="auth-error">' + esc(state.auth.authError) + '</div>'
      : '';

    const html = '<div id="authOverlay" class="auth-overlay">'
      + '<div class="auth-card">'
      + '<button class="auth-back" onclick="window.__app.backToProjectPicker()">← Назад к выбору проекта</button>'
      + '<div class="project-tile project-tile-selected" style="--proj-color: ' + esc(proj.color) + ';margin-bottom:20px;cursor:default">'
      + '<div class="project-tile-icon">' + esc(proj.icon) + '</div>'
      + '<div class="project-tile-name">' + esc(proj.name) + '</div>'
      + '<div class="project-tile-fullname">' + esc(proj.fullName) + '</div>'
      + '</div>'
      + '<div class="auth-title" style="font-size:16px">Введите пароль</div>'
      + errorHtml
      + '<div class="field">'
      + '<input class="input" id="projectPassword" type="password" placeholder="Пароль" autocomplete="current-password" autofocus>'
      + '</div>'
      + '<button class="btn btn-primary btn-lg btn-block" onclick="window.__app.doProjectLogin()">Войти в ' + esc(proj.name) + '</button>'
      + '</div>'
      + '</div>';
    document.body.insertAdjacentHTML('beforeend', html);

    document.getElementById('projectPassword')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); doProjectLogin(); }
    });
  }

  function backToProjectPicker() {
    state.auth.pendingProject = null;
    state.auth.authError = '';
    renderProjectPicker();
  }

  async function doProjectLogin() {
    const proj = state.auth.pendingProject;
    if (!proj) return;
    const password = document.getElementById('projectPassword')?.value || '';
    if (!password) {
      state.auth.authError = 'Введите пароль';
      renderProjectPasswordScreen();
      return;
    }
    state.auth.authError = '';
    try {
      const r = await fetch('/api/projects/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ projectId: proj.id, password }),
      });
      const data = await r.json();
      if (!r.ok || data.error) {
        state.auth.authError = data.error || 'Ошибка входа';
        renderProjectPasswordScreen();
        return;
      }
      // Получаем полные данные проекта (с presetCities/endings) для применения preset
      const stateR = await fetch('/api/auth/state', { credentials: 'same-origin' });
      const stateData = await stateR.json();
      state.auth.currentProjectId = stateData.currentProjectId;
      state.auth.currentProject = stateData.project;
      state.auth.pendingProject = null;
      state.auth.authError = '';
      await startMainApp();
      toast('Привет, ' + proj.name + '!', 'ok');
    } catch (e) {
      state.auth.authError = 'Сетевая ошибка: ' + e.message;
      renderProjectPasswordScreen();
    }
  }

  async function doLogout() {
    if (!confirm('Сменить проект?')) return;
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } catch {}
    location.reload();
  }

  // ═══════════════════════════════════════════════════════
  // EMPTY STATES
  // ═══════════════════════════════════════════════════════
  function emptyBlock(icon, title, desc) {
    return '<div class="card"><div class="empty">'
      + '<div class="empty-icon">' + icon + '</div>'
      + '<div class="empty-title">' + esc(title) + '</div>'
      + '<div class="empty-desc">' + esc(desc) + '</div>'
      + '</div></div>';
  }
  function emptyNoProject() {
    return '<div class="card"><div class="empty">'
      + '<div class="empty-icon">📁</div>'
      + '<div class="empty-title">Нет проектов</div>'
      + '<div class="empty-desc">Создайте проект через селектор в правом верхнем углу</div>'
      + '<div style="margin-top:20px"><button class="btn btn-primary" onclick="window.__app.toggleProjectDd()">＋ Создать проект</button></div>'
      + '</div></div>';
  }
  function emptyNoCities(desc) {
    return '<div class="card"><div class="empty">'
      + '<div class="empty-icon">🌍</div>'
      + '<div class="empty-title">Нет стран и городов</div>'
      + '<div class="empty-desc">' + esc(desc) + '</div>'
      + '<div style="margin-top:20px"><button class="btn btn-primary" onclick="window.__app.switchTab(\'cities\')">🏙 Перейти в «Города»</button></div>'
      + '</div></div>';
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.proj-wrap')) $('#projDd')?.classList.remove('open');
    if (!e.target.closest('.user-menu')) $('#userDd')?.classList.remove('open');
  });

  initTheme();

  // Сначала — проверяем авторизацию. Если не авторизован — показываем экран входа.
  // Только после успешного входа загружаем основной UI.
  bootstrapAuth();

  window.__app = {
    switchTab, toggleTheme, applyTheme,
    toggleProjectDd, showAddProject, addProject, selectProject,
    selectPostType,
    toggleCountryInDraft, toggleAllCountriesInDraft,
    togglePreviewCountry, toggleCityForCountry, toggleAllCitiesForCountry, toggleCitiesEditor,
    addToDraftQueue, removeFromDraftQueue, clearDraftQueue, saveQueueToServer,
    showAddCountry, cancelAddCountry, addCountry, renameCountry, removeCountry,
    toggleCountryCollapse, toggleBulkMode, addOneCity, addBulkCities,
    removeCity, editCity, saveCityEdit,
    runAction, stopAction, deleteServerTask, clearAllServerTasks, openFolder,
    doYandexLogout, removeLocalImage,
    refreshReportsList, openReport, exportReportCSV, toggleRawLog,
    setReportFilter, toggleReportCountry, toggleReportSummary,
    refreshLogList, openLog, closeLogView,
    togglePw, saveSettings, deleteProject,
    // Актуализация
    actualizeStart, actualizeToggleCity, actualizeToggleAllCitiesForCountry,
    actualizeToggleCountryExpanded, actualizeToggleAllCountries, actualizeToggleResults,
    // Auth (выбор проекта)
    selectProjectTile, doProjectLogin, backToProjectPicker, doLogout, toggleUserDd,
  };
}

function buildHTML() {
  const clientJs = '(' + clientApp.toString() + ')();';
  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Click — публикация постов</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head>
<body>
<div class="shell">
  <header class="topbar">
    <div class="logo">
      <div class="logo-icon" title="Click">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round">
          <path d="M6.5 4.5l12 7-5 1.3-1.3 5-5.7-13.3z"/>
        </svg>
      </div>
      <div>
        <div class="logo-title">Click</div>
        <div class="logo-sub">публикация постов</div>
      </div>
    </div>
    <div class="pills" id="pills"></div>
    <div class="topbar-spacer"></div>
    <div class="proj-wrap">
      <button class="proj-btn" onclick="window.__app.toggleProjectDd()">
        <span id="projBtnLabel">📁 Выберите проект</span>
        <span style="opacity:0.6">▾</span>
      </button>
      <div class="proj-dd" id="projDd"></div>
    </div>
    <button class="theme-btn" id="themeBtn" onclick="window.__app.toggleTheme()" title="Переключить тему">🌙</button>
    <div class="user-wrap" id="userWrap"></div>
  </header>

  <nav class="tabs-bar">
    <button class="tab active" data-tab="run"       onclick="window.__app.switchTab('run')"><span class="tab-ico">🚀</span><span>Запуск</span></button>
    <button class="tab"        data-tab="publish"   onclick="window.__app.switchTab('publish')"><span class="tab-ico">📤</span><span>Публикация</span></button>
    <button class="tab"        data-tab="actualize" onclick="window.__app.switchTab('actualize')"><span class="tab-ico">🔄</span><span>Актуализация</span></button>
    <button class="tab"        data-tab="cities"    onclick="window.__app.switchTab('cities')"><span class="tab-ico">🏙</span><span>Города</span></button>
    <button class="tab"        data-tab="report"    onclick="window.__app.switchTab('report')"><span class="tab-ico">📊</span><span>Отчёт</span></button>
    <button class="tab"        data-tab="settings"  onclick="window.__app.switchTab('settings')"><span class="tab-ico">⚙️</span><span>Настройки</span></button>
  </nav>

  <main>
    <section class="view active" id="view-run"></section>
    <section class="view"        id="view-publish"></section>
    <section class="view"        id="view-actualize"></section>
    <section class="view"        id="view-cities"></section>
    <section class="view"        id="view-report"></section>
    <section class="view"        id="view-settings"></section>
  </main>
</div>

<div id="toast"></div>

<script>${clientJs}</script>
</body>
</html>`;
}

module.exports = { CSS, buildHTML };
