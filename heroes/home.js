/* =========================================================
   heroes/home.js: mounts the home hero (Design 2, heroes/switcher.js) into #hero-slot
   and its How It Works into #hiw-slot, on every Home render.
   - Pinned per-dish scene (scenes/hiw-scene.js) when the active dish has one,
     otherwise the static 4-card How It Works below
   - Falls back to ./vendor/ copies of GSAP if the CDN failed
   - Publishes --bottom-nav-h (mobile bottom nav height) for the hero and the scene
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var mounted = false;             // hero currently mounted
  var staticCtx = null;            // gsap.context of the static How It Works
  var mountToken = 0;

  /* ---------- helpers ---------- */

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // Use CDN copies if present, otherwise the local ./vendor fallbacks
  function ensureGsap() {
    var p = Promise.resolve();
    if (!window.gsap) p = p.then(function () { return loadScript('vendor/gsap.min.js'); });
    if (!window.ScrollTrigger) p = p.then(function () { return loadScript('vendor/ScrollTrigger.min.js'); });
    return p;
  }

  /* ---------- static How It Works (dishes without a scene) ---------- */

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

  /* ---------- pinned per-dish scene, static cards when the dish has none ---------- */

  function mountHiw() {
    var host = document.getElementById('hiw-slot');
    var hero = window.MMHeroes && window.MMHeroes.switcher;
    var a = hero && hero.getActive && hero.getActive();
    var cfg = a && window.sceneFor && window.sceneFor(a.slug);
    if (cfg && window.MMScene && window.MMScene.mount(host, cfg, hero)) return;
    mountStaticHiw();
  }

  function unmountHiw() {
    if (window.MMScene) window.MMScene.unmount();
    unmountStaticHiw();
    var host = document.getElementById('hiw-slot');
    if (host) host.innerHTML = '';
  }

  document.addEventListener('hero:switcher-change', function () {
    if (!mounted) return;
    unmountHiw();
    mountHiw();
    refresh();
  });

  /* ---------- mount / unmount ---------- */

  function refresh() {
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }

  function unmountHome() {
    mountToken++;
    if (!mounted) return;
    var hero = window.MMHeroes && window.MMHeroes.switcher;
    if (window.MMScene) window.MMScene.unmount();   // before the hero: it hands the pouch back first
    if (hero) hero.unmount();
    unmountStaticHiw();
    var hiw = document.getElementById('hiw-slot');
    if (hiw) hiw.innerHTML = '';
    mounted = false;
  }

  function mountHome() {
    unmountHome();
    var slot = document.getElementById('hero-slot');
    var hero = window.MMHeroes && window.MMHeroes.switcher;
    if (!slot || !hero) return;
    var token = ++mountToken;
    var go = function () {
      if (token !== mountToken) return;
      mounted = true;
      var p = hero.mount(slot);
      mountHiw();
      Promise.resolve(p).then(refresh, refresh);
      refresh();
    };
    if (window.gsap && window.ScrollTrigger) go();
    else ensureGsap().then(go, go);
  }

  function measureBottomNav() {
    var nav = document.querySelector('.mobile-bottom-nav');
    var h = 0;
    if (nav && getComputedStyle(nav).display !== 'none') {
      var pb = parseFloat(getComputedStyle(nav).paddingBottom) || 0;   // safe-area is added again where it is used
      h = Math.max(0, nav.offsetHeight - pb);
    }
    document.documentElement.style.setProperty('--bottom-nav-h', h + 'px');
  }

  /* ---------- routing ---------- */

  function onRendered(view) {
    measureBottomNav();
    if (view === 'home') mountHome();
    else unmountHome();
  }

  document.addEventListener('app:rendered', function (e) {
    onRendered(e.detail && e.detail.view);
  });

  function init() {
    window.addEventListener('resize', measureBottomNav);
    // main.js may already have rendered before this deferred script ran
    if (document.body.dataset.view) onRendered(document.body.dataset.view);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
