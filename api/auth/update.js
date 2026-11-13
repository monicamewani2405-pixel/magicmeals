/* POST /api/auth/update  { name, phone }  -> changes the signed-in customer's name and mobile number. The email can NOT be changed.
   Both fields are required (never saved empty). Limit: 10 saves per hour per customer. */
'use strict';
const H = require('../_lib/http');
const RL = require('../_lib/ratelimit');
const S = require('../_lib/shopify');
const { readSession, clearSession } = require('../_lib/session');
const { cmd } = require('../_lib/redis');

const cleanPhone = v => (typeof v === 'string' ? v.replace(/[\s-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, '') : '');

module.exports = async (req, res) => {
  if (!H.guard(req, res, 'POST')) return;
  let s;
  try { s = readSession(req); } catch (e) { return H.unavailable(res, e); }
  if (!s) return H.send(res, 401, { ok: false, error: 'signed_out', message: 'Please sign in again.' });
  try {
    const lim = await RL.hit('update', s.token, 10, 3600);
    if (!lim.allowed) return H.limited(res, lim.retryAfter);

    const b = H.body(req);
    const name = H.cleanName(b.name, 80).replace(/\s+/g, ' ');
    const phone = cleanPhone(b.phone);
    if (!name) return H.send(res, 400, { ok: false, error: 'invalid', field: 'name', message: 'Enter your full name.' });
    if (!/^[6-9]\d{9}$/.test(phone)) return H.send(res, 400, { ok: false, error: 'invalid', field: 'phone', message: 'Enter a 10-digit mobile number.' });

    const sp = name.indexOf(' ');
    const r = await S.updateCustomer(s.token, { firstName: sp > 0 ? name.slice(0, sp) : name, lastName: sp > 0 ? name.slice(sp + 1).trim() : '', phone: '+91' + phone });
    if (!r.ok) {
      if (r.reason === 'signed_out') { clearSession(res); return H.send(res, 401, { ok: false, error: 'signed_out', message: 'Your session has ended. Please sign in again.' }); }
      if (r.reason === 'throttled') return H.limited(res, 60);
      if (r.reason === 'phone') return H.send(res, 409, { ok: false, error: 'phone', field: 'phone', message: 'That mobile number is already linked to another account. Please use a different number.' });
      return H.send(res, 400, { ok: false, error: 'invalid', message: 'Please check your details and try again.' });
    }
    try { await cmd('DEL', 'me:' + RL.hashKey(s.token)); } catch (e) { /* the cache expires in 60 s anyway */ }
    const user = await S.getCustomer(s.token);
    return H.send(res, 200, { ok: true, user });
  } catch (e) { return H.unavailable(res, e); }
};
