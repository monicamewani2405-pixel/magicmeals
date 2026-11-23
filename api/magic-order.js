/* api/magic-order.js: Vercel serverless function. POST /api/magic-order
   { cartId: "gid://shopify/Cart/...", items: [{ variantId, productId, quantity }] }  ->  { ok: true, key, orderId }
   Turns the verified Shopify cart into a Razorpay Magic Checkout order, so the Razorpay window can open on our own page.
   Prices are never taken from the browser: Razorpay prices the lines from Shopify. We only pass ids and quantities, all re-validated here. */
'use strict';
const { send, clientIp, guard, body, limited } = require('./_lib/http');
const rzp = require('./_lib/razorpay');

const RATE_MAX = 30, RATE_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now(), list = (hits.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  if (list.length >= RATE_MAX) { hits.set(ip, list); return Math.ceil((RATE_WINDOW_MS - (now - list[0])) / 1000); }
  list.push(now); hits.set(ip, list);
  if (hits.size > 5000) for (const [k, l] of hits) if (!l.some(t => now - t < RATE_WINDOW_MS)) hits.delete(k);
  return 0;
}

const CART_RE = /^gid:\/\/shopify\/Cart\/[A-Za-z0-9_-]{8,60}(\?key=[A-Za-z0-9]{8,64})?$/;
const ID_RE = /^\d{6,20}$/;

function validate(b) {
  if (typeof b.cartId !== 'string' || !CART_RE.test(b.cartId)) return null;
  if (!Array.isArray(b.items) || b.items.length < 1 || b.items.length > 60) return null;
  const items = [];
  for (const i of b.items) {
    const variantId = String((i && i.variantId) || ''), productId = String((i && i.productId) || ''), q = Number(i && i.quantity);
    if (!ID_RE.test(variantId) || !ID_RE.test(productId) || !Number.isInteger(q) || q < 1 || q > 100) return null;
    items.push({ id: Number(variantId), quantity: q, product_id: Number(productId), variant_id: Number(variantId), properties: {} });
  }
  return { token: b.cartId.replace('gid://shopify/Cart/', ''), items };
}

module.exports = async function handler(req, res) {
  if (!guard(req, res, 'POST')) return;
  const v = validate(body(req));
  if (!v) return send(res, 400, { ok: false, error: 'invalid', message: 'Please reload the page and try again.' });
  const wait = rateLimited(clientIp(req));
  if (wait) return limited(res, wait);
  try {
    const cart = { token: v.token, note: null, attributes: { source: 'magicmeals-website' }, item_count: v.items.reduce((n, i) => n + i.quantity, 0), items: v.items };
    const chk = await rzp.call('/magic/checkout/shopify', { cart });
    if (!chk.shopify_checkout_id) throw new Error('razorpay_no_checkout');
    const ord = await rzp.call('/magic/order/shopify', { shopify_checkout_id: chk.shopify_checkout_id });
    if (!ord.order_id) throw new Error('razorpay_no_order');
    return send(res, 200, { ok: true, key: rzp.KEY_ID, orderId: ord.order_id });
  } catch (e) {
    console.error('magic-order failed:', e && e.message);
    return send(res, 502, { ok: false, error: 'unavailable', message: 'Checkout is temporarily unavailable.' });
  }
};
module.exports._test = { validate };
