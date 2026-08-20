#!/usr/bin/env node
/* Gate 11. A quiz where the correct answer is nearly always the same option is
   answerable without reading the question. Before scripts/quiz-shuffle.py ran,
   270 of 397 Dev Dojo answers sat in slot B and 232 of 327 Identity answers did.
   This keeps it from drifting back: no single slot may hold more than MAX of a
   bank's questions.

   To rebalance after adding questions: python3 scripts/quiz-shuffle.py apply */
const fs = require('fs');
const MAX = 0.34;                 // uniform over four slots is 0.25
const MIN_N = 40;                 // below this a bank is too small for the ratio to mean much
const BANKS = {
  dev: 'src/quizzes_hand.js',
  idn: 'identity-dojo/src/quizzes_hand.js',
  js:  'js-dojo/src/quizzes_hand.js',
};

function load(rel) {
  const s = fs.readFileSync(rel, 'utf8').trim();
  const m = s.match(/^window\.\w+\s*=\s*(\{[\s\S]*\})\s*;?\s*$/);
  if (!m) throw new Error(rel + ': not a single window.X={...} assignment');
  return JSON.parse(m[1]);
}

function questions(node, out) {
  out = out || [];
  if (Array.isArray(node)) node.forEach(n => questions(n, out));
  else if (node && typeof node === 'object') {
    if (Array.isArray(node.options) && Number.isInteger(node.answer)) out.push(node);
    Object.values(node).forEach(v => questions(v, out));
  }
  return out;
}

let failures = 0;
for (const [tag, rel] of Object.entries(BANKS)) {
  const qs = questions(load(rel));
  const counts = {};
  let misaligned = 0;
  for (const q of qs) {
    counts[q.answer] = (counts[q.answer] || 0) + 1;
    // whyWrong runs parallel to options: the correct slot must carry no rebuttal.
    if (Array.isArray(q.whyWrong) && q.whyWrong.length === q.options.length
        && String(q.whyWrong[q.answer] || '').trim()) {
      misaligned++;
      if (misaligned <= 3) console.error(`  ${tag}: whyWrong is out of step with options: ${String(q.q).slice(0, 70)}`);
    }
  }
  const worst = Math.max(...Object.values(counts));
  const share = worst / qs.length;
  const line = Object.keys(counts).sort().map(k => `${'ABCD'[k]}=${counts[k]}`).join(' ');
  const bad = (qs.length >= MIN_N && share > MAX) || misaligned;
  console.log(`${bad ? 'FAIL' : 'ok  '} ${tag}: ${qs.length} questions  ${line}  worst slot ${(share * 100).toFixed(1)}%`);
  if (qs.length >= MIN_N && share > MAX) {
    console.error(`  ${tag}: one slot holds ${(share * 100).toFixed(1)}% of answers, over the ${(MAX * 100)}% ceiling.`);
    console.error('  Run: python3 scripts/quiz-shuffle.py apply');
    failures++;
  }
  if (misaligned) { console.error(`  ${tag}: ${misaligned} question(s) with whyWrong out of step.`); failures++; }
}

// ML Dojo keeps its quizzes inline in its own repository and ships here as a
// built page, so check the artifact rather than a source bank. Coarse on
// purpose: counts, not parsing, because the shipped file is one 900KB script.
const ML = 'ml-dojo/dist/index.html';
if (fs.existsSync(ML)) {
  const html = fs.readFileSync(ML, 'utf8');
  const answers = [...html.matchAll(/,\s*answer:\s*(\d)/g)].map(m => +m[1]);
  const rebuttals = (html.match(/whyWrong:\s*\[/g) || []).length;
  const counts = {};
  answers.forEach(a => { counts[a] = (counts[a] || 0) + 1; });
  const worst = Math.max(...Object.values(counts));
  const share = worst / answers.length;
  const line = Object.keys(counts).sort().map(k => `${'ABCD'[k]}=${counts[k]}`).join(' ');
  const spreadBad = answers.length >= MIN_N && share > MAX;
  const gaps = answers.length - rebuttals;
  console.log(`${spreadBad || gaps ? 'FAIL' : 'ok  '} ml:  ${answers.length} questions  ${line}  worst slot ${(share * 100).toFixed(1)}%  rebuttals ${rebuttals}`);
  if (spreadBad) {
    console.error('  ml: run python3 scripts/quiz-shuffle.py apply in the ml-dojo repo, then rebuild and recopy dist/index.html');
    failures++;
  }
  if (gaps) {
    console.error(`  ml: ${gaps} question(s) with no per-wrong-answer explanation.`);
    console.error('  ml: run python3 scripts/quiz-annotate.py in the ml-dojo repo, then rebuild and recopy dist/index.html');
    failures++;
  }
}

if (failures) process.exit(1);
console.log('Correct answers are spread across the options in every bank.');
