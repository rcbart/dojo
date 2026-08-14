# Lesson template

Copy the skeleton below when adding a lesson to any of the three courses. It encodes what the gates check
and what the existing material already does, so a lesson written to this shape needs no rework.

The **feedback block is not in the template** — the engine renders a rating control and a comment box at
the end of every lesson automatically, for every course. You do not add it, and you cannot forget it.

---

## The skeleton

```js
{id:'abc1',title:'A statement, not a topic',body:`
<p>Open with the problem, not the definition. One concrete scene — a page that is slow, a login that
fails, a bill that is wrong — then the idea that resolves it.</p>

<h4>The first thing worth knowing</h4>
<p>...</p>
<div class="codeSample" data-hl>// runnable, verified, and short enough to read
</div>

<h4>The part that goes wrong in practice</h4>
<p>Name the failure and what it looks like when it happens, not just the rule.</p>

<h4>The honest limit</h4>
<p>Where this stops working, and what you would reach for instead.</p>`,
docs:[['Primary source','https://…'],['Spec or manual','https://…'],['A good explanation','https://…']],
exs:[{title:'Do the simple version',lang:'js',diff:'easy',
run:{call:'fnName',cases:[
  {name:'the ordinary case',args:[…],expect:…},
  {name:'the boundary',args:[…],expect:…},
  {name:'the case that catches the plausible wrong answer',args:[…],expect:…}]},
prompt:`What to write, stated precisely enough that the cases are predictable.`,
starter:`function fnName(x) {\n  return null;\n}`,
solution:`function fnName(x) {\n  return x;   // comment the decision, not the syntax\n}`,
tests:[{d:'names the property, not the token',re:'…'}],
behavior:`What each case proves, and which assumption a wrong answer broke.`,
hints:['A nudge toward the shape.','A nudge toward the trap.','The name of the thing to look up.']}]}
```

---

## The checklist

**Body**

- [ ] **At or above the course average.** DevDojo ~430 words, IdentityDojo ~665, JSDojo ~465. The floor is
      half the course average and it *rises* as the course improves, so aim for the average, not the floor.
- [ ] **Sentences average under ~19 words.** Nothing over 50. Check with the readability script before
      committing.
- [ ] `<h4>` sections. Three to five. Each one a claim, not a label — "Why there is a code at all" beats
      "The authorization code".
- [ ] Opens on a problem. Definitions land better once the reader wants one.
- [ ] Contains at least one **honest limit** — where this fails, what it costs, when not to use it.
- [ ] No backticks or `${` inside the template literal. Escape `<` and `>` in prose as `&lt;` `&gt;`.

**Docs**

- [ ] Three links, primary sources first: the RFC, the spec, the vendor manual. Not a blog aggregating them.

**Exercises**

- [ ] **At least one, ideally two or three, ramping easy → hard.** Set `diff` explicitly when the
      auto-rating would be wrong.
- [ ] **Executed where the platform allows it.** `lang:'js'` plus a `run` spec means the learner's function
      is called with real inputs. Prefer this over a regex check whenever the idea is language-agnostic.
- [ ] **Named cases, not `case 1`.** The name is what the learner reads when it fails.
- [ ] **At least one case that catches the plausible-but-wrong implementation** — the off-by-one, the
      missing guard, the `startsWith` where an exact match was meant. This is the single highest-value part
      of an exercise.
- [ ] `behavior` explains what each case proves. `hints` has three, escalating, never the answer.
- [ ] The blank `starter` must **fail** its own checks. If it passes, the exercise teaches nothing.

**Quizzes** (`src/quizzes_hand.js`, keyed by lesson id)

- [ ] Three to five questions, ordered **easy → hard**: recall, then application, then the case that
      requires having understood the trade-off.
- [ ] Every question has `why` (why the answer is right) and a `whyWrong` entry per option, with `''` at
      the answer's index.
- [ ] Options are shuffled at render time, so do not write "all of the above".

**Wiring**

- [ ] New stream? Add the file to `content/streams/manifest.json` and its title to `DOJO_DOMAINS`.
- [ ] New term introduced? Add it to `GLOSS_ALL` in `engine/glossary.js`.
- [ ] Update the counts in `README.md`, `ARCHITECTURE.md` and `docs/landing.html`.

**Before committing**

```bash
node --test engine/test/engine.test.js   # the runtime (all four engine files)
node scripts/verify.js                   # content integrity  (per course)
node scripts/verify-exec.js              # executes every run spec
node scripts/verify-java.js              # compiles every Java solution
```

---

## What the engine adds for you

Rendered automatically at the end of every lesson, in every course:

- a **rating control** — thumbs up, neutral, down;
- a **comment box** whose question adapts to the rating (what worked / what stopped making sense / what
  would have been clearer), saved on explicit submit;
- a **prompt on "Next lesson"** if the lesson is unrated, inline and skippable.

Ratings and comments are stored locally, aggregated by `rateAggregate`, and synced to the account when one
exists. Nothing about this belongs in lesson content.
