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
        saveComment, getComment, commentQuestion, commentMarkup,
        exLang, lineLabel, withTimeout, canonRows, sqlSelects, exSid, lessonExs,
        storeSlug, STORE_KEY, STORE_LEGACY_KEY, SQLDB, SQL_DATASETS } = load();

// A throwaway copy of a sample database, since the engine mutates nothing but the
// grader always hands it a fresh one.
const sql = (name, q) => SQLDB.run(JSON.parse(JSON.stringify(SQL_DATASETS[name])), q);

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

/* ---------------------------------------------------- the in-browser SQL engine */
test('MIN and MAX compare text instead of coercing it to a number', () => {
  // Math.min/Math.max returned NaN for every text and date column, and a NaN
  // serializes exactly like NULL, so a wrong query could be graded correct.
  assert.equal(sql('library', 'SELECT MAX(published) FROM books')[0]['MAX(published)'], '2018-01-01');
  assert.equal(sql('library', 'SELECT MIN(published) FROM books')[0]['MIN(published)'], '1999-07-01');
  assert.equal(sql('library', 'SELECT MIN(title) FROM books')[0]['MIN(title)'], 'Clean Code');
  assert.equal(sql('library', 'SELECT MAX(title) FROM books')[0]['MAX(title)'], 'Working Effectively with Legacy Code');
});

test('MIN and MAX still order numbers numerically, not as strings', () => {
  // The trap in a comparison-based fix: '900' > '1400' as text.
  assert.equal(sql('library', 'SELECT MIN(price_cents) FROM books')[0]['MIN(price_cents)'], 1400);
  assert.equal(sql('library', 'SELECT MAX(price_cents) FROM books')[0]['MAX(price_cents)'], 5600);
});

test('MIN and MAX skip NULLs and return NULL for an empty group', () => {
  assert.equal(sql('library', "SELECT MAX(published) FROM books WHERE title = 'nothing'")[0]['MAX(published)'], null);
  // book 7 and 9 have published NULL; the max must ignore them, not become NULL.
  assert.equal(sql('library', 'SELECT MAX(published) FROM books')[0]['MAX(published)'], '2018-01-01');
});

test('no aggregate over the sample data produces a non-finite number', () => {
  // NaN and Infinity both serialize to null, which is what made a wrong query
  // indistinguishable from a right one. Nothing in the engine may produce them.
  for (const q of ['SELECT MIN(published), MAX(published) FROM books',
                   'SELECT COUNT(*), AVG(price_cents), SUM(price_cents) FROM books']) {
    for (const row of sql('library', q)) {
      for (const v of Object.values(row)) {
        assert.ok(!(typeof v === 'number' && !isFinite(v)), q + ' produced ' + v);
      }
    }
  }
});

test('COUNT(DISTINCT col) counts distinct values instead of mis-parsing', () => {
  // This used to return [{")": 0}]: correct standard SQL, nonsense result, no hint
  // that the syntax was unsupported.
  const r = sql('library', 'SELECT COUNT(DISTINCT author_id) FROM books');
  assert.equal(Object.keys(r[0])[0], 'COUNT(DISTINCT author_id)');
  assert.equal(r[0]['COUNT(DISTINCT author_id)'], 4);
  assert.equal(sql('library', 'SELECT COUNT(author_id) FROM books')[0]['COUNT(author_id)'], 10);
});

test('DISTINCT inside an aggregate works with an alias and with GROUP BY', () => {
  assert.equal(sql('library', 'SELECT COUNT(DISTINCT author_id) AS n FROM books')[0].n, 4);
  const g = sql('shop', 'SELECT u.name AS who, COUNT(DISTINCT o.total_cents) AS n FROM users u JOIN orders o ON o.user_id = u.id GROUP BY u.name');
  assert.equal(g.find(r => r.who === 'Ada').n, 3);   // 20000, 40000, 5000
  assert.equal(g.find(r => r.who === 'Bo').n, 1);
});

test('an unsupported function says so rather than returning a silent NULL', () => {
  assert.throws(() => sql('library', 'SELECT UPPER(title) FROM books'), /unsupported function: UPPER/);
});

