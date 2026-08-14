#!/usr/bin/env node
// Third gate: EXECUTE every exercise that ships a run spec, calling its own
// reference solution with the exercise's own cases and comparing the result
// exactly as the in-browser worker does.
//
// Why this exists: scripts/verify.js checks regex tests against solutions, and
// the engine tests cover the runtime — neither can see an executed exercise
// whose cases disagree with its own solution. Writing this found four such
// exercises that shipped: one whose args were an object where the runner needs
// an array (every learner saw a TypeError), one with an off-by-one at a window
// boundary, one whose case data contradicted its own prompt, and one that failed
// six of its cases only because JSON.stringify made object key order
// significant — a defect in the runtime rather than in the content.
//
// Run: node scripts/verify-exec.js [courseDir ...]     (default: all three)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const courses = process.argv.slice(2).length ? process.argv.slice(2) : ['.', 'identity-dojo', 'js-dojo'];

const canon = v => v === null || typeof v !== 'object' ? v
  : Array.isArray(v) ? v.map(canon)
  : Object.keys(v).sort().reduce((o, k) => (o[k] = canon(v[k]), o), {});
const eq = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));

(async () => {
  let exercises = 0, cases = 0, failures = 0, skipped = 0;
  for (const course of courses) {
    const dir = path.join(ROOT, course, 'content/streams');
    if (!fs.existsSync(dir)) { console.error('no such course:', course); process.exit(1); }
    const STREAMS = [];
    for (const f of JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'))) {
      new Function('STREAMS', fs.readFileSync(path.join(dir, f), 'utf8'))(STREAMS);
    }
    for (const s of STREAMS) for (const l of s.lessons || []) {
      const exs = l.exs || (l.ex ? [l.ex] : []);
      for (const [i, e] of exs.entries()) {
        if (!e.run) continue;
        if (e.run.mock) { skipped++; continue; }          // fetch-shape specs, checked by the worker
        exercises++;
        const id = course + ' ' + l.id + '#' + i;
        // Same globals a Web Worker gives the learner's code, minus the network.
        const ctx = vm.createContext({ URL, URLSearchParams, TextEncoder, TextDecoder, Buffer, console,
          atob: x => Buffer.from(x, 'base64').toString('binary'),
          btoa: x => Buffer.from(x, 'binary').toString('base64') });
        try { vm.runInContext(e.solution || '', ctx); }
        catch (err) { console.error('SOLUTION FAILED TO LOAD', id, '-', err.message); failures++; continue; }
        const fn = ctx[e.run.call];
        if (typeof fn !== 'function') { console.error('NO SUCH FUNCTION', id, '-', e.run.call); failures++; continue; }
        for (const c of e.run.cases || []) {
          cases++;
          let got;
          try { got = await fn.apply(null, c.args || []); }
          catch (err) { console.error('THREW', id, '-', c.name, '-', err.message); failures++; continue; }
          if (!eq(got, c.expect)) {
            console.error('MISMATCH', id, '-', c.name, '- returned', JSON.stringify(got),
                          'expected', JSON.stringify(c.expect));
            failures++;
          }
        }
      }
    }
  }
  console.log(`executed=${exercises} cases=${cases} skipped=${skipped} failures=${failures}`);
  process.exit(failures ? 1 : 0);
})();
