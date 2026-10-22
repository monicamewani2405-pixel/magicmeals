# -*- coding: utf-8 -*-
import sys
import re

with open('Magic Meals – Real Indian meals in 5 minutes.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix sticky header by replacing overflow-x: hidden with overflow-x: clip and removing height: 100% on html
# overflow-x: hidden on html/body is the exact reason position: sticky breaks in Chromium.
content = content.replace(
    'html { height: 100%; scroll-behavior: smooth; overflow-x: hidden; }',
    'html { scroll-behavior: smooth; overflow-x: clip; }'
)
content = content.replace(
    'body {\n      margin: 0;\n      overflow-x: hidden;',
    'body {\n      margin: 0;\n      overflow-x: clip;'
)

# Ensure header has high z-index, position sticky, top 0, and backdrop-filter
old_header_css = """    /* Header matching User's Reference Layout (Nav Left | Centered Logo | Icons Right) */
    header {
      position: sticky;
      top: 0;
      z-index: 30;
      background: rgba(253, 251, 247, 0.96);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--line);
    }"""

new_header_css = """    /* Sticky Header Pinned to Top */
    header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(253, 251, 247, 0.98);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--line);
      box-shadow: 0 4px 16px rgba(43, 27, 20, 0.06);
    }"""
content = content.replace(old_header_css, new_header_css)

# 2. Remove "What are you craving?" category strip from renderHomeView()
craving_section_pattern = re.compile(
    r'\s*<!-- Category Strip -->\s*<div class="section-header">.*?</div>\s*<div class="cat-strip">.*?</div>',
    re.DOTALL
)
content = craving_section_pattern.sub('', content, count=1)

# 3. Remove "How to Prepare in 3 Easy Steps" section from renderHomeView()
prep_steps_pattern = re.compile(
    r'\s*<!-- 3-Step How It Works -->\s*<section style="margin-top:32px;">.*?<h2>How to Prepare in 3 Easy Steps</h2>.*?</section>',
    re.DOTALL
)
content = prep_steps_pattern.sub('', content, count=1)

# 4. Remove category options / chips from renderShopView() (Screenshot 3)
shop_cat_strip_pattern = re.compile(
    r'\s*<!-- Category Chips -->\s*<div class="cat-strip">.*?</div>',
    re.DOTALL
)
content = shop_cat_strip_pattern.sub('', content, count=1)

# Update Shop subtitle to show selected category if not All
content = content.replace(
    '<p>${list.length} meal options available ${State.jainOnly ? \'• Showing Jain Friendly Only\' : \'\'}</p>',
    '<p>${list.length} meal options available ${State.selectedCategory !== \'All\' ? `• Category: <b style="color:var(--saffron);">${State.selectedCategory}</b>` : \'\'} ${State.jainOnly ? \'• Jain Friendly Only\' : \'\'}</p>'
)

with open('Magic Meals – Real Indian meals in 5 minutes.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Successfully applied fixes! Updated file length:', len(content))
