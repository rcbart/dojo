---
title: "In the critical path of evolution"
description: "Reorganizations land hardest on the teams that sit in the critical path of everything. Identity is the clearest example. What I learned, from both sides of the chart."
subtitle: "An engineer asked me during a reorg where we fit in the org. The search for a real answer reframed how I think about them."
date: 2026-08-23
tags: ["management", "leadership", "platform-teams", "identity", "org-design"]
category: leadership
slug: "in-the-critical-path-of-evolution"
revisions: 21
status: published
---

Reorganizations are inevitable and they create anxiety. That much is a natural
reaction. But it doesn't mean you're just there for the ride, because there
are real things you can do to lower it. When the shape of things changes,
everyone spends a while working out what it means for them, and not much else
gets their full attention. I've felt it myself. I've watched engineers I think
the world of feel it.

I've been through reorganizations at more than one company, and on both sides
of that conversation, because I've also been the one planning them and walking
into the room knowing exactly how it's going to land.

What's different for a foundational team is its position. When you're placing
a team that everything depends on, there's no neutral spot on the chart,
because wherever you put it changes what it can optimize for. Correct
placement is deliberate, and it has a direct impact on outcome. Seeing that
changed how I lead through it.

If you've run one of these teams you know the shape of it. Identity, access,
the shared plumbing every product depends on. You're in the critical path of
everything, and being there is an advantage if you play it right. From SSO to
the login box, you own the surfaces where security and experience meet, and
they'll notice the one time you get it wrong.

That's the job, and it's a good one. It also means you're in the critical path
of the company's own evolution, which is why a team like this gets
repositioned when the ground shifts.

An engineer asked me in a 1:1: "I'd like to know where we fit in the org."

It's a fair question. He wasn't complaining. He wanted to know where we sat
and what that meant for his own position. And I wanted to give him a real
answer, so I went looking for one.

## The chart follows the world

The moving isn't confusion about where we belong. It's the organization
responding to a world that won't sit still.

Think about what's shifted underneath identity work in just the last few
years. Joiner, mover, leaver stopped being an IT ticket queue and became a
security control. The threat landscape moved on from credential stuffing to
the much harder question of trust, and AI has made that question harder still.
Passwordless went from a roadmap item to an expectation. And now a meaningful
share of the principals hitting your systems aren't people at all, they're
agents, and nobody's access model was designed for that.

Every one of those shifts makes a different part of the company the most
important place for this work to sit.

When risk and regulation are pressing, the answer is close to Security. When
customer experience is pressing, it's close to product, because the login
experience is one of the most product-facing surfaces a company has. When
scale is pressing, it's close to infrastructure. And when AI arrives, get
close to the AI group, because whatever they build will need identities before
anyone thinks to ask for them.

I've sat in all four: security, infrastructure, product, and the AI group as I
write this. Infrastructure and product are the two worth putting side by side,
because they pulled hardest in opposite directions.

Infrastructure is where the team evolves into a platform.

It also changed what we built. Standing up the IdP. Building an identity
management service from scratch.

Product is where we could invest in who we were building for. The feedback
loop got short. Questions about friction and trust and what somebody actually
experiences at a login screen stopped being abstract, because the people
asking them sat nearby.

It also moved us upstream. A decision used to arrive already made, and our job
was to deal with it. Close to product we were part of the conversation while
it was still a question, which meant we could say what an SSO solution
actually requires before anything got promised.

I'd take either again. Neither was a mistake, because which one is right
depends entirely on what the company needs to be good at that moment. And when
that changes, the shape should change with it.

I can say that because I've been the one drawing the boxes. As a director of
engineering I built the reorganization from the ground up for a group of more
than fifty engineers across the US, India and Ukraine, and I hired the Ukraine
team myself, starting from the first engineer.

The things I was watching all moved. A group with no release cadence at all
got a release train, shipping every four weeks because four weeks was what the
org could actually hold. Standups went from forty minutes for everyone to
fifteen minutes per team, with a parking lot for the rest. Product review
stopped being a major rewrite every cycle and became a demo and a few small
adjustments, once we broke the PRDs down into initiatives. That restructure is
also where I stood up a dedicated QA group.

When you're on that side, you're not looking for somewhere to file an
inconvenient team. You're looking at what the business has to get right in the
next eighteen months and asking which structure gives it the best chance. The
teams everything depends on are the hardest part of that puzzle, and they're
the part you think about longest.

Which brings me to the part I had to reframe.

>> An organization that never adapts its structure isn't stable, it's either not listening or incapable of change.

