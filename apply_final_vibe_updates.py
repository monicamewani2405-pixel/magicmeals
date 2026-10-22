# -*- coding: utf-8 -*-
import sys
import re

with open('Magic Meals – Real Indian meals in 5 minutes.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Promo Announcement Bar CSS & HTML to Auto-Rotating Carousel
old_ticker_css_pattern = re.compile(r'\.ticker-bar\s*\{.*?\.ticker-bar\s*\.ticker-dot\s*\{.*?\}', re.DOTALL)

rotating_ticker_css = """    /* Auto-Rotating Top Announcement Bar */
    .ticker-bar {
      background: linear-gradient(90deg, #BF360C 0%, #D84315 50%, #E65100 100%);
      color: #FFFFFF;
      height: 38px;
      padding: 0 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.25px;
      user-select: none;
    }
    .promo-slide-track {
      position: relative;
      width: 100%;
      max-width: 680px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .promo-slide {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: translateY(14px);
      transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .promo-slide.active {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
    .promo-nav-btn {
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
    .promo-next { right: 10px; }
    @media (max-width: 600px) {
      .ticker-bar {
        font-size: 11.5px;
        padding: 0 32px;
      }
      .promo-nav-btn {
        width: 22px;
        height: 22px;
        font-size: 14px;
      }
      .promo-prev { left: 4px; }
      .promo-next { right: 4px; }
    }"""

content = old_ticker_css_pattern.sub(rotating_ticker_css, content, count=1)

# Replace ticker bar HTML
old_ticker_html_pattern = re.compile(r'<div class="ticker-bar">.*?</div>', re.DOTALL)
new_ticker_html = """<div class="ticker-bar" id="promoBar" aria-live="polite">
    <button class="promo-nav-btn promo-prev" id="promoPrevBtn" aria-label="Previous promo">‹</button>
    <div class="promo-slide-track">
      <div class="promo-slide active">
        <span>🍲 Real Indian Comfort Meals Ready in 5 Minutes</span>
      </div>
      <div class="promo-slide">
        <span>⚡ Free Express Delivery on Orders Above ₹499</span>
      </div>
      <div class="promo-slide">
        <span>🌿 100% Pure Vegetarian & Jain Certified Dishes</span>
      </div>
      <div class="promo-slide">
        <span>📦 Cash On Delivery (COD) Available Across India</span>
      </div>
      <div class="promo-slide">
        <span>❄️ Freeze-Dried Natural Taste • Zero Chemical Preservatives</span>
      </div>
    </div>
    <button class="promo-nav-btn promo-next" id="promoNextBtn" aria-label="Next promo">›</button>
  </div>"""
content = old_ticker_html_pattern.sub(new_ticker_html, content, count=1)

# 2. Remove "Travel Friendly Packs" airplane button from header
old_airplane_btn = """        <!-- Travel Friendly Airplane Icon -->
        <button class="icon-btn travel-plane-btn" data-go="shop" data-cat="Combos" aria-label="Travel Meals" title="Travel Friendly Packs">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
        </button>"""
content = content.replace(old_airplane_btn, '')

# In mobile bottom nav, replace "Travel" with "Categories" (triggers drawer)
old_mobile_travel_btn = """    <button data-go="shop" data-cat="Combos">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
      <span>Travel</span>
    </button>"""

new_mobile_cat_btn = """    <button id="mobileBottomCategoriesBtn" aria-label="Categories Menu">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      <span>Menu</span>
    </button>"""
content = content.replace(old_mobile_travel_btn, new_mobile_cat_btn)

# Update Trust Highlights strip - change airline to Satvik & Jain
old_airline_pill = """          <div class="trust-pill">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
            <span>Airline & Baggage Approved</span>
          </div>"""

new_satvik_pill = """          <div class="trust-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>100% Satvik & Jain Friendly</span>
          </div>"""
content = content.replace(old_airline_pill, new_satvik_pill)

# Update Drawer combos wording
content = content.replace('Travel & Value Combos', 'Value Combos')

# 3. New Hero Banner CSS and HTML
hero_css = """
    /* =========================================
       HERO BANNER (Warm, Appetizing & Cozy Vibe)
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
    }
    .hero-text-overlay {
      position: absolute;
      right: clamp(24px, 5vw, 90px);
      max-width: 490px;
      background: rgba(253, 251, 247, 0.95);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      padding: 32px 36px;
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.9);
      box-shadow: 0 16px 40px rgba(43, 27, 20, 0.12);
      z-index: 8;
    }
    .hero-mini-pill {
      display: inline-block;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--herb-mid);
      background: var(--herb-light);
      padding: 4px 12px;
      border-radius: var(--radius-full);
      margin-bottom: 12px;
    }
    .hero-headline {
      font-size: clamp(24px, 2.4vw, 32px);
      font-weight: 800;
      line-height: 1.2;
      color: var(--ink);
      margin: 0 0 10px;
      letter-spacing: -0.025em;
    }
    .hero-headline .highlight-saffron {
      color: var(--saffron);
    }
    .hero-subline {
      font-size: 14px;
      color: var(--ink-soft);
      line-height: 1.5;
      margin: 0 0 20px;
    }
    .hero-button-row {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .hero-cta-btn {
      padding: 0 22px;
      font-size: 14px;
    }
    .hero-jain-btn {
      padding: 0 18px;
      font-size: 14px;
      border-color: var(--herb-mid);
      color: var(--herb-mid);
    }
    .hero-jain-btn:hover {
      background: var(--herb-light);
      border-color: var(--herb);
      color: var(--herb);
    }
    .hero-perks-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding-top: 14px;
      border-top: 1px solid var(--line);
      font-size: 12px;
      font-weight: 600;
      color: var(--mute);
    }

    @media (max-width: 900px) {
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
    }
"""

content = content.replace('/* =========================================\n       HERO TRAVEL BANNER (Full Width Edge-to-Edge)', hero_css + '\n    /* =========================================\n       OLD BANNER')

# Replace Hero Banner in renderHomeView()
old_banner_html_pattern = re.compile(
    r'<section class="travel-banner-section">.*?</section>',
    re.DOTALL
)

new_hero_banner_html = """<!-- HERO BANNER (Warm Gourmet Food Aesthetic) -->
        <section class="hero-banner-section">
          <div class="hero-banner-card">
            <picture>
              <source media="(max-width: 768px)" srcset="magic_hero_warm_mobile_grounded.jpg">
              <img src="magic_hero_warm_desktop_clean.jpg" alt="Magic Meals Real Indian Meals in 5 Minutes" class="hero-banner-image">
            </picture>

            <!-- Warm Glassmorphism Overlay Card -->
            <div class="hero-text-overlay">
              <span class="hero-mini-pill">🌿 100% NATURAL • ZERO PRESERVATIVES</span>
              <h1 class="hero-headline">Real Indian Comfort Food,<br><span class="highlight-saffron">Ready in 5 Minutes.</span></h1>
              <p class="hero-subline">Homestyle dals, curries & rice bowls made with authentic ghee and pure ingredients. Just add hot water.</p>
              
              <div class="hero-button-row">
                <button class="btn hero-cta-btn" data-go="shop">Explore All Dishes (${PRODUCTS.length}) →</button>
                <button class="btn alt hero-jain-btn" id="heroJainQuickBtn">Jain Friendly</button>
              </div>

              <div class="hero-perks-row">
                <span>⏱ Ready in 5 Mins</span>
                <span>•</span>
                <span>❄️ Freeze-Dried</span>
                <span>•</span>
                <span>🍲 100% Homestyle Taste</span>
              </div>
            </div>
          </div>
        </section>"""

content = old_banner_html_pattern.sub(new_hero_banner_html, content, count=1)

# 4. Add Promo Bar Auto-Rotation JS
promo_js = """
    // Auto-Rotating Promo Bar Logic
    function initPromoBar() {
      const slides = document.querySelectorAll('.promo-slide');
      if (!slides.length) return;
      let currentIdx = 0;
      let timer = null;

      function showSlide(idx) {
        slides.forEach((s, i) => {
          s.classList.toggle('active', i === idx);
        });
        currentIdx = idx;
      }

      function nextSlide() {
        showSlide((currentIdx + 1) % slides.length);
      }

      function prevSlide() {
        showSlide((currentIdx - 1 + slides.length) % slides.length);
      }

      function startTimer() {
        clearInterval(timer);
        timer = setInterval(nextSlide, 3500);
      }

      function stopTimer() {
        clearInterval(timer);
      }

      const bar = document.getElementById('promoBar');
      if (bar) {
        bar.addEventListener('mouseenter', stopTimer);
        bar.addEventListener('mouseleave', startTimer);
      }

      const prevBtn = document.getElementById('promoPrevBtn');
      const nextBtn = document.getElementById('promoNextBtn');
      if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prevSlide(); startTimer(); });
      if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); nextSlide(); startTimer(); });

      startTimer();
    }
"""

content = content.replace('function openVideoModal(videoId) {', promo_js + '\n    function openVideoModal(videoId) {')

# Add click event for bottom categories menu button and hero jain button
click_events_patch = """
      if (target.id === 'mobileBottomCategoriesBtn') {
        openMobileDrawer();
        return;
      }
      if (target.id === 'heroJainQuickBtn') {
        State.jainOnly = true;
        navigateTo('shop');
        showToast('Showing 100% Jain-friendly dishes');
        return;
      }
"""

content = content.replace("if (target.id === 'mobileMenuOpenBtn') {", click_events_patch + "\n      if (target.id === 'mobileMenuOpenBtn') {")

# Call initPromoBar() in initRoute()
content = content.replace('initRoute();', 'initRoute();\n    initPromoBar();')

with open('Magic Meals – Real Indian meals in 5 minutes.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Successfully applied final changes! File size:', len(content))
