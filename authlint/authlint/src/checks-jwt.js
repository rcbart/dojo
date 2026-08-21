/* ============================== JWT CHECKS ==============================
   Ordered roughly by how much trouble each one causes. The header checks come
   first because every one of them is a way to make a verifier trust a token it
   should have rejected, and those are the bugs that end up in advisories. */

const WEAK_ALGS = ['none', 'HS1', 'RS1'];

function checkJwt(t, now) {
  const f = [];
  const h = t.header || {};
  const p = t.payload || {};
  const alg = String(h.alg || '');

  /* ---------------- header: the ways a verifier gets fooled ---------------- */

  if (!h.alg) {
    f.push(F('critical', 'No alg in the header',
      'A verifier that reads the algorithm from the token has nothing to read, and one that ' +
      'defaults on a missing value will pick something.',
      'Pin the expected algorithm in the verifier and reject anything else.', 'RFC 7515 §4.1.1'));
  } else if (/^none$/i.test(alg)) {
    f.push(F('critical', 'alg is "none", so this token is unsigned',
      'Anyone can change the payload and the token still parses. If any verifier in the chain ' +
      'honours the header algorithm, this is a straight authentication bypass.',
      'Reject alg=none unconditionally. Pin the algorithm you expect rather than reading it from the token.',
      'CVE-2015-9235, RFC 8725 §3.1'));
  } else if (/^HS/i.test(alg)) {
    f.push(F('warn', 'Symmetric signature (' + alg + ')',
      'Everyone who can verify this token can also mint one, because the verification key is the ' +
      'signing key. If a provider that normally signs with RS256 issued this, the classic algorithm ' +
      'confusion attack looks exactly like it: the attacker re-signs with the public key as an HMAC secret.',
      'Prefer RS256 or ES256 for anything crossing a trust boundary, and pin the algorithm on verification.',
      'RFC 8725 §2.1'));
  }

  if (h.jku) {
    f.push(F('critical', 'Header carries jku, a URL the verifier is asked to fetch keys from',
      'If the verifier fetches that URL and trusts what comes back, whoever controls the token ' +
      'controls the signing key. That is forgery with extra steps.',
      'Ignore jku, or resolve it only against a fixed allow-list of hosts you own.', 'RFC 8725 §3.5'));
  }
  if (h.x5u) {
    f.push(F('critical', 'Header carries x5u, a URL pointing at the signing certificate',
      'Same failure as jku. An attacker who can set this field can nominate the key that validates ' +
      'their own token.',
      'Ignore x5u, or allow-list the host.', 'RFC 8725 §3.5'));
  }
  if (h.jwk) {
    f.push(F('critical', 'Header embeds its own public key (jwk)',
      'The token is telling the verifier which key to trust. Any verifier that believes it will ' +
      'accept a token signed by anyone.',
      'Never take the key from the token. Resolve kid against a JWKS you fetched yourself.', 'RFC 8725 §3.6'));
  }
  if (!h.kid && /^(RS|ES|PS)/i.test(alg)) {
    f.push(F('note', 'No kid',
      'The verifier has to try every key in the set, and rotating a key becomes a flag day rather ' +
      'than a rollout.',
      'Have the issuer stamp kid and publish matching kids in the JWKS.', 'RFC 7515 §4.1.4'));
  }
  if (h.typ && String(h.typ).toLowerCase() === 'jwt' && (p.scope || p.scp || p.client_id) && !p.nonce) {
    f.push(F('note', 'Access token typed as "JWT" rather than "at+jwt"',
      'Explicit typing is what stops a resource server accepting an ID token where it expected an ' +
      'access token. The two are both JWTs and both signed by the same issuer.',
      'Issue access tokens with typ=at+jwt and check it.', 'RFC 9068 §2.1'));
  }
  if (h.crit) {
    f.push(F('note', 'crit header present: ' + JSON.stringify(h.crit),
      'A verifier that does not understand every extension listed here is required to reject the ' +
      'token. Many libraries quietly do not.', '', 'RFC 7515 §4.1.11'));
  }

  if (t.kind === 'jws' && !t.signature) {
    f.push(F('critical', 'Empty signature segment',
      'The token claims an algorithm and carries nothing to verify. Some libraries have historically ' +
      'treated this as valid.',
      'Reject tokens with an empty signature.', 'RFC 8725 §3.1'));
  }

  /* ---------------- time ---------------- */

  if (looksLikeMillis(p.exp) || looksLikeMillis(p.iat) || looksLikeMillis(p.nbf)) {
    f.push(F('critical', 'Timestamps look like milliseconds, not seconds',
      'JWT time claims are seconds since the epoch. A millisecond value puts the expiry thousands ' +
      'of years out, so the token never expires and nobody notices until it is abused.',
      'Divide by 1000 at the issuer.', 'RFC 7519 §2 (NumericDate)'));
  }

  if (p.exp == null) {
    f.push(F('critical', 'No exp claim',
      'The token is valid forever. Whatever leaks it, leaks it permanently: a log line, a browser ' +
      'history entry, a support ticket screenshot.',
      'Always set exp. Minutes for access tokens, not hours.', 'RFC 7519 §4.1.4'));
  } else if (typeof p.exp === 'number') {
    const remaining = p.exp - now;
    if (remaining < 0) {
      f.push(F('note', 'Expired ' + secondsToHuman(-remaining) + ' ago',
        'Stated so you know the token you are looking at is not the one currently failing, if it is failing now.'));
    } else {
      f.push(F('ok', 'Valid for another ' + secondsToHuman(remaining), ''));
    }
    if (typeof p.iat === 'number') {
      const life = p.exp - p.iat;
      if (life > 31536000) {
        f.push(F('critical', 'Lifetime is ' + secondsToHuman(life),
          'A bearer token this long-lived is a password that nobody can rotate and everybody logs.',
          'Shorten it and refresh instead.', 'RFC 8725 §3.9'));
      } else if (life > 86400) {
        f.push(F('warn', 'Lifetime is ' + secondsToHuman(life),
          'Long enough that revocation matters, and bearer tokens have no revocation.',
          'Minutes for access tokens. If you need longer sessions, use a refresh token you can revoke.'));
      } else {
        f.push(F('ok', 'Lifetime is ' + secondsToHuman(life), ''));
      }
    }
  }

  if (typeof p.iat === 'number' && p.iat - now > 300) {
    f.push(F('warn', 'Issued ' + secondsToHuman(p.iat - now) + ' in the future',
      'Either a clock is wrong or the token was minted somewhere you did not expect. Verifiers with ' +
      'tight skew tolerance will reject it intermittently, which is the worst kind of bug to chase.',
      'Fix time sync at the issuer before you widen the skew allowance.'));
  }
  if (typeof p.nbf === 'number' && p.nbf - now > 60) {
    f.push(F('note', 'Not valid for another ' + secondsToHuman(p.nbf - now), ''));
  }

  /* ---------------- identity of the parties ---------------- */

  if (!p.iss) {
    f.push(F('critical', 'No iss claim',
      'Nothing says who minted this. A verifier that does not check the issuer will accept a ' +
      'correctly signed token from a completely different tenant.',
      'Set iss, and compare it exactly against the expected issuer.', 'OIDC Core §2'));
  } else if (typeof p.iss === 'string' && /^http:\/\//i.test(p.iss)) {
    // Caught separately from the general case below: the earlier version of
    // this check allowed anything with a scheme through, which meant a
    // plaintext http issuer was never reported at all.
    f.push(F('warn', 'iss is a plaintext http URL: ' + p.iss,
      'Discovery against a plaintext issuer can be rewritten in transit, and the keys a client ' +
      'ends up trusting come from whatever answered.',
      'Serve the issuer over https.', 'OIDC Discovery §4.3'));
  } else if (typeof p.iss === 'string' && !/^https:\/\//.test(p.iss) && !/^[a-z][a-z0-9+.-]*:/i.test(p.iss)) {
    f.push(F('note', 'iss is not a URL: ' + p.iss,
      'Legal for a plain JWT, and OpenID Connect requires an https URL because discovery depends ' +
      'on the value matching the issuer exactly, trailing slash and all.', '', 'OIDC Discovery §4.3'));
  }

  if (p.aud == null) {
    f.push(F('warn', 'No aud claim',
      'Nothing scopes this token to a recipient, so any service holding it can present it to any ' +
      'other service that trusts the same issuer.',
      'Set aud to the intended recipient and verify it there.', 'RFC 7519 §4.1.3'));
  } else if (Array.isArray(p.aud) && p.aud.length > 1 && !p.azp) {
    f.push(F('warn', 'Multiple audiences and no azp',
      'With more than one audience a verifier cannot tell which party the token was actually issued ' +
      'to, and OpenID Connect requires azp in exactly this case.',
      'Add azp, or issue one token per audience.', 'OIDC Core §2'));
  }

  if (!p.sub && (p.iss || p.aud)) {
    f.push(F('warn', 'No sub claim',
      'There is no stable identifier for the principal, so the relying party has to fall back on ' +
      'something mutable to key its own records.',
      'Set sub to an identifier that never changes and is never reused.', 'RFC 7519 §4.1.2'));
  } else if (looksLikeEmail(p.sub)) {
    f.push(F('warn', 'sub is an email address',
      'People change their surname and companies recycle addresses. When that happens, either an ' +
      'account is orphaned or someone inherits the previous holder\'s access.',
      'Use an opaque immutable identifier for sub and carry the email as a separate claim.',
      'OIDC Core §5.7'));
  }

  if (!p.jti && typeof p.exp === 'number' && (p.exp - now) > 900) {
    f.push(F('note', 'No jti',
      'Nothing to record if you ever need to deny a specific token before it expires.',
      'Add jti if you plan to support revocation.', 'RFC 7519 §4.1.7'));
  }

  /* ---------------- what is being carried ---------------- */

  const pii = PII_CLAIMS.filter(c => p[c] !== undefined);
  if (pii.length) {
    f.push(F(pii.length > 3 ? 'warn' : 'note', 'Personal data in the token: ' + pii.join(', '),
      'A JWT is base64, not encryption. Everything here is readable in any log aggregator, proxy ' +
      'access log, browser history entry and error report the token passes through.',
      'Carry an identifier and let the relying party fetch what it needs from userinfo.',
      'RFC 8725 §3.11'));
  }
  for (const k of Object.keys(p)) {
    const v = p[k];
    if (typeof v === 'string' && /^-{2,5}BEGIN|^[A-Za-z0-9+/]{200,}={0,2}$/.test(v)) {
      f.push(F('warn', 'Claim "' + k + '" looks like embedded key material or a nested credential',
        'Anything readable in the token is readable by everything the token touches.', ''));
      break;
    }
  }

  const size = (t.raw || '').length;
  if (size > 8192) {
    f.push(F('critical', 'Token is ' + size.toLocaleString() + ' bytes',
      'Past the default header limit on most servers and proxies. This fails as a 431 or a silently ' +
      'truncated header, usually only for the users with the most group memberships.',
      'Move the large claims out. Group lists are the usual culprit.'));
  } else if (size > 4096) {
    f.push(F('warn', 'Token is ' + size.toLocaleString() + ' bytes',
      'Too big for a single cookie, and close enough to common header limits that a user with a few ' +
      'more roles than average will break.',
      'Move group and permission lists out of the token.'));
  }

  for (const k of ['roles', 'groups', 'permissions', 'scp', 'entitlements']) {
    if (Array.isArray(p[k]) && p[k].length > 40) {
      f.push(F('warn', k + ' has ' + p[k].length + ' entries',
        'This is the claim that grows until the token stops fitting in a header, and it grows for ' +
        'your longest-serving employees first.',
        'Look these up at the resource server instead of carrying them.'));
    }
  }

  if (t.kind === 'jwe') {
    f.push(F('note', 'This is a JWE, so the payload is encrypted',
      'authlint can read the header but not the content, which is the point of a JWE. The header ' +
      'checks above still apply.', '', 'RFC 7516'));
  }

  /* ---------------- the reminder that matters most ---------------- */
  f.push(F('note', 'authlint did not verify the signature',
    'Nothing here proves this token is genuine. A decoded token tells you what it claims, not ' +
    'whether the claim is true, and every finding above is about content rather than authenticity.',
    'Verify against the issuer\'s JWKS in your own code, with the algorithm pinned.'));

  return sortFindings(f);
}
