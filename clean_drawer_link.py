# -*- coding: utf-8 -*-
with open('Magic Meals – Real Indian meals in 5 minutes.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the duplicated floating button inside mobileDrawer with clean drawer link
bad_drawer_wa = """        <a href="https://wa.me/919820000000?text=Hi%20Magic%20Meals,%20I%20would%20like%20to%20order%20ready-to-eat%20meals!" target="_blank" rel="noopener noreferrer" class="whatsapp-float-btn" title="Chat with Magic Meals on WhatsApp" aria-label="Official WhatsApp Support">
    <svg viewBox="0 0 32 32" width="34" height="34" fill="#FFFFFF">
      <path d="M16.01 2.05c-7.7 0-13.96 6.26-13.96 13.96 0 2.47.65 4.88 1.88 7.02L2 30l7.19-1.88c2.07 1.13 4.41 1.73 6.82 1.73 7.7 0 13.96-6.26 13.96-13.96 0-3.73-1.45-7.24-4.09-9.87s-6.14-4.09-9.87-4.09zm0 25.56c-2.13 0-4.22-.57-6.04-1.65l-.43-.26-4.48 1.18 1.2-4.37-.28-.45c-1.19-1.89-1.81-4.07-1.81-6.31 0-6.44 5.24-11.68 11.68-11.68 3.12 0 6.06 1.22 8.26 3.43 2.21 2.21 3.42 5.14 3.42 8.26 0 6.44-5.24 11.68-11.68 11.68zm6.41-8.75c-.35-.18-2.08-1.03-2.4-1.15-.32-.12-.56-.18-.79.18-.23.35-.91 1.15-1.12 1.38-.2.23-.41.26-.76.09-.35-.18-1.48-.55-2.82-1.74-1.04-.93-1.74-2.08-1.95-2.43-.2-.35-.02-.54.15-.71.16-.16.35-.41.53-.61.17-.2.23-.35.35-.58.12-.23.06-.44-.03-.61-.09-.18-.79-1.9-1.08-2.6-.29-.69-.58-.6-.79-.61h-.67c-.23 0-.61.09-.93.44-.32.35-1.23 1.2-1.23 2.93 0 1.73 1.26 3.4 1.44 3.63.18.23 2.48 3.79 6.01 5.31.84.36 1.5.58 2.01.74.84.27 1.61.23 2.22.14.68-.1 2.08-.85 2.37-1.67.29-.82.29-1.52.2-1.67-.08-.14-.31-.23-.66-.4z"/>
    </svg>
  </a>"""

clean_drawer_wa = """        <a href="https://wa.me/919820000000?text=Hi%20Magic%20Meals,%20I%20have%20a%20question%20about%20your%20meals" target="_blank" rel="noopener noreferrer" class="drawer-nav-item drawer-wa-item">💬 WhatsApp Live Support</a>"""

content = content.replace(bad_drawer_wa, clean_drawer_wa)

with open('Magic Meals – Real Indian meals in 5 minutes.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Cleaned up drawer link successfully!')
