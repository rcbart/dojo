STREAMS.push({icon:'🧵',title:'Concurrency & Multithreading',blurb:'Threads, synchronization, executors, CompletableFuture, concurrent collections and virtual threads.',lessons:[
{id:'con0',title:'What is a thread? Threads vs processes',body:`
<p>Before any synchronization or thread pools, get the mental model right. When you launch a program, the operating system creates a <b>process</b>: an isolated container with its own private memory, its own file handles, and at least one <b>thread</b> of execution. A <b>thread</b> is a single sequential path through the code: the thing that actually runs your instructions one after another.</p>
<p>The key difference is <b>memory</b>. Processes are <i>isolated</i>: one process cannot read another&#8217;s memory, which makes them safe but heavyweight, and talking between them needs deliberate inter-process communication. Threads <i>within the same process</i> are different: they <b>share the process&#8217;s heap</b> (all its objects), but each thread gets its <b>own stack</b> for its local variables and method calls. That shared heap is exactly what makes threads useful and dangerous at once.</p>
<div class="codeSample">Process (isolated memory)
 ├─ Thread 1  → own stack ┐
 ├─ Thread 2  → own stack ├─ all share the SAME heap (objects)
 └─ Thread 3  → own stack ┘</div>
<p><b>Why use threads?</b> Two reasons. To use more than one CPU core at a time (real parallelism: a 4-core machine can run 4 threads at once), and to stay responsive (do slow I/O on one thread while another keeps the UI alive). The operating system rapidly switches threads on and off cores (a <b>context switch</b>), so even a single core can interleave many threads.</p>
<p>The catch (and the reason the rest of this stream exists) is the shared heap. When two threads read and write the <i>same</i> object at the same time, you get <b>race conditions</b>: results that depend on unpredictable timing. Processes rarely have this problem because their memory is separate; threads have it constantly, which is why synchronization is the heart of concurrency. In Java, the JVM itself runs as one process, your program begins on the <code>main</code> thread, and you create more threads from there.</p>`,
docs:[['Processes and threads, Oracle','https://docs.oracle.com/javase/tutorial/essential/concurrency/procthread.html'],['Thread (computing), Wikipedia','https://en.wikipedia.org/wiki/Thread_(computing)']],
ex:{title:'Process vs thread memory',
prompt:`Write class <code>Threads</code> with two static methods. <code>String memory(String unit)</code>: <code>"process"</code>→<code>"isolated"</code>, <code>"thread"</code>→<code>"shared"</code>, else <code>"unknown"</code>. <code>boolean sharedAcrossThreads(String region)</code>: threads in one process share the <code>"heap"</code> but each has its own stack; return true only for <code>"heap"</code>.`,
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
behavior:`memory("process") is "isolated", memory("thread") is "shared". sharedAcrossThreads("heap") is true; sharedAcrossThreads("stack") is false; each thread owns its stack. The shared heap is why race conditions exist and synchronization is needed.`,
hints:['Processes are isolated; threads within a process share memory.','Threads share the heap (objects) but each has its own stack (locals and call frames).','Return true only for the heap in the second method.']}},
{id:'con1',title:'Threads & Runnable',body:`
<p>A <code>Thread</code> is an independent path of execution. You give it work as a <code>Runnable</code> (a functional interface; lambdas work), then <code>start()</code> it. Calling <code>run()</code> directly is the classic beginner bug: it executes on the <i>current</i> thread, no concurrency at all.</p>
<div class="codeSample" data-hl>Runnable work = () -&gt; System.out.println("on " + Thread.currentThread().getName());

Thread t = new Thread(work, "worker-1");
t.start();          // new thread, run() would just be a method call!
t.join();           // wait for it to finish

Thread.sleep(100);  // pause current thread (throws InterruptedException)
t.isAlive();        // still running?</div>
<p><code>join()</code> blocks until the thread dies, the simplest coordination tool. Daemon threads (<code>setDaemon(true)</code> before start) don't keep the JVM alive. Interruption is cooperative: <code>t.interrupt()</code> sets a flag; blocking calls throw <code>InterruptedException</code>, which you must handle properly (restore the flag or exit).</p>
<h4>What a thread costs, and why that shapes everything</h4>
<p>A platform thread is a thin wrapper over an <b>operating system</b> thread. Creating one is a system
call; each carries a stack reserved in megabytes, not kilobytes; and switching between them means the
kernel saving and restoring register state. That is why "just make a thread per request" was bad advice
for twenty years, and why thread <i>pools</i> exist: not because threads are conceptually hard, but
because they are expensive objects you want to reuse.</p>
<p>Hold that number in mind: a few thousand platform threads is a lot. It explains pool sizing, it
explains why blocking a thread felt wasteful enough to justify all of reactive programming, and it
explains why virtual threads (later in this stream) changed the advice rather than the language.</p>

<h4><code>start()</code> versus <code>run()</code>, precisely</h4>
<div class="codeSample" data-hl>t.run();     // an ordinary method call on an ordinary object.
             // executes HERE, on the calling thread, synchronously.
             // compiles, runs, and is completely wrong.

t.start();   // asks the JVM to create an OS thread whose entry point
             // is run(). returns IMMEDIATELY - the work has not
             // necessarily begun when the next line executes.

t.start();   // again -> IllegalThreadStateException. a Thread object
             // is single-use; it cannot be restarted.</div>
<p>The second point matters more than it looks: after <code>start()</code> returns, you know nothing about
what the new thread has done. Every coordination tool in this stream exists to replace assumptions with
guarantees.</p>

<h4>Interruption is a request, not a command</h4>
<p>There is no safe way to stop a thread from outside: <code>Thread.stop()</code> existed, could leave
objects half-modified with locks released, and was deprecated for exactly that reason. So Java uses
cooperation: <code>interrupt()</code> sets a flag, and the target decides what to do about it.</p>
<div class="codeSample" data-hl>while (!Thread.currentThread().isInterrupted()) { doWork(); }   // polling

try { Thread.sleep(1000); }
catch (InterruptedException e) {
    Thread.currentThread().interrupt();   // RESTORE the flag - catching
    return;                               // the exception CLEARED it
}
// swallowing InterruptedException without restoring is the classic bug:
// the cancellation signal is destroyed, and callers up the stack never
// learn the thread was asked to stop.</div>

<h4>Where to actually go from here</h4>
<p>Knowing <code>Thread</code> is knowing the substrate, not the tool you should reach for. Application
code should use <code>ExecutorService</code> to decouple <i>what work exists</i> from <i>what runs it</i>,
and the concurrent collections and synchronizers in <code>java.util.concurrent</code> rather than
hand-rolled coordination. The rest of this stream builds up to that; this lesson is the layer underneath
so the abstractions are not mysterious.</p>`,
docs:[['Concurrency, dev.java','https://dev.java/learn/multithreading/'],['Thread, API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Thread.html']],
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
hints:['Lambda body: <code>() -> log.add(Thread.currentThread().getName())</code>','Start both first, then join both; start/join/start/join serializes them.','join() is why the list is safely complete when you return it.'],
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
<p><code>count++</code> is three operations (read, add, write). Two threads interleaving them lose updates: a <b>race condition</b>. The fix family:</p>
<div class="codeSample" data-hl>public class SafeCounter {
    private int count;

    public synchronized void increment() { count++; }   // one thread at a time
    public synchronized int get() { return count; }     // reads need it too!
}

// block form, lock only what you must:
synchronized (lockObject) { shared.update(); }

private volatile boolean running = true;   // visibility, NOT atomicity</div>
<p><code>synchronized</code> gives <i>mutual exclusion</i> + <i>visibility</i> (happens-before). <code>volatile</code> gives only visibility: right for a stop flag, wrong for a counter. Deadlock rule: if you must hold two locks, always acquire them in the same global order.</p>
<h4>Why <code>count++</code> is three operations</h4>
<p>The source says one thing; the machine does three. There is no instruction that reads, increments and
writes a memory location atomically, so two threads can interleave and one increment simply
disappears:</p>
<div class="codeSample" data-hl>thread A          thread B          count
read  -> 5                          5
                  read  -> 5        5
add   -> 6                          5
                  add   -> 6        5
write    6                          6
                  write    6        6     <- two increments, one result</div>
<p>This is not rare or exotic. It is what happens by default, and it is invisible in testing because the
window is nanoseconds wide, which is precisely what makes concurrency bugs expensive: they appear under
production load, on a different machine, and cannot be reproduced on demand.</p>

<h4>The second problem, which is stranger: visibility</h4>
<p>Atomicity is only half of it. Even a write that completes may never be <i>seen</i> by another thread,
because the JVM and the CPU are permitted to keep values in registers and caches and to reorder
instructions, as long as the result looks correct <b>to the thread doing it</b>. A loop reading a plain
<code>boolean</code> flag can legally be optimized into an infinite loop, because nothing in that thread
ever changes it.</p>
<p>That is what the Java Memory Model governs, and its central concept is <b>happens-before</b>: unless
you establish such a relationship, one thread's writes are not guaranteed visible to another, ever.
<code>synchronized</code> and <code>volatile</code> are how you create one.</p>
<div class="codeSample" data-hl>volatile      visibility + ordering.  NOT atomicity.
              right for: a stop flag, a published reference
              wrong for: count++, check-then-act

synchronized  mutual exclusion + visibility.
              reads need it TOO - a synchronized write with an
              unsynchronized read gives you no guarantee at all

AtomicInteger lock-free atomic read-modify-write (CAS)
              incrementAndGet() is the correct counter</div>

<h4>The rules that keep this manageable</h4>
<p><b>Prefer not sharing.</b> The cheapest concurrency bug is the one that cannot exist: immutable objects
need no synchronization, confined state needs none, and a queue between threads beats shared mutable
state.</p>
<p><b>Lock the right granularity.</b> Synchronizing an entire method is easy and serializes everything;
locking too little leaves gaps. Guard a coherent unit of state with one lock, and document which lock
guards what.</p>
<p><b>Never call unknown code holding a lock.</b> A callback, a listener or an overridden method invoked
inside a <code>synchronized</code> block can acquire another lock and deadlock you, and you will not find
it by reading your own class.</p>
<p><b>Order your locks globally.</b> Deadlock needs two threads taking the same two locks in opposite
order. A fixed acquisition order across the codebase makes it structurally impossible, and if you cannot
state that order, that is the finding.</p>`,
docs:[['Synchronization, Oracle','https://docs.oracle.com/javase/tutorial/essential/concurrency/sync.html'],['Java Memory Model, Baeldung','https://www.baeldung.com/java-volatile']],
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
hints:['Method form: <code>public synchronized void increment() { count++; }</code>; the lock is this.','Reads need the same lock: an unsynchronized get() may see stale values.','volatile guarantees other threads SEE the latest value; it cannot stop two threads from interleaving read-add-write.'],
solution:`public class SafeCounter {
    private int count;
    private volatile boolean running = true;

    public synchronized void increment() { count++; }

    public synchronized int get() { return count; }

    public void stop() { running = false; }

    public boolean isRunning() { return running; }

    // count++ is three steps (read, add, write), not atomic.
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
<p><code>Callable&lt;V&gt;</code> is Runnable that returns a value and may throw. Always shut pools down (or use try-with-resources; ExecutorService is AutoCloseable since Java 19). Forgetting shutdown() is why "my main never exits."</p>

<h4>Choosing a pool, and why the default is often wrong</h4>
<div class="codeSample" data-hl>newFixedThreadPool(n)     bounded threads, UNBOUNDED queue
                          -&gt; work piles up in memory rather than being refused
newCachedThreadPool()     UNBOUNDED threads, no queue
                          -&gt; a burst can create thousands of threads
newSingleThreadExecutor() serialized, ordering guaranteed
newVirtualThreadPerTaskExecutor()  Java 21+: a thread per task, cheaply
                          -&gt; the right default for blocking I/O work

// production pools are usually built explicitly, because the interesting
// decisions are the queue bound and what happens when it is full:
new ThreadPoolExecutor(core, max, keepAlive, SECONDS,
    new ArrayBlockingQueue&lt;&gt;(1000),          // BOUNDED. this is the point.
    new ThreadPoolExecutor.CallerRunsPolicy() // back-pressure, not silent drop
);</div>
<p>The sizing heuristic: <b>CPU-bound</b> work wants roughly the number of cores, because more threads
only add context switching. <b>I/O-bound</b> work wants many more, because threads spend their time
blocked, and on Java 21+ that is exactly the case virtual threads solve, letting you stop tuning pool
sizes for blocking work altogether.</p>

<h4>Exceptions vanish unless you look</h4>
<p>This is the behavior that most often surprises people. A task submitted with
<code>submit()</code> that throws does <b>not</b> print anything; the exception is captured in the
<code>Future</code> and only surfaces when you call <code>get()</code>. Fire-and-forget
<code>submit()</code> with an ignored return value silently discards failures.</p>
<div class="codeSample" data-hl>pool.submit(task);        // throws? you will never know.
pool.execute(task);       // throws? goes to the thread's uncaught handler
Future&lt;?&gt; f = pool.submit(task);
f.get();                  // NOW the exception arrives, wrapped in ExecutionException</div>
<p><code>get()</code> also <b>blocks indefinitely</b> by default. Prefer the timeout overload; a hung
task otherwise hangs the caller too.</p>

<h4>Shutting down properly</h4>
<p><code>shutdown()</code> stops accepting new work and lets running tasks finish.
<code>shutdownNow()</code> additionally interrupts them and returns the queued tasks that never ran.
Neither <i>waits</i>; that is <code>awaitTermination()</code>, and the usual correct sequence is
shutdown, await a bounded time, then <code>shutdownNow()</code> if it has not drained.</p>
<p>The reason "my main never exits" is that pool threads are <b>non-daemon</b> by default, so the JVM
keeps running for them. Try-with-resources on Java 19+ handles this correctly and is the simplest fix.</p>

<h4>The deadlock worth naming</h4>
<p>Submitting a task to a pool and then <code>get()</code>-ing on a task that must run in that
<i>same</i> pool will deadlock once the pool is saturated: the waiting task holds a thread the pending
task needs. Keep dependent work off the pool it depends on.</p>`,
docs:[['Executors, Oracle','https://docs.oracle.com/javase/tutorial/essential/concurrency/executors.html'],['ExecutorService, API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ExecutorService.html']],
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
hints:['Loop: <code>for (int i = 1; i <= n; i++) { final int v = i; futures.add(pool.submit(() -> v * v)); }</code>','Sum in a second loop: <code>for (Future&lt;Integer&gt; f : futures) sum += f.get();</code>','finally { pool.shutdown(); }. Submission loop errors must not leak threads.'],
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
<p><code>CompletableFuture</code> composes async work like streams compose data, with no manual thread juggling:</p>
<div class="codeSample" data-hl>CompletableFuture&lt;String&gt; user  = CompletableFuture.supplyAsync(() -&gt; fetchUser(id));
CompletableFuture&lt;String&gt; perms = CompletableFuture.supplyAsync(() -&gt; fetchPermissions(id));

CompletableFuture&lt;String&gt; page = user
    .thenCombine(perms, (u, p) -&gt; render(u, p))   // join two async results
    .thenApply(String::toUpperCase)               // transform when ready
    .exceptionally(ex -&gt; "fallback page");        // recover from failure

String result = page.join();   // block only at the very edge</div>
<p>Key verbs: <code>supplyAsync</code> (start work), <code>thenApply</code> (map), <code>thenCompose</code> (flatMap: next async step), <code>thenCombine</code> (zip two), <code>exceptionally</code>/<code>handle</code> (recover), <code>allOf</code> (fan-in). This is the JDK's answer to async/await. In your API-platform world, it's how you fan out to services without blocking threads.</p>
<h4>The problem it solves: blocking wastes a whole thread</h4>
<p>A thread waiting on a network call is doing nothing while holding a megabytes-sized stack and a slot in
your pool. Fan out to three services sequentially and you have paid three latencies end to end when the
work could have overlapped. <code>CompletableFuture</code> lets you describe the <i>dependency graph</i>
between pieces of work and let the runtime schedule it, rather than writing the coordination by hand with
latches and futures you have to poll.</p>

<h4>The verb you must get right: <code>thenApply</code> vs <code>thenCompose</code></h4>
<div class="codeSample" data-hl>// thenApply = map.        fn returns a VALUE
cf.thenApply(user -&gt; user.name())            // CF&lt;String&gt;

// thenCompose = flatMap.  fn returns ANOTHER CompletableFuture
cf.thenCompose(user -&gt; fetchOrdersAsync(user))   // CF&lt;List&lt;Order&gt;&gt;

// using thenApply where you needed thenCompose:
cf.thenApply(user -&gt; fetchOrdersAsync(user))     // CF&lt;CF&lt;List&lt;Order&gt;&gt;&gt;  <-- nested
// it compiles. it type-checks. it is the single most common mistake here.</div>
<p>The <code>...Async</code> suffix is the other thing to understand: <code>thenApply</code> may run the
callback on whichever thread completed the previous stage, including, in the worst case, the caller's
thread. <code>thenApplyAsync</code> forces it onto an executor. If a callback does anything slow, use the
async variant <b>and pass your own executor</b>, because the default is the common ForkJoinPool, which is
sized for CPU-bound work and shared with parallel streams across the entire JVM.</p>

<h4>Failure is where this gets subtle</h4>
<p>An exception does not propagate; it <i>completes the future exceptionally</i>, and every downstream
stage is skipped until something handles it. Which means an unhandled failure is silent unless you
consume the result: no stack trace, no log line, just a value that never arrives.</p>
<div class="codeSample" data-hl>.exceptionally(ex -&gt; fallback)   // recover; only runs on failure
.handle((v, ex) -&gt; ...)          // sees BOTH outcomes; always runs
.whenComplete((v, ex) -&gt; ...)    // observe without changing the result

// note: the exception you receive is wrapped in CompletionException.
// unwrap with ex.getCause() or your instanceof checks will never match.</div>
<p>And the two ways to wait differ: <code>get()</code> throws checked exceptions,
<code>join()</code> throws unchecked. Both <b>block</b>, so they belong at the edge of your program: one
<code>join()</code> in the middle of a pipeline undoes the point of building it.</p>

<h4>What it does not give you</h4>
<p>There is no cancellation that propagates to work already running, no timeout before Java 9's
<code>orTimeout</code>, and no structural relationship between a task and its subtasks: an orphaned
branch of the graph can keep running after you have stopped caring. Java 21's <b>structured concurrency</b>
and virtual threads address exactly that, and for straightforward fan-out on a virtual thread, ordinary
blocking calls are now both simpler and easier to debug. Reach for
<code>CompletableFuture</code> when the composition itself is the point.</p>`,
docs:[['CompletableFuture, API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/CompletableFuture.html'],['CompletableFuture guide, Baeldung','https://www.baeldung.com/java-completablefuture']],
ex:{title:'Fan out, then combine',
prompt:`Write <code>Async</code> with <code>static String profile(String id)</code>: start two async suppliers with <code>supplyAsync</code> (one returning <code>"user:" + id</code>, one returning <code>"roles:admin"</code>), combine them with <code>thenCombine</code> joining with <code>" | "</code>, add <code>exceptionally</code> returning <code>"profile unavailable"</code>, and return the result via <code>join()</code>.`,
starter:`import java.util.concurrent.*;

public class Async {
    static String profile(String id) {
        // supplyAsync x2 -> thenCombine -> exceptionally -> join
        return null;
    }
}`,
tests:[{d:'Two supplyAsync calls',re:'supplyAsync[\\s\\S]*supplyAsync'},{d:'thenCombine joins them',re:'thenCombine\\s*\\('},{d:'exceptionally fallback',re:'exceptionally\\s*\\('},{d:'join() at the edge',re:'\\.join\\s*\\(\\s*\\)'},{d:'No Thread.sleep busy-waiting',re:'Thread\\.sleep',not:true}],
behavior:`1. profile("42") returns "user:42 | roles:admin". 2. If either supplier threw, the result is "profile unavailable" (no exception escapes). 3. Both suppliers run concurrently; combine waits for both. 4. join() is the only blocking call.`,
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
Task t = queue.take(); // consumer blocks when empty, no polling!

CountDownLatch ready = new CountDownLatch(3);
// each worker: ready.countDown();  main: ready.await();</div>
<p><code>ConcurrentHashMap</code> beats <code>Collections.synchronizedMap</code> (striped, and compound ops like merge/compute are atomic). <code>AtomicInteger/Long</code> for counters, <code>LongAdder</code> under heavy contention. <code>CountDownLatch</code> = one-shot "wait for N events"; <code>Semaphore</code> = permits; <code>CyclicBarrier</code> = reusable meeting point.</p>

<h4>Thread-safe collection, unsafe usage</h4>
<p>The mistake that survives every code review: each <i>operation</i> on a concurrent collection is
atomic, but a <i>sequence</i> of them is not. Check-then-act is a race no matter how thread-safe the
map is.</p>
<div class="codeSample" data-hl>// BROKEN, two threads can both see absent and both put
if (!map.containsKey(k)) map.put(k, expensive(k));

// CORRECT, one atomic operation
map.computeIfAbsent(k, this::expensive);

// counters
map.merge(k, 1L, Long::sum);          // atomic increment-or-insert

// and the same trap with the "synchronized" wrappers:
List&lt;String&gt; l = Collections.synchronizedList(new ArrayList&lt;&gt;());
for (String s : l) { ... }            // NOT safe, iteration needs the lock</div>
<p><code>ConcurrentHashMap</code> beats <code>synchronizedMap</code> not merely on speed but because it
<i>offers</i> the atomic compound operations (<code>computeIfAbsent</code>, <code>merge</code>,
<code>putIfAbsent</code>, <code>compute</code>) that make correct code expressible. Keep the mapping
function short and side-effect free; it runs while holding a lock on that bin, and calling back into
the same map from inside it can deadlock.</p>

<h4>Atomics, and when they stop being enough</h4>
<p><code>AtomicInteger</code> and friends give you lock-free compare-and-swap. Under heavy contention
CAS starts failing and retrying, which is why <b><code>LongAdder</code> outperforms
<code>AtomicLong</code> for hot counters</b>: it spreads updates across cells and sums them only when
read. Use <code>AtomicLong</code> when you read the value constantly, <code>LongAdder</code> when you
mostly write.</p>
<p>Atomics cover a <i>single</i> variable. Two variables that must change together need a lock, or a
single immutable object swapped atomically via <code>AtomicReference</code>.</p>

<h4>Picking the right coordinator</h4>
<div class="codeSample" data-hl>CountDownLatch   one-shot gate. count only goes DOWN, never resets.
                 "wait until N services have started"
CyclicBarrier    reusable rendezvous. all N wait for each other, then all
                 proceed; resets automatically. simulation rounds.
Semaphore        N permits, a bounded resource. acquire/release, and
                 RELEASE IN A FINALLY BLOCK or you leak permits until
                 everything blocks forever.
Phaser           barrier with a variable number of parties.</div>
<p>The distinction that matters: a latch cannot be reset, so "wait for startup" is a latch and "wait for
everyone each round" is a barrier. Using a latch where you needed a barrier produces code that works
exactly once.</p>
<p><b>Prefer structure to primitives.</b> Most code that reaches for a latch actually wants
<code>invokeAll</code> on an executor, or <code>CompletableFuture.allOf</code>. Reach for these when
the higher-level tools genuinely do not fit.</p>`,
docs:[['Concurrent collections, Oracle','https://docs.oracle.com/javase/tutorial/essential/concurrency/collections.html'],['java.util.concurrent, API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/package-summary.html']],
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
behavior:`1. 1000 concurrent hit("/login") calls give total() == 1000 and perPath.get("/login") == 1000: no lost updates, no locks. 2. hit on distinct paths tracks each key independently. 3. awaitAll blocks until the latch reaches zero.`,
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
<p>Virtual threads make the thread-per-request model scale: millions of cheap threads multiplexed onto a few OS carriers. Blocking a virtual thread is fine: the JVM parks it and reuses the carrier.</p>
<div class="codeSample" data-hl>// one virtual thread
Thread.ofVirtual().name("vt-1").start(() -&gt; handle(request));

// the server pattern: a virtual thread PER TASK
try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
    for (var req : requests) {
        exec.submit(() -&gt; handle(req));   // blocking I/O inside is fine!
    }
}   // AutoCloseable: waits for tasks</div>
<p>Rules of thumb: virtual threads for I/O-bound fan-out (API calls, DB queries); fixed platform pools still fine for CPU-bound work; don't pool virtual threads (create per task); avoid long <code>synchronized</code> blocks around blocking calls (pinning; use ReentrantLock if needed). Spring Boot 3.2+: <code>spring.threads.virtual.enabled=true</code>.</p>
<h4>Why this changes the advice rather than the language</h4>
<p>For two decades Java had one bad choice to make. <b>Thread-per-request</b> is the model everyone can
read and debug (a stack trace shows the whole request, a debugger steps through it, a profiler attributes
work to it), but it caps concurrency at a few thousand because each request pins an OS thread.
<b>Asynchronous</b> code lifted that cap and cost you all of it: control flow shredded across callbacks,
stack traces that say nothing, and a context that has to be threaded manually.</p>
<p>Virtual threads remove the trade. The JVM schedules many virtual threads onto few carrier threads, and
when one blocks, the JVM <b>unmounts</b> it, stack and all, and reuses the carrier for someone else. The
blocking call still blocks that virtual thread; it no longer blocks anything expensive.</p>
<div class="codeSample" data-hl>platform thread   ~1 MB stack, created by the OS, thousands max
virtual thread    stack on the heap, grows as needed, MILLIONS

// so the old optimization inverts:
POOLING a virtual thread is pointless - creation is nearly free, and a
pool exists to limit an expensive resource. create one per task.

// and blocking stops being a sin:
try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
    exec.submit(() -&gt; { var u = http.send(...); return db.query(u); });
}   // straightforward, blocking, readable - and it scales</div>

<h4>The catch: pinning</h4>
<p>A virtual thread cannot always be unmounted. If it blocks inside a <code>synchronized</code> block or a
native frame, it is <b>pinned</b> to its carrier, and if enough of them pin at once, you have starved the
carrier pool and reinvented the thread limit you were escaping. The fix is to replace
<code>synchronized</code> around blocking I/O with <code>ReentrantLock</code>, which the JVM understands.
Diagnose it with <code>-Djdk.tracePinnedThreads=full</code>. (JDK 24 removed most pinning for
<code>synchronized</code>; on earlier runtimes, treat it as real.)</p>

<h4>What virtual threads do not fix</h4>
<p><b>They are not faster for CPU-bound work.</b> You still have the cores you have; a fixed platform pool
sized to them remains correct.</p>
<p><b>They remove your accidental rate limit.</b> A 200-thread pool was also, quietly, a cap of 200
concurrent calls to the downstream service. Replace it with unbounded virtual threads and you will
discover what that cap was quietly protecting: the database connection pool is now the bottleneck, or you are
DDoSing a partner. Add explicit limits (a <code>Semaphore</code>, a bulkhead) where the pool used to
imply them.</p>
<p><b>ThreadLocal becomes a liability.</b> It was cheap when threads were pooled and few; with millions of
threads, per-thread copies are memory you did not budget for. <b>Scoped values</b> are the modern
replacement for passing context.</p>
<p>Then <b>structured concurrency</b> completes the picture: subtasks forked in a scope are guaranteed to
finish or be canceled before the scope exits, so a failed fan-out cannot leave orphaned work running,
the last piece of async that thread-per-request never handled well.</p>`,
docs:[['Virtual threads, dev.java','https://dev.java/learn/new-features/virtual-threads/'],['JEP 444, Virtual Threads','https://openjdk.org/jeps/444']],
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
behavior:`1. fetchAll(List.of("a","b")) returns ["data-a","data-b"] (order preserved by collecting futures in order). 2. The executor closes automatically, waiting for all tasks. 3. One virtual thread per id; this pattern scales to tens of thousands of ids.`,
hints:['<code>try (var exec = Executors.newVirtualThreadPerTaskExecutor()) { ... }</code>; closing waits for tasks.','Submit in id order: <code>futures.add(exec.submit(() -> "data-" + id));</code>','Second loop: <code>out.add(f.get());</code> keeps the original order.'],
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
}`}},
{id:'con7',title:'Diagnosing & debugging race conditions',body:`
<p>Race conditions are the hardest bugs in the craft because they are <b>non-deterministic</b>: the outcome depends on thread timing, so the same code passes a thousand times and fails once in production. They are the classic <b>heisenbug</b>: attach a debugger or add a log line, the timing shifts, and the bug vanishes. Recognizing the symptoms is half the battle.</p>
<p><b>Read the symptom:</b> intermittent, unreproducible failures under load usually mean a <b>race condition</b> on shared mutable state; threads frozen forever, making no progress, usually mean a <b>deadlock</b>; a total that is <i>almost</i> right but drifts under concurrency means <b>lost updates</b> from unsynchronized read-modify-write.</p>
<p><b>Make it reproducible.</b> A bug you cannot trigger you cannot fix. Amplify the race: run the operation in a tight loop across many threads, add small random sleeps to widen the timing window, and assert an invariant (for example, launch N threads that each increment a counter and check the total equals N). If the total comes out low, you have proven a lost update.</p>
<p><b>Reach for the right tool:</b></p>
<ul>
<li><b>jstack</b> (or a thread dump): snapshots every thread's stack. The JVM even prints "Found one Java-level deadlock" and names the two threads and locks, making deadlocks the <i>easy</i> case once you capture the dump.</li>
<li><b>jcstress</b>: the OpenJDK harness built specifically to stress-test concurrent code against the Java Memory Model and surface races real tests miss.</li>
<li><b>AtomicInteger / atomics</b>: swapping a plain counter for an atomic both fixes lost updates and, in a test, confirms the plain version was racy.</li>
<li>Thread-naming and structured logging so a dump or log tells you <i>which</i> thread did what.</li>
</ul>
<p>The durable cure is design, not detection: minimize shared mutable state, prefer <b>immutability</b> and <b>thread confinement</b>, and guard any remaining shared state with a single, consistent locking discipline (always acquire multiple locks in the same order to prevent deadlock).</p>`,
docs:[['jstack, Oracle','https://docs.oracle.com/en/java/javase/21/docs/specs/man/jstack.html'],['jcstress, OpenJDK','https://github.com/openjdk/jcstress'],['Java Memory Model (JLS 17.4)','https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html#jls-17.4']],
ex:{title:'Diagnose and pick the tool',
prompt:`Write class <code>RaceDebug</code> with two static methods. <code>String classify(String symptom)</code>: <code>"intermittent-failure"</code>→<code>"race condition"</code>, <code>"threads-stuck-forever"</code>→<code>"deadlock"</code>, <code>"lost-updates"</code>→<code>"unsynchronized shared state"</code>, else <code>"unknown"</code>. <code>String tool(String need)</code>: <code>"inspect-thread-dump"</code>→<code>"jstack"</code>, <code>"stress-test-memory-model"</code>→<code>"jcstress"</code>, <code>"safe-counter"</code>→<code>"AtomicInteger"</code>, else <code>"unknown"</code>.`,
starter:`public class RaceDebug {
    static String classify(String symptom) {
        return null;
    }
    static String tool(String need) {
        return null;
    }
}`,
solution:`public class RaceDebug {
    static String classify(String symptom) {
        switch (symptom) {
            case "intermittent-failure":  return "race condition";
            case "threads-stuck-forever": return "deadlock";
            case "lost-updates":          return "unsynchronized shared state";
            default:                      return "unknown";
        }
    }
    static String tool(String need) {
        switch (need) {
            case "inspect-thread-dump":       return "jstack";
            case "stress-test-memory-model":  return "jcstress";
            case "safe-counter":              return "AtomicInteger";
            default:                          return "unknown";
        }
    }
}`,
tests:[{d:'intermittent failure is a race condition',re:'"intermittent-failure".*?"race condition"',flags:'s'},{d:'stuck-forever is a deadlock',re:'"threads-stuck-forever".*?"deadlock"',flags:'s'},{d:'lost updates come from unsynchronized shared state',re:'"lost-updates".*?"unsynchronized shared state"',flags:'s'},{d:'a thread dump is inspected with jstack',re:'"inspect-thread-dump".*?"jstack"',flags:'s'},{d:'stress-test the memory model with jcstress',re:'"stress-test-memory-model".*?"jcstress"',flags:'s'},{d:'a safe counter is an AtomicInteger',re:'"safe-counter".*?"AtomicInteger"',flags:'s'},{d:'unknown default',re:'"unknown"'}],
behavior:`classify("intermittent-failure") is "race condition", classify("threads-stuck-forever") is "deadlock". tool("inspect-thread-dump") is "jstack", tool("safe-counter") is "AtomicInteger". The workflow: reproduce under load, capture a dump or stress test, then fix by shrinking shared mutable state.`,
hints:['Match the symptom to the cause: intermittent = race, frozen = deadlock, drifting totals = lost updates.','jstack captures thread dumps (great for deadlocks); jcstress stress-tests the memory model.','An AtomicInteger both fixes and reveals a lost-update race on a counter.']}}
]});
