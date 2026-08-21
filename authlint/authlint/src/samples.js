/* ============================== SAMPLES ==============================
   Deliberately broken examples, so the first thing a visitor sees is the tool
   doing its job rather than an empty box. Everything here is invented: the
   domains are example.com, the names are from the history of computing, and
   the signature is the word "signature" in base64.

   The token is assembled at load time rather than pasted in as a constant, so
   its expiry is always relative to now and the demo never rots. */

function b64url(obj) {
  const json = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function buildSampleJwt() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    iss: 'https://login.example.com/',
    sub: 'ada.lovelace@example.com',
    aud: ['api://orders', 'api://billing'],
    iat: now - 120,
    exp: now + 7 * 24 * 3600,
    email: 'ada.lovelace@example.com',
    name: 'Ada Lovelace',
    phone_number: '+1-555-0100',
    scope: 'orders.read billing.write',
    groups: Array.from({ length: 60 }, (_, i) => 'grp-' + String(i).padStart(3, '0')),
  };
  return b64url(header) + '.' + b64url(payload) + '.c2lnbmF0dXJl';
}

function buildSampleSaml() {
  const now = Date.now();
  const iso = ms => new Date(ms).toISOString().replace(/\.\d+Z$/, 'Z');
  return [
    '<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"',
    '  xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"',
    '  ID="_res-0001" Version="2.0" IssueInstant="' + iso(now - 5000) + '">',
    '  <saml:Issuer>https://idp.example.com/metadata</saml:Issuer>',
    '  <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#">',
    '    <ds:SignedInfo>',
    '      <ds:SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>',
    '      <ds:Reference URI="#_res-0001">',
    '        <ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>',
    '        <ds:DigestValue>ZGlnZXN0</ds:DigestValue>',
    '      </ds:Reference>',
    '    </ds:SignedInfo>',
    '    <ds:SignatureValue>c2lnbmF0dXJl</ds:SignatureValue>',
    '  </ds:Signature>',
    '  <samlp:Status>',
    '    <samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>',
    '  </samlp:Status>',
    '  <saml:Assertion ID="_asr-0001" Version="2.0" IssueInstant="' + iso(now - 5000) + '">',
    '    <saml:Issuer>https://idp.example.com/metadata</saml:Issuer>',
    '    <saml:Subject>',
    '      <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">',
    '        grace.hopper@example.com</saml:NameID>',
    '      <saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">',
    '        <saml:SubjectConfirmationData NotOnOrAfter="' + iso(now + 4 * 3600 * 1000) + '"/>',
    '      </saml:SubjectConfirmation>',
    '    </saml:Subject>',
    '    <saml:Conditions NotBefore="' + iso(now - 60000) + '"',
    '      NotOnOrAfter="' + iso(now + 4 * 3600 * 1000) + '"/>',
    '    <saml:AuthnStatement AuthnInstant="' + iso(now - 5000) + '">',
    '      <saml:AuthnContext>',
    '        <saml:AuthnContextClassRef>',
    '          urn:oasis:names:tc:SAML:2.0:ac:classes:Password</saml:AuthnContextClassRef>',
    '      </saml:AuthnContext>',
    '    </saml:AuthnStatement>',
    '    <saml:AttributeStatement>',
    '      <saml:Attribute Name="mail">',
    '        <saml:AttributeValue>grace.hopper@example.com</saml:AttributeValue>',
    '      </saml:Attribute>',
    '      <saml:Attribute Name="employeeNumber">',
    '        <saml:AttributeValue>004401</saml:AttributeValue>',
    '      </saml:Attribute>',
    '    </saml:AttributeStatement>',
    '  </saml:Assertion>',
    '</samlp:Response>',
  ].join('\n');
}

const SAMPLES = {
  jwt: buildSampleJwt(),

  authz: 'https://login.example.com/oauth2/authorize' +
    '?response_type=token' +
    '&client_id=web-console' +
    '&redirect_uri=http://app.example.com/callback/*' +
    '&scope=openid%20profile%20admin.all' +
    '&client_secret=s3cr3t-do-not-do-this',

  discovery: JSON.stringify({
    issuer: 'https://login.example.com/',
    authorization_endpoint: 'https://login.example.com/oauth2/authorize',
    token_endpoint: 'https://login.example.com/oauth2/token',
    userinfo_endpoint: 'https://login.example.com/oauth2/userinfo',
    jwks_uri: 'https://login.example.com/.well-known/jwks.json',
    response_types_supported: ['code', 'token', 'id_token token'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['RS256', 'HS256'],
    token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post'],
    scopes_supported: ['openid', 'profile', 'email'],
  }, null, 2),

  jwks: JSON.stringify({
    keys: [
      { kty: 'RSA', use: 'sig', kid: 'rotation-2024', alg: 'RS256', e: 'AQAB',
        n: 'sVJ0Zn3nqvJ7pQx2vN1kLwYyR8mFtHc0dGvBpKzXaQwErTyUiOpAsDfGhJkLzXcVbNmQwErTyUi' +
           'OpAsDfGhJkLzXcVbNmQwErTyUiOpAsDfGhJkLzXcVbNmQwErTyUiOpAsDfGhJkLzXcVbNm' },
      { kty: 'oct', use: 'sig', kid: 'legacy-hmac', alg: 'HS256',
        k: 'c3VwZXItc2VjcmV0LXNoYXJlZC1rZXktZG8tbm90LXB1Ymxpc2g' },
    ],
  }, null, 2),

  saml: buildSampleSaml(),
};
