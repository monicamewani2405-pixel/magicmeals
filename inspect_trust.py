import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

print("HTML occurrences of trust-strip:")
for m in re.finditer(r'<div class="trust-strip">.*?</div>\s*</div>', text, re.DOTALL):
    print(m.group(0)[:400])

print("\nCSS occurrences:")
for m in re.finditer(r'\.trust-[^{]+\{[^}]+\}', text):
    print(m.group(0))
