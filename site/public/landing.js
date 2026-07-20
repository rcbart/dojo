'use strict';
(function () {
  const $ = id => document.getElementById(id);
  const status = $('authStatus');

  function say(msg, ok) {
    status.textContent = msg;
    status.className = 'status ' + (ok ? 'ok' : 'err');
  }

  /* tabs */
  const tabs = [$('tab-signin'), $('tab-register')];
  const panels = [$('panel-signin'), $('panel-register')];
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t, j) => {
        t.setAttribute('aria-selected', String(i === j));
        panels[j].hidden = i !== j;
      });
      panels[i].querySelector('input').focus();
      say('', true);
    });
    tab.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') tabs[1 - i].click();
    });
  });

  async function post(url, body) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || ('request failed (' + r.status + ')'));
    return data;
  }

  $('panel-signin').addEventListener('submit', async e => {
    e.preventDefault();
    try {
      const d = await post('/api/login', {
        username: $('si-user').value, password: $('si-pass').value,
      });
      say('Welcome back, ' + d.user.displayName + ' — taking you in…', true);
      location.href = '/app';
    } catch (err) { say(err.message, false); }
  });

  $('panel-register').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target;
    if (!f.checkValidity()) { f.reportValidity(); return; }
    try {
      const d = await post('/api/register', {
        username: $('re-user').value, password: $('re-pass').value,
      });
      say(d.firstUser
        ? 'Account created — as the first user you are the admin. Entering…'
        : 'Account created. Entering the dojo…', true);
      location.href = d.firstUser ? '/account.html' : '/app';
    } catch (err) { say(err.message, false); }
  });

  /* already signed in? adjust nav */
  fetch('/api/me').then(r => r.ok ? r.json() : null).then(d => {
    if (!d) return;
    $('navLogin').hidden = true;
    $('navAccount').hidden = false;
    $('navApp').hidden = false;
    if (d.user.role === 'admin') $('navAdmin').hidden = false;
  }).catch(() => {});
})();
