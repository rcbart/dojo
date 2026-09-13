---
title: "A development center from zero"
subtitle: "I was sent to build an engineering organization where there was none, and to make it work with a team seventeen hours away."
description: "A company whose customers ran million-dollar machines needed engineers on the customer's clock, not its own. I was sent to build that, from an operations office in Tucson with no engineers in it. What it took, what it cost, and what I would do differently."
date: 2026-09-13
tags: ["leadership", "org-design", "hiring", "distributed-teams", "directors"]
category: leadership
slug: "a-development-center-from-zero"
revisions: 43
status: published
---

An opportunity like this doesn't come around very often. Building a
development center from scratch is rare. Most engineering leaders never get
to do it.

But I did.

I'd do most of it the same way again. There are two things I'd change, and
nothing was hiding either of them from me. One of them was standing against
a wall in the office the whole time.

## Why a fatigue system ended up in a mine

The company builds machine-learning systems that monitor drivers for
fatigue events. Camera,
compute platform, tactile alerts: several parts that have to work together
in a moving vehicle.

Putting one in every car was the ambition, and the problem was cost: the
system was prohibitively expensive for an everyday car. I remember the SVP of
product management putting it to
leadership simply and elegantly: nobody was going to sell at that price point to a
passenger car manufacturer, even a luxury one.

He was right. The mines were already the business, and the company
understood that problem.
A price that ends the conversation with a car manufacturer is unremarkable
next to a haul truck, which costs anywhere from two to seven million dollars. In mining there's no such thing as a paint
scrape. A multi-ton impact costs hundreds of thousands of dollars before
anyone counts the human cost, and after it come the investigation, the
litigation, and the automatic cessation of operations until the incident is
resolved. A system that prevents one of those pays for itself many times over on the day it works.

And the money isn't the real incentive. In Australia, the US and Canada,
mine safety is a government mandate, not a policy a company can decide to
have: the government says fatigue is a problem the operator has to fix, and
we were what the mines chose to fix it with.

I saw what a mandate looks like on the ground. At a site in British Columbia I watched a moose walk across an active mine, and every operation
stopped until it had finished crossing. Nobody debated it, and nobody was annoyed.

Every mine was going to have a system. The only question was which one.
Cheap ones existed, and accuracy is what we competed on: false positives
were a hard problem, and a missed true positive was a critical incident.

Once a system is designated a safety system, the truck doesn't run without
it. That was the constraint we worked inside, and it's where the
customer's demand came from: a unit that goes down takes a truck off the
line.

So the customers were mines, all over the world, and one of the first was
in Tucson, Arizona.

## Seventeen hours from a fix

A high-paying customer that has stopped its operation doesn't want to hear
about your release calendar. They expect a fix now, and "now" was the thing
the company couldn't offer, because Canberra's clock runs seventeen
hours ahead of Tucson's. Shipping anything, from a bug fix to a full deployment,
meant a working day that ended before the customer's began.

There was already a Tucson office, around twenty people, six of them
monitoring staff doing the human-in-the-loop review of fatigue events as
they came in. This was an operations and monitoring center, not a
development center, and none of those people reported to me. Good people,
and by design they couldn't solve the problem. They could see it, report
it, and then wait for a hemisphere to wake up. There was no ability to fix
anything on the ground.

The decision was to open a development center in Tucson. That's where I came in. The company ran flat and the director title didn't
exist there. The job was the mandate, the investment case, the hiring and
the site, which is the scope a title doesn't show.

Once I moved and the center was standing, engineering and QA reported to me.
Operations stayed where it was, with the operations manager, and the
monitoring staff I came to co-manage with him. I still had people reporting
to me in Australia, and I handed them to a manager there, so from Tucson I
worked with him instead of with the whole group.

## What the mandate actually was, and what it turned out to be

I was given expanded office space, money to hire, and a mandate to stand up
a development center. That's a real mandate and it's also a sentence, and
it took a few months to work out what it meant in practice, from what the
job descriptions should say to where the developer stations went.

The measurements came first. Before the center was stood up, I was
flying over every two weeks with a specific purpose: identify the
metrics, and settle what
we'd measure success on.

Reporting was the easy part. A written report went up every week, built
around one question: where were we against the roadmap. Every trip back to
Australia ended in a meeting with leadership, and I carried two things into
it. The report, and a problem list: where we were hitting friction, what
was blocking us, and which of it needed the team in Australia to solve.
Some of that we'd already fixed from the US by the time I landed.

