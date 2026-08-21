const { test } = require('node:test');
const assert = require('node:assert');
const { sandbox, jwt, NOW, has, titles } = require('./harness.js');
const { detect, decodeJwt, checkJwt, checkJwks, checkDiscovery, parseAuthz, checkAuthz,
        decodeXml, checkSamlResponse, checkSamlMetadata } = sandbox;

const good = { iss: 'https://id.example.com', sub: 'u-1', aud: 'api', iat: NOW - 60, exp: NOW + 600, jti: 'x' };
const runJwt = (h, p, sig) => checkJwt(decodeJwt(jwt(h, p, sig)), NOW);

/* ------------------------------ detection ------------------------------ */

test('detects each artifact from a bare paste', () => {
  assert.equal(detect(jwt({ alg: 'RS256' }, good)).kind, 'jwt');
  assert.equal(detect('Bearer ' + jwt({ alg: 'RS256' }, good)).kind, 'jwt');
  assert.equal(detect('{"keys":[]}').kind, 'jwks');
  assert.equal(detect('{"issuer":"https://x"}').kind, 'discovery');
  assert.equal(detect('https://id.example.com/authorize?response_type=code').kind, 'authz');
  assert.equal(detect('<samlp:Response xmlns:samlp="urn:x"/>').kind, 'samlresp');
  assert.equal(detect('<md:EntityDescriptor xmlns:md="urn:x"/>').kind, 'samlmeta');
  assert.equal(detect('response_type=code&client_id=a').kind, 'authz');
  assert.equal(detect('hello world').kind, null);
  assert.equal(detect('').kind, null);
});

test('a Bearer header is unwrapped before decoding', () => {
  const d = detect('Authorization: Bearer ' + jwt({ alg: 'RS256' }, good));
  assert.ok(d.rewrite && d.rewrite.split('.').length === 3);
});

/* ------------------------------ JWT ------------------------------ */

test('alg none is critical', () => {
  assert.ok(has(runJwt({ alg: 'none' }, good, ''), 'critical', 'unsigned'));
});

test('symmetric signing is flagged', () => {
  assert.ok(has(runJwt({ alg: 'HS256' }, good), 'warn', 'symmetric'));
});

test('key-nominating headers are critical', () => {
  assert.ok(has(runJwt({ alg: 'RS256', jku: 'https://evil/keys' }, good), 'critical', 'jku'));
  assert.ok(has(runJwt({ alg: 'RS256', x5u: 'https://evil/c' }, good), 'critical', 'x5u'));
  assert.ok(has(runJwt({ alg: 'RS256', jwk: { kty: 'RSA' } }, good), 'critical', 'own public key'));
});

test('missing exp and iss are critical', () => {
  const f = runJwt({ alg: 'RS256' }, { sub: 'u', aud: 'a', iat: NOW });
  assert.ok(has(f, 'critical', 'no exp'));
  assert.ok(has(f, 'critical', 'no iss'));
});

test('millisecond timestamps are caught', () => {
  const f = runJwt({ alg: 'RS256' }, Object.assign({}, good, { exp: (NOW + 600) * 1000 }));
  assert.ok(has(f, 'critical', 'milliseconds'));
});

test('lifetime thresholds', () => {
  const week = Object.assign({}, good, { iat: NOW, exp: NOW + 7 * 86400 });
  assert.ok(has(runJwt({ alg: 'RS256' }, week), 'warn', 'lifetime is'));
  const decade = Object.assign({}, good, { iat: NOW, exp: NOW + 10 * 31536000 });
  assert.ok(has(runJwt({ alg: 'RS256' }, decade), 'critical', 'lifetime is'));
  assert.ok(has(runJwt({ alg: 'RS256' }, good), 'ok', 'lifetime is'));
});

test('expired tokens are reported as a note, not a failure', () => {
  const f = runJwt({ alg: 'RS256' }, Object.assign({}, good, { exp: NOW - 60 }));
  assert.ok(has(f, 'note', 'expired'));
});

