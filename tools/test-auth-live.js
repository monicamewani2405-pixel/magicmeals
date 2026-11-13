/* tools/test-auth-live.js: checks a DEPLOYED site (Phase 6). Usage:   node tools/test-auth-live.js https://magicmeals-one.vercel.app
   It never creates a Shopify customer: signup probes send invalid bodies (they still count against the IP limit),
   login probes use a made-up email. WARNING: it uses up your own IP's signup (3/h) and login limits for an hour,
   and locks the made-up email for 15 minutes. Run it once, not in a loop.
   Not covered here (needs a person): the real lock-expiry login, cookie flags in dev tools, Google login, the reset email. */
'use strict';
const base = (process.argv[2] || '').replace(/\/+$/, '');
if (!/^https:\/\//.test(base)) { console.error('Usage: node tools/test-auth-live.js https://your-site'); process.exit(2); }

let fails = 0;
const ok = (name, cond, extra) => { console.log((cond ? 'PASS ' : 'FAIL ') + name + (cond ? '' : '  -> ' + JSON.stringify(extra))); if (!cond) fails++; };
async function post(path, body) {
  const r = await fetch(base + '/api/auth/' + path, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base }, body: JSON.stringify(body) });
  let j = {}; try { j = await r.json(); } catch (e) { /* not json */ }
  return { status: r.status, retry: r.headers.get('retry-after'), cache: r.headers.get('cache-control'), body: j };
}

(async () => {
  const email = 'ratelimit-probe-' + Date.now() + '@example.invalid';
  const codes = [];
  let last;
  for (let i = 0; i < 6; i++) { last = await post('login', { email, password: 'wrong-password-' + i }); codes.push(last.status); }
  ok('6 wrong logins on one email: 401 x5 then 429', codes.join() === '401,401,401,401,401,429', codes);
  ok('429 carries Retry-After and the friendly message', !!last.retry && /Try again in \d+ (minute|minutes|second|seconds)\./.test(last.body.message || ''), [last.retry, last.body]);
  ok('auth responses are no-store', /no-store/.test(last.cache || ''), last.cache);

  const s = []; for (let i = 0; i < 4; i++) s.push((await post('signup', { name: '', email: 'x', password: 'y' })).status);
  ok('4th signup from this IP is blocked (3 per hour)', s[3] === 429 && s.slice(0, 3).every(c => c === 400), s);

  const me = await fetch(base + '/api/auth/me');
  ok('/api/auth/me without a cookie: 401', me.status === 401, me.status);

  const evil = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://evil.example' }, body: '{}' });
  ok('login from another origin: 403', evil.status === 403, evil.status);

  const cfg = await (await fetch(base + '/api/auth/config')).json().catch(() => ({}));
  console.log('INFO Google sign-in is ' + (cfg.googleClientId ? 'configured' : 'NOT configured (button stays hidden)'));
  console.log(fails ? '\n' + fails + ' FAILED' : '\nAll live checks passed');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
