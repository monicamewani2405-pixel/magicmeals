with open('Magic Meals – Real Indian meals in 5 minutes.html', 'r', encoding='utf-8') as f:
    text = f.read()

print('main app in text:', 'id="app"' in text)
print('open aside count:', text.count('<aside'))
print('close aside count:', text.count('</aside>'))
