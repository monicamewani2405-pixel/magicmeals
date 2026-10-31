# TASK: mobile polish for the home hero and the pinned scene, remove the mobile bottom nav, fix the cart badge, and keep desktop unchanged

## Context
Magic Meals front-end prototype: plain HTML/CSS/vanilla JS, GSAP 3.12.5 + ScrollTrigger, no framework, no build step. Windows with PowerShell. Read CLAUDE.md in the project root first. The home page has ONE hero now (the Range Switcher, heroes/switcher.js) and a pinned per-dish "How It Works" scene (scenes/). Goals:
1. Make the hero and the pinned scene look and perform well on phones.
2. REMOVE the mobile bottom navigation bar (Home, Shop, Menu, Cart) completely.
3. Fix the cart count badge on mobile: it currently covers the cart icon.
4. **Desktop must stay exactly as it is.** Treat any desktop visual or behaviour change as a bug.

## Scope
Allowed to change: heroes/switcher.js and its CSS; scenes/ (hiw-scene.js, scene.css, scene-data.js, motion.js if present); tools/prep-scene.py; new tools/mobile-check script; AND, only for the bottom-nav removal and the badge fix: index.html, style.css and main.js. Everything else stays untouched (auth modal logic, BYOB logic, reels, routing, copy, colours, the cart's behaviour). If a fixed element we don't own (WhatsApp button, scroll-to-top, "Download Brochure" tab) overlaps our content on mobile, adjust only its mobile position or size from our side and report it.

All new or changed CSS must be inside the project's existing mobile media query (find the breakpoint the bottom nav and mobile drawer already use, probably max-width 768px; use the same one and report if the scenes use a different one). No rule outside a mobile query may change.

## How to work
One pass. Do not ask questions (decide, and list assumptions in the report). No walkthrough documents. Use grep instead of re-reading large files; do not open images in scratch/. No new hard-coded colours.

## Step 0: safety and desktop baseline (do this BEFORE any change)
1. `git status`; commit everything with `git add -A` and `git commit -m "Before mobile pass"`, then `git tag before-mobile-pass`.
2. Write tools/desktop-baseline script (Playwright or similar, Chromium) that, with `prefers-reduced-motion: reduce` emulated (so animations end in static final states and screenshots are deterministic), captures full-page screenshots at 768x1024, 1024x768, 1280x800, 1440x900 and 1920x1080 of: Home (top, and after scrolling through the pinned scene to the end), Shop, one Product page, BYOB, the cart drawer open, the auth modal open. Save them to tools/baseline/. Also record, for Home at 1440x900 with animations ON, the average frame time while scrolling through the pinned scene, and the ScrollTrigger.getAll().length. Run it NOW, on the unchanged code.

## Part 1: remove the mobile bottom nav
1. Find the bottom nav (the bar with Home, Shop, Menu, Cart (n)): its markup in index.html or main.js templates, its CSS, and every JS reference (ids, classes, event handlers, cart-count updates, active-tab highlighting). Grep first, list what you found, then remove the markup, the CSS and the JS that only served it. JS that updates the cart count must keep working for the header badge and must not throw when the removed elements are absent (null-guard it).
2. Remove every offset that existed only to make room for it: body or main padding-bottom, `bottom:` offsets or `--bottom-nav-h` style variables used by the WhatsApp button, scroll-to-top button, #byobStickyTray, any sticky add-to-cart bar, toasts, drawers (cart drawer and mobile drawer heights), the free-delivery bar, and the home hero. Use only `env(safe-area-inset-bottom)` plus normal margins (about 16px) instead. Check each of these in the Home, Shop, Product and BYOB views.
3. Everything the bar offered must stay reachable on mobile through the header, in EVERY view (Home, Shop, Product, BYOB): 
   - the header is fixed or sticky at the top (it must not scroll away);
   - left: a menu (hamburger) button, 44x44, that opens the existing #mobileDrawer (items: Shop, BYOB or Combos, Profile; do not change the drawer's items). If the mobile header does not have a menu button, add one that is visible only inside the mobile media query;
   - centre: the logo, linking to Home;
   - right: search and cart icons (cart opens the existing cart drawer), each with a 44x44 tap area.
   Keep desktop's header markup and behaviour untouched (a mobile-only button must be display:none outside the mobile query).
4. The WhatsApp button on mobile: 48px, bottom 16px + safe area, right 12px, and make sure it never covers the hero's buttons or the Add buttons (reserve at least 72px of clear space at the bottom of the first screen).
5. The BYOB sticky tray and any sticky purchase bar must sit at the bottom edge now with no gap where the bottom nav used to be.

## Part 2: fix the cart badge on mobile
Find the cart count badge in the header (probably #cartBadgeCount and its CSS) and any second copy of it for mobile.
1. Inside the mobile query only: the cart button is a 44x44 tap area with a 24px icon. The badge is a small pill placed at the icon's top-right corner, outside the glyph: min-width 16px, height 16px, padding 0 4px, font-size 10px, font-weight 600, line-height 16px, border-radius 999px, `top: 2px; right: 0` offsets (use top/right for placement, not transform, because the "bump" animation (@keyframes cartBadgePop) scales it with transform; keep that animation working with `transform-origin: center`), and a 2px ring in the page background colour (var(--bg)) so it separates from the icon.
2. The badge text must never be clipped or overlap the middle of the icon: show "99+" for 100 or more. Keep its current colours and its current show/hide behaviour (do not change when it appears).
3. Verify with counts 0, 1, 9, 10, 99 and 100 at 360px and 390px widths: programmatically measure the badge rect against the icon rect and assert that the badge does not cover the central 60% of the icon.
4. Desktop badge styles must not change.

## Part 3: hero on mobile (Range Switcher)
1. At every portrait viewport (360x640, 375x667, 390x844, 412x915, 430x932) the first screen shows: the headline, the pouch cluster with the active pouch fully visible, the dish name, the description (max 2 lines), and both buttons, without scrolling and not covered by the header or the WhatsApp button or the "Download Brochure" tab. Use svh with a vh fallback, never plain vh. Test the longest product name and description ("Paneer Butter Masala" and its description) so nothing pushes the buttons off the first screen.
2. Hide the previous/next arrows on touch screens (they cover pouches). Navigation by swipe, tapping a neighbouring pouch, and the dots (tap area at least 44x44, the visible dot may be smaller). Text at least 14px, buttons 16px.
3. Landscape phones (height under 500px): do not pin; use a compact layout and the static step cards.
4. Touch: `touch-action: pan-y` on the cluster; treat a gesture as a horizontal swipe only when |dx| > 40px and |dx| > 1.5 x |dy|; passive listeners; no preventDefault on touchmove; no scroll snap or hijack. Gate hover and mouse parallax with matchMedia('(hover: hover)'). Auto-advance pauses on touch, resumes 10s after the last interaction, and is off under reduced motion.

## Part 4: viewport jitter and the pinned scene on mobile
1. `ScrollTrigger.config({ ignoreMobileResize: true })` before creating triggers; refresh only on width or orientation changes (debounced 250ms), never on small height-only changes (address bar). Size the stage in svh, not JS pixel heights from innerHeight. Use `anticipatePin: 1`. Cache rects (pouch start rect, kettle spout tip, bowl opening) and recompute only on refresh, never per frame. The fixed glide overlay uses position: fixed, top/left 0 and transform only, sits below the header, and is unaffected by visualViewport resizing.
2. Layout under 768px: the stage on top (about 44svh max), progress bar and dots between the stage and the step text, only the ACTIVE step card below, bowl, pouch, kettle (if present) and label fully visible at every step at 360x640 too, with at least 12px side margins. Pin length about 250svh, scrub 0.5. Step text at least 15px, no horizontal overflow, and the label "Ready in N minutes" never overlaps food or the card.
3. Reduce load on phones: 20 to 28 particles, a single water strand, at most 3 CSS steam wisps with no blur or filter, no animated shadows. Animate only transform and opacity (plus clip-path on the heap if it measures fine); will-change only during animation.
4. Images: in tools/prep-scene.py also write mobile WebP variants (scene images and bowl 640px max, kettle 480px max, hero pouches 480px tall max, named `*-640.webp` etc.) and pick them with matchMedia or srcset. Width and height attributes everywhere. Load the active dish's scene images only after the hero intro finishes (requestIdleCallback with a timeout), `img.decode()` them before the pin starts, and do not preload other dishes' scenes. Keep the home hero's total image weight under 1.5 MB on mobile and report the real number.
5. Rotating the phone (portrait to landscape and back) and resizing must not break the glide or leave elements misplaced.
6. Under prefers-reduced-motion and below 360px width: no pin and no glide; static hero and the 4 step cards stacked with the "ready" image. unmount() leaves no listeners or tweens; ScrollTrigger.getAll().length returns to its baseline.

## Part 5: measurement
Write tools/mobile-check (reusable). Use headless Chromium with mobile emulation (touch, deviceScaleFactor 3, mobile user agent) at 360x640, 375x667, 390x844, 412x915, 430x932, 844x390 (landscape) and 768x1024 (tablet), with CPU throttling off, 4x and 6x (Chrome DevTools Protocol Emulation.setCPUThrottlingRate).
1. Scroll the whole pinned scene with a scripted smooth scroll at 360x640, 390x844 and 412x915 (with and without 4x throttle) and record requestAnimationFrame deltas. Report average frame time, percentage of frames over 20ms and over 33ms, and the worst frame. Target on the 4x throttle: at most 10% over 20ms, none over 100ms. If missed, reduce work (fewer particles, drop the second strand, smaller images, simpler steam) and measure again, up to two rounds.
2. Lighthouse (mobile) if available: report LCP, CLS and TBT for the home page. CLS under 0.1 (reserve space for images and pin spacers).
3. Check there are no horizontal scrollbars (document.documentElement.scrollWidth <= innerWidth) in Home, Shop, Product and BYOB at every viewport, and that nothing important sits under the header, WhatsApp button or the "Download Brochure" tab.
4. Pause every ticker, timeline and CSS loop when the hero or scene is off-screen or document.hidden.

## Part 6: DESKTOP MUST NOT CHANGE (verification)
1. Re-run the desktop baseline script from Step 0 on the changed code (same emulated reduced motion, same viewports, same pages and states) and compare each screenshot with its baseline pixel by pixel (Pillow ImageChops or pixelmatch). Report the percentage of different pixels per screenshot. The accepted difference is zero (or under 0.05% from anti-aliasing noise). If any desktop screenshot differs more, find the cause (a rule that leaked outside the mobile query, a removed shared element, an edit to a shared function), fix it, and re-run. Do not "accept" a desktop difference.
2. Re-run the animated desktop measurement at 1440x900 (average frame time while scrolling the scene, and ScrollTrigger.getAll().length). The frame time must be within 10% of the baseline, and the count identical.
3. Check, at 1024x768 and 1440x900, that: the header is unchanged, the mobile menu button is not visible, no bottom bar exists, the cart badge looks exactly as before, and the cart drawer, auth modal and BYOB work.
4. Run `git diff --stat` and confirm: every CSS change in style.css and in the scenes/switcher CSS is inside the mobile query (list any changed selector that is not), and only the allowed files changed.

## Report
Contact sheet first: build ONE image grid of the scene at progress 0, 25%, 55%, 70%, 80% and 100% for 360x640, 390x844 and 430x932, plus the hero first screen at each portrait size and the header with the cart badge at counts 0, 9 and 99+. View it once and fix anything clipped or misaligned (one round). Then report in 12 lines or fewer: viewports passing, frame-time numbers, hero image weight, Lighthouse numbers if available, the desktop pixel-diff results (must be about zero), everything that overlapped from outside our scope and how you handled it, anything you could not verify. Then stop.
