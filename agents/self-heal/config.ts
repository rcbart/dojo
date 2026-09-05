/**
 * Configuration for the self-healing agent. Everything is env-driven so the
 * same code runs locally (dry) and in CI (live).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(here, '..', '..');

export const config = {
  repoRoot: REPO_ROOT,
  // The one file the agent is allowed to edit.
  selectorsFile: path.join(REPO_ROOT, 'tests', 'e2e', 'selectors.ts'),
  resultsFile: path.join(REPO_ROOT, 'test-results', 'results.json'),
  reportFile: path.join(REPO_ROOT, 'test-results', 'healing-report.md'),

  appUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 4321}/`,

  // Claude. Model default per the API guidance; overridable for cost tuning.
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  model: process.env.HEAL_MODEL || 'claude-opus-5',

  // GitHub escalation (defaults provided by Actions).
  githubToken: process.env.GITHUB_TOKEN || '',
  githubRepo: process.env.GITHUB_REPOSITORY || '', // "owner/name"
  githubApi: process.env.GITHUB_API_URL || 'https://api.github.com',

  // Optional Jira adapter (off by default; GitHub Issues is the primary target).
  jira: {
    enabled: process.env.JIRA_ENABLED === 'true',
    baseUrl: process.env.JIRA_BASE_URL || '',
    email: process.env.JIRA_EMAIL || '',
    token: process.env.JIRA_API_TOKEN || '',
    project: process.env.JIRA_PROJECT || '',
  },

  // Safety rails.
  minConfidence: Number(process.env.HEAL_MIN_CONFIDENCE || 0.6),
  maxHealsPerRun: Number(process.env.HEAL_MAX || 5),
};

/** Dry-run when explicitly asked, or when there's no API key to reason with. */
export function isDryRun(argv: string[]): boolean {
  return argv.includes('--dry-run') || !config.anthropicApiKey;
}
