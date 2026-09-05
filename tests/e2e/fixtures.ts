import { test as base, expect } from '@playwright/test';
import { DojoApp } from './pages/DojoApp';
import { selectors } from './selectors';
import { APP_URL } from '../../playwright.config';

/**
 * Fixtures:
 *   - `page` is overridden to navigate to the app and wait for first paint, so
 *     every spec (whether it uses `page` or `dojo`) starts on the loaded app.
 *     Specs that only need `request` (e.g. header checks) never trigger this.
 *   - `dojo` is the page object over that already-navigated page.
 */
export const test = base.extend<{ dojo: DojoApp }>({
  page: async ({ page }, use) => {
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector(selectors.nav, { state: 'visible' });
    await use(page);
  },
  dojo: async ({ page }, use) => {
    await use(new DojoApp(page));
  },
});

export { expect };
