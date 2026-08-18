# 1: Load balancers

*The traffic cop: what it balances, how it decides, and why health checks are the real feature. ~12 min read.*

---

One server can only do so much, and it can crash. The moment you run two servers, a new question
appears: **who decides which request goes to which server?** That decision-maker is the load
balancer, and it's quietly one of the most important components you'll ever run, because it's the
piece that makes failure invisible.

## The job description

A load balancer (LB) sits in front of a group of servers and does three things:

1. **Spreads requests** across the servers so no single one drowns.
2. **Health-checks** the servers and stops sending traffic to the ones that fail.
3. **Hides the fleet** behind one stable address, so clients neither know nor care how many
   servers exist, which just crashed, or which are mid-deploy.

Number 2 is the one that earns its keep. Balancing a healthy fleet is easy; noticing at 3 a.m.
that server four is returning garbage and quietly removing it. *That's* the feature.

## L4 vs L7: what the balancer can see

The classic split (the Envoy course goes deep here):

- An **L4 load balancer** works at the connection level. It sees "TCP connection from this IP to
  that port" and forwards bytes. It cannot read URLs or headers, but it's extremely fast, protocol
  agnostic, and hard to break.
- An **L7 load balancer** speaks the application protocol (usually HTTP). It sees the method, the
  path, the headers, so it can route `/api/` differently from `/images/`, retry a failed GET,
  or send 5% of traffic to a canary build.

The rule of thumb: **L4 when you just need to spread connections; L7 when routing decisions depend
on what's *inside* the request.** Most real systems have both: an L4 balancer at the very edge,
L7 balancers (often Envoy) behind it.

## The algorithms, and how much they matter

People expect this list to matter more than it does:

| Algorithm | What it does | When it matters |
|---|---|---|
| **Round robin** | Next server, in order | The default; fine almost always |
| **Least connections** | Server with fewest open connections | Long-lived or uneven requests |
| **Weighted** | Some servers get more traffic | Mixed hardware; canary releases |
| **Hashing / sticky** | Same client → same server | Sessions or caches on the server |

In practice, round robin or least-connections covers nearly everything, and **sticky
sessions are usually a smell**: they mean a server holds state that should live in a shared
store, and they turn one server's death into some users' logout. The cloud-native courses keep
pushing state *out* of servers precisely so the balancer can treat them as interchangeable.

## Health checks: the part worth configuring carefully

A health check is a question the LB asks each server on repeat: *are you OK?* Three grades of
rigor:

- **TCP check**: "does the port accept a connection?" Cheap, and catches only total death.
- **HTTP check**: "does `GET /healthz` return 200?" Catches a hung or crashing app.
- **Deep check**: the `/healthz` handler verifies its own dependencies (database reachable,
  cache warm). Thorough and dangerous: if every server's check fails because the *database*
  blinked, the LB removes all of them and turns a wobble into an outage. Check what the server
  itself controls; report dependencies as separate signals.

Kubernetes readiness probes (Kubernetes course, module 6) are exactly this idea, one layer down.

## Global vs regional

Everything above balances within one place. Balancing *across* places uses different machinery:

- **DNS-based**: resolve `api.example.com` to Frankfurt for Europeans and Virginia for Americans;
  fail the whole name over when a region dies. Coarse (DNS caching makes changes slow to
  propagate) but universal.
- **Anycast**: advertise the *same* IP address from many locations and let internet routing
  deliver each user to the nearest one. This is how CDNs and big public DNS resolvers work.

A global request often passes **two or three balancers**: DNS/anycast chooses the region, an L4
balancer at the region's edge spreads connections, an L7 balancer inside routes to services. Each
layer only has the one job.

## What a load balancer should NOT do

The LB is a fast, dumb, reliable traffic cop, and its value comes from staying that way:

- **No business logic.** The moment routing rules encode "premium customers go to the fast
  cluster", you've hidden product behavior in infrastructure config nobody reviews.
- **No request transformation** beyond headers it owns (adding `X-Forwarded-For` is fine;
  rewriting response bodies is not; that's an application's or gateway's job).
- **Not a substitute for capacity.** A balancer spreads load; it doesn't create it. If every
  server is at 100%, the balancer just distributes the suffering evenly.

If you find yourself wanting the balancer to be smarter, what you usually want is the next module's
component (the API gateway) or the application itself.

---

**Next:** [2: API gateways →](./02-api-gateways.md)
