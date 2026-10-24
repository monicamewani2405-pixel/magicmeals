# -*- coding: utf-8 -*-
with open('apply_requested_4_fixes.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if 'target_js_insert =' in line:
        new_lines.append("    target_js_insert = 'initPromoBar();'\n")
    else:
        new_lines.append(line)

with open('apply_requested_4_fixes.py', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Updated apply_requested_4_fixes.py")
