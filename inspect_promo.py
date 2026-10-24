import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('Free Express Delivery')
if idx != -1:
    print("=== Found Promo bar ===")
    start = text.rfind('<', 0, idx - 100)
    end = text.find('</nav>', idx)
    if end == -1:
        end = text.find('</header>', idx)
    print(text[start:idx+400])

print("\n=== Searching for CSS of announcement or promo ===")
for m in re.finditer(r'(\.[a-zA-Z0-9_-]*(?:promo|announcement|ticker|slider|arrow|chevron)[^{]*\{[^}]+\})', text, re.IGNORECASE):
    print(m.group(0))
