---
title: "No credentials means none. I halted a project over it."
description: "More than six months into building passwordless login for the employees of one of the largest technology companies in the world, on their work laptops, we found the one place a credential still had to exist. It might never have been caught. Here is why we halted it anyway, until the foundations were ready, and what happened when I said so."
subtitle: "Security is made of trade-offs. A security claim is not. The tough call only gets more expensive the longer you wait, and one of the hardest recommendations I ever made was backed by a function signature."
date: 2026-09-26
tags: ["management", "leadership", "identity", "decision-making", "engineering", "passwordless"]
category: leadership
slug: "killed-a-project"
revisions: 48
status: published
---

This is a post about halting. Not about a project that failed, because it
didn't fail, and not about wasted work, because it wasn't wasted. It's about
the moment you find the thing that means you shouldn't keep going until the
foundations are ready, and what happens next.

## The bet

A few years ago, at a previous employer, one of the largest technology
companies in the world, I was an engineering manager responsible for password
and identity management, and for passwordless authentication. Passkeys were
just arriving. The passwordless program was not mine from the start; I
inherited it. I put three of my engineers on it and brought in two more very
senior engineers for the effort, five people building a passwordless
authentication solution for the people who work there, on the machines they
work on. Most of the corporate laptops were Macs, so a solution that worked on
a Mac was a must-have.

The bet, in three sentences. No passwords. No credentials. Anywhere. The
company places an enormous premium on security, from software down to
hardware. The standard premise of passwordless is that a credential never
travels the wire. The company extended the demand. No credentials in memory,
either. Not shorter passwords, not fewer passwords, not a password manager
with better hygiene. The credential as a thing that exists was supposed to
stop existing, and credential here means more than a secret a person holds or
types. It includes one held on their behalf and used somewhere down the line,
without them doing anything. A credential can be presented, copied or
replayed. A key that never leaves hardware can only sign, and keys like that
were the point, not the problem. And no external dependency. That put hardware
keys on the more costly path rather than the main one, since a lost key is
lost access, not insurmountable but a problem all the same. An external
authenticator also only moves the problem, because the machine's own internals
still pass a credential to unlock the keychain and the disk.

That premise was the whole product. Everything else was implementation
detail. If you take a passwordless program and leave a credential somewhere
inside it, you haven't built a passwordless system. You've built a system
with fewer passwords and a better story.

Hold onto that, because it's the whole post.

## We looked properly

We worked on it for more than six months, as several paths running in
parallel. Some of the work was the mechanics of the system itself, the flows
and what carried them, and we developed new mechanisms there. The rest was the
integration with macOS, which is where the problem surfaced. Nobody knew ahead
of time that the enclave would be the problem. Reaching it was the natural
progression of development of this sort. This was a new solution, so we had to
find out whether we could build it at the application level before the deep
dive into the platform, and the order also comes down to the people you have.
We found it by building, in our own evaluation phase, through proofs of
concept. Then, because of the premium the company puts on security, we were
paired with a principal security engineer for testing, the kind who breaks
things for a living. Call him the principal hacker, because that's how I
affectionately think of him. He confirmed it, and between us it was judged a
concern that had to be addressed. The order matters, because this wasn't
discovered by something breaking, or by an auditor arriving. It surfaced
because we kept interrogating a project we were championing, and the moment we
learned it was the moment the clock on the decision started.

The instinct when you believe in something is to test whether it works. We
tested whether the claim we were making about it held. Those are different
questions, and they have different answers.

I remember the standing instruction I gave my engineers, vividly, because I
felt like I was in a murder mystery playing the police chief. "Find me the
smoking gun." I still feel it today. Not "confirm this works." Find the thing
that kills it. If it exists, I want us to be the ones holding it, not the
people it gets shown to.

## The smoking gun

