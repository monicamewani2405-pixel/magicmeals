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
      imgVersion: 3,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A steel plate of kanda poha with a lemon wedge and curry leaves, a glass of chai and a bowl of lemons and green chillies on a wooden table' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a wooden table in a morning kitchen beside a steel plate of kanda poha and a kulhad of chai' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a wooden table beside a bowl of kanda poha, a mug of tea and woollen gloves, with a snowy alpine village seen through the chalet window' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'jain-poha': {
      imgVersion: 1,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A brass plate of Jain poha with lemon wedges and curry leaves on a green cloth' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a cream kitchen counter beside a brass plate of Jain poha and a brass tumbler, with a sunny window behind' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a weathered wooden table beside a bowl of Jain poha and a cup of tea, with blue-domed white houses and the sea seen through the window' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'idli-sambar': {
      imgVersion: 1,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'Steamed idlis on a steel plate with sambar and coconut chutney in small bowls, on a dark wooden table' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside idlis on a banana leaf with sambar and chutney, and brass lamps behind' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a window table beside a steel plate of idlis with sambar and chutney, with a rainy European street seen through the window' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'upma': {
      imgVersion: 1,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A steel plate of upma with curry leaves and a lime wedge, a bowl of chutney and a spoon on a dark wooden table' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a wooden desk beside a bowl of upma and a steel tumbler, with books and a window behind' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a rock beside a plate of upma, a camping stove and a mug, with snowy mountains above a sea of cloud at sunrise' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'mumbai-misal': {
      imgVersion: 1,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A steel plate of misal with pav, farsan, lime and chillies on a dark wooden table' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a steel counter beside a plate of misal with pav and a steel tumbler, with a sunlit street behind' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a rain-wet table beside a bowl of misal, sunglasses and a notebook, with green misty hills behind' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'jain-upma': {
      imgVersion: 1,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A brass plate of Jain upma with curry leaves and lime wedges on a stone surface' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a windowsill table beside a bowl of Jain upma, a steel kettle and a herb pot, with soft curtains behind' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a hotel table beside a bowl of Jain upma on a tray, a travel pillow and headphones, with a city skyline at dusk through the window' },
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
      imgVersion: 1,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A white bowl of dal khichdi with ghee and fresh coriander, seen from above, surrounded by rice, pigeon pea and green moong lentils, a tomato, cumin, mustard seeds, turmeric, curry leaves and coriander on a dark wooden table' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside a white bowl of dal khichdi, in soft window light' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a window table beside a bowl of dal khichdi, with green northern lights over a snowy Icelandic landscape seen through the window' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'masala-khichdi-kadhi': {
      imgVersion: 1,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A bowl of vegetable khichdi with a small bowl of kadhi, seen from above, surrounded by rice, pigeon pea lentils, gram flour, curd, French beans, carrot, green peas, ginger, green chillies, garlic and mustard seeds on a dark wooden table' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside a bowl of vegetable khichdi and a small bowl of kadhi, in soft window light' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a villa balcony table beside a bowl of khichdi and a small bowl of kadhi, with green Bali rice terraces and palm trees seen beyond the railing' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'veg-biryani': {
      imgVersion: 1,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A dark bowl of veg biryani, seen from above, surrounded by cauliflower, carrot, French beans, green peas, capsicum, tomato, onion, garlic, ginger, curd and butter on a dark wooden table' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside a bowl of veg biryani with carrot, peas and beans, in soft window light' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a rooftop table beside a bowl of veg biryani, with the Bosphorus and mosque minarets at dusk in the distance' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'jeera-rice': {
      imgVersion: 1,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A dark bowl of jeera rice with a little ghee, seen from above, with a small bowl of basmati rice, a dish of cumin seeds and a dish of ghee on a dark wooden table' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside a bowl of jeera rice, in soft window light' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a cottage window table beside a bowl of jeera rice, with a misty Scottish loch and heather hills seen through the window' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    },
    'tawa-pulao': {
      imgVersion: 1,
      cards: [
        { id: 'serving',   type: 'lifestyle', image: 'serving',   pouchAzimuth: 20,  serving: true,  alt: 'A dark bowl of tawa pulao with peas and a little butter, seen from above, surrounded by a tomato, onion, capsicum, ginger, garlic, green peas, a potato, coriander and butter on a dark wooden table' },
        { id: 'hero',      type: 'lifestyle', image: 'hero',      pouchAzimuth: 25,  serving: false, alt: '{name} pouch standing on a dark wooden table beside a bowl of tawa pulao, in soft window light' },
        { id: 'abroad',    type: 'lifestyle', image: 'abroad',    pouchAzimuth: -20, serving: false, alt: '{name} pouch standing on a hotel window table beside a bowl of tawa pulao, with Sydney Harbour, the Opera House and the harbour bridge at night seen through the window' },
        { id: 'nutrition', type: 'lifestyle', image: 'nutrition', pouchAzimuth: 180, serving: false, alt: 'Nutrition facts and nutrition information tables printed on the back of the {name} pack' }
      ],
      placements: {
        serving: { w: 1200, h: 1500 }, hero: { w: 1200, h: 1500 }, abroad: { w: 1200, h: 1500 }, nutrition: { w: 1200, h: 1500 }
      }
    }
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
