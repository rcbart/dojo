/* ============================== SAML CHECKS ==============================
   SAML is where the interesting failures live, because the security of the
   whole exchange rests on which element the signature covers, and that is
   invisible unless you go looking. Every check here is something you cannot
   see by reading a decoded assertion in a text editor. */

const WEAK_SIG = /sha1|md5|dsa-sha1/i;

function checkSamlResponse(x, now) {
  const f = [];
  const doc = x.doc;
  const root = doc.documentElement;
  const isResponse = /Response$/i.test(root.localName);
  const assertions = els(root, 'Assertion').concat(els(root, 'EncryptedAssertion'));

  /* ---------------- status ---------------- */
  const sc = el(root, 'StatusCode');
  if (sc) {
    const v = attr(sc, 'Value') || '';
    if (!/:Success$/i.test(v)) {
      const inner = els(root, 'StatusCode')[1];
      const msg = el(root, 'StatusMessage');
      f.push(F('note', 'Status is not Success: ' + v.split(':').pop() +
        (inner ? ' / ' + String(attr(inner, 'Value')).split(':').pop() : ''),
        (msg && msg.textContent ? 'Provider message: ' + msg.textContent.trim() :
         'The identity provider refused. The second-level code is usually the useful one.')));
    } else {
      f.push(F('ok', 'Status: Success', ''));
    }
  }

  /* ---------------- the signature question, which is the whole game ---------------- */
  const allSigs = els(root, 'Signature');
  const responseSigned = allSigs.some(s => s.parentNode === root);
  const signedAssertions = assertions.filter(a =>
    els(a, 'Signature').some(s => s.parentNode === a));

  if (!allSigs.length) {
    f.push(F('critical', 'Nothing is signed',
      'There is no signature anywhere in this document, so nothing establishes that the identity ' +
      'provider produced it. Anyone who can reach the assertion consumer service can log in as anyone.',
      'Require signed assertions at the service provider and reject unsigned responses.',
      'SAML 2.0 Core §5'));
  } else if (assertions.length && !signedAssertions.length && responseSigned) {
    f.push(F('critical', 'The response is signed but the assertion inside it is not',
      'This is the classic SAML break. A service provider that validates the response signature and ' +
      'then reads the assertion can be fed a second, unsigned assertion wrapped into the document. ' +
      'The signature still verifies, because it covers the element it always covered.',
      'Sign the assertion, and validate the signature on the element you actually consume.',
      'XML signature wrapping, CVE-2017-11427 and family'));
  } else if (signedAssertions.length) {
    f.push(F('ok', 'Assertion is signed' + (responseSigned ? ' (and so is the response)' : ''), ''));
  }

  if (assertions.length > 1) {
    f.push(F('critical', 'Document contains ' + assertions.length + ' assertions',
      'A legitimate response carries one. More than one is the shape of a signature wrapping attack, ' +
      'where the signed original is kept to satisfy verification and an injected copy is what gets read.',
      'Reject any response with more than one assertion.', 'XML signature wrapping'));
  }

  /* Duplicate IDs are the mechanism wrapping attacks rely on. */
  const ids = {};
  const withId = doc.getElementsByTagName('*');
  for (let i = 0; i < withId.length; i++) {
    const id = withId[i].getAttribute && withId[i].getAttribute('ID');
    if (!id) continue;
    if (ids[id]) {
      f.push(F('critical', 'Duplicate ID attribute: ' + id,
        'Signature references resolve by ID. Two elements sharing one means the element that gets ' +
        'verified and the element that gets read can be different elements.',
        'Reject the document.', 'XML signature wrapping'));
      break;
    }
    ids[id] = true;
  }

  for (const s of allSigs) {
    const sm = el(s, 'SignatureMethod');
    const dm = el(s, 'DigestMethod');
    const sa = attr(sm, 'Algorithm') || '';
    const da = attr(dm, 'Algorithm') || '';
    if (WEAK_SIG.test(sa)) {
      f.push(F('warn', 'Signature algorithm is ' + sa.split('#').pop(),
        'SHA-1 is retired for signatures. Plenty of deployments still run it because the other side ' +
        'never upgraded, and it is worth knowing which side that is.',
        'Move to rsa-sha256.', 'NIST SP 800-131A'));
      break;
    }
    if (WEAK_SIG.test(da)) {
      f.push(F('warn', 'Digest algorithm is ' + da.split('#').pop(),
        'A SHA-1 digest weakens the signature regardless of the signature algorithm above it.',
        'Move to sha256.', 'NIST SP 800-131A'));
      break;
    }
  }
  if (allSigs.length && !allSigs.some(s => {
    const sa = attr(el(s, 'SignatureMethod'), 'Algorithm') || '';
    return WEAK_SIG.test(sa);
  })) {
    f.push(F('ok', 'Signature and digest algorithms are current', ''));
  }

  /* ---------------- who this is for ---------------- */
  const audiences = els(root, 'Audience').map(a => a.textContent.trim()).filter(Boolean);
  const hasRestriction = els(root, 'AudienceRestriction').length > 0;
  if (assertions.length && !hasRestriction) {
    f.push(F('critical', 'No AudienceRestriction',
      'Nothing scopes this assertion to one service provider. Any SP that trusts the same identity ' +
      'provider will accept it, so a malicious or compromised SP can replay it elsewhere.',
      'Add an AudienceRestriction and check it against your own entity ID.', 'SAML 2.0 Core §2.5.1.4'));
  } else if (audiences.length) {
    f.push(F('ok', 'Audience: ' + audiences.join(', '), ''));
  }

  const dest = attr(root, 'Destination');
  if (isResponse && !dest) {
    f.push(F('warn', 'No Destination attribute',
      'The response does not say where it was meant to be delivered, so it cannot be detected when ' +
      'it is delivered somewhere else.',
      'Set Destination and compare it to your own ACS URL.', 'SAML 2.0 Core §3.2.2'));
  }

  if (isResponse && !attr(root, 'InResponseTo')) {
    f.push(F('note', 'No InResponseTo, so this is IdP-initiated',
      'There is no request to correlate against, which means no protection against an attacker ' +
      'submitting a captured assertion to your ACS endpoint in a victim\'s browser.',
      'Prefer SP-initiated sign-on. If you must accept IdP-initiated, be strict about replay.',
      'SAML 2.0 Core §3.2.2'));
  }

  /* ---------------- validity windows ---------------- */
  const conds = el(root, 'Conditions');
  if (assertions.length && !conds) {
    f.push(F('critical', 'Assertion has no Conditions element',
      'No validity window at all, so the assertion never goes stale and a captured one works forever.',
      'Emit NotBefore and NotOnOrAfter.', 'SAML 2.0 Core §2.5'));
  } else if (conds) {
    const nb = attr(conds, 'NotBefore'), na = attr(conds, 'NotOnOrAfter');
    if (!na) {
      f.push(F('critical', 'Conditions has no NotOnOrAfter',
        'The assertion does not expire.', 'Set a window of minutes.', 'SAML 2.0 Core §2.5.1.2'));
    } else {
      const end = Date.parse(na), start = nb ? Date.parse(nb) : null;
      if (!isNaN(end)) {
        const remaining = (end - now * 1000) / 1000;
        if (remaining < 0) {
          f.push(F('note', 'Assertion expired ' + secondsToHuman(-remaining) + ' ago', ''));
        } else {
          f.push(F('ok', 'Assertion valid for another ' + secondsToHuman(remaining), ''));
        }
        if (start && !isNaN(start)) {
          const life = (end - start) / 1000;
          if (life > 3600) {
            f.push(F('warn', 'Validity window is ' + secondsToHuman(life),
              'A SAML assertion is a single-use sign-on artifact. A window this wide gives a captured ' +
              'assertion a long useful life.',
              'Five minutes is typical. Widen only as far as your clock skew genuinely requires.'));
          } else {
            f.push(F('ok', 'Validity window is ' + secondsToHuman(life), ''));
          }
        }
      }
    }
  }

  const scd = el(root, 'SubjectConfirmationData');
  if (assertions.length && scd && !attr(scd, 'Recipient')) {
    f.push(F('warn', 'SubjectConfirmationData has no Recipient',
      'Nothing states which endpoint may consume this, which is the per-assertion version of the ' +
      'Destination check.', '', 'SAML 2.0 Core §2.4.1.2'));
  }

  /* ---------------- the subject ---------------- */
  const nameId = el(root, 'NameID');
  if (nameId) {
    const fmt = String(attr(nameId, 'Format') || '').split(':').pop();
    const val = nameId.textContent.trim();
    if (/emailAddress/i.test(fmt) || looksLikeEmail(val)) {
      f.push(F('warn', 'NameID is an email address',
        'Email addresses get changed on marriage and reissued after someone leaves. Either the ' +
        'account is orphaned or the next holder inherits it.',
        'Federate on an opaque immutable identifier and carry the email as an attribute.',
        'SAML 2.0 Core §8.3'));
    } else if (/transient/i.test(fmt)) {
      f.push(F('note', 'NameID format is transient',
        'A new identifier every sign-on. Correct for privacy, and it means the service provider ' +
        'cannot link this session to a stored account unless an attribute does it.', '', 'SAML 2.0 Core §8.3.8'));
    } else if (/unspecified/i.test(fmt)) {
      f.push(F('note', 'NameID format is unspecified',
        'Both sides are guessing at what the value means, which works right up until the identity ' +
        'provider changes it.', 'Agree a format explicitly.', 'SAML 2.0 Core §8.3.1'));
    } else if (/persistent/i.test(fmt)) {
      f.push(F('ok', 'NameID format is persistent', ''));
    }
  }

  const acr = el(root, 'AuthnContextClassRef');
  if (acr) {
    const v = acr.textContent.trim().split(':').pop();
    if (/^(Password|unspecified|PasswordProtectedTransport)$/i.test(v)) {
      f.push(F('note', 'AuthnContext is ' + v,
        'The assertion is telling you a password was used. If you rely on the identity provider for ' +
        'multi-factor, this is where you would see it, and it is not here.',
        'Request and enforce a stronger context if MFA is a requirement.', 'SAML 2.0 Core §2.7.2.2'));
    } else {
      f.push(F('ok', 'AuthnContext: ' + v, ''));
    }
  }

  /* ---------------- what is being carried ---------------- */
  const encrypted = els(root, 'EncryptedAssertion').length > 0;
  const attrs = els(root, 'Attribute').map(a => attr(a, 'Name') || attr(a, 'FriendlyName')).filter(Boolean);
  if (attrs.length && !encrypted) {
    const pii = attrs.filter(n => /mail|phone|name|address|birth|ssn|nino|employee/i.test(n));
    if (pii.length) {
      f.push(F('note', attrs.length + ' attributes in the clear, including ' + pii.slice(0, 4).join(', '),
        'The assertion is signed, not encrypted. It passes through the user\'s browser and lands in ' +
        'any logs on the way.',
        'Use EncryptedAssertion if the attributes are sensitive.', 'SAML 2.0 Core §2.3.4'));
    }
  }
  if (encrypted) {
    f.push(F('ok', 'Assertion is encrypted', ''));
  }

  const certs = els(root, 'X509Certificate');
  for (const c of certs.slice(0, 3)) {
    const v = certValidity(c.textContent);
    if (!v) continue;
    const days = (v.notAfter - now * 1000) / 86400000;
    if (days < 0) {
      f.push(F('critical', 'Signing certificate expired ' + Math.abs(Math.round(days)) + ' days ago',
        'Every service provider that checks expiry is already rejecting this.', 'Rotate it.'));
    } else if (days < 45) {
      f.push(F('warn', 'Signing certificate expires in ' + Math.round(days) + ' days',
        'Certificate expiry is the most common cause of a federation outage, and the failure is total ' +
        'rather than gradual.', 'Schedule the rotation and tell the other side now.'));
    } else {
      f.push(F('ok', 'Signing certificate valid for another ' + Math.round(days) + ' days', ''));
    }
    break;
  }

  f.push(F('note', 'authlint did not verify the signature',
    'The checks above are about structure and content. Whether the signature actually validates ' +
    'against a trusted key is a separate question, and it needs the key.',
    'Validate in your own code, against the certificate you configured, over the element you consume.'));

  return sortFindings(f);
}

