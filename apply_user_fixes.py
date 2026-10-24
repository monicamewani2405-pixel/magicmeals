# -*- coding: utf-8 -*-
import re

files_to_update = [
    'Magic Meals – Real Indian meals in 5 minutes.html',
    'index.html'
]

for file_path in files_to_update:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. FIX PROMO ARROWS ON BOTH SIDES: Use clean SVG chevrons instead of plain text unicode
    old_promo_markup = re.compile(
        r'<button class="promo-nav-btn promo-prev" id="promoPrevBtn"[^>]*>.*?</button>',
        re.DOTALL
    )
    new_promo_prev = '<button class="promo-nav-btn promo-prev" id="promoPrevBtn" aria-label="Previous promo"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></button>'
    content = old_promo_markup.sub(new_promo_prev, content, count=1)

    old_promo_next_markup = re.compile(
        r'<button class="promo-nav-btn promo-next" id="promoNextBtn"[^>]*>.*?</button>',
        re.DOTALL
    )
    new_promo_next = '<button class="promo-nav-btn promo-next" id="promoNextBtn" aria-label="Next promo"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>'
    content = old_promo_next_markup.sub(new_promo_next, content, count=1)

    # Update promo arrow CSS for pixel-perfect centering and sleek hover
    old_arrow_css = re.compile(
        r'\.promo-nav-btn\s*\{.*?\.promo-next\s*\{\s*right:\s*10px;\s*\}',
        re.DOTALL
    )
    new_arrow_css = """.promo-nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.16);
      color: #FFFFFF;
      border: none;
      padding: 0;
      cursor: pointer;
      z-index: 5;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    }
    .promo-nav-btn:hover {
      background: rgba(255, 255, 255, 0.32);
      transform: translateY(-50%) scale(1.08);
    }
    .promo-nav-btn svg {
      display: block;
      width: 13px;
      height: 13px;
    }
    .promo-prev { left: 10px; }
    .promo-next { right: 10px; }"""
    content = old_arrow_css.sub(new_arrow_css, content, count=1)

    # 2. REMOVE THE WHOLE LINE IN SCREENSHOT 2 (Trust Highlights Strip under hero banner)
    old_trust_strip = re.compile(
        r'<!-- Trust Highlights Strip -->\s*<div class="trust-strip">.*?</div>\s*</div>',
        re.DOTALL
    )
    content = old_trust_strip.sub('', content, count=1)

    # 3. RENAME ONE OF THE "LOVED BY" SECTIONS:
    # Rename Section 1 (Video Reels) from "Loved by Our Customers" to "Customer Stories in Action"
    old_reels_title = '<h2>Loved by Our Customers</h2>'
    new_reels_title = '<h2>Customer Stories in Action</h2>'
    if old_reels_title in content:
        content = content.replace(old_reels_title, new_reels_title, 1)

    # 4. REDESIGN "The Magic of Freeze-Drying" to look natural, appetizing, and seamless
    old_edu_section = re.compile(
        r'<section class="edu-section">.*?</section>',
        re.DOTALL
    )
    new_edu_section = """<!-- THE MAGIC OF FREEZE-DRYING (Warm Natural Culinary Storytelling) -->
        <section class="edu-section-natural">
          <div class="edu-header">
            <span class="edu-badge">✨ The Freeze-Drying Difference</span>
            <h2>Why Magic Meals Tastes Like Mom's Cooking</h2>
            <p>Unlike ordinary canned or retort meals that are boiled to mush, our gentle sub-zero freeze-drying locks in fresh aroma, texture, and nutrition naturally.</p>
          </div>
          <div class="edu-grid-natural">
            <div class="edu-item">
              <div class="edu-icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  <circle cx="12" cy="12" r="9"/>
                </svg>
              </div>
              <div class="edu-content">
                <h4>98% Nutrient Retention</h4>
                <p>Gentle vacuum sublimation removes only moisture, keeping vitamins, wholesome fibers, and authentic Indian spices intact.</p>
              </div>
            </div>

            <div class="edu-item">
              <div class="edu-icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <div class="edu-content">
                <h4>Zero Chemical Preservatives</h4>
                <p>With 0% residual water, microorganisms cannot grow naturally. 100% clean ingredients — no MSG, no artificial colors, no additives.</p>
              </div>
            </div>

            <div class="edu-item">
              <div class="edu-icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"/>
                </svg>
              </div>
              <div class="edu-content">
                <h4>Ultra-Light & Hand Luggage Friendly</h4>
                <p>An 80g featherweight pack blooms into a rich 260g hearty meal in minutes. Perfect for international travel, flights, and quick work lunches.</p>
              </div>
            </div>
          </div>
        </section>"""

    content = old_edu_section.sub(new_edu_section, content, count=1)

    # Add CSS for .edu-section-natural
    old_edu_css = re.compile(
        r'\.edu-section\s*\{.*?\.edu-grid\s*\{\s*grid-template-columns:\s*repeat\(3,\s*1fr\);\s*\}',
        re.DOTALL
    )
    new_edu_css = """.edu-section-natural {
      background: #FBF8F3;
      border: 1px solid #EFE6D8;
      border-radius: 16px;
      padding: 32px 24px;
      margin: 36px 0;
      position: relative;
    }
    .edu-header {
      text-align: center;
      max-width: 640px;
      margin: 0 auto 28px;
    }
    .edu-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--saffron);
      background: rgba(224, 90, 43, 0.08);
      padding: 4px 12px;
      border-radius: 20px;
      margin-bottom: 8px;
    }
    .edu-header h2 {
      font-size: 22px;
      color: var(--ink);
      margin: 6px 0 10px;
      font-weight: 700;
    }
    .edu-header p {
      font-size: 14px;
      color: var(--mute);
      line-height: 1.55;
      margin: 0;
    }
    .edu-grid-natural {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }
    @media (min-width: 769px) {
      .edu-grid-natural {
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
      }
    }
    .edu-item {
      display: flex;
      gap: 14px;
      align-items: flex-start;
      background: #FFFFFF;
      border: 1px solid #EAE1D3;
      border-radius: 12px;
      padding: 18px 16px;
      box-shadow: 0 1px 4px rgba(45, 34, 27, 0.04);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .edu-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(45, 34, 27, 0.08);
    }
    .edu-icon-wrap {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      background: rgba(224, 90, 43, 0.1);
      color: var(--saffron);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .edu-content h4 {
      font-size: 15px;
      font-weight: 700;
      color: var(--ink);
      margin: 0 0 6px;
    }
    .edu-content p {
      font-size: 13px;
      color: var(--mute);
      line-height: 1.5;
      margin: 0;
    }"""
    content = old_edu_css.sub(new_edu_css, content, count=1)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Successfully updated {file_path}")
