"""Non-régression KERYNQ avec stockage réel : favoris, modèles, raccourcis, focus. Python Playwright et Chromium requis."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
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
        # Thèmes : choix conservé après rechargement, contraste suffisant, pas de débordement.
        ctx,page,errors=open_app(browser,width)
        def lum(c):
            v=[int(c[i:i+2],16)/255 for i in (1,3,5)]
            v=[x/12.92 if x<=.03928 else ((x+.055)/1.055)**2.4 for x in v]
            return .2126*v[0]+.7152*v[1]+.0722*v[2]
        ratio=lambda a,b:(max(lum(a),lum(b))+.05)/(min(lum(a),lum(b))+.05)
        for theme in ('dark','light','pro','cyber','girly','aurora'):
            page.locator('#themeToggle').click()
            page.locator(f'[data-theme-choice="{theme}"]').click()
            page.keyboard.press('Escape')
            assert page.locator('#themeMenu').is_hidden()
            assert page.evaluate('document.documentElement.dataset.theme')==theme
            t=page.evaluate("()=>{const s=getComputedStyle(document.documentElement);return Object.fromEntries(['bg','surface','text','muted','accent','on-accent'].map(k=>[k,s.getPropertyValue('--'+k).trim()]))}")
            for fg,bg in (('text','surface'),('text','bg'),('muted','surface'),('muted','bg'),('accent','surface'),('on-accent','accent')):
                assert ratio(t[fg],t[bg])>=4.5,(theme,fg,bg,ratio(t[fg],t[bg]))
            dim=page.evaluate('({a:document.documentElement.scrollWidth,b:document.documentElement.clientWidth})')
            assert dim['a']<=dim['b']+2,(theme,width,dim)
        page.reload()
        assert page.evaluate('document.documentElement.dataset.theme')=='aurora'
        assert page.locator('#themeToggle').inner_text()=='Thème : Aurore'
        # Bulles : ouverture au focus, visibles dans l'écran, fermeture par Échap.
        for tip in page.locator('.tip').all():
            if not tip.is_visible():continue
            tip.focus()
            box=page.locator('#tipBubble').bounding_box()
            assert box and box['x']>=0 and box['x']+box['width']<=width and box['y']>=0,(width,box)
            assert tip.get_attribute('aria-describedby')=='tipBubble'
            page.keyboard.press('Escape')
            assert page.locator('#tipBubble').is_hidden()
        assert page.locator('.tip').count()==10
        assert not errors,errors;ctx.close()
        # Un ancien thème reste valide ; un thème inconnu revient au thème par défaut.
        for stored,expected in (('light','light'),('inconnu','dark')):
            ctx,page,errors=open_app(browser,width,{'kerynq-premium-v5':{'theme':stored}})
            assert page.evaluate('document.documentElement.dataset.theme')==expected
            ctx.close()
        # Le bouton d'affichage des domaines est en haut, à côté du choix d'options.
        ctx,page,errors=open_app(browser,width)
        show=page.locator('.panel-tools #showAll').bounding_box();grid=page.locator('#categories').bounding_box()
        assert show['y']+show['height']<=grid['y'],(width,show,grid)
        mode=page.locator('.panel-tools .mode-switch').bounding_box()
        assert show['x']>=mode['x']+mode['width'] or show['y']>=mode['y']+mode['height'],(width,show,mode)
        tools=page.locator('.panel-tools').bounding_box()
        assert abs(mode['x']-grid['x'])<=2,(width,mode,grid)
        assert page.locator('#showAll').inner_text()=='Afficher tous les domaines'
        page.locator('#showAll').click()
        assert page.locator('#showAll').inner_text()=='Afficher moins de domaines' and page.locator('.category-btn').count()==39
        ctx.close()
        # Packs : rien sans pays ni clic ; ajout, retrait et limite respectent la saisie manuelle.
        ctx,page,errors=open_app(browser,width,{'kerynq-premium-v5':{'topic':'Sujet','category':'health','includeSites':'monsite.fr','engine':'google'}})
        assert page.locator('#sourceCountry').input_value()==''
        assert page.locator('#sourcePackBody').is_hidden()
        query=lambda:page.locator('#queryPreview').text_content()
        assert query()=='Sujet site:monsite.fr'
        page.locator('#sourceCountry').select_option('FR')
        assert page.locator('#sourcePackList input').count()==5
        assert query()=='Sujet site:monsite.fr'
        for domain in ('has-sante.fr','sante.gouv.fr','ansm.sante.fr','santepubliquefrance.fr'):
            page.locator(f'[id="pack-{domain}"]').uncheck()
        page.locator('#addSourcePack').click()
        assert page.locator('#includeSites').input_value()=='monsite.fr, ameli.fr'
        assert 'site:ameli.fr' in query() and 'has-sante' not in query()
        page.locator('.category-btn[data-category-id="manga"]').click()
        assert 'Aucune source officielle' in page.locator('#sourcePackNote').inner_text()
        assert page.locator('#includeSites').input_value()=='monsite.fr, ameli.fr'
        page.locator('.category-btn[data-category-id="general"]').click()
        page.locator('#sourceCountry').select_option('')
        assert page.locator('#includeSites').input_value()=='monsite.fr, ameli.fr'
        page.locator('#sourceCountry').select_option('FR')
        page.reload()
        assert page.locator('#sourceCountry').input_value()=='FR'
        page.locator('#modeAdvanced').click()
        page.evaluate("document.querySelectorAll('details').forEach(d=>d.open=true)")
        page.locator('#categorySearch').fill('Santé');page.locator('.category-btn[data-category-id="health"]').click();page.locator('#categorySearch').fill('')
        page.locator('#removeSourcePack').click()
        assert page.locator('#includeSites').input_value()=='monsite.fr'
        page.locator('#engineSelect').select_option('duck')
        assert 'DuckDuckGo' in page.locator('#sourcePackNote').inner_text()
        page.locator('#engineSelect').select_option('google')
        page.locator('#includeSites').fill(', '.join(f's{i}.fr' for i in range(9)))
        page.locator('#addSourcePack').click()
        assert 'ameli.fr' not in page.locator('#includeSites').input_value()
        assert 'Limite' in page.locator('#status').inner_text()
        dim=page.evaluate('({a:document.documentElement.scrollWidth,b:document.documentElement.clientWidth})')
        assert dim['a']<=dim['b']+2,(width,dim)
        assert not errors,errors;ctx.close()
        # Un fournisseur importé ne peut pas viser une propriété héritée.
        ctx,page,errors=open_app(browser,width,{'kerynq-premium-v5':{'aiProvider':'constructor'}})
        assert page.locator('#aiProvider').input_value()=='chatgpt'
        assert not errors,errors;ctx.close()
        print('REGRESSIONS PASS',width)
    browser.close()
