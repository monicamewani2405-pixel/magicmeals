# TASK: per-dish pinned "How It Works" scene for Design 2 (Range Switcher) only

## Context
Magic Meals front-end prototype: plain HTML/CSS/vanilla JS, GSAP 3.12.5 + ScrollTrigger, no framework, no build step. Windows with PowerShell, so use PowerShell-compatible commands. Read CLAUDE.md in the project root first (rules, files, tokens). If it is missing, read scratch/Claude.md.

The home page has a hero chooser (buttons 1, 2, 3). Design 2 ("Range Switcher") shows several pouches in the hero. Today Design 2 uses a plain static 4-card "How It Works". Design 1 (Classic) has a pinned, scroll-driven How It Works scene that is built around Veg Biryani. **We want Design 2 to get its own pinned scene that works for every dish, driven by per-dish images and config, starting with Rajma Masala.** The scene shows whichever pouch is currently active in the hero.

## HARD SCOPE: what you may and may not touch
- **Design 1 and Design 3 must stay exactly as they are**, in whatever state they are in now. Do NOT edit hero.js, heroes/classic.js, heroes/stack.js, heroes/wall.js, or any CSS rule used only by them. Do NOT delete any design. You may READ hero.js and classic.js for reference (how the pouch glide and the pin were done) but never modify them. Copy ideas, not edits.
- Allowed to change: heroes/switcher.js; NEW files you create (scenes/scene-data.js, scenes/hiw-scene.js, scenes/scene.css (rules prefixed `.v-scene-`), scenes/scene-colors.css (generated), tools/prep-scene.py); and the minimum glue in variants.js that decides which How It Works to render, gated strictly on hero design 2.
- Do not change the header, cart, auth modal, BYOB, reels, routing, copy elsewhere, or colours outside the new tokens listed below.
- Ignore the duplicate HTML file, scratch/, the old Python patch scripts, and files starting with "._".

## How to work
One pass. Do not ask questions (decide, and list assumptions in the report). No walkthrough documents and no screenshots until the end. Search the code for existing names (add-to-cart, product data, router, header, chooser, gsap context pattern); never guess. Do not re-read large files you have already read. Do not open images in scratch/.

## Step 0: safety and prerequisites
1. Run `git status`. If there are uncommitted changes, commit them with `git add -A` and `git commit -m "WIP before Design 2 scene"` so everything can be recovered. Ignore LF/CRLF warnings.
2. Confirm Design 2 exists (heroes/switcher.js, a HERO_PRODUCTS list, the chooser). If not, STOP and report in 2 lines.
3. Check the input images exist. They may be JPEG, so accept any of `.jpg`, `.jpeg`, `.png` or `.webp` (case-insensitive) for each of: `scenes/bowl-empty`, `scenes/rajma-masala/dry`, `scenes/rajma-masala/wet`, `scenes/rajma-masala/ready`. Use whichever extension exists; do not rename or convert the originals. If any is missing, STOP and list what is missing. Do NOT generate or draw substitutes.

## Part A: prepare the images (tools/prep-scene.py)
Write a reusable Python script (Pillow + numpy + scipy are available; install with `pip install` if needed) that takes a dish slug and processes `scenes/bowl-empty.*` plus `scenes/<slug>/{dry,wet,ready}.*` (any of .jpg, .jpeg, .png, .webp) into `scenes/processed/`. NEVER overwrite or move the originals.
0. JPEG handling (the inputs are probably JPEGs, which have no transparency and carry compression noise). Open each file with Pillow, apply `ImageOps.exif_transpose` so the orientation is right, convert to sRGB and then to RGBA. Never re-save any intermediate result as JPEG; only write the final WebP files. Expect the "white" background to be slightly noisy (values like 247 to 255 and faint blocky artefacts near the bowl edge), so tune the threshold on the actual files, and after building the alpha mask erode it by 1px and then feather by 1px so no light fringe or halo survives around the black bowl. Check the result over a coloured background, not a white one.
1. The inputs are AI-generated, about square, a black ceramic bowl on a near-white background with a faint floor shadow. Remove the background: flood-fill from the image border over near-white / light-grey pixels (use a luminance threshold around 185, tune it) so only the bowl and its contents stay, with a 1px feathered edge. Do not let the flood leak into the bowl's rim highlight or into pale food inside the bowl (only fill regions connected to the border). Remove the floor shadow with the background. (A fresh soft shadow is drawn in CSS later.)
2. Alignment: compute the bowl's outer bounding box on the transparent result for all four images. The bowl must be in the same place in all four. If the boxes differ by 1 to 3 px, align by translation only. If the offset is larger than 3 px, or the scale differs by more than 2%, align by translation and uniform scale, and REPORT the numbers because that image may need regenerating. 
3. Crop all four images to the same crop box (the union of the bowl boxes plus 6% padding) so they are identical in size. Resize to a maximum of 1000px on the long side. Save as WebP (quality 88) to `scenes/processed/bowl-empty.webp` and `scenes/processed/<slug>/{dry,wet,ready}.webp`.
4. Measure the bowl's INNER opening (the inner rim ellipse) from the empty image, as percentages of the cropped image box: centre x, centre y, radius x, radius y. Write them, and the processed image paths and the bowl's bounding box, to `scenes/processed/<slug>.json`. (View the processed empty image once to sanity-check the numbers.)
5. Sample the food colours: take the pixels inside the opening in `dry.webp` and compute 3 representative colours (a simple k-means with k=3 on RGB). Write them into `scenes/scene-colors.css` as `:root { --scene-<slug>-c1: ...; --scene-<slug>-c2: ...; --scene-<slug>-c3: ...; }`. These are the ONLY new colour tokens besides the water ones below.
6. Write a QA preview: one PNG with the four processed images composited over a mid-blue background, to check for halos. View it once. If you see a light halo around the bowl, fix the threshold and rerun.
7. Run the script for `rajma-masala`. Document in a comment at the top of the script how to run it for another dish: `python tools/prep-scene.py <slug>`.

