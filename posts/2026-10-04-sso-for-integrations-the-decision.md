---
title: "SSO For Integrations, For the Decision Maker"
subtitle: "A request for SSO arrives as part of a larger project, usually with the right name on it and none of the work behind the name. A user signs into your application, and somewhere in the flow they want to reach a partner application without authenticating again. Usually it is framed as 'we want to give them an SSO experience'. This post is the questions that have to be asked and the decisions that have to be made before that can be real."
description: "The decision half of a two-part guide to cross-application single sign-on: why bare OAuth is not on the list, where the flow starts and why the response matters more, the table that picks SP-initiated, SAML IdP-initiated, OIDC third-party-initiated login or a signed handoff, consent, single logout, the account contract, and the questions to bring to the planning meeting. No code; the mechanics are in the companion post."
date: 2026-10-04
tags: ["identity", "sso", "saml", "oidc", "oauth", "federation", "engineering"]
category: identity
slug: "sso-for-integrations-the-decision"
revisions: 63
status: published
---


This is a common request. Product management will ask for "SSO
integration". What they are asking for is a set of well understood
flows. The first is that the user authenticates to your application,
and at some point during their work they want to access the partner
application. The second use case is a user authenticating and working
in the partner application, and at some point during their work they
need to reach your application. The fundamental request is always the
same. In either direction, a user authenticated to one application
does not need to authenticate at the other application. The question
is "Can they not need to authenticate at the other application?" The
answer is "Yes".

