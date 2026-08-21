# JavaDojo Launch Guide: Step by Step

Companion to `BACKEND_PLAN.md`. That file explains *why*; this one is the *how*: every command, file, and config to take JavaDojo from a local HTML file to a live product at your own domain.

**Stack:** GitHub Pages (frontend) · Hetzner CX22 VPS ~€4.6/mo (backend) · Spring Boot 4.1 / Java 25 · Postgres 17 · Redis · Caddy (TLS) · GitHub Actions (CI/CD).

> **Status: Phase 0 is done, by a different route. Phases 1 to 6 are still open.**
>
> The site is live at **https://roniam.dev/**, not at `javadojo.dev`. Every course ships from this one
> repository, built and deployed by GitHub Actions on each push to `main`: `/dev/`, `/identity/`,
> `/js/`, `/ml/`, `/fundamentals/`, `/docker/`, `/kubernetes/`, `/envoy/`, `/istio/`, plus `/courses/`
> and `/blog/`. There is no separate site repository and no manual copy step. The deploy is gated on
> 13 checks, so a page whose inline scripts do not parse, or a stat on the home page that disagrees
> with the content, fails the build instead of shipping. The dojos are in alpha.
>
> Two phases below were overtaken by what got built:
>
> - **Real code execution arrived in the browser for two languages, without any of Phase 5.** JS Dojo
>   grades JavaScript by running it in a sandboxed Web Worker; ML Dojo runs Python through Pyodide.
>   Java is still graded structurally, so Phase 5 stands for Java and for anything that needs a
>   verdict the client cannot forge.
> - **Accounts and progress sync exist, on a different stack, and are not deployed.** `site/` is a
>   registration flow, account page, admin console and per-user progress store written against Node's
>   standard library and its built-in SQLite, with no third-party dependencies. It runs on localhost.
>   It is not the Spring Boot, Postgres and Redis design in Phases 1 to 3, and the published site does
>   not talk to it: progress on roniam.dev lives in the browser and nowhere else.
>
> Everything after this note is the plan as written. The names in it, `javadojo.dev` and `dojo-api`,
> are the plan's names, not anything that is running.

**Prerequisites (one-time, ~1 hour)**

