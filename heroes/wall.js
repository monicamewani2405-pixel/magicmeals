/* =========================================================
   heroes/wall.js: Design 3 "Range Wall"
   - 2 to 3 marquee rows of pouches behind a soft wash, headline and a
     featured pouch (same drop-in intro as Design 1) in front
   - Hover / tap / Enter on a wall pouch: pauses its row and opens a card
   - Same mount(slot) / unmount() API as heroes/classic.js
   - Prefixed CSS: v-wall-* (variants.css). HERO_PRODUCTS: hero-products.js
   ========================================================= */
(function () {
  'use strict';

  var MAX_PRODUCTS = 10;
  var DURATIONS = [55, 70, 62];          // seconds per row (rows 1, 2, 3)
  var PARALLAX = [-0.06, 0.04, -0.09];   // row travel as a share of the viewport height
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var root = null, slotRef = null, ctx = null, cleanups = [], items = [], rowEls = [], tweens = [];
  var onScreen = true, wasMobile = false, resizeTimer = null, closeTimer = null, cardTimer = null;
  var open = null;       // { btn, row, by: 'hover' | 'tap' }
  var okCache = {};
  var el = {};

  /* ---------- data ---------- */

  function imgFor(slug) { return 'assets/hero/' + slug + '-front-600.png'; }
  function rupees(n) { return '\u20B9' + Number(n).toLocaleString('en-IN'); }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function shortName(p) {
    return p.title.replace(/^(Authentic|Royal|Classic|Homestyle)\s+(Punjabi\s+)?/i, '').replace(/^Dum\s+/i, '');
  }

  // HERO_PRODUCTS first, then best sellers (first 8 non-combos, as on the Home page), up to 10
  function resolveItems() {
    var all = (typeof PRODUCTS !== 'undefined') ? PRODUCTS : [];
    var ids = (typeof HERO_PRODUCTS !== 'undefined' ? HERO_PRODUCTS : []).slice();
    all.filter(function (p) { return p.category !== 'Combos'; }).slice(0, 8).forEach(function (p) {
      if (ids.indexOf(p.id) === -1) ids.push(p.id);
    });
    return ids.slice(0, MAX_PRODUCTS).map(function (slug) {
      var p = all.filter(function (x) { return x.id === slug; })[0];
      return p ? { slug: slug, name: shortName(p), price: p.price, src: imgFor(slug) } : null;
    }).filter(Boolean);
  }

  function isMobile() { return window.innerWidth < 768; }

  /* ---------- building ---------- */

  function pouchHtml(it, rowIdx, dup) {
    return '<button type="button" class="v-wall-pouch" data-slug="' + it.slug + '" data-row="' + rowIdx + '" aria-label="' + esc(it.name) + ' details"' +
      (dup ? ' aria-hidden="true" tabindex="-1"' : '') + '>' +
      '<span class="v-wall-pic"><img src="' + it.src + '" width="384" height="600" alt="" draggable="false"' + (rowIdx > 0 ? ' loading="lazy"' : '') + '></span>' +
    '</button>';
  }

  function rowHtml(rowIdx, count, rows) {
    var half = [];
    for (var k = 0; k < count; k++) half.push(items[(rowIdx * 3 + k) % items.length]);
    var one = half.map(function (it) { return pouchHtml(it, rowIdx, false); }).join('');
    var two = reduceMotion.matches ? '' : half.map(function (it) { return pouchHtml(it, rowIdx, true); }).join('');
    return '<div class="v-wall-row" data-row="' + rowIdx + '" style="top:' + ((rowIdx + 0.5) / rows * 100) + '%">' +
      '<div class="v-wall-track">' + one + two + '</div></div>';
  }

  function build() {
    var rows = isMobile() ? 2 : 3;
    var h = Math.min(200, Math.max(110, window.innerHeight * 0.18));
    var itemW = h * 0.64 + 24;
    var target = Math.max(window.innerWidth, (window.screen && window.screen.width) || 0) * 1.05;
    var count = Math.max(items.length, Math.ceil(target / itemW));
    var rowsHtml = '';
    for (var r = 0; r < rows; r++) rowsHtml += rowHtml(r, count, rows);
    var f = items[0];

    return '<section class="v-wall' + (reduceMotion.matches ? ' is-static' : '') + '" data-design="3" aria-label="Our range">' +
      '<div class="v-wall-rows">' + rowsHtml + '</div>' +
      '<div class="v-wall-wash" aria-hidden="true"></div>' +
      '<div class="v-wall-content">' +
        '<h1 class="v-wall-headline v-wall-plate"><span class="v-wall-line">REAL FOOD.</span> <span class="v-wall-line">READY IN MINUTES.</span></h1>' +
        '<div class="v-wall-feature">' +
          '<span class="v-wall-shadow" aria-hidden="true"></span>' +
          '<span class="v-wall-drop"><span class="v-wall-float">' +
            '<span class="v-wall-steam" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>' +
            '<img src="' + f.src + '" width="384" height="600" alt="Magic Meals ' + esc(f.name) + ' freeze-dried meal pouch" fetchpriority="high">' +
          '</span></span>' +
        '</div>' +
        '<p class="v-wall-sub v-wall-plate">Homestyle Indian meals. Just add hot water.</p>' +
        '<div class="v-wall-actions">' +
          '<button type="button" class="hero-btn hero-btn--primary v-wall-btn" data-scroll-to="best-sellers">Shop Now</button>' +
          '<button type="button" class="hero-btn hero-btn--secondary v-wall-btn" data-scroll-to="how-it-works" data-scroll-fallback="best-sellers">How It Works</button>' +
        '</div>' +
      '</div>' +
      '<div class="v-wall-card" role="group" aria-label="Meal details" aria-hidden="true">' +
        '<p class="v-wall-card-name"></p><p class="v-wall-card-price"></p>' +
        '<button type="button" class="hero-btn hero-btn--primary v-wall-add" data-add="" tabindex="-1"><img class="v-wall-add-img" src="" width="16" height="25" alt="">Add to cart</button>' +
      '</div>' +
    '</section>';
  }

  function listen(target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    cleanups.push(function () { target.removeEventListener(type, fn, opts); });
  }

  /* ---------- card ---------- */

  function find(slug) { return items.filter(function (i) { return i.slug === slug; })[0]; }

  function placeCard() {
    if (!open) return;
    var s = root.getBoundingClientRect(), r = open.btn.getBoundingClientRect();
    var cw = el.card.offsetWidth, ch = el.card.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
    var grow = r.width * 0.125;
    var left = r.right + grow + 10;
    if (left + cw > vw - 8) left = r.left - grow - 10 - cw;                       // flip near the right edge
    if (left < 8) left = Math.max(8, Math.min(vw - cw - 8, r.left + r.width / 2 - cw / 2));
    var top = Math.max(84, Math.min(vh - ch - 8, r.top + r.height / 2 - ch / 2));
    el.card.style.left = (left - s.left) + 'px';
    el.card.style.top = (top - s.top) + 'px';
  }

  function openCard(btn, by) {
    if (open && open.btn === btn) { if (by === 'tap') open.by = 'tap'; return; }
    closeCard();
    var row = +btn.dataset.row, it = find(btn.dataset.slug);
    if (!it) return;
    open = { btn: btn, row: row, by: by };
    btn.classList.add('is-lifted');
    rowEls[row].el.style.zIndex = 5;
    if (tweens[row] && window.gsap) gsap.to(tweens[row], { timeScale: 0, duration: 0.3, overwrite: true });
    el.cardName.textContent = it.name;
    el.cardPrice.textContent = rupees(it.price);
    el.add.setAttribute('data-add', it.slug);
    el.add.setAttribute('aria-label', 'Add ' + it.name + ' to cart');
    el.add.tabIndex = 0;
    el.addImg.src = it.src;
    el.card.setAttribute('aria-hidden', 'false');
    el.card.classList.add('is-open');
    placeCard();
    clearTimeout(cardTimer);
    cardTimer = setTimeout(placeCard, 350);   // after the pause has settled
  }

  function closeCard() {
    clearTimeout(closeTimer); clearTimeout(cardTimer);
    if (!open) return;
    var o = open; open = null;
    o.btn.classList.remove('is-lifted');
    if (rowEls[o.row]) rowEls[o.row].el.style.zIndex = '';
    if (tweens[o.row] && window.gsap) gsap.to(tweens[o.row], { timeScale: 1, duration: 0.3, overwrite: true });
    el.card.classList.remove('is-open');
    el.card.setAttribute('aria-hidden', 'true');
    el.add.tabIndex = -1;
  }

  function scheduleClose() {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(function () { if (open && open.by === 'hover') closeCard(); }, 150);
  }

  /* ---------- motion ---------- */

  function updateMarquee() {
    var run = onScreen && !document.hidden;
    tweens.forEach(function (t) { t.paused(!run); });
  }

  function intro() {
    var pics = root.querySelectorAll('.v-wall-pic');
    root.classList.add('is-intro');
    gsap.set(el.drop, { transformOrigin: '50% 100%', willChange: 'transform' });
    var tl = gsap.timeline({ onComplete: function () {
      gsap.set(el.drop, { willChange: 'auto' });
      ctx.add(function () {
        var tw = gsap.fromTo(el.float, { y: -10 }, { y: 10, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        tw.progress(0.5);
      });
    } });
    tl.from(el.headline, { opacity: 0, y: 40, duration: 0.6, ease: 'power2.out' }, 0)
      .from(el.sub, { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out' }, 0.15)
      .from(el.drop, { y: '-120vh', rotation: -12, duration: 0.9, ease: 'power2.in' }, 0.3)
      .from(el.shadow, { scale: 0.35, opacity: 0.08, duration: 0.9, ease: 'power2.in' }, 0.3)
      .call(function () { root.classList.remove('is-intro'); }, null, 1.2)
      .to(el.drop, { scaleY: 0.88, scaleX: 1.08, duration: 0.12, ease: 'power1.out' }, 1.2)
      .to(el.shadow, { scaleX: 1.12, scaleY: 0.9, duration: 0.12, ease: 'power1.out' }, 1.2)
      .to(el.drop, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' }, 1.32)
      .to(el.shadow, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' }, 1.32)
      .to(el.drop, { keyframes: [{ rotation: -3, duration: 0.15 }, { rotation: 2, duration: 0.15 }, { rotation: -1, duration: 0.15 }, { rotation: 0, duration: 0.15 }], ease: 'sine.inOut' }, 1.32)
      .from(el.btns, { opacity: 0, y: 16, duration: 0.4, stagger: 0.1, ease: 'power2.out' }, 1.7)
      // wall pouches: quick staggered fade-and-rise once the featured pouch has landed
      .from(pics, { opacity: 0, y: 24, duration: 0.45, ease: 'power2.out', stagger: { each: 0.012, from: 'random' } }, 1.9);
  }

  function marquees() {
    rowEls.forEach(function (r, i) {
      var d = DURATIONS[i % DURATIONS.length];
      var tw = (i % 2 === 0)
        ? gsap.to(r.track, { xPercent: -50, ease: 'none', repeat: -1, duration: d })           // right to left
        : gsap.fromTo(r.track, { xPercent: -50 }, { xPercent: 0, ease: 'none', repeat: -1, duration: d });   // left to right
      tw.progress(i * 0.17);
      tweens.push(tw);
    });
  }

  function parallax() {
    if (!window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    var tl = gsap.timeline({ scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true } });
    rowEls.forEach(function (r, i) {
      tl.to(r.el, { y: function () { return PARALLAX[i % PARALLAX.length] * window.innerHeight; }, ease: 'none' }, 0);
    });
  }

  /* ---------- image check ---------- */

  // Non-transparent or missing art becomes a labelled placeholder (never edited or invented)
  function checkImg(img) {
    var btn = img.closest('.v-wall-pouch'), slug = btn ? btn.dataset.slug : null;
    var bad = img.naturalWidth === 0;
    if (!bad) {
      if (okCache[img.src] === undefined) {
        try {
          var c = document.createElement('canvas'); c.width = 8; c.height = 8;
          var g = c.getContext('2d'); g.drawImage(img, 0, 0, 8, 8);
          var d = g.getImageData(0, 0, 8, 8).data;
          okCache[img.src] = ![0, 7, 56, 63].every(function (px) { return d[px * 4 + 3] > 200; });
        } catch (e) { okCache[img.src] = true; }
      }
      bad = !okCache[img.src];
    }
    if (!bad) return;
    var it = slug ? find(slug) : items[0];
    if (!it || img.nextSibling) return;
    console.warn('[wall] ' + it.slug + ': image is not a transparent front PNG; showing placeholder');
    img.style.display = 'none';
    var ph = document.createElement('span');
    ph.className = 'v-wall-placeholder';
    ph.textContent = it.name + ' (image needed)';
    img.parentNode.appendChild(ph);
  }

  /* ---------- module API ---------- */

  function mount(slot) {
    unmount();
    slotRef = slot;
    items = resolveItems();
    if (!items.length) { slot.innerHTML = ''; return Promise.resolve(); }
    wasMobile = isMobile(); onScreen = true; open = null;

    slot.innerHTML = build();
    root = slot.firstElementChild;
    el = {
      headline: root.querySelector('.v-wall-headline'),
      sub: root.querySelector('.v-wall-sub'),
      drop: root.querySelector('.v-wall-drop'),
      float: root.querySelector('.v-wall-float'),
      shadow: root.querySelector('.v-wall-shadow'),
      btns: root.querySelectorAll('.v-wall-btn'),
      card: root.querySelector('.v-wall-card'),
      cardName: root.querySelector('.v-wall-card-name'),
      cardPrice: root.querySelector('.v-wall-card-price'),
      add: root.querySelector('.v-wall-add'),
      addImg: root.querySelector('.v-wall-add-img')
    };
    rowEls = [].slice.call(root.querySelectorAll('.v-wall-row')).map(function (r) {
      return { el: r, track: r.querySelector('.v-wall-track') };
    });
    [].slice.call(root.querySelectorAll('img')).forEach(function (img) {
      img.addEventListener('load', function () { checkImg(img); });
      img.addEventListener('error', function () { checkImg(img); });
      if (img.complete) checkImg(img);
    });

    // buttons
    [].slice.call(root.querySelectorAll('[data-scroll-to]')).forEach(function (b) {
      listen(b, 'click', function () {
        var t = document.getElementById(b.dataset.scrollTo) || document.getElementById(b.dataset.scrollFallback || '');
        if (t) t.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
      });
    });

    // card interaction: hover (mouse), tap / Enter (touch, keyboard)
    var rowsRoot = root.querySelector('.v-wall-rows');
    listen(rowsRoot, 'pointerover', function (e) {
      if (e.pointerType !== 'mouse') return;
      var b = e.target.closest('.v-wall-pouch');
      if (!b) return;
      clearTimeout(closeTimer);
      openCard(b, 'hover');
    });
    listen(rowsRoot, 'pointerout', function (e) {
      if (e.pointerType !== 'mouse') return;
      var b = e.target.closest('.v-wall-pouch');
      if (!b || (e.relatedTarget && b.contains(e.relatedTarget))) return;
      if (e.relatedTarget && el.card.contains(e.relatedTarget)) return;
      scheduleClose();
    });
    listen(el.card, 'pointerenter', function () { clearTimeout(closeTimer); });
    listen(el.card, 'pointerleave', function (e) { if (e.pointerType === 'mouse') scheduleClose(); });
    listen(rowsRoot, 'click', function (e) {
      var b = e.target.closest('.v-wall-pouch');
      if (!b) return;
      if (open && open.btn === b && open.by === 'tap') { closeCard(); return; }   // second tap closes
      openCard(b, e.pointerType === 'mouse' ? 'hover' : 'tap');
      if (open) open.by = e.pointerType === 'mouse' ? 'hover' : 'tap';
    });
    listen(document, 'click', function (e) {
      if (open && !e.target.closest('.v-wall-pouch, .v-wall-card')) closeCard();
    });
    listen(document, 'keydown', function (e) {
      if (e.key === 'Escape' && open) { var b = open.btn; closeCard(); b.focus(); }
    });
    listen(window, 'scroll', function () { if (open) closeCard(); }, { passive: true });
    listen(document, 'visibilitychange', updateMarquee);
    listen(window, 'resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (!root) return;
        if (isMobile() !== wasMobile) mount(slotRef);   // row count / sizes change at the breakpoint
        else if (open) placeCard();
      }, 150);
    });
    if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (entries) { onScreen = entries[entries.length - 1].isIntersecting; updateMarquee(); }, { threshold: 0.05 });
      io.observe(root);
      cleanups.push(function () { io.disconnect(); });
    }

    // motion (none under reduced motion: static rows with horizontal swipe scrolling)
    if (reduceMotion.matches || !window.gsap) return Promise.resolve();
    ctx = gsap.context(function () { intro(); marquees(); parallax(); }, root);
    return Promise.resolve();
  }

  function unmount() {
    clearTimeout(resizeTimer); clearTimeout(closeTimer); clearTimeout(cardTimer);
    tweens.forEach(function (t) { t.kill(); }); tweens = [];
    if (ctx) { ctx.revert(); ctx = null; }
    cleanups.forEach(function (fn) { fn(); }); cleanups = [];
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = null; el = {}; rowEls = []; items = []; open = null;
  }

  window.MMHeroes = window.MMHeroes || {};
  window.MMHeroes.wall = { mount: mount, unmount: unmount };
})();
