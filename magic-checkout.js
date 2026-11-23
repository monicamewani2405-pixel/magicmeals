/**
 * Magic Meals: opens Razorpay Magic Checkout right on the website (no jump to the store's cart page).
 *
 *   MagicDirect.open(direct) -> Promise<boolean>
 *     direct = { cartId, code, items: [{ variantId, productId, quantity }] }   (from ShopifyConnector.checkout)
 *     Resolves true once the Razorpay window is open (the customer is now in it), false if it could not be opened, so the caller can fall back
 *     to the store's cart page. Nothing is charged by this file: the payment happens inside Razorpay's window.
 *
 * Flow: /api/magic-order makes the Razorpay order from the verified Shopify cart -> window.Razorpay (magic-checkout.js SDK) opens ->
 * on payment /api/magic-complete makes the Shopify order -> the customer lands on Shopify's order status page.
 * If the order cannot be completed after a payment, the customer is shown the payment id (never silently lost).
 */
(function () {
  'use strict';
  var SDK = 'https://checkout.razorpay.com/v1/magic-checkout.js';
  var sdkPromise = null;

  function loadSdk() {
    if (window.Razorpay) return Promise.resolve();
    if (sdkPromise) return sdkPromise;
    sdkPromise = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = SDK; s.async = true;
      s.onload = function () { window.Razorpay ? resolve() : reject(new Error('sdk')); };
      s.onerror = function () { sdkPromise = null; reject(new Error('sdk')); };
      document.head.appendChild(s);
    });
    return sdkPromise;
  }

  function post(url, data) {
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().catch(function () { return {}; }); });
  }

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  // After a successful payment: ask Razorpay to create the Shopify order. Retries, because the money is already taken.
  function complete(resp, tries) {
    return post('/api/magic-complete', { paymentId: resp.razorpay_payment_id, orderId: resp.razorpay_order_id }).then(function (j) {
      if (j && j.ok) return j;
      if (tries > 1) return wait(2500).then(function () { return complete(resp, tries - 1); });
      return null;
    }).catch(function () { return tries > 1 ? wait(2500).then(function () { return complete(resp, tries - 1); }) : null; });
  }

  function onPaid(resp) {
    var note = document.createElement('div');
    note.setAttribute('role', 'status');
    note.style.cssText = 'position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:rgb(var(--black-rgb) / 0.7);color:var(--bg);font:600 18px var(--font-body);text-align:center;padding:24px';
    note.textContent = 'Payment received. Confirming your order...';
    document.body.appendChild(note);
    complete(resp, 4).then(function (j) {
      if (j && j.statusUrl) { window.location.href = j.statusUrl; return; }
      if (j) { note.textContent = 'Thank you! Your order ' + (j.orderName || '') + ' is placed. A confirmation will reach you shortly.'; return; }
      note.textContent = 'Your payment was received (payment id ' + resp.razorpay_payment_id + '), but we could not confirm the order on screen. Please keep this id and message us on WhatsApp. Nothing is lost.';
    });
  }

  function open(direct) {
    if (!direct || !direct.cartId || !direct.items || !direct.items.length) return Promise.resolve(false);
    return Promise.all([
      post('/api/magic-order', { cartId: direct.cartId, items: direct.items }),
      loadSdk()
    ]).then(function (r) {
      var o = r[0];
      if (!o || !o.ok || !o.orderId || !o.key) return false;
      var opts = {
        key: o.key,
        name: 'Magic Meals',
        order_id: o.orderId,
        show_coupons: true,
        prefill: direct.code ? { coupon_code: direct.code } : {},
        handler: onPaid,
        modal: { ondismiss: function () { /* customer closed the window: the cart on this page is untouched */ } }
      };
      var rzp = new window.Razorpay(opts);
      rzp.open();
      return true;
    }).catch(function (e) { console.error('magic-checkout:', e && e.message); return false; });
  }

  window.MagicDirect = { open: open };
})();
