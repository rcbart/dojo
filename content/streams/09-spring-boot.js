STREAMS.push({icon:'🍃',title:'Spring Boot',blurb:'Auto-configuration, dependency injection, REST controllers, data access and configuration.',lessons:[
{id:'spr1',title:'Why Boot: starters & auto-configuration',body:`
<p>Spring Boot = Spring with the setup automated. Three pillars:</p>
<ul>
<li><b>Starters</b>: one dependency pulls a curated, version-compatible set: <code>spring-boot-starter-web</code> gives you Spring MVC + Jackson + embedded Tomcat.</li>
<li><b>Auto-configuration</b>: Boot inspects the classpath and configures beans accordingly (H2 present → in-memory DataSource, web starter → DispatcherServlet).</li>
<li><b>Embedded server</b>: your app is a runnable jar: <code>java -jar app.jar</code>, no Tomcat installation.</li>
</ul>
<div class="codeSample" data-hl>@SpringBootApplication   // = @Configuration + @EnableAutoConfiguration + @ComponentScan
public class DojoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DojoApplication.class, args);
    }
}</div>
<p>Start any project at <a href="https://start.spring.io" target="_blank" rel="noopener">start.spring.io</a>. Component scanning finds your annotated classes in the same package and below; the #1 beginner bug is putting classes outside that package tree.</p>
<h4>The problem Boot solved</h4>
<p>Spring before Boot could do everything and was miserable to start. A web application meant hand-picking a dozen
mutually-compatible library versions, writing XML or Java configuration for the DispatcherServlet, the
view resolver, the data source and the transaction manager, then packaging a WAR and deploying it into a
Tomcat someone had installed and configured separately. Days of work before a single line of business
logic.</p>
<p>Boot's insight was that <b>almost every application makes the same choices</b>, so those choices should
be defaults rather than decisions. Nothing is taken away (you can override any of it), but you only pay
for the parts you actually want to change.</p>

<h4>How auto-configuration really works</h4>
<p>It is worth demystifying, because it feels like magic until you see the mechanism, and then it is
obvious. Auto-configuration classes are ordinary <code>@Configuration</code> classes listed in a file
Boot reads at startup. Each one is guarded by conditions:</p>
<div class="codeSample" data-hl>@ConditionalOnClass(DataSource.class)        // is this on the classpath?
@ConditionalOnMissingBean(DataSource.class)  // did the USER already define one?
@ConditionalOnProperty("spring.datasource.url")

// that second condition is the important one: every auto-configuration
// backs off the moment you declare your own bean. "convention over
// configuration" is implemented as "yours wins, always".</div>
<p>Which means the debugging tool you need is <code>--debug</code> at startup: Boot prints a
<b>condition evaluation report</b> listing every auto-configuration that matched, every one that did not,
and precisely which condition failed. Nearly every "why isn't Boot configuring this?" question is
answered there in seconds.</p>

<h4>The failure modes worth knowing early</h4>
<p><b>Package placement.</b> <code>@ComponentScan</code> starts at the package of your
<code>@SpringBootApplication</code> class and goes downward only. A class in a sibling package is
invisible, and the symptom is a confusing "no qualifying bean" error rather than anything pointing at
packages. Keep the main class in the root package of your project.</p>
<p><b>Fighting the defaults.</b> When Boot configures something you did not want, the fix is usually a
property or a bean of your own, not <code>exclude</code> on the auto-configuration, which tends to
remove more than you intended and breaks silently on upgrade.</p>
<p><b>Starter version drift.</b> The starters work because the parent POM or BOM pins a tested set of
versions. Overriding one library's version individually is how you reintroduce exactly the dependency
hell starters exist to prevent.</p>`,
docs:[['Spring Boot reference','https://docs.spring.io/spring-boot/index.html'],['Spring Initializr','https://start.spring.io'],['Building an Application with Spring Boot (guide)','https://spring.io/guides/gs/spring-boot']],
ex:{title:'Boot entry point',
prompt:`Write the main class <code>DojoApplication</code> for a Boot app in package <code>com.example.dojo</code>: package declaration, the right annotation, and a main method that launches the application context.`,
starter:`// package declaration?

// import org.springframework.boot.SpringApplication;
// import org.springframework.boot.autoconfigure.SpringBootApplication;

public class DojoApplication {
    // annotation missing; main missing
}`,
tests:[{d:'Package com.example.dojo',re:'package\\s+com\\.example\\.dojo\\s*;'},{d:'@SpringBootApplication on the class',re:'@SpringBootApplication\\s*(public\\s+)?class'},{d:'Standard main',re:'public\\s+static\\s+void\\s+main'},{d:'SpringApplication.run with class token',re:'SpringApplication\\.run\\s*\\(\\s*DojoApplication\\.class\\s*,\\s*args\\s*\\)'}],
behavior:`1. Compiles as a Boot entry point. 2. @SpringBootApplication sits directly on the class. 3. main calls SpringApplication.run(DojoApplication.class, args). 4. Package matters: everything else in the app must live under com.example.dojo to be scanned.`,
hints:['First line: <code>package com.example.dojo;</code>','The single annotation @SpringBootApplication bundles configuration + auto-config + component scan.','main body is one line: <code>SpringApplication.run(DojoApplication.class, args);</code>'],
solution:`package com.example.dojo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DojoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DojoApplication.class, args);
    }
}`}},
{id:'spr1b',title:'The Spring Boot annotation map',body:`
<p>Spring Boot is programmed almost entirely through annotations. Learn them as <b>families</b>, not a flat list:</p>
<ul>
<li><b>Stereotypes</b> (make a class a bean via scanning): <code>@Component</code> generic; <code>@Service</code> business logic; <code>@Repository</code> data access (adds exception translation); <code>@Controller</code>/<code>@RestController</code> web.</li>
<li><b>Configuration</b>: <code>@Configuration</code> + <code>@Bean</code> for manual bean recipes; <code>@Value("$${'{'}dojo.x}")</code> single property; <code>@ConfigurationProperties</code> typed blocks; <code>@Profile("prod")</code> conditional beans; <code>@ConditionalOnProperty</code> and friends, the machinery of auto-configuration itself.</li>
<li><b>Injection control</b>: <code>@Autowired</code> (skippable on single constructors), <code>@Qualifier("name")</code> to pick between candidates, <code>@Primary</code> to set the default.</li>
<li><b>Web binding</b>: <code>@GetMapping/@PostMapping…</code>, <code>@PathVariable</code>, <code>@RequestParam</code>, <code>@RequestBody</code>, <code>@ResponseStatus</code>, <code>@RestControllerAdvice</code>/<code>@ExceptionHandler</code>.</li>
<li><b>Lifecycle & behavior</b>: <code>@PostConstruct</code>/<code>@PreDestroy</code> hooks; <code>@Transactional</code>, <code>@Cacheable</code>, <code>@Scheduled</code>, <code>@Async</code>. These four work via <b>proxies</b>: Spring wraps your bean and intercepts the call, which is why self-invocation (this.method()) bypasses them.</li>
<li><b>Testing</b>: <code>@SpringBootTest</code> full context, <code>@WebMvcTest</code>/<code>@DataJpaTest</code> slices, <code>@MockBean</code> swap a bean for a mock.</li>
</ul>
<p><b>How it works under the hood</b>: component scanning finds annotated classes (reflection, your dep4 lesson), auto-configuration applies <code>@Conditional*</code> recipes based on the classpath, and behavior annotations generate runtime proxies. Nothing magic: just the annotation + reflection machinery you already built by hand, industrialized.</p>

<h4>Reading an annotation as a question</h4>
<p>Each family answers one question, and knowing which question is what stops the list from being memorization. Stereotypes answer <b>"should Spring manage this class?"</b>, and the choice among <code>@Component</code>, <code>@Service</code> and <code>@Repository</code> is documentation plus one behavior: <code>@Repository</code> translates persistence exceptions into Spring's <code>DataAccessException</code> hierarchy. Configuration annotations answer <b>"where does this value or bean come from?"</b>. Injection annotations answer <b>"which of the candidates?"</b>. Web annotations answer <b>"how does an HTTP request become arguments?"</b>. Behavior annotations answer <b>"what should happen around this call?"</b>, and those are the ones with a proxy behind them.</p>

<h4>The two that cause the most confusion</h4>
<p><code>@Value</code> versus <code>@ConfigurationProperties</code>: the first injects one property and is fine for a handful; the second binds a whole prefix into a typed object with validation, IDE completion and a single place to document the settings. Past three related properties, the typed block is the better answer.</p>
<p><code>@Autowired</code> on fields versus constructor injection: field injection cannot produce a <code>final</code> field, hides dependencies from anyone constructing the class in a test, and allows an object to exist in a half-initialized state. Constructor injection has none of those problems and needs no annotation at all on a single constructor, which is why modern Spring code has almost no <code>@Autowired</code> in it.</p>

<h4>When the wiring goes wrong</h4>
<p>Three errors cover most of it. <b>"No qualifying bean of type X"</b> means either nothing declares it or the class is outside the component scan; remember scanning starts at the <code>@SpringBootApplication</code> package and searches downward only. <b>"Expected single matching bean but found 2"</b> wants a <code>@Qualifier</code> or a <code>@Primary</code>. And <b>"Requested bean is currently in creation"</b> is a circular dependency, which is a design signal rather than a puzzle: the cycle usually means a responsibility sits in the wrong class, and <code>@Lazy</code> hides it rather than fixing it.</p>
<p>When a bean you expect is missing, start the app with <code>--debug</code> and read the <b>condition evaluation report</b>: it lists every auto-configuration that matched, every one that did not, and the exact condition that failed. That report is the difference between debugging Spring and guessing at it.</p>`,
docs:[['Spring annotation-based container config','https://docs.spring.io/spring-framework/reference/core/beans/annotation-config.html'],['Spring Boot auto-configuration','https://docs.spring.io/spring-boot/reference/using/auto-configuration.html'],['@Transactional proxying (Spring)','https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html']],
ex:{title:'Annotate the skeleton',
prompt:`Fill in the right annotations (marked by comments) on this mini-app: the config class producing a <code>Clock</code> bean; a repository stereotype on <code>LedgerRepo</code>; a service stereotype plus <code>@Transactional</code> on <code>LedgerService.post()</code>; a REST controller mapped to <code>/api/ledger</code> whose <code>create</code> method answers POST, takes the body as a DTO, and returns 201 via <code>@ResponseStatus</code>; and an init hook method annotated to run after construction.`,
starter:`import org.springframework.context.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import jakarta.annotation.PostConstruct;
import java.time.Clock;

/* config class */
class TimeConfig {
    /* bean method */
    Clock clock() { return Clock.systemUTC(); }
}

/* repository stereotype */
class LedgerRepo {
    void save(String entry) {}
}

/* service stereotype */
class LedgerService {
    /* transactional */
    void post(String entry) {}

    /* run after construction */
    void warmUp() {}
}

/* rest controller, mapped to /api/ledger */
class LedgerController {
    /* POST + created status + body binding */
    String create(/* bind the request body */ String dto) { return dto; }
}`,
tests:[{d:'@Configuration + @Bean recipe',re:'@Configuration\\s*(class|\\n)[\\s\\S]*?@Bean'},{d:'@Repository on the repo',re:'@Repository\\s*\\n?\\s*class\\s+LedgerRepo'},{d:'@Service with @Transactional method',re:'@Service[\\s\\S]*?@Transactional\\s*\\n?\\s*void\\s+post'},{d:'@PostConstruct hook',re:'@PostConstruct\\s*\\n?\\s*void\\s+warmUp'},{d:'@RestController mapped to /api/ledger',re:'@RestController\\s*\\n?\\s*@RequestMapping\\s*\\(\\s*"/api/ledger"\\s*\\)'},{d:'POST + 201 + @RequestBody',re:'@PostMapping[\\s\\S]*?@ResponseStatus\\s*\\(\\s*HttpStatus\\.CREATED\\s*\\)[\\s\\S]*?@RequestBody'}],
behavior:`1. Every comment slot is replaced by the correct annotation. 2. TimeConfig is @Configuration with a @Bean method. 3. Stereotypes match roles: @Repository, @Service, @RestController. 4. create() carries @PostMapping, @ResponseStatus(HttpStatus.CREATED) and binds via @RequestBody. 5. warmUp runs once after DI completes (@PostConstruct).`,
hints:['Config pair: <code>@Configuration</code> on the class, <code>@Bean</code> on the recipe method.','Stereotype = role: repo/service/controller each get their own; @Transactional sits on the method (or class).','The controller stack: @RestController + @RequestMapping on the class; @PostMapping + @ResponseStatus + @RequestBody around create.'],
solution:`import org.springframework.context.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import jakarta.annotation.PostConstruct;
import java.time.Clock;

@Configuration
class TimeConfig {
    @Bean
    Clock clock() { return Clock.systemUTC(); }
}

@Repository
class LedgerRepo {
    void save(String entry) {}
}

@Service
class LedgerService {
    @Transactional
    void post(String entry) {}

    @PostConstruct
    void warmUp() {}
}

@RestController
@RequestMapping("/api/ledger")
class LedgerController {
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    String create(@RequestBody String dto) { return dto; }
}`}},
{id:'spr2',title:'Dependency injection & beans',body:`
<p>Spring's core: you declare components, the container builds the object graph. <b>Inversion of control</b>: classes receive their dependencies instead of constructing them, so everything is swappable and testable.</p>
<div class="codeSample" data-hl>@Service
public class TokenService {
    private final Clock clock;                 // dependency

    public TokenService(Clock clock) {         // constructor injection
        this.clock = clock;                    // no @Autowired needed (single ctor)
    }
}

@Configuration
class TimeConfig {
    @Bean Clock clock() { return Clock.systemUTC(); }   // manual bean
}</div>
<p>Stereotypes: <code>@Component</code> (generic), <code>@Service</code>, <code>@Repository</code>, <code>@Controller</code>/<code>@RestController</code>: all become beans via scanning. <b>Prefer constructor injection with final fields</b> over field <code>@Autowired</code>: immutable, explicit, unit-testable with plain <code>new</code>.</p>
<h4>Why inversion of control is worth the indirection</h4>
<p>The argument is easy to state and easy to miss. When a class constructs its own dependencies, it has
also decided which implementation to use, when it is created, and how long it lives: permanently, in
code, at every call site. Swapping the implementation means editing every class that names it, and
testing means somehow preventing a real database connection from being opened inside a constructor.</p>
<p>Injection moves those three decisions out of the class and into one place. The class states
<i>what it needs</i>; something else decides <i>what it gets</i>. That is the whole idea, and everything
else (scanning, annotations, contexts) is machinery serving it.</p>

<h4>Constructor injection, and why it is not just a style preference</h4>
<div class="codeSample" data-hl>// field injection - what it costs you
@Service class OrderService {
    @Autowired private PaymentClient payments;   // not final: mutable
                                                 // invisible: the API hides it
}
new OrderService();       // compiles. object is BROKEN - payments is null.

// constructor injection
@Service class OrderService {
    private final PaymentClient payments;        // final: cannot change
    OrderService(PaymentClient payments) { this.payments = payments; }
}
new OrderService(fake);   // the ONLY way to build it is correctly.</div>
<p>Three concrete consequences. The object is <b>never in an invalid state</b>: there is no window
between construction and injection. The dependencies are <b>visible in the signature</b>, so a
constructor with nine parameters tells you outright that the class does too much, where nine
<code>@Autowired</code> fields hide it. And tests use plain <code>new</code>, with no Spring context and
no reflection.</p>

<h4>Scopes and the trap inside them</h4>
<p>Beans are <b>singletons</b> by default (one instance shared by every caller), which means a singleton
must be stateless or thread-safe. A mutable field on a <code>@Service</code> is shared across every
concurrent request, and the resulting bug is intermittent, load-dependent and unpleasant to
reproduce.</p>
<p>The subtler version is injecting a shorter-lived bean into a longer-lived one: a request-scoped bean
injected into a singleton is resolved once, at startup, and then stays. Spring offers scoped proxies for
this, but the better instinct is usually to pass the short-lived thing as a method parameter instead.</p>

<h4>Circular dependencies are a design signal</h4>
<p>If A needs B and B needs A, constructor injection cannot build either, and Boot fails at startup, which
is the correct behavior, not an obstacle. The cycle is telling you the responsibility split is wrong.
The fix is to extract the shared concern into a third component, or to invert one direction with an event.
Reaching for <code>@Lazy</code> or setter injection makes the failure go away and leaves the design
problem in place.</p>`,
docs:[['Spring IoC container, reference','https://docs.spring.io/spring-framework/reference/core/beans.html'],['Constructor injection, Baeldung','https://www.baeldung.com/constructor-injection-in-spring']],
ex:{title:'Wire it the right way',
prompt:`Create <code>@Service class AuditService</code> with method <code>void log(String event)</code> (print it), and <code>@Service class TransferService</code> that depends on AuditService via <b>constructor injection into a final field</b> (no field @Autowired). TransferService has <code>void transfer(String from, String to, long cents)</code> that calls <code>audit.log(...)</code> with a message containing the three arguments.`,
starter:`import org.springframework.stereotype.Service;

@Service
class AuditService {
    void log(String event) {
        // print the event
    }
}

@Service
class TransferService {
    // final field + constructor injection

    void transfer(String from, String to, long cents) {
        // do the "transfer", audit it
    }
}`,
tests:[{d:'Both classes are @Service beans',re:'@Service[\\s\\S]*@Service'},{d:'Final field for the dependency',re:'private\\s+final\\s+AuditService\\s+\\w+'},{d:'Constructor injection',re:'TransferService\\s*\\(\\s*AuditService\\s+\\w+\\s*\\)'},{d:'No field @Autowired',re:'@Autowired\\s+(private|protected|public)?\\s*AuditService',not:true},{d:'transfer calls log',re:'\\.log\\s*\\('}],
behavior:`1. TransferService can be constructed in a plain unit test: new TransferService(new AuditService()). 2. transfer("a","b",100) calls audit.log with a message containing a, b and 100. 3. The AuditService field is final and set only in the constructor.`,
hints:['Field: <code>private final AuditService audit;</code>; final forces constructor assignment.','Constructor: <code>TransferService(AuditService audit) { this.audit = audit; }</code>; with one constructor, Spring injects automatically.','transfer: <code>audit.log("transfer " + cents + "c from " + from + " to " + to);</code>'],
solution:`import org.springframework.stereotype.Service;

@Service
class AuditService {
    void log(String event) {
        System.out.println("[AUDIT] " + event);
    }
}

@Service
class TransferService {
    private final AuditService audit;

    TransferService(AuditService audit) {
        this.audit = audit;
    }

    void transfer(String from, String to, long cents) {
        audit.log("transfer " + cents + "c from " + from + " to " + to);
    }
}`}},
{id:'spr2b',title:'AOP: aspects, proxies & pointcuts',body:`
<p>Aspect-Oriented Programming extracts <b>cross-cutting concerns</b> (logging, timing, security, transactions) out of business code and into <b>aspects</b> that Spring weaves in via proxies. You have been using AOP all along: <code>@Transactional</code>, <code>@Cacheable</code> and <code>@PreAuthorize</code> are aspects.</p>
<div class="codeSample" data-hl>@Aspect
@Component
public class TimingAspect {

    // POINTCUT: which methods, here, everything in the service package
    @Around("execution(* com.example.svc.service..*(..))")
    public Object time(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.nanoTime();
        try {
            return pjp.proceed();                       // invoke the real method
        } finally {
            long ms = (System.nanoTime() - start) / 1_000_000;
            System.out.println(pjp.getSignature() + " took " + ms + "ms");
        }
    }
}</div>
<p>Advice types: <code>@Around</code> (full control: can skip, retry, rewrite), <code>@Before</code>, <code>@AfterReturning</code>, <code>@AfterThrowing</code>. Pointcut languages: <code>execution(...)</code> patterns, <code>within(...)</code>, and <code>@annotation(...)</code> (next lesson). <b>Proxy limits you must know</b>: only calls that cross the proxy are advised; self-invocation (<code>this.method()</code>) bypasses aspects entirely, and final methods can't be proxied. Requires <code>spring-boot-starter-aop</code>.</p>

<h4>How the magic actually works</h4>
<p>Spring AOP is not bytecode weaving; it creates a <b>proxy object</b> around your bean and registers the proxy in the context. Everyone who injects your service is holding the proxy; each call passes through the advice chain and then to your instance. Two implementations: a JDK dynamic proxy when the bean implements an interface, or a CGLIB subclass when it does not.</p>
<p>Every limitation follows from that one fact. <b>Self-invocation is not advised</b>, because <code>this.method()</code> goes straight to your instance and never touches the proxy, which is why a <code>@Transactional</code> method called from another method of the same class runs with no transaction at all, silently. <b>final classes and methods cannot be proxied</b> by CGLIB. <b>Private methods are never advised.</b> And a bean used during startup may be injected before its proxy exists, which is where "the aspect works everywhere except in <code>@PostConstruct</code>" comes from.</p>
<p>The fixes, in order of preference: move the annotated method to another bean (usually the right modeling answer anyway), inject the bean into itself, or use <code>AopContext.currentProxy()</code> as a last resort.</p>

<h4>Writing an aspect that behaves</h4>
<ul>
<li><b><code>@Around</code> must return.</b> Forget to return the result of <code>pjp.proceed()</code> and every advised method silently returns null, a genuinely nasty bug, because nothing throws.</li>
<li><b>Do not swallow exceptions.</b> An aspect that catches and logs turns a failure into a success for every caller.</li>
<li><b>Order matters</b> when several aspects apply. <code>@Order</code> makes it explicit; leaving it to chance means transaction and security advice may nest either way round, and "security inside the transaction" is not what you meant.</li>
<li><b>Keep pointcuts narrow.</b> An <code>execution(* com..*(..))</code> pointcut advises the entire application, including hot paths where the interception cost is now on every call.</li>
</ul>
<p>The judgment call: aspects are invisible at the call site, which is exactly their benefit and exactly their cost. Cross-cutting infrastructure (transactions, security, metrics, retries) earns the indirection. Business rules hidden in an aspect are a debugging session waiting to happen, because nothing in the method you are reading says they exist.</p>`,
docs:[['Spring AOP, reference','https://docs.spring.io/spring-framework/reference/core/aop.html'],['Pointcut expressions, Spring','https://docs.spring.io/spring-framework/reference/core/aop/ataspectj/pointcuts.html']],
ex:{title:'A timing aspect',
prompt:`Write <code>@Aspect @Component class TimingAspect</code> with an <code>@Around</code> advice on pointcut <code>execution(* com.example.svc.service..*(..))</code>: method <code>Object time(ProceedingJoinPoint pjp) throws Throwable</code> that records <code>System.nanoTime()</code>, calls <code>pjp.proceed()</code> in a try, and in a <b>finally</b> prints the signature and elapsed milliseconds, so timing is reported even when the method throws.`,
starter:`import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

// @Aspect + @Component

public class TimingAspect {

    // @Around(...) Object time(ProceedingJoinPoint pjp) throws Throwable
}`,
tests:[{d:'@Aspect and @Component on the class',re:'@Aspect\\s*\\n?\\s*@Component'},{d:'@Around with the exact pointcut',re:'@Around\\s*\\(\\s*"execution\\(\\* com\\.example\\.svc\\.service\\.\\.\\*\\(\\.\\.\\)\\)"\\s*\\)'},{d:'Proceeds inside a try',re:'try\\s*\\{[\\s\\S]*?pjp\\.proceed\\s*\\(\\s*\\)'},{d:'Timing reported in finally',re:'finally\\s*\\{[\\s\\S]*?nanoTime'},{d:'Uses the join point signature',re:'pjp\\.getSignature\\s*\\(\\s*\\)'}],
behavior:`1. Any method in com.example.svc.service (and subpackages) gets timed transparently: zero changes to service code. 2. The return value of proceed() is returned unchanged. 3. A throwing method still logs its duration (finally) and the exception propagates. 4. The aspect is itself a bean (@Component); otherwise Spring never sees it.`,
hints:['Return type Object + <code>return pjp.proceed();</code>; you are standing in for the real method.','try { return pjp.proceed(); } finally { ...log... }. The finally is what makes timing exception-safe.','The pointcut reads: any return type (*), package com.example.svc.service and below (..), any method, any args (..).'],
solution:`import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class TimingAspect {

    @Around("execution(* com.example.svc.service..*(..))")
    public Object time(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.nanoTime();
        try {
            return pjp.proceed();
        } finally {
            long ms = (System.nanoTime() - start) / 1_000_000;
            System.out.println(pjp.getSignature() + " took " + ms + "ms");
        }
    }
}`}},
{id:'spr2c',title:'Custom Spring annotations: compose & advise',body:`
<p>Two ways to mint your own Spring annotations:</p>
<div class="codeSample" data-hl>// 1) COMPOSED annotation: bundle existing ones (how @RestController itself works)
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Service
@Transactional
public @interface TransactionalService {}       // one annotation = two behaviors

@TransactionalService                            // scanned AND transactional
class SettlementService { ... }

// 2) BEHAVIOR annotation: your annotation + an aspect that reacts to it
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Audited {
    String value();                              // e.g. the audit event name
}

@Aspect @Component
class AuditAspect {
    @Around("@annotation(audited)")              // binds the annotation instance!
    Object audit(ProceedingJoinPoint pjp, Audited audited) throws Throwable {
        System.out.println("[AUDIT] " + audited.value() + " -&gt; " + pjp.getSignature());
        return pjp.proceed();
    }
}</div>
<p>Pattern 1 needs no code; Spring reads meta-annotations recursively. Pattern 2 is the full framework move: exactly how <code>@Transactional</code>, <code>@Cacheable</code> and <code>@PreAuthorize</code> are built. In your domain this is how you'd add <code>@RequiresMfa</code> or <code>@RateLimited</code> to endpoints declaratively.</p>
<h4>Why this is the technique that separates users from builders</h4>
<p>Everything in Spring that feels magical (<code>@Transactional</code>, <code>@Cacheable</code>,
<code>@PreAuthorize</code>, <code>@Retryable</code>) is built from the two patterns above. There is no
privileged framework mechanism they use that is unavailable to you. Recognizing that changes how you
approach cross-cutting requirements: instead of repeating the same six lines in forty methods, you
declare the intent once and implement it once.</p>

<h4>When each pattern is the right one</h4>
<p><b>Composed annotations</b> are pure naming: you are giving a recurring combination a domain name.
The win is that the meaning lives in one place: change what <code>@TransactionalService</code> implies
and every class using it follows. Spring resolves meta-annotations recursively, so there is nothing to
implement and nothing to go wrong.</p>
<p><b>Behavior annotations</b> are for genuine cross-cutting concerns: auditing, rate limiting, metrics,
authorization checks. The test for whether one is justified: the concern must be <i>orthogonal</i> to the
business logic. Auditing is: it applies to payments, users and reports identically. If the behavior
needs to know what the method actually does, an aspect is the wrong tool and you are hiding logic where
nobody will find it.</p>

<h4>The proxy limits that will bite you</h4>
<p>Spring AOP works by wrapping your bean in a proxy. Calls that never leave the object never pass
through it:</p>
<div class="codeSample" data-hl>@Service class ReportService {
    @Audited("run") public void run() { helper(); }
    @Audited("help") public void helper() { }     // NEVER fires when called
}                                                 // from run() - the call is
                                                  // this.helper(), not proxy.helper()

// same reason @Transactional does not apply to self-invocation.
// same reason it does nothing on private, static or final methods.
// the fix is structural: move the annotated method to another bean.</div>
<p>This is the single most common source of "my annotation does nothing", and because it fails silently,
it is worth <b>testing that the aspect actually fires</b> rather than assuming it does.</p>

<h4>Doing it responsibly</h4>
<p>Aspects are invisible at the call site, which is exactly their value and exactly their risk. Keep the
pointcut narrow: <code>@annotation(...)</code> rather than a broad package expression, so the behavior
applies only where someone opted in. Make sure exceptions from the aspect cannot silently swallow the
business call. And document the annotation itself, because a reader who finds <code>@RequiresMfa</code>
on a method has no other way to learn what it does.</p>`,
docs:[['Meta-annotations & composed annotations, Spring','https://docs.spring.io/spring-framework/reference/core/beans/classpath-scanning.html#beans-meta-annotations'],['@annotation pointcut, Spring AOP','https://docs.spring.io/spring-framework/reference/core/aop/ataspectj/pointcuts.html']],
ex:{title:'Build @Audited end to end',
prompt:`(1) Declare <code>@interface Audited</code>: <code>@Target(ElementType.METHOD)</code>, <code>@Retention(RetentionPolicy.RUNTIME)</code>, element <code>String value()</code>. (2) Declare a composed <code>@interface TransactionalService</code>: TYPE target, RUNTIME retention, meta-annotated with <code>@Service</code> and <code>@Transactional</code>. (3) Write <code>@Aspect @Component class AuditAspect</code> with <code>@Around("@annotation(audited)")</code> advice <code>Object audit(ProceedingJoinPoint pjp, Audited audited)</code> that prints <code>"[AUDIT] " + audited.value()</code> then proceeds.`,
starter:`import java.lang.annotation.*;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.*;
import org.springframework.transaction.annotation.Transactional;

// (1) @Audited

// (2) @TransactionalService (composed)

// (3) the aspect
`,
tests:[{d:'@Audited: METHOD target, RUNTIME retention, value()',re:'@Target\\s*\\(\\s*ElementType\\.METHOD\\s*\\)[\\s\\S]*?@interface\\s+Audited\\s*\\{[\\s\\S]*?String\\s+value\\s*\\(\\s*\\)'},{d:'Composed annotation meta-annotated with @Service',re:'@Service\\s*\\n?\\s*(@Transactional\\s*\\n?\\s*)?(public\\s+)?@interface\\s+TransactionalService|@Transactional\\s*\\n?\\s*@Service[\\s\\S]*?@interface\\s+TransactionalService'},{d:'@Transactional on the composed annotation',re:'@Transactional[\\s\\S]*?@interface\\s+TransactionalService'},{d:'@annotation pointcut binding the instance',re:'@Around\\s*\\(\\s*"@annotation\\(audited\\)"\\s*\\)'},{d:'Advice receives the Audited parameter',re:'audit\\s*\\(\\s*ProceedingJoinPoint\\s+pjp\\s*,\\s*Audited\\s+audited\\s*\\)'},{d:'Prints the value then proceeds',re:'audited\\.value\\s*\\(\\s*\\)[\\s\\S]*?pjp\\.proceed\\s*\\(\\s*\\)'}],
behavior:`1. A method annotated @Audited("token.issue") prints [AUDIT] token.issue before executing: no service code touched. 2. The pointcut parameter name ("audited") matches the advice parameter, which is how Spring hands you the annotation instance with its value(). 3. A class annotated @TransactionalService behaves as both @Service and @Transactional; Spring reads meta-annotations recursively. 4. RUNTIME retention on both, or none of this fires.`,
hints:['The composed annotation is just meta-annotations stacked on @interface: @Target, @Retention, @Service, @Transactional.','The magic wire: the string inside @annotation(...) must equal the advice parameter name.','Advice body: print, then <code>return pjp.proceed();</code>; forgetting proceed() silently swallows every audited call.'],
solution:`import java.lang.annotation.*;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.*;
import org.springframework.transaction.annotation.Transactional;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@interface Audited {
    String value();
}

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Service
@Transactional
@interface TransactionalService {}

@Aspect
@Component
class AuditAspect {

    @Around("@annotation(audited)")
    Object audit(ProceedingJoinPoint pjp, Audited audited) throws Throwable {
        System.out.println("[AUDIT] " + audited.value() + " -> " + pjp.getSignature());
        return pjp.proceed();
    }
}`}},
{id:'spr3',title:'REST controllers',body:`
<p><code>@RestController</code> = <code>@Controller</code> + <code>@ResponseBody</code>: return values are serialized straight to JSON by Jackson.</p>
<div class="codeSample" data-hl>@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService users;
    UserController(UserService users) { this.users = users; }

    @GetMapping                                   // GET /api/users
    List&lt;UserDto&gt; all() { return users.all(); }

    @GetMapping("/{id}")                          // GET /api/users/42
    ResponseEntity&lt;UserDto&gt; one(@PathVariable String id) {
        return users.find(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());   // 404
    }

    @PostMapping                                  // POST /api/users
    @ResponseStatus(HttpStatus.CREATED)           // 201
    UserDto create(@RequestBody @Valid UserDto dto) { return users.save(dto); }
}</div>
<p>Parameter annotations: <code>@PathVariable</code> (from the URL), <code>@RequestParam</code> (?query=), <code>@RequestBody</code> (JSON body). <code>ResponseEntity</code> gives full control of status and headers.</p>

<h4>Return the right status, not just 200</h4>
<p>The default for a successful method is 200, and that is wrong often enough to matter. A creation
should answer <b>201 Created</b> with a <code>Location</code> header pointing at the new resource; a
delete that returns nothing should answer <b>204 No Content</b>; a lookup that finds nothing is
<b>404</b>, not 200 with a null body.</p>
<div class="codeSample" data-hl>@PostMapping
ResponseEntity&lt;OrderDto&gt; create(@Valid @RequestBody CreateOrder cmd) {
    Order saved = service.create(cmd);
    return ResponseEntity
        .created(URI.create("/orders/" + saved.id()))   // 201 + Location
        .body(OrderDto.from(saved));
}

@GetMapping("/{id}")
ResponseEntity&lt;OrderDto&gt; get(@PathVariable long id) {
    return service.find(id)
        .map(OrderDto::from)
        .map(ResponseEntity::ok)
        .orElseGet(() -&gt; ResponseEntity.notFound().build());   // 404, not null
}</div>

<h4>Validate at the edge</h4>
<p><code>@Valid</code> on a <code>@RequestBody</code> triggers Bean Validation
(<code>@NotBlank</code>, <code>@Positive</code>, <code>@Email</code>) before your method runs, so
invalid input never reaches your service layer. Without it the annotations on the DTO are decoration,
a very common bug, because the code looks validated.</p>

<h4>Handle errors in one place</h4>
<p>Try/catch in every controller method produces inconsistent error shapes and a lot of noise. A
<code>@RestControllerAdvice</code> centralizes it, so every error leaves the application in the same
format:</p>
<div class="codeSample" data-hl>@RestControllerAdvice
class ApiErrors {
    @ExceptionHandler(NotFoundException.class)
    ResponseEntity&lt;Problem&gt; notFound(NotFoundException e) {
        return ResponseEntity.status(404).body(Problem.of(e.getMessage()));
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity&lt;Problem&gt; invalid(MethodArgumentNotValidException e) { ... }
}</div>
<p>Two rules for the payload: use a consistent structure (RFC 9457 <i>problem details</i> is the
standard one), and <b>never return the raw exception message or stack trace</b>; it leaks internals
and sometimes data.</p>

<h4>Keep controllers thin</h4>
<p>A controller's job is HTTP: bind, validate, delegate, map the result to a status. Business logic
belongs in a service, where it can be tested without a web layer. The tell that a controller has grown
too much is a test that needs <code>MockMvc</code> to verify a business rule.</p>
<p>And return <b>DTOs, not entities</b>. Serializing a JPA entity exposes your schema, drags lazy
associations into the response (or throws when the session has closed), and turns a database rename
into a breaking API change.</p>`,
docs:[['Building a RESTful Web Service (guide)','https://spring.io/guides/gs/rest-service'],['Spring MVC annotated controllers','https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller.html']],
ex:{title:'A Positions API',
prompt:`Write <code>PositionController</code>: <code>@RestController</code> mapped to <code>/api/positions</code>, with an in-memory <code>Map&lt;String, String&gt;</code>. Endpoints: <code>GET /{id}</code> returning <code>ResponseEntity&lt;String&gt;</code>: 200 with the value or 404 if absent; and <code>POST</code> taking <code>@RequestParam String id, @RequestParam String symbol</code>, storing it and returning the created value with status <code>201</code> via <code>@ResponseStatus</code>.`,
starter:`import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/positions")
public class PositionController {
    private final Map<String, String> store = new HashMap<>();

    // GET /{id} → 200 or 404

    // POST → 201, stores id → symbol
}`,
tests:[{d:'Class mapped to /api/positions',re:'@RequestMapping\\s*\\(\\s*"/api/positions"\\s*\\)'},{d:'GET with @PathVariable',re:'@GetMapping\\s*\\(\\s*"/\\{id\\}"\\s*\\)[\\s\\S]*?@PathVariable'},{d:'404 via ResponseEntity.notFound',re:'notFound\\s*\\(\\s*\\)'},{d:'POST with @RequestParam',re:'@PostMapping[\\s\\S]*?@RequestParam'},{d:'201 via @ResponseStatus(HttpStatus.CREATED)',re:'@ResponseStatus\\s*\\(\\s*HttpStatus\\.CREATED\\s*\\)'}],
behavior:`1. POST id=p1&symbol=AAPL stores and returns AAPL with 201. 2. GET /api/positions/p1 → 200 "AAPL". 3. GET /api/positions/nope → 404 empty body. 4. GET handler returns ResponseEntity built from Optional/containsKey logic.`,
hints:['GET: <code>@GetMapping("/{id}") ResponseEntity&lt;String&gt; one(@PathVariable String id)</code>','404 pattern: <code>String v = store.get(id); return v == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(v);</code>','POST: annotate the method with both @PostMapping and @ResponseStatus(HttpStatus.CREATED); body: <code>store.put(id, symbol); return symbol;</code>'],
solution:`import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/positions")
public class PositionController {
    private final Map<String, String> store = new HashMap<>();

    @GetMapping("/{id}")
    ResponseEntity<String> one(@PathVariable String id) {
        String v = store.get(id);
        return v == null ? ResponseEntity.notFound().build()
                         : ResponseEntity.ok(v);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    String create(@RequestParam String id, @RequestParam String symbol) {
        store.put(id, symbol);
        return symbol;
    }
}`}},
{id:'spr4',title:'Data access with Spring Data JPA',body:`
<p>Spring Data generates repository implementations from interface signatures. Entity + repository interface = full CRUD, no SQL written:</p>
<div class="codeSample" data-hl>@Entity
public class Account {
    @Id @GeneratedValue private Long id;
    private String owner;
    private long balanceCents;
    // JPA needs a no-arg constructor + getters/setters
}

public interface AccountRepository extends JpaRepository&lt;Account, Long&gt; {
    List&lt;Account&gt; findByOwner(String owner);          // derived query!
    List&lt;Account&gt; findByBalanceCentsGreaterThan(long cents);
}

@Service
public class AccountService {
    private final AccountRepository repo;
    AccountService(AccountRepository repo) { this.repo = repo; }

    @Transactional
    public void credit(Long id, long cents) {
        Account a = repo.findById(id).orElseThrow();
        a.setBalanceCents(a.getBalanceCents() + cents);   // dirty-checked & flushed
    }
}</div>
<p>Method names become queries: <code>findBy</code> + property + operators (<code>GreaterThan</code>, <code>Containing</code>, <code>OrderBy…Desc</code>). Business operations that touch multiple rows belong in <code>@Transactional</code> service methods.</p>
<h4>The abstraction, and what it is hiding</h4>
<p>Spring Data generates the implementation of that interface at runtime by parsing the method name. It
is a genuine productivity win and it is also the source of most JPA pain, because <b>the SQL still
exists; you just cannot see it</b>. The single most valuable thing you can do when learning this is turn
the SQL on:</p>
<div class="codeSample" data-hl>spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
logging.level.org.hibernate.orm.jdbc.bind=TRACE   # see the parameter values too

# better still in tests: assert the QUERY COUNT.
# datasource-proxy or Hypersistence Utils will fail a test that suddenly
# issues 47 queries where it used to issue 2.</div>

<h4>N+1: the bug this abstraction manufactures</h4>
<p>It is worth understanding once, because it accounts for a large share of slow Spring applications.
Load 100 accounts, then touch a lazy association on each one, and you have issued 1 query for the list
plus 100 more (one per account) without writing anything that looks like a loop over the database.</p>
<p>The fixes are all about telling JPA your intent up front: a <code>JOIN FETCH</code> in an explicit
<code>@Query</code>, an <code>@EntityGraph</code> on the repository method, or batch fetching. What does
<i>not</i> work is switching associations to <code>EAGER</code>; that trades one problem for a worse one,
where every load of the entity drags its whole object graph along whether you needed it or not.</p>

<h4>The persistence context, briefly</h4>
<p>Inside a transaction, JPA keeps a first-level cache of the entities it has loaded and tracks changes to
them. That is why <code>credit()</code> above works without a <code>save()</code>: the entity is
<b>managed</b>, so the modification is detected at flush time and written automatically. It is elegant
and it surprises people in both directions: modifications you did not intend to persist get persisted,
and modifications to a <b>detached</b> entity (loaded outside the transaction) silently do not.</p>
<p>Related: <code>LazyInitializationException</code> means you touched an association after the
transaction ended. Loading it eagerly is one answer; the better one is usually to map to a DTO inside the
transaction and return that, which also stops entities leaking into your API contract.</p>

<h4>Where <code>@Transactional</code> belongs, and its sharp edges</h4>
<p>On the <b>service</b> method that represents one business operation, so the whole operation commits or
rolls back together, not on the repository, where each call is its own transaction and a multi-step
operation can half-succeed.</p>
<p>Two behaviors that catch people out. It rolls back on unchecked exceptions only: a checked exception
commits unless you say <code>rollbackFor</code>. And it is proxy-based, so calling one
<code>@Transactional</code> method from another method in the same class does nothing at all.</p>
<p>Finally, derived query names have a ceiling. When the method name starts encoding three conditions and
an ordering, it has stopped being readable; write the JPQL in <code>@Query</code>, or drop to a native
query. Spring Data is at its best for the simple 80% and should be abandoned without guilt for the
rest.</p>`,
docs:[['Accessing Data with JPA, guide','https://spring.io/guides/gs/accessing-data-jpa'],['Spring Data JPA, query methods','https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html']],
ex:{title:'Derive the queries',
prompt:`Write interface <code>TradeRepository extends JpaRepository&lt;Trade, Long&gt;</code> with three <b>derived query methods</b> (signatures only, no bodies; it's an interface): find all trades by <code>symbol</code>, find trades with <code>amountCents</code> greater than a value, and find trades by symbol ordered by <code>executedAt</code> descending. Assume entity <code>Trade</code> has those properties. Then a <code>@Service TradeService</code> with constructor-injected repository and a <code>@Transactional</code> method <code>void reprice(Long id, long newAmount)</code> that loads via <code>findById(...).orElseThrow()</code> and sets the amount.`,
starter:`import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

interface TradeRepository extends JpaRepository<Trade, Long> {
    // 3 derived queries
}

@Service
class TradeService {
    // constructor injection + @Transactional reprice
}`,
tests:[{d:'findBySymbol derived query',re:'List<Trade>\\s+findBySymbol\\s*\\(\\s*String\\s+\\w+\\s*\\)'},{d:'GreaterThan operator',re:'findByAmountCentsGreaterThan\\s*\\(\\s*long\\s+\\w+\\s*\\)'},{d:'OrderBy…Desc derived query',re:'findBySymbolOrderByExecutedAtDesc'},{d:'@Transactional on reprice',re:'@Transactional[\\s\\S]{0,120}?void\\s+reprice'},{d:'findById(...).orElseThrow()',re:'findById\\s*\\(\\s*id\\s*\\)\\s*\\.orElseThrow\\s*\\('}],
behavior:`1. Repository methods follow Spring Data naming exactly (findBySymbol, findByAmountCentsGreaterThan, findBySymbolOrderByExecutedAtDesc). 2. reprice loads, mutates, and relies on dirty checking inside the transaction. 3. Service uses constructor injection with a final field.`,
hints:['The property name in the method must match the entity field with a capital first letter: <code>findBySymbol(String symbol)</code>.','Comparison operators append to the property: <code>findByAmountCentsGreaterThan(long cents)</code>.','Ordering appends OrderBy + property + Desc: <code>findBySymbolOrderByExecutedAtDesc(String symbol)</code>.'],
solution:`import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

interface TradeRepository extends JpaRepository<Trade, Long> {
    List<Trade> findBySymbol(String symbol);
    List<Trade> findByAmountCentsGreaterThan(long cents);
    List<Trade> findBySymbolOrderByExecutedAtDesc(String symbol);
}

@Service
class TradeService {
    private final TradeRepository trades;

    TradeService(TradeRepository trades) {
        this.trades = trades;
    }

    @Transactional
    void reprice(Long id, long newAmount) {
        Trade t = trades.findById(id).orElseThrow();
        t.setAmountCents(newAmount);
    }
}`}},
{id:'spr5',title:'Configuration, profiles & testing',body:`
<p>Externalize everything that differs per environment:</p>
<div class="codeSample"># application.properties
server.port=8081
dojo.api.base-url=https://api.dojo.dev
dojo.api.timeout-seconds=5

# application-prod.properties  (active with --spring.profiles.active=prod)
dojo.api.base-url=https://api.example.com</div>
<div class="codeSample" data-hl>@ConfigurationProperties(prefix = "dojo.api")     // type-safe config
public record ApiProps(String baseUrl, int timeoutSeconds) {}

@SpringBootTest                       // full context test
class TransferServiceTest {
    @Autowired TransferService service;
    @Test void transfers() { ... }
}

@WebMvcTest(PositionController.class) // slice test: just the web layer
class PositionControllerTest {
    @Autowired MockMvc mvc;
    @Test void notFound() throws Exception {
        mvc.perform(get("/api/positions/nope"))
           .andExpect(status().isNotFound());
    }
}</div>
<p>Configuration is a contract, not a pile of strings. <code>@Value</code> scatters keys across the
codebase, so nothing tells you what the application needs and a typo fails at runtime on the first
request that touches it. A properties record is <b>typed, validated and discoverable</b>: wrong type,
missing value or failed constraint and the application fails to <i>start</i>, not at 2am.</p>
<p><b>Profiles have a trap.</b> Putting behavior behind <code>@Profile("prod")</code> means the code
you tested is not the code you run. Keep profiles for configuration (endpoints, pool sizes,
credentials) and keep behavior identical everywhere; where it genuinely must differ, a feature flag
you can flip without redeploying is the better tool. Precedence runs defaults → profile files →
environment variables, which is what makes twelve-factor deployment work and why secrets arrive from
the environment rather than a committed file.</p>
<p><b>Slice tests are the difference between a fast suite and an abandoned one.</b>
<code>@SpringBootTest</code> in every class is the biggest cause of slow Spring builds; slices start a
fraction of the context. Spring also caches contexts <i>by configuration</i> across a run, so every
distinct combination of annotations, properties and mock beans builds another one; keeping test
configuration uniform is often a bigger win than any single optimization. And test against the real
database: H2 accepts SQL that Postgres rejects, so a green suite on H2 still fails in production.
Testcontainers removes that whole class of surprise.</p>
<p>Prefer <code>@ConfigurationProperties</code> records over scattered <code>@Value</code>; prefer slice tests (<code>@WebMvcTest</code>, <code>@DataJpaTest</code>): they run in milliseconds, keeping the full <code>@SpringBootTest</code> for wiring smoke tests.</p>`,
docs:[['Externalized configuration','https://docs.spring.io/spring-boot/reference/features/external-config.html'],['Testing Spring Boot apps','https://docs.spring.io/spring-boot/reference/testing/index.html']],
ex:{title:'Type-safe config + a slice test',
prompt:`(1) Write <code>record RiskProps(double maxExposure, int alertThreshold)</code> annotated with <code>@ConfigurationProperties(prefix = "dojo.risk")</code>. (2) Write test class <code>HealthControllerTest</code> annotated <code>@WebMvcTest(HealthController.class)</code> with an <code>@Autowired MockMvc mvc</code> field and one <code>@Test</code> method <code>ok()</code> that performs <code>get("/health")</code> and expects <code>status().isOk()</code>.`,
starter:`import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import org.junit.jupiter.api.Test;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// (1) the props record

// (2) the slice test
`,
tests:[{d:'@ConfigurationProperties with prefix dojo.risk',re:'@ConfigurationProperties\\s*\\(\\s*prefix\\s*=\\s*"dojo\\.risk"\\s*\\)'},{d:'RiskProps is a record',re:'record\\s+RiskProps\\s*\\(\\s*double\\s+maxExposure\\s*,\\s*int\\s+alertThreshold\\s*\\)'},{d:'@WebMvcTest slice, not @SpringBootTest',re:'@WebMvcTest\\s*\\(\\s*HealthController\\.class\\s*\\)'},{d:'MockMvc injected',re:'@Autowired\\s+MockMvc\\s+mvc'},{d:'Performs get and expects 200',re:'mvc\\.perform\\s*\\(\\s*get\\s*\\(\\s*"/health"\\s*\\)\\s*\\)[\\s\\S]*?status\\s*\\(\\s*\\)\\.isOk\\s*\\(\\s*\\)'}],
behavior:`1. RiskProps binds dojo.risk.max-exposure and dojo.risk.alert-threshold automatically (relaxed binding). 2. The test loads only the web slice for HealthController. 3. ok() is annotated @Test and asserts HTTP 200 from GET /health.`,
hints:['Records + @ConfigurationProperties: the components become the bound properties, kebab-case maps automatically.','Slice test: <code>@WebMvcTest(HealthController.class) class HealthControllerTest { @Autowired MockMvc mvc; }</code>','Test body: <code>mvc.perform(get("/health")).andExpect(status().isOk());</code> and mark the method @Test (throws Exception).'],
solution:`import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import org.junit.jupiter.api.Test;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// (1)
@ConfigurationProperties(prefix = "dojo.risk")
record RiskProps(double maxExposure, int alertThreshold) {}

// (2)
@WebMvcTest(HealthController.class)
class HealthControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void ok() throws Exception {
        mvc.perform(get("/health")).andExpect(status().isOk());
    }
}`}},
{id:'spr6',title:'Validation & API error handling',body:`
<p>Never trust a request body. Bean Validation annotations declare the rules; <code>@Valid</code> enforces them; a <code>@RestControllerAdvice</code> turns violations into your error contract (remember RFC 9457 from the REST stream; Spring 6 ships <code>ProblemDetail</code> natively):</p>
<div class="codeSample" data-hl>record CreateUser(
    @NotBlank String name,
    @Email String email,
    @Min(18) int age) {}

@PostMapping
UserDto create(@RequestBody @Valid CreateUser req) { ... }   // 400 on violation

@RestControllerAdvice
class ApiErrors {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ProblemDetail invalid(MethodArgumentNotValidException e) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.UNPROCESSABLE_ENTITY);
        pd.setTitle("Validation failed");
        pd.setDetail(e.getFieldErrors().stream()
            .map(f -&gt; f.getField() + ": " + f.getDefaultMessage())
            .collect(Collectors.joining("; ")));
        return pd;
    }

    @ExceptionHandler(NoSuchElementException.class)
    ProblemDetail notFound(NoSuchElementException e) {
        return ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
    }
}</div>
<p>One advice class gives every controller the same error shape: API-platform gold. Common annotations: <code>@NotNull</code>, <code>@NotBlank</code>, <code>@Size</code>, <code>@Min/@Max</code>, <code>@Email</code>, <code>@Pattern</code>.</p>
<h4>Validate at the boundary, and only at the boundary</h4>
<p>The reason validation belongs on the request object rather than scattered through the service is that
the boundary is <b>the only place where you know the data is untrusted</b>. Past it, everything should be
able to assume the object is well-formed. Checks repeated deeper down are either redundant or evidence
that the boundary check is not trusted, and both are worth fixing.</p>
<p>Which also means being precise about what this is. Bean Validation checks <b>shape</b>: present,
well-formed, within range. It cannot check <b>state</b>: that the email is not already registered, that
the account has funds, that the user may perform this action. Those are business rules, they need the
database or the security context, and they belong in the service. Conflating the two produces annotations
that quietly do database lookups, which is a bad place for them.</p>

<h4>Getting the status code right</h4>
<div class="codeSample" data-hl>malformed JSON, wrong type        -> 400 Bad Request
well-formed but fails a rule      -> 422 Unprocessable Content
not authenticated                 -> 401     (WWW-Authenticate header required)
authenticated, not permitted      -> 403
conflicts with current state      -> 409     (duplicate email, version clash)

// the 400/422 distinction: 400 means "I could not parse this",
// 422 means "I understood you perfectly and the answer is no".
// clients can act on the second and not the first.</div>

<h4>Why one advice class is worth the effort</h4>
<p>Without it, error shapes are decided ad hoc by whoever wrote each endpoint, and clients end up parsing
three formats from the same API. A single <code>@RestControllerAdvice</code> makes the error contract a
deliberate part of the design rather than an accident, and RFC 9457's <code>ProblemDetail</code> gives
you a standard shape (<code>type</code>, <code>title</code>, <code>status</code>, <code>detail</code>,
<code>instance</code>) so clients need no bespoke parsing at all.</p>
<p>Two rules for what goes in it. <b>Never leak internals</b>: stack traces, SQL fragments and class
names are reconnaissance; log them with a correlation id and return the id, not the detail. And
<b>always include something the client can act on</b>: which field, what was wrong with it, and where to
look. An error that says only "Validation failed" has told the caller nothing.</p>

<h4>The extension that pays for itself</h4>
<p>Field-level messages are fine until you need a rule spanning two fields: a date range where the end
must follow the start, a password confirmation. Those need a class-level constraint with a custom
<code>ConstraintValidator</code>, which is roughly twenty lines and keeps the rule declarative rather than
buried in a controller. Adding a correlation id to every <code>ProblemDetail</code> is the other
high-value addition: it turns "the API returned an error" into a single log query.</p>`,
docs:[['Spring validation','https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html'],['ProblemDetail in Spring','https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-ann-rest-exceptions.html']],
ex:{title:'Validate and translate',
prompt:`(1) Write <code>record OpenAccount(@NotBlank String owner, @Min(0) long initialCents)</code>. (2) Write <code>@RestControllerAdvice class ApiErrors</code> with an <code>@ExceptionHandler(MethodArgumentNotValidException.class)</code> method returning a <code>ProblemDetail</code> with status <code>UNPROCESSABLE_ENTITY</code> and title <code>"Validation failed"</code>, and a second handler mapping <code>NoSuchElementException</code> to a 404 ProblemDetail.`,
starter:`import jakarta.validation.constraints.*;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.NoSuchElementException;

// (1) the validated record

// (2) the advice
`,
tests:[{d:'@NotBlank on owner',re:'@NotBlank\\s+String\\s+owner'},{d:'@Min(0) on initialCents',re:'@Min\\s*\\(\\s*0\\s*\\)\\s+long\\s+initialCents'},{d:'@RestControllerAdvice class',re:'@RestControllerAdvice'},{d:'Handles MethodArgumentNotValidException',re:'@ExceptionHandler\\s*\\(\\s*MethodArgumentNotValidException\\.class\\s*\\)'},{d:'422 ProblemDetail with title',re:'UNPROCESSABLE_ENTITY[\\s\\S]*?setTitle\\s*\\(\\s*"Validation failed"\\s*\\)'},{d:'404 for NoSuchElementException',re:'NoSuchElementException\\.class[\\s\\S]*?NOT_FOUND'}],
behavior:`1. A request with blank owner or negative initialCents fails validation before controller code runs. 2. The advice converts it to a 422 ProblemDetail titled "Validation failed". 3. NoSuchElementException anywhere becomes a 404 ProblemDetail. 4. Handlers return ProblemDetail (Spring serializes it as application/problem+json).`,
hints:['Validation lives on the record components: <code>record OpenAccount(@NotBlank String owner, @Min(0) long initialCents) {}</code>','Build the response: <code>ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.UNPROCESSABLE_ENTITY); pd.setTitle("Validation failed"); return pd;</code>','Second handler: <code>@ExceptionHandler(NoSuchElementException.class) ProblemDetail notFound(NoSuchElementException e) { return ProblemDetail.forStatus(HttpStatus.NOT_FOUND); }</code>'],
solution:`import jakarta.validation.constraints.*;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.NoSuchElementException;

record OpenAccount(@NotBlank String owner, @Min(0) long initialCents) {}

@RestControllerAdvice
class ApiErrors {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ProblemDetail invalid(MethodArgumentNotValidException e) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.UNPROCESSABLE_ENTITY);
        pd.setTitle("Validation failed");
        return pd;
    }

    @ExceptionHandler(NoSuchElementException.class)
    ProblemDetail notFound(NoSuchElementException e) {
        return ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
    }
}`}},
{id:'spr7',title:'Spring Security & JWT, your home turf',body:`
<p>Spring Security is a filter chain in front of your controllers. Since Spring Security 6, configuration is a <code>SecurityFilterChain</code> bean:</p>
<div class="codeSample" data-hl>@Configuration
@EnableWebSecurity
class SecurityConfig {
    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -&gt; csrf.disable())               // stateless APIs
            .authorizeHttpRequests(auth -&gt; auth
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .oauth2ResourceServer(o -&gt; o.jwt(Customizer.withDefaults()))
            .sessionManagement(s -&gt;
                s.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        return http.build();
    }
}</div>
<p>As a JWT <b>resource server</b>, Spring validates the token signature against your IdP's JWKS endpoint (<code>spring.security.oauth2.resourceserver.jwt.issuer-uri=...</code>), exactly the CIAM architecture you run: auth server issues tokens, every API validates them statelessly. Method-level rules: <code>@PreAuthorize("hasRole('ADMIN')")</code>. Order matters in the matcher list: first match wins.</p>
<h4>The mental model: a chain, not a check</h4>
<p>Spring Security is not a library you call; it is a chain of servlet filters that runs
<b>before</b> your controller and can end the request without it ever being reached. Almost every
confusing behavior makes sense once you hold that picture: a 401 with no log line from your code, CORS
failing before your handler, a <code>@PreAuthorize</code> that never fires because the filter chain
rejected the request first.</p>
<p>Two distinct layers matter, and they are often confused. The <b>filter chain</b> makes coarse,
URL-based decisions and establishes who the caller is. <b>Method security</b>
(<code>@PreAuthorize</code>) makes fine-grained decisions with the domain objects in hand. Use the chain
for "this whole area needs authentication" and method security for "this action needs this permission on
this object"; trying to express the second as URL patterns produces rules that drift out of sync with
the code the moment someone adds an endpoint.</p>

<h4>What "resource server" actually means here</h4>
<p>Setting <code>issuer-uri</code> does more than it appears. On startup Spring fetches
<code>/.well-known/openid-configuration</code> from that issuer, learns the <code>jwks_uri</code>, and
from then on validates incoming tokens against the published keys, caching them, and re-fetching when it
sees an unknown <code>kid</code>. That is what makes key rotation a non-event.</p>
<div class="codeSample" data-hl>// what Spring validates by default: signature, iss, exp, nbf
// what it does NOT validate unless you ask: AUDIENCE

@Bean JwtDecoder jwtDecoder(OAuth2ResourceServerProperties p) {
    NimbusJwtDecoder d = JwtDecoders.fromIssuerLocation(p.getJwt().getIssuerUri());
    d.setJwtValidator(new DelegatingOAuth2TokenValidator&lt;&gt;(
        JwtValidators.createDefaultWithIssuer(p.getJwt().getIssuerUri()),
        new JwtClaimValidator&lt;List&lt;String&gt;&gt;("aud", a -&gt; a != null &amp;&amp; a.contains("orders-api"))));
    return d;                     // without this, a token minted for ANOTHER
}                                 // service by the same issuer is accepted here</div>
<p>That gap is the single most common misconfiguration in Spring resource servers, and it is exactly the
confused-deputy problem from the identity course showing up in a framework default.</p>

<h4>The other two defaults worth understanding</h4>
<p><b>Disabling CSRF is only correct if you are actually stateless.</b> The reason CSRF protection exists
is that browsers attach cookies automatically; a token in an <code>Authorization</code> header is not sent
automatically, so there is nothing to forge. The moment any part of the app authenticates by cookie
(a server-rendered admin page, a session for the BFF), CSRF protection must come back for those paths.</p>
<p><b>Scopes are not roles.</b> Spring maps <code>scope</code> claims to authorities prefixed
<code>SCOPE_</code> and roles to <code>ROLE_</code>, so <code>hasRole('ADMIN')</code> silently fails
against a token carrying scopes. Decide which claim carries authorization for your system and configure a
<code>JwtAuthenticationConverter</code> to match; do not leave it to coincidence.</p>
<p>And <b>order matters</b>: matchers are evaluated top down, first match wins, so a broad
<code>anyRequest()</code> placed early makes everything below it dead configuration.</p>`,
docs:[['Spring Security reference','https://docs.spring.io/spring-security/reference/index.html'],['OAuth2 Resource Server / JWT','https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html']],
ex:{title:'Lock down the API',
prompt:`Write <code>SecurityConfig</code> (@Configuration + @EnableWebSecurity) with a <code>SecurityFilterChain</code> bean: disable CSRF, permit <code>/actuator/health</code> to all, require role <code>ADMIN</code> for <code>/api/admin/**</code>, authenticate <code>anyRequest</code>, enable JWT resource-server support, and set session policy <code>STATELESS</code>.`,
starter:`import org.springframework.context.annotation.*;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // csrf off, health open, admin gated, everything else authenticated,
        // jwt resource server, stateless sessions
        return http.build();
    }
}`,
tests:[{d:'CSRF disabled for the stateless API',re:'csrf\\s*\\(\\s*\\w+\\s*->\\s*\\w+\\.disable\\s*\\(\\s*\\)\\s*\\)'},{d:'Health endpoint permitAll',re:'requestMatchers\\s*\\(\\s*"/actuator/health"\\s*\\)\\s*\\.permitAll\\s*\\(\\s*\\)'},{d:'Admin paths need ADMIN role',re:'requestMatchers\\s*\\(\\s*"/api/admin/\\*\\*"\\s*\\)\\s*\\.hasRole\\s*\\(\\s*"ADMIN"\\s*\\)'},{d:'anyRequest authenticated',re:'anyRequest\\s*\\(\\s*\\)\\s*\\.authenticated\\s*\\(\\s*\\)'},{d:'JWT resource server enabled',re:'oauth2ResourceServer\\s*\\([\\s\\S]*?jwt'},{d:'Stateless sessions',re:'SessionCreationPolicy\\.STATELESS'}],
behavior:`1. GET /actuator/health works unauthenticated. 2. /api/admin/x requires a JWT carrying ROLE_ADMIN. 3. Any other endpoint requires a valid JWT. 4. No HTTP sessions created; every request authenticates via its bearer token. 5. Matcher order: specific rules before anyRequest.`,
hints:['The lambda-DSL chains off http: <code>http.csrf(c -> c.disable()).authorizeHttpRequests(auth -> ...)...</code>','Matchers go inside authorizeHttpRequests, most-specific first, ending with <code>.anyRequest().authenticated()</code>.','JWT + stateless: <code>.oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults())).sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))</code>'],
solution:`import org.springframework.context.annotation.*;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))
            .sessionManagement(s ->
                s.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        return http.build();
    }
}`}},
{id:'spr8',title:'Production readiness: Actuator, metrics & profiles in anger',body:`
<p>What separates a demo from a service:</p>
<div class="codeSample"># expose operational endpoints deliberately
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.endpoint.health.show-details=when-authorized
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=20s</div>
<div class="codeSample" data-hl>// custom business metric via Micrometer
@Service
class LoginService {
    private final Counter logins;

    LoginService(MeterRegistry registry) {
        this.logins = registry.counter("dojo.logins.success");
    }

    void onLogin() { logins.increment(); }
}</div>
<p>The production checklist: <code>/actuator/health</code> wired to probes (last stream), <code>/actuator/prometheus</code> scraped for dashboards/alerts, JSON logs to stdout, <b>graceful shutdown</b> so in-flight requests finish, and custom Micrometer metrics for the numbers your dashboards actually need (login success rate, token issuance latency; your CIAM SLOs live here). Info endpoint + build info (<code>spring-boot-maven-plugin build-info</code> goal) tells you exactly which commit is running.</p>
<h4>The distinction that makes health checks useful</h4>
<p>Actuator's most valuable feature is the one people configure last. A single <code>/health</code>
endpoint answers the wrong question, because orchestrators ask two different ones:</p>
<div class="codeSample" data-hl>/actuator/health/liveness    "is this process broken beyond recovery?"
   -> if it fails, KILL AND RESTART the container
   -> must NOT check the database. a DB outage does not become better
      by restarting every pod - it becomes a restart storm.

/actuator/health/readiness   "can this instance serve traffic right now?"
   -> if it fails, REMOVE FROM THE LOAD BALANCER, do not restart
   -> here you DO check dependencies, because serving without them fails</div>
<p>Wiring both to the same check is a real outage pattern: a brief database blip fails liveness, every
instance restarts simultaneously, the cold caches and reconnect storm make the blip permanent.</p>

<h4>Metrics that are worth having</h4>
<p>The default Micrometer metrics tell you about the JVM and the HTTP layer. What they cannot tell you is
whether the <i>product</i> is working, and that is the gap custom metrics fill. The discipline is to
instrument <b>outcomes rather than actions</b>: not "logins attempted" but logins tagged by result, so
one query gives you the success rate.</p>
<p>Two rules that matter more than they sound. <b>Never tag with unbounded values</b>: a user id or a raw
URL path as a tag creates a new time series per value and will take down your metrics backend before it
tells you anything. And <b>prefer timers to counters</b> for anything with a duration: a timer gives you
count, total and distribution together, and percentiles are what SLOs are written against. An average
latency hides exactly the tail you are being paged about.</p>

<h4>Shutting down without dropping requests</h4>
<p><code>server.shutdown=graceful</code> stops accepting new connections and lets in-flight requests
finish within the timeout. It is one line and it removes a whole class of deploy-time errors, but only
if the timeout exceeds your slowest request, and only if the platform's termination grace period exceeds
the timeout. Get that ordering wrong and the platform kills the process mid-drain anyway.</p>

<h4>Configuration and exposure</h4>
<p>Profiles let one artifact behave correctly in every environment, which is what makes "build once,
promote the same binary" possible. Keep environment differences in properties, not in code branches, and
keep secrets out of both; they come from the environment or a secret manager at runtime.</p>
<p>On exposure: Actuator endpoints are operational surface area. <code>health</code> and
<code>info</code> are fine to expose; <code>env</code>, <code>heapdump</code>, <code>threaddump</code> and
<code>loggers</code> are not, since they leak configuration or allow live changes. Put management on a
separate port that only your cluster can reach, and let <code>show-details=when-authorized</code> do what
it says. Adding build info via the <code>build-info</code> goal is the small touch that turns "which
commit is running?" into a single HTTP call during an incident.</p>`,
docs:[['Actuator endpoints','https://docs.spring.io/spring-boot/reference/actuator/endpoints.html'],['Micrometer','https://micrometer.io/docs'],['Graceful shutdown','https://docs.spring.io/spring-boot/reference/web/graceful-shutdown.html']],
ex:{title:'Instrument a service',
prompt:`Write <code>@Service class TokenService</code> that takes a <code>MeterRegistry</code> by constructor injection and creates two counters in the constructor: <code>issued</code> from <code>registry.counter("ciam.tokens.issued")</code> and <code>rejected</code> from <code>registry.counter("ciam.tokens.rejected")</code>. Method <code>String issue(String userId)</code>: if userId is null or blank, increment rejected and throw <code>IllegalArgumentException</code>; otherwise increment issued and return <code>"tok-" + userId</code>.`,
starter:`import io.micrometer.core.instrument.*;
import org.springframework.stereotype.Service;

@Service
class TokenService {
    // two Counter fields via MeterRegistry constructor injection

    String issue(String userId) {
        return null;
    }
}`,
tests:[{d:'MeterRegistry constructor injection',re:'TokenService\\s*\\(\\s*MeterRegistry\\s+\\w+\\s*\\)'},{d:'Issued counter with the exact name',re:'counter\\s*\\(\\s*"ciam\\.tokens\\.issued"\\s*\\)'},{d:'Rejected counter registered too',re:'counter\\s*\\(\\s*"ciam\\.tokens\\.rejected"\\s*\\)'},{d:'Rejection path counts then throws',re:'rejected\\.increment\\s*\\(\\s*\\)\\s*;[\\s\\S]*?throw\\s+new\\s+IllegalArgumentException'},{d:'Success path counts',re:'issued\\.increment\\s*\\(\\s*\\)'}],
behavior:`1. issue("ron") increments ciam.tokens.issued and returns "tok-ron". 2. issue(null) and issue("  ") increment ciam.tokens.rejected and throw IllegalArgumentException; count BEFORE throwing. 3. Counters are final fields created once in the constructor, not per call.`,
hints:['Fields: <code>private final Counter issued; private final Counter rejected;</code>; assign both in the constructor from the registry.','Guard clause: <code>if (userId == null || userId.isBlank()) { rejected.increment(); throw new IllegalArgumentException("userId required"); }</code>','Metrics created per-call would re-register on every request; constructor-once is the Micrometer pattern.'],
solution:`import io.micrometer.core.instrument.*;
import org.springframework.stereotype.Service;

@Service
class TokenService {
    private final Counter issued;
    private final Counter rejected;

    TokenService(MeterRegistry registry) {
        this.issued = registry.counter("ciam.tokens.issued");
        this.rejected = registry.counter("ciam.tokens.rejected");
    }

    String issue(String userId) {
        if (userId == null || userId.isBlank()) {
            rejected.increment();
            throw new IllegalArgumentException("userId required");
        }
        issued.increment();
        return "tok-" + userId;
    }
}`}},
{id:'spr9',title:'Advanced: async events & event-driven Spring',body:`
<p>Events invert the coupling: instead of <code>RegistrationService</code> calling email, analytics and provisioning directly (and knowing them all), it announces a fact, <i>a user registered</i>, and interested parties react. Spring ships the machinery in-process:</p>
<div class="codeSample" data-hl>// the event: an immutable fact, records are perfect
public record UserRegistered(String userId, String email) {}

// PUBLISH: inject the publisher, announce the fact
@Service
public class RegistrationService {
    private final ApplicationEventPublisher events;
    RegistrationService(ApplicationEventPublisher events) { this.events = events; }

    @Transactional
    public void register(String userId, String email) {
        // ...persist the user...
        events.publishEvent(new UserRegistered(userId, email));
    }
}

// LISTEN, three escalating levels:
@Component
public class WelcomeListener {
    @EventListener                          // 1) sync: runs on the caller's thread
    void plain(UserRegistered e) { ... }

    @Async @EventListener                   // 2) async: own thread, caller doesn't wait
    void sendWelcomeEmail(UserRegistered e) { ... }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    void provisionAccess(UserRegistered e) { ... }   // 3) only after the tx COMMITS
}</div>
<p>The traps that separate senior from junior here: plain <code>@EventListener</code> is <b>synchronous</b>: a slow listener slows the publisher, a throwing listener rolls back the publisher's transaction. <code>@Async</code> needs <code>@EnableAsync</code> on a config class (and a sensible executor; virtual threads shine). And the big one: side effects that must only happen if the data is really saved (emails, provisioning, webhooks) belong in <code>@TransactionalEventListener(AFTER_COMMIT)</code>; otherwise a rollback leaves you having emailed about a user that doesn't exist. Beyond one process, the same pattern scales out via Kafka/RabbitMQ (Spring Cloud Stream) with the <b>transactional outbox</b> pattern replacing AFTER_COMMIT.</p>

<h4>What an application event actually decouples</h4>
<p>The publisher names a fact ("an order was placed") and does not know who reacts. That is the benefit
and the cost in one sentence. The benefit is that adding a reaction requires no change to the publisher.
The cost is that reading the publisher no longer tells you what happens next, so the indirection has to
earn its place: use it for genuine fan-out, not to avoid a method call.</p>

<h4>Synchronous by default, and why that surprises people</h4>
<p>An <code>@EventListener</code> runs on the <b>publishing thread</b>, inside the publisher's transaction,
before <code>publishEvent</code> returns. So a slow listener slows the request that triggered it, and a
listener that throws propagates back into the publisher, which can roll back the transaction that
published the event. Neither is wrong, but both are the opposite of what "event" suggests to most people.</p>
<div class="codeSample">@TransactionalEventListener(phase = AFTER_COMMIT)   // only if the data actually committed
@Async                                              // and on another thread, if it should not block</div>

<h4>The bug this prevents, and the one it introduces</h4>
<p><code>AFTER_COMMIT</code> exists because of a specific failure: sending a confirmation email for an order
whose transaction then rolled back. The customer has an email and you have no order. Publishing after
commit removes that class of bug entirely.</p>
<p>It introduces the opposite one. After the commit, the event is no longer transactional: if the listener
fails, the data is committed and the reaction never happened, with nothing to retry it. In-process events
are therefore fine for cache eviction, metrics and in-app notifications, and not sufficient when another
system must learn about the change. That is what the outbox pattern in the messaging lesson is for, and the
distinction is worth making deliberately rather than discovering it in production.`,
docs:[['Application events (Spring)','https://docs.spring.io/spring-framework/reference/core/beans/context-introduction.html#context-functionality-events'],['@TransactionalEventListener (API)','https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/event/TransactionalEventListener.html'],['@Async (Spring)','https://docs.spring.io/spring-framework/reference/integration/scheduling.html#scheduling-annotation-support-async']],
ex:{title:'Announce, then react',
prompt:`Build the pipeline: (1) <code>record UserRegistered(String userId, String email)</code>. (2) <code>@Service class RegistrationService</code> with constructor-injected <code>ApplicationEventPublisher</code> and <code>@Transactional void register(String userId, String email)</code> that calls <code>events.publishEvent(new UserRegistered(...))</code>. (3) <code>@Component class WelcomeListener</code> with an <code>@Async @EventListener</code> method <code>sendEmail(UserRegistered e)</code> and a <code>@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)</code> method <code>provision(UserRegistered e)</code>. (4) <code>@Configuration @EnableAsync class AsyncConfig</code>.`,
starter:`import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.*;
import org.springframework.stereotype.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.*;

// (1) the event record

// (2) the publishing service

// (3) the listener

// (4) async config
`,
tests:[{d:'Event is an immutable record',re:'record\\s+UserRegistered\\s*\\(\\s*String\\s+userId\\s*,\\s*String\\s+email\\s*\\)'},{d:'Publisher constructor-injected',re:'RegistrationService\\s*\\(\\s*ApplicationEventPublisher\\s+\\w+\\s*\\)'},{d:'Publishes inside a @Transactional method',re:'@Transactional[\\s\\S]{0,200}?publishEvent\\s*\\(\\s*new\\s+UserRegistered'},{d:'Async listener',re:'@Async\\s*\\n?\\s*@EventListener'},{d:'AFTER_COMMIT transactional listener',re:'@TransactionalEventListener\\s*\\(\\s*phase\\s*=\\s*TransactionPhase\\.AFTER_COMMIT\\s*\\)'},{d:'@EnableAsync on a configuration class',re:'@Configuration\\s*\\n?\\s*@EnableAsync'}],
behavior:`1. register(...) publishes one UserRegistered event; the service knows nothing about email or provisioning. 2. sendEmail runs on a different thread (@Async); register returns without waiting. 3. provision fires only after the surrounding transaction commits; on rollback it never fires: no ghost provisioning. 4. Without @EnableAsync, @Async silently degrades to synchronous; the config class is not optional.`,
hints:['The publisher is just another injected dependency: final field + constructor.','Stack the annotations on the async listener: @Async above @EventListener, method takes the event type as its only parameter.','AFTER_COMMIT import chain: org.springframework.transaction.event.TransactionPhase + @TransactionalEventListener(phase = ...).'],
solution:`import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.*;
import org.springframework.stereotype.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.*;

record UserRegistered(String userId, String email) {}

@Service
class RegistrationService {
    private final ApplicationEventPublisher events;

    RegistrationService(ApplicationEventPublisher events) {
        this.events = events;
    }

    @Transactional
    void register(String userId, String email) {
        // ...persist the user...
        events.publishEvent(new UserRegistered(userId, email));
    }
}

@Component
class WelcomeListener {

    @Async
    @EventListener
    void sendEmail(UserRegistered e) {
        System.out.println("emailing " + e.email());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    void provision(UserRegistered e) {
        System.out.println("provisioning " + e.userId());
    }
}

@Configuration
@EnableAsync
class AsyncConfig {}`}},
{id:'rct1',title:'Reactive programming: Reactor & WebFlux',body:`
<p>Everything async you've built so far returns one value later (<code>CompletableFuture</code>). Reactive programming generalizes that to <b>streams of values over time with backpressure</b>. Spring's reactive stack is <b>Project Reactor</b>: <code>Mono&lt;T&gt;</code> (0..1 values) and <code>Flux&lt;T&gt;</code> (0..N), running on <b>WebFlux</b> instead of MVC.</p>
<ul>
<li><b>Nothing happens until subscribe</b>: a Mono/Flux is a <i>recipe</i>. Building the chain executes nothing; the subscriber triggers it. In WebFlux, <i>the framework subscribes</i> when the HTTP response is written; your code should almost never call <code>subscribe()</code>.</li>
<li><b>Operators</b>: <code>map</code> (sync transform), <code>flatMap</code> (async transform; returns another publisher), <code>filter</code>, <code>take</code>, <code>zip</code>, <code>switchIfEmpty</code> (the reactive "or else"), <code>onErrorResume</code> (the reactive catch).</li>
<li><b>Backpressure</b>: the subscriber tells the producer how much it can handle (<code>request(n)</code>); a slow consumer no longer means an exploding queue. This is the actual point of Reactive Streams, the spec Reactor implements.</li>
<li><b>Never block</b> in a reactive pipeline: <code>block()</code>, JDBC, <code>Thread.sleep</code> on an event-loop thread stalls <i>every</i> request. Blocking work goes to <code>Schedulers.boundedElastic()</code>; databases get R2DBC.</li>
<li><b>Practical guidance</b>: virtual threads (see the concurrency stream) now cover much of what WebFlux was adopted for. Reach for reactive when you need streaming, composition over many async sources, or backpressure itself.</li>
</ul>
<div class="codeSample">@GetMapping("/users/{id}")
Mono&lt;UserDto&gt; byId(@PathVariable String id) {
    return repo.findById(id)                       // Mono&lt;User&gt; (R2DBC)
        .map(UserDto::from)                        // sync transform
        .switchIfEmpty(Mono.error(new NotFound(id)));
}

@GetMapping(value = "/ticks", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
Flux&lt;Long&gt; ticks() {
    return Flux.interval(Duration.ofSeconds(1)).take(10);   // SSE stream
}</div>

<h4>The problem it was built for</h4>
<p>A thread-per-request server holds a whole thread (a megabyte of stack and a scheduler slot) while a
request waits on a database. Under heavy I/O the threads are nearly all idle and you are out of them
anyway. Reactive programming removes the waiting: work is expressed as a pipeline of callbacks that the
runtime resumes when data arrives, so a handful of threads serve thousands of concurrent requests.</p>
<p><code>Mono</code> is zero or one result, <code>Flux</code> is many, and <b>nothing runs until you
subscribe</b>: a pipeline you build and never subscribe to simply does nothing, which is the first
surprise everyone meets.</p>

<h4>What it costs</h4>
<p>The debugger stops helping. Stack traces show reactor internals rather than your call path, breakpoints
land in scheduler code, and a blocking call accidentally left in a reactive chain stalls an event loop that
serves everyone, a failure with no local symptom. Reasoning about the code is a genuinely different skill,
and it is one every maintainer must also have.</p>

<h4>Why virtual threads changed the argument</h4>
<p>The cost of blocking I/O was never the syntax; it was the thread. Virtual threads make a blocked thread
almost free, so ordinary sequential code (real stack traces, working debuggers, plain try/finally) now
scales the way reactive code does. For most new services that removes the main reason to pay the reactive
tax.</p>
<p>What remains genuinely reactive territory is <b>streaming</b> and <b>backpressure</b>: server-sent
events, long-lived subscriptions, and pipelines where a fast producer must be told to slow down. That is
what Reactor expresses well and what virtual threads do not address at all. The realistic position for 2026:
choose reactive for streams and demand signaling, not for concurrency.`,
docs:[['Project Reactor reference','https://projectreactor.io/docs/core/release/reference/'],['Spring WebFlux reference','https://docs.spring.io/spring-framework/reference/web/webflux.html'],['Which operator do I need? (Reactor)','https://projectreactor.io/docs/core/release/reference/#which-operator']],
ex:{title:'A non-blocking user endpoint',
prompt:`Write <code>UserService</code> with: (1) <code>Flux&lt;String&gt; activeNames(Flux&lt;User&gt; users)</code>: <code>filter</code> active users, <code>map</code> to <code>getName()</code>, <code>take(50)</code>; (2) <code>Mono&lt;User&gt; byId(String id)</code>: call <code>repo.findById(id)</code> (returns <code>Mono&lt;User&gt;</code>) and use <code>switchIfEmpty</code> with <code>Mono.error(new IllegalStateException("not found"))</code>. Do <b>not</b> call <code>subscribe()</code> or <code>block()</code> anywhere; the framework subscribes.`,
starter:`import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public class UserService {
    UserRepo repo;

    Flux<String> activeNames(Flux<User> users) {
        // filter → map → take(50)
        return null;
    }

    Mono<User> byId(String id) {
        // findById + switchIfEmpty(Mono.error(...))
        return null;
    }
}`,
tests:[{d:'activeNames returns a Flux pipeline',re:'Flux<String>\\s+activeNames[^}]*users\\s*\\.\\s*filter'},{d:'Maps to the name',re:'\\.map\\s*\\(\\s*(\\w+\\s*->\\s*\\w+\\.getName\\s*\\(\\s*\\)|User::getName)'},{d:'Bounds the stream with take(50)',re:'\\.take\\s*\\(\\s*50\\s*\\)'},{d:'byId falls back with switchIfEmpty',re:'switchIfEmpty\\s*\\(\\s*Mono\\.error'},{d:'Never subscribes manually',re:'\\.subscribe\\s*\\(',not:true},{d:'Never blocks',re:'\\.block\\s*\\(',not:true}],
behavior:`1. activeNames on a Flux of 3 users (2 active) emits exactly the 2 active names, transformed by getName(). 2. The pipeline is lazy: building it triggers no work until something subscribes. 3. byId("missing") emits an IllegalStateException("not found") error signal, not null. 4. take(50) caps unbounded sources. 5. No subscribe()/block() anywhere in the class.`,
hints:['activeNames is one chain: <code>return users.filter(User::isActive).map(User::getName).take(50);</code>','byId: <code>return repo.findById(id).switchIfEmpty(Mono.error(new IllegalStateException("not found")));</code>; switchIfEmpty replaces an <i>empty</i> Mono, it is not error handling.','If you feel the urge to subscribe() to "make it run": that is the job of the framework. Returning the publisher is the whole contract.'],
solution:`import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public class UserService {
    UserRepo repo;

    Flux<String> activeNames(Flux<User> users) {
        return users.filter(User::isActive)
                    .map(User::getName)
                    .take(50);
    }

    Mono<User> byId(String id) {
        return repo.findById(id)
                   .switchIfEmpty(Mono.error(new IllegalStateException("not found")));
    }
}`}},
{id:'msg1',title:'Messaging: Kafka, RabbitMQ & the outbox',body:`
<p>The events lesson ended with a promise: real systems decouple services with a <b>message broker</b>. Two families dominate: <b>Kafka</b>, a partitioned, replayable <i>log</i> (events stay; consumers track their own offset), and <b>RabbitMQ</b>, a <i>queue</i> (messages are delivered and gone). Kafka for event streams, analytics, multiple independent consumers; Rabbit for classic work queues and routing.</p>
<ul>
<li><b>Producing</b> (spring-kafka): inject <code>KafkaTemplate&lt;String,String&gt;</code> and <code>send(topic, key, value)</code>. The <b>key</b> picks the partition: same key ⇒ same partition ⇒ <i>ordered</i>. Order events for one aggregate should share a key (the order id).</li>
<li><b>Consuming</b>: <code>@KafkaListener(topics = "orders", groupId = "billing")</code>. All consumers in one group <i>share</i> the partitions (scaling); different groups each get <i>every</i> message (fan-out).</li>
<li><b>Delivery is at-least-once</b> in practice: duplicates happen (rebalances, retries). Consumers must be <b>idempotent</b>: track processed event ids, or make the handler naturally re-runnable.</li>
<li><b>The outbox pattern</b>: "save to DB then publish" can fail between the two: a lost event. Fix: in the <i>same DB transaction</i> as the business change, insert the event into an <code>outbox</code> table; a relay (or Debezium CDC) publishes from that table and marks rows sent. The broker never lies about what the database did.</li>
</ul>
<div class="codeSample">// producer, same order ⇒ same key ⇒ ordered partition
kafka.send("orders", order.id(), toJson(new OrderPlaced(order.id(), order.total())));

// consumer, billing group scales horizontally
@KafkaListener(topics = "orders", groupId = "billing")
void onOrder(String payload) {
    OrderPlaced evt = fromJson(payload);
    if (processed.contains(evt.eventId())) return;   // idempotency guard
    charge(evt);
    processed.add(evt.eventId());
}</div>

<h4>The two guarantees, and why exactly-once is not one of them</h4>
<p>Brokers offer <b>at-most-once</b> (fire and forget, messages can be lost) or <b>at-least-once</b>
(acknowledged, messages can be duplicated). Everyone wants exactly-once, and end to end it does not exist:
the acknowledgement can be lost after the work is done, so the sender cannot tell "did not happen" from
"happened but I did not hear". What you can build is <b>at-least-once delivery with an idempotent
consumer</b>, which produces an exactly-once <i>effect</i>. That is the real design, and it puts the
responsibility on the consumer rather than the broker.</p>

<h4>Why the outbox pattern exists</h4>
<p>The problem it solves is sharp: you must update the database and publish an event, and there is no
transaction spanning both. Write first and the publish can fail, leaving the world unaware. Publish first
and the write can fail, leaving an event about something that never happened.</p>
<p>The outbox removes the second system from the transaction. The event is inserted into an
<code>outbox</code> table in the <i>same</i> transaction as the data, and a relay reads that table and
publishes afterwards. Either both are committed or neither is, and the relay's retries are safe because the
consumer is idempotent.</p>

<h4>Ordering, and what it costs</h4>
<p>Kafka orders messages within a <b>partition</b>, not within a topic, so ordering is per key, and the
key you choose is a design decision. Order by account id and events for one account stay ordered while
different accounts proceed in parallel. Ask for global ordering and you have asked for one partition, which
means one consumer and no horizontal scale.</p>
<p>Finally, plan for the message you cannot process: a dead-letter queue plus an alert on its depth. Without
one, a single malformed message either blocks the partition forever or is silently dropped, and both are
discovered late.`,
docs:[['Spring for Apache Kafka reference','https://docs.spring.io/spring-kafka/reference/'],['Kafka introduction','https://kafka.apache.org/intro'],['Transactional outbox (microservices.io)','https://microservices.io/patterns/data/transactional-outbox.html']],
ex:{title:'Publish & consume order events',
prompt:`Write <code>OrderEvents</code>: (1) a field <code>KafkaTemplate&lt;String, String&gt; kafka</code>; (2) <code>void publish(String orderId, String payload)</code> that sends to topic <code>"orders"</code> with <code>orderId</code> as the <b>key</b> (ordering per order); (3) a consumer method <code>void onOrder(String payload)</code> annotated <code>@KafkaListener(topics = "orders", groupId = "billing")</code> that skips already-processed payloads using a <code>Set&lt;String&gt; processed</code> (idempotency) before calling <code>handle(payload)</code>.`,
starter:`import java.util.HashSet;
import java.util.Set;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;

public class OrderEvents {
    KafkaTemplate<String, String> kafka;
    Set<String> processed = new HashSet<>();

    void publish(String orderId, String payload) {
        // topic "orders", key orderId
    }

    // @KafkaListener consumer with idempotency guard, then handle(payload)

    void handle(String payload) { /* provided */ }
}`,
tests:[{d:'Sends via KafkaTemplate',re:'kafka\\.send\\s*\\('},{d:'Topic "orders" with orderId as key',re:'send\\s*\\(\\s*"orders"\\s*,\\s*orderId\\s*,\\s*payload\\s*\\)'},{d:'@KafkaListener on the consumer',re:'@KafkaListener\\s*\\(\\s*topics\\s*=\\s*"orders"'},{d:'Consumer group declared',re:'groupId\\s*=\\s*"billing"'},{d:'Idempotency guard before handling',re:'processed\\.(contains|add)\\s*\\('},{d:'Delegates to handle()',re:'handle\\s*\\(\\s*payload\\s*\\)'}],
behavior:`1. publish("o-1", "{...}") calls kafka.send("orders", "o-1", "{...}"); events for the same order land on the same partition, in order. 2. onOrder called twice with the same payload invokes handle() exactly once (Set-based guard). 3. A new payload is handled and then recorded in processed. 4. The listener annotation carries both topics and groupId.`,
hints:['publish is one line: <code>kafka.send("orders", orderId, payload);</code>; the arguments are (topic, key, value). The key is what gives you per-order ordering.','Consumer shape: <code>@KafkaListener(topics = "orders", groupId = "billing") void onOrder(String payload) { ... }</code>','Guard first: <code>if (processed.contains(payload)) return; handle(payload); processed.add(payload);</code>; real systems use an event id + persistent store, same idea.'],
solution:`import java.util.HashSet;
import java.util.Set;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;

public class OrderEvents {
    KafkaTemplate<String, String> kafka;
    Set<String> processed = new HashSet<>();

    void publish(String orderId, String payload) {
        kafka.send("orders", orderId, payload);
    }

    @KafkaListener(topics = "orders", groupId = "billing")
    void onOrder(String payload) {
        if (processed.contains(payload)) return;
        handle(payload);
        processed.add(payload);
    }

    void handle(String payload) { /* provided */ }
}`}},
{id:'cch1',title:'Caching: Caffeine, Spring Cache & Redis',body:`
<p>The fastest query is the one you don't run. Caching layers, from closest to farthest:</p>
<ul>
<li><b>In-process</b>: <b>Caffeine</b>, the standard local cache (a smarter ConcurrentHashMap): bounded size, TTL, near-optimal eviction (W-TinyLFU). Nanosecond reads, but per-instance and gone on restart.</li>
<li><b>Distributed</b>: <b>Redis</b>, shared by all instances, survives deploys, adds a network hop (~1ms). The default for session data and anything multiple nodes must agree on.</li>
<li><b>Spring's abstraction</b>: annotate, don't hand-roll. <code>@EnableCaching</code> once, then <code>@Cacheable</code> (check cache, else run method and store), <code>@CacheEvict</code> (drop on update/delete), <code>@CachePut</code> (refresh). Swap Caffeine ↔ Redis via the configured <code>CacheManager</code>, code unchanged.</li>
</ul>
<div class="codeSample">@Cacheable(value = "users", key = "#id")
User byId(long id) { return repo.findById(id); }     // body skipped on cache hit

@CacheEvict(value = "users", key = "#user.id")
void update(User user) { repo.save(user); }          // stale entry dropped

@Bean CaffeineCacheManager cacheManager() {
    CaffeineCacheManager m = new CaffeineCacheManager("users");
    m.setCaffeine(Caffeine.newBuilder()
        .maximumSize(10_000)
        .expireAfterWrite(Duration.ofMinutes(10)));
    return m;
}</div>
<p>The three classic cache bugs: <b>staleness</b> (evict on every write path, the hard part of cache invalidation), <b>unbounded growth</b> (always set <code>maximumSize</code>), and <b>stampede</b> (a hot key expires and a thousand requests hit the DB at once; Caffeine's <code>refreshAfterWrite</code> serves the old value while one thread reloads). And never cache mutable objects you then modify; you'll corrupt the cache in place.</p>

<h4>The two questions to answer before adding a cache</h4>
<p><b>What is the correct staleness?</b> Not "is stale data acceptable" (it always is, briefly) but how
many seconds of wrongness this particular data can carry. A product price and a session token have very
different answers, and a cache without a stated answer is a bug waiting for a customer to find.</p>
<p><b>What is the hit rate?</b> A cache below roughly 80% hits is often adding a lookup, a serialization
and a network hop to buy very little. Measure before and after; "we added caching" without a hit-rate
number is not an optimization, it is a hope.</p>

<h4>Invalidation, and why it is the hard half</h4>
<p>There are only three strategies, and every system uses some mix. <b>TTL</b> is the simplest and the only
one that needs no discipline: the data is wrong for at most N seconds, by design. <b>Explicit eviction</b>
on write is correct and requires every write path to remember, including the batch job somebody added last
month. <b>Versioned keys</b> sidestep invalidation entirely by making the key contain the version, so old
entries are never read and simply age out.</p>
<p>The failure mode people underestimate is the <b>cache as a hidden dependency</b>: a 99% hit rate means
the database is sized for the surviving 1%, so a flush or a restart sends a hundred times its expected load
at it. Stagger your TTLs so keys do not all expire together, and use request coalescing so one miss does
not become a thousand identical queries.</p>

<h4>Choosing a layer</h4>
<p>In-process is nanoseconds and per-instance, so it is right for hot, small, read-mostly data where each
node disagreeing slightly is harmless: reference data, compiled patterns, feature flags. Distributed costs
a millisecond and buys agreement, so it is right for anything a user must see consistently across
instances. Many systems want both: a local cache in front of Redis, with a short local TTL to bound the
disagreement.</p>`,
docs:[['Caffeine (GitHub)','https://github.com/ben-manes/caffeine'],['Spring cache abstraction','https://docs.spring.io/spring-framework/reference/integration/cache.html'],['Spring Boot caching guide','https://docs.spring.io/spring-boot/reference/io/caching.html']],
ex:{title:'Cache the user lookups',
prompt:`Write <code>UserCacheConfig</code> annotated <code>@EnableCaching</code> containing a <code>@Bean</code> method returning a <code>CaffeineCacheManager</code> for cache <code>"users"</code> configured with <code>maximumSize(10_000)</code> and <code>expireAfterWrite(Duration.ofMinutes(10))</code>. Then a <code>UserService</code> with <code>@Cacheable(value = "users", key = "#id")</code> on <code>byId(long id)</code> and <code>@CacheEvict(value = "users", key = "#user.id")</code> on <code>update(User user)</code>.`,
starter:`import java.time.Duration;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.annotation.*;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UserCacheConfig {
    // @EnableCaching + @Bean CaffeineCacheManager (maximumSize, expireAfterWrite)
}

class UserService {
    UserRepo repo;
    // @Cacheable byId  +  @CacheEvict update
}`,
tests:[{d:'Caching switched on',re:'@EnableCaching'},{d:'Caffeine bounded with maximumSize',re:'Caffeine\\.newBuilder\\s*\\(\\s*\\)[^;]*maximumSize\\s*\\(\\s*10_?000\\s*\\)'},{d:'TTL via expireAfterWrite',re:'expireAfterWrite\\s*\\(\\s*Duration\\.ofMinutes\\s*\\(\\s*10\\s*\\)\\s*\\)'},{d:'@Cacheable with cache name and key',re:'@Cacheable\\s*\\(\\s*value\\s*=\\s*"users"\\s*,\\s*key\\s*=\\s*"#id"\\s*\\)'},{d:'@CacheEvict on the write path',re:'@CacheEvict\\s*\\(\\s*value\\s*=\\s*"users"\\s*,\\s*key\\s*=\\s*"#user\\.id"\\s*\\)'}],
behavior:`1. Two calls to byId(7) run the repository once; the second is served from "users". 2. update(user) evicts that user's entry, so the next byId reloads fresh data (no stale reads). 3. The cache never exceeds 10,000 entries and entries older than 10 minutes expire. 4. Removing @EnableCaching would silently turn every annotation into a no-op; it is the master switch.`,
hints:['Config: <code>@EnableCaching</code> on the class; the bean builds <code>new CaffeineCacheManager("users")</code> and calls <code>setCaffeine(Caffeine.newBuilder().maximumSize(10_000).expireAfterWrite(Duration.ofMinutes(10)))</code>.','byId: <code>@Cacheable(value = "users", key = "#id") User byId(long id) { return repo.findById(id); }</code>; the SpEL <code>#id</code> refers to the parameter.','update: <code>@CacheEvict(value = "users", key = "#user.id") void update(User user) { repo.save(user); }</code>; write paths evict, read paths cache.'],
solution:`import java.time.Duration;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.annotation.*;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class UserCacheConfig {
    @Bean
    CaffeineCacheManager cacheManager() {
        CaffeineCacheManager m = new CaffeineCacheManager("users");
        m.setCaffeine(Caffeine.newBuilder()
            .maximumSize(10_000)
            .expireAfterWrite(Duration.ofMinutes(10)));
        return m;
    }
}

class UserService {
    UserRepo repo;

    @Cacheable(value = "users", key = "#id")
    User byId(long id) { return repo.findById(id); }

    @CacheEvict(value = "users", key = "#user.id")
    void update(User user) { repo.save(user); }
}`}},
]});
