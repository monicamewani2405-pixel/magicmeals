# -*- coding: utf-8 -*-
import sys
import re

with open('Magic Meals – Real Indian meals in 5 minutes.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update html & body overflow-x to hidden so 100vw doesn't cause any scrollbars
content = content.replace('html { height: 100%; scroll-behavior: smooth; }', 'html { height: 100%; scroll-behavior: smooth; overflow-x: hidden; }')
content = content.replace('body {\n      margin: 0;', 'body {\n      margin: 0;\n      overflow-x: hidden;')

# 2. Add Hamburger Button, Desktop Categories Bar, Mobile Drawer, and Video Reels CSS
custom_css = """
    /* Mobile Burger Button */
    .hamburger-btn {
      display: none;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: var(--card);
      border: 1.5px solid var(--line);
      color: var(--ink);
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .hamburger-btn:hover {
      background: var(--saffron-light);
      border-color: var(--saffron);
      color: var(--saffron);
      transform: translateY(-1px);
    }

    /* Desktop Top Navigation Categories Bar */
    .header-desktop-categories {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 2;
      justify-content: center;
      overflow-x: auto;
      scrollbar-width: none;
      padding: 0 8px;
    }
    .header-desktop-categories::-webkit-scrollbar { display: none; }
    .header-cat-link {
      padding: 7px 14px;
      font-size: 13.5px;
      font-weight: 600;
      border-radius: var(--radius-full);
      color: var(--ink-soft);
      transition: all 0.2s ease;
      cursor: pointer;
      text-decoration: none;
      white-space: nowrap;
      border: 1px solid transparent;
      user-select: none;
    }
    .header-cat-link:hover {
      color: var(--saffron);
      background: var(--saffron-light);
    }
    .header-cat-link.active {
      color: #FFFFFF;
      background: var(--saffron);
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(216, 67, 21, 0.28);
    }

    /* Mobile Drawer Backdrop & Drawer */
    .mobile-drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 100;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    .mobile-drawer-backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }
    .mobile-drawer {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 320px;
      max-width: 86vw;
      background: #FFFFFF;
      z-index: 105;
      transform: translateX(-100%);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 8px 0 32px rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
    }
    .mobile-drawer.open {
      transform: translateX(0);
    }
    .mobile-drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--line);
      background: var(--bg);
    }
    .drawer-logo-img {
      height: 38px;
      width: auto;
      cursor: pointer;
    }
    .drawer-close-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--line-subtle);
      border: none;
      display: grid;
      place-items: center;
      font-size: 16px;
      font-weight: 700;
      color: var(--ink);
      cursor: pointer;
      transition: background 0.2s, transform 0.15s;
    }
    .drawer-close-btn:hover {
      background: var(--saffron-light);
      color: var(--saffron);
      transform: rotate(90deg);
    }
    .mobile-drawer-body {
      padding: 18px 16px 32px;
      overflow-y: auto;
      flex: 1;
    }
    .drawer-cat-heading {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--mute);
      margin-bottom: 10px;
      padding-left: 4px;
    }
    .mobile-categories-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .drawer-cat-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 12px;
      background: var(--bg);
      border: 1px solid var(--line);
      color: var(--ink);
      font-size: 14px;
      font-weight: 600;
      text-align: left;
      cursor: pointer;
      transition: all 0.2s ease;
      width: 100%;
    }
    .drawer-cat-btn:hover, .drawer-cat-btn.active {
      background: var(--saffron-light);
      border-color: var(--saffron);
      color: var(--saffron-hover);
    }
    .drawer-cat-btn.active {
      font-weight: 700;
    }
    .drawer-cat-btn .drawer-cat-icon {
      font-size: 18px;
    }
    .drawer-cat-btn .drawer-cat-name {
      flex: 1;
    }
    .drawer-cat-btn .drawer-cat-badge {
      font-size: 12px;
      color: var(--mute);
      font-weight: 500;
    }
    .drawer-cat-combos {
      background: #FFF3E0;
      border-color: #FFE0B2;
      color: #BF360C;
    }
    .drawer-save-tag {
      font-size: 10px;
      font-weight: 800;
      background: #D84315;
      color: #FFFFFF;
      padding: 2px 7px;
      border-radius: 999px;
    }
    .drawer-divider {
      height: 1px;
      background: var(--line);
      margin: 18px 0;
    }
    .drawer-quick-nav {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .drawer-nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      font-size: 14px;
      font-weight: 600;
      color: var(--ink-soft);
      border-radius: 8px;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.15s, color 0.15s;
    }
    .drawer-nav-item:hover {
      background: var(--line-subtle);
      color: var(--saffron);
    }
    .drawer-wa-item {
      color: #128C7E;
    }
    .drawer-cert-footer {
      margin-top: 22px;
      padding: 10px 12px;
      border-radius: 10px;
      background: var(--herb-light);
      color: var(--herb-mid);
      font-size: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .veg-badge-indicator {
      width: 13px;
      height: 13px;
      border: 1.5px solid var(--herb-mid);
      border-radius: 3px;
      display: inline-grid;
      place-items: center;
    }
    .veg-badge-indicator::after {
      content: '';
      width: 5px;
      height: 5px;
      background: var(--herb-mid);
      border-radius: 50%;
    }

    /* Loved by Our Customers Video Reels Section */
    .customers-loved-section {
      margin: 44px 0 28px;
      position: relative;
    }
    .customers-loved-section .section-header {
      margin-bottom: 22px;
      text-align: center;
      display: block;
    }
    .customers-loved-section .section-header h2 {
      font-size: 30px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .customers-loved-section .section-header p {
      color: var(--mute);
      font-size: 15px;
      margin-top: 6px;
    }
    .reel-wrapper {
      position: relative;
      width: 100%;
    }
    .reel-container {
      display: flex !important;
      flex-wrap: nowrap !important;
      gap: 20px;
      overflow-x: auto !important;
      overflow-y: hidden;
      padding: 10px 4px 20px;
      scroll-behavior: smooth;
      width: 100%;
      box-sizing: border-box;
      scrollbar-width: thin;
      scrollbar-color: #D84315 #EFE8DE;
    }
    .reel-container::-webkit-scrollbar {
      height: 7px;
    }
    .reel-container::-webkit-scrollbar-track {
      background: var(--line-subtle);
      border-radius: 20px;
    }
    .reel-container::-webkit-scrollbar-thumb {
      background: #D84315;
      border-radius: 20px;
    }
    .reel-card {
      flex: 0 0 280px !important;
      width: 280px !important;
      min-width: 280px !important;
      max-width: 280px !important;
      aspect-ratio: 9/16;
      border-radius: 16px;
      overflow: hidden;
      background: #000000;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
      position: relative;
    }
    .reel-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
    }
    .reel-video {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }
    .reel-wrapper .scroll-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 46px;
      height: 46px;
      border: none;
      border-radius: 50%;
      background: #FFFFFF;
      color: var(--ink);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);
      cursor: pointer;
      z-index: 25;
      font-size: 20px;
      line-height: 46px;
      text-align: center;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .reel-wrapper .scroll-btn:hover {
      background: var(--saffron);
      color: #FFFFFF;
      box-shadow: 0 6px 18px rgba(216, 67, 21, 0.35);
      transform: translateY(-50%) scale(1.08);
    }
    .reel-wrapper .scroll-left {
      left: -18px;
    }
    .reel-wrapper .scroll-right {
      right: -18px;
    }
    @media (max-width: 992px) {
      .header-desktop-categories {
        display: none !important;
      }
      .hamburger-btn {
        display: flex !important;
      }
      .header-left-nav {
        display: none !important;
      }
    }
    @media (max-width: 768px) {
      .reel-wrapper .scroll-btn {
        display: none;
      }
      .reel-card {
        flex: 0 0 240px !important;
        width: 240px !important;
        min-width: 240px !important;
      }
      .reel-container {
        padding: 10px 4px 16px;
        gap: 14px;
      }
    }
"""

content = content.replace('/* Header matching User\'s Reference Layout', custom_css + '\n    /* Header matching User\'s Reference Layout')

# 3. Update the Top Announcement Bar HTML to be clean and uniform
old_ticker_pattern = re.compile(r'<div class="ticker-bar">.*?</div>', re.DOTALL)
new_ticker = """<div class="ticker-bar">
    <span>✈️ Travel-Friendly: Ready in 5 Mins</span>
    <span class="ticker-dot">•</span>
    <span>⚡ Free Express Delivery on Orders Above ₹499</span>
    <span class="ticker-dot">•</span>
    <span>📦 Cash On Delivery (COD) Available</span>
  </div>"""
content = old_ticker_pattern.sub(new_ticker, content, count=1)

# 4. Update Header HTML with Hamburger Button and Desktop Categories Navigation
old_header_pattern = re.compile(r'<header>.*?</header>', re.DOTALL)
new_header = """<header>
    <div class="wrap header-inner">
      <!-- Mobile Hamburger Button (Mobile / Tablet only) -->
      <button class="hamburger-btn" id="mobileMenuOpenBtn" aria-label="Open Meal Categories Menu" title="Browse Categories">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>

      <!-- Center Logo: Original Logo Recolored to Saffron Palette -->
      <div class="header-center-logo" data-go="home" title="Magic Meals Home">
        <img src="magic_meals_logo_saffron.png" alt="Magic Meals" class="original-logo-img">
      </div>

      <!-- Desktop Categories Navigation Bar (Desktop only) -->
      <nav class="header-desktop-categories" aria-label="Meal Categories">
        <a class="header-cat-link active" data-cat="All">All</a>
        <a class="header-cat-link" data-cat="Rice">Rice</a>
        <a class="header-cat-link" data-cat="Meals">Meals</a>
        <a class="header-cat-link" data-cat="Breakfast">Breakfast</a>
        <a class="header-cat-link" data-cat="Dals">Dals</a>
        <a class="header-cat-link" data-cat="Soups">Soups</a>
        <a class="header-cat-link" data-cat="Desserts">Desserts</a>
        <a class="header-cat-link" data-cat="Breads">Breads</a>
        <a class="header-cat-link" data-cat="Combos">Combos</a>
      </nav>

      <!-- Right Action Controls (Jain filter, Search, Travel Airplane, Cart) -->
      <div class="header-right-actions">
        <button class="jain-toggle" id="jainToggleBtn" aria-pressed="false" title="Filter 100% Jain-friendly meals">
          <span class="veg-icon"></span>
          <span>Jain</span>
        </button>

        <button class="icon-btn" data-go="shop" aria-label="Search all meals" title="Search Meals">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </button>

        <!-- Travel Friendly Airplane Icon -->
        <button class="icon-btn travel-plane-btn" data-go="shop" data-cat="Combos" aria-label="Travel Meals" title="Travel Friendly Packs">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
        </button>

        <!-- Bag / Cart Icon -->
        <button class="icon-btn" id="cartOpenBtn" aria-label="View Shopping Cart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <span class="cart-badge" id="cartBadgeCount">0</span>
        </button>
      </div>
    </div>
  </header>"""
content = old_header_pattern.sub(new_header, content, count=1)

# 5. Insert Mobile Drawer Backdrop & Drawer markup right after </header>
mobile_drawer_markup = """
  <!-- Mobile Categories Drawer & Backdrop -->
  <div id="mobileDrawerBackdrop" class="mobile-drawer-backdrop" aria-hidden="true"></div>
  <aside id="mobileDrawer" class="mobile-drawer" role="dialog" aria-modal="true" aria-label="Categories Menu">
    <div class="mobile-drawer-header">
      <div class="drawer-logo" data-go="home">
        <img src="magic_meals_logo_saffron.png" alt="Magic Meals" class="drawer-logo-img">
      </div>
      <button id="mobileMenuCloseBtn" class="drawer-close-btn" aria-label="Close menu">✕</button>
    </div>
    
    <div class="mobile-drawer-body">
      <div class="drawer-cat-heading">MEAL CATEGORIES</div>
      <div class="mobile-categories-list">
        <button class="drawer-cat-btn" data-cat="All">
          <span class="drawer-cat-icon">🍛</span>
          <span class="drawer-cat-name">All Dishes</span>
          <span class="drawer-cat-badge">24</span>
        </button>
        <button class="drawer-cat-btn" data-cat="Rice">
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
          <span class="drawer-cat-icon">✈️</span>
          <span class="drawer-cat-name">Travel & Value Combos</span>
          <span class="drawer-save-tag">SAVE 15%</span>
        </button>
      </div>

      <div class="drawer-divider"></div>

      <div class="drawer-cat-heading">QUICK LINKS</div>
      <div class="drawer-quick-nav">
        <a data-go="home" class="drawer-nav-item">🏠 Home</a>
        <a data-go="shop" class="drawer-nav-item">🛒 Browse Catalog</a>
        <a data-go="about" class="drawer-nav-item">🌱 Freeze-Drying Benefits</a>
        <a data-go="faqs" class="drawer-nav-item">❓ FAQs & Flight Rules</a>
        <a href="https://wa.me/919820000000" target="_blank" class="drawer-nav-item drawer-wa-item">💬 WhatsApp Live Support</a>
      </div>

      <div class="drawer-cert-footer">
        <span class="veg-badge-indicator"></span>
        <span>100% Pure Vegetarian & Jain Certified</span>
      </div>
    </div>
  </aside>
"""
content = content.replace('</header>', '</header>\n' + mobile_drawer_markup)

# 6. Update Hero Travel Banner to use <picture> with Desktop & Mobile authentic Dal Khichdi banners
old_banner_code = """<section class="travel-banner-section">
          <div class="travel-banner-container" data-go="shop" data-cat="Combos" style="cursor: pointer;" title="Explore Travel Friendly Packs">
            <img src="banner_travel_opt.jpg" alt="Magic Meals Travel Friendly Ready to Eat" class="travel-banner-bg" onerror="this.src='https://magicmeals.shop/wp-content/uploads/2026/05/WhatsApp-Image-2026-08-20-at-6.42.46-PM.jpeg'">

            <!-- Slider Dots in Bottom Right (matching reference image) -->
            <div class="banner-pagination-dots">
              <div class="banner-dot active" title="Travel Friendly Banner"></div>
              <div class="banner-dot" title="5 Min Quick Meals"></div>
              <div class="banner-dot" title="Pure Satvik & Jain"></div>
            </div>
          </div>
        </section>"""

new_banner_code = """<section class="travel-banner-section">
          <div class="travel-banner-container" data-go="shop" data-cat="Combos" style="cursor: pointer;" title="Explore Travel Friendly Packs">
            <picture>
              <source media="(max-width: 768px)" srcset="magic_travel_banner_mobile.jpg">
              <img src="magic_travel_banner_desktop.jpg" alt="Magic Meals Travel Friendly Indian Ready to Eat Meals" class="travel-banner-bg">
            </picture>

            <!-- Slider Dots in Bottom Right (matching reference image) -->
            <div class="banner-pagination-dots">
              <div class="banner-dot active" title="Travel Friendly Banner"></div>
              <div class="banner-dot" title="5 Min Quick Meals"></div>
              <div class="banner-dot" title="Pure Satvik & Jain"></div>
            </div>
          </div>
        </section>"""
content = content.replace(old_banner_code, new_banner_code)

# 7. Add "Loved by Our Customers" YouTube Shorts section right before Customer Testimonials
reels_section_html = """
        <!-- Loved by Our Customers (Customer Video Reviews & Reels) -->
        <section class="customers-loved-section">
          <div class="section-header">
            <h2>Loved by Our Customers</h2>
            <p>Watch real travelers, students & busy foodies share their Magic Meals experience</p>
          </div>

          <div class="reel-wrapper">
            <button class="scroll-btn scroll-left" id="reelScrollLeft" aria-label="Previous customer video">&#10094;</button>
            <button class="scroll-btn scroll-right" id="reelScrollRight" aria-label="Next customer video">&#10095;</button>

            <div class="reel-container" id="youtubeReelsContainer">
              <div class="reel-card">
                <iframe class="reel-video"
                  src="https://www.youtube.com/embed/stLqnv38SHk?rel=0"
                  title="Magic Meals Customer Review 1"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen>
                </iframe>
              </div>

              <div class="reel-card">
                <iframe class="reel-video"
                  src="https://www.youtube.com/embed/FQu7hM1dFAA?rel=0"
                  title="Magic Meals Customer Review 2"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen>
                </iframe>
              </div>

              <div class="reel-card">
                <iframe class="reel-video"
                  src="https://www.youtube.com/embed/248l3FWQ5ls?rel=0"
                  title="Magic Meals Customer Review 3"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen>
                </iframe>
              </div>

              <div class="reel-card">
                <iframe class="reel-video"
                  src="https://www.youtube.com/embed/hveTAhjX3zk?rel=0"
                  title="Magic Meals Customer Review 4"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen>
                </iframe>
              </div>

              <div class="reel-card">
                <iframe class="reel-video"
                  src="https://www.youtube.com/embed/D8cyKsu4w84?rel=0"
                  title="Magic Meals Customer Review 5"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen>
                </iframe>
              </div>
            </div>
          </div>
        </section>
"""

content = content.replace('<!-- Customer Testimonials -->', reels_section_html + '\n        <!-- Customer Testimonials -->')

# 8. Update renderApp() to synchronize active classes on desktop categories and drawer categories
old_render_app_nav = """      // Update Nav States
      document.querySelectorAll('.header-left-nav a').forEach(a => {
        const go = a.dataset.go;
        const cat = a.dataset.cat;
        if (State.view === 'home' && go === 'home') a.classList.add('active');
        else if (State.view === 'shop' && cat && State.selectedCategory === cat) a.classList.add('active');
        else if (State.view === 'shop' && !cat && go === 'shop') a.classList.add('active');
        else a.classList.remove('active');
      });"""

new_render_app_nav = """      // Update Desktop Categories Top Bar States
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

content = content.replace(old_render_app_nav, new_render_app_nav)

# 9. Add mobile drawer and reel scroll event listeners
js_additions = """
    function openMobileDrawer() {
      const drawer = document.getElementById('mobileDrawer');
      const backdrop = document.getElementById('mobileDrawerBackdrop');
      if (drawer && backdrop) {
        drawer.classList.add('open');
        backdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeMobileDrawer() {
      const drawer = document.getElementById('mobileDrawer');
      const backdrop = document.getElementById('mobileDrawerBackdrop');
      if (drawer && backdrop) {
        drawer.classList.remove('open');
        backdrop.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
"""

content = content.replace('function closeCart() {', js_additions + '\n    function closeCart() {')

# In click listener, add handlers for burger open, burger close, drawer backdrop, reel scrolls
click_listener_additions = """
      if (target.id === 'mobileMenuOpenBtn') {
        openMobileDrawer();
        return;
      }
      if (target.id === 'mobileMenuCloseBtn' || target.id === 'mobileDrawerBackdrop') {
        closeMobileDrawer();
        return;
      }
      if (target.closest('#mobileDrawer') && (target.dataset.cat || target.dataset.go)) {
        closeMobileDrawer();
      }

      if (target.id === 'reelScrollLeft') {
        const reels = document.getElementById('youtubeReelsContainer');
        if (reels) reels.scrollBy({ left: -300, behavior: 'smooth' });
        return;
      }
      if (target.id === 'reelScrollRight') {
        const reels = document.getElementById('youtubeReelsContainer');
        if (reels) reels.scrollBy({ left: 300, behavior: 'smooth' });
        return;
      }
"""

content = content.replace("document.addEventListener('click', e => {\n      const target = e.target.closest('button, a, [data-go], [data-p], [data-cat]');", "document.addEventListener('click', e => {\n      const target = e.target.closest('button, a, [data-go], [data-p], [data-cat], #mobileDrawerBackdrop');")
content = content.replace("if (target.dataset.p && !target.closest('.qty-stepper, .btn-add')) {", click_listener_additions + "\n      if (target.dataset.p && !target.closest('.qty-stepper, .btn-add')) {")

# Also close mobile drawer on Escape key
content = content.replace("if (e.key === 'Escape') closeCart();", "if (e.key === 'Escape') { closeCart(); closeMobileDrawer(); }")

# Backdrop click listener
content = content.replace("$('#drawerOverlay').addEventListener('click', closeCart);", "$('#drawerOverlay').addEventListener('click', closeCart);\n    const mBackdrop = document.getElementById('mobileDrawerBackdrop');\n    if (mBackdrop) mBackdrop.addEventListener('click', closeMobileDrawer);")

with open('Magic Meals – Real Indian meals in 5 minutes.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Update successful! New file size:', len(content))
