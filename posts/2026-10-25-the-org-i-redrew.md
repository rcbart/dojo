---
title: "The org I redrew"
description: "I rebuilt an organization of more than fifty engineers across three countries. What I changed, what it cost, and the part I got wrong."
subtitle: "Fifty engineers, three countries, one chart. The view from the side that draws the boxes."
date: 2026-10-25
tags: ["management", "leadership", "org-design", "directors"]
category: leadership
status: published
revisions: 81
---


## The state I inherited

I remember my first Monday. Immediately to the left
of the front door was a large meeting room, and at 9:00 AM everyone was in
it. I mean everyone, from engineers, IT, QA and support to the VP of Product, who,
I'd come to learn, was actually running the show.

It was the daily standup, for everybody, and it wasn't capped. It took as long as it took, around forty-five minutes on an average day, to sometimes over an hour. Twenty to thirty people were in the room, and
another ten to fifteen were on the phone from India, where the workday was
already long over. Not everyone spoke. Some updates were shorter and some were longer, and a typical one ran two to five minutes. I know that number because I timed it on my phone, quietly, while I stood there.

The first standup was eye opening in another way. The guy who had set up
my laptop and workstation that morning was also the guy giving the
updates on the build systems. That's how I learned that IT was also
doing DevOps.

I was standing because it was a standup. Enough people were sitting for me to notice. A standup is short because standing is uncomfortable. Take the discomfort away and you have a status meeting, which is what three quarters of an hour for thirty-five people is.

The timing itself was a habit I brought with me from an earlier job, and I learned it the hard way. At that company one wall of the office was lined
with boxes of returned hardware, restocked every week, and I never once
counted them. It was a tally of a failure I owned, in my own office, and I ignored it. I've counted ever since.

The product was a direct to customer payment platform, web and mobile, with
its own payment devices, and a back end for the healthcare providers. My title was
Director of Engineering. I reported to the VP of Product, and later to the
COO. On day one there were approximately thirty-five engineers in scope, in the US and in India, software engineers and QA engineers. All of them reported to the VP of
Product, and technical direction came from the VP of Engineering. There was no
formal reporting structure below that, no official groups or teams, and no
engineering managers. It was truly a two-man show. One was the VP of
Engineering, effectively the CTO, who'd told me he wanted to stay technical.
The other was the VP of Product, who was running things. I sat next
to the VP of Engineering, and over that year every engineering resource except the principal engineer
came to report to me.
The India engineers also had a GM in India, who reported directly to the CEO.

I did the arithmetic. Thirty-five people, give or take, for most of an
hour, five days a week. That's somewhere between a hundred and two hundred
person-hours every week, the entire output of three to five engineers. And the
people paying the highest price were the ones on the phone, who gave up every evening for a meeting held in our morning.

I wasn't about to make changes on day one. I'd had a hunch about where the
work was going, and the count confirmed it.

When I got to my desk, after the obligatory day-one IT gauntlet, I opened
Jira. It was a flood of tickets, loosely organized into epics. No
separation of UI from backend, QA thrown in here and there, and no real
product streams.

Inside the backlog I could pick out streams
of consciousness, for lack of a better term, threads of related work that
kept resurfacing, with no team shaped around any of them. The tickets were
showing me Conway's law at work, the org chart nobody had drawn, visible
in the tickets. That's where the idea of running Conway in reverse started for me. I could sketch the organization out of the tickets.

>> If the backlog could draw the org chart, the org chart could be redrawn from the backlog.

Not yet, though. Before sketching anything, I needed the lay of the land
on commitments, meaning what we'd promised, to whom, and by when. That meant the
VP of Product, the VP of Engineering, and sales.

The VP of Product is a great guy.
He was running every aspect of the various product streams under
development, and he ran the standup too.

That same day I got in a room with him. I remember my first two
questions to him. What do you need from me to fix? And how can I help
you do it? That was the kickoff. Then I told him that some things could change more quickly than others.

He asked whether I was talking about the standup. I didn't say anything. He
told me that was why I was there, and why he needed me.

