STREAMS.push({icon:'🏗️',iam:true,sec:'Capstone project',title:'Identity Capstone',blurb:'Put the whole identity domain together: build the core of a secure auth service step by step — registration, token validation, sessions, authorization, refresh rotation, and the end-to-end request flow.',lessons:[

{id:'idcap',title:'Capstone: build a secure auth service',body:`
<p>This capstone ties the identity domain into one coherent build. You will implement the core pieces
of a small but real auth service, one component per exercise below, each graded on its own. Together
they form the request lifecycle every identity system runs:</p>
<div class="codeSample">register ──▶ hash the password (never store plaintext)
login    ──▶ verify, then issue tokens (access + refresh)
request  ──▶ validate the access token (iss / aud / exp), then authorize the action
refresh  ──▶ rotate the refresh token; detect reuse
logout   ──▶ revoke the session</div>
<p>Each step reuses a concept from earlier in the track — password hashing, token validation, sessions,
RBAC, refresh-token rotation — so finishing all six is a working mental model of a production login
system. Work through the exercises in order; the final one wires the flow together.</p>

<h4>What you are actually building</h4>
<p>Each exercise below is one component of the same service, and the reason they are worth building in
sequence is that <b>the hard parts live in the joins</b>, not in the pieces. Hashing a password is a
library call. Deciding what happens when a refresh token is replayed, or what "log out" means when the
access token is self-contained, is design — and those decisions only surface once the pieces sit next to
each other.</p>

<h4>The decisions to make deliberately</h4>
<ul>
<li><b>Password storage</b> — a memory-hard algorithm (Argon2id, scrypt, bcrypt), a per-user salt, and
parameters you can raise later. Never a general-purpose hash, however many rounds.</li>
<li><b>Token shape</b> — self-contained JWT or opaque reference? The JWT scales and cannot be revoked
promptly; the opaque token revokes instantly and costs a lookup per request. Pick one and be able to
defend it.</li>
<li><b>Lifetimes</b> — minutes for the access token, longer for the refresh token, and a bound on the
whole session regardless of activity.</li>
<li><b>Reuse detection</b> — when a rotated refresh token is presented twice, revoke the entire family.
That is the part that converts a silent compromise into a detectable one.</li>
<li><b>Revocation</b> — decide up front how a session dies before its expiry, because retrofitting it is
painful.</li>
</ul>
<p>Work through the exercises in order; the final one wires the flow together. If you can explain each
choice above to someone else, the capstone has done its job better than any grader can measure.`,
docs:[['OAuth 2.0 Security BCP','https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics'],['OWASP Authentication Cheat Sheet','https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html']],
exs:[
{title:'1 · Registration',
prompt:`Write class <code>Register</code> with <code>static boolean validPassword(String pw)</code> (true only when <code>pw</code> is non-null and at least 12 characters) and <code>static String hashAlgo()</code> returning <code>"argon2id"</code>. Never choose a fast hash like MD5/SHA-256 for passwords.`,
starter:`public class Register {
    static boolean validPassword(String pw) {
        return false;
    }
    static String hashAlgo() {
        return null;
    }
}`,
solution:`public class Register {
    static boolean validPassword(String pw) {
        return pw != null && pw.length() >= 12;
    }
    static String hashAlgo() {
        return "argon2id";
    }
}`,
tests:[{d:'rejects null and enforces length >= 12',re:'pw\\s*!=\\s*null\\s*&&\\s*pw\\.length\\s*\\(\\s*\\)\\s*>=\\s*12'},{d:'uses a slow password hash (argon2id)',re:'return\\s+"argon2id"'},{d:'does not use a fast general-purpose hash',re:'"(md5|sha-?256)"',not:true,flags:'i'}],
behavior:`validPassword("short") is false; validPassword("correcthorsebattery") is true; hashAlgo() is "argon2id". Passwords are always stored as a slow, salted hash — never plaintext.`,
hints:['Guard null before length so it never throws.','argon2id is the modern default; MD5/SHA-256 are too fast for passwords.','Length beats complexity — 12+ characters.']},

{title:'Validate the access token',lang:'js',
run:{call:'valid',cases:[{name:'right issuer, right audience, unexpired',args:['https://auth.dojo.dev','dojo-api',2000,1000],expect:true},{name:'a token from another issuer',args:['https://evil.example','dojo-api',2000,1000],expect:false},{name:'a token for another service',args:['https://auth.dojo.dev','billing-api',2000,1000],expect:false},{name:'expired',args:['https://auth.dojo.dev','dojo-api',900,1000],expect:false},{name:'expiring exactly now is expired',args:['https://auth.dojo.dev','dojo-api',1000,1000],expect:false}]},
prompt:`Write <code>function valid(iss, aud, exp, now)</code> that accepts a token only when the issuer is exactly <code>"https://auth.dojo.dev"</code>, the audience is exactly <code>"dojo-api"</code>, and <code>exp &gt; now</code>. Return <code>false</code> as soon as any check fails.`,
starter:`function valid(iss, aud, exp, now) {
  return false;
}`,
solution:`function valid(iss, aud, exp, now) {
  if (iss !== "https://auth.dojo.dev") return false;   // trusted issuer?
  if (aud !== "dojo-api") return false;                // meant for US?
  return exp > now;                                    // still alive?
}`,
tests:[{d:'the issuer must be the one you trust',re:'"https://auth\\.dojo\\.dev"'},{d:'the audience must be this API',re:'"dojo-api"'},{d:'the token must not have expired',re:'exp\\s*>\\s*now'}],
behavior:`Five cases run against your function, including the audience case that most implementations skip and the exact-expiry boundary. A token minted by your own issuer for a different service must be rejected here — that single check is what stops one compromised service reaching every other one.`,
hints:['Three checks: issuer, audience, expiry.','Compare strings with === (or !== to fail fast).','Expiry is strict: exp must be greater than now.']},

{title:'3 · Sessions: revoke on logout',
prompt:`Write class <code>Sessions</code> with <code>static boolean revoke(java.util.Set&lt;String&gt; live, String sid)</code> that removes <code>sid</code> from the set of live sessions and returns true when it is no longer present.`,
starter:`import java.util.Set;
public class Sessions {
    static boolean revoke(Set<String> live, String sid) {
        return false;
    }
}`,
solution:`import java.util.Set;
public class Sessions {
    static boolean revoke(Set<String> live, String sid) {
        live.remove(sid);
        return !live.contains(sid);
    }
}`,
tests:[{d:'removes the session server-side',re:'live\\.remove\\s*\\(\\s*sid\\s*\\)'},{d:'confirms it is gone',re:'!\\s*live\\.contains\\s*\\(\\s*sid\\s*\\)'}],
behavior:`revoke(liveWith("s1"),"s1") removes it and returns true. Logout must end the session on the server, not just delete the browser cookie.`,
hints:['Set has a remove method.','After removing, contains(sid) should be false.','Return the negation of contains.']},

{title:'4 · Authorization (RBAC)',
prompt:`Write class <code>Access</code> with <code>static boolean can(java.util.Set&lt;String&gt; roles, String required)</code> that allows the action when the user has the <code>"admin"</code> role <b>or</b> holds the specific <code>required</code> role.`,
starter:`import java.util.Set;
public class Access {
    static boolean can(Set<String> roles, String required) {
        return false;
    }
}`,
solution:`import java.util.Set;
public class Access {
    static boolean can(Set<String> roles, String required) {
        return roles.contains("admin") || roles.contains(required);
    }
}`,
tests:[{d:'admin can do anything',re:'roles\\.contains\\s*\\(\\s*"admin"\\s*\\)'},{d:'or the specific required role',re:'\\|\\|\\s*roles\\.contains\\s*\\(\\s*required\\s*\\)'}],
behavior:`can(rolesOf("admin"),"delete") is true; can(rolesOf("editor"),"editor") is true; can(rolesOf("viewer"),"delete") is false. Least privilege plus an admin escape hatch.`,
hints:['admin is a superuser role.','Otherwise the user must hold the exact required role.','Combine with ||.']},

{title:'Detect refresh token reuse',lang:'js',
run:{call:'onUse',cases:[{name:'the current token rotates normally',args:[true],expect:'rotate'},{name:'a retired token means someone is replaying',args:[false],expect:'revoke-family'}]},
prompt:`Write <code>function onUse(isCurrent)</code> that returns <code>"rotate"</code> when the presented refresh token is the current one, and <code>"revoke-family"</code> when it is not — because a reused token means someone is replaying, and the server cannot tell which party is the thief.`,
starter:`function onUse(isCurrent) {
  return null;
}`,
solution:`function onUse(isCurrent) {
  // not "reject": the whole FAMILY dies, including the legitimate holder
  return isCurrent ? "rotate" : "revoke-family";
}`,
tests:[{d:'the current token rotates',re:'"rotate"'},{d:'a reused token revokes the whole family',re:'"revoke-family"'}],
behavior:`Both paths are executed. The point of the second is that rejecting only the replayed token is not enough — the server cannot distinguish thief from victim, so every token descended from the same original grant must die. The legitimate user is logged out too, and that is the accepted trade.`,
hints:['A single ternary covers both cases.','Rotation issues a new token and retires the old one.','Reuse is not a rejection, it is a revocation of everything in the chain.']},

{title:'6 · Wire the request flow',
prompt:`Write class <code>Auth</code> with <code>static String step(String phase)</code>: <code>"register"</code>→<code>"hash password"</code>, <code>"login"</code>→<code>"issue tokens"</code>, <code>"request"</code>→<code>"validate token and authorize"</code>, <code>"logout"</code>→<code>"revoke session"</code>, else <code>"unknown"</code>.`,
starter:`public class Auth {
    static String step(String phase) {
        return null;
    }
}`,
solution:`public class Auth {
    static String step(String phase) {
        switch (phase) {
            case "register": return "hash password";
            case "login":    return "issue tokens";
            case "request":  return "validate token and authorize";
            case "logout":   return "revoke session";
            default:         return "unknown";
        }
    }
}`,
tests:[{d:'register hashes the password',re:'"register".*?"hash password"',flags:'s'},{d:'login issues tokens',re:'"login".*?"issue tokens"',flags:'s'},{d:'request validates then authorizes',re:'"request".*?"validate token and authorize"',flags:'s'},{d:'logout revokes the session',re:'"logout".*?"revoke session"',flags:'s'},{d:'unknown default',re:'"unknown"'}],
behavior:`step("register") is "hash password", step("login") is "issue tokens", step("request") is "validate token and authorize", step("logout") is "revoke session". That is the whole auth lifecycle you just built, in order.`,
hints:['A switch mapping each phase to its action.','The order is register, login, request, logout.','Anything else is unknown.']}
]}

]});
