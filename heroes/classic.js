/* =========================================================
   hero.js: animated pouch-drop hero & scroll-driven How It Works
   - Static-first: the markup/CSS already show the final state.
   - This file adds motion (GSAP + ScrollTrigger) when allowed.
   - Continuous story: Veg Biryani pouch drops in hero,
     then transitions smoothly into the How It Works sequence.
   - Design 1 (Classic): mounted/unmounted by variants.js (window.MMHeroes.classic).
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var ctx = null;          // gsap.context, reverted on re-init
  var teardown = [];       // plain listeners to remove on re-init
  var initToken = 0;
  var hiwHost = null;      // #hiw-slot, filled with the pinned How It Works

  var HERO_HTML = `
        <section id="hero" data-section="hero" class="hero" aria-labelledby="heroTitle">
          <div class="hero-inner">
            <div class="hero-stage-wrap">
              <h1 id="heroTitle" class="hero-headline" data-hero="headline">
                <span class="hero-headline-line"><span>REAL</span> <span>FOOD.</span></span>
                <span class="hero-headline-line"><span>READY IN</span> <span>MINUTES.</span></span>
              </h1>
              <div class="hero-stage">
                <div class="hero-steam" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
                <div class="hero-shadow" data-hero="shadow" aria-hidden="true"></div>
                <!-- Layout footprint anchor for the pouch -->
                <div class="hero-pouch-anchor" id="heroPouchAnchor" aria-hidden="true"></div>
                <!-- 4 nested wrappers so scroll / parallax / float / drop tweens never fight over one transform -->
                <div class="hero-pouch" data-hero="scroll" id="heroPouch">
                  <div class="hero-pouch-parallax" data-hero="parallax">
                    <div class="hero-pouch-float" data-hero="float">
                      <img src="biryani_pouch_front.png" width="919" height="1007" alt="Magic Meals Royal Dum Veg Biryani freeze-dried meal pouch" class="hero-pouch-img" data-hero="pouch" fetchpriority="high">
                      <div class="hero-pouch-placeholder" aria-hidden="true">POUCH IMAGE HERE</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="hero-copy">
              <p class="hero-sub" data-hero="sub">Homestyle Indian meals. Just add hot water.</p>
              <div class="hero-actions">
                <button type="button" class="hero-btn hero-btn--primary" data-hero="btn" data-scroll-to="best-sellers">Shop Now</button>
                <button type="button" class="hero-btn hero-btn--secondary" data-hero="btn" data-scroll-to="how-it-works" data-scroll-fallback="best-sellers">How It Works</button>
              </div>
            </div>
          </div>
        </section>
  `;
  var HIW_HTML = `
        <section id="how-it-works" data-section="how-it-works" class="hiw-section" aria-labelledby="hiwTitle">
          <div class="hiw-pin-container" id="hiwPinContainer">
            <div class="wrap hiw-inner-wrap">
              <div class="hiw-header-group">
                <h2 id="hiwTitle" class="hiw-title">How It Works</h2>
                <div class="hiw-progress-nav" aria-label="Step progress">
                  <div class="hiw-progress-bar-track">
                    <div class="hiw-progress-bar-fill" id="hiwProgressBarFill"></div>
                  </div>
                  <div class="hiw-progress-dots" id="hiwProgressDots">
                    <button type="button" class="hiw-dot active" data-step-target="1" aria-label="Step 1: Pour"></button>
                    <button type="button" class="hiw-dot" data-step-target="2" aria-label="Step 2: Add hot water"></button>
                    <button type="button" class="hiw-dot" data-step-target="3" aria-label="Step 3: Eat"></button>
                  </div>
                </div>
              </div>

              <div class="hiw-layout-grid">
                <!-- Left Column: Step list (only active highlighted, others dimmed) -->
                <div class="hiw-steps-col" id="hiwStepsList" role="list" aria-label="Preparation steps">
                  <div class="hiw-step-card active" data-hiw-step="1" role="listitem">
                    <div class="hiw-step-badge">1</div>
                    <div class="hiw-step-text">
                      <h3 class="hiw-step-name">Pour</h3>
                      <p class="hiw-step-desc">Empty the rice and veggies into a bowl.</p>
                    </div>
                  </div>

                  <div class="hiw-step-card" data-hiw-step="2" role="listitem">
                    <div class="hiw-step-badge">2</div>
                    <div class="hiw-step-text">
                      <h3 class="hiw-step-name">Add hot water</h3>
                      <p class="hiw-step-desc">Pour hot water up to the line.</p>
                    </div>
                  </div>

                  <div class="hiw-step-card" data-hiw-step="3" role="listitem">
                    <div class="hiw-step-badge">3</div>
                    <div class="hiw-step-text">
                      <h3 class="hiw-step-name">Eat</h3>
                      <p class="hiw-step-desc">Wait 7 minutes, stir gently, and enjoy.</p>
                    </div>
                  </div>
                </div>

                <!-- Right Column: Visual Stage (Pouch Target, falling grains, water stream, steam, ceramic bowl) -->
                <div class="hiw-stage-col">
                  <div class="hiw-stage" id="hiwStage">
                    <!-- Target placeholder for the shared hero pouch (NO duplicate pouch element) -->
                    <div class="hiw-pouch-target" id="hiw-pouch-target" aria-hidden="true"></div>

                    <!-- Rice & Veggie Particles Stream (CSS shapes: warm cream, green, orange) -->
                    <div class="hiw-particles-field" id="hiwParticles" aria-hidden="true"></div>

                    <!-- Hot Water Stream -->
                    <div class="hiw-water-stream" id="hiwWaterStream" aria-hidden="true">
                      <div class="hiw-water-beam"></div>
                    </div>

                    <!-- Steam Wisps -->
                    <div class="hiw-steam-wisps" id="hiwSteamWisps" aria-hidden="true">
                      <span></span><span></span><span></span><span></span>
                    </div>

                    <!-- Photographic Ceramic Bowl with exact matching dimensions & geometry -->
                    <div class="hiw-bowl-actor" id="hiwBowlActor">
                      <div class="hiw-ceramic-bowl">
                        <div class="hiw-bowl-shadow" aria-hidden="true"></div>
                        <img src="how-it-works/bowl_empty.png" alt="Empty Ceramic Bowl" class="hiw-bowl-img hiw-bowl-empty-img" id="bowlEmptyImg" width="657" height="568">

                        <!-- Inner Cavity for Pour & Water animations -->
                        <div class="hiw-bowl-opening" id="hiwBowlOpening">
                          <!-- Dry mix mound (fills up at Step 1) -->
                          <div class="hiw-food-dry" id="foodDry">
                            <div class="hiw-dry-base"></div>
                            <div class="hiw-fleck hiw-fleck-pea" style="top:42%; left:42%;"></div>
                            <div class="hiw-fleck hiw-fleck-carrot" style="top:52%; left:58%;"></div>
                            <div class="hiw-fleck hiw-fleck-pea" style="top:58%; left:34%;"></div>
                            <div class="hiw-fleck hiw-fleck-carrot" style="top:45%; left:68%;"></div>
                            <div class="hiw-fleck hiw-fleck-pea" style="top:48%; left:25%;"></div>
                            <div class="hiw-fleck hiw-fleck-carrot" style="top:62%; left:72%;"></div>
                          </div>

                          <!-- Translucent water level with glossy sheen (rises at Step 2) -->
                          <div class="hiw-food-water" id="foodWater"></div>
                        </div>

                        <!-- Cooked Biryani Photo: exact matching photographic bowl (crossfades at Step 3) -->
                        <img src="how-it-works/bowl_ready_biryani.png" alt="Finished Veg Biryani" class="hiw-bowl-img hiw-bowl-ready-img" id="foodFinished" width="657" height="568">
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Fallback view for reduced motion or <360px screens -->
              <div class="hiw-fallback-view" id="hiwFallbackView" aria-hidden="true">
                <img src="how-it-works/bowl_ready_biryani.png" alt="Delicious Veg Biryani Ready" class="hiw-fallback-img" width="320" height="320" loading="lazy">
              </div>
            </div>
          </div>
        </section>
  `;

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

  function cleanup() {
    if (ctx) { ctx.revert(); ctx = null; }
    teardown.forEach(function (fn) { fn(); });
    teardown = [];
  }

  /* ---------- feature: CTA buttons (work even with no GSAP) ---------- */

  function bindButtons(hero) {
    hero.querySelectorAll('[data-scroll-to]').forEach(function (btn) {
      function onClick() {
        var target = document.getElementById(btn.dataset.scrollTo) ||
                     document.getElementById(btn.dataset.scrollFallback || '');
        if (target) target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
      }
      btn.addEventListener('click', onClick);
      teardown.push(function () { btn.removeEventListener('click', onClick); });
    });
  }

  /* ---------- feature: pouch image fallback placeholder ---------- */

  function watchImage(hero) {
    var img = hero.querySelector('[data-hero="pouch"]');
    if (!img) return;
    function showPlaceholder() { hero.classList.add('hero--no-image'); }
    if (img.complete && img.naturalWidth === 0) showPlaceholder();
    img.addEventListener('error', showPlaceholder);
    teardown.push(function () { img.removeEventListener('error', showPlaceholder); });
  }

  /* ---------- feature: hero intro timeline (about 2.2s) ---------- */

  function buildIntro(hero, els, onDone) {
    hero.classList.add('is-intro');           // hides steam until the pouch lands
    gsap.set(els.pouch, { willChange: 'transform', transformOrigin: '50% 100%' });  // squash from the base

    var tl = gsap.timeline({ onComplete: onDone });
    tl
      // 1. headline (and sub-line) fade/slide in
      .from(els.headline, { opacity: 0, y: 40, duration: 0.6, ease: 'power2.out' }, 0)
      .from(els.sub, { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out' }, 0.15)
      // 2. pouch falls from above the viewport; shadow grows and darkens as it nears the floor
      .from(els.pouch, { y: '-120vh', rotation: -12, duration: 0.9, ease: 'power2.in' }, 0.3)
      .from(els.shadow, { scale: 0.35, opacity: 0.08, duration: 0.9, ease: 'power2.in' }, 0.3)
      // 3. landing: squash, then elastic recovery (shadow follows the squash)
      .call(function () { hero.classList.remove('is-intro'); }, null, 1.2)
      .to(els.pouch, { scaleY: 0.88, scaleX: 1.08, duration: 0.12, ease: 'power1.out' }, 1.2)
      .to(els.shadow, { scaleX: 1.12, scaleY: 0.9, duration: 0.12, ease: 'power1.out' }, 1.2)
      .to(els.pouch, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' }, 1.32)
      .to(els.shadow, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' }, 1.32)
      // 4. settle wobble: -3, 2, -1, 0 degrees
      .to(els.pouch, {
        keyframes: [
          { rotation: -3, duration: 0.15 }, { rotation: 2, duration: 0.15 },
          { rotation: -1, duration: 0.15 }, { rotation: 0, duration: 0.15 }
        ],
        ease: 'sine.inOut'
      }, 1.32)
      // 5. buttons last, staggered
      .from(els.btns, { opacity: 0, y: 16, duration: 0.4, stagger: 0.1, ease: 'power2.out' }, 1.7);
    return tl;
  }

  /* ---------- feature: idle float ---------- */

  /* ---------- feature: idle float ---------- */

  function startFloat(els) {
    // y -10 -> 10 over 3s, yoyo. progress(0.5) starts it at y=0 so there is no jump after landing.
    var tw = gsap.fromTo(els.float, { y: -10 }, { y: 10, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    tw.progress(0.5);
    return tw;
  }

  /* ---------- feature: mouse parallax (fine pointers only) ---------- */

  function startParallax(hero, els) {
    if (!finePointer.matches) return;   // touch devices: float only
    var px = gsap.quickTo(els.parallax, 'x', { duration: 0.6, ease: 'power3.out' });
    var py = gsap.quickTo(els.parallax, 'y', { duration: 0.6, ease: 'power3.out' });
    var pr = gsap.quickTo(els.parallax, 'rotation', { duration: 0.6, ease: 'power3.out' });
    var hx = gsap.quickTo(els.headline, 'x', { duration: 0.8, ease: 'power3.out' });
    var hy = gsap.quickTo(els.headline, 'y', { duration: 0.8, ease: 'power3.out' });

    function move(e) {
      if ((window.scrollY || window.pageYOffset) > 10) return; // Only parallax at top of hero
      var r = hero.getBoundingClientRect();
      var nx = ((e.clientX - r.left) / r.width) * 2 - 1;   // -1..1
      var ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      px(nx * 12); py(ny * 12); pr(nx * 4);                 // pouch: up to 12px / 4deg
      hx(-nx * 6); hy(-ny * 6);                             // headline: opposite, about 6px
    }
    function leave() { px(0); py(0); pr(0); hx(0); hy(0); }

    hero.addEventListener('pointermove', move);
    hero.addEventListener('pointerleave', leave);
    teardown.push(function () {
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', leave);
    });
  }

  /* ---------- feature: shared pouch glide & How It Works sequence ---------- */

  function initSharedPouchSequence(hero, els, getFloatTween) {
    if (!window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    var hiwSection = document.getElementById('how-it-works');
    var pinContainer = document.getElementById('hiwPinContainer');
    var hiwTarget = document.getElementById('hiw-pouch-target');
    var heroPouchAnchor = document.getElementById('heroPouchAnchor');
    var heroPouch = els.scroll; // The single shared hero pouch [data-hero="scroll"]
    if (!hiwSection || !pinContainer || !hiwTarget || !heroPouchAnchor || !heroPouch) return;

    // Fallbacks: prefers-reduced-motion or screen < 360px
    if (reduceMotion.matches || window.innerWidth < 360) return;

    var stepCards = hiwSection.querySelectorAll('.hiw-step-card');
    var dots = hiwSection.querySelectorAll('.hiw-dot');
    var progressBarFill = document.getElementById('hiwProgressBarFill');
    var particlesField = document.getElementById('hiwParticles');
    var waterStream = document.getElementById('hiwWaterStream');
    var waterBeam = hiwSection.querySelector('.hiw-water-beam');
    var steamWisps = document.getElementById('hiwSteamWisps');
    var foodEmpty = document.getElementById('foodEmpty');
    var foodDry = document.getElementById('foodDry');
    var foodWater = document.getElementById('foodWater');
    var foodFinished = document.getElementById('foodFinished');
    var hiwBowlActor = document.getElementById('hiwBowlActor');
    var hiwStageLabel = hiwSection.querySelector('.hiw-stage-label, .hiw-stage-tag, .hiw-label');

    // Generate 30 dry food particles (rice grains, green peas, carrot flecks)
    if (particlesField && particlesField.children.length === 0) {
      for (var i = 0; i < 30; i++) {
        var p = document.createElement('div');
        var type = (i % 6 === 0) ? 'pea' : (i % 6 === 1) ? 'carrot' : 'rice';
        p.className = 'hiw-particle ' + type;
        var startX = (Math.random() - 0.5) * 32;
        var startY = (Math.random() - 0.5) * 12;
        gsap.set(p, {
          x: startX,
          y: startY,
          opacity: 0,
          rotation: Math.random() * 360
        });
        particlesField.appendChild(p);
      }
    }
    var particles = particlesField ? particlesField.querySelectorAll('.hiw-particle') : [];

    function setStep(stepNum) {
      stepCards.forEach(function (card) {
        if (card.dataset.hiwStep === String(stepNum)) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });

      dots.forEach(function (dot) {
        if (dot.dataset.stepTarget === String(stepNum)) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });

      if (progressBarFill) {
        progressBarFill.style.width = ((stepNum - 1) / 2 * 66.6 + 33.4) + '%';
      }
    }

    var isMobile = window.innerWidth <= 768;

    // Measurement & coordinate calculation
    var coords = {};
    function computeCoords() {
      var anchorRect = heroPouchAnchor.getBoundingClientRect();
      var scrollY = window.scrollY || window.pageYOffset;
      var scrollX = window.scrollX || window.pageXOffset;

      var startTop = anchorRect.top + scrollY;
      var startLeft = anchorRect.left + scrollX;
      var startW = anchorRect.width;
      var startH = anchorRect.height;

      // Position heroPouch fixed relative to viewport at scrollY=0
      gsap.set(heroPouch, {
        position: 'fixed',
        top: startTop,
        left: startLeft,
        width: startW,
        height: startH,
        zIndex: 90,
        pointerEvents: 'none',
        transformOrigin: '50% 50%'
      });

      // Calculate target position in #how-it-works when pinned
      var pinRect = pinContainer.getBoundingClientRect();
      var targetRect = hiwTarget.getBoundingClientRect();
      var stageOffsetY = targetRect.top - pinRect.top;
      var targetTop = 72 + stageOffsetY;
      var targetLeft = targetRect.left;
      var targetW = targetRect.width;
      var targetH = targetRect.height;

      coords.deltaX = (targetLeft + targetW / 2) - (startLeft + startW / 2);
      coords.deltaY = (targetTop + targetH / 2) - (startTop + startH / 2);
      coords.scale = targetW / startW;
    }

    computeCoords();
    ScrollTrigger.addEventListener('refreshInit', computeCoords);
    teardown.push(function () {
      ScrollTrigger.removeEventListener('refreshInit', computeCoords);
    });

    // Timing calculation: glide through hero (start: 0, end: pGlide), then 3 stages in pinned HIW
    var heroH = hero.offsetHeight || 600;
    var hiwH = hiwSection.offsetHeight || 2000;
    var totalScroll = heroH + hiwH - window.innerHeight;
    var pGlide = Math.min(0.24, Math.max(0.16, heroH / totalScroll));
    var pRemain = 1 - pGlide;
    var pStep1 = pGlide;                  // Step 1: Pour
    var pStep2 = pGlide + pRemain * 0.35; // Step 2: Add hot water
    var pStep3 = pGlide + pRemain * 0.65; // Step 3: Eat

    function jumpToStep(step) {
      var trigger = ScrollTrigger.getById('sharedPouchTrigger');
      if (trigger) {
        var targetP = (step === 1) ? pStep1 + pRemain * 0.10 :
                      (step === 2) ? pStep2 + pRemain * 0.10 :
                      pStep3 + pRemain * 0.10;
        var scrollPos = trigger.start + (trigger.end - trigger.start) * targetP;
        window.scrollTo({ top: scrollPos, behavior: 'smooth' });
      }
    }

    stepCards.forEach(function (card) {
      function onCardClick() {
        var step = parseInt(card.dataset.hiwStep, 10);
        jumpToStep(step);
      }
      card.addEventListener('click', onCardClick);
      teardown.push(function () { card.removeEventListener('click', onCardClick); });
    });

    dots.forEach(function (dot) {
      function onDotClick() {
        var step = parseInt(dot.dataset.stepTarget, 10);
        jumpToStep(step);
      }
      dot.addEventListener('click', onDotClick);
      teardown.push(function () { dot.removeEventListener('click', onDotClick); });
    });

    var heroSteam = hero.querySelector('.hero-steam');
    var heroActions = hero.querySelector('.hero-actions');
    var heroPouchImg = els.pouch;

    function updateProgress(prog) {
      // Pause float/parallax when scrolling, resume when back at top
      var ft = typeof getFloatTween === 'function' ? getFloatTween() : getFloatTween;
      if (prog > 0.005) {
        if (ft && !ft.paused()) {
          ft.pause();
          gsap.to(els.float, { y: 0, duration: 0.15, overwrite: 'auto' });
        }
        if (heroActions) heroActions.style.pointerEvents = 'none';
        if (els.sub) els.sub.style.pointerEvents = 'none';
      } else {
        if (ft && ft.paused()) {
          ft.resume();
        }
        if (heroActions) heroActions.style.pointerEvents = '';
        if (els.sub) els.sub.style.pointerEvents = '';
      }

      // Step highlighting (3 steps)
      if (prog < pStep2) {
        setStep(1);
      } else if (prog < pStep3) {
        setStep(2);
      } else {
        setStep(3);
      }

      // Ensure pouch visibility toggle (hidden after pour/fade at start of step 2)
      if (prog >= pStep2 + pRemain * 0.10) {
        heroPouch.style.visibility = 'hidden';
      } else {
        heroPouch.style.visibility = 'visible';
      }
    }

    // Reset pouch on cleanup
    teardown.push(function () {
      gsap.set(heroPouch, {
        position: '',
        top: '',
        left: '',
        width: '',
        height: '',
        zIndex: '',
        pointerEvents: '',
        transformOrigin: '',
        clearProps: 'all'
      });
      if (els.sub) gsap.set(els.sub, { clearProps: 'all' });
      if (els.btns) gsap.set(els.btns, { clearProps: 'all' });
      if (els.shadow) gsap.set(els.shadow, { clearProps: 'all' });
      if (heroSteam) gsap.set(heroSteam, { clearProps: 'all' });
      if (heroActions) heroActions.style.pointerEvents = '';
      if (hiwBowlActor) gsap.set(hiwBowlActor, { clearProps: 'all' });
      if (foodFinished) gsap.set(foodFinished, { clearProps: 'all' });
      if (steamWisps) gsap.set(steamWisps, { clearProps: 'all' });
      if (hiwStageLabel) gsap.set(hiwStageLabel, { clearProps: 'all' });
    });

    // Initial state of HIW actors
    gsap.set(heroPouch, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, visibility: 'visible' });
    gsap.set(waterStream, { opacity: 0 });
    gsap.set(steamWisps, { opacity: 0 });
    gsap.set(foodDry, { opacity: 0, scaleY: 0.3, y: 24 });
    gsap.set(foodWater, { opacity: 0 });
    gsap.set(foodFinished, { opacity: 0, scale: 0.97 });
    if (hiwBowlActor) gsap.set(hiwBowlActor, { opacity: 1, y: 0 });

    var masterTl = gsap.timeline({
      scrollTrigger: {
        id: 'sharedPouchTrigger',
        trigger: hero,
        start: 'top top',
        endTrigger: hiwSection,
        end: 'bottom bottom',
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          updateProgress(self.progress);
        }
      }
    });

    var pFade = pGlide * 0.15;

    // Phase 1: GLIDE from Hero to How It Works (0 -> pGlide)
    // Fade hero sub-line, buttons, shadow and steam in the first 15% of glide distance
    masterTl
      .to(heroPouch, {
        x: function () { return coords.deltaX; },
        y: function () { return coords.deltaY; },
        scale: function () { return coords.scale; },
        rotation: 0,
        duration: pGlide,
        ease: 'power1.inOut'
      }, 0)
      .to(els.sub, { opacity: 0, y: -20, duration: pFade, ease: 'power1.out' }, 0)
      .to(els.btns, { opacity: 0, y: -20, duration: pFade, ease: 'power1.out' }, 0)
      .to(els.shadow, { opacity: 0, y: -20, scale: 0.5, duration: pFade, ease: 'power1.out' }, 0)
      .to(heroSteam, { opacity: 0, y: -20, duration: pFade, ease: 'power1.out' }, 0)
      .to(els.headline, { opacity: 0, y: -10, duration: pFade * 2.5, ease: 'power1.out' }, 0)

      // Step 1: Pour (pStep1 -> pStep2) - tilts 35 degrees over bowl, particles cascade, dry mound builds up
      .to(heroPouch, {
        rotation: 35,
        x: function () { return coords.deltaX + (isMobile ? 22 : 36); },
        y: function () { return coords.deltaY + (isMobile ? -10 : -16); },
        duration: pRemain * 0.16,
        ease: 'power2.inOut'
      }, pStep1)
      .to(particles, {
        opacity: 1,
        y: function (i) { return 110 + (i % 6) * 14; },
        x: function (i) { return ((i % 5) - 2) * 12 + (Math.random() - 0.5) * 16; },
        rotation: function (i) { return (i * 35) + 120; },
        stagger: 0.003,
        duration: pRemain * 0.16,
        ease: 'power2.in'
      }, pStep1 + pRemain * 0.04)
      .to(foodDry, {
        opacity: 1,
        scaleY: 1,
        y: 0,
        duration: pRemain * 0.18,
        ease: 'power1.out'
      }, pStep1 + pRemain * 0.08)
      .to(particles, {
        opacity: 0,
        duration: pRemain * 0.06,
        ease: 'power1.out'
      }, pStep1 + pRemain * 0.22)
      .set(particles, { opacity: 0 }, pStep2)

      // Step 2: Add hot water (pStep2 -> pStep3) - pouch floats away/fades, water stream animates in, water level rises with sheen, steam starts
      .to(heroPouch, {
        opacity: 0,
        x: function () { return coords.deltaX + (isMobile ? 60 : 90); },
        y: function () { return coords.deltaY - 30; },
        duration: pRemain * 0.10,
        ease: 'power1.in'
      }, pStep2)
      .to(waterStream, { opacity: 0.85, duration: pRemain * 0.04 }, pStep2 + pRemain * 0.02)
      .fromTo(waterBeam, { scaleY: 0 }, { scaleY: 1, duration: pRemain * 0.12, ease: 'power1.in' }, pStep2 + pRemain * 0.02)
      .to(foodWater, { opacity: 0.75, duration: pRemain * 0.14 }, pStep2 + pRemain * 0.06)
      .to(steamWisps, { opacity: 0.85, duration: pRemain * 0.14 }, pStep2 + pRemain * 0.08)
      .to(waterBeam, { scaleY: 0, transformOrigin: 'bottom center', duration: pRemain * 0.08, ease: 'power1.out' }, pStep2 + pRemain * 0.18)
      .to(waterStream, { opacity: 0, duration: pRemain * 0.04 }, pStep2 + pRemain * 0.24)

      // Step 3: Eat (pStep3 -> finish) - crossfade into photographic finished biryani bowl with scale 0.97 -> 1, steam continues
      .to(foodFinished, { opacity: 1, scale: 1, duration: pRemain * 0.12, ease: 'power2.out' }, pStep3)
      .to(foodDry, { opacity: 0, duration: pRemain * 0.10, ease: 'power1.out' }, pStep3)
      .to(foodWater, { opacity: 0, duration: pRemain * 0.10, ease: 'power1.out' }, pStep3)
      // Anchor timeline duration to 1.0 so timeline playhead maps 1:1 with scroll progress
      .to({}, { duration: 0.01 }, 1.0);
  }

  /* ---------- init ---------- */

  function initHero() {
    cleanup();
    var token = ++initToken;   // ignore stale async inits if a re-render happens mid-load
    var hero = document.getElementById('hero');
    if (!hero) return Promise.resolve();

    bindButtons(hero);
    watchImage(hero);

    // Reduced motion: leave the static final state exactly as authored
    if (reduceMotion.matches) return Promise.resolve();

    return ensureGsap().then(function () {
      if (token !== initToken || !document.body.contains(hero)) return;   // view changed while scripts loaded

      var q = function (name) { return hero.querySelector('[data-hero="' + name + '"]'); };
      var els = {
        headline: q('headline'), sub: q('sub'), shadow: q('shadow'), pouch: q('pouch'),
        scroll: q('scroll'), parallax: q('parallax'), float: q('float'),
        btns: hero.querySelectorAll('[data-hero="btn"]')
      };

      ctx = gsap.context(function () {
        var floatTween = null;
        initSharedPouchSequence(hero, els, function () { return floatTween; });

        buildIntro(hero, els, function () {
          ctx.add(function () {
            gsap.set(els.pouch, { willChange: 'auto' });   // free the compositor layer after intro
            floatTween = startFloat(els);
            startParallax(hero, els);
          });
        });
      });
    }).catch(function (err) {
      console.warn('GSAP init skipped or failed:', err);
      hero.classList.remove('is-intro');
    });
  }

  /* ---------- module API ---------- */

  function mount(slot) {
    unmount();
    slot.innerHTML = HERO_HTML;
    hiwHost = document.getElementById('hiw-slot');
    if (hiwHost) hiwHost.innerHTML = HIW_HTML;
    return initHero();
  }

  function unmount() {
    initToken++;                       // abort any pending async init
    cleanup();                         // ctx.revert() kills ScrollTriggers/tweens; teardown removes listeners
    var hero = document.getElementById('hero');
    if (hero && hero.parentNode) hero.parentNode.removeChild(hero);   // takes the shared fixed pouch with it
    var pouch = document.getElementById('heroPouch');
    if (pouch && pouch.parentNode) pouch.parentNode.removeChild(pouch);
    if (hiwHost) hiwHost.innerHTML = '';
    hiwHost = null;
  }

  window.MMHeroes = window.MMHeroes || {};
  window.MMHeroes.classic = { mount: mount, unmount: unmount };
})();
