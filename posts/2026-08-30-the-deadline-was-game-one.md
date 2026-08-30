---
title: "The deadline was game one"
subtitle: "Streaming the NBA Finals, far past anything we had carried and a company record at the time. Some of these lessons I learned the hard way, and all of them were worth having."
description: "In 2018, four engineers and I had a few months to make a CDN do something it had never done, for the NBA Finals. Here is what the project taught me, including the parts I only understood much later."
date: 2026-08-30
tags: ["leadership", "delivery", "scale", "video"]
category: leadership
slug: "deadline-was-game-one"
revisions: 24
status: published
---

Sooner or later you get handed a project where the date isn't yours. Not a date
you or your VP can renegotiate. A real one, set by someone who has never heard
of you and won't be taking your call.

Mine was the 2018 NBA Finals.

The numbers are the part people ask about, so here they are: we peaked at just
over **1.1 million concurrent viewers**, at a throughput in the **multiple
terabits per second**. Both were records for the company. I'm certain of the
concurrency number; the throughput, after this many years, I remember only as a
range. I'd rather give you a range I trust than an exact number I don't. There
were **four engineers** on the team. I was the engineering manager.

I've thought about this project a lot, and it isn't because of the throughput.
The throughput is a slide nobody has opened in years. It's because the
constraints were so unusually sharp that they exposed things about planning, and
about my own management, that a normal project would have let me keep believing.
This one taught me a lot, and it taught me quick.

What follows is what it taught me.

## The setup, briefly

The corporate history is convoluted; it matters for exactly one reason, and I'm
going to leave the names out of it. A telecom had acquired a CDN. Separately, it
had acquired a media company whose sports arm held the rights to stream the
Finals to mobile devices. Both ended up under the same roof, alongside more
companies than anyone there could have listed from memory.

The one reason it matters: **the streaming rights and the delivery network were
suddenly in the same building, and neither had ever been designed with the other
in mind.** So a question could be asked out loud that nobody had been able to ask
before. Can we carry it ourselves. We had never carried anything remotely like it.

The requirements came attached to the rights, and none of them were soft. Picture
quality. Startup time. Buffering, which is the one everybody notices. Ad
insertion, which is where the money is and which fails worse than a technical
failure because somebody paid for that slot. Highlights, while the moment is
still a moment. Latency, because a stream that runs behind the broadcast means
your phone tells you about the dunk after the neighbors do.

Not "important." Not "a priority." Non-negotiable, with guarantees attached.

*(What I actually remember about that period isn't the org chart. It's that the
media company still had a campus in Los Angeles and the food was phenomenal.
Everyone could tell you which company they reported to; the slew of holding
companies above it, nobody could recite. But everybody remembers the food.)*

## Find the shape of the problem, not its size

This one generalizes further than video, which is why I put it first.

Most people outside streaming assume live video is a bandwidth problem. It's
not. **A live stream isn't a hose, it's a rapid sequence of small files**,
roughly four seconds of video each, produced continuously and fetched one after
another by every player watching. Your phone isn't receiving a stream. It's
asking for file 4,417, then 4,418, then 4,419, forever, slightly ahead of when it
needs them.

Once you see that, the difficulty moves. Getting a signal out of an arena is
solved. The hard part is that **1.1 million people are asking for the same
four-second file within the same couple of seconds**.

A CDN normally wants a given file to live on *one* server in a cluster. That's
correct for ordinary traffic, where demand spreads across millions of different
files, a long tail, and the cluster's memory is better spent on breadth than on
copies. Live video has no tail: every player wants the newest file, the one
produced seconds ago, and the industry's name for that point is the **live
edge**. Follow the normal rule there and you concentrate the entire audience's
demand on one server per cluster.

A hot file is exactly what it sounds like: the file being requested most across a
sliding window, right now. So we inverted the rule, but only for the hot files.
We built it, and we called it **Hot Filing**. The generic name for the mechanism
is **intra-PoP rapid cache replication**, which is engineering speak and tells
you exactly what it does. It outlived the event: it became a named feature of the
CDN, and the company published a write-up of it a couple of years later.

Continuous statistical analysis of requests over that sliding window identifies
the hot files; those get replicated across every server in the PoP, then the
window slides and it repeats: constant analysis, constant replication, constant
expiry, constant purging.

