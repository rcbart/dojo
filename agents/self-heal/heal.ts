/**
 * Self-healing agent — orchestrator.
 *
 * Flow (a code-controlled loop; Claude reasons about each selector fix):
 *   1. Read the Playwright JSON report and diagnose GENUINE failures
 *      (test.fail known-bug guards are expected failures and are ignored).
 *   2. For each selector failure: read live DOM candidates, ask Claude for a
 *      replacement, rewrite that one key in the registry, re-run the spec.
 *      Keep the fix only if the spec goes green; otherwise revert and escalate.
 *   3. Everything else (assertion / timing / unknown, or a heal that didn't
 *      stick) is escalated to GitHub Issues.
 *   4. Write a healing report to the run summary.
 *
 * Dry run (--dry-run, or no ANTHROPIC_API_KEY): diagnose and print the plan;
 * no DOM reasoning call, no file writes, no escalation.
 *
 * Usage:  tsx agents/self-heal/heal.ts [path/to/results.json] [--dry-run]
 */
import { config, isDryRun } from './config';
import { diagnose, type Failure } from './diagnose';
import { probeDom, applySelector, revertSelectors, rerunSpec, readSelectorsFile } from './tools';
import { proposeSelectorFix } from './anthropic';
import { escalate } from './escalate';
import { renderReport, publish, type HealOutcome } from './reporter';

async function healSelector(f: Failure, outcomes: HealOutcome[]): Promise<void> {
  if (!f.selectorKey || !f.oldSelector) {
    const r = await escalate(f, 'selector failure, but no registry key matched the error');
    outcomes.push({ title: f.title, file: f.file, category: f.category, action: 'escalated', detail: escalationDetail(r) });
    return;
  }

  const candidates = await probeDom(config.appUrl);
  let fix;
  try {
    fix = await proposeSelectorFix({ key: f.selectorKey, oldSelector: f.oldSelector, errorExcerpt: f.error, candidates });
  } catch (err) {
    const r = await escalate(f, `model could not propose a fix: ${(err as Error).message}`);
    outcomes.push({ title: f.title, file: f.file, category: f.category, action: 'escalated', detail: escalationDetail(r) });
    return;
  }

  if (fix.confidence < config.minConfidence || !fix.newSelector || fix.newSelector === f.oldSelector) {
    const r = await escalate(f, `low-confidence fix (${fix.confidence}); proposed ${fix.newSelector || '∅'}`);
    outcomes.push({ title: f.title, file: f.file, category: f.category, action: 'escalated', detail: escalationDetail(r) });
    return;
  }

  const backup = applySelector(f.selectorKey, fix.newSelector);
  if (rerunSpec(f.file, f.title)) {
    outcomes.push({
      title: f.title, file: f.file, category: f.category, action: 'healed',
      detail: `${f.selectorKey}: '${f.oldSelector}' → '${fix.newSelector}' (conf ${fix.confidence}). ${fix.rationale}`.slice(0, 300),
    });
  } else {
    revertSelectors(backup);
    const r = await escalate(f, `proposed '${fix.newSelector}' did not fix the spec; reverted`);
    outcomes.push({ title: f.title, file: f.file, category: f.category, action: 'escalated', detail: escalationDetail(r) });
  }
}

function escalationDetail(r: { target: string; ref?: string; error?: string }): string {
  if (r.ref) return `filed ${r.target} ${r.ref}`;
  return `escalation ${r.target} failed: ${r.error || 'unknown'}`;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const dry = isDryRun(argv);
  const resultsFile = argv.find((a) => a.endsWith('.json')) || config.resultsFile;

  const failures = diagnose(resultsFile);
  const outcomes: HealOutcome[] = [];

  if (failures.length === 0) {
    publish(renderReport([], dry));
    return;
  }

  if (dry) {
    for (const f of failures) {
      const action = f.category === 'selector' && f.selectorKey ? 'would-heal' : 'would-escalate';
      const detail = f.category === 'selector'
        ? (f.selectorKey ? `would repair key '${f.selectorKey}' ('${f.oldSelector}')` : 'selector failure, no key matched — would escalate')
        : `would file a ${f.category} issue`;
      outcomes.push({ title: f.title, file: f.file, category: f.category, action, detail });
    }
    publish(renderReport(outcomes, true));
    console.log('(dry run — set ANTHROPIC_API_KEY and drop --dry-run to act)');
    return;
  }

  let healBudget = config.maxHealsPerRun;
  for (const f of failures) {
    if (f.category === 'selector' && healBudget > 0) {
      healBudget--;
      await healSelector(f, outcomes);
    } else {
      const r = await escalate(f, f.category === 'selector' ? 'heal budget exhausted' : `${f.category} failures are not auto-healed`);
      outcomes.push({ title: f.title, file: f.file, category: f.category, action: 'escalated', detail: escalationDetail(r) });
    }
  }

  // Leave the registry as the last successful heal set it; note if it changed.
  const changed = readSelectorsFile();
  void changed;
  publish(renderReport(outcomes, false));
}

main().catch((err) => {
  console.error('self-heal crashed:', err);
  process.exit(1);
});
