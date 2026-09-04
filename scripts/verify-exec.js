#!/usr/bin/env node
// Third gate: EXECUTE every exercise that ships a run spec, calling its own
// reference solution with the exercise's own cases and comparing the result
// exactly as the in-browser worker does.
//
// Why this exists: scripts/verify.js checks regex tests against solutions, and
// the engine tests cover the runtime, neither can see an executed exercise
// whose cases disagree with its own solution. Writing this found four such
// exercises that shipped: one whose args were an object where the runner needs
// an array (every learner saw a TypeError), one with an off-by-one at a window
// boundary, one whose case data contradicted its own prompt, and one that failed
// six of its cases only because JSON.stringify made object key order
// significant, a defect in the runtime rather than in the content.
//
// SQL exercises are the second real-execution path and were covered by no gate at
// all: an exercise with lang:'sql' and a data set is graded by running the
// learner's SELECTs and the reference's against the sample database in
// engine/sqlengine.js, yet nothing here ever ran them. A reference that throws, or
// names a data set that does not exist, silently downgrades the exercise to the
// regex path for every learner. Both are checked below.
//
// Run: node scripts/verify-exec.js [courseDir ...]     (default: all three)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const courses = process.argv.slice(2).length ? process.argv.slice(2) : ['.', 'identity-dojo', 'js-dojo'];

// The in-browser SQL engine, loaded exactly as a built page loads it.
const sqlBox = vm.createContext({ window: {}, console });
sqlBox.globalThis = sqlBox;
vm.runInContext(fs.readFileSync(path.join(ROOT, 'engine/sqlengine.js'), 'utf8'), sqlBox);
const SQLDB = sqlBox.window.SQLDB, SQL_DATASETS = sqlBox.window.SQL_DATASETS;
// One definition of "which statements are SELECTs", the same one engine/grade.js uses.
const sqlSelects = text => text.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/--[^\n]*/g, ' ')
  .split(';').map(s => s.trim()).filter(Boolean).filter(s => /^select/i.test(s));

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
        if (e.lang === 'sql' && e.data) {
          const id = course + ' ' + l.id + '#' + i;
          const db = SQL_DATASETS[e.data];
          if (!db) {
            console.error('NO SUCH DATASET', id, '-', e.data, '- this exercise silently falls back to regex grading');
            failures++; continue;
          }
          const queries = sqlSelects(e.solution || '');
          if (!queries.length) {
            console.error('NO SELECT IN SOLUTION', id, '- the grader has nothing to compare against');
            failures++; continue;
          }
          exercises++;
          for (const [qi, q] of queries.entries()) {
            cases++;
            let rows;
            try { rows = SQLDB.run(JSON.parse(JSON.stringify(db)), q); }
            catch (err) {
              console.error('SQL THREW', id, '- query ' + (qi + 1), '-', err.message);
              failures++; continue;
            }
            // A non-finite cell serializes to null, which the grader cannot tell
            // apart from a real NULL, so a wrong answer could score as correct.
            const bad = rows.find(r => Object.values(r).some(v => typeof v === 'number' && !isFinite(v)));
            if (bad) {
              console.error('NON-FINITE RESULT', id, '- query ' + (qi + 1), '-', JSON.stringify(bad),
                            '- indistinguishable from NULL when graded');
              failures++;
            }
          }
          continue;
        }
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
  console.log('(cases counts JS run-spec cases and executed SQL queries)');
  process.exit(failures ? 1 : 0);
})();
