'use strict';
(function () {
  var $ = JD.$;
  var status = $('adminStatus');
  var users = [];
  var self = null;

  // Every value goes into the DOM via textContent (createElement), never innerHTML —
  // so a malicious display name or email cannot inject markup.
  function td(text) { var el = document.createElement('td'); el.textContent = text; return el; }
  function badge(text, cls) { var s = document.createElement('span'); s.className = 'badge ' + cls; s.textContent = text; var c = document.createElement('td'); c.appendChild(s); return c; }
  function button(label, ariaLabel, onClick, danger) {
    var b = document.createElement('button');
    b.className = 'btn' + (danger ? ' danger' : '');
    b.textContent = label;
    b.setAttribute('aria-label', ariaLabel);
    b.addEventListener('click', onClick);
    return b;
  }

  async function call(url, opts) {
    var res = await JD.api(url, opts);
    if (res.status === 401) { location.href = '/#signin'; throw new Error('signed out'); }
    if (res.status === 403) { location.href = '/'; throw new Error('admin only'); }
    if (!res.ok) throw new Error(res.data.error || ('request failed (' + res.status + ')'));
    return res.data;
  }

  function render() {
    var q = $('filter').value.trim().toLowerCase();
    var rows = $('rows');
    rows.textContent = '';
    var shown = users.filter(function (u) {
      return !q || u.username.indexOf(q) >= 0 || (u.email && u.email.indexOf(q) >= 0);
    });
    $('count').textContent = '(' + shown.length + ' of ' + users.length + ')';
    shown.forEach(function (u) {
      var isSelf = self && u.username === self.username;
      var tr = document.createElement('tr');
      tr.appendChild(td(u.username + (isSelf ? ' (you)' : '')));
      tr.appendChild(td(u.displayName));
      tr.appendChild(td(u.email || '—'));
      tr.appendChild(badge(u.role, u.role === 'admin' ? 'admin' : 'user'));
      tr.appendChild(badge(u.active ? 'active' : 'disabled', u.active ? 'user' : 'off'));
      var pcell = td((u.doneCount || 0) + ' done'); pcell.className = 'prog'; tr.appendChild(pcell);
      tr.appendChild(td(new Date(u.created).toLocaleDateString()));
      var actions = document.createElement('td');
      actions.className = 'rowBtns';
      if (!isSelf) {
        actions.appendChild(button(u.role === 'admin' ? 'Make user' : 'Make admin',
          'Change role of ' + u.username,
          function () { change(u.username, { role: u.role === 'admin' ? 'user' : 'admin' }); }));
        actions.appendChild(button(u.active ? 'Disable' : 'Enable',
          (u.active ? 'Disable ' : 'Enable ') + u.username,
          function () { change(u.username, { active: !u.active }); }));
        actions.appendChild(button('Delete', 'Delete ' + u.username + ' permanently',
          function () { remove(u.username); }, true));
      }
      tr.appendChild(actions);
      rows.appendChild(tr);
    });
  }

  async function change(username, body) {
    try {
      await call('/api/admin/users/' + encodeURIComponent(username), {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      JD.say(status, 'Updated ' + username + '.', true);
      await load();
    } catch (e) { JD.say(status, e.message, false); }
  }
  async function remove(username) {
    if (!confirm('Delete ' + username + ' permanently? This also deletes their progress and cannot be undone.')) return;
    try {
      await call('/api/admin/users/' + encodeURIComponent(username), { method: 'DELETE' });
      JD.say(status, 'Deleted ' + username + '.', true);
      await load();
    } catch (e) { JD.say(status, e.message, false); }
  }
  async function load() {
    self = (await call('/api/me')).user;
    users = (await call('/api/admin/users')).users;
    render();
  }

  $('filter').addEventListener('input', render);
  $('logout').addEventListener('click', async function () {
    await JD.api('/api/logout', { method: 'POST' });
    location.href = '/';
  });
  load().catch(function (e) { JD.say(status, e.message, false); });
})();
