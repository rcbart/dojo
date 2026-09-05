#!/usr/bin/env node
/* Check that the ML Dojo snapshot in this repo is the current build.
 *
 * NOT a CI gate, and it cannot be one. authlint is built from source that
 * lives in this repo, so scripts/verify-authlint-snapshot.js can rebuild it
 * in CI and compare. ML Dojo is a separate repository
 * (github.com/rcbart/ml-dojo) that ships into the site as a tracked build
 * artifact at ml-dojo/dist/index.html. CI never sees that source, so a gate
 * here could only prove the snapshot has not been corrupted, never that it
 * is not a generation behind. The check that matters needs both repositories
 * on one disk, which means it runs here, by hand, before a snapshot commit.
 *
 * The failure it exists to catch is the quiet one, the same one the authlint
 * gate was written for: ML Dojo gains lessons, its own repo is committed and
 * pushed, and the site keeps serving the previous build with nothing looking
 * wrong. Counts on the home page then describe content nobody can reach.
 *
 *   node scripts/verify-ml-snapshot.js                 # compare the two builds
 *   node scripts/verify-ml-snapshot.js --rebuild       # rebuild ML Dojo first
 *   node scripts/verify-ml-snapshot.js --repo ../path  # non-default location
 *
 * --rebuild is the thorough form and it WRITES to the ML Dojo repo's own
 * dist/index.html, which is why it is opt-in. Without it this proves the two
 * files agree; with it, that they also agree with ML Dojo's current source.
 *
 * Exit code is 1 on any mismatch, so it works in a pre-push script.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2);
const REBUILD = args.includes('--rebuild');
const repoArg = args.indexOf('--repo') >= 0 ? args[args.indexOf('--repo') + 1] : null;

const SNAPSHOT = path.join(ROOT, 'ml-dojo', 'dist', 'index.html');

// The sibling checkout is the normal layout (/Volumes/CODE/dojo and
// /Volumes/CODE/ml-dojo). Everything else is a fallback so this still works
// from a differently arranged working copy.
const candidates = [
  repoArg && path.resolve(repoArg),
  process.env.ML_DOJO_REPO && path.resolve(process.env.ML_DOJO_REPO),
  path.resolve(ROOT, '..', 'ml-dojo'),
  path.join(process.env.HOME || '', 'mnt', 'ml-dojo'),
].filter(Boolean);

const repo = candidates.find(d => {
  try { return fs.statSync(path.join(d, 'build.js')).isFile(); } catch (e) { return false; }
});

const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const kb = f => (fs.statSync(f).size / 1024).toFixed(0) + 'kB';

if (!fs.existsSync(SNAPSHOT)) {
  console.error(`missing snapshot: ${path.relative(ROOT, SNAPSHOT)}`);
  process.exit(1);
}

if (!repo) {
  console.error('Cannot find the ML Dojo repository. Looked in:');
  for (const c of candidates) console.error(`  ${c}`);
  console.error('\nPass it explicitly:  node scripts/verify-ml-snapshot.js --repo /path/to/ml-dojo');
  console.error('This check needs both repositories on one disk, which is why it is not a CI gate.');
  process.exit(1);
}

const source = path.join(repo, 'dist', 'index.html');
if (!fs.existsSync(source)) {
  console.error(`ML Dojo has no build at ${source}\nRun: cd ${repo} && node build.js`);
  process.exit(1);
}

console.log(`snapshot  ${path.relative(ROOT, SNAPSHOT)}  ${kb(SNAPSHOT)}`);
console.log(`ml-dojo   ${source}  ${kb(source)}`);

if (REBUILD) {
  console.log('\nrebuilding ML Dojo from source (this writes its dist/index.html)...');
  const before = sha(source);
  try {
    execFileSync('node', ['build.js'], { cwd: repo, stdio: 'inherit' });
  } catch (e) {
    console.error('\nML Dojo build failed. Fix that before trusting any of this.');
    process.exit(1);
  }
  if (sha(source) !== before) {
    console.error('\nSTALE: ML Dojo\'s own dist/index.html was not current with its source.');
    console.error('It has been rebuilt. Commit it in the ML Dojo repo, then re-copy the');
    console.error('snapshot here and commit that too.');
    process.exit(1);
  }
  console.log('ML Dojo dist was already current with its source.');
}

if (sha(SNAPSHOT) !== sha(source)) {
  console.error('\nSTALE SNAPSHOT: the site is serving a different build from ML Dojo\'s.');
  console.error('The site would keep serving the old one with nothing looking wrong.');
  console.error('\nFix:');
  console.error(`  cp ${source} ${path.relative(ROOT, SNAPSHOT)}`);
  console.error('  node scripts/verify-stats.js        # the counts move with it');
  process.exit(1);
}

console.log(`\nok: the snapshot is byte-identical to ML Dojo's build${REBUILD ? ', which is current with its source' : ''}.`);
if (!REBUILD) console.log('Run with --rebuild to also prove that build is current with ML Dojo\'s source.');
