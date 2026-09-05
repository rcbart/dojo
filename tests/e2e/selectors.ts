/**
 * Central selector registry for Dev Dojo.
 *
 * Every locator the tests use lives here, named by role rather than by markup.
 * Two reasons:
 *   1. Page objects and specs never hardcode a raw selector, so a markup change
 *      is a one-line fix in this file.
 *   2. This is the file the self-healing agent edits. When a selector stops
 *      resolving, the agent proposes a replacement for exactly one key here,
 *      re-runs the failing spec, and keeps the change only if it goes green.
 *
 * HEALER CONTRACT — do not reformat:
 *   - Keep one entry per line, exactly `key: 'selector',` (single quotes).
 *   - Keep all entries between the BEGIN/END markers below.
 * The agent's file editor relies on this shape (see agents/self-heal/tools.ts).
 * These target the `data-testid` hooks in engine/shell.html and engine/app.js —
 * stable, semantic handles that don't couple tests to incidental markup, and
 * that the healer prefers when proposing a replacement.
 */
export const selectors = {
  /* @healable:BEGIN */
  editor: '[data-testid="editor"]',
  runButton: '[data-testid="run-button"]',
  resetButton: '[data-testid="reset-button"]',
  solutionButton: '[data-testid="solution-button"]',
  hintButton: '[data-testid="hint-button"]',
  testResults: '[data-testid="test-results"]',
  consoleOutput: '[data-testid="console-output"]',
  nav: '[data-testid="nav"]',
  main: '[data-testid="main"]',
  header: '[data-testid="app-header"]',
  beltName: '[data-testid="belt-name"]',
  beltPct: '[data-testid="belt-pct"]',
  beltFill: '[data-testid="belt-fill"]',
  doneBanner: '[data-testid="done-banner"]',
  navToggle: '[data-testid="nav-toggle"]',
  /* @healable:END */
} as const;

export type SelectorKey = keyof typeof selectors;
