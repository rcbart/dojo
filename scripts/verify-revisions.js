#!/usr/bin/env node
/* Gate 16: the revision claim on the home page is backed by the posts.
 *
 * The home page says what you are reading has been through more than ten
 * revisions. That is a claim about the work, and this site's rule is that a
 * claim about the work gets checked rather than asserted.
 *
 * So: every post that records a revision count has to clear the floor, and the
 * home page has to still be making the claim this gate is enforcing. Drop the
 * sentence and the gate fails, because an unenforced claim is worse than none.
 *
 * The count is deliberately NOT printed in the byline. Advertising it would be
 * boasting about process; leaving it in the committed source keeps the claim
 * checkable by anyone who cares to look, which is the standard the rest of this
 * repo holds itself to.
 *
 * Posts written before the tally started have no `revisions:` field and are
 * skipped. New posts should carry one. It is one line of front matter:
 *
 *   revisions: 14
 *
 *   node scripts/verify-revisions.js
 */
const fs = require('fs');
const path = require('path');

const FLOOR = 10;                       // must match the wording on the home page
const CLAIM = 'more than ten revisions'; // the sentence this gate stands behind

const posts = fs.readdirSync('posts').filter(f => f.endsWith('.md'));
let checked = 0, bad = 0;

for (const f of posts) {
  const src = fs.readFileSync(path.join('posts', f), 'utf8');
  const fm = src.split('---')[1] || '';
  const m = fm.match(/^revisions:\s*(\d+)\s*$/m);
  if (!m) { console.log(`  ${f.padEnd(48)} no count recorded, skipped`); continue; }
  const n = +m[1];
  checked++;
  if (n < FLOOR) {
    console.error(`  ${f.padEnd(48)} ${n} revisions, below the ${FLOOR} the home page claims`);
    bad++;
  } else {
    console.log(`  ${f.padEnd(48)} ${n} revisions`);
  }
}

const home = fs.readFileSync('docs/home.html', 'utf8');
if (!home.includes(CLAIM)) {
  console.error(`\ndocs/home.html no longer says "${CLAIM}".`);
  console.error('Either restore it, or delete this gate. Do not leave the claim ungated.');
  process.exit(1);
}

if (bad) {
  console.error(`\n${bad} post(s) fall short of the claim on the home page.`);
  console.error('Either the post needs more work, or the home page is overstating it.');
  process.exit(1);
}

console.log(`\n${checked} post(s) carry a revision count, all at or above ${FLOOR}.`);
console.log(`docs/home.html still makes the claim this gate enforces.`);
