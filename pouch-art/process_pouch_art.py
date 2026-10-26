"""
process_pouch_art.py
Automated processing pipeline for stand-up pouch artwork photos:
a) Auto-trim transparent or near-white margins, resize both front & back to identical dimensions and aspect ratio.
b) If image has solid or near-solid background and no alpha, remove background using thresholding/floodfill.
c) Apply silhouette alpha mask so nothing outside print area shows; fade outer 2% of image edge to hide seam stretching.
d) Support neutral fallback texture with 'BACK IMAGE MISSING' if back photo is absent.
"""

import os
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

def remove_solid_background(img_rgb, tol=25):
    """
    If image has no alpha or solid/near-solid background, identify background
    color from corners and build an alpha mask.
    """
    arr = np.array(img_rgb.convert('RGB'))
    h, w, _ = arr.shape

    # Sample corners (10x10 patches)
    corners = np.concatenate([
        arr[0:10, 0:10].reshape(-1, 3),
        arr[0:10, w-10:w].reshape(-1, 3),
        arr[h-10:h, 0:10].reshape(-1, 3),
        arr[h-10:h, w-10:w].reshape(-1, 3)
    ], axis=0)
    bg_color = np.median(corners, axis=0)

    # Compute color distance from background color
    dist = np.sqrt(np.sum((arr.astype(float) - bg_color.astype(float)) ** 2, axis=2))
    
    # Also check near-white (e.g. > 245 in all channels)
    near_white = (arr[:, :, 0] > 245) & (arr[:, :, 1] > 245) & (arr[:, :, 2] > 245)
    
    is_bg = (dist < tol) | (near_white & (dist < tol * 2.0))
    
    alpha = np.where(is_bg, 0, 255).astype(np.uint8)
    
    # Use flood-fill from border to only remove external background, protecting internal light areas
    mask_inv = is_bg.astype(np.uint8)
    labeled, num_features = ndimage.label(mask_inv)
    # Background label is whatever touches the corners
    bg_labels = {labeled[0, 0], labeled[0, w-1], labeled[h-1, 0], labeled[h-1, w-1]}
    bg_mask = np.isin(labeled, list(bg_labels))
    
    clean_alpha = np.where(bg_mask, 0, 255).astype(np.uint8)
    
    # Smooth alpha slightly
    clean_alpha = ndimage.gaussian_filter(clean_alpha.astype(float), sigma=0.8)
    clean_alpha = np.clip(clean_alpha, 0, 255).astype(np.uint8)
    
    res = np.dstack([arr, clean_alpha])
    return Image.fromarray(res, mode='RGBA')

def get_pouch_bbox(im, alpha_thresh=15, white_thresh=250):
    """
    Find bounding box of pouch, ignoring transparent or near-white margin pixels.
    """
    arr = np.array(im.convert('RGBA'))
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    
    # Valid pouch pixel: alpha above threshold and not pure blown-out margin
    is_near_white = (r >= white_thresh) & (g >= white_thresh) & (b >= white_thresh)
    valid = (a >= alpha_thresh) & (~(is_near_white & (a < 100)))
    
    y_indices, x_indices = np.where(valid)
    if len(y_indices) == 0:
        return (0, 0, im.width, im.height)
    
    x0, x1 = x_indices.min(), x_indices.max()
    y0, y1 = y_indices.min(), y_indices.max()
    return (int(x0), int(y0), int(x1 + 1), int(y1 + 1))

