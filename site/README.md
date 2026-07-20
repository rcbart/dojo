# JavaDojo site layer

The public face of JavaDojo: landing page, accounts, a professional registration flow,
an admin console, and the auth-gated dojo app with **progress that syncs to your account**.
Deliberately separate from the learning code — nothing in `src/` or `content/` knows this
layer exists. No third-party dependencies: Node's standard library + built-in SQLite only.

```
site/
  server.js        HTTP server: static pages, auth/profile/progress/admin APIs, serves the dojo at /app
  db.js            SQLite data access (parameterized queries) — users + progress
  public/          index (landing+signin), register, account, admin + shared common.js / site.css
  data/            SQLite database (dojo.db) — created at runtime, gitignored, chmod 600
```

## Requirements & run

Needs **Node 22.5+** (built-in `node:sqlite`). Then:

```bash
node build.js               # build the dojo (served at /app)
node site/server.js         # http://localhost:8080   (PORT=3000 to change)
```

The **first account registered becomes the admin** (or: `node site/server.js --create-admin <username> <password>`).
An existing `data/users.json` from the previous JSON-store version is migrated into the DB automatically on first run.

| Route            | What                                                    |
|------------------|---------------------------------------------------------|
| `/`              | landing page + sign-in                                  |
| `/register.html` | full registration (username, password, email, phone, personalization) |
| `/app`           | the dojo — redirects to sign-in unless authenticated    |
| `/account.html`  | profile: display name, email, phone, level, goal        |
| `/admin.html`    | user management + per-user progress (admin only)        |

## Data model (SQLite, `site/db.js`)

- `users` — username (PK), display_name, email (unique when set), phone, salt, hash, role, active, level, goal, created
- `progress` — (username, exercise_key) PK, done, completed_at, data; `ON DELETE CASCADE` with users

Progress syncs both ways: on entering `/app`, the dojo pulls server progress, merges it with the
browser's localStorage (done never regresses, latest `completedAt` wins), and pushes local changes
back on a debounce. Deleting a user removes their progress too.

## Security

- **Passwords**: scrypt (N=16384) with a per-user 16-byte salt; timing-safe verification; a constant-time
  dummy hash runs for unknown users so login timing can't reveal whether an account exists. Never stored in plaintext.
- **Sessions**: 256-bit random tokens in an `HttpOnly; SameSite=Strict` cookie, server-side, 7-day expiry.
  `JD_SECURE_COOKIES=1` adds `Secure` behind HTTPS. Disabling/deleting a user revokes their sessions.
- **CSRF**: SameSite=Strict + an Origin check on every mutating request.
- **Injection**: every SQL statement is parameterized (no string-built SQL). All user input is validated
  against allowlists/regex before use (username, email, phone, level, goal, password length).
- **XSS**: user-controlled values are inserted into pages via `textContent` / JSON script blocks only —
  never `innerHTML`. The `/app` greeting reads identity from a `type="application/json"` block with
  escaped `<`, and sets the name with `textContent`.
- **Headers**: strict CSP (`default-src 'self'`, no inline script on site pages), nosniff, `DENY` framing,
  no-referrer, `no-store`. The dojo at `/app` gets a relaxed CSP because it is a single self-contained
  file with inline script by design.
- **Limits**: request bodies capped (256 KB; progress payloads bounded per key/size), login & registration
  rate-limited per IP/user, static serving is path-traversal-proof.
- **Store on disk**: `data/dojo.db` is created `chmod 600` and gitignored (with `*.db*`, `*.migrated`).

## Accessibility

Semantic landmarks + skip link, labelled fields with described help text and required markers, accessible
password show/hide toggles (`aria-pressed`), `aria-live` status regions, a keyboard-usable admin table,
WCAG AA contrast, visible focus rings, and `prefers-reduced-motion` respected.

## Production path

Run behind Caddy/nginx for TLS with `JD_SECURE_COOKIES=1`. SQLite is fine for a single instance; to scale
out, move to Postgres (schema already designed in `BACKEND_PLAN.md`) and sessions to Redis, add email
verification, then optionally replace this server with the Spring Boot backend from `LAUNCH_GUIDE.md`
Phase 2 — its routes and semantics were chosen to match this one.
