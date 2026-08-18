#!/usr/bin/env node
// Fifth gate: is any lesson too thin for the course it sits in?
//
// History, because the metric matters more than the number:
//
//   v1, a flat 150 words. It reported ZERO thin lessons in IdentityDojo while
//        eight foundational lessons sat under 300 and a whole stream averaged
//        under 250. The threshold was not wrong, it was measuring the wrong
//        thing: thinness is relative to what surrounds it.
//
//   v2, 50% of the course MEAN. Better, and it surfaced 57 lessons the flat
//        check had called fine. But the mean has two faults here. It is dragged
//        DOWN by the very lessons you are looking for, so the check is most
//        lenient exactly when a course has the most thin lessons. And it is
//        dragged UP by long lessons, so improving the course raises the bar and
//        the count never settles, fixing one lesson can flag three more.
//
//   v3, 50% of the course MEDIAN, which is what this script uses. The median
//        is not moved by a handful of very short or very long lessons, so the
//        floor describes the typical lesson and stays still while the course
//        grows.
//
// Note the direction of the v2 -> v3 change: it made the check STRICTER (2
// flagged became 14 on first run), not quieter. A metric changed until it stops
// complaining is worthless; the reason to change this one was that the mean
// was measuring the wrong middle.
//
// Run: node scripts/verify-depth.js [--report]
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const REPORT = process.argv.includes('--report');
const COURSES = [['DevDojo', '.'], ['IdentityDojo', 'identity-dojo'], ['JSDojo', 'js-dojo']];
const RATIO = 0.5;

const words = body => body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
const median = xs => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1;
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2); };

let failures = 0;
for (const [name, dir] of COURSES) {
  const streams = path.join(ROOT, dir, 'content/streams');
  if (!fs.existsSync(streams)) continue;
  const S = [];
  for (const f of JSON.parse(fs.readFileSync(path.join(streams, 'manifest.json'), 'utf8'))) {
    new Function('STREAMS', fs.readFileSync(path.join(streams, f), 'utf8'))(S);
  }
  const lessons = [];
  for (const s of S) for (const l of s.lessons || []) lessons.push({ id: l.id, title: l.title, w: words(l.body), stream: s.title });
  const med = median(lessons.map(l => l.w));
  const floor = Math.round(med * RATIO);
  const thin = lessons.filter(l => l.w < floor).sort((a, b) => a.w - b.w);

  for (const l of thin) console.error(`THIN ${name} ${l.id}, ${l.w}w < ${floor}w, ${l.title}`);
  failures += thin.length;

  if (REPORT || thin.length) {
    const ws = lessons.map(l => l.w).sort((a, b) => a - b);
    const pct = p => ws[Math.min(ws.length - 1, Math.floor(ws.length * p))];
    console.log(`${name}: lessons=${lessons.length} median=${med} floor=${floor} thin=${thin.length}` +
      `  [p10=${pct(0.1)} p25=${pct(0.25)} p75=${pct(0.75)} p90=${pct(0.9)}]`);
  } else {
    console.log(`${name}: lessons=${lessons.length} median=${med} floor=${floor} thin=0`);
  }
}
console.log(failures ? `\ndepth: ${failures} lesson(s) below the floor` : '\ndepth: every lesson clears its course floor');
process.exit(failures ? 1 : 0);
