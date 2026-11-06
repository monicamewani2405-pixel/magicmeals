/* =========================================================
   api/pincode.js: Vercel serverless function. GET /api/pincode?pin=500001
   Asks Shiprocket which couriers (Delhivery, Blue Dart, ...) can deliver from our pickup PIN to the visitor's PIN, and how fast.
   Returns only what the page needs:  { ok, serviceable, minDays, maxDays, etd }   or   { ok:false, error }.
   The Shiprocket login never reaches the browser. Set these in Vercel > Project > Settings > Environment Variables:
       SHIPROCKET_EMAIL      the email of a Shiprocket "API user" (Settings > API > Configure > Create API User; not your main login)
       SHIPROCKET_PASSWORD   that API user's password
       PICKUP_PINCODE        optional, default 400080 (Mulund West, Mumbai)
   If anything is missing or Shiprocket does not answer, the page falls back to the zone estimate in pincode.js.
   Setup steps: shiprocket-pincode.md
   ========================================================= */
'use strict';

const BASE = 'https://apiv2.shiprocket.in/v1/external';
const TOKEN_TTL_MS = 8 * 24 * 3600 * 1000;           // Shiprocket tokens last 10 days; renew a little earlier
const RESULT_TTL_MS = 6 * 3600 * 1000;               // same PIN asked again within 6 h: no second call to Shiprocket
const MAX_UPSTREAM_PER_MIN = 60;                     // per warm instance: a cheap guard against someone enumerating PIN codes

let token = null, tokenAt = 0;
const results = new Map();                           // pin -> { at, body }
let windowStart = 0, windowCount = 0;

async function login() {
  const r = await fetch(BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: process.env.SHIPROCKET_EMAIL, password: process.env.SHIPROCKET_PASSWORD })
  });
  if (!r.ok) throw new Error('login ' + r.status);
  const j = await r.json();
  if (!j.token) throw new Error('login: no token');
  token = j.token;
  tokenAt = Date.now();
}

async function serviceability(pin, retry) {
  if (!token || Date.now() - tokenAt > TOKEN_TTL_MS) await login();
  const pickup = (process.env.PICKUP_PINCODE || '400080').trim();
  const url = BASE + '/courier/serviceability/?pickup_postcode=' + pickup + '&delivery_postcode=' + pin + '&weight=0.5&cod=0';
  const r = await fetch(url, { headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' } });
  if (r.status === 401 && !retry) {                  // token expired early: log in once more
    token = null;
    return serviceability(pin, true);
  }
  let j = null;
  try { j = await r.json(); } catch (e) { /* not JSON */ }
  return { status: r.status, json: j };
}

// -> { serviceable, minDays, maxDays, etd } from Shiprocket's list of couriers
function summarise(j) {
  const list = j && j.data && Array.isArray(j.data.available_courier_companies) ? j.data.available_courier_companies : [];
  const days = list.map(c => ({ d: parseInt(String(c.estimated_delivery_days).match(/\d+/), 10), etd: c.etd })).filter(x => Number.isFinite(x.d));
  if (!days.length) return { serviceable: false };
  days.sort((a, b) => a.d - b.d);
  // the fastest courier sets the low end; the high end is the 3rd fastest (so one slow outlier does not scare the customer)
  const minDays = days[0].d;
  const maxDays = Math.max(minDays, days[Math.min(2, days.length - 1)].d);
  return { serviceable: true, minDays, maxDays, etd: days[0].etd || null };
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  const pin = String((req.query && req.query.pin) || '').trim();
  if (!/^[1-9]\d{5}$/.test(pin)) { res.setHeader('Cache-Control', 'no-store'); return res.status(400).end(JSON.stringify({ ok: false, error: 'invalid_pin' })); }
  if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).end(JSON.stringify({ ok: false, error: 'not_configured' }));
  }
  const hit = results.get(pin);
  if (hit && Date.now() - hit.at < RESULT_TTL_MS) {
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');
    return res.status(200).end(JSON.stringify(hit.body));
  }
  const now = Date.now();
  if (now - windowStart > 60000) { windowStart = now; windowCount = 0; }
  if (++windowCount > MAX_UPSTREAM_PER_MIN) { res.setHeader('Cache-Control', 'no-store'); return res.status(429).end(JSON.stringify({ ok: false, error: 'busy' })); }
  try {
    const { status, json } = await serviceability(pin, false);
    let body;
    if (status === 200 && json && json.data) body = Object.assign({ ok: true }, summarise(json));
    else if (status === 404 || status === 422) body = { ok: true, serviceable: false };      // Shiprocket: no courier serves this PIN
    else throw new Error('serviceability ' + status);
    results.set(pin, { at: Date.now(), body });
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');
    return res.status(200).end(JSON.stringify(body));
  } catch (e) {
    console.error('pincode api:', e && e.message);                                            // never log the credentials
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).end(JSON.stringify({ ok: false, error: 'upstream' }));
  }
};

module.exports.summarise = summarise;      // for tests
