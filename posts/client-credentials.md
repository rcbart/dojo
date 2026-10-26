---
title: "Client credentials, a primer"
subtitle: "A short primer to read before the token exchange post if you've only met OAuth as a login page. How a service with no user behind it proves who it is and gets a token for itself, what that token says, and where the idea goes wrong."
description: "The OAuth client credentials grant in plain English. The two things the name covers, the one request and one response that make up the flow, the four ways a service proves who it is, what the token says when there's no user in it, why there's no refresh token, and the mistakes that show up in practice."
date: 2026-10-25
tags: ["identity", "oauth", "client-credentials", "service-to-service", "workload-identity", "security"]
category: identity
disclosure: guide
slug: "client-credentials"
page: true
primer: true
nav: 5
revisions: 18
# 18 (Sun 25 Oct 2026, at publish.) Two links to the live token primer, in the Series box and in section 2. nav 4 -> 5 so the token primer lists first. No sentence changed.
status: published
---

>! Series: This is a primer, not a numbered part. Read [What a token is](/what-a-token-is/) first if tokens themselves are new to you. It sits in front of RFC 8693 token exchange, part 1 of the identity series, which measures itself against client credentials and assumes you know what they are. If you do, skip this and go there. Certificates and mTLS, a primer is the other companion, and section 4 here leans on it.

>! Currency: Correct as of the date at the top. The grant is section 4.4 of RFC 6749 (October 2012) and hasn't changed since. The ways a client authenticates come from RFC 6749, RFC 7523, RFC 8705 and OpenID Connect Core. An update to RFC 7523 is in the RFC Editor's queue as draft-ietf-oauth-rfc7523bis-11, and section 4 says what it changes.

