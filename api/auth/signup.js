/* POST /api/auth/signup  { name, email, phone?, password, website(honeypot) }  -> creates the Shopify customer, logs in, sets the cookie.
   Limit: 3 per hour per IP (invalid and bot requests count too). */
'use strict';
const H = require('../_lib/http');
const RL = require('../_lib/ratelimit');
const S = require('../_lib/shopify');
const { setSession } = require('../_lib/session');

module.exports = async (req, res) => {
  if (!H.guard(req, res, 'POST')) return;
  try {
    const ip = await RL.hit('signup-ip', H.clientIp(req), 3, 3600);
    if (!ip.allowed) return H.limited(res, ip.retryAfter);

    const b = H.body(req);
    if (b.website) return H.send(res, 400, { ok: false, error: 'invalid', message: 'Could not create the account.' });   // honeypot filled: a bot
    const email = H.cleanEmail(b.email);
    const name = H.cleanName(b.name, 80);
    const phone = typeof b.phone === 'string' ? b.phone.replace(/[\s-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, '') : '';
    if (!name) return H.send(res, 400, { ok: false, error: 'invalid', field: 'name', message: 'Enter your name.' });
    if (!H.validEmail(email)) return H.send(res, 400, { ok: false, error: 'invalid', field: 'email', message: 'Enter a valid email address.' });
    if (phone && !/^[6-9]\d{9}$/.test(phone)) return H.send(res, 400, { ok: false, error: 'invalid', field: 'phone', message: 'Enter a 10-digit mobile number.' });
    if (!H.validPassword(b.password)) return H.send(res, 400, { ok: false, error: 'invalid', field: 'password', message: 'Password must be 8 to 40 characters.' });

    const sp = name.indexOf(' ');
    const input = { email, password: b.password, firstName: sp > 0 ? name.slice(0, sp) : name, lastName: sp > 0 ? name.slice(sp + 1).trim() : '' };
    if (phone) input.phone = '+91' + phone;
    let c = await S.createCustomer(input);
    if (!c.ok && c.reason === 'invalid' && input.phone && c.fields.includes('phone')) {   // phone already used elsewhere: keep the account, drop the phone
      delete input.phone;
      c = await S.createCustomer(input);
    }
    if (!c.ok) {
      if (c.reason === 'throttled') return H.limited(res, 60);
      if (c.reason === 'taken') return H.send(res, 409, { ok: false, error: 'exists', message: 'We could not create that account. If you already have one, sign in or use “Forgot password”.' });
      return H.send(res, 400, { ok: false, error: 'invalid', message: 'Please check your details and try again.' });
    }
    const t = await S.createToken(email, b.password);
    if (!t.ok) return H.send(res, 200, { ok: true, user: null, message: 'Account created. Please sign in.' });
    setSession(res, t.token, t.expiresAt, true);
    return H.send(res, 200, { ok: true, user: { firstName: input.firstName, lastName: input.lastName, email } });
  } catch (e) { return H.unavailable(res, e); }
};
