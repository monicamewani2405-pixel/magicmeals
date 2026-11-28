/* Shopify theme: the pictures live in Shopify Files, not in the theme (a theme zip is limited to ~50 MB).
   The site's code names its pictures with the old relative paths (pdp/rajma-masala/gallery/hero-800.webp, pouch-art/..., assets/...). This small script, inlined
   first in the page, turns such a path into its Shopify address wherever the page uses one: HTML written into the page, <img>/<source>/<video poster>,
   setAttribute, CSS inline styles and fetch. Same naming rule as tools/theme-media.py flat(): "/" -> "__", lower case, .jpeg -> .jpg.
   Addresses that are already absolute are left alone. window.MMA(path) does the same for a single path. */
(function () {
  'use strict';
  var BASE = '@@CDN@@';
  var DIRS = 'pdp|pouch-art|assets|scenes|how-it-works|videos\\/posters|heroes|brochure';
  var ROOTS = '(?:logo_live|cropped_logo|magic_meals_logo_saffron|magic_hero_[a-z_]+|thumb_[A-Za-z0-9_-]+)';
  var EXT = '(?:png|jpe?g|webp|svg|gif|ico|pdf)';
  var RE = new RegExp('(^|[\\s"\'(=,;>])((?:\\./)?(?:(?:' + DIRS + ')\\/[^\\s"\'()<>,?#]+|' + ROOTS + ')\\.' + EXT + ')', 'gi');

  function flat(p) {
    p = p.replace(/^\.\//, '').replace(/\//g, '__').toLowerCase().replace('.jpeg', '.jpg').replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
    return BASE + p;
  }
  function rw(s) {
    if (typeof s !== 'string' || s.length < 6 || s.indexOf('.') < 0) return s;
    return s.replace(RE, function (m, pre, p) { return pre + flat(p); });
  }
  window.MMA = function (p) { return typeof p === 'string' ? rw(' ' + p).slice(1) : p; };

  function wrapSetter(proto, prop) {
    var d = Object.getOwnPropertyDescriptor(proto, prop);
    if (!d || !d.set) return;
    Object.defineProperty(proto, prop, { configurable: true, enumerable: d.enumerable, get: d.get, set: function (v) { d.set.call(this, rw(v)); } });
  }
  wrapSetter(Element.prototype, 'innerHTML');
  wrapSetter(Element.prototype, 'outerHTML');
  wrapSetter(HTMLImageElement.prototype, 'src');
  wrapSetter(HTMLImageElement.prototype, 'srcset');
  wrapSetter(HTMLSourceElement.prototype, 'src');
  wrapSetter(HTMLSourceElement.prototype, 'srcset');
  wrapSetter(HTMLVideoElement.prototype, 'poster');
  wrapSetter(HTMLAnchorElement.prototype, 'href');
  ['backgroundImage', 'background', 'cssText', 'maskImage', 'webkitMaskImage', 'content'].forEach(function (k) { wrapSetter(CSSStyleDeclaration.prototype, k); });

  var insertHTML = Element.prototype.insertAdjacentHTML;
  Element.prototype.insertAdjacentHTML = function (pos, html) { return insertHTML.call(this, pos, rw(html)); };

  var setAttr = Element.prototype.setAttribute;
  var ATTRS = { src: 1, srcset: 1, poster: 1, href: 1, style: 1, 'data-src': 1, 'data-srcset': 1, 'data-poster': 1 };
  Element.prototype.setAttribute = function (name, value) { return setAttr.call(this, name, ATTRS[String(name).toLowerCase()] ? rw(value) : value); };

  var styleSet = CSSStyleDeclaration.prototype.setProperty;
  CSSStyleDeclaration.prototype.setProperty = function (name, value, prio) { return styleSet.call(this, name, rw(value), prio); };

  if (window.fetch) {
    var f = window.fetch;
    window.fetch = function (input, init) { return f.call(this, typeof input === 'string' ? rw(' ' + input).slice(1) : input, init); };
  }
})();
