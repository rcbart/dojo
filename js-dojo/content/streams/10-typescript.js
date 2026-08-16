STREAMS.push({icon:'🔷',title:'TypeScript: Types for JavaScript',blurb:'Catching mistakes before you run the code: what TypeScript is and is not, the type system from primitives to generics, structural typing, narrowing and why unknown beats any, typing an API boundary you can trust, and adding types to an existing JavaScript project.',lessons:[

{id:'js50',title:'What TypeScript is, and what it is not',body:`
<p><b>TypeScript is JavaScript plus type annotations, checked at compile time and then erased.</b> Every
part of that sentence matters, and the last part most of all.</p>

<div class="codeSample" data-hl>// what you write
function greet(name: string, times: number = 1): string {
  return (name + " ").repeat(times).trim();
}

// what actually runs, after compilation - the types are GONE
function greet(name, times = 1) {
  return (name + " ").repeat(times).trim();
}</div>

<h4>Erasure is the fact everything else follows from</h4>
<p>There are <b>no runtime type checks</b>. A value arriving from a network response, a JSON parse, a
database driver or a form is whatever it actually is, and TypeScript's opinion about it is a comment the
compiler believed.</p>
<div class="codeSample" data-hl>const user = await res.json() as User;   // a PROMISE, not a check
user.name.toUpperCase();                  // TypeError at runtime if the
                                          // server sent something else

// so: types protect you from YOUR OWN mistakes inside the program.
// at every boundary - HTTP, files, env, user input - you still need a
// real runtime check. schema libraries (zod, valibot) do both at once:
// they validate at runtime AND produce the type.</div>
<p>This is the single most important thing to understand about TypeScript, and the one that produces the
most disappointed teams. It is a very good tool for the errors you make while writing code, and it is not
a substitute for validating what comes in.</p>

<h4>What it buys you</h4>
<p><b>Errors at write time.</b> A misspelt property, a wrong argument order, a function that returns
<code>undefined</code> on one branch — found as you type rather than in production.</p>
<p><b>Refactoring you can trust.</b> Rename a field and the compiler lists every use. In plain JavaScript
that is a search-and-hope.</p>
<p><b>Documentation that cannot rot.</b> A signature states what a function needs and returns, and it is
checked, unlike a comment.</p>
<p><b>Autocomplete that is actually right</b> — the editor knows the shape rather than guessing from
usage.</p>

<h4>What it costs</h4>
<p>A build step, compile times on a large codebase, occasional fights with the type system over code that
is obviously fine, and a real learning curve past the basics. On a script you will run twice, that is not
worth it. On anything with more than one author or more than a few months of life, it usually is.</p>

<h4>Getting started</h4>
<div class="codeSample" data-hl>npm i -D typescript
npx tsc --init          # writes tsconfig.json

# the settings that matter more than any other:
{ "strict": true,                      // TURN THIS ON. see below.
  "target": "ES2022",
  "module": "NodeNext",
  "noUncheckedIndexedAccess": true }   // arr[0] is T | undefined - TRUE

# and note: tsc CHECKS. Node 22+ can strip types and run .ts directly,
# and esbuild/swc compile without checking at all - so type checking is
# a separate step from building, which surprises people.</div>
<p><b>Turn on <code>strict</code> from day one.</b> It is a bundle of flags, and the important one is
<code>strictNullChecks</code>: without it <code>null</code> and <code>undefined</code> are assignable to
everything and the type system cannot help with the single most common runtime error in JavaScript.
Adding it to an existing codebase later is genuinely painful.</p>`,
docs:[['TypeScript — handbook','https://www.typescriptlang.org/docs/handbook/intro.html'],['TypeScript — tsconfig reference','https://www.typescriptlang.org/tsconfig'],['TypeScript — strict mode','https://www.typescriptlang.org/tsconfig#strict']],
ex:{title:'Compile time or runtime?',diff:'easy',lang:'js',
run:{call:'caughtBy',cases:[
 {name:'a misspelt property name',args:['typo-in-property'],expect:'typescript'},
 {name:'arguments in the wrong order',args:['wrong-argument-order'],expect:'typescript'},
 {name:'a branch that forgets to return',args:['missing-return-branch'],expect:'typescript'},
 {name:'a server sending an unexpected shape',args:['bad-api-response'],expect:'runtime check'},
 {name:'a malformed environment variable',args:['bad-env-var'],expect:'runtime check'},
 {name:'user input that is not what it claims',args:['bad-user-input'],expect:'runtime check'},
 {name:'anything else',args:['zzz'],expect:'unknown'}]},
prompt:`Write <code>function caughtBy(problem)</code>: <code>"typo-in-property"</code>, <code>"wrong-argument-order"</code> and <code>"missing-return-branch"</code>&rarr;<code>"typescript"</code>; <code>"bad-api-response"</code>, <code>"bad-env-var"</code> and <code>"bad-user-input"</code>&rarr;<code>"runtime check"</code>; anything else&rarr;<code>"unknown"</code>.`,
starter:`function caughtBy(problem) {
  return null;
}`,
solution:`function caughtBy(problem) {
  switch (problem) {
    case "typo-in-property":
    case "wrong-argument-order":
    case "missing-return-branch":
      return "typescript";        // mistakes INSIDE your own program
    case "bad-api-response":
    case "bad-env-var":
    case "bad-user-input":
      return "runtime check";     // data crossing a boundary. types are erased.
    default:
      return "unknown";
  }
}`,
tests:[{d:'typos are a compile-time catch',re:'"typo-in-property"'},{d:'boundary data needs a runtime check',re:'"bad-api-response"'},{d:'names the two mechanisms',re:'"runtime check"'},{d:'has a default',re:'default'}],
behavior:`Seven cases execute, and the split is the whole lesson. Everything in the second group crosses a boundary — a network response, an environment variable, a form — where the types were erased before the program ran. Believing TypeScript covers those is the most common and most expensive misunderstanding about it.`,
hints:['Group by whether the data crosses a boundary into your program.','Types are erased at compile time, so they cannot check anything arriving at runtime.','Everything unrecognised returns unknown.']}},

{id:'js51',title:'The type system, from primitives to generics',body:`
<p>The syntax is small. The mental model — <b>structural</b> typing — is the part worth slowing down
for.</p>

<div class="codeSample" data-hl>let n: number = 42;
let s: string = "hi";
let ok: boolean = true;
let ids: number[] = [1, 2];              // or Array&lt;number&gt;
let pair: [string, number] = ["a", 1];   // a TUPLE: fixed length and order

type Status = "draft" | "live" | "archived";   // a UNION of literals -
let st: Status = "draft";                       // better than string, because
                                                // "drfat" is now an error

interface User {
  id: number;
  name: string;
  email?: string;              // optional: string | undefined
  readonly createdAt: Date;    // cannot be reassigned after construction
}

type Point = { x: number; y: number };   // type alias - same job, and it
                                          // can also alias unions</div>
<p><b><code>interface</code> or <code>type</code>?</b> Both describe object shapes. Interfaces can be
re-opened and merged (useful for extending library types); type aliases can express unions, tuples and
mapped types. Pick one for object shapes as a house style and use <code>type</code> when you need what
only it can do.</p>

<h4>Structural typing: shape, not name</h4>
<div class="codeSample" data-hl>interface Named { name: string; }
function greet(x: Named) { return "hi " + x.name; }

greet({ name: "Ada", extra: 1 });   // error on an object LITERAL only
const dog = { name: "Rex", legs: 4 };
greet(dog);                          // FINE - it has a name, that is enough

// nothing declares "implements Named". if the shape fits, it fits.
// this is what makes TypeScript feel natural over JavaScript, where
// nobody declares interfaces either.</div>

<h4>Inference does most of the work</h4>
<div class="codeSample" data-hl>const n = 42;              // inferred: 42  (a literal type, because const)
let m = 42;                // inferred: number
const names = ["a", "b"];  // string[]
const f = (x: number) =&gt; x * 2;   // return type INFERRED as number

// annotate PARAMETERS and PUBLIC return types; let everything else be
// inferred. over-annotating adds noise and gets out of date.</div>

<h4>Generics: a type you fill in later</h4>
<div class="codeSample" data-hl>function first&lt;T&gt;(items: T[]): T | undefined {
  return items[0];
}
first([1, 2]);        // T inferred as number -> number | undefined
first(["a"]);         // string | undefined

// CONSTRAINED, when you need to know something about T:
function longest&lt;T extends { length: number }&gt;(a: T, b: T): T {
  return a.length &gt;= b.length ? a : b;
}
longest("abc", "de");        // works: strings have length
longest([1,2], [3]);         // works: arrays do too
longest(1, 2);               // error: numbers do not</div>
<p>The rule for generics: reach for one when a function's <b>output type depends on its input type</b>.
Writing <code>T</code> everywhere because it looks professional produces signatures nobody can read.</p>

<h4>The utility types you will use weekly</h4>
<div class="codeSample" data-hl>Partial&lt;User&gt;              every field optional - patch payloads
Required&lt;User&gt;             every field required
Pick&lt;User, "id"|"name"&gt;    a subset
Omit&lt;User, "password"&gt;     everything except - API responses
Readonly&lt;User&gt;             nothing reassignable
Record&lt;string, number&gt;     an object used as a dictionary
ReturnType&lt;typeof fn&gt;      whatever that function returns</div>`,
docs:[['TypeScript — everyday types','https://www.typescriptlang.org/docs/handbook/2/everyday-types.html'],['TypeScript — generics','https://www.typescriptlang.org/docs/handbook/2/generics.html'],['TypeScript — utility types','https://www.typescriptlang.org/docs/handbook/utility-types.html']],
exs:[
{title:'Pick the right type construct',diff:'medium',lang:'js',
run:{call:'typeFor',cases:[
 {name:'a fixed set of allowed strings',args:['fixed-string-set'],expect:'union of literals'},
 {name:'an object with known fields',args:['object-shape'],expect:'interface'},
 {name:'output type follows input type',args:['output-depends-on-input'],expect:'generic'},
 {name:'a patch payload where every field is optional',args:['patch-payload'],expect:'Partial'},
 {name:'an API response hiding one field',args:['hide-a-field'],expect:'Omit'},
 {name:'a dictionary keyed by string',args:['dictionary'],expect:'Record'},
 {name:'a fixed-length ordered pair',args:['fixed-pair'],expect:'tuple'},
 {name:'anything else',args:['zzz'],expect:'let it be inferred'}]},
prompt:`Write <code>function typeFor(need)</code>: <code>"fixed-string-set"</code>&rarr;<code>"union of literals"</code>; <code>"object-shape"</code>&rarr;<code>"interface"</code>; <code>"output-depends-on-input"</code>&rarr;<code>"generic"</code>; <code>"patch-payload"</code>&rarr;<code>"Partial"</code>; <code>"hide-a-field"</code>&rarr;<code>"Omit"</code>; <code>"dictionary"</code>&rarr;<code>"Record"</code>; <code>"fixed-pair"</code>&rarr;<code>"tuple"</code>; anything else&rarr;<code>"let it be inferred"</code>.`,
starter:`function typeFor(need) {
  return null;
}`,
solution:`function typeFor(need) {
  switch (need) {
    case "fixed-string-set":         return "union of literals";
    case "object-shape":             return "interface";
    case "output-depends-on-input":  return "generic";
    case "patch-payload":            return "Partial";
    case "hide-a-field":             return "Omit";
    case "dictionary":               return "Record";
    case "fixed-pair":               return "tuple";
    default:                         return "let it be inferred";
  }
}`,
tests:[{d:'a fixed set is a union',re:'union of literals'},{d:'a generic when output follows input',re:'"generic"'},{d:'Omit hides a field',re:'"Omit"'},{d:'the default prefers inference',re:'let it be inferred'}],
behavior:`Eight cases execute. The default is deliberate advice rather than a fallback: most values should be inferred, and over-annotating is the commonest way a TypeScript codebase becomes noisy. The union-of-literals answer is the highest-value one in daily use — it turns a misspelt status from a silent bug into a compile error.`,
hints:['One case per construct, with a default that recommends inference.','A union of string literals is what replaces a loosely-typed status string.','Partial makes everything optional; Omit removes a named field.']},
{title:'Does this argument satisfy the constraint?',diff:'hard',lang:'js',
run:{call:'satisfies',cases:[
 {name:'exactly the required shape',args:[['name','age'],['name','age']],expect:{ok:true,missing:[]}},
 {name:'extra properties are allowed: structural typing',args:[['name'],['name','age','email']],expect:{ok:true,missing:[]}},
 {name:'a missing property is reported',args:[['name','age'],['name']],expect:{ok:false,missing:['age']}},
 {name:'several missing, in the order required',args:[['id','name','age'],['name']],expect:{ok:false,missing:['id','age']}},
 {name:'nothing required is always satisfied',args:[[],['anything']],expect:{ok:true,missing:[]}},
 {name:'an empty argument satisfies nothing',args:[['name'],[]],expect:{ok:false,missing:['name']}},
 {name:'order does not matter, only presence',args:[['a','b'],['b','a']],expect:{ok:true,missing:[]}}]},
prompt:`Write <code>function satisfies(requiredProps, actualProps)</code> modelling structural typing. Return <code>{ ok, missing }</code>. Every property in <code>requiredProps</code> must be present in <code>actualProps</code> — but <b>extra</b> properties are fine, and order is irrelevant. <code>missing</code> lists the absent ones in the order they were required.`,
starter:`function satisfies(requiredProps, actualProps) {
  return { ok: true, missing: [] };
}`,
solution:`function satisfies(requiredProps, actualProps) {
  const missing = requiredProps.filter(p => !actualProps.includes(p));
  return { ok: missing.length === 0, missing };   // extras are IGNORED
}`,
tests:[{d:'compares required against actual',re:'requiredProps'},{d:'ignores extra properties',re:'actualProps\\.includes|includes\\('},{d:'reports whether anything is missing',re:'length\\s*===\\s*0|length\\s*>\\s*0'}],
behavior:`Seven cases execute and three of them define structural typing precisely. Extra properties must pass — that is the whole difference from nominal typing, and it is why a plain object can be handed to a function expecting an interface it never declared. Order must not matter. And an empty requirement is satisfied by anything, including nothing, which is why the check has to run over the required list rather than the actual one.`,
hints:['Filter the REQUIRED list for anything the actual list lacks — not the other way round.','Extras never fail; only absences do.','An empty required list produces an empty missing list for free.']}]},

{id:'js52',title:'Narrowing, unknown, and typing a boundary you can trust',body:`
<p>Where TypeScript earns its keep is in forcing you to handle the case you would otherwise forget: the
value that might be missing, or might be one of several shapes.</p>

<h4><code>strictNullChecks</code>, and why it is the flag that matters</h4>
<div class="codeSample" data-hl>function find(id: number): User | undefined { ... }

const u = find(1);
u.name;              // ERROR: 'u' is possibly 'undefined'
                     // the compiler just prevented the single most common
                     // runtime error in all of JavaScript.

if (u) u.name;       // fine inside the guard - the type NARROWED to User
u?.name;             // fine
const name = u?.name ?? "unknown";</div>

<h4>Narrowing: how the compiler follows your checks</h4>
<div class="codeSample" data-hl>function format(x: string | number | Date | null) {
  if (x === null) return "none";              // narrowed OUT
  if (typeof x === "string") return x.trim(); // narrowed to string
  if (typeof x === "number") return x.toFixed(2);
  return x.toISOString();                      // must be Date - EXHAUSTED
}
// typeof, instanceof, ===, "in", Array.isArray and truthiness all narrow.

// and the exhaustiveness trick worth knowing, which turns a forgotten
// case into a COMPILE error when someone adds a new variant:
function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.r ** 2;
    case "square": return s.side ** 2;
    default: {
      const _never: never = s;   // errors if any case is unhandled
      throw new Error("unhandled: " + JSON.stringify(s));
    }
  }
}</div>

<h4><code>any</code> versus <code>unknown</code></h4>
<div class="codeSample" data-hl>const a: any = JSON.parse(text);
a.foo.bar.baz();          // compiles. explodes at runtime. \`any\` DISABLES
                          // checking for everything it touches, and it
                          // spreads through the codebase silently.

const u: unknown = JSON.parse(text);
u.foo;                    // ERROR - you must prove what it is first
if (typeof u === "object" && u !== null && "foo" in u) { ... }

// unknown is any with the safety kept on. use it at every boundary, and
// treat any as a deliberate, commented escape hatch - never a default.</div>

<h4>Typing a boundary you can trust</h4>
<p>This is where the erasure lesson comes back. <code>as User</code> is an <b>assertion</b>: you are
telling the compiler to stop checking, and if you are wrong it will not find out.</p>
<div class="codeSample" data-hl>// the assertion - a lie the compiler believes:
const user = await res.json() as User;

// the alternative - a runtime check that PRODUCES the type:
import { z } from "zod";
const User = z.object({ id: z.number(), name: z.string() });
type User = z.infer&lt;typeof User&gt;;          // the type comes FROM the schema
const user = User.parse(await res.json()); // throws if the shape is wrong

// one declaration, validated at runtime AND typed at compile time, with
// no chance of the two drifting apart.</div>
<p>The same applies to environment variables, form input, files, message queues and database rows.
Anywhere data enters, validate; everywhere else, let the types work.</p>

<h4>Adding types to existing JavaScript</h4>
<p>Do it incrementally. Turn on <code>allowJs</code> and <code>checkJs</code> so JSDoc comments are
type-checked without renaming a single file. Then convert file by file, leaves first, with
<code>strict</code> on for new files. Do not attempt a whole-codebase rewrite in one branch — it will not
merge, and the types you write while fighting a rebase are not the types you want.</p>`,
docs:[['TypeScript — narrowing','https://www.typescriptlang.org/docs/handbook/2/narrowing.html'],['TypeScript — migrating from JavaScript','https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html'],['Zod','https://zod.dev/']],
exs:[
{title:'What narrows this type?',diff:'medium',lang:'js',
run:{call:'narrowWith',cases:[
 {name:'a string or number',args:['string|number'],expect:'typeof'},
 {name:'a Date or a string',args:['Date|string'],expect:'instanceof'},
 {name:'an array or a single value',args:['array|single'],expect:'Array.isArray'},
 {name:'a discriminated union',args:['tagged-union'],expect:'switch on the tag'},
 {name:'possibly null',args:['maybe-null'],expect:'truthiness or === null'},
 {name:'two object shapes with different keys',args:['two-object-shapes'],expect:'the in operator'},
 {name:'anything else',args:['zzz'],expect:'a type predicate function'}]},
prompt:`Write <code>function narrowWith(situation)</code>: <code>"string|number"</code>&rarr;<code>"typeof"</code>; <code>"Date|string"</code>&rarr;<code>"instanceof"</code>; <code>"array|single"</code>&rarr;<code>"Array.isArray"</code>; <code>"tagged-union"</code>&rarr;<code>"switch on the tag"</code>; <code>"maybe-null"</code>&rarr;<code>"truthiness or === null"</code>; <code>"two-object-shapes"</code>&rarr;<code>"the in operator"</code>; anything else&rarr;<code>"a type predicate function"</code>.`,
starter:`function narrowWith(situation) {
  return null;
}`,
solution:`function narrowWith(situation) {
  switch (situation) {
    case "string|number":     return "typeof";
    case "Date|string":       return "instanceof";     // typeof Date is "object"
    case "array|single":      return "Array.isArray";  // typeof [] is "object"
    case "tagged-union":      return "switch on the tag";
    case "maybe-null":        return "truthiness or === null";
    case "two-object-shapes": return "the in operator";
    default:                  return "a type predicate function";
  }
}`,
tests:[{d:'typeof for primitives',re:'"typeof"'},{d:'instanceof for classes',re:'"instanceof"'},{d:'Array.isArray for arrays',re:'Array\\.isArray'},{d:'a tag for discriminated unions',re:'switch on the tag'}],
behavior:`Seven cases execute. The second and third exist because typeof is useless for both — a Date and an array both report "object", which is the same limitation the JavaScript types lesson covered. The default names the escape hatch: when nothing built in narrows your case, a type predicate (arg is T) lets you write the check once and have the compiler trust it everywhere.`,
hints:['typeof only distinguishes primitives; objects need something else.','A discriminated union is narrowed by switching on its tag field.','The default is the custom option — a function returning "arg is T".']},
{title:'Validate at the boundary, then trust the types',diff:'hard',lang:'js',
run:{call:'parseUser',cases:[
 {name:'a valid payload',args:[{id:1,name:'Ada'}],expect:{ok:true,value:{id:1,name:'Ada'},errors:[]}},
 {name:'an optional field is kept when valid',args:[{id:1,name:'Ada',email:'a@b.c'}],expect:{ok:true,value:{id:1,name:'Ada',email:'a@b.c'},errors:[]}},
 {name:'a numeric string id is refused',args:[{id:'1',name:'Ada'}],expect:{ok:false,value:null,errors:['id must be a number']}},
 {name:'a missing name is refused',args:[{id:1}],expect:{ok:false,value:null,errors:['name must be a string']}},
 {name:'null is not an object',args:[null],expect:{ok:false,value:null,errors:['body must be an object']}},
 {name:'an array is not an object either',args:[[1,2]],expect:{ok:false,value:null,errors:['body must be an object']}},
 {name:'an invalid optional field is refused, not dropped',args:[{id:1,name:'Ada',email:42}],expect:{ok:false,value:null,errors:['email must be a string']}},
 {name:'every problem is reported at once',args:[{id:'x'}],expect:{ok:false,value:null,errors:['id must be a number','name must be a string']}}]},
prompt:`Write <code>function parseUser(body)</code> — the runtime half of a typed boundary. Return <code>{ ok, value, errors }</code>. If <code>body</code> is not a plain object (<code>null</code> and arrays are not) the only error is <code>"body must be an object"</code>. Otherwise: <code>id</code> must be a number (&rarr; <code>"id must be a number"</code>), <code>name</code> must be a string (&rarr; <code>"name must be a string"</code>), and <code>email</code>, <b>if present</b>, must be a string (&rarr; <code>"email must be a string"</code>). Report every problem in that order. On success, <code>value</code> contains only the fields that were present.`,
starter:`function parseUser(body) {
  return { ok: true, value: null, errors: [] };
}`,
solution:`function parseUser(body) {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, value: null, errors: ["body must be an object"] };
  }

  const errors = [];
  if (typeof body.id !== "number") errors.push("id must be a number");
  if (typeof body.name !== "string") errors.push("name must be a string");
  if (body.email !== undefined && typeof body.email !== "string") {
    errors.push("email must be a string");      // present but wrong: an error
  }

  if (errors.length > 0) return { ok: false, value: null, errors };

  const value = { id: body.id, name: body.name };
  if (body.email !== undefined) value.email = body.email;   // only if present
  return { ok: true, value, errors: [] };
}`,
tests:[{d:'rejects a non-object body',re:'body must be an object'},{d:'excludes null and arrays',re:'Array\\.isArray'},{d:'requires a real number for id',re:'typeof\\s+body\\.id\\s*!==\\s*"number"'},{d:'only validates email when present',re:'!==\\s*undefined'},{d:'collects every error',re:'errors\\.push'}],
behavior:`Eight cases execute and four of them break a plausible implementation. typeof null is "object" and typeof [] is "object", so both need explicit exclusion — the same 1995 bug from the types lesson, now with security consequences. The string "1" must fail: this is exactly the assertion "as User" would have waved through. An invalid optional field must be an ERROR rather than silently dropped, or a client sending email: 42 gets a success response and no email. And the final case requires collecting every problem so the caller fixes their request once.`,
hints:['Reject non-objects first, and remember typeof null and typeof [] are both "object".','An optional field is validated only when it is not undefined — but if it IS present and wrong, that is an error.','Build the output object from the fields that were actually present, not from a fixed shape.']}]}

]});
