# Primer — Core concepts & glossary

*Read this if any word in this course feels assumed. It defines the background terms (machine,
host, process, kernel, port, and friends) in plain English, so nothing later leaves you lost. ~10
min. Skim it now; come back whenever a term trips you up.*

---

Most tutorials assume you already know a pile of infrastructure vocabulary. This page doesn't. Here
is every foundational term the course leans on, explained simply.

## Machines: computers that run things

- **Machine / computer**: any computer that runs software. Could be your laptop or a server.
- **Server**: a computer whose job is to run programs for others (serve web pages, hold a
  database), usually running somewhere in a data center, on all the time.
- **Host**: in Docker talk, **the machine that Docker itself runs on**, whether your laptop or a cloud
  server. Containers run "on the host." When you see `localhost` or "the host," it means *this
  machine, the one running the containers.*
- **Node**: a generic word for "one machine in a group of machines." A single server in a cluster
  is called a node. (You'll use this word constantly in Kubernetes; in Docker it just means "a
  machine running containers.")
- **Instance**: one running copy of something. "An instance of a server" = one particular running
  server. "A container instance" = one running container. If you run three copies of an app, you
  have three instances.
- **Virtual machine (VM)**: a software-simulated computer running *inside* a real one, with its own
  full operating system. Cloud servers are usually VMs. (Containers are the *lighter* alternative;
  see the "What are containers?" primer.)
- **Cloud**: someone else's computers (Amazon, Google, Microsoft) that you rent by the hour instead
  of buying hardware.

## Inside a machine: operating systems and processes

- **Operating system (OS)**: the base software that runs a computer (Linux, macOS, Windows).
  Containers almost always run **Linux** inside, even on a Mac/Windows host (Docker Desktop runs a
  small hidden Linux VM for this).
- **Kernel**: the innermost core of the operating system that manages hardware, memory, and running
  programs. The key fact for Docker: **containers share the host's Linux kernel** (that's why
  they're lightweight), whereas VMs each ship their own.
- **Process**: one running program. When you start a container, its main program runs as a process.
  A container lives exactly as long as its main process; when that process exits, the container
  stops.
- **Filesystem**: the tree of files and folders a program sees (`/app`, `/etc`, …). Each container
  has its **own isolated filesystem** taken from its image, separate from the host's.
- **Environment variable**: a named value passed to a program at startup (like `LOG_LEVEL=debug`),
  used to configure it without changing code. Docker sets these with `-e`.

## Networking basics

- **IP address**: a machine's numeric address on a network, like `10.0.0.7`. Each container gets
  its own.
- **Port**: a numbered "door" on a machine for a specific service (web servers usually listen on
  port 80, databases on 5432). One machine has many ports so many services can share one IP.
- **`localhost` / `127.0.0.1`**: "this same machine." The gotcha: inside a container,
  `localhost` means *the container itself*, not your laptop or another container.
- **Publish a port** (`-p 8080:80`): poke a hole so a port inside a container is reachable from the
  host. "Host 8080 → container 80."
- **DNS**: the system that turns names into IP addresses, so you can say `db` instead of
  `10.0.0.7`.

## Docker-specific building blocks

- **Image**: a read-only, packaged blueprint of an app plus everything it needs. Built once, run
  many times. (Like a class, or a recipe.)
- **Container**: one running instance of an image. (Like an object, or the cooked meal.)
- **Layer**: an image is built from stacked read-only layers, each recording one change; they're
  cached and shared to save space and time.
- **Dockerfile**: the text recipe listing the steps to build an image.
- **Registry**: an online store of images (e.g. Docker Hub) you push to and pull from.
- **Volume**: Docker-managed storage that lives *outside* a container so data survives when the
  container is deleted.
- **Docker daemon (`dockerd`)**: the background service that actually builds images and runs
  containers.
- **Docker CLI**: the `docker` command you type, which sends your requests to the daemon.
- **Client / server**: a pattern where one program (the *client*, here the CLI) asks another (the
  *server*, here the daemon) to do work. Docker is built this way.

## Ideas and formats you'll meet

- **CPU architecture**: the "instruction set" a chip understands: **amd64** (Intel/AMD) or
  **arm64** (Apple Silicon, many phones/servers). An image built for one won't run on the other
  unless it's *multi-architecture*.
- **YAML**: a human-friendly text format for configuration (used by `compose.yaml` and, later,
  Kubernetes). Indentation matters; it's just structured key/value data.
- **Declarative**: you describe the *desired end state* ("I want these services running") and the
  tool makes it happen, versus **imperative** (you give step-by-step commands). Compose and
  Kubernetes are declarative.
- **Stateless vs stateful**: *stateless* apps keep no important local data (any copy is
  interchangeable, so they're easy to scale); *stateful* apps do (databases), so their storage must be
  preserved.

## How to use this page

You don't need to memorize this. Skim it once so the words feel familiar, and jump back whenever a
term in a later module is fuzzy. Every concept here is used, in context, in the modules that follow.

## Check yourself

1. What does "host" mean in Docker? *(The machine Docker runs on, your laptop or a server, where
   containers run.)*
2. What is a "node"? *(A generic term for one machine in a group; in Docker, a machine running
   containers.)*
3. Why are containers lighter than VMs, in kernel terms? *(Containers share the host's kernel; VMs
   each ship their own full OS.)*
4. Inside a container, what does `localhost` refer to? *(The container itself, not your laptop or
   another container.)*
5. Image vs container vs instance? *(Image = read-only blueprint; container = a running instance of
   an image; "instance" = one running copy of something.)*

---

**Next:** [0 — What Docker is →](./00-what-is-docker.md)
