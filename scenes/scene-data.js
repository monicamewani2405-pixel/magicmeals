/* =========================================================
   scenes/scene-data.js: per-dish config for the Design 2 pinned How It Works scene
   Keyed by product slug (same slugs as HERO_PRODUCTS). A dish with no entry here
   falls back to the static 4-card How It Works.
   To add a dish: 3 images in scenes/<slug>/ (dry, wet, ready), run
   `python tools/prep-scene.py <slug>`, then add one entry below
   (copy the numbers from scenes/processed/<slug>.json).
   Every field is optional except the images and opening; defaults come from sceneFor().
   ========================================================= */
const SCENE_DEFAULTS = {
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
