import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

print("=== HEADER RIGHT ACTIONS ===")
idx = text.find('class="header-right-actions"')
if idx != -1:
    end = text.find('</header>', idx)
    print(text[idx:end])

print("\n=== BURGER MENU FULL HTML ===")
idx_drawer = text.find('<aside id="mobileDrawer"')
if idx_drawer != -1:
    end_drawer = text.find('</aside>', idx_drawer) + 8
    print(text[idx_drawer:end_drawer])
