# 11: Hands-on challenges & projects

*Where knowledge becomes skill. Six graded, real-world builds, with no step-by-step. Each has clear
acceptance criteria, a self-check command to verify you passed, and a solution to peek at only after
you try. ~90 min total. Requires Docker.*

---

Reading and following labs builds recognition; **building things yourself, from a spec, builds
competence**, the kind interviewers and jobs actually test. Do these in order; each pulls together
several modules. Try hard before opening a solution.

> **How to use this module.** Read the goal + acceptance criteria, build it yourself, then run the
> **Verify** command. If it prints the success line, you passed. Only then compare with the
> **Solution**.

---

## Challenge 1: Containerize a static site

**Goal:** package a one-page site into an image and serve it.

**Acceptance criteria:**

- A `Dockerfile` builds an image `mysite:1.0` based on nginx.
- Your own `index.html` (containing the text `Hello Docker`) is served on container port 80.
- Running it published to host port 8080 returns your page.

**Verify:**
```bash
docker rm -f c1 2>/dev/null; docker run -d --name c1 -p 8080:80 mysite:1.0 >/dev/null \
 && sleep 1 && curl -s localhost:8080 | grep -q "Hello Docker" \
 && echo "PASS ✓" || echo "FAIL ✗"; docker rm -f c1 >/dev/null
```

**Solution:**
```bash
echo "<h1>Hello Docker</h1>" > index.html
printf 'FROM nginx:alpine\nCOPY index.html /usr/share/nginx/html/index.html\n' > Dockerfile
docker build -t mysite:1.0 .
```

---

## Challenge 2: Shrink an app with a multi-stage build

**Goal:** produce a *small* image using a multi-stage build.

**Acceptance criteria:**

- A multi-stage `Dockerfile` (a `build` stage + a slim runtime stage).
- Final image `tiny:1.0` is **under 70 MB**.
- Running it prints `built small`.

**Verify:**
```bash
SIZE=$(docker image inspect tiny:1.0 --format '{{.Size}}' 2>/dev/null); \
OUT=$(docker run --rm tiny:1.0 2>/dev/null); \
[ -n "$SIZE" ] && [ "$SIZE" -lt 73400320 ] && echo "$OUT" | grep -q "built small" \
 && echo "PASS ✓ ($((SIZE/1024/1024)) MB)" || echo "FAIL ✗ (size=$SIZE, out=$OUT)"
```

**Solution:**
```dockerfile
# Dockerfile
FROM golang:1.22 AS build
WORKDIR /src
RUN printf 'package main\nimport "fmt"\nfunc main(){ fmt.Println("built small") }\n' > main.go \
 && CGO_ENABLED=0 go build -o /app main.go
FROM alpine:3.20
COPY --from=build /app /app
CMD ["/app"]
```
```bash
docker build -t tiny:1.0 .
```
*(A static Go binary on Alpine is only a few MB; the build tools never ship.)*

---

## Challenge 3: A multi-service stack with Compose

**Goal:** run a web app + Redis + Postgres together with Compose, with persistence and a healthcheck.

**Acceptance criteria:**

- A `compose.yaml` with three services: `web` (nginx, published on 8085), `cache` (redis), `db`
  (postgres with a password and a **named volume** for its data).
- `web` can resolve `cache` and `db` by name.
- `db` has a **healthcheck** and reports healthy.

**Verify:**
```bash
docker compose up -d >/dev/null 2>&1; sleep 6
WEB=$(curl -s -o /dev/null -w "%{http_code}" localhost:8085)
DNS=$(docker compose exec -T web getent hosts db >/dev/null 2>&1 && echo ok)
HLTH=$(docker compose ps db | grep -qi healthy && echo ok)
VOL=$(docker compose config --volumes | head -1)
[ "$WEB" = 200 ] && [ "$DNS" = ok ] && [ "$HLTH" = ok ] && [ -n "$VOL" ] \
 && echo "PASS ✓" || echo "FAIL ✗ (web=$WEB dns=$DNS health=$HLTH vol=$VOL)"
docker compose down -v >/dev/null 2>&1
```

**Solution:**
```yaml
# compose.yaml
services:
  web:
    image: nginx
    ports: ["8085:80"]
    depends_on: [db, cache]
  cache:
    image: redis:7
  db:
    image: postgres:16
    environment: { POSTGRES_PASSWORD: secret }
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 3s
      timeout: 3s
      retries: 5
volumes:
  pgdata:
```

---

## Challenge 4: Harden an image

**Goal:** take a naive image and make it non-root and clean.

**Acceptance criteria:**

- Image `hard:1.0` runs as a **non-root** user (uid ≠ 0).
- A `.dockerignore` exists excluding `.git` and `.env`.
- The base image is **pinned** to a specific tag (not bare `latest`).

