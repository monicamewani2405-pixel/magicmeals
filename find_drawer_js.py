import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
print("JS occurrences:")
for m in re.finditer(r'[^\n]*drawer-cat[^\n]*', text):
    line = m.group(0)
    if 'function' in line or 'addEventListener' in line or 'querySelector' in line or 'classList' in line or 'dataset' in line:
        print(line.strip())
