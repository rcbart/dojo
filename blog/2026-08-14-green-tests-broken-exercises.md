---
title: "My tests were green. Four exercises were failing people who got the right answer."
description: "I had two CI gates and a passing build. Neither could see a whole category of bug — including one hiding in the code that did the grading. Here's the 68-line check that found them."
date: 2026-08-14
tags: ["testing", "ci", "javascript", "quality"]
slug: "green-tests-broken-exercises"
draft: false
---

Picture someone working through a coding exercise. They read the problem, think about it, write a solution
that is completely correct, and hit Run.

The page tells them they're wrong.

They stare at it. They try again with different variable names. They give up and look at the answer, which
is essentially what they already wrote, and they conclude — reasonably — that they've misunderstood
something fundamental.

Four exercises on my site were doing this. My CI was green the entire time.

## What I'm building

I run three self-contained learning platforms: one for general software engineering, one for identity and
access, one for JavaScript and Node. About 400 lessons and 600 exercises between them. Each one builds to a
single HTML file that works offline with no server, which is a constraint I chose deliberately and which
makes some of what follows more interesting.

Exercises are graded automatically. Some are checked structurally — does your answer contain the construct
this lesson is teaching. The better ones are **executed**: your function is called with real inputs in a
sandboxed Web Worker, and the return value is compared against expected values, one named case per failure
mode. An exercise like that carries a small spec:

```js
run: {
  call: 'topK',
  cases: [
    { name: 'the three largest, ascending', args: [[5,1,9,3,7], 3], expect: [5,7,9] },
    { name: 'k larger than the input',       args: [[2,1], 5],      expect: [1,2]   },
    { name: 'duplicates are kept',           args: [[4,4,4,1], 2],  expect: [4,4]   }
  ]
}
```

Plus a reference solution — the answer I'd write myself, stored alongside the exercise.

## A quick word on gates

A **gate** is a check that runs automatically and can refuse to let your work ship. That last part is the
whole idea. A check that produces a report is a signal. A check that can stop the deploy is a gate. The
difference only matters on the day someone is in a hurry, which is to say it matters constantly.

I had two.

**Gate one: unit tests over the runtime.** The shared engine that renders lessons and grades answers has
tests over its pure logic. Does the grader match this pattern correctly, does the sandbox strip the globals
it should, does the quiz shuffler actually shuffle.

**Gate two: a content integrity check.** This one parses every lesson file without running the app, checks
that lesson IDs are unique, that every exercise has a prompt and a solution, and — the substantial part —
runs each exercise's structural checks against its own reference solution. If an exercise says "your answer
must use a `while` loop" and my own model answer uses recursion, the build fails.

Between them: several thousand assertions, all passing, on every push.

## The blind spot

Here's the thing I missed for an embarrassingly long time.

Gate two checks the *structural* tests against the solution. For an executed exercise, those structural
tests are usually trivial — "mentions `Math.max`", "has a return statement". They pass easily and prove
nothing much.

Nobody was checking the part that actually matters: **does the reference solution, when you run it,
actually produce the values in the `expect` fields?**

It's like proofreading an exam paper and separately proofreading the answer key, but never once sitting
down and working the questions to see whether the answers are right.

Both gates were structurally incapable of noticing. Gate one only knows about the engine. Gate two only
reads files. An exercise whose cases disagree with its own solution sails through both, gets built,
deployed, and waits for a human being to find it.

## The check, in about sixty lines

The fix was not clever. That's rather the point.

```js
// For each exercise that ships a run spec:
const ctx = vm.createContext({ /* the same globals a Web Worker provides */ });
vm.runInContext(exercise.solution, ctx);   // load the reference solution
const fn = ctx[exercise.run.call];          // grab the function it defines

for (const c of exercise.run.cases) {
  const got = await fn.apply(null, c.args || []);
  if (!eq(got, c.expect)) {
    console.error('MISMATCH', id, '-', c.name, '- returned', got, 'expected', c.expect);
    failures++;
  }
}
```

