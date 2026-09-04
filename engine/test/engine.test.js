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

const { localChecks, buildWorkerSrc, exDiff, shuffleQuiz, esc,
        rateAggregate, ratingMarkup, setRating, getRating,
        saveComment, getComment, commentQuestion, commentMarkup } = load();

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

/* issue #3 (Seve Zavala): the official solution wrapped in comment syntax or
   a string literal must not pass structural checks. */
test('localChecks rejects the solution wrapped in a block comment (issue #3)', () => {
  const e = { tests: [{ d: 'has a return', re: 'return\\s+x' }] };
  assert.equal(localChecks(e, '/* return x; */')[0].pass, false);
  assert.equal(localChecks(e, 'return x;')[0].pass, true);
});
test('localChecks rejects the solution behind line comments (issue #3)', () => {
  const e = { tests: [{ d: 'has a loop', re: 'for\\s*\\(' }] };
  assert.equal(localChecks(e, '// for (let index = 0; index < count; index++) { total += index; }')[0].pass, false);
});
test('localChecks trips the inert-code wire on a string-wrapped solution (issue #3)', () => {
  const e = { tests: [{ d: 'has a return', re: 'return\\s+x' }] };
  assert.equal(localChecks(e, 'const s = "return x; return x; return x;";')[0].pass, false);
  assert.equal(localChecks(e, 'const s = `return x; return x; return x;`;')[0].pass, false);
});
test('localChecks still sees string contents in real code (URLs, SQL, literals)', () => {
  const e = { tests: [{ d: 'authorize endpoint', re: 'response_type=code' }] };
  const sol = 'String url = "https://idp.example/authorize?response_type=code&client_id=web";\nsend(url); parse(url); validate(url);';
  assert.equal(localChecks(e, sol)[0].pass, true);
});
test('localChecks does not eat a URL as a line comment', () => {
  const e = { tests: [{ d: 'calls fetch', re: 'fetch\\(' }] };
  assert.equal(localChecks(e, 'const u = "http://x"; fetch(u); handle(u); retry(u);')[0].pass, true);
});
test('localChecks honors raw:true for checks that require a comment', () => {
  const e = { tests: [{ d: 'has the why-not comment', re: 'why\\s+not', raw: true }] };
  assert.equal(localChecks(e, 'int x = 1; // why not volatile: see lesson')[0].pass, true);
});
test('localChecks strips hash comments for shell but keeps quoted programs', () => {
  const e = { lang: 'shell', tests: [{ d: 'uses awk', re: 'awk' }] };
  assert.equal(localChecks(e, "# awk goes here")[0].pass, false);
  assert.equal(localChecks(e, "cat log | awk '{print $1}'")[0].pass, true);
});
test('localChecks leaves text answers untouched', () => {
  const e = { lang: 'text', tests: [{ d: 'names the race', re: "don't|race" }] };
  assert.equal(localChecks(e, "It's a read-modify-write race, don't do it unlocked.")[0].pass, true);
});
/* Sweep of 4 Sep: the inert defense now covers every language the structural
   checks grade, and the worker grader no longer trusts an unsigned message. */
