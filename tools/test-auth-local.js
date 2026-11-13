/* tools/test-auth-local.js: runs the real /api/auth handlers against an in-memory fake Redis and a fake Shopify/Google.
   No network, no credentials, creates nothing real:   node tools/test-auth-local.js
   (The live check against a deployed site is tools/test-auth-live.js.) */
'use strict';
const crypto = require('crypto');
const path = require('path');

process.env.SESSION_SECRET = crypto.randomBytes(32).toString('hex');
process.env.GOOGLE_LOGIN_SECRET = crypto.randomBytes(32).toString('hex');
process.env.GOOGLE_CLIENT_ID = 'test-client.apps.googleusercontent.com';
process.env.SHOPIFY_STORE_DOMAIN = 'fake.myshopify.com';
process.env.SHOPIFY_STOREFRONT_TOKEN = 'fake';
process.env.KV_REST_API_URL = 'https://fake-redis.local';
process.env.KV_REST_API_TOKEN = 'fake';

// ---------- fake Redis (own clock so lockouts can be fast-forwarded) ----------
let clock = 1_000_000;                                   // seconds
const store = new Map();                                 // key -> { v, exp }
const live = k => { const e = store.get(k); if (e && e.exp && e.exp <= clock) { store.delete(k); return null; } return e || null; };
function redisCmd([c, k, ...a]) {
  c = c.toUpperCase();
  if (c === 'INCR') { const e = live(k); const v = (e ? +e.v : 0) + 1; store.set(k, { v, exp: e ? e.exp : 0 }); return v; }
  if (c === 'EXPIRE') { const e = live(k); if (!e) return 0; if (a[1] === 'NX' && e.exp) return 0; e.exp = clock + +a[0]; return 1; }
  if (c === 'TTL') { const e = live(k); return !e ? -2 : e.exp ? e.exp - clock : -1; }
  if (c === 'GET') { const e = live(k); return e ? String(e.v) : null; }
  if (c === 'SET') { const ex = a.indexOf('EX'); store.set(k, { v: a[0], exp: ex >= 0 ? clock + +a[ex + 1] : 0 }); return 'OK'; }
  if (c === 'DEL') return store.delete(k) ? 1 : 0;
  throw new Error('fake redis: ' + c);
}

// ---------- fake Shopify + Google ----------
const customers = new Map();                             // email -> { password, firstName, lastName, phone }
const tokens = new Map();                                // token -> email
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = Object.assign(publicKey.export({ format: 'jwk' }), { kid: 'k1', alg: 'RS256', use: 'sig' });

function shopify(query, v) {
  if (query.includes('customerAccessTokenCreate')) {
    const c = customers.get(v.i.email);
    if (!c || c.password !== v.i.password) return { customerAccessTokenCreate: { customerAccessToken: null, customerUserErrors: [{ code: 'UNIDENTIFIED_CUSTOMER' }] } };
    const t = 'tok_' + crypto.randomBytes(8).toString('hex'); tokens.set(t, v.i.email);
    return { customerAccessTokenCreate: { customerAccessToken: { accessToken: t, expiresAt: new Date(Date.now() + 14 * 864e5).toISOString() }, customerUserErrors: [] } };
  }
  if (query.includes('customerCreate')) {
    if (v.i.email === 'guest@example.com') return { customerCreate: { customer: null, customerUserErrors: [{ code: 'CUSTOMER_DISABLED', field: null }] } };
    if (customers.has(v.i.email)) return { customerCreate: { customer: null, customerUserErrors: [{ code: 'TAKEN', field: ['input', 'email'] }] } };
    customers.set(v.i.email, { password: v.i.password, firstName: v.i.firstName, lastName: v.i.lastName, phone: v.i.phone });
    return { customerCreate: { customer: { id: 'gid://1' }, customerUserErrors: [] } };
  }
  if (query.includes('customerRecover')) return { customerRecover: { customerUserErrors: [] } };
  if (query.includes('customerAccessTokenDelete')) { tokens.delete(v.t); return { customerAccessTokenDelete: { deletedAccessToken: v.t } }; }
  if (query.includes('customer(customerAccessToken')) {
    const c = customers.get(tokens.get(v.t));
    if (!c) return { customer: null };
    return { customer: { firstName: c.firstName, lastName: c.lastName, email: tokens.get(v.t), phone: c.phone || null, defaultAddress: null,
      addresses: { edges: [] }, orders: { edges: [{ node: { orderNumber: 1001, processedAt: '2026-11-01T10:00:00Z', financialStatus: 'PAID', fulfillmentStatus: 'FULFILLED',
        statusUrl: 'https://fake.myshopify.com/s/1', totalPrice: { amount: '499.0', currencyCode: 'INR' }, lineItems: { edges: [{ node: { title: 'Rajma Masala', quantity: 2 } }] } } }] } } };
  }
  throw new Error('fake shopify: unknown query');
}