test('multiple audiences without azp', () => {
  const f = runJwt({ alg: 'RS256' }, Object.assign({}, good, { aud: ['a', 'b'] }));
  assert.ok(has(f, 'warn', 'multiple audiences'));
  const ok = runJwt({ alg: 'RS256' }, Object.assign({}, good, { aud: ['a', 'b'], azp: 'a' }));
  assert.ok(!has(ok, 'warn', 'multiple audiences'));
});

test('email as sub is flagged', () => {
  assert.ok(has(runJwt({ alg: 'RS256' }, Object.assign({}, good, { sub: 'a@b.com' })), 'warn', 'sub is an email'));
});

test('personal data in the payload is flagged', () => {
  const f = runJwt({ alg: 'RS256' }, Object.assign({}, good,
    { email: 'a@b.com', name: 'A', phone_number: '1', address: 'x' }));
  assert.ok(has(f, 'warn', 'personal data'));
});

test('oversized tokens and oversized claims', () => {
  const big = Object.assign({}, good, { groups: Array.from({ length: 500 }, (_, i) => 'group-number-' + i) });
  const f = runJwt({ alg: 'RS256' }, big);
  assert.ok(has(f, 'critical', 'bytes'));
  assert.ok(has(f, 'warn', 'groups has'));
});

test('a clean token produces no critical findings', () => {
  const f = runJwt({ alg: 'RS256', kid: 'k1', typ: 'JWT' }, good);
  assert.equal(f.filter(x => x.sev === 'critical').length, 0, titles(f).join('\n'));
});

test('every finding carries a why', () => {
  const f = runJwt({ alg: 'none' }, { sub: 'a@b.com' }, '');
  for (const x of f) {
    if (x.sev === 'ok') continue;
    assert.ok(x.why && x.why.length > 20, 'thin finding: ' + x.title);
  }
});

test('the signature disclaimer is always present', () => {
  assert.ok(has(runJwt({ alg: 'RS256' }, good), 'note', 'did not verify the signature'));
});

/* ------------------------------ JWKS ------------------------------ */

test('a symmetric key in a key set is critical', () => {
  const f = checkJwks({ keys: [{ kty: 'oct', kid: 'a', k: 'c2VjcmV0' }] }, NOW);
  assert.ok(has(f, 'critical', 'symmetric key'));
});

test('private parameters in a key set are critical', () => {
  const f = checkJwks({ keys: [{ kty: 'RSA', kid: 'a', n: 'AQAB', e: 'AQAB', d: 'secret' }] }, NOW);
  assert.ok(has(f, 'critical', 'private parameters'));
});

test('duplicate kids are critical', () => {
  const f = checkJwks({ keys: [{ kty: 'RSA', kid: 'a', n: 'AQAB' }, { kty: 'RSA', kid: 'a', n: 'AQAB' }] }, NOW);
  assert.ok(has(f, 'critical', 'duplicate kid'));
});

test('small RSA keys are critical and large ones pass', () => {
  const small = Buffer.alloc(128, 0xff).toString('base64url');   // 1024 bits
  const big = Buffer.alloc(256, 0xff).toString('base64url');     // 2048 bits
  assert.ok(has(checkJwks({ keys: [{ kty: 'RSA', kid: 'a', n: small }] }, NOW), 'critical', '1024 bits'));
  assert.ok(has(checkJwks({ keys: [{ kty: 'RSA', kid: 'b', n: big }] }, NOW), 'ok', '2048 bits'));
});

/* ------------------------------ discovery ------------------------------ */

const disco = {
  issuer: 'https://id.example.com',
  authorization_endpoint: 'https://id.example.com/authorize',
  token_endpoint: 'https://id.example.com/token',
  jwks_uri: 'https://id.example.com/jwks',
  response_types_supported: ['code'],
  code_challenge_methods_supported: ['S256'],
  id_token_signing_alg_values_supported: ['RS256'],
};