Availability was the number that needed the most work, and the operating
system was part of why. It was a general-purpose system on a device that
needed an embedded one. It worked, but it consumed storage, memory and
processor cycles the product didn't need, which made every unit more
expensive and ran it hotter than it had to inside a sealed box on a haul
truck. And because the image carried drivers as well as applications, a
small fix became a complete upgrade. We had a replacement in play. The
problem was getting it out there, and the decision attached to it was that
every bug fix would carry the switch: tested on both variants, shipped as a
full upgrade. A truck that took a bug fix came back on the new operating
system.

Hiring in Tucson is supposed to be the hard part, and it is, until you learn
what's already there. Southern Arizona calls itself Optics Valley, and the
name is earned: major defense contractors, observatories and electro-optics companies. There was something
real to tap into. What there was not: any reason for the engineers there to want
to work for a company nobody had heard of, so the work
was going to find them, not posting and waiting.

The reporting never kept me up at night. The unknown unknowns did. The
problems that mattered were the ones the mandate never mentioned. You
can anticipate some of them but not all, and that's the nature of the work. You work within the confines you have, you ask the
people around you for help, and you find a solution that doesn't need
monumental changes.

**The code couldn't be shared.** The code lived locally, and it was a
monolith. Two sites can't work on a monolith without standing on
each other constantly, so what looked like a hiring project was actually a
refactoring project first. Conway's law, felt from the other side: the
organization I was building couldn't exist until the software was shaped to
allow it.

**There was no software development lifecycle that spanned two countries.**
It had never needed one. Securely sharing code, branching, reviewing across
a seventeen-hour gap, releasing without one site blocking the other: all of it
had to be built rather than adopted.

**The testing regime had to be split, and then split again.** We started by
keeping unit and functional tests in Australia and taking end-to-end and
integration testing in the US. As the US engineering force grew, unit and
functional testing followed. And because the product is hardware and
software together, we had to stand up a QA facility that could test the
device, the code, and the two of them combined.

**And the machine learning needed data.** The core of the product is
classifiers, and classifiers need training data at volume. Not just any data: operators in
cabs, in mines, doing the work.

## The lifecycle had to be designed

The code problem arrived in the most concrete form available. In
Canberra the monolith had rarely hurt, because each group worked on its
own part of the code. Conflicts were rare, and the ones that happened
were resolved in real time. Once Tucson was running, people on the same
team were changing each other's code, and the time difference compounded
it. You'd commit at the end of your day, or not, and wake up to find the
code had changed underneath you. Weekends were the worst of it. Nobody was
at fault, and there was no process to blame, because there was no process.

I saw it in person. The engineer I'd later relocate and I came over on one of the biweekly
visits and worked out of Tucson for the week, and it happened in front of
us. Until the lifecycle existed we worked around it: onto the secure
corporate network, and sometimes a remote desktop back to our own machines
in Canberra so we could work there instead.

It was frustrating, and it worked in our favor. The overwriting highlighted a problem that hadn't existed
before, and it gave us that problem in a form we could quantify. And
solving it didn't just fix the two-site friction; it solved the general
problem of working on a monolith instead of components, which we were
going to have to solve anyway.

There was a second reason to break up the monolith, and it had nothing to do
with where anyone sat. Shipping a fix to a truck wasn't a deploy. The
machine had to come off the line and be somewhere a technician could reach
it with a USB drive, or in the one spot on site with WiFi. The devices
reported events over a metered mobile connection in the middle of nowhere.
That was fine for events and hopeless for a whole system image, which could run for
hours and eat the entire pipe. A monolith meant every fix was a full upgrade. Components meant a
smaller bundle, and a smaller bundle was the difference between a fix that
could be delivered and one that had to wait for a truck to be somewhere
convenient.

A failed unit was a drop-in replacement, done in hours. It cost us
inventory, carried only to be swapped in. Expensive, but acceptable.
Software was worse: the truck came off the line and waited for the fix. An
operator put it to me this way: a truck that isn't hauling ore out of the
pit is losing us money.

This was around 2014, and the lifecycle couldn't be adopted, so it was
designed. Over six months, in phases I defined, we did four things.
We broke the code base into components, not microservices, because this was an embedded system, and each component came
with an ownership mandate for one team, so that two groups no longer had a
reason to touch the same file on the same day. We moved to trunk-based
development, so nobody lived on a long-running branch long enough to reach
merge-conflict hell. We put hardware abstraction in place, a layer between
the code and the specific boards, so one could change without the other.
And I drew an
internal line between the hardware-facing layer of the middleware and the
higher-level application code, so the two could move at different speeds.

