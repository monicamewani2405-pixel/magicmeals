/* =========================================================
   profile.js: the #profile page (my details, saved addresses, order history).
   main.js only gives the route an empty <div id="profile-slot">; this file fills it on "app:rendered".
   Data and saving go through MMAuth (auth.js). Nothing from Shopify is ever put in with innerHTML.
   Rules: name and mobile are required and can be edited, the email is shown but can never be changed.
   Cleanup: the page lives inside #app, which main.js replaces on every route change, so its listeners go with it.
   The only document-level listeners (below) are added once and do nothing off this page.
   ========================================================= */
(function () {
  'use strict';

  var seq = 0;                                   // makes a slow answer from an older mount harmless

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function slot() { return document.getElementById('profile-slot'); }
  function onProfile() { return document.body.dataset.view === 'profile'; }

  /* ---------- helpers ---------- */
  function tenDigits(p) { var d = String(p || '').replace(/\D/g, ''); return d.length >= 10 ? d.slice(-10) : ''; }
  function fullName(u) { return ((u.firstName || '') + ' ' + (u.lastName || '')).trim(); }
  function money(t) {
    if (!t) return '';
    var n = parseFloat(t.amount);
    return t.currency === 'INR' ? '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : n.toFixed(2) + ' ' + t.currency;
  }
  function when(iso) {
    var d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  // Shopify's two statuses (+ optional live Shiprocket status), turned into one plain-English label for the customer
  function status(o) {
    var f = String(o.fulfilment || '').toUpperCase(), p = String(o.payment || '').toUpperCase();
    if (p === 'REFUNDED' || p === 'VOIDED') return ['Refunded', ''];
    if (p === 'PENDING' || p === 'AUTHORIZED') return ['Payment pending', 'is-warn'];
    var live = String(o.liveStatus || '').trim();
    if (live) {
      var ls = live.toLowerCase();
      if (/delivered/.test(ls) && !/rto|undelivered/.test(ls)) return ['Delivered', 'is-good'];
      if (/out for delivery/.test(ls)) return ['Out for delivery', 'is-good'];
      if (/in transit|reached|dispatched|shipped|picked up|manifested/.test(ls)) return ['In transit', 'is-info'];
      if (/rto|return|undelivered/.test(ls)) return ['Returning to sender', 'is-warn'];
      if (/cancel/.test(ls)) return ['Cancelled', ''];
      return [live, 'is-info'];
    }
    if (f === 'FULFILLED') return ['Shipped', 'is-good'];
    if (f === 'PARTIALLY_FULFILLED') return ['Partly shipped', 'is-info'];
    return ['Being prepared', 'is-info'];
  }

  /* ---------- pieces ---------- */
  function card(title, sub) {
    var c = el('section', 'acct-card');
    c.appendChild(el('h2', 'acct-card-title', title));
    if (sub) c.appendChild(el('p', 'acct-card-sub', sub));
    return c;
  }

  function field(id, label, input, hint) {
    var w = el('div', 'acct-field');
    var l = el('label', null, label); l.htmlFor = id;
    w.appendChild(l);
    w.appendChild(input);
    if (hint) w.appendChild(el('p', 'acct-hint', hint));
    return w;
  }

  function detailsCard(u) {
    var c = card('My details', 'Keep these up to date so we can deliver and reach you.');
    var form = el('form', 'acct-form'); form.id = 'acctForm'; form.noValidate = true;

    var phone = tenDigits(u.phone);
    if (!phone) form.appendChild(el('p', 'acct-notice', 'Please add your mobile number. We use it to reach you about deliveries.'));

    var name = el('input'); name.id = 'acctName'; name.name = 'name'; name.type = 'text'; name.maxLength = 80;
    name.autocomplete = 'name'; name.required = true; name.value = fullName(u); name.placeholder = 'Your full name';
    form.appendChild(field('acctName', 'Full name', name));

    var ph = el('input'); ph.id = 'acctPhone'; ph.name = 'phone'; ph.type = 'tel'; ph.inputMode = 'numeric'; ph.maxLength = 14;
    ph.autocomplete = 'tel-national'; ph.required = true; ph.value = phone; ph.placeholder = '10-digit mobile number';
    var row = el('div', 'acct-phone'); row.appendChild(el('span', 'acct-prefix', '+91')); row.appendChild(ph);
    form.appendChild(field('acctPhone', 'Mobile number', row));

    var em = el('input'); em.id = 'acctEmail'; em.type = 'email'; em.value = u.email; em.readOnly = true; em.tabIndex = 0;
    em.setAttribute('aria-readonly', 'true'); em.className = 'is-locked';
    form.appendChild(field('acctEmail', 'Email address', em, 'Your email is your login, so it can not be changed.'));

    var status = el('p', 'acct-status'); status.id = 'acctStatus'; status.setAttribute('role', 'status'); status.hidden = true;
    var save = el('button', 'btn acct-save', 'Save changes'); save.type = 'submit';
    form.appendChild(status);
    form.appendChild(save);
    c.appendChild(form);
    return c;
  }

  function addressesCard(u) {
    var c = card('Saved addresses', 'Your delivery addresses.');
    if (!u.addresses.length) {
      c.appendChild(el('p', 'acct-empty', 'No saved address yet. Your delivery address will show up here after your first order.'));
      return c;
    }
    u.addresses.forEach(function (a) {
      var b = el('div', 'acct-addr');
      a.lines.forEach(function (l, i) { if (i) b.appendChild(document.createElement('br')); b.appendChild(document.createTextNode(l)); });
      if (a.phone) { b.appendChild(document.createElement('br')); b.appendChild(document.createTextNode('Phone: ' + a.phone)); }
      if (a.isDefault) b.appendChild(el('span', 'acct-chip is-info', 'Default'));
      c.appendChild(b);
    });
    return c;
  }

  function ordersCard(u) {
    var c = card('Order history', 'Your most recent orders (up to 10).');
    if (!u.orders.length) {
      c.appendChild(el('p', 'acct-empty', 'No orders yet. Your meals will show up here once you place your first order.'));
      var shop = el('a', 'btn acct-shop', 'Browse meals'); shop.setAttribute('data-go', 'shop'); shop.setAttribute('data-cat', 'All'); shop.href = '#shop';
      c.appendChild(shop);
      return c;
    }
    u.orders.forEach(function (o) {
      var b = el('article', 'acct-order'), top = el('div', 'acct-order-top');
      top.appendChild(el('strong', null, 'Order #' + o.number));
      top.appendChild(el('strong', null, money(o.total)));
      b.appendChild(top);
      var st = status(o), meta = el('div', 'acct-order-meta');
      meta.appendChild(el('span', null, when(o.date)));
      meta.appendChild(el('span', 'acct-chip ' + st[1], st[0]));
      b.appendChild(meta);
      var ul = el('ul', 'acct-items');
      o.items.forEach(function (i) { ul.appendChild(el('li', null, i.title + ' × ' + i.qty)); });
      b.appendChild(ul);
      (o.tracking || []).forEach(function (t) {
        var line = el('p', 'acct-trackline', (t.company ? t.company + ' · ' : '') + (t.number ? 'AWB ' + t.number : 'Tracking available'));
        if (t.url) { line.appendChild(document.createTextNode(' ')); var ta = el('a', 'acct-track', 'Track shipment'); ta.href = t.url; ta.target = '_blank'; ta.rel = 'noopener noreferrer'; line.appendChild(ta); }
        b.appendChild(line);
      });
      if (/^https:\/\//.test(o.statusUrl || '')) {
        var a = el('a', 'acct-track', 'Track / view this order'); a.href = o.statusUrl; a.target = '_blank'; a.rel = 'noopener noreferrer';
        b.appendChild(a);
      }
      c.appendChild(b);
    });
    return c;
  }

  /* ---------- page states ---------- */
  function shell() { var w = el('section', 'acct'); return w; }

  function renderLoading(s) {
    s.textContent = '';
    var w = shell(); w.appendChild(el('p', 'acct-loading', 'Loading your profile…'));
    s.appendChild(w);
  }

  function renderSignedOut(s) {
    s.textContent = '';
    var w = shell(), c = el('section', 'acct-card acct-signedout');
    c.appendChild(el('h1', 'acct-title', 'Sign in to see your profile'));
    c.appendChild(el('p', 'acct-card-sub', 'Your details, saved addresses and order history are here once you sign in.'));
    var b = el('button', 'btn', 'Sign In or Create Account'); b.type = 'button'; b.setAttribute('data-acct', 'signin');
    c.appendChild(b);
    w.appendChild(c); s.appendChild(w);
  }

  function renderPage(s, u, message) {
    s.textContent = '';
    var w = shell();

    var head = el('div', 'acct-head'), txt = el('div');
    txt.appendChild(el('p', 'acct-eyebrow', 'My account'));
    txt.appendChild(el('h1', 'acct-title', 'Hi, ' + (u.firstName || 'there') + ' 👋'));
    txt.appendChild(el('p', 'acct-sub', 'Manage your details and see your orders.'));
    head.appendChild(txt);
    var out = el('button', 'acct-ghost', 'Sign out'); out.type = 'button'; out.setAttribute('data-acct', 'logout');
    head.appendChild(out);
    w.appendChild(head);

    if (message) { var f = el('p', 'acct-flash', message); f.setAttribute('role', 'status'); w.appendChild(f); }

    var grid = el('div', 'acct-grid'), left = el('div', 'acct-col');
    left.appendChild(detailsCard(u));
    left.appendChild(addressesCard(u));
    grid.appendChild(left);
    grid.appendChild(ordersCard(u));
    w.appendChild(grid);
    s.appendChild(w);

    if (!tenDigits(u.phone)) { var ph = s.querySelector('#acctPhone'); if (ph) ph.setAttribute('aria-invalid', 'true'); }
  }

  /* ---------- mount ---------- */
  function bind(s) {
    if (s.dataset.bound) return;
    s.dataset.bound = '1';

    s.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-acct]');
      if (!t) return;
      if (t.dataset.acct === 'signin') MMAuth.open('signin');
      if (t.dataset.acct === 'logout') {
        t.disabled = true;
        MMAuth.logout().then(function () { location.hash = 'home'; });
      }
    });

    s.addEventListener('submit', function (e) {
      var form = e.target.closest && e.target.closest('#acctForm');
      if (!form) return;
      e.preventDefault();
      var name = form.elements.name, phone = form.elements.phone, st = form.querySelector('#acctStatus'), btn = form.querySelector('.acct-save');
      function say(text, kind) { st.textContent = text; st.className = 'acct-status ' + (kind || ''); st.hidden = !text; }
      name.removeAttribute('aria-invalid'); phone.removeAttribute('aria-invalid');
      var n = name.value.replace(/\s+/g, ' ').trim(), p = phone.value.replace(/[\s-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, '');
      if (!n) { name.setAttribute('aria-invalid', 'true'); name.focus(); return say('Please enter your full name.', 'is-error'); }
      if (!/^[6-9]\d{9}$/.test(p)) { phone.setAttribute('aria-invalid', 'true'); phone.focus(); return say('Please enter a 10-digit mobile number.', 'is-error'); }
      btn.disabled = true; btn.textContent = 'Saving…'; say('');
      MMAuth.update({ name: n, phone: p }).then(function (r) {
        if (r.ok) { if (slot() === s) renderPage(s, r.user, 'Your details have been saved.'); return; }
        btn.disabled = false; btn.textContent = 'Save changes';
        if (!MMAuth.user()) { renderSignedOut(s); return; }        // session ended meanwhile
        say(r.message, 'is-error');
        if (r.field && form.elements[r.field]) { form.elements[r.field].setAttribute('aria-invalid', 'true'); form.elements[r.field].focus(); }
      });
    });
  }

  function mount() {
    var s = slot();
    if (!s || !window.MMAuth) return;
    var my = ++seq;
    bind(s);
    renderLoading(s);
    MMAuth.ready.then(function () {
      if (my !== seq || slot() !== s) return;
      if (!MMAuth.user()) return renderSignedOut(s);
      var message = MMAuth.takeFlash();
      return MMAuth.refresh().then(function (u) {
        if (my !== seq || slot() !== s) return;
        if (u) renderPage(s, u, message); else renderSignedOut(s);
      });
    });
  }

  document.addEventListener('app:rendered', function (e) { if (e.detail && e.detail.view === 'profile') mount(); });
  document.addEventListener('mm:auth', function () { if (onProfile()) mount(); });   // signed in or out while on this page
})();
