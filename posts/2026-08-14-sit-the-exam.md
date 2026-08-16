---
title: "Write the exam, write the answer key, then sit the exam: why dogfooding really, really matters"
description: "I built a learning platform with two CI gates and a few thousand assertions, and it still shipped four exercises that failed even when I got the right answer. The missing ingredient wasn't more tests. It was dogfooding, and knowing when to stop."
date: 2026-08-16
tags: ["testing", "ci", "quality", "engineering"]
slug: "sit-the-exam"
status: published
---

> "A common mistake that people make when trying to design something completely foolproof is to underestimate the ingenuity of complete fools." (Douglas Adams, *Mostly Harmless*)

There's a category of work that looks finished long before it is. You've reviewed everything twice. The checks are green. And the thing is still broken, because nobody ever used it the way a stranger would.

I found four of those in my own product. This is the story of how they got past me, the weekend it took to see them, the sixty-eight lines that caught them, and the inevitable and real-world question that came after: where do you stop?

## What I'm building, and why

I run five self-contained learning platforms: one for software engineering, one for identity and access, one for JavaScript and Node, one for Machine Learning, and another for the everyday operational work. The three biggest total 409 lessons and 624 exercises at last count, and each of them compiles to a single HTML file that works offline, no server, no dependencies. That constraint is deliberate. I want to make sure that someone trying to learn can focus on learning, not get dejected before the first exercise, because there is some setup issue. There is a whole discipline on getting your dev environment running, but that isn't the aim of this. It may be in the future. I'm still thinking about that one.

The intent behind all of it is simple to say and hard to do: develop engineers, not park them in tutorial hell. Watching someone else code isn't learning to code. So every lesson ends with an exercise you do yourself, and the platform grades it. Some exercises are checked structurally, does your answer contain the structure being taught. The better ones are executed: your function runs against real inputs in a sandboxed Web Worker, and the result is compared with expected values, one named case per failure mode. An exercise like that carries a small spec:

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

Plus a reference solution, the answer I'd write myself, stored alongside.

Because the whole thing claims to hold a quality bar, it ships behind gates. Unit tests over the shared engine. A content-integrity check that parses every lesson and runs each exercise's structural checks against its own reference solution. And a couple of thousand assertions, green on every push. I felt pretty good about that. Note the word felt...

You can probably hear it coming.

## Dogfooding, or: nobody sat the exam

The discovery wasn't a flash of insight. It was a weekend, and not a fun one. I was running exercises on my own machine, the way a learner would, and watching correct answers come back marked wrong. So I chased red herrings, because that's what you do: blamed the sandbox setup, blamed the worker, rewrote one of my own solutions three times convinced I'd fumbled it. Every trail went cold. Somewhere on Sunday the real shape finally surfaced: nothing was wrong with any single piece. What was wrong was my coverage. There was no check anywhere that ever did what I had just spent two days doing by hand.

Here's what my two green gates actually amounted to. I was proofreading the exam paper. Separately, I was proofreading the answer key. At no point did anyone sit down, work the questions, and confirm the answers were right.

That gap has real world implications and scenarios. It's the runbook nobody has executed or read. The restore path for backups nobody has restored. The onboarding doc written and even reviewed, but not internalized or exercised (for your own sanity, have someone run the runbook, assume nothing). I remember a runbook that assumed you're connected to an internal VPN, but when I had a junior engineer run it, he had the wrong client, so everything worked, until he tried to connect to the production database. Review can't find this class of problem, because each half looks correct on its own. The exam reads well. The key reads well. They just disagree, and the only way to notice is to do the work like a stranger would.

If you don't dogfood your own product, everything you built is a technical pass-through. It compiles, it deploys, it demos. Whether it works is anybody's guess.

So I wrote the missing gate. It's 68 lines and it isn't clever, which is exactly the point: load each exercise's reference solution into a sandbox, call it with the exercise's own cases, compare the results exactly as the in-browser grader would. I was sitting my own exam.

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

It works the 169 executed exercises through their 912 cases in about a second, and it exits non-zero on any disagreement, which makes it a gate rather than a report.

