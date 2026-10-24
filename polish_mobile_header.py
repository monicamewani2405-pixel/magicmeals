# -*- coding: utf-8 -*-

for fname in ['index.html', 'Magic Meals – Real Indian meals in 5 minutes.html']:
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()

    old_target = """    @media (max-width: 600px) {
      .auth-nav-btn {
        padding: 8px;
        border-radius: 50%;
        background: transparent;
        border: none;
      }
      .auth-btn-text {
        display: none;
      }
    }"""

    new_target = """    @media (max-width: 600px) {
      .header-inner {
        height: 62px;
        gap: 6px;
        padding: 0 8px;
      }
      .original-logo-img {
        height: 32px;
        max-width: 100px;
      }
      .header-right-actions {
        gap: 3px;
      }
      .jain-toggle {
        padding: 4px 7px;
        font-size: 11px;
        gap: 4px;
      }
      .icon-btn {
        width: 32px;
        height: 32px;
        padding: 0;
      }
      .icon-btn svg {
        width: 17px;
        height: 17px;
      }
      .auth-nav-btn {
        width: 32px;
        height: 32px;
        padding: 0;
        border-radius: 8px;
        background: transparent;
        border: none;
        display: grid;
        place-items: center;
      }
      .auth-btn-text {
        display: none;
      }
    }"""

    assert old_target in content, f"old_target not found in {fname}"
    content = content.replace(old_target, new_target, 1)

    with open(fname, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Added mobile header polish to {fname}")
