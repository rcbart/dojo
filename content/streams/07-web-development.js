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
}`}}
]});
