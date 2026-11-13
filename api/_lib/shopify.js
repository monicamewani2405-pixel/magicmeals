/* api/_lib/shopify.js: server-side Storefront API calls for customer accounts. Shopify keeps the customers; we store no passwords.
   Env: SHOPIFY_STORE_DOMAIN (1z10zd-y0.myshopify.com), SHOPIFY_STOREFRONT_TOKEN, optional SHOPIFY_API_VERSION. */
'use strict';

async function gql(query, variables) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN, tok = process.env.SHOPIFY_STOREFRONT_TOKEN;
  if (!domain || !tok) throw new Error('shopify_not_configured');
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 9000);
  try {
    const r = await fetch('https://' + domain + '/api/' + (process.env.SHOPIFY_API_VERSION || '2026-07') + '/graphql.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': tok },
      body: JSON.stringify({ query, variables: variables || {} }),
      signal: ctl.signal
    });
    if (!r.ok) throw new Error('shopify_http_' + r.status);
    const j = await r.json();
    if (j.errors && j.errors.length) throw new Error('shopify_graphql');   // message not logged: it can echo input
    return j.data;
  } finally { clearTimeout(t); }
}

const isThrottle = errs => (errs || []).some(e => /THROTTL|TOO_MANY/i.test(e.code || ''));

// -> { ok:true, token, expiresAt } | { ok:false, reason:'invalid'|'throttled' }
async function createToken(email, password) {
  const d = await gql(
    'mutation($i: CustomerAccessTokenCreateInput!){ customerAccessTokenCreate(input:$i){ customerAccessToken{ accessToken expiresAt } customerUserErrors{ code } } }',
    { i: { email, password } });
  const r = d.customerAccessTokenCreate;
  if (r && r.customerAccessToken) return { ok: true, token: r.customerAccessToken.accessToken, expiresAt: r.customerAccessToken.expiresAt };
  return { ok: false, reason: isThrottle(r && r.customerUserErrors) ? 'throttled' : 'invalid' };
}

// -> { ok:true } | { ok:false, reason:'taken'|'disabled'|'throttled'|'invalid', fields:[...], codes:[...] }
// 'disabled' = the email already exists as a customer with no active account (e.g. from an earlier guest order); Shopify then emails an activation link.
async function createCustomer(input) {
  const d = await gql(
    'mutation($i: CustomerCreateInput!){ customerCreate(input:$i){ customer{ id } customerUserErrors{ code field } } }', { i: input });
  const r = d.customerCreate, errs = (r && r.customerUserErrors) || [];
  if (r && r.customer && !errs.length) return { ok: true };
  const codes = errs.map(e => String(e.code || '').replace(/[^A-Z_]/g, '').slice(0, 40));   // Shopify's fixed error codes, safe to return
  if (isThrottle(errs)) return { ok: false, reason: 'throttled', fields: [], codes };
  const fields = errs.map(e => (e.field || []).slice(-1)[0]);
  const reason = errs.some(e => e.code === 'TAKEN') ? 'taken' : errs.some(e => e.code === 'CUSTOMER_DISABLED') ? 'disabled' : 'invalid';
  return { ok: false, reason, fields, codes };
}

// Name and phone only (the email is never changeable). -> { ok:true } | { ok:false, reason:'signed_out'|'phone'|'invalid'|'throttled' }
async function updateCustomer(token, input) {
  const d = await gql(
    'mutation($t: String!, $c: CustomerUpdateInput!){ customerUpdate(customerAccessToken:$t, customer:$c){ customer{ id } customerUserErrors{ code field } } }',
    { t: token, c: input });
  const r = d.customerUpdate, errs = (r && r.customerUserErrors) || [];
  if (r && r.customer && !errs.length) return { ok: true };
  if (isThrottle(errs)) return { ok: false, reason: 'throttled' };
  if (errs.some(e => e.code === 'INVALID' && !(e.field || []).length) || errs.some(e => /TOKEN|CUSTOMER_DISABLED/.test(e.code || ''))) return { ok: false, reason: 'signed_out' };
  if (errs.some(e => (e.field || []).slice(-1)[0] === 'phone')) return { ok: false, reason: 'phone' };
  return { ok: false, reason: 'invalid' };
}

async function recover(email) {
  const d = await gql('mutation($e: String!){ customerRecover(email:$e){ customerUserErrors{ code } } }', { e: email });
  return !isThrottle(d.customerRecover && d.customerRecover.customerUserErrors);
}

async function deleteToken(token) {
  await gql('mutation($t: String!){ customerAccessTokenDelete(customerAccessToken:$t){ deletedAccessToken } }', { t: token });
}

const ME = 'query($t: String!){ customer(customerAccessToken:$t){ firstName lastName email phone' +
  ' defaultAddress{ id }' +
  ' addresses(first:10){ edges{ node{ id address1 address2 city province zip country phone } } }' +
  ' orders(first:10, sortKey:PROCESSED_AT, reverse:true){ edges{ node{ orderNumber processedAt financialStatus fulfillmentStatus statusUrl' +
  ' successfulFulfillments{ trackingCompany trackingInfo{ number url } }' +
  ' totalPrice{ amount currencyCode } lineItems(first:5){ edges{ node{ title quantity } } } } } } } }';

// Plain shape for the page. null = token no longer valid.
async function getCustomer(token) {
  const c = (await gql(ME, { t: token })).customer;
  if (!c) return null;
  const nodes = conn => ((conn && conn.edges) || []).map(e => e.node);
  const defId = c.defaultAddress && c.defaultAddress.id;
  return {
    firstName: c.firstName || '', lastName: c.lastName || '', email: c.email || '', phone: c.phone || '',
    addresses: nodes(c.addresses).map(a => ({
      isDefault: a.id === defId,
      lines: [a.address1, a.address2, [a.city, a.province].filter(Boolean).join(', ') + (a.zip ? ' ' + a.zip : ''), a.country].map(s => (s || '').trim()).filter(Boolean),
      phone: a.phone || ''
    })),
    orders: nodes(c.orders).map(o => ({
      number: o.orderNumber, date: o.processedAt, payment: o.financialStatus || '', fulfilment: o.fulfillmentStatus || '',
      total: o.totalPrice ? { amount: o.totalPrice.amount, currency: o.totalPrice.currencyCode } : null,
      statusUrl: /^https:\/\//.test(o.statusUrl || '') ? o.statusUrl : '',
      tracking: (o.successfulFulfillments || []).reduce((acc, f) => acc.concat((f.trackingInfo || []).map(t => ({
        company: f.trackingCompany || '', number: t.number || '', url: /^https:\/\//.test(t.url || '') ? t.url : ''
      }))), []).filter(t => t.number || t.url),
      items: nodes(o.lineItems).map(l => ({ title: l.title, qty: l.quantity }))
    }))
  };
}

module.exports = { createToken, createCustomer, updateCustomer, recover, deleteToken, getCustomer };
