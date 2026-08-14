STREAMS.push({icon:'🧯',title:'Exception Handling',blurb:'try/catch to custom exceptions, try-with-resources, and professional error-handling practice.',lessons:[
{id:'exc1',title:'try / catch / finally & the exception hierarchy',body:`
<p>🌱 <b>Starting from zero:</b> things go wrong while programs run — a file is missing, text that should be a number reads "abc", the network dies mid-request. An <b>exception</b> is Java\u0027s fire alarm: when an operation cannot do its job, it stops normal execution and throws an alarm object up to whoever is prepared to handle it. Code that\u0027s prepared says "try this, and if that alarm goes off, do this instead" — which is exactly what the <code>try/catch</code> syntax below reads as. This stream teaches when alarms fire, how to respond, and how to raise your own.</p>
<p>All throwables descend from <code>Throwable</code>: <code>Error</code> (JVM-level, don't catch), and <code>Exception</code>. <b>Checked</b> exceptions (e.g. <code>IOException</code>) must be caught or declared with <code>throws</code>; <b>unchecked</b> (<code>RuntimeException</code> and subclasses like <code>NullPointerException</code>, <code>IllegalArgumentException</code>) need no declaration — they usually signal bugs or bad input.</p>
<div class="codeSample" data-hl>try {
    int n = Integer.parseInt(input);       // throws NumberFormatException
} catch (NumberFormatException e) {
    System.err.println("Not a number: " + e.getMessage());
} finally {
    System.out.println("always runs");     // cleanup — even after a throw
}</div>
<p>Catch the <i>most specific</i> type you can handle. Catching bare <code>Exception</code> hides bugs.</p>

<h4>Checked versus unchecked, decided rather than inherited</h4>
<p>The distinction is about <b>who can do something about it</b>. A checked exception is a documented, expected outcome the caller may reasonably recover from — the file might not be there, the remote service might be down. An unchecked exception says the program is wrong: a null where one was not allowed, an argument outside its contract. The compiler enforces the first and ignores the second, which is why the choice belongs to the API designer and not to convenience.</p>
<p>The rule that follows: catch what you can act on. A <code>catch (Exception e)</code> at the top of a method swallows the NullPointerException that means you have a bug alongside the IOException you meant to retry, and the bug then surfaces days later as missing data rather than as a stack trace.</p>

<h4>finally, and the two ways to lose an exception</h4>
<p><code>finally</code> runs whether the block completes, throws, or returns — which makes it the right place for cleanup and the wrong place for control flow. Two specific traps:</p>
<div class="codeSample">try { return compute(); }
finally { return fallback(); }   // DISCARDS the exception AND the value
try { risky(); }
catch (IOException e) { throw new IllegalStateException("failed"); }  // cause LOST</div>
<p>A <code>return</code> inside <code>finally</code> silently replaces whatever was in flight, including an exception on its way up. And rethrowing without passing the cause — <code>new IllegalStateException("failed", e)</code> — throws away the stack trace that says what actually went wrong. Both compile, both look defensive, and both destroy the information an incident needs.</p>

<h4>Reading a stack trace</h4>
<p>Top line is what was thrown and where; each line below is the caller beneath it; <code>Caused by:</code> sections read the same way, and the <b>deepest</b> cause is usually the real one. Frames marked <code>... 24 more</code> are shared with the trace above. The habit that saves the most time: scroll to the last <code>Caused by</code> first, then find the topmost frame in <i>your</i> package — that is the line to open.</p>`,
docs:[['Exceptions — Oracle Trail','https://docs.oracle.com/javase/tutorial/essential/exceptions/index.html'],['Checked vs unchecked — Baeldung','https://www.baeldung.com/java-checked-unchecked-exceptions']],
ex:{title:'Safe parsing',
prompt:`Write <code>SafeParse</code> with <code>static int toIntOr(String s, int fallback)</code>: return the parsed int, or <code>fallback</code> if <code>s</code> is null or not a valid number. Catch only <code>NumberFormatException</code> — handle null with a plain check, not a catch.`,
starter:`public class SafeParse {
    static int toIntOr(String s, int fallback) {
        // null-check first, then try/catch the parse
        return 0;
    }
}`,
tests:[{d:'Catches NumberFormatException specifically',re:'catch\\s*\\(\\s*NumberFormatException'},{d:'Does not catch broad Exception',re:'catch\\s*\\(\\s*Exception\\b',not:true},{d:'Null handled with a check (no NPE catch)',re:'==\\s*null|null\\s*=='},{d:'Uses Integer.parseInt',re:'Integer\\.parseInt'}],
behavior:`1. toIntOr("42", -1) == 42. 2. toIntOr("4x2", -1) == -1. 3. toIntOr(null, 7) == 7 without throwing. 4. No catch of NullPointerException or Exception.`,
hints:['Start with <code>if (s == null) return fallback;</code> — exceptions are for exceptional flow, not expected nulls.','Wrap only the parse call in try/catch.','In the catch block just <code>return fallback;</code>.'],
solution:`public class SafeParse {
    static int toIntOr(String s, int fallback) {
        if (s == null) return fallback;
        try {
            return Integer.parseInt(s.trim());
        } catch (NumberFormatException e) {
            return fallback;
        }
    }
}`}},
{id:'exc2',title:'throw, throws & custom exceptions',body:`
<p>You <code>throw</code> an exception object; a method that may propagate a <i>checked</i> exception must declare it with <code>throws</code>. Define custom exceptions to give errors domain meaning:</p>
<div class="codeSample" data-hl>// checked: caller MUST handle or declare
public class InsufficientFundsException extends Exception {
    public InsufficientFundsException(String message) {
        super(message);
    }
}

public void withdraw(long cents) throws InsufficientFundsException {
    if (cents &gt; balance)
        throw new InsufficientFundsException("need " + cents + ", have " + balance);
}</div>
<p>Extend <code>Exception</code> for recoverable, caller-must-decide situations; extend <code>RuntimeException</code> for programming errors. Always pass a useful message (and cause, when wrapping).</p>

<h4>The real question: can the caller do something about it?</h4>
<p>That single test decides checked versus unchecked better than any rule about categories. If a
reasonable caller could <i>recover</i> — retry, fall back, ask the user again — a checked exception
forces them to confront it. If the only sane response is to fix the code, make it unchecked; there is
no point compelling every caller to handle a bug.</p>
<div class="codeSample" data-hl>CHECKED    the caller has a real choice
  InsufficientFundsException   -&gt; offer a smaller amount
  FileNotFoundException        -&gt; prompt for another path

UNCHECKED  the caller can only have written better code
  IllegalArgumentException     -&gt; you passed a negative quantity
  IllegalStateException        -&gt; you called close() twice
  NullPointerException         -&gt; a bug, always</div>

<h4>Throwing well</h4>
<p>The message is read by someone at 3am with no context, so <b>include the values</b>. "Invalid
quantity" wastes the opportunity; <code>"quantity must be &gt; 0, was -3"</code> ends the
investigation. State what was expected, what arrived, and — where it helps — which input caused it.</p>
<p>Never include secrets. Exception messages reach logs, error trackers and sometimes HTTP responses,
so a message quoting a password or a token has just published it.</p>

<h4>Wrapping: always pass the cause</h4>
<div class="codeSample" data-hl>// throws away the evidence — the stack trace stops here
catch (SQLException e) { throw new DataAccessException("query failed"); }

// preserves the chain: "Caused by: SQLException: ..." survives
catch (SQLException e) { throw new DataAccessException("loading user " + id, e); }</div>
<p>Dropping the cause is the single most damaging mistake in this area: the original stack trace, the
line number and the driver's own message all disappear, and the person debugging is left with your
summary of a problem you did not understand.</p>

<h4>What <code>throws</code> is really declaring</h4>
<p>It is part of your <b>API contract</b>, not an implementation detail. Declaring <code>throws
SQLException</code> on a repository method leaks the fact that you use a database into every caller —
and the day you switch to an HTTP service, every signature changes. Wrap it in an exception that
belongs to your layer.</p>
<p>Two related rules that follow from the contract framing. Overriding methods may narrow but never
widen the checked exceptions they declare, because callers were promised the parent's list. And
<code>throws Exception</code> is nearly always a mistake — it declares everything and therefore tells
the caller nothing.</p>

<h4>The anti-patterns, briefly</h4>
<ul>
<li><b>Swallowing</b> — <code>catch (Exception e) {}</code>. The failure still happened; you have only
made it invisible. If it truly is ignorable, say so in a comment and log at debug.</li>
<li><b>Catching to log and rethrow</b> — produces the same error logged three times at three layers.
Log where you handle it, not where you pass it on.</li>
<li><b>Exceptions as control flow</b> — they are expensive to construct (the stack trace) and obscure
the normal path. A lookup that legitimately finds nothing should return <code>Optional</code>, not
throw.</li>
</ul>`,
docs:[['Throwing exceptions — Oracle','https://docs.oracle.com/javase/tutorial/essential/exceptions/throwing.html'],['Custom exceptions — Baeldung','https://www.baeldung.com/java-new-custom-exception']],
ex:{title:'Domain exception',
prompt:`Create a <b>checked</b> exception <code>InsufficientFundsException extends Exception</code> with a message constructor. Then write class <code>Wallet</code> with private <code>long cents</code>, <code>void add(long amount)</code>, and <code>void spend(long amount) throws InsufficientFundsException</code> that throws it (with an informative message) when amount exceeds the balance.`,
starter:`class InsufficientFundsException extends Exception {
    // constructor taking a message
}

public class Wallet {
    private long cents;

    public void add(long amount) {
        cents += amount;
    }

    public void spend(long amount) /* declare the checked exception */ {
        // throw when amount > cents, else subtract
    }
}`,
tests:[{d:'Custom exception extends Exception (checked)',re:'class\\s+InsufficientFundsException\\s+extends\\s+Exception'},{d:'Constructor passes message to super',re:'super\\s*\\(\\s*\\w+\\s*\\)'},{d:'spend declares throws InsufficientFundsException',re:'spend\\s*\\([^)]*\\)\\s*throws\\s+InsufficientFundsException'},{d:'Throws it conditionally',re:'throw\\s+new\\s+InsufficientFundsException'}],
behavior:`1. add(500) then spend(200) leaves 300. 2. spend(1000) on balance 300 throws InsufficientFundsException with a message mentioning amounts; balance unchanged. 3. The exception is checked (extends Exception, not RuntimeException).`,
hints:['Exception subclass body is one constructor: <code>public InsufficientFundsException(String message) { super(message); }</code>','Method signature: <code>public void spend(long amount) throws InsufficientFundsException</code>','Throw before mutating: check first, subtract after.'],
solution:`class InsufficientFundsException extends Exception {
    public InsufficientFundsException(String message) {
        super(message);
    }
}

public class Wallet {
    private long cents;

    public void add(long amount) {
        cents += amount;
    }

    public void spend(long amount) throws InsufficientFundsException {
        if (amount > cents) {
            throw new InsufficientFundsException(
                "tried to spend " + amount + " but only have " + cents);
        }
        cents -= amount;
    }
}`}},
{id:'exc3',title:'try-with-resources',body:`
<p>🌱 <b>Starting from zero:</b> some things you open must be closed — files, network connections, database handles — like library books that must come back or nobody else can borrow them. The bug is that "wrong" paths (an exception mid-work) skip your closing line. Java\u0027s fix is a try block that <b>closes automatically</b>, no matter how the block exits.</p>
<p>Anything implementing <code>AutoCloseable</code> can be opened in the try header and is closed automatically — in reverse order, even when an exception flies. This replaces fragile <code>finally { x.close(); }</code> blocks.</p>
<div class="codeSample" data-hl>try (var reader = Files.newBufferedReader(path);
     var writer = Files.newBufferedWriter(out)) {
    writer.write(reader.readLine());
}   // both closed here, guaranteed — even on exception

class Session implements AutoCloseable {
    @Override public void close() { System.out.println("closed"); }
}</div>
<p>If both the body and <code>close()</code> throw, the close-exception is attached as a <i>suppressed</i> exception instead of swallowing the original — another win over manual finally.</p>

<h4>What the compiler generates for you</h4>
<p>The try header is not sugar for a <code>finally</code> block you could easily write. It expands to a nested structure that closes every resource in <b>reverse order of declaration</b>, guards each close against the others failing, and — the part that is genuinely hard by hand — keeps the original exception primary while attaching any close failure as a <b>suppressed</b> exception, retrievable with <code>getSuppressed()</code>.</p>
<p>Written manually, the naive version loses the original: if the body throws and then <code>close()</code> throws inside <code>finally</code>, the close exception replaces the real cause and you debug the wrong thing. That specific bug is the reason the construct exists.</p>

<h4>The rules that catch people</h4>
<ul>
<li><b>Resources close in reverse order</b>, which is what you want when a writer wraps a stream: the wrapper flushes before the thing it wraps is closed.</li>
<li><b>Only what you open</b> belongs in the header. Putting a resource you were handed there closes something the caller still owns — the ownership question is the whole of resource management.</li>
<li><b>Java 9+ accepts an effectively-final variable</b> directly: <code>try (client; in; out)</code>, which is how the socket lessons adopt an already-created socket.</li>
<li><b>Closing is not flushing on failure.</b> Closing a buffered writer flushes it, so a partial write can reach disk even on the exception path. If a file must be all-or-nothing, write to a temporary file and rename.</li>
</ul>

<h4>Where this generalises</h4>
<p>Every long-lived scarce thing has this shape: file handles, sockets, database connections, locks, thread pools, tracing spans. The failure mode is always the same — a path that skips the release, invisible at low volume, fatal under load as the pool exhausts. Connection leaks in particular usually trace to a connection obtained outside a try-with-resources and returned only on the happy path. When you see <code>Timeout waiting for connection from pool</code>, this construct is what was missing.</p>`,
docs:[['try-with-resources — Oracle','https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html'],['AutoCloseable — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/AutoCloseable.html']],
ex:{title:'An auto-closing resource',
prompt:`Write class <code>Connection implements AutoCloseable</code> with <code>boolean open</code> set true in the constructor, a method <code>String query(String sql)</code> that throws <code>IllegalStateException</code> if not open (else returns <code>"OK: " + sql</code>), and <code>close()</code> setting open to false. Then write <code>class Demo</code> with <code>static String run()</code> that uses <b>try-with-resources</b> to create a Connection, run one query, and return its result.`,
starter:`class Connection implements AutoCloseable {
    boolean open;

    // add: constructor setting open = true, and String query(String sql)

    // replace this stub: set open = false
    @Override
    public void close() {
    }
}

class Demo {
    static String run() {
        // try (Connection c = new Connection()) { ... }
        return null;
    }
}`,
tests:[{d:'Connection implements AutoCloseable',re:'class\\s+Connection\\s+implements\\s+AutoCloseable'},{d:'Overrides close()',re:'void\\s+close\\s*\\(\\s*\\)'},{d:'Demo.run uses try-with-resources',re:'try\\s*\\(\\s*(var|Connection)\\s+\\w+\\s*='},{d:'query guards on open state',re:'IllegalStateException'}],
behavior:`1. Demo.run() returns "OK: <sql>" for whatever query it runs. 2. After the try block the connection's open == false (close was invoked automatically). 3. query on a closed connection throws IllegalStateException. 4. No manual finally block needed.`,
hints:['Resource in the header: <code>try (Connection c = new Connection()) { return c.query("SELECT 1"); }</code>','close() is just <code>open = false;</code> — the try statement calls it for you.','query guard: <code>if (!open) throw new IllegalStateException("closed");</code>'],
solution:`class Connection implements AutoCloseable {
    boolean open;

    Connection() { open = true; }

    String query(String sql) {
        if (!open) throw new IllegalStateException("connection is closed");
        return "OK: " + sql;
    }

    @Override
    public void close() { open = false; }
}

class Demo {
    static String run() {
        try (Connection c = new Connection()) {
            return c.query("SELECT 1");
        }
    }
}`}},
{id:'exc4',title:'Professional practice: multi-catch, wrapping, never swallow',body:`
<p>The habits that separate production code from homework:</p>
<ul>
<li><b>Never swallow:</b> an empty catch block destroys the evidence. At minimum log; usually rethrow.</li>
<li><b>Multi-catch:</b> <code>catch (IOException | SQLException e)</code> when the handling is identical.</li>
<li><b>Wrap &amp; translate:</b> convert low-level exceptions into domain exceptions at layer boundaries, always passing the original as the <i>cause</i> so the stack trace chain survives: <code>throw new DataAccessException("load failed", e);</code></li>
<li><b>Fail fast:</b> validate arguments up front with <code>IllegalArgumentException</code> / <code>Objects.requireNonNull</code>.</li>
</ul>
<div class="codeSample" data-hl>try {
    return repository.load(id);
} catch (IOException | SQLException e) {
    throw new DataAccessException("could not load user " + id, e); // cause chained!
}</div>
<h4>Why swallowing is worse than crashing</h4>
<p>An empty <code>catch</code> does not remove the problem — it removes the <b>evidence</b>. The program
continues with a broken assumption, and the failure surfaces later, somewhere unrelated, as corrupt data or
a null that cannot be explained. A crash tells you what went wrong and where; a swallowed exception
guarantees an expensive investigation from a symptom that points at innocent code.</p>
<div class="codeSample" data-hl>catch (Exception e) { }                     // evidence destroyed
catch (Exception e) { e.printStackTrace(); } // goes to stderr, unstructured,
                                             // invisible in aggregated logs
catch (Exception e) { log.error("saving user {}", id, e); throw ...; }
                                             // context + the exception + a
                                             // decision about what happens next</div>
<p>Note the shape of that last line: the exception is passed as the <b>last argument</b>, not concatenated
into the message, so the logging framework records the full stack. And every catch block should end in a
decision — recover, translate and rethrow, or let it go — never in silence.</p>

<h4>The rule that stops double-logging</h4>
<p><b>Log or rethrow, not both.</b> If every layer logs and rethrows, one failure produces five stack
traces of the same event and the log becomes unreadable during the incident when you need it most. Handle
it where you can actually do something; elsewhere, add context and pass it on.</p>

<h4>Wrapping, and why the cause matters so much</h4>
<p>Letting <code>SQLException</code> escape a repository means every caller now depends on the storage
technology — swap to a document store and the signatures change everywhere. Translating at the boundary
keeps the abstraction intact.</p>
<p>But translation without the cause is worse than no translation: you have replaced a precise error with a
vague one and thrown away the line that would have told you what happened. Always pass the original as the
<code>cause</code>, and know that <code>getCause()</code> is what you unwrap when a framework has wrapped
your exception several times over.</p>

<h4>Fail fast, and where</h4>
<p><code>Objects.requireNonNull(x, "clock")</code> in a constructor turns a null that would surface three
calls later into an immediate, named failure at the point of the mistake. Validate arguments at public
entry points and at construction; do not re-validate deep inside where the check merely obscures the
logic.</p>

<h4>Two details that catch people</h4>
<p><b>try-with-resources over <code>finally</code>.</b> Closing in a <code>finally</code> has a real bug in
it: if the body throws and <code>close()</code> also throws, the close exception replaces the original and
you lose the actual cause. try-with-resources closes in reverse order and attaches the secondary as a
<b>suppressed</b> exception, so nothing is lost.</p>
<p><b>Never catch and ignore <code>InterruptedException</code>.</b> Catching it clears the interrupt flag,
which destroys a cancellation signal the rest of the system is relying on. Restore it with
<code>Thread.currentThread().interrupt()</code> or let it propagate.</p>`,
docs:[['Multi-catch — Oracle','https://docs.oracle.com/javase/tutorial/essential/exceptions/catch.html'],['Exception chaining — Baeldung','https://www.baeldung.com/java-chained-exceptions']],
ex:{title:'Wrap and translate',
prompt:`Create unchecked <code>StorageException extends RuntimeException</code> with a <code>(String message, Throwable cause)</code> constructor. Write <code>class UserStore</code> with <code>String load(String id)</code> that calls the provided <code>raw(id)</code> helper inside a try, and uses <b>multi-catch</b> for <code>java.io.IOException | InterruptedException</code> to wrap either into a <code>StorageException</code> that keeps the cause. Do not swallow anything.`,
starter:`class StorageException extends RuntimeException {
    // (String message, Throwable cause) constructor
}

public class UserStore {
    // pretend low-level API — leave as is
    private String raw(String id) throws java.io.IOException, InterruptedException {
        return "user-" + id;
    }

    public String load(String id) {
        // try { return raw(id); } multi-catch → wrap into StorageException
        return null;
    }
}`,
tests:[{d:'StorageException extends RuntimeException',re:'class\\s+StorageException\\s+extends\\s+RuntimeException'},{d:'Constructor forwards message AND cause',re:'super\\s*\\(\\s*\\w+\\s*,\\s*\\w+\\s*\\)'},{d:'Uses multi-catch with |',re:'catch\\s*\\([^)]*\\|[^)]*\\)'},{d:'Wraps with the cause chained',re:'throw\\s+new\\s+StorageException\\s*\\([^)]*,\\s*\\w+\\s*\\)'},{d:'No empty catch blocks',re:'catch\\s*\\([^)]*\\)\\s*\\{\\s*\\}',not:true}],
behavior:`1. load("42") returns "user-42". 2. If raw threw IOException, load throws StorageException whose getCause() is that IOException. 3. Same for InterruptedException. 4. load itself declares no checked exceptions (translation happened).`,
hints:['Two-arg constructor: <code>public StorageException(String message, Throwable cause) { super(message, cause); }</code>','Multi-catch syntax: <code>catch (java.io.IOException | InterruptedException e)</code>','Wrap: <code>throw new StorageException("failed to load " + id, e);</code> — passing <code>e</code> is what preserves the stack trace chain.'],
solution:`class StorageException extends RuntimeException {
    public StorageException(String message, Throwable cause) {
        super(message, cause);
    }
}

public class UserStore {
    private String raw(String id) throws java.io.IOException, InterruptedException {
        return "user-" + id;
    }

    public String load(String id) {
        try {
            return raw(id);
        } catch (java.io.IOException | InterruptedException e) {
            throw new StorageException("failed to load user " + id, e);
        }
    }
}`}},
{id:'exc5',title:'Designing your own exceptions',body:`
<p>Built-in exceptions cover the basics, but real domains have real failure modes: <code>InsufficientFundsException</code>, <code>OrderAlreadyShippedException</code>, <code>InvalidCouponException</code>. A well-named custom exception turns a vague failure into a precise, catchable event — and lets you carry <b>data about the failure</b>, not just a message.</p>
<p><b>Checked or unchecked?</b> Extend <code>Exception</code> (checked) when the caller can reasonably recover and you want the compiler to force handling. Extend <code>RuntimeException</code> (unchecked) for programming errors or failures the caller usually cannot fix. Most modern app code leans unchecked to avoid <code>throws</code> clutter, but the choice is yours to make deliberately.</p>
<div class="codeSample" data-hl>public class OrderException extends RuntimeException {
    private final String orderId;                 // carry failure data
    public OrderException(String message, String orderId, Throwable cause) {
        super(message, cause);                     // keep the original cause (chaining)
        this.orderId = orderId;
    }
    public String getOrderId() { return orderId; }
}</div>
<p>Two habits make custom exceptions professional. Always offer a constructor that accepts a <b>cause</b> and pass it to <code>super(message, cause)</code> so the original stack trace is not lost (exception chaining). And add fields/getters for the context a handler will want — an id, an amount, a limit — so <code>catch</code> blocks can act on facts instead of parsing strings.</p>

<h4>Designing the hierarchy, not just the class</h4>
<p>One custom exception is rarely enough and thirty is unusable. The pattern that scales is a small tree: one base exception per module or bounded context, with specific subtypes beneath it. Callers who care about a particular failure catch the subtype; callers who only need "the payment layer failed" catch the base; frameworks map the base to a status code in one place. Without the base class every handler becomes a list of catch blocks that must be updated whenever anyone adds a failure mode.</p>

<h4>Carrying facts, not prose</h4>
<p>A message is for a human reading a log. A <b>field</b> is for code making a decision. <code>InsufficientFundsException</code> carrying <code>balance</code> and <code>required</code> lets a handler tell the user how much is missing, decide whether to offer a top-up, and emit a metric — none of which is possible if the numbers exist only inside a formatted string. Parsing a message to recover data is a sure sign a field was missing.</p>
<p>Two things to keep <i>out</i> of exception messages: secrets and personal data. Exception text ends up in logs, in error trackers and sometimes in HTTP responses, so a message including a token or a full card number has just published it three times over.</p>

<h4>The boundary rule</h4>
<p>Domain exceptions belong to the domain. Letting <code>SQLException</code> escape a repository, or a JSON parsing error escape a client, leaks the implementation into every caller and freezes your ability to change it — replacing the database then changes the exception every layer catches. Translate at the boundary: catch the technology-specific exception, wrap it in a domain one <b>with the original as the cause</b>, and let it travel. Spring's <code>DataAccessException</code> hierarchy is precisely this pattern applied to persistence, which is a good argument for it and a good model to copy.</p>
<p>Finally, cost: filling in a stack trace is the expensive part of throwing. For an exception used as ordinary control flow at high frequency — rarely a good idea, but sometimes unavoidable in parsing — a constructor calling <code>super(msg, cause, false, false)</code> disables suppression and the stack trace, which makes it about as cheap as a return value.</p>`,
docs:[['Creating exception classes — Oracle','https://docs.oracle.com/javase/tutorial/essential/exceptions/creating.html'],['Chained exceptions','https://docs.oracle.com/javase/tutorial/essential/exceptions/chained.html']],
exs:[{title:'Writing an unchecked exception',
prompt:`Create an unchecked exception <code>InsufficientFundsException</code> that <code>extends RuntimeException</code>, holds a <code>long shortfall</code> field, has a constructor <code>(String message, long shortfall)</code> that calls <code>super(message)</code> and stores the field, and exposes <code>long getShortfall()</code>. Then in class <code>Account</code>, method <code>void withdraw(long amount, long balance)</code> must <code>throw new InsufficientFundsException(...)</code> when <code>amount &gt; balance</code>, passing the shortfall <code>amount - balance</code>.`,
starter:`public class Account {
    void withdraw(long amount, long balance) {
        // throw when amount > balance
    }
}

class InsufficientFundsException extends RuntimeException {
    // field, constructor, getter
}`,
solution:`public class Account {
    void withdraw(long amount, long balance) {
        if (amount > balance) {
            throw new InsufficientFundsException("insufficient funds", amount - balance);
        }
    }
}

class InsufficientFundsException extends RuntimeException {
    private final long shortfall;

    InsufficientFundsException(String message, long shortfall) {
        super(message);
        this.shortfall = shortfall;
    }

    long getShortfall() {
        return shortfall;
    }
}`,
tests:[{d:'extends RuntimeException (unchecked)',re:'class\\s+InsufficientFundsException\\s+extends\\s+RuntimeException'},{d:'carries a long shortfall field',re:'long\\s+shortfall'},{d:'constructor passes the message up with super(message)',re:'super\\s*\\(\\s*message\\s*\\)'},{d:'exposes getShortfall()',re:'getShortfall\\s*\\(\\s*\\)'},{d:'throws on amount > balance',re:'amount\\s*>\\s*balance'},{d:'throws the custom exception',re:'throw\\s+new\\s+InsufficientFundsException'}],
behavior:`withdraw(100, 40) throws InsufficientFundsException whose getShortfall() returns 60. withdraw(30, 40) returns normally. The exception carries the shortfall as data, so a catch block can react without parsing the message.`,
hints:['A custom exception is just a class that extends Exception or RuntimeException; use RuntimeException for unchecked.','Store extra context in a final field set by the constructor, and pass the message up with super(message).','In withdraw, guard with if (amount > balance) then throw new InsufficientFundsException with amount - balance.']},
{title:'Writing a checked exception',
prompt:`Now make a <b>checked</b> exception. Create <code>WithdrawalLimitException</code> that <code>extends Exception</code> with a constructor <code>(String message)</code> calling <code>super(message)</code>. Then in class <code>Bank</code>, method <code>void withdraw(long amount)</code> must <b>declare</b> <code>throws WithdrawalLimitException</code> and throw it when <code>amount &gt; 1000</code>. Because it is checked, the compiler forces the method to declare it.`,
starter:`public class Bank {
    void withdraw(long amount) {
        // declare "throws" and throw a checked WithdrawalLimitException when amount > 1000
    }
}

class WithdrawalLimitException {
    // extend the right base type; add a (String message) constructor
}`,
solution:`public class Bank {
    void withdraw(long amount) throws WithdrawalLimitException {
        if (amount > 1000) {
            throw new WithdrawalLimitException("over the withdrawal limit");
        }
    }
}

class WithdrawalLimitException extends Exception {
    WithdrawalLimitException(String message) {
        super(message);
    }
}`,
tests:[{d:'extends Exception (checked, not RuntimeException)',re:'class\\s+WithdrawalLimitException\\s+extends\\s+Exception'},{d:'the method DECLARES the checked exception',re:'void\\s+withdraw\\s*\\(\\s*long\\s+amount\\s*\\)\\s*throws\\s+WithdrawalLimitException'},{d:'throws it past the limit',re:'throw\\s+new\\s+WithdrawalLimitException'},{d:'passes the message up',re:'super\\s*\\(\\s*message\\s*\\)'},{d:'guards on amount > 1000',re:'amount\\s*>\\s*1000'}],
behavior:`withdraw(1500) throws the checked WithdrawalLimitException, so any caller must catch it or declare throws itself; withdraw(500) returns normally. Extending Exception (not RuntimeException) is what makes it checked and forces the throws declaration.`,
hints:['A checked exception extends Exception (not RuntimeException), so the compiler forces you to handle or declare it.','The method signature must add throws WithdrawalLimitException.','Guard with if (amount > 1000) then throw new WithdrawalLimitException with a message passed to super.']}]}
]});
