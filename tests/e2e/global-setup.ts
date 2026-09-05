import { execFileSync } from 'node:child_process';
import path from 'node:path';

/**
 * Build every engine course once before the run, so the cross-course invariant
 * specs can load each course's self-contained HTML over file://. Kept
 * self-contained (no local imports); uses __dirname because Playwright
 * transpiles test-side files to CommonJS (import.meta is unavailable there).
 */
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const COURSE_DIRS = ['.', 'identity-dojo', 'js-dojo'];

export default function globalSetup(): void {
  for (const dir of COURSE_DIRS) {
    const cwd = path.join(REPO_ROOT, dir);
    try {
      execFileSync('node', ['build.js'], { cwd, stdio: 'pipe' });
    } catch (err) {
      throw new Error(`failed to build course in ${cwd}: ${(err as Error).message}`);
    }
  }
}
