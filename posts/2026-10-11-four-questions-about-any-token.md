---
title: "The identity zoo and four questions about any token"
subtitle: "A bearer token is not a new animal, it is a way of using that token. When the vocabulary gets loud and you start doubting what you know, four questions clear it, for a bearer token, a refresh token, a SAML assertion, or whatever crosses the next boundary, and the format turns out to decide one thing."
description: "An engineer once asked me what the hell a bearer token is, and I remembered asking the same thing. The answer is four questions that work for any token: what does it say, who is it for, how long does it live, who can take it back. Purpose first. The format follows."
date: 2026-10-11
tags: ["identity", "oauth", "tokens", "first-principles", "mentoring", "engineering"]
category: identity
disclosure: story
slug: "four-questions-about-any-token"
revisions: 25
status: published
---

Many years ago, when I started working in identity, having done the
courses and read the articles, I would get into a design review, or an
idle conversation about authentication, and terms would start being
thrown around as if they were commonplace. It left me doubting myself.
How are these people getting what I am not? What am I missing? The
people around me used these terms as if they were plain English, and I
nodded along and went back to my desk, opened a browser and looked them
up. It took a while to see that I was not missing anything. I
experienced this first hand, and I remember the feeling to this day.
Imposter syndrome, anyone? And what the hell is a bearer token.

Years later an engineer walked up to me and said, more or less, "I've
heard people talk about bearer tokens in conversations as if it's plain
English, and it left me feeling like an idiot. What the hell is a bearer
token? Is it a new thing? Is it a thing I should study?"

Deep breath. Relax.

It was a late evening. I remember the darkness outside and that it was
raining. We went to the cafeteria and got something to drink. I think I
had coffee, because I drink that any time of day or night. We sat down
and talked through what it was.

There's no new type of token here, and nothing to go study. The word
describes how a token is used, not what kind it is. Most often it's an
access token, but it can be a session cookie or a SAML assertion. Same
idea. The fact that you have it, that you bear it, is the whole proof.
Someone will let you in, no questions asked about who's holding it,
the way a hotel room key does. The door doesn't ask whether the person
holding the card is the guest who checked in. The alternative is a token
bound to a key you have to prove you hold. The standards call the idea
proof of possession. OAuth does it two ways, DPoP or mutual TLS, and
SAML calls its version holder-of-key, and that's most of the vocabulary.

It was this post, with less detail, over a cup of coffee. The question
underneath the question was "am I behind?", and the answer was no.

## The noise is repetition

The noise that makes a capable engineer feel like an idiot is not a loud
room. It's hearing the same word over and over, in a design review, in a
hallway, over a cup of coffee, each time said as if everyone already
knows. The doubt creeps in, and the questions about your own technical
judgment start. When you're one of several people in a design and the
vocabulary is flying, the messy details confuse whoever is asking the
question, and sometimes you.

That's the time to fall back on first principles. Purpose first, format
later, is a way to clear out the noise. Focus on four questions and the
answer falls out. That's your internal reset, and it's the reason every
post here and every page in the dojos starts in plain English before it
starts in vocabulary. The four questions are for tokens, but the move, going
back to the smallest true statement when the noise gets loud, works on
any design you're asked for.

>> Purpose first. The format follows.

## The four questions

For any token you're handed, or asked to design, ask what it says, who
it is for, how long it lives, and who can take it back. Ask those
and the whole authentication and authorization zoo sorts itself out
without anyone mentioning a format.

An ID token, or a SAML assertion, says who authenticated. It's for the
application that asked, and its job is done the moment that application
has read it and started a session. Hand that same object to an API as
proof of what the user may do and the API is accepting a proof of who as
a proof of what. Nothing in
the token says what this app may do, nothing names the API as the party
it was meant for, and nothing records that anyone agreed to this app
calling that API on this user's behalf. Some platforms do
accept an ID token as a service-to-service credential, with the API
named as its audience. That's a different token with the same name,
and the four questions tell you so.

An access token says what the bearer may do, at which resource, until
when. It's for the API. It's often a signed JWT, and a signed JWT's
whole virtue is that the API can verify it offline, with a public key,
without calling anyone, and read what it says, who, what scope, until
when, without looking anything up either. That is what makes it scale, and it's also what
makes it hard to take back. As long as nothing checks with the issuer,
nothing learns that the user signed out or the admin disabled the
account, and the moment something does check, you've given up the
offline verification you chose the format for. The lever you can
always pull is expiry, so you make it short.

A refresh token exists because an access token that dies in minutes needs a way
to be renewed without dragging the user back to a login page. It lives a
long time, it's presented only to the issuer and never to any resource,
and every time it's presented the issuer gets to ask everything the
offline check couldn't. Is the session still alive, is this still
the client it was issued to, has this refresh token been seen before, should the scope be
narrower now. The split is the separation of a long-lived credential
checked centrally from a short-lived one checked at the edge. One object
can't be both.

You can collapse the two into one long-lived signed JWT, and people do.
Life is easier for about a week. Then a laptop is stolen and you have a
credential valid at every API for a year with no way to kill it, and the
fix is to rotate the signing key and log out everyone in the company. Or
a product team asks for read-only access to one API for one integration
and you discover your one token is a master key, because nothing in it
names an audience or a scope. Every team I've watched build "just a
signed JWT" for an API adds an expiry, then a renewal endpoint, then
rotation on renewal, and has rebuilt OAuth with worse names.

The same split exists in single sign-on, in the browser world. The
signed login assertion crosses the boundary once, lives a few minutes,
is used once, and dies. The application that received it then starts a
session of its own, under its own control, which it can end whenever
it likes. A short-lived signed object that proves something, and a
long-lived thing that can be revoked by whoever owns it. In the browser
case the long-lived thing is the application's session, and the
application ends it. For APIs it is the refresh token, which the client
holds and the issuer ends by refusing it. Same shape, different owner. [The two SSO posts](/blog/sso-for-integrations-the-decision/)
on this site are that design in full.

## The animal that isn't

People talk about a bearer token as if it's another animal in the zoo.
It comes down to purpose again. Run the four questions on a bearer
token and on a bound token and you get the same four answers.
They say the same thing, they are for the
same API, they live the same length of time, and the same party can
take them back. The difference sits on a separate axis, what the
presenter has to prove, which is a condition on using the token rather
than a change in what it is for, and the format records it as one
extra claim, `cnf`, naming the key or its thumbprint. Where the difference shows is in a leak. A
leaked bearer token is dangerous until it expires. A leaked bound
token is no use to whoever took it without the key.

## What the format decides

When you're talking about a signed JWT, you're talking about a data
object with a level of protection around it. The whole zoo, the access
token, the refresh token, the SAML assertion, and everything else that
crosses a boundary, internally or externally, is a data object with a
purpose. Sometimes it's a signed JWT, sometimes a random string,
sometimes a field inside a larger object, sometimes XML. Most of that is
history and convenience. The only thing a format decides is whether you
can take it back before it expires, and that is a purpose question the
format happens to answer.

So when the noise gets too loud, pause for a minute, and go back to the
four questions.

- What does it say?
- Who is it for?
- How long does it live?
- Who can take it back?
