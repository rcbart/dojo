// Unit tests for the shared runtime's pure logic.
//
// These cover the four functions where a bug is silent and consequential:
// grading (localChecks), the sandbox preamble (buildWorkerSrc), quiz option
// shuffling (shuffleQuiz) and difficulty rating (exDiff). Two of them exist
// because a real bug shipped here before: every hand-authored quiz had its
// answer at option A, and two exercise regexes did not match their own
// reference solutions.
const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./harness.js');

const { localChecks, buildWorkerSrc, exDiff, shuffleQuiz, esc } = load();

/* ---------------------------------------------------------------- grading */
test('localChecks passes a matching regex', () => {
  const r = localChecks({ tests: [{ d: 'has a return', re: 'return\\s+x' }] }, 'return x;');
  assert.equal(r.length, 1);
  assert.equal(r[0].desc, 'has a return');
  assert.equal(r[0].pass, true);
});

test('localChecks fails a non-matching regex', () => {
  const r = localChecks({ tests: [{ d: 'has a loop', re: 'for\\s*\\(' }] }, 'return x;');
  assert.equal(r[0].pass, false);
});

test('localChecks inverts when not:true', () => {
  const e = { tests: [{ d: 'must not hardcode', re: 'return\\s+true', not: true }] };
  assert.equal(localChecks(e, 'return true;')[0].pass, false);
  assert.equal(localChecks(e, 'return a && b;')[0].pass, true);
});

test('localChecks treats an invalid regex as a failure rather than throwing', () => {
  // A malformed pattern in content must never crash the grader for a learner.
  const r = localChecks({ tests: [{ d: 'broken', re: '([' }] }, 'anything');
  assert.equal(r[0].pass, false);
});

test('localChecks defaults to dotall so multi-line solutions match', () => {
  const r = localChecks({ tests: [{ d: 'spans lines', re: 'a.*b' }] }, 'a\nb');
  assert.equal(r[0].pass, true);
});

test('localChecks returns an empty array when an exercise has no tests', () => {
  assert.equal(localChecks({}, 'code').length, 0);
});

/* ------------------------------------------------- worker sandbox preamble */
test('buildWorkerSrc runs in strict mode', () => {
  const src = buildWorkerSrc('function f(){}', { call: 'f', cases: [] });
  assert.match(src, /^"use strict";/);
});

test('buildWorkerSrc removes network globals before running submitted code', () => {
  const src = buildWorkerSrc('function f(){}', { call: 'f', cases: [] });
  for (const g of ['importScripts', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'indexedDB']) {
    assert.ok(src.includes('"' + g + '"'), 'expected ' + g + ' to be removed');
  }
  // and the hardening must precede the learner's code
  assert.ok(src.indexOf('importScripts') < src.indexOf('function f(){}'));
});

test('buildWorkerSrc deletes fetch unless the exercise mocks it', () => {
  const plain = buildWorkerSrc('function f(){}', { call: 'f', cases: [] });
  assert.ok(plain.includes('delete self.fetch'));
  const mocked = buildWorkerSrc('function f(){}', { call: 'f', mock: 'fetch', cases: [] });
  assert.ok(!mocked.includes('delete self.fetch'));
});

test('buildWorkerSrc embeds the cases and calls the named function', () => {
  const src = buildWorkerSrc('function add(a,b){return a+b;}', {
    call: 'add', cases: [{ args: [1, 2], expect: 3 }]
  });
  assert.ok(src.includes('add.apply'));
  assert.ok(src.includes('"expect":3') || src.includes('expect":3'));
});

/* --------------------------------------------------------- quiz shuffling */
function sampleQuestion() {
  return {
    q: 'which?',
    options: ['right', 'wrong A', 'wrong B', 'wrong C'],
    answer: 0,
    why: 'because',
    whyWrong: ['', 'no A', 'no B', 'no C']
  };
}

test('shuffleQuiz keeps the answer index pointing at the same option', () => {
  for (let i = 0; i < 200; i++) {
    const [q] = shuffleQuiz([sampleQuestion()]);
    assert.equal(q.options[q.answer], 'right');
  }
});

test('shuffleQuiz keeps each whyWrong aligned with its option', () => {
  const map = { 'wrong A': 'no A', 'wrong B': 'no B', 'wrong C': 'no C' };
  for (let i = 0; i < 200; i++) {
    const [q] = shuffleQuiz([sampleQuestion()]);
    q.options.forEach((opt, k) => {
      if (k === q.answer) assert.equal(q.whyWrong[k], '');
      else assert.equal(q.whyWrong[k], map[opt], 'explanation drifted from its option');
    });
  }
});

test('shuffleQuiz preserves the full set of options', () => {
  const [q] = shuffleQuiz([sampleQuestion()]);
  assert.equal([...q.options].sort().join('|'), 'right|wrong A|wrong B|wrong C');
});

test('shuffleQuiz does not always leave the answer at index 0', () => {
  // The bug this guards: 71 hand-authored questions all had answer:0, so the
  // position alone gave the answer away.
  const seen = new Set();
  for (let i = 0; i < 300; i++) seen.add(shuffleQuiz([sampleQuestion()])[0].answer);
  assert.ok(seen.size > 1, 'shuffle produced a constant answer position');
});

test('shuffleQuiz leaves the original question object untouched', () => {
  const original = sampleQuestion();
  shuffleQuiz([original]);
  assert.equal(original.answer, 0);
  assert.equal(original.options[0], 'right');
});

/* ------------------------------------------------------------- difficulty */
test('exDiff honours an explicit difficulty', () => {
  assert.equal(exDiff({ diff: 'hard', solution: 'x' }, {}, {}), 'hard');
  assert.equal(exDiff({ diff: 'easy', solution: 'x' }, {}, {}), 'easy');
});

test('exDiff ignores an invalid explicit difficulty', () => {
  assert.notEqual(exDiff({ diff: 'trivial', solution: 'return 1;' }, {}, {}), 'trivial');
});

test('exDiff rates project and tournament streams hard', () => {
  assert.equal(exDiff({ solution: 'return 1;' }, { project: true }, {}), 'hard');
  assert.equal(exDiff({ solution: 'return 1;' }, { tournament: true }, {}), 'hard');
});

test('exDiff is deterministic for the same exercise', () => {
  const e = { solution: 'function f(a){ for (const x of a) { if (x) return x; } return null; }' };
  assert.equal(exDiff(e, {}, {}), exDiff(e, {}, {}));
});

test('exDiff always returns one of the three tiers', () => {
  const samples = [{ solution: '' }, { solution: 'return 1;' }, { lang: 'text', solution: 'x' },
                   { solution: 'a\n'.repeat(80) }];
  for (const e of samples) assert.ok(['easy', 'medium', 'hard'].includes(exDiff(e, {}, {})));
});

/* ------------------------------------------------------------------ escaping */
test('esc neutralises HTML in learner-visible strings', () => {
  const out = esc('<script>alert(1)</script>');
  assert.ok(!out.includes('<script>'));
  assert.ok(out.includes('&lt;'));
});

test('esc handles empty and undefined input without throwing', () => {
  assert.doesNotThrow(() => esc(''));
  assert.doesNotThrow(() => esc(undefined));
});
