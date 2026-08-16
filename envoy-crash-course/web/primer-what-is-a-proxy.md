# What is a proxy? (and how it works)

*The single idea the whole course rests on, explained from scratch. No jargon assumed. ~10 min.
Envoy is a proxy — so once this clicks, everything else is "what kind of proxy, doing what."*

---

## The plain-English version

A **proxy** is a **middleman**. It's a program that sits *between* you and the thing you're trying
to reach, passing messages back and forth on your behalf.

Think of ordering food at a hotel. You don't walk into the kitchen and talk to the chef — you tell
the **waiter** what you want. The waiter carries your order to the kitchen, brings the food back,
and you never deal with the kitchen directly. The waiter is a proxy: a go-between that stands
between the customer (you) and the service (the kitchen).

On a network it looks like this:

```
   you  ──►  the waiter  ──►  the kitchen
   (client)   (PROXY)         (the real server)
        ◄──               ◄──
```

You talk to the proxy. The proxy talks to the real server for you, gets the answer, and hands it
back. As far as you're concerned, you're just talking to "the thing" — you often don't even know a
middleman is there.

## Okay, but how does it actually work?

Normally, when your computer wants a web page, it connects **directly** to the server that has it
and asks: "give me this page." The server answers, and you're done.

With a proxy in the middle, that one hop becomes two:

1. **You connect to the proxy** instead of the real server, and make your request.
2. **The proxy connects to the real server** on your behalf and makes the *same* request (or a
   slightly modified one).
3. **The real server replies to the proxy.**
4. **The proxy replies to you**, passing the answer back (again, possibly tweaked).

Two separate conversations — you↔proxy and proxy↔server — stitched together so it *feels* like one.
That's the entire mechanism. Everything fancy a proxy does happens in that middle spot, in between
steps 2 and 3.

## Why on earth add a middleman?

Because the middle is a *fantastic place to do useful work* — work you'd otherwise have to build
into every server or every client. Sitting in the middle, a proxy can:

- **Direct traffic** — look at what you asked for and decide which server should handle it (this is
  *routing*).
- **Share the load** — spread requests across many identical servers so no single one gets
  overwhelmed (*load balancing*).
- **Handle failures** — if a server is down or slow, quietly retry a different one, so you never
  see the hiccup.
- **Do the security** — handle the encryption (HTTPS) and check that you're allowed in
  (*authentication*), so each server doesn't have to.
- **Speed things up** — remember (*cache*) a popular answer and hand it back instantly next time.
- **Watch everything** — since every request flows through it, it's the perfect place to count
  traffic, measure speed, and log what happened.
- **Shield the servers** — the outside world talks only to the proxy, so the real servers can stay
  hidden and protected.

One well-placed middleman does all of that *once*, instead of every server reinventing it.

## Two flavors: "for the client" vs "for the server"

Proxies come in two directions, and the difference is just *whose side the middleman is on*.

**Forward proxy — a middleman for the *client*.** It sits in front of *you* and reaches out to the
wider internet on your behalf. Your company or school might route all web traffic through one to
filter sites, cache pages, or hide who's really browsing. The servers on the internet just see "a
request from the proxy."

```
  you + coworkers ──►  FORWARD PROXY  ──►  the whole internet
```

**Reverse proxy — a middleman for the *server*.** It sits in front of *the servers* and takes
requests from the outside world, then hands them to whichever internal server should answer. Anyone
on the internet talks to the reverse proxy thinking it's "the website," never seeing the real
machines behind it.

```
  the whole internet ──►  REVERSE PROXY  ──►  your fleet of servers
```

**This second kind — the reverse proxy — is the one that matters for this course.** Routing
incoming traffic to a fleet of backend services, balancing load, terminating HTTPS, retrying
failures, collecting metrics — that's exactly the reverse-proxy job.

## And this is where Envoy comes in

**Envoy is a reverse proxy** — a programmable one with everything above built in. Everything above (routing,
load balancing, retries, TLS, metrics, shielding your servers) is precisely what Envoy does, and
the rest of this course is really just:

- *what kinds of decisions* it can make in that middle spot (routing, filtering — Modules 04–05),
- *how you tell it* what to do (its config — Modules 02–03, 07),
- and *where you place it* — at your front door (an **API gateway**) or next to every service (a
  **service mesh**, the next primer).

So whenever you feel lost later, come back to the one picture: **a middleman between a client and a
server, doing helpful work in between.** That's all a proxy is, and Envoy is the best-in-class
version of it.

## Check yourself

1. In one sentence, what is a proxy? *(A middleman program that sits between a client and a server,
   passing requests and responses on their behalf.)*
2. Turn one direct connection into the proxy version — how many conversations are there now?
   *(Two: you↔proxy and proxy↔server, stitched together.)*
3. Name three useful jobs a proxy can do from its spot in the middle. *(Any of: routing, load
   balancing, retries, TLS/encryption, auth, caching, metrics, shielding servers.)*
4. Forward proxy vs reverse proxy — what's the difference? *(A forward proxy is a middleman for the
   client reaching out; a reverse proxy is a middleman for the servers receiving traffic.)*
5. Which kind is Envoy, and why does that fit this course? *(A reverse proxy — it fronts your
   backend services to route, balance, secure, and observe incoming traffic.)*

---

**Next:** [Primer — Service meshes in plain English →](./primer-service-mesh.md)