Load the answer key. Work the questions. Compare. It runs 168 exercises and 907 cases in about a second,
and it exits non-zero if anything disagrees, which makes it a gate rather than a report.

## What the first run found

Four exercises that had already shipped.

**One was impossible to pass.** A diagnosis exercise passed its test data as an object where the runner
expects an array of arguments — `args: {loopLagMs: 350, ...}` instead of `args: [{loopLagMs: 350, ...}]`.
`Function.prototype.apply` with a plain object spreads nothing, so the function received `undefined` and
threw. Every single person who attempted that exercise got `Cannot read properties of undefined` no matter
what they wrote. It sits in the capstone — the last thing a learner reaches, so the people most likely to
hit it were the ones who had already put in the most work.

**One had an off-by-one that its own test data disagreed with.** A rate limiter, sliding window:

```js
const inWindow = allowed.filter(a => a > cutoff);    // what shipped
const inWindow = allowed.filter(a => a >= cutoff);   // what the test case expected
```

The case was named `'exactly at the window edge is still inside it'`. The reference solution excluded the
edge. The name and the code were arguing with each other and neither of my gates could hear it.

**One had test data written against a different mental model than its own prompt.** A backpressure
exercise: the prompt described a buffer that accumulates until it hits a high-water mark, and the cases had
been written as though the buffer drained after every chunk. Four of six cases wrong. Both halves looked
reasonable in isolation, which is exactly why nobody caught it by reading.

**And one wasn't a content bug at all.** This is my favourite.

An exercise returned an object — an HTTP-ish response with a status and some headers. Six of its cases
failed. The reference solution was correct. The expected values were correct. They just weren't *equal*,
because of this:

```js
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
```

`{status: 200, headers: {...}}` and `{headers: {...}, status: 200}` are the same object. They are not the
same string. My grader was comparing serialised text and calling it deep equality.

Which means this was never really about four exercises. Anyone whose correct answer happened to build an
object with the keys in a different order than mine was being told they were wrong. In an exercise about
HTTP responses. Where key order is meaningless.

The fix, in the shared runtime:

```js
const canon = v =>
  v === null || typeof v !== 'object' ? v
  : Array.isArray(v) ? v.map(canon)
  : Object.keys(v).sort().reduce((o, k) => (o[k] = canon(v[k]), o), {});

const eq = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));
```

Object keys get sorted recursively. Array order is left alone, because for a list the order *is* the data.
That distinction took thirty seconds of thought and is the only genuinely interesting decision in the whole
change.

A check I wrote to validate content found a bug in the code doing the grading. I don't think that's a
coincidence — it's what a genuinely new *kind* of check tends to do.

## What I changed

The gate runs in CI on every push, third in line after the engine tests and the content check. The runtime
bug got a unit test pinning the new behaviour, so it can't quietly come back. And I wrote all four defects
into the header comment of the gate itself, so that the next person to look at it — quite possibly me,
having forgotten — understands why it exists instead of deleting it for being slow.

That last part matters more than it sounds. A gate whose reason has been forgotten is a gate that gets
removed the first time it's inconvenient.

## The bit worth stealing

For years my instinct with quality was to ask *how much* we were checking. Coverage percentages. Assertion
counts. Bigger number, better feeling.

That framing would never have found any of this. Coverage measures lines executed. What I had was an entire
*category* of defect — "the content contradicts itself" — that no amount of additional checking within my
existing two gates could have surfaced. More assertions of the same kind produce more of the same
blindness.

The better question, and the one I now ask before adding any check:

> **What kind of bug would survive everything we currently run?**

If you can answer that quickly, you've just described the check you're missing. If you can't answer it at
all, that's worth a slow afternoon, because it usually means nobody has looked at the *shape* of the safety
net rather than its size.

Mine cost 68 lines and most of a Saturday. It found four broken exercises and one broken grader, and it
turned "the build is green" from a feeling into something I can actually point at.

---

*The courses are [DevDojo, IdentityDojo and JSDojo](https://roniam.dev) — free, offline, no accounts. The
gate is `scripts/verify-exec.js`, and it's about as simple as it looks.*
