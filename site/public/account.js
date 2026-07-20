'use strict';
(function () {
  const $ = id => document.getElementById(id);
  const status = $('profStatus');
  function say(msg, ok) {
    status.textContent = msg;
    status.className = 'status ' + (ok ? 'ok' : 'err');
  }

  fetch('/api/me').then(r => {
    if (!r.ok) { location.href = '/#login'; return null; }
    return r.json();
  }).then(d => {
    if (!d) return;
    const u = d.user;
    $('pf-name').value = u.displayName;
    $('pf-level').value = u.profile.level || '';
    $('pf-goal').value = u.profile.goal || '';
    $('acct-user').textContent = u.username;
    const role = $('acct-role');
    role.textContent = u.role;
    role.className = 'badge ' + u.role;
    $('acct-since').textContent = new Date(u.created).toLocaleDateString();
    if (u.role === 'admin') $('navAdmin').hidden = false;
  }).catch(() => { location.href = '/#login'; });

  $('profileForm').addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('pf-name').value.trim();
    if (!name) { say('Display name cannot be empty.', false); $('pf-name').focus(); return; }
    try {
      const r = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: name,
          level: $('pf-level').value,
          goal: $('pf-goal').value,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || 'save failed');
      say('Saved. The dojo will greet you as "' + data.user.displayName + '".', true);
    } catch (err) { say(err.message, false); }
  });

  $('logout').addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' }).catch(() => {});
    location.href = '/';
  });
})();
