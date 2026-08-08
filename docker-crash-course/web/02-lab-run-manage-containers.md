# 2 — Lab: run & manage containers

*Hands-on. The everyday commands you'll use constantly. ~25 min. Requires Docker.*

---

This module is pure practice. By the end, running, inspecting, and cleaning up containers is
muscle memory.

## The anatomy of `docker run`

```
docker run [options] IMAGE [command]
```

Everything is an option on this one command. The ones you'll use daily:

| Option | Meaning |
|--------|---------|
| `-d` | Detached — run in the background |
| `--name X` | Name the container (else you get a random name) |
| `-p H:C` | Publish host port H → container port C |
| `-e KEY=val` | Set an environment variable inside the container |
| `-v ...` | Mount a volume / bind mount (Module 4) |
| `--rm` | Delete the container automatically when it exits |
| `-it` | Interactive + TTY — for shells and interactive programs |
| `--restart` | Restart policy (e.g. `unless-stopped`) — Module 9 |

## Foreground vs detached

```bash
# foreground: you see output, Ctrl-C stops it
docker run --rm nginx

# detached: runs in background, prints the container ID
docker run -d --name web -p 8080:80 nginx
```

Foreground is great for short commands and seeing logs live; detached is for long-running services.

## Inspecting running containers

```bash
docker ps                     # running containers
docker ps -a                  # include stopped ones
docker logs web               # its output
docker logs -f web            # follow (stream) logs, Ctrl-C to stop following
docker inspect web            # full JSON: IP, mounts, env, state
docker stats                  # live CPU/memory/network usage, Ctrl-C to exit
docker top web                # processes running inside
```

`docker logs` and `docker inspect` are your first two debugging tools — reach for them whenever a
container misbehaves.

## Running commands inside a container

```bash
docker exec -it web bash      # a shell inside the running container
# inside: ls, cat /etc/nginx/nginx.conf, whoami ... then: exit

docker exec web nginx -v      # run a one-off command without a shell
```

`exec` runs a **new** command in an **already-running** container. (Different from `run`, which
creates a new container.)

## Lifecycle: stop, start, remove

```bash
docker stop web               # graceful stop (SIGTERM, then SIGKILL after a grace period)
docker start web              # start it again (keeps its config)
docker restart web            # stop + start
docker rm web                 # remove a stopped container
docker rm -f web              # force-remove even if running
```

## Cleaning up (reclaim disk)

Containers, images, and volumes accumulate. Clean safely:

```bash
docker ps -a                  # see what's around
docker container prune        # remove all stopped containers
docker image prune            # remove dangling (untagged) images
docker system df              # how much disk Docker is using
docker system prune           # remove unused data (asks first) — careful
```

## Guided exercise

Run through this end to end:

```bash
# 1. start a named web server in the background
docker run -d --name site -p 8080:80 nginx

# 2. confirm it's up and visit http://localhost:8080
docker ps

# 3. watch its logs while you refresh the browser a few times
docker logs -f site           # Ctrl-C to stop following

# 4. hop inside and change the homepage
docker exec -it site bash
echo "<h1>Hello from my container</h1>" > /usr/share/nginx/html/index.html
exit
# refresh the browser — your text appears

# 5. stop, restart (note: your edit persists across restart), then remove
docker stop site && docker start site     # edit still there (same container)
docker rm -f site                          # now it's gone entirely
```

### The key lesson from step 5

Your edit survived `stop`/`start` (same container's writable layer) but vanished with `rm` — because
a container's changes live in its **throwaway writable layer**, not the image. **Containers are
ephemeral.** Anything you need to keep must go in a **volume** (Module 4). This is the single most
important mental shift for using containers correctly.

## Your turn (challenge)

Without copying the guided exercise: run a **detached** Redis container named `cache`, confirm it's
healthy by running a command *inside* it, then remove it — in four commands.

**Verify you succeeded:**
```bash
docker run -d --name cache redis:7 >/dev/null && \
docker exec cache redis-cli ping | grep -q PONG && echo "PASS ✓ (got PONG)" || echo "try again"
docker rm -f cache >/dev/null
```
*(Goal: `docker run -d`, then `docker exec cache redis-cli ping` returns `PONG`, then `docker rm
-f cache`.)*

## Check yourself

1. Difference between `docker run` and `docker exec`? *(`run` creates a new container from an image;
   `exec` runs a command in an already-running container.)*
2. What does `-d` do, and when do you want it? *(Detached/background — for long-running services.)*
3. Your first two debugging commands when a container misbehaves? *(`docker logs` and `docker
   inspect`.)*
4. Why did the in-container edit survive `start` but not `rm`? *(It lived in the container's writable
   layer; removing the container deletes that layer.)*
5. What does `docker system prune` do? *(Removes unused Docker data — stopped containers, dangling
   images, etc. — to reclaim disk.)*

---

**Next:** [3 — Building images with Dockerfiles →](./03-dockerfiles.md)
