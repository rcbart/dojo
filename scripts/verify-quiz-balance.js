#!/usr/bin/env node
// verify-quiz-balance.js: the tenth gate. A multiple-choice question whose
// correct answer is conspicuously the longest option can be answered without
// knowing anything, by picking the long one.
//
// An audit in August found 653 of 957 questions exploitable this way. This gate
// exists so the number can only go down. Set BUDGET to the current count, fix
// questions, lower BUDGET. It fails the build if the count rises.
//
// Run: node scripts/verify-quiz-balance.js [--list]
const fs = require('fs'), path = require('path'), vm = require('vm');

const BUDGET = 0;            // lower this as questions are fixed, never raise it
const RATIO  = 1.4;            // correct answer at least 40% above the mean of the rest
const ABS    = 20;             // and at least 20 characters longer, to ignore noise

const BANKS = [
  ['DevDojo',      'src/quizzes.js'],
  ['DevDojo',      'src/quizzes_hand.js'],
  ['IdentityDojo', 'identity-dojo/src/quizzes.js'],
  ['IdentityDojo', 'identity-dojo/src/quizzes_hand.js'],
  ['JSDojo',       'js-dojo/src/quizzes.js'],
  ['JSDojo',       'js-dojo/src/quizzes_hand.js'],
];

const ROOT = path.join(__dirname, '..');
const strip = s => String(s).replace(/<[^>]+>/g, '').trim();
const list = process.argv.includes('--list');
let total = 0, biased = 0;
const offenders = [];

for (const [dojo, rel] of BANKS) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) continue;
  const ctx = { window: {} };
  vm.createContext(ctx);
  try { vm.runInContext(fs.readFileSync(file, 'utf8'), ctx); }
  catch (e) { console.error(`  cannot evaluate ${rel}: ${e.message}`); process.exit(1); }

  for (const [, bank] of Object.entries(ctx.window).filter(([k]) => /QUIZ/i.test(k))) {
    for (const [stream, qs] of Object.entries(bank || {})) {
      for (const q of (qs || [])) {
        if (!q || !Array.isArray(q.options) || q.options.length < 2) continue;
        const ai = typeof q.answer === 'number' ? q.answer : q.correct;
        if (typeof ai !== 'number') continue;
        total++;
        const lens = q.options.map(o => strip(o).length);
        const right = lens[ai];
        const others = lens.filter((_, i) => i !== ai);
        const mean = others.reduce((a, b) => a + b, 0) / others.length;
        if (right > Math.max(...others) && right >= mean * RATIO && right - mean >= ABS) {
          biased++;
          offenders.push({ dojo, stream, gap: Math.round(right - mean), right,
                           mean: Math.round(mean), q: strip(q.q).slice(0, 70) });
        }
      }
    }
  }
}

offenders.sort((a, b) => b.gap - a.gap);
if (list) {
  offenders.forEach(o => console.log(
    `${String(o.gap).padStart(4)}  ${o.dojo.padEnd(13)} ${o.stream.padEnd(12)} ${o.q}`));
  console.log();
}

const pct = (biased / total * 100).toFixed(1);
console.log(`${biased} of ${total} questions (${pct}%) have a length-biased correct answer.`);
console.log(`budget: ${BUDGET}`);

if (biased > BUDGET) {
  console.error(`\nverify-quiz-balance FAILED: ${biased - BUDGET} more than the budget allows.`);
  console.error('A correct answer that is conspicuously the longest is answerable without knowing anything.');
  process.exit(1);
}
if (biased < BUDGET) {
  console.log(`\n${BUDGET - biased} below budget. Lower BUDGET in this file to lock the gain in.`);
}
console.log('ok');
