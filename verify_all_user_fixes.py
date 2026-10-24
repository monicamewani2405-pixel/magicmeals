import asyncio
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch()

        # 1. Desktop Check
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        await page.goto('file:///C:/Users/Monica/Desktop/magicmeals/index.html')
        await page.wait_for_timeout(600)

        # Desktop header with Sign In option between Search and Cart
        await page.screenshot(path='check_desktop_header_auth.png')
        print("Captured check_desktop_header_auth.png")

        # Click Sign In button to test auth modal
        await page.click('#authOpenBtn')
        await page.wait_for_timeout(400)
        await page.screenshot(path='check_desktop_auth_modal.png')
        print("Captured check_desktop_auth_modal.png")

        # Close auth modal
        await page.click('#authModalCloseBtn')
        await page.wait_for_timeout(300)

        # Scroll down through titles to verify left alignment & no descriptions
        await page.evaluate('window.scrollTo(0, 500)')
        await page.wait_for_timeout(400)
        await page.screenshot(path='check_titles_bestsellers_combos.png')
        print("Captured check_titles_bestsellers_combos.png")

        await page.evaluate('window.scrollTo(0, 1600)')
        await page.wait_for_timeout(400)
        await page.screenshot(path='check_titles_freezedrying_reels.png')
        print("Captured check_titles_freezedrying_reels.png")

        # 2. Mobile Check
        m_page = await browser.new_page(viewport={'width': 390, 'height': 844})
        await m_page.goto('file:///C:/Users/Monica/Desktop/magicmeals/index.html')
        await m_page.wait_for_timeout(600)

        # Mobile header
        await m_page.screenshot(path='check_mobile_header_auth.png')
        print("Captured check_mobile_header_auth.png")

        # Open mobile burger menu
        await m_page.click('#mobileMenuOpenBtn')
        await m_page.wait_for_timeout(400)
        await m_page.screenshot(path='check_mobile_burger_modern.png')
        print("Captured check_mobile_burger_modern.png")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(verify())
