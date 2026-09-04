STREAMS.push({icon:'🟨',title:'JavaScript Foundations',blurb:'Assuming nothing: what JavaScript is and where it runs, how a program is a sequence of statements, values and the eight types, variables and the three declaration keywords, operators, the coercion rules that make so much JavaScript behavior surprising until you know them, and regular expressions for the questions you have to ask about text.',lessons:[

{id:'js1',title:'What JavaScript is, and where it runs',body:`
<p>🌱 <b>Starting from zero.</b> A <b>program</b> is a list of instructions. A <b>programming language</b> is
the notation you write them in. Something has to read that notation and carry the instructions out. For
JavaScript, that something is called an <b>engine</b>, and you almost certainly already have several.</p>

<h4>One language, several places to run it</h4>
<p>JavaScript was created in 1995 to make web pages interactive, and for its first decade the browser was
the only place it existed. That is no longer true, and the distinction matters constantly:</p>
<div class="codeSample" data-hl>THE LANGUAGE          variables, functions, objects, loops, promises.
                      identical everywhere. this is what ECMAScript
                      (the standard) actually specifies.

THE BROWSER'S EXTRAS  document, window, fetch, localStorage, alert.
                      NOT part of the language. the browser supplies them.

NODE'S EXTRAS         require, process, fs, __dirname, Buffer.
                      also NOT the language. Node supplies these instead.

// so "document is not defined" in Node is not a broken install.
// document is a BROWSER thing, and Node is not a browser.</div>
<p>Roughly half of all beginner confusion is this boundary. When you look something up, ask first whether
it belongs to the language or to the host.</p>

<h4>ECMAScript, versions, and why you see "ES6" everywhere</h4>
<p><b>ECMAScript</b> is the official specification; <b>JavaScript</b> is what everyone calls the language
that implements it. A new edition ships every year. The one people mention constantly is <b>ES2015</b>
(also called ES6), because it added <code>let</code>, <code>const</code>, arrow functions, classes,
promises and modules, enough at once that material written before it looks like a different language.</p>
<p>Everything in this course is modern JavaScript. Where an older form still appears in real codebases,
it is called out so you can read it, not so you write it.</p>

<h4>Running your first program</h4>
<p>You have three ways to run JavaScript right now, and it is worth trying all three, because knowing
where your code executes is the beginning of being able to debug it.</p>
<div class="codeSample" data-hl>// 1. THE BROWSER CONSOLE, fastest feedback loop that exists.
//    Chrome/Edge: F12 or Cmd-Option-J.  Firefox: F12.  Safari: enable
//    Develop menu first. Type an expression, press Enter, see the value.

// 2. NODE, in a file, how real programs are run.
//    save as hello.js, then:  node hello.js
console.log("hello");

// 3. NODE, interactively, type  node  with no arguments, get a prompt.
//    Ctrl-D or .exit to leave.</div>
<p><code>console.log</code> prints a value where you can see it: the browser's console panel, or the
terminal under Node. It is not part of the language either (both hosts happen to provide it), and it is
the single most-used debugging tool in existence. A whole stream later in this course is about the tools
that are better than it.</p>

<h4>Statements, expressions and semicolons</h4>
<p>A program is a sequence of <b>statements</b> executed top to bottom. An <b>expression</b> is anything
that produces a value. <code>2 + 2</code> is an expression; <code>let x = 2 + 2;</code> is a statement
containing one. The distinction returns repeatedly, because some places in JavaScript accept only one of
the two.</p>
<p>Semicolons end statements, and JavaScript will insert them for you if you leave them out, a feature
called <b>automatic semicolon insertion</b>. It is correct nearly always and wrong in a few specific
cases, which is why teams pick one convention and let a formatter enforce it. This course uses
semicolons.</p>

<h4>Comments, and one habit worth forming now</h4>
<div class="codeSample" data-hl>// everything after two slashes, to the end of the line

/* a block comment,
   spanning lines */</div>
<p>Write comments that say <b>why</b>, not <b>what</b>. The code already states what it does; what it
cannot state is the reason it does it that way, and that is the thing the next reader (usually you, in
six months) actually needs.</p>`,
docs:[['MDN (What is JavaScript?)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Introduction'],['Node.js (introduction)','https://nodejs.org/en/learn/getting-started/introduction-to-nodejs'],['TC39 (the ECMAScript standard)','https://tc39.es/ecma262/']],
ex:{title:'Language, browser, or Node?',diff:'easy',lang:'js',
run:{call:'provides',cases:[
 {name:'document belongs to the browser',args:['document'],expect:'browser'},
 {name:'window belongs to the browser',args:['window'],expect:'browser'},
 {name:'localStorage belongs to the browser',args:['localStorage'],expect:'browser'},
 {name:'process belongs to Node',args:['process'],expect:'node'},
 {name:'require belongs to Node',args:['require'],expect:'node'},
 {name:'Promise is part of the language',args:['Promise'],expect:'language'},
 {name:'Array is part of the language',args:['Array'],expect:'language'},
 {name:'anything unrecognised is unknown',args:['zzz'],expect:'unknown'}]},
prompt:`Write <code>function provides(name)</code> that returns where each name comes from: <code>"browser"</code> for <code>"document"</code>, <code>"window"</code> and <code>"localStorage"</code>; <code>"node"</code> for <code>"process"</code> and <code>"require"</code>; <code>"language"</code> for <code>"Promise"</code> and <code>"Array"</code>; and <code>"unknown"</code> for anything else.`,
starter:`function provides(name) {
  return null;
}`,
solution:`function provides(name) {
  switch (name) {
    case "document":
    case "window":
    case "localStorage":
      return "browser";     // supplied by the browser, absent in Node
    case "process":
    case "require":
      return "node";        // supplied by Node, absent in the browser
    case "Promise":
    case "Array":
      return "language";    // ECMAScript itself: present everywhere
    default:
      return "unknown";
  }
}`,
tests:[{d:'document is a browser API',re:'(?:(?:"document"|\'document\'|\\bdocument\\b)[^;]{0,140}?(?:return\\s+|\\?\\s*|:\\s*)"browser"|\\[\\s*"document"\\s*,\\s*"browser"\\s*\\])'},{d:'process is a Node API',re:'(?:(?:"process"|\'process\'|\\bprocess\\b)[^;]{0,140}?(?:return\\s+|\\?\\s*|:\\s*)"node"|\\[\\s*"process"\\s*,\\s*"node"\\s*\\])'},{d:'Promise is part of the language',re:'(?:(?:"Promise"|\'Promise\'|\\bPromise\\b)[^;]{0,140}?(?:return\\s+|\\?\\s*|:\\s*)"language"|\\[\\s*"Promise"\\s*,\\s*"language"\\s*\\])'},{d:'unrecognised names fall through',re:'(?:return\\s+(?!!)[^;]{0,110}?"unknown"|:\\s*"unknown")'}],
behavior:`provides("document") is "browser", provides("process") is "node", provides("Promise") is "language", provides("zzz") is "unknown". All eight cases are executed against your function. This boundary is the one to internalise first: "X is not defined" almost always means you reached for a host API from the wrong host, not that something is broken.`,
hints:['A switch with fall-through cases groups the names by host neatly.','Three groups plus a default covers every case.','Anything you were not told about returns "unknown".']}},

{id:'js2',title:'Values and the eight types',body:`
<p>Everything a JavaScript program manipulates is a <b>value</b>. Every value has a <b>type</b>, and there
are exactly eight. Learning them now saves an enormous amount of confusion later, because most surprising
JavaScript behavior is a type behaving exactly as specified in a situation you did not expect.</p>

<h4>The seven primitives, and the one that is not</h4>
<div class="codeSample" data-hl>number      42, 3.14, -7, Infinity, NaN     one numeric type for everything
string      "hi", 'hi', \`hi\`               text
boolean     true, false
undefined   "no value has been assigned"   the DEFAULT absence
null        "deliberately no value"        the INTENTIONAL absence
bigint      9007199254740993n              integers beyond number's range
symbol      Symbol("id")                   unique keys, rarely needed early

object      {}, [], function(){}, new Date()
            EVERYTHING else. arrays and functions are objects too.</div>
<p>The first seven are <b>primitives</b>: immutable single values, compared by their content. The eighth
is everything else, compared by <b>identity</b>, which is why <code>{} === {}</code> is <code>false</code>
even though the two look identical. They are two different objects that happen to have the same
contents.</p>

<h4>Numbers: one type, and its consequences</h4>
<p>JavaScript has no separate integer type. Every <code>number</code> is a 64-bit floating-point value,
which produces the result everyone eventually meets:</p>
<div class="codeSample" data-hl>0.1 + 0.2        // 0.30000000000000004   not a JavaScript bug -
                 // binary floating point cannot represent 0.1 exactly,
                 // and C, Java and Python agree. NEVER use floats for money;
                 // work in the smallest unit (cents) as integers.

1 / 0            // Infinity        no exception, no crash
"abc" * 2        // NaN             "not a number" - the FAILURE value
NaN === NaN      // false           the only value not equal to itself!
Number.isNaN(x)  // the correct way to test for it

Number.MAX_SAFE_INTEGER   // 9007199254740991 - beyond this, integers
                          // lose precision. that is what bigint is for.</div>

<h4>Strings</h4>
<p>Single and double quotes are identical in meaning; pick one and be consistent. Backticks create a
<b>template literal</b>, which is the one you should reach for by default:</p>
<div class="codeSample" data-hl>const name = "Ada";
\`Hello, \${name}\`        // interpolation - an expression inside \${ }
\`line one
line two\`               // and it can span lines

// strings are IMMUTABLE. every "modification" returns a new string:
let s = "hello";
s.toUpperCase();        // "HELLO" returned, and DISCARDED
s;                      // still "hello" - you must assign the result</div>

<h4><code>undefined</code> versus <code>null</code></h4>
<p>Both mean "nothing", and the distinction is about <i>who decided</i>. <code>undefined</code> is what
JavaScript gives you when nothing was supplied: an unassigned variable, a missing property, a parameter
you did not pass, a function with no <code>return</code>. <code>null</code> is what a <i>programmer</i>
assigns to say "this is deliberately empty".</p>
<p>Use <code>null</code> for intentional emptiness and let <code>undefined</code> mean absence. And know
the historical bug you will meet: <code>typeof null</code> returns <code>"object"</code>. It is wrong, it
has been wrong since 1995, and it cannot be fixed without breaking the web.</p>

<h4>Checking a type</h4>
<div class="codeSample" data-hl>typeof 42            // "number"
typeof "hi"          // "string"
typeof true          // "boolean"
typeof undefined     // "undefined"
typeof null          // "object"     <- the famous bug
typeof 10n           // "bigint"
typeof Symbol()      // "symbol"
typeof {}            // "object"
typeof []            // "object"     <- arrays are objects
typeof function(){}  // "function"   <- special-cased, though it IS an object

Array.isArray([])    // true - the correct way to detect an array</div>`,
docs:[['MDN, JavaScript data types','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures'],['MDN, typeof','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof'],['Why 0.1 + 0.2 !== 0.3','https://floating-point-gui.de/']],
ex:{title:'Classify a value',diff:'easy',lang:'js',
run:{call:'describe',cases:[
 {name:'a number',args:[42],expect:'number'},
 {name:'a string',args:['hi'],expect:'string'},
 {name:'a boolean',args:[true],expect:'boolean'},
 {name:'undefined (the argument is simply not passed)',args:[],expect:'undefined'},
 {name:'null is reported as null, not object',args:[null],expect:'null'},
 {name:'an array is distinguished from a plain object',args:[[1,2]],expect:'array'},
 {name:'a plain object',args:[{a:1}],expect:'object'},
 {name:'an empty array is still an array',args:[[]],expect:'array'}]},
prompt:`Write <code>function describe(value)</code> that returns the type as a string, fixing the two things <code>typeof</code> gets wrong for our purposes: return <code>"null"</code> for <code>null</code> (not <code>"object"</code>), and <code>"array"</code> for an array (not <code>"object"</code>). Everything else returns whatever <code>typeof</code> says.`,
starter:`function describe(value) {
  return null;
}`,
solution:`function describe(value) {
  if (value === null) return "null";        // must come FIRST: typeof lies
  if (Array.isArray(value)) return "array"; // arrays are objects to typeof
  return typeof value;
}`,
tests:[{d:'null is reported as null',re:'value\\s*===\\s*null[^;]{0,80}?(?:return\\s+|\\?\\s*)"null"'},{d:'arrays are detected properly',re:'Array\\.isArray[^;]{0,80}?(?:return\\s+|\\?\\s*)"array"'},{d:'everything else falls back to typeof',re:'(?:return\\s+|:\\s*)typeof\\s+value'}],
behavior:`describe(42) is "number", describe(null) is "null", describe([1,2]) is "array", describe({a:1}) is "object". Order matters and is executed: check null before anything else, because typeof null returns "object" and would send it down the wrong path.`,
hints:['Check for null with === before using typeof.','Array.isArray is the only reliable array test.','Everything else can just return typeof value.']}},

{id:'js3',title:'Variables: let, const and the one to avoid',body:`
<p>A <b>variable</b> is a name bound to a value. JavaScript has three ways to create one, and the
difference between them is not style: it is scope, mutability, and how errors surface.</p>

<h4>The rule, stated first</h4>
<div class="codeSample" data-hl>const   DEFAULT. use this unless you have a reason not to.
let     when the binding genuinely needs to be reassigned.
var     legacy. you will read it; do not write it.</div>
<p>Reaching for <code>const</code> by default is not pedantry. It means that when you see <code>let</code>,
you know something reassigns it, and you can find out what. That is real information, and it is free.</p>

<h4>What <code>const</code> actually protects</h4>
<p>This is the most common misunderstanding of the three. <code>const</code> makes the <b>binding</b>
constant: the name cannot be pointed at a different value. It says nothing about the value itself:</p>
<div class="codeSample" data-hl>const n = 1;
n = 2;                    // TypeError: Assignment to constant variable

const user = { name: "Ada" };
user.name = "Grace";      // FINE. the object is mutable; the binding is not
user = {};                // TypeError. this is what const prevents.

const list = [1, 2];
list.push(3);             // FINE - [1, 2, 3]

// to freeze the VALUE as well:
Object.freeze(user);      // shallow - nested objects are still mutable</div>

<h4>Scope: where a name exists</h4>
<p><b>Scope</b> is the region of the program in which a name is visible. <code>let</code> and
<code>const</code> are <b>block-scoped</b>: they exist only inside the nearest <code>{ }</code>.
<code>var</code> is <b>function-scoped</b>, which means it leaks out of blocks in a way that surprises
everyone:</p>
<div class="codeSample" data-hl>function demo() {
  if (true) {
    var a = 1;
    let b = 2;
  }
  console.log(a);   // 1        - var escaped the block
  console.log(b);   // ReferenceError - let did not
}

// the classic bug this caused, for twenty years:
for (var i = 0; i < 3; i++) { setTimeout(() =&gt; console.log(i)); }
// prints 3, 3, 3 - ONE i, shared, and it is 3 by the time they run
for (let i = 0; i < 3; i++) { setTimeout(() =&gt; console.log(i)); }
// prints 0, 1, 2 - a NEW binding per iteration</div>

<h4>Hoisting, and the temporal dead zone</h4>
<p>Declarations are processed before the code runs, which is called <b>hoisting</b>. The three keywords
handle it differently, and the difference is the point:</p>
<div class="codeSample" data-hl>console.log(x);   // undefined      <- var exists but has no value yet
var x = 1;

console.log(y);   // ReferenceError: Cannot access 'y' before
let y = 1;        //   initialization    <- the TEMPORAL DEAD ZONE</div>
<p><code>var</code>'s silent <code>undefined</code> lets a bug run on and fail somewhere else.
<code>let</code> and <code>const</code> throw at the point of the mistake. That is the whole argument for
them: <b>errors that arrive where the problem is</b>.</p>

<h4>Naming</h4>
<p>Names may contain letters, digits, <code>_</code> and <code>$</code>, and may not start with a digit.
Convention is <code>camelCase</code> for variables and functions, <code>PascalCase</code> for classes, and
<code>UPPER_SNAKE_CASE</code> for genuine constants. Names are the cheapest documentation available:
<code>d</code> tells the next reader nothing, and <code>daysUntilExpiry</code> tells them everything.</p>`,
docs:[['MDN (let)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let'],['MDN (const)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const'],['MDN (Hoisting)','https://developer.mozilla.org/en-US/docs/Glossary/Hoisting']],
ex:{title:'What does const actually prevent?',diff:'easy',lang:'js',
run:{call:'allowed',cases:[
 {name:'reassigning a const binding is not allowed',args:['reassign-binding'],expect:false},
 {name:'mutating a const object property is allowed',args:['mutate-property'],expect:true},
 {name:'pushing to a const array is allowed',args:['push-to-array'],expect:true},
 {name:'reassigning a let binding is allowed',args:['reassign-let'],expect:true},
 {name:'reading before a let declaration is not allowed',args:['read-before-let'],expect:false},
 {name:'an unrecognised operation is refused',args:['zzz'],expect:false}]},
prompt:`Write <code>function allowed(operation)</code> returning <code>true</code> for operations JavaScript permits and <code>false</code> for those it does not. Permitted: <code>"mutate-property"</code>, <code>"push-to-array"</code>, <code>"reassign-let"</code>. Refused: <code>"reassign-binding"</code>, <code>"read-before-let"</code>, and anything unrecognised.`,
starter:`function allowed(operation) {
  return false;
}`,
solution:`function allowed(operation) {
  switch (operation) {
    case "mutate-property":   // const freezes the BINDING, not the value
    case "push-to-array":     // same: the array object is still mutable
    case "reassign-let":      // let exists precisely to be reassigned
      return true;
    default:
      return false;           // reassigning const, and the TDZ, both throw
  }
}`,
tests:[{d:'mutating a const object is permitted',re:'"mutate\\-property"[^;]{0,220}?(?:return\\s+|\\?\\s*|:\\s*)true'},{d:'pushing to a const array is permitted',re:'"push\\-to\\-array"[^;]{0,220}?(?:return\\s+|\\?\\s*|:\\s*)true'},{d:'let may be reassigned',re:'"reassign\\-let"[^;]{0,220}?(?:return\\s+|\\?\\s*|:\\s*)true'},{d:'anything else is refused',re:'(?:default|else)[^;]{0,160}?(?:return\\s+|:\\s*)false'}],
behavior:`Six operations are executed against your function, including an unrecognised one to check the default fails closed. The distinction being tested is the one people get wrong: const prevents the name being pointed somewhere else, and does nothing whatsoever about the contents of the object it points at.`,
hints:['Three permitted operations, everything else false.','const controls the binding; the value stays mutable.','The temporal dead zone makes reading before a let declaration a ReferenceError.']}},

{id:'js4',title:'Operators, coercion and equality',body:`
<p>This lesson explains more surprising JavaScript behavior than any other in the course. JavaScript
converts values between types automatically (<b>coercion</b>), and the rules are consistent, learnable,
and occasionally absurd.</p>

<h4>The operators, quickly</h4>
<div class="codeSample" data-hl>+  -  *  /  %  **        arithmetic ( % remainder, ** exponent )
++  --                   increment / decrement
=  +=  -=  *=  /=        assignment
==  ===  !=  !==         equality (see below - this matters)
&lt;  &gt;  &lt;=  &gt;=              comparison
&&  ||  !                logical AND, OR, NOT
??                       nullish coalescing
?.                       optional chaining
? :                      ternary conditional</div>

<h4>The one rule that explains <code>+</code></h4>
<p><code>+</code> is both addition and string concatenation, and <b>if either side is a string, it
concatenates</b>. Every other arithmetic operator converts to number instead:</p>
<div class="codeSample" data-hl>1 + "2"      // "12"    string wins - concatenation
1 - "2"      // -1     no string overload - numeric coercion
"3" * "4"    // 12     both coerced to numbers
[] + {}      // "[object Object]"     both become strings
[] + []      // ""     two empty strings

// which is why this is the most common beginner bug of all:
const total = "5" + 3;   // "53", not 8 - form inputs are STRINGS
const fixed = Number("5") + 3;   // 8</div>

<h4>Truthiness</h4>
<p>Anywhere a boolean is expected, JavaScript coerces. <b>Exactly eight values are falsy</b> and
everything else is truthy. Memorize the short list:</p>
<div class="codeSample" data-hl>FALSY:   false   0   -0   0n   ""   null   undefined   NaN
TRUTHY:  everything else, including:
           "0"        a non-empty string
           "false"    also a non-empty string
           []         an empty array!
           {}         an empty object!
           function(){}

// so this is a real bug, and a common one:
if (items.length) { ... }      // 0 is falsy - fine, but see below
if (count) { ... }             // BREAKS when count is legitimately 0
if (count !== undefined) { }   // say what you mean</div>

<h4><code>==</code> versus <code>===</code></h4>
<p><code>===</code> compares without coercion: different types are never equal. <code>==</code> coerces
first, and the resulting table has genuinely strange entries:</p>
<div class="codeSample" data-hl>1 == "1"          // true    string coerced to number
0 == ""           // true
0 == false        // true
null == undefined // true    the ONE useful case
null == 0         // false   but null is not 0
NaN == NaN        // false   NaN is never equal to anything

1 === "1"         // false
null === undefined// false

// the rule: ALWAYS use ===. the single exception people accept is
//   if (x == null)   which is true for BOTH null and undefined.</div>

<h4><code>??</code> and <code>?.</code>: the two that remove real bugs</h4>
<div class="codeSample" data-hl>// || falls back on any FALSY value, which is usually not what you meant
const port  = config.port || 3000;   // 0 becomes 3000. wrong.
const port2 = config.port ?? 3000;   // only null/undefined fall back. right.

// ?. short-circuits to undefined instead of throwing
user.address.city       // TypeError if address is undefined
user.address?.city      // undefined, no throw
user.getName?.()        // calls it only if it exists</div>
<p>Reach for <code>??</code> whenever a default is involved and <code>0</code> or <code>""</code> could be
a legitimate value, which is most of the time.</p>`,
docs:[['MDN (Equality comparisons)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness'],['MDN (Falsy)','https://developer.mozilla.org/en-US/docs/Glossary/Falsy'],['MDN (Nullish coalescing)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing']],
exs:[
{title:'Which values are falsy?',diff:'easy',lang:'js',
run:{call:'isFalsy',cases:[
 {name:'zero is falsy',args:[0],expect:true},
 {name:'the empty string is falsy',args:[''],expect:true},
 {name:'null is falsy',args:[null],expect:true},
 {name:'undefined is falsy',args:[undefined],expect:true},
 {name:'NaN is falsy',args:[NaN],expect:true},
 {name:'the string "0" is TRUTHY',args:['0'],expect:false},
 {name:'an empty array is TRUTHY',args:[[]],expect:false},
 {name:'an empty object is TRUTHY',args:[{}],expect:false}]},
prompt:`Write <code>function isFalsy(value)</code> returning <code>true</code> when the value is falsy. Do not write out the list; let JavaScript's own coercion answer, and negate it.`,
starter:`function isFalsy(value) {
  return false;
}`,
solution:`function isFalsy(value) {
  return !value;   // one ! coerces to boolean AND inverts it
}`,
tests:[{d:'uses coercion rather than a hardcoded list',re:'return\\s+!\\s*value\\b'},{d:'does not hardcode a result',re:'return\\s+(true|false)\\s*;',not:true}],
behavior:`All eight cases run, including the three that catch people out: "0", [] and {} are all truthy, because only the eight listed values are falsy and none of them is a non-empty string or an object.`,
hints:['A single ! both coerces to boolean and inverts.','Do not enumerate the falsy values; the language already knows them.','!!value gives you the truthiness; !value gives you its opposite.']},
{title:'Default only when genuinely absent',diff:'medium',lang:'js',
run:{call:'withDefault',cases:[
 {name:'undefined falls back',args:[undefined,3000],expect:3000},
 {name:'null falls back',args:[null,3000],expect:3000},
 {name:'zero is a legitimate value and must survive',args:[0,3000],expect:0},
 {name:'the empty string survives',args:['',3000],expect:''},
 {name:'false survives',args:[false,3000],expect:false},
 {name:'a real value passes through',args:[8080,3000],expect:8080}]},
prompt:`Write <code>function withDefault(value, fallback)</code> that returns <code>fallback</code> only when <code>value</code> is <code>null</code> or <code>undefined</code>. <code>0</code>, <code>""</code> and <code>false</code> are legitimate values and must be returned unchanged.`,
starter:`function withDefault(value, fallback) {
  return fallback;
}`,
solution:`function withDefault(value, fallback) {
  return value ?? fallback;   // ?? checks NULLISH, not falsy
}`,
tests:[{d:'uses nullish coalescing rather than ||',re:'return\\s+value\\s*\\?\\?'},{d:'does not use the falsy-based fallback',re:'\\|\\|',not:true}],
behavior:`The three middle cases are the whole lesson and they are executed: writing value || fallback passes the first two tests and fails on 0, "" and false: a bug that appears the day someone legitimately configures a port of 0 or an empty prefix.`,
hints:['|| falls back on any falsy value; ?? falls back only on null and undefined.','The whole body is a single return.','0 and "" must survive.']},
{title:'Normalize a form submission',diff:'hard',lang:'js',
run:{call:'normalize',cases:[
 {name:'trims and converts a numeric field',args:[{name:'  Ada  ',age:'36'}],expect:{name:'Ada',age:36}},
 {name:'a legitimate zero survives',args:[{name:'Ada',age:'0'}],expect:{name:'Ada',age:0}},
 {name:'a non-numeric age becomes null',args:[{name:'Ada',age:'abc'}],expect:{name:'Ada',age:null}},
 {name:'an empty age becomes null, not zero',args:[{name:'Ada',age:''}],expect:{name:'Ada',age:null}},
 {name:'an empty name becomes null too',args:[{name:'   ',age:'1'}],expect:{name:null,age:1}},
 {name:'missing fields are null',args:[{}],expect:{name:null,age:null}},
 {name:'a negative age is still a number',args:[{name:'x',age:'-3'}],expect:{name:'x',age:-3}}]},
prompt:`Every value from an HTML form arrives as a <b>string</b>. Write <code>function normalize(form)</code> returning <code>{ name, age }</code> where <code>name</code> is the trimmed string or <code>null</code> when blank or missing, and <code>age</code> is a real number or <code>null</code> when blank, missing or not numeric. An age of <code>"0"</code> must become the number <code>0</code>, not <code>null</code>. This is the trap the whole lesson has been building to.`,
starter:`function normalize(form) {
  return { name: null, age: null };
}`,
solution:`function normalize(form) {
  const rawName = (form.name ?? "").trim();       // ?? handles a missing key
  const name = rawName === "" ? null : rawName;

  const rawAge = (form.age ?? "").trim();
  let age = null;
  if (rawAge !== "") {                             // guard FIRST: Number("") is 0
    const n = Number(rawAge);
    if (Number.isFinite(n)) age = n;               // rejects NaN and Infinity
  }
  return { name, age };
}`,
tests:[{d:'trims the name',re:'\\.trim\\(\\)'},{d:'guards the empty string before converting',re:'!==\\s*""|===\\s*""'},{d:'converts with Number',re:'Number\\s*\\('},{d:'rejects NaN and Infinity',re:'Number\\.isFinite[\\s\\S]{0,240}?return\\s+(?!!)'}],
behavior:`Seven cases execute and three of them fail a naive implementation. Number("") is 0, so without the empty guard a blank age silently becomes zero. A truthiness check on the converted value would throw away a legitimate 0. And "abc" converts to NaN, which is a number by typeof and useless by every other measure; Number.isFinite is what catches it.`,
hints:['Handle the missing key with ?? before calling trim.','Check for the empty string BEFORE converting, because Number("") is 0.','Number.isFinite rejects NaN and Infinity in one test, and 0 passes it.']}]},

{id:'js5',title:'Strings and numbers in practice',body:`
<p>Text and arithmetic are most of what programs do. This lesson is the working knowledge: the methods you
will use constantly, and the conversions that go wrong quietly.</p>

<h4>Working with strings</h4>
<div class="codeSample" data-hl>const s = "  Hello, World  ";

s.length              // 16          a property, not a method - no ()
s.trim()              // "Hello, World"
s.toUpperCase()       // "  HELLO, WORLD  "
s.includes("World")   // true
s.indexOf("World")    // 9      or -1 when absent
s.startsWith("  He")  // true
s.slice(2, 7)         // "Hello"     start inclusive, end exclusive
s.replace("World","JS")     // first occurrence only
s.replaceAll("l","L")       // every occurrence
"a,b,c".split(",")          // ["a", "b", "c"]
["a","b"].join("-")         // "a-b"
s[2]                        // "H"   index access
s.at(-1)                    // " "   negative indexes count from the end

// EVERY one of these returns a NEW string. none modifies s.</div>
<p>Immutability is the thing to internalise. <code>s.trim()</code> on its own line does nothing at all;
you must use or assign the result. It compiles, it runs, and it is a real bug.</p>

<h4>Template literals</h4>
<p>Prefer them to concatenation. They interpolate any expression, span lines, and read closer to the
output they produce:</p>
<div class="codeSample" data-hl>const user = { name: "Ada", visits: 3 };
\`\${user.name} has visited \${user.visits} time\${user.visits === 1 ? "" : "s"}\`
// "Ada has visited 3 times"</div>

<h4>Numbers and conversion</h4>
<div class="codeSample" data-hl>Number("42")        // 42
Number("42abc")     // NaN        strict: the WHOLE string must be numeric
Number("")          // 0          <- surprising, and a real source of bugs
parseInt("42abc")   // 42         lenient: reads as far as it can
parseFloat("3.9kg") // 3.9
+"42"               // 42         terse, and common in real code

(3.14159).toFixed(2)  // "3.14"   returns a STRING, and it ROUNDS
Math.round(2.5)       // 3
Math.floor(-2.1)      // -3       floor goes DOWN, toward -Infinity
Math.trunc(-2.1)      // -2       trunc just drops the fraction
Math.max(1, 9, 3)     // 9
Math.random()         // [0, 1)

Number.isInteger(4)   // true
Number.isNaN(x)       // the safe NaN test (the global isNaN coerces first)</div>

<h4>The two conversions that bite</h4>
<p><b>Form input is always a string.</b> Every value read from an HTML input, a URL query parameter, or a
JSON field typed by a user arrives as text. Convert explicitly at the boundary and validate the result,
because <code>Number("")</code> is <code>0</code> and <code>Number("abc")</code> is <code>NaN</code>, and
both will flow silently through arithmetic.</p>
<p><b>Never use floats for money.</b> <code>0.1 + 0.2</code> is not <code>0.3</code>, and the error
compounds. Work in the smallest unit (cents, pence) as integers, and format for display only at the
very edge.</p>
<div class="codeSample" data-hl>// a safe numeric parse, which you will write many times:
function toNumber(text) {
  const n = Number(text);
  return Number.isFinite(n) ? n : null;   // rejects NaN AND Infinity
}
// note: Number.isFinite("42") is false - it does not coerce. that is
// why the conversion happens first, on its own line.</div>`,
docs:[['MDN (String)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String'],['MDN (Number)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number'],['MDN (Template literals)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals']],
exs:[
{title:'Parse user input safely',diff:'easy',lang:'js',
run:{call:'toNumber',cases:[
 {name:'a normal number',args:['42'],expect:42},
 {name:'a decimal',args:['3.5'],expect:3.5},
 {name:'a negative number',args:['-7'],expect:-7},
 {name:'surrounding whitespace is tolerated',args:['  42  '],expect:42},
 {name:'non-numeric text is rejected',args:['abc'],expect:null},
 {name:'trailing junk is rejected',args:['42abc'],expect:null},
 {name:'the empty string is rejected, not treated as 0',args:[''],expect:null},
 {name:'whitespace only is rejected',args:['   '],expect:null},
 {name:'Infinity is rejected',args:['Infinity'],expect:null}]},
prompt:`Write <code>function toNumber(text)</code> that returns the number when <code>text</code> is entirely numeric, and <code>null</code> otherwise. The empty string and whitespace must return <code>null</code>, <b>not</b> <code>0</code>, and <code>"Infinity"</code> must be rejected too.`,
starter:`function toNumber(text) {
  return null;
}`,
solution:`function toNumber(text) {
  if (text.trim() === "") return null;   // Number("") is 0, which is wrong here
  const n = Number(text);                 // strict: rejects "42abc"
  return Number.isFinite(n) ? n : null;   // rejects NaN and Infinity
}`,
tests:[{d:'the empty string is rejected before conversion',re:'trim\\(\\)\\s*===\\s*""[^;]{0,80}?(?:return\\s+|\\?\\s*)null'},{d:'uses strict Number conversion',re:'Number\\s*\\(\\s*text\\s*\\)'},{d:'rejects NaN and Infinity',re:'(?:return\\s+Number\\.isFinite|!\\s*Number\\.isFinite\\s*\\([^;]{0,60}?return\\s+null)'}],
behavior:`Nine cases run. Two are the point: Number("") is 0, so an empty form field would silently become zero without the explicit guard; and Number("Infinity") is a finite-looking success that Number.isFinite correctly rejects. parseInt would also wrongly accept "42abc".`,
hints:['Handle the empty/whitespace case first: Number("") is 0.','Number() is strict where parseInt is lenient; you want strict here.','Number.isFinite rejects both NaN and Infinity in one check.']},
{title:'Format a name safely',diff:'medium',lang:'js',
run:{call:'greet',cases:[
 {name:'a normal name',args:['Ada'],expect:'Hello, Ada!'},
 {name:'whitespace is trimmed',args:['  Ada  '],expect:'Hello, Ada!'},
 {name:'an empty name falls back',args:[''],expect:'Hello, stranger!'},
 {name:'whitespace only falls back',args:['   '],expect:'Hello, stranger!'}]},
prompt:`Write <code>function greet(name)</code> that returns <code>"Hello, NAME!"</code> using a template literal, with the name trimmed. When the trimmed name is empty, use <code>"stranger"</code> instead.`,
starter:`function greet(name) {
  return null;
}`,
solution:`function greet(name) {
  const clean = name.trim();
  return \`Hello, \${clean === "" ? "stranger" : clean}!\`;
}`,
tests:[{d:'uses a template literal',re:'return\\s+(?!!)[^;]{0,160}?`'},{d:'trims the input',re:'\\.trim\\(\\)'},{d:'falls back for an empty name',re:'"stranger"'}],
behavior:`greet("  Ada  ") is "Hello, Ada!" and greet("   ") is "Hello, stranger!". Note that trim() returns a new string; assigning its result is what makes this work, since strings are immutable.`,
hints:['Assign the trimmed value; trim() does not modify the original.','A ternary inside the template literal handles the fallback.','Remember the exclamation mark.']}]},
{id:'jsregex',title:'Regular expressions, and where they stop',body:`
<p>Nearly every program has to ask questions about the <i>shape</i> of some text. Is this a valid slug?
Which of these lines are warnings? Where are the numbers in this string? A <b>regular expression</b> is a
small language for describing that shape, and JavaScript has it built in, with its own literal syntax.</p>

<div class="codeSample" data-hl>const slug = /^[a-z0-9-]+$/;             // a LITERAL, written between slashes
const dyn  = new RegExp("^" + safe + "$");  // built from a string, when you must

slug.test("hello-world")        // true    the cheapest question: does it match?
"a1b2".match(/\\d/)              // ["1", ...]  the FIRST match, with details
"a1b2".match(/\\d/g)             // ["1","2"]   every match, as plain strings
[..."a1b2".matchAll(/\\d/g)]     // every match WITH its groups and its index
"a-b".replace(/-/g, "_")        // "a_b"       replace needs /g for all of them
"a, b,c".split(/,\\s*/)          // ["a","b","c"]</div>

<h4>The pieces you will actually use</h4>
<div class="codeSample" data-hl>.        any character except a newline
\\d  digit    \\w  letter/digit/underscore    \\s  whitespace    \\b  word boundary
[abc]    one of these     [^abc]  none of these     [a-z]  a range
a?  0 or 1      a*  0 or more      a+  1 or more      a{2,4}  between 2 and 4
^   start of the input          $   end of the input
(...)    a CAPTURING group       (?:...)  a group that captures nothing
(?&lt;year&gt;\\d{4})    a NAMED group, read back as m.groups.year
a|b      either one

FLAGS   g  find every match     i  ignore case     m  ^ and $ match per line
        s  let . match newlines too       u  treat the pattern as Unicode</div>

<h4>Anchors are not decoration</h4>
<p>The most common regex bug by a wide margin is forgetting that a pattern matches <i>anywhere</i> in the
input unless you say otherwise:</p>
<div class="codeSample" data-hl>/[a-z]+/.test("Hello!")        // true   - it found "ello" and stopped looking
/^[a-z]+$/.test("Hello!")      // false  - now the WHOLE input must match

// a validator written without ^ and $ accepts almost anything, and it
// passes every happy-path test you thought to write.</div>

<h4>Reading a match</h4>
<div class="codeSample" data-hl>const m = "[10:30] WARN: disk full".match(/^\\[(.+?)\\] (\\w+): (.*)$/);
m[0]     // the whole matched text
m[1]     // "10:30"        capture groups are numbered from 1, left to right
m[2]     // "WARN"
m[3]     // "disk full"

// match() returns NULL when nothing matched, so check before you index.
// m[1] on null throws a TypeError, and it throws one line after the
// mistake, which is the errors stream's point about reading traces.</div>

<h4>Two traps, before you meet them in production</h4>
<p><b>A global regex carries state.</b> A pattern with <code>/g</code> stored in a variable remembers a
<code>lastIndex</code> between calls, so calling <code>test</code> on the same object repeatedly returns
true, then false, then true. Build the regex where you use it, or leave the flag off when you only want a
yes or no.</p>
<p><b>Catastrophic backtracking is a denial of service.</b> Nesting quantifiers over overlapping
alternatives, as in <code>/(a+)+$/</code>, can take exponential time on an input that almost matches. That
is <b>ReDoS</b>, and it is why the Node lesson lists a regular expression among the things that block the
event loop for every connected client. Keep patterns flat, do not nest quantifiers, and never build one
out of user input.</p>

<h4>Where regular expressions stop</h4>
<p>A regex is the right tool for a small, flat, local pattern. It is the wrong tool for anything nested,
because a regular expression cannot count: HTML, JSON and source code need a parser, and every attempt to
match them with a pattern eventually meets an input that breaks it. Prefer a built-in when one exists.
<code>URL</code> beats a URL pattern, <code>includes</code> beats <code>/x/.test</code>, and
<code>Number.isFinite</code> beats a numeric pattern, as the previous lesson showed. And a pattern nobody
can read in six months has a cost of its own, so name it and comment the ones that are not obvious.</p>
`,
docs:[['MDN (Regular expressions guide)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions'],['MDN (RegExp)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp'],['OWASP (Regular expression denial of service)','https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS']],
exs:[
{title:'Anchor the pattern',diff:'easy',lang:'js',
run:{call:'slugOk',cases:[
 {name:'a normal slug',args:['hello-world'],expect:true},
 {name:'a single character is enough',args:['a'],expect:true},
 {name:'digits are allowed',args:['123'],expect:true},
 {name:'an unanchored pattern would wrongly accept this',args:['Hello'],expect:false},
 {name:'and this: a valid run of characters sitting inside junk',args:['!!hello!!'],expect:false},
 {name:'spaces are not allowed',args:['hello world'],expect:false},
 {name:'underscores are not in the character class',args:['hello_world'],expect:false},
 {name:'the empty string has no characters to match',args:[''],expect:false},
 {name:'accented letters are outside a-z',args:['café'],expect:false}]},
prompt:`Write <code>function slugOk(text)</code> returning <code>true</code> only when the whole of <code>text</code> is made of lowercase letters, digits and hyphens, with at least one character. Use a single anchored regular expression and <code>test</code>. The cases include strings that contain a valid run inside other characters, which is what an unanchored pattern gets wrong.`,
starter:`function slugOk(text) {
  return false;
}`,
solution:`function slugOk(text) {
  return /^[a-z0-9-]+$/.test(text);   // ^ and $ force the WHOLE string
}                                      // + means at least one character`,
tests:[{d:'anchors at the start',re:'/\\^'},{d:'anchors at the end',re:'\\$/'},{d:'allows lowercase letters, digits and hyphens',re:'\\[a-z0-9\\-?\\]'},{d:'requires at least one character',re:'\\]\\+'},{d:'asks the regex the question',re:'return\\s+(?!!)[^;]{0,80}?\\.test\\s*\\('}],
behavior:`Nine cases are executed. Two of them exist only to catch the missing anchors: "Hello" and "!!hello!!" both contain a perfectly valid run of lowercase letters, so a pattern of /[a-z0-9-]+/ reports true for both and passes every other case in the list. The empty string separates + from *.`,
hints:['One regular expression literal, anchored with ^ at the front and $ at the end.','The character class is lowercase letters, digits and a hyphen; put the hyphen last so it is not read as a range.','test() returns the boolean directly, so the whole body is one return.']},

{title:'Capture the parts of a log line',diff:'medium',lang:'js',
run:{call:'parseLogLine',cases:[
 {name:'a normal line',args:['[2026-03-03T10:00:00Z] WARN: disk full'],expect:{level:'WARN',message:'disk full'}},
 {name:'a colon inside the message is part of the message',args:['[2026-03-03T10:00:00Z] ERROR: db down: timeout after 30s'],expect:{level:'ERROR',message:'db down: timeout after 30s'}},
 {name:'an empty message is still a match',args:['[t] INFO: '],expect:{level:'INFO',message:''}},
 {name:'DEBUG is one of the four levels',args:['[t] DEBUG: entering loop'],expect:{level:'DEBUG',message:'entering loop'}},
 {name:'an unknown level does not match',args:['[t] TRACE: hello'],expect:null},
 {name:'a lowercase level does not match either',args:['[t] warn: hello'],expect:null},
 {name:'a line with no timestamp does not match',args:['WARN: disk full'],expect:null},
 {name:'the empty string does not match',args:[''],expect:null}]},
prompt:`Log lines arrive as <code>[TIMESTAMP] LEVEL: message</code>. Write <code>function parseLogLine(line)</code> returning <code>{ level, message }</code>, or <code>null</code> when the line does not have that shape. <code>LEVEL</code> must be exactly one of <code>DEBUG</code>, <code>INFO</code>, <code>WARN</code> or <code>ERROR</code>; the message runs to the end of the line and may contain colons, or be empty. Use capture groups rather than splitting on <code>":"</code>.`,
starter:`function parseLogLine(line) {
  return null;
}`,
solution:`function parseLogLine(line) {
  const m = line.match(/^\\[[^\\]]*\\] (DEBUG|INFO|WARN|ERROR): (.*)$/);
  if (m === null) return null;             // match() returns null, not []
  return { level: m[1], message: m[2] };   // groups are numbered from 1
}`,
tests:[{d:'anchors the whole line',re:'/\\^'},{d:'lists the four levels as alternatives',re:'DEBUG\\|INFO\\|WARN\\|ERROR'},{d:'captures the message to the end of the line',re:'\\(\\.\\*\\)\\$'},{d:'checks for null before indexing the match',re:'(?:===?\\s*null|!\\s*m\\b|m\\s*\\?)'},{d:'returns the captured groups themselves, not a negation of them',re:'return\\s+(?!!)[^;]{0,120}?m\\[1\\][\\s\\S]{0,120}?m\\[2\\]'}],
behavior:`Eight cases execute. The second is the one that rules out splitting on ":", because the message itself contains one; the greedy (.*) at the end takes everything that is left, which is exactly what you want here. The third pins (.*) rather than (.+), since an empty message is a real log line. And the two rejected levels show what the alternation and the anchors are for: "TRACE" is not in the list and "warn" is the wrong case, so neither matches at all.`,
hints:['Match the bracketed timestamp with a negated class so it cannot run past the closing bracket.','Put the four level names in an alternation group, and capture it.','Capture the rest with (.*) anchored at $, then check for null before reading m[1] and m[2].']}]}

]});
