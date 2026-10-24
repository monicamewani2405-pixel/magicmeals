# -*- coding: utf-8 -*-

for fname in ['index.html', 'Magic Meals – Real Indian meals in 5 minutes.html']:
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. SECTION TITLE STYLING & LEFT ALIGNMENT
    # Add .section-title CSS
    old_section_header_css = """.section-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 18px;
      padding-top: 14px;
    }
    .section-header h2 {
      font-size: 24px;
      font-weight: 800;
    }
    .section-header p {
      color: var(--mute);
      font-size: 14px;
      margin: 4px 0 0;
    }"""

    new_section_header_css = """.section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 22px;
      padding-top: 8px;
      text-align: left;
    }
    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.025em;
      color: #1F1A17;
      margin: 0;
      line-height: 1.25;
      text-align: left;
    }
    .section-title::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 24px;
      background: linear-gradient(180deg, #E05A2B 0%, #D84315 100%);
      border-radius: 4px;
      flex-shrink: 0;
    }
    .title-badge {
      display: inline-block;
      font-size: 12px;
      font-weight: 700;
      color: #C2410C;
      background: #FFF7ED;
      border: 1px solid #FFEDD5;
      padding: 3px 10px;
      border-radius: 20px;
      letter-spacing: 0;
      vertical-align: middle;
      margin-left: 8px;
    }
    @media (max-width: 768px) {
      .section-title {
        font-size: 20px;
        gap: 10px;
      }
      .section-title::before {
        height: 20px;
        width: 3.5px;
      }
      .title-badge {
        font-size: 11px;
        padding: 2px 8px;
      }
    }"""

    assert old_section_header_css in content, f"old_section_header_css not found in {fname}"
    content = content.replace(old_section_header_css, new_section_header_css, 1)

    # 2. REMOVE DESCRIPTIONS & UNIFY TITLES TO LEFT-ALIGNED .section-title
    # Best Sellers
    old_bs = """        <!-- Best Sellers Grid -->
        <section>
          <div class="section-header">
            <div>
              <h2>Best Sellers</h2>
              <p>Most loved comfort dishes by our regular customers</p>
            </div>
            <a class="view-all-link" data-go="shop" data-cat="All">See All Meals (${PRODUCTS.length}) →</a>
          </div>"""

    new_bs = """        <!-- Best Sellers Grid -->
        <section style="margin-top:24px;">
          <div class="section-header">
            <h2 class="section-title">Best Sellers</h2>
            <a class="view-all-link" data-go="shop" data-cat="All">See All Meals (${PRODUCTS.length}) →</a>
          </div>"""

    assert old_bs in content, f"old_bs not found in {fname}"
    content = content.replace(old_bs, new_bs, 1)

    # Value Combos
    old_vc = """        <!-- Money-Saving Combos -->
        ${combos.length ? `
          <section style="margin-top:20px;">
            <div class="section-header">
              <div>
                <h2>Value Combos (Save up to 15%)</h2>
                <p>Curated meal pairings ideal for international flights, treks & hostel dorms</p>
              </div>
              <a class="view-all-link" data-go="shop" data-cat="Combos">Browse All Combos →</a>
            </div>"""

    new_vc = """        <!-- Money-Saving Combos -->
        ${combos.length ? `
          <section style="margin-top:38px;">
            <div class="section-header">
              <h2 class="section-title">Value Combos <span class="title-badge">Save up to 15%</span></h2>
              <a class="view-all-link" data-go="shop" data-cat="Combos">Browse All Combos →</a>
            </div>"""

    assert old_vc in content, f"old_vc not found in {fname}"
    content = content.replace(old_vc, new_vc, 1)

    # The Magic of Freeze-Drying
    old_fd = """        <!-- Why Freeze-Dried vs Normal Pouch -->
        <section class="edu-section">
          <div class="edu-header">
            <h2>The Magic of Freeze-Drying</h2>
            <p>Why Magic Meals tastes 10× better than regular retort canned meals</p>
          </div>"""

    new_fd = """        <!-- Why Freeze-Dried vs Normal Pouch -->
        <section class="edu-section" style="margin-top:38px;">
          <div class="section-header">
            <h2 class="section-title">The Magic of Freeze-Drying</h2>
          </div>"""

    assert old_fd in content, f"old_fd not found in {fname}"
    content = content.replace(old_fd, new_fd, 1)

    # Customer Stories in Action (Reels)
    old_reels = """        <!-- Loved by Our Customers (Real Customer Reviews matching User Screenshot) -->
        <section class="customers-loved-section">
          <div class="section-header">
            <h2>Customer Stories in Action</h2>
            <p>Real stories from travelers, students & foodies across India and abroad</p>
          </div>"""

    new_reels = """        <!-- Customer Stories in Action -->
        <section class="customers-loved-section" style="margin-top:38px;">
          <div class="section-header">
            <h2 class="section-title">Customer Stories in Action</h2>
          </div>"""

    assert old_reels in content, f"old_reels not found in {fname}"
    content = content.replace(old_reels, new_reels, 1)

    # Loved by Travelers & Students (Reviews)
    old_reviews = """        <!-- Customer Testimonials -->
        <section style="margin-top:32px;">
          <div class="section-header">
            <div>
              <h2>Loved by Travelers & Students</h2>
              <p>Real stories from verified customers around the globe</p>
            </div>
          </div>"""

    new_reviews = """        <!-- Customer Testimonials -->
        <section style="margin-top:38px;">
          <div class="section-header">
            <h2 class="section-title">Loved by Travelers & Students</h2>
          </div>"""

    assert old_reviews in content, f"old_reviews not found in {fname}"
    content = content.replace(old_reviews, new_reviews, 1)

    # 3. MODERN BURGER MENU (NO ICONS, NO CONTAINERS, ONLY CATEGORIES)
    old_drawer_html = """  <aside id="mobileDrawer" class="mobile-drawer" role="dialog" aria-modal="true" aria-label="Categories Menu">
    <div class="mobile-drawer-header">
      <div class="drawer-logo" data-go="home">
        <img src="magic_meals_logo_saffron.png" alt="Magic Meals" class="drawer-logo-img">
      </div>
      <button id="mobileMenuCloseBtn" class="drawer-close-btn" aria-label="Close menu">✕</button>
    </div>
    
    <div class="mobile-drawer-body">
      <div class="drawer-cat-heading">MEAL CATEGORIES</div>
      <div class="mobile-categories-list">
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
      <div class="drawer-divider"></div>

      <div class="drawer-cat-heading">QUICK LINKS</div>
      <div class="drawer-quick-nav">
        <a data-go="home" class="drawer-nav-item">🏠 Home</a>
        <a data-go="shop" class="drawer-nav-item">🛒 Browse Catalog</a>
        <a data-go="about" class="drawer-nav-item">🌱 Freeze-Drying Benefits</a>
        <a data-go="faqs" class="drawer-nav-item">❓ FAQs & Flight Rules</a>
        <a href="https://wa.me/919820000000?text=Hi%20Magic%20Meals,%20I%20have%20a%20question%20about%20your%20meals" target="_blank" rel="noopener noreferrer" class="drawer-nav-item drawer-wa-item">💬 WhatsApp Live Support</a>
      </div>

      <div class="drawer-cert-footer">
        <span class="veg-badge-indicator"></span>
        <span>100% Pure Vegetarian & Jain Certified</span>
      </div>
    </div>
  </aside>"""

    new_drawer_html = """  <aside id="mobileDrawer" class="mobile-drawer" role="dialog" aria-modal="true" aria-label="Categories Menu">
    <div class="mobile-drawer-header">
      <div class="drawer-logo" data-go="home">
        <img src="magic_meals_logo_saffron.png" alt="Magic Meals" class="drawer-logo-img">
      </div>
      <button id="mobileMenuCloseBtn" class="drawer-close-btn" aria-label="Close menu">✕</button>
    </div>
    
    <div class="mobile-drawer-body">
      <div class="mobile-categories-list">
        <button class="drawer-cat-btn active" data-cat="Rice">Rice</button>
        <button class="drawer-cat-btn" data-cat="Meals">Meals</button>
        <button class="drawer-cat-btn" data-cat="Breakfast">Breakfast</button>
        <button class="drawer-cat-btn" data-cat="Dals">Dals</button>
        <button class="drawer-cat-btn" data-cat="Soups">Soups</button>
        <button class="drawer-cat-btn" data-cat="Desserts">Desserts</button>
        <button class="drawer-cat-btn" data-cat="Breads">Breads</button>
        <button class="drawer-cat-btn" data-cat="Combos">Combos</button>
        <button class="drawer-cat-btn" data-cat="All">All</button>
      </div>
    </div>
  </aside>"""

    assert old_drawer_html in content, f"old_drawer_html not found in {fname}"
    content = content.replace(old_drawer_html, new_drawer_html, 1)

    # Modern drawer CSS
    old_drawer_css = """.drawer-cat-btn {
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
    }"""

    new_drawer_css = """.mobile-drawer-body {
      padding: 10px 0 24px;
      overflow-y: auto;
      flex: 1;
    }
    .mobile-categories-list {
      display: flex;
      flex-direction: column;
    }
    .drawer-cat-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px 22px;
      background: transparent;
      border: none;
      border-bottom: 1px solid #F3EDE4;
      border-radius: 0;
      color: #1F1A17;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 0.01em;
      text-align: left;
      cursor: pointer;
      transition: all 0.18s ease;
      width: 100%;
    }
    .drawer-cat-btn:hover, .drawer-cat-btn.active {
      background: #FFF7F2;
      color: #E05A2B;
      font-weight: 700;
      padding-left: 26px;
    }
    .drawer-cat-btn::after {
      content: '›';
      font-size: 19px;
      color: #BDB4AA;
      font-weight: 400;
      transition: transform 0.18s, color 0.18s;
    }
    .drawer-cat-btn:hover::after, .drawer-cat-btn.active::after {
      color: #E05A2B;
      transform: translateX(3px);
    }"""

    assert old_drawer_css in content, f"old_drawer_css not found in {fname}"
    content = content.replace(old_drawer_css, new_drawer_css, 1)

    # 4. SIGN IN / SIGN UP OPTION BETWEEN SEARCH AND CART
    old_header_actions = """        <button class="icon-btn" data-go="shop" aria-label="Search all meals" title="Search Meals">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </button>



        <!-- Bag / Cart Icon -->"""

    new_header_actions = """        <button class="icon-btn" data-go="shop" aria-label="Search all meals" title="Search Meals">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </button>

        <!-- Sign In / Sign Up Option -->
        <button class="icon-btn auth-nav-btn" id="authOpenBtn" aria-label="Sign In or Sign Up" title="Sign In / Sign Up">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span class="auth-btn-text">Sign In</span>
        </button>

        <!-- Bag / Cart Icon -->"""

    assert old_header_actions in content, f"old_header_actions not found in {fname}"
    content = content.replace(old_header_actions, new_header_actions, 1)

    # CSS for auth-nav-btn and auth modal
    auth_css = """
    /* Header Sign In / Sign Up Button */
    .auth-nav-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: var(--radius-full);
      background: var(--bg);
      border: 1px solid var(--line);
      color: var(--ink);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .auth-nav-btn:hover {
      background: var(--saffron-light);
      border-color: var(--saffron);
      color: var(--saffron-hover);
    }
    .auth-nav-btn svg {
      width: 17px;
      height: 17px;
      color: currentColor;
    }
    @media (max-width: 600px) {
      .auth-nav-btn {
        padding: 8px;
        border-radius: 50%;
        background: transparent;
        border: none;
      }
      .auth-btn-text {
        display: none;
      }
    }

    /* Auth Modal */
    .auth-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      z-index: 220;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }
    .auth-modal-backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }
    .auth-modal-card {
      background: #FFFFFF;
      border-radius: 20px;
      width: 100%;
      max-width: 420px;
      padding: 28px 24px 32px;
      position: relative;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
      transform: translateY(16px);
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .auth-modal-backdrop.open .auth-modal-card {
      transform: translateY(0);
    }
    .auth-modal-close {
      position: absolute;
      top: 18px;
      right: 18px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: var(--line-subtle);
      color: var(--ink);
      font-size: 15px;
      display: grid;
      place-items: center;
      cursor: pointer;
      transition: all 0.15s;
    }
    .auth-modal-close:hover {
      background: var(--saffron-light);
      color: var(--saffron);
    }
    .auth-modal-brand {
      text-align: center;
      margin-bottom: 20px;
    }
    .auth-modal-brand h3 {
      font-size: 20px;
      font-weight: 800;
      color: var(--ink);
      margin: 4px 0;
    }
    .auth-modal-brand p {
      font-size: 13px;
      color: var(--mute);
      margin: 0;
    }
    .auth-tabs {
      display: flex;
      background: var(--bg);
      border-radius: 12px;
      padding: 4px;
      margin-bottom: 20px;
    }
    .auth-tab-btn {
      flex: 1;
      padding: 9px 0;
      border: none;
      border-radius: 8px;
      background: transparent;
      font-size: 13.5px;
      font-weight: 600;
      color: var(--mute);
      cursor: pointer;
      transition: all 0.2s;
    }
    .auth-tab-btn.active {
      background: #FFFFFF;
      color: var(--ink);
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      font-weight: 700;
    }
    .auth-field {
      margin-bottom: 14px;
      text-align: left;
    }
    .auth-field label {
      display: block;
      font-size: 12.5px;
      font-weight: 600;
      color: var(--ink-soft);
      margin-bottom: 6px;
    }
    .auth-field input {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid var(--line);
      border-radius: 10px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
      background: #FFFFFF;
    }
    .auth-field input:focus {
      border-color: var(--saffron);
    }
    .auth-row-sub {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12.5px;
      margin-bottom: 16px;
      color: var(--mute);
    }
    .auth-remember {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
    }
    .auth-forgot {
      color: var(--saffron);
      text-decoration: none;
      font-weight: 600;
    }
    .auth-submit-btn {
      width: 100%;
      padding: 12px;
      background: var(--saffron);
      color: #FFFFFF;
      border: none;
      border-radius: 10px;
      font-size: 14.5px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s;
    }
    .auth-submit-btn:hover {
      background: var(--saffron-hover);
    }
    .auth-divider {
      text-align: center;
      position: relative;
      margin: 18px 0;
    }
    .auth-divider::before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      height: 1px;
      background: var(--line);
    }
    .auth-divider span {
      position: relative;
      background: #FFFFFF;
      padding: 0 10px;
      font-size: 11px;
      font-weight: 700;
      color: var(--mute);
      letter-spacing: 0.05em;
    }
    .auth-google-btn {
      width: 100%;
      padding: 10px;
      background: #FFFFFF;
      border: 1px solid var(--line);
      border-radius: 10px;
      font-size: 13.5px;
      font-weight: 600;
      color: var(--ink);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .auth-google-btn:hover {
      background: var(--bg);
    }
"""
    # Insert auth CSS before </style>
    style_close = '</style>'
    assert style_close in content, f"style_close not found in {fname}"
    content = content.replace(style_close, auth_css + '\n  ' + style_close, 1)

    # Insert Auth Modal HTML before </body>
    auth_modal_html = """  <!-- Sign In / Sign Up Modal -->
  <div class="auth-modal-backdrop" id="authModalBackdrop">
    <div class="auth-modal-card">
      <button class="auth-modal-close" id="authModalCloseBtn" aria-label="Close">✕</button>
      <div class="auth-modal-brand">
        <img src="magic_meals_logo_saffron.png" alt="Magic Meals" style="height: 34px; width: auto; margin-bottom: 6px;">
        <h3>Welcome to Magic Meals</h3>
        <p>Sign in to track orders, save meal boxes & enjoy member perks</p>
      </div>

      <div class="auth-tabs">
        <button class="auth-tab-btn active" id="tabSignInBtn">Sign In</button>
        <button class="auth-tab-btn" id="tabSignUpBtn">Create Account</button>
      </div>

      <!-- Sign In Form -->
      <form class="auth-form" id="signInForm" onsubmit="event.preventDefault(); alert('Signed in successfully!'); document.getElementById('authModalBackdrop').classList.remove('open');">
        <div class="auth-field">
          <label>Email or Mobile Number</label>
          <input type="text" placeholder="e.g. rahul@gmail.com or 9820000000" required>
        </div>
        <div class="auth-field">
          <label>Password</label>
          <input type="password" placeholder="Enter your password" required>
        </div>
        <div class="auth-row-sub">
          <label class="auth-remember"><input type="checkbox" checked> Remember me</label>
          <a href="#" class="auth-forgot" onclick="alert('Password reset instructions sent!'); return false;">Forgot?</a>
        </div>
        <button type="submit" class="auth-submit-btn">Sign In</button>
      </form>

      <!-- Sign Up Form (hidden by default) -->
      <form class="auth-form" id="signUpForm" style="display: none;" onsubmit="event.preventDefault(); alert('Account created successfully! Welcome to Magic Meals.'); document.getElementById('authModalBackdrop').classList.remove('open');">
        <div class="auth-field">
          <label>Full Name</label>
          <input type="text" placeholder="e.g. Monica Sharma" required>
        </div>
        <div class="auth-field">
          <label>Email Address</label>
          <input type="email" placeholder="e.g. monica@example.com" required>
        </div>
        <div class="auth-field">
          <label>Mobile Number</label>
          <input type="tel" placeholder="10-digit mobile number" required>
        </div>
        <div class="auth-field">
          <label>Create Password</label>
          <input type="password" placeholder="Minimum 6 characters" required>
        </div>
        <button type="submit" class="auth-submit-btn">Create Free Account</button>
      </form>

      <div class="auth-divider"><span>OR</span></div>
      <button class="auth-google-btn" onclick="alert('Connecting to Google...'); document.getElementById('authModalBackdrop').classList.remove('open');">
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
        Continue with Google
      </button>
    </div>
  </div>
"""
    body_close = '</body>'
    assert body_close in content, f"body_close not found in {fname}"
    content = content.replace(body_close, auth_modal_html + '\n' + body_close, 1)

    # Wire JS listeners for Auth Modal
    auth_js = """
      // Auth Modal Open/Close & Tabs
      const authOpenBtn = document.getElementById('authOpenBtn');
      const authModalBackdrop = document.getElementById('authModalBackdrop');
      const authModalCloseBtn = document.getElementById('authModalCloseBtn');
      const tabSignInBtn = document.getElementById('tabSignInBtn');
      const tabSignUpBtn = document.getElementById('tabSignUpBtn');
      const signInForm = document.getElementById('signInForm');
      const signUpForm = document.getElementById('signUpForm');

      if (authOpenBtn && authModalBackdrop) {
        authOpenBtn.addEventListener('click', () => {
          authModalBackdrop.classList.add('open');
        });
        if (authModalCloseBtn) {
          authModalCloseBtn.addEventListener('click', () => {
            authModalBackdrop.classList.remove('open');
          });
        }
        authModalBackdrop.addEventListener('click', (e) => {
          if (e.target === authModalBackdrop) {
            authModalBackdrop.classList.remove('open');
          }
        });
        if (tabSignInBtn && tabSignUpBtn) {
          tabSignInBtn.addEventListener('click', () => {
            tabSignInBtn.classList.add('active');
            tabSignUpBtn.classList.remove('active');
            signInForm.style.display = 'block';
            signUpForm.style.display = 'none';
          });
          tabSignUpBtn.addEventListener('click', () => {
            tabSignUpBtn.classList.add('active');
            tabSignInBtn.classList.remove('active');
            signInForm.style.display = 'none';
            signUpForm.style.display = 'block';
          });
        }
      }
"""
    # Insert auth_js into script before window.addEventListener('DOMContentLoaded'
    target_js_insert = 'initPromoBar();'
    assert target_js_insert in content, f"target_js_insert not found in {fname}"
    content = content.replace(target_js_insert, auth_js + '\n      ' + target_js_insert, 1)

    with open(fname, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Successfully applied all changes to {fname}")
