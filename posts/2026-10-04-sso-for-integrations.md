---
title: "SSO For Integrations, For the One who's Building it"
subtitle: "The builder's half. What the receiving side checks in SP-initiated, SAML IdP-initiated, OIDC third-party-initiated login and a signed handoff, in code, with the sentence of the spec each check rests on; the trap in each flow; single logout as a mechanism; and the tests that have to fail before launch."
description: "The mechanics half of a two-part guide to cross-application single sign-on: the callback handler and the four doors it closes, the cross-site POST and SameSite, hardening an unsolicited SAML response, OIDC section 4, the launch token, back-channel logout, home realm discovery without enumeration, linking identifiers, certificate rotation, the redirect loop, the clock, logging, and twenty-six tests."
date: 2026-10-04
tags: ["identity", "sso", "saml", "oidc", "oauth", "federation", "engineering"]
category: identity
slug: "sso-for-integrations"
revisions: 61
status: published
---
This is the builder's half of two posts. [The decision
post](/blog/sso-for-integrations-the-decision/) names the two cases, a
user working in your application who reaches the partner without
authenticating again, or the partner's user who reaches you the same
way. It makes the choices, which case you are in, whether you are
asked for both, and which flow. The launching side chooses the flow
within what the other side can do. The receiving side builds, and this
post holds the checks behind each choice. The choices, for reference.

- SP-initiated with a deep link by default, in whichever protocol both sides speak, SAML or OIDC.
- OIDC third-party-initiated login when the launch has to start at the identity provider and both sides speak OIDC.
- SAML IdP-initiated only when the partner cannot start a flow at all, which in practice means a SAML-only partner with no SP-initiated endpoint, and then with the receiving side hardened.
- A signed handoff only inside your own trust boundary, one organization holding the keys and the on-call at both ends. The test is in that section.
- The deep link survives only if the partner carries `RelayState` or `state` through its own login, and a partner that can start a flow but drops the target is, for your purposes, one that cannot start it.

And never bare OAuth, for the reason the decision post gives.

Every check here belongs to the receiving side, whichever side that
is. When you launch, it is what you ask the partner to build and
verify in the design review. When a customer's identity provider
launches into you, it is what you build. When you do both, it is both,
with the roles swapped.
Each flow gets the receiver's checks in code, the sentence of the
specification each one rests on, and its trap. After the flows come
consent, single logout, which identity provider a user belongs to,
the account contract the decision post told you to write and the
identifiers behind it, the failures you will meet, the tests that have
to fail before launch, and the questions your own people answer.

Here is where each mechanism lives.

