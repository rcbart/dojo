'use strict';
(function () {
  const $ = id => document.getElementById(id);
  const status = $('adminStatus');
  let users = [];
  let self = null;

  function say(msg, ok) {
    status.textContent = msg;
    status.className = 'status ' + (ok ? 'ok' : 'err');
  }
  function esc(s) {
    const d = document.createElement('span'); d.textContent = s; return d.innerHTML;
  }

  async function api(url, opts) {
    const r = await fetch(url, opts);
    const data = await r.json().catch(() => ({}));
    if (r.status === 401) { location.href = '/#login'; throw new Error('signed out'); }
    if (r.status === 403) { location.href = '/'; throw new Error('admin only'); }
    if (!r.ok) throw new Error(data.error || ('request failed (' + r.status + ')'));
    return data;
  }

  function render() {
    const q = $('filter').value.trim().toLowerCase();
    const rows = $('rows');
    rows.innerHTML = '';
    const shown = users.filter(u => !q || u.username.includes(q));
    $('count').textContent = '(' + shown.length + ' of ' + users.length + ')';
    for (const u of shown) {
      const isSelf = self && u.username === self.username;
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + esc(u.username) + (isSelf ? ' <span class="help">(you)</span>' : '') + '</td>' +
        '<td>' + esc(u.displayName) + '</td>' +
        '<td><span class="badge ' + (u.role === 'admin' ? 'admin' : 'user') + '">' + u.role + '</span></td>' +
        '<td><span class="badge ' + (u.active ? 'user' : 'off') + '">' + (u.active ? 'active' : 'disabled') + '</span></td>' +
        '<td>' + new Date(u.created).toLocaleDateString() + '</td>' +
        '<td class="rowBtns"></td>';
      const btns = tr.querySelector('.rowBtns');
      if (!isSelf) {
        btns.append(
          button(u.role === 'admin' ? 'Make user' : 'Make admin', 'Change role of ' + u.username, () =>
            change(u.username, { role: u.role === 'admin' ? 'user' : 'admin' })),
          button(u.active ? 'Disable' : 'Enable', (u.active ? 'Disable ' : 'Enable ') + u.username, () =>
            change(u.username, { active: !u.active })),
          button('Delete', 'Delete ' + u.username + ' permanently', () => remove(u.username), true),
        );
      }
      rows.append(tr);
    }
  }

  function button(label, ariaLabel, onClick, danger) {
    const b = document.createElement('button');
    b.className = 'btn' + (danger ? ' danger' : '');
    b.textContent = label;
    b.setAttribute('aria-label', ariaLabel);
    b.addEventListener('click', onClick);
    return b;
  }

  async function change(username, body) {
    try {
      await api('/api/admin/users/' + username, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      say('Updated ' + username + '.', true);
      await load();
    } catch (e) { say(e.message, false); }
  }

  async function remove(username) {
    if (!confirm('Delete ' + username + ' permanently? This cannot be undone.')) return;
    try {
      await api('/api/admin/users/' + username, { method: 'DELETE' });
      say('Deleted ' + username + '.', true);
      await load();
    } catch (e) { say(e.message, false); }
  }

  async function load() {
    const meData = await api('/api/me');
    self = meData.user;
    const d = await api('/api/admin/users');
    users = d.users;
    render();
  }

  $('filter').addEventListener('input', render);
  $('logout').addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' }).catch(() => {});
    location.href = '/';
  });

  load().catch(e => say(e.message, false));
})();
