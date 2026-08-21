/* ============================== DIAGNOSE ==============================
   A free paste box accepts anything, so it has to answer two different
   questions well.

   "I do not recognise this at all" is one answer, and it should say what the
   tool does accept rather than shrugging.

   "This is a JWT and it is broken" is a completely different answer, and it is
   the more useful one. Somebody pasting a truncated token out of a log file is
   two seconds from the fix if you tell them which segment is short, and lost
   for ten minutes if all you say is that the input was not understood.

   Returns { state, looksLike, problem, hint }, where state is 'malformed' when
   the shape is recognisable and 'unknown' when it is not. */

const ACCEPTS = 'a JWT, a JWKS, an OpenID Connect discovery document, an OAuth ' +
                'authorization request or redirect URL, a SAML response or assertion, ' +
                'or SAML metadata';

function diagnose(raw) {
  const text = String(raw || '').trim();
  if (!text) return null;
  const compact = text.replace(/\s+/g, '');

  /* ---------------- things we recognise and deliberately do not handle ---------------- */

  if (/^-{2,}BEGIN ([A-Z ]+)-{2,}/.test(text)) {
    const what = (text.match(/^-{2,}BEGIN ([A-Z ]+)-{2,}/) || [])[1].trim().toLowerCase();
    if (/private key/.test(what)) {
      return { state: 'unknown', looksLike: 'a PEM private key',
        problem: 'authlint does not read private keys, and you should not paste one into anything.',
        hint: 'If you are checking a key set, paste the public JWKS instead.' };
    }
    return { state: 'unknown', looksLike: 'a PEM ' + what + ' block',
      problem: 'authlint inspects certificates where they are published rather than on their own.',
      hint: 'Paste the SAML metadata or the JWKS that carries this certificate, and the expiry ' +
            'will be checked in context.' };
  }

  if (/^(Cookie|Set-Cookie):/i.test(text)) {
    return { state: 'unknown', looksLike: 'an HTTP cookie header',
      problem: 'A session cookie is usually opaque, with nothing inside it to decode.',
      hint: 'If one of the values is a JWT, three base64url segments separated by dots, paste just that.' };
  }

  /* ---------------- JWT, the one worth diagnosing precisely ---------------- */

  // Deliberately narrow. A dotted string is not enough on its own, or every
  // hostname somebody pastes gets told it is a JWT missing a segment. Either it
  // opens with the base64 of {" , which nothing else does, or it is made of
  // base64url runs with at least one of them long enough to be a real segment.
  const parts = compact.split('.');
  const jwtish = /^eyJ/.test(compact) ||
                 (parts.length >= 2 && parts.length <= 6 &&
                  parts.every(s => /^[A-Za-z0-9_-]*$/.test(s)) &&
                  parts.some(s => s.length >= 20));
  if (jwtish) {
    const name = 'a JWT';

    if (parts.length === 1) {
      // One segment beginning eyJ is the base64 of a JSON object, which is a
      // lone JWT header, and is also what you get from anyone who base64s some
      // JSON for their own reasons. An alg or enc key settles it.
      let obj = null;
      try { obj = JSON.parse(b64urlToText(compact)); } catch (e) { /* not whole JSON */ }
      if (obj && typeof obj === 'object' && !obj.alg && !obj.enc) {
        return { state: 'malformed', looksLike: 'base64-encoded JSON',
          problem: 'It decodes to JSON rather than to a document authlint recognises.',
          hint: 'Decode it yourself and paste the JSON, or paste the token that is inside it.' };
      }
      return { state: 'malformed', looksLike: name,
        problem: 'There is only one segment. A signed JWT has three, separated by dots.',
        hint: 'It has probably been truncated, or copied from somewhere that stripped the dots. ' +
              'Check both ends of what you copied.' };
    }
    if (parts.length === 2) {
      return { state: 'malformed', looksLike: name,
        problem: 'There are two segments. A signed JWT has three: header, payload and signature.',
        hint: 'The signature is usually what gets cut off, because it is last. Copy the whole value.' };
    }
    if (parts.length === 4 || parts.length > 5) {
      return { state: 'malformed', looksLike: name,
        problem: 'There are ' + parts.length + ' segments. A signed JWT has three and an encrypted ' +
                 'one has five.',
        hint: 'Check whether two values have been pasted together.' };
    }

    // The right number of segments, so the fault is inside one of them.
    const labels = ['header', 'payload', 'signature'];
    for (let i = 0; i < Math.min(parts.length, 2); i++) {
      if (!parts[i]) {
        return { state: 'malformed', looksLike: name,
          problem: 'The ' + labels[i] + ' segment is empty.',
          hint: 'Copy the whole token again. An empty segment means something was lost in transit.' };
      }
      let decoded;
      try {
        decoded = b64urlToText(parts[i]);
      } catch (e) {
        return { state: 'malformed', looksLike: name,
          problem: 'The ' + labels[i] + ' segment is not valid base64url.',
          hint: 'The usual causes are a truncated copy, a line break inserted by a terminal or a ' +
                'log viewer, or the token having been URL-encoded. Try copying it from the ' +
                'network tab rather than from a log.' };
      }
      try {
        JSON.parse(decoded);
      } catch (e) {
        return { state: 'malformed', looksLike: name,
          problem: 'The ' + labels[i] + ' segment decodes, but the result is not valid JSON: ' +
                   e.message + '.',
          hint: decoded.length < 400
            ? 'It decoded to: ' + decoded.slice(0, 200)
            : 'That usually means the segment is truncated part way through.' };
      }
    }
    return { state: 'malformed', looksLike: name,
      problem: 'The segments are present but authlint could not read them.',
      hint: 'Please open an issue with the token, redacted, because this should not happen.' };
  }

  /* ---------------- JSON ---------------- */

  if (/^[[{]/.test(text)) {
    try {
      const j = JSON.parse(text);
      const keys = j && typeof j === 'object' ? Object.keys(j).slice(0, 6).join(', ') : '';
      return { state: 'malformed', looksLike: 'a JSON document',
        problem: 'It parses, but it is not a shape authlint knows.' +
                 (keys ? ' Its top-level keys are: ' + keys + '.' : ''),
        hint: 'A key set needs a "keys" array. A discovery document needs "issuer" or ' +
              '"authorization_endpoint". If this is a token response, paste the access_token or ' +
              'id_token value from inside it.' };
    } catch (e) {
      return { state: 'malformed', looksLike: 'a JSON document',
        problem: 'It will not parse: ' + e.message + '.',
        hint: 'The common causes are a truncated copy, a trailing comma, or single quotes where ' +
              'JSON requires double.' };
    }
  }

  /* ---------------- XML ---------------- */

  // Raw XML, or base64 that turns out to be XML. Both arrive here, because
  // people paste SAMLResponse straight out of the form field as often as they
  // paste the document itself.
  let asXml = /^</.test(text) ? text : null;
  if (!asXml && peekBase64Xml(text)) {
    try {
      const full = b64urlToText(compact.slice(0, Math.floor(compact.length / 4) * 4));
      if (/^\s*</.test(full)) asXml = full;
    } catch (e) { /* falls through to the base64 branch below */ }
  }
  if (asXml) {
    const parsed = decodeXml(asXml);
    if (parsed.error) {
      return { state: 'malformed', looksLike: 'an XML document',
        problem: 'It will not parse. ' + parsed.error.replace(/^XML will not parse: /, ''),
        hint: 'A SAML response copied out of a browser is often truncated in the middle. Take it ' +
              'from the form field in the network tab rather than from the rendered page.' };
    }
    const root = parsed.doc.documentElement.localName;
    return { state: 'malformed', looksLike: 'an XML document with a <' + root + '> root',
      problem: 'It parses, but authlint does not have checks for that element.',
      hint: 'It reads SAML Response, Assertion, AuthnRequest and EntityDescriptor documents.' };
  }

  /* ---------------- base64 of something ---------------- */

  // Whitespace is stripped first because a base64 SAMLResponse arrives wrapped
  // at 76 columns, but a sentence of English with the spaces taken out also
  // matches the base64 alphabet. Line breaks are allowed, spaces are not.
  if (!/ /.test(text) && /^[A-Za-z0-9+/=_-]{24,}$/.test(compact)) {
    let decoded = null;
    try { decoded = b64urlToText(compact.slice(0, Math.floor(Math.min(compact.length, 600) / 4) * 4)); }
    catch (e) { /* handled below */ }

    if (decoded && /^\s*[[{]/.test(decoded)) {
      return { state: 'malformed', looksLike: 'base64-encoded JSON',
        problem: 'It decodes to JSON rather than to a document authlint recognises.',
        hint: 'Decode it yourself and paste the JSON, or paste the token inside it.' };
    }
    if (decoded && /[\x00-\x08\x0e-\x1f]/.test(decoded)) {
      return { state: 'malformed', looksLike: 'compressed or binary data',
        problem: 'It is valid base64, and what comes out is not text.',
        hint: 'SAML sent over the HTTP-Redirect binding is DEFLATE compressed, and authlint does ' +
              'not inflate it because that would mean a dependency. Use the POST binding version, ' +
              'which is what you want for debugging anyway.' };
    }
    return { state: 'unknown', looksLike: 'an opaque value',
      problem: 'It looks like base64 or a random identifier, with no structure inside it.',
      hint: 'Opaque access tokens and session identifiers have nothing to decode. That is by ' +
            'design, and the only thing that can tell you about one is the issuer\'s ' +
            'introspection endpoint.' };
  }

  /* ---------------- URLs ---------------- */

  if (/^https?:\/\//i.test(text)) {
    return { state: 'malformed', looksLike: 'a URL',
      problem: 'It has no query string and no fragment, so there are no parameters to check.',
      hint: 'Copy the authorization request as the browser had it, including everything after ' +
            'the question mark. In the network tab, tick Preserve log first, or the redirect ' +
            'will clear it before you get there.' };
  }

  /* ---------------- give up, usefully ---------------- */

  return { state: 'unknown', looksLike: null,
    problem: 'authlint does not recognise this.',
    hint: 'It reads ' + ACCEPTS + '. If you believe this should be one of those, please open an ' +
          'issue with the input, redacted.' };
}
