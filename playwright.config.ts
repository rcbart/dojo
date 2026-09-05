import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for Dev Dojo.
 *
 * Two modes, chosen by the BASE_URL env var:
 *
 *  - Unset (the default, used for CI gating): build the site with `node build.js`,
 *    serve `dist/` locally, and test the code in the PR. True gating.
 *  - Set (e.g. BASE_URL=https://roniam.dev/dev/): run the same specs against a
 *    live deployment for monitoring. No local server is started.
 *
 * The app is a single built HTML file, so there is exactly one route ("/").
 */
const PORT = Number(process.env.PORT || 4321);
const LOCAL_URL = `http://localhost:${PORT}/`;
export const APP_URL = process.env.BASE_URL || LOCAL_URL;
const isLive = Boolean(process.env.BASE_URL);

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results',
  // Build every engine course once so the cross-course invariant specs can load
  // each over file://.
  globalSetup: './tests/e2e/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_500 },

  // list = console; json = the self-heal agent's input; html = human triage;
  // junit = external CI systems; dojo-reporter = the findings-status dashboard.
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['./tests/reporters/dojo-reporter.ts'],
  ],

  use: {
    baseURL: APP_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: process.env.CI ? 'retain-on-failure' : 'off',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  // Build + serve locally unless we're pointed at a live deployment.
  webServer: isLive
    ? undefined
    : {
        command: 'node build.js && node scripts/serve.mjs',
        url: LOCAL_URL,
        timeout: 60_000,
        reuseExistingServer: !process.env.CI,
        stdout: 'pipe',
        stderr: 'pipe',
      },
});
