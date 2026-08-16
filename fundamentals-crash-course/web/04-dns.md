# 4 — DNS in depth

*The distributed phone book: how a name becomes an address, what every record type is actually for, and the rules (and workarounds) around CNAMEs. ~15 min read.*

---

DNS answers one question — *what should I talk to for this name?* — and it answers it billions of
times a second, using a design from 1983 that still works: **delegate everything, cache
everything**. Almost every DNS surprise you'll ever hit traces back to one of those two words.

## The resolution walk

When your browser needs `api.example.com`, the walk is:

```
your app
  → stub resolver        the tiny client in your OS: "someone answer this"
  → recursive resolver   your ISP's, your company's, or 1.1.1.1 / 8.8.8.8 —
                         does the real legwork, and CACHES what it learns
      → root servers        "ask the .com servers, they're over there"
      → .com TLD servers    "ask example.com's own servers, over there"
      → example.com's       "api.example.com is 203.0.113.7" ← AUTHORITATIVE
        nameservers
```

Two roles matter forever after: the **authoritative** servers are the ones that *own* the answer —
what you edit in your DNS provider's dashboard edits *them*. Everything else is a **cache** with a
countdown timer. When you "change DNS" and nothing happens, you didn't fail to change it — you
changed the authority, and the world's caches haven't asked again yet.

## Zones, delegation, and who you're actually paying

A **zone** is the chunk of the namespace you control — `example.com` and everything under it. Two
different companies are involved in yours, and confusing them causes real outages:

- The **registrar** is where you *bought* the name. Its one ongoing job: tell the `.com` servers
  which nameservers are authoritative for your zone — the **NS records**.
- The **DNS host** *runs* those nameservers and serves your records. Often the same company as the
  registrar; often not.

Migrating DNS hosts means updating NS records *at the registrar* — the classic half-done migration
serves old records to half the internet for days, because the old host still answers whoever
hasn't seen the new NS delegation yet. Inside a zone you can delegate further: an NS record for
`internal.example.com` hands that subtree to a different set of servers (this is how a platform
team gives each product team its own sandbox).

## The records, in plain English

Every record is a line of "for this **name**, this **type** of question has this answer, cacheable
for **TTL** seconds."

**A / AAAA — "the address is…"** The workhorses: name → IPv4 (A) or IPv6 (AAAA) address. A name
can hold *several* — resolvers get the whole set, clients pick one, and you've accidentally
invented the crudest load balancer (more below).

**CNAME — "actually, ask about this other name."** A CNAME is an **alias**, and being precise
about what it does prevents most CNAME bugs: it does *not* redirect traffic and does *not* copy an
address. It tells the resolver *"restart your question with this other name"*:

```
www.example.com.   CNAME   sites.hostingprovider.net.
; resolver: "OK — what's the A record for sites.hostingprovider.net?"
```

Why that indirection is worth a whole record type: **it tracks the target's changes.** The hosting
provider can renumber `sites.hostingprovider.net` a hundred times; your record never changes,
because it names the *name*, not the address. That's why CDNs and hosting platforms tell you
"CNAME to us" — their addresses are theirs to shuffle.

The rules, which exist because a CNAME means "*everything* about this name lives elsewhere":

1. **A CNAME must be alone.** No other record may coexist at the same name — if `www` is an alias,
   `www` can't *also* have its own MX or TXT; those questions all get forwarded to the target.
2. **No CNAME at the zone apex.** `example.com` itself *must* hold SOA and NS records (that's
   what makes it a zone) — and rule 1 says a CNAME tolerates no neighbors. Contradiction, so it's
   forbidden. This is *the* famous DNS gotcha: your host says "CNAME to us" and your registrar
   refuses to accept it on the bare domain.
3. **Chains work but cost.** CNAME → CNAME → A resolves, each hop a potential extra lookup. Keep
   aliases one hop deep where you can.

