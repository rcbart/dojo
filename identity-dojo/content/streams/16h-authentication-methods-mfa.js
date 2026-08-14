STREAMS.push({icon:'🔑',iam:true,sec:'Authentication & MFA',title:'Authentication Methods & MFA',blurb:'How people actually prove who they are: password hashing done right, the three factor types, TOTP one-time codes, phishing-resistant passkeys (WebAuthn/FIDO2), and step-up/adaptive authentication for risky actions.',lessons:[

{id:'am1',title:'Passwords, done right',body:`
<p>A password is a shared secret, and the one rule that matters is: <b>never store it</b>. Store a slow, salted <i>hash</i>. If the database leaks, attackers get hashes they must crack one guess at a time, not a ready-made login list.</p>
<p>Use a purpose-built password hash — <b>Argon2id</b> (first choice today), <b>scrypt</b>, or <b>bcrypt</b>. They are deliberately slow and memory-hard, which is a feature. Never use fast, general-purpose hashes like MD5 or SHA-256 for passwords: a GPU tries billions of those per second.</p>
<div class="codeSample" data-hl>// pseudocode — a real app calls a library (e.g. Spring Security's Argon2PasswordEncoder)
String hash = argon2id(password, randomSalt);   // store hash + params; never the password
boolean ok  = argon2Verify(entered, hash);       // constant-time compare inside</div>
<p>Alongside hashing, enforce a sane <b>policy</b>: length beats complexity (aim for 12+), and check new passwords against known-breached lists (credential stuffing reuses leaked passwords). Length is the cheapest security you can buy.</p>

<h4>Why "slow" is the feature</h4>
<p>This is the part that sounds backwards. Everywhere else in engineering, faster is better. For a password
hash, <b>slow is the entire product</b>.</p>
<p>Think about who runs the function. You run it once, when a user logs in — 200 milliseconds is invisible
to them. An attacker who has stolen your database runs it <i>billions of times</i>, against a wordlist. Make
it a thousand times slower and the user notices nothing; the attacker's six-hour job becomes six months.
That asymmetry is the whole design.</p>
<div class="codeSample" data-hl>SHA-256      ~10,000,000,000 guesses/sec on a rented GPU rig
             a leaked database of SHA-256 passwords is a WORDLIST with
             extra steps. common passwords fall in seconds.

Argon2id     tuned to ~200ms and ~64MB of MEMORY per guess
             memory is the point: GPUs have thousands of cores and not
             much memory each, so memory-hardness removes the attacker's
             main advantage rather than just slowing them down.</div>

<h4>Salt and pepper, plainly</h4>
<p>A <b>salt</b> is a random value stored alongside the hash, different for every user. Without it, two
people with the same password get the same hash — so an attacker cracks once and opens both accounts, and
precomputed rainbow tables work. With it, every password must be attacked individually. It is not secret,
and it does not need to be; a modern library generates and embeds it for you.</p>
<p>A <b>pepper</b> is a single secret value mixed in, kept <i>outside</i> the database — in an HSM or the
application's secret store. It buys one specific thing: if only the database leaks, the hashes are
uncrackable without the pepper too. It costs you a rotation problem, so treat it as an addition for
high-value systems rather than a default.</p>

<h4>What the modern policy actually is</h4>
<p>NIST SP 800-63B changed the advice, and much of the industry has not caught up:</p>
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
<p>The reasoning behind the two crossed-out habits is the same: they push people toward predictable
patterns, so they lower real entropy while appearing to raise it.</p>

<h4>Two implementation details</h4>
<p><b>Compare in constant time.</b> A comparison that returns early leaks, through timing, how much of the
value matched. Every real library does this internally, which is one more reason not to hand-roll.</p>
<p><b>Never reveal whether the username exists.</b> "No such user" versus "wrong password" hands an attacker
a free account-enumeration oracle. Return one message, and take roughly the same time on both paths — which
means hashing a dummy value even when the user was not found.</p>`,
docs:[['Password storage — OWASP','https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html'],['Argon2 (RFC 9106)','https://www.rfc-editor.org/rfc/rfc9106.html']],
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
tests:[{d:'algorithm() returns argon2id',re:'return\\s+"argon2id"'},{d:'strong() requires length >= 12',re:'length\\s*\\(\\s*\\)\\s*>=\\s*12'},{d:'guards against null',re:'pw\\s*!=\\s*null'},{d:'does not pick MD5 or SHA-256',re:'"(md5|sha-?256)"',not:true,flags:'i'}],
behavior:`algorithm() returns "argon2id". strong("short") is false; strong("correcthorsebattery") is true (18 chars). A null password is rejected rather than throwing. No fast general-purpose hash is chosen for passwords.`,
hints:['A slow, memory-hard hash like argon2id is the modern default; MD5 and SHA-256 are too fast for passwords.','Length is the strongest single rule: check pw.length() >= 12.','Guard the null case first so length() never throws.']}},

{id:'am2',title:'The three factors & MFA',body:`
<p><b>Multi-factor authentication</b> asks for proof from two or more <i>independent categories</i>. The categories matter more than the count — two passwords are still one factor.</p>
<ul>
<li><b>Knowledge</b> — something you know: a password, a PIN.</li>
<li><b>Possession</b> — something you have: a phone running an authenticator app, a hardware security key.</li>
<li><b>Inherence</b> — something you are: a fingerprint, a face scan.</li>
</ul>
<p>Strong MFA combines factors from different categories, so stealing one (a leaked password) is not enough. Not all second factors are equal: SMS codes can be SIM-swapped or phished, app-based one-time codes are better, and phishing-resistant passkeys (next lessons) are best.</p>

<h4>Why "independent" is the load-bearing word</h4>
<p>The point of a second factor is not extra effort — it is that <b>one attack should not get both</b>.
A password and a security question are both knowledge, so a single phishing page harvests them
together. A password and an SMS code sound independent, until you notice both arrive on the same phone,
where a single compromised device yields both.</p>
<p>So the question to ask of any MFA design is not "how many factors?" but <b>"what single event defeats
this?"</b>:</p>
<div class="codeSample" data-hl>password + security question   -> one phishing page          NOT MFA
password + SMS to phone        -> SIM swap, or phone theft   weak
password + TOTP app on phone   -> phishing relay in real time  medium
password + security key        -> nothing short of physical theft + PIN
passkey alone                  -> device possession + biometric/PIN  = already two</div>

<h4>The property that actually matters now</h4>
<p>Factor categories are a useful taxonomy but they are no longer the sharpest distinction. The dividing
line that predicts real-world outcomes is <b>phishing resistance</b>: can an attacker who has put a
convincing fake site in front of the user relay the credential to the real site in real time?</p>
<p>For everything a human reads and retypes — a password, a 6-digit code, a push approval — the answer is
yes, and modern phishing kits automate it. For anything cryptographically bound to the origin, the answer
is no, because the browser will not produce a signature for the wrong domain no matter how convincing the
page looks.</p>
<p>That reframes the categories: <b>knowledge and most possession factors are relay-able; only
origin-bound possession is not</b>. It is why a passkey on its own is generally stronger than password
plus TOTP, despite "looking like" fewer factors — the device is possession and the biometric or PIN that
unlocks it is inherence or knowledge, and neither travels.</p>

<h4>Where MFA programmes fail</h4>
<p><b>The downgrade path.</b> Deploying security keys means nothing if SMS remains enabled as a fallback —
the attacker simply chooses SMS. The strength of your MFA is the strength of its <i>weakest enabled</i>
method, not its best.</p>
<p><b>Recovery.</b> Account recovery bypasses authentication by design. If losing a key drops the user to
an emailed link, then email is your real second factor and everything above it is decoration. Enrolling
<b>two</b> authenticators up front is what makes strong recovery possible.</p>
<p><b>Enrollment.</b> An attacker who reaches an account before the legitimate user enrolls simply
enrolls their own device. First-factor-only enrollment is a standing takeover path.</p>`,
docs:[['MFA — NIST 800-63B','https://pages.nist.gov/800-63-3/sp800-63b.html'],['MFA overview — OWASP','https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html']],
ex:{title:'Classify the factor',gradeJava:{class:'Mfa',cases:[{name:'password -> knowledge',call:'factorType',args:['"password"'],expect:'"knowledge"'},{name:'totp -> possession',call:'factorType',args:['"totp"'],expect:'"possession"'},{name:'fingerprint -> inherence',call:'factorType',args:['"fingerprint"'],expect:'"inherence"'},{name:'unknown default',call:'factorType',args:['"zzz"'],expect:'"unknown"'}]},
prompt:`Write class <code>Mfa</code> with <code>static String factorType(String method)</code> mapping a method to its category: <code>"password"</code>→<code>"knowledge"</code>, <code>"pin"</code>→<code>"knowledge"</code>, <code>"totp"</code>→<code>"possession"</code>, <code>"security-key"</code>→<code>"possession"</code>, <code>"fingerprint"</code>→<code>"inherence"</code>, and <code>"unknown"</code> for anything else.`,
starter:`public class Mfa {
    static String factorType(String method) {
        return null;
    }
}`,
solution:`public class Mfa {
    static String factorType(String method) {
        switch (method) {
            case "password":     return "knowledge";
            case "pin":          return "knowledge";
            case "totp":         return "possession";
            case "security-key": return "possession";
            case "fingerprint":  return "inherence";
            default:             return "unknown";
        }
    }
}`,
tests:[{d:'password is a knowledge factor',re:'"password".*?"knowledge"',flags:'s'},{d:'totp is a possession factor',re:'"totp".*?"possession"',flags:'s'},{d:'fingerprint is an inherence factor',re:'"fingerprint".*?"inherence"',flags:'s'},{d:'security-key is possession',re:'"security-key".*?"possession"',flags:'s'},{d:'unknown default branch',re:'"unknown"'}],
behavior:`factorType("password") is "knowledge", factorType("totp") is "possession", factorType("fingerprint") is "inherence", and factorType("carrier-pigeon") is "unknown". Real MFA combines two different categories.`,
hints:['A switch on method with one case per method reads cleanly.','Group password and pin under knowledge; totp and security-key under possession.','Anything unlisted falls through to the default returning unknown.']}},

{id:'am3',title:'One-time codes: TOTP & HOTP',body:`
<p>Authenticator apps show a 6-digit code that changes every 30 seconds. That is <b>TOTP</b> (Time-based One-Time Password). It builds on <b>HOTP</b> (a counter-based code): both hash a shared secret with a moving number using HMAC, then truncate to digits.</p>
<p>HOTP moves the number by an explicit counter that increments each use. TOTP derives the number from the clock: <code>counter = currentUnixSeconds / stepSeconds</code> (step is usually 30). Because both sides compute the same counter from the same clock, they land on the same code without ever sending the secret — and to tolerate clock skew, servers accept the code from the adjacent time step too.</p>
<div class="codeSample" data-hl>// TOTP in one line of intuition:
long counter = epochSeconds / 30;              // same on client and server
String code  = truncate6(hmacSha1(secret, counter));</div>

<h4>The problem OTPs were invented to solve</h4>
<p>A password is a <b>static</b> secret: observe it once and you can use it forever. One-time passwords
break that by making the secret <b>change every time</b>, so an observation has almost no value. Note what
this does and does not fix — it defeats replay of a captured code, and it does not defeat someone
relaying a code the moment you type it.</p>

<h4>How the two sides agree without ever talking</h4>
<p>The elegant part is that nothing is transmitted. At enrollment the server and the authenticator share
one secret — that is the QR code you scan, which is just a URI carrying a base32 secret. From then on
both sides independently compute the same value from that secret plus a moving number, and compare
results.</p>
<div class="codeSample" data-hl>HOTP (RFC 4226)   moving number = a COUNTER, incremented on each use
TOTP (RFC 6238)   moving number = TIME:  floor(unixSeconds / 30)

code = truncate6( HMAC-SHA1( sharedSecret, movingNumber ) )

// "truncate" is dynamic truncation: take the low 4 bits of the last byte
// as an OFFSET, read 4 bytes from there, mask the sign bit, mod 10^6.
// fiddly, but it is why every authenticator app agrees on the digits.</div>
<p>HMAC is what makes this safe: it is one-way, so seeing a stream of codes tells an attacker nothing
about the secret.</p>

<h4>The trade the two variants make</h4>
<p><b>HOTP drifts.</b> If the token generates a code the user never submits, the counters diverge. Servers
compensate with a <i>look-ahead window</i> — try the next N counters — which is why HOTP hardware tokens
have a resync procedure and why the window cannot be large without weakening the code.</p>
<p><b>TOTP needs clocks to agree.</b> There is no state to drift, but if the device clock is wrong, every
code fails. Servers accept the adjacent step or two, which is also why a stolen code stays valid slightly
longer than the 30 seconds the UI implies.</p>

<h4>The parts implementations get wrong</h4>
<ul>
<li><b>Not consuming the code.</b> A code valid for its whole window can be submitted repeatedly — if a
relay is fast enough, twice. Record used (user, counter) pairs and reject repeats.</li>
<li><b>No rate limit.</b> Six digits is a million possibilities; unlimited attempts against a 90-second
window is a feasible attack, not a theoretical one.</li>
<li><b>Storing the shared secret in plaintext.</b> It is symmetric — a database leak lets the attacker
generate valid codes indefinitely, and unlike a password hash there is nothing to slow them down.</li>
<li><b>Treating the QR code as ephemeral.</b> It is the secret in visual form; a screenshot in a support
ticket is a permanent compromise.</li>
</ul>
<p>And the ceiling: TOTP is <b>not phishing-resistant</b>. The user reads six digits and types them
wherever they are asked to. NIST SP 800-63B classifies it as AAL2, and the AAL3 tier requires a
hardware-backed, phishing-resistant authenticator instead.</p>`,
docs:[['TOTP (RFC 6238)','https://www.rfc-editor.org/rfc/rfc6238'],['HOTP (RFC 4226)','https://www.rfc-editor.org/rfc/rfc4226']],
ex:{title:'Compute the TOTP counter',lang:'js',
run:{call:'counter',cases:[{name:'the epoch itself is window 0',args:[0,30],expect:0},{name:'59 seconds is still window 1',args:[59,30],expect:1},{name:'60 seconds starts window 2',args:[60,30],expect:2},{name:'a 60-second step halves the counter',args:[600,60],expect:10}]},
prompt:`Write <code>function counter(epochSeconds, stepSeconds)</code> returning the time-step counter — <code>epochSeconds</code> divided by <code>stepSeconds</code>, <b>floored</b>. This is the moving number both sides hash. (JavaScript division produces a float, so floor it.)`,
starter:`function counter(epochSeconds, stepSeconds) {
  return 0;
}`,
solution:`function counter(epochSeconds, stepSeconds) {
  return Math.floor(epochSeconds / stepSeconds);
}`,
tests:[{d:'divides the clock by the step',re:'epochSeconds\\s*/\\s*stepSeconds'},{d:'floors to a whole window',re:'Math\\.floor'}],
behavior:`counter(0,30) is 0, counter(59,30) is 1, counter(60,30) is 2. Flooring to the current window is what lets client and server land on the same code without exchanging anything — and here the floor is executed, so forgetting it actually fails.`,
hints:['Divide the clock by the step size.','JavaScript division yields a float; Math.floor gives you the window.','A step of 30 means the counter increments twice per minute.']}},

{id:'am4',title:'Passkeys: WebAuthn & FIDO2',body:`
<p>Passwords and even one-time codes can be <b>phished</b>: a fake site relays whatever you type. Passkeys close that hole. Built on <b>WebAuthn</b> and <b>FIDO2</b>, a passkey is a public/private key pair created per site. Your device keeps the private key (in secure hardware or synced through your platform) and only ever signs a challenge; the site stores the matching public key.</p>
<p>Two properties make passkeys <b>phishing-resistant</b>. First, the signature is <b>origin-bound</b> — the browser ties it to the real site, so a look-alike domain gets a signature it cannot use. Second, the secret <b>never leaves the device</b> and is never typed, so there is nothing to relay or paste into a fake form. A security key (a FIDO2 hardware token) works the same way.</p>

<h4>Start from what goes wrong with everything else</h4>
<p>Every authentication method covered so far shares one structural flaw: <b>the user hands a secret to
whatever asked for it</b>. The user is the transport, and the user cannot reliably tell a real site from
a convincing copy. Passwords, TOTP codes, push approvals — all of them are relayed by a proxy sitting
between the user and the real site, and modern phishing kits do this automatically.</p>
<p>You cannot train your way out of it. The fix has to remove the human's ability to give the credential
to the wrong party at all.</p>

<h4>The two moves that achieve it</h4>
<p><b>Nothing shared is ever secret.</b> Registration creates a key pair; the site stores only the
<i>public</i> key. There is no shared secret in the database, so a breach of the site yields nothing an
attacker can authenticate with — and there is nothing for the user to type, screenshot, or be talked
into reading aloud.</p>
<p><b>The browser, not the user, decides who is asking.</b> This is the part that actually kills phishing.
The signature covers the origin the browser observed, and the authenticator will only use a credential
registered to that origin. A look-alike domain gets no signature at all.</p>
<div class="codeSample" data-hl>user visits  bank-secure-login.com  (the phishing site)
   |
   +- site asks the browser for the credential for  bank.com
   |     -> browser REFUSES. wrong origin. no prompt, no choice, no signature.
   |
   +- site asks for a credential for  bank-secure-login.com
         -> the authenticator has none. nothing to steal.

// contrast: a TOTP code does not know what site asked for it.
// the origin check is done by software that cannot be fooled by pixels.</div>

<h4>What "passkey" actually means</h4>
<p>The vocabulary is genuinely confusing, so: <b>WebAuthn</b> is the browser API, <b>CTAP2</b> is how the
browser talks to an external authenticator, and <b>FIDO2</b> is the pair of them together. A
<b>passkey</b> is the consumer-facing name for a <i>discoverable</i> WebAuthn credential — one the
authenticator can find without being told a username, which is what makes usernameless login possible.</p>
<p>The other axis is where it lives. A <b>synced</b> passkey replicates through a platform keychain, so
losing a phone does not lose the account — that is what made passkeys viable for consumers, and it is
also what makes the security model depend on the platform account. A <b>device-bound</b> credential on a
hardware key never leaves that key: stronger, and it is on you to enroll a second one.</p>

<h4>The honest limits</h4>
<p>Passkeys do not protect a session after login — a token stolen from the browser is still a token.
They do not fix account recovery, which remains the weakest path in most deployments. And they shift
trust onto the platform account that syncs them. What they do eliminate, completely, is credential
phishing — which is the entry point for most real-world account compromise. The next lessons take the
registration and assertion ceremonies apart field by field.`,
docs:[['WebAuthn — W3C','https://www.w3.org/TR/webauthn-2/'],['Passkeys — FIDO Alliance','https://fidoalliance.org/passkeys/']],
ex:{title:'Which methods resist phishing?',lang:'js',
run:{call:'phishingResistant',cases:[{args:['passkey'],expect:true},{args:['security-key'],expect:true},{args:['sms'],expect:false},{args:['totp'],expect:false},{args:['password'],expect:false},{name:'push approval is relayable',args:['push'],expect:false}]},
prompt:`Write <code>function phishingResistant(method)</code> that returns <code>true</code> only for origin-bound methods — <code>"passkey"</code> and <code>"security-key"</code> — and <code>false</code> for everything else, including <code>"password"</code>, <code>"sms"</code>, <code>"totp"</code> and <code>"push"</code>.`,
starter:`function phishingResistant(method) {
  return false;
}`,
solution:`function phishingResistant(method) {
  return method === "passkey" || method === "security-key";
}`,
tests:[{d:'passkey is phishing-resistant',re:'"passkey"'},{d:'security-key is phishing-resistant',re:'"security-key"'},{d:'combines the two with OR',re:'\\|\\|'},{d:'does not mark sms as resistant',re:'"sms"',not:true}],
behavior:`Every relayable method is executed as its own case. The winning trait is that the secret is origin-bound and never typed — anything a human reads and retypes can be relayed in real time by a proxy.`,
hints:['Two allowed values joined by || is enough.','Use === for string comparison in JavaScript.','Everything not explicitly allowed should return false.']}},

{id:'am4c',title:'FIDO2 architecture: WebAuthn, CTAP and who does what',body:`
<p>"FIDO2", "WebAuthn" and "passkey" get used as synonyms and are three different things. FIDO2 is an
umbrella over <b>two</b> specifications, and knowing which one owns which problem makes the whole area
much easier to reason about.</p>

<h4>The two halves</h4>
<div class="codeSample" data-hl>   [ Relying Party ]        your server: stores public keys, verifies signatures
          |
          |  WebAuthn        a JavaScript API in the browser (a W3C standard)
          |                  navigator.credentials.create() / .get()
   [   Browser   ]
          |
          |  CTAP2           Client To Authenticator Protocol (a FIDO Alliance
          |                  standard) — speaks USB, NFC or Bluetooth
   [ Authenticator ]         the thing holding the private key

FIDO2 = WebAuthn + CTAP2</div>
<p><b>WebAuthn</b> is the part your code touches: a browser API, standardised by the W3C, that your
JavaScript calls and your server verifies. <b>CTAP2</b> is the part you never see: how the browser
talks to an external authenticator over USB, NFC or Bluetooth. If the authenticator is built into the
device — Touch ID, Windows Hello — the platform handles it internally and no CTAP is involved at all.</p>
<p>This split explains a common confusion. A hardware security key needs CTAP2 because it is a separate
device; a platform passkey does not. Both present an identical WebAuthn surface to your server, which
is why <b>your server code does not care which was used</b>, and generally should not.</p>

<h4>Where it came from</h4>
<p>Three generations, and the older names still appear in production:</p>
<ul>
<li><b>FIDO UAF</b> (2014) — passwordless, mobile-focused, largely superseded.</li>
<li><b>FIDO U2F / CTAP1</b> (2014) — the original second-factor security key. Still works: modern
browsers can talk CTAP1 to old keys, and WebAuthn can accept U2F-era credentials through the
<code>appid</code> extension. U2F was second-factor <i>only</i> — it could not replace the password.</li>
<li><b>FIDO2</b> (2018) — WebAuthn plus CTAP2, adding the two capabilities that made passwords
removable: <b>discoverable credentials</b> (the authenticator can remember which account it is for) and
<b>user verification</b> (a PIN or biometric on the authenticator, so it is two factors on its own).</li>
</ul>
<p>That last point is what makes a passkey a complete login rather than a second factor: something you
<i>have</i> (the authenticator) plus something you <i>know or are</i> (the PIN or biometric that
unlocks it), verified locally and never transmitted.</p>

<h4>Authenticator types, and the two axes</h4>
<p>Every authenticator is described by two independent properties, and the vocabulary appears directly
in the API:</p>
<div class="codeSample" data-hl>ATTACHMENT — where it lives
  platform     built into the device      Touch ID, Windows Hello, Android
  cross-platform ("roaming")  portable    YubiKey, phone used for another device

CREDENTIAL STORAGE — what it remembers
  discoverable (resident)   the key lives on the authenticator, which knows
                            which accounts it holds -> usernameless login
  non-discoverable          the key is wrapped into the credential id itself;
                            the server must say which credentials to try</div>
<p>Non-discoverable credentials are a clever trick: the authenticator encrypts the private key into the
credential id it hands back, stores nothing, and can therefore hold unlimited credentials. The cost is
that the server must supply the credential id at login, so the user has to identify themselves first.
Discoverable credentials consume scarce slots on the device but enable a login page with no username
field at all.</p>

<h4>Roles in one sentence each</h4>
<ul>
<li><b>Relying party (RP)</b> — your application. Generates challenges, stores public keys and
credential ids, verifies signatures. Identified by an <b>RP ID</b>, which is a domain.</li>
<li><b>Client</b> — the browser or platform. Enforces the origin rules, collects consent, and is the
reason phishing fails: it will not let a site request a signature for a domain it does not control.</li>
<li><b>Authenticator</b> — generates and holds key pairs, performs user verification, signs
challenges. Never releases a private key.</li>
</ul>
<p>The security property everything else rests on: <b>the client, not your code, binds the signature to
the origin.</b> You cannot forget to implement it, and a phishing site cannot opt out of it.</p>

<h4>The RP ID rule</h4>
<p>The <b>RP ID</b> scopes a credential to a domain, and the rules are strict for good reason. It must
be the origin's domain or a <i>registrable suffix</i> of it: a page on
<code>login.example.com</code> may use an RP ID of <code>login.example.com</code> or
<code>example.com</code> — but never <code>com</code>, and never a different domain.</p>
<div class="codeSample" data-hl>page at https://login.example.com

  rpId "login.example.com"   OK   credential works only on that host
  rpId "example.com"         OK   works across all subdomains
  rpId "com"                 REJECTED — public suffix
  rpId "evil.com"            REJECTED — not a suffix of this origin

// choose deliberately: rpId is baked into the credential and CANNOT be
// changed later without re-registering every user.</div>
<p>That last line is the practical trap. Registering everyone under
<code>login.example.com</code> and later wanting <code>example.com</code> means every credential is
useless. Pick the broadest domain you might ever need, at the start.</p>`,
docs:[['W3C — Web Authentication Level 2','https://www.w3.org/TR/webauthn-2/'],['FIDO Alliance — Client to Authenticator Protocol (CTAP)','https://fidoalliance.org/specs/fido-v2.1-ps-20210615/fido-client-to-authenticator-protocol-v2.1-ps-20210615.html'],['FIDO Alliance — specifications overview','https://fidoalliance.org/specifications/'],['W3C — Relying Party Identifier rules','https://www.w3.org/TR/webauthn-2/#rp-id']],
ex:{title:'Validate an RP ID against the page origin',
prompt:`The client rejects an RP ID that is not the origin's domain or a registrable suffix of it. Write <code>RpId</code> with <code>static boolean valid(String originHost, String rpId)</code> returning true when <code>rpId</code> equals <code>originHost</code>, or when <code>originHost</code> ends with <code>"." + rpId</code>. Return false if either is null, and also false when <code>rpId</code> contains no dot (a bare public suffix such as <code>"com"</code> must never be accepted). Then <code>static boolean changeable()</code> returning <code>false</code> — the RP ID is baked into every credential and cannot be changed after registration.`,
starter:`public class RpId {
    static boolean valid(String originHost, String rpId) {
        return false;
    }
    static boolean changeable() {
        return true;
    }
}`,
tests:[{d:'null inputs are rejected',re:'originHost\\s*==\\s*null|rpId\\s*==\\s*null'},{d:'an exact host match is allowed',re:'equals\\s*\\('},{d:'a parent domain is allowed as a suffix',re:'endsWith\\s*\\('},{d:'the suffix check includes the dot separator',re:'"\\."\\s*\\+\\s*rpId'},{d:'a bare public suffix is refused',re:'contains\\s*\\(\\s*"\\."\\s*\\)|indexOf\\s*\\(\\s*"\\."'},{d:'the RP ID cannot be changed later',re:'return\\s+false'}],
behavior:`valid("login.example.com","login.example.com") is true. valid("login.example.com","example.com") is true, because a credential can be scoped to the parent domain and used across subdomains. valid("login.example.com","com") is false — accepting a public suffix would let any site on that TLD use the credential. valid("login.example.com","evil.com") is false, and this single check is what makes phishing structurally impossible rather than merely discouraged. valid(null,"example.com") is false. changeable() is false: choose the broadest domain you might need before registering anyone, because changing it invalidates every credential.`,
hints:['Guard nulls, then reject an rpId with no dot in it.','Two acceptable cases: <code>originHost.equals(rpId)</code> or <code>originHost.endsWith("." + rpId)</code>.','The dot matters — without it, "notexample.com" would appear to be a suffix of "example.com".'],
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
<p>"Turn on MFA" is not one decision. The methods differ by orders of magnitude in the attacks they
stop, and choosing badly produces a system that passes a compliance checkbox while remaining
phishable. This lesson is the catalogue: every method in common use, what it actually resists, and the
practice that makes each one as good as it can be.</p>

<h4>The one axis that matters most</h4>
<p>Almost every MFA method stops <b>credential stuffing</b> — a password reused from some other breach
is no longer enough. That is real value and it is why any MFA beats none. But only some methods stop
<b>phishing</b>, and phishing is what actually takes over accounts today.</p>
<p>The distinction is mechanical, not a matter of degree. If the second factor is <i>something the user
can read out and type</i>, the user can be induced to read it out to an attacker. A code has no idea
which site asked for it. A method is <b>phishing-resistant</b> only when the authenticator itself
checks who is asking — which requires the origin to be part of the cryptographic operation.</p>
<div class="codeSample" data-hl>REAL-TIME PHISHING, against any code-based method:

  user -> attacker's proxy site -> the real site
   1. user types password on the fake site; proxy replays it instantly
   2. real site asks for the OTP; proxy shows the same prompt
   3. user types the 6-digit code; proxy replays it within its 30s window
   4. attacker holds a valid session

Nothing about the code is broken. It was simply given to the wrong site.
A passkey cannot be relayed this way: the signature is bound to the origin.</div>

<h4>The catalogue</h4>

<p><b>1. SMS one-time code.</b> A code texted to a phone number.<br>
<i>Pros:</i> works on every phone, no app, no enrollment friction, understood by everyone. For a
consumer product it often has the highest adoption of any method, and adoption is a security property.<br>
<i>Cons:</i> SIM swap transfers the number to an attacker; SS7 interception; codes visible on lock
screens; delivery failures abroad; carrier costs. Fully phishable.<br>
<i>Best practice:</i> treat as a floor, not a target. Never allow it to reset or bypass a stronger
factor. Rate-limit sends, expire in minutes, bind the code to one session, and include the site name in
the message so the user has a chance of noticing a mismatch. NIST has discouraged it for higher
assurance levels for years.</p>

<p><b>2. Voice call OTP.</b> The code read aloud.<br>
<i>Pros:</i> accessibility — works for users who cannot read a screen or use apps, and reaches
landlines.<br>
<i>Cons:</i> everything wrong with SMS, plus vulnerability to voicemail interception.<br>
<i>Best practice:</i> keep it as an accessibility fallback, not a default.</p>

<p><b>3. Email one-time code or magic link.</b><br>
<i>Pros:</i> zero enrollment, no extra device, good for low-risk consumer accounts.<br>
<i>Cons:</i> it is usually <b>not a second factor at all</b> — if the email account is also the password
reset channel, an attacker with the mailbox has both. Mail scanners consume single-use links.<br>
<i>Best practice:</i> acceptable as a <i>primary</i> passwordless factor for low-risk accounts; do not
count it as a second factor alongside a password recoverable through that same inbox.</p>

<p><b>4. TOTP authenticator app.</b> A shared secret plus the clock produces a 6-digit code.<br>
<i>Pros:</i> no carrier, no network, no cost, an open standard, works offline, immune to SIM swap. The
best ratio of security to friction among code-based methods.<br>
<i>Cons:</i> phishable in real time. The shared secret exists in two places, so a server-side breach
exposes seeds. Device loss locks the user out. Cloud-synced authenticator apps trade some security for
recoverability.<br>
<i>Best practice:</i> encrypt seeds at rest, show the QR once, enforce one-time use of each code to stop
replay, allow a small clock skew and no more, and enroll a second method at the same time.</p>

<p><b>5. HOTP / hardware OTP tokens.</b> Counter-based codes, or a keyfob display.<br>
<i>Pros:</i> no clock sync; a dedicated device with nothing else on it; works in facilities where phones
are banned.<br>
<i>Cons:</i> counter drift needs a resynchronisation window, which is itself an attack surface;
procurement and distribution costs; still phishable.<br>
<i>Best practice:</i> keep the look-ahead window small; use where phones are prohibited.</p>

<p><b>6. Push approval.</b> A notification saying "approve this login?"<br>
<i>Pros:</i> excellent user experience — one tap, nothing to type — and the prompt can carry context
(location, app, IP) that a code cannot.<br>
<i>Cons:</i> <b>MFA fatigue</b>. An attacker with the password sends approval requests repeatedly, at
3am, until someone taps to make it stop. This has caused several major breaches. Still phishable via a
proxy that triggers the real push.<br>
<i>Best practice:</i> <b>number matching</b> — the login screen shows two digits the user must type into
the app, which defeats blind approval outright. Show origin and location, rate-limit prompts hard,
lock the account after repeated denials, and alert on the pattern.</p>

<p><b>7. FIDO2 / WebAuthn security key.</b> A hardware key holding a private key per site.<br>
<i>Pros:</i> <b>phishing-resistant</b>. The signature covers the origin, so a lookalike domain gets
nothing. The private key never leaves the hardware. No shared secret, so a server breach yields only
public keys. Meets the highest assurance level.<br>
<i>Cons:</i> cost, and the logistics of buying and shipping them; loss requires a genuine recovery
path; enrollment on every device.<br>
<i>Best practice:</i> the right answer for administrators and any privileged account. Enroll <b>two</b>
keys — one carried, one in a safe — so loss is not a lockout. Do not undermine it with an SMS fallback.</p>

<p><b>8. Passkeys (platform / synced).</b> The same WebAuthn cryptography, with the key held by the
device or synced through a platform account.<br>
<i>Pros:</i> phishing-resistant with far better ergonomics than a hardware key — a fingerprint or face
scan and nothing to carry. Syncing solves the loss problem that keeps hardware keys niche.<br>
<i>Cons:</i> security now depends on the platform account holding the sync keychain; cross-ecosystem
use is still awkward; a shared device muddies who authenticated.<br>
<i>Best practice:</i> the default recommendation for consumer products today. For workforce use, decide
deliberately between <i>device-bound</i> passkeys (stronger, harder to recover) and <i>synced</i> ones
(recoverable, only as strong as the platform account).</p>

<p><b>9. Smart card / PIV / CAC.</b> A certificate on a card, unlocked by PIN.<br>
<i>Pros:</i> phishing-resistant, hardware-backed, ties into an existing PKI, and doubles as a physical
badge. Long-established in government and defence.<br>
<i>Cons:</i> needs readers and middleware, and a whole PKI with issuance and revocation behind it. Heavy
for anything outside a regulated enterprise.<br>
<i>Best practice:</i> use where the PKI already exists; check revocation, and do not let the PIN become
the only real secret.</p>

<p><b>10. Biometrics.</b> Fingerprint, face.<br>
<i>Pros:</i> nothing to remember or carry.<br>
<i>Cons:</i> the crucial point — a biometric is <b>not a factor you send anywhere</b>. It is a local
gesture that unlocks a key on the device. A biometric transmitted to a server is a password you can
never change. Also: false rejects, and it cannot be revoked.<br>
<i>Best practice:</i> keep it local, as the unlock for a passkey or a device key. Never send a template
to a server. Always offer a non-biometric path for the users it fails.</p>

<p><b>11. Backup / recovery codes.</b> A printed list of single-use codes.<br>
<i>Pros:</i> the safety net that makes strong methods adoptable, since users will accept a hardware key
if losing it is survivable.<br>
<i>Cons:</i> long-lived, phishable, and routinely stored in the email account or a screenshot — which
puts them exactly where an attacker already is.<br>
<i>Best practice:</i> generate ten, hash them at rest, mark each used, force regeneration when they run
low, and tell the user plainly where <i>not</i> to keep them.</p>

<h4>The ranking</h4>
<div class="codeSample" data-hl>PHISHING-RESISTANT   passkey · security key · smart card
                       origin is part of the signature — a proxy gets nothing

RESISTS BULK ATTACKS  push with number matching
                       stops fatigue; still relayable by a live proxy
                      TOTP · HOTP · hardware OTP
                       no SIM swap; relayable within the code's window

WEAKEST               SMS · voice · email code
                       phishable AND interceptable, but still far better than nothing</div>

<h4>Four practices that matter more than the choice</h4>
<ol>
<li><b>Do not allow downgrade.</b> A user with a passkey must not be able to sign in with SMS "because
they lost their phone." An attacker will always claim exactly that. The weakest enrolled method is the
account's real strength, so the fallback must be at least as strong, or must require a slower,
human-verified recovery path.</li>
<li><b>Recovery is the attack surface.</b> Account takeovers overwhelmingly go through reset flows, not
through the front door. A hardware key protecting an account whose recovery is an emailed link is
protected by email.</li>
<li><b>Secure the enrollment.</b> Adding a factor must be at least as protected as using one. If an
attacker with a stolen session can silently enroll their own authenticator, the MFA is decorative —
require a fresh authentication for enrollment, and notify the user on every change.</li>
<li><b>Enroll two, always.</b> Single-method MFA guarantees eventual lockout, and lockout pressure is
what makes organisations build the weak bypass that gets exploited.</li>
</ol>
<p><b>The short version.</b> Consumer product: passkeys as the goal, TOTP as the common path, SMS only
as an on-ramp. Workforce: passkeys or security keys, number-matched push as the transition. Privileged
accounts: phishing-resistant only, two keys enrolled, no weaker fallback at all.</p>`,
docs:[['NIST SP 800-63B — Authenticator types and AAL requirements','https://pages.nist.gov/800-63-3/sp800-63b.html'],['CISA — Implementing phishing-resistant MFA','https://www.cisa.gov/sites/default/files/publications/fact-sheet-implementing-phishing-resistant-mfa-508c.pdf'],['CISA — Implementing number matching in MFA applications','https://www.cisa.gov/sites/default/files/publications/fact-sheet-implement-number-matching-in-mfa-applications-508c.pdf'],['W3C — Web Authentication (WebAuthn) Level 2','https://www.w3.org/TR/webauthn-2/'],['RFC 6238 — TOTP','https://www.rfc-editor.org/rfc/rfc6238']],
ex:{title:'Rank the methods and block the downgrade',
prompt:`Write <code>MfaPolicy</code> with three methods. <code>static boolean phishingResistant(String method)</code> is true only for <code>"passkey"</code>, <code>"security-key"</code> and <code>"smart-card"</code> — the methods where the origin is part of the signature. <code>static int strength(String method)</code> returns <code>3</code> for a phishing-resistant method, <code>2</code> for <code>"totp"</code>, <code>"hotp"</code> or <code>"push-number-match"</code>, <code>1</code> for <code>"sms"</code>, <code>"voice"</code>, <code>"email-code"</code> or <code>"push-simple"</code>, and <code>0</code> for anything else including <code>null</code>. <code>static boolean allowFallback(String enrolledBest, String fallback)</code> returns true only when the fallback is <b>at least as strong</b> as the best method the user already has — an attacker will always claim they lost the strong one.`,
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
tests:[{d:'passkeys are phishing-resistant',re:'"passkey"'},{d:'security keys are phishing-resistant',re:'"security-key"'},{d:'smart cards are phishing-resistant',re:'"smart-card"'},{d:'unknown methods score zero',re:'return\\s+0'},{d:'code-based methods sit in the middle tier',re:'"totp"'},{d:'number matching is ranked above simple push',re:'"push-number-match"'},{d:'SMS is ranked weakest',re:'"sms"'},{d:'a fallback may not be weaker than what is enrolled',re:'strength\\s*\\(\\s*fallback\\s*\\)\\s*>=\\s*strength\\s*\\(\\s*enrolledBest'}],
behavior:`phishingResistant("passkey") is true; phishingResistant("totp") is false, because a code can be read out to a proxy site while a passkey signature is bound to the origin. strength("security-key") is 3, strength("totp") is 2, strength("push-number-match") is 2 while strength("push-simple") is 1 (blind approval is what MFA fatigue exploits), strength("sms") is 1, and strength(null) is 0. allowFallback("passkey","sms") is false — this is the downgrade attack, where the attacker simply claims to have lost the strong factor. allowFallback("totp","security-key") is true, since moving to a stronger method is always fine.`,
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
<p>Not every action deserves the same friction. <b>Step-up authentication</b> lets a user in with one factor for ordinary work, then demands stronger or fresh proof right before a sensitive action — moving money, changing an email, deleting an account.</p>
<p><b>Adaptive (risk-based)</b> auth decides <i>when</i> to step up by scoring signals: a new device, a new country, an impossible-travel jump, an unusual hour. Low risk stays frictionless; high risk triggers re-authentication or MFA. The rule of thumb: match the assurance to the value and risk of the action, and treat a recent successful auth as a short-lived pass that expires.</p>

<h4>The problem with authenticating once</h4>
<p>Classic login treats authentication as a gate: pass it, and you have a session that grants everything
for hours. But the assurance that gate produced <b>decays</b> — the person who authenticated at 9am may
not be the person holding the laptop at 3pm, and nothing in the session records the difference.</p>
<p>Meanwhile the actions inside that session are wildly unequal. Reading a dashboard and wiring
£50,000 carry the same credential. Step-up exists to break that equivalence: <b>assurance should be
proportional to what is being done, and it should be recent.</b></p>

<h4>Two questions, not one</h4>
<div class="codeSample" data-hl>STEP-UP     "this ACTION needs more than the session currently proves"
              -> driven by the sensitivity of the operation
              -> deterministic: changing the recovery email ALWAYS re-auths

ADAPTIVE    "this CONTEXT looks unlike the user's normal behaviour"
              -> driven by risk signals, probabilistic
              -> a familiar device at home may never see a prompt

// they compose: adaptive decides WHETHER, step-up decides WHAT IS REQUIRED.
// most failures come from implementing one and calling it the other.</div>

<h4>Making it real: the freshness check</h4>
<p>The mechanism is simpler than it sounds. Record when the user last authenticated and how strongly;
before a sensitive action, compare that against what the action demands. In OIDC this is standardised:
<code>max_age</code> asks the provider to re-authenticate if the session is older than N seconds,
<code>acr_values</code> asks for a specific assurance level, and the returned <code>auth_time</code> and
<code>acr</code> claims tell you what you actually got.</p>
<p>Two rules that are easy to get wrong. <b>Verify what came back</b> — asking for a stronger
<code>acr</code> means nothing if you do not check the response contains it; a provider that cannot
satisfy the request may simply return the session it already had. And <b>bind the result to the
action</b> — a fresh authentication should authorise the specific operation that triggered it, not open a
window in which any sensitive action passes.</p>

<h4>Risk signals, and their limits</h4>
<p>The useful signals are unremarkable: new device, new network, impossible travel, an unusual time,
velocity, a known-bad IP reputation, behavioural drift. Each is weak alone; together they are decent at
ranking sessions.</p>
<p>What they are not is <b>evidence</b>. Every signal has a benign explanation — people travel, use VPNs,
get new phones, and work odd hours. Tuned too tightly, adaptive auth prompts constantly, users learn to
approve reflexively, and you have manufactured the exact habit that MFA fatigue attacks exploit. Tuned
too loosely it never fires.</p>
<p>Which is why the load should sit on step-up rather than adaptive: <b>the sensitivity of an action is a
fact you know for certain, and risk is a guess.</b> Use the certainty for the hard rules and the guess
for the extras.</p>`,
docs:[['Step-up authentication — Auth0','https://auth0.com/docs/secure/multi-factor-authentication/step-up-authentication'],['Risk-based auth — NIST 800-63B','https://pages.nist.gov/800-63-3/sp800-63b.html']],
ex:{title:'Decide when to step up',lang:'js',
run:{call:'required',cases:[{name:'sensitive action, stale auth',args:['transfer',false],expect:true},{name:'sensitive action, fresh auth',args:['transfer',true],expect:false},{name:'other sensitive action',args:['change-email',false],expect:true},{name:'ordinary action',args:['view',false],expect:false}]},
prompt:`Write <code>function required(action, recentlyAuthed)</code> returning <code>true</code> when the action is sensitive — <code>"transfer"</code> or <code>"change-email"</code> — <b>and</b> the user has not recently authenticated.`,
starter:`function required(action, recentlyAuthed) {
  return false;
}`,
solution:`function required(action, recentlyAuthed) {
  const sensitive = action === "transfer" || action === "change-email";
  return sensitive && !recentlyAuthed;
}`,
tests:[{d:'transfer counts as sensitive',re:'"transfer"'},{d:'change-email counts as sensitive',re:'"change-email"'},{d:'requires NOT recently authenticated',re:'!\\s*recentlyAuthed'},{d:'combines sensitivity AND freshness',re:'&&'}],
behavior:`required("transfer",false) is true; required("transfer",true) is false because a fresh authentication already happened; required("view",false) is false. The sensitivity of an action is a fact you know for certain — which is why it, not a risk score, carries the hard rules.`,
hints:['Compute a sensitive flag first from the two high-risk actions joined by ||.','Step-up is needed only when sensitive is true AND recentlyAuthed is false.','Use the ! operator to express not recently authenticated.']}},
{id:'am6',title:'Identity assurance levels: IAL, AAL, FAL',body:`
<p>How much should you trust that a user is who they claim? NIST 800-63 answers with <b>three independent scales</b>, so you can dial each to the risk of the action rather than treating "identity" as one thing.</p>
<ul>
<li><b>IAL — Identity Assurance Level</b> (proofing): how strongly the <i>real-world identity</i> was verified at enrollment. IAL1 = self-asserted (no proofing); IAL2 = remote or in-person evidence checked; IAL3 = in-person, supervised.</li>
<li><b>AAL — Authenticator Assurance Level</b> (login): how strong the <i>authentication</i> is. AAL1 = single factor; AAL2 = MFA; AAL3 = hardware-based, phishing-resistant (a security key/passkey with verifier binding).</li>
<li><b>FAL — Federation Assurance Level</b> (assertion): how strongly the <i>federated assertion</i> is protected. FAL1 = signed; FAL2 = signed and encrypted; FAL3 = holder-of-key (the assertion is bound to a key the presenter must prove).</li>
</ul>
<p>The point is to <b>match assurance to risk</b>: reading public docs might need only IAL1/AAL1, while moving money needs high AAL (step-up to MFA or a passkey) and, for a regulated identity, higher IAL. The three scales are independent — you can have a strongly proofed identity (high IAL) logging in weakly (low AAL), which is itself a risk to notice.</p>

<h4>Why three scales instead of one</h4>
<p>"How much do we trust this login?" is really three questions that people habitually collapse into one,
and collapsing them produces bad decisions in both directions.</p>
<div class="codeSample" data-hl>IAL  "is this the right HUMAN?"       - settled ONCE, at enrolment
AAL  "is this that human, NOW?"       - settled at EVERY login
FAL  "can I trust this MESSAGE about  - settled per federated assertion
      them from another system?"

// a concrete case that shows why they must be separate:
//   a bank verified your passport in a branch          -> IAL2/3
//   and lets you log in with a password alone          -> AAL1
// strongly proofed, weakly authenticated. that gap IS the risk, and a
// single combined score would hide it entirely.</div>

<h4>What each level actually requires</h4>
<p><b>IAL</b> is about evidence at enrolment. <b>IAL1</b> is self-asserted — anyone can type a name, which
is right for a newsletter and wrong for a bank. <b>IAL2</b> means remote or in-person evidence was checked
against authoritative sources. <b>IAL3</b> adds a supervised, in-person process. The cost rises steeply, and
so does the amount of personal data you are then holding — which is a liability as well as an asset.</p>
<p><b>AAL</b> is about the authenticator. <b>AAL1</b> is a single factor. <b>AAL2</b> is two independent
factors — this is where a password plus TOTP lands. <b>AAL3</b> requires a hardware-based,
<b>phishing-resistant</b> authenticator with verifier impersonation resistance, which in practice means a
security key or a device-bound passkey. Note what that excludes: TOTP and push approvals are AAL2 and
cannot reach AAL3, because they can be relayed.</p>
<p><b>FAL</b> is about the assertion crossing a boundary. <b>FAL1</b> signed, <b>FAL2</b> signed and
encrypted, <b>FAL3</b> holder-of-key — the presenter must prove possession of a key the assertion is bound
to. FAL3 is the same idea as DPoP and mTLS-bound tokens: the assertion stops being a bearer credential.</p>

<h4>Using them without turning it into paperwork</h4>
<p>The practical value is that <b>you can dial each independently against the risk of the action</b>, rather
than treating a user as uniformly trusted. Reading published documentation needs almost nothing. Changing a
payment destination needs high AAL, right now — a step-up, not a session from this morning. Opening a
regulated financial account needs high IAL at enrolment and says nothing about how they log in
afterwards.</p>
<p>In OIDC these travel as <code>acr</code> and <code>amr</code>, and in SAML as
<code>AuthnContextClassRef</code>. The rule from the step-up lesson applies: <b>asking for a level means
nothing unless you check what came back</b>. A provider that cannot satisfy your request may simply return
the session it already had.</p>

<h4>The mismatch worth watching for</h4>
<p>High IAL with low AAL is the combination that quietly creates risk, because the account <i>feels</i>
trustworthy — a verified human is behind it — while the door is weak. It is also the most common state in
regulated industries, where enrolment received enormous attention and login was left as a password. If you
audit one thing from this lesson, audit that gap.</p>`,
docs:[['NIST SP 800-63-3 (Digital Identity)','https://pages.nist.gov/800-63-3/'],['800-63B (Authenticator AALs)','https://pages.nist.gov/800-63-3/sp800-63b.html']],
ex:{title:'Name the scale and the level',
prompt:`Write class <code>Assurance</code> with two static methods. <code>String scale(String concern)</code>: <code>"identity-proofing"</code>→<code>"IAL"</code>, <code>"authentication-strength"</code>→<code>"AAL"</code>, <code>"federation-assertion"</code>→<code>"FAL"</code>, else <code>"unknown"</code>. <code>String aal(String method)</code>: <code>"single-factor"</code>→<code>"AAL1"</code>, <code>"mfa"</code>→<code>"AAL2"</code>, <code>"hardware-phishing-resistant"</code>→<code>"AAL3"</code>, else <code>"unknown"</code>.`,
starter:`public class Assurance {
    static String scale(String concern) {
        return null;
    }
    static String aal(String method) {
        return null;
    }
}`,
solution:`public class Assurance {
    static String scale(String concern) {
        switch (concern) {
            case "identity-proofing":       return "IAL";
            case "authentication-strength": return "AAL";
            case "federation-assertion":    return "FAL";
            default:                        return "unknown";
        }
    }
    static String aal(String method) {
        switch (method) {
            case "single-factor":               return "AAL1";
            case "mfa":                          return "AAL2";
            case "hardware-phishing-resistant":  return "AAL3";
            default:                             return "unknown";
        }
    }
}`,
tests:[{d:'identity proofing is the IAL scale',re:'"identity-proofing".*?"IAL"',flags:'s'},{d:'authentication strength is the AAL scale',re:'"authentication-strength".*?"AAL"',flags:'s'},{d:'federation assertion is the FAL scale',re:'"federation-assertion".*?"FAL"',flags:'s'},{d:'MFA is AAL2',re:'"mfa".*?"AAL2"',flags:'s'},{d:'hardware phishing-resistant is AAL3',re:'"hardware-phishing-resistant".*?"AAL3"',flags:'s'},{d:'unknown default',re:'"unknown"'}],
behavior:`scale("identity-proofing") is "IAL", scale("authentication-strength") is "AAL", scale("federation-assertion") is "FAL". aal("mfa") is "AAL2", aal("hardware-phishing-resistant") is "AAL3". Three independent dials you match to the risk of the action.`,
hints:['IAL is about proofing the real-world identity; AAL is about login strength; FAL is about protecting the assertion.','Single factor is AAL1, MFA is AAL2, hardware phishing-resistant is AAL3.','Match each scale to the risk rather than treating identity as one number.']}},
{id:'am7',title:'Passwordless login & account recovery',body:`
<p><b>Passwordless</b> removes the password entirely. The common methods: <b>magic links</b> (a one-time link emailed to you), <b>one-time codes</b> (emailed or texted — SMS is the weakest, SIM-swappable), and <b>passkeys</b> (WebAuthn — the strongest, phishing-resistant). Removing the password removes the biggest attack surface.</p>
<p><b>But account recovery becomes the soft underbelly.</b> A system is only as strong as the easiest way in — and that is usually the "forgot password" / recovery flow. If recovery is weaker than login, attackers ignore login and attack recovery. Two rules: <b>recovery must be at least as strong as primary authentication</b>, and knowledge-based questions (mother's maiden name) are <b>weak</b> — the answers are guessable or already leaked.</p>
<p>Good recovery hygiene: reset tokens that are <b>single-use, short-lived, and unpredictable</b>; delivered over a verified channel; rate-limited; and every reset <b>notifies the user</b>. Passwordless does not remove recovery — if a device is lost you still need a way back in, so provide <b>backup passkeys or one-time recovery codes</b> rather than dropping to a weak email OTP.</p>

<h4>The uncomfortable arithmetic</h4>
<p>Deploy passkeys and you have made login phishing-resistant. Now ask what happens when someone loses their
phone. If the answer is "we email them a link", then <b>your real authenticator is their email account</b>,
and everything above it is decoration.</p>
<p>This is not a hypothetical. An attacker looking at a hardened login page does not attack it — they attack
the recovery flow, because it is the same door with a weaker lock. The rule that follows is blunt:
<b>recovery must be at least as strong as primary authentication</b>, and if it is not, your security level
is the recovery flow's, whatever the login page does.</p>

<h4>Comparing the passwordless methods honestly</h4>
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
<p><b>Enrol two authenticators up front.</b> This is the single highest-value thing you can do, and it is
almost entirely a UX problem rather than a security one. A user with a phone passkey and a hardware key, or
a set of recovery codes printed at enrolment, never needs a weak fallback path at all.</p>
<p><b>Make recovery slow and noisy.</b> Login should be fast; recovery should not. A delay of hours for a
high-value account, a notification to every registered channel, and a window in which the legitimate user
can cancel it, together defeat the quiet takeover — which is the attack that matters, because the victim
never notices until it is done.</p>
<p><b>Never reduce assurance silently.</b> If someone recovers into an account via a weaker path, the
session that results should be treated as weaker: no privileged actions, no adding new authenticators
without a further check, and a cooling-off period before high-value operations. Otherwise recovery becomes a
downgrade attack you built yourself.</p>
<div class="codeSample" data-hl>// a reset token, and the four properties it needs
single-use     mark it consumed inside the same transaction as the reset
short-lived    minutes, not the 24 hours most frameworks default to
unpredictable  from a CSPRNG, and stored HASHED - a leaked reset table
               is otherwise a list of live account takeovers
scoped         to one account and one action. it is not a login.</div>

<h4>The thing nobody plans for</h4>
<p><b>The helpdesk is a recovery path.</b> If a support agent can reset MFA after a phone call, then social
engineering that agent is the cheapest route into any account — and it has been the entry point in several
well-publicised breaches. Identity-verify before the agent can act, require a second approver for privileged
accounts, and record what was done. A technical control that a phone call bypasses is not a control.</p>`,
docs:[['Passwordless — FIDO/passkeys','https://fidoalliance.org/passkeys/'],['Forgot-password / recovery — OWASP','https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html']],
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
tests:[{d:'reset token must be single-use, short-lived and unpredictable',re:'singleUse\\s*&&\\s*shortLived\\s*&&\\s*unpredictable'},{d:'the strongest passwordless method is a passkey',re:'return\\s+"passkey"'}],
behavior:`Each weakness is executed separately. Recovery bypasses authentication by design, so it must be as strong as login — otherwise it is your real second factor and everything above it is decoration.`,
hints:['A reset token should be single-use, short-lived, and unpredictable — combine with &&.','Recovery must be at least as strong as primary login; knowledge-based questions are weak.','Passkeys are the strongest passwordless method; provide backup codes for lost devices.']}},
{id:'am8',title:'WebAuthn ceremonies in depth',body:`
<p>Passkeys/WebAuthn run <b>two ceremonies</b>, and knowing the difference is the whole model.</p>
<p><b>1. Registration (attestation).</b> The relying party asks the authenticator to <b>create a new key pair</b> scoped to this site. The device keeps the <b>private key</b> and returns the <b>public key</b> plus a credential id — and, optionally, an <b>attestation</b> statement that cryptographically proves what kind of authenticator it is (a YubiKey, a platform passkey). The RP stores the public key against the user.</p>
<p><b>2. Authentication (assertion).</b> On login the RP sends a random <b>challenge</b>; the authenticator <b>signs it</b> with the stored credential's private key; the RP verifies the signature with the public key it saved at registration.</p>
<p>Three properties make this phishing-resistant and replay-resistant: the <b>private key never leaves the device</b>; the signature is over a fresh <b>challenge</b> (so a captured response can't be replayed); and the assertion is <b>bound to the origin</b> (so a look-alike site gets a signature it can't use). A <b>user-presence/verification</b> gesture (touch or biometric) authorizes each operation. Attestation matters mainly to high-assurance RPs that must confirm a certified authenticator model; most consumer sites skip verifying it.</p>

<h4>Ceremony, and why the word is used</h4>
<p>A protocol is what two machines do. A <b>ceremony</b> includes the human — the touch, the biometric, the
fact that a browser rather than the site decides which origin is being talked to. WebAuthn is described as
ceremonies because the security depends on parts that are deliberately outside your application's control.
That is the point: your code cannot be tricked into signing for the wrong site, because your code is not the
thing deciding.</p>

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
                     authenticator does not silently enrol twice.

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
<p>Login sends a fresh challenge; the authenticator signs over <code>authData</code> and a hash of
<code>clientDataJSON</code>; the RP verifies with the stored public key, then checks the challenge matches
the one it issued, the origin is expected, and the RP ID hash is right.</p>
<p>The <b>signature counter</b> is meant to detect a cloned authenticator: it should only ever increase. But
<b>synced passkeys legitimately report 0 every time</b>, because there is no single device to count. An
implementation that treats a non-increasing counter as cloning will lock out every passkey user on the
platform. The rule: enforce the counter only when it has been non-zero before, and never for a credential
that reports 0.</p>

<h4>Attestation: what it is for, and why most sites skip it</h4>
<p>Attestation lets the authenticator prove <i>what model it is</i>, identified by an <b>AAGUID</b>. An
enterprise that must guarantee only certified FIDO2 keys are used needs this. A consumer site does not — and
verifying it there is actively harmful, because it means rejecting authenticators you did not anticipate and
turning users away for no security gain. Request <code>none</code> unless you have a stated policy that
requires otherwise.</p>

<h4>The failure modes that survive</h4>
<p>WebAuthn removes credential phishing completely. It does not remove: a <b>session token stolen after
login</b>, a <b>weak recovery path</b> (the previous lesson), an <b>attacker who registers their own
authenticator</b> on an account they briefly controlled, or the dependency on the <b>platform account</b>
that syncs a passkey. Deploy it knowing which problem it solved.</p>`,
docs:[['WebAuthn ceremonies — W3C','https://www.w3.org/TR/webauthn-2/#sctn-api'],['Passkeys — FIDO Alliance','https://fidoalliance.org/passkeys/']],
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
tests:[{d:'registration is the attestation ceremony',re:'"register".*?"attestation"',flags:'s'},{d:'authentication is the assertion ceremony',re:'"authenticate".*?"assertion"',flags:'s'},{d:'the private key never leaves the device',re:'privateKeyLeavesDevice[\\s\\S]*?return\\s+false',flags:'s'},{d:'unknown default',re:'"unknown"'}],
behavior:`ceremony("register") is "attestation" (create a key pair), ceremony("authenticate") is "assertion" (sign a challenge). privateKeyLeavesDevice() is false — the property that makes WebAuthn phishing-resistant, since there is no shared secret to steal or relay.`,
hints:['Registration creates the key pair and may include attestation; authentication signs a challenge (assertion).','The private key stays on the device; only the public key is stored by the RP.','The signed challenge is fresh and origin-bound, which stops replay and phishing.']}},
{id:'am8b',title:'WebAuthn registration: what the authenticator actually returns',body:`
<p>Registration is where a credential is created and where almost all the interesting verification
happens. The browser hands your server two blobs; being able to read them is the difference between
"we integrated a library" and understanding what you are trusting.</p>

<h4>What the server asks for</h4>
<p>Your server builds the creation options, and every field is a security decision:</p>
<div class="codeSample" data-hl>{
  "challenge": &lt;32 random bytes&gt;,        // MUST be fresh, random, server-stored
  "rp":   { "id": "example.com", "name": "Example" },
  "user": { "id": &lt;opaque bytes&gt;,        // NOT the email — this is the user handle
            "name": "ada@example.com",
            "displayName": "Ada" },
  "pubKeyCredParams": [ {"alg": -7},     // ES256  (ECDSA P-256) — expect this
                        {"alg": -257} ], // RS256  (RSA)
  "authenticatorSelection": {
     "residentKey": "required",          // discoverable -> usernameless login
     "userVerification": "required",     // PIN/biometric -> two factors in one
     "authenticatorAttachment": "platform"   // omit to allow security keys too
  },
  "excludeCredentials": [ ... ],         // stops double-registering one authenticator
  "attestation": "none"                  // ask for provenance only if you check it
}</div>
<p>Three of these are worth dwelling on. The <b>user handle</b> must be an opaque, stable id — never an
email or username, because it is stored on the authenticator and may be displayed; putting a personal
identifier there leaks it to anyone who picks up the device. <b>excludeCredentials</b> lists the
credentials the user already has, so the authenticator refuses to enroll twice and you avoid mystery
duplicates. And <b>attestation: "none"</b> is the right default: asking for attestation you never verify
adds a privacy cost and buys nothing.</p>

<h4>What comes back</h4>
<p>Two fields matter: <code>clientDataJSON</code>, produced by the <i>browser</i>, and
<code>attestationObject</code>, produced by the <i>authenticator</i>. They are signed together, which is
what ties the browser's view of the origin to the authenticator's key.</p>
<div class="codeSample" data-hl>// clientDataJSON — the BROWSER's testimony, base64url of plain JSON
{ "type": "webauthn.create",
  "challenge": "&lt;the base64url challenge you sent&gt;",
  "origin": "https://login.example.com",   // the browser will not lie about this
  "crossOrigin": false }

// attestationObject — CBOR, containing:
{ "fmt": "packed",          // attestation format, or "none"
  "attStmt": { ... },       // the provenance signature, if any
  "authData": &lt;bytes&gt;       // the part that matters
}</div>

<h4>Reading authData</h4>
<p>A fixed binary layout, and worth knowing by hand because the flags carry real meaning:</p>
<div class="codeSample" data-hl>bytes  0..31   rpIdHash     SHA-256 of the RP ID — must match YOUR rp id
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
<p><b>UP versus UV</b> is the distinction people get wrong. <i>User present</i> means a human touched
the device — one factor. <i>User verified</i> means the authenticator checked a PIN or biometric — a
second factor, locally. If you asked for <code>userVerification: "required"</code>, you must actually
check the UV bit; the request is a preference, and only your verification makes it a requirement.</p>
<p><b>BE and BS</b> are the passkey flags, and they are <b>Level 3 additions</b> — if you are reading
the Level 2 recommendation you will not find them, which is a common source of confusion when a library
predates synced passkeys. BE says the credential is <i>eligible</i> to be synced across
a user's devices; BS says it currently <i>is</i>. A device-bound credential has both clear. This is how
you tell a hardware key from a synced passkey, and if your policy needs device-bound credentials, BE is
the bit to check — at registration, because it cannot be changed afterwards.</p>

<h4>Attestation: provenance, and its cost</h4>
<p>An attestation statement lets the authenticator prove <i>what kind of device it is</i> — signed by a
manufacturer key, identifying the model through an <b>AAGUID</b>. Formats include <code>packed</code>
(the common one), <code>tpm</code>, <code>android-key</code>, <code>apple</code>, and
<code>none</code>.</p>
<p>It sounds valuable and is usually unnecessary. Verifying it properly means maintaining trust anchors
and consulting the FIDO Metadata Service. It is genuinely useful in exactly one situation: an
enterprise that must enforce "only these approved authenticator models." For a consumer service it adds
a privacy signal, an operational burden, and no security benefit — the phishing resistance comes from
origin binding, not from knowing the brand.</p>

<h4>The verification steps</h4>
<ol>
<li>Parse <code>clientDataJSON</code>; check <code>type</code> is exactly
<code>"webauthn.create"</code>.</li>
<li>Check the <b>challenge</b> equals the one you issued, and that you issued it — from server state,
never from the request.</li>
<li>Check the <b>origin</b> is exactly an origin you expect. String equality against an allow-list;
never a prefix or a "contains" check.</li>
<li>Check <code>rpIdHash</code> equals SHA-256 of your RP ID.</li>
<li>Check the <b>UP</b> flag; check <b>UV</b> if you required it.</li>
<li>Confirm the credential algorithm is one you asked for in <code>pubKeyCredParams</code>.</li>
<li>Verify the attestation only if you intend to act on it.</li>
<li>Confirm the <b>credential id is not already registered</b> to anyone, then store credential id,
public key, sign count, AAGUID and the BE flag against the user.</li>
</ol>
<p>Steps 2 and 3 are the load-bearing ones. A challenge that is not verified against server state turns
the whole ceremony into theatre, and an origin check written as "starts with" is how
<code>https://login.example.com.evil.com</code> gets in.</p>`,
docs:[['W3C — WebAuthn Level 3 (defines the BE and BS flags)','https://www.w3.org/TR/webauthn-3/'],['W3C — Registering a new credential (verification procedure)','https://www.w3.org/TR/webauthn-2/#sctn-registering-a-new-credential'],['W3C — Authenticator data layout','https://www.w3.org/TR/webauthn-2/#sctn-authenticator-data'],['W3C — Attestation statement formats','https://www.w3.org/TR/webauthn-2/#sctn-defined-attestation-formats'],['FIDO Alliance — Metadata Service (MDS)','https://fidoalliance.org/metadata/']],
ex:{title:'Read the flags and verify the origin',
prompt:`Write <code>AuthData</code> with four methods over the flags byte. <code>static boolean userPresent(int flags)</code> tests bit 0 (<code>0x01</code>). <code>static boolean userVerified(int flags)</code> tests bit 2 (<code>0x04</code>). <code>static boolean backupEligible(int flags)</code> tests bit 3 (<code>0x08</code>) — set for a syncable passkey, clear for a device-bound credential. Then <code>static boolean originAllowed(String origin, java.util.Set&lt;String&gt; allowed)</code>, which must use <b>exact</b> set membership and reject null, because a prefix comparison would accept <code>https://login.example.com.evil.com</code>.`,
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
tests:[{d:'user-present is bit 0',re:'0x01|& 1\\b'},{d:'user-verified is bit 2',re:'0x04|& 4\\b'},{d:'backup-eligible is bit 3',re:'0x08|& 8\\b'},{d:'flags are tested with a bitwise and',re:'&'},{d:'a null origin is rejected',re:'origin\\s*!=\\s*null|null\\s*!=\\s*origin'},{d:'origin matching is exact set membership',re:'contains\\s*\\(\\s*origin\\s*\\)'},{d:'no prefix matching on the origin',re:'startsWith',not:true}],
behavior:`With flags 0x05, userPresent is true and userVerified is true (bits 0 and 2), while backupEligible is false. With flags 0x01, only userPresent is true — someone touched the device but no PIN or biometric was checked, so requiring user verification means actually testing this bit rather than trusting the option you sent. With flags 0x0D, backupEligible is true, marking a syncable passkey rather than a device-bound credential. originAllowed("https://login.example.com", Set.of("https://login.example.com")) is true, while "https://login.example.com.evil.com" is false — a prefix or contains check would have accepted it.`,
hints:['<code>return (flags &amp; 0x01) != 0;</code> and the same shape for 0x04 and 0x08.','Guard the set and the origin, then rely on <code>allowed.contains(origin)</code>.','Exact equality only — reaching for startsWith is the vulnerability this exercise is about.'],
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
<p>Login is the simpler ceremony — no attestation, no key creation — but it carries the subtleties that
decide whether your implementation is actually phishing-resistant, and it is where the usernameless
experience comes from.</p>

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
<p>An empty <code>allowCredentials</code> is the whole usernameless flow. The authenticator knows which
accounts it holds for this RP ID, shows the user a picker, and returns a <b>userHandle</b> identifying
who was chosen. Your server looks the user up from that handle — which is why the handle must be a
stable opaque id you can key on.</p>
<p>There is a privacy reason to prefer it, too. Sending <code>allowCredentials</code> for a username
someone typed tells an unauthenticated caller whether that account exists and what credentials it has.</p>

<h4>What comes back</h4>
<div class="codeSample" data-hl>authenticatorData   rpIdHash · flags · signCount   (no attested credential data)
clientDataJSON      { "type": "webauthn.get", "challenge": ..., "origin": ... }
signature           over: authenticatorData || SHA-256(clientDataJSON)
userHandle          who this is — present for discoverable credentials</div>
<p>That signature input is the mechanism the entire scheme rests on. The authenticator signs its own
data <i>concatenated with a hash of the browser's testimony about the origin</i>. A phishing proxy
cannot alter the origin, because the browser wrote it and it is inside the signed bytes.</p>

<h4>Verifying it</h4>
<ol>
<li><code>type</code> is exactly <code>"webauthn.get"</code>.</li>
<li>The <b>challenge</b> matches one you issued, from server state, and has not already been used.</li>
<li>The <b>origin</b> is exactly one you expect.</li>
<li><code>rpIdHash</code> equals SHA-256 of your RP ID.</li>
<li><b>UP</b> is set; <b>UV</b> is set if you required it.</li>
<li>Look up the stored public key <b>by credential id</b>, and confirm it belongs to the user being
authenticated — a credential valid for Bob must not log in Ada.</li>
<li>Verify the signature over <code>authenticatorData || SHA-256(clientDataJSON)</code>.</li>
<li>Check the sign counter, then store the new value.</li>
</ol>
<p>Step 6 is a real vulnerability when skipped. If you look up the credential and authenticate whoever
owns it without checking it matches the account being logged into, you have built an account-confusion
bug.</p>

<h4>The signature counter, and why it mostly does not work</h4>
<p>Each authenticator may keep a counter that increments per signature. A counter that goes <i>down</i>
or repeats suggests a cloned authenticator, since two copies would drift apart. Useful in theory.</p>
<p>In practice most modern authenticators report <b>zero</b> and always will. Synced passkeys cannot
maintain a meaningful counter — the credential legitimately exists on several devices at once, which is
the entire point — and many platform authenticators never implemented it. So:</p>
<div class="codeSample" data-hl>stored = 0 and received = 0   -> counters unsupported: accept, do not alarm
received &gt; stored             -> normal: store the new value
received &lt;= stored (non-zero) -> possible clone: flag, and consider blocking

// treating 0 as "went backwards" locks out every synced passkey user.</div>
<p>Treat a regression as a <i>signal</i> worth logging and investigating, not an automatic rejection —
and never apply the check at all when both values are zero.</p>

<h4>Conditional UI</h4>
<p>Modern browsers can offer passkeys directly in the username field's autofill, so the user clicks
their account and is signed in with no button press. It requires discoverable credentials and a
feature-detection call before rendering, and it is the single change that makes passkeys feel better
than passwords rather than merely safer.</p>

<h4>The failure modes that survive WebAuthn</h4>
<p>WebAuthn is unusually hard to attack head-on. The realistic attacks route around it:</p>
<ul>
<li><b>Recovery.</b> A passkey-protected account whose reset flow emails a link is protected by email.
This is where attackers go.</li>
<li><b>Enrollment.</b> If an attacker with a stolen session can register their own authenticator, they
gain durable access that survives a password change. Require fresh authentication to enroll, and notify
on every credential added.</li>
<li><b>Downgrade.</b> Leaving SMS enabled "just in case" means the account is worth exactly SMS.</li>
<li><b>Session theft afterwards.</b> The login was unphishable; the cookie it produced is an ordinary
bearer token. Sender-constrained sessions are the answer, not more MFA.</li>
</ul>
<p>The pattern is consistent: the cryptography holds, so everything depends on the flows around it.</p>`,
docs:[['W3C — Verifying an authentication assertion','https://www.w3.org/TR/webauthn-2/#sctn-verifying-assertion'],['W3C — Signature counter considerations','https://www.w3.org/TR/webauthn-2/#sctn-sign-counter'],['W3C — Discoverable credentials and user handles','https://www.w3.org/TR/webauthn-2/#discoverable-credential'],['WebAuthn.wtf / passkeys.dev — Conditional UI','https://passkeys.dev/docs/use-cases/bootstrapping/']],
ex:{title:'Assertion checks: counters and credential ownership',
prompt:`Write <code>Assertion</code> with three methods. <code>static boolean counterOk(long stored, long received)</code>: return <code>true</code> when both are <code>0</code> (counters unsupported — the normal case for synced passkeys), <code>true</code> when <code>received &gt; stored</code>, and <code>false</code> otherwise. <code>static boolean belongsTo(String credentialOwner, String loginUser)</code> returns true only when both are non-null and equal, so a credential registered to one account cannot log in another. <code>static boolean usernameless(java.util.List&lt;String&gt; allowCredentials)</code> returns true when the list is null or empty — that is what triggers the authenticator to offer its discoverable credentials.`,
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
tests:[{d:'both counters zero means unsupported, not a clone',re:'stored\\s*==\\s*0\\s*&&\\s*received\\s*==\\s*0|received\\s*==\\s*0\\s*&&\\s*stored\\s*==\\s*0'},{d:'a normally advancing counter is accepted',re:'received\\s*>\\s*stored'},{d:'credential ownership is checked',re:'credentialOwner\\s*!=\\s*null|null\\s*!=\\s*credentialOwner'},{d:'ownership compares by value',re:'equals\\s*\\('},{d:'an absent credential list is handled',re:'allowCredentials\\s*==\\s*null'},{d:'an empty list means usernameless',re:'isEmpty\\s*\\(\\s*\\)'}],
behavior:`counterOk(0,0) is true — most modern authenticators never implement the counter, and treating that as a regression would lock out every synced-passkey user. counterOk(5,6) is true and the new value should be stored. counterOk(5,5) and counterOk(5,4) are false, which is the possible-clone signal worth logging. belongsTo("ada","ada") is true; belongsTo("bob","ada") is false, preventing the account-confusion bug where any valid credential logs in whoever was named. usernameless(null) and usernameless(List.of()) are true; a non-empty list means the user was identified first.`,
hints:['Handle the both-zero case before comparing, or you will reject every synced passkey.','<code>return credentialOwner != null &amp;&amp; credentialOwner.equals(loginUser);</code>','<code>return allowCredentials == null || allowCredentials.isEmpty();</code>'],
solution:`import java.util.*;

public class Assertion {
    static boolean counterOk(long stored, long received) {
        // 0/0 means the authenticator does not implement counters — the common case
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
<p>Most account breaches are not clever exploits — they are <b>credential stuffing</b>: attackers take username/password pairs leaked from <i>other</i> sites and replay them against yours, betting that people reuse passwords. It is cheap, automated, and works alarmingly often. Related threats: <b>brute force</b> (guessing one account many times), <b>bot sign-ups</b> (fake/abusive accounts), and full <b>account takeover</b> (ATO).</p>
<p><b>Layered defenses, each aimed at a specific attack:</b></p>
<ul>
<li><b>Credential stuffing</b> → check new/changed passwords against <b>known-breached lists</b> (Have I Been Pwned, queried with k-anonymity so the password never leaves you) and require <b>MFA</b> — a leaked password alone then gets nowhere.</li>
<li><b>Brute force</b> → <b>rate limiting</b> and progressive lockout, keyed by account and by real client IP.</li>
<li><b>Bot sign-ups / automation</b> → bot detection (device and behavioral signals), and a <b>CAPTCHA</b> only as a last resort.</li>
<li><b>Account takeover</b> → anomaly / <b>risk-based</b> signals (new device, impossible travel, odd hour) that trigger <b>step-up</b> authentication, plus alerting.</li>
</ul>
<p>The through-line: assume passwords are already leaked, so make a stolen password insufficient (MFA), make automation expensive (rate limits + bot detection), and watch for anomalies (risk-based auth).</p>

<h4>Start from the attacker's economics</h4>
<p>Credential stuffing is not clever and it does not need to be. Billions of username/password pairs are
freely available, roughly two thirds of people reuse passwords, and a rented botnet makes the attempts cost
almost nothing. At a success rate of a fraction of a percent, an attacker replaying ten million pairs
against your login page still walks away with thousands of accounts.</p>
<p>Every defence below is an attempt to change one of three numbers: <b>the hit rate</b>, <b>the cost per
attempt</b>, or <b>the value of a hit</b>. Framing it that way is what stops the defences being a list of
disconnected features.</p>

<div class="codeSample" data-hl>MFA                     -> makes a HIT WORTHLESS. the single most
                           effective control, by a wide margin.
breached-password check -> lowers the HIT RATE at the source
rate limiting           -> raises the COST PER ATTEMPT
bot detection           -> raises the cost of automating at all
risk-based step-up      -> makes a hit CONDITIONAL on looking normal</div>

<h4>Rate limiting that actually works</h4>
<p>The obvious implementation — count failures per account — defends against brute force and does nothing
against stuffing, because the attacker tries <i>one</i> password against a million accounts. Two more
dimensions are needed.</p>
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
<p>You want to reject a password that appears in a known leak — and you must not send the password anywhere.
The <b>k-anonymity</b> approach solves it neatly: hash the password, send the <i>first five characters</i> of
the hash, receive every matching suffix, and compare locally. The service learns a bucket containing
hundreds of hashes and never learns which one you asked about.</p>
<p>Check at registration and at password change. Checking at <i>login</i> is also defensible — if an existing
password later appears in a leak, that user is now at risk — but it needs a plan for what you tell them,
because a forced reset with no explanation reads as a breach of your system.</p>

<h4>Detection, not just prevention</h4>
<p>The controls above are preventive. The signals that tell you an attack is <i>happening</i> are worth
alerting on independently: a sharp rise in the <b>failure rate</b>, a fall in the ratio of successes to
attempts, a surge in traffic to the login endpoint specifically, many accounts failing with the same
password, and a spike in password resets. Those are cheap to emit and they are the difference between
discovering a campaign during it and reading about it afterwards.</p>

<h4>Where CAPTCHA belongs</h4>
<p>Last, and reluctantly. It is an accessibility barrier, it measurably costs conversions, and solving
services price it in fractions of a cent — so it stops hobbyists and not funded attackers. Use it as a
conditional response to a risk signal, never as a gate on every login. The honest ordering is: <b>MFA
first</b>, because it makes stolen passwords worthless, and everything on this page is compensating for the
accounts that do not have it yet.`,
docs:[['Credential stuffing — OWASP','https://owasp.org/www-community/attacks/Credential_stuffing'],['Have I Been Pwned — k-anonymity','https://haveibeenpwned.com/API/v3#PwnedPasswords'],['Credential stuffing prevention — OWASP','https://cheatsheetseries.owasp.org/cheatsheets/Credential_Stuffing_Prevention_Cheat_Sheet.html']],
ex:{title:'Match the defense to the attack',
prompt:`Write class <code>AtoDefense</code> with <code>static String against(String attack)</code>: <code>"credential-stuffing"</code>→<code>"breached-password check + MFA"</code>, <code>"brute-force"</code>→<code>"rate limit + lockout"</code>, <code>"bot-signup"</code>→<code>"bot detection"</code>, <code>"account-takeover"</code>→<code>"risk-based step-up"</code>, and <code>"unknown"</code> otherwise.`,
starter:`public class AtoDefense {
    static String against(String attack) {
        return null;
    }
}`,
solution:`public class AtoDefense {
    static String against(String attack) {
        switch (attack) {
            case "credential-stuffing": return "breached-password check + MFA";
            case "brute-force":         return "rate limit + lockout";
            case "bot-signup":          return "bot detection";
            case "account-takeover":    return "risk-based step-up";
            default:                    return "unknown";
        }
    }
}`,
tests:[{d:'credential stuffing -> breached-password check + MFA',re:'"credential-stuffing".*?"breached-password check \\+ MFA"',flags:'s'},{d:'brute force -> rate limit + lockout',re:'"brute-force".*?"rate limit \\+ lockout"',flags:'s'},{d:'bot signup -> bot detection',re:'"bot-signup".*?"bot detection"',flags:'s'},{d:'account takeover -> risk-based step-up',re:'"account-takeover".*?"risk-based step-up"',flags:'s'},{d:'unknown default',re:'"unknown"'}],
behavior:`against("credential-stuffing") is "breached-password check + MFA"; against("brute-force") is "rate limit + lockout". The strategy assumes passwords are already leaked, so MFA + rate limits + anomaly detection carry the load.`,
hints:['Credential stuffing reuses leaked passwords, so block breached passwords and add MFA.','Brute force is stopped by rate limiting and lockout.','Account takeover is caught by risk-based signals that trigger step-up.']}}
]});
