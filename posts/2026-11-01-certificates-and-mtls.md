---
title: "Certificates and mTLS, a primer"
subtitle: "A short primer to read before the SPIFFE post if certificates and TLS are new to you. Part 1 takes a real certificate apart and explains the chain above it and the trust model behind it. Part 2 is what each side of a mutual TLS handshake learns about the other, what it doesn't learn, and the four places the idea goes wrong in production."
description: "Certificates and mutual TLS in one sitting. A certificate binds a public key to a name under a signer you chose to trust; a real one, decoded field by field; the chain of signatures above it and how a verifier walks it; why a browser trusts well over a hundred roots and a workload should trust one. Then the handshake, which proves the other side holds the private key for the certificate it presented, once, at the start of the connection, and the four places that guarantee is misread in production."
date: 2026-11-01
tags: ["identity", "certificates", "x509", "pki", "mtls", "tls", "workload-identity", "security"]
category: identity
disclosure: guide
slug: "certificates-and-mtls"
page: true
primer: true
nav: 5
revisions: 34
status: published
---

>! Series: This is a primer, not a numbered part. It sits in front of mTLS, SPIFFE and SPIRE, part 3 of the identity series, which assumes you know what a certificate is and what a TLS handshake proves. If you do, skip this and go there. Token exchange and transaction tokens, parts 1 and 2, use mutual TLS without opening it up, so if certificates are new to you, read this before them too.

>! Currency: Correct as of the date at the top. TLS 1.3 is RFC 9846, which replaced RFC 8446 in July 2026 without changing the handshake described here, and X.509 is RFC 5280, updated several times and never replaced. TLS quotes are from RFC 9846. The failure modes are from practice, not from a specification.

