# MLDojo: Project Plan

The next project: an interactive path that teaches **Machine Learning & AI from the
fundamentals to real usage**, in the same do-it-yourself spirit as JavaDojo, but for
Python and ML. Teased on the JavaDojo landing page ("Machine Learning & AI, coming soon").

This document is the agreed plan **before any code is written**. It records the locked
decisions, the architecture, the (honest) execution model, the full curriculum, and the
build order. Phase 1 is a complete, shippable product on its own.

---

## Introduction: what this course aims to provide, and how (shown to every learner)

The course opens with an explicit statement of intent, on the landing page and the in-app
welcome screen. Its substance:

**The aim.** Take a student from absolute zero, no programming, rusty high-school math, to
genuinely understanding and working in machine learning and AI. Not familiarity: understanding.

**The math bar (explicit): everything an ML graduate needs, built from the ground up.** The
mathematical streams are designed to contain *all* the mathematics required to operate as an ML
practitioner and, the part traditional college courses so often fail at, to genuinely
*understand* the math behind ML, not just execute it. That means each math stream is complete
from its own foundations: no fundamental is assumed. Worked examples of the "we included the
ground floor" commitment: linear algebra teaches vector/matrix **addition, scaling, element-wise
vs dot product, and transpose** before matrix multiplication, and **invertibility** in full;
calculus teaches **rate of change and limits** before derivatives, and the **differentiation
rules** (power/product/chain, and the eˣ/ln/sigmoid derivatives) before they are applied;
logarithms are preceded by an **exponents & powers** lesson; probability includes the
**fundamental counting principle, factorials, permutations & combinations** beneath the
binomial, and real **descriptive statistics** (median, mode, percentiles/quartiles, IQR,
robustness) beside expectation and variance. The rule: if a math stream uses an idea, that idea
(and the idea beneath it) has been taught first, grounding-first, all the way down.

**The honest framing, stated up front.** This will take time to master, and that is the
point. MLDojo is deliberately *not* one of the "quick path to ML expert" offerings; it is the
opposite, **depth and rigor that rivals college studies**. And the confidence claim, made
plainly: although this course does not grant a degree, **if you complete it, you will be able
to understand and work in machine learning and AI at the level of someone who studied it in
college**, because you will have covered the same foundations (Python, linear algebra,
calculus, probability & statistics), done the same math, and written the working code
yourself, with graduate-level depth available on demand through Dive Deeper.

**How it delivers that.** Grounding before math (every concept opens with what it is for);
real Python running in the browser, graded on real output; every term demystified in plain
English *and* then defined precisely; assessment on every lesson; hints, full solutions, an
ask-anything tutor; and a track structure (Foundations → ML & AI → Deep Learning → LLMs)
where nothing is ever assumed that has not been taught.

**Stated plainly up front: this course is math-heavy, and it has to be.** Machine learning
*is* mathematics, linear algebra, calculus, logarithms, probability and statistics are not
hurdles on the way to ML, they are the substance of it. The introduction says so honestly (no
"ML without the math" false promise), and frames the math as the point rather than the price:
we teach it all from zero, grounding-first, so the equations become readable rather than
intimidating. A learner unwilling to do mathematics is in the wrong course; a learner willing
to do it, regardless of current level, is exactly who this is for.

---

## Who this is for, and where it leads (honest positioning: never oversell)

A companion to the introduction, for the landing page and docs: what completing MLDojo
actually opens, stated plainly for each path. The rule behind this section: **the course
never claims to open a door it doesn't.**

**The self-directed path (the core promise).** Complete the course and you can understand,
build, evaluate, and deploy real ML systems, with college-level understanding of the
foundations and graduate-level depth wherever you chose to dive. This path the course
delivers in full, by itself.

**The industry path.** What employers actually test, can you reason about models, do the
math, write the code, explain your choices, is what the course trains. The deployed projects
are portfolio evidence. Honest caveat: some employers filter résumés by degree before anyone
technical looks; MLDojo can't fix that filter, but it maximizes what happens once a human is
in the loop (interviews, take-homes, work).

**The college path, preparation, not credentialing.** MLDojo positions a learner to
*succeed in* a reputable program better than most entrants, while doing little to *get them
admitted* by itself:
- *Undergraduate:* admissions won't credit it (no transcript), but a graduate of this course
  arrives with the first ~2 years of ML-relevant coursework already mastered and, more
  valuable, knowing what everything is *for*. The projects double as application-portfolio
  material.
- *Master's:* reputable MS programs screen transcripts for graded math/CS prerequisites and a
  bachelor's. The course makes you genuinely prepared but doesn't check those boxes; the
  realistic route is course-completion + portfolio + one or two accredited prerequisite
  courses where transcripts demand them (and competence-weighted programs like OMSCS). Once
  admitted, the first MS semester overlaps heavily with Phases 1–2.
- *PhD:* helps with knowledge, not with what PhD admissions select on, research experience
  and recommendation letters. Honest gap, named: MLDojo teaches *applied* rigor (correct
  definitions, real derivations, Bishop-level depth on demand), not *proof-writing* fluency
  (real analysis, measure-theoretic probability). A PhD-bound learner should add proof-based
  math and, above all, research experience.

Summary sentence for the site: *MLDojo prepares you to thrive in ML, in work or in school —
but it is preparation, not a credential, and we will always tell you which one you need.*

---

## Core principle: grounding before math (non-negotiable)

Every concept starts with the **real world**, never the notation. The thing that makes
ML courses fail is teaching eigenvectors or expectation-maximization as machinery, leaving
the learner asking "what the hell is this *for*, and where is it actually used?" MLDojo
answers that question **first, every single time.**

**Mandatory lesson shape**, every concept opens with, in this order, before any symbol:

1. **Hook**: a concrete real-world scenario where this matters ("Netflix has 100M users
   and 10k movies and wants to find the hidden 'taste dimensions'…").
2. **What it does**: one plain-language sentence, no jargon.
3. **Where it's used**: named, real applications (not "various fields").
4. **Intuition**: the mental picture / analogy.
5. *Then* the math, now motivated, so the notation is a relief, not a wall.
6. *Then* the code, run it, see the real result.

Two worked examples of the standard (the exact concepts that failed you in grad school):

> **Eigenvectors**: *Hook:* a photo is 4,000×3,000 numbers, but faces really only vary
> along a few hundred meaningful "directions"; how do we find them? *What it does:* an
> eigenvector is a direction a transformation only **stretches**, never rotates, the
> "natural axes" of the data. *Where it's used:* PCA (compress data / find its main
> patterns), Google's **PageRank** (the web's ranking IS an eigenvector), "eigenfaces"
> for face recognition, vibration/resonance in engineering, stability analysis. *Intuition:*
> spin a globe, the axis through the poles is the one direction that doesn't move; that's
> the eigenvector, and how fast points elsewhere move is the eigenvalue. *Then* the math
> (Av = λv), *then* code that runs PCA on real images and shows the "eigenfaces."

> **Expectation-Maximization**: *Hook:* you have customers who clearly fall into hidden
> segments, but nobody labeled them, how do you discover the groups AND who belongs to
> each, at the same time? *What it does:* a chicken-and-egg solver, "if I knew the groups
> I could label the points; if I knew the labels I could describe the groups", that breaks
> the deadlock by alternating guesses. *Where it's used:* Gaussian Mixture Models (soft
> clustering), speech recognition (training HMMs), filling in missing data, image
> segmentation. *Intuition:* the E-step softly assigns each point to groups; the M-step
> redraws each group to fit its points; repeat until it settles. *Then* the math,
> *then* code that separates a real mixed dataset.

This shape is enforced in the exercise/lesson schema (a required `hook` + `usedFor` field
per concept) and checked by `verify.js`, so a lesson **cannot ship** without its grounding.

**Companion rule, demystify the jargon: a fancy name is just math (and every term gets
explained).** ML is full of intimidating or misleading names that hide simple ideas.
The rule applies to **every term**, not just the scary-sounding ones, the plainest words
(regression, classification, feature, model, training) are explained just as carefully as
the fancy ones, because the *ordinary* words are often the ones people never actually had
defined. Three parts to the treatment:

1. **What it computes, plainly**: the impressive name is a label for a *mathematical
   function and some operations*, nothing more. A **Support Vector Machine** *sounds* like
   a spaceship; it's just "draw the line (or plane) that best separates two groups, as far
   from both as possible." Same for "kernel trick," "SGD," "softmax," "regularization."
2. **Where the name comes from, when it's misleading.** Some terms are historical accidents
   that actively confuse. **"Regression"** is the poster child: it has almost nothing to do
   with "going backward." Francis Galton noticed tall parents have kids whose heights
   *regress toward the average*; he called his fitted line a "regression line," and the name
   stuck for *any* method that predicts a **number** (price, temperature, age). We tell that
   story so the word stops being a mystery. Same for "naive" Bayes (= the conditional-
   independence assumption), "kernel," "stochastic," etc.
3. **Define the primitive before using it.** Before any talk of vectors, we say plainly that
   **a vector is just an ordered list of numbers** (`[height, weight, age]`) that you can
   also picture as an arrow or a point in space. No term is ever used before it's been said
   in plain English with an example.

Worked mini-examples of the standard (these ship as their grounded lessons):

