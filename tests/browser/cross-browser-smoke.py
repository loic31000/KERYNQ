"""Audit reproductible : Chromium, Firefox, WebKit, ouverture directe, CSP, zoom, clavier, PWA hors ligne.
Python Playwright requis, avec : playwright install chromium firefox webkit. Serveur local temporaire, aucun site externe."""
import functools
import http.server
import threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[2]
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('localhost',0),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
URL=f'http://localhost:{server.server_address[1]}/index.html'
OUTSIDE=[]
def watch(page):
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    # WebKit refuse aussi de lire le manifeste en ouverture directe : sans effet, l'installation exige HTTPS.
    # WebKit signale un style interne de ses <select> : seule la signature exacte, contrôlée ci-dessous, est tolérée.
    page.on('console',lambda m:errors.append(m.text) if m.type=='error' and not (page.context.browser.browser_type.name=='webkit' and (m.text.startswith('Refused to apply a stylesheet') or (page.url.startswith('file:') and (m.text.startswith('Origin null') or m.text.startswith('Failed to load resource: Origin null'))))) else None)
    page.on('requestfailed',lambda q:errors.append('Échec : '+q.url) if not q.url.endswith('manifest.webmanifest') else None)
    page.add_init_script("window.kerynqCsp=[];document.addEventListener('securitypolicyviolation',e=>window.kerynqCsp.push(e.violatedDirective+'|'+e.target.nodeName))")
    # Aucune requête ne doit quitter le serveur local au chargement.
    page.on('request',lambda r:OUTSIDE.append(r.url) if r.url.startswith('http') and not r.url.startswith(URL.rsplit('/',1)[0]) else None)
    return errors
def overflow(page):
    return page.evaluate('document.documentElement.scrollWidth-document.documentElement.clientWidth')
def assert_csp(page,engine,label):
    seen=set(page.evaluate('window.kerynqCsp'))
    assert seen<=({'style-src-attr|SELECT'} if engine=='webkit' else set()),(label,seen)
def journey(page,label):
    page.locator('#topic').fill('Sujet')
    assert page.locator('#queryPreview').text_content()=='Sujet',label
    page.locator('#domainToggle').click()
    assert page.locator('.domain-option').count()==39,label
    page.keyboard.press('Escape')
    page.locator('#libraryToggle').click();assert page.locator('#libraryPanel').is_visible(),label;page.locator('#libraryClose').click()
    page.locator('#fileToggle').click();assert page.locator('#fileDrop').is_visible(),label;page.locator('#fileClose').click()
    page.locator('#refineToggle').click();assert page.locator('#refinePanel').is_visible(),label;page.locator('#refineClose').click()
    page.locator('#themeToggle').click();page.locator('[data-theme-choice="cyber"]').click();page.keyboard.press('Escape')
    assert page.evaluate('document.documentElement.dataset.theme')=='cyber',label
    icon=page.evaluate("(()=>{const s=getComputedStyle(document.querySelector('.run-search'),'::after');return s.maskImage||s.webkitMaskImage})()")
    assert icon.startswith('url("data:image/svg'),(label,icon)
    assert overflow(page)<=2,(label,overflow(page))
with sync_playwright() as p:
    for engine in ('chromium','firefox','webkit'):
        browser=getattr(p,engine).launch()
        for width in (1440,390,320):
            page=browser.new_page(viewport={'width':width,'height':850});errors=watch(page)
            page.goto(URL);journey(page,(engine,width));assert_csp(page,engine,width)
            assert not errors,(engine,width,errors)
            page.close()
        page=browser.new_page();errors=watch(page)
        page.goto((ROOT/'index.html').as_uri());journey(page,(engine,'file'));assert_csp(page,engine,'file')
        assert not errors,(engine,'file',errors)
        browser.close()
        print('PASS',engine,'1440/390/320 et ouverture directe, sans erreur ni blocage CSP')
    assert not OUTSIDE,OUTSIDE
    browser=p.chromium.launch()
    # 200 % et 400 % sur un écran de 1280 px, toutes options ouvertes.
    for zoom,width,height in ((200,640,400),(400,320,256)):
        page=browser.new_page(viewport={'width':width,'height':height});page.goto(URL)
        page.locator('#tabPrompt').click();page.locator('#topic').fill('x');page.locator('#refineToggle').click();page.evaluate("document.querySelectorAll('details').forEach(d=>d.open=true)")
        assert overflow(page)<=2,(zoom,overflow(page))
        page.close()
    print('PASS reflow équivalent zoom 200 % et 400 %')
    # Clavier et structure.
    page=browser.new_page(viewport={'width':1280,'height':800});page.goto(URL)
    reached=0
    for _ in range(45):
        page.keyboard.press('Tab')
        if page.evaluate('document.activeElement===document.body'):break
        reached+=1
        style=page.evaluate('getComputedStyle(document.activeElement).outlineStyle')
        assert style!='none',page.evaluate('document.activeElement.outerHTML.slice(0,90)')
    assert reached>=10,reached
    assert page.evaluate("[...document.querySelectorAll('button,select,input,textarea')].filter(e=>e.type!=='file'&&!(e.getAttribute('aria-label')||e.getAttribute('aria-labelledby')||e.labels?.length||e.textContent.trim())).length")==0
    assert page.evaluate("(()=>{const a=[...document.querySelectorAll('[id]')].map(e=>e.id);return a.filter((x,i)=>a.indexOf(x)!==i).length})()")==0
    page.close()
    print('PASS focus visible sur toute la séquence de tabulation, contrôles nommés, identifiants uniques')
    # PWA : cache, hors ligne, purge d'un ancien cache.
    ctx=browser.new_context();page=ctx.new_page();page.goto(URL)
    page.evaluate("()=>caches.open('kerynq-static-ancien').then(c=>c.put('/ancien',new Response('x')))")
    page.evaluate('()=>navigator.serviceWorker.ready.then(()=>1)');page.reload()
    page.wait_for_function("()=>caches.keys().then(k=>k.length===1)")
    ctx.set_offline(True);page.reload()
    page.locator('#topic').fill('Hors ligne')
    assert page.locator('#queryPreview').text_content()=='Hors ligne'
    assert page.evaluate('getComputedStyle(document.querySelector(".composer")).borderRadius')!='0px'
    ctx.set_offline(False)
    cdp=ctx.new_cdp_session(page)
    print('Installabilité Chromium :',cdp.send('Page.getInstallabilityErrors').get('installabilityErrors') or 'aucune erreur signalée')
    ctx.close();browser.close()
    print('PASS PWA localhost : cache, purge, fonctionnement hors ligne')
server.shutdown()
