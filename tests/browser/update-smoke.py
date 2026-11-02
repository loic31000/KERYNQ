"""Chargement et mises à jour avec deux versions réelles, servies sous /KERYNQ/.

Chaque fichier des versions de test signale sa version quand il s'exécute : on mesure ce que la page a vraiment chargé.
Usage : update-smoke.py [--root DOSSIER] [--previous DOSSIER] [--out DOSSIER] [--engines chromium,firefox,webkit]
--previous : ancienne version publiée, pour tester la montée depuis son service worker.
"""
import argparse, functools, http.server, json, pathlib, re, shutil, tempfile, threading, time
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser(); ap.add_argument('--root', default=str(pathlib.Path(__file__).resolve().parents[2])); ap.add_argument('--previous'); ap.add_argument('--out'); ap.add_argument('--engines', default='chromium,firefox,webkit'); a = ap.parse_args()
ROOT = pathlib.Path(a.root); OUT = pathlib.Path(a.out) if a.out else pathlib.Path(tempfile.mkdtemp(prefix='update-smoke-')); OUT.mkdir(parents=True, exist_ok=True)
WORK = pathlib.Path(tempfile.mkdtemp(prefix='kerynq-versions-'))
THEMES = ('kerynq', 'dark', 'light', 'pro', 'cyber', 'girly', 'aurora', 'manga', 'medecine', 'tuning', 'animaux', 'finance')
LS = 'kerynq-premium-v5'
SKIP = shutil.ignore_patterns('.git', 'marketing', 'images', 'tests')


def build(src, label, version=None):
    d = WORK / label; shutil.copytree(src, d, ignore=SKIP)
    for p in list(d.glob('assets/js/**/*.js')):
        s = p.read_text(encoding='utf-8')
        p.write_text(s + f"\n;(self.__build=self.__build||[]).push('{label}');\n", encoding='utf-8')
    css = d / 'assets/css/styles.css'; css.write_text(css.read_text(encoding='utf-8') + f'\nhtml{{--build:"{label}"}}\n', encoding='utf-8')
    if version:
        for f in ('index.html', 'service-worker.js'):
            p = d / f; s = p.read_text(encoding='utf-8')
            s = s.replace('?v=21', f'?v={version}').replace('kerynq-static-v21', f'kerynq-static-v{version}').replace('content="21"', f'content="{version}"').replace("const VERSION = '21'", f"const VERSION = '{version}'")
            p.write_text(s, encoding='utf-8')
    return d


V1, V2 = build(ROOT, 'v1'), build(ROOT, 'v2', '22')
OLD = build(pathlib.Path(a.previous), 'ancien') if a.previous else None


class Site(http.server.SimpleHTTPRequestHandler):
    root = V1; delays = {}; missing = set(); no_store = True
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, '.js': 'text/javascript', '.webmanifest': 'application/json'}
    def __init__(self, *x, **k): super().__init__(*x, directory=str(Site.root), **k)
    def log_message(self, *x): pass
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store'); super().end_headers()
    def do_GET(self):
        path = self.path.split('?')[0]
        if not path.startswith('/KERYNQ/'): return self.send_error(404)
        for k, d in Site.delays.items():
            if path.endswith(k): time.sleep(d)
        if any(path.endswith(m) for m in Site.missing): return self.send_error(404)
        self.path = self.path[len('/KERYNQ'):]
        super().do_GET()
    def translate_path(self, path): return super().translate_path(path)


srv = http.server.ThreadingHTTPServer(('localhost', 0), Site); srv.handle_error = lambda *x: None; threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f'http://localhost:{srv.server_address[1]}/KERYNQ/index.html'
results = []


def check(name, cond, extra=''):
    results.append({'name': name, 'ok': bool(cond), 'detail': '' if cond else str(extra)[:500]})
    print(('PASS ' if cond else 'FAIL ') + name + ('' if cond else ' :: ' + str(extra)[:400]))


def reset(root=None):
    Site.root = root or V1; Site.delays = {}; Site.missing = set()


LOADED = """()=>{const css=getComputedStyle(document.documentElement).getPropertyValue('--build').trim().replace(/"/g,'');return {js:[...new Set(self.__build||[])],css,count:(self.__build||[]).length,build:document.querySelector('meta[name=kerynq-build]')?.content,ready:!document.documentElement.classList.contains('is-booting'),failed:document.documentElement.classList.contains('boot-failed')}}"""


def coherent(page, label=None):
    s = page.evaluate(LOADED)
    return len(s['js']) == 1 and s['css'] == s['js'][0] and (label is None or s['css'] == label), s


