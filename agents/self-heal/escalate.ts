/**
 * Escalation for failures the agent can't (or shouldn't) auto-fix.
 *
 * Primary target: GitHub Issues, using the GITHUB_TOKEN already present in
 * Actions. A Jira adapter is included behind a config flag for parity with the
 * reference project, but GitHub is the default because this repo is GitHub-native.
 */
import { config } from './config';
import type { Failure } from './diagnose';

export interface EscalationResult { target: 'github' | 'jira' | 'none'; ref?: string; error?: string }

function issueBody(f: Failure, note: string): string {
  return [
    `**Auto-filed by the self-healing agent.**`,
    '',
    `- **Test:** \`${f.title}\``,
    `- **Location:** \`${f.file}:${f.line}\``,
    `- **Category:** ${f.category}`,
    note ? `- **Why not auto-healed:** ${note}` : '',
    '',
    '```',
    f.error.slice(0, 3000),
    '```',
  ].filter(Boolean).join('\n');
}

async function fileGithubIssue(f: Failure, note: string): Promise<EscalationResult> {
  if (!config.githubToken || !config.githubRepo) return { target: 'none', error: 'no GitHub token/repo' };
  const url = `${config.githubApi}/repos/${config.githubRepo}/issues`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.githubToken}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      title: `E2E failure: ${f.title}`,
      body: issueBody(f, note),
      labels: ['e2e-failure', `heal:${f.category}`],
    }),
  });
  if (!res.ok) return { target: 'github', error: `${res.status} ${await res.text()}` };
  const data = (await res.json()) as { html_url?: string };
  return { target: 'github', ref: data.html_url };
}

async function fileJiraIssue(f: Failure, note: string): Promise<EscalationResult> {
  const { baseUrl, email, token, project } = config.jira;
  if (!baseUrl || !email || !token || !project) return { target: 'none', error: 'jira not configured' };
  const auth = Buffer.from(`${email}:${token}`).toString('base64');
  const res = await fetch(`${baseUrl}/rest/api/3/issue`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        project: { key: project },
        issuetype: { name: 'Bug' },
        summary: `E2E failure: ${f.title}`.slice(0, 250),
        description: issueBody(f, note),
      },
    }),
  });
  if (!res.ok) return { target: 'jira', error: `${res.status} ${await res.text()}` };
  const data = (await res.json()) as { key?: string };
  return { target: 'jira', ref: data.key };
}

export async function escalate(f: Failure, note: string): Promise<EscalationResult> {
  if (config.jira.enabled) {
    const j = await fileJiraIssue(f, note);
    if (j.target !== 'none') return j;
  }
  return fileGithubIssue(f, note);
}
