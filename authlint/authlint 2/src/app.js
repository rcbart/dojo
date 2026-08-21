/* ============================== APP ==============================
   One box in, findings out. No routing, no state to speak of, and
   deliberately no network: everything below runs on the string you pasted
   and nothing else. */

const $ = id => document.getElementById(id);

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function nowSeconds() { return Math.floor(Date.now() / 1000); }

/* ------------------------------ analysis ------------------------------ */

function analyze(input) {
  const now = nowSeconds();
  const d = detect(input);
  if (!d.kind) {
    return { error: d.reason || 'authlint cannot tell what this is.' };
  }
  const text = d.rewrite || input;

  if (d.kind === 'jwt') {
    const t = decodeJwt(text);
    if (t.error) return { error: t.error, kind: d.kind };
    return {
      kind: t.kind === 'jwe' ? 'Encrypted JWT (JWE)' : describeJwt(t),
      decoded: renderJwt(t),
      findings: checkJwt(t, now),
    };
  }

  if (d.kind === 'jwks') {
    const j = JSON.parse(text);
    return {
      kind: 'JSON Web Key Set',
      decoded: renderJson(j),
      findings: checkJwks(j, now),
    };
  }

  if (d.kind === 'discovery') {
    const j = JSON.parse(text);
    return {
      kind: 'OpenID Connect discovery document',
      decoded: renderJson(j),
      findings: checkDiscovery(j, now),
    };
  }

  if (d.kind === 'authz') {
    const a = parseAuthz(text, d.asQuery);
    if (a.error) return { error: a.error };
    const isCallback = !!(a.params.code || a.params.access_token || a.params.id_token || a.params.error);
    return {
      kind: isCallback ? 'OAuth 2.0 redirect (callback)' : 'OAuth 2.0 authorization request',
      decoded: renderParams(a),
      findings: checkAuthz(a, now),
      also: nestedJwts(a.params),
    };
  }

  const x = decodeXml(text);
  if (x.error) return { error: x.error };
  if (d.kind === 'samlmeta') {
    return { kind: 'SAML metadata', decoded: renderXml(x.text), findings: checkSamlMetadata(x, now) };
  }
  return {
    kind: d.kind === 'samlreq' ? 'SAML authentication request' : 'SAML response',
    decoded: renderXml(x.text),
    findings: checkSamlResponse(x, now),
  };
}

/* A redirect often carries an id_token worth checking on its own. */
function nestedJwts(params) {
  const out = [];
  for (const k of ['id_token', 'access_token']) {
    const v = params[k];
    if (v && /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\./.test(v)) out.push({ name: k, value: v });
  }
  return out;
}

function describeJwt(t) {
  const p = t.payload || {};
  if (p.nonce || p.at_hash || p.auth_time) return 'OpenID Connect ID token';
  if (p.scope || p.scp) return 'OAuth 2.0 access token (JWT)';
  return 'JSON Web Token';
}

/* ------------------------------ rendering ------------------------------ */

function renderJson(o) {
  return '<pre class="code">' + esc(JSON.stringify(o, null, 2)) + '</pre>';
}

function renderJwt(t) {
  let h = '<div class="seg"><h4>Header</h4><pre class="code">' +
          esc(JSON.stringify(t.header, null, 2)) + '</pre></div>';
  if (t.kind === 'jwe') {
    h += '<div class="seg"><h4>Payload</h4><p class="dim">Encrypted. Nothing to show without the key.</p></div>';
  } else {
    h += '<div class="seg"><h4>Payload</h4><pre class="code">' +
         esc(JSON.stringify(t.payload, null, 2)) + '</pre></div>';
    const claims = timeClaims(t.payload);
    if (claims) h += '<div class="seg"><h4>Times</h4>' + claims + '</div>';
    h += '<div class="seg"><h4>Signature</h4><pre class="code">' +
         esc(t.signature || '(empty)') +
         (t.signatureBytes ? '\n\n' + t.signatureBytes + ' bytes' : '') + '</pre></div>';
  }
  return h;
}

