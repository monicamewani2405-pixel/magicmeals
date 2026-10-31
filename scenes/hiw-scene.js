/* =========================================================
   scenes/hiw-scene.js: pinned, scroll-driven How It Works for Design 2
   - mount(host, cfg, hero): cfg comes from sceneFor(slug) (scenes/scene-data.js),
     hero is window.MMHeroes.switcher (getActive, freeze, suspendExit, resumeExit)
   - Glide: the hero's active pouch image is moved into a fixed overlay and
     scrubbed down to the stage (one ScrollTrigger, transform only)
   - Pin: tear, pour, add water, eat (one scrubbed timeline, ~300vh)
   - unmount() restores the pouch to its slot and removes everything it added
   - Prefixed CSS: v-scene-* (scenes/scene.css)
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var S = null;   // state of the mounted scene
  var M = window.MMMotion;   // shared eases and durations (scenes/motion.js)

  var JAG_X = [0, 8, 16, 25, 33, 41, 50, 58, 66, 75, 83, 92, 100];                    // torn edge, % of pouch width
  var JAG_Y = [10.2, 8.4, 11.5, 9.3, 12, 8.8, 11, 9.6, 12.2, 8.9, 11.4, 9.5, 10.6];   // % of pouch height (art starts at ~6%)
  var MOUTH_Y = 10;                                                                   // mouth marker, % from the top of the pouch
  var POUR_DEG = -115;
  var KETTLE_DEG = 22;   // tilt of the kettle while it pours (clockwise, the spout dips)
  var STEP_AT = [0, 0.25, 0.55, 0.8];

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function rnd(i, j) { var x = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453; return x - Math.floor(x); }
  function headerH() { var h = document.querySelector('header'); return (h && h.offsetHeight) || 72; }
  function isDesktop() { return window.innerWidth >= 768; }

  /* ---------- markup ---------- */

  function cardsHtml(cfg) {
    return cfg.steps.map(function (s, i) {
      return '<li class="v-scene-card' + (i === 0 ? ' is-active' : '') + '" data-step="' + i + '">' +
        '<span class="v-scene-badge">' + (i + 1) + '</span>' +
        '<span class="v-scene-text"><h3 class="v-scene-name">' + esc(s.title) + '</h3>' +
        '<p class="v-scene-desc">' + esc(s.text) + '</p></span></li>';
    }).join('');
  }

  function minutesText(cfg) {
    var n = cfg.prepMinutes;
    return 'Ready in ' + n + ' ' + (Number(n) === 1 ? 'minute' : 'minutes');
  }

  function staticHtml(cfg) {
    return '<section id="how-it-works" data-section="how-it-works" class="v-scene v-scene--static" aria-labelledby="vSceneTitle">' +
      '<div class="wrap v-scene-inner">' +
        '<h2 id="vSceneTitle" class="v-scene-title">How It Works</h2>' +
        '<ol class="v-scene-steps">' + cardsHtml(cfg).replace(/ is-active/, '') + '</ol>' +
        '<img class="v-scene-static-img" src="' + cfg.ready + '" width="' + cfg.size[0] + '" height="' + cfg.size[1] + '" alt="" loading="lazy">' +
      '</div></section>';
  }

  function sceneHtml(cfg) {
    var o = cfg.opening, w = cfg.size[0], h = cfg.size[1];
    var dots = cfg.steps.map(function (s, i) {
      return '<button type="button" class="v-scene-dot' + (i === 0 ? ' is-active' : '') + '" data-dot="' + i + '" aria-label="Step ' + (i + 1) + ': ' + esc(s.title) + '"></button>';
    }).join('');
    var layers = ['dry', 'wet', 'ready'].map(function (k) {
      return '<img class="v-scene-layer v-scene-layer--' + k + '" data-src="' + cfg[k] + '" width="' + w + '" height="' + h + '" alt="" decoding="async">';
    }).join('');
    var steam = '<i></i><i></i><i></i><i></i><i></i>';
    return '<section id="how-it-works" data-section="how-it-works" class="v-scene" aria-labelledby="vSceneTitle">' +
      '<div class="v-scene-pin"><div class="wrap v-scene-inner">' +
        '<div class="v-scene-head">' +
          '<h2 id="vSceneTitle" class="v-scene-title">How It Works</h2>' +
          '<div class="v-scene-progress">' +
            '<div class="v-scene-track"><div class="v-scene-fill"></div></div>' +
            '<div class="v-scene-dots" role="group" aria-label="Step progress">' + dots + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="v-scene-grid">' +
          '<ol class="v-scene-steps" aria-label="Preparation steps">' + cardsHtml(cfg) + '</ol>' +
          '<div class="v-scene-stage-col"><div class="v-scene-stage" aria-hidden="true">' +
            '<div class="v-scene-target"></div>' +
            '<div class="v-scene-bowl" style="aspect-ratio:' + w + ' / ' + h + ';--v-pivot:' + (cfg.bowlBottom || 94.7) + '%;--v-sheen-food:' + cfg.colors[1] + '">' +
              '<span class="v-scene-shadow"></span>' +
              '<img class="v-scene-base" src="' + cfg.bowl + '" width="' + w + '" height="' + h + '" alt="">' +
              layers +
              '<div class="v-scene-opening" style="left:' + (o.cx - o.rx) + '%;top:' + (o.cy - o.ry) + '%;width:' + (o.rx * 2) + '%;height:' + (o.ry * 2) + '%">' +
                '<i class="v-scene-sheen"></i><i class="v-scene-ripple"></i><i class="v-scene-ripple"></i><i class="v-scene-spec"></i>' +
              '</div>' +
            '</div>' +
            '<div class="v-scene-flow"><span class="v-scene-strand v-scene-strand--a"><i></i></span><span class="v-scene-strand v-scene-strand--b"><i></i></span></div>' +
            '<div class="v-scene-particles"></div>' +
            '<img class="v-scene-kettle" data-src="' + cfg.kettle.src + '" width="' + cfg.kettle.size[0] + '" height="' + cfg.kettle.size[1] + '" alt="" decoding="async">' +
            '<div class="v-scene-steam">' + steam + '</div>' +
          '</div></div>' +
        '</div>' +
      '</div></div></section>';
  }

  function overlayHtml(src) {
    var pts = JAG_X.map(function (x, i) { return x + '% ' + JAG_Y[i] + '%'; });
    var strip = 'polygon(0% 0%, 100% 0%, ' + pts.slice().reverse().join(', ') + ')';
    return '<div class="v-scene-overlay" aria-hidden="true"><div class="v-scene-pouch"><div class="v-scene-pouch-in">' +
      '<span class="v-scene-open"></span>' +
      '<span class="v-scene-strip"><img src="' + src + '" alt="" draggable="false" style="clip-path:' + strip + '"></span>' +
      '<i class="v-scene-mouth" style="top:' + MOUTH_Y + '%"></i>' +
    '</div></div></div>';
  }

  /* ---------- geometry ---------- */

  function offsetIn(el, ancestor) {
    var x = 0, y = 0, n = el;
    while (n && n !== ancestor) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return { x: x, y: y };
  }

  // Everything is measured from layout offsets (never transformed rects), in "pinned" screen coordinates.
  function measure() {
    if (!S || !S.stage) return;
    var G = S.G, cfg = S.cfg, o = cfg.opening;
    var stage = S.stage, bowl = S.bowl;
    var W = stage.offsetWidth, H = stage.offsetHeight;
    var bw = bowl.offsetWidth, bh = bowl.offsetHeight, bx = bowl.offsetLeft, by = bowl.offsetTop;
    G.W = W; G.H = H;
    G.open = { cx: bx + o.cx / 100 * bw, cy: by + o.cy / 100 * bh, rx: o.rx / 100 * bw, ry: o.ry / 100 * bh, bh: bh };
    G.land = { x: G.open.cx + 0.12 * G.open.rx, y: G.open.cy + 0.05 * G.open.ry };
    G.impact = { x: G.open.cx - 0.12 * G.open.rx, y: G.open.cy + 0.1 * G.open.ry };   // water lands slightly left of the opening's centre
    G.mouth = { x: G.open.cx + (isDesktop() ? 0.5 : 0.25) * G.open.rx, y: G.open.cy - G.open.ry - 0.1 * bh };

    var pinLeft = S.pin.getBoundingClientRect().left;
    var so = offsetIn(stage, S.pin);
    G.stageScreen = { x: pinLeft + so.x, y: headerH() + so.y };

    var t = S.target;
    var tw = t.offsetWidth;
    G.target = { x: G.stageScreen.x + t.offsetLeft + tw / 2, y: G.stageScreen.y + t.offsetTop + t.offsetHeight / 2 };

    var box = S.box;   // pouch size in the hero (layout px)
    if (!S.lifted && S.heroImg && S.heroImg.offsetWidth) box.w = S.heroImg.offsetWidth, box.h = S.heroImg.offsetHeight;
    if (!box.w) { box.w = 164; box.h = 256; }
    G.s = tw / box.w;
    S.pouch.style.width = box.w + 'px'; S.pouch.style.height = box.h + 'px';
    S.pouchIn.style.width = box.w + 'px'; S.pouchIn.style.height = box.h + 'px';

    // pour pose: the pouring pouch is ~45% (desktop) / 40% (mobile) of the bowl's width, mouth over the bowl's right rim
    var th = POUR_DEG * Math.PI / 180;
    var sp = (isDesktop() ? 0.45 : 0.4) * bw / box.w;
    G.fp = sp / G.s;                                           // extra scale of the inner wrapper while pouring
    var pw = box.w * sp, ph = box.h * sp;
    var my = -(0.5 - MOUTH_Y / 100) * ph;
    var ox = -my * Math.sin(th), oy = my * Math.cos(th);       // mouth offset from the pouch centre
    var hw = (pw * Math.abs(Math.cos(th)) + ph * Math.abs(Math.sin(th))) / 2;
    var hh = (pw * Math.abs(Math.sin(th)) + ph * Math.abs(Math.cos(th))) / 2;
    var headBottom = headerH() + offsetIn(S.head, S.pin).y + S.head.offsetHeight + 6;   // stay clear of the headline and progress dots
    var mxs = G.stageScreen.x + G.mouth.x, mys = G.stageScreen.y + G.mouth.y;
    var cxs = mxs - ox, cys = mys - oy;
    if (cxs + hw > window.innerWidth - 8) mxs -= cxs + hw - (window.innerWidth - 8);
    else if (cxs - hw < G.stageScreen.x) mxs += G.stageScreen.x - (cxs - hw);
    if (cys - hh < headBottom) mys += headBottom - (cys - hh);
    mys = Math.min(mys, G.stageScreen.y + G.open.cy - 0.2 * G.open.ry);
    G.mouth = { x: mxs - G.stageScreen.x, y: mys - G.stageScreen.y };
    G.pour = { x: (mxs - ox - G.target.x) / G.s, y: (mys - oy - G.target.y) / G.s };
    markerMouth();

    // kettle: its spout tip sits above the impact point once tilted; the stream runs from the tip to the impact
    var K = cfg.kettle, kw = Math.round((isDesktop() ? 0.7 : 0.72) * bw), kh = Math.round(kw * K.size[1] / K.size[0]);
    var kt = KETTLE_DEG * Math.PI / 180, kc = Math.cos(kt), ks = Math.sin(kt);
    var tvx = (K.tip.x / 100 - 0.5) * kw, tvy = (K.tip.y / 100 - 0.6) * kh;
    var trx = tvx * kc - tvy * ks, tryy = tvx * ks + tvy * kc;           // tip offset from the pivot once tilted
    var topRel = Math.min.apply(null, [[-0.5, -0.6], [0.5, -0.6], [0.5, 0.4], [-0.5, 0.4]].map(function (c) { return c[0] * kw * ks + c[1] * kh * kc; }));
    var tipY = Math.min(G.open.cy - G.open.ry - 0.12 * bh, G.impact.y - 0.15 * bh);
    var kpy = tipY - tryy;
    var minTop = headBottom - G.stageScreen.y;                          // keep the kettle clear of the headline
    if (kpy + topRel < minTop) kpy = Math.min(minTop - topRel, G.impact.y - 0.15 * bh - tryy);
    tipY = kpy + tryy;
    G.kw = kw; G.kh = kh;
    S.kettle.style.width = kw + 'px'; S.kettle.style.height = kh + 'px';
    S.kettle.style.left = Math.round(G.impact.x - trx - 0.5 * kw) + 'px';
    S.kettle.style.top = Math.round(kpy - 0.6 * kh) + 'px';
    // water: a thin stream from the spout tip down to the impact point (positions cached here, never per frame)
    S.flow.style.left = Math.round(G.impact.x - 6) + 'px';
    S.flow.style.top = Math.round(tipY) + 'px';
    S.flow.style.height = Math.round(G.impact.y - tipY) + 'px';
    buildPour();
  }

  // Read the mouth marker once, with the pouch temporarily in its pouring pose (restored straight after)
  function markerMouth() {
    var G = S.G, box = S.box, els = [S.pouch, S.pouchIn], props = ['x', 'y', 'scale', 'rotation'];
    var keep = els.map(function (el) { return props.map(function (k) { return gsap.getProperty(el, k); }); });
    gsap.set(S.pouch, { x: G.target.x - box.w / 2, y: G.target.y - box.h / 2, scale: G.s, rotation: 0 });
    gsap.set(S.pouchIn, { x: G.pour.x, y: G.pour.y, scale: G.fp, rotation: POUR_DEG });
    var m = S.mouth.getBoundingClientRect();
    els.forEach(function (el, i) { gsap.set(el, { x: keep[i][0], y: keep[i][1], scale: keep[i][2], rotation: keep[i][3] }); });
    if (m.width || m.height || m.left) {
      G.mouth = { x: m.left + m.width / 2 - G.stageScreen.x, y: m.top + m.height / 2 - G.stageScreen.y };
    }
  }

  // All granule tweens live in one child timeline with fixed numbers; rebuilt on every measure (resize / refresh)
  function buildPour() {
    var G = S.G, pt = S.pt, rx = G.open.rx, ry = G.open.ry;
    if (!pt) return;
    pt.clear();
    pt.to({}, { duration: 0.3 }, 0);   // the pour phase is 25% to 55% of the pin
    S.particles.forEach(function (p, k) {
      var size = p.size, half = size / 2;
      var a = rnd(k, 1) * Math.PI * 2, r = Math.sqrt(rnd(k, 2)) * 0.8;
      var sx = clamp(G.mouth.x + (rnd(k, 3) - 0.5) * 8 - half, 0, G.W - size), sy = clamp(G.mouth.y + (rnd(k, 4) - 0.5) * 4 - half, 0, G.H - size);
      var ex = clamp(G.open.cx + Math.cos(a) * r * rx - half, 0, G.W - size);
      var ey = clamp(G.open.cy + Math.sin(a) * r * ry * 0.85 - half, 0, G.H - size);
      var drift = (rnd(k, 7) - 0.5) * 14 + (ex - sx) * 0.12;
      var t0 = 0.06 + rnd(k, 8) * 0.16, d = 0.05 + rnd(k, 9) * 0.03;
      var r0 = rnd(k, 5) * 360, r1 = r0 + (rnd(k, 6) - 0.5) * 260;
      pt.set(p, { x: sx, y: sy, rotation: r0, opacity: 0 }, 0)
        .set(p, { opacity: 1 }, t0)
        .fromTo(p, { x: sx }, { x: sx + drift, duration: d * 0.3, ease: 'power1.out', immediateRender: false }, t0)
        .fromTo(p, { x: sx + drift }, { x: ex, duration: d * 0.7, ease: 'none', immediateRender: false }, t0 + d * 0.3)
        .fromTo(p, { y: sy }, { y: ey, duration: d, ease: 'power2.in', immediateRender: false }, t0)
        .fromTo(p, { rotation: r0 }, { rotation: r1, duration: d, ease: 'none', immediateRender: false }, t0)
        .fromTo(p, { opacity: 1 }, { opacity: 0, duration: d * 0.15, ease: 'none', immediateRender: false }, t0 + d * 0.85);
    });
    pt.render(pt.time(), true, true);
  }

  /* ---------- glide: hero pouch <-> overlay ---------- */

  function lift() {
    if (S.lifted) return true;
    var a = S.hero.getActive();
    if (!a || !a.ready || a.slug !== S.cfg.slug || !a.img || !a.img.offsetWidth) return false;
    var img = a.img, r = img.getBoundingClientRect();
    var rot = 0, sc = 1;
    a.chain.forEach(function (n) { rot += gsap.getProperty(n, 'rotation') || 0; sc *= gsap.getProperty(n, 'scaleX') || 1; });
    S.nat = { x: r.left + r.width / 2, y: r.top + r.height / 2 + window.scrollY, rot: rot, sc: sc };
    S.box.w = img.offsetWidth; S.box.h = img.offsetHeight;
    var ph = document.createElement('span');
    ph.style.cssText = 'display:block;width:' + S.box.w + 'px;height:' + S.box.h + 'px';
    img.parentNode.insertBefore(ph, img);
    S.placeholder = ph; S.heroImgStyle = img.getAttribute('style');
    img.style.cssText = 'display:block;width:100%;height:100%;object-fit:contain;position:relative;z-index:1';
    S.pouchIn.insertBefore(img, S.pouchIn.firstChild);
    S.fade = a.fade;
    S.lifted = true;
    S.hero.freeze(true);
    S.overlay.style.visibility = 'visible';
    gsap.set(S.pouch, { willChange: 'transform' });
    measure();
    return true;
  }

  function drop() {
    if (!S || !S.lifted) return;
    if (S.placeholder && S.placeholder.parentNode) {
      S.placeholder.parentNode.replaceChild(S.heroImgEl, S.placeholder);
    }
    if (S.heroImgStyle === null) S.heroImgEl.removeAttribute('style'); else S.heroImgEl.setAttribute('style', S.heroImgStyle);
    S.placeholder = null;
    if (S.fade) {
      gsap.set(S.fade, { clearProps: 'opacity' });
      gsap.set(S.fade.slice(0, 3), { clearProps: 'y' });
      S.fade = null;
    }
    gsap.set(S.pouch, { clearProps: 'all' });
    S.pouch.style.width = S.box.w + 'px'; S.pouch.style.height = S.box.h + 'px';
    S.overlay.style.visibility = 'hidden';
    S.lifted = false;
    S.hero.freeze(false);
  }

  function glide(p) {
    if (!S) return;
    if (p > 0.0005 && !S.lifted && !lift()) return;
    if (p <= 0.0005) { if (S.lifted) drop(); return; }
    if (!S.lifted) return;
    var G = S.G, e = S.glideEase(clamp(p, 0, 1));
    var st = S.gtween && S.gtween.scrollTrigger;
    var sy = st ? p * (st.end - st.start) : window.scrollY;   // the smoothed scroll position, so the pouch never fights the scrub lag
    var cx = S.nat.x * (1 - e) + G.target.x * e;
    var cy = (S.nat.y - sy) * (1 - e) + G.target.y * e;
    var sc = S.nat.sc + (G.s - S.nat.sc) * e;
    gsap.set(S.pouch, {
      x: Math.round(cx - S.box.w / 2), y: Math.round(cy - S.box.h / 2), scale: sc, rotation: S.nat.rot * (1 - e), force3D: true
    });
    var f = clamp(p / 0.15, 0, 1);
    if (S.fade) {
      gsap.set(S.fade, { opacity: 1 - f });
      gsap.set(S.fade.slice(0, 3), { y: f * 10 });
    }
  }

  /* ---------- steps ---------- */

  function setStep(i) {
    if (i === S.step) return;
    S.step = i;
    S.cards.forEach(function (c, k) {
      c.classList.toggle('is-active', k === i);
      if (k === i) c.setAttribute('aria-current', 'step'); else c.removeAttribute('aria-current');
    });
    S.dots.forEach(function (d, k) { d.classList.toggle('is-active', k === i); });
  }

  function onProgress(p) {
    S.p = p;
    setStep(p >= STEP_AT[3] ? 3 : p >= STEP_AT[2] ? 2 : p >= STEP_AT[1] ? 1 : 0);
    S.steam.classList.toggle('is-steaming', p >= 0.74 && p < 0.99);
    S.flow.classList.toggle('is-flowing', p >= 0.59 && p < 0.84);
  }

  /* ---------- timelines ---------- */

  function buildParticles(cfg) {
    var host = S.stage.querySelector('.v-scene-particles');
    var n = isDesktop() ? 52 : 28, out = [];
    var light = cfg.colors.slice(1);   // fills from the lighter colours, edge in the darkest
    for (var k = 0; k < n; k++) {
      var i = document.createElement('i');
      i.className = 'v-scene-p v-scene-p--' + cfg.particle;
      i.size = 5 + rnd(k, 11) * 7;                                 // 5 to 12px
      i.style.setProperty('--p-s', i.size.toFixed(1) + 'px');
      i.style.setProperty('--p-c', light[k % light.length]);
      i.style.setProperty('--p-e', cfg.colors[0]);
      host.appendChild(i);
      out.push(i);
    }
    return out;
  }

  function buildTimeline() {
    var cfg = S.cfg, G = S.G, o = cfg.opening;
    var OUT = M.EASE_OUT, INOUT = M.EASE_INOUT;
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      onUpdate: function () { onProgress(this.progress()); },   // cards and dots follow the smoothed timeline, not the raw scroll
      scrollTrigger: {
        trigger: S.pin,
        start: function () { return 'top ' + headerH() + 'px'; },
        end: function () { return '+=' + Math.round(window.innerHeight * (isDesktop() ? 3 : 2.5)); },
        pin: true, scrub: M.SCRUB, anticipatePin: 1, invalidateOnRefresh: true,
        onRefresh: function (self) { onProgress(self.progress); }
      }
    });
    S.tl = tl;
    var flat = 'polygon(' + JAG_X.map(function (x) { return x + '% 0%'; }).join(', ') + ', 100% 100%, 0% 100%)';
    var jag = 'polygon(' + JAG_X.map(function (x, i) { return x + '% ' + JAG_Y[i] + '%'; }).join(', ') + ', 100% 100%, 0% 100%)';
    var inner = S.pouchIn, strip = S.strip, open = S.openEl;
    var layerDry = S.layers.dry, layerWet = S.layers.wet, layerReady = S.layers.ready;
    var grow = 'inset(0% 0% 0% 0%)', hidden = 'inset(0% 0% 100% 0%)', gone = 'inset(100% 0% 0% 0%)';

    gsap.set(S.ripples.concat(S.spec), { xPercent: -50, yPercent: -50 });   // centred on the impact point
    tl.fromTo(S.fill, { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0);

    // 1. Tear (0 to 25%)
    tl.to(inner, { rotation: 12, duration: 0.08, ease: INOUT }, 0)
      .to(inner, { keyframes: [{ x: -2, duration: 0.012 }, { x: 2, duration: 0.012 }, { x: -2, duration: 0.012 }, { x: 0, duration: 0.012 }], ease: M.EASE_LOOP }, 0.08)
      .set(strip, { opacity: 1 }, 0.06)
      .fromTo(S.pouchImg, { clipPath: flat }, { clipPath: jag, duration: 0.08, ease: OUT, immediateRender: false }, 0.06)
      .to(open, { opacity: 1, duration: 0.07 }, 0.12)
      .to(strip, { x: 40, y: -26, rotation: 25, duration: 0.11, ease: OUT }, 0.14)
      .to(strip, { opacity: 0, duration: 0.07 }, 0.18);

    // 2. Pour (24 to 54%): the pouch is in its pouring pose by 30%, granules only start after that (31%), the heap grows from 35%
    var startClip = 'ellipse(2% 1.5% at ' + o.cx + '% ' + (o.cy + 0.5 * o.ry).toFixed(2) + '%)';
    var endClip = 'ellipse(' + (o.rx * 1.03).toFixed(2) + '% ' + (o.ry * 1.4).toFixed(2) + '% at ' + o.cx + '% ' + (o.cy - 0.3 * o.ry).toFixed(2) + '%)';
    tl.to(inner, { x: function () { return G.pour.x; }, y: function () { return G.pour.y; }, rotation: POUR_DEG, scale: function () { return G.fp; }, duration: 0.06, ease: INOUT }, 0.24)
      .add(S.pt, 0.25)
      .fromTo(layerDry, { opacity: 0 }, { opacity: 1, duration: 0.05, ease: OUT, immediateRender: false }, 0.35)
      .fromTo(layerDry, { scale: 0.985, clipPath: startClip }, { scale: 1, clipPath: endClip, duration: 0.19, ease: OUT, force3D: true, immediateRender: false }, 0.35);

    // 3. Add hot water (50 to 82%): the pouch leaves, the kettle comes in and tilts, the stream runs from its spout (60 to 83%)
    tl.to(inner, { rotation: -30, x: function () { return G.pour.x + 70 / G.s; }, duration: 0.09, ease: INOUT }, 0.50)
      .to(inner, { opacity: 0, duration: 0.06, ease: INOUT }, 0.52)
      .fromTo(S.kettle, { opacity: 0, x: function () { return -0.3 * G.kw; }, y: function () { return -0.25 * G.kh; }, rotation: 0 },
        { opacity: 1, x: 0, y: 0, rotation: KETTLE_DEG, duration: 0.08, ease: OUT, force3D: true, immediateRender: false }, 0.53)
      .set(S.flow, { opacity: 1 }, 0.60)
      .fromTo(S.strands[0], { clipPath: hidden }, { clipPath: grow, duration: 0.06, ease: OUT, immediateRender: false }, 0.60)
      .fromTo(S.strands[1], { clipPath: hidden }, { clipPath: grow, duration: 0.08, ease: OUT, immediateRender: false }, 0.61)
      .fromTo(S.strands[0], { clipPath: grow }, { clipPath: gone, duration: 0.06, ease: INOUT, immediateRender: false }, 0.74)
      .fromTo(S.strands[1], { clipPath: grow }, { clipPath: gone, duration: 0.07, ease: INOUT, immediateRender: false }, 0.75)
      .set(S.flow, { opacity: 0 }, 0.83)
      // the kettle tips back and fades out as the stream thins
      .fromTo(S.kettle, { rotation: KETTLE_DEG, x: 0, y: 0 }, { rotation: 6, x: function () { return -0.12 * G.kw; }, y: function () { return -0.2 * G.kh; }, duration: 0.08, ease: INOUT, force3D: true, immediateRender: false }, 0.73)
      .fromTo(S.kettle, { opacity: 1 }, { opacity: 0, duration: 0.06, ease: INOUT, immediateRender: false }, 0.75)
      // water surface: a faint tinted sheen rises inside the opening while the stream flows, then hands over to the wet image
      .fromTo(S.sheen, { clipPath: 'ellipse(45% 3% at 50% 100%)' }, { clipPath: 'ellipse(78% 74% at 50% 56%)', duration: 0.17, ease: OUT, immediateRender: false }, 0.62)
      .fromTo(S.sheen, { opacity: 0 }, { opacity: 0.3, duration: 0.08, ease: OUT, immediateRender: false }, 0.62)
      .fromTo(S.sheen, { opacity: 0.3 }, { opacity: 0, duration: 0.08, ease: INOUT, immediateRender: false }, 0.74)
      // impact: a soft specular spot and two faint rings (the opening's overflow clips them to the ellipse)
      .fromTo(S.spec, { opacity: 0 }, { opacity: 0.45, duration: 0.05, ease: OUT, immediateRender: false }, 0.62)
      .fromTo(S.spec, { opacity: 0.45 }, { opacity: 0, duration: 0.06, ease: INOUT, immediateRender: false }, 0.75);
    for (var pulse = 0; pulse < 2; pulse++) {
      S.ripples.forEach(function (r, k) {
        var at = 0.625 + pulse * 0.075 + k * 0.04;
        tl.to(r, { keyframes: { opacity: [0, 0.25, 0], scale: [0.15, 0.6, 1.1], easeEach: 'none' }, duration: 0.08 }, at);
      });
    }
    tl.fromTo(layerWet, { opacity: 0 }, { opacity: 1, duration: 0.13, ease: INOUT, immediateRender: false }, 0.66)
      .fromTo(layerWet, { scale: 0.99 }, { scale: 1, duration: 0.08, ease: OUT, force3D: true, immediateRender: false }, 0.66)
      .set(layerDry, { opacity: 0 }, 0.80)
      .fromTo(S.steam, { opacity: 0 }, { opacity: 0.6, duration: 0.08, ease: INOUT, immediateRender: false }, 0.77);

    // 4. Eat (80 to 100%)
    tl.fromTo(layerReady, { opacity: 0 }, { opacity: 1, duration: 0.11, ease: INOUT, immediateRender: false }, 0.80)
      .fromTo(layerReady, { scale: 0.99 }, { scale: 1, duration: 0.08, ease: OUT, force3D: true, immediateRender: false }, 0.80)
      .set(layerWet, { opacity: 0 }, 0.92)
      .to(S.stage, { opacity: 0, y: -16, duration: 0.07, ease: INOUT }, 0.93);
  }

  /* ---------- module API ---------- */

  function mountStatic(host, cfg) {
    host.innerHTML = staticHtml(cfg);
    S = { host: host, cfg: cfg, static: true };
    return true;
  }

  function mount(host, cfg, hero) {
    unmount();
    if (!host || !cfg) return false;
    if (reduceMotion.matches || window.innerWidth < 360 || !window.gsap || !window.ScrollTrigger || !hero) return mountStatic(host, cfg);
    gsap.registerPlugin(ScrollTrigger);
    var active = hero.getActive();
    if (!active || active.slug !== cfg.slug) return false;

    host.innerHTML = sceneHtml(cfg);
    var section = host.firstElementChild;
    var overlayWrap = document.createElement('div');
    overlayWrap.innerHTML = overlayHtml(active.img.currentSrc || active.img.src);
    var overlay = overlayWrap.firstElementChild;
    overlay.style.visibility = 'hidden';
    document.body.appendChild(overlay);

    var q = function (sel, root) { return (root || section).querySelector(sel); };
    var qa = function (sel, root) { return [].slice.call((root || section).querySelectorAll(sel)); };
    S = {
      host: host, cfg: cfg, hero: hero, section: section, overlay: overlay,
      pin: q('.v-scene-pin'), stage: q('.v-scene-stage'), bowl: q('.v-scene-bowl'), target: q('.v-scene-target'),
      steam: q('.v-scene-steam'), fill: q('.v-scene-fill'),
      cards: qa('.v-scene-card'), dots: qa('.v-scene-dot'),
      layers: { dry: q('.v-scene-layer--dry'), wet: q('.v-scene-layer--wet'), ready: q('.v-scene-layer--ready') },
      kettle: q('.v-scene-kettle'), flow: q('.v-scene-flow'), strands: qa('.v-scene-strand'), head: q('.v-scene-head'),
      sheen: q('.v-scene-sheen'), spec: q('.v-scene-spec'), ripples: qa('.v-scene-ripple'),
      pouch: q('.v-scene-pouch', overlay), pouchIn: q('.v-scene-pouch-in', overlay),
      strip: q('.v-scene-strip', overlay), openEl: q('.v-scene-open', overlay), mouth: q('.v-scene-mouth', overlay),
      heroImgEl: active.img, heroImg: active.img, glideEase: gsap.parseEase(M.EASE_INOUT),
      box: { w: 0, h: 0 }, G: {}, lifted: false, step: -1, p: 0, cleanups: [], timers: []
    };
    S.pouchImg = active.img;       // the hero's own <img>, moved into the overlay while gliding
    S.particles = buildParticles(cfg);
    S.pt = gsap.timeline();
    S.dots.forEach(function (d) {
      d.addEventListener('click', function () {
        var st = S.tl && S.tl.scrollTrigger; if (!st) return;
        var at = [0.02, 0.27, 0.57, 0.82][+d.dataset.dot];
        window.scrollTo({ top: st.start + (st.end - st.start) * at, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      });
    });

    var onRefreshInit = function () { measure(); };
    ScrollTrigger.addEventListener('refreshInit', onRefreshInit);
    S.cleanups.push(function () { ScrollTrigger.removeEventListener('refreshInit', onRefreshInit); });

    var wasDesktop = isDesktop(), rt = null;
    var onResize = function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        if (!S || S.static) return;
        if (isDesktop() !== wasDesktop) { var h = S.host, c = S.cfg, hr = S.hero; mount(h, c, hr); }
        ScrollTrigger.refresh();
      }, 150);
    };
    window.addEventListener('resize', onResize);
    S.cleanups.push(function () { clearTimeout(rt); window.removeEventListener('resize', onResize); });

    hero.suspendExit();
    S.ctx = gsap.context(function () {
      measure();
      S.g = { p: 0 };
      S.gtween = gsap.to(S.g, {
        p: 1, ease: 'none',
        scrollTrigger: {
          trigger: section, start: 0, scrub: M.SCRUB, invalidateOnRefresh: true,
          end: function () { return Math.max(60, section.getBoundingClientRect().top + window.scrollY - headerH()); }
        },
        onUpdate: function () { glide(S.g.p); }
      });
      buildTimeline();
    }, section);

    // decode the processed images after the hero intro, before the pin starts
    var preload = function () {
      if (!S) return;
      var imgs = [S.layers.dry, S.layers.wet, S.layers.ready, S.kettle];
      imgs.forEach(function (im) { if (!im.src) { im.src = im.dataset.src; if (im.decode) im.decode().catch(function () {}); } });
    };
    S.timers.push(setTimeout(preload, 2200));
    return true;
  }

  function unmount() {
    if (!S) return;
    var s = S;
    if (!s.static) {
      drop();
      s.timers.forEach(clearTimeout);
      s.cleanups.forEach(function (fn) { fn(); });
      if (s.ctx) s.ctx.revert();
      if (s.pt) s.pt.kill();
      if (s.hero) { s.hero.freeze(false); s.hero.resumeExit(); }
      if (s.overlay && s.overlay.parentNode) s.overlay.parentNode.removeChild(s.overlay);
    }
    if (s.host) s.host.innerHTML = '';
    S = null;
  }

  window.MMScene = { mount: mount, unmount: unmount, has: function (slug) { return !!(window.sceneFor && sceneFor(slug)); } };
})();