A large part of the Mac's security model rests on the Secure Enclave, the
dedicated hardware on the machine for cryptographic operations. The fleet was
a hybrid at the time, newer machines with an enclave and older ones without.
The older machines were the easy problem, the kind that only has to be raised.
We took it to leadership with a recommendation, that as a company mandate the
older machines would not get passwordless and every new machine rolled out
would, and that was that. Under the bet, our implementation needed the
enclave. With no external device as the answer, it was the only hardware on
the machine that could hold a key that never leaves it, and keys that never
leave hardware were the mechanical basis of the promise as we had defined it.
The platform's front door to custom integrations like ours was Apple's
CryptoTokenKit, through what it calls a persistent token extension. That door
had been open for about two years, and few had walked through it for anything
like this, so the unknowns were real.

When the integration path reached the enclave, we found it. To exercise the
keys the way our design required, the call into the Secure Enclave took a
credential. Not a password anyone typed, but a secret the system held and
passed on the user's behalf. I'll keep the mechanism general, because the test
code was the employer's and I can't re-verify it from memory. A credential had
to travel through the system's internals to make the call, and the function
signature said so.

Everything about that credential was fine by any ordinary measure. It never
left the machine. It was never transmitted, never stored on a server, never
shown to anyone who didn't already own it. By that measure it would have
passed most design reviews.

It was also a credential, in memory, inside the thing we had promised would
have none. Against the bar we had signed up for, that's not a nuance. That's
the finding.

