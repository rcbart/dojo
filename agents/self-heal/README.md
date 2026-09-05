# Self-Healing Agent

A Claude-powered agent that repairs the E2E suite when a **selector** drifts, and
escalates everything it can't safely fix. Adapted from the pattern in
[jaffarlone/SelfHealingAgent](https://github.com/jaffarlone/SelfHealingAgent) to
this repo: GitHub-native (Issues, not Jira), and it heals a central **selector
registry** because the app has almost no `data-testid`s.

## How it works

A code-controlled loop (the orchestration lives in `heal.ts`; Claude is asked one
well-scoped question per broken selector):

```
playwright test → results.json
        │
        ▼
   diagnose.ts   classify each GENUINE failure (test.fail guards are ignored)
        │            selector · timing · assertion · unknown
        ▼
  ┌─ selector? ─ yes ─► probe live DOM (tools.ts)
  │                     └► Claude picks the best replacement (anthropic.ts)
  │                        └► rewrite ONE key in selectors.ts (tools.ts)
  │                           └► re-run the spec ─ green? ─ keep ─► report "healed"
  │                                              └ red? ─ revert ─► escalate
  └─ no ───────────────────────────────────────────────────────► escalate
                                                                   (GitHub issue)
```

Only `tests/e2e/selectors.ts` is ever written, and only one key at a time, and
only if the re-run passes. Assertion / timing / unknown failures are **never**
auto-edited — those are real regressions for a human.

## Files

| File | Role |
|---|---|
| `heal.ts` | Orchestrator + CLI entry point |
| `diagnose.ts` | Parse the Playwright JSON report, classify failures |
| `tools.ts` | Probe the DOM, rewrite/revert a selector, re-run a spec |
| `anthropic.ts` | Ask Claude (`claude-opus-5`) for the replacement selector |
| `escalate.ts` | File a GitHub Issue (Jira adapter behind `JIRA_ENABLED`) |
| `reporter.ts` | Markdown healing report → the Actions run summary |
| `config.ts` | Env-driven configuration |

## Run

```bash
# Plan only — no API calls, no writes, no escalation.
# (Automatic when ANTHROPIC_API_KEY is unset.)
npm run heal:dry

# Act: heal selectors, re-run, escalate the rest.
ANTHROPIC_API_KEY=sk-ant-... GITHUB_TOKEN=... GITHUB_REPOSITORY=owner/name npm run heal
```

It reads `test-results/results.json`, so run `npx playwright test` first (the CI
workflow does this for you). In CI, `nightly-heal.yml` runs the suite, invokes the
agent, opens a PR if a selector changed, and files issues for the rest.

## Configuration

| Env | Default | Meaning |
|---|---|---|
| `ANTHROPIC_API_KEY` | — | Claude key. Unset ⇒ dry run. |
| `HEAL_MODEL` | `claude-opus-5` | Model for the selector-fix reasoning. |
| `HEAL_MIN_CONFIDENCE` | `0.6` | Below this, escalate instead of applying. |
| `HEAL_MAX` | `5` | Max selectors healed per run. |
| `GITHUB_TOKEN` / `GITHUB_REPOSITORY` | from Actions | Escalation target. |
| `JIRA_ENABLED` + `JIRA_*` | off | Optional Jira adapter for parity with the reference project. |
| `BASE_URL` | local serve | Where to probe the DOM (matches the test target). |

## What it does NOT do

- It won't rewrite assertions or test logic — only selector strings.
- It won't touch anything outside `tests/e2e/selectors.ts`.
- It won't act below `HEAL_MIN_CONFIDENCE`; it escalates instead.
- Known-bug guards (`test.fail`) are expected failures and are ignored, so the
  agent never "heals" a documented product bug into a false green.
