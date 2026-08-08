STREAMS.push({icon:'🌐',title:'Web Development',blurb:'HTTP from first principles, servlets, the MVC pattern, sessions & web security.',lessons:[
{id:'web1',title:'HTTP fundamentals',body:`
<p>Everything on the web is a text conversation: a client sends a <b>request</b> (method, path, headers, optional body), the server answers with a <b>response</b> (status code, headers, body). HTTP is stateless — every request stands alone.</p>
<div class="codeSample">GET /users/42 HTTP/1.1
Host: api.example.com
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

{"id": 42, "name": "Ada"}</div>
<p>Methods: <code>GET</code> (read, safe), <code>POST</code> (create/act), <code>PUT</code> (replace), <code>PATCH</code> (partial update), <code>DELETE</code>. Status families: <b>2xx</b> success, <b>3xx</b> redirect, <b>4xx</b> client's fault (400 bad request, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict), <b>5xx</b> server's fault. Headers carry metadata: <code>Content-Type</code>, <code>Authorization</code>, <code>Cache-Control</code>.</p>`,
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
<p>One servlet instance serves all requests on multiple threads — instance fields are shared state, so keep servlets stateless. Lifecycle: <code>init()</code> once → <code>service()</code> per request (dispatches to doGet/doPost) → <code>destroy()</code>.</p>`,
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
<p>The test of good MVC: the model compiles without any web imports, and the controller has no business logic to unit-test. Fat controllers are the most common web anti-pattern.</p>`,
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
    "SESSION=" + id + "; HttpOnly; Secure; SameSite=Lax; Path=/");</div>`,
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
ex:{title:'Classify and name codes',
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
hints:['Category is decided by the first digit: test ranges like code >= 200 && code < 300 in order.','A switch on code maps the common numbers to their reason phrases, with default returning unknown.','Remember 401 is authentication (who are you) and 403 is authorization (you cannot), and 201 pairs with a Location header.']}},
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
</ul>`,
docs:[['Web Linking (RFC 8288)','https://www.rfc-editor.org/rfc/rfc8288'],['Problem Details (RFC 7807)','https://www.rfc-editor.org/rfc/rfc7807'],['API design guide — Google','https://cloud.google.com/apis/design']],
ex:{title:'Pagination choice & error compliance',
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
hints:['Cursor/keyset pagination is stable and fast for large, changing datasets; offset lets you jump to a page.','A compliant error body uses the application/problem+json media type (RFC 7807).','Escape nothing special — just compare the content type with equals.']}},
{id:'web10',title:'API versioning',body:`
<p>Once other people depend on your API, you cannot freely change it — a removed field or renamed route breaks their code overnight. <b>Versioning</b> lets you evolve the API while old clients keep working. There are three common places to put the version:</p>
<ul>
<li><b>URI path</b> — <code>/v1/orders</code>. The most common and most visible; trivial to route and to see in logs. Purists dislike that the "same" resource has multiple URLs.</li>
<li><b>Header</b> — a custom header like <code>Api-Version: 1</code>. Keeps URLs clean but is invisible in a browser and easy to forget.</li>
<li><b>Media type</b> (content negotiation) — <code>Accept: application/vnd.acme.v1+json</code>. The most "RESTful" option; also the most complex for clients.</li>
</ul>
<p>The discipline behind the mechanism matters more than the mechanism. Follow <b>semantic versioning</b> thinking: only a <b>breaking change</b> — removing or renaming a field, changing a type, or altering behavior clients rely on — needs a new major version. <b>Additive</b> changes (a new optional field, a new endpoint) are backward-compatible and should <i>not</i> force a version bump. When you do retire a version, announce it: the <code>Deprecation</code> and <code>Sunset</code> response headers tell clients a version is going away and by when.</p>`,
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
