#!/usr/bin/env node
/**
 * JavaDojo site server — landing page, secure auth, admin, and the dojo app.
 * Zero dependencies: Node 18+ standard library only.
 *
 *   node site/server.js                  # http://localhost:8080
 *   PORT=3000 node site/server.js
 *   node site/server.js --create-admin <username> <password>
 *
 * Security model (see site/README.md):
 *   - passwords: scrypt, per-user 16-byte salt, timing-safe verify
 *   - sessions: 256-bit random token, HttpOnly + SameSite=Strict cookie,
 *     server-side store with 7-day expiry
 *   - login/register rate-limited per IP; Origin checked on mutations
 *   - strict security headers; CSP relaxed only for the dojo app itself
 *   - user store: site/data/users.json (gitignored), atomic writes
 */
'use strict';

const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PUBLIC_DIR = path.join(ROOT, 'public');
const DOJO_FILE = path.join(ROOT, '..', 'dist', 'index.html');
const PORT = parseInt(process.env.PORT || '8080', 10);
const SECURE_COOKIES = process.env.JD_SECURE_COOKIES === '1'; // set to 1 behind HTTPS
const OPEN_APP = process.env.JD_OPEN_APP === '1';             // 1 = dojo without login

const SESSION_TTL_MS = 7 * 24 * 3600 * 1000;
const USERNAME_RE = /^[a-z][a-z0-9_]{2,23}$/;
const MIN_PASSWORD = 10;
const LEVELS = ['new-to-programming', 'new-to-java', 'junior', 'mid', 'senior'];
const GOALS = ['first-job', 'job-change', 'skill-up', 'interviews', 'curiosity'];

/* ----------------------------- user store ----------------------------- */

function loadUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch (e) {
    return { users: [] };
  }
}
function saveUsers(db) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = USERS_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, USERS_FILE); // atomic on POSIX
}
function findUser(db, username) {
  return db.users.find(u => u.username === username);
}

/* ----------------------------- passwords ------------------------------ */

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString('hex');
}
function newUser(username, password, role) {
  const salt = crypto.randomBytes(16).toString('hex');
  return {
    username,
    displayName: username,
    salt,
    hash: hashPassword(password, salt),
    role: role || 'user',
    active: true,
    created: new Date().toISOString(),
    profile: { level: '', goal: '' },
  };
}
function verifyPassword(user, password) {
  const candidate = Buffer.from(hashPassword(password, user.salt), 'hex');
  const stored = Buffer.from(user.hash, 'hex');
  return candidate.length === stored.length && crypto.timingSafeEqual(candidate, stored);
}

/* ------------------------------ sessions ------------------------------ */

const sessions = new Map(); // token -> { username, expires }
setInterval(() => {
  const now = Date.now();
  for (const [t, s] of sessions) if (s.expires < now) sessions.delete(t);
}, 60_000).unref();

function createSession(username) {
  const token = crypto.randomBytes(32).toString('base64url');
  sessions.set(token, { username, expires: Date.now() + SESSION_TTL_MS });
  return token;
}
function getSession(req) {
  const cookie = req.headers.cookie || '';
  const m = cookie.match(/(?:^|;\s*)jdsession=([A-Za-z0-9_-]+)/);
  if (!m) return null;
  const s = sessions.get(m[1]);
  if (!s || s.expires < Date.now()) return null;
  return { token: m[1], username: s.username };
}
function sessionCookie(token, maxAgeSec) {
  return 'jdsession=' + token
    + '; HttpOnly; SameSite=Strict; Path=/'
    + '; Max-Age=' + maxAgeSec
    + (SECURE_COOKIES ? '; Secure' : '');
}

/* ----------------------------- rate limit ----------------------------- */

const attempts = new Map(); // key -> { count, resetAt }
function rateLimited(key, max, windowMs) {
  const now = Date.now();
  let a = attempts.get(key);
  if (!a || a.resetAt < now) { a = { count: 0, resetAt: now + windowMs }; attempts.set(key, a); }
  a.count++;
  return a.count > max;
}
setInterval(() => {
  const now = Date.now();
  for (const [k, a] of attempts) if (a.resetAt < now) attempts.delete(k);
}, 60_000).unref();

/* ------------------------------ helpers ------------------------------- */

