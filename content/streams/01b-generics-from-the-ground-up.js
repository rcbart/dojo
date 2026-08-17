STREAMS.push({icon:'🧬',title:'Generics from the Ground Up',blurb:'The angle brackets, explained from zero: what generics are, why they exist, generic classes and methods, bounds, wildcards & PECS, and the truth about erasure.',lessons:[
{id:'gnr0',title:'What generics are — from zero',body:`
<p>Forget code for a minute. Imagine a moving company that stores things for people in <b>boxes</b>. In the early days, every box was identical: a plain cardboard box. Anything could go in: dishes, books, a goldfish. The problems showed up at <i>unpacking</i> time: you open a box expecting wine glasses, reach in confidently, and find a bowling ball. Crash. Nothing about the box itself warned you, because every box looked the same. The mistake happened at <i>packing</i> time, but the pain arrived much later, somewhere else, as a surprise.</p>
<p>The fix the movers invented: <b>a label on the box that states what's allowed inside</b>, and a strict warehouse worker who physically refuses to let anyone put a bowling ball into a box labeled <i>WINE GLASSES</i>. With labeled boxes, two things become true: mistakes are caught <b>at packing time</b> (when they're trivial to fix), and unpacking needs no caution at all: the label <i>guarantees</i> what you'll find.</p>
<p>That is the entire idea of generics. In Java:</p>
<ul>
<li>The <b>box</b> is a container class: <code>List</code> (a growable sequence of things) is the one you'll use most.</li>
<li>The <b>label</b> is the type in angle brackets: <code>List&lt;String&gt;</code> reads as "a List of Strings": a box labeled STRINGS.</li>
<li>The <b>strict warehouse worker</b> is the compiler: it refuses, at compile time, any code that puts the wrong thing in: the program won't even build.</li>
</ul>
<div class="codeSample" data-hl>List&lt;String&gt; names = new ArrayList&lt;&gt;();   // a box labeled: Strings only
names.add("Ada");                          // fine — it's a String
names.add(42);                             // COMPILE ERROR — the label says no

String first = names.get(0);               // no caution needed: it CAN only be a String</div>
<p>Java actually lived the cardboard-box era: before 2004 (Java 5), collections were unlabeled. Every <code>get()</code> returned <code>Object</code> ("something"), you had to <b>cast</b> (assert "trust me, it's a String"), and when you trusted wrongly, the program crashed <i>at runtime</i>, wherever the unpacking happened, with a <code>ClassCastException</code>. Generics moved that whole class of error from runtime (your users find it) to compile time (you find it, immediately, at the exact line).</p>
<p>Two readings to internalize before moving on: <code>List&lt;String&gt;</code> means "a List of Strings"; <code>Map&lt;String, Integer&gt;</code> means "a Map from Strings to Integers" (a phone book: name → number). The angle brackets always answer the question <i>"of what?"</i></p>`,
docs:[['Why generics? — Oracle','https://docs.oracle.com/javase/tutorial/java/generics/why.html'],['Generics — dev.java','https://dev.java/learn/generics/'],['Lesson: Generics — Oracle trail','https://docs.oracle.com/javase/tutorial/java/generics/index.html']],
ex:{title:'Label the boxes',
prompt:`Write class <code>Labels</code> with three static methods that use generics correctly (no casts, no raw types): (1) <code>List&lt;String&gt; starterNames()</code>: create a <code>new ArrayList&lt;&gt;()</code>, add <code>"Ada"</code> and <code>"Linus"</code>, return it; (2) <code>Map&lt;String, Integer&gt; ages()</code>: a <code>new HashMap&lt;&gt;()</code> mapping <code>"Ada"</code> to 36, returned; (3) <code>String firstUpper(List&lt;String&gt; names)</code>: return the first element uppercased, directly calling <code>toUpperCase()</code> on the result of <code>get(0)</code>; the label guarantees it's a String, so <b>no cast appears anywhere in the file</b>.`,
starter:`import java.util.*;

public class Labels {

    static List<String> starterNames() {
        return null;
    }

    static Map<String, Integer> ages() {
        return null;
    }

    static String firstUpper(List<String> names) {
        return null;
    }
}`,
solution:`import java.util.*;

public class Labels {

    static List<String> starterNames() {
        List<String> names = new ArrayList<>();
        names.add("Ada");
        names.add("Linus");
        return names;
    }

    static Map<String, Integer> ages() {
        Map<String, Integer> ages = new HashMap<>();
        ages.put("Ada", 36);
        return ages;
    }

    static String firstUpper(List<String> names) {
        return names.get(0).toUpperCase();
    }
}`,
tests:[{d:'starterNames builds a typed ArrayList with the diamond',re:'List<String>\\s+\\w+\\s*=\\s*new\\s+ArrayList<>\\s*\\('},{d:'Both names added',re:'add\\s*\\(\\s*"Ada"\\s*\\)[\\s\\S]*?add\\s*\\(\\s*"Linus"\\s*\\)'},{d:'ages returns a Map<String, Integer> built with put',re:'new\\s+HashMap<>\\s*\\([\\s\\S]*?put\\s*\\(\\s*"Ada"\\s*,\\s*36\\s*\\)'},{d:'firstUpper chains get(0).toUpperCase() directly',re:'get\\s*\\(\\s*0\\s*\\)\\s*\\.toUpperCase\\s*\\(\\s*\\)'},{d:'No casts anywhere — the labels make them unnecessary',re:'\\(\\s*String\\s*\\)',not:true},{d:'No raw types — every List/Map is parameterized',re:'(List|Map|ArrayList|HashMap)\\s+\\w+\\s*=\\s*new\\s+(ArrayList|HashMap)\\s*\\(',not:true}],
behavior:`1. starterNames() returns a List containing exactly "Ada" then "Linus". 2. ages() returns a Map where get("Ada") == 36. 3. firstUpper(List.of("ada")) returns "ADA", and the call chain compiles precisely because get(0) is KNOWN to be a String; with a raw List it would be Object and toUpperCase would not compile. 4. The file contains zero casts; that absence is the entire point of the lesson.`,
hints:['new ArrayList<>(): the empty diamond <> lets the compiler copy the label from the left-hand side.','Map methods: put(key, value) to store, get(key) to fetch.','If you feel the urge to write (String) anywhere, a label is missing somewhere; fix the type, not the symptom.']}},

{id:'gnr1',title:'Reading & writing generic types',body:`
<p>Generics have a grammar. Once you can read it aloud, unfamiliar signatures stop being noise:</p>
<div class="codeSample">List&lt;String&gt;                          "a List of Strings"
Map&lt;String, List&lt;Integer&gt;&gt;           "a Map from Strings to Lists of Integers"
Optional&lt;BigDecimal&gt;                  "maybe a BigDecimal"
Function&lt;String, Integer&gt;             "a function taking a String, giving an Integer"
List&lt;Map&lt;String, Double&gt;&gt;             "a List of (Maps from String to Double)"  — nest from the inside out</div>
<p>Where the labels appear, and who writes them:</p>
<ul>
<li><b>Variables & fields</b>: <code>List&lt;String&gt; names = new ArrayList&lt;&gt;();</code>. Spell the label on the left; the <b>diamond</b> <code>&lt;&gt;</code> on the right says "compiler, copy it over" (always use it; repeating the label is noise, omitting brackets entirely is a raw type, a different and dangerous thing).</li>
<li><b>Parameters & returns</b>: <code>static double total(Map&lt;String, Double&gt; prices)</code>. Signatures are contracts, and the labels are part of the contract: callers cannot hand you a <code>Map&lt;String, String&gt;</code>.</li>
<li><b>The one wrinkle</b>: labels take <b>reference types only</b>: no <code>List&lt;int&gt;</code>. Each primitive has an object twin (<code>int</code>→<code>Integer</code>, <code>double</code>→<code>Double</code>, <code>boolean</code>→<code>Boolean</code>), and Java <b>auto-boxes</b> between them: <code>counts.add(7)</code> quietly wraps the 7. You write <code>List&lt;Integer&gt;</code> and mostly never think about it again.</li>
</ul>
<p>Reading practice with real signatures from earlier streams, decoded: <code>Map&lt;String, Integer&gt; frequencies(List&lt;String&gt; words)</code> means "take a List of Strings, give back a Map from each String to a count". <code>Comparator&lt;Track&gt; byLength()</code> means "give back a thing that knows how to compare two Tracks". The types tell the story before the body confirms it, which is why generic signatures are the first thing to read in unfamiliar code, and the reason IDE tooltips are readable at all.</p>`,
docs:[['Generic types — Oracle','https://docs.oracle.com/javase/tutorial/java/generics/types.html'],['The diamond operator','https://docs.oracle.com/javase/tutorial/java/generics/genTypeInference.html'],['Autoboxing — Oracle','https://docs.oracle.com/javase/tutorial/java/data/autoboxing.html']],
ex:{title:'Signatures as contracts',
prompt:`Write class <code>Inventory</code> with three members using precise generic types (no raw types, no casts): (1) a <code>private final Map&lt;String, List&lt;String&gt;&gt; itemsByRoom = new HashMap&lt;&gt;();</code> (rooms → the items in them); (2) <code>void store(String room, String item)</code>: get the room's list via <code>itemsByRoom.computeIfAbsent(room, k -&gt; new ArrayList&lt;&gt;())</code> and add the item to it; (3) <code>List&lt;Integer&gt; sizes()</code>: return a <code>new ArrayList&lt;&gt;()</code> filled with each room-list's <code>size()</code> using an enhanced for over <code>itemsByRoom.values()</code> (autoboxing does the int→Integer wrapping).`,
starter:`import java.util.*;

public class Inventory {

    // 1) the field

    // 2) store

    // 3) sizes
}`,
solution:`import java.util.*;

public class Inventory {

    private final Map<String, List<String>> itemsByRoom = new HashMap<>();

    void store(String room, String item) {
        itemsByRoom.computeIfAbsent(room, k -> new ArrayList<>()).add(item);
    }

    List<Integer> sizes() {
        List<Integer> result = new ArrayList<>();
        for (List<String> items : itemsByRoom.values()) {
            result.add(items.size());
        }
        return result;
    }
}`,
tests:[{d:'Nested generic field: Map<String, List<String>>',re:'private\\s+final\\s+Map<String,\\s*List<String>>\\s+itemsByRoom\\s*=\\s*new\\s+HashMap<>\\s*\\('},{d:'store uses computeIfAbsent with a lambda making the list',re:'computeIfAbsent\\s*\\(\\s*room\\s*,\\s*\\w+\\s*->\\s*new\\s+ArrayList<>\\s*\\(\\s*\\)\\s*\\)\\s*\\.add\\s*\\(\\s*item'},{d:'sizes returns List<Integer> (boxed — no List<int> exists)',re:'List<Integer>\\s+\\w+\\s*=\\s*new\\s+ArrayList<>|List<Integer>\\s+sizes'},{d:'Enhanced for over the map values, typed List<String>',re:'for\\s*\\(\\s*List<String>\\s+\\w+\\s*:\\s*itemsByRoom\\.values\\s*\\(\\s*\\)\\s*\\)'},{d:'Autoboxing does the wrapping — size() added directly',re:'\\.add\\s*\\(\\s*\\w+\\.size\\s*\\(\\s*\\)\\s*\\)'},{d:'No casts, no raw types',re:'\\(\\s*(String|Integer|List)\\s*\\)\\s*\\w|new\\s+(ArrayList|HashMap)\\s*\\(\\s*\\)\\s*;\\s*//\\s*raw',not:true}],
behavior:`1. store("kitchen", "kettle"); store("kitchen", "pan"); store("attic", "box") → itemsByRoom has 2 rooms, kitchen's list has 2 items. 2. computeIfAbsent creates each room's list exactly once, on first use: no if-null dance. 3. sizes() returns [2, 1] (order per map iteration); each int size() auto-boxes into the List<Integer>. 4. Every type is spelled: the nested Map<String, List<String>> reads "map from room to the list of items in it".`,
hints:['Read the field inside-out: a Map from String to (List of String).','computeIfAbsent returns the (existing or fresh) list; chain .add(item) straight onto it.','List<int> will not compile: Integer is the boxed twin, and add(items.size()) boxes silently.']}},

{id:'gen1',title:'Generics I: generic classes & methods',body:`
<p>Generics let you write code once, typed for anything, with the compiler enforcing safety. A type parameter (<code>&lt;T&gt;</code>) is a placeholder the caller fills in:</p>
<div class="codeSample" data-hl>public class Box&lt;T&gt; {                 // generic class
    private T value;
    public void put(T value) { this.value = value; }
    public T get() { return value; }
}

Box&lt;String&gt; b = new Box&lt;&gt;();          // diamond: T inferred as String
b.put("hi");
String s = b.get();                   // no cast — the compiler knows

// generic METHOD: declares its own &lt;T&gt; before the return type
static &lt;T&gt; T firstNonNull(T a, T b) {
    return a != null ? a : b;
}</div>
<p>Conventions: <code>T</code> type, <code>E</code> element, <code>K,V</code> key/value, <code>R</code> result. Multiple parameters: <code>Pair&lt;A, B&gt;</code>. Primitives can't be type arguments; use wrappers (<code>Box&lt;Integer&gt;</code>, not <code>Box&lt;int&gt;</code>).</p>
<h4>The problem generics solve</h4>
<p>Before them, a collection held <code>Object</code> and every read needed a cast, which meant the
compiler could not help you, and a wrong assumption surfaced as a
<code>ClassCastException</code> at runtime, usually far from the mistake.</p>
<div class="codeSample" data-hl>List raw = new ArrayList();     // pre-generics, and still legal today
raw.add("hello");
raw.add(42);                    // nothing stops this
String s = (String) raw.get(1); // compiles. explodes at runtime.

List&lt;String&gt; typed = new ArrayList&lt;&gt;();
typed.add(42);                  // COMPILE ERROR. found before it ran.
String s2 = typed.get(0);       // no cast needed</div>
<p>That is the whole value proposition: <b>move an entire class of error from runtime to compile time</b>,
and delete the casts while you are there. Generics exist for the compiler's benefit, which is worth
remembering when you meet erasure below.</p>

<h4>Generic class versus generic method</h4>
<p>A generic <b>class</b> binds its parameter when you create an instance: <code>Box&lt;String&gt;</code>
is a box of strings for its whole life. A generic <b>method</b> binds its parameter per call, which is why
it declares its own <code>&lt;T&gt;</code> <i>before</i> the return type, and why a static method must be
generic in its own right (a static member cannot see the class's type parameter: there is no
instance).</p>
<p>Inference does almost all the work: the diamond <code>&lt;&gt;</code> reads the target type, and a
generic method infers from its arguments. You will rarely need to write
<code>Collections.&lt;String&gt;emptyList()</code> explicitly, but knowing you can helps when inference
picks something surprising.</p>

<h4>Erasure — the thing that explains every strange limitation</h4>
<p>Generics were added to Java without changing the JVM, so the compiler checks types and then <b>erases
them</b>. At runtime, <code>List&lt;String&gt;</code> and <code>List&lt;Integer&gt;</code> are the same
class. Everything odd follows from that one fact:</p>
<div class="codeSample" data-hl>new T()                    // no. T does not exist at runtime.
new T[10]                  // no.
list instanceof List&lt;String&gt;   // no. only  instanceof List
class A implements Cmp&lt;X&gt;, Cmp&lt;Y&gt;   // no. same erased interface.
void f(List&lt;String&gt;) / void f(List&lt;Integer&gt;)  // no. same signature.

// and the runtime hole this leaves:
List&lt;String&gt; l = new ArrayList&lt;&gt;();
((List) l).add(42);        // unchecked, compiles with a warning
String s = l.get(0);       // ClassCastException, thrown HERE, not there
// generics are a compile-time guarantee only. never ignore an
// unchecked warning - it is the compiler telling you it stopped
// being able to help.</div>

<h4>Conventions and the primitive limitation</h4>
<p><code>T</code> for type, <code>E</code> for element, <code>K</code>/<code>V</code> for key and value,
<code>R</code> for result. All are meaningless to the compiler and worth following anyway, since a reader knows
instantly which is which.</p>
<p>Primitives cannot be type arguments, because erasure needs everything to be an <code>Object</code>. So
<code>List&lt;Integer&gt;</code>, with autoboxing hiding the conversion, and hiding its cost, which is why
a list of a million boxed integers uses several times the memory of an <code>int[]</code> and why
<code>IntStream</code> exists as a separate type. (Project Valhalla is the long-running effort to remove
this compromise.)</p>`,
docs:[['Generics — dev.java','https://dev.java/learn/generics/'],['Generic types — Oracle','https://docs.oracle.com/javase/tutorial/java/generics/types.html']],
ex:{title:'Build a Pair',
prompt:`Write a generic class <code>Pair&lt;A, B&gt;</code> with private final fields <code>first</code>/<code>second</code>, a constructor, accessors <code>A first()</code> and <code>B second()</code>, and a method <code>Pair&lt;B, A&gt; swap()</code> returning a new reversed pair. Then a generic <b>static method</b> in the same class: <code>static &lt;T&gt; Pair&lt;T, T&gt; twin(T value)</code> returning a pair holding the value twice.`,
starter:`public class Pair<A, B> {
    // fields + constructor

    // A first(), B second()

    // Pair<B, A> swap()

    // static <T> Pair<T, T> twin(T value)
}`,
tests:[{d:'Generic class with two parameters',re:'class\\s+Pair\\s*<\\s*A\\s*,\\s*B\\s*>'},{d:'Final fields of type A and B',re:'private\\s+final\\s+A\\s+first[\\s\\S]*private\\s+final\\s+B\\s+second'},{d:'swap returns Pair<B, A>',re:'Pair\\s*<\\s*B\\s*,\\s*A\\s*>\\s+swap\\s*\\(\\s*\\)'},{d:'twin declares its own <T>',re:'static\\s*<\\s*T\\s*>\\s*Pair\\s*<\\s*T\\s*,\\s*T\\s*>\\s+twin'},{d:'No raw-type casts',re:'\\(\\s*Pair\\s*\\)',not:true}],
behavior:`1. new Pair<>("a", 1).first() equals "a", .second() equals 1. 2. swap() on that pair gives first()==1, second()=="a": a NEW Pair, original untouched. 3. Pair.twin("x") gives ("x","x") typed Pair<String,String>. 4. No casts or raw types anywhere.`,
hints:['Constructor: <code>public Pair(A first, B second) { this.first = first; this.second = second; }</code>','swap flips the arguments AND the type order: <code>return new Pair&lt;&gt;(second, first);</code>. The diamond infers B, A.','A static method cannot use the class parameters A/B (there is no instance); that is why twin declares its own &lt;T&gt;.'],
solution:`public class Pair<A, B> {
    private final A first;
    private final B second;

    public Pair(A first, B second) {
        this.first = first;
        this.second = second;
    }

    public A first() { return first; }
    public B second() { return second; }

    public Pair<B, A> swap() {
        return new Pair<>(second, first);
    }

    static <T> Pair<T, T> twin(T value) {
        return new Pair<>(value, value);
    }
}`}},
{id:'gen2',title:'Generics II: bounds, wildcards (PECS) & erasure',body:`
<p><b>Bounds</b> constrain what T can be: <code>&lt;T extends Comparable&lt;T&gt;&gt;</code> means "any T that can compare to itself"; now you may call <code>compareTo</code> inside.</p>
<p><b>Wildcards</b> handle variance: a <code>List&lt;Integer&gt;</code> is <i>not</i> a <code>List&lt;Number&gt;</code>. The rule is <b>PECS</b>: <i>Producer Extends, Consumer Super</i>:</p>
<div class="codeSample" data-hl>// producer: you READ from it → ? extends
static double sum(List&lt;? extends Number&gt; nums) {
    double total = 0;
    for (Number n : nums) total += n.doubleValue();
    return total;                    // accepts List&lt;Integer&gt;, List&lt;Double&gt;…
}

// consumer: you WRITE into it → ? super
static void fillZeros(List&lt;? super Integer&gt; dst, int count) {
    for (int i = 0; i &lt; count; i++) dst.add(0);   // accepts List&lt;Number&gt;, List&lt;Object&gt;…
}

static &lt;T extends Comparable&lt;T&gt;&gt; T max(List&lt;T&gt; items) { ... }</div>
<p><b>Erasure</b>: generics exist only at compile time; at runtime a <code>List&lt;String&gt;</code> is just a <code>List</code>. Consequences: no <code>new T()</code>, no <code>T.class</code>, no <code>instanceof List&lt;String&gt;</code>, and Jackson needs <code>TypeReference</code> for generic targets (you met this in the JSON lesson).</p>

<h4>Why a List of Integer is not a List of Number</h4>
<p>The rule looks unhelpful until you follow the alternative. If it were allowed, this would compile:</p>
<div class="codeSample">List&lt;Integer&gt; ints = new ArrayList&lt;&gt;();
List&lt;Number&gt; nums = ints;      // imagine this were legal
nums.add(3.14);                 // a Double, into a list of Integers
int x = ints.get(0);            // ClassCastException at runtime</div>
<p>Generics are <b>invariant</b> precisely to make that impossible at compile time. Arrays, which predate generics, <i>are</i> covariant (<code>Integer[]</code> is an <code>Object[]</code>) and pay for it with <code>ArrayStoreException</code>, a runtime error for a type mistake. Wildcards exist to recover the flexibility invariance costs, without giving up the guarantee.</p>

<h4>PECS, and why each half is safe</h4>
<p><code>? extends Number</code> is a <b>producer</b>: every element is <i>at least</i> a Number, so reading is safe. Writing is not: the list might be a <code>List&lt;Integer&gt;</code>, and the compiler cannot know your value fits, so it rejects every <code>add</code> except <code>null</code>. <code>? super Integer</code> is a <b>consumer</b>: the list holds Integer or something more general, so adding an Integer is always safe, while reading gives back only <code>Object</code>, since it could be a <code>List&lt;Object&gt;</code>. Read the signature of <code>Collections.copy(List&lt;? super T&gt; dest, List&lt;? extends T&gt; src)</code> and the mnemonic stops being a mnemonic: source produces, destination consumes.</p>

<h4>Erasure, and the workarounds it forces</h4>
<p>Generics were added without changing the class file format, so the compiler checks types and then <b>erases</b> them, inserting casts where needed. The compatibility win was enormous (existing code and libraries kept working), and the cost is a list of things you cannot do: no <code>new T[]</code>, no <code>T.class</code>, no <code>instanceof List&lt;String&gt;</code>, no overloads differing only in type argument, and no primitives as type arguments (hence the boxing that Project Valhalla aims to remove).</p>
<p>The standard workarounds are worth recognising because you will read them in every library: pass a <code>Class&lt;T&gt;</code> token when you need the runtime type, and use the anonymous-subclass trick (Jackson's <code>TypeReference</code>, Spring's <code>ParameterizedTypeReference</code>) when you need a full generic type, which survives erasure because it is recorded in the subclass's signature. And treat an unavoidable unchecked cast as a claim you have verified: annotate it with <code>@SuppressWarnings("unchecked")</code> and a comment saying why it holds.</p>`,
docs:[['Wildcards & PECS — Oracle','https://docs.oracle.com/javase/tutorial/java/generics/wildcards.html'],['Type erasure — Oracle','https://docs.oracle.com/javase/tutorial/java/generics/erasure.html']],
ex:{title:'PECS in practice',
prompt:`Write class <code>Variance</code> with three methods: (1) <code>static double total(java.util.List&lt;? extends Number&gt; prices)</code> summing via <code>doubleValue()</code>; (2) <code>static void pad(java.util.List&lt;? super Integer&gt; target, int n)</code> adding the numbers 1..n to the list; (3) <code>static &lt;T extends Comparable&lt;T&gt;&gt; T biggest(java.util.List&lt;T&gt; items)</code> returning the max via <code>compareTo</code> (assume non-empty).`,
starter:`import java.util.List;

public class Variance {
    static double total(List<? extends Number> prices) {
        return 0;
    }

    static void pad(List<? super Integer> target, int n) {
    }

    static <T extends Comparable<T>> T biggest(List<T> items) {
        return null;
    }
}`,
tests:[{d:'Producer position uses ? extends Number',re:'List<\\?\\s+extends\\s+Number>'},{d:'Consumer position uses ? super Integer',re:'List<\\?\\s+super\\s+Integer>'},{d:'Bounded type parameter with Comparable',re:'<\\s*T\\s+extends\\s+Comparable<T>\\s*>'},{d:'Uses doubleValue() to sum',re:'doubleValue\\s*\\(\\s*\\)'},{d:'biggest compares via compareTo',re:'compareTo\\s*\\('}],
behavior:`1. total(List.of(1, 2.5)) == 3.5: it works for any Number subtype list. 2. pad(list, 3) adds 1, 2, 3 to a List<Number> or List<Object> target. 3. biggest(List.of(3, 9, 2)) == 9; biggest(List.of("b","a")) equals "b". 4. Signatures use the exact wildcard forms; swap extends/super and the AI runner will flag it.`,
hints:['total: enhanced for over <code>Number n : prices</code>, accumulate <code>n.doubleValue()</code>. You read (produce) → extends.','pad: <code>for (int i = 1; i <= n; i++) target.add(i);</code>. You write (consume) → super.','biggest: track a best-so-far; <code>if (item.compareTo(best) > 0) best = item;</code>. The bound is what legalizes compareTo.'],
solution:`import java.util.List;

public class Variance {
    static double total(List<? extends Number> prices) {
        double sum = 0;
        for (Number n : prices) {
            sum += n.doubleValue();
        }
        return sum;
    }

    static void pad(List<? super Integer> target, int n) {
        for (int i = 1; i <= n; i++) {
            target.add(i);
        }
    }

    static <T extends Comparable<T>> T biggest(List<T> items) {
        T best = items.get(0);
        for (T item : items) {
            if (item.compareTo(best) > 0) {
                best = item;
            }
        }
        return best;
    }
}`}},

{id:'gnr2',title:'Erasure & the edges of generics',body:`
<p>One secret explains every strange edge of Java generics: <b>the labels exist only at compile time</b>. After the compiler has checked everything, it <i>erases</i> them: at runtime a <code>List&lt;String&gt;</code> and a <code>List&lt;Integer&gt;</code> are the exact same class, plain <code>List</code>. This is <b>type erasure</b>, chosen in 2004 so generics-using code could run on older JVMs. The safety is real, but it is enforced entirely <i>before</i> the program runs.</p>
<p>The edges that fall out of that, and what to do at each:</p>
<ul>
<li><b>No runtime label checks</b>: <code>if (x instanceof List&lt;String&gt;)</code> won't compile: at runtime there's nothing to check; the label is gone. You can only ask <code>instanceof List&lt;?&gt;</code> ("is it some kind of list?").</li>
<li><b>No <code>new T()</code></b> inside a generic class: erased <code>T</code> is just <code>Object</code>; the runtime wouldn't know what to construct. The workaround you'll meet in frameworks: pass a <code>Class&lt;T&gt;</code> token or a <code>Supplier&lt;T&gt;</code> factory.</li>
<li><b>No generic arrays</b>: <code>new T[10]</code> and <code>new List&lt;String&gt;[10]</code> don't compile: arrays DO carry a runtime type and it would have to lie. The practical answer: use <code>ArrayList&lt;T&gt;</code> instead.</li>
<li><b>Raw types are a time machine</b>: writing bare <code>List</code> switches that variable back to 2003: everything returns <code>Object</code>, casts return, and the compiler only mutters warnings. Raw types exist purely for pre-generics compatibility; in new code they are always a mistake. Related warning: <i>"unchecked cast"</i> means "you're asserting a label I can't verify"; treat each one as a small debt.</li>
</ul>
<div class="codeSample" data-hl>List&lt;String&gt; a = new ArrayList&lt;&gt;();
List&lt;Integer&gt; b = new ArrayList&lt;&gt;();
a.getClass() == b.getClass();          // true! — same class at runtime, labels erased

List raw = a;                          // raw type: compiles, warns — 2003 mode
raw.add(42);                           // no label, no protection...
String s = a.get(1);                   // ...ClassCastException, back from the dead</div>
<p>The takeaway isn't "generics are fake"; it's knowing <i>where</i> the guarantee lives: in the compiler, completely, and therefore only where labels are intact. Keep every declaration parameterized and the 2003 failure mode stays extinct.</p>`,
docs:[['Type erasure — Oracle','https://docs.oracle.com/javase/tutorial/java/generics/erasure.html'],['Restrictions on generics — Oracle','https://docs.oracle.com/javase/tutorial/java/generics/restrictions.html'],['Effective Java: avoid raw types','https://dev.java/learn/generics/intro/']],
ex:{title:'Erasure edge-cases drill',lang:'text',
prompt:`One answer per numbered line: (1) at runtime, are <code>List&lt;String&gt;</code> and <code>List&lt;Integer&gt;</code> the <code>same</code> class or <code>different</code> classes? (2) the name of the mechanism that removes type labels during compilation (two words), (3) can you write <code>new T()</code> inside a generic class, <code>yes</code> or <code>no</code>? (4) the only wildcard form allowed with <code>instanceof</code> for a list (write the full type as it appears in code), (5) writing <code>List</code> with no angle brackets at all is called using a ____ type (one word), (6) the compiler warning that means "asserting a type the compiler cannot verify" (two words).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. same
2. type erasure
3. no
4. List<?>
5. raw
6. unchecked cast
`,
tests:[{d:'Q1: same class at runtime',re:'1\\.\\s*same',flags:'is'},{d:'Q2: type erasure',re:'2\\.\\s*type\\s+erasure',flags:'is'},{d:'Q3: new T() is impossible',re:'3\\.\\s*no',flags:'is'},{d:'Q4: List<?> is the checkable form',re:'4\\.\\s*List<\\?>',flags:'is'},{d:'Q5: raw type',re:'5\\.\\s*raw',flags:'is'},{d:'Q6: unchecked cast',re:'6\\.\\s*unchecked\\s+cast',flags:'is'}],
behavior:`1. same: one List class serves every label; getClass() proves it. 2. type erasure: the compiler checks, then strips. 3. no: T is Object at runtime; pass a Class<T> or Supplier<T> when construction is needed. 4. List<?>: "some list", the only runtime-checkable question. 5. raw: the pre-2004 compatibility mode, never for new code. 6. unchecked cast: the compiler admitting it cannot back your assertion.`,
hints:['Everything here is one fact wearing six disguises: labels die at compile time.','Q4: the ? wildcard asks nothing about the element type, which is exactly why it may be asked at runtime.','Q6 is the warning to treat as debt: every unchecked cast is a place the 2003 failure mode can sneak back in.']}}
]});
