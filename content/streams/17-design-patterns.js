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
}`}},
{id:'pat4',title:'More creational: Prototype, Abstract Factory & Object Pool',body:`
<p>Beyond Singleton/Factory/Builder, three more creational patterns show up in real code:</p>
<ul>
<li><b>Prototype</b> — create a new object by <b>copying an existing one</b> instead of building from scratch. Useful when construction is expensive or you want a preconfigured template you clone and tweak. In Java a <b>copy constructor</b> (or a <code>copy()</code> method) is the clean, modern form — usually preferable to <code>Cloneable</code>, which has sharp edges.</li>
<li><b>Abstract Factory</b> — a factory of related factories: it produces <b>families of objects</b> that must go together (e.g. a <code>WidgetFactory</code> that makes matching buttons, menus, and dialogs for a given OS theme), so you never mix incompatible parts.</li>
<li><b>Object Pool</b> — reuse a fixed set of expensive objects (DB connections, threads) instead of creating and destroying them. HikariCP and thread pools are object pools.</li>
</ul>
<p>The through-line: control <i>how</i> objects come into being — by cloning, by coordinated families, or by reuse — to cut cost or enforce consistency.</p>`,
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
behavior:`copy() produces an independent Prototype with the same theme and size — cloning a preconfigured template rather than rebuilding it. A copy constructor/method is the idiomatic Java Prototype.`,
hints:['Prototype = clone an existing object; here, construct a new one from this object’s fields.','A copy constructor or copy() method is cleaner than Cloneable.','Return new Prototype(theme, size).']}},
{id:'pat5',title:'More structural: Proxy, Composite, Bridge & Flyweight',body:`
<p>Structural patterns beyond Adapter/Decorator/Facade:</p>
<ul>
<li><b>Proxy</b> — a stand-in with the <i>same interface</i> as the real object that adds a behavior around access: <b>lazy loading</b>, <b>caching</b>, access control, or remoting. Spring AOP proxies and lazy JPA entities are proxies.</li>
<li><b>Composite</b> — treat individual objects and groups uniformly through one interface, so a leaf and a tree of children are handled the same way (files and folders, UI components).</li>
<li><b>Bridge</b> — split an abstraction from its implementation so they vary independently (a <code>Shape</code> hierarchy and a <code>Renderer</code> hierarchy that combine, instead of a class explosion).</li>
<li><b>Flyweight</b> — share immutable intrinsic state across many objects to save memory (Java’s <code>Integer</code> cache, interned strings).</li>
</ul>
<p>They all shape <i>how objects are composed and accessed</i> without changing what they do.</p>`,
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
<p>Behavioral patterns beyond Strategy/Observer/Template Method:</p>
<ul>
<li><b>Command</b> — wrap an action as an object so you can queue it, log it, undo it, or pass it around (menu actions, job queues, undo stacks).</li>
<li><b>State</b> — let an object change its behavior when its internal state changes, replacing sprawling conditionals with a clean state machine (an order that is placed → paid → shipped → delivered).</li>
<li><b>Chain of Responsibility</b> — pass a request along a chain of handlers until one handles it (middleware pipelines, servlet filters, event bubbling).</li>
<li><b>Iterator / Mediator / Visitor</b> round out the set: iterate without exposing internals, centralize how objects interact, and add operations over a structure without changing its classes.</li>
</ul>
<p>These all move <i>behavior</i> into first-class, swappable pieces.</p>`,
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
<li><b>Dependency Injection</b> — a class receives its collaborators from outside (usually via the <b>constructor</b>) instead of creating them itself. This is what makes code testable (inject a fake) and is the backbone of Spring. Prefer constructor injection over field injection.</li>
<li><b>Repository / DAO</b> — put all persistence for an entity behind one interface (<code>UserRepository.findById</code>), so business code never touches SQL directly and the storage can be swapped or mocked.</li>
<li><b>DTO (Data Transfer Object)</b> — a plain data carrier for moving data across a boundary (API request/response), decoupling your API shape from your internal domain model. Java <code>record</code>s are ideal DTOs.</li>
<li><b>Null Object</b> — return a harmless do-nothing implementation instead of <code>null</code>, so callers skip null checks (a <code>NoOpLogger</code>).</li>
</ul>
<p>Together they define how modern services are wired, persisted, and communicated.</p>`,
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
behavior:`Service is given a Repo (real or a test fake) at construction and delegates lookup to it. Nothing inside Service knows how the data is stored — that is DI plus the Repository pattern, and it is exactly what makes the class unit-testable.`,
hints:['Inject the dependency through the constructor and keep it in a final field.','lookup delegates straight to repo.find(id).','Never new up the dependency inside the class — that defeats DI.']}},
{id:'pat8',title:'Anti-patterns: spot them, fix them, avoid them',body:`
<p>An <b>anti-pattern</b> is a common "solution" that looks reasonable but reliably causes harm — the shadow side of design patterns. Recognizing them is as valuable as knowing the good patterns. The usual suspects:</p>
<ul>
<li><b>God Object / God Class</b> — one class that knows and does everything. <b>Spot:</b> thousands of lines, dozens of unrelated methods, every change touches it. <b>Fix:</b> split by responsibility (Single Responsibility Principle) into focused collaborators. <b>Avoid:</b> watch class size and cohesion as you go.</li>
<li><b>Magic numbers / strings</b> — unexplained literals (<code>if (status == 3)</code>). <b>Spot:</b> literals with no name. <b>Fix:</b> extract named constants or enums. <b>Avoid:</b> name every meaningful value.</li>
<li><b>Copy-paste programming</b> — the same logic duplicated. <b>Spot:</b> near-identical blocks. <b>Fix:</b> extract a shared method (DRY). <b>Avoid:</b> refactor the second time you copy.</li>
<li><b>Global mutable state / Singleton abuse</b> — shared mutable globals. <b>Spot:</b> hidden dependencies, flaky tests, spooky action at a distance. <b>Fix:</b> inject dependencies instead. <b>Avoid:</b> prefer explicit parameters and DI.</li>
<li><b>Premature optimization</b> — complexity for speed you never measured. <b>Spot:</b> clever code, no profiler data. <b>Fix:</b> revert to the simple version; measure, then optimize the real hot spot. <b>Avoid:</b> make it correct and clear first.</li>
<li><b>Big Ball of Mud, Spaghetti, Anemic Domain Model, Golden Hammer</b> — round out the catalog: no architecture, tangled flow, logic-less data classes, and "one tool for everything."</li>
</ul>
<p>The meta-cure is the set of principles the patterns encode: <b>SRP/SOLID</b>, <b>DRY</b>, <b>KISS</b>, and <b>YAGNI</b> — plus the discipline to refactor continuously so smells never compound. And remember the twist: over-applying patterns is itself an anti-pattern. Use the simplest thing that works.</p>`,
docs:[['AntiPatterns — Wikipedia','https://en.wikipedia.org/wiki/Anti-pattern'],['Code smells','https://refactoring.guru/refactoring/smells'],['SOLID principles','https://en.wikipedia.org/wiki/SOLID']],
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
tests:[{d:'god object -> split by responsibility',re:'"god-object".*?"split by responsibility"',flags:'s'},{d:'magic number -> named constant',re:'"magic-number".*?"extract a named constant"',flags:'s'},{d:'copy-paste -> extract a method',re:'"copy-paste".*?"extract a shared method"',flags:'s'},{d:'global mutable state -> inject dependencies',re:'"global-mutable-state".*?"inject dependencies"',flags:'s'},{d:'premature optimization -> measure first',re:'"premature-optimization".*?"measure then optimize"',flags:'s'},{d:'unknown default',re:'"unknown"'}],
behavior:`remedy("god-object") is "split by responsibility", remedy("copy-paste") is "extract a shared method", remedy("premature-optimization") is "measure then optimize". Naming the smell points straight at the refactoring.`,
hints:['Each smell maps to a specific refactoring or principle.','God object -> SRP; magic number -> constant; copy-paste -> DRY; global state -> DI; premature optimization -> measure first.','Anything unlisted returns unknown.']}}
]});