## Part B: per-dish config (scenes/scene-data.js)
Export `SCENES`, keyed by product slug (use the same slugs as HERO_PRODUCTS). Add the entry for `rajma-masala` using the data from `scenes/processed/rajma-masala.json`:
```
{
  bowl: 'scenes/processed/bowl-empty.webp',
  dry: '.../dry.webp', wet: '.../wet.webp', ready: '.../ready.webp',
  opening: { cx, cy, rx, ry },        // percentages from the JSON
  prepMinutes: 5,                      // the Rajma pack says 5 minutes
  particle: 'bean',                    // 'bean' | 'grain' | 'shred'
  colors: ['var(--scene-rajma-masala-c1)', 'var(--scene-rajma-masala-c2)', 'var(--scene-rajma-masala-c3)'],
  steps: [
    { title: 'Tear', text: 'Tear open the pouch.' },
    { title: 'Pour', text: 'Empty the contents into a bowl.' },
    { title: 'Add hot water', text: 'Add 155 ml of boiling water.' },
    { title: 'Eat', text: 'Cover, wait 5 minutes, stir well, and enjoy.' }
  ]
}
```
Make every field overridable and give defaults for steps. Adding a new dish later must need only: 3 images + `python tools/prep-scene.py <slug>` + one config entry. Products with NO entry in SCENES (all other dishes for now) fall back to the existing static 4-card How It Works in Design 2, with no errors and no placeholder clutter. Do not invent entries or images for other dishes.
Never hard-code a dish name or time in the scene code: read them from the config.

## Part C: the pinned scene (scenes/hiw-scene.js + scenes/scene.css)
Render only in Design 2, and only when the active hero product has a SCENES entry. It replaces the static cards for that situation (same `#how-it-works` id; every "How It Works" button must still scroll to it). On product switch in the hero, rebuild the scene config for the new active product; if it has no entry, show the static cards.

**Layout (desktop, 768px and wider):** a section with the heading "How It Works", a thin progress bar and 4 dots under it, two columns: left, the 4 step cards (only the active one highlighted, others dimmed), right, the stage (about 70svh max, fully visible while pinned, bowl never clipped). Pin with ScrollTrigger (pin: true, scrub: 0.6) for about 300vh. **Mobile (under 768px):** the stage on top (about 45svh), the active step's card below it, pinned for about 250vh. Use the existing look of Design 1's section (read its CSS for reference), but with new classes prefixed `.v-scene-` and :root variables only.

**Stage contents:** the bowl image, centred, with a soft ellipse shadow drawn in CSS under it (scale-able, no filter animation); layers for dry, wet and ready (absolutely positioned over the bowl image, identical box); a steam layer; a water stream SVG; a particle layer; and the shared pouch. The label "Ready in {prepMinutes} minutes" appears at the end.

**The shared pouch (glide):** when the user starts scrolling out of the hero, the ACTIVE pouch (the one in the front slot) must glide down into the stage, with no jump and no duplicate. Implement it by recording the active pouch's on-screen rect, moving that same image element into a fixed overlay (a placeholder of the same size stays in the cluster), then animating it with transform only from that rect to the scene's pouch target (above the bowl) using one scrubbed timeline. The other pouches, the sub-line, buttons, floor shadows and steam in the hero fade out (opacity and a few px of y) over the first 15% of the glide, so the pouch never passes over text. Auto-advance in the hero stops once the user scrolls. Scrolling back to the top returns the pouch to its exact slot, restores the other pouches and text, and removes the overlay. Never put a transform, filter or will-change on an ancestor of the fixed overlay. The header stays above the pouch.

