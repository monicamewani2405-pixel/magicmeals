/* api/_lib/shiprocket.js: optional live shipment status from Shiprocket for fulfilled orders.
   Reuses SHIPROCKET_EMAIL + SHIPROCKET_PASSWORD (same API user as /api/pincode).
   If those env vars are missing or Shiprocket is slow/down, it quietly returns null so /api/auth/me never breaks. */
'use strict';
const { cmd } = require('./redis');

const BASE = 'https://apiv2.shiprocket.in/v1/external';
const TOKEN_KEY = 'shiprocket:token';
const TOKEN_TTL = 8 * 24 * 3600;       // Shiprocket tokens last 10 days; renew at 8
const TRACK_TTL = 300;                 // cache each AWB's live status for 5 min
const TIMEOUT_MS = 3500;

function configured() {
  return !!(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD);
}

async function fetchJson(url, opts) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(url, Object.assign({}, opts, { signal: ctl.signal }));
    let j = null;
    try { j = await r.json(); } catch (e) { /* not JSON */ }
    return { status: r.status, ok: r.ok, json: j };
  } finally { clearTimeout(t); }
}

async function getToken(forceRefresh) {
  if (!forceRefresh) {
    try {
      const cached = await cmd('GET', TOKEN_KEY);
      if (cached) return cached;
    } catch (e) { /* Redis optional here */ }
  }
  const r = await fetchJson(BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: process.env.SHIPROCKET_EMAIL, password: process.env.SHIPROCKET_PASSWORD })
  });
  const tok = r.ok && r.json && r.json.token ? String(r.json.token) : '';
  if (!tok) return '';
  try { await cmd('SET', TOKEN_KEY, tok, 'EX', TOKEN_TTL); } catch (e) { /* optional */ }
  return tok;
}

async function trackAwb(awb) {
  if (!configured() || !awb) return null;
  const clean = String(awb).trim();
  if (!clean) return null;

  const cacheKey = 'shiprocket:track:' + clean;
  try {
    const hit = await cmd('GET', cacheKey);
    if (hit) return JSON.parse(hit);
  } catch (e) { /* ignore cache errors */ }

  try {
    let tok = await getToken(false);
    if (!tok) return null;
    let r = await fetchJson(BASE + '/courier/track/awb/' + encodeURIComponent(clean), {
      headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' }
    });
    if (r.status === 401) {
      tok = await getToken(true);
      if (!tok) return null;
      r = await fetchJson(BASE + '/courier/track/awb/' + encodeURIComponent(clean), {
        headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' }
      });
    }
    const td = r.ok && r.json && r.json.tracking_data;
    const row = td && Array.isArray(td.shipment_track) ? td.shipment_track[0] : null;
    if (!row || !row.current_status) return null;
    const out = {
      status: String(row.current_status).trim(),
      edd: row.edd ? String(row.edd).trim() : '',
      deliveredDate: row.delivered_date ? String(row.delivered_date).trim() : '',
      trackUrl: /^https:\/\//.test(td.track_url || '') ? td.track_url : ''
    };
    try { await cmd('SET', cacheKey, JSON.stringify(out), 'EX', TRACK_TTL); } catch (e) { /* optional */ }
    return out;
  } catch (e) {
    return null;
  }
}

async function enrichOrders(orders) {
  if (!configured() || !Array.isArray(orders) || !orders.length) return orders;
  const targets = orders.filter(o => Array.isArray(o.tracking) && o.tracking[0] && o.tracking[0].number).slice(0, 5);
  if (!targets.length) return orders;
  const results = await Promise.all(targets.map(o => trackAwb(o.tracking[0].number)));
  targets.forEach((o, i) => {
    const res = results[i];
    if (!res) return;
    o.liveStatus = res.status;
    if (res.edd) o.edd = res.edd;
    if (res.deliveredDate) o.deliveredDate = res.deliveredDate;
    if (res.trackUrl && !o.tracking[0].url) o.tracking[0].url = res.trackUrl;
  });
  return orders;
}

module.exports = { trackAwb, enrichOrders };

