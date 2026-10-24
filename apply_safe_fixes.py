# -*- coding: utf-8 -*-

for fname in ['index.html', 'Magic Meals – Real Indian meals in 5 minutes.html']:
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace promo arrow buttons with SVG chevrons
    old_btn_prev = '<button class="promo-nav-btn promo-prev" id="promoPrevBtn" aria-label="Previous promo">‹</button>'
    new_btn_prev = '<button class="promo-nav-btn promo-prev" id="promoPrevBtn" aria-label="Previous promo"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>'
    assert old_btn_prev in content, f"old_btn_prev not found in {fname}"
    content = content.replace(old_btn_prev, new_btn_prev, 1)

    old_btn_next = '<button class="promo-nav-btn promo-next" id="promoNextBtn" aria-label="Next promo">›</button>'
    new_btn_next = '<button class="promo-nav-btn promo-next" id="promoNextBtn" aria-label="Next promo"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>'
    assert old_btn_next in content, f"old_btn_next not found in {fname}"
    content = content.replace(old_btn_next, new_btn_next, 1)

    # 2. Update promo arrow CSS
    old_arrow_css = """.promo-nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: rgba(255, 255, 255, 0.18);
      color: #FFFFFF;
      border: none;
      font-size: 17px;
      line-height: 1;
      cursor: pointer;
      z-index: 5;
      transition: background 0.2s, transform 0.15s;
    }
    .promo-nav-btn:hover {
      background: rgba(255, 255, 255, 0.35);
      transform: translateY(-50%) scale(1.1);
    }
    .promo-prev { left: 10px; }
    .promo-next { right: 10px; }"""

    new_arrow_css = """.promo-nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      color: rgba(255, 255, 255, 0.85);
      border: none;
      padding: 0;
      cursor: pointer;
      z-index: 5;
      transition: all 0.2s ease;
    }
    .promo-nav-btn:hover {
      background: rgba(255, 255, 255, 0.22);
      color: #FFFFFF;
      transform: translateY(-50%) scale(1.08);
    }
    .promo-nav-btn svg {
      display: block;
      width: 12px;
      height: 12px;
    }
    .promo-prev { left: 14px; }
    .promo-next { right: 14px; }"""

    assert old_arrow_css in content, f"old_arrow_css not found in {fname}"
    content = content.replace(old_arrow_css, new_arrow_css, 1)

    # 3. Remove trust strip (the whole line in screenshot 2)
    # Find exact trust strip text
    strip_start = content.find('<!-- Trust Highlights Strip -->')
    assert strip_start != -1, f"strip_start not found in {fname}"
    strip_end = content.find('<!-- Best Sellers Grid -->', strip_start)
    assert strip_end != -1, f"strip_end not found in {fname}"
    content = content[:strip_start] + content[strip_end:]

    # 4. Rename one of the "Loved by" sections
    old_title = '<h2>Loved by Our Customers</h2>'
    new_title = '<h2>Customer Stories in Action</h2>'
    assert old_title in content, f"old_title not found in {fname}"
    content = content.replace(old_title, new_title, 1)

    with open(fname, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Cleanly updated {fname}")
