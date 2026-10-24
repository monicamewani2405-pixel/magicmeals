import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

print("=== Section 1 (Video Reels) ===")
m1 = re.search(r'<section class="customers-loved-section">.*?</section>', text, re.DOTALL)
if m1:
    print(m1.group(0)[:600])

print("\n=== Section 2 (Customer Reviews) ===")
idx2 = text.find('Loved by Travelers & Students')
if idx2 != -1:
    s = text.rfind('<section', 0, idx2)
    e = text.find('</section>', idx2) + 10
    print(text[s:s+600])
