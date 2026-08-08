STREAMS.push({icon:'🧵',title:'Concurrency & Multithreading',blurb:'Threads, synchronization, executors, CompletableFuture, concurrent collections and virtual threads.',lessons:[
{id:'con0',title:'What is a thread? Threads vs processes',body:`
<p>Before any synchronization or thread pools, get the mental model right. When you launch a program, the operating system creates a <b>process</b>: an isolated container with its own private memory, its own file handles, and at least one <b>thread</b> of execution. A <b>thread</b> is a single sequential path through the code — the thing that actually runs your instructions one after another.</p>
<p>The key difference is <b>memory</b>. Processes are <i>isolated</i>: one process cannot read another&#8217;s memory, which makes them safe but heavyweight, and talking between them needs deliberate inter-process communication. Threads <i>within the same process</i> are different — they <b>share the process&#8217;s heap</b> (all its objects), but each thread gets its <b>own stack</b> for its local variables and method calls. That shared heap is exactly what makes threads powerful and dangerous at once.</p>
<div class="codeSample">Process (isolated memory)
 ├─ Thread 1  → own stack ┐
 ├─ Thread 2  → own stack ├─ all share the SAME heap (objects)
 └─ Thread 3  → own stack ┘</div>
<p><b>Why use threads?</b> Two reasons. To use more than one CPU core at a time (real parallelism — a 4-core machine can run 4 threads at once), and to stay responsive (do slow I/O on one thread while another keeps the UI alive). The operating system rapidly switches threads on and off cores (a <b>context switch</b>), so even a single core can interleave many threads.</p>
<p>The catch — and the reason the rest of this stream exists — is the shared heap. When two threads read and write the <i>same</i> object at the same time, you get <b>race conditions</b>: results that depend on unpredictable timing. Processes rarely have this problem because their memory is separate; threads have it constantly, which is why synchronization is the heart of concurrency. In Java, the JVM itself runs as one process, your program begins on the <code>main</code> thread, and you create more threads from there.</p>`,
docs:[['Processes and threads — Oracle','https://docs.oracle.com/javase/tutorial/essential/concurrency/procthread.html'],['Thread (computing) — Wikipedia','https://en.wikipedia.org/wiki/Thread_(computing)']],
ex:{title:'Process vs thread memory',
prompt:`Write class <code>Threads</code> with two static methods. <code>String memory(String unit)</code>: <code>"process"</code>→<code>"isolated"</code>, <code>"thread"</code>→<code>"shared"</code>, else <code>"unknown"</code>. <code>boolean sharedAcrossThreads(String region)</code>: threads in one process share the <code>"heap"</code> but each has its own stack — return true only for <code>"heap"</code>.`,
starter:`public class Threads {
    static String memory(String unit) {
        return null;
    }
    static boolean sharedAcrossThreads(String region) {
        return false;
    }
}`,
solution:`public class Threads {
    static String memory(String unit) {
        switch (unit) {
            case "process": return "isolated";
            case "thread":  return "shared";
            default:        return "unknown";
        }
    }
    static boolean sharedAcrossThreads(String region) {
        return region.equals("heap");
    }
}`,
tests:[{d:'a process has isolated memory',re:'"process".*?"isolated"',flags:'s'},{d:'threads share memory',re:'"thread".*?"shared"',flags:'s'},{d:'the heap is shared across threads',re:'region\\.equals\\s*\\(\\s*"heap"\\s*\\)'},{d:'unknown default',re:'"unknown"'}],
behavior:`memory("process") is "isolated", memory("thread") is "shared". sharedAcrossThreads("heap") is true; sharedAcrossThreads("stack") is false — each thread owns its stack. The shared heap is why race conditions exist and synchronization is needed.`,
hints:['Processes are isolated; threads within a process share memory.','Threads share the heap (objects) but each has its own stack (locals and call frames).','Return true only for the heap in the second method.']}},
{id:'con1',title:'Threads & Runnable',body:`
<p>A <code>Thread</code> is an independent path of execution. You give it work as a <code>Runnable</code> (a functional interface — lambdas work), then <code>start()</code> it. Calling <code>run()</code> directly is the classic beginner bug: it executes on the <i>current</i> thread, no concurrency at all.</p>
<div class="codeSample" data-hl>Runnable work = () -&gt; System.out.println("on " + Thread.currentThread().getName());

Thread t = new Thread(work, "worker-1");
t.start();          // new thread — run() would just be a method call!
t.join();           // wait for it to finish

Thread.sleep(100);  // pause current thread (throws InterruptedException)
t.isAlive();        // still running?</div>
<p><code>join()</code> blocks until the thread dies — the simplest coordination tool. Daemon threads (<code>setDaemon(true)</code> before start) don't keep the JVM alive. Interruption is cooperative: <code>t.interrupt()</code> sets a flag; blocking calls throw <code>InterruptedException</code>, which you must handle honestly (restore the flag or exit).</p>`,
docs:[['Concurrency — dev.java','https://dev.java/learn/multithreading/'],['Thread — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Thread.html']],
ex:{title:'Two workers, one wait',
prompt:`Write class <code>Workers</code> with <code>static java.util.List&lt;String&gt; runBoth() throws InterruptedException</code>: create a thread-safe list (use <code>java.util.Collections.synchronizedList</code> over an ArrayList), create <b>two</b> threads from <b>Runnable lambdas</b> that each add their thread's name to the list, <code>start()</code> both, <code>join()</code> both, then return the list (it must contain 2 entries).`,
starter:`import java.util.*;

public class Workers {
    static List<String> runBoth() throws InterruptedException {
        List<String> log = Collections.synchronizedList(new ArrayList<>());
        // create two Threads from lambdas, start both, join both
        return log;
    }
}`,
tests:[{d:'Uses synchronizedList',re:'Collections\\.synchronizedList'},{d:'Creates threads from lambdas',re:'new\\s+Thread\\s*\\(\\s*\\(\\s*\\)\\s*->'},{d:'Starts both threads',re:'\\.start\\s*\\(\\s*\\)[\\s\\S]*\\.start\\s*\\(\\s*\\)'},{d:'Joins both threads',re:'\\.join\\s*\\(\\s*\\)[\\s\\S]*\\.join\\s*\\(\\s*\\)'},{d:'Never calls run() directly',re:'\\.run\\s*\\(\\s*\\)',not:true}],
behavior:`1. runBoth() returns a list with exactly 2 entries (both thread names). 2. Both threads are started before either is joined (true parallelism). 3. join() guarantees both finished before return. 4. No direct .run() calls.`,
hints:['Lambda body: <code>() -> log.add(Thread.currentThread().getName())</code>','Start both first, then join both — start/join/start/join serializes them.','join() is why the list is safely complete when you return it.'],
solution:`import java.util.*;

public class Workers {
    static List<String> runBoth() throws InterruptedException {
        List<String> log = Collections.synchronizedList(new ArrayList<>());
        Thread a = new Thread(() -> log.add(Thread.currentThread().getName()), "worker-a");
        Thread b = new Thread(() -> log.add(Thread.currentThread().getName()), "worker-b");
        a.start();
        b.start();
        a.join();
        b.join();
        return log;
    }
}`}},
{id:'con2',title:'Race conditions & synchronization',body:`
<p><code>count++</code> is three operations (read, add, write). Two threads interleaving them lose updates — a <b>race condition</b>. The fix family:</p>
<div class="codeSample" data-hl>public class SafeCounter {
    private int count;

    public synchronized void increment() { count++; }   // one thread at a time
    public synchronized int get() { return count; }     // reads need it too!
}

// block form — lock only what you must:
synchronized (lockObject) { shared.update(); }

private volatile boolean running = true;   // visibility, NOT atomicity</div>
<p><code>synchronized</code> gives <i>mutual exclusion</i> + <i>visibility</i> (happens-before). <code>volatile</code> gives only visibility — right for a stop flag, wrong for a counter. Deadlock rule: if you must hold two locks, always acquire them in the same global order.</p>`,
docs:[['Synchronization — Oracle','https://docs.oracle.com/javase/tutorial/essential/concurrency/sync.html'],['Java Memory Model — Baeldung','https://www.baeldung.com/java-volatile']],
ex:{title:'Fix the racy counter',
prompt:`Write <code>SafeCounter</code> with a private <code>int count</code>, <b>synchronized</b> methods <code>void increment()</code> and <code>int get()</code>, plus a <b>volatile boolean</b> field <code>running</code> (initially true) with method <code>void stop()</code> setting it false and <code>boolean isRunning()</code>. In a comment, state why volatile alone would not fix increment().`,
starter:`public class SafeCounter {
    private int count;
    // volatile running flag

    // synchronized increment() and get()

    // stop() / isRunning()

    // comment: why can't volatile fix count++?
}`,
tests:[{d:'increment is synchronized',re:'synchronized\\s+void\\s+increment'},{d:'get is synchronized too',re:'synchronized\\s+int\\s+get'},{d:'volatile boolean running',re:'volatile\\s+boolean\\s+running'},{d:'Has the why-not-volatile comment',re:'//[^\\n]*(atomic|three|read[^\\n]*write|not atomic)','flags':'is'}],
behavior:`1. 1000 concurrent increment() calls yield get() == 1000 (no lost updates). 2. stop() flips isRunning() to false and the change is visible to other threads immediately. 3. The comment correctly explains count++ is a read-modify-write, which volatile cannot make atomic.`,
hints:['Method form: <code>public synchronized void increment() { count++; }</code> — the lock is this.','Reads need the same lock: an unsynchronized get() may see stale values.','volatile guarantees other threads SEE the latest value — it cannot stop two threads from interleaving read-add-write.'],
solution:`public class SafeCounter {
    private int count;
    private volatile boolean running = true;

    public synchronized void increment() { count++; }

    public synchronized int get() { return count; }

    public void stop() { running = false; }

    public boolean isRunning() { return running; }

    // count++ is three steps (read, add, write) — not atomic.
    // volatile only guarantees visibility of the latest write; two threads
    // can still both read 5 and both write 6, losing an update.
}`}},
{id:'con3',title:'ExecutorService & thread pools',body:`
<p>Creating raw threads per task doesn't scale. An <code>ExecutorService</code> owns a pool of workers and queues your tasks:</p>
<div class="codeSample" data-hl>ExecutorService pool = Executors.newFixedThreadPool(4);
try {
    Future&lt;Integer&gt; f = pool.submit(() -&gt; expensiveComputation());  // Callable
    Integer result = f.get();          // blocks until done (throws ExecutionException)

    List&lt;Future&lt;Integer&gt;&gt; all = pool.invokeAll(listOfCallables);
} finally {
    pool.shutdown();                   // stop accepting; finish queued work
    pool.awaitTermination(10, TimeUnit.SECONDS);
}</div>
<p><code>Callable&lt;V&gt;</code> is Runnable that returns a value and may throw. Always shut pools down (or use try-with-resources — ExecutorService is AutoCloseable since Java 19). Forgetting shutdown() is why "my main never exits."</p>`,
docs:[['Executors — Oracle','https://docs.oracle.com/javase/tutorial/essential/concurrency/executors.html'],['ExecutorService — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ExecutorService.html']],
ex:{title:'Pool the work',
prompt:`Write <code>Pool</code> with <code>static int sumSquares(int n) throws Exception</code>: create a fixed pool of 4 threads, submit <b>n</b> <code>Callable</code> tasks where task i returns i*i (for i = 1..n), collect the <code>Future</code>s in a list, sum all <code>get()</code> results, <b>shutdown</b> the pool in a finally block, and return the sum.`,
starter:`import java.util.*;
import java.util.concurrent.*;

public class Pool {
    static int sumSquares(int n) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(4);
        try {
            // submit n Callables (i -> i*i), collect Futures, sum get()s
            return 0;
        } finally {
            // shutdown
        }
    }
}`,
tests:[{d:'Fixed pool of 4',re:'newFixedThreadPool\\s*\\(\\s*4\\s*\\)'},{d:'Submits tasks',re:'\\.submit\\s*\\('},{d:'Collects Futures',re:'Future<Integer>|List<Future'},{d:'Sums via get()',re:'\\.get\\s*\\(\\s*\\)'},{d:'Shuts down in finally',re:'finally\\s*\\{[\\s\\S]*?shutdown\\s*\\(\\s*\\)'}],
behavior:`1. sumSquares(3) == 14 (1+4+9). 2. sumSquares(0) == 0. 3. Pool always shut down, even if a task throws. 4. Beware the lambda capture: the loop variable must be effectively final (copy it: final int i = ...).`,
hints:['Loop: <code>for (int i = 1; i <= n; i++) { final int v = i; futures.add(pool.submit(() -> v * v)); }</code>','Sum in a second loop: <code>for (Future&lt;Integer&gt; f : futures) sum += f.get();</code>','finally { pool.shutdown(); } — submission loop errors must not leak threads.'],
solution:`import java.util.*;
import java.util.concurrent.*;

public class Pool {
    static int sumSquares(int n) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(4);
        try {
            List<Future<Integer>> futures = new ArrayList<>();
            for (int i = 1; i <= n; i++) {
                final int v = i;
                futures.add(pool.submit(() -> v * v));
            }
            int sum = 0;
            for (Future<Integer> f : futures) {
                sum += f.get();
            }
            return sum;
        } finally {
            pool.shutdown();
        }
    }
}`}},
{id:'con4',title:'CompletableFuture: async pipelines',body:`
<p><code>CompletableFuture</code> composes async work like streams compose data — no manual thread juggling:</p>
<div class="codeSample" data-hl>CompletableFuture&lt;String&gt; user  = CompletableFuture.supplyAsync(() -&gt; fetchUser(id));
CompletableFuture&lt;String&gt; perms = CompletableFuture.supplyAsync(() -&gt; fetchPermissions(id));

CompletableFuture&lt;String&gt; page = user
    .thenCombine(perms, (u, p) -&gt; render(u, p))   // join two async results
    .thenApply(String::toUpperCase)               // transform when ready
    .exceptionally(ex -&gt; "fallback page");        // recover from failure

String result = page.join();   // block only at the very edge</div>
<p>Key verbs: <code>supplyAsync</code> (start work), <code>thenApply</code> (map), <code>thenCompose</code> (flatMap — next async step), <code>thenCombine</code> (zip two), <code>exceptionally</code>/<code>handle</code> (recover), <code>allOf</code> (fan-in). This is the JDK's answer to async/await — in your API-platform world, it's how you fan out to services without blocking threads.</p>`,
docs:[['CompletableFuture — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/CompletableFuture.html'],['CompletableFuture guide — Baeldung','https://www.baeldung.com/java-completablefuture']],
ex:{title:'Fan out, then combine',
prompt:`Write <code>Async</code> with <code>static String profile(String id)</code>: start two async suppliers with <code>supplyAsync</code> — one returning <code>"user:" + id</code>, one returning <code>"roles:admin"</code> — combine them with <code>thenCombine</code> joining with <code>" | "</code>, add <code>exceptionally</code> returning <code>"profile unavailable"</code>, and return the result via <code>join()</code>.`,
starter:`import java.util.concurrent.*;

public class Async {
    static String profile(String id) {
        // supplyAsync x2 -> thenCombine -> exceptionally -> join
        return null;
    }
}`,
tests:[{d:'Two supplyAsync calls',re:'supplyAsync[\\s\\S]*supplyAsync'},{d:'thenCombine joins them',re:'thenCombine\\s*\\('},{d:'exceptionally fallback',re:'exceptionally\\s*\\('},{d:'join() at the edge',re:'\\.join\\s*\\(\\s*\\)'},{d:'No Thread.sleep busy-waiting',re:'Thread\\.sleep',not:true}],
behavior:`1. profile("42") returns "user:42 | roles:admin". 2. If either supplier threw, the result is "profile unavailable" (no exception escapes). 3. Both suppliers run concurrently — combine waits for both. 4. join() is the only blocking call.`,
hints:['Two futures first: <code>var u = CompletableFuture.supplyAsync(() -> "user:" + id);</code>','Combine: <code>u.thenCombine(r, (a, b) -> a + " | " + b)</code>','Chain <code>.exceptionally(ex -> "profile unavailable")</code> before <code>.join()</code>.'],
solution:`import java.util.concurrent.*;

public class Async {
    static String profile(String id) {
        CompletableFuture<String> user =
            CompletableFuture.supplyAsync(() -> "user:" + id);
        CompletableFuture<String> roles =
            CompletableFuture.supplyAsync(() -> "roles:admin");

        return user
            .thenCombine(roles, (u, r) -> u + " | " + r)
            .exceptionally(ex -> "profile unavailable")
            .join();
    }
}`}},
{id:'con5',title:'Concurrent collections, atomics & latches',body:`
<p>Prefer purpose-built concurrent tools over sprinkling <code>synchronized</code>:</p>
<div class="codeSample" data-hl>AtomicLong hits = new AtomicLong();
hits.incrementAndGet();                       // lock-free atomic counter

ConcurrentHashMap&lt;String, Long&gt; byUser = new ConcurrentHashMap&lt;&gt;();
byUser.merge(user, 1L, Long::sum);            // atomic per-key update

BlockingQueue&lt;Task&gt; queue = new LinkedBlockingQueue&lt;&gt;();
queue.put(task);      // producer blocks when full
Task t = queue.take(); // consumer blocks when empty — no polling!

CountDownLatch ready = new CountDownLatch(3);
// each worker: ready.countDown();  main: ready.await();</div>
<p><code>ConcurrentHashMap</code> beats <code>Collections.synchronizedMap</code> (striped, and compound ops like merge/compute are atomic). <code>AtomicInteger/Long</code> for counters, <code>LongAdder</code> under heavy contention. <code>CountDownLatch</code> = one-shot "wait for N events"; <code>Semaphore</code> = permits; <code>CyclicBarrier</code> = reusable meeting point.</p>`,
docs:[['Concurrent collections — Oracle','https://docs.oracle.com/javase/tutorial/essential/concurrency/collections.html'],['java.util.concurrent — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/package-summary.html']],
ex:{title:'Thread-safe hit tracker',
prompt:`Write <code>HitTracker</code> with an <code>AtomicLong total</code>, a <code>ConcurrentHashMap&lt;String, Long&gt; perPath</code>, method <code>void hit(String path)</code> that atomically increments both (use <code>merge</code> for the map), <code>long total()</code>, and <code>static void awaitAll(CountDownLatch latch) throws InterruptedException</code> that just awaits the latch (shows you know the primitive). No synchronized keyword anywhere.`,
starter:`import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class HitTracker {
    // AtomicLong + ConcurrentHashMap fields

    void hit(String path) {
    }

    long total() {
        return 0;
    }

    static void awaitAll(CountDownLatch latch) throws InterruptedException {
    }
}`,
tests:[{d:'AtomicLong for the total',re:'AtomicLong'},{d:'ConcurrentHashMap for per-path',re:'ConcurrentHashMap<String,\\s*Long>'},{d:'Atomic map update via merge',re:'\\.merge\\s*\\(\\s*path\\s*,\\s*1L?\\s*,\\s*Long::sum\\s*\\)'},{d:'incrementAndGet on the counter',re:'incrementAndGet\\s*\\(\\s*\\)'},{d:'awaitAll uses latch.await',re:'latch\\.await\\s*\\(\\s*\\)'},{d:'No synchronized anywhere',re:'synchronized',not:true}],
behavior:`1. 1000 concurrent hit("/login") calls give total() == 1000 and perPath.get("/login") == 1000 — no lost updates, no locks. 2. hit on distinct paths tracks each key independently. 3. awaitAll blocks until the latch reaches zero.`,
hints:['Fields: <code>private final AtomicLong total = new AtomicLong();</code> and a <code>new ConcurrentHashMap&lt;&gt;()</code>.','hit: <code>total.incrementAndGet(); perPath.merge(path, 1L, Long::sum);</code>','awaitAll body is one line: <code>latch.await();</code>'],
solution:`import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class HitTracker {
    private final AtomicLong total = new AtomicLong();
    private final ConcurrentHashMap<String, Long> perPath = new ConcurrentHashMap<>();

    void hit(String path) {
        total.incrementAndGet();
        perPath.merge(path, 1L, Long::sum);
    }

    long total() {
        return total.get();
    }

    static void awaitAll(CountDownLatch latch) throws InterruptedException {
        latch.await();
    }
}`}},
{id:'con6',title:'Virtual threads (Java 21) & modern practice',body:`
<p>Virtual threads make the thread-per-request model scale: millions of cheap threads multiplexed onto a few OS carriers. Blocking a virtual thread is fine — the JVM parks it and reuses the carrier.</p>
<div class="codeSample" data-hl>// one virtual thread
Thread.ofVirtual().name("vt-1").start(() -&gt; handle(request));

// the server pattern: a virtual thread PER TASK
try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
    for (var req : requests) {
        exec.submit(() -&gt; handle(req));   // blocking I/O inside is fine!
    }
}   // AutoCloseable: waits for tasks</div>
<p>Rules of thumb: virtual threads for I/O-bound fan-out (API calls, DB queries); fixed platform pools still fine for CPU-bound work; don't pool virtual threads (create per task); avoid long <code>synchronized</code> blocks around blocking calls (pinning — use ReentrantLock if needed). Spring Boot 3.2+: <code>spring.threads.virtual.enabled=true</code>.</p>`,
docs:[['Virtual threads — dev.java','https://dev.java/learn/new-features/virtual-threads/'],['JEP 444 — Virtual Threads','https://openjdk.org/jeps/444']],
ex:{title:'Fan out on virtual threads',
prompt:`Write <code>VFanout</code> with <code>static java.util.List&lt;String&gt; fetchAll(java.util.List&lt;String&gt; ids) throws Exception</code>: open <code>Executors.newVirtualThreadPerTaskExecutor()</code> in a <b>try-with-resources</b>, submit one <code>Callable</code> per id returning <code>"data-" + id</code>, collect Futures, then build and return the results list via <code>get()</code>.`,
starter:`import java.util.*;
import java.util.concurrent.*;

public class VFanout {
    static List<String> fetchAll(List<String> ids) throws Exception {
        // try (var exec = ...) { submit per id, collect futures, get all }
        return null;
    }
}`,
tests:[{d:'Virtual thread per-task executor',re:'newVirtualThreadPerTaskExecutor\\s*\\(\\s*\\)'},{d:'Executor opened in try-with-resources',re:'try\\s*\\(\\s*(var|ExecutorService)\\s+\\w+\\s*='},{d:'One submit per id',re:'\\.submit\\s*\\('},{d:'Results via get()',re:'\\.get\\s*\\(\\s*\\)'}],
behavior:`1. fetchAll(List.of("a","b")) returns ["data-a","data-b"] (order preserved by collecting futures in order). 2. The executor closes automatically, waiting for all tasks. 3. One virtual thread per id — this pattern scales to tens of thousands of ids.`,
hints:['<code>try (var exec = Executors.newVirtualThreadPerTaskExecutor()) { ... }</code> — closing waits for tasks.','Submit in id order: <code>futures.add(exec.submit(() -> "data-" + id));</code>','Second loop: <code>out.add(f.get());</code> keeps the original order.'],
solution:`import java.util.*;
import java.util.concurrent.*;

public class VFanout {
    static List<String> fetchAll(List<String> ids) throws Exception {
        List<String> out = new ArrayList<>();
        try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
            List<Future<String>> futures = new ArrayList<>();
            for (String id : ids) {
                futures.add(exec.submit(() -> "data-" + id));
            }
            for (Future<String> f : futures) {
                out.add(f.get());
            }
        }
        return out;
    }
}`}}
]});
