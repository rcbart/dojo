import { test, expect } from './fixtures';
import { solutionFailuresInPage, quizProblemsInPage } from './invariants';

/**
 * Engine-level guards for the served devdojo build. The corpus invariants
 * (solutions pass their own grader; quiz soundness) are the shared functions in
 * invariants.ts — the SAME checks courses.invariants.spec.ts runs across all
 * three courses — so devdojo is covered both through the served page here and
 * across courses there.
 */

test.describe('engine · corpus invariants (must pass)', () => {
  test('every shipped exercise solution passes its own structural checks', async ({ page }) => {
    const failures = await page.evaluate(solutionFailuresInPage);
    expect(failures, `these solutions fail their own grader:\n${failures.join('\n')}`).toEqual([]);
  });

  test('every quiz is structurally sound (answer index, options, whyWrong alignment)', async ({ page }) => {
    const problems = await page.evaluate(quizProblemsInPage);
    expect(problems, `quiz data problems:\n${problems.join('\n')}`).toEqual([]);
  });

  test('shuffleQuiz keeps the correct answer and every whyWrong aligned', async ({ page }) => {
    const broken = await page.evaluate(() => {
      const qs: any[] = [];
      // @ts-expect-error global
      for (const s of STREAMS as any[]) for (const l of s.lessons || []) for (const q of l.quiz || []) qs.push(q);
      let answerMismatch = 0, whyWrongMismatch = 0;
      for (let i = 0; i < 3000; i++) {
        const q = qs[i % qs.length];
        // @ts-expect-error global
        const sh = shuffleQuiz([q])[0];
        if (sh.options[sh.answer] !== q.options[q.answer]) answerMismatch++;
        if (Array.isArray(q.whyWrong)) {
          for (let k = 0; k < sh.options.length; k++) {
            const orig = q.options.indexOf(sh.options[k]);
            if (orig >= 0 && (q.whyWrong[orig] || '') !== (sh.whyWrong[k] || '')) whyWrongMismatch++;
          }
        }
      }
      return { answerMismatch, whyWrongMismatch };
    });
    expect(broken.answerMismatch).toBe(0);
    expect(broken.whyWrongMismatch).toBe(0);
  });
});

test.describe('engine · known-bug guards (delete when they pass)', () => {
  // F01 residual — exercises whose lang has no comment-stripping rule (text, http)
  // still accept a wholly commented-out submission.
  for (const [lang, id] of [['text', 'gnr2'], ['http', 'web1']] as const) {
    test(`F01-residual: a commented-out ${lang} answer (${id}) is rejected`, async ({ page }) => {
      test.fail(true, `F01 residual: '${lang}' has no checkOpts entry, so the inert tripwire never runs.`);
      const accepted = await page.evaluate((lessonId) => {
        let e: any = null;
        // @ts-expect-error global
        for (const s of STREAMS as any[]) for (const l of s.lessons || []) if (l.id === lessonId) e = Array.isArray(l.ex) ? l.ex[0] : l.ex;
        if (!e) return null;
        const commented = e.solution.split('\n').map((x: string) => '# ' + x).join('\n');
        // @ts-expect-error global
        const res = localChecks(e, commented);
        return res.length > 0 && res.every((c: any) => c.pass);
      }, id);
      expect(accepted, `${id} exists`).not.toBeNull();
      // Correct behavior: a fully commented-out submission is rejected.
      expect(accepted).toBe(false);
    });
  }
});
