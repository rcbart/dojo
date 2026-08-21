/* ============================== AUTHORIZATION REQUEST CHECKS ==============================
   Paste the URL out of the address bar, or out of a HAR file, or out of the
   network tab. Most of what is wrong with an OAuth deployment is visible in
   this one line, and almost nobody reads it. */

function parseAuthz(text, asQuery) {
  const out = { params: {}, base: '', fragment: false, scheme: '' };
  let s = String(text).trim();

  if (asQuery) {
    for (const [k, v] of new URLSearchParams(s.replace(/^[?&]/, ''))) out.params[k] = v;
    return out;
  }

  let u;
  try { u = new URL(s); } catch (e) { return { error: 'not a URL: ' + e.message }; }
  out.base = u.origin + u.pathname;
  out.scheme = u.protocol.replace(':', '');
  for (const [k, v] of u.searchParams) out.params[k] = v;
  if (u.hash && u.hash.length > 1) {
    out.fragment = true;
    for (const [k, v] of new URLSearchParams(u.hash.slice(1))) {
      out.params[k] = v;
      out.fragmentParams = out.fragmentParams || {};
      out.fragmentParams[k] = v;
    }
  }
  return out;
}

function checkAuthz(a, now) {
  const f = [];
  const p = a.params || {};
  const rt = String(p.response_type || '').toLowerCase().trim();

  /* A redirect carrying results, rather than a request. Different checks matter. */
  const isCallback = !!(p.code || p.access_token || p.id_token || p.error);

  if (a.scheme === 'http' && !/^https?:\/\/(localhost|127\.0\.0\.1)/.test(a.base)) {
    f.push(F('critical', 'Plaintext http',
      'Everything in this URL is readable and rewritable in transit, including the code and the ' +
      'redirect target.', 'Use https everywhere except loopback during development.', 'RFC 9700 §2.1'));
  }

  if (p.client_secret) {
    f.push(F('critical', 'client_secret is in the URL',
      'This is a front-channel request. The secret is now in the browser address bar, the history, ' +
      'the referrer header and every proxy log between here and the provider. Treat it as public.',
      'Rotate the secret. Client authentication belongs on the back-channel token request only.',
      'RFC 6749 §2.3.1'));
  }

  if (a.fragmentParams && (a.fragmentParams.access_token || a.fragmentParams.id_token)) {
    f.push(F('warn', 'Tokens returned in the URL fragment',
      'Fragments reach browser history and anything that reads location. This is the implicit flow ' +
      'or a hybrid variant of it.',
      'Move to the authorization code flow with PKCE.', 'RFC 9700 §2.1.2'));
  }

  if (!isCallback) {
    if (!rt) {
      f.push(F('warn', 'No response_type', 'Not a complete authorization request.', '', 'RFC 6749 §4.1.1'));
    } else if (rt === 'code') {
      f.push(F('ok', 'Authorization code flow', ''));
    } else if (/token/.test(rt)) {
      f.push(F('critical', 'response_type=' + rt + ' returns tokens through the browser',
        'The implicit and hybrid flows hand tokens to the front channel, where they land in history ' +
        'and referrer headers. Both have been advised against for years.',
        'Use response_type=code with PKCE.', 'RFC 9700 §2.1.2'));
    }

    if (!p.code_challenge) {
      f.push(F('critical', 'No PKCE',
        'Without a challenge, anyone who intercepts the authorization code can redeem it. That is ' +
        'the attack PKCE was written to stop, and it applies to confidential clients too.',
        'Send code_challenge with code_challenge_method=S256.', 'RFC 9700 §2.1.1'));
    } else if (String(p.code_challenge_method || 'plain').toLowerCase() !== 's256') {
      f.push(F('warn', 'code_challenge_method is ' + (p.code_challenge_method || 'plain (the default)'),
        'The plain method puts the verifier in the request in the clear, so an attacker who can read ' +
        'the request can also complete the exchange.',
        'Use S256.', 'RFC 7636 §7.2'));
    } else {
      f.push(F('ok', 'PKCE with S256', ''));
    }

    if (!p.state) {
      f.push(F('warn', 'No state parameter',
        'Nothing binds the callback to the browser session that started it, which is what makes ' +
        'login CSRF possible. PKCE does not cover this.',
        'Send an unguessable state and check it on return.', 'RFC 6749 §10.12'));
    } else if (String(p.state).length < 8) {
      f.push(F('warn', 'state is only ' + String(p.state).length + ' characters',
        'Short enough to guess, which defeats the point of having it.',
        'Use at least 128 bits of randomness.'));
    } else {
      f.push(F('ok', 'state present', ''));
    }

    if (/id_token/.test(rt) && !p.nonce) {
      f.push(F('critical', 'ID token requested with no nonce',
        'The nonce is what ties the returned ID token to this request. Without it, a token captured ' +
        'elsewhere can be replayed into this session.',
        'Send a nonce and check it in the returned token.', 'OIDC Core §3.1.2.1'));
    }

    if (!p.scope) {
      f.push(F('note', 'No scope requested', 'The provider will apply its default, whatever that is.'));
    } else {
      const scopes = String(p.scope).split(/[\s+]+/).filter(Boolean);
      if (!scopes.includes('openid') && (p.nonce || /id_token/.test(rt))) {
        f.push(F('warn', 'Looks like OpenID Connect but scope is missing "openid"',
          'Without it this is plain OAuth and you will not get an ID token, whatever else you asked for.',
          '', 'OIDC Core §3.1.2.1'));
      }
      if (scopes.some(s => /^(.*\.)?(\*|all|full_access|admin)$/i.test(s))) {
        f.push(F('warn', 'Very broad scope requested: ' + scopes.join(' '),
          'The token you get back is as powerful as the scope you asked for, and it will be logged ' +
          'somewhere.', 'Ask for the narrowest scope the feature needs.'));
      }
      if (scopes.length > 12) {
        f.push(F('note', scopes.length + ' scopes requested',
          'Long scope lists usually mean one client is doing several unrelated jobs.'));
      }
    }
  }

  /* ---------------- redirect_uri, where a surprising amount goes wrong ---------------- */
  if (p.redirect_uri) {
    const r = String(p.redirect_uri);
    if (/[*]/.test(r)) {
      f.push(F('critical', 'redirect_uri contains a wildcard',
        'If the provider honours it, an attacker picks the destination the code is delivered to.',
        'Register exact URIs. No wildcards, no prefixes.', 'RFC 9700 §2.1'));
    }
    if (/^http:/i.test(r) && !/^http:\/\/(localhost|127\.0\.0\.1)/i.test(r)) {
      f.push(F('critical', 'redirect_uri is plaintext http: ' + r,
        'The code is delivered over a channel anyone on the path can read.', 'Use https.', 'RFC 9700 §2.1'));
    }
    if (/#/.test(r)) {
      f.push(F('warn', 'redirect_uri contains a fragment',
        'Fragments are not permitted in a redirect URI and providers differ on what they do with one.',
        '', 'RFC 6749 §3.1.2'));
    }
    if (/^(urn:ietf:wg:oauth:2\.0:oob|oob)$/i.test(r)) {
      f.push(F('warn', 'Out-of-band redirect (copy the code by hand)',
        'Deprecated, and the copy-paste step is exactly where users get phished.',
        'Use a loopback redirect for native applications.', 'RFC 9700 §2.1'));
    }
  } else if (!isCallback) {
    f.push(F('note', 'No redirect_uri in the request',
      'Legal when the client has exactly one registered URI, and a source of confusion when it does not.'));
  }

  /* ---------------- the callback side ---------------- */
  if (isCallback) {
    if (p.error) {
      f.push(F('note', 'Provider returned error=' + p.error +
        (p.error_description ? ': ' + p.error_description : ''),
        'The description is the provider\'s, not authlint\'s.'));
    }
    if (p.code) f.push(F('ok', 'Authorization code returned on the front channel, as intended', ''));
    if (p.access_token) {
      f.push(F('critical', 'An access token came back in the URL',
        'It is now in the browser history and in any referrer header this page emits.',
        'Switch to the code flow.', 'RFC 9700 §2.1.2'));
    }
    if (!p.state && !p.error) {
      f.push(F('warn', 'Callback carries no state',
        'Nothing to compare against what you sent, so the CSRF check cannot happen.', '', 'RFC 6749 §10.12'));
    }
  }

  return sortFindings(f);
}
