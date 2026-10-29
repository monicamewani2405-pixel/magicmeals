# TASK: replace Design 3 (Range Wall) with "Flavour Stack"

## Context (you have not seen this project before)
This is a front-end prototype for Magic Meals, an Indian ready-to-eat, freeze-dried vegetarian meal brand. It is plain HTML/CSS/vanilla JS with GSAP 3.12.5 + ScrollTrigger. No framework, no build step. The machine is Windows with PowerShell, so use PowerShell-compatible commands.

Ignore the duplicate HTML file "Magic Meals – Real Indian meals in 5 minutes.html", the scratch/ folder (except as noted below), the Python patch scripts and any files starting with "._". Edit only index.html, style.css, main.js, hero.js, variants.js, variants.css, hero-products.js (if present) and the files under heroes/.

Read CLAUDE.md in the project root first (rules, file structure, brand tokens, phases). If CLAUDE.md is missing from the root, read scratch/Claude.md instead and copy it to the root as CLAUDE.md. **This task replaces "Phase 3" in that brief: do NOT rebuild or continue the Range Wall. Where this task conflicts with CLAUDE.md, THIS TASK WINS for Design 3 only.**

## How to work
One pass. Do not ask questions (decide, and list assumptions in the report). No walkthrough documents, and no screenshots until the end. Search the code for existing function and element names (add-to-cart, fly-to-cart, product data, router, header); never guess them. Do not re-read large files you have already read.

## Step 0: safety first
1. Run `git status`. If there are uncommitted changes (there should be: an in-progress heroes/wall.js, variants.css and variants.js changes), commit them with `git add -A` then `git commit -m "WIP before Flavour Stack"` so everything can be recovered. Ignore the LF/CRLF warnings.
2. Prerequisite check (read-only): confirm the hero chooser (buttons 1, 2, 3 and variants.js), heroes/classic.js, heroes/switcher.js, and a shared product list for the hero (hero-products.js or an equivalent HERO_PRODUCTS array). If the chooser or heroes/ folder do not exist, STOP and report "Phase 1 (chooser) is missing" in two lines. Do not build it. If there is no shared product list, create hero-products.js exporting HERO_PRODUCTS = [[SLUG1], [SLUG2], [SLUG3], [SLUG4], [SLUG5]] (3 to 5 slugs, to be filled with the products already used by Design 2) and make the new design read from it.

## Reference
View reference/flavour-hero.png if it exists (if it is missing, work from the description below and say so in the report). It is another brand's design and is for LAYOUT and MOTION inspiration only. Do not copy its text, logo, fonts, imagery or colours. Each frame shows: a solid pastel background that differs per flavour, a cluster of overlapping tilted product tubs (the selected flavour at the front and largest, the others fanned behind it, all rearranging when you switch), small floating ingredient cutouts in the corners, a big pale flavour name on the right with a short tagline and description, and a row of five small round flavour buttons with the active one highlighted. In Figma the frames are linked with Smart Animate (shared elements tween to their new positions). Reproduce that behaviour with GSAP using persistent elements.

## Remove the old Design 3
Delete heroes/wall.js and every .v-wall- CSS rule (in variants.css or wherever they are) and any reference to them. Replace with heroes/stack.js (same mount(slot)/unmount() API as the other heroes) and CSS prefixed .v-stack-. Update the chooser caption for button 3 from "Wall" to "Stack" and its aria-label to "Hero design 3: Flavour Stack". Update the Design 3 rows in CLAUDE.md (summary table and the "Design 3 detail" section) to describe this new design.

## Products
Read the list from HERO_PRODUCTS. For each product read name, price, one-line description and the front image from the existing product data. Every image must be a transparent PNG of the front of the pouch; if one is not, show a labelled placeholder ("IMAGE NEEDS TRANSPARENT PNG") and list it in the report. Never invent or generate product imagery. Resized copies of pouch images 800px tall or smaller are fine for the hero (keep originals).
Optional decorative ingredients: look for ingredients/<slug>-1.png, -2.png, -3.png (transparent). Use whichever exist. If none exist for a product, show none, and list the missing ones in the report. Do not draw substitutes.

