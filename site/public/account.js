'use strict';
(function () {
  var $ = JD.$;
  var status = $('profStatus');

  JD.api('/api/me').then(function (res) {
    if (!res.ok) { location.href = '/#signin'; return; }
    var u = res.data.user;
    $('pf-name').value = u.displayName;
    $('pf-email').value = u.email || '';
    $('pf-phone').value = u.phone || '';
    $('pf-level').value = u.profile.level || '';
    $('pf-goal').value = u.profile.goal || '';
    $('acct-user').textContent = u.username;
    var role = $('acct-role');
    role.textContent = u.role;
    role.className = 'badge ' + u.role;
    $('acct-since').textContent = new Date(u.created).toLocaleDateString();
    $('acct-progress').textContent = u.doneCount || 0;
    if (u.role === 'admin') $('navAdmin').hidden = false;
  });

  $('profileForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    var f = e.target;
    if (!f.checkValidity()) { f.reportValidity(); return; }
    var res = await JD.api('/api/profile', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        displayName: $('pf-name').value, email: $('pf-email').value, phone: $('pf-phone').value,
        level: $('pf-level').value, goal: $('pf-goal').value,
      }),
    });
    if (!res.ok) { JD.say(status, res.data.error || 'Save failed', false); return; }
    JD.say(status, 'Saved. The dojo will greet you as "' + res.data.user.displayName + '".', true);
  });

  $('logout').addEventListener('click', async function () {
    await JD.api('/api/logout', { method: 'POST' });
    location.href = '/';
  });
})();
