/* ============================== HARDENING ==============================
   authlint tells people it is safe to paste a production token. That claim has
   to survive an adversary who is not the author, so the mitigations below are
   for the leak paths that exist even when the code makes no network call.

   Each one closes a specific, documented route out of the page. What is not
   here is anything that pretends to defend against a hostile browser extension
   or a compromised host, because nothing in a web page can, and SECURITY.md
   says so rather than implying otherwise. */

(function () {
  'use strict';

  /* 1. The input must never reach the URL.
     Anything in the query string or the fragment is written to session history,
     survives in the address bar, appears in the Referer header on an outbound
     click, and is read by anything that syncs history between devices. Nothing
     in this tool writes to location, and this makes that a runtime guarantee
     rather than a code-review promise: if a future edit tries, it fails loudly
     in the console instead of silently leaking. */
  try {
    const trap = function (name) {
      return function () {
        console.error('authlint: blocked an attempt to write the input to the URL via ' + name +
                      '. Nothing pasted here is allowed into browser history.');
      };
    };
    if (window.history && history.pushState) {
      history.pushState = trap('history.pushState');
      history.replaceState = trap('history.replaceState');
    }
  } catch (e) { /* a locked-down environment already prevents it */ }

  /* 2. If the page is loaded with anything in the URL, clear it immediately.
     Someone may arrive at a link a colleague built by hand, with a token in
     the query string, thinking that is how the tool works. Strip it before it
     can be read, and say why. */
  try {
    if (location.search.length > 1 || location.hash.length > 1) {
      const clean = location.origin + location.pathname;
      // replaceState is trapped above, so use the native one deliberately.
      History.prototype.replaceState.call(history, null, '', clean);
      window.__urlWasCleared = true;
    }
  } catch (e) { /* file:// has no origin to rebuild; nothing to do */ }

  /* 3. Empty the box when the page goes away.
     Browsers restore form state on reload and on back-forward navigation, and
     the bfcache keeps a live copy of the page in memory. Neither is a network
     leak and both leave a production token recoverable by the next person at
     the keyboard. Clearing on pagehide costs the user a reload of their own
     paste, which is the correct trade for a tool that handles secrets. */
  window.addEventListener('pagehide', function () {
    const box = document.getElementById('in');
    if (box) box.value = '';
    const out = document.getElementById('out');
    if (out) out.innerHTML = '';
    const sum = document.getElementById('summary');
    if (sum) sum.innerHTML = '';
  });

  /* 4. Refuse to run inside someone else's frame.
     frame-ancestors cannot be set from a meta tag, only from a real header, and
     this file is served as a static asset. A framed copy of a paste box is the
     shape of a credential-harvesting page, so break out or refuse. */
  try {
    if (window.top !== window.self) {
      try {
        window.top.location = window.self.location;
      } catch (e) {
        document.documentElement.innerHTML =
          '<body style="font:16px system-ui;padding:40px;max-width:60ch">' +
          '<h1>authlint will not run in a frame</h1>' +
          '<p>A tool that asks for tokens should not be embedded in a page you did not choose. ' +
          'Open it directly at <a href="https://roniam.dev/authlint/" rel="noopener noreferrer">roniam.dev/authlint</a>, ' +
          'or download the file and open it locally.</p></body>';
      }
    }
  } catch (e) { /* cross-origin access to top throws, which is itself the answer */ }

  /* 5. Never become a drop target by accident.
     A dropped file would be read into the page, and a dropped link would
     navigate. Neither is a feature here. */
  for (const ev of ['dragover', 'drop']) {
    window.addEventListener(ev, function (e) {
      if (e.target && e.target.id === 'in') return;   // pasting text into the box is fine
      e.preventDefault();
    });
  }
})();
