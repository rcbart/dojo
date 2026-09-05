/**
 * Parse the Playwright JSON report and classify each GENUINE failure.
 *
 * `test.fail()` known-bug guards are expected failures (spec.ok === true) and
 * are deliberately ignored — the agent only reacts to real regressions.
 */
import fs from 'node:fs';
import { selectors } from '../../tests/e2e/selectors';

export type Category = 'selector' | 'timing' | 'assertion' | 'unknown';

export interface Failure {
  title: string;
  file: string;
  line: number;
  error: string;
  category: Category;
  /** For selector failures: the registry key whose value appears in the error. */
  selectorKey?: string;
  oldSelector?: string;
}

interface PwTestResult { status?: string; error?: { message?: string }; errors?: Array<{ message?: string }> }
interface PwTest { results?: PwTestResult[] }
interface PwSpec { title: string; ok: boolean; file?: string; line?: number; tests?: PwTest[] }
interface PwSuite { file?: string; specs?: PwSpec[]; suites?: PwSuite[] }
interface PwReport { suites?: PwSuite[] }

function collectSpecs(suite: PwSuite, acc: PwSpec[]): void {
  for (const s of suite.specs || []) acc.push({ ...s, file: s.file || suite.file });
  for (const child of suite.suites || []) collectSpecs(child, acc);
}

function classify(error: string): Category {
  const e = error.toLowerCase();
  const looksSelector =
    /waiting for locator|locator resolved to 0|strict mode violation|element is not|no element matches|to be visible/.test(e);
  const looksTimeout = /timeout .* exceeded|timed out/.test(e);
  if (looksSelector) return 'selector';
  if (/expect\(|tobe|toequal|tocontain|received|assertionerror/.test(e)) return 'assertion';
  if (looksTimeout) return 'timing';
  return 'unknown';
}

/** If the error text contains one of our registry selector strings, name the key. */
function matchSelector(error: string): { key: string; value: string } | undefined {
  for (const [key, value] of Object.entries(selectors) as Array<[string, string]>) {
    if (error.includes(`'${value}'`) || error.includes(`"${value}"`) || error.includes(` ${value} `) || error.includes(`(${value})`)) {
      return { key, value };
    }
  }
  return undefined;
}

export function diagnose(resultsFile: string): Failure[] {
  if (!fs.existsSync(resultsFile)) return [];
  const report = JSON.parse(fs.readFileSync(resultsFile, 'utf8')) as PwReport;
  const specs: PwSpec[] = [];
  for (const s of report.suites || []) collectSpecs(s, specs);

  const failures: Failure[] = [];
  for (const spec of specs) {
    if (spec.ok) continue; // passed, or an expected (known-bug) failure — skip.
    const msgs: string[] = [];
    for (const t of spec.tests || []) {
      for (const r of t.results || []) {
        if (r.error?.message) msgs.push(r.error.message);
        for (const e of r.errors || []) if (e.message) msgs.push(e.message);
      }
    }
    const error = msgs.join('\n');
    const category = classify(error);
    const hit = category === 'selector' ? matchSelector(error) : undefined;
    failures.push({
      title: spec.title,
      file: spec.file || '',
      line: spec.line || 0,
      error,
      category,
      selectorKey: hit?.key,
      oldSelector: hit?.value,
    });
  }
  return failures;
}
