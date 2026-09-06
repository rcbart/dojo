STREAMS.push({icon:'🔑',iam:true,sec:'Authentication & MFA',title:'Authentication Methods & MFA',blurb:'How people actually prove who they are: password hashing done right, the three factor types, TOTP one-time codes, phishing-resistant passkeys (WebAuthn/FIDO2), and step-up/adaptive authentication for risky actions.',lessons:[

{id:'am1',title:'Passwords, done right',body:`

<p>A password is a shared secret, and the one rule is <b>never store it</b>. Store a slow, salted <i>hash</i>. If the database leaks, attackers get hashes to crack one guess at a time, not a ready-made login list.</p>
<p>Use a purpose-built password hash: <b>Argon2id</b> (first choice today), <b>scrypt</b>, or <b>bcrypt</b>. They're deliberately slow and memory-hard. Never use a fast general-purpose hash like <b>MD5</b> or <b>SHA-256</b> for passwords. SHA-256 is a hash function: it turns any input into a fixed 32-byte fingerprint, the same input always gives the same fingerprint, and no one can work backwards from the fingerprint to the input. MD5 is an older hash of the same kind, now known to be breakable. Both are built to be fast, and that's the problem here: a GPU tries billions of those per second.</p>
<div class="codeSample" data-hl>// pseudocode: a real app calls a library (e.g. Spring Security's Argon2PasswordEncoder)
String hash = argon2id(password, randomSalt);   // store hash + params; never the password
boolean ok  = argon2Verify(entered, hash);       // constant-time compare inside</div>
<p>Also enforce a sane <b>policy</b>. Length beats complexity (aim for 12+). Check new passwords against known-breached lists, since credential stuffing reuses leaked passwords.</p>

<h4>Why "slow" is the feature</h4>
<p>For a password hash, <b>slow is the product</b>. You run the function once per login, and 200 milliseconds is invisible to the user. An attacker who has stolen your database runs it <i>billions of times</i> against a wordlist. Make it a thousand times slower: the user notices nothing and the attacker's six-hour job becomes six months.</p>
<div class="codeSample" data-hl>SHA-256      ~10,000,000,000 guesses/sec on a rented GPU rig
             a leaked database of SHA-256 passwords is a WORDLIST with
             extra steps. common passwords fall in seconds.

Argon2id     tuned to ~200ms and ~64MB of MEMORY per guess
             memory is the point: GPUs have thousands of cores and not
             much memory each, so memory-hardness removes the attacker's
             main advantage rather than just slowing them down.</div>

<h4>Salt and pepper</h4>
<p>A <b>salt</b> is a random value stored alongside the hash, different for every user. Without it, two people with the same password get the same hash, so one crack opens both accounts, and precomputed rainbow tables work. With it, every password must be attacked individually. It isn't secret, and a modern library generates and embeds it for you.</p>
<p>A <b>pepper</b> is a single secret value mixed in and kept <i>outside</i> the database, in an <b>HSM</b> or the application's secret store. An HSM is a hardware security module: a locked box, physical or cloud-hosted, that holds secret keys and does the work inside itself, so the key can be used but never copied out. If only the database leaks, the hashes can't be cracked without the pepper. It adds a rotation problem, so reserve it for high-value systems.</p>

<h4>The modern policy</h4>
<p>NIST <b>SP</b> 800-63B changed the advice, and much of the industry hasn't caught up. SP here means Special Publication: it's the US standards body's numbered guidance document, and 800-63B is the one about passwords and logins.</p>
<div class="codeSample" data-hl>DO                                   DO NOT
require a minimum length (8+, 12+   impose composition rules
  is better) and allow up to 64       ("one uppercase, one symbol") -
allow ALL characters, spaces and      they produce Password1! and
  emoji included                      nothing else
check against known-breached lists  expire passwords on a schedule
  and reject matches                  with no evidence of compromise -
allow paste, so managers work         it only produces Summer2026 ->
                                      Autumn2026
                                    use hints or security questions</div>
<p>Both crossed-out habits push people toward predictable patterns, lowering real entropy while appearing to raise it.</p>

<h4>Two implementation details</h4>
<p><b>Compare in constant time.</b> A comparison that returns early leaks, through timing, how much of the value matched. Every real library does this internally.</p>
<p><b>Never reveal whether the username exists.</b> "No such user" versus "wrong password" hands an attacker an account-enumeration oracle. Return one message and take roughly the same time on both paths: hash a dummy value even when the user wasn't found.</p>`,
docs:[['Password storage (OWASP)','https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html'],['Argon2 (RFC 9106)','https://www.rfc-editor.org/rfc/rfc9106.html']],
ex:{title:'Policy & algorithm choice',
prompt:`Write class <code>Passwords</code> with two static methods: <code>String algorithm()</code> that returns <code>"argon2id"</code>, and <code>boolean strong(String pw)</code> that returns true only when <code>pw</code> is at least 12 characters long. Do not use MD5 or SHA-256 for password hashing.`,
starter:`public class Passwords {
    static String algorithm() {
        return null;
    }
    static boolean strong(String pw) {
        return false;
    }
}`,
solution:`public class Passwords {
    static String algorithm() {
        return "argon2id";
    }
    static boolean strong(String pw) {
        return pw != null && pw.length() >= 12;
    }
}`,
tests:[{d:'algorithm() returns argon2id',re:'return\\s+"argon2id"'},{d:'strong() requires length >= 12',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:length\\s*\\(\\s*\\)\\s*>=\\s*12))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:length\\s*\\(\\s*\\)\\s*>=\\s*12)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:length\\s*\\(\\s*\\)\\s*>=\\s*12)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:length\\s*\\(\\s*\\)\\s*>=\\s*12)[^{]*?return\\s+\\k<av>\\b)'},{d:'guards against null',re:'pw\\s*!=\\s*null'},{d:'does not pick MD5 or SHA-256',re:'"(md5|sha-?256)"',not:true,flags:'i'}],
behavior:`algorithm() returns "argon2id". strong("short") is false; strong("correcthorsebattery") is true (18 chars). A null password is rejected rather than throwing. No fast general-purpose hash is chosen for passwords.`,
hints:['A slow, memory-hard hash like argon2id is the modern default; MD5 and SHA-256 are too fast for passwords.','Length is the strongest single rule: check pw.length() >= 12.','Guard the null case first so length() never throws.']}},

{id:'am2',title:'The three factors & MFA',body:`

<p><b>Multi-factor authentication</b>, <b>MFA</b> for short, asks for proof from two or more <i>independent categories</i>. The categories matter more than the count: two passwords are still one factor.</p>
<ul>
<li><b>Knowledge</b>: something you know: a password, a PIN.</li>
<li><b>Possession</b>: something you have: a phone running an authenticator app, a hardware security key.</li>
<li><b>Inherence</b>: something you are: a fingerprint, a face scan.</li>
</ul>
<p>Stealing one factor (a leaked password) shouldn't be enough. Not all second factors are equal. SMS codes can be phished, or lost to a <b>SIM swap</b>: an attacker persuades your phone carrier to move your number to their SIM card, and from then on they receive your text-message codes. App-based one-time codes are better. Phishing-resistant passkeys (next lessons) are best.</p>

<h4>Why "independent" matters</h4>
<p>A second factor exists so that <b>one attack shouldn't get both</b>. A password and a security question are both knowledge, so a single phishing page harvests them together. A password and an SMS code sound independent, until you notice both arrive on the same phone, and one compromised device yields both.</p>
<p>So the question to ask of any MFA design is <b>"what single event defeats this?"</b>:</p>
<div class="codeSample" data-hl>password + security question   -> one phishing page          NOT MFA
password + SMS to phone        -> SIM swap, or phone theft   weak
password + TOTP app on phone   -> phishing relay in real time  medium
password + security key        -> nothing short of physical theft + PIN
passkey alone                  -> device possession + biometric/PIN  = already two</div>

<h4>The property that matters now</h4>
<p>Factor categories are a useful taxonomy, but the line that predicts real-world outcomes is <b>phishing resistance</b>. Can an attacker with a convincing fake site in front of the user relay the credential to the real site in real time?</p>
<p>For everything a human reads and retypes (a password, a 6-digit code, a push approval), yes, and modern phishing kits automate it. For anything cryptographically bound to the origin, no: the browser won't produce a signature for the wrong domain, however convincing the page.</p>
<p>So <b>knowledge and most possession factors can be relayed. Only origin-bound possession can't.</b> That's why a passkey alone is generally stronger than password plus <b>TOTP</b>. TOTP is a time-based one-time password: the six-digit code from an authenticator app. Both the app and the server compute it from a shared secret and the current time, so it changes every thirty seconds. The passkey wins despite looking like fewer factors. The device is possession. The biometric or PIN that unlocks it is inherence or knowledge. Neither travels.</p>

<h4>Where MFA programs fail</h4>
<p><b>The downgrade path.</b> Deploying security keys means nothing if SMS stays enabled as a fallback: the attacker chooses SMS. Your MFA is as strong as its <i>weakest enabled</i> method.</p>
<p><b>Recovery.</b> Account recovery bypasses authentication by design. If losing a key drops the user to an emailed link, email is your real second factor and everything above it is decoration. Enrolling <b>two</b> authenticators up front makes strong recovery possible.</p>
<p><b>Enrollment.</b> An attacker who reaches an account before the legitimate user enrolls simply enrolls their own device. First-factor-only enrollment is a standing takeover path.</p>`,
docs:[['MFA, NIST 800-63B','https://pages.nist.gov/800-63-3/sp800-63b.html'],['MFA overview, OWASP','https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html']],
},

{id:'am3',title:'One-time codes: TOTP & HOTP',body:`

<p>Authenticator apps show a 6-digit code that changes every 30 seconds. That is <b>TOTP</b> (Time-based One-Time Password). It builds on <b>HOTP</b> (HMAC-based One-Time Password), a counter-based code. Both hash a shared secret with a moving number using <b>HMAC</b>, then truncate to digits. HMAC is a way of hashing a message together with a secret key, so only someone who holds the key can produce the right result.</p>
<!--flow:am3-totp-->
<h4>TOTP: enrollment and login: step by step</h4>
<div class="flowDia"><svg viewBox="0 0 620 348" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="TOTP: enrollment and login"><defs><marker id="am3-totp-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="am3-totp-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="am3-totp-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="am3-totp-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="336" class="fdLife"/><line x1="546" y1="54" x2="546" y2="336" class="fdLife"/><rect x="-19" y="8" width="186" height="46" rx="8" class="fdActor"/><text x="74" y="27" class="fdActorT">User + authenticator</text><text x="74" y="42" class="fdActorS">phone app</text><rect x="507" y="8" width="78" height="46" rx="8" class="fdActor"/><text x="546" y="35.5" class="fdActorT">Server</text><line x1="14" y1="98" x2="606" y2="98" class="fdPhase"/><text x="310" y="102" class="fdPhaseT">enrollment, happens once</text><line x1="543" y1="132" x2="79" y2="132" stroke="var(--accent)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#am3-totp-ah-front)"/><text x="295" y="123" class="fdLabel">QR code: the shared secret K</text><circle cx="528" cy="132" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="528" y="135.5" class="fdNumT" style="fill:var(--accent)">1</text><rect x="21.400000000000006" y="149" width="105.19999999999999" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="82" y="164" class="fdSelfT">app stores K</text><circle cx="21.400000000000006" cy="160" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="21.400000000000006" y="163.5" class="fdNumT" style="fill:var(--muted)">2</text><line x1="14" y1="194" x2="606" y2="194" class="fdPhase"/><text x="310" y="198" class="fdPhaseT">every login</text><rect x="14" y="215" width="197.6" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="120.8" y="230" class="fdSelfT">code = TOTP(K, now ÷ 30 s)</text><circle cx="14" cy="226" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="14" y="229.5" class="fdNumT" style="fill:var(--muted)">3</text><line x1="77" y1="264" x2="541" y2="264" stroke="var(--accent)" class="fdArrow" marker-end="url(#am3-totp-ah-front)"/><text x="325" y="255" class="fdLabel">the 6-digit code</text><circle cx="92" cy="264" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="92" y="267.5" class="fdNumT" style="fill:var(--accent)">4</text><rect x="349" y="281" width="257" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="485.5" y="296" class="fdSelfT">same computation ±1 window; compare</text><circle cx="349" cy="292" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="349" y="295.5" class="fdNumT" style="fill:var(--muted)">5</text><text x="310" y="318" class="fdNote">Both sides compute; nothing is “sent to your phone”. And a code can be phished; see passkeys.</text></svg></div>
<ol class="fdSteps">
<li><b>Server → User + authenticator:</b> QR code: the shared secret K <i>(front channel)</i></li>
<li><b>User + authenticator:</b> app stores K</li>
<li><b>User + authenticator:</b> code = TOTP(K, now ÷ 30 s)</li>
<li><b>User + authenticator → Server:</b> the 6-digit code <i>(front channel)</i></li>
<li><b>Server:</b> same computation ±1 window; compare</li>
</ol>
<!--/flow:am3-totp-->
<p>HOTP moves the number by a counter that increments each use. TOTP derives it from the clock: <code>counter = currentUnixSeconds / stepSeconds</code> (step is usually 30). Same clock, same counter, same code.</p>
<div class="codeSample" data-hl>// TOTP in one line of intuition:
long counter = epochSeconds / 30;              // same on client and server
String code  = truncate6(hmacSha1(secret, counter));</div>

<h4>The problem OTPs solve</h4>
<p>A password is a <b>static</b> secret: observe it once and use it forever. A one-time password <b>changes every time</b>, so an observation has almost no value. That defeats replay of a captured code. It doesn't defeat someone relaying the code the moment you type it.</p>

<h4>How the two sides agree without talking</h4>
<p>Nothing is transmitted. At enrollment the server and the authenticator share one secret: the QR code you scan, a URI carrying a base32 secret. From then on both sides independently compute the same value from that secret plus a moving number, and compare results.</p>
<div class="codeSample" data-hl>HOTP (RFC 4226)   moving number = a COUNTER, incremented on each use
TOTP (RFC 6238)   moving number = TIME:  floor(unixSeconds / 30)

code = truncate6( HMAC-SHA1( sharedSecret, movingNumber ) )

// "truncate" is dynamic truncation: take the low 4 bits of the last byte
// as an OFFSET, read 4 bytes from there, mask the sign bit, mod 10^6.
// fiddly, but it is why every authenticator app agrees on the digits.</div>
<p>HMAC makes this safe. It's one-way, so a stream of codes tells an attacker nothing about the secret.</p>

<h4>The trade the two variants make</h4>
<p><b>HOTP drifts.</b> If the token generates a code the user never submits, the counters diverge. Servers compensate with a <i>look-ahead window</i> (try the next N counters). That is why HOTP hardware tokens have a resync procedure, and why the window can't be large without weakening the code.</p>
<p><b>TOTP needs clocks to agree.</b> There's no state to drift, but if the device clock is wrong, every code fails. Servers accept the adjacent step or two, so a stolen code stays valid slightly longer than the 30 seconds the UI implies.</p>

<h4>What implementations get wrong</h4>
<ul>
<li><b>Not consuming the code.</b> A code valid for its whole window can be submitted repeatedly, and twice if a relay is fast enough. Record used (user, counter) pairs and reject repeats.</li>
<li><b>No rate limit.</b> Six digits is a million possibilities. Unlimited attempts against a 90-second window is a feasible attack.</li>
<li><b>Storing the shared secret in plaintext.</b> It's symmetric: a database leak lets the attacker generate valid codes indefinitely, and unlike a password hash, nothing slows them down.</li>
<li><b>Treating the QR code as ephemeral.</b> It's the secret in visual form. A screenshot in a support ticket is a permanent compromise.</li>
</ul>
<p>And the ceiling: TOTP is <b>not phishing-resistant</b>. The user reads six digits and types them wherever they're asked. NIST <b>SP</b> 800-63B, the US standards body's Special Publication on logins, classifies it as <b>AAL2</b>. AAL is the authenticator assurance level, NIST's scale from 1 to 3 for how strong a login is. AAL2 is a good second factor. <b>AAL3</b>, the top level, requires a hardware-backed, phishing-resistant authenticator.</p>`,
docs:[['TOTP (RFC 6238)','https://www.rfc-editor.org/rfc/rfc6238'],['HOTP (RFC 4226)','https://www.rfc-editor.org/rfc/rfc4226']],
ex:{title:'Compute the TOTP counter',lang:'js',
run:{call:'counter',cases:[{name:'the epoch itself is window 0',args:[0,30],expect:0},{name:'59 seconds is still window 1',args:[59,30],expect:1},{name:'60 seconds starts window 2',args:[60,30],expect:2},{name:'a 60-second step halves the counter',args:[600,60],expect:10}]},
prompt:`Write <code>function counter(epochSeconds, stepSeconds)</code> returning the time-step counter: <code>epochSeconds</code> divided by <code>stepSeconds</code>, <b>floored</b>. This is the moving number both sides hash. (JavaScript division produces a float, so floor it.)`,
starter:`function counter(epochSeconds, stepSeconds) {
  return 0;
}`,
solution:`function counter(epochSeconds, stepSeconds) {
  return Math.floor(epochSeconds / stepSeconds);
}`,
tests:[{d:'divides the clock by the step',re:'epochSeconds\\s*/\\s*stepSeconds'},{d:'floors to a whole window',re:'Math\\.floor'}],
behavior:`counter(0,30) is 0, counter(59,30) is 1, counter(60,30) is 2. Flooring to the current window is what lets client and server land on the same code without exchanging anything, and here the floor is executed, so forgetting it actually fails.`,
hints:['Divide the clock by the step size.','JavaScript division yields a float; Math.floor gives you the window.','A step of 30 means the counter increments twice per minute.']}},