Hold two facts together. **Those files are four seconds long and they live about
four seconds.** The entire working set is born, becomes the hottest content on
earth, and turns to garbage inside the time it takes to read this sentence.
Detection, replication and purge all have to finish inside a window shorter than
the lifespan of the thing being replicated.

**The part that generalizes:** we didn't make the CDN faster. We found the single
access pattern that would break it and handled that pattern specifically.

Sizing the expected volume still matters. You have to do it, and you have to do
it knowing the number will be an estimate, nothing more, because a peak is a
guess about magnitude. Characterizing the usage pattern isn't a replacement
for that estimate. It's an addition, and a valuable one: a pattern is a claim
about behavior, and behavior is what generalizes.

Patterns also open a door that sizing never will: they tell you who your users
are. Once you can see how the traffic behaves, you can start seeing user types
inside it, and in the age of AI, when a growing share of what hits your systems
isn't a person at all, knowing which kind of principal you're serving stops
being analytics and becomes capacity planning and security in one.

Ask "what does this traffic look like" alongside "how much of it is there," and
ask it first.

## Test early enough that what you find is still survivable

A few weeks out, in testing, one of the engineers noticed something that should
not have been possible: **the files being requested most weren't the files being
replicated.**

I'm not going to reconstruct the technical detail, because I no longer remember
it accurately and I'd rather leave a gap than invent a filler. What I remember is
the shape of it.

First the sick feeling, because this wasn't a crash and it wasn't a red
dashboard. The system was up. It was doing work. It was replicating across the PoP exactly as
designed, at the right rate, with healthy metrics. It was simply replicating
**the wrong files**, and every measure of its health was reporting on the wrong
thing.

That's the most dangerous class of defect I know. A system that falls over tells
you. **A system doing the correct amount of work on the wrong data looks fine**,
and keeps looking fine right until the load arrives that the whole design existed
to survive. Had we met this on the night, we wouldn't have found the bug. We
would have found the consequence.

Then a very long night, which I remember better than I remember the fix. Then
euphoria of the particular kind you only get around four in the morning when the
thing starts behaving. There was also an earthquake and a power outage somewhere
in that stretch, treated by everyone present as scheduling inconveniences. It was
Los Angeles.

**The part that generalizes isn't "test early," which is a slogan nobody argues
with and everybody under-funds.** It's an arithmetic question you should be able
to answer out loud at any point: *if the next test invalidates the design, is
there enough calendar left to do something about it?* We had weeks. Weeks were
enough. Days wouldn't have been. And whether we got weeks or days was settled
months earlier, when the overall timeline was drawn. Leaving ample time to test
is the program owner's responsibility, and sometimes the program owner is the
engineering manager. Nobody drawing that timeline knew this bug existed. That is
the point: ample testing time is a guarantee you buy against the bugs
you cannot yet name, and it is bought in advance or not at all.

## The assumption I never thought to check

Here is the uncomfortable reading of the story I just told.

That bug wasn't exotic. The entire design rested on one assumption: that the
thing identifying hot files and the thing replicating them agreed about which
files were hot. **That's the claim the whole system stood on**, and it went unverified until
an engineer happened to look closely at test output weeks before the event.

Nobody had specifically set out to check it. Not the engineers, and more to the
point, not me. I was in every design conversation. I understood the system well
enough to be useful in one. And I never asked the question "how do we know
the identifier and the replicator agree about what is hot," which in hindsight
is the first question.

I have a habit now that came directly out of this. Early in a project I ask
myself: **what assumptions am I making that, if they turned out to be false,
could bring the whole thing down?** The answers get written down. Not a risk
register. A set of bullet point statements, visible, and the team is
definitely invited to attack them. It's not
a process and it takes ten minutes, and it would have caught this.

The luck in this story isn't that we found the bug. It's that we found it with
weeks rather than days remaining. I don't want credit for that margin. It was
bought when the timeline was drawn.

## The room I wasn't in

The thing I did best on this project was absorb everything that wasn't the
problem. The guarantees conversation, the reporting, the constant question of
what we were cutting, which I answered early and answered myself. Four people
with an immovable date should be spending their attention on the problem and
nothing else.

Notice who found the replication bug, by the way. Not a monitor, not an alert,
not me. An engineer looking at test output and being bothered by something that
didn't add up. **You don't get that from people who are exhausted, or asked
three times a day when it will be done, or handed a status report to write.**
That's the actual return on shielding a team, and it's why I'd do it again.

