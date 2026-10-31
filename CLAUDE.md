# Magic Meals prototype: handoff brief for Claude Code

Read this whole file before touching anything.

Date of this brief: 29 October 2026. Diwali is on Sunday 8 November 2026.

---

## 1. What this project is

A front-end **prototype** for Magic Meals (magicmeals.shop), an Indian ready-to-eat, freeze-dried vegetarian meal brand ("just add hot water"). The live store is on WooCommerce and is being migrated to Shopify. This prototype is the redesign. It was shown to the company, they liked it, and they now want:

1. **More than one product shown in the hero banner.**
2. **A single home hero with several products** (the Range Switcher, section 7).
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
- `heroes/switcher.js`: the home hero (Range Switcher). `heroes/home.js`: mounts it into `#hero-slot`, mounts the How It Works into `#hiw-slot`, loads the `./vendor/` GSAP fallback. `hero-products.js`: `HERO_PRODUCTS`. `variants.css`: `.v-switcher-*` and `.v-hiw-*` styles.
- `scenes/`: the pinned per-dish How It Works (`hiw-scene.js`, `scene-data.js`, `scene.css`, `scene-colors.css`, `motion.js`, processed images). `tools/prep-scene.py` builds a dish's scene images.
- `vendor/`: local fallbacks `gsap.min.js` and `ScrollTrigger.min.js`.
- Images: pouch cutouts (e.g. `pouch_cutout_cropped.png`), `thumb_*.jpg` reel thumbnails, `logo_live.png` (the live-site logo, used in the header, drawer and footer), hero banners, and many screenshots.
- `scratch/` and ~40 Python patch/test scripts: leftovers from earlier work. Ignore them. Do not run or delete them.
- Files whose names start with `._` (e.g. `._BHINDI-MASALA.jpg`) are macOS metadata junk, not images. Never reference them in code.

Key element IDs (verify): `#appContainer` / `<main id="app">`, `#cartDrawer`, `#mobileDrawer`, `#authModalBackdrop`, `#byobStickyTray`, `#promoBar`, `#youtubeReelsContainer`, `#how-it-works`.

---

## 4. Brand tokens (already in `:root`, from the live site's Elementor CSS)

| Variable | Value | Note |
|---|---|---|
| `--brand-primary` | `#0173C2` | blue; main action colour (hero headline, buttons, tabs, active nav) |
| `--brand-secondary` | `#00796B` | teal; announcement bar and accents |
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

## 5. Current state

- **Designs 1 and 3 and the chooser were removed; restore from git tag `before-removing-designs-1-3`.**
- Single home hero: the **Range Switcher** (`heroes/switcher.js`). Headline "REAL FOOD. READY IN MINUTES." behind 3 to 5 pouches, the active one large in the centre. Click a neighbour, arrow keys, swipe, dots or auto-advance (every 6 s, paused on hover, hidden tab and for a while after manual input) switch dishes. Under the active pouch: dish name, one-line description, price, "Add to cart" (existing add-to-cart and fly-to-cart) and "Shop Now". Background tint per dish via the `--tint-<slug>` variables in `:root`.
- Below it, the **How It Works**: a pinned, scroll-scrubbed per-dish scene when the active dish has an entry in `scenes/scene-data.js` (the pouch glides from the hero, tears, pours, hot water, ready), otherwise the static 4-card version (`heroes/home.js`). To add a dish scene, put `dry`, `wet` and `ready` images in `scenes/<slug>/`, run `python tools/prep-scene.py <slug>` and add one entry to `scenes/scene-data.js`.
- Shared eases and durations live in `scenes/motion.js` (CSS twin `--v-ease`). Use them for all hero and scene motion.
- Header: transparent over the hero, solid after scrolling (`main.js`, keyed on `[data-hero-root]`).
- Also present: cart drawer with free-delivery bar (threshold 499) and fly-to-cart, auth modal, Build Your Own Box (BYOB) with sticky tray, YouTube reels carousel (keep it YouTube-based), WhatsApp button, brochure side tab, scroll-to-top, announcement bar, mobile bottom nav, opacity-only view-swap fade between routes.
- Colour note: in `:root`, `--brand-primary` is the blue (#0173C2, used by the hero headline and buttons) and `--brand-secondary` is the teal (#00796B).

**Not built:** the 360° 3D pouch viewer, the Diwali layer.

---

## 6. Known issues and open decisions (flag, do not silently "fix")

- **Preparation time is inconsistent.** The Veg Biryani pouch art says "Ready to eat in 7 minutes". Rajma Masala, Gajar Halwa and Fried Rice art say 5 minutes. The site's announcement bar and marquee say 5 minutes. Never rewrite pouch artwork. When showing a time next to a specific product, use that product's own time; for general copy, ask the user, and until then use "minutes".
- **Rajma Masala back panel** says net weight 95g while the front says 70g, shows "PRODUCT OF INDI" (typo), and lists onion, ginger and garlic on a pack marked "Jain". These are artwork problems for the client; do not edit the images, just mention if relevant.
- **Shopify route is undecided** (Liquid theme vs headless). Keep code modular so sections can later become Liquid sections.
- The user's Shopify trial is only a few days long; migration is a separate, later task.

---

## 7. How to work

- Stay inside the scope of the task. Do not touch header, cart, modals, BYOB, reels, routing, colours or copy unless the task says so.
- Do not ask questions unless blocked; make a sensible choice, state it in the report, and move on.
- Do not create walkthrough documents or take screenshots until the end of the task. Make at most one browser check per task, fix once if needed.
- Keep the final report short: files changed, what to test, assumptions, anything missing (especially product images that are not transparent PNGs).
- The user is working with limited credits. Prefer small, correct edits over rewrites, and do not re-read large files you have already read.
- Never edit or invent pouch artwork. Hero images must be transparent PNGs of the pouch front; otherwise show a labelled placeholder and report it.

---

## 8. Later: Diwali layer (do not build until asked)

Modules under `festive/` (`diya.js`, `hamper.js`, `anaar.js`) each with `mount()`/`unmount()`, controlled by `festive/config.js` with a start date, an end date (9 November 2026) and a global kill switch, all CSS prefixed `diwali-`, all removable by deleting one include. They must never block Add to Cart, must pause off-screen, cap particles at about 100 on phones, and be disabled under reduced motion. Concepts: anaar fountain with pouches popping out, diya lighting, a hamper box that opens (linked to BYOB), a sparkler cursor, and a "delivery before Diwali" banner with real dates supplied by the user.