global.fetch = async (url, init) => {
  const json = o => ({ ok: true, status: 200, json: async () => o });
  if (url.startsWith('https://fake-redis.local/pipeline')) return json(JSON.parse(init.body).map(c => ({ result: redisCmd(c) })));
  if (url.includes('fake.myshopify.com')) { const b = JSON.parse(init.body); return json({ data: shopify(b.query, b.variables) }); }
  if (url.includes('googleapis.com/oauth2/v3/certs')) return json({ keys: [jwk] });
  throw new Error('unexpected fetch ' + url);
};

// ---------- tiny harness ----------
const H = 'https://magicmeals.test';
async function call(file, { method = 'POST', body, cookie, ip = '1.1.1.1', origin = H, headers = {} } = {}) {
  const req = { method, headers: Object.assign({ host: 'magicmeals.test', origin, 'content-type': 'application/json', 'x-vercel-forwarded-for': ip, cookie: cookie || '' }, headers), body };
  const res = { statusCode: 200, headers: {}, setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(s) { this.body = s ? JSON.parse(s) : null; } };
  await require(path.join(__dirname, '..', 'api', 'auth', file))(req, res);
  return res;
}
const cookieFrom = r => (r.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');
let fails = 0;
const ok = (name, cond, extra) => { console.log((cond ? '  PASS ' : '  FAIL ') + name + (cond ? '' : '  -> ' + JSON.stringify(extra))); if (!cond) fails++; };

(async () => {
  console.log('Login lockout (email)');
  customers.set('rahul@example.com', { password: 'correct-horse', firstName: 'Rahul', lastName: 'S', phone: '+919820000000' });
  const wrong = () => call('login.js', { body: { email: 'rahul@example.com', password: 'nope-nope' }, ip: '2.2.2.' + Math.floor(Math.random() * 200) });
  let r; const codes = [];
  for (let i = 0; i < 6; i++) { r = await wrong(); codes.push(r.statusCode); }
  ok('attempts 1-5 answer 401, the 6th answers 429', codes.join() === '401,401,401,401,401,429', codes);
  ok('429 has Retry-After and a friendly message', r.headers['retry-after'] === '900' && /Try again in 15 minutes/.test(r.body.message), [r.headers['retry-after'], r.body]);
  ok('correct password is also blocked during the lock', (await call('login.js', { body: { email: 'rahul@example.com', password: 'correct-horse' }, ip: '3.3.3.3' })).statusCode === 429);
  ok('"wrong email" gives the same answer as "wrong password"', (await call('login.js', { body: { email: 'ghost@example.com', password: 'whatever1' }, ip: '3.3.3.4' })).body.message === 'Incorrect email or password.');
  clock += 15 * 60 + 1;
  r = await call('login.js', { body: { email: 'rahul@example.com', password: 'correct-horse' }, ip: '3.3.3.5' });
  ok('after the 15 min lock a correct login succeeds', r.statusCode === 200 && r.body.user && r.body.user.email === 'rahul@example.com', [r.statusCode, r.body]);
  const sessionCookie = cookieFrom(r);
  for (let i = 0; i < 6; i++) r = await wrong();
  ok('second lock doubles to 30 minutes', r.statusCode === 429 && r.headers['retry-after'] === '1800', [r.statusCode, r.headers['retry-after']]);
  clock += 31 * 60;

  console.log('Cookie');
  const raw = (await call('login.js', { body: { email: 'rahul@example.com', password: 'correct-horse' }, ip: '4.4.4.4' })).headers['set-cookie'];
  const main = raw.find(c => c.startsWith('__Host-mm_session=')), hint = raw.find(c => c.startsWith('mm_in='));
  ok('session cookie is HttpOnly + Secure + SameSite=Lax + Path=/', /HttpOnly/.test(main) && /Secure/.test(main) && /SameSite=Lax/.test(main) && /Path=\//.test(main) && !/Domain=/.test(main), main);
  ok('session cookie lasts at most 7 days', +/Max-Age=(\d+)/.exec(main)[1] <= 7 * 86400);
  ok('the Shopify token is not readable inside the cookie', ![...tokens.keys()].some(t => main.includes(t) || Buffer.from(main.split('=')[1].split(';')[0], 'base64url').toString('latin1').includes(t)));
  ok('hint cookie is readable by the page (no HttpOnly) and holds nothing secret', !/HttpOnly/.test(hint) && hint.startsWith('mm_in=1'));
  ok('"Remember me" off gives a browser-session cookie', !/Max-Age/.test((await call('login.js', { body: { email: 'rahul@example.com', password: 'correct-horse', remember: false }, ip: '4.4.4.5' })).headers['set-cookie'][0]));

  console.log('Profile (me) and logout');
  const ck = cookieFrom({ headers: { 'set-cookie': raw } });
  r = await call('me.js', { method: 'GET', cookie: ck });
  ok('me returns name, email and orders', r.statusCode === 200 && r.body.user.firstName === 'Rahul' && r.body.user.orders[0].number === 1001, r.body);
  ok('me is no-store', r.headers['cache-control'] === 'no-store');
  ok('me response is cached in Redis for 60 s', [...store.keys()].some(k => k.startsWith('me:')));
  ok('no cookie: 401', (await call('me.js', { method: 'GET' })).statusCode === 401);
  const sess = ck.split('; ')[0], mid = Math.floor(sess.length / 2);
  const flipped = sess.slice(0, mid) + (sess[mid] === 'A' ? 'B' : 'A') + sess.slice(mid + 1);
  ok('tampered cookie: 401', flipped !== sess && (await call('me.js', { method: 'GET', cookie: flipped })).statusCode === 401);
  r = await call('logout.js', { cookie: ck });
  ok('logout clears both cookies', r.statusCode === 200 && r.headers['set-cookie'].every(c => /Max-Age=0/.test(c)));
  ok('logout clears the cached profile', ![...store.keys()].some(k => k.startsWith('me:')));
  ok('the old cookie no longer works after logout', (await call('me.js', { method: 'GET', cookie: ck })).statusCode === 401);

  console.log('Signup');
  const sigs = []; for (let i = 0; i < 6; i++) sigs.push((await call('signup.js', { body: { name: '', email: 'x', password: 'y' }, ip: '5.5.5.5' })).statusCode);
  ok('mistyped signups do NOT use up the 5 real ones', sigs.every(c => c === 400), sigs);
  const good = []; for (let i = 0; i < 6; i++) good.push((await call('signup.js', { body: { name: 'Lim ' + i, email: 'lim' + i + '@example.com', password: 'longenough1' }, ip: '5.5.5.5' })).statusCode);
  ok('5 valid signups per IP per hour, the 6th is blocked', good.join() === '200,200,200,200,200,429', good);
  let flood = 0; for (let i = 0; i < 30; i++) flood = (await call('signup.js', { body: { name: '', email: 'x', password: 'y' }, ip: '5.6.6.6' })).statusCode;
  ok('junk floods are still capped (31st request from one IP: 429)', flood === 400 && (await call('signup.js', { body: { name: '', email: 'x', password: 'y' }, ip: '5.6.6.6' })).statusCode === 429);
  r = await call('signup.js', { body: { name: 'Meera Shah', email: 'Meera@Example.com', phone: '98200 00001', password: 'longenough1' }, ip: '5.5.5.6' });
  ok('valid signup creates the customer, logs in and sets the cookie', r.statusCode === 200 && r.body.user.email === 'meera@example.com' && cookieFrom(r).includes('__Host-mm_session='), [r.statusCode, r.body]);
  ok('phone is stored as +91 and the name is split', customers.get('meera@example.com').phone === '+919820000001' && customers.get('meera@example.com').lastName === 'Shah');
  ok('honeypot filled: rejected', (await call('signup.js', { body: { name: 'Bot', email: 'bot@example.com', password: 'longenough1', website: 'http://spam' }, ip: '5.5.5.7' })).statusCode === 400 && !customers.has('bot@example.com'));
  ok('duplicate email: 409 with no detail leaked', (await call('signup.js', { body: { name: 'Again', email: 'meera@example.com', password: 'longenough1' }, ip: '5.5.5.8' })).statusCode === 409);
  r = await call('signup.js', { body: { name: 'Gina Guest', email: 'guest@example.com', password: 'longenough1' }, ip: '5.5.5.10' });
  ok('existing not-activated customer: tells them to use the activation email (409), with the Shopify code', r.statusCode === 409 && r.body.error === 'not_activated' && /activation link/.test(r.body.message) && !r.headers['set-cookie'], [r.statusCode, r.body]);
  ok('password over 40 characters is refused', (await call('signup.js', { body: { name: 'A', email: 'long@example.com', password: 'x'.repeat(41) }, ip: '5.5.5.9' })).body.field === 'password');

  console.log('Login IP limit, recover, origin');
  const ipCodes = []; for (let i = 0; i < 21; i++) ipCodes.push((await call('login.js', { body: { email: 'u' + i + '@example.com', password: 'wrongpass1' }, ip: '6.6.6.6' })).statusCode);
  ok('21st login from one IP in an hour is blocked', ipCodes[20] === 429 && ipCodes[19] === 401, ipCodes.slice(18));
  const rc = []; for (let i = 0; i < 4; i++) rc.push((await call('recover.js', { body: { email: 'a' + i + '@example.com' }, ip: '7.7.7.7' })).statusCode);
  ok('recover: 4th request from one IP is blocked', rc.join() === '200,200,200,429', rc);
  const same = []; for (let i = 0; i < 4; i++) same.push((await call('recover.js', { body: { email: 'same@example.com' }, ip: '7.7.8.' + i })).statusCode);
  ok('recover: 4th request for one email is blocked', same.join() === '200,200,200,429', same);
  ok('recover answers identically for known and unknown emails', (await call('recover.js', { body: { email: 'rahul@example.com' }, ip: '7.7.9.1' })).body.message === (await call('recover.js', { body: { email: 'nobody@example.com' }, ip: '7.7.9.2' })).body.message);
  ok('POST from another origin: 403', (await call('login.js', { body: { email: 'a@b.co', password: 'x' }, origin: 'https://evil.example', ip: '8.8.8.8' })).statusCode === 403);
  ok('GET on a POST endpoint: 405', (await call('login.js', { method: 'GET', ip: '8.8.8.9' })).statusCode === 405);
  ok('Redis storage holds no plain email or IP', ![...store.keys()].some(k => k.includes('@') || k.includes('6.6.6.6')));

  console.log('Google');
  const idToken = (o, key) => {
    const h = Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'k1' })).toString('base64url');
    const p = Buffer.from(JSON.stringify(Object.assign({ iss: 'https://accounts.google.com', aud: process.env.GOOGLE_CLIENT_ID, sub: '1234567890', email: 'Priya@Example.com', email_verified: true, given_name: 'Priya', family_name: 'K', exp: Math.floor(Date.now() / 1000) + 600 }, o))).toString('base64url');
    return h + '.' + p + '.' + crypto.sign('RSA-SHA256', Buffer.from(h + '.' + p), key || privateKey).toString('base64url');
  };
  let g = 0; const gcall = c => call('google.js', { body: { credential: c }, ip: '9.9.9.' + (++g) });
  r = await gcall(idToken());
  ok('new Google user: customer created, logged in', r.statusCode === 200 && customers.has('priya@example.com') && cookieFrom(r).includes('__Host-mm_session='), [r.statusCode, r.body]);
  ok('the hidden Shopify password is 40 chars and derived, not random', customers.get('priya@example.com').password.length === 40);
  ok('returning Google user: logged in, no duplicate', (await gcall(idToken())).statusCode === 200 && customers.size >= 3);
  ok('unverified Google email rejected', (await gcall(idToken({ email_verified: false }))).statusCode === 401);
  ok('wrong audience rejected', (await gcall(idToken({ aud: 'someone-else' }))).statusCode === 401);
  ok('expired token rejected', (await gcall(idToken({ exp: Math.floor(Date.now() / 1000) - 5 }))).statusCode === 401);
  ok('wrong issuer rejected', (await gcall(idToken({ iss: 'https://evil.example' }))).statusCode === 401);
  ok('forged signature rejected', (await gcall(idToken({}, crypto.generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey))).statusCode === 401);
  ok('garbage rejected', (await gcall('not.a.jwt')).statusCode === 401);
  r = await gcall(idToken({ email: 'rahul@example.com', sub: '999' }));
  ok('Google email that already has a password account is NOT taken over (409)', r.statusCode === 409 && !r.headers['set-cookie'], [r.statusCode]);

  console.log('Redis down');
  const keep = process.env.KV_REST_API_URL; delete process.env.KV_REST_API_URL;
  const origErr = console.error; console.error = () => {};
  r = await call('login.js', { body: { email: 'rahul@example.com', password: 'correct-horse' }, ip: '10.0.0.1' });
  console.error = origErr; process.env.KV_REST_API_URL = keep;
  ok('Redis missing: login is refused with 503, never left unprotected', r.statusCode === 503 && !r.headers['set-cookie'], r.statusCode);

  console.log(fails ? '\n' + fails + ' FAILED' : '\nAll checks passed');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
