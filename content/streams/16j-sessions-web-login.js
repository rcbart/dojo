STREAMS.push({icon:'🍪',iam:true,sec:'Sessions, cookies & web login',title:'Sessions, Cookies & Web Login Security',blurb:'How a browser stays logged in — and how that gets attacked. Cookies and their security flags, CSRF defenses, session fixation, where NOT to store tokens, and logout done properly (front- vs back-channel, revocation).',lessons:[

{id:'ss1',title:'Sessions & cookies: staying logged in',body:`
<p>HTTP is stateless — each request stands alone. A <b>session</b> bridges requests: on login the server creates a session and hands the browser a <b>cookie</b> holding an opaque session id. The browser returns that cookie on every request, and the server looks up who you are. (Token-based auth stores a signed token instead, but the cookie mechanics are the same.)</p>
<div class="codeSample">Set-Cookie: session=abc123        &lt;- server issues it on login
Cookie: session=abc123            &lt;- browser sends it back automatically</div>
<p>The session id must be long, random, and unguessable — it is the only thing standing between an attacker and your account. The next lessons harden the cookie that carries it.</p>`,
docs:[['HTTP cookies — MDN','https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies'],['Session management — OWASP','https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html']],
ex:{title:'Build a Set-Cookie value',
prompt:`Write class <code>Cookie</code> with <code>static String header(String name, String value)</code> that returns the cookie in the form <code>name=value</code> (name, then an equals sign, then value).`,
starter:`public class Cookie {
    static String header(String name, String value) {
        return null;
    }
}`,
solution:`public class Cookie {
    static String header(String name, String value) {
        return name + "=" + value;
    }
}`,
tests:[{d:'joins name and value with =',re:'name\\s*\\+\\s*"="\\s*\\+\\s*value'},{d:'does not return null',re:'return\\s+null\\s*;',not:true}],
behavior:`header("session","abc123") returns "session=abc123". This is the core of every Set-Cookie header before the security flags are added.`,
hints:['String concatenation with + builds the value.','The literal in the middle is the two-character string "=".','Order is name, then "=", then value.']}},

{id:'ss2',title:'Cookie security flags',body:`
<p>A session cookie without flags is a liability. Three flags do most of the defending:</p>
<ul>
<li><b>HttpOnly</b> — JavaScript cannot read the cookie, so a cross-site scripting (XSS) bug cannot steal the session.</li>
<li><b>Secure</b> — the cookie is sent only over HTTPS, never in cleartext.</li>
<li><b>SameSite</b> — controls whether the cookie rides along on cross-site requests. <code>Lax</code> is a sensible default; <code>Strict</code> is tightest; <code>None</code> (which requires Secure) is only for deliberate cross-site use. SameSite is a strong CSRF defense.</li>
</ul>
<div class="codeSample">Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax</div>`,
docs:[['SameSite cookies — MDN','https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite'],['Secure cookie attributes — OWASP','https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#cookies']],
ex:{title:'Harden the cookie',
prompt:`Write class <code>SecureCookie</code> with <code>static String build(String sid)</code> that returns <code>session=&lt;sid&gt;; HttpOnly; Secure; SameSite=Lax</code> — the session cookie with all three protective flags.`,
starter:`public class SecureCookie {
    static String build(String sid) {
        return null;
    }
}`,
solution:`public class SecureCookie {
    static String build(String sid) {
        return "session=" + sid + "; HttpOnly; Secure; SameSite=Lax";
    }
}`,
tests:[{d:'sets HttpOnly (blocks JS access)',re:'HttpOnly'},{d:'sets Secure (HTTPS only)',re:'Secure'},{d:'sets SameSite=Lax (CSRF defense)',re:'SameSite=Lax'},{d:'includes the session id',re:'"session="\\s*\\+\\s*sid'}],
behavior:`build("abc123") returns "session=abc123; HttpOnly; Secure; SameSite=Lax". HttpOnly blocks theft via XSS, Secure blocks cleartext leakage, and SameSite blocks most CSRF.`,
hints:['Concatenate the flags after the session value, separated by "; ".','The three flags are HttpOnly, Secure, and SameSite=Lax.','Only the session id is dynamic; the flags are fixed text.']}},

{id:'ss3',title:'CSRF: the confused-deputy attack',body:`
<p><b>CSRF</b> (Cross-Site Request Forgery) abuses the fact that browsers attach your cookies automatically. A malicious page can make <i>your</i> browser POST to your bank — and the bank sees a fully authenticated request it cannot tell apart from a real one. Your browser is the confused deputy.</p>
<p>Two defenses, best used together. <b>SameSite</b> cookies stop the cookie from being sent on cross-site requests. The <b>synchronizer token</b> pattern adds a secret, per-session token to each state-changing form; the server accepts the request only if the submitted token matches the one tied to the session. An attacker&#8217;s page cannot read that token, so it cannot forge a valid request.</p>`,
docs:[['CSRF — OWASP','https://owasp.org/www-community/attacks/csrf'],['CSRF prevention — OWASP','https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html']],
ex:{title:'Validate a CSRF token',
prompt:`Write class <code>Csrf</code> with <code>static boolean valid(String cookieToken, String formToken)</code> that returns true only when both tokens are non-null and equal (the synchronizer-token check).`,
starter:`public class Csrf {
    static boolean valid(String cookieToken, String formToken) {
        return false;
    }
}`,
solution:`public class Csrf {
    static boolean valid(String cookieToken, String formToken) {
        return cookieToken != null && cookieToken.equals(formToken);
    }
}`,
tests:[{d:'guards against a null token',re:'cookieToken\\s*!=\\s*null'},{d:'requires the tokens to match',re:'cookieToken\\.equals\\s*\\(\\s*formToken\\s*\\)'},{d:'combines both conditions',re:'&&'}],
behavior:`valid("t1","t1") is true; valid("t1","t2") is false; valid(null,null) is false. The attacker cannot read the session token, so it cannot submit a matching one.`,
hints:['Check for null before calling equals to avoid a NullPointerException.','Compare the two tokens with equals, not ==.','Both the null guard and the match must hold, so join them with &&.']}},

{id:'ss4',title:'Session fixation & token storage',body:`
<p>Two classic mistakes. <b>Session fixation</b>: an attacker plants a known session id in your browser before you log in, and if the server keeps that id after authentication, the attacker now shares your session. The fix is one line of discipline — <b>regenerate the session id at login</b> (and at privilege changes), so the pre-login id becomes useless.</p>
<p><b>Token storage in browsers</b>: it is tempting to keep an access token in <code>localStorage</code>, but anything JavaScript can read, an XSS bug can steal. The safer home for a session credential is an <b>HttpOnly cookie</b>, which script cannot touch. Rule of thumb: never put a bearer token where page JavaScript can read it.</p>`,
docs:[['Session fixation — OWASP','https://owasp.org/www-community/attacks/Session_fixation'],['Token storage — OWASP','https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#local-storage']],
ex:{title:'Choose safe token storage',
prompt:`Write class <code>Storage</code> with <code>static boolean safe(String place)</code> that returns true only for <code>"httponly-cookie"</code>, and false for browser-readable stores like <code>"localstorage"</code> or <code>"sessionstorage"</code>.`,
starter:`public class Storage {
    static boolean safe(String place) {
        return false;
    }
}`,
solution:`public class Storage {
    static boolean safe(String place) {
        return place.equals("httponly-cookie");
    }
}`,
tests:[{d:'an HttpOnly cookie is safe',re:'equals\\s*\\(\\s*"httponly-cookie"\\s*\\)'},{d:'does not bless localStorage',re:'"localstorage"',not:true}],
behavior:`safe("httponly-cookie") is true; safe("localstorage") and safe("sessionstorage") are false. Anything JavaScript can read is exposed to XSS, so an HttpOnly cookie wins.`,
hints:['Only one storage location is acceptable here.','Compare place with equals to the single safe value.','Everything not explicitly safe returns false.']}},

{id:'ss5',title:'Logout & session revocation',body:`
<p>Logging out must actually <b>end</b> the session server-side, not just delete the cookie — a stolen id is worthless only once the server forgets it. Remove the session from the store (or add its token to a denylist) so any further use is rejected.</p>
<p>In SSO the picture is bigger. <b>Front-channel logout</b> uses the browser to notify each app (hidden iframes/redirects) that the shared session ended; <b>back-channel logout</b> has the identity provider call each app server-to-server, which is more reliable because it does not depend on the browser being open. Either way, the goal is the same: one logout invalidates the sessions everywhere.</p>`,
docs:[['Logout — OIDC','https://openid.net/specs/openid-connect-rpinitiated-1_0.html'],['Back-channel logout — OIDC','https://openid.net/specs/openid-connect-backchannel-1_0.html']],
ex:{title:'Revoke a session',
prompt:`Write class <code>Logout</code> with <code>static boolean revoke(java.util.Set&lt;String&gt; active, String sid)</code> that removes <code>sid</code> from the set of active sessions and returns true when the session is no longer active afterward.`,
starter:`import java.util.Set;
public class Logout {
    static boolean revoke(Set<String> active, String sid) {
        return false;
    }
}`,
solution:`import java.util.Set;
public class Logout {
    static boolean revoke(Set<String> active, String sid) {
        active.remove(sid);
        return !active.contains(sid);
    }
}`,
tests:[{d:'removes the session id from the active set',re:'active\\.remove\\s*\\(\\s*sid\\s*\\)'},{d:'confirms it is gone',re:'!\\s*active\\.contains\\s*\\(\\s*sid\\s*\\)'}],
behavior:`Given an active set containing "s1", revoke(active,"s1") removes it and returns true; the server will now reject that id. Deleting only the browser cookie would not achieve this.`,
hints:['Set has a remove method that deletes the element.','After removing, contains(sid) should be false.','Return the negation of contains to confirm the session is gone.']}},

]});
