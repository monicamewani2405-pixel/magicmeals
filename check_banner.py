import re

with open('Magic Meals – Real Indian meals in 5 minutes.html', 'r', encoding='utf-8') as f:
    text = f.read()

print('Searching for magic_hero in html:')
for m in re.finditer(r'magic_hero[^\s"\'<>]+', text):
    print(m.group(0))

print('\nSearching for hero-banner in html:')
for m in re.finditer(r'<section class="hero-banner-section".*?</section>', text, re.DOTALL):
    print(m.group(0))

print('\nSearching for hero css:')
for m in re.finditer(r'\.hero-banner-card\s*\{[^}]+\}', text):
    print(m.group(0))

for m in re.finditer(r'@media[^{]+\{[^}]*hero-banner[^}]*\}', text):
    print(m.group(0))
