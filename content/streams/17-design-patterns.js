STREAMS.push({icon:'🏛️',title:'Design Patterns',blurb:'The Gang-of-Four patterns that actually appear in Java codebases (creational, behavioral, structural) with modern Java takes and the discipline to know when not to use them.',lessons:[
{id:'pat1',title:'Creational: Singleton, Factory & Builder',body:`


<p>Design patterns are named solutions to recurring design problems. You have already used half of them. This stream attaches the names, the trade-offs, and the modern-Java shortcuts. First family: <b>creating objects</b>.</p>
<ul>
<li><b>Singleton</b>: exactly one instance. The naive double-checked-locking dance is a minefield. The two idioms to know are the <b>enum singleton</b>, a one-constant enum that is serialization- and reflection-proof, and the <b>holder idiom</b>, a nested class the JVM initializes lazily with no locks. A <b>DI</b> container is largely a singleton factory. DI is dependency injection: an object is handed the things it needs (a repository, a clock) instead of building them itself. It's what makes a class testable on its own, and what Spring's container does automatically.</li>
<li><b>Static factory methods</b>: <code>List.of(...)</code>, <code>Optional.of(...)</code>, <code>Duration.ofMinutes(10)</code>. Named constructors that can cache, subtype, or validate.</li>
<li><b>Factory Method / Abstract Factory</b>: push the "which concrete class?" decision behind an interface: <code>ConnectionFactory.create()</code>. You met this in JDBC (<code>DriverManager</code>) and Jackson (<code>ObjectMapper</code> readers).</li>
<li><b>Builder</b>: the cure for telescoping constructors. In <code>new User(name, null, true, false, null, 3)</code>, which boolean was which? A fluent object assembles the configuration, then <code>build()</code> produces an immutable result. You have used them: <code>HttpRequest.newBuilder()...build()</code>, <code>Caffeine.newBuilder()</code>, Lombok's <code>@Builder</code>.</li>
</ul>
<div class="codeSample">// holder idiom, lazy, thread-safe, no locks
class Config {
    private Config() {}
    private static class Holder { static final Config INSTANCE = new Config(); }
    static Config get() { return Holder.INSTANCE; }
}

// the builder you already know
HttpRequest req = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com"))
    .timeout(Duration.ofSeconds(5))
    .header("Accept", "application/json")
    .build();</div>

<h4>Singleton: the one to be suspicious of</h4>
<p>It is the most recognized pattern and the most often wrong. A singleton is global mutable state with a respectable name. It hides dependencies, since nothing in a signature says the class uses it. It makes tests order-dependent because state survives between them. Under concurrency it needs the same care as any shared mutable object. In Spring a <code>@Component</code> is already a single instance managed by the container, and it arrives through a constructor where you can see and replace it.</p>
<p>When you need one, use an <code>enum</code>. The JVM guarantees a single instance, including against reflection and serialization, which most hand-written singletons do not.</p>

<h4>Factory: naming the thing that varies</h4>
<p>A factory earns its place when construction involves a <i>decision</i>: which implementation, based on configuration, input or capability. With no decision, a constructor is clearer. Static factory methods are still a good habit without polymorphism, because they can be named. <code>Duration.ofSeconds(30)</code> says what the argument means. <code>new Duration(30)</code> does not.</p>

<h4>Builder: for the parameter list nobody can read</h4>
<p>Two adjacent <code>String</code>s or three <code>boolean</code>s in a constructor are a bug waiting to be written: callers transpose them and the compiler cannot help. A builder names each value at the call site and lets the object validate itself once, at <code>build()</code>, so an invalid instance never exists.</p>
<p>The modern caveat: for a small immutable value, a <b>record</b> does most of this with no ceremony. Reach for a builder when there are many optional fields, defaults to apply, or invariants to check across them.</p>`,
docs:[['Constructors vs static factory methods, Baeldung','https://www.baeldung.com/java-constructors-vs-static-factory-methods'],['Refactoring Guru (Builder)','https://refactoring.guru/design-patterns/builder'],['Refactoring Guru (Singleton)','https://refactoring.guru/design-patterns/singleton']],
ex:{title:'Build an immutable config',
prompt:`Write an immutable <code>ServerConfig</code> (fields <code>String host; int port; boolean tls</code>, all <code>final</code>) with a <b>private constructor</b>, a <code>static Builder builder()</code> entry point, and a <b>static nested</b> class <code>Builder</code> whose fluent setters (<code>host(String)</code>, <code>port(int)</code>, <code>tls(boolean)</code>) each <code>return this</code>, finished by <code>ServerConfig build()</code> that calls the private constructor.`,
starter:`public class ServerConfig {
    // 1. final fields + private constructor

    // 2. static Builder builder()

    // 3. static nested Builder: fluent setters returning this, build()
}`,
tests:[{d:'Fields are final (immutable result)',re:'final\\s+String\\s+host'},{d:'Constructor is private',re:'private\\s+ServerConfig\\s*\\('},{d:'Static builder() entry point',re:'static\\s+Builder\\s+builder\\s*\\(\\s*\\)'},{d:'Builder is a static nested class',re:'static\\s+(final\\s+)?class\\s+Builder'},{d:'Fluent setters return this',re:'return\\s+this\\s*;'},{d:'build() produces the ServerConfig',re:'ServerConfig\\s+build\\s*\\(\\s*\\)[^}]*new\\s+ServerConfig\\s*\\('}],
behavior:`1. ServerConfig.builder().host("api.io").port(443).tls(true).build() returns a config with those three values. 2. The chain works in any order and reads like prose. 3. new ServerConfig(...) does not compile from outside; the builder is the only door. 4. The built object has no setters; it cannot change after build(). 5. Unset values keep the Builder's defaults.`,
hints:['Constructor takes the builder: <code>private ServerConfig(Builder b) { this.host = b.host; this.port = b.port; this.tls = b.tls; }</code>: one assignment per field.','Each setter is two lines: <code>Builder port(int port) { this.port = port; return this; }</code>: returning this is what makes the chain work.','Entry + exit: <code>static Builder builder() { return new Builder(); }</code> and inside Builder: <code>ServerConfig build() { return new ServerConfig(this); }</code>'],
solution:`public class ServerConfig {
    final String host;
    final int port;
    final boolean tls;

    private ServerConfig(Builder b) {
        this.host = b.host;
        this.port = b.port;
        this.tls = b.tls;
    }

    static Builder builder() { return new Builder(); }

    static class Builder {
        String host = "localhost";
        int port = 8080;
        boolean tls = false;

        Builder host(String host) { this.host = host; return this; }
        Builder port(int port) { this.port = port; return this; }
        Builder tls(boolean tls) { this.tls = tls; return this; }

        ServerConfig build() { return new ServerConfig(this); }
    }
}`}},
{id:'pat2',title:'Behavioral: Strategy, Observer & Template Method',body:`


<p>Second family: <b>how objects collaborate and vary behavior</b>. You have already built these three, now with names:</p>
<ul>
<li><b>Strategy</b>: extract a varying algorithm behind an interface and inject it. Every <code>Comparator</code> you have written is a strategy, and so were the per-constant enum bodies in the enums lesson. Modern Java collapses the ceremony: <i>a strategy is usually just a functional interface + lambdas</i>, chosen at runtime, stored in a field or a Map.</li>
<li><b>Observer</b>: subjects notify a list of subscribers. This is the listener pattern from the events lesson, the DOM's addEventListener, Spring's <code>ApplicationEventPublisher</code>, and, at industrial scale, the Kafka lesson. (The <b>DOM</b> is the Document Object Model: the browser's live, in-memory tree of the page. JavaScript changes what you see by changing that tree, and addEventListener is how a piece of that tree subscribes to clicks.) Core shape: <code>List&lt;Consumer&lt;Event&gt;&gt; listeners</code>, a <code>subscribe()</code>, and a loop calling <code>accept()</code>.</li>
<li><b>Template Method</b>: an abstract class fixes the skeleton (<code>final</code> method calling steps in order) and subclasses fill in the steps. You met it in the extends lesson's abstract classes and JUnit's lifecycle. The modern alternative is to pass the varying steps as lambdas. Strategy wins again.</li>
</ul>
<div class="codeSample">// Strategy: the algorithm is a value
@FunctionalInterface interface Discount { double apply(double price); }

Discount NONE    = p -&gt; p;
Discount SUMMER  = p -&gt; p * 0.8;
Discount VIP     = p -&gt; Math.max(0, p - 20);

double checkout(double price, Discount d) { return d.apply(price); }

// Observer: subscribers over time
List&lt;Consumer&lt;String&gt;&gt; listeners = new ArrayList&lt;&gt;();
void onSale(Consumer&lt;String&gt; l) { listeners.add(l); }
void fire(String item) { listeners.forEach(l -&gt; l.accept(item)); }</div>

<h4>What these three have in common</h4>
<p>All three separate <b>what varies</b> from <b>what stays the same</b>, which is the whole of behavioral design. Strategy varies an algorithm behind a fixed call. Observer varies who reacts to an event without the source knowing. Template Method fixes the skeleton and varies the steps: any abstract base class with a <code>run()</code> that calls <code>doStep()</code>.</p>

<h4>Where each goes wrong</h4>
<ul>
<li><b>Strategy</b> collapses to a lambda in modern Java, and that is usually correct. But a map of lambdas keyed by string trades compile-time checking for a runtime lookup that can fail. If the set of strategies is fixed, a sealed interface or an enum keeps the compiler involved.</li>
<li><b>Observer</b> is the one that causes production incidents. Listeners are usually called <i>synchronously</i>, so a slow listener slows the publisher, and one that throws can stop the rest from running. Unregistering is easy to forget, which is a memory leak with a hidden reference, the same one as inner classes.</li>
<li><b>Template Method</b> ties subclasses to the parent's call order forever: the fragile base class problem. Composition, passing the varying step in, gives the same flexibility without inheritance, so it has lost ground to strategy.</li>
</ul>

<h4>The test before reaching for any of them</h4>
<p>Ask whether the variation is real and present, not hypothetical. A strategy interface with one implementation is indirection you pay for and do not use. The second implementation is cheap to introduce when it arrives.</p>`,
docs:[['Refactoring Guru (Strategy)','https://refactoring.guru/design-patterns/strategy'],['Refactoring Guru (Observer)','https://refactoring.guru/design-patterns/observer'],['Refactoring Guru (Template Method)','https://refactoring.guru/design-patterns/template-method']],
exs:[{title:'Pricing with pluggable strategies',
prompt:`Build (1) a <code>@FunctionalInterface</code> <code>Discount</code> with <code>double apply(double price)</code>; (2) <code>class Register</code> with constants <code>Discount NONE</code> (identity lambda) and <code>Discount SUMMER</code> (20% off: multiply by 0.8); (3) <code>double checkout(double price, Discount d)</code> delegating to the strategy; (4) Observer support: a <code>List&lt;Consumer&lt;Double&gt;&gt; listeners</code>, <code>void onSale(Consumer&lt;Double&gt; l)</code>, and have <code>checkout</code> notify every listener with the final price via <code>forEach</code> + <code>accept</code>.`,
starter:`import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

// 1. @FunctionalInterface Discount

class Register {
    // 2. NONE and SUMMER strategies as lambdas

    // 4. listeners + onSale(...)

    double checkout(double price, Discount d) {
        // 3. apply strategy, notify observers, return final price
        return 0;
    }
}`,
tests:[{d:'Discount is a @FunctionalInterface',re:'@FunctionalInterface[^{]*interface\\s+Discount'},{d:'NONE is an identity lambda',re:'NONE\\s*=\\s*\\w+\\s*->\\s*\\w+\\s*;'},{d:'SUMMER takes 20% off',re:'SUMMER\\s*=\\s*\\w+\\s*->\\s*\\w+\\s*\\*\\s*0?\\.8'},{d:'checkout delegates to the strategy',re:'d\\.apply\\s*\\(\\s*price\\s*\\)'},{d:'Observers registered via onSale',re:'onSale\\s*\\(\\s*Consumer<Double>\\s+\\w+\\s*\\)'},{d:'Every listener notified',re:'listeners\\.forEach\\s*\\(\\s*\\w+\\s*->\\s*\\w+\\.accept\\s*\\('}],
behavior:`1. checkout(100, Register.NONE) returns 100.0; checkout(100, Register.SUMMER) returns 80.0. 2. A registered listener receives the final (discounted) price each time checkout runs. 3. Two listeners both fire, in registration order. 4. New pricing rules require zero changes to Register; pass a new lambda: that is the Strategy pattern's whole point.`,
hints:['The interface: <code>@FunctionalInterface interface Discount { double apply(double price); }</code>: one abstract method makes lambdas assignable to it.','Strategies as constants: <code>static final Discount NONE = p -&gt; p; static final Discount SUMMER = p -&gt; p * 0.8;</code>','checkout: <code>double f = d.apply(price); listeners.forEach(l -&gt; l.accept(f)); return f;</code>: capture the final price in a local so the lambda can use it.'],
solution:`import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

@FunctionalInterface
interface Discount { double apply(double price); }

class Register {
    static final Discount NONE   = p -> p;
    static final Discount SUMMER = p -> p * 0.8;

    List<Consumer<Double>> listeners = new ArrayList<>();

    void onSale(Consumer<Double> l) { listeners.add(l); }

    double checkout(double price, Discount d) {
        double f = d.apply(price);
        listeners.forEach(l -> l.accept(f));
        return f;
    }
}`},
{title:'Strategy without the ceremony',lang:'js',diff:'medium',
run:{call:'applyStrategy',cases:[{"name": "ten percent off", "args": ["tenPercent", 1000], "expect": 900}, {"name": "a flat five off, in cents", "args": ["flatFive", 1000], "expect": 500}, {"name": "the discount never makes the total negative", "args": ["flatFive", 100], "expect": 0}, {"name": "no discount leaves the amount alone", "args": ["none", 1000], "expect": 1000}, {"name": "an unknown strategy falls back to none", "args": ["nope", 1000], "expect": 1000}]},
prompt:`Write <code>function applyStrategy(name, amount)</code> where <code>amount</code> is in cents and the strategies are: <code>none</code> (unchanged), <code>tenPercent</code> (10% off, rounded to the nearest cent), and <code>flatFive</code> (500 cents off, never below zero). An unknown name behaves as <code>none</code>. In JavaScript a strategy is a function in a lookup table, the same pattern the Java lesson expresses with an interface.`,
starter:`function applyStrategy(name, amount) {\n  return amount;\n}`,
solution:`function applyStrategy(name, amount) {\n  const strategies = {\n    none: a => a,\n    tenPercent: a => Math.round(a * 0.9),\n    flatFive: a => Math.max(0, a - 500)\n  };\n  return (strategies[name] ?? strategies.none)(amount);\n}`,
tests:[{d:'strategies live in a lookup table',re:'\\{[^}]*=>'},{d:'an unknown name falls back',re:'\\?\\?|\\|\\||undefined'},{d:'the percentage strategy rounds',re:'Math\\.round'},{d:'the flat discount is floored at zero',re:'Math\\.max'}],
behavior:`Five cases run. The floor case is the requirement people leave out, and it is the one that shows up as a negative invoice. The unknown-name case is the important design choice: falling back to "no discount" is safe, while throwing would take down a checkout because someone added a promotion the code has not shipped yet, and defaulting to the LARGEST discount would be worse still. Note what has disappeared compared with the Java version: no interface, no classes, no factory. The pattern is the idea (behavior selected at runtime by name), and the class ceremony is one language\x27s way of expressing it, not the pattern itself.`,
hints:['A plain object whose values are functions IS the strategy table.','Look the strategy up, fall back if it is missing, then call it.','Money is in cents and must never go negative; clamp the result.']}]},
{id:'pat3',title:'Structural: Adapter, Decorator & Facade',body:`

<p>Third family: <b>composing objects into bigger structures</b>. All three are exercises in <i>composition over inheritance</i>: hold a reference, delegate, add value around the call.</p>
<ul>
<li><b>Adapter</b>: make a class you cannot change fit an interface you need. Wrap the legacy or foreign object and translate calls. You did this wrapping HttpClient responses. <code>Arrays.asList</code> and <code>InputStreamReader</code> (bytes → chars) are stdlib adapters.</li>
<li><b>Decorator</b>: same interface in, same interface out, extra behavior around the delegate. This is the whole <code>java.io</code> design. <code>new BufferedReader(new InputStreamReader(in))</code> stacks buffering onto character decoding, and each layer <i>is a</i> Reader and <i>has a</i> Reader. Also: <code>Collections.unmodifiableList</code>, servlet filter chains, Spring's transactional proxies around your beans.</li>
<li><b>Facade</b>: one simple entry point over a messy subsystem. <code>orderFacade.place(cart)</code> hides inventory + payment + shipping + events. Your service layer classes are facades. So are SLF4J over logging backends and <code>java.net.http.HttpClient</code> over connection pooling, negotiation and redirects.</li>
</ul>
<div class="codeSample">// Decorator: a Printer that adds timestamps around any other Printer
interface Printer { void print(String msg); }

class TimestampPrinter implements Printer {
    private final Printer delegate;               // HAS-A the same interface
    TimestampPrinter(Printer delegate) { this.delegate = delegate; }
    public void print(String msg) {
        delegate.print("[" + Instant.now() + "] " + msg);   // add value, delegate
    }
}

// stacks arbitrarily, exactly like java.io
Printer p = new TimestampPrinter(new UpperCasePrinter(new ConsolePrinter()));</div>

<h4>Telling the three apart</h4>
<p>They look identical in a diagram. All three wrap an object. The difference is <b>why</b>:</p>
<ul>
<li><b>Adapter</b> changes an interface you do not control into one your code expects. The wrapped thing was already useful. It spoke the wrong language.</li>
<li><b>Decorator</b> keeps the same interface and adds behavior: caching, retry, timing, logging. Because the type is unchanged, decorators stack, and the caller cannot tell how many are present.</li>
<li><b>Facade</b> hides several collaborating objects behind one simple entry point. It changes no interfaces and adds no behavior. It narrows the surface a caller has to learn.</li>
</ul>
<p>The test question: <i>am I translating, adding, or simplifying?</i> One answer each.</p>

<h4>Where each earns its place, and where it does not</h4>
<p><b>Adapter</b> keeps a third-party library from spreading through your codebase. Wrap it once at the boundary and the rest of your code depends on your interface, so replacing the vendor is one class rather than a search-and-replace. The cost is a layer of indirection people will sometimes want to skip.</p>
<p><b>Decorator</b> is the cleaner alternative to inheritance for cross-cutting behavior. A retrying, caching, instrumented client composed from three decorators is testable in isolation. The same thing as a subclass hierarchy is not. Its failure mode is depth. A stack five deep gives a stack trace nobody can read, and an ordering that matters and is written down nowhere. If retry sits outside caching, you retry cache reads. Inside, you cache failures.</p>
<p><b>Facade</b> is the least glamorous and most often correct. Its risk is becoming a god object: a facade that grows a method per use case has stopped simplifying.</p>`,
docs:[['Refactoring Guru (Adapter)','https://refactoring.guru/design-patterns/adapter'],['Refactoring Guru (Decorator)','https://refactoring.guru/design-patterns/decorator'],['Refactoring Guru (Facade)','https://refactoring.guru/design-patterns/facade']],
ex:{title:'Adapt the legacy, decorate the new',
prompt:`Given interface <code>Printer { void print(String msg); }</code> and an unchangeable <code>class LegacyPrinter { void output(String text) {...} }</code>: (1) write <code>PrinterAdapter implements Printer</code> holding a <code>LegacyPrinter</code> field (constructor-injected) whose <code>print</code> translates to <code>output(msg)</code>; (2) write decorator <code>PrefixPrinter implements Printer</code> holding a <code>Printer delegate</code> and a <code>String prefix</code>, whose <code>print</code> calls <code>delegate.print(prefix + msg)</code>. Both use composition: no extends anywhere.`,
starter:`interface Printer { void print(String msg); }

class LegacyPrinter {                 // cannot be modified
    void output(String text) { System.out.println(text); }
}

// 1. PrinterAdapter: Printer over a LegacyPrinter

// 2. PrefixPrinter: decorates any Printer with a prefix`,
tests:[{d:'Adapter implements the target interface',re:'class\\s+PrinterAdapter\\s+implements\\s+Printer'},{d:'Adapter wraps the legacy object (composition)',re:'(private\\s+)?(final\\s+)?LegacyPrinter\\s+\\w+\\s*;'},{d:'Adapter translates print → output',re:'\\w+\\.output\\s*\\(\\s*msg\\s*\\)'},{d:'Decorator holds a Printer delegate',re:'(private\\s+)?(final\\s+)?Printer\\s+delegate'},{d:'Decorator adds the prefix then delegates',re:'delegate\\.print\\s*\\(\\s*prefix\\s*\\+\\s*msg\\s*\\)'},{d:'Composition only: nothing extends',re:'extends\\s+(LegacyPrinter|Printer)',not:true}],
behavior:`1. new PrinterAdapter(new LegacyPrinter()).print("hi") reaches LegacyPrinter.output("hi"); the legacy class now fits anywhere a Printer is expected. 2. new PrefixPrinter(adapter, "LOG: ").print("hi") prints "LOG: hi". 3. Decorators stack: new PrefixPrinter(new PrefixPrinter(adapter, "B"), "A") applies A then B. 4. Neither class extends anything: pure composition.`,
hints:['Adapter: <code>class PrinterAdapter implements Printer { private final LegacyPrinter legacy; PrinterAdapter(LegacyPrinter legacy) { this.legacy = legacy; } public void print(String msg) { legacy.output(msg); } }</code>','Decorator constructor takes both: <code>PrefixPrinter(Printer delegate, String prefix)</code>: store both in final fields.','The decorator body is one line: <code>public void print(String msg) { delegate.print(prefix + msg); }</code>: add value, then hand off. Stacking falls out for free.'],
solution:`interface Printer { void print(String msg); }

class LegacyPrinter {                 // cannot be modified
    void output(String text) { System.out.println(text); }
}

class PrinterAdapter implements Printer {
    private final LegacyPrinter legacy;
    PrinterAdapter(LegacyPrinter legacy) { this.legacy = legacy; }
    public void print(String msg) { legacy.output(msg); }
}

class PrefixPrinter implements Printer {
    private final Printer delegate;
    private final String prefix;
    PrefixPrinter(Printer delegate, String prefix) {
        this.delegate = delegate;
        this.prefix = prefix;
    }
    public void print(String msg) { delegate.print(prefix + msg); }
}`}},
{id:'pat4',title:'More creational: Prototype, Abstract Factory & Object Pool',body:`


<p>Beyond Singleton, Factory and Builder, three more creational patterns show up in real code:</p>
<ul>
<li><b>Prototype</b>: create a new object by <b>copying an existing one</b> instead of building from scratch. Useful when construction is expensive or you want a preconfigured template to clone and tweak. In Java a <b>copy constructor</b> or a <code>copy()</code> method is the modern form, usually preferable to <code>Cloneable</code>.</li>
<li><b>Abstract Factory</b>: a factory of related factories. It produces <b>families of objects</b> that must go together, such as a <code>WidgetFactory</code> that makes matching buttons, menus, and dialogs for a given OS theme, so you never mix incompatible parts.</li>
<li><b>Object Pool</b>: reuse a fixed set of expensive objects (DB connections, threads) instead of creating and destroying them. HikariCP and thread pools are object pools.</li>
</ul>

<h4>Prototype: copying is harder than it looks</h4>
<p>A copy is <b>shallow</b> unless you make it deep. Copy an object holding a list and both copies share that list, so a mutation through one is visible through the other. That aliasing bug is why <code>Cloneable</code> has a bad reputation. <code>Object.clone()</code> is shallow, the interface declares no <code>clone</code> method, and the mechanism bypasses constructors, so invariants and final fields are not established the way the class expects.</p>
<p>A <b>copy constructor</b> or a static <code>copyOf</code> is ordinary code with ordinary rules. You decide field by field what is shared and what is duplicated. Immutable fields can be shared safely. The compiler helps when a field is added. Records make the deep-copy question explicit: <code>with</code>-style copying still shares any mutable component.</p>

<h4>Abstract Factory: the point is the family</h4>
<p>A plain factory hides <i>which</i> implementation you get. An abstract factory guarantees the pieces <b>match</b>. One call site cannot produce a Postgres connection with a MySQL dialect, because the factory hands you both. The cost is a lot of interfaces, for a benefit you only need when incompatible mixtures are possible. So it appears in toolkits, drivers and cross-platform UI, and is over-applied everywhere else. In modern Java the same guarantee often comes free from a sealed interface plus a switch, or from the service loader.</p>

<h4>Object Pool: reuse what is expensive to create, and nothing else</h4>
<p>Pooling was once general advice and is now narrow. Object allocation on the JVM is close to free, a pointer bump in the young generation. A pooled object survives long enough to be promoted, which makes <b>GC</b> work harder, not easier. GC is garbage collection: the JVM finds objects nothing can reach any more and frees their memory for you. The price is pauses, and long-lived objects are the expensive kind to check. Pool only things the JVM cannot make cheap: a TCP connection with a handshake, a thread with a stack, a native handle. Not your DTOs, the plain classes that only carry data across a boundary.</p>
<p>Pools bring their own failure modes. Exhaustion under load: a queue, a timeout and a rejection policy are required. Leaked objects that are never returned. State left over from the previous user: a pooled object must be reset on return or it carries one request's data into the next.</p>`,
docs:[['Prototype pattern','https://refactoring.guru/design-patterns/prototype'],['Abstract Factory','https://refactoring.guru/design-patterns/abstract-factory']],
ex:{title:'Implement Prototype (copy)',
prompt:`Write class <code>Prototype</code> with a constructor <code>(String theme, int size)</code>, accessors <code>theme()</code> and <code>size()</code>, and a <code>Prototype copy()</code> method that returns a <b>new</b> instance with the same field values (the prototype clone).`,
starter:`public class Prototype {
    private final String theme;
    private final int size;
    Prototype(String theme, int size) { this.theme = theme; this.size = size; }
    String theme() { return theme; }
    int size() { return size; }
    Prototype copy() {
        return null;
    }
}`,
solution:`public class Prototype {
    private final String theme;
    private final int size;
    Prototype(String theme, int size) { this.theme = theme; this.size = size; }
    String theme() { return theme; }
    int size() { return size; }
    Prototype copy() {
        return new Prototype(theme, size);
    }
}`,
tests:[{d:'copy() returns a NEW instance with the same fields',re:'return\\s+new\\s+Prototype\\s*\\(\\s*theme\\s*,\\s*size\\s*\\)'},{d:'does not return null',re:'return\\s+null\\s*;',not:true}],
behavior:`copy() produces an independent Prototype with the same theme and size, cloning a preconfigured template rather than rebuilding it. A copy constructor/method is the idiomatic Java Prototype.`,
hints:['Prototype = clone an existing object; here, construct a new one from this object’s fields.','A copy constructor or copy() method is cleaner than Cloneable.','Return new Prototype(theme, size).']}},
{id:'pat5',title:'More structural: Proxy, Composite, Bridge & Flyweight',body:`


<p>Structural patterns beyond Adapter, Decorator and Facade:</p>
<ul>
<li><b>Proxy</b>: a stand-in with the <i>same interface</i> as the real object that adds a behavior around access: <b>lazy loading</b>, <b>caching</b>, access control, or remoting. Spring AOP proxies and lazy JPA entities are proxies. <b>AOP</b> is aspect-oriented programming: wrapping many methods with the same behavior (open a transaction, log the call, check a permission) from the outside, so the methods don't each repeat it; <code>@Transactional</code> works this way. <b>JPA</b> is the Java Persistence API, the standard for mapping Java objects to database tables: you annotate a class and the provider (usually Hibernate) writes the SQL, and a lazy entity is a stand-in that only runs the query when you first touch it.</li>
<li><b>Composite</b>: treat individual objects and groups uniformly through one interface, so a leaf and a tree of children are handled the same way (files and folders, UI components).</li>
<li><b>Bridge</b>: split an abstraction from its implementation so they vary independently. A <code>Shape</code> hierarchy and a <code>Renderer</code> hierarchy combine instead of a class explosion.</li>
<li><b>Flyweight</b>: share immutable intrinsic state across many objects to save memory (Java’s <code>Integer</code> cache, interned strings).</li>
</ul>
<h4>Reading each one as a problem, not a shape</h4>
<p>They all shape <i>how objects are composed and accessed</i> without changing what they do. Each answers a different question.</p>

<h4>Proxy: "I need something to happen around access"</h4>
<p>Same interface, different object. The caller cannot tell. You add caching, lazy loading, access control, retries or remoting <b>without touching either side</b>.</p>
<div class="codeSample" data-hl>interface Report { byte[] render(); }

class CachingReport implements Report {          // same interface
    private final Report real; private byte[] cached;
    public byte[] render() {
        if (cached == null) cached = real.render();
        return cached;                            // caller is unaware
    }
}

// this is exactly Spring: @Transactional works because your bean is
// replaced by a proxy that opens a transaction and calls through.
// which is ALSO why self-invocation skips it - an internal call never
// leaves the object, so it never passes through the proxy.</div>
<p><b>Proxy vs Decorator</b>: identical structurally, different intent. A decorator <i>adds features</i> and you usually stack several deliberately. A proxy <i>controls access</i> to one specific object and is often invisible to the caller.</p>

<h4>Composite: "a group should behave like one item"</h4>
<p>When a client has to ask "is this a single thing or a collection?" before every operation, the conditionals spread everywhere. Composite gives leaf and container the same interface. <code>size()</code> on a file and on a folder are both just <code>size()</code>, and the recursion lives in the container rather than in every caller. Directory trees, UI component hierarchies, nested permission groups and org charts all take this shape.</p>

<h4>Bridge: "I have two things varying at once"</h4>
<p>The signal is a <b>class explosion</b>: three shapes times three renderers is nine classes, and a fourth of either makes it twelve. Bridge separates the two hierarchies and composes them, so you add one class instead of a row. You meet it as JDBC (one <code>Connection</code> API, many drivers) and as SLF4J over multiple logging backends.</p>

<h4>Flyweight: "I have millions of nearly identical objects"</h4>
<p>Split state into <b>intrinsic</b> and <b>extrinsic</b>. Intrinsic is shared and immutable: the character 'a' and its font. Extrinsic is per-use and passed in: its position. Share the first, pass the second. Java does this for you with the <code>Integer</code> cache for −128..127 and with interned string literals.</p>
<p>That cache is why <code>Integer a = 127, b = 127; a == b</code> is true while the same code with 128 is false. That is Flyweight leaking through. Use <code>equals()</code>, always.</p>
<p><b>When to reach for it:</b> only when you have measured a memory problem caused by object count. It requires immutability and makes the code harder. Applied speculatively it is pure cost.</p>`,
docs:[['Proxy pattern','https://refactoring.guru/design-patterns/proxy'],['Composite pattern','https://refactoring.guru/design-patterns/composite']],
ex:{title:'Implement a caching Proxy',
prompt:`Write class <code>ImageProxy</code> that lazily loads and caches. It has <code>String load()</code> returning <code>"pixels"</code> (the expensive real work) and <code>String get()</code> that returns the cached value, calling <code>load()</code> only the first time (store it in a field and reuse it after).`,
starter:`public class ImageProxy {
    private String cached;
    String load() { return "pixels"; }
    String get() {
        return null;
    }
}`,
solution:`public class ImageProxy {
    private String cached;
    String load() { return "pixels"; }
    String get() {
        if (cached == null) {
            cached = load();
        }
        return cached;
    }
}`,
tests:[{d:'loads only when not cached yet',re:'if\\s*\\(\\s*cached\\s*==\\s*null\\s*\\)'},{d:'caches the result of load()',re:'cached\\s*=\\s*load\\s*\\(\\s*\\)'},{d:'returns the cached value',re:'return\\s+cached'}],
behavior:`The first get() calls load() and stores "pixels"; later get() calls return the cached value without reloading. A proxy adds caching around the real object while keeping the same interface.`,
hints:['A caching proxy stores the result of the first real call.','Guard with if (cached == null) before calling load().','Return the field, not a fresh load, on subsequent calls.']}},
{id:'pat6',title:'More behavioral: Command, State, Chain of Responsibility',body:`

<p>Behavioral patterns beyond Strategy, Observer and Template Method:</p>
<ul>
<li><b>Command</b>: wrap an action as an object so you can queue it, log it, undo it, or pass it around (menu actions, job queues, undo stacks).</li>
<li><b>State</b>: let an object change its behavior when its internal state changes. A state machine replaces sprawling conditionals (an order that is placed → paid → shipped → delivered).</li>
<li><b>Chain of Responsibility</b>: pass a request along a chain of handlers until one handles it (middleware pipelines, servlet filters, event bubbling).</li>
<li><b>Iterator / Mediator / Visitor</b> round out the set, covered at the end.</li>
</ul>
<h4>The common thread: turn a decision into an object</h4>
<p>All of these replace control flow with something you can name, store, pass around and test. If a pattern does not make something first-class that used to be buried in a conditional, it is not earning its complexity.</p>

<h4>Command: "an action I can hold onto"</h4>
<p>Once an action is an object rather than a method call, you can put it on a queue, retry it, log it, or schedule it. Give the command an inverse and you can undo it.</p>
<div class="codeSample" data-hl>interface Command { void execute(); void undo(); }

class Transfer implements Command {
    public void execute() { move(from, to, amount); }
    public void undo()    { move(to, from, amount); }
}
// a Deque&lt;Command&gt; is now an undo stack. a queue of them is a job
// system. a log of them is an audit trail - and if you keep the log
// rather than the state, you have arrived at event sourcing.</div>
<p>In modern Java a <code>Runnable</code> or a lambda <i>is</i> a command. The pattern earns its keep when you need operations a bare lambda cannot offer: undo, describe, serialize.</p>

<h4>State: "the object behaves differently depending on where it is"</h4>
<p>The smell is the same <code>switch (status)</code> appearing in five methods. Every new status means editing all five, and forgetting one is a silent bug. State moves the behavior into a class per state. A new state is a new class, and the compiler tells you what it must implement.</p>
<p>The benefit is that <b>illegal transitions become impossible rather than merely wrong</b>. If <code>Delivered</code> has no <code>cancel()</code> path, no code can cancel a delivered order. In Java, sealed interfaces plus pattern matching give you this with exhaustiveness checked at compile time. For simple cases an enum with per-constant method bodies is often enough. Do not build a state machine framework for three states.</p>

<h4>Chain of Responsibility: "someone in this line will handle it"</h4>
<p>A request passes along handlers until one deals with it. The sender does not know which handler will respond, and handlers can be reordered, added or removed independently. Every middleware pipeline you have used is built on it: servlet filters, Spring Security's filter chain, Express middleware, logging handlers.</p>
<p>The failure mode: <b>if nobody handles it, the request vanishes silently</b>. Always terminate the chain with a handler that either handles or fails loudly. Keep the chain short and its order explicit, or "which handler ran?" becomes a debugging exercise.</p>

<h4>The rest of the set, briefly</h4>
<p><b>Iterator</b> traverses without exposing internals, built into Java as <code>Iterable</code>. <b>Mediator</b> centralizes interaction so N components talk to one hub instead of each other, which is what a message bus does. <b>Visitor</b> adds operations to a stable class hierarchy without editing it. It earns its keep on ASTs and is awkward everywhere else, and Java's pattern matching for switch has largely replaced it.</p>`,
docs:[['State pattern','https://refactoring.guru/design-patterns/state'],['Chain of Responsibility','https://refactoring.guru/design-patterns/chain-of-responsibility'],['Command pattern','https://refactoring.guru/design-patterns/command']],
ex:{title:'Implement a State machine',
prompt:`Write class <code>TrafficLight</code> with a field <code>String state</code> starting at <code>"red"</code> and a <code>String next()</code> that transitions <code>red → green → yellow → red</code>, updates <code>state</code>, and returns the new state.`,
starter:`public class TrafficLight {
    String state = "red";
    String next() {
        return null;
    }
}`,
solution:`public class TrafficLight {
    String state = "red";
    String next() {
        switch (state) {
            case "red":    state = "green";  break;
            case "green":  state = "yellow"; break;
            default:       state = "red";    break;
        }
        return state;
    }
}`,
tests:[{d:'red transitions to green',re:'"red"\\s*:\\s*state\\s*=\\s*"green"',flags:'s'},{d:'green transitions to yellow',re:'"green"\\s*:\\s*state\\s*=\\s*"yellow"',flags:'s'},{d:'wraps back to red',re:'default\\s*:\\s*state\\s*=\\s*"red"'},{d:'returns the new state',re:'return\\s+state'}],
behavior:`Starting at "red", next() returns "green", then "yellow", then "red" again. The State pattern replaces tangled if/else with explicit transitions.`,
hints:['State drives behavior: switch on the current state to pick the next.','red → green → yellow → red, then return the updated field.','The default branch handles yellow → red.']}},
{id:'pat7',title:'Modern & enterprise: Dependency Injection, Repository, DTO, Null Object',body:`

<p>The patterns you meet most in day-to-day enterprise code are not all Gang-of-Four:</p>
<ul>
<li><b>Dependency Injection</b>: a class receives its collaborators from outside, usually via the <b>constructor</b>, instead of creating them itself. This is the backbone of Spring. Prefer constructor injection over field injection.</li>
<li><b>Repository / DAO</b>: put all persistence for an entity behind one interface (<code>UserRepository.findById</code>), so business code never touches SQL directly and the storage can be swapped or mocked.</li>
<li><b>DTO (Data Transfer Object)</b>: a plain data carrier for moving data across a boundary (API request/response), decoupling your API shape from your internal domain model. Java <code>record</code>s are ideal DTOs.</li>
<li><b>Null Object</b>: return a harmless do-nothing implementation instead of <code>null</code>, so callers skip null checks (a <code>NoOpLogger</code>).</li>
</ul>
<h4>Why these matter more than most of the Gang of Four</h4>
<p>The original catalog was written for 1994's problems, when frameworks were rare and inheritance was the main tool. These four are what you will meet in a service written this year. Three of them exist because <b>a boundary needs protecting</b>.</p>

<h4>Dependency Injection: the enabler for everything else</h4>
<p>A class that constructs its own collaborators has hardcoded which implementation, when it is created and how long it lives. Receiving them moves all three decisions outward, so the class can be tested with fakes and reused in another context.</p>
<p>Constructor injection makes the invalid state unreachable. The object cannot exist without its dependencies, the fields can be <code>final</code>, and the constructor signature is a visible list of what the class depends on. A constructor with nine parameters is telling you the class does too much. Field injection hides that fact behind nine annotations.</p>

<h4>Repository: a boundary, not a wrapper</h4>
<p>Business code expresses intent in domain terms and never learns how storage works. Done right, the interface is defined <b>by the domain</b> and implemented by the persistence layer, so the dependency arrow points inward and the database is a detail.</p>
<div class="codeSample" data-hl>// leaky - the domain now knows about SQL and pagination mechanics
List&lt;User&gt; query(String whereClause, int offset, int limit);

// a real boundary - stated in the language of the business
Optional&lt;User&gt; findByEmail(Email email);
List&lt;User&gt; findActiveSince(LocalDate date);

// and the test: could you back this with an in-memory map, a REST
// call, or a different database WITHOUT changing any caller?
// if not, it is a thin wrapper over your ORM, not a repository.</div>

<h4>DTO: decoupling your API from your model</h4>
<p>Serializing a domain object straight to JSON makes your internal model a public contract. Every rename becomes a breaking change. Every new field is accidentally exposed. Adding a JSON annotation to a domain class drags web concerns into the core. A DTO costs a mapping and buys you the freedom to change either side alone. Java <code>record</code>s make it nearly free. When the two shapes differ, write the mapping rather than generating it reflectively.</p>

<h4>Null Object: and when it is wrong</h4>
<p>Returning a do-nothing implementation removes null checks from every caller. It is a good fit for optional collaborators (a <code>NoOpMetrics</code>, a <code>NoOpLogger</code>) where doing nothing is a valid behavior.</p>
<p>It is a poor choice when absence is <b>meaningful</b>. A <code>NullUser</code> returned from a lookup that found nothing propagates silently through the system and surfaces as a wrong answer somewhere distant. Use <code>Optional</code> there, which forces the caller to acknowledge the case. Reserve Null Object for behavior rather than data.</p>`,
docs:[['Dependency Injection','https://martinfowler.com/articles/injection.html'],['Repository pattern','https://martinfowler.com/eaaCatalog/repository.html'],['DTO','https://martinfowler.com/eaaCatalog/dataTransferObject.html']],
ex:{title:'Constructor Dependency Injection',
prompt:`Model a repository behind an interface and inject it. Declare <code>interface Repo { String find(int id); }</code>, then class <code>Service</code> that holds a <code>private final Repo repo</code>, receives it via a <code>Service(Repo repo)</code> constructor (<code>this.repo = repo</code>), and has <code>String lookup(int id)</code> returning <code>repo.find(id)</code>. Do not create the Repo inside Service.`,
starter:`interface Repo { String find(int id); }

public class Service {
    // inject Repo via the constructor; do not new it up here
    String lookup(int id) {
        return null;
    }
}`,
solution:`interface Repo { String find(int id); }

public class Service {
    private final Repo repo;
    Service(Repo repo) {
        this.repo = repo;
    }
    String lookup(int id) {
        return repo.find(id);
    }
}`,
tests:[{d:'depends on the Repo interface (Repository pattern)',re:'interface\\s+Repo'},{d:'holds an injected final dependency',re:'private\\s+final\\s+Repo\\s+repo'},{d:'injects via the constructor',re:'Service\\s*\\(\\s*Repo\\s+repo\\s*\\)'},{d:'stores the injected instance',re:'this\\.repo\\s*=\\s*repo'},{d:'delegates to the repository',re:'repo\\.find\\s*\\(\\s*id\\s*\\)'},{d:'does not construct its own dependency',re:'new\\s+Repo',not:true}],
behavior:`Service is given a Repo (real or a test fake) at construction and delegates lookup to it. Nothing inside Service knows how the data is stored; that is DI plus the Repository pattern, and it is exactly what makes the class unit-testable.`,
hints:['Inject the dependency through the constructor and keep it in a final field.','lookup delegates straight to repo.find(id).','Never new up the dependency inside the class; that defeats DI.']}},
{id:'pat8',title:'Anti-patterns: spot them, fix them, avoid them',body:`


<p>An <b>anti-pattern</b> is a common "solution" that looks reasonable but reliably causes harm, the shadow side of design patterns. Recognizing them is as valuable as knowing the good patterns. The usual suspects:</p>
<ul>
<li><b>God Object / God Class</b>: one class that knows and does everything. <b>Spot:</b> thousands of lines, dozens of unrelated methods, every change touches it. <b>Fix:</b> split by responsibility (Single Responsibility Principle) into focused collaborators. <b>Avoid:</b> watch class size and cohesion as you go.</li>
<li><b>Magic numbers / strings</b>: unexplained literals (<code>if (status == 3)</code>). <b>Spot:</b> literals with no name. <b>Fix:</b> extract named constants or enums. <b>Avoid:</b> name every meaningful value.</li>
<li><b>Copy-paste programming</b>: the same logic duplicated. <b>Spot:</b> near-identical blocks. <b>Fix:</b> extract a shared method (DRY). <b>Avoid:</b> refactor the second time you copy.</li>
<li><b>Global mutable state / Singleton abuse</b>: shared mutable globals. <b>Spot:</b> hidden dependencies, flaky tests, spooky action at a distance. <b>Fix:</b> inject dependencies instead. <b>Avoid:</b> prefer explicit parameters and <b>DI</b>. DI is dependency injection: an object is handed the things it needs (a repository, a clock) instead of building them itself. It's what makes a class testable on its own, and what Spring's container does automatically.</li>
<li><b>Premature optimization</b>: complexity for speed you never measured. <b>Spot:</b> clever code, no profiler data. <b>Fix:</b> revert to the simple version. Measure, then optimize the real hot spot. <b>Avoid:</b> make it correct and clear first.</li>
<li><b>Big Ball of Mud, Spaghetti, Anemic Domain Model, Golden Hammer</b> round out the catalog: no architecture, tangled flow, logic-less data classes, and "one tool for everything."</li>
</ul>
<p>The meta-cure is the set of principles the patterns encode: <b>SRP/SOLID</b>, <b>DRY</b>, <b>KISS</b>, and <b>YAGNI</b>, plus the discipline to refactor continuously so smells never compound. Over-applying patterns is itself an anti-pattern. Use the simplest thing that works.</p>`,
docs:[['AntiPatterns (Wikipedia)','https://en.wikipedia.org/wiki/Anti-pattern'],['Code smells','https://refactoring.guru/refactoring/smells'],['SOLID principles','https://en.wikipedia.org/wiki/SOLID']],
ex:{title:'Prescribe the remedy',
prompt:`Write class <code>AntiPatterns</code> with <code>static String remedy(String smell)</code>: <code>"god-object"</code>→<code>"split by responsibility"</code>, <code>"magic-number"</code>→<code>"extract a named constant"</code>, <code>"copy-paste"</code>→<code>"extract a shared method"</code>, <code>"global-mutable-state"</code>→<code>"inject dependencies"</code>, <code>"premature-optimization"</code>→<code>"measure then optimize"</code>, and <code>"unknown"</code> for anything else.`,
starter:`public class AntiPatterns {
    static String remedy(String smell) {
        return null;
    }
}`,
solution:`public class AntiPatterns {
    static String remedy(String smell) {
        switch (smell) {
            case "god-object":             return "split by responsibility";
            case "magic-number":           return "extract a named constant";
            case "copy-paste":             return "extract a shared method";
            case "global-mutable-state":   return "inject dependencies";
            case "premature-optimization": return "measure then optimize";
            default:                       return "unknown";
        }
    }
}`,
tests:[{d:'god object -> split by responsibility',re:'(["\']god\\-object["\']\\s*(->|:)\\s*(\\{\\s*)?(yield\\s+|return\\s+)?["\']split by responsibility["\']|equals\\s*\\(\\s*["\']god\\-object["\']\\s*\\)[^"\']{0,40}["\']split by responsibility["\']|["\']god\\-object["\']\\s*\\.equals\\s*\\([^"\']{0,40}["\']split by responsibility["\']|===?\\s*["\']god\\-object["\'][^"\']{0,40}["\']split by responsibility["\']|["\']god\\-object["\']\\s*===?[^"\']{0,40}["\']split by responsibility["\']|(Map\\.of|Map\\.ofEntries|entry|\\.put|\\.set)\\s*\\([^;]{0,600}?["\']god\\-object["\']\\s*,\\s*["\']split by responsibility["\'])'},{d:'magic number -> named constant',re:'(["\']magic\\-number["\']\\s*(->|:)\\s*(\\{\\s*)?(yield\\s+|return\\s+)?["\']extract a named constant["\']|equals\\s*\\(\\s*["\']magic\\-number["\']\\s*\\)[^"\']{0,40}["\']extract a named constant["\']|["\']magic\\-number["\']\\s*\\.equals\\s*\\([^"\']{0,40}["\']extract a named constant["\']|===?\\s*["\']magic\\-number["\'][^"\']{0,40}["\']extract a named constant["\']|["\']magic\\-number["\']\\s*===?[^"\']{0,40}["\']extract a named constant["\']|(Map\\.of|Map\\.ofEntries|entry|\\.put|\\.set)\\s*\\([^;]{0,600}?["\']magic\\-number["\']\\s*,\\s*["\']extract a named constant["\'])'},{d:'copy-paste -> extract a method',re:'(["\']copy\\-paste["\']\\s*(->|:)\\s*(\\{\\s*)?(yield\\s+|return\\s+)?["\']extract a shared method["\']|equals\\s*\\(\\s*["\']copy\\-paste["\']\\s*\\)[^"\']{0,40}["\']extract a shared method["\']|["\']copy\\-paste["\']\\s*\\.equals\\s*\\([^"\']{0,40}["\']extract a shared method["\']|===?\\s*["\']copy\\-paste["\'][^"\']{0,40}["\']extract a shared method["\']|["\']copy\\-paste["\']\\s*===?[^"\']{0,40}["\']extract a shared method["\']|(Map\\.of|Map\\.ofEntries|entry|\\.put|\\.set)\\s*\\([^;]{0,600}?["\']copy\\-paste["\']\\s*,\\s*["\']extract a shared method["\'])'},{d:'global mutable state -> inject dependencies',re:'(["\']global\\-mutable\\-state["\']\\s*(->|:)\\s*(\\{\\s*)?(yield\\s+|return\\s+)?["\']inject dependencies["\']|equals\\s*\\(\\s*["\']global\\-mutable\\-state["\']\\s*\\)[^"\']{0,40}["\']inject dependencies["\']|["\']global\\-mutable\\-state["\']\\s*\\.equals\\s*\\([^"\']{0,40}["\']inject dependencies["\']|===?\\s*["\']global\\-mutable\\-state["\'][^"\']{0,40}["\']inject dependencies["\']|["\']global\\-mutable\\-state["\']\\s*===?[^"\']{0,40}["\']inject dependencies["\']|(Map\\.of|Map\\.ofEntries|entry|\\.put|\\.set)\\s*\\([^;]{0,600}?["\']global\\-mutable\\-state["\']\\s*,\\s*["\']inject dependencies["\'])'},{d:'premature optimization -> measure first',re:'(["\']premature\\-optimization["\']\\s*(->|:)\\s*(\\{\\s*)?(yield\\s+|return\\s+)?["\']measure then optimize["\']|equals\\s*\\(\\s*["\']premature\\-optimization["\']\\s*\\)[^"\']{0,40}["\']measure then optimize["\']|["\']premature\\-optimization["\']\\s*\\.equals\\s*\\([^"\']{0,40}["\']measure then optimize["\']|===?\\s*["\']premature\\-optimization["\'][^"\']{0,40}["\']measure then optimize["\']|["\']premature\\-optimization["\']\\s*===?[^"\']{0,40}["\']measure then optimize["\']|(Map\\.of|Map\\.ofEntries|entry|\\.put|\\.set)\\s*\\([^;]{0,600}?["\']premature\\-optimization["\']\\s*,\\s*["\']measure then optimize["\'])'},{d:'unknown default',re:'(default\\s*(->|:)\\s*(\\{\\s*)?(yield\\s+|return\\s+)?["\']unknown["\']|else[^"\']{0,40}["\']unknown["\']|getOrDefault\\s*\\([^;]{0,120}["\']unknown["\']|(\\?\\?|\\|\\|)\\s*["\']unknown["\']|return\\s+["\']unknown["\']\\s*;)'}],
behavior:`remedy("god-object") is "split by responsibility", remedy("copy-paste") is "extract a shared method", remedy("premature-optimization") is "measure then optimize". Naming the smell points straight at the refactoring.`,
hints:['Each smell maps to a specific refactoring or principle.','God object -> SRP; magic number -> constant; copy-paste -> DRY; global state -> DI; premature optimization -> measure first.','Anything unlisted returns unknown.']}}
]});
