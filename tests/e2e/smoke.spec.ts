import { test, expect } from './fixtures';
import { selectors } from './selectors';

/**
 * Smoke suite — must always be green. If any of these break, the app didn't
 * load or a core selector drifted, and nothing else is worth running.
 */
test.describe('smoke', () => {
  test('app loads with the core chrome', async ({ dojo, page }) => {
    await expect(page).toHaveTitle(/Dojo/i);
    await expect(dojo.nav).toBeVisible();
    await expect(page.locator(selectors.header)).toBeVisible();
    await expect(page.locator(selectors.main)).toBeVisible();
  });

  test('the sidebar renders a substantial set of streams', async ({ dojo }) => {
    // The course ships ~29 streams; guard against a data/render regression that
    // silently drops most of them.
    expect(await dojo.streamCount()).toBeGreaterThanOrEqual(15);
  });

  test('opening a lesson reveals the editor and run button', async ({ dojo, page }) => {
    await dojo.openStream('Java Fundamentals');
    await dojo.openLesson('Variables, types');
    await expect(dojo.editor).toBeVisible();
    await expect(page.locator(selectors.runButton)).toBeVisible();
  });

  test('no uncaught console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.reload({ waitUntil: 'networkidle' });
    expect(errors, errors.join('\n')).toHaveLength(0);
  });
});
