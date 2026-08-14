STREAMS.push({icon:'🌐',title:'Web Development',blurb:'HTTP from first principles, servlets, the MVC pattern, sessions & web security.',lessons:[
{id:'web1',title:'HTTP fundamentals',body:`
<p>Everything on the web is a text conversation: a client sends a <b>request</b> (method, path, headers, optional body), the server answers with a <b>response</b> (status code, headers, body). HTTP is stateless — every request stands alone.</p>
<div class="codeSample">GET /users/42 HTTP/1.1
Host: api.example.com
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

{"id": 42, "name": "Ada"}</div>
<p>Methods: <code>GET</code> (read, safe), <code>POST</code> (create/act), <code>PUT</code> (replace), <code>PATCH</code> (partial update), <code>DELETE</code>. Status families: <b>2xx</b> success, <b>3xx</b> redirect, <b>4xx</b> client's fault (400 bad request, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict), <b>5xx</b> server's fault. Headers carry metadata: <code>Content-Type</code>, <code>Authorization</code>, <code>Cache-Control</code>.</p>

<h4>Safe and idempotent: the two properties that matter</h4>
<p>These are not synonyms, and the difference decides what a client, a proxy or a retry may do:</p>
<div class="codeSample" data-hl>            SAFE?   IDEMPOTENT?   meaning
GET          yes      yes        no side effects at all. cacheable, prefetchable
HEAD         yes      yes        GET without the body
PUT          no       yes        same request twice = same end state
DELETE       no       yes        deleting twice leaves it deleted
POST         no       NO         twice = two orders. this is why the browser
                                 warns before re-submitting a form
PATCH        no       usually not depends on whether the patch is absolute</div>
<p>The practical consequence: <b>only idempotent requests are safe to retry automatically</b>. A client
that retries a POST on timeout may create two orders, because it cannot know whether the first one
arrived. That is what idempotency keys exist to solve — the client sends a unique key and the server
recognises the repeat.</p>

<h4>Statelessness, and what it actually costs</h4>
<p>HTTP has no memory: each request must carry everything needed to serve it. That is why any server
can answer any request, which is what makes horizontal scaling straightforward — and it is why
identity has to be re-established every single request, via a cookie or an
<code>Authorization</code> header. The whole of session and token design follows from this one
property.</p>

<h4>Status codes people get wrong</h4>
<ul>
<li><b>401 vs 403.</b> 401 means "I do not know who you are" — authenticate and try again. 403 means
"I know exactly who you are and you still may not." Returning 401 for a permission failure sends
clients into a pointless re-login loop.</li>
<li><b>200 with an error body.</b> Popular and wrong: it defeats every client, proxy and monitor that
reasons about status codes.</li>
<li><b>404 vs 410.</b> 404 is "not here"; 410 is "deliberately gone, stop asking".</li>
<li><b>422 vs 400.</b> 400 is malformed syntax; 422 is well-formed but semantically invalid.</li>
<li><b>429.</b> Rate limited — and it should carry <code>Retry-After</code> so the client knows how
long to wait rather than guessing.</li>
</ul>

<h4>The headers worth knowing beyond the basics</h4>
<p><code>Accept</code> and <code>Content-Type</code> are a pair that people conflate: <code>Accept</code>
says what you want back, <code>Content-Type</code> describes what you are sending.
<code>Cache-Control</code> governs caching, and <code>ETag</code> plus
<code>If-None-Match</code> turn a repeat request into a cheap <b>304 Not Modified</b> with no body at
all. On the same mechanism, <code>If-Match</code> gives you optimistic concurrency — the update applies
only if the resource has not changed since you read it.</p>`,
docs:[['HTTP overview — MDN','https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview'],['HTTP response status codes — MDN','https://developer.mozilla.org/en-US/docs/Web/HTTP/Status']],
ex:{title:'Speak raw HTTP',lang:'http',
prompt:`Write a raw HTTP/1.1 request that creates a user: <code>POST</code> to path <code>/users</code> on host <code>api.dojo.dev</code>, declaring a JSON body (<code>Content-Type</code> header) and sending body <code>{"name": "Ada"}</code>. Then on the lines below it, write the <b>status line only</b> of the ideal response for: (a) success, (b) the same request with a malformed body, (c) missing auth token.`,
starter:`# request:


# a) success status line:

# b) malformed body:

# c) missing auth token:
`,
tests:[{d:'POST /users HTTP/1.1',re:'POST\\s+/users\\s+HTTP/1\\.1'},{d:'Host header',re:'Host:\\s*api\\.dojo\\.dev'},{d:'Content-Type: application/json',re:'Content-Type:\\s*application/json'},{d:'201 for creation',re:'HTTP/1\\.1\\s+201'},{d:'400 and 401 chosen correctly',re:'HTTP/1\\.1\\s+400[\\s\\S]*HTTP/1\\.1\\s+401'}],
behavior:`1. Request line, Host header, Content-Type header, blank line, then the JSON body. 2. (a) is 201 Created (not 200 — a resource was created). 3. (b) is 400 Bad Request. 4. (c) is 401 Unauthorized (authentication, not 403 which is authorization).`,
hints:['Shape: request line → headers → empty line → body.','Creating a resource successfully is <code>201 Created</code>.','401 = "who are you?" (no/invalid credentials). 403 = "I know who you are, and no."'],
solution:`# request:
POST /users HTTP/1.1
Host: api.dojo.dev
Content-Type: application/json

{"name": "Ada"}

# a) success status line:
HTTP/1.1 201 Created

# b) malformed body:
HTTP/1.1 400 Bad Request

# c) missing auth token:
HTTP/1.1 401 Unauthorized`}},
{id:'web2',title:'Servlets: Java meets HTTP',body:`
<p>A <b>servlet</b> is Java's low-level HTTP handler: the container (Tomcat, Jetty) parses the request and calls your <code>doGet</code>/<code>doPost</code> with request/response objects. Everything else — including Spring MVC — is built on this layer, which is why it's worth knowing even if you rarely write one raw.</p>
<div class="codeSample" data-hl>@WebServlet("/hello")
public class HelloServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        String name = req.getParameter("name");   // ?name=Ada
        resp.setStatus(200);
        resp.setContentType("text/html");
        resp.getWriter().println("&lt;h1&gt;Hello " + name + "&lt;/h1&gt;");
    }
}</div>
<p>One servlet instance serves all requests on multiple threads — instance fields are shared state, so keep servlets stateless. Lifecycle: <code>init()</code> once → <code>service()</code> per request (dispatches to doGet/doPost) → <code>destroy()</code>.</p>
<h4>The contract, and why it shapes everything above it</h4>
<p>A servlet container owns the socket, the thread pool and the HTTP parsing. Your code is a callback it
invokes with two objects: one you read the request from, one you write the response to. Every Java web
framework — Spring MVC included — is ultimately a servlet that dispatches to your code, which is why the
servlet model's assumptions leak upward into frameworks that seem to have nothing to do with it.</p>
<div class="codeSample" data-hl>request arrives
  -> container takes a THREAD from its pool
  -> finds the servlet by URL mapping
  -> calls service(), which dispatches to doGet / doPost / ...
  -> you write the response
  -> thread RETURNS TO THE POOL

// two consequences that explain most classic Java web behaviour:
// 1. one servlet INSTANCE serves every request concurrently
// 2. the thread is occupied for the whole request, including the time
//    spent waiting on a database - which is why pool exhaustion, not
//    CPU, is the usual failure mode under load</div>

<h4>Statelessness is not advice, it is a requirement</h4>
<p>Because there is one instance, an instance field is shared by every concurrent request. Storing the
current user in a field means two simultaneous requests can see each other's data — a data-leak bug that
never appears in local testing, appears intermittently in production, and cannot be reproduced on
demand.</p>
<p>Keep per-request data in local variables or request attributes. If you truly need per-request state
reachable from deep in the call stack, that is what <code>ThreadLocal</code> is for — and it must be
cleared in a <code>finally</code>, because the thread goes back to the pool and the next request inherits
whatever you left behind.</p>

<h4>Filters: the part you will actually use</h4>
<p>You will rarely write a raw servlet, but you will write filters. A filter wraps the chain and sees
every request before and after the handler, which is where authentication, logging, correlation ids,
compression and CORS live. It is exactly the model Spring Security is built on — its "filter chain" is
literally a chain of servlet filters — so understanding the shape here makes that framework legible.</p>
<div class="codeSample" data-hl>public void doFilter(req, resp, chain) {
    long start = System.nanoTime();
    try { chain.doFilter(req, resp); }          // NOT calling this ends
    finally { log(req, System.nanoTime()-start); }  // the request here
}</div>

<h4>The security point in the code above</h4>
<p>That example concatenates a request parameter straight into HTML. It is reflected <b>XSS</b>: a crafted
<code>?name=</code> injects script that runs in the victim's browser with their session. It is included
here deliberately, because raw servlet code makes it easy and templating engines make it hard — they
escape by default, which is a large part of why you should use one. Set the content type with a charset,
escape all output, and prefer a template over string concatenation.</p>`,
docs:[['Jakarta Servlet spec','https://jakarta.ee/specifications/servlet/'],['Intro to Servlets — Baeldung','https://www.baeldung.com/intro-to-servlets']],
ex:{title:'A greeting servlet',
prompt:`Write <code>GreetServlet extends HttpServlet</code> mapped with <code>@WebServlet("/greet")</code>. In <code>doGet</code>: read parameter <code>name</code>; if it's null or blank respond with status <code>400</code> and text <code>missing name</code>; otherwise status <code>200</code>, content type <code>text/plain</code>, body <code>Hello, &lt;name&gt;!</code>.`,
starter:`import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/greet")
public class GreetServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        // read "name", validate, respond
    }
}`,
tests:[{d:'Mapped to /greet',re:'@WebServlet\\s*\\(\\s*"/greet"\\s*\\)'},{d:'Reads the name parameter',re:'getParameter\\s*\\(\\s*"name"\\s*\\)'},{d:'400 path for missing name',re:'setStatus\\s*\\(\\s*400\\s*\\)|sendError\\s*\\(\\s*400'},{d:'Sets text/plain content type',re:'setContentType\\s*\\(\\s*"text/plain"\\s*\\)'},{d:'Writes the greeting',re:'Hello,?\\s*"?\\s*\\+\\s*name'}],
behavior:`1. GET /greet?name=Ada → 200, body "Hello, Ada!". 2. GET /greet (no param) → 400 with "missing name". 3. Blank name ("  ") also → 400. 4. Content type text/plain on the success path.`,
hints:['Read first: <code>String name = req.getParameter("name");</code> — it is null when absent.','Guard: <code>if (name == null || name.isBlank()) { resp.setStatus(400); resp.getWriter().print("missing name"); return; }</code> — note the return!','Success path: setStatus(200), setContentType("text/plain"), then <code>resp.getWriter().print("Hello, " + name + "!");</code>'],
solution:`import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/greet")
public class GreetServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        String name = req.getParameter("name");
        if (name == null || name.isBlank()) {
            resp.setStatus(400);
            resp.getWriter().print("missing name");
            return;
        }
        resp.setStatus(200);
        resp.setContentType("text/plain");
        resp.getWriter().print("Hello, " + name + "!");
    }
}`}},
{id:'web3',title:'The MVC pattern',body:`
<p><b>Model–View–Controller</b> separates the three things web code does: <b>Model</b> = domain data + business rules (knows nothing about HTTP), <b>View</b> = rendering (template/JSON, no logic beyond display), <b>Controller</b> = thin traffic cop: parse input → call model → pick view.</p>
<div class="codeSample" data-hl>// Model — pure domain
record Product(String id, String name, long priceCents) {}

class Catalog {
    Optional&lt;Product&gt; find(String id) { /* db lookup */ return Optional.empty(); }
}

// Controller — thin!
class ProductController {
    private final Catalog catalog;
    ProductController(Catalog catalog) { this.catalog = catalog; }

    String show(String id) {                       // returns a view name
        return catalog.find(id)
            .map(p -&gt; "product-page")              // view + model data
            .orElse("not-found");
    }
}</div>
<p>The test of good MVC: the model compiles without any web imports, and the controller has no business logic to unit-test. Fat controllers are the most common web anti-pattern.</p>
<h4>What the separation is actually protecting</h4>
<p>MVC is easy to recite and easy to implement in name only. The point is not three folders; it is that
<b>the part of your system that encodes business rules should not know it is on the web</b>.</p>
<p>When it does not, three things become possible: you can unit-test the rules without HTTP, you can expose
the same logic through a second entry point (a CLI, a queue consumer, a scheduled job) without touching
it, and you can change the web layer — REST to GraphQL, one framework to another — without risking the
rules. When the rules live in controllers, none of that is available, and the framework becomes something
you can never leave.</p>
<div class="codeSample" data-hl>// the test, and it is a real one you can run:
// does the model package compile with ZERO web imports?
//   no HttpServletRequest, no @RequestMapping, no ResponseEntity,
//   no Jackson annotations, no HTTP status codes

// if a domain class needs to know about 404, the layers have merged.</div>

<h4>The anti-pattern, and why it happens</h4>
<p>Fat controllers are not carelessness — they are the path of least resistance. The request object is
right there, the data is right there, and one <code>if</code> is quicker than a new class. It accumulates:
a validation here, a calculation there, a database call, and eventually the controller <i>is</i> the
application, untestable without a web context and unreusable anywhere else.</p>
<p>The counter-heuristic: a controller method should read as <b>parse, delegate, respond</b>. If there is
a branch on business meaning rather than on the outcome of a call, it belongs one layer down.</p>

<h4>Where the layers meet</h4>
<p>Two boundaries are worth being deliberate about. <b>Do not let domain objects be your API contract</b> —
serialising an entity straight to JSON means every internal rename is a breaking API change, and every
new field is accidentally public. Map to a DTO at the edge.</p>
<p>And <b>translate errors at the boundary</b>: the domain throws meaningful exceptions
(<code>InsufficientFunds</code>), and the web layer decides that becomes a 409. The domain should not know
what a status code is, and the controller should not be inventing business meaning.</p>

<h4>MVC's shape in modern applications</h4>
<p>With a JSON API and a JavaScript front end, the View has moved to the browser and the server's "view" is
the serialised response — but the split survives intact, and the naming in Spring reflects it directly:
<code>@Controller</code>/<code>@RestController</code> for the traffic cop, <code>@Service</code> for the
model's behaviour, <code>@Repository</code> for its persistence. Those annotations are the pattern with
labels attached; using them without the separation is decoration.</p>`,
docs:[['MVC — MDN glossary','https://developer.mozilla.org/en-US/docs/Glossary/MVC'],['Spring MVC explained — spring.io','https://docs.spring.io/spring-framework/reference/web/webmvc.html']],
ex:{title:'Untangle to MVC',
prompt:`Build a tiny MVC triple for a todo app: (1) Model — <code>record Todo(String id, String text, boolean done)</code> and class <code>TodoService</code> with a private list, <code>void add(Todo t)</code> and <code>java.util.List&lt;Todo&gt; open()</code> returning only not-done todos (stream, no HTTP imports anywhere). (2) View — class <code>TodoView</code> with <code>String render(java.util.List&lt;Todo&gt; todos)</code> returning one line per todo formatted <code>[ ] text</code>. (3) Controller — class <code>TodoController</code> that takes both in its constructor and has <code>String openTodosPage()</code> = render(service.open()).`,
starter:`import java.util.*;

// MODEL
record Todo(String id, String text, boolean done) {}

class TodoService {
    // list + add + open()
}

// VIEW
class TodoView {
    // String render(List<Todo>)
}

// CONTROLLER
class TodoController {
    // wires service + view; openTodosPage()
}`,
tests:[{d:'Todo is a record',re:'record\\s+Todo\\s*\\('},{d:'Service filters done with a stream',re:'open\\s*\\(\\s*\\)[\\s\\S]*?filter\\s*\\('},{d:'View builds the [ ] lines',re:'\\[\\s*\\]'},{d:'Controller takes service and view in constructor',re:'TodoController\\s*\\(\\s*TodoService\\s+\\w+\\s*,\\s*TodoView\\s+\\w+\\s*\\)'},{d:'No servlet/HTTP imports',re:'import\\s+(jakarta|javax)\\.servlet',not:true}],
behavior:`1. add two todos (one done) → open() returns only the undone one. 2. render(List.of(new Todo("1","buy milk",false))) returns "[ ] buy milk". 3. controller.openTodosPage() equals view.render(service.open()). 4. Zero web/HTTP types anywhere — that separation IS the exercise.`,
hints:['open(): <code>return todos.stream().filter(t -> !t.done()).toList();</code>','render(): StringBuilder or stream+joining — one line per todo: <code>"[ ] " + t.text()</code>.','The controller is 3 lines: two final fields set in the constructor and <code>return view.render(service.open());</code> — if it grows past that, logic is leaking in.'],
solution:`import java.util.*;
import java.util.stream.Collectors;

// MODEL
record Todo(String id, String text, boolean done) {}

class TodoService {
    private final List<Todo> todos = new ArrayList<>();

    void add(Todo t) { todos.add(t); }

    List<Todo> open() {
        return todos.stream().filter(t -> !t.done()).toList();
    }
}

// VIEW
class TodoView {
    String render(List<Todo> todos) {
        return todos.stream()
                .map(t -> "[ ] " + t.text())
                .collect(Collectors.joining("\\n"));
    }
}

// CONTROLLER
class TodoController {
    private final TodoService service;
    private final TodoView view;

    TodoController(TodoService service, TodoView view) {
        this.service = service;
        this.view = view;
    }

    String openTodosPage() {
        return view.render(service.open());
    }
}`}},
{id:'web4',title:'Sessions, cookies & security basics',body:`
<p>HTTP is stateless, so state rides in <b>cookies</b> — typically one session-id cookie pointing at server-side session data. This is exactly the machinery CIAM lives on, and where the classic attacks aim:</p>
<ul>
<li><b>Cookie flags</b>: <code>HttpOnly</code> (JS can't read it — blunts XSS token theft), <code>Secure</code> (HTTPS only), <code>SameSite=Lax/Strict</code> (blunts CSRF).</li>
<li><b>XSS</b>: never put unescaped user input into HTML. Escape output; set a Content-Security-Policy.</li>
<li><b>CSRF</b>: state-changing endpoints need a CSRF token or SameSite cookies — a hostile site can make the browser send your cookies, not read them.</li>
<li><b>Session fixation</b>: rotate the session id at login.</li>
</ul>
<div class="codeSample" data-hl>Cookie c = new Cookie("SESSION", id);
c.setHttpOnly(true);
c.setSecure(true);
c.setPath("/");
resp.addCookie(c);
// or the modern header form:
resp.setHeader("Set-Cookie",
    "SESSION=" + id + "; HttpOnly; Secure; SameSite=Lax; Path=/");</div>
<h4>Why cookies exist and what that costs</h4>
<p>HTTP has no memory: every request is independent, and the server cannot tell that two of them came from
the same person. A cookie solves that by having the browser attach a value to every request to the
domain — <b>automatically</b>, which is both the feature and the entire source of the attacks below.</p>
<p>That single word explains CSRF completely. A malicious page cannot read your cookies, but it can cause
your browser to <i>send</i> them, because the browser attaches them to any request to that domain
regardless of which page triggered it.</p>

<h4>The flags, and what each one actually stops</h4>
<div class="codeSample" data-hl>HttpOnly   JavaScript cannot read document.cookie for this cookie.
           -> an XSS payload cannot exfiltrate the session id.
           -> it CAN still make authenticated requests from the page.
              XSS is not "mitigated" by HttpOnly, only made less
              immediately profitable.

Secure     never sent over plain HTTP. stops passive network capture.

SameSite   Lax    not sent on cross-site POSTs / iframes / XHR
                  (sent on top-level GET navigation - so a GET that
                   changes state is still exposed. never do that.)
           Strict not sent on ANY cross-site request, including a normal
                  link from another site - which logs users out visibly
           None   sent everywhere; REQUIRES Secure. only for deliberate
                  cross-site use, and third-party cookie blocking is
                  removing even that

__Host-    prefix: browser enforces Secure, Path=/, and no Domain.
           free defence against a subdomain overwriting your cookie</div>

<h4>The three attacks, stated as one sentence each</h4>
<p><b>XSS</b> — your page executes attacker-supplied script, so the attacker runs as the user. The defence
is output encoding, contextual and everywhere, plus a Content-Security-Policy as the second line. Note
that escaping is context-dependent: what is safe inside HTML text is not safe inside an attribute, a URL
or a <code>&lt;script&gt;</code> block.</p>
<p><b>CSRF</b> — the attacker's page causes the browser to send an authenticated request the user did not
intend. The defence is a token the attacker cannot read (synchroniser or double-submit) and
<code>SameSite</code> cookies. APIs authenticated by an <code>Authorization</code> header are not
vulnerable, because that header is not attached automatically — which is why disabling CSRF protection is
correct for a stateless API and wrong the moment anything authenticates by cookie.</p>
<p><b>Session fixation</b> — the attacker plants a session id, waits for the victim to authenticate into
it, and then uses it. The defence is one line: <b>issue a new session id at login</b>, and again on any
privilege change.</p>

<h4>What the flags cannot do</h4>
<p>None of this ends a session. Logging out has to change server state — delete the session record or
denylist the token — because deleting the cookie leaves any captured copy working until it expires.
Rotate on privilege change, cap absolute session lifetime independently of activity, and make sure there
is a tested path to revoke every session for a compromised account.</p>`,
docs:[['HTTP cookies — MDN','https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies'],['OWASP Session Management Cheat Sheet','https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html'],['OWASP XSS Prevention','https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html']],
ex:{title:'Harden the cookie',
prompt:`Write class <code>SessionIssuer</code> with <code>static String issue(String sessionId)</code> returning a complete <code>Set-Cookie</code> header <b>value</b> for cookie <code>SESSION</code> that is: HttpOnly, Secure, SameSite=Lax, Path=/ . Also add <code>static boolean looksSafe(String headerValue)</code> that returns true only if the value contains all four protections (use contains checks).`,
starter:`public class SessionIssuer {
    static String issue(String sessionId) {
        // "SESSION=<id>; ..." — add the four protections
        return null;
    }

    static boolean looksSafe(String headerValue) {
        return false;
    }
}`,
tests:[{d:'Builds SESSION=<id>',re:'"SESSION="\\s*\\+\\s*sessionId'},{d:'HttpOnly present',re:'HttpOnly'},{d:'Secure present',re:'Secure'},{d:'SameSite=Lax present',re:'SameSite=Lax'},{d:'looksSafe checks all four',re:'looksSafe[\\s\\S]*contains[\\s\\S]*contains[\\s\\S]*contains[\\s\\S]*contains'}],
behavior:`1. issue("abc") returns a single header value starting "SESSION=abc" containing HttpOnly, Secure, SameSite=Lax and Path=/ separated by "; ". 2. looksSafe(issue("x")) == true. 3. looksSafe("SESSION=x; Secure") == false (missing the rest).`,
hints:['Concatenate: <code>"SESSION=" + sessionId + "; HttpOnly; Secure; SameSite=Lax; Path=/"</code>','looksSafe: <code>headerValue.contains("HttpOnly") && headerValue.contains("Secure") && ...</code>','Why each flag matters: HttpOnly vs XSS theft, Secure vs plaintext leak, SameSite vs CSRF, Path scopes it.'],
solution:`public class SessionIssuer {
    static String issue(String sessionId) {
        return "SESSION=" + sessionId + "; HttpOnly; Secure; SameSite=Lax; Path=/";
    }

    static boolean looksSafe(String headerValue) {
        return headerValue.contains("HttpOnly")
            && headerValue.contains("Secure")
            && headerValue.contains("SameSite=Lax")
            && headerValue.contains("Path=/");
    }
}`}},
{id:'web8',title:'HTTP status codes: saying what happened',body:`
<p>The status code is your API&#8217;s one-line summary of what happened. Clients branch on it, caches and proxies obey it, and monitoring counts it — so returning the <i>right</i> code matters as much as the body. Codes come in five families, keyed by the first digit:</p>
<ul>
<li><b>1xx Informational</b> — rare in app code (e.g. <code>100 Continue</code>).</li>
<li><b>2xx Success</b> — it worked. <code>200 OK</code> (general success), <code>201 Created</code> (a POST made a resource — return its <code>Location</code>), <code>202 Accepted</code> (queued, not done yet), <code>204 No Content</code> (success with nothing to return, e.g. a DELETE).</li>
<li><b>3xx Redirection</b> — look elsewhere. <code>301 Moved Permanently</code>, <code>302 Found</code> (temporary), <code>304 Not Modified</code> (the cache/ETag matched, save bandwidth).</li>
<li><b>4xx Client error</b> — the caller got it wrong. <code>400 Bad Request</code> (malformed), <code>401 Unauthorized</code> (not authenticated — you must log in), <code>403 Forbidden</code> (authenticated but not allowed), <code>404 Not Found</code>, <code>405 Method Not Allowed</code>, <code>409 Conflict</code> (version/duplicate clash), <code>410 Gone</code>, <code>422 Unprocessable Entity</code> (well-formed but semantically invalid), <code>429 Too Many Requests</code> (rate limited — send <code>Retry-After</code>).</li>
<li><b>5xx Server error</b> — your side broke. <code>500 Internal Server Error</code>, <code>502 Bad Gateway</code>, <code>503 Service Unavailable</code>, <code>504 Gateway Timeout</code>.</li>
</ul>
<p>Two distinctions trip people up. <b>401 vs 403</b>: 401 means "I do not know who you are" (authenticate), 403 means "I know who you are and you still cannot" (authorization). <b>400 vs 422</b>: 400 is unparseable, 422 parsed fine but violates a business rule. And never hide failures behind <code>200</code> with an error in the body — clients, caches, and dashboards all trust the code, so a wrong code is a lie the whole system believes.</p>`,
docs:[['HTTP status codes — MDN','https://developer.mozilla.org/en-US/docs/Web/HTTP/Status'],['Status code registry — IANA','https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml']],
exs:[{title:'Classify and name codes',
prompt:`Write class <code>Http</code> with two static methods. <code>String category(int code)</code> returns the family: <code>"informational"</code> for 100&#8211;199, <code>"success"</code> for 200&#8211;299, <code>"redirect"</code> for 300&#8211;399, <code>"client error"</code> for 400&#8211;499, <code>"server error"</code> for 500&#8211;599, else <code>"unknown"</code>. <code>String reason(int code)</code> maps common codes: 200→<code>"OK"</code>, 201→<code>"Created"</code>, 204→<code>"No Content"</code>, 400→<code>"Bad Request"</code>, 401→<code>"Unauthorized"</code>, 403→<code>"Forbidden"</code>, 404→<code>"Not Found"</code>, 409→<code>"Conflict"</code>, 429→<code>"Too Many Requests"</code>, 500→<code>"Internal Server Error"</code>, else <code>"unknown"</code>.`,
starter:`public class Http {
    static String category(int code) {
        return null;
    }
    static String reason(int code) {
        return null;
    }
}`,
solution:`public class Http {
    static String category(int code) {
        if (code >= 100 && code < 200) return "informational";
        if (code >= 200 && code < 300) return "success";
        if (code >= 300 && code < 400) return "redirect";
        if (code >= 400 && code < 500) return "client error";
        if (code >= 500 && code < 600) return "server error";
        return "unknown";
    }
    static String reason(int code) {
        switch (code) {
            case 200: return "OK";
            case 201: return "Created";
            case 204: return "No Content";
            case 400: return "Bad Request";
            case 401: return "Unauthorized";
            case 403: return "Forbidden";
            case 404: return "Not Found";
            case 409: return "Conflict";
            case 429: return "Too Many Requests";
            case 500: return "Internal Server Error";
            default:  return "unknown";
        }
    }
}`,
tests:[{d:'2xx maps to success',re:'<\\s*300\\s*\\)\\s*return\\s+"success"'},{d:'3xx maps to redirect',re:'<\\s*400\\s*\\)\\s*return\\s+"redirect"'},{d:'4xx maps to client error',re:'<\\s*500\\s*\\)\\s*return\\s+"client error"'},{d:'5xx maps to server error',re:'<\\s*600\\s*\\)\\s*return\\s+"server error"'},{d:'201 is Created',re:'case\\s+201\\s*:\\s*return\\s+"Created"'},{d:'401 is Unauthorized',re:'case\\s+401\\s*:\\s*return\\s+"Unauthorized"'},{d:'404 is Not Found',re:'case\\s+404\\s*:\\s*return\\s+"Not Found"'},{d:'429 is Too Many Requests',re:'case\\s+429\\s*:\\s*return\\s+"Too Many Requests"'},{d:'500 is Internal Server Error',re:'case\\s+500\\s*:\\s*return\\s+"Internal Server Error"'}],
behavior:`category(204) is "success", category(301) is "redirect", category(404) is "client error", category(503) is "server error", category(600) is "unknown". reason(201) is "Created", reason(401) is "Unauthorized", reason(429) is "Too Many Requests". 401 means authenticate; 403 means not allowed.`,
hints:['Category is decided by the first digit: test ranges like code >= 200 && code < 300 in order.','A switch on code maps the common numbers to their reason phrases, with default returning unknown.','Remember 401 is authentication (who are you) and 403 is authorization (you cannot), and 201 pairs with a Location header.']},
{title:'Say what happened',lang:'js',diff:'easy',
run:{call:'statusFor',cases:[{"name": "a resource was created", "args": ["created"], "expect": 201}, {"name": "accepted for async processing", "args": ["accepted"], "expect": 202}, {"name": "success with nothing to return", "args": ["no-content"], "expect": 204}, {"name": "the client sent something invalid", "args": ["bad-request"], "expect": 400}, {"name": "authenticated but not permitted", "args": ["forbidden"], "expect": 403}, {"name": "a state conflict", "args": ["conflict"], "expect": 409}, {"name": "too many requests", "args": ["rate-limited"], "expect": 429}, {"name": "an unknown outcome falls back to 500", "args": ["mystery"], "expect": 500}]},
prompt:`Write <code>function statusFor(kind)</code> mapping an outcome name to its HTTP status code: <code>ok</code> 200, <code>created</code> 201, <code>accepted</code> 202, <code>no-content</code> 204, <code>bad-request</code> 400, <code>unauthorized</code> 401, <code>forbidden</code> 403, <code>not-found</code> 404, <code>conflict</code> 409, <code>unprocessable</code> 422, <code>rate-limited</code> 429, and anything unknown 500.`,
starter:`function statusFor(kind) {\n  return 500;\n}`,
solution:`function statusFor(kind) {\n  const map = { ok: 200, created: 201, accepted: 202, "no-content": 204,\n    "bad-request": 400, unauthorized: 401, forbidden: 403, "not-found": 404,\n    conflict: 409, unprocessable: 422, "rate-limited": 429, "server-error": 500 };\n  return map[kind] ?? 500;   // unknown outcome: our fault, not theirs\n}`,
tests:[{d:'a lookup table maps outcomes to codes',re:'\\{[^}]*created'},{d:'created is 201',re:'201'},{d:'conflict is 409',re:'409'},{d:'an unknown value falls back',re:'\\?\\?|undefined|\\|\\|'}],
behavior:`Eight cases execute. Two pairs are worth committing to memory because they are confused constantly. 401 versus 403: 401 means "I do not know who you are" and invites a credential, while 403 means "I know exactly who you are and the answer is no" — returning 401 for a permission failure sends clients into a pointless re-authentication loop. And 400 versus 422: malformed syntax versus syntactically valid but semantically wrong. The unknown case defaults to 500 rather than 200 because an outcome your code does not recognise is a server-side problem, and defaulting to success is how failures reach users as empty screens.`,
hints:['A plain object literal is the lookup table.','?? supplies the fallback for a key that is not present.','201 for created, 204 for success with no body, 409 for a conflict of state.']}]},
{id:'web9',title:'Pagination & building compliant, standardized APIs',body:`
<p>An endpoint that returns "all the orders" works in a demo and falls over in production. Real collections are paginated. Two styles dominate:</p>
<ul>
<li><b>Offset / limit</b> (<code>?page=3&amp;size=20</code> or <code>?offset=40&amp;limit=20</code>) — simple and lets you jump to any page, but it gets slow at deep offsets and can skip or duplicate rows when data is inserted between requests.</li>
<li><b>Cursor / keyset</b> (<code>?after=&lt;opaque-cursor&gt;</code>) — the server returns an opaque pointer to "where you left off." Stable under inserts and fast at any depth, which is why large, changing datasets use it. The trade-off is you cannot jump to an arbitrary page.</li>
</ul>
<p>Whatever the style, make it <b>discoverable and consistent</b>: return the page of data plus links to the next/previous pages. The standard mechanism is the <b>Link header</b> (RFC 8288) with <code>rel="next"</code> and <code>rel="prev"</code>, or an equivalent envelope in the body.</p>
<p>"Compliant and standardized" means following the conventions clients already expect, so your API is predictable:</p>
<ul>
<li><b>Correct status codes</b> and, for errors, a standard shape — <b>RFC 7807</b> <code>application/problem+json</code> instead of ad-hoc error bodies.</li>
<li><b>Consistent naming</b> (pick snake_case or camelCase and never mix), <b>ISO 8601</b> timestamps, and stable field names.</li>
<li><b>Content negotiation</b> via <code>Accept</code>, <b>idempotency keys</b> for safe retries of writes, and <b>rate-limit headers</b> so clients can back off.</li>
</ul>

<h4>Why deep offsets get slow, precisely</h4>
<p><code>OFFSET 100000</code> does not skip ahead. The database produces the first hundred thousand rows,
in order, and discards them — so the last page of a report is the slowest query in the system, and it gets
slower as the table grows. Keyset pagination replaces the offset with a <code>WHERE</code> on the last key
you saw, so every page reads exactly one page's worth however deep you are.</p>
<p>The correctness problem is worse than the speed one. Between page 2 and page 3, someone inserts a row
near the top: every subsequent row shifts down one, so an item that was going to be first on page 3 is now
last on page 2 — the reader never sees it. Deletes cause the mirror problem and show an item twice. Keyset
pagination is immune, because it is anchored to a value rather than to a count.</p>

<h4>What makes a cursor opaque, and why bother</h4>
<p>A cursor is usually the sort key of the last row, encoded. Encoding it — base64 of
<code>{"updated_at":"…","id":123}</code> — is not obfuscation for its own sake. It stops clients parsing
and constructing cursors, which is what would freeze your sort key into a public contract you can never
change. Make it opaque and the ordering stays an implementation detail.</p>
<p>Two rules make cursors work: <b>sort on something unique</b>, or append the primary key as a tie-break,
because rows sharing a timestamp will otherwise be skipped or repeated at the boundary. And validate the
cursor server-side, since it arrives from the client like anything else.</p>

<h4>The rest of the contract</h4>
<ul>
<li><b>Always cap the page size.</b> An unbounded <code>limit</code> is a denial-of-service parameter your
API is offering to strangers. Clamp it, and document the maximum.</li>
<li><b>Be honest about totals.</b> An exact <code>COUNT(*)</code> on every page is often the most expensive
part of the request. Either omit it, or return an estimate labelled as one.</li>
<li><b>Keep the ordering stable and explicit.</b> Pagination over an unspecified order is undefined
behaviour that happens to work until the query plan changes.</li>
</ul>`,
docs:[['Web Linking (RFC 8288)','https://www.rfc-editor.org/rfc/rfc8288'],['Problem Details (RFC 7807)','https://www.rfc-editor.org/rfc/rfc7807'],['API design guide — Google','https://cloud.google.com/apis/design']],
exs:[{title:'Pagination choice & error compliance',
prompt:`Write class <code>Paging</code> with two static methods. <code>String style(String need)</code>: <code>"stable-large-dataset"</code>→<code>"cursor"</code>, <code>"jump-to-page"</code>→<code>"offset"</code>, else <code>"unknown"</code>. <code>boolean compliantErrors(String contentType)</code>: return true only when errors use the standard <code>"application/problem+json"</code> media type.`,
starter:`public class Paging {
    static String style(String need) {
        return null;
    }
    static boolean compliantErrors(String contentType) {
        return false;
    }
}`,
solution:`public class Paging {
    static String style(String need) {
        switch (need) {
            case "stable-large-dataset": return "cursor";
            case "jump-to-page":         return "offset";
            default:                     return "unknown";
        }
    }
    static boolean compliantErrors(String contentType) {
        return contentType.equals("application/problem+json");
    }
}`,
tests:[{d:'large stable datasets use cursor pagination',re:'"stable-large-dataset".*?"cursor"',flags:'s'},{d:'jump-to-page uses offset pagination',re:'"jump-to-page".*?"offset"',flags:'s'},{d:'errors use RFC 7807 problem+json',re:'equals\\s*\\(\\s*"application/problem\\+json"\\s*\\)'},{d:'unknown default',re:'"unknown"'}],
behavior:`style("stable-large-dataset") is "cursor", style("jump-to-page") is "offset". compliantErrors("application/problem+json") is true; compliantErrors("text/plain") is false. Standard error bodies and next/prev links make an API predictable.`,
hints:['Cursor/keyset pagination is stable and fast for large, changing datasets; offset lets you jump to a page.','A compliant error body uses the application/problem+json media type (RFC 7807).','Escape nothing special — just compare the content type with equals.']},
{title:'Keyset pagination cursor',lang:'js',diff:'medium',
run:{call:'nextCursor',cases:[{"name": "a full page means there may be more", "args": [[{"id": 1}, {"id": 2}], 2], "expect": "2"}, {"name": "a short page is the last page", "args": [[{"id": 1}], 2], "expect": null}, {"name": "an empty page has no cursor", "args": [[], 2], "expect": null}, {"name": "the cursor is the LAST row, not the first", "args": [[{"id": 7}, {"id": 9}], 2], "expect": "9"}]},
prompt:`Write <code>function nextCursor(rows, limit)</code> returning the cursor for the next page — the <code>id</code> of the <b>last</b> row, as a string — or <code>null</code> when this page is not full, because a short page means there is nothing after it.`,
starter:`function nextCursor(rows, limit) {\n  return null;\n}`,
solution:`function nextCursor(rows, limit) {\n  if (rows.length < limit) return null;         // short page = last page\n  return String(rows[rows.length - 1].id);\n}`,
tests:[{d:'a short page ends pagination',re:'length\\s*<\\s*limit|length\\s*!==\\s*limit'},{d:'the last row supplies the cursor',re:'length\\s*-\\s*1|at\\s*\\(\\s*-1'},{d:'the cursor is a string',re:'String\\s*\\(|`|toString'},{d:'null ends the sequence',re:'null'}],
behavior:`Four cases run. The last one is the whole idea: the cursor points at where the next page should START AFTER, so it must come from the final row — taking the first row makes every page after the first repeat rows already sent. Returning null on a short page is what lets a client stop without an extra request, and it is why keyset pagination has no "total pages": it never counts what it has not read. Compare with OFFSET, where page 10,000 forces the database to produce and discard 200,000 rows.`,
hints:['A page shorter than the limit means there is no page after it.','The cursor comes from the last element of the array.','Cursors travel in URLs, so return a string rather than a number.']}]},
{id:'web10',title:'API versioning',body:`
<p>Once other people depend on your API, you cannot freely change it — a removed field or renamed route breaks their code overnight. <b>Versioning</b> lets you evolve the API while old clients keep working. There are three common places to put the version:</p>
<ul>
<li><b>URI path</b> — <code>/v1/orders</code>. The most common and most visible; trivial to route and to see in logs. Purists dislike that the "same" resource has multiple URLs.</li>
<li><b>Header</b> — a custom header like <code>Api-Version: 1</code>. Keeps URLs clean but is invisible in a browser and easy to forget.</li>
<li><b>Media type</b> (content negotiation) — <code>Accept: application/vnd.acme.v1+json</code>. The most "RESTful" option; also the most complex for clients.</li>
</ul>
<p>The discipline behind the mechanism matters more than the mechanism. Follow <b>semantic versioning</b> thinking: only a <b>breaking change</b> — removing or renaming a field, changing a type, or altering behavior clients rely on — needs a new major version. <b>Additive</b> changes (a new optional field, a new endpoint) are backward-compatible and should <i>not</i> force a version bump. When you do retire a version, announce it: the <code>Deprecation</code> and <code>Sunset</code> response headers tell clients a version is going away and by when.</p>

<h4>What actually counts as breaking</h4>
<p>The version debate is easier once the categories are clear. <b>Safe:</b> adding an optional request field, adding a response field, adding an endpoint, adding an enum value <i>if</i> clients were told to tolerate unknown ones. <b>Breaking:</b> removing or renaming anything, changing a type (<code>"123"</code> to <code>123</code> breaks strict parsers), making an optional field required, tightening validation, changing default behaviour, changing an error's shape or status code.</p>
<p>Two are argued about and both are breaking in practice: <b>adding an enum value</b> when clients switch exhaustively on it, and <b>changing pagination defaults</b>, because a client that assumed twenty items now silently processes fifty. If in doubt, ask what a consumer wrote against your response — the contract is what they can observe, not what you documented.</p>

<h4>The cost of a new version</h4>
<p>Every live version is code to maintain, tests to run, and a security patch to apply in n places. That cost is why the goal is <b>not to need one</b>: additive change, tolerant readers, and feature flags carry an API a surprisingly long way. When a major version is genuinely necessary, plan the retirement at the same time as the release — a version with no sunset date is a version you will still be running in five years.</p>

<h4>Making a migration actually happen</h4>
<ul>
<li><b>Measure who is on the old version.</b> Log the version and the client identifier per request; without that you are negotiating in the dark and cannot tell whether anyone would notice.</li>
<li><b>Announce with headers, not only email.</b> <code>Deprecation: true</code> and <code>Sunset: &lt;date&gt;</code> travel with the response, and a <code>Link</code> header can point at the migration guide.</li>
<li><b>Run brownouts.</b> Short, scheduled windows where the old version returns errors surface the clients that missed every announcement — while a rollback is still one config change away.</li>
<li><b>Give the laggards a name.</b> Migrations complete when someone owns each remaining consumer, not when the deadline passes.</li>
</ul>
<p>Internally, the same discipline is what makes expand-and-contract work: add the new field, migrate consumers, remove the old one — three deploys, no version bump, and no flag day.</p>`,
docs:[['API versioning — Microsoft REST guidelines','https://github.com/microsoft/api-guidelines'],['Semantic Versioning','https://semver.org/'],['Sunset header (RFC 8594)','https://www.rfc-editor.org/rfc/rfc8594']],
ex:{title:'Version placement & breaking changes',
prompt:`Write class <code>Versioning</code> with two static methods. <code>String location(String strategy)</code>: <code>"uri"</code>→<code>"/v1/orders"</code>, <code>"header"</code>→<code>"Api-Version: 1"</code>, <code>"media-type"</code>→<code>"application/vnd.acme.v1+json"</code>, else <code>"unknown"</code>. <code>boolean breakingChange(String change)</code>: removing or renaming a field breaks clients — return true for <code>"remove-field"</code> or <code>"rename-field"</code>, false otherwise (e.g. adding a field).`,
starter:`public class Versioning {
    static String location(String strategy) {
        return null;
    }
    static boolean breakingChange(String change) {
        return false;
    }
}`,
solution:`public class Versioning {
    static String location(String strategy) {
        switch (strategy) {
            case "uri":        return "/v1/orders";
            case "header":     return "Api-Version: 1";
            case "media-type": return "application/vnd.acme.v1+json";
            default:           return "unknown";
        }
    }
    static boolean breakingChange(String change) {
        return change.equals("remove-field") || change.equals("rename-field");
    }
}`,
tests:[{d:'URI versioning looks like /v1/orders',re:'"uri".*?"/v1/orders"',flags:'s'},{d:'header versioning uses Api-Version',re:'"header".*?"Api-Version: 1"',flags:'s'},{d:'media-type versioning uses vnd.acme.v1+json',re:'"media-type".*?"application/vnd.acme.v1\\+json"',flags:'s'},{d:'removing a field is breaking',re:'equals\\s*\\(\\s*"remove-field"\\s*\\)'},{d:'renaming a field is breaking',re:'equals\\s*\\(\\s*"rename-field"\\s*\\)'},{d:'combined with OR',re:'\\|\\|'}],
behavior:`location("uri") is "/v1/orders", location("header") is "Api-Version: 1", location("media-type") is "application/vnd.acme.v1+json". breakingChange("remove-field") and ("rename-field") are true; adding an optional field is not breaking, so it returns false.`,
hints:['URI versioning is the most common and most visible; media-type versioning is the most RESTful.','Only breaking changes (remove/rename/retype) need a new major version; additive changes do not.','Combine the two breaking cases with ||.']}}
]});