test('a healthy discovery document has no critical findings', () => {
  const f = checkDiscovery(disco, NOW);
  assert.equal(f.filter(x => x.sev === 'critical').length, 0, titles(f).join('\n'));
  assert.ok(has(f, 'ok', 'pkce with s256'));
});

test('missing PKCE is critical', () => {
  const d = Object.assign({}, disco); delete d.code_challenge_methods_supported;
  assert.ok(has(checkDiscovery(d, NOW), 'critical', 'no pkce'));
});

test('plain-only PKCE is critical, plain alongside S256 is a warning', () => {
  assert.ok(has(checkDiscovery(Object.assign({}, disco,
    { code_challenge_methods_supported: ['plain'] }), NOW), 'critical', 'without s256'));
  assert.ok(has(checkDiscovery(Object.assign({}, disco,
    { code_challenge_methods_supported: ['S256', 'plain'] }), NOW), 'warn', 'plain method'));
});

test('implicit flow and unsigned id tokens', () => {
  assert.ok(has(checkDiscovery(Object.assign({}, disco,
    { response_types_supported: ['code', 'id_token token'] }), NOW), 'warn', 'implicit flow'));
  assert.ok(has(checkDiscovery(Object.assign({}, disco,
    { id_token_signing_alg_values_supported: ['RS256', 'none'] }), NOW), 'critical', 'unsigned id tokens'));
});

test('trailing slash on the issuer is called out', () => {
  assert.ok(has(checkDiscovery(Object.assign({}, disco,
    { issuer: 'https://id.example.com/' }), NOW), 'note', 'trailing slash'));
});

test('plaintext jwks_uri is critical', () => {
  assert.ok(has(checkDiscovery(Object.assign({}, disco,
    { jwks_uri: 'http://id.example.com/jwks' }), NOW), 'critical', 'jwks_uri is not https'));
});

/* ------------------------------ authorization requests ------------------------------ */

const authz = q => checkAuthz(parseAuthz('https://id.example.com/authorize?' + q), NOW);

test('a correct authorization request passes', () => {
  const f = authz('response_type=code&client_id=a&state=abcdefghijkl&code_challenge=xyz&' +
                  'code_challenge_method=S256&redirect_uri=https://app.example.com/cb&scope=openid');
  assert.equal(f.filter(x => x.sev === 'critical').length, 0, titles(f).join('\n'));
  assert.ok(has(f, 'ok', 'pkce with s256'));
  assert.ok(has(f, 'ok', 'state present'));
});

test('missing PKCE and state', () => {
  const f = authz('response_type=code&client_id=a');
  assert.ok(has(f, 'critical', 'no pkce'));
  assert.ok(has(f, 'warn', 'no state'));
});

test('implicit response types are critical', () => {
  assert.ok(has(authz('response_type=token&client_id=a'), 'critical', 'returns tokens through the browser'));
});

test('a client secret in the URL is critical', () => {
  assert.ok(has(authz('response_type=code&client_id=a&client_secret=s'), 'critical', 'client_secret is in the url'));
});

test('redirect_uri problems', () => {
  assert.ok(has(authz('response_type=code&redirect_uri=' +
    encodeURIComponent('https://app.example.com/*')), 'critical', 'wildcard'));
  assert.ok(has(authz('response_type=code&redirect_uri=' +
    encodeURIComponent('http://app.example.com/cb')), 'critical', 'plaintext http'));
  assert.ok(!has(authz('response_type=code&redirect_uri=' +
    encodeURIComponent('http://localhost:8080/cb')), 'critical', 'plaintext http'));
});

test('an id_token request with no nonce is critical', () => {
  assert.ok(has(authz('response_type=code%20id_token&client_id=a&code_challenge=x&' +
    'code_challenge_method=S256&state=abcdefghijkl'), 'critical', 'no nonce'));
});

