# -*- coding: utf-8 -*-

for fname in ['index.html', 'Magic Meals – Real Indian meals in 5 minutes.html']:
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove Shopify Ready Architecture from footer
    shopify_block = """        <div class="footer-col">
          <h4>Shopify Ready Architecture</h4>
          <p style="font-size:13px;">This prototype is built with clean component state, collection filters, and cart-drawer logic ready for seamless Shopify Online Store 2.0 Theme integration.</p>
        </div>"""
    assert shopify_block in content, f"shopify_block not found in {fname}"
    content = content.replace(shopify_block, '', 1)

    # 2. In header: category is only highlighted when that page is open (not on homepage)
    # Remove initial 'active' class on Rice in header
    old_rice_header = '<a class="header-cat-link active" data-cat="Rice">Rice</a>'
    new_rice_header = '<a class="header-cat-link" data-cat="Rice">Rice</a>'
    assert old_rice_header in content, f"old_rice_header not found in {fname}"
    content = content.replace(old_rice_header, new_rice_header, 1)

    # Remove initial 'active' class on Rice in drawer
    old_rice_drawer = '<button class="drawer-cat-btn active" data-cat="Rice">Rice</button>'
    new_rice_drawer = '<button class="drawer-cat-btn" data-cat="Rice">Rice</button>'
    if old_rice_drawer in content:
        content = content.replace(old_rice_drawer, new_rice_drawer, 1)

    # Update JS logic so category is only active when view === 'shop'
    old_top_bar_js = """      // Update Desktop Categories Top Bar States
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

    new_top_bar_js = """      // Update Desktop Categories Top Bar States (Only active on shop/category page, NOT on homepage)
      document.querySelectorAll('.header-cat-link').forEach(link => {
        const cat = link.dataset.cat;
        if (State.view === 'shop' && State.selectedCategory === cat) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      // Update Mobile Drawer Categories States (Only active on shop/category page)
      document.querySelectorAll('.drawer-cat-btn').forEach(btn => {
        const cat = btn.dataset.cat;
        if (State.view === 'shop' && State.selectedCategory === cat) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });"""

    assert old_top_bar_js in content, f"old_top_bar_js not found in {fname}"
    content = content.replace(old_top_bar_js, new_top_bar_js, 1)

    # 3. Instead of "Sign In" words, just put the icon similar to mobile version
    old_auth_btn = """        <!-- Sign In / Sign Up Option -->
        <button class="icon-btn auth-nav-btn" id="authOpenBtn" aria-label="Sign In or Sign Up" title="Sign In / Sign Up">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span class="auth-btn-text">Sign In</span>
        </button>"""

    new_auth_btn = """        <!-- Sign In / Sign Up Option (Icon-only matching Search and Cart) -->
        <button class="icon-btn" id="authOpenBtn" aria-label="Sign In or Sign Up" title="Sign In / Sign Up">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </button>"""

    assert old_auth_btn in content, f"old_auth_btn not found in {fname}"
    content = content.replace(old_auth_btn, new_auth_btn, 1)

    with open(fname, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Successfully updated {fname}")
