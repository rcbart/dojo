STREAMS.push({icon:'🔬',title:'Debugging, Testing & Profiling Node',blurb:'Finding problems in a running server: node --inspect and real breakpoints in server code, the built-in test runner, structured logging that survives production, heap snapshots and CPU profiles, and diagnosing a blocked event loop or a memory leak.',lessons:[

{id:'js47',title:'Debugging server code with a real debugger',body:`
<p>Everything from the browser-debugging stream applies here: the same DevTools, the same breakpoints,
the same Scope pane. The only difference is how you attach.</p>

<div class="codeSample" data-hl># start with the inspector open, and PAUSE on the first line
node --inspect-brk app.js

# start with the inspector open, but run immediately
node --inspect app.js

# attach to a process that is ALREADY running and misbehaving:
kill -USR1 &lt;pid&gt;        # opens the inspector on the default port
# then open  chrome://inspect  and click "inspect"</div>
<p><code>--inspect-brk</code> is the one you usually want for a script, because a program that finishes in
40 milliseconds gives you no chance to attach otherwise. For a long-running server either works.</p>

<h4>Attaching from where you already are</h4>
<p><b>Chrome:</b> open <code>chrome://inspect</code>, and your Node target appears under "Remote Target".
You get the full Sources panel: breakpoints, stepping, the scope pane, the console evaluating in the
paused frame.</p>
<p><b>VS Code:</b> the JavaScript Debug Terminal is the shortest path: open it, run <code>node app.js</code>
normally, and breakpoints set in the editor just work with no launch configuration to maintain.</p>

<h4>The one that matters in a container</h4>
<div class="codeSample" data-hl># the inspector binds to 127.0.0.1 by default, which is unreachable from
# outside the container. so people write:
node --inspect=0.0.0.0:9229 app.js        # and then forget it is there

# THE INSPECTOR IS A REMOTE CODE EXECUTION INTERFACE. anyone who can
# reach that port can evaluate arbitrary code in your process.
# never expose it publicly. bind to localhost and use an SSH tunnel:
ssh -L 9229:localhost:9229 user@host</div>

<h4>Logging that is still useful at 3am</h4>
<div class="codeSample" data-hl>// unstructured: impossible to query, and it interleaves under load
console.log("user " + id + " failed to log in");

// structured: one JSON object per line, to stdout
log.warn({ event: "login_failed", userId: id, reason: "bad_password",
           requestId: req.id });
// now "every login failure for this user in the last hour" is one query
// instead of a grep and a guess.</div>
<p>Three rules. <b>To stdout</b>, one JSON object per line, and let the platform handle collection: a
process that manages its own log files is a process that fills a disk. <b>A request id on every line</b>,
so one request's story can be reassembled from a thousand interleaved ones. And <b>never log
credentials, tokens or request bodies</b> from authenticated calls: logs are widely readable, retained for
a long time, and are a genuine source of breaches.</p>

<h4>Where <code>console.log</code> still wins</h4>
<p>A breakpoint requires you to be there when it happens. Production, timing-sensitive races, and bugs you
can reproduce exactly once are all cases where a log line is the only option, which is why the previous
lesson's structured logging matters, and why the next lessons cover recording rather than pausing.</p>`,
docs:[['Node (debugging guide)','https://nodejs.org/en/learn/getting-started/debugging'],['Node (inspector security)','https://nodejs.org/en/learn/getting-started/debugging#security-implications'],['VS Code (Node.js debugging)','https://code.visualstudio.com/docs/nodejs/nodejs-debugging']],
exs:[
{title:'Choose the right inspect flag',diff:'easy',lang:'js',
run:{call:'inspectFlag',cases:[
 {name:'a short script that exits immediately',args:['short-script'],expect:'--inspect-brk'},
 {name:'a long-running server you are starting',args:['start-server'],expect:'--inspect'},
 {name:'a process that is already running',args:['already-running'],expect:'kill -USR1'},
 {name:'a startup crash before any code of yours runs',args:['crash-on-startup'],expect:'--inspect-brk'},
 {name:'anything else',args:['zzz'],expect:'--inspect'}]},
prompt:`Write <code>function inspectFlag(situation)</code>: <code>"short-script"</code> and <code>"crash-on-startup"</code>&rarr;<code>"--inspect-brk"</code>; <code>"already-running"</code>&rarr;<code>"kill -USR1"</code>; <code>"start-server"</code> and anything else&rarr;<code>"--inspect"</code>.`,
starter:`function inspectFlag(situation) {
  return null;
}`,
solution:`function inspectFlag(situation) {
  switch (situation) {
    case "short-script":
    case "crash-on-startup":
      return "--inspect-brk";      // pause BEFORE the first line runs
    case "already-running":
      return "kill -USR1";          // cannot add a flag to a live process
    default:
      return "--inspect";
  }
}`,
tests:[{d:'breaks on the first line for short-lived code',re:'"--inspect-brk"'},{d:'signals a live process',re:'kill -USR1'},{d:'plain inspect is the default',re:'"--inspect"'}],
behavior:`Five cases execute. The distinction is timing: a script that finishes in 40 milliseconds is gone before you can attach, so --inspect-brk holds it at line one. And a process already running cannot be given a new flag at all; the signal is the only way in, which is worth knowing before an incident rather than during one.`,
hints:['Two situations need the process held before any code runs.','A live process cannot take a new command-line flag.','Everything else is the plain inspect flag.']},
{title:'Is this log line safe and useful?',diff:'medium',lang:'js',
run:{call:'auditLogLine',cases:[
 {name:'structured with a request id is fine',args:[{structured:true,requestId:'r1',fields:['event','userId']}],expect:{ok:true,problems:[]}},
 {name:'unstructured is hard to query',args:[{structured:false,requestId:'r1',fields:['event']}],expect:{ok:false,problems:['not structured']}},
 {name:'a missing request id cannot be correlated',args:[{structured:true,requestId:null,fields:['event']}],expect:{ok:false,problems:['no request id']}},
 {name:'a token in the fields is a leak',args:[{structured:true,requestId:'r1',fields:['event','accessToken']}],expect:{ok:false,problems:['sensitive field: accessToken']}},
 {name:'a password is a leak too',args:[{structured:true,requestId:'r1',fields:['password']}],expect:{ok:false,problems:['sensitive field: password']}},
 {name:'every problem is reported, in order',args:[{structured:false,requestId:null,fields:['password','accessToken']}],expect:{ok:false,problems:['not structured','no request id','sensitive field: password','sensitive field: accessToken']}}]},
prompt:`Write <code>function auditLogLine(line)</code> returning <code>{ ok, problems }</code>. Not <code>structured</code> &rarr; <code>"not structured"</code>. No <code>requestId</code> &rarr; <code>"no request id"</code>. Any field named <code>"password"</code>, <code>"accessToken"</code>, <code>"refreshToken"</code> or <code>"authorization"</code> &rarr; <code>"sensitive field: NAME"</code>, one per offending field in the order they appear. Report every problem, in that order.`,
starter:`function auditLogLine(line) {
  return { ok: true, problems: [] };
}`,
solution:`function auditLogLine(line) {
  const problems = [];
  const SENSITIVE = ["password", "accessToken", "refreshToken", "authorization"];

  if (!line.structured) problems.push("not structured");
  if (!line.requestId) problems.push("no request id");
  for (const field of line.fields) {
    if (SENSITIVE.includes(field)) problems.push("sensitive field: " + field);
  }
  return { ok: problems.length === 0, problems };
}`,
tests:[{d:'checks the line is structured',re:'structured'},{d:'requires a request id',re:'requestId'},{d:'names each sensitive field',re:'sensitive field'},{d:'collects every problem',re:'problems\\.push'}],
behavior:`Six cases execute. The last requires all four problems at once, in a fixed order: a reviewer wants the whole list, not the first thing wrong. The sensitive-field check is the one that matters most: logs are widely readable inside an organization and retained for months, so a token written once is a credential sitting in a searchable store long after it should have expired.`,
hints:['Accumulate into a problems array rather than returning at the first issue.','Keep the sensitive names in a list and check each field against it.','Push one problem per offending field, in the order the fields appear.']}]},

{id:'js48',title:'Testing with the built-in runner',body:`
<p>Node ships a test runner. For most projects it removes a dependency, a config file and a whole class of
version-mismatch problems, and it is enough on its own.</p>

<div class="codeSample" data-hl>// math.test.js
import { test, describe, before, after, mock } from "node:test";
import assert from "node:assert/strict";        // STRICT: === not ==
import { add } from "./math.js";

describe("add", () =&gt; {
  test("adds two numbers", () =&gt; {
    assert.equal(add(2, 3), 5);
  });

  test("rejects a non-number", () =&gt; {
    assert.throws(() =&gt; add(2, "3"), /must be a number/);
  });

  test("resolves asynchronously", async () =&gt; {
    await assert.rejects(loadUser(-1), { name: "ValidationError" });
  });
});</div>
<div class="codeSample" data-hl>node --test                    # runs every *.test.js it can find
node --test --watch            # re-runs on save
node --test --experimental-test-coverage
node --test --test-name-pattern="adds"</div>

<h4>What to assert</h4>
<p><code>node:assert/strict</code> is the import to use; the non-strict version compares with
<code>==</code>, which will happily tell you <code>"5"</code> equals <code>5</code>. The four you will use
constantly: <code>equal</code> for primitives, <code>deepEqual</code> for objects and arrays,
<code>throws</code> and <code>rejects</code> for failures, and testing the failures is the half people
skip, even though it is where the bugs are.</p>

<h4>What makes a test worth having</h4>
<p><b>One behavior per test</b>, named so a failure report reads as a sentence: "rejects a negative
amount" tells you what broke; "test 3" does not.</p>
<p><b>Arrange, act, assert</b>, in that order and visibly separated. A test where you cannot see which
line is the action is a test nobody will maintain.</p>
<p><b>No shared mutable state.</b> Tests that pass alone and fail together, or that depend on running in
order, are worse than no tests: they train the team to ignore red.</p>
<p><b>Test behavior, not implementation.</b> A test that asserts a private method was called breaks on
every refactor while catching nothing. Assert on what the caller can observe.</p>

<h4>Test doubles, and using them sparingly</h4>
<div class="codeSample" data-hl>const fn = mock.fn(() =&gt; 42);
fn(1); fn(2);
fn.mock.callCount();          // 2
fn.mock.calls[0].arguments;   // [1]

// mock the BOUNDARY - the network, the clock, the file system - and
// nothing inside it. mocking your own modules couples the test to the
// structure of the code, which is exactly what you did not want.

// and the clock is the one worth mocking every time, because it is what
// makes expiry, rate limits and scheduling testable at all:
//   inject a clock, or use mock.timers - never call Date.now() directly
//   in the code under test.</div>

<h4>How much to write</h4>
<p>Coverage percentage is a poor target: it is easy to reach 90% while asserting nothing meaningful. The
useful question is <b>"if I broke this, would a test tell me?"</b> Concentrate on the logic with branches
and edge cases, the code that has broken before, and the paths that are expensive to get wrong. A handful
of tests that fail for real reasons beats a suite that fails on every refactor.</p>`,
docs:[['Node (test runner)','https://nodejs.org/api/test.html'],['Node (assert)','https://nodejs.org/api/assert.html'],['Node (mock timers)','https://nodejs.org/api/test.html#class-mocktimers']],
ex:{title:'Judge a test suite',diff:'hard',lang:'js',
run:{call:'reviewTests',cases:[
 {name:'a good test passes review',args:[[{name:'rejects a negative amount',asserts:1,sharedState:false,mocksOwnCode:false}]],expect:{ok:true,problems:[]}},
 {name:'an unnamed test is useless in a failure report',args:[[{name:'test 1',asserts:1,sharedState:false,mocksOwnCode:false}]],expect:{ok:false,problems:['test 1: name describes nothing']}},
 {name:'a test with no assertions cannot fail',args:[[{name:'rejects a negative amount',asserts:0,sharedState:false,mocksOwnCode:false}]],expect:{ok:false,problems:['rejects a negative amount: asserts nothing']}},
 {name:'shared state makes tests order-dependent',args:[[{name:'loads a user',asserts:2,sharedState:true,mocksOwnCode:false}]],expect:{ok:false,problems:['loads a user: shares mutable state']}},
 {name:'mocking your own code tests the structure',args:[[{name:'loads a user',asserts:1,sharedState:false,mocksOwnCode:true}]],expect:{ok:false,problems:['loads a user: mocks its own code']}},
 {name:'every problem in one test is reported, in order',args:[[{name:'test 2',asserts:0,sharedState:true,mocksOwnCode:true}]],expect:{ok:false,problems:['test 2: name describes nothing','test 2: asserts nothing','test 2: shares mutable state','test 2: mocks its own code']}},
 {name:'problems across several tests are reported in test order',args:[[{name:'good one',asserts:1,sharedState:false,mocksOwnCode:false},{name:'test 9',asserts:1,sharedState:false,mocksOwnCode:false}]],expect:{ok:false,problems:['test 9: name describes nothing']}},
 {name:'an empty suite is not ok',args:[[]],expect:{ok:false,problems:['the suite has no tests']}}]},
prompt:`Write <code>function reviewTests(tests)</code> returning <code>{ ok, problems }</code>. An empty list is a single problem: <code>"the suite has no tests"</code>. Otherwise, for each test in order, report <code>"NAME: name describes nothing"</code> when the name matches <code>test</code> followed by a space and digits, <code>"NAME: asserts nothing"</code> when <code>asserts</code> is 0, <code>"NAME: shares mutable state"</code> when <code>sharedState</code> is true, and <code>"NAME: mocks its own code"</code> when <code>mocksOwnCode</code> is true, in that order within each test.`,
starter:`function reviewTests(tests) {
  return { ok: true, problems: [] };
}`,
solution:`function reviewTests(tests) {
  if (tests.length === 0) {
    return { ok: false, problems: ["the suite has no tests"] };
  }
  const problems = [];
  for (const t of tests) {
    if (/^test \\d+$/.test(t.name)) problems.push(t.name + ": name describes nothing");
    if (t.asserts === 0)           problems.push(t.name + ": asserts nothing");
    if (t.sharedState)             problems.push(t.name + ": shares mutable state");
    if (t.mocksOwnCode)            problems.push(t.name + ": mocks its own code");
  }
  return { ok: problems.length === 0, problems };
}`,
tests:[{d:'handles an empty suite',re:'no tests'},{d:'detects a meaningless name',re:'describes nothing'},{d:'detects a test with no assertions',re:'asserts nothing'},{d:'detects shared state',re:'shares mutable state'},{d:'detects self-mocking',re:'mocks its own code'}],
behavior:`Eight cases execute. Two decide the implementation: the sixth requires all four problems from ONE test in a fixed order, and the seventh requires problems from several tests to appear in test order, so the checks must be nested inside the loop rather than run as four separate passes over the list. The empty suite returns early with exactly one problem, because listing per-test issues for a suite with no tests would be nonsense. The rules themselves are the lesson: a test with no assertion cannot fail, and a green suite full of them is worse than none.`,
hints:['Handle the empty suite first and return immediately.','Loop once over the tests, running all four checks inside the loop so the order comes out right.','A meaningless name is the literal word test, a space, and digits, nothing else.']}},

{id:'js49',title:'Profiling, memory and a blocked event loop',body:`
<p>Two production problems dominate: the process is using more memory than it should, or it has stopped
responding. Both have a specific diagnostic path, and guessing at either wastes days.</p>

<h4>CPU profiles</h4>
<div class="codeSample" data-hl># the simplest: sample the process and get a flamegraph-ready file
node --cpu-prof app.js          # writes a .cpuprofile on exit
# or, from a live process: chrome://inspect -> Profiler -> Start

# reading it: look for a WIDE frame, not a deep one. width is time
# spent. a deep narrow stack is just a call chain; a wide plateau is
# where the milliseconds actually went.</div>
<p>The rule from the JVM stream applies unchanged: <b>measure before optimizing</b>. The bottleneck is
regularly an N+1 query, a synchronous file read, a JSON serialization or a log statement, and almost
never the algorithm someone was about to rewrite.</p>

<h4>Memory: growth versus a leak</h4>
<div class="codeSample" data-hl>process.memoryUsage()
//  heapUsed    live JavaScript objects        <- watch THIS over time
//  heapTotal   how much heap V8 has reserved from the OS
//  rss         everything the OS gave the process, heap included
//  external    C++ objects bound to JS, including Buffers

// growth is normal - the heap expands until GC runs. a LEAK is heap
// that does not come back down after a collection, over many cycles.
// judge from the TREND across several minutes, not one reading.</div>
<p>A leak in JavaScript means <b>an unintended reference</b>, not forgotten frees. The usual four: a
module-level <code>Map</code> or array that only grows, a cache with no eviction, an event listener never
removed (<code>emitter.on</code> in a request handler is the classic), and a closure capturing something
large that outlives its purpose.</p>

<h4>Heap snapshots find them</h4>
<div class="codeSample" data-hl>import { writeHeapSnapshot } from "node:v8";
writeHeapSnapshot("/tmp/before.heapsnapshot");   // then again later

# in Chrome DevTools -> Memory -> Load, then COMPARE the two snapshots.
# sort by "delta" - what grew between them - and open the RETAINERS
# view, which names the exact chain of references keeping it alive.
# that chain is the answer. it is usually one line of your own code.</div>
<p>Take snapshots when the process is otherwise idle, and know they are expensive: the process pauses
while V8 walks the heap.</p>

<h4>A blocked event loop</h4>
<div class="codeSample" data-hl>// the symptom: everything is slow, CPU is high, and no single endpoint
// looks wrong. that is one loop being occupied, not a slow dependency.

// measure it directly - lag is the gap between when a timer SHOULD have
// fired and when it did:
let last = Date.now();
setInterval(() =&gt; {
  const lag = Date.now() - last - 1000;
  if (lag &gt; 100) log.warn({ event: "event_loop_lag_ms", lag });
  last = Date.now();
}, 1000);

// perf_hooks gives you this properly:
//   monitorEventLoopDelay() -> a histogram, with percentiles</div>
<p>Export loop lag as a metric and alert on it. It is the single most useful number a Node service can
emit, because it goes bad <i>before</i> latency does and it points at a cause the request logs cannot
show.</p>

<h4>The order to work in</h4>
<p><b>Reproduce, measure, then change one thing.</b> Reach for the loop-lag metric first (is the loop
blocked?), then a CPU profile (where is the time?), then heap snapshots (what is being retained?). Going
straight to optimization without one of those three is guessing with extra confidence.</p>`,
docs:[['Node (diagnostics: memory)','https://nodejs.org/en/learn/diagnostics/memory'],['Node (perf_hooks)','https://nodejs.org/api/perf_hooks.html'],['Chrome DevTools (memory problems)','https://developer.chrome.com/docs/devtools/memory-problems']],
exs:[
{title:'Growth or a leak?',diff:'medium',lang:'js',
run:{call:'memoryVerdict',cases:[
 {name:'heap returns to its baseline after GC',args:[[100,180,110,190,105]],expect:'normal growth'},
 {name:'every trough is higher than the last',args:[[100,180,140,220,180]],expect:'likely leak'},
 {name:'flat',args:[[100,100,100]],expect:'normal growth'},
 {name:'two readings are not enough to judge',args:[[100,200]],expect:'not enough data'},
 {name:'one reading is certainly not enough',args:[[100]],expect:'not enough data'},
 {name:'a single spike that comes back down',args:[[100,500,100,110,100]],expect:'normal growth'}]},
prompt:`Write <code>function memoryVerdict(readings)</code> judging <code>heapUsed</code> samples. Fewer than 3 readings &rarr; <code>"not enough data"</code>. Otherwise compare the <b>lowest</b> reading in the first half with the lowest in the second half: if the second-half minimum is more than 20% higher, return <code>"likely leak"</code>; otherwise <code>"normal growth"</code>. Split with the first half being the first <code>Math.floor(length / 2)</code> readings.`,
starter:`function memoryVerdict(readings) {
  return null;
}`,
solution:`function memoryVerdict(readings) {
  if (readings.length < 3) return "not enough data";

  const mid = Math.floor(readings.length / 2);
  const firstMin  = Math.min(...readings.slice(0, mid));   // the TROUGHS matter,
  const secondMin = Math.min(...readings.slice(mid));      // not the peaks

  return secondMin > firstMin * 1.2 ? "likely leak" : "normal growth";
}`,
tests:[{d:'requires enough samples',re:'length\\s*<\\s*3'},{d:'compares the minima, not the peaks',re:'Math\\.min'},{d:'uses a 20% threshold',re:'1\\.2'}],
behavior:`Six cases execute. The last is the point: a single enormous spike that comes back down is NOT a leak; it is a large request, and judging on peaks would flag it. What identifies a leak is the floor rising, because that is heap the collector could not reclaim. The "not enough data" rule exists for the same reason: two readings cannot show a trend, and acting on them is how people spend a day chasing normal allocation.`,
hints:['Guard the sample count before doing any arithmetic.','Compare the LOWEST reading in each half: the troughs are what the collector could reclaim.','A 20% rise in the floor is the threshold; peaks are irrelevant.']},
{title:'Diagnose a slow production service',diff:'hard',lang:'js',
run:{call:'diagnoseService',cases:[
 {name:'high loop lag points at blocking work',args:[{loopLagMs:400,cpuPercent:95,heapTrend:'flat',dependencyLatencyMs:20}],expect:{cause:'blocked event loop',nextStep:'take a CPU profile'}},
 {name:'a slow dependency, with a healthy loop',args:[{loopLagMs:5,cpuPercent:20,heapTrend:'flat',dependencyLatencyMs:3000}],expect:{cause:'slow dependency',nextStep:'add a timeout and check the dependency'}},
 {name:'a rising heap with a healthy loop is a leak',args:[{loopLagMs:5,cpuPercent:30,heapTrend:'rising',dependencyLatencyMs:20}],expect:{cause:'memory leak',nextStep:'compare two heap snapshots'}},
 {name:'loop lag wins even when the heap is also rising',args:[{loopLagMs:400,cpuPercent:95,heapTrend:'rising',dependencyLatencyMs:3000}],expect:{cause:'blocked event loop',nextStep:'take a CPU profile'}},
 {name:'a leak is diagnosed before a slow dependency',args:[{loopLagMs:5,cpuPercent:30,heapTrend:'rising',dependencyLatencyMs:3000}],expect:{cause:'memory leak',nextStep:'compare two heap snapshots'}},
 {name:'everything healthy needs more evidence',args:[{loopLagMs:5,cpuPercent:20,heapTrend:'flat',dependencyLatencyMs:20}],expect:{cause:'unknown',nextStep:'add loop lag and dependency latency metrics'}}]},
prompt:`Write <code>function diagnoseService(signals)</code> returning <code>{ cause, nextStep }</code>, checking in this order. <code>loopLagMs</code> above 100 &rarr; <code>"blocked event loop"</code> / <code>"take a CPU profile"</code>. Then <code>heapTrend</code> of <code>"rising"</code> &rarr; <code>"memory leak"</code> / <code>"compare two heap snapshots"</code>. Then <code>dependencyLatencyMs</code> above 1000 &rarr; <code>"slow dependency"</code> / <code>"add a timeout and check the dependency"</code>. Otherwise <code>"unknown"</code> / <code>"add loop lag and dependency latency metrics"</code>.`,
starter:`function diagnoseService(signals) {
  return { cause: null, nextStep: null };
}`,
solution:`function diagnoseService(signals) {
  if (signals.loopLagMs > 100) {
    return { cause: "blocked event loop", nextStep: "take a CPU profile" };
  }
  if (signals.heapTrend === "rising") {
    return { cause: "memory leak", nextStep: "compare two heap snapshots" };
  }
  if (signals.dependencyLatencyMs > 1000) {
    return { cause: "slow dependency",
             nextStep: "add a timeout and check the dependency" };
  }
  return { cause: "unknown",
           nextStep: "add loop lag and dependency latency metrics" };
}`,
tests:[{d:'checks loop lag first',re:'loopLagMs\\s*>\\s*100'},{d:'then the heap trend',re:'"rising"'},{d:'then dependency latency',re:'dependencyLatencyMs\\s*>\\s*1000'},{d:'falls back to admitting it does not know',re:'"unknown"'}],
behavior:`Six cases execute and two exist to pin the ORDER. Case 4 has every signal bad at once and must return "blocked event loop", because a blocked loop makes everything downstream look slow: the dependency latency you measured includes time your own process spent not reading the socket. Case 5 puts a leak and a slow dependency together, and the leak wins, because unbounded memory growth eventually causes the other symptoms too. The last case is the disciplined one: when nothing is conclusive the answer is more instrumentation, not a guess.`,
hints:['Guard clauses in the stated order: the first match wins.','A blocked loop distorts every other measurement, so it is checked first.','The final return admits ignorance and asks for better metrics rather than picking a cause.']}]}
,

{id:'jsmem',title:'How memory works: reachability, GC and weak references',body:`
<p>The profiling lesson taught you to catch a leak from the outside: heap trends and snapshots. This one
explains the machine underneath, because once you know the collector's one rule, every leak pattern stops
being folklore and becomes obvious.</p>

<h4>The one rule: reachability</h4>
<p>JavaScript has no <code>free()</code>. The engine keeps an object alive exactly as long as it is
<b>reachable</b>, findable by following references from the <b>roots</b>: global variables, the current
call stack, and active closures. Everything unreachable is garbage, collected whenever the engine
pleases.</p>
<div class="codeSample" data-hl>let user = { name: "Ada" };
user = null;              // the object is now unreachable -> collectable

let a = {}, b = {};
a.pal = b; b.pal = a;     // a CYCLE - they point at each other
a = null; b = null;       // still fine! reachability from ROOTS is what
                          // counts, and no root reaches either. a cycle
                          // of garbage is still garbage.</div>
<p>That cycle example is why the rule is reachability and not reference counting: a counter would see
"someone still points at me" and keep both forever. (Mark-and-sweep starts at the roots, marks everything
it can reach, and sweeps the rest; generational engines like V8 collect young objects far more often than
old ones, which is why short-lived allocation is cheap.)</p>

<h4>So a leak is an unwanted reference</h4>
<div class="codeSample" data-hl>const cache = new Map();                    // module-level = a ROOT
function render(user) {
  cache.set(user.id, expensiveLayout(user));   // grows forever - every
}                                              // entry is reachable, so
                                               // NOTHING here is garbage
emitter.on("tick", () =&gt; use(bigThing));   // the emitter (alive) holds the
                                            // listener, the listener's closure
                                            // holds bigThing. subscribed = alive.</div>
<p>Every leak from the profiling lesson's list is this shape: some long-lived object (a module-level
collection, an emitter, a timer) holds a path to something that should have died. The fix is always the
same verb: <b>sever the path</b> (delete the entry, remove the listener, clear the timer).</p>

<h4>WeakMap: an entry that does not count</h4>
<p>Sometimes you want to attach data <i>to</i> an object without keeping the object alive. That is
precisely what <code>WeakMap</code> is for: its keys are held <b>weakly</b>: a key reachable only through
the WeakMap is collectable, and its entry evaporates with it.</p>
<div class="codeSample" data-hl>const layouts = new WeakMap();          // object -> computed layout
layouts.set(user, expensiveLayout(user));
// when the LAST real reference to user drops, the entry goes too -
// a cache that cannot leak its keys.

// consequences of weakness: keys must be objects, and a WeakMap is
// not iterable - you cannot list what the collector may be removing.
// (WeakRef and FinalizationRegistry go further down this road; they
// are almost never the right tool in application code.)</div>

<h4>What you cannot do</h4>
<p>You cannot force a collection, and you should not try to time one; GC is the engine's business, and
<code>process.memoryUsage()</code> not dropping the instant you null a reference means nothing. Your job
is only ever the references: keep the paths you need, sever the ones you do not, and let the collector do
the rest.</p>`,
docs:[['MDN (Memory management)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management'],['MDN (WeakMap)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap'],['V8 (Trash talk: the garbage collector)','https://v8.dev/blog/trash-talk']],
ex:{title:'Implement the mark phase',diff:'medium',lang:'js',
run:{call:'reachable',cases:[
 {name:'follows a chain from the root',args:[{root:['a'],a:['b'],b:[]},['root']],expect:['a','b','root']},
 {name:'a cycle does not loop forever',args:[{a:['b'],b:['a']},['a']],expect:['a','b']},
 {name:'the unreachable island is garbage',args:[{root:['a'],a:[],x:['y'],y:['x']},['root']],expect:['a','root']},
 {name:'multiple roots all count',args:[{g:['obj1'],stack:['obj2'],obj1:[],obj2:[]},['g','stack']],expect:['g','obj1','obj2','stack']},
 {name:'no roots means everything is garbage',args:[{a:['b'],b:[]},[]],expect:[]},
 {name:'diamond shapes are visited once',args:[{r:['a','b'],a:['c'],b:['c'],c:[]},['r']],expect:['a','b','c','r']}]},
prompt:`Write <code>function reachable(graph, roots)</code>, the collector's mark phase. <code>graph</code> maps each object name to the list of names it references; <code>roots</code> lists where marking starts. Return the <b>sorted</b> array of every name reachable from any root, visiting each node once (the graphs contain cycles; an unguarded walk will never finish).`,
starter:`function reachable(graph, roots) {
  return [];
}`,
solution:`function reachable(graph, roots) {
  const seen = new Set();
  const stack = [...roots];
  while (stack.length) {
    const node = stack.pop();
    if (seen.has(node)) continue;        // the cycle guard
    seen.add(node);                      // mark
    for (const next of graph[node] || []) stack.push(next);
  }
  return [...seen].sort();               // everything NOT in here is garbage
}`,
tests:[{d:'tracks visited nodes in a Set',re:'new\\s+Set'},{d:'guards against revisiting',re:'\\.has\\('},{d:'follows outgoing references',re:'graph\\[node\\]'},{d:'returns a sorted list',re:'\\.sort\\('}],
behavior:`This is the actual algorithm, executed on six heaps. The cycle case is the argument for the whole design: a and b reference each other, no root references either, and the walk from the roots simply never arrives: the cycle collects itself by being unreachable. The seen-set is what real collectors call the mark bit, and the diamond case proves each object is marked once no matter how many paths lead to it.`,
hints:['Keep a Set of seen names and a stack of names still to visit.','Pop, skip if seen, mark, push the node\\u2019s references.','Sort the Set\\u2019s contents at the end - the cases expect alphabetical order.']}}

,

{id:'jswork',title:'Workers: real parallelism, and when you need it',body:`
<p>Everything in this course so far has run on one thread, and the async stream showed how far that goes:
I/O concurrency without parallelism. The gap is <b>CPU work</b> (parse a huge file, compress an image,
hash a password), where the loop lesson's rule was blunt: while your code computes, nothing else runs.
Workers are the escape hatch: <b>more event loops</b>, not a faster one.</p>

<h4>What a worker is</h4>
<div class="codeSample" data-hl>// main.js
import { Worker } from "node:worker_threads";
const w = new Worker("./crunch.js", { workerData: { file: "big.csv" } });
w.on("message", (result) =&gt; console.log("done", result));
w.on("error", (err) =&gt; log.error({ err }));

// crunch.js - a separate thread, a separate event loop
import { parentPort, workerData } from "node:worker_threads";
parentPort.postMessage(crunch(workerData.file));</div>
<p>Browsers have the same shape with <code>new Worker(url)</code> and <code>postMessage</code>. And, a
little poetically, <b>every exercise you have run in this course executed inside one</b>. That is why
your solutions had to be pure functions: a worker has no DOM and shares no variables with the page. The
sandbox you have been coding in all along is this lesson's subject.</p>

<h4>Messages are copies: structured clone</h4>
<div class="codeSample" data-hl>w.postMessage({ user, items });   // the OTHER side gets a deep COPY

// structured clone carries: objects, arrays, strings, numbers, Date,
// Map, Set, RegExp, typed arrays - and survives cycles, which JSON cannot.
// it REFUSES: functions and DOM nodes (DataCloneError, it throws).
// and class instances arrive as plain data: own properties, no methods.</div>
<p>No shared variables means no data races: the whole category of bugs that makes threading notorious
simply cannot be expressed. The price is copying cost on big payloads. (The escape hatches exist:
transfer lists move a buffer instead of copying it, and <code>SharedArrayBuffer</code> +
<code>Atomics</code> genuinely share memory, at which point the races return, which is why almost
nobody starts there.)</p>

<h4>When a worker is the answer</h4>
<div class="codeSample" data-hl>// I/O-bound?  NEVER a worker. the loop already handles ten thousand
// concurrent requests; a worker would add copying and solve nothing.

// CPU-bound and SMALL (a few ms)?  just do it. the copy costs more.

// CPU-bound and BIG (tens of ms and up, on a server: per request)?
// -> a worker, or better, a POOL of them sized near your core count.
//    spawning is expensive; reuse is the whole game.</div>
<p>The decision is the event-loop lesson's arithmetic: 50ms of synchronous work on a server handling 100
requests per second does not slow things down, it <i>stops</i> them. Move that computation to a pool and
the loop goes back to what it is good at: waiting on everything at once.</p>`,
docs:[['Node (worker_threads)','https://nodejs.org/api/worker_threads.html'],['MDN (Web Workers)','https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers'],['MDN (structured clone)','https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm']],
ex:{title:'Loop or worker?',diff:'medium',lang:'js',
run:{call:'whereToRun',cases:[
 {name:'slow I/O still belongs on the loop',args:[{kind:'io',ms:2000}],expect:'the event loop: async I/O does not block'},
 {name:'a tiny calculation is not worth the copy',args:[{kind:'cpu',ms:5}],expect:'the event loop: too small to be worth a worker'},
 {name:'heavy CPU work blocks everyone',args:[{kind:'cpu',ms:400}],expect:'a worker: this would block the loop'},
 {name:'the 50ms boundary goes to the worker',args:[{kind:'cpu',ms:50}],expect:'a worker: this would block the loop'},
 {name:'just under the boundary stays home',args:[{kind:'cpu',ms:49}],expect:'the event loop: too small to be worth a worker'},
 {name:'even instant I/O is still I/O',args:[{kind:'io',ms:1}],expect:'the event loop: async I/O does not block'}]},
prompt:`Write <code>function whereToRun(job)</code> for a job <code>{ kind, ms }</code> where <code>kind</code> is <code>"io"</code> or <code>"cpu"</code> and <code>ms</code> is how long the work takes. I/O always returns <code>"the event loop: async I/O does not block"</code>, no matter how slow. CPU work of 50ms or more returns <code>"a worker: this would block the loop"</code>; less returns <code>"the event loop: too small to be worth a worker"</code>.`,
starter:`function whereToRun(job) {
  return null;
}`,
solution:`function whereToRun(job) {
  if (job.kind === "io") {
    return "the event loop: async I/O does not block";   // slowness is fine;
  }                                                       // the loop WAITS, it
  if (job.ms >= 50) {                                     // does not compute
    return "a worker: this would block the loop";
  }
  return "the event loop: too small to be worth a worker";
}`,
tests:[{d:'checks the kind first',re:'kind'},{d:'I/O never goes to a worker',re:'does not block'},{d:'uses the 50ms boundary',re:'50'},{d:'sends heavy CPU work away',re:'block the loop'}],
behavior:`The first case is the one that reorders intuitions: two full seconds of I/O stays on the loop, because the loop spends that time waiting, not computing; it can wait on ten thousand things at once. The boundary cases pin the CPU rule: 50ms is worker territory, 49ms is not, and the real threshold in production is whatever your latency budget says it is.`,
hints:['Guard on kind === "io" first - duration is irrelevant for I/O.','&gt;= 50 goes to the worker; the boundary case is included.','Three returns, no else needed - the guard-clause habit from stream 02.']}}


]});
