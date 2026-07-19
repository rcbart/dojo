STREAMS.push({icon:'🧰',title:'Time, Testing, Reflection & the JVM',blurb:'Serialization, the java.time API, JUnit 5 & Mockito, annotations/reflection, and how the JVM actually works.',lessons:[
{id:'dep1b',title:'Serialization & deserialization',body:`
<p><b>Serialization</b> turns an object graph into bytes; <b>deserialization</b> turns bytes back into objects. Java ships a native mechanism — worth knowing, and worth knowing why the industry moved past it:</p>
<div class="codeSample" data-hl>public class Session implements Serializable {              // marker interface
    private static final long serialVersionUID = 1L;        // version the format!
    private String userId;
    private transient char[] password;                      // transient = NOT serialized
}

// write:
try (var out = new ObjectOutputStream(Files.newOutputStream(path))) {
    out.writeObject(session);
}
// read:
try (var in = new ObjectInputStream(Files.newInputStream(path))) {
    Session s = (Session) in.readObject();                  // password field is null now
}</div>
<p>What to know cold: <code>Serializable</code> is a marker (no methods); <code>serialVersionUID</code> pins compatibility — omit it and any class change breaks old data with <code>InvalidClassException</code>; <code>transient</code> excludes secrets/caches; the whole reachable object graph gets serialized (a stray reference drags the world in).</p>
<p><b>The security warning that is now exam material</b>: deserializing untrusted bytes is remote code execution waiting to happen (gadget chains) — never <code>readObject</code> external input; use serialization filters (<code>ObjectInputFilter</code>) if you must. Which is why modern systems serialize through explicit formats instead: JSON via Jackson (your api3 lesson), or Protobuf/Avro for compact schema-versioned data. Records + Jackson is the modern default; native serialization survives mainly in caches, session replication, and legacy RPC.</p>`,
docs:[['Serializable — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/io/Serializable.html'],['Serialization filtering — Oracle','https://docs.oracle.com/en/java/javase/21/core/serialization-filtering1.html'],['OWASP: insecure deserialization','https://owasp.org/www-community/vulnerabilities/Deserialization_of_untrusted_data']],
ex:{title:'Round-trip a session',
prompt:`Write <code>class Session implements java.io.Serializable</code> with <code>private static final long serialVersionUID = 1L</code>, fields <code>String userId</code> and <code>transient char[] secret</code>, and a constructor for both. Then <code>class SessionStore</code> with <code>static void save(Session s, java.nio.file.Path p) throws Exception</code> using <code>ObjectOutputStream</code> over <code>Files.newOutputStream</code> in try-with-resources, and <code>static Session load(java.nio.file.Path p) throws Exception</code> using <code>ObjectInputStream</code> + a cast.`,
starter:`import java.io.*;
import java.nio.file.*;

class Session implements Serializable {
    // serialVersionUID, userId, transient secret, constructor
}

class SessionStore {
    static void save(Session s, Path p) throws Exception {
    }

    static Session load(Path p) throws Exception {
        return null;
    }
}`,
tests:[{d:'Implements Serializable',re:'class\\s+Session\\s+implements\\s+Serializable'},{d:'serialVersionUID declared',re:'private\\s+static\\s+final\\s+long\\s+serialVersionUID\\s*=\\s*1L\\s*;'},{d:'Secret is transient',re:'transient\\s+char\\[\\]\\s+secret'},{d:'writeObject in try-with-resources',re:'try\\s*\\(\\s*var\\s+\\w+\\s*=\\s*new\\s+ObjectOutputStream[\\s\\S]*?writeObject\\s*\\(\\s*s\\s*\\)'},{d:'readObject with cast',re:'\\(\\s*Session\\s*\\)\\s*\\w+\\.readObject\\s*\\(\\s*\\)'}],
behavior:`1. save then load round-trips userId intact. 2. The loaded session's secret is null — transient fields are skipped, which is exactly right for credentials. 3. Changing Session's fields without changing serialVersionUID keeps old files readable (compatible changes); the UID is the contract. 4. Both streams close via try-with-resources.`,
hints:['The marker interface has nothing to implement — the fields and UID are the work.','save: <code>try (var out = new ObjectOutputStream(Files.newOutputStream(p))) { out.writeObject(s); }</code>','load mirrors it with ObjectInputStream and a cast: <code>return (Session) in.readObject();</code>'],
solution:`import java.io.*;
import java.nio.file.*;

class Session implements Serializable {
    private static final long serialVersionUID = 1L;

    String userId;
    transient char[] secret;

    Session(String userId, char[] secret) {
        this.userId = userId;
        this.secret = secret;
    }
}

class SessionStore {
    static void save(Session s, Path p) throws Exception {
        try (var out = new ObjectOutputStream(Files.newOutputStream(p))) {
            out.writeObject(s);
        }
    }

    static Session load(Path p) throws Exception {
        try (var in = new ObjectInputStream(Files.newInputStream(p))) {
            return (Session) in.readObject();
        }
    }
}`}},
{id:'dep2',title:'The java.time API',body:`
<p>Never touch <code>java.util.Date</code>/<code>Calendar</code> again. <code>java.time</code> types are immutable and explicit:</p>
<div class="codeSample" data-hl>LocalDate d      = LocalDate.of(2026, 7, 16);     // date, no time, no zone
LocalDateTime dt = LocalDateTime.now();
ZonedDateTime z  = ZonedDateTime.now(ZoneId.of("America/New_York"));
Instant i        = Instant.now();                 // machine timestamp (UTC)

LocalDate due = d.plusDays(30);                   // immutable — returns NEW object!
Period age  = Period.between(birthDate, LocalDate.now());   // years/months/days
Duration dur = Duration.ofMinutes(90);                       // time-based

DateTimeFormatter f = DateTimeFormatter.ofPattern("dd MMM yyyy");
String s = d.format(f);
LocalDate parsed = LocalDate.parse("2026-07-16");  // ISO by default</div>
<p>Rules: store <code>Instant</code> (UTC) in databases, apply zones only at display; <code>Period</code> for calendar amounts, <code>Duration</code> for exact time; never forget the return value — <code>d.plusDays(1)</code> without assignment is a no-op bug.</p>`,
docs:[['java.time — dev.java','https://dev.java/learn/date-time/'],['DateTimeFormatter — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/time/format/DateTimeFormatter.html']],
ex:{title:'Dates done right',
prompt:`Write <code>Dates</code> with: <code>static int ageYears(java.time.LocalDate birth)</code> using <code>Period.between</code> to now; <code>static java.time.LocalDate paymentDue(java.time.LocalDate invoice)</code> returning invoice date + 30 days; and <code>static String pretty(java.time.LocalDate d)</code> formatting with pattern <code>"dd MMM yyyy"</code>.`,
starter:`import java.time.*;
import java.time.format.DateTimeFormatter;

public class Dates {
    static int ageYears(LocalDate birth) {
        return 0;
    }

    static LocalDate paymentDue(LocalDate invoice) {
        return null;
    }

    static String pretty(LocalDate d) {
        return null;
    }
}`,
tests:[{d:'Period.between for age',re:'Period\\.between\\s*\\('},{d:'getYears() extracts the years',re:'getYears\\s*\\(\\s*\\)'},{d:'plusDays(30) for the due date',re:'plusDays\\s*\\(\\s*30\\s*\\)'},{d:'Formatter with the exact pattern',re:'ofPattern\\s*\\(\\s*"dd MMM yyyy"\\s*\\)'}],
behavior:`1. ageYears(LocalDate.now().minusYears(30)) == 30. 2. paymentDue(2026-01-31) == 2026-03-02 (plusDays handles month lengths). 3. pretty(LocalDate.of(2026,7,16)) equals "16 Jul 2026". 4. paymentDue RETURNS the new date — LocalDate is immutable.`,
hints:['<code>return Period.between(birth, LocalDate.now()).getYears();</code>','<code>return invoice.plusDays(30);</code> — remember to return it; the original is untouched.','<code>return d.format(DateTimeFormatter.ofPattern("dd MMM yyyy"));</code>'],
solution:`import java.time.*;
import java.time.format.DateTimeFormatter;

public class Dates {
    static int ageYears(LocalDate birth) {
        return Period.between(birth, LocalDate.now()).getYears();
    }

    static LocalDate paymentDue(LocalDate invoice) {
        return invoice.plusDays(30);
    }

    static String pretty(LocalDate d) {
        return d.format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
    }
}`}},
{id:'dep3',title:'Testing: JUnit 5 & Mockito',body:`
<p>Tests are how you refactor without fear. JUnit 5 basics:</p>
<div class="codeSample" data-hl>class WalletTest {
    @Test
    void depositIncreasesBalance() {
        Wallet w = new Wallet();
        w.add(500);
        assertEquals(500, w.balance());
    }

    @Test
    void overdraftThrows() {
        Wallet w = new Wallet();
        assertThrows(IllegalStateException.class, () -&gt; w.spend(100));
    }

    @ParameterizedTest
    @ValueSource(ints = {1, 100, 5000})
    void acceptsPositiveAmounts(int amount) { ... }
}

// Mockito: isolate the unit from its dependencies
AuditService audit = mock(AuditService.class);
TransferService svc = new TransferService(audit);
svc.transfer("a", "b", 100);
verify(audit).log(contains("100"));</div>
<p>Structure every test as Arrange-Act-Assert. Name tests after behavior, not methods. Constructor injection (which you learned in the Spring stream) is exactly what makes mocking possible.</p>`,
docs:[['JUnit 5 User Guide','https://junit.org/junit5/docs/current/user-guide/'],['Mockito','https://site.mockito.org/']],
ex:{title:'Test the BankAccount',
prompt:`Write <code>BankAccountTest</code> (assume the BankAccount from the Fundamentals stream) with three <code>@Test</code> methods: (1) <code>depositThenBalance()</code> asserting balance == 1000 after deposit(1000) with <code>assertEquals</code>; (2) <code>overdrawThrows()</code> using <code>assertThrows(IllegalStateException.class, ...)</code> for withdraw on an empty account; (3) <code>negativeDepositThrows()</code> using <code>assertThrows(IllegalArgumentException.class, ...)</code>.`,
starter:`import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class BankAccountTest {
    // three tests: happy path, overdraw, negative deposit
}`,
tests:[{d:'Three @Test methods',re:'@Test[\\s\\S]*@Test[\\s\\S]*@Test'},{d:'assertEquals on the balance',re:'assertEquals\\s*\\(\\s*1000L?\\s*,'},{d:'assertThrows IllegalStateException',re:'assertThrows\\s*\\(\\s*IllegalStateException\\.class'},{d:'assertThrows IllegalArgumentException',re:'assertThrows\\s*\\(\\s*IllegalArgumentException\\.class'},{d:'Lambdas passed to assertThrows',re:'assertThrows\\s*\\([^,]+,\\s*\\(\\s*\\)\\s*->'}],
behavior:`1. Each test is independent (fresh BankAccount per test). 2. depositThenBalance: deposit(1000) then assertEquals(1000, account.balance()). 3. overdrawThrows: withdraw(1) on a new account inside the assertThrows lambda. 4. negativeDepositThrows: deposit(-5) inside the lambda. 5. Static imports used for assertions.`,
hints:['Each test creates its own account: shared state between tests is the #1 flaky-test cause.','assertThrows takes the exception class and a lambda that performs the throwing call: <code>assertThrows(IllegalStateException.class, () -> a.withdraw(1));</code>','Assert order is (expected, actual): <code>assertEquals(1000, a.balance());</code>'],
solution:`import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class BankAccountTest {

    @Test
    void depositThenBalance() {
        BankAccount a = new BankAccount();
        a.deposit(1000);
        assertEquals(1000, a.balance());
    }

    @Test
    void overdrawThrows() {
        BankAccount a = new BankAccount();
        assertThrows(IllegalStateException.class, () -> a.withdraw(1));
    }

    @Test
    void negativeDepositThrows() {
        BankAccount a = new BankAccount();
        assertThrows(IllegalArgumentException.class, () -> a.deposit(-5));
    }
}`}},
{id:'dep4',title:'Annotations & reflection',body:`
<p>Annotations are structured metadata; reflection reads types at runtime. Together they power Spring, JUnit, Jackson — every framework you've met in this dojo.</p>
<div class="codeSample" data-hl>@Retention(RetentionPolicy.RUNTIME)   // keep it visible at runtime
@Target(ElementType.METHOD)          // only on methods
public @interface Audited {
    String value() default "";       // annotation parameter
}

public class Service {
    @Audited("transfers")
    public void transfer() { ... }
}

// reflection: find and read it
for (Method m : Service.class.getDeclaredMethods()) {
    Audited a = m.getAnnotation(Audited.class);
    if (a != null) System.out.println(m.getName() + " audited as " + a.value());
}</div>
<p>Without <code>RUNTIME</code> retention, <code>getAnnotation</code> returns null — the single most common custom-annotation bug. Reflection is powerful but slow and unchecked: frameworks cache it; application code should rarely need it.</p>`,
docs:[['Annotations — dev.java','https://dev.java/learn/annotations/'],['Reflection API — Oracle','https://docs.oracle.com/javase/tutorial/reflect/index.html']],
ex:{title:'Build @Audited',
prompt:`(1) Declare annotation <code>@interface Audited</code> with <code>@Retention(RetentionPolicy.RUNTIME)</code>, <code>@Target(ElementType.METHOD)</code> and a <code>String value()</code> element. (2) Write <code>class AuditScanner</code> with <code>static java.util.List&lt;String&gt; auditedMethods(Class&lt;?&gt; c)</code> that loops <code>getDeclaredMethods()</code>, and for each method carrying the annotation adds <code>method.getName() + ":" + annotation.value()</code> to the result.`,
starter:`import java.lang.annotation.*;
import java.lang.reflect.Method;
import java.util.*;

// (1) the annotation

// (2) the scanner
class AuditScanner {
    static List<String> auditedMethods(Class<?> c) {
        return null;
    }
}`,
tests:[{d:'RUNTIME retention (or getAnnotation returns null!)',re:'@Retention\\s*\\(\\s*RetentionPolicy\\.RUNTIME\\s*\\)'},{d:'Method target',re:'@Target\\s*\\(\\s*ElementType\\.METHOD\\s*\\)'},{d:'Annotation with String value()',re:'@interface\\s+Audited\\s*\\{[\\s\\S]*?String\\s+value\\s*\\(\\s*\\)'},{d:'Scans getDeclaredMethods',re:'getDeclaredMethods\\s*\\(\\s*\\)'},{d:'Reads via getAnnotation',re:'getAnnotation\\s*\\(\\s*Audited\\.class\\s*\\)'}],
behavior:`1. A class with @Audited("transfers") on method transfer() yields ["transfer:transfers"]. 2. Un-annotated methods are skipped (getAnnotation null-check). 3. Without RUNTIME retention the scanner would find nothing — that is the point of the lesson.`,
hints:['Annotation declaration: <code>public @interface Audited { String value(); }</code> with the two meta-annotations above it.','Loop: <code>for (Method m : c.getDeclaredMethods())</code>','Null-check the lookup: <code>Audited a = m.getAnnotation(Audited.class); if (a != null) out.add(m.getName() + ":" + a.value());</code>'],
solution:`import java.lang.annotation.*;
import java.lang.reflect.Method;
import java.util.*;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface Audited {
    String value();
}

class AuditScanner {
    static List<String> auditedMethods(Class<?> c) {
        List<String> out = new ArrayList<>();
        for (Method m : c.getDeclaredMethods()) {
            Audited a = m.getAnnotation(Audited.class);
            if (a != null) {
                out.add(m.getName() + ":" + a.value());
            }
        }
        return out;
    }
}`}},
{id:'dep4b',title:'Annotation mastery: meta-annotations & mini-frameworks',body:`
<p>Beyond the basics, annotations become a design tool:</p>
<ul>
<li><b>Meta-annotations</b>: <code>@Repeatable</code> (apply the same annotation twice — needs a container annotation), <code>@Inherited</code> (subclasses see the superclass's class-level annotation), <code>@Documented</code> (shows in javadoc).</li>
<li><b>Composed annotations</b>: annotate an annotation to bundle behavior — that is literally how Spring works: <code>@RestController</code> is itself annotated <code>@Controller</code> + <code>@ResponseBody</code>; you can build <code>@AdminEndpoint</code> = <code>@RestController</code> + <code>@PreAuthorize("hasRole('ADMIN')")</code>.</li>
<li><b>Elements</b> can be primitives, String, Class, enums, other annotations, and arrays of those — with <code>default</code> values. A single element named <code>value</code> enables the shorthand <code>@Audited("x")</code>.</li>
<li><b>Runtime vs compile time</b>: reflection (as here) reads at runtime; annotation processors (Lombok, MapStruct) generate code at compile time.</li>
</ul>
<div class="codeSample" data-hl>@Repeatable(Roles.class)
@Retention(RetentionPolicy.RUNTIME)
@interface Role { String value(); }

@Retention(RetentionPolicy.RUNTIME)
@interface Roles { Role[] value(); }          // the container

@Role("admin") @Role("auditor")
class Backoffice {}

Role[] roles = Backoffice.class.getAnnotationsByType(Role.class);  // both!</div>`,
docs:[['Annotations in depth — dev.java','https://dev.java/learn/annotations/'],['Repeating annotations — Oracle','https://docs.oracle.com/javase/tutorial/java/annotations/repeating.html'],['Spring composed annotations','https://docs.spring.io/spring-framework/reference/core/beans/classpath-scanning.html#beans-meta-annotations']],
ex:{title:'Build a mini validation framework',
prompt:`Create field annotation <code>@interface Required</code> (RUNTIME retention, <code>ElementType.FIELD</code> target) with element <code>String message() default "is required"</code>. Then write <code>class MiniValidator</code> with <code>static java.util.List&lt;String&gt; validate(Object o) throws IllegalAccessException</code>: loop <code>o.getClass().getDeclaredFields()</code>, for each field carrying @Required call <code>setAccessible(true)</code>, read its value via <code>field.get(o)</code>, and if null add <code>field.getName() + " " + annotation.message()</code> to the violations list.`,
starter:`import java.lang.annotation.*;
import java.lang.reflect.Field;
import java.util.*;

// the annotation with a default message

// the validator
class MiniValidator {
    static List<String> validate(Object o) throws IllegalAccessException {
        return null;
    }
}`,
tests:[{d:'RUNTIME retention on @Required',re:'@Retention\\s*\\(\\s*RetentionPolicy\\.RUNTIME\\s*\\)[\\s\\S]*?@interface\\s+Required'},{d:'FIELD target',re:'@Target\\s*\\(\\s*ElementType\\.FIELD\\s*\\)'},{d:'message element with default',re:'String\\s+message\\s*\\(\\s*\\)\\s+default\\s+"is required"'},{d:'Scans getDeclaredFields',re:'getDeclaredFields\\s*\\(\\s*\\)'},{d:'setAccessible before reading',re:'setAccessible\\s*\\(\\s*true\\s*\\)'},{d:'Null check drives the violation',re:'field\\.get\\s*\\(\\s*o\\s*\\)|f\\.get\\s*\\(\\s*o\\s*\\)'}],
behavior:`1. An object with @Required private String name = null yields ["name is required"]. 2. Non-null annotated fields produce no violation. 3. Fields without @Required are ignored entirely. 4. A field annotated @Required(message = "must be set") yields "field must be set" — the element overrides the default. 5. This is the exact mechanism (plus caching) behind Bean Validation's @NotNull.`,
hints:['Annotation: three lines of meta + <code>@interface Required { String message() default "is required"; }</code>','Loop shape: <code>for (Field f : o.getClass().getDeclaredFields()) { Required r = f.getAnnotation(Required.class); if (r == null) continue; ... }</code>','Private fields need <code>f.setAccessible(true);</code> before <code>f.get(o)</code> — then <code>if (f.get(o) == null) out.add(f.getName() + " " + r.message());</code>'],
solution:`import java.lang.annotation.*;
import java.lang.reflect.Field;
import java.util.*;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
@interface Required {
    String message() default "is required";
}

class MiniValidator {
    static List<String> validate(Object o) throws IllegalAccessException {
        List<String> out = new ArrayList<>();
        for (Field field : o.getClass().getDeclaredFields()) {
            Required r = field.getAnnotation(Required.class);
            if (r == null) continue;
            field.setAccessible(true);
            if (field.get(o) == null) {
                out.add(field.getName() + " " + r.message());
            }
        }
        return out;
    }
}`}},
{id:'dep5',title:'The JVM under the hood',body:`
<p>What actually happens to your code:</p>
<ul>
<li><b>Compilation</b>: javac → bytecode (.class) → JVM interprets, then the <b>JIT</b> compiles hot paths to native code (why Java "warms up").</li>
<li><b>Memory</b>: objects live on the <b>heap</b> (shared, GC-managed); each thread has a <b>stack</b> of frames holding locals and references. Deep/infinite recursion → <code>StackOverflowError</code>; heap exhaustion → <code>OutOfMemoryError</code>.</li>
<li><b>GC</b>: generational — most objects die young (eden/survivor), long-lived ones get promoted. Modern collectors: G1 (default), ZGC (low-pause). You tune with flags, not System.gc().</li>
<li><b>Common flags</b>: <code>-Xmx2g</code> max heap, <code>-Xms2g</code> initial heap, <code>-XX:+UseZGC</code>, <code>-XX:+HeapDumpOnOutOfMemoryError</code>.</li>
<li><b>Interning</b>: string literals share one pooled instance — <code>"a" == "a"</code> is true but never rely on it; <code>equals()</code> always.</li>
</ul>
<div class="codeSample">jps                    # JVM processes
jstack &lt;pid&gt;           # thread dump — find deadlocks
jmap -heap &lt;pid&gt;       # heap summary
jcmd &lt;pid&gt; GC.heap_info</div>`,
docs:[['JVM architecture — Baeldung','https://www.baeldung.com/jvm-vs-jre-vs-jdk'],['HotSpot GC tuning guide','https://docs.oracle.com/en/java/javase/21/gctuning/introduction-garbage-collection-tuning.html']],
ex:{title:'JVM drill',lang:'text',
prompt:`Answer on the numbered lines: (1) the error thrown by infinite recursion, (2) the error when the heap is exhausted, (3) the flag setting max heap to 2 GB, (4) where objects are allocated (one word), (5) where each thread's method frames live (one word), (6) the CLI tool that prints a thread dump for a pid, (7) the flag that writes a heap dump when the heap blows up.`,
starter:`# 1)

# 2)

# 3)

# 4)

# 5)

# 6)

# 7)
`,
tests:[{d:'StackOverflowError for recursion',re:'StackOverflowError'},{d:'OutOfMemoryError for heap exhaustion',re:'OutOfMemoryError'},{d:'-Xmx2g',re:'-Xmx2[gG]'},{d:'heap / stack answers',re:'[Hh]eap[\\s\\S]*[Ss]tack'},{d:'jstack for thread dumps',re:'jstack'},{d:'HeapDumpOnOutOfMemoryError flag',re:'HeapDumpOnOutOfMemoryError'}],
behavior:`1. (1) StackOverflowError. 2. (2) OutOfMemoryError. 3. (3) -Xmx2g. 4. (4) heap. 5. (5) stack. 6. (6) jstack <pid>. 7. (7) -XX:+HeapDumpOnOutOfMemoryError.`,
hints:['Recursion eats stack frames; allocation eats heap — the two errors mirror the two memory areas.','Heap flags start with -Xm…: -Xms initial, -Xmx max.','The j-tools: jps lists, jstack dumps threads, jmap inspects the heap.'],
solution:`# 1)
StackOverflowError

# 2)
OutOfMemoryError

# 3)
-Xmx2g

# 4)
heap

# 5)
stack

# 6)
jstack <pid>

# 7)
-XX:+HeapDumpOnOutOfMemoryError`}}
]});
