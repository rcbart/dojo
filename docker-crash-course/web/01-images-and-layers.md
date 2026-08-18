# 1: Images & layers

*How images actually work: the key to building fast, small images later. Concepts + a short
inspect lab. ~20 min. Requires Docker.*

---

An image feels like a single file, but inside it's built from **layers** stacked on top of each
other. Understanding layers is what separates people who *use* Docker from people who are *good* at
it; it explains build speed, image size, and caching.

## Layers: an image is a stack

Every instruction in a build adds a **layer**: a read-only set of filesystem changes. A typical
image might be:

```
   ┌─────────────────────────────┐  ← your app code            (layer 4)
   ├─────────────────────────────┤  ← installed dependencies   (layer 3)
   ├─────────────────────────────┤  ← your runtime (e.g. Node) (layer 2)
   └─────────────────────────────┘  ← a base OS (e.g. Debian)  (layer 1, the "base image")
```

Layers stack bottom-up, each recording only *what changed* from the one below. The final image is
all layers combined, presented as one filesystem (via a "union filesystem"). When a container runs,
Docker adds a thin **writable layer** on top, so the image stays read-only and the container's
changes live separately.

## Why layers are brilliant

Two big payoffs, both of which you'll exploit later:

- **Sharing/caching between images.** If ten images all start `FROM debian`, that Debian layer is
  stored **once** and shared. Pulling a new image only downloads layers you don't already have.
- **Fast rebuilds.** Docker caches each layer. If you rebuild and a layer's inputs haven't changed,
  Docker **reuses the cached layer** instead of redoing the work. Order your build steps well and
  rebuilds take seconds (Module 3 covers this).

## Base images

Most images start `FROM` a **base image**, a starting point someone else published:

- **Full OS bases** (`ubuntu`, `debian`): familiar, lots of tools, larger.
- **Slim bases** (`debian:slim`, `python:3.12-slim`): trimmed down, smaller.
- **Alpine** (`alpine`): tiny (~5 MB) Linux; great for size, but uses `musl` libc which occasionally
  trips up some software.
- **Distroless / scratch**: minimal or *empty* bases for the smallest, most secure images
  (Module 7).

Choosing a smaller base is the easiest win for image size and security.

## Tags and digests (naming images)

An image reference looks like `repository:tag`, e.g. `nginx:1.27` or `python:3.12-slim`.

- **`repository`**: the image name (optionally with a registry/user prefix, e.g.
  `ghcr.io/acme/api`).
- **`tag`**: a human label for a version, e.g. `1.27`, `latest`. **`latest` is just a default tag,
  not "the newest" magically**: it's whatever was last pushed as `latest`. In production, **pin a
  real version tag**; never rely on `latest`.
- **`digest`**: a content hash like `@sha256:abc123…` that identifies an *exact, immutable* image.
  A tag can move; a digest never changes. For reproducible deployments, reference by digest.

## Lab: look inside images

Pull an image and inspect its layers:

```bash
docker pull python:3.12-slim
docker images                       # size of the image
docker history python:3.12-slim     # the layers and what each added
```

`docker history` shows each layer and the instruction that created it; you're seeing the stack.
Now pull something that shares layers:

```bash
docker pull python:3.12             # the non-slim variant
docker images | grep python
```

Notice pulls are faster when layers are already present (shared base layers aren't re-downloaded).
Inspect full metadata:

```bash
docker inspect python:3.12-slim | less   # config, layers, env, entrypoint (JSON)
```

### Experiment: pin by digest

```bash
docker inspect --format='{{index .RepoDigests 0}}' python:3.12-slim
# copy the name@sha256:... and run it (that exact image, immutable):
docker run --rm python@sha256:<the-digest> python --version
```

## Check yourself

1. What is a layer? *(A read-only set of filesystem changes; instructions stack into layers that
   combine into the image.)*
2. Give one benefit of layers. *(Shared/cached storage between images, or fast rebuilds via layer
   caching.)*
3. Does `latest` mean "the newest version"? *(No: it's just a default tag; pin a real version in
   production.)*
4. Tag vs digest? *(A tag is a movable human label; a digest is an immutable content hash of an
   exact image.)*
5. What happens to an image's layers when a container writes files? *(The image stays read-only;
   the container gets a thin writable layer on top.)*

---

**Next:** [2: Lab: run & manage containers →](./02-lab-run-manage-containers.md)
