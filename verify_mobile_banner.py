import sys
import asyncio
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

async def test_mobile_banner():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        # Typical mobile device (iPhone 12/13/14 viewport)
        page = await browser.new_page(viewport={'width': 390, 'height': 844})
        await page.goto('file:///C:/Users/Monica/Desktop/magicmeals/Magic%20Meals%20%E2%80%93%20Real%20Indian%20meals%20in%205%20minutes.html')
        await page.wait_for_timeout(600)
        
        # Take mobile viewport screenshot
        await page.screenshot(path='mobile_banner_fixed_verified.png')
        print('Saved mobile_banner_fixed_verified.png')
        
        # Check desktop as well to ensure desktop banner remains pristine
        page_desktop = await browser.new_page(viewport={'width': 1280, 'height': 800})
        await page_desktop.goto('file:///C:/Users/Monica/Desktop/magicmeals/Magic%20Meals%20%E2%80%93%20Real%20Indian%20meals%20in%205%20minutes.html')
        await page_desktop.wait_for_timeout(600)
        await page_desktop.screenshot(path='desktop_banner_verified.png')
        print('Saved desktop_banner_verified.png')
        
        await browser.close()

if __name__ == '__main__':
    asyncio.run(test_mobile_banner())
