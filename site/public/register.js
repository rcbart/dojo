'use strict';
(function () {
  var $ = JD.$;
  var status = $('registerStatus');

  // lightweight strength meter (length + variety), guidance only, server enforces the rule
  function strength(pw) {
    var s = 0;
    if (pw.length >= 10) s++;
    if (pw.length >= 14) s++;
    if (/[a-z]/.test(pw) && /[A-Z0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 20) s++;
    return Math.min(s, 4);
  }
  var meter = $('pw-meter');
  $('re-pass').addEventListener('input', function () {
    meter.className = 'meter s' + strength(this.value);
  });

  $('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    var f = e.target;
    if (!f.checkValidity()) { f.reportValidity(); return; }
    if ($('re-pass').value !== $('re-pass2').value) {
      JD.say(status, 'The two passwords do not match.', false);
      $('re-pass2').focus();
      return;
    }
    var payload = {
      username: $('re-user').value,
      password: $('re-pass').value,
      displayName: $('re-name').value,
      email: $('re-email').value,
      phone: $('re-phone').value,
      level: $('re-level').value,
      goal: $('re-goal').value,
    };
    var res = await JD.api('/api/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) { JD.say(status, res.data.error || 'Registration failed', false); return; }
    JD.say(status, res.data.firstUser
      ? 'Account created, as the first user you are the administrator. Redirecting…'
      : 'Account created. Welcome to the dojo!', true);
    location.href = res.data.firstUser ? '/account.html' : '/app';
  });
})();