test('every shipped SQL exercise reference still parses and runs', () => {
  // Guards the checkAgg() rejection above against over-reach.
  for (const q of ['SELECT * FROM books',
                   "SELECT title FROM books WHERE price_cents < 1500 ORDER BY title ASC",
                   'SELECT COUNT(*), AVG(price_cents) FROM books']) {
    assert.ok(Array.isArray(sql('library', q)), q);
  }
  assert.ok(Array.isArray(sql('shop', 'SELECT u.name FROM users u JOIN orders o ON o.user_id = u.id GROUP BY u.name HAVING SUM(total_cents) > 50000')));
  assert.ok(Array.isArray(sql('org', 'SELECT e.name, d.name FROM employees e FULL OUTER JOIN departments d ON d.id = e.dept_id')));
});

/* --------------------------------------------------------- SQL result compare */
test('canonRows does not treat a non-finite number as NULL', () => {
  // JSON.stringify turns NaN into null, so these two used to compare equal and a
  // query that computed nonsense scored the same as one that returned NULL.
  assert.notEqual(canonRows([{ a: NaN }], false), canonRows([{ a: null }], false));
  assert.notEqual(canonRows([{ a: Infinity }], false), canonRows([{ a: null }], false));
  assert.equal(canonRows([{ a: NaN }], false), canonRows([{ a: NaN }], false));
});

test('canonRows compares values, and ignores row order unless asked not to', () => {
  assert.equal(canonRows([{ a: 1 }, { a: 2 }], false), canonRows([{ a: 2 }, { a: 1 }], false));
  assert.notEqual(canonRows([{ a: 1 }, { a: 2 }], true), canonRows([{ a: 2 }, { a: 1 }], true));
});

test('sqlSelects is the one definition of which statements get run', () => {
  const src = "-- a comment\nSELECT 1 FROM t;\n/* block */\nINSERT INTO t VALUES (1);\nselect 2 from t";
  assert.equal(sqlSelects(src).map(s => s.replace(/\s+/g, ' ')).join(' | '),
               'SELECT 1 FROM t | select 2 from t');
});

/* ------------------------------------------------- AI paths: language and safety */
test('the AI prompts name the exercise language instead of always saying Java', () => {
  // The hint prompt was hardcoded to "this Java exercise" in a shared engine, so
  // every shell, SQL, YAML, JSX and text exercise, and all of JS and Identity
  // Dojo, asked for help with the wrong language.
  assert.equal(exLang({ lang: 'sql' }), 'SQL');
  assert.equal(exLang({ lang: 'shell' }), 'shell');
  assert.equal(exLang({ lang: 'jsx' }), 'React (JSX)');
  assert.equal(exLang({ lang: 'js' }), 'JavaScript');
  assert.equal(exLang({ lang: 'text' }), 'short-answer');
  assert.equal(exLang({}), 'Java');            // absent lang means Java, the default
  assert.equal(exLang(undefined), 'Java');
  assert.equal(exLang({ lang: 'zig' }), 'zig'); // unknown, but never called Java
});

test('a line number quoted back from the runner cannot inject markup', () => {
  assert.equal(lineLabel('<img src=x onerror=alert(1)>'), '?');
  assert.equal(lineLabel('12'), '12');
  assert.equal(lineLabel(12), '12');
  assert.equal(lineLabel(undefined), '?');
  assert.equal(lineLabel(0), '?');
  assert.equal(lineLabel(-3), '?');
});

test('withTimeout rejects a run that never settles, and clears its timer', async () => {
  // The AI grading path had no deadline: a runner that never answered left the
  // Run button disabled for the rest of the session.
  await assert.rejects(withTimeout(new Promise(() => {}), 20, 'timed out'), /timed out/);
  assert.equal(await withTimeout(Promise.resolve('ok'), 1000, 'nope'), 'ok');
  await assert.rejects(withTimeout(Promise.reject(new Error('boom')), 1000, 'nope'), /boom/);
  // A non-promise value passes straight through, which is what askClaude may return.
  assert.equal(await withTimeout('plain', 1000, 'nope'), 'plain');
});

