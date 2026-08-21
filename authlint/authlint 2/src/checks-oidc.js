/* ============================== DISCOVERY & JWKS CHECKS ==============================
   A discovery document is the most under-read file in an identity deployment.
   It is also the one place where a single missing field tells you the whole
   estate is running a flow that was deprecated years ago. */

function checkDiscovery(d, now) {
  const f = [];
  const arr = k => Array.isArray(d[k]) ? d[k] : [];
  const has = (k, v) => arr(k).some(x => String(x).toLowerCase() === v);

  if (!d.issuer) {
    f.push(F('critical', 'No issuer',
      'Clients compare the iss claim of every token against this value. Without it there is nothing ' +
      'to compare against.', '', 'OIDC Discovery §3'));
  } else {
    if (!/^https:\/\//.test(d.issuer)) {
      f.push(F('critical', 'issuer is not https: ' + d.issuer,
        'Discovery over plaintext means the endpoints and keys a client trusts can be rewritten in transit.',
        '', 'OIDC Discovery §4.3'));
    }
    if (/\/$/.test(d.issuer)) {
      f.push(F('note', 'issuer has a trailing slash',
        'Issuer comparison is exact string equality. A trailing slash here and not in the token, or ' +
        'the other way round, is one of the most common interop failures in OpenID Connect and the ' +
        'error message never says so.',
        'Make sure the iss claim in issued tokens matches this byte for byte.', 'OIDC Discovery §4.3'));
    }
    for (const k of ['authorization_endpoint', 'token_endpoint', 'jwks_uri', 'userinfo_endpoint']) {
      const v = d[k];
      if (typeof v === 'string' && /^https?:\/\//.test(v)) {
        try {
          if (new URL(v).origin !== new URL(d.issuer).origin) {
            f.push(F('note', k + ' is on a different origin from the issuer',
              'Legitimate in plenty of deployments, and also what a compromised document looks like. ' +
              'Worth confirming this origin is one you own.', '', ''));
          }
        } catch (e) { /* malformed URLs are reported below */ }
      }
    }
  }

  for (const k of ['authorization_endpoint', 'token_endpoint', 'jwks_uri']) {
    if (!d[k]) {
      f.push(F('warn', 'No ' + k, 'Clients that rely on discovery cannot complete a flow without it.', '', 'OIDC Discovery §3'));
    } else if (!/^https:\/\//.test(String(d[k]))) {
      f.push(F('critical', k + ' is not https',
        'Keys or codes traveling in plaintext. For jwks_uri this means an attacker on the path ' +
        'chooses the signing key.', '', 'OIDC Discovery §3'));
    }
  }

  /* ---------------- the flow the estate is actually running ---------------- */

  const pkce = arr('code_challenge_methods_supported').map(x => String(x).toLowerCase());
  if (!pkce.length) {
    f.push(F('critical', 'No PKCE advertised',
      'Either the provider does not support it or it does not say so, and clients that read discovery ' +
      'will not send a challenge. Authorization codes are then interceptable, which is the whole ' +
      'reason PKCE exists.',
      'Enable PKCE and advertise S256. It is required for every client type now, not just mobile.',
      'RFC 9700 §2.1'));
  } else {
    if (!pkce.includes('s256')) {
      f.push(F('critical', 'PKCE advertised without S256: ' + pkce.join(', '),
        'Only the plain method is offered, which sends the verifier in the clear in the authorization ' +
        'request and protects nothing against an attacker who can read it.',
        'Support S256 and stop advertising plain.', 'RFC 7636 §7.2'));
    } else if (pkce.includes('plain')) {
      f.push(F('warn', 'PKCE still advertises the plain method',
        'A client that picks plain gets no protection, and some libraries pick the first method listed.',
        'Advertise S256 only.', 'RFC 7636 §7.2'));
    } else {
      f.push(F('ok', 'PKCE with S256', ''));
    }
  }

  const rts = arr('response_types_supported').map(x => String(x).toLowerCase());
  const implicit = rts.filter(x => /\btoken\b/.test(x) && !/^code$/.test(x));
  if (implicit.length) {
    f.push(F('warn', 'Implicit flow is still enabled: ' + implicit.join(', '),
      'Tokens come back in the URL fragment, which puts them in browser history, in referrer headers ' +
      'and in anything that logs URLs. It has been advised against for years and it is usually left ' +
      'on for one forgotten legacy client.',
      'Find out who still uses it, move them to code with PKCE, and turn it off.', 'RFC 9700 §2.1.2'));
  } else if (rts.length) {
    f.push(F('ok', 'No implicit response types', ''));
  }

  const algs = arr('id_token_signing_alg_values_supported').map(x => String(x).toLowerCase());
  if (algs.includes('none')) {
    f.push(F('critical', 'Unsigned ID tokens are advertised (alg none)',
      'A client that negotiates none receives an ID token anyone can write.',
      'Remove none from the supported algorithms.', 'RFC 8725 §3.1'));
  }
  if (algs.some(a => /^hs/.test(a))) {
    f.push(F('warn', 'Symmetric ID token signing offered: ' + algs.filter(a => /^hs/.test(a)).join(', '),
      'Every client that can verify can also forge, and it is the precondition for the algorithm ' +
      'confusion attack against providers that also offer RS256.',
      'Offer asymmetric algorithms only unless a specific client genuinely needs otherwise.', 'RFC 8725 §2.1'));
  }

  const tea = arr('token_endpoint_auth_methods_supported').map(x => String(x).toLowerCase());
  if (tea.includes('client_secret_basic') || tea.includes('client_secret_post')) {
    f.push(F('note', 'Shared-secret client authentication is available',
      'Fine for confidential clients. Worth knowing which of your clients are actually confidential, ' +
      'because a secret shipped inside a SPA or a mobile binary is not one.', '', 'RFC 9700 §2.5'));
  }
  if (tea.includes('private_key_jwt') || tea.includes('tls_client_auth')) {
    f.push(F('ok', 'Strong client authentication available: ' +
      tea.filter(x => /private_key_jwt|tls_client_auth/.test(x)).join(', '), ''));
  }

  if (!d.end_session_endpoint) {
    f.push(F('note', 'No end_session_endpoint',
      'There is no RP-initiated logout, so signing out of an application leaves the session at the ' +
      'provider intact and the next sign-in is silent. Users read that as "logout is broken".',
      '', 'OIDC RP-Initiated Logout §2'));
  }
  if (!d.revocation_endpoint) {
    f.push(F('note', 'No revocation_endpoint',
      'Nothing can be withdrawn before it expires, which makes token lifetime your only ' +
      'containment control during an incident.', '', 'RFC 7009'));
  }
  if (arr('subject_types_supported').length && !has('subject_types_supported', 'pairwise')) {
    f.push(F('note', 'Only public subject identifiers',
      'Every relying party sees the same sub for a given user, so two of them can correlate their ' +
      'records without the user agreeing to it.', '', 'OIDC Core §8'));
  }
  if (d.require_pushed_authorization_requests === true) {
    f.push(F('ok', 'Pushed authorization requests are required', ''));
  }

  return sortFindings(f);
}

