STREAMS.push({icon:'🍃',title:'Spring Boot',blurb:'Auto-configuration, dependency injection, REST controllers, data access and configuration.',lessons:[
{id:'spr1',title:'Why Boot: starters & auto-configuration',body:`
<p>Spring Boot = Spring with the setup automated. Three pillars:</p>
<ul>
<li><b>Starters</b>: one dependency pulls a curated, version-compatible set — <code>spring-boot-starter-web</code> gives you Spring MVC + Jackson + embedded Tomcat.</li>
<li><b>Auto-configuration</b>: Boot inspects the classpath and configures beans accordingly (H2 present → in-memory DataSource, web starter → DispatcherServlet).</li>
<li><b>Embedded server</b>: your app is a runnable jar — <code>java -jar app.jar</code>, no Tomcat installation.</li>
</ul>
<div class="codeSample" data-hl>@SpringBootApplication   // = @Configuration + @EnableAutoConfiguration + @ComponentScan
public class DojoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DojoApplication.class, args);
    }
}</div>
<p>Start any project at <a href="https://start.spring.io" target="_blank" rel="noopener">start.spring.io</a>. Component scanning finds your annotated classes in the same package and below — the #1 beginner bug is putting classes outside that package tree.</p>`,
docs:[['Spring Boot reference','https://docs.spring.io/spring-boot/index.html'],['Spring Initializr','https://start.spring.io'],['Building an Application with Spring Boot — guide','https://spring.io/guides/gs/spring-boot']],
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
<li><b>Configuration</b>: <code>@Configuration</code> + <code>@Bean</code> for manual bean recipes; <code>@Value("$${'{'}dojo.x}")</code> single property; <code>@ConfigurationProperties</code> typed blocks; <code>@Profile("prod")</code> conditional beans; <code>@ConditionalOnProperty</code> and friends — the machinery of auto-configuration itself.</li>
<li><b>Injection control</b>: <code>@Autowired</code> (skippable on single constructors), <code>@Qualifier("name")</code> to pick between candidates, <code>@Primary</code> to set the default.</li>
<li><b>Web binding</b>: <code>@GetMapping/@PostMapping…</code>, <code>@PathVariable</code>, <code>@RequestParam</code>, <code>@RequestBody</code>, <code>@ResponseStatus</code>, <code>@RestControllerAdvice</code>/<code>@ExceptionHandler</code>.</li>
<li><b>Lifecycle & behavior</b>: <code>@PostConstruct</code>/<code>@PreDestroy</code> hooks; <code>@Transactional</code>, <code>@Cacheable</code>, <code>@Scheduled</code>, <code>@Async</code> — these four work via <b>proxies</b>: Spring wraps your bean and intercepts the call, which is why self-invocation (this.method()) bypasses them.</li>
<li><b>Testing</b>: <code>@SpringBootTest</code> full context, <code>@WebMvcTest</code>/<code>@DataJpaTest</code> slices, <code>@MockBean</code> swap a bean for a mock.</li>
</ul>
<p><b>How it works under the hood</b>: component scanning finds annotated classes (reflection — your dep4 lesson), auto-configuration applies <code>@Conditional*</code> recipes based on the classpath, and behavior annotations generate runtime proxies. Nothing magic — just the annotation + reflection machinery you already built by hand, industrialized.</p>`,
docs:[['Spring annotation-based container config','https://docs.spring.io/spring-framework/reference/core/beans/annotation-config.html'],['Spring Boot auto-configuration','https://docs.spring.io/spring-boot/reference/using/auto-configuration.html'],['@Transactional proxying — Spring','https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html']],
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
<p>Spring's core: you declare components, the container builds the object graph. <b>Inversion of control</b> — classes receive their dependencies instead of constructing them, so everything is swappable and testable.</p>
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
<p>Stereotypes: <code>@Component</code> (generic), <code>@Service</code>, <code>@Repository</code>, <code>@Controller</code>/<code>@RestController</code> — all become beans via scanning. <b>Prefer constructor injection with final fields</b> over field <code>@Autowired</code>: immutable, explicit, unit-testable with plain <code>new</code>.</p>`,
docs:[['Spring IoC container — reference','https://docs.spring.io/spring-framework/reference/core/beans.html'],['Constructor injection — Baeldung','https://www.baeldung.com/constructor-injection-in-spring']],
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
hints:['Field: <code>private final AuditService audit;</code> — final forces constructor assignment.','Constructor: <code>TransferService(AuditService audit) { this.audit = audit; }</code> — with one constructor, Spring injects automatically.','transfer: <code>audit.log("transfer " + cents + "c from " + from + " to " + to);</code>'],
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
<p>Aspect-Oriented Programming extracts <b>cross-cutting concerns</b> (logging, timing, security, transactions) out of business code and into <b>aspects</b> that Spring weaves in via proxies. You have been using AOP all along — <code>@Transactional</code>, <code>@Cacheable</code> and <code>@PreAuthorize</code> are aspects.</p>
<div class="codeSample" data-hl>@Aspect
@Component
public class TimingAspect {

    // POINTCUT: which methods — here, everything in the service package
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
<p>Advice types: <code>@Around</code> (full control — can skip, retry, rewrite), <code>@Before</code>, <code>@AfterReturning</code>, <code>@AfterThrowing</code>. Pointcut languages: <code>execution(...)</code> patterns, <code>within(...)</code>, and <code>@annotation(...)</code> (next lesson). <b>Proxy limits you must know</b>: only calls that cross the proxy are advised — self-invocation (<code>this.method()</code>) bypasses aspects entirely, and final methods can't be proxied. Requires <code>spring-boot-starter-aop</code>.</p>`,
docs:[['Spring AOP — reference','https://docs.spring.io/spring-framework/reference/core/aop.html'],['Pointcut expressions — Spring','https://docs.spring.io/spring-framework/reference/core/aop/ataspectj/pointcuts.html']],
ex:{title:'A timing aspect',
prompt:`Write <code>@Aspect @Component class TimingAspect</code> with an <code>@Around</code> advice on pointcut <code>execution(* com.example.svc.service..*(..))</code>: method <code>Object time(ProceedingJoinPoint pjp) throws Throwable</code> that records <code>System.nanoTime()</code>, calls <code>pjp.proceed()</code> in a try, and in a <b>finally</b> prints the signature and elapsed milliseconds — so timing is reported even when the method throws.`,
starter:`import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

// @Aspect + @Component

public class TimingAspect {

    // @Around(...) Object time(ProceedingJoinPoint pjp) throws Throwable
}`,
tests:[{d:'@Aspect and @Component on the class',re:'@Aspect\\s*\\n?\\s*@Component'},{d:'@Around with the exact pointcut',re:'@Around\\s*\\(\\s*"execution\\(\\* com\\.example\\.svc\\.service\\.\\.\\*\\(\\.\\.\\)\\)"\\s*\\)'},{d:'Proceeds inside a try',re:'try\\s*\\{[\\s\\S]*?pjp\\.proceed\\s*\\(\\s*\\)'},{d:'Timing reported in finally',re:'finally\\s*\\{[\\s\\S]*?nanoTime'},{d:'Uses the join point signature',re:'pjp\\.getSignature\\s*\\(\\s*\\)'}],
behavior:`1. Any method in com.example.svc.service (and subpackages) gets timed transparently — zero changes to service code. 2. The return value of proceed() is returned unchanged. 3. A throwing method still logs its duration (finally) and the exception propagates. 4. The aspect is itself a bean (@Component) — otherwise Spring never sees it.`,
hints:['Return type Object + <code>return pjp.proceed();</code> — you are standing in for the real method.','try { return pjp.proceed(); } finally { ...log... } — the finally is what makes timing exception-safe.','The pointcut reads: any return type (*), package com.example.svc.service and below (..), any method, any args (..).'],
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
<p>Pattern 1 needs no code — Spring reads meta-annotations recursively. Pattern 2 is the full framework move: exactly how <code>@Transactional</code>, <code>@Cacheable</code> and <code>@PreAuthorize</code> are built. In your domain this is how you'd add <code>@RequiresMfa</code> or <code>@RateLimited</code> to endpoints declaratively.</p>`,
docs:[['Meta-annotations & composed annotations — Spring','https://docs.spring.io/spring-framework/reference/core/beans/classpath-scanning.html#beans-meta-annotations'],['@annotation pointcut — Spring AOP','https://docs.spring.io/spring-framework/reference/core/aop/ataspectj/pointcuts.html']],
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
behavior:`1. A method annotated @Audited("token.issue") prints [AUDIT] token.issue before executing — no service code touched. 2. The pointcut parameter name ("audited") matches the advice parameter, which is how Spring hands you the annotation instance with its value(). 3. A class annotated @TransactionalService behaves as both @Service and @Transactional — Spring reads meta-annotations recursively. 4. RUNTIME retention on both — or none of this fires.`,
hints:['The composed annotation is just meta-annotations stacked on @interface: @Target, @Retention, @Service, @Transactional.','The magic wire: the string inside @annotation(...) must equal the advice parameter name.','Advice body: print, then <code>return pjp.proceed();</code> — forgetting proceed() silently swallows every audited call.'],
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
<p>Parameter annotations: <code>@PathVariable</code> (from the URL), <code>@RequestParam</code> (?query=), <code>@RequestBody</code> (JSON body). <code>ResponseEntity</code> gives full control of status and headers.</p>`,
docs:[['Building a RESTful Web Service — guide','https://spring.io/guides/gs/rest-service'],['Spring MVC annotated controllers','https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller.html']],
ex:{title:'A Positions API',
prompt:`Write <code>PositionController</code>: <code>@RestController</code> mapped to <code>/api/positions</code>, with an in-memory <code>Map&lt;String, String&gt;</code>. Endpoints: <code>GET /{id}</code> returning <code>ResponseEntity&lt;String&gt;</code> — 200 with the value or 404 if absent; and <code>POST</code> taking <code>@RequestParam String id, @RequestParam String symbol</code>, storing it and returning the created value with status <code>201</code> via <code>@ResponseStatus</code>.`,
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
<p>Method names become queries: <code>findBy</code> + property + operators (<code>GreaterThan</code>, <code>Containing</code>, <code>OrderBy…Desc</code>). Business operations that touch multiple rows belong in <code>@Transactional</code> service methods.</p>`,
docs:[['Accessing Data with JPA — guide','https://spring.io/guides/gs/accessing-data-jpa'],['Spring Data JPA — query methods','https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html']],
ex:{title:'Derive the queries',
prompt:`Write interface <code>TradeRepository extends JpaRepository&lt;Trade, Long&gt;</code> with three <b>derived query methods</b> (signatures only, no bodies — it's an interface): find all trades by <code>symbol</code>, find trades with <code>amountCents</code> greater than a value, and find trades by symbol ordered by <code>executedAt</code> descending. Assume entity <code>Trade</code> has those properties. Then a <code>@Service TradeService</code> with constructor-injected repository and a <code>@Transactional</code> method <code>void reprice(Long id, long newAmount)</code> that loads via <code>findById(...).orElseThrow()</code> and sets the amount.`,
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
<p>Prefer <code>@ConfigurationProperties</code> records over scattered <code>@Value</code>; prefer slice tests (<code>@WebMvcTest</code>, <code>@DataJpaTest</code>) — they run in milliseconds, keeping the full <code>@SpringBootTest</code> for wiring smoke tests.</p>`,
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
<p>Never trust a request body. Bean Validation annotations declare the rules; <code>@Valid</code> enforces them; a <code>@RestControllerAdvice</code> turns violations into your error contract (remember RFC 9457 from the REST stream — Spring 6 ships <code>ProblemDetail</code> natively):</p>
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
<p>One advice class gives every controller the same error shape — API-platform gold. Common annotations: <code>@NotNull</code>, <code>@NotBlank</code>, <code>@Size</code>, <code>@Min/@Max</code>, <code>@Email</code>, <code>@Pattern</code>.</p>`,
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
{id:'spr7',title:'Spring Security & JWT — your home turf',body:`
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
<p>As a JWT <b>resource server</b>, Spring validates the token signature against your IdP's JWKS endpoint (<code>spring.security.oauth2.resourceserver.jwt.issuer-uri=...</code>) — exactly the CIAM architecture you run: auth server issues tokens, every API validates them statelessly. Method-level rules: <code>@PreAuthorize("hasRole('ADMIN')")</code>. Order matters in the matcher list: first match wins.</p>`,
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
behavior:`1. GET /actuator/health works unauthenticated. 2. /api/admin/x requires a JWT carrying ROLE_ADMIN. 3. Any other endpoint requires a valid JWT. 4. No HTTP sessions created — every request authenticates via its bearer token. 5. Matcher order: specific rules before anyRequest.`,
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
<p>The production checklist: <code>/actuator/health</code> wired to probes (last stream), <code>/actuator/prometheus</code> scraped for dashboards/alerts, JSON logs to stdout, <b>graceful shutdown</b> so in-flight requests finish, and custom Micrometer metrics for the numbers your dashboards actually need (login success rate, token issuance latency — your CIAM SLOs live here). Info endpoint + build info (<code>spring-boot-maven-plugin build-info</code> goal) tells you exactly which commit is running.</p>`,
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
behavior:`1. issue("ron") increments ciam.tokens.issued and returns "tok-ron". 2. issue(null) and issue("  ") increment ciam.tokens.rejected and throw IllegalArgumentException — count BEFORE throwing. 3. Counters are final fields created once in the constructor, not per call.`,
hints:['Fields: <code>private final Counter issued; private final Counter rejected;</code> — assign both in the constructor from the registry.','Guard clause: <code>if (userId == null || userId.isBlank()) { rejected.increment(); throw new IllegalArgumentException("userId required"); }</code>','Metrics created per-call would re-register on every request — constructor-once is the Micrometer pattern.'],
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
<p>Events invert the coupling: instead of <code>RegistrationService</code> calling email, analytics and provisioning directly (and knowing them all), it announces a fact — <i>a user registered</i> — and interested parties react. Spring ships the machinery in-process:</p>
<div class="codeSample" data-hl>// the event: an immutable fact — records are perfect
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

// LISTEN — three escalating levels:
@Component
public class WelcomeListener {
    @EventListener                          // 1) sync: runs on the caller's thread
    void plain(UserRegistered e) { ... }

    @Async @EventListener                   // 2) async: own thread — caller doesn't wait
    void sendWelcomeEmail(UserRegistered e) { ... }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    void provisionAccess(UserRegistered e) { ... }   // 3) only after the tx COMMITS
}</div>
<p>The traps that separate senior from junior here: plain <code>@EventListener</code> is <b>synchronous</b> — a slow listener slows the publisher, a throwing listener rolls back the publisher's transaction. <code>@Async</code> needs <code>@EnableAsync</code> on a config class (and a sensible executor — virtual threads shine). And the big one: side effects that must only happen if the data is really saved (emails, provisioning, webhooks) belong in <code>@TransactionalEventListener(AFTER_COMMIT)</code> — otherwise a rollback leaves you having emailed about a user that doesn't exist. Beyond one process, the same pattern scales out via Kafka/RabbitMQ (Spring Cloud Stream) with the <b>transactional outbox</b> pattern replacing AFTER_COMMIT.</p>`,
docs:[['Application events — Spring','https://docs.spring.io/spring-framework/reference/core/beans/context-introduction.html#context-functionality-events'],['@TransactionalEventListener — API','https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/event/TransactionalEventListener.html'],['@Async — Spring','https://docs.spring.io/spring-framework/reference/integration/scheduling.html#scheduling-annotation-support-async']],
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
behavior:`1. register(...) publishes one UserRegistered event; the service knows nothing about email or provisioning. 2. sendEmail runs on a different thread (@Async) — register returns without waiting. 3. provision fires only after the surrounding transaction commits; on rollback it never fires — no ghost provisioning. 4. Without @EnableAsync, @Async silently degrades to synchronous — the config class is not optional.`,
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
<li><b>Nothing happens until subscribe</b>: a Mono/Flux is a <i>recipe</i>. Building the chain executes nothing; the subscriber triggers it. In WebFlux, <i>the framework subscribes</i> when the HTTP response is written — your code should almost never call <code>subscribe()</code>.</li>
<li><b>Operators</b>: <code>map</code> (sync transform), <code>flatMap</code> (async transform — returns another publisher), <code>filter</code>, <code>take</code>, <code>zip</code>, <code>switchIfEmpty</code> (the reactive "or else"), <code>onErrorResume</code> (the reactive catch).</li>
<li><b>Backpressure</b>: the subscriber tells the producer how much it can handle (<code>request(n)</code>) — a slow consumer no longer means an exploding queue. This is the actual point of Reactive Streams, the spec Reactor implements.</li>
<li><b>Never block</b> in a reactive pipeline — <code>block()</code>, JDBC, <code>Thread.sleep</code> on an event-loop thread stalls <i>every</i> request. Blocking work goes to <code>Schedulers.boundedElastic()</code>; databases get R2DBC.</li>
<li><b>Honest guidance</b>: virtual threads (see the concurrency stream) now cover much of what WebFlux was adopted for. Reach for reactive when you need streaming, composition over many async sources, or backpressure itself.</li>
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
}</div>`,
docs:[['Project Reactor reference','https://projectreactor.io/docs/core/release/reference/'],['Spring WebFlux reference','https://docs.spring.io/spring-framework/reference/web/webflux.html'],['Which operator do I need? — Reactor','https://projectreactor.io/docs/core/release/reference/#which-operator']],
ex:{title:'A non-blocking user endpoint',
prompt:`Write <code>UserService</code> with: (1) <code>Flux&lt;String&gt; activeNames(Flux&lt;User&gt; users)</code> — <code>filter</code> active users, <code>map</code> to <code>getName()</code>, <code>take(50)</code>; (2) <code>Mono&lt;User&gt; byId(String id)</code> — call <code>repo.findById(id)</code> (returns <code>Mono&lt;User&gt;</code>) and use <code>switchIfEmpty</code> with <code>Mono.error(new IllegalStateException("not found"))</code>. Do <b>not</b> call <code>subscribe()</code> or <code>block()</code> anywhere — the framework subscribes.`,
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
behavior:`1. activeNames on a Flux of 3 users (2 active) emits exactly the 2 active names, transformed by getName(). 2. The pipeline is lazy — building it triggers no work until something subscribes. 3. byId("missing") emits an IllegalStateException("not found") error signal, not null. 4. take(50) caps unbounded sources. 5. No subscribe()/block() anywhere in the class.`,
hints:['activeNames is one chain: <code>return users.filter(User::isActive).map(User::getName).take(50);</code>','byId: <code>return repo.findById(id).switchIfEmpty(Mono.error(new IllegalStateException("not found")));</code> — switchIfEmpty replaces an <i>empty</i> Mono, it is not error handling.','If you feel the urge to subscribe() to "make it run" — that is the job of the framework. Returning the publisher is the whole contract.'],
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
<p>The events lesson ended with a promise: real systems decouple services with a <b>message broker</b>. Two families dominate: <b>Kafka</b> — a partitioned, replayable <i>log</i> (events stay; consumers track their own offset), and <b>RabbitMQ</b> — a <i>queue</i> (messages are delivered and gone). Kafka for event streams, analytics, multiple independent consumers; Rabbit for classic work queues and routing.</p>
<ul>
<li><b>Producing</b> (spring-kafka): inject <code>KafkaTemplate&lt;String,String&gt;</code> and <code>send(topic, key, value)</code>. The <b>key</b> picks the partition — same key ⇒ same partition ⇒ <i>ordered</i>. Order events for one aggregate should share a key (the order id).</li>
<li><b>Consuming</b>: <code>@KafkaListener(topics = "orders", groupId = "billing")</code>. All consumers in one group <i>share</i> the partitions (scaling); different groups each get <i>every</i> message (fan-out).</li>
<li><b>Delivery is at-least-once</b> in practice — duplicates happen (rebalances, retries). Consumers must be <b>idempotent</b>: track processed event ids, or make the handler naturally re-runnable.</li>
<li><b>The outbox pattern</b>: "save to DB then publish" can fail between the two — a lost event. Fix: in the <i>same DB transaction</i> as the business change, insert the event into an <code>outbox</code> table; a relay (or Debezium CDC) publishes from that table and marks rows sent. The broker never lies about what the database did.</li>
</ul>
<div class="codeSample">// producer — same order ⇒ same key ⇒ ordered partition
kafka.send("orders", order.id(), toJson(new OrderPlaced(order.id(), order.total())));

// consumer — billing group scales horizontally
@KafkaListener(topics = "orders", groupId = "billing")
void onOrder(String payload) {
    OrderPlaced evt = fromJson(payload);
    if (processed.contains(evt.eventId())) return;   // idempotency guard
    charge(evt);
    processed.add(evt.eventId());
}</div>`,
docs:[['Spring for Apache Kafka reference','https://docs.spring.io/spring-kafka/reference/'],['Kafka introduction','https://kafka.apache.org/intro'],['Transactional outbox — microservices.io','https://microservices.io/patterns/data/transactional-outbox.html']],
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
behavior:`1. publish("o-1", "{...}") calls kafka.send("orders", "o-1", "{...}") — events for the same order land on the same partition, in order. 2. onOrder called twice with the same payload invokes handle() exactly once (Set-based guard). 3. A new payload is handled and then recorded in processed. 4. The listener annotation carries both topics and groupId.`,
hints:['publish is one line: <code>kafka.send("orders", orderId, payload);</code> — (topic, key, value). The key is what gives you per-order ordering.','Consumer shape: <code>@KafkaListener(topics = "orders", groupId = "billing") void onOrder(String payload) { ... }</code>','Guard first: <code>if (processed.contains(payload)) return; handle(payload); processed.add(payload);</code> — real systems use an event id + persistent store, same idea.'],
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
<li><b>In-process</b> — <b>Caffeine</b>, the standard local cache (a smarter ConcurrentHashMap): bounded size, TTL, near-optimal eviction (W-TinyLFU). Nanosecond reads, but per-instance and gone on restart.</li>
<li><b>Distributed</b> — <b>Redis</b>: shared by all instances, survives deploys, adds a network hop (~1ms). The default for session data and anything multiple nodes must agree on.</li>
<li><b>Spring's abstraction</b> — annotate, don't hand-roll: <code>@EnableCaching</code> once, then <code>@Cacheable</code> (check cache, else run method and store), <code>@CacheEvict</code> (drop on update/delete), <code>@CachePut</code> (refresh). Swap Caffeine ↔ Redis via the configured <code>CacheManager</code>, code unchanged.</li>
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
<p>The three classic cache bugs: <b>staleness</b> (evict on every write path — the hard part of cache invalidation), <b>unbounded growth</b> (always set <code>maximumSize</code>), and <b>stampede</b> (a hot key expires and a thousand requests hit the DB at once — Caffeine's <code>refreshAfterWrite</code> serves the old value while one thread reloads). And never cache mutable objects you then modify — you'll corrupt the cache in place.</p>`,
docs:[['Caffeine — GitHub','https://github.com/ben-manes/caffeine'],['Spring cache abstraction','https://docs.spring.io/spring-framework/reference/integration/cache.html'],['Spring Boot caching guide','https://docs.spring.io/spring-boot/reference/io/caching.html']],
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
behavior:`1. Two calls to byId(7) run the repository once — the second is served from "users". 2. update(user) evicts that user's entry, so the next byId reloads fresh data (no stale reads). 3. The cache never exceeds 10,000 entries and entries older than 10 minutes expire. 4. Removing @EnableCaching would silently turn every annotation into a no-op — it is the master switch.`,
hints:['Config: <code>@EnableCaching</code> on the class; the bean builds <code>new CaffeineCacheManager("users")</code> and calls <code>setCaffeine(Caffeine.newBuilder().maximumSize(10_000).expireAfterWrite(Duration.ofMinutes(10)))</code>.','byId: <code>@Cacheable(value = "users", key = "#id") User byId(long id) { return repo.findById(id); }</code> — the SpEL <code>#id</code> refers to the parameter.','update: <code>@CacheEvict(value = "users", key = "#user.id") void update(User user) { repo.save(user); }</code> — write paths evict, read paths cache.'],
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
