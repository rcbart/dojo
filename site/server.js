#!/usr/bin/env node
/**
 * DevDojo site server — landing, secure auth, admin, progress sync, and the dojo app.
 * Standard library + Node's built-in node:sqlite only. No third-party dependencies.
 *
 *   node site/server.js                  # http://localhost:8080
 *   PORT=3000 node site/server.js
 *   node site/server.js --create-admin <username> <password>
 *
 * Security: scrypt password hashing (per-user salt, timing-safe verify), HttpOnly
 * SameSite=Strict session cookies, rate limiting, Origin checks, strict CSP + headers,
 * allowlist input validation, parameterized SQL (site/db.js). See site/README.md.
 */
'use strict';

const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const os = require('os');
const db = require('./db');

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DOJO_FILE = path.join(ROOT, '..', 'dist', 'index.html');
const PORT = parseInt(process.env.PORT || '8080', 10);
const SECURE_COOKIES = process.env.JD_SECURE_COOKIES === '1';
// Opt-in local code runner: compiles & runs submitted Java with the host JDK.
// OFF by default. Only enable on a machine you control (it executes user code).
const LOCAL_RUNNER = process.env.JD_LOCAL_RUNNER === '1';
const OPEN_APP = process.env.JD_OPEN_APP === '1';

const SESSION_TTL_MS = 7 * 24 * 3600 * 1000;
const USERNAME_RE = /^[a-z][a-z0-9_]{2,23}$/;
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9][0-9 ()-]{6,19}$/;
const MIN_PASSWORD = 10;
const MAX_PASSWORD = 200;
const MAX_FIELD = 120;
const LEVELS = ['', 'new-to-programming', 'new-to-java', 'junior', 'mid', 'senior'];
const GOALS = ['', 'first-job', 'job-change', 'skill-up', 'interviews', 'curiosity'];

/* ----------------------------- passwords ------------------------------ */

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString('hex');
}
function makeCredentials(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return { salt, hash: hashPassword(password, salt) };
}
function verifyPassword(user, password) {
  if (!user) return false;
  const candidate = Buffer.from(hashPassword(password, user.salt), 'hex');
  const stored = Buffer.from(user.hash, 'hex');
  return candidate.length === stored.length && crypto.timingSafeEqual(candidate, stored);
}
const DUMMY = makeCredentials(crypto.randomBytes(24).toString('hex')); // constant-time login for unknown users

/* ------------------------------ sessions ------------------------------ */

const sessions = new Map();
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
function revokeUserSessions(username) {
  for (const [t, s] of sessions) if (s.username === username) sessions.delete(t);
}
function sessionCookie(token, maxAgeSec) {
  return 'jdsession=' + token + '; HttpOnly; SameSite=Strict; Path=/; Max-Age=' + maxAgeSec
    + (SECURE_COOKIES ? '; Secure' : '');
}

/* ----------------------------- rate limit ----------------------------- */

const attempts = new Map();
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
  if (SECURE_COOKIES) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', appPage
    ? "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'"
    : "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
}
function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body);
}
function readBody(req, limit = 262144) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > limit) { reject(new Error('request body too large')); req.destroy(); return; }
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
  if (!origin) return true;
  try { return new URL(origin).host === req.headers.host; } catch (e) { return false; }
}
// Only trust X-Forwarded-For when explicitly running behind a known reverse proxy
// (JD_TRUST_PROXY=1). Otherwise a client could spoof the header to appear as a new
// IP on every request and defeat the rate limiter (brute-force protection bypass).
const TRUST_PROXY = process.env.JD_TRUST_PROXY === '1';
function clientIp(req) {
  if (TRUST_PROXY) {
    const xff = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    if (xff) return xff;
  }
  return req.socket.remoteAddress || 'unknown';
}
function publicUser(u) {
  return {
    username: u.username, displayName: u.displayName, email: u.email, phone: u.phone,
    role: u.role, active: u.active, created: u.created, profile: u.profile,
    doneCount: u.doneCount,
  };
}
function str(v) { return typeof v === 'string' ? v : (v == null ? '' : String(v)); }

