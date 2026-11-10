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
  var PDP_PLACEMENTS = {"aam-ras":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9.0}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"bhindi-masala":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"dal-fry":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"dal-khichdi":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"dal-makhani":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"dal-tadka":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"fried-rice":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"fried-rice-manchurian":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.3542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"gajar-halwa":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9.0}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"gujarati-dal":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"hot-and-sour-soup":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"idli-sambar":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12.0}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5,"cy":0.5,"w":0.38,"rot":-9.0}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7408,"cy":0.268,"w":0.34,"rot":14.0}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15.0}}},"jain-poha":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12.0}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5,"cy":0.5003,"w":0.38,"rot":-9.0}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.2867,"w":0.36,"rot":17.0}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.7303,"w":0.34,"rot":-15.0}}},"jeera-rice":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"kanda-poha":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12.0}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5,"cy":0.5,"w":0.38,"rot":-9.0}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17.0}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15.0}}},"masala-khichdi-kadhi":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"mexican-rice":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"moong-masala":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"mumbai-misal":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12.0}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5,"cy":0.5,"w":0.38,"rot":-9.0}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7408,"cy":0.268,"w":0.34,"rot":14.0}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15.0}}},"paneer-bhurji":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"paneer-butter-masala":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"pav-bhaji":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"pind-ke-chhole":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"rajma-masala":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2304,"cy":0.7353,"w":0.34,"rot":6}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5879,"cy":0.53,"w":0.4,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"rawa-sheera":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9.0}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"schezwan-rice":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"sweet-corn-soup":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"tawa-pulao":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"tomato-soup":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2671,"cy":0.72,"w":0.36,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"upma":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12.0}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5,"cy":0.5,"w":0.38,"rot":-9.0}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17.0}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15.0}}},"veg-biryani":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"veg-kadhai":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"veg-makhanwala":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"jain-dal-khichdi":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"jain-dal-makhani":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"jain-masala-khichdi-kadhi":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"jain-paneer-bhurji":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"jain-paneer-butter-masala":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"jain-pav-bhaji":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"jain-pind-ke-chhole":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"jain-rajma-masala":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2304,"cy":0.7353,"w":0.34,"rot":6}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"jain-schezwan-rice":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"jain-upma":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12.0}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5,"cy":0.5,"w":0.38,"rot":-9.0}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17.0}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15.0}}},"jain-veg-biryani":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"jain-veg-kadhai":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}},"jain-veg-makhanwala":{"hero":{"w":1200,"h":1500,"pouch":{"cx":0.2542,"cy":0.7333,"w":0.34,"rot":12}},"ingredients":{"w":1200,"h":1500,"pouch":{"cx":0.5333,"cy":0.5033,"w":0.38,"rot":-9}},"prep":{"w":1200,"h":1500,"pouch":{"cx":0.7125,"cy":0.287,"w":0.36,"rot":17}},"onthego":{"w":1200,"h":1500,"pouch":{"cx":0.7329,"cy":0.73,"w":0.34,"rot":-15}}}};
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
    { id: 'onthego',     type: 'lifestyle', image: 'onthego',     pouchAzimuth: -20, serving: false }
  ];

  // Lively gallery (v2, tools/compose-lively.py): products listed here show 4 pictures in this order instead of CARD_PLAN:
  // serving suggestion (the improved original), eye-level hero, an 'abroad' picture (the pack works anywhere in the world), and the pack's nutrition tables. The old ingredients / prepare /
  // on-the-go pictures are retired for them (copies in _old-images/<slug>/). imgVersion is added to the picture URLs (cache busting).
  var LIVELY = {
    'kanda-poha': {
      imgVersion: 4,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A traditional brass plate of golden Maharashtrian Poha with roasted peanuts, curry leaves, fresh coconut, and lemon wedge' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a morning wooden table beside a steaming brass plate of golden Poha and cutting chai' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a cozy European window table beside a warm bowl of Indian Poha and hot tea' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'jain-poha': {
      imgVersion: 2,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A traditional brass plate of pure Jain Poha tempered with mustard seeds, curry leaves, crunchy peanuts, and fresh lemon' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a morning wooden table beside a steaming brass plate of pure Jain Poha and chai' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a cozy European window table beside a warm bowl of pure Jain Poha and hot tea' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'idli-sambar': {
      imgVersion: 2,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'Steaming pillowy-soft white mini idlis on a banana leaf with aromatic vegetable lentil sambar and coconut chutney' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden breakfast table beside steaming idlis, vegetable sambar, and filter coffee' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a European window-side table beside a plate of fluffy steamed idlis and warm sambar' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'upma': {
      imgVersion: 2,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A brass plate of authentic South Indian Rava Upma with roasted cashews, curry leaves, green peas, and coconut chutney' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a warm wooden breakfast table beside a steaming plate of Rava Upma and filter coffee' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on an alpine mountain balcony table beside a bowl of South Indian Rava Upma and coffee' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'mumbai-misal': {
      imgVersion: 2,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A shallow ceramic bowl of fiery Mumbai Misal topped with crunchy farsan and coriander, beside soft buttered pav bread' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a rustic wooden dining table beside a bowl of spicy Mumbai Misal with butter-toasted pavs and lemon' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on an outdoor harbor terrace table beside a bowl of Mumbai Misal and two buttered pav buns' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'jain-upma': {
      imgVersion: 2,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A brass plate of pure Jain Rava Upma with roasted cashews, curry leaves, sweet green peas, and coconut chutney' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a warm wooden breakfast table beside a steaming plate of pure Jain Rava Upma and filter coffee' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on an alpine mountain balcony table beside a bowl of pure Jain Rava Upma and coffee' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'tomato-soup': {
      imgVersion: 2,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A white bowl of tomato soup with a swirl of cream and coriander, seen from above, surrounded by fresh tomatoes, green capsicum, red chillies and coriander on a dark wooden table' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside a white bowl of tomato soup with a spoon, in soft window light' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a café window table beside a cup of tomato soup and a scarf, with a rainy Paris street at dusk seen through the window' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'sweet-corn-soup': {
      imgVersion: 2,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A bowl of creamy sweet corn vegetable soup with peas, carrot and capsicum, seen from above, surrounded by carrots, spring onions, capsicum and coriander on a dark wooden table' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside a bowl of sweet corn soup with spring onion, in soft window light' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a train window table beside a cup of sweet corn soup and a ticket, with an Alpine lake and snowy peaks seen through the window' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'hot-and-sour-soup': {
      imgVersion: 5,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A dark bowl of hot and sour soup with a little coriander and carrot, seen from above on a dark wooden table, surrounded by a cabbage half, carrot, red and green capsicum, ginger, garlic cloves, green chillies, coriander and a small bowl of black peppercorns' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside a bowl of hot and sour soup with coriander, in moody window light' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a mountain rock beside a steel camping mug of hot and sour soup and a small stove, with snowy peaks above a sea of cloud at sunrise' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'dal-makhani': {
      imgVersion: 1,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A brass-rimmed bowl of dal makhani with a swirl of cream and a pat of butter, seen from above, surrounded by black lentils, tomatoes, ginger, garlic, dried red chillies, a green chilli and butter on a dark wooden table' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside a bowl of dal makhani with cream and butter, in soft window light' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a window table beside a bowl of dal makhani, with a rainy neon-lit Tokyo street seen through the window' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'dal-tadka': {
      imgVersion: 1,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A white bowl of dal tadka with dried red chillies, cumin and coriander, seen from above, surrounded by pigeon pea and moong lentils, onion, tomato, garlic, ginger, green chillies, cumin seeds, bay leaves and coriander on a dark wooden table' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside a white bowl of dal tadka with a ghee tempering, in soft window light' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a camp table beside a bowl of dal tadka, with a desert tent opening onto red cliffs and a sunset sky' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'dal-fry': {
      imgVersion: 1,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A white bowl of dal fry with fresh coriander, seen from above, surrounded by pigeon pea lentils, tomatoes, green chillies, cumin seeds, turmeric, red chilli powder and coriander on a dark wooden table' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside a white bowl of dal fry with coriander, in soft window light' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a camper van table beside a bowl of dal fry, with a turquoise sea and coastal cliffs seen through the open door' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'gujarati-dal': {
      imgVersion: 1,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A steel-rimmed bowl of Gujarati dal with fresh coriander, seen from above, with pigeon pea and chickpea dals, a tomato, ginger, cumin seeds and coriander on a dark wooden table' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside a steel bowl of Gujarati dal, in soft window light' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a cabin balcony table beside a steel bowl of Gujarati dal, with a Norwegian fjord and mountains in the distance' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'jain-dal-makhani': {
      imgVersion: 1,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A brass-rimmed bowl of Jain dal makhani with a swirl of cream and a pat of butter, seen from above, surrounded by black lentils, red kidney beans, butter, red chilli powder, fenugreek leaves, garam masala and green chillies on a dark wooden table' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside a bowl of dal makhani with cream and butter, in soft window light' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a hotel window table beside a bowl of dal makhani, with a Venice canal and old buildings at dusk seen through the window' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'dal-khichdi': {
      imgVersion: 3,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A rustic artisanal bowl of comforting yellow Moong Dal Khichdi with sizzling ghee tadka, cumin, garlic flakes, red chili, curry leaves and melted desi ghee' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a warm wooden dining table beside a steaming bowl of comforting Dal Khichdi, in natural morning light' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a cozy wooden desk by a rainy twilight window overlooking city rooftops, beside a bowl of Dal Khichdi' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'masala-khichdi-kadhi': {
      imgVersion: 3,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A rustic artisanal bowl of authentic Gujarati Masala Khichdi with carrots, peas and peanuts, served with a katori of velvety white Gujarati Kadhi and desi ghee' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside a bowl of Masala Khichdi and Gujarati Kadhi, in soft window light' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a charming European cottage window table beside a bowl of Masala Khichdi and Kadhi at autumn twilight' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'veg-biryani': {
      imgVersion: 4,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A handcrafted bowl of aromatic Veg Biryani with fragrant saffron basmati rice, tender green peas, carrots, French beans, and crispy caramelized onions' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside a steaming handi of royal Veg Biryani, in warm restaurant dining ambiance' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a rustic wooden table by a Parisian window overlooking European architecture at sunset, beside a bowl of Veg Biryani' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'jeera-rice': {
      imgVersion: 3,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'An artisanal bowl of fragrant Basmati Jeera Rice tempered in golden desi ghee with crackled roasted cumin seeds, bay leaf, cloves and fresh coriander' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a warm rustic wooden dining table beside a steaming bowl of fragrant Jeera Rice, in soft window light' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a sunlit wooden balcony table beside a bowl of Jeera Rice, overlooking the Swiss Alps' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'tawa-pulao': {
      imgVersion: 7,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A rustic handcrafted ceramic dish of vibrant Mumbai Street-Style Tawa Pulao with fluffy spiced basmati, golden-seared paneer cubes, green peas, capsicum, onion rings and a fresh lemon wedge' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a warm rustic wooden table beside a bowl of vibrant Tawa Pulao, in soft window light' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a sunlit balcony table beside a bowl of Tawa Pulao, with Sydney Harbour and the Opera House in the distance' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'fried-rice-manchurian': {
      imgVersion: 3,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A rustic platter of golden Veg Fried Rice served with Vegetable Manchurian balls in rich savory soy-garlic gravy with spring onions' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside a platter of Veg Fried Rice with Manchurian, in soft window light' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a modern dining table beside a platter of Fried Rice Manchurian, overlooking an international city skyline at twilight' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'fried-rice': {
      imgVersion: 3,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'An artisanal ceramic bowl of steaming wok-tossed Veg Fried Rice with crisp carrots, green beans, sweet corn and fresh spring onions' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a rustic wooden table beside a bowl of Veg Fried Rice, in soft directional window light' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a modern balcony table beside a bowl of Fried Rice, overlooking a sparkling city harbor at dusk' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'schezwan-rice': {
      imgVersion: 3,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A stylish rustic dark bowl of fiery, vibrant red Indo-Chinese Schezwan Fried Rice tossed in spicy chili-garlic sauce with bell peppers and scallions' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside a bowl of steaming hot Schezwan Rice, in warm soft light' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a high-floor terrace table beside a bowl of Schezwan Rice, overlooking a glowing cityscape at dusk' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'mexican-rice': {
      imgVersion: 4,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A rustic stoneware bowl of fluffy Mexican Fiesta rice with kidney beans, sweet corn, bell peppers, fresh cilantro, jalapeno rings, and a lime wedge on a wooden table' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a warm rustic wooden table beside a bowl of fluffy Mexican fiesta rice, in soft window light' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a scenic outdoor wooden camp table beside a bowl of Mexican rice, with red rock canyon cliffs at golden hour' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'jain-dal-khichdi': {
      imgVersion: 3,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A rustic artisanal bowl of comforting yellow Moong Dal Khichdi with sizzling ghee tadka, cumin, red chili, curry leaves and melted desi ghee' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside a bowl of dal khichdi, in soft window light' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a cozy wooden desk by a rainy twilight window overlooking city rooftops, beside a bowl of Dal Khichdi' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'jain-masala-khichdi-kadhi': {
      imgVersion: 3,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A rustic artisanal bowl of authentic Gujarati Masala Khichdi with peas and peanuts, served with a katori of velvety white Gujarati Kadhi and desi ghee' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside a bowl of Masala Khichdi and Gujarati Kadhi, in soft window light' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a charming European cottage window table beside a bowl of Masala Khichdi and Kadhi at autumn twilight' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'jain-schezwan-rice': {
      imgVersion: 3,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A stylish rustic dark bowl of fiery, vibrant red Schezwan Fried Rice tossed in spicy sauce with bell peppers and scallions' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside a bowl of Schezwan rice, in soft window light' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a high-floor terrace table beside a bowl of Schezwan Rice, overlooking a glowing cityscape at dusk' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'jain-veg-biryani': {
      imgVersion: 3,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A rustic earthenware handi of royal Dum Veg Biryani with long saffron basmati grains, golden paneer cubes, cashews, mint and raita' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside a steaming handi of royal Veg Biryani, in warm restaurant dining ambiance' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a rustic wooden table by a Parisian window overlooking European architecture at sunset, beside a bowl of Veg Biryani' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'rajma-masala': {
      imgVersion: 3,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A rustic ceramic bowl of rich authentic Punjabi Rajma Masala slow-simmered in tomato-ginger gravy with fresh coriander and butter' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a warm dark wooden table beside a steaming bowl of Punjabi Rajma Masala with warm folded roti on a linen cloth' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on an alpine lake terrace table beside an artisanal bowl of steaming Rajma Masala, overlooking mountain peaks' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'paneer-butter-masala': {
      imgVersion: 3,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A traditional ceramic handi of royal Paneer Butter Masala with soft paneer cubes in creamy makhani gravy with kasuri methi and cream' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a warm wooden dining table beside a traditional handi of rich Paneer Butter Masala and warm folded roti' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a sunlit balcony table beside a bowl of Paneer Butter Masala, overlooking a scenic European cityscape' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'paneer-bhurji': {
      imgVersion: 3,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A handcrafted ceramic dish of spiced crumbled Paneer Bhurji tossed with ripe tomatoes, green capsicum and fresh coriander' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside a ceramic dish of authentic scrambled Paneer Bhurji and warm folded roti' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a cozy window table in a snowy alpine chalet beside a plate of scrambled Paneer Bhurji and hot tea' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'pind-ke-chhole': {
      imgVersion: 3,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'An authentic earthenware handi of dark spiced Amritsari Pind Ke Chhole with slit green chilies and roasted cumin' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a rustic wooden table beside an earthenware handi of dark spiced Amritsari Chhole and warm bhatura' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on an outdoor terrace table beside a bowl of spiced Amritsari Chhole, overlooking a sunny historic city' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'pav-bhaji': {
      imgVersion: 3,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A shallow rustic ceramic plate of rich buttery Mumbai Pav Bhaji topped with melting butter beside golden toasted pav bread and lemon' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden dining table beside a plate of Mumbai Pav Bhaji with butter-toasted pav buns and a lemon wedge' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a sunny terrace table overlooking blue harbor waters beside a plate of buttered Pav Bhaji and toasted pavs' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'bhindi-masala': {
      imgVersion: 3,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'An artisanal ceramic bowl of homestyle Bhindi Masala with crisp-tender green okra sautéed with tomatoes, cumin and coriander' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside a bowl of homestyle Bhindi Masala and warm folded roti' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a cozy European window table beside a bowl of spiced Bhindi Masala in soft natural light' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'veg-kadhai': {
      imgVersion: 3,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A traditional Indian kadhai dish of vibrant Veg Kadhai with crisp bell peppers, baby corn and garden vegetables in pounded coriander masala' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside a rustic kadhai of colorful Veg Kadhai and warm folded roti' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a sunlit terrace table beside a kadhai dish of spiced Veg Kadhai, overlooking scenic city rooftops' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'veg-makhanwala': {
      imgVersion: 3,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'An artisanal ceramic handi of rich Shahi Veg Makhanwala with garden vegetables in velvety tomato-cashew makhani gravy and butter' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside a ceramic handi of Veg Makhanwala with warm folded roti on a linen napkin' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a cozy European window-side table beside an artisanal bowl of delicious Veg Makhanwala in soft afternoon light' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'moong-masala': {
      imgVersion: 3,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A wholesome rustic ceramic bowl of comforting homestyle Moong Masala with tender green whole moong beans and fresh coriander' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a rustic wooden table beside a bowl of wholesome green Moong Masala and warm folded roti' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a cozy window table beside an artisanal bowl of warm green Moong Masala overlooking city rooftops' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'jain-paneer-bhurji': {
      imgVersion: 3,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A handcrafted ceramic dish of pure Jain Paneer Bhurji with spiced crumbled paneer, diced tomatoes and green capsicum' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside a ceramic dish of authentic Jain scrambled Paneer Bhurji and warm roti' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on an alpine chalet window table beside a plate of pure Jain scrambled Paneer Bhurji and tea' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'jain-paneer-butter-masala': {
      imgVersion: 3,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A traditional ceramic handi of pure Jain Paneer Butter Masala in velvety tomato-cashew makhani gravy with cream and kasuri methi' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a warm wooden dining table beside a handi of pure Jain Paneer Butter Masala and warm roti' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a sunlit balcony table beside a bowl of pure Jain Paneer Butter Masala, overlooking a scenic European cityscape' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'jain-pav-bhaji': {
      imgVersion: 3,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A shallow ceramic plate of authentic Jain Mumbai Pav Bhaji with spiced mashed vegetables, melting butter and toasted pav bread' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden dining table beside a plate of Jain Pav Bhaji with butter-toasted pav buns and lemon' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a sunny terrace table overlooking blue harbor waters beside a plate of pure Jain Pav Bhaji and toasted pavs' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'jain-pind-ke-chhole': {
      imgVersion: 3,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'An authentic earthenware handi of pure Jain Amritsari Pind Ke Chhole with dark spiced chickpeas and slit green chilies' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a rustic wooden table beside an earthenware handi of pure Jain Amritsari Chhole and warm bhatura' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on an outdoor terrace table beside a bowl of pure Jain Amritsari Chhole, overlooking a sunny historic city' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'jain-rajma-masala': {
      imgVersion: 3,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A rustic ceramic bowl of pure Jain Punjabi Rajma Masala with tender red kidney beans in rich tomato-ginger gravy with butter' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a warm dark wooden table beside a steaming bowl of pure Jain Rajma Masala with warm roti' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on an alpine lake terrace table beside an artisanal bowl of pure Jain Rajma Masala, overlooking mountain peaks' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'jain-veg-kadhai': {
      imgVersion: 3,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A traditional kadhai dish of pure Jain Veg Kadhai with crisp bell peppers, baby corn and garden vegetables in aromatic kadhai spices' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside a kadhai dish of pure Jain Veg Kadhai and warm roti' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a sunlit terrace table beside a kadhai dish of pure Jain Veg Kadhai, overlooking scenic city rooftops' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'jain-veg-makhanwala': {
      imgVersion: 3,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'An artisanal ceramic handi of pure Jain Shahi Veg Makhanwala with garden vegetables in creamy tomato-cashew makhani gravy' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside a ceramic handi of pure Jain Veg Makhanwala with warm roti on a linen napkin' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a cozy European window table beside an artisanal bowl of pure Jain Veg Makhanwala in soft afternoon light' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'gajar-halwa': {
      imgVersion: 2,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A traditional brass bowl of rich Gajar Ka Halwa with grated winter carrots, ghee, mawa, cashews, and pistachios' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a warm wooden dining table beside a steaming bowl of Gajar Ka Halwa' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a Himalayan winter lodge window table in Manali beside a bowl of warm Gajar Ka Halwa' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'aam-ras': {
      imgVersion: 2,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'An elegant brass katori of pure Ratnagiri Alphonso Aam Ras with saffron strands and cardamom' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a sunny table beside a bowl of golden Alphonso Aam Ras' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a coastal Ratnagiri Goa balcony terrace beside a bowl of refreshing Aam Ras overlooking the Arabian Sea' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'rawa-sheera': {
      imgVersion: 2,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A handcrafted brass bowl of Desi Ghee Rawa Sheera with roasted cashews, saffron, and golden raisins' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a warm wooden dining table beside a steaming bowl of Rawa Sheera' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a stone carved jharokha balcony overlooking the sacred Ganges in Rishikesh beside a bowl of warm Rawa Sheera' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
  };

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
    var lively = LIVELY[slug] || null;
    var cards = (lively ? lively.cards : CARD_PLAN).filter(function (c) { return c.type !== 'inside' || INSIDE_DIR[slug]; }).map(function (c) {
      var n = Object.assign({}, c);
      if (c.type === 'lifestyle') {
        n.alt = c.alt || (o.own && o.own[c.image]) || SHARED_ALT[c.image];
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
      placements: lively ? lively.placements : (PDP_PLACEMENTS[slug] || {}),
      imgVersion: lively ? lively.imgVersion : 0,
      ingredientFiles: PDP_INGREDIENT_FILES
    });
  }

  window.PDP_SCENES = {};
  Object.keys(PDP_PRODUCTS).forEach(function (slug) { window.PDP_SCENES[slug] = build(slug, PDP_PRODUCTS[slug]); });

  // Combos: the same page as the singles, but the big left panel shows the combo's pouches together (flat picture) instead of the 3D pouch,
  // and the card column has no "Inside the pack" card. pdp/combos/combo-gallery.js (generated by tools/compose-combo-gallery.py) lists the
  // combos and their dishes; the prep time shown is the range printed on the dishes' own packs (e.g. 5-7).
  var COMBO_ALT = {
    hero: 'A realistic, appetizing Indian dining feast serving suggestion showing all dishes of {name} served hot on a dining table',
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
    cfg.imgVersion = 6;
    cfg.dir = 'pdp/combos/' + id + '/';
    cfg.tint = 'var(--pdp-tint-' + dishes[0] + ')';      // the first dish's colours
    cfg.ink = 'var(--pdp-ink-' + dishes[0] + ')';
    cfg.showChips = false;
    cfg.placements = { hero: { w: W_CARD, h: H_CARD }, ingredients: { w: W_CARD, h: H_CARD }, prep: { w: W_CARD, h: H_CARD }, nutrition: { w: W_CARD, h: H_CARD } };
    cfg.cards = cfg.cards.map(function (c) {
      if (c.type !== 'lifestyle') return c;
      // the 4th picture is the nutrition tables of every pouch in the combo (tools/combo-nutrition-card.py); it replaces the on-the-go picture
      if (c.image === 'onthego') return { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 0, serving: false, plate: 'nutrition', alt: '{name}: the Nutrition Information table of each pouch in the combo, and the combo total per serving' };
      return Object.assign({}, c, { alt: COMBO_ALT[c.image], serving: c.image === 'hero' || c.image === 'prep' });
    });
    return cfg;
  }
  var W_CARD = 1200, H_CARD = 1500;
  var COMBOS = window.COMBO_PDP || {};
  Object.keys(COMBOS).forEach(function (id) { window.PDP_SCENES[id] = buildCombo(id, COMBOS[id].dishes); });
})();
