/* =========================================================
   heroes/wall.js: Design 3 "True Full-Bleed Diagonal Split Hero"
   - No container boxes: Pouches exist directly inside the 
     full-bleed diagonal halves.
   - Interactive hover shifts the diagonal dividing seam.
   - Exposes mount(slot) and unmount()
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  var root = null, ctx = null, cleanups = [];
  var activeSide = 'travel'; // 'travel' | 'work'

  var JOURNEYS = {
    travel: {
      id: 'travel',
      tag: 'ON THE MOVE',
      title: 'Travel & Treks',
      subtitle: 'Ultralight • Luggage-safe • Just Add Hot Water',
      pouch: {
        id: 'veg-biryani',
        name: 'Veg Biryani',
        price: 225,
        img: 'assets/hero/veg-biryani-front-800.png',
        badge: 'Ready in 7 Mins'
      },
      ctaText: 'Pack Travel Meals',
      category: 'Combos'
    },
    work: {
      id: 'work',
      tag: 'DAILY CRAVING',
      title: 'Desk & Late Nights',
      subtitle: 'Pure Ghee Comfort • Zero Cooking • No Mess',
      pouch: {
        id: 'rajma-masala',
        name: 'Rajma Masala',
        price: 205,
        img: 'assets/hero/rajma-masala-front-800.png',
        badge: 'Homestyle Taste'
      },
      ctaText: 'Order Work Box',
      category: 'Meals'
    }
  };

  function rupees(n) { return '\u20B9' + Number(n).toLocaleString('en-IN'); }

  function build() {
    var j1 = JOURNEYS.travel;
    var j2 = JOURNEYS.work;

    return '<section class="v-split" data-design="3" data-active-side="travel" aria-label="Choose Your Meal Journey">' +
      '<!-- Top Central Headline Overlay -->' +
      '<div class="v-split-topbar">' +
        '<span class="v-split-top-kicker">TWO WAYS TO ENJOY REAL INDIAN FOOD</span>' +
        '<h1 class="v-split-top-title">REAL FOOD. READY IN MINUTES.</h1>' +
      '</div>' +

      '<!-- The Diagonal Dividing Seam Glow -->' +
      '<div class="v-split-seam" aria-hidden="true"></div>' +

      '<!-- Left Diagonal Half: Travel -->' +
      '<div class="v-split-half v-split-half--travel" data-side="travel" role="region" aria-label="Travel and Treks Meals">' +
        '<div class="v-split-content">' +
          '<div class="v-split-text">' +
            '<span class="v-split-pill-tag">' + j1.tag + '</span>' +
            '<h2 class="v-split-half-title">' + j1.title + '</h2>' +
            '<p class="v-split-half-desc">' + j1.subtitle + '</p>' +
            '<div class="v-split-btn-group">' +
              '<button type="button" class="v-split-cta-btn" data-go="shop" data-cat="' + j1.category + '">' + j1.ctaText + ' &rarr;</button>' +
              '<button type="button" class="v-split-quick-add" data-add="' + j1.pouch.id + '" aria-label="Add ' + j1.pouch.name + ' to cart">' +
                'Quick Add ' + rupees(j1.pouch.price) +
              '</button>' +
            '</div>' +
          '</div>' +
          '<div class="v-split-pouch-stage">' +
            '<div class="v-split-pouch-floor" aria-hidden="true"></div>' +
            '<div class="v-split-pouch-actor">' +
              '<span class="v-split-pouch-badge">' + j1.pouch.badge + '</span>' +
              '<img src="' + j1.pouch.img + '" alt="' + j1.pouch.name + ' Pouch" width="400" height="625" class="v-split-pouch-standout" fetchpriority="high">' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<!-- Right Diagonal Half: Work & Desk -->' +
      '<div class="v-split-half v-split-half--work" data-side="work" role="region" aria-label="Desk and Late Night Meals">' +
        '<div class="v-split-content">' +
          '<div class="v-split-text">' +
            '<span class="v-split-pill-tag">' + j2.tag + '</span>' +
            '<h2 class="v-split-half-title">' + j2.title + '</h2>' +
            '<p class="v-split-half-desc">' + j2.subtitle + '</p>' +
            '<div class="v-split-btn-group">' +
              '<button type="button" class="v-split-cta-btn" data-go="shop" data-cat="' + j2.category + '">' + j2.ctaText + ' &rarr;</button>' +
              '<button type="button" class="v-split-quick-add" data-add="' + j2.pouch.id + '" aria-label="Add ' + j2.pouch.name + ' to cart">' +
                'Quick Add ' + rupees(j2.pouch.price) +
              '</button>' +
            '</div>' +
          '</div>' +
          '<div class="v-split-pouch-stage">' +
            '<div class="v-split-pouch-floor" aria-hidden="true"></div>' +
            '<div class="v-split-pouch-actor">' +
              '<span class="v-split-pouch-badge">' + j2.pouch.badge + '</span>' +
              '<img src="' + j2.pouch.img + '" alt="' + j2.pouch.name + ' Pouch" width="400" height="625" class="v-split-pouch-standout">' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<!-- Bottom Floating Guide Cue -->' +
      '<div class="v-split-bottom-cue">' +
        '<button type="button" class="v-split-cue-btn" data-scroll-to="how-it-works">' +
          '<span>How It Works</span>' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>' +
        '</button>' +
      '</div>' +
    '</section>';
  }

  function listen(target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    cleanups.push(function () { target.removeEventListener(type, fn, opts); });
  }

  function setActiveSide(side) {
    if (!root || activeSide === side) return;
    activeSide = side;
    root.setAttribute('data-active-side', side);
  }

  function setupMotion() {
    if (reduceMotion.matches || !window.gsap) return;

    var topbar = root.querySelector('.v-split-topbar');
    var halves = root.querySelectorAll('.v-split-half');
    var pouches = root.querySelectorAll('.v-split-pouch-actor');
    var cue = root.querySelector('.v-split-bottom-cue');

    ctx = gsap.context(function () {
      // Intro timeline
      var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      tl.from(topbar, { opacity: 0, y: -25, duration: 0.6 })
        .from(halves, { opacity: 0, duration: 0.7 }, 0.2)
        .from(pouches, {
          y: 40,
          scale: 0.88,
          duration: 0.9,
          stagger: 0.15,
          ease: 'back.out(1.3)'
        }, 0.3)
        .from(cue, { opacity: 0, y: 15, duration: 0.4 }, 0.8);

      // Opposing subtle idle floating
      pouches.forEach(function (p, i) {
        var tween = gsap.to(p, {
          y: i === 0 ? -12 : 12,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
        tween.progress(i === 0 ? 0.2 : 0.7);
      });

      // Mouse Parallax on Desktop
      if (finePointer.matches) {
        var travelPouch = root.querySelector('.v-split-half--travel .v-split-pouch-actor');
        var workPouch = root.querySelector('.v-split-half--work .v-split-pouch-actor');
        var qTravelX = gsap.quickTo(travelPouch, 'x', { duration: 0.6, ease: 'power3.out' });
        var qTravelY = gsap.quickTo(travelPouch, 'y', { duration: 0.6, ease: 'power3.out' });
        var qWorkX = gsap.quickTo(workPouch, 'x', { duration: 0.6, ease: 'power3.out' });
        var qWorkY = gsap.quickTo(workPouch, 'y', { duration: 0.6, ease: 'power3.out' });

        function onMouseMove(e) {
          if ((window.scrollY || 0) > 40) return;
          var nx = (e.clientX / window.innerWidth) * 2 - 1;
          var ny = (e.clientY / window.innerHeight) * 2 - 1;
          qTravelX(nx * 16);
          qTravelY(ny * 12);
          qWorkX(nx * -16);
          qWorkY(ny * -12);
        }

        listen(root, 'pointermove', onMouseMove);
      }
    }, root);
  }

  function mount(slot) {
    unmount();
    slot.innerHTML = build();
    root = slot.firstElementChild;
    activeSide = 'travel';

    var travelHalf = root.querySelector('.v-split-half--travel');
    var workHalf = root.querySelector('.v-split-half--work');

    // Hover or Tap interaction to expand respective diagonal half
    listen(travelHalf, 'pointerenter', function () { setActiveSide('travel'); });
    listen(workHalf, 'pointerenter', function () { setActiveSide('work'); });

    listen(travelHalf, 'click', function (e) {
      if (!e.target.closest('button, a')) setActiveSide('travel');
    });
    listen(workHalf, 'click', function (e) {
      if (!e.target.closest('button, a')) setActiveSide('work');
    });

    // Scroll cue button
    var scrollBtn = root.querySelector('.v-split-cue-btn');
    if (scrollBtn) {
      listen(scrollBtn, 'click', function () {
        var hiw = document.getElementById('how-it-works');
        if (hiw) hiw.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
      });
    }

    setupMotion();
    return Promise.resolve();
  }

  function unmount() {
    if (ctx) { ctx.revert(); ctx = null; }
    cleanups.forEach(function (fn) { fn(); });
    cleanups = [];
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = null;
  }

  window.MMHeroes = window.MMHeroes || {};
  window.MMHeroes.wall = { mount: mount, unmount: unmount };
})();
