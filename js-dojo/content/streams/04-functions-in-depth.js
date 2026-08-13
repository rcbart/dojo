STREAMS.push({icon:'⚙️',title:'Functions in Depth: Scope, Closures & this',blurb:'The mechanics underneath: the call stack, the scope chain, closures and why they are not magic once you have seen the stack, the five ways this gets its value, call/apply/bind, and recursion with its limits.',lessons:[

{id:'js14',title:'The call stack and the scope chain',body:`
<p>Closures, <code>this</code> and hoisting all stop being mysterious once you can picture what the
engine is actually doing. That picture is two structures: a <b>stack</b> of calls, and a <b>chain</b> of
scopes.</p>

<h4>The call stack</h4>
<p>Every function call pushes a <b>frame</b> — the function, its arguments, its local variables and where
to return to. When the function returns, its frame pops. JavaScript has <b>one</b> stack, which is what
"single-threaded" means in practice.</p>
<div class="codeSample" data-hl>function a() { b(); }
function b() { c(); }
function c() { throw new Error("boom"); }
a();

// the stack, top first - and this IS what a stack trace prints:
//   at c
//   at b
//   at a
//   at (top level)
// read a stack trace TOP-DOWN: the top line is where it broke, and each
// line below it is who called the line above.</div>
<p>The stack is finite. Recursion that never terminates fills it and throws
<code>RangeError: Maximum call stack size exceeded</code> — a message that means "infinite recursion"
far more often than it means "my data was too deep".</p>

<h4>The scope chain</h4>
<p><b>Scope</b> is where a name is visible. When code reads a name, the engine looks in the current
scope, then the scope that <i>contains it in the source</i>, and outward until it reaches global — then
throws <code>ReferenceError</code>.</p>
<div class="codeSample" data-hl>const g = "global";
function outer() {
  const o = "outer";
  function inner() {
    const i = "inner";
    console.log(i, o, g);   // finds i here, o one level out, g at global
  }
  inner();
}
// inner sees outward. NOTHING sees inward - outer cannot read i.</div>

<h4>Lexical scoping — the rule that makes closures work</h4>
<p>The chain is decided by <b>where the function is written</b>, not where it is called from. That is
<b>lexical</b> (or static) scoping, and it is why you can determine what a function can see just by
reading the source:</p>
<div class="codeSample" data-hl>const x = "module";
function show() { console.log(x); }     // x resolves where show is WRITTEN

function run() {
  const x = "local";
  show();                                // prints "module", not "local"
}</div>
<p>Contrast with <code>this</code>, which is decided by <b>how a function is called</b>. That single
difference causes most <code>this</code> confusion, and the lesson after next is about it.</p>

<h4>Shadowing, and the global object</h4>
<div class="codeSample" data-hl>const name = "outer";
function f() {
  const name = "inner";     // SHADOWS the outer one inside f
  console.log(name);        // "inner"
}

// and the one to avoid: assigning without declaring
function bad() { leaked = 1; }   // creates a GLOBAL in sloppy mode
// "use strict" (and every module) makes this a ReferenceError instead,
// which is why modern code never hits it.</div>`,
docs:[['MDN — Scope','https://developer.mozilla.org/en-US/docs/Glossary/Scope'],['MDN — Call stack','https://developer.mozilla.org/en-US/docs/Glossary/Call_stack'],['MDN — Strict mode','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode']],
ex:{title:'Trace the scope chain',diff:'easy',lang:'js',
run:{call:'lookUp',cases:[
 {name:'found in the innermost scope',args:[['x'],['x','y'],['x','y','z'],'x'],expect:'inner'},
 {name:'found one level out',args:[['g'],['o'],['i'],'o'],expect:'middle'},
 {name:'found at global',args:[['g'],['o'],['i'],'g'],expect:'outer'},
 {name:'not found anywhere',args:[['g'],['o'],['i'],'zzz'],expect:'ReferenceError'},
 {name:'the innermost wins when shadowed',args:[['n'],['n'],['n'],'n'],expect:'inner'}]},
prompt:`Write <code>function lookUp(outerNames, middleNames, innerNames, name)</code> that models a lookup. Search <code>innerNames</code> first and return <code>"inner"</code>, then <code>middleNames</code> and return <code>"middle"</code>, then <code>outerNames</code> and return <code>"outer"</code>. If the name is in none of them, return <code>"ReferenceError"</code>.`,
starter:`function lookUp(outerNames, middleNames, innerNames, name) {
  return null;
}`,
solution:`function lookUp(outerNames, middleNames, innerNames, name) {
  if (innerNames.includes(name)) return "inner";    // innermost first
  if (middleNames.includes(name)) return "middle";
  if (outerNames.includes(name)) return "outer";
  return "ReferenceError";                           // fell off the chain
}`,
tests:[{d:'searches the innermost scope first',re:'innerNames'},{d:'then the enclosing scope',re:'middleNames'},{d:'then the outer scope',re:'outerNames'},{d:'throws off the end of the chain',re:'"ReferenceError"'}],
behavior:`The shadowing case executes the ordering: with the same name in all three, the innermost must win — which is exactly what shadowing means. Searching outward-in instead would return "outer" and pass the other four cases, so order is what this exercise actually checks.`,
hints:['Three checks in order, innermost first.','includes() tells you whether a name is in a scope.','Reaching the end of the chain is a ReferenceError, not undefined.']}},

{id:'js15',title:'Closures',body:`
<p>A <b>closure</b> is a function together with the scope it was created in. The function keeps that scope
alive after the enclosing call has returned — which sounds exotic and is really just the scope chain plus
one rule: <b>a scope survives as long as something can still reach it.</b></p>

<div class="codeSample" data-hl>function makeCounter() {
  let count = 0;                    // a local of makeCounter
  return function () {              // this function CLOSES OVER count
    count += 1;
    return count;
  };
}
const next = makeCounter();
next();   // 1
next();   // 2      <- count survived, and it is still the same count

const other = makeCounter();
other();  // 1      <- a SEPARATE call, so a separate count</div>
<p>Every call to <code>makeCounter</code> creates a fresh scope, so each returned function gets its own
<code>count</code>. That is the mechanism behind almost every practical use.</p>

<h4>What closures are actually for</h4>
<div class="codeSample" data-hl>// 1. PRIVATE STATE - the variable is unreachable from outside
function makeAccount(balance) {
  return {
    deposit: amount =&gt; { balance += amount; return balance; },
    get: () =&gt; balance
  };
}
// there is no way to set balance directly. that is real encapsulation.

// 2. CONFIGURATION captured once
const prefixer = prefix =&gt; text =&gt; \`\${prefix}: \${text}\`;
const warn = prefixer("WARN");
warn("disk full");        // "WARN: disk full"

// 3. anything that runs LATER and needs today's values:
//    event handlers, setTimeout callbacks, promise callbacks</div>

<h4>The loop bug, and why <code>let</code> fixed it</h4>
<div class="codeSample" data-hl>for (var i = 0; i &lt; 3; i++) setTimeout(() =&gt; console.log(i));
// 3, 3, 3 - var is FUNCTION-scoped: one i, shared by all three closures,
//           and by the time the timeouts run the loop has finished.

for (let i = 0; i &lt; 3; i++) setTimeout(() =&gt; console.log(i));
// 0, 1, 2 - let creates a NEW BINDING PER ITERATION, so each closure
//           captured a different i.</div>
<p>This is the clearest demonstration of what closures capture: <b>a binding, not a value</b>. The
callbacks did not copy <code>i</code> — they kept a reference to the variable, and read it when they
finally ran.</p>

<h4>The cost</h4>
<p>A closure keeps its entire enclosing scope alive, not just the variables it uses. That is normally
irrelevant and occasionally a memory leak: a callback that captures a scope containing a large array, and
is registered on a long-lived event emitter, keeps that array reachable forever. The fix is to
unregister the handler, or to extract only what you need before creating the closure.</p>`,
docs:[['MDN — Closures','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures'],['MDN — let and per-iteration bindings','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let']],
exs:[
{title:'Build a counter with private state',diff:'easy',lang:'js',
run:{call:'runCounter',cases:[
 {name:'counts up from 1',args:[3],expect:[1,2,3]},
 {name:'a single call',args:[1],expect:[1]},
 {name:'zero calls',args:[0],expect:[]},
 {name:'longer runs keep counting',args:[5],expect:[1,2,3,4,5]}]},
prompt:`Write <code>function makeCounter()</code> returning a function that yields 1, 2, 3, ... on successive calls, and <code>function runCounter(n)</code> that creates one counter and returns an array of its first <code>n</code> results.`,
starter:`function makeCounter() {
  return null;
}
function runCounter(n) {
  return [];
}`,
solution:`function makeCounter() {
  let count = 0;              // private: only the returned function sees it
  return function () {
    count += 1;               // the closure MUTATES the captured binding
    return count;
  };
}
function runCounter(n) {
  const next = makeCounter();
  const out = [];
  for (let i = 0; i < n; i++) out.push(next());
  return out;
}`,
tests:[{d:'keeps the count outside the returned function',re:'let\\s+count\\s*=\\s*0'},{d:'returns a function',re:'return\\s+function|=>'},{d:'creates one counter and calls it repeatedly',re:'makeCounter\\(\\)'}],
behavior:`Your makeCounter is called through runCounter, so both must be right. The state has to live in the enclosing scope: declaring count inside the returned function would reset it to 0 on every call and produce [1,1,1].`,
hints:['Declare the counter variable in makeCounter, before the returned function.','The inner function increments and returns it.','runCounter should call makeCounter ONCE, then call the result n times.']},
{title:'Capture per iteration, not per loop',diff:'medium',lang:'js',
run:{call:'makeAdders',cases:[
 {name:'each function adds its own index',args:[3,10],expect:[10,11,12]},
 {name:'a single adder',args:[1,0],expect:[0]},
 {name:'none',args:[0,5],expect:[]},
 {name:'the captured values are distinct, not all the last one',args:[4,0],expect:[0,1,2,3]}]},
prompt:`Write <code>function makeAdders(n, base)</code> that builds <code>n</code> functions — the <code>i</code>th adds <code>i</code> to its argument — then calls each one with <code>base</code> and returns the results as an array. Each function must capture its own <code>i</code>.`,
starter:`function makeAdders(n, base) {
  return [];
}`,
solution:`function makeAdders(n, base) {
  const fns = [];
  for (let i = 0; i < n; i++) {      // let: a NEW binding each iteration
    fns.push(x => x + i);            // so each closure captures its own i
  }
  return fns.map(f => f(base));
}`,
tests:[{d:'uses let for the per-iteration binding',re:'for\\s*\\(\\s*let\\s+i'},{d:'creates a closure per iteration',re:'push\\('},{d:'does not use var',re:'var\\s+i',not:true}],
behavior:`The last case is the classic bug executed as a test: with var, all four closures share one i and return [4,4,4,4] because the loop finished before any of them ran. With let, each captured a distinct binding and you get [0,1,2,3].`,
hints:['let in the for header gives each iteration its own binding.','Build the array of functions first, then call them.','If every result is the same, you captured one shared variable.']},
{title:'Memoise with a closure',diff:'hard',lang:'js',
run:{call:'runMemo',cases:[
 {name:'repeated calls return the same answers',args:[[2,3,2,3]],expect:{results:[4,9,4,9],computed:2}},
 {name:'every call is distinct, so all are computed',args:[[1,2,3]],expect:{results:[1,4,9],computed:3}},
 {name:'one value repeated many times computes once',args:[[5,5,5,5]],expect:{results:[25,25,25,25],computed:1}},
 {name:'no calls at all',args:[[]],expect:{results:[],computed:0}},
 {name:'zero is cached like any other key',args:[[0,0]],expect:{results:[0,0],computed:1}}]},
prompt:`Write <code>function makeSquarer()</code> returning an object <code>{ square, computed }</code> where <code>square(n)</code> returns <code>n * n</code> but only does the multiplication <b>once per distinct input</b> — later calls with the same number come from a cache held in a closure. <code>computed()</code> returns how many multiplications actually happened. Then write <code>function runMemo(inputs)</code> that creates one squarer, calls <code>square</code> on each input, and returns <code>{ results, computed }</code>.`,
starter:`function makeSquarer() {
  return { square: null, computed: null };
}
function runMemo(inputs) {
  return { results: [], computed: 0 };
}`,
solution:`function makeSquarer() {
  const cache = new Map();      // private to the closure - nothing else can
  let count = 0;                // see or corrupt it

  function square(n) {
    if (cache.has(n)) return cache.get(n);   // has(), not a truthy check:
    count++;                                  // a cached 0 is a real answer
    const value = n * n;
    cache.set(n, value);
    return value;
  }
  return { square, computed: () => count };
}
function runMemo(inputs) {
  const s = makeSquarer();
  const results = inputs.map(n => s.square(n));
  return { results, computed: s.computed() };
}`,
tests:[{d:'holds a cache in the closure',re:'new\\s+Map|\\{\\s*\\}'},{d:'checks the cache before computing',re:'\\.has\\(|in\\s+cache'},{d:'counts only real computations',re:'count\\+\\+|count\\s*\\+='},{d:'creates one squarer',re:'makeSquarer\\(\\)'}],
behavior:`The last case is the one that separates a correct memoiser from a plausible one: 0 * 0 is 0, which is falsy, so a cache check written as "if (cache.get(n)) return ..." recomputes it every time and reports 2 instead of 1. Use has() to ask whether a key exists rather than whether its value is truthy. The cache and the counter both live in the closure, so nothing outside can reach or reset them.`,
hints:['Declare the cache and the counter in makeSquarer, before the inner function.','Use Map.has to test for presence — a cached value of 0 is falsy.','Increment the counter only on the path that actually multiplies.']}]},

{id:'js16',title:'this: five rules, in order',body:`
<p><code>this</code> is decided <b>at call time</b>, by <i>how</i> the function was called — not where it
was written. Once you know the five rules and their precedence, the behaviour becomes entirely
predictable.</p>

<div class="codeSample" data-hl>1. new binding        new Fn()          this = the new object
2. explicit binding   fn.call(o)        this = o
                      fn.apply(o)
                      fn.bind(o)
3. method call        obj.fn()          this = obj  (whatever is left of the dot)
4. plain call         fn()              this = undefined in strict mode / modules
                                               = globalThis in sloppy mode
5. arrow function     () =&gt; {}           NO OWN this - inherits from where it
                                        was DEFINED. rules 1-4 do not apply.

// checked in that order. new beats bind beats the dot beats nothing.</div>

<h4>Rule 3 is the one that breaks</h4>
<p>"Whatever is left of the dot" means <code>this</code> is bound by the <i>call</i>, so pulling a method
off its object loses it:</p>
<div class="codeSample" data-hl>const user = { name: "Ada", greet() { return \`hi \${this.name}\`; } };

user.greet();                    // "hi Ada"     - called with the dot
const g = user.greet;            // just a function value now
g();                             // TypeError: cannot read 'name' of undefined

setTimeout(user.greet, 100);     // same problem - passed WITHOUT the dot
setTimeout(() =&gt; user.greet(), 100);        // fixed: the dot survives
setTimeout(user.greet.bind(user), 100);     // fixed: bound permanently</div>
<p>This is the single most common <code>this</code> bug, and it appears wherever a method is passed as a
callback — event listeners, timers, array methods, React class components.</p>

<h4>Arrows: the rule that overrides the others</h4>
<div class="codeSample" data-hl>const timer = {
  count: 0,
  startBad() {
    setInterval(function () { this.count++; }, 1000);
    // plain call -> this is undefined/global. count never changes.
  },
  startGood() {
    setInterval(() =&gt; { this.count++; }, 1000);
    // arrow -> inherits this from startGood, which was called with a dot.
  }
};

// and the inverse mistake:
const obj = { n: 1, get: () =&gt; this.n };   // arrow at the TOP level
obj.get();   // undefined - it inherited the module's this, not obj's</div>
<p>The rule of thumb: <b>arrow for callbacks, regular function for methods.</b> An arrow as an object
method or a prototype method is almost always wrong.</p>

<h4><code>call</code>, <code>apply</code> and <code>bind</code></h4>
<div class="codeSample" data-hl>fn.call(thisArg, a, b)      // invoke now, arguments listed
fn.apply(thisArg, [a, b])   // invoke now, arguments as an ARRAY
fn.bind(thisArg, a)         // returns a NEW function, permanently bound.
                            // does NOT invoke. binding is irreversible -
                            // calling .bind again on the result has no effect.</div>
<p>You will read these constantly in older code. In new code, spread has largely replaced
<code>apply</code> and arrows have largely replaced <code>bind</code> — but <code>bind</code> remains the
right tool when a method must be detached from its object and keep working.</p>`,
docs:[['MDN — this','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this'],['MDN — Function.prototype.bind','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind'],['MDN — Arrow functions and this','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions#cannot_be_used_as_methods']],
ex:{title:'Which rule applies?',diff:'easy',lang:'js',
run:{call:'thisIs',cases:[
 {name:'new wins over everything',args:['new'],expect:'the new object'},
 {name:'explicit binding',args:['bind'],expect:'the bound object'},
 {name:'call is explicit binding too',args:['call'],expect:'the bound object'},
 {name:'a method call',args:['method'],expect:'the object left of the dot'},
 {name:'a detached plain call',args:['plain'],expect:'undefined'},
 {name:'an arrow inherits',args:['arrow'],expect:'the enclosing scope'},
 {name:'anything unrecognised',args:['zzz'],expect:'unknown'}]},
prompt:`Write <code>function thisIs(callStyle)</code> returning what <code>this</code> will be: <code>"new"</code>&rarr;<code>"the new object"</code>; <code>"bind"</code> and <code>"call"</code>&rarr;<code>"the bound object"</code>; <code>"method"</code>&rarr;<code>"the object left of the dot"</code>; <code>"plain"</code>&rarr;<code>"undefined"</code> (strict mode); <code>"arrow"</code>&rarr;<code>"the enclosing scope"</code>; anything else&rarr;<code>"unknown"</code>.`,
starter:`function thisIs(callStyle) {
  return null;
}`,
solution:`function thisIs(callStyle) {
  switch (callStyle) {
    case "new":    return "the new object";
    case "bind":
    case "call":   return "the bound object";
    case "method": return "the object left of the dot";
    case "plain":  return "undefined";            // strict mode / modules
    case "arrow":  return "the enclosing scope";  // no own this at all
    default:       return "unknown";
  }
}`,
tests:[{d:'new binding',re:'"new"'},{d:'explicit binding covers both call and bind',re:'"bind"'},{d:'method call',re:'"method"'},{d:'arrows inherit',re:'"arrow"'}],
behavior:`Seven cases execute. The two worth holding on to: a detached plain call gives undefined in strict mode and modules — which is every modern file — and an arrow has no own this at all, so none of the other four rules can apply to it.`,
hints:['A switch with one case per rule.','call and bind are the same rule and share a return.','Modules are always strict, so a plain call gives undefined rather than the global object.']}},

{id:'js17',title:'Recursion, and knowing when to stop',body:`
<p>A <b>recursive</b> function calls itself. It is the natural shape for anything defined in terms of
smaller versions of itself — trees, nested objects, directory walks, parsing.</p>

<div class="codeSample" data-hl>function factorial(n) {
  if (n &lt;= 1) return 1;        // BASE CASE - stops the recursion
  return n * factorial(n - 1); // RECURSIVE CASE - moves TOWARD the base
}</div>
<p>Two parts, and both are mandatory. A missing base case, or a recursive call that does not move toward
it, gives you <code>RangeError: Maximum call stack size exceeded</code> — which almost always means a
logic error rather than genuinely deep data.</p>

<h4>Where it genuinely wins</h4>
<div class="codeSample" data-hl>// walking an arbitrarily nested structure - the iterative version needs
// an explicit stack, and is longer and harder to read
function countLeaves(node) {
  if (!node.children || node.children.length === 0) return 1;
  return node.children.reduce((sum, c) =&gt; sum + countLeaves(c), 0);
}

// deep search through nested objects, JSON traversal, tree flattening,
// directory recursion, expression parsing - all natural fits.</div>

<h4>Where it is the wrong tool</h4>
<p><b>Anything a loop expresses directly.</b> A recursive sum over an array is slower, uses stack space
proportional to the length, and is harder to read than <code>reduce</code>. Recursion earns its cost when
the <i>data</i> is recursive.</p>
<p><b>Naive recursion over overlapping subproblems.</b> The textbook <code>fib(n)</code> recomputes the
same values exponentially many times — <code>fib(40)</code> makes over 300 million calls. Memoise it with
a closure, or write the loop.</p>
<div class="codeSample" data-hl>const fib = (() =&gt; {
  const memo = new Map();                    // private, via closure
  return function f(n) {
    if (n &lt; 2) return n;
    if (memo.has(n)) return memo.get(n);      // the fix, in one line
    const v = f(n - 1) + f(n - 2);
    memo.set(n, v);
    return v;
  };
})();</div>

<h4>The depth limit is real</h4>
<p>JavaScript engines allow somewhere around 10,000 frames — the exact number varies by engine, platform
and frame size, so never depend on it. Tail-call optimisation is in the specification and, in practice,
implemented only by Safari, so <b>you cannot rely on deep recursion in JavaScript at all</b>. When depth
is genuinely unbounded — an untrusted directory tree, arbitrary nested JSON — convert to an iterative
version with an explicit array as the stack.</p>
<div class="codeSample" data-hl>function countIterative(root) {
  let n = 0;
  const stack = [root];                    // your own stack, on the heap
  while (stack.length) {
    const node = stack.pop();
    if (!node.children?.length) { n++; continue; }
    stack.push(...node.children);
  }
  return n;                                // no depth limit, no RangeError
}</div>`,
docs:[['MDN — Recursion','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions#recursion'],['MDN — RangeError','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RangeError']],
exs:[
{title:'Sum a nested structure',diff:'easy',lang:'js',
run:{call:'deepSum',cases:[
 {name:'a flat array',args:[[1,2,3]],expect:6},
 {name:'one level of nesting',args:[[1,[2,3]]],expect:6},
 {name:'deeply nested',args:[[1,[2,[3,[4]]]]],expect:10},
 {name:'an empty array',args:[[]],expect:0},
 {name:'empty nested arrays',args:[[[],[[]]]],expect:0},
 {name:'negatives and decimals',args:[[-1,[0.5,[0.5]]]],expect:0}]},
prompt:`Write <code>function deepSum(items)</code> that sums every number in an arbitrarily nested array. Use recursion: when an element is itself an array, recurse into it.`,
starter:`function deepSum(items) {
  return 0;
}`,
solution:`function deepSum(items) {
  let total = 0;
  for (const item of items) {
    total += Array.isArray(item) ? deepSum(item) : item;   // recurse or add
  }
  return total;
}`,
tests:[{d:'detects nested arrays',re:'Array\\.isArray'},{d:'calls itself',re:'deepSum\\s*\\('},{d:'accumulates a total',re:'\\+='}],
behavior:`Six cases execute, including empty arrays at several depths — the base case here is implicit: an empty array runs no iterations and returns the initial 0, so no explicit guard is needed. Array.isArray is what decides recurse-or-add, since typeof would report "object" for both.`,
hints:['Array.isArray tells you whether to recurse.','The empty array is the base case, and it works for free.','Accumulate into a total declared before the loop.']},
{title:'Convert recursion to iteration',diff:'medium',lang:'js',
run:{call:'depth',cases:[
 {name:'a flat array is depth 1',args:[[1,2]],expect:1},
 {name:'one nesting level',args:[[1,[2]]],expect:2},
 {name:'three levels',args:[[[[1]]]],expect:3},
 {name:'an empty array is still depth 1',args:[[]],expect:1},
 {name:'the deepest branch wins',args:[[1,[2],[[3]]]],expect:3}]},
prompt:`Write <code>function depth(items)</code> returning how deeply the array nests: a flat array is <code>1</code>, an array containing an array is <code>2</code>, and so on. When branches differ, the deepest wins.`,
starter:`function depth(items) {
  return 1;
}`,
solution:`function depth(items) {
  let deepest = 1;
  for (const item of items) {
    if (Array.isArray(item)) {
      deepest = Math.max(deepest, 1 + depth(item));   // 1 for this level
    }
  }
  return deepest;
}`,
tests:[{d:'checks for nested arrays',re:'Array\\.isArray'},{d:'takes the deepest branch',re:'Math\\.max'},{d:'adds a level when recursing',re:'1\\s*\\+\\s*depth'}],
behavior:`The last case executes the branching rule: [1,[2],[[3]]] has branches of depth 2 and 3, so the answer is 3 — taking the first or the last rather than the maximum would pass the simpler cases and fail here. The empty array returns the initial 1 without a special branch.`,
hints:['Start at 1 — the array you were given is itself one level.','Only recurse into elements that are arrays.','Keep the maximum across all branches, not the last one.']}]}

]});
