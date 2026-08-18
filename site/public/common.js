'use strict';
/* Shared helpers loaded by every page: password toggles, fetch wrapper, and the
   secure in-page login modal.

   Security notes:
   - The modal is a same-page <dialog>, NOT window.open/iframe, there is no
     cross-window channel (no postMessage / window.opener) to exploit.
   - Login posts same-origin to /api/login; the session cookie is set HttpOnly
     by the server, so this script never reads or holds it.
   - The DOM is built with createElement/textContent only (no innerHTML), so
     server error strings can never inject markup.
   - The post-auth redirect is a hard-coded same-origin path, never a value
     from input or the URL, so it can't be abused as an open redirect. */
window.JD = (function () {
  function $(id) { return document.getElementById(id); }
  var APP_PATH = '/app'; // fixed, same-origin, do not derive from input

  function wireToggles(root) {
    (root || document).querySelectorAll('.pw-toggle').forEach(function (btn) {
      if (btn.dataset.wired) return;
      btn.dataset.wired = '1';
      btn.addEventListener('click', function () {
        var input = document.getElementById(btn.getAttribute('data-target'));
        if (!input) return;
        var show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.textContent = show ? 'Hide' : 'Show';
        btn.setAttribute('aria-pressed', String(show));
        btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        input.focus();
      });
    });
  }

  async function api(url, opts) {
    var r = await fetch(url, Object.assign({ credentials: 'same-origin' }, opts || {}));
    var data = {};
    try { data = await r.json(); } catch (e) { /* no body */ }
    return { ok: r.ok, status: r.status, data: data };
  }

  function say(el, msg, ok) { el.textContent = msg; el.className = 'status ' + (ok ? 'ok' : 'err'); }

  async function login(username, password) {
    return api('/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, password: password }),
    });
  }

  /* ---- secure in-page login modal ---- */
  var modal = null;
  function buildModal() {
    if (modal) return modal;
    var dlg = document.createElement('dialog');
    dlg.className = 'modal';
    dlg.setAttribute('aria-labelledby', 'jd-modal-title');

    var card = document.createElement('form');
    card.className = 'modal-card';
    card.noValidate = true;

    var close = document.createElement('button');
    close.type = 'button'; close.className = 'modal-x'; close.textContent = '×';
    close.setAttribute('aria-label', 'Close'); close.addEventListener('click', function () { dlg.close(); });

    var logo = document.createElement('div'); logo.className = 'logo'; logo.textContent = '🥋'; logo.setAttribute('aria-hidden', 'true');
    var h = document.createElement('h2'); h.id = 'jd-modal-title'; h.textContent = 'Sign in';
    var lede = document.createElement('p'); lede.className = 'lede'; lede.textContent = 'Pick up right where you left off.';

    var uLabel = document.createElement('label'); uLabel.setAttribute('for', 'jd-m-user'); uLabel.textContent = 'Username';
    var user = document.createElement('input');
    user.id = 'jd-m-user'; user.name = 'username'; user.autocomplete = 'username'; user.required = true;
    user.setAttribute('pattern', '[a-z][a-z0-9_]{2,23}'); user.spellcheck = false; user.setAttribute('autocapitalize', 'none');

    var pLabel = document.createElement('label'); pLabel.setAttribute('for', 'jd-m-pass'); pLabel.textContent = 'Password';
    var pwWrap = document.createElement('div'); pwWrap.className = 'pw-wrap';
    var pass = document.createElement('input');
    pass.id = 'jd-m-pass'; pass.name = 'password'; pass.type = 'password'; pass.autocomplete = 'current-password'; pass.required = true; pass.minLength = 10;
    var toggle = document.createElement('button');
    toggle.type = 'button'; toggle.className = 'pw-toggle'; toggle.setAttribute('data-target', 'jd-m-pass');
    toggle.setAttribute('aria-pressed', 'false'); toggle.setAttribute('aria-label', 'Show password'); toggle.textContent = 'Show';
    pwWrap.appendChild(pass); pwWrap.appendChild(toggle);

    var actions = document.createElement('div'); actions.className = 'form-actions';
    var submit = document.createElement('button'); submit.type = 'submit'; submit.className = 'cta'; submit.textContent = 'Sign in';
    actions.appendChild(submit);

    var status = document.createElement('p'); status.className = 'status'; status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    var alt = document.createElement('p'); alt.className = 'alt';
    alt.appendChild(document.createTextNode('New here? '));
    var reg = document.createElement('a'); reg.href = '/register.html'; reg.textContent = 'Create your free account →';
    alt.appendChild(reg);

    card.append(close, logo, h, lede, uLabel, user, pLabel, pwWrap, actions, status, alt);
    dlg.appendChild(card);
    document.body.appendChild(dlg);
    wireToggles(dlg);

    // click on the backdrop (outside the card) closes
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    // clear the password whenever the dialog closes, never linger in the DOM
    dlg.addEventListener('close', function () { pass.value = ''; status.textContent = ''; });

    card.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!card.checkValidity()) { card.reportValidity(); return; }
      submit.disabled = true;
      var res = await login(user.value, pass.value);
      pass.value = ''; // clear immediately, win or lose
      submit.disabled = false;
      if (!res.ok) { say(status, res.data.error || 'Sign in failed', false); pass.focus(); return; }
      say(status, 'Welcome back, ' + res.data.user.displayName + ', taking you in…', true);
      window.location.assign(APP_PATH); // fixed same-origin path only
    });

    modal = { dlg: dlg, user: user, pass: pass, status: status };
    return modal;
  }

  function openLogin() {
    var m = buildModal();
    m.status.textContent = ''; m.pass.value = '';
    if (typeof m.dlg.showModal === 'function') { m.dlg.showModal(); m.user.focus(); }
    else { window.location.assign('/#signin'); } // graceful fallback for very old browsers
  }

  function wireOpeners(root) {
    (root || document).querySelectorAll('[data-open-login]').forEach(function (el) {
      if (el.dataset.wired) return;
      el.dataset.wired = '1';
      el.addEventListener('click', function (e) { e.preventDefault(); openLogin(); });
    });
  }

  document.addEventListener('DOMContentLoaded', function () { wireToggles(document); wireOpeners(document); });
  return { $: $, wireToggles: wireToggles, api: api, say: say, login: login, openLogin: openLogin };
})();
