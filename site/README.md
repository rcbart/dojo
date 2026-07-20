# JavaDojo site layer

The public face of JavaDojo: landing page, accounts, and the auth-gated dojo app.
Deliberately **separate from the learning code** — nothing in `src/` or `content/`
knows this layer exists. Zero dependencies: Node 18+ standard library only.

```
site/
  server.js        HTTP server: static pages, auth API, admin API, serves the dojo at /app
  public/          landing (index.html), account.html, admin.html + their JS/CSS
  data/users.json  user store — created at runtime, gitignored, chmod 600
```

## Run

```bash
node build.js               # build the dojo first (served at /app)
node site/server.js         # http://localhost:8080
```

The **first account registered becomes the admin** (or create one explicitly:
`node site/server.js --create-admin ron <password>`).

| Route           | What                                            |
|-----------------|-------------------------------------------------|
| `/`             | landing page with sign-in / register            |
| `/app`          | the dojo (redirects to login unless signed in)  |
| `/account.html` | profile: display name, level, goal              |
| `/admin.html`   | user management (admin role only)               |

## Security model

- **Passwords** are never stored: scrypt (N=16384) with a per-user 16-byte random
  salt; verification is timing-safe. The store file is written `0600`, atomically.
- **Sessions**: 256-bit random tokens in an `HttpOnly; SameSite=Strict` cookie,
  server-side store, 7-day expiry. Set `JD_SECURE_COOKIES=1` behind HTTPS to add
  `Secure`.
- **Login/registration rate-limited** (10 attempts / 15 min per IP+user), and login
  hashes a dummy password for unknown users so response timing doesn't reveal
  whether an account exists.
- **CSRF**: SameSite=Strict cookies plus an Origin check on every mutating request.
- **Headers**: strict CSP (`default-src 'self'`, no inline script on site pages),
  nosniff, DENY framing, no-referrer. The dojo app at `/app` gets a relaxed CSP
  because it is a single self-contained file with inline script by design.
- **Validation**: usernames `[a-z][a-z0-9_]{2,23}`, passwords ≥ 10 chars, profile
  fields checked against allowlists, JSON bodies capped at 10 KB.
- **Admin API** requires the admin role; admins cannot modify or delete their own
  account (no self-lockout); disabling or deleting a user revokes their sessions.

## Personalization

Signing in and visiting `/app` injects the user's profile into
`localStorage.javadojo_profile` and greets them by display name in the dojo
header — without touching the learning code. Future dojo features can read that
key for deeper personalization (recommended starting stream by level, etc.).

## Accessibility

Semantic landmarks, skip link, labelled forms with described help text, tabs with
correct ARIA and keyboard arrows, `aria-live` status regions, WCAG AA contrast,
visible focus rings, `prefers-reduced-motion` respected.

## Production deployment

Run behind Caddy/nginx for TLS (see `LAUNCH_GUIDE.md`), with:

```bash
JD_SECURE_COOKIES=1 PORT=8080 node site/server.js
```

Path to production hardening beyond this MVP: move the user store to Postgres
(the schema is already designed in `BACKEND_PLAN.md`), swap sessions to Redis if
you scale past one process, and put registration behind email verification. The
Spring Boot backend of LAUNCH_GUIDE Phase 2 can replace this server wholesale —
the routes and semantics here were chosen to match it.
