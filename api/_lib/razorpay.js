/* api/_lib/razorpay.js: server-side calls to Razorpay Magic Checkout for the headless (own website) flow.
   Razorpay's documented calls identify the store by the PUBLIC key id only (rzp_live_...). There is no secret key here and none is needed.
   Optional override: RAZORPAY_KEY_ID. */
'use strict';

const KEY_ID = (process.env.RAZORPAY_KEY_ID || 'rzp_live_ScCLXekFzrprmY').trim();
const BASE = 'https://api.razorpay.com/v1';

async function call(path, payload) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 15000);
  try {
    const r = await fetch(BASE + path + '?key_id=' + encodeURIComponent(KEY_ID), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctl.signal
    });
    let j = null;
    try { j = await r.json(); } catch (e) { j = null; }
    if (!r.ok || !j) { const err = new Error('razorpay_http_' + r.status); err.status = r.status; throw err; }
    return j;
  } finally { clearTimeout(t); }
}

module.exports = { KEY_ID, call };
