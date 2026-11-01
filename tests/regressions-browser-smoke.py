"""Non-régression KERYNQ avec stockage réel : favoris, modèles, raccourcis, focus. Python Playwright et Chromium requis."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
ORIGIN='http://kerynq.test/'
TYPES={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webmanifest':'application/json'}
GOOD=lambda id,topic,**settings:{'id':id,'name':topic,'topic':topic,'folder':'Général','category':'Tous les sujets','pinned':False,'settings':{'topic':topic,**settings}}
def serve(route):
    path=route.request.url.replace(ORIGIN,'').split('?')[0] or 'index.html'
    file=ROOT/path
    if file.is_file(): route.fulfill(body=file.read_bytes(),content_type=TYPES.get(file.suffix,'text/plain'))
    else: route.fulfill(status=404,body='')
def open_app(browser,width,storage=None):
    ctx=browser.new_context(viewport={'width':width,'height':850},reduced_motion='reduce',service_workers='block')
    ctx.route('**/*',lambda route:serve(route) if route.request.url.startswith(ORIGIN) else route.abort())
    ctx.add_init_script('if(!sessionStorage.seeded){sessionStorage.seeded=1;for(const [k,v] of Object.entries(%s))localStorage.setItem(k,v)}'%json.dumps({k:json.dumps(v) for k,v in (storage or {}).items()}))
    page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(ORIGIN+'index.html');page.locator('#modeAdvanced').click()
    page.evaluate("document.querySelectorAll('details').forEach(d=>d.open=true)")
    return ctx,page,errors
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=os.environ.get('KERYNQ_CHROMIUM') or None)
    for width in (1440,320):
        # Une entrée invalide ne masque ni n'écrase les favoris valides.
        ctx,page,errors=open_app(browser,width,{'kerynq-saved-v1':[{'id':1,'settings':{}},GOOD('ok','Favori sain')]})
        assert page.locator('.saved-entry').count()==1
        assert 'ignorée' in page.locator('#status').inner_text()
        page.locator('#topic').fill('Nouveau');page.locator('#saveResearch').click()
        assert page.locator('.saved-entry').count()==2
        assert 'Favori sain' in page.locator('#savedList').inner_text()
        assert not errors,errors;ctx.close()
        # Ctrl+Entrée lance la recherche sans copier la consigne.
        ctx,page,errors=open_app(browser,width)
        page.locator('#topic').fill('Sujet')
        page.evaluate("()=>{document.execCommand=()=>{window.kerynqTestCopy=true;return true}}")
        with ctx.expect_page():page.keyboard.press('Control+Enter')
        page.wait_for_timeout(300)
        assert page.evaluate('window.kerynqTestCopy===undefined')
        assert len(ctx.pages)==2,len(ctx.pages)
        assert not errors,errors;ctx.close()
        # Un favori ou un modèle restaure la recherche, pas les préférences.
        prefs={'theme':'light','largeText':True,'aiProvider':'claude'}
        ctx,page,errors=open_app(browser,width,{'kerynq-saved-v1':[GOOD('f','Favori',engine='brave',**prefs)],'kerynq-v5-templates':[{'id':'t','label':'Modele','settings':{'topic':'Modele',**prefs}}]})
        def assert_prefs():
            assert page.evaluate('document.documentElement.dataset.theme')=='dark'
            assert not page.evaluate("document.body.classList.contains('large-text')")
            assert page.locator('#aiProvider').input_value()=='chatgpt'
            assert page.evaluate('document.body.dataset.mode')=='advanced'
        page.locator('.saved-load').click()
        assert page.locator('#topic').input_value()=='Favori' and page.locator('#engineSelect').input_value()=='brave'
        assert_prefs()
        page.locator('#manageTemplates').click();page.locator('#customTemplates .btn').click()
        assert_prefs()
        assert not errors,errors;ctx.close()
        # Les sites ignorés sont signalés.
        ctx,page,errors=open_app(browser,width)
        page.locator('#topic').fill('Sujet');page.locator('#includeSites').fill('a.fr b.fr, ameli.fr')
        compat=page.locator('#queryCompatibility').inner_text()
        assert 'Sites ignorés' in compat and 'a.fr b.fr' in compat
        page.locator('#includeSites').fill('ameli.fr')
        assert 'Sites ignorés' not in page.locator('#queryCompatibility').inner_text()
        assert not errors,errors;ctx.close()
        # Le focus reste utilisable au clavier après les actions sur les favoris.
        ctx,page,errors=open_app(browser,width,{'kerynq-saved-v1':[GOOD('a','Premier'),GOOD('b','Second')]})
        pin=page.get_by_role('button',name='Épingler le favori Second')
        pin.focus();pin.press('Enter')
        assert page.evaluate('document.activeElement.getAttribute("aria-label")')=='Détacher le favori Second'
        page.get_by_role('button',name='Renommer Premier').click()
        assert page.locator('.saved-editor').get_attribute('aria-label')=='Nouveau nom du favori Premier'
        page.keyboard.press('Escape')
        rm=page.get_by_role('button',name='Supprimer le favori Premier')
        rm.focus();rm.press('Enter')
        assert page.evaluate('document.activeElement.getAttribute("aria-label")')=='Charger le favori Second'
        rm=page.get_by_role('button',name='Supprimer le favori Second')
        rm.focus();rm.press('Enter')
        assert page.evaluate('document.activeElement.id')=='favoriteSearch'
        assert not errors,errors;ctx.close()
        # Le parcours IA copie le texte, ouvre l'assistant sans la consigne dans l'adresse, et le bouton principal l'annonce.
        ctx,page,errors=open_app(browser,width)
        page.locator('#tabWeb').click()
        assert page.locator('#runSearch').inner_text().startswith('Rechercher sur Google')
        assert page.locator('#runSearch').is_disabled()
        page.locator('#tabPrompt').click()
        assert page.locator('#enginePicker').is_hidden()
        page.locator('#aiProvider').select_option('claude')
        assert page.locator('#runSearch').inner_text().startswith('Copier et ouvrir Claude')
        page.locator('#topic').fill('Sujet confidentiel')
        page.evaluate("()=>{document.execCommand=()=>{window.kerynqTestCopy=document.activeElement.value;return true}}")
        with ctx.expect_page() as popup:page.locator('#runSearch').click()
        assert 'Sujet' not in popup.value.url and 'confidentiel' not in popup.value.url,popup.value.url
        assert 'Sujet confidentiel' in page.evaluate('window.kerynqTestCopy')
        assert not errors,errors;ctx.close()
        # Sans sujet, aucun assistant ne s'ouvre.
        ctx,page,errors=open_app(browser,width)
        page.locator('#tabPrompt').click();page.locator('#openAIProvider').click()
        assert len(ctx.pages)==1 and page.evaluate('document.activeElement.id')=='topic'
        assert not errors,errors;ctx.close()
        # Un fournisseur importé ne peut pas viser une propriété héritée.
        ctx,page,errors=open_app(browser,width,{'kerynq-premium-v5':{'aiProvider':'constructor'}})
        assert page.locator('#aiProvider').input_value()=='chatgpt'
        assert not errors,errors;ctx.close()
        print('REGRESSIONS PASS',width)
    browser.close()
