/* =========================================================
   heroes/stack.js: Design 3 "Flavour Stack"
   - Cluster of tilted pouches in fixed SLOTS; the active one is in front
   - Persistent elements tween to their new slots on every switch (Smart Animate style)
   - Thumbnails, back-pouch click, arrow keys, swipe, auto-advance
   - Same mount(slot) / unmount() API as the other heroes
   - Prefixed CSS: v-stack-* (variants.css)
   ========================================================= */

// HERO_PRODUCTS (and optional HERO_INGREDIENTS) come from hero-products.js. Images are the 800px-tall copies
// of the transparent front PNGs in assets/hero/ already used by Design 2 (originals untouched).

(function () {
  'use strict';

  var AUTO_MS = 6000;
  var MANUAL_HOLD_MS = 10000;
  var SWITCH_S = 0.8;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  // x / y = centre in % of the cluster box; z = stacking order
  var SLOTS_DESKTOP = [
    { x: 52, y: 66, s: 1.00, r: -4, z: 50 },
    { x: 28, y: 44, s: 0.78, r: -14, z: 40 },
    { x: 72, y: 40, s: 0.74, r: 12, z: 40 },
    { x: 44, y: 22, s: 0.60, r: 6, z: 30 },
    { x: 78, y: 18, s: 0.52, r: -10, z: 20 }
  ];
  var SLOTS_MOBILE = [   // compressed horizontally; slots 3 and 4 are hidden
    { x: 50, y: 64, s: 1.00, r: -4, z: 50 },
    { x: 22, y: 42, s: 0.72, r: -14, z: 40 },
    { x: 78, y: 40, s: 0.68, r: 12, z: 40 },
    { x: 50, y: 24, s: 0.50, r: 6, z: 30, hide: true },
    { x: 50, y: 20, s: 0.44, r: -10, z: 20, hide: true }
  ];
  var DECO_SPOTS = ['tl', 'tr', 'bl', 'br'];

  var root = null, ctx = null, tl = null, cleanups = [], items = [], active = 0, ready = false;
  var autoTimer = null, resizeTimer = null, preloadLink = null, swayTween = null, idleTweens = [];
  var hovering = false, onScreen = true, lastAdvance = 0, manualHold = 0;
  var el = {};

  /* ---------- data ---------- */

  function imgFor(slug) { return 'assets/hero/' + slug + '-front-800.png'; }

  function rupees(n) { return '₹' + Number(n).toLocaleString('en-IN'); }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  // PRODUCTS titles are marketing titles ("Authentic Punjabi Rajma Masala"); the pouch name is the dish itself.
  function shortName(p) {
    return p.title.replace(/^(Authentic|Royal|Classic|Homestyle|Rich|Mumbai Street)\s+(Punjabi\s+)?/i, '').replace(/^Dum\s+/i, '');
  }

  function oneLine(d) {
    d = String(d || '');
    var cut = d.indexOf('.');
    return (cut > 20 ? d.slice(0, cut) : d);
  }

  function resolveItems() {
    var list = (typeof PRODUCTS !== 'undefined') ? PRODUCTS : [];
    var deco = (typeof HERO_INGREDIENTS !== 'undefined') ? HERO_INGREDIENTS : {};
    return HERO_PRODUCTS.slice(0, 5).map(function (slug) {
      var p = list.filter(function (x) { return x.id === slug; })[0];
      return p ? {
        slug: slug, name: shortName(p), price: p.price, desc: oneLine(p.desc), src: imgFor(slug),
        deco: (deco[slug] || []).slice(0, 4)
      } : null;
    }).filter(Boolean);
  }

  /* ---------- slots ---------- */

  function isMobile() { return window.innerWidth < 768; }

  function slotOf(i) { var n = items.length; return (((i - active) % n) + n) % n; }

  function posFor(slot) {
    var s = (isMobile() ? SLOTS_MOBILE : SLOTS_DESKTOP)[slot];
    var bw = el.par.offsetWidth, bh = el.par.offsetHeight;
    var pw = items[0].btn.offsetWidth, ph = items[0].btn.offsetHeight;
    return {
      x: (s.x / 100) * bw - pw / 2, y: (s.y / 100) * bh - ph / 2,
      scale: s.s, rotation: s.r, z: s.z, opacity: s.hide ? 0 : 1, show: !s.hide
    };
  }

  function applyA11y(i, p) {
    var b = items[i].btn, on = i === active;
    b.setAttribute('aria-hidden', p.show ? 'false' : 'true');
    b.tabIndex = p.show && !on ? 0 : -1;
    b.style.pointerEvents = p.show && !on ? '' : 'none';
    if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    b.classList.toggle('is-active', on);
  }

  function setLayout() {   // instant, no animation
    items.forEach(function (it, i) {
      var p = posFor(slotOf(i));
      gsap.set(it.btn, { x: p.x, y: p.y, scale: p.scale, rotation: p.rotation, opacity: p.opacity, zIndex: p.z });
      applyA11y(i, p);
    });
    placeRing(false);
  }

  /* ---------- building ---------- */

  function swapBox(cls) {
    return '<span class="v-stack-swap ' + cls + '"><span class="v-stack-swap-t"></span><span class="v-stack-swap-t" aria-hidden="true"></span></span>';
  }

  function build() {
    var pouches = items.map(function (it, i) {
      return '<button type="button" class="v-stack-pouch" data-i="' + i + '" aria-label="Show ' + esc(it.name) + '">' +
        '<span class="v-stack-shadow" aria-hidden="true"></span>' +
        '<span class="v-stack-drop"><span class="v-stack-float"><span class="v-stack-sway">' +
          '<img ' + (i === 0 ? 'src="' + it.src + '" fetchpriority="high"' : 'data-src="' + it.src + '"') +
          ' width="512" height="800" alt="" draggable="false">' +
        '</span></span></span>' +
      '</button>';
    }).join('');

    var thumbs = items.map(function (it, i) {
      return '<button type="button" class="v-stack-thumb" data-thumb="' + i + '" aria-label="Show ' + esc(it.name) + '" aria-pressed="false">' +
        '<img data-src="' + it.src + '" width="26" height="40" alt="">' +
      '</button>';
    }).join('');

    var deco = items.map(function (it, i) {
      return '<span class="v-stack-deco-set" data-set="' + i + '">' + it.deco.map(function (src, k) {
        return '<span class="v-stack-deco-item v-stack-deco-item--' + DECO_SPOTS[k] + '"><span class="v-stack-deco-float">' +
          '<img src="' + esc(src) + '" width="200" height="200" alt="" loading="lazy" draggable="false"></span></span>';
      }).join('') + '</span>';
    }).join('');

    return '<section class="v-stack" data-design="3" aria-roledescription="carousel" aria-label="Featured meals">' +
      '<div class="v-stack-deco" aria-hidden="true">' + deco + '</div>' +
      '<div class="v-stack-inner">' +
        '<div class="v-stack-cluster"><div class="v-stack-par">' + pouches + '</div></div>' +
        '<div class="v-stack-text">' +
          '<h1 class="v-stack-kicker">REAL FOOD. READY IN MINUTES.</h1>' +
          '<p class="v-stack-name">' + swapBox('v-stack-name-box') + '</p>' +
          '<p class="v-stack-tagline">' + swapBox('v-stack-tagline-box') + '</p>' +
          '<p class="v-stack-price">' + swapBox('v-stack-price-box') + '</p>' +
          '<div class="v-stack-picker">' +
            '<div class="v-stack-thumbs" role="group" aria-label="Choose meal">' +
              '<span class="v-stack-ring" aria-hidden="true"></span>' + thumbs +
            '</div>' +
            '<p class="v-stack-count" aria-hidden="true"></p>' +
          '</div>' +
          '<div class="v-stack-actions">' +
            '<button type="button" class="hero-btn hero-btn--primary v-stack-add" data-add=""><img class="v-stack-add-img" src="" width="16" height="25" alt="">Add to cart<span class="v-stack-add-price"></span></button>' +
            '<button type="button" class="hero-btn hero-btn--secondary v-stack-shop">Shop Now</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<span class="v-stack-live" role="status" aria-live="polite"></span>' +
    '</section>';
  }

  function listen(target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    cleanups.push(function () { target.removeEventListener(type, fn, opts); });
  }

  /* ---------- text, thumbs, tint ---------- */

  function swapper(box) {
    var t = box.querySelectorAll('.v-stack-swap-t');
    return { cur: t[0], other: t[1] };
  }

  // Two stacked spans: the old one slides up and out, the new one slides up from below
  function swapText(sw, text, at, dy) {
    var out = sw.cur, inn = sw.other;
    if (out.textContent === text) return;
    inn.textContent = text;
    inn.removeAttribute('aria-hidden'); out.setAttribute('aria-hidden', 'true');
    sw.cur = inn; sw.other = out;
    tl.to(out, { y: -dy, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: function () { out.textContent = ''; } }, at)
      .fromTo(inn, { y: dy, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, at + 0.15);
  }

  function setTextInstant(sw, text) {
    sw.cur.textContent = text; sw.other.textContent = '';
    if (window.gsap) gsap.set([sw.cur, sw.other], { clearProps: 'transform,opacity' });
  }

  function fillStatic() {
    var it = items[active], n = items.length;
    el.add.setAttribute('data-add', it.slug);
    el.add.setAttribute('aria-label', 'Add ' + it.name + ' to cart, ' + rupees(it.price));
    el.addImg.src = it.src;
    el.addPrice.textContent = ' · ' + rupees(it.price);
    el.count.textContent = (active + 1) + ' / ' + n;
    el.thumbs.forEach(function (t, i) {
      t.setAttribute('aria-pressed', i === active ? 'true' : 'false');
      t.classList.toggle('is-active', i === active);
    });
    root.style.setProperty('--v-stack-tint', 'var(--tint-' + it.slug + ')');
  }

  function announce() {
    var it = items[active];
    el.live.textContent = 'Showing ' + it.name + ', ' + rupees(it.price);
  }

  function tintOf(slug) {
    return getComputedStyle(document.documentElement).getPropertyValue('--tint-' + slug).trim();
  }

  function ringX() {
    var t = el.thumbs[active];
    return t ? t.offsetLeft + t.offsetWidth / 2 - el.ring.offsetWidth / 2 : 0;
  }

  function placeRing() { if (window.gsap) gsap.set(el.ring, { x: ringX() }); }

  /* ---------- switching ---------- */

  function goTo(next, manual) {
    var n = items.length;
    next = ((next % n) + n) % n;
    if (next === active) return;
    var animated = !reduceMotion.matches && !!window.gsap;
    if (!ready && animated) return;   // intro still playing
    var oldSlots = items.map(function (it, i) { return slotOf(i); });
    var prev = active;
    active = next;
    lastAdvance = performance.now();
    if (manual) manualHold = lastAdvance + MANUAL_HOLD_MS;
    fillStatic();
    announce();
    var it = items[active];
    if (el.thumbs[active] && el.thumbs[active].scrollIntoView && isMobile()) {
      el.thumbs[active].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: animated ? 'smooth' : 'auto' });
    }

    if (!animated) {   // instant crossfade
      items.forEach(function (x, i) { applyA11y(i, posFor(slotOf(i))); });
      if (window.gsap) {
        setLayout();
        gsap.set(root, { backgroundColor: tintOf(it.slug) });
        gsap.fromTo([el.cluster, el.textSwaps], { opacity: 0.4 }, { opacity: 1, duration: 0.2, clearProps: 'opacity' });
      }
      setTextInstant(el.name, it.name); setTextInstant(el.tagline, it.desc); setTextInstant(el.price, rupees(it.price));
      showDeco(prev, false); showDeco(active, true);
      return;
    }

    ctx.add(function () {
      if (tl) tl.kill();
      stopSway(prev);
      tl = gsap.timeline({ defaults: { overwrite: 'auto' }, onComplete: function () { tl = null; startSway(); } });
      var bw = el.par.offsetWidth;

      items.forEach(function (x, i) {
        var s = slotOf(i), o = oldSlots[i], p = posFor(s);
        applyA11y(i, p);
        tl.set(x.btn, { willChange: 'transform, opacity' }, 0);
        var wrap = (o === 0 && s === n - 1) || (o === n - 1 && s === 0);
        if (wrap) {
          // front <-> last slot: bend away from the text column and dip in opacity instead of a straight flight
          var from = { x: gsap.getProperty(x.btn, 'x'), y: gsap.getProperty(x.btn, 'y'), scale: gsap.getProperty(x.btn, 'scale') };
          tl.to(x.btn, { keyframes: [
            { x: Math.min(from.x, p.x) - bw * 0.1, y: (from.y + p.y) / 2, scale: Math.min(from.scale, p.scale) * 0.9, opacity: 0.55, rotation: (p.rotation - 4) / 2, duration: SWITCH_S / 2, ease: 'power2.in' },
            { x: p.x, y: p.y, scale: p.scale, rotation: p.rotation, opacity: p.opacity, duration: SWITCH_S / 2, ease: 'power2.out' }
          ] }, 0);
        } else {
          tl.to(x.btn, { x: p.x, y: p.y, scale: p.scale, rotation: p.rotation, opacity: p.opacity, duration: SWITCH_S, ease: 'power3.inOut' }, 0);
        }
        // the new front pouch jumps to the top early; everyone else restacks at the midpoint
        if (s === 0) tl.set(x.btn, { zIndex: p.z + 1 }, 0.1).set(x.btn, { zIndex: p.z }, SWITCH_S);
        else tl.set(x.btn, { zIndex: p.z }, SWITCH_S / 2);
        tl.set(x.btn, { willChange: 'auto' }, SWITCH_S);
      });

      tl.to(root, { backgroundColor: tintOf(it.slug), duration: 0.6, ease: 'power2.inOut' }, 0);
      swapText(el.name, it.name, 0, 30);
      swapText(el.tagline, it.desc, 0, 30);
      swapText(el.price, rupees(it.price), 0, 0);
      tl.to(el.ring, { x: ringX(), duration: SWITCH_S, ease: 'power3.inOut' }, 0);
      decoSwitch(prev, active);
    });
  }

  /* ---------- decorative ingredients ---------- */

  function decoItems(i) { return el.decoSets[i] ? [].slice.call(el.decoSets[i].querySelectorAll('.v-stack-deco-item')) : []; }

  function showDeco(i, on) {
    var list = decoItems(i);
    if (!list.length) return;
    if (window.gsap) gsap.set(list, { opacity: on ? 1 : 0, scale: 1, rotation: 0 });
    el.decoSets[i].classList.toggle('is-on', on);
  }

  function decoSwitch(from, to) {
    var a = decoItems(from), b = decoItems(to);
    if (el.decoSets[to]) el.decoSets[to].classList.add('is-on');
    if (a.length) tl.to(a, { scale: 0.6, rotation: 18, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: function () {
      if (el.decoSets[from] && from !== active) el.decoSets[from].classList.remove('is-on');
    } }, 0);
    if (b.length) tl.fromTo(b, { scale: 0.6, rotation: -12, opacity: 0 }, {
      keyframes: [{ scale: 1.08, rotation: 2, opacity: 1, duration: 0.38, ease: 'power2.out' }, { scale: 1, rotation: 0, duration: 0.12, ease: 'power1.out' }],
      stagger: 0.06
    }, 0.3);
  }

  /* ---------- motion ---------- */

  function loadLazy(scope) {
    [].slice.call(scope.querySelectorAll('img[data-src]')).forEach(function (img) {
      img.src = img.getAttribute('data-src');
      img.removeAttribute('data-src');
    });
  }

  function intro() {
    var order = items.map(function (it, i) { return i; })
      .filter(function (i) { return posFor(slotOf(i)).show; })
      .sort(function (a, b) { return slotOf(b) - slotOf(a); });   // back-most first, front last
    order.forEach(function (i) { if (i !== active) loadLazy(items[i].btn); });

    root.classList.add('is-intro');
    var drops = items.map(function (it) { return it.drop; });
    gsap.set(drops, { transformOrigin: '50% 100%', willChange: 'transform' });
    tl = gsap.timeline({ onComplete: function () {
      root.classList.remove('is-intro');
      gsap.set(drops, { willChange: 'auto' });
      tl = null;
      loadLazy(root);
      startIdle();
      ready = true;
      lastAdvance = performance.now();
    } });

    tl.from([el.kicker, el.nameP, el.taglineP], { opacity: 0, y: 40, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, 0);

    order.forEach(function (i, k) {
      var it = items[i], t = 0.3 + k * 0.12, land = t + 0.8;
      tl.from(it.drop, { y: '-120vh', rotation: -12, duration: 0.8, ease: 'power2.in' }, t)
        .from(it.shadow, { scale: 0.3, opacity: 0, duration: 0.8, ease: 'power2.in' }, t)
        .to(it.drop, { scaleY: 0.9, scaleX: 1.06, duration: 0.1, ease: 'power1.out' }, land)
        .to(it.drop, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1, 0.45)' }, land + 0.1);
    });
    var landed = 0.3 + (order.length - 1) * 0.12 + 0.8;

    var deco = decoItems(active);
    if (deco.length) tl.fromTo(deco, { scale: 0.6, rotation: -12, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.5, stagger: 0.4, ease: 'power2.out' }, landed - 0.3);
    tl.from([el.priceP, el.picker, el.actions], { opacity: 0, y: 14, duration: 0.4, stagger: 0.1, ease: 'power2.out' }, landed - 0.2);
  }

  function startIdle() {
    items.forEach(function (it, i) {
      var tw = gsap.fromTo(it.float, { y: -6 }, { y: 6, duration: 3 + (i % 3) * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      tw.progress((0.3 + i * 0.23) % 1);
      idleTweens.push(tw);
    });
    [].slice.call(root.querySelectorAll('.v-stack-deco-float')).forEach(function (f, k) {
      var tw = gsap.fromTo(f, { y: -6 }, { y: 6, duration: 4 + (k % 5) * 0.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      tw.progress((k * 0.31) % 1);
      idleTweens.push(tw);
    });
    startSway();
    if (finePointer.matches && !isMobile()) startParallax();
  }

  function startSway() {
    if (reduceMotion.matches || !ready || !items[active]) return;
    if (swayTween) swayTween.kill();
    swayTween = gsap.fromTo(items[active].sway, { rotation: -1.5 }, { rotation: 1.5, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    swayTween.progress(0.5);
  }

  function stopSway(i) {
    if (swayTween) { swayTween.kill(); swayTween = null; }
    if (items[i]) gsap.to(items[i].sway, { rotation: 0, duration: 0.4, ease: 'power2.out' });
  }

  function startParallax() {
    var c = { x: gsap.quickTo(el.par, 'x', { duration: 0.6, ease: 'power3.out' }),
              y: gsap.quickTo(el.par, 'y', { duration: 0.6, ease: 'power3.out' }),
              r: gsap.quickTo(el.par, 'rotation', { duration: 0.6, ease: 'power3.out' }) };
    var d = { x: gsap.quickTo(el.deco, 'x', { duration: 0.8, ease: 'power3.out' }),
              y: gsap.quickTo(el.deco, 'y', { duration: 0.8, ease: 'power3.out' }) };
    function move(e) {
      if ((window.scrollY || 0) > 10) return;
      var r = root.getBoundingClientRect();
      var nx = ((e.clientX - r.left) / r.width) * 2 - 1, ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      c.x(nx * 10); c.y(ny * 10); c.r(nx * 2);
      d.x(nx * 22); d.y(ny * 22);
    }
    function leave() { c.x(0); c.y(0); c.r(0); d.x(0); d.y(0); }
    listen(root, 'pointermove', move);
    listen(root, 'pointerleave', leave);
  }

  function scrollExit() {
    if (!window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.to([el.cluster, el.text], {
      y: -50, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  /* ---------- auto-advance ---------- */

  function autoTick() {
    if (reduceMotion.matches || !ready) return;
    var now = performance.now();
    if (document.hidden || !onScreen || hovering || now < manualHold) { lastAdvance = now; return; }
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
    preloadLink = document.createElement('link');   // preload the active product's image
    preloadLink.rel = 'preload'; preloadLink.as = 'image'; preloadLink.href = items[0].src;
    document.head.appendChild(preloadLink);

    el = {
      deco: root.querySelector('.v-stack-deco'),
      decoSets: [].slice.call(root.querySelectorAll('.v-stack-deco-set')),
      cluster: root.querySelector('.v-stack-cluster'),
      par: root.querySelector('.v-stack-par'),
      text: root.querySelector('.v-stack-text'),
      kicker: root.querySelector('.v-stack-kicker'),
      nameP: root.querySelector('.v-stack-name'),
      taglineP: root.querySelector('.v-stack-tagline'),
      priceP: root.querySelector('.v-stack-price'),
      name: swapper(root.querySelector('.v-stack-name-box')),
      tagline: swapper(root.querySelector('.v-stack-tagline-box')),
      price: swapper(root.querySelector('.v-stack-price-box')),
      textSwaps: [].slice.call(root.querySelectorAll('.v-stack-swap')),
      picker: root.querySelector('.v-stack-picker'),
      thumbsWrap: root.querySelector('.v-stack-thumbs'),
      thumbs: [].slice.call(root.querySelectorAll('.v-stack-thumb')),
      ring: root.querySelector('.v-stack-ring'),
      count: root.querySelector('.v-stack-count'),
      actions: root.querySelector('.v-stack-actions'),
      add: root.querySelector('.v-stack-add'),
      addImg: root.querySelector('.v-stack-add-img'),
      addPrice: root.querySelector('.v-stack-add-price'),
      live: root.querySelector('.v-stack-live')
    };
    [].slice.call(root.querySelectorAll('.v-stack-pouch')).forEach(function (b, i) {
      var it = items[i];
      it.btn = b;
      it.shadow = b.querySelector('.v-stack-shadow');
      it.drop = b.querySelector('.v-stack-drop');
      it.float = b.querySelector('.v-stack-float');
      it.sway = b.querySelector('.v-stack-sway');
      var img = b.querySelector('img');
      img.addEventListener('load', function () { checkTransparent(img, it, b); });
      img.addEventListener('error', function () { checkTransparent(img, it, b); });
      if (img.complete && img.getAttribute('src')) checkTransparent(img, it, b);
    });

    fillStatic();
    var first = items[0];
    setTextInstant(el.name, first.name); setTextInstant(el.tagline, first.desc); setTextInstant(el.price, rupees(first.price));
    root.style.backgroundColor = tintOf(first.slug) || '';
    showDeco(0, true);

    // events
    listen(el.cluster, 'click', function (e) {
      var pouch = e.target.closest('.v-stack-pouch');
      if (pouch) goTo(+pouch.dataset.i, true);
    });
    listen(el.thumbsWrap, 'click', function (e) {
      var t = e.target.closest('[data-thumb]');
      if (t) goTo(+t.dataset.thumb, true);
    });
    listen(root.querySelector('.v-stack-shop'), 'click', function () {
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
    listen(el.cluster, 'touchstart', function (e) { var t = e.touches[0]; sx = t.clientX; sy = t.clientY; tracking = true; }, { passive: true });
    listen(el.cluster, 'touchend', function (e) {
      if (!tracking) return; tracking = false;
      var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) goTo(active + (dx < 0 ? 1 : -1), true);
    }, { passive: true });
    listen(root, 'pointerenter', function (e) { if (e.pointerType === 'mouse') hovering = true; });
    listen(root, 'pointerleave', function () { hovering = false; });
    listen(window, 'resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (!root || !window.gsap) return;
        if (tl && ready) { tl.progress(1); }
        setLayout();
      }, 120);
    });
    if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (entries) { onScreen = entries[entries.length - 1].isIntersecting; }, { threshold: 0.1 });
      io.observe(root);
      cleanups.push(function () { io.disconnect(); });
    }
    autoTimer = setInterval(autoTick, 500);

    // motion
    if (!window.gsap) { root.classList.add('no-gsap'); loadLazy(root); ready = true; return Promise.resolve(); }
    setLayout();
    if (reduceMotion.matches) { loadLazy(root); ready = true; return Promise.resolve(); }
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
    if (!bad || btn.querySelector('.v-stack-placeholder')) return;
    console.warn('[stack] ' + it.slug + ': image is not a transparent front PNG; showing placeholder');
    img.style.display = 'none';
    var ph = document.createElement('span');
    ph.className = 'v-stack-placeholder';
    ph.textContent = it.name + ': IMAGE NEEDS TRANSPARENT PNG';
    img.parentNode.appendChild(ph);
  }

  function unmount() {
    clearInterval(autoTimer); autoTimer = null;
    clearTimeout(resizeTimer);
    if (tl) { tl.kill(); tl = null; }
    if (swayTween) { swayTween.kill(); swayTween = null; }
    idleTweens.forEach(function (t) { t.kill(); }); idleTweens = [];
    if (ctx) { ctx.revert(); ctx = null; }
    if (window.gsap) {
      items.forEach(function (it) { if (it.btn) gsap.killTweensOf([it.btn, it.sway, it.float, it.drop]); });
      if (el.par) gsap.killTweensOf([el.par, el.deco, el.ring, root]);
    }
    cleanups.forEach(function (fn) { fn(); }); cleanups = [];
    if (preloadLink && preloadLink.parentNode) preloadLink.parentNode.removeChild(preloadLink);
    preloadLink = null;
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = null; el = {}; items = []; ready = false;
  }

  window.MMHeroes = window.MMHeroes || {};
  window.MMHeroes.stack = { mount: mount, unmount: unmount };
})();
