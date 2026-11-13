/* POST /api/auth/recover  { email }  -> Shopify emails a reset link. Limit: 3 per hour per IP and 3 per hour per email.
   The answer is the same whether or not the email has an account. */
'use strict';
const H = require('../_lib/http');
const RL = require('../_lib/ratelimit');
const S = require('../_lib/shopify');

const SAME = 'If that email has an account, we have sent a link to reset the password. Check your inbox (and spam).';

module.exports = async (req, res) => {
  if (!H.guard(req, res, 'POST')) return;
  try {
    const ip = await RL.hit('recover-ip', H.clientIp(req), 3, 3600);
    if (!ip.allowed) return H.limited(res, ip.retryAfter);

    const b = H.body(req);
    if (b.website) return H.send(res, 200, { ok: true, message: SAME });                   // honeypot: pretend it worked
    const email = H.cleanEmail(b.email);
    if (!H.validEmail(email)) return H.send(res, 400, { ok: false, error: 'invalid', message: 'Enter a valid email address.' });

    const em = await RL.hit('recover-email', email, 3, 3600);
    if (!em.allowed) return H.limited(res, em.retryAfter);

    try { await S.recover(email); } catch (e) { console.error('recover failed:', e && e.message); }   // never reveal upstream errors
    return H.send(res, 200, { ok: true, message: SAME });
  } catch (e) { return H.unavailable(res, e); }
};
