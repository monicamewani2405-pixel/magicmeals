import asyncio
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch()

        # Desktop Viewport
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        await page.goto('file:///C:/Users/Monica/Desktop/magicmeals/index.html')
        await page.wait_for_timeout(600)
        
        # Screenshot top banner + promo bar
        await page.screenshot(path='check_promo_arrows_desktop.png')
        print("Captured check_promo_arrows_desktop.png")

        # Scroll to freeze drying section
        edu_sec = await page.query_selector('.edu-section-natural')
        if edu_sec:
            await edu_sec.scroll_into_view_if_needed()
            await page.wait_for_timeout(300)
            await page.screenshot(path='check_freeze_drying_desktop.png')
            print("Captured check_freeze_drying_desktop.png")

        # Mobile Viewport
        mobile_page = await browser.new_page(viewport={'width': 390, 'height': 844})
        await mobile_page.goto('file:///C:/Users/Monica/Desktop/magicmeals/index.html')
        await mobile_page.wait_for_timeout(600)

        # Screenshot top of mobile
        await mobile_page.screenshot(path='check_mobile_top_no_strip.png')
        print("Captured check_mobile_top_no_strip.png")

        # Scroll to freeze drying section on mobile
        edu_sec_mobile = await mobile_page.query_selector('.edu-section-natural')
        if edu_sec_mobile:
            await edu_sec_mobile.scroll_into_view_if_needed()
            await mobile_page.wait_for_timeout(300)
            await mobile_page.screenshot(path='check_freeze_drying_mobile.png')
            print("Captured check_freeze_drying_mobile.png")

        # Scroll to reels and reviews to check headers
        reels_sec = await mobile_page.query_selector('.customers-loved-section')
        if reels_sec:
            await reels_sec.scroll_into_view_if_needed()
            await mobile_page.wait_for_timeout(300)
            await mobile_page.screenshot(path='check_reels_header_mobile.png')
            print("Captured check_reels_header_mobile.png")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(verify())