- The four parties in every flow and the trust set up before any of them acts: [The parties, and the shape they all share](#the-parties-and-the-shape-they-all-share).
- The one distinction the four flows turn on: [Solicited and unsolicited](#solicited-and-unsolicited).
- The four flows side by side, one property per row, with the sentence of the specification behind each one: [The four flows, cell by cell](#the-four-flows-cell-by-cell).
- The flow the standards were designed around, and the handler every other flow reuses: [SP-initiated: the baseline](#sp-initiated-the-baseline).
- The launch has to start at the identity provider and the partner speaks only SAML: [SAML, IdP-initiated](#saml-idp-initiated).
- The same, when both sides speak OIDC: [OIDC, third-party-initiated login](#oidc-third-party-initiated-login).
- A partner inside your own trust boundary: [The signed handoff](#the-signed-handoff).
- Where consent lives in each protocol, and why it is a record rather than code: [Consent, in the protocol](#consent-in-the-protocol).
- What the partner does at sign-out: [Single logout](#single-logout).
- Which identity provider a user belongs to, when customers bring their own: [Which identity provider is this user's?](#which-identity-provider-is-this-users)
- The account contract the decision post told you to write, worked out: [The account contract](#the-account-contract), and the identifiers that link the two sides: [Linking, the identifiers](#linking-the-identifiers).
- What the page will say when it fails: [When it breaks](#when-it-breaks).
- The tests that have to fail before launch: [Before it goes live](#before-it-goes-live).
- Seventeen questions your own people answer while the work is under way: [The rest of the questions](#the-rest-of-the-questions).

>! Scope: This is browser SSO. Native and mobile applications
>! launching into partners carry a different set of mechanics, and they
>! get their own post. The mobile app
>! that opens a browser to log in, usually to ship sooner than a native
>! implementation would allow, has stumbled into what the standard says
>! to do anyway. The trap is how the result gets back into the app, and
>! that's the other post.

## The parties, and the shape they all share

The design question is the same in every flow. What crosses to the
partner, and what can the partner verify about it?

Four things are in play.

- The user, in a browser.
- The launching side, the application the user is working in and the identity provider behind it, the thing that authenticated the user and holds their session. In most of what follows that is your platform. When a customer's identity provider launches into you, it is theirs.
- The receiving side, the application the user is arriving at, which is the service provider or relying party depending on which protocol's vocabulary you're using, and which has its own sessions and its own accounts. The partner when you launch, you when you receive.
- The trust between the identity provider and the receiving application, set up once, out of band, before any user clicks anything. The receiver knows the identity provider's signing keys, so it can check anything it signs, and its issuer, the name it signs as. The identity provider knows the receiver's endpoints, the addresses responses are allowed to go to, and what it's allowed to receive, which attributes about the user cross and which don't.

Everything the user does at runtime rides on that trust having been
established in advance.

```mermaid The parties: the user's browser, your platform with the application they're working in and the identity provider behind it, the partner application, and the trust set up between the two sides before anyone clicks
flowchart TB
    U["User, in a browser"]
    subgraph P["Your platform"]
        App["Your application<br/>where the user is working"]
        IdP["Identity provider<br/>authenticated the user, holds the session"]
    end
    subgraph S["Partner application"]
        RP["Service provider / relying party<br/>own sessions, own accounts"]
    end
    U -- "signed in, working here" --> App
    App -. "session from" .- IdP
    U -- "wants to arrive here" --> RP
    IdP == "what crosses at runtime" ==> RP
    IdP -. "trust, set up once, out of band:<br/>signing keys, issuer, endpoints,<br/>what the partner may receive" .- RP
```

At runtime the order is nearly always the same. The user arrives at a
landing page, usually yours, and identifies themselves, usually by
email address. That sends them to an identity provider, yours, their
own, or the partner's when the launch starts there, to authenticate,
and back to the application they started at, signed in. How the
identity provider is chosen for a user is its own section, [Which
identity provider is this
user's?](#which-identity-provider-is-this-users) That's the first
sign-on, and the partner hasn't been touched yet. Then, inside your
application, they click into the partner, and that click is when the
login to the other application happens. Something crosses to the
partner carrying "this user, authenticated by us, wants to arrive
here".

The partner validates it against the trust it already holds. It holds
the signing key it was given for your identity provider, so it can
check the signature. It holds the issuer name it expects, so it can
check who sent the message. It holds its own name as the audience, so
it can check the message was meant for it. It registered the exact address responses go to, and the identity
provider refuses to send them anywhere else. And it holds the list of
pages a login may land on, so it can refuse to send a freshly
signed-in user anywhere else. Those are two different addresses. The
first is where the protocol message is delivered, the partner's
callback or assertion consumer URL, one per integration and the same
for every login. The second is where the user goes after the login has
succeeded, the deep link, which can be different every time and is
the one an attacker would like to choose. Every one of those was
written down when the two sides set up the integration, and none of
them is decided at runtime. If the message passes those checks, and then the runtime checks, the
validity window, the single use and the binding to a request, which
are what the rest of this post is about, the partner starts its own
session and lands the user on the page they wanted.

Two distinctions run through the decision post and this one. Where the
flow starts, at the identity provider or at the service provider,
which is the IdP-initiated versus SP-initiated distinction. And
whether what arrives answers a request the receiver made, which is
solicited versus unsolicited, and is the one that decides what the
receiving side can verify. [The decision
post](/blog/sso-for-integrations-the-decision/#which-flow-and-what-it-costs)
chooses on the first and pays on the second. Every mechanism here differs only between those two ends, and the
question is always the same one. What crosses to the partner, and
what can the partner verify about it?

The picture also holds with the roles swapped. If your application is
the one adding "sign in with your company's identity provider" for
enterprise customers, you're the partner in every diagram below and
their IdP is the one issuing. The flows don't change. Only which side of
the trust you're setting up does.

## Solicited and unsolicited

One pair of words carries the four flow sections that follow, and the
decision post defines it among its [seven
signposts](/blog/sso-for-integrations-the-decision/#seven-signposts).
In code, solicited means the receiving party put a fresh value in its
request, remembered it against this browser, and accepts only an
answer that carries it back. Unsolicited means there is nothing to
match against, so whether this browser set out to log in cannot be
checked.

That gap opens two vulnerabilities. Replay, where a valid response stays
valid until its clock runs out, so anyone who captures one can present
it again. Login CSRF, where an attacker gets a response for their own
account, delivers it to a victim's browser, and the victim proceeds
inside the attacker's session, entering data the attacker reads later.
The partner can't tell a user who clicked from a user who was sent,
which is what makes the second one possible. Every flow in this post
is a position on that gap.

Where the flow starts is the launching side's choice, and the decision
post says which side you are before it says anything else. When you
are the receiving side, what you choose is how to check what arrives.
With a customer on SAML that means the hardening in [SAML,
IdP-initiated](#saml-idp-initiated). With a customer on OIDC it means the endpoint the
[third-party-initiated flow](#oidc-third-party-initiated-login) gives
you, which turns the arrival into a request of its own, so the
response is never unsolicited.

## The four flows, cell by cell

The decision post picks the flow and says what each one costs. This is
the same four laid out property by property, because the cost of a
flow is the sum of its properties, and the sections after this one are
the code behind each column. Each column is one way the user can
arrive. Each row is a property of that way.

| | SP-initiated | IdP-initiated, SAML | Third-party-initiated, OIDC | Signed handoff |
|---|---|---|---|---|
| Protocol | SAML or OIDC | SAML | OIDC, the third-party-initiated login of Core section 4 | A JWT of your own, no standard |
| Who starts it | The service provider | The identity provider | A third party, usually the identity provider, sends the user to the service provider, which then starts an ordinary request of its own | Your platform |
| Bound to a request, which is what solicited means | Yes | No | Yes | No. Single use is what you put in its place, and you are the one building it |
| Replay | In OIDC's code flow the single-use code closes it, and a `nonce` ties the token to the request, though `nonce` is only optional there, so it is something you send and check rather than something you get. In SAML the receiver keeps a store of used assertion IDs, required for any POST-bound assertion | The same store, and here it is the only thing closing replay, because there is no request to bind to. Verify the partner keeps one | Closed the same way, by the single-use code | Closed only if the receiver keeps a store of used `jti` values, the token's unique identifiers. You are building that |
| Login CSRF, a victim landing in an attacker's account | Protected, while the receiver binds its request to this browser and checks the response against it. In OIDC that is `state`, which the standard only recommends, so its presence is something to verify rather than assume | Exposed. Nothing in the protocol closes it. A confirmation screen does, at a cost | Protected the same way, in the request the partner makes for itself | Exposed. Same, and the same remedy |
| Can ask for a fresh or stronger login | Yes, in the request | No. It can only refuse what it was given | Yes, in the request it makes | The platform decides. The partner can only refuse |
| Deep link | The receiver round-trips a value of its own, which the standards require to come back unchanged, so it can be an opaque handle with the URL held server-side. Handle or URL is your choice. The target is checked against the receiver's routes once, when the user's click arrives. The choice decides whether it has to be checked again on the way back | `RelayState`, where the only normative hooks are a SHOULD on whoever creates the value to integrity-protect it and a bilateral agreement about what it means. Nothing requires the receiver to validate it, so the partner's allow list is what protects it | `target_link_uri`, which OIDC Core section 4 requires the receiver to verify, so here the allow list meets a requirement rather than filling a gap | A target claim, and the allow list is yours to write |
| Standards coverage | Full | The response side is fully specified. The unsolicited case itself is a paragraph, and it leaves the deep-link parameter to bilateral agreement | The launch is half a page of Core section 4, and the request carrying it is unsigned and unauthenticated. Everything after it is the ordinary code flow | None. RFC 7523 can present it as a grant, RFC 8693 can exchange it, at best |
| What the partner must support | A relying party or service provider, which it has | Unsolicited responses switched on, and the `RelayState` mapping | An `initiate_login_uri`, registered | Custom code at both ends |
| What it costs you in practice | Least of the four. A launch link, and whatever your identity provider already does. The partner's cost is having a login the flow can start at | A security exposure you carry for the life of the integration, and hardening work that falls on whichever side receives | Nothing beyond SP-initiated on your side, plus the argument, because few people at the partner will have heard of this flow. The endpoint is the partner's build | All of it, forever, and at both ends, including the parts that surface when a key has to be replaced |
| What the receiving side owns afterward | Per-request state bound to the browser, response matching, key rotation, a deep-link allow list wherever the target travels rather than being held server-side, and in SAML the replay store | Everything in the SP-initiated column, minus the request state it no longer has, plus an `Origin` check and the confirmation screen if you want login CSRF closed | Everything in the SP-initiated column, plus an `initiate_login_uri` that anyone who can reach it can fire, an allow list of the issuers it will accept there, which is what stops it being pointed at an identity provider you never configured (a configured tenant turned hostile is the residual the discovery section carries), and the `target_link_uri` check Core section 4 requires. None of the IdP-initiated column's extras, because this response is solicited | Keys and their rotation, revocation, audience, single-use enforcement, all of it yours |

Two rows are worth reading twice. Replay, because the used-ID store
SAML requires for POST-bound assertions is easy to read as a cost of
the unsolicited column alone and it is not. And the last row, because
when you are the launching side every entry in it is a requirement on
the partner rather than a task on your board.

## SP-initiated: the baseline

Use it wherever the flow can start at the service provider, in either
protocol. It's the flow the standards were
designed around.

The user arrives at the service provider, whichever side is receiving.
That's the partner when you own the launch, and your own application
when a customer's users are arriving. From there the flow has five
steps.

1. The service provider generates a request. In SAML it is an `AuthnRequest`. In OIDC it is an authentication request carrying `state`, a `nonce` and a PKCE challenge. Before sending it, the service provider writes what it will need to check the answer into a cookie only this browser holds, the `state`, the `nonce`, the PKCE verifier, and the page the user was headed for.
2. It redirects the user to the identity provider with the request.
3. The identity provider authenticates the user, or recognizes the session already there.
4. It sends the browser back to the service provider with a response bound to the request by the values the request carried. In OIDC the response is a one-time code, and `state` comes back as a query parameter on the callback URL, copied from the request unchanged. In SAML the response is the signed assertion itself, with `InResponseTo` naming the `AuthnRequest` ID.
5. The service provider checks that the response answers the request it made, in the browser that made it, and has not been answered before. In OIDC it then trades the code for the ID token at the identity provider's token endpoint, server to server, and finds the `nonce` inside the signed token. The identity provider mints every token, and the service provider only verifies. Then it starts a session and sends the user to the page it remembered.

Three of the names in step 1 deserve a line. The request goes to
OAuth's authorization endpoint, and OAuth would call it an
authorization request. OpenID Connect renamed it an authentication
request, because what comes back is a statement about who the user is.
`state` is a random value the partner makes up per request and gets
back unchanged. It means nothing to the identity provider and
everything to the partner. And PKCE is a secret the partner makes up,
sends as a hash, and reveals only when it trades the code for tokens,
so nobody who saw the code can finish the exchange.

```mermaid SP-initiated: the partner makes the request, the IdP answers it, and the response is bound to that request
sequenceDiagram
    autonumber
    participant U as Browser
    participant SP as Partner app (SP / RP, receiving side)
    participant IdP as Your IdP
    U->>SP: GET /reports/42 (deep link, no session)
    Note over SP: generate request (state, nonce, PKCE) and remember /reports/42
    SP-->>U: 302 to IdP with the request
    U->>IdP: authentication request
    Note over IdP: existing session found, no login page
    IdP-->>U: 302 back to SP with a response bound to the request
    U->>SP: response + state
    Note over SP: verify binding, exchange code, validate ID token
    SP-->>U: session cookie, 302 to /reports/42
```

The first line is the launch link, a deep link from your application
into the partner's. It could equally be a login page where the user
types an identifier and the partner works out which identity provider
to send them to. From the redirect on, it's the same flow. The diagram shows
OIDC. In SAML, the `AuthnRequest` ID and `InResponseTo` stand in for
`state`. Nothing stands in for the code exchange, which is why the
assertion ID cache carries the replay defense alone. In the POST
binding, which is the one you'll meet, nothing is fetched server to
server. The signed assertion itself comes back through the browser in the POST, to the partner's assertion consumer service, the ACS, so
everything the partner will ever know about this login is in that one
message. The service provider's metadata, the XML document the partner publishes about itself and the customer's administrator imports when the trust is set up, should say `WantAssertionsSigned="true"` on its `SPSSODescriptor`, so the identity provider signs the element the partner reads. That document is the partner's own. It is where the partner states its entity ID, its assertion consumer URL and its certificates, and the identity provider's metadata is the mirror of it, going the other way.

A word about the code, before the first block. If you're not building this, skip the blocks. Each is a numbered
listing, the list before each one says what it does and the paragraph
after it says why. If you are, the code is there to be
read against a library and its configuration, not typed into a
service.

A tenant, here and in every block that follows, is one customer's
slice of your platform, their identity provider with its keys and
issuer, their users, and the settings they chose, kept apart from
every other customer's. Every check that says "the tenant's" is a
check against that one slice and no other.

Nobody should write their own SAML consumer or OIDC relying party,
because of a class of bug called signature wrapping. The element that was signed and the element the
parser reads the subject from turn out to be different ones. A 2012
study (Somorovsky and others, "On Breaking SAML", USENIX Security
2012) found it in 11 of the 14 SAML frameworks it tested, and it has
been rediscovered since. A maintained library has been through that. A
parser written for one integration hasn't. For SAML, take exactly one
Assertion, verify every signature present and require one whose
reference covers that element, and read the claims from that same
element.

The Response and the Assertion are two different elements. The
Response is the envelope the identity provider sends. The Assertion is
the statement about the user inside it, and it is the Assertion that
gets encrypted, into an `EncryptedAssertion` element inside the
Response. If the assertion arrives encrypted, verify the Response's signature
first, then decrypt the assertion inside it, then apply the same rule
to what came out. That order is not signature wrapping. It is the
defense against it, applied twice, once to the envelope and once to
the assertion inside.

Decrypting takes two keys, and the message carries one of them. The
identity provider made a one-time symmetric key, encrypted the
assertion with it, then encrypted that symmetric key with the public
key from the encryption certificate you published in your own
metadata, the `KeyDescriptor` marked `use="encryption"`. It sent both
inside the `EncryptedAssertion`, the encrypted assertion and the
encrypted key. Your side does the reverse. Your private key, which
never leaves your key store and never appears in any message, decrypts
the symmetric key, and the symmetric key decrypts the assertion. That
is how public-key encryption runs in the opposite direction from
signing. For a signature the private key signs and the public key
verifies. For encryption the public key locks and only the private key
opens. Nobody in the redirect chain has your private key, so nobody in
it can read the assertion. Keep the encryption pair separate from the
signing pair so the two rotate on their own schedules.

Verifying the Response's signature before decrypting is stricter than
the profile, which is satisfied by a signed Assertion inside an
unsigned Response, and some identity providers send exactly that when
encryption is on. The rule here is a policy, that ciphertext nobody has signed never
reaches the decryptor, and it is a per-tenant switch. Turn it on for a
tenant whose identity provider sends the assertion signed inside an
unsigned Response and every login from that tenant fails. So find out
which kind each tenant's provider sends before the switch is set,
rather than from the outage.

And before any of that, the XML parser itself, with no external
entities and no DTD processing, or the first check never runs on the
document you think it does. A DTD, a document type definition, lets an XML document declare its
own named entities inline. An entity can expand to a file on the
server (the XXE attack, external entity injection) or to a string
that doubles at every level until the parser runs out of memory (the
billion-laughs attack). So the parser is told to ignore them before it
reads a byte of the Response. The blocks are what to check the library
against.

The binding is created on the request side, in a function shorter
than the callback that checks it. One function starts either
protocol's solicited flow. It validates the deep link against the receiver's own routes
(`ALLOWED_ROUTES`, the list the SAML section defines) before anything
leaves, mints the values the
answer will have to match, and writes them into the pending cookie.
The callback, Listing 2, and the SAML solicited handler pop what it wrote,
where to pop means to read the record and delete it in the same step,
so a second answer finds nothing. The SAML pending record is keyed
by the `AuthnRequest` ID, which is what the Response has to name in
`InResponseTo`.

```python Listing 1: `start_login`, the request side of a solicited flow, either protocol
def start_login(request, tenants, target, silent=False):
    # The receiver's side of a solicited flow, either protocol. Runs
    # when a deep link arrives with no session, or when a customer's
    # portal sends a user to our login. Everything the callback checks
    # against is written here, into a cookie only this browser holds.
    require(request.headers.get("Sec-Fetch-Dest", "document") == "document", "top_level")   # a top-level navigation, not a frame; the cookies paragraph below says why
    tenant = tenants.for_user(request)                      # the which-identity-provider section: by identifier, never by guess
    target = path_of(target or DEFAULT_LANDING)
    require(route_of(target) in ALLOWED_ROUTES, "target_route")   # the deep link is ours to check, not the IdP's
    pending = PendingLogin(tenant=tenant.id, after_login=target, silent=silent,
                           max_age=tenant.max_age, acr_values=tenant.acr_values)   # what the callback checks the answer against
    if tenant.protocol == OIDC:
        pending.state, pending.nonce = random_token(), random_token()
        pending.pkce_verifier = random_token(64)
        url = authentication_request_url(
            tenant=tenant, redirect_uri=tenant.callback_uri,
            state=pending.state, nonce=pending.nonce,
            code_challenge=s256(pending.pkce_verifier), code_challenge_method="S256",
            max_age=pending.max_age, acr_values=pending.acr_values,
            prompt="none" if silent else None)
    else:
        pending.request_id = "_" + random_token()           # the ID the Response has to name in InResponseTo
        url = tenant.sso_endpoint.with_saml_request(
            AuthnRequest(id=pending.request_id, issuer=OUR_ENTITY_ID, acs_url=OUR_ACS_URL,
                         is_passive=silent, force_authn=tenant.max_age is not None,   # the nearest SAML has to max_age
                         requested_authn_context=tenant.acr_values),                # and of acr_values
            relay_state=pending.request_id)                 # opaque; the target stays in the cookie, never in RelayState
    set_pending_login(pending)                              # a few entries, keyed by state or request id, popped by the callback
    return redirect(url)
```

The binding is what everything depends on, and it's the partner's to
keep. Listing 2 is the partner's callback, and every code block in
this post uses the same shape. The comments number the steps and say what
each one refuses. `require` refuses and logs the name of the check,
and a missing field is a refusal too. `tenants` is the configuration
set up ahead of time, looked up by id or by issuer. `SKEW` is a
minute. `MAX_WINDOW` is five minutes, the SAML bearer window an
identity provider normally mints, the minutes during which whoever
holds the assertion can present it. Only the SAML handler uses it, to
refuse an assertion whose window is wider than that. `LoginResult` and
`PendingLogin` are plain records whose fields default to `None`.
Nothing from a response is acted on until the check that covers it has
passed. Where a line rests on a particular sentence of a spec, the
prose after the block names it. The seven steps, in the order the code
runs them.

1. Find the pending request this response claims to answer, by popping it from the pending cookie. A second answer finds nothing.
2. Check which identity provider answered, `iss` against the tenant's issuer, or the per-issuer callback path when the provider doesn't send `iss`.
3. If the answer is an error, fail to a page. `login_required` after a silent attempt, a `prompt=none` request that must not show a login page, retries once without it. The pending record's `silent` flag is how the callback knows this was the first try. It never redirects to login.
4. Trade the code for tokens with the PKCE verifier, and check the token response before the token inside it.
5. Verify the ID token's signature. `alg` against the pinned list first, then the key named by `kid` in the token header, taken from the cached JWKS, the identity provider's published set of public keys.
6. Read the claims, each against what was expected, issuer, audience, `azp` (the authorized party, the client the token was issued to), `nonce`, the time window, and any freshness or strength the request asked for.
7. Finish. Start the session if this is a GET. If the response arrived by cross-site POST, the browser withheld the session cookie, so the handler cannot yet see whether someone else is signed in. It saves the verified result under a one-time handle and redirects the browser to a plain GET on our own site, where the cookie is visible and the session can be started. The paragraphs after the code say why.

```python Listing 2: `handle_callback`, the OIDC callback, seven steps
def handle_callback(params, request, tenants, now):
    # 1. Find the request this response claims to answer.
    #    The pending record lives in its own cookie, a few entries at
    #    most, and popping it means a second answer finds nothing.
    pending = pop_pending_login(request, params.get("state"))
    require(pending is not None, "pending_login")
    require(params.get("state") == pending.state, "state")
    tenant = tenants.by_id(pending.tenant)

    # 2. Which identity provider answered. A missing iss from an IdP
    #    that advertises it is the attack, not an omission (RFC 9207).
    if tenant.sends_iss:
        require(params.get("iss") == tenant.issuer, "iss")
    else:
        require("iss" not in params or params["iss"] == tenant.issuer, "iss")
        require(request.path == tenant.callback_path, "callback_path")   # one callback path per issuer (RFC 9700)

    # 3. An error answer. login_required after a silent attempt lands
    #    here and is retried once, plainly; every other error is a page,
    #    never a redirect to login.
    if "error" in params:
        return fail(known_error(params["error"]), pending, request, tenants)   # login_required after a silent attempt: one more start_login, without prompt=none; anything else is a page

    # 4. Trade the code for tokens, then check the response before
    #    the token inside it.
    require("code" in params, "code")
    tokens = exchange_code(tenant, params["code"], pending.pkce_verifier,
                           redirect_uri=tenant.callback_uri)
    require(tokens.id_token is not None, "id_token")
    require((tokens.token_type or "").lower() == "bearer", "token_type")

    # 5. Verify the ID token. The header is unverified input, so alg is
    #    checked against the pinned list before it selects anything.
    #    Keys come from a cached JWKS; an unknown kid triggers one
    #    rate-limited re-fetch, then fails. A token with no kid gets the
    #    tenant's one key of that algorithm, which the spec allows, or
    #    fails if there are several. Pinned algorithms are asymmetric only.
    header = peek_header(tokens.id_token)
    require(header.get("alg") in tenant.algs, "alg")
    key = tenant.key_for(header.get("kid"), alg=header["alg"])
    require(key is not None, "signing_key")
    claims = verify_jws(tokens.id_token, key=key, algs=tenant.algs)

    # 6. Read the claims, each against what we expected.
    require(claims.get("iss") == tenant.issuer, "token_iss")
    aud = as_list(claims.get("aud"))
    require(tenant.client_id in aud, "aud")                 # our client id at this IdP
    require(set(aud) <= {tenant.client_id} | tenant.trusted_audiences, "aud_untrusted")   # no audience we don't trust
    if "azp" in claims:
        require(claims["azp"] == tenant.client_id, "azp")   # when present, it names us; the trusted-audience line carries the weight
    require(pending.nonce and claims.get("nonce") == pending.nonce, "nonce")   # answers this request, not another
    require("sub" in claims and "iat" in claims and "exp" in claims, "required_claims")
    require(claims["iat"] - SKEW <= now < claims["exp"] + SKEW, "token_window")
    require("nbf" not in claims or claims["nbf"] - SKEW <= now, "nbf")
    if pending.max_age is not None:                         # we asked for freshness; check the answer
        require("auth_time" in claims and now - claims["auth_time"] <= pending.max_age + SKEW, "auth_time")
    if pending.acr_values:                                  # we asked for a strength; check the answer
        require(claims.get("acr") in pending.acr_values, "acr")

    # 7. Finish. Only a GET can see the session cookie and finish here;
    #    a form_post response arrived cross-site, and it and anything
    #    else go through the bounce below.
    result = LoginResult(tenant=tenant.id, subject=claims["sub"],
                         sid=claims.get("sid"), target=pending.after_login)
    if request.method == "GET":
        return finish_login(request, tenants, result)
    return stash_and_bounce(result)
```

The lines of Listing 2 that rest on a particular sentence of a spec. The
`iss` check is RFC 9207 section 2.4, and the per-issuer callback path
is the alternative RFC 9700 section 4.4.2 allows. The audience and
`azp` lines, `azp` being the authorized party, the client the token was
issued to, are OpenID Connect Core 3.1.3.7. The audience rule rejects
an ID token that names an audience the client doesn't trust. The `azp`
rule was softened in errata set 2, which now leaves `azp` to the
extension that put it there, so the code checks it only when present
and lets the trusted-audience line carry the weight. `nbf` is RFC 7519 section 4.1.5, optional but
binding when present. The token response check is Core 3.1.3.3 and 3.1.3.5.

Two cookies do the work in Listing 2, and the browser's rules for them
decide whether the checks mean anything. A cross-site POST is a
form submission that arrives at your site from a page on a different
site, which is exactly what the identity provider's auto-submitting
form is. The page that posts to your callback belongs to the IdP, so
the browser treats the request as coming from another site and applies
its `SameSite` rules to every cookie it might attach. `SameSite` tells
the browser when to send a cookie on a request from another site.
`Lax` sends it on a top-level navigation by GET, which is how an OIDC
redirect usually comes back, and not on a cross-site POST, which is
how the SAML POST binding and OIDC `form_post` come back. Top-level
means the whole page is moving to a new address, the kind of request
that changes what the address bar shows, as opposed to a request a
page makes from inside itself, for a frame, a script or an image. The
browser tells the server which kind it is in the `Sec-Fetch-Dest`
header, `document` for a top-level navigation, and that is what the
`top_level` check in Listings 1, 3 and 11 reads. With `Lax`
on the pending cookie the partner can't find the pending request, and
the binding to this browser is silently gone. `None; Secure` sends it
either way, which is what the pending-login cookie needs, and only
that cookie. Keep it separate, short-lived and `__Host-` prefixed, and
leave the session cookie `Lax`, or one callback has cost every other
endpoint its CSRF protection.

A cookie with no attribute at all is worse than an explicit `Lax`. Chrome treats it as Lax but still sends
it on a cross-site POST for two minutes after it was set, so the bug
shows up only for slow logins and only in some browsers.

```mermaid The cross-site POST and the bounce: which cookies the browser sends on each hop, and why the session starts only on the same-origin GET
sequenceDiagram
    autonumber
    participant IdP as Identity provider
    participant B as Browser
    participant SP as Partner (/sso/callback, /sso/finish)
    IdP-->>B: page with an auto-submitting form (SAML POST binding, OIDC form_post)
    Note over B: cross-site POST to the partner. The browser's cookie rules apply. __Host-pending (SameSite=None, Secure) is sent. The session cookie (SameSite=Lax) is withheld
    B->>SP: POST /sso/callback  response + __Host-pending
    Note over SP: verify every check against the pending record. The session cookie is invisible here, so "is someone else already signed in?" cannot be answered
    SP-->>B: Set-Cookie result=handle (Lax, seconds), 302 to /sso/finish
    Note over B: same-origin, top-level GET. Lax cookies travel, the session cookie and the result cookie
    B->>SP: GET /sso/finish  result handle + session cookie
    Note over SP: pop the result (single use), refuse a subject switch under a live session, start the session
    SP-->>B: session cookie, 302 to the page the user wanted
```

Two more functions, because of that rule. The SAML POST binding, OIDC
`form_post` and the signed handoff's launch all arrive as a cross-site
POST, and the browser doesn't send the `Lax` session cookie on a
cross-site POST. A
handler that finishes the login right there can't see whether a
different user is already signed in, so the "never switch accounts"
rule would pass by default. That matters because the rule is one of
the two holds against login CSRF. A victim signed in as themselves
receives an attacker's response by POST. A handler that finishes on
the POST can't see the victim's session, concludes nobody is signed in, and starts a new
session as the attacker. The victim's next hour of work lands in an
account the attacker can read, and the check that should have refused
it existed only on paper.

So the POST handlers validate, stash the verified result in a
single-use cookie, and bounce to a same-origin GET. That GET finishes
the login where the session cookie is visible. `Lax` is the right
setting for the session cookie. `Strict` would break
the bounce too, because to the browser the redirected GET is still
part of a navigation that started on another site.

Two rules cover the two small cookies, the pending cookie and the
result cookie the bounce adds. Their values are never
something the browser could write, because a forgeable result cookie
is a login as anyone. The pending cookie's value is an opaque id into
server-side storage, or the record itself sealed under a server key,
and the sealed option is for that cookie only. The result cookie's
value is a random handle to a server-side record, and the record is
consumed on first use. And their lifetimes differ. The pending cookie
lives for one login attempt, minutes, since the user may be at a login
page, but the result cookie lives for seconds. The result cookie is `Lax`,
like the session cookie, since the bounce is a top-level GET. The refusal at the end of Listing 3 is a page that says who is signed
in and offers sign-out, which is the one safe action.

```python Listing 3: `stash_and_bounce` and `finish_login`, the bounce and the only place a session starts
def stash_and_bounce(result):
    # Every POST handler ends here. The verified result goes into
    # server-side storage for seconds, only its random handle goes into
    # the cookie, and the browser is sent to a same-origin GET where
    # the session cookie is visible.
    handle = login_results.put(result, ttl=30)              # seconds; popped on first read, which is what makes it single use
    set_login_result_cookie(handle)
    return redirect("/sso/finish")

def finish_login(request, tenants, result=None):
    # The GET at /sso/finish, and the code-flow callback that arrived
    # by GET. This is the only place a session is ever started.
    require(request.headers.get("Sec-Fetch-Dest", "document") == "document", "top_level")   # framed, the session cookie is invisible again
    if result is None:
        result = login_results.pop(login_result_cookie(request))   # gone after this read, whatever the cookie still says
        require(result is not None, "login_result")
    tenant = tenants.by_id(result.tenant)
    require(no_live_session_for_another_principal(tenant, result.subject), "no_subject_switch")   # never switch accounts; refuse
    require(tenant_affinity(request) in (None, tenant.id), "tenant_affinity")   # the tenant this browser last logged into, a Lax cookie visible here; a different one is refused
    account = account_in_tenant(tenant, result.subject)     # scoped to this tenant; customer A's subject never resolves in customer B
    if account is None:
        require(tenant.provisions_on_first_login, "account")
        account = provision_in_tenant(tenant, result.subject)   # the least role, in this tenant, never more
    return start_session(tenant=tenant, subject=result.subject, account=account,   # a new session id, always
                         sid=result.sid,                                 # so back-channel logout can find it
                         session_index=result.session_index,            # so SAML logout can find it
                         session_ends=result.session_ends,              # the expiry the IdP asked for
                         target=result.target)                  # a path matched against our routes when it was stored
```

Each of the lines in `handle_callback`, Listing 2, closes one door.
There are four. Who can consume
the response, which browser can, how many times, and which identity
provider it may come from.

The first door is who. Only the party that made the request, because
only that party holds the PKCE verifier and its own client
credentials. `state` is not one of those. It travels in the URL, so
the browser has it, history has it, and anything in the redirect chain
may have it, which is why it proves nothing on its own and has to be
checked against a cookie. RFC 9700 is firmer here than the older text.
A client MUST prevent cross-site request forgery, by PKCE, by `nonce`,
or by a one-time `state` bound to the browser. PKCE itself is a MUST for public clients and RECOMMENDED for
confidential ones in RFC 9700, the best current practice in force. The
OAuth 2.1 draft, which folds that practice into the core, requires it
of every client except a confidential one whose OpenID Connect nonce
the authorization server has reason to trust, where it stays
recommended (section 7.5.1.1 of the draft), and that is where the
standard is going. A relying party holding its own
client secret is a confidential client, and Listings 1 and 2 use PKCE
regardless, because it costs nothing and closes authorization code
injection as well.

The second door is which browser. Only the one that made the request. The partner wrote the pending
request into a cookie only that browser holds, and reads it back from
the cookie the response arrives with. A different browser presents a
different cookie, or none, and finds nothing to match, whatever
`state` it claims. A partner that keeps `state` in a table with no session behind it has
given this door up. Login CSRF fails here, at the `state` and `nonce` lines. Login CSRF
is an attacker getting a response for their own account and delivering
it to a victim's browser. That response answers a request the
attacker's browser made, so the pending record for it lives in the
attacker's cookie, not the victim's. When the victim's browser presents
the response, it presents no matching record, and the `state` lookup
finds nothing. And if the attacker somehow planted a record, the
`nonce` inside the token would still be the one from the attacker's
request, not the one that record holds. Either line refuses.

The trap in this flow is that cookie. It is where the second door
usually breaks in practice, for the SameSite reason given before `stash_and_bounce`, which is
that a pending cookie left `Lax` isn't sent on the cross-site POST,
and the partner finds nothing to match. The pending record is the thing `state` is checked against, and the
record lives in that cookie, so a browser that withholds the cookie
has withheld the record, and step 1 of Listing 2 refuses every
POST-bound login, for every user and not only for attackers. That is
why the bug gets noticed fast. The usual repair is to look `state` up
in a server-side table instead, so the cookie is no longer needed,
which makes logins work again and gives the second door away, because
now any browser presenting a valid `state` matches.

The third door is how many times. Once. The pending request is gone
after the first answer, and the identity provider refuses a second
exchange of the same code, and should revoke what the first one issued. A code that arrives at
the token endpoint a second time is a code that leaked. Either the
legitimate client used it first and an attacker replayed it, or the
attacker got there first and the legitimate client is now the second
presenter. In both cases the tokens from the first exchange may be in
the wrong hands, so the identity provider revokes them rather than
trusting the first exchange because it came first. RFC 6749 section
4.1.2 says exactly that.

The fourth is which identity provider. The one the request went to,
and the `iss` lines hold it. The mix-up attack, a response from one
customer's identity provider landing at the callback that was waiting
on another, fails there. An application whose customers each bring
their own IdP is exactly the shape RFC 9207 was written for. Note what
the check refuses, not a wrong `iss` but a missing one. An IdP that
advertises the parameter and a response that arrives without it is the
attack, since an attacker relaying a response can strip a parameter it
can't forge.

The four doors, on the wire, in Listings 4 to 7. First the request
`start_login` sends, with the three values it made up for this
attempt.

```text Listing 4: the authentication request `start_login` sends
GET https://idp.customer-a.example/authorize
  ?response_type=code
  &client_id=partner-app
  &redirect_uri=https://app.partner.example/sso/callback
  &scope=openid%20profile%20email
  &state=Q4w9pLm2...                 fresh; remembered against this browser
  &nonce=7fA2kzR8...                 fresh; expected back inside the ID token
  &code_challenge=E9Melhoa2Owv...    S256 of a verifier only we hold
  &code_challenge_method=S256
  &max_age=300                       only if freshness was asked for
```

Then the cookie it sets at the same moment, which is the only place
the browser and the request are tied together. The value is an opaque
handle. What it points at is the record the callback checks against.

```text Listing 5: the pending cookie and the record it points at
Set-Cookie: __Host-pending=9c1f...; Path=/; Secure; HttpOnly; SameSite=None; Max-Age=600

  record 9c1f... (server side, or sealed under a server key):
    tenant:          customer-a
    issuer_expected: https://idp.customer-a.example
    state:           Q4w9pLm2...
    nonce:           7fA2kzR8...
    pkce_verifier:   dBjftJeZ4CVP...
    after_login:     /orders/123
    max_age:         300
    silent:          false
```

Then the response, as the browser delivers it, with the cookie coming
back because it was set `SameSite=None`.

```text Listing 6: the callback as the browser delivers it
GET https://app.partner.example/sso/callback
  ?code=SplxlOBeZQQYbYS6...
  &state=Q4w9pLm2...                 door two: matches the record this cookie points at
  &iss=https://idp.customer-a.example   door four: matches issuer_expected, and must be present
Cookie: __Host-pending=9c1f...
```

And the ID token that comes back from the code exchange, which the
handler makes with the verifier and its client secret, door one.

```text Listing 7: the ID token claims from the code exchange
iss:       https://idp.customer-a.example   door four again, against the same record
aud:       partner-app                      said to us, nobody else
sub:       0a7e...                          the stable identifier, never the email
nonce:     7fA2kzR8...                      answers this request, not another; door two
auth_time: 1790524710                       checked against max_age, since we asked
exp, iat:  the window
```

Door three is the pop. The record is gone the moment the callback
reads it, so the same `state` presented twice finds nothing.

SAML's solicited flow is the same function with the names changed.
`InResponseTo` is checked against the `AuthnRequest` ID the partner
remembered. The pending record is popped by that ID, the way the OIDC
callback pops by `state`. The landing page comes from that record
rather than from `RelayState`, which is opaque in this direction. And
the `Issuer` is checked against the tenant the request went to. After that it makes every check the [unsolicited
handler](#saml-idp-initiated) makes, except that its two `is None`
checks on `InResponseTo` become checks that it equals the request ID
the partner remembered, and that it does not need the `Origin` check,
because the binding to the request already proves which browser this
is. SAML has no code exchange, so it has no second
reason a replay fails. The profile still requires the partner to track
assertion IDs in the solicited flow, because pending-request
bookkeeping is looser than it looks. A cluster without a shared store,
requests kept alive for minutes, and an endpoint that may one day be
switched to accept unsolicited responses all loosen it.

If the user already has a session at the IdP, this flow is invisible.
Two redirects, no login page, and they land where they were going.
That is what the feature request asked for, and the baseline already
delivers it.

Invisible has a cost. The partner inherits whatever session the
identity provider has, and that session may be hours old and may have
been established with a password alone. Some partners need more than
that. A payroll page might require a second factor, or an
authentication no older than a few minutes. The only place a partner can ask for more is in the request, and
both protocols carry two dials there, one for age and one for
strength.

The strength dial is the authentication context. In SAML that is the
`AuthnContext` element inside the assertion's authentication
statement, and its `AuthnContextClassRef` is a URI naming how the user
authenticated, from the classes the SAML standard defines.
`PasswordProtectedTransport` for a password over TLS (the one in
Listing 8), `Password`, `Kerberos`, `X509`, `Smartcard`,
`TimeSyncToken` for a one-time code, `MobileTwoFactorContract`, and
more. The service provider asks with `RequestedAuthnContext` in the
`AuthnRequest`, listing the classes it will accept and a comparison,
`exact`, `minimum`, `better` or `maximum`. In OIDC the same dial is
`acr`, the authentication context class reference, a claim in the ID
token whose value is a string the two sides agree on. OpenID Connect
Core defines only one value itself, `0`, meaning an authentication
that meets no assurance level at all, a long-lived cookie for
instance. Every other value comes from a profile the deployment
adopts, the SAML class URIs reused as strings, an assurance level from
NIST 800-63 or eIDAS, or a provider's own names, such as `phr` for
phishing-resistant. The relying party asks with `acr_values`
in the request, a space-separated list of what it will accept in
order of preference, and the identity provider puts the one it
satisfied in `acr`.

The age dial is simpler. SAML asks with `ForceAuthn`, which demands a
fresh authentication whatever session exists, and reports the time in
`AuthnInstant`. OIDC asks with `max_age`, the oldest authentication
the relying party will accept in seconds, and the identity provider
answers with `auth_time` in the ID token. Both of those name the
moment the user last authenticated at the identity provider, not the
moment this request was made. A user with a session from this morning
gets this morning's time, which is exactly what a `max_age` of five
minutes refuses. The time of the request itself is elsewhere,
`IssueInstant` on the `AuthnRequest` and `iat` on the token. Step 6 of Listing 2 checks
both answers, `auth_time` against `max_age` and `acr` against
`acr_values`, and step 6 of Listing 9 does the same for SAML against
the tenant's configuration. The unsolicited flows have no request, so
there is nowhere to ask. A partner with a requirement can only read
the `AuthnInstant` and the authentication context it was given, and
refuse if they fall short. So on the receiving side the requirement
has to be in configuration before the first login arrives, which is
what step 6 of Listing 9 reads. Whether it should change the choice
of flow is the decision post's question, not this one's.

SP-initiated closes the gap by construction. There's always a request,
so there's always a binding. The binding is between the response and
the request this partner made in this browser, held by `state` and the
nonce in OIDC and by `InResponseTo` in SAML.

It has one limit. The binding proves this browser started the flow, not that the user chose
the account. Against a captured response from an identity provider you
can trust, that's enough. Against a hostile one, a tenant's own IdP
taken over or never friendly, it isn't. An attacker can point a
victim's browser at that IdP, and it answers with the attacker's
account, every check passing. What holds there is the same in every
flow. Refuse to switch subject when a session already exists, and keep
tenants' data apart, so an account in the wrong tenant sees nothing
worth stealing. SAML IdP-initiated can't close the unsolicited gap, and substitutes
what it can, but those substitutes narrow it and don't remove it. OIDC
third-party-initiated login closes the unsolicited gap by turning the
arrival into a request of its own, and then has this limit like every
solicited flow, with one more exposure of its own that its section
names. The signed handoff is unsolicited by design, and that's why
it's confined to one trust boundary.

The rule is that whenever a response can arrive unasked, the receiver
supplies the binding the protocol didn't. Single use, short life,
allow-listed target. Those three come up again, with no exceptions.
Single
use stops replay, the short life shrinks the window, and the list
stops the redirect. None of them stops login CSRF, because an
attacker's own fresh response for their own account passes all three.
Nothing in the protocol does, short of making the arrival solicited
again. So if there's any way to turn the unsolicited arrival back into
a request, take it. That's the whole of what the [OIDC flow described
below](#oidc-third-party-initiated-login) does, and it's why it's the
default for launches that start at the identity provider when both
sides speak OIDC. The three sections that follow are the arrival that
can't be turned back into a request, the arrival that can, and the
handoff, where there was never a request to begin with.

## SAML, IdP-initiated

Use this only when the launch has to start at the identity provider
and the partner speaks only SAML, and harden the receiving side,
whichever side that is.

The IdP builds a SAML Response with a signed Assertion inside it and
POSTs it to the service provider's Assertion Consumer Service, with
`RelayState` naming where to land. No `AuthnRequest` came before it.

```mermaid SAML IdP-initiated: a signed Response arrives at the service provider with no request to bind it to, whichever side owns the identity provider
sequenceDiagram
    autonumber
    participant U as Browser
    participant IdP as Identity provider (yours, or the customer's)
    participant SP as Service provider (the receiving side)
    U->>IdP: click a tile in the IdP's portal
    Note over IdP: build Response with signed Assertion, no request to bind to
    IdP-->>U: auto-submitting POST form + RelayState
    U->>SP: POST /saml/acs  SAMLResponse + RelayState
    Note over SP: validate signature, audience, time window, assertion ID unseen, then stash the result under a handle
    SP-->>U: result handle in a cookie, 302 to /sso/finish
    U->>SP: GET /sso/finish (top-level, session cookie visible)
    SP-->>U: session cookie, 302 to RelayState target
```

Listing 8 is the Response and its assertion, stripped to the parts the
partner has to check.

```xml Listing 8: a SAML Response, stripped to what the receiver checks
<samlp:Response ID="_r9" Version="2.0" IssueInstant="2026-09-27T16:00:00Z"
    Destination="https://partner.example.net/saml/acs">
  <saml:Issuer>https://idp.example.com</saml:Issuer>
  <samlp:Status><samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/></samlp:Status>
  <saml:Assertion ID="_a1b2c3" IssueInstant="2026-09-27T16:00:00Z" Version="2.0">
    <saml:Issuer>https://idp.example.com</saml:Issuer>
    <ds:Signature>...</ds:Signature>
    <saml:Subject>
      <saml:NameID Format="urn:oasis:names:tc:SAML:2.0:nameid-format:persistent">p-8c21e0</saml:NameID>
      <saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
        <saml:SubjectConfirmationData NotOnOrAfter="2026-09-27T16:05:00Z"
          Recipient="https://partner.example.net/saml/acs"/>
      </saml:SubjectConfirmation>
    </saml:Subject>
    <saml:Conditions NotBefore="2026-09-27T15:59:00Z" NotOnOrAfter="2026-09-27T16:05:00Z">
      <saml:AudienceRestriction>
        <saml:Audience>https://partner.example.net</saml:Audience>
      </saml:AudienceRestriction>
    </saml:Conditions>
    <saml:AuthnStatement AuthnInstant="2026-09-27T15:58:30Z" SessionIndex="s-77"
      SessionNotOnOrAfter="2026-09-28T00:00:00Z">
      <saml:AuthnContext>
        <saml:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport</saml:AuthnContextClassRef>
      </saml:AuthnContext>
    </saml:AuthnStatement>
  </saml:Assertion>
</samlp:Response>
```

And what the partner does with it. One assertion consumer service
endpoint receives both kinds of Response. One carrying `InResponseTo`
goes to the solicited handler. One without goes here, and only when
this tenant has unsolicited responses switched on. Every check the
profile requires here, it requires in the solicited flow too. What the
absence of a request adds is the first line, the replay cache as the
only defense, the `Origin` check, the freshness and strength checks
made from configuration rather than from a request, and the
`RelayState` mapping. The eight steps of Listing 9.

1. Read the envelope before any signature is verified. No `InResponseTo`, a Success status, and a `Destination` equal to ours whenever one is present, which it must be when the Response is signed. These lines may only refuse, never decide.
2. If the Response is signed or the assertion is encrypted, take the issuer from the Response, pick that tenant's keys, and verify the outer signature over the raw document before anything is decrypted.
3. Take exactly one assertion, decrypt it if it arrived encrypted, verify every signature present, and require one whose reference encloses the element the claims are read from. Re-read the issuer from the verified element.
4. Check who it was meant for and where it came from. Every audience restriction on its own, the browser's `Origin` header per tenant, and a bearer confirmation addressed to us with an end and no start.
5. Check the time windows. The bearer window, the Conditions window, `IssueInstant`, and the width of the bearer window against the ceiling. Refuse any condition the receiver can't evaluate.
6. Check the authentication statement, the `NameID` format agreed at setup, and any freshness or strength this tenant requires, since there was no request to ask in.
7. Record the assertion ID as used, in one atomic step, keyed by issuer.
8. Resolve the landing page from `RelayState`, a name we map or a path matched against our own routes, then stash the result and bounce.

```python Listing 9: `accept_unsolicited_response`, the hardened SAML receiver, eight steps
def accept_unsolicited_response(saml, relay_state, request, now, seen_ids, tenants):
    # 1. The envelope, read before any signature is verified, so these
    #    lines may only refuse, never decide anything.
    require(saml.in_response_to is None, "unsolicited")     # a Response naming a request is not for this path
    require(saml.status == SUCCESS, "status")
    if saml.destination or saml.is_signed:
        require(saml.destination == OUR_ACS_URL, "destination")

    # 2. If the Response itself is signed, or the assertion inside it
    #    is encrypted, the Response names its issuer; use that to pick
    #    the keys and verify the outer signature over the raw document
    #    before anything is decrypted.
    if saml.is_signed or saml.has_encrypted_assertion:
        tenant = tenants.by_issuer(saml.issuer)             # E17: the Response names its issuer in both cases
        require(tenant is not None, "response_issuer")
        if saml.has_encrypted_assertion:
            require(saml.is_signed or not tenant.require_signed_envelope, "signed_envelope")   # the policy: no decrypting what nobody signed
        if saml.is_signed:
            verify_response_signature(saml, tenant.keys())

    # 3. Exactly one assertion. Decrypt it now if it arrived encrypted,
    #    then verify every signature present, and require one whose
    #    reference encloses the element the claims are read from.
    assertion = the_one_assertion(saml, decrypt_with=OUR_DECRYPTION_KEY)
    tenant = tenants.by_issuer(assertion.issuer)
    require(tenant is not None, "assertion_issuer")
    verify_signatures(saml, assertion, tenant.keys(),
                      require_assertion_signature=OUR_METADATA.want_assertions_signed)
    require(covered_by_verified_signature(assertion), "signature_covers_assertion")   # its own or the Response's; never neither
    require(saml.version == "2.0" and assertion.version == "2.0", "version")
    require(assertion.issuer == tenant.issuer, "assertion_issuer")   # re-read from the verified element
    require(saml.issuer in (None, tenant.issuer), "response_issuer")

    # 4. Who it was meant for, and where it came from. An assertion may
    #    carry several SubjectConfirmations and one satisfied bearer
    #    confirmation is enough (Core 2.4.1), so the rule is written
    #    out: the bearer confirmations addressed to us, or none.
    require(assertion.audience_restrictions
            and all(OUR_ENTITY_ID in ar for ar in assertion.audience_restrictions), "audience")   # every restriction, on its own
    origin = request.headers.get("Origin")
    if origin == "null": origin = None                      # the literal "null", from a stripped referrer policy or a cross-origin redirect
    if tenant.enforce_origin:
        require(origin == tenant.sso_origin, "origin")
    elif origin != tenant.sso_origin:
        log("origin_missing" if origin is None else "origin_mismatch", tenant=tenant.id, origin=origin)
    bearers = [c for c in assertion.subject_confirmations if c.method == BEARER]
    require(all(c.in_response_to is None and c.not_before is None for c in bearers), "bearer_must_nots")   # a MUST NOT broken on any bearer is a malformed document; a Recipient that is not ours is merely not for us
    ours = [c for c in bearers if c.recipient == OUR_ACS_URL and c.not_on_or_after is not None]   # addressed to us, with an end
    require(ours, "bearer_confirmation")
    bearer = max(ours, key=lambda c: c.not_on_or_after)     # if several, the one still open the longest

    # 5. The time windows. The bearer window is the chosen confirmation's;
    #    the Conditions window is optional at both ends.
    require(now < bearer.not_on_or_after + SKEW, "bearer_window")
    require(assertion.not_before is None or assertion.not_before - SKEW <= now, "not_before")
    require(assertion.not_on_or_after is None or now < assertion.not_on_or_after + SKEW, "not_on_or_after")
    require(assertion.issue_instant - SKEW <= now, "issue_instant")
    require(bearer.not_on_or_after - assertion.issue_instant
            <= (tenant.max_bearer_window or MAX_WINDOW), "bearer_window_width")   # a wide window is a long replay window
    require(not assertion.conditions_not_understood, "conditions_understood")   # a condition we can't evaluate is a refusal

    # 6. The authentication itself, and any freshness or strength this
    #    tenant requires. With no request to ask in, this is the only
    #    place those can be enforced.
    require(assertion.authn_statement is not None, "authn_statement")
    require(assertion.name_id is not None
            and assertion.name_id.format == tenant.name_id_format, "name_id_format")   # the format agreed at setup; the value alone means nothing
    if tenant.max_age is not None:
        require(now - assertion.authn_instant <= tenant.max_age + SKEW, "authn_instant")
    if tenant.acr_values:
        require(assertion.authn_context_class_ref in tenant.acr_values, "authn_context")

    # 7. Single use, in one atomic step, keyed by issuer since IDs are
    #    only unique per issuer.
    require(seen_ids.add_if_absent((tenant.issuer, assertion.id),
                                   expires=bearer.not_on_or_after + SKEW), "assertion_id_unseen")

    # 8. Where to land: a name we map, or a path matched against our
    #    own routes. Never a URL followed as given.
    target = resolve_landing(tenant, relay_state)
    require(target is not None, "landing")
    return stash_and_bounce(LoginResult(tenant=tenant.id, subject=assertion.name_id,   # value with its qualifiers
                                        session_index=assertion.session_index,
                                        session_ends=assertion.session_not_on_or_after,
                                        target=target))
```

The receiver-side rules are Web Browser SSO Profile section 4.1.4.3,
Response message processing. That is where the party receiving is
required to verify the signatures, match `Recipient` against the
assertion consumer service URL, check the bearer `NotOnOrAfter`
against allowable clock skew, and discard an assertion that fails any
of it. What the identity
provider has to produce is 4.1.4.2, and two of its rules carry weight
here. The Response issuer is required when the Response is signed or
the assertion encrypted, which is the text as amended by erratum E17
rather than the published standard, and the bearer confirmation has an
end and no start, which is in the base text. Every audience
restriction is evaluated on its own, SAML Core 2.5.1.4. A condition
the service provider can't evaluate makes the assertion indeterminate,
Core 2.5.1.1. Every assertion delivered by POST must be covered by a
signature, its own or the Response's, profile 4.1.4.5 as amended by
erratum E26, and `WantAssertionsSigned` in the service provider's
metadata is how it asks for its own. The replay cache is keyed to the
bearer window, profile 4.1.4.5.

The trap is the absence. No request means no `InResponseTo`, so the
partner can't bind this Response to anything it started. That is why
IdP-initiated SAML is the flow every security review flags. It has the
gap from above, with nothing in the protocol to close it, and it adds one thing of
its own, the landing page, which comes after the two narrowings and
the confirmation screen.

Of the two vulnerabilities, replay is answered by the assertion ID
cache at step 7 of Listing 9 and by nothing else. A Response arrives
as a form POST through the user's browser, so anything that records
browser traffic holds a complete, validly signed copy, a corporate web
proxy that logs request bodies, or a HAR file, the network capture a
browser's developer tools export, which gets attached to support
tickets whenever someone is debugging a login. Whoever can read that
log or that ticket can POST the copy to the assertion consumer
service, and every signature and audience check passes, because
nothing about the document is wrong. It is good until its window
closes, and the assertion-ID cache is the only thing that refuses it
sooner. Login
CSRF isn't answered at all. That is the cost of the flow, and two
things outside the spec narrow it.

The first is the browser's `Origin` header on the POST. Check it
against the origin of that tenant's SSO endpoint, configured per
tenant, since it's often not the issuer's host. A Response re-served
from an attacker's page, or relayed through a redirect, won't carry
it. Enforced, that closes the re-served-page vector. It leaves two
cases open. The header comes back `null` whenever the identity
provider's referrer policy strips it, and `no-referrer` or
`same-origin` on a hardened IdP will do that, so make the check per
tenant, enforce or log, with its own log line for the missing case.
And it does nothing against an attacker who can inject into the
identity provider's own origin.

The second is the refusal to switch subject under a live session, from
above, which applies here with the most force. Between them the two
narrow the gap. They don't close it.

The one thing that closes it is the confirmation screen. When the
product decision is to have one, it sits at `/sso/finish`, after the
result has been popped and before `start_session`. That is the one
place the user is asked whether they meant to sign in here, now, as
this person. The pop is single use, so the screen puts the result back
under a fresh handle with a lifetime a person can read a page in. The
confirm is a same-origin POST carrying that handle in the same result
cookie `finish_login` already reads. And `no_subject_switch` runs
again on the confirm, since a session may have started in another tab
in between. It costs the silent launch the feature was asked for, which
is why it is [a
decision](/blog/sso-for-integrations-the-decision/#the-silent-launch-or-login-csrf-closed)
and not a default in Listing 3.

The landing page is the thing this flow adds. `RelayState` says where
to send the user after login, so anyone who can shape it can send a
freshly signed-in user to any address, until the partner checks it
against a list. The list is the partner's own, the routes inside its application
that a login may end on, written down, and matched by the partner's
own router the way every other request is. A route may carry an
identifier, `/reports/{id}`, which the route validates as it would on
any request. What the list excludes is a rule shaped like a URL,
"anything under our domain", a prefix, a wildcard, a host, because a
rule like that is one an attacker can satisfy and a list of routes is
a decision somebody made. That list is what every allow-listed target
in this post refers to, and what `ALLOWED_ROUTES` names in the code.

Two practical things. Many service providers refuse
unsolicited responses by default and have to be configured to accept
them, so the first question is whether the partner will take one at
all. And `RelayState` is limited to 80 bytes by the SAML bindings
spec, which is shorter than most deep links. So what crosses isn't the
URL. It's the name of a landing point, one of a small set the service
provider defined and the identity provider was given, and the service
provider maps it to the URL on its own side. That's the scheme you
impose when you own the identity provider. When you're the receiving
side, the customer's administrator has a "relay state" field in their
console and will type a URL into it. So the receiving code takes both,
a name it maps or a path it matches against its own routes, and never
a URL followed as given.

With the roles swapped, this is the case you'll meet most, a customer's
portal launching their users into your application from a tile. You
control neither the identity nor the authentication. All you hold is
the trust relationship with the customer, and you're the side receiving
an unsolicited response, so the hardening above is yours to do, not
theirs.

When you must support it, harden the receiving side as above. Then
write down, where the next team will find it, that this is the weaker
flow. Otherwise somebody promotes it to the default
because it was the one already working.

## OIDC, third-party-initiated login

When both sides speak OIDC and the launch has to start at the
identity provider, this is the flow, and it's the one that keeps the
response solicited.

OIDC never defined an IdP-initiated flow. What it has instead is
section 4 of the core spec, "Initiating Login from a Third Party", and
few teams building their own relying party know it's there.

Your IdP sends the user to a URL the partner registered for this
purpose, the `initiate_login_uri`. The request carries up to three
parameters. `iss` names the issuer sending them. It is required and
must be an https URL. `login_hint` is optional, a hint about which account the user has at
the identity provider, an email address, a username or an identifier
only the IdP understands. The partner passes it through unchanged in
the authentication request it builds, so the IdP can preselect the
account. It is a hint and nothing more. The identity comes from the ID
token, never from this parameter. Its point is the silent path. A
browser may hold several sessions at the identity provider, or one for
a different account than the tile was clicked from, and without the
hint the provider has to show an account picker. With it, the provider
preselects the account the launch was for and the user lands without a
click. The relying party gains nothing from the value itself and must
not read it as an identity. `target_link_uri` is where they
wanted to go, optional. They arrive by GET, or by an auto-submitted form as a POST,
so the endpoint takes both.

The partner checks `iss` against the issuers it's configured to trust
and `target_link_uri` against an allow list. Then it does the ordinary
thing. It builds a normal SP-initiated authentication request, with
state, nonce and PKCE, and sends the user back to the IdP that just
sent them. The IdP sees its own session and returns a response bound
to a request the partner made. The user arrives signed in, and the
response was never unsolicited. The arrival at the initiate endpoint
was, which is why this flow inherits the baseline's limit above, and why that endpoint refuses to be framed, which the paragraphs
after Listing 11 cover.

Signed in, but not always silently. If there is no session at the IdP,
the user sees a login page. If `login_hint` names an account other
than the session's, they may see an account picker. A partner that wants silent-or-fail makes the first attempt with
`prompt=none` and retries once without it, as the [loop
rule](#when-it-breaks) describes. Listing 11 makes the plain attempt, and
the `silent` flag in its pending record is where a `prompt=none`
attempt is marked, the way Listing 1 does it.

```mermaid OIDC third-party-initiated login: the unsolicited arrival becomes an ordinary SP-initiated request
sequenceDiagram
    autonumber
    participant U as Browser
    participant IdP as Your IdP
    participant RP as Partner app (RP, receiving side)
    U->>IdP: click a tile in your platform
    IdP-->>U: 302 to the RP's initiate_login_uri (iss, login_hint, target_link_uri)
    U->>RP: GET /oidc/initiate?iss=...&login_hint=...&target_link_uri=...
    Note over RP: iss matches configured issuer, target on allow list
    RP-->>U: 302 to IdP: normal authentication request (state, nonce, PKCE)
    U->>IdP: authentication request
    IdP-->>U: 302 back with code, bound to state
    U->>RP: code + state
    Note over RP: exchange code, validate ID token (nonce, aud, iss)
    RP-->>U: session cookie, 302 to target_link_uri
```

Listing 10 is what the IdP sends.

```http Listing 10: what the identity provider sends to the `initiate_login_uri`
GET /oidc/initiate?iss=https%3A%2F%2Fidp.example.com&login_hint=h-4e77a1&target_link_uri=https%3A%2F%2Fpartner.example.net%2Freports%2F42 HTTP/1.1
Host: partner.example.net
```

Listing 11 is the partner's endpoint for that arrival. It has nothing
new in it. It builds the same request Listing 1 builds, written out
here so the differences show. The tenant comes from `iss`, the target from `target_link_uri`,
and the answer lands in the same `handle_callback`, Listing 2. The
four steps of Listing 11.

1. Look up the tenant by `iss`, one we configured, never one discovered from what was sent.
2. Check `target_link_uri`. Our own origin, one of our own routes, and store the path, never the URL as given. The URL is input anyone can craft, so what gets followed after login has to be something our own routing table vouches for. Keeping only the path, after the origin and route checks, throws away everything a crafted URL could smuggle, a different host, a userinfo prefix, a backslash, a protocol-relative form.
3. Check the shape of `login_hint`, which is opaque to us and goes back only to the issuer that sent it.
4. Refuse to be framed, then start an ordinary request of our own, with `state`, `nonce` and PKCE written to the pending cookie, so the answer lands in `handle_callback` like any other.

```python Listing 11: `initiate_login`, the third-party-initiated endpoint, four steps
def initiate_login(params, request, tenants):
    # 1. Which identity provider sent them: one we configured, never
    #    one discovered from what was sent.
    tenant = tenants.by_issuer(params.get("iss"))
    require(tenant is not None, "iss")

    # 2. Where they want to go: our own origin, one of our own routes.
    #    What is stored and later followed is the path, never the URL
    #    as given.
    url = params.get("target_link_uri")                    # optional (Core 4); DEFAULT_LANDING is a path of ours
    if url is not None:
        require(origin_of(url) == OUR_ORIGIN, "target_origin")
    target = path_of(url) if url is not None else DEFAULT_LANDING
    require(route_of(target) in ALLOWED_ROUTES, "target_route")

    # 3. The hint is opaque to us and goes back only to the issuer that
    #    sent it, so its shape is all there is to check.
    hint = params.get("login_hint")
    require(hint is None or (len(hint) <= 256 and hint.isprintable()), "login_hint")

    # 4. Start an ordinary request of our own. The record goes into the
    #    pending cookie, a few entries with the oldest evicted, so a page
    #    hammering this endpoint can't grow the cookie past what the
    #    browser keeps. handle_callback pops the entry it answers.
    require(request.headers.get("Sec-Fetch-Dest", "document") == "document", "top_level")   # refuse to be framed; the CSP header covers browsers that don't send it
    pending = PendingLogin(tenant=tenant.id, state=random_token(), nonce=random_token(),
                           pkce_verifier=random_token(64), after_login=target,
                           max_age=tenant.max_age, acr_values=tenant.acr_values,
                           silent=False)                    # True on a prompt=none attempt
    set_pending_login(pending)
    return redirect(authentication_request_url(
        tenant=tenant,                                      # issuer, client_id, scope=openid
        redirect_uri=tenant.callback_uri,                   # the same value the code exchange presents
        state=pending.state,
        nonce=pending.nonce,
        code_challenge=s256(pending.pkce_verifier), code_challenge_method="S256",
        max_age=pending.max_age, acr_values=pending.acr_values,
        login_hint=hint,
    ))
```

One extra redirect turns the unsolicited case into the solicited one.
Everything the baseline protects against, this protects against, because
it's the baseline with a different front door.

The front door has one exposure the baseline's doesn't. The issuer
comes from the link, because Core section 4 defines it that way, and
the allow list in step 1 stops an issuer you never configured. It does
not stop a configured tenant that has turned hostile. That tenant's
identity provider can send a victim a link naming itself, and the
flow that follows is solicited, correctly bound, and lands the victim
in the attacker's account. That is the residual the [discovery
section](#which-identity-provider-is-this-users) describes, arriving
by this door. What holds is the same as everywhere else, the refusal to switch
subject under a live session and tenant isolation, both in Listing 3,
plus one more hold Listing 3 carries for this case, where this browser's
last login pinned a tenant, a login for a different tenant is refused.
That check runs at `/sso/finish` and not here, because the affinity
lives in a `Lax` cookie and this endpoint may be reached by a
cross-site POST that withholds it. The confirmation screen closes the
residual, at the cost the SAML section gives. One more thing the spec
recommends, in its own words "frame busting and other techniques", and
most implementations skip, the initiate endpoint should refuse to be
framed. A third party can send the user there, so a hostile
page can load it in an iframe and walk the victim through a login or
consent screen they can't see. The control today isn't a script, which
a sandboxed iframe defeats. It's `Content-Security-Policy:
frame-ancestors 'none'` with `X-Frame-Options: DENY` behind it, on
every endpoint in the login path, start, initiate, callback and finish.

The trap is the bad version teams build when they haven't read section
4 of Core. The IdP mints an ID token and POSTs it to the partner, and
the partner accepts it. That's IdP-initiated SAML with worse tooling
and no nonce. Never accept an ID token POSTed to you unasked. A
`form_post` response to a request you made, with a nonce you check, is
the baseline arriving by a different verb, but an ID token with no request
behind it is not. The other trap is `target_link_uri` as an open redirect. An open
redirect is an endpoint on your domain that sends the browser to any
address a parameter names. Attackers value them because a link that
starts on your trusted domain and ends on theirs passes mail filters
and the user's own eye, and one that sits after a login delivers a
freshly signed-in user, sometimes with tokens still in the URL, to a
page the attacker controls. That is `RelayState` under another name
and it needs the same list. Here the value is a URL rather than a name, and it can carry an
identifier, `/reports/42`, without becoming a pattern. The route,
`/reports/{id}`, is what's on the list, and the identifier is input
that route validates on every other request. What's excluded is a rule
shaped like a URL, a prefix, a wildcard, a host. The spec says the
relying party must verify the value to avoid being an open redirector.

If a partner says they support "OIDC SSO" and describes an ID token being
POSTed to them with no request of theirs behind it, they're
describing the trap. Point them at section 4 and wait.

## The signed handoff

This is the one situation the decision post allows, so here's the test. The
partner is inside your own trust boundary when the same organization
owns and operates both ends, holds the keys at both ends, and is the
one woken up when either one breaks. A partner you contract with isn't inside it, however friendly. A vendor that runs one module of your product under your brand, a reseller that hosts your product for its own customers, a long-standing integration partner with a shared roadmap. Their keys are theirs and their on-call is theirs. The way a partner usually comes to pass the test
is an acquisition. You bring a product on board and it becomes part of
you. Once its keys and its on-call are yours, what's left is the cost
of making it a relying party, and that cost is real.

What the handoff buys in that case is concrete. No identity-provider
client to add to a codebase that has none, no browser round trip
through an IdP, and a launch that works the day the keys change hands.
What it costs is everything the end of this section lists.

The platform mints a short-lived signed token, the launch carries it
in a POST body, the partner validates it, consumes it once, and starts
a session. One thing about the link. A token in a URL lands in browser
history, proxy logs and referrer headers. So the seconds of life and
the single use aren't tuning, they're what makes the link survivable,
and the token goes in a POST body, never a URL.

A token minted on one side and delivered to the other unasked is the
mechanism the previous section called a trap. What makes it acceptable
here is that one organization holds both sets of keys and both on-call rotations, and that's the entire reason for the boundary test above.

One phrase in the request belongs here. "Magic link", when it arrives
in one of these requests, means that the user clicks a link and is
signed into the other application with their permissions applied, and
no login page in between. That's a launch link carrying authority, and it's this handoff. Its rules are the
handoff's rules, single use, a life measured in seconds, bound to the
target. If it carries anything about authority at all it's a role, for
the reason [The account contract](/blog/sso-for-integrations-the-decision/#the-account-contract)
gives. The same phrase also names something else, a passwordless
credential sent by email in place of a password. The two have to stay
apart, because a launch link that lives long enough to forward is a
credential sitting in an inbox with no expiry. A deep link that starts
SSO is neither. It's a URL, it carries no authority, and it shouldn't.

```mermaid The signed handoff: a short-lived, single-use token inside one trust boundary, checked against your JWKS
sequenceDiagram
    autonumber
    participant U as Browser
    participant P as Your platform
    participant A as Partner app
    participant K as Your JWKS
    U->>P: click "open in Partner"
    Note over P: mint launch token (aud=partner, exp≈60s, jti, target)
    P-->>U: auto-submitting POST form to partner /launch (token in the body)
    U->>A: POST /launch  token
    A->>K: fetch signing keys (cached)
    Note over A: verify signature, iss, aud, exp, jti unseen, target on allow list, then stash the result under a handle
    A-->>U: result handle in a cookie, 302 to /sso/finish
    U->>A: GET /sso/finish (top-level, session cookie visible)
    A-->>U: session cookie, 302 to target
```

The token, with nothing in it that's not checked. Its header carries
an explicit type, `"typ": "launch+jwt"`, and the partner checks it. It is granting something, the right to open one session at the target, once, within seconds, but it grants it to a launch endpoint and not to an API. If your APIs verify tokens with the same keys, a launch token pasted into an `Authorization` header would pass the signature check and be read as whatever that API expects, with whatever authority the API infers from it. The explicit type is what lets every verifier refuse a token of the wrong kind before it reads a single claim, which is the token-confusion attack RFC 8725 recommends explicit typing against
for any new kind of JWT. The claims are Listing 12.

```json Listing 12: the launch token's claims
{
  "iss": "https://platform.example.com",
  "aud": "https://partner.example.net",
  "sub": "a1f9d2c4",
  "iat": 1790524800,
  "exp": 1790524860,
  "jti": "9c2e1f4a-7b3d-4e8f-9a1b-2c3d4e5f6a7b",
  "target": "/reports/42"
}
```

The partner's handler, Listing 13, in five steps.

1. Accept only a POST from the platform's origin, known in advance, with the token in the form body and never the query string, and only a token whose `typ` is `launch+jwt`.
2. Verify the signature with our cached keys and a pinned algorithm, re-fetching once on an unknown `kid`.
3. Read the claims. Our issuer, an audience that is exactly us, every required claim present, the time window, and a ceiling on its width.
4. Record the `jti` as used, in one atomic step, with the cache outliving the acceptance window.
5. Check that the target is a path on our origin matched against our own routes, then stash the result and bounce.

```python Listing 13: `accept_launch_token`, the handoff receiver, five steps
def accept_launch_token(request, now, seen_jti):
    # 1. A POST from the platform's origin, known in advance, the token
    #    in the form body and never the query string, and only a launch
    #    token, whatever else the platform signs with the same keys.
    require(request.method == "POST", "method")
    require(request.headers.get("Origin") == PLATFORM_ORIGIN, "origin")   # one known origin, so this one is enforced, not logged
    raw = request.form.get("token")
    require(raw is not None, "token")
    header = peek_header(raw)
    require(media_type_equal(header.get("typ"), "launch+jwt"), "typ")

    # 2. Verify. Cached keys, one rate-limited re-fetch on an unknown
    #    kid, algorithm pinned. We mint these, so kid is always present.
    key = PLATFORM_KEYS.key_for(header.get("kid"), alg="ES256")
    require(key is not None, "signing_key")
    claims = verify_jws(raw, key=key, algs=["ES256"])

    # 3. Read the claims. The audience is exactly us, which is stricter
    #    than the JWT spec asks and deliberate for a token we mint.
    require(claims.get("iss") == PLATFORM_ISSUER, "iss")
    require(as_list(claims.get("aud")) == [OUR_AUDIENCE], "aud")
    require("iat" in claims and "exp" in claims and "jti" in claims and "sub" in claims, "required_claims")
    require(claims["iat"] - SKEW <= now < claims["exp"] + SKEW, "token_window")
    require("nbf" not in claims or claims["nbf"] - SKEW <= now, "nbf")
    require(claims["exp"] - claims["iat"] <= 120, "token_window_width")   # a ceiling; the platform mints for about a minute

    # 4. Single use, one atomic step, with the cache outliving the
    #    acceptance window.
    require(seen_jti.add_if_absent(claims["jti"], expires=claims["exp"] + SKEW), "jti_unseen")

    # 5. Where to land: a path on our origin, matched against our own
    #    routes. The route match is the control; the string check only
    #    keeps a URL parser out of trouble.
    target = claims.get("target")
    require(isinstance(target, str) and target.startswith("/")
            and not target.startswith("//") and "\\" not in target, "target_shape")
    require(route_of(target) in ALLOWED_ROUTES, "target_route")
    return stash_and_bounce(LoginResult(tenant=PLATFORM_TENANT, subject=claims["sub"], target=target))
```

The `typ` comparison follows RFC 7515 section 4.1.9, a media type
compared case-insensitively with or without its `application/` prefix.

When the partner also needs to call your APIs for the user, don't
invent a second token shape. RFC 8693 token exchange already says
this. The partner presents the launch token as a subject token and
gets back an access token scoped for the resource it needs. Two
records keep the token single-use, and they belong to different
parties. The partner keeps one for launches, so a launch token is
accepted at its endpoint once. The platform's token endpoint keeps the
other for exchanges, so the same token is exchanged once. The exchange
happens at launch, inside the token's sixty seconds, and after it the
partner has a session and a token of its own. The token endpoint has
one rule beyond single use. It accepts a subject token only from the
client named in that token's `aud`. RFC 8693 leaves that to the
endpoint's policy, and here the policy should be exactly that. The
partner authenticates to the token endpoint as a client, and the
platform checks that the authenticated client is the one the token was
minted for, which is why the partner's client id and the launch
token's audience are the same string. Without that rule, a launch
token scraped from a log inside its sixty seconds is an API token for
whoever scraped it. The exchange request is Listing 14.

```http Listing 14: the token-exchange request the partner makes with the launch token
POST /oauth/token HTTP/1.1
Host: platform.example.com
Content-Type: application/x-www-form-urlencoded

grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Atoken-exchange
&client_id=https%3A%2F%2Fpartner.example.net
&client_assertion_type=urn%3Aietf%3Aparams%3Aoauth%3Aclient-assertion-type%3Ajwt-bearer
&client_assertion=eyJ...
&subject_token=eyJ...
&subject_token_type=urn%3Aietf%3Aparams%3Aoauth%3Atoken-type%3Ajwt
&resource=https%3A%2F%2Fapi.example.com
&scope=reports.read
```

The trap is that you have just built a federation protocol. You own key
distribution and rotation, revocation, audience discipline, single-use
enforcement, and the decision about what the token may carry and what
the partner may believe about it. SAML and OIDC give you every one of
those for the price of a redirect, and you have taken them on so that
nobody has to configure an identity provider. It's also the mechanism
most likely to be called temporary and still be in production five years later.

Use it inside one trust boundary and nowhere else. Validate the token the
way you would validate a stranger's, because by then it will be one. Make
it a plain JWT that RFC 8693 can exchange, rather than
something you invented, so the next engineer recognizes it without your
design doc.

## Consent, in the protocol

Who consents is decided in [the decision
post](/blog/sso-for-integrations-the-decision/#who-consents), which
has three cases. A skipped consent is always a record at the identity
provider, an admin consent grant, a trusted-client setting, an
attribute release policy. It is never a branch in code that decides at
runtime not to ask. What's left here is how consent works inside each
protocol.

Consent isn't the same thing in the two protocols. In OIDC the
protocol has a place for it. The request names scopes, the IdP shows
the user what the relying party is asking for, and the approval is
recorded against that client so later launches don't ask. A request
can also carry `prompt=none`, which shows the user nothing and fails
instead. The failures have names, `login_required`,
`consent_required`, `interaction_required`,
`account_selection_required`, and the partner has to handle every one
of them.

In enterprise SAML deployments there's no consent step. The
IdP's administrator decides which attributes go to which service
provider, the assertion carries them, and the user isn't asked. The
protocol was built for a world where the organization, not the
employee, decided what its directory shared with its vendors. Nobody
asks whether SAML consent can be bypassed, because it was never in
their way. Remember that before treating OIDC's consent screen as
sacred.

A relying party has nothing to skip in the first place. It can send
`prompt=none` and handle `consent_required`. A relying party that
"skips consent" in code is usually accepting something it didn't
verify.

## Single logout

Every mechanism above creates a session at the partner. None of them
ends one. Whether logout is expected, and in which direction, is [a
decision](/blog/sso-for-integrations-the-decision/#the-sign-out-direction).
The mechanisms are here, and the one worth asking a partner for is the
one that avoids the browser, because the browser-based ones fail
silently.

Most of the standard mechanisms go through the browser, which is where
they fail. SAML Single Logout, in its front-channel bindings, depends
on every service provider in the circle of trust responding in
sequence through the user's browser. One unresponsive partner leaves
the user on a spinner wondering whether they're signed out of
anything. The spec's SOAP binding avoids the browser, and almost no mainstream identity provider
implements it for logout, so treat it as unavailable unless the
partner shows it working.

OIDC Front-Channel Logout has
the IdP render an iframe to each partner's logout URI, so the partner
has to reach its own session cookie inside a frame somebody else
rendered. OIDC Session Management inverts it. The identity provider publishes
a `check_session_iframe` URL. The partner embeds that page, invisibly,
in its own, and every few seconds posts it a message asking "is the
session I logged in with still the one you have?" The iframe runs on
the identity provider's origin, reads the identity provider's session
cookie, and answers "unchanged" or "changed", and on "changed" the
partner re-checks with a silent request or signs the user out. That is why the two are mirror images. In front-channel logout the
partner's cookie has to be reachable inside the provider's frame, and
in session management the provider's cookie has to be reachable inside
the partner's page. Both need a cookie across an origin boundary.
Safari blocks that by default and Firefox partitions it by default,
and for either direction blocked and partitioned come to the same
thing. So front-channel logout is silently failing in more deployments
than know it. The session management spec itself now warns what that
does to the poll. An iframe that cannot read the identity provider's
cookie cannot tell whether the session is the same, so it answers
"changed" every time, and a partner that trusts the answer signs its
users out, or re-authenticates them, on every poll, forever. That the spec
carries the warning is the strongest evidence that the mechanism does
not survive current browsers.

The other one that avoids the browser is OIDC Back-Channel Logout. The
IdP calls each partner server to server with a signed logout token
naming the session. It's the one mechanism that survives the browser
and actually gets implemented. It also requires the partner to track
sessions by identifier and end one on demand, which is a real
engineering requirement many partners have never met. The token is
Listing 15.

```json Listing 15: a back-channel logout token
{
  "iss": "https://idp.example.com",
  "aud": "client-8f2a",
  "iat": 1790524800,
  "exp": 1790524920,
  "jti": "lo-4d1e",
  "sid": "s-77",
  "events": {
    "http://schemas.openid.net/event/backchannel-logout": {}
  }
}
```

It arrives by POST, from the identity provider's server to the
partner's registered `backchannel_logout_uri`, as a form parameter
named `logout_token`. No browser is involved and no cookie travels.
Listing 16 is the request as the partner
receives it, with the token cut short.

```http Listing 16: the back-channel logout request, identity provider to partner, server to server
POST /oidc/backchannel-logout HTTP/1.1
Host: app.partner.example
Content-Type: application/x-www-form-urlencoded

logout_token=eyJhbGciOiJSUzI1NiIsImtpZCI6IjIwMjYtMDkifQ.eyJpc3MiOiJodHRwczovL2lkcC5leGFtcGxlLmNvbSIsImF1ZCI6ImNsaWVudC04ZjJhIiwiaWF0IjoxNzkwNTI0ODAwLCJleHAiOjE3OTA1MjQ5MjAsImp0aSI6ImxvLTRkMWUiLCJzaWQiOiJzLTc3IiwiZXZlbnRzIjp7Imh0dHA6Ly9zY2hlbWFzLm9wZW5pZC5uZXQvZXZlbnQvYmFja2NoYW5uZWwtbG9nb3V0Ijp7fX19.signature-omitted
```

The partner treats the token like an ID token before it goes looking
for a session. The five steps of Listing 17.

1. Take the `logout_token` from the form and check its `typ`, if the identity provider typed it.
2. Verify it the way an ID token is verified. The issuer selects the keys, `alg` is checked against the pinned list, then the signature, then issuer, audience, `azp` and the time window.
3. Check what makes it a logout token and not some other token. The `events` claim, no `nonce`, a `sid` or a `sub`, and a `jti` not seen before.
4. End the session named by `sid`, or every session for the subject.
5. Answer 200 when the session is gone, including one that was already gone, and 400 otherwise, with `Cache-Control: no-store`.

```python Listing 17: `backchannel_logout`, the logout receiver, five steps
def backchannel_logout(form, tenants, now, seen_jti):
    # 1. The token, typed if the identity provider typed it.
    raw = form.get("logout_token")
    require(raw is not None, "logout_token")
    header = peek_header(raw)
    if "typ" in header:
        require(media_type_equal(header["typ"], "logout+jwt"), "typ")

    # 2. Verify it the way an ID token is verified: issuer selects the
    #    keys and is re-read after the signature holds, and alg is
    #    checked against the pinned list before it selects anything.
    tenant = tenants.by_issuer(unverified_issuer(raw))
    require(tenant is not None, "iss")
    require(header.get("alg") in tenant.algs, "alg")
    key = tenant.key_for(header.get("kid"), alg=header["alg"])
    require(key is not None, "signing_key")
    claims = verify_jws(raw, key=key, algs=tenant.algs)
    require(claims.get("iss") == tenant.issuer, "token_iss")
    aud = as_list(claims.get("aud"))
    require(tenant.client_id in aud and set(aud) <= {tenant.client_id} | tenant.trusted_audiences, "aud")
    if "azp" in claims:
        require(claims["azp"] == tenant.client_id, "azp")
    require("iat" in claims and "exp" in claims and "jti" in claims, "required_claims")
    require(claims["iat"] - SKEW <= now < claims["exp"] + SKEW, "token_window")
    require("nbf" not in claims or claims["nbf"] - SKEW <= now, "nbf")

    # 3. What makes it a logout token and not some other token.
    events = claims.get("events")
    require(isinstance(events, dict)
            and isinstance(events.get("http://schemas.openid.net/event/backchannel-logout"), dict), "events")
    require("nonce" not in claims, "no_nonce")
    require("sid" in claims or "sub" in claims, "sid_or_sub")
    require(seen_jti.add_if_absent((tenant.issuer, claims["jti"]), expires=claims["exp"] + SKEW), "jti_unseen")

    # 4. End the session, or every session for the subject. A session
    #    that was already gone counts as ended; a sid that belongs to a
    #    different subject is refused.
    if "sid" in claims:
        outcome = end_session(tenant, sid=claims["sid"], subject=claims.get("sub"))
    else:
        outcome = end_all_sessions(tenant, subject=claims["sub"])

    # 5. 200 when the session is gone, 400 for a bad token or a failed
    #    logout. A session already gone still counts as ended, so this
    #    cannot be one boolean: a "not found" that became a 400 would
    #    tell a caller which sessions exist.
    gone = outcome in (ENDED, ALREADY_GONE)
    if not gone:                                 # a failed logout must be retryable with the same token
        seen_jti.discard((tenant.issuer, claims["jti"]))
    return response(200 if gone else 400,
                    headers={"Cache-Control": "no-store"})
```

Validating the token the way an ID token is validated is Back-Channel
Logout section 2.6. The response codes and the `Cache-Control` header
are section 2.8. The spec tolerates the 204 some frameworks substitute for the 200.
The 2022 text answered a failed logout with 501. Errata set 1
(December 2023) folded that case into 400, so a partner still sending
501 is reading the older text. One registration detail
the whole mechanism rests on. The partner only has a `sid` to match if
the IdP put one in the ID token at login, and the partner asks for that
with `backchannel_logout_session_required`. A partner that never
registered it will be looking for a session by a `sid` it never
received.

OIDC RP-Initiated Logout is the reverse direction. The partner asks
the IdP to end its session, for when the user signs out at the partner
first. Without it, signing out of the partner leaves the IdP session
alive, and the next click signs them straight back in. It has its own
redirect, `post_logout_redirect_uri`, and the same rule applies,
registered ahead of time, matched exactly, or the IdP must not follow
it. Send the `id_token_hint` too. Without it the IdP is required to
ask the user to confirm the logout. It must also refuse the redirect
unless it has some other way, `client_id` at least, to confirm where
it's being asked to send them.

Then what the partner can actually do, because a yes to single logout
on paper is worth nothing without the mechanism behind it. Sessions
end, but tokens don't. A partner that holds access or refresh
tokens for your APIs keeps them when its session ends, unless
something revokes them or they were short-lived enough not to matter.

So the design has to answer three things. Can the partner end a
session when it's told to? If it can't find a session by identifier,
the `sid` in the logout token or the `SessionIndex` in SAML, and kill
it, back-channel logout can't work no matter what the contract says.
Can the tokens issued alongside that session be revoked, and does
anything actually call the revocation endpoint when logout happens? A
self-contained access token can't be pulled back once issued, only
outlived, and the revocation RFC says as much. So the operating answer
is short-lived access tokens and refresh tokens that get revoked. And
what happens when logout fails? Silent success is the worst answer and
the default one. A logout that couldn't reach a partner should say so.

And the fallback nobody likes. If you can't end a session, make it
expire. SAML even carries a number. `SessionNotOnOrAfter` on the
authentication statement is the identity provider saying when its own
session ends, and a partner that treats it as the ceiling on its own
session has this fallback without a negotiation. A partner session
that outlives the IdP session by eight hours is a design decision,
whether or not anyone made it.

## Which identity provider is this user's?

Decide which identity provider a user belongs to when the account is
provisioned, and check at every login that the assertion came from
that one and no other.

With a large enough customer base you'll be on both sides at once.
Some customers' users authenticate against you, and others arrive at
your application having to authenticate against their own identity
provider. Sometimes more than one per customer, split by population.
So before the redirect there's a question the diagrams skip. Which
identity provider does this user belong to? The answer is an
identifier and configuration done ahead of time. The identifier is
unique, the mapping from identifier to identity provider is set up
when the trust is, and between them they mostly take the question
away.

Two rules, because this part is user-facing. Let the user identify themselves with something they
understand, usually their email address. And never ask a user in a
corporate environment which identity provider to authenticate against.
Most of them won't know what you're asking, and the list of choices is
a list of your customers, readable by anyone who reaches the page.

The identifier lookup has the same problem in a quieter form. If an
unknown address gets a different answer from a known one, the login
page confirms who your customers are, one request at a time. Answer
both the same way, and rate-limit the lookup like a password form.

The mapping set up with the trust is also the answer to a problem
that's easy to address and often not handled. The association between
a user and their identity provider is made at provisioning time. The
runtime check is that the assertion that comes back was issued by that
identity provider and no other. Skip the check and customer A's
identity provider can assert a user who belongs to customer B, with a
valid signature and the right audience, because nothing ever tied the
identifier to the issuer. Every identity provider you trust is trusted
to sign, and the signature says nothing about whose users it may speak
for. The assertion is only wrong in the one place your code didn't
look.

Where one organization uses more than one identity provider, in my
experience it's because the populations carry different roles,
administrators on one and everyone else on another. A separate
identifier per identity provider keeps them apart cleanly. The two
populations usually share an email domain, so the lookup is per user
once an account exists, pinned at provisioning or at the first login.
Only before that, with no account yet, is discovery by domain or by
the invitation that brought them. An unknown address goes to the
domain's identity provider, or to your own login, with the same
redirect shape and timing as a known one. Be clear about what that
hides and what it doesn't. The per-user answer is hidden, but
discovery by email domain reveals the tenant by design, since any
address under a customer's domain is sent to that customer's identity
provider. Where that matters, discovery is scoped to the invitation or
to a tenant-specific login URL instead. Email is fine as the thing the
user types. It's never the key that links the account, for the reason
[The account contract](/blog/sso-for-integrations-the-decision/#the-account-contract) gives.

There is one thing the issuer check and the request binding together
still do not do, and it is the residual the flow tables in both posts leave for this
section. Binding a request to this browser proves that this
browser started the flow. It does not prove that the user chose the
identity provider the flow went to. If a link can name the tenant, an attacker who controls one tenant's
identity provider can send a victim a link that starts a solicited,
correctly bound login against the attacker's provider. That provider
asserts the attacker's own account, and the victim lands inside it.
Login CSRF by a different door, with every check passing. The rule that closes it is that the choice of identity provider
comes from what the user in this browser typed, or from the account
pinned at provisioning, never from a parameter in the link that
started the login. A link may carry a destination inside the
application. It may not carry the tenant. One flow breaks that rule
by design. OIDC's third-party-initiated login takes the issuer from
the link, because that is how Core section 4 defines it. Its section
says what that costs and what holds in its place. Where a tenant-specific
login URL exists, it is the user's own bookmark, and the page it lands
on shows which tenant it is signing into.

From the service's side, which identity provider a user came through
matters exactly once, at the issuer check above. After it, what
matters is the claim they carry.

## The account contract

SSO moves an authenticated identity across a boundary. It doesn't
create, update, delete or reconcile the account on the far side. Every one
of those is a decision, and the integration isn't done until each has an
answer.

What you are being asked to do is to make sure the account the user
authenticated into on the launching side is uniquely and correctly
linked to an account on a platform you don't manage. And that it is
never mapped to the wrong one. That is
the account problem in a sentence, and choosing a protocol doesn't
touch it.

Three parties are involved. The customer, whose people these are, who
wants to reach both platforms and authenticate once. You, one of the
two partners, which may or may not hold the identity provider the user
authenticates against, and which launches the user into the other
partner. And the other partner, which has to trust what you send, let
the user into an account it owns and manages itself, and take your
word that the user is who you say they are. Which partner plays which
role isn't fixed. It moves with the requirement, and you can find
yourself on either side, or on both at once with different partners.

Each side holds an account, or the record that stands in for one, and
the two partners have to stay in step about them. A change on one side
doesn't automatically reach the other. If the two are ever out of step
about who a user is, or whether they still exist, the integration is
quietly broken and nobody finds out until someone can't log in, or
someone who left still can, or a user is linked to the wrong account.
That last one is the worst case, because nothing fails. A person
leaves, the customer's directory later gives their email address to a
new hire, and a partner that links on email lands the new hire in the
leaver's account, with the leaver's data and the leaver's role. The
login succeeds, so nobody looks. Who owns the lifecycle and which side is
authoritative for what is a business decision, made at the company
level, and its consequences land on the people building the
integration. Ask it before the protocol work starts.

Provisioning, first. Either the partner account is created just in
time from the assertion, or it was provisioned ahead of time over SCIM, the standard
provisioning API. Prefer SCIM where the partner supports it, and find out early
whether it supports it at all, because when SCIM isn't there
provisioning doesn't disappear, it becomes an out-of-band process with
a named owner or code written for this one partner. Just-in-time is
acceptable when three things are answered first. What role a new
account gets, where the safe answer is the least one and never an
administrator. Which tenant it lands in, which is the question that
decides whether one customer's user can appear inside another's. And
what happens on the second login when an attribute has changed. A
just-in-time integration with none of those answered is how the wrong
person ends up in the wrong tenant with more rights than anyone meant.

However the account gets there, the identifier written into it has to
be the one the assertion later carries, which is the first thing
[Linking, the identifiers](#linking-the-identifiers) settles.

Then linking, which is which local account the federated identity maps
to. Link on the subject the identity provider asserts, paired with the
issuer that asserted it, because the pair is what is stable, and not
on the email address. Addresses change, they get reused, and email is
the first thing an attacker tries to set on an account they control so
that it matches an account they want. If you match on email anyway,
because the customer's identity provider sends nothing else, write
down in the design how each of those is handled.

Stable is a promise the identity provider makes, though, not a
property of the universe, and it is narrower than it sounds. It holds
for one issuer talking to one receiving party. A customer migrating identity providers, a tenant merged, a directory
rebuilt, a broker put in front or taken out. Any of those can hand you
a new value for the same human being, and the last two do it without
the customer changing identity provider at all. So the account contract needs one
more line than people write, which is what happens to existing links
when the value changes. Decide it while everyone is still friendly,
because the alternative is discovering it during a migration with
every user locked out.

One case deserves naming on its own, because it's where account
takeover lives. If users already have accounts at the partner, with
passwords of their own, the first federated login has to attach to one
of them. If it matches on anything the user can set, then whoever can
set that value on an account they control can attach themselves to an
account they don't. Decide it in advance. Either an administrator makes the link, or the user proves they hold
the existing account before it's made, or there is no existing account
because provisioning created it, or, where the identity provider can
send nothing but an email address, the single first-login match that
[Linking, the identifiers](#linking-the-identifiers) constrains on
both sides. If the partner already has a rule and won't change it,
find out what the rule is before anyone signs anything.

Attributes. What crosses, what the partner may keep, and who wins when
they disagree. Make the identity provider authoritative for anything
it asserts, and don't let the partner edit what it didn't issue.
Nothing in the protocols enforces that. It's a position you take and
then have to hold.

Deprovisioning. Offboarding at the identity provider has to reach the
partner, or the partner keeps a live account for a person who no
longer exists. And deprovisioning does not end a session by itself.
SCIM leaves the meaning of an inactive account to the partner, so
marking one inactive may or may not end the session the leaver already
has open, and it may or may not stop the next login either. Some
partners do end sessions on deactivation, as a courtesy rather than a
requirement. Ask rather than assume, in both directions. Where they
don't, the gap is closed by the logout decision above or by a session
short enough that it doesn't matter.

SSO also doesn't close the partner's own front door. If the partner
still accepts a local password for these users, then deprovisioning,
the sign-out decision and the authentication bar all have a way around
them. Ask whether local login is disabled for federated users. Then
ask the opposite question, which is how anyone gets in when federation
is down, because a named break-glass account with its own audit trail
is a decision somebody made and password login left on for everyone is
not.

Roles cross. Permissions don't. A role is part of who someone is,
analyst, administrator, read-only, and the identity provider can
assert it. A permission is what a role may do inside one application,
and it belongs to that application alone. Carry the role, and let each
application manage its own permission set.

Then separate two moments, because conflating them is where this goes
wrong. Provisioning is when the account gets or changes its
entitlements, and it may raise them as well as lower them, or a user
who gets promoted can never gain anything. A just-in-time first login
is that same moment arriving early, with the assertion creating the
baseline rather than narrowing one. The launch is the other moment,
and there the rule is narrow. A session may narrow what the account
already holds and must not add to it. A launch that hands someone
rights their account doesn't have, with no provisioning event anyone
can point at, is a privilege escalation with a login attached. That is
a rule you impose, not one the protocols enforce.

Two more things the assertion can do that the documents may not ask
about. If the partner is itself an identity provider to somebody else,
your assertion can become the basis of a launch into a third
application you never agreed to, so ask whether the partner
re-federates and say in writing whether that is allowed. And if your
own support staff can view the application as a user, ask whether that
impersonated session can launch, and whether the partner can record an
actor distinct from the subject, because otherwise its audit log will
say the user did it. The same question covers service and shared
accounts, and the answer can legitimately be that they may not launch
at all.

Write the account contract before the SSO contract. Once you own the
capability, the protocol work for the next partner is shorter. The
account lifecycle is what you'll still be supporting for as long as
the relationship exists. The identifiers themselves, and the one safe
use of email, are in the next section.

## Linking, the identifiers

The contract above makes the decisions. Whether any of them can be kept
depends on the identifier itself.

Provisioning and linking share one value. The identifier SCIM writes
into the account, `externalId` or whatever the contract names, has to
be the value the assertion later carries as its subject. Otherwise the first launch has nothing to match on except the email
address the contract above allows only as a last resort. If the customer's identity provider can't send
the same value both ways, the account contract isn't finished.

The contract above settled that the link is the subject and not the email
address, and that email is used only if the customer's identity
provider sends nothing else. Concretely, the subject is a persistent
`NameID` in SAML and the `sub` in OIDC. In both cases the key is the
pair of issuer and identifier, never the identifier alone, since `sub`
is unique only within its issuer. The persistent `NameID` is what the
spec offers. What enterprise identity providers send by default is
usually an email-shaped or unspecified one, and the immutable
identifier, if you get it, arrives as an attribute you asked for on the integration form, the
document the two sides fill in when the trust is set up, which the
decision post walks through. So ask for it, and put the ask on the design-review list.
Where the customer's identity provider can send nothing else, the one
safe use of email is a single match at the first login. The address
has to be asserted by a trusted issuer, inside the tenant that issuer
belongs to, and marked `email_verified` in OIDC. And the address on
the local account has to be one that provisioning or an administrator
set, never one the user can edit, or the match is the takeover the
account contract describes. After that match the
pair of issuer and identifier is pinned and email is never consulted
again.

And know which kind you're getting. A persistent `NameID` is
per service provider by design, and its identity is the value together
with its qualifiers. A pairwise `sub` is different at every relying
party. That is what you want across a trust boundary. Inside one it
breaks a "same user across our apps" assumption, unless your
applications are registered under one sector identifier in OIDC, or
one affiliation in SAML, so the IdP treats them as one.

## When it breaks

Three failures are worth planning for. One is scheduled, a certificate
that expires on a known date. Two are not, a redirect loop and a clock
that has drifted. When any of them happens, the log is what you'll
have, so logging comes last. The scheduled one first.

The form has a certificate on it, and the certificate has a date, and
[the decision post](/blog/sso-for-integrations-the-decision/#when-it-breaks)
has the incident that follows when nobody owns it. Here is the
mechanism that prevents it.

Rotating on time needs a mechanism, and it comes in two shapes. Where
both sides can hold two certificates with overlapping validity, rotation
is routine. Record when the certificate was issued, set the reminder
long before it expires, publish the new one alongside the old, and have
a named person make the switch, which is then a routine change. Where either side can
hold only one, and it's usually the side that verifies, rotation is a cutover, and a cutover is an outage. It
goes into a window when no users are on the system, usually a weekend,
and most of the time it fits the upgrade and release window that
already exists.

The mechanics of rotation differ by protocol, and the two protocols
even name the thing being rotated differently. A signing key pair has
two halves. The private key, which stays at the identity provider and
signs, and the public key, which the partner holds and verifies with.
A certificate is that public key wrapped with a name, validity dates
and an issuer's signature, a container for delivering it. SAML
delivers the public key inside an X.509 certificate in the metadata,
so in SAML the thing you rotate is a certificate, and its expiry date
is what goes on the form. OIDC delivers the same public key bare, as a
JSON Web Key in the JWKS, with a `kid` to name it and no dates on it
at all, so in OIDC the thing you rotate is a key. In OIDC the partner
fetches your keys from your JWKS endpoint, and the token's header names its key by
`kid`, so the partner picks the right one from the set. The rotation
is making sure that endpoint carries the new key before anything is
signed with it, and keeps the old one until nothing signed with it is
still alive. In between there is one question for the partner. How
long do you cache our keys, and do you re-fetch on a `kid` you don't
know. In SAML the way to go is two signing `KeyDescriptors` in your
metadata. Whether the partner can hold two, and whether it re-reads
your metadata at all, is never on the document that gets passed
around. The practitioner's answer to the second half is to exchange
metadata by URL rather than by file, with `validUntil` and
`cacheDuration` set, so a rotation is a publish and not an email. Like the [three logout questions](#single-logout), ask it in the design
review.
Ask one more thing, because it decides whether the date matters at
all. The SAML metadata interoperability profile says the certificate
in metadata is a key container whose validity dates are not to be
evaluated, and a good many products evaluate them anyway. This is
operations more than protocol. It matters more as organizations
shorten certificate lifetimes across the board, the way public TLS
already has.

Then the two that arrive unscheduled, and the logging you'll need when
they do. By far the most common page is "users can't log in", and it
has more causes than anyone can list. These are the ones I've met.

The loop. The partner received a response, refused it, and its failure
handling was to start over, so the user bounces between the two sides
until the browser gives up. The reasons are too numerous to list. A
cookie that doesn't survive the cross-site POST back, a callback
sitting behind the login check, a validation failure swallowed into
"not authenticated". The fix is the same for all of them. A hard rule.
Never redirect to login from a callback on a validation failure. You
either fail to an error page, with a code on it, or you're in. The
page may offer to start over, because some failures are benign, an
expired response from a login page left open too long, a session
cookie cleared in between. It must not start over by itself.

The code on that page is a reference number for support to look up,
not a description. Which check failed belongs in the log, because "signature invalid" and
"unknown user" and "expired" are exactly the distinctions someone
probing your callback would like to be told. The one redirect a
callback may make on its own is the expected one. A `prompt=none` request, the silent-login request, that
comes back `login_required`, or one of its siblings from [Consent, in
the protocol](#consent-in-the-protocol), is an answer, not a failure. Retrying once
without `prompt=none` is the design working. SAML has the same pair,
`IsPassive="true"` on the request and a `NoPassive` status back, and
the same rule. Once, and never on an error.

The clock. Every assertion carries a validity window minutes wide. A
partner whose clock has drifted rejects them as not yet valid or
already expired, intermittently, in a way that gets blamed on the
identity provider. Put a tolerance in the validation logic, short but
acceptable, a minute each way. Know it won't cover everything, because
you never know how long a request sat blocked before it reached you.
The answer to that isn't a wider tolerance, which widens the replay
window with it. It's the assertion's own window, and single-use IDs.

And logging. Know these problems exist before you're paged, because logging only helps afterwards, and only if it captured
enough. The assertion or token ID, the request it claimed to answer,
issuer, audience, the validity window next to your own clock, the key it
was signed with, and the name of the check that failed. And not the
assertion itself, not the token, not the attributes it carried. Those
are personal data and sometimes credentials, and a log that holds them
has turned a diagnostic aid into a security and audit problem of its
own. Log identifiers and verdicts, never payloads.

## Before it goes live

For whoever builds it. The tests that have to fail. A green happy path proves the partner
accepts a good response. These prove it refuses a bad one, which is the
half that has to be scheduled on purpose.

1. A response replayed after it was accepted once, and in OIDC a code
   presented twice.
2. A response presented after its validity window, and one presented
   before it.
3. A SAML response for the wrong audience, and one for the wrong
   recipient.
4. An ID token whose `aud` doesn't name our client, one that names an
   audience we don't trust, and one whose `iss` isn't the issuer the
   request went to.
5. A response with `iss` stripped, from an identity provider that
   advertises it.
6. A code exchanged with a different `redirect_uri` than the request
   carried.
7. A response whose authentication is older, or weaker, than the
   partner asked for.
8. An unsolicited response at a partner that shouldn't accept one, one
   carrying `InResponseTo` arriving at the unsolicited path, and a
   `form_post` or POST-binding response arriving with no pending
   cookie, which must fail cleanly and never redirect to login.
9. A valid assertion from a trusted issuer for a subject provisioned
   under another tenant, one arriving while a different subject is
   signed in, and a login for a tenant other than the one this browser
   last pinned.
10. A Response where the signed element and the element the subject is
   read from are not the same one, a bearer confirmation carrying
   `NotBefore`, and a POST whose `Origin` is not the tenant's SSO
   endpoint.
11. A tampered `RelayState` or target that isn't on the list.
12. A response signed with a key that has been retired from the metadata
   or the JWKS.
13. A logout that has to actually end the session, a logout token
    presented twice, and a partner session that outlives the identity
    provider's by more than it should.
14. A callback whose `state` doesn't match the pending cookie, and an ID
    token whose `nonce` doesn't match the one the request carried.
15. A token whose `alg` is `none`, or an HMAC algorithm presented
    against a public key, and one whose `kid` is still unknown after the
    one permitted re-fetch.
16. A SAML Response whose `Destination` isn't our assertion consumer
    service, one with an encrypted assertion inside an unsigned
    Response at a tenant that requires the signed envelope, one with a bearer window wider than the ceiling, one
    carrying a condition the receiver doesn't understand, and one whose
    `NameID` is in a format the contract didn't agree.
17. The start, initiate, callback and finish endpoints loaded inside a
    frame, and an initiate request naming an issuer that isn't on the
    list.
18. A launch token sent by GET, or in the query string, or with the
    wrong `typ`, including an access token signed with the same key.
19. A logout token missing `events` or carrying `nonce`, and a logout
    for a session already gone, which answers 200 and not 400.
20. An XML document carrying a DTD or an external entity, which the
    parser has to refuse before the first check runs.
21. A SAML Response with a status other than Success, one from an issuer
    that isn't configured, one whose Response and Assertion issuers
    differ, one that isn't version 2.0, one with no authentication
    statement, and a bearer confirmation carrying `InResponseTo` on the
    unsolicited path.
22. A callback with neither a code nor an error, a token response with
    no ID token or a token type other than bearer, an ID token missing
    a required claim, one whose `azp` is present and isn't our client
    id, one not yet valid by `nbf`, and a callback arriving on another issuer's
    path.
23. An initiate request with an oversize or non-printable `login_hint`,
    a GET to `/sso/finish` with no handle or an expired one, and a valid
    subject at a tenant that doesn't provision.
24. A launch token whose window is wider than the ceiling, one with a
    `//` or backslash target, one from the wrong issuer or with several
    audiences, one POSTed from another origin, and a logout token that
    is missing, has no `sid` and no `sub`, or carries the wrong `typ`
    or an unpinned `alg`.
25. A logout token from an issuer that isn't configured, one whose `aud`
    doesn't name our client, one with several audiences and an `azp`
    that isn't us, one missing a required claim, and one not yet valid
    by `nbf`. A launch token missing a required claim or not yet valid.
    A SAML assertion whose `IssueInstant` is in the future. An initiate
    request whose `target_link_uri` is on another origin.
26. The page a user sees for each of the above, and the log line behind
    it, with nothing in that line you'd have to redact.

## The rest of the questions

[The decision
post](/blog/sso-for-integrations-the-decision/#the-decisions-to-carry)
carries the seven decisions that need people who are not your team in
the room, on one screen, and the two product policies you set alone
before it. These are the rest, the ones your own people answer while
the work is under way. Each of them changes what gets built.

1. Beyond the form, what work does the consuming party have to do? Does
   it accept an unsolicited response, carry the deep link, do anything
   at sign-out? And is this integration configuration against a
   capability you already have, or code written for this partner,
   because code per partner is headcount.
2. If the response it accepts is unsolicited, can the arrival be turned back into a request, which is what OIDC section 4 exists for?
3. And if it can't, does the receiving side supply single use, a short
   life and an allow-listed target instead?
4. What crosses to the partner, and what can the partner verify about
   it? The short answer is a signed statement naming the issuer, the
   subject, the audience and a validity window, and the partner can
   verify those four and nothing else. The long answer is [The
   parties, and the shape they all
   share](#the-parties-and-the-shape-they-all-share), above.
5. Which `NameID` format or subject type, which signing algorithm, is
   the assertion encrypted as well as signed, and does either side's
   policy rule out the other's default?
6. If users already have accounts at the partner, who makes the first
   link, and what stops it being made to the wrong account?
7. What happens to existing links when the subject changes, whether the
   customer changes identity provider, renames an entity ID, or a broker
   is put in front or taken out?
8. Which identity provider does each user belong to, and where is that
   decided? It has to be decided in one place, and the login has to
   check the assertion came from that identity provider and no other,
   which is the check that stops one customer's identity provider
   asserting another customer's user. How it is done is in [Which
   identity provider is this
   user's?](#which-identity-provider-is-this-users), above.
9. Who may launch, and where is that decided?
10. What does the partner do when a launch arrives for one user into a
    browser already signed in as another?
11. How do roles cross, and where do permissions stay? If the answer is
    just-in-time provisioning, what does a first login get?
12. Who turned this integration on, what may it receive, and where is
    that record?
13. When does the certificate expire, who rotates it, can both sides
    hold two, and how long does the partner cache our keys?
14. Who owns the account lifecycle, which side is authoritative for
    what, and how does a change on one side reach the other?
15. What will the page say when it fails, what will the logs hold when
    it does, and what must they never hold?
16. When the integration has to stop within minutes, because the partner was breached, a signing key leaked, or a customer was offboarded, what is the switch? Who is allowed to throw it? And does throwing it only refuse new launches, or does it also end the sessions already open at the partner, which needs the logout mechanism above to exist?
17. Can the two sides' logs be joined afterwards? Your side records that a user launched into the partner at 10:02, and the partner records that a session started at 10:02 and what it did. Unless some identifier crosses and is written into both logs, the assertion ID, the SAML `SessionIndex`, the OIDC `sid`, nobody can prove those two records are the same event. So which identifier crosses, is it logged on both sides, and if none is, how does either side answer "what did this user do over there?" when a customer or an auditor asks?
