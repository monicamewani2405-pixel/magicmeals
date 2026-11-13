/* api/_lib/session.js: the login cookie.
   The Shopify customer access token is encrypted (AES-256-GCM, key from SESSION_SECRET) and stored in an
   HttpOnly + Secure + SameSite=Lax cookie, so page JavaScript can never read it and it cannot be forged or edited.
   A second, harmless cookie (mm_in=1, readable by the page) only tells the page whether it is worth asking /api/auth/me. */
'use strict';
const crypto = require('crypto');

const NAME = '__Host-mm_session';
const HINT = 'mm_in';
const MAX_AGE = 7 * 24 * 3600;                         // 7 days

function key() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('missing_session_secret');
  return crypto.createHash('sha256').update(s).digest();
}

function seal(obj) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([c.update(JSON.stringify(obj), 'utf8'), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), enc]).toString('base64url');
}

function open(str) {
  try {
    const b = Buffer.from(String(str), 'base64url');
    if (b.length < 29) return null;
    const d = crypto.createDecipheriv('aes-256-gcm', key(), b.subarray(0, 12));
    d.setAuthTag(b.subarray(12, 28));
    return JSON.parse(Buffer.concat([d.update(b.subarray(28)), d.final()]).toString('utf8'));
  } catch (e) { return null; }                          // tampered, wrong key or garbage: treat as logged out
}

function parseCookies(req) {
  const out = {};
  String(req.headers.cookie || '').split(';').forEach(p => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = p.slice(i + 1).trim();
  });
  return out;
}

// -> { token } or null
function readSession(req) {
  const raw = parseCookies(req)[NAME];
  if (!raw) return null;
  const s = open(raw);
  if (!s || !s.t || !s.e || s.e < Date.now()) return null;
  return { token: s.t };
}

// remember=false gives a browser-session cookie (gone when the browser closes).
function setSession(res, token, expiresAtIso, remember) {
  const shopifyExp = Date.parse(expiresAtIso) || Date.now() + MAX_AGE * 1000;
  const exp = Math.min(shopifyExp, Date.now() + MAX_AGE * 1000);
  const age = Math.max(60, Math.floor((exp - Date.now()) / 1000));
  const life = remember === false ? '' : '; Max-Age=' + age;
  const base = '; Path=/; Secure; SameSite=Lax' + life;
  res.setHeader('Set-Cookie', [
    NAME + '=' + seal({ t: token, e: exp }) + base + '; HttpOnly',
    HINT + '=1' + base
  ]);
}

function clearSession(res) {
  const dead = '; Path=/; Secure; SameSite=Lax; Max-Age=0';
  res.setHeader('Set-Cookie', [NAME + '=' + dead + '; HttpOnly', HINT + '=' + dead]);
}

module.exports = { readSession, setSession, clearSession, seal, open };
