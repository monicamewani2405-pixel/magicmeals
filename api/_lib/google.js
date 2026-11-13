/* api/_lib/google.js: verifies a Google Sign-In ID token locally (RS256 signature against Google's public keys, issuer,
   audience = our Client ID, expiry, verified email). No npm package. Env: GOOGLE_CLIENT_ID, GOOGLE_LOGIN_SECRET. */
'use strict';
const crypto = require('crypto');

let keys = null, keysAt = 0;
async function googleKeys(force) {
  if (!force && keys && Date.now() - keysAt < 3600 * 1000) return keys;
  const r = await fetch('https://www.googleapis.com/oauth2/v3/certs');
  if (!r.ok) throw new Error('google_keys_' + r.status);
  keys = (await r.json()).keys || [];
  keysAt = Date.now();
  return keys;
}

const part = s => Buffer.from(s, 'base64url');

// -> payload { sub, email, given_name, family_name, name } or throws Error('bad_google_token')
async function verifyIdToken(idToken, clientId) {
  const bad = () => new Error('bad_google_token');
  if (!clientId || typeof idToken !== 'string' || idToken.length > 4096) throw bad();
  const p = idToken.split('.');
  if (p.length !== 3) throw bad();
  let header, payload;
  try { header = JSON.parse(part(p[0]).toString('utf8')); payload = JSON.parse(part(p[1]).toString('utf8')); } catch (e) { throw bad(); }
  if (header.alg !== 'RS256' || !header.kid) throw bad();
  let jwk = (await googleKeys(false)).find(k => k.kid === header.kid);
  if (!jwk) jwk = (await googleKeys(true)).find(k => k.kid === header.kid);       // Google rotated its keys
  if (!jwk) throw bad();
  const ok = crypto.verify('RSA-SHA256', Buffer.from(p[0] + '.' + p[1]), crypto.createPublicKey({ key: jwk, format: 'jwk' }), part(p[2]));
  if (!ok) throw bad();
  if (payload.iss !== 'accounts.google.com' && payload.iss !== 'https://accounts.google.com') throw bad();
  if (payload.aud !== clientId) throw bad();
  if (!payload.exp || payload.exp * 1000 < Date.now()) throw bad();
  if (!(payload.email_verified === true || payload.email_verified === 'true')) throw bad();     // unverified email: rejected
  if (!payload.sub || !payload.email) throw bad();
  return payload;
}

// The hidden Shopify password for a Google user. Shopify allows at most 40 characters.
function derivedPassword(sub) {
  const s = process.env.GOOGLE_LOGIN_SECRET;
  if (!s || s.length < 32) throw new Error('missing_google_secret');
  return crypto.createHmac('sha256', s).update('google:' + sub).digest('hex').slice(0, 40);
}

module.exports = { verifyIdToken, derivedPassword };
