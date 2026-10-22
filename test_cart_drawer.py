import sys
import asyncio
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

async def test_cart_drawer():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        await page.goto('file:///C:/Users/Monica/Desktop/magicmeals/Magic%20Meals%20%E2%80%93%20Real%20Indian%20meals%20in%205%20minutes.html')
        await page.wait_for_timeout(600)
        
        # Click Cart Icon to open Cart Drawer
        await page.click('#cartOpenBtn')
        await page.wait_for_timeout(400)
        
        # Capture screenshot of open Cart Drawer
        await page.screenshot(path='cart_drawer_opened_verified.png')
        print('Saved cart_drawer_opened_verified.png')
        
        # Test close button
        await page.click('#closeDrawerBtn')
        await page.wait_for_timeout(300)
        await page.screenshot(path='cart_drawer_closed_verified.png')
        print('Saved cart_drawer_closed_verified.png')
        
        await browser.close()

if __name__ == '__main__':
    asyncio.run(test_cart_drawer())
