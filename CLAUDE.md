# Magic Meals prototype: handoff brief for Claude Code

Read this whole file before touching anything. Then follow "Phase 0" under "The task".

Date of this brief: 29 October 2026. Diwali is on Sunday 8 November 2026.

---

## 1. What this project is

A front-end **prototype** for Magic Meals (magicmeals.shop), an Indian ready-to-eat, freeze-dried vegetarian meal brand ("just add hot water"). The live store is on WooCommerce and is being migrated to Shopify. This prototype is the redesign. It was shown to the company, they liked it, and they now want:

1. **More than one product shown in the hero banner.**
2. **Several homepage design options** the viewer can flip between using numbered buttons at the bottom of the screen (1, 2, 3).
3. **A seasonal Diwali layer** that can be removed after the festival (a later phase, not part of the current task).

The prototype is deployed on Vercel (a static site). It is NOT on Shopify yet. Do not do any Shopify work in this task.

---

## 2. Tech stack and hard rules

- **Plain HTML, CSS and vanilla JavaScript.** No React, Vue, Tailwind, bundler or build step. Do not add any.
- **Animation:** GSAP 3.12.5 + ScrollTrigger 3.12.5 (cdnjs, with local fallbacks in `./vendor/`), plus native CSS keyframes/transitions. Do NOT add Three.js, Framer Motion, Lottie or anything else unless the user approves it.
- **Single-page app with a hash router.** Routes: `#home`, `#shop`, `#byob`, `#p-<id>`. State lives in one store object near the top of `main.js`. Clicks are handled by one delegated listener.
- **Colours:** every colour must be a CSS variable from `:root` in `style.css`. No new hard-coded hex or rgba values. For translucent colours use channel variables, e.g. `rgb(var(--black-rgb) / 0.08)`.
- **Animate only `transform`, `opacity`, `clip-path` and `stroke-dashoffset`.** No animated filters or blurs while scrubbing.
- **Never put a CSS `transform`, `filter` or `will-change: transform` on an ancestor of a pinned or `position: fixed` element.** It breaks ScrollTrigger pins and fixed positioning. The view-swap fade between routes must stay opacity-only.
- **Respect `prefers-reduced-motion`.** Show final static states and disable motion.
- **Every animation module must clean up** (kill ScrollTriggers, timers, listeners, animation frames, `gsap.context`) when leaving Home and must rebuild correctly when returning.
- **Keep CSS and JS in separate files.** No large inline `<script>` or `<style>` blocks.
- **Do not break existing features** (see section 5).
- It must work at 360, 390, 768, 1024 and 1440 px wide, with no horizontal page scroll.

---

## 3. Files (verify by listing the folder; this comes from an earlier audit)

- `index.html`: the HTML shell and script/style includes. **This is the only HTML file to edit.** A duplicate named `Magic Meals – Real Indian meals in 5 minutes.html` exists. Ignore it and do not delete it.
- `style.css`: all styles, with the `:root` tokens at the top.
- `main.js`: state, router (`navigateTo`, `initRoute`), render functions (`renderHomeView`, `renderShopView`, `renderProductView`), cart (`renderCartDrawer`, `modifyCart`, `toggleCart`, `flyToCart`, `flyToSlot`), promo bar (`initPromoBar`), auth modal logic, BYOB.
- `hero.js`: hero animation and the scroll-driven journey (gsap.context, `gsap.quickTo` cursor parallax, ScrollTrigger glide and How It Works).
- `vendor/`: local fallbacks `gsap.min.js` and `ScrollTrigger.min.js`.
- Images: pouch cutouts (e.g. `pouch_cutout_cropped.png`), `thumb_*.jpg` reel thumbnails, `logo_live.png` (the live-site logo, used in the header, drawer and footer), hero banners, and many screenshots.
- `scratch/` and ~40 Python patch/test scripts: leftovers from earlier work. Ignore them. Do not run or delete them.
- Files whose names start with `._` (e.g. `._BHINDI-MASALA.jpg`) are macOS metadata junk, not images. Never reference them in code.

