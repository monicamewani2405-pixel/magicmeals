/* Shopify theme: sign-in is Shopify's own (new customer accounts, hosted by Shopify). The site's own sign-in window and profile page are not in this theme.
   This file keeps the rest of the site working: the account icon / "Sign in" buttons call MMAuth.open(), which now opens /account (Shopify shows its login
   page, or the customer's account when already signed in). #profile also goes there. */
(function () {
  'use strict';
  var ACCOUNT = '/account';
  window.MMAuth = {
    ready: Promise.resolve(),
    open: function () { window.location.href = ACCOUNT; },
    email: function () { return ''; },
    user: function () { return null; },
    refresh: function () { return Promise.resolve(null); },
    logout: function () { return Promise.resolve(); },
    takeFlash: function () { return ''; }
  };
  // the header's account icon (the site's auth.js used to listen for it)
  document.addEventListener('click', function (e) {
    if (e.target && e.target.closest && e.target.closest('#authOpenBtn')) { e.preventDefault(); window.MMAuth.open(); }
  });
  function route() {
    if ((location.hash || '').replace('#', '').split('?')[0] === 'profile') window.location.replace(ACCOUNT);
  }
  window.addEventListener('hashchange', route);
  route();
})();
