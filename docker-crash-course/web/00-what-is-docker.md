# 0 — What Docker is (and why it exists)

*No lab: the mental model. ~10 min read.*

---

## Recap and sharpen

**Docker packages your app into an image and runs it as a container.** An image is the sealed
blueprint (app + libraries + runtime + settings); a container is a running instance. Containers are
light because they share the host OS kernel instead of shipping a whole OS like a VM. This module
maps out the whole Docker world so the later hands-on modules have a frame.

## The three things Docker gives you

1. **Build**: turn your app into an **image** using a recipe file (a `Dockerfile`). Reproducible:
   the same Dockerfile builds the same image anywhere.
2. **Ship**: push images to a **registry** (like Docker Hub), a shared library others can pull
   from. This is how an image built on your laptop runs unchanged on a server.
3. **Run**: start **containers** from images, locally or in production, with resource limits,
   networking, and storage you control.

Build, ship, run: the whole Docker lifecycle. Kubernetes (later) is about the "run" part at massive
scale.

## The pieces and how they fit

| Piece | What it is |
|-------|-----------|
| **Docker CLI** | The `docker` command you type: your interface to everything |
| **Docker daemon** (`dockerd`) | The background service that actually builds images and runs containers |
| **Image** | The read-only blueprint of an app + environment |
| **Container** | A running instance of an image |
| **Dockerfile** | The text recipe used to build an image |
| **Registry** | A store for images (Docker Hub, GitHub Container Registry, private registries) |
| **Volume** | Persistent storage that outlives a container |
| **Network** | Virtual networks that let containers talk to each other and the outside |

When you type `docker run nginx`, the CLI asks the daemon to: find the `nginx` image (pull it from a
registry if missing), create a container from it, and start it. You'll see every one of these pieces
in the labs.

## The client–daemon architecture (why it matters)

Docker is split in two: the **CLI** (what you type) talks to the **daemon** (the engine that does
the work) over an API. Usually both run on your machine, but the daemon could be remote. Practical
consequences:

- If the daemon isn't running, every command fails with "cannot connect to the Docker daemon":
  start Docker Desktop / the docker service.
- The daemon, not the CLI, holds your images and containers. `docker ps` asks the daemon what it's
  running.

## The OCI standard (Docker isn't the only player)

Docker popularized containers, but the **image format** and **runtime** are now open standards under
the **OCI** (Open Container Initiative). That's why images you build with Docker also run on other
runtimes (containerd, CRI-O, Podman) and on Kubernetes, which doesn't even use Docker directly
anymore, but runs the same OCI images. **Learn Docker images once, and they run everywhere in the
cloud-native world.** This is the payoff that connects this course to Kubernetes.

## Where Docker fits vs Kubernetes

- **Docker** = build and run containers, typically on **one machine**. Great for development,
  building images, and simple deployments.
- **Kubernetes** = orchestrate **thousands** of containers across **many machines**: scheduling,
  scaling, healing, networking them as a fleet. It runs the very images Docker builds.

You build with Docker; you operate at scale with Kubernetes. This course makes you fluent in the
first so the second makes sense.

## The mental checklist for any Docker task

1. **What image am I using or building?** (blueprint)
2. **What container(s) will run from it, with what ports/env/limits?** (instances)
3. **Does it need persistent data?** (volumes)
4. **Does it need to talk to other containers?** (networks)
5. **Where does the image live so others can run it?** (registry)

Every module answers one of these.

## Check yourself

1. What are the three stages of the Docker lifecycle? *(Build an image, ship it to a registry, run
   it as containers.)*
2. What's the difference between the Docker CLI and the daemon? *(The CLI is what you type; the
   daemon is the background engine that builds/runs. The CLI talks to it over an API.)*
3. Why do Docker images run on Kubernetes and other runtimes? *(They follow the open OCI standard,
   so any OCI-compatible runtime can run them.)*
4. Docker vs Kubernetes in one line each? *(Docker builds/runs containers on a machine; Kubernetes
   orchestrates many containers across many machines.)*
5. What file is the recipe for building an image? *(A Dockerfile.)*

---

**Next:** [1 — Images & layers →](./01-images-and-layers.md)