So I asked him why it was structured the way it was, then listened. He was candid. He needed help. He wanted to run products, to get products scoped and customer projects attached to owners. It was all on his plate, and he was
running a lot, and that meeting was the only time in a full schedule
where he got a complete update on everything in flight.

That changed how I saw the standup. It was how an overloaded man was coping, and it was working for him, at a cost of somewhere between a hundred and two hundred
person-hours a week.

So I made him an offer. This is what I'm here for, to take that burden off you so you can focus. Engineering updates are mine
now. Let me take care of that for you. I told him I thought a restructure was coming, and that I'd use the first
weeks to find out whether I was right, and I said out loud what restructure
doesn't mean. No mass layoffs, nothing of the sort. The best currency I have is time, and I can
give it to him and to the engineers.

Then I asked for two weeks to onboard and understand the org. That was an
intensive study block, with no changes made. Following that, another two
weeks of me providing information, so that we could settle on a cadence
where he felt he had the visibility he needed, at the cadence he needed,
with the information he needed. That would be the mechanism we carried
forward.

The man running the show knew the meeting was broken, and he was paying for it
too. He just didn't have the capacity to act on it, and that's what I'd been hired for.

Over the next couple of weeks I had the intro calls, and past the
introductions we got quickly to the painful part. What are your pain
points in working with engineering? What do you like, and what don't you
like? The best insight came from a pair of questions, "Who do you like
working with?" and "Who do you struggle working with?" The answers to those two showed me who worked with whom.

But the biggest takeaway, by far, was that everything R&D related funneled
through the VP of Product.

I understood the needs from leadership, but at that time I didn't
understand, I only assumed, what engineering needed. So I set out to get to know the engineers. Who they are, what they like,
what they hate, what they want to do, and how they want to grow. Structure, direction and
clarity were what they asked for as their top priority. What they told me mostly aligned with what the tickets were saying, with one exception. The answers about ownership were wishy-washy at best. The backlog had no owners either.

And very quickly I was added to incidents. Some major, some minor, and the callout that stuck with me was that we had QA but didn't know how to best utilize it. That line led to promoting one of the
strongest people I found there and working with her to build a dedicated QA group. That story comes later.

I'd also asked the VP of Product what we were releasing next, why, and
when. He gave me rough dates and what was expected. To me that meant there
was a concrete deliverable, and a less than accurate consensus on what
would be delivered. During that first week I met with the senior engineers
and asked the same question. The answers were just as vague. This was all
about the next set of deliverables for the payment product going to
India. The first week ended with a plan, open to change, for what we were going to deliver in features, when we'd deliver it, and how
it would be delivered.

## What I changed

Before any ceremony could change, I had to answer a few fundamental questions.
Who was working on what, and in which domains? Who held a leadership position
inside the group, and did they know what they were responsible for beyond
people management? What projects were we on, how did QA fit in and what were
they testing, and what were the different PMs responsible for? If I could
figure that out, I could build a structure that made sense.

Several things became evident from the Jira board. There was
core infrastructure work going on, in database changes, core libraries and internal services. There was product-specific work, which was
interesting on its own, because India and the US, both with major
clientele, had differing PII requirements and different feature sets.
There were UI elements built specifically for a client. And there was
back-office work and client-facing work, and the two had different
requirements. All of it fed directly into how the product should be
architected, and how the teams should be structured.

Out of that came a US-based team with backend, frontend and QA resources, an
India team with the same structure, a DevOps group that stayed on paper with
the IT engineer carrying the builds until it was staffed, and the mechanisms
for collaborating across teams on the code that had to be shared. The promotions didn't all come at once. Once the technical needs were
identified, the managerial needs followed. It was a growth plan within the
org, first with
architectural and boundary definition, then informal oversight as
technical leads. That included mentoring toward people leadership, and then the official promotions were put in place, for senior and capable engineers with leadership aspirations, US leads and India leads. At the
same time I had worked with HR to create the engineering org hierarchy,
so when the promotions came the positions, expectations and compensation
were well defined and approved by senior leadership.

