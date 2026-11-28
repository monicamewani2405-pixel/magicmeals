/**
 * Magic Meals: live stock from Shopify, so a dish with no stock shows as sold out on the site and cannot be added.
 *
 * The rules (kept simple on purpose):
 *   - A variant is OUT when Shopify says it cannot be bought (availableForSale = false) OR it has no stock (currentlyNotInStock = true: stock 0 while
 *     "Sell when out of stock" is still on). So zero stock is always sold out here, whatever that switch says. Stock above zero is never sold out.
 *   - The SINGLE pack is the master: if the Single variant is out, the whole product is sold out, so Pack of 3, 5 and 7 are sold out too.
 *   - A pack is also out when its own variant is out (for example Pack of 7 at zero while Single still has stock): only that pack is disabled.
 *   - A product is judged only by its own Shopify product. A combo is its own product with its own stock: set that to 0 in Shopify to block it.
 *   - If Shopify cannot be reached nothing is marked sold out (the site works as before; Checkout still checks the live stock).
 *
 *   MMStock.soldOut(productId)             true when the whole product is sold out
 *   MMStock.packSoldOut(productId, pack)   true when that pack ('1', '3', '5', '7') cannot be bought
 *   MMStock.onChange(fn)                   fn() runs when the answer changed after the first paint
 *
 * Reads the public Storefront API with the same token as shopify-connector.js (read only). Refreshes every 2 minutes and when the tab comes back.
 * The last answer is kept in localStorage for 10 minutes so the first paint already knows; an older answer is ignored.
 */
(function () {
  'use strict';
  var KEY = 'mm-stock-v2', KEEP_MS = 10 * 60 * 1000;
  var out = { products: {}, variants: {} };      // product handle / variant gid -> true when out
  var listeners = [];
  var timer = null;

  function cfg() { return window.SHOPIFY_CONFIG || {}; }
  function catalog() { return (window.SHOPIFY_CATALOG && window.SHOPIFY_CATALOG.products) || {}; }

  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && saved.products && saved.variants && Date.now() - saved.t < KEEP_MS) out = saved;
  } catch (e) { /* private window or blocked storage: start empty */ }

  function variantOut(id, pack) {
    var e = catalog()[id], v = e && e.variants && e.variants[pack];
    return !!(v && out.variants[v.gid] === true);
  }

  function soldOut(id) {
    return out.products[id] === true || variantOut(id, '1');          // the whole product is unavailable, or its Single is out
  }

  function packSoldOut(id, pack) {
    return soldOut(id) || variantOut(id, pack);
  }

  function gql(query, variables) {
    var c = cfg();
    return fetch('https://' + c.shopDomain + '/api/' + (c.apiVersion || '2026-07') + '/graphql.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': c.storefrontAccessToken },
      body: JSON.stringify({ query: query, variables: variables || {} })
    }).then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (j) { if (j.errors || !j.data) throw new Error('graphql'); return j.data; });
  }

  var Q = 'query($after: String) { products(first: 100, after: $after) { pageInfo { hasNextPage endCursor } nodes { handle availableForSale variants(first: 10) { nodes { id availableForSale currentlyNotInStock } } } } }';

  function readAll(after, acc, pages) {
    return gql(Q, { after: after }).then(function (d) {
      var p = d.products;
      p.nodes.forEach(function (n) {
        if (n.availableForSale === false) acc.products[n.handle] = true;
        n.variants.nodes.forEach(function (v) { if (v.availableForSale === false || v.currentlyNotInStock === true) acc.variants[v.id] = true; });
      });
      return p.pageInfo.hasNextPage && pages < 5 ? readAll(p.pageInfo.endCursor, acc, pages + 1) : acc;
    });
  }

  function sameSet(a, b) { return Object.keys(a).sort().join('|') === Object.keys(b).sort().join('|'); }

  function refresh() {
    if (!cfg().shopDomain || !cfg().storefrontAccessToken) return;
    readAll(null, { products: {}, variants: {} }, 0).then(function (fresh) {
      var changed = !sameSet(fresh.products, out.products) || !sameSet(fresh.variants, out.variants);
      out = fresh;
      try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), products: out.products, variants: out.variants })); } catch (e) { /* ignore */ }
      if (changed) listeners.forEach(function (fn) { try { fn(); } catch (e) { /* ignore */ } });
    }).catch(function () { /* offline or throttled: keep what we know */ });
  }

  function start() {
    refresh();
    if (timer) clearInterval(timer);
    timer = setInterval(function () { if (!document.hidden) refresh(); }, 120000);
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) refresh(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

  window.MMStock = { soldOut: soldOut, packSoldOut: packSoldOut, refresh: refresh, onChange: function (fn) { listeners.push(fn); } };
})();