function checkSamlMetadata(x, now) {
  const f = [];
  const root = x.doc.documentElement;

  const validUntil = attr(root, 'validUntil');
  if (validUntil) {
    const d = Date.parse(validUntil);
    if (!isNaN(d)) {
      const days = (d - now * 1000) / 86400000;
      if (days < 0) {
        f.push(F('critical', 'Metadata expired ' + Math.abs(Math.round(days)) + ' days ago',
          'Implementations that honour validUntil will refuse to load this.', 'Republish it.'));
      } else if (days < 30) {
        f.push(F('warn', 'Metadata expires in ' + Math.round(days) + ' days', '', 'Republish before it lapses.'));
      }
    }
  }

  for (const sso of els(root, 'SPSSODescriptor')) {
    if (String(attr(sso, 'WantAssertionsSigned')).toLowerCase() === 'false') {
      f.push(F('critical', 'WantAssertionsSigned is false',
        'This service provider is publishing that it will accept unsigned assertions. Anyone can ' +
        'write one.', 'Set it to true and enforce it in the implementation, not just the metadata.',
        'SAML 2.0 Metadata §2.4.4'));
    } else if (String(attr(sso, 'WantAssertionsSigned')).toLowerCase() === 'true') {
      f.push(F('ok', 'WantAssertionsSigned is true', ''));
    }
    if (String(attr(sso, 'AuthnRequestsSigned')).toLowerCase() !== 'true') {
      f.push(F('note', 'AuthnRequestsSigned is not true',
        'Requests are unsigned, so the identity provider cannot confirm which service provider asked.',
        '', 'SAML 2.0 Metadata §2.4.4'));
    }
  }

  const endpoints = els(root, 'AssertionConsumerService')
    .concat(els(root, 'SingleSignOnService'))
    .concat(els(root, 'SingleLogoutService'));
  const plain = endpoints.map(e => attr(e, 'Location')).filter(l => l && /^http:/i.test(l));
  if (plain.length) {
    f.push(F('critical', plain.length + ' endpoint(s) on plaintext http',
      'Assertions delivered over a channel anyone on the path can read and rewrite.',
      'Publish https endpoints only.', 'SAML 2.0 Security §4.1'));
  } else if (endpoints.length) {
    f.push(F('ok', 'All ' + endpoints.length + ' endpoints are https', ''));
  }

  const certs = els(root, 'X509Certificate');
  if (!certs.length) {
    f.push(F('warn', 'No certificate in the metadata',
      'Nothing here to validate signatures against, so the other side has to get the key some other ' +
      'way, and "some other way" is usually email.'));
  }
  let i = 0;
  for (const c of certs) {
    const v = certValidity(c.textContent);
    if (!v) { f.push(F('note', 'A certificate could not be parsed', '')); continue; }
    const days = (v.notAfter - now * 1000) / 86400000;
    const label = 'Certificate ' + (++i) + ' of ' + certs.length;
    if (days < 0) {
      f.push(F('critical', label + ' expired ' + Math.abs(Math.round(days)) + ' days ago',
        'If this is the active signing certificate, the federation is down.', 'Rotate it.'));
    } else if (days < 45) {
      f.push(F('warn', label + ' expires in ' + Math.round(days) + ' days',
        'Tell the other side now. Metadata exchange takes longer than anyone plans for.', 'Rotate it.'));
    } else {
      f.push(F('ok', label + ' valid for another ' + Math.round(days) + ' days', ''));
    }
  }
  if (certs.length > 1) {
    f.push(F('ok', certs.length + ' certificates published, which is what a clean rotation looks like', ''));
  }

  return sortFindings(f);
}
