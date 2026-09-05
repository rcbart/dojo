import { test, expect } from './fixtures';
import { APP_URL } from '../../playwright.config';

/**
 * F06 — clickjacking protection. The app sets `frame-ancestors 'none'` in a
 * <meta> CSP, but browsers ignore that directive when delivered via <meta>; it
 * has to arrive as an HTTP response header. This checks the header on whatever
 * APP_URL points at.
 *
 * Meaningful only against a real deployment (BASE_URL=https://roniam.dev/dev/);
 * the local static server intentionally sets no such header, so the test is
 * skipped there. Kept as a known-bug guard: when the deployment adds the header,
 * it flips to "expected to fail but passed".
 */
test.describe('security headers', () => {
  test('F06: frame-ancestors / X-Frame-Options is sent as an HTTP header', async ({ request }) => {
    test.skip(!process.env.BASE_URL, 'Deploy-layer header check; run with BASE_URL set to a live deployment.');
    test.fail(true, 'F06: frame-ancestors is only in a <meta> tag, which browsers ignore.');

    const res = await request.get(APP_URL);
    const headers = res.headers();
    const csp = headers['content-security-policy'] || '';
    const framed = /frame-ancestors/i.test(csp) || 'x-frame-options' in headers;
    expect(framed, 'a real frame-ancestors/X-Frame-Options header must be present').toBe(true);
  });
});
