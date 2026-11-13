/* api/_lib/http.js: request guard and response helpers shared by every /api/auth/* endpoint. */
'use strict';
const { waitText } = require('./ratelimit');

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');          // auth responses are never cached, by the CDN or the browser
  res.end(JSON.stringify(body));
}

// Real client IP. On Vercel the x-vercel-* / x-real-ip headers are set by the platform and cannot be spoofed by the caller.
function clientIp(req) {
  const h = req.headers;
  const v = h['x-vercel-forwarded-for'] || h['x-real-ip'] || String(h['x-forwarded-for'] || '').split(',')[0];
  return String(v || 'unknown').trim();
}

// Method + same-origin check. Returns true if the request may continue; otherwise it has already answered.
function guard(req, res, method) {
  if (req.method !== method) { res.setHeader('Allow', method); send(res, 405, { ok: false, error: 'method' }); return false; }
  if (method === 'POST') {
    const origin = req.headers.origin;
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    let sameOrigin = true;
    if (origin) { try { sameOrigin = new URL(origin).host === host; } catch (e) { sameOrigin = false; } }
    if (!sameOrigin || req.headers['sec-fetch-site'] === 'cross-site') { send(res, 403, { ok: false, error: 'origin' }); return false; }
    if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) { send(res, 415, { ok: false, error: 'content_type' }); return false; }
  }
  return true;
}

function body(req) {
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = null; } }
  return b && typeof b === 'object' ? b : {};
}

function limited(res, retryAfter) {
  res.setHeader('Retry-After', String(Math.ceil(retryAfter)));
  send(res, 429, { ok: false, error: 'rate_limited', retryAfter: Math.ceil(retryAfter), message: 'Too many attempts. Try again in ' + waitText(retryAfter) + '.' });
}

// Redis down / env missing: log the reason only (never credentials) and refuse, so protection is never silently off.
// `reason` is a fixed code (which setting or service failed), never a value or secret, so a broken setup can be diagnosed.
const REASON_OK = /^(missing_session_secret|missing_google_secret|redis_not_configured|redis_http_\d{3}|redis_cmd:[A-Za-z0-9 _-]{0,40}|shopify_not_configured|shopify_http_\d{3}|shopify_graphql)$/;
function reasonOf(e) {
  const m = (e && e.message) || '';
  if (REASON_OK.test(m)) return m;
  if (e && e.name === 'AbortError') return 'timeout';
  return 'unknown_' + String((e && e.name) || 'Error').replace(/[^A-Za-z]/g, '').slice(0, 20);
}
function unavailable(res, e) {
  console.error('auth unavailable:', e && e.message);
  send(res, 503, { ok: false, error: 'unavailable', reason: reasonOf(e), message: 'Sign-in is temporarily unavailable. Please try again in a few minutes.' });
}

const cleanEmail = v => (typeof v === 'string' ? v.trim().toLowerCase() : '');
const validEmail = e => e.length <= 254 && EMAIL_RE.test(e);
const validPassword = p => typeof p === 'string' && p.length >= 8 && p.length <= 40;   // Shopify accepts 5 to 40 characters
const cleanName = (v, max) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, max || 60) : '');

module.exports = { send, clientIp, guard, body, limited, unavailable, cleanEmail, validEmail, validPassword, cleanName };
