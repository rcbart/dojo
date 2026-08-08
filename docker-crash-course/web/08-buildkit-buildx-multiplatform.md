# 8 — Advanced builds: BuildKit, buildx & multi-platform

*The modern build engine and how to produce images that run on any CPU. Concepts + labs. ~30 min.
Requires Docker (BuildKit ships enabled in current versions).*

---

`docker build` looks simple, but underneath, modern Docker uses a much more capable engine —
**BuildKit** — driven by a client called **buildx**. Understanding it is what lets you build
**multi-architecture** images (Intel *and* Apple Silicon/ARM servers), pass **secrets** safely at
build time, and cache dependencies far more aggressively. This is the advanced-build knowledge that
separates senior practitioners.

## BuildKit — the engine under `docker build`

**BuildKit** is Docker's build backend (default in current Docker). Versus the old builder it gives
you:

- **Parallelism** — independent build stages run at the same time (multi-stage builds get faster).
- **Better caching** — including external cache and fine-grained `RUN` cache mounts.
- **Build secrets & SSH** — use credentials during a build *without baking them into the image*.
- **Multi-platform output** — one build, images for several CPU architectures.

You're already using it. **buildx** is the CLI front-end that exposes BuildKit's full power:
`docker buildx build ...` (and plain `docker build` routes through it too).

## Why multi-platform matters

CPUs come in architectures — **`amd64`** (Intel/AMD, most cloud servers and older laptops) and
**`arm64`** (Apple Silicon Macs, AWS Graviton, Raspberry Pi, and increasingly cloud). An image built
for one **won't run** on the other. If you build on an Apple Silicon Mac and deploy to an amd64
server, your image can fail with `exec format error`.

A **multi-platform image** bundles builds for several architectures under one tag; the runtime
automatically pulls the right one. Publish once, run anywhere.

## Builders and the `docker-container` driver

The default builder can't produce multi-platform images — you need a builder using the
`docker-container` driver (which runs BuildKit in a helper container with emulation):

```bash
docker buildx create --name multi --driver docker-container --use   # create & select it
docker buildx inspect --bootstrap                                    # start it; lists supported platforms
docker buildx ls                                                     # your builders
```

## Building multi-platform images

```bash
# build for BOTH architectures from one Dockerfile and push the multi-arch image
docker buildx build --platform linux/amd64,linux/arm64 \
  -t YOURNAME/app:1.0 --push .
```

Key point: multi-platform results usually go straight to a **registry** (`--push`) because a single
local Docker image store holds one architecture at a time. Emulation (QEMU) lets one machine build
for the "other" arch.

Inspect the result — one tag, multiple architectures:

```bash
docker buildx imagetools inspect YOURNAME/app:1.0
# shows manifests for linux/amd64 and linux/arm64 under one tag
```

## Build secrets — credentials without baking them in

Module 7 warned: never put secrets in a Dockerfile or `ENV` (they persist in layers). But sometimes
a build *needs* a secret (a private package token). BuildKit's `--secret` mounts it **only for one
`RUN`**, leaving nothing in the image:

```dockerfile
# syntax=docker/dockerfile:1
FROM alpine
RUN --mount=type=secret,id=npmtoken \
    TOKEN=$(cat /run/secrets/npmtoken) && echo "using $TOKEN to fetch deps"
```

```bash
docker buildx build --secret id=npmtoken,src=./token.txt -t app .
# the token is available during that RUN, but never stored in any layer
```

Verify it's not in the image with `docker history` — it isn't. This is the *correct* way to use a
credential at build time.

## Cache mounts — stop re-downloading dependencies

A `RUN --mount=type=cache` persists a directory **across builds** (e.g. the package manager cache),
so dependencies aren't re-fetched every time even when the layer rebuilds:

```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
```

The npm download cache survives between builds — big speedups in CI.

## `docker buildx bake` — declarative builds

For multiple images/targets, `bake` builds them from a config file (like Compose, but for builds):

```hcl
# docker-bake.hcl
group "default" { targets = ["api", "web"] }
target "api" { context = "./api"; tags = ["YOURNAME/api:1.0"]; platforms = ["linux/amd64","linux/arm64"] }
target "web" { context = "./web"; tags = ["YOURNAME/web:1.0"] }
```

```bash
docker buildx bake            # builds all targets, parallel, per their config
```

Great for CI where you build a whole app's images reproducibly with one command.

## Lab: build a multi-platform image locally

```bash
# 1. a builder that can do multi-platform
docker buildx create --name multi --driver docker-container --use
docker buildx inspect --bootstrap | grep -i platforms      # note linux/amd64, linux/arm64, ...

# 2. a trivial image; build for two arches. Without --push, use --output to inspect:
printf 'FROM alpine\nCMD ["uname","-m"]\n' > Dockerfile
docker buildx build --platform linux/amd64,linux/arm64 -t demo:multi .   # builds both (needs --push to store as multi-arch)

# 3. build+load a SINGLE arch locally and run it
docker buildx build --platform linux/arm64 -t demo:arm --load .
docker run --rm demo:arm            # prints aarch64 (arm64) even on an amd64 host, via emulation

# 4. clean up
docker buildx rm multi
```

*(Full multi-arch publishing needs a registry — swap in `--push -t YOURNAME/demo:multi` with your
Docker Hub name to try the real thing, then `docker buildx imagetools inspect` it.)*

### Experiment: prove a build secret doesn't leak

```bash
echo "supersecret" > token.txt
printf '# syntax=docker/dockerfile:1\nFROM alpine\nRUN --mount=type=secret,id=t cat /run/secrets/t > /dev/null && echo used it\n' > Dockerfile
docker buildx build --secret id=t,src=./token.txt -t sec:demo --load .
docker history --no-trunc sec:demo | grep -i supersecret || echo "secret NOT in image ✓"
rm token.txt
```

## Check yourself

1. What is BuildKit? *(Docker's modern build engine — parallel stages, better caching, build
   secrets, and multi-platform output; the default builder.)*
2. Why build multi-platform images? *(amd64 and arm64 are incompatible; a multi-arch image runs on
   both, so you publish once and run anywhere.)*
3. Why do multi-platform builds usually go straight to a registry with `--push`? *(The local image
   store holds one architecture at a time; the registry stores the multi-arch manifest.)*
4. How do you use a credential at build time without leaking it? *(`RUN --mount=type=secret` with
   `--secret` — available for that RUN only, never stored in a layer.)*
5. What does a `RUN --mount=type=cache` do? *(Persists a directory (e.g. the package cache) across
   builds so dependencies aren't re-downloaded each time.)*

---

**Next:** [9 — Registries & distribution →](./08-registries-distribution.md)