{id:'am4',title:'Passkeys: WebAuthn & FIDO2',body:`



<p>Passwords and even one-time codes can be <b>phished</b>: a fake site relays whatever you type. Passkeys close that hole. Built on <b>WebAuthn</b> and <b>FIDO2</b>, a passkey is a public/private key pair created per site. FIDO2 is Fast Identity Online, version 2, the standard behind passkeys, and WebAuthn is its browser half. Your device keeps the private key, in secure hardware or synced through your platform, and only ever signs a challenge. The site stores the matching public key.</p>
<p>That makes passkeys <b>phishing-resistant</b>: the signature is <b>origin-bound</b>, and the secret <b>never leaves the device</b> and is never typed. A security key (a FIDO2 hardware token) works the same way.</p>

<h4>What goes wrong with everything else</h4>
<p>Every method so far shares one flaw: <b>the user hands a secret to whatever asked for it</b>. The user is the transport, and the user can't reliably tell a real site from a convincing copy. Passwords, <b>TOTP</b> codes, push approvals: all are relayed by a proxy between the user and the real site, and modern phishing kits do this automatically. (TOTP is a time-based one-time password, the six-digit code from an authenticator app that changes every thirty seconds.) You can't train your way out of it. The fix has to remove the human's ability to give the credential to the wrong party.</p>

<h4>The two moves that achieve it</h4>
<p><b>Nothing shared is ever secret.</b> Registration creates a key pair, and the site stores only the <i>public</i> key. With no shared secret in the database, a breach yields nothing an attacker can log in with. There's nothing for the user to type, screenshot, or read aloud.</p>
<p><b>The browser, not the user, decides who is asking.</b> This is what kills phishing. The signature covers the origin the browser observed, and the authenticator will only use a credential registered to that origin. A look-alike domain gets no signature, so there's nothing to relay.</p>
<!--flow:am4-origin-->
<h4>What bank-secure-login.com gets</h4>
<div class="flowDia"><svg viewBox="0 0 640 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Why a passkey cannot be phished: the browser checks the origin"><defs><marker id="am4-origin-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="am4-origin-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="am4-origin-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="am4-origin-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="294" class="fdLife"/><line x1="320" y1="54" x2="320" y2="294" class="fdLife"/><line x1="566" y1="54" x2="566" y2="294" class="fdLife"/><rect x="9.1" y="8" width="129.8" height="46" rx="8" class="fdActor"/><text x="74" y="27" class="fdActorT">Phishing site</text><text x="74" y="42" class="fdActorS">look-alike domain</text><rect x="256.6" y="8" width="126.8" height="46" rx="8" class="fdActor"/><text x="320" y="27" class="fdActorT">Browser</text><text x="320" y="42" class="fdActorS">checks the origin</text><rect x="501.1" y="8" width="129.8" height="46" rx="8" class="fdActor"/><text x="566" y="27" class="fdActorT">Authenticator</text><text x="566" y="42" class="fdActorS">holds the passkey</text><line x1="77.0" y1="102" x2="315.0" y2="102" stroke="var(--bad)" class="fdArrow" marker-end="url(#am4-origin-ah-attack)"/><text x="197.0" y="93" class="fdLabel fdLabelBad">asks for the credential for bank.com</text><circle cx="89.0" cy="102" r="9" class="fdNum" style="stroke:var(--bad)"/><text x="89.0" y="105.5" class="fdNumT" style="fill:var(--bad)">1</text><rect x="100.8" y="136.0" width="438.4" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="320.0" y="151.0" class="fdSelfT">refuses: wrong origin. no prompt, no choice, no signature</text><circle cx="100.8" cy="147.0" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="100.8" y="150.5" class="fdNumT" style="fill:var(--muted)">2</text><line x1="77.0" y1="188" x2="315.0" y2="188" stroke="var(--bad)" class="fdArrow" marker-end="url(#am4-origin-ah-attack)"/><text x="197.0" y="179" class="fdLabel fdLabelBad">asks for one for its own domain</text><circle cx="89.0" cy="188" r="9" class="fdNum" style="stroke:var(--bad)"/><text x="89.0" y="191.5" class="fdNumT" style="fill:var(--bad)">3</text><line x1="323.0" y1="222" x2="561.0" y2="222" stroke="var(--accent)" class="fdArrow" marker-end="url(#am4-origin-ah-front)"/><text x="443.0" y="213" class="fdLabel">any credential for this origin?</text><circle cx="335.0" cy="222" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="335.0" y="225.5" class="fdNumT" style="fill:var(--accent)">4</text><line x1="563.0" y1="256" x2="325.0" y2="256" stroke="var(--muted)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#am4-origin-ah-x)"/><text x="443.0" y="247" class="fdLabel">none. nothing to steal</text><circle cx="551.0" cy="256" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="551.0" y="259.5" class="fdNumT" style="fill:var(--muted)">5</text><text x="320" y="306" class="fdNote">unlike a TOTP code, this check is done by software that pixels cannot fool</text></svg></div>
<ol class="fdSteps">
<li><b>Phishing site → Browser:</b> asks for the credential for bank.com <i>(attack)</i></li>
<li><b>Browser:</b> refuses: wrong origin. no prompt, no choice, no signature</li>
<li><b>Phishing site → Browser:</b> asks for one for its own domain <i>(attack)</i></li>
<li><b>Browser → Authenticator:</b> any credential for this origin? <i>(front channel)</i></li>
<li><b>Authenticator → Browser:</b> none. nothing to steal</li>
</ol>

<h4>What "passkey" means</h4>
<p><b>WebAuthn</b> is the browser API. <b>CTAP2</b> is how the browser talks to an external authenticator. <b>FIDO2</b> is the pair together. A <b>passkey</b> is the consumer name for a <i>discoverable</i> WebAuthn credential, one the authenticator can find without being told a username. That's what makes usernameless login possible.</p>
<p>The other axis is where it lives. A <b>synced</b> passkey replicates through a platform keychain, so losing a phone doesn't lose the account. That made passkeys viable for consumers, and it makes the security model depend on the platform account. A <b>device-bound</b> credential on a hardware key never leaves that key. Stronger, but it's on you to enroll a second one.</p>

<h4>The limits</h4>
<p>Passkeys don't protect a session after login: a token stolen from the browser is still a token. They don't fix account recovery, still the weakest path in most deployments. And they shift trust onto the platform account that syncs them. What they eliminate is credential phishing, the entry point for most real-world account compromise. The next lessons take the registration and assertion ceremonies apart field by field.</p>`,
docs:[['WebAuthn, W3C','https://www.w3.org/TR/webauthn-2/'],['Passkeys, FIDO Alliance','https://fidoalliance.org/passkeys/']],
ex:{title:'Which methods resist phishing?',lang:'js',
run:{call:'phishingResistant',cases:[{args:['passkey'],expect:true},{args:['security-key'],expect:true},{args:['sms'],expect:false},{args:['totp'],expect:false},{args:['password'],expect:false},{name:'push approval is relayable',args:['push'],expect:false}]},
prompt:`Write <code>function phishingResistant(method)</code> that returns <code>true</code> only for origin-bound methods (<code>"passkey"</code> and <code>"security-key"</code>) and <code>false</code> for everything else, including <code>"password"</code>, <code>"sms"</code>, <code>"totp"</code> and <code>"push"</code>.`,
starter:`function phishingResistant(method) {
  return false;
}`,
solution:`function phishingResistant(method) {
  return method === "passkey" || method === "security-key";
}`,
tests:[{d:'passkey is phishing-resistant',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:"passkey"))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:"passkey")[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:"passkey")[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:"passkey")[^{]*?return\\s+\\k<av>\\b)'},{d:'security-key is phishing-resistant',re:'"security-key"'},{d:'combines the two with OR',re:'\\|\\|'},{d:'does not mark sms as resistant',re:'"sms"',not:true}],
behavior:`Every relayable method is executed as its own case. The winning trait is that the secret is origin-bound and never typed: anything a human reads and retypes can be relayed in real time by a proxy.`,
hints:['Two allowed values joined by || is enough.','Use === for string comparison in JavaScript.','Everything not explicitly allowed should return false.']}},

