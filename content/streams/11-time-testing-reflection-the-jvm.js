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
<p>Rules: store <code>Instant</code> (UTC) in databases, apply zones only at display; <code>Period</code> for calendar amounts, <code>Duration</code> for exact time; never forget the return value — <code>d.plusDays(1)</code> without assignment is a no-op bug.</p>
<h4>Why the old API had to be replaced</h4>
<p>It is worth knowing what was wrong, because the fixes explain the new design. <code>Date</code> was
<b>mutable</b>, so passing one to a method meant that method could change it under you — and it was shared
across threads with no safety. <code>Calendar</code> had months numbered from zero, so December was 11 and
off-by-one errors were the norm. <code>SimpleDateFormat</code> was not thread-safe, and being stateless in
appearance, it was routinely stored in a static field, which produced corrupted dates under load and
nowhere else.</p>
<p><code>java.time</code> answers all three: everything is <b>immutable</b>, therefore thread-safe;
formatters are immutable and safe to share; and the type you choose states what you mean.</p>

<h4>Choosing the right type is the whole skill</h4>
<div class="codeSample" data-hl>LocalDate       a calendar date. no time, NO ZONE.
                a birthday. a contract date. "2026-07-16" as a human means it.

LocalDateTime   date + time, still NO ZONE. it is NOT a moment in time -
                it is "9am", which is a different instant in every country.
                the most misused type in the API.

Instant         an exact point on the timeline, UTC. what a machine means
                by "when". store THIS.

ZonedDateTime   an instant plus the rules of a place. use at the edges,
                for display and for scheduling in local terms.

Duration        exact elapsed time (seconds/nanos).  "90 minutes"
Period          calendar amount (years/months/days). "1 month"
                -> and these are NOT interchangeable, see below</div>

<h4>The traps that produce real bugs</h4>
<p><b>Forgetting the return value.</b> Every method returns a new object; <code>d.plusDays(1);</code> as a
statement does nothing at all and compiles cleanly. It is the most common java.time bug and the easiest to
miss in review.</p>
<p><b>Period and Duration disagree, correctly.</b> Adding one month to 31 January gives 28 February —
month lengths vary. Adding 30 days gives 2 March. Both are right; only one is what you meant. And across a
daylight-saving boundary, adding <code>Period.ofDays(1)</code> keeps the wall-clock time while
<code>Duration.ofHours(24)</code> shifts it by an hour.</p>
<p><b>Storing local times.</b> A meeting stored as an <code>Instant</code> is wrong if the government moves
the clocks after you scheduled it — the user meant "9am on the 3rd in Berlin", so store the local time and
the zone id, and resolve to an instant at use. Conversely, an event that already happened is an
<code>Instant</code>, always.</p>
<p><b>Zone ids, not offsets.</b> <code>ZoneId.of("Europe/Berlin")</code> carries the DST rules;
<code>+01:00</code> is a fixed offset that will be wrong for half the year. And those rules change by
political decision, so keep the tzdata in your JDK and containers current.</p>

