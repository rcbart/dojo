<p align="center">
  <img src="https://img.shields.io/badge/status-complete-2ea44f" alt="status">
  <img src="https://img.shields.io/badge/streams-15-eab308" alt="streams built">
  <img src="https://img.shields.io/badge/lessons-53-eab308" alt="lessons">
  <img src="https://img.shields.io/badge/exercises-91-06b6d4" alt="exercises">
  <img src="https://img.shields.io/badge/executed%20cases-531-2ea44f" alt="executed test cases">
  <img src="https://img.shields.io/badge/real%20execution-100%25-06b6d4" alt="exercises graded by real execution">
  <img src="https://img.shields.io/badge/deps-zero-111827" alt="zero dependencies">
</p>

# JSDojo 🟨

JavaScript and Node from the ground up, **assuming nothing**, in a single offline HTML file. The third
course in this repository, built on the same [shared engine](../engine/README.md) as
[DevDojo](../README.md) and [IdentityDojo](../identity-dojo/README.md).

> **All 15 streams are built.** **53 lessons, 91 exercises, 531 executed cases, 0 failures** — and
> every exercise is graded by real execution, not by pattern-matching. Exercises are tagged
> `easy` / `medium` / `hard` and ramp within each lesson; the 20 hard ones are small realistic problems
> written so that a plausible-but-wrong implementation fails a **named** case.

## Why this course exists

DevDojo teaches Java in depth and JavaScript almost not at all — its React stream teaches React while
assuming the language underneath it. This course fills that gap, and it does so where the platform is
strongest: **JavaScript is the only language the engine can execute for real**, in a sandboxed Web
Worker, so every exercise here is graded by calling your function with real inputs and checking what it
returns, not by pattern-matching the shape of your answer.

## The design principle

Concepts are grounded **before** anything that depends on them:

- **values and types** before any operator that coerces between them
- **the call stack and scope** before closures, which are otherwise magic
- **the event loop** before a single promise, so async stops being folklore
- **prototypes** before classes, because classes are sugar over them

Everything that surprises people about JavaScript — `0.1 + 0.2`, `typeof null`, `this`, hoisting,
`==`, why `[] + {}` is a string — is taken apart until it stops being surprising. Nothing is
hand-waved as "just how JavaScript is".

## The streams

| # | Stream | Covers |
|--:|---|---|
| 1 | **JavaScript Foundations** ✅ | where JS runs, the eight types, `let`/`const`/`var`, operators, coercion, truthiness, `==` vs `===`, strings and numbers |
| 2 | **Control Flow & Functions** ✅ | conditionals, loops, function forms, parameters, arrow functions, early return |
| 3 | **Objects, Arrays & Data** ✅ | objects, arrays, destructuring, spread/rest, `map`/`filter`/`reduce`, `Map`/`Set`, JSON |
| 4 | **Functions in Depth** ✅ | the call stack, scope chain, closures, `this` in all five forms, `call`/`apply`/`bind`, recursion |
| 5 | **Prototypes, Classes & Objects** ✅ | the prototype chain, `class`, inheritance, getters/setters, private fields, symbols, iterators |
| 6 | **The Event Loop & Async** ✅ | callbacks, promises, `async`/`await`, microtasks vs macrotasks, concurrency, cancellation |
| 7 | **Errors & the Debugging Method** ✅ | `Error` types, `try`/`catch`/`finally`, custom errors, reading stack traces, async errors, bisect/reproduce/isolate |
| 8 | **Debugging in the Browser** ✅ | DevTools Sources, breakpoints (conditional, logpoint, DOM, XHR), the scope pane, blackboxing, source maps, the Network panel, cookies and storage, **tracing an OAuth/OIDC redirect flow end to end** |
| 9 | **Modules, Packages & Tooling** ✅ | ESM vs CommonJS, `package.json`, npm, semver, lockfiles, bundlers, linting and formatting |
| 10 | **TypeScript** ✅ | why types, structural typing, generics, narrowing, `unknown` vs `any`, migrating JS |
| 11 | **The Node Runtime** ✅ | what Node is, its event loop and phases, `process`, env and CLI args, globals |
| 12 | **Files, Streams & the Standard Library** ✅ | `fs`, `path`, buffers, streams, backpressure, `worker_threads` |
| 13 | **Building an HTTP Server** ✅ | the `http` module, routing, middleware, REST, validation, auth, security headers |
| 14 | **Debugging, Testing & Profiling Node** ✅ | `node --inspect`, breakpoints in server code, `node:test`, heap snapshots, CPU profiles, event-loop blocking |
| 15 | **Capstone** ✅ | build and debug a real application end to end |

