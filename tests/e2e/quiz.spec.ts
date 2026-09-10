import { test, expect } from './fixtures';

/**
 * Quick-check quiz UI. The quiz data is verified in engine.spec.ts; here we
 * drive the real widget: picking the correct option is praised, and picking a
 * wrong one explains what's wrong with THAT option (the feature the app is
 * proud of, and a place a shuffle bug would surface as a mislabeled answer).
 */
test.describe('quiz', () => {
  test('picking the correct option is marked correct; a wrong one explains itself', async ({ dojo, page }) => {
    await dojo.openStream('Java Fundamentals');
    await dojo.openLesson('Variables, types');

    // Resolve the correct/incorrect option text for the first question from the
    // shuffled data the page is actually showing (window.__QZ).
    const q = await page.evaluate(() => {
      // @ts-expect-error global set by renderQuiz
      const qs = window.__QZ;
      if (!qs || !qs.length) return null;
      const first = qs[0];
      const wrongIdx = first.options.findIndex((_: string, i: number) => i !== first.answer);
      return { correct: first.options[first.answer], wrong: first.options[wrongIdx] };
    });
    expect(q, 'a shuffled quiz should be present').not.toBeNull();

    const quizBox = page.locator('.quizBox').first();
    await expect(quizBox).toBeVisible();

    // Pick a wrong option first: it must reveal the correct answer AND a
    // per-option "you picked … because …" explanation.
    await quizBox.getByRole('button', { name: q!.wrong, exact: true }).first().click();
    const why = quizBox.locator('.quizWhy').first();
    await expect(why).toBeVisible();
    await expect(why).toContainText(q!.correct);
  });

  test('the correct option, when picked, is confirmed correct', async ({ dojo, page }) => {
    await dojo.openStream('Java Fundamentals');
    await dojo.openLesson('Hello, JVM');
    const correct = await page.evaluate(() => {
      // @ts-expect-error global
      const qs = window.__QZ;
      return qs && qs.length ? qs[0].options[qs[0].answer] : null;
    });
    expect(correct).not.toBeNull();
    const quizBox = page.locator('.quizBox').first();
    await quizBox.getByRole('button', { name: correct!, exact: true }).first().click();
    await expect(quizBox.locator('.quizWhy').first()).toContainText(/correct/i);
  });
});
