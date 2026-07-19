STREAMS.push({icon:'🔌',title:'Networking & Sockets',blurb:'TCP and UDP from first principles: sockets, concurrent servers, and what sits beneath every HTTP call.',lessons:[
{id:'net1',title:'TCP sockets: an echo server',body:`
<p>Beneath HttpClient, Tomcat and every REST call sits the same primitive: a TCP socket — a reliable, ordered byte stream between two machines. The JDK API is two classes:</p>
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
<p>The gotchas that bite: forgetting autoflush (true) on PrintWriter — bytes sit in the buffer and both sides deadlock waiting; and readLine() returning null when the peer closes — that is your end-of-conversation signal, not an error.</p>`,
docs:[['Custom networking trail — Oracle','https://docs.oracle.com/javase/tutorial/networking/sockets/index.html'],['ServerSocket — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/net/ServerSocket.html']],
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
behavior:`1. A client sending "hi" then "there" receives "echo: hi" and "echo: there". 2. When the client disconnects, readLine() returns null and serveOne returns cleanly. 3. Without autoflush=true the client would hang — the AI runner checks the PrintWriter construction. 4. Every socket and stream closes via try-with-resources.`,
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
<p>The echo server above serves one client at a time — client two waits in the OS queue. The classic fix is a thread per connection, and virtual threads (Concurrency stream!) made that pattern scale again:</p>
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
        // one client failing must never kill the server — log and move on
    }
}</div>
<p>Design rules: the accept loop does nothing but accept and dispatch; each handler owns (and closes) its socket — note <code>try (client; ...)</code> adopting it; per-client exceptions are contained. This is architecturally what Tomcat does under Spring — now you know what <code>server.tomcat.threads.max</code> actually controls.</p>`,
docs:[['Virtual threads — JEP 444','https://openjdk.org/jeps/444'],['Writing servers — Oracle trail','https://docs.oracle.com/javase/tutorial/networking/sockets/clientServer.html']],
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
behavior:`1. Two clients connected simultaneously both get echoes — neither waits for the other. 2. A client whose connection resets triggers the catch inside handle; serve keeps accepting. 3. Each handler closes its own socket (the try (client; ...) form). 4. accept() runs on the caller's thread; all I/O happens on virtual threads.`,
hints:['The dispatch is one line inside the while: <code>Socket client = server.accept(); exec.submit(() -> handle(client));</code>','handle signature takes the socket; first resource in its try is the socket itself: <code>try (client; var in = ...; var out = ...)</code>','The catch belongs in handle, not serve — containment is the entire lesson.'],
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
<p>UDP is TCP's fire-and-forget sibling: no connection, no ordering, no delivery guarantee — and no handshake latency. It carries DNS, most telemetry/metrics (StatsD), game state, and QUIC/HTTP-3 is built on it.</p>
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
<p>Choose UDP when losing an occasional message is cheaper than waiting for retransmits (metrics, heartbeats); choose TCP when every byte matters (money, auth). The classic decode bug: using the whole buffer instead of <code>packet.getLength()</code> — you get your message plus 1400 bytes of zeroes. For massive-scale single-threaded I/O there is also NIO (<code>Selector</code>, channels) — know it exists; virtual threads have mostly replaced the need to hand-roll it.</p>`,
docs:[['Datagrams — Oracle trail','https://docs.oracle.com/javase/tutorial/networking/datagrams/index.html'],['DatagramSocket — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/net/DatagramSocket.html']],
ex:{title:'Metrics over UDP',
prompt:`Write <code>UdpMetrics</code> with: <code>static void send(String metric, String host, int port) throws Exception</code> — UTF-8 encode the string and send it as a <code>DatagramPacket</code> from a try-with-resources <code>DatagramSocket</code>; and <code>static String receiveOne(java.net.DatagramSocket bound) throws Exception</code> — receive into a 1500-byte buffer and decode <b>only the received length</b> as UTF-8.`,
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
behavior:`1. send("login.count:1", "localhost", 8125) transmits one datagram and closes its socket. 2. receiveOne blocks until a packet arrives, then returns exactly the sent string — no trailing garbage, because decoding uses getLength(). 3. No connection is established at any point — that is UDP. 4. The receiving socket is passed in already bound (caller owns its lifecycle).`,
hints:['Send is three lines: bytes, address, <code>socket.send(new DatagramPacket(data, data.length, addr, port));</code>','Receive needs a pre-sized buffer: <code>byte[] buf = new byte[1500];</code>','The decode: <code>new String(p.getData(), 0, p.getLength(), StandardCharsets.UTF_8)</code> — offset 0, length from the packet.'],
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