First run: four exercises that had already shipped.

One was impossible to pass, ever. Its test data was shaped as an object where the runner expects an array, `args: {loopLagMs: 350}` instead of `args: [{loopLagMs: 350}]`, so every learner's function received `undefined`, no matter what they wrote. It sat in the capstone, so the people hitting it were exactly the ones who'd put in the most work. It was eye opening, and a cardinal sin. I accidentally penalized the ones who put the most effort in.

One had an off-by-one arguing with its own test name:

```js
const inWindow = allowed.filter(a => a > cutoff);    // what shipped
const inWindow = allowed.filter(a => a >= cutoff);   // what the test case expected
```

The case was called `'exactly at the window edge is still inside it'` and the reference solution excluded the edge. The name and the code disagreed, and neither of my gates could hear the argument.

One had test data written against a different mental model than its own prompt. Both halves looked reasonable alone. That's precisely why reading never caught it.

And my favourite wasn't a content bug at all. Six cases failed on an exercise whose solution was right and whose expected values were right. They just weren't *equal*, because of this:

```js
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
```

`{status: 200, headers: {...}}` and `{headers: {...}, status: 200}` are the same object. They are not the same string. Anyone whose correct answer built an object with keys in another order was told they were wrong. In an exercise about HTTP responses, where key order means nothing. A check I wrote to validate content found a bug in the code doing the grading. Proper dogfooding does that: it doesn't just test the food, it tests the kitchen.

## Edge cases, and the licence to stop

Fixing the grader meant writing a canonicaliser: sort object keys recursively, leave arrays alone because for a list, the order is the data.

```js
const canon = v =>
  v === null || typeof v !== 'object' ? v
  : Array.isArray(v) ? v.map(canon)
  : Object.keys(v).sort().reduce((o, k) => (o[k] = canon(v[k]), o), {});

const eq = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));
```

And immediately the edge cases start whispering. `undefined` values get dropped by stringify. `NaN` becomes `null`. What about Maps? Dates? Circular references?

I chased none of those. The gate and the in-browser grader share the same comparison, so they can't disagree with each other, and no exercise returns a Map. That's the whole analysis. It took five minutes.

This is the part of testing culture nobody puts on the poster. Yes, you handle edge cases. You should be a little paranoid; my favourite bug above only surfaced because an exercise finally returned a plain object. But somewhere past the reasonable cases is the meteor hitting the data center, and you have to be willing to look at a risk and say: this one isn't worth the reward. My repository has a list of checks I decided not to build: no coverage threshold, no end-to-end browser suite, no fuzzing of the grader. In my professional life I had to accept the fact that I don't control the internet, and when something happens, information may go where it was not intended. Enough said.

The trick is that declining a risk is only acceptable after you've done the cheap paranoia. The order matters. Sit the exam first; it cost me a weekend and found five real defects. Then look at the remaining tail, price it honestly, and stop. A team that stops before dogfooding is negligent. A team that can't stop after it is chasing meteors while the capstone throws `undefined` at its best students. This is the essence of senior experience, and the art of risk acceptance. Thinking about this as I write this, it's worth a blog post by itself.

A good question to ask: what kind of bug would survive everything we currently run? If the answer is easy to build, build it, it's probably your next gate. If the answer costs more than the blast radius it prevents, write the rationale down where the next person will find it, and go do something that matters. It's not easy, but it's worth the effort.

The gate runs on every push now, third in line. The four defects are documented in its header comment, so I won't delete it for being slow without learning why it exists. And "the build is green" finally means what I always claimed it meant: not that we proofread everything, but that somebody sat the exam.

One more thing, because it's the part I'd actually want a younger engineer to hear. That weekend of red herrings never really ends; there will always be another one. And I've stopped resenting them (I actually learnt to love them). These one-off fights, where you're alone with the logic and it keeps winning until suddenly it doesn't, are where you genuinely learn. You'll forget the tutorials. You will never forget the bug you chased for two days that turned out to be your own missing test.