>! Scope: Normative statements quote the RFCs. Everything else is design guidance and says so. Terms link to the [glossary](#glossary) at the end.

## 1. What problem does it solve?

Most people meet OAuth without knowing its name. Say you install an expense app and it offers to pull receipts from your mailbox. You click the button, your mail provider's own sign-in page opens, you type your password there, and a screen asks whether the expense app may read your mail. You approve. That's login and consent, and it's all most people ever see of OAuth. The flow exists so that the app can read your mail on your behalf without ever learning your mail password.

What they don't see is the part that matters here. Once you approve, the expense app is handed a token by your mail provider, a short-lived pass the app shows to the mail provider's API every time it fetches a receipt. You never see the token, and the app never sees your password.

A lot of calls have no person in them. Every night at two, a reconciliation job in the billing system reads the day's entries from the ledger API and checks them against the payment processor's report. Nobody is awake, nobody clicked anything, and there's nobody to send to a sign-in page or to ask for approval. The job is the one asking, for itself. The same is true of a service reading its own configuration, or one backend asking another for data it needs for its own work.

OAuth has a flow for that case, and its job is narrow. The service proves who it is to the [authorization server](#g-authorization-server), and the [authorization server](#g-authorization-server) hands back an [access token](#g-access-token) issued to the service itself, saying which service it is, which API it may call and what it may do there, for a short while. The API then checks that token the way it checks any other, and never has to hold the service's secret or know how the service proved itself. That flow is the [client credentials grant](#g-grant), and the reconciliation job is the example this primer follows.

Figure 1 is the whole flow. Notice who isn't in it. There's no person, no sign-in page and no consent screen. The job is both the thing asking and the thing the token is about.

```mermaid The client credentials flow. The reconciliation job proves who it is to the authorization server, gets a token issued to itself, and shows it to the ledger API. No person takes part at any step.
sequenceDiagram
  autonumber
  participant C as Reconciliation job (the client)
  participant AS as Authorization server
  participant API as Ledger API
  C->>C: Starts on its schedule, nobody signed in
  C->>AS: Token request, with its own credentials
  AS->>AS: Checks the credentials
  AS-->>C: Access token, issued to the job
  C->>API: Request, with the access token
  API->>API: Checks the token
  API-->>C: The day's entries
```

Seven steps, and a person appears in none of them.

1. The job starts on its schedule. Nobody signed in.
2. The job sends a token request to the authorization server with its own credentials, a secret or a key it holds. Section 4 is about those.
3. The authorization server checks the credentials.
4. The authorization server issues an access token to the job. The token is about the job, not about any person. Section 5 is about what it says.
5. The job sends its request to the ledger API with the token.
6. The API checks the token, the signature, the issuer, the audience, the expiry, then the scope.
7. The API answers with the day's entries.

Compare that with the expense app. There, the equivalent of step 1 was a person clicking a button and the equivalent of step 3 was that person typing a password on a sign-in page. Here, both are the job acting on its own, and the credential in step 2 belongs to the job itself.

## 2. Two things with one name

The name covers two different things, and most of the confusion starts here.

The first is the credentials. A [client](#g-client) is OAuth's word for any software that asks for tokens, and [client credentials](#g-credentials) are what that software holds to prove which client it is. That can be a secret, a private key or a certificate. A web application that logs users in has client credentials too, and it uses them every time it trades a login for a token.

### Where the credentials come from

Nobody is there to type them in, so where do a service's credentials come from? They're installed in two steps, and both happen before the job ever runs. First, someone registers the client with the authorization server. An administrator does it in the authorization server's console, or a deployment pipeline does it through the server's registration API. Registration creates the client ID, and then one of two things happens, depending on the method from section 4. For a shared secret, the authorization server usually generates the secret and hands it back, once. For the key-based methods the direction is reversed. The client's side generates a key pair where the private key is going to live, keeps the private key there, and hands the server only the public half, as a key in the JWK format from [the token primer](/what-a-token-is/) or as a certificate, or gives the server the address of a key set it publishes. The server never sees the private key. It stores the public key, and that's the thing it will check signatures against. A public key is meant to be known, and it doesn't matter who has it. It can check a signature but it can't make one, so anyone holding it can confirm that a statement came from the job and nobody holding it can forge one. The private key is the only thing that signs, and it never leaves the job.

Second, the secret or the private key is put where the job can read it at startup, and nowhere else. The common shape today is a secrets manager, a store built for this with access control and an audit log. The pipeline writes the secret there once. When the orchestrator starts the job's container, it fetches the secret from the store and hands it to the process as an environment variable or a file mounted into the container, and the job reads it, uses it in the token request, and never writes it anywhere. Rotation runs the same path again. A new secret is registered while the old one still works, the store is updated, the job restarts and picks it up, and then the old secret is deleted at the authorization server. Section 7 comes back to that overlap.

The authorization server's side of this is the other half of the registration. The secrets manager is the job's copy. The authorization server keeps its own, in a client record under the client ID, and that record is what it checks a request against. When a token request arrives, the server reads the client ID out of the request, looks up the record, and compares. For a shared secret the comparison is the one a login does with a password. The server shouldn't keep the secret itself, only a hash of it, and it hashes what the request carried and checks that the two match, so a copy of the server's database doesn't hand an attacker every client's secret at once. For `private_key_jwt` the record holds the client's public key, or the address of a key set the client publishes, and the check is a signature verification. For `tls_client_auth` the record says which name in the certificate, and which issuer it must chain to, counts as this client. Registering the certificate itself is the self-signed variant, `self_signed_tls_client_auth`, in the same RFC. In every case the server is answering one question from its own records, is the thing in this request the credential I registered for this client ID, and nothing in the request is trusted until it has.

For the reconciliation job that means a one-time registration that produced the client ID `billing-reconciler` and a secret, the secret sitting in the secrets manager under a name only the billing deployment can read, and the job finding it in its environment at two in the morning. What it never means is the secret in the source code, in the container image, or in a file checked into the repository, which is where the secret in the password grant primer's `.env` file came from. The hard part of all this is the first step, how the job proves it's allowed to fetch the secret at all. Cloud platforms answer it by giving the workload an identity of its own, which is what the certificates primer and the SPIFFE post are about.

The second thing with the name is the grant. In plain English, a [grant](#g-grant-word) is what a client shows the [authorization server](#g-authorization-server) to justify being given a token. It's the answer to "why should you give me this?"

In a login flow the answer is that a user signed in and approved it, and the client has a one-time code to prove it. OAuth has several of these answers and calls each one a grant type, which is why every token request carries a `grant_type` field.

In the [client credentials grant](#g-grant) the answer is the credentials themselves. The client is saying "give me a token because of who I am". RFC 6749 says they're used this way "typically when the client is acting on its own behalf".

These are the grant types you're most likely to meet, each with its answer.

| Grant type | The answer to "why should you give me this?" | A user is involved? |
|---|---|---|
| Authorization code | A user signed in and approved, and here is the one-time code that proves it. | Yes |
| Refresh token | You gave me a token for this user earlier, and I'm renewing it. | Earlier, not now |
| Device code | A user approved on another device, such as a phone, for this TV or command-line tool. | Yes |
| Client credentials | Because of who I am. | No |
| Token exchange | I hold a valid token, and I need one for a different audience. | Usually, through the token |
| JWT bearer | A party you already trust signed a statement vouching for this request. | Sometimes |

Client credentials is the only one of these with no user anywhere in it.

So there are two steps, and they answer two questions. [Client authentication](#g-client-authentication) answers who is calling. The grant answers what that caller may have. In this flow no user stands between the two, so everything the token allows comes from what the [authorization server](#g-authorization-server)'s own policy gives that client.

## 3. The flow

The whole flow is one request and one response, both at the [token endpoint](#g-token-endpoint). Listing 1 is the request, from a reconciliation job that wants to read a ledger API.

Listing 1: The token request
```http
POST /token HTTP/1.1
Host: as.example.org
Authorization: Basic YmlsbGluZy1yZWNvbmNpbGVyOjdGamZwMFpCcjFLdERSYm5mVmRtSXc=
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&scope=ledger:read
```

Three things are in it.

- **`grant_type`** is required, and RFC 6749 fixes its value. "Value MUST be set to "client_credentials"."
- **[`scope`](#g-scope)** is optional. It says what the service is asking to be allowed to do. Leave it out and the [authorization server](#g-authorization-server) applies whatever default it has for that client, or refuses the request, which RFC 6749 section 3.3 allows.
- **The `Authorization` header** is the service proving who it is, here with a client ID and a secret. RFC 6749 is plain about this part. "The authorization server MUST authenticate the client." Section 4 covers the other ways to do it.

Listing 2 is the response.

Listing 2: The token response
```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store
Pragma: no-cache

{
  "access_token": "eyJhbGciOiJFUzI1NiIsInR5cCI6ImF0K2p3dCJ9...",
  "token_type": "Bearer",
  "expires_in": 300,
  "scope": "ledger:read"
}
```

- **`access_token`** is the token. The service treats it as [opaque](#g-opaque), meaning it doesn't read what's inside, and sends it on.
- **`token_type`** says how to present it. [`Bearer`](#g-bearer) means whoever holds the token can use it, so the service sends it in an `Authorization` header as is.
- **`expires_in`** is the lifetime in seconds. RFC 6749 only recommends sending it, but a service can't cache sensibly without it.
- **`scope`** is what was actually granted. It's optional when it matches what was asked and required when it doesn't, so read it and don't assume.

Then the service calls the API with the token, as in Listing 3.

Listing 3: Calling the API
```http
GET /accounts/8841/entries HTTP/1.1
Host: ledger.example.org
Authorization: Bearer eyJhbGciOiJFUzI1NiIsInR5cCI6ImF0K2p3dCJ9...
```

Scope says what the service may do. It doesn't say which API the token is for. When one [authorization server](#g-authorization-server) fronts many APIs, the service can name the one it means with the `resource` parameter from RFC 8707, and the token comes back addressed to that API alone.

## 4. How a service proves who it is

There are four common ways, and the [authorization server](#g-authorization-server) lists the ones it accepts in its [metadata](#g-metadata), a public document that describes what the server supports, under `token_endpoint_auth_methods_supported`.

| Method | What the service holds | What travels | Where it's defined |
|---|---|---|---|
| `client_secret_basic` | A shared secret | The secret, in the `Authorization` header | RFC 6749, section 2.3.1, named by OpenID Connect Core section 9 |
| `client_secret_post` | A shared secret | The secret, in the request body | RFC 6749, section 2.3.1, named by OpenID Connect Core section 9 |
| `private_key_jwt` | A private key | A short-lived signed statement | RFC 7523, named by OpenID Connect Core section 9 |
| `tls_client_auth` | A private key and its certificate | A proof made inside the TLS handshake | RFC 8705 |

The first two send the secret itself, and that's what makes them the weaker pair. In Listing 1 the `Authorization` header holds the client ID and the secret joined by a colon and base64-encoded, and base64 is an encoding, not a protection. Anyone who sees the header reverses it in one line. `client_secret_post` skips even that and puts the two values in the request body as plain form fields. [TLS](#g-tls) hides both from the network in between, and nothing else. The secret is in the clear at the service that sends it, in the configuration file it reads it from, at any proxy that terminates TLS on the way, and in whatever logs the request. The [authorization server](#g-authorization-server) keeps only a hash, as section 2 says, and that protects its store, not the request. It's the same value on every request, so one capture anywhere on that path is a credential that works until someone rotates it. RFC 6749 calls putting it in the body "NOT RECOMMENDED", and for either one it requires [TLS](#g-tls), the encryption that protects the connection, and protection against repeated guessing.

The last two never send the key, and a captured request gives an attacker far less to reuse. The signed statement lives for a minute, a server that records the one-time IDs it has seen refuses a second use inside that minute, and the TLS proof can't be lifted out of the handshake it was made in. With [`private_key_jwt`](#g-private-key-jwt) the service signs a small [JWT](#g-jwt), a short piece of signed data in a standard format, that says who it is and who the statement is for, and the [authorization server](#g-authorization-server) checks the signature against a public key it already has. With `tls_client_auth` the proof happens in the mutual TLS handshake, which is what the certificates primer walks through. RFC 9700, the current security guidance for OAuth, comes down on this side. It says "It is RECOMMENDED to use asymmetric cryptography for client authentication", and it names these two methods.

Listing 4 is the same request as Listing 1 with a signed statement in place of the secret, and Listing 5 is what's inside the statement.

Listing 4: The token request with a signed statement
```http
POST /token HTTP/1.1
Host: as.example.org
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&scope=ledger:read
&client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer
&client_assertion=eyJhbGciOiJFUzI1NiIsImtpZCI6InJlY29uLTIwMjYtMTAifQ...
```

Listing 5: The claims inside the signed statement
```json
{
  "iss": "billing-reconciler",
  "sub": "billing-reconciler",
  "aud": "https://as.example.org",
  "jti": "0f6a1c9e-52b7-4f0e-9d1b-7a3c5e8d2b40",
  "iat": 1793005200,
  "exp": 1793005260
}
```

Each line is a [claim](#g-claim), one fact the statement asserts. The [issuer](#g-issuer) is who made the statement, and the [subject](#g-subject) is who it's about. Both are the client ID, because the service is vouching for itself. The [audience](#g-audience) is who the statement is for, here the [authorization server](#g-authorization-server). The statement lives for a minute. `jti` is a one-time identifier. A server that keeps the identifiers it has seen can refuse a copy that someone captures and sends a second time, which is what [replay](#g-replay) means, and RFC 7523 leaves that check to the server as a MAY, so the one-minute life is the protection you can count on.

The audience is the claim to get right. RFC 7523 let it be several things, including the token endpoint's URL. The update now in the RFC Editor's queue narrows it to the [authorization server](#g-authorization-server)'s issuer identifier and nothing else. Use the issuer identifier today and you're correct under both. One caution for Monday. OpenID Connect Core, section 9, says the audience SHOULD be the token endpoint's URL, and some deployed servers accept only that, so check what yours accepts. The update forbids the token endpoint URL outright, and it's the value most examples online still use.

## 5. What the token says when there's no user

A token is a statement about someone. With no user in the flow, the someone is the service.

RFC 9068, the profile for access tokens that are JWTs, says so directly. For grants "where no resource owner is involved, such as the client credentials grant", the subject "SHOULD correspond to an identifier the authorization server uses to indicate the client application". [Resource owner](#g-resource-owner) is the standards' name for the user. Listing 6 is the token from Listing 2, decoded.

Listing 6: The access token, decoded
```json
{
  "iss": "https://as.example.org",
  "sub": "billing-reconciler",
  "client_id": "billing-reconciler",
  "aud": "https://ledger.example.org",
  "scope": "ledger:read",
  "jti": "b1f7c2a4-9d3e-4c61-8a2f-6e0d5c9b7a13",
  "iat": 1793005201,
  "exp": 1793005501
}
```

Before the API trusts anything in that token, it [verifies](#g-verification) it, and it assumes nothing. It checks the signature against the [authorization server](#g-authorization-server)'s public key, which proves the authorization server made the token and nobody has changed it since. Then it checks that the issuer is the one it expects, that the audience names this API, and that the token hasn't expired. Only after all of that does it read the [scope](#g-scope) and decide whether the request is allowed.

Two things follow for the API that receives it, and both are design guidance.

The subject is a service. An API that takes `sub` and looks up a user record will find nothing, or worse, find the wrong thing. RFC 9068 warns about exactly that. If the [authorization server](#g-authorization-server) uses the client ID as the subject, it "should prevent clients from registering an arbitrary client_id value", because a client that could pick its own ID could pick a real user's.

The [scope](#g-scope) is the service's own permission. Nobody approved it at a consent screen. It's whatever an administrator gave that client, so the list should be as short as the job needs.

## 6. Why there's no refresh token

RFC 6749 says of this grant, "A refresh token SHOULD NOT be included."

The reason is practical. A refresh token exists so an application can get a new [access token](#g-access-token) without sending the user back to a login page. Here there's no user to spare. The service still has its credentials, so it asks again.

That makes caching the service's job. Keep the token until shortly before `expires_in` runs out, then request a new one. A service that requests a token for every call puts its whole traffic on the [token endpoint](#g-token-endpoint), and most [authorization servers](#g-authorization-server) will rate-limit it.

## 7. Where it goes wrong

These are from practice.

1. **The secret lives in the code.** It's in a repository, a container image or a configuration file, and everyone who can read those can be the service. Keep it in a secret store and hand it to the service when it starts.
2. **The secret never rotates.** Rotation only works if the [authorization server](#g-authorization-server) accepts the old and the new secret for a while. Check that before the first one leaks.
3. **Many services share one client.** The API can't tell which of them called, and revoking the client stops all of them. Give each service its own.
4. **The scope is wider than the job.** A reporting job holding a write scope is one bug away from using it.
5. **A public client uses it.** RFC 6749 rules this out. "The client credentials grant type MUST only be used by confidential clients." A browser or mobile application can't keep a secret, so it can't be a [confidential client](#g-confidential-client).
6. **The API treats the subject as a person.** Section 5 is the fix.
7. **It gets used when there is a user.** A service handling a user's request calls the next service with its own client credentials token. The call works, and the user has vanished. The next service can't apply that user's entitlements or record who the action was for.

## 8. Where this leads

The seventh mistake is the subject of RFC 8693 token exchange. When a service acts for a user, the token it sends on has to say both who is acting and for whom, and client credentials can only say the first.

The first two mistakes are the subject of mTLS, SPIFFE and SPIRE. A stored secret has to be handed out, kept and replaced by somebody. Workload identity has the platform issue each running service a short-lived credential and replace it automatically, and the service presents that to the [authorization server](#g-authorization-server) with one of the two key-based methods in section 4.

## Glossary

| Term | Meaning in this primer |
|---|---|
| {#g-access-token}Access token | What the service sends to an API to be let in. Short-lived. It says who it's about, which API it's for, what it allows and until when. Site glossary, [Access token](/glossary/#access-token). |
| {#g-audience}Audience | Who a token or a signed statement is for. The party named there is the only one that should accept it. The `aud` claim. Site glossary, [Audience](/glossary/#audience). |
| {#g-authorization-server}Authorization server | The system that authenticates clients and issues tokens. Also called the issuer. Site glossary, [Authorization server](/glossary/#authorization-server). |
| {#g-bearer}Bearer token | A token that works for whoever holds it. Unless it's bound to a certificate or a key, nothing ties it to the service it was issued to, which is why it's short-lived and sent only over TLS. Site glossary, [Bearer token](/glossary/#bearer-token). |
| {#g-claim}Claim | One fact a token asserts, written as a name and a value, such as who issued it or when it expires. Site glossary, [Claim](/glossary/#claim). |
| {#g-client}Client | OAuth's word for any software that asks the authorization server for tokens. Here, a backend service. Site glossary, [Client](/glossary/#client). |
| {#g-client-authentication}Client authentication | The client proving which client it is at the token endpoint. It happens in every flow a confidential client uses. |
| {#g-credentials}Client credentials (the credentials) | What a client holds to authenticate. A shared secret, a private key, or a private key with a certificate. |
| {#g-grant}Client credentials grant | The flow in which a client's own credentials are the only thing presented. No user, no login, no consent. RFC 6749, section 4.4. Site glossary, [Client credentials grant](/glossary/#client-credentials). |
| {#g-confidential-client}Confidential client | A client that can keep its credentials private, which in practice means software running on a server. A browser or mobile application is a public client and can't use this grant. |
| {#g-grant-word}Grant | What a client presents to the authorization server to justify being given a token. A user's approval is one kind. The client's own credentials are another. Each kind is a grant type, named in the `grant_type` field of the request. Site glossary, [Grant](/glossary/#grant-type). |
| {#g-issuer}Issuer | Who made and signed a token or a statement. For access tokens, the authorization server. The `iss` claim. Site glossary, [Issuer](/glossary/#issuer). |
| {#g-jwt}JWT | JSON Web Token. A short piece of signed data in a standard format. It carries a set of claims, and anyone with the signer's public key can check that it's genuine and unchanged. Site glossary, [JWT](/glossary/#jwt). |
| {#g-metadata}Metadata | A public document the authorization server publishes that describes itself, including where its endpoints are and which methods it supports. RFC 8414. Site glossary, [Metadata](/glossary/#metadata). |
| {#g-opaque}Opaque | Not meant to be read by whoever is holding it. A service passes an opaque token along without looking inside. Site glossary, [Opaque](/glossary/#opaque-token). |
| {#g-client-secret-basic}`client_secret_basic`, `client_secret_post` | Client authentication with a shared secret, in the `Authorization` header or in the request body. RFC 6749 section 2.3.1, names from OpenID Connect Core section 9. |
| {#g-private-key-jwt}`private_key_jwt` | Client authentication with a short-lived JWT the client signs with its private key. The authorization server checks it with the client's public key. |
| {#g-replay}Replay | Capturing a valid message and sending it again. A one-time identifier and a short lifetime are the usual defenses. Site glossary, [Replay](/glossary/#replay). |
| {#g-resource-owner}Resource owner | The standards' name for the user, the person whose data or account the token gives access to. |
| {#g-scope}Scope | The list of things a token allows. In this grant it's the service's own permission, set by an administrator. Site glossary, [Scope](/glossary/#scope). |
| {#g-subject}Subject | Who a token or a statement is about. In this grant, the service itself. The `sub` claim. Site glossary, [Subject](/glossary/#subject-and-identifier). |
| {#g-tls-client-auth}`tls_client_auth` | Client authentication inside the mutual TLS handshake, the client's certificate checked against the name and issuer registered for it. RFC 8705. |
| {#g-tls}TLS | Transport Layer Security. The encryption that protects a connection between two machines, the S in HTTPS. Site glossary, [TLS](/glossary/#tls-and-mutual-tls). |
| {#g-token-endpoint}Token endpoint | The authorization server's URL for trading credentials, or another token, for an access token. Site glossary, [Token endpoint](/glossary/#token-endpoint). |
| {#g-verification}Verification | Checking a token before trusting anything in it. The signature shows who issued it and that it hasn't been changed. The issuer, the audience and the expiry are then checked against what this API expects. |

## References

- RFC 6749, The OAuth 2.0 Authorization Framework. Sections 1.3.4, 2.3.1, 4.4, 5.1 and 5.2.
- RFC 7523, JSON Web Token (JWT) Profile for OAuth 2.0 Client Authentication and Authorization Grants, and its update in progress, draft-ietf-oauth-rfc7523bis.
- RFC 8414, OAuth 2.0 Authorization Server Metadata.
- RFC 8628, OAuth 2.0 Device Authorization Grant.
- RFC 8693, OAuth 2.0 Token Exchange.
- RFC 8705, OAuth 2.0 Mutual-TLS Client Authentication and Certificate-Bound Access Tokens.
- RFC 8707, Resource Indicators for OAuth 2.0.
- RFC 9068, JSON Web Token (JWT) Profile for OAuth 2.0 Access Tokens. Sections 2.2 and 5.
- RFC 9700, Best Current Practice for OAuth 2.0 Security. Section 2.5.
