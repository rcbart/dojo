# 6 — Multi-container apps with Docker Compose

*Real apps are several containers. Compose runs them together from one file. Concepts + a full lab.
~30 min. Requires Docker.*

---

Typing long `docker run` commands for a web app + database + cache gets old fast, and you have to
remember the order, networks, and flags. **Docker Compose** lets you describe the whole stack in one
YAML file and bring it up with a single command.

## The idea

A `compose.yaml` file lists your **services** (containers), plus their images, ports, environment,
volumes, and dependencies. Then:

```bash
docker compose up -d      # start the whole stack
docker compose down       # stop and remove it
```

Compose automatically creates a **private network** for the stack (so services reach each other by
name) and manages volumes — the manual steps from Modules 4–5, done for you.

## A complete example

A web API plus a Postgres database plus a Redis cache:

```yaml
services:
  api:
    build: .                     # build the image from a Dockerfile here
    ports:
      - "3000:3000"              # publish to your machine
    environment:
      DATABASE_URL: postgres://postgres:secret@db:5432/app   # "db" = the service name!
      REDIS_URL: redis://cache:6379
    depends_on:
      - db
      - cache

  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data     # named volume for persistence

  cache:
    image: redis:7

volumes:
  pgdata:                         # declare the named volume
```

Read it top-down:

- **`services`** — each becomes a container. The **service name** (`api`, `db`, `cache`) is also its
  **hostname** on the auto-created network — that's why `api` reaches the database at `db:5432`.
- **`build: .`** vs **`image:`** — build from a local Dockerfile, or pull a prebuilt image.
- **`depends_on`** — start order (db and cache before api). *Note: it waits for start, not for
  "ready" — for true readiness you add healthchecks, Module 10.*
- **`volumes:`** (top level) — declares named volumes the services mount.

## The everyday Compose commands

```bash
docker compose up -d           # start in background
docker compose ps              # what's running in this stack
docker compose logs -f api     # follow one service's logs
docker compose exec api sh     # shell into a service
docker compose build           # rebuild images
docker compose restart api     # restart one service
docker compose down            # stop + remove containers and network
docker compose down -v         # ...and delete named volumes too (data gone!)
```

Compose is **project-scoped** to the folder — everything is namespaced so multiple stacks don't
collide.

## Lab: run a real two-service app

Create a folder with these files.

**`compose.yaml`**
```yaml
services:
  web:
    image: nginx
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html:ro
    depends_on:
      - redis
  redis:
    image: redis:7
```

**`html/index.html`**
```html
<h1>Served by Compose</h1>
```

Bring it up and test:

```bash
docker compose up -d
docker compose ps                       # web + redis running
curl localhost:8080                     # → Served by Compose

# web can reach redis by service name over the auto-created network:
docker compose exec web getent hosts redis    # resolves to redis's IP

docker compose logs redis               # see redis output
docker compose down                     # tear it all down cleanly
```

You just ran a multi-container app with networking and a bind mount — in two commands.

### Experiments

1. **Scale a service.** `docker compose up -d --scale redis=3` — three redis containers; Compose
   load-names them. (Stateless services scale trivially; stateful ones need care.)
2. **Change and reload.** Edit `html/index.html`, `curl` again — instant (bind mount). Change the
   published port to `8090:80`, `docker compose up -d` — Compose reconciles just that.
3. **Persist data.** Add a `db` service with a `pgdata` volume (from the example above), `up`, write
   a row, `down` (without `-v`), `up` again — data survives; `down -v` — data gone.

## Why Compose matters for Kubernetes

A Compose file is a **declarative** description of a whole app: "here are my services, their config,
and how they connect — make it so." That's the exact mindset Kubernetes uses, just at cluster scale
with more power. Many teams prototype with Compose, then translate to Kubernetes manifests. Learning
Compose is a gentle on-ramp to the declarative thinking the next course is built on.

## Your turn (challenge)

Write a `compose.yaml` with two services — `web` (nginx on host port 8087) and `cache` (redis) —
where `web` can resolve `cache` by name. Bring it up, prove both, tear it down.

**Verify you succeeded:**
```bash
docker compose up -d >/dev/null 2>&1; sleep 3
W=$(curl -s -o /dev/null -w "%{http_code}" localhost:8087)
D=$(docker compose exec -T web getent hosts cache >/dev/null 2>&1 && echo ok)
[ "$W" = 200 ] && [ "$D" = ok ] && echo "PASS ✓" || echo "try again (web=$W dns=$D)"
docker compose down >/dev/null 2>&1
```

## Check yourself

1. What does `docker compose up` do that saves you effort? *(Starts all services, and auto-creates
   their network and volumes — no long `docker run` commands.)*
2. How does the `api` service reach the database? *(By the service name `db` as a hostname on the
   auto-created network.)*
3. What does `depends_on` guarantee — and not guarantee? *(Start order; not that the dependency is
   actually *ready* — use healthchecks for that.)*
4. What's the danger of `docker compose down -v`? *(The `-v` deletes named volumes — you lose the
   data.)*
5. Why is Compose good preparation for Kubernetes? *(It's declarative — you describe the desired
   stack and Compose makes it so, the same mindset Kubernetes uses.)*

---

**Next:** [7 — Image optimization & security →](./07-image-optimization-security.md)
