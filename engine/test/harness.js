// Load the browser runtime into Node so its pure functions can be tested.
//
// engine/app.js is written for a browser: it declares top-level consts and
// touches document at module scope. Rather than restructure a working runtime
// for testability, this harness gives it the few globals it needs, evaluates
// it, and returns the functions worth asserting on. That keeps the production
// file unchanged and the tests honest about what they cover.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
// Same files, same order, as every course's build.js concatenates them.
// sqlengine.js is first there too, and belongs here so the SQL grading path can
// be asserted on rather than re-implemented by the tests.
const PARTS = ['sqlengine.js', 'glossary.js', 'grade.js', 'feedback.js', 'app.js'];
const src = PARTS.map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');

function stubElement() {
  const el = {
    innerHTML: '', textContent: '', value: '', style: {}, dataset: {},
    classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    appendChild(){}, removeChild(){}, setAttribute(){}, removeAttribute(){},
    addEventListener(){}, removeEventListener(){}, querySelector(){ return stubElement(); },
    querySelectorAll(){ return []; }, focus(){}, scrollIntoView(){}, remove(){}
  };
  return el;
}

// `extra` injects course-level globals that a sibling dojo's src/config.js would
// define BEFORE the engine loads (DOJO_HOME, DOJO_NO_IAM_MERGE), which is how the
// per-course storage key is chosen. Omit it to get Dev Dojo's defaults.
function load(extra) {
  const sandbox = {
    console,
    document: {
      getElementById(){ return stubElement(); },
      querySelector(){ return stubElement(); },
      querySelectorAll(){ return []; },
      createElement(){ return stubElement(); },
      addEventListener(){}, body: stubElement(), documentElement: stubElement()
    },
    window: {},
    localStorage: {
      _d: new Map(),
      getItem(k){ return this._d.has(k) ? this._d.get(k) : null; },
      setItem(k, v){ this._d.set(k, String(v)); },
      removeItem(k){ this._d.delete(k); }
    },
    navigator: { userAgent: 'node' },
    setTimeout, clearTimeout, setInterval, clearInterval,
    STREAMS: [],
    QUIZZES: {}, QUIZZES_HAND: {}, GRADEJAVA: {},
    fetch: undefined, Worker: undefined, URL,
    Math, JSON, Date, RegExp, Array, Object, String, Number, Boolean, Error
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  Object.assign(sandbox, extra || {});
  vm.createContext(sandbox);
  // Expose the functions under test by name after evaluation.
  const exposed = ['localChecks', 'buildWorkerSrc', 'exDiff', 'shuffleQuiz', 'esc',
                   'rateAggregate', 'ratingMarkup', 'setRating', 'getRating', 'store',
                   'saveComment', 'getComment', 'commentQuestion', 'commentMarkup',
                   // storage identity and the one-time migration off the shared key
                   'STORE_KEY', 'STORE_LEGACY_KEY', 'storeSlug', 'migrateStore', 'courseKeys',
                   // shared helpers that had a duplicate copy, or none
                   'exSid', 'lessonExs', 'exLang', 'lineLabel', 'withTimeout',
                   // grading internals worth asserting on directly
                   'canonRows', 'sqlSelects', 'extractJson', 'gradeEpoch', 'gradeStale',
                   // the in-browser SQL engine and its sample data
                   'SQLDB', 'SQL_DATASETS',
                   // belt maths: the header count and the promotion must agree
                   'lessonsToNextBelt', 'beltName', 'doneCount', 'totalLessons',
                   // handles the tests need to set up a scenario
                   'STREAMS', 'localStorage'];
  const tail = '\n;(' + JSON.stringify(exposed) +
    ').forEach(function(n){ try { globalThis.__x = globalThis.__x || {}; globalThis.__x[n] = eval(n); } catch (e) {} });';
  vm.runInContext(src + tail, sandbox, { filename: 'engine/app.js' });
  return sandbox.__x || {};
}

module.exports = { load };
