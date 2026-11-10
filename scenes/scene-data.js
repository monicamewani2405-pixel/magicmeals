/* =========================================================
   scenes/scene-data.js: per-dish config for the Design 2 pinned How It Works scene
   Keyed by product slug (same slugs as HERO_PRODUCTS). A dish with no entry here
   falls back to the static 4-card How It Works.
   To add a dish: 3 images in scenes/<slug>/ (dry, wet, ready), run
   `python tools/prep-scene.py <slug>`, then add one entry below
   (copy the numbers from scenes/processed/<slug>.json).
   Every field is optional except the images and opening; defaults come from sceneFor().
   ========================================================= */
// The kettle that pours the hot water (step 3); built by `python tools/prep-scene.py kettle`.
// tip = the spout tip, % of the kettle image: the stream starts there.
const SCENE_KETTLE = { src: 'scenes/processed/kettle.webp', size: [700, 467], tip: { x: 97, y: 18.84 } };

const SCENE_DEFAULTS = {
  kettle: SCENE_KETTLE,
  prepMinutes: 5,
  particle: 'grain',   // 'bean' | 'grain' | 'shred'
  steps: [
    { title: 'Tear', text: 'Tear open the pouch.' },
    { title: 'Pour', text: 'Empty the contents into a bowl.' },
    { title: 'Add hot water', text: 'Add boiling water.' },
    { title: 'Eat', text: 'Cover, wait a few minutes, stir well, and enjoy.' }
  ]
};

const SCENES = {
  'rajma-masala': {
    bowl: 'scenes/processed/bowl-empty.webp',
    dry: 'scenes/processed/rajma-masala/dry.webp',
    wet: 'scenes/processed/rajma-masala/wet.webp',
    ready: 'scenes/processed/rajma-masala/ready.webp',
    size: [815, 563],                                   // processed image size (width, height)
    opening: { cx: 49.82, cy: 32.14, rx: 42.7, ry: 26.83 },   // inner rim ellipse, % of the image box
    bowlBottom: 94.7,                                   // bowl foot, % of the image height (bowlBox y + h): crossfade scale pivot
    prepMinutes: 5,                                     // the Rajma pack says 5 minutes
    particle: 'bean',
    colors: ['var(--scene-rajma-masala-c1)', 'var(--scene-rajma-masala-c2)', 'var(--scene-rajma-masala-c3)'],
    steps: [
      { title: 'Tear', text: 'Tear open the pouch.' },
      { title: 'Pour', text: 'Empty the contents into a bowl.' },
      { title: 'Add hot water', text: 'Add 155 ml of boiling water.' },
      { title: 'Eat', text: 'Cover, wait 5 minutes, stir well, and enjoy.' }
    ]
  },
  // the source images live in scenes/panner-butter-masala/ (folder spelling); the product slug is paneer-butter-masala
  'paneer-butter-masala': {
    bowl: 'scenes/processed/panner-butter-masala/bowl.webp',
    dry: 'scenes/processed/panner-butter-masala/dry.webp',
    wet: 'scenes/processed/panner-butter-masala/wet.webp',
    ready: 'scenes/processed/panner-butter-masala/ready.webp',
    size: [815, 563],
    opening: { cx: 49.82, cy: 32.14, rx: 42.7, ry: 26.83 },
    bowlBottom: 94.7,
    prepMinutes: 5,
    particle: 'bean',
    colors: ['var(--scene-panner-butter-masala-c1)', 'var(--scene-panner-butter-masala-c2)', 'var(--scene-panner-butter-masala-c3)']
  },
  // the three entries below: images from scenes/<slug>/ (same black bowl as above), prep time and water read off each pack's back panel
  'veg-biryani': {
    bowl: 'scenes/processed/veg-biryani/bowl.webp',
    dry: 'scenes/processed/veg-biryani/dry.webp',
    wet: 'scenes/processed/veg-biryani/wet.webp',
    ready: 'scenes/processed/veg-biryani/ready.webp?v=2',
    size: [815, 563],
    opening: { cx: 49.82, cy: 32.14, rx: 42.7, ry: 26.83 },
    bowlBottom: 94.68,
    prepMinutes: 7,                                     // the Veg Biryani pack says 7 minutes (boiling-water method: 160 ml, wait 7 min)
    particle: 'grain',
    colors: ['var(--scene-veg-biryani-c1)', 'var(--scene-veg-biryani-c2)', 'var(--scene-veg-biryani-c3)'],
    steps: [
      { title: 'Tear', text: 'Tear open the pouch.' },
      { title: 'Pour', text: 'Empty the contents into a bowl.' },
      { title: 'Add hot water', text: 'Add 160 ml of boiling water.' },
      { title: 'Eat', text: 'Cover, wait 7 minutes, stir well, and enjoy.' }
    ]
  },
  'dal-makhani': {
    bowl: 'scenes/processed/dal-makhani/bowl.webp',
    dry: 'scenes/processed/dal-makhani/dry.webp',
    wet: 'scenes/processed/dal-makhani/wet.webp',
    ready: 'scenes/processed/dal-makhani/ready.webp',
    size: [815, 563],
    opening: { cx: 49.82, cy: 32.14, rx: 42.7, ry: 26.83 },
    bowlBottom: 94.68,
    prepMinutes: 5,                                     // the Dal Makhani pack says 5 minutes (165 ml)
    particle: 'bean',
    colors: ['var(--scene-dal-makhani-c1)', 'var(--scene-dal-makhani-c2)', 'var(--scene-dal-makhani-c3)'],
    steps: [
      { title: 'Tear', text: 'Tear open the pouch.' },
      { title: 'Pour', text: 'Empty the contents into a bowl.' },
      { title: 'Add hot water', text: 'Add 165 ml of boiling water.' },
      { title: 'Eat', text: 'Cover, wait 5 minutes, stir well, and enjoy.' }
    ]
  },
  'pav-bhaji': {
    bowl: 'scenes/processed/pav-bhaji/bowl.webp',
    dry: 'scenes/processed/pav-bhaji/dry.webp',
    wet: 'scenes/processed/pav-bhaji/wet.webp',
    ready: 'scenes/processed/pav-bhaji/ready.webp',
    size: [815, 563],
    opening: { cx: 49.82, cy: 32.14, rx: 42.7, ry: 26.83 },
    bowlBottom: 94.68,
    prepMinutes: 5,                                     // the Pav Bhaji pack says 5 minutes (170 ml)
    particle: 'shred',                                  // there is no 'cube' particle type; 'shred' is the closest
    colors: ['var(--scene-pav-bhaji-c1)', 'var(--scene-pav-bhaji-c2)', 'var(--scene-pav-bhaji-c3)'],
    steps: [
      { title: 'Tear', text: 'Tear open the pouch.' },
      { title: 'Pour', text: 'Empty the contents into a bowl.' },
      { title: 'Add hot water', text: 'Add 170 ml of boiling water.' },
      { title: 'Eat', text: 'Cover, wait 5 minutes, stir well, and enjoy.' }
    ]
  }
};

// Returns the merged config for a slug, or null when the dish has no scene.
function sceneFor(slug) {
  var s = SCENES[slug];
  if (!s || !s.bowl || !s.dry || !s.wet || !s.ready || !s.opening) return null;
  var steps = (s.steps && s.steps.length === 4) ? s.steps : SCENE_DEFAULTS.steps;
  return Object.assign({ colors: ['var(--brand-primary-dark)', 'var(--brand-primary)', 'var(--brand-secondary)'], size: [800, 600] },
    SCENE_DEFAULTS, s, { steps: steps, slug: slug });
}
