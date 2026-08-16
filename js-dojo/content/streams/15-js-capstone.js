STREAMS.push({icon:'⛩️',project:true,title:'JavaScript Capstone',blurb:'Build and debug a real service end to end. Every component here uses something from an earlier stream — coercion, closures, the event loop, error handling, validation, HTTP semantics and diagnosis — and each one is graded by running your code against the cases that catch a plausible-but-wrong implementation.',lessons:[

{id:'jscap',title:'Capstone: build a link-shortener service',body:`
<p>This capstone builds one service, component by component, and each exercise is graded on its own. The
brief is deliberately small — a link shortener — because the interesting work is not the feature, it is
everything around it: validating input you did not write, handling the cases that only appear under load,
and being able to say what is wrong when it misbehaves.</p>

<div class="codeSample" data-hl>POST /links   { url }        -> { code, shortUrl }   201
GET  /:code                 -> 302 to the original URL
GET  /links/:code/stats     -> { code, url, hits, createdAt }
                            -> 404 when the code is unknown
                            -> 410 when the link has expired</div>

<h4>What you will build</h4>
<p><b>1. A URL validator.</b> Accept only <code>http</code> and <code>https</code>, reject anything else —
including <code>javascript:</code>, which is how a link shortener becomes an XSS delivery service.</p>
<p><b>2. A code generator and store</b>, using a closure so the store cannot be reached from outside.</p>
<p><b>3. A rate limiter</b> over a sliding window, so one client cannot fill your database.</p>
<p><b>4. A request router</b> returning the right status for every case, including the ones people
collapse together.</p>
<p><b>5. A diagnosis routine</b> for when it is slow in production.</p>

<h4>The decisions worth making deliberately</h4>
<ul>
<li><b>What counts as a valid URL.</b> A blocklist of dangerous schemes loses; an allowlist of two
schemes wins. This is the same argument as path traversal in the files stream.</li>
<li><b>Where the state lives.</b> A closure gives you real privacy; a module-level variable gives you a
shared mutable global that every test then has to reset.</li>
<li><b>What happens under contention.</b> Two requests arriving in the same millisecond, a code that
collides, a limit hit exactly on its boundary — these are where the off-by-one errors live.</li>
<li><b>What each failure returns.</b> 404 and 410 are different facts about a link, and a client can act
on the difference.</li>
</ul>

<h4>Running it for real</h4>
<div class="codeSample" data-hl>mkdir shortener && cd shortener
npm init -y
npm pkg set type=module
node --watch server.js          # no dependencies needed for any of this
node --test                     # the built-in runner, once you add tests

# then, from the debugging streams:
node --inspect server.js        # breakpoints in your handlers
# and the Network panel to watch the 302 actually redirect</div>
<p>The exercises below give you each piece with its edge cases pinned. Assembling them into a running
server — with the <code>http</code> module from the HTTP stream, the config validation from the Node
runtime stream and the structured logging from the testing stream — is the part worth doing on your own
machine.</p>`,
docs:[['Node — http server','https://nodejs.org/api/http.html'],['MDN — URL','https://developer.mozilla.org/en-US/docs/Web/API/URL'],['MDN — 302 vs 301','https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/302'],['OWASP — unvalidated redirects','https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html']],
exs:[
{title:'1. Validate a submitted URL',diff:'medium',lang:'js',
run:{call:'validUrl',cases:[
 {name:'https is allowed',args:['https://example.com/a'],expect:true},
 {name:'http is allowed',args:['http://example.com'],expect:true},
 {name:'javascript: is refused',args:['javascript:alert(1)'],expect:false},
 {name:'data: is refused',args:['data:text/html,<scr'+'ipt>alert(1)</scr'+'ipt>'],expect:false},
 {name:'file: is refused',args:['file:///etc/passwd'],expect:false},
 {name:'a relative path is not a URL',args:['/just/a/path'],expect:false},
 {name:'nonsense is refused',args:['not a url at all'],expect:false},
 {name:'an empty string is refused',args:[''],expect:false},
 {name:'the scheme is matched case-insensitively',args:['HTTPS://example.com'],expect:true}]},
prompt:`Write <code>function validUrl(input)</code> returning <code>true</code> only for absolute <code>http</code> or <code>https</code> URLs. Parse with <code>new URL(input)</code> inside a <code>try</code>/<code>catch</code> — it throws on anything unparseable — and check <code>protocol</code> against an <b>allowlist</b>. Note that <code>protocol</code> includes the colon and is already lower-cased by the parser.`,
starter:`function validUrl(input) {
  return false;
}`,
solution:`function validUrl(input) {
  let url;
  try {
    url = new URL(input);          // throws on relative paths and nonsense
  } catch {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";   // ALLOWLIST
}`,
tests:[{d:'parses with the URL constructor',re:'new\\s+URL'},{d:'guards against unparseable input',re:'catch'},{d:'allows only http and https',re:'"https:"'},{d:'does not blocklist schemes',re:'javascript',not:true}],
behavior:`Nine cases execute. Three of them are the security point: javascript:, data: and file: all parse successfully as URLs, so a check that only asks "did this parse?" lets every one of them through — and a link shortener that stores a javascript: URL and later renders it as a href has become an XSS delivery service. The allowlist is what makes those three fail without naming them. The last case relies on the parser lower-casing the scheme for you, which is why "HTTPS://" works without extra code.`,
hints:['new URL throws on invalid input, so wrap it in try/catch and return false from the catch.','url.protocol includes the trailing colon: compare against "https:" not "https".','Allow the two schemes you want rather than blocking the ones you can think of.']},
{title:'2. Generate codes and store links privately',diff:'hard',lang:'js',
run:{call:'runStore',cases:[
 {name:'saving returns sequential codes',args:[[['save','https://a.com'],['save','https://b.com']],10],expect:{results:['a','b'],size:2}},
 {name:'the same URL saved twice reuses its code',args:[[['save','https://a.com'],['save','https://a.com']],10],expect:{results:['a','a'],size:1}},
 {name:'looking up a known code returns the URL',args:[[['save','https://a.com'],['get','a']],10],expect:{results:['a','https://a.com'],size:1}},
 {name:'an unknown code returns null',args:[[['get','zz']],10],expect:{results:[null],size:0}},
 {name:'the store refuses to grow past its capacity',args:[[['save','https://a.com'],['save','https://b.com'],['save','https://c.com']],2],expect:{results:['a','b',null],size:2}},
 {name:'no operations',args:[[],10],expect:{results:[],size:0}}]},
prompt:`Write <code>function makeStore(capacity)</code> returning <code>{ save, get, size }</code>, holding its data in a closure. <code>save(url)</code> returns a code — <code>"a"</code>, <code>"b"</code>, <code>"c"</code>… in order — but returns the <b>existing</b> code if that URL was already saved, and <code>null</code> when the store is already at <code>capacity</code>. <code>get(code)</code> returns the URL or <code>null</code>. <code>size()</code> returns the count. Then write <code>function runStore(ops, capacity)</code> that creates one store, applies each <code>["save", url]</code> or <code>["get", code]</code>, and returns <code>{ results, size }</code>.`,
starter:`function makeStore(capacity) {
  return { save: null, get: null, size: null };
}
function runStore(ops, capacity) {
  return { results: [], size: 0 };
}`,
solution:`function makeStore(capacity) {
  const byCode = new Map();        // code -> url
  const byUrl = new Map();         // url  -> code   (so we can dedupe)
  let next = 0;

  function save(url) {
    if (byUrl.has(url)) return byUrl.get(url);      // dedupe BEFORE capacity
    if (byCode.size >= capacity) return null;        // full: refuse
    const code = String.fromCharCode(97 + next);     // 97 is "a"
    next++;
    byCode.set(code, url);
    byUrl.set(url, code);
    return code;
  }
  function get(code) {
    return byCode.has(code) ? byCode.get(code) : null;
  }
  return { save, get, size: () => byCode.size };
}

function runStore(ops, capacity) {
  const store = makeStore(capacity);
  const results = [];
  for (const [op, arg] of ops) {
    results.push(op === "save" ? store.save(arg) : store.get(arg));
  }
  return { results, size: store.size() };
}`,
tests:[{d:'keeps the data in the closure',re:'new\\s+Map|const\\s+\\w+\\s*=\\s*\\{\\}'},{d:'deduplicates by url',re:'byUrl|has\\('},{d:'refuses to exceed capacity',re:'>=\\s*capacity'},{d:'creates one store',re:'makeStore\\('}],
behavior:`Six scenarios run your store through runStore, so the closure, the dedupe, the capacity check and the getter all have to work together. Two cases decide the implementation. The dedupe must be checked BEFORE capacity — otherwise a full store refuses to return a code it already has, which is a bug a user sees as "my link stopped working". And get on an unknown code must return null rather than undefined, which is why has() is used rather than a truthy check on the result. Both maps are unreachable from outside, which is what the closure buys you over a module-level variable.`,
hints:['Two maps: one code-to-url for lookups, one url-to-code so you can detect a repeat.','Check for an existing URL before checking capacity — a repeat does not add anything.','String.fromCharCode(97 + n) gives you "a", "b", "c" in order.']},
{title:'3. Rate limit with a sliding window',diff:'hard',lang:'js',
run:{call:'rateLimit',cases:[
 {name:'under the limit, everything is allowed',args:[[0,1,2],3,10],expect:[true,true,true]},
 {name:'the request that exceeds the limit is refused',args:[[0,1,2,3],3,10],expect:[true,true,true,false]},
 {name:'an old request falls out of the window',args:[[0,1,2,11],3,10],expect:[true,true,true,true]},
 {name:'a refused request does not consume a slot',args:[[0,0,0,0,11],3,10],expect:[true,true,true,false,true]},
 {name:'exactly at the window edge is still inside it',args:[[0,1,2,10],3,10],expect:[true,true,true,false]},
 {name:'a limit of zero refuses everything',args:[[0,1],0,10],expect:[false,false]},
 {name:'no requests',args:[[],3,10],expect:[]}]},
prompt:`Write <code>function rateLimit(timestamps, limit, windowMs)</code> deciding each request in order. A request at time <code>t</code> is allowed when <b>fewer than</b> <code>limit</code> previously-<b>allowed</b> requests fall inside the window — that is, have a timestamp <code>&gt; t - windowMs</code>. Return an array of booleans. A refused request must <b>not</b> be recorded, or one burst locks a client out far longer than the window.`,
starter:`function rateLimit(timestamps, limit, windowMs) {
  return [];
}`,
solution:`function rateLimit(timestamps, limit, windowMs) {
  const allowed = [];      // timestamps of requests we LET THROUGH
  const out = [];

  for (const t of timestamps) {
    const cutoff = t - windowMs;
    const inWindow = allowed.filter(a => a >= cutoff);  // window edge is INSIDE
    if (inWindow.length < limit) {
      allowed.push(t);                                   // record only successes
      out.push(true);
    } else {
      out.push(false);
    }
  }
  return out;
}`,
tests:[{d:'slides the window relative to each request',re:'-\\s*windowMs'},{d:'compares against the limit',re:'<\\s*limit'},{d:'records only allowed requests',re:'allowed\\.push'}],
behavior:`Seven cases execute and three are boundaries that decide correctness. In case 4 a client bursts four requests at time 0; the fourth is refused and must NOT be recorded, so the request at 11 is allowed — recording refusals is how a rate limiter turns a brief burst into a much longer lockout. Case 5 pins the window edge: a request at exactly t - windowMs is still inside it, so the comparison is strictly greater than the cutoff. And a limit of 0 must refuse everything rather than dividing by anything or allowing one through.`,
hints:['For each request, filter the recorded timestamps down to those still inside its window.','Allowed when the count in the window is strictly less than the limit.','Push the timestamp only when you allowed it.']},
{title:'4. Route a request to the right status',diff:'hard',lang:'js',
run:{call:'handle',cases:[
 {name:'creating a link returns 201 with a Location header',args:[{method:'POST',path:'/links',url:'https://a.com',known:false,expired:false,limited:false}],expect:{status:201,location:'/abc'}},
 {name:'an invalid url is 422, not 400',args:[{method:'POST',path:'/links',url:'javascript:alert(1)',known:false,expired:false,limited:false}],expect:{status:422,location:null}},
 {name:'rate limiting is checked before anything about the body',args:[{method:'POST',path:'/links',url:'javascript:alert(1)',known:false,expired:false,limited:true}],expect:{status:429,location:null}},
 {name:'following a known link redirects',args:[{method:'GET',path:'/abc',url:'https://a.com',known:true,expired:false,limited:false}],expect:{status:302,location:'https://a.com'}},
 {name:'an unknown code is 404',args:[{method:'GET',path:'/zzz',url:null,known:false,expired:false,limited:false}],expect:{status:404,location:null}},
 {name:'an expired link is 410, not 404',args:[{method:'GET',path:'/abc',url:'https://a.com',known:true,expired:true,limited:false}],expect:{status:410,location:null}},
 {name:'the wrong method on a known path is 405',args:[{method:'DELETE',path:'/links',url:null,known:false,expired:false,limited:false}],expect:{status:405,location:null}}]},
prompt:`Write <code>function handle(req)</code> returning <code>{ status, location }</code>, checking in this order. <code>limited</code> &rarr; <code>429</code>. Then, for <code>POST /links</code>: an invalid <code>url</code> (anything not starting <code>http://</code> or <code>https://</code>) &rarr; <code>422</code>, otherwise <code>201</code> with <code>location: "/abc"</code>. For any other <code>POST</code> or <code>DELETE</code> to <code>/links</code> &rarr; <code>405</code>. For a <code>GET</code> to any other path: not <code>known</code> &rarr; <code>404</code>; <code>expired</code> &rarr; <code>410</code>; otherwise <code>302</code> with <code>location</code> set to the target URL. <code>location</code> is <code>null</code> on every other response.`,
starter:`function handle(req) {
  return { status: 404, location: null };
}`,
solution:`function handle(req) {
  if (req.limited) return { status: 429, location: null };   // cheapest check first

  if (req.path === "/links") {
    if (req.method !== "POST") return { status: 405, location: null };
    const ok = req.url != null &&
      (req.url.startsWith("http://") || req.url.startsWith("https://"));
    return ok ? { status: 201, location: "/abc" }
              : { status: 422, location: null };
  }

  if (req.method === "GET") {
    if (!req.known) return { status: 404, location: null };   // 404 BEFORE 410
    if (req.expired) return { status: 410, location: null };
    return { status: 302, location: req.url };
  }
  return { status: 405, location: null };
}`,
tests:[{d:'rate limiting is checked first',re:'limited'},{d:'an invalid url is unprocessable',re:'422'},{d:'a known link redirects',re:'302'},{d:'an unknown code is not found',re:'404'},{d:'an expired link is gone',re:'410'}],
behavior:`Seven cases execute and two pin the ordering. Case 3 sends an invalid URL from a rate-limited client and must return 429: you refuse the request before spending anything on parsing it, which is the entire point of a rate limit. And the 404-before-410 order matters because "expired" is only meaningful for a code that exists — reporting 410 for an unknown code tells an attacker which codes are real. The 404-vs-410 distinction carries real information: 404 means never existed, 410 means existed and is deliberately gone, and a client can stop retrying on the second.`,
hints:['The rate limit is the first check — it should cost nothing to refuse.','Handle the /links path separately from the redirect paths.','Check known before expired: expiry is only a fact about a link that exists.']},
{title:'5. Diagnose it in production',diff:'hard',lang:'js',
run:{call:'triageService',cases:[
 {name:'a blocked loop explains everything else',args:[{loopLagMs:350,error5xxRate:0.4,heapTrend:'rising',redirectLatencyMs:900,limitRejectRate:0.1}],expect:{cause:'blocked event loop',action:'CPU profile the redirect path'}},
 {name:'a rising heap with a healthy loop is a leak',args:[{loopLagMs:5,error5xxRate:0.0,heapTrend:'rising',redirectLatencyMs:20,limitRejectRate:0.1}],expect:{cause:'memory leak',action:'compare two heap snapshots'}},
 {name:'mass rejections mean the limit is too tight',args:[{loopLagMs:5,error5xxRate:0.0,heapTrend:'flat',redirectLatencyMs:20,limitRejectRate:0.6}],expect:{cause:'rate limit too tight',action:'raise the limit or widen the window'}},
 {name:'errors without any of the above need the logs',args:[{loopLagMs:5,error5xxRate:0.3,heapTrend:'flat',redirectLatencyMs:20,limitRejectRate:0.1}],expect:{cause:'application errors',action:'read the 5xx logs by request id'}},
 {name:'a leak is diagnosed before mass rejections',args:[{loopLagMs:5,error5xxRate:0.0,heapTrend:'rising',redirectLatencyMs:20,limitRejectRate:0.9}],expect:{cause:'memory leak',action:'compare two heap snapshots'}},
 {name:'everything healthy',args:[{loopLagMs:5,error5xxRate:0.0,heapTrend:'flat',redirectLatencyMs:20,limitRejectRate:0.1}],expect:{cause:'healthy',action:'no action'}}]},
prompt:`Write <code>function triageService(m)</code> returning <code>{ cause, action }</code> from live metrics, in this order. <code>loopLagMs</code> above 100 &rarr; <code>"blocked event loop"</code> / <code>"CPU profile the redirect path"</code>. Then <code>heapTrend</code> of <code>"rising"</code> &rarr; <code>"memory leak"</code> / <code>"compare two heap snapshots"</code>. Then <code>limitRejectRate</code> above 0.5 &rarr; <code>"rate limit too tight"</code> / <code>"raise the limit or widen the window"</code>. Then <code>error5xxRate</code> above 0.1 &rarr; <code>"application errors"</code> / <code>"read the 5xx logs by request id"</code>. Otherwise <code>"healthy"</code> / <code>"no action"</code>.`,
starter:`function triageService(m) {
  return { cause: null, action: null };
}`,
solution:`function triageService(m) {
  if (m.loopLagMs > 100) {
    return { cause: "blocked event loop", action: "CPU profile the redirect path" };
  }
  if (m.heapTrend === "rising") {
    return { cause: "memory leak", action: "compare two heap snapshots" };
  }
  if (m.limitRejectRate > 0.5) {
    return { cause: "rate limit too tight",
             action: "raise the limit or widen the window" };
  }
  if (m.error5xxRate > 0.1) {
    return { cause: "application errors",
             action: "read the 5xx logs by request id" };
  }
  return { cause: "healthy", action: "no action" };
}`,
tests:[{d:'loop lag is checked first',re:'loopLagMs\\s*>\\s*100'},{d:'then the heap trend',re:'"rising"'},{d:'then the rejection rate',re:'limitRejectRate\\s*>\\s*0\\.5'},{d:'then the error rate',re:'error5xxRate\\s*>\\s*0\\.1'},{d:'otherwise healthy',re:'"healthy"'}],
behavior:`Six cases execute and two exist to pin the ordering, which is the actual lesson of the whole capstone. Case 1 has four metrics simultaneously bad and must return "blocked event loop", because a blocked loop inflates latency, error rates and rejections all at once — chasing any of those first means fixing a symptom. Case 5 puts a leak against mass rejections and the leak wins, because unbounded growth eventually produces the rest. Diagnosis is an ordered list of causes, not a scoring function, and getting the order right is what turns a two-day outage into a twenty-minute one.`,
hints:['Guard clauses in the stated order — the first match wins and you return immediately.','A blocked event loop distorts every other metric, so it must be checked before them.','The final return is the healthy case, not a guess.']}]}

]});