function checkJwks(j, now) {
  const f = [];
  const keys = Array.isArray(j.keys) ? j.keys : [j];
  if (!keys.length) {
    f.push(F('warn', 'No keys in the set', 'Nothing here can verify anything.'));
    return f;
  }

  const secret = keys.filter(k => k && String(k.kty).toLowerCase() === 'oct');
  if (secret.length) {
    f.push(F('critical', secret.length + ' symmetric key(s) in a key set',
      'A JWKS is a public document. An oct key is a shared secret, and its value is right there in ' +
      'the k parameter. If this document is served from a well-known URL, the secret is public.',
      'Remove it now and rotate it. Assume it is compromised.', 'RFC 7517 §8.1'));
  }

  const priv = keys.filter(k => k && (k.d || k.p || k.q));
  if (priv.length) {
    f.push(F('critical', priv.length + ' key(s) include private parameters',
      'The d, p and q parameters are the private half. Publishing them means anyone can sign as you.',
      'Rotate immediately and publish only the public parameters.', 'RFC 7517 §9.2'));
  }

  const seen = {};
  for (const k of keys) {
    if (!k) continue;
    if (!k.kid) {
      f.push(F('warn', 'A key has no kid',
        'Verifiers cannot select it by identifier, so they try every key in turn and rotation ' +
        'becomes guesswork.', '', 'RFC 7517 §4.5'));
    } else if (seen[k.kid]) {
      f.push(F('critical', 'Duplicate kid: ' + k.kid,
        'Two keys claim the same identifier, so which one verifies a given token depends on the ' +
        'iteration order of whatever library you happen to be using.',
        'Give every key a unique kid.', 'RFC 7517 §4.5'));
    } else {
      seen[k.kid] = true;
    }

    if (String(k.kty).toUpperCase() === 'RSA' && k.n) {
      const bits = rsaBits(k.n);
      if (bits && bits < 2048) {
        f.push(F('critical', 'RSA key is ' + bits + ' bits' + (k.kid ? ' (' + k.kid + ')' : ''),
          'Below the minimum anyone still considers safe.',
          'Rotate to at least 2048 bits.', 'RFC 7518 §3.3'));
      } else if (bits) {
        f.push(F('ok', 'RSA ' + bits + ' bits' + (k.kid ? ' (' + k.kid + ')' : ''), ''));
      }
    }

    if (Array.isArray(k.x5c) && k.x5c[0]) {
      const v = certValidity(k.x5c[0]);
      if (v) {
        const days = (v.notAfter - now * 1000) / 86400000;
        if (days < 0) {
          f.push(F('critical', 'Certificate expired ' + Math.abs(Math.round(days)) + ' days ago' +
            (k.kid ? ' (' + k.kid + ')' : ''),
            'Anything validating the chain rather than the raw key is already failing.', 'Rotate it.'));
        } else if (days < 30) {
          f.push(F('warn', 'Certificate expires in ' + Math.round(days) + ' days' +
            (k.kid ? ' (' + k.kid + ')' : ''),
            'Certificate expiry is the single most common cause of a federation outage, and it always ' +
            'lands on a weekend.', 'Schedule the rotation now.'));
        } else {
          f.push(F('ok', 'Certificate valid for another ' + Math.round(days) + ' days', ''));
        }
      }
    }

    if (!k.use && !k.key_ops) {
      f.push(F('note', 'A key declares neither use nor key_ops',
        'Nothing says whether it is for signing or encryption, so a verifier may try it for both.',
        '', 'RFC 7517 §4.2'));
    }
  }

  return sortFindings(f);
}