/* validation returns null on success, or an error string */
function validateRegistration(b) {
  const username = str(b.username).toLowerCase().trim();
  const password = str(b.password);
  const displayName = str(b.displayName).trim();
  const email = str(b.email).trim().toLowerCase();
  const phone = str(b.phone).trim();
  if (!USERNAME_RE.test(username)) return { error: 'Username must be 3–24 characters: a lowercase letter, then letters, digits or _' };
  if (password.length < MIN_PASSWORD) return { error: 'Password must be at least ' + MIN_PASSWORD + ' characters' };
  if (password.length > MAX_PASSWORD) return { error: 'Password is too long' };
  if (displayName.length > MAX_FIELD) return { error: 'Display name is too long' };
  if (email && (email.length > MAX_FIELD || !EMAIL_RE.test(email))) return { error: 'Please enter a valid email address' };
  if (phone && !PHONE_RE.test(phone)) return { error: 'Please enter a valid phone number' };
  const level = str(b.level);
  const goal = str(b.goal);
  if (!LEVELS.includes(level)) return { error: 'Unknown experience level' };
  if (!GOALS.includes(goal)) return { error: 'Unknown goal' };
  return {
    value: { username, password, displayName: displayName || username, email, phone, level, goal },
  };
}

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

/* ------------------------------ routing ------------------------------- */

/* Opt-in local Java runner: write to a temp dir, compile with the host javac, and
   (if there's a main) run it — with timeouts, an output cap, and cleanup. Never on
   by default; executes user code, so it's for machines you control only. */
function runJava(code, harness) {
  return new Promise(resolve => {
    if (typeof code !== 'string' || !code.trim() || code.length > 20000)
      return resolve({ ok: false, stage: 'input', output: 'No code, or code too large (20k max).' });
    const m = code.match(/public\s+class\s+([A-Za-z_]\w*)/) || code.match(/\bclass\s+([A-Za-z_]\w*)/);
    const cls = m ? m[1] : 'Main';
    let dir;
    try { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dojo-java-')); }
    catch (e) { return resolve({ ok: false, stage: 'io', output: String(e.message) }); }
    const cleanup = () => { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} };
    const JAVAC = process.env.JD_JAVAC || 'javac';
    const JAVA = process.env.JD_JAVA || 'java';
    const opts = { timeout: 10000, cwd: dir, maxBuffer: 1 << 20 };
    const files = [cls + '.java'];
    const hasHarness = typeof harness === 'string' && harness.trim().length > 0;
    try {
      fs.writeFileSync(path.join(dir, cls + '.java'), code);
      if (hasHarness) {
        if (harness.length > 20000) { cleanup(); return resolve({ ok: false, stage: 'input', output: 'harness too large' }); }
        fs.writeFileSync(path.join(dir, 'DojoTest.java'), harness);
        files.push('DojoTest.java');
      }
    } catch (e) { cleanup(); return resolve({ ok: false, stage: 'io', output: String(e.message) }); }
    execFile(JAVAC, files, opts, (err, so, se) => {
      if (err) { cleanup(); return resolve({ ok: false, stage: 'compile', output: String(se || err.message || '').slice(0, 8000) }); }
      const runClass = hasHarness ? 'DojoTest' : (/static\s+void\s+main/.test(code) ? cls : null);
      if (!runClass) { cleanup(); return resolve({ ok: true, stage: 'compile', output: 'Compiled successfully. (No main method to run.)' }); }
      execFile(JAVA, ['-cp', dir, runClass], opts, (e2, o2, s2) => {
        cleanup();
        resolve({ ok: true, stage: 'run', output: (String(o2 || '') + (s2 ? '\n' + s2 : '')).slice(0, 8000) || '(no output)' });
      });
    });
  });
}

