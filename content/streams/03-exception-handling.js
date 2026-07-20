STREAMS.push({icon:'🧯',title:'Exception Handling',blurb:'try/catch to custom exceptions, try-with-resources, and professional error-handling practice.',lessons:[
{id:'exc1',title:'try / catch / finally & the exception hierarchy',body:`
<p>All throwables descend from <code>Throwable</code>: <code>Error</code> (JVM-level, don't catch), and <code>Exception</code>. <b>Checked</b> exceptions (e.g. <code>IOException</code>) must be caught or declared with <code>throws</code>; <b>unchecked</b> (<code>RuntimeException</code> and subclasses like <code>NullPointerException</code>, <code>IllegalArgumentException</code>) need no declaration — they usually signal bugs or bad input.</p>
<div class="codeSample" data-hl>try {
    int n = Integer.parseInt(input);       // throws NumberFormatException
} catch (NumberFormatException e) {
    System.err.println("Not a number: " + e.getMessage());
} finally {
    System.out.println("always runs");     // cleanup — even after a throw
}</div>
<p>Catch the <i>most specific</i> type you can handle. Catching bare <code>Exception</code> hides bugs.</p>`,
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
<p>Extend <code>Exception</code> for recoverable, caller-must-decide situations; extend <code>RuntimeException</code> for programming errors. Always pass a useful message (and cause, when wrapping).</p>`,
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
<p>Anything implementing <code>AutoCloseable</code> can be opened in the try header and is closed automatically — in reverse order, even when an exception flies. This replaces fragile <code>finally { x.close(); }</code> blocks.</p>
<div class="codeSample" data-hl>try (var reader = Files.newBufferedReader(path);
     var writer = Files.newBufferedWriter(out)) {
    writer.write(reader.readLine());
}   // both closed here, guaranteed — even on exception

class Session implements AutoCloseable {
    @Override public void close() { System.out.println("closed"); }
}</div>
<p>If both the body and <code>close()</code> throw, the close-exception is attached as a <i>suppressed</i> exception instead of swallowing the original — another win over manual finally.</p>`,
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
}</div>`,
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
}`}}
]});
