STREAMS.push({icon:'⚡',title:'Modern Java Mastery',blurb:'Lambdas from beginner to master, method references, the Streams API, Optional, records, pattern matching, modern iteration & deep generics.',lessons:[
{id:'mod1',title:'Lambdas & functional interfaces',body:`
<p>A lambda is a compact implementation of a <b>functional interface</b> — an interface with exactly one abstract method. The JDK ships the common shapes in <code>java.util.function</code>:</p>
<div class="codeSample" data-hl>Predicate&lt;String&gt;  isEmpty = s -&gt; s.isEmpty();       // T → boolean
Function&lt;String,Integer&gt; len = s -&gt; s.length();      // T → R
Consumer&lt;String&gt;   print  = s -&gt; System.out.println(s); // T → void
Supplier&lt;Double&gt;   rand   = () -&gt; Math.random();     // () → T
BinaryOperator&lt;Integer&gt; add = (a, b) -&gt; a + b;       // (T,T) → T

names.removeIf(s -&gt; s.isBlank());
list.sort((a, b) -&gt; a.compareToIgnoreCase(b));</div>
<p>Multi-statement bodies use braces and an explicit <code>return</code>. Lambdas can read effectively-final local variables from the enclosing scope. Mark your own single-method interfaces <code>@FunctionalInterface</code>.</p>`,
docs:[['Lambda Expressions — dev.java','https://dev.java/learn/lambdas/'],['java.util.function — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/function/package-summary.html']],
ex:{title:'Think in functions',
prompt:`Write class <code>Funcs</code> with three <code>static</code> fields: <code>Predicate&lt;String&gt; NON_BLANK</code> (true when the string is not blank), <code>Function&lt;Integer,Integer&gt; SQUARE</code> (returns its input times itself: 5 → 25), and <code>BinaryOperator&lt;Integer&gt; MAX</code> (returns the larger of two ints — use a lambda, you may call Math.max inside). Import from <code>java.util.function</code>.`,
starter:`import java.util.function.*;

public class Funcs {
    static Predicate<String> NON_BLANK = null;   // s -> ...
    static Function<Integer, Integer> SQUARE = null;
    static BinaryOperator<Integer> MAX = null;
}`,
tests:[{d:'NON_BLANK is a lambda on String',re:'NON_BLANK\\s*=\\s*\\w+\\s*->'},{d:'SQUARE multiplies',re:'SQUARE\\s*=\\s*\\w+\\s*->\\s*\\w+\\s*\\*\\s*\\w+'},{d:'MAX is a two-arg lambda',re:'MAX\\s*=\\s*\\(\\s*\\w+\\s*,\\s*\\w+\\s*\\)\\s*->'},{d:'No anonymous classes',re:'new\\s+(Predicate|Function|BinaryOperator)',not:true}],
behavior:`1. NON_BLANK.test("hi") == true, NON_BLANK.test("  ") == false. 2. SQUARE.apply(5) == 25. 3. MAX.apply(3, 9) == 9. 4. All three are lambdas, not anonymous classes.`,
hints:['NON_BLANK: <code>s -> !s.isBlank()</code>','SQUARE: <code>n -> n * n</code>','MAX: <code>(a, b) -> Math.max(a, b)</code> (or write the ternary yourself).'],
solution:`import java.util.function.*;

public class Funcs {
    static Predicate<String> NON_BLANK = s -> !s.isBlank();
    static Function<Integer, Integer> SQUARE = n -> n * n;
    static BinaryOperator<Integer> MAX = (a, b) -> Math.max(a, b);
}`}},
{id:'mod2',title:'Method references',body:`
<p>When a lambda only calls one existing method, use a method reference — same behavior, clearer intent. Four kinds:</p>
<div class="codeSample" data-hl>Function&lt;String,Integer&gt; parse = Integer::parseInt;   // static
Function&lt;String,Integer&gt; len   = String::length;      // instance method of the parameter
Predicate&lt;String&gt; isJava = "java"::equals;            // instance method of a captured object
Supplier&lt;ArrayList&lt;String&gt;&gt; make = ArrayList::new;    // constructor

names.forEach(System.out::println);
names.sort(String::compareToIgnoreCase);</div>
<p>Rule of thumb: if your lambda reads <code>x -> something.method(x)</code> or <code>x -> x.method()</code>, a reference exists for it.</p>`,
docs:[['Method References — dev.java','https://dev.java/learn/lambdas/method-references/'],['Method References — Oracle','https://docs.oracle.com/javase/tutorial/java/javaOO/methodreferences.html']],
ex:{title:'Refactor to references',
prompt:`Write class <code>Refs</code> with static fields using <b>method references only</b> (no <code>-&gt;</code> anywhere): <code>Function&lt;String,Integer&gt; PARSE</code> (parses decimal text to its int value: "7" → 7), <code>Function&lt;String,String&gt; UPPER</code> (returns the string uppercased), <code>Supplier&lt;java.util.ArrayList&lt;String&gt;&gt; NEW_LIST</code> (returns a <b>new empty list on every call</b>), and <code>Consumer&lt;Object&gt; PRINT</code> (prints its argument to stdout).`,
starter:`import java.util.function.*;
import java.util.ArrayList;

public class Refs {
    static Function<String, Integer> PARSE = null;
    static Function<String, String> UPPER = null;
    static Supplier<ArrayList<String>> NEW_LIST = null;
    static Consumer<Object> PRINT = null;
}`,
tests:[{d:'PARSE uses Integer::parseInt',re:'Integer::parseInt'},{d:'UPPER uses String::toUpperCase',re:'String::toUpperCase'},{d:'NEW_LIST uses constructor reference',re:'ArrayList::new'},{d:'PRINT uses System.out::println',re:'System\\.out::println'},{d:'No lambda arrows at all',re:'->',not:true}],
behavior:`1. PARSE.apply("7") == 7. 2. UPPER.apply("dojo") equals "DOJO". 3. NEW_LIST.get() returns a new empty ArrayList each call. 4. PRINT.accept("x") prints x. 5. Zero -> arrows in the file.`,
hints:['Static method: <code>Integer::parseInt</code>.','Instance-method-of-parameter: <code>String::toUpperCase</code> — the parameter becomes the receiver.','Constructor: <code>ArrayList::new</code>; bound instance: <code>System.out::println</code>.'],
solution:`import java.util.function.*;
import java.util.ArrayList;

public class Refs {
    static Function<String, Integer> PARSE = Integer::parseInt;
    static Function<String, String> UPPER = String::toUpperCase;
    static Supplier<ArrayList<String>> NEW_LIST = ArrayList::new;
    static Consumer<Object> PRINT = System.out::println;
}`}},
{id:'modL2',title:'Lambdas II: composition & custom functional interfaces',body:`
<p>Lambdas become powerful when you <b>combine</b> them. The JDK functional interfaces ship default methods for exactly that:</p>
<div class="codeSample" data-hl>Function&lt;Integer,Integer&gt; plus3  = n -&gt; n + 3;
Function&lt;Integer,Integer&gt; times2 = n -&gt; n * 2;

plus3.andThen(times2).apply(1);   // (1+3)*2 = 8   — plus3 first
plus3.compose(times2).apply(1);   // (1*2)+3 = 5   — times2 first!

Predicate&lt;String&gt; nonNull  = s -&gt; s != null;
Predicate&lt;String&gt; nonEmpty = s -&gt; !s.isEmpty();
Predicate&lt;String&gt; valid    = nonNull.and(nonEmpty);
Predicate&lt;String&gt; invalid  = valid.negate();</div>
<p>You can also define your own functional interface — any interface with exactly one abstract method, ideally marked <code>@FunctionalInterface</code> so the compiler enforces it. Default methods let you give it combinators too. One rule to remember: lambdas capture local variables only if they are <b>effectively final</b> — assigned once, never changed.</p>`,
docs:[['Combining lambdas — dev.java','https://dev.java/learn/lambdas/combining-chaining-composing/'],['Function.andThen / compose — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/function/Function.html']],
ex:{title:'Compose and invent',
prompt:`(1) In class <code>Combo</code>, define <code>Function&lt;Integer,Integer&gt; PLUS3</code> (adds 3) and <code>TIMES2</code> (doubles) as lambdas, and <code>PIPELINE</code> as PLUS3 <b>andThen</b> TIMES2 — PLUS3 runs first, then TIMES2, so <code>PIPELINE.apply(1) == 8</code>. (2) Define your own <code>@FunctionalInterface Validator&lt;T&gt;</code> with abstract <code>boolean check(T t)</code> and a <b>default method</b> <code>Validator&lt;T&gt; and(Validator&lt;T&gt; other)</code> returning a validator that passes only when <b>both</b> this and other pass. (3) In Combo, define <code>Validator&lt;String&gt; STRONG</code> that requires (length ≥ 8) <b>and</b> (contains a digit, use a lambda with <code>chars().anyMatch(Character::isDigit)</code>).`,
starter:`import java.util.function.*;

@FunctionalInterface
interface Validator<T> {
    boolean check(T t);

    // default Validator<T> and(Validator<T> other) { ... }
}

public class Combo {
    static Function<Integer, Integer> PLUS3 = null;
    static Function<Integer, Integer> TIMES2 = null;
    static Function<Integer, Integer> PIPELINE = null; // PLUS3 then TIMES2

    static Validator<String> STRONG = null; // length>=8 AND has digit
}`,
tests:[{d:'@FunctionalInterface on Validator',re:'@FunctionalInterface\\s*(public\\s+)?interface\\s+Validator'},{d:'Default combinator method',re:'default\\s+Validator<T>\\s+and\\s*\\('},{d:'PIPELINE uses andThen',re:'PIPELINE\\s*=\\s*PLUS3\\.andThen\\s*\\(\\s*TIMES2\\s*\\)'},{d:'STRONG composed with .and(',re:'STRONG\\s*=[\\s\\S]*?\\.and\\s*\\('},{d:'Digit check via anyMatch',re:'anyMatch\\s*\\(\\s*Character::isDigit\\s*\\)'}],
behavior:`1. PIPELINE.apply(1) == 8 (add first, then double). 2. The default and(): returns t -> check(t) && other.check(t). 3. STRONG.check("abcdefg1") == true; STRONG.check("short1") == false; STRONG.check("abcdefgh") == false (no digit). 4. Validator has exactly one abstract method.`,
hints:['Default method body: <code>return t -> check(t) && other.check(t);</code> — a lambda implementing your own interface.','PIPELINE is not a new lambda — compose the two you have: <code>PLUS3.andThen(TIMES2)</code>.','STRONG: <code>((Validator&lt;String&gt;) s -> s.length() >= 8).and(s -> s.chars().anyMatch(Character::isDigit))</code> — the cast tells the compiler which interface the first lambda targets.'],
solution:`import java.util.function.*;

@FunctionalInterface
interface Validator<T> {
    boolean check(T t);

    default Validator<T> and(Validator<T> other) {
        return t -> check(t) && other.check(t);
    }
}

public class Combo {
    static Function<Integer, Integer> PLUS3 = n -> n + 3;
    static Function<Integer, Integer> TIMES2 = n -> n * 2;
    static Function<Integer, Integer> PIPELINE = PLUS3.andThen(TIMES2);

    static Validator<String> STRONG =
        ((Validator<String>) s -> s.length() >= 8)
            .and(s -> s.chars().anyMatch(Character::isDigit));
}`}},
{id:'modL3',title:'Lambdas III: higher-order functions, currying & memoization',body:`
<p>Master level: functions that <b>take or return functions</b>.</p>
<div class="codeSample" data-hl>// currying: a two-arg function as nested one-arg functions
Function&lt;Integer, Function&lt;Integer, Integer&gt;&gt; add = a -&gt; b -&gt; a + b;
Function&lt;Integer, Integer&gt; add5 = add.apply(5);   // partial application
add5.apply(3);                                    // 8

// higher-order: wrap any function with new behavior
static &lt;T, R&gt; Function&lt;T, R&gt; logged(Function&lt;T, R&gt; f) {
    return t -&gt; {
        R r = f.apply(t);
        System.out.println(t + " -&gt; " + r);
        return r;
    };
}

// laziness: Supplier defers cost until (and unless) needed
static &lt;T&gt; Supplier&lt;T&gt; memoize(Supplier&lt;T&gt; expensive) {
    var cache = new java.util.concurrent.atomic.AtomicReference&lt;T&gt;();
    return () -&gt; {
        T v = cache.get();
        if (v == null) { v = expensive.get(); cache.set(v); }
        return v;
    };
}</div>
<p>These patterns power real APIs: <code>Comparator.comparing(...).thenComparing(...)</code>, retry/timing wrappers, and every middleware chain you've ever used. If you can read <code>a -> b -> a + b</code> without blinking, you've arrived.</p>`,
docs:[['Writing lambdas — dev.java','https://dev.java/learn/lambdas/writing-lambdas/'],['Currying in Java — Baeldung','https://www.baeldung.com/java-currying']],
ex:{title:'Function factory',
prompt:`In class <code>Higher</code>: (1) define <code>static Function&lt;Integer, Function&lt;Integer, Integer&gt;&gt; MULTIPLIER = a -&gt; b -&gt; a * b</code> (curried multiply). (2) Write generic <code>static &lt;T, R&gt; Function&lt;T, R&gt; withDefault(Function&lt;T, R&gt; f, R fallback)</code> returning a function that calls f but returns fallback if f throws <b>any</b> RuntimeException. (3) Write <code>static Supplier&lt;String&gt; once(Supplier&lt;String&gt; s)</code> that calls s at most once and caches the result (a simple non-null field check is fine).`,
starter:`import java.util.function.*;

public class Higher {
    // (1) curried multiply
    static Function<Integer, Function<Integer, Integer>> MULTIPLIER = null;

    // (2) safety wrapper — higher-order function
    static <T, R> Function<T, R> withDefault(Function<T, R> f, R fallback) {
        return null;
    }

    // (3) call-once memoizer
    static Supplier<String> once(Supplier<String> s) {
        return null;
    }
}`,
tests:[{d:'Curried lambda (nested arrows)',re:'MULTIPLIER\\s*=\\s*\\w+\\s*->\\s*\\w+\\s*->'},{d:'withDefault returns a lambda wrapping f.apply',re:'withDefault[\\s\\S]*?return\\s+\\w+\\s*->[\\s\\S]*?f\\.apply'},{d:'Catches RuntimeException',re:'catch\\s*\\(\\s*RuntimeException'},{d:'once caches in captured state',re:'once[\\s\\S]*?(String\\[\\]|AtomicReference|new\\s+Object\\[\\])'},{d:'once returns a Supplier lambda',re:'once[\\s\\S]*?return\\s+\\(\\s*\\)\\s*->'}],
behavior:`1. MULTIPLIER.apply(3).apply(4) == 12. 2. withDefault(x -> 10 / x, -1).apply(0) == -1 (catches ArithmeticException); .apply(5) == 2. 3. once(s): s.get() invoked exactly once across many calls, same value returned each time. 4. Note: a lambda cannot assign to a captured local — you need a one-element array or AtomicReference as the mutable cell (that is the lesson).`,
hints:['Curried: the value of the first lambda IS the second lambda: <code>a -> b -> a * b</code>.','withDefault: <code>return t -> { try { return f.apply(t); } catch (RuntimeException e) { return fallback; } };</code>','Captured locals must be effectively final — so capture a container: <code>String[] cache = {null};</code> then inside the lambda <code>if (cache[0] == null) cache[0] = s.get(); return cache[0];</code>'],
solution:`import java.util.function.*;

public class Higher {
    static Function<Integer, Function<Integer, Integer>> MULTIPLIER =
        a -> b -> a * b;

    static <T, R> Function<T, R> withDefault(Function<T, R> f, R fallback) {
        return t -> {
            try {
                return f.apply(t);
            } catch (RuntimeException e) {
                return fallback;
            }
        };
    }

    static Supplier<String> once(Supplier<String> s) {
        String[] cache = {null};
        return () -> {
            if (cache[0] == null) {
                cache[0] = s.get();
            }
            return cache[0];
        };
    }
}`}},
{id:'mod3',title:'Streams API: filter, map, collect',body:`
<p>A stream is a lazy pipeline: <i>source → intermediate ops → terminal op</i>. Nothing runs until the terminal operation. Streams don't mutate the source — they produce new results.</p>
<div class="codeSample" data-hl>List&lt;String&gt; loud = names.stream()
    .filter(n -&gt; n.length() &gt; 3)      // keep some
    .map(String::toUpperCase)         // transform
    .sorted()                         // order
    .toList();                        // terminal (Java 16+)

long count = names.stream().filter(n -&gt; n.startsWith("J")).count();
boolean anyEmpty = names.stream().anyMatch(String::isEmpty);
String joined = names.stream().collect(Collectors.joining(", "));</div>
<p>This replaces most manual loops that build up a result list. Think in transformations, not iterations.</p>`,
docs:[['The Stream API — dev.java','https://dev.java/learn/api/streams/'],['java.util.stream — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/Stream.html']],
ex:{title:'Pipeline practice',
prompt:`Write <code>Pipeline</code> with <code>static List&lt;String&gt; activeEmails(List&lt;User&gt; users)</code> that returns the <b>lowercased emails</b> of users that are <b>active</b>, <b>sorted alphabetically</b> — one stream pipeline, no loops. The <code>User</code> record is provided.`,
starter:`import java.util.*;

record User(String email, boolean active) {}

public class Pipeline {
    static List<String> activeEmails(List<User> users) {
        // users.stream() ...
        return null;
    }
}`,
tests:[{d:'Uses stream()',re:'\\.stream\\s*\\(\\s*\\)'},{d:'Filters on active',re:'filter\\s*\\([^)]*active'},{d:'Maps to lowercased email',re:'map\\s*\\('},{d:'Sorted and collected',re:'sorted\\s*\\(\\s*\\)[\\s\\S]*?(toList\\s*\\(\\s*\\)|collect)'},{d:'No for/while loops',re:'\\b(for|while)\\s*\\(',not:true}],
behavior:`1. Given [User("Z@x.com",true), User("a@x.com",true), User("b@x.com",false)] returns ["a@x.com","z@x.com"]. 2. Inactive users excluded. 3. Emails lowercased. 4. Result sorted. 5. Single stream pipeline, no explicit loops.`,
hints:['Chain: <code>users.stream().filter(...).map(...).sorted().toList()</code>','filter: <code>u -> u.active()</code> (records expose accessors named like the components), or <code>User::active</code>.','map: <code>u -> u.email().toLowerCase()</code>.'],
solution:`import java.util.*;

record User(String email, boolean active) {}

public class Pipeline {
    static List<String> activeEmails(List<User> users) {
        return users.stream()
                .filter(User::active)
                .map(u -> u.email().toLowerCase())
                .sorted()
                .toList();
    }
}`}},
{id:'mod4',title:'Advanced streams: flatMap, groupingBy, reduce',body:`
<p>The heavy machinery:</p>
<div class="codeSample" data-hl>// flatMap: stream of collections → one flat stream
List&lt;String&gt; allTags = posts.stream()
    .flatMap(p -&gt; p.tags().stream())
    .distinct().toList();

// groupingBy: stream → Map&lt;key, bucket&gt;
Map&lt;String, List&lt;Employee&gt;&gt; byDept = staff.stream()
    .collect(Collectors.groupingBy(Employee::dept));

Map&lt;String, Long&gt; countByDept = staff.stream()
    .collect(Collectors.groupingBy(Employee::dept, Collectors.counting()));

// reduce: fold everything into one value
int total = nums.stream().reduce(0, Integer::sum);
// primitive streams avoid boxing:
double avg = staff.stream().mapToDouble(Employee::salary).average().orElse(0);</div>`,
docs:[['Reducing & collecting — dev.java','https://dev.java/learn/api/streams/reducing/'],['Collectors — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/Collectors.html']],
ex:{title:'Order analytics',
prompt:`Given <code>record Order(String customer, List&lt;String&gt; items, double total)</code>, write <code>Analytics</code> with: <code>static Map&lt;String, Double&gt; revenueByCustomer(List&lt;Order&gt; orders)</code> using <code>groupingBy</code> + <code>summingDouble</code>, and <code>static List&lt;String&gt; allItems(List&lt;Order&gt; orders)</code> returning every item across all orders, <b>distinct</b>, via <code>flatMap</code>.`,
starter:`import java.util.*;
import java.util.stream.*;

record Order(String customer, List<String> items, double total) {}

public class Analytics {
    static Map<String, Double> revenueByCustomer(List<Order> orders) {
        return null;
    }

    static List<String> allItems(List<Order> orders) {
        return null;
    }
}`,
tests:[{d:'Uses groupingBy',re:'Collectors\\.groupingBy|groupingBy\\s*\\('},{d:'Uses summingDouble',re:'summingDouble'},{d:'Uses flatMap',re:'flatMap\\s*\\('},{d:'allItems is distinct',re:'distinct\\s*\\(\\s*\\)'}],
behavior:`1. revenueByCustomer([Order("A",[],10), Order("A",[],5), Order("B",[],2)]) returns {A=15.0, B=2.0}. 2. allItems([Order("A",["x","y"],0), Order("B",["y"],0)]) returns [x, y] (distinct, any order acceptable). 3. Both are single stream pipelines.`,
hints:['revenueByCustomer: <code>orders.stream().collect(Collectors.groupingBy(Order::customer, Collectors.summingDouble(Order::total)))</code>','allItems: flatten with <code>flatMap(o -> o.items().stream())</code>','Finish allItems with <code>.distinct().toList()</code>.'],
solution:`import java.util.*;
import java.util.stream.*;

record Order(String customer, List<String> items, double total) {}

public class Analytics {
    static Map<String, Double> revenueByCustomer(List<Order> orders) {
        return orders.stream()
                .collect(Collectors.groupingBy(Order::customer,
                         Collectors.summingDouble(Order::total)));
    }

    static List<String> allItems(List<Order> orders) {
        return orders.stream()
                .flatMap(o -> o.items().stream())
                .distinct()
                .toList();
    }
}`}},
{id:'mod5',title:'Modern iteration: enhanced for, forEach, Iterable',body:`
<p>Ways to walk data, from classic to modern:</p>
<div class="codeSample" data-hl>for (int i = 0; i &lt; list.size(); i++) { ... }   // index needed? use this
for (String s : list) { ... }                    // enhanced for: any Iterable or array
list.forEach(System.out::println);               // internal iteration
for (var e : map.entrySet())                     // maps: iterate entries
    use(e.getKey(), e.getValue());
IntStream.range(0, 5).forEach(i -&gt; ...);         // index as a stream</div>
<p>The enhanced for works on anything implementing <code>Iterable&lt;T&gt;</code> — implement it (return an <code>Iterator</code>) and your own classes work in for-each too. Never mutate a collection while enhanced-for-ing it (<code>ConcurrentModificationException</code>); use <code>removeIf</code> or an explicit <code>Iterator.remove()</code>.</p>`,
docs:[['The for statement — Oracle','https://docs.oracle.com/javase/tutorial/java/nutsandbolts/for.html'],['Iterable — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Iterable.html']],
ex:{title:'Make it Iterable',
prompt:`Write class <code>Countdown implements Iterable&lt;Integer&gt;</code>: constructor takes <code>int from</code>, and iteration yields <code>from, from-1, … 1</code>. Implement <code>iterator()</code> returning an anonymous or inner <code>Iterator&lt;Integer&gt;</code> with proper <code>hasNext()</code>/<code>next()</code>. Then <code>static int sum(Countdown c)</code> must total the values using an <b>enhanced for</b> loop.`,
starter:`import java.util.Iterator;

public class Countdown implements Iterable<Integer> {
    private final int from;

    public Countdown(int from) { this.from = from; }

    @Override
    public Iterator<Integer> iterator() {
        // return an Iterator counting from 'from' down to 1
        return null;
    }

    static int sum(Countdown c) {
        // enhanced for over c
        return 0;
    }
}`,
tests:[{d:'Implements Iterable<Integer>',re:'implements\\s+Iterable<Integer>'},{d:'Provides hasNext and next',re:'hasNext[\\s\\S]*?next\\s*\\('},{d:'sum uses enhanced for over the Countdown',re:'for\\s*\\(\\s*(int|Integer|var)\\s+\\w+\\s*:\\s*\\w+\\s*\\)'}],
behavior:`1. Iterating new Countdown(3) yields 3, 2, 1. 2. sum(new Countdown(4)) == 10. 3. hasNext() returns false after 1 is consumed. 4. Countdown works directly in a for-each loop (that is what Iterable buys you).`,
hints:['Inside iterator(), keep a cursor: <code>int current = from;</code> in an anonymous <code>new Iterator&lt;Integer&gt;() {...}</code>.','hasNext: <code>current >= 1</code>. next: <code>return current--;</code>','sum: <code>for (int n : c) total += n;</code> — the compiler calls your iterator() for you.'],
solution:`import java.util.Iterator;

public class Countdown implements Iterable<Integer> {
    private final int from;

    public Countdown(int from) { this.from = from; }

    @Override
    public Iterator<Integer> iterator() {
        return new Iterator<Integer>() {
            int current = from;
            @Override public boolean hasNext() { return current >= 1; }
            @Override public Integer next() { return current--; }
        };
    }

    static int sum(Countdown c) {
        int total = 0;
        for (int n : c) {
            total += n;
        }
        return total;
    }
}`}},
{id:'mod6',title:'Optional, records & pattern matching',body:`
<p>Three modern pillars:</p>
<div class="codeSample" data-hl>// Optional: an explicit "maybe" — no more null returns
Optional&lt;User&gt; u = repo.findById(id);
String name = u.map(User::name).orElse("anonymous");

// record: immutable data carrier in one line
record Point(int x, int y) {}       // ctor, accessors, equals/hashCode/toString

// pattern matching: test + cast + bind in one step
if (o instanceof String s && s.length() &gt; 3) use(s);

String label = switch (shape) {          // switch expression + patterns
    case Circle c    -&gt; "circle r=" + c.r();
    case Rect r      -&gt; "rect " + r.w() + "x" + r.h();
    default          -&gt; "unknown";
};</div>
<p>Rules: never call <code>Optional.get()</code> without checking; use records for DTOs and value objects; switch expressions with <code>-&gt;</code> don't fall through and must be exhaustive.</p>`,
docs:[['Records — dev.java','https://dev.java/learn/records/'],['Pattern matching — dev.java','https://dev.java/learn/pattern-matching/'],['Optional — dev.java','https://dev.java/learn/api/streams/optionals/']],
ex:{title:'Modern trio',
prompt:`(1) Define <code>record Book(String title, String author, int year)</code>. (2) Write <code>Library</code> with a private <code>List&lt;Book&gt; books</code>, method <code>Optional&lt;Book&gt; findByTitle(String t)</code> using a stream + <code>findFirst()</code>, and (3) <code>String describe(Object o)</code> using a <b>switch expression with pattern matching</b>: a <code>Book b</code> → <code>b.title() + " (" + b.year() + ")"</code>, a <code>String s</code> → <code>"text: " + s</code>, anything else → <code>"unknown"</code>.`,
starter:`import java.util.*;

record Book(String title, String author, int year) {}

public class Library {
    private final List<Book> books = new ArrayList<>();

    public void add(Book b) { books.add(b); }

    public Optional<Book> findByTitle(String t) {
        return Optional.empty(); // stream().filter(...).findFirst()
    }

    public String describe(Object o) {
        return switch (o) {
            // case Book b -> ...
            // case String s -> ...
            default -> "unknown";
        };
    }
}`,
tests:[{d:'Book is a record',re:'record\\s+Book\\s*\\('},{d:'findByTitle returns Optional via findFirst',re:'findFirst\\s*\\(\\s*\\)'},{d:'Switch uses type patterns',re:'case\\s+Book\\s+\\w+\\s*->'},{d:'Handles String case',re:'case\\s+String\\s+\\w+\\s*->'},{d:'Never calls Optional.get()',re:'\\.get\\s*\\(\\s*\\)',not:true}],
behavior:`1. After add(new Book("Dune","Herbert",1965)), findByTitle("Dune") is a present Optional with that book; findByTitle("X") is empty. 2. describe(new Book("Dune","H",1965)) returns "Dune (1965)". 3. describe("hi") returns "text: hi". 4. describe(42) returns "unknown".`,
hints:['findByTitle: <code>books.stream().filter(b -> b.title().equals(t)).findFirst()</code> — findFirst already returns Optional.','Pattern case: <code>case Book b -> b.title() + " (" + b.year() + ")";</code> — b is typed and bound in one step.','Record accessors have no get-prefix: <code>b.title()</code>, <code>b.year()</code>.'],
solution:`import java.util.*;

record Book(String title, String author, int year) {}

public class Library {
    private final List<Book> books = new ArrayList<>();

    public void add(Book b) { books.add(b); }

    public Optional<Book> findByTitle(String t) {
        return books.stream()
                .filter(b -> b.title().equals(t))
                .findFirst();
    }

    public String describe(Object o) {
        return switch (o) {
            case Book b   -> b.title() + " (" + b.year() + ")";
            case String s -> "text: " + s;
            default       -> "unknown";
        };
    }
}`}},
{id:'sea1',title:'Sealed classes & advanced pattern matching',body:`
<p>A <b>sealed</b> type declares its complete set of subtypes: <code>sealed interface Shape permits Circle, Rect</code>. Nothing else may implement it, and every permitted subtype must be <code>final</code>, <code>sealed</code> (continuing the restriction), or <code>non-sealed</code> (opting out). You've met records and basic pattern matching in the modern-Java lesson — sealed types are the missing piece that makes them a system: <b>algebraic data types</b> in Java.</p>
<p>The payoff is <b>exhaustive switch</b>: when the compiler knows all subtypes, a pattern-matching switch needs no <code>default</code> — and when you later add a subtype, every switch that doesn't handle it becomes a <i>compile error</i>. Your codebase tells you every place that needs updating.</p>
<div class="codeSample">sealed interface Shape permits Circle, Rect {}
record Circle(double r) implements Shape {}
record Rect(double w, double h) implements Shape {}

static double area(Shape s) {
    return switch (s) {
        case Circle(double r)          -&gt; Math.PI * r * r;   // record pattern:
        case Rect(double w, double h)  -&gt; w * h;             // deconstructs fields
    };  // no default — compiler proves exhaustiveness
}

static String describe(Shape s) {
    return switch (s) {
        case Circle c when c.r() &gt; 100 -&gt; "huge circle";     // guarded pattern
        case Circle c                  -&gt; "circle";
        case Rect r                    -&gt; "rect";
    };
}</div>
<p><b>Record patterns</b> (Java 21) deconstruct in the case label — including nested: <code>case Line(Point(var x1, var y1), Point p2)</code>. <b>Guards</b> add a boolean with <code>when</code>. Order matters: cases are tested top-down, so guarded cases go before their unguarded catch-all.</p>`,
docs:[['Sealed classes — JEP 409','https://openjdk.org/jeps/409'],['Record patterns — JEP 440','https://openjdk.org/jeps/440'],['Pattern matching for switch — JEP 441','https://openjdk.org/jeps/441']],
ex:{title:'An exhaustive payment switch',
prompt:`Model payments as a <code>sealed interface Payment permits Card, Cash, Transfer</code> with three <b>records</b>: <code>Card(String last4, double amount)</code>, <code>Cash(double amount)</code>, <code>Transfer(String iban, double amount)</code>. Write <code>static String receipt(Payment p)</code> as a pattern-matching <code>switch</code> using <b>record patterns</b>, with a <b>guarded</b> case first: any Card <code>when</code> amount &gt; 1000 returns <code>"card (verified)"</code>; otherwise Card → <code>"card ****"+last4</code>, Cash → <code>"cash"</code>, Transfer → <code>"transfer to "+iban</code>. No <code>default</code> branch — the sealed hierarchy makes it exhaustive.`,
starter:`sealed interface Payment permits Card, Cash, Transfer {}
// 1. the three records implementing Payment

public class Payments {
    static String receipt(Payment p) {
        // 2. switch with record patterns; guarded Card case first; no default
        return null;
    }
}`,
tests:[{d:'Sealed interface with permits list',re:'sealed\\s+interface\\s+Payment\\s+permits\\s+Card\\s*,\\s*Cash\\s*,\\s*Transfer'},{d:'Records implement the interface',re:'record\\s+Card\\s*\\([^)]*\\)\\s+implements\\s+Payment'},{d:'Pattern-matching switch on p',re:'switch\\s*\\(\\s*p\\s*\\)'},{d:'Record pattern deconstruction',re:'case\\s+Card\\s*\\('},{d:'Guarded case with when',re:'when\\s+.*>\\s*1000'},{d:'No default branch (exhaustive)',re:'default\\s*(:|->)',not:true}],
behavior:`1. receipt(new Card("1234", 50)) returns "card ****1234". 2. receipt(new Card("1234", 5000)) returns "card (verified)" — the guard wins because it is listed first. 3. receipt(new Cash(10)) returns "cash"; receipt(new Transfer("DE89...", 10)) starts with "transfer to ". 4. The switch compiles with no default — and adding a fourth Payment subtype would break compilation of receipt (that is the feature).`,
hints:['Records: <code>record Card(String last4, double amount) implements Payment {}</code> — one line each; the sealed interface only permits these three.','Guard first: <code>case Card(String last4, double amount) when amount &gt; 1000 -&gt; "card (verified)";</code> then the plain <code>case Card(String last4, double amount) -&gt; "card ****" + last4;</code>','Finish with Cash and Transfer record patterns and return the switch directly: <code>return switch (p) { ... };</code> — no default allowed.'],
solution:`sealed interface Payment permits Card, Cash, Transfer {}
record Card(String last4, double amount) implements Payment {}
record Cash(double amount) implements Payment {}
record Transfer(String iban, double amount) implements Payment {}

public class Payments {
    static String receipt(Payment p) {
        return switch (p) {
            case Card(String last4, double amount) when amount > 1000 -> "card (verified)";
            case Card(String last4, double amount) -> "card ****" + last4;
            case Cash(double amount) -> "cash";
            case Transfer(String iban, double amount) -> "transfer to " + iban;
        };
    }
}`}},
]});
