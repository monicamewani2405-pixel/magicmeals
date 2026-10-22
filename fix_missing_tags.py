# -*- coding: utf-8 -*-
import sys

with open('Magic Meals – Real Indian meals in 5 minutes.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the mangled section around line 2232
target_section = """        <a data-go="about" class="drawer-nav-item">🌱 Freeze-Drying Benefits</a>
        <a data-go="faqs" class="drawer-nav-item">❓ FAQs & Flight Rules</a>
        <a href="https://wa.me/919820000000?text=Hi%20Magic%20Meals,%20I%20would%20like%20to%20order%20ready-to-eat%20meals!" target="_blank" rel="noopener noreferrer" class="whatsapp-float-btn" title="Chat with Magic Meals on WhatsApp" aria-label="Official WhatsApp Support">
    <svg viewBox="0 0 32 32" width="34" height="34" fill="none">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M16 2C8.268 2 2 8.268 2 16c0 2.56.687 4.962 1.884 7.034L2 30l7.158-1.852A13.935 13.935 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2z" fill="#25D366"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M24.893 21.053c-.365 1.026-1.815 1.88-2.52 1.998-.679.113-1.564.161-2.523-.146-.613-.196-1.402-.458-2.42-.9-4.298-1.866-7.098-6.236-7.313-6.52-.214-.286-1.74-2.316-1.74-4.417 0-2.102 1.099-3.136 1.49-3.565.393-.429.856-.536 1.142-.536.286 0 .571.003.821.015.263.013.615-.1.963.736.365.88 1.25 3.048 1.357 3.267.108.219.18.475.036.76-.143.287-.215.466-.429.716-.214.25-.45.558-.643.75-.214.214-.438.446-.188.874.25.428 1.11 1.83 2.38 2.96 1.633 1.455 3.01 1.905 3.438 2.119.429.214.679.179.929-.107.25-.286 1.072-1.25 1.357-1.678.286-.429.572-.357.965-.214.393.143 2.5 1.178 2.929 1.393.429.214.714.321.821.5.108.179.108 1.036-.257 2.062z" fill="#FFFFFF"/>
    </svg>
  </a>

  <!-- Mobile Bottom Navigation Bar -->"""

corrected_section = """        <a data-go="about" class="drawer-nav-item">🌱 Freeze-Drying Benefits</a>
        <a data-go="faqs" class="drawer-nav-item">❓ FAQs & Flight Rules</a>
        <a href="https://wa.me/919820000000?text=Hi%20Magic%20Meals,%20I%20have%20a%20question%20about%20your%20meals" target="_blank" rel="noopener noreferrer" class="drawer-nav-item drawer-wa-item">💬 WhatsApp Live Support</a>
      </div>

      <div class="drawer-cert-footer">
        <span class="veg-badge-indicator"></span>
        <span>100% Pure Vegetarian & Jain Certified</span>
      </div>
    </div>
  </aside>

  <!-- Main Dynamic View Container -->
  <main id="app" class="wrap"></main>

  <!-- Official Floating WhatsApp Support Button -->
  <a href="https://wa.me/919820000000?text=Hi%20Magic%20Meals,%20I%20would%20like%20to%20order%20ready-to-eat%20meals!" target="_blank" rel="noopener noreferrer" class="whatsapp-float-btn" title="Chat with Magic Meals on WhatsApp" aria-label="Official WhatsApp Support">
    <svg viewBox="0 0 32 32" width="34" height="34" fill="none">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M16 2C8.268 2 2 8.268 2 16c0 2.56.687 4.962 1.884 7.034L2 30l7.158-1.852A13.935 13.935 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2z" fill="#25D366"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M24.893 21.053c-.365 1.026-1.815 1.88-2.52 1.998-.679.113-1.564.161-2.523-.146-.613-.196-1.402-.458-2.42-.9-4.298-1.866-7.098-6.236-7.313-6.52-.214-.286-1.74-2.316-1.74-4.417 0-2.102 1.099-3.136 1.49-3.565.393-.429.856-.536 1.142-.536.286 0 .571.003.821.015.263.013.615-.1.963.736.365.88 1.25 3.048 1.357 3.267.108.219.18.475.036.76-.143.287-.215.466-.429.716-.214.25-.45.558-.643.75-.214.214-.438.446-.188.874.25.428 1.11 1.83 2.38 2.96 1.633 1.455 3.01 1.905 3.438 2.119.429.214.679.179.929-.107.25-.286 1.072-1.25 1.357-1.678.286-.429.572-.357.965-.214.393.143 2.5 1.178 2.929 1.393.429.214.714.321.821.5.108.179.108 1.036-.257 2.062z" fill="#FFFFFF"/>
    </svg>
  </a>

  <!-- Mobile Bottom Navigation Bar -->"""

content = content.replace(target_section, corrected_section)

# Also ensure visibility: hidden and pointer-events: none on drawers when closed
content = content.replace(
    'transform: translateX(-100%);\n      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);',
    'transform: translateX(-100%);\n      visibility: hidden;\n      pointer-events: none;\n      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.3s;'
)
content = content.replace(
    '.mobile-drawer.open {\n      transform: translateX(0);',
    '.mobile-drawer.open {\n      transform: translateX(0);\n      visibility: visible;\n      pointer-events: auto;'
)

content = content.replace(
    'transform: translateX(100%);\n      transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);',
    'transform: translateX(100%);\n      visibility: hidden;\n      pointer-events: none;\n      transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.28s;'
)
content = content.replace(
    '.cart-drawer.open {\n      transform: none;',
    '.cart-drawer.open {\n      transform: none;\n      visibility: visible;\n      pointer-events: auto;'
)

with open('Magic Meals – Real Indian meals in 5 minutes.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Successfully restored clean structure!')
