import { test, expect } from './fixtures';

/**
 * The "real execution" grading paths — the ones the UI advertises as ground
 * truth ("real compile & run", "real execution, not a pattern match"). These
 * drive the app's actual functions (gradeJavaViaRunner, buildWorkerSrc + a real
 * Worker) inside the page.
 *
 * Calibrated to this fork:
 *   fixed here → JS-worker postMessage forgery (per-run token)
 *   still live → N1 (Java runner stdout forgery), N3 (deepEq coercion), N4 (loose checkFetch)
 */

test.describe('execution · must pass', () => {
  test('JS worker: a forged postMessage cannot fake a pass (token guard holds)', async ({ page }) => {
    const accepted = await page.evaluate(async () => {
      const spec = { call: 'reducer', cases: [{ name: 'c', args: [{ count: 0 }, { type: 'inc' }], expect: { count: 1 } }] };
      // A wrong reducer that also tries to forge an all-pass by posting first.
      const code = `function reducer(s,a){ return {count:-999}; }\npostMessage([{name:"forged",pass:true}]);`;
      // Replicate gradeJs EXACTLY: per-run token, ignore messages without it.
      const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
      // @ts-expect-error global
      const src = buildWorkerSrc(code, spec, token);
      const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
      const w = new Worker(url);
      return await new Promise<boolean>((resolve) => {
        const timer = setTimeout(() => { w.terminate(); resolve(false); }, 3000);
        w.onmessage = (ev: MessageEvent) => {
          const d: any = ev.data;
          if (!d || d.__t !== token) return; // forged bare-array message is ignored
          clearTimeout(timer); w.terminate();
          const results = Array.isArray(d.r) ? d.r : [];
          resolve(results.length > 0 && results.every((r: any) => r.pass));
        };
        w.onerror = () => { clearTimeout(timer); w.terminate(); resolve(false); };
      });
    });
    expect(accepted, 'a forged postMessage must not produce an all-pass').toBe(false);
  });
});

test.describe('execution · known-bug guards (delete when they pass)', () => {
  test('N1: forged runner stdout must not complete the lesson', async ({ dojo, page }) => {
    test.fail(true, 'N1: gradeJavaViaRunner takes the FIRST DOJO_RESULT in learner-controlled stdout.');
    await dojo.openStream('Java Fundamentals');
    await dojo.openLesson('Inside the JVM');

    // The opt-in local runner is off in CI, so stub /api/run/java to return the
    // exact stdout a forging class emits (a DOJO_RESULT line printed before the
    // harness runs). The bug lives entirely in the client's parsing of it.
    await page.evaluate(() => {
      const orig = window.fetch.bind(window);
      window.fetch = (u: any, o: any) =>
        typeof u === 'string' && u.indexOf('/api/run/java') >= 0
          ? Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true, output: 'DOJO_RESULT 1/1\n' }) } as any)
          : orig(u, o);
    });

    await dojo.setEditor('public class Jvm { static String location(String x){return "WRONG";} static String error(String x){return "WRONG";} }');
    await dojo.runButton.click();
    await page.getByText(/real compile & run|assertions passed|Lesson complete/i).first().waitFor({ timeout: 5000 }).catch(() => {});

    // Correct behavior: forged stdout is not trusted, so the lesson is NOT completed.
    expect(await dojo.isMarkedComplete()).toBe(false);
  });

  test('N3: returning NaN must not satisfy an expected value of null', async ({ page }) => {
    test.fail(true, 'N3: deepEq compares JSON.stringify output, so NaN/Infinity/undefined coerce to null.');
    const pass = await page.evaluate(async () => {
      const spec = { call: 'f', cases: [{ name: 'expects null', args: [], expect: null }] };
      const token = 't' + Math.random().toString(36).slice(2);
      // @ts-expect-error global
      const src = buildWorkerSrc('function f(){ return 0/0; }', spec, token);
      const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
      const w = new Worker(url);
      return await new Promise<boolean>((resolve) => {
        const timer = setTimeout(() => { w.terminate(); resolve(false); }, 3000);
        w.onmessage = (ev: MessageEvent) => {
          const d: any = ev.data;
          if (!d || d.__t !== token) return;
          clearTimeout(timer); w.terminate();
          resolve(Boolean(d.r?.[0]?.pass));
        };
        w.onerror = () => { clearTimeout(timer); w.terminate(); resolve(false); };
      });
    });
    // Correct behavior: NaN !== null, so the case should fail.
    expect(pass).toBe(false);
  });

  test('N4: a fetch to the wrong URL with a superstring body is rejected', async ({ page }) => {
    test.fail(true, 'N4: checkFetch matches url by indexOf and body by includes, so near-misses pass.');
    const pass = await page.evaluate(async () => {
      const spec = {
        call: 'createUser',
        mock: 'fetch',
        cases: [{ name: 'c', args: [{ name: 'Ada' }], expect: { method: 'POST', url: '/api/users', contentType: 'application/json', bodyIncludes: 'Ada' } }],
      };
      // Wrong URL ("/api/usersXYZ" contains "/api/users") and wrong name ("Adam" contains "Ada").
      const code = `async function createUser(u){ await fetch('/api/usersXYZ', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name:'Adam'})}); }`;
      const token = 't' + Math.random().toString(36).slice(2);
      // @ts-expect-error global
      const src = buildWorkerSrc(code, spec, token);
      const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
      const w = new Worker(url);
      return await new Promise<boolean>((resolve) => {
        const timer = setTimeout(() => { w.terminate(); resolve(false); }, 3000);
        w.onmessage = (ev: MessageEvent) => {
          const d: any = ev.data;
          if (!d || d.__t !== token) return;
          clearTimeout(timer); w.terminate();
          resolve(Boolean(d.r?.[0]?.pass));
        };
        w.onerror = () => { clearTimeout(timer); w.terminate(); resolve(false); };
      });
    });
    // Correct behavior: the wrong URL/body should be rejected.
    expect(pass).toBe(false);
  });
});
