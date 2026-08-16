STREAMS.push({icon:'🌐',title:'Building an HTTP Server',blurb:'From the raw http module to a real service: handling a request and writing a response, routing and middleware, reading a JSON body safely, validating input, status codes and error contracts, authentication, and the security headers that belong on every response.',lessons:[

{id:'js44',title:'The http module: request in, response out',body:`
<p>Node ships a web server in its standard library. Frameworks are convenience on top of it, and seeing
the raw version once makes every framework legible afterwards.</p>

<div class="codeSample" data-hl>import { createServer } from "node:http";

const server = createServer((req, res) =&gt; {
  // req: an incoming message. a READABLE STREAM, plus metadata.
  //   req.method   "GET"
  //   req.url      "/users?active=1"   PATH AND QUERY ONLY - not the host
  //   req.headers  lowercased keys, always
  //
  // res: a WRITABLE STREAM you must finish, or the client hangs forever.
  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify({ ok: true }));
});

server.listen(3000, () =&gt; console.log("listening on 3000"));</div>

<h4>Three facts that explain most beginner bugs</h4>
<p><b>You must call <code>res.end()</code>.</b> Exactly once, on every path. Miss it on an error branch and
that request hangs until the client times out — and the connection stays open, so enough of them exhaust
your server. Call it twice and Node throws <code>ERR_STREAM_WRITE_AFTER_END</code>.</p>
<p><b>Headers must be written before the body.</b> Once any body byte is sent the headers are gone, and
<code>writeHead</code> throws <code>ERR_HTTP_HEADERS_SENT</code>. This is why error handling has to check
<code>res.headersSent</code> before trying to send a 500.</p>
<p><b><code>req.url</code> is not a full URL.</b> It is the path and query only. Parse it properly rather
than splitting strings:</p>
<div class="codeSample" data-hl>const url = new URL(req.url, \`http://\${req.headers.host}\`);
url.pathname                      // "/users"
url.searchParams.get("active")    // "1"   - a STRING, or null
url.searchParams.getAll("tag")    // ["a","b"] for ?tag=a&tag=b

// splitting on "?" yourself breaks on encoded characters, repeated
// parameters, and empty values. URL handles all of it.</div>

<h4>The body arrives in pieces</h4>
<div class="codeSample" data-hl>// req is a stream, so the body is NOT available when the handler starts
async function readBody(req, limitBytes = 1_000_000) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total &gt; limitBytes) throw new Error("payload too large");  // BOUND IT
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}
// the size limit is not optional. without it, one client can send an
// endless body and exhaust your memory - and it costs them nothing.</div>

<h4>Sending a response properly</h4>
<div class="codeSample" data-hl>function json(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body)   // BYTES, not characters
  });
  res.end(body);
}
// Buffer.byteLength matters: "héllo".length is 5 but its UTF-8 length is
// 6, and a wrong content-length truncates the response.</div>

<h4>When to use a framework</h4>
<p>Express, Fastify and Hono give you routing, body parsing, middleware and error handling that you would
otherwise write and get subtly wrong. Use one for real work. Write the raw version once so that when the
framework misbehaves you know what it is doing underneath — which is the same argument as learning
prototypes before classes.</p>`,
docs:[['Node — http','https://nodejs.org/api/http.html'],['MDN — URL','https://developer.mozilla.org/en-US/docs/Web/API/URL'],['Node — anatomy of an HTTP transaction','https://nodejs.org/en/learn/modules/anatomy-of-an-http-transaction']],
exs:[
{title:'Parse the request line',diff:'easy',lang:'js',
run:{call:'routeKey',cases:[
 {name:'a simple path',args:['GET','/users'],expect:'GET /users'},
 {name:'the query string is not part of the route',args:['GET','/users?active=1'],expect:'GET /users'},
 {name:'a trailing slash is normalised away',args:['GET','/users/'],expect:'GET /users'},
 {name:'the root path keeps its slash',args:['GET','/'],expect:'GET /'},
 {name:'the method is upper-cased',args:['post','/users'],expect:'POST /users'},
 {name:'a hash fragment never reaches the server, but is stripped anyway',args:['GET','/users#top'],expect:'GET /users'}]},
prompt:`Write <code>function routeKey(method, url)</code> returning <code>"METHOD /path"</code>. Upper-case the method, drop any query string and hash, and remove a trailing slash — except on the root path <code>"/"</code>, which keeps it.`,
starter:`function routeKey(method, url) {
  return null;
}`,
solution:`function routeKey(method, url) {
  let path = url.split("?")[0].split("#")[0];       // strip query and hash
  if (path.length > 1 && path.endsWith("/")) {      // NOT the root
    path = path.slice(0, -1);
  }
  return method.toUpperCase() + " " + path;
}`,
tests:[{d:'strips the query string',re:'split\\s*\\(\\s*"\\?"'},{d:'upper-cases the method',re:'toUpperCase'},{d:'protects the root path',re:'length\\s*>\\s*1'}],
behavior:`Six cases execute, and the root-path case is the one that catches a naive trailing-slash strip: removing it unconditionally turns "/" into "", which then matches no route at all. Note that a real router should use the URL class rather than splitting strings — this exercise splits so the pieces are visible.`,
hints:['Split off the query first, then the hash.','Only remove a trailing slash when the path is longer than one character.','Concatenate the upper-cased method, a space, and the path.']},
{title:'Bound the request body',diff:'medium',lang:'js',
run:{call:'acceptBody',cases:[
 {name:'a small body is accepted',args:[[10,20],1000],expect:{ok:true,bytes:30}},
 {name:'exactly at the limit is accepted',args:[[500,500],1000],expect:{ok:true,bytes:1000}},
 {name:'one byte over is refused',args:[[500,501],1000],expect:{ok:false,bytes:1001}},
 {name:'it refuses as soon as the limit is passed, not at the end',args:[[2000,2000,2000],1000],expect:{ok:false,bytes:2000}},
 {name:'an empty body is fine',args:[[],1000],expect:{ok:true,bytes:0}}]},
prompt:`Write <code>function acceptBody(chunkSizes, limitBytes)</code> that accumulates chunk sizes and stops <b>as soon as</b> the running total exceeds <code>limitBytes</code>. Return <code>{ ok, bytes }</code> where <code>bytes</code> is the total counted at the moment you stopped. A total exactly equal to the limit is accepted.`,
starter:`function acceptBody(chunkSizes, limitBytes) {
  return { ok: true, bytes: 0 };
}`,
solution:`function acceptBody(chunkSizes, limitBytes) {
  let bytes = 0;
  for (const size of chunkSizes) {
    bytes += size;
    if (bytes > limitBytes) return { ok: false, bytes };   // stop IMMEDIATELY
  }
  return { ok: true, bytes };
}`,
tests:[{d:'accumulates the running total',re:'bytes\\s*\\+='},{d:'compares strictly greater than the limit',re:'>\\s*limitBytes'},{d:'returns early on refusal',re:'return\\s*\\{\\s*ok:\\s*false'}],
behavior:`Five cases execute. The fourth is the security point: a client sending three 2000-byte chunks must be cut off after the first, reporting 2000 rather than 6000 — summing everything and checking at the end means you already buffered the whole attack payload. The boundary cases pin that exactly-at-the-limit is accepted and one byte over is not.`,
hints:['Check the total inside the loop, after each addition.','Return as soon as the limit is exceeded — do not finish the loop.','Exactly equal to the limit is still acceptable, so compare with >.']}]},

{id:'js45',title:'Routing, middleware and validation',body:`
<p>A real server does the same handful of things on every request: work out which handler to run, do the
cross-cutting work around it, and refuse input that does not meet its contract.</p>

<h4>Routing</h4>
<div class="codeSample" data-hl>const routes = new Map([
  ["GET /health",  () =&gt; ({ status: 200, body: { ok: true } })],
  ["GET /users",   listUsers],
  ["POST /users",  createUser]
]);

const handler = routes.get(\`\${req.method} \${pathname}\`);
if (!handler) return json(res, 404, { error: "not found" });

// method-vs-path matters for the right status:
//   path unknown          -> 404 Not Found
//   path known, method not -> 405 Method Not Allowed, plus an Allow header
// returning 404 for a wrong method hides a client bug that 405 explains.</div>
<p>Parameterised routes (<code>/users/:id</code>) are where a hand-rolled router starts costing more than
it saves. That is the point to adopt a framework.</p>

<h4>Middleware</h4>
<p>Middleware is the chain-of-responsibility pattern applied to requests: each function receives the
request, may act, and either passes control on or ends the response. Order is the whole design.</p>
<div class="codeSample" data-hl>request
  -> request id        (so every log line can be correlated)
  -> logging           (start timing here, so it measures everything)
  -> security headers
  -> CORS              (must precede auth: a preflight carries no credentials)
  -> body parsing      (with the size limit from the last lesson)
  -> authentication    WHO are you
  -> authorization     MAY you do this
  -> the route handler
  -> error handler     (LAST, and it catches what everything above threw)</div>
<p>Two ordering mistakes are common and both are security bugs: putting authentication after the route
handler (it never runs), and putting CORS after authentication (preflight requests get rejected, so the
browser never sends the real request and you debug the wrong thing).</p>

<h4>Validating input</h4>
<p><b>Validate at the boundary, once, and reject early.</b> Past the handler's first few lines, the rest
of your code should be able to assume the input is well-formed.</p>
<div class="codeSample" data-hl>// what "valid" has to cover, and each is a real bug when skipped:
//   PRESENT     the field exists at all
//   TYPE        a number is a number, not the string "12"
//   SHAPE       an array is an array, an object is not an array
//   RANGE       a page size of 1000000 is a denial of service
//   EXTRA       unknown fields REJECTED, not ignored - otherwise a client
//               can set { role: "admin" } and hope you spread it into a
//               database write. this is mass assignment.

// use a schema library (zod, valibot, ajv) rather than hand-written ifs:
// one declaration produces validation, error messages AND types.</div>

<h4>The status codes to get right</h4>
<div class="codeSample" data-hl>200 ok            201 created (+ Location)    204 no content
400 malformed     401 not authenticated (+ WWW-Authenticate)
403 authenticated but not allowed        404 not found
405 wrong method (+ Allow)               409 conflicts with current state
413 payload too large                    415 wrong content-type
422 understood but unprocessable         429 rate limited (+ Retry-After)
500 we broke      503 temporarily unavailable (+ Retry-After)</div>
<p>The distinctions that carry information: <b>400 vs 422</b> is "I could not parse this" vs "I understood
you and the answer is no", and <b>401 vs 403</b> is "you are nobody" vs "you are somebody without
permission". Collapsing either pair sends clients on the wrong investigation.</p>`,
docs:[['MDN — HTTP status codes','https://developer.mozilla.org/en-US/docs/Web/HTTP/Status'],['RFC 9457 — Problem Details','https://www.rfc-editor.org/rfc/rfc9457'],['OWASP — mass assignment','https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html']],
exs:[
{title:'404 or 405?',diff:'medium',lang:'js',
run:{call:'resolveRoute',cases:[
 {name:'an exact match runs the handler',args:[['GET /users','POST /users'],'GET','/users'],expect:{status:200,allow:null}},
 {name:'a known path with the wrong method is 405',args:[['GET /users','POST /users'],'DELETE','/users'],expect:{status:405,allow:'GET, POST'}},
 {name:'an unknown path is 404',args:[['GET /users'],'GET','/orders'],expect:{status:404,allow:null}},
 {name:'the Allow header lists every method for that path',args:[['GET /x','PUT /x','PATCH /x'],'DELETE','/x'],expect:{status:405,allow:'GET, PUT, PATCH'}},
 {name:'no routes at all is 404',args:[[],'GET','/x'],expect:{status:404,allow:null}}]},
prompt:`Write <code>function resolveRoute(routes, method, path)</code> where <code>routes</code> is a list of <code>"METHOD /path"</code> strings. An exact match returns <code>{ status: 200, allow: null }</code>. If the path exists under other methods, return <code>{ status: 405, allow }</code> where <code>allow</code> is those methods joined by <code>", "</code> in the order they appear. Otherwise return <code>{ status: 404, allow: null }</code>.`,
starter:`function resolveRoute(routes, method, path) {
  return { status: 404, allow: null };
}`,
solution:`function resolveRoute(routes, method, path) {
  const methodsForPath = routes
    .filter(r => r.split(" ")[1] === path)      // same path, any method
    .map(r => r.split(" ")[0]);

  if (methodsForPath.includes(method)) return { status: 200, allow: null };
  if (methodsForPath.length > 0) {
    return { status: 405, allow: methodsForPath.join(", ") };
  }
  return { status: 404, allow: null };           // the path itself is unknown
}`,
tests:[{d:'finds the methods registered for this path',re:'filter'},{d:'an exact match succeeds',re:'status:\\s*200'},{d:'a known path with a wrong method is 405',re:'405'},{d:'builds the Allow header',re:'join\\s*\\(\\s*", "'}],
behavior:`Five cases execute. The distinction being tested is one most hand-rolled routers get wrong: returning 404 when the path exists but the method does not hides a client bug that 405 plus an Allow header explains immediately. The order of the checks matters — an exact match has to be tested before the path-only fallback.`,
hints:['Filter the routes down to those whose path matches, then read their methods.','Check for an exact method match before deciding between 405 and 404.','The Allow header is the methods joined with a comma and a space.']},
{title:'Validate a request body properly',diff:'hard',lang:'js',
run:{call:'validateUser',cases:[
 {name:'a valid body passes',args:[{name:'Ada',age:36}],expect:{ok:true,errors:[]}},
 {name:'age is optional',args:[{name:'Ada'}],expect:{ok:true,errors:[]}},
 {name:'a missing name is reported',args:[{age:36}],expect:{ok:false,errors:['name is required']}},
 {name:'a blank name is reported',args:[{name:'   '}],expect:{ok:false,errors:['name is required']}},
 {name:'a numeric string is NOT a number',args:[{name:'Ada',age:'36'}],expect:{ok:false,errors:['age must be a whole number between 0 and 150']}},
 {name:'an out-of-range age is reported',args:[{name:'Ada',age:200}],expect:{ok:false,errors:['age must be a whole number between 0 and 150']}},
 {name:'an unknown field is refused, not ignored',args:[{name:'Ada',role:'admin'}],expect:{ok:false,errors:['unknown field: role']}},
 {name:'every problem is reported at once, in a fixed order',args:[{age:'x',role:'admin'}],expect:{ok:false,errors:['name is required','age must be a whole number between 0 and 150','unknown field: role']}}]},
prompt:`Write <code>function validateUser(body)</code> returning <code>{ ok, errors }</code>. <code>name</code> is required and must be a non-blank string (&rarr; <code>"name is required"</code>). <code>age</code> is optional, and when present must be a whole number from 0 to 150 (&rarr; <code>"age must be a whole number between 0 and 150"</code>) — the <b>string</b> <code>"36"</code> is not a number. Any key other than <code>name</code> and <code>age</code> is an error (&rarr; <code>"unknown field: KEY"</code>). Report every problem, in that order.`,
starter:`function validateUser(body) {
  return { ok: true, errors: [] };
}`,
solution:`function validateUser(body) {
  const errors = [];

  const name = body.name;
  if (typeof name !== "string" || name.trim() === "") {
    errors.push("name is required");
  }

  if (body.age !== undefined) {                    // optional: only check if sent
    const age = body.age;
    if (typeof age !== "number" || !Number.isInteger(age) || age < 0 || age > 150) {
      errors.push("age must be a whole number between 0 and 150");
    }
  }

  for (const key of Object.keys(body)) {           // reject, do not ignore
    if (key !== "name" && key !== "age") errors.push("unknown field: " + key);
  }

  return { ok: errors.length === 0, errors };
}`,
tests:[{d:'checks the name is a non-blank string',re:'typeof\\s+name\\s*!==\\s*"string"|trim\\(\\)'},{d:'only validates age when it was supplied',re:'!==\\s*undefined'},{d:'requires a real number, not a numeric string',re:'typeof\\s+age\\s*!==\\s*"number"|Number\\.isInteger'},{d:'rejects unknown fields',re:'unknown field'},{d:'collects every error',re:'errors\\.push'}],
behavior:`Eight cases execute and three of them are genuine security or correctness traps. The string "36" must fail: JSON gives you real types, so accepting a string here means a client controls whether your comparisons are numeric or lexicographic. The unknown-field case is mass assignment — silently ignoring { role: "admin" } is fine until someone spreads the body into a database write. And the last case requires collecting every error rather than returning at the first, so a client fixes their request once instead of six times.`,
hints:['Check the type before the value — typeof "36" is "string", not "number".','An optional field is only validated when it is not undefined.','Walk Object.keys to find fields you did not expect, and push an error for each.']}]},

{id:'js46',title:'Authentication, headers and shipping it safely',body:`
<p>The last layer: proving who is calling, and the response headers that protect the people using your
service.</p>

<h4>Reading a bearer token</h4>
<div class="codeSample" data-hl>const auth = req.headers.authorization;         // headers are LOWERCASED
if (!auth?.startsWith("Bearer ")) {
  res.writeHead(401, { "www-authenticate": 'Bearer realm="api"' });
  return res.end();                             // 401 REQUIRES this header
}
const token = auth.slice("Bearer ".length);

// then, from Identity Dojo: verify the SIGNATURE, and check iss, aud and
// exp. decoding is not verifying, and a token minted by your own issuer
// for a DIFFERENT service must be rejected here.</div>
<p>Timing matters when comparing secrets. An API key checked with <code>===</code> leaks, through response
timing, how many characters matched — use <code>crypto.timingSafeEqual</code> on equal-length buffers.</p>

<h4>The headers that belong on every response</h4>
<div class="codeSample" data-hl>strict-transport-security: max-age=31536000; includeSubDomains
                          // browsers refuse plain HTTP to you from now on
content-security-policy:  default-src 'none'; frame-ancestors 'none'
                          // for an API, deny everything - nothing is loaded
x-content-type-options:   nosniff
                          // stop the browser guessing a type you did not send
referrer-policy:          no-referrer
cache-control:            no-store          // on anything authenticated

// and REMOVE the ones that help an attacker:
res.removeHeader("x-powered-by");            // "Express" tells them what to
                                              // look up CVEs for</div>
<p>Set these once in middleware, not per route — a header applied by hand is a header someone forgets on
the endpoint that needed it most. Helmet does this for Express in one line.</p>

<h4>CORS, from the server side</h4>
<p>From the debugging stream you know CORS cannot be fixed in front-end code. This is the other side of
it: <b>your server decides</b>. Echo a specific allowed origin rather than reflecting whatever was sent;
<code>*</code> cannot be combined with credentials; and handle the <code>OPTIONS</code> preflight before
authentication, because a preflight carries no credentials by design.</p>

<h4>Rate limiting and errors</h4>
<div class="codeSample" data-hl>// rate limiting is a availability control, and it belongs at the edge:
429 + retry-after: 30 + RateLimit headers, keyed by API key or user,
falling back to IP only when there is nothing better

// and the error contract from the REST lesson:
// never leak a stack trace, a SQL fragment or a class name. log them
// against a correlation id and return the ID:
{ "type": "...", "title": "Internal error", "status": 500,
  "instance": "/orders/42", "traceId": "b7f2..." }
// the caller can quote traceId to support, and you can find the whole
// request in one log query. that single field saves hours.</div>

<h4>Before it goes live</h4>
<p><b>Graceful shutdown</b> on <code>SIGTERM</code>: stop accepting connections, finish in-flight
requests, close the database, then exit — otherwise every deploy drops requests.
<b>Timeouts</b> on everything outbound, because a hung dependency becomes a hung server.
<b>Health endpoints</b> split into liveness and readiness, with liveness <i>not</i> checking the database
so a brief outage does not restart every instance at once. <b>Structured JSON logs</b> to stdout with a
request id, and never the request body of an authenticated call.</p>`,
docs:[['OWASP — REST security cheat sheet','https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html'],['MDN — HTTP security headers','https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers'],['Node — crypto.timingSafeEqual','https://nodejs.org/api/crypto.html#cryptotimingsafeequala-b']],
exs:[
{title:'Extract a bearer token',diff:'easy',lang:'js',
run:{call:'bearerToken',cases:[
 {name:'a well-formed header',args:['Bearer abc.def.ghi'],expect:'abc.def.ghi'},
 {name:'a missing header',args:[undefined],expect:null},
 {name:'the wrong scheme',args:['Basic dXNlcjpwYXNz'],expect:null},
 {name:'the scheme is case-sensitive here',args:['bearer abc'],expect:null},
 {name:'the scheme with no token',args:['Bearer '],expect:null},
 {name:'an empty header',args:[''],expect:null}]},
prompt:`Write <code>function bearerToken(authHeader)</code> returning the token after <code>"Bearer "</code>, or <code>null</code> when the header is missing, empty, uses a different scheme, or carries no token after the prefix.`,
starter:`function bearerToken(authHeader) {
  return null;
}`,
solution:`function bearerToken(authHeader) {
  if (!authHeader?.startsWith("Bearer ")) return null;   // ?. covers undefined
  const token = authHeader.slice("Bearer ".length);
  return token === "" ? null : token;                     // "Bearer " alone
}`,
tests:[{d:'checks the scheme prefix',re:'"Bearer "'},{d:'handles a missing header',re:'\\?\\.|authHeader\\s*&&|!\\s*authHeader'},{d:'refuses an empty token',re:'===\\s*""|length\\s*===\\s*0'}],
behavior:`Six cases execute. The fifth is the one people miss: "Bearer " with nothing after it passes a startsWith check and yields an empty token, which then fails much later inside the verifier with a confusing error rather than a clean 401 here. Optional chaining handles the undefined header without a separate branch.`,
hints:['Optional chaining lets you test a possibly-undefined header in one expression.','Slice off the prefix by its length rather than a magic number.','An empty remainder is not a token.']},
{title:'Build the response for a request',diff:'hard',lang:'js',
run:{call:'respond',cases:[
 {name:'an authenticated, permitted request succeeds',args:[{auth:'Bearer t',role:'admin',bodyBytes:100,contentType:'application/json'}],expect:{status:200,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}}},
 {name:'no credential is 401 with a challenge',args:[{auth:undefined,role:'admin',bodyBytes:100,contentType:'application/json'}],expect:{status:401,headers:{'www-authenticate':'Bearer realm="api"','x-content-type-options':'nosniff'}}},
 {name:'authenticated but not permitted is 403',args:[{auth:'Bearer t',role:'viewer',bodyBytes:100,contentType:'application/json'}],expect:{status:403,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}}},
 {name:'the wrong content type is 415, checked before the body size',args:[{auth:'Bearer t',role:'admin',bodyBytes:99999999,contentType:'text/plain'}],expect:{status:415,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}}},
 {name:'an oversized body is 413',args:[{auth:'Bearer t',role:'admin',bodyBytes:2000000,contentType:'application/json'}],expect:{status:413,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}}},
 {name:'authentication is checked before anything about the body',args:[{auth:undefined,role:'viewer',bodyBytes:99999999,contentType:'text/plain'}],expect:{status:401,headers:{'www-authenticate':'Bearer realm="api"','x-content-type-options':'nosniff'}}}]},
prompt:`Write <code>function respond(req)</code> returning <code>{ status, headers }</code> for a write endpoint, applying the checks in this order: no <code>auth</code> &rarr; <code>401</code> with <code>www-authenticate: Bearer realm="api"</code>; <code>role</code> other than <code>"admin"</code> &rarr; <code>403</code>; <code>contentType</code> other than <code>"application/json"</code> &rarr; <code>415</code>; <code>bodyBytes</code> above <code>1000000</code> &rarr; <code>413</code>; otherwise <code>200</code>. Every response carries <code>x-content-type-options: nosniff</code>, and every response <b>except the 401</b> also carries <code>cache-control: no-store</code>.`,
starter:`function respond(req) {
  return { status: 200, headers: {} };
}`,
solution:`function respond(req) {
  const base = { "x-content-type-options": "nosniff" };   // on EVERY response

  if (!req.auth) {                                        // who are you
    return { status: 401, headers: { ...base, "www-authenticate": 'Bearer realm="api"' } };
  }
  const withCache = { ...base, "cache-control": "no-store" };

  if (req.role !== "admin") return { status: 403, headers: withCache };
  if (req.contentType !== "application/json") return { status: 415, headers: withCache };
  if (req.bodyBytes > 1000000) return { status: 413, headers: withCache };
  return { status: 200, headers: withCache };
}`,
tests:[{d:'401 carries the challenge header',re:'www-authenticate'},{d:'distinguishes 403 from 401',re:'403'},{d:'rejects the wrong content type',re:'415'},{d:'bounds the body size',re:'413'},{d:'sets nosniff on every response',re:'x-content-type-options'}],
behavior:`Six cases execute and two of them exist purely to pin the ORDER. The fourth has a body of 99999999 bytes and the wrong content type, and must return 415 — you reject a payload you cannot parse before measuring it. The sixth has no credential, the wrong role, the wrong type and an enormous body, and must still return 401: authentication comes first, because everything after it is a statement about a caller you have not identified. A 401 without www-authenticate is also non-compliant, which is why that header is checked separately.`,
hints:['Build the shared header object once and spread it into each response.','The order is authenticate, authorise, then validate the request itself.','The 401 is the only response without cache-control, so return it before adding that header.']}]}
,