function timeClaims(p) {
  if (!p) return '';
  const rows = [];
  for (const k of ['iat', 'nbf', 'exp', 'auth_time', 'updated_at']) {
    if (typeof p[k] !== 'number') continue;
    const ms = looksLikeMillis(p[k]) ? p[k] : p[k] * 1000;
    rows.push('<tr><td>' + k + '</td><td>' + p[k] + '</td><td>' +
      esc(new Date(ms).toISOString().replace('T', ' ').replace('.000Z', ' UTC')) + '</td></tr>');
  }
  return rows.length ? '<table class="times"><tbody>' + rows.join('') + '</tbody></table>' : '';
}

function renderParams(a) {
  const rows = Object.keys(a.params).map(k => {
    const v = String(a.params[k]);
    const shown = v.length > 300 ? v.slice(0, 300) + '…' : v;
    return '<tr><td>' + esc(k) + '</td><td><code>' + esc(shown) + '</code></td></tr>';
  }).join('');
  return (a.base ? '<p class="dim">Endpoint: <code>' + esc(a.base) + '</code></p>' : '') +
         '<table class="params"><tbody>' + rows + '</tbody></table>';
}

function renderXml(text) {
  return '<pre class="code">' + esc(prettyXml(text)) + '</pre>';
}

/* Indentation only. Nothing here reorders or rewrites the document, because
   the thing being inspected has to stay the thing that was pasted. */
