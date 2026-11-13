/* POST /api/auth/signup  { name, email, phone (required), password, website(honeypot) }  -> creates the Shopify customer, logs in, sets the cookie.
   Limits per IP: 5 valid signups per hour (the ones that would reach Shopify), plus a loose cap of 30 requests per hour of any kind
   so floods of junk are still stopped. Mistyped forms do NOT use up the 5. */
'use strict';
const H = require('../_lib/http');
const RL = require('../_lib/ratelimit');
const S = require('../_lib/shopify');
const { setSession } = require('../_lib/session');

module.exports = async (req, res) => {
  if (!H.guard(req, res, 'POST')) return;
  try {
    const ip = H.clientIp(req);
    const flood = await RL.hit('signup-all', ip, 30, 3600);
    if (!flood.allowed) return H.limited(res, flood.retryAfter);

    const b = H.body(req);
    if (b.website) return H.send(res, 400, { ok: false, error: 'invalid', message: 'Could not create the account.' });   // honeypot filled: a bot
    const email = H.cleanEmail(b.email);
    const name = H.cleanName(b.name, 80);
    const phone = typeof b.phone === 'string' ? b.phone.replace(/[\s-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, '') : '';
    if (!name) return H.send(res, 400, { ok: false, error: 'invalid', field: 'name', message: 'Enter your name.' });
    if (!H.validEmail(email)) return H.send(res, 400, { ok: false, error: 'invalid', field: 'email', message: 'Enter a valid email address.' });
    if (!/^[6-9]\d{9}$/.test(phone)) return H.send(res, 400, { ok: false, error: 'invalid', field: 'phone', message: 'Enter a 10-digit mobile number.' });
    if (!H.validPassword(b.password)) return H.send(res, 400, { ok: false, error: 'invalid', field: 'password', message: 'Password must be 8 to 40 characters.' });

    const real = await RL.hit('signup-valid', ip, 5, 3600);        // only well-formed requests count here
    if (!real.allowed) return H.limited(res, real.retryAfter);

    const sp = name.indexOf(' ');
    const input = { email, password: b.password, firstName: sp > 0 ? name.slice(0, sp) : name, lastName: sp > 0 ? name.slice(sp + 1).trim() : '', phone: '+91' + phone };
    const c = await S.createCustomer(input);
    if (!c.ok) {
      if (c.reason === 'throttled') return H.limited(res, 60);
      if (c.reason === 'disabled') return H.send(res, 409, { ok: false, error: 'not_activated', codes: c.codes, message: 'This email already has a Magic Meals customer record that is not activated yet. We have emailed you an activation link: open it, choose a password, then sign in here.' });
      if (c.reason === 'taken') return H.send(res, 409, { ok: false, error: 'exists', message: 'We could not create that account. If you already have one, sign in or use “Forgot password”.' });
      if (c.fields.includes('phone')) return H.send(res, 409, { ok: false, error: 'phone', field: 'phone', message: 'That mobile number is already linked to another account. Please use a different number.' });
      return H.send(res, 400, { ok: false, error: 'invalid', codes: c.codes, message: 'Please check your details and try again.' });
    }
    const t = await S.createToken(email, b.password);
    if (!t.ok) return H.send(res, 200, { ok: true, user: null, message: 'Account created. Please sign in.' });
    setSession(res, t.token, t.expiresAt, true);
    return H.send(res, 200, { ok: true, user: { firstName: input.firstName, lastName: input.lastName, email } });
  } catch (e) { return H.unavailable(res, e); }
};
