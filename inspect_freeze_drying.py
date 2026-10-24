import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('The Magic of Freeze-Drying')
if idx != -1:
    start = text.rfind('<section', 0, idx)
    end = text.find('</section>', idx) + 10
    print("=== FREEZE DRYING SECTION HTML ===")
    print(text[start:end])

print("\n=== FREEZE DRYING CSS ===")
for m in re.finditer(r'/\* ==+ FREEZE DRYING[^*]*\*/.*?(?=/\* =|$)', text, re.DOTALL):
    print(m.group(0)[:1500])