**Verify:**
```bash
UID0=$(docker run --rm hard:1.0 id -u 2>/dev/null)
IGN=$(grep -qE '\.env' .dockerignore 2>/dev/null && echo ok)
PIN=$(grep -qE '^FROM .+:.+' Dockerfile && ! grep -qiE '^FROM [^:]+$|:latest' Dockerfile && echo ok)
[ -n "$UID0" ] && [ "$UID0" -ne 0 ] && [ "$IGN" = ok ] && [ "$PIN" = ok ] \
 && echo "PASS ✓ (uid=$UID0)" || echo "FAIL ✗ (uid=$UID0 ignore=$IGN pin=$PIN)"
```

**Solution:**
```dockerfile
# Dockerfile
FROM alpine:3.20
RUN adduser -D -u 1000 app
USER app
CMD ["id"]
```
```bash
printf '.git\n.env\n*.log\n' > .dockerignore
docker build -t hard:1.0 .
```

---

## Challenge 5: Data that survives

**Goal:** prove a database's data outlives its container.

**Acceptance criteria:**

- Start Postgres with a **named volume**; create a table with a known row.
- **Destroy the container** entirely, start a fresh one on the same volume.
- The row is still there.

**Verify:** *(the steps below ARE the test: the final SELECT must return 42)*
```bash
docker rm -f pg 2>/dev/null; docker volume rm c5 2>/dev/null
docker run -d --name pg -e POSTGRES_PASSWORD=x -v c5:/var/lib/postgresql/data postgres:16 >/dev/null
sleep 6; docker exec pg psql -U postgres -c "CREATE TABLE t(x int); INSERT INTO t VALUES(42);" >/dev/null
docker rm -f pg >/dev/null                                   # destroy the container
docker run -d --name pg -e POSTGRES_PASSWORD=x -v c5:/var/lib/postgresql/data postgres:16 >/dev/null
sleep 6; docker exec pg psql -U postgres -tAc "SELECT x FROM t;" | grep -q 42 \
 && echo "PASS ✓ data survived" || echo "FAIL ✗"
docker rm -f pg >/dev/null; docker volume rm c5 >/dev/null
```

**Solution:** the Verify block *is* the solution. The key idea is mounting the **same named volume**
(`-v c5:/var/lib/postgresql/data`) into the replacement container, so the data (in the volume, not
the container) persists.

---

## Challenge 6 (capstone): Build & publish a multi-arch image

**Goal:** publish a real multi-architecture image to a registry. *(Needs a free Docker Hub account;
use your username for `YOU`.)*

**Acceptance criteria:**

- Image `YOU/greet:1.0` built for **both** `linux/amd64` and `linux/arm64`, pushed to Docker Hub.
- The pushed tag exposes **two** platform manifests.
- Pulling and running it prints `hello multiarch`.

**Verify:**
```bash
docker buildx imagetools inspect YOU/greet:1.0 2>/dev/null | grep -c "Platform:" | \
  awk '{ if ($1>=2) print "PASS ✓ ("$1" platforms)"; else print "FAIL ✗ ("$1")" }'
docker run --rm YOU/greet:1.0 2>/dev/null | grep -q "hello multiarch" && echo "run PASS ✓"
```

**Solution:**
```bash
echo '<none>' >/dev/null
printf 'FROM alpine:3.20\nCMD ["echo","hello multiarch"]\n' > Dockerfile
docker buildx create --name multi --driver docker-container --use 2>/dev/null
docker login
docker buildx build --platform linux/amd64,linux/arm64 -t YOU/greet:1.0 --push .
docker buildx rm multi
```

---

## Where to go from here

If you completed all six unaided, you can containerize apps, optimize and secure images, run
multi-service stacks, persist data, and publish portable images: the working toolkit of a Docker
practitioner. For more reps: containerize a project of your own (your language, your app), then take
it into the **Kubernetes course** and run it at scale.

## Check yourself

1. Why do these challenges build skill that labs alone don't? *(You build from a spec without
   step-by-step guidance, the way real work and interviews test you.)*
2. In Challenge 2, what made the image tiny? *(A multi-stage build shipping only the final binary on
   a slim base, with no build tools.)*
3. In Challenge 3, what gave the database persistence and readiness? *(A named volume for its data
   and a healthcheck reporting healthy.)*
4. In Challenge 5, why did the data survive destroying the container? *(It lived in a named volume
   mounted into the replacement container, not in the container's writable layer.)*
5. In Challenge 6, what does a multi-arch image let you do? *(Publish one tag that runs on both amd64
   and arm64: publish once, run anywhere.)*

---

**Next:** [12: From Docker to Kubernetes →](./12-next-steps-kubernetes.md)
