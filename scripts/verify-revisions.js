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
 * EVERY published post must carry the field. It used to be optional, which made
 * the gate opt-out: leave one line out of the front matter and the post was
 * skipped entirely, so the weakest post was the one the check never saw. A
 * missing count is now a failure. It is one line of front matter:
 *
 *   revisions: 14
 *
 *   node scripts/verify-revisions.js
 */
const fs = require('fs');
const path = require('path');

// The claim is "MORE THAN ten", so ten itself does not clear it: the comparison
// below is n <= FLOOR, not n < FLOOR, which used to accept exactly 10.
const FLOOR = 10;                       // must match the wording on the home page
const CLAIM = 'more than ten revisions'; // the sentence this gate stands behind

// sit-the-exam predates the revision tally, so it has no count to state. It is
// grandfathered by name rather than by silence: every post written since must
// carry the field, and a new post cannot opt out by leaving it off.
const PRE_TALLY = new Set(['2026-08-14-sit-the-exam.md']);

const posts = fs.readdirSync('posts').filter(f => f.endsWith('.md'));
let checked = 0, bad = 0, grandfathered = 0;

for (const f of posts) {
  const src = fs.readFileSync(path.join('posts', f), 'utf8');
  const fm = src.split('---')[1] || '';
  const m = fm.match(/^revisions:\s*(\d+)\s*$/m);
  if (!m) {
    if (PRE_TALLY.has(f)) {
      console.log(`  ${f.padEnd(48)} predates the tally, grandfathered`);
      grandfathered++;
      continue;
    }
    console.error(`  ${f.padEnd(48)} no revisions: field in the front matter`);
    bad++;
    continue;
  }
  const n = +m[1];
  checked++;
  if (n <= FLOOR) {
    console.error(`  ${f.padEnd(48)} ${n} revisions, the home page claims more than ${FLOOR}`);
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

console.log(`\n${checked} post(s) carry a revision count, all above ${FLOOR}` + (grandfathered ? `, ${grandfathered} grandfathered` : '') + '.');
console.log(`docs/home.html still makes the claim this gate enforces.`);
