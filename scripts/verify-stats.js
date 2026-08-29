#!/usr/bin/env node
/* The numbers in the "Take the course" stat block are a claim about the work,
   and a wrong claim is worse than no claim. Recompute them from the content and
   fail if docs/home.html has drifted. They went stale once already: the page
   said 420 lessons while the dojos held 529.

   ML Dojo lives in its own repository, so its contribution is read from the
   tracked snapshot at ml-dojo/dist/index.html rather than from source. */
const fs = require('fs');
const path = require('path');

function fromSource(root) {
  const dir = path.join(root, 'content/streams');
  const man = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  let src = fs.readFileSync(path.join(dir, '_header.js'), 'utf8');
  for (const f of man) src += fs.readFileSync(path.join(dir, f), 'utf8') + '\n';
  src += fs.readFileSync(path.join(dir, '_footer.js'), 'utf8');
  return new Function('window', '"use strict";' + src + ';return STREAMS;')({});
}

function fromSnapshot(rel) {
  // Pull just the STREAMS.push(...) blocks out of the built page and run those.
  const html = fs.readFileSync(rel, 'utf8');
  const i = html.indexOf('STREAMS.push(');
  const j = html.lastIndexOf('});') + 3;
  if (i < 0 || j <= i) throw new Error(rel + ': no stream data found');
  return new Function('window', '"use strict";const STREAMS=[];' + html.slice(i, j) + ';return STREAMS;')({});
}

function tally(streams) {
  let lessons = 0, exercises = 0;
  for (const s of streams) {
    for (const l of (s.lessons || [])) {
      lessons++;
      exercises += (l.exs || (l.ex ? [l.ex] : [])).length;
    }
  }
  return { streams: streams.length, lessons, exercises };
}

const parts = [
  ['Dev Dojo', tally(fromSource('.'))],
  ['Identity Dojo', tally(fromSource('identity-dojo'))],
  ['JS Dojo', tally(fromSource('js-dojo'))],
  ['ML Dojo', tally(fromSnapshot('ml-dojo/dist/index.html'))],
];
const total = { streams: 0, lessons: 0, exercises: 0 };
for (const [, t] of parts) for (const k of Object.keys(total)) total[k] += t[k];

// The cloud-native path is markdown modules rather than stream data.
let modules = 0;
for (const c of ['fundamentals', 'docker', 'kubernetes', 'envoy', 'istio']) {
  const d = `${c}-crash-course/web`;
  if (fs.existsSync(d)) modules += fs.readdirSync(d).filter(f => f.endsWith('.md')).length;
}

for (const [n, t] of parts) console.log(`  ${n.padEnd(15)} ${String(t.streams).padStart(3)} streams  ${String(t.lessons).padStart(4)} lessons  ${String(t.exercises).padStart(4)} exercises`);
console.log(`  ${'cloud-native'.padEnd(15)} ${'  -'} streams  ${String(modules).padStart(4)} modules`);

const claim = {
  streams: total.streams,
  lessons: total.lessons + modules,
  exercises: total.exercises,
};
console.log(`\nclaim: ${claim.streams} streams, ${claim.lessons} lessons, ${claim.exercises} exercises`);

const home = fs.readFileSync('docs/home.html', 'utf8');
const block = home.match(/<div class="stats">[\s\S]*?<\/div>\s*<\/div>|<div class="stats">[\s\S]*?<\/div>/);
if (!block) { console.error('docs/home.html: no .stats block found'); process.exit(1); }
const shown = [...block[0].matchAll(/<b>([\d,]+)<\/b><span>([^<]+)<\/span>/g)]
  .map(m => [m[2].replace(/&amp;/g, '&').trim(), +m[1].replace(/,/g, '')]);
const want = { 'streams': claim.streams, 'lessons': claim.lessons, 'exercises': claim.exercises, 'dependencies': 0 };
let bad = 0;
for (const [label, value] of shown) {
  const key = Object.keys(want).find(k => label.includes(k));
  if (!key) { console.error(`  unrecognised stat label: "${label}"`); bad++; continue; }
  if (value !== want[key]) { console.error(`  home.html says ${value} ${label}, content says ${want[key]}`); bad++; }
}
if (bad) { console.error('\nUpdate the .stats block in docs/home.html.'); process.exit(1); }
console.log('docs/home.html stats match the content.');

