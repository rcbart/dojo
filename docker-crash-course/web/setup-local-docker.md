# Setup — install Docker & run your first container

*Do this once. In ~10 minutes you'll have Docker installed and a real container running. Every step
spelled out for macOS, Windows, and Linux. No prior experience assumed.*

> **This course is hands-on, on your own machine.** The site you're reading gives you the lessons
> and quizzes, but the real work happens in your own terminal — installing tools, running
> containers, and breaking things you can then fix. This setup page gets your machine ready; do it
> before the first lab.

---

## Step 1 — Install Docker

**macOS**
: Download **Docker Desktop** from <https://www.docker.com/products/docker-desktop/>, open the
`.dmg`, drag Docker to Applications, and launch it. Wait for the whale icon in the menu bar to go
steady (engine running). Apple Silicon and Intel both supported.

**Windows**
: Download **Docker Desktop** and run the installer. Allow it to enable **WSL 2** (Windows
Subsystem for Linux) if prompted — accept and reboot if asked. Launch Docker Desktop; wait for
"Engine running." Run course commands in **PowerShell** or **Windows Terminal**.

**Linux**
: Install **Docker Engine** for your distro (<https://docs.docker.com/engine/install/>). Quick path
on Debian/Ubuntu:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER      # run docker without sudo — log out/in afterward
```

> **Version note.** Docker Engine v29 is current as of this writing (it makes the containerd image
> store the default). Everything in this course is stable across recent versions; commands are
> unchanged. Check `docker --version`.

## Step 2 — Verify it works

```bash
docker --version                 # prints the version
docker run --rm hello-world      # pulls a tiny image and runs it
```

If you see "Hello from Docker!", the whole pipeline works: Docker pulled an **image** from a
registry, created a **container** from it, ran it, and (thanks to `--rm`) cleaned it up.

## Step 3 — Run something real

Let's run a web server and actually visit it:

```bash
docker run -d --name web -p 8080:80 nginx
```

Breaking that down (you'll learn each flag in the modules):

- `-d` — **detached**: run in the background.
- `--name web` — give the container a friendly name.
- `-p 8080:80` — **publish** the container's port 80 to your machine's port 8080.
- `nginx` — the image to run (pulled automatically if not present).

Open <http://localhost:8080> in your browser — you'll see the nginx welcome page, served from
inside a container. Check it's running and read its logs:

```bash
docker ps                        # your running container, its ports
docker logs web                  # the server's output
```

## Step 4 — Look inside the running container

```bash
docker exec -it web bash         # open a shell INSIDE the container
# now you're "inside" — try:  ls /usr/share/nginx/html   then:  exit
```

`exec` runs a command in an existing container; `-it` makes it interactive. This is how you poke
around a running container to debug it.

## Step 5 — Stop and clean up

```bash
docker stop web                  # stop the container
docker rm web                    # remove it
docker ps -a                     # -a shows stopped containers too (should be gone now)
```

That's the core loop: `run` to start, `ps`/`logs`/`exec` to inspect, `stop`/`rm` to clean up.
Everything else builds on it.

---

## Troubleshooting

**"Cannot connect to the Docker daemon" / "docker: command not found"**
: Docker Desktop isn't running (or Engine isn't installed). Start it, wait for the running
indicator, retry. On Linux: `sudo systemctl start docker`.

**`docker run` needs sudo on Linux**
: Add yourself to the `docker` group (Step 1) and log out/in, or prefix commands with `sudo`.

**Port 8080 already in use**
: Something else uses it. Pick another host port: `-p 9090:80`, then visit `localhost:9090`.

**Windows: `docker` behaves oddly**
: Ensure Docker Desktop is running with the WSL 2 backend. Run commands in PowerShell or a WSL
terminal.

## Check yourself

1. What single application do you install to use Docker locally? *(Docker Desktop, or Docker Engine
   on Linux.)*
2. What did `docker run hello-world` actually do? *(Pulled an image from a registry, created a
   container from it, and ran it.)*
3. What does `-p 8080:80` mean? *(Publish the container's port 80 to your machine's port 8080.)*
4. How do you get a shell inside a running container? *(`docker exec -it <name> bash`.)*
5. What two commands stop and remove a container? *(`docker stop <name>` then `docker rm <name>`.)*

---

**Next:** [Primer — What are containers? →](./primer-what-are-containers.md)
