/* =========================================================
   how-to-prepare.js: the ONE source of the "how to prepare" steps (client wording, 13 Nov 2026).
   Read by main.js (product page: the steps list and the video-section cards), scenes/scene-data.js (pinned scene cards)
   and heroes/home.js (static How It Works). Do not put a water amount here: it is printed on the back of each pack,
   and each product keeps its own figure in its product facts.
   ========================================================= */
window.HOW_TO_PREPARE = {
  steps: [
    { title: 'Tear', text: 'Open the pouch and remove the oxygen absorber.' },
    { title: 'Pour', text: 'Empty the contents into the bowl.' },
    { title: 'Add hot water', text: 'Add hot water as mentioned on the back of the packet.' },
    { title: 'Eat', text: 'Cover and wait for 5–7 minutes, stir well and enjoy.' }
  ],
  note: 'The pouch contains an oxygen absorber sachet. Do not eat it.'
};
