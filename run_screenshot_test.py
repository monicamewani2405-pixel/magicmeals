import asyncio
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        
        # 1. Homepage Loved by Our Customers
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        await page.goto('file:///C:/Users/Monica/Desktop/magicmeals/Magic%20Meals%20%E2%80%93%20Real%20Indian%20meals%20in%205%20minutes.html')
        await page.wait_for_timeout(500)
        
        reels = page.locator('.customers-loved-section')
        await reels.scroll_into_view_if_needed()
        await page.wait_for_timeout(400)
        await page.screenshot(path='reels_section_authentic.png')
        print('Saved reels_section_authentic.png')
        
        # 2. Shop page clean
        page_shop = await browser.new_page(viewport={'width': 1280, 'height': 800})
        await page_shop.goto('file:///C:/Users/Monica/Desktop/magicmeals/Magic%20Meals%20%E2%80%93%20Real%20Indian%20meals%20in%205%20minutes.html#shop')
        await page_shop.wait_for_timeout(500)
        await page_shop.screenshot(path='shop_page_clean.png')
        print('Saved shop_page_clean.png')
        
        # 3. Test clicking 'Rice' on top header from shop page
        await page_shop.click('nav.header-desktop-categories a[data-cat="Rice"]')
        await page_shop.wait_for_timeout(400)
        await page_shop.screenshot(path='shop_page_rice_filtered.png')
        print('Saved shop_page_rice_filtered.png')
        
        await browser.close()

if __name__ == '__main__':
    asyncio.run(verify())
