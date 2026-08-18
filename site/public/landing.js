'use strict';
(function () {
  var $ = JD.$;
  var status = $('signinStatus');

  $('signinForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    var f = e.target;
    if (!f.checkValidity()) { f.reportValidity(); return; }
    var res = await JD.api('/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: $('si-user').value, password: $('si-pass').value }),
    });
    if (!res.ok) { JD.say(status, res.data.error || 'Sign in failed', false); return; }
    JD.say(status, 'Welcome back, ' + res.data.user.displayName + ', taking you in…', true);
    location.href = '/app';
  });

  // If already signed in, flip the nav to the member links.
  JD.api('/api/me').then(function (res) {
    if (!res.ok) return;
    $('navSignin').hidden = true;
    $('navRegister').hidden = true;
    $('navAccount').hidden = false;
    $('navApp').hidden = false;
    if (res.data.user.role === 'admin') $('navAdmin').hidden = false;
  });
})();
