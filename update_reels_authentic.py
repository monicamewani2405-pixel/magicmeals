# -*- coding: utf-8 -*-
import sys
import re

with open('Magic Meals – Real Indian meals in 5 minutes.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add CSS for customer review cards matching user's screenshot
reel_css = """
    /* Customer Review Cards matching User Screenshot */
    .reel-card {
      flex: 0 0 270px !important;
      width: 270px !important;
      min-width: 270px !important;
      max-width: 270px !important;
      aspect-ratio: 9/16;
      border-radius: 16px;
      overflow: hidden;
      background: #111111;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
      position: relative;
      cursor: pointer;
      user-select: none;
    }
    .reel-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 14px 32px rgba(0, 0, 0, 0.25);
    }
    .reel-card:hover .shorts-play-bubble {
      transform: scale(1.15);
      background: #D84315;
    }
    .reel-thumb-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      display: block;
    }
    .reel-top-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      padding: 14px 12px;
      background: linear-gradient(180deg, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.3) 60%, rgba(0, 0, 0, 0) 100%);
      z-index: 5;
    }
    .reel-brand-badge {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .reel-badge-logo {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #FFFFFF;
      padding: 2px;
      object-fit: contain;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    }
    .reel-badge-info {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }
    .reel-badge-title {
      color: #FFFFFF;
      font-size: 13px;
      font-weight: 700;
      text-shadow: 0 1px 3px rgba(0,0,0,0.8);
    }
    .reel-badge-channel {
      color: rgba(255, 255, 255, 0.85);
      font-size: 11px;
      font-weight: 500;
      text-shadow: 0 1px 2px rgba(0,0,0,0.8);
    }
    .reel-shorts-badge {
      position: absolute;
      top: 14px;
      right: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      padding: 3px 8px;
      border-radius: 6px;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 700;
      z-index: 6;
    }
    .reel-center-play {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 5;
    }
    .shorts-play-bubble {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: #FF0000;
      display: grid;
      place-items: center;
      box-shadow: 0 6px 20px rgba(255, 0, 0, 0.45);
      transition: transform 0.25s ease, background 0.2s ease;
    }
    .shorts-play-bubble svg {
      margin-left: 3px;
    }
    .reel-bottom-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 16px 14px;
      background: linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%);
      z-index: 5;
    }
    .reel-dish-tag {
      display: inline-block;
      background: rgba(255, 255, 255, 0.95);
      color: var(--ink);
      font-size: 11.5px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 999px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }

    /* Video Lightbox Modal */
    .video-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      z-index: 120;
      display: none;
      place-items: center;
      padding: 20px;
    }
    .video-modal-backdrop.open {
      display: grid;
    }
    .video-modal-content {
      position: relative;
      width: 100%;
      max-width: 420px;
      aspect-ratio: 9/16;
      background: #000000;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }
    .video-modal-close {
      position: absolute;
      top: -46px;
      right: 0;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.25);
      color: #FFFFFF;
      font-size: 20px;
      border: none;
      cursor: pointer;
      display: grid;
      place-items: center;
      transition: background 0.2s;
    }
    .video-modal-close:hover {
      background: #FF0000;
    }
    .video-modal-frame {
      width: 100%;
      height: 100%;
      border: none;
    }
"""

content = content.replace('.reel-card {', reel_css + '\n    .reel-card-old {')

# 2. Update the "Loved by Our Customers" HTML structure to render the real cards
old_reels_pattern = re.compile(
    r'<!-- Loved by Our Customers.*?<div class="reel-container" id="youtubeReelsContainer">.*?</div>\s*</div>\s*</section>',
    re.DOTALL
)

new_reels_html = """<!-- Loved by Our Customers (Real Customer Reviews matching User Screenshot) -->
        <section class="customers-loved-section">
          <div class="section-header">
            <h2>Loved by Our Customers</h2>
            <p>Real stories from travelers, students & foodies across India and abroad</p>
          </div>

          <div class="reel-wrapper">
            <button class="scroll-btn scroll-left" id="reelScrollLeft" aria-label="Previous customer review">&#10094;</button>
            <button class="scroll-btn scroll-right" id="reelScrollRight" aria-label="Next customer review">&#10095;</button>

            <div class="reel-container" id="youtubeReelsContainer">
              <!-- Card 1 -->
              <div class="reel-card" data-video-id="stLqnv38SHk" title="Customer Review - Dal Khichdi">
                <img src="thumb_stLqnv38SHk.jpg" alt="Magic Meals Customer Review" class="reel-thumb-img">
                <div class="reel-top-overlay">
                  <div class="reel-brand-badge">
                    <img src="magic_meals_logo_saffron.png" alt="Magic Meals" class="reel-badge-logo">
                    <div class="reel-badge-info">
                      <span class="reel-badge-title">Customer Review</span>
                      <span class="reel-badge-channel">Magic Meals</span>
                    </div>
                  </div>
                </div>
                <div class="reel-shorts-badge">
                  <span>⚡ Shorts</span>
                </div>
                <div class="reel-center-play">
                  <div class="shorts-play-bubble">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="#FFFFFF"><polygon points="7 4 19 12 7 20 7 4"/></svg>
                  </div>
                </div>
                <div class="reel-bottom-overlay">
                  <span class="reel-dish-tag">Comforting Dal Khichdi</span>
                </div>
              </div>

              <!-- Card 2 -->
              <div class="reel-card" data-video-id="FQu7hM1dFAA" title="Customer Review - Mumbai Misal">
                <img src="thumb_FQu7hM1dFAA.jpg" alt="Magic Meals Customer Review" class="reel-thumb-img">
                <div class="reel-top-overlay">
                  <div class="reel-brand-badge">
                    <img src="magic_meals_logo_saffron.png" alt="Magic Meals" class="reel-badge-logo">
                    <div class="reel-badge-info">
                      <span class="reel-badge-title">Customer Review</span>
                      <span class="reel-badge-channel">Magic Meals</span>
                    </div>
                  </div>
                </div>
                <div class="reel-shorts-badge">
                  <span>⚡ Shorts</span>
                </div>
                <div class="reel-center-play">
                  <div class="shorts-play-bubble">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="#FFFFFF"><polygon points="7 4 19 12 7 20 7 4"/></svg>
                  </div>
                </div>
                <div class="reel-bottom-overlay">
                  <span class="reel-dish-tag">Spicy Mumbai Misal</span>
                </div>
              </div>

              <!-- Card 3 -->
              <div class="reel-card" data-video-id="248l3FWQ5ls" title="Customer Review - Gajar Ka Halwa">
                <img src="thumb_248l3FWQ5ls.jpg" alt="Magic Meals Customer Review" class="reel-thumb-img">
                <div class="reel-top-overlay">
                  <div class="reel-brand-badge">
                    <img src="magic_meals_logo_saffron.png" alt="Magic Meals" class="reel-badge-logo">
                    <div class="reel-badge-info">
                      <span class="reel-badge-title">Customer Review</span>
                      <span class="reel-badge-channel">Magic Meals</span>
                    </div>
                  </div>
                </div>
                <div class="reel-shorts-badge">
                  <span>⚡ Shorts</span>
                </div>
                <div class="reel-center-play">
                  <div class="shorts-play-bubble">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="#FFFFFF"><polygon points="7 4 19 12 7 20 7 4"/></svg>
                  </div>
                </div>
                <div class="reel-bottom-overlay">
                  <span class="reel-dish-tag">Gajar Ka Halwa Dessert</span>
                </div>
              </div>

              <!-- Card 4 -->
              <div class="reel-card" data-video-id="hveTAhjX3zk" title="Customer Review - Dal Khichdi Pouch">
                <img src="thumb_hveTAhjX3zk.jpg" alt="Magic Meals Customer Review" class="reel-thumb-img">
                <div class="reel-top-overlay">
                  <div class="reel-brand-badge">
                    <img src="magic_meals_logo_saffron.png" alt="Magic Meals" class="reel-badge-logo">
                    <div class="reel-badge-info">
                      <span class="reel-badge-title">Customer Review</span>
                      <span class="reel-badge-channel">Magic Meals</span>
                    </div>
                  </div>
                </div>
                <div class="reel-shorts-badge">
                  <span>⚡ Shorts</span>
                </div>
                <div class="reel-center-play">
                  <div class="shorts-play-bubble">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="#FFFFFF"><polygon points="7 4 19 12 7 20 7 4"/></svg>
                  </div>
                </div>
                <div class="reel-bottom-overlay">
                  <span class="reel-dish-tag">Quick Dal Khichdi in 5 Mins</span>
                </div>
              </div>

              <!-- Card 5 -->
              <div class="reel-card" data-video-id="D8cyKsu4w84" title="Customer Review - Travel Meals">
                <img src="thumb_D8cyKsu4w84.jpg" alt="Magic Meals Customer Review" class="reel-thumb-img">
                <div class="reel-top-overlay">
                  <div class="reel-brand-badge">
                    <img src="magic_meals_logo_saffron.png" alt="Magic Meals" class="reel-badge-logo">
                    <div class="reel-badge-info">
                      <span class="reel-badge-title">Customer Review</span>
                      <span class="reel-badge-channel">Magic Meals</span>
                    </div>
                  </div>
                </div>
                <div class="reel-shorts-badge">
                  <span>⚡ Shorts</span>
                </div>
                <div class="reel-center-play">
                  <div class="shorts-play-bubble">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="#FFFFFF"><polygon points="7 4 19 12 7 20 7 4"/></svg>
                  </div>
                </div>
                <div class="reel-bottom-overlay">
                  <span class="reel-dish-tag">100% Homestyle Indian Taste</span>
                </div>
              </div>
            </div>
          </div>
        </section>"""

content = old_reels_pattern.sub(new_reels_html, content, count=1)

# 3. Add video modal markup right before </body>
modal_markup = """
  <!-- Video Lightbox Modal for Customer Reels -->
  <div id="videoModalBackdrop" class="video-modal-backdrop" role="dialog" aria-modal="true" aria-label="Customer Video Review">
    <div class="video-modal-content">
      <button id="videoModalCloseBtn" class="video-modal-close" aria-label="Close video">✕</button>
      <iframe id="videoModalIframe" class="video-modal-frame" src="" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </div>
  </div>
"""

content = content.replace('</body>', modal_markup + '\n</body>')

# 4. Add modal open/close JavaScript logic
modal_js = """
    function openVideoModal(videoId) {
      const modal = document.getElementById('videoModalBackdrop');
      const iframe = document.getElementById('videoModalIframe');
      if (modal && iframe) {
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeVideoModal() {
      const modal = document.getElementById('videoModalBackdrop');
      const iframe = document.getElementById('videoModalIframe');
      if (modal && iframe) {
        iframe.src = '';
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
"""

content = content.replace('function openMobileDrawer() {', modal_js + '\n    function openMobileDrawer() {')

# Click listener for video card and video modal close
click_additions = """
      const reelCard = target.closest('.reel-card');
      if (reelCard && reelCard.dataset.videoId) {
        openVideoModal(reelCard.dataset.videoId);
        return;
      }
      if (target.id === 'videoModalCloseBtn' || target.id === 'videoModalBackdrop') {
        closeVideoModal();
        return;
      }
"""

content = content.replace("if (target.id === 'mobileMenuOpenBtn') {", click_additions + "\n      if (target.id === 'mobileMenuOpenBtn') {")

# Also close video modal on Escape
content = content.replace("if (e.key === 'Escape') { closeCart(); closeMobileDrawer(); }", "if (e.key === 'Escape') { closeCart(); closeMobileDrawer(); closeVideoModal(); }")

with open('Magic Meals – Real Indian meals in 5 minutes.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Update successful! File size:', len(content))
