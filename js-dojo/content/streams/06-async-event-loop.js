STREAMS.push({icon:'⏳',title:'The Event Loop & Asynchronous JavaScript',blurb:'The part everyone learns by folklore, done properly: why a single-threaded language can wait for things, the event loop and its queues, callbacks and why they nested, promises and their three states, async/await, running work in parallel, and cancellation.',lessons:[

{id:'js18',title:'The event loop: how single-threaded code waits',body:`
<p>JavaScript has <b>one call stack</b>. It can do exactly one thing at a time. Yet a browser stays
responsive while downloading, and a Node server handles thousands of connections. Understanding how is
the foundation for everything else in this stream, and for debugging anything asynchronous.</p>

<h4>The trick: the engine is not the whole runtime</h4>
<div class="codeSample" data-hl>  YOUR CODE                    THE HOST (browser or Node)
  ---------                    --------------------------
  call stack        ────────▶  timers, network, file I/O, ...
  (one thread)                 these run OUTSIDE your thread
       ▲                                    │
       │                                    ▼
  EVENT LOOP  ◀──── task queue ◀──── "this finished, run its callback"</div>
<p>When you call <code>setTimeout</code> or start a network request, the <b>host</b> takes the work. Your
stack unwinds immediately. When the work completes, the host puts your callback in a <b>queue</b>. The
<b>event loop</b> does one thing: <i>when the stack is empty, take the next callback from the queue and
push it onto the stack.</i></p>
<p>So JavaScript is single-threaded but the <b>runtime</b> is not. Nothing in your code runs in parallel;
the waiting happens elsewhere.</p>

<h4>The consequence: your code is never interrupted</h4>
<p>A function runs to completion before any callback can start. That is why JavaScript has no data races
on shared variables (an enormous simplification), and it is also why a slow synchronous function
<b>blocks everything</b>:</p>
<div class="codeSample" data-hl>// in a browser: the page freezes. no clicks, no scrolling, no rendering.
// in Node: every other request waits.
for (let i = 0; i &lt; 5e9; i++) { }

// "asynchronous" does not mean "fast" - it means "does not occupy the
// stack while waiting". CPU-heavy work occupies the stack, so it blocks
// no matter how many promises you wrap it in.</div>

<h4>Two queues, not one: and microtasks always win</h4>
<div class="codeSample" data-hl>MACROTASKS   setTimeout, setInterval, I/O events, UI events
MICROTASKS   promise callbacks (.then / await), queueMicrotask

// after each macrotask, the loop drains the ENTIRE microtask queue
// before taking another macrotask.

console.log("1");
setTimeout(() =&gt; console.log("2"), 0);        // macrotask
Promise.resolve().then(() =&gt; console.log("3")); // microtask
console.log("4");

// prints 1, 4, 3, 2
//   1 and 4 are synchronous - they run now
//   3 is a microtask - drained as soon as the stack empties
//   2 is a macrotask - even with a delay of 0, it waits its turn</div>
<p>Trace that example until it is obvious. It explains promise ordering, why
<code>setTimeout(fn, 0)</code> is not immediate, and why an infinite chain of microtasks starves the
timers completely.</p>

<h4><code>setTimeout(fn, 0)</code> is a minimum, not a promise</h4>
<p>The delay says "not before this many milliseconds". If the stack is busy, or earlier callbacks are
queued, it runs later, and browsers clamp nested timeouts to about 4ms. Never use a timer for
correctness; use it to yield.</p>`,
docs:[['MDN (The event loop)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model'],['MDN (Microtask guide)','https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide'],['Node (the event loop)','https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick']],
ex:{title:'Predict the output order',diff:'easy',lang:'js',
run:{call:'order',cases:[
 {name:'synchronous first, then microtask, then macrotask',args:[['sync','timeout','promise']],expect:['sync','promise','timeout']},
 {name:'microtasks drain before any timer',args:[['timeout','promise']],expect:['promise','timeout']},
 {name:'synchronous code always goes first',args:[['promise','sync']],expect:['sync','promise']},
 {name:'relative order within a category is preserved',args:[['timeout','timeout','promise']],expect:['promise','timeout','timeout']},
 {name:'only synchronous work',args:[['sync','sync']],expect:['sync','sync']}]},
prompt:`Write <code>function order(kinds)</code> that takes labels: <code>"sync"</code>, <code>"promise"</code> (a microtask) or <code>"timeout"</code> (a macrotask). It returns them in the order they would actually run. All synchronous first, then all microtasks, then all macrotasks; within a category, keep the original order.`,
starter:`function order(kinds) {
  return [];
}`,
solution:`function order(kinds) {
  const sync    = kinds.filter(k => k === "sync");
  const micro   = kinds.filter(k => k === "promise");
  const macro   = kinds.filter(k => k === "timeout");
  return [...sync, ...micro, ...macro];   // filter preserves relative order
}`,
tests:[{d:'separates the synchronous work',re:'"sync"'},{d:'separates the microtasks',re:'"promise"'},{d:'separates the macrotasks',re:'"timeout"'},{d:'concatenates in priority order',re:'\\[\\s*\\.\\.\\.'}],
behavior:`The fourth case executes the stability requirement: two timers keep their relative order, because filter preserves it. Sorting with a comparator that returns 0 for equal priorities would also work; anything that reorders within a category would not.`,
hints:['Three filters, then concatenate in priority order.','filter keeps the original relative order for free.','Synchronous beats microtask beats macrotask, always.']}},

{id:'js19',title:'Callbacks, and the problem they created',body:`
<p>Before promises, "run this when the work finishes" meant passing a function. The pattern still exists
everywhere (every event listener is a callback), so it is worth understanding on its own terms, along
with the two problems that motivated everything after it.</p>

<div class="codeSample" data-hl>// the Node convention: error FIRST, result second
fs.readFile("a.txt", "utf8", function (err, data) {
  if (err) return handle(err);     // check err first, ALWAYS
  console.log(data);
});</div>
<p>The error-first convention exists because a callback cannot <code>throw</code> to its caller: by the
time it runs, the caller's stack frame is long gone. That single fact drives the rest of this lesson.</p>

<h4>Problem 1: nesting</h4>
<div class="codeSample" data-hl>getUser(id, (e, user) =&gt; {
  if (e) return fail(e);
  getOrders(user, (e, orders) =&gt; {
    if (e) return fail(e);
    getItems(orders[0], (e, items) =&gt; {
      if (e) return fail(e);
      render(items);              // four levels deep, and error handling
    });                           // repeated at every single level
  });
});</div>
<p>Sequential steps become horizontal nesting. Adding a step means re-indenting the ones below it, and
the error path is duplicated per level. This is what "callback hell" refers to: not that callbacks are
bad, but that they compose badly.</p>

<h4>Problem 2: errors do not propagate</h4>
<div class="codeSample" data-hl>try {
  setTimeout(() =&gt; { throw new Error("boom"); }, 0);
} catch (e) {
  // NEVER RUNS. by the time the callback throws, this try block has
  // already exited - the callback runs on a FRESH, EMPTY stack.
}
// the error becomes an uncaught exception instead: it crashes Node
// or lands in window.onerror in the browser.</div>
<p>This is the most important idea in the whole stream. <b>You cannot <code>try</code>/<code>catch</code>
across an asynchronous boundary.</b> Promises exist largely to give errors a path back to you, and
<code>await</code> exists to make <code>try</code>/<code>catch</code> work again.</p>

<h4>Two more hazards</h4>
<p><b>Called twice, or never.</b> Nothing enforces that a callback runs exactly once. A poorly written
API that invokes yours twice will silently run your continuation twice. Promises fix this by definition:
a promise settles once and stays settled.</p>
<p><b>Zalgo, sometimes sync, sometimes async.</b> A function that calls back immediately on a cache hit
and asynchronously on a miss has two different orderings, and the bug only appears on one path. Promise
callbacks are <i>always</i> asynchronous, which removes the whole class.</p>

<h4>Where callbacks are still right</h4>
<p>For things that happen <b>many times</b>: event listeners, streams, observers. A promise represents
<i>one</i> future value, so it is the wrong shape for a click handler. The rule: one-shot work becomes a
promise, repeated work stays a callback.</p>`,
docs:[['MDN, Callback function','https://developer.mozilla.org/en-US/docs/Glossary/Callback_function'],['Node, asynchronous flow control','https://nodejs.org/en/learn/asynchronous-work/javascript-asynchronous-programming-and-callbacks']],
ex:{title:'Handle the error-first convention',diff:'easy',lang:'js',
run:{call:'settle',cases:[
 {name:'an error is reported',args:[{message:'nope'},null],expect:'error: nope'},
 {name:'a result is used',args:[null,'data'],expect:'ok: data'},
 {name:'the error wins even when a result is present',args:[{message:'nope'},'data'],expect:'error: nope'},
 {name:'no error and no result',args:[null,null],expect:'ok: null'},
 {name:'undefined error behaves like no error',args:[undefined,'data'],expect:'ok: data'}]},
prompt:`Write <code>function settle(err, result)</code> modelling an error-first callback body. When <code>err</code> is present return <code>"error: MESSAGE"</code> using <code>err.message</code>; otherwise return <code>"ok: RESULT"</code>. When the result is <code>null</code>, the text should read <code>"ok: null"</code>.`,
starter:`function settle(err, result) {
  return null;
}`,
solution:`function settle(err, result) {
  if (err) return \`error: \${err.message}\`;   // check the error FIRST
  return \`ok: \${result}\`;                    // template literal stringifies null
}`,
tests:[{d:'checks the error first',re:'if\\s*\\(\\s*err'},{d:'reports the error message',re:'err\\.message'},{d:'otherwise reports the result',re:'ok:'}],
behavior:`The third case executes the convention: when both are present the error wins, because a callback that reads the result before checking err will happily process garbage. The fourth relies on template literals stringifying null as "null" rather than throwing.`,
hints:['Guard on the error before touching the result.','Template literals convert null to the text "null" for you.','Return immediately from the error branch.']}},

{id:'js20',title:'Promises',body:`
<p>A <b>promise</b> is an object representing a value that is not available yet. It replaces "pass me a
callback" with "here is a handle you can attach callbacks to", and that inversion is what makes
composition and error propagation possible.</p>

<h4>Three states, one transition</h4>
<div class="codeSample" data-hl>PENDING  ──▶ FULFILLED (with a value)
         └─▶ REJECTED  (with a reason, conventionally an Error)

// it settles ONCE and never changes again. attaching a handler to an
// already-settled promise still works - your callback simply runs on
// the next microtask.</div>

<div class="codeSample" data-hl>const p = new Promise((resolve, reject) =&gt; {
  someCallbackApi((err, data) =&gt; err ? reject(err) : resolve(data));
});

p.then(value =&gt; { ... })          // on fulfilment
 .catch(err   =&gt; { ... })         // on rejection, anywhere ABOVE in the chain
 .finally(()  =&gt; { ... });        // either way - cleanup

Promise.resolve(1);   // an already-fulfilled promise
Promise.reject(new Error("x"));   // an already-rejected one</div>
<p>You rarely write <code>new Promise</code>; it is for wrapping an old callback API. Everything modern
already returns one.</p>

<h4>Chaining is what solves the nesting</h4>
<div class="codeSample" data-hl>getUser(id)
  .then(user =&gt; getOrders(user))     // returning a promise FLATTENS it:
  .then(orders =&gt; getItems(orders[0])) //   no nesting, no pyramid
  .then(items =&gt; render(items))
  .catch(fail);                        // ONE error path for every step above

// what a .then callback returns matters:
//   a value        -> the next .then receives it
//   a promise      -> the chain WAITS for it, then unwraps it
//   nothing        -> the next .then receives undefined  <- common bug
//   a throw        -> skips to the next .catch</div>
<p><b>Forgetting to return inside a <code>then</code> is the classic promise bug.</b> The chain does not
wait, the next step gets <code>undefined</code>, and nothing reports an error.</p>

<h4>Running things at the same time</h4>
<div class="codeSample" data-hl>Promise.all([a, b, c])         // ALL fulfil -> array of values.
                               // rejects IMMEDIATELY on the first failure,
                               // and the others keep running (no cancellation)
Promise.allSettled([a, b, c])  // waits for all; never rejects. gives
                               // [{status:"fulfilled",value} | {status:"rejected",reason}]
Promise.race([a, b])           // first to SETTLE, fulfil or reject
Promise.any([a, b])            // first to FULFIL; rejects only if all do</div>
<p>Choose by intent: <code>all</code> when you need every result and any failure is fatal;
<code>allSettled</code> when partial success is useful, which, for a dashboard fetching six widgets, it
usually is.</p>

<h4>The rule that keeps promises safe</h4>
<p><b>Always terminate a chain with <code>catch</code>, or return the promise to someone who will.</b> An
unhandled rejection is a warning in browsers and, since Node 15, <b>crashes the process</b>. A promise
you neither return nor catch is a silent failure waiting to happen.</p>`,
docs:[['MDN (Using promises)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises'],['MDN (Promise)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise'],['MDN (Promise.allSettled)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled']],
exs:[
{title:'Choose the right combinator',diff:'easy',lang:'js',
run:{call:'combinator',cases:[
 {name:'every result needed, any failure fatal',args:['need-all-fail-fast'],expect:'Promise.all'},
 {name:'partial success is useful',args:['need-partial-results'],expect:'Promise.allSettled'},
 {name:'whichever finishes first',args:['first-to-settle'],expect:'Promise.race'},
 {name:'first success, ignore failures',args:['first-success'],expect:'Promise.any'},
 {name:'anything else',args:['zzz'],expect:'unknown'}]},
prompt:`Write <code>function combinator(intent)</code> mapping an intent to the right combinator: <code>"need-all-fail-fast"</code>&rarr;<code>"Promise.all"</code>, <code>"need-partial-results"</code>&rarr;<code>"Promise.allSettled"</code>, <code>"first-to-settle"</code>&rarr;<code>"Promise.race"</code>, <code>"first-success"</code>&rarr;<code>"Promise.any"</code>, anything else&rarr;<code>"unknown"</code>.`,
starter:`function combinator(intent) {
  return null;
}`,
solution:`function combinator(intent) {
  switch (intent) {
    case "need-all-fail-fast":   return "Promise.all";
    case "need-partial-results": return "Promise.allSettled";
    case "first-to-settle":      return "Promise.race";
    case "first-success":        return "Promise.any";
    default:                     return "unknown";
  }
}`,
tests:[{d:'all for fail-fast',re:'"Promise\\.all"'},{d:'allSettled for partial results',re:'"Promise\\.allSettled"'},{d:'race for first to settle',re:'"Promise\\.race"'},{d:'any for first success',re:'"Promise\\.any"'}],
behavior:`The distinction that matters in practice is the first two: Promise.all rejects the moment anything fails, so one dead widget takes out a whole dashboard, while allSettled gives you five results and one recorded failure.`,
hints:['One case per combinator, with a default.','race settles on the first outcome of ANY kind; any waits for the first success.','allSettled never rejects.']},
{title:'Await a real promise',diff:'medium',lang:'js',
run:{call:'doubleLater',cases:[
 {name:'resolves to double the value',args:[5],expect:10},
 {name:'zero',args:[0],expect:0},
 {name:'negatives',args:[-3],expect:-6},
 {name:'decimals',args:[1.5],expect:3}]},
prompt:`Write <code>async function doubleLater(n)</code> that resolves a promise carrying <code>n</code>, awaits it, and returns double the value. The point is to see an <code>async</code> function's return value be unwrapped for you; the grader awaits whatever you return.`,
starter:`async function doubleLater(n) {
  return 0;
}`,
solution:`async function doubleLater(n) {
  const value = await Promise.resolve(n);   // await unwraps the promise
  return value * 2;                          // an async fn returns a PROMISE
}`,
tests:[{d:'is an async function',re:'async\\s+function'},{d:'awaits a promise',re:'await'},{d:'doubles the awaited value',re:'\\*\\s*2'}],
behavior:`This executes for real: your async function returns a promise, the runner awaits it, and the resolved number is compared. An async function always returns a promise even when the body returns a plain value, which is why await works on it and why forgetting await elsewhere gives you a Promise object instead of your data.`,
hints:['Mark the function async so you can use await inside it.','Promise.resolve(n) gives you a promise already carrying n.','Return the doubled value; the async wrapper turns it into a promise.']}]},

{id:'js21',title:'async/await, and the mistakes it invites',body:`
<p><code>async</code>/<code>await</code> is syntax over promises. Nothing new happens underneath, but
asynchronous code regains the shape of ordinary code, including <code>try</code>/<code>catch</code>.</p>

<div class="codeSample" data-hl>// the promise chain
function load(id) {
  return getUser(id)
    .then(u =&gt; getOrders(u))
    .then(o =&gt; render(o))
    .catch(handle);
}

// the same thing, with await
async function load(id) {
  try {
    const user   = await getUser(id);
    const orders = await getOrders(user);
    render(orders);
  } catch (e) {
    handle(e);                 // try/catch WORKS again, across awaits
  }
}</div>

<h4>Two rules</h4>
<p><b>An <code>async</code> function always returns a promise</b>, even when its body returns a number.
<b><code>await</code> pauses only that function</b>: the stack unwinds, the event loop keeps going, and
everything else in the program continues.</p>

<h4>Mistake 1: accidental sequencing</h4>
<div class="codeSample" data-hl>// 3 seconds - each await WAITS before the next request even starts
const a = await fetchA();     // 1s
const b = await fetchB();     // 1s
const c = await fetchC();     // 1s

// 1 second - all three START, then we wait for all three
const [a, b, c] = await Promise.all([fetchA(), fetchB(), fetchC()]);

// sequence ONLY when a step needs the previous result. otherwise this
// is free performance, and it is the most common async review comment.</div>

<h4>Mistake 2: <code>await</code> in a loop, and <code>forEach</code></h4>
<div class="codeSample" data-hl>for (const id of ids) { await save(id); }        // sequential - sometimes
                                                 // exactly what you want
await Promise.all(ids.map(id =&gt; save(id)));      // concurrent

// and the one that silently does nothing:
ids.forEach(async (id) =&gt; { await save(id); });
// forEach IGNORES the returned promises. the function continues
// immediately, nothing is awaited, and errors vanish. use for...of
// or Promise.all with map.</div>

<h4>Mistake 3: forgetting <code>await</code></h4>
<div class="codeSample" data-hl>const user = getUser(id);        // a Promise, not a user
user.name;                       // undefined - no error, no clue

if (await isAdmin(u)) { }        // correct
if (isAdmin(u)) { }              // ALWAYS true: an object is truthy.
                                 // a security check that never fails.</div>
<p>That last one is worth pausing on: a forgotten <code>await</code> on a boolean-returning check makes
the check pass unconditionally, silently. Linters catch it and it still reaches production regularly.</p>

<h4>Mistake 4: swallowing errors</h4>
<p>A rejected promise you never <code>await</code> or <code>catch</code> is an unhandled rejection,
which crashes Node. Either <code>await</code> it, <code>catch</code> it, or deliberately mark it
fire-and-forget with an attached <code>.catch()</code>. "I do not care about the result" and "I do not
care whether it failed" are different statements, and only the second is usually wrong.</p>

<h4>Timeouts and cancellation</h4>
<div class="codeSample" data-hl>// promises cannot be cancelled. AbortController is how you stop the
// underlying WORK and get a rejection you can handle:
const ac = new AbortController();
setTimeout(() =&gt; ac.abort(), 5000);
await fetch(url, { signal: ac.signal });    // rejects with AbortError

// a timeout without cancellation leaves the original request running:
await Promise.race([work(), rejectAfter(5000)]);   // useful, but leaky</div>`,
docs:[['MDN (async function)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function'],['MDN (await)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await'],['MDN (AbortController)','https://developer.mozilla.org/en-US/docs/Web/API/AbortController']],
exs:[
{title:'Sequential or concurrent?',diff:'easy',lang:'js',
run:{call:'strategy',cases:[
 {name:'step two needs step one',args:[true,false],expect:'sequential'},
 {name:'independent steps run together',args:[false,false],expect:'concurrent'},
 {name:'independent but rate-limited',args:[false,true],expect:'batched'},
 {name:'dependency beats the rate limit',args:[true,true],expect:'sequential'}]},
prompt:`Write <code>function strategy(dependsOnPrevious, rateLimited)</code>. A genuine dependency forces <code>"sequential"</code> regardless of anything else. Otherwise a rate limit means <code>"batched"</code>, and independent unlimited work is <code>"concurrent"</code>.`,
starter:`function strategy(dependsOnPrevious, rateLimited) {
  return null;
}`,
solution:`function strategy(dependsOnPrevious, rateLimited) {
  if (dependsOnPrevious) return "sequential";   // correctness first
  if (rateLimited) return "batched";            // then the constraint
  return "concurrent";                           // otherwise, go wide
}`,
tests:[{d:'a dependency forces sequencing',re:'dependsOnPrevious'},{d:'a rate limit means batching',re:'rateLimited'},{d:'otherwise run concurrently',re:'"concurrent"'}],
behavior:`The last case executes the precedence: a dependency wins even when a rate limit is also present, because correctness constrains ordering and a rate limit only constrains throughput. Checking the rate limit first would pass three cases and fail that one.`,
hints:['Check the dependency first; it is the stronger constraint.','Guard clauses in priority order.','Independent and unlimited is the fast path.']},
{title:'Run work concurrently',diff:'medium',lang:'js',
run:{call:'totalOf',cases:[
 {name:'sums the resolved values',args:[[1,2,3]],expect:6},
 {name:'a single value',args:[[5]],expect:5},
 {name:'an empty list',args:[[]],expect:0},
 {name:'negatives and decimals',args:[[-1,0.5,0.5]],expect:0}]},
prompt:`Write <code>async function totalOf(values)</code> that turns each value into a promise with <code>Promise.resolve</code>, awaits them <b>all at once</b> with <code>Promise.all</code>, and returns the sum. An empty list must return <code>0</code>.`,
starter:`async function totalOf(values) {
  return 0;
}`,
solution:`async function totalOf(values) {
  const results = await Promise.all(values.map(v => Promise.resolve(v)));
  return results.reduce((sum, v) => sum + v, 0);   // initial 0 for []
}`,
tests:[{d:'is async',re:'async'},{d:'awaits all of them together',re:'Promise\\.all'},{d:'maps values to promises',re:'\\.map\\('},{d:'sums with an initial accumulator',re:'\\.reduce\\('}],
behavior:`Promise.all on an empty array resolves immediately to [], and reduce's initial 0 turns that into 0 rather than a TypeError. Awaiting inside a loop instead would produce the same answer here but would serialise the work: correct, and needlessly slow.`,
hints:['map each value to a promise, then hand the array to Promise.all.','await the whole thing at once rather than one at a time.','reduce needs its initial value for the empty case.']},
{title:'Retry with exponential backoff',diff:'hard',lang:'js',
run:{call:'attemptPlan',cases:[
 {name:'succeeds first time: one attempt, no waiting',args:[1,3,100],expect:{attempts:1,delays:[]}},
 {name:'succeeds on the third: two waits, doubling',args:[3,5,100],expect:{attempts:3,delays:[100,200]}},
 {name:'never succeeds: stops at the limit',args:[99,4,100],expect:{attempts:4,delays:[100,200,400]}},
 {name:'a single allowed attempt never waits',args:[99,1,100],expect:{attempts:1,delays:[]}},
 {name:'a different base delay doubles from there',args:[3,3,50],expect:{attempts:3,delays:[50,100]}},
 {name:'succeeding on the last allowed attempt',args:[4,4,10],expect:{attempts:4,delays:[10,20,40]}}]},
prompt:`Write <code>function attemptPlan(succeedOnAttempt, maxAttempts, baseDelay)</code> that works out a retry plan without actually waiting. Return <code>{ attempts, delays }</code>: <code>attempts</code> is how many calls were made, and <code>delays</code> lists the wait before each <b>retry</b>, doubling each time (<code>baseDelay</code>, then double, then double again). Stop as soon as the attempt numbered <code>succeedOnAttempt</code> is reached, or when <code>maxAttempts</code> is used up. There is never a wait after the final attempt.`,
starter:`function attemptPlan(succeedOnAttempt, maxAttempts, baseDelay) {
  return { attempts: 0, delays: [] };
}`,
solution:`function attemptPlan(succeedOnAttempt, maxAttempts, baseDelay) {
  const delays = [];
  let delay = baseDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (attempt === succeedOnAttempt) return { attempts: attempt, delays };
    if (attempt < maxAttempts) {      // no wait after the LAST attempt
      delays.push(delay);
      delay *= 2;                     // exponential: each wait doubles
    }
  }
  return { attempts: maxAttempts, delays };   // gave up
}`,
tests:[{d:'loops up to the attempt limit',re:'maxAttempts'},{d:'stops on success',re:'succeedOnAttempt'},{d:'doubles the delay',re:'\\*=\\s*2|\\*\\s*2'},{d:'collects the waits',re:'delays\\.push'}],
behavior:`Six cases execute and three of them catch off-by-one errors. There are always exactly one fewer delays than attempts, because you never wait after the last one; the first case proves it (one attempt, no delays) and the third pins the give-up path (4 attempts, 3 delays). Real retry code adds jitter to these numbers so a fleet of clients does not retry in lockstep and stampede the service they are waiting for.`,
hints:['Count attempts from 1 so the comparison with succeedOnAttempt reads naturally.','Push a delay only when another attempt will follow.','Double the delay after pushing it, not before.']}]}

]});