> **Regression**, *predicting a number.* Given features, output a continuous value: this
> house → $420k, this patient → 12 days. (The confusing name is Galton's, above.) Contrast
> with **classification** = predicting a *category* (spam / not-spam, cat / dog).
>
> **Overfitting**, the model **memorized** the training data instead of learning the
> pattern. Like a student who memorized last year's exact exam answers and then bombs when
> the questions change: perfect on what it saw, useless on anything new. It fit the *noise*.
>
> **Underfitting**, the model is **too simple** to capture the real pattern. Like drawing
> one straight line through data that clearly curves: it's wrong on the training data *and*
> on new data. Too dumb, where overfitting is too clever.

**Governing rule, complete coverage with rigor (non-negotiable).** The grounding-first and
demystify treatments are not applied selectively to the "interesting" terms, they are
applied to **every** term the course introduces, across **all** subject areas: linear
algebra, calculus, probability & statistics, classic ML, neural networks & deep learning,
and LLMs/AI. If a term is used, it has first been (a) named, (b) explained in plain English
with a concrete example and its real-world use, and (c) where the name misleads, given its
origin story. "Rigor" means the plain-English version is *correct*, not a comforting
falsehood: we simplify the *explanation*, never the *truth*. Every simplification is
followed, at least briefly, by the precise statement, so a learner leaves with intuition
*and* a definition that would survive a grad-school exam. Enforcement: `verify.js` checks
that each newly-used term appears in the running glossary with a plain-English entry and an
example before its first use; a term used before it's defined is a build failure, the same
way an ungrounded concept is.

Reference entries for terms the curriculum specifically commits to (each ships as a grounded,
rigorous glossary entry + lesson callout):

> **Independent vs dependent variable**, plainly: the *independent* variable is the input
> you turn the knob on (the cause you vary); the *dependent* variable is the output that
> responds (`y` depends on `x`). Rigor + the subtlety the learner flagged: **an independent
> variable is often not a raw measurement but a *function* of the data**, a *feature* is
> literally a function applied to the inputs (log of income, age², "words per sentence,"
> `x₁·x₂`). This is the whole idea behind **feature maps / basis functions**: linear
> regression on *functions* of `x` fits curves while staying "linear in the parameters."
> Naming that out loud dissolves a common confusion, "how is this "linear" model drawing a
> curve?"
>
> **Dot product / inner product / outer product**, three names people blur together, set
> straight rigorously. *Dot product* = line two vectors up, multiply element-wise, add → a
> single number measuring alignment/similarity. The **inner product** is the general,
> rigorous name for that operation (the dot product is the inner product on ordinary real
> vectors); saying "inner product" signals the same idea in fancier company (function spaces,
> kernels). The **outer product** is the opposite direction: two vectors → a whole *matrix*
> (every element of one times every element of the other), and it is the one that quietly
> runs ML, it builds covariance matrices (PCA), rank-one weight updates, and the gradient
> matrices in backprop. (The *cross* product, by contrast, is the 3D-geometry outlier that
> is *not* a workhorse of ML, see the linear-algebra stream.)
>
> **Logistic regression**, the classic "the name lies" case, taught rigorously: despite
> "regression," it does **classification**. Grounded: it takes the same linear score as
> linear regression (`w·x + b`) and squashes it through the **logistic (sigmoid)** function
> into a probability between 0 and 1, so "spam-ness = 0.93." Rigor: *why* the sigmoid (it
> maps any real number to (0,1) and its log-odds are linear), *why* its loss is cross-entropy
> rather than squared error (squared error there is non-convex and punishes confidence
> wrongly), and the plain reading of that loss ("be confident only when you're right").
>
> **Forward & backward propagation**, flagship hard idea, given its due including the
> history. *Forward propagation:* push an input through the network layer by layer to produce
> a prediction, just repeated "matrix multiply, then squash." *Backpropagation:* after
> measuring the error, send it **backwards** through the same network to find how much each
> weight is to blame, so each can be nudged the right way, and it is *nothing but the chain
> rule* (stream 4) applied layer by layer, reusing shared work so it's cheap. The rigor and
> the history together: for decades nobody had an efficient way to assign blame to hidden-layer
> weights, which (with Minsky & Papert's 1969 critique of single-layer perceptrons) helped
> stall neural networks through the "AI winters"; the efficient backprop algorithm, popularized
> by Rumelhart, Hinton & Williams in 1986, is precisely what unlocked training deep networks
> and set off everything since. We tell that story so learners understand backprop wasn't a
> footnote, it was *the* unlock. (🧠 hard-idea treatment, Phase 2.)

| Decision | Choice | Why |
|---|---|---|
| Language | **Python** | The industry-standard ML language; job-relevant, huge ecosystem. |
| Depth | **All three tiers** | Classic ML → Deep Learning → LLMs/GenAI. Matches "fundamentals to real usage." |
| Prerequisites | **Full from-zero foundations** | Teach Python AND the math (linear algebra, calculus, probability/stats) from scratch. |
| Math delivery | **Dedicated foundation streams** | A "white-belt" math dojo before ML proper; clean prerequisites. |
| Execution | **Real Python in the browser (Pyodide)** | Learners' numpy/pandas/scikit-learn/matplotlib code actually runs; graded on real output. |
| Sequencing | **Phase it, ship Phase 1 first** | Phase 1 (Python + math + classic ML) is a complete product; DL and LLMs follow. |
| First deliverable | **This plan doc** | Reviewed before implementation. |

---

## 2. Positioning: how MLDojo relates to JavaDojo

Same DNA, separate product. MLDojo **forks JavaDojo's proven engine** (the streams →
lessons → exercises → belts model, the `build.js`/`verify.js` toolchain, the single-file
build output) rather than sharing a live codebase, so the two evolve independently while
feeling like one family.

- **Repo**: a new sibling repo/folder `ml-dojo/` with the same internal structure
  (`src/`, `content/streams/`, `build.js`, `scripts/verify.js`, `dist/index.html`).
- **Brand**: keep the dojo metaphor, white belt → black belt, plus a **Dan Track** for
  research-grade material (transformers internals, RLHF, etc.). Distinct accent color
  (JavaDojo indigo → MLDojo teal/emerald) so they're siblings, not clones.
- **Shared site layer**: the existing `site/` server (accounts, SQLite users + progress,
  admin, login modal) is product-agnostic. It gains a `product` column on progress so one
  account tracks both dojos; the landing page becomes a small hub linking to each.
- **The teaser already exists**: the "coming soon" promo on the JavaDojo landing flips to
  a live link when Phase 1 ships.

---

## 3. Architecture

```
ml-dojo/
  src/            shell.html · styles.css · app.js (runtime) · boot.js  (forked from JavaDojo)
  content/streams/  one module per stream (the curriculum)
  runner/         Pyodide integration: load, run user code, capture stdout/plots, check
  vendor/         self-hosted Pyodide + KaTeX (CSP-friendly, no third-party CDN at runtime)
  build.js        assembles dist/index.html
  scripts/verify.js   content test-suite (parity with JavaDojo's)
```

Two capabilities the JavaDojo engine doesn't have, added here:

1. **A Python execution runner (Pyodide).** WebAssembly Python in the browser. On first
   "Run," the page loads the Pyodide runtime + the packages a stream needs (numpy, pandas,
   scikit-learn, matplotlib) from a **self-hosted** copy (see §4). User code runs in a
   worker; we capture stdout, return values, exceptions, and matplotlib figures (rendered
   to PNG), then grade against the exercise's checks.

2. **Math rendering (KaTeX).** ML lessons need real equations (∑, ∂L/∂w, matrices). KaTeX
   is fast, self-hostable, and CSP-friendly. Lessons write LaTeX; KaTeX renders it.

Everything else, belts, streams, the lesson/exercise data shape, progress in
localStorage synced to the account, the build/verify toolchain, is inherited.

---

## 4. Execution model (the honest version)

Pyodide is a genuine leap for Phase 1 and a real constraint later. Being explicit now
prevents a nasty surprise in Phase 2.

**Runs great in-browser (Phase 1, classic ML):**
numpy, pandas, scikit-learn, matplotlib, scipy, statsmodels. This covers essentially all
of classic ML: regression, classification, trees/ensembles, clustering, dimensionality
reduction, model evaluation, plotting. Learners train real models on real (small) datasets
and are graded on **actual metrics** (accuracy, MSE, a confusion matrix), not regex.

**Does NOT run acceptably in-browser (Phases 2–3, deep learning / LLMs):**
Full PyTorch and TensorFlow don't run in Pyodide; large-model training and LLM inference
are infeasible client-side regardless. So the later phases use a different model:

- **Phase 2 (deep learning):** teach neural nets **from scratch in numpy** (forward pass,
  backprop, gradient descent, all Pyodide-runnable and deeply educational), then introduce
  a framework's *API* through read-and-reason exercises and small runnable pieces. Full
  training exercises run against a **backend runner** (the sandboxed executor from
  `LAUNCH_GUIDE.md` Phase 5, reused) or a hosted notebook, added when Phase 2 lands.
- **Phase 3 (LLMs/GenAI):** conceptual + API-consumption exercises (prompting, embeddings,
  RAG wiring, evaluating outputs) that call a provider through the backend proxy, the same
  AI-judge/proxy infrastructure the JavaDojo launch plan already designs.

### Backend integration path: how neural nets & LLMs actually get practiced (Phases 2–3)

In-browser Pyodide is the right engine for Phase 1 and for *understanding* deep learning
(nets built from scratch in numpy run fine in the browser). But **real** training and LLM use
need compute the browser doesn't have, so Phases 2–3 add a backend. The path, staged so each
piece is independently shippable:

1. **Tier 0, stays in the browser (understanding).** Forward pass, backprop, and SGD written
   by hand in numpy; tiny nets learning tiny datasets; every formula runnable and gradable
   client-side. This is where the *concepts* are taught, and it needs no backend at all.
2. **Tier 1, a sandboxed execution backend (real training).** For exercises that need real
   frameworks (PyTorch) or more compute, the browser sends the learner's code to a
   **sandboxed runner service** and gets back stdout, metrics, and artifacts (a trained
   model's accuracy, a loss curve). This reuses the sandboxed executor already designed in
   `LAUNCH_GUIDE.md` Phase 5, hardened container, no network, CPU/memory/time limits, one
   ephemeral container per submission. Architecture: `browser → /run API (authenticated via
   the shared site/ layer) → job queue → sandboxed worker → results`. Grading is identical in
   spirit to Phase 1 (assert on real output/metrics); only the *where it runs* changes.
3. **Tier 2: GPU-backed jobs (bigger models, optional).** The same `/run` contract points at
   a GPU worker pool for the few exercises that genuinely need it (training a small CNN,
   fine-tuning). Kept optional and cost-capped; most learning never requires it.
4. **Tier 3, an LLM provider proxy (Phase 3).** LLM exercises (prompting, embeddings, RAG,
   evaluation) call a model through a **backend proxy** that holds the API key, enforces
   per-user rate/spend limits, and logs for grading, never exposing keys to the browser. This
   is the same AI-judge/proxy infrastructure JavaDojo's launch plan already designs, extended
   to student-authored calls.

Guardrails carried from JavaDojo: all backend calls are authenticated through the shared
`site/` accounts layer; the runner is network-isolated and resource-capped; spend is bounded
per user; nothing the learner submits can touch real user data. The honest headline stays:
**Phase 1 needs no backend and ships first**; the backend is built exactly when Phase 2 does,
tier by tier, so we never block the first product on infrastructure we don't yet need.

**Neural nets & LLMs are taught in depth, not gestured at.** Because understanding lives in
Tier 0 (numpy from scratch) and the backend only supplies *scale*, depth doesn't depend on the
infrastructure landing: forward/backprop derived and hand-implemented, activations and why
nonlinearity, initialization, optimizers, batchnorm/dropout, convolutions run over real
images, attention computed by hand, each with the four-part rigor and a Dive Deeper (below).

**Datasets:** tiny, license-clean datasets bundled with the build (Iris, a small housing
set, toy CSVs) so exercises are deterministic and offline. Larger ones lazy-loaded.

**Exercise types** (each with instant, objective feedback):
1. **Concept**: fill-in / multiple-choice (like the JavaDojo dan streams).
2. **Math**: compute/derive; checked numerically (e.g., "gradient of this loss at w=2").
3. **Code (run & assert)**: write Python; we run it and assert on real output/metrics.
4. **Plot**: produce a figure; checked for the right shape/relationship, not pixels.

**Assessment requirement (enforced, every lesson can test the learner).** No lesson or
sub-lesson ships as read-only. Each one **must** carry at least one **exercise and/or quiz**
so the student can check their own understanding before moving on:
- **Quiz**: for conceptual lessons (definitions, intuitions, "which loss for this problem?"):
  a short multiple-choice / fill-in check, auto-graded, that confirms the *idea* landed.
  Every glossary term from §5b should be reachable by at least one quiz question somewhere in
  the course.
- **Exercise**: for anything hands-on: a math, code, or plot task graded on real output.
- A lesson may have **both** (quiz to check the concept, then an exercise to apply it), and
  multi-part lessons attach a check to **each sub-lesson**, not just the parent.

**Solutions & hints (always available, never punishing).** The forked engine already provides
exactly this loop, and MLDojo keeps it as a hard rule for every exercise/quiz:
- **Show me the solution**: a full, worked, correct answer the learner can reveal at any
  time, no penalty and no gating. For code, it's runnable; for math/concept, it's the derived
  answer *with the reasoning*, not just the final value.
- **Progressive hints ("Next Step")**: a sequence of increasingly specific nudges for the
  stuck learner: the first points at the idea, the last is one step short of the answer, so
  help is graduated rather than all-or-nothing. Authored hints come first; the AI-tutor
  fallback (Claude) generates a personalized next step from the learner's current work when
  the scripted hints run out, the same mechanism JavaDojo uses.

**Enforcement:** `verify.js` fails the build for any lesson/sub-lesson that lacks an
exercise-or-quiz, lacks a solution, or lacks at least one hint, assessment, solution, and
hints are structurally required, exactly like grounding and glossary coverage.

---

## 5. Full curriculum (all three tiers, phased)

Belts span the whole path; **Phase 1 alone earns white → (say) green belt** and is a
complete product. Streams marked ⭐ are the Phase-1 build.

### Phase 1: Foundations, Data, Dimensionality & Classic ML *(the first shippable product)*

Deliberately broadened: Phase 1 covers not just the *math* basics but the **craft of
working with real data** and the **geometry of many dimensions**, the two things that
actually make ML hard in practice and that most courses skip. It's larger than a minimal
first release on purpose; if needed it can ship in two waves (A–C foundations, then D–E),
but it's designed as one coherent product.

> **Orientation gates nothing but precedes everything (fixing "referenced before defined").**
> The foundation math streams motivate themselves by pointing at ML ("this is how a model
> reduces its *error*"), so a short **Orientation** lesson opens the course and grounds the
> handful of ML terms the foundations borrow, *model, prediction, features, label, training,*
> and above all **error/loss**, in plain English, before any of them is used. Error gets a
> thorough treatment (prediction − actual = residual; loss/cost as the single summary; MSE and
> why we square, briefly), plus a **hard disambiguation the course needs**: *program error*
> (a bug/exception, taught in Python's "Reading errors") vs *model error* (how wrong a working
> model's predictions are). Every later "reduce the error / minimize the loss" now stands on
> explained ground. This is orientation vocabulary, not the ML track, the algorithms are
> taught fully later; nothing here requires Python, so it is assessed by concept quiz.
>
> **Foundations architecture, three stages (revised): basics → math → tooling.** A firm
> ordering decision: programming *basics* come first, the *mathematics* comes second and owns
> all the math concepts (vectors, dot/cross product, matrices, etc.), and the scientific-Python
> *tooling* (NumPy, pandas, matplotlib, scikit-learn) comes **last**, once the concepts are
> understood. So:
> - **Stage 1: Python Basics** (pure programming: variables, control flow, functions, data
>   structures, errors, imports, files, classes). No math libraries.
> - **Stage 2: Mathematical Foundations** (notation & functions, linear algebra, calculus,
>   logarithms, probability & statistics). Concepts taught with worked-by-hand examples; the
>   coding exercises are **pure Python**, the learner *implements each operation themselves*
>   (a dot product as a loop, a 2×2 determinant as `ad−bc`, a matrix–vector product by hand),
>   which is how understanding is forged. **No NumPy in the math streams.**
> - **Stage 3: Scientific Python** (NumPy, pandas, matplotlib, scikit-learn), *after* the
>   math: now that you understand every operation, here is the fast, professional library way —
>   NumPy redoes the linear algebra you hand-wrote, pandas the data work, etc. This is where the
>   dot product becomes `a @ b` and the determinant `np.linalg.det`, framed as "the tool for the
>   concept you already own." Vectors and the dot/cross product are **not** taught here, they
>   are mathematics and live in Stage 2's linear-algebra stream.
>
> **Structure, the Foundations Track gates the ML Track.** Phase 1 is organized into two
> explicit stages, and the student moves through them in order:
>
> **① Foundations Track**, the pillars every ML idea rests on, taught from zero:
> **Python programming**, **linear algebra**, **calculus**, **logarithms & exponentials**, and
> **probability & statistics** (blocks A below). This track is a self-contained stage: a
> learner with no programming and rusty high-school math can complete it and come out genuinely
> fluent in the tools and the math. **Nothing in the ML Track unlocks until the Foundations
> Track is complete**, the same hard-prerequisite rule that gates NumPy behind Python, applied
> at the track level.
>
> **② ML & AI Track**, only *after* Foundations: the craft of working with data, thinking in
> many dimensions, and classic machine learning (blocks B–E below), then Deep Learning and
> LLMs in Phases 2–3. This is where "ML and AI" actually begins, standing on prepared ground.
>
> The tracks are visible in the UI (a labelled divider in the nav, like JavaDojo's Dan Track),
> so the learner always knows which stage they're in and what completing it unlocks.
>
> **The hierarchy is explicit: Track → Stream → Lesson → Exercise/Quiz.** A *track* is a stage
> (Foundations, ML & AI, and later Deep Learning, LLMs). A track contains *streams*, the
> Foundations Track's streams are **Python**, **Linear Algebra**, **Calculus**, and
> **Probability & Statistics** (plus the NumPy tooling stream that bridges Python into the
> math). Each stream contains ordered *lessons*, and every lesson carries an exercise and/or
> quiz. And **every stream is internally ordered fundamentals → advanced**: the basics are
> completed before the hard part builds on them. The Probability & Statistics stream is the
> template, fundamentals (PMF/PDF, distributions, the Gaussian, expectation/variance) first,
> and only then the advanced section on **Bayesian probability**. The same shape applies to
> every stream (e.g. linear algebra: vectors/matrices/dot product → eigenvectors/SVD; calculus:
> derivatives/gradients → the chain rule and convexity).

**A. Foundations Track: Python & Math, from zero**

> **Preamble: Tools of the Trade (the hard prerequisite).** No learner meets NumPy, a
> dataset, or any ML idea before they can actually *program in Python*. Stream 1 is a genuine
> from-zero Python course, not a two-page cheat sheet, and it is a **gated prerequisite**:
> the NumPy/data/ML streams stay locked until it's complete. This is a firm pedagogical rule
> the whole curriculum obeys: **a concept never appears before the tools and primitives it
> assumes.** That includes the small words people quietly assume, what a *variable*, a
> *list*, a *function*, an *index*, and crucially a *dimension* mean, each taught plainly in
> the preamble before anything downstream leans on it. The bridge terms that trip beginners
> (a list has one dimension = its length; a table/grid has two = rows × columns; a dataset is
> "n examples × m features") are grounded here so that by the time "vector" and
> "n-dimensional" arrive, they land on prepared ground.

1. ⭐ **Python from Zero (Tools of the Trade)**, a full, structured learning path, not a
   cheat sheet: it starts at first principles ("what is a program?") and ends with the student
   *working with data* in pure Python. Every lesson is **write-and-practice**, the learner
   writes and runs real Python in the browser on every step, with a quiz and a graded coding
   exercise. Deliberately **no NumPy/pandas** here: programming is learned as programming
   first, and the data lesson does *by hand* exactly what libraries will later automate, so the
   libraries feel like shortcuts rather than magic. **Completion gates the rest of Phase 1.**
   The scope commitment: **all the Python needed to develop and test an ML application** —
   language fundamentals, files and data in/out, imports and packages, errors and debugging —
   with plotting/graphs taught in the toolkit stream (matplotlib, rendered inline). The path:
   1. **Values & collections**: what a program is; variables & types; **lists, indexing, and
      what *length* / *dimension* mean** (a list is 1-D, a grid is 2-D, "n×m" is examples ×
      features).
   2. **Lists in depth**, negative indexes, **slicing** (start included / end excluded, the
      exact notation NumPy reuses, and the train/test-split idiom), mutation, append, the
      shared-reference trap (`b = a` copies nothing; `a[:]` does).
   3. **Indentation, how Python knows where a block begins and ends**, taught explicitly as
      grammar, not style: the colon announces a block, deeper indentation is its body,
      de-denting closes it; 4-space convention; nesting read as an outline; `IndentationError`
      decoded; and the dangerous case, indentation bugs that parse cleanly (a `return` inside
      vs after a loop). The exercise makes correctness depend entirely on block structure.
   4. **Making decisions**: booleans, comparisons, **logical operators** (`and`/`or`/`not`,
      short-circuit, truthiness), `if`/`elif`/`else`.
   4b. **Operators**, augmented assignment (`+=`, `-=`, `*=`), floor division `//` and modulo
      `%` (even/odd, batching), and the **ternary** one-line `if` (`a if cond else b`). Taught
      *before* loops, which rely on `+=`.
   5. **Repeating work**: `for`, `range`, `while`, accumulating a result in a loop.
   5b. **Indentation** (moved to *after* if/loops, since it uses them), blocks, nesting, and
      the `pass` do-nothing placeholder (explained, since it appears in exercise starters).
   6. **Functions**: `def`, parameters, `return`, tuples, reuse; how programs scale.
   7. **Dictionaries & text**: key→value maps, `.get`, string methods, `split`, f-strings.
   8. **Comprehensions**: the Pythonic "transform a collection in one line" (list/dict).
   9. **Working with data (capstone)**: a small dataset as a **list of dictionaries** (rows);
      filter, aggregate (count/mean/min/max), and group it with comprehensions, the manual,
      from-scratch version of what pandas will do later, so the transition is obvious.
   10. **Reading errors**: tracebacks (read bottom-up), the five everyday exception types,
      try/except craft, a real tool-of-the-trade skill, taught explicitly.
   11. **Imports & packages**: the three forms (`import x`, `from x import y`,
      `import x as np`) and the universal ML aliases (np/pd/plt); modules vs packages (the
      dots in `sklearn.linear_model`); **install vs import** as different verbs
      (`pip install scikit-learn` once per environment; `import` per program);
      `ModuleNotFoundError` decoded; virtual environments named honestly for real projects.
   12. **Files, input & output**: reading/writing files with `with` (guaranteed close),
      parsing CSV by hand once (so `pd.read_csv` is automation, not magic), f-string format
      specs (`.1f`, `,`, `.0%`), `input()` for terminal apps (with the honest browser caveat).
   13. **Objects & classes**: everything in Python is an object (the dots you have been using
      are method calls); defining a class, `__init__`, `self`; framed for ML, `model =
      LinearRegression()` builds an object, `model.fit()` calls a method, so the whole
      ecosystem stops being magic. Beginners *read* classes far more than write them.
   14. **You cannot memorize Python, how to learn the rest.** The explicit call-out that no
      course (or professional) covers every function or package: the standard library is huge,
      the ecosystem is hundreds of thousands of packages. The durable skill is not memory but
      the reflex to find and understand anything on demand: `dir()`/`help()`, official docs,
      reading a signature, searching an error, and Ask the Tutor. Reframes "knowing Python" as
      *core fluency + lookup reflexes*; the exercise deliberately requires methods never
      drilled (`.upper()`, `.replace()`, `sorted(reverse=True)`, `" ".join(...)`) so the
      learner practices exactly that.
   Each rung builds on the last; the learner can *write and practice Python* the whole way, and
   arrives at the NumPy stream genuinely able to program, load data, and ship readable output.
   (Also woven in: `while`/`break`/`continue` in the loops lesson, and function *scope*, local
   vs global, in the functions lesson, and tuples/sets with a "which container when" chooser.)
   *Honest framing, corrected and taught explicitly:* **Python is where ML is prototyped,
   designed, and orchestrated, not where the heavy computation runs.** The number-crunching
   itself executes in far more highly optimized code suited to ML's computational demands:
   C/C++ inside NumPy and scikit-learn, CUDA kernels on GPUs inside PyTorch, BLAS/LAPACK
   underneath, and often C++/Rust/optimized runtimes (ONNX, TensorRT) in production serving.
   Python is the control room; the engine room is compiled. This is stated in stream 1 and
   taught in depth (with a measured loop-vs-kernel speed comparison the learner runs) in the
   toolkit stream below, so no learner leaves believing the interpreter does the math.

   *Integrated Python IDE + Playground:* every exercise runs in a real in-browser editor —
   syntax highlighting, line numbers, auto-indent, bracket/quote pairing, Tab/⇧Tab block
   indent, ⌘/Ctrl+Enter to run, and a free-coding **Python Playground** (scratchpad, saved
   between visits, auto-fetches imports like numpy/pandas on first use) lets learners write
   and practice arbitrary real Python at any time, outside the exercises.

2. ⭐ **NumPy & Vectors** *(prerequisite: Python from Zero)*, opens by defining **what a
   vector actually is** (an ordered list of numbers; also an arrow/point in space), then
   arrays, broadcasting, vectorized thinking; ML's workhorse. Assumes, and checks, the
   Python and "dimension" grounding from stream 1.
2c. ⭐ **Math Notation & Functions** *(the on-ramp to reading ML math, before the math
   pillars)*, closes the "referenced before defined" gap for *notation itself*. *Reading
   notation:* Sigma (Σ) is a for-loop that adds, Pi (Π) a for-loop that multiplies, subscripts
   are list indices, `argmax`/`argmin` return the *location* of the max/min, plus a phrasebook
   (∈, ∀, ≈, ∝, ∇, bold = vector); the exercise translates real formulas (mean, dot product,
   **MSE**) from symbols into the code the learner already writes. *Functions:* a **model is a
   function**; domain/range; the recurring shapes (linear, quadratic/the squared-error bowl,
   exponential, logarithmic, and the **sigmoid** S-curve that turns a score into a
   probability, the heart of logistic regression); and **composition** `f(g(x))` as *what a
   neural network is*, which is *why* the chain rule trains it. Ties notation, functions,
   calculus and logs together before linear algebra begins.

   *Per-stream notation decoders:* beyond this general stream, **each math stream carries a
   "📐 Notation decoder" table** in its opening lesson that translates its own symbols the first
   time they appear, linear algebra (Aᵀ, A⁻¹, ‖v‖, a·b, a×b, u⊗v, λ, det), calculus (f′(x),
   **dy/dx**, ∂f/∂x, ∇f, lim, Δ, all shown as names for "the slope"/its multi-knob versions),
   logarithms (logₐ, ln, eˣ), probability (P(A), P(A|B), E[X], Var/σ², μ, X∼N(μ,σ²), ∝, argmax,
   plus the σ-vs-Σ collision called out). No symbol is used before its decoder entry, the same
   "explain before reference" rule, applied to notation itself.
2b. ⭐ **The ML Toolkit: Python's Libraries** *(the advanced Python stream, closing the
   Foundations Track, prerequisite: all foundation streams)*, a dedicated stream on the
   libraries that carry real ML work, each demystified as "a Python face on a compiled
   engine": the honest role-of-Python lesson (control room vs engine room, with the learner
   *measuring* pure-Python vs np.dot on 500k elements); **pandas** (the DataFrame as the
   Python capstone industrialized, filter/aggregate/groupby); **scikit-learn** (the
   fit/predict interface, demystified by having the learner's own normal-equations solution
   match `LinearRegression`'s coefficients to 8 decimals); matplotlib introduced with EDA in
   the ML track; PyTorch previewed honestly for Phase 2 (where the GPU story is central).
3. ⭐ **Linear Algebra for ML**, the language ML is actually written in. Every concept
   opens with *what it does and where it's used in ML* before any notation, and every
   intimidating name is reduced to the operation it names. Lesson breakdown:
   - *Why matrices at all?*: the motivating hook before any arithmetic: a dataset **is** a
     matrix (rows = examples, columns = features), an image **is** a matrix of pixels, a
     whole batch of predictions is one matrix multiply. Linear algebra exists in ML because
     it lets us do the same operation to millions of numbers at once, on hardware built for
     exactly that (this is *why* GPUs matter). We show the same loop written as slow Python
     `for`-loops vs one matrix operation, same answer, 1000× faster, so the learner *feels*
     why we bother.
   - *What a matrix is, plainly*: a grid of numbers; also "a table of data" and, more
     powerfully, "a machine that transforms vectors" (feed a vector in, get a vector out).
     Both pictures introduced with concrete examples before symbols.
   - *Matrix arithmetic from the ground up*: adding matrices (element by element),
     scaling, then the one everyone finds confusing: **matrix multiplication**. Grounded in
     *what it computes*, each output entry is a dot product of a row with a column, i.e.
     "how much this example matches this pattern", with the shape rule (inner dimensions
     must match) explained as *why*, not as a rule to memorize. Worked on a tiny real
     example (features × weights → predictions) so the learner sees a whole model's forward
     pass is literally one multiply.
   - *The dot product*: defined as "line two lists up, multiply, add" → a single number
     that measures **alignment / similarity**. Where it's used: it *is* the neuron
     (inputs · weights), it *is* cosine similarity for search and recommendations, it *is*
     the projection of one vector onto another. One primitive, everywhere.
   - *The identity matrix*, what it is (1s on the diagonal, 0s elsewhere), and, the part
     usually skipped, **what it's for**: it's the "do-nothing" matrix, the number **1** of
     the matrix world (`I · A = A`). Its real uses named plainly: the starting point/neutral
     element, the thing an **inverse** must produce (`A · A⁻¹ = I`, which is how we "undo" a
     transformation and, e.g., solve linear regression in closed form), and the base you add
     a penalty to in **ridge regression** (`XᵀX + λI`), connecting straight to
     regularization from stream 16.
   - *Matrix inverse & solving systems*: grounded as "undoing a transformation" and
     "solving many equations at once," which is exactly what fitting a linear model does;
     why some matrices *can't* be inverted (singular) and why that signals redundant
     features, a real bug learners will hit.
   - *Vectors, norms & distance*: a norm is just "how long is this vector / how far apart
     are these two points," which is how every model measures error and similarity; L1 vs L2
     tied back to MAE vs MSE and to regularization.
   - *Projections*: "the shadow one vector casts on another" → the geometric meaning of
     least-squares regression (project the target onto the space your features can reach)
     and of PCA. Named as a picture first, formula second.
   - *The cross product, honestly scoped.* The learner explicitly asked about it, so we
     address it head-on rather than hand-wave: what it *is* (in 3D, a vector perpendicular to
     two others, whose length is the area of the parallelogram they span, a measure of how
     *un*-aligned they are, the complement to the dot product's alignment), and then the
     honest truth stated plainly: **the cross product is largely a 3D-geometry/physics tool
     and is *not* a workhorse of mainstream ML**, the operations that actually run ML are
     the dot product, matrix multiply, and the outer product (which *does* appear constantly:
     it builds the covariance and gradient matrices you'll meet in PCA and backprop). We
     define the cross product, give its real domains (graphics, robotics, computing surface
     normals, torque), and show the **outer product** as the thing people often *mean* when
     they reach for "multiply two vectors into a matrix" in ML, so the learner leaves knowing
     which tool is which and why, instead of assuming a physics operation is secretly central.
   - *Eigenvectors & eigenvalues (intro, fully grounded)*: the concept from grad-school
     pain, seeded here and paid off in PCA (stream 19): "the directions a matrix stretches
     without rotating, and how much", real uses first (PCA's axes of maximum variance,
     PageRank, vibration modes), spinning-globe intuition, math last. (🧠 hard-idea treatment.)
3b. ⭐ **Logarithms & Exponentials** *(a foundation math stream, before probability needs it)* —
   the one piece of school math ML leans on hardest, taught for real and, crucially, **with the
   reason we use it**. *Fundamentals:* a logarithm is just an exponent asked backwards
   (`log10(1000)=3`); the three bases (log10 orders of magnitude, log2 doublings, `ln`/base-e
   the ML default = Python's `math.log`); the defining property **log turns multiplication into
   addition** (`log(ab)=log a+log b`); logs compress huge ranges (log scales: Richter, dB, pH);
   `exp` as the inverse. *Advanced, why ML uses logs everywhere:* (1) products of many
   probabilities **underflow to 0.0**, and logs turn the product into a stable **sum**, the
   real reason MLE maximizes *log*-likelihood; (2) logs are **monotonic**, so the maximizer is
   unchanged (free to take); (3) derivatives of sums are easy where products are a nightmare
   (training needs derivatives); (4) `log(1/p)` is the natural measure of **surprise**, leading
   straight to **entropy / cross-entropy / log-loss**. The exercise makes a product underflow to
   `0.0` and shows the log-sum survive. This stream is placed **before Probability & Statistics**
   precisely so the MLE / log-likelihood lesson never uses a log it has not grounded.
4. ⭐ **Calculus & Gradients**, not "calculus the school subject," but the one idea that
   makes models *learn*: which way to nudge a knob to reduce error. It does **not** dive
   straight into derivatives, it builds the ground first. Lesson breakdown:
   - *Rate of change (functions, in the calculus sense)*: before derivatives: the slope of a
     line as rise/run (a constant rate), then the **average rate of change** of a curve over an
     interval `(f(b)−f(a))/(b−a)` (the secant slope), and the question that forces calculus into
     existence, the rate at a *single instant* looks like `0/0`. Sets up the need for limits.
   - *Limits*: what a value **approaches** as the input nears a point, even where the function
     is undefined (the `(x²−1)/(x−1)` hole that still "heads for 2"); why the instantaneous rate
     is the limit of the average rate as the gap `h→0`; continuity in plain words. The exercise
     estimates a limit numerically and catches the `0/0` with try/except, so the derivative's
     `lim h→0` is rigorous, not asserted. Only *then* the derivative (nudge test).
   - *The differentiation rules (just the ML ones)*: after the numerical derivative, the
     **symbolic rules** needed to actually compute and apply derivatives: power rule,
     constant/sum rules, **product rule**, **chain rule** (previewed here, deep in its own
     lesson), and the three derivatives ML lives on, `d/dx eˣ = eˣ`, `d/dx ln x = 1/x`, and the
     **sigmoid** `σ'(x)=σ(x)(1−σ(x))`. The exercise has the learner write each derivative *as a
     formula* and the grader checks it against the nudge test; homework is pen-and-paper
     differentiation with full worked solutions (including deriving the sigmoid result). **Hard
     boundary, stated to the learner:** we teach exactly the differentiation ML uses and skip
     the rest of a calculus course (integration, trig calculus, series, related rates), and we
     note that in practice **autograd** applies these rules for you, you learn them to
     understand and debug, not to grind by hand.

   > **Decision, no trigonometry stream (recommended, recorded).** Mainstream ML calculus runs
   > on polynomials, exponentials/logs, and the sigmoid/ReLU; trig (sin/cos, identities) is not
   > core. The one place it appears, transformer **positional encodings** (and Fourier/rotary
   > embeddings), is niche and advanced, so sin/cos get a **just-in-time mini-callout inside
   > that Phase-3 lesson**, not a foundations stream. This keeps the promise of "not the whole
   > calculus/math curriculum" while still covering everything ML actually needs.
   - *Why calculus at all?*: the hook: a model has knobs (weights) and a "how wrong am I"
     score (the loss from stream 15). Learning = turning the knobs to make that score go
     down. Calculus is just **the math of "which way is downhill, and how steep"**, nothing
     more. Framed as: you're standing on a foggy hillside (the loss surface) and can only
     feel the slope under your feet; calculus tells you which way to step. This single
     picture carries the whole stream.
   - *What a derivative actually is*: "how much the output changes when you nudge the input
     a tiny bit", i.e. the **slope**, the sensitivity. Grounded in an example (nudge the
     price-per-square-foot knob; how much does total error move?) before the limit
     definition. The name "derivative" demystified: it's just *rate of change*.
   - *Partial derivatives*: real models have *many* knobs, so "slope" becomes "slope in
     each knob's direction, holding the others still." No new idea, just one derivative per
     knob. Concrete: a model with weight and bias has two partials, how error changes if you
     wiggle each one alone.
   - *The gradient*: collect all the partial slopes into one vector (ties straight back to
     the linear-algebra stream: the gradient **is** a vector) that points in the direction of
     **steepest increase**. So to *reduce* error you step the opposite way, this is the
     whole of **gradient descent**, named plainly and shown as "walk downhill in small
     steps." The learning rate is just "how big a step."
   - *The chain rule*: grounded as its real ML job: **it's how the error signal travels
     backward through a chain of operations** to reach each knob (the engine of
     backpropagation in Phase 2). Intuition first, "if A affects B and B affects C, then A's
     effect on C is the two effects multiplied", with a plain example (gears/pipelines)
     before the notation, so backprop later feels inevitable instead of magical.
   - *Local vs global minima, convexity, briefly and plainly*, why "walking downhill" can
     get stuck in a dip that isn't the deepest one, why some losses (like linear
     regression's) are bowl-shaped so this never happens, and why others aren't, set up
     honestly, no hand-waving.
   - *Seeing it run*: an interactive Pyodide demo: pick a simple loss curve, watch gradient
     descent actually roll down it step by step, and see what too-big and too-small learning
     rates do. The abstract idea made literally visible. (🧠 hard-idea treatment.)
5. ⭐ **Probability & Statistics (from zero, layman-first)**, every concept with a plain
   explanation and a concrete example before any formula. Like every stream, it runs
   **fundamentals → advanced**: the basics are fully in place before the advanced Bayesian
   material builds on them.

   **Fundamentals (the basics, first):**
   - *What probability even is*: the frequentist "long-run frequency" view vs the Bayesian
     "degree of belief" view, in plain words (a coin's 50% vs "70% chance it rains tomorrow").
   - *Random variables & outcomes*: the plain vocabulary for "a number that depends on chance."
   - *Distributions, and the PMF vs PDF distinction*: a **PMF** (probability *mass* function)
     gives the probability of each outcome when outcomes are countable (a die: P(4) = 1/6); a
     **PDF** (probability *density* function) describes continuous quantities (a height), where
     probability is *area under the curve* over a range, and any single exact value has
     probability zero. This trips everyone up, so it gets the 🧠 hard-idea treatment with a
     runnable histogram → density demo.
   - *The distributions you'll actually meet*: uniform, **Bernoulli/binomial**, Poisson, and
     above all the **normal (Gaussian)**, each introduced by its real-world *shape* and where
     it shows up, not its formula first. The Gaussian gets extra room: why the bell curve is
     everywhere (the central limit theorem, in plain words), what its mean and standard
     deviation *do* to the curve, and why so much of ML quietly assumes it.
   - *Expectation & variance*: the "average outcome" and "how spread out," with money/dice
     examples; why variance uses squares (foreshadows MSE). Standard deviation as "spread in
     the original units."
   - *Joint, marginal & conditional probability*: P(A given B) grounded ("raining, GIVEN the
     street is wet"), drawn with simple boxes.
   - *Independence*: when P(A and B) = P(A)·P(B), and the danger of assuming it when false.
   - *Correlation vs causation*: why they differ, with a memorable spurious example.
   - *Monte Carlo*: estimate an answer by random sampling when the math is too hard: throw
     darts to estimate π; simulate thousands of futures to estimate risk. Learners *run* it.

   **Advanced (Bayesian probability, built on the fundamentals above):**
   - *Bayes' theorem, grounded*: the classic that breaks intuition: a 99%-accurate test, a
     positive result for a rare disease, and why your real chance can still be ~2%. The
     base-rate fallacy made obvious with counts (imagine 10,000 people…).
   - *Prior, likelihood, posterior, the vocabulary demystified*, **prior** = what you
     believed *before* the data (a priori); **likelihood** = how well a hypothesis explains
     the data; **posterior** = your updated belief *after* (a posteriori). Example: a coin
     believed fair, updated after 8 heads in 10 flips. "A priori" vs "a posteriori" named, not
     assumed.
   - *Updating beliefs*: Bayes as a machine for changing your mind with evidence; run it, and
     watch a posterior shift as data arrives.
   - *Conditional independence*: A and B independent *once you know* C ("two kids' heights look
     linked, until you account for their shared parents' height"): literally the "naive" in
     **Naive Bayes**, named and explained.
   - *Probability vs likelihood*: the same equation read two ways; the distinction that
     confuses everyone, made concrete (🧠 hard-idea treatment).
   - *MLE & MAP, intuitively*: "pick the explanation that makes the data least surprising"
     (MLE), "…but weighted by what you believed beforehand" (MAP = MLE + prior), the bridge
     from Bayes to how models are actually fit, and where regularization secretly comes from.

   *Running glossary commitment:* every probabilistic term is introduced in plain English
   with a concrete example the first time it appears, joint / marginal / conditional
   probability, independence, conditional independence, expectation, variance, covariance,
   prior / posterior / likelihood, a priori / a posteriori, MLE / MAP, sampling, i.i.d.,
   Monte Carlo, and collected in a searchable glossary the learner can revisit. No
   probabilistic term is ever used before it's been said in layman's terms.

---

### ML & AI Track *(unlocks only after the Foundations Track above)*

**B. Working with Data, the craft (expanded)**
6. ⭐ **Data Literacy**, what a feature / label / observation actually *is*; data types &
   scales (nominal, ordinal, interval, ratio) and why the scale changes what you can do;
   tidy data; the real shape of datasets.
7. ⭐ **pandas**, loading, cleaning, joining, grouping, reshaping; the 80% of ML that is
   data work.
8. ⭐ **Messy Reality**, missing data (*why* it's missing changes how you handle it),
   outliers, duplicates, class imbalance, sampling bias, the traps that silently wreck
   real models.
9. ⭐ **Plotting & EDA**, matplotlib; *seeing* distributions and relationships before you
   model anything.
10. ⭐ **Data Leakage & the Train/Test Discipline**, the single most common silent killer
    in real ML; why the split is sacred and how leakage sneaks in.

**C. Thinking in Many Dimensions (dedicated stream, the "aha" most people never get)**
11. ⭐ **From 2D to n-D**, a data point *is* a vector in space; distance and similarity
    (Euclidean, cosine); why "features" are just axes.
12. ⭐ **The Curse of Dimensionality**, why your intuition breaks in high dimensions:
    distances concentrate (everything is roughly equally far), volume flees to the corners,
    data becomes impossibly sparse, "nearest neighbor" stops meaning much, each one
    **shown interactively** with real computed demos, not asserted.
13. ⭐ **Seeing the Unseeable**, you can't plot 300 dimensions; projection, and how
    PCA / t-SNE / UMAP let you *peek* at high-dimensional structure (and how they mislead).

**D. Classic Machine Learning**
14. ⭐ **What ML Actually Is**, supervised/unsupervised, features/labels, the learning
    loop, plain-language framing. This stream **opens the running ML glossary** (the
    counterpart to the probability glossary): every core ML term is defined in plain English
    with an example the first time it's used, and misleading names get their origin story.
    Terms covered as they arise across Phase 1 include: *model* (a function with knobs, tuned
    to fit data), *feature* (an input column / a measured property), *label* / *target* (the
    answer we're trying to predict), *training* (turning the knobs to fit), *inference* /
    *prediction* (using the tuned function on new data), *regression* vs *classification*
    (predict a number vs pick a category), *parameter* vs *hyperparameter* (knobs the model
    learns vs knobs *you* set), *loss / cost function* (the score for how wrong we are),
    *gradient descent* (roll downhill on that score), *generalization* (doing well on data
    you've never seen, the whole point), *overfitting* / *underfitting* (memorizing vs being
    too simple), *bias* / *variance*, *regularization* (a penalty that keeps the model
    humble), *ensemble* (many models voting), *cross-validation* (rotating the test set to
    trust your score). All collected in the same searchable glossary. Rule, stated to the
    learner: *no term is used before it's been said in plain English with an example, and if
    the name is a historical accident we tell you the story so it stops being a mystery.*

    > **"Weight" gets the full grounded treatment here, the same care "error" got in
    > Orientation.** The foundations borrow the word ("a model has knobs, a.k.a. *weights*") and
    > Orientation mentions it only in passing; the thorough version lands the moment weights
    > become the thing being learned (this stream and stream 15). The treatment: *what a weight
    > is*, a number the model multiplies a feature by, i.e. **how much that feature counts
    > toward the prediction**; *reading a weight*, its **sign** (does more of this feature push
    > the prediction up or down?) and its **magnitude** (how strongly), with a worked example
    > ("+18k per bedroom, −900 per year of age"); *where weights come from*, they start
    > arbitrary and training tunes them to shrink the error (tying error, gradient descent, and
    > weights into one sentence); *the bias/intercept* named as the "baseline" weight; and the
    > **demystify**, "weights," "parameters," and "coefficients" are three words for the same
    > thing (stats says coefficients, ML says weights, `model.coef_` is exactly these). Caveat
    > flagged honestly: raw weights are only directly interpretable when features are on the
    > same scale (callback to standardization) and uncorrelated, otherwise magnitude ≠
    > importance. No "weight" is used in the ML track before this grounding.
15. ⭐ **Linear & Logistic Regression**, fit, loss, gradient descent (the calculus pays
    off), regularization. Opens with a **demystify-the-name callout for "regression"**: the
    word sounds like "going backward" and confuses everyone, it's Francis Galton's historical
    accident ("regression to the mean," where tall parents have kids a bit closer to average),
    and today it just means **"predict a continuous number"** (price, temperature, age). Then
    the pair is set straight: *linear regression* predicts a number; *logistic regression*,
    despite the "regression" in its name, actually does **classification** (predicts a
    probability of a category), a second naming trap named out loud. Includes an explicit
    **"Why do we square the error?"** lesson —
    one of the most-asked, least-answered questions in ML. Grounded: *Hook*, you predicted
    house prices; some guesses are too high, some too low; how do you score "how wrong" in
    one number? *Why squaring, plainly:* (1) it makes every error positive so overs and
    unders don't cancel out; (2) it punishes a big miss far more than a small one
    (being off by 10 is 100× worse than being off by 1, often what you want); (3) it's
    smooth/differentiable, so gradient descent can follow its slope; (4) minimizing squared
    error lands exactly on the **mean**, and connects to assuming Gaussian noise, tying
    straight back to the probability stream (MSE = the negative log-likelihood under a
    normal model). *Then* the contrast: **MAE** (absolute error) is more robust to outliers
    and lands on the **median**, so the choice of loss encodes what you care about. Learners
    run both on the same data and *see* how each reacts to an outlier. (🧠 hard-idea
    treatment: the loss function is a values statement, not a formality.)
16. ⭐ **The Hard Truths: Overfitting, Bias–Variance & Generalization**, the most
    counterintuitive ideas in ML, made **visual**: why a model that aces the training data
    can be worthless, and why "more powerful" often means "worse." Each term gets the full
    grounded treatment before any curve or formula:
    - *Overfitting*: the model **memorized** the training data, noise and all, instead of
      learning the real pattern. Analogy: the student who memorized last year's exact exam
      answers and then bombs when the questions change, perfect on what it saw, useless on
      anything new. Shown interactively: a wiggly high-degree curve threading every training
      point yet missing the trend. (🧠 hard-idea treatment.)
    - *Underfitting*: the model is **too simple** to capture the pattern; a straight line
      through data that clearly curves. Wrong on the training data *and* on new data. The
      mirror image of overfitting: too dumb, where overfitting is too clever.
    - *Generalization*: the whole point: doing well on data you've **never seen**. Overfitting
      and underfitting are the two ways to fail at it.
    - *Bias vs variance*: in plain terms: *bias* = consistently wrong the same way (too
      simple, underfits); *variance* = wildly different each time the data wobbles (too
      sensitive, overfits), with the dartboard picture and the U-shaped test-error curve
      that shows the sweet spot between them.
    - *Regularization*: a **penalty that keeps the model humble**, gently pulling the knobs
      toward zero so it can't contort itself to memorize noise, introduced here as the fix,
      named plainly rather than as an incantation.
17. ⭐ **Model Evaluation**, train/val/test, cross-validation, metrics, the confusion
    matrix, ROC/AUC, and the accuracy-is-a-lie trap under class imbalance.
18. ⭐ **Trees & Ensembles**, decision trees, random forests, gradient boosting; what
    actually wins real tabular problems.
19. ⭐ **Clustering & Dimensionality Reduction**, k-means, hierarchical, PCA (eigenvectors
    grounded: the axes of maximum variance), t-SNE.
20. ⭐ **Feature Engineering & Pipelines**, encoding, scaling, leakage-safe scikit-learn
    pipelines; the craft that separates working ML from toy ML.

**E. Phase-1 Projects (end-to-end, deploy-something)**
21. ⭐ **Project: Predict house prices**, full regression on a real dataset.
22. ⭐ **Project: Spam / churn classifier**, full classification pipeline + honest evaluation.
23. ⭐ **Project: Customer segmentation**, unsupervised; communicate the findings.
24. ⭐ **CAPSTONE: real-world ML, executed and explained.** The course culminates here, and
    the bar is deliberately dual: the learner takes a **real-world dataset** (a curated
    choice, e.g. a public housing, health, or churn dataset, or one they bring), executes a
    **complete ML workflow** (frame the question → explore and clean → engineer features →
    choose and train an algorithm → evaluate honestly), and then, the part that separates
    understanding from imitation, **explains it**: a written walkthrough of *what the
    algorithm does and why it fits this problem*, *what the model learned* (coefficients /
    feature importances in plain English), *how good it really is* (metrics interpreted, not
    just reported, including where it fails), and *what they would try next*. Grading matches
    the dual bar: the pipeline is verified on real outputs/metrics (the standard runner), and
    the explanation is assessed by the AI judge against a rubric (correct mechanism, honest
    evaluation, plain-English clarity) with feedback, not just a pass/fail. Completing the
    capstone is what completes the course, it is the demonstrable artifact ("I built this
    and can explain it") that the positioning section promises, and the strongest single item
    a learner can put in front of an employer or an admissions committee.

**Cross-cutting: "🧠 Hard idea, made simple."** The genuinely counterintuitive concepts —
the ones people pass exams on but never truly *get*, are flagged with a badge and given
the deepest treatment: grounding-first, an **interactive Pyodide/matplotlib visualization**
you manipulate, and an explicit "common misconception" callout. The starting set:
the curse of dimensionality · bias–variance tradeoff · overfitting vs generalization ·
eigenvectors/PCA · **Bayes' theorem, prior vs posterior & the base-rate fallacy** ·
**why we square the error (MSE vs MAE)** · correlation ≠ causation · probability vs
likelihood · why more features can hurt · the geometry of decision boundaries · why
regularization works · data leakage · class imbalance & why accuracy lies · Simpson's
paradox · prediction vs inference · entropy & information. (Expectation-Maximization and others join in later phases where they arise.)
This, showing high-dimensional weirdness with code you run, not equations you take on
faith, is only possible *because* we chose in-browser execution.

### Phase 2: Deep Learning *(second release)*

17. Neural Networks from Scratch, a net in pure numpy: forward, loss, backprop, SGD. Given
    the full grounded + historical treatment: *forward propagation* as repeated "multiply,
    then squash"; *backpropagation* as the chain rule assigning blame backwards, built up so
    it feels inevitable after stream 4; and the **history callout**, why the lack of an
    efficient backprop (plus the 1969 perceptron critique) helped cause the AI winters, and
    why the 1986 backprop paper was the unlock. Learners implement forward *and* backward
    passes by hand in numpy and watch a real net learn. (🧠 hard-idea treatment.)
18. Training Deep Nets, activations, initialization, optimizers, batchnorm, dropout,
    the practical training playbook.
19. A Framework (PyTorch), tensors, autograd, `nn.Module`, the training loop.
20. Convolutional Networks, images, convolutions, a real image classifier.
21. Sequence Models: RNNs/embeddings; the bridge to attention.
22. **Project: Image classifier**, deployed as a small service.

### Phase 3: LLMs & Generative AI *(third release)*

23. Transformers, Demystified, attention, tokens, embeddings; from-fundamentals.
24. Using LLMs Well, prompting, structured output, context windows, evaluation.
25. Embeddings & Vector Search, semantic search from scratch.
26. Retrieval-Augmented Generation (RAG), the pattern behind most real LLM apps.
27. Fine-tuning & Adaptation, when and how; LoRA-level intuition.
28. Agents & Tool Use, the current frontier, with eyes open about limits.
29. **Project: Build a RAG assistant** over your own documents, deployed.

### Dan Track *(research-grade, ongoing)*
Attention internals, RLHF/alignment, scaling laws, evaluation & safety, ML system design
interviews, the senior tier, mirroring JavaDojo's Dan Track.

---

## 5b. The rigorous glossary: complete term inventory

This section makes "complete coverage with rigor" concrete. It is the **checklist** the whole
course is graded against: every term below gets a glossary entry and a lesson callout, and
`verify.js` fails the build if any of them is used before its entry exists.

**The standard for every entry (four parts, in order):**
1. **Plain English**: one sentence a smart beginner understands, no jargon.
2. **A concrete example**: real numbers or a real scenario, not an abstraction.
3. **Where it's actually used in ML**: so the learner knows *why they should care*.
4. **The precise statement**: the correct, exam-surviving definition. We simplify the
   explanation, never the truth; part 4 is where rigor lives, and it always follows parts 1–3.

Misleading names additionally get a **fifth part: the name's origin**, so historical
accidents (regression, logistic regression, "naive" Bayes, kernel, stochastic) stop confusing.

### Term inventory by domain (each gets the four-part treatment)

**Linear algebra.** scalar · vector · matrix · tensor · dimension/axis · transpose ·
matrix multiplication · dot product · **inner product** · **outer product** · cross product
(flagged non-ML) · norm (L1/L2/L∞) · unit vector · distance (Euclidean, cosine, Manhattan) ·
linear combination · **span** · **basis** · **rank** · linear independence · identity matrix ·
inverse · singular/non-invertible · determinant · **matrix as a linear transformation** ·
projection · orthogonality · **eigenvector / eigenvalue** · diagonalization · **SVD** ·
positive-definite · trace.

**Calculus.** function · slope · **derivative** · rate of change · limit · **partial
derivative** · **gradient** · directional derivative · **chain rule** · **Jacobian** ·
**Hessian** · local vs global minimum · saddle point · **convexity** · gradient descent ·
learning rate · step/update · numerical vs analytic gradient.

**Probability & statistics.** outcome/event · sample space · probability (frequentist vs
Bayesian) · random variable · **independent vs dependent variable** · distribution (PMF/PDF) ·
uniform/normal/Bernoulli/binomial/Poisson · **expectation (mean)** · **variance** ·
standard deviation · **covariance** · **correlation** (vs causation) · joint / marginal /
conditional probability · **Bayes' theorem** · prior / likelihood / posterior · a priori /
a posteriori · **independence** · **conditional independence** · i.i.d. · sampling ·
**Monte Carlo** · law of large numbers · central limit theorem · **probability vs likelihood** ·
**maximum likelihood (MLE)** · **MAP** · **entropy** · **cross-entropy** · KL divergence ·
confidence vs credible interval · p-value (used carefully) · base-rate fallacy.

**Classic ML.** model · parameter vs **hyperparameter** · feature · label/target ·
training/inference · **regression** vs **classification** · **loss / cost function** · MSE ·
MAE · **overfitting** · **underfitting** · **generalization** · **bias–variance tradeoff** ·
train/validation/test · **cross-validation** · **data leakage** · **regularization (L1/L2,
ridge/lasso)** · feature scaling/normalization · one-hot encoding · **logistic regression** ·
sigmoid · decision boundary · **kernel / kernel trick** · **support vector machine** ·
k-nearest neighbors · decision tree · **ensemble** (bagging/boosting) · random forest ·
**gradient boosting** · k-means · **PCA** · t-SNE/UMAP · confusion matrix · precision/recall ·
F1 · **ROC/AUC** · class imbalance · the curse of dimensionality.

**Neural networks & deep learning.** neuron/unit · weight/bias · **activation function** ·
sigmoid/tanh/**ReLU** · layer (input/hidden/output) · **forward propagation** ·
**backpropagation** · **softmax** · cross-entropy loss · **SGD** · mini-batch · epoch ·
learning-rate schedule · **vanishing/exploding gradients** · initialization · **batch
normalization** · **dropout** · overfitting in nets · autograd/computational graph ·
**tensor** · convolution/filter/stride/pooling · embedding · RNN/LSTM · attention (bridge).

**LLMs & generative AI.** token/tokenization · embedding · context window · **attention /
self-attention** · transformer · logits · **temperature** · top-k/top-p sampling ·
pretraining vs fine-tuning · **LoRA** · prompt/system prompt · **RAG** · vector database ·
hallucination · **RLHF** · alignment · scaling laws.

### Fully-worked rigorous entries (the quality bar: the ones most often hand-waved)

> **Eigenvector / eigenvalue.** *Plain:* a direction a matrix stretches without turning, and
> the number saying how much it stretches. *Example:* the matrix `[[2,0],[0,3]]` leaves the
> x-axis pointing the same way but 2× longer (eigenvector `[1,0]`, eigenvalue 2) and the
> y-axis 3× longer. *Used in ML:* PCA's principal components are the eigenvectors of the
> covariance matrix (the axes of maximum variance); PageRank; spectral clustering. *Precise:*
> `v ≠ 0` is an eigenvector of `A` with eigenvalue `λ` iff `A v = λ v`, the transformation
> acts as pure scaling along `v`.

> **Variance & covariance.** *Plain:* variance = how spread out one quantity is around its
> average; covariance = whether two quantities move together. *Example:* heights in cm have
> bigger variance than heights in metres; height and weight have positive covariance (tall
> people tend to weigh more). *Used in ML:* variance is half the bias–variance story;
> covariance matrices drive PCA and Gaussian models. *Precise:* `Var(X)=E[(X−E[X])²]`;
> `Cov(X,Y)=E[(X−E[X])(Y−E[Y])]`; **correlation** is covariance rescaled to [−1,1],
> `ρ=Cov(X,Y)/(σ_X σ_Y)`, which is *why* correlation is unitless and comparable.

> **Entropy & cross-entropy.** *Plain:* entropy = how surprised you expect to be by a random
> outcome (how uncertain it is); cross-entropy = how surprised your *model* is by the *real*
> answers. *Example:* a fair coin has 1 bit of entropy; a two-headed coin has 0 (no surprise).
> *Used in ML:* cross-entropy is the standard classification loss, minimizing it makes the
> model assign high probability to the true class; decision trees split to reduce entropy.
> *Precise:* `H(p)=−Σ p(x)·log p(x)`; cross-entropy `H(p,q)=−Σ p(x)·log q(x)`, minimized (over
> model `q`) exactly when `q` matches the true `p`; it equals negative log-likelihood.

> **Regularization (L1/L2).** *Plain:* a penalty that keeps the model humble so it can't
> contort to memorize noise. *Example:* two models fit the training data equally well; the
> penalty prefers the one with smaller weights, which usually generalizes better. *Used in
> ML:* ridge (L2) and lasso (L1) regression, weight decay in nets. *Precise:* add
> `λ·‖w‖²` (L2) or `λ·‖w‖₁` (L1) to the loss; L2 shrinks weights smoothly toward zero, L1 can
> drive some *exactly* to zero (automatic feature selection), the difference falls straight
> out of the geometry of a diamond vs a circle constraint.

> **Convexity.** *Plain:* a bowl-shaped loss with exactly one bottom, so "walk downhill" can't
> get stuck. *Example:* linear/logistic-regression losses are convex; neural-net losses are
> not (many dips). *Used in ML:* it's why linear/logistic regression train to a guaranteed
> best answer while deep nets need care and luck. *Precise:* `f` is convex iff the line
> segment between any two points on its graph lies on or above the graph
> (`f(θa+(1−θ)b) ≤ θf(a)+(1−θ)f(b)`); for such `f`, any local minimum is global.

> **Softmax.** *Plain:* turns a list of raw scores into probabilities that add to 1. *Example:*
> scores `[2, 1, 0]` become roughly `[0.66, 0.24, 0.10]`. *Used in ML:* the output layer of
> multi-class classifiers; the last step of attention. *Precise:* `softmax(z)_i =
> e^{z_i} / Σ_j e^{z_j}`; it's the multi-class generalization of the sigmoid, and pairs with
> cross-entropy so the gradient is simply `(prediction − truth)`.

> **Activation function (and why nonlinearity).** *Plain:* the "squash" step that lets a
> network bend, not just draw straight lines. *Example:* **ReLU** just does `max(0, x)` —
> keep positives, zero out negatives. *Used in ML:* every hidden layer; without it, stacking
> layers collapses to a single linear map (no depth benefit). *Precise:* a network is
> `f(x)=W₂·σ(W₁x+b₁)+b₂`; if `σ` is linear the whole thing is linear, so the *nonlinearity*
> `σ` is exactly what buys representational power. ReLU also dodges the vanishing-gradient
> problem that plagued sigmoid/tanh in deep nets.

> **Maximum likelihood (MLE).** *Plain:* pick the settings that make the data you actually saw
> the least surprising. *Example:* you flip a coin 10× and see 7 heads; the MLE for P(heads)
> is 0.7, the value under which "7 heads" is most probable. *Used in ML:* most training
> objectives *are* MLE in disguise, least-squares = MLE under Gaussian noise; cross-entropy =
> MLE for classification. *Precise:* `θ̂ = argmax_θ Π p(dataᵢ | θ)`, usually maximized as the
> sum of `log p`; **MAP** adds a prior, `argmax_θ [log p(data|θ) + log p(θ)]`, which is exactly
> where regularization comes from.

> **Attention / self-attention (bridge to Phase 3).** *Plain:* each word looks at the other
> words and pulls in the ones relevant to it. *Example:* in "the animal didn't cross the street
> because *it* was tired," attention lets "it" draw strongly from "animal." *Used in ML:* the
> core mechanism of transformers and every modern LLM. *Precise:* `Attention(Q,K,V) =
> softmax(QKᵀ/√d)·V`, query·key dot products (alignment!) become softmax weights over the
> values; note it's built entirely from dot products, softmax, and matrix multiplies the
> learner already met, which is the whole point of teaching those rigorously first.

The worked entries above set the bar; the remaining inventory terms each ship with the same
four-part rigor in their home lesson. This inventory is a living checklist, as streams are
authored, `verify.js` cross-checks used terms against defined ones so coverage stays complete.

### Depth scales with the learner (advanced topics get the *full* treatment, not a mention)

Grounding-first does **not** mean staying shallow. Early lessons ground a term and move on;
advanced lessons ground it *and then go deep*, the four-part entry is the floor, not the
ceiling. As the student climbs, hard topics get their own multi-part lessons with derivations,
runnable experiments, and the honest edge cases. Committed deep-dive topics include:

> **Convolution** ("what the hell is a convolution?"). *Plain:* slide a small window (a
> filter) across an image and, at each spot, multiply-and-add to measure "how much does this
> patch look like this pattern?" *Example:* a 3×3 edge filter lights up where brightness
> changes, it literally traces outlines. *Used in ML:* the core of CNNs for vision; the same
> filter reused everywhere is why CNNs need far fewer weights than a dense net and why they're
> translation-invariant. *Precise:* discrete convolution `(f∗g)[n]=Σ_k f[k]·g[n−k]` (ML
> "convolution" is usually cross-correlation, a demystify note worth making); then the full
> depth, stride, padding, channels, receptive field, parameter sharing, each shown by
> running a real filter over a real image in the browser and *seeing* the feature map.

> **Convex optimization** (deep dive, ties back to the convexity glossary entry). *Plain:* the
> theory of problems shaped like a bowl, where "roll downhill" is guaranteed to find the true
> best answer. *Example:* linear regression, logistic regression, and SVMs are convex, solved
> to a global optimum; deep nets are not. *Used in ML:* it's the dividing line between models
> you can trust to train reliably and models that need tricks, restarts, and luck. *Depth:*
> convex sets and functions, why local = global under convexity, gradient descent vs
> closed-form solutions, constrained optimization and the intuition for Lagrange multipliers,
> and *why* the field spent decades on convex models before deep learning, with runnable
> comparisons of a convex loss vs a bumpy non-convex one.

Other topics flagged for deep-dive treatment as the learner reaches them: SVD & low-rank
approximation, the kernel trick and RKHS intuition, the EM algorithm's convergence,
backpropagation derived in full, attention/transformer internals, batch-norm and why it
helps, and the bias–variance decomposition done algebraically. Each is a *lesson with depth*,
not a glossary line.

### Learner-support features (interactive help, beyond static hints)

Two capabilities, built on the same AI-tutor mechanism JavaDojo already uses
(`window.cowork.askClaude`), available throughout the app:

- **Ask the Tutor**: a free-form question dialog on every lesson. The learner can ask things
  like *"walk me through gradient descent step by step,"* *"why is the sigmoid used here?"*,
  or *"explain this error"*, and get a grounded, level-appropriate answer that knows which
  lesson and exercise they're on (the current lesson + their code are passed as context). It's
  the on-demand complement to the scripted, progressive hints: hints nudge you toward *this*
  exercise's answer; the tutor explains *anything*, at any depth, on request.
- **Provide Feedback**: a lightweight per-lesson feedback control ("Was this clear? Too fast?
  Found an error?") so learners can flag confusing explanations, wrong content, or broken
  exercises. Feedback is captured with the lesson/exercise id and (when signed in) the user,
  through the shared `site/` layer, closing the loop so the curriculum keeps improving from
  real learner friction. Purely opt-in; never blocks progress.
- **Worked-by-hand examples for every operation (non-negotiable depth standard).** Whenever a
  lesson introduces an operation, it shows that operation **worked out by hand, step by step,
  with real numbers**, not only as code. A matrix multiply shows each output cell as an
  explicit row·column dot product; the identity shows the 1s "selecting" and 0s "erasing"; the
  determinant shows `ad − bc` on real numbers and its area meaning; the 2×2 inverse shows
  swap-negate-divide and multiplies back to `I`. The rule fixes the "lessons are too light and
  the student gets lost" failure: intuition, then the arithmetic actually carried out, then the
  code. Rolling this standard across every math lesson, one stream at a time.
- **Diagrams & visuals (show, don't just tell).** Where a concept is inherently visual, the
  lesson carries a clean inline **figure** (self-contained SVG, themed, with a caption) so the
  learner *sees* the idea, not just reads it, e.g. **gradient descent** as a ball walking down
  a bowl with the gradient drawn as the slope and steps moving the opposite way; a **vector** as
  an arrow with its components and length; the **sigmoid** S-curve; a bell curve; the
  least-squares "shadow." This is a per-lesson standard being rolled out across the visual
  concepts (gradient, vectors, distributions, projections, decision boundaries, etc.), refreshed
  where a picture beats a paragraph.
- **Homework / further practice (self-directed, with worked solutions).** Beyond the
  auto-graded in-browser exercise, each lesson can carry a **Homework** section: problems the
  learner does **on paper or on their own computer** to reinforce the concept, each with a
  **detailed, revealable step-by-step solution** (collapsible, no penalty). This is where the
  *doable-by-hand technique* lives, e.g. the calculus homework asks the learner to
  differentiate by hand with the power/product/chain rules and derive the sigmoid's derivative,
  with fully worked solutions; the linear-algebra homework has them compute determinants and
  reason about invertibility. It complements the graded exercise (which proves the idea runs)
  with practice that builds fluency and transfers to pen-and-paper exam settings, reinforcing
  the "rivals college studies" bar. Purely optional; never blocks progress.
- **Dive Deeper, a graduate-level learning path per concept.** On *every* concept, algorithm,
  and mathematical operation, a **Dive Deeper** control opens not a single harder paragraph but
  a **progressive path that mirrors how the topic is taught at graduate level**, the same
  arc a good grad course or a text like Bishop's *PRML*, Goodfellow's *Deep Learning*, or
  MacKay walks: intuition → formal definition → the full derivation (every step in plain
  English, nothing skipped) → assumptions, failure modes, and edge cases → connections to the
  broader theory and the standard notation/literature → optional proof sketches and "where this
  generalizes." It is **staged, not a wall of math**: the learner clicks to descend one level
  at a time, so a beginner can stop after the intuition while a serious student can follow the
  same concept all the way to research-grade treatment, without ever leaving the lesson.
  Each level ends with an optional check or a runnable experiment so depth is *active*, not
  passive reading. Structure in the schema: a `deepDive` for each concept is an ordered list of
  levels (`intuition → derivation → formal → connections → frontier`), each authored to the
  four-part rigor standard; the **Ask the Tutor** mechanism can extend any level further on
  demand ("go deeper on this step," "show the proof"), so the path is bounded by the learner's
  curiosity, not by what fits on the page. Design intent: a motivated learner can, concept by
  concept, use Dive Deeper to assemble a genuinely graduate-level understanding, the depth a
  degree provides, made reachable and self-paced.

---

## 6. Build order for Phase 1 (what actually gets built first)

1. **Fork the engine**: copy JavaDojo's `src/`, `build.js`, `scripts/verify.js` into
   `ml-dojo/`; restyle to the MLDojo palette; strip Java-specifics.
2. **Wire Pyodide**: the runner: load runtime + numpy/pandas/sklearn/matplotlib, run user
   code in a worker, capture stdout/returns/exceptions/figures. Prove it with one lesson.
3. **Wire KaTeX**: math rendering in lessons.
4. **Define the exercise schema**: extend JavaDojo's (add `run`/`assert`/`plot` types and
   Python `setup`/`solution`/`tests`). Update `verify.js` to run each solution through
   Pyodide headlessly (Node + Pyodide) so the content test-suite stays green like JavaDojo's.
5. **Author streams 1–2** (Python from Zero, NumPy) end to end as the template.
6. **Author the rest of Phase 1** (streams 3–16), verifying continuously.
7. **Integrate with the site**: serve MLDojo at `/ml` (or its own subdomain), extend the
   progress table with a `product` column, add the hub link, flip the landing teaser to live.
8. **Ship Phase 1.**

---

## 7. Risks & open questions (to decide as we build)

- **Pyodide first-load weight.** The runtime + packages are several MB. Mitigations:
  self-host, lazy-load per stream, cache aggressively, show a one-time "warming up the
  Python engine" state. Acceptable for a learning tool; worth measuring early.
- **Deep-learning execution (Phase 2).** Confirmed constraint: needs the backend runner or
  hosted notebooks. Phasing means we don't solve it until Phase 2, but we design the
  exercise schema now so it can target either Pyodide or a backend.
- **CSP / hosting.** Pyodide + KaTeX are self-hosted to keep a strict CSP; the app page's
  policy gains `wasm-unsafe-eval` for Pyodide. Documented, not hand-waved.
- **Math pedagogy.** Teaching linear algebra/calculus from zero well is its own craft;
  budget real effort for intuition-first explanations (the JavaDojo analogy approach).
- **Dataset licensing.** Bundle only clearly-licensed toy datasets; cite sources.
- **Scope discipline.** Phase 1 is 16 streams, already sizable. Resist creep; DL and LLMs
  are separate releases by design.

---

## 8. What "done" looks like for Phase 1

A learner with zero programming and rusty high-school math can start at Python from Zero,
be carried through the math they need, train and evaluate real ML models **in the browser
with real results**, complete three end-to-end projects, and earn belts along the way —
all synced to their account, served alongside JavaDojo. A complete product that stands on
its own, with a clear runway to Deep Learning and LLMs.

---

*Next step on approval: begin Phase 1, Build Order step 1, fork the engine into `ml-dojo/`
and stand up the Pyodide runner against a first proof-of-concept lesson.*
