"""Non-régression KERYNQ avec stockage réel : parcours, bibliothèque, thèmes, équivalence. Python Playwright et Chromium requis."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
ORIGIN='http://kerynq.test/'
TYPES={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webmanifest':'application/json'}
THEMES=('kerynq','dark','light','pro','cyber','girly','aurora','manga','medecine','tuning','animaux','finance')
GOOD=lambda id,topic,**settings:{'id':id,'name':topic,'topic':topic,'folder':'Général','category':'Tous les sujets','pinned':False,'settings':{'topic':topic,**settings}}
def serve(route):
    path=route.request.url.replace(ORIGIN,'').split('?')[0] or 'index.html'
    file=ROOT/path
    if file.is_file(): route.fulfill(body=file.read_bytes(),content_type=TYPES.get(file.suffix,'text/plain'))
    else: route.fulfill(status=404,body='')
def open_app(browser,width,storage=None):
    ctx=browser.new_context(viewport={'width':width,'height':850},reduced_motion='reduce',service_workers='block',accept_downloads=True)
    ctx.route('**/*',lambda route:serve(route) if route.request.url.startswith(ORIGIN) else route.abort())
    ctx.add_init_script('if(!sessionStorage.seeded){sessionStorage.seeded=1;for(const [k,v] of Object.entries(%s))localStorage.setItem(k,v)}'%json.dumps({k:json.dumps(v) for k,v in (storage or {}).items()}))
    page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text) if 'Content Security Policy' in m.text else None)
    page.goto(ORIGIN+'index.html')
    return ctx,page,errors
def settings(page):
    page.locator('#refineToggle').click();page.evaluate("document.querySelectorAll('#refinePanel details').forEach(d=>d.open=true)")
def library(page):
    page.locator('#libraryToggle').click();page.evaluate("document.querySelectorAll('#libraryPanel details').forEach(d=>d.open=true)")
PROMPT="[...document.querySelectorAll('#promptPreview .pl')].map(e=>e.textContent).join('\\n')"
overflow=lambda page:page.evaluate('document.documentElement.scrollWidth-document.documentElement.clientWidth')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=os.environ.get('KERYNQ_CHROMIUM') or None)
    golden=json.loads((ROOT/'tests/browser/golden-queries.json').read_text(encoding='utf-8'))
    tokens=json.loads((ROOT/'tests/browser/golden-themes.json').read_text(encoding='utf-8'))
    for width in (1440,1024,768,390,320):
        # Nouvel utilisateur : thème signature, page sans réglages ni critères imposés.
        ctx,page,errors=open_app(browser,width)
        assert page.evaluate('document.documentElement.dataset.theme')=='kerynq'
        assert page.locator('.logo-kerynq').is_visible()
        assert page.locator('#refinePanel').is_hidden() and page.locator('#libraryPanel').is_hidden() and page.locator('#domainPanel').is_hidden()
        assert page.locator('.chip').count()==0 and page.locator('#refineToggle').inner_text()=='Personnaliser ma recherche'
        assert 'pour l’IA' not in page.locator('#activeSummary').inner_text()
        assert page.locator('#domainReset').is_hidden()
        # Sans question, l'aperçu reste discret ; avec une question, il dit quoi faire.
        assert page.locator('#resultEmpty').is_visible() and page.locator('#resultTitle').is_hidden()
        assert page.locator('#resultPreview').bounding_box()['height']<=200
        assert page.locator('#runSearch').is_disabled()
        # Le bouton principal est dans le bloc de la question.
        box=page.locator('.composer').bounding_box();run=page.locator('#runSearch').bounding_box()
        assert box['y']<=run['y'] and run['y']+run['height']<=box['y']+box['height']
        page.locator('#tabWeb').click()
        page.locator('#topic').fill('Chat')
        assert page.locator('#resultTitle').inner_text()=='Votre recherche pour Google est prête'
        assert 'Votre question' in page.locator('#queryCompatibility').inner_text()
        assert not errors,errors;ctx.close()
        # Profil existant : le thème enregistré est préservé, y compris s'il était implicite.
        for stored,expected in (({'theme':'light'},'light'),({'topic':'x'},'dark'),({'theme':'inconnu'},'kerynq')):
            ctx,page,errors=open_app(browser,width,{'kerynq-premium-v5':stored})
            assert page.evaluate('document.documentElement.dataset.theme')==expected,(stored,expected)
            ctx.close()
        # Ctrl+Entrée lance la recherche sans copier la consigne.
        ctx,page,errors=open_app(browser,width,{'kerynq-premium-v5':{'previewTab':'web','theme':'dark'}})
        page.locator('#topic').fill('Sujet')
        page.evaluate("()=>{document.execCommand=()=>{window.kerynqTestCopy=true;return true}}")
        with ctx.expect_page():page.keyboard.press('Control+Enter')
        page.wait_for_timeout(200)
        assert page.evaluate('window.kerynqTestCopy===undefined') and len(ctx.pages)==2
        assert not errors,errors;ctx.close()
        # Les sites ignorés sont signalés ; le critère non transmis est expliqué.
        ctx,page,errors=open_app(browser,width,{'kerynq-premium-v5':{'previewTab':'web','topic':'Sujet','includeSites':'a.fr b.fr, ameli.fr','region':'France'}})
        compat=page.locator('#queryCompatibility').inner_text()
        assert 'Sites ignorés' in compat and 'a.fr b.fr' in compat and 'Non transmis à Google' in compat
        assert page.locator('.chip-off').count()==1 and 'ignoré par Google' in page.locator('.chip-off').inner_text()
        assert not errors,errors;ctx.close()
        # Parcours IA : copie, ouverture sans la consigne dans l'adresse, rien sans question.
        ctx,page,errors=open_app(browser,width)
        page.locator('#tabPrompt').click()
        assert page.locator('#enginePicker').is_hidden() and page.locator('#assistantPicker').is_visible()
        page.locator('#topic').press('Enter')
        assert len(ctx.pages)==1 and page.evaluate('document.activeElement.id')=='topic'
        page.locator('#aiProvider').select_option('claude')
        assert page.locator('#runSearch').inner_text().startswith('Copier et ouvrir Claude')
        page.locator('#topic').fill('Sujet confidentiel')
        assert 'Claude' in page.locator('#resultTitle').inner_text()
        page.evaluate("()=>{document.execCommand=()=>{window.kerynqTestCopy=document.activeElement.value;return true}}")
        with ctx.expect_page() as popup:page.locator('#runSearch').click()
        assert 'confidentiel' not in popup.value.url and 'Sujet confidentiel' in page.evaluate('window.kerynqTestCopy')
        assert not errors,errors;ctx.close()
        # Aucune requête externe tant que l'utilisateur ne lance rien.
        ctx,page,errors=open_app(browser,width)
        outside=[];ctx.on('request',lambda q:outside.append(q.url) if not q.url.startswith(ORIGIN) else None)
        page.locator('#topic').fill('Secret');settings(page);page.locator('#period').select_option('year');page.locator('#refineClose').click()
        page.wait_for_timeout(100);assert not outside,outside;ctx.close()
        # Thèmes : jetons d'origine intacts, contraste, logo, reflow, persistance.
        ctx,page,errors=open_app(browser,width)
        def lum(c):
            v=[int(c[i:i+2],16)/255 for i in (1,3,5)]
            v=[x/12.92 if x<=.03928 else ((x+.055)/1.055)**2.4 for x in v]
            return .2126*v[0]+.7152*v[1]+.0722*v[2]
        ratio=lambda a,b:(max(lum(a),lum(b))+.05)/(min(lum(a),lum(b))+.05)
        for theme in THEMES:
            page.locator('#themeToggle').click()
            page.locator(f'[data-theme-choice="{theme}"]').click()
            page.keyboard.press('Escape')
            assert page.locator('#themeMenu').is_hidden()
            assert page.evaluate('document.documentElement.dataset.theme')==theme
            t=page.evaluate("()=>{const s=getComputedStyle(document.documentElement);return Object.fromEntries(['bg','surface','text','muted','accent','on-accent'].map(k=>[k,s.getPropertyValue('--'+k).trim()]))}")
            for fg,bg in (('text','surface'),('text','bg'),('muted','surface'),('muted','bg'),('accent','surface'),('on-accent','accent')):
                assert ratio(t[fg],t[bg])>=4.5,(theme,fg,bg,ratio(t[fg],t[bg]))
            if theme in tokens:
                now=page.evaluate("K=>{const s=getComputedStyle(document.documentElement);return Object.fromEntries(K.map(k=>[k,s.getPropertyValue('--'+k).trim()]))}",list(tokens[theme]))
                assert now==tokens[theme],(theme,{k:(now[k],tokens[theme][k]) for k in now if now[k]!=tokens[theme][k]})
            assert overflow(page)<=2,(theme,width)
            assert page.locator(f'.logo-{theme}').is_visible() and page.locator('.logo-v:visible').count()==1,theme
        page.reload()
        assert page.evaluate('document.documentElement.dataset.theme')=='finance'
        page.locator('#themeToggle').click()
        assert page.locator('[data-theme-choice="finance"]').get_attribute('aria-pressed')=='true'
        page.locator('#fontToggle').click();assert page.evaluate("document.body.classList.contains('large-text')")
        page.keyboard.press('Escape')
        # Bulles : au focus, dans l'écran, fermeture par Échap.
        page.locator('#tabWeb').click()
        for tip in page.locator('.tip').all():
            if not tip.is_visible():continue
            tip.focus();bubble=page.locator('#tipBubble').bounding_box()
            assert bubble and bubble['x']>=0 and bubble['x']+bubble['width']<=width and bubble['y']>=0
            page.keyboard.press('Escape');assert page.locator('#tipBubble').is_hidden()
        assert page.locator('.tip').count()==2
        assert not errors,errors;ctx.close()
        # Tableau limité au moteur choisi.
        ctx,page,errors=open_app(browser,width,{'kerynq-premium-v5':{'previewTab':'web','engine':'brave','topic':'Sujet'}})
        page.evaluate("document.querySelectorAll('#resultPreview details').forEach(d=>d.open=true)")
        assert page.locator('#engineTable tr').count()==9 and page.locator('#engineTableName').inner_text()=='Brave'
        page.locator('#engineSelect').select_option('duck')
        assert page.locator('#engineTableName').inner_text()=='DuckDuckGo' and page.locator('#engineTable tr:nth-child(4) td').inner_text()=='Non transmis'
        assert overflow(page)<=2
        assert page.locator('#engineButtons .btn').count()==28
        assert not errors,errors;ctx.close()
        # Consigne : format et assistant conservés.
        ctx,page,errors=open_app(browser,width,{'kerynq-premium-v5':{'previewTab':'prompt','category':'osint','topic':'Sujet'}})
        prompt=lambda:page.evaluate(PROMPT)
        assert 'Méthode pour ce domaine' in prompt() and 'pas accès au Web' in prompt()
        long=len(prompt());settings(page);page.locator('#promptStyle').select_option('short');page.locator('#refineClose').click()
        assert len(prompt())<long
        page.locator('#aiProvider').select_option('perplexity')
        assert 'source citée' in prompt() and 'pas accès au Web' not in prompt()
        page.reload();assert page.locator('#promptStyle').input_value()=='short'
        assert not errors,errors;ctx.close()
        # Moteur conseillé : proposition sans bascule automatique, adresse correcte.
        ctx,page,errors=open_app(browser,width,{'kerynq-premium-v5':{'previewTab':'web','category':'health','topic':'Migraine','includeSites':'ameli.fr','engine':'google'}})
        assert page.locator('#engineSelect').input_value()=='google' and 'PubMed' in page.locator('#engineSuggestText').inner_text()
        assert 'site:ameli.fr' in page.locator('#queryPreview').text_content()
        page.locator('#useSuggestedEngine').click()
        assert page.locator('#engineSelect').input_value()=='pubmed' and page.locator('#queryPreview').text_content()=='Migraine'
        assert 'Site ciblé' in page.locator('#queryCompatibility').inner_text()
        requests=[];ctx.on('request',lambda q:requests.append(q.url))
        with ctx.expect_page():page.locator('#runSearch').click()
        page.wait_for_timeout(200)
        assert any(u.startswith('https://pubmed.ncbi.nlm.nih.gov/?term=Migraine') for u in requests),requests
        assert not errors,errors;ctx.close()
        # Moteur d'images : adresse dédiée.
        ctx,page,errors=open_app(browser,width,{'kerynq-premium-v5':{'previewTab':'web','topic':'Chat','engine':'googleimages'}})
        assert page.locator('#queryPreview').text_content()=='Chat' and page.locator('optgroup[label="Images"] option').count()==6
        requests=[];ctx.on('request',lambda q:requests.append(q.url))
        with ctx.expect_page():page.locator('#runSearch').click()
        page.wait_for_timeout(200)
        assert any(u.startswith('https://www.google.com/search?udm=2&q=Chat') for u in requests),requests
        assert not errors,errors;ctx.close()
        # Mode privé : en-tête, recherche retirée du stockage, bibliothèque verrouillée.
        ctx,page,errors=open_app(browser,width,{'kerynq-premium-v5':{'topic':'Secret'}})
        assert page.locator('header #privateSearchToggle').is_visible() and page.locator('#privateSearchInfo').is_hidden()
        page.locator('#privateSearchToggle').click()
        assert page.locator('#privateSearchInfo').is_visible() and 'Secret' not in page.evaluate("localStorage.getItem('kerynq-premium-v5')")
        library(page);assert page.locator('#saveResearch').is_disabled() and page.locator('#saveTemplate').is_disabled() and page.locator('#exportConfig').is_disabled();page.locator('#libraryClose').click()
        page.locator('#privateSearchToggle').click();assert page.locator('#topic').input_value()==''
        assert overflow(page)<=2 and not errors,errors;ctx.close()
        # Critères : valeurs par défaut absentes, retrait unitaire, compteur exact, conservation Web et IA.
        ctx,page,errors=open_app(browser,width,{'kerynq-premium-v5':{'previewTab':'prompt','topic':'Sujet','category':'travel'}})
        assert page.locator('.chip').count()==0
        assert 'Voyages' in page.locator('#domainName').inner_text() and page.locator('#domainReset').is_visible()
        settings(page)
        page.locator('.goal-btn').nth(1).click();page.locator('#includeWords').fill('mot');page.locator('#filetype').select_option('pdf');page.locator('#excludeSites').fill('a.fr')
        assert page.locator('#goals').is_visible();page.locator('#refineClose').click()
        assert page.locator('.chip').count()==4 and page.locator('#refineToggle').inner_text().endswith('(4)')
        page.locator('#tabWeb').click()
        assert page.locator('.chip').count()==3,'objectif réservé à l’IA'
        settings(page);assert page.locator('#goals').is_hidden() and page.locator('#period').is_visible();page.locator('#refineClose').click()
        page.get_by_role('button',name='Retirer le critère Avec : mot').click()
        assert page.locator('#includeWords').input_value()=='' and page.locator('#excludeSites').input_value()=='a.fr' and page.locator('.chip').count()==2
        assert page.evaluate('document.activeElement.className').startswith('chip-remove')
        page.locator('#tabPrompt').click();assert page.locator('.chip').count()==3
        page.locator('#domainReset').click();assert page.locator('#domainName').inner_text()=='Tous les sujets' and page.evaluate('document.activeElement.id')=='domainToggle'
        page.reload();assert page.locator('#excludeSites').input_value()=='a.fr' and page.locator('.chip').count()==3
        assert not errors,errors;ctx.close()
        # Panneau : Échap rend le focus au bouton.
        ctx,page,errors=open_app(browser,width)
        page.locator('#refineToggle').focus();page.keyboard.press('Enter');assert page.locator('#refinePanel').is_visible()
        page.keyboard.press('Escape');assert page.locator('#refinePanel').is_hidden() and page.evaluate('document.activeElement.id')=='refineToggle'
        page.locator('#libraryToggle').focus();page.keyboard.press('Enter');assert page.locator('#libraryPanel').is_visible()
        assert page.evaluate("document.querySelector('#libraryPanel').matches(':modal')")
        page.keyboard.press('Escape');assert page.evaluate('document.activeElement.id')=='libraryToggle'
        assert not errors,errors;ctx.close()
        # Bibliothèque : favoris et dossiers existants, entrée abîmée ignorée sans écraser.
        ctx,page,errors=open_app(browser,width,{'kerynq-saved-v1':[{'id':1,'settings':{}},GOOD('a','Premier',engine='brave',theme='light',category='manga'),{**GOOD('b','Second'),'folder':'Travail'}]})
        assert 'ignorée' in page.locator('#status').inner_text()
        library(page);assert page.locator('.saved-entry',has_text='Premier').count()==1
        assert page.locator('#folderFilter option').count()==3
        page.locator('#folderFilter').select_option('Travail');assert page.locator('#savedList .saved-entry').count()==1;page.locator('#folderFilter').select_option('')
        pin=page.get_by_role('button',name='Épingler le favori Second');pin.focus();pin.press('Enter')
        assert page.evaluate('document.activeElement.getAttribute("aria-label")')=='Détacher le favori Second'
        page.get_by_role('button',name='Charger le favori Premier').click()
        assert page.locator('#libraryPanel').is_hidden() and page.locator('#topic').input_value()=='Premier' and page.locator('#engineSelect').input_value()=='brave'
        assert 'Mangas' in page.locator('#domainName').inner_text() and page.evaluate('document.documentElement.dataset.theme')=='kerynq'
        library(page);page.locator('#favoriteTitle').fill('Nouveau');page.locator('#favoriteFolder').fill('Maison');page.locator('#saveResearch').click()
        assert page.locator('#savedList .saved-entry').count()==3 and page.locator('#folderFilter option[value="Maison"]').count()==1
        page.get_by_role('button',name='Supprimer le favori Nouveau').click();assert page.locator('#savedList .saved-entry').count()==2
        page.locator('#libraryClose').click();ctx.close()
        # Modèles : ancien modèle chargeable, création, suppression, question conservée.
        ctx,page,errors=open_app(browser,width,{'kerynq-v5-templates':[{'id':'t','label':'Ancien','settings':{'topic':'Modele','category':'law','goal':'verify'}}]})
        page.locator('#topic').fill('Ma question')
        library(page);page.get_by_role('button',name='Charger le modèle Ancien').click()
        assert page.locator('#topic').input_value()=='Ma question' and 'Droit' in page.locator('#domainName').inner_text()
        library(page);page.locator('#templateName').fill('Mien');page.locator('#saveTemplate').click()
        assert page.locator('#customTemplates .saved-entry').count()==2
        page.get_by_role('button',name='Supprimer le modèle Ancien').click();assert page.locator('#customTemplates .saved-entry').count()==1
        assert page.locator('#templateList .example').count()>=1
        page.locator('#templateList .example').first.click();assert page.locator('#libraryPanel').is_hidden()
        # Export puis import : modèles retrouvés.
        library(page)
        with page.expect_download() as dl:page.locator('#exportConfig').click()
        path=dl.value.path();data=json.loads(Path(path).read_text(encoding='utf-8'))
        assert data['app']=='KERYNQ' and data['templates'][0]['label']=='Mien'
        page.evaluate("localStorage.removeItem('kerynq-v5-templates')");page.once('dialog',lambda d:d.accept())
        page.locator('#profileFile').set_input_files(str(path));page.wait_for_function("localStorage.getItem('kerynq-v5-templates')?.includes('Mien')")
        assert page.locator('#customTemplates .saved-entry').count()==1
        assert overflow(page)<=2 and not errors,errors;ctx.close()
        # Requêtes et consignes identiques à celles de main avant la refonte.
        for case in golden['cases']:
            ctx,page,errors=open_app(browser,width,{'kerynq-premium-v5':case['input']})
            assert page.evaluate(PROMPT)==case['prompt'],case['input']
            # Copie et export : exactement le texte d'avant, sans HTML.
            page.evaluate("()=>{document.execCommand=()=>{window.kerynqTestCopy=document.activeElement.value;return true}}")
            page.locator('#tabPrompt').click();page.locator('#copyPrompt').click()
            page.wait_for_function('window.kerynqTestCopy!==undefined')
            assert page.evaluate('window.kerynqTestCopy')==case['prompt'],case['input']
            with page.expect_download() as dl:page.locator('#downloadPrompt').click()
            assert Path(dl.value.path()).read_bytes().decode('utf-8')==case['prompt']+'\n',case['input']
            now=page.evaluate("s=>Object.fromEntries(%s.map(id=>[id,KerynqSearch.compile(KerynqCatalog.normalize(s),id,new Date('2026-01-15T12:00:00')).query]))"%json.dumps(golden['engines']),case['input'])
            assert now==case['queries'],case['input']
            ctx.close()
        # Le contenu utilisateur reste du texte ; titres à la couleur d'accent du thème.
        ctx,page,errors=open_app(browser,width,{'kerynq-premium-v5':{'previewTab':'prompt','topic':'<img src=x onerror=window.pwned=1>\n## Faux'}})
        assert page.locator('#promptPreview img').count()==0 and not page.evaluate('window.pwned') and '<img src=x' in page.evaluate(PROMPT)
        assert page.locator('#promptPreview h4',has_text='Faux').count()==0 and page.locator('#promptPreview h4').count()>=3
        accent=page.evaluate("(()=>{const d=document.createElement('i');d.className='link-button';document.body.append(d);const c=getComputedStyle(d).color;d.remove();return c})()")
        assert page.evaluate("getComputedStyle(document.querySelector('.pl-section')).color")==accent
        assert overflow(page)<=2 and not errors,errors;ctx.close()
        # Fact Check Explorer retiré : anciens profil et favori reviennent à Google, aperçu Web inchangé.
        ctx,page,errors=open_app(browser,width,{'kerynq-premium-v5':{'previewTab':'web','topic':'Sujet','engine':'factcheck'},'kerynq-saved-v1':[GOOD('f','Ancien favori',engine='factcheck')]})
        assert page.locator('#engineSelect').input_value()=='google' and page.locator('#engineSelect option[value="factcheck"]').count()==0
        assert page.locator('#queryPreview').evaluate('e=>e.tagName')=='OUTPUT' and page.locator('#queryPreview').text_content()=='Sujet'
        library(page);page.get_by_role('button',name='Charger le favori Ancien favori').click()
        assert page.locator('#engineSelect').input_value()=='google' and not errors,errors
        ctx.close()
        # L'objectif Vérifier reste disponible ; Politique n'a plus de moteur conseillé.
        ctx,page,errors=open_app(browser,width,{'kerynq-premium-v5':{'previewTab':'web','topic':'Mesure','goal':'verify','category':'politics'}})
        assert page.locator('#engineSuggest').is_hidden()
        page.locator('#tabPrompt').click();assert 'Teste les affirmations' in page.evaluate(PROMPT)
        ctx.close()
        # Un fournisseur importé ne peut pas viser une propriété héritée.
        ctx,page,errors=open_app(browser,width,{'kerynq-premium-v5':{'aiProvider':'constructor'}})
        assert page.locator('#aiProvider').input_value()=='chatgpt'
        assert not errors,errors;ctx.close()
        print('REGRESSIONS PASS',width)
    browser.close()
