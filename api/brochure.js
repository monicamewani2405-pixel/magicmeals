/* =========================================================
   api/brochure.js: Vercel serverless function. POST /api/brochure  { name, email, phone, website }
   The "Download Brochure" form on the site sends the visitor's details here; we email them to the business. The browser then downloads the
   PDF (a public static file, so this is lead capture, not a lock).

   Settings (Vercel > Project > Settings > Environment Variables; see .env.example). Nothing secret is ever written in code or git:
       SMTP_HOST   smtp.gmail.com                 SMTP_USER   the mailbox that sends (magicmeals.shop@gmail.com)
       SMTP_PORT   465                            SMTP_PASS   a Gmail "App Password" (not the normal password)
       MAIL_TO     where the leads go             MAIL_FROM   optional, default: Magic Meals <magicmeals.shop@gmail.com>
   BROCHURE_TEST_MODE=1 sends no real email: the message is printed (and returned) instead. Missing settings answer 503.

   Protections: same-origin POST with JSON only, body under 2 KB, everything validated again here, a hidden honeypot field, CR/LF stripped
   from every value (no header injection) and 5 requests per hour per IP. That counter lives in memory, so it is "best effort": it resets
   when the function instance restarts and is not shared between instances.
   ========================================================= */
'use strict';
const { send, clientIp, guard, body, limited } = require('./_lib/http');

const MAX_BODY = 2048;
const RATE_MAX = 5, RATE_WINDOW_MS = 60 * 60 * 1000;
const hits = new Map();                                   // ip -> timestamps (best effort, per instance)

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;
const clean = v => (typeof v === 'string' ? v.replace(new RegExp('[\r\n\u0000-\u001f\u007f\u2028\u2029]+', 'g'), ' ').replace(/\s{2,}/g, ' ').trim() : '');

// +91, spaces and hyphens allowed; returns the 10 digits or ''
function normPhone(v) {
  let d = String(v || '').replace(/[\s\-().]/g, '');
  if (!/^\+?\d+$/.test(d)) return '';
  d = d.replace(/^\+/, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : '';
}

function validate(b) {
  const errors = {};
  const name = clean(b.name), email = clean(b.email).toLowerCase(), phone = normPhone(clean(b.phone));
  if (name.length < 2 || name.length > 80) errors.name = 'Please enter your name (2 to 80 characters).';
  if (!email || email.length > 120 || !EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address.';
  if (!phone) errors.phone = 'Please enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.';
  return { errors, name, email, phone };
}

// "November 17, 2026" and "7:11 pm", Asia/Kolkata (built from parts: newer ICU puts a no-break space before AM/PM)
function stamp(now) {
  const p = {};
  new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
    .formatToParts(now).forEach(x => { p[x.type] = x.value; });
  return { date: `${p.month} ${p.day}, ${p.year}`, time: `${p.hour}:${p.minute} ${String(p.dayPeriod || '').toLowerCase()}` };
}

function buildMessage(v, now) {
  const t = stamp(now || new Date());
  return {
    from: (process.env.MAIL_FROM || '').trim() || 'Magic Meals <magicmeals.shop@gmail.com>',
    to: (process.env.MAIL_TO || '').trim(),
    replyTo: v.email,
    subject: 'New message from "Magic Meals"',
    text: `Name: ${v.name}\nEmail: ${v.email}\nPhone Number: ${v.phone}\n\n---\n\nDate: ${t.date}\nTime: ${t.time}`
  };
}

function rateLimited(ip) {
  const now = Date.now(), list = (hits.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  if (list.length >= RATE_MAX) { hits.set(ip, list); return Math.ceil((RATE_WINDOW_MS - (now - list[0])) / 1000); }
  list.push(now); hits.set(ip, list);
  if (hits.size > 5000) for (const [k, l] of hits) if (!l.some(t => now - t < RATE_WINDOW_MS)) hits.delete(k);
  return 0;
}

function transport(test) {
  const nodemailer = require('nodemailer');
  if (test) return nodemailer.createTransport({ jsonTransport: true });
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  const port = parseInt(SMTP_PORT, 10) || 465;
  return nodemailer.createTransport({ host: SMTP_HOST, port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } });
}

module.exports = async function handler(req, res) {
  if (!guard(req, res, 'POST')) return;
  const len = parseInt(req.headers['content-length'], 10);
  const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  if ((len && len > MAX_BODY) || Buffer.byteLength(raw) > MAX_BODY) return send(res, 413, { ok: false, error: 'too_large', message: 'That request is too large.' });
  const b = body(req);

  if (clean(b.website)) return send(res, 200, { ok: true });          // honeypot filled: pretend it worked, send nothing

  const v = validate(b);
  if (Object.keys(v.errors).length) return send(res, 400, { ok: false, error: 'invalid', errors: v.errors, message: 'Please check the highlighted fields.' });

  const wait = rateLimited(clientIp(req));
  if (wait) return limited(res, wait);

  const test = process.env.BROCHURE_TEST_MODE === '1';
  const need = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_TO'];
  if (!test && need.some(k => !(process.env[k] || '').trim())) {
    console.error('brochure: missing settings:', need.filter(k => !(process.env[k] || '').trim()).join(', '));   // names only, never values
    return send(res, 503, { ok: false, error: 'unavailable', message: 'This is temporarily unavailable.' });
  }

  try {
    const msg = buildMessage(v);
    if (test && !msg.to) msg.to = 'test@example.com';
    const info = await transport(test).sendMail(msg);
    if (test) { console.log('brochure test mode, message:', info.message); return send(res, 200, { ok: true, test: JSON.parse(info.message) }); }
    return send(res, 200, { ok: true });
  } catch (e) {
    console.error('brochure: send failed:', e && e.code, e && e.responseCode);   // never log credentials or the message
    return send(res, 502, { ok: false, error: 'send_failed', message: 'Something went wrong.' });
  }
};
module.exports._test = { validate, normPhone, buildMessage, stamp };
