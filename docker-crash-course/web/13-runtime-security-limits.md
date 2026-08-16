# 10b — Runtime security & resource limits

*What actually contains a container at runtime: users, capabilities, cgroups — and the flags that keep one container from eating the host. ~12 min read.*

---

Module 7 hardened the *image*. This module hardens the *running container* — because "containers
are isolated" is a default, not a guarantee, and every piece of that isolation has a flag that
loosens or tightens it. Production incidents live in those flags.

## Run as a user, not as root

The single highest-value fix. By default, the process in a container runs as **root** — and while
it's root *inside* a namespace, a container-escape bug turns namespace-root into host-root. Deny
that outcome in the image:

```dockerfile
FROM node:22-slim
RUN useradd --create-home appuser
USER appuser
```

or at run time: `docker run --user 1000:1000 …`. Verify with `docker exec <c> whoami`. If the app
needs to bind port 80, don't hand back root — publish `-p 80:8080` and listen on 8080, or grant
just the one capability (next section). **Rootless mode** goes further: the Docker *daemon* itself
runs as an unprivileged user, so even a daemon compromise doesn't yield host-root. It has
limitations (some networking and storage drivers), but for CI runners and multi-user hosts it's
worth knowing it exists.

## Capabilities: root, unbundled

Linux splits root's powers into ~40 **capabilities** — bind low ports (`NET_BIND_SERVICE`), change
file ownership (`CHOWN`), load kernel modules (`SYS_MODULE`)… Docker grants a default subset;
the tightening pattern is drop everything, add back what's proven necessary:

```bash
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE nginx
```

And the flag to treat as radioactive: **`--privileged`** turns *off* essentially all isolation —
every capability, every device, no seccomp. If a README tells you to use it, the README is asking
you to run that software as the host. There is almost always a narrower flag (`--cap-add`,
`--device`) that grants only what's needed.

Two smaller belts worth wearing: `--security-opt no-new-privileges` stops processes gaining
privileges via setuid binaries, and `--read-only` (with `--tmpfs /tmp` for scratch) makes the
container's filesystem immutable — malware that can't write is malware that mostly can't persist.

## Resource limits: cgroups, and why the default is dangerous

Namespaces control what a container can *see*; **cgroups** control what it can *use*. The default
is **unlimited** — one leaking process can consume every byte of RAM on the host, and the kernel's
OOM killer then shoots processes more or less at random, including other containers. Limits turn
"the host died" into "the bad container died":

```bash
docker run \
  --memory=512m --memory-swap=512m \   # hard RAM cap, no swap escape hatch
  --cpus=1.5 \                         # at most 1.5 cores' worth of time
  --pids-limit=256 \                   # fork bombs stop at 256 processes
  myapp
```

What happens at the limit differs, and the difference matters in debugging: hitting the **memory**
cap kills the container (exit code **137**, OOMKilled — check `docker inspect`); hitting the
**CPU** cap only *throttles* it — the app gets slow, not dead. So: mysterious 137s → raise or fix
memory; mysterious latency with healthy dependencies → check CPU throttling. `docker stats` shows
live usage per container; measure before choosing numbers, then set limits a comfortable margin
above real usage. These are the same knobs Kubernetes exposes as `resources.requests/limits`
(Kubernetes course, module 6) — learn the semantics here, reuse them there.

## Logging drivers: where stdout actually goes

Your app logs to stdout (module 10's advice) — but *where does stdout go*? A **logging driver**
decides. The default, `json-file`, appends to a file per container **without bound**: the
classic slow outage is a host whose disk filled with logs months after deploy. Fix it globally in
`/etc/docker/daemon.json`:

```json
{ "log-driver": "local", "log-opts": { "max-size": "20m", "max-file": "5" } }
```

(`local` is the compact, rotating driver; `json-file` accepts the same rotation options. Drivers
like `journald`, `syslog`, `fluentd`, `awslogs` ship logs off-host — at which point remember
module 10: logs are part of your attack surface and your data-retention story too.)

## The checklist

Every production `docker run` (or Compose service) should be able to answer:

- **Who am I?** — a non-root `USER`, ideally with `no-new-privileges`.
- **What can I do?** — `--cap-drop=ALL` plus explicit adds; never `--privileged`.
- **What can I use?** — memory, CPU, and pids limits set from measured usage.
- **What can I write?** — `--read-only` where the app allows, volumes for the rest.
- **Where do my logs go?** — a rotating or shipping driver, never unbounded files.

Five questions, one line each in Compose — and the difference between an incident that ends at one
container and one that takes the host.

---

**Next:** [11 — Hands-on challenges & projects →](./11-challenges-projects.md)