test('withTimeout does not hold the process open after it settles', async () => {
  // If the loser's timer were left armed, node would sit for the full duration.
  const t0 = Date.now();
  await withTimeout(Promise.resolve(1), 60000, 'nope');
  assert.ok(Date.now() - t0 < 1000);
});

/* ------------------------------------------------- exercise ids, one definition */
test('exSid keys a single-exercise lesson by its bare id and numbers the rest', () => {
  // Three files carried their own inline copy of this expression; they now all
  // call it, so a change here can never desync a learner's saved progress.
  assert.equal(exSid({ id: 'l1' }, [{}], 0), 'l1');
  assert.equal(exSid({ id: 'l1' }, [{}, {}], 0), 'l1#0');
  assert.equal(exSid({ id: 'l1' }, [{}, {}], 1), 'l1#1');
});

test('lessonExs accepts either shape a lesson can declare', () => {
  assert.equal(lessonExs({ ex: { title: 'a' } }).length, 1);
  assert.equal(lessonExs({ exs: [{}, {}] }).length, 2);
  assert.equal(lessonExs({}).length, 0);
});

/* ------------------------------------------------------- per-course storage key */
test('each course stores its progress under its own key', () => {
  // All three courses wrote into one 'javadojo' blob keyed by bare lesson id.
  assert.equal(STORE_KEY, 'dojo:dev-dojo');
  assert.equal(STORE_LEGACY_KEY, 'javadojo');
  assert.equal(load({ DOJO_HOME: { name: 'JS Dojo' } }).STORE_KEY, 'dojo:js-dojo');
  assert.equal(load({ DOJO_HOME: { name: 'Identity Dojo' } }).STORE_KEY, 'dojo:identity-dojo');
  assert.notEqual(load({ DOJO_HOME: { name: 'JS Dojo' } }).STORE_KEY,
                  load({ DOJO_HOME: { name: 'Identity Dojo' } }).STORE_KEY);
});

test('storeSlug always yields a usable key segment', () => {
  assert.equal(storeSlug('Dev Dojo'), 'dev-dojo');
  assert.equal(storeSlug('  ML Dojo (beta)!  '), 'ml-dojo-beta');
  assert.equal(storeSlug(''), 'dev-dojo');
  assert.equal(storeSlug(null), 'dev-dojo');
  assert.equal(storeSlug('***'), 'dev-dojo');
});

test('two courses in one browser no longer share a store', () => {
  const js = load({ DOJO_HOME: { name: 'JS Dojo' } });
  const id = load({ DOJO_HOME: { name: 'Identity Dojo' } });
  js.store.patch('collide', { done: true });
  id.store.patch('collide', { done: false, code: 'mine' });
  // Separate sandboxes, so assert on the keys each one writes rather than on one
  // shared localStorage: an id used by both courses is now two distinct entries.
  assert.notEqual(js.STORE_KEY, id.STORE_KEY);
  assert.equal(js.localStorage.getItem(id.STORE_KEY), null);
  assert.equal(id.localStorage.getItem(js.STORE_KEY), null);
});

/* --------------------------------------------- migration off the shared key */
function seeded(courseName, streams, legacy) {
  const h = load(courseName ? { DOJO_HOME: { name: courseName } } : undefined);
  streams.forEach(s => h.STREAMS.push(s));
  if (legacy !== undefined) h.localStorage.setItem('javadojo', JSON.stringify(legacy));
  return h;
}
const JS_STREAM = { title: 'S', lessons: [{ id: 'js1', ex: {} }, { id: 'js2', exs: [{}, {}] }] };

test('migration carries a learner\'s finished lessons to the new key', () => {
  const h = seeded('JS Dojo', [JS_STREAM], {
    js1: { done: true, completedAt: 1 }, 'js2#0': { done: true }, 'js2#1': { code: 'draft' },
    'rating:js1': { v: 1, c: 'good' },
  });
  assert.equal(h.migrateStore(), 4);
  const d = h.store.get();
  assert.equal(d.js1.done, true);
  assert.equal(d['js2#0'].done, true);
  assert.equal(d['js2#1'].code, 'draft');       // unsent editor code survives too
  assert.equal(d['rating:js1'].c, 'good');
});

