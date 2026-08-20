#!/usr/bin/env node
// verify-built.js: the ninth gate. Every inline <script> in every built page
// must actually parse.
//
// This exists because a single invalid escape sequence in one quiz option
// (\) where \" was meant) made an 8,876-line script fail at parse time. The
// page served a 200, weighed the right number of kilobytes, passed all eight
// gates, and rendered a header with nothing under it. Content gates check what
// the source says. Nothing checked whether the thing we ship can run.
//
// Run: node scripts/verify-built.js
const fs = require('fs');
const path = require('path');

const TARGETS = [
  ['DevDojo', 'dist/index.html'],
  ['IdentityDojo', 'identity-dojo/dist/index.html'],
  ['JSDojo', 'js-dojo/dist/index.html'],
  ['MLDojo', 'ml-dojo/dist/index.html'],
  ['fundamentals', 'fundamentals-crash-course/index.html'],
  ['docker', 'docker-crash-course/index.html'],
  ['kubernetes', 'kubernetes-crash-course/index.html'],
  ['envoy', 'envoy-crash-course/index.html'],
  ['istio', 'istio-crash-course/index.html'],
  ['home', 'docs/home.html'],
  ['skills rubric', 'skills-rubric.html'],
];

const ROOT = path.join(__dirname, '..');
let failures = 0, checked = 0;

for (const [name, rel] of TARGETS) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) { console.log(`  skip  ${name} (not built: ${rel})`); continue; }
  const html = fs.readFileSync(file, 'utf8');
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
  let m, blocks = 0, bad = 0;
  while ((m = re.exec(html))) {
    blocks++;
    const body = m[1];
    if (!body.trim()) continue;
    // JSON-LD and similar are data, not code
    const tag = html.slice(m.index, m.index + 120);
    if (/type=["'](application\/(ld\+json|json)|text\/template)["']/.test(tag)) continue;
    checked++;
    try {
      new Function(body);
    } catch (err) {
      bad++; failures++;
      const line = html.slice(0, m.index).split('\n').length;
      console.log(`  FAIL  ${name}: inline script #${blocks} (from line ~${line} of ${rel})`);
      console.log(`        ${err.message}`);
    }
  }
  if (!bad) console.log(`  ok    ${name}: ${blocks} inline block(s) parse`);
}

console.log(`\n${checked} script block(s) checked across ${TARGETS.length} target(s).`);
if (failures) {
  console.error(`\nverify-built FAILED: ${failures} block(s) will not parse in a browser.`);
  process.exit(1);
}
console.log('Every built page can run.');
