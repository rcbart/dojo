import { type Page, type Locator, expect } from '@playwright/test';
import { selectors } from '../selectors';
import { APP_URL } from '../../../playwright.config';

/**
 * Page object for the Dev Dojo single-page app.
 *
 * Interactions mirror what a learner actually does — click the stream header,
 * click the lesson, type in the editor, press Run — so the specs exercise the
 * real grader end to end rather than reimplementing it (the repo's own
 * content verifiers drifted from production by reimplementing grading; these
 * tests can't, because they read the grader's actual on-screen verdict).
 */
export class DojoApp {
  readonly page: Page;
  readonly editor: Locator;
  readonly runButton: Locator;
  readonly resetButton: Locator;
  readonly testResults: Locator;
  readonly nav: Locator;
  readonly beltPct: Locator;

  constructor(page: Page) {
    this.page = page;
    this.editor = page.locator(selectors.editor);
    this.runButton = page.locator(selectors.runButton);
    this.resetButton = page.locator(selectors.resetButton);
    this.testResults = page.locator(selectors.testResults);
    this.nav = page.locator(selectors.nav);
    this.beltPct = page.locator(selectors.beltPct);
  }

  async goto(): Promise<void> {
    await this.page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await expect(this.nav).toBeVisible();
  }

  /** Expand a stream (top-level group) in the sidebar by its visible title. */
  async openStream(titleFragment: string): Promise<void> {
    const item = this.nav.getByText(new RegExp(escapeRe(titleFragment)), { exact: false }).first();
    await item.click();
  }

  /** Open a lesson by its sidebar label, e.g. "3. Variables, types". */
  async openLesson(labelFragment: string): Promise<void> {
    const link = this.nav.getByText(new RegExp(escapeRe(labelFragment)), { exact: false }).first();
    await link.click();
    // Every lesson renders a heading into <main>; wait for that rather than the
    // editor, since not all lessons have an exercise editor.
    await this.page.locator(`${selectors.main} h1, ${selectors.main} h2`).first().waitFor({ state: 'visible' });
  }

  /** Number of streams rendered in the nav (top-level `.streamHd` groups). */
  async streamCount(): Promise<number> {
    return this.nav.locator('.streamHd').count();
  }

  /** Replace the editor contents. Uses fill() — the grader reads .value at run time. */
  async setEditor(code: string): Promise<void> {
    await expect(this.editor).toBeVisible();
    await this.editor.fill(code);
  }

  async run(): Promise<void> {
    await this.runButton.click();
    // The grader is synchronous for structural/SQL/JS paths; wait for a verdict row.
    await expect(this.testResults).toBeVisible();
  }

  /** The plain text of the structural/execution results panel after a run. */
  async resultsText(): Promise<string> {
    return (await this.testResults.innerText()).trim();
  }

  /**
   * Whether the last run marked the exercise/lesson complete. The app shows a
   * "Lesson complete" banner and flips the console/tests marker green.
   */
  async isMarkedComplete(): Promise<boolean> {
    const banner = this.page.getByText(/Lesson complete/i);
    return (await banner.count()) > 0 && (await banner.first().isVisible());
  }

  /** Belt percentage from the header, as an integer (e.g. 3 for "3%"). */
  async beltPercent(): Promise<number> {
    const t = (await this.beltPct.innerText()).replace('%', '').trim();
    return Number.parseInt(t, 10) || 0;
  }

  /**
   * Run a submission against the currently-open exercise and report the grader's
   * verdict as a boolean: true = every check passed (accepted), false = rejected.
   * Reads the on-screen ✔/✘ rows, so it reflects the real grader exactly.
   */
  async gradeVerdict(code: string): Promise<{ accepted: boolean; text: string }> {
    await this.setEditor(code);
    await this.run();
    const text = await this.resultsText();
    // A run is "accepted" when a completion signal is present and no ✘ rows remain.
    const hasFail = /✘/.test(text);
    const complete = await this.isMarkedComplete();
    return { accepted: complete || (!hasFail && /✔/.test(text)), text };
  }
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