test('migration takes only the entries the course owns', () => {
  const h = seeded('JS Dojo', [JS_STREAM], {
    js1: { done: true }, devOnly: { done: true }, 'rating:devOnly': { v: -1 },
  });
  assert.equal(h.migrateStore(), 1);
  assert.equal(Object.keys(h.store.get()).join(','), 'js1');
});

test('migration never deletes the shared blob it read from', () => {
  const h = seeded('JS Dojo', [JS_STREAM], { js1: { done: true } });
  h.migrateStore();
  assert.equal(h.localStorage.getItem('javadojo'), JSON.stringify({ js1: { done: true } }));
});

test('migration runs once and never overwrites later work', () => {
  const h = seeded('JS Dojo', [JS_STREAM], { js1: { done: true }, 'js2#0': { done: true } });
  assert.equal(h.migrateStore(), 2);
  h.store.patch('js1', { code: 'written after migrating' });
  assert.equal(h.migrateStore(), 0);            // the key exists now, so it is left alone
  assert.equal(h.store.get().js1.code, 'written after migrating');
});

test('migration is a no-op with nothing to migrate', () => {
  assert.equal(seeded('JS Dojo', [JS_STREAM], undefined).migrateStore(), 0);
  assert.equal(seeded('JS Dojo', [JS_STREAM], {}).migrateStore(), 0);
  assert.equal(seeded('JS Dojo', [JS_STREAM], { devOnly: { done: true } }).migrateStore(), 0);
  assert.equal(seeded('JS Dojo', [], { js1: { done: true } }).migrateStore(), 0);
});

test('migration survives a corrupt or hostile legacy value', () => {
  const bad = h => { h.localStorage.setItem('javadojo', 'not json at all'); return h.migrateStore(); };
  assert.equal(bad(seeded('JS Dojo', [JS_STREAM])), 0);
  const arr = seeded('JS Dojo', [JS_STREAM]);
  arr.localStorage.setItem('javadojo', '[1,2,3]');
  assert.equal(arr.migrateStore(), 0);
});

test('courseKeys covers every id a lesson can be stored under', () => {
  const h = seeded('JS Dojo', [JS_STREAM]);
  const keys = h.courseKeys();
  ['js1', 'rating:js1', 'js2#0', 'js2#1', 'rating:js2#0', 'rating:js2#1'].forEach(
    k => assert.ok(keys.has(k), 'missing ' + k));
});

/* -------------------------------------------------------- SQL: LIKE and syntax */
test('LIKE still matches the way it did, with % and _', () => {
  const titles = q => sql('library', q).map(r => r.title).sort().join('|');
  assert.equal(titles("SELECT title FROM books WHERE title LIKE 'Java%'"),
               'Java Concurrency in Practice|Java Puzzlers');
  assert.equal(titles("SELECT title FROM books WHERE title LIKE '%Java%'"),
               'Effective Java|Head First Java|Java Concurrency in Practice|Java Puzzlers');
  assert.equal(titles("SELECT title FROM books WHERE title LIKE '_ffective Java'"), 'Effective Java');
  assert.equal(titles("SELECT title FROM books WHERE title LIKE 'Clean Code'"), 'Clean Code');
  assert.equal(titles("SELECT title FROM books WHERE title LIKE 'clean code'"), ''); // case-sensitive, as before
  assert.equal(titles("SELECT title FROM books WHERE title LIKE '%'").split('|').length, 10);
});

test('LIKE treats regex metacharacters in the pattern as literal text', () => {
  // The old implementation escaped them before compiling; the new one never
  // compiles anything, and must still not match 'C' against '.'.
  assert.equal(sql('library', "SELECT title FROM books WHERE title LIKE '.lean Code'").length, 0);
  assert.equal(sql('library', "SELECT title FROM books WHERE title LIKE 'Clean Code'").length, 1);
});

