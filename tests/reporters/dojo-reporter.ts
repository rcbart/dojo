/**
 * Dev Dojo reporter — a status dashboard, not just a pass count.
 *
 * The suite tracks product bugs as `test.fail()` guards, so the interesting
 * signal is the STATE OF EACH FINDING, which the built-in reporters flatten:
 *
 *   ⚠️ live (guarded)     a known-bug guard failed as expected — bug still there
 *   ✅ fixed (guarded)    a fixed-bug invariant passed — regression-protected
 *   🎉 newly fixed        a guard UNEXPECTEDLY passed — the bug is fixed; delete the guard
 *   ❌ regression         a normal test failed
 *
 * A finding id (F01, F02a, F03, F05-residual, N1, …) is parsed from the test
 * title. Output: a console summary, a Markdown report (also appended to the
 * GitHub Actions run summary), and machine-readable findings.json for trends.
 *
 * Registered alongside list/json/html in playwright.config.ts; it changes no
 * exit codes — Playwright still fails the run on a regression or a newly-passing
 * guard, which is exactly when you want a red build.
 */
import type { Reporter, TestCase, FullResult, Suite } from '@playwright/test/reporter';
import fs from 'node:fs';
import path from 'node:path';

type State = 'pass' | 'regression' | 'known-bug-live' | 'newly-fixed' | 'flaky' | 'skipped';

interface Row {
  id: string | null;
  title: string;
  file: string;
  state: State;
}

interface Totals {
  total: number;
  pass: number;
  regression: number;
  knownBug: number;
  newlyFixed: number;
  flaky: number;
  skipped: number;
}

const FINDING_RE = /\b(F\d+[a-z]?(?:-residual)?|N\d+)\b/;

const FINDING_LABEL: Record<string, string> = {
  'known-bug-live': '⚠️ live (guarded)',
  pass: '✅ fixed (guarded)',
  'newly-fixed': '🎉 newly fixed — delete the guard',
  regression: '❌ regression',
  flaky: '🌀 flaky',
  skipped: '⚪ skipped',
};

export default class DojoReporter implements Reporter {
  private root!: Suite;
  private outDir = 'test-results';

  onBegin(_config: unknown, suite: Suite): void {
    this.root = suite;
  }

  private classify(test: TestCase): State {
    const outcome = test.outcome(); // 'skipped' | 'expected' | 'unexpected' | 'flaky'
    const expectedFail = test.expectedStatus === 'failed';
    if (outcome === 'skipped') return 'skipped';
    if (outcome === 'flaky') return 'flaky';
    if (expectedFail) return outcome === 'expected' ? 'known-bug-live' : 'newly-fixed';
    return outcome === 'expected' ? 'pass' : 'regression';
  }

  async onEnd(result: FullResult): Promise<void> {
    const rows: Row[] = this.root.allTests().map((t) => ({
      id: (t.title.match(FINDING_RE) || [])[1] ?? null,
      title: t.title,
      file: path.basename(t.location.file),
      state: this.classify(t),
    }));

    const count = (s: State) => rows.filter((r) => r.state === s).length;
    const totals = {
      total: rows.length,
      pass: count('pass'),
      regression: count('regression'),
      knownBug: count('known-bug-live'),
      newlyFixed: count('newly-fixed'),
      flaky: count('flaky'),
      skipped: count('skipped'),
    };

    // Findings table: one row per distinct finding id (dedupe, keep worst state).
    const severityRank: Record<State, number> = { regression: 0, 'newly-fixed': 1, 'known-bug-live': 2, flaky: 3, pass: 4, skipped: 5 };
    const byFinding = new Map<string, Row>();
    for (const r of rows) {
      if (!r.id) continue;
      const cur = byFinding.get(r.id);
      if (!cur || severityRank[r.state] < severityRank[cur.state]) byFinding.set(r.id, r);
    }
    const findings = [...byFinding.values()].sort((a, b) => severityRank[a.state] - severityRank[b.state] || a.id!.localeCompare(b.id!));

    const md = this.renderMarkdown(totals, findings, result.status);
    fs.mkdirSync(this.outDir, { recursive: true });
    fs.writeFileSync(path.join(this.outDir, 'report.md'), md);
    fs.writeFileSync(
      path.join(this.outDir, 'findings.json'),
      JSON.stringify({ generatedAt: new Date().toISOString(), runStatus: result.status, totals, findings: findings.map((f) => ({ id: f.id, state: f.state, title: f.title })) }, null, 2),
    );
    const summary = process.env.GITHUB_STEP_SUMMARY;
    if (summary) fs.appendFileSync(summary, md + '\n');

    this.printConsole(totals, findings, result.status);
  }

  private renderMarkdown(t: Totals, findings: Row[], status: string): string {
    const fc = findingCounts(findings);
    const lines: string[] = [];
    lines.push(`# Dev Dojo — E2E report`);
    lines.push('');
    // Health is test-level; the findings line is finding-level (deduped by id).
    lines.push(`**Run \`${status}\`** — health: ${t.regression} regressions · ${t.flaky} flaky · ${t.skipped} skipped`);
    lines.push('');
    lines.push(`**Findings:** ${fc.live} live · ${fc.fixed} fixed & guarded · ${fc.newlyFixed} newly fixed`);
    if (t.regression > 0) lines.push('', `> ❌ **${t.regression} regression(s)** — a normal test failed. This is a real break.`);
    if (fc.newlyFixed > 0) lines.push('', `> 🎉 **${fc.newlyFixed} finding(s) now pass their guard** — the bug is fixed. Delete the \`test.fail()\` annotation to close it.`);
    lines.push('');
    if (findings.length) {
      lines.push('## Findings status');
      lines.push('');
      lines.push('| Finding | Status | Test | File |');
      lines.push('|---|---|---|---|');
      for (const f of findings) {
        lines.push(`| \`${f.id}\` | ${FINDING_LABEL[f.state]} | ${cell(f.title)} | ${f.file} |`);
      }
    } else {
      lines.push('_No finding-tagged tests in this run._');
    }
    return lines.join('\n');
  }

  private printConsole(t: Totals, findings: Row[], status: string): void {
    const live = findings.filter((r) => r.state === 'known-bug-live').map((r) => r.id);
    const fixed = findings.filter((r) => r.state === 'newly-fixed').map((r) => r.id);
    // eslint-disable-next-line no-console
    console.log(
      `\n📋 Dev Dojo report — run ${status} | findings: ${live.length} live` +
        `${live.length ? ' [' + live.join(', ') + ']' : ''}, ${fixed.length} newly fixed` +
        `${fixed.length ? ' [' + fixed.join(', ') + ' → remove guard]' : ''} | ` +
        `health: ${t.regression} regressions, ${t.flaky} flaky, ${t.skipped} skipped\n`,
    );
  }
}

function findingCounts(findings: Row[]): { live: number; fixed: number; newlyFixed: number; regression: number } {
  const n = (s: State) => findings.filter((r) => r.state === s).length;
  return { live: n('known-bug-live'), fixed: n('pass'), newlyFixed: n('newly-fixed'), regression: n('regression') };
}

function cell(s: string): string {
  return s.replace(/\|/g, '\\|').slice(0, 90);
}
