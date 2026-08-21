#!/usr/bin/env node
/* Gate 15: the authlint snapshot in this repository matches its source.
 *
 * authlint lives in its own repository. What is tracked here is only the built
 * artifact the Pages workflow copies to /authlint/, plus its social card. That
 * arrangement is deliberate, because GitHub Pages publishes one site per repo
 * and roniam.dev is built from this one.
 *
 * The cost of that arrangement is drift. Fix a check in the authlint source,
 * rebuild there, forget to copy the result here, and the live tool silently
 * stays on the old build. Nothing about the site would look wrong. You would
 * find out months later wondering why a fix you remember making is not there.
 *
 * So this rebuilds authlint from its own source and compares. authlint's build
 * is deterministic and has no dependencies, which is what makes this cheap.
 *
 *   node scripts/verify-authlint-snapshot.js
 *
 * By default it shallow-clones the public repository. To check against a local
 * working copy instead, which is what you want while actually developing:
 *
 *   AUTHLINT_SRC=/Volumes/CODE/authlint node scripts/verify-authlint-snapshot.js
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const REPO = 'https://github.com/rcbart/authlint';
const ROOT = process.cwd();
const SNAPSHOT = path.join(ROOT, 'authlint', 'dist', 'index.html');
const OG_HERE = path.join(ROOT, 'authlint', 'authlint-og.png');

const sha = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const short = h => h.slice(0, 12);

function fail(msg, how) {
  console.error('\n' + msg);
  if (how) console.error('\n' + how);
  process.exit(1);
}

if (!fs.existsSync(SNAPSHOT)) {
  fail('authlint/dist/index.html is missing, and the Pages workflow copies it to /authlint/.');
}

let src = process.env.AUTHLINT_SRC;
let tmp = null;

if (src) {
  if (!fs.existsSync(path.join(src, 'build.js'))) {
    fail(`AUTHLINT_SRC=${src} does not look like the authlint repository (no build.js).`);
  }
  console.log(`source: ${src} (local, from AUTHLINT_SRC)`);
} else {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'authlint-'));
  src = path.join(tmp, 'repo');
  try {
    execFileSync('git', ['clone', '--depth', '1', '--quiet', REPO, src], { stdio: 'pipe' });
  } catch (e) {
    fail('Could not clone ' + REPO + ' to check the snapshot.',
         'This gate needs network access. If that is the only problem, the snapshot itself\n' +
         'may still be fine; re-run when the network is available, or point the check at a\n' +
         'local checkout with AUTHLINT_SRC=/path/to/authlint.');
  }
  console.log(`source: ${REPO} (shallow clone)`);
}

// Rebuild from source in a scratch copy, so a local AUTHLINT_SRC is never written to.
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'authlint-build-'));
for (const d of ['src', 'dist']) fs.mkdirSync(path.join(work, d), { recursive: true });
fs.copyFileSync(path.join(src, 'build.js'), path.join(work, 'build.js'));
for (const f of fs.readdirSync(path.join(src, 'src'))) {
  fs.copyFileSync(path.join(src, 'src', f), path.join(work, 'src', f));
}
execFileSync('node', ['build.js'], { cwd: work, stdio: 'pipe' });

const built = path.join(work, 'dist', 'index.html');
const a = sha(built), b = sha(SNAPSHOT);
const size = p => fs.statSync(p).size.toLocaleString();

console.log(`built from source  ${short(a)}  ${size(built)} bytes`);
console.log(`snapshot here      ${short(b)}  ${size(SNAPSHOT)} bytes`);

let bad = a !== b;
if (bad) {
  console.error('\nThe shipped snapshot does not match a fresh build of the authlint source.');
}

// The social card is copied by the workflow too, so it can drift the same way.
const OG_SRC = path.join(src, 'og', 'authlint-og.png');
if (fs.existsSync(OG_SRC) && fs.existsSync(OG_HERE)) {
  if (sha(OG_SRC) !== sha(OG_HERE)) {
    console.error('authlint/authlint-og.png differs from og/authlint-og.png in the source repo.');
    bad = true;
  } else {
    console.log('social card matches');
  }
}

if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
fs.rmSync(work, { recursive: true, force: true });

if (bad) {
  fail('The live tool at roniam.dev/authlint would not be the code in the authlint repository.',
       'Fix by refreshing the snapshot from the authlint working copy:\n\n' +
       '  cd /Volumes/CODE/authlint && node build.js\n' +
       '  cp dist/index.html /Volumes/CODE/dojo/authlint/dist/index.html\n' +
       '  cp og/authlint-og.png /Volumes/CODE/dojo/authlint/authlint-og.png\n\n' +
       'Then commit the refreshed snapshot here. If instead the authlint repo is the one\n' +
       'that is behind, push there first and re-run this.');
}
console.log('\nauthlint snapshot matches its source.');
