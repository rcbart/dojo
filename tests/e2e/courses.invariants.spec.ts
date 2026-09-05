import { test, expect } from '@playwright/test';
import { COURSES, solutionFailuresInPage, quizProblemsInPage } from './invariants';

/**
 * Corpus invariants across ALL engine courses (devdojo, identity-dojo, js-dojo).
 * They share engine/, so these guard the shared runtime: a grader change that
 * makes a shipped solution fail its own checks, or corrupts quiz data, fails
 * here for whichever course it touches — the drift the repo's CI comment warns
 * about, caught against production behavior rather than a reimplementation.
 *
 * Uses the base `test` (not the app fixture) so each spec loads its own course
 * over file://.
 */
for (const course of COURSES) {
  test.describe(`course: ${course.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(course.fileUrl, { waitUntil: 'domcontentloaded' });
      // STREAMS/localChecks are top-level `const`s in the built script — visible
      // as bare identifiers to injected code, but NOT properties of globalThis.
      // typeof on a bare identifier is safe even before it's defined.
      await page.waitForFunction("typeof STREAMS !== 'undefined' && typeof localChecks === 'function'");
    });

    test('every shipped solution passes its own grader', async ({ page }) => {
      const failures = await page.evaluate(solutionFailuresInPage);
      expect(failures, `${course.name}: solutions failing their own grader:\n${failures.join('\n')}`).toEqual([]);
    });

    test('quiz data is structurally sound', async ({ page }) => {
      const problems = await page.evaluate(quizProblemsInPage);
      expect(problems, `${course.name}: quiz problems:\n${problems.join('\n')}`).toEqual([]);
    });
  });
}
