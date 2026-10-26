---
title: "What a token is, a primer"
subtitle: "The primer to read before any of the others. What a token is and isn't, the two shapes it comes in, the family of standards everyone calls the J's, where the keys come from, and how to check one without getting burned."
description: "Tokens in plain English. What a token is and what it is not, opaque versus structured, bearer versus sender-constrained, the JOSE family (JWS, JWE, JWK, JWKS, JWA and JWT) one RFC at a time, where verification keys come from, the JWT best practices, the tokens you will actually meet, and the mistakes that show up in production."
date: 2026-10-25
tags: ["identity", "oauth", "jwt", "jose", "jwks", "tokens", "security"]
category: identity
disclosure: guide
slug: "what-a-token-is"
page: true
primer: true
nav: 4
revisions: 15
# 15 (Sun 25 Oct 2026, same push as the client credentials primer.) The three links to /client-credentials/ held at publish are restored. No sentence changed.
status: published
---

>! Series: This is a primer, not a numbered part, and it comes before the other primers. [Client credentials, a primer](/client-credentials/) and Certificates and mTLS, a primer assume you know what a token is and how one is checked. If you do, skip this and go there. [Four questions about any token](/blog/four-questions-about-any-token/) is the post that asks what a token means once you have one.

>! Currency: Correct as of the date at the top. The JOSE family is RFC 7515 to RFC 7519 (May 2015), unchanged apart from the updates RFC 7797 and RFC 8725 make to RFC 7519. The best practices are RFC 8725 (February 2020). The JWT access token profile is RFC 9068 (October 2021). Sections 5, 8 and 9 name the newer documents that build on these.

