STREAMS.push({icon:'🟩',title:'The Node Runtime',blurb:'JavaScript outside the browser: what Node actually is and what it adds, its event loop phases and how they differ from the browser, the process object and lifecycle, reading configuration from the environment and the command line, and shutting down cleanly.',lessons:[

{id:'js38',title:'What Node is, and what it adds',body:`
<p><b>Node.js is the V8 engine — the same one inside Chrome — packaged with a set of libraries for things
a browser deliberately will not let you do.</b> The language is identical. What changes is the
surroundings: no DOM, no <code>window</code>, and in their place files, sockets, processes and the
operating system.</p>

<div class="codeSample" data-hl>WHAT NODE ADDS              WHAT IT REMOVES
fs        the file system   document, window, DOM
http      servers, clients  localStorage, sessionStorage
path      path arithmetic   alert, prompt
os        cpus, memory      the same-origin policy
crypto    hashing, keys     (there is no origin - you ARE the machine)
process   env, args, exit
child_process, worker_threads, net, dns, zlib, stream ...</div>
<p>That last removal matters more than it looks. A browser sandboxes your code because it downloaded that
code from a stranger. Node does not, because <b>you</b> chose to run it — which is exactly why installing
an untrusted npm package is a serious act, and why the supply-chain warning in the modules stream is not
theoretical.</p>

<h4>Running things</h4>
<div class="codeSample" data-hl>node app.js                  run a file
node --watch app.js          re-run on save - no nodemon needed
node                         a REPL, for trying things out
node --check app.js          parse only: syntax check without running
node -e "console.log(1+1)"   evaluate an expression

// built-in modules are imported with the node: prefix, and should be:
import fs from "node:fs";    // unambiguous, and cannot be shadowed by
                             // a package called "fs" in node_modules</div>

<h4>The parts of the standard library worth knowing exist</h4>
<p><b><code>node:path</code></b> — join and resolve paths without concatenating strings, so your code works
on Windows too. <b><code>node:os</code></b> — CPU count, memory, temp directory, platform.
<b><code>node:crypto</code></b> — <code>randomUUID()</code>, hashing, HMAC, and real key operations,
unlike the browser it is available everywhere with no secure-context requirement.
<b><code>node:util</code></b> — <code>promisify</code> for wrapping old callback APIs.
<b><code>node:test</code></b> — a test runner, built in, no dependency required.</p>

<h4>Versions and LTS</h4>
<p>Node releases a new major every six months; even-numbered ones become <b>LTS</b> (long-term support) and
are what you run in production. Odd ones are for trying features. Pin the version in three places that
must agree: <code>engines</code> in <code>package.json</code>, your CI setup step, and your Docker base
image. A mismatch surfaces as a syntax error on a feature your laptop supports and the server does
not.</p>

<h4>Node, Deno and Bun</h4>
<p>You will see the alternatives mentioned. <b>Deno</b> is by Node's original author and adds
permissions-by-default and built-in TypeScript. <b>Bun</b> is a faster runtime with a bundler and test
runner included. Both are interesting; Node has the ecosystem, the LTS story and the jobs, so learn Node
first and the others transfer almost entirely.</p>`,
docs:[['Node — introduction','https://nodejs.org/en/learn/getting-started/introduction-to-nodejs'],['Node — API documentation','https://nodejs.org/api/'],['Node — releases and LTS','https://nodejs.org/en/about/previous-releases']],
ex:{title:'Where does this API live?',diff:'easy',lang:'js',
run:{call:'availableIn',cases:[
 {name:'fs is Node only',args:['fs'],expect:'node'},
 {name:'process is Node only',args:['process'],expect:'node'},
 {name:'child_process is Node only',args:['child_process'],expect:'node'},
 {name:'document is browser only',args:['document'],expect:'browser'},
 {name:'localStorage is browser only',args:['localStorage'],expect:'browser'},
 {name:'fetch is in both now',args:['fetch'],expect:'both'},
 {name:'setTimeout is in both',args:['setTimeout'],expect:'both'},
 {name:'console is in both',args:['console'],expect:'both'},
 {name:'anything unrecognised',args:['zzz'],expect:'unknown'}]},
prompt:`Write <code>function availableIn(api)</code>: <code>"fs"</code>, <code>"process"</code> and <code>"child_process"</code>&rarr;<code>"node"</code>; <code>"document"</code> and <code>"localStorage"</code>&rarr;<code>"browser"</code>; <code>"fetch"</code>, <code>"setTimeout"</code> and <code>"console"</code>&rarr;<code>"both"</code>; anything else&rarr;<code>"unknown"</code>.`,
starter:`function availableIn(api) {
  return null;
}`,
solution:`function availableIn(api) {
  switch (api) {
    case "fs":
    case "process":
    case "child_process":
      return "node";
    case "document":
    case "localStorage":
      return "browser";
    case "fetch":            // in Node since v18 - it used to be node-only
    case "setTimeout":       // in both, though Node's returns an object
    case "console":
      return "both";
    default:
      return "unknown";
  }
}`,
tests:[{d:'fs is Node',re:'"fs"'},{d:'document is the browser',re:'"document"'},{d:'fetch is in both',re:'"fetch"'},{d:'has a default',re:'default'}],
behavior:`Nine cases execute. The "both" group is the one that has changed: fetch was browser-only for a decade and has been in Node since v18, which is why older tutorials tell you to install node-fetch. setTimeout is in both but not identical — Node returns a Timeout object with .unref(), where the browser returns a number.`,
hints:['Group the cases by host and let them fall through to a shared return.','fetch is now in both runtimes, despite what older material says.','Anything you were not told about returns unknown.']}},

{id:'js39',title:'Node’s event loop, and the phases',body:`
<p>The event loop from the async stream applies here too — one thread, callbacks queued by the host — but
Node's version has <b>named phases</b>, and knowing them explains ordering that otherwise looks
arbitrary.</p>

<div class="codeSample" data-hl>each turn of the loop visits these in order:

  timers          setTimeout / setInterval callbacks whose time has come
  pending         some deferred system callbacks
  poll            RETRIEVE NEW I/O EVENTS. this is where Node waits when
                  there is nothing else to do.
  check           setImmediate callbacks
  close           'close' events (socket.on("close"), ...)

  // and BETWEEN each phase, Node drains:
  //    process.nextTick queue    (first - it beats even promises)
  //    microtask queue           (promise callbacks)</div>

<h4>The ordering rules worth remembering</h4>
<div class="codeSample" data-hl>console.log("1");
setTimeout(() =&gt; console.log("timeout"), 0);
setImmediate(() =&gt; console.log("immediate"));
process.nextTick(() =&gt; console.log("nextTick"));
Promise.resolve().then(() =&gt; console.log("promise"));
console.log("2");

// 1, 2, nextTick, promise, then timeout/immediate
//   nextTick beats promises. promises beat everything queued.
//   timeout vs immediate at the TOP LEVEL is genuinely non-deterministic
//   (it depends how long startup took). INSIDE an I/O callback,
//   setImmediate always wins, because check comes right after poll.</div>
<p><code>process.nextTick</code> jumping the queue is a Node-specific hazard: a recursive
<code>nextTick</code> starves the loop completely, and no I/O will ever be processed. Prefer
<code>queueMicrotask</code> unless you specifically need to run before promises.</p>

<h4>Blocking is worse here than in a browser</h4>
<p>A browser freezing blocks one user. <b>A Node server blocking blocks every connected client.</b> There
is one loop for all of them, so a synchronous 200ms operation on a server handling 100 requests per second
is not a slow endpoint — it is an outage.</p>
<div class="codeSample" data-hl>// the usual culprits, all of them synchronous:
fs.readFileSync(hugeFile)          // use the promises API instead
JSON.parse(veryLargeString)        // unavoidable - so bound the size
crypto.pbkdf2Sync(...)             // use the async form: it uses the
                                    // thread pool instead of the loop
a regex with catastrophic backtracking   // ReDoS - a real DoS vector
a tight loop over a million rows   // move it to a worker_thread</div>
<p>Node keeps a small <b>thread pool</b> (four threads by default, set by
<code>UV_THREADPOOL_SIZE</code>) for file I/O and some crypto, which is why the asynchronous forms of
those really do run elsewhere. Network I/O does not use the pool at all — it is genuinely
event-driven.</p>

<h4>CPU work belongs somewhere else</h4>
<p>For anything genuinely CPU-bound, use <code>worker_threads</code> (a separate thread with its own event
loop, message-passing between them) or a separate process. The rule is unchanged from the browser:
<b>asynchronous does not mean parallel</b>, and no amount of <code>async</code> makes a busy loop stop
blocking.</p>`,
docs:[['Node — the event loop','https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick'],['Node — do not block the event loop','https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop'],['Node — worker_threads','https://nodejs.org/api/worker_threads.html']],
exs:[
{title:'Order the Node queues',diff:'medium',lang:'js',
run:{call:'nodeOrder',cases:[
 {name:'nextTick beats promises, both beat timers',args:[['timeout','promise','nextTick','sync']],expect:['sync','nextTick','promise','timeout']},
 {name:'immediate runs after timers here',args:[['immediate','timeout']],expect:['timeout','immediate']},
 {name:'synchronous code always first',args:[['promise','sync','sync']],expect:['sync','sync','promise']},
 {name:'relative order is preserved within a queue',args:[['nextTick','nextTick','promise']],expect:['nextTick','nextTick','promise']},
 {name:'nothing queued',args:[[]],expect:[]}]},
prompt:`Write <code>function nodeOrder(kinds)</code> returning the labels in the order Node would run them: all <code>"sync"</code> first, then <code>"nextTick"</code>, then <code>"promise"</code>, then <code>"timeout"</code>, then <code>"immediate"</code>. Keep the original relative order within each group.`,
starter:`function nodeOrder(kinds) {
  return [];
}`,
solution:`function nodeOrder(kinds) {
  const order = ["sync", "nextTick", "promise", "timeout", "immediate"];
  return order.flatMap(k => kinds.filter(x => x === k));   // stable per group
}`,
tests:[{d:'lists the queues in priority order',re:'"nextTick"'},{d:'promises come after nextTick',re:'"promise"'},{d:'filters per group',re:'filter'},{d:'flattens the groups together',re:'flatMap|\\.\\.\\.'}],
behavior:`Five cases execute. The fourth pins stability — two nextTicks keep their order because filter preserves it. Writing this as a sort with a priority lookup also works; anything that reorders within a group does not. Note that the real timeout-vs-immediate ordering at the top level is non-deterministic, which is why this exercise fixes an order rather than pretending otherwise.`,
hints:['Put the queue names in an array in priority order.','filter each group out of the input, which preserves relative order.','flatMap joins the groups into one flat array.']},
{title:'Is this operation safe on the event loop?',diff:'hard',lang:'js',
run:{call:'auditLoop',cases:[
 {name:'a fast async read is fine',args:[[{name:'readFile',sync:false,ms:0,cpu:false}]],expect:{safe:true,offenders:[]}},
 {name:'a synchronous read blocks',args:[[{name:'readFileSync',sync:true,ms:5,cpu:false}]],expect:{safe:false,offenders:['readFileSync']}},
 {name:'CPU work blocks even when it is not sync-flagged',args:[[{name:'hashLoop',sync:false,ms:50,cpu:true}]],expect:{safe:false,offenders:['hashLoop']}},
 {name:'a long async wait is fine: it is not on the loop',args:[[{name:'httpCall',sync:false,ms:2000,cpu:false}]],expect:{safe:true,offenders:[]}},
 {name:'several offenders are all reported, in order',args:[[{name:'a',sync:true,ms:1,cpu:false},{name:'b',sync:false,ms:1,cpu:false},{name:'c',sync:false,ms:99,cpu:true}]],expect:{safe:false,offenders:['a','c']}},
 {name:'nothing to audit',args:[[]],expect:{safe:true,offenders:[]}}]},
prompt:`Write <code>function auditLoop(operations)</code> that flags anything which would block Node's event loop. An operation blocks if it is <b>synchronous</b> (<code>sync: true</code>) <b>or</b> it is CPU-bound (<code>cpu: true</code>) — regardless of how long it takes. A long <code>ms</code> on an asynchronous, non-CPU operation is <b>fine</b>, because the waiting happens off the loop. Return <code>{ safe, offenders }</code> where <code>offenders</code> lists the names in input order.`,
starter:`function auditLoop(operations) {
  return { safe: true, offenders: [] };
}`,
solution:`function auditLoop(operations) {
  const offenders = operations
    .filter(op => op.sync || op.cpu)     // duration is IRRELEVANT here
    .map(op => op.name);
  return { safe: offenders.length === 0, offenders };
}`,
tests:[{d:'flags synchronous operations',re:'op\\.sync|\\.sync'},{d:'flags CPU-bound operations',re:'op\\.cpu|\\.cpu'},{d:'combines them with OR',re:'\\|\\|'},{d:'reports whether anything was found',re:'length\\s*===\\s*0|length\\s*>\\s*0'}],
behavior:`Six cases execute, and two of them are the whole lesson. The 2000ms HTTP call is SAFE — Node hands the wait to the operating system and the loop carries on serving other requests, so duration alone tells you nothing. The 50ms CPU operation is UNSAFE despite being shorter, because it occupies the single thread for all 50ms. Any implementation that filters on ms passes the easy cases and fails both of these.`,
hints:['The test is sync OR cpu — the duration is a distraction.','A long await is not blocking; a short busy loop is.','safe is simply whether the offenders list came back empty.']}]},

{id:'js40',title:'process, configuration and the command line',body:`
<p><code>process</code> is Node's window onto the operating system: how the program was started, what
environment it is in, and how it ends.</p>

<div class="codeSample" data-hl>process.argv        ["/path/to/node", "/path/to/app.js", ...your args]
                    // the first TWO entries are always node and the script
process.env         environment variables - ALWAYS strings, or undefined
process.exit(code)  0 = success, non-zero = failure
process.cwd()       where the process was STARTED (not where the file is)
process.pid         the process id
process.platform    "darwin" | "linux" | "win32"
process.version     the Node version
process.memoryUsage()   heap and RSS, for diagnosing growth</div>

<h4>Reading arguments</h4>
<div class="codeSample" data-hl>const args = process.argv.slice(2);       // drop node and the script path

// for anything beyond one positional argument, use the built-in parser:
import { parseArgs } from "node:util";
const { values, positionals } = parseArgs({
  options: {
    port:    { type: "string",  short: "p", default: "3000" },
    verbose: { type: "boolean", short: "v" }
  },
  allowPositionals: true
});
// node app.js -p 8080 --verbose file.txt
// values.port === "8080"   values.verbose === true   positionals === ["file.txt"]</div>

<h4>Environment variables, and the two rules</h4>
<p><b>They are always strings.</b> <code>process.env.PORT</code> is <code>"3000"</code>, not
<code>3000</code>, and <code>process.env.DEBUG</code> is the string <code>"false"</code> — which is
<b>truthy</b>. That single confusion turns feature flags on in production more often than any other
mistake in this lesson.</p>
<p><b>Validate at startup, not at use.</b> Read and check every variable the program needs the moment it
boots, and exit with a clear message if something is missing. Discovering a missing database URL when the
first request arrives at 3am is strictly worse than failing to start.</p>
<div class="codeSample" data-hl>function requireEnv(name) {
  const v = process.env[name];
  if (v === undefined || v === "") {
    console.error(\`missing required environment variable: \${name}\`);
    process.exit(1);            // fail loudly, immediately, at boot
  }
  return v;
}
const DATABASE_URL = requireEnv("DATABASE_URL");   // at the top of the file</div>

<h4>Shutting down cleanly</h4>
<div class="codeSample" data-hl>process.on("SIGTERM", async () =&gt; {      // what a container orchestrator
  server.close();                        // sends first: stop accepting
  await db.close();                      // finish in-flight work
  process.exit(0);
});
process.on("SIGINT", ...);               // Ctrl-C

// process.exit() is IMMEDIATE - pending async work is abandoned, and
// buffered stdout may be lost. prefer letting the loop drain, and use
// exit() only after cleanup or on a fatal error.</div>
<p>And the two last-resort handlers from the errors stream belong here:
<code>unhandledRejection</code> and <code>uncaughtException</code> should <b>log and exit</b>. After an
uncaught exception the program's state is unknown, and continuing risks corrupting data in ways worse
than a restart.</p>`,
docs:[['Node — process','https://nodejs.org/api/process.html'],['Node — util.parseArgs','https://nodejs.org/api/util.html#utilparseargsconfig'],['The Twelve-Factor App — config','https://12factor.net/config']],
exs:[
{title:'Read a port from the environment',diff:'medium',lang:'js',
run:{call:'readPort',cases:[
 {name:'a valid port',args:[{PORT:'8080'}],expect:8080},
 {name:'missing falls back to 3000',args:[{}],expect:3000},
 {name:'an empty string falls back too',args:[{PORT:''}],expect:3000},
 {name:'non-numeric is rejected',args:[{PORT:'abc'}],expect:null},
 {name:'zero is out of range',args:[{PORT:'0'}],expect:null},
 {name:'above 65535 is out of range',args:[{PORT:'70000'}],expect:null},
 {name:'the boundary value is valid',args:[{PORT:'65535'}],expect:65535}]},
prompt:`Write <code>function readPort(env)</code> that reads <code>env.PORT</code>. Missing or empty &rarr; the number <code>3000</code>. Present but not a valid port &rarr; <code>null</code>. A valid port is a whole number from <code>1</code> to <code>65535</code> inclusive. Remember that everything in <code>env</code> is a string.`,
starter:`function readPort(env) {
  return 3000;
}`,
solution:`function readPort(env) {
  const raw = env.PORT;
  if (raw === undefined || raw === "") return 3000;   // absent: use the default
  const n = Number(raw);                               // strings, always
  if (!Number.isInteger(n) || n < 1 || n > 65535) return null;
  return n;
}`,
tests:[{d:'defaults when absent',re:'3000'},{d:'converts the string',re:'Number\\s*\\('},{d:'requires a whole number',re:'Number\\.isInteger'},{d:'checks the upper bound',re:'65535'}],
behavior:`Seven cases execute. Two are boundaries that a loose check misses: 0 is a number and a perfectly good integer, but not a usable port, and 65535 must be accepted while 70000 must not — so the comparison has to be inclusive at the top. Distinguishing "absent" (use the default) from "present but wrong" (refuse to start) is the part that matters operationally.`,
hints:['Check for absent and empty before converting — they mean "use the default".','Number.isInteger rejects both NaN and 8080.5 in one test.','The valid range is 1 to 65535 inclusive.']},
{title:'Validate the whole configuration at boot',diff:'hard',lang:'js',
run:{call:'loadConfig',cases:[
 {name:'a complete valid configuration',args:[{DATABASE_URL:'postgres://x',PORT:'8080',DEBUG:'true'}],expect:{ok:true,config:{databaseUrl:'postgres://x',port:8080,debug:true},errors:[]}},
 {name:'optional values take their defaults',args:[{DATABASE_URL:'postgres://x'}],expect:{ok:true,config:{databaseUrl:'postgres://x',port:3000,debug:false},errors:[]}},
 {name:'the string "false" must be false, not truthy',args:[{DATABASE_URL:'postgres://x',DEBUG:'false'}],expect:{ok:true,config:{databaseUrl:'postgres://x',port:3000,debug:false},errors:[]}},
 {name:'a missing required variable is reported',args:[{}],expect:{ok:false,config:null,errors:['DATABASE_URL is required']}},
 {name:'an invalid port is reported',args:[{DATABASE_URL:'postgres://x',PORT:'abc'}],expect:{ok:false,config:null,errors:['PORT must be a number between 1 and 65535']}},
 {name:'every problem is reported at once, in order',args:[{PORT:'0'}],expect:{ok:false,config:null,errors:['DATABASE_URL is required','PORT must be a number between 1 and 65535']}}]},
prompt:`Write <code>function loadConfig(env)</code> that validates the whole environment at once and returns <code>{ ok, config, errors }</code>. <code>DATABASE_URL</code> is required (missing or empty &rarr; <code>"DATABASE_URL is required"</code>). <code>PORT</code> defaults to <code>3000</code> and must be an integer from 1 to 65535 (&rarr; <code>"PORT must be a number between 1 and 65535"</code>). <code>DEBUG</code> defaults to <code>false</code> and is <code>true</code> <b>only</b> for the exact string <code>"true"</code>. Report <b>every</b> problem, in the order above; when there are any, <code>config</code> is <code>null</code>.`,
starter:`function loadConfig(env) {
  return { ok: true, config: null, errors: [] };
}`,
solution:`function loadConfig(env) {
  const errors = [];

  const databaseUrl = env.DATABASE_URL;
  if (databaseUrl === undefined || databaseUrl === "") {
    errors.push("DATABASE_URL is required");
  }

  let port = 3000;
  if (env.PORT !== undefined && env.PORT !== "") {
    const n = Number(env.PORT);
    if (!Number.isInteger(n) || n < 1 || n > 65535) {
      errors.push("PORT must be a number between 1 and 65535");
    } else {
      port = n;
    }
  }

  const debug = env.DEBUG === "true";   // ONLY the exact string is true

  if (errors.length > 0) return { ok: false, config: null, errors };
  return { ok: true, config: { databaseUrl, port, debug }, errors: [] };
}`,
tests:[{d:'collects errors rather than throwing on the first',re:'errors\\.push'},{d:'requires the database url',re:'DATABASE_URL'},{d:'validates the port range',re:'65535'},{d:'compares DEBUG to the exact string',re:'===\\s*"true"'},{d:'returns null config on failure',re:'config:\\s*null'}],
behavior:`Six cases execute, and three of them separate a real implementation from a plausible one. The string "false" is truthy, so writing debug as Boolean(env.DEBUG) turns debugging on in production — the third case catches exactly that. The last case requires collecting ALL errors rather than returning at the first: an operator restarting a service wants one message listing everything wrong, not six deploys each revealing the next problem. And a valid default port must survive an unrelated failure elsewhere.`,
hints:['Accumulate into an errors array instead of returning early — you want every problem at once.','DEBUG is true only when it is exactly the string "true"; every other string is false.','Apply the PORT default when the variable is absent, and validate it only when it is present.']}]}
,

{id:'jsemit',title:'EventEmitter: the pattern under everything',body:`
<p>Nearly every object you meet in Node — servers, sockets, streams, <code>process</code> itself — is an
<b>EventEmitter</b>. It is the third async shape after callbacks and promises, and it exists because some
things are not one result but <b>many occurrences</b>: a request arrives, then another, then another. A
promise can settle once; an emitter can fire forever.</p>

<h4>The mechanics</h4>
<div class="codeSample" data-hl>import { EventEmitter } from "node:events";
const bus = new EventEmitter();

bus.on("order", (id) =&gt; console.log("ship", id));     // subscribe
bus.on("order", (id) =&gt; console.log("email", id));    // more than one is fine
bus.once("boot", () =&gt; console.log("first time only"));

bus.emit("order", 42);       // calls BOTH listeners, in registration order,
                             // SYNCHRONOUSLY - emit returns after they ran
bus.off("order", handler);   // unsubscribe needs the SAME function reference</div>
<p>Two details there bite people. <code>emit</code> is synchronous — the listeners have all run before the
next line. And <code>off</code> compares by reference, so an anonymous arrow you did not save cannot be
removed later.</p>

<h4>The "error" event is special</h4>
<div class="codeSample" data-hl>const em = new EventEmitter();
em.emit("error", new Error("boom"));
// no "error" listener registered? Node THROWS and your process crashes.
// this is deliberate: an error nobody is listening for should not
// vanish. every long-lived emitter needs:
em.on("error", (err) =&gt; log.error({ err }, "stream failed"));</div>

<h4>The leak the warning is about</h4>
<div class="codeSample" data-hl>// MaxListenersExceededWarning: 11 order listeners added
server.on("request", (req, res) =&gt; {
  bus.on("tick", () =&gt; { ... });   // a NEW listener per request,
});                                 // never removed - the classic leak

// three honest fixes:
res.on("close", () =&gt; bus.off("tick", handler));   // remove when done
bus.once("tick", handler);                          // if once is the truth
bus.on("tick", handler, { signal });                // AbortController cleanup</div>
<p>This is the listener leak the profiling lesson's heap snapshots keep finding: the emitter holds a
reference to every listener, the listener's closure holds whatever it captured, and none of it can be
collected while the subscription lives. Subscribing is <i>allocating</i>; treat it like something that
needs a matching release.</p>

<h4>What it is underneath</h4>
<p>Strip the class away and an emitter is a map from event names to arrays of functions — <code>on</code>
pushes, <code>emit</code> loops, <code>off</code> filters, <code>once</code> removes after the first call.
The exercise has you build exactly that, because having built one, no emitter behavior will surprise you
again.</p>`,
docs:[['Node — events','https://nodejs.org/api/events.html'],['Node — EventEmitter class','https://nodejs.org/api/events.html#class-eventemitter'],['Node — events best practices','https://nodejs.org/en/learn/asynchronous-work/the-nodejs-event-emitter']],
ex:{title:'Build a tiny emitter',diff:'hard',lang:'js',
run:{call:'runEvents',cases:[
 {name:'a listener fires on every emit',args:[[['on','greet','A'],['emit','greet','hi'],['emit','greet','yo']]],expect:['A:hi','A:yo']},
 {name:'once fires a single time',args:[[['once','boot','B'],['emit','boot','1'],['emit','boot','2']]],expect:['B:1']},
 {name:'off removes the listener',args:[[['on','tick','C'],['emit','tick','1'],['off','tick','C'],['emit','tick','2']]],expect:['C:1']},
 {name:'listeners fire in registration order',args:[[['on','order','ship'],['on','order','email'],['emit','order','42']]],expect:['ship:42','email:42']},
 {name:'emitting into silence does nothing',args:[[['emit','ghost','boo'],['on','ghost','D'],['emit','ghost','ok']]],expect:['D:ok']},
 {name:'on and once coexist on one event',args:[[['on','msg','keep'],['once','msg','drop'],['emit','msg','a'],['emit','msg','b']]],expect:['keep:a','drop:a','keep:b']}]},
prompt:`Write <code>function runEvents(script)</code>: a tiny emitter driven by a script of operations. Each entry is <code>['on', event, label]</code>, <code>['once', event, label]</code>, <code>['off', event, label]</code> or <code>['emit', event, payload]</code>. On emit, every listener for that event fires <b>in registration order</b>, appending <code>label + ":" + payload</code> to a log; <code>once</code> listeners are removed after firing; <code>off</code> removes all listeners with that label. Return the log.`,
starter:`function runEvents(script) {
  const listeners = {};   // event -> array of { label, once }
  const log = [];
  for (const [op, event, arg] of script) {
    // handle on / once / off / emit
  }
  return log;
}`,
solution:`function runEvents(script) {
  const listeners = {};                  // event -> [{ label, once }]
  const log = [];
  for (const [op, event, arg] of script) {
    if (op === "on")   (listeners[event] ||= []).push({ label: arg, once: false });
    if (op === "once") (listeners[event] ||= []).push({ label: arg, once: true });
    if (op === "off")  listeners[event] = (listeners[event] || []).filter(l => l.label !== arg);
    if (op === "emit") {
      const current = listeners[event] || [];   // snapshot, like Node does
      for (const l of current) log.push(l.label + ":" + arg);
      listeners[event] = current.filter(l => !l.once);
    }
  }
  return log;
}`,
tests:[{d:'keeps listeners per event name',re:'listeners\\[event\\]'},{d:'once listeners carry a flag',re:'once'},{d:'off filters by label',re:'\\.filter\\('},{d:'emit walks listeners in order',re:'for\\s*\\(.*of\\s'}],
behavior:`Six cases execute the contract Node's real emitter keeps: registration order is preserved, once-listeners survive exactly one emit, off removes without disturbing the others, and emitting with no listeners is silently fine. The solution snapshots the listener array before looping — the same choice Node makes, so a listener added during an emit does not fire in that same emit.`,
hints:['Store { label, once } records so once and on share one array.','After an emit, filter out the listeners whose once flag is set.','off filters by label; emit into a missing event should touch nothing.']}}


]});