Key element IDs (verify): `#appContainer` / `<main id="app">`, `#cartDrawer`, `#mobileDrawer`, `#authModalBackdrop`, `#byobStickyTray`, `#promoBar`, `#youtubeReelsContainer`, `#how-it-works`.

---

## 4. Brand tokens (already in `:root`, from the live site's Elementor CSS)

| Variable | Value | Note |
|---|---|---|
| `--brand-primary` | `#00796B` | teal; the announcement bar should use this |
| `--brand-secondary` | `#0173C2` | blue; main action colour (buttons, tabs, active nav) |
| `--brand-accent` | `#00A7D6` | cyan; decoration only (fails text contrast) |
| `--bg` | `#FFFFFF` | |
| `--bg-alt` | `#ECECEC` | |
| `--text` | `#000000` | |
| `--text-muted` | `#555555` | |
| `--border` | `#DADADA` | derived |
| `--brand-primary-dark` / `--brand-primary-tint` / `--brand-secondary-dark` | `#005F54` / `#E0F2F1` / `#014E82` | derived |

Fonts: variables `--font-body`, `--font-heading`, `--font-serif` (currently Plus Jakarta Sans and Playfair Display). Whether these match the live site is not confirmed.

Logo: `logo_live.png` (sky-blue to cyan square with a white spoon and fork, bold black wordmark).

---

## 5. What exists (confidence in brackets)

**Confirmed from screenshots or agent reports:**
- Live-site palette and logo applied; no hard-coded colours left in `style.css` / `main.js`.
- Home hero: big blue headline "REAL FOOD. READY IN MINUTES." behind a Veg Biryani pouch that drops in (fall, squash, wobble, floor shadow, steam, float, cursor parallax). Sub-line "Homestyle Indian meals. Just add hot water." and two buttons (Shop Now, How It Works).
- Header: transparent over the hero, turns solid white on scroll.
- Pinned "How It Works" section with 4 steps (Tear, Pour, Add hot water, Eat), a progress bar and dots, a bowl stage and a shared pouch that glides from the hero. The finished-dish step says "Ready in 7 minutes".
- Cart drawer with a free-delivery progress bar (threshold 499), fly-to-cart animation, cart badge bounce.
- Auth (sign-in/sign-up) modal.
- Build Your Own Box (BYOB) with a sticky tray and fly-to-slot animation.
- YouTube-based reels carousel (not local `<video>`; keep it that way).
- WhatsApp floating button, "Download Brochure" side tab, scroll-to-top button, announcement bar, mobile bottom nav.
- Opacity-based view-swap fade between routes.

**Requested in earlier prompts but NOT verified (check the code; do not assume):**
- Section stacking: everything after How It Works wrapped in `#after-hiw`, sliding up over the pinned section.
- Header left links changed to Shop, Combos, Profile (Jain removed; profile icon removed from the right; Profile opens the existing auth modal when signed out).
- Mobile drawer reduced to 3 items (Shop, BYOB or Combos, Profile).
- Hero sub-line, buttons, floor shadow and steam fading out before the pouch glides.
- A visible "torn top" effect on the pouch in How It Works step 1.
- Transition polish (step-card easing, finished-bowl scale-in, section background blend).

**Not built:** the 360° 3D pouch viewer, the variant/design chooser, the Diwali layer.

---

## 6. Known issues and open decisions (flag, do not silently "fix")

- **Preparation time is inconsistent.** The Veg Biryani pouch art says "Ready to eat in 7 minutes". Rajma Masala, Gajar Halwa and Fried Rice art say 5 minutes. The site's announcement bar and marquee say 5 minutes. Never rewrite pouch artwork. When showing a time next to a specific product, use that product's own time; for general copy, ask the user, and until then use "minutes".
- **Rajma Masala back panel** says net weight 95g while the front says 70g, shows "PRODUCT OF INDI" (typo), and lists onion, ginger and garlic on a pack marked "Jain". These are artwork problems for the client; do not edit the images, just mention if relevant.
- **Shopify route is undecided** (Liquid theme vs headless). Keep code modular so sections can later become Liquid sections.
- The user's Shopify trial is only a few days long; migration is a separate, later task.

