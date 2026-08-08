# 3 — Building images with Dockerfiles

*The core practitioner skill: packaging your own app. Concepts + a build-it-yourself lab. ~30 min.
Requires Docker.*

---

A **Dockerfile** is a text recipe listing the steps to build an image. `docker build` runs those
steps top to bottom, each producing a layer, and hands you a finished image. This is how you turn
*your* code into a container.

## The essential instructions

| Instruction | What it does |
|-------------|--------------|
| `FROM` | The base image to start from (always first) |
| `WORKDIR` | Set the working directory for later steps |
| `COPY` | Copy files from your machine into the image |
| `RUN` | Execute a command at **build time** (install deps, compile) — creates a layer |
| `ENV` | Set an environment variable (persists into the running container) |
| `EXPOSE` | Document which port the app listens on (informational) |
| `CMD` | The **default command** to run when a container starts |
| `ENTRYPOINT` | The fixed executable; `CMD` becomes its default arguments |

## A first Dockerfile, explained

Say you have a tiny Node app (`app.js` + `package.json`). The Dockerfile:

```dockerfile
FROM node:20-slim              # start from a small Node base image
WORKDIR /app                   # work inside /app in the image
COPY package*.json ./          # copy ONLY dependency manifests first (see caching below)
RUN npm install                # install dependencies at build time -> a layer
COPY . .                       # now copy the rest of the source
EXPOSE 3000                    # document the port
CMD ["node", "app.js"]         # what runs when the container starts
```

Build and run it:

```bash
docker build -t myapp:1.0 .    # -t names/tags the image; "." is the build context (this folder)
docker run --rm -p 3000:3000 myapp:1.0
```

## The single most important idea: build cache & layer order

Docker caches each layer. On rebuild, it reuses a cached layer **if that step's inputs haven't
changed** — and once one layer misses the cache, every layer after it rebuilds too. So **order your
Dockerfile from least-changing to most-changing.**

That's why the example copies `package*.json` and runs `npm install` **before** copying the rest of
the source:

- Your **dependencies** change rarely → that expensive `npm install` layer stays cached across most
  rebuilds.
- Your **source code** changes constantly → put `COPY . .` late, so editing code only invalidates
  the cheap final layers.

Get this backwards (copy everything, then install) and *every* code edit re-runs `npm install` —
slow. This ordering trick is the #1 Dockerfile skill.

## CMD vs ENTRYPOINT (the classic confusion)

- **`CMD`** sets the default command, and it's easy to **override** at run time:
  `docker run myapp echo hi` runs `echo hi` instead.
- **`ENTRYPOINT`** sets a fixed executable that always runs; anything you pass at run time becomes
  its **arguments**. Common pattern: `ENTRYPOINT ["python", "app.py"]` with `CMD ["--help"]` as
  default args.

Use `CMD` alone for simple apps; use `ENTRYPOINT` when the image is really "a command" that takes
arguments.

## `.dockerignore` — keep junk out of the build

The build context ("`.`") gets sent to the daemon. Exclude things you don't want copied (and that
would bust the cache or bloat the image) with a `.dockerignore` file:

```
node_modules
.git
*.log
.env
Dockerfile
```

Always add one — it speeds builds and avoids leaking secrets like `.env` into images.

## Lab: build your own image

Create a folder with these two files:

**`app.py`**
```python
import http.server, socketserver
PORT = 8000
class H(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers()
        self.wfile.write(b"Hello from my own Docker image!\n")
with socketserver.TCPServer(("", PORT), H) as httpd:
    print(f"serving on {PORT}"); httpd.serve_forever()
```

**`Dockerfile`**
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY app.py .
EXPOSE 8000
CMD ["python", "app.py"]
```

Build, run, test:

```bash
docker build -t hello-py:1.0 .
docker run --rm -p 8000:8000 hello-py:1.0
# in another terminal:
curl localhost:8000        # → Hello from my own Docker image!
```

### Experiments

1. **Watch the cache.** Rebuild without changes (`docker build -t hello-py:1.0 .`) — every step says
   `CACHED`, instant. Now edit `app.py`'s message and rebuild — only the layers from `COPY app.py`
   onward rebuild.
2. **Override CMD.** `docker run --rm hello-py:1.0 python --version` — runs a different command
   because `CMD` is easily overridden.
3. **Add a `.dockerignore`** with `__pycache__` and rebuild — cleaner context.

## Your turn (challenge)

Write a `Dockerfile` for a tiny Python web app of your own that serves the text `my dockerfile
works` on port 8000, build it as `mine:1.0`, and prove it. Order your instructions so a code edit
does **not** re-run dependency install (even though this app has none — practice the habit).

**Verify you succeeded:**
```bash
docker rm -f m 2>/dev/null; docker run -d --name m -p 8000:8000 mine:1.0 >/dev/null && sleep 1 && \
curl -s localhost:8000 | grep -q "my dockerfile works" && echo "PASS ✓" || echo "try again"
docker rm -f m >/dev/null
```
*(Adapt the lab's `app.py`/`Dockerfile`; change the response text. Rebuild twice and confirm the
second build is fully `CACHED`.)*

## Check yourself

1. What does each instruction in a Dockerfile roughly produce? *(A layer; `docker build` runs them
   top to bottom.)*
2. Why copy `package.json` and install deps *before* copying source? *(So the cached dependency
   layer is reused unless deps change; source edits don't trigger a reinstall.)*
3. `CMD` vs `ENTRYPOINT`? *(`CMD` is an easily-overridden default command; `ENTRYPOINT` is a fixed
   executable that takes run-time args as its arguments.)*
4. What is `.dockerignore` for? *(Excluding files from the build context — faster builds, no leaked
   secrets/junk.)*
5. What does `-t` do in `docker build -t name:tag .`? *(Names and tags the resulting image; `.` is
   the build context.)*

---

**Next:** [4 — Data: volumes & bind mounts →](./04-data-volumes.md)
