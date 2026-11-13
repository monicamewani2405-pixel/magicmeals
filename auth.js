/* =========================================================
   auth.js: Sign In / Create Account / Forgot password / Google modal, and the signed-in state.
   Talks only to our own /api/auth/* endpoints. The login token is an HttpOnly cookie the page cannot read;
   this file only holds the customer's name, email, phone, addresses and orders (MMAuth.user()).
   After signing in or up the visitor is sent to the #profile page (profile.js draws it).
   Public API: MMAuth.open(view?)  MMAuth.close()  MMAuth.user()  MMAuth.email()  MMAuth.ready (Promise)
               MMAuth.refresh() -> Promise<user|null>   MMAuth.update({name, phone}) -> Promise<{ok, user?, message?, field?}>
               MMAuth.logout() -> Promise   MMAuth.takeFlash() -> one-time welcome message for the profile page
   ========================================================= */
(function () {
  'use strict';

  var API = '/api/auth/';
  var user = null;                 // { firstName, lastName, email, phone, addresses[], orders[] } or null
  var view = 'signin';             // signin | signup | forgot
  var countdown = null;            // lockout timer
  var googleState = 'idle';        // idle | loading | ready | off
  var lastFocus = null;
  var flash = '';

  function $(id) { return document.getElementById(id); }
  function backdrop() { return $('authModalBackdrop'); }
  function isOpen() { var b = backdrop(); return !!(b && b.classList.contains('open')); }

  /* ---------- API ---------- */
  function api(path, method, payload) {
    var opts = { method: method, credentials: 'same-origin', headers: { 'Content-Type': 'application/json' } };
    if (payload) opts.body = JSON.stringify(payload);
    return fetch(API + path, opts).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b || {} }; });
    });
  }

  /* ---------- messages and lockout countdown ---------- */
  function stopCountdown() { if (countdown) { clearInterval(countdown); countdown = null; } }

  function say(text, kind) {
    var m = $('authMsg');
    if (!m) return;
    m.textContent = text || '';
    m.className = 'auth-msg' + (kind ? ' is-' + kind : '');
    m.hidden = !text;
  }

  function waitText(s) {
    if (s < 60) return s + (s === 1 ? ' second' : ' seconds');
    var m = Math.ceil(s / 60);
    return m + (m === 1 ? ' minute' : ' minutes');
  }

  // "Too many attempts. Try again in 12 minutes." counting down live; the submit button stays disabled until then.
  function lockout(form, seconds) {
    stopCountdown();
    var btn = form.querySelector('.auth-submit-btn'), until = Date.now() + seconds * 1000;
    if (btn) btn.disabled = true;
    function tick() {
      var left = Math.ceil((until - Date.now()) / 1000);
      if (left <= 0) { stopCountdown(); say('You can try again now.', 'ok'); if (btn) btn.disabled = false; return; }
      say('Too many attempts. Try again in ' + waitText(left) + '.', 'error');
    }
    tick();
    countdown = setInterval(tick, 1000);
  }

  function busy(form, on) {
    var btn = form.querySelector('.auth-submit-btn');
    if (!btn) return;
    if (on) { btn.dataset.label = btn.textContent; btn.textContent = 'Please wait…'; btn.disabled = true; }
    else { if (btn.dataset.label) btn.textContent = btn.dataset.label; btn.disabled = false; }
  }

  function failed(form, res) {
    if (res.status === 429) { lockout(form, res.body.retryAfter || 60); return; }
    // Normally the server's own sentence. If a reply has none, show the code so the cause can be found.
    say(res.body.message || ('Something went wrong (error ' + res.status + (res.body.error ? ': ' + res.body.error : '') + '). Please try again.'), 'error');
    if (res.body.field) { var f = form.elements[res.body.field]; if (f) { f.setAttribute('aria-invalid', 'true'); f.focus(); } }
  }

  /* ---------- modal views ---------- */
  var TITLES = {
    signin: ['Welcome to Magic Meals', 'Sign in to track orders, save meal boxes & enjoy member perks'],
    signup: ['Welcome to Magic Meals', 'Sign in to track orders, save meal boxes & enjoy member perks'],
    forgot: ['Reset your password', 'We will email you a link to choose a new one.']
  };
  var FORMS = { signin: 'signInForm', signup: 'signUpForm', forgot: 'forgotForm' };

  function setView(v) {
    stopCountdown();
    view = v;
    $('signInForm').hidden = v !== 'signin';
    $('signUpForm').hidden = v !== 'signup';
    $('forgotForm').hidden = v !== 'forgot';
    $('authTabs').hidden = v === 'forgot';
    $('tabSignInBtn').classList.toggle('active', v === 'signin');
    $('tabSignUpBtn').classList.toggle('active', v === 'signup');
    $('authTitle').textContent = TITLES[v][0];
    $('authSub').textContent = TITLES[v][1];
    say('');
    Object.keys(FORMS).forEach(function (k) { var b = $(FORMS[k]).querySelector('.auth-submit-btn'); if (b) b.disabled = false; });
    $('authGoogleBlock').hidden = !(googleState === 'ready' && (v === 'signin' || v === 'signup'));
    var first = document.querySelector('#' + FORMS[v] + ' input:not(.auth-hp)');
    if (first) setTimeout(function () { try { first.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }, 30);
  }

  /* ---------- signed-in state ---------- */
  var readyResolve, ready = new Promise(function (res) { readyResolve = res; });

  // Fires "mm:auth" only when signed-in/out actually changes (profile.js listens), so refreshing data never loops.
  function setUser(u) {
    var was = !!user;
    user = u || null;
    var b = $('authOpenBtn');
    if (b) {
      b.classList.toggle('is-signed-in', !!user);
      b.setAttribute('aria-label', user ? 'Your profile' + (user.firstName ? ' (' + user.firstName + ')' : '') : 'Sign In or Sign Up');
      b.title = user ? 'Your profile' : 'Sign In / Sign Up';
    }
    if (was !== !!user) document.dispatchEvent(new CustomEvent('mm:auth', { detail: { signedIn: !!user } }));
  }

  function normalise(u) { return u && u.email ? Object.assign({ addresses: [], orders: [], phone: '', firstName: '', lastName: '' }, u) : null; }

  // Reads /api/auth/me (Redis-cached 60 s on the server). 401 = signed out.
  function refresh() {
    return api('me', 'GET').then(function (r) {
      if (r.status === 200 && r.body.user) { setUser(normalise(r.body.user)); return user; }
      if (r.status === 401) setUser(null);
      return user;
    }).catch(function () { return user; });           // offline: keep what we have
  }

  // The page can't see the HttpOnly cookie, so a harmless companion cookie (mm_in) says whether to ask at all.
  function restore() {
    if (!/(?:^|;\s*)mm_in=1/.test(document.cookie)) { readyResolve(); return; }
    refresh().then(readyResolve, readyResolve);
  }

  function goProfile() {
    if (location.hash !== '#profile') location.hash = 'profile';        // main.js router (hashchange) draws the page
  }

  // Sign-in / sign-up / Google worked: close the modal and go to the profile page.
  function signedIn(u, welcome) {
    var n = normalise(u);
    if (!n) { setView('signin'); say(welcome || 'Account created. Please sign in.', 'ok'); refresh().then(function (x) { if (x) { close(); flash = welcome || ''; goProfile(); } }); return; }
    flash = welcome || '';
    setUser(n);
    close();
    goProfile();
  }

  function update(fields) {
    return api('update', 'POST', fields).then(function (r) {
      if (r.status === 200 && r.body.user) { setUser(normalise(r.body.user)); return { ok: true, user: user }; }
      if (r.status === 401) { setUser(null); }
      if (r.status === 429) return { ok: false, message: 'Too many changes. Try again in ' + waitText(r.body.retryAfter || 60) + '.' };
      return { ok: false, message: r.body.message || 'Could not save your details. Please try again.', field: r.body.field };
    }).catch(function () { return { ok: false, message: 'Could not reach the server. Check your connection and try again.' }; });
  }

  function logout() {
    return api('logout', 'POST', {}).catch(function () { /* the cookie is cleared server-side */ }).then(function () { setUser(null); });
  }

  /* ---------- open / close ---------- */
  function open(v) {
    if (user) { goProfile(); return; }                // signed in: the account icon / Profile links open the profile page
    var b = backdrop();
    if (!b) return;
    lastFocus = document.activeElement;
    b.classList.add('open');
    document.body.style.overflow = 'hidden';
    setView(v === 'signup' ? 'signup' : 'signin');
    initGoogle();
  }

  function close() {
    var b = backdrop();
    if (!b) return;
    stopCountdown();
    b.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
    lastFocus = null;
  }

  /* ---------- Google ---------- */
  function initGoogle() {
    if (googleState !== 'idle') return;
    googleState = 'loading';
    api('config', 'GET').then(function (r) {
      var id = r.body && r.body.googleClientId;
      if (!id) { googleState = 'off'; return; }       // not configured: no button, and never a fake one
      var s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.defer = true;
      s.onload = function () {
        try {
          window.google.accounts.id.initialize({ client_id: id, callback: onGoogle, ux_mode: 'popup' });
          var card = document.querySelector('.auth-modal-card');
          window.google.accounts.id.renderButton($('authGoogleSlot'), {
            theme: 'outline', size: 'large', text: 'continue_with', shape: 'rectangular',
            width: Math.max(200, Math.min(360, (card ? card.clientWidth : 400) - 48))
          });
          googleState = 'ready';
          $('authGoogleBlock').hidden = !(isOpen() && (view === 'signin' || view === 'signup'));
        } catch (e) { googleState = 'off'; }
      };
      s.onerror = function () { googleState = 'off'; };
      document.head.appendChild(s);
    }).catch(function () { googleState = 'idle'; });   // try again next time the modal opens
  }

  function onGoogle(resp) {
    say('Signing you in with Google…');
    api('google', 'POST', { credential: resp && resp.credential }).then(function (r) {
      if (r.status === 200 && r.body.ok) signedIn(r.body.user, 'Signed in with Google.');
      else if (r.status === 429) lockout($(FORMS[view] || 'signInForm'), r.body.retryAfter || 60);
      else say(r.body.message || 'Google sign-in failed. Please try again.', 'error');
    }).catch(function () { say('Could not reach the server. Check your connection and try again.', 'error'); });
  }

  /* ---------- form submits ---------- */
  function fields(form) {
    var o = {};
    Array.prototype.forEach.call(form.elements, function (f) {
      if (!f.name) return;
      o[f.name] = f.type === 'checkbox' ? f.checked : f.value;
    });
    return o;
  }

  function validate(form, rules) {
    var bad = null;
    Array.prototype.forEach.call(form.elements, function (f) { if (f.name) f.removeAttribute('aria-invalid'); });
    Object.keys(rules).forEach(function (name) {
      var f = form.elements[name], msg = rules[name](f.value.trim ? f.value.trim() : f.value);
      if (msg && !bad) { bad = msg; f.setAttribute('aria-invalid', 'true'); f.focus(); }
    });
    if (bad) say(bad, 'error');
    return !bad;
  }

  var EMAIL = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;
  var rEmail = function (v) { return EMAIL.test(v) ? '' : 'Enter a valid email address.'; };

  function submit(form, path, payload, onOk) {
    busy(form, true); say('');
    api(path, 'POST', payload).then(function (r) {
      busy(form, false);
      if (r.status === 200 && r.body.ok) onOk(r.body);
      else failed(form, r);
    }).catch(function () { busy(form, false); say('Could not reach the server. Check your connection and try again.', 'error'); });
  }

  function onSubmit(e) {
    var form = e.target.closest && e.target.closest('#signInForm, #signUpForm, #forgotForm');
    if (!form) return;
    e.preventDefault();
    var f = fields(form);
    if (form.id === 'signInForm') {
      if (!validate(form, { email: rEmail, password: function (v) { return v ? '' : 'Enter your password.'; } })) return;
      submit(form, 'login', { email: f.email.trim(), password: f.password, remember: f.remember }, function (b) { form.reset(); signedIn(b.user, 'Welcome back!'); });
    } else if (form.id === 'signUpForm') {
      if (!validate(form, {
        name: function (v) { return v ? '' : 'Enter your name.'; },
        email: rEmail,
        phone: function (v) { return /^(\+?91|0)?[\s-]?[6-9]\d{4}[\s-]?\d{5}$/.test(v) ? '' : 'Enter a 10-digit mobile number.'; },
        password: function (v) { return v.length >= 8 && v.length <= 40 ? '' : 'Password must be 8 to 40 characters.'; }
      })) return;
      submit(form, 'signup', { name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim(), password: f.password, website: f.website }, function (b) { form.reset(); signedIn(b.user, 'Welcome to Magic Meals! Your account is ready.'); });
    } else {
      if (!validate(form, { email: rEmail })) return;
      submit(form, 'recover', { email: f.email.trim(), website: f.website }, function (b) { say(b.message, 'ok'); });
    }
  }

  /* ---------- events ---------- */
  document.addEventListener('submit', onSubmit);

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest) return;
    if (t.closest('#authOpenBtn')) { open(); return; }
    if (t.closest('#authModalCloseBtn') || t === backdrop()) { close(); return; }
    if (t.closest('#tabSignInBtn')) { setView('signin'); return; }
    if (t.closest('#tabSignUpBtn')) { setView('signup'); return; }
    if (t.closest('#authForgotBtn')) {
      setView('forgot');
      var typed = $('siEmail').value.trim(); if (typed) $('fpEmail').value = typed;
      return;
    }
    if (t.closest('#authBackBtn')) { setView('signin'); return; }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) close();
  });

  window.MMAuth = {
    open: open,
    close: close,
    user: function () { return user; },
    email: function () { return user && user.email ? user.email : ''; },
    ready: ready,
    refresh: refresh,
    update: update,
    logout: logout,
    takeFlash: function () { var f = flash; flash = ''; return f; }
  };

  restore();
})();
