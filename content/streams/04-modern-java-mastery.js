STREAMS.push({icon:'⚡',title:'Modern Java Mastery',blurb:'Lambdas from beginner to master, method references, the Streams API, Optional, records, pattern matching, modern iteration & deep generics.',lessons:[
{id:'mod1',title:'Lambdas & functional interfaces',body:`
<p>🌱 <b>Starting from zero:</b> until now, when you wanted something done you wrote a method and called it. A <b>lambda</b> flips that: it is a tiny unnamed recipe you can hand to OTHER code to run, like passing a sticky note that says "given x, give back x squared" instead of formally registering a named recipe. Why that matters: huge amounts of Java say "process this list, and here\u0027s the note describing what to do to each item." The arrow syntax <code>x -&gt; x * x</code> reads "given x, produce x squared." That\u0027s the whole concept; the rest of this lesson is the small print.</p>
<p>A lambda is a compact implementation of a <b>functional interface</b>: an interface with exactly one abstract method. The JDK ships the common shapes in <code>java.util.function</code>:</p>
<div class="codeSample" data-hl>Predicate&lt;String&gt;  isEmpty = s -&gt; s.isEmpty();       // T → boolean
Function&lt;String,Integer&gt; len = s -&gt; s.length();      // T → R
Consumer&lt;String&gt;   print  = s -&gt; System.out.println(s); // T → void
Supplier&lt;Double&gt;   rand   = () -&gt; Math.random();     // () → T
BinaryOperator&lt;Integer&gt; add = (a, b) -&gt; a + b;       // (T,T) → T

names.removeIf(s -&gt; s.isBlank());
list.sort((a, b) -&gt; a.compareToIgnoreCase(b));</div>
<p>Multi-statement bodies use braces and an explicit <code>return</code>. Lambdas can read effectively-final local variables from the enclosing scope. Mark your own single-method interfaces <code>@FunctionalInterface</code>.</p>

<h4>What the compiler actually does with a lambda</h4>
<p>A lambda is not an anonymous class with nicer syntax. Anonymous classes generate a separate class file
and allocate an object every time; lambdas are compiled to an <code>invokedynamic</code> instruction and
linked at first use, and a lambda that captures nothing can be reused rather than reallocated. The
practical consequences: lambdas are cheaper in hot paths, they do not have their own <code>this</code>
(inside a lambda <code>this</code> is the enclosing instance, which is usually what you wanted), and they
appear in stack traces under synthetic names that take a moment to read.</p>

<h4>The shapes worth memorising</h4>
<p>Four interfaces cover most code, and knowing them by shape stops you inventing your own:</p>
<div class="codeSample">Function&lt;T,R&gt;   R apply(T t)      // transform one thing into another
Predicate&lt;T&gt;    boolean test(T t)  // answer a yes/no question about it
Consumer&lt;T&gt;     void accept(T t)   // do something with it, return nothing
Supplier&lt;T&gt;     T get()            // produce one, given nothing</div>
<p>The primitive variants (<code>IntPredicate</code>, <code>ToLongFunction</code> and friends) exist to
avoid boxing, which is why a stream over millions of <code>int</code>s should use <code>IntStream</code>
rather than <code>Stream&lt;Integer&gt;</code>.</p>

<h4>The rule that catches everyone</h4>
<p>A lambda may only read local variables that are <b>effectively final</b>: assigned once and never
reassigned. That is not arbitrary: the value is <i>captured by copy</i>, so allowing reassignment would
give you two views of one variable that silently disagree. Fields are captured differently, through
<code>this</code>, so a lambda can see later changes to a field, which is a genuine source of surprise
when a lambda outlives the call that created it. And a checked exception cannot escape a lambda whose
interface does not declare one, which is why pipelines calling IO-throwing code fill up with wrapper
noise.</p>`,
docs:[['Lambda Expressions — dev.java','https://dev.java/learn/lambdas/'],['java.util.function — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/function/package-summary.html']],
ex:{title:'Think in functions',
prompt:`Write class <code>Funcs</code> with three <code>static</code> fields: <code>Predicate&lt;String&gt; NON_BLANK</code> (true when the string is not blank), <code>Function&lt;Integer,Integer&gt; SQUARE</code> (returns its input times itself: 5 → 25), and <code>BinaryOperator&lt;Integer&gt; MAX</code> (returns the larger of two ints; use a lambda, you may call Math.max inside). Import from <code>java.util.function</code>.`,
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
<p>When a lambda only calls one existing method, use a method reference: same behavior, clearer intent. Four kinds:</p>
<div class="codeSample" data-hl>Function&lt;String,Integer&gt; parse = Integer::parseInt;   // static
Function&lt;String,Integer&gt; len   = String::length;      // instance method of the parameter
Predicate&lt;String&gt; isJava = "java"::equals;            // instance method of a captured object
Supplier&lt;ArrayList&lt;String&gt;&gt; make = ArrayList::new;    // constructor

names.forEach(System.out::println);
names.sort(String::compareToIgnoreCase);</div>
<p>Rule of thumb: if your lambda reads <code>x -> something.method(x)</code> or <code>x -> x.method()</code>, a reference exists for it.</p>

<h4>The confusing pair</h4>
<p>Two of the four forms look almost identical and behave differently, and this is where most confusion
lives:</p>
<div class="codeSample" data-hl>String::length          // UNBOUND: the receiver is the parameter
                        // equivalent to  s -&gt; s.length()

"java"::equals          // BOUND: the receiver is captured NOW
                        // equivalent to  s -&gt; "java".equals(s)

// same shape, opposite argument roles. and the capture is immediate:
String prefix = "a";
Predicate&lt;String&gt; p = prefix::equals;   // captures the CURRENT value
prefix = "b";                            // p still tests against "a"</div>
<p>That last point matters in loops: a bound reference captures the object at the moment it is created,
so creating references inside a loop captures each iteration's value, not the final one.</p>

<h4>Where they genuinely help, and where they hurt</h4>
<p>Method references win when the lambda is <i>pure delegation</i>: <code>map(String::trim)</code>,
<code>sorted(Comparator.comparing(Employee::name))</code>, <code>collect(toMap(User::id,
Function.identity()))</code>. The name of the method becomes the documentation.</p>
<p>They lose when the reader has to reconstruct the argument order. <code>Integer::compare</code> is
fine; <code>this::handle</code> in a long pipeline often is not, because the reader must go and find
what <code>handle</code> takes. <b>A lambda with named parameters is sometimes the clearer choice</b>,
and "shorter" is not the same as "clearer".</p>
<p><b>Two practical notes.</b> <code>ArrayList::new</code> as a <code>Supplier</code> takes no
arguments, but as a <code>Function&lt;Integer,List&gt;</code> it resolves to the capacity constructor:
the compiler picks the overload from the target type, which is elegant and occasionally surprising.
And a bound reference on a null receiver throws immediately at creation, not later at use, which is
usually the more helpful moment to fail.</p>`,
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
hints:['Static method: <code>Integer::parseInt</code>.','Instance-method-of-parameter: <code>String::toUpperCase</code>: the parameter becomes the receiver.','Constructor: <code>ArrayList::new</code>; bound instance: <code>System.out::println</code>.'],
solution:`import java.util.function.*;
import java.util.ArrayList;

public class Refs {
    static Function<String, Integer> PARSE = Integer::parseInt;
    static Function<String, String> UPPER = String::toUpperCase;
    static Supplier<ArrayList<String>> NEW_LIST = ArrayList::new;
    static Consumer<Object> PRINT = System.out::println;
}`}},
{id:'modL2',title:'Lambdas II: composition & custom functional interfaces',body:`
<p>Lambdas start paying off when you <b>combine</b> them. The JDK functional interfaces ship default methods for exactly that:</p>
<div class="codeSample" data-hl>Function&lt;Integer,Integer&gt; plus3  = n -&gt; n + 3;
Function&lt;Integer,Integer&gt; times2 = n -&gt; n * 2;

plus3.andThen(times2).apply(1);   // (1+3)*2 = 8   — plus3 first
plus3.compose(times2).apply(1);   // (1*2)+3 = 5   — times2 first!

Predicate&lt;String&gt; nonNull  = s -&gt; s != null;
Predicate&lt;String&gt; nonEmpty = s -&gt; !s.isEmpty();
Predicate&lt;String&gt; valid    = nonNull.and(nonEmpty);
Predicate&lt;String&gt; invalid  = valid.negate();</div>
<p>You can also define your own functional interface: any interface with exactly one abstract method, ideally marked <code>@FunctionalInterface</code> so the compiler enforces it. Default methods let you give it combinators too. One rule to remember: lambdas capture local variables only if they are <b>effectively final</b>: assigned once, never changed.</p>
<h4>Why composition rather than one big lambda</h4>
<p>You could always write <code>n -&gt; (n + 3) * 2</code>. What composition buys is that each piece is
<b>named, tested and reusable</b>, and, more importantly, that pieces can be <i>chosen at runtime</i>. A
validation rule built by <code>and</code>-ing predicates selected from configuration is not something a
hand-written expression can do.</p>
<div class="codeSample" data-hl>// rules assembled from data, not hardcoded
Predicate&lt;Order&gt; rule = enabledRules.stream()
    .map(RULES::get)
    .reduce(o -&gt; true, Predicate::and);     // identity = "always passes"

// note the identity element: for and() it is TRUE, for or() it is FALSE.
// getting that backwards makes an empty rule set reject everything.</div>

<h4><code>andThen</code> versus <code>compose</code>, and how to never confuse them again</h4>
<p>Read <code>andThen</code> left to right ("do me, <i>and then</i> the other") and
<code>compose</code> right to left, matching the mathematical notation f∘g where g runs first.
<code>andThen</code> is the one you want almost always; <code>compose</code> exists because the maths
convention does.</p>
<p>One asymmetry worth knowing: <code>Consumer.andThen</code> runs both consumers on the <i>same</i> input
rather than chaining outputs, because a consumer has nothing to pass on.</p>

<h4>Effectively final, explained</h4>
<p>A lambda captures the <b>value</b> of a local variable, not the variable itself: the local lives on the
stack of a method that may have returned by the time the lambda runs, so there is nothing to reference.
Java therefore requires captured locals to be effectively final, making the copy unambiguous.</p>
<p>Fields are different: a lambda in an instance method captures <code>this</code>, so it sees field
changes. That asymmetry is the source of the common workaround (wrapping a counter in an array to mutate
it from a lambda), which does compile and is a warning sign in concurrent code, since nothing about it is
thread-safe.</p>

<h4>Writing your own functional interface</h4>
<p>Reach for one when the JDK's names would misrepresent the intent. <code>Function&lt;Order, Boolean&gt;</code>
technically works; <code>OrderRule</code> with a method called <code>permits</code> says what it means, can
carry default combinators of its own, and can declare a checked exception, which none of the standard
interfaces allow, and which is why lambdas that do I/O are so awkward.</p>
<p>Mark it <code>@FunctionalInterface</code>. It changes nothing at runtime and makes the compiler reject a
second abstract method, so nobody breaks every caller by accident.</p>

<h4>Where composition stops being clearer</h4>
<p>Three or four combinators read beautifully. Twelve, with nested <code>compose</code> calls, read worse
than the imperative version and debug far worse: a stack trace through composed lambdas names none of the
steps. Compose when the pieces are meaningful on their own; write a method when they are not.</p>`,
docs:[['Combining lambdas — dev.java','https://dev.java/learn/lambdas/combining-chaining-composing/'],['Function.andThen / compose — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/function/Function.html']],
ex:{title:'Compose and invent',
prompt:`(1) In class <code>Combo</code>, define <code>Function&lt;Integer,Integer&gt; PLUS3</code> (adds 3) and <code>TIMES2</code> (doubles) as lambdas, and <code>PIPELINE</code> as PLUS3 <b>andThen</b> TIMES2: PLUS3 runs first, then TIMES2, so <code>PIPELINE.apply(1) == 8</code>. (2) Define your own <code>@FunctionalInterface Validator&lt;T&gt;</code> with abstract <code>boolean check(T t)</code> and a <b>default method</b> <code>Validator&lt;T&gt; and(Validator&lt;T&gt; other)</code> returning a validator that passes only when <b>both</b> this and other pass. (3) In Combo, define <code>Validator&lt;String&gt; STRONG</code> that requires (length ≥ 8) <b>and</b> (contains a digit, use a lambda with <code>chars().anyMatch(Character::isDigit)</code>).`,
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
hints:['Default method body: <code>return t -> check(t) && other.check(t);</code>, a lambda implementing your own interface.','PIPELINE is not a new lambda; compose the two you have: <code>PLUS3.andThen(TIMES2)</code>.','STRONG: <code>((Validator&lt;String&gt;) s -> s.length() >= 8).and(s -> s.chars().anyMatch(Character::isDigit))</code>; the cast tells the compiler which interface the first lambda targets.'],
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
<p>These patterns power real APIs: <code>Comparator.comparing(...).thenComparing(...)</code>, retry/timing wrappers, and every middleware chain you've ever used. If you can read <code>a -> b -> a + b</code> without blinking, you've arrived.</p>

<h4>Why a function returning a function is useful</h4>
<p>The point of a higher-order function is <b>configuration captured once, behaviour reused many times</b>. <code>Comparator.comparing(Person::age)</code> is a function that builds a comparator; a retry wrapper is a function that takes an operation and returns a more resilient operation with the same signature. Because the result has the same type as the input, wrappers compose: retry around timing around logging, each written once and unaware of the others. That is the whole idea behind middleware, filters and interceptors, and it is why reading <code>Function&lt;A, Function&lt;B, C&gt;&gt;</code> without flinching is worth the practice.</p>

<h4>Currying, and what it is actually for in Java</h4>
<p>Currying turns a two-argument function into a one-argument function returning another. In languages built around it, this is how partial application works; in Java it is occasionally elegant and frequently over-applied. The real use is <b>pre-binding a dependency</b>: a function that takes a configured client and returns a function taking the request, so the caller only supplies what varies. Beyond that, a plain method with two parameters is clearer, and clarity is the point of the whole stream.</p>

<h4>Memoization, and its two traps</h4>
<p>Wrapping a pure function in a cache is the same technique the DP stream calls memoization, and the same caveats apply with a Java accent. First, <b>the function must be pure</b>: cache a function that reads a database or a clock and you have cached a moment, not a value. Second, <b>an unbounded cache is a memory leak with good intentions</b>: <code>computeIfAbsent</code> on a static map keyed by user input grows forever. Use a bounded cache with an eviction policy (Caffeine, Guava) for anything whose key space you do not control.</p>
<p>One Java-specific hazard worth knowing: recursively calling <code>computeIfAbsent</code> on a <code>HashMap</code> from inside its own mapping function can corrupt the map or throw <code>ConcurrentModificationException</code>, because you are structurally modifying it mid-computation. Compute the value first, then put it.</p>`,
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
behavior:`1. MULTIPLIER.apply(3).apply(4) == 12. 2. withDefault(x -> 10 / x, -1).apply(0) == -1 (catches ArithmeticException); .apply(5) == 2. 3. once(s): s.get() invoked exactly once across many calls, same value returned each time. 4. Note: a lambda cannot assign to a captured local; you need a one-element array or AtomicReference as the mutable cell (that is the lesson).`,
hints:['Curried: the value of the first lambda IS the second lambda: <code>a -> b -> a * b</code>.','withDefault: <code>return t -> { try { return f.apply(t); } catch (RuntimeException e) { return fallback; } };</code>','Captured locals must be effectively final, so capture a container: <code>String[] cache = {null};</code> then inside the lambda <code>if (cache[0] == null) cache[0] = s.get(); return cache[0];</code>'],
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
{id:'iface2',title:'Interfaces 2.0: default, static & private methods',body:`
<p>Interfaces started as pure contracts: abstract methods, nothing else. Java 8 changed that for one very concrete reason: the JDK team wanted to add <code>forEach</code> to <code>Iterable</code>, but adding an abstract method to an interface <b>breaks every class that implements it</b>, and thousands of classes across the world implement Iterable. The solution: methods <i>with bodies</i> in interfaces.</p>
<ul>
<li><b><code>default</code> methods</b>: an instance method with an implementation. Implementors inherit it for free and may override it. This is how <code>Iterable.forEach</code>, <code>Comparator.reversed()</code>, and <code>Collection.stream()</code> were added to 20-year-old interfaces without breaking anyone; <b>interface evolution</b> is the reason the feature exists.</li>
<li><b><code>static</code> methods</b>: belong to the interface itself, great for factories: <code>Comparator.comparing(...)</code>, <code>List.of(...)</code>. Not inherited by implementors; called as <code>InterfaceName.method()</code>.</li>
<li><b><code>private</code> methods</b> (Java 9): helpers that default methods share without exposing them. An interface can now have real internal structure.</li>
</ul>
<div class="codeSample" data-hl>interface Notifier {
    void send(String msg);                        // classic abstract contract

    default void sendUrgent(String msg) {         // inherited implementation
        send(banner(msg));
    }
    private String banner(String msg) {           // shared helper, invisible outside
        return "*** " + msg + " ***";
    }
    static Notifier console() {                   // factory on the interface itself
        return msg -&gt; System.out.println(msg);
    }
}</div>
<p><b>The collision rule</b>, since a class can implement many interfaces: if two interfaces provide the same default method, the class <b>must</b> override it (the compiler forces the tie-break), and inside that override it can delegate to a chosen parent with the special syntax <code>InterfaceName.super.method()</code>. And if a superclass provides the method, the <b>class always wins</b> over any interface default. Memorize as: class beats interface, and ties among interfaces are yours to break.</p>
<p>Design guidance: default methods are for <i>behavior derivable from the contract</i> (sendUrgent is just send + decoration), not for sneaking state or primary behavior into what should be a class. Interfaces still hold no instance fields; that boundary is what keeps them contracts.</p>`,
docs:[['Default methods — Oracle','https://docs.oracle.com/javase/tutorial/java/IandI/defaultmethods.html'],['Private interface methods — JEP 213','https://openjdk.org/jeps/213'],['Evolving interfaces — dev.java','https://dev.java/learn/interfaces/']],
ex:{title:'Evolve an interface',
prompt:`Write interface <code>Logger</code>: (1) abstract <code>void log(String msg)</code>; (2) a <b>default</b> method <code>void logAll(java.util.List&lt;String&gt; msgs)</code> that loops the list calling <code>log</code> on each (enhanced for); (3) a <b>private</b> method <code>String stamp(String msg)</code> returning <code>"[LOG] " + msg</code>; (4) a <b>default</b> method <code>void logStamped(String msg)</code> calling <code>log(stamp(msg))</code>; (5) a <b>static</b> factory <code>Logger console()</code> returning the lambda <code>msg -&gt; System.out.println(msg)</code>.`,
starter:`import java.util.List;

interface Logger {

    // your code
}`,
solution:`import java.util.List;

interface Logger {

    void log(String msg);

    default void logAll(List<String> msgs) {
        for (String m : msgs) {
            log(m);
        }
    }

    private String stamp(String msg) {
        return "[LOG] " + msg;
    }

    default void logStamped(String msg) {
        log(stamp(msg));
    }

    static Logger console() {
        return msg -> System.out.println(msg);
    }
}`,
tests:[{d:'Abstract contract method log(String)',re:'void\\s+log\\s*\\(\\s*String\\s+\\w+\\s*\\)\\s*;'},{d:'default logAll loops with enhanced for',re:'default\\s+void\\s+logAll[\\s\\S]*?for\\s*\\(\\s*String\\s+\\w+\\s*:\\s*msgs\\s*\\)'},{d:'private helper stamp builds the prefix',re:'private\\s+String\\s+stamp[\\s\\S]*?"\\[LOG\\] "\\s*\\+\\s*msg'},{d:'default logStamped delegates through the helper',re:'default\\s+void\\s+logStamped[\\s\\S]*?log\\s*\\(\\s*stamp\\s*\\(\\s*msg\\s*\\)\\s*\\)'},{d:'static factory returns a lambda',re:'static\\s+Logger\\s+console[\\s\\S]*?return\\s+\\w+\\s*->\\s*System\\.out\\.println'},{d:'No instance fields — interfaces stay stateless',re:'(private|protected)\\s+(?!String\\s+stamp)\\w+\\s+\\w+\\s*;',not:true}],
behavior:`1. Any class (or lambda) implementing just log() gets logAll and logStamped for free; that is interface evolution in miniature. 2. Logger.console().logStamped("hi") prints [LOG] hi; the private stamp ran inside the default method. 3. stamp is not callable from outside the interface (private). 4. console() is called on the interface name, not on an instance. 5. Logger qualifies as a functional interface (one abstract method), which is why the lambda in console() works.`,
hints:['Only the abstract method ends in a semicolon; default/private/static ones have bodies.','Because log is the single abstract method, a lambda IS a Logger; the factory returns msg -> ... directly.','If two interfaces both gave a class logStamped, the class must override and may pick: Logger.super.logStamped(msg).']}},
{id:'mod3',title:'Streams API: filter, map, collect',body:`
<p>🌱 <b>Starting from zero:</b> a <b>stream</b> turns data processing into an assembly line: items flow along a belt, each station does one small thing (keep only the red ones, convert each to a label, collect the results in a box at the end). Instead of writing loops that describe HOW to walk the data, you declare the stations and let the belt run. Once the sticky-note lambdas from the last lessons clicked, streams are just lambdas mounted on a conveyor.</p>
<p>A stream is a lazy pipeline: <i>source → intermediate ops → terminal op</i>. Nothing runs until the terminal operation. Streams don't mutate the source; they produce new results.</p>
<div class="codeSample" data-hl>List&lt;String&gt; loud = names.stream()
    .filter(n -&gt; n.length() &gt; 3)      // keep some
    .map(String::toUpperCase)         // transform
    .sorted()                         // order
    .toList();                        // terminal (Java 16+)

long count = names.stream().filter(n -&gt; n.startsWith("J")).count();
boolean anyEmpty = names.stream().anyMatch(String::isEmpty);
String joined = names.stream().collect(Collectors.joining(", "));</div>
<p>This replaces most manual loops that build up a result list. Think in transformations, not iterations.</p>

<h4>Lazy, and why it matters</h4>
<p>Intermediate operations build a plan; nothing runs until the terminal operation asks for a result. That is not a performance footnote; it changes what the pipeline costs. Elements flow through the whole chain one at a time, so <code>filter().map().findFirst()</code> stops as soon as it has an answer rather than mapping the entire list first. It is also why a stream with no terminal operation does precisely nothing, which surprises everyone once.</p>
<p>Ordering follows from that: put the cheap, selective <code>filter</code> before the expensive <code>map</code>, and you do the expensive work only for what survives.</p>

<h4>The collectors worth memorising</h4>
<ul>
<li><code>toList()</code>: Java 16+, returns an unmodifiable list, and is what you want by default.</li>
<li><code>groupingBy(Order::status)</code>: the SQL GROUP BY of the language, and by far the highest-value collector to know. Add a downstream collector for the aggregate: <code>groupingBy(Order::status, counting())</code>, or <code>summingLong</code>, or <code>mapping</code>.</li>
<li><code>toMap(Order::id, o -&gt; o)</code>, with the caveat that duplicate keys throw <code>IllegalStateException</code>; supply a merge function when duplicates are possible.</li>
<li><code>joining(", ")</code>: string assembly without a loop or a trailing-comma bug.</li>
</ul>

<h4>Where streams are the wrong tool</h4>
<p>Three cases, and knowing them is what separates using streams from over-using them. A plain <code>for</code> loop is clearer when you need the index, when you must break out early with complex conditions, or when the body mutates several things. Checked exceptions do not fit lambdas, so a pipeline calling code that throws <code>IOException</code> turns into wrapper noise; a loop stays readable. And <code>parallelStream()</code> is not a free speed-up: it costs a fork/join split and merge, it is wrong for anything order-dependent or contended, and it is a genuine improvement only for large, CPU-bound, side-effect-free work you have measured.</p>
<p>The unbreakable rule: <b>no side effects in a pipeline</b>. A <code>forEach</code> that adds to an external list is a loop wearing a costume, and it is broken under <code>parallelStream</code>, quietly, with results that differ between runs.</p>`,
docs:[['The Stream API — dev.java','https://dev.java/learn/api/streams/'],['java.util.stream — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/Stream.html']],
ex:{title:'Pipeline practice',
prompt:`Write <code>Pipeline</code> with <code>static List&lt;String&gt; activeEmails(List&lt;User&gt; users)</code> that returns the <b>lowercased emails</b> of users that are <b>active</b>, <b>sorted alphabetically</b>: one stream pipeline, no loops. The <code>User</code> record is provided.`,
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
<p>Three operations do most of the real work in stream pipelines, and each answers a different shape of
question: <b>flatMap</b> flattens nesting, <b>groupingBy</b> builds an index, and <b>reduce</b> folds
many values into one.</p>
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
double avg = staff.stream().mapToDouble(Employee::salary).average().orElse(0);</div>

<h4>flatMap: one level of nesting, removed</h4>
<p>The distinction that trips people up is <code>map</code> versus <code>flatMap</code>. If your mapper
returns a single value, use <code>map</code>. If it returns a <i>collection or stream</i>, use
<code>flatMap</code>; otherwise you end up with a <code>Stream&lt;List&lt;String&gt;&gt;</code>, a
stream of lists rather than a stream of items, and every downstream operation is working on the wrong
type. <b>It flattens exactly one level</b>, so a list of lists of lists needs two calls.</p>

<h4>groupingBy: building an index</h4>
<p>Its real power is the <b>downstream collector</b>, the second argument. Grouping into lists is only
the default; you rarely want the whole bucket:</p>
<div class="codeSample" data-hl>groupingBy(Employee::dept)                          -&gt; Map&lt;String, List&lt;Employee&gt;&gt;
groupingBy(Employee::dept, counting())              -&gt; Map&lt;String, Long&gt;
groupingBy(Employee::dept, summingDouble(Employee::salary))
groupingBy(Employee::dept, mapping(Employee::name, toList()))   // names only
groupingBy(Employee::dept, TreeMap::new, toList())  // sorted keys

partitioningBy(e -&gt; e.salary() &gt; 100_000)           // exactly TWO buckets,
                                                     // and BOTH keys always
                                                     // exist, even if empty</div>
<p><code>partitioningBy</code> is worth knowing precisely because of that last property: with
<code>groupingBy</code> a bucket that matched nothing is simply absent from the map, so
<code>get()</code> returns null. With <code>partitioningBy</code> both <code>true</code> and
<code>false</code> keys are always present.</p>

<h4>reduce: and when not to use it</h4>
<p><code>reduce</code> folds a stream into one value, and it comes in three forms: with an identity,
without one (returning <code>Optional</code>, because an empty stream has no answer), and a three-arg
version for parallel streams. The rule that keeps it correct: <b>the operation must be associative</b>,
and the identity must genuinely be neutral. Subtraction is not associative, so reducing with it gives
different answers depending on how the work is split.</p>
<p>In practice reach for a purpose-built collector first (<code>counting()</code>,
<code>summingInt()</code>, <code>joining(", ")</code>, <code>averagingDouble()</code>), which are
clearer and often faster. Save <code>reduce</code> for folds those do not cover.</p>

<h4>Primitive streams, and why boxing matters</h4>
<p><code>mapToInt</code>, <code>mapToDouble</code> and <code>mapToLong</code> exist because a
<code>Stream&lt;Integer&gt;</code> allocates an object per element. On a large stream that is real cost
and real garbage. They also give you methods the object stream does not have (<code>sum()</code>, <code>average()</code>, <code>summaryStatistics()</code>), the last of which gives
count, sum, min, max and average in a single pass.</p>
<p><b>One trap:</b> <code>average()</code> returns an <code>OptionalDouble</code>, not a
<code>double</code>, because an empty stream has no average. <code>orElse(0)</code> is the usual
answer, but be deliberate: for an empty payroll, zero and "no data" mean quite different things.</p>`,
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
{id:'immut1',title:'Immutable collections & defensive copies',body:`
<p>Most collection bugs are someone mutating a list that someone else believed was stable. Modern Java's answer: <b>make the default immutable</b>, and mutate only where mutation is the point.</p>
<ul>
<li><b><code>List.of</code>, <code>Set.of</code>, <code>Map.of</code></b> (Java 9): compact, <i>truly immutable</i> collections: <code>List.of("a", "b")</code>. Any <code>add/remove/set</code> throws <code>UnsupportedOperationException</code>. Two sharp edges by design: they reject <code>null</code> elements outright, and <code>Set.of</code>/<code>Map.of</code> throw on duplicate elements/keys, at creation, loudly, instead of silently swallowing.</li>
<li><b><code>List.copyOf(collection)</code></b> (Java 10): an immutable <i>snapshot</i> of an existing collection. If the source was already an immutable copy, it's returned as-is (cheap).</li>
<li><b><code>Collections.unmodifiableList(list)</code></b>: the old tool, and a trap worth understanding: it is a read-only <b>view</b>, not a copy. Whoever still holds the original can keep mutating, and the "unmodifiable" view changes underneath its holders. Prefer <code>copyOf</code> unless a live view is exactly what you want.</li>
<li><b><code>Stream.toList()</code></b>: the list you get from a stream pipeline is unmodifiable too. Modern APIs return frozen results by default.</li>
</ul>
<p><b>Defensive copies</b> are the same idea applied at class boundaries. A constructor that stores a caller's list, stores a <i>shared mutable secret</i>: the caller can mutate your internals from outside, encapsulation or not. Copy on the way in, freeze on the way out:</p>
<div class="codeSample" data-hl>public class Route {
    private final List&lt;String&gt; stops;

    Route(List&lt;String&gt; stops) {
        this.stops = List.copyOf(stops);      // IN: snapshot — caller's later edits don't reach us
    }
    List&lt;String&gt; stops() {
        return stops;                          // OUT: already immutable — safe to hand out as-is
    }
}</div>
<p>Why immutability earns its keep: immutable objects are free to share between threads (no locks; the Concurrency stream cashes this in), safe as Map keys, trivially cacheable, and above all <i>legible</i>: a value that cannot change is a value you never re-check. The working default in modern Java: collections are immutable unless a mutation is the point, and every mutable input crossing a class boundary gets copied.</p>`,
docs:[['List.of & friends — Javadoc','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/List.html#unmodifiable'],['JEP 269: convenience factories','https://openjdk.org/jeps/269'],['Immutability — dev.java','https://dev.java/learn/records/']],
ex:{title:'Freeze the boundaries',
prompt:`Write class <code>Roster</code>: (1) a <code>private final List&lt;String&gt; players</code>; (2) constructor <code>Roster(List&lt;String&gt; players)</code> storing a <b>defensive immutable copy</b> via <code>List.copyOf</code>; (3) <code>List&lt;String&gt; players()</code> returning the field directly (already safe); (4) a <b>static</b> method <code>Roster demo()</code> returning <code>new Roster(List.of("Ada", "Linus", "Grace"))</code>; (5) <code>Roster with(String extra)</code>, the immutable update pattern: build a <code>new java.util.ArrayList&lt;&gt;(players)</code>, add <code>extra</code>, return a <b>new Roster</b> from it (the original is never touched).`,
starter:`import java.util.ArrayList;
import java.util.List;

public class Roster {

    // your code
}`,
solution:`import java.util.ArrayList;
import java.util.List;

public class Roster {

    private final List<String> players;

    Roster(List<String> players) {
        this.players = List.copyOf(players);
    }

    List<String> players() {
        return players;
    }

    static Roster demo() {
        return new Roster(List.of("Ada", "Linus", "Grace"));
    }

    Roster with(String extra) {
        List<String> next = new ArrayList<>(players);
        next.add(extra);
        return new Roster(next);
    }
}`,
tests:[{d:'Field is private final',re:'private\\s+final\\s+List<String>\\s+players'},{d:'Constructor takes a defensive copy with List.copyOf',re:'this\\.players\\s*=\\s*List\\.copyOf\\s*\\(\\s*players\\s*\\)'},{d:'demo() builds from the List.of factory',re:'new\\s+Roster\\s*\\(\\s*List\\.of\\s*\\(\\s*"Ada"\\s*,\\s*"Linus"\\s*,\\s*"Grace"\\s*\\)\\s*\\)'},{d:'with() copies into a fresh ArrayList before adding',re:'new\\s+ArrayList<>\\s*\\(\\s*players\\s*\\)[\\s\\S]*?\\.add\\s*\\(\\s*extra\\s*\\)'},{d:'with() returns a NEW Roster — immutable update',re:'return\\s+new\\s+Roster\\s*\\(\\s*\\w+\\s*\\)'},{d:'getter hands out the frozen list, no re-copy needed',re:'List<String>\\s+players\\s*\\(\\s*\\)\\s*\\{\\s*return\\s+players\\s*;'}],
behavior:`1. Roster r = demo(); r.players().add("Mallory") throws UnsupportedOperationException; the boundary is frozen. 2. Mutating the list a caller passed to the constructor afterwards does NOT change the roster; copyOf snapshotted it. 3. r.with("Karen") returns a roster of 4; r itself still has 3; updates create values instead of editing state. 4. List.of(...) with a null player would throw NullPointerException at creation: bad data dies at the door, not downstream.`,
hints:['The constructor line is the whole defensive-copy idiom: this.players = List.copyOf(players).','with() briefly uses a mutable ArrayList as scaffolding, then re-freezes by passing through the constructor.','This copy-add-refreeze shape is exactly how records with list components handle updates too.']}},
{id:'mod5',title:'Modern iteration: enhanced for, forEach, Iterable',body:`
<p>Ways to walk data, from classic to modern:</p>
<div class="codeSample" data-hl>for (int i = 0; i &lt; list.size(); i++) { ... }   // index needed? use this
for (String s : list) { ... }                    // enhanced for: any Iterable or array
list.forEach(System.out::println);               // internal iteration
for (var e : map.entrySet())                     // maps: iterate entries
    use(e.getKey(), e.getValue());
IntStream.range(0, 5).forEach(i -&gt; ...);         // index as a stream</div>
<p>The enhanced for works on anything implementing <code>Iterable&lt;T&gt;</code>: implement it (return an <code>Iterator</code>) and your own classes work in for-each too. Never mutate a collection while enhanced-for-ing it (<code>ConcurrentModificationException</code>); use <code>removeIf</code> or an explicit <code>Iterator.remove()</code>.</p>
<h4>External versus internal iteration</h4>
<p>The distinction underneath all of these is who controls the loop. With a <code>for</code> loop
<b>you</b> do: you can <code>break</code>, <code>continue</code>, keep an index, or mutate as you go. With
<code>forEach</code> and streams the <b>library</b> does, and you supply what to do with each element,
which is what allows it to reorder, parallelise or short-circuit internally.</p>
<p>That is the real trade, and it explains why <code>forEach</code> has no <code>break</code>: you gave up
control of the loop. Wanting one is a signal to use <code>anyMatch</code>, <code>findFirst</code> or
<code>takeWhile</code>, which express the intent directly, or to go back to a plain loop.</p>

<h4>Choosing between them</h4>
<div class="codeSample" data-hl>indexed for       you need the index, or to modify the list in place
enhanced for      the default. readable, debuggable, breakable.
forEach           one short action per element - especially a method ref
stream            you are TRANSFORMING: filter/map/collect
IntStream.range   an index without the ceremony

// and the one nobody defends:
// list.stream().forEach(...)  is a slower enhanced-for with a worse
// stack trace. if there is no intermediate operation, use the loop.</div>

<h4><code>ConcurrentModificationException</code>, properly understood</h4>
<p>It is not a concurrency error despite the name: a single thread triggers it. Collections keep a
modification counter; the iterator records it at creation and checks it on every step, so structural change
during iteration is detected and fails fast rather than silently skipping elements.</p>
<div class="codeSample" data-hl>for (String s : list) if (s.isBlank()) list.remove(s);   // CME

list.removeIf(String::isBlank);                          // the answer
// or, when the logic is more than a predicate:
for (var it = list.iterator(); it.hasNext(); )
    if (test(it.next())) it.remove();     // the iterator's own remove

// note: "structural" means adding or removing. SETTING an existing
// element is fine. and the check is best-effort - never write code
// that depends on the exception being thrown.</div>

<h4>Making your own types work in a for-each</h4>
<p>Implement <code>Iterable&lt;T&gt;</code> and return an iterator: one method, and your type participates
in the language construct. Worth doing for anything that is conceptually a sequence, because callers then
need no special API. If you also want streams, <code>StreamSupport.stream(spliterator(), false)</code>
bridges the two.</p>

<h4>Iterating maps without the extra lookup</h4>
<p><code>for (var k : map.keySet()) map.get(k)</code> does two lookups per entry and reads worse.
<code>entrySet()</code> gives you both at once, and <code>map.forEach((k, v) -&gt; ...)</code> is cleaner
still. Where order matters, remember <code>HashMap</code> gives you none; that is
<code>LinkedHashMap</code> (insertion order) or <code>TreeMap</code> (sorted).</p>`,
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
hints:['Inside iterator(), keep a cursor: <code>int current = from;</code> in an anonymous <code>new Iterator&lt;Integer&gt;() {...}</code>.','hasNext: <code>current >= 1</code>. next: <code>return current--;</code>','sum: <code>for (int n : c) total += n;</code>; the compiler calls your iterator() for you.'],
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
{id:'vtx1',title:'Varargs & text blocks',body:`
<p>Two smaller pieces of core Java that every codebase uses and few lessons teach.</p>
<p><b>Varargs</b>: a method that takes "any number of" arguments: <code>static int sum(int... nums)</code>. The <code>...</code> parameter <i>is an array</i> inside the method (<code>nums.length</code>, enhanced for), and callers write <code>sum(1, 2, 3)</code> or <code>sum()</code>; the compiler packs the array. You've been calling varargs all along: <code>List.of(...)</code>, <code>String.format(...)</code>, <code>Map.ofEntries(...)</code>. The rules: at most one varargs parameter, and it must be <b>last</b>: <code>greet(String name, String... titles)</code> is legal, the reverse is not. One caution: overloads like <code>f(int a)</code> vs <code>f(int... a)</code> resolve to the <i>most specific</i> match (the plain one); keep such overloads rare, they read as ambiguity even when the compiler disagrees.</p>
<p><b>Text blocks</b> (Java 15): multi-line string literals that keep their shape. Triple quotes, opening delimiter on its own line:</p>
<div class="codeSample" data-hl>String json = """
        {
          "name": "Ada",
          "belt": "black"
        }
        """;

String sql = """
        SELECT id, title
        FROM books
        WHERE price_cents &lt; ?
        ORDER BY title
        """;</div>
<p>No <code>\\n</code> escapes, no <code>+</code> concatenation ladders, and unescaped <code>"</code> inside, which is why JSON, SQL and HTML snippets are their natural habitat. The clever part is <b>incidental indentation</b>: the compiler measures the whitespace common to all lines (set by the closing <code>"""</code>'s position) and strips it, so your source stays indented but the string isn't. Two escapes exist just for text blocks: a trailing <code>\\</code> joins lines (no newline emitted), and <code>\\s</code> pins trailing spaces that would otherwise be stripped.</p>`,
docs:[['Varargs — Oracle','https://docs.oracle.com/javase/tutorial/java/javaOO/arguments.html#varargs'],['Text blocks — JEP 378','https://openjdk.org/jeps/378'],['Text blocks programmer’s guide','https://docs.oracle.com/en/java/javase/21/text-blocks/index.html']],
ex:{title:'Pack and unpack',
prompt:`Write class <code>Report</code>: (1) <code>static int sum(int... nums)</code>: enhanced for over the varargs array, accumulate, return (sum() with no args must give 0); (2) <code>static String join(String separator, String... parts)</code>: a <code>StringBuilder</code> loop over the parts appending the separator <b>between</b> elements (classic index check <code>i &gt; 0</code>), separator first parameter because <b>varargs must come last</b>; (3) <code>static String template()</code>: return a <b>text block</b> (triple-quoted) containing exactly the two lines <code>Report for: %s</code> and <code>Total: %d</code>.`,
starter:`public class Report {

    // your code
}`,
solution:`public class Report {

    static int sum(int... nums) {
        int total = 0;
        for (int n : nums) {
            total += n;
        }
        return total;
    }

    static String join(String separator, String... parts) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            if (i > 0) {
                sb.append(separator);
            }
            sb.append(parts[i]);
        }
        return sb.toString();
    }

    static String template() {
        return """
                Report for: %s
                Total: %d
                """;
    }
}`,
tests:[{d:'sum takes int varargs and loops the array',re:'static\\s+int\\s+sum\\s*\\(\\s*int\\.\\.\\.\\s*\\w+\\s*\\)[\\s\\S]*?for\\s*\\('},{d:'join: varargs parameter is LAST',re:'static\\s+String\\s+join\\s*\\(\\s*String\\s+separator\\s*,\\s*String\\.\\.\\.\\s*parts\\s*\\)'},{d:'Separator only between elements (i > 0 guard)',re:'if\\s*\\(\\s*i\\s*>\\s*0\\s*\\)[\\s\\S]*?append\\s*\\(\\s*separator'},{d:'StringBuilder does the assembly',re:'new\\s+StringBuilder\\s*\\('},{d:'template() returns a text block',re:'return\\s+"""[\\s\\S]*?Report for: %s[\\s\\S]*?Total: %d[\\s\\S]*?"""'},{d:'No \\n escapes needed in the text block',re:'template[\\s\\S]*?\\\\n',not:true}],
behavior:`1. sum() == 0, sum(5) == 5, sum(1, 2, 3) == 6; the compiler packs each call into an int[]. 2. join(", ", "a", "b", "c") returns "a, b, c": no leading or trailing separator; join("-") with no parts returns "". 3. template() contains two lines with real newlines and NO leading spaces; the closing triple-quote position told the compiler which indentation was incidental. 4. String.format(template(), "Ada", 42): the text block slots straight into the formatting API.`,
hints:['Inside sum, nums is just an int[]: length, indexing, enhanced for all work.','The i > 0 check is the classic separator idiom: append separator BEFORE every element except the first.','Open the text block with """ then a newline; align the closing """ with the content to strip all incidental indentation.']}},
{id:'mod6',title:'Optional, records & pattern matching',body:`
<p>🌱 <b>Starting from zero:</b> the billion-dollar question of "what if there\u0027s no answer?": a search that finds nothing, a lookup with no match. Returning <code>null</code> (nothing) works until someone forgets to check and the program crashes. <b>Optional</b> is a see-through box: it either contains the answer or is visibly empty, and its type forces everyone who receives it to acknowledge the empty case. That\u0027s pillar one below; records and pattern matching follow the same spirit: saying what you mean in the type.</p>
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
<p>Rules: never call <code>Optional.get()</code> without checking; use records for DTOs and value objects; switch expressions with <code>-&gt;</code> don't fall through and must be exhaustive.</p>

<h4>Optional, used as intended</h4>
<p><code>Optional</code> was designed for one job: a <b>return type</b> that may legitimately have no value. Used there it forces the caller to acknowledge the empty case at compile time. Used elsewhere it makes things worse: as a field it is not serialisable and adds an object per instance, and as a parameter it forces every caller to wrap, when two overloads say the same thing more clearly.</p>
<p>The idiomatic style is to keep the value inside the box and transform it: <code>findUser(id).map(User::email).filter(e -&gt; e.endsWith("@acme.com")).orElseThrow(...)</code>. Calling <code>isPresent()</code> then <code>get()</code> is the null check you were trying to escape, wearing a longer name. Two more choices worth making deliberately: <code>orElse(compute())</code> evaluates its argument every time, while <code>orElseGet(() -&gt; compute())</code> only on the empty path, an easy performance bug when the fallback hits a database. And never return <code>null</code> from a method whose type is <code>Optional</code>.</p>

<h4>Records are about equality, not brevity</h4>
<p>A record generates a canonical constructor, accessors, <code>equals</code>, <code>hashCode</code> and <code>toString</code>, but the reason to use one is the semantic claim: <b>this type is its data</b>, two instances with equal components are equal, and it is immutable. That makes records correct as map keys and as values passed between threads, which is the bug class the collections lesson warns about, removed by construction.</p>
<p>Validation goes in a <b>compact constructor</b>, which runs before the fields are assigned. And immutability is shallow: a record holding a <code>List</code> shares that list with whoever passed it, so defensive-copy in the compact constructor when the component is mutable.</p>

<h4>Pattern matching, and why exhaustiveness matters</h4>
<p><code>instanceof</code> with a binding removes the cast, and a switch over a <b>sealed</b> interface removes the default branch, which is the valuable part. When the compiler knows every permitted subtype, adding a new one turns every switch that does not handle it into a compile error, so the compiler finds the places you must update instead of you finding them in production. That combination (sealed types, records as the cases, switch with patterns) is how Java expresses a closed set of alternatives, and it is worth reaching for whenever a domain has a fixed list of shapes.</p>`,
docs:[['Records — dev.java','https://dev.java/learn/records/'],['Pattern matching — dev.java','https://dev.java/learn/pattern-matching/'],['Optional — dev.java','https://dev.java/learn/api/streams/optionals/']],
ex:{title:'Modern trio',
prompt:`(1) Define <code>record Book(String title, String author, int year)</code>. (2) Write <code>Library</code> with a private <code>List&lt;Book&gt; books</code>, method <code>Optional&lt;Book&gt; findByTitle(String t)</code> using a stream + <code>findFirst()</code>, and (3) <code>String describe(Object o)</code> using a <b>switch expression with pattern matching</b>: a <code>Book b</code> → <code>b.title() + " (" + b.year() + ")"</code>, a <code>String s</code> → <code>"text: " + s</code>, anything else → <code>"unknown"</code>.`,
starter:`import java.util.*;

record Book(String title, String author, int year) {}

public class Library {
    private final List<Book> books = new ArrayList<>();

    public void add(Book b) { books.add(b); }

    public Optional<Book> findByTitle(String t) {
        return Optional.empty(); // TODO: stream over books, filter by title, return the first match
    }

    public String describe(Object o) {
        return switch (o) {
            // TODO: add a typed pattern for a Book, then one for a String
            default -> "unknown";
        };
    }
}`,
tests:[{d:'Book is a record',re:'record\\s+Book\\s*\\('},{d:'findByTitle returns Optional via findFirst',re:'findFirst\\s*\\(\\s*\\)'},{d:'Switch uses type patterns',re:'case\\s+Book\\s+\\w+\\s*->'},{d:'Handles String case',re:'case\\s+String\\s+\\w+\\s*->'},{d:'Never calls Optional.get()',re:'\\.get\\s*\\(\\s*\\)',not:true}],
behavior:`1. After add(new Book("Dune","Herbert",1965)), findByTitle("Dune") is a present Optional with that book; findByTitle("X") is empty. 2. describe(new Book("Dune","H",1965)) returns "Dune (1965)". 3. describe("hi") returns "text: hi". 4. describe(42) returns "unknown".`,
hints:['findByTitle: <code>books.stream().filter(b -> b.title().equals(t)).findFirst()</code>; findFirst already returns Optional.','Pattern case: <code>case Book b -> b.title() + " (" + b.year() + ")";</code>; b is typed and bound in one step.','Record accessors have no get-prefix: <code>b.title()</code>, <code>b.year()</code>.'],
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
<p>A <b>sealed</b> type declares its complete set of subtypes: <code>sealed interface Shape permits Circle, Rect</code>. Nothing else may implement it, and every permitted subtype must be <code>final</code>, <code>sealed</code> (continuing the restriction), or <code>non-sealed</code> (opting out). You've met records and basic pattern matching in the modern-Java lesson; sealed types are the missing piece that makes them a system: <b>algebraic data types</b> in Java.</p>
<p>The payoff is <b>exhaustive switch</b>: when the compiler knows all subtypes, a pattern-matching switch needs no <code>default</code>, and when you later add a subtype, every switch that doesn't handle it becomes a <i>compile error</i>. Your codebase tells you every place that needs updating.</p>
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
<p><b>Record patterns</b> (Java 21) deconstruct in the case label, including nested: <code>case Line(Point(var x1, var y1), Point p2)</code>. <b>Guards</b> add a boolean with <code>when</code>. Order matters: cases are tested top-down, so guarded cases go before their unguarded catch-all.</p>

<h4>What sealing actually buys</h4>
<p><code>sealed</code> tells the compiler the complete list of permitted subtypes. That turns a switch over
the type into something it can <b>check for exhaustiveness</b>: handle every permitted case and no
<code>default</code> is needed, and (the valuable half) adding a new permitted subtype turns every switch
that does not handle it into a compile error. The compiler finds the call sites instead of your users
finding them.</p>
<p>Each permitted subtype must declare its own intent: <code>final</code> (no further extension),
<code>sealed</code> (a closed set beneath it) or <code>non-sealed</code> (deliberately reopened). There is
no silent default, which is the point.</p>

<h4>Records and patterns, and why they arrived together</h4>
<p>A sealed interface with record implementations is Java's way of expressing a closed set of alternatives
that carry data: what other languages call an algebraic data type. Pattern matching then destructures them
in the same switch that dispatches on them:</p>
<div class="codeSample">sealed interface Shape permits Circle, Square {}
record Circle(double r) implements Shape {}
record Square(double side) implements Shape {}

double area = switch (shape) {
    case Circle c -&gt; Math.PI * c.r() * c.r();
    case Square s -&gt; s.side() * s.side();
};   // exhaustive: no default, and a new Shape breaks this line at compile time</div>

<h4>When to reach for it, and when not</h4>
<p>Use it when the set of alternatives is genuinely closed and known to you: a protocol's message types,
the states of a workflow, the result of a parse. Do <b>not</b> use it where you want third parties to
extend your abstraction; that is what an ordinary interface is for, and sealing it is a deliberate
statement that they may not. The choice between an open interface and a sealed one is a statement about who
owns the set of cases, and it is worth making on purpose.`,
docs:[['Sealed classes — JEP 409','https://openjdk.org/jeps/409'],['Record patterns — JEP 440','https://openjdk.org/jeps/440'],['Pattern matching for switch — JEP 441','https://openjdk.org/jeps/441']],
ex:{title:'An exhaustive payment switch',
prompt:`Model payments as a <code>sealed interface Payment permits Card, Cash, Transfer</code> with three <b>records</b>: <code>Card(String last4, double amount)</code>, <code>Cash(double amount)</code>, <code>Transfer(String iban, double amount)</code>. Write <code>static String receipt(Payment p)</code> as a pattern-matching <code>switch</code> using <b>record patterns</b>, with a <b>guarded</b> case first: any Card <code>when</code> amount &gt; 1000 returns <code>"card (verified)"</code>; otherwise Card → <code>"card ****"+last4</code>, Cash → <code>"cash"</code>, Transfer → <code>"transfer to "+iban</code>. No <code>default</code> branch; the sealed hierarchy makes it exhaustive.`,
starter:`sealed interface Payment permits Card, Cash, Transfer {}
// 1. the three records implementing Payment

public class Payments {
    static String receipt(Payment p) {
        // 2. switch with record patterns; guarded Card case first; no default
        return null;
    }
}`,
tests:[{d:'Sealed interface with permits list',re:'sealed\\s+interface\\s+Payment\\s+permits\\s+Card\\s*,\\s*Cash\\s*,\\s*Transfer'},{d:'Records implement the interface',re:'record\\s+Card\\s*\\([^)]*\\)\\s+implements\\s+Payment'},{d:'Pattern-matching switch on p',re:'switch\\s*\\(\\s*p\\s*\\)'},{d:'Record pattern deconstruction',re:'case\\s+Card\\s*\\('},{d:'Guarded case with when',re:'when\\s+.*>\\s*1000'},{d:'No default branch (exhaustive)',re:'default\\s*(:|->)',not:true}],
behavior:`1. receipt(new Card("1234", 50)) returns "card ****1234". 2. receipt(new Card("1234", 5000)) returns "card (verified)"; the guard wins because it is listed first. 3. receipt(new Cash(10)) returns "cash"; receipt(new Transfer("DE89...", 10)) starts with "transfer to ". 4. The switch compiles with no default, and adding a fourth Payment subtype would break compilation of receipt (that is the feature).`,
hints:['Records: <code>record Card(String last4, double amount) implements Payment {}</code>: one line each; the sealed interface only permits these three.','Guard first: <code>case Card(String last4, double amount) when amount &gt; 1000 -&gt; "card (verified)";</code> then the plain <code>case Card(String last4, double amount) -&gt; "card ****" + last4;</code>','Finish with Cash and Transfer record patterns and return the switch directly: <code>return switch (p) { ... };</code>; no default allowed.'],
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
