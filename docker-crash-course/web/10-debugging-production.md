# 10 — Debugging & production practices

*Running containers well, and fixing them when they break. Concepts + a lab. ~25 min. Requires
Docker.*

---

Getting a container to run is easy; running it *reliably* and diagnosing it when it fails is the
practitioner skill. This module covers the production habits and the debugging toolkit.

## Healthchecks — is the app actually working?

A container can be "running" while the app inside is broken (deadlocked, not listening). A
**healthcheck** teaches Docker to test the app itself:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

`docker ps` then shows `healthy`/`unhealthy`, and orchestrators use it to restart or route around
bad containers. This is the direct ancestor of Kubernetes **liveness/readiness probes**.

## Restart policies — survive crashes and reboots

```bash
docker run -d --restart unless-stopped --name api myapi
```

| Policy | Behavior |
|--------|----------|
| `no` | Never restart (default) |
| `on-failure[:N]` | Restart if it exits non-zero, up to N times |
| `always` | Always restart (even after daemon reboot) |
| `unless-stopped` | Like `always`, but not if you manually stopped it |

For long-running services use `unless-stopped` or `always`.

## Resource limits — don't let one container eat the host

```bash
docker run -d --memory 512m --cpus 1.5 --name api myapi
```

- `--memory 512m` — hard cap; the container is killed (OOM) if it exceeds it.
- `--cpus 1.5` — at most 1.5 CPU cores' worth.

Without limits, a runaway container can starve everything else. Setting requests/limits is mandatory
in production — and, again, a core Kubernetes concept (Module: resources).

## Logging — where output goes

Containers should log to **stdout/stderr** (not files inside the container). Docker captures that,
and you read it with `docker logs`. In production, a logging **driver** ships those logs to a central
system. The rule: **apps log to stdout; the platform handles the rest.** Twelve-factor apps do this;
Kubernetes assumes it.

## The debugging toolkit

When a container misbehaves, in order:

```bash
docker ps -a                     # is it running? exited? what code? (Exited (1) = crashed)
docker logs <c>                  # what did it say? (usually the answer)
docker inspect <c>               # config, mounts, env, network, last state/exit code
docker exec -it <c> sh           # get inside a RUNNING container and poke around
docker stats <c>                 # is it starved for CPU/memory?
docker events                    # stream of daemon events (starts, dies, OOMs)
```

### When the container won't even start

If it exits immediately, you can't `exec` in. Options:

- `docker logs <c>` — the crash reason is almost always here.
- Override the entrypoint to get a shell instead of the app:
  ```bash
  docker run -it --entrypoint sh myimage       # explore the image's filesystem
  ```
- Check the exit code in `docker ps -a` (137 = OOM-killed / SIGKILL; 1 = app error).

## Common gotchas

- **"It exited immediately."** A container lives only as long as its main process. If `CMD` runs and
  returns (e.g. a script that finishes), the container stops. Long-running services must stay in the
  foreground.
- **Editing files then losing them.** Changes in the writable layer vanish on `rm` — use volumes.
- **`localhost` inside a container is the container**, not your host or another container. Use the
  service/container name on a shared network, or `host.docker.internal` to reach the host from a
  container (Desktop).
- **Port already allocated.** Another process/container owns the host port — change the host side of
  `-p`.
- **Image changes not taking effect.** You rebuilt but ran the old tag, or the cache served a stale
  layer — rebuild with the right tag (`--no-cache` to force).

## Lab: diagnose a broken container

```bash
# 1. a container that crashes on start
docker run --name boom alpine sh -c "echo starting; exit 1"
docker ps -a | grep boom          # Exited (1) — it crashed
docker logs boom                  # → starting   (the clue)

# 2. a healthcheck in action
docker run -d --name web -p 8080:80 \
  --health-cmd="curl -f http://localhost:80 || exit 1" --health-interval=5s nginx
sleep 8; docker ps                # STATUS shows (healthy)
docker inspect --format='{{.State.Health.Status}}' web

# 3. hit a memory limit
docker run --rm --memory 16m alpine sh -c "cat /dev/zero | head -c 100m | tail" ; echo "exit: $?"
# the container is OOM-killed (exit 137) — the limit worked

docker rm -f boom web
```

## Check yourself

1. What does a HEALTHCHECK add over "the container is running"? *(It tests the app itself, so Docker
   knows healthy vs unhealthy — the basis of K8s probes.)*
2. Which restart policy suits a long-running service? *(`unless-stopped` or `always`.)*
3. Where should containerized apps write their logs? *(stdout/stderr — the platform captures and
   ships them.)*
4. A container exits immediately. First command to run? *(`docker logs <c>` — the crash reason is
   usually there; `docker ps -a` shows the exit code.)*
5. What does exit code 137 usually mean? *(OOM-killed / SIGKILL — often a memory limit exceeded.)*

---

**Next:** [10b — Runtime security & resource limits →](./13-runtime-security-limits.md)
