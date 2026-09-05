/**
 * The engine courses and the corpus invariants that must hold for each.
 *
 * All three courses (devdojo, identity-dojo, js-dojo) are built from the SHARED
 * engine/, so an engine bug breaks all three at once — which is exactly why the
 * repo's own history warns about verifiers drifting from production. These
 * invariants run against each course's BUILT page and its real grader.
 *
 * The `*InPage` functions are executed by `page.evaluate`, so they must be
 * self-contained (no imports, no closure references) and rely only on the
 * globals the built app defines.
 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// __dirname (not import.meta.url): Playwright transpiles test-side files to CJS.
export const REPO_ROOT = path.resolve(__dirname, '..', '..');

export interface Course {
  name: string;
  /** Directory containing the course's build.js, relative to repo root ('.' for devdojo). */
  dir: string;
  /** Absolute path to the built, self-contained HTML. */
  distHtml: string;
  /** file:// URL Playwright can navigate to. */
  fileUrl: string;
}

export const COURSES: Course[] = (
  [
    { name: 'devdojo', dir: '.' },
    { name: 'identity-dojo', dir: 'identity-dojo' },
    { name: 'js-dojo', dir: 'js-dojo' },
  ] as Array<{ name: string; dir: string }>
).map((c) => {
  const distHtml = path.join(REPO_ROOT, c.dir, 'dist', 'index.html');
  return { ...c, distHtml, fileUrl: pathToFileURL(distHtml).href };
});

// Ambient globals defined by the built app (declared so the in-page fns typecheck).
declare const STREAMS: any[];
declare function localChecks(e: any, code: string): Array<{ desc: string; pass: boolean }>;

/** Every shipped solution must pass its own structural checks. Returns failures. */
export function solutionFailuresInPage(): string[] {
  const out: string[] = [];
  for (const s of STREAMS) {
    for (const l of s.lessons || []) {
      const list = Array.isArray(l.ex) ? l.ex : l.ex ? [l.ex] : [];
      for (const e of list) {
        if (typeof e.solution !== 'string' || !e.solution.trim()) continue;
        const res = localChecks(e, e.solution);
        const bad = res.filter((c) => !c.pass);
        if (bad.length) out.push(`${l.id}: ${bad.map((b) => b.desc).join(' | ')}`);
      }
    }
  }
  return out;
}

/** Quiz data must be structurally sound. Returns problems. */
export function quizProblemsInPage(): string[] {
  const out: string[] = [];
  for (const s of STREAMS) {
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
}
