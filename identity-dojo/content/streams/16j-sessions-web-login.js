STREAMS.push({icon:'🍪',iam:true,sec:'Sessions, cookies & web login',title:'Sessions, Cookies & Web Login Security',blurb:'How a browser stays logged in — and how that gets attacked. Cookies and their security flags, CSRF defenses, session fixation, where NOT to store tokens, and logout done properly (front- vs back-channel, revocation).',lessons:[

{id:'ss1',title:'Sessions & cookies: staying logged in',body:`
<p>HTTP is stateless — each request stands alone. A <b>session</b> bridges requests: on login the server creates a session and hands the browser a <b>cookie</b> holding an opaque session id. The browser returns that cookie on every request, and the server looks up who you are. (Token-based auth stores a signed token instead, but the cookie mechanics are the same.)</p>
<div class="codeSample">Set-Cookie: session=abc123        &lt;- server issues it on login
Cookie: session=abc123            &lt;- browser sends it back automatically</div>
<p>The session id must be long, random, and unguessable — it is the only thing standing between an attacker and your account. The next lessons harden the cookie that carries it.</p>

<h4>What the server has to keep</h4>
<div class="codeSample" data-hl>SERVER-SIDE SESSION            the cookie holds only an opaque id
  session:8f3a -> { sub:"ada", authAt:..., amr:["pwd","otp"], csrf:"..." }
  + instant revocation, small cookie, claims never leave the server
  - the server must remember every session (state, and shared state at scale)

CLIENT-SIDE SESSION            the cookie holds the SIGNED claims themselves
  + no server storage, any node can serve any request
  - cannot revoke before expiry; every claim is readable by the user;
    a 4KB cookie limit arrives sooner than you expect</div>
<p>This is the sessions-versus-tokens trade from Foundations, appearing again one level down. The
practical middle ground most teams land on: a server-side session for the browser, short-lived, with the
store in something shared and fast.</p>

<h4>The properties that make a session id safe</h4>
<p><b>Entropy</b> — at least 128 bits from a cryptographic RNG, never a counter, a hash of the username,
or anything derived from time. <b>Opacity</b> — it should mean nothing; if an attacker can infer
structure they can hunt for valid ids. And <b>rotation on privilege change</b>: issue a new id at login
and at any elevation, which is what defeats fixation in the next lesson.</p>

<h4>Two lifetimes, not one</h4>
<p>An <b>idle timeout</b> ends a session after inactivity; an <b>absolute lifetime</b> ends it regardless.
You want both — idle alone means a session kept warm by a background tab lives forever. And record
<code>authAt</code>: knowing <i>when</i> the user last actually authenticated is what lets you demand
re-authentication before something irreversible, rather than trusting a session that began nine hours
ago.</p>`,
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
<div class="codeSample">Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax</div>

<h4>What each flag actually stops</h4>
<div class="codeSample" data-hl>HttpOnly     JavaScript cannot read document.cookie for it.
             stops XSS from EXFILTRATING the session. does NOT stop XSS
             from USING it - injected script can still make requests.

Secure       never sent over plain http. without it, one http request on a
             cafe network hands over the session in cleartext.

SameSite     controls whether the cookie rides along on CROSS-SITE requests.
  Lax        (default in modern browsers) sent on top-level GET navigation,
             not on cross-site POST or subresource requests
  Strict     never sent cross-site - even following a link from your own
             email, so the user arrives logged OUT
  None       always sent - REQUIRES Secure. needed for genuine cross-site
             embedding, and it is the setting that reopens CSRF

Path/Domain  scope. Domain=example.com shares the cookie with EVERY
             subdomain, including one a colleague spun up. widen deliberately.

Max-Age      absent = session cookie, dies with the browser process.
__Host-      a name PREFIX the browser enforces: Secure, Path=/, no Domain.
             the strongest binding available, and free.</div>

<h4>The judgement calls</h4>
<p><b>Lax versus Strict</b> is a real trade, not a "more secure is better" choice. Strict breaks the
ordinary case of arriving from an external link and finding yourself logged out — which pushes users
toward "remember me forever" settings that are worse. Lax is the sensible default; use Strict for
genuinely sensitive apps where the friction is acceptable.</p>
<p><b>SameSite is not a complete CSRF defence.</b> It is a strong mitigation that arrived recently, is
enforced by the browser rather than your server, and does nothing for same-site attacks. Keep the
synchronizer token as well — defence in depth, and the next lesson covers why.</p>
<p><b>Domain is the flag that quietly widens blast radius.</b> Setting <code>Domain=example.com</code>
to share a session between <code>app.</code> and <code>www.</code> also shares it with
<code>staging.</code>, <code>legacy.</code> and anything else on the domain. An XSS on the least
important subdomain then reaches the most important session. Prefer host-only cookies and
<code>__Host-</code> unless sharing is a deliberate requirement.</p>`,
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
<p>Two defenses, best used together. <b>SameSite</b> cookies stop the cookie from being sent on cross-site requests. The <b>synchronizer token</b> pattern adds a secret, per-session token to each state-changing form; the server accepts the request only if the submitted token matches the one tied to the session. An attacker&#8217;s page cannot read that token, so it cannot forge a valid request.</p>

<h4>Why it works at all</h4>
<p>The mechanism people miss: the browser attaches your cookies to a request <b>based on where the
request is going, not where it came from</b>. So a form on <code>evil.example</code> that posts to
<code>bank.example/transfer</code> arrives fully authenticated. The attacker never sees the response and
never needs to — the side effect is the attack.</p>
<div class="codeSample" data-hl>&lt;!-- on evil.example, auto-submitted --&gt;
&lt;form action="https://bank.example/transfer" method="POST"&gt;
  &lt;input name="to" value="attacker"&gt;&lt;input name="amount" value="5000"&gt;
&lt;/form&gt;

the browser: "a POST to bank.example? here are bank.example's cookies."
the server:  "valid session, valid user."   <- authenticated, not authorised BY the user</div>
<p>That is why it is the <b>confused deputy</b>: your server is the deputy, correctly acting on
credentials it holds, tricked into acting for someone else's intent.</p>

<h4>The defences, and what each assumes</h4>
<ul>
<li><b>Synchronizer token.</b> A random value in the form and in the session; the server compares them.
Works because an attacker's page <i>cannot read</i> your token — the same-origin policy forbids it.</li>
<li><b>Double-submit cookie.</b> Same token in a cookie and a form field, compared without server state.
Convenient, and weaker: a subdomain you do not control can set cookies on the parent domain.</li>
<li><b>SameSite.</b> Browser-enforced, and the reason CSRF has receded. But it is a browser default, not
a guarantee you control.</li>
<li><b>Origin / Referer check.</b> Cheap and effective for JSON APIs.</li>
</ul>

<h4>Three things that are not defences</h4>
<p><b>Requiring POST.</b> A form posts. <b>Checking Content-Type alone.</b> Forms can send
<code>text/plain</code>. <b>A secret in the URL.</b> It leaks through referrers and history.</p>

<h4>When it does not apply</h4>
<p>CSRF is an attack on <b>ambient credentials</b> — anything the browser attaches automatically. An API
that authenticates with an <code>Authorization: Bearer</code> header is not vulnerable, because nothing
attaches that header for you. This is precisely the trade the BFF pattern makes: moving tokens out of
the browser removes token theft and reintroduces CSRF, because you are back on cookies.</p>`,
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
<p><b>Token storage in browsers</b>: it is tempting to keep an access token in <code>localStorage</code>, but anything JavaScript can read, an XSS bug can steal. The safer home for a session credential is an <b>HttpOnly cookie</b>, which script cannot touch. Rule of thumb: never put a bearer token where page JavaScript can read it.</p>

<h4>Fixation, precisely</h4>
<p>The attacker does not steal a session — they <b>supply</b> one. They obtain a valid session id, plant
it in the victim's browser (a link with the id, a subdomain setting the cookie, an XSS), and wait for the
victim to log in. If the server keeps the same id across the login, the attacker's pre-known id is now an
authenticated session.</p>
<div class="codeSample" data-hl>// the entire fix, and it is one line in the right place
onLogin(user) {
    session.invalidate();          // discard whatever id arrived
    session = newSession();        // fresh, unguessable id
    session.user = user;
}
// rotate again on ANY privilege elevation: step-up auth, entering admin mode,
// switching tenant. the id must never outlive the trust level it was issued at.</div>

<h4>Storage, ranked</h4>
<div class="codeSample" data-hl>HttpOnly cookie     script cannot read it. best available in a browser.
in-memory variable  gone on refresh; readable by injected script while open
sessionStorage      readable by any script; survives reload
localStorage        readable by any script; survives restarts. the worst.</div>
<p>The rule underneath: <b>if your code can read it, injected script can read it.</b> No amount of
obfuscation changes that, and no framework "secure storage" helper in a browser is meaningfully more
private than the others.</p>
<p>The honest ranking of outcomes: an HttpOnly cookie means XSS can <i>act</i> as the user while the page
is open; localStorage means XSS <i>walks away with</i> a credential usable from anywhere until it
expires. Same vulnerability, very different blast radius — which is the entire argument for the BFF
pattern.</p>

<h4>The three moments a session id must change</h4>
<p>Regeneration is not only a login concern. The id should be replaced at <b>authentication</b>, at any
<b>privilege change</b> (assuming a role, entering an admin area, completing step-up), and the old session
must be <b>destroyed server-side at logout</b> rather than merely forgotten by the browser.</p>
<p>That last one is the quiet failure: clearing the cookie ends the session for a cooperative user and does
nothing to a stolen copy, which continues to work until it expires. Logout has to invalidate state on the
server or it is a visual effect.</p>

<h4>Two clocks, not one</h4>
<p>A session needs an <b>idle timeout</b> (inactive for N minutes) and an <b>absolute lifetime</b> (valid
for at most N hours regardless of activity). Idle timeout alone means a stolen session that is kept warm by
the attacker never expires at all — the absolute lifetime is what bounds that, and it is the one people
omit because it occasionally logs out an active user.</p>

<h4>Storage, ranked honestly</h4>
<p>In descending order of safety: an <b>HttpOnly, Secure, SameSite</b> cookie that page script cannot read;
a token held only in <b>JavaScript memory</b>, which is lost on refresh but never written anywhere an
attacker can read later; <b>sessionStorage</b>; and <b>localStorage</b>, which persists and is readable by
any script that runs on the page.</p>
<p>The honest framing is about blast radius rather than prevention. With an HttpOnly cookie, an XSS bug lets
an attacker act as the user <i>while the page is open</i>. With localStorage, the same bug lets them walk
away with a credential usable from anywhere until it expires. Same vulnerability, very different aftermath —
and neither is fixed by storage choice, which is why the BFF pattern, where the browser holds no token at
all, is the structural answer rather than a preference.</p>`,
docs:[['Session fixation — OWASP','https://owasp.org/www-community/attacks/Session_fixation'],['Token storage — OWASP','https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#local-storage']],
ex:{title:'Choose safe token storage',lang:'js',
run:{call:'safe',cases:[{args:['httponly-cookie'],expect:true},{args:['localstorage'],expect:false},{args:['sessionstorage'],expect:false},{name:'a plain variable is still script-readable',args:['jsvariable'],expect:false}]},
prompt:`Write <code>function safe(place)</code> returning <code>true</code> only for <code>"httponly-cookie"</code>, and <code>false</code> for browser-readable stores like <code>"localstorage"</code>, <code>"sessionstorage"</code> or <code>"jsvariable"</code>.`,
starter:`function safe(place) {
  return false;
}`,
solution:`function safe(place) {
  return place === "httponly-cookie";
}`,
tests:[{d:'an HttpOnly cookie is safe',re:'"httponly-cookie"'},{d:'does not bless localStorage',re:'"localstorage"',not:true}],
behavior:`Anything JavaScript can read is exposed to XSS, so only the HttpOnly cookie passes. Note the trade this makes: a cookie is sent automatically, so you now need CSRF protection — safety here is a swap of one problem for a better-understood one.`,
hints:['Only one storage location is acceptable here.','Use === to compare against the single safe value.','Everything not explicitly safe returns false.']}},

{id:'ss5',title:'Logout & session revocation',body:`
<p>Logging out must actually <b>end</b> the session server-side, not just delete the cookie — a stolen id is worthless only once the server forgets it. Remove the session from the store (or add its token to a denylist) so any further use is rejected.</p>
<p>In SSO the picture is bigger. <b>Front-channel logout</b> uses the browser to notify each app (hidden iframes/redirects) that the shared session ended; <b>back-channel logout</b> has the identity provider call each app server-to-server, which is more reliable because it does not depend on the browser being open. Either way, the goal is the same: one logout invalidates the sessions everywhere.</p>

<h4>Logout is three different operations wearing one word</h4>
<p>Most logout bugs come from a vocabulary problem. When a user clicks "log out" they might mean any of
these, and a system that implements only the first while implying the third is actively misleading:</p>
<div class="codeSample" data-hl>1. clear the LOCAL session   cookie gone from this browser
2. revoke the CREDENTIAL     the session/token is dead server-side,
                             so a copy of it stops working too
3. end the SSO SESSION       the IdP forgets you, so the next app does
                             not silently sign you back in

// implementing 1 only is the classic bug: the user "logs out",
// clicks the app again, and is instantly logged back in via SSO -
// which looks broken, and worse, was never actually a logout.</div>

<h4>Why deleting the cookie is not enough</h4>
<p>The cookie is a <i>copy</i> of a reference, not the session. Anything that captured it — an XSS
payload, a proxy log, a shared machine's history — still holds a working credential, and the server will
keep honouring it until it expires. <b>Logout has to change server state</b>: delete the session record,
or add the token to a denylist keyed by its <code>jti</code> until its own <code>exp</code> passes.</p>
<p>This is where stateless JWTs bite. A self-contained access token is valid because it verifies, not
because a server says so, and there is no record to delete. The options are all compromises: keep access
tokens short (minutes) and accept a revocation lag; maintain a denylist (which reintroduces the state
JWTs were meant to remove); or check a revocation list at the gateway only. Choose deliberately —
"logout" that leaves a valid token alive for an hour is a decision, and it should be one you made on
purpose.</p>

<h4>The distributed problem</h4>
<p>In SSO the session is not one thing. There is the IdP's session, plus one per application, and they
have no common lifetime. Killing the IdP session stops <i>new</i> logins; it does nothing to the six
applications already holding their own.</p>
<p><b>Front-channel logout</b> drives the browser through hidden iframes to each app's logout URL. It is
simple and it is dying: third-party cookie blocking means those iframes increasingly load without the
app's cookies, so the logout silently does nothing — and it fails silently, which is the worst property a
security control can have.</p>
<p><b>Back-channel logout</b> has the IdP POST a signed <b>logout token</b> to each app server-to-server.
No browser involvement, works when the tab is closed, and delivery is observable — but every app must
expose an endpoint, validate the token (including that it carries the <code>events</code> claim and
<b>no</b> <code>nonce</code>), map <code>sid</code> or <code>sub</code> to its own sessions, and be
reachable at that moment.</p>

<h4>What to do instead of chasing perfect SLO</h4>
<p>Complete single logout is rarely achieved, because it requires every participant to be correct and
available simultaneously. The pragmatic posture: short application sessions so failures self-heal,
back-channel logout where it matters, <b>and a separate, reliable "revoke everything" path</b> for the
case that actually counts — a compromised account. That path is not the logout button; it is an
administrative action that invalidates the sessions, revokes the refresh tokens, and forces
re-authentication everywhere, and it should be tested.</p>`,
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

{id:'ss6',title:'Single Logout: why it is hard and how the mechanisms work',body:`
<p>Single Sign-On is a pleasant illusion. One login event silently created <i>N</i> independent
application sessions, and the user has no idea. Logout is where the illusion collapses, because now all
<i>N</i> must be found and ended — and there is no reliable way to reach them all.</p>
<p>This is not an implementation failing. It is the structural consequence of the thing that made SSO
valuable: each application keeps its own session so it does not have to consult the IdP on every
request.</p>

<h4>Three different things called "logout"</h4>
<ul>
<li><b>Local logout</b> — end the session at <i>this</i> application. Easy, and usually all that
actually happens. The user is then baffled to find that clicking the app again logs them straight back
in, because the IdP session is untouched.</li>
<li><b>IdP logout</b> — end the session at the identity provider, so the <i>next</i> app that redirects
there prompts for credentials. Apps already logged in stay logged in.</li>
<li><b>Single Logout (SLO)</b> — end the IdP session <i>and</i> every application session it produced.
This is the one that is hard.</li>
</ul>
<p>Most "logout is broken" reports are really a mismatch between what the user expected and which of
these three the system implemented.</p>

<h4>RP-initiated logout: the redirect</h4>
<p>The app sends the user to the IdP's <code>end_session_endpoint</code>, which clears its own session
and redirects back:</p>
<div class="codeSample" data-hl>GET /connect/endsession
  ?id_token_hint=eyJhbGciOi...          proves who is logging out
  &post_logout_redirect_uri=https://app.example.com/bye   must be registered
  &state=xyz

// the id_token_hint matters: without it the IdP cannot tell WHICH session to
// end, and must either prompt the user or refuse.</div>
<p>This ends the local session and the IdP session. It does nothing about the other applications — for
that the IdP has to notify them, and there are two ways to do it.</p>

<h4>Front-channel logout: through the browser</h4>
<p>The IdP's logout page embeds a hidden iframe per application, each pointing at that app's logout URI.
The browser loads them, each app sees its own cookie, each clears its session.</p>
<div class="codeSample" data-hl>&lt;iframe src="https://app-a.example.com/logout?iss=...&amp;sid=..."&gt;
&lt;iframe src="https://app-b.example.com/logout?iss=...&amp;sid=..."&gt;

WHY IT BREAKS
  the user closes the tab before the iframes finish   -> some apps never notified
  third-party cookie blocking                          -> the iframe has no session
    to clear, because the app's cookie is not sent in a cross-site frame
  an app is slow or down                               -> silently skipped
  no acknowledgement                                   -> the IdP never learns
    which logouts succeeded</div>
<p>Third-party cookie restrictions are the decisive problem. The mechanism depends on an app's cookie
being sent inside a cross-site iframe, which is precisely what browsers now block by default. Front-
channel logout is, for practical purposes, in terminal decline.</p>

<h4>Back-channel logout: server to server</h4>
<p>The IdP POSTs a signed <b>logout token</b> directly to each application's registered endpoint. No
browser involved, so nothing depends on the user keeping a tab open:</p>
<div class="codeSample" data-hl>POST /backchannel-logout
Content-Type: application/x-www-form-urlencoded

logout_token=eyJhbGciOiJSUzI1NiIs...

// the logout token is a JWT, and must be validated like any other:
{ "iss": "https://idp.example.com",
  "aud": "app-a",
  "iat": 1767222000,
  "jti": "unique-id",                        // reject replays
  "sub": "u-4817",                           // and/or
  "sid": "session-abc",                      // the specific session
  "events": { "http://schemas.openid.net/event/backchannel-logout": {} } }

// MUST NOT contain a nonce claim — that would mark it as an ID token,
// and an attacker could otherwise submit an ID token as a logout token.</div>
<p>It is more reliable, and it introduces its own problem: <b>the application must be able to find and
kill the session from the token alone.</b> That means indexing sessions by <code>sid</code> or
<code>sub</code> — and an app using stateless JWT sessions has nothing to delete. Back-channel logout
effectively requires server-side session state, or a revocation list the app checks.</p>
<p>Note the asymmetry with front-channel: back-channel reaches the <i>server</i>, but the user's browser
may still hold a valid cookie for an app the notification failed to reach.</p>

<h4>Why full SLO rarely works in practice</h4>
<ol>
<li><b>Not every app supports it.</b> One SaaS vendor without a back-channel endpoint means logout is
incomplete by definition, and you cannot make them implement it.</li>
<li><b>There is no transaction.</b> Some notifications succeed, some fail, some time out, and there is
no rollback and usually no retry.</li>
<li><b>Access tokens outlive the session.</b> Even a perfectly ended session leaves already-issued
access tokens valid until they expire. Logging out does not un-issue a token.</li>
<li><b>Native and mobile apps</b> may not be running to receive anything.</li>
</ol>

<h4>What to do instead</h4>
<p>Given that SLO is unreliable, the practical posture is to reduce how much it needs to accomplish:</p>
<ul>
<li><b>Short access token lifetimes</b> — five to fifteen minutes — so the post-logout window is
small.</li>
<li><b>Revoke the refresh token and the grant</b> at logout. This is the one that actually stops
continued access, since without it a refresh quietly mints a new access token.</li>
<li><b>Check session validity on sensitive operations</b> rather than trusting a long-lived local
session.</li>
<li><b>Be honest in the UI.</b> "You have been signed out of this application" is accurate; "You have
been signed out everywhere" usually is not, and a "sign out of all devices" control that shows what it
actually ended is better than a claim you cannot keep.</li>
</ul>
<p>The deeper point: logout is the mirror of the SSO trade-off. Independent app sessions are what make
federated login fast, and they are exactly what makes logout unreliable. You cannot have the first
property without the second.</p>`,
docs:[['OpenID Connect RP-Initiated Logout 1.0','https://openid.net/specs/openid-connect-rpinitiated-1_0.html'],['OpenID Connect Back-Channel Logout 1.0','https://openid.net/specs/openid-connect-backchannel-1_0.html'],['OpenID Connect Front-Channel Logout 1.0','https://openid.net/specs/openid-connect-frontchannel-1_0.html'],['RFC 7009 — OAuth 2.0 Token Revocation','https://www.rfc-editor.org/rfc/rfc7009']],
ex:{title:'Validate a back-channel logout token',
prompt:`Write <code>LogoutToken</code> with three methods. <code>static boolean valid(String iss, String expectedIss, String aud, String clientId, boolean hasLogoutEvent, boolean hasNonce)</code> requires the issuer and audience to match the expected values, the logout event to be present, and <code>hasNonce</code> to be <b>false</b> — a nonce marks the JWT as an ID token, and accepting one would let an attacker submit an ID token as a logout token. <code>static boolean notReplayed(java.util.Set&lt;String&gt; seenJtis, String jti)</code> is true only for a non-null jti not already seen. <code>static String sessionKey(String sid, String sub)</code> returns <code>sid</code> when it is non-null, otherwise <code>sub</code>, otherwise null — the key the app uses to find the session it must kill.`,
starter:`import java.util.*;

public class LogoutToken {
    static boolean valid(String iss, String expectedIss, String aud, String clientId,
                         boolean hasLogoutEvent, boolean hasNonce) {
        return false;
    }
    static boolean notReplayed(Set<String> seenJtis, String jti) {
        return false;
    }
    static String sessionKey(String sid, String sub) {
        return null;
    }
}`,
tests:[{d:'the issuer must match',re:'iss\\s*!=\\s*null|expectedIss\\s*\\.\\s*equals|iss\\s*\\.\\s*equals'},{d:'the audience must match this client',re:'clientId|aud'},{d:'the logout event must be present',re:'hasLogoutEvent'},{d:'a nonce disqualifies the token',re:'!\\s*hasNonce|hasNonce\\s*==\\s*false'},{d:'replayed jtis are rejected',re:'contains\\s*\\(\\s*jti\\s*\\)'},{d:'a null jti is rejected',re:'jti\\s*!=\\s*null|jti\\s*==\\s*null'},{d:'sid is preferred over sub',re:'sid\\s*!=\\s*null|null\\s*!=\\s*sid'}],
behavior:`valid("https://idp","https://idp","app-a","app-a",true,false) is true. It is false when the issuer or audience differ, when the logout event is absent, and crucially when hasNonce is true — the specification forbids a nonce precisely so that an ID token cannot be replayed to the logout endpoint to sign a user out, or worse. notReplayed(new HashSet<>(), "j1") is true; a jti already in the set, or a null jti, is false. sessionKey("sess-1","u-1") returns sess-1, since sid identifies the specific session; sessionKey(null,"u-1") returns u-1, which logs the user out of every session; sessionKey(null,null) returns null and the app cannot act.`,
hints:['Join the checks with &&, guarding the two string comparisons for null first.','<code>return jti != null &amp;&amp; seenJtis != null &amp;&amp; !seenJtis.contains(jti);</code>','A nested ternary is enough for sessionKey — prefer sid, fall back to sub.'],
solution:`import java.util.*;

public class LogoutToken {
    static boolean valid(String iss, String expectedIss, String aud, String clientId,
                         boolean hasLogoutEvent, boolean hasNonce) {
        if (iss == null || aud == null) return false;
        // a nonce would make this an ID token: never accept one here
        return iss.equals(expectedIss)
            && aud.equals(clientId)
            && hasLogoutEvent
            && !hasNonce;
    }
    static boolean notReplayed(Set<String> seenJtis, String jti) {
        return jti != null && seenJtis != null && !seenJtis.contains(jti);
    }
    static String sessionKey(String sid, String sub) {
        // sid kills one session; sub kills all of the user's sessions
        if (sid != null) return sid;
        return sub;
    }
}`}},


{id:'ss7',title:'CORS: the browser\'s other security model',body:`
<p>Two browser mechanisms decide whether a login works from a single-page app, and people routinely
confuse them. <b>SameSite</b> decides whether the cookie is <i>attached</i> to a request. <b>CORS</b>
decides whether JavaScript is allowed to <i>read the response</i>. Different questions, different
failures, and a debugging session goes badly until you know which one you are looking at.</p>

<h4>The same-origin policy, and the gap it leaves</h4>
<p>An <b>origin</b> is scheme + host + port. <code>https://app.example.com</code> and
<code>https://api.example.com</code> are different origins; so are <code>http</code> and
<code>https</code> versions of the same host. The same-origin policy says script on one origin cannot read
responses from another.</p>
<p>Note precisely what it does <i>not</i> say: it does not stop the request being <b>sent</b>, and it does
not stop cookies riding along. That gap is the whole reason CSRF exists — the attacker's page can cause a
state-changing request with your cookies attached, it simply cannot read the answer. Which is why the
defence for CSRF is SameSite and tokens, not CORS.</p>

<h4>How CORS relaxes it — server opt-in, browser enforcement</h4>
<p>A cross-origin read is permitted only when the <i>server</i> says so, in response headers the browser
checks before handing the body to script:</p>
<div class="codeSample" data-hl>// simple request: sent immediately, response gated on the header
Access-Control-Allow-Origin: https://app.example.com

// anything with an Authorization header, a custom header or an
// unusual content type is PREFLIGHTED first:
OPTIONS /token                       Access-Control-Request-Method: POST
                                     Access-Control-Request-Headers: authorization
-> Access-Control-Allow-Origin: https://app.example.com
   Access-Control-Allow-Methods: POST
   Access-Control-Allow-Headers: authorization
   Access-Control-Max-Age: 600       // cache the preflight, or you double every call</div>
<p>This matters for identity because the endpoints an SPA calls directly — <code>/token</code> for a PKCE
public client, <code>/.well-known/openid-configuration</code>, <code>jwks_uri</code>, sometimes
<code>/userinfo</code> — all need CORS headers, and an <code>Authorization</code> header forces a
preflight on every one of them.</p>

<h4>Credentials change the rules</h4>
<p>If the request carries cookies (<code>credentials: "include"</code>), two extra conditions apply:
the server must send <code>Access-Control-Allow-Credentials: true</code>, and
<code>Access-Control-Allow-Origin</code> <b>may not be <code>*</code></b>. It must name a single origin.</p>
<p>The dangerous workaround is to reflect whatever <code>Origin</code> arrives back in the header. That
technically satisfies the browser — and it means <i>every</i> site on the internet can read your API's
responses with the victim's cookies attached. Reflecting an origin is only safe against an explicit
allowlist, and "allowlist" must mean exact strings, not a <code>startsWith("https://example")</code> that
also matches <code>https://example.attacker.com</code>.</p>

<h4>CORS is not authorization</h4>
<p>The rules are enforced by browsers, for browsers. <code>curl</code>, a mobile app, a server-side proxy
and an attacker's script all ignore them completely. CORS protects your <i>users</i> from other websites
reading their data; it does nothing to protect your API from a determined caller. Every endpoint still
needs real authentication and authorization behind it.</p>
<p>Which is the underrated argument for the <b>BFF pattern</b> from the OAuth stream. Keep the browser
talking to its own origin and let a small backend hold the tokens. The entire CORS-plus-credentials
minefield then stops being your problem — along with token storage in the browser.</p>`,
docs:[['MDN — Cross-Origin Resource Sharing','https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS'],['Fetch Standard — CORS protocol','https://fetch.spec.whatwg.org/#http-cors-protocol'],['OWASP — CORS misconfiguration','https://owasp.org/www-community/attacks/CORS_OriginHeaderScrutiny']],
ex:{title:'Decide whether a credentialed read is allowed',lang:'js',
run:{call:'corsAllowsCredentialedRead',cases:[{name:'an allowlisted origin, echoed exactly, with credentials on',args:[['https://app.example.com'],'https://app.example.com','https://app.example.com',true],expect:true},{name:'wildcard plus credentials is refused by the browser',args:[['https://app.example.com'],'https://app.example.com','*',true],expect:false},{name:'reflecting an origin that is not on the allowlist',args:[['https://app.example.com'],'https://evil.example.com','https://evil.example.com',true],expect:false},{name:'allowlisted, but the server did not allow credentials',args:[['https://app.example.com'],'https://app.example.com','https://app.example.com',false],expect:false},{name:'header names a different origin than the caller',args:[['https://app.example.com'],'https://app.example.com','https://other.example.com',true],expect:false}]},
prompt:`Write <code>function corsAllowsCredentialedRead(allowlist, requestOrigin, allowOriginHeader, allowCredentials)</code> returning <code>true</code> only when: the requesting origin is on the allowlist (exact match), the <code>Access-Control-Allow-Origin</code> header names that same origin, it is not <code>"*"</code>, and <code>Access-Control-Allow-Credentials</code> is <code>true</code>. This is the rule the browser applies before letting script read the body.`,
starter:`function corsAllowsCredentialedRead(allowlist, requestOrigin, allowOriginHeader, allowCredentials) {
  return false;
}`,
solution:`function corsAllowsCredentialedRead(allowlist, requestOrigin, allowOriginHeader, allowCredentials) {
  if (!allowlist || !allowlist.includes(requestOrigin)) return false;
  if (allowOriginHeader === "*") return false;          // never valid with credentials
  if (allowOriginHeader !== requestOrigin) return false; // must name this one origin
  return allowCredentials === true;
}`,
tests:[{d:'the origin is checked against an allowlist',re:'allowlist\\s*\\.\\s*includes|indexOf\\s*\\(\\s*requestOrigin'},{d:'the wildcard is rejected outright',re:'["\\x27]\\*["\\x27]'},{d:'the header must name the requesting origin',re:'allowOriginHeader\\s*!==\\s*requestOrigin|allowOriginHeader\\s*===\\s*requestOrigin'},{d:'credentials must be explicitly allowed',re:'allowCredentials\\s*===\\s*true|allowCredentials\\s*==='}],
behavior:`Five real cases. The wildcard case is the specification's own guard: a browser refuses Access-Control-Allow-Origin: * on a credentialed request, precisely so that an API cannot accidentally publish authenticated responses to every origin. The reflected-origin case is the misconfiguration that shows up in real audits — the server echoes whatever Origin it receives, the browser is satisfied, and any site the victim visits can read their data. The allowlist must hold exact origins: a prefix check on "https://example" also accepts https://example.attacker.com.`,
hints:['Four independent conditions; any one failing is a refusal.','The wildcard has a special rule of its own — check it before comparing strings.','Exact string membership in the allowlist. A prefix test is a vulnerability, not a shortcut.']}}

]});
