import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('class="mobile-drawer"')
if idx != -1:
    print("=== MOBILE DRAWER HTML ===")
    end = text.find('</aside>', idx)
    if end == -1:
        end = text.find('</div>\n  </div>', idx)
    print(text[idx-20:idx+1800])

print("\n=== MOBILE DRAWER CSS ===")
for m in re.finditer(r'(\.[a-zA-Z0-9_-]*(?:drawer|mobile-menu|drawer-cat)[^{]*\{[^}]+\})', text):
    print(m.group(0))