{id:'am4c',title:'FIDO2 architecture: WebAuthn, CTAP and who does what',body:`



<p>"FIDO2", "WebAuthn" and "passkey" get used as synonyms. They're three different things. <b>FIDO2</b> is Fast Identity Online, version 2: the standard behind passkeys, and an umbrella over <b>two</b> specifications. Knowing which one owns which problem makes the area easier to reason about.</p>

<h4>The two halves</h4>
<div class="flowDia"><svg viewBox="0 0 640 318" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="FIDO2 is two specifications: WebAuthn between your server and the browser, CTAP2 between the browser and the authenticator"><defs><marker id="am4c-ah" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker></defs>
<rect x="30" y="8" width="220" height="46" rx="8" class="fdActor"/><text x="140" y="27" class="fdActorT">Relying Party</text><text x="140" y="42" class="fdActorS">your server</text>
<text x="445" y="35" class="fdNote">stores public keys, verifies signatures</text>
<line x1="90" y1="60" x2="90" y2="116" stroke="var(--accent)" class="fdArrow" marker-start="url(#am4c-ah)" marker-end="url(#am4c-ah)"/>
<text x="185" y="92" class="fdLabel">WebAuthn</text>
<text x="445" y="80" class="fdNote">a JavaScript API in the browser (a W3C standard)</text>
<text x="445" y="98" class="fdNote">navigator.credentials.create() / .get()</text>
<rect x="30" y="122" width="220" height="46" rx="8" class="fdActor"/><text x="140" y="141" class="fdActorT">Browser</text><text x="140" y="156" class="fdActorS">the client</text>
<text x="445" y="149" class="fdNote">enforces the origin rules</text>
<line x1="90" y1="174" x2="90" y2="230" stroke="var(--accent)" class="fdArrow" marker-start="url(#am4c-ah)" marker-end="url(#am4c-ah)"/>
<text x="185" y="206" class="fdLabel">CTAP2</text>
<text x="445" y="192" class="fdNote">Client To Authenticator Protocol</text>
<text x="445" y="210" class="fdNote">a FIDO Alliance standard</text>
<text x="445" y="228" class="fdNote">speaks USB, NFC or Bluetooth</text>
<rect x="30" y="236" width="220" height="46" rx="8" class="fdActor"/><text x="140" y="255" class="fdActorT">Authenticator</text><text x="140" y="270" class="fdActorS">holds the private key</text>
<text x="320" y="306" class="fdNote">FIDO2 = WebAuthn + CTAP2</text>
</svg></div>
<p>Top to bottom: your server, the relying party, reaches the browser through WebAuthn; the browser reaches the authenticator through CTAP2. FIDO2 is the two together.</p>
<p><b>WebAuthn</b> is the part your code touches: a W3C browser API that your JavaScript calls and your server verifies. <b>CTAP2</b> is the part you never see. CTAP is the Client to Authenticator Protocol: how the browser talks to an external authenticator over USB, NFC or Bluetooth, and version 2 is the one FIDO2 uses. A built-in authenticator (Touch ID, Windows Hello) is handled by the platform internally, with no CTAP involved.</p>
<p>A hardware security key is a separate device, so it needs CTAP2. A platform passkey doesn't. Both present the same WebAuthn surface to your server, so <b>your server code doesn't care which was used</b>, and generally shouldn't.</p>

<h4>Where it came from</h4>
<p>Three generations, and the older names still appear in production:</p>
<ul>
<li><b>FIDO UAF</b> (2014): passwordless, mobile-focused, largely superseded.</li>
<li><b>FIDO U2F / CTAP1</b> (2014): the original second-factor security key. U2F is Universal 2nd Factor: FIDO's first security-key standard, a key you plug in and tap after typing your password. Still works: modern browsers can talk CTAP1 to old keys, and WebAuthn accepts U2F-era credentials through the <code>appid</code> extension. U2F was second-factor <i>only</i> and couldn't replace the password.</li>
<li><b>FIDO2</b> (2018): WebAuthn plus CTAP2, adding the two capabilities that made passwords removable. <b>Discoverable credentials</b>: the authenticator remembers which account it's for. <b>User verification</b>: a PIN or biometric on the authenticator, making it two factors on its own.</li>
</ul>
<p>That last point makes a passkey a complete login rather than a second factor. Something you <i>have</i>, the authenticator, plus something you <i>know or are</i>, the PIN or biometric that unlocks it. Both verified locally, never transmitted.</p>

<h4>Authenticator types: the two axes</h4>
<p>Every authenticator is described by two independent properties, and the vocabulary appears in the API:</p>
<div class="codeSample" data-hl>ATTACHMENT, where it lives
  platform     built into the device      Touch ID, Windows Hello, Android
  cross-platform ("roaming")  portable    YubiKey, phone used for another device

CREDENTIAL STORAGE, what it remembers
  discoverable (resident)   the key lives on the authenticator, which knows
                            which accounts it holds -> usernameless login
  non-discoverable          the key is wrapped into the credential id itself;
                            the server must say which credentials to try</div>
<p>Non-discoverable credentials are a trick: the authenticator encrypts the private key into the credential id it hands back, stores nothing, and can hold unlimited credentials. The cost is that the server must supply the credential id at login, so the user has to identify themselves first. Discoverable credentials consume scarce slots on the device but allow a login page with no username field.</p>

<h4>Roles</h4>
<ul>
<li><b>Relying party (RP)</b>: your application. Generates challenges, stores public keys and credential ids, verifies signatures. Identified by an <b>RP ID</b>, which is a domain.</li>
<li><b>Client</b>: the browser or platform. Enforces the origin rules, collects consent, and is the reason phishing fails: it won't let a site request a signature for a domain it doesn't control.</li>
<li><b>Authenticator</b>: generates and holds key pairs, performs user verification, signs challenges. Never releases a private key.</li>
</ul>
<p>Everything else rests on one property: <b>the client, not your code, binds the signature to the origin.</b> You can't forget to implement it, and a phishing site can't opt out of it.</p>

<h4>The RP ID rule</h4>
<p>The <b>RP ID</b> scopes a credential to a domain. It must be the origin's domain or a <i>registrable suffix</i> of it. A page on <code>login.example.com</code> may use an RP ID of <code>login.example.com</code> or <code>example.com</code>, but never <code>com</code>, and never a different domain.</p>
<div class="codeSample" data-hl>page at https://login.example.com

  rpId "login.example.com"   OK   credential works only on that host
  rpId "example.com"         OK   works across all subdomains
  rpId "com"                 REJECTED, public suffix
  rpId "evil.com"            REJECTED, not a suffix of this origin

// choose deliberately: rpId is baked into the credential and CANNOT be
// changed later without re-registering every user.</div>
<p>That last line is the trap. Register everyone under <code>login.example.com</code>, later want <code>example.com</code>, and every credential is useless. Pick the broadest domain you might ever need, at the start.</p>`,
docs:[['W3C (Web Authentication Level 2)','https://www.w3.org/TR/webauthn-2/'],['FIDO Alliance (Client to Authenticator Protocol (CTAP))','https://fidoalliance.org/specs/fido-v2.1-ps-20210615/fido-client-to-authenticator-protocol-v2.1-ps-20210615.html'],['FIDO Alliance (specifications overview)','https://fidoalliance.org/specifications/'],['W3C (Relying Party Identifier rules)','https://www.w3.org/TR/webauthn-2/#rp-id']],
ex:{title:'Validate an RP ID against the page origin',
prompt:`The client rejects an RP ID that is not the origin's domain or a registrable suffix of it. Write <code>RpId</code> with <code>static boolean valid(String originHost, String rpId)</code> returning true when <code>rpId</code> equals <code>originHost</code>, or when <code>originHost</code> ends with <code>"." + rpId</code>. Return false if either is null, and also false when <code>rpId</code> contains no dot (a bare public suffix such as <code>"com"</code> must never be accepted). Then <code>static boolean changeable()</code> returning <code>false</code>: the RP ID is baked into every credential and cannot be changed after registration.`,
starter:`public class RpId {
    static boolean valid(String originHost, String rpId) {
        return false;
    }
    static boolean changeable() {
        return true;
    }
}`,
tests:[{d:'null inputs are rejected',re:'(?:if\\s*\\(\\s*[^;{]*(?:originHost\\s*==\\s*null|rpId\\s*==\\s*null)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:return\\s+(?!\\s*!)[^;{]*(?:originHost\\s*==\\s*null|rpId\\s*==\\s*null))|(?:(?<h1>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:originHost\\s*==\\s*null|rpId\\s*==\\s*null)[^{]*?return\\s+\\k<h1>\\b)'},{d:'an exact host match is allowed',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:equals\\s*\\())|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:equals\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:equals\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:equals\\s*\\()[^{]*?return\\s+\\k<av>\\b)'},{d:'a parent domain is allowed as a suffix',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:endsWith\\s*\\())|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:endsWith\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:endsWith\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<p1>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:endsWith\\s*\\()[^{]*?return\\s+\\k<p1>\\b)'},{d:'the suffix check includes the dot separator',re:'"\\."\\s*\\+\\s*rpId'},{d:'a bare public suffix is refused',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:contains\\s*\\(\\s*"\\."\\s*\\)|indexOf\\s*\\(\\s*"\\."))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:contains\\s*\\(\\s*"\\."\\s*\\)|indexOf\\s*\\(\\s*"\\.")[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:contains\\s*\\(\\s*"\\."\\s*\\)|indexOf\\s*\\(\\s*"\\.")[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:contains\\s*\\(\\s*"\\."\\s*\\)|indexOf\\s*\\(\\s*"\\.")[^{]*?return\\s+\\k<av>\\b)'},{d:'the RP ID cannot be changed later',re:'return\\s+false'},{d:'a guard returns its constant, not the negation of it',re:'return\\s+!\\s*\\(?\\s*(?:true|false)\\s*\\)?\\s*;',not:true}],
behavior:`valid("login.example.com","login.example.com") is true. valid("login.example.com","example.com") is true, because a credential can be scoped to the parent domain and used across subdomains. valid("login.example.com","com") is false: accepting a public suffix would let any site on that TLD use the credential. valid("login.example.com","evil.com") is false, and this single check is what makes phishing structurally impossible rather than merely discouraged. valid(null,"example.com") is false. changeable() is false: choose the broadest domain you might need before registering anyone, because changing it invalidates every credential.`,
hints:['Guard nulls, then reject an rpId with no dot in it.','Two acceptable cases: <code>originHost.equals(rpId)</code> or <code>originHost.endsWith("." + rpId)</code>.','The dot matters: without it, "notexample.com" would appear to be a suffix of "example.com".'],
solution:`public class RpId {
    static boolean valid(String originHost, String rpId) {
        if (originHost == null || rpId == null) return false;
        // a bare public suffix ("com") would scope the credential far too widely
        if (!rpId.contains(".")) return false;
        if (originHost.equals(rpId)) return true;
        // the leading dot matters: "notexample.com" must not match "example.com"
        return originHost.endsWith("." + rpId);
    }
    static boolean changeable() {
        // baked into every credential at registration
        return false;
    }
}`}},

{id:'am4b',title:'Every MFA method compared: pros, cons and when to use each',body:`

<p>"Turn on <b>MFA</b>" isn't one decision. MFA is multi-factor authentication: proving who you are with two different kinds of evidence, usually something you know (a password) plus something you have (a phone or a security key), so a stolen password alone isn't enough. The methods differ by orders of magnitude in the attacks they stop, and choosing badly produces a system that passes a compliance checkbox while remaining phishable. This lesson catalogs every method in common use, what it resists, and how to run it well.</p>

<h4>The axis that matters most</h4>
<p>Almost every MFA method stops <b>credential stuffing</b>: a password reused from some other breach is no longer enough. That is why any MFA beats none. But only some methods stop <b>phishing</b>, and phishing is what takes over accounts today.</p>
<p>If the second factor is <i>something the user can read out and type</i>, the user can be induced to read it out to an attacker. A code has no idea which site asked for it. A method is <b>phishing-resistant</b> only when the authenticator itself checks who is asking: the origin is part of the cryptographic operation.</p>
<div class="codeSample" data-hl>REAL-TIME PHISHING, against any code-based method:

  user -> attacker's proxy site -> the real site
   1. user types password on the fake site; proxy replays it instantly
   2. real site asks for the OTP; proxy shows the same prompt
   3. user types the 6-digit code; proxy replays it within its 30s window
   4. attacker holds a valid session

Nothing about the code is broken. It was simply given to the wrong site.
A passkey cannot be relayed this way: the signature is bound to the origin.</div>

<h4>The catalog</h4>

<p><b>1. SMS one-time code.</b> A code texted to a phone number.<br>
<i>Pros:</i> works on every phone, no app, no enrollment friction. For a consumer product it often has the highest adoption of any method, and adoption is a security property.<br>
<i>Cons:</i> <b>SIM swap</b>: an attacker persuades the phone carrier to move your number to their SIM card, then receives your codes. SS7 interception. Codes visible on lock screens. Delivery failures abroad. Carrier costs. Fully phishable.<br>
<i>Best practice:</i> a floor, not a target. Never let it reset or bypass a stronger factor. Rate-limit sends, expire in minutes, bind the code to one session, and include the site name in the message so the user might notice a mismatch. NIST has discouraged it for higher assurance levels for years.</p>

<p><b>2. Voice call OTP.</b> The code read aloud. An <b>OTP</b> is a one-time password: any code that's good for a single use.<br>
<i>Pros:</i> accessibility. Works for users who can't read a screen or use apps, and reaches landlines.<br>
<i>Cons:</i> everything wrong with SMS, plus voicemail interception.<br>
<i>Best practice:</i> an accessibility fallback, not a default.</p>

<p><b>3. Email one-time code or magic link.</b><br>
<i>Pros:</i> zero enrollment, no extra device, good for low-risk consumer accounts.<br>
<i>Cons:</i> usually <b>not a second factor at all</b>. If the email account is also the password reset channel, an attacker with the mailbox has both. Mail scanners consume single-use links.<br>
<i>Best practice:</i> acceptable as a <i>primary</i> passwordless factor for low-risk accounts. Don't count it as a second factor alongside a password recoverable through the same inbox.</p>

<p><b>4. TOTP authenticator app.</b> <b>TOTP</b> is a time-based one-time password. A shared secret plus the clock produces a 6-digit code: both the app and the server compute it, so it changes every thirty seconds.<br>
<i>Pros:</i> no carrier, no network, no cost, an open standard, works offline, immune to SIM swap. The best ratio of security to friction among code-based methods.<br>
<i>Cons:</i> phishable in real time. The shared secret exists in two places, so a server-side breach exposes seeds. Device loss locks the user out. Cloud-synced authenticator apps trade some security for recoverability.<br>
<i>Best practice:</i> encrypt seeds at rest, show the QR once, enforce one-time use of each code, allow a small clock skew and no more. Enroll a second method at the same time.</p>

<p><b>5. HOTP / hardware OTP tokens.</b> Counter-based codes, or a keyfob display. <b>HOTP</b> is the HMAC-based one-time password: the same construction as TOTP, but the moving number is a counter that ticks up on each use instead of the clock.<br>
<i>Pros:</i> no clock sync. A dedicated device with nothing else on it. Works where phones are banned.<br>
<i>Cons:</i> counter drift needs a resynchronization window, itself an attack surface. Procurement and distribution costs. Still phishable.<br>
<i>Best practice:</i> keep the look-ahead window small. Use where phones are prohibited.</p>

<p><b>6. Push approval.</b> A notification saying "approve this login?"<br>
<i>Pros:</i> one tap, nothing to type, and the prompt can carry context (location, app, IP) that a code can't.<br>
<i>Cons:</i> <b>MFA fatigue</b>. An attacker with the password sends approval requests repeatedly, at 3am, until someone taps to make it stop. This has caused several major breaches. Still phishable via a proxy that triggers the real push.<br>
<i>Best practice:</i> <b>number matching</b>: the login screen shows two digits the user must type into the app, which defeats blind approval. Show origin and location, rate-limit prompts hard, lock the account after repeated denials, and alert on the pattern.</p>

<p><b>7. FIDO2 / WebAuthn security key.</b> A hardware key holding a private key per site. <b>FIDO2</b> is Fast Identity Online, version 2, the standard behind passkeys, and WebAuthn is its browser half. The device holds a private key, the site holds the public key, and a login is a signature over a challenge from that exact site.<br>
<i>Pros:</i> <b>phishing-resistant</b>. The signature covers the origin, so a lookalike domain gets nothing. The private key never leaves the hardware. No shared secret, so a server breach yields only public keys. Meets the highest assurance level.<br>
<i>Cons:</i> cost and the logistics of buying and shipping them. Loss requires a real recovery path. Enrollment on every device.<br>
<i>Best practice:</i> the right answer for administrators and any privileged account. Enroll <b>two</b> keys, one carried and one in a safe, so loss isn't a lockout. Don't undermine it with an SMS fallback.</p>

<p><b>8. Passkeys (platform / synced).</b> The same WebAuthn cryptography, with the key held by the device or synced through a platform account.<br>
<i>Pros:</i> phishing-resistant with far better ergonomics than a hardware key: a fingerprint or face scan and nothing to carry. Syncing solves the loss problem that keeps hardware keys niche.<br>
<i>Cons:</i> security now depends on the platform account holding the sync keychain. Cross-ecosystem use is still awkward. A shared device muddies who authenticated.<br>
<i>Best practice:</i> the default for consumer products today. For workforce use, choose deliberately. <i>Device-bound</i> passkeys are stronger but harder to recover. <i>Synced</i> ones are recoverable but only as strong as the platform account.</p>

<p><b>9. Smart card / PIV / CAC.</b> A certificate on a card, unlocked by PIN. <b>PIV</b> and <b>CAC</b> are Personal Identity Verification and Common Access Card: the US federal and defense smart cards, used for both building and system login.<br>
<i>Pros:</i> phishing-resistant, hardware-backed, ties into an existing <b>PKI</b>, and doubles as a physical badge. PKI is public key infrastructure: the certificate authorities, certificates and rules that let a public key be trusted as belonging to a particular name. Long established in government and defense.<br>
<i>Cons:</i> needs readers, middleware, and a whole PKI with issuance and revocation behind it. Heavy outside a regulated enterprise.<br>
<i>Best practice:</i> use where the PKI already exists. Check revocation, and don't let the PIN become the only real secret.</p>

<p><b>10. Biometrics.</b> Fingerprint, face.<br>
<i>Pros:</i> nothing to remember or carry.<br>
<i>Cons:</i> <b>a biometric is a local gesture that unlocks a key on the device</b>, never a factor you send anywhere. A biometric transmitted to a server is a password you can never change. Also false rejects, and it can't be revoked.<br>
<i>Best practice:</i> keep it local, as the unlock for a passkey or a device key. Never send a template to a server. Always offer a non-biometric path for the users it fails.</p>

<p><b>11. Backup / recovery codes.</b> A printed list of single-use codes.<br>
<i>Pros:</i> the safety net that makes strong methods adoptable. Users will accept a hardware key if losing it is survivable.<br>
<i>Cons:</i> long-lived, phishable, and usually stored in the email account or a screenshot, which puts them where an attacker already is.<br>
<i>Best practice:</i> generate ten, hash them at rest, mark each used, force regeneration when they run low, and tell the user plainly where <i>not</i> to keep them.</p>

<h4>The ranking</h4>
<div class="codeSample" data-hl>PHISHING-RESISTANT   passkey · security key · smart card
                       origin is part of the signature, a proxy gets nothing

RESISTS BULK ATTACKS  push with number matching
                       stops fatigue; still relayable by a live proxy
                      TOTP · HOTP · hardware OTP
                       no SIM swap; relayable within the code's window

WEAKEST               SMS · voice · email code
                       phishable AND interceptable, but still far better than nothing</div>

<h4>Four practices that matter more than the choice</h4>
<ol>
<li><b>Don't allow downgrade.</b> A user with a passkey must not be able to sign in with SMS "because they lost their phone." An attacker will always claim that. The weakest enrolled method is the account's real strength, so the fallback must be at least as strong, or must go through a slower, human-verified recovery path.</li>
<li><b>Recovery is the attack surface.</b> Account takeovers overwhelmingly go through reset flows, not the front door. A hardware key on an account whose recovery is an emailed link is protected by email.</li>
<li><b>Secure the enrollment.</b> Adding a factor must be at least as protected as using one. If an attacker with a stolen session can silently enroll their own authenticator, the MFA is decorative. Require a fresh authentication for enrollment, and notify the user on every change.</li>
<li><b>Enroll two, always.</b> Single-method MFA guarantees eventual lockout, and lockout pressure is what makes organizations build the weak bypass that gets exploited.</li>
</ol>
<p><b>The short version.</b> Consumer product: passkeys as the goal, TOTP as the common path, SMS only as an on-ramp. Workforce: passkeys or security keys, number-matched push as the transition. Privileged accounts: phishing-resistant only, two keys enrolled, no weaker fallback.</p>`,
docs:[['NIST SP 800-63B (Authenticator types and AAL requirements)','https://pages.nist.gov/800-63-3/sp800-63b.html'],['CISA (Implementing phishing-resistant MFA)','https://www.cisa.gov/sites/default/files/publications/fact-sheet-implementing-phishing-resistant-mfa-508c.pdf'],['CISA: Implementing number matching in MFA applications','https://www.cisa.gov/sites/default/files/publications/fact-sheet-implement-number-matching-in-mfa-applications-508c.pdf'],['W3C (Web Authentication (WebAuthn) Level 2)','https://www.w3.org/TR/webauthn-2/'],['RFC 6238 (TOTP)','https://www.rfc-editor.org/rfc/rfc6238']],
ex:{title:'Rank the methods and block the downgrade',
prompt:`Write <code>MfaPolicy</code> with three methods. <code>static boolean phishingResistant(String method)</code> is true only for <code>"passkey"</code>, <code>"security-key"</code> and <code>"smart-card"</code>: the methods where the origin is part of the signature. <code>static int strength(String method)</code> returns <code>3</code> for a phishing-resistant method, <code>2</code> for <code>"totp"</code>, <code>"hotp"</code> or <code>"push-number-match"</code>, <code>1</code> for <code>"sms"</code>, <code>"voice"</code>, <code>"email-code"</code> or <code>"push-simple"</code>, and <code>0</code> for anything else including <code>null</code>. <code>static boolean allowFallback(String enrolledBest, String fallback)</code> returns true only when the fallback is <b>at least as strong</b> as the best method the user already has; an attacker will always claim they lost the strong one.`,
starter:`public class MfaPolicy {
    static boolean phishingResistant(String method) {
        return false;
    }
    static int strength(String method) {
        return 0;
    }
    static boolean allowFallback(String enrolledBest, String fallback) {
        return false;
    }
}`,
tests:[{d:'passkeys are phishing-resistant',re:'(?:case\\s*["\']passkey["\']|equals\\s*\\(\\s*["\']passkey["\']\\s*\\)|["\']passkey["\']\\s*\\.\\s*equals\\s*\\([^)]*\\)|[=!]==?\\s*["\']passkey["\']|includes\\s*\\(\\s*["\']passkey["\']\\s*\\)|contains\\s*\\(\\s*["\']passkey["\']\\s*\\))[^;}]*?return\\s+true\\b|(?:case\\s*["\']passkey["\']|equals\\s*\\(\\s*["\']passkey["\']\\s*\\)|["\']passkey["\']\\s*\\.\\s*equals\\s*\\([^)]*\\)|[=!]==?\\s*["\']passkey["\']|includes\\s*\\(\\s*["\']passkey["\']\\s*\\)|contains\\s*\\(\\s*["\']passkey["\']\\s*\\))[^;}]*?->\\s*(?:\\{\\s*)?(?:return\\s+)?true\\b'},{d:'security keys are phishing-resistant',re:'"security-key"'},{d:'smart cards are phishing-resistant',re:'(?:case\\s*["\']smart-card["\']|equals\\s*\\(\\s*["\']smart-card["\']\\s*\\)|["\']smart-card["\']\\s*\\.\\s*equals\\s*\\([^)]*\\)|[=!]==?\\s*["\']smart-card["\']|includes\\s*\\(\\s*["\']smart-card["\']\\s*\\)|contains\\s*\\(\\s*["\']smart-card["\']\\s*\\))[^;}]*?return\\s+true\\b|(?:case\\s*["\']smart-card["\']|equals\\s*\\(\\s*["\']smart-card["\']\\s*\\)|["\']smart-card["\']\\s*\\.\\s*equals\\s*\\([^)]*\\)|[=!]==?\\s*["\']smart-card["\']|includes\\s*\\(\\s*["\']smart-card["\']\\s*\\)|contains\\s*\\(\\s*["\']smart-card["\']\\s*\\))[^;}]*?->\\s*(?:\\{\\s*)?(?:return\\s+)?true\\b'},{d:'unknown methods score zero',re:'(?:default\\s*(?::|->)\\s*(?:\\{\\s*)?(?:return\\s+)?false\\b)|(?:else\\s*\\{?\\s*return\\s+false\\b)|(?:\\}\\s*return\\s+false\\s*;)'},{d:'code-based methods sit in the middle tier',re:'"totp"'},{d:'number matching is ranked above simple push',re:'"push-number-match"'},{d:'SMS is ranked weakest',re:'"sms"'},{d:'a fallback may not be weaker than what is enrolled',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:strength\\s*\\(\\s*fallback\\s*\\)\\s*>=\\s*strength\\s*\\(\\s*enrolledBest))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:strength\\s*\\(\\s*fallback\\s*\\)\\s*>=\\s*strength\\s*\\(\\s*enrolledBest)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:strength\\s*\\(\\s*fallback\\s*\\)\\s*>=\\s*strength\\s*\\(\\s*enrolledBest)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:strength\\s*\\(\\s*fallback\\s*\\)\\s*>=\\s*strength\\s*\\(\\s*enrolledBest)[^{]*?return\\s+\\k<av>\\b)'},{d:'a guard returns its constant, not the negation of it',re:'return\\s+!\\s*\\(?\\s*(?:true|false)\\s*\\)?\\s*;',not:true}],
behavior:`phishingResistant("passkey") is true; phishingResistant("totp") is false, because a code can be read out to a proxy site while a passkey signature is bound to the origin. strength("security-key") is 3, strength("totp") is 2, strength("push-number-match") is 2 while strength("push-simple") is 1 (blind approval is what MFA fatigue exploits), strength("sms") is 1, and strength(null) is 0. allowFallback("passkey","sms") is false: this is the downgrade attack, where the attacker simply claims to have lost the strong factor. allowFallback("totp","security-key") is true, since moving to a stronger method is always fine.`,
hints:['Use a switch returning true for the three phishing-resistant methods.','In <code>strength</code>, check <code>phishingResistant</code> first and return 3, then switch for the tier-2 and tier-1 names.','<code>return strength(fallback) &gt;= strength(enrolledBest);</code>'],
solution:`public class MfaPolicy {
    static boolean phishingResistant(String method) {
        if (method == null) return false;
        switch (method) {
            case "passkey":
            case "security-key":
            case "smart-card":
                return true;   // the origin is part of the signature
            default:
                return false;
        }
    }
    static int strength(String method) {
        if (method == null) return 0;
        if (phishingResistant(method)) return 3;
        switch (method) {
            case "totp":
            case "hotp":
            case "push-number-match":
                return 2;      // not relayable in bulk, still proxy-relayable
            case "sms":
            case "voice":
            case "email-code":
            case "push-simple":
                return 1;      // phishable and interceptable, but better than nothing
            default:
                return 0;
        }
    }
    static boolean allowFallback(String enrolledBest, String fallback) {
        // the weakest enrolled method is the account's real strength
        return strength(fallback) >= strength(enrolledBest);
    }
}`}},

{id:'am5',title:'Step-up & adaptive authentication',body:`

<p>Not every action deserves the same friction. <b>Step-up authentication</b> lets a user in with one factor for ordinary work. Right before a sensitive action, it demands stronger or fresh proof: moving money, changing an email, deleting an account.</p>
<!--flow:am5-stepup-->
<h4>Step-up authentication: step by step</h4>
<div class="flowDia"><svg viewBox="0 0 680 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Step-up authentication"><defs><marker id="am5-stepup-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="am5-stepup-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="am5-stepup-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="am5-stepup-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="42" x2="74" y2="288" class="fdLife"/><line x1="340" y1="42" x2="340" y2="288" class="fdLife"/><line x1="606" y1="42" x2="606" y2="288" class="fdLife"/><rect x="34.300000000000004" y="8" width="79.39999999999999" height="34" rx="8" class="fdActor"/><text x="74" y="29.5" class="fdActorT">Browser</text><rect x="301" y="8" width="78" height="34" rx="8" class="fdActor"/><text x="340" y="29.5" class="fdActorT">App</text><rect x="567" y="8" width="78" height="34" rx="8" class="fdActor"/><text x="606" y="29.5" class="fdActorT">IdP</text><line x1="77" y1="90" x2="335" y2="90" stroke="var(--accent)" class="fdArrow" marker-end="url(#am5-stepup-ah-front)"/><text x="222" y="81" class="fdLabel">view balance, existing session is enough</text><circle cx="92" cy="90" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="92" y="93.5" class="fdNumT" style="fill:var(--accent)">1</text><line x1="77" y1="120" x2="335" y2="120" stroke="var(--accent)" class="fdArrow" marker-end="url(#am5-stepup-ah-front)"/><text x="222" y="111" class="fdLabel">transfer $5,000, this needs more</text><circle cx="92" cy="120" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="92" y="123.5" class="fdNumT" style="fill:var(--accent)">2</text><line x1="343" y1="150" x2="601" y2="150" stroke="var(--accent)" class="fdArrow" marker-end="url(#am5-stepup-ah-front)"/><text x="488" y="141" class="fdLabel">/authorize, acr_values=mfa, max_age=300</text><circle cx="358" cy="150" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="358" y="153.5" class="fdNumT" style="fill:var(--accent)">3</text><rect x="316.6" y="167" width="349.4" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="499.3" y="182" class="fdSelfT">current session is password-only → prompt MFA now</text><circle cx="316.6" cy="178" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="316.6" y="181.5" class="fdNumT" style="fill:var(--muted)">4</text><line x1="603" y1="216" x2="345" y2="216" stroke="var(--accent)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#am5-stepup-ah-front)"/><text x="458" y="207" class="fdLabel">new token: acr=mfa, fresh auth_time</text><circle cx="588" cy="216" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="588" y="219.5" class="fdNumT" style="fill:var(--accent)">5</text><rect x="158.70000000000002" y="233" width="362.59999999999997" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="348" y="248" class="fdSelfT">VERIFY acr + auth_time before allowing the transfer</text><circle cx="158.70000000000002" cy="244" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="158.70000000000002" y="247.5" class="fdNumT" style="fill:var(--muted)">6</text><text x="340" y="270" class="fdNote">Asking for step-up is not enough; the app must check it actually happened.</text></svg></div>
<ol class="fdSteps">
<li><b>Browser → App:</b> view balance, existing session is enough <i>(front channel)</i></li>
<li><b>Browser → App:</b> transfer $5,000, this needs more <i>(front channel)</i></li>
<li><b>App → IdP:</b> /authorize, acr_values=mfa, max_age=300 <i>(front channel)</i></li>
<li><b>IdP:</b> current session is password-only → prompt MFA now</li>
<li><b>IdP → App:</b> new token: acr=mfa, fresh auth_time <i>(front channel)</i></li>
<li><b>App:</b> VERIFY acr + auth_time before allowing the transfer</li>
</ol>
<!--/flow:am5-stepup-->
<p><b>Adaptive (risk-based)</b> auth decides <i>when</i> to step up by scoring signals: a new device, a new country, an impossible-travel jump, an unusual hour. Low risk stays frictionless. High risk triggers re-authentication or <b>MFA</b>, multi-factor authentication: proving who you are with two different kinds of evidence, usually something you know (a password) plus something you have (a phone or a security key). Match the assurance to the value and risk of the action, and treat a recent successful auth as a short-lived pass that expires.</p>

<h4>The problem with authenticating once</h4>
<p>Classic login treats authentication as a gate: pass it, and you have a session that grants everything for hours. But the assurance that gate produced <b>decays</b>. The person who authenticated at 9am may not be the person holding the laptop at 3pm, and nothing in the session records the difference.</p>
<p>Meanwhile the actions inside that session are wildly unequal. Reading a dashboard and wiring £50,000 carry the same credential. Step-up breaks that equivalence: <b>assurance should be proportional to what is being done, and it should be recent.</b></p>

<h4>Step-up versus adaptive</h4>
<div class="codeSample" data-hl>STEP-UP     "this ACTION needs more than the session currently proves"
              -> driven by the sensitivity of the operation
              -> deterministic: changing the recovery email ALWAYS re-auths

ADAPTIVE    "this CONTEXT looks unlike the user's normal behavior"
              -> driven by risk signals, probabilistic
              -> a familiar device at home may never see a prompt

// they compose: adaptive decides WHETHER, step-up decides WHAT IS REQUIRED.
// most failures come from implementing one and calling it the other.</div>

<h4>The freshness check</h4>
<p>Record when the user last authenticated and how strongly. Before a sensitive action, compare that against what the action demands. <b>OIDC</b> standardizes this. OIDC is OpenID Connect, the standard login layer built on OAuth: it gives the app a signed statement of who logged in, and how, called an ID token. <code>max_age</code> asks the provider to re-authenticate if the session is older than N seconds. <code>acr_values</code> asks for a specific assurance level. The returned <code>auth_time</code> and <code>acr</code> claims tell you what you got. A claim is one fact inside a token: here, when the person authenticated and how strongly.</p>
<p><b>Verify what came back.</b> Asking for a stronger <code>acr</code> means nothing if you don't check the response contains it. A provider that can't satisfy the request may return the session it already had. <b>Bind the result to the action.</b> A fresh authentication should authorize the specific operation that triggered it, not open a window in which any sensitive action passes.</p>

<h4>Risk signals and their limits</h4>
<p>The useful signals are unremarkable: new device, new network, impossible travel, an unusual time, velocity, a known-bad IP reputation, behavioral drift. Each is weak alone. Together they're decent at ranking sessions.</p>
<p>They aren't <b>evidence</b>. Every signal has a benign explanation: people travel, use VPNs, get new phones, and work odd hours. Tuned too tightly, adaptive auth prompts too often, users learn to approve reflexively, and you have manufactured the habit that MFA fatigue attacks exploit. Tuned too loosely it never fires.</p>
<p>So the load should sit on step-up rather than adaptive. <b>The sensitivity of an action is a fact you know for certain. Risk is a guess.</b> Use the certainty for the hard rules and the guess for the extras.</p>`,
docs:[['Step-up authentication, Auth0','https://auth0.com/docs/secure/multi-factor-authentication/step-up-authentication'],['Risk-based auth, NIST 800-63B','https://pages.nist.gov/800-63-3/sp800-63b.html']],
ex:{title:'Decide when to step up',lang:'js',
run:{call:'required',cases:[{name:'sensitive action, stale auth',args:['transfer',false],expect:true},{name:'sensitive action, fresh auth',args:['transfer',true],expect:false},{name:'other sensitive action',args:['change-email',false],expect:true},{name:'ordinary action',args:['view',false],expect:false}]},
prompt:`Write <code>function required(action, recentlyAuthed)</code> returning <code>true</code> when the action is sensitive (<code>"transfer"</code> or <code>"change-email"</code>) <b>and</b> the user has not recently authenticated.`,
starter:`function required(action, recentlyAuthed) {
  return false;
}`,
solution:`function required(action, recentlyAuthed) {
  const sensitive = action === "transfer" || action === "change-email";
  return sensitive && !recentlyAuthed;
}`,
tests:[{d:'transfer counts as sensitive',re:'"transfer"'},{d:'change-email counts as sensitive',re:'"change-email"'},{d:'requires NOT recently authenticated',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:!\\s*recentlyAuthed))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:!\\s*recentlyAuthed)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:!\\s*recentlyAuthed)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:!\\s*recentlyAuthed)[^{]*?return\\s+\\k<av>\\b)'},{d:'combines sensitivity AND freshness',re:'&&'}],
behavior:`required("transfer",false) is true; required("transfer",true) is false because a fresh authentication already happened; required("view",false) is false. The sensitivity of an action is a fact you know for certain, which is why it, not a risk score, carries the hard rules.`,
hints:['Compute a sensitive flag first from the two high-risk actions joined by ||.','Step-up is needed only when sensitive is true AND recentlyAuthed is false.','Use the ! operator to express not recently authenticated.']}},
{id:'am6',title:'Identity assurance levels: IAL, AAL, FAL',body:`




<p>How much should you trust that a user is who they claim? NIST 800-63 answers with <b>three independent scales</b>, so you can dial each to the risk of the action instead of treating "identity" as one thing.</p>
<ul>
<li><b>IAL: Identity Assurance Level</b> (proofing): how strongly the <i>real-world identity</i> was verified at enrollment. IAL1 = self-asserted (no proofing); IAL2 = remote or in-person evidence checked; IAL3 = in-person, supervised.</li>
<li><b>AAL: Authenticator Assurance Level</b> (login): how strong the <i>authentication</i> is. AAL1 = single factor; AAL2 = MFA; AAL3 = hardware-based, phishing-resistant (a security key or passkey with verifier binding).</li>
<li><b>FAL: Federation Assurance Level</b> (assertion): how strongly the <i>federated assertion</i> is protected. FAL1 = signed; FAL2 = signed and encrypted; FAL3 = holder-of-key (the assertion is bound to a key the presenter must prove).</li>
</ul>
<p>Two words in that list deserve plain English. <b>MFA</b> is multi-factor authentication: proving who you are with two different kinds of evidence, usually something you know (a password) plus something you have (a phone or a security key). A stolen password alone is then not enough. A <b>federated</b> login is one where an application trusts another organization's login system instead of checking the password itself, and the <b>assertion</b> is the signed statement that system sends back saying who the user is.</p>

<h4>Why three scales instead of one</h4>
<p>"How much do we trust this login?" is three questions that people collapse into one. Collapsing them produces bad decisions in both directions.</p>
<div class="codeSample" data-hl>IAL  "is this the right HUMAN?"       - settled ONCE, at enrollment
AAL  "is this that human, NOW?"       - settled at EVERY login
FAL  "can I trust this MESSAGE about  - settled per federated assertion
      them from another system?"

// a concrete case that shows why they must be separate:
//   a bank verified your passport in a branch          -> IAL2/3
//   and lets you log in with a password alone          -> AAL1
// strongly proofed, weakly authenticated. that gap IS the risk, and a
// single combined score would hide it entirely.</div>

<h4>What each level requires</h4>
<p><b>IAL</b> is about evidence at enrollment. <b>IAL1</b> is self-asserted: anyone can type a name. Right for a newsletter, wrong for a bank. <b>IAL2</b> means remote or in-person evidence was checked against authoritative sources. <b>IAL3</b> adds a supervised, in-person process. Cost rises steeply, and so does the personal data you hold, a liability as well as an asset.</p>
<p><b>AAL</b> is about the authenticator. <b>AAL1</b> is a single factor. <b>AAL2</b> is two independent factors: password plus TOTP lands here. <b>TOTP</b> is a time-based one-time password, the six-digit code from an authenticator app. Both the app and the server compute it from a shared secret and the current time, so it changes every thirty seconds. <b>AAL3</b> requires a hardware-based, <b>phishing-resistant</b> authenticator with verifier impersonation resistance. In practice that means a security key or a device-bound passkey. TOTP and push approvals can be relayed, so they stop at AAL2.</p>
<p><b>FAL</b> is about the assertion crossing a boundary. <b>FAL1</b> signed, <b>FAL2</b> signed and encrypted, <b>FAL3</b> holder-of-key: the presenter must prove possession of a key the assertion is bound to. FAL3 is the same idea as <b>DPoP</b> (demonstrating proof of possession: the app signs each request with a private key it holds, so a stolen token is useless without the key) and <b>mTLS</b>-bound tokens (mutual TLS: the client presents a certificate too, and the token only works over a connection using that certificate). The assertion stops being a <b>bearer</b> credential, one that works for whoever holds it, like cash.</p>

<h4>Using them without paperwork</h4>
<p>Reading published documentation needs almost nothing. Changing a payment destination needs high AAL right now: a <b>step-up</b>, asking for a stronger login (MFA or a passkey) at the moment the action warrants it, not a session from this morning. Opening a regulated financial account needs high IAL at enrollment and says nothing about how they log in afterwards.</p>
<p>These levels travel inside the login result. In <b>OIDC</b> (OpenID Connect, the modern web login standard: a thin layer on top of OAuth that adds a signed statement of who logged in, called an ID token) they arrive as <code>acr</code> and <code>amr</code>. In <b>SAML</b> (Security Assertion Markup Language, the older XML-based standard for single sign-on between companies, where the login system sends the application a signed XML assertion) they arrive as <code>AuthnContextClassRef</code>. The rule from the step-up lesson applies: <b>asking for a level means nothing unless you check what came back</b>. A provider that can't satisfy your request may return the session it already had.</p>

<h4>The mismatch to watch for</h4>
<p>High IAL with low AAL creates risk because the account <i>feels</i> trustworthy, a verified human is behind it, while the door is weak. It's also the most common state in regulated industries, where enrollment got all the attention and login was left as a password. If you audit one thing from this lesson, audit that gap.</p>`,
docs:[['NIST SP 800-63-3 (Digital Identity)','https://pages.nist.gov/800-63-3/'],['800-63B (Authenticator AALs)','https://pages.nist.gov/800-63-3/sp800-63b.html']],
},
{id:'am7',title:'Passwordless login & account recovery',body:`




<p><b>Passwordless</b> removes the password entirely. The common methods: <b>magic links</b> (a one-time link emailed to you), <b>one-time codes</b> (emailed or texted), and <b>passkeys</b> (the strongest, phishing-resistant). A one-time code is an <b>OTP</b>, a one-time password: a short code that works once and then never again. Texted codes are the weakest kind because of <b>SIM swap</b>: an attacker persuades your phone carrier to move your number to their SIM card, and from then on they receive your text-message codes. A passkey is built on <b>WebAuthn</b>, the browser standard where your device holds a private key, the site holds the matching public key, and a login is a signature over a challenge from that exact site. Nothing reusable is ever sent, so it can't be phished. Removing the password removes the biggest attack surface.</p>
<p><b>Account recovery then becomes the soft underbelly.</b> Knowledge-based questions (mother's maiden name) are <b>weak</b>: the answers are guessable or already leaked. And passwordless doesn't remove recovery. A lost device still needs a way back in. Provide <b>backup passkeys or one-time recovery codes</b> instead of dropping to a weak email OTP.</p>

<h4>The uncomfortable arithmetic</h4>
<p>Deploy passkeys and login is phishing-resistant. Now ask what happens when someone loses their phone. If the answer is "we email them a link", <b>your real authenticator is their email account</b>, and everything above it is decoration.</p>
<p>An attacker looking at a hardened login page doesn't attack it. They attack the recovery flow, the same door with a weaker lock. So <b>recovery must be at least as strong as primary authentication</b>. If it isn't, your security level is the recovery flow's, whatever the login page does.</p>

<h4>The passwordless methods, side by side</h4>
<div class="codeSample" data-hl>PASSKEY / WebAuthn      phishing-resistant. origin-bound. nothing typed.
                        the only one on this list a relay cannot defeat.
MAGIC LINK              relayable in real time, and it moves your security
                        to the mailbox. also: mail scanners CONSUME the
                        link before the user clicks it - a real, common bug.
EMAIL OTP               same mailbox dependency, and the code is typed,
                        so it is relayable.
SMS OTP                 weakest. SIM swap, SS7 interception, and the code
                        is readable from a lock screen.

// note that three of the four are "passwordless" and still phishable.
// removing the password is not the same as removing the phishing.</div>

<h4>Designing recovery that is not the weak point</h4>
<p><b>Enroll two authenticators up front.</b> This is the highest-value thing you can do, and it's mostly a UX problem. A user with a phone passkey and a hardware key, or recovery codes printed at enrollment, never needs a weak fallback path.</p>
<p><b>Make recovery slow and noisy.</b> Login should be fast. Recovery should not. A delay of hours for a high-value account, a notification to every registered channel, and a window in which the legitimate user can cancel. Together these defeat the quiet takeover, where the victim never notices until it's done.</p>
<p><b>Never reduce assurance silently.</b> If someone recovers via a weaker path, treat the resulting session as weaker: no privileged actions, no adding authenticators without a further check, and a cooling-off period before high-value operations. Otherwise recovery is a downgrade attack you built yourself.</p>
<p>Reset tokens: <b>single-use, short-lived, unpredictable</b> (generated by a cryptographically secure random generator, not a timestamp or a counter), delivered over a verified channel, rate-limited, and every reset <b>notifies the user</b>.</p>
<div class="codeSample" data-hl>// a reset token, and the four properties it needs
single-use     mark it consumed inside the same transaction as the reset
short-lived    minutes, not the 24 hours most frameworks default to
unpredictable  from a CSPRNG, and stored HASHED - a leaked reset table
               is otherwise a list of live account takeovers
scoped         to one account and one action. it is not a login.</div>

<h4>The thing nobody plans for</h4>
<p><b>The helpdesk is a recovery path.</b> If a support agent can reset <b>MFA</b> after a phone call, social engineering that agent is the cheapest route into any account. MFA is multi-factor authentication: proving who you are with two different kinds of evidence, usually something you know (a password) plus something you have (a phone or a security key), so a stolen password alone is not enough. A reset by phone throws the second kind away. It has been the entry point in several well-publicized breaches. Identity-verify before the agent can act, require a second approver for privileged accounts, and record what was done. A control a phone call bypasses is not a control.</p>`,
docs:[['Passwordless, FIDO/passkeys','https://fidoalliance.org/passkeys/'],['Forgot-password / recovery, OWASP','https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html']],
ex:{title:'A safe reset token & the best method',lang:'js',
run:{call:'acceptableResetToken',cases:[{name:'single-use, short-lived, unpredictable',args:[true,true,true],expect:true},{name:'reusable',args:[false,true,true],expect:false},{name:'long-lived',args:[true,false,true],expect:false},{name:'guessable',args:[true,true,false],expect:false}]},
prompt:`Write <code>function acceptableResetToken(singleUse, shortLived, unpredictable)</code> that is <code>true</code> only when all three hold, and <code>function preferred()</code> returning <code>"passkey"</code>.`,
starter:`function acceptableResetToken(singleUse, shortLived, unpredictable) {
  return false;
}
function preferred() {
  return null;
}`,
solution:`function acceptableResetToken(singleUse, shortLived, unpredictable) {
  return singleUse && shortLived && unpredictable;
}
function preferred() {
  return "passkey";
}`,
tests:[{d:'reset token must be single-use, short-lived and unpredictable',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:singleUse\\s*&&\\s*shortLived\\s*&&\\s*unpredictable))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:singleUse\\s*&&\\s*shortLived\\s*&&\\s*unpredictable)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:singleUse\\s*&&\\s*shortLived\\s*&&\\s*unpredictable)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:singleUse\\s*&&\\s*shortLived\\s*&&\\s*unpredictable)[^{]*?return\\s+\\k<av>\\b)'},{d:'the strongest passwordless method is a passkey',re:'return\\s+"passkey"'}],
behavior:`Each weakness is executed separately. Recovery bypasses authentication by design, so it must be as strong as login; otherwise it is your real second factor and everything above it is decoration.`,
hints:['A reset token should be single-use, short-lived, and unpredictable; combine with &&.','Recovery must be at least as strong as primary login; knowledge-based questions are weak.','Passkeys are the strongest passwordless method; provide backup codes for lost devices.']}},
{id:'am8',title:'WebAuthn ceremonies in depth',body:`




<p>Passkeys/WebAuthn run <b>two ceremonies</b>. The difference between them is the whole model.</p>
<p><b>1. Registration (attestation).</b> The authenticator <b>creates a new key pair</b> scoped to this site. It keeps the <b>private key</b>. It returns the <b>public key</b>, a credential id, and optionally an <b>attestation</b> statement proving what kind of authenticator it is (a YubiKey, a platform passkey). The RP stores the public key against the user. The <b>RP</b> is the relying party: WebAuthn's name for your site, the application that doesn't hold a password and instead relies on a signature from the user's device to know who's there.</p>
<p><b>2. Authentication (assertion).</b> The RP sends a random <b>challenge</b>. The authenticator <b>signs it</b> with the private key. The RP verifies the signature with the public key it saved.</p>
<p>What makes this phishing-resistant and replay-resistant: the <b>private key never leaves the device</b>. The signature is over a fresh <b>challenge</b>, so a captured response can't be <b>replayed</b>, sent again later by someone who recorded it. The assertion is <b>bound to the origin</b>, the exact site address the browser is talking to, so a look-alike site gets a signature it can't use. A <b>user-presence/verification</b> gesture (touch or biometric) authorizes each operation.</p>

<h4>Why "ceremony"</h4>
<p>A protocol is what two machines do. A <b>ceremony</b> includes the human: the touch, the biometric, and the fact that the browser, not the site, decides which origin is being talked to. WebAuthn's security depends on parts deliberately outside your application's control. Your code can't be tricked into signing for the wrong site, because your code is not the thing deciding.</p>

<h4>Registration, field by field</h4>
<div class="codeSample" data-hl>the RP sends creation options:
  challenge          random, single-use, from the SERVER. never the client.
  rp.id              the domain the credential is scoped to. a registrable
                     suffix of the origin - "corp.com" works for
                     "app.corp.com", but never the reverse.
  user.id            an OPAQUE, stable byte string. NOT an email, NOT a
                     username - it is stored on the device, sometimes
                     forever, and it should not leak who the person is.
  excludeCredentials the credentials already registered, so the same
                     authenticator does not silently enroll twice.

the authenticator returns:
  clientDataJSON     the challenge, the ORIGIN, and the type. the browser
                     wrote the origin - the site could not lie about it.
  attestationObject  authData + an optional attestation statement
  authData flags     UP  user was present (a touch)
                     UV  user was verified (biometric or PIN)
                     BE  the credential is backup-ELIGIBLE (syncable)
                     BS  the credential is currently backed up
                     (BE/BS are WebAuthn Level 3 additions)</div>

<h4>Authentication, and the counter that catches people</h4>
<p>Login sends a fresh challenge. The authenticator signs over <code>authData</code> and a hash of <code>clientDataJSON</code>. The RP verifies with the stored public key, then checks that the challenge matches the one it issued, the origin is expected, and the RP ID hash is right.</p>
<p>The <b>signature counter</b> is meant to detect a cloned authenticator: it should only ever increase. But <b>synced passkeys legitimately report 0 every time</b>, because there is no single device to count. Treat a non-increasing counter as cloning and you lock out every passkey user on the platform. Enforce the counter only when it has been non-zero before, never for a credential that reports 0.</p>

<h4>Attestation: what it is for, and why most sites skip it</h4>
<p>Attestation lets the authenticator prove <i>what model it is</i>, identified by an <b>AAGUID</b>: an authenticator attestation GUID, a long identifier shared by every unit of one authenticator model. It names the make, not the individual device. An enterprise that must guarantee only certified <b>FIDO2</b> keys needs this. FIDO2 is Fast Identity Online, version 2: the standard behind passkeys and security keys, and WebAuthn is its browser half. A consumer site doesn't, and verifying it there is harmful: you reject authenticators you didn't anticipate and turn users away for no security gain. Request <code>none</code> unless a stated policy requires otherwise.</p>

<h4>The failure modes that survive</h4>
<p>WebAuthn removes credential phishing completely. It doesn't remove a <b>session token stolen after login</b> or a <b>weak recovery path</b> (the previous lesson). It doesn't stop an <b>attacker who registers their own authenticator</b> on an account they briefly controlled, or remove the dependency on the <b>platform account</b> that syncs a passkey. Deploy it knowing which problem it solved.</p>`,
docs:[['WebAuthn ceremonies, W3C','https://www.w3.org/TR/webauthn-2/#sctn-api'],['Passkeys, FIDO Alliance','https://fidoalliance.org/passkeys/']],
ex:{title:'Name the ceremony',
prompt:`Write class <code>WebAuthn</code> with <code>static String ceremony(String phase)</code>: <code>"register"</code>→<code>"attestation"</code>, <code>"authenticate"</code>→<code>"assertion"</code>, else <code>"unknown"</code>. Also <code>static boolean privateKeyLeavesDevice()</code> returning <code>false</code>.`,
starter:`public class WebAuthn {
    static String ceremony(String phase) {
        return null;
    }
    static boolean privateKeyLeavesDevice() {
        return false;
    }
}`,
solution:`public class WebAuthn {
    static String ceremony(String phase) {
        switch (phase) {
            case "register":     return "attestation";
            case "authenticate": return "assertion";
            default:             return "unknown";
        }
    }
    static boolean privateKeyLeavesDevice() {
        return false;
    }
}`,
tests:[{d:'registration is the attestation ceremony',re:'(?:["\']register["\'][^;}]*?return\\s+["\']attestation["\'])|(?:case\\s*["\']register["\']\\s*->\\s*(?:\\{\\s*)?["\']attestation["\'])|(?:["\']register["\']\\s*:\\s*["\']attestation["\'])|(?:(?:put|entry|of)\\s*\\(\\s*["\']register["\']\\s*,\\s*["\']attestation["\'])',flags:'s'},{d:'authentication is the assertion ceremony',re:'"authenticate".*?"assertion"',flags:'s'},{d:'the private key never leaves the device',re:'privateKeyLeavesDevice\\s*\\([^)]*\\)\\s*\\{(?:[^{}]|\\{[^{}]*\\})*?(?:\\{(?:[^{}]|\\{[^{}]*\\})*?)*?return\\s+false',flags:'s'},{d:'unknown default',re:'"unknown"'}],
behavior:`ceremony("register") is "attestation" (create a key pair), ceremony("authenticate") is "assertion" (sign a challenge). privateKeyLeavesDevice() is false: the property that makes WebAuthn phishing-resistant, since there is no shared secret to steal or relay.`,
hints:['Registration creates the key pair and may include attestation; authentication signs a challenge (assertion).','The private key stays on the device; only the public key is stored by the RP.','The signed challenge is fresh and origin-bound, which stops replay and phishing.']}},
{id:'am8b',title:'WebAuthn registration: what the authenticator actually returns',body:`




<p>Registration is where a credential is created and where almost all the interesting verification happens. The browser hands your server two blobs. Reading them is the difference between "we integrated a library" and knowing what you trust.</p>
<!--flow:am8b-webauthn-reg-->
<h4>WebAuthn registration ceremony: step by step</h4>
<div class="flowDia"><svg viewBox="0 0 720 342" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="WebAuthn registration ceremony"><defs><marker id="am8b-webauthn-reg-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="am8b-webauthn-reg-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="am8b-webauthn-reg-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="am8b-webauthn-reg-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="330" class="fdLife"/><line x1="360" y1="54" x2="360" y2="330" class="fdLife"/><line x1="646" y1="54" x2="646" y2="330" class="fdLife"/><rect x="9.700000000000003" y="8" width="128.6" height="46" rx="8" class="fdActor"/><text x="74" y="27" class="fdActorT">Authenticator</text><text x="74" y="42" class="fdActorS">Touch ID / security key</text><rect x="320.3" y="8" width="79.39999999999999" height="46" rx="8" class="fdActor"/><text x="360" y="35.5" class="fdActorT">Browser</text><rect x="589.9" y="8" width="112.19999999999999" height="46" rx="8" class="fdActor"/><text x="646" y="35.5" class="fdActorT">Server (RP)</text><line x1="363" y1="102" x2="641" y2="102" stroke="var(--accent)" class="fdArrow" marker-end="url(#am8b-webauthn-reg-ah-front)"/><text x="518" y="93" class="fdLabel">start registration</text><circle cx="378" cy="102" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="378" y="105.5" class="fdNumT" style="fill:var(--accent)">1</text><line x1="643" y1="132" x2="365" y2="132" stroke="var(--accent)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#am8b-webauthn-reg-ah-front)"/><text x="488" y="123" class="fdLabel">random challenge + rp.id + user info</text><circle cx="628" cy="132" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="628" y="135.5" class="fdNumT" style="fill:var(--accent)">2</text><line x1="357" y1="162" x2="79" y2="162" stroke="var(--accent)" class="fdArrow" marker-end="url(#am8b-webauthn-reg-ah-front)"/><text x="202" y="153" class="fdLabel">navigator.credentials.create() → CTAP</text><circle cx="342" cy="162" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="342" y="165.5" class="fdNumT" style="fill:var(--accent)">3</text><rect x="14" y="179" width="356" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="200" y="194" class="fdSelfT">user gesture; NEW key pair scoped to (rp.id, user)</text><circle cx="14" cy="190" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="14" y="193.5" class="fdNumT" style="fill:var(--muted)">4</text><line x1="77" y1="228" x2="355" y2="228" stroke="var(--accent)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#am8b-webauthn-reg-ah-front)"/><text x="232" y="219" class="fdLabel">attestation: public key + credential id</text><circle cx="92" cy="228" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="92" y="231.5" class="fdNumT" style="fill:var(--accent)">5</text><line x1="363" y1="258" x2="641" y2="258" stroke="var(--accent)" class="fdArrow" marker-end="url(#am8b-webauthn-reg-ah-front)"/><text x="518" y="249" class="fdLabel">attestationObject + clientDataJSON</text><circle cx="378" cy="258" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="378" y="261.5" class="fdNumT" style="fill:var(--accent)">6</text><rect x="297.20000000000005" y="275" width="408.79999999999995" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="509.6" y="290" class="fdSelfT">verify challenge, origin, rp.id hash; store the public key</text><circle cx="297.20000000000005" cy="286" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="297.20000000000005" y="289.5" class="fdNumT" style="fill:var(--muted)">7</text><text x="360" y="312" class="fdNote">The private key never leaves the authenticator; there is nothing to breach server-side.</text></svg></div>
<ol class="fdSteps">
<li><b>Browser → Server (RP):</b> start registration <i>(front channel)</i></li>
<li><b>Server (RP) → Browser:</b> random challenge + rp.id + user info <i>(front channel)</i></li>
<li><b>Browser → Authenticator:</b> navigator.credentials.create() → CTAP <i>(front channel)</i></li>
<li><b>Authenticator:</b> user gesture; NEW key pair scoped to (rp.id, user)</li>
<li><b>Authenticator → Browser:</b> attestation: public key + credential id <i>(front channel)</i></li>
<li><b>Browser → Server (RP):</b> attestationObject + clientDataJSON <i>(front channel)</i></li>
<li><b>Server (RP):</b> verify challenge, origin, rp.id hash; store the public key</li>
</ol>
<!--/flow:am8b-webauthn-reg-->

<h4>What the server asks for</h4>
<p>Your server is the <b>RP</b>, the relying party: WebAuthn's name for the site that doesn't hold a password and instead relies on a signature from the user's device to know who's there. Your server builds the creation options. Every field is a security decision:</p>
<div class="codeSample" data-hl>{
  "challenge": &lt;32 random bytes&gt;        // MUST be fresh, random, server-stored
  "rp":   { "id": "example.com", "name": "Example" },
  "user": { "id": &lt;opaque bytes&gt;        // NOT the email, this is the user handle
            "name": "ada@example.com",
            "displayName": "Ada" },
  "pubKeyCredParams": [ {"alg": -7},     // ES256  (ECDSA P-256), expect this
                        {"alg": -257} ], // RS256  (RSA)
  "authenticatorSelection": {
     "residentKey": "required",          // discoverable -> usernameless login
     "userVerification": "required",     // PIN/biometric -> two factors in one
     "authenticatorAttachment": "platform"   // omit to allow security keys too
  },
  "excludeCredentials": [ ... ],         // stops double-registering one authenticator
  "attestation": "none"                  // ask for provenance only if you check it
}</div>
<p>The <b>user handle</b> must be an opaque, stable id, never an email or username. It's stored on the authenticator and may be displayed, so a personal identifier there leaks to anyone who picks up the device. <b>excludeCredentials</b> lists the credentials the user already has, so the authenticator refuses to enroll twice. <b>attestation: "none"</b> is the right default. Attestation you never verify adds a privacy cost and buys nothing.</p>

<h4>What comes back</h4>
<p>Two fields matter: <code>clientDataJSON</code>, produced by the <i>browser</i>, and <code>attestationObject</code>, produced by the <i>authenticator</i>. They are signed together, which ties the browser's view of the origin to the authenticator's key.</p>
<div class="codeSample" data-hl>// clientDataJSON, the BROWSER's testimony, base64url of plain JSON
{ "type": "webauthn.create",
  "challenge": "&lt;the base64url challenge you sent&gt;",
  "origin": "https://login.example.com",   // the browser will not lie about this
  "crossOrigin": false }

// attestationObject, CBOR, containing:
{ "fmt": "packed",          // attestation format, or "none"
  "attStmt": { ... },       // the provenance signature, if any
  "authData": &lt;bytes&gt;       // the part that matters
}</div>

<h4>Reading authData</h4>
<p>A fixed binary layout. Learn it by hand, because the flags carry real meaning:</p>
<div class="codeSample" data-hl>bytes  0..31   rpIdHash     SHA-256 of the RP ID, must match YOUR rp id
byte   32      flags
                 bit 0  UP  user present    (someone touched it)
                 bit 2  UV  user verified   (PIN or biometric succeeded)
                 bit 3  BE  backup eligible (this credential CAN be synced)
                 bit 4  BS  backup state    (it IS currently synced)
                            ^ BE and BS were added in WebAuthn LEVEL 3.
                              Level 2 (2021) defines only UP, UV, AT and ED.
                 bit 6  AT  attested credential data included
                 bit 7  ED  extension data included
bytes  33..36  signCount    a counter, or zero if unsupported
then (if AT):  aaguid(16) · credIdLen(2) · credentialId · COSE public key</div>
<p>The <b>SHA-256</b> in the first field is a hash function. It turns any input into a fixed 32-byte fingerprint; the same input always gives the same fingerprint, and no one can work backwards from the fingerprint to the input. So the server can check the credential was made for its own RP ID without the ID being sent in the clear.</p>
<p><b>UP versus UV</b> is the distinction people get wrong. <i>User present</i> means a human touched the device: one factor. <i>User verified</i> means the authenticator checked a PIN or biometric locally: a second factor. If you asked for <code>userVerification: "required"</code>, you must check the UV bit. The request is a preference. Only your verification makes it a requirement.</p>
<p><b>BE and BS</b> are the passkey flags, and they are <b>Level 3 additions</b>. The Level 2 recommendation doesn't have them, which confuses people when a library predates synced passkeys. BE says the credential is <i>eligible</i> to be synced across a user's devices. BS says it currently <i>is</i>. A device-bound credential has both clear, which is how you tell a hardware key from a synced passkey. If your policy needs device-bound credentials, check BE at registration. It can't be changed afterwards.</p>

<h4>Attestation: provenance, and its cost</h4>
<p>An attestation statement lets the authenticator prove <i>what kind of device it is</i>, signed by a manufacturer key and identifying the model through an <b>AAGUID</b>. That's an authenticator attestation GUID: a long identifier shared by every unit of one authenticator model, so it names the make, not the individual device. Formats include <code>packed</code> (the common one), <code>tpm</code>, <code>android-key</code>, <code>apple</code>, and <code>none</code>.</p>
<p>It's usually unnecessary. Verifying it properly means maintaining trust anchors and consulting the FIDO Metadata Service. It's useful in one situation: an enterprise that must enforce "only these approved authenticator models." For a consumer service it adds a privacy signal, an operational burden, and no security benefit. Phishing resistance comes from origin binding, not from knowing the brand.</p>

<h4>The verification steps</h4>
<ol>
<li>Parse <code>clientDataJSON</code>; check <code>type</code> is exactly <code>"webauthn.create"</code>.</li>
<li>Check the <b>challenge</b> equals the one you issued, from server state, never from the request.</li>
<li>Check the <b>origin</b> is exactly an origin you expect. String equality against an allowlist, never a prefix or "contains" check.</li>
<li>Check <code>rpIdHash</code> equals SHA-256 of your RP ID.</li>
<li>Check the <b>UP</b> flag; check <b>UV</b> if you required it.</li>
<li>Confirm the credential algorithm is one you asked for in <code>pubKeyCredParams</code>.</li>
<li>Verify the attestation only if you intend to act on it.</li>
<li>Confirm the <b>credential id is not already registered</b> to anyone, then store credential id, public key, sign count, AAGUID and the BE flag against the user.</li>
</ol>
<p>Steps 2 and 3 carry the security. A challenge not verified against server state turns the ceremony into theatre. An origin check written as "starts with" is how <code>https://login.example.com.evil.com</code> gets in.</p>`,
docs:[['W3C: WebAuthn Level 3 (defines the BE and BS flags)','https://www.w3.org/TR/webauthn-3/'],['W3C: Registering a new credential (verification procedure)','https://www.w3.org/TR/webauthn-2/#sctn-registering-a-new-credential'],['W3C (Authenticator data layout)','https://www.w3.org/TR/webauthn-2/#sctn-authenticator-data'],['W3C (Attestation statement formats)','https://www.w3.org/TR/webauthn-2/#sctn-defined-attestation-formats'],['FIDO Alliance (Metadata Service (MDS))','https://fidoalliance.org/metadata/']],
ex:{title:'Read the flags and verify the origin',
prompt:`Write <code>AuthData</code> with four methods over the flags byte. <code>static boolean userPresent(int flags)</code> tests bit 0 (<code>0x01</code>). <code>static boolean userVerified(int flags)</code> tests bit 2 (<code>0x04</code>). <code>static boolean backupEligible(int flags)</code> tests bit 3 (<code>0x08</code>): set for a syncable passkey, clear for a device-bound credential. Then <code>static boolean originAllowed(String origin, java.util.Set&lt;String&gt; allowed)</code>, which must use <b>exact</b> set membership and reject null, because a prefix comparison would accept <code>https://login.example.com.evil.com</code>.`,
starter:`import java.util.*;

public class AuthData {
    static boolean userPresent(int flags) {
        return false;
    }
    static boolean userVerified(int flags) {
        return false;
    }
    static boolean backupEligible(int flags) {
        return false;
    }
    static boolean originAllowed(String origin, Set<String> allowed) {
        return false;
    }
}`,
tests:[{d:'user-present is bit 0',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:0x01|& 1\\b))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:0x01|& 1\\b)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:0x01|& 1\\b)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:0x01|& 1\\b)[^{]*?return\\s+\\k<av>\\b)'},{d:'user-verified is bit 2',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:0x04|& 4\\b))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:0x04|& 4\\b)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:0x04|& 4\\b)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:0x04|& 4\\b)[^{]*?return\\s+\\k<av>\\b)'},{d:'backup-eligible is bit 3',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:0x08|& 8\\b))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:0x08|& 8\\b)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:0x08|& 8\\b)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:0x08|& 8\\b)[^{]*?return\\s+\\k<av>\\b)'},{d:'flags are tested with a bitwise and',re:'&'},{d:'a null origin is rejected',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:origin\\s*[!=]=\\s*null|null\\s*[!=]=\\s*origin))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:origin\\s*[!=]=\\s*null|null\\s*[!=]=\\s*origin)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:origin\\s*[!=]=\\s*null|null\\s*[!=]=\\s*origin)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:origin\\s*[!=]=\\s*null|null\\s*[!=]=\\s*origin)[^{]*?return\\s+\\k<av>\\b)'},{d:'origin matching is exact set membership',re:'contains\\s*\\(\\s*origin\\s*\\)'},{d:'no prefix matching on the origin',re:'startsWith',not:true}],
behavior:`With flags 0x05, userPresent is true and userVerified is true (bits 0 and 2), while backupEligible is false. With flags 0x01, only userPresent is true: someone touched the device but no PIN or biometric was checked, so requiring user verification means actually testing this bit rather than trusting the option you sent. With flags 0x0D, backupEligible is true, marking a syncable passkey rather than a device-bound credential. originAllowed("https://login.example.com", Set.of("https://login.example.com")) is true, while "https://login.example.com.evil.com" is false; a prefix or contains check would have accepted it.`,
hints:['<code>return (flags &amp; 0x01) != 0;</code> and the same shape for 0x04 and 0x08.','Guard the set and the origin, then rely on <code>allowed.contains(origin)</code>.','Exact equality only; reaching for startsWith is the vulnerability this exercise is about.'],
solution:`import java.util.*;

public class AuthData {
    static boolean userPresent(int flags) {
        return (flags & 0x01) != 0;   // UP: someone touched it
    }
    static boolean userVerified(int flags) {
        return (flags & 0x04) != 0;   // UV: PIN or biometric checked locally
    }
    static boolean backupEligible(int flags) {
        return (flags & 0x08) != 0;   // BE: syncable passkey, not device-bound
    }
    static boolean originAllowed(String origin, Set<String> allowed) {
        // exact match: "https://login.example.com.evil.com" must not pass
        return origin != null && allowed != null && allowed.contains(origin);
    }
}`}},