The UI work was built so that common components were developed once and
shared, while the custom components were divided between the regions
based on the customers they served. That required an element of code refactoring, as it had in [the Tucson story](/blog/a-development-center-from-zero/) and as it did for the backend engineering. It was the reverse Conway again. Once the teams were drawn from the work, the code had to be reshaped to match them. The shared code around the regional split was owned by the US team, since most of the engineers working in that code were in the US, with one
caveat. The company's principal engineer was in India. He had the deepest knowledge of
the codebase, and so we were working with him constantly. He kept reporting to
the CEO, who had insisted on working directly with him, and he worked in
parallel with the VP of Engineering. He contributed to the codebase on a
regular basis.

I took the reorg to senior leadership first, and I made the same case in their terms. This will give you a lot more visibility into how the
org is functioning, where the gaps are, and how we can correct them.

With their confirmation, I presented it at an all-hands, and I used the standup as my example, the change everyone would feel first, once
the teams existed to replace it.

That didn't mean I could be careless about it. The standup wasn't a tomorrow
job. It was there for a reason, and the reason was that the VP needed
clarity. If I killed the meeting without replacing that clarity, I'd save the hours and leave him with the problem the meeting was built to solve. I wasn't taking anything away from anyone, I was offering a better way to do
the same job, and that's what I told the room. The best thing I can give you is time and clarity. The big meeting
stayed until the reorg was complete. I'd called that out at the start. It
wasn't going to be an overnight change, and it was a tax we had to pay until
the teams existed, and we accepted it.

From the first standup to the newly formed teams took weeks, not days, and the
all-hands came partway through. Everything before it is what earned it. Getting to know the engineers, some of
them in India over calls. Getting to know leadership. Learning which pain
points needed fixing, and formulating the plan out of all of it.
I can't do a reorg without knowing what the aim of it is.

The India group was comfortable with how things operated, but also very anxious that I was about to upend their world. They were right that things would change, and wrong about how, and I had to
deal with that anxiety the moment the reorg started rolling.

My message to them was simple. We are here. We are doing great work. But
the way we go about it is less than ideal, so let's fix that. We will make mistakes along the way, and we will correct them. We'd change
things a step at a time, not all at once.

When I started the process of the reorg, I got significant
pushback from the GM in India. That was the longest negotiation of the
whole reorg, and it has its own section below.

**The release train.** We went from two weeks to four while the teams learned
to size work, and back to two when they had. The original release train was two weeks. I
asked why two weeks. Do you demo anything every two weeks? Are we
tracking anything on a two-week cadence? Are there customer expectations
we're working back from? The answer to all three was no. The reason was
that two weeks had become the industry practice, so we followed it, with
no metric behind it. When I evaluated the delivery schedule, the customer
commitments, and the needs of the engineers, along with their feedback,
it became clear that the two weeks were artificial. They needed time to work on significant tasks uninterrupted, more than
anything, and more often than not they needed more than two weeks. They could break tickets down into two-week blocks, but they needed more time to deliver. Breaking a ticket into two-week blocks wasn't the same as having work that fit in two weeks. Once the work itself did, we went back to two.

There was pushback from both VPs I worked with. They were worried that we
were slowing down the team, and they were also worried that with longer
sprints their visibility and control over what the engineers were doing
would be diminished. My justification was that the work doesn't change,
the ceremonies do, and the focus of the engineers increases. Ticket size changed with it. We adopted a method where tickets were sized to
the sprint block, and anything larger was decomposed and resourced so that a
large piece of work still fit the block. And I committed to visibility going up, not down. Jira would be up to
date at any given time, and I'd generate a progress report every two weeks without pulling the team into
more meetings. Visibility into how engineering was
working was my responsibility to leadership, not the engineers'. QA was part of the release approval. Only tickets in the done state went into
a release, and QA was the gate that moved a ticket to done. From there a
release was signed off through the pull request process and the engineering
leader's sign-off, with DevOps executing the mechanics of the release once
DevOps existed. Incident fixes didn't wait for the train. They went out
through a hotfix process we developed, implemented by engineering and, once it
existed, DevOps. I closed by saying that if
we saw, for some reason, that four weeks weren't working, we could always
adjust to something that worked. We did, once the teams were sizing accurately
and decomposing stories, and that's when the train went back to two weeks.

