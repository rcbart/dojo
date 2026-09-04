STREAMS.push({icon:'📦',title:'Objects, Arrays & Data',blurb:'The structures every JavaScript program is made of: objects and property access, arrays and the methods that replace most loops, destructuring and spread, reference vs value and the copying trap, Map and Set, and JSON with the things it silently loses.',lessons:[

{id:'js10',title:'Objects: properties, access and references',body:`
<p>An <b>object</b> is a collection of key/value pairs. Keys are strings (or symbols); values are
anything. Almost everything in JavaScript that is not a primitive is an object (arrays, functions,
dates, errors), so this lesson underpins most of the rest.</p>

<div class="codeSample" data-hl>const user = {
  name: "Ada",
  age: 36,
  "favorite color": "green",     // quotes needed: the key has a space
  greet() { return "hi"; },        // method shorthand
  address: { city: "London" }      // nested object
};

user.name                  // "Ada"          dot notation
user["favorite color"]   // "green"        bracket notation - required here
const key = "age";
user[key]                  // 36             bracket notation for a VARIABLE key

user.missing               // undefined - reading an absent key does NOT throw
user.missing.deep          // TypeError - but reading THROUGH undefined does
user.address?.city         // "London"   optional chaining stops the throw
user.nothing?.city         // undefined</div>

<h4>Adding, changing and removing</h4>
<div class="codeSample" data-hl>user.email = "a@b.c";           // add
user.age = 37;                  // change
delete user.age;                // remove (rare in practice)

"name" in user                  // true - includes inherited keys
Object.hasOwn(user, "name")     // true - OWN keys only. prefer this.

Object.keys(user)               // ["name", "favorite color", ...]
Object.values(user)
Object.entries(user)            // [["name","Ada"], ...] - the one to loop over</div>

<h4>References: the single most important idea here</h4>
<p>Primitives are copied by <b>value</b>. Objects are copied by <b>reference</b>: the variable holds a
pointer, not the object, so two names can refer to the same thing.</p>
<div class="codeSample" data-hl>let a = 1, b = a;  b = 2;      // a is still 1 - independent copies

const o1 = { n: 1 };
const o2 = o1;                 // NOT a copy - the same object
o2.n = 99;
o1.n;                          // 99   <- o1 changed too

o1 === o2                      // true  - same reference
{ n: 1 } === { n: 1 }          // false - different objects, same contents

// and it is why passing an object to a function lets it modify yours:
function rename(u) { u.name = "changed"; }   // mutates the CALLER's object</div>
<p>This explains a great deal of confusing behavior: why <code>const</code> objects can still change,
why a function "changed my data", why comparing two objects with <code>===</code> is almost never what
you want.</p>

<h4>Copying, and the shallow trap</h4>
<div class="codeSample" data-hl>const copy = { ...user };                  // SHALLOW copy
const copy2 = Object.assign({}, user);     // same thing, older form

copy.name = "Grace";        // fine - independent top-level property
copy.address.city = "Bath"; // MUTATES user.address too! nested objects
                            // are still shared references

const deep = structuredClone(user);   // a real deep copy (modern, built in)
// JSON.parse(JSON.stringify(user)) is the old trick - and it silently
// destroys Dates, undefined, functions, Map, Set and NaN. see the JSON lesson.</div>

<h4>Shorthand and computed keys</h4>
<div class="codeSample" data-hl>const name = "Ada", age = 36;
const u = { name, age };            // shorthand: { name: name, age: age }

const field = "email";
const patch = { [field]: "a@b.c" }; // computed key -> { email: "a@b.c" }</div>`,
docs:[['MDN (Working with objects)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects'],['MDN (Optional chaining)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining'],['MDN (structuredClone)','https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone']],
exs:[
{title:'Read safely through a nested object',diff:'easy',lang:'js',
run:{call:'cityOf',cases:[
 {name:'a full object',args:[{address:{city:'London'}}],expect:'London'},
 {name:'address present but no city',args:[{address:{}}],expect:'unknown'},
 {name:'no address at all',args:[{}],expect:'unknown'},
 {name:'a null user',args:[null],expect:'unknown'},
 {name:'an empty city string falls back too',args:[{address:{city:''}}],expect:'unknown'}]},
prompt:`Write <code>function cityOf(user)</code> returning <code>user.address.city</code>, or <code>"unknown"</code> when any part of that path is missing, including a <code>null</code> user and an empty-string city. Use optional chaining; it must not throw.`,
starter:`function cityOf(user) {
  return null;
}`,
solution:`function cityOf(user) {
  const city = user?.address?.city;   // short-circuits to undefined, no throw
  return city ? city : "unknown";     // "" is falsy, so it falls back too
}`,
tests:[{d:'uses optional chaining',re:'\\?\\.'},{d:'falls back to unknown',re:'return\\s+(?!!)[^;]{0,80}?"unknown"'}],
behavior:`Five cases execute, including a null user that would throw without optional chaining. Note the last one: an empty city string must also fall back, which is why a truthiness check is right here and ?? would be wrong: the opposite of the earlier lesson, because here "" is not a value you want to keep.`,
hints:['?. after each step stops the chain at the first null or undefined.','A null user needs the ?. on the very first access.','An empty string is falsy, so a plain truthiness test handles it.']},
{title:'Copy without sharing',diff:'medium',lang:'js',
run:{call:'renameCopy',cases:[
 {name:'the copy has the new name',args:[{name:'Ada',tags:['x']},'Grace'],expect:{name:'Grace',tags:['x']}},
 {name:'other fields survive',args:[{name:'Ada',age:36},'Grace'],expect:{name:'Grace',age:36}},
 {name:'an empty object gains the name',args:[{},'Grace'],expect:{name:'Grace'}}]},
prompt:`Write <code>function renameCopy(user, newName)</code> that returns a <b>new</b> object with every property of <code>user</code> and <code>name</code> replaced by <code>newName</code>. Do not modify the object you were given.`,
starter:`function renameCopy(user, newName) {
  return null;
}`,
solution:`function renameCopy(user, newName) {
  return { ...user, name: newName };   // spread first, then override
}`,
tests:[{d:'spreads the original',re:'return\\s+(?!!)[^;]{0,140}?\\.\\.\\.\\s*user'},{d:'overrides the name',re:'name:\\s*newName'},{d:'does not mutate the argument',re:'user\\.name\\s*=',not:true}],
behavior:`Order matters inside the literal: spreading first and overriding after is what applies your change. Reversing them would let the original name win. This is the standard shape for an immutable update, and it is exactly how React state updates are written.`,
hints:['Spread the original into a new object literal.','Put the override AFTER the spread or it will be overwritten.','Never assign to user.name; that would mutate the caller’s object.']}]},

{id:'js11',title:'Arrays and the methods that replace loops',body:`
<p>An array is an ordered, zero-indexed list, and an object underneath, which is why
<code>typeof []</code> is <code>"object"</code>. Its methods are where most real JavaScript data work
happens.</p>

<h4>The three that matter most</h4>
<div class="codeSample" data-hl>const nums = [1, 2, 3, 4];

nums.map(n =&gt; n * 2)            // [2,4,6,8]   SAME length, transformed
nums.filter(n =&gt; n % 2 === 0)   // [2,4]       FEWER items, same values
nums.reduce((acc, n) =&gt; acc + n, 0)   // 10    ONE value out of many

// choosing between them is mechanical:
//   same number of items, different shape   -> map
//   fewer items, unchanged                  -> filter
//   collapse to a single value              -> reduce</div>
<p><code>reduce</code>'s second argument is the <b>initial accumulator</b>, and omitting it is a real bug:
on an empty array with no initial value it throws, and with mixed types it starts from element zero
rather than the value you meant. Always pass it.</p>

<h4>The rest of the working set</h4>
<div class="codeSample" data-hl>arr.find(fn)        // first MATCHING VALUE, or undefined
arr.findIndex(fn)   // its index, or -1
arr.some(fn)        // true if ANY match      (short-circuits)
arr.every(fn)       // true if ALL match      (short-circuits; true when empty)
arr.includes(v)     // membership. it matches NaN, which indexOf does not,
                    // because it compares with SameValueZero, not ===
arr.flat(depth)     // flattens nested arrays
arr.flatMap(fn)     // map then flatten one level
arr.at(-1)          // last element - cleaner than arr[arr.length - 1]

// MUTATING (they change the array in place) - know which is which:
push / pop / shift / unshift / splice / sort / reverse / fill
// NON-MUTATING copies of the last two, when you need them:
arr.toSorted()  arr.toReversed()  arr.with(i, v)</div>

<h4>The <code>sort</code> trap</h4>
<div class="codeSample" data-hl>[10, 9, 1].sort()                  // [1, 10, 9]   !!
// sort converts to STRINGS by default and compares lexicographically.
[10, 9, 1].sort((a, b) =&gt; a - b)   // [1, 9, 10]   numeric, ascending
[10, 9, 1].sort((a, b) =&gt; b - a)   // [10, 9, 1]   descending

// and sort MUTATES. this changes the caller's array:
function top(list) { return list.sort((a,b) =&gt; b-a)[0]; }   // side effect!
function top2(list) { return [...list].sort((a,b) =&gt; b-a)[0]; }  // safe</div>

<h4>Chaining, and when to stop</h4>
<div class="codeSample" data-hl>const names = users
  .filter(u =&gt; u.active)
  .map(u =&gt; u.name)
  .sort();
// readable, and each step is one idea.

// but every step allocates a new array. for very large data, or when
// the chain grows past three or four steps, one loop is both faster
// and clearer. clarity first; reach for the loop when it IS clearer.</div>

<h4>Two behaviors worth knowing</h4>
<p><code>forEach</code> cannot <code>break</code> and ignores return values; if you want to stop early
use <code>some</code>, <code>find</code> or a <code>for...of</code>. And array "holes" (from
<code>new Array(3)</code> or deleting an element) are skipped by <code>map</code> and
<code>forEach</code> but not by <code>for...of</code>, which is one more reason to avoid creating
them.</p>`,
docs:[['MDN (Array)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array'],['MDN (Array.prototype.reduce)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce'],['MDN (Array.prototype.sort)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort']],
exs:[
{title:'Transform with map, filter and reduce',diff:'easy',lang:'js',
run:{call:'activeTotal',cases:[
 {name:'sums only the active items',args:[[{active:true,price:10},{active:false,price:99},{active:true,price:5}]],expect:15},
 {name:'nothing active',args:[[{active:false,price:99}]],expect:0},
 {name:'an empty list is 0',args:[[]],expect:0},
 {name:'all active',args:[[{active:true,price:1},{active:true,price:2}]],expect:3}]},
prompt:`Write <code>function activeTotal(items)</code> that sums the <code>price</code> of every item whose <code>active</code> is true. Use <code>filter</code> and <code>reduce</code>, and make sure an empty list returns <code>0</code> rather than throwing.`,
starter:`function activeTotal(items) {
  return 0;
}`,
solution:`function activeTotal(items) {
  return items
    .filter(i => i.active)
    .reduce((sum, i) => sum + i.price, 0);   // the 0 is REQUIRED here
}`,
tests:[{d:'filters to the active items',re:'\\.filter\\('},{d:'reduces to a single total',re:'\\.reduce\\('},{d:'passes an initial accumulator of 0',re:',\\s*0\\s*\\)\\s*;'}],
behavior:`The empty and nothing-active cases both execute, and both depend on the initial accumulator: without the trailing 0, reduce on an empty array throws a TypeError rather than returning 0. That is the argument for always supplying it.`,
hints:['filter first to narrow, then reduce to collapse.','reduce takes (accumulator, item) and an initial value.','The initial value is the second argument to reduce, after the callback.']},
{title:'Sort numbers without surprises',diff:'medium',lang:'js',
run:{call:'topThree',cases:[
 {name:'sorts numerically, not lexicographically',args:[[10,9,1,100]],expect:[100,10,9]},
 {name:'fewer than three items',args:[[2,1]],expect:[2,1]},
 {name:'an empty array',args:[[]],expect:[]},
 {name:'handles duplicates',args:[[5,5,5,1]],expect:[5,5,5]},
 {name:'negatives sort correctly',args:[[-1,-10,3]],expect:[3,-1,-10]}]},
prompt:`Write <code>function topThree(numbers)</code> returning the three largest values, highest first. It must <b>not</b> modify the array it is given, and it must sort numerically: the default <code>sort()</code> compares as strings.`,
starter:`function topThree(numbers) {
  return [];
}`,
solution:`function topThree(numbers) {
  return [...numbers]                 // copy: sort mutates in place
    .sort((a, b) => b - a)            // numeric, descending
    .slice(0, 3);                     // slice is safe on short arrays
}`,
tests:[{d:'copies before sorting',re:'\\[\\s*\\.\\.\\.\\s*numbers\\s*\\]|toSorted'},{d:'sorts numerically',re:'b\\s*-\\s*a'},{d:'takes the first three',re:'slice\\s*\\(\\s*0\\s*,\\s*3\\s*\\)'},{d:'returns the value itself, not a negation of it',re:'return\\s+!',not:true}],
behavior:`The first case fails outright with a bare sort(): as strings, 100 sorts before 9 because "1" < "9". slice handles short arrays without a length check, and the spread copy is what stops the caller's array being reordered underneath them.`,
hints:['Spread into a new array first, or use toSorted().','A numeric comparator subtracts: b - a for descending.','slice(0, 3) is safe even when there are fewer than three items.']},
{title:'Group and summarize',diff:'hard',lang:'js',
run:{call:'summarize',cases:[
 {name:'groups by category and totals each',args:[[{cat:'a',price:10},{cat:'b',price:5},{cat:'a',price:2}]],expect:[['a',12],['b',5]]},
 {name:'sorts by total, highest first',args:[[{cat:'a',price:1},{cat:'b',price:50}]],expect:[['b',50],['a',1]]},
 {name:'a single category',args:[[{cat:'a',price:7}]],expect:[['a',7]]},
 {name:'an empty list',args:[[]],expect:[]},
 {name:'ties keep first-seen order',args:[[{cat:'a',price:5},{cat:'b',price:5}]],expect:[['a',5],['b',5]]},
 {name:'handles many categories',args:[[{cat:'x',price:1},{cat:'y',price:3},{cat:'x',price:1},{cat:'z',price:2}]],expect:[['y',3],['x',2],['z',2]]}]},
prompt:`Write <code>function summarize(items)</code> that groups items by <code>cat</code>, sums each group's <code>price</code>, and returns <code>[category, total]</code> pairs sorted by total <b>descending</b>. On a tie, the category seen first must come first. An empty list returns <code>[]</code>.`,
starter:`function summarize(items) {
  return [];
}`,
solution:`function summarize(items) {
  const totals = new Map();                    // Map preserves insertion order
  for (const item of items) {
    totals.set(item.cat, (totals.get(item.cat) ?? 0) + item.price);
  }
  return [...totals].sort((a, b) => b[1] - a[1]);   // stable, so ties hold
}`,
tests:[{d:'accumulates per category',re:'\\.set\\('},{d:'reads the running total',re:'\\.get\\('},{d:'sorts by the total',re:'b\\[1\\]\\s*-\\s*a\\[1\\]|sort'},{d:'returns pairs',re:'\\[\\s*\\.\\.\\.'},{d:'returns the value itself, not a negation of it',re:'return\\s+!',not:true}],
behavior:`Six cases execute and two of them decide the implementation. The tie case only passes because Map keeps insertion order and Array.prototype.sort is stable; a plain object would give you no ordering guarantee for the keys. The empty case falls out with no special branch.`,
hints:['A Map accumulates the totals and remembers first-seen order.','Default the running total to 0 with ?? before adding.','Spread the Map into pairs, then sort by the second element descending.']}]},

{id:'js12',title:'Destructuring, spread and rest',body:`
<p>Three pieces of syntax that appear in almost every modern JavaScript file. They are not new
capabilities (they are shorter ways to express things you already know), but code that avoids them looks
a decade old.</p>

<h4>Destructuring: unpacking into variables</h4>
<div class="codeSample" data-hl>const user = { name: "Ada", age: 36, address: { city: "London" } };

const { name, age } = user;               // two variables, by KEY
const { name: n } = user;                 // rename while unpacking
const { missing = "n/a" } = user;         // default for an absent key
const { address: { city } } = user;       // nested

const [first, second] = [10, 20];         // arrays destructure by POSITION
const [, middle] = [1, 2, 3];             // an empty slot skips a position: 2
const [head, ...tail] = [1, 2, 3];        // head 1, tail [2, 3]

// swapping, with no temporary:
let a = 1, b = 2;
[a, b] = [b, a];</div>
<p>The most valuable use is in <b>parameters</b>, because it names the arguments at the call site:</p>
<div class="codeSample" data-hl>function draw({ x = 0, y = 0, color = "black" } = {}) { ... }
draw({ color: "red" });    // clear at the call site, order-independent
draw();                     // the trailing = {} is what makes this legal

// compare:  draw(0, 0, "red")  - which argument is which?</div>

<h4>Spread: expanding</h4>
<div class="codeSample" data-hl>const merged  = { ...defaults, ...options };   // later keys WIN
const cloned  = [...arr];                      // shallow copy
const joined  = [...a, ...b];                  // concatenate
Math.max(...nums);                             // array -> arguments
const chars   = [...\"héllo\"];                  // string -> array of chars
const unique  = [...new Set(arr)];             // dedupe, idiomatically</div>

<h4>Rest: collecting</h4>
<div class="codeSample" data-hl>function log(level, ...messages) { }      // gathers the remainder
const { id, ...rest } = record;           // everything EXCEPT id

// which is the clean way to drop a field without mutating:
const { password, ...safe } = user;       // \`safe\` has no password
return safe;</div>

<h4>Spread or rest? One rule</h4>
<p>Same three dots, opposite jobs, told apart by <b>position</b>. On the <b>left</b> of an assignment or
in a parameter list, it <b>collects</b> (rest). On the <b>right</b>, or inside a literal or a call, it
<b>expands</b> (spread).</p>

<h4>The limit worth remembering</h4>
<p>Spread copies are <b>shallow</b>. <code>{ ...user }</code> gives you a new top-level object whose
nested objects are still the same references, so mutating <code>copy.address.city</code> changes the
original. For a true deep copy use <code>structuredClone</code>.</p>`,
docs:[['MDN (Destructuring assignment)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment'],['MDN (Spread syntax)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax'],['MDN (Rest parameters)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters']],
exs:[
{title:'Strip a field without mutating',diff:'easy',lang:'js',
run:{call:'withoutPassword',cases:[
 {name:'removes the password',args:[{id:1,name:'Ada',password:'secret'}],expect:{id:1,name:'Ada'}},
 {name:'an object with no password is unchanged',args:[{id:1,name:'Ada'}],expect:{id:1,name:'Ada'}},
 {name:'an object with only a password becomes empty',args:[{password:'x'}],expect:{}},
 {name:'other secrets are left alone',args:[{id:1,password:'x',token:'t'}],expect:{id:1,token:'t'}}]},
prompt:`Write <code>function withoutPassword(user)</code> returning a new object with every property except <code>password</code>. Use rest destructuring, and do not modify the original.`,
starter:`function withoutPassword(user) {
  return null;
}`,
solution:`function withoutPassword(user) {
  const { password, ...safe } = user;   // password is pulled out and dropped
  return safe;
}`,
tests:[{d:'uses rest destructuring',re:'\\.\\.\\.\\s*(safe|rest)[\\s\\S]{0,100}?return\\s+\\1\\b'},{d:'names the field being removed',re:'password'},{d:'does not delete from the original',re:'delete\\s+user',not:true}],
behavior:`Four cases execute, including one where the field is absent; rest destructuring handles that without a guard. Note the last case: only password is removed, so a token still passes through. Using delete would have mutated the caller's object instead of returning a new one.`,
hints:['Destructure the unwanted key by name, then collect the rest.','The rest variable is the object you return.','delete would work but mutates what you were given.']},
{title:'Merge configuration correctly',diff:'medium',lang:'js',
run:{call:'resolve',cases:[
 {name:'options override defaults',args:[{port:80,host:'a'},{port:8080}],expect:{port:8080,host:'a'}},
 {name:'defaults fill the gaps',args:[{port:80,host:'a'},{}],expect:{port:80,host:'a'}},
 {name:'new keys are added',args:[{port:80},{debug:true}],expect:{port:80,debug:true}},
 {name:'a zero override is respected, not treated as absent',args:[{port:80},{port:0}],expect:{port:0}}]},
prompt:`Write <code>function resolve(defaults, options)</code> returning a new object where <code>options</code> wins over <code>defaults</code>. A supplied value of <code>0</code> or <code>""</code> is a real override and must be kept.`,
starter:`function resolve(defaults, options) {
  return null;
}`,
solution:`function resolve(defaults, options) {
  return { ...defaults, ...options };   // later spread wins, per key
}`,
tests:[{d:'spreads the defaults first',re:'return\\s+(?!!)[^;]{0,140}?\\.\\.\\.\\s*defaults'},{d:'spreads the options after',re:'\\.\\.\\.\\s*options'}],
behavior:`The last case executes the trap: spreading gives per-key override by presence, so an explicit port of 0 survives. Writing this with || per field (options.port || defaults.port) would silently replace 0 with 80, which is the same falsy-versus-nullish bug from the operators lesson.`,
hints:['Both objects spread into one literal.','Whichever is spread LAST wins on conflicting keys.','No per-field logic is needed at all.']}]},

{id:'js13',title:'Map, Set and JSON',body:`
<p>Plain objects and arrays cover most needs. Three other tools cover the rest, and JSON is how data
leaves your program, with a short list of things it destroys on the way out.</p>

<h4><code>Map</code>: a dictionary with real keys</h4>
<div class="codeSample" data-hl>const m = new Map();
m.set("a", 1);
m.set(42, "answer");          // keys keep their TYPE - not stringified
m.set(someObject, "meta");    // objects can be keys

m.get("a")        // 1
m.has(42)         // true
m.delete("a")
m.size            // a property, unlike an object which needs Object.keys
for (const [k, v] of m) { }   // iterates in INSERTION order

// versus a plain object:
const o = {};
o[42] = "x";  Object.keys(o);   // ["42"] - the number became a string</div>
<p>Choose <code>Map</code> when keys are not strings, when you add and remove frequently, when insertion
order matters, or when the keys come from user input: a plain object inherits from
<code>Object.prototype</code>, so a key of <code>"constructor"</code> or <code>"__proto__"</code> behaves
strangely. Choose a plain object for fixed, known-at-write-time shapes, and because it serializes to JSON
where a <code>Map</code> does not.</p>

<h4><code>Set</code>: unique values</h4>
<div class="codeSample" data-hl>const s = new Set([1, 2, 2, 3]);   // {1, 2, 3} - duplicates dropped
s.add(4);  s.has(2);  s.delete(1);  s.size;

const unique = [...new Set(arr)];        // the idiomatic dedupe

// uniqueness uses SameValueZero: like === except NaN equals itself,
// so two NaNs collapse to one. OBJECTS are compared by reference:
new Set([{a:1}, {a:1}]).size             // 2 - two different objects</div>

<h4>JSON: and what it silently loses</h4>
<div class="codeSample" data-hl>JSON.stringify({ a: 1 })              // '{"a":1}'
JSON.stringify(obj, null, 2)          // pretty-printed with 2-space indent
JSON.parse('{"a":1}')                 // { a: 1 }

// THE LOSSES - all silent, none throws:
JSON.stringify({ d: new Date() })     // date becomes a STRING; parsing back
                                      // gives you a string, not a Date
JSON.stringify({ u: undefined })      // '{}'    key removed entirely
JSON.stringify({ f: () =&gt; {} })       // '{}'    functions dropped
JSON.stringify({ m: new Map([[1,2]])}) // '{"m":{}}'  Map/Set become {}
JSON.stringify({ n: NaN })            // '{"n":null}'  NaN and Infinity -> null
JSON.stringify({ b: 1n })             // TypeError - bigint is the one that DOES throw

// and circular references throw:
const a = {}; a.self = a; JSON.stringify(a);   // TypeError</div>
<p>This is why <code>JSON.parse(JSON.stringify(x))</code> is a bad deep-copy idiom: it works until the
object contains a date, and then it fails in a way nobody notices until a comparison goes wrong. Use
<code>structuredClone</code>.</p>

<h4><code>JSON.parse</code> throws</h4>
<p>Unlike most of JavaScript, malformed JSON is an exception, not <code>undefined</code>. Anything parsed
from a network response, a file, or user input needs a <code>try</code>/<code>catch</code>, a topic the
errors stream takes properly.</p>`,
docs:[['MDN (Map)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map'],['MDN (Set)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set'],['MDN (JSON)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON']],
exs:[
{title:'Count occurrences with a Map',diff:'easy',lang:'js',
run:{call:'countWords',cases:[
 {name:'counts repeats',args:[['a','b','a']],expect:[['a',2],['b',1]]},
 {name:'preserves insertion order',args:[['z','a','z']],expect:[['z',2],['a',1]]},
 {name:'an empty list gives no entries',args:[[]],expect:[]},
 {name:'all unique',args:[['x','y']],expect:[['x',1],['y',1]]}]},
prompt:`Write <code>function countWords(words)</code> that counts occurrences using a <code>Map</code> and returns the entries as an array of <code>[word, count]</code> pairs, in first-seen order. Return <code>[...map]</code> at the end.`,
starter:`function countWords(words) {
  return [];
}`,
solution:`function countWords(words) {
  const counts = new Map();
  for (const w of words) {
    counts.set(w, (counts.get(w) ?? 0) + 1);   // absent -> undefined -> 0
  }
  return [...counts];                           // Map -> array of [k, v]
}`,
tests:[{d:'uses a Map',re:'new\\s+Map'},{d:'reads the current count',re:'\\.get\\('},{d:'writes the incremented count',re:'\\.set\\('},{d:'spreads the map into entries',re:'return\\s+(?!!)[^;]{0,60}?\\[\\s*\\.\\.\\.'}],
behavior:`Insertion order is executed as its own case: a Map iterates in the order keys were first added, so 'z' comes before 'a'. The ?? 0 handles the first sighting of a word, where get() returns undefined and undefined + 1 would be NaN.`,
hints:['get() returns undefined for a key you have not seen; default it to 0.','set() overwrites, so read-then-write is the pattern.','Spreading a Map gives you [key, value] pairs directly.']},
{title:'Parse JSON without crashing',diff:'medium',lang:'js',
run:{call:'safeParse',cases:[
 {name:'valid JSON object',args:['{"a":1}'],expect:{a:1}},
 {name:'valid JSON array',args:['[1,2]'],expect:[1,2]},
 {name:'malformed JSON returns null',args:['{a:1}'],expect:null},
 {name:'truncated JSON returns null',args:['{"a":'],expect:null},
 {name:'an empty string returns null',args:[''],expect:null},
 {name:'the literal null parses to null',args:['null'],expect:null}]},
prompt:`Write <code>function safeParse(text)</code> that returns the parsed value, or <code>null</code> when the text is not valid JSON. <code>JSON.parse</code> throws on malformed input; catch it rather than letting it escape.`,
starter:`function safeParse(text) {
  return null;
}`,
solution:`function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;             // optional catch binding: no (e) needed
  }
}`,
tests:[{d:'calls JSON.parse',re:'(?:return\\s+|=\\s*)JSON\\.parse\\s*\\('},{d:'catches the failure',re:'catch[^;]{0,100}?return\\s+null'}],
behavior:`Three malformed inputs execute, each of which throws a SyntaxError without the catch. Note the last case: the string "null" is valid JSON that parses to null, so a valid parse and a failed one produce the same answer here: a real ambiguity, and the reason production code usually returns { ok, value } instead.`,
hints:['Wrap the parse in try/catch.','catch { } without a binding is legal modern JavaScript.','Return null from the catch block, not from after the try.']}]}
,

{id:'jsdate',title:'Dates, times and Intl',body:`
<p>Dates look easy and are the most reliable source of production bugs in this stream. The reason is that
a moment in time is one thing, and a human's description of it ("March 3rd, in Sydney") is another, and
JavaScript's <code>Date</code> mixes the two in ways you have to learn once, properly.</p>

<h4>What a Date actually is</h4>
<div class="codeSample" data-hl>Date.now()               // 1755350400000 - milliseconds since Jan 1 1970 UTC
new Date()               // now, as an object
new Date("2026-03-03T10:00:00Z")   // the Z means UTC. ALWAYS send this form.

// a Date is JUST that number with methods on it. it has no timezone
// inside it - the timezone appears when you FORMAT it:
d.toISOString()          // "2026-03-03T10:00:00.000Z"  - UTC, for machines
d.toLocaleString()       // "3/3/2026, 9:00 PM"         - the USER'S zone</div>
<p>That is the whole model: <b>store and transmit UTC instants, format for humans at the very edge</b>.
The bug class this prevents (a birthday shifting a day depending on who views it) comes from doing
either job in the wrong place.</p>

<h4>The traps, named</h4>
<div class="codeSample" data-hl>new Date("2026-03-03")       // midnight UTC - shows as Mar 2 in New York!
new Date(2026, 2, 3)         // months are ZERO-BASED: 2 is March. yes really.
d.getMonth()                 // also zero-based
d.getDay()                   // day of WEEK (0=Sunday), not day of month
new Date("garbage")          // Invalid Date - no throw, and every method
                             // on it returns NaN, which then spreads

// durations: subtracting Dates gives milliseconds
const days = (end - start) / (1000 * 60 * 60 * 24);
// safe for elapsed time. NOT safe for "same time tomorrow" - daylight
// saving makes some days 23 or 25 hours long. calendar math needs a
// library (Temporal, the replacement API, fixes this properly).</div>

<h4>Intl: formatting you do not have to write</h4>
<p>Every "format this nicely" function you are tempted to write already exists, localized, in
<code>Intl</code>:</p>
<div class="codeSample" data-hl>new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(d)
// "3 March 2026"
new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(9.99)
// "9,99 €"       - and yes, the decimal comma is correct in German
new Intl.RelativeTimeFormat("en").format(-2, "day")
// "2 days ago"
new Intl.NumberFormat("en", { notation: "compact" }).format(14500)
// "15K"</div>
<p>Reaching for <code>Intl</code> instead of hand-rolled formatting is one of those habits that quietly
marks experienced code: it handles locales you have never heard of, and it means a French user sees
French punctuation without anyone writing an if-statement about it.</p>`,
docs:[['MDN (Date)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date'],['MDN (Intl)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl'],['TC39 (Temporal)','https://tc39.es/proposal-temporal/docs/']],
ex:{title:'Work with instants, not strings',diff:'medium',lang:'js',
run:{call:'daysBetween',cases:[
 {name:'a simple span',args:['2026-03-01T00:00:00Z','2026-03-04T00:00:00Z'],expect:3},
 {name:'the same instant is zero days',args:['2026-03-01T00:00:00Z','2026-03-01T00:00:00Z'],expect:0},
 {name:'order does not matter',args:['2026-03-04T00:00:00Z','2026-03-01T00:00:00Z'],expect:3},
 {name:'partial days round DOWN',args:['2026-03-01T00:00:00Z','2026-03-02T18:00:00Z'],expect:1},
 {name:'an invalid date returns null, not NaN',args:['garbage','2026-03-01T00:00:00Z'],expect:null},
 {name:'both invalid is also null',args:['x','y'],expect:null}]},
prompt:`Write <code>function daysBetween(a, b)</code> taking two ISO strings and returning the number of <b>whole</b> days between the instants, regardless of order. Parse with <code>new Date(...)</code>, and return <code>null</code> when either fails to parse; remember that an invalid Date does not throw, it poisons every calculation after it with <code>NaN</code>.`,
starter:`function daysBetween(a, b) {
  return 0;
}`,
solution:`function daysBetween(a, b) {
  const da = new Date(a), db = new Date(b);
  if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) {
    return null;                       // Invalid Date poisons silently - stop it here
  }
  const ms = Math.abs(db - da);        // subtraction gives milliseconds
  return Math.floor(ms / 86400000);    // 1000*60*60*24, whole days only
}`,
tests:[{d:'parses both inputs as Dates',re:'new\\s+Date'},{d:'detects an invalid date',re:'isNaN[^;]{0,160}?return\\s+null'},{d:'is order-independent',re:'Math\\.abs'},{d:'rounds down to whole days',re:'(?:return\\s+|=\\s*)Math\\.floor\\s*\\('}],
behavior:`Six cases execute. The invalid-date pair is the production one: new Date("garbage") is not an exception, it is a value whose getTime() is NaN, and NaN divided, floored and compared stays NaN, so a guard at the boundary is the only place to catch it, exactly like toNumber in the foundations stream.`,
hints:['getTime() on an invalid Date is NaN; check both before any arithmetic.','Subtracting Dates yields milliseconds; Math.abs removes the order problem.','86,400,000 milliseconds make a day; floor keeps only whole ones.']}}


]});
