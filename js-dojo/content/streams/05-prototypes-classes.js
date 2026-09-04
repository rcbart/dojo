STREAMS.push({icon:'🧬',title:'Prototypes, Classes & Objects in Depth',blurb:'How JavaScript objects actually inherit: the prototype chain, class syntax as sugar over it, inheritance and super, getters/setters and private fields, static members, and making your own objects iterable.',lessons:[

{id:'js22',title:'The prototype chain',body:`
<p>JavaScript has no classes underneath. It has <b>objects that link to other objects</b>, and a lookup
rule. Learning that first makes <code>class</code> obvious later; learning <code>class</code> first
leaves you unable to explain anything that goes wrong.</p>

<h4>The rule</h4>
<p>Every object has a hidden link to another object, its <b>prototype</b>. When you read a property the
engine checks the object itself, then its prototype, then <i>that</i> object's prototype, and so on until
it reaches <code>null</code>. Missing at the end means <code>undefined</code>.</p>
<div class="codeSample" data-hl>const animal = { speak() { return "..."; } };
const dog = Object.create(animal);        // dog's prototype IS animal
dog.name = "Rex";

dog.name          // "Rex"   found on dog itself
dog.speak()       // "..."   not on dog -> found on animal
dog.toString()    // found further up, on Object.prototype
dog.missing       // undefined - reached the end of the chain

// dog ──▶ animal ──▶ Object.prototype ──▶ null

Object.getPrototypeOf(dog) === animal     // true
Object.hasOwn(dog, "speak")               // false - inherited, not own
"speak" in dog                            // true  - 'in' searches the CHAIN</div>
<p>The distinction between <b>own</b> and <b>inherited</b> is the one that matters in practice.
<code>Object.keys</code>, <code>JSON.stringify</code> and spread copy only <b>own</b> properties, so
inherited methods vanish from a spread copy, a genuinely surprising result until you know the rule.</p>

<h4>Writing does not follow the chain</h4>
<div class="codeSample" data-hl>dog.speak = () =&gt; "woof";     // creates an OWN property on dog.
                              // animal.speak is untouched.
delete dog.speak;             // now dog.speak() finds animal's again

// reading searches upward; writing always lands on the object itself.
// this is what "shadowing" means for properties, and it is why one
// object cannot corrupt its prototype by assignment.</div>

<h4>Where prototypes come from</h4>
<div class="codeSample" data-hl>{}          ──▶ Object.prototype    (hasOwnProperty, toString, ...)
[]          ──▶ Array.prototype     (map, filter, ...) ──▶ Object.prototype
function(){}──▶ Function.prototype  (call, apply, bind)
"hi"        ──▶ String.prototype    via temporary boxing

// so arr.map is not on your array - it is one link up, shared by EVERY
// array in the program. that is the memory win prototypes exist for.</div>

<h4>Constructor functions: the old way, still worth reading</h4>
<div class="codeSample" data-hl>function Dog(name) { this.name = name; }        // capitalised by convention
Dog.prototype.speak = function () { return this.name + " says woof"; };

const rex = new Dog("Rex");
// what \`new\` does, in four steps:
//   1. create an empty object
//   2. link its prototype to Dog.prototype
//   3. call Dog with \`this\` set to the new object
//   4. return it (unless the function returns its own object)</div>
<p>Class syntax does exactly this, with better ergonomics. Nothing new was added to the language, which
is why a <code>class</code> is still a function, and <code>typeof Dog</code> is <code>"function"</code>.</p>

<h4>Two warnings</h4>
<p><b>Never modify built-in prototypes.</b> Adding <code>Array.prototype.last</code> affects every array
in the program, including every library's, and breaks the day the language adds a method of that name.</p>
<p><b>Prototype pollution is a real vulnerability.</b> Merging untrusted JSON into an object can set
<code>__proto__</code> and thereby add a property to <i>every</i> object in the program. Use
<code>Object.create(null)</code> for lookup tables built from user input, or a <code>Map</code>.</p>`,
docs:[['MDN (Inheritance and the prototype chain)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain'],['MDN (Object.create)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create'],['OWASP (prototype pollution)','https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/11-Client-side_Testing/13-Testing_for_Prototype_Pollution']],
ex:{title:'Own or inherited?',diff:'easy',lang:'js',
run:{call:'lookup',cases:[
 {name:'found as an own property',args:[['name'],['speak'],'name'],expect:'own'},
 {name:'found on the prototype',args:[['name'],['speak'],'speak'],expect:'inherited'},
 {name:'own shadows inherited',args:[['speak'],['speak'],'speak'],expect:'own'},
 {name:'found nowhere',args:[['name'],['speak'],'fly'],expect:'undefined'},
 {name:'no own properties at all',args:[[],['speak'],'speak'],expect:'inherited'}]},
prompt:`Write <code>function lookup(ownKeys, protoKeys, key)</code> modeling the chain: return <code>"own"</code> when the key is in <code>ownKeys</code>, <code>"inherited"</code> when it is only in <code>protoKeys</code>, and <code>"undefined"</code> when it is in neither.`,
starter:`function lookup(ownKeys, protoKeys, key) {
  return null;
}`,
solution:`function lookup(ownKeys, protoKeys, key) {
  if (ownKeys.includes(key)) return "own";           // the object itself first
  if (protoKeys.includes(key)) return "inherited";   // then one link up
  return "undefined";                                 // end of the chain
}`,
tests:[{d:'checks own properties first',re:'ownKeys[^;]{0,140}?(?:return\\s+|\\?\\s*)"own"'},{d:'then the prototype',re:'protoKeys[^;]{0,140}?(?:return\\s+|\\?\\s*)"inherited"'},{d:'missing keys are undefined',re:'(?:return\\s+(?!!)[^;]{0,110}?"undefined"|:\\s*"undefined")'}],
behavior:`The shadowing case executes the ordering: with the key in both, "own" must win; checking the prototype first would pass the other four and fail that one. The last case shows an object with no own properties still resolving through its prototype.`,
hints:['Two checks in order, own first.','includes() answers whether a key is present.','Falling off the end gives undefined, not an error.']}},

{id:'js23',title:'Classes',body:`
<p><code>class</code> is <b>syntax over prototypes</b>. Everything it does could be written with
constructor functions, and knowing that is what lets you debug it, but the syntax is clearer, and it is
what modern code uses.</p>

<div class="codeSample" data-hl>class Account {
  #balance = 0;                     // PRIVATE field - truly inaccessible
  static count = 0;                 // on the CLASS, not on instances

  constructor(owner, balance = 0) {
    this.owner = owner;             // public instance field
    this.#balance = balance;
    Account.count++;
  }

  deposit(amount) {                 // goes on Account.prototype - ONE copy,
    this.#balance += amount;        // shared by every instance
    return this;                    // returning this enables chaining
  }

  get balance() { return this.#balance; }        // read as a.balance
  set balance(v) { throw new Error("read-only"); }

  static open(owner) { return new Account(owner); }   // called on the CLASS
}

const a = new Account("Ada", 100);
a.deposit(50).deposit(25);          // chaining works because deposit returns this
a.balance;                          // 175 - via the getter, no parentheses
a.#balance;                         // SyntaxError - private outside the class</div>

<h4>What the syntax actually adds</h4>
<p><b>Private fields</b> (<code>#</code>) are genuinely new: they cannot be reached from outside at all,
unlike the old underscore convention which was a request rather than a rule. Everything else is
ergonomics: methods land on the prototype automatically, and <code>new</code> is enforced.</p>
<div class="codeSample" data-hl>Account("Ada");        // TypeError: cannot be invoked without 'new'
// a constructor function would have silently run with this = undefined,
// which is the bug class syntax removes.

// classes are NOT hoisted like function declarations:
new Foo();             // ReferenceError - temporal dead zone
class Foo {}
// and the body is always strict mode, whatever the surrounding file.</div>

<h4>Methods versus instance fields</h4>
<div class="codeSample" data-hl>class A {
  method() {}                    // ON THE PROTOTYPE - one copy, shared
  arrow = () =&gt; {};              // AN INSTANCE FIELD - a NEW function per
}                                //   instance, and it binds \`this\` forever

// the arrow-field form costs memory per instance and cannot be overridden
// by a subclass in the usual way. its one real use is a handler you must
// detach from the object and pass elsewhere without losing \`this\`.</div>

<h4>The <code>this</code> problem has not gone away</h4>
<div class="codeSample" data-hl>const a = new Account("Ada");
const fn = a.deposit;
fn(50);                       // TypeError - detached, so \`this\` is undefined
                              // (class bodies are strict mode)

setTimeout(() =&gt; a.deposit(50), 100);      // the dot survives
setTimeout(a.deposit.bind(a), 100);        // or bind it</div>
<p>Class syntax makes this <i>louder</i> (you get a clear <code>TypeError</code> rather than a silent
write to the global object), but the rule is unchanged: <code>this</code> comes from the call.</p>`,
docs:[['MDN (Classes)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes'],['MDN (Private properties)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties'],['MDN (static)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static']],
exs:[
{title:'A class with private state',diff:'easy',lang:'js',
run:{call:'runAccount',cases:[
 {name:'deposits accumulate',args:[[10,20,30]],expect:60},
 {name:'a single deposit',args:[[5]],expect:5},
 {name:'no deposits leaves zero',args:[[]],expect:0},
 {name:'negative deposits are ignored',args:[[10,-5,10]],expect:20}]},
prompt:`Write <code>class Account</code> with a private <code>#balance</code> starting at 0, a <code>deposit(amount)</code> method that ignores amounts of zero or less and returns <code>this</code>, and a <code>balance</code> getter. Then write <code>function runAccount(amounts)</code> that creates one account, deposits each amount, and returns the final balance.`,
starter:`class Account {
}
function runAccount(amounts) {
  return 0;
}`,
solution:`class Account {
  #balance = 0;                       // private: unreachable from outside
  deposit(amount) {
    if (amount > 0) this.#balance += amount;   // guard, then mutate
    return this;                                // enables chaining
  }
  get balance() { return this.#balance; }
}
function runAccount(amounts) {
  const a = new Account();
  for (const amount of amounts) a.deposit(amount);
  return a.balance;                    // a getter: no parentheses
}`,
tests:[{d:'uses a private field',re:'#balance'},{d:'declares a getter',re:'get\\s+balance'},{d:'guards against non-positive deposits',re:'amount\\s*>\\s*0'},{d:'returns the value itself, not a negation of it',re:'return\\s+!',not:true},{d:'creates an instance',re:'new\\s+Account[\\s\\S]{0,300}?return\\s+(?!!)'}],
behavior:`Your class is exercised through runAccount, so the field, the guard and the getter all have to work. The negative case executes the guard, and the empty case relies on the field initializer rather than a constructor.`,
hints:['A field declared with # is private to the class body.','The getter is read as a.balance with no call parentheses.','Return this from deposit so calls can chain.']},
{title:'Static members belong to the class',diff:'medium',lang:'js',
run:{call:'countInstances',cases:[
 {name:'counts three',args:[3],expect:3},
 {name:'counts one',args:[1],expect:1},
 {name:'counts none',args:[0],expect:0},
 {name:'counts many',args:[10],expect:10}]},
prompt:`Write <code>class Widget</code> with a <code>static count = 0</code> incremented in its constructor, then <code>function countInstances(n)</code> that creates <code>n</code> widgets and returns <code>Widget.count</code>.`,
starter:`class Widget {
}
function countInstances(n) {
  return 0;
}`,
solution:`class Widget {
  static count = 0;              // lives on the CLASS, shared by all
  constructor() {
    Widget.count++;              // note: Widget.count, not this.count
  }
}
function countInstances(n) {
  Widget.count = 0;              // reset so repeated runs are independent
  for (let i = 0; i < n; i++) new Widget();
  return Widget.count;
}`,
tests:[{d:'declares a static field',re:'static\\s+count'},{d:'increments it in the constructor',re:'Widget\\.count\\+\\+|Widget\\.count\\s*\\+='},{d:'reads the count from the class',re:'return\\s+Widget\\.count'}],
behavior:`The zero case executes an important detail: the static field must be reset inside countInstances, because a static lives on the class for the lifetime of the program and would otherwise carry over between cases. Writing this.count++ instead would create a per-instance property and always report 0.`,
hints:['A static field is written on the class, so increment Widget.count.','this.count would be a per-instance property, which is not what you want.','Reset the counter at the start so each call is independent.']},
{title:'A queue that enforces its own rules',diff:'hard',lang:'js',
run:{call:'runQueue',cases:[
 {name:'items come out in the order they went in',args:[[['add','a'],['add','b'],['take'],['take']],10],expect:{out:['a','b'],size:0,dropped:0}},
 {name:'a full queue drops new items rather than growing',args:[[['add','a'],['add','b'],['add','c']],2],expect:{out:[],size:2,dropped:1}},
 {name:'taking from an empty queue yields null',args:[[['take']],5],expect:{out:[null],size:0,dropped:0}},
 {name:'space freed by taking can be reused',args:[[['add','a'],['add','b'],['take'],['add','c']],2],expect:{out:['a'],size:2,dropped:0}},
 {name:'a capacity of zero drops everything',args:[[['add','a'],['add','b']],0],expect:{out:[],size:0,dropped:2}},
 {name:'no operations at all',args:[[],3],expect:{out:[],size:0,dropped:0}}]},
prompt:`Write <code>class BoundedQueue</code> with a private items array and a private capacity set in the constructor. <code>add(item)</code> appends and returns <code>true</code>, or returns <code>false</code> without adding when the queue is full. <code>take()</code> removes and returns the oldest item, or <code>null</code> when empty. A <code>size</code> getter reports the current count. Then write <code>function runQueue(ops, capacity)</code> that creates one queue, applies each operation (<code>["add", value]</code> or <code>["take"]</code>) and returns <code>{ out, size, dropped }</code>, where <code>out</code> collects every value returned by <code>take</code> and <code>dropped</code> counts the refused adds.`,
starter:`class BoundedQueue {
}
function runQueue(ops, capacity) {
  return { out: [], size: 0, dropped: 0 };
}`,
solution:`class BoundedQueue {
  #items = [];
  #capacity;
  constructor(capacity) { this.#capacity = capacity; }

  add(item) {
    if (this.#items.length >= this.#capacity) return false;   // refuse, do not grow
    this.#items.push(item);
    return true;
  }
  take() {
    return this.#items.length === 0 ? null : this.#items.shift();   // oldest first
  }
  get size() { return this.#items.length; }
}

function runQueue(ops, capacity) {
  const q = new BoundedQueue(capacity);
  const out = [];
  let dropped = 0;
  for (const [op, value] of ops) {
    if (op === "add") {
      if (!q.add(value)) dropped++;      // add() reports refusal; count it
    } else {
      out.push(q.take());                // null is a real result and is kept
    }
  }
  return { out, size: q.size, dropped };
}`,
tests:[{d:'holds the items privately',re:'#items'},{d:'holds the capacity privately',re:'#capacity'},{d:'refuses when full',re:'(?:>=\\s*this\\.#capacity|length\\s*>=)[^;]{0,100}?return\\s+false\\b'},{d:'takes from the front',re:'return\\s+(?!!)[^;]{0,140}?shift\\(\\)'},{d:'exposes a size getter',re:'get\\s+size'}],
behavior:`Six scenarios execute your class through runQueue, so the private fields, the capacity check, the empty case and the getter all have to work together. Two cases are deliberately awkward: a capacity of 0 must refuse every add rather than dividing by anything or throwing, and taking from an empty queue must return null, which runQueue then stores, so treating null as "nothing happened" and skipping it fails the third case. Note that shift() removes from the front, which is what makes this a queue rather than a stack.`,
hints:['Both the items array and the capacity should be private fields.','add() returns a boolean so the caller can count refusals; it should not throw.','take() uses shift() for first-in-first-out, and returns null rather than undefined when empty.']}]},

{id:'js24',title:'Inheritance, and when not to use it',body:`
<p><code>extends</code> links one class's prototype to another's, so instances inherit through the chain
from the first lesson. The syntax is small; the judgment about <i>whether</i> to inherit is the real
content here.</p>

<div class="codeSample" data-hl>class Animal {
  constructor(name) { this.name = name; }
  speak() { return \`\${this.name} makes a sound\`; }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);                 // MUST come before any use of \`this\`
    this.breed = breed;
  }
  speak() {
    return \`\${super.speak()} - specifically, a woof\`;   // call up the chain
  }
}

// rex ──▶ Dog.prototype ──▶ Animal.prototype ──▶ Object.prototype ──▶ null
new Dog("Rex", "collie") instanceof Animal   // true - instanceof walks the chain</div>
<p><code>super(...)</code> before <code>this</code> is not a style rule: the parent constructor is what
creates the object, so touching <code>this</code> first is a <code>ReferenceError</code>. Omitting
<code>super()</code> entirely in a subclass constructor is the same error.</p>

<h4>Overriding, and the substitution rule</h4>
<p>A subclass may replace a method, but callers holding an <code>Animal</code> reference must not be
surprised. If <code>Dog.speak()</code> throws where <code>Animal.speak()</code> returned a string, or
demands arguments the parent did not, you have broken every function that accepts an
<code>Animal</code>. That constraint (the Liskov substitution principle) is what makes inheritance safe,
and it is violated more often than it is honored.</p>

<h4>The judgment: is-a versus has-a</h4>
<div class="codeSample" data-hl>INHERIT when the subclass genuinely IS the parent, everywhere the parent
  is accepted, with no exceptions you have to document.

COMPOSE when you only wanted to reuse some behavior.

// the classic mistake:
class Stack extends Array { }     // a Stack IS-A Array? then it also has
                                  // push, pop, splice, sort, indexOf,
                                  // length assignment... you inherited the
                                  // whole surface, including the parts that
                                  // let a caller violate stack semantics.

class Stack {                     // composition: you expose only what you mean
  #items = [];
  push(v) { this.#items.push(v); return this; }
  pop() { return this.#items.pop(); }
  get size() { return this.#items.length; }
}</div>
<p><b>Inheritance couples you to everything the parent has, forever.</b> Composition lets you expose a
deliberate surface. Prefer composition, and reach for inheritance when the hierarchy is genuinely stable
and the substitution really holds.</p>

<h4>Deep hierarchies are the failure mode</h4>
<p>Three or more levels and a change at the top ripples unpredictably, while understanding any single
class means reading four files. In JavaScript this matters more than in Java, because there is no
compiler-enforced contract to lean on and no interfaces to program against, so the discipline has to
come from you.</p>

<h4>Extending built-ins</h4>
<p><code>class MyError extends Error</code> is the one everyone needs, and it has a detail: set
<code>this.name</code> yourself, because the default is inherited and your subclass will otherwise
identify itself as <code>"Error"</code> in logs. The errors stream covers this properly.</p>`,
docs:[['MDN (extends)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/extends'],['MDN (super)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/super'],['MDN (instanceof)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof']],
ex:{title:'Inherit or compose?',diff:'easy',lang:'js',
run:{call:'decide',cases:[
 {name:'a genuine is-a with substitution holding',args:[true,true,false],expect:'inherit'},
 {name:'is-a claimed but substitution breaks',args:[true,false,false],expect:'compose'},
 {name:'only reusing some behavior',args:[false,true,false],expect:'compose'},
 {name:'is-a and substitutable but the hierarchy is already deep',args:[true,true,true],expect:'compose'},
 {name:'nothing in its favor',args:[false,false,false],expect:'compose'}]},
prompt:`Write <code>function decide(isA, substitutable, alreadyDeep)</code> returning <code>"inherit"</code> only when it is a genuine is-a relationship <b>and</b> substitution holds <b>and</b> the hierarchy is not already deep. Everything else returns <code>"compose"</code>.`,
starter:`function decide(isA, substitutable, alreadyDeep) {
  return null;
}`,
solution:`function decide(isA, substitutable, alreadyDeep) {
  if (isA && substitutable && !alreadyDeep) return "inherit";
  return "compose";                 // the safe default in every other case
}`,
tests:[{d:'requires a genuine is-a',re:'isA\\s*&&[^;]{0,120}?return\\s+"inherit"'},{d:'requires substitutability',re:'substitutable'},{d:'refuses to deepen an existing hierarchy',re:'!\\s*alreadyDeep'},{d:'composition is the default',re:'(?:return\\s+(?!!)[^;]{0,110}?"compose"|:\\s*"compose")'}],
behavior:`All five combinations execute, and the fourth is the one worth noticing: even a textbook is-a relationship should compose when the hierarchy is already deep, because the cost of another level outweighs the reuse. Composition being the default is the whole point: inheritance has to earn its place.`,
hints:['Three conditions must all hold for inheritance.','The third is negated: deep hierarchies argue against inheriting.','Every other path returns compose.']}},

{id:'js25',title:'Iterators, symbols and making your own objects work',body:`
<p>Why can you write <code>for (const x of myArray)</code> but not <code>for (const x of myObject)</code>?
Because iteration is a <b>protocol</b>, and arrays implement it. Once you know the protocol, you can make
anything work with <code>for...of</code>, spread and destructuring.</p>

<h4>Symbols, briefly</h4>
<p>A <b>symbol</b> is a unique value usable as a property key. Two symbols are never equal, even with the
same description, so a symbol key cannot collide with anything, which is why the language uses them for
its own hooks.</p>
<div class="codeSample" data-hl>Symbol("id") === Symbol("id")     // false - always unique

// well-known symbols are the language's extension points:
Symbol.iterator      // makes an object iterable
Symbol.asyncIterator // makes it work with for await...of
Symbol.toStringTag   // customizes Object.prototype.toString</div>

<h4>The iterable protocol</h4>
<p>An object is <b>iterable</b> if it has a <code>[Symbol.iterator]</code> method returning an
<b>iterator</b>: an object with a <code>next()</code> that returns
<code>{ value, done }</code>.</p>
<div class="codeSample" data-hl>const range = {
  from: 1, to: 3,
  [Symbol.iterator]() {
    let current = this.from, last = this.to;
    return {
      next() {
        return current &lt;= last
          ? { value: current++, done: false }
          : { value: undefined, done: true };
      }
    };
  }
};

[...range]                        // [1, 2, 3]  - spread uses the protocol
for (const n of range) { }        // so does for...of
const [a, b] = range;             // and so does destructuring</div>

<h4>Generators write iterators for you</h4>
<div class="codeSample" data-hl>function* range2(from, to) {      // function* = a generator
  for (let i = from; i &lt;= to; i++) yield i;    // yield PAUSES and resumes
}
[...range2(1, 3)]                 // [1, 2, 3] - far less machinery

// generators are LAZY: values are produced on demand, so an infinite
// sequence is fine as long as you stop consuming it.
function* naturals() { let n = 1; while (true) yield n++; }
const first = naturals().next().value;   // 1, and nothing else computed</div>
<p>Laziness is the real value: you can express "all the lines in this enormous file" or "every page of
this API" as a sequence without materializing it, which the Node streams lesson builds on directly.</p>

<h4>Making a plain object iterable</h4>
<p>Objects are not iterable by default. This is deliberate, since it is ambiguous whether you meant keys,
values or entries. Say which:</p>
<div class="codeSample" data-hl>for (const k of Object.keys(obj)) { }
for (const [k, v] of Object.entries(obj)) { }
// or add [Symbol.iterator] to your own class when there IS one obvious
// sequence, e.g. a Playlist iterating its tracks.</div>`,
docs:[['MDN (Iteration protocols)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols'],['MDN (Symbol)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol'],['MDN (Generators)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*']],
ex:{title:'Implement the iterable protocol',diff:'easy',lang:'js',
run:{call:'collect',cases:[
 {name:'an ascending range',args:[1,3],expect:[1,2,3]},
 {name:'a single value',args:[5,5],expect:[5]},
 {name:'an empty range',args:[3,1],expect:[]},
 {name:'includes negatives',args:[-2,0],expect:[-2,-1,0]},
 {name:'a longer range',args:[1,5],expect:[1,2,3,4,5]}]},
prompt:`Write <code>function makeRange(from, to)</code> returning an object that is <b>iterable</b> (it must implement <code>[Symbol.iterator]</code>), yielding every integer from <code>from</code> to <code>to</code> inclusive. Then write <code>function collect(from, to)</code> that spreads it into an array. When <code>from</code> exceeds <code>to</code>, the range is empty.`,
starter:`function makeRange(from, to) {
  return {};
}
function collect(from, to) {
  return [];
}`,
solution:`function makeRange(from, to) {
  return {
    *[Symbol.iterator]() {          // a generator method: shortest correct form
      for (let i = from; i <= to; i++) yield i;
    }
  };
}
function collect(from, to) {
  return [...makeRange(from, to)];  // spread consumes the protocol
}`,
tests:[{d:'implements the iterator symbol',re:'Symbol\\.iterator'},{d:'produces values',re:'yield|next'},{d:'spreads the iterable',re:'return\\s+(?!!)[^;]{0,80}?\\[\\s*\\.\\.\\.'}],
behavior:`Spread only works if the protocol is implemented correctly, so this executes the real thing rather than checking for a keyword. The empty case falls out for free: the loop never runs, the generator finishes immediately, and spread produces [].`,
hints:['A generator method inside the object literal is the shortest correct implementation.','The computed key is [Symbol.iterator], and a * before it makes it a generator.','Spreading an iterable consumes it into an array.']}}
,

{id:'jsgen',title:'Generators in practice, and async iteration',body:`
<p>The last lesson introduced generators as a shortcut for writing iterators. This one is about what they
are actually <i>for</i>, because a generator is not just less machinery, it is a function that can
<b>pause</b>, and a function that can pause turns out to solve several problems that nothing else in the
language solves as cleanly.</p>

<h4>A generator is a paused machine</h4>
<div class="codeSample" data-hl>function* steps() {
  console.log("one");   yield 1;
  console.log("two");   yield 2;
  console.log("done");
}
const g = steps();      // NOTHING runs yet - you hold a paused machine
g.next()                // logs "one",  returns { value: 1, done: false }
g.next()                // logs "two",  returns { value: 2, done: false }
g.next()                // logs "done", returns { value: undefined, done: true }</div>
<p>Each <code>next()</code> runs the body <i>to the next yield</i> and stops. All the local variables
survive between calls: the function's whole state is parked, not rebuilt. That is what
<code>for...of</code> and spread are driving when they consume one.</p>

<h4>Delegation, and stopping early</h4>
<div class="codeSample" data-hl>function* tree(node) {
  yield node.value;
  for (const child of node.children) yield* tree(child);   // yield* = hand over
}
// yield* delegates to another iterable - recursion over a tree
// becomes four lines, with no accumulator array in sight.

function* lines() {
  try { yield "a"; yield "b"; yield "c"; }
  finally { console.log("cleanup"); }        // runs even when abandoned
}
for (const l of lines()) {
  if (l === "b") break;    // break calls the generator's return() -
}                          // the finally runs. "cleanup" logs here.</div>
<p>That <code>finally</code> detail is why generators can safely hold resources: a consumer that stops
early (<code>break</code>, a thrown error, a <code>return</code>) still triggers the cleanup, the same
guarantee <code>try/finally</code> gives ordinary code.</p>

<h4>Async iteration: the same idea, awaited</h4>
<p>A sequence where each item takes time (pages of an API, chunks of a file) combines both machines
you now know: the iterator protocol and promises.</p>
<div class="codeSample" data-hl>async function* pages(url) {
  while (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const page = await res.json();
    yield* page.items;               // hand out this page's items
    url = page.nextUrl;              // then fetch the next page lazily
  }
}

for await (const item of pages("/api/items")) {
  if (looksRight(item)) break;       // stop - and NO further pages are fetched
}</div>
<p>The consumer reads like a plain loop, but each step awaits a promise, later pages are only requested
if the loop keeps going, and Node's streams implement exactly this protocol: <code>for await</code>
over a file stream is the reading pattern the Node streams lesson builds on.</p>

<h4>When to reach for one</h4>
<p>A plain array is still right for a handful of items you already have. Generators earn their place when
the sequence is <b>large, expensive, or endless</b> (lines of a file, pages of an API, retry delays,
walks over a tree), because laziness means you only pay for what the consumer actually takes.</p>`,
docs:[['MDN (function*)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*'],['MDN (for await...of)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of'],['MDN (yield*)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield*']],
ex:{title:'Chunk a list with a generator',diff:'medium',lang:'js',
run:{call:'chunks',cases:[
 {name:'splits into pairs with a remainder',args:[[1,2,3,4,5],2],expect:[[1,2],[3,4],[5]]},
 {name:'an exact fit has no remainder',args:[[1,2,3,4],2],expect:[[1,2],[3,4]]},
 {name:'a size beyond the list is one chunk',args:[[1,2,3],10],expect:[[1,2,3]]},
 {name:'size one wraps every element',args:[['a','b','c'],1],expect:[['a'],['b'],['c']]},
 {name:'an empty list yields nothing',args:[[],3],expect:[]}]},
prompt:`Write a <b>generator</b> <code>function* chunkGen(list, size)</code> that yields successive slices of <code>list</code>, each <code>size</code> long (the last may be shorter). Then write <code>function chunks(list, size)</code> that returns <code>[...chunkGen(list, size)]</code>. The generator is the machine; the spread is one possible consumer.`,
starter:`function* chunkGen(list, size) {
  // yield slices here
}
function chunks(list, size) {
  return [];
}`,
solution:`function* chunkGen(list, size) {
  for (let i = 0; i < list.length; i += size) {
    yield list.slice(i, i + size);       // pause here, hand out one chunk
  }
}
function chunks(list, size) {
  return [...chunkGen(list, size)];      // spread drives next() to done
}`,
tests:[{d:'declares a generator',re:'function\\s*\\*'},{d:'yields each chunk',re:'yield\\s'},{d:'slices without mutating',re:'\\.slice\\('},{d:'a consumer materializes it',re:'return\\s+(?!!)[^;]{0,80}?(?:\\[\\s*\\.\\.\\.|Array\\.from)'}],
behavior:`Five cases execute the whole protocol: the spread in chunks() calls next() until done, and each yield hands out one slice. The generator itself never builds the full result; the same chunkGen could feed a for...of that stops after the first chunk of a million-element list, and would compute exactly one slice.`,
hints:['Step the index by size, not by one.','slice(i, i + size) is safely clipped at the end of the list.','chunks() just spreads the generator - the exercise is the yield loop.']}}


]});