// Numbers also live in meta tags, outside the .stats block, and one went
// stale there unnoticed: og:description said 420 lessons after the site
// held 610. Any "N lessons/streams/exercises" in a meta content attribute
// must match the content too.
let mbad = 0;
for (const m of home.matchAll(/<meta[^>]+content="([^"]*)"/g)) {
  for (const hit of m[1].matchAll(/([\d,]+)\s+(lessons?|streams?|exercises?)/g)) {
    const key = hit[2].replace(/s?$/, 's');
    const got = +hit[1].replace(/,/g, '');
    if (got !== claim[key]) {
      console.error(`  meta tag says ${got} ${key}, content says ${claim[key]}`);
      mbad++;
    }
  }
}
if (mbad) { console.error('\nUpdate the meta tags in docs/home.html.'); process.exit(1); }
console.log('docs/home.html meta tags match the content.');

// The course index at /courses/ repeats the numbers per dojo. It went stale
// once by simply not mentioning ML Dojo at all, so check it from the same source.
const landing = fs.readFileSync('docs/landing.html', 'utf8');
const cards = [...landing.matchAll(/<h2>([^<]+)<\/h2>\s*<div class="stats">([\s\S]*?)<\/div>/g)]
  .map(m => [m[1].trim(), [...m[2].matchAll(/<span class="stat">([^<]+)<\/span>/g)].map(x => x[1])]);
const byName = Object.fromEntries(parts);
let lbad = 0;
for (const [name, t] of parts) {
  const card = cards.find(c => c[0] === name);
  if (!card) { console.error(`  docs/landing.html has no card for ${name}`); lbad++; continue; }
  const nums = Object.fromEntries(card[1]
    .map(x => x.match(/^([\d,]+)\s+(\w+)/)).filter(Boolean)
    .map(m => [m[2], +m[1].replace(/,/g, '')]));
  for (const [key, want] of [['streams', t.streams], ['lessons', t.lessons], ['exercises', t.exercises]]) {
    const got = nums[key] !== undefined ? nums[key] : nums[key === 'streams' ? 'tracks' : key];
    if (got === undefined) { console.error(`  ${name} card is missing a ${key} figure`); lbad++; }
    else if (got !== want) { console.error(`  ${name} card says ${got} ${key}, content says ${want}`); lbad++; }
  }
}
for (const [name] of cards) if (!byName[name] && !/cloud/i.test(name)) {
  console.error(`  docs/landing.html has a card for "${name}" with no matching content`); lbad++;
}
if (lbad) { console.error('\nUpdate the cards in docs/landing.html.'); process.exit(1); }
console.log('docs/landing.html cards match the content.');

// The home page states the CI gate count twice. It said nine while thirteen ran,
// which is the sort of small wrongness a careful reader notices first.
const wf = fs.readFileSync('.github/workflows/pages.yml', 'utf8');
const gates = new Set([...wf.matchAll(/^\s*#\s*Gate (\d+)\b/gm)].map(m => +m[1]));
const gateCount = gates.size ? Math.max(...gates) : 0;
const WORDS = ['zero','one','two','three','four','five','six','seven','eight','nine','ten',
               'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen',
               'eighteen','nineteen','twenty'];
const claims = [...home.matchAll(/(?:runs|by) (\w+) (?:CI )?checks/g)].map(m => m[1]);
if (!claims.length) { console.error('docs/home.html no longer states the gate count'); process.exit(1); }
const wrong = claims.filter(w => WORDS.indexOf(w) !== gateCount && +w !== gateCount);
if (wrong.length) {
  console.error(`  docs/home.html says "${wrong.join('", "')}" checks, the workflow defines ${gateCount} gates`);
  process.exit(1);
}
console.log(`docs/home.html states ${gateCount} CI gates, which is how many the workflow defines.`);
