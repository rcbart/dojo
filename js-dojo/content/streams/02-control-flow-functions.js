STREAMS.push({icon:'🔀',title:'Control Flow & Functions',blurb:'Making decisions and repeating work: if/else and switch, the four loop forms and when each is right, and functions from the ground up: declarations vs expressions vs arrows, parameters and defaults, rest and arguments, return, and why early return beats nesting.',lessons:[

{id:'js6',title:'Making decisions: if, else and switch',body:`
<p>Every non-trivial program branches. JavaScript gives you three constructs, and choosing well is mostly
about how many outcomes there are and how much each branch does.</p>

<h4><code>if</code> / <code>else if</code> / <code>else</code></h4>
<div class="codeSample" data-hl>if (score &gt;= 90) {
  grade = "A";
} else if (score &gt;= 80) {
  grade = "B";
} else {
  grade = "C";
}

// order matters: the FIRST true branch wins and the rest are skipped.
// reversing these so 80 is tested first would give "B" to a score of 95.</div>
<p>Always use braces, even for a single statement. The braceless form is legal and it is the reason for a
famous class of bug: a second line added later looks like it is inside the branch and is not.</p>
<p>Remember from the previous stream that the condition is <b>coerced</b>. <code>if (count)</code> is
false when <code>count</code> is legitimately <code>0</code>, which is almost never what you meant. Write
the comparison you actually mean.</p>

<h4>The ternary: for values, not for logic</h4>
<div class="codeSample" data-hl>const label = count === 1 ? "item" : "items";      // good: picks a VALUE

// bad: a ternary doing work, and nested
const x = a ? (b ? doThing() : other()) : c ? third() : fourth();
//   nobody can read this. use if/else.</div>
<p>The rule that holds up: a ternary should <b>produce a value</b> and fit on one line. The moment it
contains side effects or nests, it has become an <code>if</code> wearing a disguise.</p>

<h4><code>switch</code>, and the fall-through trap</h4>
<div class="codeSample" data-hl>switch (method) {          // compares with === (strict) - no coercion
  case "GET":
  case "HEAD":
    return "safe";         // deliberate fall-through: both land here
  case "POST":
    return "unsafe";
  default:
    return "unknown";      // ALWAYS include a default
}

// the trap: without return or break, execution CONTINUES into the next
// case. that is the intended design, and it is also the single most
// common switch bug.</div>
<p>Because <code>switch</code> uses <code>===</code>, <code>switch (1)</code> will not match
<code>case "1"</code>. And a <code>default</code> is not optional in practice: a switch with no default
silently returns <code>undefined</code> for anything unexpected, which is exactly how a validation
function fails open.</p>

<h4>Short-circuit evaluation</h4>
<p><code>&&</code> and <code>||</code> do not return booleans; they return <b>one of their operands</b>,
and they stop evaluating as soon as the answer is known:</p>
<div class="codeSample" data-hl>"a" && "b"        // "b"    both truthy -> the LAST value
0 && "b"          // 0      stops at the first falsy
"a" || "b"        // "a"    stops at the first truthy
null || "b"       // "b"

// which is why this guard works: the second operand never runs
user && user.name
isValid() && save()      // save() only if isValid() is true

// and why ?? exists: || falls back on 0 and "", ?? only on null/undefined</div>`,
docs:[['MDN (if...else)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else'],['MDN (switch)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch'],['MDN (Logical AND)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND']],
ex:{title:'Classify an HTTP method',diff:'easy',lang:'js',
run:{call:'classify',cases:[
 {name:'GET is safe',args:['GET'],expect:'safe'},
 {name:'HEAD is safe',args:['HEAD'],expect:'safe'},
 {name:'OPTIONS is safe',args:['OPTIONS'],expect:'safe'},
 {name:'PUT is idempotent but not safe',args:['PUT'],expect:'idempotent'},
 {name:'DELETE is idempotent',args:['DELETE'],expect:'idempotent'},
 {name:'POST is neither',args:['POST'],expect:'neither'},
 {name:'PATCH is neither',args:['PATCH'],expect:'neither'},
 {name:'an unknown method fails closed',args:['BREW'],expect:'unknown'},
 {name:'lowercase does not match: switch is strict',args:['get'],expect:'unknown'}]},
prompt:`Write <code>function classify(method)</code> using a <code>switch</code>. <code>"GET"</code>, <code>"HEAD"</code> and <code>"OPTIONS"</code> return <code>"safe"</code>; <code>"PUT"</code> and <code>"DELETE"</code> return <code>"idempotent"</code>; <code>"POST"</code> and <code>"PATCH"</code> return <code>"neither"</code>; anything else returns <code>"unknown"</code>.`,
starter:`function classify(method) {
  return null;
}`,
solution:`function classify(method) {
  switch (method) {
    case "GET":
    case "HEAD":
    case "OPTIONS":
      return "safe";         // no side effects: cacheable, prefetchable
    case "PUT":
    case "DELETE":
      return "idempotent";   // repeating leaves the same state
    case "POST":
    case "PATCH":
      return "neither";
    default:
      return "unknown";      // fail closed on anything unrecognised
  }
}`,
tests:[{d:'GET is safe',re:'(?:"GET"[^;]{0,140}?(?:return\\s+|\\?\\s*|:\\s*)"safe"|\\[\\s*"GET"\\s*,\\s*"safe"\\s*\\])'},{d:'PUT is idempotent',re:'(?:"PUT"[^;]{0,140}?(?:return\\s+|\\?\\s*|:\\s*)"idempotent"|\\[\\s*"PUT"\\s*,\\s*"idempotent"\\s*\\])'},{d:'POST is neither',re:'(?:"POST"[^;]{0,140}?(?:return\\s+|\\?\\s*|:\\s*)"neither"|\\[\\s*"POST"\\s*,\\s*"neither"\\s*\\])'},{d:'has a default branch',re:'(?:default[^;]{0,180}?return\\s+"unknown"|else[^;]{0,160}?return\\s+"unknown"|return\\s+(?!!)[^;]{0,90}?"unknown"\\s*;\\s*\\})'}],
behavior:`Nine cases run, including "BREW" and a lowercase "get". The lowercase case is the point: switch compares with ===, so casing must match exactly; normalize before switching if you want case-insensitive behavior.`,
hints:['Group cases by letting them fall through to a shared return.','Each group ends with a return, so no break is needed.','The default must exist, or unknown methods return undefined.']}},

{id:'js7',title:'Loops: four forms and when to use each',body:`
<p>Repetition has four shapes in JavaScript. They are not interchangeable, and picking the wrong one is a
common source of subtle bugs.</p>

<div class="codeSample" data-hl>for (let i = 0; i &lt; n; i++)      classic. use when you need the INDEX.
for (const v of iterable)        values of an array/string/Map/Set. THE DEFAULT.
for (const k in object)          KEYS of an object. see the warning below.
while (cond) / do...while        when the count is not known in advance.</div>

<h4><code>for...of</code> is the one you want most of the time</h4>
<p>It iterates <b>values</b>, works on anything iterable (arrays, strings, <code>Map</code>,
<code>Set</code>, generators), and supports <code>break</code> and <code>continue</code>, which the
array method <code>forEach</code> does not.</p>
<div class="codeSample" data-hl>for (const ch of "héllo") { }        // iterates CHARACTERS correctly,
                                     // including multi-byte ones
for (const [k, v] of map) { }        // destructures each entry
for (const [i, v] of arr.entries()) {}  // index AND value</div>

<h4><code>for...in</code>: the one that surprises people</h4>
<p>It iterates <b>keys</b>, and on an array those keys are <b>strings</b>, not numbers. It also walks the
prototype chain, so it can pick up inherited properties you never set:</p>
<div class="codeSample" data-hl>const arr = ["a", "b"];
for (const i in arr) { console.log(i, typeof i); }
// "0" string, "1" string        <- indexes as STRINGS
// so  i + 1  gives "01", not 1

// on objects, guard against inherited keys:
for (const k in obj) {
  if (!Object.hasOwn(obj, k)) continue;
  ...
}
// or avoid the problem entirely:
for (const k of Object.keys(obj)) { ... }</div>
<p><b>Rule: never use <code>for...in</code> on an array.</b> Use <code>for...of</code>, or
<code>Object.keys</code>/<code>entries</code> on objects.</p>

<h4><code>break</code>, <code>continue</code>, and infinite loops</h4>
<div class="codeSample" data-hl>for (const item of items) {
  if (!item.active) continue;    // skip to the next iteration
  if (item.id === target) break; // stop entirely
}

// the two ways to loop forever, both easy to write by accident:
while (true) { }                       // no exit condition
for (let i = 0; i &lt; n; i--) { }        // wrong direction
// in a browser this freezes the tab. this course's runner caps
// execution at 3 seconds and tells you it timed out.</div>

<h4>Choosing</h4>
<p>Prefer <code>for...of</code>. Reach for the classic <code>for</code> when you genuinely need the index
or a non-unit step. Use <code>while</code> when the end condition is not a count: reading until an input
is exhausted, retrying until success. And when you are <i>transforming</i> data rather than performing
side effects, the array methods in the next stream (<code>map</code>, <code>filter</code>,
<code>reduce</code>) usually say it better than any loop.</p>`,
docs:[['MDN (Loops and iteration)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration'],['MDN (for...of)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of'],['MDN (for...in)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in']],
exs:[
{title:'Sum with a loop',diff:'easy',lang:'js',
run:{call:'sumPositive',cases:[
 {name:'mixed signs',args:[[1,-2,3,-4,5]],expect:9},
 {name:'all negative',args:[[-1,-2]],expect:0},
 {name:'an empty array is 0',args:[[]],expect:0},
 {name:'zero is not positive',args:[[0,0,4]],expect:4},
 {name:'decimals are handled',args:[[1.5,2.5]],expect:4}]},
prompt:`Write <code>function sumPositive(numbers)</code> that returns the sum of the values greater than zero. An empty array returns <code>0</code>, and <code>0</code> itself does not count as positive. Use a loop.`,
starter:`function sumPositive(numbers) {
  return 0;
}`,
solution:`function sumPositive(numbers) {
  let total = 0;
  for (const n of numbers) {
    if (n <= 0) continue;   // skip non-positive values
    total += n;
  }
  return total;
}`,
tests:[{d:'iterates the values',re:'for\\s*\\('},{d:'accumulates into a total',re:'(?:\\+=|total\\s*=\\s*total\\s*\\+)[\\s\\S]{0,240}?return\\s+total\\b'},{d:'starts from zero',re:'let\\s+total\\s*=\\s*0'}],
behavior:`sumPositive([1,-2,3,-4,5]) is 9 and sumPositive([]) is 0. The accumulator must start at 0 rather than at the first element, which is what makes the empty case work without a special branch.`,
hints:['Declare the accumulator before the loop and return it after.','for...of gives you values directly, with no index to manage.','continue skips an iteration; 0 is not greater than 0.']},
{title:'Find the first match',diff:'medium',lang:'js',
run:{call:'firstLongerThan',cases:[
 {name:'finds the first long word',args:[['hi','there','everyone'],3],expect:'there'},
 {name:'nothing qualifies',args:[['a','b'],3],expect:null},
 {name:'the first element qualifies',args:[['abcd','ab'],3],expect:'abcd'},
 {name:'an empty list returns null',args:[[],3],expect:null},
 {name:'strictly longer, not equal',args:[['abc','abcd'],3],expect:'abcd'}]},
prompt:`Write <code>function firstLongerThan(words, n)</code> that returns the first word whose length is <b>strictly greater</b> than <code>n</code>, or <code>null</code> when there is none. Stop as soon as you find it.`,
starter:`function firstLongerThan(words, n) {
  return null;
}`,
solution:`function firstLongerThan(words, n) {
  for (const w of words) {
    if (w.length > n) return w;   // returning IS the break
  }
  return null;                     // fell through: nothing matched
}`,
tests:[{d:'iterates the words',re:'for\\s*\\('},{d:'compares strictly greater',re:'length\\s*>\\s*n'},{d:'returns null when nothing matches',re:'return\\s+null'}],
behavior:`The last case checks "strictly": with n = 3, "abc" does not qualify but "abcd" does. Returning from inside the loop is the idiomatic early exit; it stops the iteration and answers in one move.`,
hints:['Return as soon as you find a match; that ends the loop.','The fallback return sits after the loop, not inside it.','Strictly greater means > and not >=.']}]},

{id:'js8',title:'Functions: the three forms',body:`
<p>A function packages work under a name so it can be reused, tested and reasoned about. JavaScript has
three ways to write one, and the differences are real, not stylistic.</p>

<div class="codeSample" data-hl>// 1. DECLARATION - hoisted completely; usable before it appears
function add(a, b) { return a + b; }

// 2. EXPRESSION - a value assigned to a name; NOT usable before the line
const add2 = function (a, b) { return a + b; };

// 3. ARROW - concise, and it does not bind its own \`this\`
const add3 = (a, b) => a + b;          // implicit return, no braces
const sq   = n => n * n;               // one parameter: parens optional
const mk   = () => ({ ok: true });     // returning an object needs parens
const long = (a, b) => {               // braces mean you must return
  const s = a + b;
  return s;
};</div>

<h4>Hoisting, in practice</h4>
<p>A <b>declaration</b> is fully hoisted, so this works:</p>
<div class="codeSample" data-hl>greet();                      // "hi" - fine
function greet() { console.log("hi"); }

greet2();                     // ReferenceError (temporal dead zone)
const greet2 = () =&gt; {};      // the CONST is what is hoisted, not the value</div>
<p>That is genuinely useful: it lets you put the important function at the top of a file and its helpers
below, in reading order. It is also the only meaningful argument left for declarations.</p>

<h4>The arrow difference that matters</h4>
<p>Arrows do not have their own <code>this</code>, <code>arguments</code>, or <code>prototype</code>. The
first of those has a whole lesson later; for now, the practical rules:</p>
<div class="codeSample" data-hl>USE AN ARROW for callbacks and short transformations:
  items.map(x =&gt; x.id)
  setTimeout(() =&gt; done(), 100)

DO NOT USE AN ARROW for object methods that need \`this\`:
  const o = { n: 1, bad: () =&gt; this.n, good() { return this.n; } };
  o.bad();   // undefined - the arrow captured the OUTER this
  o.good();  // 1

DO NOT USE AN ARROW as a constructor - \`new fn()\` throws.</div>

<h4>Parameters, defaults and rest</h4>
<div class="codeSample" data-hl>function welcome(name, greeting = "Hello") {   // default applies to
  return \`\${greeting}, \${name}\`;             // undefined ONLY, not null
}
welcome("Ada");             // "Hello, Ada"
welcome("Ada", undefined);  // "Hello, Ada"  - default kicks in
welcome("Ada", null);       // "null, Ada"   - null is a real value

function sum(...nums) {   // REST: collects the remaining args as an array
  return nums.reduce((a, b) =&gt; a + b, 0);
}
sum(1, 2, 3);             // 6

// missing arguments are undefined; extra ones are silently ignored:
function two(a, b) { return [a, b]; }
two(1);                   // [1, undefined]   - no error
two(1, 2, 3);             // [1, 2]           - no error</div>
<p>That last behavior is why calling a function with the wrong number of arguments fails silently in
JavaScript and loudly in most other languages, and it is a large part of the case for TypeScript.</p>

<h4>Return, and the semicolon trap</h4>
<p>A function with no <code>return</code> returns <code>undefined</code>. And <code>return</code> is one
of the few places where automatic semicolon insertion actively hurts:</p>
<div class="codeSample" data-hl>function broken() {
  return          // a semicolon is inserted HERE
    { ok: true }; // unreachable. the function returns undefined.
}
function fixed() {
  return {        // the brace must be on the SAME line
    ok: true
  };
}</div>`,
docs:[['MDN (Functions)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions'],['MDN (Arrow functions)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions'],['MDN (Default parameters)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters']],
exs:[
{title:'Defaults apply to undefined only',diff:'easy',lang:'js',
run:{call:'welcome',cases:[
 {name:'both arguments supplied',args:['Ada','Hi'],expect:'Hi, Ada'},
 {name:'omitted (which IS undefined) triggers the default',args:['Ada'],expect:'Hello, Ada'},
 {name:'null does NOT trigger the default',args:['Ada',null],expect:'null, Ada'},
 {name:'an empty string does not trigger it either',args:['Ada',''],expect:', Ada'}]},
prompt:`Write <code>function welcome(name, greeting = "Hello")</code> returning <code>"GREETING, NAME"</code> with a template literal. Use a real default parameter. Do not write your own fallback, because the point of this exercise is that defaults fire on <code>undefined</code> and nothing else.`,
starter:`function welcome(name, greeting) {
  return null;
}`,
solution:`function welcome(name, greeting = "Hello") {
  return \`\${greeting}, \${name}\`;
}`,
tests:[{d:'uses a default parameter',re:'greeting\\s*=\\s*"Hello"'},{d:'uses a template literal',re:'return\\s+(?!!)[^;]{0,120}?`'},{d:'does not hand-roll a fallback',re:'\\|\\||\\?\\?',not:true}],
behavior:`The last two cases are the lesson and they execute: null and "" are real values, so the default does not apply and you get "null, Ada" and ", Ada". A hand-rolled || fallback would wrongly rewrite both, which is precisely the bug default parameters avoid.`,
hints:['Put the default in the parameter list, not in the body.','Template literals use backticks and ${ }.','Do not add || or ??; they would change the null and "" behavior.']},
{title:'Collect any number of arguments',diff:'medium',lang:'js',
run:{call:'longest',cases:[
 {name:'picks the longest',args:['hi','there','you'],expect:'there'},
 {name:'the first wins a tie',args:['abc','xyz'],expect:'abc'},
 {name:'a single argument',args:['solo'],expect:'solo'},
 {name:'no arguments at all',args:[],expect:''}]},
prompt:`Write <code>function longest(...words)</code> using a rest parameter, returning the longest word. On a tie the <b>first</b> one wins, and with no arguments return the empty string <code>""</code>.`,
starter:`function longest() {
  return "";
}`,
solution:`function longest(...words) {
  let best = "";
  for (const w of words) {
    if (w.length > best.length) best = w;   // > not >=, so the first wins
  }
  return best;
}`,
tests:[{d:'uses a rest parameter',re:'\\.\\.\\.\\s*words'},{d:'compares lengths',re:'length\\s*>'},{d:'starts from the empty string',re:'best\\s*=\\s*""[\\s\\S]{0,320}?return\\s+best\\b'}],
behavior:`The tie case is executed: with > the first of two equal-length words is kept, and with >= the last would be. Starting the accumulator at "" is what makes the zero-argument case work without a special branch.`,
hints:['A rest parameter gathers all arguments into a real array.','Strictly greater keeps the first winner on a tie.','Initializing to "" handles the empty case for free.']}]},

{id:'js9',title:'Writing functions people can read',body:`
<p>The language part of functions is done. This lesson is the craft: the handful of habits that separate
code you can change safely from code you are afraid of.</p>

<h4>Early return beats nesting</h4>
<p>Deep nesting is the most common readability problem in real JavaScript, and it has a mechanical fix:
handle the exceptional cases first and return, so the main path stays at the left margin.</p>
<div class="codeSample" data-hl>// nested: the actual work is four levels deep
function pay(user, amount) {
  if (user) {
    if (user.active) {
      if (amount &gt; 0) {
        if (user.balance &gt;= amount) {
          return charge(user, amount);
        } else { return "insufficient"; }
      } else { return "invalid amount"; }
    } else { return "inactive"; }
  } else { return "no user"; }
}

// guard clauses: the same logic, and you can read it
function pay2(user, amount) {
  if (!user)                    return "no user";
  if (!user.active)             return "inactive";
  if (amount &lt;= 0)              return "invalid amount";
  if (user.balance &lt; amount)    return "insufficient";
  return charge(user, amount);          // the happy path, unindented
}</div>

<h4>One job per function</h4>
<p>The test is whether you can name it without using "and". <code>validateAndSaveAndEmail</code> is three
functions. A function that does one thing can be tested with one set of cases, reused somewhere else, and
understood without reading its body.</p>
<p>The related signal is <b>parameter count</b>. Beyond three or four, the call site becomes unreadable
(<code>f(true, false, true)</code>: which is which?) and it usually means the function is doing too
much. Pass an options object instead, so the call names its arguments.</p>

<h4>Pure functions, and why they are worth preferring</h4>
<div class="codeSample" data-hl>// PURE: same input -> same output, and it touches nothing outside itself
const total = items =&gt; items.reduce((s, i) =&gt; s + i.price, 0);

// IMPURE: reads or writes something beyond its arguments
let count = 0;
function next() { return ++count; }        // depends on external state
function save(x) { db.write(x); }          // has a side effect
function now() { return Date.now(); }      // not deterministic</div>
<p>Impure functions are necessary: a program that touches nothing does nothing. The point is to
<b>concentrate</b> the impurity: keep the decisions pure and testable, and push the I/O to the edges.
A pure function needs no mocks, no setup and no teardown to test.</p>

<h4>Naming</h4>
<p>Functions do things, so name them with verbs: <code>calculateTotal</code>, <code>isExpired</code>,
<code>hasPermission</code>, <code>toCents</code>. Booleans read best as questions:
<code>if (isExpired(token))</code> needs no comment. And avoid names that lie: a function called
<code>getUser</code> that also creates one has misled every future reader.</p>

<h4>Side effects, stated up front</h4>
<p>If a function mutates its argument, say so in the name (<code>sortInPlace</code>) or do not do it.
Silently modifying an object the caller passed in is the source of bugs that appear far from their
cause: the caller's data changed and nothing at the call site suggests it could have.</p>`,
docs:[['MDN (Functions guide)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions'],['Refactoring: guard clauses','https://refactoring.com/catalog/replaceNestedConditionalWithGuardClauses.html']],
exs:[
{title:'Rewrite with guard clauses',diff:'easy',lang:'js',
run:{call:'pay',cases:[
 {name:'missing user',args:[null,10],expect:'no user'},
 {name:'inactive user',args:[{active:false,balance:100},10],expect:'inactive'},
 {name:'zero amount is invalid',args:[{active:true,balance:100},0],expect:'invalid amount'},
 {name:'negative amount is invalid',args:[{active:true,balance:100},-5],expect:'invalid amount'},
 {name:'not enough balance',args:[{active:true,balance:5},10],expect:'insufficient'},
 {name:'exactly enough balance succeeds',args:[{active:true,balance:10},10],expect:'ok'},
 {name:'the happy path',args:[{active:true,balance:100},10],expect:'ok'}]},
prompt:`Write <code>function pay(user, amount)</code> using <b>guard clauses</b>, checking in this order: no user &rarr; <code>"no user"</code>; inactive &rarr; <code>"inactive"</code>; amount not greater than zero &rarr; <code>"invalid amount"</code>; balance below the amount &rarr; <code>"insufficient"</code>; otherwise <code>"ok"</code>. Keep the happy path unindented.`,
starter:`function pay(user, amount) {
  return null;
}`,
solution:`function pay(user, amount) {
  if (!user) return "no user";
  if (!user.active) return "inactive";
  if (amount <= 0) return "invalid amount";
  if (user.balance < amount) return "insufficient";
  return "ok";                                  // the happy path, at the margin
}`,
tests:[{d:'guards on a missing user first',re:'!\\s*user[^;]{0,80}?return\\s+"no user"'},{d:'guards on inactive',re:'user\\.active[^;]{0,80}?return\\s+"inactive"'},{d:'rejects non-positive amounts',re:'amount\\s*<=\\s*0[^;]{0,80}?return\\s+"invalid amount"'},{d:'checks the balance',re:'balance\\s*<\\s*amount[^;]{0,80}?return\\s+"insufficient"'}],
behavior:`Order is executed, not merely described: a null user is checked before any property is read, so the inactive test cannot throw. The boundary cases matter too: an amount of exactly 0 is invalid, and a balance of exactly the amount succeeds.`,
hints:['Check the null user first, or reading user.active will throw.','Each guard returns immediately, so no else is needed.','Non-positive means <= 0, and insufficient means balance < amount.']},
{title:'An options object, defaulted properly',diff:'medium',lang:'js',
run:{call:'summarize',cases:[
 {name:'short text passes through',args:['Ship it'],expect:'Ship it'},
 {name:'no options object needed at all',args:['Guard clauses win'],expect:'Guard clause…'},
 {name:'exactly maxLength is untouched',args:['twelve chars'],expect:'twelve chars'},
 {name:'whitespace is trimmed first',args:['   padded   '],expect:'padded'},
 {name:'a custom maxLength is respected',args:['JavaScript',{maxLength:4}],expect:'Java…'},
 {name:'a custom suffix is respected',args:['readability matters here',{suffix:'...'}],expect:'readability...'},
 {name:'the cut does not end mid-space',args:['one two three four',{maxLength:8}],expect:'one two…'},
 {name:'non-string input returns an empty string',args:[42],expect:''}]},
prompt:`The parameter-count advice, applied. Write <code>function summarize(text, options)</code> where <code>options</code> is optional and may carry <code>maxLength</code> (default <code>12</code>) and <code>suffix</code> (default <code>"…"</code>). Guard first: a non-string <code>text</code> returns <code>""</code>. Trim the text; if it fits within <code>maxLength</code> return it as-is; otherwise cut it to <code>maxLength</code>, strip any trailing space from the cut, and append the suffix.`,
starter:`function summarize(text, options) {
  return "";
}`,
solution:`function summarize(text, options = {}) {
  if (typeof text !== "string") return "";           // guard clause first
  const { maxLength = 12, suffix = "…" } = options;  // named, defaulted "arguments"
  const clean = text.trim();
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).trimEnd() + suffix;
}`,
tests:[{d:'guards on non-string input',re:'typeof\\s+text\\s*!==?\\s*"string"[^;]{0,80}?return\\s+""'},{d:'defaults each option as it destructures',re:'maxLength\\s*='},{d:'trims before measuring',re:'\\.trim\\('},{d:'does not end the cut on a space',re:'return\\s+(?!!)[^;]{0,120}?trimEnd\\s*\\('}],
behavior:`Compare the call sites this signature buys: summarize(text) reads clean, summarize(text, { maxLength: 4 }) names its argument, against a hypothetical summarize(text, 4, "…", true) where no reader knows which value is which. The boundary cases execute the craft details: exactly-at-the-limit text is untouched, padding never counts against the budget, and the trimEnd stops "one two …" from shipping with a floating space.`,
hints:['Default the whole parameter with options = {}, then each field as you destructure it.','Trim first: the padding case expects whitespace not to count.','Slice, then trimEnd, then append the suffix; that order settles the mid-space case.']}]}

]});
