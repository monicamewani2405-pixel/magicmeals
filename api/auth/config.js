/* GET /api/auth/config -> { googleClientId }. The Client ID is public by design; it lives in an env var so there is one place to change it.
   Null means Google sign-in is not set up yet and the page hides the button. */
'use strict';
const H = require('../_lib/http');

module.exports = (req, res) => {
  if (!H.guard(req, res, 'GET')) return;
  H.send(res, 200, { ok: true, googleClientId: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_LOGIN_SECRET ? process.env.GOOGLE_CLIENT_ID : null });
};