def wait_ready(page, t=15):
    end = time.time() + t
    while time.time() < end:
        try:
            if page.evaluate("document.readyState==='complete'&&!document.documentElement.classList.contains('is-booting')"): return True
        except Exception: pass
        page.wait_for_timeout(100)
    return False


def visible_soon(page, sel, t=20):
    end = time.time() + t
    while time.time() < end:
        try:
            page.evaluate("navigator.serviceWorker.getRegistration().then(r=>r&&r.update().catch(()=>{}))")
            if page.locator(sel).is_visible(): return True
        except Exception: pass
        page.wait_for_timeout(500)
    return False


def controlled(ctx, storage=None, root=None):
    """Page d'un visiteur déjà sous service worker."""
    reset(root); pg = ctx.new_page(); pg.goto(URL); wait_ready(pg)
    pg.evaluate("navigator.serviceWorker.ready.then(()=>1)")
    for _ in range(20):
        if storage: pg.evaluate("s=>{for(const [k,v] of Object.entries(s))localStorage.setItem(k,v)}", storage)
        pg.reload(); wait_ready(pg)
        if pg.evaluate("!!navigator.serviceWorker.controller"): break
        pg.wait_for_timeout(300)
    return pg


with sync_playwright() as p:
    for engine in a.engines.split(','):
        try:
            br = getattr(p, engine).launch()
        except Exception as e:
            check(f'{engine}: navigateur disponible', False, e); continue
        e = engine
        def mk(**k):
            ctx = br.new_context(viewport={'width': 1000, 'height': 720}, **k); ctx.set_default_timeout(20000); return ctx
        # A : nouvel utilisateur.
        reset(); c = mk(); pg = c.new_page(); errs = []; pg.on('pageerror', lambda x: errs.append(str(x))); pg.goto(URL); wait_ready(pg)
        ok, s = coherent(pg, 'v1'); check(f'{e} A cohérent', ok, s)
        check(f'{e} A thème, mode, moteurs', pg.evaluate("document.documentElement.dataset.theme") == 'kerynq' and pg.locator('#enginePicker').is_visible() and not pg.locator('#assistantPicker').is_visible() and pg.locator('#engineSelect option').count() == 28 and pg.locator('#engineSelect').is_enabled())
        check(f'{e} A aucune erreur', not errs, errs); c.close()
        # B et D : ancienne version en cache, données personnelles, déploiement.
        fav = json.dumps([{'id': 'a', 'name': 'F', 'topic': 'F', 'folder': 'G', 'category': 'T', 'pinned': False, 'settings': {'topic': 'F'}}]); tpl = json.dumps([{'id': 't', 'label': 'M', 'settings': {'topic': 'x'}}]); st = json.dumps({'theme': 'girly', 'topic': 'Ma question'})
        c = mk(); pg = controlled(c, {LS: st, 'kerynq-saved-v1': fav, 'kerynq-v5-templates': tpl})
        navs = []; pg.on('framenavigated', lambda f: navs.append(1) if f == pg.main_frame else None)
        ok, s = coherent(pg, 'v1'); check(f'{e} B ancienne version cohérente', ok, s)
        Site.root = V2; pg.reload(); wait_ready(pg)
        ok, s = coherent(pg); check(f'{e} B après déploiement : un seul jeu de fichiers', ok and s['css'] == 'v1', s)
        check(f'{e} B proposition de mise à jour', visible_soon(pg, '#updateBanner'), pg.locator('#updateText').text_content())
        pg.screenshot(path=str(OUT / f'{e}-mise-a-jour-proposee.png'))
        navs.clear(); pg.locator('#updateNow').click(); pg.wait_for_timeout(1500); wait_ready(pg)
        ok, s = coherent(pg, 'v2'); check(f'{e} B nouvelle version cohérente', ok and s['build'] == '22', s)
        pg.wait_for_timeout(2000); check(f'{e} B un seul rechargement', len(navs) == 1, len(navs))
        check(f'{e} B ancien cache retiré', pg.evaluate('caches.keys()') == ['kerynq-static-v22'], pg.evaluate('caches.keys()'))
        check(f'{e} B plus de proposition', not pg.locator('#updateBanner').is_visible())
        d = pg.evaluate("[localStorage.getItem('kerynq-saved-v1'),localStorage.getItem('kerynq-v5-templates'),document.documentElement.dataset.theme,document.getElementById('topic').value]")
        check(f'{e} D favoris, modèles, thème, question intacts', d == [fav, tpl, 'girly', 'Ma question'], d); c.close()
        # B2 : déploiement au milieu d'un chargement, visiteur sous service worker.
        c = mk(); pg = controlled(c); Site.delays = {'app.js': 1.5}; pg.reload(wait_until='commit'); pg.wait_for_timeout(300); Site.root = V2; wait_ready(pg)
        ok, s = coherent(pg); check(f'{e} B2 déploiement pendant le chargement sans mélange', ok, s); c.close()
        # C : deux onglets.
        c = mk(); a1 = controlled(c); a2 = c.new_page(); a2.goto(URL); wait_ready(a2)
        Site.root = V2
        check(f'{e} C proposition dans les deux onglets', visible_soon(a1, '#updateBanner') and visible_soon(a2, '#updateBanner'))
        a2.locator('#topic').fill('Session en cours'); nav2 = []; a2.on('framenavigated', lambda f: nav2.append(1) if f == a2.main_frame else None)
        a1.locator('#updateNow').click(); a1.wait_for_timeout(1500); wait_ready(a1)
        ok, s = coherent(a1, 'v2'); check(f'{e} C onglet 1 en nouvelle version', ok, s)
        a2.wait_for_timeout(800); ok, s = coherent(a2, 'v1')
        check(f'{e} C onglet 2 non rechargé et cohérent', ok and not nav2, [s, nav2])
        a2.locator('#tabWeb').click(); a2.locator('#topic').fill('Toujours utilisable')
        check(f'{e} C onglet 2 reste utilisable', a2.locator('#queryPreview').text_content() == 'Toujours utilisable' and a2.locator('#runSearch').is_enabled())
        check(f'{e} C onglet 2 invité à recharger', 'Rechargez' in a2.locator('#updateText').text_content(), a2.locator('#updateText').text_content())
        a2.locator('#updateNow').click(); a2.wait_for_timeout(1200); wait_ready(a2); ok, s = coherent(a2, 'v2')
        check(f'{e} C onglet 2 passe en nouvelle version, question gardée', ok and a2.locator('#topic').input_value() == 'Toujours utilisable', s); c.close()
        # E : réseau très lent.
        for theme, tab in ((('dark', 'web'), ('finance', 'prompt'), ('kerynq', 'web')) if e != 'chromium' else [(t, 'prompt' if i % 2 else 'web') for i, t in enumerate(THEMES)]):
            reset(); c = mk(service_workers='block'); pg = c.new_page(); pg.goto(URL); pg.evaluate("([k,t,d])=>localStorage.setItem(k,JSON.stringify({theme:t,previewTab:d}))", [LS, theme, tab])
            Site.delays = {'app.js': 2}; pg.reload(wait_until='commit')
            for _ in range(60):
                pg.wait_for_timeout(30)
                try:
                    if pg.evaluate("!!document.getElementById('topic')&&document.documentElement.classList.contains('is-booting')"): break
                except Exception: pass
            box = lambda: pg.evaluate("['.composer','#domainToggle','#topic','#refineToggle'].map(q=>{const r=document.querySelector(q).getBoundingClientRect();return [Math.round(r.y),Math.round(r.height)]})")
            st8 = pg.evaluate("""({t:document.documentElement.dataset.theme,boot:document.documentElement.classList.contains('is-booting'),opt:document.querySelector('#engineSelect').options[0]?.textContent,sel:document.querySelector('#engineSelect').disabled,ai:document.querySelector('#aiProvider').disabled,run:document.querySelector('#runSearch').disabled,label:document.querySelector('#runSearch').textContent,tabWeb:getComputedStyle(document.querySelector('#tabWeb')).backgroundColor,tabIa:getComputedStyle(document.querySelector('#tabPrompt')).backgroundColor,topic:document.querySelector('#topic').readOnly,eng:getComputedStyle(document.querySelector('#enginePicker')).display,asst:getComputedStyle(document.querySelector('#assistantPicker')).display,lib:document.querySelector('#libraryToggle').disabled})""")
            before = box(); (OUT / 'e').mkdir(exist_ok=True); pg.screenshot(path=str(OUT / 'e' / f'{e}-{theme}-{tab}.png'))
            shown, hidden = (st8['eng'], st8['asst']) if tab == 'web' else (st8['asst'], st8['eng'])
            cond = st8['boot'] and st8['t'] == theme and st8['opt'] == 'Chargement…' and st8['sel'] and st8['ai'] and st8['run'] and st8['label'] == 'Chargement…' and st8['topic'] and st8['lib'] and hidden == 'none' and shown != 'none' and st8['tabWeb'] != st8['tabIa']
            check(f'{e} E {theme} {tab} cohérent pendant le chargement', cond, st8)
            wait_ready(pg); after = box(); shift = max(abs(x[i] - y[i]) for x, y in zip(before, after) for i in (0, 1))
            check(f'{e} E {theme} {tab} aucun déplacement', shift <= 2, [before, after])
            check(f'{e} E {theme} {tab} actif après chargement', pg.locator('#engineSelect').is_enabled() and pg.locator('#tabWeb').is_enabled() and not pg.evaluate("document.getElementById('topic').readOnly") and pg.locator('#engineSelect option').count() == 28)
            c.close()
        # F : hors ligne, puis retour.
        c = mk(); pg = controlled(c, {LS: json.dumps({'theme': 'cyber'})}); c.set_offline(True)
        try:
            pg.reload(); ready = wait_ready(pg); ok, s = coherent(pg, 'v1')
            check(f'{e} F hors ligne cohérent', ready and ok, s)
            pg.locator('#tabWeb').click(); pg.locator('#topic').fill('Hors ligne'); check(f'{e} F préparation locale', pg.locator('#queryPreview').text_content() == 'Hors ligne' and pg.locator('#engineSelect option').count() == 28)
            Site.root = V2; pg.wait_for_timeout(500); check(f'{e} F aucune proposition sans réseau', not pg.locator('#updateBanner').is_visible()); c.set_offline(False)
            check(f'{e} F proposition au retour', visible_soon(pg, '#updateBanner')); check(f'{e} F question gardée', pg.locator('#topic').input_value() == 'Hors ligne')
        except Exception as x:
            check(f'{e} F hors ligne', False, x)
        c.close()
        # Mode privé : la mise à jour prévient avant d'effacer une recherche non enregistrée.
        c = mk(); pg = controlled(c); pg.locator('#privateSearchToggle').click(); pg.locator('#topic').fill('Secret'); Site.root = V2
        visible_soon(pg, '#updateBanner'); check(f'{e} Mode privé : avertissement avant mise à jour', 'mode privé sera effacée' in pg.locator('#updateText').text_content(), pg.locator('#updateText').text_content()); c.close()
        # G : ressources qui échouent.
        for missing, label in (('app.js', 'app'), ('catalog-core.js', 'catalogue'), ('styles.css', 'css')):
            reset(); Site.missing = {missing}; c = mk(service_workers='block'); pg = c.new_page(); pg.goto(URL); pg.wait_for_timeout(800)
            s = pg.evaluate("({f:document.documentElement.classList.contains('boot-failed'),run:document.getElementById('runSearch').disabled,lab:document.getElementById('runSearch').textContent,tab:document.getElementById('tabWeb').disabled,msg:[...document.querySelectorAll('.boot-error')].some(e=>e.getBoundingClientRect().height>0),t:document.documentElement.dataset.theme})")
            if label == 'css': check(f'{e} G css signalé', s['f'], s)
            else:
                check(f'{e} G {label} signalé, commandes inactives', s['f'] and s['run'] and s['lab'] == 'Indisponible' and s['tab'] and s['msg'], s)
                pg.screenshot(path=str(OUT / f'{e}-echec-{label}.png'))
            c.close()
        # Ancienne version publiée vers celle-ci.
        if OLD:
            c = mk(); pg = controlled(c, {LS: st, 'kerynq-saved-v1': fav}, root=OLD); old_caches = pg.evaluate('caches.keys()')
            Site.root = V1; pg.reload(); wait_ready(pg); ok, s = coherent(pg)
            check(f'{e} Montée depuis {old_caches}: page cohérente', ok, s)
            check(f'{e} Montée : proposition', visible_soon(pg, '#updateBanner'))
            pg.locator('#updateNow').click(); pg.wait_for_timeout(1500); wait_ready(pg); ok, s = coherent(pg, 'v1')
            d = pg.evaluate("[localStorage.getItem('kerynq-saved-v1'),document.documentElement.dataset.theme]")
            check(f'{e} Montée : version et données', ok and d == [fav, 'girly'] and pg.evaluate('caches.keys()') == ['kerynq-static-v21'], [s, d, pg.evaluate('caches.keys()')]); c.close()
        br.close()
srv.shutdown()
(OUT / 'results.json').write_text(json.dumps(results, ensure_ascii=False, indent=1), encoding='utf-8')
fails = [r for r in results if not r['ok']]
print(f'{len(results)} contrôles, {len(fails)} en échec. Preuves : {OUT}')
raise SystemExit(1 if fails else 0)