function prettyXml(xml) {
  const parts = String(xml).replace(/>\s*</g, '><').replace(/></g, '>\n<').split('\n');
  let depth = 0;
  return parts.map(line => {
    if (/^<\//.test(line)) depth = Math.max(0, depth - 1);
    const out = '  '.repeat(depth) + line;
    if (/^<[^!?/][^>]*[^/]>$/.test(line) && !/^<\//.test(line)) depth++;
    return out;
  }).join('\n');
}

const SEV_LABEL = { critical: 'Critical', warn: 'Warning', note: 'Note', ok: 'Pass' };

function renderFindings(list) {
  if (!list || !list.length) return '<p class="dim">No findings.</p>';
  return list.map(x =>
    '<div class="f ' + x.sev + '">' +
      '<div class="fh"><span class="sev">' + SEV_LABEL[x.sev] + '</span>' +
        '<span class="ft">' + esc(x.title) + '</span></div>' +
      (x.why ? '<p class="fw">' + esc(x.why) + '</p>' : '') +
      (x.fix ? '<p class="ff"><b>Fix</b> ' + esc(x.fix) + '</p>' : '') +
      (x.ref ? '<p class="fr">' + esc(x.ref) + '</p>' : '') +
    '</div>').join('');
}

/* Two different failures deserve two different answers. "This is a JWT and the
   payload segment is truncated" is a fix somebody can act on in seconds. "I do
   not know what this is" is a different message, and it should at least say what
   the tool does read. Both go through esc(), because every word of this is
   quoting something that was pasted. */
function renderDiagnosis(input, fallback) {
  let d = null;
  try { d = diagnose(input); } catch (e) { d = null; }

  if (!d) {
    return '<div class="diag unknown"><div class="dh">' +
      '<span class="dsev">Not recognised</span>' +
      '<span class="dt">' + esc(fallback || 'authlint cannot tell what this is.') + '</span></div>' +
      '<p class="dhint">' + esc(ACCEPTED_SENTENCE) + '</p></div>';
  }

  const malformed = d.state === 'malformed';
  const heading = malformed
    ? (d.looksLike ? 'This looks like ' + d.looksLike + ', but it seems malformed.'
                   : 'This looks like something authlint reads, but it seems malformed.')
    : (d.looksLike ? 'This looks like ' + d.looksLike + ', which authlint does not read.'
                   : 'authlint does not recognise this.');

  let h = '<div class="diag ' + (malformed ? 'malformed' : 'unknown') + '">' +
    '<div class="dh">' +
      '<span class="dsev">' + (malformed ? 'Malformed' : 'Unrecognised format') + '</span>' +
      '<span class="dt">' + esc(heading) + '</span>' +
    '</div>';
  if (d.problem) h += '<p class="dwhy">' + esc(d.problem) + '</p>';
  if (d.hint) h += '<p class="dhint">' + esc(d.hint) + '</p>';
  if (!malformed && !d.looksLike) h += '<p class="dfoot">' + esc(ACCEPTED_SENTENCE) + '</p>';
  return h + '</div>';
}

const ACCEPTED_SENTENCE =
  'authlint reads JSON Web Tokens, JWKS documents, OpenID Connect discovery documents, OAuth ' +
  'authorization requests and redirects, SAML responses and assertions, and SAML metadata. SAML ' +
  'over the redirect binding is DEFLATE compressed and needs the POST binding version.';

function counts(list) {
  const c = { critical: 0, warn: 0, note: 0, ok: 0 };
  (list || []).forEach(x => { c[x.sev]++; });
  return c;
}

/* ------------------------------ wiring ------------------------------ */

function run() {
  const input = $('in').value.trim();
  const out = $('out');
  if (!input) { out.innerHTML = ''; $('summary').innerHTML = ''; return; }

  let r;
  try { r = analyze(input); }
  catch (e) { r = { error: 'authlint fell over on this input: ' + e.message }; }

  if (r.error) {
    $('summary').innerHTML = '';
    out.innerHTML = renderDiagnosis(input, r.error);
    return;
  }

  const c = counts(r.findings);
  $('summary').innerHTML =
    '<div class="kind">' + esc(r.kind) + '</div>' +
    '<a class="jump" href="#findings">jump to findings</a>' +
    '<div class="tallies">' +
      (c.critical ? '<span class="t critical">' + c.critical + ' critical</span>' : '') +
      (c.warn ? '<span class="t warn">' + c.warn + ' warning' + (c.warn > 1 ? 's' : '') + '</span>' : '') +
      (c.note ? '<span class="t note">' + c.note + ' note' + (c.note > 1 ? 's' : '') + '</span>' : '') +
      (c.ok ? '<span class="t ok">' + c.ok + ' pass' + (c.ok > 1 ? 'es' : '') + '</span>' : '') +
    '</div>';

  /* Decoded goes first. It used to sit under the findings, which put it two
     thousand pixels down the page on a token with a lot of claims, and the
     first thing anyone wants from a paste box is to read what they pasted.
     The findings are what makes this better than a decoder; they are not what
     makes it useful in the first ten seconds. */
  let html = '<section class="decoded"><h3>Decoded</h3>' + r.decoded + '</section>';
  html += '<section class="findings" id="findings"><h3>Findings</h3>' +
          renderFindings(r.findings) + '</section>';
  if (r.also && r.also.length) {
    html += r.also.map(n => {
      const t = decodeJwt(n.value);
      if (t.error) return '';
      const nf = checkJwt(t, nowSeconds());
      return '<section class="findings nested"><h3>' + esc(n.name) + ' inside this redirect</h3>' +
             renderFindings(nf) + '</section>';
    }).join('');
  }
  out.innerHTML = html;
}

function loadSample(which) {
  $('in').value = SAMPLES[which] || '';
  run();
}

document.addEventListener('DOMContentLoaded', function () {
  $('in').addEventListener('input', debounce(run, 120));
  document.querySelectorAll('[data-sample]').forEach(b => {
    b.addEventListener('click', () => loadSample(b.getAttribute('data-sample')));
  });
  $('clear').addEventListener('click', () => { $('in').value = ''; run(); $('in').focus(); });
  run();
});

function debounce(fn, ms) {
  let t;
  return function () { clearTimeout(t); t = setTimeout(fn, ms); };
}
