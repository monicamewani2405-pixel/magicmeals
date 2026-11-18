/* "Download Brochure": a vertical tab on the right edge, and a small form (Name, Email, Phone Number, all required).
 * On submit the details go to /api/brochure (api/brochure.js emails them to the business); only when that succeeds does the PDF download.
 * The PDF itself is a public file, so this is lead capture, not a lock. On the Shopify site this becomes a Shopify form.
 * Everything is created here (tab + dialog), so index.html only includes brochure.css and this file. Nothing else on the site is touched.
 */
(function () {
  'use strict';

  var PDF_URL = 'assets/brochure/Magic-Meals-Brochure.pdf';
  var PDF_NAME = 'Magic-Meals-Brochure.pdf';
  var ENDPOINT = '/api/brochure';
  var SUPPORT_PHONE = '+91 80099 00966';
  var FAIL_MSG = 'Something went wrong. Please try again or call ' + SUPPORT_PHONE + '.';

  var tab, backdrop, dialog, form, statusEl, submitBtn, closeBtn;
  var fields = {};
  var lastFocus = null, sending = false;

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (html != null) e.innerHTML = html;
    return e;
  }

  // ---- validation (the server checks the same rules again) -------------------------------------------------------------
  function normPhone(v) {
    var d = String(v || '').replace(/[\s\-().]/g, '');
    if (!/^\+?\d+$/.test(d)) return '';
    d = d.replace(/^\+/, '');
    if (d.length === 12 && d.indexOf('91') === 0) d = d.slice(2);
    else if (d.length === 11 && d.charAt(0) === '0') d = d.slice(1);
    return /^[6-9]\d{9}$/.test(d) ? d : '';
  }
  function validate() {
    var errs = {};
    var name = fields.name.value.trim(), email = fields.email.value.trim(), phone = fields.phone.value.trim();
    if (name.length < 2 || name.length > 80) errs.name = name ? 'Please enter your name (2 to 80 characters).' : 'Please enter your name.';
    if (!email) errs.email = 'Please enter your email address.';
    else if (email.length > 120 || !/^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/.test(email)) errs.email = 'Please enter a valid email address, for example name@example.com.';
    if (!phone) errs.phone = 'Please enter your phone number.';
    else if (!normPhone(phone)) errs.phone = 'Please enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.';
    return errs;
  }
  function showErrors(errs) {
    var first = null, n = 0;
    ['name', 'email', 'phone'].forEach(function (k) {
      var msg = errs[k] || '';
      document.getElementById('broErr' + k).textContent = msg;
      fields[k].setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg) { n++; if (!first) first = fields[k]; }
    });
    statusEl.textContent = n ? (n === 1 ? 'Please fix 1 field.' : 'Please fix ' + n + ' fields.') : '';
    if (first) first.focus();
    return n === 0;
  }

  // ---- open / close, focus handling ---------------------------------------------------------------------------------------
  function focusable() {
    return Array.prototype.slice.call(dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"])'))
      .filter(function (n) { return n.offsetWidth || n.offsetHeight; });
  }
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    var f = focusable(); if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function open() {
    if (!backdrop.hidden) return;
    lastFocus = document.activeElement;
    resetForm();
    backdrop.hidden = false;
    tab.hidden = true;                       // hidden while the dialog is open
    document.documentElement.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    fields.name.focus();
  }
  function close() {
    if (backdrop.hidden) return;
    backdrop.hidden = true;
    tab.hidden = false;
    document.documentElement.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    var back = lastFocus && document.contains(lastFocus) && lastFocus.focus ? lastFocus : tab;
    try { back.focus(); } catch (e) { tab.focus(); }
  }
  function resetForm() {
    sending = false;
    form.hidden = false;
    var ok = dialog.querySelector('.bro-success'); if (ok) ok.hidden = true;
    form.reset();
    submitBtn.disabled = false;
    submitBtn.textContent = 'Download Brochure';
    showErrors({});
    statusEl.textContent = '';
  }

  // ---- submit ---------------------------------------------------------------------------------------------------------------
  function startDownload() {
    var a = el('a', { href: PDF_URL, download: PDF_NAME });
    a.style.display = 'none';
    document.body.appendChild(a); a.click();
    setTimeout(function () { if (a.parentNode) a.parentNode.removeChild(a); }, 1000);
  }
  function success() {
    form.hidden = true;
    var box = dialog.querySelector('.bro-success'); box.hidden = false;
    var again = box.querySelector('.bro-again');
    box.querySelector('.bro-success-msg').focus();
    startDownload();
    again.onclick = function (e) { e.preventDefault(); startDownload(); };
  }
  function resetButton() { sending = false; submitBtn.disabled = false; submitBtn.textContent = 'Download Brochure'; }
  function submit(e) {
    e.preventDefault();
    if (sending) return;                                   // no double submits
    if (!showErrors(validate())) return;
    sending = true; submitBtn.disabled = true; submitBtn.textContent = 'Sending...';
    statusEl.textContent = '';
    var ctl = ('AbortController' in window) ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 15000);
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: fields.name.value.trim(), email: fields.email.value.trim(), phone: normPhone(fields.phone.value.trim()), website: fields.website.value }),
      signal: ctl ? ctl.signal : undefined
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { return { status: r.status, body: j }; });
    }).then(function (res) {
      clearTimeout(timer);
      if (res.body && res.body.ok) { sending = false; success(); return; }
      if (res.status === 400 && res.body && res.body.errors) { showErrors(res.body.errors); statusEl.textContent = res.body.message || ''; }
      else statusEl.textContent = FAIL_MSG;                // a failed send keeps the form and does NOT start the download
      resetButton();
    }).catch(function () {
      clearTimeout(timer);
      statusEl.textContent = FAIL_MSG;
      resetButton();
    });
  }

  // ---- build the tab and the dialog -------------------------------------------------------------------------------------------
  function field(id, label, attrs) {
    var wrap = el('div', { 'class': 'bro-field' });
    wrap.appendChild(el('label', { 'class': 'bro-label', 'for': 'bro' + id }, label));
    var input = el('input', Object.assign({ 'class': 'bro-input', id: 'bro' + id, name: id, required: '', 'aria-required': 'true', 'aria-invalid': 'false', 'aria-describedby': 'broErr' + id }, attrs));
    wrap.appendChild(input);
    wrap.appendChild(el('p', { 'class': 'bro-err', id: 'broErr' + id }));
    fields[id] = input;
    return wrap;
  }
  function build() {
    tab = el('button', { type: 'button', 'class': 'bro-tab', 'aria-haspopup': 'dialog' }, '<span class="bro-tab-text">Download Brochure</span>');
    tab.addEventListener('click', open);

    backdrop = el('div', { 'class': 'bro-backdrop', hidden: '' });
    dialog = el('div', { 'class': 'bro-dialog', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'broTitle', 'aria-describedby': 'broLead', tabindex: '-1' });
    closeBtn = el('button', { type: 'button', 'class': 'bro-close', 'aria-label': 'Close' }, '<span aria-hidden="true">&times;</span>');
    closeBtn.addEventListener('click', close);
    dialog.appendChild(closeBtn);
    dialog.appendChild(el('h2', { 'class': 'bro-title', id: 'broTitle' }, 'Download our brochure'));
    dialog.appendChild(el('p', { 'class': 'bro-lead', id: 'broLead' }, 'Tell us where to reach you and the brochure downloads right away. All fields are required.'));

    form = el('form', { novalidate: '', autocomplete: 'on' });
    form.appendChild(field('name', 'Name', { type: 'text', autocomplete: 'name', maxlength: '80' }));
    form.appendChild(field('email', 'Email', { type: 'email', autocomplete: 'email', inputmode: 'email', maxlength: '120' }));
    form.appendChild(field('phone', 'Phone Number', { type: 'tel', autocomplete: 'tel', inputmode: 'tel', maxlength: '20' }));
    var hp = el('div', { 'class': 'bro-hp', 'aria-hidden': 'true' }, '<label>Website<input type="text" name="website" id="broWebsite" tabindex="-1" autocomplete="off"></label>');
    form.appendChild(hp); fields.website = hp.querySelector('input');
    statusEl = el('div', { 'class': 'bro-status', 'aria-live': 'polite', 'aria-atomic': 'true' });
    form.appendChild(statusEl);
    submitBtn = el('button', { type: 'submit', 'class': 'bro-submit' }, 'Download Brochure');
    form.appendChild(submitBtn);
    form.appendChild(el('p', { 'class': 'bro-privacy' }, 'We use these details only to send you the brochure and to contact you about Magic Meals. See our <a class="bro-link" href="#privacy-policy">Privacy Policy</a>.'));
    form.addEventListener('submit', submit);
    dialog.appendChild(form);

    var ok = el('div', { 'class': 'bro-success', hidden: '' },
      '<p class="bro-success-msg" tabindex="-1" role="status">Thank you! Your brochure is downloading.</p><a class="bro-again" href="' + PDF_URL + '" download="' + PDF_NAME + '">Download again</a>');
    dialog.appendChild(ok);

    backdrop.appendChild(dialog);
    backdrop.addEventListener('mousedown', function (e) { if (e.target === backdrop) close(); });
    // opening the Privacy Policy (a page inside the site) closes the dialog
    dialog.querySelector('.bro-link').addEventListener('click', function () { setTimeout(close, 0); });
    window.addEventListener('hashchange', close);

    document.body.appendChild(tab);
    document.body.appendChild(backdrop);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
