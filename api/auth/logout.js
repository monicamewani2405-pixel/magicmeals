/* POST /api/auth/logout -> revokes the Shopify token, clears the cached profile and the cookie. Always succeeds for the visitor. */
'use strict';
const H = require('../_lib/http');
const S = require('../_lib/shopify');
const { readSession, clearSession } = require('../_lib/session');
const { cmd } = require('../_lib/redis');
const { hashKey } = require('../_lib/ratelimit');

module.exports = async (req, res) => {
  if (!H.guard(req, res, 'POST')) return;
  const s = readSession(req);
  clearSession(res);
  if (s) {
    try { await cmd('DEL', 'me:' + hashKey(s.token)); } catch (e) { /* cache clearing is best effort; it expires in 60 s anyway */ }
    try { await S.deleteToken(s.token); } catch (e) { console.error('logout: token revoke failed'); }
  }
  return H.send(res, 200, { ok: true });
};
