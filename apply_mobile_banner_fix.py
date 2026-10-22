# -*- coding: utf-8 -*-
with open('Magic Meals – Real Indian meals in 5 minutes.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update picture srcset to use magic_hero_mobile_perfect.jpg
old_picture = '<source media="(max-width: 768px)" srcset="magic_hero_warm_mobile_grounded.jpg">'
new_picture = '<source media="(max-width: 768px)" srcset="magic_hero_mobile_perfect.jpg">'

assert old_picture in content, "old_picture not found"
content = content.replace(old_picture, new_picture, 1)

# 2. Update CSS for mobile hero banner card and image
old_css = """    @media (max-width: 768px) {
      .hero-banner-image {
        max-height: none;
        height: auto;
        width: 100%;
        object-fit: contain;
      }
    }"""

new_css = """    @media (max-width: 768px) {
      .hero-banner-section {
        margin-bottom: 16px;
      }
      .hero-banner-card {
        max-height: none;
        height: auto;
      }
      .hero-banner-image {
        max-height: none;
        height: auto;
        width: 100%;
        object-fit: contain;
        display: block;
      }
    }"""

assert old_css in content, "old_css not found"
content = content.replace(old_css, new_css, 1)

with open('Magic Meals – Real Indian meals in 5 minutes.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated mobile banner image and CSS!")
