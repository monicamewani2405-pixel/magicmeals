/* api/magic-complete.js: Vercel serverless function. POST /api/magic-complete
   { paymentId: "pay_...", orderId: "order_..." }  ->  { ok: true, orderName, statusUrl }
   Called by the browser right after Razorpay confirms a payment: Razorpay then creates the order in Shopify and returns its status page. */
'use strict';
const { send, clientIp, guard, body, limited } = require('./_lib/http');
const rzp = require('./_lib/razorpay');

const RATE_MAX = 40, RATE_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now(), list = (hits.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  if (list.length >= RATE_MAX) { hits.set(ip, list); return Math.ceil((RATE_WINDOW_MS - (now - list[0])) / 1000); }
  list.push(now); hits.set(ip, list);
  return 0;
}
const PAY_RE = /^pay_[A-Za-z0-9]{10,30}$/, ORDER_RE = /^order_[A-Za-z0-9]{10,30}$/;

// Only ever hand the browser a Shopify page on the store's own domain.
function safeStatusUrl(u) {
  try {
    const x = new URL(u);
    const ok = x.protocol === 'https:' && (/\.myshopify\.com$/.test(x.hostname) || x.hostname === (process.env.SHOPIFY_STORE_DOMAIN || '').trim());
    return ok ? x.toString() : '';
  } catch (e) { return ''; }
}

module.exports = async function handler(req, res) {
  if (!guard(req, res, 'POST')) return;
  const b = body(req);
  if (!PAY_RE.test(String(b.paymentId || '')) || !ORDER_RE.test(String(b.orderId || ''))) return send(res, 400, { ok: false, error: 'invalid', message: 'Invalid request.' });
  const wait = rateLimited(clientIp(req));
  if (wait) return limited(res, wait);
  try {
    const r = await rzp.call('/1cc/shopify/complete', { razorpay_payment_id: b.paymentId, razorpay_order_id: b.orderId });
    return send(res, 200, { ok: true, orderName: String(r.order_id || ''), statusUrl: safeStatusUrl(r.order_status_url) });
  } catch (e) {
    console.error('magic-complete failed:', e && e.message);      // ids are not logged
    return send(res, 502, { ok: false, error: 'unavailable', message: 'Could not finish the order yet.' });
  }
};
module.exports._test = { safeStatusUrl };
