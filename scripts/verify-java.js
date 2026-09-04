#!/usr/bin/env node
// Fourth gate: COMPILE every Java reference solution.
//
// Why this exists: 331 Java exercises are graded by regex structural checks —
// they verify you wrote the expected construct, not that the code is valid
// Java. Nothing in the other three gates ever compiles them, so a reference
// solution with a syntax error would ship and be shown to learners as the
// model answer.
//
// What it proves, and what it does not: that every self-contained reference
// solution is syntactically valid and type-checks as far as its dependencies
// allow. It does not prove behaviour, that is what the Run locally panel and
// the opt-in local runner are for.
//
// Exercises are skipped, with a counted reason, when they legitimately cannot
// compile alone: a fragment with no type declaration, a third-party import
// (JUnit, Spring, Jackson), a reference to a class the prompt supplies, or
// syntax newer than the available toolchain.
//
// Run: node scripts/verify-java.js [--verbose]
const fs = require('fs');
const os = require('os');
const path = require('path');
const cp = require('child_process');

const ROOT = path.join(__dirname, '..');
const VERBOSE = process.argv.includes('--verbose');
const COURSES = ['.', 'identity-dojo', 'js-dojo'];

/* Prefer javac; fall back to `java File.java`, which compiles in memory and
   reports "can't find main" on success. That fallback is what lets this run
   on a machine with only a JRE. */
const has = c => { try { cp.execSync(`command -v ${c}`, { stdio: 'ignore' }); return true; } catch { return false; } };
const MODE = has('javac') ? 'javac' : (has('java') ? 'java-source' : null);
if (!MODE) {
  // This used to exit 0 on "CI provides one", which made the gate depend on a
  // step in another file staying in place: drop the setup-java step and 331
  // Java solutions go uncompiled with a green tick. The workflow's
  // actions/setup-java@v4 puts javac on PATH, so in CI this branch is not
  // reached; if it ever is, that is the failure worth knowing about.
  // ALLOW_NO_JDK=1 is the deliberate local opt-out.
  if (process.env.ALLOW_NO_JDK === '1') {
    console.log('java-compile: no JDK or JRE on PATH; skipped because ALLOW_NO_JDK=1');
    process.exit(0);
  }
  console.error('java-compile: no JDK or JRE on PATH. The Java compile gate cannot run.');
  console.error('  CI installs one with actions/setup-java@v4 before this step; check that step still exists.');
  console.error('  To skip deliberately on a machine without a JDK: ALLOW_NO_JDK=1 node scripts/verify-java.js');
  process.exit(1);
}
const version = (cp.execSync(`${MODE === 'javac' ? 'javac' : 'java'} -version 2>&1`, { encoding: 'utf8' }).match(/\d+/) || ['?'])[0];

function collect() {
  const out = [];
  for (const c of COURSES) {
    const dir = path.join(ROOT, c, 'content/streams');
    if (!fs.existsSync(dir)) continue;
    const S = [];
    for (const f of JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'))) {
      new Function('STREAMS', fs.readFileSync(path.join(dir, f), 'utf8'))(S);
    }
    for (const s of S) for (const l of s.lessons || []) {
      const exs = l.exs || (l.ex ? [l.ex] : []);
      exs.forEach((e, i) => { if (!e.lang && e.solution) out.push({ id: `${c} ${l.id}#${i}`, src: e.solution }); });
    }
  }
  return out;
}

const typeName = src => {
  const pub = src.match(/public\s+(?:final\s+|abstract\s+)?(?:class|interface|enum|record)\s+(\w+)/);
  if (pub) return pub[1];
  const any = src.match(/(?:^|\n)\s*(?:final\s+|abstract\s+)?(?:class|interface|enum|record)\s+(\w+)/);
  return any ? any[1] : null;
};

const THIRD_PARTY = /^import\s+(org\.junit|org\.springframework|com\.fasterxml|org\.slf4j|ch\.qos|jakarta\.|javax\.servlet|org\.mockito|io\.jsonwebtoken|com\.nimbusds|org\.apache|reactor\.|io\.micrometer)/m;

