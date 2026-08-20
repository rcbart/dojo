#!/usr/bin/env node
// verify-sitemap.js: the eighth gate. Every <loc> in the built sitemap must
// resolve to a real file in the assembled site, and the feed and robots.txt
// must exist and be non-empty. Runs after the site is assembled.
//
// This exists because /skills-rubric.html was linked from the home page and
// 404'd for weeks: it was tracked in git but never copied into the site, and
// nothing failed. A link the build cannot resolve should break the build.
//
// Run: node scripts/verify-sitemap.js [siteDir]     (default: _site)
const fs = require('fs');
const path = require('path');

const SITE = path.resolve(process.argv[2] || '_site');
const fail = [];

const need = f => {
  const p = path.join(SITE, f);
  if (!fs.existsSync(p)) return `missing: ${f}`;
  if (fs.statSync(p).size === 0) return `empty: ${f}`;
  return null;
};

for (const f of ['sitemap.xml', 'feed.xml', 'robots.txt']) {
  const err = need(f);
  if (err) fail.push(err);
}

if (!fail.length) {
  const xml = fs.readFileSync(path.join(SITE, 'sitemap.xml'), 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  if (!locs.length) fail.push('sitemap.xml contains no <loc> entries');

  for (const loc of locs) {
    let rel = loc.replace(/^https?:\/\/[^/]+/, '');
    if (rel === '' || rel.endsWith('/')) rel += 'index.html';
    const err = need(rel.replace(/^\//, ''));
    if (err) fail.push(`${loc} -> ${err}`);
  }
  console.log(`sitemap: ${locs.length} url(s) checked`);
}

if (fail.length) {
  console.error('\nverify-sitemap FAILED');
  for (const f of fail) console.error('  ' + f);
  process.exit(1);
}
console.log('sitemap, feed and robots.txt all resolve');
