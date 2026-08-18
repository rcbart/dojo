#!/usr/bin/env node
// Sixth gate: the cloud-native path. The five crash courses (fundamentals,
// docker, kubernetes, envoy, istio) build markdown into one interactive HTML
// file each via web/build.py. The other five gates never look at them, which
// is how a duplicated module number, a quizless page, and Next-links that
// disagreed with the built sidebar all shipped. This gate checks the
// structure the builds depend on:
//   1. every file referenced in build.py's PAGES exists;
//   2. every page has at least one quiz entry, every quiz key names a page,
//      and every entry is well-formed (>=2 options, answer in range, a why;
//      whyWrong, when present, matches options and is empty at the answer);
//   3. each page's trailing **Next:** link points at the NEXT page in PAGES
//      order, the built sidebar's order, so GitHub readers and site
//      visitors walk the same course.
//
// Run: node scripts/verify-cloudnative.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const COURSES = [
  'fundamentals-crash-course',
  'docker-crash-course',
  'kubernetes-crash-course',
  'envoy-crash-course',
  'istio-crash-course',
];

let failures = 0, pagesTotal = 0, questionsTotal = 0;
const fail = (msg) => { console.error('FAIL', msg); failures++; };

for (const course of COURSES) {
  const web = path.join(ROOT, course, 'web');
  const buildSrc = fs.readFileSync(path.join(web, 'build.py'), 'utf8');

  // Parse PAGES: ("id", <path expr>("file.md"), "title", "group")
  const entries = [...buildSrc.matchAll(/^\s*\("([^"]+)",\s*(?:W|os\.path\.join)\((?:WEB,\s*)?"([^"]+)"\)/gm)]
    .map(m => ({ id: m[1], file: m[2] }));
  if (!entries.length) { fail(`${course}: could not parse PAGES from build.py`); continue; }
  pagesTotal += entries.length;

  // 1. files exist
  for (const e of entries) {
    if (!fs.existsSync(path.join(web, e.file))) fail(`${course}: PAGES references missing file ${e.file}`);
  }
  const ids = new Set(entries.map(e => e.id));
  if (ids.size !== entries.length) fail(`${course}: duplicate page ids in PAGES`);

  // 2. quizzes
  const quizzes = JSON.parse(fs.readFileSync(path.join(web, 'quizzes.json'), 'utf8'));
  for (const e of entries) {
    const qs = quizzes[e.id];
    if (!qs || !qs.length) { fail(`${course}: page ${e.id} has no quiz entries`); continue; }
    qs.forEach((q, i) => {
      questionsTotal++;
      const where = `${course}: ${e.id}[${i}]`;
      if (!q.q || !Array.isArray(q.options) || q.options.length < 2) fail(`${where}: malformed question/options`);
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) fail(`${where}: answer out of range`);
      if (!q.why) fail(`${where}: missing why`);
      if (q.whyWrong) {
        if (q.whyWrong.length !== q.options.length) fail(`${where}: whyWrong length != options length`);
        else if (q.whyWrong[q.answer] !== '') fail(`${where}: whyWrong[answer] should be ""`);
        else q.whyWrong.forEach((w, wi) => { if (wi !== q.answer && !w) fail(`${where}: empty whyWrong[${wi}]`); });
      }
    });
  }
  for (const k of Object.keys(quizzes)) {
    if (!ids.has(k)) fail(`${course}: quiz key ${k} names no page`);
  }

  // 3. Next-chain agrees with PAGES order
  for (let i = 0; i < entries.length; i++) {
    const md = fs.readFileSync(path.join(web, entries[i].file), 'utf8');
    const m = md.trimEnd().match(/\*\*Next:\*\*\s*\[[^\]]*\]\(\.\/([^)#]+?)\)\s*$/);
    if (i < entries.length - 1) {
      if (!m) { fail(`${course}: ${entries[i].file} has no trailing **Next:** link`); continue; }
      if (m[1] !== entries[i + 1].file)
        fail(`${course}: ${entries[i].file} Next -> ${m[1]}, but the built order continues with ${entries[i + 1].file}`);
    } else if (m) {
      fail(`${course}: ${entries[i].file} is the last page but still links Next -> ${m[1]}`);
    }
  }
}

console.log(`cloudnative: courses=${COURSES.length} pages=${pagesTotal} questions=${questionsTotal} failures=${failures}`);
process.exit(failures ? 1 : 0);
