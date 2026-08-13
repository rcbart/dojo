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
const src = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');

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

function load() {
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
  vm.createContext(sandbox);
  // Expose the functions under test by name after evaluation.
  const exposed = ['localChecks', 'buildWorkerSrc', 'exDiff', 'shuffleQuiz', 'esc'];
  const tail = '\n;(' + JSON.stringify(exposed) +
    ').forEach(function(n){ try { globalThis.__x = globalThis.__x || {}; globalThis.__x[n] = eval(n); } catch (e) {} });';
  vm.runInContext(src + tail, sandbox, { filename: 'engine/app.js' });
  return sandbox.__x || {};
}

module.exports = { load };