Two standards do it, SAML and OpenID Connect (OIDC), and which of the
two you use is usually dictated by what you and the partner support.
What nobody dictates is everything around it, and that is what this
post is. The architectural decisions the request forces on you, and the
questions to ask in the planning meeting. They are in one table, in
[The decisions to carry](#the-decisions-to-carry), and the table is
the post in one screen. [The companion
post](/blog/sso-for-integrations/) is the one to read if you're the
one implementing it, and it is where every mechanism named here is
worked out in full.

Decide one thing first, because every answer below turns on it. Which
of the two cases is this integration, or both? When the customer's
user reaches the partner from you, you are the launching side. When
they reach you from the partner, you are the receiving side. Two facts narrow the first case
before you plan it. If the partner already federates to the provider
your users sign in with, the launch is a deep link and there is
nothing to build. And the partner has to trust an issuer, and there
are two candidates. Either the issuer is you, standing in front of the
customer's identity provider, which is called brokering. Or it is the
customer's identity provider itself, which means you federate to it
per customer. Which of the two it is tends to be a fact about the
customer rather than a choice of yours, and it decides later whether
sign-out reaching the partner is your build or a request to the
customer. A platform with more than one
partner is usually asked for both over time, and each is its own
project. This post says "you" throughout, and
which side that is changes what you decide and what your team builds.

>! Scope: This is browser SSO. It assumes each side already
>! authenticates its own users with something, an identity provider or
>! an authentication service, which is a safe assumption today, and
>! that on your side it is the customer-facing one, the provider your
>! product's users sign in to, rather than the workforce provider your
>! own employees use. Pointing the workforce provider at customers or
>! partners is bad practice and not what this post assumes. If you
>! don't have a customer-facing one, that is a different conversation.
>! Native and mobile applications launching into partners carry a
>! different set of mechanics, and they get their own post.

The request usually arrives with a delivery date attached, and that
date is the boundary you work inside. What fits inside it turns on the
decisions in the table below, each yours to make rather than one that
gets made for you, each with a cheap answer and an expensive one. If you read one thing before the
meeting, read the table.

## Seven signposts

Every SSO integration is a set of turns at the same seven signposts, and the decisions in the table are which turn to take at each one. Sometimes the answer is both. Two of the signposts are about what crosses the boundary. Four are about how the flow starts and whether the answer can be matched to a question, and two pairs of those are close enough to get confused. The last is OIDC's way of getting the better half of each pair. They are defined here in plain terms, with the two cases from the opening in mind, a user working in your application who reaches the partner, or a user working in the partner's application who reaches yours.

**Federation.** An arrangement between two parties where one authenticates a user and asserts that identity to the other, and the other accepts the assertion instead of authenticating the user itself. What crosses is a claim about who someone is, signed by the party that established it. That party is the **issuer**. The claim is only worth what the issuer behind it is worth, so every check the receiving side makes starts with which issuer signed this and is that an issuer we agreed to trust. SAML and OIDC are federation protocols, and single sign-on is federation seen from the user's side of the screen.

**Delegation.** A user lets an application do some things on their behalf, against some resource, for a while, without handing over a password and without the application becoming them. What crosses is a permission, not an identity. Nothing in it says who the user is in a form anyone else can rely on, and nothing in it says the user is present. OAuth is a delegation protocol, whatever it ends up being used for, and it is the other thing an integration may need, after the identity question is answered.

**SP-initiated.** The application the user is arriving at starts the login, by sending a request to the identity provider and waiting for the answer. SP is service provider, SAML's word for the receiving application. When your link lands at the partner and the partner sends the request, the flow is also SP-initiated.

**IdP-initiated.** The identity provider starts it, by sending a login response to an application that never asked. IdP is identity provider. A portal tile that drops the user into the partner already signed in is the usual example. It is common in workforce identity, where an application launcher is the whole point, and in general it is not recommended for integrations, for the reason under the next term but one.

**Solicited.** The response that arrives at the receiving application is the answer to a request that application sent, and it can match the two. Every SP-initiated flow is solicited.

**Unsolicited.** The response arrives at an application that did not ask for it, so there is nothing to match it against. Every IdP-initiated flow is unsolicited, and that is the property that costs, because the receiver cannot tell whether this browser set out to log in.

One more, because OIDC has it and SAML does not. **Third-party-initiated login** is OIDC's way of starting at the identity provider and still ending up solicited. The provider tells the receiving application to start the login itself, so the response that comes back is an answer to that application's own request.

## The decisions to carry

Seven decisions, six of them needing people who are not your team, most often the partner, which is why they are carried into the planning
meeting and verified in the design review rather than discovered
there. "Can it take a no" asks whether the answer can be "not in this
integration" and the integration still ships. The table is written from the launching side, except the hardening row, which belongs to whoever receives. When you are the receiving side, everything the table says the partner must do is yours to do. The terms are the signposts above, and the three flows are explained under the flow.

Two product policies come first, one for each case, because they decide what you are asking everybody else for. When you receive, do you accept unsolicited responses? A defensible policy to refuse. When you launch, who may launch? Yours to set, even though the customer will later say which of their users it applies to. Settle both internally, then take the table into the meeting.

| The decision | Who has to be in the room | Can it take a no | The cheap answer | The expensive answer | Decided in |
|---|---|---|---|---|---|
| **The flow.** SP-initiated with a deep link by default, in whichever protocol both sides speak, SAML included. Third-party-initiated login when the launch has to start at the identity provider and both sides speak OIDC. SAML IdP-initiated only when the partner cannot start a flow at all, which in practice means a SAML-only partner with no SP-initiated endpoint, and then with the receiving side hardened. A signed handoff only inside your own trust boundary. Never bare OAuth | The partner, for what it can start and what it speaks, and the customer if its provider has to issue the unsolicited response | No. The flow decides every row below it | The partner has a login your link can point at | The partner cannot start a flow, so you are in an unsolicited flow and everything in the next row follows | [Which flow, and what it costs](#which-flow-and-what-it-costs) |
| **Hardening the receiving side**, in an unsolicited flow. The replay window, where the response came from, where a launch may land, a confirmation screen, and beyond the setup form the two sides exchange, what the partner has to build to receive at all | The partner when it receives, and nobody outside your team when you do | No. Skipping it in an unsolicited flow is skipping the flow | You receive, so at least you can schedule it | The partner receives, so you cannot schedule it, only ask, and a partner that declines leaves every unsolicited flow unhardened | [Who hardens the receiving side](#who-hardens-the-receiving-side) |
| **The sign-out direction.** What happens at the partner when a user signs out with you, the reverse, what failure looks like, and what turning the integration off does to open sessions | The partner, and the customer if you federate | Yes, if the partner's session is short | Nothing reaches the partner, and that is recorded | Sign-out must reach the partner. If you broker, reaching it is your build. If you federate, it is a request to the customer, which you cannot schedule | [The sign-out direction](#the-sign-out-direction) |
| **The partner's session.** How long it may live after a launch, whether it may outlive the authentication behind it, and what a second launch does to the clock | The partner | Yes, if you have logout instead | The partner commits to a number | The partner won't commit, so you are buying logout, and logout is the harder of the two | [The partner's session](#the-partners-session) |
| **The account contract.** Which identifier crosses, who creates and links accounts, who makes the first link to one that already exists, what deprovisioning does, whether the partner still takes a local password, and whether the partner may re-federate your users onward or let an automated session launch, and which roles cross with a launch allowed only to narrow | The partner, and the customer for the identifier | No. The wrong identifier is an account takeover | The partner creates accounts from the assertion, the issuer sends a stable subject, and no local password remains | Users already exist at the partner and somebody has to own the first link, which is a project with the partner's engineers in it | [The account contract](#the-account-contract) |
| **The attribute contract.** What is sent, who decided it, and who is authoritative when the two sides disagree | The customer's administrator, and the partner for what it keeps | Yes, if the release is recorded where it can be narrowed later | The customer's administrator already has a record of what is released | The identifier you need is in nobody's default set, so every customer's form changes | [The attribute contract](#the-attribute-contract), [Who consents](#who-consents) |
| **The authentication bar.** Whose standard it is, which side enforces it, and what happens when what arrives is weaker | Both sides | No. The wrong answer fails one side's audit | Both sides are satisfied by the same thing | The partner needs something stronger on demand, which needs a flow with somewhere to ask, and that can rule out the flow you picked | [The authentication bar](#the-authentication-bar) |

Two of those can take a no only one at a time. If sign-out never reaches the partner, the partner's session has to be short, and if the partner will not commit to a short session, sign-out has to reach it. Say no to both and the leaver's tab stays open until somebody notices.

Seventeen more questions, the ones your own people answer while the
work is under way, are at the end of [the mechanics
post](/blog/sso-for-integrations/#the-rest-of-the-questions).

Most of what follows is the reasoning behind a row, in row order, and
the last column of every row lands on its section. One section comes before the rows, the "just use OAuth" assumption most requests arrive with, because until it is undone there are no rows to decide. Three carry decisions that fit no row and are meeting
questions all the same, the silent launch, the first half of what the
design review can miss, and when it breaks.

## SSO is federation. OAuth is delegation.

The request often arrives with an assumption attached, "just use
OAuth", and undoing that assumption is your job, by stopping and
explaining it. I'm not going to pretend I've only seen that from a
distance. I've done it myself, put a user ID in an OAuth access token
and called it login, and I've seen it filed under "custom
integrations", which is the label a hack gets once it's in production.

Federation and delegation are the first two signposts, and "just use
OAuth" is the wrong turn at the first one. What crosses in federation
is an identity, signed by an issuer the receiving side agreed to
trust. What crosses in OAuth is a permission, and nothing in it says
who the user is in a form anyone else can rely on, or that the user is
present.

That is OAuth's job, and it does it well. The trouble is that an
integration like this asks two questions and they get collapsed into
one. The first is who this person is, settled on the far side before
they can do anything at all. The second is what the partner's
application may then do on their behalf against your API. OAuth
answers the second and has no answer for the first, and most SSO
integrations need both, in that order.

To make OAuth answer the first one you have to invent what it lacks. A
claim about who the user is, a rule about which application may accept
it, proof the user was present, and a way to stop a token issued to
one application from being replayed as a login at another. There was a
period when an application holding a user's access token could present
it to another application's sign-in endpoint and be logged in as the
user. A study in 2012 (Sun and Beznosov, ["The Devil is in the
(Implementation)
Details"](https://css.csail.mit.edu/6.858/2012/readings/oauth-sso.pdf),
CCS 2012) took 96 sites that offered Facebook login and found that on
64 percent of them an attacker could take over a user's account by
sending a forged sign-in credential to the site's own sign-in
endpoint. That class of hole is a large part of why OIDC exists.

So the answer isn't no. The answer is "let's talk about this", and the
talk happens before anyone draws a diagram. If what they need is
identity, it's a federation protocol. OIDC, which adds to OAuth the thing OAuth lacks,
a signed token that names its issuer and its intended audience and
says who the user is, and which counts as a login only once the
receiving side has checked all three. Or SAML, which never needed
OAuth at all, and in enterprise integrations I've seen more SAML than
OIDC. If they need delegated access to your APIs on top of the login,
that is OAuth doing its actual job, and it comes after the identity
question is answered.

## Which flow, and what it costs

Whether the request was also tied to this browser is what closes login
CSRF. OIDC Core recommends that rather
than requiring it, and the OAuth security best current practice, RFC
9700, makes it a must, which is why the table below says to verify it
rather than assume it.

The receiving side is whoever the response arrives at, which is the
partner when you own the launch and your own application when the
partner launches into it, and what it can verify turns on solicited or
unsolicited.

>> Where the user clicked tells you nothing. What you need to know is whether the thing that lands at the receiving side is an answer to a request that side actually sent.

An unsolicited response can be verified in almost every way. The receiver can check who signed it, that it was meant for it, that it hasn't expired, and what it says about how the user
authenticated. Two things it can't do. It can't tell whether this
browser, right now, set out to log in, which is what login CSRF
exploits. An attacker gets a response for their own account, delivers
it to a victim's browser, and has the victim work inside the
attacker's session. And it can't ask for a stronger or fresher
authentication. It can only refuse what it was handed.

If you receive, which arrivals you have to support is a product requirement, so settle
it with your product manager before anyone talks about protocol. Then
if you launch, design for the case where the user has no session at the partner and
the identity provider has to be asked, because if SP-initiated
carrying the destination works there, it works for every launch you
control. The button inside your platform then becomes a deep link,
which is a link that names not just the partner but the page inside it
the user is headed for, so the launch arrives with a destination
rather than dropping them at the partner's front door. It starts the
same flow, silently.

You may never need an unsolicited flow at all. You need one for the
launches you do not control, which is when the launch can't be a deep
link. When you launch, that is a partner that can't start a flow
itself, whose setup guide asks for your IdP's metadata and never
mentions a login page. When you receive, it is a partner launching into you with a response the identity provider issued unasked, the partner's own or the customer's. A customer's own portal tile launching into you is the same arrival and the same hardening, and not one of the two cases here.

All three below are standard flows, though one of them is barely
known. Here is what separates them.

| | SP-initiated | IdP-initiated, SAML | Third-party, OIDC |
|---|---|---|---|
| What it costs you | Least of the three. A launch link, and one more partner configured at whichever identity provider issues for these users, yours or the customer's | A security exposure you carry for the life of the integration, and hardening work on whichever side receives | Nothing beyond SP-initiated, plus the explaining, because the flow is rarely seen outside the education sector |
| What you ask the other side for | A login your launch can point at, a guarantee it checks every answer against the request it made, and in SAML the refusal to accept the same answer twice, which every SAML receiver owes and not only the ones taking unsolicited ones. You build the link | The single-use check, plus acceptance of a response nobody asked for, and the hardening that goes with it, including a confirmation screen if you want login CSRF closed | One endpoint registered at their end, checks on what arrives at it, and a list of the issuers they will accept there. You build the launch that calls it |
| What it leaves exposed | Nothing from the response itself, provided the receiver ties its request to this browser and keeps the single-use check in the row above. OIDC Core recommends the first and RFC 9700 requires it, so it is something to verify rather than assume. What the binding does not prove is that the user chose the identity provider. A link that names the tenant is the receiver's to refuse, and [the mechanics post](/blog/sso-for-integrations/#which-identity-provider-is-this-users) shows where | Login CSRF. A confirmation screen closes it, at the cost of the silent launch | Nothing, on the same condition as SP-initiated, plus a public endpoint anyone who can reach it can fire, which is why the issuer allow list matters there |

Every cell of that, row by row, with the signed handoff as a fourth column and the sentence of the standard each one rests on, is in [the mechanics post](/blog/sso-for-integrations/#the-four-flows-cell-by-cell).

The default is SP-initiated, wherever the flow can start at the
service provider, in either protocol. When the launch has to start at the identity provider and both sides
speak OIDC, use third-party-initiated login.

When the partner says it has never heard of that flow, the precedent
to name is LTI 1.3, the standard learning management systems use to
launch a tool from inside a course. Its launch is OIDC
third-party-initiated login, step one of the [1EdTech security
framework](https://www.imsglobal.org/spec/security/v1p0/), and it has
been running at scale across the education sector for years.

When the launch has to start at the identity provider and the partner
only speaks SAML, use IdP-initiated, harden the receiving side, and
accept the login CSRF cost with eyes open. There is no third option in
that one situation. SAML is solicited like anything else when the
partner starts the flow. What it has no equivalent of is the endpoint
above, a standard way for a third party to ask the partner to begin a
request of its own, so when the launch cannot start at the partner the
only thing that can travel is a response nobody asked for. Every cost
in that column follows from that one absence. Inside your own trust boundary, and only there, use a signed handoff, a short-lived token of your own that the other application accepts because you both agreed it would, with no standard underneath the agreement. Never bare OAuth.

You will not be the first to say this in a review, and it helps to
arrive with company. The [OWASP SAML security cheat
sheet](https://cheatsheetseries.owasp.org/cheatsheets/SAML_Security_Cheat_Sheet.html)
calls the unsolicited response less secure by design, for exactly the
login CSRF reason above. [Auth0's
documentation](https://auth0.com/docs/authenticate/protocols/saml/saml-sso-integrations/identity-provider-initiated-single-sign-on)
says IdP-initiated flows carry a security risk, are not recommended,
and that SP-initiated should be used wherever possible. [Amazon
Cognito's documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-SAML-session-initiation.html)
names SP-initiated sign-in as the best practice and says request
spoofing and CSRF attempts are likely once IdP-initiated responses are
accepted. None of that is my opinion, and each is a link that can sit
in the design document next to the row.

Workforce identity is the one place IdP-initiated is routine, the tile
on the corporate portal, and it is tolerated there for a reason that
does not carry over. The identity provider and the applications behind
it are inside one organization's control, so every account that could
mount the login CSRF attack belongs to an employee, a small population
with a name on every account. That lowers the risk without removing
it, and it is a workforce trade. This post is about customer-facing
identity, where the population holding accounts is not yours.

Whether a partner is inside your own trust boundary has a test. It is
inside when the same organization owns and operates both ends, holds
the keys at both ends, and gets paged when either one breaks. A
partner you contract with isn't inside it, however friendly, and the
way a partner usually comes to pass the test is an acquisition. The
handoff costs you everything the standards would have given you for
the price of a redirect. Document that it is the weaker flow, and
where it is allowed, so it does not become the default by being the
one already working.

One thing about the middle row, what you ask the other side for,
because it decides who does the work rather than what the work is. If
you are the launching side, all of it is a requirement on the partner
and not a task on your board. You can't schedule it. You can ask for
it in writing before anyone signs, and find out early what it means
when the answer is no, because a partner that won't build the
hardening leaves every unsolicited flow unhardened, and what is left that you can stand behind is no integration, or a different partner. If you are the receiving side, that row is your build,
and it has to be in the estimate.

### Who hardens the receiving side

The middle row leans on a word people use without unpacking it, so
unpack it before anyone estimates it. Hardening the receiving side is
build work with four named parts. Closing the replay window. Checking
where the response came from. Restricting where a launch is allowed to
land, because the launch carries a destination, and in SAML nothing
requires the receiver to check it, where OIDC's third-party-initiated
login does. And deciding whether to add a confirmation screen, which
is [the next section](#the-silent-launch-or-login-csrf-closed). It
takes as long as whoever owns it scopes it to take, and it lands on
whoever receives. What each of the four consists of, in code, is in
[the mechanics post](/blog/sso-for-integrations/#saml-idp-initiated).

The replay window is the one of the four that is not only an
unsolicited-flow concern. The SAML security considerations document
lists the stolen assertion first among the threats to browser SSO
([section
6.4.1](https://docs.oasis-open.org/security/saml/v2.0/saml-sec-consider-2.0-os.pdf)),
an assertion copied on its way through the browser and posted again by
somebody else. The countermeasures it and
[OWASP](https://cheatsheetseries.owasp.org/cheatsheets/SAML_Security_Cheat_Sheet.html)
name are the ones above, a short lifetime, single use, and a receiver
that remembers what it has already accepted. A solicited flow makes
the copy harder to use, because the receiver can check it against a
request this browser made. It does not make the store optional.

And if the launch is coming at you, you don't choose the flow, the
partner does. What's left is still yours to decide before you agree to
anything. Whether you accept unsolicited responses at all, which is a
product policy and a defensible one to refuse, though refusing costs
you the partners that can only launch that way. What you require of
the other side before you switch it on, at minimum a named issuer, a
certificate with a rotation plan, and an agreed identifier. What
hardening you build. And what you do when the assertion names a user
you have never seen, which is the provisioning decision arriving
through the front door. If you support both directions, and a platform
team eventually does, they are two features and not one. Say so when
the work is estimated.

## The silent launch, or login CSRF closed

This one only arises if you end up in an unsolicited flow, and if you
do, it has to be discussed whether or not anybody has asked for it. A
confirmation screen asks the user to confirm that they meant to sign
in here, now, as this person. It is the one control in an unsolicited
flow that closes login CSRF instead of making the attack more
expensive, and it only works if the user reads it, which in my
experience they mostly don't. It also takes away the silent launch,
which is the whole thing people asked for. So it is the silent launch
or login CSRF closed. If you want both, you need a flow with a request
in it, and that is a product call before it is an engineering one.

It is not the same screen as a consent screen, which asks the user to
approve what an application may see about them, or do on their behalf.
The assertion already says who the user is, not whether this browser
set out to log in, and that is the gap the confirmation screen closes.

## What sign-out does

Every flow above creates a session at the partner. None of them ends
one. The user signs out of your platform, the identity provider session ends, and the partner session created by SSO an hour ago is
still alive, in a browser still open, on a machine that might be
shared. From the user's point of view they signed out. From the
partner's point of view nothing happened. Single sign-on was the
feature. Nobody asked for single logout because nobody thought about
it, and it tends to go unraised rather than decided against. Bring it
up early, while it can still be a choice.

### The sign-out direction

The first decision is whether single logout is expected at all. Nobody
writes this down, so it tends to turn up later as a surprise. Ask, and
put whatever they say in the requirements, including no.

If it's yes, it's two decisions, and both are about applications
rather than the identity provider, because users hardly ever sign out
at an identity provider. They sign out where they are working. So ask
it in the direction it actually happens. When a user signs out of the
launching application, what should happen to the partner session they
left open over there? And when a user signs out at the partner, what
should happen back in the launching application? The answers are
usually different. Users expect the first one. I signed out here, so
the partner tab should end too. Build that. The reverse, ending your
session because someone signed out of one partner, signs them out of
everything at once, and I have not met anyone who wanted that.

Whether any of it is available to you follows from who the partner registered against. If you broker, the partner registered against you, and reaching it at sign-out is your build, in either protocol. If you federate per customer, it registered
against the customer's identity provider, and what you can do is ask
that provider to end its session, which both protocols allow. Whether
the customer's provider then reaches the partner is the customer's
configuration rather than yours. So when you federate, sign-out
reaching the partner is a conversation with the customer and not an
item on your backlog, and when you broker it is on your backlog and
nobody else's. And decide, while nothing is on fire, what turning the
whole integration off does. Whether it stops new launches only or ends
the sessions already open, and who is allowed to throw that switch. If
stopping it is slow, you will put off stopping it, which is how a bad
integration stays up.

Then the mechanism. Sessions end; tokens don't. Can the partner end a session when
it's told to? Can the tokens issued alongside it be revoked, if the
partner exposes anywhere to revoke them, and does anything actually
call it at logout? And what
happens when logout fails, given that a partner returning success
without ending anything looks exactly like a partner that worked? Ask for a mechanism that avoids the browser where the partner can
support one, OIDC's back-channel logout or SAML's single logout over
its server-to-server binding, because the browser-based mechanisms
fail silently. Support for either one varies, so ask rather than
assume. Why the browser-based ones fail is in [the mechanics
post](/blog/sso-for-integrations/#single-logout).

### The partner's session

The partner's session is the fallback nobody likes. If you can't end a
session, make it expire. A partner session that outlives the identity
provider's by eight hours is a design decision, so make it on purpose
and put a number in the contract. The partner's session should not
outlive the authentication behind it, and where the partner won't
commit to that, an idle timeout measured in minutes and an absolute
lifetime measured in hours is the floor worth arguing for. Then ask
what a second launch does to those numbers, because a user who clicks
the button every ninety minutes defeats an absolute lifetime by
inheriting a fresh one each time. Decide whether a launch into a live
session creates a new one, extends the one already there, or is
refused while it lasts. Then turn the question around, because
everything above negotiates the partner's session and not yours. How
old may your own authentication be and still mint a launch? A launch
inherits whatever your session is already holding, so if yours can
outlive the authentication behind it, the partner's promise not to is
measured against nothing.

## Accounts exist at both ends

Federation moves an identity across the boundary and nothing else. It doesn't
create, update, delete or reconcile the account on the far side. What
you are being asked to do, though nobody puts it this way, is to make
sure the account the user authenticated into on the launching side is
uniquely and correctly linked to an account on a platform you don't
manage, and that it is never mapped to the wrong one. Choosing a protocol doesn't touch
it.

Three parties are involved. The customer, whose people these are. You, one of the two platforms, which may or may not hold the identity provider. And the partner, which
has to let the user into an account it owns and take the issuer's word for who they are, yours or the customer's provider's. Which platform plays which role isn't fixed. It moves with
the requirement. Each side holds an account, and if the two are ever
out of step about who a user is, or whether they still exist, the
integration is quietly broken until someone can't log in, or someone
who left still can.

### The account contract

The decision you own is that a written account contract exists before
the SSO contract, and that it answers six things, and two more the
documents may not ask about. Five of the six are here, and the sixth,
what attributes cross, has a heading of its own after them.

How accounts get to the partner, provisioned ahead of time over SCIM,
the standard for pushing user records between systems, or created just
in time from the assertion, and what a just-in-time first login gets.
And what the partner does when an assertion arrives for a user it has
already disabled. If just-in-time provisioning quietly creates that
account again, the person you removed is back, and the offboarding you
are about to negotiate has a hole in it.

Which identifier links the two sides. It is the subject the identity
provider asserts, paired with the issuer that asserted it, and it is
the pair that is stable rather than the subject alone. The pair breaks
when the issuer changes, and also when either side renames its
identifier, or a broker is put in front or taken out, which is worth knowing before you put one there. Use the email address only if the
customer's identity provider sends nothing else, and then write down
how you handle an address that changes, gets reused, or gets set by an
attacker. One more thing the identifier has to settle when the partner registers against you.
Every customer's users then arrive from the same issuer, yours, so the
partner cannot tell which customer a user belongs to from the
signature alone, and the assertion has to carry something that says
so. Agree what that is, because if the partner has to guess, a user
can land in another customer's account, which is the account-takeover
case that needs no attacker, only a configuration. When you federate
per customer the issuer answers it.

Who makes the first link when an account already exists at the
partner, because that is where account takeover lives. It has a name
and a study. Sudhodanan and Paverd called it account pre-hijacking
([USENIX Security
2022](https://www.usenix.org/system/files/sec22-sudhodanan.pdf)), an
attacker creating an account at a service with the victim's email
address before the victim ever arrives, so that when the victim
arrives over federation the service merges the two and the attacker
keeps a password to an account the victim now uses. They found at
least 35 of the 75 services they tested open to one variant or
another. The variant that matters here, the merge, is a first-link
decision made by default rather than by anyone.

What deprovisioning does, and what it doesn't. Deactivating an account
may or may not end the session the leaver already has open, because
the standard leaves that to the partner. Ask, don't assume either
answer, and where the answer is that it doesn't, you need a session
short enough that it stops mattering. And SSO doesn't close the
partner's own front door. If the partner still accepts a local
password for these users, then deprovisioning, the sign-out decision
and the authentication bar all have a way around them. Decide whether
local login is off for federated users, and decide the break-glass
path, who gets in when federation is down, before you turn it off
rather than during the outage.

And how roles cross while permissions stay behind. Provisioning is
where entitlements are set, and it may raise them as well as lower
them, which includes a just-in-time first login, where the assertion
creates the baseline rather than narrowing one. A launch into an
account that already exists may only narrow what that account holds.
The protocols will not enforce that one for you. It has to be your
rule.

The two more, the ones the documents may not ask about. Whether the
partner may re-federate your users onward into a third application on
the strength of your assertion. And whether an impersonated, service
or shared session may launch at all, and whether the partner can
record an actor distinct from the subject, because otherwise its audit
log will say the user did it.

### The attribute contract

The sixth thing the contract answers is what attributes cross, who
decided that, and who is authoritative when the two sides disagree.
This is the attribute contract from the table, and it has two
halves. What is sent is decided by whoever administers the identity
provider, which under federation is the customer, and it is recorded
there as an attribute release or an administrator consent, which is
what the next section is about. Who wins when the two sides
disagree is a position you take. The identity provider is
authoritative for anything it asserts, and the partner does not edit
what it did not issue. The expensive answer in the table at the top is
real for this one. If the identifier you need is in nobody's default
set, every customer's form changes.

Every one of the eight has a right answer and several wrong ones, and
they are worked out in [the account
contract](/blog/sso-for-integrations/#the-account-contract) in the
companion post. Write the account contract
before the protocol work starts. Once you own the
capability the protocol work for the next partner is shorter. The
account lifecycle is what you'll still be supporting for as long as
the relationship exists.

## Who consents

If a consent screen gets skipped, it is because an administrator
recorded that consent at the identity provider, not because someone
wrote a branch in code, and who has to be asked depends on who
controls the data.

The question arrives in the design review, or as a requirement, and
sometimes as a requirement that the consent screen not appear at all.
It's a fair question. The user is signed in, they clicked a button,
and a page asking whether the partner may see their name and email is,
from where they sit, a login page with different words on it. That's a
stronger argument than it sounds, because a screen that presents no
choice is a delay, not consent. Whether it can go depends on who the
consent belongs to, and there are three cases.

First-party, your own applications talking to each other, needs no
user consent, since there is no boundary the user didn't already cross
when they signed in, and it is not this post, except the acquired partner of the trust-boundary test above, which needs no user consent either.

Enterprise third-party, where an organization brings in a vendor for
its own people. An administrator consents once, for everyone, and that
consent is recorded at the identity provider with the exact scopes, a
review date and a named owner. The users are told once, in the
product, that the integration exists and what it shares about them.
That notice is not a consent screen and doesn't need to be one.

Consumer third-party, individuals connecting two services of their
own, is per-user, revocable consent with the smallest scope set the
integration can run on, and it is not this post either.

This integration is usually the second case with a wrinkle, because
the data belongs to your customer and the vendor receiving it is the
partner. The administrator who records the consent is the customer's,
not yours, and what you owe is the record of what you send and a place
the customer can see it. When your own application is the identity
provider, the record is yours instead, kept at your provider under the
customer's name, and the customer still needs to be able to see it.
Which lawful basis any of it rests on is a question for counsel, and
it decides whether you owe a screen at all.

Whichever tier you're in, the record is something that can be listed,
reviewed and revoked, and never a branch in code that decides at
runtime not to ask, on either side. Minimize scopes harder when nobody
is going to be asked, because nobody is going to be watching either.
And settle one thing before the meeting, because it can save the
meeting. The consent screen is an OAuth convention that OIDC
inherited, and in most SAML deployments the user sees nothing. So in a
SAML integration the screen is usually not the question. Someone
decided the attribute release, and the thing to find is where that
decision is written down, if it is.

## What the design review can miss

The trust between the two sides is set up once, as documents passed
back and forth with the standard details filled in, metadata and
certificates and endpoints and a client ID and which attributes will
be sent. I've been on both ends of that exchange. The form is usually
inherited from whoever set up the last integration, so it asks for
what that one needed, and the question that matters most here is the
one nobody thought to add to it. How does the partner map the
identifier we send to an account on their side? That one warrants a
conversation of its own, and when the answer comes back as "just use
JIT", the conversation moves straight to the harder question of how
the permission sets map across. What the two sides have to agree there
is narrower than it sounds. Which roles cross, what each is called on
both sides, and who keeps the mapping when one side renames something.
Ask it at setup, because after the trust is built the same question
surfaces as an issue and extends the project, potentially
significantly, with work on both ends.

Four more things go missing. The first is who turned this on.
Somebody, an administrator, enabled this integration and decided what
it may receive, and the review should be able to point at that record.
If it can't, nobody owns the trust. The same record should say who may
launch, because "everyone at this customer" is a decision, and one
worth making on purpose rather than by default.

The second is the assumption that one side is ready to go. A partner
that "supports SAML" has a configuration page. Whether it accepts an
unsolicited response, what it does with an assertion for a user it has
never seen, how it handles the deep link, what it does at sign-out.
Each of those is engineering work on their side or on yours, and none
of it is on the form. Always ask beyond the document. What work does
the consuming party have to do? I've seen projects stumble on exactly
this with the form filled in perfectly at both ends, because a
completed form reads like progress until somebody has to build the
part it doesn't ask about.

The third belongs beside that list, because by the time it comes up
somebody on each side will already have assumed an answer. Does the
partner open inside your application, in a frame, or in a tab of its
own? It sounds like a styling question and it is not. A framed launch
runs the partner in a third-party context, which browsers restrict and
some partners forbid outright, and it is a common way an integration
that worked in a demo fails after it ships. Decide it early, with the
partner and with your product manager together, before either has
assumed an answer the other can't deliver.

### The authentication bar

The authentication bar is the fourth thing that goes missing, the last
row of the table, and the one that has to be settled between the two
parties. It is how strongly the user has to have authenticated, and it
goes missing because each side assumes its own answer is the shared
one. Your platform may be satisfied with a password and a session that
lasts the working day. The partner may hold something its own policy
says needs a second factor, or an authentication no more than a few
minutes old. Nobody brings it up. The flow ships, and it satisfies one
side's policy and not the other's, and nobody notices until someone
checks, in testing if you are lucky, after it ships if you are not,
and the auditor if you are neither. Neither party can impose this
alone, and the receiving side can only ask for a stronger or fresher
authentication in a flow that gives it somewhere to ask, which is one
more argument against the unsolicited ones. So settle it in the
review. How strong the login has to be, who checks, and what to do
when it comes back weaker. Either refuse the login or say something, but don't let it
through silently.

## When it breaks

Three failures are worth planning for, and each is a decision somebody
has to own before launch.

The form has a certificate on it, and the certificate has a date. When
that date passes, everybody stops being able to log in at once, and
what arrives is never "the certificate expired". It is "users can't
log in". I've been called into more than one of those, and the shape
is the same every time. The certificate had an owner written down
somewhere and nobody whose calendar it was on. The diagnosis is rarely
the hard part and usually doesn't take long, because somewhere there
is a log line saying a signature can't be verified. The cost is that
you are finding it inside an incident or on a support call, for
something that sat on a calendar the whole time. Rotating on time
needs a named owner, a reminder set long before the date, and an
answer to whether both sides can hold two certificates at once,
because where either side can hold only one, rotation is a cutover and
a cutover is an outage. Sides that fetch each other's keys from a
published address rather than exchanging a file once avoid that
entirely, so ask whether both sides do, and if either does not,
rotation is an outage you schedule.

Then the loop. The partner received a response, refused it, and its
failure handling was to start over, so the user bounces between the
two sides until the browser gives up. The fix is a hard rule that
belongs in the requirements. Never send the user back to login because
validation failed. There is one legitimate second trip, when a silent
login attempt comes back needing the user, or when the receiving side
is asking for the stronger authentication it didn't get, and what
makes those a link rather than a loop is that they are counted and
they happen once. Everything else fails to an error page with a code
on it.

And the user who is already signed in at the partner as somebody else.
A launch arrives for one person into a browser that already holds a
session for another, which happens on shared machines, with test
accounts, and with anyone who has two identities. The partner honors
the new assertion and replaces the session, or it ignores the
assertion and leaves the old session in place, which is how one person
ends up looking at another person's data with no error anywhere, or it
stops and asks. Partners differ, most don't document it, and the
second behavior is the default often enough to be worth finding out.
It is also a question getting more common rather than less, because an
agent acting for a user is a browser session with nobody watching it.
Where something automated drives the launch, stopping to ask protects
nobody, and a confirmation screen is worth exactly the attention
behind it. Whether an automated caller may launch at all is the same
question the account contract asks about service and shared accounts,
arriving from a new direction.

One thing decides whether you can diagnose any of them, and it has to
be settled before launch because logging only helps afterwards. The
identifiers, the verdict, and the name of the check that failed. Never
the assertion itself, the token, or the attributes it carried, because
those are personal data and sometimes credentials. The rotation
mechanics, the clock-skew tolerances and the full logging list are in
[the mechanics post](/blog/sso-for-integrations/#when-it-breaks).

## What I'd want you to take away

1. **Don't use OAuth for this.** Whatever you build on OAuth for this
   will be a hack, and hacks in authentication get found.
2. **Decide what sign-out does.** Logout has to be discussed, and the
   discussion may lead to single logout. Either way it's part of the
   design, not something discovered on a shared computer.
3. **Solve identity management at the design phase**, even if the
   answer is just-in-time provisioning. The account contract outlives
   the protocol work by years.
4. **Roles cross. Permissions don't.** Provisioning is where
   entitlements change, up or down. A launch into an account that
   already exists may only narrow what it holds, and that is a rule
   you impose rather than one the protocols enforce.
5. **Know which side you are.** The launching side chooses the flow,
   within what the partner can do. The receiving side does the
   building. When you are asked for both, that is two projects.
6. **SP-initiated with a deep link, unless the partner cannot start a
   flow.** If you end up in an unsolicited flow, hardening is the
   price, and whoever receives owns it.

This is how the work falls when you are the launching side, which is
most readers. If you receive instead, most of the partner's column is
yours.

| | Yours | The partner's | The customer's |
|---|---|---|---|
| The launch | The link, its destination, and who may launch | A login the link can point at | Which of their users, when they own the directory |
| The identity provider | If it is yours, the signing key, the published metadata, the endpoint that has to stay up, and the rotation | Consuming the issuer's metadata and trusting that issuer, yours or the customer's | If they bring their own, all of that, and whether the partner registers against them or against you |
| Hardening the receiving side | Nothing, unless you also receive | All of it, and you can only ask | Nothing |
| The account contract | Writing it, and provisioning if you push accounts | Creating and linking accounts, and the first link to any that exist | The identifier their provider sends, when it is the issuer, and whether it is stable |
| Sign-out | Deciding the direction, and making the call yourself if the partner registered against you | Ending a session when told to | Their provider's configuration, if the partner registered against it |
| The authentication bar | Agreeing it, and producing it when you are the issuer | Agreeing it, and enforcing it on arrival | Producing it when their provider is the issuer, and whose policy it has to satisfy |
| Consent | The record of what you send, where the customer can see it | What it keeps of what was sent | Their administrator's record of what is released |

Take the table at the top to the meeting. The rest of this was me
showing my work, and some of it will not apply to your partner.