**Standups.** About forty-five minutes for everyone became fifteen minutes per team,
with a parking lot for the rest. This is where timing that first Monday paid
off. The standup was replaced by a standup for each team and a scrum of scrums on
top, with offline reports over Slack channels when they were needed. Beyond the team standups, the meeting load after the change was a weekly
thirty-minute scrum of scrums with only the leads, and cross-country handoffs
between the leads as needed, capped at thirty minutes and never a standing
meeting.
Once the
boundaries were identified and the teams more focused, I had to provide
absolute assurance that Product and senior leadership had equal or
better visibility into what was happening, and into the numbers. I also
had to ask the VPs and the other senior leaders a question of my own. Do you really need to know that?

The answer to that question is what I broke down for leadership, and for
myself as well. We don't need to know every engineering task that is
taking place. Even if
we did, there's nothing we can do with that information, unless we want
to critique every engineering decision, and that's not healthy. We need to know whether work is progressing as expected, whether people
are over-tasked and work is going to slip, and most importantly, whether
anyone is blocked on anything that isn't an engineering problem. That
last one is a call to action on us, and it's what we're really
interested in. I'd be either solving that myself or escalating it
proactively. I wanted the engineers to have maximum time and focus to
work on engineering, and at the same time, for us as leaders to have the
time to work on our own tasks, keeping the business moving forward.

**Product review.** It stopped being a major rewrite every cycle and became a
demo and a few small adjustments, once we broke the PRDs down into
initiatives.

The work behind that started in week one. I reviewed the PRDs and their
requirements, then Jira and the content of the tickets. Next I aligned the
tickets that mapped directly to a PRD ask by grouping them under an epic
that referenced the PRD requirements. We broke these down together with
the senior engineers, to identify the tickets that were specific to one
product and those that were core capabilities, fundamental to the entire
product suite and serving all products. There were two distinct backend platforms, one
serving the overseas product and one supporting the US, and each had to
consider the health care and privacy requirements of a different country. The PRD and Jira review left us with the components that could be common
across both.

**The QA group.** The group existed. The restructure is where it got a
leadership structure. It started in those first incident calls. I promoted a QA engineer to lead it and we built the group hand in hand. On day one the QA engineers stayed inside the US and India teams, and none of
them reported to her yet. She set the standards and owned the mandate. On day one the priorities
didn't change. Once the roadmap was solid, Product set the priorities, and the India GM and I were accountable for seeing them delivered.

I saw in her something I believe myself, and something she called out on her
own. QA isn't part of the engineering team, they're their own function. They're there to
exercise the system and try to break it, and they need an equal seat at
the table to say "this is not working as expected and cannot go out like
this." That comes from having autonomy and a mandate, which is what she
called out, and it's what makes a QA group more than manual testing and ticket logging. She also said that manual testing is needed,
but automation is needed too, because it makes testing faster, shortens the loop
between feature and bug, makes reporting more accurate, and lets the
same people do more with the same resources. When I spoke to the QA
engineers, she was the one who articulated all of this. Add to that
an expressed desire to lead people, and to lead impact and change.

## The GM in India

Not everyone was excited. India was about twenty engineers across Pune and Jaipur, developers and QA, and the greatest pushback came from the GM
in India. He was worried about the
erosion of his status and scope, and I understood it was a real concern.
He voiced it to me, to the VP of Product and to the CEO, who was also the
founder. All of us, and especially me, had to make sure that it was not a
drop in status. Rather, it was a collaboration between all of us to see that the problems the org had were
addressed and the overall function
improved. It did take a while. But we talked regularly, I received and
absorbed his input, and he became an enabler of the transition.

His case wasn't weak. His argument was about QA, where eight of the twelve engineers sat in India and the numbers were mostly his. The team was doing what it was tasked with,
doing it quickly, and doing it well. They were finding bugs, and they were
delivering quality. Why mess with something that isn't broken?

