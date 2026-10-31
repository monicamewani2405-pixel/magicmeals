/* =========================================================
   scenes/motion.js: shared eases and durations for Design 2
   (pinned scene in scenes/hiw-scene.js and the hero in heroes/switcher.js).
   The CSS twin of EASE_OUT is --v-ease in scenes/scene.css.
   Linear is only for loops and scrubbed progress.
   ========================================================= */
(function () {
  'use strict';
  window.MMMotion = {
    EASE_OUT: 'power3.out',
    EASE_INOUT: 'power2.inOut',
    EASE_IN: 'power2.in',                          // gravity: falls only
    EASE_LAND: 'elastic.out(1, 0.4)',              // the one allowed overshoot: the pouch landing
    EASE_LOOP: 'sine.inOut',
    CSS_EASE: 'cubic-bezier(0.16, 1, 0.3, 1)',
    D: { fast: 0.25, base: 0.45, slow: 0.7, fall: 0.9 },
    SCRUB: 0.8
  };
})();
