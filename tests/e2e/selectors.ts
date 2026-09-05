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
 * These map to real ids in engine/shell.html and engine/app.js.
 */
export const selectors = {
  /* @healable:BEGIN */
  editor: '#ed',
  runButton: '#btnRun',
  resetButton: '#btnReset',
  solutionButton: '#btnSol',
  hintButton: '#btnHint',
  testResults: '#io-tests',
  consoleOutput: '#io-console',
  nav: '#nav',
  main: '#main',
  header: 'header',
  beltName: '#beltName',
  beltPct: '#beltPct',
  beltFill: '#beltFill',
  doneBanner: '#doneBanner',
  navToggle: '#navToggle',
  /* @healable:END */
} as const;

export type SelectorKey = keyof typeof selectors;