My counter was a single fact. The QA team was delivering throughput, and
we were still having incidents. Both things were true at once, which meant
"not broken" wasn't true. The team was finding bugs when the company needed fewer incidents.

Underneath the argument was a concern anyone in that seat would have. A new
engineering leader arrives with a mandate from the CEO and starts redrawing the part of the organization that sits in your country. You'd want to know
what it meant for you. I wasn't there to usurp him.
 I needed him, because I can't be in India and the US at the same
time.

The key was not to bypass him. The CEO had given me the mandate to restructure
engineering, and the GM reported to the CEO, so the mandate covered his
engineers. But I wanted to do this together with him, as an ally.

I started by understanding what the fears were. I couldn't argue him out of a fear, and I didn't try. It
was a reasonable thing to feel in his seat, and I told him so. Then I set out to make him a partner. I met with him several
times and made the point that I wasn't out to reduce his impact. I wanted to offload
engineering tasks and day-to-day operations from him, keep the two continents
aligned without him carrying that burden, and let him grow the sites as
we took on more work. And on the first project launch under my tenure, I
made sure the maximum credit went to him.

That also meant publicly celebrating his leadership role at the all-hands
when I announced the reorg. I can't say I won him over overnight. But I
made sure everyone knew, on every India trip, and when we stood up in
front of the India teams, he went first. I involved him in every
decision and got his feedback. Ultimately the decision was mine, but his
feedback was in it.

The turnaround came through several streams. Clarity from the senior
leadership team. Active collaboration with me, where everything was discussed
and agreed upon and the decisions in his domain were left to him. And the trip to India. The
clarity started with the VP of Product, when I asked him plainly to give me the PRDs and the timelines and let me build a roadmap and
resource it. That was the long-term clarity the whole group was missing,
and it let us focus. For QA it meant no more guessing and no more context switching to whatever was loudest that week, because the roadmap said what was coming.

The conversations with him were long and passionate, and in the end I
traveled to India just to meet with him and see the team for myself.
That trip was the last of those streams. I made it a point to sit down
and talk with every engineer, there and in the US, from the newest hire to
the most senior. Those conversations weren't about my reorg but about them, what they needed
and what they saw.

So we didn't upend their world after all. We sat down together, looked at
the throughput, looked at the incidents, and started measuring whether the focus let more through, and whether we had fewer incidents.
And the incidents that still happened were now of a different nature.

They changed in profile and in severity. When I reviewed the incidents from
before I came to the organization, they were customer-facing. I won't say those went to zero, because that would
be untrue. But the incidents became more about internal reporting, and less
about what customers saw.

The other thing that changed was the time to resolution. When I came into
the company there was no metric for how long it took to resolve an
incident. One of the things I put in place was a measure of the time from
the report to the deployment of a solution. I had no numbers, so the first step was to establish a baseline, then work toward a reasonable
SLO, and then measure against it and meet it. The numbers aren't mine to publish, and the direction was the right one.

## Hiring beyond two offices

The reorg and the roadmap surfaced something the flood of tickets had been hiding, underinvestment in some fundamental efforts. It also changed what
hiring meant. After we'd defined the roadmaps, put resources against them and listed the
tangible tasks with their priorities, the gaps showed up as missing skills. Once that was done, the only thing
left was to assign engineers and hire where the skills were missing.

There were engineers I had worked with and trusted from the past, and those I brought on to provide these skills. One of them, in the US, I brought in because I knew exactly what he was capable of.

The first year's hiring was in the US and in India. The QA group grew,
and DevOps came in as a function of its own, reporting to me once I'd built it. Ukraine came after about
twelve months, when the projects and the customer base had expanded.

