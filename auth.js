/* =========================================================
   auth.js: Sign In / Create Account / Forgot password / Google / Profile modal.
   Talks only to our own /api/auth/* endpoints. The login token is an HttpOnly cookie the page cannot read;
   this file only ever holds the customer's name, email, addresses and orders (window.MMAuth.user()).
   Public API: MMAuth.open(view?), MMAuth.close(), MMAuth.user(), MMAuth.email()
   ========================================================= */
(function () {
  'use strict';

  var API = '/api/auth/';
  var user = null;                 // { firstName, lastName, email, phone, addresses[], orders[] } or null
  var view = 'signin';             // signin | signup | forgot | profile
  var countdown = null;            // lockout timer
  var googleState = 'idle';        // idle | loading | ready | off
  var lastFocus = null;

  function $(id) { return document.getElementById(id); }
  function backdrop() { return $('authModalBackdrop'); }
  function isOpen() { var b = backdrop(); return !!(b && b.classList.contains('open')); }

  /* ---------- tiny DOM helper (text only: nothing from the server is ever put in with innerHTML) ---------- */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

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

  // Shared result handling. Returns true if the request succeeded.
  function failed(form, res) {
    if (res.status === 429) { lockout(form, res.body.retryAfter || 60); return true; }
    say(res.body.message || 'Something went wrong. Please try again.', 'error');
    return true;
  }

  /* ---------- views ---------- */
  var TITLES = {
    signin: ['Welcome to Magic Meals', 'Sign in to track orders, save meal boxes & enjoy member perks'],
    signup: ['Welcome to Magic Meals', 'Sign in to track orders, save meal boxes & enjoy member perks'],
    forgot: ['Reset your password', 'We will email you a link to choose a new one.']
  };

  function setView(v) {
    stopCountdown();
    view = v;
    $('signInForm').hidden = v !== 'signin';
    $('signUpForm').hidden = v !== 'signup';
    $('forgotForm').hidden = v !== 'forgot';
    $('profileView').hidden = v !== 'profile';
    $('authTabs').hidden = v === 'forgot' || v === 'profile';
    $('tabSignInBtn').classList.toggle('active', v === 'signin');
    $('tabSignUpBtn').classList.toggle('active', v === 'signup');
    var t = TITLES[v];
    if (v === 'profile') t = ['Hi, ' + (user && user.firstName ? user.firstName : 'there'), 'Your Magic Meals account'];
    $('authTitle').textContent = t[0];
    $('authSub').textContent = t[1];
    say('');
    ['signInForm', 'signUpForm', 'forgotForm'].forEach(function (id) { var b = $(id).querySelector('.auth-submit-btn'); if (b) b.disabled = false; });
    $('authGoogleBlock').hidden = !(googleState === 'ready' && (v === 'signin' || v === 'signup'));
    var first = v === 'profile' ? $('authLogoutBtn') : document.querySelector('#' + { signin: 'signInForm', signup: 'signUpForm', forgot: 'forgotForm' }[v] + ' input:not(.auth-hp)');
    if (first) setTimeout(function () { try { first.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }, 30);
  }

  /* ---------- profile ---------- */
  function money(t) {
    if (!t) return '';
    var n = parseFloat(t.amount);
    return t.currency === 'INR' ? '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : n.toFixed(2) + ' ' + t.currency;
  }
  function nice(s) { return String(s || '').toLowerCase().replace(/_/g, ' ').replace(/^./, function (c) { return c.toUpperCase(); }); }

  function renderProfile() {
    if (!user) return;
    $('profName').textContent = ((user.firstName || '') + ' ' + (user.lastName || '')).trim() || 'Your account';
    $('profEmail').textContent = user.email || '';
    $('profPhone').textContent = user.phone || '';

    var ad = $('profAddresses'); ad.textContent = '';
    if (!user.addresses || !user.addresses.length) ad.appendChild(el('p', 'auth-empty', 'No saved addresses yet. They are saved when you check out signed in.'));
    else user.addresses.forEach(function (a) {
      var box = el('div', 'auth-addr');
      a.lines.forEach(function (l, i) { if (i) box.appendChild(document.createElement('br')); box.appendChild(document.createTextNode(l)); });
      if (a.isDefault) box.appendChild(el('em', null, 'Default'));
      ad.appendChild(box);
    });

    var od = $('profOrders'); od.textContent = '';
    if (!user.orders || !user.orders.length) od.appendChild(el('p', 'auth-empty', 'No orders yet. Your meals will show up here.'));
    else user.orders.forEach(function (o) {
      var box = el('div', 'auth-order'), top = el('div', 'auth-order-top');
      top.appendChild(el('span', null, 'Order #' + o.number));
      top.appendChild(el('span', null, money(o.total)));
      box.appendChild(top);
      var d = new Date(o.date);
      box.appendChild(el('div', 'auth-order-meta', (isNaN(d) ? '' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' · ') + nice(o.fulfilment || o.payment)));
      box.appendChild(el('div', null, o.items.map(function (i) { return i.title + ' × ' + i.qty; }).join(', ')));
      if (o.statusUrl) {
        var a = el('a', null, 'Track / view order');
        a.href = o.statusUrl; a.target = '_blank'; a.rel = 'noopener noreferrer';
        box.appendChild(a);
      }
      od.appendChild(box);
    });
  }

  /* ---------- signed-in state ---------- */
  function setUser(u) {
    user = u || null;
    var b = $('authOpenBtn');
    if (b) {
      b.classList.toggle('is-signed-in', !!user);
      var label = user ? 'Your account' + (user.firstName ? ' (' + user.firstName + ')' : '') : 'Sign In or Sign Up';
      b.setAttribute('aria-label', label);
      b.title = user ? 'Your account' : 'Sign In / Sign Up';
    }
    document.dispatchEvent(new CustomEvent('mm:auth', { detail: { signedIn: !!user } }));
  }

  // The page can't see the HttpOnly cookie, so a harmless companion cookie (mm_in) says whether to ask at all.
  function restore() {
    if (!/(?:^|;\s*)mm_in=1/.test(document.cookie)) return;
    api('me', 'GET').then(function (r) {
      if (r.status === 200 && r.body.user) { setUser(r.body.user); if (isOpen() && view !== 'profile') { renderProfile(); setView('profile'); } }
      else setUser(null);
    }).catch(function () { /* offline: stay signed-out in the UI; the cookie is untouched */ });
  }

  function loadProfileFresh() {
    return api('me', 'GET').then(function (r) {
      if (r.status === 200 && r.body.user) { setUser(r.body.user); renderProfile(); }
      else if (r.status === 401) { setUser(null); setView('signin'); }
    }).catch(function () { /* keep what we have */ });
  }

  function signedIn(u, welcome) {
    setUser(u && u.email ? Object.assign({ addresses: [], orders: [], phone: '' }, u) : null);
    if (!user) { setView('signin'); say(welcome || 'Account created. Please sign in.', 'ok'); restore(); return; }   // restore(): the cookie may already be set
    renderProfile(); setView('profile');
    loadProfileFresh();                      // fills addresses and orders
    if (welcome) say(welcome, 'ok');
  }

  /* ---------- open / close ---------- */
  function open(v) {
    var b = backdrop();
    if (!b) return;
    lastFocus = document.activeElement;
    b.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (user) { renderProfile(); setView('profile'); loadProfileFresh(); }
    else setView(v === 'signup' ? 'signup' : 'signin');
    initGoogle();
  }

  function close() {
    var b = backdrop();
    if (!b) return;
    stopCountdown();
    b.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
  }

  /* ---------- Google ---------- */
  function initGoogle() {
    if (googleState !== 'idle') return;
    googleState = 'loading';
    api('config', 'GET').then(function (r) {
      var id = r.body && r.body.googleClientId;
      if (!id) { googleState = 'off'; return; }       // not configured yet: no button, no fake button
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
      else if (r.status === 429) lockout($(view === 'signup' ? 'signUpForm' : 'signInForm'), r.body.retryAfter || 60);
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
      submit(form, 'login', { email: f.email.trim(), password: f.password, remember: f.remember }, function (b) { form.reset(); signedIn(b.user, 'Signed in.'); });
    } else if (form.id === 'signUpForm') {
      if (!validate(form, {
        name: function (v) { return v ? '' : 'Enter your name.'; },
        email: rEmail,
        phone: function (v) { return !v || /^(\+?91|0)?[\s-]?[6-9]\d{4}[\s-]?\d{5}$/.test(v) ? '' : 'Enter a 10-digit mobile number.'; },
        password: function (v) { return v.length >= 8 && v.length <= 40 ? '' : 'Password must be 8 to 40 characters.'; }
      })) return;
      submit(form, 'signup', { name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim(), password: f.password, website: f.website }, function (b) { form.reset(); signedIn(b.user, 'Welcome to Magic Meals! Your account is ready.'); });
    } else {
      if (!validate(form, { email: rEmail })) return;
      submit(form, 'recover', { email: f.email.trim(), website: f.website }, function (b) { say(b.message, 'ok'); });
    }
  }

  function logout() {
    var btn = $('authLogoutBtn');
    btn.disabled = true;
    api('logout', 'POST', {}).catch(function () { /* cookie is cleared server-side; fall through */ }).then(function () {
      btn.disabled = false;
      setUser(null);
      setView('signin');
      say('You have been signed out.', 'ok');
    });
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
    if (t.closest('#authLogoutBtn')) { logout(); return; }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) close();
  });

  window.MMAuth = {
    open: open,
    close: close,
    user: function () { return user; },
    email: function () { return user && user.email ? user.email : ''; }
  };

  restore();
})();
