# JavaDojo Online: Architecture & Build Order

The goal: turn the single-file dojo into a published product with a real Java backend, and use the build itself as the capstone project. Every phase below names the dojo streams it cashes in.

## Architecture

```
                    ┌─────────────────────────────────────────────┐
                    │                  Internet                   │
                    └──────────────────────┬──────────────────────┘
                                           │ HTTPS (Caddy/nginx: TLS, static files)
              ┌────────────────────────────┼────────────────────────────┐
              │                            │                            │
     dojo frontend (static)      Spring Boot API (Java 21)     runner service (isolated)
     the existing HTML app       ├── auth (JWT, Spring Sec)    ├── receives {code, tests}
     - localStorage = cache      ├── progress API (Postgres)   ├── docker run --rm
     - fetch() to the API        ├── AI judge proxy (Claude)   │   --network none
                                 ├── rate limits (Bucket4j)    │   --memory 256m --cpus 0.5
                                 ├── caching (Caffeine)        │   timeout 10s
                                 └── Actuator + JSON logs      └── returns compile/test output
                                           │
                                 Postgres (users, progress, submissions)  +  Redis (sessions, rate buckets)
```

**Key decisions**

- **Two services, not one.** The API never executes user code in its own JVM. The runner is a separate container with no network, tight memory/CPU caps, and a hard timeout, arbitrary-code execution is the whole threat model. This is the most interesting engineering problem in the project; don't shortcut it into the API process.
- **The AI judge moves server-side.** The dojo currently calls `window.cowork.askClaude`, which only exists inside Cowork. Replace it with `POST /api/judge` → your backend calls the Claude API with your key. Server-side means you control the prompt, cache repeated judgments, and rate-limit so strangers can't drain your budget.
- **localStorage stays, as a cache.** The frontend keeps working offline/logged-out exactly as today; when logged in, progress syncs to the server and merges (server wins on conflict, latest `completedAt` wins per exercise).
- **Never trust the client.** "Exercise done" is only recorded server-side after the judge/runner verdict. The regex structural checks stay client-side as instant feedback; the authoritative pass is the server's.

**Data model (Flyway migrations from day one)**

- `users`: id, email, password_hash (BCrypt), created_at
- `progress`: user_id, exercise_key, done, completed_at, last_code (the dojo's exSid becomes exercise_key)
- `submissions`: id, user_id, exercise_key, code, verdict, runner_output, created_at (history + audit + abuse forensics)
- `api_usage`, user_id, day, judge_calls (enforce a daily cap per user)

## Build order

**Phase 0: Front door (an afternoon).** Fork the HTML, stub `askClaude` behind a feature flag (falls back to "structural checks only" messaging), deploy to GitHub Pages/Netlify. The site is live and shareable from day one; everything after this upgrades it in place.

**Phase 1: Skeleton that deploys (weekend).** Spring Boot 3 + Java 21, Postgres, Flyway, Docker Compose for local dev, `/actuator/health`, GitHub Actions building the image on every push. Deploy the empty API to a small VPS (Hetzner/Fly.io) behind Caddy for TLS. *Streams applied: Build Tools, Git, Deploying, Databases.* Deploying an empty skeleton first means every later phase ships the day it works.

**Phase 2: Accounts (week).** Registration/login, BCrypt, JWT access tokens, Spring Security filter chain, CORS locked to your domain. *Streams: Spring Boot, Security & Crypto, Web.*

**Phase 3: Progress sync (week).** `GET/PUT /api/progress`, merge logic, frontend integration (login UI in the dojo header, background sync). First visible payoff: belt progress follows you across devices. *Streams: REST APIs, Databases, equals/hashCode in anger for merge keys.*

**Phase 4: AI judge proxy (week).** `POST /api/judge {exerciseKey, code}` → Claude API with the lesson's `behavior` spec as the rubric → structured verdict. Bucket4j per-user rate limit backed by Redis, Caffeine cache keyed on (exerciseKey, code-hash) so identical resubmissions are free, `api_usage` daily cap. This restores the dojo's smartest feature, publicly. *Streams: APIs & REST (consuming), Caching, Exceptions.*

**Phase 5, Real execution (the crown jewel, 2-4 weeks).** The runner service: accepts code + a JUnit test harness generated per exercise, spins `docker run --rm --network none --memory 256m --cpus 0.5` with a 10s kill, streams back compiler errors and test results. Queue between API and runner (start with a simple DB-backed queue; upgrade to Kafka later and cash in the messaging lesson properly). Pragmatic on-ramp: integrate Judge0's API first, then replace it with your own runner, you'll appreciate the problem before solving it. *Streams: Concurrency, Networking, Deploying, JVM internals, Messaging.*

**Phase 6: Production hardening (ongoing).** JSON logs with MDC request/user ids, metrics + a Grafana dashboard, nightly Postgres backups (tested restore!), slow-query check, dependency updates. *Streams: Logging, Performance Engineering.*

**Stretch goals.** Leaderboards per tournament round, spaced-repetition review of solved exercises, shareable belt certificates, WebFlux + SSE for live-streaming runner output (cashes in the reactive lesson for real).

## Reality checks

- Budget: ~$5-10/mo VPS + Claude API usage (the per-user caps make this bounded).
- The runner's security posture matters more than any feature. No network, no shared filesystem, non-root, resource-capped, short-lived. Review it as if it will be attacked, because if the site gets any traction, it will be.
- Ship each phase. Six shipped phases beat one perfect unfinished system, and "kept it alive in production" is exactly the senior-engineer evidence the dojo alone can't give you.