Some skills we had to hire outside the US and India. We'd identified large bodies of
work on the backend where we needed help, and I got the mandate to hire. It wasn't free rein with a limitless budget.
The budget came after I presented a plan for who would work on what and which
gaps would be filled, and that was the budget I had to work within. That's why
I went to Ukraine. I knew a company there from earlier in my
career. My employer had no relationship with it. I raised it myself, told them I had
no stake in it, and then made the proposal. I brought the relationship with
me, because there was a problem in front of me and
I knew how to solve it. We operated in a
highly regulated intersection between healthcare and fintech, and I knew
this team could deliver on the backend infrastructure quickly, and within the budget I had. We had a shortage of engineering and tight
deadlines, so I made a proposal to the CEO, the CFO and the COO. It
consisted of my experience with the Ukraine company, the projects they had
worked on in the past, a cost structure, the ramp-up time, and, for comparison, what hiring in the US instead would cost and take, based on past experience. I made the
recommendation to the senior leadership team and told them I would execute
on any decision. They agreed to go ahead with the Ukraine hiring. India and the US kept growing in parallel. Through discussions with the India GM, we
agreed that India would focus on the Asian market and that the backend growth
would be hired elsewhere. So I started it rolling.

The first engineer sets the pattern for everyone who comes after, so I
was particular about that one. That company didn't flood me with resumes and leave me to choose, which is why
I liked them. The owner met
with me several times, asked specifically what I was looking for and what
the person would be working on, and sent examples of work his engineers
had done before. My requirements were narrow. A very strong backend
engineer, capable of working with hardware. Very self-sufficient, which
here meant working in a distributed code base. And one requirement that
was particular to us. We couldn't ship the hardware over to them, so this
person had to be strong at building or working with simulators of it,
and at testing against those, so they shipped high-quality code to
devices they'd never touch.

The first engineer joined the group working on the US-based platform and had
to understand the architecture quickly. The contractors were managed by the managers of the US teams they were
assigned to. The proof was in how fast
they integrated and started contributing, and in the feedback I got from
the US team about the quality of their work. The US team stopped re-checking their work. Three more followed.

How independent they were got tested in a way nobody planned. The second
engineer we hired worked from another country for most of a year, and simply
kept going.

I reviewed every resume myself, and I paired
with a senior engineer for the interview loop. I knew the resumes coming
in would be high quality, because I knew the man sending them. I negotiated the rates with him on one side and with our CFO on the other,
within the cost structure the senior leadership team had approved, and I had
the final say on every hire.

DevOps was an obvious gap, with no real skills in the company, so I hired
two DevOps engineers, because IT had never been staffed for it. One
of them I remember clearly. On day one he went
into AWS Cost Explorer and quickly drew up a cost analysis for me. We'd widely over-provisioned our AWS
infrastructure, and we were paying a premium rate for the privilege. The savings were a meaningful
share of the bill, visible by the next cycle. The IT engineer who'd been carrying the builds went back to IT full time, and
a second IT engineer was hired to help him.

The US office and the India centers were twelve and a half hours apart. Managing teams that chase the sun could be a post by itself.

The first thing I put in place was a small overlap window, an hour at most,
for the engineering leaders, and the scrum of scrums and the handoffs ran
inside it. It ran in the US morning, by agreement with the India organization. It was the
same evening slot for India that I'd costed as the highest price, now for a
handful of people instead of thirty-five, with offline reports over Slack
taking the place of the meetings we could skip. The optimization was
around one idea, that if it can be summarized and decided in a document,
there's no need for a meeting. So we worked on providing high quality
documentation. That was part of an overall shift to a writing culture, and
we had to learn how to write effectively. I developed that as an
initiative with HR, and it included training.

Jira had to be accurate, and handoffs weren't optional. That was the price
engineers paid for fewer meetings, and I said so. If a lead couldn't attend a cross-country meeting, they had to provide a summary of their progress, their blockers and any other
relevant issues that the other
team could resolve or continue.

Another thing that came from the backlog and product management was a
defined domain of responsibility for each organization. Each group in each
location knew what they were working on, what they were responsible for,
and how to develop and deploy cross-functional components. Who owned each piece mattered more than who did the work on a given day.

The clearest instance was India assuming total ownership of the India product
and platform. That decision, and the
decisions that followed, came from the ownership definition. It was decided in meetings that tied into my work with the India GM, with him
as an equal partner. It was settled in a six-page document
that covered mandate, expectations, deliveries and resources.

