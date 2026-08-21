/* ============================== FINDINGS ==============================
   Every check returns the same shape, because the value of this tool is not
   that it decodes things. Decoders are everywhere. The value is that it says
   what is wrong, why that matters, and what to do, and a consistent shape is
   what makes sixty checks readable instead of a wall.

   sev:   'critical' exploitable or broken now
          'warn'     will bite you, or is a bad default someone should fix
          'note'     worth knowing, often deliberate
          'ok'       an explicit pass, shown only for the things people worry about
   title: the finding, in a few words
   why:   one or two sentences. What goes wrong, not a definition.
   fix:   what to change. Omitted when the finding is informational.
   ref:   the spec section or advisory that backs it up. */

function F(sev, title, why, fix, ref) {
  return { sev, title, why, fix: fix || '', ref: ref || '' };
}

const SEV_ORDER = { critical: 0, warn: 1, note: 2, ok: 3 };

function sortFindings(list) {
  return list.slice().sort((a, b) => SEV_ORDER[a.sev] - SEV_ORDER[b.sev]);
}

/* Shared helpers used by more than one protocol. */

function secondsToHuman(s) {
  if (s == null || isNaN(s)) return 'unknown';
  const abs = Math.abs(s);
  if (abs < 90) return Math.round(s) + ' seconds';
  if (abs < 5400) return Math.round(s / 60) + ' minutes';
  if (abs < 172800) return (s / 3600).toFixed(1) + ' hours';
  if (abs < 63072000) return (s / 86400).toFixed(1) + ' days';
  return (s / 31536000).toFixed(1) + ' years';
}

const PII_CLAIMS = [
  'email', 'email_verified', 'phone_number', 'phone_number_verified', 'name',
  'given_name', 'family_name', 'middle_name', 'nickname', 'preferred_username',
  'birthdate', 'address', 'gender', 'picture', 'profile', 'website', 'zoneinfo',
];

function looksLikeEmail(v) {
  return typeof v === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
}

/* A date that is obviously not a second-based epoch. Milliseconds in an `exp`
   is one of the most common and most confusing bugs in this space: the token
   appears to be valid until the year 56000. */
function looksLikeMillis(n) {
  return typeof n === 'number' && n > 1e11;
}