We knew what it was the moment we saw it. The smoking gun I had been asking
for, the fact whose absence would clear the project and whose presence would
sink it. So we treated it like one. We ran tests. We wrote code against the
interfaces. We read the documentation and then we read the function signatures
underneath the documentation, because the signatures are where a platform
tells you the truth. Everything said the same thing. The call took a
credential. Years later an Apple engineer would say much the same in public,
on [Apple's own developer
forums](https://developer.apple.com/forums/thread/815755), that a passwordless
login on the Mac has no complete answer while FileVault and the keychain still
want a password, and that he did not see a good path forward.

We had one alternative, as is sometimes the case in projects of this nature.
External hardware keys were integrated and they worked. Keys did not meet the
bar either, for the reason the bet had already given. They were the fallback
if the company chose to lower the bar, not a way to keep it, and by the time I
left there was no wide deployment of them, though that may have changed since.
So the path that could meet the bar had to run on the machine itself, every
path on the machine went through the enclave, and that is where the credential
lived, inside the operating system's internals. Those internals were exactly
what the security team had already shown they could reach, which is why the
bar had been written the way it was. So the judgment was not that a user was
exposed. It was that our claim would be false in the one place the bar cared
about most.

## The part that made it hard

We could have shipped it.

I want to sit with that, because it's the reason this is worth writing about.
Nothing was exposed that hadn't been before. No user was worse off. The system
would have worked, it would have passed most reviews, and it would have been
better than what it replaced. Nobody outside the handful of us would ever have
known the secret was there.

And every time we said the word passwordless, from that point on, we would
have known it wasn't quite true.

Security programs run on the accuracy of the claims made about them. Someone
downstream makes a decision assuming your claim is exact. Then someone builds
on that decision. The gap between "no credentials" and "no credentials except
one that never leaves the device" is completely harmless right up until the
day somebody depends on the precise version.

We would have been the people who knew.

It worried me more than I let on. More than six months since the program had
landed in my lap, five people's work, new mechanisms built and working, a
program everybody wanted, and the question I kept turning over was the one
every manager recognizes. How do you walk into a room of senior leaders and
report a finding like this after that much investment? And there was a clock
on it that had nothing to do with us. The passwordless work was going into the
company's OS image, and any delay on the project, or any delay in saying the
promise could not be kept, would have delayed the image, with consequences
across the whole company. Waiting was not a neutral option. The only answer
that spared the image was a clean decision, made fast, and circulated. So we
decided to recommend a halt, and to move.

## Proving it to the people who would check

I took the evidence to the principal hacker first and worked through all of it
with him, test by test. Then I went to a few senior engineers in the org,
people who had been there for decades and had watched more programs die than I
had started. I walked the scenarios with them. We validated the tests and the
assumptions again, and then again. Not because the finding was in doubt, but
because the finding was about to carry weight, and a finding that carries
weight gets checked by everyone it lands on. I wanted it checked by the
hardest reviewers available before it went anywhere near a decision. From the
finding to the room took about two weeks, and that included the verification
that there was no way around it, the sessions with the principal, and getting
the meeting onto senior calendars.

Then I built the narrative, and I built it with the principal, because he had
worked with senior leadership for years and I had not. In that room his
history was the credibility, and I knew it. The document said that at the
current state of maturity of the operating system, no solution meets our
security bar. Halt the project. Revisit when the platform can carry the
promise, because the idea isn't wrong; the ground under it isn't ready. And
one more recommendation, to engage Apple directly to expedite a platform
answer, because we were exactly the kind of customer whose call Apple takes.

The framing mattered as much as the finding. I was not walking in to say
the solution was wrong. I was walking in to say the platform was not
ready for the promise, which is a different sentence with a different
future attached.

I was naturally nervous before and during the meeting, and I held my breath
and made the recommendation to senior leadership. One question came early. How
serious is the problem? It was the room asking whether we could live with it,
and that is where the principal stepped in and made the security case. I
remember his line, or something close to it. "I could show you how far we
could get into a laptop, and how quickly." A room that hears that sentence has
nothing left to relitigate about whether the bar is too high. The rest of the
answer is in the preparation. Nobody in that room was surprised, because the
meeting had not been set as "we want to talk about the recommendation." It had
been set as "we are recommending a halt, and in the meeting we will tell you
why." There will be questions, and you have to be ready to answer them. The
aim of the meeting is to keep the contested part of it small and let the
leaders rule quickly. Most of that work was done before the meeting began.

## What leadership did

They accepted the recommendation, and the project was halted. And then
something I hadn't rehearsed for. I was thanked for making the right call, and
asked to relay that to the team, which I did at once.

The principal hacker gave me the read on why, and it's the best piece of
feedback I took from the whole program. That leadership insisted on being data
driven. Show that you had done the due diligence to the point where they could
back your decision, and they would far rather halt a project than execute
toward something that turns into a disaster later. As long as I could back my
claims, I would have support, and the principal engineers would stand behind
me. That holds where it holds, and it is worth knowing which kind of room
you'll be in before walking into it. Had the room said to ship it, I would
have disagreed on the record and then committed to the decision.

Notice what that means. The recommendation that lands is never "this feels
wrong." It's "here is the specific thing, here is why it defeats the
premise, here is everyone who has tried to break the finding and failed, and
here is what would have to change for it to work."

>> You don't halt a funded project on a sense of unease. We halted one with a function signature.

A reality check belongs here, because the recognition can read rosier than the
room felt. Nobody threw a parade in our honor. It was a bad day for everyone
involved, for the engineers and the time they had invested, for me, and for
the leaders now sitting with sunk cost they had signed off on. There were no
high fives. There was a decision everyone could stand behind, which is a
different thing. A halt feels bad on the day, in security as in any other
domain, and it is still better than a security incident.

## Telling the team

Two conversations, and I staged the first one deliberately, before the
leadership meeting and not after it. Nobody on my team was going to hear what
I said in that room secondhand.

Once the findings were validated, I got all the engineers into a room, and I
made sure the principal hacker was in it. He had decades of tenure there,
credible and deeply respected, and I wanted him beside me when I said it.

I laid out the facts, all of them. Then the recommendation, that it would be
better to halt now than to deal with a major incident in the future. And past
the arithmetic, it was morally the right thing to do. We had promised a system
with no credentials in it, and we now knew we could not keep the promise.

Then I told them what the finding was not. It was not a reflection on anyone's
effort. The opposite. It was a vindication of their skills. I had told them to
find the thing that kills the project, and they had found it. Work rigorous
enough to halt a funded program is not wasted work. It's the reason we knew
before anyone else had to tell us.

I said we had the principal hacker's support, and he was standing right there.
I told them exactly what I was going to say to leadership, word for word, and
that none of it was on them. And I said the sentence I most wanted them to
remember, that this recommendation is on me, and I will be the one making it.
Whatever came back from leadership would land on my desk, not theirs.

One more thing was already done before that meeting, on purpose. There were
other projects in the domain I was responsible for, so the engineers could
move to them, and nobody would be left adrift waiting for something to happen
to them. We have plenty of work to do, I told them.

The second conversation came after the announcement, and the truth is that
there barely was one. The recognition had already reached the team, and we
moved on to the next project. It was anticlimactic, and I've come to think the
anticlimax is the point. Stories about halting an invested program are
supposed to end in drama. In a healthy organization, they end quietly, with
the team already looking at the next thing.

## Not dead. Not yet.

The word I keep using is halted rather than killed, and the distinction isn't
cosmetic. Killing a project says the idea was wrong. This idea wasn't wrong.
Passwordless is where the entire industry was heading, and where that company
needed to go. Others hit the same wall in the same years and took the other
road. [Palantir's write-up of its own
rollout](https://blog.palantir.com/technical-controls-rollout-and-edge-cases-passwordless-authentication-series-2-c9b6dcd349e)
states the gap flatly, that the Mac does not support FIDO2 for local login and
FileVault has no path either, and ships around it with the exception named.
That was a defensible call for their bar. It was not one for ours. What was
wrong was the assumption that the platform underneath could carry it, at that
moment, on that fleet.

So the deliverable of a halted project is not nothing. It's a written account
of exactly what would have to be true for it to start again, in enough detail
that whoever picks it up doesn't have to rediscover the finding. Ours held
the finding and where it lived, what the platform would have to provide before
the promise could be kept, and the ask that had gone to the vendor. We knew
something that cost months to learn. Leaving it undocumented would have been
the actual waste.

I moved on to other work. Did anyone pick the passwordless program back up? I
hope somebody did. I think they did, because passkeys are commonplace today,
though passkeys sign you into services and not into the machine, and as of
macOS 27 Apple's own deployment guidance says passkeys cannot unlock
FileVault, so the Mac still wants a password at the disk. Maybe the platform
will yet grow the capability we were missing. Maybe somebody found a path we
couldn't see. I don't know which, and I don't need to. A halt with a written
reason is a bet that the reason will expire.

## What I'd want you to take away

**Audit the thing you're championing.** Everybody tests whether their project
works. Far fewer test whether the claim they're making about it is exact. The
second question is the one that finds this class of problem, and it is usually
yours to ask, because nobody outside has a reason to look that hard.

**A premise is a feature, and usually the most important one.** We weren't
shipping authentication. We were shipping a promise about authentication,
and the promise was the part people would build on. Anything that quietly
degrades the promise has broken the product, however well the software runs.

**Bring a finding the hardest reviewer in the building has already tried to
break.** The room believed the recommendation because the principal hacker and
the engineers with decades in the building had been through it before the room
ever saw it. Due diligence isn't a checkbox before the meeting. It's the
reason the meeting is short.

**If you are holding one of these right now, this is the order.**

- Define the problem the moment you find it, and consult the experts.
- Explore the alternatives with their pros and cons, and make a recommendation.
- If the recommendation is to halt, frame it around what would have to happen to move forward, with the senior experts if you have them, so the room hears pause and not kill.
- Write it down as three things, the problem statement, the implications, and the recommendation, and stay on the data, because it is hard to argue with the data.
- Know what waiting costs before you go in. Ours was the OS image.
- Set the meeting as the recommendation rather than as a discussion of one, so nobody arrives surprised, and anticipate the pushback anyway.
- Tell your own team before the room hears it, with their next work already lined up.
- It is a tough call to make, so rehearse it, and make sure you are at peace with it.
- Go into the room with people whose word carries weight in the company, because it may rise or fall on their word. If you and the principal expert are aligned, it is an easier sell. If there is no principal in the room, you become the one, through the due diligence and the data. Even the principals were not principals when they began.
- Afterward, leave a written account of what would have to be true to start again, and follow up on it. The landscape keeps changing, and you may be the one who reboots the project.

**Halting is a result.** This is the one I had to learn, holding my breath in
that room. Months of work that ends in "not yet, and here is precisely why" is
not a failure to deliver. It is the delivery. The alternative was shipping
something that worked and saying a thing about it that wasn't quite true, and
then living with having said it.

The nerves are still there every time. Second-guessing yourself for a while is
right, because the second-guessing is what forces you to verify. Then you walk
in. It was the right thing to do, and it still is.
