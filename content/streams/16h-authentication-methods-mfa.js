STREAMS.push({icon:'🔑',iam:true,sec:'Authentication & MFA',title:'Authentication Methods & MFA',blurb:'How people actually prove who they are: password hashing done right, the three factor types, TOTP one-time codes, phishing-resistant passkeys (WebAuthn/FIDO2), and step-up/adaptive authentication for risky actions.',lessons:[

{id:'am1',title:'Passwords, done right',body:`
<p>A password is a shared secret, and the one rule that matters is: <b>never store it</b>. Store a slow, salted <i>hash</i>. If the database leaks, attackers get hashes they must crack one guess at a time, not a ready-made login list.</p>
<p>Use a purpose-built password hash — <b>Argon2id</b> (first choice today), <b>scrypt</b>, or <b>bcrypt</b>. They are deliberately slow and memory-hard, which is a feature. Never use fast, general-purpose hashes like MD5 or SHA-256 for passwords: a GPU tries billions of those per second.</p>
<div class="codeSample" data-hl>// pseudocode — a real app calls a library (e.g. Spring Security's Argon2PasswordEncoder)
String hash = argon2id(password, randomSalt);   // store hash + params; never the password
boolean ok  = argon2Verify(entered, hash);       // constant-time compare inside</div>
<p>Alongside hashing, enforce a sane <b>policy</b>: length beats complexity (aim for 12+), and check new passwords against known-breached lists (credential stuffing reuses leaked passwords). Length is the cheapest security you can buy.</p>`,
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
<p>Strong MFA combines factors from different categories, so stealing one (a leaked password) is not enough. Not all second factors are equal: SMS codes can be SIM-swapped or phished, app-based one-time codes are better, and phishing-resistant passkeys (next lessons) are best.</p>`,
docs:[['MFA — NIST 800-63B','https://pages.nist.gov/800-63-3/sp800-63b.html'],['MFA overview — OWASP','https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html']],
ex:{title:'Classify the factor',
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
String code  = truncate6(hmacSha1(secret, counter));</div>`,
docs:[['TOTP (RFC 6238)','https://www.rfc-editor.org/rfc/rfc6238'],['HOTP (RFC 4226)','https://www.rfc-editor.org/rfc/rfc4226']],
ex:{title:'Compute the TOTP counter',
prompt:`Write class <code>Totp</code> with <code>static long counter(long epochSeconds, long stepSeconds)</code> that returns the time-step counter — <code>epochSeconds</code> divided by <code>stepSeconds</code> (integer division). This is the moving number both sides hash.`,
starter:`public class Totp {
    static long counter(long epochSeconds, long stepSeconds) {
        return 0;
    }
}`,
solution:`public class Totp {
    static long counter(long epochSeconds, long stepSeconds) {
        return epochSeconds / stepSeconds;
    }
}`,
tests:[{d:'returns epochSeconds / stepSeconds',re:'return\\s+epochSeconds\\s*/\\s*stepSeconds'},{d:'does not return the constant 0',re:'return\\s+0\\s*;',not:true}],
behavior:`counter(0, 30) is 0, counter(59, 30) is 1, counter(60, 30) is 2. Integer division floors to the current 30-second window, which both client and server compute identically from the shared clock.`,
hints:['Integer division of two longs floors automatically, which is exactly the time window you want.','The whole method body is a single return of epochSeconds / stepSeconds.','A step of 30 means the counter increments twice per minute.']}},

{id:'am4',title:'Passkeys: WebAuthn & FIDO2',body:`
<p>Passwords and even one-time codes can be <b>phished</b>: a fake site relays whatever you type. Passkeys close that hole. Built on <b>WebAuthn</b> and <b>FIDO2</b>, a passkey is a public/private key pair created per site. Your device keeps the private key (in secure hardware or synced through your platform) and only ever signs a challenge; the site stores the matching public key.</p>
<p>Two properties make passkeys <b>phishing-resistant</b>. First, the signature is <b>origin-bound</b> — the browser ties it to the real site, so a look-alike domain gets a signature it cannot use. Second, the secret <b>never leaves the device</b> and is never typed, so there is nothing to relay or paste into a fake form. A security key (a FIDO2 hardware token) works the same way.</p>`,
docs:[['WebAuthn — W3C','https://www.w3.org/TR/webauthn-2/'],['Passkeys — FIDO Alliance','https://fidoalliance.org/passkeys/']],
ex:{title:'Which methods resist phishing?',
prompt:`Write class <code>Passkey</code> with <code>static boolean phishingResistant(String method)</code> that returns true only for origin-bound, hardware-backed methods — <code>"passkey"</code> and <code>"security-key"</code> — and false for everything else (like <code>"password"</code>, <code>"sms"</code>, or <code>"totp"</code>).`,
starter:`public class Passkey {
    static boolean phishingResistant(String method) {
        return false;
    }
}`,
solution:`public class Passkey {
    static boolean phishingResistant(String method) {
        return method.equals("passkey") || method.equals("security-key");
    }
}`,
tests:[{d:'passkey is phishing-resistant',re:'equals\\s*\\(\\s*"passkey"\\s*\\)'},{d:'security-key is phishing-resistant',re:'equals\\s*\\(\\s*"security-key"\\s*\\)'},{d:'combines the two with OR',re:'\\|\\|'},{d:'does not mark sms as resistant',re:'"sms"',not:true}],
behavior:`phishingResistant("passkey") and phishingResistant("security-key") are true; phishingResistant("sms"), ("totp"), and ("password") are false. The winning trait is that the secret is origin-bound and never typed.`,
hints:['Two allowed values joined by || is enough.','Call method.equals("passkey") and method.equals("security-key").','Everything not explicitly allowed should return false.']}},

{id:'am5',title:'Step-up & adaptive authentication',body:`
<p>Not every action deserves the same friction. <b>Step-up authentication</b> lets a user in with one factor for ordinary work, then demands stronger or fresh proof right before a sensitive action — moving money, changing an email, deleting an account.</p>
<p><b>Adaptive (risk-based)</b> auth decides <i>when</i> to step up by scoring signals: a new device, a new country, an impossible-travel jump, an unusual hour. Low risk stays frictionless; high risk triggers re-authentication or MFA. The rule of thumb: match the assurance to the value and risk of the action, and treat a recent successful auth as a short-lived pass that expires.</p>`,
docs:[['Step-up authentication — Auth0','https://auth0.com/docs/secure/multi-factor-authentication/step-up-authentication'],['Risk-based auth — NIST 800-63B','https://pages.nist.gov/800-63-3/sp800-63b.html']],
ex:{title:'Decide when to step up',
prompt:`Write class <code>StepUp</code> with <code>static boolean required(String action, boolean recentlyAuthed)</code> that returns true when the action is sensitive — <code>"transfer"</code> or <code>"change-email"</code> — <b>and</b> the user has not recently authenticated. Ordinary actions, or sensitive ones right after a fresh auth, do not require step-up.`,
starter:`public class StepUp {
    static boolean required(String action, boolean recentlyAuthed) {
        return false;
    }
}`,
solution:`public class StepUp {
    static boolean required(String action, boolean recentlyAuthed) {
        boolean sensitive = action.equals("transfer") || action.equals("change-email");
        return sensitive && !recentlyAuthed;
    }
}`,
tests:[{d:'transfer counts as sensitive',re:'equals\\s*\\(\\s*"transfer"\\s*\\)'},{d:'change-email counts as sensitive',re:'equals\\s*\\(\\s*"change-email"\\s*\\)'},{d:'requires NOT recently authenticated',re:'!\\s*recentlyAuthed'},{d:'combines sensitivity AND freshness',re:'&&'}],
behavior:`required("transfer", false) is true; required("transfer", true) is false (a fresh auth just happened); required("view", false) is false (not sensitive). Assurance is matched to the risk of the action.`,
hints:['Compute a sensitive flag first from the two high-risk actions joined by ||.','Step-up is needed only when sensitive is true AND recentlyAuthed is false.','Use the ! operator to express not recently authenticated.']}},
,
{id:'am6',title:'Identity assurance levels: IAL, AAL, FAL',body:`
<p>How much should you trust that a user is who they claim? NIST 800-63 answers with <b>three independent scales</b>, so you can dial each to the risk of the action rather than treating "identity" as one thing.</p>
<ul>
<li><b>IAL — Identity Assurance Level</b> (proofing): how strongly the <i>real-world identity</i> was verified at enrollment. IAL1 = self-asserted (no proofing); IAL2 = remote or in-person evidence checked; IAL3 = in-person, supervised.</li>
<li><b>AAL — Authenticator Assurance Level</b> (login): how strong the <i>authentication</i> is. AAL1 = single factor; AAL2 = MFA; AAL3 = hardware-based, phishing-resistant (a security key/passkey with verifier binding).</li>
<li><b>FAL — Federation Assurance Level</b> (assertion): how strongly the <i>federated assertion</i> is protected. FAL1 = signed; FAL2 = signed and encrypted; FAL3 = holder-of-key (the assertion is bound to a key the presenter must prove).</li>
</ul>
<p>The point is to <b>match assurance to risk</b>: reading public docs might need only IAL1/AAL1, while moving money needs high AAL (step-up to MFA or a passkey) and, for a regulated identity, higher IAL. The three scales are independent — you can have a strongly proofed identity (high IAL) logging in weakly (low AAL), which is itself a risk to notice.</p>`,
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
<p>Good recovery hygiene: reset tokens that are <b>single-use, short-lived, and unpredictable</b>; delivered over a verified channel; rate-limited; and every reset <b>notifies the user</b>. Passwordless does not remove recovery — if a device is lost you still need a way back in, so provide <b>backup passkeys or one-time recovery codes</b> rather than dropping to a weak email OTP.</p>`,
docs:[['Passwordless — FIDO/passkeys','https://fidoalliance.org/passkeys/'],['Forgot-password / recovery — OWASP','https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html']],
ex:{title:'A safe reset token & the best method',
prompt:`Write class <code>Recovery</code> with <code>static boolean acceptableResetToken(boolean singleUse, boolean shortLived, boolean unpredictable)</code> that is true only when all three hold, and <code>static String preferred()</code> returning <code>"passkey"</code> (the strongest passwordless method).`,
starter:`public class Recovery {
    static boolean acceptableResetToken(boolean singleUse, boolean shortLived, boolean unpredictable) {
        return false;
    }
    static String preferred() {
        return null;
    }
}`,
solution:`public class Recovery {
    static boolean acceptableResetToken(boolean singleUse, boolean shortLived, boolean unpredictable) {
        return singleUse && shortLived && unpredictable;
    }
    static String preferred() {
        return "passkey";
    }
}`,
tests:[{d:'reset token must be single-use, short-lived and unpredictable',re:'singleUse\\s*&&\\s*shortLived\\s*&&\\s*unpredictable'},{d:'the strongest passwordless method is a passkey',re:'return\\s+"passkey"'}],
behavior:`acceptableResetToken(true,true,true) is true; if the token is reusable, long-lived, or guessable it is false. preferred() returns "passkey". The recovery flow must be as strong as login, or it becomes the way in.`,
hints:['A reset token should be single-use, short-lived, and unpredictable — combine with &&.','Recovery must be at least as strong as primary login; knowledge-based questions are weak.','Passkeys are the strongest passwordless method; provide backup codes for lost devices.']}}
]});
