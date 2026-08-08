# Setup — run and test Envoy locally

*Do this once. In ~10 minutes you'll have Envoy running on your own machine and a request flowing
through it. No prior setup assumed — every step spelled out for macOS, Windows, and Linux.*

You don't install Envoy directly. You run it as a **Docker container**, which means you install one
tool (Docker) and everything else — Envoy itself, the practice backend — is pulled automatically.

---

## Step 1 — Install Docker

Docker runs Envoy in a small, isolated container so nothing touches your system.

**macOS**
: Download **Docker Desktop** from <https://www.docker.com/products/docker-desktop/>, open the
`.dmg`, drag Docker to Applications, and launch it. Wait for the whale icon in the menu bar to stop
animating (that means the engine is running). Apple Silicon and Intel are both supported.

**Windows**
: Download **Docker Desktop** from the same link and run the installer. If prompted, allow it to
enable **WSL 2** (the Windows Subsystem for Linux) — accept and reboot if asked. Launch Docker
Desktop and wait for it to say "Engine running." Run all commands in this course from **PowerShell**
or **Windows Terminal**.

**Linux**
: Install **Docker Engine** for your distro following <https://docs.docker.com/engine/install/>. On
Debian/Ubuntu the quick path is Docker's convenience script:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # so you can run docker without sudo — log out/in afterward
```

## Step 2 — Verify Docker works

Open a terminal and run:

```bash
docker --version
docker compose version
```

You should see version numbers for both (Compose is bundled with modern Docker). Then confirm the
engine can actually run a container:

```bash
docker run --rm hello-world
```

If you see "Hello from Docker!", you're ready. If it errors, Docker Desktop probably isn't started
yet — launch it and wait for the running indicator, then retry.

> **`curl` too.** The course tests requests with `curl`. It's preinstalled on macOS, modern
> Windows 10/11, and most Linux. Check with `curl --version`; on Linux install via
> `sudo apt install curl` (Debian/Ubuntu) if missing.

## Step 3 — Get the lab files

The course ships small lab folders (an `envoy.yaml` and a `docker-compose.yaml` each). Open a
terminal **in the course folder** — the one that contains this guide and a `labs/` directory. If
you're not sure where you are:

```bash
# macOS / Linux
cd /path/to/envoy-crash-course
ls labs        # you should see 02-static, 03-tls, 04-routing, ...
```

```powershell
# Windows PowerShell
cd C:\path\to\envoy-crash-course
dir labs
```

Everything below runs from inside one of those `labs/` subfolders.

## Step 4 — Start Envoy (the first lab)

Move into the first lab and bring it up:

```bash
cd labs/02-static
docker compose up
```

What happens: Docker downloads the Envoy image (`envoyproxy/envoy:v1.38-latest`) and a tiny echo
backend the first time (a few seconds to a minute), then starts both. You'll see Envoy's logs
streaming in this terminal. **Leave this terminal running** — it's Envoy. The logs here are also
where you'll watch requests arrive.

## Step 5 — Send a request through Envoy

Open a **second** terminal (leave the first running Envoy) and run:

```bash
curl localhost:10000
```

You should get back:

```
hello from the backend
```

That response came *from the backend, through Envoy*. You just proxied your first request. Watch
the first terminal — you'll see a log line appear for the request you just made.

## Step 6 — Peek at Envoy's admin interface

Envoy exposes a built-in dashboard/API on port 9901. Try:

```bash
curl -s localhost:9901/ready          # → LIVE   (Envoy is healthy)
curl -s localhost:9901/server_info | head    # version, uptime, state
```

Or open <http://localhost:9901> in your browser to click around. (This admin port is safe here
because it's local — never expose it publicly in production.)

## Step 7 — Stop and clean up

In the Envoy terminal press **Ctrl-C** to stop it. Then remove the containers:

```bash
docker compose down
```

That's the full loop: `docker compose up` to start a lab, `curl` to test it, `Ctrl-C` +
`docker compose down` to stop. **Every lab in this course works exactly this way** — only the
config inside changes.

> **⚠️ Run only one lab at a time — bring the previous lab down before starting the next.** Every
> lab uses the same ports (`10000` and `9901`), so a still-running lab will collide with the next
> one. Before moving on, go to the lab you were in and run `docker compose down`. If you forget,
> you'll see tell-tale errors like `port is already allocated` when starting, or
> `curl: (35) ... wrong version number` when testing (you're hitting the *old* lab's server). The
> safe habit between labs:
> ```bash
> docker compose down        # in the lab you're leaving
> cd ../<next-lab> && docker compose up
> ```
> `docker ps` shows what's currently running if you're unsure.

---

## Troubleshooting

**"Cannot connect to the Docker daemon" / "docker: command not found"**
: Docker Desktop isn't running (or isn't installed). Start it and wait for the running indicator,
then retry. On Linux, make sure the `docker` service is up (`sudo systemctl start docker`).

**`curl localhost:10000` hangs or says "connection refused"**
: Envoy isn't up yet or isn't listening. Check the first terminal — wait until logs stop scrolling
and you see it's serving. Make sure `docker compose up` didn't exit with an error.

**"port is already allocated" / "address already in use"**
: Something else is using port 10000 or 9901. Stop it, or edit the lab's `docker-compose.yaml` to
map a different host port (e.g. `"20000:10000"`) and curl that port instead.

**Envoy exits immediately with a config error**
: It printed why — usually a typo in `envoy.yaml`. The message names the field. Envoy refuses to
start on invalid config (a feature, not a bug). Re-check recent edits.

**Windows: `curl` behaves oddly in PowerShell**
: Older PowerShell aliases `curl` to a different command. Use `curl.exe localhost:10000` explicitly,
or run inside WSL.

**The image download is slow the first time**
: Normal — Docker caches it. Subsequent `up`s are instant.

## Check yourself

1. What single tool do you actually install to run Envoy? *(Docker — Envoy itself comes as a
   container image.)*
2. What does `docker compose up` do in a lab folder? *(Downloads and starts Envoy plus the backend
   defined in that folder.)*
3. How do you send a test request through Envoy? *(`curl localhost:10000` from a second terminal.)*
4. What does `curl localhost:9901/ready` tell you? *(Whether Envoy itself is up and serving —
   it returns LIVE.)*
5. How do you stop and clean up a lab? *(Ctrl-C in the Envoy terminal, then `docker compose
   down`.)*

---

**Next:** [Primer — Service meshes in plain English →](./primer-service-mesh.md)
