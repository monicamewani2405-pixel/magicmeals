/* =========================================================
   pdp/pdp-data.js: config for the product-page design (3-column layout + 3D "set").
   The product view mounts the new layout ONLY for products listed in PDP_SCENES; every other page renders as before.
   All products share one template (below); each adds only its own pouch, colours and prep time.
   To add a product: add its slug + prep time to PDP_PRODUCTS, then run
     python tools/pdp-tints.py                              (colours from the pouch)
     python tools/compose-lifestyle.py --slug <slug>        (gallery: the pouch on the shared plates; first add pdp/shared/plates/hero-<slug>.png, a top-down photo of THAT dish with the lower-left third empty)
   Generated blocks (do not edit by hand) are rewritten by those tools:
     PDP_PLACEMENTS       tools/compose-lifestyle.py   gallery images + where the pouch sits, per product
     PDP_INGREDIENT_FILES tools/cutout-sheet.py        the ingredient cutouts (one shared set)
   ========================================================= */
(function () {
  'use strict';

  // BEGIN GENERATED PLACEMENTS (tools/compose-lifestyle.py)
  var PDP_PLACEMENTS = {"aam-ras":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9.0}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"bhindi-masala":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"dal-fry":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"dal-khichdi":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"dal-makhani":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"dal-tadka":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"fried-rice":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"fried-rice-manchurian":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.3542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"gajar-halwa":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9.0}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"gujarati-dal":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"hot-and-sour-soup":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"idli-sambar":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"jain-poha":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.503,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.2867,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.7303,"w":0.34,"rot":-15}}},"jeera-rice":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"kanda-poha":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"masala-khichdi-kadhi":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"mexican-rice":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"moong-masala":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"mumbai-misal":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"paneer-bhurji":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"paneer-butter-masala":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"pav-bhaji":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"pind-ke-chhole":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"rajma-masala":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2304,"cy":0.7353,"w":0.34,"rot":6}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5879,"cy":0.53,"w":0.4,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"rawa-sheera":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9.0}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"schezwan-rice":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"sweet-corn-soup":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"tawa-pulao":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"tomato-soup":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2671,"cy":0.72,"w":0.36,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"upma":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"veg-biryani":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"veg-kadhai":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"veg-makhanwala":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"jain-dal-khichdi":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"jain-dal-makhani":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"jain-masala-khichdi-kadhi":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"jain-paneer-bhurji":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"jain-paneer-butter-masala":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"jain-pav-bhaji":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"jain-pind-ke-chhole":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"jain-rajma-masala":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2304,"cy":0.7353,"w":0.34,"rot":6}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"jain-schezwan-rice":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"jain-upma":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"jain-veg-biryani":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"jain-veg-kadhai":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"jain-veg-makhanwala":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}}};
  // END GENERATED PLACEMENTS

  // BEGIN GENERATED INGREDIENTS (tools/cutout-sheet.py)
  var PDP_INGREDIENT_FILES = [{"file": "ingredient-1.webp", "name": "kidney-beans", "w": 400, "h": 227}, {"file": "ingredient-2.webp", "name": "tomato", "w": 400, "h": 326}, {"file": "ingredient-3.webp", "name": "ginger", "w": 400, "h": 313}, {"file": "ingredient-4.webp", "name": "garlic", "w": 400, "h": 399}, {"file": "ingredient-5.webp", "name": "onion", "w": 400, "h": 383}, {"file": "ingredient-6.webp", "name": "green-chilli", "w": 400, "h": 192}, {"file": "ingredient-7.webp", "name": "whole-spices", "w": 400, "h": 242}, {"file": "ingredient-8.webp", "name": "coriander", "w": 400, "h": 330}];
  // END GENERATED INGREDIENTS

  // Every single product that has a 3D pouch: slug -> minutes printed on ITS pack ("Ready to eat in N minutes").
  // Read from the front artwork of each pack. Do not edit the artwork; if a pack changes, change the number here.
  var PDP_PRODUCTS = {
    'rajma-masala': { min: 5, own: { hero: 'Rajma Masala pouch lying on a dark wooden table beside a thali of rajma, rice and roti', ingredients: 'Rajma Masala pouch surrounded by the ingredients used in the dish' }, serving: { hero: true, ingredients: false } },
    'paneer-butter-masala': { min: 7 }, 'paneer-bhurji': { min: 7 }, 'pind-ke-chhole': { min: 5 }, 'pav-bhaji': { min: 5 },
    'bhindi-masala': { min: 5 }, 'veg-kadhai': { min: 5 }, 'veg-makhanwala': { min: 5 }, 'moong-masala': { min: 5 },
    'dal-makhani': { min: 5 }, 'dal-tadka': { min: 5 }, 'dal-fry': { min: 5 }, 'gujarati-dal': { min: 5 },
    'dal-khichdi': { min: 7 }, 'masala-khichdi-kadhi': { min: 7 }, 'veg-biryani': { min: 7 }, 'jeera-rice': { min: 7 },
    'tawa-pulao': { min: 7 }, 'fried-rice-manchurian': { min: 7 }, 'fried-rice': { min: 7 }, 'schezwan-rice': { min: 7 },
    'mexican-rice': { min: 7 }, 'kanda-poha': { min: 5 }, 'jain-poha': { min: 5 }, 'idli-sambar': { min: 5 },
    'upma': { min: 5 }, 'mumbai-misal': { min: 5 }, 'tomato-soup': { min: 5 }, 'sweet-corn-soup': { min: 5 },
    'hot-and-sour-soup': { min: 5 },
    // Jain versions (pouch-art/jain-<id>-*): the minutes of the regular pack of the same dish (ASSUMPTION: the Jain pack prints the same time; confirm with the client)
    'jain-dal-khichdi': { min: 7 }, 'jain-dal-makhani': { min: 5 }, 'jain-masala-khichdi-kadhi': { min: 7 }, 'jain-paneer-bhurji': { min: 7 }, 'jain-paneer-butter-masala': { min: 7 }, 'jain-pav-bhaji': { min: 5 }, 'jain-pind-ke-chhole': { min: 5 }, 'jain-rajma-masala': { min: 5 }, 'jain-schezwan-rice': { min: 7 }, 'jain-upma': { min: 5 }, 'jain-veg-biryani': { min: 7 }, 'jain-veg-kadhai': { min: 5 }, 'jain-veg-makhanwala': { min: 5 },
    // The three sweets have their own ingredients photo (no spices): pdp/<slug>/plates/ingredients.png
    'gajar-halwa': { min: 7, own: { ingredients: 'Gajar Halwa pouch surrounded by fresh carrots, milk, ghee, sugar and nuts' } },
    'aam-ras': { min: 5, own: { ingredients: 'Aam Ras pouch surrounded by ripe Alphonso mangoes, sugar and milk' } },
    'rawa-sheera': { min: 5, own: { ingredients: 'Rawa Sheera pouch surrounded by semolina, ghee, milk, sugar and nuts' } }
  };

  // "Inside the pack" strip: only dishes that have the dry / wet / ready scene images (scenes/processed/<folder>/{dry,wet,ready}-640.webp).
  // Static on purpose: scenes/scene-data.js loads after the first render of a directly opened page.
  var INSIDE_DIR = {
    'rajma-masala': 'scenes/processed/rajma-masala/',
    'paneer-butter-masala': 'scenes/processed/panner-butter-masala/'   // the folder keeps its original spelling
  };
  var INSIDE_ALT = { dry: 'The dry, freeze-dried meal in a bowl', wet: 'Hot water poured over the meal', ready: 'The meal ready to eat' };

  // Alt text for the shared photos; {name} is the product title, filled in when the page mounts.
  var SHARED_ALT = {
    hero: '{name} pouch on a dark wooden table beside a plated serving of the dish',
    ingredients: '{name} pouch surrounded by whole Indian spices and fresh herbs',
    prep: '{name} pouch beside a kettle pouring hot water into a bowl on a kitchen counter',
    onthego: '{name} pouch on a wooden desk with a flask, spork and backpack, ready for travel'
  };

  // Gallery column, in order. pouchAzimuth = where the 3D pouch turns when the card is mid-screen (desktop/tablet).
  // The "Inside the pack" card appears only for dishes that have a scene in scenes/scene-data.js.
  // serving = show the "Serving suggestion" caption (the photo shows food that is not the pack's own contents).
  var CARD_PLAN = [
    { id: 'hero',        type: 'lifestyle', image: 'hero',        pouchAzimuth: 20,  serving: true  },
    { id: 'inside',      type: 'inside',                           pouchAzimuth: 0 },
    { id: 'ingredients', type: 'lifestyle', image: 'ingredients', pouchAzimuth: 180, serving: false },
    { id: 'prep',        type: 'lifestyle', image: 'prep',        pouchAzimuth: 25,  serving: true },
    { id: 'facts',       type: 'facts',                            pouchAzimuth: 0 },
    { id: 'onthego',     type: 'lifestyle', image: 'onthego',     pouchAzimuth: -20, serving: false }
  ];

  var BASE = {
    // Stage dressing: the four claim chips are ON, the floating ingredient cutouts are OFF (too busy next to the pouch).
    // Flip either flag to switch them; the cutout files (pdp/shared/ingredients, the same set for every product) are unaffected.
    showChips: true,
    showIngredients: false,
    cutoutDir: 'pdp/shared/ingredients/',

    // Hotspot chips (real HTML). {min} is replaced with the product's own prep time.
    // slot = where the chip sits in the stage (%): kept at the left/right edges so it never covers the pouch centre.
    // ASSUMPTION: every Magic Meals pack prints the same claim icons (freeze-dried, no MSG, 100% natural); confirm with the client.
    chips: {
      front: [
        { id: 'freeze', label: 'Freeze-dried',           slot: { left: 2,  top: 14 } },
        { id: 'ready',  label: 'Ready in {min} minutes', slot: { right: 2, top: 26 } },
        { id: 'msg',    label: 'No MSG',                 slot: { left: 2,  top: 50 } },
        { id: 'nat',    label: '100% natural',           slot: { right: 2, top: 62 } }
      ],
      back: []   // no chips on the back view
    },

    // Key facts card: only claims printed on the pack. icon = key into FACT_ICONS in pdp-scene.js
    chipsFacts: [
      { icon: 'snow',  label: 'Freeze-dried' },
      { icon: 'clock', label: 'Ready in {min} minutes' },
      { icon: 'check', label: 'No MSG' },
      { icon: 'leaf',  label: '100% natural' }
    ],

    // Floating ingredients around the pouch (off by default, see showIngredients). x/y/size are % of the stage; layer: back | mid | front;
    // depth = parallax factor (sign = direction); mobile = kept on phones (max 4); dur/phase = float seconds; hidden = not shown.
    ingredientSlots: [
      { x: 6,  y: 8,  size: 17, layer: 'back',  depth: -0.45, rot: -14, dur: 5.2, phase: 0,    mobile: true  },
      { x: 78, y: 10, size: 15, layer: 'back',  depth: -0.35, rot: 18,  dur: 4.4, phase: -1.4, mobile: false },
      { x: 82, y: 40, size: 16, layer: 'mid',   depth: 0.35,  rot: 8,   dur: 5.8, phase: -2.6, mobile: true  },
      { x: 2,  y: 36, size: 14, layer: 'mid',   depth: 0.3,   rot: -22, dur: 4.8, phase: -0.8, mobile: false, hidden: true },
      { x: 5,  y: 64, size: 19, layer: 'front', depth: 0.85,  rot: 10,  dur: 5.5, phase: -3.1, mobile: true  },
      { x: 76, y: 66, size: 17, layer: 'front', depth: 0.75,  rot: -9,  dur: 4.2, phase: -1.9, mobile: true  },
      { x: 40, y: 2,  size: 12, layer: 'back',  depth: -0.25, rot: 26,  dur: 6.0, phase: -4.2, mobile: false, hidden: true },
      { x: 44, y: 70, size: 12, layer: 'front', depth: 0.6,   rot: -30, dur: 5.0, phase: -2.2, mobile: false }
    ]
  };

  function build(slug, o) {
    o = o || {};
    var cards = CARD_PLAN.filter(function (c) { return c.type !== 'inside' || INSIDE_DIR[slug]; }).map(function (c) {
      var n = Object.assign({}, c);
      if (c.type === 'lifestyle') {
        n.alt = (o.own && o.own[c.image]) || SHARED_ALT[c.image];
        if (o.serving && o.serving[c.image] != null) n.serving = o.serving[c.image];
        n.plate = c.image;
      }
      return n;
    });
    return Object.assign({}, BASE, {
      dir: 'pdp/' + slug + '/',
      tint: 'var(--pdp-tint-' + slug + ')',          // pdp/pdp-tints.css (generated from the pouch)
      ink: 'var(--pdp-ink-' + slug + ')',
      prepMinutes: o.min,
      inside: INSIDE_DIR[slug] ? [
        { src: INSIDE_DIR[slug] + 'dry-640.webp',   alt: INSIDE_ALT.dry,   caption: 'Dry' },
        { src: INSIDE_DIR[slug] + 'wet-640.webp',   alt: INSIDE_ALT.wet,   caption: 'Add hot water' },
        { src: INSIDE_DIR[slug] + 'ready-640.webp', alt: INSIDE_ALT.ready, caption: 'Ready in {min} minutes' }
      ] : null,
      cards: cards,
      placements: PDP_PLACEMENTS[slug] || {},
      ingredientFiles: PDP_INGREDIENT_FILES
    });
  }

  window.PDP_SCENES = {};
  Object.keys(PDP_PRODUCTS).forEach(function (slug) { window.PDP_SCENES[slug] = build(slug, PDP_PRODUCTS[slug]); });

  // Combos: the same page as the singles, but the big left panel shows the combo's pouches together (flat picture) instead of the 3D pouch,
  // and the card column has no "Inside the pack" card. pdp/combos/combo-gallery.js (generated by tools/compose-combo-gallery.py) lists the
  // combos and their dishes; the prep time shown is the range printed on the dishes' own packs (e.g. 5-7).
  var COMBO_ALT = {
    hero: '{name} pouches on a dark wooden table beside a plated serving of the first dish',
    ingredients: '{name} pouches surrounded by whole Indian spices and fresh herbs',
    prep: '{name} pouches beside a kettle pouring hot water into a bowl on a kitchen counter',
    onthego: '{name} pouches on a wooden desk with a flask, spork and backpack, ready for travel'
  };
  function baseDish(d) { return PDP_PRODUCTS[d] ? d : d.replace(/^jain-/, ''); }      // a Jain pouch shares its dish's colours and prep time
  function buildCombo(id, dishes) {
    dishes = dishes.map(baseDish);
    var mins = dishes.map(function (d) { return PDP_PRODUCTS[d] && PDP_PRODUCTS[d].min; }).filter(Boolean);
    var lo = Math.min.apply(null, mins), hi = Math.max.apply(null, mins);
    var cfg = build(id, { min: lo === hi ? lo : lo + '–' + hi });
    cfg.flat = true;
    cfg.dir = 'pdp/combos/' + id + '/';
    cfg.tint = 'var(--pdp-tint-' + dishes[0] + ')';      // the first dish's colours
    cfg.ink = 'var(--pdp-ink-' + dishes[0] + ')';
    cfg.showChips = false;
    cfg.placements = { hero: { w: W_CARD, h: H_CARD }, ingredients: { w: W_CARD, h: H_CARD }, prep: { w: W_CARD, h: H_CARD }, onthego: { w: W_CARD, h: H_CARD } };
    cfg.cards = cfg.cards.map(function (c) {
      if (c.type !== 'lifestyle') return c;
      return Object.assign({}, c, { alt: COMBO_ALT[c.image], serving: c.image === 'hero' || c.image === 'prep' });
    });
    return cfg;
  }
  var W_CARD = 1200, H_CARD = 1500;
  var COMBOS = window.COMBO_PDP || {};
  Object.keys(COMBOS).forEach(function (id) { window.PDP_SCENES[id] = buildCombo(id, COMBOS[id].dishes); });
})();
