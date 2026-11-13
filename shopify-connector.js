/**
 * Shopify connector for Magic Meals (headless checkout).
 *
 * One job: what is in the website cart is EXACTLY what opens in Shopify checkout: same product, same pack, same quantity, same price.
 * It never guesses. If anything cannot be matched exactly, checkout is stopped and the reason is shown.
 *
 *   ShopifyConnector.checkout(ctx) -> { ok: true, checkoutUrl } | { ok: false, problems: [text, ...] }
 *
 *   ctx = {
 *     cart:         { 'productId|pack': qty, 'BYOB-4-123|1': qty }      the website cart
 *     byobBundles:  { bundleKey: { title, mealIds, price, size } }      Build-Your-Own boxes in the cart
 *     getProduct:   id => { id, title, price } | undefined               the website's product list
 *     calcPrice:    (product, pack) => number                            the website's price for a pack
 *     subtotal:     number                                               what the website cart drawer shows
 *   }
 *
 * What it checks, in order, before Shopify's checkout page is opened:
 *   1. every cart line is a known product with a pinned Shopify variant (shopify-catalog.js, from tools/shopify-sync.py);
 *   2. the LIVE store: the product with that handle still has the same title, the pinned variant id and SKU, is for sale,
 *      and costs what the website shows;
 *   3. the Shopify cart that comes back has the same variants, quantities and total as the website cart.
 * Any difference stops checkout. Nothing is ever substituted, dropped or "auto-discovered".
 */