Noticing the ground has moved and acting on it is a real strength, and rarer
than it should be. It just doesn't feel like a strength when you're the team
being moved.

Structure shapes what gets built. That part everyone knows. What gets less
attention is where the team sits inside it. When a team sits at the edge,
moving it changes its own reporting line and not much else. When a team sits
in the middle, where everything routes through it, moving it changes the
relationship between that team and everyone who depends on it. Same
reorganization. Very different question to get right.

## What that actually means

So here's what I told him.

Being moved isn't a verdict on your worth. It's a consequence of how much
depends on you. If the company is adjusting to something, and everything
routes through your team, then your position is part of that adjustment. You
can't adapt around a team like ours without adapting us too.

Believing that changes what you do next. Read it the other way and you spend
the next quarter proving yourself. Once you understand it's structural, you
spend that quarter on something far more useful.

Here's what that looks like in practice.

## Not missing a stride

The first job after any reorganization is continuity. The pages still get
answered, the roadmap still moves. After that, what I care about most is how
fast the team and its new leadership start operating as one unit. Most of that
work is mine.

A reorganization resets some of the context and credibility you've built, and
the pull is to perform. To over-explain. To walk in and establish that you're
one of the good ones.

That instinct is human, and emotional. What's useful to a leader taking on a
lot at once isn't a highlight reel. It's whatever shortens the distance
between them and a good decision. More is arriving than anyone can process in
those first weeks, and whoever reduces that load is who they end up relying
on.

That's most of what communication is. Adapting to what works best for the
person you're communicating with, rather than what's most natural for you to
say. Leaders can act on a decision list. Nobody can act on a context dump.

So I brought two things.

**A boundaries document.** Not aspirations. What we do, what we shouldn't be
doing but are doing anyway, and what we don't do at all. The middle ground,
what we do but shouldn't, is the one that needs the focus. For foundational
work this matters double, because when a customer incident lands it arrives as
a login error or a hang after sign-in, and most of the time it has nothing to
do with us. Without that written down, we get pulled into every one of them.

**The roadmap, and where we actually are against it.** Nothing gives new
leadership a clearer picture of what they've just taken on, and the picture is
what an action plan comes out of. Where the work is going, what's already
committed and to whom, what's burning, and what's going well.

And the one that matters most: I asked what they expected of us, and mapped
our work to it out loud. Not on day one. They need room to breathe first, and
asking too early is dumping, not enabling. Enabling a new leader isn't a
performance. It's showing them, repeatedly, that their problems get smaller
when they route them through you.

## The team with questions

The questions start almost immediately. "Should I update my resume?" "What's
our domain now?" "What are we doing, and what are we not doing anymore?"

These are valid questions and they carry real concern. It's what people do
when the shape of things changes and the details haven't caught up yet. I've
asked the same questions myself.

The tempting move is reassurance. "Nothing will change, don't worry." I've
watched managers say that. The words are cheap, everyone knows they're cheap,
and when something does change, you've spent credibility you can't buy back.

Here's what I did instead.

I answered the resume question directly. My actual answer: "Your resume should
always be current, and it's got nothing to do with this. What I can tell you
is what I know, what I don't, and where to put your attention, which is one
part you can control." And the standing promise underneath it: the moment I
know something relevant, and I'm allowed to pass it on, they hear it from me.

Straight answers aren't comfort, and they aren't meant to be. What that does
is point everyone back at the actual work, which is adapting alongside an
organization that's adapting around us.

I separated what changed from what didn't, in writing. Reporting lines
changed. The on-call rotation didn't. The systems we own didn't. The roadmap
mostly didn't. Uncertainty expands to fill undefined space, and a written list
shrinks the space. I kept a running FAQ, including the questions I couldn't
answer yet, with "I don't know, here's when I expect to" beside them. My
guarantee has always been that my engineers know what I know. Saying I don't
know, and then going to find out, is part of keeping it.

And I gave that "where do we fit" question the real answer rather than a pep
talk, the same one I gave him in the 1:1. Then the team got the same
boundaries document I had given leadership, so nobody was working from a
different version of what we owned.

Then I socialized it upward until it stuck. The bar I set was that anyone in
the company, asked about us, could say in sixty seconds what we do and what we
don't. That's the test, and it isn't met until you're out of the room.

Did the uncertainty vanish overnight? No. Calm came first. Acceptance came
after it, and nobody announced it. Once I had a concrete answer the questions
stopped, and the people who had asked them didn't come back a week later with
the same question in different words. That is the signal, and it's most of
what you get.

