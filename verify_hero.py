"""Phase 2 hero verification (Playwright). Run: python verify_hero.py"""
import asyncio
from playwright.async_api import async_playwright

URL = 'file:///C:/Users/Monica/Desktop/magicmeals/index.html'
SIZES = [(360, 740), (390, 844), (768, 1024), (1024, 768), (1440, 900)]


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for w, h in SIZES:
            ctx = await b.new_context(viewport={'width': w, 'height': h})
            page = await ctx.new_page()
            errs = []
            page.on('console', lambda m: errs.append(m.text) if m.type in ('error', 'warning') else None)
            page.on('pageerror', lambda e: errs.append(str(e)))
            await page.goto(URL)
            await page.wait_for_timeout(3800)
            sw = await page.evaluate('document.documentElement.scrollWidth')
            btn = await page.evaluate("""() => { const r = document.querySelector('.hero-btn').getBoundingClientRect(); return [Math.round(r.top), Math.round(r.bottom), innerHeight]; }""")
            img = await page.evaluate("document.querySelector('.hero-pouch-img').naturalWidth")
            will = await page.evaluate("getComputedStyle(document.querySelector('.hero-pouch-img')).willChange")
            tr = await page.evaluate("getComputedStyle(document.querySelector('.hero-pouch-img')).transform")
            print(f'{w}x{h}: scrollWidth={sw} (vw {w}) btn[top,bottom,vh]={btn} imgW={img} willChange={will} imgTransform={tr} errors={errs}')
            await page.screenshot(path=f'hero_final_{w}.png')
            if w == 1440:
                await page.click('text=How It Works')
                await page.wait_for_timeout(1200)
                y1 = await page.evaluate('scrollY')
                await page.evaluate('scrollTo(0,0)')
                await page.wait_for_timeout(600)
                await page.click('text=Shop Now')
                await page.wait_for_timeout(1200)
                y2 = await page.evaluate('scrollY')
                print('  How It Works scrollY =', y1, '| Shop Now scrollY =', y2)
                # cart still works
                await page.evaluate('scrollTo(0,0)')
                await page.click('#cartOpenBtn')
                await page.wait_for_timeout(500)
                print('  cart drawer open class:', await page.evaluate("document.getElementById('cartDrawer').className"))
            await ctx.close()

        # reduced motion: static final state
        ctx = await b.new_context(viewport={'width': 1440, 'height': 900}, reduced_motion='reduce')
        page = await ctx.new_page()
        await page.goto(URL)
        await page.wait_for_timeout(500)
        tr = await page.evaluate("getComputedStyle(document.querySelector('.hero-pouch-img')).transform")
        op = await page.evaluate("getComputedStyle(document.querySelector('.hero-headline')).opacity")
        print('reduced-motion: pouch transform =', tr, '| headline opacity =', op)
        await ctx.close()

        # GSAP blocked (CDN + local) and image missing: static fallback
        ctx = await b.new_context(viewport={'width': 1440, 'height': 900})
        page = await ctx.new_page()
        await page.route('**/*gsap*', lambda r: r.abort())
        await page.route('**/ScrollTrigger*', lambda r: r.abort())
        await page.route('**/pouch_cutout_cropped.png', lambda r: r.abort())
        await page.goto(URL)
        await page.wait_for_timeout(1500)
        print('no-gsap/no-image: hero--no-image =', await page.evaluate("document.getElementById('hero').classList.contains('hero--no-image')"),
              '| headline visible =', await page.evaluate("getComputedStyle(document.querySelector('.hero-headline')).opacity"),
              '| buttons =', await page.evaluate("document.querySelectorAll('.hero-btn').length"))
        await page.screenshot(path='hero_fallback.png')
        await ctx.close()
        await b.close()

asyncio.run(main())
