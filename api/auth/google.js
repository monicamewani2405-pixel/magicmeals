/* POST /api/auth/google  { credential }  -> verifies the Google ID token, finds or creates the Shopify customer, sets the cookie.
   Google users get a hidden Shopify password = HMAC(GOOGLE_LOGIN_SECRET, google sub). Limit: 20 per hour per IP.
   An email that already has a normal (password) account is NOT linked automatically: the person signs in with that password. */
'use strict';
const H = require('../_lib/http');
const RL = require('../_lib/ratelimit');
const S = require('../_lib/shopify');
const G = require('../_lib/google');
const { setSession } = require('../_lib/session');

module.exports = async (req, res) => {
  if (!H.guard(req, res, 'POST')) return;
  try {
    const ip = await RL.hit('google-ip', H.clientIp(req), 20, 3600);
    if (!ip.allowed) return H.limited(res, ip.retryAfter);
    if (!process.env.GOOGLE_CLIENT_ID) return H.send(res, 503, { ok: false, error: 'not_configured', message: 'Google sign-in is not available yet.' });

    let p;
    try { p = await G.verifyIdToken(H.body(req).credential, process.env.GOOGLE_CLIENT_ID); }
    catch (e) {
      if (e.message !== 'bad_google_token') throw e;
      return H.send(res, 401, { ok: false, error: 'bad_google_token', message: 'Google sign-in could not be verified. Please try again.' });
    }
    const email = H.cleanEmail(p.email), pw = G.derivedPassword(p.sub);

    let t = await S.createToken(email, pw);
    if (!t.ok) {
      const first = H.cleanName(p.given_name || (p.name || '').split(' ')[0] || '', 60);
      const last = H.cleanName(p.family_name || (p.name || '').split(' ').slice(1).join(' ') || '', 60);
      const c = await S.createCustomer({ email, password: pw, firstName: first, lastName: last });
      if (!c.ok && c.reason === 'taken') {
        return H.send(res, 409, { ok: false, error: 'exists', message: 'This email already has a Magic Meals account. Please sign in with your password (or use “Forgot password”).' });
      }
      if (!c.ok && c.reason === 'disabled') {
        return H.send(res, 409, { ok: false, error: 'not_activated', message: 'This email already has a Magic Meals customer record that is not activated yet. We have emailed you an activation link: open it, choose a password, then sign in here.' });
      }
      if (!c.ok) return H.send(res, 502, { ok: false, error: 'upstream', message: 'Could not sign you in with Google. Please try again.' });
      t = await S.createToken(email, pw);
      if (!t.ok) return H.send(res, 502, { ok: false, error: 'upstream', message: 'Could not sign you in with Google. Please try again.' });
    }
    setSession(res, t.token, t.expiresAt, true);
    const me = await S.getCustomer(t.token).catch(() => null);
    return H.send(res, 200, { ok: true, user: me && { firstName: me.firstName, lastName: me.lastName, email: me.email } });
  } catch (e) { return H.unavailable(res, e); }
};
