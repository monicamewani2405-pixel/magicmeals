# -*- coding: utf-8 -*-

for fname in ['index.html', 'Magic Meals – Real Indian meals in 5 minutes.html']:
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()

    # Exact CSS replacement
    old_css = """    /* "Why Freeze Dried" Education Strip */
    .edu-section {
      background: #FFFFFF;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      padding: 24px 20px;
      margin: 32px 0;
      box-shadow: var(--shadow-sm);
    }
    .edu-grid {
      display: grid;
      gap: 16px;
      margin-top: 18px;
    }
    .edu-card {
      display: flex;
      gap: 14px;
      align-items: flex-start;
      background: var(--bg);
      border: 1px solid var(--line);
      border-radius: var(--radius-md);
      padding: 16px;
    }
    .edu-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: var(--saffron-light);
      color: var(--saffron);
      display: grid;
      place-items: center;
      flex-shrink: 0;
      font-size: 20px;
    }
    .edu-card h4 {
      font-size: 15px;
      margin-bottom: 4px;
    }
    .edu-card p {
      font-size: 13.5px;
      color: var(--mute);
      margin: 0;
      line-height: 1.5;
    }"""

    new_css = """    /* "Why Freeze Dried" Seamless Culinary Strip */
    .edu-section {
      background: transparent;
      border: none;
      border-radius: 0;
      padding: 28px 0 16px;
      margin: 16px 0 28px;
      box-shadow: none;
    }
    .edu-header {
      text-align: center;
      max-width: 620px;
      margin: 0 auto 22px;
    }
    .edu-header h2 {
      font-size: 24px;
      font-weight: 700;
      color: var(--ink);
      margin: 0 0 6px;
    }
    .edu-header p {
      color: var(--mute);
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
    }
    .edu-grid {
      display: grid;
      gap: 16px;
      margin-top: 0;
    }
    .edu-card {
      display: flex;
      gap: 14px;
      align-items: flex-start;
      background: #FFFFFF;
      border: 1px solid #EFE6D8;
      border-radius: 14px;
      padding: 18px 16px;
      box-shadow: 0 1px 3px rgba(45, 34, 27, 0.04);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .edu-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(45, 34, 27, 0.08);
    }
    .edu-icon {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      background: rgba(224, 90, 43, 0.1);
      color: var(--saffron);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .edu-icon svg {
      display: block;
      width: 22px;
      height: 22px;
    }
    .edu-card h4 {
      font-size: 15px;
      font-weight: 700;
      color: var(--ink);
      margin: 0 0 4px;
    }
    .edu-card p {
      font-size: 13px;
      color: var(--mute);
      margin: 0;
      line-height: 1.5;
    }"""

    assert old_css in content, f"old_css not found in {fname}"
    content = content.replace(old_css, new_css, 1)

    # Exact HTML replacement
    old_html = """        <!-- Why Freeze-Dried vs Normal Pouch -->
        <section class="edu-section">
          <h2>The Magic of Freeze-Drying</h2>
          <p style="color:var(--mute); margin:4px 0 0; font-size:14px;">Why Magic Meals tastes 10x better than regular retort canned meals</p>
          <div class="edu-grid">
            <div class="edu-card">
              <div class="edu-icon">❄️</div>
              <div>
                <h4>98% Nutrient Retention</h4>
                <p>Unlike thermal canning which destroys vitamins, freeze-drying gently sublimates ice crystals without breaking food fibers.</p>
              </div>
            </div>
            <div class="edu-card">
              <div class="edu-icon">🍃</div>
              <div>
                <h4>Zero Chemical Preservatives</h4>
                <p>Because there is 0% residual moisture, bacteria cannot survive naturally. No sodium benzoate or artificial chemicals required.</p>
              </div>
            </div>
            <div class="edu-card">
              <div class="edu-icon">✈️</div>
              <div>
                <h4>Ultra Lightweight for Travel</h4>
                <p>An 80g featherweight pouch yields a generous 260g hearty meal once hot water is poured in. Fits easily into hand luggage.</p>
              </div>
            </div>
          </div>
        </section>"""

    new_html = """        <!-- Why Freeze-Dried vs Normal Pouch -->
        <section class="edu-section">
          <div class="edu-header">
            <h2>The Magic of Freeze-Drying</h2>
            <p>Why Magic Meals tastes 10× better than regular retort canned meals</p>
          </div>
          <div class="edu-grid">
            <div class="edu-card">
              <div class="edu-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  <circle cx="12" cy="12" r="9"/>
                </svg>
              </div>
              <div>
                <h4>98% Nutrient Retention</h4>
                <p>Unlike thermal canning which destroys vitamins, freeze-drying gently sublimates ice crystals without breaking food fibers.</p>
              </div>
            </div>
            <div class="edu-card">
              <div class="edu-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <div>
                <h4>Zero Chemical Preservatives</h4>
                <p>Because there is 0% residual moisture, bacteria cannot survive naturally. 100% natural with no chemical preservatives.</p>
              </div>
            </div>
            <div class="edu-card">
              <div class="edu-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"/>
                </svg>
              </div>
              <div>
                <h4>Ultra Lightweight for Travel</h4>
                <p>An 80g featherweight pouch yields a generous 260g hearty meal once hot water is poured in. Fits easily into hand luggage.</p>
              </div>
            </div>
          </div>
        </section>"""

    assert old_html in content, f"old_html not found in {fname}"
    content = content.replace(old_html, new_html, 1)

    with open(fname, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Applied Option 1 to {fname}")
