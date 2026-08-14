'use strict';
/**
 * JavaDojo local database — SQLite via Node's built-in node:sqlite (Node 22.5+).
 * All statements are parameterized; no string-built SQL anywhere.
 * File: site/data/dojo.db (gitignored). Migrates legacy site/data/users.json once.
 */
const fs = require('fs');
const path = require('path');

let DatabaseSync;
try {
  ({ DatabaseSync } = require('node:sqlite'));
} catch (e) {
  console.error('This server needs Node 22.5+ (built-in SQLite). You have ' + process.version + '.');
  console.error('Upgrade Node (e.g. brew upgrade node) and try again.');
  process.exit(1);
}

// DATA_DIR defaults to site/data; override with JD_DATA_DIR (used by tests so
// they never touch real user data).
const DATA_DIR = process.env.JD_DATA_DIR ? path.resolve(process.env.JD_DATA_DIR) : path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'dojo.db');
const LEGACY_JSON = path.join(DATA_DIR, 'users.json');

fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(DB_FILE);
try { fs.chmodSync(DB_FILE, 0o600); } catch (e) { /* best effort */ }

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    username     TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    email        TEXT NOT NULL DEFAULT '',
    phone        TEXT NOT NULL DEFAULT '',
    salt         TEXT NOT NULL,
    hash         TEXT NOT NULL,
    role         TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
    active       INTEGER NOT NULL DEFAULT 1,
    level        TEXT NOT NULL DEFAULT '',
    goal         TEXT NOT NULL DEFAULT '',
    created      TEXT NOT NULL
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email
    ON users(email) WHERE email <> '';

  CREATE TABLE IF NOT EXISTS progress (
    username     TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    exercise_key TEXT NOT NULL,
    done         INTEGER NOT NULL DEFAULT 0,
    completed_at INTEGER,
    data         TEXT NOT NULL DEFAULT '{}',
    PRIMARY KEY (username, exercise_key)
  );

  /* Lesson ratings. Phase 1 stores the signal only; the comment column exists
     now so phase 2 (written feedback) is an UPDATE rather than a migration.
     One row per user per lesson — re-rating overwrites rather than appends,
     because the question is "what do you think of this lesson", not "what did
     you think each time you visited". */
  CREATE TABLE IF NOT EXISTS ratings (
    username   TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    lesson_key TEXT NOT NULL,
    rating     INTEGER NOT NULL CHECK (rating IN (-1, 0, 1)),
    comment    TEXT,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (username, lesson_key)
  );
  CREATE INDEX IF NOT EXISTS idx_ratings_lesson ON ratings(lesson_key);
