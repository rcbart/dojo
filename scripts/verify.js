#!/usr/bin/env node
// Verify the course content: every module parses, ids are unique, and every
// exercise's regex tests pass against its own solution. Run: node scripts/verify.js
const fs = require('fs');
const path = require('path');
// Which course to check. The workflow runs this three times with a different
// working-directory for each dojo; anchoring ROOT to __dirname made all three
// runs check Dev Dojo, so Identity and JS shipped ungated for months. Prefer an
// explicit argument, then the working directory, then the repo root.
const arg = process.argv[2];
const candidates = [arg, process.cwd(), path.join(__dirname, '..')].filter(Boolean);
const ROOT = candidates.find(c => fs.existsSync(path.join(c, 'content/streams/manifest.json')));
if (!ROOT) {
  console.error('no content/streams/manifest.json in ' + candidates.join(', '));
  process.exit(1);
}
const dir = p => path.join(ROOT, 'content/streams', p);
console.log('checking ' + (path.relative(path.join(__dirname, '..'), ROOT) || 'the repo root'));

const manifest = JSON.parse(fs.readFileSync(dir('manifest.json'), 'utf8'));
const STREAMS = [];
for (const f of manifest) {
  try {
    new Function('STREAMS', fs.readFileSync(dir(f), 'utf8'))(STREAMS);
  } catch (e) {
    console.error('PARSE FAIL', f, '-', e.message);
    process.exit(1);
  }
}

let lessons = 0, exercises = 0, tests = 0, failures = 0, belt = 0;
const ids = new Set(); const dups = [];
for (const s of STREAMS) {
  for (const l of s.lessons || []) {
    lessons++;
    if (ids.has(l.id)) dups.push(l.id);
    ids.add(l.id);
    if (!s.tournament && !s.project) belt++;
    const exs = l.exs || (l.ex ? [l.ex] : []);
    if (!exs.length) { console.error('NO EXERCISES', l.id); failures++; }
    exs.forEach((e, i) => {
      exercises++;
      for (const k of ['prompt', 'solution', 'behavior']) {
        if (!e[k]) { console.error('MISSING', k, l.id + '#' + i); failures++; }
      }
      for (const t of e.tests || []) {
        tests++;
        let pass;
        try { pass = new RegExp(t.re, t.flags || 's').test(e.solution || ''); }
        catch (err) { console.error('BAD REGEX', l.id + '#' + i, t.d, err.message); failures++; continue; }
        if (t.not) pass = !pass;
        if (!pass) { console.error('TEST FAIL', l.id + '#' + i, '-', t.d); failures++; }
      }
    });
  }
}
if (dups.length) { console.error('DUPLICATE IDS:', dups.join(', ')); failures += dups.length; }
console.log(`streams=${STREAMS.length} lessons=${lessons} (belt-eligible=${belt}) exercises=${exercises} tests=${tests} failures=${failures}`);
process.exit(failures ? 1 : 0);
