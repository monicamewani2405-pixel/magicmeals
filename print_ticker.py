import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('class="ticker-bar"')
if start != -1:
    end = text.find('</nav>', start)
    print(text[start-10:end])