{id:'am8c',title:'WebAuthn authentication: assertions, counters and usernameless login',body:`




<p>Login is the simpler ceremony: no attestation, no key creation. But it carries the subtleties that decide whether your implementation is phishing-resistant, and it's where usernameless login comes from.</p>
<!--flow:am8c-webauthn-authn-->
<h4>WebAuthn authentication ceremony: step by step</h4>
<div class="flowDia"><svg viewBox="0 0 720 330" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="WebAuthn authentication ceremony"><defs><marker id="am8c-webauthn-authn-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="am8c-webauthn-authn-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="am8c-webauthn-authn-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="am8c-webauthn-authn-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="42" x2="74" y2="318" class="fdLife"/><line x1="360" y1="42" x2="360" y2="318" class="fdLife"/><line x1="646" y1="42" x2="646" y2="318" class="fdLife"/><rect x="9.700000000000003" y="8" width="128.6" height="34" rx="8" class="fdActor"/><text x="74" y="29.5" class="fdActorT">Authenticator</text><rect x="320.3" y="8" width="79.39999999999999" height="34" rx="8" class="fdActor"/><text x="360" y="29.5" class="fdActorT">Browser</text><rect x="589.9" y="8" width="112.19999999999999" height="34" rx="8" class="fdActor"/><text x="646" y="29.5" class="fdActorT">Server (RP)</text><line x1="363" y1="90" x2="641" y2="90" stroke="var(--accent)" class="fdArrow" marker-end="url(#am8c-webauthn-authn-ah-front)"/><text x="518" y="81" class="fdLabel">start login, perhaps usernameless</text><circle cx="378" cy="90" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="378" y="93.5" class="fdNumT" style="fill:var(--accent)">1</text><line x1="643" y1="120" x2="365" y2="120" stroke="var(--accent)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#am8c-webauthn-authn-ah-front)"/><text x="488" y="111" class="fdLabel">fresh challenge (+ allowed credential ids)</text><circle cx="628" cy="120" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="628" y="123.5" class="fdNumT" style="fill:var(--accent)">2</text><line x1="357" y1="150" x2="79" y2="150" stroke="var(--accent)" class="fdArrow" marker-end="url(#am8c-webauthn-authn-ah-front)"/><text x="202" y="141" class="fdLabel">navigator.credentials.get()</text><circle cx="342" cy="150" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="342" y="153.5" class="fdNumT" style="fill:var(--accent)">3</text><rect x="14" y="167" width="336.2" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="190.1" y="182" class="fdSelfT">user gesture; sign challenge + origin + counter</text><circle cx="14" cy="178" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="14" y="181.5" class="fdNumT" style="fill:var(--muted)">4</text><line x1="77" y1="216" x2="355" y2="216" stroke="var(--accent)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#am8c-webauthn-authn-ah-front)"/><text x="232" y="207" class="fdLabel">assertion</text><circle cx="92" cy="216" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="92" y="219.5" class="fdNumT" style="fill:var(--accent)">5</text><line x1="363" y1="246" x2="641" y2="246" stroke="var(--accent)" class="fdArrow" marker-end="url(#am8c-webauthn-authn-ah-front)"/><text x="518" y="237" class="fdLabel">assertion</text><circle cx="378" cy="246" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="378" y="249.5" class="fdNumT" style="fill:var(--accent)">6</text><rect x="310.4000000000001" y="263" width="395.59999999999997" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="516.2" y="278" class="fdSelfT">verify with the STORED public key; check origin, counter</text><circle cx="310.4000000000001" cy="274" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="310.4000000000001" y="277.5" class="fdNumT" style="fill:var(--muted)">7</text><text x="360" y="300" class="fdNote">The signature binds to rp.id and origin; a phishing page gets a useless answer.</text></svg></div>
<ol class="fdSteps">
<li><b>Browser → Server (RP):</b> start login, perhaps usernameless <i>(front channel)</i></li>
<li><b>Server (RP) → Browser:</b> fresh challenge (+ allowed credential ids) <i>(front channel)</i></li>
<li><b>Browser → Authenticator:</b> navigator.credentials.get() <i>(front channel)</i></li>
<li><b>Authenticator:</b> user gesture; sign challenge + origin + counter</li>
<li><b>Authenticator → Browser:</b> assertion <i>(front channel)</i></li>
<li><b>Browser → Server (RP):</b> assertion <i>(front channel)</i></li>
<li><b>Server (RP):</b> verify with the STORED public key; check origin, counter</li>
</ol>
<!--/flow:am8c-webauthn-authn-->

<h4>The request, and the choice hidden in it</h4>
<div class="codeSample" data-hl>{
  "challenge": &lt;32 fresh random bytes&gt;,
  "rpId": "example.com",
  "allowCredentials": [ {"type":"public-key","id":&lt;credential id&gt;} ],
  "userVerification": "required",
  "timeout": 60000
}

// allowCredentials present  -> the user must be identified FIRST
// allowCredentials EMPTY    -> the authenticator offers whatever it holds
//                              = usernameless login, needs discoverable creds</div>
<p>An empty <code>allowCredentials</code> is the whole usernameless flow. The authenticator knows which accounts it holds for this RP ID, the domain of the <b>RP</b> (the relying party: WebAuthn's name for your site, the application that relies on a signature from the user's device instead of holding a password). It shows the user a picker, and returns a <b>userHandle</b> identifying who was chosen. Your server looks the user up from that handle, so the handle must be a stable opaque id you can key on.</p>
<p>There is a privacy reason to prefer it, too. Sending <code>allowCredentials</code> for a typed username tells an unauthenticated caller whether that account exists and what credentials it has.</p>

<h4>What comes back</h4>
<div class="codeSample" data-hl>authenticatorData   rpIdHash · flags · signCount   (no attested credential data)
clientDataJSON      { "type": "webauthn.get", "challenge": ..., "origin": ... }
signature           over: authenticatorData || SHA-256(clientDataJSON)
userHandle          who this is, present for discoverable credentials</div>
<p>This bundle is the <b>assertion</b>: the signed answer to the challenge, WebAuthn's proof that the device holding the private key was there. That signature input is the mechanism the whole scheme rests on. The authenticator signs its own data <i>concatenated with a hash of the browser's testimony about the origin</i>. The hash is <b>SHA-256</b>, a function that turns any input into a fixed 32-byte fingerprint; the same input always gives the same fingerprint, and no one can work backwards from the fingerprint to the input. A phishing proxy can't alter the origin, because the browser wrote it and it's inside the signed bytes.</p>

<h4>Verifying it</h4>
<ol>
<li><code>type</code> is exactly <code>"webauthn.get"</code>.</li>
<li>The <b>challenge</b> matches one you issued, from server state, and has not already been used.</li>
<li>The <b>origin</b> is exactly one you expect.</li>
<li><code>rpIdHash</code> equals SHA-256 of your RP ID.</li>
<li><b>UP</b> is set; <b>UV</b> is set if you required it.</li>
<li>Look up the stored public key <b>by credential id</b> and confirm it belongs to the user being authenticated. A credential valid for Bob must not log in Ada.</li>
<li>Verify the signature over <code>authenticatorData || SHA-256(clientDataJSON)</code>.</li>
<li>Check the sign counter, then store the new value.</li>
</ol>
<p>Skipping step 6 is a real vulnerability. Authenticate whoever owns the credential without checking it matches the account being logged into and you've built an account-confusion bug.</p>

<h4>The signature counter, and why it mostly doesn't work</h4>
<p>Each authenticator may keep a counter that increments per signature. A counter that goes <i>down</i> or repeats suggests a clone, since two copies would drift apart. Useful in theory.</p>
<p>In practice most modern authenticators report <b>zero</b> and always will. Synced passkeys can't maintain a meaningful counter, because the credential legitimately exists on several devices at once. Many platform authenticators never implemented it. So:</p>
<div class="codeSample" data-hl>stored = 0 and received = 0   -> counters unsupported: accept, do not alarm
received &gt; stored             -> normal: store the new value
received &lt;= stored (non-zero) -> possible clone: flag, and consider blocking

// treating 0 as "went backwards" locks out every synced passkey user.</div>
<p>Treat a regression as a <i>signal</i> to log and investigate, not an automatic rejection. Never apply the check when both values are zero.</p>

<h4>Conditional UI</h4>
<p>Modern browsers can offer passkeys directly in the username field's autofill. The user clicks their account and is signed in with no button press. It requires discoverable credentials and a feature-detection call before rendering. It's the one change that makes passkeys feel better than passwords, as well as safer.</p>

<h4>The failure modes that survive WebAuthn</h4>
<p>WebAuthn is hard to attack head-on. The realistic attacks route around it:</p>
<ul>
<li><b>Recovery.</b> A passkey-protected account whose reset flow emails a link is protected by email. This is where attackers go.</li>
<li><b>Enrollment.</b> An attacker with a stolen session who can register their own authenticator gains durable access that survives a password change. Require fresh authentication to enroll, and notify on every credential added.</li>
<li><b>Downgrade.</b> Leaving SMS enabled "just in case" means the account is worth exactly SMS.</li>
<li><b>Session theft afterwards.</b> The login was unphishable. The cookie it produced is an ordinary bearer token. Sender-constrained sessions are the answer, not more MFA.</li>
</ul>
<p>Two terms in that last item. A <b>bearer token</b> is a token that works for whoever holds it, like cash: no proof of who is presenting it. <b>MFA</b> is multi-factor authentication, proving who you are with two different kinds of evidence, usually something you know (a password) plus something you have (a phone or a security key). It protects the login. It does nothing for a cookie that has already been stolen.</p>`,
docs:[['W3C (Verifying an authentication assertion)','https://www.w3.org/TR/webauthn-2/#sctn-verifying-assertion'],['W3C (Signature counter considerations)','https://www.w3.org/TR/webauthn-2/#sctn-sign-counter'],['W3C: Discoverable credentials and user handles','https://www.w3.org/TR/webauthn-2/#discoverable-credential'],['WebAuthn.wtf / passkeys.dev (Conditional UI)','https://passkeys.dev/docs/use-cases/bootstrapping/']],
ex:{title:'Assertion checks: counters and credential ownership',
prompt:`Write <code>Assertion</code> with three methods. <code>static boolean counterOk(long stored, long received)</code>: return <code>true</code> when both are <code>0</code> (counters unsupported, the normal case for synced passkeys), <code>true</code> when <code>received &gt; stored</code>, and <code>false</code> otherwise. <code>static boolean belongsTo(String credentialOwner, String loginUser)</code> returns true only when both are non-null and equal, so a credential registered to one account cannot log in another. <code>static boolean usernameless(java.util.List&lt;String&gt; allowCredentials)</code> returns true when the list is null or empty; that is what triggers the authenticator to offer its discoverable credentials.`,
starter:`import java.util.*;

public class Assertion {
    static boolean counterOk(long stored, long received) {
        return false;
    }
    static boolean belongsTo(String credentialOwner, String loginUser) {
        return false;
    }
    static boolean usernameless(List<String> allowCredentials) {
        return false;
    }
}`,
tests:[{d:'both counters zero means unsupported, not a clone',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:stored\\s*==\\s*0\\s*&&\\s*received\\s*==\\s*0|received\\s*==\\s*0\\s*&&\\s*stored\\s*==\\s*0))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:stored\\s*==\\s*0\\s*&&\\s*received\\s*==\\s*0|received\\s*==\\s*0\\s*&&\\s*stored\\s*==\\s*0)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:stored\\s*==\\s*0\\s*&&\\s*received\\s*==\\s*0|received\\s*==\\s*0\\s*&&\\s*stored\\s*==\\s*0)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:stored\\s*==\\s*0\\s*&&\\s*received\\s*==\\s*0|received\\s*==\\s*0\\s*&&\\s*stored\\s*==\\s*0)[^{]*?return\\s+\\k<av>\\b)'},{d:'a normally advancing counter is accepted',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:received\\s*>\\s*stored))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:received\\s*>\\s*stored)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:received\\s*>\\s*stored)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:received\\s*>\\s*stored)[^{]*?return\\s+\\k<av>\\b)'},{d:'credential ownership is checked',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:credentialOwner\\s*!=\\s*null|null\\s*!=\\s*credentialOwner))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:credentialOwner\\s*!=\\s*null|null\\s*!=\\s*credentialOwner)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:credentialOwner\\s*!=\\s*null|null\\s*!=\\s*credentialOwner)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:credentialOwner\\s*!=\\s*null|null\\s*!=\\s*credentialOwner)[^{]*?return\\s+\\k<av>\\b)'},{d:'ownership compares by value',re:'equals\\s*\\('},{d:'an absent credential list is handled',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:allowCredentials\\s*==\\s*null))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:allowCredentials\\s*==\\s*null)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:allowCredentials\\s*==\\s*null)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:allowCredentials\\s*==\\s*null)[^{]*?return\\s+\\k<av>\\b)'},{d:'an empty list means usernameless',re:'isEmpty\\s*\\(\\s*\\)'}],
behavior:`counterOk(0,0) is true: most modern authenticators never implement the counter, and treating that as a regression would lock out every synced-passkey user. counterOk(5,6) is true and the new value should be stored. counterOk(5,5) and counterOk(5,4) are false, which is the possible-clone signal worth logging. belongsTo("ada","ada") is true; belongsTo("bob","ada") is false, preventing the account-confusion bug where any valid credential logs in whoever was named. usernameless(null) and usernameless(List.of()) are true; a non-empty list means the user was identified first.`,
hints:['Handle the both-zero case before comparing, or you will reject every synced passkey.','<code>return credentialOwner != null &amp;&amp; credentialOwner.equals(loginUser);</code>','<code>return allowCredentials == null || allowCredentials.isEmpty();</code>'],
solution:`import java.util.*;

public class Assertion {
    static boolean counterOk(long stored, long received) {
        // 0/0 means the authenticator does not implement counters, the common case
        if (stored == 0 && received == 0) return true;
        return received > stored;   // otherwise a repeat or regression suggests a clone
    }
    static boolean belongsTo(String credentialOwner, String loginUser) {
        // a credential valid for Bob must not authenticate Ada
        return credentialOwner != null && credentialOwner.equals(loginUser);
    }
    static boolean usernameless(List<String> allowCredentials) {
        // no allowCredentials: the authenticator offers its discoverable credentials
        return allowCredentials == null || allowCredentials.isEmpty();
    }
}`}},

