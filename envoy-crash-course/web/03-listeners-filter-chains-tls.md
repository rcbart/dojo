# 03 — Listeners, filter chains & TLS

*Concepts + a TLS lab. You'll make Envoy speak HTTPS. ~20 min. Requires Docker + `openssl`.*

Lab files: [`labs/03-tls/`](../labs/03-tls/).

---

## Listeners, in depth

A **listener** is a bound socket (address + port) plus the pipeline that processes what arrives
there. You can have many listeners — e.g. `:80` (HTTP), `:443` (HTTPS), `:15001` (a mesh
sidecar's intercept port). Key parts:

- **`address.socket_address`** — the IP and port to bind. `0.0.0.0` = all interfaces.
- **`filter_chains`** — one or more processing pipelines. A listener with several filter chains
  chooses *which one* to use per connection via **`filter_chain_match`** (below).
- **`listener_filters`** — a special early stage that runs *before* the filter chain is chosen,
  used to peek at the connection (e.g. read the TLS SNI or the original destination) so Envoy can
  match the right chain.

### TCP proxy vs HTTP proxy — the filter chain decides

The listener itself is protocol-agnostic; what makes it "an HTTP listener" is that its filter
chain's network filter is the **HTTP Connection Manager**. Swap that for the **TCP proxy** filter
(`envoy.filters.network.tcp_proxy`) and the same listener becomes a dumb-but-fast L4 forwarder
(great for databases, raw TCP, or passing TLS through untouched). So:

- **L7 / HTTP** → filter chain uses `http_connection_manager` (parses HTTP, has routes + HTTP
  filters). *This is 90% of what you'll write.*
- **L4 / TCP** → filter chain uses `tcp_proxy` (just pipes bytes to a cluster; no HTTP awareness).

## Filter-chain matching (one listener, many behaviors)

A single listener can host multiple filter chains and pick one per connection using
`filter_chain_match`. The most common match key is **SNI** — the hostname the client requested
inside the TLS handshake (Server Name Indication). This is how one `:443` listener serves
different certs/backends for `api.example.com` vs `www.example.com`:

```yaml
filter_chains:
- filter_chain_match: { server_names: ["api.example.com"] }
  transport_socket: { ...api cert... }
  filters: [ ...route to api backends... ]
- filter_chain_match: { server_names: ["www.example.com"] }
  transport_socket: { ...www cert... }
  filters: [ ...route to web backends... ]
```

Other match keys: destination port, source IP ranges, ALPN protocols. You don't need these yet —
just know that "how does one port serve many sites?" is answered by filter-chain matching on SNI.

## TLS: the `transport_socket`

Where a filter chain *processes* the decoded stream, the **`transport_socket`** controls how
bytes are *encrypted on the wire*. Two directions:

- **`DownstreamTlsContext`** — TLS toward **clients** (Envoy is the TLS *server*; it presents a
  cert). This is **TLS termination**: HTTPS in, decrypted, then plain HTTP to the backend.
- **`UpstreamTlsContext`** — TLS toward **backends** (Envoy is the TLS *client*; it verifies the
  backend's cert). This is **TLS origination** — used when the backend requires HTTPS, and it's
  the basis of mesh **mTLS** (Module 09), where both directions use certs.

Default (no transport socket) is plaintext, which is what Lab 02 used.

## Lab: terminate TLS at Envoy

We'll turn the Lab 02 setup into HTTPS: clients speak TLS to Envoy on `:10000`; Envoy decrypts and
proxies plain HTTP to the echo backend.

### 1. Make a self-signed certificate

First move into this lab's folder (each lab has its own). From the course root:

```bash
cd labs/03-tls          # if you're in another lab, e.g. labs/02-static, use: cd ../03-tls
ls                      # you should see gen-certs.sh, envoy.yaml, docker-compose.yaml
chmod +x gen-certs.sh
./gen-certs.sh          # writes cert.pem and key.pem (CN=localhost, valid 1 year)
```

> If `chmod` says `No such file or directory`, you're not in `labs/03-tls/` — the `ls` above
> should list `gen-certs.sh`. `cd` into the right folder and try again.

Self-signed certs are perfect for learning; real deployments use a CA (Let's Encrypt, an internal
PKI, or — in a mesh — the mesh's own CA).

### 2. Read the TLS bit of the config

The only new thing vs Lab 02 is the **`transport_socket`** on the filter chain
([`envoy.yaml`](../labs/03-tls/envoy.yaml)):

```yaml
filter_chains:
- transport_socket:
    name: envoy.transport_sockets.tls
    typed_config:
      "@type": type.googleapis.com/…v3.DownstreamTlsContext
      common_tls_context:
        tls_certificates:
        - certificate_chain: { filename: /etc/envoy/certs/cert.pem }
          private_key:       { filename: /etc/envoy/certs/key.pem }
  filters:
  - name: envoy.filters.network.http_connection_manager
    ...
```

Everything under `filters:` (the HCM, routes, router) is *identical* to Lab 02 — TLS is a
separate concern layered *under* the HTTP processing. That separation (transport vs application)
is a recurring Envoy theme.

### 3. Run and test

First make sure no earlier lab is still holding port 10000 (only one can use it at a time):

```bash
docker ps                     # if another lab's Envoy is on :10000, stop it first:
# cd ../02-static && docker compose down     # then come back: cd ../03-tls
```

Now start this lab:

```bash
docker compose up
```

If you see `port is already allocated`, another lab is still running — `docker compose down` it,
then `docker compose up` here again.

> **Seeing `curl: (35) ... wrong version number`?** That means you're hitting a *plaintext* server
> on :10000 (usually a previous lab still running) with an `https://` request. Stop the other lab as
> above so this TLS lab owns the port.

Then:

```bash
curl -k https://localhost:10000
# → hello over TLS
```

The `-k` tells curl to accept the self-signed cert (it isn't signed by a trusted CA).

> **macOS gotcha.** Apple's built-in `curl` is built on **LibreSSL**, which can fail the handshake
> with `curl: (35) ... tlsv1 alert protocol version`. That's a client quirk, not an Envoy problem.
> Force TLS 1.2 and it works:
> ```bash
> curl -k --tlsv1.2 --tls-max 1.2 https://localhost:10000
> ```
> Simplest of all is to just open <https://localhost:10000> in a browser and click past the
> self-signed warning.
>
> Installing a modern curl works too, but note Homebrew's curl is **keg-only** — after
> `brew install curl` the plain `curl` command still runs Apple's LibreSSL one (`curl -V` shows
> which). Call the Homebrew build by full path, or put it first on your PATH:
> ```bash
> /opt/homebrew/opt/curl/bin/curl -k https://localhost:10000     # Apple Silicon (Intel: /usr/local/opt/curl/bin)
> # or, for the session:
> export PATH="/opt/homebrew/opt/curl/bin:$PATH"
> curl -V   # should now say OpenSSL, then:  curl -k https://localhost:10000
> ```

Inspect the certificate Envoy presents (this works regardless of the curl quirk):

```bash
curl -kv https://localhost:10000 2>&1 | grep -Ei "subject|issuer|SSL connection"
openssl s_client -connect localhost:10000 -servername localhost </dev/null 2>/dev/null | openssl x509 -noout -subject -dates
```

You'll see the `CN=localhost` cert and that Envoy negotiated TLS. The **backend never saw TLS** —
Envoy terminated it and spoke plain HTTP inward. Confirm in the `docker compose` logs: the backend
logs a normal HTTP request.

### Experiments

1. **Prove termination.** The backend (`hashicorp/http-echo`) only speaks HTTP; yet clients got
   HTTPS. Envoy did the crypto. This is exactly the edge-gateway job: one place holds the certs.
2. **A plaintext request to a TLS port fails cleanly.** `curl http://localhost:10000` (note:
   `http`, not `https`) → curl errors / the connection resets, because the listener expects a TLS
   handshake. Try it to see the difference.
3. **(Optional) HTTP→HTTPS redirect.** Real gateways run a second listener on `:80` whose route
   is a `redirect: { https_redirect: true }`, bouncing plain requests to HTTPS. Skim the routing
   options in Module 04, then you could add it.

## Check yourself

1. What single filter turns a listener into an *HTTP* listener? *(the HTTP Connection Manager;
   swap it for `tcp_proxy` and it's an L4 forwarder.)*
2. How does one `:443` listener serve two different sites with different certs? *(multiple filter
   chains selected by `filter_chain_match` on SNI.)*
3. `DownstreamTlsContext` vs `UpstreamTlsContext`? *(TLS toward clients — Envoy is the server; vs
   TLS toward backends — Envoy is the client.)*
4. What is "TLS termination"? *(Envoy decrypts client HTTPS and forwards plain HTTP upstream.)*
5. Which part of the config handles encryption, and which handles HTTP routing? *(the
   `transport_socket` vs the HCM `filters` — transport vs application, kept separate.)*

---

**Next:** [04 — HTTP routing & filters →](./04-http-routing-and-filters.md)
