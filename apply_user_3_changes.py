# -*- coding: utf-8 -*-
import sys
import re

with open('Magic Meals – Real Indian meals in 5 minutes.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the text overlay card from the hero banner so the banner image is completely visible
old_hero_banner = re.compile(
    r'<section class="hero-banner-section">.*?</section>',
    re.DOTALL
)

new_hero_banner = """<!-- HERO BANNER (Unobstructed Warm Gourmet Food Imagery) -->
        <section class="hero-banner-section">
          <div class="hero-banner-card" data-go="shop" style="cursor: pointer;" title="Explore Magic Meals Menu">
            <picture>
              <source media="(max-width: 768px)" srcset="magic_hero_warm_mobile_grounded.jpg">
              <img src="magic_hero_warm_desktop_clean.jpg" alt="Magic Meals Real Indian Meals in 5 Minutes" class="hero-banner-image">
            </picture>
          </div>
        </section>"""

content = old_hero_banner.sub(new_hero_banner, content, count=1)

# Update CSS for .hero-banner-card and .hero-banner-image for clean display without overlay
old_hero_css = re.compile(
    r'/\* =========================================\s*HERO BANNER \(Warm, Appetizing & Cozy Vibe\)\s*========================================= \*/.*?@media \(max-width: 900px\) \{.*?\.hero-headline \{.*?\}\s*\}',
    re.DOTALL
)

new_hero_css = """/* =========================================
       HERO BANNER (Clean, Unobstructed Image Display)
       ========================================= */
    .hero-banner-section {
      width: 100vw;
      position: relative;
      left: 50%;
      right: 50%;
      margin-left: -50vw;
      margin-right: -50vw;
      margin-top: 0;
      margin-bottom: 24px;
      overflow: hidden;
      background: #F8F4EE;
    }
    .hero-banner-card {
      position: relative;
      width: 100%;
      max-height: 520px;
      overflow: hidden;
      display: block;
      line-height: 0;
    }
    .hero-banner-card picture {
      display: block;
      width: 100%;
      line-height: 0;
    }
    .hero-banner-image {
      width: 100%;
      height: auto;
      max-height: 520px;
      object-fit: cover;
      object-position: center;
      display: block;
      margin: 0 auto;
    }
    @media (max-width: 768px) {
      .hero-banner-image {
        max-height: none;
        height: auto;
        width: 100%;
        object-fit: contain;
      }
    }"""

content = old_hero_css.sub(new_hero_css, content, count=1)

# 2. Update WhatsApp Floating Button with Official WhatsApp Brand Logo
# Replace with authentic SVG showing WhatsApp green bubble + white phone receiver
old_wa_markup = re.compile(
    r'<a href="https://wa\.me/.*?" target="_blank".*?class="whatsapp-float-btn".*?</a>',
    re.DOTALL
)

new_wa_markup = """<a href="https://wa.me/919820000000?text=Hi%20Magic%20Meals,%20I%20would%20like%20to%20order%20ready-to-eat%20meals!" target="_blank" rel="noopener noreferrer" class="whatsapp-float-btn" title="Chat with Magic Meals on WhatsApp" aria-label="Official WhatsApp Support">
    <svg viewBox="0 0 32 32" width="34" height="34" fill="none">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M16 2C8.268 2 2 8.268 2 16c0 2.56.687 4.962 1.884 7.034L2 30l7.158-1.852A13.935 13.935 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2z" fill="#25D366"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M24.893 21.053c-.365 1.026-1.815 1.88-2.52 1.998-.679.113-1.564.161-2.523-.146-.613-.196-1.402-.458-2.42-.9-4.298-1.866-7.098-6.236-7.313-6.52-.214-.286-1.74-2.316-1.74-4.417 0-2.102 1.099-3.136 1.49-3.565.393-.429.856-.536 1.142-.536.286 0 .571.003.821.015.263.013.615-.1.963.736.365.88 1.25 3.048 1.357 3.267.108.219.18.475.036.76-.143.287-.215.466-.429.716-.214.25-.45.558-.643.75-.214.214-.438.446-.188.874.25.428 1.11 1.83 2.38 2.96 1.633 1.455 3.01 1.905 3.438 2.119.429.214.679.179.929-.107.25-.286 1.072-1.25 1.357-1.678.286-.429.572-.357.965-.214.393.143 2.5 1.178 2.929 1.393.429.214.714.321.821.5.108.179.108 1.036-.257 2.062z" fill="#FFFFFF"/>
    </svg>
  </a>"""

content = old_wa_markup.sub(new_wa_markup, content, count=1)

# Ensure WhatsApp button CSS is styled with proper shadow and hover
old_wa_css = re.compile(
    r'\.whatsapp-float-btn\s*\{.*?@media \(max-width: 768px\) \{\s*\.whatsapp-float-btn\s*\{.*?\}\s*\}',
    re.DOTALL
)

new_wa_css = """.whatsapp-float-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 95;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: #25D366;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(37, 211, 102, 0.45);
      transition: transform 0.22s ease, box-shadow 0.22s ease;
      cursor: pointer;
      text-decoration: none;
    }
    .whatsapp-float-btn:hover {
      transform: scale(1.12);
      box-shadow: 0 12px 28px rgba(37, 211, 102, 0.65);
    }
    @media (max-width: 768px) {
      .whatsapp-float-btn {
        bottom: 84px;
        right: 18px;
        width: 52px;
        height: 52px;
      }
    }"""

content = old_wa_css.sub(new_wa_css, content, count=1)

# 3. Put "Rice" 1st and "All" at the end on the header categories and drawer
# Desktop Header Nav: Rice, Meals, Breakfast, Dals, Soups, Desserts, Breads, Combos, All
old_desktop_cat_nav = re.compile(
    r'<nav class="header-desktop-categories".*?</nav>',
    re.DOTALL
)

new_desktop_cat_nav = """<nav class="header-desktop-categories" aria-label="Meal Categories">
        <a class="header-cat-link active" data-cat="Rice">Rice</a>
        <a class="header-cat-link" data-cat="Meals">Meals</a>
        <a class="header-cat-link" data-cat="Breakfast">Breakfast</a>
        <a class="header-cat-link" data-cat="Dals">Dals</a>
        <a class="header-cat-link" data-cat="Soups">Soups</a>
        <a class="header-cat-link" data-cat="Desserts">Desserts</a>
        <a class="header-cat-link" data-cat="Breads">Breads</a>
        <a class="header-cat-link" data-cat="Combos">Combos</a>
        <a class="header-cat-link" data-cat="All">All</a>
      </nav>"""

content = old_desktop_cat_nav.sub(new_desktop_cat_nav, content, count=1)

# Mobile Drawer Categories: Put Rice first, All at the end
old_drawer_cats = re.compile(
    r'<div class="mobile-categories-list">.*?</div>\s*<div class="drawer-divider">',
    re.DOTALL
)

new_drawer_cats = """<div class="mobile-categories-list">
        <button class="drawer-cat-btn active" data-cat="Rice">
          <span class="drawer-cat-icon">🍚</span>
          <span class="drawer-cat-name">Rice Meals</span>
        </button>
        <button class="drawer-cat-btn" data-cat="Meals">
          <span class="drawer-cat-icon">🍲</span>
          <span class="drawer-cat-name">Curries & Meals</span>
        </button>
        <button class="drawer-cat-btn" data-cat="Breakfast">
          <span class="drawer-cat-icon">🥞</span>
          <span class="drawer-cat-name">Breakfast & Poha</span>
        </button>
        <button class="drawer-cat-btn" data-cat="Dals">
          <span class="drawer-cat-icon">🥣</span>
          <span class="drawer-cat-name">Dals & Khichdi</span>
        </button>
        <button class="drawer-cat-btn" data-cat="Soups">
          <span class="drawer-cat-icon">🍜</span>
          <span class="drawer-cat-name">Hot Soups</span>
        </button>
        <button class="drawer-cat-btn" data-cat="Desserts">
          <span class="drawer-cat-icon">🍨</span>
          <span class="drawer-cat-name">Desserts & Sheera</span>
        </button>
        <button class="drawer-cat-btn" data-cat="Breads">
          <span class="drawer-cat-icon">🫓</span>
          <span class="drawer-cat-name">Breads & Theplas</span>
        </button>
        <button class="drawer-cat-btn drawer-cat-combos" data-cat="Combos">
          <span class="drawer-cat-icon">📦</span>
          <span class="drawer-cat-name">Value Combos</span>
          <span class="drawer-save-tag">SAVE 15%</span>
        </button>
        <button class="drawer-cat-btn" data-cat="All">
          <span class="drawer-cat-icon">🍛</span>
          <span class="drawer-cat-name">All Dishes</span>
          <span class="drawer-cat-badge">24</span>
        </button>
      </div>
      <div class="drawer-divider">"""

content = old_drawer_cats.sub(new_drawer_cats, content, count=1)

# Update CATEGORIES array in JS to have 'Rice' first and 'All' at the end
content = content.replace(
    "const CATEGORIES = ['All', 'Rice', 'Meals', 'Breakfast', 'Dals', 'Soups', 'Desserts', 'Breads', 'Combos'];",
    "const CATEGORIES = ['Rice', 'Meals', 'Breakfast', 'Dals', 'Soups', 'Desserts', 'Breads', 'Combos', 'All'];"
)
content = content.replace(
    "selectedCategory: 'All',",
    "selectedCategory: 'Rice',"
)

# Update renderApp nav state logic
old_nav_state_js = """      // Update Desktop Categories Top Bar States
      document.querySelectorAll('.header-cat-link').forEach(link => {
        const cat = link.dataset.cat;
        if (State.view === 'shop' && State.selectedCategory === cat) {
          link.classList.add('active');
        } else if (State.view === 'home' && cat === 'All') {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      // Update Mobile Drawer Categories States
      document.querySelectorAll('.drawer-cat-btn').forEach(btn => {
        const cat = btn.dataset.cat;
        if (State.view === 'shop' && State.selectedCategory === cat) {
          btn.classList.add('active');
        } else if (State.view === 'home' && cat === 'All') {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });"""

new_nav_state_js = """      // Update Desktop Categories Top Bar States
      document.querySelectorAll('.header-cat-link').forEach(link => {
        const cat = link.dataset.cat;
        if (State.selectedCategory === cat) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      // Update Mobile Drawer Categories States
      document.querySelectorAll('.drawer-cat-btn').forEach(btn => {
        const cat = btn.dataset.cat;
        if (State.selectedCategory === cat) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });"""

content = content.replace(old_nav_state_js, new_nav_state_js)

with open('Magic Meals – Real Indian meals in 5 minutes.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Successfully applied all 3 requested updates!')
