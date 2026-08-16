# 5 — Queues, caches & the async path

*The technologies that take work OFF the request path: message queues, application caches, and object storage. ~12 min read.*

---

Everything so far — DNS, CDN, load balancer, gateway — optimizes the **synchronous path**: a user
is waiting, milliseconds count. But a mature system moves as much work as possible *off* that
path, and three technologies do most of the moving: queues, caches, and object storage. They
aren't strictly "traffic" infrastructure, but no map of a cloud-native system is honest without
them.

## Message queues: do it later, reliably

A checkout request needs to: charge the card, update inventory, send a receipt email, notify the
warehouse, update analytics. The user needs an answer *now*; four of those five can happen in the
next few seconds. A **message queue** is how: the service handling the request writes a message —
"order 4412 placed" — to the queue and responds. Independent **consumers** read messages and do
the slow work at their own pace.

What this buys, concretely:

- **Latency** — the user waits for one write, not five downstream systems.
- **Decoupling** — the email service can be down for an hour; messages wait, nothing is lost, and
  checkout never noticed. Compare that with a synchronous call: their outage is your outage.
- **Load leveling** — a spike of 10,000 orders/minute becomes a queue that drains at whatever rate
  the consumers sustain, instead of a stampede that flattens the warehouse system.

The two shapes: **work queues** (each message consumed once, by one worker — background jobs) and
**pub/sub streams** (each message readable by *every* interested consumer — events, the Kafka
family).

The honesty section — queues have rules you can't opt out of:

- Delivery is **at-least-once** in practice; exactly-once is a marketing word. Sometimes a message
  arrives twice, so consumers must be **idempotent**: processing "order 4412 placed" twice must
  not charge twice. (Design the handler around a key — *have I processed 4412?* — and this is
  manageable; ignore it and it's a production incident.)
- Messages that repeatedly crash their consumer need a **dead-letter queue** — a sidetrack where
  poison messages go for humans to inspect, instead of blocking everything behind them.
- **A queue is not a database.** If a message's data matters, it also lives in the system of
  record; the queue is transport, not truth.

## Application caches: don't compute it twice

The CDN cached responses at the edge for *everyone*; an **application cache** (Redis and its
family) caches *data* inside your system: session data, rendered fragments, the result of an
expensive query, "the 100 hottest products."

The standard pattern is **cache-aside**: look in the cache; on a miss, read the database, put the
result in the cache with a TTL, return it. Simple — and its failure modes are famous enough to
have names:

- **Staleness.** The database changed; the cache hasn't expired. Decide *per key* how stale is
  acceptable, and let TTL enforce it. "I'll invalidate on every write" sounds better and is where
  the famous quote about the two hard problems in computer science comes from — explicit
  invalidation is a correctness protocol you now must maintain forever.
- **Stampede.** A hot key expires and 5,000 concurrent requests all miss and all hit the database
  at once — the cache was *hiding* load, and it returns as a spike. Mitigations: staggered TTLs,
  or one request refreshes while others serve the stale value briefly.
- **Cache as the only copy.** If restarting Redis loses data you needed, it wasn't a cache — it
  was an accidental database, without a database's guarantees. Caches must be safe to flush at
  any moment.

The unifying rule with the CDN module: **a cache is permission to be stale in exchange for speed.**
Every cache decision is choosing how much staleness the business can tolerate for that data.

## Object storage: files are not your server's problem

User uploads, build artifacts, backups, logs — anything that's "a blob of bytes with a name" —
belongs in **object storage** (the S3 family): effectively unlimited, cheap, replicated, and
addressable by URL. The pattern that matters architecturally: services **pass URLs, not bytes**.
An upload goes *directly* from the user's browser to object storage via a **pre-signed URL** (a
short-lived, permission-scoped link your service issues); the service stores the object's key; the
CDN serves the object to readers. Your application servers — the expensive, stateful-averse things
Kubernetes is scheduling — never carry file traffic at all.

## The map, finished

```
                      you
                       │
        DNS ── CDN ── LB ── gateway ── services
                                          │  │
                                   cache ─┘  └─ queue ─► workers
                                     │              │
                                  database      object storage
```

Read it with the two questions this course keeps asking: *is a user waiting?* (sync path — spend
on latency) and *who owns the truth?* (systems of record vs the caches and queues that serve
them). Those two questions, asked box by box, are most of architecture review.

**Where to go from here:** the four hands-on courses. Docker packages the services, Kubernetes
runs them, Envoy is the data plane inside the LBs and gateways you now understand, and Istio is
what happens when every service gets its own tiny gateway. See you there.