---

## 7. The task: homepage design chooser

### Goal
Let a viewer flip between **three homepage hero designs** using numbered buttons (1, 2, 3) fixed at the bottom of the screen, without reloading the page. The company will pick one. All three must show **more than one product** except Design 1, which is the existing hero.

| # | Name | Summary |
|---|---|---|
| **1** | **Classic** | The existing hero (single Veg Biryani pouch drop) with its pinned How It Works. Must look and behave exactly as it does now. |
| **2** | **Range Switcher** | A trio (extendable to 5) of pouches: one large in the centre, neighbours smaller and angled behind it. Tap a neighbour to bring it to the centre. Background tint and dish details change per product. |
| **3** | **Range Wall** | A wall of many pouches in 2 or 3 rows drifting slowly in opposite directions (infinite marquee), with the headline and one featured pouch in front. Hover or tap a pouch to enlarge it and show its name, price and Add button. |

### Product list
Define once, in one config array (e.g. `HERO_PRODUCTS = ['veg-biryani', 'rajma-masala', 'gajar-halwa', ...]`, slugs to be confirmed with the user). Read name, price and image from the existing product data. Every image must be a **transparent PNG** of the front of the pouch. If an image has a background or is angled, show a labelled placeholder and report it. Never invent or generate product imagery.

### The chooser UI
- Fixed, bottom-centre pill with three round buttons labelled 1, 2, 3 (about 40 px, at least 44 px tap area on mobile). Small tooltip or label on hover/focus: Classic, Switcher, Wall.
- On mobile, sit above the bottom nav, and never overlap the WhatsApp button or the cart drawer. Use a z-index above page content but below modals and drawers.
- Active button highlighted with `--brand-secondary`. Use only `:root` variables.
- Keyboard: keys 1, 2, 3 switch designs (ignore when typing in an input). Buttons are real `<button>`s with `aria-label` and `aria-pressed`.
- Shows only on the Home view. Hidden on Shop, Product, BYOB.
- The choice is stored in the URL (`#home` plus a query param `?hero=1|2|3`, which must not interfere with the hash router) and in `sessionStorage`, so a link can be shared.
- Switching remounts only the hero (and its How It Works variant) without a full reload, scrolls to the top, and plays that design's intro.
- Controlled by one config flag (`DESIGN_CHOOSER = true`) and `?chooser=0` to hide it. Removing the feature later must be possible by deleting one include and one config block.

### Architecture
- `variants.js`: reads the choice, mounts and unmounts hero modules, builds the chooser.
- `heroes/classic.js`: a thin wrapper around the EXISTING hero code (no behaviour change). Exposes `mount(container)` and `unmount()`.
- `heroes/switcher.js`, `heroes/wall.js`: new modules with the same API. Prefix their CSS with `v-switcher-` and `v-wall-`.
- Each module owns a `gsap.context` and kills every ScrollTrigger, timer, listener and frame on `unmount()`. Mount and unmount must be idempotent, and switching 1 → 2 → 3 → 1 repeatedly must leave no leaks, no duplicate pouches and no leftover transforms on the header or body.
- Designs 2 and 3 have no shared pouch to glide into How It Works, so they use a **static 4-step card version** of How It Works (Tear, Pour, Add hot water, Eat) with the existing copy. Design 1 keeps the pinned version. The header stays transparent-to-solid in all three.

