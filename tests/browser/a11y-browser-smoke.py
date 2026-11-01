"""Smoke tests KERYNQ clavier et reflow, Chromium et Python Playwright requis."""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[2]
def serve(route):
    url=route.request.url
    file=root/url.replace('http://kerynq.test/','').split('?')[0]
    if url.startswith('http://kerynq.test/') and file.is_file():route.fulfill(body=file.read_bytes(),content_type={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml'}.get(file.suffix,'application/json'))
    else:route.abort()
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    for width in (1440,768,390,320):
        page=browser.new_page(viewport={'width':width,'height':850}, reduced_motion='reduce')
        errors=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.route('**/*',serve);page.goto('http://kerynq.test/index.html')
        # Sélecteur de domaine : flèches, Entrée, focus rendu, Échap.
        page.locator('#domainToggle').focus();page.keyboard.press('Enter')
        assert page.evaluate('document.activeElement.id')=='categorySearch'
        assert page.locator('#categorySearch').get_attribute('role')=='combobox'
        page.keyboard.type('log')
        assert page.locator('#categorySearch').get_attribute('aria-activedescendant')=='domain-housing'
        page.locator('#categorySearch').fill('droit')
        assert page.locator('[role=option]').count()==1
        active=page.locator('#categorySearch').get_attribute('aria-activedescendant')
        assert active=='domain-law',active
        page.keyboard.press('Enter')
        assert page.evaluate('document.activeElement.id')=='domainToggle' and page.locator('#domainPanel').is_hidden()
        assert 'Droit' in page.locator('#domainName').inner_text()
        page.keyboard.press('Enter');page.keyboard.press('ArrowDown')
        moved=page.locator('#categorySearch').get_attribute('aria-activedescendant')
        assert moved and moved!='domain-law'
        page.keyboard.press('Escape')
        assert page.locator('#domainPanel').is_hidden() and page.evaluate('document.activeElement.id')=='domainToggle'
        assert 'Droit' in page.locator('#domainName').inner_text()
        # Réglages : ouverture à la demande, en mode IA.
        page.locator('#tabPrompt').click()
        toggle=page.locator('#refineToggle');assert page.locator('#refinePanel').is_hidden()
        toggle.focus();page.keyboard.press('Enter')
        assert toggle.get_attribute('aria-expanded')=='true' and page.locator('#refinePanel').is_visible()
        assert page.evaluate('document.activeElement.id')=='refineToggle'
        page.evaluate("document.querySelectorAll('#refinePanel details').forEach(d=>d.open=true)")
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
        if width<=390:
            page.locator('#jumpToResult').click()
            assert page.evaluate('document.activeElement.id') in ('tabPrompt','tabWeb')
        dims=page.evaluate('({scroll:document.documentElement.scrollWidth,view:document.documentElement.clientWidth})')
        assert dims['scroll']<=dims['view']+2,(width,dims)
        assert not errors,(width,errors)
        print('BROWSER PASS',width)
        page.close()
    browser.close()