<h4>The one change that makes time testable</h4>
<p>Inject a <code>Clock</code> rather than calling <code>now()</code> directly. Every
<code>now()</code> method accepts one, so production passes <code>Clock.systemUTC()</code> and tests pass
<code>Clock.fixed(...)</code>. That single habit removes an entire category of untestable code — expiry
windows, rate limits, scheduling — and it costs one constructor parameter.</p>`,
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
<p><b>What makes a test worth having.</b> A good test fails for exactly one reason, names that reason in
its title, and does not change when you refactor the implementation. That last property is the one most
often lost: a test that asserts on internal calls rather than observable behaviour breaks every time you
improve the code, and a suite that punishes refactoring gets deleted or ignored.</p>

<h4>Mock the boundary, not your own logic</h4>
<div class="codeSample" data-hl>// GOOD — mock what you do not control
when(paymentGateway.charge(any())).thenReturn(Receipt.ok("r-1"));

// BAD — mocking your own domain means you are testing the mock
when(orderCalculator.total(any())).thenReturn(new Money(100));

// verify BEHAVIOUR that matters, not every interaction
verify(paymentGateway).charge(argThat(c -&gt; c.amount().equals(expected)));
verifyNoMoreInteractions(paymentGateway);   // use sparingly: it is brittle</div>
<p>The rule of thumb: mock things that are slow, non-deterministic, or outside your process — clocks,
networks, payment providers, the filesystem. Mocking your own value objects and calculators produces
tests that pass while the system is broken.</p>

<h4>Determinism: the two usual culprits</h4>
<p><b>Time</b> and <b>randomness</b> make tests flaky, and both are fixable by injection. Take a
<code>Clock</code> rather than calling <code>Instant.now()</code>, and a <code>Random</code> with a
fixed seed. <code>Clock.fixed(...)</code> in a test turns "expires tomorrow" from a guess into an
assertion — and it lets you test the boundary, which is where date bugs live.</p>

<h4>JUnit 5 features worth using</h4>
<div class="codeSample" data-hl>@ParameterizedTest                  // one test, many cases — beats copy-paste
@CsvSource({"1,I", "4,IV", "9,IX"})
void converts(int n, String expected) { ... }

@Nested class WhenAccountIsClosed { ... }   // group by scenario, share setup
assertThrows(InsufficientFunds.class, () -&gt; account.withdraw(500));
assertAll(() -&gt; assertEquals(...), () -&gt; assertEquals(...));  // report ALL
                                                               // failures, not
                                                               // just the first</div>
<p><code>@ParameterizedTest</code> is the highest-value habit here: it turns five near-identical tests
into one with five rows, and adding a case becomes a line rather than a method.</p>

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
<p>Without <code>RUNTIME</code> retention, <code>getAnnotation</code> returns null — the single most common custom-annotation bug. Reflection is powerful but slow and unchecked: frameworks cache it; application code should rarely need it.</p>
<h4>Why the two are always discussed together</h4>
<p>Separately they are unremarkable: an annotation is inert metadata, and reflection is a slow way to do
what a normal method call does better. Together they are the mechanism behind every framework you have
used in this course — <b>you declare intent, and something else discovers it and supplies behaviour</b>.
JUnit finds your <code>@Test</code> methods this way. Spring finds beans and transactional methods. Jackson
finds property names.</p>
<p>Seeing that once removes the magic permanently: no framework has access to a mechanism you do not. What
they have is the discipline to cache the reflection and a lot of edge-case handling.</p>

<h4>Retention is the setting that decides whether any of it works</h4>
<div class="codeSample" data-hl>SOURCE   discarded by the compiler.        @Override, @SuppressWarnings
         visible only to annotation processors (Lombok, MapStruct)
CLASS    in the .class file, NOT loaded.  (the default - almost never
         what you want)
RUNTIME  in the class file AND readable via reflection. what frameworks
         need.

// no @Retention at all => CLASS => getAnnotation() returns null,
// your aspect never fires, and nothing anywhere reports an error.
// this is the bug, and it costs everyone an afternoon exactly once.</div>
<p><code>@Target</code> is the other half: it makes misuse a <b>compile error</b> rather than an annotation
that silently does nothing where it was put.</p>

<h4>The costs, honestly</h4>
<p>Reflection is slower than direct invocation — lookups are expensive, and while modern JITs optimise
repeated calls well, the discovery phase is not free. It also <b>defeats the compiler</b>: a field renamed
by a refactoring tool leaves a string somewhere that no longer matches, and you find out at runtime. And
it can breach encapsulation, which is why the module system (later in this course) restricts deep
reflection by default and why <code>setAccessible(true)</code> increasingly needs an explicit
<code>--add-opens</code>.</p>
<p>So: frameworks scan once at startup and cache the result; application code should reach for an interface
or a functional parameter first. If you find yourself reflecting to call one of your own methods, there is
usually a design that does not need to.</p>

<h4>The modern alternatives</h4>
<p>Two directions have replaced a lot of runtime reflection. <b>Annotation processors</b> read the same
annotations at compile time and generate real code — fast, checked, debuggable, and the basis of MapStruct
and Micronaut. And <b>method handles</b> / <code>VarHandle</code> give reflective flexibility at close to
direct-call speed. Worth knowing they exist before you write a reflection-heavy library.</p>`,
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

Role[] roles = Backoffice.class.getAnnotationsByType(Role.class);  // both!</div>
<h4>The move that turns annotations into a design tool</h4>
<p>Everything above is machinery; the reason to learn it is that it lets you express a policy <b>once</b>
and apply it declaratively. Instead of six lines of audit code repeated in forty methods — which someone
will eventually forget — there is one annotation and one implementation, and the omission is visible
because the annotation is missing.</p>
<p>The composed-annotation pattern is worth internalising because it is exactly how the frameworks are
built, all the way down:</p>
<div class="codeSample" data-hl>@RestController  IS  @Controller + @ResponseBody
@SpringBootApplication  IS  @Configuration + @EnableAutoConfiguration
                            + @ComponentScan

// so your own:
@Retention(RUNTIME) @Target(TYPE)
@RestController
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/admin")
public @interface AdminEndpoint {}

// one annotation now carries a routing convention AND a security policy.
// change the policy in one place and every admin endpoint follows.</div>
<p>Spring resolves meta-annotations recursively, so this needs no code at all. Note that plain Java does
<b>not</b> — <code>getAnnotation()</code> looks only at what is directly present, so outside a framework
you must walk the annotations on the annotation yourself.</p>