**Timeline (scrubbed to the pin's progress, transform / opacity / clip-path / stroke-dashoffset only; no animated filters or blurs):**
1. 0 to 25% Tear: the pouch tilts about 12deg; cut a jagged torn edge across the top ~6% of the pouch (a jagged clip-path polygon with 10 to 14 irregular points), and a thin torn strip (a clipped copy of the pouch's top edge, used purely as decoration) peels up, rotates about 25deg, drifts right and fades; a dark slim opening gradient appears under the cut. A 2px shake. From here on the pouch keeps its opened look. The bowl is empty.
2. 25 to 55% Pour: the pouch moves to the upper right of the bowl and rotates so its opening faces down-left over the bowl's right rim (about -115deg). Put an invisible "mouth marker" inside the pouch wrapper so you can compute the stream's start point from its bounding rect each frame. A stream of dry mix flows from the mouth into the bowl opening: an SVG path animated with stroke-dasharray / dashoffset, round caps, using `colors` from the config, plus 16 to 28 small particles (per `particle`: 'bean' = rotated ellipses, 'grain' = thin ellipses, 'shred' = short curved strokes) that fall and land inside the `opening` ellipse. As it pours, the `dry` layer reveals with a clip-path growing from the bottom of the bowl opening upwards plus a small scale from 0.97 to 1, so a heap seems to build.
3. 55 to 80% Add hot water: the pouch rotates back, slides right and fades out. A translucent water stream falls from the upper left into the opening (a tapered path with an animated stroke-dashoffset and a gradient using the water tokens), with 2 or 3 expanding ripple ellipses at the impact point (clipped to the opening). The `dry` layer crossfades to `wet`. Steam wisps (3 to 5 CSS or SVG shapes, own keyframes prefixed `v-scene-`) start rising.
4. 80 to 100% Eat: `wet` crossfades to `ready` with a scale from 0.97 to 1; steam continues; the label "Ready in {prepMinutes} minutes" scales in beside or above the bowl (real HTML text, never overlapping the food). Then the section unpins; in the last 10% of the pin the stage elements fade to opacity 0 and y -16px so the unpin is smooth. Everything reverses cleanly on scroll up.
- The step cards highlight at the matching progress points (card 1 at 0, card 2 at 25%, card 3 at 55%, card 4 at 80%); the progress bar and dots follow. Card transitions: background-color, border-color, box-shadow and transform at 0.4s, the active card shifted 4px on the X axis.

**Water colour tokens:** add `--scene-water-1` and `--scene-water-2` (derived from the existing brand blue, for example with `rgb(var(--brand-secondary-rgb) / 0.35)`; add `--brand-secondary-rgb: 1 115 194` to :root if it does not exist) to scenes/scene-colors.css or :root. No other hard-coded colours.

**Sections after the scene:** if an `#after-hiw` wrapper (the "slide over" stacking effect) already exists for Design 1, apply the same behaviour for Design 2 WITHOUT editing Design 1's code (add equivalent rules scoped to Design 2). If it does not exist, skip this and mention it in the report.

## Rules
- Animate only transform, opacity, clip-path and stroke-dashoffset. `will-change` only during animation, then removed. Set width and height on every image; load the processed images lazily after the hero intro and decode them before the pin starts; use the first stage image immediately.
- Respect `prefers-reduced-motion` and screens under 360px: no pin and no glide; show the 4 step cards stacked, with the `ready` image below them.
- Real HTML text for all copy. Buttons and controls have aria-labels and focus styles. Keep the keyboard able to scroll normally; no scroll hijacking.
- unmount() (when the user switches to design 1 or 3, leaves Home, or the active dish has no scene) kills every tween, timeline, ScrollTrigger, observer, timer and listener, returns the pouch to its slot, removes the overlay and all added DOM and inline styles. Switching 1 to 2 to 3 to 2 repeatedly must leave no duplicate pouches or leaks, and `ScrollTrigger.getAll().length` must return to its previous value. Call `ScrollTrigger.refresh()` after mount and on resize.
- Never rewrite pouch artwork, never invent product imagery.

## Check and report
1. Run `git diff --stat` and confirm hero.js, heroes/classic.js, heroes/stack.js and heroes/wall.js are UNCHANGED. If any changed, revert that file.
2. One browser check at 1440px and 390px: in Design 2 with Rajma Masala active, scroll slowly from the hero through the whole scene and confirm: the pouch glides with no duplicate or jump and nothing collides with text; the tear is visible; the pour comes from the right and fills the bowl; water falls from the left; wet then ready appear; the label shows "Ready in 5 minutes"; the whole bowl is visible at every step with no hard edge; scrolling back up reverses everything. Switch the hero to another dish without a scene entry and confirm it shows the static cards. Press 1 and 3 and confirm those designs look and behave exactly as before. No console errors. Fix once if needed.
3. Report in 8 lines or fewer: files changed or created, the alignment numbers from the image prep (and any image that may need regenerating), the new colour tokens, and anything you could not finish.
