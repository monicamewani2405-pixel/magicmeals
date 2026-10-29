/* =========================================================
   heroes/switcher.js: Design 2 "Range Switcher"
   - 3 to 5 pouches positioned by circular offset from the active one
   - Click/tap neighbour, arrow keys, swipe, dots, auto-advance
   - Same mount(slot) / unmount() API as heroes/classic.js
   - Prefixed CSS: v-switcher-* (variants.css)
   ========================================================= */

// HERO_PRODUCTS comes from hero-products.js (shared with Design 3). Images are 800px-tall copies of the
// transparent front PNGs in assets/hero/ (originals untouched).

(function () {
  'use strict';

  var AUTO_MS = 6000;
  var MANUAL_HOLD_MS = 6000;   // short pause after a manual switch, then rotation continues
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  var root = null, ctx = null, cleanups = [], items = [], active = 0, ready = false;
  var autoTimer = null, resizeTimer = null, floatTweens = [], preloadLink = null;
  var hovering = false, onScreen = true, lastAdvance = 0, manualHold = 0, infoToken = 0;
  var el = {};

  /* ---------- data ---------- */

  function imgFor(slug) { return 'assets/hero/' + slug + '-front-800.png'; }

  function rupees(n) { return '\u20B9' + Number(n).toLocaleString('en-IN'); }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  function resolveItems() {
    var list = (typeof PRODUCTS !== 'undefined') ? PRODUCTS : [];
    return HERO_PRODUCTS.map(function (slug) {
      var p = list.filter(function (x) { return x.id === slug; })[0];
      return p ? { slug: slug, name: shortName(p), price: p.price, desc: oneLine(p.desc), src: imgFor(slug) } : null;
    }).filter(Boolean);
  }

  // PRODUCTS titles are marketing titles ("Authentic Punjabi Rajma Masala"); the pouch name is the dish itself.
  function shortName(p) {
    return p.title.replace(/^(Authentic|Royal|Classic|Homestyle)\s+(Punjabi\s+)?/i, '').replace(/^Dum\s+/i, '');
  }

  function oneLine(d) {
    d = String(d || '');
    var cut = d.indexOf('.');
    return (cut > 20 ? d.slice(0, cut) : d);
  }

  /* ---------- layout by circular offset ---------- */

  function isMobile() { return window.innerWidth < 768; }

  function offsetOf(i) {
    var n = items.length;
    var d = (((i - active) % n) + n) % n;
    return d > n / 2 ? d - n : d;
  }

  function posFor(offset) {
    var n = items.length, mobile = isMobile();
    var stageW = el.stage ? el.stage.offsetWidth : window.innerWidth;
    var s = offset < 0 ? -1 : 1, a = Math.abs(offset);
    var x1 = mobile ? window.innerWidth * 0.36 : stageW * 0.26;
    var x2 = stageW * 0.42;
    if (offset === 0) return { x: 0, scale: 1, rotation: 0, opacity: 1, z: 5, show: true };
    if (a === 1) return { x: s * x1, scale: mobile ? 0.6 : 0.7, rotation: s * 8, opacity: 1, z: 4, show: true };
    if (a === 2 && n >= 5 && !mobile) return { x: s * x2, scale: 0.5, rotation: s * 12, opacity: 0.9, z: 3, show: true };
    return { x: s * (mobile ? x1 : x2), scale: 0.5, rotation: s * 12, opacity: 0, z: 1, show: false };
  }

  function applyA11y(i, p) {
    var b = items[i].btn;
    b.setAttribute('aria-hidden', p.show ? 'false' : 'true');
    b.tabIndex = p.show ? 0 : -1;
    b.style.pointerEvents = p.show ? '' : 'none';
    if (i === active) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    b.classList.toggle('is-active', i === active);
  }

  function setLayout() {   // instant, no animation
    items.forEach(function (it, i) {
      var p = posFor(offsetOf(i));
      if (window.gsap) gsap.set(it.btn, { x: p.x, scale: p.scale, rotation: p.rotation, opacity: p.opacity, zIndex: p.z });
      else it.btn.style.cssText += ';transform:translateX(' + p.x + 'px) rotate(' + p.rotation + 'deg) scale(' + p.scale + ');opacity:' + p.opacity + ';z-index:' + p.z;
      applyA11y(i, p);
    });
  }

  /* ---------- building ---------- */

  function build() {
    var stageBtns = items.map(function (it, i) {
      return '<button type="button" class="v-switcher-pouch" data-i="' + i + '" aria-label="Show ' + esc(it.name) + '">' +
        '<span class="v-switcher-shadow" aria-hidden="true"></span>' +
        '<span class="v-switcher-drop"><span class="v-switcher-par"><span class="v-switcher-float">' +
          '<span class="v-switcher-steam" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>' +
          '<img src="' + it.src + '" width="512" height="800" alt="" draggable="false"' + (i === 0 ? ' fetchpriority="high"' : '') + '>' +
        '</span></span></span>' +
      '</button>';
    }).join('');

    var dots = items.map(function (it, i) {
      return '<button type="button" class="v-switcher-dot" data-dot="' + i + '" aria-label="Show ' + esc(it.name) + '" aria-pressed="false"></button>';
    }).join('');

    return '<section class="v-switcher" data-design="2" aria-roledescription="carousel" aria-label="Featured meals">' +
      '<h1 class="v-switcher-headline"><span class="v-switcher-line">REAL FOOD.</span> <span class="v-switcher-line">READY IN MINUTES.</span></h1>' +
      '<div class="v-switcher-stage">' +
        '<div class="v-switcher-glow" aria-hidden="true"></div>' +
        '<button type="button" class="v-switcher-arrow v-switcher-arrow--prev" aria-label="Previous meal"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg></button>' +
        stageBtns +
        '<button type="button" class="v-switcher-arrow v-switcher-arrow--next" aria-label="Next meal"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg></button>' +
      '</div>' +
      '<div class="v-switcher-info" aria-live="polite">' +
        '<p class="v-switcher-title"><span class="v-switcher-name"></span></p>' +
        '<p class="v-switcher-desc"></p>' +
      '</div>' +
      '<div class="v-switcher-actions">' +
        '<button type="button" class="hero-btn hero-btn--primary v-switcher-add" data-add=""><img class="v-switcher-add-img" src="" width="16" height="25" alt="">Add to cart</button>' +
        '<button type="button" class="hero-btn hero-btn--primary v-switcher-shop" data-scroll-to="best-sellers">Shop Now</button>' +
      '</div>' +
      '<div class="v-switcher-dots" role="group" aria-label="Choose meal">' + dots + '</div>' +
    '</section>';
  }

  function listen(target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    cleanups.push(function () { target.removeEventListener(type, fn, opts); });
  }

  /* ---------- info, dots, tint ---------- */

  function fillInfo() {
    var it = items[active];
    el.name.textContent = it.name;
    el.desc.textContent = it.desc;
    el.add.setAttribute('data-add', it.slug);
    el.add.setAttribute('aria-label', 'Add ' + it.name + ' to cart');
    el.addImg.src = it.src;
  }

  function markDots() {
    el.dots.forEach(function (d, i) {
      var on = i === active;
      d.setAttribute('aria-pressed', on ? 'true' : 'false');
      d.classList.toggle('is-active', on);
    });
  }

  function setTint() {
    root.style.setProperty('--v-sw-tint', 'var(--tint-' + items[active].slug + ')');
  }

  /* ---------- switching ---------- */

  function goTo(next, manual) {
    var n = items.length;
    next = ((next % n) + n) % n;
    if (next === active) return;
    if (!ready && !reduceMotion.matches && window.gsap) return;   // intro still playing
    var old = items.map(function (it, i) { return offsetOf(i); });
    active = next;
    lastAdvance = performance.now();
    if (manual) manualHold = lastAdvance + MANUAL_HOLD_MS;
    setTint();
    markDots();

    var instant = reduceMotion.matches || !window.gsap;
    items.forEach(function (it, i) {
      var no = offsetOf(i), p = posFor(no);
      applyA11y(i, p);
      if (instant) { setLayoutOne(i, p); return; }
      var crossing = old[i] * no < 0;   // wrapped from one side to the other: fade, never fly across
      ctx.add(function () {
        gsap.killTweensOf(it.btn);
        gsap.set(it.btn, { willChange: 'transform, opacity', zIndex: p.z });
        var done = function () { gsap.set(it.btn, { willChange: 'auto' }); };
        if (crossing) {
          gsap.timeline({ onComplete: done })
            .to(it.btn, { opacity: 0, duration: 0.25, ease: 'power1.out' })
            .set(it.btn, { x: p.x, scale: p.scale, rotation: p.rotation })
            .to(it.btn, { opacity: p.opacity, duration: 0.35, ease: 'power1.out' }, 0.4);
        } else {
          gsap.to(it.btn, { x: p.x, scale: p.scale, rotation: p.rotation, opacity: p.opacity, duration: 0.7, ease: 'power3.out', onComplete: done });
        }
      });
    });

    var token = ++infoToken;
    if (instant) { fillInfo(); return; }
    ctx.add(function () {
      gsap.killTweensOf(el.info);
      gsap.to(el.info, { opacity: 0, duration: 0.18, onComplete: function () {
        if (token !== infoToken) return;
        fillInfo();
        gsap.to(el.info, { opacity: 1, duration: 0.3 });
      } });
    });
  }

  function setLayoutOne(i, p) {
    if (window.gsap) gsap.set(items[i].btn, { x: p.x, scale: p.scale, rotation: p.rotation, opacity: p.opacity, zIndex: p.z });
  }

  /* ---------- motion ---------- */

  function intro() {
    var main = items[active];
    var neighbours = items.map(function (it, i) { return i; })
      .filter(function (i) { return i !== active && posFor(offsetOf(i)).show; })
      .sort(function (a, b) { return Math.abs(offsetOf(a)) - Math.abs(offsetOf(b)) || offsetOf(a) - offsetOf(b); });

    root.classList.add('is-intro');
    gsap.set(el.stage.querySelectorAll('.v-switcher-drop'), { transformOrigin: '50% 100%', willChange: 'transform' });
    neighbours.forEach(function (i) { gsap.set(items[i].btn, { x: 0, opacity: 0 }); });

    var tl = gsap.timeline({ onComplete: function () {
      root.classList.remove('is-intro');
      gsap.set(el.stage.querySelectorAll('.v-switcher-drop'), { willChange: 'auto' });
      ctx.add(startIdle);
      ready = true;
      lastAdvance = performance.now();
    } });

    tl.from(el.headline, { opacity: 0, y: 40, duration: 0.6, ease: 'power2.out' }, 0)
      // active pouch: fall, squash, elastic recovery, wobble; shadow grows with it
      .from(main.drop, { y: '-120vh', rotation: -12, duration: 0.9, ease: 'power2.in' }, 0.3)
      .from(main.shadow, { scale: 0.35, opacity: 0.08, duration: 0.9, ease: 'power2.in' }, 0.3)
      .to(main.drop, { scaleY: 0.88, scaleX: 1.08, duration: 0.12, ease: 'power1.out' }, 1.2)
      .to(main.shadow, { scaleX: 1.12, scaleY: 0.9, duration: 0.12, ease: 'power1.out' }, 1.2)
      .to(main.drop, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' }, 1.32)
      .to(main.shadow, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' }, 1.32)
      .to(main.drop, { keyframes: [{ rotation: -3, duration: 0.15 }, { rotation: 2, duration: 0.15 }, { rotation: -1, duration: 0.15 }, { rotation: 0, duration: 0.15 }], ease: 'sine.inOut' }, 1.32);

    // neighbours: drop in with a 0.15s stagger while spreading out to their positions
    neighbours.forEach(function (i, k) {
      var it = items[i], p = posFor(offsetOf(i)), t = 1.0 + k * 0.15;
      tl.set(it.btn, { opacity: p.opacity }, t)
        .from(it.drop, { y: '-120vh', rotation: -12, duration: 0.8, ease: 'power2.in' }, t)
        .from(it.shadow, { scale: 0.35, opacity: 0.08, duration: 0.8, ease: 'power2.in' }, t)
        .to(it.btn, { x: p.x, duration: 0.8, ease: 'power3.out' }, t);
    });

    // text, dots and buttons last
    tl.from([el.info, el.actions, el.dotsWrap], { opacity: 0, y: 14, duration: 0.4, stagger: 0.1, ease: 'power2.out' }, 1.7);
  }

  function startIdle() {
    items.forEach(function (it, i) {
      var tw = gsap.fromTo(it.float, { y: -8 }, { y: 8, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      tw.progress((0.5 + i * 0.17) % 1);   // different phase per pouch
      floatTweens.push(tw);
    });
    if (finePointer.matches) startParallax();
  }

  function startParallax() {
    var q = items.map(function (it) {
      return {
        x: gsap.quickTo(it.par, 'x', { duration: 0.6, ease: 'power3.out' }),
        y: gsap.quickTo(it.par, 'y', { duration: 0.6, ease: 'power3.out' }),
        r: gsap.quickTo(it.par, 'rotation', { duration: 0.6, ease: 'power3.out' })
      };
    });
    function depth(i) { var a = Math.abs(offsetOf(i)); return a === 0 ? 1 : a === 1 ? 0.5 : 0.3; }
    function move(e) {
      if ((window.scrollY || 0) > 10) return;
      var r = root.getBoundingClientRect();
      var nx = ((e.clientX - r.left) / r.width) * 2 - 1, ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      q.forEach(function (f, i) { var d = depth(i); f.x(nx * 12 * d); f.y(ny * 12 * d); f.r(nx * 4 * d); });
    }
    function leave() { q.forEach(function (f) { f.x(0); f.y(0); f.r(0); }); }
    listen(root, 'pointermove', move);
    listen(root, 'pointerleave', leave);
  }

  function scrollExit() {
    if (!window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.to(el.stage, {
      y: -60, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  /* ---------- auto-advance ---------- */

  function autoTick() {
    if (reduceMotion.matches || !ready) return;
    var now = performance.now();
    if (document.hidden || !onScreen || now < manualHold) { lastAdvance = now; return; }
    if (now - lastAdvance >= AUTO_MS) goTo(active + 1, false);
  }

  /* ---------- module API ---------- */

  function mount(slot) {
    unmount();
    items = resolveItems();
    if (!items.length) { slot.innerHTML = ''; return Promise.resolve(); }
    active = 0; ready = false; hovering = false; onScreen = true;
    lastAdvance = performance.now(); manualHold = 0;

    slot.innerHTML = build();
    root = slot.firstElementChild;
    var mainLink = document.createElement('link');   // preload the active product's image
    mainLink.rel = 'preload'; mainLink.as = 'image'; mainLink.href = items[0].src;
    document.head.appendChild(mainLink);
    preloadLink = mainLink;

    el = {
      headline: root.querySelector('.v-switcher-headline'),
      stage: root.querySelector('.v-switcher-stage'),
      info: root.querySelector('.v-switcher-info'),
      name: root.querySelector('.v-switcher-name'),
      desc: root.querySelector('.v-switcher-desc'),
      actions: root.querySelector('.v-switcher-actions'),
      add: root.querySelector('.v-switcher-add'),
      addImg: root.querySelector('.v-switcher-add-img'),
      dotsWrap: root.querySelector('.v-switcher-dots'),
      dots: [].slice.call(root.querySelectorAll('.v-switcher-dot'))
    };
    [].slice.call(root.querySelectorAll('.v-switcher-pouch')).forEach(function (b, i) {
      items[i].btn = b;
      items[i].shadow = b.querySelector('.v-switcher-shadow');
      items[i].drop = b.querySelector('.v-switcher-drop');
      items[i].par = b.querySelector('.v-switcher-par');
      items[i].float = b.querySelector('.v-switcher-float');
      var img = b.querySelector('img');
      img.addEventListener('load', function () { checkTransparent(img, items[i], b); });
      if (img.complete) checkTransparent(img, items[i], b);
    });

    fillInfo(); markDots(); setTint();

    // events
    listen(el.stage, 'click', function (e) {
      var pouch = e.target.closest('.v-switcher-pouch');
      if (pouch) { goTo(+pouch.dataset.i, true); return; }
      if (e.target.closest('.v-switcher-arrow--prev')) goTo(active - 1, true);
      else if (e.target.closest('.v-switcher-arrow--next')) goTo(active + 1, true);
    });
    listen(el.dotsWrap, 'click', function (e) {
      var d = e.target.closest('[data-dot]');
      if (d) goTo(+d.dataset.dot, true);
    });
    listen(root.querySelector('.v-switcher-shop'), 'click', function () {
      var t = document.getElementById('best-sellers');
      if (t) t.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
    });
    listen(document, 'keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      var t = e.target;
      if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
      if (!onScreen || e.ctrlKey || e.metaKey || e.altKey) return;
      goTo(active + (e.key === 'ArrowRight' ? 1 : -1), true);
    });
    var sx = 0, sy = 0, tracking = false;
    listen(el.stage, 'touchstart', function (e) { var t = e.touches[0]; sx = t.clientX; sy = t.clientY; tracking = true; }, { passive: true });
    listen(el.stage, 'touchend', function (e) {
      if (!tracking) return; tracking = false;
      var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) goTo(active + (dx < 0 ? 1 : -1), true);
    }, { passive: true });
    listen(root, 'pointerenter', function (e) { if (e.pointerType === 'mouse') hovering = true; });
    listen(root, 'pointerleave', function () { hovering = false; });
    listen(window, 'resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { if (root && window.gsap) setLayout(); }, 120);
    });
    if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (entries) { onScreen = entries[entries.length - 1].isIntersecting; }, { threshold: 0.1 });
      io.observe(root);
      cleanups.push(function () { io.disconnect(); });
    }
    autoTimer = setInterval(autoTick, 500);

    // motion
    if (!window.gsap) { setLayout(); ready = true; return Promise.resolve(); }
    setLayout();
    if (reduceMotion.matches) { ready = true; return Promise.resolve(); }
    ctx = gsap.context(function () { intro(); scrollExit(); }, root);
    return Promise.resolve();
  }

  // Non-transparent or missing art is replaced by a labelled placeholder (never edited or invented)
  function checkTransparent(img, it, btn) {
    var bad = img.naturalWidth === 0;
    if (!bad) {
      try {
        var c = document.createElement('canvas'); c.width = 8; c.height = 8;
        var g = c.getContext('2d'); g.drawImage(img, 0, 0, 8, 8);
        var d = g.getImageData(0, 0, 8, 8).data;
        bad = [0, 7, 56, 63].every(function (px) { return d[px * 4 + 3] > 200; });
      } catch (e) { /* cross-origin: assume fine */ }
    }
    if (!bad || btn.querySelector('.v-switcher-placeholder')) return;
    console.warn('[switcher] ' + it.slug + ': image is not a transparent front PNG; showing placeholder');
    img.style.display = 'none';
    var ph = document.createElement('span');
    ph.className = 'v-switcher-placeholder';
    ph.textContent = it.name + ' (image needed)';
    img.parentNode.appendChild(ph);
  }

  function unmount() {
    clearInterval(autoTimer); autoTimer = null;
    clearTimeout(resizeTimer);
    infoToken++;
    floatTweens.forEach(function (t) { t.kill(); }); floatTweens = [];
    if (ctx) { ctx.revert(); ctx = null; }
    cleanups.forEach(function (fn) { fn(); }); cleanups = [];
    if (preloadLink && preloadLink.parentNode) preloadLink.parentNode.removeChild(preloadLink);
    preloadLink = null;
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = null; el = {}; items = []; ready = false;
  }

  window.MMHeroes = window.MMHeroes || {};
  window.MMHeroes.switcher = { mount: mount, unmount: unmount };
})();
