# TASK: replace every product's back-side image with the new back mockups

## Context
Magic Meals front-end prototype (plain HTML/CSS/JS, GSAP, no build step). Each product has a front pouch image and a back-panel image (ingredients, nutrition, cooking instructions). The designers sent NEW back mockups. Every place that shows a product's back image must use the new one: product pages, galleries, any 360/3D pouch viewer textures, optimised or mobile variants, and anything derived from them. Windows, PowerShell. Read CLAUDE.md in the project root first if it exists.

The source is the Google Drive folder "Magic Meals back mockup":
https://drive.google.com/drive/folders/1KCeF0iI8T1Rv1a4WnRQ5KF17ezvsRQ3H

## Scope
Allowed: the back-image files and their derived variants, the places that reference them (product data, JS, CSS, HTML), any script that processes back images, and a new `tools/replace-backs.py` (or .mjs). Do NOT change any front image, the hero, the scenes/ system, the header, cart, routing, copy or colours. Do NOT edit the artwork itself (no retouching, no text changes). Ignore scratch/, old patch scripts and files starting with "._".

## How to work
One pass. Do not ask questions (decide, list assumptions in the report). Never delete originals: move replaced files to `_old-backs/` keeping their relative paths. Use grep instead of re-reading large files. No walkthrough documents.

## Step 0: safety
`git status`; commit everything with `git add -A` and `git commit -m "Before back image replacement"`, then `git tag before-new-backs`. Ignore LF/CRLF warnings.

## Step 1: get the new images
1. If the folder `incoming-backs/` exists in the project root, use it. Otherwise try to download the Drive folder: `pip install gdown`, then `gdown --folder "https://drive.google.com/drive/folders/1KCeF0iI8T1Rv1a4WnRQ5KF17ezvsRQ3H" -O incoming-backs`. If the download fails or asks for permission, STOP and tell me to download the folder as a ZIP from Drive manually and extract it into `incoming-backs/`. Do not try to log in anywhere.
2. List the files found. Ignore files starting with "._", thumbnails, `.DS_Store`, `Thumbs.db` and non-image files. Report the count, file types and pixel sizes.

## Step 2: find the products and every place a back image is used
1. Read the product list (product data in main.js or a data file; hero-products.js) and get each product's name and slug.
2. Find every existing back image: grep the whole project (excluding scratch/, .git/ and the duplicate HTML file) for how back images are named and referenced (for example `back`, `-back`, `_back`, names like RAJMA_MASALA.png, `pouch-art/`, `products/`, `backImage`, `images.back`, gallery arrays, 360/3D viewer code that loads textures, model-viewer or Three.js texture loaders, srcset or `-640.webp` variants, any generated/processed copies, the brochure page if it embeds them). Print a table: product, current back file(s), where each is referenced (file:line). If a 360/3D viewer does not exist in the code, say so and skip it. Do not build one.

## Step 3: map new files to products (no guessing)
Normalise names (lowercase; remove spaces, underscores, hyphens, the words back, backside, mockup, copy, final, v1, v2, and the extension; fix the known typo "panner" = "paneer") and match each new file to a product by its normalised name against the product name and slug. Accept only exact or clearly equivalent matches. Print the mapping table. For every new file with no confident match, and every product with no new back, list them and LEAVE THEM UNCHANGED. Never assign a file by guessing. If two files match one product, keep the newer one (by file date) and list the other.

## Step 4: check each new image before replacing
For every matched pair compare the new back with the product's FRONT image:
1. Pouch silhouette: find the pouch bounding box in both images (after removing a white or near-white background; reuse the cutout approach already in tools/prep-scene.py: border flood-fill, JPEG-safe, erode 1px and feather 1px). The two boxes must have the same size and position within 2% of the canvas. If the new back is on a different canvas, crop and resize it uniformly to the front's canvas ONLY if the pouch shape then matches within 2%; otherwise do not replace it and list it as "needs a re-export from the designer".
2. Format: match the old back file's properties (transparent PNG at the same canvas size). If the new image has a solid white background, cut it out the same way the old one was; if it has transparency already, keep it. Never save a JPEG-compressed intermediate; write PNG. Keep the same file name and path as the old back image so existing references keep working. If the old file was a different type (for example .jpg) and the code references that name, keep the old name's extension in references or update the references consistently.
3. Do not alter the printed artwork in any way (no sharpening, no colour changes).

## Step 5: replace and regenerate
1. Move the old back file(s) of each matched product to `_old-backs/` (keep the relative path), then write the new file at the old path.
2. Regenerate every derived file for the back images: WebP copies, mobile variants (for example `*-640.webp`), thumbnails, atlas or texture files used by a 360/3D viewer, and any processed outputs, using the existing scripts or the same settings as the existing derived files.
3. Cache busting: browsers and Vercel will serve cached old images. Add a version parameter to every back image URL in the code (for example `?v=<today's date>` through one shared constant such as `ASSET_VERSION`, creating it if none exists), without changing the paths.
4. If a 360/3D viewer exists: confirm each product's back texture is the new file, is not mirrored (the text reads correctly when the pouch is rotated 180 degrees), and has the same orientation and scale as the front texture. Fix the texture settings only for the back texture if it is wrong (for example flipY, repeat or offset).

## Step 6: verify and report
1. Build ONE contact sheet: for every product a row with the old back (from `_old-backs/`), the new back, and the front, as small thumbnails. View it once and flag any product where the new back looks like it belongs to a different pouch shape, is cropped, or is blank.
2. In a browser, at 1440px and 390px, open each product page and check that the back view shows the new image (and in the 360/3D viewer if it exists, rotate to the back). Report any 404s, console errors or products still showing an old back (check Network for the file names and the `?v=` parameter).
3. Run `git diff --stat` and confirm only back images, their derived files, their references and the new tool changed. No front image, hero, scene or other file may have changed.
4. Report in 10 lines or fewer: the mapping table result (replaced, unmatched files, products left unchanged), images that need a re-export and why, derived files regenerated, whether a 360/3D viewer was found and updated, and anything uncertain. Then stop.
