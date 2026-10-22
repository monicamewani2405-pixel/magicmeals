import asyncio
from playwright.async_api import async_playwright

async def verify_final():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        
        # 1. Desktop Test
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        await page.goto('file:///C:/Users/Monica/Desktop/magicmeals/Magic%20Meals%20%E2%80%93%20Real%20Indian%20meals%20in%205%20minutes.html')
        await page.wait_for_timeout(600)
        
        # Check airplane button
        plane_btn = await page.locator('.travel-plane-btn').count()
        print('Travel airplane button count in header (should be 0):', plane_btn)
        
        # Check promo bar slides
        slide_count = await page.locator('.promo-slide').count()
        print('Promo slides count:', slide_count)
        
        # Screenshot of top header + new warm banner
        await page.screenshot(path='final_desktop_hero_banner.png')
        print('Saved final_desktop_hero_banner.png')
        
        # Wait 3.8s for promo bar to rotate
        await page.wait_for_timeout(3800)
        active_slide_text = await page.locator('.promo-slide.active').text_content()
        print('Active promo slide text after 3.8s:', active_slide_text.strip())
        
        # 2. Mobile Test
        mobile_page = await browser.new_page(viewport={'width': 390, 'height': 844})
        await mobile_page.goto('file:///C:/Users/Monica/Desktop/magicmeals/Magic%20Meals%20%E2%80%93%20Real%20Indian%20meals%20in%205%20minutes.html')
        await mobile_page.wait_for_timeout(600)
        await mobile_page.screenshot(path='final_mobile_hero_banner.png')
        print('Saved final_mobile_hero_banner.png')
        
        await browser.close()

if __name__ == '__main__':
    asyncio.run(verify_final())
