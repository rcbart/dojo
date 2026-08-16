# 0 — The path of a request (the map for everything else)

*No installs, no labs — this whole course is the mental model the other four courses assume. ~10 min read.*

---

Type a URL, press Enter, and your request crosses half a dozen pieces of infrastructure before any
code you wrote ever runs. Every one of those pieces exists to solve a real problem, and every one of
them is a thing you'll meet again in the Docker, Kubernetes, Envoy, and Istio courses. This module
draws the whole map once, so each later module can zoom into one box without you losing the plot.

## The map

```
 you (browser / app)
   │
   ▼
 DNS            "where IS api.example.com?"        → an IP address
   │
   ▼
 CDN            the copy shop at the edge          (static content, cached responses)
   │
   ▼
 Load balancer  the traffic cop                    (spreads requests across machines)
   │
   ▼
 API gateway    the front desk                     (auth, rate limits, routing)
   │
   ▼
 your services  the actual work                    (each behind its own internal LB,
                                                    talking to queues, caches, databases)
```

Not every system has every box, and some boxes collapse into one product — but the *jobs* are
always there, and knowing which job lives where is what lets you debug "the site is down" in
minutes instead of hours.

## Each box, in one no-nonsense paragraph

**DNS** answers exactly one question: what address should I talk to for this name? It's a
distributed phone book with aggressive caching. Because it's the *first* step, it's also a place
to do crude but far-reaching routing — send Europeans to the Frankfurt region, fail over to the backup
site — all before a single packet reaches your infrastructure.

**A CDN** (content delivery network) is thousands of small caches placed physically near your
users. If the answer to a request hasn't changed — an image, a script, yesterday's blog post — the
CDN answers from a server 20 ms away instead of your origin 200 ms away, and your servers never
see the request at all. The fastest and cheapest request is the one that never arrives.

**A load balancer** takes a stream of incoming requests and spreads it across many identical
servers, checking their health and skipping the dead ones. It's the piece that turns "a server"
into "a fleet", and it's what makes deploys, crashes, and scaling invisible to users.

**An API gateway** is the single front door for your APIs. It checks who you are, enforces how
often you may call, routes each path to the right backend service, and gives the outside world one
stable address while the services behind it split, merge, and move. It is a *policy* layer — the
course module on it is mostly about what it should *not* do.

**Your services** — the containers, pods, and meshes of the other four courses — finally do the
work. Inside that boundary the same patterns repeat at smaller scale: internal load balancers in
front of each service, internal gateways between departments, caches and queues between services.

## Two directions of traffic

Traffic from the outside world into your system is called **north–south**; traffic between your
own services is **east–west**. The distinction matters because the tools differ: the CDN, the edge
load balancer, and the external API gateway handle north–south; service meshes (Istio) and
internal load balancing handle east–west. When someone says "the gateway", asking *which
direction* is the fastest way to know what they mean.

## Control plane vs data plane

One more pair of words the whole cloud-native world leans on. The **data plane** is whatever
touches each request as it flows — proxies, load balancers, caches. The **control plane** is
whatever *configures* the data plane — the thing you talk to when you change a route or add a
backend. DNS has resolvers and registrars; Envoy has proxies and xDS servers; Kubernetes has
kubelets and an API server. Same split, every time. When requests still flow but you can't change
anything, the control plane is down; when nothing flows, look at the data plane.

## How to use this course

Each of the next modules takes one box and answers the same four questions: what problem does it
solve, how does it actually work, what should it do — and, just as important, what should it *not*
do. There are no labs here; the labs live in the four hands-on courses this one feeds into.

---

**Next:** [1 — Load balancers →](./01-load-balancers.md)
