# -*- coding: utf-8 -*-
import re

with open('Magic Meals – Real Indian meals in 5 minutes.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. FIX CART DRAWER Z-INDEX ISSUE
# Increase z-index so cart drawer and overlay are strictly ABOVE the sticky header (which is z-index: 100)
content = content.replace(
    '.drawer-overlay {\n      position: fixed;\n      inset: 0;\n      background: rgba(31, 26, 23, 0.55);\n      backdrop-filter: blur(4px);\n      z-index: 40;',
    '.drawer-overlay {\n      position: fixed;\n      inset: 0;\n      background: rgba(31, 26, 23, 0.55);\n      backdrop-filter: blur(4px);\n      z-index: 200;'
)

content = content.replace(
    '.cart-drawer {\n      position: fixed;\n      right: 0;\n      top: 0;\n      bottom: 0;\n      width: min(440px, 100%);\n      background: #FFFFFF;\n      z-index: 41;',
    '.cart-drawer {\n      position: fixed;\n      right: 0;\n      top: 0;\n      bottom: 0;\n      width: min(440px, 100%);\n      background: #FFFFFF;\n      z-index: 210;'
)

# Also ensure mobile drawer is z-index 210 and its backdrop is 200
content = content.replace(
    '.mobile-drawer-backdrop {\n      position: fixed;\n      inset: 0;\n      background: rgba(0, 0, 0, 0.55);\n      backdrop-filter: blur(4px);\n      -webkit-backdrop-filter: blur(4px);\n      z-index: 100;',
    '.mobile-drawer-backdrop {\n      position: fixed;\n      inset: 0;\n      background: rgba(0, 0, 0, 0.55);\n      backdrop-filter: blur(4px);\n      -webkit-backdrop-filter: blur(4px);\n      z-index: 200;'
)

content = content.replace(
    '.mobile-drawer {\n      position: fixed;\n      top: 0;\n      left: 0;\n      bottom: 0;\n      width: 320px;\n      max-width: 86vw;\n      background: #FFFFFF;\n      z-index: 105;',
    '.mobile-drawer {\n      position: fixed;\n      top: 0;\n      left: 0;\n      bottom: 0;\n      width: 320px;\n      max-width: 86vw;\n      background: #FFFFFF;\n      z-index: 210;'
)

content = content.replace(
    '.whatsapp-float-btn {\n      position: fixed;\n      bottom: 24px;\n      right: 24px;\n      z-index: 95;',
    '.whatsapp-float-btn {\n      position: fixed;\n      bottom: 24px;\n      right: 24px;\n      z-index: 90;'
)

content = content.replace(
    '.video-modal-backdrop {\n      position: fixed;\n      inset: 0;\n      background: rgba(0, 0, 0, 0.85);\n      backdrop-filter: blur(8px);\n      z-index: 120;',
    '.video-modal-backdrop {\n      position: fixed;\n      inset: 0;\n      background: rgba(0, 0, 0, 0.85);\n      backdrop-filter: blur(8px);\n      z-index: 220;'
)

# 2. REMOVE EVERY OCCURRENCE OF "ready in 5m", "ready in 5 minutes", "5-minute", etc.

# Title & Meta Description
content = content.replace(
    '<title>Magic Meals – Real Indian Meals in 5 Minutes | Perfect for Travel, Office & Home</title>',
    '<title>Magic Meals – Real Indian Comfort Food | 100% Natural & Freeze-Dried</title>'
)

content = content.replace(
    'content="Authentic Indian comfort meals ready in 5 minutes. 100% natural, freeze-dried with zero preservatives. Perfect for travel, international flights, hostels and office."',
    'content="Authentic Indian comfort food. 100% natural, freeze-dried with zero chemical preservatives. Just add hot water. Perfect for travel, office and home."'
)

# Promo announcement bar
content = content.replace(
    '<span>🍲 Real Indian Comfort Meals Ready in 5 Minutes</span>',
    '<span>🍲 Real Homestyle Indian Comfort Food • Just Add Hot Water</span>'
)

# Footer / Brand description
content = content.replace(
    '<p>Real homestyle Indian comfort meals ready in just 5 minutes with hot water. Freeze-dried with zero chemical preservatives and packed with authentic nutrition.</p>',
    '<p>Real homestyle Indian comfort meals made with pure ghee and natural ingredients. Freeze-dried with zero chemical preservatives and packed with authentic nutrition.</p>'
)

# Review quote
content = content.replace(
    'Ready in 5 minutes and tastes 100% authentic!',
    'Tastes 100% authentic like mom’s cooking!'
)

# Product Card badge: <span class="badge-time">Ready in 5m</span> -> Remove completely
content = content.replace('<span class="badge-time">Ready in 5m</span>', '')

# Hero banner alt
content = content.replace(
    'alt="Magic Meals Real Indian Meals in 5 Minutes"',
    'alt="Magic Meals Authentic Indian Comfort Food"'
)

# Trust Highlights strip
content = content.replace(
    '<span>Ready in 5 Mins with Hot Water</span>',
    '<span>Just Add Hot Water • No Cooking Needed</span>'
)

# Customer Review video dish tag
content = content.replace(
    '<span class="reel-dish-tag">Quick Dal Khichdi in 5 Mins</span>',
    '<span class="reel-dish-tag">Comforting Dal Khichdi</span>'
)

# PDP prep badge / instructions
content = content.replace(
    '<span>Ready in 5 Mins</span>',
    '<span>Quick & Easy</span>'
)
content = content.replace(
    'and let rest for 5 minutes.',
    'and let rest until fully hydrated.'
)

# Empty cart text
content = content.replace(
    'Pick your favorite 5-minute dishes and fill your travel box!',
    'Pick your favorite homestyle dishes and fill your box!'
)

with open('Magic Meals – Real Indian meals in 5 minutes.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Successfully applied cart drawer z-index fix and removed all ready in 5m mentions!')