Over time I learned that India had been used as a "delivery factory", and that wasn't the best use of their capabilities. I developed
autonomous engineering managers and leaders in both centers, who carried
the same weight and decision-making power in their domain. The primary
requirement of them was excellent and transparent communication. They also
agreed to share the burden of managing and attending the necessary
meetings.

One thing it cost me is that I had to attend all of those meetings myself
before I could step away, and that didn't happen overnight.

## The managers in the middle

The one-on-ones and the analysis of the work came first, and the reorg came
out of them. At the reorg itself, the US lead and the QA lead were in place,
DevOps was an empty box with the IT engineer still carrying the builds, and
India ran through me and the GM. The VP of Product ran the overall product strategy. The GM became responsible
for the business drivers of the Asian streams, the specific streams and
bespoke implementations that aligned with that strategy, and for hiring when headcount was needed. Once the engineering group was firm, the India engineers reported to me through the hierarchy, and he handled the business and HR side. Execution was the remit of the engineering managers. By the end of the year, four roles reported
directly to me, the US lead, the India lead, the QA lead and the DevOps lead. Three of them were internal promotions,
and all three wanted it. The DevOps lead was an external hire, and that role was filled about three months after the reorg. India engineering ran through me and the India GM for most of the year.

The head of UI and experience fit the streams from the backlog, since the UI elements were being built client by
client. Based in the US, they oversaw every UI design, customer-facing
and back office, while the UI engineers themselves were embedded in the
regional teams. I worked with them on identifying the most experienced
frontend engineers and on how we fed them requirements and designs as
part of the PRD. The head of UI developed the mockups and delivered them to the teams. In parallel, the UI and
backend engineers worked out contracts between the UI and backend
functions, and those contracts were what we developed against. With the
engineering leads we ran a scrum of scrums on top of that, so that work
arriving from different directions, a UI change against a backend
change, stayed aligned where the contract hadn't foreseen it. Those
cadence meetings were unavoidable, and we had to work very hard to keep them efficient, so the investment was worth
it. One win came later, once we had QA automation, which caught breaks in the contract and edge cases
nobody had discovered. The big takeaway was that no task was without an owner, and
high-level tasks were assigned to owners before implementation began.

The three leads were promotions from within. The head of UI wasn't a
promotion. The role had always existed, and it was integrated into the
engineering group. The plan came after the question, the
one about growth that I'd asked every engineer early, and it was built on the
answers. It turned out to be
a meeting of the organization's needs and individual growth desires.

Those conversations surfaced something else. There was no real growth
path. There were annual performance evaluations and salary adjustments,
and that was all. Some people wanted to pursue the manager path, others
wanted a technical lead role, and nobody was having those conversations
with them. So the question I asked everyone, the first time I met them,
was what they wanted to grow into. Then it was my job to line up what
they wanted with what the business needed.

Those paths became formal. I spent long sessions with HR defining role
levels and the criteria we'd measure performance against, because
none of that existed when I arrived. Then we built growth paths on both
sides, individual contributor and manager. I deliberately kept the word
leader out of both, because the expectation was that everyone becomes a
leader in their own domain. It became the company's formal process.
Every engineer was assigned a level, tied to leveling guidelines and to
compensation. Some engineers left during that year and the roles were backfilled. Attrition
was in the normal range.

The engineer I'd brought in from my own past was the clearest case for
the technical path. He wanted to lead technically and had no interest in
managing people. He was self-taught, the kind of engineer who reads RFCs
for pleasure in his spare time and then implements them, self-driven, and he found problems and brought the solutions with them. He went on to be promoted to system architect for the entire company, after I'd left.

Wanting the job wasn't enough on its own. The quality I looked
for most in a manager was the ability to drive change, who was pushing toward it and how they planned to go about it. Plenty of people raise problems. The ones I was looking for brought a solution
along with the problem, and that was the other test. Past experience counted, and so did seniority.

There was one more test, an informal peer review, though I never called
it that. I asked everyone I spoke to who they looked up to, who they enjoyed working
with, and why. The same names kept coming back, and that's how you avoid promoting a
brilliant jerk. I focused on growing people who had already made
themselves leaders in the company, people others wanted to work with and
who made the people around them better.