async function handle(req, res) {
  const url = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
  const p = url.pathname;
  const mutating = req.method !== 'GET' && req.method !== 'HEAD';
  if (mutating && !originOk(req)) return json(res, 403, { error: 'cross-origin request rejected' });

  /* ---------- auth ---------- */

  if (p === '/api/register' && req.method === 'POST') {
    if (rateLimited('reg:' + clientIp(req), 10, 15 * 60_000)) return json(res, 429, { error: 'Too many attempts. Please try again later.' });
    let body; try { body = await readBody(req); } catch (e) { return json(res, 400, { error: e.message }); }
    const v = validateRegistration(body);
    if (v.error) return json(res, 422, { error: v.error });
    const val = v.value;
    if (db.getUser(val.username)) return json(res, 409, { error: 'That username is taken' });
    if (val.email && db.getUserByEmail(val.email)) return json(res, 409, { error: 'That email is already registered' });
    const { salt, hash } = makeCredentials(val.password);
    const role = db.userCount() === 0 ? 'admin' : 'user';
    db.createUser({ ...val, salt, hash, role, created: new Date().toISOString() });
    const token = createSession(val.username);
    res.setHeader('Set-Cookie', sessionCookie(token, SESSION_TTL_MS / 1000));
    return json(res, 201, { user: publicUser(db.getUser(val.username)), firstUser: role === 'admin' });
  }

  if (p === '/api/login' && req.method === 'POST') {
    let body; try { body = await readBody(req); } catch (e) { return json(res, 400, { error: e.message }); }
    const username = str(body.username).toLowerCase().trim();
    if (rateLimited('login:' + clientIp(req) + ':' + username, 10, 15 * 60_000)) return json(res, 429, { error: 'Too many attempts. Please try again later.' });
    // Defense in depth: cap attempts per account regardless of source IP, to blunt
    // distributed / botnet brute force against a single username.
    if (rateLimited('login-acct:' + username, 50, 15 * 60_000)) return json(res, 429, { error: 'Too many attempts. Please try again later.' });
    const u = db.getUser(username);
    const ok = (u ? verifyPassword(u, str(body.password)) : verifyPassword({ salt: DUMMY.salt, hash: DUMMY.hash }, str(body.password))) && !!u && u.active;
    if (!ok) return json(res, 401, { error: 'Invalid username or password' });
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

  /* ---------- opt-in local code runner ---------- */

  if (p === '/api/run/health' && req.method === 'GET') {
    return json(res, 200, { java: LOCAL_RUNNER });
  }
  if (p === '/api/run/java' && req.method === 'POST') {
    if (!LOCAL_RUNNER) return json(res, 404, { error: 'Local runner is off. Start the site with JD_LOCAL_RUNNER=1 and a JDK installed.' });
    if (rateLimited('run:' + clientIp(req), 30, 60_000)) return json(res, 429, { error: 'Too many runs — slow down.' });
    let body; try { body = await readBody(req); } catch (e) { return json(res, 400, { error: e.message }); }
    const out = await runJava(str(body.code), typeof body.harness === 'string' ? body.harness : null);
    return json(res, 200, out);
  }

  /* ---------- authenticated ---------- */

  const session = getSession(req);
  const me = session ? db.getUser(session.username) : null;
  if (session && (!me || !me.active)) { sessions.delete(session.token); }
  const authed = me && me.active;

  if (p === '/api/me' && req.method === 'GET') {
    if (!authed) return json(res, 401, { error: 'not signed in' });
    return json(res, 200, { user: publicUser(me) });
  }

  if (p === '/api/profile' && req.method === 'PUT') {
    if (!authed) return json(res, 401, { error: 'not signed in' });
    let body; try { body = await readBody(req); } catch (e) { return json(res, 400, { error: e.message }); }
    const displayName = str(body.displayName ?? me.displayName).trim();
    const email = str(body.email ?? me.email).trim().toLowerCase();
    const phone = str(body.phone ?? me.phone).trim();
    const level = str(body.level ?? me.profile.level);
    const goal = str(body.goal ?? me.profile.goal);
    if (displayName.length < 1 || displayName.length > MAX_FIELD) return json(res, 422, { error: 'Display name must be 1–' + MAX_FIELD + ' characters' });
    if (email && (email.length > MAX_FIELD || !EMAIL_RE.test(email))) return json(res, 422, { error: 'Please enter a valid email address' });
    if (phone && !PHONE_RE.test(phone)) return json(res, 422, { error: 'Please enter a valid phone number' });
    if (!LEVELS.includes(level)) return json(res, 422, { error: 'Unknown level' });
    if (!GOALS.includes(goal)) return json(res, 422, { error: 'Unknown goal' });
    if (email && email !== me.email) {
      const other = db.getUserByEmail(email);
      if (other && other.username !== me.username) return json(res, 409, { error: 'That email is already registered' });
    }
    db.updateProfile(me.username, { displayName, email, phone, level, goal });
    return json(res, 200, { user: publicUser(db.getUser(me.username)) });
  }

  /* ---------- progress sync ---------- */

  if (p === '/api/progress' && req.method === 'GET') {
    if (!authed) return json(res, 401, { error: 'not signed in' });
    return json(res, 200, { progress: db.getProgress(me.username) });
  }
  if (p === '/api/progress' && req.method === 'PUT') {
    if (!authed) return json(res, 401, { error: 'not signed in' });
    let body; try { body = await readBody(req); } catch (e) { return json(res, 400, { error: e.message }); }
    const obj = (body && typeof body.progress === 'object' && body.progress) || {};
    db.mergeProgress(me.username, obj);
    return json(res, 200, { progress: db.getProgress(me.username) });
  }

  /* ---------- lesson ratings ---------- */

  if (p === '/api/ratings' && req.method === 'GET') {
    if (!authed) return json(res, 401, { error: 'not signed in' });
    return json(res, 200, { ratings: db.getRatings(me.username) });
  }
  if (p === '/api/ratings' && req.method === 'POST') {
    if (!authed) return json(res, 401, { error: 'not signed in' });
    let body; try { body = await readBody(req); } catch (e) { return json(res, 400, { error: e.message }); }
    const lesson = body && body.lesson;
    const rating = body && Number(body.rating);
    try {
      db.rateLesson(me.username, String(lesson), rating, body && body.comment);
    } catch (e) { return json(res, 400, { error: e.message }); }
    return json(res, 200, { ok: true });
  }

  /* ---------- admin ---------- */

  const isAdmin = authed && me.role === 'admin';

  if (p === '/api/admin/ratings' && req.method === 'GET') {
    if (!isAdmin) return json(res, authed ? 403 : 401, { error: 'admin only' });
    return json(res, 200, { ratings: db.ratingTotals() });   // worst-rated first
  }

  if (p === '/api/admin/users' && req.method === 'GET') {
    if (!isAdmin) return json(res, authed ? 403 : 401, { error: 'admin only' });
    return json(res, 200, { users: db.listUsers().map(publicUser) });
  }

  const adminMatch = p.match(/^\/api\/admin\/users\/([a-z][a-z0-9_]{2,23})$/);
  if (adminMatch && (req.method === 'PUT' || req.method === 'DELETE')) {
    if (!isAdmin) return json(res, authed ? 403 : 401, { error: 'admin only' });
    const target = db.getUser(adminMatch[1]);
    if (!target) return json(res, 404, { error: 'no such user' });
    if (target.username === me.username) return json(res, 422, { error: 'You cannot modify your own account here' });
    if (req.method === 'DELETE') {
      db.deleteUser(target.username);
      revokeUserSessions(target.username);
      return json(res, 200, { ok: true });
    }
    let body; try { body = await readBody(req); } catch (e) { return json(res, 400, { error: e.message }); }
    if (body.role !== undefined) {
      if (!['user', 'admin'].includes(body.role)) return json(res, 422, { error: 'role must be user or admin' });
      db.setRole(target.username, body.role);
    }
    if (body.active !== undefined) {
      db.setActive(target.username, !!body.active);
      if (!body.active) revokeUserSessions(target.username);
    }
    return json(res, 200, { user: publicUser(db.getUser(target.username)) });
  }

  /* ---------- the dojo app (auth-gated) ---------- */

  if (p === '/app' || p === '/app/') {
    if (!OPEN_APP && !authed) { res.writeHead(302, { Location: '/#signin' }); return res.end(); }
    let html;
    try { html = fs.readFileSync(DOJO_FILE, 'utf8'); }
    catch (e) { return json(res, 503, { error: 'dojo build missing — run: node build.js' }); }
    if (authed) {
      // Pass identity as JSON via a data attribute; the dojo reads it safely (no HTML built from user input).
      const payload = JSON.stringify({ displayName: me.displayName, level: me.profile.level, goal: me.profile.goal });
      const tag = '<script id="jd-identity" type="application/json">'
        + payload.replace(/</g, '\\u003c') + '</script>'
        + '<script src="/dojo-bridge.js" defer></script>';
      html = html.replace('</head>', tag + '</head>');
    }
    securityHeaders(res, { appPage: true });
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(html);
  }

  if (p === '/dojo-bridge.js') {
    securityHeaders(res, { appPage: true });
    res.writeHead(200, { 'Content-Type': MIME['.js'] });
    return res.end(DOJO_BRIDGE);
  }

  /* ---------- static ---------- */

  if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { error: 'method not allowed' });
  let file = p === '/' ? '/index.html' : decodeURIComponent(p);
  file = path.normalize(file).replace(/^(\.\.(\/|\\|$))+/, '');
  const full = path.join(PUBLIC_DIR, file);
  if (!full.startsWith(PUBLIC_DIR + path.sep) && full !== path.join(PUBLIC_DIR, 'index.html')) {
    return json(res, 400, { error: 'bad path' });
  }
  const ext = path.extname(full);
  if (!MIME[ext] || !fs.existsSync(full) || !fs.statSync(full).isFile()) {
    securityHeaders(res);
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end('<!doctype html><html lang="en"><meta charset="utf-8"><title>Not found</title><body style="font-family:system-ui;max-width:640px;margin:80px auto;padding:0 20px"><h1>404</h1><p>Page not found. <a href="/">Back to DevDojo</a></p>');
  }
  securityHeaders(res);
  res.writeHead(200, { 'Content-Type': MIME[ext] });
  return res.end(fs.readFileSync(full));
}