### Design 2 detail (Range Switcher)
- Headline "REAL FOOD. READY IN MINUTES." sits behind the pouches; no whole word may be hidden (pouches overlap at most the bottom 25% of the letters).
- Desktop: active pouch large and centred; neighbours at about 70% scale, rotated about 8° outward, partly behind it; if there are 5 products, the outer two at about 50%. Mobile: active pouch large, neighbours peek in at the edges at about 60%. Sub-line and both buttons visible on the first screen at 390×844 and 1440×800.
- Intro: centre pouch drops in first (same fall, squash, wobble, floor shadow as the classic hero), then the neighbours with a 0.15 s stagger. Steam only on the active pouch.
- Switching by click/tap on a neighbour, arrow keys, swipe or dots; about 0.7 s `power3.out`. Auto-advance every 6 s, paused on hover, while the tab is hidden, and for 10 s after any manual interaction.
- Under the active pouch: dish name, one-line description, price, and an "Add to cart" button that reuses the existing add-to-cart function and fly-to-cart animation. Crossfade this text when switching.
- Hero background tint changes per product via CSS variables defined in `:root`, transitioning over 0.6 s.
- Idle float with a different phase per pouch; mouse parallax on desktop only, with depth.

### Design 3 detail (Range Wall)
- Two or three rows of pouches (use every product in `HERO_PRODUCTS`, repeated to fill), each row moving slowly horizontally in the opposite direction to its neighbour, as a seamless infinite loop (transform only, duplicate the track for the loop).
- A semi-transparent brand-coloured wash and the headline sit in front of the rows; one larger featured pouch drops in at the centre with the same intro as Design 1.
- Hover (desktop) or tap (mobile) on a wall pouch pauses the row, lifts and enlarges that pouch, and shows a small card: name, price, Add to cart (existing function).
- Slight vertical parallax between rows on scroll.
- Performance: limit to what is visible, use `will-change: transform` only on the moving tracks, keep image sizes small (use resized copies, WebP if available), and pause all motion when the hero is off-screen or the tab is hidden.

### Acceptance checks (run once at the end of each phase, at 1440 px and 390 px)
- Design 1 is identical to before.
- 1/2/3 buttons switch designs with no page reload and no console errors; switching repeatedly leaves no duplicate pouches or leaks.
- Headline readable; sub-line and buttons visible on the first screen; no horizontal scroll.
- Add to cart works from Designs 2 and 3 and plays the fly-to-cart animation.
- Home → Shop → Home keeps the chosen design and everything still works (cart, auth modal, drawers, BYOB, header behaviour).

---

## 8. Phases (do ONE per run, then stop and report)

- **Phase 0 (read-only):** list the folder, read `index.html` structure, `main.js` top-level layout, `hero.js`, and the `:root` block. In 10 lines or fewer, report which items in section 5 "NOT verified" actually exist, and any surprises. Change nothing.
- **Phase 1:** `variants.js`, the chooser UI, `heroes/classic.js` wrapper, stubs for designs 2 and 3 (labelled placeholders), the static How It Works variant, and routing/cleanup. Design 1 must be unchanged.
- **Phase 2:** `heroes/switcher.js` (Design 2).
- **Phase 3:** `heroes/wall.js` (Design 3).
- **Phase 4 (later, only when asked):** Diwali layer.

### Diwali layer (for later, do not build yet)
Modules under `festive/` (`diya.js`, `hamper.js`, `anaar.js`) each with `mount()`/`unmount()`, controlled by `festive/config.js` with a start date, an end date (9 November 2026) and a global kill switch, all CSS prefixed `diwali-`, all removable by deleting one include. They must never block Add to Cart, must pause off-screen, cap particles at about 100 on phones, and be disabled under reduced motion. Concepts: anaar fountain with pouches popping out, diya lighting, a hamper box that opens (linked to BYOB), a sparkler cursor, and a "delivery before Diwali" banner with real dates supplied by the user.

---

## 9. How to work

- One phase per run. Do not start the next phase without being told.
- Stay inside the scope of the phase. Do not touch header, cart, modals, BYOB, reels, routing, colours or copy unless the phase says so.
- Do not ask questions unless blocked; make a sensible choice, state it in the report, and move on.
- Do not create walkthrough documents or take screenshots until the end of the phase. Make at most one browser check per phase, fix once if needed.
- Keep the final report to 6 lines or fewer: files changed, what to test, assumptions, anything missing (especially product images that are not transparent PNGs).
- The user is working with limited credits. Prefer small, correct edits over rewrites, and do not re-read large files you have already read.