test('a callback carrying an access token is critical', () => {
  const f = checkAuthz(parseAuthz('https://app.example.com/cb#access_token=abc&state=xyzabcdefghi'), NOW);
  assert.ok(has(f, 'critical', 'access token came back in the url'));
});

/* ------------------------------ SAML ------------------------------ */

const SAML = (opts = {}) => `<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
  xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
  xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
  ID="_r1" Destination="https://sp.example.com/acs" InResponseTo="_q1">
  <samlp:Status><samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/></samlp:Status>
  ${opts.responseSigned ? '<ds:Signature><ds:SignedInfo><ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/><ds:Reference URI="#_r1"><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/></ds:Reference></ds:SignedInfo></ds:Signature>' : ''}
  <saml:Assertion ID="${opts.assertionId || '_a1'}">
    ${opts.assertionSigned ? '<ds:Signature><ds:SignedInfo><ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/><ds:Reference URI="#_a1"><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/></ds:Reference></ds:SignedInfo></ds:Signature>' : ''}
    <saml:Subject>
      <saml:NameID Format="urn:oasis:names:tc:SAML:2.0:nameid-format:persistent">u-1</saml:NameID>
      <saml:SubjectConfirmation><saml:SubjectConfirmationData Recipient="https://sp.example.com/acs"/></saml:SubjectConfirmation>
    </saml:Subject>
    <saml:Conditions NotBefore="2027-01-15T11:59:00Z" NotOnOrAfter="${opts.notOnOrAfter || '2027-01-15T12:04:00Z'}">
      ${opts.noAudience ? '' : '<saml:AudienceRestriction><saml:Audience>https://sp.example.com</saml:Audience></saml:AudienceRestriction>'}
    </saml:Conditions>
  </saml:Assertion>
  ${opts.secondAssertion ? '<saml:Assertion ID="_a2"><saml:Subject><saml:NameID>attacker</saml:NameID></saml:Subject></saml:Assertion>' : ''}
</samlp:Response>`;

const saml = opts => checkSamlResponse(decodeXml(SAML(opts)), 1800000000);

test('a well-formed signed assertion passes', () => {
  const f = saml({ assertionSigned: true });
  assert.equal(f.filter(x => x.sev === 'critical').length, 0, titles(f).join('\n'));
  assert.ok(has(f, 'ok', 'assertion is signed'));
  assert.ok(has(f, 'ok', 'status: success'));
});

test('response signed but assertion unsigned is the wrapping case', () => {
  const f = saml({ responseSigned: true });
  assert.ok(has(f, 'critical', 'assertion inside it is not'));
});

test('nothing signed at all', () => {
  assert.ok(has(saml({}), 'critical', 'nothing is signed'));
});

test('two assertions and duplicate ids', () => {
  assert.ok(has(saml({ assertionSigned: true, secondAssertion: true }), 'critical', '2 assertions'));
  const dup = checkSamlResponse(decodeXml(SAML({ assertionSigned: true }).replace('ID="_r1"', 'ID="_a1"')), 1800000000);
  assert.ok(has(dup, 'critical', 'duplicate id'));
});

test('a missing audience restriction is critical', () => {
  assert.ok(has(saml({ assertionSigned: true, noAudience: true }), 'critical', 'no audiencerestriction'));
});

test('a wide validity window is a warning', () => {
  assert.ok(has(saml({ assertionSigned: true, notOnOrAfter: '2027-01-15T18:00:00Z' }), 'warn', 'validity window'));
});

