/**
 * The agent's hands: read the live DOM for candidate locators, rewrite exactly
 * one selector in the registry, re-run the failing spec, and revert on failure.
 * Every write is confined to tests/e2e/selectors.ts.
 */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { chromium } from '@playwright/test';
import { config } from './config';

export interface DomCandidate {
  tag: string;
  id?: string;
  role?: string;
  name?: string;
  text?: string;
  testId?: string;
  suggested: string; // a Playwright-ready locator string
}

/** Load the app and return stable-looking locator candidates for the LLM to pick from. */
export async function probeDom(appUrl: string): Promise<DomCandidate[]> {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    return await page.evaluate(() => {
      const out: any[] = [];
      const seen = new Set<string>();
      const push = (o: any) => { const k = o.suggested; if (!seen.has(k)) { seen.add(k); out.push(o); } };
      const roleOf = (el: Element) => el.getAttribute('role') || ({ BUTTON: 'button', A: 'link', INPUT: 'textbox', TEXTAREA: 'textbox', NAV: 'navigation', MAIN: 'main', HEADER: 'banner' } as any)[el.tagName] || '';
      const els = Array.from(document.querySelectorAll('[id],[data-testid],button,a,textarea,input,nav,main,header,[role]'));
      for (const el of els.slice(0, 400)) {
        const id = el.getAttribute('id') || undefined;
        const testId = el.getAttribute('data-testid') || undefined;
        const role = roleOf(el) || undefined;
        const name = (el.getAttribute('aria-label') || (el as HTMLElement).innerText || '').trim().slice(0, 40) || undefined;
        let suggested = '';
        if (testId) suggested = `[data-testid="${testId}"]`;
        else if (id) suggested = `#${id}`;
        else if (role && name) suggested = `role=${role}[name="${name}"]`;
        else continue;
        push({ tag: el.tagName.toLowerCase(), id, role, name, text: name, testId, suggested });
      }
      return out;
    });
  } finally {
    await browser.close();
  }
}

export function readSelectorsFile(): string {
  return fs.readFileSync(config.selectorsFile, 'utf8');
}

/** Replace the value of one registry key. Returns the previous file contents (for revert). */
export function applySelector(key: string, newValue: string): string {
  const prev = readSelectorsFile();
  const line = new RegExp(`^(\\s*)${key}:\\s*'[^']*',`, 'm');
  if (!line.test(prev)) throw new Error(`selector key not found or not in the expected shape: ${key}`);
  const next = prev.replace(line, `$1${key}: '${newValue.replace(/'/g, "\\'")}',`);
  fs.writeFileSync(config.selectorsFile, next);
  return prev;
}

export function revertSelectors(previousContents: string): void {
  fs.writeFileSync(config.selectorsFile, previousContents);
}

/**
 * Re-run one spec (optionally a single test by title); return true if it now
 * passes. `specFile` is a filename filter (e.g. "smoke.spec.ts"), which is how
 * Playwright's JSON report names it.
 */
export function rerunSpec(specFile: string, title?: string): boolean {
  const args = ['playwright', 'test', specFile];
  if (title) args.push('-g', title);
  args.push('--reporter=line');
  try {
    execFileSync('npx', args, { cwd: config.repoRoot, stdio: 'pipe', env: process.env });
    return true;
  } catch {
    return false;
  }
}
