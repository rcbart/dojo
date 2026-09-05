# Dev Dojo — End-to-End Tests

Browser tests (Playwright + TypeScript) that drive the **built** app and read the
**real grader's** on-screen verdict. This is the layer the repo was missing: unit
tests (`engine/test`) cover pure logic and the `scripts/verify-*.js` gates check
content, but nothing else exercised the grader through a real browser — which is
where the defects in `docs/`/exploratory testing actually live.

## Run

```bash
npm ci
npx playwright install --with-deps chromium

npm run test:e2e            # build + serve dist/, run everything
npm run test:e2e:ui        # interactive UI mode
npm run test:e2e -- smoke  # a single spec

# Point the same suite at a live deployment (no local build/serve):
BASE_URL=https://roniam.dev/dev/ npm run test:e2e
```

`playwright.config.ts` builds (`node build.js`) and serves `dist/` automatically
unless `BASE_URL` is set. Tests run **fully parallel across workers** (2 in CI,
auto locally); every test navigates fresh via the `page` fixture, so they shard
cleanly.

## Layout

| File | What it covers |
|---|---|
| `selectors.ts` | The single selector registry. The **only** file the self-healing agent edits. |
| `pages/DojoApp.ts` | Page object: open streams/lessons, set the editor, run, read the verdict. |
| `fixtures.ts` | `page` (pre-navigated) + `dojo` (page object). |
| `smoke.spec.ts` | App loads, streams render, a lesson opens, no console errors. |
| `grading.regression.spec.ts` | The grader accept/reject behavior (UI-driven). |
| `engine.spec.ts` | Corpus invariants + shuffle, for the served devdojo build. |
| `courses.invariants.spec.ts` | The corpus invariants across **all three engine courses** (devdojo, identity-dojo, js-dojo), loaded over `file://`. |
| `invariants.ts` | Shared course list + in-page invariant functions (used by both specs above). |
| `execution.spec.ts` | The "real execution" paths — JS worker, Java runner, fetch mock. |
| `quiz.spec.ts` | The quick-check quiz widget. |
| `security.spec.ts` | Response-header check (F06), live-deployment only. |
| `../reporters/dojo-reporter.ts` | Findings-status dashboard reporter (see below). |

### Reporting

The suite ships a custom reporter (`tests/reporters/dojo-reporter.ts`) alongside
the standard `list` / `json` / `html` / `junit` reporters. It reads the finding
id from each test title and reports the **state of each tracked finding**, which
the built-in reporters flatten:

| Status | Meaning |
|---|---|
| ⚠️ live (guarded) | a known-bug guard failed as expected — the bug is still there |
| ✅ fixed (guarded) | a fixed-bug invariant passed — protected from regression |
| 🎉 newly fixed | a guard **unexpectedly passed** — the bug is fixed; delete the `test.fail()` |
| ❌ regression | a normal test failed |

Outputs (under `test-results/`): `report.md` (also appended to the GitHub
Actions **run summary**, so each CI run shows the dashboard inline),
`findings.json` (machine-readable, for trends/badges), and `junit.xml` (external
CI). The reporter changes no exit codes — Playwright still fails the run on a
regression or a newly-passing guard, which is exactly when you want a red build.

### Test hooks and cross-course coverage

- **`data-testid` hooks.** The interactive elements carry semantic `data-testid`s
  (added to `engine/shell.html` and `engine/app.js`), and `selectors.ts` targets
  those rather than incidental ids — so tests don't couple to markup and the
  self-healing agent has stable handles to prefer.
- **All three courses.** devdojo, identity-dojo and js-dojo are built from the
  same `engine/`, so a grader/engine regression breaks all three at once. The
  corpus invariants (*every shipped solution passes its own grader*, quiz
  soundness) run against each course's built page — the guard the repo's own CI
  comment says the standalone verifiers lost.

## Two kinds of test

- **Invariants** — plain tests that must always pass. The most important:
  *every shipped solution passes its own grader* (`engine.spec.ts`). That's the
  exact guarantee the repo's standalone verifiers lost when they went stale, and
  reading the grader's real verdict is what keeps this from drifting again.

- **Known-bug guards** — `test.fail()` tests that assert the **correct** behavior
  for a defect found in exploratory testing. While the bug exists the assertion
  fails and `test.fail()` keeps CI green; when the grader is fixed, Playwright
  reports *"expected to fail but passed"* — the signal to delete the guard and
  close the bug. Current guards (calibrated to this fork's build):

  | Guard | Finding |
  |---|---|
  | `F03` | a legal `main(String args[])` spelling is rejected |
  | `F04` | `java Greeter.class` is accepted (the very next quiz marks it wrong) |
  | `F05` | `delta == beta` on primitives trips the wrapper-`==` check (no word boundary) |
  | `F01-residual` | `text`/`http` exercises accept a commented-out answer |
  | `N1` | the Java runner trusts the first `DOJO_RESULT` in learner-controlled stdout |
  | `N3` | the JS grader's `deepEq` coerces `NaN`/`Infinity`/`undefined` to `null` |
  | `N4` | `checkFetch` matches URL/body by substring, so near-misses pass |
  | `F06` | `frame-ancestors` is only in `<meta>` (needs `BASE_URL` to run) |

  Already fixed on this fork and now guarded as invariants: `F01` (Java
  commented-out), `F02a`/`F02b` (sameText), and the JS-worker `postMessage`
  forgery (per-run token).