We had expected the components to be enough on their own. They weren't.
Giving each one to a single team stopped two teams colliding. It did
nothing about two people on the same team colliding inside one of them, so
we refactored a second time, within the modules.

And one rule sat on top of the four, and it was non-negotiable: whenever
work was done on a cross-ocean artifact, the ticket had to be assigned to
a person across the ocean, with the changes documented and the rationale
for why the change was made, and where. Nobody woke up to changed code
without waking up to the reasons.

Every release now carried coordination
work that hadn't existed before, but it was better, and not by a small
margin: different teams could work on different components without touching
each other.

Between them, the components, a far smaller system image and co-location took
fix-to-ship from about twenty-four hours to under two. The smaller image was
earlier work, done for the footprint before the center existed, but it made
modular deployment across two teams and two countries far easier. As much as seven of those
hours had been building and testing a whole image every time, for any fix
at all. The rest was the seventeen-hour time difference, and co-location
took that.

## Nobody was the obstacle

Ownership got argued out, and the arguing started before I got on the plane. Through the two-week trip cycle we sat down with the engineering
teams, laid out what the time difference was doing to us, and asked them to work
out a way through it with us. What followed was a large code review and a lot of back and
forth about which changes had to be made, who should own which code, and why.
There were disagree-and-commit moments, several of them, with the
understanding that ownership could be redrawn if we got it wrong. Once that
was settled the flow started rolling. It was easy to get into a cadence, and
the regular cross-team reviews sorted out whatever contention was left.

The split we landed on followed the code. The computer vision and the
classifiers were built in Canberra, so anything that touched the algorithms
directly stayed in Canberra, and the applications on top of them were built
in the US. Most of the end-to-end QA and validation moved to Tucson, and so
did data collection.

The one piece that kept both sides talking was the front-end monitoring
application. The UI developers were in Australia and the monitoring center
was in Tucson, and it was the only monitoring center the company owned;
every other one was run by a mine. So we kept an open channel, and the
monitoring center cut tickets straight to the UI team. Three real product
changes came through that channel and not from any roadmap: data
compression, the request for non-identifiable data, and event
classification.

The opposition, if it deserves the word, was upstream of the engineers and
it was legitimate. Leadership had to acknowledge that this needed a real investment in a
development center alongside the operations center already there, and
putting that on paper was my job, with US leadership and finance:
dollar amounts, a justification, and a plan to get the most out of the two
of them sitting side by side.

That constraint is where the labeling idea came from. Once you're being
asked to maximize the return on an expenditure, you start looking hard at
what you're already paying for and not fully using. I had found a solution
that solved two problems at once: we could get more out of the monitoring
team, and we could get real training data, at volume. Data had come in from the
sites from time to time. This put the whole operation under our own roof.

## The monitoring center, and the idea I'm proudest of

The monitoring center was there for a good reason, and they were working
it: real customer engagement, human-in-the-loop decisions on live events.
But there was an opportunity to use them even further.

They were, without anyone having framed it that way, the highest-quality
labeling operation the company had. They were already looking at data
from vehicles in the field and deciding what it was. So part of my plan was to build
a system that took that data and used the monitoring center as
validators: training labels, real-time quality assurance on the classifiers,
and a feedback loop from the field back into the models.

That was one of the next things the new development center built. It picked
up the events the monitoring staff had flagged, downscaled them so they
could move at all, cropped them to the point where nobody in the frame
could be identified, and shipped them to Australia automatically. The same bandwidth arithmetic that governed everything
else governed the downscaling, and the cropping was how we kept the
operators anonymous.

The point isn't the cleverness. It's that the capability was already in
the building, being spent on one purpose, and nobody had asked what else it
was.

The labeling system grew the computer vision group, because labeled data at
volume is only useful if there are people to build on it. One of those hires was mine, and
he's a close friend to this day.

It fed a new generation of algorithms that cut false positives and made it
possible to classify events automatically by their probability of being
real.

And it changed what the model learned from. For years the head-tracking
model was trained on a dummy head sitting on a turntable. That turntable was
still there when I left.
But we moved to training on real labeled video, from real
operators, in real vehicles, at night, in dust, wearing sunglasses, doing
the thing the model actually has to recognize.

A dummy head on a turntable is a perfectly reasonable idea, right up
until you compare it with the alternative that was already sitting in your
own building.

## Knowledge doesn't transfer by document

