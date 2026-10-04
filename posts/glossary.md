---
title: "Identity, the terms"
subtitle: "The words this site uses, each one a distinction rather than a definition, with the post that is its long form."
description: "A working glossary of identity terms as used on roniam.dev: authentication and authorization, identity and account, role and permission, federation and delegation, solicited and unsolicited, and the protocol nouns a reader meets cold in any post about SSO, OAuth, OIDC and SAML."
date: 2026-10-04
tags: ["identity", "glossary", "reference"]
category: identity
slug: "glossary"
nav_title: "Identity glossary"
page: true
nav_blurb: "identity terms, each one a distinction with its long form"
nav: 1
revisions: 8
status: published
---


Most of the identity failures we build ourselves come from a mechanism
built to answer one question being trusted to answer another. So this
page is not a dictionary. Each entry is a distinction, usually between two
words people use as if they meant the same thing, and each one points at
the post where the distinction is worked through. Where a post isn't out
yet, the entry points at the [Identity Dojo](/identity/) stream that
covers the mechanism.

## The distinctions

**Authentication and authorization.** Authentication answers who this is.
Authorization answers what they may do. They are different questions with
different answers, different mechanisms and different failure modes, and
nearly everything on this site is about a place where one was asked to do
the other's job. An access token is authorization, and a user ID inside it
does not make it authentication. Long form:
[SSO for integrations: the decision, SSO is federation](/blog/sso-for-integrations-the-decision/#sso-is-federation-oauth-is-delegation).

**Identity and account.** An identity is who someone is, asserted by
whoever authenticated them. An account is a record an application keeps
about that person, what they may do here, what they did, what they own.
SSO moves an identity across a boundary. It does not create, update or
delete the account on the other side. Every one of those is a decision.
The two don't pair one to one. One identity can own several accounts,
one per tenant in a multi-tenant product or one per application, and
one account can be reached through more than one identity when a
customer runs two identity providers. Linking is the record of which
pairs are allowed.
Long form: [Accounts exist at both ends](/blog/sso-for-integrations-the-decision/#accounts-exist-at-both-ends).

**Role and permission.** A role is part of who someone is, analyst,
administrator, read-only. An identity provider can assert it and a
partner can act on it. A permission is what a role may do inside one
application, and it belongs to that application alone. Roles cross, and
permissions don't. A launch or a token exchange may narrow what a user
may do and must never widen it. Long form:
[Accounts exist at both ends](/blog/sso-for-integrations-the-decision/#accounts-exist-at-both-ends);
the token post, when it publishes.

**Session and token.** A session is an application's memory that this
browser belongs to this user, usually a cookie, and the application can
end it. A token is a signed statement handed to a caller, and once a self-contained one is issued it can't be pulled back, only outlived. Sessions end, and tokens run out. That is why single logout is easy to promise and hard to deliver. Long form: [Single logout](/blog/sso-for-integrations/#single-logout).

**Trust boundary.** The line around everything one organization runs,
holds the keys for, and gets paged for when it breaks. Inside it, the
services share one set of controls and one on-call, and a token can be
passed along on the strength of who issued it. At the line, nothing
crosses on its own say-so. Every message that comes in is verified
against what was agreed ahead of time, and every message that goes out
is translated into something the other side agreed to accept. A partner
you contract with is outside it, however friendly. A vendor running one
module under your brand is outside it. A team in your own company that
holds its own keys and its own pager is a boundary of its own. The
line is about who holds the keys and the pager, not about networks or
cloud accounts. Two accounts, one for the EU and one for the US, run
by the same team under the same controls are one boundary with two
partitions inside it. They become two boundaries the day one of them
has to keep its keys, its identity data or its on-call to itself, for
residency or any other reason, and from then on an identity crossing
between them is federated like any other. SSO is the business of
moving an identity across that line, which is why every flow in these
posts is described from the side that receives.
Long form:
[The parties](/blog/sso-for-integrations/#the-parties-and-the-shape-they-all-share);
[The signed handoff](/blog/sso-for-integrations/#the-signed-handoff).

**Federation and delegation.** Federation is one party authenticating a
user and asserting that identity to another, which accepts the assertion
instead of authenticating the user itself. It moves identity across a
trust boundary. SAML and OpenID Connect are federation protocols.
Delegation is a user granting an application a limited right to act on
their behalf against some resource, without handing over credentials. It
moves authority to act, not identity. OAuth is a delegation protocol.
Long form: [SSO is federation, OAuth is delegation](/blog/sso-for-integrations-the-decision/#sso-is-federation-oauth-is-delegation).

**Data layer and identity layer.** Any partner integration has two
layers. The data layer moves data between the partners and works on it.
OAuth belongs there, because delegated access to an API is how the data
layer decides what a caller may touch. The identity layer is where SSO
lives. A person crosses from one side to the other already recognized.
Federation belongs there. Most hacks in this field come from the boundary
between them being breached. Long form:
[SSO is federation, OAuth is delegation](/blog/sso-for-integrations-the-decision/#sso-is-federation-oauth-is-delegation).

**Solicited and unsolicited.** A response is solicited when the party
receiving it asked for it. It made a request, put a fresh value in it,
and will only accept an answer that proves it is the answer to that
request. A response is unsolicited when it arrives at a partner that
didn't ask for it. The partner can verify who signed it and that it was
meant for them. What it can't verify is that this browser, right now, set
out to log in. The response is authentic, but nobody asked for it. Long form:
[Where the click happens](/blog/sso-for-integrations-the-decision/#which-flow-and-what-it-costs).

**SP-initiated and IdP-initiated.** Where the process starts. If it
starts at the service provider, a landing page or a link deep into the
application that has to work out where to send the user to authenticate,
it's SP-initiated, and the response comes back bound to a request. If it
starts at the identity provider, a tile on its portal or a link it
issued, with the user already authenticated there, it's IdP-initiated,
and the response arrives unsolicited. The deciding
question is never whether the user has a session somewhere. It's whether
the thing launching them is the identity provider. Long form:
[Where the click happens](/blog/sso-for-integrations-the-decision/#which-flow-and-what-it-costs).

**Identity provider and service provider.** The identity provider (IdP)
authenticates the user, holds their session, and mints the signed
statement that carries the result across the boundary, an assertion in
SAML, an ID token in OpenID Connect, where the same server usually
issues the access token as well. The service provider (SP, or relying
party in OpenID Connect's vocabulary) accepts that statement instead of
authenticating the user itself. Which
side you are on changes with the integration. Your platform is the
identity provider when it launches users into a partner, and the service
provider when a customer's portal launches their users into you. Long
form: [The parties](/blog/sso-for-integrations/#the-parties-and-the-shape-they-all-share).

**Subject and identifier.** The subject is the person an assertion is
about. The identifier is the value that names them, and it is unique only
within the issuer that minted it. So the thing an account is linked to is
the pair, issuer and identifier, never the identifier alone, and never an
email address, which changes, gets reused, and is the first thing an
attacker will try to set. Long form:
[The account contract](/blog/sso-for-integrations/#the-account-contract).

**Consent and pre-authorization.** Consent is a person saying yes at the
moment data is about to flow. A pre-authorization is somebody with the
authority to decide, usually an administrator, saying yes once, ahead of
time, in a form that can be listed, reviewed and revoked. Skipping a
consent screen is a pre-authorization at the identity provider, granted
by an administrator out of band, in the identity provider's own
configuration, before any user arrives. It is never a branch in code
that decides at runtime not to ask. Long form:
[Consent](/blog/sso-for-integrations-the-decision/#who-consents).

**Revocation and expiry.** Revocation is ending something on demand, and
expiry is it ending on schedule. A session can be revoked. A
self-contained token can't be, only outlived, so the operating answer is
short-lived access tokens and refresh tokens that get revoked, and a
partner session that expires whether or not anyone remembered to end it.
Long form: [Single logout](/blog/sso-for-integrations/#single-logout).

**Provisioning and linking.** Provisioning is creating the account on the
far side, either ahead of time over SCIM or just in time from an
assertion. Linking is deciding which local account an arriving federated
identity maps to. The two meet at one value. The identifier the
provisioning record carries has to be the one the assertion later
brings, or the first login has nothing to match on except email. Long
form: [The account contract](/blog/sso-for-integrations/#the-account-contract).

**Tenant and issuer.** A tenant is a customer's slice of your
application. An issuer is the identity provider that vouches for a set of
users. The association between them is made when the customer is set up
and checked at every login. The assertion for a user has to come from the
issuer that user's tenant was pinned to, and no other. Skip that check
and customer A's identity provider can assert a user who belongs to
customer B, with a valid signature. Long form:
[Which identity provider is this user's?](/blog/sso-for-integrations/#which-identity-provider-is-this-users).

**Signed by and encrypted to.** Signed by names the party whose private
key produced the signature, and anyone with that party's public key can
check it. It proves who sent it and that nothing changed, and hides
nothing. Encrypted to names the party whose public key locked the
message, and only that party's private key opens it. It hides the
contents from everyone else and proves nothing about who sent it. The
private key belongs to the sender in the first and to the receiver in
the second. An assertion is signed by the identity provider and, when
encryption is on, encrypted to the service provider. Long form: Every key in a login, when it publishes.

## The mechanisms

**Assertion.** SAML's signed statement that a subject was authenticated,
by whom, when, and for which audience, carried inside a Response. The
partner reads claims only from the element the signature covers. Long
form: [SAML, IdP-initiated](/blog/sso-for-integrations/#saml-idp-initiated);
[Identity Dojo, SAML](/identity/#saml).

**ID token.** OpenID Connect's signed statement about who the user is,
with the issuer, audience, subject, and, when asked for, a nonce and
an authentication time. It is the thing OAuth lacks and OIDC added, so that
nobody has to invent login on top of an access token again. Long form:
[SSO is federation, OAuth is delegation](/blog/sso-for-integrations-the-decision/#sso-is-federation-oauth-is-delegation);
[Identity Dojo, OpenID Connect](/identity/#openid-connect).

**Access token.** A permission slip. It says what its holder may do, to
which resource, for which user, for how long. It says nothing about who
its holder is, and a receiving application cannot make it say so. Long
form: [SSO is federation, OAuth is delegation](/blog/sso-for-integrations-the-decision/#sso-is-federation-oauth-is-delegation);
the token post, when it publishes.

**Refresh token.** The credential a client presents to get a new access
token without the user. It is the token a server keeps a record of and can refuse next time, which is why revocation strategies are built around it. Long form:
[Single logout](/blog/sso-for-integrations/#single-logout).

**Bearer token.** A token that grants whatever it grants to whoever holds
it. No proof of possession, no binding to the caller. Everything about
short lifetimes, single use and never putting one in a URL follows from
that one property. Long form:
[The signed handoff](/blog/sso-for-integrations/#the-signed-handoff).

**Claim.** One statement inside a token or assertion, the issuer, the
subject, the audience, a role. A claim is only as good as the signature
over it and the check that reads it. Long form:
[Identity Dojo, OpenID Connect](/identity/#openid-connect).

**Scope.** What an OAuth client asks permission to do, and what the
resulting token may do. Minimize it harder when nobody is going to be
asked, because nobody is going to be watching either. Long form:
[Consent](/blog/sso-for-integrations-the-decision/#who-consents).

**Client.** In OAuth, the application that wants to act for the user.
It has a client id per registration, and an ID token's audience names that id. A public client, a native or single-page application, cannot keep a
secret, which is why it needs PKCE. Long form:
[Identity Dojo, advanced OAuth](/identity/#advanced-oauth).

**Issuer.** Who signed this. Checked against configuration set up ahead
of time, never discovered from whatever the message says about itself,
and re-read from the verified claims after the signature holds. Long
form: [SP-initiated: the baseline](/blog/sso-for-integrations/#sp-initiated-the-baseline).

**Audience.** Who this was meant for. A message for someone else is
refused even when the signature is good, and a token naming several audiences
is refused when one of them is untrusted. Long form:
[SP-initiated: the baseline](/blog/sso-for-integrations/#sp-initiated-the-baseline).

**Binding.** The proof that a response answers the request this partner
made, in this browser, and hasn't been answered before. `state` and the
nonce carry it in OIDC, `InResponseTo` in SAML. When a response can
arrive unasked, the receiver has to supply what the protocol didn't,
single use, a short life, an allow-listed landing page. Long form:
[SP-initiated: the baseline](/blog/sso-for-integrations/#sp-initiated-the-baseline).

**`state`.** A random value the relying party makes up per request and
gets back unchanged. It means nothing to the identity provider and
everything to the relying party, which stored it in a cookie only that
browser holds before the redirect. Long form:
[SP-initiated: the baseline](/blog/sso-for-integrations/#sp-initiated-the-baseline).

**Nonce.** The same idea one layer deeper, a per-request value that
travels inside the signed ID token rather than in the redirect, so it
binds the token itself to the request. Long form:
[SP-initiated: the baseline](/blog/sso-for-integrations/#sp-initiated-the-baseline).

**PKCE.** Proof Key for Code Exchange, a guard on the authorization
code. The exchange runs in four moves.

1. The client makes a random secret per request, the code verifier, and
   keeps it.
2. It sends the SHA-256 hash of that secret, the code challenge, with the
   authentication request.
3. The identity provider stores the challenge next to the code it issues.
4. When the client comes to the token endpoint to exchange the code, it
   sends the verifier in the clear. The server hashes it and compares it
   with the stored challenge. A mismatch refuses the exchange.

The result is that a code stolen from a redirect, a log or a proxy is
useless to anyone who doesn't hold the verifier, and the verifier never
left the client until the code was already in hand. Required for public clients, and the OAuth 2.1 draft requires it of every client with one narrow exception, a confidential client whose OpenID Connect nonce the server
has reason to trust. Long form:
[Identity Dojo, advanced OAuth](/identity/#advanced-oauth).

**Authentication request.** What OpenID Connect calls the message a
relying party sends to the authorization endpoint. OAuth would call it an
authorization request. OIDC renamed it, because what comes back is a
statement about who the user is. Long form:
[SP-initiated: the baseline](/blog/sso-for-integrations/#sp-initiated-the-baseline).

**Third-party-initiated login.** Section 4 of OpenID Connect Core, where an
identity provider sends the user to a URL the relying party registered,
with the issuer and a hint, and the relying party starts an ordinary
solicited request of its own. The unsolicited arrival becomes a solicited
response, at the cost of one redirect the user never sees. Long form:
[OIDC, third-party-initiated login](/blog/sso-for-integrations/#oidc-third-party-initiated-login).

**Landing page.** Where a freshly signed-in user is sent. `RelayState` in
SAML and `target_link_uri` in OIDC name it. The partner checks the name
against its own list of pages a login may end on, matched exactly, never
a pattern and never a URL followed as given. Long form:
[SAML, IdP-initiated](/blog/sso-for-integrations/#saml-idp-initiated).

**Deep link.** A URL to a specific page inside an application. When it
starts SSO it carries no authority and shouldn't. The partner remembers
it, sends the user to authenticate, and lands them on it afterward. Long
form: [Where the click happens](/blog/sso-for-integrations-the-decision/#which-flow-and-what-it-costs).

**Signed handoff.** A short-lived, single-use, signed token that a
platform mints and a partner accepts as a login, with no identity
provider in between. It is the mechanism [the decision post](/blog/sso-for-integrations-the-decision/) calls a trap,
allowed in exactly one situation, when the same organization owns both
ends, holds both sets of keys and gets paged when either breaks. Long
form: [The signed handoff](/blog/sso-for-integrations/#the-signed-handoff).

**Magic link.** Two different things share the name. In an SSO request it
means a link that signs the user into the other application with their
permissions applied and no login page in between, a launch link carrying
authority, which is the signed handoff or the bad version of it. In
passwordless login it means a credential sent by email in place of a
password. The two have to stay apart. Long form:
[The signed handoff](/blog/sso-for-integrations/#the-signed-handoff).

**Trust, out of band.** What the two sides of an integration set up
before any user clicks, signing keys, issuer names, audiences, the exact
address responses go to, the pages a login may land on, which attributes
cross. Everything at runtime rides on it, and in practice it is a set of
documents that often leaves out the question that matters most. How does
the partner map the identifier to an account? Long form:
[What the design review can miss](/blog/sso-for-integrations-the-decision/#what-the-design-review-can-miss).

**Endpoints.** The addresses the protocol messages go to, fixed ahead of
time on both sides. On the partner's side, the Assertion Consumer Service
in SAML or the redirect URI in OIDC, where responses land, and the logout
URI. On the identity provider's side, the single sign-on endpoint that
requests go to, the token endpoint a relying party exchanges a code at,
and the JWKS endpoint that publishes its keys. A response delivered to
an address that wasn't registered is refused before it's read. Long
form: [The parties](/blog/sso-for-integrations/#the-parties-and-the-shape-they-all-share).

**Attribute release.** Which facts about the user cross to a given
partner, decided by the identity provider's administrator when the trust
is set up, never at runtime by the partner asking. A partner receives
what it was granted, keeps what the contract says it may keep, and cannot
edit what it didn't issue. Long form:
[The account contract](/blog/sso-for-integrations/#the-account-contract).

**Metadata.** SAML's machine-readable form of that trust, entity IDs,
endpoints, certificates. Exchanged by URL rather than by file, with a
validity and a cache duration, so that rotating a key is a publish and
not an email. Long form: [When it breaks](/blog/sso-for-integrations/#when-it-breaks).

**JWKS.** The JSON Web Key Set an OIDC issuer publishes so relying
parties can fetch its current signing keys. A token's header names its
key by `kid`. The relying party looks it up in a cached set, re-fetches
once on an unknown id, rate-limited, and then fails. Long form:
[When it breaks](/blog/sso-for-integrations/#when-it-breaks).

**Certificate rotation.** Replacing a signing key before its date, in a
way both sides survive. Where both can hold two keys with overlapping
validity, it is routine. Where either can hold only one, it is a cutover,
and a cutover is an outage scheduled into a window. The incident won't be called "certificate expired". It will be called "users can't log in". Long
form: [When it breaks](/blog/sso-for-integrations/#when-it-breaks).

**SCIM.** The provisioning protocol, where an identity provider or directory
creates, updates and deactivates accounts at a partner ahead of any
login. Prefer it to just-in-time provisioning, and make the identifier it
writes the one the assertion will carry. Long form:
[The account contract](/blog/sso-for-integrations/#the-account-contract).

**Single logout.** Ending the sessions single sign-on created. The
standards offer several mechanisms, most of which go through the browser
and fail there. The one that survives is back-channel logout, and it
requires the partner to be able to end a session by identifier on
demand. Whether it is expected at all, and in which direction, are two questions to settle before launch. Long form:
[Single logout](/blog/sso-for-integrations/#single-logout).

**Back-channel and front-channel.** Front-channel means through the
user's browser, redirects, auto-submitted forms, iframes. Back-channel
means server to server, with no browser in between. Front-channel is
where SSO happens and where logout breaks. Back-channel is the only
logout that reliably arrives. Long form:
[Single logout](/blog/sso-for-integrations/#single-logout).

**Home realm discovery.** Working out which identity provider a user
belongs to before redirecting them, from an identifier they understand,
usually their email address, and configuration made when the customer was
set up. Never by asking them, and never in a way that tells a stranger
who your customers are. Long form:
[Which identity provider is this user's?](/blog/sso-for-integrations/#which-identity-provider-is-this-users).

## The failures

**Replay.** Presenting a valid response a second time. Stopped by a
single-use record of what has been accepted, kept for as long as the
response is valid. Long form:
[SAML, IdP-initiated](/blog/sso-for-integrations/#saml-idp-initiated).

**Login CSRF.** An attacker obtains a response for their own account and
delivers it to a victim's browser, so the victim proceeds inside the
attacker's session and enters data the attacker reads later. The binding
in a solicited flow stops it. Nothing in an unsolicited flow does, which
is the cost of that flow. Long form:
[SP-initiated: the baseline](/blog/sso-for-integrations/#sp-initiated-the-baseline).

**Mix-up.** A response from one identity provider delivered to the
callback that was waiting on another. The relying party checks which
issuer the response came from, and an application whose customers each
bring their own identity provider is exactly the shape the attack was
written for. Long form:
[SP-initiated: the baseline](/blog/sso-for-integrations/#sp-initiated-the-baseline).

**Signature wrapping.** The element that was signed and the element the
parser reads the subject from turn out to be different ones. The reason
nobody should write their own SAML consumer. Long form:
[SAML, IdP-initiated](/blog/sso-for-integrations/#saml-idp-initiated).

**Login loop.** A partner receives a response, refuses it, and its
failure handling is to start over, so the user bounces between the two
sides until the browser gives up. The rule is never to redirect to login from
a callback on a validation failure. Long form:
[When it breaks](/blog/sso-for-integrations/#when-it-breaks).

**Clock skew.** Two machines disagreeing about the time by enough to push
a valid assertion outside its window. A tolerance of a minute each way
covers most of it. The answer to the rest is the assertion's own window
and single-use IDs, not a wider tolerance. Long form:
[When it breaks](/blog/sso-for-integrations/#when-it-breaks).

**Tenant confusion.** An assertion from one customer's identity provider
accepted for a user who belongs to another, because the check that the
user's tenant is pinned to that issuer was never written. Long form:
[Which identity provider is this user's?](/blog/sso-for-integrations/#which-identity-provider-is-this-users).
