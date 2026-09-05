#!/usr/bin/env node
/* Gate: no editorial apparatus in a published post.
 *
 * Publishing on this site is a git mv from blog/ (gitignored drafts) into
 * posts/ (tracked, built, deployed). The drafts carry HTML comment blocks
 * holding open [ASK] markers, rulings about which sentences are the author's
 * rather than the assistant's, notes about what a named third party has and
 * has not agreed to, and facts marked never-to-be-published. A git mv brings
 * all of it along.
 *
 * build-blog.js now strips HTML comments so nothing can leak into a rendered
 * page, but stripping silently would mean the author never learns the file
 * went out dirty. This gate is the noisy half: it fails the build, names the
 * file and the line, and makes cleaning the draft part of publishing.
 *
 *   node scripts/verify-no-editorial.js            # checks posts/
 *   node scripts/verify-no-editorial.js DIR        # checks DIR (for testing)
 *
 * The optional argument exists so this gate can be proven to fail against a
 * scratch directory without putting a dirty file into posts/ to test it. A
 * gate nobody has watched fail is not a gate.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const POSTS = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, 'posts');

// Each rule is a reason a line cannot appear in something that ships.
const RULES = [
  ['HTML comment', /<!--/],
  ['unanswered [ASK]', /\[ASK\]/i],
  ['authorship marker', /\bMINE\b/],
  ['draft status', /^status:\s*(draft|outline|on-hold)\s*$/i],
];

let files;
try { files = fs.readdirSync(POSTS).filter(f => f.endsWith('.md')); }
catch (e) { console.error('no posts/ directory'); process.exit(1); }

const bad = [];
for (const f of files) {
  const lines = fs.readFileSync(path.join(POSTS, f), 'utf8').split('\n');
  lines.forEach((line, n) => {
    for (const [why, re] of RULES) {
      if (re.test(line)) bad.push({ f, n: n + 1, why, line: line.trim().slice(0, 72) });
    }
  });
}

if (bad.length) {
  console.error(`\n${bad.length} piece(s) of editorial apparatus in published posts:\n`);
  for (const b of bad) console.error(`  ${path.relative(ROOT, path.join(POSTS, b.f))}:${b.n}  ${b.why}\n      ${b.line}`);
  console.error('\nThese are working notes, not writing. Remove them before publishing.\n');
  process.exit(1);
}
console.log(`ok: ${files.length} published post(s), no editorial apparatus`);
