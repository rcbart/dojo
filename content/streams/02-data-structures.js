STREAMS.push({icon:'🧱',title:'Data Structures',blurb:'Lists, sets, maps, sorting, stacks, queues, heaps, linked lists and hashing: the right tool, its Big-O, and building your own.',lessons:[
{id:'ds00',title:'Data structures in plain English: what, when & why',body:`
<p>Before any code: a data structure is just <b>a way to organize data so certain operations are cheap</b>. Each one is a deliberate trade: fast at some things, slow at others. Pick the wrong one and simple features crawl; pick the right one and they fly. Here is the whole toolbox in plain terms.</p>
<table class="dsCompare">
<thead><tr><th>Structure</th><th>Think of it as…</th><th>Fast operations (Big-O)</th><th>Slow / weak (Big-O)</th><th>When to use / avoid</th></tr></thead>
<tbody>
<tr><td><b>Array</b></td><td>a numbered row of lockers</td><td>access by index <b>O(1)</b></td><td>insert/remove in the middle <b>O(n)</b>; fixed size</td><td><b>Use</b> for fixed, index-addressed data. <b>Avoid</b> when it grows/shrinks in the middle.</td></tr>
<tr><td><b>Linked list</b></td><td>a chain of links</td><td>insert/remove at a known node <b>O(1)</b></td><td>random access / search <b>O(n)</b></td><td><b>Use</b> for lots of insertion/removal. <b>Avoid</b> when you need "item #500".</td></tr>
<tr><td><b>Stack</b></td><td>a pile of plates (LIFO)</td><td>push / pop <b>O(1)</b></td><td>search <b>O(n)</b>; no fair ordering</td><td><b>Use</b> when the most recent item matters. <b>Avoid</b> for work queues.</td></tr>
<tr><td><b>Queue</b></td><td>a line at a shop (FIFO)</td><td>enqueue / dequeue <b>O(1)</b></td><td>search / random access <b>O(n)</b></td><td><b>Use</b> for fair, in-order processing. <b>Avoid</b> when priority matters.</td></tr>
<tr><td><b>Hash map</b></td><td>a coat check (key → item)</td><td>lookup / insert / delete <b>O(1)</b> average</td><td>ordering & range queries; <b>O(n)</b> worst case</td><td><b>Use</b> for lookup by id/name. <b>Avoid</b> when you need sorted or range results.</td></tr>
<tr><td><b>Set</b></td><td>a bag with no duplicates</td><td>add / contains <b>O(1)</b> average</td><td>ordering / positions</td><td><b>Use</b> for "have I seen this?" / unique items. <b>Avoid</b> when order matters.</td></tr>
<tr><td><b>Tree (balanced BST)</b></td><td>a sorted family tree</td><td>search / insert / range <b>O(log n)</b></td><td>single-key speed vs a hash map (<b>O(log n)</b> &gt; <b>O(1)</b>)</td><td><b>Use</b> for sorted data + ranges. <b>Avoid</b> for exact-key-only lookup.</td></tr>
<tr><td><b>Heap</b></td><td>a bracket for the top item</td><td>peek min/max <b>O(1)</b>; push/pop <b>O(log n)</b></td><td>arbitrary search <b>O(n)</b></td><td><b>Use</b> for priority queues / top-K. <b>Avoid</b> for general search.</td></tr>
<tr><td><b>Trie</b></td><td>a tree of letters</td><td>lookup / insert <b>O(L)</b> (key length)</td><td>memory for sparse keys</td><td><b>Use</b> for prefixes / autocomplete. <b>Avoid</b> for plain key lookup.</td></tr>
<tr><td><b>Graph</b></td><td>cities and roads</td><td>traversal (BFS/DFS) <b>O(V+E)</b></td><td>overkill for simple linear data</td><td><b>Use</b> for relationships / networks. <b>Avoid</b> when a list or tree fits.</td></tr>
</tbody>
</table>
<p>💡 Those <code>O(...)</code> labels are <b>Big-O notation</b>, a shorthand for how the cost grows as the data grows: <code>O(1)</code> constant (instant), <code>O(log n)</code> logarithmic (halving), <code>O(n)</code> linear, <code>O(n log n)</code>, <code>O(n²)</code>. New to it? See the <b>"Big-O, Θ &amp; Ω: measuring cost"</b> lesson in this same Data Structures stream for the full plain-English explanation; it is the vocabulary the whole table is written in.</p>
<p><b>The one-line difference</b> people ask about most: a <b>queue</b> is a fair line (first in, first out); a <b>stack</b> is a pile (last in, first out); a <b>tree</b> is a hierarchy that keeps data sorted for fast search; a <b>hash map</b> gives instant lookup by key but in no particular order. The rest of this stream builds each one; this table is the map to come back to.</p>`,
docs:[['Choosing a data structure, overview','https://en.wikipedia.org/wiki/Data_structure'],['Java collections, Oracle','https://docs.oracle.com/javase/tutorial/collections/']],
quiz:[
{q:'Which data structure is First-In-First-Out (FIFO), like a line at a shop?',options:['Queue','Stack','Array','Heap'],answer:0,why:'A queue serves the oldest item first (FIFO), like a fair line.',whyWrong:['','A stack is LIFO: it serves the newest first, not the oldest.','An array is indexed storage, not an ordering discipline.','A heap serves the min or max first, not the oldest.']},
{q:'Which is Last-In-First-Out (LIFO), like a pile of plates?',options:['Tree','Queue','Stack','Set'],answer:2,why:'A stack returns the most recently added item first (LIFO).',whyWrong:['A tree is a hierarchy, not a LIFO ordering.','A queue is FIFO, the opposite of LIFO.','','A set is unordered and ignores duplicates.']},
{q:'You need instant lookup of a value by its key. Best choice?',options:['Array','Hash map','Linked list','Heap'],answer:1,why:'A hash map gives O(1) average lookup, insert, and delete by key.',whyWrong:['An array is looked up by numeric index, not an arbitrary key.','','A linked list must be walked from the start: O(n), not instant.','A heap is organized by priority, not keyed lookup.']},
{q:'Best structure for autocomplete / prefix search?',options:['Hash map','Queue','Trie','Stack'],answer:2,why:'A trie stores one node per character, so prefix lookups are natural and fast.',whyWrong:['A hash map matches whole keys, not prefixes.','A queue is FIFO ordering, not search.','','A stack is LIFO, not prefix search.']},
{q:'You must always grab the smallest (or largest) item quickly. Use a…',options:['Heap','Array','Set','Trie'],answer:0,why:'A heap keeps the min or max at the top: O(1) peek, O(log n) removal.',whyWrong:['','Finding the min in an array is O(n) unless you keep it sorted.','A set answers membership, not min or max.','A trie is for prefixes, not extremes.']},
{q:'Best for keeping data sorted with fast range queries (O(log n))?',options:['Hash map','Balanced tree (BST)','Stack','Array'],answer:1,why:'A balanced BST keeps keys ordered, enabling sorted iteration and range queries in O(log n).',whyWrong:['A hash map has no order, so it cannot do range queries.','','A stack only exposes the top item.','A sorted array supports ranges but insertions are O(n).']},
{q:'You want to ignore duplicates and answer "have I seen this?" fast. Use a…',options:['Array','Set','Queue','Linked list'],answer:1,why:'A set stores unique items and answers membership in O(1) average.',whyWrong:['Checking membership in an array is an O(n) scan.','','A queue is about order, not uniqueness.','A linked list also needs an O(n) scan to check membership.']},
{q:'Modeling cities connected by roads (relationships) is best done with a…',options:['Tree','Graph','Stack','Heap'],answer:1,why:'A graph models arbitrary relationships (nodes and edges), including cycles.',whyWrong:['A tree forbids cycles and allows one parent, too restrictive for a road network.','','A stack is a LIFO pile, not a network.','A heap orders by priority, not connections.']},
{q:'Cheap insert/remove in the middle, but slow to jump to item #500?',options:['Array','Linked list','Hash map','Heap'],answer:1,why:'A linked list inserts/removes at a known node cheaply but must walk from the start for random access.',whyWrong:['An array is the reverse: fast to jump to #500, slow to insert mid-array.','','A hash map has no positional "#500".','A heap has no positional indexing either.']},
{q:'Instant access by index, but costly to insert in the middle?',options:['Linked list','Queue','Array','Tree'],answer:2,why:'An array is contiguous: O(1) indexed access, but inserting mid-array shifts elements.',whyWrong:['A linked list is the reverse: cheap mid-insert, slow random access.','A queue only touches its two ends.','','A tree is reached by traversal or key, not a numeric index.']}
],
ex:{title:'Pick the right structure',
prompt:`Write class <code>Pick</code> with <code>static String structure(String need)</code>: <code>"index-fast-access"</code>→<code>"array"</code>, <code>"insert-remove-ends"</code>→<code>"linked list"</code>, <code>"last-in-first-out"</code>→<code>"stack"</code>, <code>"first-in-first-out"</code>→<code>"queue"</code>, <code>"key-value-lookup"</code>→<code>"hash map"</code>, <code>"unique-items"</code>→<code>"set"</code>, <code>"sorted-range"</code>→<code>"balanced tree"</code>, <code>"always-min-max"</code>→<code>"heap"</code>, <code>"prefix-search"</code>→<code>"trie"</code>, <code>"network-relationships"</code>→<code>"graph"</code>, and <code>"unknown"</code> otherwise.`,
starter:`public class Pick {
    static String structure(String need) {
        return null;
    }
}`,
solution:`public class Pick {
    static String structure(String need) {
        switch (need) {
            case "index-fast-access":     return "array";
            case "insert-remove-ends":    return "linked list";
            case "last-in-first-out":     return "stack";
            case "first-in-first-out":    return "queue";
            case "key-value-lookup":      return "hash map";
            case "unique-items":          return "set";
            case "sorted-range":          return "balanced tree";
            case "always-min-max":        return "heap";
            case "prefix-search":         return "trie";
            case "network-relationships": return "graph";
            default:                      return "unknown";
        }
    }
}`,
tests:[{d:'index access -> array',re:'"index-fast-access".*?"array"',flags:'s'},{d:'LIFO -> stack',re:'"last-in-first-out".*?"stack"',flags:'s'},{d:'FIFO -> queue',re:'"first-in-first-out".*?"queue"',flags:'s'},{d:'key lookup -> hash map',re:'"key-value-lookup".*?"hash map"',flags:'s'},{d:'sorted range -> balanced tree',re:'"sorted-range".*?"balanced tree"',flags:'s'},{d:'min/max -> heap',re:'"always-min-max".*?"heap"',flags:'s'},{d:'prefix -> trie',re:'"prefix-search".*?"trie"',flags:'s'},{d:'relationships -> graph',re:'"network-relationships".*?"graph"',flags:'s'},{d:'unknown default',re:'"unknown"'}],
behavior:`structure("first-in-first-out") is "queue", structure("last-in-first-out") is "stack", structure("key-value-lookup") is "hash map", structure("sorted-range") is "balanced tree". Matching the need to the structure is the core skill this stream builds.`,
hints:['FIFO is a queue (a fair line); LIFO is a stack (a pile).','Exact-key lookup wants a hash map; sorted/range wants a balanced tree.','Min/max on demand is a heap; prefixes are a trie; connections are a graph.']}},
{id:'ds0',title:'Lists, Sets & Maps: choosing the collection',body:`
<p>🌱 <b>Starting from zero:</b> "data structure" sounds grand but means something homely: <i>the shape you store things in</i>. A shopping list, a guest list and a phone book are three different shapes for three different needs, and choosing the wrong one (looking up phone numbers by reading the whole book top to bottom) is where slow software comes from. This stream is about matching the shape to the need; it starts with Java\u0027s big three.</p>
<p>Ninety percent of Java data handling is picking the right one of these three interfaces; each answers a different question:</p>
<ul>
<li><b>List</b>: "an <i>ordered sequence</i>, duplicates allowed, I care about position." <code>ArrayList</code>: backed by an array: O(1) get by index, O(1) amortized append, O(n) middle insert. <code>LinkedList</code>: O(1) ends, O(n) index. Default to <code>ArrayList</code>.</li>
<li><b>Set</b>: "a collection of <i>unique</i> things, does X exist?" <code>HashSet</code>: O(1) add/contains, no order. <code>LinkedHashSet</code>: O(1) + insertion order. <code>TreeSet</code>: O(log n), kept sorted, supports ranges (<code>headSet</code>/<code>ceiling</code>).</li>
<li><b>Map</b>: "<i>key → value</i> lookups." <code>HashMap</code>: O(1), no order. <code>LinkedHashMap</code>: O(1) + insertion/access order (your LRU). <code>TreeMap</code>: O(log n), sorted by key, range queries.</li>
</ul>
<div class="codeSample" data-hl>List&lt;String&gt; log = new ArrayList&lt;&gt;();        // ordered, indexable, dup-friendly
Set&lt;String&gt;  seen = new HashSet&lt;&gt;();         // "have I processed this id?"
Map&lt;String,Integer&gt; counts = new HashMap&lt;&gt;();// "how many per key?"

// the decision in one breath:
// need order/index?      -&gt; List
// need uniqueness / membership test?  -&gt; Set
// need lookup by key?    -&gt; Map
// need it SORTED?        -&gt; TreeSet / TreeMap
// need INSERTION order?  -&gt; LinkedHashSet / LinkedHashMap</div>
<p>Golden habit: program to the <i>interface</i> (<code>List&lt;X&gt; xs = new ArrayList&lt;&gt;()</code>), so swapping the implementation is one word. And know why HashSet/HashMap are O(1): they hash the element/key to a bucket, which is why your keys must honor the equals/hashCode contract (later lesson).</p>`,
docs:[['Collections overview, Oracle','https://docs.oracle.com/javase/tutorial/collections/intro/index.html'],['Choosing an implementation, Oracle','https://docs.oracle.com/javase/tutorial/collections/implementations/index.html']],
exs:[
{title:'Pick List, Set, Map',
prompt:`Write <code>Pick</code> with three methods proving you chose the right structure: <code>static java.util.List&lt;String&gt; ordered(java.util.List&lt;String&gt; in)</code> returns a NEW ArrayList with the same items in order (duplicates kept); <code>static java.util.Set&lt;String&gt; unique(java.util.List&lt;String&gt; in)</code> returns a HashSet of the distinct items; <code>static java.util.Map&lt;String,Integer&gt; counts(java.util.List&lt;String&gt; in)</code> returns a HashMap of item→occurrences.`,
starter:`import java.util.*;

public class Pick {
    static List<String> ordered(List<String> in) {
        return null;
    }
    static Set<String> unique(List<String> in) {
        return null;
    }
    static Map<String, Integer> counts(List<String> in) {
        return null;
    }
}`,
tests:[{d:'ordered returns an ArrayList copy',re:'new\\s+ArrayList<>\\s*\\(\\s*in\\s*\\)'},{d:'unique uses a HashSet',re:'new\\s+HashSet<>\\s*\\('},{d:'counts uses a HashMap',re:'new\\s+HashMap<'},{d:'counts tallies with merge/getOrDefault',re:'merge\\s*\\(|getOrDefault\\s*\\('}],
behavior:`1. ordered([a,a,b]) == [a,a,b] (order + dupes preserved), and is a distinct object from the input. 2. unique([a,a,b]) has size 2, contains a and b. 3. counts([a,a,b]) == {a=2, b=1}. 4. Each method's choice matches its guarantee; that IS the exercise.`,
hints:['ordered is one line: <code>return new ArrayList&lt;&gt;(in);</code>','unique is one line: <code>return new HashSet&lt;&gt;(in);</code>','counts: loop and <code>map.merge(item, 1, Integer::sum);</code>'],
solution:`import java.util.*;

public class Pick {
    static List<String> ordered(List<String> in) {
        return new ArrayList<>(in);
    }
    static Set<String> unique(List<String> in) {
        return new HashSet<>(in);
    }
    static Map<String, Integer> counts(List<String> in) {
        Map<String, Integer> m = new HashMap<>();
        for (String s : in) m.merge(s, 1, Integer::sum);
        return m;
    }
}`},
{title:'Sorted vs insertion order',
prompt:`Show you know the ordered variants. Write <code>Ordered</code> with: <code>static java.util.Set&lt;String&gt; sorted(java.util.Collection&lt;String&gt; in)</code> returning a <code>TreeSet</code> (sorted, unique) and <code>static java.util.Map&lt;String,Integer&gt; firstSeenOrder(java.util.List&lt;String&gt; in)</code> returning a <code>LinkedHashMap</code> counting occurrences while preserving first-seen key order.`,
starter:`import java.util.*;

public class Ordered {
    static Set<String> sorted(Collection<String> in) {
        return null;
    }
    static Map<String, Integer> firstSeenOrder(List<String> in) {
        return null;
    }
}`,
tests:[{d:'sorted uses TreeSet',re:'new\\s+TreeSet<>\\s*\\('},{d:'firstSeenOrder uses LinkedHashMap',re:'new\\s+LinkedHashMap<'},{d:'Counts occurrences',re:'merge\\s*\\(|getOrDefault\\s*\\('}],
behavior:`1. sorted(["banana","apple","apple"]) iterates as [apple, banana]: sorted and de-duplicated. 2. firstSeenOrder(["b","a","b"]) iterates keys in order b, a (first-seen) with {b=2, a=1}. 3. Swapping TreeSet→HashSet would lose the sort; LinkedHashMap→HashMap would lose the order; the class choice is the whole point.`,
hints:['<code>return new TreeSet&lt;&gt;(in);</code>. A TreeSet sorts and de-dupes for free.','LinkedHashMap remembers insertion order of keys; merge on a new key appends it at the end.','Everything else is the same counting loop you already know.'],
solution:`import java.util.*;

public class Ordered {
    static Set<String> sorted(Collection<String> in) {
        return new TreeSet<>(in);
    }
    static Map<String, Integer> firstSeenOrder(List<String> in) {
        Map<String, Integer> m = new LinkedHashMap<>();
        for (String s : in) m.merge(s, 1, Integer::sum);
        return m;
    }
}`}
]},
{id:'ds0b',title:'Sorting, comparators & merging',body:`
<p>Sorting is O(n log n) and built in; you rarely write the algorithm, you write the <b>ordering</b>:</p>
<div class="codeSample" data-hl>List&lt;String&gt; xs = new ArrayList&lt;&gt;(List.of("bb", "a", "ccc"));
Collections.sort(xs);                         // natural order (Comparable)
xs.sort(Comparator.naturalOrder());
xs.sort(Comparator.comparingInt(String::length));         // by a key
xs.sort(Comparator.comparingInt(String::length)
                  .thenComparing(Comparator.naturalOrder())); // tie-break
xs.sort(Comparator.reverseOrder());

int[] a = {3,1,2};  Arrays.sort(a);            // primitive arrays: dual-pivot quicksort

record Person(String name, int age) {}
people.sort(Comparator.comparingInt(Person::age).reversed()
                      .thenComparing(Person::name));</div>
<p>Under the hood: <code>Arrays.sort</code> on objects uses TimSort (stable, O(n log n)); on primitives, dual-pivot quicksort (not stable, but primitives have no identity so it cannot matter). <b>Comparable</b> is a type's one natural order (<code>implements Comparable&lt;T&gt;</code>, define <code>compareTo</code>); <b>Comparator</b> is any number of external orders, defined outside the type.</p>

<h4>Stability, and why thenComparing works</h4>
<p>A sort is <b>stable</b> when equal elements keep their original relative order. That is not a detail; it is what makes layered sorting possible. Sort by name, then stably sort by department, and inside each department the names are still in order. Java's object sort is stable, so <code>thenComparing</code> chains and repeated sorts both behave the way you expect. An unstable sort silently scrambles the previous pass.</p>

<h4>The comparator contract is enforced, and violating it throws</h4>
<p>A comparator must be consistent: if a &lt; b and b &lt; c then a &lt; c, and <code>compare(a,b)</code> must be the exact negation of <code>compare(b,a)</code>. The classic way to break it is subtraction:</p>
<div class="codeSample">(a, b) -&gt; a.age() - b.age()        // OVERFLOWS: 2_000_000_000 - (-2_000_000_000)
(a, b) -&gt; Integer.compare(a.age(), b.age())   // correct, always</div>
<p>TimSort detects an inconsistent comparator part-way through and throws <code>IllegalArgumentException: Comparison method violates its general contract!</code>, a real production failure that appears only on large inputs, because small arrays take a simpler code path that never notices. Comparators built from <code>comparing</code>, <code>comparingInt</code> and <code>thenComparing</code> are correct by construction, which is the argument for using them rather than hand-writing the lambda.</p>
<p>Nulls need a decision, not luck: <code>Comparator.nullsFirst(Comparator.naturalOrder())</code> states where they go instead of throwing a <code>NullPointerException</code> mid-sort.</p>

<h4>Merging: the O(n) half of merge sort</h4>
<p>Two already-sorted sequences combine in a single pass with two pointers: take whichever head is smaller, advance that side. It is the operation underneath merge sort, and the reason a database can combine sorted index ranges, a log tool can merge rotated files by timestamp, and <code>sort -m</code> exists. Sorting the concatenation instead would cost O(n log n) and throw away the ordering you already had.</p>`,
docs:[['Comparator, API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Comparator.html'],['Object ordering, Oracle','https://docs.oracle.com/javase/tutorial/collections/interfaces/order.html']],
exs:[
{title:'Multi-key comparator',
prompt:`Given <code>record Person(String name, int age)</code>, write <code>People.sorted(java.util.List&lt;Person&gt; in)</code> returning a NEW list sorted by <b>age descending</b>, breaking ties by <b>name ascending</b>, using <code>Comparator</code> chaining (<code>comparingInt</code>, <code>reversed</code>, <code>thenComparing</code>). Do not mutate the input.`,
starter:`import java.util.*;

record Person(String name, int age) {}

public class People {
    static List<Person> sorted(List<Person> in) {
        return null;
    }
}`,
tests:[{d:'Copies before sorting (no mutation)',re:'new\\s+ArrayList<>\\s*\\(\\s*in\\s*\\)'},{d:'Sorts by age',re:'comparingInt\\s*\\(\\s*Person::age\\s*\\)'},{d:'Descending on age',re:'reversed\\s*\\(\\s*\\)'},{d:'Tie-breaks on name',re:'thenComparing\\s*\\(\\s*Person::name\\s*\\)'}],
behavior:`1. [(Al,30),(Bo,30),(Cy,40)] → [(Cy,40),(Al,30),(Bo,30)]: 40 first, then the two 30s alphabetically. 2. The input list is unchanged (you sorted a copy). 3. Ties resolve by name ascending, deterministically.`,
hints:['Copy first: <code>List&lt;Person&gt; out = new ArrayList&lt;&gt;(in);</code>','Build the comparator: <code>Comparator.comparingInt(Person::age).reversed().thenComparing(Person::name)</code>','out.sort(thatComparator); return out;'],
solution:`import java.util.*;

record Person(String name, int age) {}

public class People {
    static List<Person> sorted(List<Person> in) {
        List<Person> out = new ArrayList<>(in);
        out.sort(Comparator.comparingInt(Person::age).reversed()
                           .thenComparing(Person::name));
        return out;
    }
}`},
{title:'Merge two sorted lists (the core of merge sort)',
prompt:`Write <code>Merger.merge(java.util.List&lt;Integer&gt; a, java.util.List&lt;Integer&gt; b)</code> where both inputs are sorted ascending: return one sorted list via the O(n+m) <b>two-pointer merge</b> (compare heads, take the smaller, advance; then drain the remainder). No calls to <code>sort</code>.`,
starter:`import java.util.*;

public class Merger {
    static List<Integer> merge(List<Integer> a, List<Integer> b) {
        return null;
    }
}`,
tests:[{d:'Two index cursors',re:'int\\s+i\\s*=\\s*0\\s*,\\s*j\\s*=\\s*0|i\\s*=\\s*0[\\s\\S]*?j\\s*=\\s*0'},{d:'Head comparison',re:'a\\.get\\s*\\(\\s*i\\s*\\)\\s*<=?\\s*b\\.get\\s*\\(\\s*j\\s*\\)'},{d:'Drains both remainders',re:'while\\s*\\(\\s*i\\s*<\\s*a\\.size\\s*\\(\\s*\\)\\s*\\)[\\s\\S]*?while\\s*\\(\\s*j\\s*<\\s*b\\.size\\s*\\(\\s*\\)\\s*\\)'},{d:'No sort call',re:'\\.sort\\s*\\(|Collections\\.sort',not:true}],
behavior:`1. merge([1,3,5],[2,4]) == [1,2,3,4,5]. 2. merge([],[1]) == [1]. 3. merge([1,1],[1]) == [1,1,1] (stable, duplicates kept). 4. O(n+m): each element consumed once, the operation merge sort is built on.`,
hints:['Cursors i and j; a result list; loop while both have elements.','Take the smaller head: <code>if (a.get(i) <= b.get(j)) out.add(a.get(i++)); else out.add(b.get(j++));</code>','Two drain loops afterward; only one runs.'],
solution:`import java.util.*;

public class Merger {
    static List<Integer> merge(List<Integer> a, List<Integer> b) {
        List<Integer> out = new ArrayList<>();
        int i = 0, j = 0;
        while (i < a.size() && j < b.size()) {
            if (a.get(i) <= b.get(j)) out.add(a.get(i++));
            else out.add(b.get(j++));
        }
        while (i < a.size()) out.add(a.get(i++));
        while (j < b.size()) out.add(b.get(j++));
        return out;
    }
}`},
{title:'Order, tie-break and leave the input alone',lang:'js',diff:'medium',
run:{call:'sortByLengthThenAlpha',cases:[{name:'shorter first, alphabetical within a length',args:[['bb','a','ccc','ab']],expect:['a','ab','bb','ccc']},{name:'the input array is not modified',args:[['bb','a','ccc','ab']],expect:['a','ab','bb','ccc']},{name:'already ordered stays ordered',args:[['a','bb','ccc']],expect:['a','bb','ccc']},{name:'all the same length falls back to alphabetical',args:[['dd','aa','cc']],expect:['aa','cc','dd']},{name:'an empty list sorts to an empty list',args:[[]],expect:[]}]},
prompt:`The same ordering logic, executed for real. Write <code>function sortByLengthThenAlpha(words)</code> returning a <b>new</b> array sorted by length ascending, breaking ties alphabetically. Do not modify the array you were given: <code>Array.prototype.sort</code> sorts in place, so copy first. This is <code>comparingInt(String::length).thenComparing(naturalOrder())</code> expressed in the language the engine can execute.`,
starter:`function sortByLengthThenAlpha(words) {
  return [];
}`,
solution:`function sortByLengthThenAlpha(words) {
  // copy first: sort() mutates, and callers rarely expect that
  return [...words].sort((a, b) => a.length - b.length || (a < b ? -1 : a > b ? 1 : 0));
}`,
tests:[{d:'the input is copied before sorting',re:'\\[\\.\\.\\.|slice\\s*\\(|concat\\s*\\('},{d:'length is the primary key',re:'a\\.length\\s*-\\s*b\\.length|length\\s*-\\s*'},{d:'a tie-break follows the primary key',re:'\\|\\||if\\s*\\('},{d:'a comparator function is supplied to sort',re:'sort\\s*\\(\\s*\\('}],
behavior:`Five cases execute in a worker. The second case is the one that catches real bugs: sort() sorts in place and returns the same array, so a solution that omits the copy passes every ordering case while quietly rewriting its caller's data. The tie-break case shows why thenComparing exists: without it, equal-length words come back in whatever order the sort happened to leave them, which is stable in Java and unspecified in general. Note the comparator returns a NUMBER, not a boolean: returning true/false is the most common JavaScript sorting bug, and it produces almost-sorted output that looks right on small inputs.`,
hints:['Copy with a spread or slice before sorting.','A comparator returns a negative number, zero, or a positive number, never a boolean.','The || operator chains comparators: if the first is 0 (a tie), the second decides.']}]},
{id:'ds1',title:'Stacks: LIFO thinking',body:`
<p>🌱 <b>Starting from zero:</b> picture a stack of plates: you add to the top and take from the top, so the LAST plate added is the FIRST one back. That "last in, first out" shape appears everywhere in computing: the undo history in your editor, the back button, unwinding nested steps.</p>
<p>A stack is last-in-first-out: <code>push</code>, <code>pop</code>, <code>peek</code>. It models anything nested or reversible: undo history, call stacks, parsing, backtracking.</p>
<div class="codeSample" data-hl>Deque&lt;String&gt; stack = new ArrayDeque&lt;&gt;();   // THE stack in modern Java
stack.push("a");                             // add on top
stack.push("b");
stack.peek();                                // "b", look, don't take
stack.pop();                                 // "b", take from top
stack.isEmpty();

// java.util.Stack exists but is LEGACY: it extends Vector (synchronized,
// slow) and exposes index access that breaks the LIFO contract. Use ArrayDeque.</div>
<p>All three core operations are O(1), because all of them touch one end of an array and nothing else moves.</p>

<h4>The call stack is this data structure</h4>
<p>Every method call pushes a <b>stack frame</b> holding its parameters, local variables and return address; returning pops it. That is why local variables vanish on return, why a stack trace reads innermost-call-first, and why unbounded recursion produces <code>StackOverflowError</code>: the thread's stack is a fixed-size region, typically around 512KB to 1MB, and frames are pushed until it is full. Reading a stack trace is reading this structure top-down.</p>

<h4>Where stacks show up in real code</h4>
<ul>
<li><b>Matching and parsing.</b> Brackets, XML/HTML tags, nested JSON: push the opener, pop and compare on the closer. Valid only if the stack ends <i>empty</i>, which is the check people forget.</li>
<li><b>Undo/redo.</b> Two stacks: undo pops from one and pushes onto the other. Redo is discarded on a new action, which is exactly what popping the redo stack empty means.</li>
<li><b>Backtracking.</b> Depth-first search, maze solving and constraint solvers push a choice, explore, and pop to try the next; an explicit stack is how you convert a recursive DFS into an iterative one when depth would overflow the call stack.</li>
<li><b>Expression evaluation.</b> Shunting-yard and every RPN calculator: operands on one stack, operators on another.</li>
</ul>

<h4>The traps</h4>
<p><code>ArrayDeque</code> rejects <code>null</code>, deliberately, because <code>poll()</code> returns <code>null</code> to mean "empty", and allowing null elements would make the two indistinguishable. <code>pop()</code> on an empty deque throws <code>NoSuchElementException</code>, while <code>poll()</code> returns null: pick the one whose failure mode you want. And a stack of unbounded size is a memory leak waiting for an adversarial input; parsers that accept untrusted nesting need a depth limit.</p>`,
docs:[['Deque, API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Deque.html'],['ArrayDeque, API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ArrayDeque.html']],
exs:[{title:'Balanced brackets',
prompt:`Write <code>Brackets</code> with <code>static boolean balanced(String s)</code> using an <code>ArrayDeque&lt;Character&gt;</code> as a stack: push each opener <code>( [ {</code>; on each closer, the stack must be non-empty and its top must be the matching opener (pop and check); ignore all other characters; return true iff the stack is empty at the end.`,
starter:`import java.util.*;

public class Brackets {
    static boolean balanced(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        // push openers; pop & match closers; other chars ignored
        return false;
    }
}`,
tests:[{d:'ArrayDeque as the stack (not java.util.Stack)',re:'new\\s+ArrayDeque<'},{d:'Pushes openers',re:'\\.push\\s*\\('},{d:'Pops and compares on closers',re:'\\.pop\\s*\\(\\s*\\)'},{d:'Empty-stack guard before popping',re:'isEmpty\\s*\\(\\s*\\)'},{d:'No java.util.Stack',re:'new\\s+Stack<',not:true}],
behavior:`1. balanced("(a[b]{c})") == true. 2. balanced("(]") == false (mismatch). 3. balanced("((") == false (leftover openers). 4. balanced(")") == false (closer on empty stack: the guard matters). 5. balanced("no brackets") == true.`,
hints:['Loop chars: <code>for (char c : s.toCharArray())</code>. Push on ( [ {, handle ) ] }, skip the rest.','On a closer: <code>if (stack.isEmpty() || stack.pop() != expectedOpener) return false;</code>','A tidy trick: when you see an opener, push its MATCHING CLOSER; then every closer just needs <code>stack.pop() != c</code> → false.'],
solution:`import java.util.*;

public class Brackets {
    static boolean balanced(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            switch (c) {
                case '(' -> stack.push(')');
                case '[' -> stack.push(']');
                case '{' -> stack.push('}');
                case ')', ']', '}' -> {
                    if (stack.isEmpty() || stack.pop() != c) return false;
                }
                default -> {}
            }
        }
        return stack.isEmpty();
    }
}`},
{title:'Balanced brackets, executed',lang:'js',diff:'medium',
run:{call:'balanced',cases:[{name:'properly nested',args:['{[()]}'],expect:true},{name:'closer does not match its opener',args:['(]'],expect:false},{name:'never closed, the stack is not empty at the end',args:['(('],expect:false},{name:'a closer with nothing open',args:[')('],expect:false},{name:'empty input is balanced',args:[''],expect:true},{name:'brackets inside other text',args:['a(b[c]d)e'],expect:true}]},
prompt:`Write <code>function balanced(s)</code> returning <code>true</code> when every <code>(</code>, <code>[</code> and <code>{</code> is closed by its matching partner in the right order. Ignore any other characters. Push openers, pop and compare on closers, and remember the final check: anything left on the stack means something was never closed.`,
starter:`function balanced(s) {
  return false;
}`,
solution:`function balanced(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') stack.push(ch);
    else if (pairs[ch]) {
      if (stack.pop() !== pairs[ch]) return false;   // wrong partner, or empty
    }
  }
  return stack.length === 0;                          // nothing may be left open
}`,
tests:[{d:'openers are pushed',re:'push\\s*\\('},{d:'closers pop and compare',re:'pop\\s*\\('},{d:'the end state is checked',re:'length\\s*===\\s*0|length\\s*==\\s*0|!stack\\.length'},{d:'a pairing table or explicit comparison exists',re:'pairs|===\\s*[\x27"]\\(|match'}],
behavior:`Six cases run for real. Two of them are the ones that separate a working solution from a plausible one: "((" is rejected only if you check that the stack is EMPTY at the end, and ")(" is rejected only if popping an empty stack counts as a mismatch; in JavaScript pop() on an empty array returns undefined, which correctly fails the comparison, but a solution that checks length before popping and then continues would wrongly accept it. The "brackets inside other text" case makes sure you ignore irrelevant characters rather than treating them as errors.`,
hints:['A plain array is a stack: push() and pop().','Map each closer to the opener it requires, then compare what you popped.','Two ways to fail: the wrong partner comes off the stack, or something is still on it at the end.']}]},
{id:'ds2',title:'Queues & deques: FIFO and sliding windows',body:`
<p>🌱 <b>Starting from zero:</b> a queue is the line at a checkout: first come, first served. Where the plate-stack reverses order, the queue preserves it, which makes it the shape of fairness: things are handled in the order they arrived.</p>
<p>A queue is first-in-first-out: task queues, BFS, buffering. A <b>deque</b> (double-ended queue) does both ends in O(1) and therefore impersonates stacks, queues and sliding windows.</p>
<div class="codeSample" data-hl>Queue&lt;Task&gt; q = new ArrayDeque&lt;&gt;();
q.offer(task);          // enqueue (returns false when full, add() throws)
q.peek();               // head, or null when empty (element() throws)
q.poll();               // dequeue, or null when empty (remove() throws)

Deque&lt;Integer&gt; d = new ArrayDeque&lt;&gt;();
d.addFirst(1); d.addLast(2); d.pollFirst(); d.pollLast();

// classic pattern: keep only the last N items (bounded history)
void record(Deque&lt;String&gt; history, String event, int max) {
    history.addLast(event);
    if (history.size() &gt; max) history.pollFirst();   // evict oldest
}</div>

<h4>Two API families, and why both exist</h4>
<p>Every queue operation comes in two flavors: <code>offer/poll/peek</code> return a sentinel (<code>false</code> or <code>null</code>) on failure, and <code>add/remove/element</code> throw. Neither is better; they encode whether "empty" is an expected condition or a bug. A worker draining a queue expects empty and uses <code>poll</code>; code that has just checked <code>size()</code> and must find an element uses <code>remove</code> so a violated assumption fails loudly. Mixing them in one class is how a NoSuchElementException reaches production.</p>

<h4>ArrayDeque is a circular buffer, and that is why it wins</h4>
<p>Underneath is an array with a head index and a tail index that wrap around. Adding at either end writes one slot and moves one index: no shifting, no per-element allocation. <code>LinkedList</code> also implements <code>Deque</code>, and it allocates a node object per element with two pointers each: worse memory, worse cache locality, and slower in practice for every operation except splicing in the middle, which you almost never do. The rule of thumb: <b>ArrayDeque unless you have measured a reason.</b></p>

<h4>Where queues are the whole design</h4>
<ul>
<li><b>Breadth-first search</b> is DFS with a queue instead of a stack; that one substitution is the difference between "any path" and "shortest path in an unweighted graph".</li>
<li><b>Producer/consumer.</b> <code>BlockingQueue</code> from the concurrency stream is this interface plus waiting, and it is where a bounded queue becomes <b>backpressure</b>: a full queue blocks the producer, which is the system telling you it cannot keep up. An unbounded queue instead absorbs the overload silently until the heap does not.</li>
<li><b>Sliding windows.</b> A deque holding the last N events, or the indices of candidate maxima, answers "the last minute of traffic" in constant time per event.</li>
</ul>`,
docs:[['Queue, API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Queue.html'],['Queue implementations, Oracle tutorial','https://docs.oracle.com/javase/tutorial/collections/implementations/queue.html']],
exs:[{title:'A bounded history',
prompt:`Write <code>History</code> with a private <code>Deque&lt;String&gt; events = new ArrayDeque&lt;&gt;()</code> and a constructor taking <code>int capacity</code>: method <code>void record(String event)</code> appends with <code>addLast</code> and evicts the oldest with <code>pollFirst</code> when size exceeds capacity; <code>java.util.List&lt;String&gt; latest()</code> returns the events oldest→newest as a new ArrayList; <code>String newest()</code> returns <code>peekLast()</code>.`,
starter:`import java.util.*;

public class History {
    private final Deque<String> events = new ArrayDeque<>();
    private final int capacity;

    public History(int capacity) {
        this.capacity = capacity;
    }

    void record(String event) {
    }

    List<String> latest() {
        return null;
    }

    String newest() {
        return null;
    }
}`,
tests:[{d:'Appends at the tail',re:'addLast\\s*\\(\\s*event\\s*\\)'},{d:'Evicts oldest when over capacity',re:'size\\s*\\(\\s*\\)\\s*>\\s*capacity[\\s\\S]*?pollFirst\\s*\\(\\s*\\)'},{d:'latest copies into a List',re:'new\\s+ArrayList<>\\s*\\(\\s*events\\s*\\)'},{d:'newest peeks, does not remove',re:'peekLast\\s*\\(\\s*\\)'}],
behavior:`1. capacity 3: record a,b,c,d → latest() == [b,c,d] (a evicted). 2. newest() == "d" and calling it twice returns "d" twice (peek ≠ poll). 3. latest() returns a copy; mutating it does not touch the history. 4. Order in latest() is oldest first (deque iteration order).`,
hints:['record is two lines: addLast, then <code>if (events.size() > capacity) events.pollFirst();</code>','ArrayDeque iterates first→last, so <code>new ArrayList&lt;&gt;(events)</code> is already oldest→newest.','peekLast looks without removing; pollLast would eat your newest event.'],
solution:`import java.util.*;

public class History {
    private final Deque<String> events = new ArrayDeque<>();
    private final int capacity;

    public History(int capacity) {
        this.capacity = capacity;
    }

    void record(String event) {
        events.addLast(event);
        if (events.size() > capacity) {
            events.pollFirst();
        }
    }

    List<String> latest() {
        return new ArrayList<>(events);
    }

    String newest() {
        return events.peekLast();
    }
}`},
{title:'A bounded history, executed',lang:'js',diff:'easy',
run:{call:'record',cases:[{name:'under the limit, nothing is evicted',args:[['a'],'b',3],expect:['a','b']},{name:'at the limit, the oldest goes',args:[['a','b','c'],'d',3],expect:['b','c','d']},{name:'an empty history takes the first event',args:[[],'a',2],expect:['a']},{name:'a limit of one keeps only the newest',args:[['a'],'b',1],expect:['b']},{name:'the caller\x27s array is not modified',args:[['a','b','c'],'d',3],expect:['b','c','d']}]},
prompt:`Write <code>function record(history, event, max)</code> returning a <b>new</b> array containing the history with <code>event</code> appended, truncated to at most <code>max</code> entries by dropping the <b>oldest</b>. This is the bounded-history deque pattern above: add at one end, evict from the other.`,
starter:`function record(history, event, max) {
  return [];
}`,
solution:`function record(history, event, max) {
  const out = [...history, event];        // copy, then append at the tail
  while (out.length > max) out.shift();   // evict from the head
  return out;
}`,
tests:[{d:'the event is appended',re:'\\.\\.\\.|concat|push'},{d:'the oldest entry is removed from the front',re:'shift\\s*\\(|slice\\s*\\('},{d:'the size limit is enforced',re:'>\\s*max|length\\s*-\\s*max'},{d:'a new array is returned',re:'return\\s+out|return\\s+\\['}],
behavior:`Five real cases. The max=1 case is the one that catches an off-by-one: evicting only when length is strictly greater than max keeps exactly max items, while evicting on >= keeps max-1 and looks almost right. The final case checks you copied rather than mutating, the same discipline as the sorting exercise, and the reason both appear early. Note that shift() on a JavaScript array is O(n), which is fine for a small bounded history and exactly what ArrayDeque avoids in Java by moving an index instead of the elements.`,
hints:['Copy the history, then append the new event to the copy.','Evict from the FRONT, the oldest entry, until the length fits.','Strictly greater than max, not greater or equal.']}]},
{id:'ds3',title:'PriorityQueue: heaps & top-K',body:`
<p>🌱 <b>Starting from zero:</b> an emergency room does not treat patients first-come-first-served; the most urgent case jumps the line. A <b>priority queue</b> is that triage desk as a data structure: whatever you put in, the most important item is always the one that comes out next.</p>
<p>A <code>PriorityQueue</code> always serves the <i>smallest</i> element first (a binary min-heap): O(log n) insert and remove, O(1) peek. It powers schedulers, Dijkstra, merge-K and the top-K pattern below.</p>
<div class="codeSample" data-hl>PriorityQueue&lt;Integer&gt; minHeap = new PriorityQueue&lt;&gt;();
PriorityQueue&lt;Integer&gt; maxHeap = new PriorityQueue&lt;&gt;(Comparator.reverseOrder());
PriorityQueue&lt;Trade&gt; byAmount =
    new PriorityQueue&lt;&gt;(Comparator.comparingLong(Trade::amountCents));

// TOP-K LARGEST of a huge stream, keep a min-heap of size k:
PriorityQueue&lt;Integer&gt; heap = new PriorityQueue&lt;&gt;();   // min at the top
for (int x : stream) {
    heap.offer(x);
    if (heap.size() &gt; k) heap.poll();   // evict the smallest survivor
}
// heap now holds the k largest, O(n log k), constant memory</div>

<h4>What a binary heap actually is</h4>
<p>Not a tree of objects but an <b>array</b> interpreted as a complete binary tree, where the children of index <code>i</code> live at <code>2i+1</code> and <code>2i+2</code>. The only invariant is that a parent is never larger than its children (for a min-heap); siblings are unordered, which is why the structure is cheap to maintain. Insert appends at the end and <i>sifts up</i> while it is smaller than its parent; remove takes the root, moves the last element into its place and <i>sifts down</i>. Both walk one root-to-leaf path, so both are O(log n), and no pointers or allocations are involved.</p>
<p>That weak invariant is the whole trade. A sorted list gives O(1) access to the minimum but O(n) insertion; a heap gives O(log n) for both, and it never pays to fully order elements you will discard.</p>

<h4>Top-K: why the heap is inverted</h4>
<p>To keep the <b>k largest</b>, you hold a <b>min</b>-heap of size k. The root is then the weakest of your current champions, so each new element is compared against it in O(1) and the loser is evicted. Reaching for a max-heap here is the classic inversion error: it puts the biggest item where you can remove it, which is precisely the item you want to keep. The payoff is memory (O(k) rather than O(n)), which is what lets you take the top 100 of a billion-row stream on a laptop.</p>

<h4>The traps</h4>
<ul>
<li><b>Iteration is not sorted.</b> <code>for (x : pq)</code> walks the backing array in heap order. Only repeated <code>poll()</code> yields sorted output, and it empties the queue.</li>
<li><b>Ties are unspecified.</b> Equal priorities come out in no defined order; if fairness matters, add a sequence number to the comparator as a tie-break.</li>
<li><b>Unbounded by default.</b> A PriorityQueue grows until the heap does. A scheduler fed faster than it drains needs a cap and a rejection policy, not optimism.</li>
<li>It rejects <code>null</code>, for the same reason ArrayDeque does.</li>
</ul>`,
docs:[['PriorityQueue, API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/PriorityQueue.html'],['Comparator, API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Comparator.html']],
exs:[{title:'Top-K trades',
prompt:`Write <code>TopK</code> with <code>static java.util.List&lt;Long&gt; largest(java.util.List&lt;Long&gt; amounts, int k)</code>: min-heap <code>PriorityQueue&lt;Long&gt;</code>, offer each amount, <code>poll()</code> whenever size exceeds k, then drain the heap into a list and sort it <b>descending</b> before returning.`,
starter:`import java.util.*;

public class TopK {
    static List<Long> largest(List<Long> amounts, int k) {
        PriorityQueue<Long> heap = new PriorityQueue<>();
        // offer + bound to k, then drain & sort desc
        return null;
    }
}`,
tests:[{d:'Min-heap (no reverseOrder on the heap itself)',re:'new\\s+PriorityQueue<>\\s*\\(\\s*\\)'},{d:'Bounds the heap to k with poll',re:'size\\s*\\(\\s*\\)\\s*>\\s*k[\\s\\S]*?\\.poll\\s*\\(\\s*\\)'},{d:'Drains the heap (poll loop or addAll)',re:'while\\s*\\(\\s*!\\s*heap\\.isEmpty\\s*\\(\\s*\\)\\s*\\)|new\\s+ArrayList<>\\s*\\(\\s*heap\\s*\\)'},{d:'Sorts result descending',re:'reverseOrder\\s*\\(\\s*\\)|\\.reversed\\s*\\(\\s*\\)'}],
behavior:`1. largest([5,1,9,3,7], 3) == [9,7,5]. 2. largest(list, k) where k >= list size returns everything, descending. 3. Works on millions of amounts holding only k in memory; that is the point versus "sort everything". 4. The heap is a MIN-heap even though we want the largest: the eviction does the selection.`,
hints:['The bound: after each offer, <code>if (heap.size() > k) heap.poll();</code> throws away the smallest; survivors are the big ones.','Drain: <code>List&lt;Long&gt; out = new ArrayList&lt;&gt;(heap);</code> then sort, or poll into the list.','Descending sort: <code>out.sort(Comparator.reverseOrder());</code>'],
solution:`import java.util.*;

public class TopK {
    static List<Long> largest(List<Long> amounts, int k) {
        PriorityQueue<Long> heap = new PriorityQueue<>();
        for (Long a : amounts) {
            heap.offer(a);
            if (heap.size() > k) {
                heap.poll();
            }
        }
        List<Long> out = new ArrayList<>(heap);
        out.sort(Comparator.reverseOrder());
        return out;
    }
}`},
{title:'Top-K, executed',lang:'js',diff:'hard',
run:{call:'topK',cases:[{name:'the three largest, ascending',args:[[5,1,9,3,7],3],expect:[5,7,9]},{name:'k larger than the input returns everything, ordered',args:[[2,1],5],expect:[1,2]},{name:'k of zero returns nothing',args:[[2,1],0],expect:[]},{name:'duplicates are kept, not collapsed',args:[[4,4,4,1],2],expect:[4,4]},{name:'negative values order correctly',args:[[-5,-1,-9],2],expect:[-5,-1]}]},
prompt:`Write <code>function topK(nums, k)</code> returning the <code>k</code> largest values <b>in ascending order</b>. If <code>k</code> is zero or negative return an empty array; if <code>k</code> exceeds the input length return every value, ordered. Duplicates count separately: the two largest of <code>[4,4,4,1]</code> are <code>[4,4]</code>.`,
starter:`function topK(nums, k) {
  return [];
}`,
solution:`function topK(nums, k) {
  if (k <= 0) return [];
  const sorted = [...nums].sort((a, b) => a - b);      // numeric, not lexical
  return sorted.slice(Math.max(0, sorted.length - k)); // the tail is the top-k
}`,
tests:[{d:'a non-positive k returns nothing',re:'k\\s*<=\\s*0|k\\s*<\\s*1'},{d:'the input is copied',re:'\\[\\.\\.\\.|slice\\s*\\(\\s*\\)|concat'},{d:'a numeric comparator is used',re:'a\\s*-\\s*b|b\\s*-\\s*a'},{d:'the result is the k largest',re:'slice\\s*\\(|splice|sort'}],
behavior:`Five cases execute. The duplicates case is the one that catches a Set-based shortcut: distinct values are not the same question as largest values, and deduplicating quietly changes the answer. The negative case catches the other classic: sort() without a comparator compares values as STRINGS, so [-5,-1,-9] sorts to [-1,-5,-9] and the answer is confidently wrong. Note what this implementation gives up: sorting is O(n log n) and holds the whole array, while the size-k min-heap in the lesson is O(n log k) with O(k) memory. For five numbers that is irrelevant; for a billion-row stream it is the difference between running and not.`,
hints:['Guard k <= 0 first.','sort() compares as text by default; always pass (a, b) => a - b for numbers.','After an ascending sort, the k largest are the last k elements.']}]},
{id:'ds4',title:'Linked lists: build one, know the trade-offs',body:`
<p>🌱 <b>Starting from zero:</b> two ways to store a sequence. Numbered shelves: finding slot #57 is instant, but inserting a new shelf in the middle means shifting everything after it. A treasure hunt of notes, each pointing to the next: inserting a note mid-chain is trivial (rewrite one pointer), but reaching item #57 means following 57 clues. That is the ArrayList-versus-LinkedList tradeoff in one image; everything below is the detail.</p>
<p><code>ArrayList</code> is a growable array: O(1) random access, O(1) amortized append, O(n) inserts in the middle (shifting). A <b>linked list</b> is nodes pointing at nodes: O(1) insert/remove <i>at a known node</i>, but O(n) to find anything and cache-hostile memory jumps. The practical guidance: <code>ArrayList</code> wins ~95% of the time; <code>ArrayDeque</code> beats <code>LinkedList</code> for both stack and queue duty. You study linked lists to master <b>references</b>, and because interviewers love them.</p>
<div class="codeSample" data-hl>class Node {
    int value;
    Node next;                    // null = end of the chain
    Node(int value) { this.value = value; }
}

// walking:  for (Node cur = head; cur != null; cur = cur.next) ...
// insert at head: O(1)          node.next = head; head = node;
// the classic: reverse in place by re-pointing, one node at a time
Node prev = null, cur = head;
while (cur != null) {
    Node next = cur.next;         // save the rest
    cur.next = prev;              // flip the arrow
    prev = cur; cur = next;       // advance
}
head = prev;</div>

<h4>The cost that does not appear in the Big-O</h4>
<p>On paper a linked list inserts in O(1) and an array list in O(n), which suggests the linked list should
win. In practice it usually loses, and the reason is memory layout. An <code>ArrayList</code> holds its
elements contiguously, so walking it streams through cache lines the CPU has already prefetched. A linked
list holds a node object per element, scattered across the heap, so each step is a pointer chase and
potentially a cache miss, and a cache miss costs roughly what a hundred arithmetic operations do.</p>
<p>The O(1) insertion is also conditional: it is O(1) <i>once you are holding the node</i>. Reaching a
position by index is O(n), so <code>list.get(i)</code> in a loop over a <code>LinkedList</code> is
accidentally quadratic, a genuinely common performance bug.</p>

<h4>When a linked structure is still right</h4>
<p>When you hold a reference to the position already, and splice frequently: an LRU cache moving a node to
the front, a scheduler moving tasks between queues, an intrusive list where the node lives inside the
element. Note that Java's own <code>LinkedHashMap</code> uses exactly this (a linked list threaded through
hash entries) to get insertion order without paying for lookup.</p>

<h4>Why it remains worth building once</h4>
<p>Writing the node class, the traversal, the insert and the delete teaches the pointer discipline that
underlies trees, graphs and every intrusive structure you will meet later. The classic interview
techniques (two pointers to find the middle or detect a cycle, reversing by rewiring rather than copying)
are all rehearsals for reasoning about references. The data structure is rarely the right answer; the
skill of manipulating references correctly always is.`,
docs:[['LinkedList, API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/LinkedList.html'],['Collection implementation trade-offs, Oracle','https://docs.oracle.com/javase/tutorial/collections/implementations/list.html']],
ex:{title:'Your own singly linked list',
prompt:`Build <code>IntList</code>: inner <code>static class Node</code> (int value, Node next), field <code>Node head</code>; <code>void addFirst(int v)</code>: O(1) head insert; <code>int size()</code>: walk and count; <code>java.util.List&lt;Integer&gt; toList()</code>: walk head→tail collecting values; and <code>void reverse()</code>: the in-place three-pointer re-linking (prev/cur/next), no arrays or collections allowed inside reverse.`,
starter:`import java.util.*;

public class IntList {
    static class Node {
        int value;
        Node next;
        Node(int value) { this.value = value; }
    }

    private Node head;

    void addFirst(int v) {
    }

    int size() {
        return 0;
    }

    List<Integer> toList() {
        return null;
    }

    void reverse() {
    }
}`,
tests:[{d:'addFirst relinks the head',re:'addFirst[\\s\\S]*?\\.next\\s*=\\s*head[\\s\\S]*?head\\s*='},{d:'Walks with a cursor node',re:'for\\s*\\(\\s*Node\\s+\\w+\\s*=\\s*head\\s*;[\\s\\S]*?=\\s*\\w+\\.next\\s*\\)|while\\s*\\(\\s*\\w+\\s*!=\\s*null\\s*\\)'},{d:'reverse uses the three-pointer dance',re:'reverse[\\s\\S]*?prev[\\s\\S]*?next[\\s\\S]*?prev\\s*=\\s*\\w+'},{d:'reverse builds no collections',re:'reverse\\s*\\(\\s*\\)\\s*\\{[\\s\\S]*?new\\s+(ArrayList|LinkedList|ArrayDeque)',not:true}],
behavior:`1. addFirst(1), addFirst(2), addFirst(3) → toList() == [3,2,1], size() == 3. 2. reverse() → toList() == [1,2,3]. 3. reverse on an empty or single-element list is a no-op that does not crash. 4. reverse allocates nothing; it only re-points existing next references.`,
hints:['addFirst: <code>Node n = new Node(v); n.next = head; head = n;</code>. Order matters; lose head last.','toList: cursor walk, <code>for (Node cur = head; cur != null; cur = cur.next) out.add(cur.value);</code>','reverse: save <code>next</code> BEFORE flipping <code>cur.next = prev</code>, else the rest of the chain is gone. End with <code>head = prev;</code>'],
solution:`import java.util.*;

public class IntList {
    static class Node {
        int value;
        Node next;
        Node(int value) { this.value = value; }
    }

    private Node head;

    void addFirst(int v) {
        Node n = new Node(v);
        n.next = head;
        head = n;
    }

    int size() {
        int count = 0;
        for (Node cur = head; cur != null; cur = cur.next) {
            count++;
        }
        return count;
    }

    List<Integer> toList() {
        List<Integer> out = new ArrayList<>();
        for (Node cur = head; cur != null; cur = cur.next) {
            out.add(cur.value);
        }
        return out;
    }

    void reverse() {
        Node prev = null, cur = head;
        while (cur != null) {
            Node next = cur.next;
            cur.next = prev;
            prev = cur;
            cur = next;
        }
        head = prev;
    }
}`}},
{id:'ds5',title:'Hash structures: equals/hashCode & an LRU cache',body:`
<p>🌱 <b>Starting from zero:</b> a coat check hands you ticket #217 and puts your coat on hook 217; returning it later takes seconds regardless of how many coats they hold, because the ticket number says exactly where to look. <b>Hashing</b> gives every object such a ticket number (its hash code), and HashMap/HashSet use it to jump straight to the right hook instead of searching. The catch: YOUR classes must issue their tickets consistently; that is the contract this lesson drills.</p>
<p>HashMap/HashSet give O(1) average lookups by hashing keys into buckets. That performance rests on a contract YOU uphold:</p>
<div class="codeSample" data-hl>// THE CONTRACT: equal objects MUST have equal hashCodes.
// Override both together or hash structures silently break:
// a key stored under one hashCode can never be found again.
record ClientId(String tenant, String id) {}   // records do it right for free

// choosing the map:
// HashMap, no order, fastest
// LinkedHashMap, insertion (or ACCESS) order preserved
// TreeMap, sorted by key, O(log n), range queries (headMap/tailMap)

// the famous trick: LinkedHashMap in access-order = an LRU cache
new LinkedHashMap&lt;K, V&gt;(16, 0.75f, true) {     // true = access order!
    protected boolean removeEldestEntry(Map.Entry&lt;K, V&gt; eldest) {
        return size() &gt; maxEntries;             // evict least-recently-used
    }
};</div>
<p>Mutating a field that feeds hashCode while the object sits in a HashSet loses the object; use immutable keys (records). This LRU is real infrastructure: session caches, token caches, JWKS key caches, all using this exact pattern.</p>

<h4>How a hash table actually finds things</h4>
<p><code>hashCode()</code> chooses a bucket; <code>equals()</code> then distinguishes the entries inside
it. Both steps are needed, which is exactly why the contract exists: equal objects must produce equal hash
codes, or a lookup goes to the wrong bucket and the entry you stored becomes unreachable while still
occupying memory.</p>
<p>Two consequences follow. A <b>bad hash</b>, one that clusters, degrades O(1) to a scan, which is the
basis of hash-collision denial of service and why Java's <code>HashMap</code> converts long collision
chains into balanced trees. And a <b>mutable key</b> whose hash changes after insertion is stranded: it is
in the table, and no lookup will ever find it again.</p>

<h4>Load factor and resizing</h4>
<p>A <code>HashMap</code> resizes when it is about 75% full, allocating a larger array and redistributing
every entry. That is amortised O(1), but the individual resize is O(n) and it happens at an unpredictable
moment, which matters in a latency-sensitive path. If you know roughly how many entries you will hold,
sizing the map up front avoids several rounds of rehashing.</p>

<h4>Why LinkedHashMap gives you an LRU cache almost free</h4>
<p><code>LinkedHashMap</code> threads a doubly-linked list through its entries. Construct it with
<code>accessOrder = true</code> and every <code>get</code> moves that entry to the end, so the eldest entry
is always the least recently used, and overriding <code>removeEldestEntry</code> to return true past a
size limit gives you a bounded LRU cache in a handful of lines. It is a neat demonstration of the general
point: the interesting structures are usually two simple ones composed, not one clever one.`,
docs:[['equals & hashCode contract, Object API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html#hashCode()'],['LinkedHashMap, API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/LinkedHashMap.html']],
ex:{title:'Build the LRU cache',
prompt:`Build an <b>LRU (least-recently-used) cache</b>: it holds at most <code>maxEntries</code> entries, and inserting beyond that evicts the entry <b>accessed longest ago</b> (a get counts as an access). Write <code>LruCache&lt;K, V&gt; extends java.util.LinkedHashMap&lt;K, V&gt;</code>: field <code>int maxEntries</code>; constructor <code>LruCache(int maxEntries)</code> calling <code>super(16, 0.75f, true)</code> (the <code>true</code> = access order, the whole trick); override <code>protected boolean removeEldestEntry(java.util.Map.Entry&lt;K, V&gt; eldest)</code> returning <code>size() &gt; maxEntries</code>.`,
starter:`import java.util.*;

public class LruCache<K, V> extends LinkedHashMap<K, V> {
    private final int maxEntries;

    // constructor: super(16, 0.75f, true)

    // override removeEldestEntry
}`,
tests:[{d:'Generic class extends LinkedHashMap',re:'class\\s+LruCache<K,\\s*V>\\s+extends\\s+LinkedHashMap<K,\\s*V>'},{d:'super with access-order true',re:'super\\s*\\(\\s*16\\s*,\\s*0\\.75f\\s*,\\s*true\\s*\\)'},{d:'Overrides removeEldestEntry',re:'protected\\s+boolean\\s+removeEldestEntry\\s*\\(\\s*Map\\.Entry<K,\\s*V>\\s+eldest\\s*\\)'},{d:'Evicts beyond maxEntries',re:'return\\s+size\\s*\\(\\s*\\)\\s*>\\s*maxEntries\\s*;'}],
behavior:`1. Capacity 2: put(a), put(b), GET(a), put(c) → b evicted, a survives (the get refreshed a: access order in action). 2. With false instead of true it would evict by insertion order (a FIFO cache, not LRU); the AI runner will probe this understanding. 3. removeEldestEntry is consulted by the map after each insert; returning true evicts exactly the eldest.`,
hints:['Constructor body is two lines: the super call and <code>this.maxEntries = maxEntries;</code>','The third super argument true switches iteration to access order: every get() moves the entry to "youngest".','You never call removeEldestEntry yourself; LinkedHashMap calls it after each put.'],
solution:`import java.util.*;

public class LruCache<K, V> extends LinkedHashMap<K, V> {
    private final int maxEntries;

    public LruCache(int maxEntries) {
        super(16, 0.75f, true);
        this.maxEntries = maxEntries;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > maxEntries;
    }
}`}},
{id:'ds6',title:'Big-O, Theta & Omega: measuring cost',body:`
<p>Before choosing a data structure you need a way to compare algorithms that does not depend on your laptop or language. That is <b>asymptotic complexity</b>: how the work grows as the input <code>n</code> grows, ignoring constant factors and small-input noise.</p>
<p>Three notations describe growth precisely:</p>
<ul>
<li><b>Big-O, written O(f),</b> is an <i>upper bound</i>: "grows no faster than f." The usual worst-case promise.</li>
<li><b>Big-Omega, written &#937;(f),</b> is a <i>lower bound</i>: "grows at least as fast as f." The best-case floor.</li>
<li><b>Big-Theta, written &#920;(f),</b> is a <i>tight bound</i>: O and &#937; agree, so f describes the growth exactly.</li>
</ul>
<p>Separately, name <b>which case</b> you mean: <b>best</b>, <b>average</b> or <b>worst</b>. Quicksort is &#920;(n log n) on average but O(n&#178;) worst case; a hash lookup is O(1) average but O(n) worst case. When people say "O(n log n)" unqualified they almost always mean the worst or expected case.</p>
<p>The growth classes you meet daily, best to worst: <code>O(1)</code> constant, <code>O(log n)</code> logarithmic, <code>O(n)</code> linear, <code>O(n log n)</code> linearithmic, <code>O(n&#178;)</code> quadratic, <code>O(2&#8319;)</code> exponential.</p>

<h4>Reading complexity off the code</h4>
<p>Three rules cover most of it. <b>Sequential blocks add</b>, and the sum is dominated by its largest term: O(n) followed by O(n&#178;) is O(n&#178;), so constants and lower-order terms are dropped. <b>Nested loops multiply</b>: a loop over n containing a loop over n is O(n&#178;), but a loop over n containing a loop over a <i>fixed</i> 10 is still O(n). <b>Halving is logarithmic</b>: any step that discards half the remaining input each time runs about log&#8322;n times: 1,000 items in 10 steps, a million in 20. The base of the logarithm is a constant factor, which is why nobody writes it.</p>
<div class="codeSample">for (x : list) { ... }                    // O(n)
for (a : list) for (b : list) { ... }     // O(n^2)  -- nested: multiply
for (x : list) { ... } sort(list);        // O(n) + O(n log n) = O(n log n)
while (hi &gt;= lo) { mid = (lo+hi)/2; ... } // O(log n) -- halves each step</div>

<h4>Amortized and space</h4>
<p><b>Amortized</b> cost averages an occasional expensive step over the many cheap ones that pay for it. <code>ArrayList.add</code> is amortized O(1): when the backing array is full it allocates a larger one and copies everything (O(n)), but because the capacity <i>doubles</i>, that cost is spread over the next n additions. It is a genuine guarantee about a sequence of operations, not a hopeful average, and it is different from "average case", which is about the distribution of inputs. <b>Space complexity</b> is measured the same way and is what stops you from answering every question with a hash map.</p>

<h4>Where the notation misleads</h4>
<p>Asymptotics deliberately discard constants, so an O(n) algorithm with a huge constant can lose to an O(n&#178;) one at every size you actually run. Real examples: linear search beats a hash map on ten elements, and insertion sort beats quicksort under about 40 items, which is why real sort implementations switch to it for small partitions. Complexity tells you how something scales; a profiler tells you what it costs. You need both, and the order matters: choose the right growth class first, then measure.</p>`,
docs:[['Big-O notation, Wikipedia','https://en.wikipedia.org/wiki/Big_O_notation'],['Time complexity, Wikipedia','https://en.wikipedia.org/wiki/Time_complexity']],
exs:[{title:'Name the bound and the cost',
prompt:`Write class <code>Complexity</code> with two static methods. <code>String bound(String kind)</code>: <code>"upper"</code>→<code>"Big-O"</code>, <code>"tight"</code>→<code>"Theta"</code>, <code>"lower"</code>→<code>"Omega"</code>, else <code>"unknown"</code>. <code>String of(String algo)</code>: <code>"hash-lookup"</code>→<code>"O(1)"</code>, <code>"binary-search"</code>→<code>"O(log n)"</code>, <code>"linear-scan"</code>→<code>"O(n)"</code>, <code>"bubble-sort"</code>→<code>"O(n^2)"</code>, else <code>"unknown"</code>.`,
starter:`public class Complexity {
    static String bound(String kind) {
        return null;
    }
    static String of(String algo) {
        return null;
    }
}`,
solution:`public class Complexity {
    static String bound(String kind) {
        switch (kind) {
            case "upper": return "Big-O";
            case "tight": return "Theta";
            case "lower": return "Omega";
            default:      return "unknown";
        }
    }
    static String of(String algo) {
        switch (algo) {
            case "hash-lookup":   return "O(1)";
            case "binary-search": return "O(log n)";
            case "linear-scan":   return "O(n)";
            case "bubble-sort":   return "O(n^2)";
            default:              return "unknown";
        }
    }
}`,
tests:[{d:'upper bound is Big-O',re:'"upper".*?"Big-O"',flags:'s'},{d:'tight bound is Theta',re:'"tight".*?"Theta"',flags:'s'},{d:'lower bound is Omega',re:'"lower".*?"Omega"',flags:'s'},{d:'binary-search is O(log n)',re:'"binary-search".*?"O\\(log n\\)"',flags:'s'},{d:'bubble-sort is O(n^2)',re:'"bubble-sort".*?"O\\(n\\^2\\)"',flags:'s'},{d:'hash-lookup is O(1)',re:'"hash-lookup".*?"O\\(1\\)"',flags:'s'},{d:'has an unknown default',re:'"unknown"'}],
behavior:`bound("upper") is "Big-O", bound("tight") is "Theta", bound("lower") is "Omega". of("binary-search") is "O(log n)", of("bubble-sort") is "O(n^2)". Anything unrecognized is "unknown". Big-O is the upper bound, Omega the lower, Theta the tight bound when they coincide.`,
hints:['Big-O is the upper bound, Omega the lower bound, Theta the tight bound where the two meet.','A switch per method maps each key to its answer, with default returning unknown.','Write the cost strings exactly, including the parentheses, as in O(log n) and O(n^2).']},
{title:'Count the halvings',lang:'js',diff:'medium',
run:{call:'binarySearchWorstCase',cases:[{name:'a single element takes one comparison',args:[1],expect:1},{name:'seven elements: 7 -> 3 -> 1',args:[7],expect:3},{name:'eight elements needs one more',args:[8],expect:4},{name:'a thousand elements in ten steps',args:[1000],expect:10},{name:'an empty range takes none',args:[0],expect:0}]},
prompt:`Make the logarithm concrete. Write <code>function binarySearchWorstCase(n)</code> returning how many comparisons a binary search needs in the worst case over <code>n</code> sorted items: the number of times you can halve <code>n</code> before nothing is left, which is <code>floor(log2(n)) + 1</code> for <code>n &gt;= 1</code>, and <code>0</code> for an empty range.`,
starter:`function binarySearchWorstCase(n) {
  return 0;
}`,
solution:`function binarySearchWorstCase(n) {
  if (n <= 0) return 0;
  return Math.floor(Math.log2(n)) + 1;   // each comparison halves what is left
}`,
tests:[{d:'an empty range is handled',re:'n\\s*<=\\s*0|n\\s*<\\s*1|n\\s*===\\s*0'},{d:'a base-2 logarithm is used',re:'log2|Math\\.log\\s*\\(\\s*n\\s*\\)\\s*/'},{d:'the result is a whole number of comparisons',re:'floor|ceil|\\|\\s*0'},{d:'the count is the halvings plus one',re:'\\+\\s*1'}],
behavior:`Five cases run. The 7-versus-8 pair is the point of the exercise: seven elements take three comparisons and eight take four, because the count steps up exactly at each power of two; that step is what a logarithm is. The n=1000 case is the number worth remembering: a thousand items in ten comparisons, a million in twenty, a billion in thirty. That is why O(log n) is treated as nearly free, and why doubling your data adds one step rather than doubling the work. The n=0 guard matters because Math.log2(0) is -Infinity, and floor(-Infinity) + 1 is not a comparison count.`,
hints:['Guard the empty case before touching a logarithm.','Math.log2 gives a fractional answer; you need whole comparisons.','Check your formula against n=8: it must give 4, not 3.']}]},
{id:'ds7',title:'Trees & search optimization',body:`
<p>A <b>tree</b> stores data in nodes with parent-child links and no cycles. Trees turn linear scans into logarithmic ones by letting each comparison discard a whole branch, the core trick behind fast search.</p>
<ul>
<li><b>Binary Search Tree (BST)</b>: left child smaller, right child larger. Search/insert/delete are O(log n) <i>when balanced</i>; but insert sorted data and it degenerates into a linked list at O(n). That failure mode is why balancing exists.</li>
<li><b>Self-balancing trees (AVL, Red-Black)</b>: rotate on insert/delete to keep height ~log n, guaranteeing O(log n). Java&#8217;s <code>TreeMap</code>/<code>TreeSet</code> are red-black trees, giving sorted keys and range queries.</li>
<li><b>Heap</b>: a complete binary tree with a parent-vs-child order (not full sorting). O(1) peek at the min/max and O(log n) insert/remove, perfect for priority queues and top-k.</li>
<li><b>Trie (prefix tree)</b>: one node per character; lookup is O(length of the key), independent of how many keys are stored. Ideal for autocomplete and prefix search.</li>
<li><b>B-tree / B+ tree</b>: wide, shallow trees with many keys per node to minimize disk reads. They are the backbone of database and filesystem <b>indexes</b>.</li>
</ul>
<p><b>Search optimization</b> is really structure selection plus keeping the structure healthy. Match the structure to the query: exact-key lookup wants a hash table (O(1) average); sorted or range queries want a balanced BST or B-tree (O(log n)); prefix queries want a trie; repeatedly pulling the smallest/largest wants a heap. Then keep it fast: balance the tree, add the right index, and remember that an unbalanced tree or a missing index is what silently turns O(log n) back into O(n).</p>`,
docs:[['Binary search tree (Wikipedia)','https://en.wikipedia.org/wiki/Binary_search_tree'],['B-tree (Wikipedia)','https://en.wikipedia.org/wiki/B-tree'],['Trie (Wikipedia)','https://en.wikipedia.org/wiki/Trie']],
ex:{title:'Pick the right tree',
prompt:`Write class <code>Trees</code> with <code>static String pick(String need)</code> that recommends a structure: <code>"exact-key-lookup"</code>→<code>"hash table"</code>, <code>"sorted-range"</code>→<code>"balanced BST"</code>, <code>"prefix-autocomplete"</code>→<code>"trie"</code>, <code>"top-k"</code>→<code>"heap"</code>, <code>"disk-index"</code>→<code>"B-tree"</code>, and <code>"unknown"</code> for anything else.`,
starter:`public class Trees {
    static String pick(String need) {
        return null;
    }
}`,
solution:`public class Trees {
    static String pick(String need) {
        switch (need) {
            case "exact-key-lookup":    return "hash table";
            case "sorted-range":        return "balanced BST";
            case "prefix-autocomplete": return "trie";
            case "top-k":               return "heap";
            case "disk-index":          return "B-tree";
            default:                    return "unknown";
        }
    }
}`,
tests:[{d:'exact-key lookup picks a hash table',re:'"exact-key-lookup".*?"hash table"',flags:'s'},{d:'sorted range picks a balanced BST',re:'"sorted-range".*?"balanced BST"',flags:'s'},{d:'prefix/autocomplete picks a trie',re:'"prefix-autocomplete".*?"trie"',flags:'s'},{d:'top-k picks a heap',re:'"top-k".*?"heap"',flags:'s'},{d:'disk index picks a B-tree',re:'"disk-index".*?"B-tree"',flags:'s'},{d:'unknown default',re:'"unknown"'}],
behavior:`pick("exact-key-lookup") is "hash table", pick("sorted-range") is "balanced BST", pick("prefix-autocomplete") is "trie", pick("top-k") is "heap", pick("disk-index") is "B-tree". Choosing the structure that matches the query is the essence of search optimization.`,
hints:['Match the access pattern to the structure: exact key to hash, range to balanced BST, prefix to trie, smallest/largest to heap, on-disk to B-tree.','A single switch on need with one case each is all it takes.','Return the exact recommendation strings, and fall through to unknown by default.']}},
{id:'ds8',title:'Traversal & graph search: BFS, DFS & Dijkstra',body:`
<p>Trees and graphs are only useful if you can <b>walk</b> them. A handful of traversal algorithms cover the vast majority of real problems, and each is defined by the data structure it uses to decide "where to go next."</p>
<ul>
<li><b>BFS (Breadth-First Search)</b>: explore level by level, nearest first, using a <b>queue</b> (FIFO). Because it fans out evenly, BFS finds the <b>shortest path in an unweighted graph</b>. O(V+E).</li>
<li><b>DFS (Depth-First Search)</b>: plunge as deep as possible, then backtrack, using a <b>stack</b> (or recursion, which uses the call stack). DFS powers <b>cycle detection</b>, checking whether a path exists, finding connected components, and topological sort. O(V+E). On a tree, DFS gives the three classic orders: <b>pre-order</b>, <b>in-order</b>, and <b>post-order</b>.</li>
<li><b>Dijkstra</b>: the <b>shortest path in a weighted graph</b> (non-negative weights). It greedily expands the closest unvisited node using a <b>priority queue</b> (min-heap). This is the exact algorithm the <b>OSPF</b> routing protocol runs; its "SPF" literally stands for Shortest Path First. O(E log V).</li>
<li><b>Topological sort</b>: order the nodes of a DAG so every edge points forward. The backbone of <b>task scheduling</b> and build-dependency resolution; built on DFS (or Kahn&#8217;s queue-based algorithm).</li>
</ul>
<p>Two more worth naming: <b>A*</b> is Dijkstra plus a heuristic that steers toward the goal (game and map pathfinding), and <b>Bellman-Ford</b> handles graphs with <b>negative</b> edge weights that Dijkstra cannot.</p>
<p>The quick decision guide: unweighted shortest path is <b>BFS</b>; weighted shortest path is <b>Dijkstra</b>; "does a path or cycle exist" and orderings are <b>DFS</b>; scheduling a DAG is a <b>topological sort</b>. Choosing the right one, and the queue/stack/heap it rides on, is most of the battle.</p>`,
docs:[['BFS, Wikipedia','https://en.wikipedia.org/wiki/Breadth-first_search'],['DFS, Wikipedia','https://en.wikipedia.org/wiki/Depth-first_search'],['Dijkstra algorithm','https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm'],['Topological sorting','https://en.wikipedia.org/wiki/Topological_sorting']],
ex:{title:'Pick the traversal',
prompt:`Write class <code>Traversal</code> with two static methods. <code>String dataStructure(String algo)</code>, the structure each uses: <code>"bfs"</code>→<code>"queue"</code>, <code>"dfs"</code>→<code>"stack"</code>, <code>"dijkstra"</code>→<code>"priority queue"</code>, else <code>"unknown"</code>. <code>String pick(String need)</code>, the right algorithm: <code>"shortest-unweighted"</code>→<code>"bfs"</code>, <code>"shortest-weighted"</code>→<code>"dijkstra"</code>, <code>"path-exists"</code>→<code>"dfs"</code>, <code>"task-ordering"</code>→<code>"topological sort"</code>, else <code>"unknown"</code>.`,
starter:`public class Traversal {
    static String dataStructure(String algo) {
        return null;
    }
    static String pick(String need) {
        return null;
    }
}`,
solution:`public class Traversal {
    static String dataStructure(String algo) {
        switch (algo) {
            case "bfs":      return "queue";
            case "dfs":      return "stack";
            case "dijkstra": return "priority queue";
            default:         return "unknown";
        }
    }
    static String pick(String need) {
        switch (need) {
            case "shortest-unweighted": return "bfs";
            case "shortest-weighted":   return "dijkstra";
            case "path-exists":         return "dfs";
            case "task-ordering":       return "topological sort";
            default:                    return "unknown";
        }
    }
}`,
tests:[{d:'BFS uses a queue',re:'"bfs".*?"queue"',flags:'s'},{d:'DFS uses a stack',re:'"dfs".*?"stack"',flags:'s'},{d:'Dijkstra uses a priority queue',re:'"dijkstra".*?"priority queue"',flags:'s'},{d:'unweighted shortest path is BFS',re:'"shortest-unweighted".*?"bfs"',flags:'s'},{d:'weighted shortest path is Dijkstra',re:'"shortest-weighted".*?"dijkstra"',flags:'s'},{d:'ordering a DAG is topological sort',re:'"task-ordering".*?"topological sort"',flags:'s'},{d:'unknown default',re:'"unknown"'}],
behavior:`dataStructure("bfs") is "queue", ("dfs") is "stack", ("dijkstra") is "priority queue". pick("shortest-unweighted") is "bfs", ("shortest-weighted") is "dijkstra", ("path-exists") is "dfs", ("task-ordering") is "topological sort". BFS fans out with a queue; DFS dives with a stack; Dijkstra (the SPF in OSPF) expands the nearest node from a heap.`,
hints:['Match each algorithm to its frontier structure: BFS a queue, DFS a stack, Dijkstra a priority queue.','Unweighted shortest path is BFS; weighted (non-negative) shortest path is Dijkstra.','Path or cycle existence is DFS; ordering a DAG of tasks is a topological sort.']}}
]});