And the questions changed shape. "What happens to us?" became "should we be
picking up more of this now?" That's the same energy pointed somewhere useful,
and it's the part I'd most want another platform manager to hear.

A reorganization is one of the better opportunities a foundational team ever
gets.

## The people who arrive

A reorganization rarely just moves you. Sometimes you lose people and
sometimes you gain them, and losing them is by far the hardest part of this
job. It isn't what this post is about. The ones who arrived came carrying
their own version of the same questions, plus one more: nobody on either side
had picked this, and everybody knew it.

So the first thing I did was make them part of the team rather than guests in
it. They came in carrying work, so they finished it first. As each one landed,
I paired them with the engineers who had been here longest and brought them
into everything we ran.

**The design documents, and a seat in the design meetings.** Nobody sensible
expects a new engineer to be in the code on day one, and for the senior people
that would be the wrong use of them anyway. Design reviews are where a team's
reasoning is visible, and they're the first place where experience and
feedback can change things.

Nobody announces the moment it lands, but you can see it. The first change
they ship into your production, a config fix or a small feature off the
critical path, changes how someone sits in a meeting. They stop being someone
who was moved here and start being someone who works here.

And I gave them the same account of the reorganization I had given the
existing team, in the same words. If you want one team rather than two groups
wearing the same badge, everybody has to be working from the same
understanding of why they're sitting together.

## What I'd tell myself before the next one

There will be a next one. That's not cynicism, just base rates, and now I know
why.

The team takes its cues from you, and they read you better than you think. Not
from your announcements. From your posture in meetings, and whether your 1:1
questions sound like curiosity or like an exit interview.

So I didn't try to project anything. I reasoned it out, and the reasoning is
what steadied me. In identity a reorganization is closer to a blessing than a
threat, because whatever the chart looks like afterward, somebody still has to
own the login box. Once that was clear to me I didn't have to work at the
posture. I just had to say it out loud, as often as it took.

Being table stakes is a particular seat. The bar only ever goes up, the wins
are quiet, and the chart will keep getting redrawn around you. None of that
determines whether your team thrives.

## What to take from this

What you do next, does!

Start by naming it correctly, and keep naming it. Not every reorganization is
the same. Some are survival. Some are a company aligning itself to a reality
that already changed. Your team knows which one they're in, and handled badly
the two read identically, which is the whole problem. So work out which one
you're actually in, and frame every answer to fit it. The aim is to calm the
waters.

If it's survival, that's the easier one, and the company will do most of that
work for you. If it's the second kind, nobody else is going to do it, and
that's where you step in as the stabilizing force. The organization isn't
confused about where you belong. It's adapting to a world that won't sit
still, and structure is the fastest lever it has. That reframe only works
through repetition. Not once, in the meeting where it gets announced, but
every time the question surfaces, in the 1:1 and the corridor and the standup,
for weeks after you think it's settled. The same answer every time is what
turns it from a line you delivered into something the team believes.

Do all reorganizations fall neatly into those two categories? No. There are
endless variations, and I've had my own, but those are worth a post of their
own. Some are genuinely confusing, where nobody will tell you much and you're
working with very little. Some are political. You know your own circumstance
better than I do, and if it's one of those the advice is different. Escalate.
Be truthful about what you need and about what you're seeing on the ground.
Don't lay blame, describe the situation, and work towards something that's
both diplomatic and logical. Say what you don't know, then go and get the
answer. You're not alone.

Then work with whoever has just been handed your team, rather than around
them. They're absorbing as much change as you are, from the other side and
with less context, and the pull to perform for them is the wrong instinct.
Shorten the distance between them and a good decision instead. The roadmap and
where you actually are against it, what's burning and what's going well. Ask
what they expect of you once they've had room to breathe.

And take what the new neighborhood is good at. Every part of an org is good at
something. Infrastructure taught us scale and shared practice. Product put us
next to the people we were building for. Find that, use it, and deliver for
the people around you, because an org that counts you as one of its own is a
force multiplier you can't build yourself.

Get those right and where you land on the chart matters much less.

Reorganizations will keep happening, and most of them are the organization
doing its job. You don't get a vote on that. You do get to decide how well
your team comes through it, and everything above is what worked for me rather
than a method.

Being unsettled is a reasonable response to change and it passes on its own.
The anxiety is what's left when nobody has explained the change, and that part
is yours to take away.

If you've lived through your own version of this, I'd like to hear what you
did differently. I'm still collecting. And if you're in the middle of one now
and want to talk it through, get in touch. I can't promise answers for your
situation, but I can help you work out the right frame for it.
