# 9 — Registries & distribution

*How images get from your machine to everyone else (and to Kubernetes). Concepts + a lab. ~20 min.
Requires Docker + a free Docker Hub account for the push step.*

---

An image on your laptop helps only you. A **registry** is a shared store you push images to and
others (or servers, or Kubernetes) pull from. This is the "ship" in build–ship–run.

## What a registry is

A registry hosts named, tagged images. The big ones:

- **Docker Hub** (`docker.io`) — the default public registry; where `nginx`, `postgres`, etc. live.
- **GitHub Container Registry** (`ghcr.io`), **GitLab**, cloud registries (**ECR**, **GCR/Artifact
  Registry**, **ACR**) — often used for private/team images.
- **Self-hosted** registries for full control.

When you `docker pull nginx`, you're really pulling `docker.io/library/nginx:latest` — the registry
and tag are just defaulted.

## Image names decoded

A fully-qualified name has four parts:

```
   ghcr.io  /  acme      /  api    :  1.4.2
   registry    namespace    repo      tag
```

- **registry** — where it lives (defaults to `docker.io`).
- **namespace** — the user/org (e.g. your Docker Hub username).
- **repository** — the image name.
- **tag** — the version label (defaults to `latest`).

To push somewhere, your image must be **tagged** with that destination's name.

## The push workflow

```bash
# 1. log in to the registry
docker login                       # Docker Hub (or: docker login ghcr.io)

# 2. tag your local image with your namespace
docker tag myapp:1.0 YOURNAME/myapp:1.0

# 3. push it
docker push YOURNAME/myapp:1.0

# now anyone (or any server) can:
docker pull YOURNAME/myapp:1.0
```

`docker tag` doesn't copy the image — it adds another name pointing at the same layers. Push uploads
only layers the registry doesn't already have (layer sharing again).

## Tagging strategy (a practitioner habit)

Give each build **multiple** meaningful tags:

- A **version** tag (`1.4.2`) — immutable, what you deploy.
- A **moving** tag (`1.4`, `stable`) — points at the latest patch.
- Often the **git commit SHA** — perfectly traceable to source.

```bash
docker tag myapp:build YOURNAME/myapp:1.4.2
docker tag myapp:build YOURNAME/myapp:1.4
docker tag myapp:build YOURNAME/myapp:$(git rev-parse --short HEAD)
docker push -a YOURNAME/myapp        # push all tags of this repo
```

**Avoid deploying `latest`** — it's ambiguous and makes rollbacks and debugging painful. Deploy
specific version tags (or digests).

## Lab: push and pull your own image

*(Needs a free Docker Hub account; substitute your username for `YOURNAME`.)*

```bash
# build a trivial image
echo '<h1>My published image</h1>' > index.html
printf 'FROM nginx:alpine\nCOPY index.html /usr/share/nginx/html/\n' > Dockerfile
docker build -t YOURNAME/hello-web:1.0 .

# push it
docker login
docker push YOURNAME/hello-web:1.0

# prove it's remote: delete locally, then pull it back and run
docker rmi YOURNAME/hello-web:1.0
docker run --rm -p 8080:80 YOURNAME/hello-web:1.0   # pulled from the registry
curl localhost:8080                                  # → My published image
```

You just did the full round trip an image takes to production: build → tag → push → pull → run.

### No account? Run a local registry

```bash
docker run -d -p 5000:5000 --name registry registry:2
docker tag myapp:1.0 localhost:5000/myapp:1.0
docker push localhost:5000/myapp:1.0
docker pull localhost:5000/myapp:1.0
docker rm -f registry
```

## Why this matters for Kubernetes

Kubernetes never builds images — it **pulls them from a registry** and runs them. Every Deployment
you write later references an image by `registry/namespace/repo:tag`. Private registries need
Kubernetes **imagePullSecrets**. The tagging discipline you learn here directly determines how clean
your Kubernetes rollouts and rollbacks are.

## Check yourself

1. What is a registry? *(A shared store for images that you push to and others/servers/Kubernetes
   pull from.)*
2. Decode `ghcr.io/acme/api:1.4.2`. *(registry `ghcr.io`, namespace `acme`, repo `api`, tag
   `1.4.2`.)*
3. Does `docker tag` copy the image? *(No — it adds another name pointing at the same layers.)*
4. Why avoid deploying `latest`? *(It's ambiguous and makes rollbacks/debugging hard; deploy specific
   version tags.)*
5. Does Kubernetes build images? *(No — it pulls prebuilt images from a registry and runs them.)*

---

**Next:** [10 — Debugging & production practices →](./10-debugging-production.md)
