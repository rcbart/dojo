# 7 — Image optimization & security

*The difference between amateur and production images: small, fast, and secure. Concepts + a lab.
~30 min. Requires Docker.*

---

A working image isn't a good image. Production images should be **small** (fast to push/pull, less
to attack), **cached well** (fast builds), and **secure** (no secrets, no root, few packages). This
module is the highest-leverage practitioner content in the course.

## Multi-stage builds — the big one

Your app needs a lot of tooling to *build* (compilers, dev dependencies) but almost none to *run*.
A **multi-stage build** uses one stage to build and a second, clean stage to hold only the final
artifact — so the build tools never ship.

```dockerfile
# ---- stage 1: build ----
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci                       # full dev dependencies
COPY . .
RUN npm run build                # produces /app/dist

# ---- stage 2: runtime (tiny, clean) ----
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html   # copy ONLY the built output
```

The final image is just nginx + your built files — none of Node, npm, or source. Multi-stage builds
routinely cut image size by 80–95%. **This is the top technique to know.**

## Pick a small, appropriate base

- `node:20` (~1 GB) vs `node:20-slim` (~200 MB) vs `node:20-alpine` (~150 MB). Prefer **slim** or
  **alpine** unless you hit a compatibility issue.
- **`distroless`** images (Google) contain your app and its runtime but **no shell or package
  manager** — tiny and hard to attack.
- **`scratch`** is an empty base — for static binaries (e.g. Go), the whole image can be a few MB.

## Order layers for cache (recap + why it matters here)

From Module 3: copy dependency manifests and install **before** copying source, so dependency layers
stay cached. Good ordering makes CI builds seconds instead of minutes. Also combine related `RUN`
steps and clean up in the *same* layer:

```dockerfile
RUN apt-get update && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/*      # clean up in the SAME layer, or the files still ship
```

(Deleting files in a *later* layer doesn't shrink the image — the earlier layer still contains
them.)

## Security essentials

- **Don't run as root.** By default containers run as root; a breakout is then root on the host.
  Add a user:
  ```dockerfile
  RUN useradd -m app
  USER app
  ```
- **Never bake secrets into images.** Passwords/keys in a `Dockerfile`, `ENV`, or copied `.env` are
  baked into layers *forever* and visible with `docker history`. Pass secrets at **run time**
  (env vars, mounted files, secret managers) — never build time.
- **Use `.dockerignore`** so `.env`, `.git`, and keys never enter the build context.
- **Pin base image versions** (and ideally digests) so a moving `latest` can't slip in changes or
  vulnerabilities.
- **Scan your images** for known vulnerabilities:
  ```bash
  docker scout cves myapp:1.0        # Docker's built-in vulnerability scan
  ```
- **Minimize installed packages** — every package is attack surface. Fewer tools = smaller + safer.

## Lab: shrink and harden an image

Start with a naive image and improve it. Given a small static site build, compare a bloated approach
to a multi-stage one.

```bash
# naive: full node image just to serve static files (huge)
cat > Dockerfile.naive <<'EOF'
FROM node:20
WORKDIR /app
COPY . .
RUN npm install && npm run build 2>/dev/null || mkdir -p dist && echo "<h1>hi</h1>" > dist/index.html
CMD ["npx", "serve", "dist"]
EOF

# good: multi-stage, tiny runtime
cat > Dockerfile.good <<'EOF'
FROM node:20 AS build
WORKDIR /app
COPY . .
RUN mkdir -p dist && echo "<h1>hi</h1>" > dist/index.html
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
USER nginx
EOF

docker build -f Dockerfile.naive -t site:naive .
docker build -f Dockerfile.good  -t site:good  .
docker images | grep site      # compare sizes — 'good' is a fraction of 'naive'
```

### Experiments

1. **Scan both.** `docker scout cves site:naive` vs `site:good` — the smaller image has far fewer
   CVEs (less software = less risk).
2. **Prove secrets leak.** Add `ENV SECRET=hunter2` to a Dockerfile, build, then `docker history
   --no-trunc <image>` — the secret is visible. Never do this in reality.
3. **Non-root check.** `docker run --rm site:good whoami` (may need a shell image) vs a root image —
   confirm the runtime user.

## Your turn (challenge)

Build an image `safe:1.0` that (a) runs as a **non-root** user and (b) contains **no** baked-in
secret. Confirm both.

**Verify you succeeded:**
```bash
U=$(docker run --rm safe:1.0 id -u 2>/dev/null)
LEAK=$(docker history --no-trunc safe:1.0 2>/dev/null | grep -ci "password\|secret\|token")
[ -n "$U" ] && [ "$U" -ne 0 ] && [ "$LEAK" -eq 0 ] && echo "PASS ✓ (uid=$U, no secrets in layers)" || echo "try again (uid=$U leaks=$LEAK)"
```
*(Hint: `RUN adduser`/`useradd` then `USER`; never put secrets in `ENV`/`Dockerfile`.)*

## Check yourself

1. What does a multi-stage build achieve? *(Builds in one stage, ships only the final artifact in a
   clean stage — dramatically smaller, no build tools in the image.)*
2. Why delete apt caches in the *same* `RUN` layer? *(Deleting in a later layer doesn't shrink the
   image; the earlier layer still contains the files.)*
3. Why never put secrets in a Dockerfile/ENV? *(They're baked into layers permanently and visible via
   `docker history`; pass secrets at run time.)*
4. Why avoid running as root in a container? *(A container breakout would be root on the host; run as
   a non-root user.)*
5. One command to check an image for known vulnerabilities? *(`docker scout cves <image>`.)*

---

**Next:** [8 — Registries & distribution →](./08-registries-distribution.md)