1. Accounts: [github.com](https://github.com), [hetzner.com/cloud](https://www.hetzner.com/cloud), [console.anthropic.com](https://console.anthropic.com) (API key for Phase 4), a domain registrar (Namecheap/Porkbun, ~$10/yr, you'll want e.g. `javadojo.dev`).
2. Local tools:
   ```bash
   # macOS
   brew install git gh docker sdkman-cli
   sdk install java 25-tem        # Temurin JDK 25 (LTS)
   sdk install maven
   gh auth login
   ```
3. An SSH key: `ssh-keygen -t ed25519 -C "javadojo"` (accept defaults).

---

## Phase 0: Get the site live today (~1 afternoon)

The dojo file already degrades gracefully outside Cowork: when `window.cowork.askClaude` is missing it falls back to structural checks and says so in the header status line. So Phase 0 is almost pure publishing.

**Status: done, and worth reading as a record rather than as instructions.** The site is published straight from this repository by `.github/workflows/pages.yml`, not from a second repository, and the domain is `roniam.dev`. Steps 1 and 3 describe a copy-and-push flow that no longer happens. Step 4's custom domain is in place. What the phase did not anticipate: the workflow now builds nine courses, runs the engine unit tests, verifies the content of each dojo, executes graded exercises against their own solutions, compiles every Java reference solution, and checks the published prose, before it publishes anything.

1. Create the repo and copy the file in:
   ```bash
   mkdir ~/code/javadojo-site && cd ~/code/javadojo-site
   git init
   cp dist/index.html index.html
   ```
2. One tiny edit for the public web: in `index.html`, find the status line (`System status: AI test runner`) and reword the fallback text so it reads for a public audience, something like `'coming soon, structural checks active'`, rather than announcing that a feature is unavailable. Optional but honest.
3. Publish:
   ```bash
   git add . && git commit -m "JavaDojo static site"
   gh repo create javadojo --public --source=. --push
   gh api repos/{owner}/javadojo/pages -X POST -f build_type=workflow 2>/dev/null || true
   ```
   In the repo on GitHub: **Settings → Pages → Source: Deploy from a branch → main / root**. Two minutes later you're at `https://<you>.github.io/javadojo/`.
4. Custom domain (optional now, needed before Phase 2 for clean CORS): add a `CNAME` file containing `javadojo.dev`, and at your registrar add a CNAME record `www → <you>.github.io` plus the four GitHub Pages A records for the apex. Enable **Enforce HTTPS** in Pages settings.

**Done when:** the dojo loads at a public URL, lessons open, structural checks pass exercises, progress persists in your browser. **Met:** four dojos and five crash courses load at https://roniam.dev/, lessons open, exercises grade in the browser, progress persists locally.

---

## Phase 1: Backend skeleton that deploys (~1 weekend)

Goal: an empty-but-real Spring Boot API running on your VPS behind TLS, redeployed automatically on every push. Do this *before* writing features, every later phase then ships the day it works.

**Status: not built.** There is no VPS, no Spring Boot service and no `api.` host. The only thing deployed is the static site on GitHub Pages. Every phase from here on depends on this one, which is why they are all still open.

### 1.1 Generate the project

```bash
cd ~/code
curl https://start.spring.io/starter.tgz \
  -d type=maven-project -d language=java -d javaVersion=25 \
  -d bootVersion=4.1.0 -d groupId=dev.javadojo -d artifactId=dojo-api \
  -d dependencies=web,data-jpa,postgresql,flyway,actuator,validation \
  | tar -xzvf -
cd dojo-api && git init && git add . && git commit -m "skeleton"
gh repo create dojo-api --private --source=. --push
```
(Security dependency comes in Phase 2, adding it now locks every endpoint before you have users.)

### 1.2 Local dev environment

`compose.yaml` in the project root:
```yaml
services:
  db:
    image: postgres:17
    environment:
      POSTGRES_DB: dojo
      POSTGRES_USER: dojo
      POSTGRES_PASSWORD: dojo_local
    ports: ["5432:5432"]
    volumes: [dbdata:/var/lib/postgresql/data]
  redis:
    image: redis:7
    ports: ["6379:6379"]
volumes:
  dbdata:
```

`src/main/resources/application.yaml`:
```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/dojo}
    username: ${DB_USER:dojo}
    password: ${DB_PASS:dojo_local}
  flyway:
    enabled: true
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
```

First migration `src/main/resources/db/migration/V1__baseline.sql`:
```sql
-- placeholder so Flyway has a baseline; real tables arrive in Phase 2/3
CREATE TABLE schema_note (id int PRIMARY KEY, note text);
```

Run it: `docker compose up -d && ./mvnw spring-boot:run`, then `curl localhost:8080/actuator/health` → `{"status":"UP"}`.

### 1.3 Containerize

`Dockerfile`:
```dockerfile
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:25-jre
RUN useradd -r -u 1001 app
USER app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app.jar"]
```

### 1.4 The server

1. Hetzner Console → Add Server: location near you, **Ubuntu 24.04**, type **CX22** (2 vCPU / 4 GB, enough through Phase 4), add your SSH public key. Note the IP.
2. DNS: at your registrar add `A api.javadojo.dev → <server-ip>`.
3. Harden and install Docker:
   ```bash
   ssh root@<ip>
   adduser deploy && usermod -aG sudo deploy
   rsync -a ~/.ssh /home/deploy/ && chown -R deploy:deploy /home/deploy/.ssh
   # sshd: disable root login + passwords
   sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/; s/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
   systemctl restart ssh
   ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw enable
   apt update && apt install -y unattended-upgrades
   curl -fsSL https://get.docker.com | sh && usermod -aG docker deploy
   ```
4. Production compose on the server, `/home/deploy/dojo/compose.yaml`, same as local plus the API and Caddy:
   ```yaml
   services:
     api:
       image: ghcr.io/<you>/dojo-api:latest
       restart: unless-stopped
       environment:
         DB_URL: jdbc:postgresql://db:5432/dojo
         DB_USER: dojo
         DB_PASS: ${DB_PASS}
       depends_on: [db, redis]
     db:
       image: postgres:17
       restart: unless-stopped
       environment:
         POSTGRES_DB: dojo
         POSTGRES_USER: dojo
         POSTGRES_PASSWORD: ${DB_PASS}
       volumes: [dbdata:/var/lib/postgresql/data]
     redis:
       image: redis:7
       restart: unless-stopped
     caddy:
       image: caddy:2
       restart: unless-stopped
       ports: ["80:80", "443:443"]
       volumes:
         - ./Caddyfile:/etc/caddy/Caddyfile
         - caddy_data:/data
   volumes: { dbdata: {}, caddy_data: {} }
   ```
   `Caddyfile` (TLS is automatic, this is the whole config):
   ```
   api.javadojo.dev {
       reverse_proxy api:8080
   }
   ```
   `.env` next to it: `DB_PASS=<generate: openssl rand -base64 24>`

### 1.5 CI/CD

`.github/workflows/deploy.yml` in dojo-api:
```yaml
name: deploy
on: { push: { branches: [main] } }
permissions: { contents: read, packages: write }
jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with: { registry: ghcr.io, username: ${{ github.actor }}, password: ${{ secrets.GITHUB_TOKEN }} }
      - uses: docker/build-push-action@v6
        with: { push: true, tags: "ghcr.io/${{ github.repository_owner }}/dojo-api:latest" }
      - name: redeploy
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: deploy
          key: ${{ secrets.VPS_SSH_KEY }}
          script: cd ~/dojo && docker compose pull api && docker compose up -d
```
Repo → Settings → Secrets: `VPS_HOST` (the IP) and `VPS_SSH_KEY` (a *new* keypair's private half; put its public half in `/home/deploy/.ssh/authorized_keys`). If the image package is private, also run `docker login ghcr.io` once on the server with a read-only PAT.

**Done when:** `curl https://api.javadojo.dev/actuator/health` returns UP, and pushing to main redeploys by itself.

---

## Phase 2: Accounts (~1 week)

**Status: built, on a different stack, and not deployed.** `site/` implements registration, sign-in, an account page and an admin console, with users in SQLite and the first registered account promoted to admin. It uses Node's standard library and built-in SQLite, no dependencies, so none of the JWT, Spring Security or CORS work below was needed. It has never run anywhere but localhost, and the published site has no accounts at all.

### 2.1 Dependencies & schema

Add to `pom.xml`: `spring-boot-starter-security`, and `io.jsonwebtoken:jjwt-api`, `jjwt-impl`, `jjwt-jackson` (0.12.x).

`V2__users.sql`:
```sql
CREATE TABLE users (
  id            bigserial PRIMARY KEY,
  email         text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);
```

### 2.2 Endpoints

Build in this order, each is testable with curl before the next:

1. `POST /api/auth/register {email, password}`: validate email format + password ≥ 10 chars, hash with `BCryptPasswordEncoder`, insert, return 201. Duplicate email → 409.
2. `POST /api/auth/login {email, password}`: verify with `passwordEncoder.matches()`, return `{token}`: a JWT signed HS256 with a 256-bit secret from env (`JWT_SECRET`, generate with `openssl rand -base64 32`), subject = user id, expiry 7 days.
3. A `OncePerRequestFilter` that reads `Authorization: Bearer`, validates the JWT, and sets the `SecurityContext`.

### 2.3 Security config

```java
@Bean
SecurityFilterChain chain(HttpSecurity http) throws Exception {
  return http
    .csrf(c -> c.disable())                    // stateless JWT API
    .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
    .authorizeHttpRequests(a -> a
        .requestMatchers("/api/auth/**", "/actuator/health").permitAll()
        .anyRequest().authenticated())
    .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
    .build();
}
```

CORS, lock to your site, not `*`:
```java
@Bean
CorsConfigurationSource cors() {
  var c = new CorsConfiguration();
  c.setAllowedOrigins(List.of("https://javadojo.dev", "https://<you>.github.io"));
  c.setAllowedMethods(List.of("GET","POST","PUT","OPTIONS"));
  c.setAllowedHeaders(List.of("Authorization","Content-Type"));
  var s = new UrlBasedCorsConfigurationSource();
  s.registerCorsConfiguration("/api/**", c);
  return s;
}
```

Add `JWT_SECRET` to the server's `.env` and the compose `environment:` block.

**Done when:** register → login → `curl -H "Authorization: Bearer $TOKEN" https://api.javadojo.dev/api/me` round-trips from your terminal, and a browser on `javadojo.dev` can call it (CORS preflight passes).

---

## Phase 3: Progress sync (~1 week)

**Status: built in the same local layer, and not reachable from the public site.** `site/db.js` carries a `progress` table keyed by (username, exercise_key) with `done` and a completion timestamp, cascading on user delete, which is the same shape as the schema below. The merge rule and the frontend wiring described here are the parts that never had to be written, because the browser and the server are never both in play: on roniam.dev, localStorage is the only store. Solving an exercise in Chrome still does not put it on your phone.

### 3.1 Schema: `V3__progress.sql`

```sql
CREATE TABLE progress (
  user_id      bigint NOT NULL REFERENCES users(id),
  exercise_key text   NOT NULL,          -- the dojo's exSid: "lessonId" or "lessonId#i"
  done         boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  last_code    text,
  PRIMARY KEY (user_id, exercise_key)
);
```

### 3.2 API

- `GET /api/progress` → `{"<exercise_key>": {"done":true,"completedAt":"...","lastCode":"..."}}` for the authed user.
- `PUT /api/progress` accepts the same shape and **merges**: per key, the entry with the later `completedAt` wins; `done:true` never regresses to false. Upsert with `INSERT ... ON CONFLICT (user_id, exercise_key) DO UPDATE ... WHERE excluded.completed_at > progress.completed_at`.

### 3.3 Frontend integration (edits to `index.html`)

The dojo's storage is one object: the `store` at the top of the STATE section (localStorage key `'javadojo'`, keyed by `exSid` = `lessonId` or `lessonId#index`). Integration is three additions, no rewrite:

1. **Login UI**: a small "Sign in" button in the header → modal with email/password → calls `/api/auth/login|register`, keeps the JWT in a `let authToken` variable (in-memory; localStorage works too but XSS-reads it, your call, note the tradeoff in the README).
2. **Pull on login**: fetch `GET /api/progress`, merge into `store.get()` with the same latest-wins rule, `store.set(merged)`, re-render.
3. **Push on change**: wrap `store.patch`, after each local write, debounce 2s, then `PUT /api/progress` with the changed keys. Offline/logged-out silently skips; localStorage remains the source of truth for anonymous users.

**Done when:** solve an exercise in Chrome, log in on your phone, the belt progress is there.

---

## Phase 4: AI judge proxy (~1 week)

Restores the dojo's smartest feature, real test verdicts, publicly and affordably.

**Status: not built.** There is no judge proxy, no key held anywhere, and no spend to cap. On the public site the AI path is simply absent and grading falls back to what the browser can do by itself.

### 4.1 Schema: `V4__judge.sql`

```sql
CREATE TABLE submissions (
  id           bigserial PRIMARY KEY,
  user_id      bigint NOT NULL REFERENCES users(id),
  exercise_key text NOT NULL,
  code         text NOT NULL,
  verdict      jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE api_usage (
  user_id     bigint NOT NULL REFERENCES users(id),
  day         date   NOT NULL,
  judge_calls int    NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);
```

### 4.2 The endpoint

`POST /api/judge {exerciseKey, code}` (auth required):

1. **Daily cap**: `UPDATE api_usage ... RETURNING judge_calls`; over 50/day → 429 with a friendly message.
2. **Rate limit**: Bucket4j lettuce/Redis bucket per user, 5 requests/min. Add `bucket4j-redis` dependency.
3. **Cache**: Caffeine, key = `exerciseKey + ":" + sha256(code)`, TTL 24h, max 10k entries, identical resubmissions are free.
4. **Call Claude**: the judge prompt already exists in the dojo (search `index.html` for `You are JavaDojo's build and test runner`, it takes the exercise prompt, the `behavior` test spec, and numbered code, and demands a strict JSON verdict: `{compiles, compileErrors[], tests[], output, passed, feedback}`). Move that prompt server-side verbatim. You'll need the exercise metadata server-side too: write a small script that extracts each exercise's `prompt` and `behavior` from the HTML into `exercises.json`, shipped inside the API jar, this also stops clients from forging easier rubrics. Call `POST https://api.anthropic.com/v1/messages` with `claude-haiku-4-5` (cheap, plenty for judging), `ANTHROPIC_API_KEY` from env.
5. Persist to `submissions`, and if `passed`, upsert `progress` server-side, **the server, not the client, records completion** (client-set `done` from Phase 3 still syncs, but treat it as unverified: add a `verified` boolean to progress if you want the distinction).
6. Return the verdict JSON unchanged, the dojo's existing renderer already understands it.

### 4.3 Frontend

In `index.html`, the runner function currently does `window.cowork.askClaude(prompt,[])`. Replace that branch: if `authToken` exists, `fetch('https://api.javadojo.dev/api/judge', ...)` and feed the response into the same `extractJson`/render path; else keep the structural-checks fallback with a "sign in for AI-verified runs" nudge. Same one-line swap in the hint function, via a `POST /api/hint` twin (tighter cap, 20/day).

**Done when:** logged in on the public site, "Compile & Run Tests" returns real verdicts; a second identical run returns instantly (cache); the 6th run inside a minute returns 429; your Anthropic console shows bounded spend.

---

## Phase 5: Real code execution (the crown jewel, 2–4 weeks)

Replace "AI judges your code" with "your code actually compiles and runs against JUnit-style tests." This is the part with real engineering teeth: you are deliberately building a service whose job is to run hostile code safely.

**Status: partly overtaken, and still open where it matters.** For two languages the problem was solved by not putting the code on a server at all: JS Dojo runs learner JavaScript in a sandboxed Web Worker, and ML Dojo runs learner Python through Pyodide, both in the browser, where the blast radius is the learner's own tab. CI adds a second kind of execution the phase never proposed: 999 exercise cases across 184 exercises are executed against their own reference solutions on every push, and every self-contained Java reference solution is compiled with a real JDK. None of that is the same as running the learner's Java, and none of it produces a verdict the client could not forge. For Java, and for any pass a server would need to trust, this phase stands exactly as written.

### 5.0 Pragmatic on-ramp (weekend)

Integrate [Judge0](https://judge0.com) first: point `POST /api/run` at its API (self-hosted CE via their docker-compose on your VPS, or their hosted tier). You get compile+run working in days and a felt understanding of the problem, then replace it with your own runner and keep Judge0 as the fallback flag.

### 5.1 Your own runner

A second, minimal service (`dojo-runner`, plain Java or a thin Spring app) on the VPS, or, better for isolation once traffic exists, a second small VPS with no DB credentials at all.

Execution recipe per submission:

```bash
# workspace prepared by the runner service:
#   /job/Solution.java  (student code)
#   /job/MainTest.java  (generated per exercise from its behavior spec)
docker run --rm \
  --network none --memory 256m --cpus 0.5 --pids-limit 64 \
  --read-only --tmpfs /work:rw,size=64m,noexec=false \
  --user 65534:65534 --cap-drop ALL --security-opt no-new-privileges \
  -v /srv/jobs/<id>:/job:ro \
  dojo-runner-image \
  timeout -k 2 10 sh -c 'cp /job/*.java /work && cd /work && javac *.java 2>&1 && java MainTest 2>&1'
```

Rules that are not optional: no network, non-root, read-only rootfs, memory/CPU/pid caps, hard 10s timeout, fresh container per run, output truncated (say 64 KB) before it's stored or returned. The runner image is just `eclipse-temurin:25` plus nothing.

### 5.2 Test harnesses

Each exercise's `behavior` spec (already structured text in the dojo) becomes a real `MainTest.java`, assertions that print `PASS test-name` / `FAIL test-name: detail` lines the API parses into the same verdict JSON the frontend already renders. Generate these semi-automatically (an LLM pass over `exercises.json` gets you 80%; hand-fix the rest) and commit them, they're now the authoritative test suite, versioned in git.

### 5.3 Queue

API inserts into `submissions` with `status='queued'`; runner polls (`SELECT ... FOR UPDATE SKIP LOCKED LIMIT 1`), executes, writes verdict; API long-polls or the frontend polls `GET /api/submissions/{id}` every second. A DB queue is correct at this scale, upgrade to Kafka only when you want to cash in the messaging lesson for real, and enjoy that the outbox pattern you studied is exactly what the migration needs.

**Done when:** deliberately hostile submissions fail safely, `while(true){}` (timeout kills it), `new byte[Integer.MAX_VALUE]` (memory cap), `new Socket("evil.com",80)` (no network), `Runtime.exec("rm -rf /")` (non-root, read-only, containerized), fork bombs (pid limit), and honest solutions pass with real compiler errors on real mistakes.

---

## Phase 6: Production hardening (ongoing)

**Status: not started, and mostly not applicable yet.** Nothing is running that needs logs, metrics, backups or an abuse watch. The hardening that did land is on the content rather than on a server: 13 CI gates, listed with their reasons in `.github/workflows/pages.yml`, covering engine unit tests, per-course content verification, executed exercises, Java compilation, lesson depth, the cloud-native page structure, color contrast, every built page's inline scripts, quiz option length bias, correct-answer spread, the home page stats, the published prose, and the sitemap.

- **Logs**: `logstash-logback-encoder` for JSON logs; an MDC filter putting `requestId` + `userId` on every line (the Logging lesson, in anger). `docker compose logs` is fine until it isn't; then ship to Grafana Loki (free, runs in compose).
- **Metrics**: `micrometer-registry-prometheus` + Prometheus + Grafana containers on the VPS. One dashboard: request rate/latency, judge calls + spend/day, runner queue depth, JVM heap.
- **Backups**: nightly cron on the VPS, `docker compose exec -T db pg_dump -U dojo dojo | gzip > /backups/dojo-$(date +%F).sql.gz`, keep 14, and copy off-box (rclone to any object storage). **Do one test restore now**, an untested backup is a hope, not a backup.
- **Updates**: Dependabot on both repos; `unattended-upgrades` already handles the OS.
- **Abuse watch**: the `submissions` table is your forensics, a weekly look at top users by judge calls and weird code patterns.

---

## Cost & launch checklist

| Item | Cost |
|---|---|
| Hetzner CX22 | ~€4.6/mo |
| Domain | ~$10/yr |
| GitHub Pages, Actions, GHCR | free |
| Claude API (judge, capped) | usage-based; caps keep it ~$5–20/mo |

Actual spend today: the domain, and nothing else. GitHub Pages, Actions and GHCR are free at this size, and none of the paid stack exists yet.

**Launch order recap:** ~~0 site live~~ done → 1 API deploys itself → 2 accounts → 3 progress follows you → 4 AI judge public → 5 real execution → 6 keep it alive. Each phase ships. When someone asks about it in an interview, tell them about Phase 5's threat model, and the restore test.

