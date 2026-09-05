import { test, expect } from './fixtures';

/**
 * Engine-level guards, run inside the real page against the app's own global
 * functions (localChecks, STREAMS, the quiz data). These are cheap and cover
 * the WHOLE corpus at once, so they catch content/grader drift that a handful
 * of UI cases would miss — directly addressing the verifier-drift the repo's
 * own CI comment describes.
 */

test.describe('engine · corpus invariants (must pass)', () => {
  test('every shipped exercise solution passes its own structural checks', async ({ page }) => {
    const failures = await page.evaluate(() => {
      const out: string[] = [];
      // @ts-expect-error globals from the built app
      for (const s of STREAMS as any[]) {
        for (const l of s.lessons || []) {
          const list = Array.isArray(l.ex) ? l.ex : l.ex ? [l.ex] : [];
          for (const e of list) {
            if (typeof e.solution !== 'string' || !e.solution.trim()) continue;
            // @ts-expect-error global
            const res = localChecks(e, e.solution);
            const bad = res.filter((c: any) => !c.pass);
            if (bad.length) out.push(`${l.id}: ${bad.map((b: any) => b.desc).join(' | ')}`);
          }
        }
      }
      return out;
    });
    expect(failures, `these solutions fail their own grader:\n${failures.join('\n')}`).toEqual([]);
  });

  test('every quiz is structurally sound (answer index, options, whyWrong alignment)', async ({ page }) => {
    const problems = await page.evaluate(() => {
      const out: string[] = [];
      // @ts-expect-error global
      for (const s of STREAMS as any[]) {
        for (const l of s.lessons || []) {
          (l.quiz || []).forEach((q: any, qi: number) => {
            const n = (q.options || []).length;
            const tag = `${l.id} Q${qi + 1}`;
            if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= n) out.push(`${tag}: answer index ${q.answer} out of range`);
            if (n < 2) out.push(`${tag}: fewer than 2 options`);
            const norm = (q.options || []).map((o: string) => String(o).trim().toLowerCase());
            norm.forEach((o: string, i: number) => { if (norm.indexOf(o) !== i) out.push(`${tag}: duplicate option "${q.options[i]}"`); });
            if (Array.isArray(q.whyWrong) && q.whyWrong.length !== n) out.push(`${tag}: whyWrong length ${q.whyWrong.length} != options ${n}`);
            if (Array.isArray(q.whyWrong) && String(q.whyWrong[q.answer] || '').trim()) out.push(`${tag}: whyWrong[answer] should be empty`);
          });
        }
      }
      return out;
    });
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
