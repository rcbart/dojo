STREAMS.push({icon:'🏛️',title:'Design Patterns',blurb:'The Gang-of-Four patterns that actually appear in Java codebases — creational, behavioral, structural — with modern Java takes and the discipline to know when not to use them.',lessons:[
{id:'pat1',title:'Creational: Singleton, Factory & Builder',body:`
<p>Design patterns are named solutions to recurring design problems. You've already used half of them without the names — this stream attaches the names, the trade-offs, and the modern-Java shortcuts. First family: <b>creating objects</b>.</p>
<ul>
<li><b>Singleton</b> — exactly one instance. The naive double-checked-locking dance is a famous minefield; the two idioms worth knowing are the <b>enum singleton</b> (one-constant enum — serialization- and reflection-proof) and the <b>holder idiom</b> (nested class initialized lazily by the JVM, no locks). In Spring apps you rarely write one: <i>beans are singletons managed for you</i> — a DI container is largely a singleton factory.</li>
<li><b>Static factory methods</b> — <code>List.of(...)</code>, <code>Optional.of(...)</code>, <code>Duration.ofMinutes(10)</code>: named constructors that can cache, subtype, or validate. Prefer them over bare constructors for readability alone.</li>
<li><b>Factory Method / Abstract Factory</b> — push the "which concrete class?" decision behind an interface: <code>ConnectionFactory.create()</code>. You met this spirit in JDBC (<code>DriverManager</code>) and Jackson (<code>ObjectMapper</code> readers).</li>
<li><b>Builder</b> — the cure for telescoping constructors (<code>new User(name, null, true, false, null, 3)</code> — which boolean was which?). A fluent object assembles the configuration, then <code>build()</code> produces an immutable result. You've been on the consuming end constantly: <code>HttpRequest.newBuilder()...build()</code>, <code>Caffeine.newBuilder()</code>, Lombok's <code>@Builder</code>.</li>
</ul>
<div class="codeSample">// holder idiom — lazy, thread-safe, no locks
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
    .build();</div>`,
docs:[['Effective Java patterns summary — items 1-5','https://dev.java/learn/api/'],['Refactoring Guru — Builder','https://refactoring.guru/design-patterns/builder'],['Refactoring Guru — Singleton','https://refactoring.guru/design-patterns/singleton']],
ex:{title:'Build an immutable config',
prompt:`Write an immutable <code>ServerConfig</code> (fields <code>String host; int port; boolean tls</code>, all <code>final</code>) with a <b>private constructor</b>, a <code>static Builder builder()</code> entry point, and a <b>static nested</b> class <code>Builder</code> whose fluent setters (<code>host(String)</code>, <code>port(int)</code>, <code>tls(boolean)</code>) each <code>return this</code>, finished by <code>ServerConfig build()</code> that calls the private constructor.`,
starter:`public class ServerConfig {
    // 1. final fields + private constructor

    // 2. static Builder builder()

    // 3. static nested Builder: fluent setters returning this, build()
}`,
tests:[{d:'Fields are final (immutable result)',re:'final\\s+String\\s+host'},{d:'Constructor is private',re:'private\\s+ServerConfig\\s*\\('},{d:'Static builder() entry point',re:'static\\s+Builder\\s+builder\\s*\\(\\s*\\)'},{d:'Builder is a static nested class',re:'static\\s+(final\\s+)?class\\s+Builder'},{d:'Fluent setters return this',re:'return\\s+this\\s*;'},{d:'build() produces the ServerConfig',re:'ServerConfig\\s+build\\s*\\(\\s*\\)[^}]*new\\s+ServerConfig\\s*\\('}],
behavior:`1. ServerConfig.builder().host("api.io").port(443).tls(true).build() returns a config with those three values. 2. The chain works in any order and reads like prose. 3. new ServerConfig(...) does not compile from outside — the builder is the only door. 4. The built object has no setters; it cannot change after build(). 5. Unset values keep the Builder's defaults.`,
hints:['Constructor takes the builder: <code>private ServerConfig(Builder b) { this.host = b.host; this.port = b.port; this.tls = b.tls; }</code> — one assignment per field.','Each setter is two lines: <code>Builder port(int port) { this.port = port; return this; }</code> — returning this is what makes the chain work.','Entry + exit: <code>static Builder builder() { return new Builder(); }</code> and inside Builder: <code>ServerConfig build() { return new ServerConfig(this); }</code>'],
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
<p>Second family: <b>how objects collaborate and vary behavior</b>. These three you have genuinely already built — now with names:</p>
<ul>
<li><b>Strategy</b> — extract a varying algorithm behind an interface and inject it. Every <code>Comparator</code> you've written is a strategy; so were the per-constant enum bodies in the enums lesson. Modern Java collapses the ceremony: <i>a strategy is usually just a functional interface + lambdas</i>, chosen at runtime, stored in a field or a Map.</li>
<li><b>Observer</b> — subjects notify a list of subscribers. This is the listener pattern from the events lesson, the DOM's addEventListener, Spring's <code>ApplicationEventPublisher</code>, and — at industrial scale — the Kafka lesson. Core shape: <code>List&lt;Consumer&lt;Event&gt;&gt; listeners</code>, a <code>subscribe()</code>, and a loop calling <code>accept()</code>.</li>
<li><b>Template Method</b> — an abstract class fixes the skeleton (<code>final</code> method calling steps in order) and subclasses fill in the steps. You met it in the extends lesson's abstract classes and JUnit's lifecycle. The modern alternative: pass the varying steps as lambdas (strategy wins again).</li>
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
void fire(String item) { listeners.forEach(l -&gt; l.accept(item)); }</div>`,
docs:[['Refactoring Guru — Strategy','https://refactoring.guru/design-patterns/strategy'],['Refactoring Guru — Observer','https://refactoring.guru/design-patterns/observer'],['Refactoring Guru — Template Method','https://refactoring.guru/design-patterns/template-method']],
ex:{title:'Pricing with pluggable strategies',
prompt:`Build (1) a <code>@FunctionalInterface</code> <code>Discount</code> with <code>double apply(double price)</code>; (2) <code>class Register</code> with constants <code>Discount NONE</code> (identity lambda) and <code>Discount SUMMER</code> (20% off — multiply by 0.8); (3) <code>double checkout(double price, Discount d)</code> delegating to the strategy; (4) Observer support: a <code>List&lt;Consumer&lt;Double&gt;&gt; listeners</code>, <code>void onSale(Consumer&lt;Double&gt; l)</code>, and have <code>checkout</code> notify every listener with the final price via <code>forEach</code> + <code>accept</code>.`,
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
behavior:`1. checkout(100, Register.NONE) returns 100.0; checkout(100, Register.SUMMER) returns 80.0. 2. A registered listener receives the final (discounted) price each time checkout runs. 3. Two listeners both fire, in registration order. 4. New pricing rules require zero changes to Register — pass a new lambda: that is the Strategy pattern's whole point.`,
hints:['The interface: <code>@FunctionalInterface interface Discount { double apply(double price); }</code> — one abstract method makes lambdas assignable to it.','Strategies as constants: <code>static final Discount NONE = p -&gt; p; static final Discount SUMMER = p -&gt; p * 0.8;</code>','checkout: <code>double f = d.apply(price); listeners.forEach(l -&gt; l.accept(f)); return f;</code> — capture the final price in a local so the lambda can use it.'],
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
}`}},
{id:'pat3',title:'Structural: Adapter, Decorator & Facade',body:`
<p>Third family: <b>composing objects into bigger structures</b> — all three are exercises in <i>composition over inheritance</i>: hold a reference, delegate, add value around the call.</p>
<ul>
<li><b>Adapter</b> — make a class you can't change fit an interface you need. Wrap the legacy/foreign object and translate calls. You did this instinctively wrapping HttpClient responses; <code>Arrays.asList</code> and <code>InputStreamReader</code> (bytes → chars) are stdlib adapters.</li>
<li><b>Decorator</b> — same interface in, same interface out, extra behavior around the delegate. The whole <code>java.io</code> design: <code>new BufferedReader(new InputStreamReader(in))</code> stacks buffering onto character decoding — each layer <i>is a</i> Reader and <i>has a</i> Reader. Also: <code>Collections.unmodifiableList</code>, servlet filter chains, Spring's transactional proxies around your beans.</li>
<li><b>Facade</b> — one simple entry point over a messy subsystem: <code>orderFacade.place(cart)</code> hiding inventory + payment + shipping + events. Your service layer classes are facades; so is SLF4J over logging backends.</li>
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

// stacks arbitrarily — exactly like java.io
Printer p = new TimestampPrinter(new UpperCasePrinter(new ConsolePrinter()));</div>`,
docs:[['Refactoring Guru — Adapter','https://refactoring.guru/design-patterns/adapter'],['Refactoring Guru — Decorator','https://refactoring.guru/design-patterns/decorator'],['Refactoring Guru — Facade','https://refactoring.guru/design-patterns/facade']],
ex:{title:'Adapt the legacy, decorate the new',
prompt:`Given interface <code>Printer { void print(String msg); }</code> and an unchangeable <code>class LegacyPrinter { void output(String text) {...} }</code>: (1) write <code>PrinterAdapter implements Printer</code> holding a <code>LegacyPrinter</code> field (constructor-injected) whose <code>print</code> translates to <code>output(msg)</code>; (2) write decorator <code>PrefixPrinter implements Printer</code> holding a <code>Printer delegate</code> and a <code>String prefix</code>, whose <code>print</code> calls <code>delegate.print(prefix + msg)</code>. Both use composition — no extends anywhere.`,
starter:`interface Printer { void print(String msg); }

class LegacyPrinter {                 // cannot be modified
    void output(String text) { System.out.println(text); }
}

// 1. PrinterAdapter: Printer over a LegacyPrinter

// 2. PrefixPrinter: decorates any Printer with a prefix`,
tests:[{d:'Adapter implements the target interface',re:'class\\s+PrinterAdapter\\s+implements\\s+Printer'},{d:'Adapter wraps the legacy object (composition)',re:'(private\\s+)?(final\\s+)?LegacyPrinter\\s+\\w+\\s*;'},{d:'Adapter translates print → output',re:'\\w+\\.output\\s*\\(\\s*msg\\s*\\)'},{d:'Decorator holds a Printer delegate',re:'(private\\s+)?(final\\s+)?Printer\\s+delegate'},{d:'Decorator adds the prefix then delegates',re:'delegate\\.print\\s*\\(\\s*prefix\\s*\\+\\s*msg\\s*\\)'},{d:'Composition only — nothing extends',re:'extends\\s+(LegacyPrinter|Printer)',not:true}],
behavior:`1. new PrinterAdapter(new LegacyPrinter()).print("hi") reaches LegacyPrinter.output("hi") — the legacy class now fits anywhere a Printer is expected. 2. new PrefixPrinter(adapter, "LOG: ").print("hi") prints "LOG: hi". 3. Decorators stack: new PrefixPrinter(new PrefixPrinter(adapter, "B"), "A") applies A then B. 4. Neither class extends anything — pure composition.`,
hints:['Adapter: <code>class PrinterAdapter implements Printer { private final LegacyPrinter legacy; PrinterAdapter(LegacyPrinter legacy) { this.legacy = legacy; } public void print(String msg) { legacy.output(msg); } }</code>','Decorator constructor takes both: <code>PrefixPrinter(Printer delegate, String prefix)</code> — store both in final fields.','The decorator body is one line: <code>public void print(String msg) { delegate.print(prefix + msg); }</code> — add value, then hand off. Stacking falls out for free.'],
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
}`}}
]});
