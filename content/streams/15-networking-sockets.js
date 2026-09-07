STREAMS.push({icon:'🔌',title:'Networking & Sockets',blurb:'TCP and UDP from first principles: sockets, concurrent servers, and what sits beneath every HTTP call.',lessons:[
{id:'net1',title:'TCP sockets: an echo server',body:`

<p>Beneath HttpClient, Tomcat and every REST call sits the same primitive: a TCP socket, a reliable, ordered byte stream between two machines. The JDK API is two classes:</p>
<div class="codeSample" data-hl>// SERVER: bind a port, accept connections
try (ServerSocket server = new ServerSocket(7007)) {
    while (true) {
        Socket client = server.accept();          // blocks until someone connects
        try (client;
             var in  = new BufferedReader(new InputStreamReader(client.getInputStream()));
             var out = new PrintWriter(client.getOutputStream(), true)) {  // autoflush!
            String line;
            while ((line = in.readLine()) != null) {
                out.println("echo: " + line);
            }
        }
    }
}

// CLIENT: connect and talk
try (Socket s = new Socket("localhost", 7007);
     var out = new PrintWriter(s.getOutputStream(), true);
     var in  = new BufferedReader(new InputStreamReader(s.getInputStream()))) {
    out.println("hello");
    String reply = in.readLine();                  // "echo: hello"
}</div>

<h4>What the abstraction hides</h4>
<p><b>Byte stream</b> means there are no messages. The sender's three <code>println</code> calls may arrive as one read or as seven, because TCP is free to coalesce and split. Any protocol on top must define its own framing: a delimiter (the newline <code>readLine</code> relies on), a length prefix, or a fixed size. Assuming one write equals one read is the most common socket bug. It passes every test on localhost and fails across a real network.</p>
<p><b>Reliable and ordered</b> means TCP retransmits and reassembles beneath you. Delivery is still not guaranteed. Failure surfaces as an exception or a closed stream rather than as silent corruption.</p>

<h4>Buffering, flushing and the deadlock</h4>
<p><code>PrintWriter</code> buffers. Without autoflush your bytes sit in memory while the peer blocks on a read that never completes. Both sides wait forever. Flush after every complete message, and before you read a response.</p>

<h4>Closing, and the half-open connection</h4>
<p><code>readLine()</code> returning <code>null</code> is the peer's orderly close arriving as end-of-stream. That is information, not an error. The harder case is a connection gone without anyone saying so: a crashed peer or a dropped network. A read then blocks. <code>socket.setSoTimeout(ms)</code> turns that indefinite block into a <code>SocketTimeoutException</code> you can act on. A socket without a timeout is a thread you may never get back, the failure the resilience lessons call a resource leak under partial failure.</p>
<p>Two more. <code>TIME_WAIT</code> keeps a closed port unusable for a couple of minutes. <code>setReuseAddress(true)</code> gets around that during development restarts. Nagle's algorithm delays small writes to improve throughput. <code>setTcpNoDelay(true)</code> disables it when latency matters more.</p>`,
docs:[['Custom networking trail, Oracle','https://docs.oracle.com/javase/tutorial/networking/sockets/index.html'],['ServerSocket, API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/net/ServerSocket.html']],
ex:{title:'Echo, once',
prompt:`Write <code>EchoOnce</code> with <code>static void serveOne(int port) throws java.io.IOException</code>: open a <code>ServerSocket</code> on the port (try-with-resources), <code>accept()</code> ONE client, wrap its streams in a <code>BufferedReader</code> and an auto-flushing <code>PrintWriter</code>, read lines until <code>readLine()</code> returns null, echoing each back prefixed <code>"echo: "</code>. All resources in try-with-resources.`,
starter:`import java.io.*;
import java.net.*;

public class EchoOnce {
    static void serveOne(int port) throws IOException {
        // ServerSocket -> accept -> reader/writer -> echo loop
    }
}`,
tests:[{d:'ServerSocket in try-with-resources',re:'try\\s*\\(\\s*ServerSocket\\s+\\w+\\s*=\\s*new\\s+ServerSocket\\s*\\(\\s*port\\s*\\)'},{d:'Accepts a client',re:'\\.accept\\s*\\(\\s*\\)'},{d:'Auto-flushing PrintWriter',re:'new\\s+PrintWriter\\s*\\([\\s\\S]*?,\\s*true\\s*\\)'},{d:'Reads until null (end of stream)',re:'while\\s*\\(\\s*\\(\\s*\\w+\\s*=\\s*\\w+\\.readLine\\s*\\(\\s*\\)\\s*\\)\\s*!=\\s*null\\s*\\)'},{d:'Echo prefix',re:'"echo: "\\s*\\+'}],
behavior:`1. A client sending "hi" then "there" receives "echo: hi" and "echo: there". 2. When the client disconnects, readLine() returns null and serveOne returns cleanly. 3. Without autoflush=true the client would hang; the AI runner checks the PrintWriter construction. 4. Every socket and stream closes via try-with-resources.`,
hints:['Nest the resources: outer try for ServerSocket, inner try for the accepted Socket + its reader/writer.','Reader: <code>new BufferedReader(new InputStreamReader(client.getInputStream()))</code>','The idiomatic read loop: <code>String line; while ((line = in.readLine()) != null) out.println("echo: " + line);</code>'],
solution:`import java.io.*;
import java.net.*;

public class EchoOnce {
    static void serveOne(int port) throws IOException {
        try (ServerSocket server = new ServerSocket(port)) {
            try (Socket client = server.accept();
                 BufferedReader in = new BufferedReader(
                         new InputStreamReader(client.getInputStream()));
                 PrintWriter out = new PrintWriter(client.getOutputStream(), true)) {
                String line;
                while ((line = in.readLine()) != null) {
                    out.println("echo: " + line);
                }
            }
        }
    }
}`}},
{id:'net2',title:'Concurrent servers: thread-per-connection',body:`

<p>The echo server above serves one client at a time. Client two waits in the OS queue. The classic fix is a thread per connection, which virtual threads (Concurrency stream!) made scale again:</p>
<div class="codeSample" data-hl>try (ServerSocket server = new ServerSocket(7007);
     var exec = Executors.newVirtualThreadPerTaskExecutor()) {
    while (running) {
        Socket client = server.accept();       // accept on the main thread...
        exec.submit(() -&gt; handle(client));     // ...handle on a virtual thread
    }
}

static void handle(Socket client) {
    try (client;
         var in  = new BufferedReader(new InputStreamReader(client.getInputStream()));
         var out = new PrintWriter(client.getOutputStream(), true)) {
        String line;
        while ((line = in.readLine()) != null) out.println("echo: " + line);
    } catch (IOException e) {
        // one client failing must never kill the server: log and move on
    }
}</div>
<p>The accept loop does nothing but accept and dispatch. Each handler owns and closes its socket (<code>try (client; ...)</code> adopts it). Per-client exceptions are contained.</p>

<h4>Why thread-per-connection came back</h4>
<p>The pattern was abandoned for a decade. A platform thread costs about a megabyte of stack and a context switch to schedule. Ten thousand connections meant ten gigabytes and a scheduler in distress. That arithmetic drove the industry to event loops, non-blocking I/O and callback-shaped code.</p>
<p>Virtual threads change the arithmetic. A virtual thread starts at a few hundred bytes, and when it blocks on I/O the JVM unmounts it from its carrier thread, so a blocked one costs almost nothing. You get blocking code (a simple loop, a real stack trace, ordinary try/finally) at a scale that used to require inverting your control flow. Serving 50,000 connections is once again a thread each.</p>

<h4>What still needs care</h4>
<ul>
<li><b>The accept loop is a single point of serialization.</b> Any work there (a lookup, a log flush, a lock) caps your connection rate.</li>
<li><b>Unbounded dispatch is unbounded load.</b> Cheap threads do not make the database behind them cheap. A semaphore or a bounded queue in front of the expensive resource turns an overload into slow-but-alive instead of a cascade.</li>
<li><b>Every handler needs a timeout</b> and its own exception boundary.</li>
<li><b>Pinning.</b> A virtual thread blocked inside a <code>synchronized</code> block cannot unmount and holds its carrier thread. Prefer <code>ReentrantLock</code> around blocking sections on virtual threads.</li>
</ul>
<p>A servlet container does the same: accept, dispatch, isolate, bound. Under Spring that is Tomcat, and <code>server.tomcat.threads.max</code> is the bound.</p>`,
docs:[['Virtual threads, JEP 444','https://openjdk.org/jeps/444'],['Writing servers, Oracle trail','https://docs.oracle.com/javase/tutorial/networking/sockets/clientServer.html']],
ex:{title:'Fan out the connections',
prompt:`Write <code>EchoServer</code> with <code>static void serve(java.net.ServerSocket server) throws java.io.IOException</code>: open <code>Executors.newVirtualThreadPerTaskExecutor()</code> in try-with-resources, loop <code>while (true)</code> accepting clients, submitting each to the executor calling a <code>private static void handle(java.net.Socket client)</code> that echoes lines (prefix <code>"echo: "</code>) and <b>catches IOException inside itself</b> so one bad client never kills the loop.`,
starter:`import java.io.*;
import java.net.*;
import java.util.concurrent.*;

public class EchoServer {
    static void serve(ServerSocket server) throws IOException {
        // executor + accept/dispatch loop
    }

    private static void handle(Socket client) {
        // adopt the socket in try-with-resources, echo, catch IOException here
    }
}`,
tests:[{d:'Virtual-thread executor in try-with-resources',re:'try\\s*\\(\\s*var\\s+\\w+\\s*=\\s*Executors\\.newVirtualThreadPerTaskExecutor\\s*\\(\\s*\\)\\s*\\)'},{d:'Accept loop dispatches to the executor',re:'\\.submit\\s*\\(\\s*\\(\\s*\\)\\s*->\\s*handle\\s*\\('},{d:'handle adopts the socket in its try',re:'try\\s*\\(\\s*client\\s*;'},{d:'IOException contained in handle',re:'private\\s+static\\s+void\\s+handle[\\s\\S]*catch\\s*\\(\\s*IOException'},{d:'Echo loop present',re:'"echo: "\\s*\\+'}],
behavior:`1. Two clients connected simultaneously both get echoes; neither waits for the other. 2. A client whose connection resets triggers the catch inside handle; serve keeps accepting. 3. Each handler closes its own socket (the try (client; ...) form). 4. accept() runs on the caller's thread; all I/O happens on virtual threads.`,
hints:['The dispatch is one line inside the while: <code>Socket client = server.accept(); exec.submit(() -> handle(client));</code>','handle signature takes the socket; first resource in its try is the socket itself: <code>try (client; var in = ...; var out = ...)</code>','The catch belongs in handle, not serve; containment is the entire lesson.'],
solution:`import java.io.*;
import java.net.*;
import java.util.concurrent.*;

public class EchoServer {
    static void serve(ServerSocket server) throws IOException {
        try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
            while (true) {
                Socket client = server.accept();
                exec.submit(() -> handle(client));
            }
        }
    }

    private static void handle(Socket client) {
        try (client;
             BufferedReader in = new BufferedReader(
                     new InputStreamReader(client.getInputStream()));
             PrintWriter out = new PrintWriter(client.getOutputStream(), true)) {
            String line;
            while ((line = in.readLine()) != null) {
                out.println("echo: " + line);
            }
        } catch (IOException e) {
            System.err.println("client error: " + e.getMessage());
        }
    }
}`}},
{id:'net3',title:'UDP, DNS & when not to use TCP',body:`

<p>UDP is TCP's fire-and-forget sibling: no connection, no ordering, no delivery guarantee, and no handshake latency. It carries DNS, most telemetry/metrics (StatsD), game state, and QUIC/HTTP-3 is built on it.</p>
<div class="codeSample" data-hl>// SEND a datagram
try (DatagramSocket socket = new DatagramSocket()) {
    byte[] data = "ping".getBytes(StandardCharsets.UTF_8);
    InetAddress host = InetAddress.getByName("metrics.dojo.dev");  // DNS lookup
    socket.send(new DatagramPacket(data, data.length, host, 8125));
}

// RECEIVE
try (DatagramSocket socket = new DatagramSocket(8125)) {
    byte[] buf = new byte[1500];                    // ~one MTU
    DatagramPacket packet = new DatagramPacket(buf, buf.length);
    socket.receive(packet);                          // blocks
    String msg = new String(packet.getData(), 0, packet.getLength(),
                            StandardCharsets.UTF_8); // ONLY getLength() bytes!
}</div>
<p>Choose UDP when losing an occasional message is cheaper than waiting for retransmits (metrics, heartbeats). Choose TCP when every byte matters (money, auth). NIO (<code>Selector</code>, channels) exists for massive-scale single-threaded I/O, though virtual threads mostly replace hand-rolling it.</p>

<h4>The trade</h4>
<p>TCP buys reliability with <b>head-of-line blocking</b>. A lost packet stalls everything behind it until the retransmission arrives, because the stream must be delivered in order. For a file that is right. A metrics value redelivered 200ms late is worthless. A retransmitted audio packet arrives after the moment it described has passed. UDP is the choice whenever <i>late</i> is worse than <i>missing</i>.</p>
<p>UDP gives you nothing else: no ordering, no deduplication, no congestion control, no connection. Anything from that list, you build yourself. QUIC did. Its authors chose UDP over modifying TCP because middleboxes have ossified TCP so thoroughly that a new transport deploys more easily inside UDP than as a kernel change.</p>

<h4>Size, loss and the buffer bug</h4>
<p>A datagram arrives whole or not at all. Its practical size limit is the path MTU, about 1,472 bytes of payload over typical Ethernet. Above that, IP fragments it, and losing any fragment loses the whole datagram. Keep datagrams under the MTU.</p>
<p>The decode bug is invisible in testing. <code>packet.getLength()</code> is how many bytes arrived, <code>buf.length</code> is how big the buffer is. Decode the whole buffer and you get your message plus 1400 bytes of zeroes, or the remains of the previous message: a small information leak between clients sharing your socket.</p>

<h4>DNS is the UDP you use every day</h4>
<p>Name resolution is a UDP request and reply. It is fast, and fails in ways HTTP does not: silently, or by timing out with no connection to blame. In a JVM service, resolution happens on the calling thread and can block it, and results are cached according to <code>networkaddress.cache.ttl</code>. That cache keeps a service hammering the old IP after a failover. Check it first when "DNS was updated an hour ago but traffic is still going to the dead host".</p>`,
docs:[['Datagrams, Oracle trail','https://docs.oracle.com/javase/tutorial/networking/datagrams/index.html'],['DatagramSocket, API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/net/DatagramSocket.html']],
ex:{title:'Metrics over UDP',
prompt:`Write <code>UdpMetrics</code> with: <code>static void send(String metric, String host, int port) throws Exception</code>: UTF-8 encode the string and send it as a <code>DatagramPacket</code> from a try-with-resources <code>DatagramSocket</code>; and <code>static String receiveOne(java.net.DatagramSocket bound) throws Exception</code>: receive into a 1500-byte buffer and decode <b>only the received length</b> as UTF-8.`,
starter:`import java.net.*;
import java.nio.charset.StandardCharsets;

public class UdpMetrics {
    static void send(String metric, String host, int port) throws Exception {
        // encode -> resolve -> send
    }

    static String receiveOne(DatagramSocket bound) throws Exception {
        // buffer -> receive -> decode getLength() bytes
        return null;
    }
}`,
tests:[{d:'UTF-8 encoding on send',re:'getBytes\\s*\\(\\s*StandardCharsets\\.UTF_8\\s*\\)'},{d:'Resolves the host via InetAddress',re:'InetAddress\\.getByName\\s*\\(\\s*host\\s*\\)'},{d:'Socket in try-with-resources',re:'try\\s*\\(\\s*DatagramSocket'},{d:'Receives into a packet',re:'\\.receive\\s*\\(\\s*\\w+\\s*\\)'},{d:'Decodes exactly getLength() bytes',re:'new\\s+String\\s*\\(\\s*\\w+\\.getData\\s*\\(\\s*\\)\\s*,\\s*0\\s*,\\s*\\w+\\.getLength\\s*\\(\\s*\\)'}],
behavior:`1. send("login.count:1", "localhost", 8125) transmits one datagram and closes its socket. 2. receiveOne blocks until a packet arrives, then returns exactly the sent string: no trailing garbage, because decoding uses getLength(). 3. No connection is established at any point; that is UDP. 4. The receiving socket is passed in already bound (caller owns its lifecycle).`,
hints:['Send is three lines: bytes, address, <code>socket.send(new DatagramPacket(data, data.length, addr, port));</code>','Receive needs a pre-sized buffer: <code>byte[] buf = new byte[1500];</code>','The decode: <code>new String(p.getData(), 0, p.getLength(), StandardCharsets.UTF_8)</code>: offset 0, length from the packet.'],
solution:`import java.net.*;
import java.nio.charset.StandardCharsets;

public class UdpMetrics {
    static void send(String metric, String host, int port) throws Exception {
        byte[] data = metric.getBytes(StandardCharsets.UTF_8);
        InetAddress addr = InetAddress.getByName(host);
        try (DatagramSocket socket = new DatagramSocket()) {
            socket.send(new DatagramPacket(data, data.length, addr, port));
        }
    }

    static String receiveOne(DatagramSocket bound) throws Exception {
        byte[] buf = new byte[1500];
        DatagramPacket packet = new DatagramPacket(buf, buf.length);
        bound.receive(packet);
        return new String(packet.getData(), 0, packet.getLength(), StandardCharsets.UTF_8);
    }
}`}}
]});