test('sha1 signatures are flagged', () => {
  const weak = SAML({ assertionSigned: true }).replace(/xmldsig-more#rsa-sha256/g, 'xmldsig#rsa-sha1');
  assert.ok(has(checkSamlResponse(decodeXml(weak), 1800000000), 'warn', 'signature algorithm'));
});

test('an email NameID is flagged', () => {
  const em = SAML({ assertionSigned: true })
    .replace('nameid-format:persistent">u-1', 'nameid-format:emailAddress">a@b.com');
  assert.ok(has(checkSamlResponse(decodeXml(em), 1800000000), 'warn', 'nameid is an email'));
});

test('base64 SAML is decoded before checking', () => {
  const b64 = Buffer.from(SAML({ assertionSigned: true })).toString('base64');
  const x = decodeXml(b64);
  assert.ok(!x.error, x.error);
  assert.ok(has(checkSamlResponse(x, 1800000000), 'ok', 'assertion is signed'));
});

test('a failed status is surfaced with its code', () => {
  const denied = SAML({ assertionSigned: true })
    .replace('status:Success', 'status:Responder');
  assert.ok(has(checkSamlResponse(decodeXml(denied), 1800000000), 'note', 'not success'));
});

/* ------------------------------ metadata ------------------------------ */

test('metadata refusing signed assertions is critical', () => {
  const md = `<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="https://sp.example.com">
    <md:SPSSODescriptor WantAssertionsSigned="false" AuthnRequestsSigned="true">
      <md:AssertionConsumerService Location="https://sp.example.com/acs"/>
    </md:SPSSODescriptor></md:EntityDescriptor>`;
  assert.ok(has(checkSamlMetadata(decodeXml(md), NOW), 'critical', 'wantassertionssigned is false'));
});

test('plaintext endpoints in metadata are critical', () => {
  const md = `<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata">
    <md:SPSSODescriptor WantAssertionsSigned="true">
      <md:AssertionConsumerService Location="http://sp.example.com/acs"/>
    </md:SPSSODescriptor></md:EntityDescriptor>`;
  assert.ok(has(checkSamlMetadata(decodeXml(md), NOW), 'critical', 'plaintext http'));
});

/* ------------------------------ robustness ------------------------------ */

test('garbage never throws', () => {
  const inputs = ['', '.', '..', 'a.b', 'a.b.c', '{', '{}', '[]', '<', '<a>', 'https://',
                  'Bearer ', 'eyJ.eyJ.', '{"keys":null}', '{"issuer":123}'];
  for (const i of inputs) {
    assert.doesNotThrow(() => {
      const d = detect(i);
      if (d.kind === 'jwt') decodeJwt(d.rewrite || i);
    }, 'threw on: ' + JSON.stringify(i));
  }
});

/* ------------------------------ hostile input ------------------------------ */
/* Findings quote the artifact back at you: kid values, issuers, status codes,
   claim names. Every one of those is attacker-controlled, and all of it is
   rendered into the page. The renderer escapes, and these prove the check layer
   passes the hostile string through as data rather than mangling or losing it,
   so a regression in escaping shows up as a visible change rather than silently.
   The browser-side proof that nothing executes is in test/xss.browser.js. */

const XSS = '<img src=x onerror=alert(1)>';

test('hostile strings survive into findings as data', () => {
  const f = checkJwt(decodeJwt(jwt({ alg: 'RS256' },
    Object.assign({}, good, { iss: 'http://' + XSS }))), NOW);
  const hit = f.find(x => x.title.includes('iss is a plaintext http URL'));
  assert.ok(hit, 'expected the issuer finding');
  assert.ok(hit.title.includes(XSS), 'the value should be carried verbatim, for the renderer to escape');
});

test('a script-closing sequence in a claim does not break the checks', () => {
  const f = checkJwt(decodeJwt(jwt({ alg: 'RS256' },
    Object.assign({}, good, { sub: '</script><script>alert(1)</script>' }))), NOW);
  assert.ok(f.length > 0);
  assert.ok(f.every(x => typeof x.title === 'string'));
});

test('hostile kid and status values reach the finding intact', () => {
  const j = checkJwks({ keys: [{ kty: 'RSA', kid: XSS, n: 'AQAB' }, { kty: 'RSA', kid: XSS, n: 'AQAB' }] }, NOW);
  assert.ok(j.some(x => x.title.includes(XSS)));
  const denied = SAML({ assertionSigned: true }).replace('status:Success', 'status:' + 'Bad&lt;x');
  assert.doesNotThrow(() => checkSamlResponse(decodeXml(denied), NOW));
});

test('a claim name that is HTML does not break the PII scan', () => {
  const p = Object.assign({}, good);
  p[XSS] = 'x';
  assert.doesNotThrow(() => checkJwt(decodeJwt(jwt({ alg: 'RS256' }, p)), NOW));
});

test('an enormous payload does not hang the checks', () => {
  const p = Object.assign({}, good, { blob: 'x'.repeat(200000) });
  const t0 = Date.now();
  checkJwt(decodeJwt(jwt({ alg: 'RS256' }, p)), NOW);
  assert.ok(Date.now() - t0 < 2000, 'checks took too long on a large payload');
});

test('deeply nested XML does not hang the parser', () => {
  const deep = '<a>'.repeat(400) + 'x' + '</a>'.repeat(400);
  const x = decodeXml('<samlp:Response xmlns:samlp="urn:x">' + deep + '</samlp:Response>');
  assert.ok(!x.error, x.error);
  const t0 = Date.now();
  checkSamlResponse(x, NOW);
  assert.ok(Date.now() - t0 < 2000, 'SAML checks took too long on deep nesting');
});

test('a plaintext http issuer is reported', () => {
  const f = runJwt({ alg: 'RS256' }, Object.assign({}, good, { iss: 'http://id.example.com' }));
  assert.ok(has(f, 'warn', 'plaintext http url'));
});

test('a non-URL issuer is a note, not a warning', () => {
  const f = runJwt({ alg: 'RS256' }, Object.assign({}, good, { iss: 'my-auth-service' }));
  assert.ok(has(f, 'note', 'iss is not a URL'));
});

/* ------------------------------ diagnosis of bad pastes ------------------------------
   The paste box accepts anything, so the two answers it can give when a check
   never runs both have to be worth reading: "I know what this is and it is
   broken" and "I do not read this". */

const { diagnose } = sandbox;

test('an empty paste is not diagnosed at all', () => {
  assert.equal(diagnose(''), null);
  assert.equal(diagnose('   \n '), null);
});

test('prose is unknown, and says what is accepted', () => {
  const d = diagnose('please help me with my login problem');
  assert.equal(d.state, 'unknown');
  assert.equal(d.looksLike, null);
  assert.match(d.hint, /JWT/);
});

test('a truncated JWT is malformed, not unknown, and names the missing part', () => {
  const full = jwt({ alg: 'RS256' }, good);
  const two = full.split('.').slice(0, 2).join('.');
  const d2 = diagnose(two);
  assert.equal(d2.state, 'malformed');
  assert.equal(d2.looksLike, 'a JWT');
  assert.match(d2.problem, /two segments/i);

  const d1 = diagnose(full.split('.')[0]);
  assert.equal(d1.state, 'malformed');
  assert.match(d1.problem, /one segment/i);
});

test('too many segments is reported with the count', () => {
  const d = diagnose(jwt({ alg: 'RS256' }, good) + '.extra');
  assert.equal(d.state, 'malformed');
  assert.match(d.problem, /4 segments/);
});

test('a JWT segment that is not base64url is named by segment', () => {
  const parts = jwt({ alg: 'RS256' }, good).split('.');
  const d = diagnose(parts[0] + '.' + 'not base64!!' .replace(/ /g, '') + '.sig');
  assert.equal(d.state, 'malformed');
});

test('a JWT segment that decodes to something other than JSON is called out', () => {
  const head = Buffer.from(JSON.stringify({ alg: 'RS256' })).toString('base64url');
  const bad = Buffer.from('this is not json at all').toString('base64url');
  const d = diagnose(head + '.' + bad + '.c2ln');
  assert.equal(d.state, 'malformed');
  assert.match(d.problem, /payload segment decodes, but/i);
});

test('a hostname is not mistaken for a JWT missing a segment', () => {
  const d = diagnose('id.example.com');
  assert.notEqual(d.looksLike, 'a JWT');
});

test('JSON that parses but is an unknown shape lists its keys', () => {
  const d = diagnose('{"foo":1,"bar":2}');
  assert.equal(d.state, 'malformed');
  assert.equal(d.looksLike, 'a JSON document');
  assert.match(d.problem, /foo, bar/);
});

test('JSON that will not parse says so', () => {
  const d = diagnose('{"foo":1,}');
  assert.equal(d.state, 'malformed');
  assert.match(d.problem, /will not parse/i);
});

test('XML with an unrecognised root is malformed rather than run as SAML', () => {
  assert.equal(detect('<order><id>7</id></order>').kind, null);
  const d = diagnose('<order><id>7</id></order>');
  assert.equal(d.state, 'malformed');
  assert.match(d.looksLike, /<order> root/);
});

/* The test parser is much more forgiving than a browser's, so this uses input
   with no root element at all, which both reject. test/security.browser.js is
   where truncated-mid-tag input meets a real DOMParser. */
test('XML that will not parse is reported as unparseable', () => {
  const d = diagnose('<?xml version="1.0"?>');
  assert.equal(d.state, 'malformed');
  assert.equal(d.looksLike, 'an XML document');
  assert.match(d.problem, /will not parse/i);
});

test('base64 of unrecognised XML is unwrapped before being diagnosed', () => {
  const b64 = Buffer.from('<order><id>7</id></order>'.repeat(4)).toString('base64');
  const d = diagnose(b64);
  assert.match(d.looksLike, /<order> root/);
});

test('a PEM private key is refused rather than parsed', () => {
  const d = diagnose('-----BEGIN RSA PRIVATE KEY-----\nAAAA\n-----END RSA PRIVATE KEY-----');
  assert.equal(d.state, 'unknown');
  assert.match(d.looksLike, /private key/);
});

test('a PEM certificate points at where certificates are checked', () => {
  const d = diagnose('-----BEGIN CERTIFICATE-----\nAAAA\n-----END CERTIFICATE-----');
  assert.equal(d.state, 'unknown');
  assert.match(d.hint, /metadata|JWKS/);
});

test('a cookie header is recognised and explained', () => {
  const d = diagnose('Cookie: session=abc123; path=/');
  assert.equal(d.state, 'unknown');
  assert.match(d.looksLike, /cookie/i);
});

test('an opaque token is called opaque rather than unrecognised', () => {
  const d = diagnose('a'.repeat(64));
  assert.equal(d.state, 'unknown');
  assert.match(d.looksLike, /opaque/);
});

test('base64 of JSON suggests decoding it first', () => {
  const d = diagnose(Buffer.from('{"hello":"world","and":"more padding here"}').toString('base64'));
  assert.match(d.looksLike, /base64-encoded JSON/);
});

test('binary base64 points at the POST binding', () => {
  const d = diagnose(Buffer.from([0x78, 0x9c, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4,
                                  5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0]).toString('base64'));
  assert.match(d.hint, /POST binding/);
});

test('a URL with no query string says which part is missing', () => {
  const d = diagnose('https://id.example.com/authorize');
  assert.equal(d.state, 'malformed');
  assert.equal(d.looksLike, 'a URL');
  assert.match(d.problem, /no query string/i);
});

test('every diagnosis carries something a person can act on', () => {
  const inputs = ['hello', '{"a":1}', '{bad', '<x/>', 'a'.repeat(40), 'https://x.example',
                  'Cookie: a=b', '-----BEGIN CERTIFICATE-----\nAA\n-----END CERTIFICATE-----',
                  jwt({ alg: 'RS256' }, good).split('.').slice(0, 2).join('.')];
  for (const i of inputs) {
    const d = diagnose(i);
    assert.ok(d && d.problem && d.hint, 'no actionable diagnosis for: ' + i.slice(0, 30));
    assert.ok(d.state === 'malformed' || d.state === 'unknown', 'bad state for: ' + i.slice(0, 30));
  }
});