**ALIAS / ANAME / flattened CNAME — the apex workaround.** Not a real DNS record type — no RFC
defines it — but a feature of your DNS *provider*: you configure "apex → `lb.provider.net`", and
the provider's authoritative servers secretly resolve the target themselves, then answer queries
with plain **A records**. The world sees ordinary addresses; you get CNAME-like
track-the-target behavior at the apex. Two honest caveats: it's provider-specific (moving DNS
hosts means re-creating it, maybe differently), and the target gets resolved *from the provider's
servers*, so a geo-aware target may pick an address near your DNS provider rather than near your
user. Good providers mitigate this; worth asking how yours does.

**MX — "mail for this domain goes to…"** Mail servers, with priorities. Two operational notes:
mail is the thing people forget when migrating DNS ("email is down" after a zone move is
practically a tradition), and MX targets must be names with A/AAAA records — an MX pointing at a
CNAME is against spec and breaks some mail software.

**TXT — "here's a string, make of it what you will."** The junk drawer that became load-bearing.
Domain-ownership verification ("paste this TXT record to prove control") and the email
authentication trio all live here: **SPF** (which servers may send mail as this domain), **DKIM**
(the public key mail signatures verify against), **DMARC** (what receivers should do with mail
that fails). If you send email at all, these three records decide whether it lands in inboxes.

**CAA — "only these authorities may issue certificates for this name."** A small, cheap fence
around TLS (next module): certificate authorities are *required* to check it before issuing. Two
lines of zone file that make a whole class of mis-issuance harder.

**SRV, PTR, SOA — the supporting cast.** SRV maps a *service* to host+port (used by Kerberos and
Active Directory — Identity Dojo's enterprise stream leans on it). PTR is reverse DNS, address →
name — mostly a mail-server reputation requirement. SOA is the zone's cover page: serial number,
refresh timing, and the field that matters to you — the **negative TTL**, how long resolvers may
cache "that name doesn't exist" (yes, *misses* are cached too: create a record, query it too soon,
and the NXDOMAIN you generated can outlive your fix).

## TTLs and the "propagation" myth

Every record carries a TTL — how long any cache may hold it. "Waiting for DNS to propagate" is a
comforting phrase, but nothing *propagates*: caches simply expire on their own schedule, one
resolver at a time, and until then they serve the old answer. Which makes TTL strategy simple to
state: **low TTLs (30–300s) on records you might need to change in a hurry** (anything used for
failover or migration), **long TTLs (hours+) on stable records** to cut latency and load — and,
before any planned change, **lower the TTL one full old-TTL in advance**, because the change to
the TTL itself obeys the *old* TTL. One more honest wrinkle: some resolvers clamp or ignore very
low TTLs, so treat "one minute" as *most* of the internet, not all of it.

## DNS as a routing layer

Because DNS runs before any connection, it's a place to make routing decisions:

- **Round-robin** — multiple A records; clients spread across them. No health checks, no real
  balance — a fine crude spreader, never an availability story.
- **Weighted / geo / latency answers** — managed DNS products answer differently per query origin:
  Europeans get Frankfurt, 5% of resolutions get the canary region. Coarse (per-resolver, not
  per-user, and cached) but universal.
- **Health-checked failover** — the provider probes your endpoints and drops dead ones from
  answers. With honest TTLs this is minutes-not-seconds failover; pair with anycast (module 0's
  CDN trick) when seconds matter.
- **Split-horizon** — internal resolvers answer with private addresses, public ones with public:
  same name, different truths. Powerful and a debugging trap: "it resolves differently from the
  office" is split-horizon until proven otherwise.

## Debugging: three commands and three failures

`dig api.example.com` — what does *my resolver* say. `dig @1.1.1.1` — what does a *different*
cache say (disagreement = caching or split-horizon). `dig +trace` — walk from the roots yourself
and see the *authoritative* truth, skipping every cache. The failures read differently and point
differently: **NXDOMAIN** = the authority says this name does not exist (typo, missing record, or
negative-cached miss); **SERVFAIL** = the resolver couldn't get an answer (broken delegation, dead
nameservers, DNSSEC validation failure); an **empty answer** for your type = the name exists but
has no record of that type (you queried A, there's only a CNAME chain to nowhere, or only AAAA).
Ask which of the three you have before touching anything.

---

**Next:** [5 — TLS & certificates →](./05-tls.md)
