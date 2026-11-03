/* =========================================================
   pdp/pdp-scene.js: product-page prototype (3-column layout + styled 3D "set").
   Public API: window.PdpProto = { mount(root, productId) -> boolean, unmount() }.
   main.js calls mount() after it renders the product view and unmount() before every re-render.
   Needs window.PDP_SCENES (pdp-data.js) and, for the 3D link, window.pouchViewer (PDP hook in main.js).
   Animates only transform and opacity. Everything it creates is torn down in unmount().
   ========================================================= */
(function () {
  'use strict';

  var MQ_MULTI = '(min-width: 768px)';          // two or three columns (stage sticky)
  var MQ_THREE = '(min-width: 992px)';
  var MQ_PHONE = '(max-width: 767px)';
  var MQ_RM = '(prefers-reduced-motion: reduce)';
  var IDLE_MS = 4000;                           // scroll-linked rotation waits this long after the user touches the pouch

  var S = null;                                  // live mount state, null when unmounted

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function mm(q) { return window.matchMedia && window.matchMedia(q).matches; }
  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
  function fill(str, min) { return String(str).replace('{min}', min); }

  var ICON_ATTR = 'width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  var FACT_ICONS = {
    snow:  '<svg ' + ICON_ATTR + '><path d="M12 2v20M4.9 6l14.2 12M19.1 6 4.9 18M9 3.5l3 2.5 3-2.5M9 20.5l3-2.5 3 2.5"/></svg>',
    clock: '<svg ' + ICON_ATTR + '><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    check: '<svg ' + ICON_ATTR + '><circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16 9.5"/></svg>',
    leaf:  '<svg ' + ICON_ATTR + '><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.4 5-6"/></svg>'
  };

  function prepMinutes(cfg, slug) {
    if (cfg.prepMinutes) return cfg.prepMinutes;       // the number printed on this product's own pack
    try { if (typeof sceneFor === 'function') { var sc = sceneFor(slug); if (sc && sc.prepMinutes) return sc.prepMinutes; } } catch (e) { /* fall through */ }
    return cfg.prepMinutesFallback || 5;
  }

  /* ---------- builders ---------- */

  function buildChips(cfg, min) {
    if (!cfg.showChips) return '';
    function group(list, face) {
      return list.map(function (c) {
        var pos = (c.slot.left != null ? 'left:' + c.slot.left + '%;' : 'right:' + c.slot.right + '%;') + 'top:' + c.slot.top + '%;';
        return '<button type="button" class="pdp-chip pdp-chip--' + face + '" data-pdp-face="' + face + '" style="' + pos + '" tabindex="-1">' +
          esc(fill(c.label, min)) + '</button>';
      }).join('');
    }
    return group(cfg.chips.front, 'front') + group(cfg.chips.back, 'back');
  }

  function buildIngredients(cfg) {
    var files = cfg.ingredientFiles || [];
    var out = { back: '', mid: '', front: '' };
    if (cfg.showIngredients === false) return out;
    cfg.ingredientSlots.forEach(function (s, i) {
      if (s.hidden) return;
      var f = files[i];
      var inner = f
        ? '<img src="' + esc((cfg.cutoutDir || 'pdp/shared/ingredients/') + f.file) + '" alt="" width="' + (f.w || 200) + '" height="' + (f.h || 200) + '" decoding="async" loading="lazy">'
        : '<span class="pdp-ing-ph" title="Placeholder: ingredient cutout ' + (i + 1) + ' not supplied yet">Cutout<br>#' + (i + 1) + '</span>';
      out[s.layer] += '<div class="pdp-ing' + (s.mobile ? '' : ' pdp-ing--desk') + '" data-depth="' + s.depth + '" aria-hidden="true" ' +
        'style="left:' + s.x + '%;top:' + s.y + '%;width:' + s.size + '%;--pdp-r:' + s.rot + 'deg;--pdp-dur:' + s.dur + 's;--pdp-ph:' + s.phase + 's">' +
        '<span class="pdp-ing-float">' + inner + '</span></div>';
    });
    return out;
  }

  var PATTERN = '<svg class="pdp-pattern" aria-hidden="true" focusable="false"><defs>' +
    '<pattern id="pdpPattern" width="72" height="72" patternUnits="userSpaceOnUse">' +
    '<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M10 16c4-7 13-7 15 0s-4 11-10 10-6-4-5-10z"/><path d="M44 46c6-9 15-9 17-2-6 2-11 6-17 2z"/>' +
    '<circle cx="52" cy="14" r="2.2"/><circle cx="20" cy="54" r="2.2"/><path d="M36 28v8M32 32h8"/></g></pattern></defs>' +
    '<rect width="100%" height="100%" fill="url(#pdpPattern)"/></svg>';

  var ICON_RESET = '<svg ' + ICON_ATTR + '><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>';
  var ICON_DRAG = '<svg class="pdp-hint-ico" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m8 8-4 4 4 4M16 8l4 4-4 4"/><circle cx="12" cy="12" r="2.2"/></svg>';

  function buildStage(cfg, min, oldGallery, canvasBox) {
    var stage = el('div', 'pdp-stage');
    stage.style.setProperty('--pdp-tint', cfg.tint);
    stage.style.setProperty('--pdp-ink', cfg.ink);
    stage.dataset.face = 'front';
    stage.dataset.chips = 'on';
    var ing = buildIngredients(cfg);
    stage.innerHTML =
      '<div class="pdp-backdrop" aria-hidden="true">' + PATTERN + '</div>' +
      '<div class="pdp-glow" aria-hidden="true"></div>' +
      '<div class="pdp-ground" aria-hidden="true"></div>' +
      '<div class="pdp-floor" aria-hidden="true"></div>' +
      '<div class="pdp-ings pdp-ings--back" aria-hidden="true">' + ing.back + '</div>' +
      '<div data-pdp-slot="canvas"></div>' +
      '<div class="pdp-ings pdp-ings--mid" aria-hidden="true">' + ing.mid + '</div>' +
      '<div class="pdp-ings pdp-ings--front" aria-hidden="true">' + ing.front + '</div>' +
      '<div class="pdp-chips">' + buildChips(cfg, min) + '</div>' +
      '<div class="pdp-ui">' +
        '<p class="pdp-hint" id="pdpHint">' + ICON_DRAG + '<span>Drag to rotate</span></p>' +
        '<div class="pdp-bar">' +
          '<div class="pdp-seg" role="group" aria-label="Pouch side">' +
            '<button type="button" class="pdp-seg-btn" data-pdp-go="front" aria-pressed="true" aria-label="Show front of pouch">Front</button>' +
            '<button type="button" class="pdp-seg-btn" data-pdp-go="back" aria-pressed="false" aria-label="Show back of pouch">Back</button>' +
          '</div>' +
          '<button type="button" class="pdp-reset" data-pdp-go="reset" aria-label="Reset view">' + ICON_RESET + '<span>Reset view</span></button>' +
        '</div>' +
      '</div>';

    // keep the product-page extras the old gallery carried (badges, veg mark)
    ['.card-badges', '.veg-corner'].forEach(function (sel) {
      var n = oldGallery.querySelector(sel);
      if (n) stage.appendChild(n);
    });

    // reuse the existing canvas container (id, loading image) so initPdp3dPouch finds it; reset its inline sizing
    canvasBox.removeAttribute('style');
    canvasBox.classList.add('pdp-canvas');
    var loading = canvasBox.querySelector('#pdp3dLoading');
    if (loading) { loading.removeAttribute('style'); loading.classList.add('pdp-canvas-loading'); }
    stage.querySelector('[data-pdp-slot="canvas"]').replaceWith(canvasBox);
    return stage;
  }

  function lifestyleCard(cfg, c) {
    var pl = cfg.placements && cfg.placements[c.image];
    var serve = c.serving ? '<figcaption class="pdp-serve">Serving suggestion</figcaption>' : '';
    var attrs = ' data-pdp-card="' + c.id + '" data-az="' + c.pouchAzimuth + '"';
    if (pl) {
      var base = cfg.dir + 'gallery/' + c.image;
      return '<figure class="pdp-card pdp-card--photo"' + attrs + '>' +
        '<img src="' + base + '-800.webp" srcset="' + base + '-800.webp 800w, ' + base + '-1200.webp 1200w" ' +
        'sizes="(min-width: 992px) 30vw, (min-width: 768px) 46vw, 92vw" width="' + pl.w + '" height="' + pl.h + '" ' +
        'loading="lazy" decoding="async" alt="' + esc(String(c.alt).replace('{name}', cfg.name || 'The')) + '">' + serve + '</figure>';
    }
    return '<figure class="pdp-card pdp-card--ph"' + attrs + '>' +
      '<div class="pdp-ph" role="img" aria-label="Placeholder: ' + esc(c.id) + ' lifestyle image not supplied yet">' +
      '<b>Placeholder</b><span>Lifestyle image: ' + esc(c.id) + '</span>' +
      '<small>Needs plate <code>' + esc(c.plate) + '.*</code> in <code>' + esc(cfg.dir) + 'plates</code> or <code>pdp/shared/plates</code>, then run <code>tools/compose-lifestyle.py</code></small></div>' + serve + '</figure>';
  }

  function insideCard(cfg, c, min) {
    if (!cfg.inside) return '';
    var steps = cfg.inside.map(function (s, i) {
      return '<li class="pdp-step"><img src="' + esc(s.src) + '" alt="' + esc(s.alt) + '" width="640" height="442" loading="lazy" decoding="async">' +
        '<span class="pdp-step-cap"><i>' + (i + 1) + '</i>' + esc(fill(s.caption, min)) + '</span></li>';
    }).join('');
    return '<section class="pdp-card pdp-card--inside" data-pdp-card="' + c.id + '" data-az="' + c.pouchAzimuth + '" aria-labelledby="pdpInsideH">' +
      '<h2 id="pdpInsideH" class="pdp-card-h">Inside the pack</h2><ol class="pdp-steps">' + steps + '</ol></section>';
  }

  function factsCard(cfg, c, min) {
    var items = cfg.chipsFacts.map(function (f) {
      return '<li class="pdp-fact">' + (FACT_ICONS[f.icon] || '') + '<span>' + esc(fill(f.label, min)) + '</span></li>';
    }).join('');
    return '<section class="pdp-card pdp-card--facts" data-pdp-card="' + c.id + '" data-az="' + c.pouchAzimuth + '" aria-labelledby="pdpFactsH">' +
      '<h2 id="pdpFactsH" class="pdp-card-h">Key facts</h2><ul class="pdp-facts">' + items + '</ul></section>';
  }

  function buildCards(cfg, min) {
    var col = el('div', 'pdp-col-cards');
    col.innerHTML = cfg.cards.map(function (c) {
      return c.type === 'inside' ? insideCard(cfg, c, min) : c.type === 'facts' ? factsCard(cfg, c, min) : lifestyleCard(cfg, c);
    }).join('');
    return col;
  }

  /* ---------- mount ---------- */

  function mount(root, slug) {
    unmount();
    var cfg = window.PDP_SCENES && window.PDP_SCENES[slug];
    if (!cfg || !root) return false;
    var titleEl = root.querySelector('.pdp-title');
    cfg = Object.assign({}, cfg, { name: titleEl ? titleEl.textContent.trim() : '' });
    var view = root.querySelector('.pdp-view');
    var layout = view && view.querySelector('.pdp-layout');
    var info = layout && layout.querySelector('.pdp-info');
    var oldGallery = layout && layout.querySelector('#pdpGallery3D');
    var canvasBox = oldGallery && oldGallery.querySelector('#pdp3dCanvasContainer');
    if (!info || !canvasBox) return false;

    var min = prepMinutes(cfg, slug);
    var stage = buildStage(cfg, min, oldGallery, canvasBox);
    var infoCol = el('div', 'pdp-col-info');
    infoCol.appendChild(info);
    var cardsCol = buildCards(cfg, min);
    var wrap = el('div', 'pdp-proto');
    wrap.style.setProperty('--pdp-tint', cfg.tint);
    wrap.style.setProperty('--pdp-ink', cfg.ink);
    wrap.append(stage, infoCol, cardsCol);
    layout.replaceWith(wrap);
    view.classList.add('pdp-view--proto');

    var st = S = {
      cfg: cfg, wrap: wrap, stage: stage, info: info, infoCol: infoCol, cardsCol: cardsCol,
      cleanups: [], viewer: null, unsub: [], lastInteract: -1e9, target: cfg.cards[0].pouchAzimuth,
      timer: 0, raf: 0, ptr: { x: 0, y: 0, tx: 0, ty: 0 }, az: 0, visible: true, dragging: false,
      ings: Array.prototype.slice.call(stage.querySelectorAll('.pdp-ing')),
      floor: stage.querySelector('.pdp-floor'), hint: stage.querySelector('#pdpHint'),
      segBtns: Array.prototype.slice.call(stage.querySelectorAll('.pdp-seg-btn'))
    };
    function on(target, type, fn, opt) { target.addEventListener(type, fn, opt); st.cleanups.push(function () { target.removeEventListener(type, fn, opt); }); }

    measure();
    // sticky offsets and floor position follow the layout
    on(window, 'resize', measure);
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(measure);
      ro.observe(info); ro.observe(stage);
      st.cleanups.push(function () { ro.disconnect(); });
    }

    // card reveal (opacity + 12px y). No transform on any ancestor of a sticky element: cards are siblings of the stage.
    wrap.classList.add('pdp-reveal');
    var revealIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    Array.prototype.forEach.call(cardsCol.querySelectorAll('.pdp-card'), function (c) { revealIO.observe(c); });
    st.cleanups.push(function () { revealIO.disconnect(); });

    // controls: chips, Front/Back, Reset
    on(stage, 'click', function (e) {
      var b = e.target.closest && e.target.closest('[data-pdp-go],[data-pdp-face]');
      if (!b || !st.viewer) return;
      var go = b.dataset.pdpGo || b.dataset.pdpFace;
      userRotate(go === 'back' ? 180 : 0);
    });

    // pointer: parallax (desktop only) + "user is touching the pouch" tracking for the scroll link
    on(stage, 'pointerdown', function () { st.dragging = true; st.lastInteract = Date.now(); });
    on(window, 'pointerup', function () { if (st.dragging) { st.dragging = false; st.lastInteract = Date.now(); } });
    on(window, 'pointercancel', function () { if (st.dragging) { st.dragging = false; st.lastInteract = Date.now(); } });
    if (mm('(hover: hover) and (pointer: fine)') && !mm(MQ_RM)) {
      on(stage, 'pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        var r = stage.getBoundingClientRect();
        st.ptr.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        st.ptr.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
        kick();
      });
      on(stage, 'pointerleave', function () { st.ptr.tx = 0; st.ptr.ty = 0; kick(); });
    }

    // pause floats while off-screen or in a hidden tab
    var visIO = new IntersectionObserver(function (es) { st.visible = es[es.length - 1].isIntersecting; setPaused(); }, { threshold: 0 });
    visIO.observe(stage);
    st.cleanups.push(function () { visIO.disconnect(); });
    on(document, 'visibilitychange', setPaused);

    // the first scroll hands the pouch over to the cards (until then it keeps spinning as on open)
    on(window, 'scroll', function () { if (!st.scrolled && window.scrollY > 40) { st.scrolled = true; if (st.target != null) requestRotate(); } }, { passive: true });

    // the 3D viewer appears later (script + textures load on demand)
    on(document, 'pdp:viewer', bindViewer);

    // scroll-linked rotation follows the layout (multi-column only) and the motion preference
    var mq = window.matchMedia(MQ_MULTI);
    var onMq = function () { setupScrollLink(); measure(); };
    if (mq.addEventListener) { mq.addEventListener('change', onMq); st.cleanups.push(function () { mq.removeEventListener('change', onMq); }); }
    setupScrollLink();
    return true;
  }

  /* ---------- viewer link ---------- */

  function bindViewer() {
    var st = S; var v = window.pouchViewer;
    if (!st || !v) return;
    st.unsub.forEach(function (f) { try { f(); } catch (e) { /* ignore */ } });
    st.unsub = [];
    st.viewer = v;
    // the viewer's own auto-spin runs on open, as on the other pages, and stops on the first touch, click or scroll
    st.unsub.push(v.onChange(onAzimuth));
    st.unsub.push(v.onInteract(function () {
      st.lastInteract = Date.now();
      if (st.hint) st.hint.classList.add('is-gone');
    }));
    onAzimuth(v.getAzimuth());
  }

  function userRotate(deg) {
    var st = S; if (!st || !st.viewer) return;
    st.lastInteract = Date.now();
    if (st.hint) st.hint.classList.add('is-gone');
    st.viewer.setAzimuth(deg, 0.9);
  }

  function onAzimuth(deg) {
    var st = S; if (!st) return;
    st.az = deg;
    var face = Math.abs(deg) < 60 ? 'front' : (Math.abs(Math.abs(deg) - 180) < 60 ? 'back' : 'side');
    // claim chips stay up while the front is mostly in view, and fade out once the back turns toward the viewer
    var chips = Math.abs(deg) < 135 ? 'on' : 'off';
    if (st.stage.dataset.chips !== chips) {
      st.stage.dataset.chips = chips;
      Array.prototype.forEach.call(st.stage.querySelectorAll('.pdp-chip'), function (c) { c.tabIndex = chips === 'on' ? 0 : -1; });
    }
    if (st.stage.dataset.face !== face) {
      st.stage.dataset.face = face;
      st.segBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(face !== 'side' && b.dataset.pdpGo === face)); });
    }
    applyParallax();
  }

  /* ---------- parallax: ingredients orbit with the pouch, and drift slightly with the pointer ---------- */

  function applyParallax() {
    var st = S; if (!st) return;
    var rm = mm(MQ_RM);
    var k = (mm(MQ_PHONE) ? 0.5 : 1);
    var w = st.stage.clientWidth || 400;
    var sin = Math.sin(st.az * Math.PI / 180);
    var sx = rm ? 1 : 1 - 0.16 * Math.abs(sin);
    if (st.floor) st.floor.style.transform = 'translate(-50%, -50%) scaleX(' + sx.toFixed(3) + ')';
    if (rm) return;
    for (var i = 0; i < st.ings.length; i++) {
      var e = st.ings[i]; var d = +e.dataset.depth;
      var x = d * 0.1 * w * sin * k + d * 8 * st.ptr.x * k;
      var y = d * 6 * st.ptr.y * k;
      e.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
    }
  }

  function kick() {
    var st = S; if (!st || st.raf || !st.visible || document.hidden) return;
    st.raf = requestAnimationFrame(function tick() {
      st.raf = 0;
      var p = st.ptr;
      p.x += (p.tx - p.x) * 0.1; p.y += (p.ty - p.y) * 0.1;
      applyParallax();
      if (Math.abs(p.tx - p.x) > 0.002 || Math.abs(p.ty - p.y) > 0.002) st.raf = requestAnimationFrame(tick);
    });
  }

  function setPaused() {
    var st = S; if (!st) return;
    var paused = !st.visible || document.hidden;
    st.stage.classList.toggle('pdp-paused', paused);
    if (paused && st.raf) { cancelAnimationFrame(st.raf); st.raf = 0; }
  }

  /* ---------- scroll-linked rotation (two or more columns, motion allowed) ---------- */

  function setupScrollLink() {
    var st = S; if (!st) return;
    if (st.scrollIO) { st.scrollIO.disconnect(); st.scrollIO = null; }
    clearTimeout(st.timer);
    if (mm(MQ_RM) || !mm(MQ_MULTI) || !window.IntersectionObserver) return;
    // a 0-height line through the middle of the viewport: the card crossing it is the one nearest the centre
    st.scrollIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        st.target = +e.target.dataset.az;
        requestRotate();
      });
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
    Array.prototype.forEach.call(st.cardsCol.querySelectorAll('[data-az]'), function (c) { st.scrollIO.observe(c); });
  }

  function requestRotate() {
    var st = S; if (!st || !st.viewer || document.hidden || !st.visible || !st.scrolled || mm(MQ_RM) || !mm(MQ_MULTI)) return;   // the open-spin keeps going until the visitor scrolls
    var wait = st.lastInteract + IDLE_MS - Date.now();
    clearTimeout(st.timer);
    if (wait > 0) { st.timer = setTimeout(requestRotate, wait + 30); return; }   // resume after 4 s of no interaction
    var cur = st.az, d = ((st.target - cur + 540) % 360) - 180;
    if (Math.abs(d) > 0.5) st.viewer.setAzimuth(st.target, 0.9);
  }

  /* ---------- measurements ---------- */

  function measure() {
    var st = S; if (!st) return;
    var promo = document.getElementById('promoBar'), header = document.getElementById('siteHeader');
    var top = (promo ? promo.offsetHeight : 0) + (header ? header.offsetHeight : 0);
    st.wrap.style.setProperty('--pdp-sticky-top', top + 'px');
    // info column: sticky only when it fits under the header, otherwise normal flow
    var fits = mm(MQ_THREE) && st.info.offsetHeight <= window.innerHeight - top - 24;
    st.infoCol.classList.toggle('pdp-sticky', fits);
    // floor ellipse sits at the pouch's foot: same fit maths as fitPdp3dCamera in main.js
    var W = st.stage.clientWidth, H = st.stage.clientHeight;
    if (W && H) {
      var res = Math.min(0.24, 92 / H), avail = 1 - res - 0.05;
      var visH = Math.max(1.8 / avail, ((1.16 + 0.44) / 0.9) / (W / H));
      var margin = (res - 0.05) / 2 + 0.5 - 0.9 / visH;       // gap under the pouch, share of the canvas height
      st.stage.style.setProperty('--pdp-floor-y', ((1 - margin) * 100).toFixed(1) + '%');
      st.stage.style.setProperty('--pdp-floor-w', ((1.16 / visH) * (H / W) * 100 * 1.15).toFixed(1) + '%');
    }
    applyParallax();
  }

  /* ---------- unmount ---------- */

  function unmount() {
    var st = S; if (!st) return;
    S = null;
    clearTimeout(st.timer);
    if (st.raf) cancelAnimationFrame(st.raf);
    if (st.scrollIO) st.scrollIO.disconnect();
    st.unsub.forEach(function (f) { try { f(); } catch (e) { /* ignore */ } });
    st.cleanups.forEach(function (f) { try { f(); } catch (e) { /* ignore */ } });
    st.cleanups = []; st.unsub = []; st.viewer = null;
  }

  window.PdpProto = { mount: mount, unmount: unmount };
})();