test('a run of % in a LIKE pattern cannot hang the browser', () => {
  // Ten of them used to backtrack for 38 seconds on this ten-row table, with no
  // way for the learner to interrupt a query they typed themselves.
  const t0 = Date.now();
  sql('library', "SELECT title FROM books WHERE title LIKE '" + '%'.repeat(40) + "zzz'");
  const ms = Date.now() - t0;
  assert.ok(ms < 500, '40 wildcards took ' + ms + 'ms');
});

test('incomplete SQL says what is missing instead of failing as JavaScript', () => {
  assert.throws(() => sql('library', 'SELECT * FROM books WHERE price_cents >'),
                /nothing to compare against after price_cents >/);
  assert.throws(() => sql('library', 'SELECT * FROM books ORDER BY'), /ORDER BY needs a column/);
});

test('a LIMIT with no number errors rather than silently returning no rows', () => {
  // parseInt(undefined) is NaN and slice(0, NaN) is empty, so the learner used to
  // get a confident "0 rows" for a query that never had a row count at all.
  assert.throws(() => sql('library', 'SELECT * FROM books LIMIT'), /LIMIT needs a whole number/);
  assert.throws(() => sql('library', 'SELECT * FROM books LIMIT 3 OFFSET'), /OFFSET needs a whole number/);
  assert.equal(sql('library', 'SELECT * FROM books LIMIT 3').length, 3);
  assert.equal(sql('library', 'SELECT * FROM books LIMIT 3 OFFSET 8').length, 2);
});

/* ------------------------------------------------------------- belt arithmetic */
// One sandbox, reset per case: a fresh load() per scenario evaluates the whole
// runtime thousands of times and turns a two-second suite into a slow one.
const beltBox = load();
function beltCourse(nLessons, nDone) {
  beltBox.STREAMS.length = 0;
  beltBox.STREAMS.push({ title: 'S', lessons: Array.from({ length: nLessons }, (_, i) => ({ id: 'l' + i, ex: {} })) });
  const d = {};
  for (let i = 0; i < nDone; i++) d['l' + i] = { done: true, completedAt: 1 };
  beltBox.store.set(d);
  return beltBox;
}

test('the "N to next belt" hint counts the lesson that actually earns the belt', () => {
  // The belt is awarded on the ROUNDED percentage, so ceil() of the exact
  // threshold asked for one lesson more than the promotion needs.
  for (const total of [181, 150, 63, 100, 200]) {
    for (let done = 0; done < total; done++) {
      const h = beltCourse(total, done);
      const hint = h.lessonsToNextBelt();
      if (!hint) continue;                       // already black belt
      const before = h.beltName();
      const after = beltCourse(total, done + hint.count).beltName();
      assert.equal(after, hint.name,
        total + ' lessons, ' + done + ' done: hint promised ' + hint.name + ' after ' + hint.count + ', got ' + after);
      // and one fewer must NOT be enough, or the count is still too high
      if (hint.count > 1) {
        const short = beltCourse(total, done + hint.count - 1).beltName();
        assert.equal(short, before,
          total + ' lessons, ' + done + ' done: ' + (hint.count - 1) + ' would already have been enough');
      }
    }
  }
});

/* ----------------------------------------------------------------- store reads */
test('the store still reflects a write made outside it', () => {
  // get() caches the parsed blob, keyed on the stored text, so another tab's
  // write and the account bridge's pull are both still picked up.
  const h = load();
  h.store.set({ a: { done: true } });
  assert.equal(h.store.lesson('a').done, true);
  h.localStorage.setItem(h.STORE_KEY, JSON.stringify({ b: { done: true } }));
  assert.equal(h.store.lesson('b').done, true);
  assert.equal(Object.keys(h.store.lesson('a')).length, 0);
});

test('the store reads back what patch wrote, repeatedly', () => {
  const h = load();
  h.store.patch('x', { done: true });
  h.store.patch('x', { code: 'hello' });
  h.store.patch('y', { hintIdx: 2 });
  assert.equal(h.store.lesson('x').done, true);
  assert.equal(h.store.lesson('x').code, 'hello');
  assert.equal(h.store.lesson('y').hintIdx, 2);
  assert.equal(JSON.parse(h.localStorage.getItem(h.STORE_KEY)).x.code, 'hello');
});
