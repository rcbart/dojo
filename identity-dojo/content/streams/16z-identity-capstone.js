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
system. Work through the exercises in order; the final one wires the flow together.</p>`,
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

{title:'2 · Login: validate the access token',
prompt:`Write class <code>Tokens</code> with <code>static boolean valid(String iss, String aud, long exp, long now)</code> that accepts a token only when <code>iss</code> equals <code>"https://issuer"</code>, <code>aud</code> equals <code>"api"</code>, and <code>exp</code> is strictly greater than <code>now</code>.`,
starter:`public class Tokens {
    static boolean valid(String iss, String aud, long exp, long now) {
        return false;
    }
}`,
solution:`public class Tokens {
    static boolean valid(String iss, String aud, long exp, long now) {
        return iss.equals("https://issuer") && aud.equals("api") && exp > now;
    }
}`,
tests:[{d:'checks the issuer',re:'iss\\.equals\\s*\\(\\s*"https://issuer"\\s*\\)'},{d:'checks the audience is this API',re:'aud\\.equals\\s*\\(\\s*"api"\\s*\\)'},{d:'rejects expired tokens',re:'exp\\s*>\\s*now'}],
behavior:`valid("https://issuer","api",100,50) is true; a wrong audience or an expired token is false. Signature verification happens first in a real system; these are the claim checks that must never be skipped.`,
hints:['All three conditions joined by &&.','Use equals for the string claims.','Not expired means exp is still in the future.']},

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

{title:'5 · Refresh-token rotation',
prompt:`Write class <code>Refresh</code> with <code>static String onUse(boolean isCurrent)</code> returning <code>"rotate"</code> when the presented refresh token is the current one, and <code>"revoke-family"</code> when it is an old (already-rotated) token — the reuse-detection response.`,
starter:`public class Refresh {
    static String onUse(boolean isCurrent) {
        return null;
    }
}`,
solution:`public class Refresh {
    static String onUse(boolean isCurrent) {
        return isCurrent ? "rotate" : "revoke-family";
    }
}`,
tests:[{d:'current rotates, old triggers family revocation',re:'isCurrent\\s*\\?\\s*"rotate"\\s*:\\s*"revoke-family"'}],
behavior:`onUse(true) is "rotate" (issue a new refresh token, invalidate the old); onUse(false) is "revoke-family" — a replayed old token means compromise, so kill the whole session lineage.`,
hints:['A single ternary on isCurrent.','Reusing an old token is the compromise signal.','Revoking the family forces a fresh login.']},

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