def apply_edge_fade(im, fade_pct=0.02):
    """
    Fade outer 2% of the silhouette / image edge to hide stretching at side seams.
    Uses distance transform on alpha mask.
    """
    arr = np.array(im.convert('RGBA')).astype(float)
    alpha = arr[:, :, 3]
    
    w = im.width
    fade_px = max(2.0, w * fade_pct)
    
    # Binary mask of non-transparent pouch area
    binary_mask = (alpha > 10).astype(np.uint8)
    
    # Exact Euclidean distance from edge of silhouette
    dist_map = ndimage.distance_transform_edt(binary_mask)
    
    # Calculate fade factor: 0 at the boundary, ramping linearly to 1.0 at fade_px
    fade_factor = np.clip(dist_map / fade_px, 0.0, 1.0)
    
    # Smooth ease-in-out curve for invisible seam transition
    # Smoothstep: 3*x^2 - 2*x^3
    smooth_fade = fade_factor * fade_factor * (3.0 - 2.0 * fade_factor)
    
    arr[:, :, 3] = alpha * smooth_fade
    arr = np.clip(arr, 0, 255).astype(np.uint8)
    return Image.fromarray(arr, mode='RGBA')

def generate_missing_back_texture(width=1024, height=1600):
    """
    Generate neutral back texture with 'BACK IMAGE MISSING' label.
    """
    # Soft warm neutral pouch canvas
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw rounded pouch shape with warm neutral parchment tone
    margin_x = int(width * 0.04)
    margin_top = int(height * 0.03)
    margin_bottom = int(height * 0.03)
    
    # Neutral kraft/cream background
    pouch_box = [margin_x, margin_top, width - margin_x, height - margin_bottom]
    draw.rounded_rectangle(pouch_box, radius=int(width * 0.08), fill=(238, 233, 222, 255), outline=(190, 180, 160, 255), width=4)
    
    # Top zipper seal lines
    seal_y = int(height * 0.12)
    draw.line([(margin_x + 20, seal_y), (width - margin_x - 20, seal_y)], fill=(210, 200, 180, 255), width=3)
    draw.line([(margin_x + 20, seal_y + 12), (width - margin_x - 20, seal_y + 12)], fill=(210, 200, 180, 255), width=2)
    
    # Tear notches
    draw.polygon([(margin_x - 2, seal_y - 8), (margin_x + 16, seal_y), (margin_x - 2, seal_y + 8)], fill=(0, 0, 0, 0))
    draw.polygon([(width - margin_x + 2, seal_y - 8), (width - margin_x - 16, seal_y), (width - margin_x + 2, seal_y + 8)], fill=(0, 0, 0, 0))
    
    # Neutral info box
    center_y = int(height * 0.5)
    banner_w = int(width * 0.8)
    banner_h = int(height * 0.16)
    b_x0 = (width - banner_w) // 2
    b_y0 = center_y - banner_h // 2
    b_x1 = b_x0 + banner_w
    b_y1 = b_y0 + banner_h
    
    draw.rounded_rectangle([b_x0, b_y0, b_x1, b_y1], radius=16, fill=(245, 240, 230, 255), outline=(180, 170, 150, 255), width=2)
    
    # Draw text: 'BACK IMAGE MISSING'
    text = "BACK IMAGE MISSING"
    subtext = "Product Nutrition & Directions Placeholder"
    
    # Default Pillow font
    try:
        font_large = ImageFont.truetype("arial.ttf", 36)
        font_sub = ImageFont.truetype("arial.ttf", 20)
    except Exception:
        font_large = ImageFont.load_default()
        font_sub = ImageFont.load_default()
    
    # Draw centered text
    bbox_t = draw.textbbox((0, 0), text, font=font_large)
    tw = bbox_t[2] - bbox_t[0]
    th = bbox_t[3] - bbox_t[1]
    draw.text(((width - tw) // 2, center_y - 25), text, fill=(130, 120, 110, 255), font=font_large)
    
    bbox_s = draw.textbbox((0, 0), subtext, font=font_sub)
    sw = bbox_s[2] - bbox_s[0]
    draw.text(((width - sw) // 2, center_y + 20), subtext, fill=(160, 150, 140, 255), font=font_sub)
    
    # Apply 2% edge fade
    return apply_edge_fade(img, fade_pct=0.02)

def process_product_pouch_art(slug="rajma-masala", pouch_art_dir="pouch-art", target_w=1024, target_h=1600):
    """
    Full pipeline for loading, trimming, resizing, fading, and saving pouch textures.
    """
    front_path = os.path.join(pouch_art_dir, f"{slug}-front.png")
    back_path = os.path.join(pouch_art_dir, f"{slug}-back.png")
    
    missing_items = []
    
    print(f"--- Processing Pouch Art for slug: '{slug}' ---")
    
    # 1. Front image
    if not os.path.exists(front_path):
        raise FileNotFoundError(f"Front image missing: {front_path}")
    
    im_front = Image.open(front_path)
    print(f"Loaded front image: {im_front.size}, mode: {im_front.mode}")
    
    # Check if solid background needs removal
    if im_front.mode != 'RGBA' or np.array(im_front)[:, :, 3].min() == 255:
        print("Front image has solid background; extracting alpha...")
        im_front = remove_solid_background(im_front)
    
    # 2. Back image
    im_back = None
    if os.path.exists(back_path):
        im_back = Image.open(back_path)
        print(f"Loaded back image: {im_back.size}, mode: {im_back.mode}")
        if im_back.mode != 'RGBA' or np.array(im_back)[:, :, 3].min() == 255:
            print("Back image has solid background; extracting alpha...")
            im_back = remove_solid_background(im_back)
    else:
        print(f"WARNING: Back image missing for slug '{slug}'. Generating neutral fallback.")
        missing_items.append(f"{slug}-back.png")
    
    # Auto-trim transparent or near-white margins
    bbox_front = get_pouch_bbox(im_front)
    print(f"Front pouch bounding box: {bbox_front} (width: {bbox_front[2]-bbox_front[0]}, height: {bbox_front[3]-bbox_front[1]})")
    cropped_front = im_front.crop(bbox_front)
    
    if im_back is not None:
        bbox_back = get_pouch_bbox(im_back)
        print(f"Back pouch bounding box: {bbox_back} (width: {bbox_back[2]-bbox_back[0]}, height: {bbox_back[3]-bbox_back[1]})")
        cropped_back = im_back.crop(bbox_back)
    else:
        cropped_back = None
    
    # Determine common aspect ratio & dimensions
    # Resize both to exact same dimensions (target_w, target_h)
    print(f"Standardizing textures to {target_w}x{target_h}...")
    resized_front = cropped_front.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    if cropped_back is not None:
        resized_back = cropped_back.resize((target_w, target_h), Image.Resampling.LANCZOS)
    else:
        resized_back = generate_missing_back_texture(target_w, target_h)
    
    # Apply pouch silhouette alpha mask & 2% edge fade
    print("Applying silhouette alpha mask & outer 2% seam edge fade...")
    final_front = apply_edge_fade(resized_front, fade_pct=0.02)
    final_back = apply_edge_fade(resized_back, fade_pct=0.02)
    
    # Save processed files next to originals
    out_front_path = os.path.join(pouch_art_dir, f"{slug}-front-processed.png")
    out_back_path = os.path.join(pouch_art_dir, f"{slug}-back-processed.png")
    
    final_front.save(out_front_path, "PNG", optimize=True)
    final_back.save(out_back_path, "PNG", optimize=True)
    
    print(f"Saved processed front texture: {out_front_path} ({os.path.getsize(out_front_path)} bytes)")
    print(f"Saved processed back texture:  {out_back_path} ({os.path.getsize(out_back_path)} bytes)")
    
    # Also generate standalone missing back neutral asset for test coverage
    neutral_back_path = os.path.join(pouch_art_dir, "missing-back-neutral.png")
    neutral_back = generate_missing_back_texture(target_w, target_h)
    neutral_back.save(neutral_back_path, "PNG", optimize=True)
    print(f"Saved neutral fallback template: {neutral_back_path}")
    
    return {
        "slug": slug,
        "front_processed": out_front_path,
        "back_processed": out_back_path,
        "missing_items": missing_items,
        "dimensions": (target_w, target_h)
    }

if __name__ == "__main__":
    report = process_product_pouch_art("rajma-masala", "pouch-art", 1024, 1595)
    print("Processing Report:", report)
