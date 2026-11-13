/* api/_lib/ratelimit.js: fixed-window counters and the login-failure lockout, stored in Redis.
   If Redis is down or not configured these THROW, and the endpoints answer 503. Login stays closed rather than unprotected. */
'use strict';
const crypto = require('crypto');
const { pipeline, cmd } = require('./redis');

const FAIL_LIMIT = 5, FAIL_WINDOW = 15 * 60;          // 5 attempts per 15 minutes per email
const LOCK_BASE = 15 * 60, LOCK_MAX = 60 * 60;        // lock 15 min, doubling on repeats, capped at 1 h
const STRIKE_TTL = 24 * 3600;                         // repeat offenders are remembered for a day

// Keyed hash so Redis never holds a readable email or IP.
function hashKey(value) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('missing_session_secret');
  return crypto.createHmac('sha256', secret).update(String(value).toLowerCase()).digest('hex').slice(0, 32);
}

// Counts one attempt. -> { allowed, retryAfter (seconds, only when blocked) }
async function hit(name, id, limit, windowSec) {
  const key = 'rl:' + name + ':' + hashKey(id);
  const [count, , ttl] = await pipeline([['INCR', key], ['EXPIRE', key, windowSec, 'NX'], ['TTL', key]]);
  if (count > limit) return { allowed: false, retryAfter: ttl > 0 ? ttl : windowSec };
  return { allowed: true };
}

// Counts a login attempt for this email BEFORE asking Shopify (so parallel guesses cannot slip past the limit).
// The 6th attempt in a window starts a lock: 15 min, then 30, then 60 (strikes are remembered for 24 h).
async function loginAttempt(email) {
  const h = hashKey(email);
  const lockKey = 'lock:' + h, failKey = 'fails:' + h, strikeKey = 'strikes:' + h;
  const [lockTtl] = await pipeline([['TTL', lockKey]]);
  if (lockTtl > 0) return { allowed: false, retryAfter: lockTtl };
  const [count] = await pipeline([['INCR', failKey], ['EXPIRE', failKey, FAIL_WINDOW, 'NX']]);
  if (count <= FAIL_LIMIT) return { allowed: true };
  const [strikes] = await pipeline([['INCR', strikeKey], ['EXPIRE', strikeKey, STRIKE_TTL]]);
  const lockSec = Math.min(LOCK_BASE * Math.pow(2, Math.max(0, strikes - 1)), LOCK_MAX);
  await pipeline([['SET', lockKey, '1', 'EX', lockSec], ['DEL', failKey]]);
  return { allowed: false, retryAfter: lockSec };
}

// A correct password clears that email's attempt counter.
const loginSucceeded = email => cmd('DEL', 'fails:' + hashKey(email));

function waitText(retryAfter) {
  const s = Math.max(1, Math.ceil(retryAfter));
  if (s < 60) return s + (s === 1 ? ' second' : ' seconds');
  const m = Math.ceil(s / 60);
  return m + (m === 1 ? ' minute' : ' minutes');
}

module.exports = { hit, loginAttempt, loginSucceeded, hashKey, waitText };