One case took longer. One engineer was a natural leader who wanted to manage,
and he had strong opinions and knew they landed hard. That's a different thing
from the brilliant jerk, who doesn't know or doesn't care. I took him on as a
mentee and worked with him closely on how he landed with people.

The first conversation was the same for everyone I selected. Before I gave anyone
feedback from outside, I asked them to do a lot of self-reflection and
then talk me through what they found. I wanted them to name their own
growth opportunities, because a problem they'd named themselves was a
problem they owned, and working on it from there didn't make them
defensive. Empathy was a requirement for every one of them, and developing it, along with an understanding of how they landed with other people, was a challenge, but a good one.

His path to manager was slower than the others', a slow roll. I paired
him with another engineer in an informal leader role. He ran scenarios
with me, where I played the engineer and he played the leader, and then
we reversed roles. Over time I checked in with the engineer he was
paired with, on how he was progressing and what changes they saw. When I was confident, I added a second engineer to work with him. After that
worked, I started making him a manager in the formal sense, but only
after I saw that the changes in his behavior were habits and not
one-offs. To his credit, he was open to feedback, and he
internalized it and made the changes, which is a rare quality.

And there was a side effect. It took so much pressure off me. And not just
me. It took a lot of pressure off the VP of Product. And it let the VP of Engineering move to the role he'd wanted, the CTO role, driving technical direction and adoption rather than people
leadership.

Once I'd promoted the managers, I devoted much of my time to growing them and developing them as leaders,
from talking about OODA loops as a concept to delivering hard feedback
in culturally diverse situations. One of the biggest pieces of work I had to do was with the QA lead. How do I give her the standing to push back on decisions, to block a release
and be heard? Part of the answer was the same exercise,
running scenarios with me and then reversing the roles.

## The part I got wrong

I'm proudest of this promotion, and I got its size wrong.

The QA org already existed, but it had no real lead. When I promoted her, I handed her responsibility for ten to fifteen people on
day one, with none of them reporting to her yet, and she was both assuming the
responsibility and building an actual organization. I threw her in at the
deep end. I'd talked to her and said I wanted her to lead. She was eager, and I went with it. A group
that size, with no layer under her, was more than the promotion had set her up
for. She had the ability. The promotion was sized wrong.

I should have done what I'd tell any director to do now, and started her with
one team. Grow it, get it functioning, let her feel the mechanics of a small unit working, and add responsibility at the pace of her wins.

The wrong sizing put a burden on her and on me, and it took a while to
correct. Her promotion was part of the mechanism we had put in place.
The group size was the problem. About four weeks after the promotion, once
I'd seen her plans and her ideas, and we both saw that it was too much to take on at once, I worked with her to slow roll the management path. At week four the four US-based QA engineers started reporting directly to her, and she led the rest
informally. Over several months, as her standing grew, more people moved into the formal management structure.
Fifteen people is a large group, and we needed a structure so that the load
was right. She ended up managing four engineers directly in the US and two
managers in India, fifteen engineers and managers in all. She became a
manager of managers. It's the same pattern we adopted for the other
managers. Most of them became managers of managers, and I managed senior managers who managed
front-line managers. That's three layers under me for fifty people, and each
layer had a reason. The senior managers each owned a country or a function,
and the front-line managers each owned a team, across a twelve-and-a-half-hour
gap. All of it was done over twelve months. That was the right path to take. She'd had leadership experience in
the past, and we developed it even further. We corrected it together, and she was a success. But I gave her a harder road to that
success than she deserved.

## What survived me

The group grew to over fifty engineers, across the US, India and Ukraine.
The company was later acquired.

The team structure, the development centers in India, the Ukraine contractors and the QA group all survived me.

If I were starting this on Monday, four things. First, listen, and don't make any changes until you understand the problems. Over a certain size, and especially in an international org, a flat structure doesn't work. You need to build a hierarchy, but it has to be balanced, so there aren't too many layers and engineering stays effective. Promotions take time and investment, and the leaders you grow come directly from you. And you can make changes, and if they don't work, make changes again. It's OK to try and fail.