But all of that protecting happened **downstream of the commitment**, because by
the time any of it reached me the decision had already been made. The scope, the
timeline and the guarantees were set in rooms I wasn't in. And the reality is
that even today, decisions are sometimes made in a room I'm not in.

I don't think that was a failure on my part, and I have no regrets about it.
It's simply where I was standing. But the lesson landed anyway, and it landed hard
enough that I've organized a lot of my working life around it since.

**When a decision is being made that will land on your team, get in the room
early if you can.**

And notice the order of the reasons, because it's an easy order to get
backwards and worth staying aware of. The
first value of being in that room isn't influence. It's **information**. It's
the earliest possible sight of what is coming, which is what buys you the time to
plan, to think about what you will have to cut, and to work out what you will
need afterwards. That's worth the seat on its own.

Influence is the second reason, and it's real but occasional. Sometimes you
change the shape of the thing. Often you don't. **But you're never worse off
for having heard it first**, and you're frequently much better off than the
manager who finds out when the work arrives.

## What I'd hand you

If you're heading into something with a date you can't move:

1. **Size the load, and characterize its shape.** The size is an estimate,
   nothing more, and you still need it. The pattern is the half that
   generalizes, and it's also where you find out who your users actually are.
2. **Write down the key assumptions that would bring the thing down if they're
   wrong**, in week one, where people can attack them. It doesn't have to be an
   exhaustive list. Usually two to four nail it.
3. **Ask whether there's enough calendar left to survive your next discovery.**
   If the answer is no, that's the finding, and it's more urgent than whatever
   you were testing.
4. **Decide what you're cutting early**, and decide it yourself. Late in a
   project everyone turns optimistic, because the alternative is admitting the
   plan was wrong.
5. **Get in the room where it's being decided, as early as you can.** First for
   the information, which you will always use. Then for the influence, which you
   will sometimes get.

Those are tactics, and tactics are the easy half. The hard half is the thing I
want to leave you with, because it's the one the story itself will tempt you to
ignore.

## The part I most want you to take

Stories like this get read the wrong way, and the wrong reading does real damage.
Somebody finishes an account like this one, admires the throughput, and quietly
files the whole thing under *what a committed team can do*.

So let me be as plain as I can.

>> These heroics aren't a sustainable model. They aren't a model at all.

They are an exception. An exception has to be named as one, out loud, at the
start, and it has to have an end date that everybody can see from the beginning.
Four people carried months of sustained pressure against a date nobody could
move, and it was survivable because the finish line was real and visible from
day one, and because crossing it meant it was actually over. **That visibility
is the entire legitimacy of the ask**, and it's precisely the thing an
organization deletes when heroics become the operating model.

Which is what happens next, reliably. It works, so somebody decides it's a
capability. The record goes on a slide, the intensity becomes the baseline, and
the finish line stops being a date and becomes a condition. At that point you don't
have a high-performing team, **you have attrition on a delay**, and nobody
will connect the resignation six months later to the thing they're
congratulating themselves about today.

- An immovable external date, with a visible end, is a legitimate reason to
  ask a lot of people. Those dates will keep coming; that's the business.
- The danger isn't the date. It's when the organization starts **operating on
  heroics**: when the plan quietly assumes the exception as capacity. That's a
  planning failure upstream being paid for downstream by engineers, in a
  currency nobody is measuring.
- Recovery is part of the cost of the work, not a gift afterwards. If you can't
  afford the recovery, you couldn't afford the project. You deferred the
  invoice.

Here is my own evidence, and it's why I'm confident enough to say all that.

We finished, and everybody took a couple of days off. I couldn't tell you what
happened in them. **I don't remember the day after game four.** The whole
stretch is a blur, and it has stayed a blur for eight years. Those days off weren't
a reward. They were a necessity. Give the engineers time to reenergize
after an effort like this.

What I remember is four engineers who were still there afterwards, still willing,
because the ask had a boundary and the boundary was honored. And a stretch of
days I can't account for.

I'd run this project again. I wouldn't run it twice in a row, and if anyone
asked me to, I would now say so in the room rather than absorbing it and
hoping.


---

*Postscript, for anyone who wants to check. Hot Filing outlived the event and
became a documented feature of the CDN. The write-up is here:
[Low-latency live streaming with a faster CDN](https://edgecast.medium.com/low-latency-live-streaming-with-a-faster-cdn-4ad05ac8fc01).
It's not my writing and it doesn't mention me, which is rather the point. It's
the one part of this story you can check without taking my word for it.*
