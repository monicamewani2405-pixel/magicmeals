/* api/_lib/redis.js: tiny Upstash Redis client over its REST API (no npm package needed).
   Env (added by the Vercel Upstash integration): KV_REST_API_URL + KV_REST_API_TOKEN, or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN. */
'use strict';

function conf() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/+$/, ''), token } : null;
}

const configured = () => !!conf();

// Runs several commands in order on one connection. cmds = [['INCR','k'], ['EXPIRE','k',60,'NX']] -> [result, result]
async function pipeline(cmds) {
  const c = conf();
  if (!c) throw new Error('redis_not_configured');
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 4000);
  try {
    const r = await fetch(c.url + '/pipeline', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + c.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(cmds),
      signal: ctl.signal
    });
    if (!r.ok) throw new Error('redis_http_' + r.status);
    const out = await r.json();
    return out.map(x => {
      if (x && x.error) throw new Error('redis_cmd');         // never include the command: keys can hold hashed emails
      return x.result;
    });
  } finally { clearTimeout(t); }
}

const cmd = async (...args) => (await pipeline([args]))[0];

module.exports = { configured, pipeline, cmd };