{id:'am9',title:'Credential stuffing, bots & account-takeover defense',body:`




<p>Most account breaches are <b>credential stuffing</b>, not clever exploits. Attackers take username/password pairs leaked from <i>other</i> sites and replay them against yours, betting that people reuse passwords. It's cheap, automated, and works often. Related threats: <b>brute force</b> (guessing one account many times), <b>bot sign-ups</b> (fake or abusive accounts), and full <b>account takeover</b> (ATO).</p>
<p><b>Layered defenses, each aimed at a specific attack:</b></p>
<ul>
<li><b>Credential stuffing</b> → check new and changed passwords against <b>known-breached lists</b> and require <b>MFA</b>. Have I Been Pwned is queried with k-anonymity, so the password never leaves you. A leaked password alone then gets nowhere.</li>
<li><b>Brute force</b> → <b>rate limiting</b> and progressive lockout, keyed by account and by real client IP.</li>
<li><b>Bot sign-ups / automation</b> → bot detection (device and behavioral signals), and a <b>CAPTCHA</b> only as a last resort.</li>
<li><b>Account takeover</b> → anomaly / <b>risk-based</b> signals (new device, impossible travel, odd hour) that trigger <b>step-up</b> authentication, plus alerting.</li>
</ul>
<p>Three of those terms in plain English. <b>MFA</b> is multi-factor authentication: proving who you are with two different kinds of evidence, usually something you know (a password) plus something you have (a phone or a security key). A stolen password alone is then not enough. A <b>CAPTCHA</b> is the "click every traffic light" puzzle: a challenge meant to tell humans from bots. It adds friction for automation and proves nothing about who is there. <b>Step-up</b> means asking for a stronger login, such as a second factor, only when the moment warrants it, instead of on every visit.</p>

<h4>Start from the attacker's economics</h4>
<p>Billions of username/password pairs are freely available, roughly two thirds of people reuse passwords, and a rented botnet makes attempts cost almost nothing. At a success rate of a fraction of a percent, an attacker replaying ten million pairs against your login page still walks away with thousands of accounts.</p>
<p>Every defense below changes one of three numbers: <b>the hit rate</b>, <b>the cost per attempt</b>, or <b>the value of a hit</b>. Framed that way, the defenses stop being a list of disconnected features.</p>

<div class="codeSample" data-hl>MFA                     -> makes a HIT WORTHLESS. the single most
                           effective control, by a wide margin.
breached-password check -> lowers the HIT RATE at the source
rate limiting           -> raises the COST PER ATTEMPT
bot detection           -> raises the cost of automating at all
risk-based step-up      -> makes a hit CONDITIONAL on looking normal</div>

<h4>Rate limiting that works</h4>
<p>Counting failures per account defends against brute force and does nothing against stuffing, because the attacker tries <i>one</i> password against a million accounts. You need more dimensions.</p>
<div class="codeSample" data-hl>PER ACCOUNT     catches brute force against one target.
                and it is a DENIAL OF SERVICE VECTOR: an attacker can
                lock a real user out on purpose. prefer progressive
                delay and step-up over hard lockout.
PER IP          catches the naive script. defeated by any botnet, and
                it punishes shared corporate NAT. never IP alone.
PER PASSWORD    the one people miss. the SAME password failing across
                many accounts is stuffing, and almost nothing else.
                counting that is a strong, low-false-positive signal.

// and get the client IP right: behind a proxy, the socket address is
// the proxy. trusting a spoofable X-Forwarded-For makes the limit
// bypassable with one header.</div>

<h4>Checking breached passwords without becoming the breach</h4>
<p>You want to reject a password that appears in a known leak. You must not send the password anywhere. <b>k-anonymity</b> solves it: hash the password, send the <i>first five characters</i> of the hash, receive every matching suffix, and compare locally. The service learns a bucket of hundreds of hashes and never learns which one you asked about.</p>
<p>Check at registration and at password change. Checking at <i>login</i> is also defensible, since an existing password may later appear in a leak. But it needs a plan for what you tell the user. A forced reset with no explanation reads as a breach of your system.</p>

<h4>Detection</h4>
<p>The controls above are preventive. Alert separately on the signals that an attack is <i>happening</i>: a sharp rise in the <b>failure rate</b>, a fall in the ratio of successes to attempts, and a surge in traffic to the login endpoint specifically. Also many accounts failing with the same password, and a spike in password resets. They are cheap to emit. They are the difference between discovering a campaign during it and reading about it afterwards.</p>

<h4>Where CAPTCHA belongs</h4>
<p>Last, and reluctantly. It's an accessibility barrier, it measurably costs conversions, and solving services price it in fractions of a cent, so it stops hobbyists and not funded attackers. Use it as a conditional response to a risk signal, never as a gate on every login. The real ordering is <b>MFA first</b>, because it makes stolen passwords worthless. Everything else on this page compensates for the accounts that don't have it yet.</p>`,
docs:[['Credential stuffing (OWASP)','https://owasp.org/www-community/attacks/Credential_stuffing'],['Have I Been Pwned (k-anonymity)','https://haveibeenpwned.com/API/v3#PwnedPasswords'],['Credential stuffing prevention (OWASP)','https://cheatsheetseries.owasp.org/cheatsheets/Credential_Stuffing_Prevention_Cheat_Sheet.html']],
},

