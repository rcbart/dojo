# 3 — CDNs

*The copy shop at the edge: what caching actually buys you, cache keys, invalidation, and when a CDN is the wrong tool. ~10 min read.*

---

Physics is the one scaling problem you can't code around: a request from Sydney to a server in
Virginia spends ~200 ms just *traveling*, before your code runs at all. A **content delivery
network** attacks the problem the only way physics allows: by moving the answer closer to the
question.

## What a CDN is

A CDN is thousands of cache servers ("edge nodes" or **PoPs**, points of presence) spread across
cities worldwide, all announcing the same address via **anycast** (module 4 explains how that
works). Your user's request lands at the nearest node. If that node has a valid copy of the
answer (a **cache hit**), it responds from 20 ms away and your servers (**the origin**) never
hear about it. If not (a **miss**), the node fetches from your origin, serves the user, and keeps
a copy for the next person.

Three wins, in order of importance:

1. **Latency**: answers come from nearby.
2. **Origin offload**: your servers see a fraction of the traffic; the cheapest request is the
   one that never arrives. This is also your DDoS shock absorber.
3. **Availability**: many CDNs can serve stale copies while your origin is down; visitors read
   yesterday's page instead of an error page.

## What's cacheable, really

- **Static assets**: images, JS, CSS, fonts, downloads. The classic case; cache aggressively.
- **Anonymous dynamic content**: the same rendered blog post everyone sees. Cache for seconds or
  minutes; even a 30-second TTL collapses a traffic spike into one origin request per PoP.
- **Personalized or private responses**: *your* shopping cart, *your* account page. Do **not**
  cache at a shared edge, and mark them so: one `Cache-Control: public` on a per-user response is
  a data breach with your name on the commit.
- **APIs**: GETs with common parameters often cache well; writes never do.

The control knobs are HTTP itself: `Cache-Control` (`max-age`, `s-maxage`, `public`/`private`,
`no-store`), `ETag` revalidation, and `Vary`.

## The cache key: where correctness lives

The **cache key** is what the CDN uses to decide "same content": typically host + path + a chosen
subset of query parameters and headers. Both failure directions hurt:

- **Key too broad** (ignores a header that changes the response): users receive *someone else's*
  variant: the gzip-page-served-to-a-client-that-can't-unzip class of bug, or worse, someone
  else's data.
- **Key too narrow** (includes irrelevant parameters): `?utm_source=twitter` makes every marketing
  link a cache miss and your hit rate quietly dies.

`Vary` is how the origin tells caches "this header changes the answer." Treat cache-key design as
API design: deliberate, reviewed, and tested.

## Invalidation: the famous hard problem

You deployed `app.js` v2; edges hold v1 for another `max-age`. Your options, best first:

1. **Versioned URLs.** Build the version into the name (`app.9f31c2.js`) and cache it for a
   year. A new deploy is a *new URL*, so there's nothing to invalidate, and rollbacks are just the
   old URL again. This removes the problem instead of solving it; every serious frontend build
   does this.
2. **Short TTL + revalidation** for things that must live at stable URLs (the HTML page itself):
   `max-age=60` bounds staleness at a minute; `ETag` makes the refresh cheap (a 304, no body).
3. **Purge APIs**: "invalidate `/index.html` everywhere, now." Fine as a deploy step or emergency
   brake; a design smell if your architecture *depends* on purges racing around the planet.

## When a CDN is the wrong tool

- **Cache hit rate near zero**: every response personalized or unique. You've added a hop and a
  bill; the CDN's other edge services (TLS, DDoS absorption) may still justify it, but know
  *which* product you're actually buying.
- **Strong consistency reads**: "balance after transfer" must come from the system of record. A
  cache is, by definition, allowed to be stale.
- **As a substitute for capacity planning**: a CDN absorbs *read* spikes of *cacheable* content.
  Checkout traffic goes straight through to origin, every time.
- **East–west traffic**: CDNs are a north–south, edge technology. Service-to-service caching is a
  Redis/application-cache problem (module 5), not a CDN problem.

## Where it sits in the map

The CDN is the outermost ring of module 0's diagram: DNS resolves to the CDN, the CDN terminates
TLS meters away from the user, serves what it can, and forwards the rest to your load balancer.
That also makes it the first suspect when "the site shows old content": check what the edge
cached, and what your `Cache-Control` headers *actually said*, before blaming the app.

---

**Next:** [4 — DNS in depth →](./04-dns.md)
