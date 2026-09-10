/**
 * Central selector registry for Dev Dojo.
 *
 * Every locator the tests use lives here, named by role rather than by markup,
 * so page objects and specs never hardcode a raw selector and a markup change is
 * a one-line fix. Entries target the `data-testid` hooks added to
 * engine/shell.html and engine/app.js — stable, semantic handles that don't
 * couple the tests to incidental ids or classes.
 */
export const selectors = {
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
} as const;

export type SelectorKey = keyof typeof selectors;