(function () {
  'use strict';

  var cfg = function () { return window.SHOPIFY_CONFIG || {}; };
  var catalog = function () { return (window.SHOPIFY_CATALOG && window.SHOPIFY_CATALOG.products) || {}; };

  function endpoint() {
    var c = cfg();
    return 'https://' + c.shopDomain + '/api/' + (c.apiVersion || '2026-07') + '/graphql.json';
  }

  function gql(query, variables) {
    return fetch(endpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': cfg().storefrontAccessToken },
      body: JSON.stringify({ query: query, variables: variables || {} })
    }).then(function (r) {
      if (!r.ok) throw new Error('Shopify answered HTTP ' + r.status);
      return r.json();
    }).then(function (d) {
      if (d.errors && d.errors.length) throw new Error(d.errors.map(function (e) { return e.message; }).join('; '));
      return d.data;
    });
  }

  var PACK_LABEL = { '1': 'single pouch', '3': 'Pack of 3', '5': 'Pack of 5', '6': 'Pack of 6', '7': 'Pack of 7' };
  var SINGLE_TITLES = ['default title', 'single', 'single pouch'];

  function money(n) { return '₹' + Number(n).toLocaleString('en-IN'); }

  /* 1. Turn the website cart into "wanted" lines: [{ id, pack, qty, unit, label }], plus discount codes and the expected total. */
  function wantedLines(ctx, problems) {
    var merged = {}, codes = [], order = [];
    function add(id, pack, qty, label) {
      var p = ctx.getProduct(id);
      if (!p) { problems.push('"' + (label || id) + '" is not a product we can sell.'); return; }
      var k = id + '|' + pack;
      if (!merged[k]) { merged[k] = { id: id, pack: pack, qty: 0, unit: ctx.calcPrice(p, pack), label: p.title }; order.push(k); }
      merged[k].qty += qty;
    }
    Object.keys(ctx.cart).forEach(function (key) {
      var qty = ctx.cart[key];
      if (!(qty > 0)) return;
      if (key.indexOf('BYOB') === 0) {
        var b = (ctx.byobBundles || {})[key];
        if (!b || !b.mealIds || !b.mealIds.length) { problems.push('A custom box in your cart has no meal list, remove it and build it again.'); return; }
        var code = ((cfg().byobDiscountCodes || {})[b.size] || '').trim();
        if (!code) { problems.push(b.title + ': the box discount is not set up in Shopify yet, so this box cannot be checked out.'); return; }
        if (codes.indexOf(code) < 0) codes.push(code);
        b.mealIds.forEach(function (id) { add(id, '1', qty, b.title); });
      } else {
        var parts = key.split('|');
        add(parts[0], parts[1] || '1', qty);
      }
    });
    return { lines: order.map(function (k) { return merged[k]; }), codes: codes };
  }

  /* 2. Look every product up LIVE by handle and check it against the pinned catalogue. Returns lines with the Shopify variant id. */
  function verifyLive(ctx, lines, problems) {
    var ids = [];
    lines.forEach(function (l) { if (ids.indexOf(l.id) < 0) ids.push(l.id); });
    if (!ids.length) return Promise.resolve([]);
    var q = 'query {' + ids.map(function (id, i) {
      return 'p' + i + ': product(handle: ' + JSON.stringify(id) + ') { id handle title availableForSale variants(first: 50) { edges { node { id title sku availableForSale price { amount } selectedOptions { name value } } } } }';
    }).join(' ') + '}';
    return gql(q).then(function (data) {
      var live = {};
      ids.forEach(function (id, i) { live[id] = data['p' + i]; });
      var out = [];
      lines.forEach(function (l) {
        var name = l.label + ' (' + PACK_LABEL[l.pack] + ')';
        var pinned = catalog()[l.id] && catalog()[l.id].variants && catalog()[l.id].variants[l.pack];
        if (!pinned) { problems.push(name + ' is not set up in Shopify yet' + (l.pack !== '1' ? ' (no "' + PACK_LABEL[l.pack] + '" variant)' : '') + '.'); return; }
        var prod = live[l.id];
        if (!prod) { problems.push(name + ' was not found in the Shopify store.'); return; }
        if (String(prod.title).trim().toLowerCase() !== String(catalog()[l.id].title).trim().toLowerCase()) {
          problems.push(name + ': the Shopify product is now called "' + prod.title + '", not "' + catalog()[l.id].title + '".'); return;
        }
        var variant = null;
        prod.variants.edges.forEach(function (e) { if (e.node.id === pinned.gid) variant = e.node; });
        if (!variant) { problems.push(name + ': its Shopify variant has changed. The site needs a catalogue refresh (python tools/shopify-sync.py).'); return; }
        var variantName = [variant.title.toLowerCase()].concat(variant.selectedOptions.map(function (o) { return o.value.toLowerCase(); }));
        var isSingle = variantName.some(function (n) { return SINGLE_TITLES.indexOf(n) >= 0; });
        var isPack = variantName.indexOf(PACK_LABEL[l.pack].toLowerCase()) >= 0;
        if (l.pack === '1' ? !isSingle : !isPack) { problems.push(name + ': the pinned Shopify variant is "' + variant.title + '", which is not that pack.'); return; }
        if (pinned.sku && variant.sku !== pinned.sku) { problems.push(name + ': its SKU in Shopify changed (' + variant.sku + ').'); return; }
        if (!variant.availableForSale) { problems.push(name + ' is out of stock.'); return; }
        var price = parseFloat(variant.price.amount);
        if (Math.abs(price - l.unit) > 0.5) { problems.push(name + ': price differs. The site shows ' + money(l.unit) + ' but Shopify charges ' + money(price) + '.'); return; }
        out.push({ merchandiseId: variant.id, quantity: l.qty, sku: variant.sku, label: name });
      });
      return out;
    });
  }

  /* 3. Create the Shopify cart, then check what Shopify actually holds against what we sent. */
  function createCart(ctx, lines, codes, problems) {
    var m = 'mutation($input: CartInput!) { cartCreate(input: $input) { cart { id checkoutUrl cost { totalAmount { amount } }' +
      ' discountCodes { code applicable }' +
      ' lines(first: 100) { edges { node { quantity merchandise { ... on ProductVariant { id } } } } } }' +
      ' userErrors { message } } }';
    var input = {
      lines: lines.map(function (l) { return { merchandiseId: l.merchandiseId, quantity: l.quantity }; }),
      attributes: [{ key: 'source', value: 'magicmeals-headless' }]
    };
    if (codes.length) input.discountCodes = codes;
    // Signed in (auth.js): Shopify attaches the order to this customer by email. The login token itself never reaches the page.
    var who = window.MMAuth && window.MMAuth.email();
    if (who) input.buyerIdentity = { email: who };
    return gql(m, { input: input }).then(function (data) {
      var r = data.cartCreate, cart = r && r.cart;
      if (!cart) { (r && r.userErrors || [{ message: 'Shopify did not create the cart.' }]).forEach(function (e) { problems.push(e.message); }); return null; }
      var got = {};
      cart.lines.edges.forEach(function (e) { var id = e.node.merchandise.id; got[id] = (got[id] || 0) + e.node.quantity; });
      var want = {};
      lines.forEach(function (l) { want[l.merchandiseId] = (want[l.merchandiseId] || 0) + l.quantity; });
      var differs = Object.keys(want).concat(Object.keys(got)).some(function (id) { return want[id] !== got[id]; });
      if (differs) problems.push('Shopify\'s cart does not match yours (a line is missing or has a different quantity).');
      (cart.discountCodes || []).forEach(function (d) { if (!d.applicable) problems.push('The box discount code "' + d.code + '" is not valid in Shopify.'); });
      codes.forEach(function (c) {
        if (!(cart.discountCodes || []).some(function (d) { return d.code.toLowerCase() === c.toLowerCase(); })) problems.push('The box discount code "' + c + '" was not applied.');
      });
      var total = parseFloat(cart.cost.totalAmount.amount);
      if (Math.abs(total - ctx.subtotal) > 1.01) problems.push('Total differs. Your cart shows ' + money(ctx.subtotal) + ' but Shopify has ' + money(total) + '.');
      return problems.length ? null : cart.checkoutUrl;
    });
  }

  function checkout(ctx) {
    var c = cfg(), problems = [];
    if (!c.shopDomain || !c.storefrontAccessToken) return Promise.resolve({ ok: false, problems: ['Shopify is not configured (shopify-config.js).'] });
    if (!window.SHOPIFY_CATALOG) return Promise.resolve({ ok: false, problems: ['The product catalogue file (shopify-catalog.js) is missing.'] });
    var want = wantedLines(ctx, problems);
    if (!want.lines.length && !problems.length) return Promise.resolve({ ok: false, problems: ['Your meal box is empty.'] });
    return verifyLive(ctx, want.lines, problems).then(function (lines) {
      if (problems.length) return { ok: false, problems: problems };
      return createCart(ctx, lines, want.codes, problems).then(function (url) {
        return url ? { ok: true, checkoutUrl: url } : { ok: false, problems: problems };
      });
    }).catch(function (err) {
      return { ok: false, problems: ['Could not reach Shopify (' + err.message + '). Nothing was charged. Please try again.'] };
    });
  }

  window.ShopifyConnector = { checkout: checkout };
})();