## How the exercises are pitched

Every lesson averages ~460 words with worked, concrete examples rather than definitions, and its exercises
**ramp in difficulty** — each one is tagged `easy`, `medium` or `hard`, which drives the built-in Practice
filter:

- **easy** — one idea, applied directly. Classify a value, pick the right construct.
- **medium** — two or three ideas combined, with a case that punishes the obvious shortcut.
- **hard** — a small realistic problem: normalise a form submission where `Number("")` is `0` and a
  legitimate `0` must survive; memoise with a closure where a cached `0` breaks a truthy cache check;
  plan a retry with exponential backoff and get the off-by-one right; build a bounded queue with private
  fields; compare two semver strings where `"1.10.0"` must outrank `"1.9.0"`.

The hard tier is written so that a plausible-looking implementation fails a **named** case, and the
`behavior` note says which assumption broke.

## Build & run

```bash
node build.js                  # produces dist/index.html
node scripts/verify.js         # content integrity gate (target: 0 failures)
```

Open `dist/index.html` directly in a browser, or host it on any static host. JSDojo owns everything in
this directory except the runtime, which comes from the shared [`../engine`](../engine/README.md).

## Security

This course runs **learner-supplied code**, which makes it the one place in the repository where that
matters. Three controls, in order of importance:

1. **Content Security Policy with `connect-src 'none'`.** The Web Worker inherits the page's policy, so
   submitted code cannot open a `fetch`, `XMLHttpRequest`, `WebSocket` or `EventSource` to anywhere.
   There is no network path out.
2. **Globals removed before execution.** `importScripts`, `XMLHttpRequest`, `WebSocket`, `EventSource`,
   `indexedDB`, `caches`, `Worker` and (unless the exercise mocks it) `fetch` are deleted from the worker
   scope before a single line of submitted code runs — defence in depth, and it turns a silent attempt
   into an immediate `TypeError`.
3. **Worker isolation and a hard timeout.** A worker has no DOM, no `document`, no page cookies and no
   access to the page's storage. Execution is capped at 3 seconds, so an infinite loop terminates the
   worker rather than the tab, and the blob URL is revoked immediately after start.

**Stated honestly:** `script-src` must allow `'unsafe-inline'`, because the entire course is one
self-contained offline file with no external origin to load from. That is the deliberate trade for
working offline from `file://`. No remote origin is permitted, so nothing can be pulled in — the risk
`'unsafe-inline'` normally carries is injection into a page that also loads untrusted content, and this
page loads nothing at all.

**Web Crypto is deliberately not used.** `crypto.subtle` is only exposed in secure contexts, which makes
it unavailable or inconsistent when the file is opened directly from disk. Exercises that touch
cryptography work on the parts that are pure logic — base64url encoding, JWT assembly, claim validation,
canonical ordering, constant-time comparison — which are exactly the parts people get wrong anyway.

## Repository layout

JSDojo lives inside [`rcbart/knowledge-base`](https://github.com/rcbart/knowledge-base) alongside DevDojo
and IdentityDojo, sharing one `engine/`. That is deliberate: three courses, one runtime, one place to fix
a bug. Because the only coupling is the `ENGINE` constant at the top of `build.js`, lifting this course
into its own repository is a copy rather than a fork — see the README section on the engine.

## How grading works (honestly)

Every exercise is graded by **real execution**: your function is called with real inputs in a sandboxed
Web Worker and its return value compared against expected values. Each failure mode is a separate named
case, so an implementation that fails open on an unknown input fails a test rather than slipping past a
pattern match. Regex checks are still present as a secondary structural gate and to keep the content
integrity script meaningful, but they are not what decides whether you passed.
