STREAMS.push({icon:'🔌',title:'APIs & REST',blurb:'Consume APIs with HttpClient and Jackson; design REST APIs properly — verbs, status codes, versioning, pagination.',lessons:[
{id:'api1',title:'REST principles',body:`
<p>REST models your domain as <b>resources</b> (nouns) addressed by URLs, manipulated with the standard HTTP verbs. The uniform interface is the point: any developer can predict your API.</p>
<div class="codeSample">GET    /accounts            → list (200)
POST   /accounts            → create (201 + Location header)
GET    /accounts/42         → read one (200 / 404)
PUT    /accounts/42         → replace (200)
PATCH  /accounts/42         → partial update (200)
DELETE /accounts/42         → delete (204)
GET    /accounts/42/holdings → nested resource</div>
<p>Rules of thumb: plural nouns, never verbs in paths (<code>/getAccount</code> ✗); GET is safe &amp; cacheable; PUT and DELETE are <b>idempotent</b> (same call twice = same result); statelessness — each request carries its own auth.</p>
<h4>The idea behind the constraint</h4>
<p>REST's value is not the verbs — it is that <b>the interface is uniform across every API that follows
it</b>. A developer who has never seen your service can guess that <code>GET /accounts/42</code> reads an
account and that <code>DELETE</code> on the same URL removes it. That predictability is the entire return
on the discipline, which is why the rules are worth following even where a bespoke design would be
marginally more convenient.</p>
<p>The mental shift is from <b>procedures to resources</b>. Not "what operations does my service offer?"
but "what things does it manage, and what are their addresses?" — the verbs are already decided.</p>

<h4>The three properties that make HTTP work</h4>
<div class="codeSample" data-hl>SAFE        does not change anything.        GET, HEAD, OPTIONS
            -> so crawlers, prefetchers and proxies may call it freely.
            -> a GET that mutates WILL be triggered by something you did
               not expect. this is not theoretical.

IDEMPOTENT  same call N times == same call once.  GET, PUT, DELETE
            -> the client can RETRY safely after a timeout.
            -> POST is not, which is why retries need an idempotency key.

CACHEABLE   the response may be stored and reused.  GET mostly
            -> ETag / If-None-Match turns a repeat read into a 304.</div>
<p>Note what idempotent does not mean: it is about the <i>resulting state</i>, not the response. Two
<code>DELETE</code>s leave the resource equally gone — the second may return 404, and that is fine.</p>

<h4>PUT vs PATCH, which people get wrong constantly</h4>
<p><code>PUT</code> <b>replaces</b> the resource with the body you sent — so a field you omitted is a field
you deleted. That is the semantics, and clients that send partial bodies to <code>PUT</code> are silently
wiping data. <code>PATCH</code> applies a partial change, and because "partial" needs a format, the honest
version specifies one (JSON Merge Patch, RFC 7396, is the pragmatic choice).</p>

<h4>Status codes as part of the contract</h4>
<p>They are not decoration; clients branch on them. <code>201</code> with a <code>Location</code> header
tells the caller where the new thing lives. <code>204</code> means success with nothing to say.
<code>202</code> means accepted for later processing, which is honest for async work.
<code>409</code> means a conflict with current state, <code>422</code> means understood but unprocessable,
and <code>4xx</code> versus <code>5xx</code> tells the caller whether retrying could possibly help.</p>
<p>The cardinal sin is <code>200</code> with an error inside the body: it breaks every client's error
handling, every monitor, and every cache.</p>

<h4>Where the purity stops being useful</h4>
<p>Some operations are genuinely not CRUD on a noun. "Cancel this order" is a real business action with
rules, and contorting it into <code>PATCH /orders/42 {"status":"cancelled"}</code> hides the fact that
cancelling is not the same as setting a field. Modelling it as a sub-resource —
<code>POST /orders/42/cancellations</code> — keeps the interface honest. And HATEOAS, the level of REST
almost nobody implements, is worth knowing about so you can say clearly that you have chosen not to.</p>`,
docs:[['REST — MDN glossary','https://developer.mozilla.org/en-US/docs/Glossary/REST'],['HTTP methods — MDN','https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods']],
ex:{title:'Design the endpoints',lang:'http',
prompt:`Design endpoints for a <b>portfolio</b> API (a portfolio has many <b>positions</b>). One per numbered line, format <code>VERB /path → status</code>: (1) list portfolios, (2) create a portfolio, (3) fetch portfolio <code>p1</code>, (4) replace portfolio <code>p1</code> entirely, (5) delete position <code>x9</code> inside portfolio <code>p1</code>, (6) the status for fetching a portfolio that doesn't exist.`,
starter:`# 1)

# 2)

# 3)

# 4)

# 5)

# 6)
`,
tests:[{d:'GET /portfolios for list',re:'GET\\s+/portfolios\\b'},{d:'POST create → 201',re:'POST\\s+/portfolios[\\s\\S]*?201'},{d:'GET one by id',re:'GET\\s+/portfolios/p1'},{d:'PUT for full replace',re:'PUT\\s+/portfolios/p1'},{d:'DELETE nested position',re:'DELETE\\s+/portfolios/p1/positions/x9'},{d:'404 for missing resource',re:'404'}],
behavior:`1. Plural nouns, no verbs in paths. 2. Create returns 201. 3. Delete returns 204 (no body). 4. Nested resource path portfolios/p1/positions/x9. 5. (6) is 404.`,
hints:['Collections are plural nouns: <code>/portfolios</code>, one item: <code>/portfolios/p1</code>.','Nested resources chain: <code>/portfolios/p1/positions/x9</code>.','Create=201, successful delete=204, missing=404.'],
solution:`# 1)
GET /portfolios → 200

# 2)
POST /portfolios → 201

# 3)
GET /portfolios/p1 → 200

# 4)
PUT /portfolios/p1 → 200

# 5)
DELETE /portfolios/p1/positions/x9 → 204

# 6)
GET /portfolios/does-not-exist → 404`}},
{id:'api2',title:'Consuming APIs: HttpClient',body:`
<p>Since Java 11 the JDK ships a real HTTP client — no libraries needed for straightforward calls:</p>
<div class="codeSample" data-hl>HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create("https://api.dojo.dev/users/42"))
        .header("Accept", "application/json")
        .GET()
        .build();

HttpResponse&lt;String&gt; response =
        client.send(request, HttpResponse.BodyHandlers.ofString());

if (response.statusCode() == 200) {
    String json = response.body();
}

// async variant returns CompletableFuture:
client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
      .thenApply(HttpResponse::body);</div>
<p>POST bodies use <code>.POST(HttpRequest.BodyPublishers.ofString(json))</code>. Always check <code>statusCode()</code> — the client does not throw on 4xx/5xx.</p>

<h4>That last point is the one that bites</h4>
<p>A 404 or a 500 is a <b>successful HTTP exchange</b> as far as the client is concerned — you asked, the
server answered. <code>send()</code> throws only for transport-level failures: connection refused,
DNS failure, timeout, TLS problems. So code that never inspects <code>statusCode()</code> will happily
parse an error page as if it were data, and the bug surfaces much later as a confusing
deserialization failure rather than "the API returned 503".</p>

<h4>Reuse the client, always</h4>
<p><code>HttpClient</code> is immutable, thread-safe, and holds the connection pool. Creating one per
request throws away connection reuse and leaks threads under load. <b>Build one and share it</b> —
typically a single instance for the lifetime of the application.</p>
<div class="codeSample" data-hl>private static final HttpClient CLIENT = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(5))       // connect only
        .followRedirects(HttpClient.Redirect.NORMAL) // default is NEVER
        .build();

HttpRequest req = HttpRequest.newBuilder()
        .uri(URI.create(url))
        .timeout(Duration.ofSeconds(10))   // the WHOLE request. set it.
        .header("Accept", "application/json")
        .build();</div>
<p>Two defaults worth knowing. There is <b>no request timeout unless you set one</b>, so a hung server
hangs your thread indefinitely — a leading cause of thread-pool exhaustion. And redirects are
<b>not</b> followed by default, which surprises people migrating from other clients.</p>

<h4>Timeouts are two different things</h4>
<p><code>connectTimeout</code> on the client caps establishing the connection.
<code>timeout</code> on the request caps the entire exchange including the response body. You want
both: a server that accepts your connection and then trickles bytes forever defeats a connect timeout
entirely.</p>

<h4>Sync, async, and back-pressure</h4>
<p><code>send()</code> blocks. <code>sendAsync()</code> returns a <code>CompletableFuture</code> and is
the right choice for fan-out — fetching thirty resources concurrently without thirty blocked threads.
The discipline it demands is <b>bounding the concurrency</b>: firing a thousand async requests at once
will exhaust the pool or the remote service. Batch them.</p>
<p><code>BodyHandlers</code> decide how the response is materialised. <code>ofString()</code> is
convenient and reads everything into memory — fine for JSON, wrong for a large download, where
<code>ofFile()</code> or <code>ofInputStream()</code> streams instead.</p>

<h4>What the JDK client deliberately does not do</h4>
<p>No retries, no circuit breaking, no automatic JSON binding, no rate limiting. Those are your job or a
library's. Retrying is the one people most often need and most often get wrong: retry only idempotent
requests (GET, PUT, DELETE — never a bare POST), use exponential backoff with jitter, cap the attempts,
and honour <code>Retry-After</code> when the server sends it.</p>`,
docs:[['HttpClient — API docs','https://docs.oracle.com/en/java/javase/21/docs/api/java.net.http/java/net/http/HttpClient.html'],['Java HTTP Client — Baeldung','https://www.baeldung.com/java-9-http-client']],
ex:{title:'Call an API',
prompt:`Write <code>ApiCaller</code> with <code>static String fetchUser(String id) throws Exception</code>: GET <code>https://api.dojo.dev/users/&lt;id&gt;</code> with header <code>Accept: application/json</code>; return the body on status 200, otherwise throw <code>RuntimeException</code> including the status code in the message.`,
starter:`import java.net.URI;
import java.net.http.*;

public class ApiCaller {
    static String fetchUser(String id) throws Exception {
        // build client + request, send, check status
        return null;
    }
}`,
tests:[{d:'Builds an HttpRequest with the URI',re:'HttpRequest\\.newBuilder\\s*\\('},{d:'Sets Accept header',re:'header\\s*\\(\\s*"Accept"\\s*,\\s*"application/json"'},{d:'Sends with ofString body handler',re:'BodyHandlers\\.ofString\\s*\\(\\s*\\)'},{d:'Checks statusCode()',re:'statusCode\\s*\\(\\s*\\)'},{d:'Throws with status in message',re:'throw\\s+new\\s+RuntimeException\\s*\\([^)]*statusCode'}],
behavior:`1. URI is https://api.dojo.dev/users/<id> (id concatenated). 2. On 200 returns response.body(). 3. On any other status throws RuntimeException mentioning the code. 4. Uses HttpClient.send (sync is fine).`,
hints:['<code>URI.create("https://api.dojo.dev/users/" + id)</code> inside <code>.uri(...)</code>.','Send: <code>HttpResponse&lt;String&gt; r = client.send(req, HttpResponse.BodyHandlers.ofString());</code>','Check: <code>if (r.statusCode() != 200) throw new RuntimeException("API returned " + r.statusCode());</code>'],
solution:`import java.net.URI;
import java.net.http.*;

public class ApiCaller {
    static String fetchUser(String id) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.dojo.dev/users/" + id))
                .header("Accept", "application/json")
                .GET()
                .build();

        HttpResponse<String> response =
                client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("API returned " + response.statusCode());
        }
        return response.body();
    }
}`}},
{id:'api3',title:'JSON with Jackson',body:`
<p>Jackson's <code>ObjectMapper</code> converts between JSON and Java objects. Records make perfect DTOs:</p>
<div class="codeSample" data-hl>record UserDto(String id, String name, List&lt;String&gt; roles) {}

ObjectMapper mapper = new ObjectMapper();

// JSON → object
UserDto u = mapper.readValue(json, UserDto.class);

// object → JSON
String out = mapper.writeValueAsString(u);

// lists need a TypeReference (generics are erased at runtime)
List&lt;UserDto&gt; users = mapper.readValue(json,
        new TypeReference&lt;List&lt;UserDto&gt;&gt;() {});

// unknown fields shouldn't break you:
mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);</div>
<p>Field-name mismatches are handled with <code>@JsonProperty("user_name")</code>. In Spring Boot, an ObjectMapper is auto-configured and used behind every <code>@RequestBody</code>/<code>@ResponseBody</code>.</p>

<h4>Reuse the ObjectMapper</h4>
<p>It is thread-safe once configured, and constructing one is expensive — it builds and caches
serializers per type. Creating a mapper per request throws that cache away every time. <b>One shared
instance</b>, configured at startup.</p>

<h4>The setting that prevents most breakage</h4>
<div class="codeSample" data-hl>// default: an unknown field in the JSON throws.
// so the day the API adds a field, your client breaks.
mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL); // omit nulls
mapper.registerModule(new JavaTimeModule());  // or Instant/LocalDate FAIL
mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS); // ISO-8601</div>
<p>Tolerating unknown fields is the <b>robustness principle</b> applied to APIs: be liberal in what you
accept. A provider adding an optional field is a backward-compatible change on their side, and it
should not be a breaking one on yours.</p>
<p>The <code>JavaTimeModule</code> omission is the other classic: without it, Jackson cannot handle
<code>Instant</code> or <code>LocalDate</code> at all, and the failure message rarely points at the
missing module.</p>

<h4>Records, and why constructors matter</h4>
<p>Jackson historically needed a no-arg constructor plus setters, which pushed people toward mutable
DTOs. Modern Jackson deserialises <b>records</b> and other immutable types directly by using the
canonical constructor, so your DTOs can be immutable — which is what you want for objects crossing a
boundary. If parameter names are stripped at compile time, you may still need
<code>@JsonProperty</code> on the components or the <code>-parameters</code> compiler flag.</p>

<h4>Treat the DTO as a boundary, not your model</h4>
<p>Binding JSON straight onto your domain entity couples your internal model to someone else's wire
format, and the coupling runs both ways: their rename becomes your refactor, and your private field
becomes their public API. A separate DTO plus an explicit mapping step costs a little code and buys
independent evolution.</p>
<p>It also closes a security hole. Deserialising an arbitrary payload onto a domain object lets a caller
set fields you never intended to expose — the <b>mass assignment</b> problem. If the JSON contains
<code>"role":"admin"</code> and your entity has a <code>role</code> field, Jackson will happily set it.
Use <code>@JsonIgnore</code>, or better, a DTO that simply has no such field.</p>
<p><b>And never enable default typing</b> (<code>enableDefaultTyping()</code>). Letting the payload
declare its own Java types is a well-known remote-code-execution vector.</p>`,
docs:[['Jackson databind — GitHub','https://github.com/FasterXML/jackson-databind'],['Jackson ObjectMapper — Baeldung','https://www.baeldung.com/jackson-object-mapper-tutorial']],
ex:{title:'Round-trip a record',
prompt:`Define <code>record Position(String symbol, int quantity, double price)</code>. Write class <code>Json</code> with an ObjectMapper field, <code>Position parse(String json)</code> using <code>readValue</code>, <code>String write(Position p)</code> using <code>writeValueAsString</code>, and <code>double marketValue(String json)</code> that parses and returns quantity × price.`,
starter:`import com.fasterxml.jackson.databind.ObjectMapper;

record Position(String symbol, int quantity, double price) {}

public class Json {
    private final ObjectMapper mapper = new ObjectMapper();

    Position parse(String json) throws Exception {
        return null;
    }

    String write(Position p) throws Exception {
        return null;
    }

    double marketValue(String json) throws Exception {
        return 0;
    }
}`,
tests:[{d:'Position is a record with 3 components',re:'record\\s+Position\\s*\\(\\s*String\\s+symbol\\s*,\\s*int\\s+quantity\\s*,\\s*double\\s+price\\s*\\)'},{d:'parse uses readValue with the class token',re:'readValue\\s*\\(\\s*json\\s*,\\s*Position\\.class\\s*\\)'},{d:'write uses writeValueAsString',re:'writeValueAsString\\s*\\('},{d:'marketValue multiplies quantity and price',re:'quantity\\s*\\(\\s*\\)\\s*\\*\\s*\\w+\\.price\\s*\\(\\s*\\)|price\\s*\\(\\s*\\)\\s*\\*\\s*\\w+\\.quantity\\s*\\(\\s*\\)'}],
behavior:`1. parse('{"symbol":"AAPL","quantity":10,"price":150.0}') gives Position("AAPL",10,150.0). 2. write of that position produces JSON containing all three fields. 3. marketValue of that JSON == 1500.0. 4. marketValue reuses parse (no duplicate mapping code).`,
hints:['parse: <code>return mapper.readValue(json, Position.class);</code>','write: <code>return mapper.writeValueAsString(p);</code>','marketValue: <code>Position p = parse(json); return p.quantity() * p.price();</code>'],
solution:`import com.fasterxml.jackson.databind.ObjectMapper;

record Position(String symbol, int quantity, double price) {}

public class Json {
    private final ObjectMapper mapper = new ObjectMapper();

    Position parse(String json) throws Exception {
        return mapper.readValue(json, Position.class);
    }

    String write(Position p) throws Exception {
        return mapper.writeValueAsString(p);
    }

    double marketValue(String json) throws Exception {
        Position p = parse(json);
        return p.quantity() * p.price();
    }
}`}},
{id:'api4',title:'Designing good REST: idempotency & error contracts',body:`
<p>Two things separate professional APIs from amateur ones:</p>
<p><b>Idempotency.</b> GET/PUT/DELETE must be idempotent — retrying is safe. POST isn't, so payment-grade APIs accept an <code>Idempotency-Key</code> header: same key → same result, no double charge. As an API-platform owner this is your bread and butter.</p>
<p><b>A consistent error contract.</b> Clients should parse one error shape everywhere. RFC 9457 (Problem Details) is the standard:</p>
<div class="codeSample">HTTP/1.1 422 Unprocessable Entity
Content-Type: application/problem+json

{
  "type": "https://api.dojo.dev/errors/insufficient-funds",
  "title": "Insufficient funds",
  "status": 422,
  "detail": "Balance 30.00 is below requested 100.00",
  "instance": "/accounts/42/withdrawals"
}</div>
<p>Never leak stack traces; never return 200 with <code>{"error": ...}</code> inside; use 400 for malformed syntax vs 422 for valid-but-unprocessable semantics.</p>
<h4>Why idempotency is a networking problem, not a preference</h4>
<p>The scenario is unavoidable: a client sends a payment request, and the response never arrives. The
client cannot distinguish "the request never landed" from "it succeeded and the response was lost". Both
look identical. So it must either retry — and risk charging twice — or not retry, and risk losing a
payment that never happened.</p>
<p>An idempotency key resolves it. The client generates a unique key per <i>logical operation</i> and sends
it with every attempt; the server records the key with the result and returns the stored result for any
repeat.</p>
<div class="codeSample" data-hl>POST /charges
Idempotency-Key: 9f2c1a...        &lt;- generated by the CLIENT, once,
                                     and REUSED for every retry
// server:
//   key unseen        -> process, store (key -> response), return it
//   key seen, done    -> return the STORED response. do not process.
//   key seen, running -> 409, tell the client to retry shortly

// the subtlety that bites: store the key IN THE SAME TRANSACTION as
// the work. record it afterwards and a crash in between gives you a
// charge with no key - so the retry charges again.

// and hash the request body against the key: same key with a DIFFERENT
// body is a client bug, and should be a 422, not a silent wrong answer.</div>

<h4>The error contract, and why consistency beats cleverness</h4>
<p>Without a standard shape, each endpoint invents its own and clients end up with a parser per route. RFC
9457's <code>application/problem+json</code> gives one shape everywhere:
<code>type</code> (a URI identifying the error class — the field clients should branch on),
<code>title</code>, <code>status</code>, <code>detail</code> (human-readable, and safe to change), and
<code>instance</code>.</p>
<p>Three rules for what goes in it. <b>Machine-readable first</b>: clients branch on
<code>type</code> and status, never on the prose in <code>detail</code>. <b>Actionable</b>: say which
field, and what was wrong with it — add an <code>errors</code> array for validation, since one 422 per
form field is a poor experience. <b>Nothing internal</b>: stack traces, SQL fragments and class names are
reconnaissance. Log them against a correlation id and return the id instead — which also turns a customer
support ticket into a single log query.</p>

<h4>The rest of what separates a professional API</h4>
<p><b>Versioning</b> decided before launch, not after the first breaking change. <b>Pagination on every
collection</b> — an unpaginated list endpoint is an outage waiting for the customer with 50,000 records,
and cursor pagination beats offset once the data is large or changing. <b>Rate limits that are visible</b>
via <code>RateLimit</code> headers and a <code>Retry-After</code> on 429, so clients can back off properly
instead of hammering you. And <b>documentation generated from the code</b> (OpenAPI), because
hand-maintained docs are wrong within a month.</p>`,
docs:[['RFC 9457 Problem Details','https://www.rfc-editor.org/rfc/rfc9457.html'],['Idempotency — Stripe docs','https://docs.stripe.com/api/idempotent_requests']],
exs:[{title:'An error contract in Java',
prompt:`Write <code>record ProblemDetail(String type, String title, int status, String detail)</code> and class <code>Errors</code> with two factories: <code>static ProblemDetail notFound(String resource, String id)</code> → status 404, title "Not found", detail "&lt;resource&gt; &lt;id&gt; does not exist", type "https://api.dojo.dev/errors/not-found"; and <code>static ProblemDetail validation(String field, String issue)</code> → status 422, title "Validation failed", detail "&lt;field&gt;: &lt;issue&gt;", type ".../validation".`,
starter:`record ProblemDetail(String type, String title, int status, String detail) {}

public class Errors {
    static ProblemDetail notFound(String resource, String id) {
        return null;
    }

    static ProblemDetail validation(String field, String issue) {
        return null;
    }
}`,
tests:[{d:'ProblemDetail record with 4 fields',re:'record\\s+ProblemDetail\\s*\\(\\s*String\\s+type\\s*,\\s*String\\s+title\\s*,\\s*int\\s+status\\s*,\\s*String\\s+detail\\s*\\)'},{d:'notFound uses 404',re:'notFound[\\s\\S]*?404'},{d:'validation uses 422 (not 400)',re:'validation[\\s\\S]*?422'},{d:'Detail strings are composed',re:'\\+\\s*id|field\\s*\\+'}],
behavior:`1. notFound("portfolio","p1") → status 404, detail "portfolio p1 does not exist". 2. validation("email","must not be blank") → 422, detail "email: must not be blank". 3. Both carry their type URLs. 4. Records are immutable — no setters anywhere.`,
hints:['Factories just call the record constructor with the right constants.','404 = the resource address is wrong; 422 = the address was fine, the payload semantics were not.','Compose detail with simple concatenation: <code>resource + " " + id + " does not exist"</code>.'],
solution:`record ProblemDetail(String type, String title, int status, String detail) {}

public class Errors {
    static ProblemDetail notFound(String resource, String id) {
        return new ProblemDetail(
            "https://api.dojo.dev/errors/not-found",
            "Not found", 404,
            resource + " " + id + " does not exist");
    }

    static ProblemDetail validation(String field, String issue) {
        return new ProblemDetail(
            "https://api.dojo.dev/errors/validation",
            "Validation failed", 422,
            field + ": " + issue);
    }
}`},
{title:'Which methods are idempotent',lang:'js',diff:'easy',
run:{call:'isIdempotent',cases:[{"name": "GET is idempotent", "args": ["GET"], "expect": true}, {"name": "PUT is idempotent \u2014 same result however many times", "args": ["put"], "expect": true}, {"name": "DELETE is idempotent", "args": ["DELETE"], "expect": true}, {"name": "POST is not", "args": ["POST"], "expect": false}, {"name": "PATCH is not, in general", "args": ["PATCH"], "expect": false}, {"name": "case does not matter", "args": ["hEaD"], "expect": true}]},
prompt:`Write <code>function isIdempotent(method)</code> returning whether repeating the request has the same effect as making it once. <code>GET</code>, <code>HEAD</code>, <code>PUT</code>, <code>DELETE</code>, <code>OPTIONS</code> and <code>TRACE</code> are idempotent; <code>POST</code> and <code>PATCH</code> are not. Compare case-insensitively.`,
starter:`function isIdempotent(method) {\n  return false;\n}`,
solution:`function isIdempotent(method) {\n  return ["GET","HEAD","PUT","DELETE","OPTIONS","TRACE"]\n    .includes(String(method).toUpperCase());\n}`,
tests:[{d:'the method list is checked',re:'includes|indexOf'},{d:'PUT is included',re:'PUT'},{d:'POST is absent from the list',re:'^(?!.*"POST")'},{d:'comparison is case-insensitive',re:'toUpperCase|toLowerCase|i\\)'}],
behavior:`Six cases execute. Idempotent does not mean safe: DELETE changes state, and it is idempotent because deleting twice leaves the same world as deleting once — the second call returning 404 is a different response, not a different effect. PATCH is the interesting exclusion: "set status to shipped" is idempotent, "add 10 to the balance" is not, and since PATCH bodies can express either, the method cannot promise it. This matters because it decides what a client or proxy may safely retry — and everything that is not idempotent needs an idempotency key instead, which is the next lesson\x27s subject.`,
hints:['Six methods are idempotent; two common ones are not.','Normalise the case before comparing — methods arrive from the wire in any form.','Ask "if this ran twice, would the end state differ?" rather than "does it change anything?"']}]},
{id:'api5',title:'Advanced REST: versioning, pagination, rate limits',body:`
<p>Running an API <i>platform</i> means designing for change and scale:</p>
<ul>
<li><b>Versioning</b>: URL (<code>/v2/accounts</code> — visible, cache-friendly) or header (<code>Accept: application/vnd.dojo.v2+json</code> — purist). Pick one, document a deprecation policy with dates, send <code>Sunset</code>/<code>Deprecation</code> headers before removal.</li>
<li><b>Pagination</b>: offset (<code>?page=2&amp;size=50</code> — simple, drifts under writes) vs cursor (<code>?cursor=abc&amp;limit=50</code> — stable, opaque token). Return total/next metadata.</li>
<li><b>Rate limiting</b>: answer <code>429 Too Many Requests</code> with <code>Retry-After</code> and <code>X-RateLimit-Remaining</code> style headers.</li>
<li><b>Caching &amp; concurrency</b>: <code>ETag</code> + <code>If-None-Match</code> (304), and optimistic locking with <code>If-Match</code> → <code>412 Precondition Failed</code>.</li>
</ul>
<div class="codeSample">GET /v2/trades?cursor=eyJpZCI6OTl9&limit=100
HTTP/1.1 200 OK
X-RateLimit-Remaining: 4998
ETag: "33a64df5"

{"items":[...],"next_cursor":"eyJpZCI6MTk5In0"}</div>

<h4>Why cursors beat offsets</h4>
<p><code>?page=5&amp;size=20</code> is easy and quietly wrong at scale, for two reasons. It is
<b>unstable</b>: if a row is inserted while a client pages through, every subsequent page shifts and an
item is silently skipped or repeated. And it is <b>slow</b>: <code>OFFSET 100000</code> makes the
database walk and discard a hundred thousand rows on every request.</p>
<p>A cursor encodes <i>where you stopped</i> — typically the last id or sort key — so the next query is
an indexed range scan of constant cost, and inserts elsewhere cannot shift your window. The trade is
that you lose "jump to page 47", which most APIs never genuinely needed. Keep the cursor opaque
(base64 an internal structure) so you can change what is inside it without breaking clients.</p>

<h4>Versioning: pick one and mean it</h4>
<div class="codeSample" data-hl>/v1/orders                        URI  — visible, cacheable, easy to route.
                                       the pragmatic default.
Accept: application/vnd.acme.v2+json   media type — "purer", far more awkward
                                       in browsers, proxies and curl
?version=2                        query — easy, but caches and logs treat it
                                       as a different resource inconsistently</div>
<p>The more important discipline is <b>not needing a new version</b>. Adding an optional field, adding
an endpoint, adding an enum value a client can ignore — all backward compatible. Removing a field,
renaming one, tightening validation or changing a default — all breaking. Version when you break, and
run the old version until the clients you care about have moved, with usage metrics telling you when
that is.</p>

<h4>Rate limits should be legible</h4>
<p>Return <b>429</b> with <code>Retry-After</code>, and expose the budget continuously rather than only
at the moment of failure — <code>RateLimit-Limit</code>, <code>RateLimit-Remaining</code>,
<code>RateLimit-Reset</code>. A client that can see its remaining budget can slow down; one that only
learns at rejection can only retry and make it worse.</p>
<p>Limit per <i>credential</i>, not per IP: many legitimate users share an IP, and one abusive client
should not take out a corporate NAT. And prefer a token bucket to a fixed window — a fixed window lets
a caller spend the whole quota in the last second of one window and again in the first second of the
next, producing exactly the burst you were trying to prevent.</p>`,
docs:[['API versioning — Postman guide','https://www.postman.com/api-platform/api-versioning/'],['RFC 6585 — 429 status','https://www.rfc-editor.org/rfc/rfc6585'],['HTTP caching & ETag — MDN','https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag']],
ex:{title:'Platform design drill',lang:'http',
prompt:`One per numbered line: (1) a URL-versioned request line listing v2 trades with <b>cursor</b> pagination (cursor <code>abc</code>, limit 50), (2) the status line a rate-limited client gets, (3) the response header telling them when to retry (60s), (4) the conditional request header a client sends to revalidate a cached ETag <code>"x1"</code>, (5) the status line when that cache is still fresh.`,
starter:`# 1)

# 2)

# 3)

# 4)

# 5)
`,
tests:[{d:'v2 in path with cursor+limit',re:'GET\\s+/v2/trades\\?cursor=abc&limit=50'},{d:'429 status',re:'429'},{d:'Retry-After: 60',re:'Retry-After:\\s*60'},{d:'If-None-Match with the etag',re:'If-None-Match:\\s*"x1"'},{d:'304 Not Modified',re:'304'}],
behavior:`1. (1) GET /v2/trades?cursor=abc&limit=50. 2. (2) HTTP/1.1 429 Too Many Requests. 3. (3) Retry-After: 60. 4. (4) If-None-Match: "x1". 5. (5) HTTP/1.1 304 Not Modified.`,
hints:['Version goes first in the path: <code>/v2/trades</code>; cursor params: <code>?cursor=abc&limit=50</code>.','Rate limiting is 429 + Retry-After.','ETag revalidation: client sends If-None-Match; a hit answers 304 with an empty body.'],
solution:`# 1)
GET /v2/trades?cursor=abc&limit=50 HTTP/1.1

# 2)
HTTP/1.1 429 Too Many Requests

# 3)
Retry-After: 60

# 4)
If-None-Match: "x1"

# 5)
HTTP/1.1 304 Not Modified`}},
{id:'api6',title:'API specs & publishing: OpenAPI',body:`
<p>An API without a machine-readable spec is folklore. <b>OpenAPI 3</b> is the contract format: one YAML/JSON document describing every path, parameter, schema and response — from which docs, client SDKs, mock servers and contract tests are all generated.</p>
<div class="codeSample">openapi: 3.0.3
info: { title: Portfolio API, version: 2.1.0 }
paths:
  /portfolios/{id}:
    get:
      operationId: getPortfolio
      parameters:
        - { name: id, in: path, required: true, schema: { type: string } }
      responses:
        "200":
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Portfolio" }
        "404": { description: Not found }
components:
  schemas:
    Portfolio:
      type: object
      required: [id, name]
      properties:
        id:   { type: string }
        name: { type: string }</div>
<p><b>Code-first</b>: add <code>springdoc-openapi-starter-webmvc-ui</code> and your running Boot app self-publishes the spec at <code>/v3/api-docs</code> with interactive docs at <code>/swagger-ui.html</code>; enrich with <code>@Operation</code>/<code>@ApiResponse</code> annotations. <b>Spec-first</b> flips it: design the YAML in review, then generate server stubs and client SDKs with <code>openapi-generator</code>. <b>Publishing as a platform owner</b> means: the spec is versioned in git and diffed in PRs (breaking-change review!), a developer portal hosts per-version docs, SDKs are generated per release, and the deprecation headers you learned in the versioning lesson are documented in the spec itself.</p>

<h4>Code-first or spec-first, and how to choose</h4>
<p><b>Code-first</b> keeps the spec in sync automatically, because it is generated from the same annotations that implement the endpoint — no drift, and near-zero effort. Its weakness is that the API is designed by whoever writes the controller, one endpoint at a time, and the document only exists after the code does.</p>
<p><b>Spec-first</b> makes the contract a reviewable artefact <i>before</i> implementation: consumers can comment, mocks can be generated for parallel front-end work, and server stubs enforce the agreed shape. Its weakness is drift — a spec nobody regenerates from is folklore again within a quarter — so it only works when generation is wired into the build.</p>
<p>The practical rule: spec-first for public or cross-team APIs where the contract is a negotiation, code-first for internal services where speed matters more and the consumer is down the hall.</p>

<h4>What a good spec carries beyond paths</h4>
<ul>
<li><b>Schemas with constraints</b>, not just types: formats, ranges, required fields, enums. Generated clients and validators use them, and they are the difference between documentation and a contract.</li>
<li><b>Error responses</b>, modelled explicitly — ideally as <code>application/problem+json</code> (RFC 9457), so failures have a defined shape rather than being an undocumented surprise.</li>
<li><b>Examples</b> on requests and responses. They are what a human actually reads, and they power mock servers.</li>
<li><b>Security schemes</b>, so the spec states which scopes or schemes each operation needs.</li>
</ul>

<h4>The spec as a change-control mechanism</h4>
<p>The reason to keep the document in git is that a diff becomes reviewable: adding an optional field is additive, removing a field or tightening a type is breaking, and a reviewer can see which one a pull request contains. Tooling can enforce it — <code>oasdiff</code> and similar will fail a build on a breaking change — which turns "we did not realise anyone used that field" into a conversation before release rather than an incident after it. Pair that with the deprecation headers from the versioning lesson and the whole lifecycle is documented in one place that clients and generators both read.</p>`,
docs:[['OpenAPI specification','https://spec.openapis.org/oas/v3.0.3'],['springdoc-openapi','https://springdoc.org/'],['openapi-generator','https://openapi-generator.tech/']],
ex:{title:'Write the contract',lang:'yaml',
prompt:`Write an OpenAPI 3.0.3 snippet: <code>info</code> with title <code>Ledger API</code> version <code>1.0.0</code>; path <code>/entries/{id}</code> with a <code>get</code> operation (<code>operationId: getEntry</code>), a required path parameter <code>id</code> of type string, a <code>"200"</code> response whose <code>application/json</code> content references <code>#/components/schemas/Entry</code>, and a <code>"404"</code>; components schema <code>Entry</code>: object with required <code>[id, amountCents]</code>, properties id (string) and amountCents (integer).`,
starter:`openapi: 3.0.3
info:
  # title + version

paths:
  # /entries/{id} -> get -> params + responses

components:
  schemas:
    # Entry
`,
tests:[{d:'info block correct',re:'title:\\s*Ledger API[\\s\\S]*?version:\\s*(")?1\\.0\\.0'},{d:'Path with the id template',re:'/entries/\\{id\\}:'},{d:'operationId getEntry',re:'operationId:\\s*getEntry'},{d:'Required path parameter',re:'in:\\s*path[\\s\\S]*?required:\\s*true|required:\\s*true[\\s\\S]*?in:\\s*path'},{d:'200 references the Entry schema',re:'\\$ref:\\s*["\\x27]?#/components/schemas/Entry'},{d:'Entry schema with required fields',re:'Entry:[\\s\\S]*?required:[\\s\\S]*?amountCents[\\s\\S]*?type:\\s*integer'}],
behavior:`1. Valid OpenAPI shape: paths -> /entries/{id} -> get -> parameters + responses. 2. The path parameter is declared in: path, required: true, schema type string. 3. "200" content -> application/json -> schema -> $ref to the component. 4. "404" present. 5. Entry declares required [id, amountCents]; amountCents is integer (cents, not float — your money lesson applies to contracts too).`,
hints:['Path parameters live in a parameters: list under the operation; each needs name, in: path, required: true, schema.','Responses keys are quoted status codes; the body nests content -> application/json -> schema.','Reuse via $ref: "#/components/schemas/Entry" — duplicated inline schemas are how specs rot.'],
solution:`openapi: 3.0.3
info:
  title: Ledger API
  version: 1.0.0

paths:
  /entries/{id}:
    get:
      operationId: getEntry
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        "200":
          description: The entry
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Entry"
        "404":
          description: Not found

components:
  schemas:
    Entry:
      type: object
      required: [id, amountCents]
      properties:
        id:
          type: string
        amountCents:
          type: integer`}},
{id:'api7',title:'Request headers & curl fluency',body:`
<p>Headers are the API's control plane. The ones you will set and read daily:</p>
<ul>
<li><b>Auth</b>: <code>Authorization: Bearer &lt;token&gt;</code> (JWTs), <code>Authorization: Basic &lt;base64&gt;</code>, or API keys in <code>X-API-Key</code>.</li>
<li><b>Content negotiation</b>: <code>Content-Type</code> (what I am SENDING), <code>Accept</code> (what I want BACK) — mixing these up is the #1 415/406 generator.</li>
<li><b>Tracing</b>: <code>X-Request-Id</code> / <code>traceparent</code> — propagate them; they are how you follow one request across services in logs.</li>
<li><b>Caching &amp; concurrency</b>: <code>ETag</code>, <code>If-None-Match</code>, <code>If-Match</code>, <code>Cache-Control</code> (your api5 lesson).</li>
<li><b>Platform ops</b>: <code>Retry-After</code>, <code>X-RateLimit-*</code>, <code>Idempotency-Key</code>, CORS (<code>Origin</code> → <code>Access-Control-Allow-Origin</code>).</li>
</ul>
<p>And <b>curl</b> — the lingua franca of API debugging:</p>
<div class="codeSample">curl https://api.dojo.dev/health                          # GET
curl -i  ...          # include response headers      -v  ... # full handshake + headers both ways
curl -H "Authorization: Bearer $TOKEN" -H "Accept: application/json" https://api.dojo.dev/me

curl -X POST https://api.dojo.dev/users \\
     -H "Content-Type: application/json" \\
     -d '{"name": "Ada"}'                                  # -d makes it POST; -X optional here

curl -X PUT ... -d @payload.json                           # body from a file
curl -o out.json -w "%{http_code}\\n" ...                  # save body, print status
curl -L ...                                                # follow redirects</div>
<p>Debugging ritual: reproduce with curl first — it strips away SDKs, retries and frameworks until only the HTTP truth remains. If curl works and your code doesn't, diff the headers with <code>-v</code>.</p>`,
docs:[['HTTP headers — MDN','https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers'],['curl docs','https://curl.se/docs/manpage.html'],['Everything curl (book)','https://everything.curl.dev/']],
ex:{title:'curl drill',lang:'shell',
prompt:`One per numbered line: (1) GET <code>https://api.dojo.dev/me</code> with a bearer token from <code>$TOKEN</code> and <code>Accept: application/json</code>, (2) POST <code>{"name": "Ada"}</code> to <code>https://api.dojo.dev/users</code> with the right Content-Type, (3) the same GET as (1) but showing <b>response headers</b> too, (4) fetch <code>https://api.dojo.dev/report</code> saving the body to <code>report.json</code> while printing the status code, (5) which header pair the server/client use for conditional caching (name both, comma-separated).`,
starter:`# 1)

# 2)

# 3)

# 4)

# 5)
`,
tests:[{d:'Bearer + Accept headers via -H',re:'-H\\s+"Authorization:\\s*Bearer\\s+\\$TOKEN"[\\s\\S]*?-H\\s+"Accept:\\s*application/json"|-H\\s+"Accept:\\s*application/json"[\\s\\S]*?-H\\s+"Authorization:\\s*Bearer\\s+\\$TOKEN"'},{d:'POST with JSON Content-Type and -d body',re:'-H\\s+"Content-Type:\\s*application/json"[\\s\\S]*?-d\\s+.\\{"name":\\s*"Ada"\\}'},{d:'-i (or -v) to show response headers',re:'curl\\s+(-i|-v)\\b'},{d:'-o file with -w status code',re:'-o\\s+report\\.json[\\s\\S]*?-w\\s+"%\\{http_code\\}'},{d:'ETag / If-None-Match pair',re:'ETag\\s*,\\s*If-None-Match|If-None-Match\\s*,\\s*ETag'}],
behavior:`1. (1) curl -H "Authorization: Bearer $TOKEN" -H "Accept: application/json" https://api.dojo.dev/me. 2. (2) curl -X POST (or just -d) with Content-Type application/json and the -d body. 3. (3) same plus -i. 4. (4) curl -o report.json -w "%{http_code}\\n" https://api.dojo.dev/report. 5. (5) ETag, If-None-Match.`,
hints:['Each header is its own -H "Name: value" flag — curl does not merge them for you.','-d implies POST; adding -X POST is fine and explicit. Content-Type tells the server how to parse -d.','-i prints response headers with the body; -v additionally shows what YOU sent — the debugging gold.'],
solution:`# 1)
curl -H "Authorization: Bearer $TOKEN" -H "Accept: application/json" https://api.dojo.dev/me

# 2)
curl -X POST https://api.dojo.dev/users -H "Content-Type: application/json" -d '{"name": "Ada"}'

# 3)
curl -i -H "Authorization: Bearer $TOKEN" -H "Accept: application/json" https://api.dojo.dev/me

# 4)
curl -o report.json -w "%{http_code}\\n" https://api.dojo.dev/report

# 5)
ETag, If-None-Match`}}
]});