>! Scope: Normative statements quote the two RFCs. Everything else is design guidance and says so. Terms link to the [glossary](#glossary) at the end, and the SPIFFE vocabulary links to the SPIFFE post's glossary.

## Part 1. Certificates

Everything [mutual TLS](#g-mtls), mTLS for short, proves rests on [certificates](#g-certificate), so this part is about them alone. [TLS](#g-tls) is the encryption that protects a connection between two machines, the S in HTTPS. When a TLS connection opens, before any data moves, one side sends the other its [certificate](#g-certificate), the signed statement of who it is, so the other side can check it before trusting the connection. In ordinary TLS, the kind a browser does with every website, only the server sends one, and the browser checks it. In mutual TLS the client sends one too, and the server checks that. Each side proves itself to the other, and that is the only difference. Part 1 is what one is, a real one taken apart field by field, the [chain](#g-chain) of signatures above it, and the trust model that decides which [chains](#g-chain) you accept. [Part 2](#part-2-mutual-tls) is the [handshake](#g-handshake), the opening exchange of messages that sets up a TLS connection.

### 1. What is a certificate?

In plain English, a [certificate authority](#g-ca) vouches for a client or a server, that they are who they say they are, and the vouching takes the form of a signed [certificate](#g-certificate). Everything below is the detail of that one sentence.

A [certificate](#g-certificate) is a signed statement that binds a [public key](#g-public-key) to a name. It isn't a secret. It's handed to anyone who connects.

The name is what the [certificate](#g-certificate) says the key belongs to, and it's the thing the other side checks against what it meant to talk to. For a website it's the host name, the part after `https://`, such as `api.example.com`. If you typed `api.example.com` and the [certificate](#g-certificate) that comes back says `api.example.net`, the connection fails, and that failure is what the check is for. For a workload, a service running on a platform rather than a site a person visits, it's an identifier the platform gave it, such as `spiffe://example.org/payments`, and the service on the other end checks that it's talking to payments and not to something pretending to be payments. It is not a person's name. The company's name can appear in a [certificate](#g-certificate) too, and usually does, but the name a verifier matches on is the host name or the workload identifier, and nothing else.

Only the [public key](#g-public-key) is in it, and it came from the owner, not the [CA](#g-ca). The owner makes the key pair itself, before it asks anyone for anything, and the [CA](#g-ca) copies the public half from the request into the [certificate](#g-certificate) exactly as it was sent. A [CA](#g-ca) signs keys. It never makes them for you. The matching [private key](#g-private-key) is never in a [certificate](#g-certificate) and never travels. It stays where the [certificate](#g-certificate)'s owner keeps it, whether a file on the machine, a [hardware module](#g-hardware-module), which is a device built to hold keys and never release them, or a key that a small helper program on the same machine, an agent, hands over on request without ever writing it to disk. In the handshake this primer walks through, the only thing it's used for is to sign. The two keys are a pair in the mathematical sense. Anything signed with the [private key](#g-private-key) can be checked with the [public key](#g-public-key), and nothing checked with the [public key](#g-public-key) could have been signed by anyone without the private one. That pairing is what the handshake in section 6 leans on.

The signature on a [certificate](#g-certificate) is the whole point. Anyone can generate a key pair and write a name next to the public half. The [certificate](#g-certificate) is only worth something because a signer you've decided to trust, a [certificate authority](#g-ca), checked that binding and put its own signature on it, and the [validity window](#g-validity-window) says for how long that signature stands. The binding is the pairing of a name with a [public key](#g-public-key). Checking it means two things. The [CA](#g-ca) confirms that whoever is asking holds the [private key](#g-private-key) that matches the [public key](#g-public-key). It does that without ever seeing the private key. The asker makes a request, a small file that says the name it wants and the [public key](#g-public-key) it wants bound to that name, and then signs that file with the [private key](#g-private-key). The [CA](#g-ca) takes the [public key](#g-public-key) out of the request and checks the signature with it. A signature that checks out against a [public key](#g-public-key) can only have been made with the matching private one, and nothing else, so if the check passes, the asker holds the private key. If someone had copied another party's [public key](#g-public-key) into a request, they couldn't sign it, and the check would fail. And it confirms that the asker is entitled to the name, which on the public web means proving control of the domain, and for a workload means the platform that started it vouches for what it is, the way a SPIRE server does before it issues. SPIRE is software that issues [certificates](#g-certificate) to workloads under the SPIFFE naming scheme, and it's what the post after this one is about.

All of that happens once, when the [certificate](#g-certificate) is issued, and it's over before the [certificate](#g-certificate) exists, so before any connection could use it. When a connection opens, the [CA](#g-ca) isn't involved. The two sides exchange [certificates](#g-certificate) the [CA](#g-ca) signed some time ago, and each checks the other's signature against a [CA](#g-ca) [public key](#g-public-key) it already holds. The [CA](#g-ca) could be switched off that morning and every [handshake](#g-handshake) would still work. Issuing is one event. Using is every connection after it. Part 2 is only about the second.

That is all a [CA](#g-ca) checks. It doesn't judge whether the service behind the name is well behaved. A malicious service that controls a name gets a [certificate](#g-certificate) for that name like anyone else, and the [certificate](#g-certificate) says only that this key belongs to this name, signed by this [CA](#g-ca). Who is allowed to do what is decided by the party that reads the name, not by the [CA](#g-ca) that signed it. Part 2 comes back to this, and a later primer on PKI will cover how a [CA](#g-ca) decides whom to issue to.

A [CA](#g-ca) isn't a [certificate](#g-certificate). It's whoever holds a signing key and uses it to sign [certificates](#g-certificate), in practice a piece of software such as a SPIRE server, an organization's [PKI](#g-pki), meaning its own public key infrastructure for issuing [certificates](#g-certificate), or a public [CA](#g-ca)'s issuing system, guarding a [private key](#g-private-key). But to check a [CA](#g-ca)'s signature you need its [public key](#g-public-key), and a [CA](#g-ca) publishes that the same way everyone else does, in a [certificate](#g-certificate) of its own. That's a [CA certificate](#g-ca-certificate). So when this primer says a [certificate](#g-certificate) "is a CA certificate", it means the [certificate](#g-certificate) that carries a [CA](#g-ca)'s [public key](#g-public-key), marked as allowed to sign other [certificates](#g-certificate). The [CA](#g-ca) itself is the thing holding the matching [private key](#g-private-key).

### 2. A real one, decoded

The format is X.509, RFC 5280. Figure 1 shows the parts and who holds which key. Listing 1 is a real [workload](#g-workload) [certificate](#g-certificate) of the kind a SPIRE agent hands a workload, generated for this primer and printed with `openssl x509 -text`. A workload is any running piece of software, a service, a job or a container.

```mermaid What's inside an X.509 certificate, and the two private keys that sit outside it. The certificate carries the owner's public key, the name (the subject and, in modern use, one or more subject alternative names, which is where a DNS name or a SPIFFE ID actually lives), a validity window, extensions that say what the key may be used for, the issuer's name, and the issuer's signature over all of it. The owner made the key pair. The CA only signed. The owner's private key pairs with the public key and never leaves the owner. The certificate authority's private key is what made the signature; it never leaves the CA, and anyone can check the signature with the CA's public key, which comes from the CA's own certificate one step up the chain.
flowchart TB
  subgraph OWN["The owner (a workload or a server)"]
    PRIV["Owner's private key<br/>never sent, used to sign handshakes"]
  end
  subgraph CERT["The certificate (public, sent to anyone who connects)"]
    PK["Owner's public key"]
    NM["Name: subject, and SAN<br/>(a DNS name, or a SPIFFE ID as a URI)"]
    VW["Validity window: not before, not after"]
    EX["Extensions: key usage, extended key usage,<br/>basic constraints (cA)"]
    IS["Issuer name: which CA vouches for this"]
    SG["Signature over everything above"]
    PK --- NM --- VW --- EX --- IS --- SG
  end
  subgraph CA["The issuer (the certificate authority)"]
    CAK["CA's private key<br/>never leaves the CA, used to sign certificates"]
  end
  PRIV -. "is the pair of" .- PK
  CAK -- "made this signature" --> SG
```

Listing 1: A workload [certificate](#g-certificate), decoded
```text
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number: 4096 (0x1000)
        Signature Algorithm: ecdsa-with-SHA256
        Issuer: O = Example Corp, CN = prod.example.org intermediate
        Validity
            Not Before: Oct  3 23:02:36 2026 GMT
            Not After : Oct  4 00:02:36 2026 GMT
        Subject: O = SPIRE
        Subject Public Key Info:
            Public Key Algorithm: id-ecPublicKey
                Public-Key: (256 bit)
                pub:
                    04:9e:97:2f:bc:0b:ce:28:70:1a:d1:7c:b4:9a:aa:
                    16:84:d0:4c:9c:a7:1e:f5:5c:39:bd:6b:13:01:1c:
                    c5:8a:23:00:e2:f3:cf:80:0b:40:fd:f1:82:39:e4:
                    4f:d0:08:e3:6c:78:79:2e:bf:ff:e1:03:95:f6:13:
                    9f:c0:16:21:92
                ASN1 OID: prime256v1
                NIST CURVE: P-256
        X509v3 extensions:
            X509v3 Basic Constraints: critical
                CA:FALSE
            X509v3 Key Usage: critical
                Digital Signature
            X509v3 Extended Key Usage: 
                TLS Web Server Authentication, TLS Web Client Authentication
            X509v3 Subject Key Identifier: 
                6F:5B:61:D2:50:11:4E:D0:E2:9D:31:0D:92:D9:99:26:BD:B5:EA:B4
            X509v3 Authority Key Identifier: 
                53:8C:DA:4E:FD:C2:0B:B3:F6:42:A5:D2:22:12:3A:66:7B:B7:C6:8F
            X509v3 Subject Alternative Name: 
                URI:spiffe://prod.example.org/billing/payments
    Signature Algorithm: ecdsa-with-SHA256
    Signature Value:
        30:45:02:20:72:16:fb:cb:44:68:7b:ed:6b:63:22:ee:46:41:
        4e:8c:8f:c3:21:26:7b:10:41:da:6b:1b:3c:8a:a6:61:43:c3:
        02:21:00:af:17:f7:6a:e7:9c:ec:94:3d:1f:10:75:08:df:f1:
        99:b1:f8:44:9b:74:f8:a5:df:09:f0:b0:28:33:9e:ec:21
```

Read it from the top.

- **Issuer** is the [CA](#g-ca) that signed it, here an [intermediate](#g-intermediate) called `prod.example.org intermediate`. Section 4 follows it upward. In the listing's names, `O` is the organization and `CN` is the [common name](#g-common-name), a human-readable label.
- **Validity** is one hour, from Not Before to Not After. Workload [certificates](#g-certificate) are short-lived on purpose, and section 8 says why that matters.
- **Subject** is `O = SPIRE`, which tells you almost nothing. The identity isn't here. It's at the bottom, in the [SAN](#g-san).
- **Subject Public Key Info** is the owner's [public key](#g-public-key), an [elliptic-curve](#g-elliptic-curve) key on P-256. Elliptic-curve is the kind of mathematics the key pair is built on, and P-256 is the named standard curve it uses. The [private key](#g-private-key) that pairs with it is on the node and appears nowhere in this document.
- **X509v3 extensions** say what the [certificate](#g-certificate) is for, and section 3 takes them one by one. The last of them, **Subject Alternative Name**, is the identity, `spiffe://prod.example.org/billing/payments`, which is the payments service in the `prod.example.org` trust domain, the group of [workloads](#g-workload) that share one signing authority.
- **Signature Algorithm** and **Signature Value** are the [intermediate](#g-intermediate)'s signature over everything in the `Data` block above, made with the [intermediate](#g-intermediate)'s [private key](#g-private-key). Change a single byte of the [certificate](#g-certificate) and it no longer verifies.

### 3. What the extensions say

The extensions are where a [certificate](#g-certificate) says what it's for, and each one in Listing 1 earns its place.

- **Basic constraints** says whether the [private key](#g-private-key) that pairs with the [public key](#g-public-key) in this [certificate](#g-certificate) may be used to sign other [certificates](#g-certificate), through a field spelled `cA`. A [certificate](#g-certificate) never signs anything. Keys sign. The [certificate](#g-certificate) records what its owner's key is allowed to sign, and the [CA](#g-ca) that issued it set that when it signed. Here it's `CA:FALSE`, so the payments service's key can sign handshakes but never another [certificate](#g-certificate). On a [CA certificate](#g-ca-certificate), the [certificate](#g-certificate) a [CA](#g-ca) publishes so others can check its signatures, it's `CA:TRUE`, sometimes with a path length that limits how many [CAs](#g-ca) may sit below it.
- **Key usage** says what the key may sign. `Digital Signature` here, meaning handshakes. A [CA certificate](#g-ca-certificate) says `Certificate Sign` instead.
- **Extended key usage** narrows that to a role, `TLS Web Server Authentication`, `TLS Web Client Authentication`, or both. A workload [certificate](#g-certificate) in mTLS usually carries both, because the same workload is a client on some connections and a server on others.
- **Subject key identifier** and **authority key identifier** are [fingerprints](#g-fingerprint), short values computed from a key that identify it. The first names this [certificate](#g-certificate)'s own key, and the second names the key that signed it. They're how a verifier finds the next [certificate](#g-certificate) up the [chain](#g-chain), and section 4 uses them.
- **Subject alternative name**, the [SAN](#g-san), carries the names the [certificate](#g-certificate) is good for. A DNS name for a web server, a URI with the SPIFFE ID for a workload, the `spiffe://` name at the bottom of Listing 1.

Two of the extensions in Listing 1 are marked `critical`. RFC 5280 says "A certificate-using system MUST reject the certificate if it encounters a critical extension it does not recognize", so a verifier can't skip [basic constraints](#g-basic-constraints) or [key usage](#g-key-usage) by not understanding them. A verifier that ignores the extensions it does understand is worse. It'll accept a client [certificate](#g-certificate) presented by a server, or a [leaf](#g-leaf) being used to sign other [certificates](#g-certificate).

### 4. The chain

Usually there's more than one signature between a [certificate](#g-certificate) and the thing you trust. The authority that signs a workload's [certificate](#g-certificate) is itself certified by a higher authority, and so on up to a [root](#g-trust-anchor) that signs itself. That list, from the [certificate](#g-certificate) you were handed up to the root, is the [certificate chain](#g-chain). The one at the bottom is the [leaf](#g-leaf), the ones in the middle are [intermediates](#g-intermediate), and the root is the [trust anchor](#g-trust-anchor).

Why not have the root sign every [certificate](#g-certificate) directly? Because the root is the one key every verifier trusts outright, and anything that key signs is accepted everywhere. If it signed every workload [certificate](#g-certificate) it would have to be online all the time, reachable by the issuing system, and exposed to everything that system is exposed to. If it leaked, there would be no way to recover short of removing it from every [trust store](#g-trust-store), the set of roots a verifier has chosen to trust, and replacing it, which in a large [estate](#g-estate) is a project measured in months. So the root signs almost nothing. It signs an [intermediate](#g-intermediate), then goes back offline, often into a hardware module in a locked room, and comes out again only to sign the next [intermediate](#g-intermediate). The [intermediate](#g-intermediate) does the daily work. If an [intermediate](#g-intermediate)'s key leaks, you [revoke](#g-revocation) that one [certificate](#g-certificate), declaring it untrusted before it expires, and issue a new [intermediate](#g-intermediate) from the root, and every trust store stays exactly as it was. A [chain](#g-chain) also lets one root sit above several [intermediates](#g-intermediate), one per region, environment or purpose, so a problem in one is contained to the [certificates](#g-certificate) it signed.

Here is the [chain](#g-chain) above Listing 1, from the same three [certificates](#g-certificate).

| Certificate | Subject | Issuer | Own key identifier | Signed by key | Can sign certificates |
|---|---|---|---|---|---|
| Leaf (Listing 1) | `O = SPIRE`, SAN `spiffe://prod.example.org/billing/payments` | prod.example.org intermediate | `6F:5B:61:D2...` | `53:8C:DA:4E...` | No, `CA:FALSE` |
| Intermediate | prod.example.org intermediate | Example Corp Workload Root | `53:8C:DA:4E...` | `FF:DE:44:A3...` | Yes, `CA:TRUE`, path length 0 |
| Root | Example Corp Workload Root | Example Corp Workload Root (itself) | `FF:DE:44:A3...` | its own | Yes, `CA:TRUE` |

Follow the key identifiers across the table. The [leaf](#g-leaf) was signed by key `53:8C...`, and that's the [intermediate](#g-intermediate)'s own key, so the verifier checks the [leaf](#g-leaf)'s signature with the [intermediate](#g-intermediate)'s [public key](#g-public-key). The [intermediate](#g-intermediate) was signed by key `FF:DE...`, which is the root's, so it checks the [intermediate](#g-intermediate)'s signature with the root's [public key](#g-public-key). The root was signed by itself, and the verifier stops there because this root is in the verifier's trust store. A self-signature proves only that whoever made it holds the key, so the root's own signature proves nothing more. That's the whole of [path validation](#g-path-validation). Each link is a signature checked with the key one step up, every [certificate](#g-certificate)'s [validity window](#g-validity-window) is checked on the way, and the walk has to end at a root you already hold.

The [intermediate](#g-intermediate)'s path length of 0 means it may sign [leaves](#g-leaf) and nothing else. If its key leaked, the attacker could mint workload [certificates](#g-certificate) until it's revoked, but couldn't mint another [CA](#g-ca) beneath it.

### 5. The trust model

Which roots you hold is the one input the protocol can't make for you, and it's the whole trust model.

A browser trusts every root in the store it ships with or takes from the operating system. Mozilla's, the one Firefox ships, listed 169 [root certificates](#g-trust-anchor) in the [CCADB](#g-ccadb) report, the Common CA Database's public list, on 1 November 2026, 118 of them trusted for websites and the rest for email only, and the stores behind Chrome, Apple's platforms and Windows each hold well over a hundred. Any one of those roots, and every [intermediate](#g-intermediate) beneath it, can sign a [certificate](#g-certificate) for any name, and the browser will accept it. That's what makes the public web work without anyone arranging trust in advance, and it's also its weakness. One careless or compromised [CA](#g-ca) in the list can issue a [certificate](#g-certificate) for your domain, and the web's answer is to watch rather than to restrict, with Certificate Transparency logs that make every publicly trusted [certificate](#g-certificate) visible so a mis-issued one can be spotted after the fact.

A service inside your own [estate](#g-estate) has no reason to take on that exposure. It should trust exactly one signer, the root that issues [certificates](#g-certificate) for your workloads, and nothing else. When you [federate](#g-federation) with a partner, which means agreeing to accept identities their signer issued, you add their root for their trust domain only and keep it separate, so a [certificate](#g-certificate) is checked against the root for the domain it claims to belong to. A validator that merges every partner's roots into one pool has let every partner sign for your own domain.

[Revocation](#g-revocation) is the last piece. A [certificate](#g-certificate) can be revoked before its window ends, through a [revocation](#g-revocation) list or an online status check, but in practice checks are slow, often skipped, and [fail open](#g-fail-open) when the status service is down, meaning the [certificate](#g-certificate) is accepted unchecked. Workload estates mostly don't rely on them. They make [certificates](#g-certificate) short-lived instead, an hour as in Listing 1, so a [certificate](#g-certificate) that should no longer be trusted stops being valid on its own within the hour. That trade, short lifetimes in place of [revocation](#g-revocation), comes back in section 8.

So the [certificate](#g-certificate) is public, the [chain](#g-chain) says who vouches for it, and the root you chose decides whether that vouching counts. What's left is proving that whoever presents the [certificate](#g-certificate) holds the [private key](#g-private-key). That's the handshake.

## Part 2. Mutual TLS

### 6. What the handshake proves

```mermaid The mutual TLS 1.3 handshake. Each side sends a key share, the public half of a key pair made for this connection only, and from the two shares each side computes the same secret without sending it. Everything after the ServerHello is encrypted with keys derived from that secret. Each side then sends its certificate chain and a CertificateVerify, a signature over the handshake so far made with its long-term private key, and each validates the other's chain against an anchor it chose, checks the name, and checks the signature. The Finished messages confirm both sides derived the same keys and tie the identities to them. No application data flows until both are in.
sequenceDiagram
  autonumber
  participant C as Client
  participant S as Server
  C->>S: ClientHello, with the client's key share
  S-->>C: ServerHello, with the server's key share
  Note over C,S: Each side combines its own one-time private key with the other's share. Same secret on both sides, never sent. Session keys are derived from it, and everything below is encrypted
  S-->>C: EncryptedExtensions, CertificateRequest, Certificate (server chain), CertificateVerify, Finished
  C->>C: Chain to an anchor I chose. Validity window. Name in the SAN is the peer I meant. CertificateVerify checks with the public key in the leaf
  C->>S: Certificate (client chain), CertificateVerify, Finished
  S->>S: Same four checks on the client's chain. Now I know which identity connected
  C->>S: Application request, encrypted with the session keys
  S-->>C: Response
  Note over C,S: Nothing in TLS re-checks either certificate for the life of the connection
```

Two different kinds of key are at work in a handshake, and it helps to keep them apart. The [certificate](#g-certificate)'s key pair is long-lived and proves who you are. It's only ever used to sign. The [session keys](#g-session-keys) are brand new for every connection and protect the traffic. They're only ever used to encrypt. Figure 2 shows where each comes in.

In TLS 1.3 the client opens with a [ClientHello](#g-clienthello) that carries a [key share](#g-key-share), the public half of a key pair the client made a moment ago for this connection and will throw away when it ends. The server answers with a ServerHello carrying its own [key share](#g-key-share). Each side now combines its own one-time [private key](#g-private-key) with the other side's public share, and the mathematics of the exchange, in practice elliptic-curve [Diffie-Hellman](#g-diffie-hellman), a key agreement method named for its inventors, gives both sides the same secret without that secret ever crossing the wire. Both derive the [session keys](#g-session-keys) from it, and from this point on everything in the handshake is encrypted. Those are the "exchanged keys" RFC 9846 refers to below.

Encrypted, but not yet authenticated. So far the client has agreed a secret with someone, but it doesn't yet know with whom. That's what the rest of the handshake is for. The server sends its [certificate chain](#g-chain), a [CertificateVerify](#g-certificateverify), and a [Finished](#g-finished). The [CertificateVerify](#g-certificateverify) is the important one. It's a signature over everything in the handshake so far, made with the server's [private key](#g-private-key), and it's the step that proves possession, because a [certificate](#g-certificate) can be copied but the signature over this particular handshake can't be produced without the key.

The client now does four things in order, and a verifier that skips any of them hasn't verified anything.

1. Build the [chain](#g-chain) from the presented [certificate](#g-certificate) up to a [trust anchor](#g-trust-anchor) the client already holds, checking each signature on the way. RFC 5280 calls this [path validation](#g-path-validation). The anchor has to be one the client already holds in its own trust store before the connection starts. The server sends its [chain](#g-chain), and that [chain](#g-chain) may even include a root, but the client never trusts a root because the server sent it. Anyone can make a root and sign a [certificate](#g-certificate) under it, so a client that accepted whatever root arrived in the handshake would accept anyone. A [chain](#g-chain) that ends at a signer the client didn't already hold is refused. Where the client got that signer is the question, and the answer is that it never came from this connection. It was put there ahead of time, out of band. On the public web the browser or the operating system ships a list of root [certificates](#g-certificate) with the software and updates it with the software, and that list is the [trust store](#g-trust-store). In a private [PKI](#g-pki) the operator puts the root there, as a file on the machine or baked into the container image, or, for a workload, as a bundle the platform hands over along with the workload's own [certificate](#g-certificate), which is what a SPIRE agent does. So the client holds the signer's [public key](#g-public-key) before the first packet, and the server only has to send the [intermediates](#g-intermediate) that sit between its own [certificate](#g-certificate) and that root. Section 5 is about which roots a client should hold.
2. Check the [validity window](#g-validity-window) of every [certificate](#g-certificate) in the [chain](#g-chain) against the current time.
3. Check that the name in the [certificate](#g-certificate) is the name the client meant to reach. On the web that's the DNS name against the [SAN](#g-san). Inside an [estate](#g-estate) it can be a SPIFFE ID in the URI [SAN](#g-san), which is what mTLS, SPIFFE and SPIRE, part 3 of the identity series, is about.
4. Check the [CertificateVerify](#g-certificateverify) signature with the [public key](#g-public-key) from the [leaf](#g-leaf).

Only after all four, and after checking the server's [Finished](#g-finished) against the keys it derived, does the client send its own [Finished](#g-finished), and only after that does it send application data. The server is allowed to send application data as soon as its own Finished is out, before the client's certificate has arrived, which in mutual TLS means sending to a peer it hasn't authenticated yet, so an mTLS server waits. In the words of RFC 9846, section 2, the [Finished](#g-finished) message "provides key confirmation for the shared secrets established in the handshake, binds the endpoint's identity to the exchanged keys". Key confirmation means it proves both sides derived the same [session keys](#g-session-keys), since it's computed with a key taken from the shared secret over everything said so far. Binding the identity means the [certificate](#g-certificate) and [CertificateVerify](#g-certificateverify) that came before it are inside what it covers, so the identity that was proved and the keys that will protect the traffic belong to the same connection and can't be split apart by anyone in the middle. Everything that follows on the connection is encrypted and [integrity-protected](#g-integrity), so any change in transit is detected, with those [session keys](#g-session-keys), which is why what happened in the handshake applies to the whole connection, for better and, as section 8 says, for worse. And because the one-time key pairs are thrown away when the connection closes, a recording of the traffic can't be decrypted later even by someone who steals the [certificate](#g-certificate)'s [private key](#g-private-key). That property is called [forward secrecy](#g-forward-secrecy). RFC 8446 made it the rule and RFC 9846 keeps the sentence, in section 1.3, "Static RSA and Diffie-Hellman cipher suites have been removed; all public-key based key exchange mechanisms now provide forward secrecy." A [cipher suite](#g-cipher-suite) is the named set of algorithms a connection uses, and the static ones the quote mentions reused one long-term key for every connection's key exchange.

Mutual TLS adds one thing. The server includes a [CertificateRequest](#g-certificaterequest), and the client sends its own [chain](#g-chain) and its own [CertificateVerify](#g-certificateverify) before its [Finished](#g-finished), so the server runs the same four checks on the client. At the end of a mutual handshake each side knows the other holds the [private key](#g-private-key) for a [certificate](#g-certificate) that chains to a signer it chose to trust, bearing a name it recognizes. That's the entire guarantee. It's strong because neither half can be faked. A copied [certificate](#g-certificate) can't produce the [CertificateVerify](#g-certificateverify), because the [CertificateVerify](#g-certificateverify) is a signature over this connection's own [handshake](#g-handshake) messages, made with the [private key](#g-private-key), and the thief has the [certificate](#g-certificate), which is public, but not the [private key](#g-private-key), which never left its owner. The verifier checks that signature with the [public key](#g-public-key) inside the [certificate](#g-certificate), and only the matching private key could have made it. A signature captured from some earlier connection is no use either, because the messages it signed included that connection's fresh random values, not this one's. And a [certificate](#g-certificate) from a signer you didn't choose doesn't chain. It's narrower than people assume because it answers one question, which identity opened this connection at the moment it opened, and people read three or four more answers into it. It says nothing about what that caller may do, nothing about which user is behind it, nothing about whether the identity is still good an hour later, and nothing about who was on the far side of a proxy. Section 7 takes those one at a time.

### 7. What it doesn't prove

Four things are routinely read into an mTLS connection that aren't in it.

It doesn't prove authorization. The server knows who connected. Whether that caller may do what it's about to ask is a separate decision, made in policy, keyed on the name the [certificate](#g-certificate) carried. Section 6 of mTLS, SPIFFE and SPIRE puts that decision in two layers, may this workload connect to me at all, enforced before a byte of application data is read, and may it do this thing for this user, decided in the application. A deployment that treats "the handshake succeeded" as "the request is allowed" has one layer where it needs two.

It doesn't identify the user. A client [certificate](#g-certificate) names the software that opened the connection, a service, a [sidecar](#g-sidecar), a gateway. A sidecar is a small proxy deployed beside a service to handle its connections for it. If a human is behind the request, their identity rides inside the request, as an [access token](/client-credentials/#g-access-token) or a transaction token, and is checked separately. Who is calling comes from the connection, and for whom comes from the token. Transaction tokens, part 2 of the series, is about the second half.

It doesn't re-check. The four checks run once, at the handshake. A [certificate](#g-certificate) that expires ten minutes into a connection doesn't end the connection, and a [certificate](#g-certificate) that's revoked an hour in isn't consulted again, because nothing in TLS re-checks the [certificate](#g-certificate) after the [Finished](#g-finished). TLS 1.3 has an optional post-handshake client authentication, where the server asks the client for a certificate again mid-connection, but it runs the same checks on fresh material, almost nothing deploys it, and it never re-checks the server. Section 8 comes back to this.

It doesn't survive a proxy. The guarantee is between the two endpoints of the TLS connection. If something in the middle [terminates](#g-termination) TLS and opens a new connection onward, the thing on the far side has a guarantee about the middle, not about the original client. Section 8 comes back to this too, because it's the failure that catches the most people.

### 8. The four places it goes wrong

**Where TLS terminates.** A load balancer or an [ingress](#g-ingress), the proxy at the edge of a cluster, that [terminates](#g-termination) TLS in front of a service sees the client's [certificate](#g-certificate). The service behind it sees the balancer's. Either the balancer passes the connection through untouched, which is [passthrough](#g-passthrough) and keeps the handshake end to end, or it's itself a workload with its own [certificate](#g-certificate), re-originates mTLS to the backend, and carries the original client's identity some other way, usually a header such as [`X-Forwarded-Client-Cert`](#g-xfcc) that the backend accepts only from that balancer. The header is an assertion by the proxy, not a proof by the client, and the backend's trust in it is exactly as good as its trust in the proxy that set it. A design that doesn't know where its TLS terminates doesn't know who its callers are.

**[Rotation](#g-rotation).** Workload [certificates](#g-certificate) are short-lived, an hour in SPIRE's defaults, and are replaced continuously. New connections use the new [certificate](#g-certificate). Connections that are already open keep the identity they were authenticated with until they close. So a workload whose identity has been revoked, or whose [certificate](#g-certificate) has rotated to a narrower name, lingers on every connection it opened before the change, for as long as those connections live. Long-lived connections, [gRPC](#g-grpc) channels and database pools among them, make [rotation](#g-rotation) a policy question rather than a mechanism. The usual answer is a maximum connection age, after which the client reconnects and the handshake runs again against current material.

**[Pinning](#g-pinning).** [Pinning](#g-pinning) means refusing any [certificate](#g-certificate) except one you've hard-coded. Pin a [leaf](#g-leaf) and the first [rotation](#g-rotation) breaks every client that pinned it, which in a short-lived-certificate world is within the hour. Pin the [trust anchor](#g-trust-anchor) instead, which is the thing that doesn't rotate, or in SPIFFE terms validate against the trust bundle, the set of [CA certificates](#g-ca-certificate) a domain publishes, for the peer's domain and nothing else. Keep the set of signers you accept small, chosen by you, and separate per trust domain, for the reason section 5 gave. One pool of everyone's roots lets everyone sign for you.

**The connection that outlives the credential.** This is the previous three in one sentence. The handshake proved something at a point in time, the connection keeps using that proof for as long as it stays open, and nothing in the protocol asks the question again on its own. For a request-sized connection that's harmless. For a channel that stays open for hours it's a gap between the authority that was checked and the authority that exists now, and it has to be closed outside TLS, by connection age limits, by the server dropping connections when a [revocation](#g-revocation) arrives, or by the application re-checking at its own layer. The same shape appears with user tokens on long-lived connections, and gets its own post.

### 9. A verifier, in plain words

Every mTLS verifier, whether it's a library callback or a proxy's configuration, does these five things in this order. They're the four checks from section 6 plus one that TLS libraries do for you and that a proxy configuration can forget, the key usage check.

1. Build the [chain](#g-chain) from the presented [certificate](#g-certificate) to a [trust anchor](#g-trust-anchor) it chose. Not the operating system's store, not any [CA](#g-ca) that happens to sign, but the anchor for this peer's trust domain and only that one.
2. Check that every [certificate](#g-certificate) in the [chain](#g-chain) is inside its [validity window](#g-validity-window) right now.
3. Check that the name it meant to reach is in the [SAN](#g-san), a DNS name for a web peer, a URI with the SPIFFE ID for a workload peer. The subject field isn't where the name lives.
4. Check that the [key usage](#g-key-usage) and [extended key usage](#g-eku) allow what this [certificate](#g-certificate) is being used for. A [leaf](#g-leaf) isn't a signer, and a server [certificate](#g-certificate) has to be presented by a server.
5. Check the [CertificateVerify](#g-certificateverify) signature with the [certificate](#g-certificate)'s [public key](#g-public-key). That's possession proved.

Then, and only then, it authorizes on the name. May this identity connect to me at all, at the transport, and may it do this particular thing, in the application. Neither question was answered by steps 1 to 5.

Most TLS libraries do steps 1, 2, 4 and 5 for you, and skip step 3 for workloads unless you do it yourself, because by default they compare a DNS name and a SPIFFE ID isn't one. Most proxies do all five steps and then stop, so the authorization that should follow is left to a configuration nobody wrote. Those are the two places to check first when you're reviewing an mTLS deployment. Does it check the name it actually meant to reach, and does anything decide what the caller is allowed to do once the handshake succeeds?

### 10. Where this goes next

The thing this primer leaves open is how a workload gets a [certificate](#g-certificate) with the right name in the first place, how it gets a fresh one every hour without a human in the loop, and how two estates that trust different signers can verify each other. That's mTLS, SPIFFE and SPIRE, part 3 of the identity series. If you came here from it, go back to its section 6. The handshake there is this one with SPIFFE IDs in the names.

## Glossary

| Term | Meaning in this primer |
|---|---|
| {#g-aki}Authority key identifier | An extension naming the key that signed this certificate. It matches the subject key identifier of the issuer's certificate, which is how a verifier finds the next link up the chain. |
| {#g-basic-constraints}Basic constraints | The extension that says whether the private key paired with a certificate's public key may sign other certificates, through a field spelled `cA`, and for a CA how many CAs may sit below it (the path length). Marked critical. |
| {#g-ca-certificate}CA certificate | The certificate a CA publishes so others can check its signatures. It carries the CA's public key and is marked `CA:TRUE` in basic constraints, with key usage `Certificate Sign`. Roots and intermediates are CA certificates. |
| {#g-ca}CA | Certificate authority. Whoever holds a signing key and uses it to sign certificates, in practice software guarding a private key. Not itself a certificate. It publishes its public key in a CA certificate. In a workload estate, the one signer you've chosen to issue your workloads' certificates. In SPIRE, the open-source issuer the SPIFFE post covers, it's the SPIRE server, which holds either the root itself or an intermediate signed by a CA your organization already runs. |
| {#g-ccadb}CCADB | The Common CA Database. A shared record of root and intermediate certificates, run by Mozilla and used by several browser and operating system makers to manage the roots they trust. Its public reports are where the root counts in section 5 come from. |
| {#g-chain}Certificate chain | The list from the certificate you were handed (the leaf) through any intermediates to a root. Verified by checking each signature up the list until you reach an anchor you already hold. |
| {#g-certificate}Certificate | A signed statement binding a public key to a name, with a validity window and extensions, in the X.509 format. Public, and handed to anyone who connects. Site glossary, [Certificate](/glossary/#certificate). |
| {#g-certificaterequest}CertificateRequest | The TLS message a server sends to ask the client for a certificate. Its presence is what makes a handshake mutual. |
| {#g-certificateverify}CertificateVerify | A signature over the handshake so far, made with the sender's private key. The step that proves the sender holds the key for the certificate it presented. A copied certificate can't produce it. |
| {#g-cipher-suite}Cipher suite | A named set of algorithms the two sides of a TLS connection agree to use. Older TLS versions had suites with static RSA or static Diffie-Hellman key exchange, which reused one long-term key for every connection and so had no forward secrecy. TLS 1.3 removed them. |
| {#g-clienthello}ClientHello | The first message of a TLS handshake. Names the TLS versions and encryption algorithms the client supports, and carries add-on fields called extensions, among them the client's key share and the server name it intends to reach. |
| {#g-common-name}Common name (CN) | A free-text name field inside a certificate's subject or issuer, printed as `CN =`. Beside it, `O =` is the organization field. Both are labels for people to read. Verifiers read the name from the SAN. |
| {#g-critical}Critical extension | An extension a verifier must understand. RFC 5280 says a certificate-using system "MUST reject the certificate if it encounters a critical extension it does not recognize". |
| {#g-diffie-hellman}Diffie-Hellman | A key agreement method, named for its inventors. Each side sends a public value and keeps a private one, and both arrive at the same secret, which someone who saw only the public values can't compute. TLS 1.3 usually runs the elliptic-curve version. |
| {#g-elliptic-curve}Elliptic-curve key | A key pair built on elliptic-curve mathematics, which gives the same strength as the older RSA kind of key at a fraction of the size. P-256 is the standard curve used in Listing 1, also printed as `prime256v1`. |
| {#g-estate}Estate | Everything one organization runs, its services, machines, clusters and the networks between them, taken together. Used here for the inside, where you choose the signers and issue the certificates yourself, as opposed to the public web, where the signers are chosen for you by the browser or the operating system. |
| {#g-eku}Extended key usage | The extension that narrows a key to a role, server authentication, client authentication, or both. |
| {#g-fail-open}Fail open | What a check does when it can't get an answer and lets the request through anyway. A revocation check that fails open accepts the certificate when the status service can't be reached. |
| {#g-federation}Federation | Two organizations agreeing to accept workload identities issued by each other's signer. Each adds the other's root for the other's trust domain only. Site glossary, [Federation](/glossary/#federation-and-delegation). |
| {#g-fingerprint}Fingerprint | A short value computed from a key or a certificate, usually a hash, that identifies it. The subject and authority key identifiers are fingerprints of keys. |
| {#g-finished}Finished | The last handshake message from each side. In the words of RFC 9846 it "provides key confirmation for the shared secrets established in the handshake, binds the endpoint's identity to the exchanged keys". The client sends application data only after both. |
| {#g-forward-secrecy}Forward secrecy | The property that a recording of past traffic can't be decrypted even if a long-term private key is stolen later, because the session keys came from one-time key pairs that no longer exist. In TLS 1.3 every key exchange that uses a key share has it. |
| {#g-grpc}gRPC | A widely used remote procedure call framework that runs over HTTP/2. A gRPC channel keeps a connection open and reuses it for many calls, so it can live for hours. |
| {#g-handshake}Handshake | The exchange of messages at the start of a TLS connection, before any application data. In it the two sides agree on the session keys and prove their identities. |
| {#g-hardware-module}Hardware module | A device built to hold private keys and sign with them without ever releasing them, so the key can't be copied off the machine. Often called a hardware security module, HSM for short. |
| {#g-ingress}Ingress | The proxy at the edge of a cluster that receives connections from outside and routes them to the services inside. The name comes from Kubernetes. |
| {#g-integrity}Integrity protection | A check value computed with the session keys and sent with each encrypted record, so the receiver detects any change made in transit and closes the connection. |
| {#g-intermediate}Intermediate | The CA certificate of a CA that sits between the leaf and the root. Signed by the one above it, signs the one below. Present so the root's private key can stay offline. |
| {#g-key-share}Key share | The public half of a one-time key pair each side sends in its hello message. From the two shares both sides compute the same secret without sending it, and the session keys come from that secret. Unrelated to the certificate's keys. |
| {#g-key-usage}Key usage | The extension that says what a key may sign, handshakes (digital signature) or other certificates (certificate sign). |
| {#g-leaf}Leaf | The certificate at the bottom of the chain, the one that names the workload or the server. It can't sign other certificates. The one that rotates. |
| {#g-mtls}Mutual TLS (mTLS) | TLS in which the client presents a certificate too, so each side proves its identity to the other. In ordinary TLS only the server does. Site glossary, [Mutual TLS (mTLS)](/glossary/#tls-and-mutual-tls). |
| {#g-passthrough}Passthrough | A load balancer forwarding the TLS connection untouched (TCP mode), so the handshake happens end to end between the original client and the backend. The alternative to termination. |
| {#g-path-validation}Path validation | RFC 5280's name for verifying a chain. Each signature checked against the key in the certificate above it, every validity window checked, the chain ending at a trust anchor you hold. |
| {#g-pinning}Pinning | Refusing any certificate except one hard-coded in advance. Safe when the pinned thing is a trust anchor, and broken on the first rotation when the pinned thing is a leaf. |
| {#g-pki}PKI | Public key infrastructure. The CAs, certificates, rules and tooling an organization uses to issue and manage certificates. |
| {#g-private-key}Private key | The secret half of a key pair. Never in a certificate, never sent. Stays with its owner, in a file, a hardware module or a key handed over a local socket, and is used only to sign, in the CertificateVerify and when acting as a CA. |
| {#g-public-key}Public key | The half of a key pair that's in the certificate. Checks signatures made with the private key. Not a secret. |
| {#g-revocation}Revocation | Declaring a certificate untrusted before its validity window ends, through a revocation list or an online status check. Often slow or skipped in practice, so workload estates rely on short lifetimes instead. |
| {#g-rotation}Rotation | Replacing a certificate with a fresh one before the old one expires, hourly in SPIRE's defaults. New connections use the new one, but open connections keep the identity they were authenticated with until they close. |
| {#g-self-signed}Self-signed | A certificate whose issuer is itself. A root is self-signed. Its signature proves only that the maker holds the key, and it's trusted only because you put it in your trust store. |
| {#g-session-keys}Session keys | The keys that encrypt and protect one connection's traffic. They're symmetric, which means both sides hold the same key and it both encrypts and decrypts. Derived by both sides from the secret the key shares produced, never sent, and gone when the connection ends. |
| {#g-sidecar}Sidecar | A small proxy deployed beside a service, on the same host, that handles the service's network connections on its behalf, often including mTLS. Site glossary, [Sidecar](/glossary/#sidecar-and-mesh). |
| {#g-san}Subject alternative name (SAN) | The X.509 extension that carries the names a certificate is good for. A DNS name for a web server, or a URI with the SPIFFE ID for a workload. Verifiers read the name from here, not from the subject field. |
| {#g-ski}Subject key identifier | An extension naming this certificate's own key. The authority key identifier of every certificate it signs points back to it. |
| {#g-termination}Termination | A proxy or load balancer ending the client's TLS connection at itself and opening a new one onward. Whatever is behind it sees the proxy's identity, not the client's. |
| {#g-tls}TLS | Transport Layer Security. The protocol that encrypts a connection between two machines and proves the server's identity with a certificate, the S in HTTPS. This primer describes version 1.3. Site glossary, [TLS](/glossary/#tls-and-mutual-tls). |
| {#g-trust-anchor}Trust anchor (root) | The certificate at the top of a chain, self-signed, that nobody vouches for and that you've chosen to trust on your own authority. The one input the protocol can't make for you. |
| {#g-trust-store}Trust store | The set of root certificates a verifier has chosen to trust, kept as a file or a system list. A chain is accepted only if it ends at a root in the store. Browsers and operating systems ship one, and a workload should hold only the root for its own estate. |
| {#g-validity-window}Validity window | The not-before and not-after times in a certificate. Checked for every certificate in the chain at the handshake, and not again. |
| {#g-workload}Workload | A running piece of software, a service, a job or a container, as opposed to a person. In this primer, the thing a workload certificate names. Site glossary, [Workload](/glossary/#workload-and-workload-identity). |
| {#g-xfcc}X-Forwarded-Client-Cert | A header a terminating proxy adds to carry the original client's certificate details to the backend. An assertion by the proxy, trusted exactly as far as the proxy is, and accepted only from it. |
