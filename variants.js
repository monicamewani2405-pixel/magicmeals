/* =========================================================
   variants.js: hero design chooser (Designs 1, 2, 3)
   - Reads the choice (?hero=, sessionStorage, default 1)
   - Mounts/unmounts heroes/*.js into #hero-slot
   - Renders the static How It Works for Designs 2 and 3
   - Builds the fixed 1/2/3 chooser (Home view only)
   To remove the feature: delete this file, variants.css, heroes/switcher.js
   and heroes/wall.js, and their includes in index.html.
   ========================================================= */
const DESIGN_CHOOSER = true;

(function () {
  'use strict';

  var NAMES = { 1: 'Classic', 2: 'Switcher', 3: 'Split' };
  var MODS = { 1: 'classic', 2: 'switcher', 3: 'wall' };
  var STORE_KEY = 'mm-hero-design';
  var FADE_MS = 200;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var chooserEnabled = DESIGN_CHOOSER && new URLSearchParams(location.search).get('chooser') !== '0';

  var current = readSelection();   // chosen design
  var active = null;               // design currently mounted
  var staticCtx = null;            // gsap.context of the static How It Works
  var switchTimer = null;
  var captionTimer = null;
  var chooser = null, caption = null, live = null, buttons = [];

  /* ---------- selection ---------- */

  function valid(v) {
    v = String(v);
    return (v === '1' || v === '2' || v === '3') ? parseInt(v, 10) : null;
  }

  function readSelection() {
    var q = null, s = null;
    try { q = valid(new URLSearchParams(location.search).get('hero')); } catch (e) {}
    if (q) return q;
    try { s = valid(sessionStorage.getItem(STORE_KEY)); } catch (e) {}
    return s || 1;
  }

  function persist(n) {
    try { sessionStorage.setItem(STORE_KEY, String(n)); } catch (e) {}
    try {
      var u = new URL(location.href);
      u.searchParams.set('hero', String(n));
      history.replaceState(history.state, '', u.pathname + u.search + u.hash);
    } catch (e) {}
  }

  /* ---------- static How It Works (Designs 2 and 3) ---------- */

  var ICONS = {
    tear: '<svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14h28v26a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2z"/><path d="M10 14l4-6 4 6 4-6 4 6 4-6 4 6"/><path d="M6 22l8 3"/></svg>',
    pour: '<svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 28h32l-3 12a3 3 0 0 1-3 2H14a3 3 0 0 1-3-2z"/><path d="M20 6l8 6-4 8"/><path d="M26 22v2M30 20v2M22 22v2"/></svg>',
    water: '<svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M24 6c6 8 10 13 10 19a10 10 0 0 1-20 0c0-6 4-11 10-19z"/><path d="M19 27a5 5 0 0 0 5 5"/></svg>',
    eat: '<svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 24h36a18 18 0 0 1-36 0z"/><path d="M18 14c0-3 3-3 3-6M26 14c0-3 3-3 3-6"/></svg>'
  };

  var STEPS = [
    { name: 'Tear', desc: 'Tear open the pouch along the notch.', icon: ICONS.tear },
    { name: 'Pour', desc: 'Empty the rice and veggies into a bowl.', icon: ICONS.pour },
    { name: 'Add hot water', desc: 'Pour hot water up to the line.', icon: ICONS.water },
    { name: 'Eat', desc: 'Wait a few minutes, stir gently, and enjoy.', icon: ICONS.eat }
  ];

  function mountStaticHiw() {
    var host = document.getElementById('hiw-slot');
    if (!host) return;
    host.innerHTML =
      '<section id="how-it-works" data-section="how-it-works" class="v-hiw" aria-labelledby="vHiwTitle">' +
        '<div class="wrap">' +
          '<h2 id="vHiwTitle" class="v-hiw-title">How It Works</h2>' +
          '<ol class="v-hiw-grid">' +
            STEPS.map(function (s, i) {
              return '<li class="v-hiw-card">' +
                '<span class="v-hiw-num">' + (i + 1) + '</span>' +
                '<span class="v-hiw-icon">' + s.icon + '</span>' +
                '<h3 class="v-hiw-name">' + s.name + '</h3>' +
                '<p class="v-hiw-desc">' + s.desc + '</p>' +
              '</li>';
            }).join('') +
          '</ol>' +
        '</div>' +
      '</section>';

    if (reduceMotion.matches || !window.gsap || !window.ScrollTrigger) return;   // static final state
    gsap.registerPlugin(ScrollTrigger);
    var section = host.querySelector('.v-hiw');
    staticCtx = gsap.context(function () {
      gsap.from(section.querySelectorAll('.v-hiw-card'), {
        opacity: 0, duration: 0.6, ease: 'power1.out', stagger: 0.12,
        scrollTrigger: { trigger: section, start: 'top 80%', once: true }
      });
    }, section);
  }

  function unmountStaticHiw() {
    if (staticCtx) { staticCtx.revert(); staticCtx = null; }
  }

  /* ---------- mount / unmount ---------- */

  function unmountActive() {
    if (!active) return;
    var mod = window.MMHeroes && window.MMHeroes[MODS[active]];
    if (mod) mod.unmount();
    unmountStaticHiw();
    var hiw = document.getElementById('hiw-slot');
    if (hiw) hiw.innerHTML = '';
    active = null;
    delete document.body.dataset.heroDesign;
  }

  function refresh() {
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }

  function mountHome() {
    unmountActive();
    var slot = document.getElementById('hero-slot');
    var mod = window.MMHeroes && window.MMHeroes[MODS[current]];
    if (!slot || !mod) return;
    active = current;
    document.body.dataset.heroDesign = String(current);
    var p = mod.mount(slot);
    if (current !== 1) mountStaticHiw();
    Promise.resolve(p).then(refresh, refresh);
    refresh();
  }

  function setFading(on) {
    ['hero-slot', 'hiw-slot'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.toggle('v-fading', on);
    });
  }

  function switchTo(n) {
    n = valid(n);
    if (!n || (n === current && active === n)) return;
    current = n;
    persist(n);
    renderChooserState(true);
    announce('Hero design ' + n + ': ' + NAMES[n]);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    clearTimeout(switchTimer);
    setFading(true);
    switchTimer = setTimeout(function () {
      mountHome();
      requestAnimationFrame(function () { setFading(false); });
    }, reduceMotion.matches ? 0 : FADE_MS);
  }

  /* ---------- chooser UI ---------- */

  function announce(msg) {
    if (!live) return;
    live.textContent = '';
    setTimeout(function () { live.textContent = msg; }, 30);
  }

  function renderChooserState(animate) {
    if (!chooser) return;
    buttons.forEach(function (b, i) {
      var on = (i + 1) === current;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.classList.toggle('is-active', on);
    });
    clearTimeout(captionTimer);
    if (animate) {
      caption.classList.add('is-out');
      captionTimer = setTimeout(function () {
        caption.textContent = NAMES[current];
        caption.classList.remove('is-out');
      }, 150);
    } else {
      caption.textContent = NAMES[current];
    }
  }

  function measureBottomNav() {
    var nav = document.querySelector('.mobile-bottom-nav');
    var h = 0;
    if (nav && getComputedStyle(nav).display !== 'none') {
      var pb = parseFloat(getComputedStyle(nav).paddingBottom) || 0;   // safe-area is added again by the chooser
      h = Math.max(0, nav.offsetHeight - pb);
    }
    document.documentElement.style.setProperty('--bottom-nav-h', h + 'px');
  }

  function buildChooser() {
    chooser = document.createElement('div');
    chooser.className = 'v-chooser';
    chooser.id = 'heroChooser';
    chooser.hidden = true;
    chooser.innerHTML =
      '<span class="v-chooser-caption" aria-hidden="true"></span>' +
      '<div class="v-chooser-pill" role="group" aria-label="Hero design"></div>' +
      '<span class="v-chooser-live" role="status" aria-live="polite"></span>';
    caption = chooser.querySelector('.v-chooser-caption');
    live = chooser.querySelector('.v-chooser-live');
    var pill = chooser.querySelector('.v-chooser-pill');
    [1, 2, 3].forEach(function (n) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'v-chooser-btn';
      b.textContent = String(n);
      b.setAttribute('aria-label', 'Hero design ' + n + ': ' + NAMES[n]);
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { switchTo(n); });
      pill.appendChild(b);
      buttons.push(b);
    });
    document.body.appendChild(chooser);
    renderChooserState(false);
    measureBottomNav();
    window.addEventListener('resize', measureBottomNav);

    document.addEventListener('keydown', function (e) {
      if (chooser.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target;
      if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
      var n = valid(e.key);
      if (n) switchTo(n);
    });
  }

  /* ---------- routing ---------- */

  function onRendered(view) {
    clearTimeout(switchTimer);
    if (chooser) { chooser.hidden = view !== 'home'; measureBottomNav(); }
    if (view === 'home') mountHome();
    else unmountActive();
  }

  document.addEventListener('app:rendered', function (e) {
    onRendered(e.detail && e.detail.view);
  });

  function init() {
    if (chooserEnabled) buildChooser();
    persist(current);
    // main.js may already have rendered before this deferred script ran
    if (document.body.dataset.view) onRendered(document.body.dataset.view);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