## Layout (hero slot, min-height 100svh, header transparent over it as for the other designs)
**Desktop (768px and wider):** two columns inside a stage. Left 55%: the pouch cluster. Right 45%: text.

Cluster stage: a relative box with overflow visible on the sides and hidden at the very bottom edge of the hero. Positions are SLOTS, in percent of the cluster box (x = horizontal centre, y = vertical centre); tune them visually:
- Slot 0 (front): x 52%, y 66%, scale 1.00, rotation -4deg, z 50.
- Slot 1: x 28%, y 44%, scale 0.78, rotation -14deg, z 40.
- Slot 2: x 72%, y 40%, scale 0.74, rotation 12deg, z 40.
- Slot 3: x 44%, y 22%, scale 0.60, rotation 6deg, z 30.
- Slot 4: x 78%, y 18%, scale 0.52, rotation -10deg, z 20.
With 3 products use slots 0 to 2; with 4 use 0 to 3; with 5 use 0 to 4.

The active product sits in slot 0. The rest fill slots 1..n-1 in circular order after it (product i+1 goes to slot 1, i+2 to slot 2, and so on). Back pouches may overlap the pouches in front of them and may be partly cut at the top; the front pouch must be fully visible. Each pouch has a soft shadow under it (a drop-shadow on the image or a small blurred ellipse element, with no animated filter) that scales with the pouch.

Decorative ingredients: 2 to 4 per active product, placed around the corners of the whole hero (for example top-left, top-right, bottom-left near the text), each slightly rotated, with a slow idle float (±6px, different phase and 4 to 6s per element). They sit behind the cluster.

Right column (top to bottom):
- A small kicker "REAL FOOD. READY IN MINUTES." in --text-muted, letter-spaced.
- The dish name in very large heading font (clamp(48px, 7vw, 120px), uppercase, tight leading). Its colour is a darker shade of the active background derived with color-mix(in srgb, var(--tint-<slug>) 55%, var(--text)), so there are no new hard-coded colours; it must reach at least 3:1 contrast against the background.
- A one-line tagline using the product's existing short description (maximum 2 lines, clamp).
- The price.
- A row of round thumbnail buttons (one per product, 52px circles with a white background and the pouch image inside), with a small caption under them showing "1 / 5".
- Two buttons: "Add to cart" (uses the existing add-to-cart function and the existing fly-to-cart animation) and "Shop Now" (the existing route).
- Active thumbnail: a 2px --text ring with 4px offset, plus a slight scale-up. The ring itself slides between thumbnails (animate x) instead of jumping.

**Mobile (under 768px):** the cluster on top (about 44svh tall, same slots but compressed horizontally: slot 0 centred at x 50%, slots 1 and 2 at x 22% and 78%, up to 3 visible slots), then the dish name (clamp(40px, 12vw, 64px)), the tagline, the thumbnails row (scrollable if needed), then the buttons. At 390x844: the cluster, the dish name, the thumbnails and the Add to cart button are visible without scrolling. Hide the decorative ingredients except one. The header stays transparent-to-solid as in the other designs.

## Colours
Background of the hero slot = the active product's tint. If Design 2 already defined --tint-<slug> tokens in :root, reuse them. If not, add --tint-<slug> for each product to :root (a mid-light pastel sampled from that pouch's dominant colour, chosen so a darker text shade reaches 3:1 for the large dish name and the other text reaches 4.5:1) and list them in the report. These are the ONLY new colour tokens. No other hard-coded hex or rgba. Transition the background colour over 0.6s (gsap.to on a CSS variable or on background-color, not a filter).