<h4><code>@Inherited</code>, and why it disappoints</h4>
<p>It sounds like "subclasses see this" and is much narrower: it applies only to <b>class-level</b>
annotations, only for <code>getAnnotation</code> (not <code>getDeclaredAnnotation</code>), and
<b>never</b> to methods or interfaces. An annotation on an interface is not inherited by implementing
classes under any circumstances. Frameworks work around this by searching the hierarchy themselves, which
is why Spring's <code>AnnotatedElementUtils</code> exists and finds things plain reflection will not.</p>

<h4>What annotations cannot do</h4>
<p>The element types are restricted — primitives, <code>String</code>, <code>Class</code>, enums, other
annotations, and arrays of those. No arbitrary objects, and <b>no nulls</b>, so an "absent" value has to be
signalled by a default like <code>""</code>. Values must be compile-time constants, which is why you see
<code>Class</code> literals and string expressions (like Spring's SpEL) rather than lambdas.</p>

<h4>When not to reach for one</h4>
<p>Annotations move behaviour away from the code it affects. That is their value and their cost: a reader
looking at the method cannot see what else happens to it, and a typo in an annotation-driven behaviour
fails silently. Use them for genuinely cross-cutting, orthogonal concerns — auditing, transactions,
security, serialisation — and not as a way to configure business logic, where an ordinary parameter is
clearer and the compiler is on your side.</p>`,
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
jcmd &lt;pid&gt; GC.heap_info</div>
<h4>Why "compiled and interpreted" is the interesting part</h4>
<p>Java's odd-sounding hybrid is what makes it fast in long-running processes. Bytecode starts interpreted,
which is slow but requires no analysis. Meanwhile the JVM <b>profiles</b> — which branches are taken, which
types actually appear at each call site — and once a method is hot, the JIT compiles it to native code
using that evidence.</p>
<p>The result is optimisation a static compiler cannot perform: an interface call that has only ever seen
one implementation is compiled as a direct call and inlined; branches never taken are compiled away. If the
assumption later proves wrong, the JVM <b>deoptimises</b> and recompiles. This is why Java frequently beats
naively-written C++ in long-running services, and why the first thousand requests are slower than the rest
— the "warm-up" everyone mentions.</p>
<div class="codeSample" data-hl>// two practical consequences:
// 1. BENCHMARKS. timing a loop in main() measures the interpreter and
//    a half-optimised JIT. use JMH, which warms up properly. hand-rolled
//    microbenchmarks in Java are wrong more often than they are right.
// 2. STARTUP. this is why serverless and CLI workloads consider AOT
//    (GraalVM native-image): no warm-up, no JIT, lower peak throughput.</div>

<h4>Memory: what the two regions really mean</h4>
<p><b>Heap</b> holds objects and is shared by every thread; it is what the garbage collector manages and
what <code>-Xmx</code> sizes. <b>Stack</b> is per-thread, holds frames with locals and references, and is
freed automatically as calls return. So <code>StackOverflowError</code> is a runaway recursion and
<code>OutOfMemoryError: Java heap space</code> is either a genuine capacity problem or a leak.</p>
<p>And "leak" in Java means <b>an unintended reference</b>, not forgotten frees. The usual culprits are a
static collection that only grows, a cache with no eviction, a listener never unregistered, and a
<code>ThreadLocal</code> not cleared on a pooled thread. The tool is a heap dump — take it with
<code>-XX:+HeapDumpOnOutOfMemoryError</code> and open it in Eclipse MAT, which will name the retaining
path.</p>
<p>Also worth knowing that the heap is not all of it: metaspace, thread stacks, code cache and direct byte
buffers live <b>outside</b> it, which is why a container with <code>-Xmx</code> set to the memory limit
gets OOM-killed by the kernel with nothing in the application log.</p>

<h4>GC, and the only tuning advice that survives contact</h4>
<p>Generational collection exploits one empirical fact: <b>most objects die young</b>. New objects go in
eden, survivors are copied a few times, and the persistent minority are promoted to the old generation —
so the common case is collecting a small region where almost everything is garbage, which is cheap.</p>
<p>The practical guidance is short. Do not call <code>System.gc()</code>. Do not copy JVM flags from a blog.
Choose a collector by requirement — <b>G1</b> is a good default, <b>ZGC</b> when pause time matters more
than throughput, <b>Parallel</b> for batch throughput — then <b>measure before changing anything else</b>.
Most "GC problems" are allocation problems, and the fix is in your code.</p>

<h4>The tools to reach for at 3am</h4>
<p><code>jcmd &lt;pid&gt; help</code> lists everything a live JVM will tell you. <code>jstack</code> for a
thread dump when things are hung — take three, thirty seconds apart, and look for threads stuck in the same
place. <b>JFR</b> (<code>jcmd &lt;pid&gt; JFR.start</code>) is the one worth learning properly: continuous,
low-overhead profiling you can leave running in production and inspect afterwards in JDK Mission
Control.</p>`,
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