/* The minimum JDK a solution's SYNTAX requires. An older compiler does not say
   "records are a preview feature", it says "class, interface, or enum
   expected", which is indistinguishable from a genuine syntax error. So the
   level is derived from the source before compiling, not from the error. */
function requiredJdk(src) {
  let n = 8;
  if (/\bvar\s+\w+\s*=/.test(src)) n = Math.max(n, 10);
  if (/switch\s*\([^)]*\)\s*\{[\s\S]*?->/.test(src) || /\byield\b/.test(src)) n = Math.max(n, 14);
  if (/\"\"\"/.test(src)) n = Math.max(n, 15);
  if (/(^|\n)\s*(public\s+)?record\s+\w+\s*\(/.test(src)) n = Math.max(n, 16);
  if (/instanceof\s+\w+\s+\w+/.test(src)) n = Math.max(n, 16);
  if (/\.toList\(\)/.test(src)) n = Math.max(n, 16);
  if (/\bsealed\b|\bnon-sealed\b|\bpermits\b/.test(src)) n = Math.max(n, 17);
  if (/case\s+\w+\s+\w+\s*(->|:)/.test(src)) n = Math.max(n, 21);   // record/type patterns
  return n;
}
const TOOLCHAIN = /(preview|records are|sealed (classes|types) are|text blocks are|switch expressions are|pattern matching|not supported in -source|--enable-preview|--release)/i;
const UNRESOLVED = /(cannot find symbol|package [\w.]+ does not exist|cannot access)/;

function compile(job, tmp) {
  const dir = fs.mkdtempSync(path.join(tmp, 'j-'));
  const file = path.join(dir, job.type + '.java');
  fs.writeFileSync(file, job.src);
  let out = '';
  try {
    out = MODE === 'javac'
      ? cp.execSync(`javac -nowarn -d "${dir}" "${file}" 2>&1`, { encoding: 'utf8', timeout: 30000 })
      : cp.execSync(`java "${file}" 2>&1`, { encoding: 'utf8', timeout: 30000 });
  } catch (err) { out = String(err.stdout || '') + String(err.stderr || '') || String(err.message); }
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
  return out;
}

(function main() {
  const jobs = collect();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dojo-java-'));
  const skip = { fragment: 0, thirdParty: 0, unresolved: 0, toolchain: 0 };
  const failures = [];
  let compiled = 0;

  for (const job of jobs) {
    const t = typeName(job.src);
    if (!t) { skip.fragment++; continue; }                    // a method or snippet, not a type
    if (THIRD_PARTY.test(job.src)) { skip.thirdParty++; continue; }
    if (requiredJdk(job.src) > +version) { skip.toolchain++; continue; }   // newer syntax than this JDK
    job.type = t;
    const out = compile(job, tmp);

    // "can't find main" means it compiled and then had nothing to run.
    if (!/error:/.test(out) || /can't find main\(String\[\]\) method/.test(out)) { compiled++; continue; }
    if (TOOLCHAIN.test(out)) { skip.toolchain++; continue; }  // newer syntax than this JDK
    if (UNRESOLVED.test(out)) { skip.unresolved++; continue; }// depends on a type the prompt supplies
    failures.push({ id: job.id, out: out.split('\n').filter(l => l.includes('error:')).slice(0, 3).join('\n    ') });
  }
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch {}

  for (const f of failures) console.error(`COMPILE FAIL ${f.id}\n    ${f.out}`);
  if (VERBOSE || failures.length) console.error('');
  console.log(
    `java-compile (JDK ${version}, ${MODE}): candidates=${jobs.length} compiled=${compiled} ` +
    `skipped=${skip.fragment + skip.thirdParty + skip.unresolved + skip.toolchain} ` +
    `(fragment=${skip.fragment} third-party=${skip.thirdParty} unresolved=${skip.unresolved} toolchain=${skip.toolchain}) ` +
    `failures=${failures.length}`);
  process.exit(failures.length ? 1 : 0);
})();
