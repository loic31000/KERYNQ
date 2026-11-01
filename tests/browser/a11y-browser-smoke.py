"""Smoke tests KERYNQ clavier et reflow, Chromium et Python Playwright requis."""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[2]
html=(root/'index.html').read_text(encoding='utf-8')
for core in ['assets/js/core/search-query-core.js','assets/js/core/privacy-core.js','assets/js/core/source-packs-core.js','assets/js/core/catalog-core.js','assets/js/app.js']:
    html=html.replace(f'<script src="./{core}"></script>', '<script>'+ (root/core).read_text(encoding='utf-8')+'</script>')
html=html.replace('<link rel="stylesheet" href="./assets/css/styles.css">','<style>'+(root/'assets/css/styles.css').read_text(encoding='utf-8')+'</style>')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    for width in (1440,390,320):
        page=browser.new_page(viewport={'width':width,'height':850}, reduced_motion='reduce')
        errors=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.set_content(html,wait_until='load')
        page.locator('#modeSimple').click()
        cats=page.locator('.category-btn')
        cats.nth(1).focus();cats.nth(1).press('Enter')
        assert page.evaluate('document.activeElement?.classList.contains("category-btn")')
        quick=page.locator('.quick-filter').first
        quick.focus();quick.press('Space')
        assert page.evaluate('document.activeElement?.classList.contains("quick-filter")')
        page.locator('#modeAdvanced').click()
        goal=page.locator('.goal-btn').nth(1)
        goal.focus();goal.press('Enter')
        assert page.evaluate('document.activeElement?.classList.contains("goal-btn")')
        page.locator('#tabPrompt').click()
        assert page.locator('#tabPrompt').get_attribute('tabindex')=='0'
        assert page.locator('#tabWeb').get_attribute('tabindex')=='-1'
        page.locator('#tabPrompt').focus();page.keyboard.press('ArrowRight')
        assert page.evaluate('document.activeElement.id')=='tabWeb'
        assert page.locator('#tabWeb').get_attribute('aria-selected')=='true'
        page.keyboard.press('Home')
        assert page.evaluate('document.activeElement.id')=='tabPrompt'
        page.keyboard.press('End')
        assert page.evaluate('document.activeElement.id')=='tabWeb'
        page.locator('#manageTemplates').click()
        assert page.locator('#manageTemplates').get_attribute('aria-expanded')=='true'
        assert page.evaluate('document.activeElement.id')=='templateName'
        page.locator('#manageTemplates').click()
        assert page.locator('#templateManager').is_hidden()
        page.locator('#modeSimple').click()
        if width<=390:
            page.locator('#jumpToResult').click()
            assert page.evaluate('document.activeElement.id') in ('tabPrompt','tabWeb')
        dims=page.evaluate('({scroll:document.documentElement.scrollWidth,view:document.documentElement.clientWidth})')
        assert dims['scroll']<=dims['view']+2,(width,dims)
        assert not errors,(width,errors)
        print('BROWSER PASS',width)
        page.close()
    browser.close()