{id:'jssec',title:'Security in JavaScript: injection, pollution and the supply chain',body:`
<p>The server lesson covered the headers and the rate limits. This lesson is the layer under that — the
handful of JavaScript-specific ways applications actually get owned, and the habits that close them. None
of them require a security team to apply; all of them have appeared in real incident reports.</p>

<h4>Injection is one disease with many hosts</h4>
<p>Every injection attack is the same mistake: <b>user text concatenated into something that gets
executed</b>. Change the host and it changes its name.</p>
<div class="codeSample" data-hl>"SELECT * FROM users WHERE name='" + name + "'"   // SQL injection
el.innerHTML = "&lt;b&gt;" + comment + "&lt;/b&gt;"              // XSS (the DOM lesson's warning)
exec("convert " + filename)                        // command injection
eval("callback_" + userInput + "()")               // code injection, hand-built

// and one cure, every time: keep data OUT of the executable channel
db.query("SELECT * FROM users WHERE name = ?", [name])   // parameterised
el.textContent = comment                                  // text, never markup
execFile("convert", [filename])                           // args, not a shell string</div>
<p>Treat <code>eval</code> and <code>new Function</code> on anything derived from input as disallowed
outright. There is no real legitimate application use; every appearance in a code review is either
a bug or an incident.</p>

<h4>Prototype pollution: the JavaScript-only one</h4>
<p>The objects stream showed that every plain object inherits from <code>Object.prototype</code>. So if an
attacker can write to <i>that</i>, they poison every object in the process. The way in is any code that
copies user-supplied keys into objects — deep merges, config patchers, query-string parsers.</p>
<div class="codeSample" data-hl>// attacker sends: {"__proto__": {"isAdmin": true}}
merge(config, userPatch)          // a naive merge walks INTO __proto__
({}).isAdmin                      // true - EVERY object now says so

// defenses, in the order to reach for them:
if (["__proto__","constructor","prototype"].includes(key)) continue;
const clean = Object.create(null);        // an object with NO prototype
structuredClone(x)  /* or */ new Map()    // Maps have no such magic keys</div>

<h4>The supply chain: npm install is code execution</h4>
<div class="codeSample" data-hl># installing a package runs its lifecycle scripts ON YOUR MACHINE
# typosquats count on it:  lodahs, cross-env-shell, electorn...
npm install --ignore-scripts     # worth making your default
npm ci                           # installs EXACTLY the lockfile - no drift
npm audit                        # known-CVE check; noisy but free</div>
<p>The lockfile is a security file: it pins the exact bytes you audited. Commit it, install with
<code>npm ci</code> in CI, and treat a surprise lockfile diff in a pull request with the suspicion you
would give a binary blob. And the cheapest defense of all is <b>fewer dependencies</b> — every package is
code you now ship but did not read.</p>

<h4>Secrets</h4>
<p>Secrets live in the environment (<code>process.env</code>, from the runtime lesson), never in code, and
never in logs — the logging lesson's redaction rules exist mostly for this. A token that reaches a log
file has left your control: logs are copied, shipped to third parties, and kept for years.</p>`,
docs:[['OWASP — Top 10','https://owasp.org/www-project-top-ten/'],['OWASP — prototype pollution','https://cheatsheetseries.owasp.org/cheatsheets/Prototype_Pollution_Prevention_Cheat_Sheet.html'],['npm — audit','https://docs.npmjs.com/cli/commands/npm-audit']],
ex:{title:'Vet a patch before merging it',diff:'hard',lang:'js',
run:{call:'vetPatch',cases:[
 {name:'a clean patch is ok',args:[{name:'Ada',theme:'dark'}],expect:'ok'},
 {name:'clean nesting is still ok',args:[{profile:{theme:'dark',fontSize:14}}],expect:'ok'},
 {name:'__proto__ at the top is rejected',args:[JSON.parse('{"__proto__":{"isAdmin":true}}')],expect:'reject: __proto__'},
 {name:'constructor smuggled deep inside is found',args:[JSON.parse('{"profile":{"constructor":{"prototype":{"isAdmin":true}}}}')],expect:'reject: constructor'},
 {name:'prototype as a key is rejected too',args:[JSON.parse('{"prototype":{"x":1}}')],expect:'reject: prototype'},
 {name:'dangerous keys inside arrays are found',args:[{items:[{ok:1},JSON.parse('{"__proto__":{"a":1}}')]}],expect:'reject: __proto__'}]},
prompt:`Write <code>function vetPatch(patch)</code> that walks an incoming object (objects, arrays, any depth) looking for the three pollution keys: <code>__proto__</code>, <code>constructor</code>, <code>prototype</code>. Return <code>"reject: "</code> plus the first dangerous key found (depth-first, in key order), or <code>"ok"</code> if the patch is clean. Use <code>Object.keys</code> to read keys — it sees own properties only, which is exactly the attack surface.`,
starter:`function vetPatch(patch) {
  return "ok";
}`,
solution:`function vetPatch(patch) {
  const banned = ["__proto__", "constructor", "prototype"];
  function walk(value) {
    if (value === null || typeof value !== "object") return null;
    for (const key of Object.keys(value)) {
      if (banned.includes(key)) return key;    // found the attack
      const hit = walk(value[key]);            // depth-first into children
      if (hit) return hit;
    }
    return null;
  }
  const hit = walk(patch);
  return hit ? "reject: " + hit : "ok";
}`,
tests:[{d:'bans __proto__',re:'__proto__'},{d:'bans constructor and prototype',re:'constructor'},{d:'reads own keys only',re:'Object\\.keys'},{d:'recurses into nested values',re:'walk\\s*\\(|vetPatch\\s*\\('}],
behavior:`The dangerous cases are built with JSON.parse in the test data for a reason: a literal {__proto__: ...} in source code would silently set the object's prototype, but JSON.parse creates it as an ordinary own property — which is exactly how the attack arrives over the network, and exactly what Object.keys exposes. The walker refuses the patch before any merge happens, which is cheaper than cleaning up a poisoned Object.prototype ever is.`,
hints:['Recurse: a function inside vetPatch that calls itself on object values.','Arrays are objects too - Object.keys gives their indices, so one walker handles both.','Return the key from the recursion so the first find wins.']}}


]});
