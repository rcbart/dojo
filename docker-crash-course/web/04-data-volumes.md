# 4: Data: volumes & bind mounts

*Containers are throwaway, so where does data live? Concepts + a lab. ~25 min. Requires Docker.*

---

You learned in Module 2 that a container's changes vanish when it's removed. That's fine for the
app itself (rebuild the image), but disastrous for a **database** or **uploaded files**. The fix is
to store data *outside* the container, in **volumes** or **bind mounts**.

## The three ways storage works

| Kind | Where data lives | Use it for |
|------|-----------------|-----------|
| **Container writable layer** | Inside the container (gone on `rm`) | Temporary scratch only |
| **Named volume** | Managed by Docker, on the host | Databases, persistent app data |
| **Bind mount** | A specific folder on your host | Live-editing source in dev; config files |

## Named volumes: the default for persistence

A **volume** is storage Docker manages for you, living on the host but referenced by name. It
survives container removal, can be shared between containers, and is the **recommended** way to
persist data.

```bash
docker volume create appdata
docker run -d --name db -v appdata:/var/lib/postgresql/data postgres:16
```

`-v appdata:/var/lib/postgresql/data` mounts the `appdata` volume at Postgres's data directory.
Now the database files live in the volume, not the container. Remove and recreate the container and
the data is still there:

```bash
docker rm -f db
docker run -d --name db -v appdata:/var/lib/postgresql/data postgres:16   # same data!
```

Manage volumes:

```bash
docker volume ls
docker volume inspect appdata
docker volume rm appdata          # only when no container uses it
```

## Bind mounts: map a host folder in

A **bind mount** maps an exact folder on *your machine* into the container. Changes flow both ways
in real time, perfect for **development**, where you want the container to see your code as you
edit it.

```bash
# serve the current folder's files with nginx, live
docker run -d --name dev -p 8080:80 -v "$(pwd)":/usr/share/nginx/html:ro nginx
```

- `"$(pwd)"`: the current host directory (use the full path on Windows).
- `:ro`: read-only inside the container (drop it for read-write).

Edit a file in that folder and refresh the browser: the change is instant, no rebuild. That's the
dev superpower of bind mounts.

## Volume vs bind mount: which when?

- **Named volume** → **production data** you want Docker to manage and persist (databases, uploads).
  Portable, backed up as a unit, not tied to a host path.
- **Bind mount** → **development** (live code) and injecting **specific host files** (a config file,
  certificates). Tied to an exact host path.

Rule of thumb: *volumes for data the app owns; bind mounts for files you own and want to hand in.*

## Lab: prove persistence

```bash
# 1. create a volume and write to it from a container
docker run --rm -v mydata:/data alpine sh -c "echo 'persisted!' > /data/note.txt"

# 2. a DIFFERENT container reads the same volume
docker run --rm -v mydata:/data alpine cat /data/note.txt
# → persisted!      (data outlived the first container)

# 3. bind-mount demo: create a file on the host, see it inside
mkdir -p site && echo "<h1>Live edit</h1>" > site/index.html
docker run -d --name live -p 8080:80 -v "$(pwd)/site":/usr/share/nginx/html:ro nginx
curl localhost:8080          # → Live edit
echo "<h1>Changed!</h1>" > site/index.html
curl localhost:8080          # → Changed!   (no rebuild, no restart)

docker rm -f live
docker volume rm mydata
```

### Experiment: a real database that survives

```bash
docker run -d --name pg -e POSTGRES_PASSWORD=secret -v pgdata:/var/lib/postgresql/data postgres:16
docker exec -it pg psql -U postgres -c "CREATE TABLE t(x int); INSERT INTO t VALUES(42);"
docker rm -f pg                                   # destroy the container
docker run -d --name pg -e POSTGRES_PASSWORD=secret -v pgdata:/var/lib/postgresql/data postgres:16
docker exec -it pg psql -U postgres -c "SELECT * FROM t;"   # → 42: data survived!
docker rm -f pg && docker volume rm pgdata
```

## Your turn (challenge)

Create a named volume `notes`, write a line into it from one container, then read that same line
from a **different** container, proving the data is independent of any single container.

**Verify you succeeded:**
```bash
docker volume create notes >/dev/null
docker run --rm -v notes:/d alpine sh -c 'echo "it persists" > /d/n.txt'
docker run --rm -v notes:/d alpine cat /d/n.txt | grep -q "it persists" && echo "PASS ✓" || echo "try again"
docker volume rm notes >/dev/null
```

## Check yourself

1. Why can't important data live in the container itself? *(The writable layer is deleted when the
   container is removed; containers are ephemeral.)*
2. Named volume vs bind mount: the core difference? *(A volume is Docker-managed storage referenced
   by name; a bind mount maps a specific host folder.)*
3. Which do you use for a production database? *(A named volume.)*
4. Which is ideal for live-editing code in development? *(A bind mount.)*
5. What does `:ro` do on a mount? *(Makes it read-only inside the container.)*

---

**Next:** [5: Networking →](./05-networking.md)