Everything so far was plumbing. Components, trunk-based development, a
testing facility: all of it changes how work moves, and none of it puts the
system into anyone's head. A center full of capable engineers who don't know
the product is still a center that can't fix a truck today, and fixing a
truck today was the primary reason it existed.

So I identified the need, went to senior leadership with something that
costs real money, and worked with them to make it happen: relocate an
engineer I trusted from Australia to the US, to be the subject-matter
expert who taught the new engineers. He'd been on my team, high performing
and eager for the move, so I tapped him on the shoulder.

Relocating him wasn't the whole of it. He flew back to Canberra several
times to work alongside the original team and bring what he picked up home
with him. I made some of those flights myself, to sit with the engineers
and the leaders there so I could reproduce the way they worked in Tucson.
Australian engineers came the other way, a week at a time, to work with the
new team, and people wanted those trips. The rest of the cost sat in the
calendar: late-night and early-morning meetings, on both sides.

I was in the hiring loop myself, and hands-on building the development
environment for the new center. And the Optics Valley bet paid off exactly
where it mattered most: my first
engineer came out of the defense sector. The first engineer sets the culture for everyone after, and the local industry meant I could hold
that bar instead of hoping for it.

That bar is where the hardest arguments of the build happened, and they
weren't with leadership. It took a while to find candidates. Once there
were good ones in front of us, the hiring
committee wanted to move. That committee was me, the engineer who'd come
over from Australia, the operations manager, HR, sometimes the VP of
product, and, when we could get them, Australian engineers who happened to
be in the US that week. I insisted
that the first hires be strong hires, not good ones, and I held that line
through more than one round of people telling me we couldn't afford to
wait.

What I screened for says more about the job than the job description did.
The ability to dive head first into existing code, yes, but that's a
common requirement anywhere. Rarer: comfort with the strange environment
the US and Australia dictated. That async reality forces you to be brave
and change things confidently, to prioritize what you can handle on your
own, and to learn that the things that require collaboration across the
ocean, you don't do on a Friday night. A real
knowledge of the limitations of embedded systems and the unique
challenges they present. Comfort with being first in the door, which is
its own temperament: this wasn't a startup with a new idea, it was a new
facility being built for a product that already existed. And one more,
the one we actually designed the interview to test for: whether someone
could think about the product as it lived in the field, on a truck, in a
pit, and not as code on a screen.

Building that interview was a project of its own. I worked with HR, with
product, and with engineering on both sides of the ocean, leaders and
engineers, on how to construct questions that would actually explore those
areas. Most of the people we were talking to came out of defense, where the
work is co-located and the structure is fixed, and we were hiring for the
complete opposite: distributed, largely unsupervised, and collaborating across seventeen hours. The questions had to find out whether someone
could work that way, not whether they already had, because almost nobody
had.

The money side of hiring was settled before the first interview. I'd
worked with HR to identify the median salaries for software engineers in
Tucson, which set the bounds we hired within.

When I left, every person I'd hired was still there. Twelve
months later, when I dropped in for a visit, they still were.

## What it cost

For the first few months I flew from Australia to the US every two weeks. I
racked up the miles and the status, and I'd trade all of it back. A
fifteen-hour flight taxes anyone. At six foot five it's a different
category of experience, and my back kept the receipts.

The flights weren't the only cost, and they weren't the largest.

## The wall of boxes

Here's the part I got wrong, and it took a wall to show me.

When I built the QA group, I assumed that what already existed in the US was
fine and needed extending rather than rethinking. We had simulators. We had
automated reports. We ran them and relayed the results back to Canberra, and
by every measure I was looking at, testing was happening.

What we didn't have was hardware verification and stress testing. Software
correctness we could see, and we were watching it closely. Whether the
physical device survived the world it was going into was a question nobody
was asking, and I was better placed than anyone to notice that nobody was.

The evidence was already in the building, and I walked past it. One wall of the office was lined with boxes of returned systems. Every box
was a truck that had stopped. There were more stacked around the
technicians' desks, and those technicians were driving out to
sites every week to swap hardware. Our reports came back green.

I never counted the boxes. I've thought about that since. I was flying
over every two weeks to decide what we'd
measure, and the most
obvious measurement in the building was standing against a wall,
restocked weekly, and I never turned it into a number.

It's the most useful mistake I've made. Years later, on my first morning
at another company, I stood in a meeting and timed how long each person
spoke, on my phone, without telling anyone. I didn't think of it as a
technique. I was counting boxes.

The reports weren't lying. They were answering a different question. Our
tests could tell us whether the software was correct, and they had nothing
to say about whether the hardware survived. So the only place a hardware
fault could be found was the field, which means the customer found it, in a
mine, on a machine that was already stopped.