/* Injected into the dojo page: personalize safely + sync progress to the account. */
const DOJO_BRIDGE = `(function(){
  'use strict';
  var el = document.getElementById('jd-identity');
  if (!el) return;
  var id; try { id = JSON.parse(el.textContent); } catch (e) { return; }
  // Greet by name using textContent — never innerHTML — so any name is inert.
  function greet(){
    var h = document.querySelector('h1');
    if (h && /Welcome to the Dojo/.test(h.textContent)) h.textContent = 'Welcome to the Dojo, ' + id.displayName + ' \\uD83E\\uDD4B';
  }
  if (document.readyState !== 'loading') greet(); else document.addEventListener('DOMContentLoaded', greet);

  // Floating account bar (the dojo app has no sign-out of its own). Built with
  // createElement + textContent + element.style only — CSP-safe, no innerHTML.
  function accountBar(){
    if (document.getElementById('jd-acctbar')) return;
    var bar = document.createElement('div');
    bar.id = 'jd-acctbar';
    var s = bar.style;
    s.position='fixed'; s.top='10px'; s.right='12px'; s.zIndex='2147483647';
    s.display='flex'; s.alignItems='center'; s.gap='8px';
    s.background='rgba(255,255,255,.92)'; s.backdropFilter='blur(6px)';
    s.border='1px solid #e2e8f0'; s.borderRadius='999px'; s.padding='5px 6px 5px 12px';
    s.boxShadow='0 6px 20px rgba(15,23,42,.14)'; s.font='600 13px system-ui,-apple-system,Segoe UI,Roboto,sans-serif'; s.color='#1e293b';

    var who = document.createElement('span');
    who.textContent = id.displayName;
    who.style.maxWidth='140px'; who.style.overflow='hidden'; who.style.textOverflow='ellipsis'; who.style.whiteSpace='nowrap';

    function pill(label, bg, fg){
      var b = document.createElement(arguments.length>3?'a':'button');
      b.textContent = label;
      var st=b.style; st.border='1px solid #cbd5e1'; st.borderRadius='999px'; st.padding='6px 12px';
      st.cursor='pointer'; st.font='inherit'; st.fontWeight='700'; st.textDecoration='none';
      st.background=bg||'#fff'; st.color=fg||'#1e293b';
      return b;
    }
    var acct = pill('Account', '#fff', '#4338ca', true);
    acct.href = '/account.html';
    var out = pill('Sign out', '#4f46e5', '#fff');
    out.addEventListener('click', function(){
      out.disabled = true; out.textContent = 'Signing out…';
      fetch('/api/logout', { method:'POST', credentials:'same-origin' })
        .then(function(){ window.location.assign('/'); })
        .catch(function(){ window.location.assign('/'); });
    });

    bar.appendChild(who); bar.appendChild(acct); bar.appendChild(out);
    document.body.appendChild(bar);
  }
  if (document.readyState !== 'loading') accountBar(); else document.addEventListener('DOMContentLoaded', accountBar);

  // Progress sync. KEY is the dojo's own localStorage key.
  var KEY = 'javadojo';
  var origSet = localStorage.setItem.bind(localStorage);
  function localGet(){ try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch(e){ return {}; } }
  function merge(a, b){
    var out = {}, k, f;
    for (k in a) out[k] = a[k];
    for (k in b){
      if (!out[k]) { out[k] = b[k]; continue; }
      var x = out[k], y = b[k], m = {};
      for (f in x) m[f] = x[f];             // keep ALL of local's fields
      for (f in y) if (m[f] === undefined) m[f] = y[f];
      m.done = !!(x.done || y.done);         // done never regresses
      var ca = Math.max(x.completedAt||0, y.completedAt||0);
      if (ca) m.completedAt = ca;
      out[k] = m;
    }
    return out;
  }

  // Push local progress up, debounced, on every change to the dojo's storage.
  var pushTimer = null;
  function push(){
    fetch('/api/progress', { method:'PUT', headers:{'Content-Type':'application/json'},
      credentials:'same-origin', body: JSON.stringify({ progress: localGet() }) }).catch(function(){});
  }
  localStorage.setItem = function(k, v){ origSet(k, v); if (k === KEY){ clearTimeout(pushTimer); pushTimer = setTimeout(push, 1500); } };

  // Pull server progress ONCE per tab. Reload only if it genuinely adds something,
  // and set the guard BEFORE reloading so a reload can never re-trigger the pull.
  // (This is what prevents the infinite refresh loop.)
  if (!sessionStorage.getItem('jd_pulled')) {
    sessionStorage.setItem('jd_pulled', '1');
    fetch('/api/progress', { credentials:'same-origin' }).then(function(r){ return r.ok ? r.json() : null; }).then(function(d){
      if (!d) return;
      var before = localGet();
      var merged = merge(before, d.progress || {});
      if (JSON.stringify(merged) !== JSON.stringify(before)) {
        origSet(KEY, JSON.stringify(merged)); // write directly, no push, no loop
        location.reload();                    // one-time, so the dojo renders merged progress
      }
    }).catch(function(){});
  }
})();`;