`);

/* one-time migration from the JSON store */
if (fs.existsSync(LEGACY_JSON)) {
  try {
    const legacy = JSON.parse(fs.readFileSync(LEGACY_JSON, 'utf8'));
    const ins = db.prepare(`INSERT OR IGNORE INTO users
      (username, display_name, email, phone, salt, hash, role, active, level, goal, created)
      VALUES (?, ?, '', '', ?, ?, ?, ?, ?, ?, ?)`);
    for (const u of legacy.users || []) {
      ins.run(u.username, u.displayName || u.username, u.salt, u.hash,
        u.role === 'admin' ? 'admin' : 'user', u.active ? 1 : 0,
        (u.profile && u.profile.level) || '', (u.profile && u.profile.goal) || '',
        u.created || new Date().toISOString());
    }
    fs.renameSync(LEGACY_JSON, LEGACY_JSON + '.migrated');
    console.log('migrated legacy users.json into dojo.db');
  } catch (e) {
    console.error('legacy migration failed (continuing):', e.message);
  }
}

/* ------------------------------- users -------------------------------- */

const rowToUser = r => r && {
  username: r.username, displayName: r.display_name, email: r.email, phone: r.phone,
  salt: r.salt, hash: r.hash, role: r.role, active: !!r.active,
  created: r.created, profile: { level: r.level, goal: r.goal },
};

const stmts = {
  get: db.prepare(`SELECT u.*,
      (SELECT COUNT(*) FROM progress p WHERE p.username = u.username AND p.done = 1) AS done_count
    FROM users u WHERE u.username = ?`),
  byEmail: db.prepare("SELECT * FROM users WHERE email = ? AND email <> ''"),
  count: db.prepare('SELECT COUNT(*) AS n FROM users'),
  insert: db.prepare(`INSERT INTO users
    (username, display_name, email, phone, salt, hash, role, active, level, goal, created)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`),
  updateProfile: db.prepare(`UPDATE users SET display_name = ?, email = ?, phone = ?,
    level = ?, goal = ? WHERE username = ?`),
  setRole: db.prepare('UPDATE users SET role = ? WHERE username = ?'),
  setActive: db.prepare('UPDATE users SET active = ? WHERE username = ?'),
  del: db.prepare('DELETE FROM users WHERE username = ?'),
  listAll: db.prepare(`SELECT u.*,
      (SELECT COUNT(*) FROM progress p WHERE p.username = u.username AND p.done = 1) AS done_count
    FROM users u ORDER BY u.created`),
};

exports.getUser = username => {
  const r = stmts.get.get(username);
  if (!r) return null;
  const u = rowToUser(r);
  u.doneCount = r.done_count;
  return u;
};
exports.getUserByEmail = email => rowToUser(stmts.byEmail.get(email));
exports.userCount = () => stmts.count.get().n;
exports.createUser = u => stmts.insert.run(u.username, u.displayName, u.email, u.phone,
  u.salt, u.hash, u.role, u.level || '', u.goal || '', u.created);
exports.updateProfile = (username, p) => stmts.updateProfile.run(
  p.displayName, p.email, p.phone, p.level, p.goal, username);
exports.setRole = (username, role) => stmts.setRole.run(role, username);
exports.setActive = (username, active) => stmts.setActive.run(active ? 1 : 0, username);
exports.deleteUser = username => stmts.del.run(username);
exports.listUsers = () => stmts.listAll.all().map(r => ({
  ...rowToUser(r), doneCount: r.done_count,
}));

/* ------------------------------- ratings -------------------------------- */

const rStmts = {
  upsert: db.prepare(`INSERT INTO ratings (username, lesson_key, rating, comment, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(username, lesson_key) DO UPDATE SET
      rating = excluded.rating,
      comment = COALESCE(excluded.comment, ratings.comment),
      updated_at = excluded.updated_at`),
  mine: db.prepare('SELECT lesson_key, rating, comment, updated_at FROM ratings WHERE username = ?'),
  totals: db.prepare(`SELECT lesson_key,
      SUM(rating =  1) AS up,
      SUM(rating =  0) AS neutral,
      SUM(rating = -1) AS down,
      COUNT(*)         AS total
    FROM ratings GROUP BY lesson_key ORDER BY down DESC, total DESC`),
};

/** Record or change one user's rating of one lesson. comment is phase 2. */
exports.rateLesson = (username, lessonKey, rating, comment) => {
  if (![-1, 0, 1].includes(rating)) throw new Error('rating must be -1, 0 or 1');
  if (typeof lessonKey !== 'string' || !/^[\w.:-]{1,64}$/.test(lessonKey)) throw new Error('bad lesson key');
  const text = typeof comment === 'string' && comment.trim() ? comment.trim().slice(0, 2000) : null;
  rStmts.upsert.run(username, lessonKey, rating, text, Date.now());
};

exports.getRatings = username => {
  const out = {};
  for (const r of rStmts.mine.all(username)) {
    out[r.lesson_key] = { rating: r.rating, comment: r.comment || undefined, updatedAt: r.updated_at };
  }
  return out;
};

/** Aggregate across all users — the point of collecting this at all. */
exports.ratingTotals = () => rStmts.totals.all().map(r => ({
  lesson: r.lesson_key, up: r.up, neutral: r.neutral, down: r.down, total: r.total,
  score: r.total ? Math.round(((r.up - r.down) / r.total) * 100) : null,
}));

/* ------------------------------ progress ------------------------------- */

const pStmts = {
  all: db.prepare('SELECT exercise_key, done, completed_at, data FROM progress WHERE username = ?'),
  upsert: db.prepare(`INSERT INTO progress (username, exercise_key, done, completed_at, data)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(username, exercise_key) DO UPDATE SET
      done = MAX(progress.done, excluded.done),
      completed_at = COALESCE(MAX(progress.completed_at, excluded.completed_at), progress.completed_at, excluded.completed_at),
      data = excluded.data`),
};

/** Returns the dojo's localStorage-shaped object: { key: {done, completedAt, ...} } */
exports.getProgress = username => {
  const out = {};
  for (const r of pStmts.all.all(username)) {
    let extra = {};
    try { extra = JSON.parse(r.data); } catch (e) { /* ignore */ }
    out[r.exercise_key] = { ...extra, done: !!r.done, completedAt: r.completed_at || undefined };
  }
  return out;
};

/** Merges a { key: {done, completedAt, ...} } object; done never regresses. */
exports.mergeProgress = (username, obj, limits) => {
  const maxKeys = (limits && limits.maxKeys) || 2000;
  const maxData = (limits && limits.maxData) || 4096;
  let n = 0;
  for (const [key, val] of Object.entries(obj)) {
    if (++n > maxKeys) break;
    if (typeof key !== 'string' || key.length > 80 || typeof val !== 'object' || val === null) continue;
    const { done, completedAt, ...rest } = val;
    let data = JSON.stringify(rest);
    if (data.length > maxData) data = '{}';
    pStmts.upsert.run(username, key, done ? 1 : 0,
      Number.isFinite(completedAt) ? Math.floor(completedAt) : null, data);
  }
};

exports.close = () => db.close();