So we built what was missing. It prompted a much bigger change than I'd
anticipated. A testing facility with a bank of machines
running simultaneously, each against real data, which meant first building a
system to feed them. And an oven: a chamber that
could hold a system at the heat of an Arizona summer and the cold of a
Canadian winter, vibrating the whole time, because that's the actual life
of a device bolted to a haul truck.

It didn't overhaul the testing regime in one move. It raised the bar over
time, on real data, at increasing throughput.

About three months after the facility came up, the wall was gone. Two or
three boxes here and there, and technicians who were no longer spending
their week on the road swapping hardware. The shape of the change was
visible from the doorway, which is how I'd been measuring it all along.

The other thing I'd change is the order. The wall was an immediate problem,
and it had been saying so since the first week. I'd have brought QA up
first and put the first money and the first people there: a test facility
running before a developer was hired, checking every compute unit that
landed. QA would still have reported back to Australia, and the seventeen
hours wouldn't have gone anywhere. But every unit that shipped would have
been tested, it would have shipped on the new operating system, and fewer
faulty ones would have gone out to a mine. And with QA already in place,
the whole development pipeline would have moved faster from the first day.

Having engineers and test capability on the customer's clock collapsed the
time to repair. The development half of that was planned, and it worked: a software bug
found during the Tucson working day was diagnosed and fixed during that same
day, which was the original reason the center existed. The argument that
justified the spend turned out to be true after the money was spent, which
isn't something you can count on. What I didn't plan for was the same effect
on the hardware side, and I'd argue for it explicitly now.

## What it added up to

>> The size of the team was never the point. A bigger team isn't necessarily better, or even needed. The point was standing up a capability from zero, and solving a real problem along the way.

By the twenty-four-month mark the QA group was fully operational, hiring was
settled, and the engineers had been shipping for six months. The wall was
gone, down to a few boxes around desks, and the inventory we carried for
replacements was down with it. Remote hiring wasn't even a thought for us then, so the pool was whoever would come to Tucson, and the collaboration tool was a flight. At the end of
it the company had a development center in the United States, and new
customers across North America to serve from it.

When I started, the company had around twenty people in Tucson: office staff, the monitoring
center, support technicians, operations. Zero development. When I left,
there were five developers and three dedicated QA engineers
alongside them, a hardware test facility, and the thing that hadn't
existed anywhere in the country before: software development capability in
the US. That capability is what the mandate had asked for, and it's what
the wall of boxes, the oven and the labeling system all ran on.

Once the center was operational, the leadership that had sent me was gone.
A new CEO, a new COO and a new executive team had come in while I was in
the US, and they decided the role should be held by someone based here and
that I should go back to Australia, along with the engineer I'd brought
over. I asked whether I could stay with the company in the US. The answer
was no.

I had a life here by then and wasn't going to move again, so what I could
control was how it ended. I proposed a six-month transition and they
agreed to it. Operations kept running. The company hired a US-based
director to take over what I'd been running, and I sat on that loop,
because the role needed someone hands-on who understood how the two sites
worked together, and that's a hard thing to interview for from the outside. The same six months gave me time to find the next role, and
the next chapter started in Los Angeles.

Did it hold? To the best of my knowledge the development center is still
in Tucson, but I can't be certain. The last time I spoke to an engineer
there was about two years after I left, and development was still going
on.

## What I'd like you to take away from this

It's a huge task, and to me it was an honor to be asked. There
are so many things to consider, coordinate, and execute.
Some of them you'll never have done before. If you're
ever given the opportunity, grab it with both hands.

1. **Get the best people around you.** Documentation is vital, but
   information doesn't travel well through it. Get some people to journey
   with you. Working hand in hand with someone experienced beats
   documentation every time. You cannot do everything. Find a way to
   delegate, and work with people you trust.
2. **Work with leadership, and get help.** HR, financing, obviously
   engineering, and the people already on site. There is no way something
   like this can be done alone. Acknowledge that from the start.
3. **Expect the unknown unknowns.** I knew going in that there would be
   problems nobody had foreseen. The point of the two-week visits, and of
   the weekly report once I'd moved, was to find them, explain them in
   straightforward terms, and propose a solution for each. That was the
   report I carried back to Australia every two weeks, and then wrote every
   week from the US.
4. **Start collecting metrics as soon as you can.** You will have to
   define what success looks like, find where the problems are, and know
   when you're done. The only way to do that is to get metrics, set
   benchmarks and establish goals.
