# -*- coding: utf-8 -*-
import sys

with open('Magic Meals – Real Indian meals in 5 minutes.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix .hero-banner-card picture styling to ensure 100% edge-to-edge coverage
old_hero_styles = """    .hero-banner-card {
      position: relative;
      width: 100%;
      min-height: 480px;
      max-height: 520px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
    .hero-banner-image {
      width: 100%;
      height: 520px;
      object-fit: cover;
      object-position: center left;
      display: block;
    }"""

new_hero_styles = """    .hero-banner-card {
      position: relative;
      width: 100%;
      height: 520px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
    .hero-banner-card picture {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
      z-index: 1;
    }
    .hero-banner-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center left;
      display: block;
    }"""

content = content.replace(old_hero_styles, new_hero_styles)

# Responsive update for mobile
old_mobile_hero = """    @media (max-width: 900px) {
      .hero-banner-card {
        max-height: none;
        flex-direction: column;
        justify-content: flex-start;
      }
      .hero-banner-image {
        height: auto;
        max-height: 480px;
        object-position: center;
      }
      .hero-text-overlay {
        position: relative;
        right: auto;
        max-width: 100%;
        margin: -40px 16px 20px;
        padding: 24px 20px;
        border-radius: 18px;
      }
      .hero-headline {
        font-size: 22px;
      }
    }"""

new_mobile_hero = """    @media (max-width: 900px) {
      .hero-banner-card {
        height: auto;
        min-height: 0;
        flex-direction: column;
        justify-content: flex-start;
      }
      .hero-banner-card picture {
        position: relative;
        inset: auto;
        width: 100%;
        height: auto;
      }
      .hero-banner-image {
        height: auto;
        max-height: 460px;
        object-position: center;
      }
      .hero-text-overlay {
        position: relative;
        right: auto;
        max-width: 100%;
        margin: -40px 16px 20px;
        padding: 24px 20px;
        border-radius: 20px;
      }
      .hero-headline {
        font-size: 22px;
      }
    }"""

content = content.replace(old_mobile_hero, new_mobile_hero)

with open('Magic Meals – Real Indian meals in 5 minutes.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated banner layout!')
