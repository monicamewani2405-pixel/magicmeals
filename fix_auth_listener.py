# -*- coding: utf-8 -*-

for fname in ['index.html', 'Magic Meals – Real Indian meals in 5 minutes.html']:
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()

    old_auth_script = """      // Auth Modal Open/Close & Tabs
      const authOpenBtn = document.getElementById('authOpenBtn');
      const authModalBackdrop = document.getElementById('authModalBackdrop');
      const authModalCloseBtn = document.getElementById('authModalCloseBtn');
      const tabSignInBtn = document.getElementById('tabSignInBtn');
      const tabSignUpBtn = document.getElementById('tabSignUpBtn');
      const signInForm = document.getElementById('signInForm');
      const signUpForm = document.getElementById('signUpForm');

      if (authOpenBtn && authModalBackdrop) {
        authOpenBtn.addEventListener('click', () => {
          authModalBackdrop.classList.add('open');
        });
        if (authModalCloseBtn) {
          authModalCloseBtn.addEventListener('click', () => {
            authModalBackdrop.classList.remove('open');
          });
        }
        authModalBackdrop.addEventListener('click', (e) => {
          if (e.target === authModalBackdrop) {
            authModalBackdrop.classList.remove('open');
          }
        });
        if (tabSignInBtn && tabSignUpBtn) {
          tabSignInBtn.addEventListener('click', () => {
            tabSignInBtn.classList.add('active');
            tabSignUpBtn.classList.remove('active');
            signInForm.style.display = 'block';
            signUpForm.style.display = 'none';
          });
          tabSignUpBtn.addEventListener('click', () => {
            tabSignUpBtn.classList.add('active');
            tabSignInBtn.classList.remove('active');
            signInForm.style.display = 'none';
            signUpForm.style.display = 'block';
          });
        }
      }"""

    new_auth_script = """      // Auth Modal Open/Close & Tabs (Delegated on document)
      document.addEventListener('click', (e) => {
        const authBtn = e.target.closest('#authOpenBtn');
        if (authBtn) {
          const backdrop = document.getElementById('authModalBackdrop');
          if (backdrop) {
            backdrop.classList.add('open');
            document.body.style.overflow = 'hidden';
          }
          return;
        }
        const closeBtn = e.target.closest('#authModalCloseBtn');
        if (closeBtn) {
          const backdrop = document.getElementById('authModalBackdrop');
          if (backdrop) {
            backdrop.classList.remove('open');
            document.body.style.overflow = '';
          }
          return;
        }
        const backdrop = document.getElementById('authModalBackdrop');
        if (backdrop && e.target === backdrop) {
          backdrop.classList.remove('open');
          document.body.style.overflow = '';
          return;
        }
        if (e.target.closest('#tabSignInBtn')) {
          document.getElementById('tabSignInBtn')?.classList.add('active');
          document.getElementById('tabSignUpBtn')?.classList.remove('active');
          const sIn = document.getElementById('signInForm');
          const sUp = document.getElementById('signUpForm');
          if (sIn) sIn.style.display = 'block';
          if (sUp) sUp.style.display = 'none';
          return;
        }
        if (e.target.closest('#tabSignUpBtn')) {
          document.getElementById('tabSignUpBtn')?.classList.add('active');
          document.getElementById('tabSignInBtn')?.classList.remove('active');
          const sIn = document.getElementById('signInForm');
          const sUp = document.getElementById('signUpForm');
          if (sIn) sIn.style.display = 'none';
          if (sUp) sUp.style.display = 'block';
          return;
        }
      });"""

    assert old_auth_script in content, f"old_auth_script not found in {fname}"
    content = content.replace(old_auth_script, new_auth_script, 1)

    with open(fname, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Fixed auth script in {fname}")