{id:'am10',title:'Proofing in practice: documents, liveness and the deepfake problem',body:`




<p>The assurance-levels lesson gave you the framework, NIST's three scales, each from 1 to 3. <b>IAL</b> is the identity assurance level: how carefully the person's real-world identity was checked at sign-up. <b>AAL</b> is the authenticator assurance level: how strong the login is. <b>FAL</b> is the federation assurance level: how well the login result is protected on its way between systems, when one system does the logging in and sends another a signed statement about who the user is (that statement is the <b>assertion</b>). This lesson is about <b>doing</b> IAL: the ninety seconds when a stranger claims to be a specific person and you decide whether to believe them.</p>
<p>It matters more than it used to, for two reasons that arrived together. Generative models made convincing fake documents and fake faces cheap. And a wave of regulation (age assurance, financial onboarding, marketplace verification) made proofing mandatory in places that had none.</p>

<h4>What a proofing check consists of</h4>
<ul>
<li><b>Document authenticity.</b> Is this a real passport or driving license? Checks include the machine-readable zone's checksums, the security features under different lighting, and consistency between the printed data and the encoded data. The chip in an ePassport is strong, because the issuing state signs it.</li>
<li><b>Face match.</b> Does the selfie match the photo on the document? A biometric comparison returning a similarity score, not a yes or no.</li>
<li><b>Liveness, properly called presentation-attack detection.</b> Is there a live human in front of the camera, rather than a photo, a screen, a mask or a generated video? This is the check attackers now hit hardest.</li>
<li><b>Data validation.</b> Does the claimed identity exist in an authoritative source: a credit file, a government register, a mobile-network record?</li>
</ul>
<p>Each returns a <i>score</i>. The engineering decision is what to do with a set of scores, not whether a single check passed.</p>

<h4>Three outcomes, not two</h4>
<p>The most consequential design choice in proofing is refusing to build a binary. A system with only <b>pass</b> and <b>fail</b> draws one line, and wherever it sits it either rejects real customers or admits fraudsters. Every serious implementation has a third outcome, <b>refer</b>, where a human reviews the case.</p>
<p>That changes the economics. You can set the automatic-pass threshold high enough that a false accept is rare, because a borderline case costs a review rather than a customer. Two numbers matter. The <b>false accept rate</b> is fraudsters admitted, a loss event. The <b>false reject rate</b> is real people turned away, a revenue and fairness event, and almost never measured with the same care.</p>

<h4>The deepfake problem</h4>
<p>Injection attacks are now the sharp edge. Holding a printed photo to a camera is a <i>presentation</i> attack, and liveness detection is good at spotting it. Instead the attacker bypasses the camera, feeding synthetic video into the device through a virtual camera or a modified client. The biometric pipeline sees a perfect, well-lit, fabricated human.</p>
<p>The defenses are layered and none is enough alone: signals that the capture came from a genuine device sensor, challenge-response that is hard to synthesize in real time, and server-side liveness rather than a client's word for it. And, strongest by a distance, <b>reading the chip</b> in an ePassport or a mobile driving license, where the issuing state signed the data and it cannot be fabricated. The direction of travel is away from "look at a picture and judge" and towards "verify a signature", the same move identity made everywhere else.</p>

<h4>Proofing is not authentication</h4>
<p>Proofing happens <b>once</b>, to bind a real-world person to an account. Authentication happens <b>every time</b>, to prove the same person is back. Re-running document checks at each login would be slow, expensive and no more secure than a passkey.</p>
<p>The failure this prevents is common: a service proofs a user thoroughly at signup, then protects the account with a password and SMS recovery. The attacker never touches the proofing. They take the account over afterwards. <b>The strength of an identity is the weakest of its proofing and its authentication</b>, and the recovery path is part of the authentication.</p>
<p><b>Store the outcome, not the evidence.</b> Retaining passport images and face templates creates a breach liability far larger than the fraud it prevents. Keep the decision, the scores, the vendor's reference and a retention deadline. And <b>measure the rejections</b>. Proofing that disproportionately fails a group of legitimate people is a fairness failure that won't appear in any fraud metric.</p>`,
docs:[['NIST SP 800-63A (identity proofing)','https://pages.nist.gov/800-63-3/sp800-63a.html'],['ISO/IEC 30107 (presentation attack detection)','https://www.iso.org/standard/79520.html'],['ICAO 9303 (machine readable travel documents)','https://www.icao.int/publications/pages/publication.aspx?docnum=9303']],
ex:{title:'Three outcomes, not two',lang:'js',
run:{call:'proofingOutcome',cases:[{name:'strong scores and a live subject pass automatically',args:[{documentScore:0.95,faceMatchScore:0.93,livenessPassed:true}],expect:'pass'},{name:'a borderline document goes to a human',args:[{documentScore:0.72,faceMatchScore:0.93,livenessPassed:true}],expect:'refer'},{name:'a borderline face match also goes to a human',args:[{documentScore:0.99,faceMatchScore:0.60,livenessPassed:true}],expect:'refer'},{name:'a clearly bad document fails outright',args:[{documentScore:0.30,faceMatchScore:0.95,livenessPassed:true}],expect:'fail'},{name:'failed liveness fails whatever the other scores say',args:[{documentScore:0.99,faceMatchScore:0.99,livenessPassed:false}],expect:'fail'}]},
prompt:`Write <code>function proofingOutcome(signals)</code> returning <code>"pass"</code>, <code>"refer"</code> or <code>"fail"</code> from <code>{ documentScore, faceMatchScore, livenessPassed }</code>. Failed liveness is an immediate <code>fail</code> whatever the scores. Any score below 0.5 is a <code>fail</code>. Any score below 0.8 is a <code>refer</code>. Everything else passes.`,
starter:`function proofingOutcome(signals) {
  return "fail";
}`,
solution:`function proofingOutcome(s) {
  if (s.livenessPassed === false) return "fail";                       // no live human, no decision
  if (s.documentScore < 0.5 || s.faceMatchScore < 0.5) return "fail";
  if (s.documentScore < 0.8 || s.faceMatchScore < 0.8) return "refer"; // a human looks at it
  return "pass";
}`,
tests:[{d:'liveness is checked before the scores',re:'livenessPassed[^;"\']*["\'][^;"\']*?fail\\b'},{d:'a hard failure threshold exists',re:'0\\.5'},{d:'a referral band exists between the thresholds',re:'0\\.8'},{d:'all three outcomes can be returned',re:'["\x27]refer["\x27]'}],
behavior:`Five cases execute. The referral band is the point of the exercise: a system with only pass and fail must put its single threshold somewhere, and wherever it goes it either admits fraudsters or turns away real customers. Adding a third outcome converts that dilemma into a review queue, which is a cost you can budget rather than a risk you absorb. The liveness case is ordered first deliberately: a perfect document photograph and a perfect face match are exactly what an injection attack produces, so a pipeline that averages the signals instead of gating on liveness scores the attack highly.`,
hints:['Liveness is a gate, not a score to be averaged with the others.','Two thresholds produce three bands, which is why there are three outcomes.','Check the failing band before the referral band, or everything low reads as "refer".']}}
]});