function securityHeaders(res, { appPage } = {}) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cache-Control', 'no-store');
  // The dojo app is a single file with inline script/style; site pages are strict.
  res.setHeader('Content-Security-Policy', appPage
    ? "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'"
    : "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
}
function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > 10_240) { reject(new Error('body too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); }
      catch (e) { reject(new Error('invalid json')); }
    });
    req.on('error', reject);
  });
}
function originOk(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // same-origin form posts / curl
  const host = req.headers.host;
  try { return new URL(origin).host === host; } catch (e) { return false; }
}
function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket.remoteAddress || 'unknown';
}
function publicUser(u) {
  return {
    username: u.username, displayName: u.displayName, role: u.role,
    active: u.active, created: u.created, profile: u.profile,
  };
}
function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ------------------------------ routing ------------------------------- */

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };

async function handle(req, res) {
  const url = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
  const p = url.pathname;
  const mutating = req.method !== 'GET' && req.method !== 'HEAD';

  if (mutating && !originOk(req)) return json(res, 403, { error: 'cross-origin request rejected' });

  /* ---------- auth API ---------- */

  if (p === '/api/register' && req.method === 'POST') {
    if (rateLimited('reg:' + clientIp(req), 10, 15 * 60_000)) return json(res, 429, { error: 'too many attempts, try again later' });
    let body; try { body = await readBody(req); } catch (e) { return json(res, 400, { error: e.message }); }
    const username = String(body.username || '').toLowerCase().trim();
    const password = String(body.password || '');
    if (!USERNAME_RE.test(username)) return json(res, 422, { error: 'username: 3-24 chars, lowercase letter first, then letters/digits/_' });
    if (password.length < MIN_PASSWORD) return json(res, 422, { error: 'password must be at least ' + MIN_PASSWORD + ' characters' });
    const db = loadUsers();
    if (findUser(db, username)) return json(res, 409, { error: 'that username is taken' });
    const u = newUser(username, password, db.users.length === 0 ? 'admin' : 'user'); // first user becomes admin
    db.users.push(u);
    saveUsers(db);
    const token = createSession(username);
    res.setHeader('Set-Cookie', sessionCookie(token, SESSION_TTL_MS / 1000));
    return json(res, 201, { user: publicUser(u), firstUser: u.role === 'admin' });
  }

  if (p === '/api/login' && req.method === 'POST') {
    let body; try { body = await readBody(req); } catch (e) { return json(res, 400, { error: e.message }); }
    const username = String(body.username || '').toLowerCase().trim();
    if (rateLimited('login:' + clientIp(req) + ':' + username, 10, 15 * 60_000)) return json(res, 429, { error: 'too many attempts, try again later' });
    const db = loadUsers();
    const u = findUser(db, username);
    // verify against a dummy user when absent so timing does not reveal existence
    const target = u || newUser('nobody_timing', 'x'.repeat(32));
    const ok = verifyPassword(target, String(body.password || '')) && !!u && u.active;
    if (!ok) return json(res, 401, { error: 'invalid username or password' });
    const token = createSession(username);
    res.setHeader('Set-Cookie', sessionCookie(token, SESSION_TTL_MS / 1000));
    return json(res, 200, { user: publicUser(u) });
  }

  if (p === '/api/logout' && req.method === 'POST') {
    const s = getSession(req);
    if (s) sessions.delete(s.token);
    res.setHeader('Set-Cookie', sessionCookie('gone', 0));
    return json(res, 200, { ok: true });
  }

  /* ---------- authenticated API ---------- */

  const session = getSession(req);
  const db = loadUsers();
  const me = session ? findUser(db, session.username) : null;
  if (session && (!me || !me.active)) { sessions.delete(session.token); }

  if (p === '/api/me' && req.method === 'GET') {
    if (!me || !me.active) return json(res, 401, { error: 'not signed in' });
    return json(res, 200, { user: publicUser(me) });
  }

  if (p === '/api/profile' && req.method === 'PUT') {
    if (!me || !me.active) return json(res, 401, { error: 'not signed in' });
    let body; try { body = await readBody(req); } catch (e) { return json(res, 400, { error: e.message }); }
    const displayName = String(body.displayName ?? me.displayName).trim().slice(0, 40);
    if (displayName.length < 1) return json(res, 422, { error: 'display name cannot be empty' });
    const level = String(body.level ?? me.profile.level);
    const goal = String(body.goal ?? me.profile.goal);
    if (level && !LEVELS.includes(level)) return json(res, 422, { error: 'unknown level' });
    if (goal && !GOALS.includes(goal)) return json(res, 422, { error: 'unknown goal' });
    me.displayName = displayName;
    me.profile = { level, goal };
    saveUsers(db);
    return json(res, 200, { user: publicUser(me) });
  }

  /* ---------- admin API ---------- */

  const isAdmin = me && me.active && me.role === 'admin';

  if (p === '/api/admin/users' && req.method === 'GET') {
    if (!isAdmin) return json(res, me ? 403 : 401, { error: 'admin only' });
    return json(res, 200, { users: db.users.map(publicUser) });
  }

  const adminUserMatch = p.match(/^\/api\/admin\/users\/([a-z][a-z0-9_]{2,23})$/);
  if (adminUserMatch && (req.method === 'PUT' || req.method === 'DELETE')) {
    if (!isAdmin) return json(res, me ? 403 : 401, { error: 'admin only' });
    const target = findUser(db, adminUserMatch[1]);
    if (!target) return json(res, 404, { error: 'no such user' });
    if (target.username === me.username) return json(res, 422, { error: 'you cannot modify your own account here' });
    if (req.method === 'DELETE') {
      db.users = db.users.filter(u => u.username !== target.username);
      for (const [t, s] of sessions) if (s.username === target.username) sessions.delete(t);
      saveUsers(db);
      return json(res, 200, { ok: true });
    }
    let body; try { body = await readBody(req); } catch (e) { return json(res, 400, { error: e.message }); }
    if (body.role !== undefined) {
      if (!['user', 'admin'].includes(body.role)) return json(res, 422, { error: 'role must be user or admin' });
      target.role = body.role;
    }
    if (body.active !== undefined) {
      target.active = !!body.active;
      if (!target.active) for (const [t, s] of sessions) if (s.username === target.username) sessions.delete(t);
    }
    saveUsers(db);
    return json(res, 200, { user: publicUser(target) });
  }

  /* ---------- the dojo app (auth-gated) ---------- */

  if (p === '/app' || p === '/app/') {
    if (!OPEN_APP && (!me || !me.active)) {
      res.writeHead(302, { Location: '/#login' });
      return res.end();
    }
    let html;
    try { html = fs.readFileSync(DOJO_FILE, 'utf8'); }
    catch (e) { return json(res, 503, { error: 'dojo build missing — run: node build.js' }); }
    if (me) {
      const profile = JSON.stringify({ displayName: me.displayName, ...me.profile });
      const inject = '<script>try{localStorage.setItem("javadojo_profile",' + JSON.stringify(profile) + ');'
        + 'addEventListener("DOMContentLoaded",function(){var h=document.querySelector("h1");'
        + 'if(h&&/Welcome to the Dojo/.test(h.textContent)){h.textContent="Welcome to the Dojo, '
        + escHtml(me.displayName).replace(/"/g, '\\"') + ' 🥋";}});}catch(e){}</script>';
      html = html.replace('</head>', inject + '</head>');
    }
    securityHeaders(res, { appPage: true });
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(html);
  }

  /* ---------- static site pages ---------- */

  if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { error: 'method not allowed' });

  let file = p === '/' ? '/index.html' : p;
  file = path.normalize(file).replace(/^(\.\.[/\\])+/, '');
  const full = path.join(PUBLIC_DIR, file);
  if (!full.startsWith(PUBLIC_DIR)) return json(res, 400, { error: 'bad path' });
  const ext = path.extname(full);
  if (!MIME[ext] || !fs.existsSync(full)) {
    securityHeaders(res);
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end('<!doctype html><html lang="en"><meta charset="utf-8"><title>Not found</title><p>Not found. <a href="/">Back to JavaDojo</a></p>');
  }
  securityHeaders(res);
  res.writeHead(200, { 'Content-Type': MIME[ext] });
  return res.end(fs.readFileSync(full));
}

/* ------------------------------- CLI ---------------------------------- */

if (process.argv[2] === '--create-admin') {
  const [, , , username, password] = process.argv;
  if (!username || !password) { console.error('usage: node server.js --create-admin <username> <password>'); process.exit(2); }
  if (!USERNAME_RE.test(username)) { console.error('invalid username (3-24, lowercase letter first)'); process.exit(2); }
  if (password.length < MIN_PASSWORD) { console.error('password must be at least ' + MIN_PASSWORD + ' chars'); process.exit(2); }
  const db = loadUsers();
  if (findUser(db, username)) { console.error('user exists'); process.exit(2); }
  db.users.push(newUser(username, password, 'admin'));
  saveUsers(db);
  console.log('admin user "' + username + '" created');
  process.exit(0);
}

http.createServer((req, res) => {
  handle(req, res).catch(err => {
    console.error(err);
    try { json(res, 500, { error: 'internal error' }); } catch (e) { /* already sent */ }
  });
}).listen(PORT, () => console.log('JavaDojo site on http://localhost:' + PORT
  + (SECURE_COOKIES ? ' (secure cookies)' : ' (dev mode — set JD_SECURE_COOKIES=1 behind HTTPS)')));