/* ------------------------------- CLI ---------------------------------- */

if (process.argv[2] === '--create-admin') {
  const [, , , username, password] = process.argv;
  if (!username || !password) { console.error('usage: node server.js --create-admin <username> <password>'); process.exit(2); }
  if (!USERNAME_RE.test(username)) { console.error('invalid username (3-24, lowercase letter first)'); process.exit(2); }
  if (password.length < MIN_PASSWORD) { console.error('password must be at least ' + MIN_PASSWORD + ' chars'); process.exit(2); }
  if (db.getUser(username)) { console.error('user exists'); process.exit(2); }
  const { salt, hash } = makeCredentials(password);
  db.createUser({ username, displayName: username, email: '', phone: '', salt, hash, role: 'admin', level: '', goal: '', created: new Date().toISOString() });
  console.log('admin user "' + username + '" created');
  process.exit(0);
}

const server = http.createServer((req, res) => {
  handle(req, res).catch(err => {
    console.error(err);
    try { json(res, 500, { error: 'internal error' }); } catch (e) { /* already sent */ }
  });
});
server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error('Port ' + PORT + ' is already in use.');
    console.error('  Either stop the other process:  lsof -i :' + PORT + '   then: kill <PID>');
    console.error('  Or run on another port:         PORT=' + (PORT + 1) + ' node site/server.js');
    process.exit(1);
  }
  throw err;
});
server.listen(PORT, () => console.log('DevDojo site on http://localhost:' + PORT
  + (SECURE_COOKIES ? ' (secure cookies)' : ' (dev mode — set JD_SECURE_COOKIES=1 behind HTTPS)')));
