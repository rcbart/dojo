---
title: "How these posts are made"
description: "How roniam.dev posts get written. The ideas and judgments are the author's, the AI drafts the prose, and every post goes through a revision counter, cold reads by numbered block, fact passes against the text of the standards, and build checks for code, links and facts."
date: 2026-10-10
tags: ["writing", "method", "reference"]
category: identity
slug: "how-these-posts-are-made"
page: true
nav: 3
nav_title: "How these posts are made"
nav_blurb: "what I do, what the AI does, and the checks a post passes before it ships"
disclosure: guide
revisions: 11
status: published
---

If you're here, you've seen the disclosure that's on every post. It
says every idea, every thought and every judgment is mine, that I've
read and reread every line, and that an AI drafted the prose from my
notes, checked the facts and made it readable. This page shows what's
behind that line.

All the stories are mine, things I've experienced over decades of
working in the tech industry. Subjects are taught the way I would have
liked to learn them. My hope is that the reader can benefit from my
experience and take something away that they can apply in their
professional journey.

Why do I use AI? I don't have an editor, so I use the tools I have. AI
acts as my editor, but every event and every judgment is mine.

## Where a post comes from

A post starts as something I've done or something I've had to decide.
The leadership posts are accounts of work I did, and the material is
mine. I know what happened, in what order, what I chose and why, what it
cost and what I got wrong. The guides are how I do the work. They hold
the checks I make, the failures I've met and the questions I ask. Both
kinds start from my notes, my rulings and my answers to the questions
the drafting turns up.

In practice I think about the piece during the day and put the thoughts
down in the evening, in my own words, as answers to specific questions.
What did you see on the first Monday? Why four weeks and not two? What
did the pushback sound like? The AI weaves those answers into prose. In
the accounts of my own history the sentences are mine wherever I had the
hours to write them, and the AI's job there is to connect them. In the
guides more of the prose is the AI's. The judgments are still mine,
because a guide is a list of positions and I ruled on every one.

## What the AI does, and what it doesn't

It drafts prose from my notes. It checks facts against primary sources
and tells me when I've got something wrong, which happens. It splits
sentences, cuts asides and tells me when a paragraph is carrying two
ideas. It draws the diagrams from a text description and renders them.
It also keeps the ledger, so I always know which revision this is, what
changed and what's still open.

It doesn't decide what I think. It doesn't invent an event, a number, a
name or a quotation. When it writes a sentence that states a fact I
didn't give it, that sentence is flagged in the source as its own until
I confirm it or cut it. It doesn't answer a question only I can answer.
When the draft needs one it asks, and the answer goes in as I gave it.
And it doesn't soften a position because a reader might not like it.

## The revision counter

Every post carries a revision number in its source, and every change I
send is one revision. The number doesn't appear on the post. It's my
internal check on myself. The post about halting a project shipped at
revision 48. The guide to building cross-application single sign-on went
out at revision 61. Even this explanatory page went through eleven
revisions.

## The cold read

Before a post ships I read it cold, as a stranger would, and I send
back what stops me. It might be a term used before
it's defined, a sentence that points at a code block without naming it,
or a "why" the post asserts and never answers. A long guide gets read by
numbered block, so I can say I read from 71 to 94 and pick up at 95 the
next night. Every question I ask during a cold read has to be answered
in the post, in the words I got when I asked it. If I needed the answer,
a reader will too.

## The fact pass

A guide makes claims about standards, and I want each claim checked
against the text of the standard. Memory isn't good enough. I open the
standards myself and read them until I understand them. The section
number goes in the post next to the claim. Where a standard is still a
draft, the post says which revision it was checked against and that
later revisions may move, and where two documents disagree, it says
which one it follows and why. Some posts also have fact guards that
I run before every publish. A guard is a sentence the post must contain or a
sentence it must never contain, so a claim that was corrected once can't
quietly come back.

## The gates

I make sure that anything I post is readable, flows and makes sense. It
makes sense to me, and that's all I can guarantee.

A post doesn't build unless it passes a set of checks, and a post
that doesn't build doesn't ship.

- The code gate requires every HTTP and JSON sample to parse. An annotated sample is labeled as text so nobody pastes it into a service.
- The reference gate checks that every internal link resolves to a heading that exists and that every diagram matches the source it was rendered from.
- The fact gate runs the guards described above.
- The revision gate fails a post that doesn't carry its revision count.

The gates are scripts in the site's repository, and they run before
every publish. They catch what a tired reader lets through at eleven at
night. They don't catch a wrong idea, so the cold read and the fact pass
have to.

## What is never here

Nothing about my current employer appears on this site. Work from
earlier in my career appears as what I did and what I learned. The
company goes unnamed unless it's a matter of public record, and the
people are de-identified unless they asked to be named. I can publish a
guide about a kind of problem. I can't publish an account of what
happened at the company I work for now, and I apply that rule before a
draft exists.

## Why say all this

The disclosure line is short, and a short line invites the wrong
reading. "AI drafted the prose" can be heard as "an AI wrote this", and
that's wrong. It wrote sentences from my material, under rules I set. I
read every one of them, usually several times, before it went out with
my name on it. If that isn't enough for a reader, this page is
the rest of the answer.
