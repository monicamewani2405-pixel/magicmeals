import sys
import asyncio
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

async def test_3_changes():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        
        # 1. Desktop Test
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        await page.goto('file:///C:/Users/Monica/Desktop/magicmeals/Magic%20Meals%20%E2%80%93%20Real%20Indian%20meals%20in%205%20minutes.html')
        await page.wait_for_timeout(600)
        
        # Capture Desktop Header + Unobstructed Banner
        await page.screenshot(path='desktop_unobstructed_banner.png')
        print('Saved desktop_unobstructed_banner.png')
        
        # WhatsApp button element screenshot
        wa_btn = page.locator('.whatsapp-float-btn')
        await wa_btn.screenshot(path='whatsapp_button_verified.png')
        print('Saved whatsapp_button_verified.png')
        
        # 2. Mobile Test
        mobile_page = await browser.new_page(viewport={'width': 390, 'height': 844})
        await mobile_page.goto('file:///C:/Users/Monica/Desktop/magicmeals/Magic%20Meals%20%E2%80%93%20Real%20Indian%20meals%20in%205%20minutes.html')
        await mobile_page.wait_for_timeout(600)
        await mobile_page.screenshot(path='mobile_unobstructed_banner.png')
        print('Saved mobile_unobstructed_banner.png')
        
        # Open mobile drawer to verify category order
        await mobile_page.click('#mobileMenuOpenBtn')
        await mobile_page.wait_for_timeout(350)
        await mobile_page.screenshot(path='mobile_drawer_rice_first.png')
        print('Saved mobile_drawer_rice_first.png')
        
        await browser.close()

if __name__ == '__main__':
    asyncio.run(test_3_changes())