>! Scope: Normative statements quote the RFCs. Everything else is design guidance and says so. Terms link to the [glossary](#glossary) at the end.

## 1. What a token is

A [token](#g-token) is a piece of data that one system hands to another so that a third system will act on it. Someone proved something, once, to the system that issued the token. The token is what's left of that proof when it travels. The system that receives it didn't see the proof. It sees the token, checks that the token is genuine, and decides from what the token says.

Figure 1 is the whole interaction, starting from the person.

```mermaid A token from first principles. The person proves who they are once, to the issuer. The issuer hands the app a token. The app sends the token to the API, and the API checks it and acts on it, without ever seeing the proof.
sequenceDiagram
  autonumber
  participant U as Person
  participant C as App (the client)
  participant AS as Authorization server (the issuer)
  participant API as API (the resource server)
  U->>C: Opens the app
  C->>AS: Sends the person to sign in
  U->>AS: Proves who they are, once
  AS-->>C: Issues a token to the app
  C->>API: Request, with the token
  API->>API: Checks the token
  API-->>C: Acts on it and answers
  C-->>U: Shows the result
```

Eight steps, and only one of them involves a proof.

1. The person opens the app.
2. The app sends them to the authorization server to sign in.
3. The person proves who they are there, with a password, a passkey, a second factor, whatever that server requires, and does it once.
4. The server hands the app a token.
5. From then on, the app sends the token with every request to the API.
6. The API checks the token.
7. The API acts on what the token says and answers.
8. The app shows the person the result.

The API never saw step 3. It trusts the token because it can check who issued it. Sections 6 to 8 are about how that check works.

That's the whole idea, and it's the one to hold on to, because every standard in this primer is a way to answer one of three questions about it. Who issued this, and is it unchanged? Who is it about and who is it for? What does it allow, and until when?

A boarding pass works the same way. You proved who you were at the counter, with a passport. The gate agent never sees the passport. The gate agent sees the pass, checks that the airline printed it, and reads the seat.

In OAuth and OpenID Connect the issuer is the [authorization server](#g-authorization-server), the thing the token is handed to is a [client](#g-client), and the system that acts on it is an API, which the RFCs call a resource server. The token the client sends to the API is an [access token](#g-access-token). There are others, and section 9 lists them.

## 2. What a token is not

Four things get confused with tokens, and each confusion causes a real bug.

A token is not a password. A password is something a person knows and types, and it's meant to be checked by one system and never shared. A token is issued by a system, meant to be shared with the API it's for, and meant to expire. A token that lives for a year is still not a password. It's a token that, if it ever leaks, does a leaked password's damage for a year, which is why section 11 is firm about lifetimes.

A token is not a [session](#g-session). The two get confused more than any other pair in this primer, and section 3 takes them apart.

A token is not an identity. It's a statement about one, made by one issuer, for one audience, valid for a while. The same person has many tokens at once, from different issuers, saying different things.

And a token is not a permission set. A token can carry a [scope](#g-scope) or a list of roles, but what the API does with them is the API's decision. A later post makes the whole case.

## 3. A session and a token

A session is how a website remembers that you signed in. When you sign in, the server creates a record, the session, with who you are and when you arrived, and gives your browser a random ID for it in a cookie. The browser sends the cookie back with every request to that site, without the page's code doing anything, and the server looks the record up each time. Everything about you lives on the server. The cookie holds a key to it and nothing else.

A token moves the facts out of the server's memory and into the thing that travels. The app that holds it sends it on purpose, in the `Authorization` header, to whichever API it was issued for. The API reads the facts and checks the signature, and it has nothing to look up.

| | Session | Token |
|---|---|---|
| Where the facts live | On the server, in a record | Inside the token, or at the issuer for an opaque one |
| What travels | A random ID, in a cookie | The token itself, in a header |
| Who sends it | The browser, automatically, to one site | The app, deliberately, to the API the token names |
| Who can read it | Only the server that holds the record | Anyone holding a structured token. Only the issuer, for an opaque one |
| How it ends | Delete the record and it's over at once | When it expires. Ending it early takes a lookup at the issuer |
| Where it works | One site, the cookie's domain | Any API the token names, across services and companies |
| What a thief needs | The cookie, or a way to make the browser send it | The token, or the token and its key for a sender-constrained one |

The sixth row depends on the audience, the `aud` claim, and section 6.5 explains how it names an API and how one token can name several. The last row is the bearer question, and section 5 takes it.

The two are used together more often than they're used apart. A web application keeps a session with the browser and holds the tokens for the APIs it calls on its own server, so the browser never sees a token at all. Sometimes the token itself rides in a cookie, and the reason matters, because it looks like the two ideas being mixed up. The case is an application that runs in the browser. Take a reporting dashboard for the ledger. The page loads once from `app.example.org`, and from then on its JavaScript calls `ledger.example.org` directly, one request for the balance, another for the month's entries, another when you click a row. Each of those calls needs the access token from Listing 1, and between clicks the token has to live somewhere in the browser. The usual places a page can store things, local storage and the page's own variables, are readable by any script running on that page, so a token kept there is taken by the first injected script that comes along, an ad library, a compromised dependency, a comment field that wasn't escaped. A cookie marked `HttpOnly` can't be read by script at all. The browser holds it and sends it, and the page's code never touches it. Add `Secure`, so it travels only over TLS, and `SameSite`, so other sites can't make the browser send it on their requests, and the token is harder to steal than it would be anywhere else the page can reach. That's the reason.

It costs two things. The browser now sends the token automatically, which is the session's weakness from the table, so the protections against a tricked browser come with it. And the cookie goes to one site, so this only works for an API on the same site as the page, or for the application's own back end. The cleaner version of the same idea keeps the token on the server. The browser holds an ordinary session cookie, the application's back end holds the tokens and makes the API calls, and no token reaches the browser at all. That's the arrangement from the previous paragraph, and it's what most of the guidance for browser applications now recommends.

One more thing to keep apart. An [opaque](#g-opaque) token, the kind section 4 describes, is not a session, but it resembles a session ID in one respect. Both are a reference to a record kept somewhere else, and both have to be looked up before they mean anything. The resemblance ends there. A session ID is made by the site, sent by the browser in a cookie, and looked up by that same site. An opaque token is made by the issuer, sent by the app in a header to an API, and looked up by that API at the issuer. Which one is in your hand decides how to handle it. A cookie needs protection against the browser being tricked into sending it. A token needs a short life and a careful check.

### 3.1 Stateful and stateless

Stateful means the server has to remember something from an earlier request to handle this one. A session is stateful by definition. The record is the memory, and every server that might receive the next request has to be able to reach it, which is why a web farm keeps its sessions in a shared store or pins each browser to one server.

Stateless means each request carries everything the server needs to handle it. An API that takes structured tokens is stateless with respect to sign-in. It needs the issuer's public key, which is the same for every request and is fetched the way section 7 describes, and nothing about any particular person. Any server can take any request, and adding servers adds nothing to remember. The trade comes up again in section 4. A stateless API can't forget a token before it expires, and a stateful one can end a session at once.

## 4. Two shapes, opaque and structured

Tokens come in two shapes, and which one you're holding decides how you check it.

An [opaque](#g-opaque) token is a random string with no meaning of its own. It's a key to a record the issuer keeps. The API can't read it. To learn anything the API asks the issuer, and RFC 7662 defines that question, [token introspection](#g-introspection). The upside is that the issuer stays in control. The token can be ended at the issuer and the next introspection says so. The downside is a network call for every request, to a server that has to be up. When the issuer isn't run by the team that runs the API, a different company's sign-in service, say, that call crosses a network boundary, someone else's rate limits and someone else's uptime, and it can be slow, and expensive per call. APIs that take opaque tokens cache the answer for a short while to blunt that, at the cost of being that much slower to notice that a token was ended.

A structured token carries its facts inside it, signed by the issuer. The API reads the facts and checks the signature with the issuer's public key, with no call to anyone. The upside is speed and independence. The downside is that the issuer has let go. Once a structured token is out, it's valid until it expires, wherever it is, whatever has happened since.

Almost every structured token you'll meet is a [JWT](#g-jwt), and the J's in section 6 are the standards that define it. Neither shape is better. Opaque tokens suit a browser session at one site. Structured tokens suit APIs called by many services. Plenty of systems issue both, an opaque token to the browser and a structured one to the services behind it.

## 5. Bearer, and the alternative

Most tokens are [bearer tokens](#g-bearer). RFC 6750 defines the term. "A security token with the property that any party in possession of the token (a "bearer") can use the token in any way that any other party in possession of it can." Cash works like this. Whoever holds it, spends it.

It's sent in one header, and Listing 1 shows it, the whole token, three base64url parts joined by two dots. Section 6 takes it apart.

Listing 1: A bearer token on an API call
```http
GET /accounts/42 HTTP/1.1
Host: ledger.example.org
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6ImF0K2p3dCIsImtpZCI6IjIwMjYtMTAifQ.eyJpc3MiOiJodHRwczovL2FzLmV4YW1wbGUub3JnIiwic3ViIjoidS03ZjNhIiwiYXVkIjoiaHR0cHM6Ly9sZWRnZXIuZXhhbXBsZS5vcmciLCJjbGllbnRfaWQiOiJiaWxsaW5nLXJlY29uY2lsZXIiLCJzY29wZSI6ImxlZGdlcjpyZWFkIiwiaWF0IjoxNzkyOTUxMjAwLCJleHAiOjE3OTI5NTIxMDAsImp0aSI6IjlkMWIyYTdjLTRlMGYtNGM3YS05YTNlLTZiMWYxZDhjMmU1NSJ9.RzYDPI6MY5K-c80ER8ORKgGMhuOjCpSQjOaA98Vz1qozFMR0e1okjq9lyM8YTOFUVCvfxsykRHu5E4YCOCMYRdOj0m7iB-jeF4VarQmrkIEjPPN376StEpooOZ1GKCz11pvzUANKQFzXj07IHj0KLzDWHoDXdqiSM790_FQta24T03-z1AeDaknTSTs3YupivjQGmo6HbkezrmkZnqW0CjibQ3ZwpVboXaHpmbp4cvifCvk3eghePR_ibOsKlSQc8kZHIucUKdFSbk9umX6QJAh1TZHLUvmCFzdN94pz6yYoplxKjAEWUI_goR76-cM6V817PbrS2BZ0EGns8yi_ng
```

The header is called `Authorization`, and the name trips people up, because section 2 just said a token isn't a permission set. The name is older than OAuth. HTTP has had an `Authorization` header since the nineties, and the HTTP specification defines it as the place where a request carries its credentials. RFC 9110, section 11.6.2, says the header "allows a user agent to authenticate itself with an origin server". So the header is named for what the server does with what's in it, decide whether the request may go ahead, and not for what it carries. HTTP Basic put a username and password in it. A bearer token goes in the same slot, with the scheme name `Bearer` in front so the server knows how to read what follows. Read the header as "the credentials for this request" and the name stops getting in the way.

Everything about handling a bearer token follows from the definition. Send it only over TLS, because anyone who reads it can use it. Keep it short-lived, because anyone who steals it can use it until it expires. Don't log it. Don't put it in a URL, because URLs end up in logs.

The alternative is a [sender-constrained](#g-sender-constrained) token. The token is tied to a key the client holds, and the API checks that whoever is presenting the token also holds the key. A stolen token is then useless on its own. Two standards do this. RFC 8705 ties the token to the client's TLS certificate, and RFC 9449, called DPoP, ties it to a key the client proves with a signed header on each request. Both record the binding in the token as a `cnf` claim, from RFC 7800. Certificates and mTLS, a primer covers the certificate side.

The question to ask of any token is how bad it is if this one is stolen. If the answer is bad enough, constrain it.

## 6. The J's

Here is the family. The acronyms arrive in a cluster and people treat them as one thing. They're five documents, each with one job, published together in May 2015.

| Acronym | RFC | What it defines, in one line |
|---|---|---|
| JOSE | none, it's the working group | JSON Object Signing and Encryption. The name of the family, and of the IETF group that wrote it. |
| JWS | RFC 7515 | How to sign any content and carry the signature next to it, using JSON for the header. |
| JWE | RFC 7516 | How to encrypt any content and carry what's needed to decrypt it, using JSON for the header. |
| JWK | RFC 7517 | How to write a cryptographic key as a JSON object. A JWK Set, or JWKS, is a list of them. |
| JWA | RFC 7518 | The names of the algorithms the others can use, such as `RS256` and `ES256`. |
| JWT | RFC 7519 | A set of claims as a JSON object, carried inside a JWS or a JWE. |

The order matters. JWS and JWE are the containers. JWK is how you describe the keys. JWA is the list of algorithm names. JWT is the one thing most people meet, and it's the smallest of the five, because it only says what goes in the payload and what the standard claim names mean.

### 6.1 JWS, the signed container

RFC 7515 opens with the job. "JSON Web Signature (JWS) represents content secured with digital signatures or Message Authentication Codes (MACs) using JSON-based data structures." The content can be anything. A JWS has three parts, a header saying how it was signed, the payload, and the signature. In the form you'll see in headers and URLs, the compact serialization of section 7.1 of RFC 7515, the three parts are base64url encoded and joined with dots.

```text
BASE64URL(UTF8(JWS Protected Header)) || '.' || BASE64URL(JWS Payload) || '.' || BASE64URL(JWS Signature)
```

Two header fields matter most. `alg` names the algorithm, and the RFC says of it, "This Header Parameter MUST be present and MUST be understood and processed by implementations." `kid` is the key ID, and the RFC calls it "a hint indicating which key was used to secure the JWS." Section 7 is about what to do with that hint.

There's a second form, the JSON serialization of section 7.2 of RFC 7515, which allows several signatures on one payload. You'll rarely see it in identity work.

### 6.2 JWE, the encrypted container

RFC 7516 is the same idea for secrecy. "JSON Web Encryption (JWE) represents encrypted content using JSON-based data structures." Its compact form has five parts rather than three, a header, an encrypted key, an initialization vector, the ciphertext and an authentication tag. A signed token can be read by anyone who holds it. An encrypted one can't. Most access tokens are signed and not encrypted, which is why section 11 says not to put secrets in them. ID tokens are encrypted more often, when the identity provider and the application agree to it.

### 6.3 JWK and JWKS, the keys

RFC 7517 says what a JWK is. "A JSON Web Key (JWK) is a JavaScript Object Notation (JSON) data structure that represents a cryptographic key." One member is mandatory, `kty`, the key type. Most carry a `kid` too, and the RFC says the `kid` "parameter is used to match a specific key." That's the other half of the hint in the JWS header.

A JWK Set is a JSON object with one required member. "The JSON object MUST have a "keys" member, with its value being an array of JWKs." Listing 2 is a JWKS with two keys in it, which is what you see during a key rotation.

Listing 2: A JWK Set with the current key and the next one
```json
{
  "keys": [
    {
      "kty": "RSA",
      "use": "sig",
      "alg": "RS256",
      "kid": "2026-10",
      "n": "nTz2ngHF3wgIkP_zr7QvLwMeNmSeHdYDeJ9lx6F525bAeSw9CjHY...",
      "e": "AQAB"
    },
    {
      "kty": "RSA",
      "use": "sig",
      "alg": "RS256",
      "kid": "2026-11",
      "n": "xjlCRBqkP2cFkB2sCeuaVs3f0Zn9dKMnwWq3UxCqyEVYs2ThRlk...",
      "e": "AQAB"
    }
  ]
}
```

Only public keys are published this way. A JWK can hold a private key, and RFC 7518 defines the members for it, but a JWKS you fetch from an issuer must never contain one.

### 6.4 JWA, the algorithm names

RFC 7518 is a list. It gives the names the `alg` and `enc` header fields can hold and what each one means, `RS256` for RSA with SHA-256, `ES256` for ECDSA with the P-256 curve, `HS256` for an HMAC with a shared secret, and so on. It also registers `none`, the algorithm that means no signature at all, and that one name has caused more than its share of incidents. Section 8 says what to do about it.

For the question of which to pick, this is guidance, not the RFC. An asymmetric algorithm, `RS256` or `ES256`, lets the issuer sign with a private key and publish the public key, so the API never holds anything secret. `HS256` means the API holds the same secret the issuer signs with, so every API that checks the token could also forge one. Use it only when the issuer and the checker are the same system.

### 6.5 JWT, the claims

RFC 7519 defines the one you'll meet. "JSON Web Token (JWT) is a compact, URL-safe means of representing claims to be transferred between two parties." And it says what the payload is. "JWTs represent a set of claims as a JSON object that is encoded in a JWS and/or JWE structure."

That sentence settles a question that comes up in design reviews. A JWS can carry any payload, a protobuf message, a PDF, anything. The moment the payload isn't a JSON object of claims, it isn't a JWT. It's a JWS. Sign a protobuf and you have a signed protobuf, not a JWT, and most JWT libraries will refuse it. The CBOR world has its own answer, RFC 8392, the CBOR Web Token, which is "a compact means of representing claims to be transferred between two parties" with CBOR in place of JSON and COSE in place of JOSE.

A [claim](#g-claim) is one fact, a name and a value. RFC 7519 registers seven, and every other standard builds on them.

| Claim | Name | What RFC 7519 says it does |
|---|---|---|
| `iss` | [Issuer](#g-issuer) | "identifies the principal that issued the JWT" |
| `sub` | Subject | "identifies the principal that is the subject of the JWT" |
| `aud` | [Audience](#g-audience) | "identifies the recipients that the JWT is intended for" |
| `exp` | Expiration time | "identifies the expiration time on or after which the JWT MUST NOT be accepted for processing" |
| `nbf` | Not before | "identifies the time before which the JWT MUST NOT be accepted for processing" |
| `iat` | Issued at | "identifies the time at which the JWT was issued" |
| `jti` | JWT ID | "provides a unique identifier for the JWT" |

Two of those get mixed up more than the rest, `sub` and `aud`, because both answer a "who" question. The subject is who the token is about. The audience is who the token is for. In Listing 5 the subject is `u-7f3a`, a person, and the audience is `https://ledger.example.org`, an API. The person never checks the token, and the API never appears in the subject. When there's no person, as in the client credentials case, the subject is the service the token was issued to, and the audience is still the API it was issued for. A token with the same value in both would be a system talking about itself to itself, which happens, and it's the exception that makes the rule easy to remember. 

Here is how the audience names an API. The value of `aud` is the API's own name, usually its URL. The token in Listing 5 says `"aud": "https://ledger.example.org"`, so the ledger API accepts it and every other API refuses it. RFC 7519 puts the rule on the receiving side. "Each principal intended to process the JWT MUST identify itself with a value in the audience claim." If the API's name isn't there, the token is rejected. A session, from section 3, has nothing like this. The cookie goes to the site that set it, and that's the whole addressing scheme.

One token can name several APIs, because the audience can be a list. RFC 7519 says that "In the general case, the "aud" value is an array of case-sensitive strings", and that when there's one audience it "MAY be a single case-sensitive string". A token with `"aud": ["https://ledger.example.org", "https://reports.example.org"]` is good at both, and each one checks for its own name. That's convenient and it widens the blast radius if the token leaks, so the usual advice is one audience per token, and a client that needs two APIs asks for two tokens. RFC 8707 gives the client a way to say which API it wants a token for, a `resource` parameter on the request.

Across companies works the same way. The API doesn't have to belong to the issuer. It has to know the issuer's name, hold the issuer's public key, and find its own name in the audience. A vendor's API can accept a token from your company's sign-in service on exactly those terms, and that arrangement, one party issuing and another accepting, is what federation means.

Listing 3 is the token from Listing 1, split at its two dots. The first part is the header, the second the payload, the third the signature. Each is base64url, which is base64 with two characters swapped so it survives in URLs and headers, and with the trailing padding dropped.

Listing 3: The access token from Listing 1, split at its two dots
```text
eyJhbGciOiJSUzI1NiIsInR5cCI6ImF0K2p3dCIsImtpZCI6IjIwMjYtMTAifQ
.
eyJpc3MiOiJodHRwczovL2FzLmV4YW1wbGUub3JnIiwic3ViIjoidS03ZjNhIiwiYXVkIjoiaHR0cHM6Ly9sZWRnZXIuZXhhbXBsZS5vcmciLCJjbGllbnRfaWQiOiJiaWxsaW5nLXJlY29uY2lsZXIiLCJzY29wZSI6ImxlZGdlcjpyZWFkIiwiaWF0IjoxNzkyOTUxMjAwLCJleHAiOjE3OTI5NTIxMDAsImp0aSI6IjlkMWIyYTdjLTRlMGYtNGM3YS05YTNlLTZiMWYxZDhjMmU1NSJ9
.
RzYDPI6MY5K-c80ER8ORKgGMhuOjCpSQjOaA98Vz1qozFMR0e1okjq9lyM8YTOFUVCvfxsykRHu5E4YCOCMYRdOj0m7iB-jeF4VarQmrkIEjPPN376StEpooOZ1GKCz11pvzUANKQFzXj07IHj0KLzDWHoDXdqiSM790_FQta24T03-z1AeDaknTSTs3YupivjQGmo6HbkezrmkZnqW0CjibQ3ZwpVboXaHpmbp4cvifCvk3eghePR_ibOsKlSQc8kZHIucUKdFSbk9umX6QJAh1TZHLUvmCFzdN94pz6yYoplxKjAEWUI_goR76-cM6V817PbrS2BZ0EGns8yi_ng
```

Listings 4 and 5 decode the first two parts. Each shows the part as it travels, then what it says once the base64url is undone. Anyone can do this. Decoding is not verifying, and section 8 is about the difference.

Listing 4: The first part, the header, and what it decodes to
```text
eyJhbGciOiJSUzI1NiIsInR5cCI6ImF0K2p3dCIsImtpZCI6IjIwMjYtMTAifQ

{
  "alg": "RS256",
  "typ": "at+jwt",
  "kid": "2026-10"
}
```

Listing 5: The second part, the payload, and what it decodes to
```text
eyJpc3MiOiJodHRwczovL2FzLmV4YW1wbGUub3JnIiwic3ViIjoidS03ZjNhIiwiYXVkIjoiaHR0cHM6Ly9sZWRnZXIuZXhhbXBsZS5vcmciLCJjbGllbnRfaWQiOiJiaWxsaW5nLXJlY29uY2lsZXIiLCJzY29wZSI6ImxlZGdlcjpyZWFkIiwiaWF0IjoxNzkyOTUxMjAwLCJleHAiOjE3OTI5NTIxMDAsImp0aSI6IjlkMWIyYTdjLTRlMGYtNGM3YS05YTNlLTZiMWYxZDhjMmU1NSJ9

{
  "iss": "https://as.example.org",
  "sub": "u-7f3a",
  "aud": "https://ledger.example.org",
  "client_id": "billing-reconciler",
  "scope": "ledger:read",
  "iat": 1792951200,
  "exp": 1792952100,
  "jti": "9d1b2a7c-4e0f-4c7a-9a3e-6b1f1d8c2e55"
}
```

The third part doesn't decode to anything readable. It's the signature, 256 bytes for `RS256`, and the only thing to do with it is check it, which is section 8.

The `typ` header is worth a word. RFC 7519 says that if it's present "it is RECOMMENDED that its value be "JWT"", and that the parameter "is ignored by JWT implementations; any processing of this parameter is performed by the JWT application." Later standards tightened that. The access token above says `at+jwt`, from RFC 9068, and section 8 explains why an API should insist on it.

## 7. Where the keys come from

To check a signature the API needs the issuer's public key, and it has to get the right one without a human copying it around. The chain is short.

The issuer publishes a metadata document at a well-known address. For OAuth it's RFC 8414, for OpenID Connect it's OpenID Connect Discovery, and both include a field named `jwks_uri`. That URL serves the JWK Set from section 6.3. The API fetches the metadata once, fetches the JWKS, and keeps it.

When a token arrives, the API reads `kid` from the JWS header and picks the key with the matching `kid` from the set. If no key matches, the API fetches the JWKS again, once, because the issuer may have rotated. If there's still no match, the token is rejected.

That's how rotation works without downtime. The issuer adds the next key to the JWKS before it starts signing with it, which is why Listing 2 has two keys. APIs pick it up on their next fetch. The issuer switches signing to the new key. The old key stays published until every token signed with it has expired, then it's removed. The API side has three rules, and they're guidance, not spec. Cache the JWKS, but not forever. Refetch on an unknown `kid`, but rate-limit that refetch, because an attacker can send unknown `kid` values all day. Never accept a key that came from inside the token, which is the subject of the next section.

## 8. Checking one correctly

RFC 8725 is the JWT best current practice, and it exists because the format gives you enough freedom to hurt yourself. The checks below are what an API must do before trusting a single claim, and the RFC is quoted where it's normative.

Decide the algorithms first, then verify. The library must not take the algorithm from the token. RFC 8725 section 3.1, "Perform Algorithm Verification", says "Libraries MUST enable the caller to specify a supported set of algorithms." Pass that list. The reason is the `none` algorithm from section 6.4 and its cousins. Section 2.1 of the RFC describes the attack in one sentence. "The algorithm can be changed to "none" by an attacker." Older libraries then accepted the token with no signature. A related trick swaps `RS256` for `HS256` and uses the issuer's public key, which is public, as the HMAC secret. Fixing the algorithm list defeats both.

Verify the signature with a key that belongs to the issuer, found as section 7 describes. Section 3.8 of the RFC says "the application MUST validate that the cryptographic keys" belong to the issuer, and otherwise "the application MUST reject the JWT." A `jku` or `jwk` header inside the token that points at a key is not that. The token can't vouch for its own key.

Check `iss`. It must be the issuer you configured, as a whole string, not a prefix match. If the API trusts more than one issuer, it has to read `iss` before verifying, to know which key set to look in, and then check it again afterward against the verified claims. The first read picks a key set. Only the second read is trusted.

Check `aud`. Section 3.9 of the RFC says "the relying party or application MUST validate the audience value", and a token whose audience is another API is not yours, however valid its signature. This is the check that stops a token meant for one service being replayed at another.

Check `exp`, and `nbf` if present, against the clock, with a small allowance for [clock skew](#g-clock-skew). A minute is common. Ten minutes is a hole.

Check `typ`. Section 3.11 of the RFC, "Use Explicit Typing", starts with the problem. "Sometimes, one kind of JWT can be confused for another." An ID token and an access token from the same issuer are both valid JWTs with the same signature. RFC 9068 closes it for access tokens. "The resource server MUST verify that the "typ" header value is "at+jwt" or "application/at+jwt"" and reject anything else. Section 3.12 of RFC 8725 generalizes it. When one system accepts more than one kind of JWT, "the validation rules for those JWTs MUST be written such that they are mutually exclusive."

Only then read `scope`, `sub` and the rest, and decide.

Everything before the last step is about whether the token is genuine and meant for you. Reading claims from a token you haven't verified is reading what an attacker typed.

## 9. The tokens you'll meet

These are the tokens you'll meet in OAuth and OpenID Connect work, and most are JWTs or could be.

| Token | Defined in | Who issues it, who reads it, what it's for |
|---|---|---|
| [Access token](#g-access-token) | RFC 6749, with the JWT profile in RFC 9068 | The authorization server issues it, the API reads it. It says who, which API, what's allowed and until when. RFC 9068 requires `iss`, `exp`, `aud`, `sub`, `client_id`, `iat` and `jti`. |
| [ID token](#g-id-token) | OpenID Connect Core | The identity provider issues it, the application that asked for login reads it. It says who signed in and how. It's for the application, never for an API. |
| [Refresh token](#g-refresh-token) | RFC 6749, section 6 | The authorization server issues it to the client, and only the authorization server ever reads it. The client trades it for a new access token. Usually opaque. |
| Client assertion | RFC 7523 | The client signs it to prove who it is at the token endpoint. A JWT the client makes about itself. [Client credentials, a primer](/client-credentials/) covers it. |
| Exchanged token | RFC 8693 | A client holding one token asks for another, for a different audience. RFC 8693 token exchange. |
| Transaction token | draft, OAuth working group | A short-lived JWT that carries the user and the request context across services inside one call. Transaction tokens. |
| SAML assertion | SAML 2.0 | The older federation format, XML and signed. The same job as an ID token, from before JSON. |
| CWT | RFC 8392 | A JWT for constrained devices, in CBOR. |

Two more standards sit beside these and answer the question from section 4, how a structured token ends before it expires. RFC 7009 is token revocation, where the client tells the authorization server to end a token. RFC 7662 is introspection, where an API asks whether a token is still good. Both work for opaque tokens by nature. For a JWT, revocation only has effect at an API that introspects, which gives back the network call the JWT was meant to remove. The practical answer is short lifetimes. An access token that lives fifteen minutes doesn't need revoking.

## 10. How big a token gets

A token travels on every request, so its size is paid for on every request, and it's a real problem rather than a theoretical one. The token in Listing 1 is about 700 characters, and it's a small one. Base64url adds a third to whatever goes in. The `RS256` signature alone is 342 characters with a 2048-bit key, which is one reason people pick `ES256`, whose signature is 86. And the payload grows with every claim someone adds, which is where the trouble starts.

The claim that grows is almost always a list. Groups, roles, entitlements, tenant memberships. A person in a large company can belong to hundreds of groups, and a token that lists them all runs to tens of kilobytes. Then it meets a limit. Web servers, proxies and load balancers cap the size of a request header, and the common defaults sit between eight and sixteen kilobytes. A token that crosses the line produces a request that fails before it reaches any code you wrote, with a status like 431 or 400 and a log line nobody connects to a group membership change. A token kept in a cookie meets a tighter limit, since browsers allow about four kilobytes per cookie. Identity providers know this, and the large ones stop listing groups past a threshold and put a marker in the token that says the list was too long, fetch it separately.

The fix is the one the post on why a token is not a permission set argues for. The token says who, and coarsely what. It doesn't carry the whole permission model. The API looks up fine-grained permissions from a source it owns, keyed by the subject, which keeps the token small and keeps the permissions current without reissuing anything. Scopes, a few names the API understands, belong in the token. A list of every group the person has ever been added to does not. Where a large payload is unavoidable, keep it off the wire. The gateway at the edge takes an opaque token from outside, exchanges it for the full structured token, and passes that to the services inside, so the big token never crosses the internet or a browser's cookie jar. RFC 8693 token exchange is the mechanism.

## 11. Where it goes wrong

These are the mistakes that reach production, in guidance form.

Decoding and calling it verifying. A token's payload is readable by anyone, so a service can read `sub` and `scope` without checking anything. Some do. Section 8 is the fix.

Secrets in the payload. A signed JWT is not encrypted. Anything in it is visible to the user holding it, to every proxy that logs it, and to anyone who finds the log. If a fact must be hidden, encrypt the token with JWE or leave the fact at the issuer and use an opaque token.

An ID token used as an access token. It's a JWT, it has a `sub`, and the API accepts it. The ID token's audience is the application, not the API, so the `aud` check in section 8 rejects it, if that check exists.

Trusting `alg` from the token. The `none` attack and the key confusion attack from section 8. Still found in code written against old library versions.

A JWKS fetched once at startup. The issuer rotates, the API rejects every token, and the fix is a restart at two in the morning. Section 7 is the pattern.

Lifetimes set for convenience. A bearer token that lives for a day is a day of free access for whoever steals it. Short access tokens and a refresh token the client keeps safely is what the refresh token was invented for.

Checking `iss` by prefix. An issuer value is a URL, and `https://as.example.org.attacker.net` starts with the right string.

A clock skew allowance that grew. Someone's test failed on a slow machine, the allowance went from one minute to one hour, and expired tokens now work for an hour.

## 12. Where this leads

With this in hand, the rest of the primer set reads in order. [Client credentials, a primer](/client-credentials/) is how a service with no user gets a token for itself and what that token says. Certificates and mTLS, a primer is the other way a party proves who it is, and the basis for sender-constrained tokens. [Four questions about any token](/blog/four-questions-about-any-token/) asks what a token means once you've verified it, and RFC 8693 token exchange is what happens when one token has to become another.

## Glossary

| Term | Meaning in this primer |
|---|---|
| {#g-access-token}Access token | What a client sends to an API to be let in. Short-lived. It says who it's about, which API it's for, what it allows and until when. Site glossary, [Access token](/glossary/#access-token). |
| {#g-audience}Audience | Who a token is for. The party named there is the only one that should accept it. The `aud` claim. Site glossary, [Audience](/glossary/#audience). |
| {#g-authorization-server}Authorization server | The system that issues tokens after someone or something has proved what it needed to. Also called the issuer. Site glossary, [Authorization server](/glossary/#authorization-server). |
| {#g-bearer}Bearer token | A token that works for whoever holds it. RFC 6750. Site glossary, [Bearer token](/glossary/#bearer-token). |
| {#g-claim}Claim | One fact a token asserts, written as a name and a value. Site glossary, [Claim](/glossary/#claim). |
| {#g-client}Client | OAuth's word for any software that asks the authorization server for tokens and presents them. Site glossary, [Client](/glossary/#client). |
| {#g-clock-skew}Clock skew | The difference between two systems' clocks. Expiry checks allow a little of it. Site glossary, [Clock skew](/glossary/#clock-skew). |
| {#g-cbor}CBOR | Concise Binary Object Representation. A binary encoding of the same kinds of data JSON holds, smaller and faster to parse, for devices with little memory or bandwidth. RFC 8949. |
| {#g-cose}COSE | CBOR Object Signing and Encryption. The JOSE idea for CBOR, how to sign and encrypt CBOR data. RFC 9052 and RFC 9053. |
| {#g-cwt}CWT | CBOR Web Token. The JWT idea for constrained devices, with CBOR for the encoding and COSE for the signing. RFC 8392. |
| {#g-id-token}ID token | The JWT an identity provider issues to an application to say who signed in. For the application, never for an API. Site glossary, [ID token](/glossary/#id-token). |
| {#g-introspection}Introspection | An API asking the authorization server whether a token is good and what it says. RFC 7662. The way an opaque token is read. |
| {#g-issuer}Issuer | Who made and signed the token. The `iss` claim. Site glossary, [Issuer](/glossary/#issuer). |
| {#g-jose}JOSE | JSON Object Signing and Encryption. The family name for JWS, JWE, JWK, JWA and JWT, and the IETF working group that wrote them. |
| {#g-jwa}JWA | JSON Web Algorithms. The list of algorithm names the `alg` and `enc` headers may use. RFC 7518. |
| {#g-jwe}JWE | JSON Web Encryption. The encrypted container, five base64url parts joined by dots. RFC 7516. |
| {#g-jwk}JWK | JSON Web Key. A cryptographic key written as a JSON object. RFC 7517. |
| {#g-jwks}JWKS | JWK Set. A JSON object whose `keys` member is a list of JWKs. What an issuer publishes at its `jwks_uri`. Site glossary, [JWKS](/glossary/#jwks). |
| {#g-jws}JWS | JSON Web Signature. The signed container, three base64url parts joined by dots. RFC 7515. |
| {#g-jwt}JWT | JSON Web Token. A set of claims as a JSON object, carried in a JWS or a JWE. RFC 7519. Site glossary, [JWT](/glossary/#jwt). |
| {#g-opaque}Opaque | Not meant to be read by whoever is holding it. A random string that is a key to a record at the issuer. Site glossary, [Opaque token](/glossary/#opaque-token). |
| {#g-refresh-token}Refresh token | What a client trades for a new access token. Read only by the authorization server. Site glossary, [Refresh token](/glossary/#refresh-token). |
| {#g-scope}Scope | What a token allows, as a list of names the API understands. Site glossary, [Scope](/glossary/#scope). |
| {#g-sender-constrained}Sender-constrained token | A token tied to a key the client holds, so that a stolen copy is useless on its own. RFC 8705 for certificates, RFC 9449 for DPoP. Site glossary, [Sender-constrained token](/glossary/#sender-constrained-token). |
| {#g-session}Session | State a server keeps about a signed-in user, found by a random ID in a cookie. Section 3. Site glossary, [Session and token](/glossary/#session-and-token). |
| {#g-stateful}Stateful, stateless | Stateful means the server must remember something from an earlier request to handle this one. Stateless means the request carries everything the server needs. Section 3.1. |
| {#g-token}Token | Data one system issues, a second one carries, and a third one acts on. Site glossary, [Token](/glossary/#token). |
| {#g-structured}Structured token | A token that carries its facts inside it, signed by the issuer, so the receiver can read and check it without asking anyone. In practice, a JWT. Section 4. |
| {#g-resource-server}Resource server | The RFCs' name for the API that receives the token and acts on it. |
| {#g-identity-provider}Identity provider | The system that signs people in and issues ID tokens. Often the same system as the authorization server. Site glossary, [Identity provider and service provider](/glossary/#identity-provider-and-service-provider). |
