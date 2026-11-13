/* GET /api/auth/me -> { ok, user: { firstName, lastName, email, phone, addresses[], orders[] } } for the cookie's customer.
   The Shopify answer is cached in Redis for 60 s per customer (cleared on logout). Never cached by the CDN. */
'use strict';
const H = require('../_lib/http');
const S = require('../_lib/shopify');
const SR = require('../_lib/shiprocket');
const { readSession, clearSession } = require('../_lib/session');
const { cmd } = require('../_lib/redis');
const { hashKey } = require('../_lib/ratelimit');

module.exports = async (req, res) => {
  if (!H.guard(req, res, 'GET')) return;
  let s;
  try { s = readSession(req); } catch (e) { return H.unavailable(res, e); }
  if (!s) return H.send(res, 401, { ok: false, error: 'signed_out' });

  const cacheKey = 'me:' + hashKey(s.token);
  try {
    const hit = await cmd('GET', cacheKey);
    if (hit) return H.send(res, 200, { ok: true, user: JSON.parse(hit) });
  } catch (e) { /* no cache: fall through to Shopify */ }

  try {
    const user = await S.getCustomer(s.token);
    if (!user) { clearSession(res); return H.send(res, 401, { ok: false, error: 'signed_out' }); }   // token expired or revoked
    try { await SR.enrichOrders(user.orders); } catch (e) { /* live tracking is optional */ }
    try { await cmd('SET', cacheKey, JSON.stringify(user), 'EX', 60); } catch (e) { /* cache is optional */ }
    return H.send(res, 200, { ok: true, user });
  } catch (e) {
    console.error('me failed:', e && e.message);
    return H.send(res, 502, { ok: false, error: 'upstream', message: 'Could not load your account right now.' });
  }
};