## Motion
**Intro (GSAP timeline, about 2s):**
1. The background is already at the active tint. The kicker and dish name fade up (opacity 0 to 1, y 40 to 0, 0.6s, 0.1s stagger).
2. The cluster pouches fall in from above the viewport (y -120vh, rotation -12deg), starting with the back-most slots and ending with the front pouch, 0.12s stagger, power2.in over 0.8s, each squashing slightly on landing (scaleY 0.9, scaleX 1.06, 0.1s) and settling with elastic.out(1, 0.45) into its slot rotation.
3. Shadows grow as pouches land; decorative ingredients scale in (0.6 to 1) with a small rotation and a 0.4s stagger; the thumbnails, price and buttons fade in last.
4. After the intro, each pouch idles with a gentle float (y ±6px, 3 to 4s, yoyo, sine.inOut, different phase per pouch) and the front pouch gets a slow sway of ±1.5deg.

**Switching (Smart Animate style, 0.8s total, power3.inOut, one gsap timeline):**
- Triggers: click or tap a thumbnail, click or tap any back pouch (it becomes active), arrow keys, swipe horizontally on touch, auto-advance.
- Recompute every pouch's slot from the new active index. Tween each pouch's x, y, scale and rotation to its new slot. Set the z-index of the pouch becoming active to the front value at the start (0.1s), and of the pouch leaving the front to its new slot's z at the midpoint, so nothing flickers.
- Animate the background tint to the new product's tint (0.6s).
- Dish name and tagline: the old text slides up and fades out (y 0 to -30, 0.3s); the new text slides up from below and fades in (y 30 to 0, 0.4s, 0.15s delay). The price crossfades. The "1 / 5" caption updates.
- Decorative ingredients: the old ones scale to 0.6, rotate and fade out (0.3s); the new ones scale in from 0.6 with a small overshoot (power2.out, 0.5s, 0.3s delay).
- The thumbnail ring slides to the new thumbnail.
- If the user switches again mid-animation, kill the running timeline and animate from the current values (overwrite: 'auto'). The chosen product must always end in slot 0.
- A pouch moving from the last slot to slot 0 or back must take the shortest visible path, fade slightly while crossing the headline area, and never fly across the viewport in a straight line over the text.

Auto-advance every 6s, paused on hover, while the tab is hidden, when the hero is off-screen (IntersectionObserver), and for 10s after any manual interaction; none under prefers-reduced-motion.
Mouse parallax on desktop only (gsap.quickTo): the cluster shifts up to 10px and rotates up to 2deg following the cursor, with the ingredients moving more than the pouches for depth. None on touch.
Scroll exit: while scrolling out of the hero, the cluster and text drift up slightly and fade (opacity and transform only). No pinning.

## How It Works
This design uses the static 4-card How It Works already provided for Designs 2 and 3. Keep it working (same #how-it-works id; every "How It Works" button must scroll to it).

## Rules and performance
- Animate only transform, opacity and clip-path (plus a CSS variable or background-color for the tint). No animated blur or filter. will-change only during animations, and removed afterwards.
- Set width and height on every image; preload the active product's image; lazy-load the others after the intro; ingredient images 400px or smaller.
- Pouches are buttons with an accessible name ("Show [dish name]"). The thumbnails, arrows and add button have aria-labels and visible focus styles. Announce the active dish in an aria-live region.
- Under prefers-reduced-motion: no intro or float; show the cluster in its final slots; switching is an instant crossfade; no parallax or auto-advance.
- unmount() kills every tween, timeline, ScrollTrigger, observer, timer and listener, and removes all DOM and inline styles it added. Switching 1 to 2 to 3 to 1 to 3 repeatedly must leave no duplicate pouches, no leftover transforms on header or body, and ScrollTrigger.getAll().length must return to its previous value.
- Do not change Design 1, Design 2's behaviour (other than reading the shared product list), the header, cart, modals, BYOB, reels, routing or copy.

## Check and report
One browser check at 1440px and 390px: the intro plays; clicking each thumbnail, clicking a back pouch, arrow keys and swiping all work; the background colour, dish name and decorations change; the chosen pouch is always in front and fully visible; no text overlaps badly; the first screen shows what it should at both sizes; Add to cart flies to the cart; the chooser switches among 1, 2 and 3 and back with no console errors; Home to Shop to Home keeps the chosen design. Fix once if needed.

Report in 7 lines or fewer: files changed or deleted, new tint tokens, product images that are not transparent PNGs, and missing ingredient cutouts. Then stop.
