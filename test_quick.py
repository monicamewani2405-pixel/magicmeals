import asyncio
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        
        # 1. Desktop Home
        page = await b.new_page(viewport={'width': 1280, 'height': 800})
        await page.goto('file:///C:/Users/Monica/Desktop/magicmeals/index.html')
        await page.wait_for_timeout(500)
        await page.screenshot(path='check_header_no_active_rice.png')
        print('Captured check_header_no_active_rice.png')

        # 2. Click Rice to verify it highlights on shop page
        await page.click("a.header-cat-link[data-cat='Rice']")
        await page.wait_for_timeout(400)
        await page.screenshot(path='check_rice_active_on_shop.png')
        print('Captured check_rice_active_on_shop.png')

        # 3. Check mobile header
        m_page = await b.new_page(viewport={'width': 390, 'height': 844})
        await m_page.goto('file:///C:/Users/Monica/Desktop/magicmeals/index.html')
        await m_page.wait_for_timeout(500)
        await m_page.screenshot(path='check_mobile_header_icon_only.png')
        print('Captured check_mobile_header_icon_only.png')

        await b.close()

if __name__ == '__main__':
    asyncio.run(verify())