test('localChecks rejects a shell solution hidden in a quoted string', () => {
  const e = { lang: 'shell', tests: [{ d: 'force-with-lease', re: '--force-with-lease' }] };
  assert.equal(localChecks(e, 'echo "git rebase -i HEAD~3 && git push --force-with-lease"')[0].pass, false);
});
test('localChecks still passes a shell answer whose program lives in quotes', () => {
  const e = { lang: 'shell', tests: [{ d: 'uses awk', re: 'awk' }] };
  assert.equal(localChecks(e, "cat access.log | awk '{print $1}' | sort | uniq -c")[0].pass, true);
});
test('localChecks rejects a wholly commented-out SQL solution', () => {
  const e = { lang: 'sql', tests: [{ d: 'BIGSERIAL key', re: 'BIGSERIAL' }] };
  assert.equal(localChecks(e, '-- CREATE TABLE customers (id BIGSERIAL PRIMARY KEY);')[0].pass, false);
});
test('localChecks keeps SQL comment markers, which those lessons anchor on', () => {
  const e = { lang: 'sql', tests: [{ d: 'Q1 joins', re: '1\\)[\\s\\S]*?from\\s+employees' }] };
  const sol = '-- 1) every employee with a department\nselect e.name from employees e join departments d on d.id = e.dept_id;';
  assert.equal(localChecks(e, sol)[0].pass, true);
});
test('localChecks rejects an XML solution wrapped in an XML comment', () => {
  const e = { lang: 'xml', tests: [{ d: 'artifactId', re: '<artifactId>' }] };
  assert.equal(localChecks(e, '<!-- <artifactId>spring-boot-starter-web</artifactId> -->')[0].pass, false);
});
test('localChecks passes a short answer whose content is mostly a literal', () => {
  const e = { lang: 'js', tests: [{ d: 'declares greeting', re: 'const\\s+greeting' }] };
  assert.equal(localChecks(e, 'const greeting = "Hello, world!";')[0].pass, true);
});
test('buildWorkerSrc posts results under the run token so submitted code cannot forge them', () => {
  const src = buildWorkerSrc('function f(){}', { call: 'f', cases: [] }, 'tok123');
  assert.ok(src.includes('"tok123"'), 'the token is embedded in the worker source');
  assert.ok(/postMessage\(\{__t:/.test(src), 'results are posted in the token envelope');
  assert.ok(!/postMessage\(results\)/.test(src), 'no bare unsigned postMessage remains');
});

test('localChecks not:true still forbids real code but forgives comments', () => {
  const e = { tests: [{ d: 'no &&', re: '&&', not: true }] };
  assert.equal(localChecks(e, 'return a && b;')[0].pass, false);
  assert.equal(localChecks(e, '// do not use && here\nreturn a;')[0].pass, true);
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

/* deepEq inside the worker: object key order must not decide pass/fail.
   Found by executing every exercise's reference solution against its own
   run-cases, six cases in JS Dojo failed only because the solution built its
   result object with the keys in a different order than the expectation. */
test('the worker deepEq ignores object key order but not array order', () => {
  const src = buildWorkerSrc('function f(){}', { call: 'f', cases: [] });
  const scope = {};
  new Function(src.replace(/\(async function\(\)[\s\S]*$/, '') + '\nthis.deepEq = deepEq;').call(scope);
  assert.equal(scope.deepEq({ a: 1, b: 2 }, { b: 2, a: 1 }), true);
  assert.equal(scope.deepEq({ h: { x: 1, y: 2 } }, { h: { y: 2, x: 1 } }), true);
  assert.equal(scope.deepEq({ a: 1 }, { a: 2 }), false);
  assert.equal(scope.deepEq([1, 2], [2, 1]), false);
  assert.equal(scope.deepEq([{ a: 1, b: 2 }], [{ b: 2, a: 1 }]), true);
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

/* ------------------------------------------------------- lesson ratings */
/* Phase 1 of the feedback loop. The aggregate is pure, so it is tested
   directly rather than through the DOM. */
test('rateAggregate counts each value and ignores unrelated keys', () => {
  const a = rateAggregate({
    'rating:a': { v: 1 }, 'rating:b': { v: 1 }, 'rating:c': { v: 0 }, 'rating:d': { v: -1 },
    'someExercise': { done: true },          // progress, not a rating
    'rating:e': {},                          // written but never rated
  });
  assert.deepEqual({ up: a.up, neutral: a.neutral, down: a.down, rated: a.rated },
                   { up: 2, neutral: 1, down: 1, rated: 4 });
});

test('rateAggregate scores -100..100 and is null with no ratings', () => {
  assert.equal(rateAggregate({ 'rating:a': { v: 1 }, 'rating:b': { v: 1 } }).score, 100);
  assert.equal(rateAggregate({ 'rating:a': { v: -1 }, 'rating:b': { v: -1 } }).score, -100);
  assert.equal(rateAggregate({ 'rating:a': { v: 1 }, 'rating:b': { v: -1 } }).score, 0);
  assert.equal(rateAggregate({}).score, null);
  assert.equal(rateAggregate(undefined).rated, 0);
});

test('setRating stores a valid value and rejects anything else', () => {
  assert.equal(setRating('lesson-x', 1), true);
  assert.equal(getRating('lesson-x'), 1);
  assert.equal(setRating('lesson-x', -1), true);      // changing a rating is allowed
  assert.equal(getRating('lesson-x'), -1);
  assert.equal(setRating('lesson-y', 7), false);      // out of range
  assert.equal(setRating('lesson-y', '1'), false);    // wrong type, not coerced
  assert.equal(getRating('lesson-y'), null);
});

test('ratingMarkup asks before a rating exists and confirms afterwards', () => {
  assert.match(ratingMarkup('never-rated'), /Was this lesson useful\?/);
  assert.match(ratingMarkup('never-rated'), /aria-pressed="false"/);
  setRating('rated-one', 1);
  const after = ratingMarkup('rated-one');
  assert.match(after, /rating saved/);
  assert.match(after, /aria-pressed="true"/);
});

test('a rating never collides with exercise progress under the same id', () => {
  setRating('collide', 1);
  const agg = rateAggregate({ 'rating:collide': { v: 1 }, 'collide': { done: true } });
  assert.equal(agg.rated, 1);                          // the progress entry is not counted
});

/* --------------------------------------------- lesson comments (phase 2) */
test('saveComment trims, caps length, and round-trips', () => {
  saveComment('c1', '   the JOIN example lost me   ');
  assert.equal(getComment('c1'), 'the JOIN example lost me');
  const long = 'x'.repeat(3000);
  assert.equal(saveComment('c2', long).length, 2000);
  assert.equal(getComment('c2').length, 2000);
});

test('an empty comment clears rather than storing whitespace', () => {
  saveComment('c3', 'something');
  assert.equal(getComment('c3'), 'something');
  assert.equal(saveComment('c3', '    '), '');
  assert.equal(getComment('c3'), '');
});

test('a comment and a rating coexist under one key without overwriting', () => {
  setRating('c4', -1);
  saveComment('c4', 'the second example contradicts the first');
  assert.equal(getRating('c4'), -1);                    // comment did not clear the rating
  assert.equal(getComment('c4'), 'the second example contradicts the first');
  setRating('c4', 1);
  assert.equal(getComment('c4'), 'the second example contradicts the first'); // rating did not clear it
  assert.equal(getRating('c4'), 1);
});

test('a comment can be left without any rating', () => {
  saveComment('c5', 'no rating, just a note');
  assert.equal(getRating('c5'), null);
  assert.equal(getComment('c5'), 'no rating, just a note');
  const agg = rateAggregate({ 'rating:c5': { c: 'no rating, just a note' } });
  assert.equal(agg.rated, 0);          // must NOT read as neutral
  assert.equal(agg.comments, 1);
  assert.equal(agg.score, null);
});

test('the question asked depends on the rating given', () => {
  setRating('c6', -1);
  assert.match(commentQuestion('c6'), /trying to do/);
  setRating('c6', 1);
  assert.match(commentQuestion('c6'), /worked/);
  assert.match(commentQuestion('never-rated-q'), /clearer/);
});

test('commentMarkup escapes stored text rather than injecting it', () => {
  saveComment('c7', '<img src=x onerror=alert(1)>');
  const html = commentMarkup('c7');
  assert.ok(!html.includes('<img src=x'));
  assert.match(html, /&lt;img/);
});

test('rateAggregate counts comments separately from ratings', () => {
  const a = rateAggregate({
    'rating:a': { v: 1, c: 'helpful' }, 'rating:b': { v: -1 },
    'rating:c': { c: 'comment only' }, 'rating:d': { c: '   ' },
  });
  assert.equal(a.rated, 2);
  assert.equal(a.comments, 2);         // whitespace-only does not count
});
