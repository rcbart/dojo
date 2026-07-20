'use strict';
/* Shared helpers loaded by every page. */
window.JD = (function () {
  function $(id) { return document.getElementById(id); }

  // Password show/hide toggles — accessible (aria-pressed + label).
  function wireToggles(root) {
    (root || document).querySelectorAll('.pw-toggle').forEach(function (btn) {
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
    var r = await fetch(url, opts || {});
    var data = {};
    try { data = await r.json(); } catch (e) { /* no body */ }
    return { ok: r.ok, status: r.status, data: data };
  }

  function say(el, msg, ok) {
    el.textContent = msg;
    el.className = 'status ' + (ok ? 'ok' : 'err');
  }

  document.addEventListener('DOMContentLoaded', function () { wireToggles(document); });
  return { $: $, wireToggles: wireToggles, api: api, say: say };
})();
