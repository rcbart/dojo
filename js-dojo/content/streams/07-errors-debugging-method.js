STREAMS.push({icon:'🐞',title:'Errors, Exceptions & the Debugging Method',blurb:'What errors are and how to use them: the Error object and its built-in types, throw and try/catch/finally, custom error classes, reading a stack trace properly, why async errors need care, and the method for finding a bug rather than guessing at it.',lessons:[

{id:'js26',title:'Errors are objects',body:`
<p>An error in JavaScript is an ordinary object with three useful properties. Knowing that is what lets
you produce errors worth reading rather than <code>throw "something broke"</code>.</p>

<div class="codeSample" data-hl>const e = new Error("could not load user 42");
e.name       // "Error"
e.message    // "could not load user 42"
e.stack      // "Error: could not load user 42\\n    at load (app.js:12:9)\\n..."
e.cause      // whatever you passed as { cause } - see below

// the built-in types, and what each one actually tells you:
TypeError       wrong type, or a property on undefined/null. THE common one.
ReferenceError  a name that does not exist (or a temporal dead zone)
SyntaxError     unparseable - including JSON.parse on bad input
RangeError      a value out of range, and "maximum call stack size exceeded"
URIError        bad encodeURI / decodeURI input
AggregateError  several at once - from Promise.any</div>
<p>Reading the <i>type</i> first is a habit worth forming. <code>TypeError: cannot read properties of
undefined</code> means something you assumed existed did not; <code>ReferenceError</code> means a name is
misspelt or not yet initialised. They point at different mistakes.</p>

<h4>Always throw an <code>Error</code></h4>
<div class="codeSample" data-hl>throw "not found";              // legal, and it costs you the stack trace,
                                // the name, and any instanceof check
throw new Error("not found");   // do this, always

// and preserve the original when you re-throw:
try { await load(); }
catch (e) { throw new Error("loading the dashboard failed", { cause: e }); }
// e.cause keeps the original error AND its stack. throwing a fresh error
// without cause destroys the only evidence of what actually happened.</div>

<h4>Messages that help</h4>
<p>A good message names <b>what was being attempted</b>, <b>with what</b>, and <b>what went wrong</b>.
"Invalid input" tells the next reader nothing. "Expected port to be a number between 1 and 65535, got
'abc'" tells them everything, including the value, and the value is the part people leave out.</p>
<p>The exception: never put secrets, tokens or personal data in a message. Errors end up in logs,
in monitoring systems, and sometimes in front of users.</p>

<h4>Custom error classes</h4>
<div class="codeSample" data-hl>class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";   // REQUIRED - it is "Error" otherwise
    this.field = field;              // structured data beats parsing text
  }
}

try { validate(input); }
catch (e) {
  if (e instanceof ValidationError) return badRequest(e.field);
  throw e;                           // not mine - let it go up
}</div>
<p>Custom types let callers branch on <b>what kind</b> of failure occurred without matching on message
strings, which break the moment someone improves the wording. Set <code>name</code> explicitly:
it is inherited, so without that line your subclass reports itself as <code>"Error"</code> in every log.</p>`,
docs:[['MDN — Error','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error'],['MDN — Error.cause','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause'],['MDN — Error types','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors']],
ex:{title:'Diagnose from the error type',diff:'easy',lang:'js',
run:{call:'diagnose',cases:[
 {name:'a TypeError points at a wrong assumption',args:['TypeError'],expect:'something you assumed existed did not'},
 {name:'a ReferenceError points at a name',args:['ReferenceError'],expect:'a name is misspelt or not yet initialised'},
 {name:'a SyntaxError points at unparseable input',args:['SyntaxError'],expect:'the text could not be parsed'},
 {name:'a RangeError usually means runaway recursion',args:['RangeError'],expect:'a value is out of range, or recursion ran away'},
 {name:'anything else needs reading',args:['CustomError'],expect:'read the message and the stack'}]},
prompt:`Write <code>function diagnose(errorName)</code> mapping a built-in error name to what it tells you: <code>"TypeError"</code>&rarr;<code>"something you assumed existed did not"</code>; <code>"ReferenceError"</code>&rarr;<code>"a name is misspelt or not yet initialised"</code>; <code>"SyntaxError"</code>&rarr;<code>"the text could not be parsed"</code>; <code>"RangeError"</code>&rarr;<code>"a value is out of range, or recursion ran away"</code>; anything else&rarr;<code>"read the message and the stack"</code>.`,
starter:`function diagnose(errorName) {
  return null;
}`,
solution:`function diagnose(errorName) {
  switch (errorName) {
    case "TypeError":      return "something you assumed existed did not";
    case "ReferenceError": return "a name is misspelt or not yet initialised";
    case "SyntaxError":    return "the text could not be parsed";
    case "RangeError":     return "a value is out of range, or recursion ran away";
    default:               return "read the message and the stack";
  }
}`,
tests:[{d:'handles TypeError',re:'"TypeError"'},{d:'handles ReferenceError',re:'"ReferenceError"'},{d:'handles SyntaxError',re:'"SyntaxError"'},{d:'has a default for custom errors',re:'default'}],
behavior:`The default case matters more than it looks: a custom error class is the common case in real applications, and the type alone tells you nothing, which is exactly why setting a meaningful name and attaching structured fields is worth the four lines.`,
hints:['A switch with one case per built-in type.','The default covers custom error classes.','TypeError is the one you will see most often.']}},

{id:'js27',title:'throw, try, catch, finally',body:`
<p>Throwing unwinds the stack until something catches it. Nothing between the throw and the catch
continues, which is the point, and also the hazard.</p>

<div class="codeSample" data-hl>try {
  risky();
} catch (e) {                 // the binding is optional: catch { } is legal
  handle(e);
} finally {
  cleanup();                  // runs on BOTH paths, and on an early return
}</div>

<h4>What <code>finally</code> guarantees, and its one trap</h4>
<p><code>finally</code> runs whether the block succeeded, threw, or returned. That makes it the right
place for releasing a lock, closing a handle or clearing a flag. The trap is that a
<code>return</code> inside <code>finally</code> <b>overrides</b> everything, including an in-flight
exception, which it silently discards:</p>
<div class="codeSample" data-hl>function bad() {
  try { throw new Error("boom"); }
  finally { return "fine"; }      // the error VANISHES. returns "fine".
}
// never return from finally. use it for cleanup only.</div>

<h4>Catch what you can act on</h4>
<div class="codeSample" data-hl>// the anti-pattern: catching everything and continuing anyway
try { save(); } catch (e) { }             // the failure is now invisible
try { save(); } catch (e) { console.log(e); }   // barely better

// better: catch the specific case you can handle, re-throw the rest
try {
  return JSON.parse(text);
} catch (e) {
  if (e instanceof SyntaxError) return null;   // I know what this means
  throw e;                                      // I do not. not mine.
}</div>
<p>A catch block that neither recovers, nor adds context, nor re-throws has <b>removed information</b> from
the program. If you cannot say what the handler does about the failure, do not write it; let the error
travel to somewhere that can.</p>

<h4>Where the boundaries go</h4>
<p>Catch at <b>boundaries</b>, not everywhere. A request handler, a job runner, a UI event handler, a CLI
entry point: these are places where a failure has a defined response: return a 500, retry the job, show
a message, exit non-zero. Deep utility functions should generally throw and say why.</p>

<h4>Errors are for exceptional cases</h4>
<div class="codeSample" data-hl>// "not found" is usually NOT exceptional - it is an expected outcome
function find(id) { throw new NotFound(id); }      // forces try/catch on callers
function find2(id) { return row ?? null; }         // often better

// throwing is right when continuing would be WRONG:
//   invalid arguments, a broken invariant, an unusable configuration
// returning null/Result is right when absence is a normal answer.</div>
<p>The cost of throwing is that it is invisible in the signature: nothing tells a caller a function can
throw, and JavaScript has no checked exceptions. So document it, or return a value the type system (or
the reader) can see.</p>`,
docs:[['MDN — try...catch','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch'],['MDN — throw','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw']],
exs:[
{title:'Catch only what you understand',diff:'easy',lang:'js',
run:{call:'parseOrRethrow',cases:[
 {name:'valid JSON parses',args:['{"a":1}','SyntaxError'],expect:'{"a":1}'},
 {name:'a syntax error becomes null',args:['bad','SyntaxError'],expect:null},
 {name:'a different error is re-thrown',args:['bad','TypeError'],expect:'rethrown'},
 {name:'a range error is re-thrown too',args:['bad','RangeError'],expect:'rethrown'}]},
prompt:`Write <code>function parseOrRethrow(text, errorName)</code> modelling selective catching. If <code>text</code> is <code>"bad"</code> a failure occurred of type <code>errorName</code>: return <code>null</code> when it is a <code>"SyntaxError"</code>, and the string <code>"rethrown"</code> for any other type. When <code>text</code> is not <code>"bad"</code>, return it unchanged.`,
starter:`function parseOrRethrow(text, errorName) {
  return null;
}`,
solution:`function parseOrRethrow(text, errorName) {
  if (text !== "bad") return text;                  // the success path
  if (errorName === "SyntaxError") return null;     // I know what this means
  return "rethrown";                                 // I do not - pass it on
}`,
tests:[{d:'handles the success path',re:'text\\s*!==\\s*"bad"'},{d:'recognises the error it can handle',re:'"SyntaxError"'},{d:'passes everything else on',re:'"rethrown"'}],
behavior:`Two different unexpected error types execute the same re-throw path. That is the discipline this models: swallowing every error would turn a TypeError in your own parsing code into a silent null, and you would spend an afternoon looking for data that was never malformed.`,
hints:['Handle the success case first and return early.','Only the specific error type you understand becomes null.','Everything else is passed on rather than swallowed.']},
{title:'Cleanup that always runs',diff:'medium',lang:'js',
run:{call:'withCleanup',cases:[
 {name:'success still runs cleanup',args:[false],expect:'ok|cleaned'},
 {name:'failure runs cleanup and reports the error',args:[true],expect:'failed|cleaned'},
 {name:'cleanup runs on every call, not only the first',args:[false],expect:'ok|cleaned'},
 {name:'and again on the failure path',args:[true],expect:'failed|cleaned'}]},
prompt:`Write <code>function withCleanup(shouldFail)</code> that uses <code>try</code>/<code>catch</code>/<code>finally</code>. Build a string: on success append <code>"ok"</code>, on failure append <code>"failed"</code>, and in <code>finally</code> always append <code>"|cleaned"</code>. Return the result. Throw a real <code>Error</code> to trigger the failure path, and do <b>not</b> return from <code>finally</code>.`,
starter:`function withCleanup(shouldFail) {
  return "";
}`,
solution:`function withCleanup(shouldFail) {
  let out = "";
  try {
    if (shouldFail) throw new Error("boom");
    out += "ok";
  } catch {
    out += "failed";
  } finally {
    out += "|cleaned";      // runs on both paths, and exits nothing
  }
  return out;               // the return lives OUTSIDE finally
}`,
tests:[{d:'uses try',re:'try\\s*\\{'},{d:'catches the failure',re:'catch'},{d:'cleans up in finally',re:'finally'},{d:'does not return from finally',re:'finally\\s*\\{[^}]*return',not:true}],
behavior:`Both paths execute twice, and every call must end in "|cleaned"; accumulating into a variable declared OUTSIDE the function would pass the first call and fail the third. The regex check for a return inside finally is deliberate: returning there would discard the exception entirely and make the failure invisible, which is the trap this lesson exists to prevent.`,
hints:['Accumulate into a variable declared before the try.','finally runs on both paths, so put the cleanup there.','Return after the whole try/catch/finally, never inside finally.']}]},

{id:'js28',title:'Async errors, and why they escape',body:`
<p>Every rule so far assumed the error happens on the current stack. Asynchronous errors do not, and the
consequences catch out everyone at least once.</p>

<h4>The rule</h4>
<div class="codeSample" data-hl>try {
  setTimeout(() =&gt; { throw new Error("boom"); }, 0);
} catch (e) {
  // NEVER RUNS. the callback executes later, on a fresh empty stack.
  // this try block exited long before.
}

// same for any callback-based API:
try { fs.readFile(p, cb); } catch { }    // catches only SYNCHRONOUS throws
                                          // from readFile itself</div>
<p><b>A <code>try</code>/<code>catch</code> only covers the stack it is on.</b> Errors thrown later are
uncaught exceptions: they crash Node, or land in <code>window.onerror</code>.</p>

<h4>Promises give errors a path back</h4>
<div class="codeSample" data-hl>doWork()
  .then(step2)
  .then(step3)
  .catch(handle);       // catches a rejection from ANY step above

// and await restores try/catch, because the error is delivered back
// into your function's own stack:
try {
  const a = await doWork();
  const b = await step2(a);
} catch (e) {
  handle(e);            // works. this is the main reason to prefer await.
}</div>

<h4>The four ways an async error still escapes</h4>
<div class="codeSample" data-hl>// 1. NOT AWAITING - the rejection has nowhere to go
async function f() { doWork(); }        // no await, no .catch
                                        // -> unhandled rejection

// 2. forEach with an async callback - the promises are DISCARDED
ids.forEach(async id =&gt; { await save(id); });   // errors vanish silently
for (const id of ids) await save(id);           // fixed

// 3. throwing inside a .then WITHOUT a later .catch
p.then(() =&gt; { throw new Error("x"); });        // unhandled

// 4. Promise.all - one rejection wins and the OTHERS keep running.
//    their failures become unhandled rejections of their own.
await Promise.allSettled(tasks);                // when partials are fine</div>
<p>Since Node 15, an <b>unhandled rejection terminates the process</b>. That is the correct default (a
program in an unknown state should stop), but it means a forgotten <code>await</code> is now a crash
rather than a warning.</p>

<h4>The last line of defence</h4>
<div class="codeSample" data-hl>// Node
process.on("unhandledRejection", (reason) =&gt; { log(reason); process.exit(1); });
process.on("uncaughtException",  (err) =&gt; { log(err); process.exit(1); });

// browser
window.addEventListener("unhandledrejection", e =&gt; report(e.reason));
window.addEventListener("error", e =&gt; report(e.error));</div>
<p>These are for <b>logging then exiting</b>, not for carrying on. After an uncaught exception the
program's state is unknown; continuing risks corrupting data in ways far worse than a restart.</p>

<h4>Async stack traces</h4>
<p>Modern V8 stitches asynchronous frames together, so an <code>await</code> chain gives you a trace that
crosses the boundary. Callback-based code does not, which is one more practical reason to convert old
APIs to promises rather than living with them.</p>`,
docs:[['MDN — Using promises: error handling','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises#error_handling'],['Node — unhandledRejection','https://nodejs.org/api/process.html#event-unhandledrejection'],['V8 — async stack traces','https://v8.dev/blog/fast-async']],
ex:{title:'Will this error be caught?',diff:'easy',lang:'js',
run:{call:'caught',cases:[
 {name:'a synchronous throw inside try',args:['sync-throw'],expect:true},
 {name:'a throw inside setTimeout',args:['timeout-throw'],expect:false},
 {name:'an awaited rejection inside try',args:['await-reject'],expect:true},
 {name:'a promise with no await and no catch',args:['unawaited-reject'],expect:false},
 {name:'an async callback passed to forEach',args:['foreach-async'],expect:false},
 {name:'a chain ending in .catch',args:['then-catch'],expect:true},
 {name:'anything unrecognised is assumed uncaught',args:['zzz'],expect:false}]},
prompt:`Write <code>function caught(scenario)</code> returning <code>true</code> when the error reaches a handler and <code>false</code> when it escapes. Caught: <code>"sync-throw"</code>, <code>"await-reject"</code>, <code>"then-catch"</code>. Escapes: <code>"timeout-throw"</code>, <code>"unawaited-reject"</code>, <code>"foreach-async"</code>, and anything unrecognised.`,
starter:`function caught(scenario) {
  return false;
}`,
solution:`function caught(scenario) {
  switch (scenario) {
    case "sync-throw":     // same stack as the try block
    case "await-reject":   // await delivers the rejection back to this stack
    case "then-catch":     // an explicit handler on the chain
      return true;
    default:
      return false;        // everything else escapes - fail closed
  }
}`,
tests:[{d:'a synchronous throw is caught',re:'"sync-throw"'},{d:'an awaited rejection is caught',re:'"await-reject"'},{d:'a handled chain is caught',re:'"then-catch"'},{d:'everything else escapes',re:'default'}],
behavior:`Seven scenarios execute. The three that escape are the three that appear in real code most often (a throw inside a timer, a promise nobody awaited, and an async callback handed to forEach), and since Node 15 the last two terminate the process rather than warning.`,
hints:['Only three scenarios are caught; list them and default the rest.','await is what brings a rejection back onto your own stack.','forEach discards the promises its callback returns.']}},

{id:'js29',title:'Reading a stack trace, and the debugging method',body:`
<p>Debugging is a skill with a procedure, and most people never learn the procedure: they read the code
and guess. Guessing works on small bugs and fails completely on the ones that matter.</p>

<h4>Reading the trace</h4>
<div class="codeSample" data-hl>TypeError: Cannot read properties of undefined (reading 'city')
    at formatAddress (profile.js:42:31)      &lt;- WHERE IT BROKE
    at renderUser (profile.js:18:12)         &lt;- who called that
    at loadProfile (app.js:203:5)            &lt;- who called that
    at async main (app.js:11:3)              &lt;- and so on outward

// read TOP-DOWN. line 1 is the error type and message; the first
// "at" line is the failing frame; each line below is its caller.
// the first line IN YOUR CODE is usually where to look, even when
// the top frames are inside a library.</div>
<p>Read the message precisely. <i>Cannot read properties of undefined (reading 'city')</i> does not mean
<code>city</code> is undefined; it means <b>the thing you read <code>city</code> from</b> was undefined.
That distinction points at a different line, and misreading it is the single most common wasted hour in
JavaScript.</p>

<h4>The method</h4>
<p><b>1. Reproduce it.</b> A bug you cannot trigger on demand cannot be verified as fixed. Get to a
reliable reproduction before changing anything; this is the step people skip and the one that decides
how long the rest takes.</p>
<p><b>2. Read the error properly.</b> Type, message, first frame in your code. Do not skim it.</p>
<p><b>3. Form one hypothesis.</b> A specific, falsifiable statement: "<code>user.address</code> is
undefined because the API omits it for new accounts." Not "something is wrong with the user data".</p>
<p><b>4. Test that hypothesis.</b> A breakpoint or one log line that will come out differently depending
on whether you are right. If it neither confirms nor refutes, you designed the test badly.</p>
<p><b>5. Bisect when you have no hypothesis.</b> Halve the problem space and repeat: comment out half the
input, half the pipeline, half the recent commits. <code>git bisect</code> does this over history and
finds the breaking commit among a thousand in about ten steps.</p>
<p><b>6. Fix the cause, then verify.</b> Re-run the reproduction. A "fix" you did not verify against the
original reproduction is a guess with extra confidence.</p>

<h4>Things that waste time</h4>
<p><b>Changing several things at once.</b> If it starts working you do not know why, and you have
probably introduced something new.</p>
<p><b>Trusting your assumptions over the evidence.</b> When the evidence says something impossible is
happening, one of your assumptions is wrong. Print the thing you are certain about; that is where the
bug lives more often than not.</p>
<p><b>Debugging the wrong layer.</b> Confirm the data arriving is what you think before debugging the
code that processes it. Check the Network panel before rewriting the parser.</p>
<p><b>Not reading the whole message.</b> Stack traces are long and the answer is frequently in the part
people scroll past.</p>

<h4>Better than <code>console.log</code></h4>
<div class="codeSample" data-hl>console.table(rows)              // arrays of objects as a real table
console.dir(obj, {depth:null})   // full nesting instead of [Object]
console.group() / groupEnd()     // collapsible sections in a loop
console.time("x") / timeEnd("x") // elapsed time between two points
console.trace()                  // how did execution GET here?
console.assert(cond, "msg")      // log only when the invariant breaks
console.count("hit")             // how many times did this run?

// and: log OBJECTS, not interpolated strings.
console.log("user:", user);      // inspectable, expandable
console.log(\`user: \${user}\`);    // "user: [object Object]" - useless</div>
<p>All of these beat a bare <code>log</code>, and all of them are beaten by a breakpoint, which is the
next stream.</p>`,
docs:[['MDN — Console API','https://developer.mozilla.org/en-US/docs/Web/API/console'],['MDN — Error.prototype.stack','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Stack'],['git bisect','https://git-scm.com/docs/git-bisect']],
exs:[
{title:'Find the failing frame',diff:'easy',lang:'js',
run:{call:'firstOwnFrame',cases:[
 {name:'skips library frames',args:[['at map (node_modules/lodash/lodash.js:1:1)','at formatUser (src/profile.js:42:31)','at main (src/app.js:11:3)'],'node_modules'],expect:'at formatUser (src/profile.js:42:31)'},
 {name:'the first frame is already yours',args:[['at formatUser (src/profile.js:42:31)','at main (src/app.js:11:3)'],'node_modules'],expect:'at formatUser (src/profile.js:42:31)'},
 {name:'every frame is a library frame',args:[['at a (node_modules/x.js:1:1)'],'node_modules'],expect:'no application frame'},
 {name:'an empty trace',args:[[],'node_modules'],expect:'no application frame'}]},
prompt:`Write <code>function firstOwnFrame(frames, libraryMarker)</code> returning the first frame that does <b>not</b> contain <code>libraryMarker</code>, or <code>"no application frame"</code> when every frame does.`,
starter:`function firstOwnFrame(frames, libraryMarker) {
  return null;
}`,
solution:`function firstOwnFrame(frames, libraryMarker) {
  for (const frame of frames) {
    if (!frame.includes(libraryMarker)) return frame;   // first one is yours
  }
  return "no application frame";
}`,
tests:[{d:'scans the frames in order',re:'for\\s*\\('},{d:'skips library frames',re:'includes\\s*\\(\\s*libraryMarker'},{d:'reports when there is none',re:'"no application frame"'}],
behavior:`Order is executed: the frames must be scanned top-down, because the first application frame is the one to open. This is exactly what DevTools blackboxing automates: hiding library frames so the top of the trace is your own code.`,
hints:['Scan in order and return the first non-library frame.','includes() tests whether a frame is from a library.','Falling through the loop means every frame was a library frame.']},
{title:'Bisect a range',diff:'medium',lang:'js',
run:{call:'bisectSteps',cases:[
 {name:'a single candidate needs no steps',args:[1],expect:0},
 {name:'two candidates take one step',args:[2],expect:1},
 {name:'eight take three',args:[8],expect:3},
 {name:'a thousand commits take ten',args:[1000],expect:10},
 {name:'rounds up for non-powers of two',args:[5],expect:3}]},
prompt:`Write <code>function bisectSteps(n)</code> returning how many halvings are needed to isolate one item among <code>n</code>: that is, <code>Math.ceil(Math.log2(n))</code>. One candidate needs zero steps.`,
starter:`function bisectSteps(n) {
  return 0;
}`,
solution:`function bisectSteps(n) {
  return Math.ceil(Math.log2(n));   // log2(1) is 0, so the base case is free
}`,
tests:[{d:'uses a base-2 logarithm',re:'Math\\.log2'},{d:'rounds up to a whole step',re:'Math\\.ceil'}],
behavior:`The 1000 case is the argument for the technique: ten steps to find one bad commit among a thousand. That is why git bisect is worth reaching for the moment you have no hypothesis; it converts an unbounded search into a bounded one.`,
hints:['Halving repeatedly is a base-2 logarithm.','A partial step still costs a whole step, so round up.','log2(1) is 0, which gives the single-candidate case for free.']}]}

]});
