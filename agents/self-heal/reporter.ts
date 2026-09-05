/**
 * Human-readable healing report → the GitHub Actions run summary and a markdown
 * artifact. No side effects beyond writing files / appending to the summary.
 */
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config';

export interface HealOutcome {
  title: string;
  file: string;
  category: string;
  action: 'healed' | 'escalated' | 'skipped' | 'would-heal' | 'would-escalate';
  detail: string;
}

export function renderReport(outcomes: HealOutcome[], dryRun: boolean): string {
  const icon: Record<HealOutcome['action'], string> = {
    healed: '🟢',
    escalated: '🟠',
    skipped: '⚪',
    'would-heal': '🔵',
    'would-escalate': '🔵',
  };
  const lines: string[] = [];
  lines.push(`# Self-healing report${dryRun ? ' (dry run)' : ''}`);
  lines.push('');
  if (outcomes.length === 0) {
    lines.push('✅ No genuine failures to act on — the suite is green (known-bug guards excluded).');
    return lines.join('\n');
  }
  lines.push('| | Test | Category | Action | Detail |');
  lines.push('|---|---|---|---|---|');
  for (const o of outcomes) {
    lines.push(`| ${icon[o.action]} | ${escapeCell(o.title)} | ${o.category} | ${o.action} | ${escapeCell(o.detail)} |`);
  }
  lines.push('');
  const healed = outcomes.filter((o) => o.action === 'healed').length;
  const escalated = outcomes.filter((o) => o.action.includes('escalate')).length;
  lines.push(`**${healed} healed · ${escalated} escalated · ${outcomes.length} total**`);
  return lines.join('\n');
}

function escapeCell(s: string): string {
  return s.replace(/\|/g, '\\|').replace(/\n/g, ' ').slice(0, 160);
}

export function publish(report: string): void {
  fs.mkdirSync(path.dirname(config.reportFile), { recursive: true });
  fs.writeFileSync(config.reportFile, report);
  const summary = process.env.GITHUB_STEP_SUMMARY;
  if (summary) fs.appendFileSync(summary, report + '\n');
  console.log('\n' + report + '\n');
}
