/* ============================== DETECT ==============================
   One box, and the tool works out what you pasted. Nobody debugging a
   federation problem at 2am wants to first tell a form what kind of artifact
   they are holding, and half the time they are not sure.

   Order matters: the cheapest and most certain shapes are tested first, and
   anything ambiguous falls through to a guess with a stated confidence. */

const KINDS = {
  jwt:       'JSON Web Token',
  jwks:      'JSON Web Key Set',
  discovery: 'OpenID Connect discovery document',
  authz:     'OAuth 2.0 authorization request',
  samlresp:  'SAML response',
  samlreq:   'SAML authentication request',
  samlmeta:  'SAML metadata',
  saml:      'SAML document',
};

function detect(raw) {
  const text = String(raw || '').trim();
  if (!text) return { kind: null };

  // A JWT is three or five base64url segments. Check this first: it is the
  // most common paste and the least ambiguous shape there is.
  if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]*){1,3}$/.test(text.replace(/\s+/g, ''))) {
    return { kind: 'jwt', confidence: 'certain' };
  }

  // A bearer header pasted whole, which people do constantly.
  const bearer = text.match(/^(?:Authorization:\s*)?Bearer\s+([A-Za-z0-9_.-]+)$/i);
  if (bearer) return { kind: 'jwt', confidence: 'certain', rewrite: bearer[1] };

  // A URL: either an authorization request or a redirect carrying the result.
  if (/^https?:\/\//i.test(text) && /[?#]/.test(text)) {
    return { kind: 'authz', confidence: 'certain' };
  }

  // JSON: which document depends on what is inside it.
  if (/^[\[{]/.test(text)) {
    try {
      const j = JSON.parse(text);
      if (j && Array.isArray(j.keys)) return { kind: 'jwks', confidence: 'certain' };
      if (j && (j.issuer || j.authorization_endpoint || j.jwks_uri)) {
        return { kind: 'discovery', confidence: 'certain' };
      }
      if (j && (j.kty || j.n || j.crv)) return { kind: 'jwks', confidence: 'likely', wrapSingleKey: true };
      return { kind: null, reason: 'JSON, but not a shape authlint knows' };
    } catch (e) {
      return { kind: null, reason: 'starts like JSON but will not parse: ' + e.message };
    }
  }

  // XML, either raw or base64. Look at the root element to tell them apart.
  const xmlish = /^\s*</.test(text) ? text : peekBase64Xml(text);
  if (xmlish) {
    if (/<[\w:]*EntityDescriptor/i.test(xmlish) || /<[\w:]*EntitiesDescriptor/i.test(xmlish)) {
      return { kind: 'samlmeta', confidence: 'certain' };
    }
    if (/<[\w:]*Response/i.test(xmlish)) return { kind: 'samlresp', confidence: 'certain' };
    if (/<[\w:]*AuthnRequest/i.test(xmlish)) return { kind: 'samlreq', confidence: 'certain' };
    if (/<[\w:]*Assertion/i.test(xmlish)) return { kind: 'samlresp', confidence: 'likely' };
    if (/<[\w:]*LogoutRequest/i.test(xmlish) || /<[\w:]*LogoutResponse/i.test(xmlish)) {
      return { kind: 'saml', confidence: 'likely' };
    }
    // Parses as XML but the root is not one of the SAML elements. Running the
    // SAML checks over it would produce a page of findings about a document
    // that was never SAML, so hand it to diagnose instead.
    return { kind: null, reason: 'XML, but not a document authlint knows' };
  }

  // A bare query string, which is what you get from copying out of a HAR file.
  if (/(^|[?&])(response_type|client_id|redirect_uri|code_challenge)=/.test(text)) {
    return { kind: 'authz', confidence: 'likely', asQuery: true };
  }

  return { kind: null, reason: 'authlint cannot tell what this is' };
}

function peekBase64Xml(text) {
  const candidate = text.replace(/\s+/g, '');
  if (!/^[A-Za-z0-9+/=_-]{40,}$/.test(candidate)) return null;
  try {
    // Slice on a 4-character boundary so the peek does not fail on padding.
    const head = candidate.slice(0, Math.floor(Math.min(candidate.length, 400) / 4) * 4);
    const decoded = b64urlToText(head);
    return /^\s*</.test(decoded) ? decoded : null;
  } catch (e) { return null; }
}
