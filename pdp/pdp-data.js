/* =========================================================
   pdp/pdp-data.js: config for the product-page prototype (layout + 3D "set").
   The product view mounts the new layout ONLY when PDP_SCENES[slug] exists.
   To add a dish: add an entry below + its plates/cutouts under pdp/<slug>/.
   Generated blocks (do not edit by hand) are rewritten by:
     python tools/compose-lifestyle.py   -> PDP_PLACEMENTS (gallery images + where the pouch sits)
     python tools/cutout-sheet.py        -> PDP_INGREDIENT_FILES (ingredient cutouts + short names)
   Until those run, lifestyle cards and floating ingredients show labelled placeholders.
   ========================================================= */
(function () {
  'use strict';

  // BEGIN GENERATED PLACEMENTS (tools/compose-lifestyle.py)
  var PDP_PLACEMENTS = {"hero": {"w": 1200, "h": 1500, "pouch": {"cx": 0.2304, "cy": 0.7353, "w": 0.34, "rot": 6.0}}, "ingredients": {"w": 1200, "h": 1500, "pouch": {"cx": 0.5879, "cy": 0.53, "w": 0.4, "rot": -9}}, "prep": {"w": 1200, "h": 1500, "pouch": {"cx": 0.7125, "cy": 0.287, "w": 0.36, "rot": 17}}, "onthego": {"w": 1200, "h": 1500, "pouch": {"cx": 0.7329, "cy": 0.73, "w": 0.34, "rot": -15}}};
  // END GENERATED PLACEMENTS

  // BEGIN GENERATED INGREDIENTS (tools/cutout-sheet.py)
  var PDP_INGREDIENT_FILES = [{"file": "ingredient-1.webp", "name": "kidney-beans", "w": 400, "h": 227}, {"file": "ingredient-2.webp", "name": "tomato", "w": 400, "h": 326}, {"file": "ingredient-3.webp", "name": "ginger", "w": 400, "h": 313}, {"file": "ingredient-4.webp", "name": "garlic", "w": 400, "h": 399}, {"file": "ingredient-5.webp", "name": "onion", "w": 400, "h": 383}, {"file": "ingredient-6.webp", "name": "green-chilli", "w": 400, "h": 192}, {"file": "ingredient-7.webp", "name": "whole-spices", "w": 400, "h": 242}, {"file": "ingredient-8.webp", "name": "coriander", "w": 400, "h": 330}];
  // END GENERATED INGREDIENTS

  window.PDP_SCENES = {
    'rajma-masala': {
      dir: 'pdp/rajma-masala/',
      tint: 'var(--tint-rajma-masala)',
      ink: 'var(--ink-rajma-masala)',
      // the Rajma pack says 5 minutes; the live value is read from scenes/scene-data.js when available (see pdp-scene.js)
      prepMinutesFallback: 5,

      // Stage dressing: the four claim chips are ON, the floating ingredient cutouts are OFF (too busy next to the pouch).
      // Flip either flag to switch them; the ingredient files and the Key facts card are unaffected.
      showChips: true,
      showIngredients: false,

      // Hotspot chips (real HTML). {min} is replaced with the dish's prepMinutes.
      // slot = where the chip sits in the stage (%): kept at the left/right edges so it never covers the pouch centre
      chips: {
        front: [
          { id: 'freeze', label: 'Freeze-dried',           slot: { left: 2,  top: 14 } },
          { id: 'ready',  label: 'Ready in {min} minutes', slot: { right: 2, top: 26 } },
          { id: 'msg',    label: 'No MSG',                 slot: { left: 2,  top: 50 } },
          { id: 'nat',    label: '100% natural',           slot: { right: 2, top: 62 } }
        ],
        back: []   // no chips on the back view (Ingredients / Nutrition / How to cook were dropped)
      },

      // Gallery column, in order. pouchAzimuth = where the 3D pouch turns when the card is mid-screen (desktop/tablet).
      // image = plate name (pdp/rajma-masala/gallery/<image>-1200.webp). serving = show the "Serving suggestion" caption.
      // ASSUMPTION: plates not seen yet; hero and prep are assumed to show rice/roti, the others not. Confirm when plates arrive.
      cards: [
        { id: 'hero',        type: 'lifestyle', image: 'hero',        pouchAzimuth: 20,  serving: true,
          alt: 'Rajma Masala pouch lying on a table beside a bowl of rajma with rice',
          plate: 'hero' },
        { id: 'inside',      type: 'inside',                           pouchAzimuth: 0 },
        { id: 'ingredients', type: 'lifestyle', image: 'ingredients', pouchAzimuth: 180, serving: false,
          alt: 'Rajma Masala pouch surrounded by the ingredients used in the dish',
          plate: 'ingredients' },
        { id: 'prep',        type: 'lifestyle', image: 'prep',        pouchAzimuth: 25,  serving: true,
          alt: 'Rajma Masala pouch next to a kitchen counter set for preparing the meal',
          plate: 'prep' },
        { id: 'facts',       type: 'facts',                            pouchAzimuth: 0 },
        { id: 'onthego',     type: 'lifestyle', image: 'onthego',     pouchAzimuth: -20, serving: false,
          alt: 'Rajma Masala pouch packed for travel, ready to eat on the go',
          plate: 'onthego' }
      ],

      // Key facts card: only claims printed on the Rajma pack. icon = key into FACT_ICONS in pdp-scene.js
      chipsFacts: [
        { icon: 'snow',  label: 'Freeze-dried' },
        { icon: 'clock', label: 'Ready in {min} minutes' },
        { icon: 'check', label: 'No MSG' },
        { icon: 'leaf',  label: '100% natural' }
      ],

      // Inside the pack: processed scene images (scenes/processed/rajma-masala/) + real HTML captions
      inside: [
        { src: 'scenes/processed/rajma-masala/dry-640.webp',   alt: 'Dry freeze-dried Rajma Masala in a bowl',     caption: 'Dry' },
        { src: 'scenes/processed/rajma-masala/wet-640.webp',   alt: 'Hot water poured over the Rajma Masala',      caption: 'Add hot water' },
        { src: 'scenes/processed/rajma-masala/ready-640.webp', alt: 'Ready to eat bowl of Rajma Masala',           caption: 'Ready in {min} minutes' }
      ],

      // Floating ingredients around the pouch. x/y/size are % of the stage; layer: back | mid | front (z-order vs the pouch);
      // depth = parallax factor (sign = direction); mobile = kept on phones (max 4); dur/phase = float seconds.
      // hidden: true = not shown on the stage (kept so the file order stays aligned). names: filled by tools/cutout-sheet.py --names ...; until then each shows a labelled placeholder.
      ingredientSlots: [
        { x: 6,  y: 8,  size: 17, layer: 'back',  depth: -0.45, rot: -14, dur: 5.2, phase: 0,    mobile: true  },
        { x: 78, y: 10, size: 15, layer: 'back',  depth: -0.35, rot: 18,  dur: 4.4, phase: -1.4, mobile: false },
        { x: 82, y: 40, size: 16, layer: 'mid',   depth: 0.35,  rot: 8,   dur: 5.8, phase: -2.6, mobile: true  },
        { x: 2,  y: 36, size: 14, layer: 'mid',   depth: 0.3,   rot: -22, dur: 4.8, phase: -0.8, mobile: false, hidden: true },
        { x: 5,  y: 64, size: 19, layer: 'front', depth: 0.85,  rot: 10,  dur: 5.5, phase: -3.1, mobile: true  },
        { x: 76, y: 66, size: 17, layer: 'front', depth: 0.75,  rot: -9,  dur: 4.2, phase: -1.9, mobile: true  },
        { x: 40, y: 2,  size: 12, layer: 'back',  depth: -0.25, rot: 26,  dur: 6.0, phase: -4.2, mobile: false, hidden: true },
        { x: 44, y: 70, size: 12, layer: 'front', depth: 0.6,   rot: -30, dur: 5.0, phase: -2.2, mobile: false }
      ],

      // generated (read-only here)
      placements: PDP_PLACEMENTS,
      ingredientFiles: PDP_INGREDIENT_FILES
    }
  };
})();
