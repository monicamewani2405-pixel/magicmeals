/* POST /api/auth/login  { email, password, remember? }  -> sets the login cookie.
   Limits: 20 per hour per IP; 5 attempts per 15 min per email, then a 15 min lock that doubles up to 1 h. */
'use strict';
const H = require('../_lib/http');
const RL = require('../_lib/ratelimit');
const S = require('../_lib/shopify');
const { setSession } = require('../_lib/session');

module.exports = async (req, res) => {
  if (!H.guard(req, res, 'POST')) return;
  try {
    const ip = await RL.hit('login-ip', H.clientIp(req), 20, 3600);
    if (!ip.allowed) return H.limited(res, ip.retryAfter);

    const b = H.body(req);
    const email = H.cleanEmail(b.email);
    if (!H.validEmail(email) || typeof b.password !== 'string' || b.password.length < 1 || b.password.length > 200) {
      return H.send(res, 400, { ok: false, error: 'invalid', message: 'Enter your email and password.' });
    }

    const at = await RL.loginAttempt(email);
    if (!at.allowed) return H.limited(res, at.retryAfter);

    const r = await S.createToken(email, b.password);
    if (!r.ok) {
      if (r.reason === 'throttled') return H.limited(res, 60);
      // Same answer for "no such email" and "wrong password": no account enumeration.
      return H.send(res, 401, { ok: false, error: 'bad_credentials', message: 'Incorrect email or password.' });
    }
    await RL.loginSucceeded(email);
    setSession(res, r.token, r.expiresAt, b.remember !== false);
    const me = await S.getCustomer(r.token).catch(() => null);
    return H.send(res, 200, { ok: true, user: me && { firstName: me.firstName, lastName: me.lastName, email: me.email } });
  } catch (e) { return H.unavailable(res, e); }
};
