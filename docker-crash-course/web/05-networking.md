# 5 — Networking

*How containers talk to the world and to each other. Concepts + a lab. ~25 min. Requires Docker.*

---

Containers are isolated by default, including their networking. Docker gives each a virtual network
interface and lets you connect them into virtual networks. Two questions this module answers: *how do
I reach a container from my laptop?* and *how do two containers talk to each other?*

## Publishing ports: reaching a container from outside

A container's ports are private until you **publish** them with `-p HOST:CONTAINER`:

```bash
docker run -d -p 8080:80 nginx     # host :8080  →  container :80
```

Now `localhost:8080` on your machine reaches port 80 inside the container. Without `-p`, nothing
outside the container can reach it. You can publish several: `-p 8080:80 -p 8443:443`.

## Docker networks: how containers find each other

By default, containers you start are attached to the default **bridge** network, but the *magic
feature*, automatic name resolution, only works on a **user-defined bridge network**. Create one
and containers on it can reach each other **by container name**, no IPs needed:

```bash
docker network create appnet
docker run -d --name db  --network appnet postgres:16 -e POSTGRES_PASSWORD=x
docker run -d --name api --network appnet myapi         # can connect to "db:5432"
```

Inside `api`, the hostname `db` resolves to the database container automatically. This built-in DNS
is why you should **always create a user-defined network** for multi-container apps (Compose does
this for you; see Module 6).

## The network drivers (know these names)

| Driver | What it does |
|--------|-------------|
| **bridge** | Default. A private virtual network on one host; containers talk via it. User-defined bridges add name-based DNS. |
| **host** | The container shares the host's network directly (no isolation, no `-p` needed). Fast, but less isolated. |
| **none** | No networking at all; fully isolated. |
| **overlay** | Spans **multiple hosts** (for Docker Swarm / clusters). The idea Kubernetes networking generalizes. |

For local single-host work you'll use **bridge** (user-defined) almost always.

## How it connects to the outside

- **Outbound** (container → internet) works by default via NAT: a container can `curl` the web with
  no config.
- **Inbound** (internet/host → container) requires publishing a port with `-p`.

## Lab: two containers talking

Build a tiny app that talks to Redis over a user-defined network.

```bash
# 1. a private network with DNS
docker network create appnet

# 2. start Redis on it (no published port needed; only the app talks to it)
docker run -d --name redis --network appnet redis:7

# 3. run a throwaway client on the same network and reach redis BY NAME
docker run --rm --network appnet redis:7 redis-cli -h redis ping
# → PONG      (the name "redis" resolved to the container)
```

Now show that name resolution needs the shared network:

```bash
# a container NOT on appnet cannot resolve "redis"
docker run --rm redis:7 redis-cli -h redis ping
# → error: could not connect / name resolution fails
```

### Experiment: publish vs internal

Start a web app that talks to Redis internally but is reachable from your browser:

```bash
docker run -d --name web --network appnet -p 8080:80 nginx   # published to you
# 'web' can reach 'redis' by name over appnet; you reach 'web' via localhost:8080
docker exec web getent hosts redis      # shows redis's internal IP: DNS working
docker rm -f web redis && docker network rm appnet
```

## Practitioner notes

- **Only publish what you must.** A database usually needs no `-p`: only the app talks to it, over
  the private network. Publishing it exposes it to your whole host/LAN.
- **Names > IPs.** Container IPs change; always connect by container/service name on a user-defined
  network.
- This is exactly the model Kubernetes scales up: every Pod gets an IP, and **Services** give stable
  names, the same "talk by name, not IP" principle you just used.

## Your turn (challenge)

Create a user-defined network, put two containers on it, and have one reach the other **by name**.
Then prove a container *not* on that network cannot resolve the name.

**Verify you succeeded:**
```bash
docker network create appnet >/dev/null
docker run -d --name redis --network appnet redis:7 >/dev/null
OK=$(docker run --rm --network appnet redis:7 redis-cli -h redis ping 2>/dev/null)
BAD=$(docker run --rm redis:7 redis-cli -h redis ping 2>&1 | grep -qi "could not\|not known\|resolve" && echo blocked)
[ "$OK" = PONG ] && [ "$BAD" = blocked ] && echo "PASS ✓ (name works on net, fails off net)" || echo "try again"
docker rm -f redis >/dev/null; docker network rm appnet >/dev/null
```

## Check yourself

1. What does `-p 8080:80` do? *(Publishes container port 80 to host port 8080 so you can reach it.)*
2. On a user-defined bridge network, how do containers find each other? *(By container name: Docker
   provides automatic DNS.)*
3. Why create a user-defined network instead of using the default bridge? *(Automatic name-based DNS
   between containers; the default bridge lacks it.)*
4. Does a container need `-p` to reach the internet? *(No: outbound works by default; `-p` is only
   for inbound access.)*
5. Should a database container usually publish its port? *(No: only the app needs it, over the
   private network; publishing exposes it unnecessarily.)*

---

**Next:** [6 — Multi-container apps with Docker Compose →](./06-docker-compose.md)
