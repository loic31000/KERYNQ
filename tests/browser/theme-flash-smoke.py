"""Le thème enregistré doit être visible dès la première image, sans changement ensuite.

Mesures : thème à chaque image d'animation, changements de l'attribut, et couleur réellement peinte (screencast).
Usage : theme-flash-smoke.py [--root DOSSIER] [--out DOSSIER]. Python Playwright, Chromium et FFmpeg requis.
Code 1 si un thème incorrect est observé.
"""
import argparse, base64, functools, http.server, json, shutil, subprocess, tempfile, threading, time
from pathlib import Path
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser(); ap.add_argument('--root', default=str(Path(__file__).resolve().parents[2])); ap.add_argument('--out'); a = ap.parse_args()
ROOT = Path(a.root); OUT = Path(a.out) if a.out else Path(tempfile.mkdtemp(prefix='theme-flash-')); OUT.mkdir(parents=True, exist_ok=True)
BG = {'kerynq': '#efece3', 'dark': '#0b0d12', 'light': '#f6f6f3', 'pro': '#eef1f5', 'cyber': '#05060d', 'girly': '#fff1f7', 'aurora': '#0a0f1f', 'manga': '#fbfaf5', 'medecine': '#eef8f8', 'tuning': '#0b0b0d', 'animaux': '#fbf4e8', 'finance': '#07140f'}
SCHEME = {t: ('dark' if t in ('dark', 'cyber', 'aurora', 'tuning', 'finance') else 'light') for t in BG}
LS = 'kerynq-premium-v5'


class Slow(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, '.js': 'text/javascript', '.webmanifest': 'application/json'}
    delays = {}
    no_store = True  # sinon le navigateur ressert app.js depuis son cache et le délai ne s'applique pas
    def log_message(self, *x): pass
    def end_headers(self):
        if Slow.no_store: self.send_header('Cache-Control', 'no-store')
        super().end_headers()
    def do_GET(self):
        path = self.path.split('?')[0]
        for key, d in Slow.delays.items():
            if path.endswith(key): time.sleep(d)
        super().do_GET()


srv = http.server.ThreadingHTTPServer(('localhost', 0), functools.partial(Slow, directory=str(ROOT))); srv.handle_error = lambda *x: None; threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f'http://localhost:{srv.server_address[1]}/index.html'
PROBE = """(()=>{const L=window.__flash={frames:[],attrs:[],paint:null};const de=()=>document.documentElement;
const snap=()=>{const e=de();if(!e)return;const b=document.body&&getComputedStyle(e).getPropertyValue('--bg').trim();L.frames.push([e.dataset.theme,b||null])};
new MutationObserver(()=>{const e=de();if(e&&!L.obs){L.obs=1;let last=e.dataset.theme;new MutationObserver(()=>{const v=e.dataset.theme;if(v!==last){L.attrs.push([v,!!document.body]);last=v}}).observe(e,{attributes:true,attributeFilter:['data-theme']})}}).observe(document,{childList:true});
try{new PerformanceObserver(l=>{for(const x of l.getEntries())if(x.name==='first-paint'&&!L.paint)L.paint={theme:de().dataset.theme,bg:getComputedStyle(de()).getPropertyValue('--bg').trim(),meta:document.querySelector('meta[name=theme-color]')?.content,t:x.startTime}}).observe({type:'paint',buffered:true})}catch{}
const raf=()=>{snap();requestAnimationFrame(raf)};requestAnimationFrame(raf)})();"""
NO_STORAGE = "Object.defineProperty(window,'localStorage',{get(){throw new DOMException('denied','SecurityError')}});"


def pixels(frames, dest):
    """Couleur peinte, lue à un endroit de la marge dans chaque image du screencast."""
    out = []
    for i, data in enumerate(frames):
        p = dest / f'f{i:03d}.jpg'; p.write_bytes(base64.b64decode(data))
        r = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(p), '-vf', 'crop=4:4:iw-10:ih/2,scale=1:1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True)
        out.append(tuple(r.stdout[:3]))
    return out


def lightness(c): return sum(c) / 3


def run(browser, name, expected, storage=None, init=None, hard=False, reuse=None, shots=False, slow=None):
    Slow.delays = slow if slow is not None else {'styles.css': .25, 'app.js': .9, 'catalog-core.js': .2}
    ctx = reuse or browser.new_context(viewport={'width': 1000, 'height': 700}, reduced_motion='reduce', service_workers='block')
    ctx.add_init_script(PROBE)
    if init: ctx.add_init_script(init)
    pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if 'Content Security Policy' in m.text and not m.text.startswith('Refused to apply a stylesheet') else None)
    if storage is not None:
        Slow.delays = {}
        pg.goto(URL); pg.evaluate("s=>{localStorage.clear();for(const [k,v] of Object.entries(s))localStorage.setItem(k,v)}", storage); pg.reload(); pg.wait_for_timeout(200)
        Slow.delays = slow if slow is not None else {'styles.css': .25, 'app.js': .9, 'catalog-core.js': .2}
        before = pg.evaluate('JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([k])=>k!=="%s")))' % LS)
    else:
        before = None
    settle = reuse is not None and storage is None
    if settle:
        saved = dict(Slow.delays); Slow.delays = {}; pg.goto(URL); pg.wait_for_timeout(300); Slow.delays = saved
    frames = []; cdp = None
    try:
        cdp = ctx.new_cdp_session(pg); cdp.send('Page.enable')
        cdp.on('Page.screencastFrame', lambda f: (frames.append(f['data']), cdp.send('Page.screencastFrameAck', {'sessionId': f['sessionId']})))
        cdp.send('Page.startScreencast', {'format': 'jpeg', 'quality': 80, 'everyNthFrame': 1})
    except Exception:
        cdp = None
    if storage is not None or settle:
        if hard and cdp:
            cdp.send('Page.reload', {'ignoreCache': True}); pg.wait_for_timeout(100)
        else:
            pg.reload(wait_until='commit')
    else:
        pg.goto(URL, wait_until='commit')
    for _ in range(200):
        pg.wait_for_timeout(50)
        try:
            if pg.evaluate("document.readyState==='complete'&&!document.documentElement.classList.contains('is-booting')"): break
        except Exception: pass
    pg.wait_for_timeout(400)
    if cdp: cdp.send('Page.stopScreencast')
    log = pg.evaluate('window.__flash')
    themes = sorted({f[0] for f in log['frames'] if f[0]})
    final = pg.evaluate("document.documentElement.dataset.theme")
    final_meta = pg.evaluate("document.querySelector('meta[name=theme-color]').content")
    bad = []
    if final != expected: bad.append(f'thème final {final}')
    if themes and themes != [expected]: bad.append(f'thèmes vus aux images : {themes}')
    # Avant le body, rien n'a pu être rendu : seul un changement ensuite est visible.
    late = [x for x in log['attrs'] if x[1]]
    if late: bad.append(f"thème changé après le début du rendu : {late}")
    if log['paint'] and log['paint']['theme'] != expected: bad.append(f"première image : {log['paint']['theme']}")
    if log['paint'] and log['paint']['meta'] != BG[expected]: bad.append(f"theme-color à la première image : {log['paint']['meta']}")
    if pg.evaluate("getComputedStyle(document.documentElement).colorScheme") != SCHEME[expected]: bad.append('color-scheme')
    if pg.evaluate("document.querySelector('meta[name=color-scheme]').content") != SCHEME[expected]: bad.append('meta color-scheme')
    if final_meta != BG[expected]: bad.append(f'theme-color final {final_meta}')
    if errs: bad.append(f'erreurs {errs[:2]}')
    if before is not None and pg.evaluate('JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([k])=>k!=="%s")))' % LS) != before: bad.append('données modifiées')
    d = OUT / name; d.mkdir(exist_ok=True)
    px = pixels(frames, d) if frames else []
    tgt = lightness(tuple(int(BG[expected][i:i + 2], 16) for i in (1, 3, 5)))
    wrong = [i for i, c in enumerate(px) if abs(lightness(c) - tgt) > 70]
    if wrong: bad.append(f'{len(wrong)} image(s) peinte(s) sur {len(px)} avec une mauvaise clarté, ex. {px[wrong[0]]}')
    print(('PASS ' if not bad else 'FAIL ') + f'{name}: images {len(log["frames"])}, peintes {len(px)}' + ('' if not bad else ' :: ' + '; '.join(bad)))
    if not reuse: ctx.close()
    else: pg.close()
    return {'name': name, 'expected': expected, 'problems': bad, 'painted': [list(c) for c in px], 'first_paint': log['paint'], 'attrs': log['attrs']}


def held_frame(browser, theme):
    """Page déjà affichée, app.js retenu : capture de ce que voit l'utilisateur à ce moment précis."""
    Slow.delays = {}
    ctx = browser.new_context(viewport={'width': 1000, 'height': 700}, reduced_motion='reduce', service_workers='block'); pg = ctx.new_page(); pg.goto(URL)
    pg.evaluate("t=>localStorage.setItem('kerynq-premium-v5',JSON.stringify({theme:t}))", theme); pg.reload(); pg.wait_for_timeout(200)
    Slow.delays = {'app.js': 2.5}
    pg.reload(wait_until='commit')
    for _ in range(100):
        pg.wait_for_timeout(30)
        try:
            if pg.evaluate("!!document.getElementById('topic')&&document.documentElement.classList.contains('is-booting')&&!!getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()"): break
        except Exception: pass
    state = pg.evaluate("({t:document.documentElement.dataset.theme,bg:getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(),meta:document.querySelector('meta[name=theme-color]').content,app:!document.documentElement.classList.contains('is-booting')})")
    shot = OUT / f'retenu-{theme}.png'; pg.screenshot(path=str(shot))
    r_ = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(shot), '-vf', 'crop=4:4:iw-10:ih/2,scale=1:1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True); px = list(r_.stdout[:3])
    bad = []
    if state['app']: bad.append('app.js déjà exécuté : mesure invalide')
    if state['t'] != theme: bad.append(f"thème visible : {state['t']}")
    if state['bg'] != BG[theme]: bad.append(f"fond visible : {state['bg']}")
    if state['meta'] != BG[theme]: bad.append(f"theme-color : {state['meta']}")
    print(('PASS ' if not bad else 'FAIL ') + f'retenu-{theme}: pixel {px}' + ('' if not bad else ' :: ' + '; '.join(bad)))
    Slow.delays = {}; ctx.close()
    return {'name': 'retenu-' + theme, 'expected': theme, 'problems': bad, 'pixel': px, 'state': state}


results = []
with sync_playwright() as p:
    b = p.chromium.launch()
    for t in BG: results.append(held_frame(b, t))
    prof = lambda t: {LS: json.dumps({'theme': t, 'topic': ''})}
    for t in BG: results.append(run(b, 'theme-' + t, t, prof(t)))
    results.append(run(b, 'premiere-visite', 'kerynq'))
    results.append(run(b, 'profil-sans-theme', 'dark', {LS: json.dumps({'topic': 'x'})}))
    results.append(run(b, 'ancien-profil-v1', 'dark', {'kerynq-premium-v1': json.dumps({'topic': 'x'})}))
    results.append(run(b, 'ancien-v1-clair', 'light', {'kerynq-premium-v1': json.dumps({'theme': 'light'})}))
    results.append(run(b, 'theme-inconnu', 'kerynq', {LS: json.dumps({'theme': 'inconnu'})}))
    results.append(run(b, 'theme-herite', 'kerynq', {LS: json.dumps({'theme': 'constructor'})}))
    results.append(run(b, 'stockage-indisponible', 'kerynq', init=NO_STORAGE))
    results.append(run(b, 'rechargement-force', 'cyber', prof('cyber'), hard=True))
    results.append(run(b, 'reseau-tres-lent', 'finance', prof('finance'), slow={'styles.css': 1.2, 'app.js': 2.5, 'catalog-core.js': .8, 'search-query-core.js': .8}))
    results.append(run(b, 'favoris-conserves', 'tuning', {LS: json.dumps({'theme': 'tuning'}), 'kerynq-saved-v1': json.dumps([{'id': 'a', 'name': 'F', 'topic': 'F', 'folder': 'G', 'category': 'T', 'pinned': False, 'settings': {'topic': 'F'}}]), 'kerynq-v5-templates': json.dumps([{'id': 't', 'label': 'M', 'settings': {'topic': 'x'}}])}))
    Slow.no_store = False
    results.append(run(b, 'navigateur-avec-cache-http', 'cyber', prof('cyber')))
    Slow.no_store = True
    # JSON abîmé : écrit tel quel.
    Slow.delays = {}
    ctx = b.new_context(viewport={'width': 1000, 'height': 700}, service_workers='block'); pg = ctx.new_page(); pg.goto(URL); pg.evaluate("localStorage.setItem('%s','{pas du json')" % LS); Slow.delays = {'app.js': .9}; pg.close()
    results.append(run(b, 'json-abime', 'kerynq', reuse=ctx)); ctx.close()
    # Cache PWA existant : service worker actif, le thème choisi ensuite doit tenir au rechargement.
    Slow.delays = {}
    ctx = b.new_context(viewport={'width': 1000, 'height': 700}, reduced_motion='reduce', service_workers='allow'); pg = ctx.new_page(); pg.goto(URL); pg.evaluate("navigator.serviceWorker.ready.then(()=>1)"); pg.reload(); pg.wait_for_function("()=>!!navigator.serviceWorker.controller")
    pg.evaluate("localStorage.setItem('%s',JSON.stringify({theme:'aurora'}));localStorage.setItem('kerynq-saved-v1','[]')" % LS); keys = pg.evaluate('caches.keys()'); pg.close()
    results.append(run(b, 'cache-pwa-existant', 'aurora', reuse=ctx)); ctx.set_offline(True)
    pg = ctx.new_page(); pg.goto(URL); off = pg.evaluate("document.documentElement.dataset.theme"); boot = pg.evaluate("[...document.scripts].some(s=>s.src.includes('theme-boot'))")
    ok = off == 'aurora' and boot; print(('PASS' if ok else 'FAIL'), 'hors ligne :', off, 'caches', keys); results.append({'name': 'hors-ligne', 'expected': 'aurora', 'problems': [] if ok else [f'{off}, boot {boot}']}); ctx.close()
    # Mode privé de l'application : le thème suit le profil enregistré.
    Slow.delays = {}
    ctx = b.new_context(viewport={'width': 1000, 'height': 700}, service_workers='block'); pg = ctx.new_page(); pg.goto(URL); pg.evaluate("localStorage.setItem('%s',JSON.stringify({theme:'manga'}))" % LS); pg.reload(); pg.click('#privateSearchToggle'); pg.close()
    results.append(run(b, 'apres-mode-prive', 'manga', reuse=ctx)); ctx.close()
    b.close()
    for engine in ('firefox', 'webkit'):
        Slow.delays = {'app.js': .9}
        br = getattr(p, engine).launch(); ctx = br.new_context(service_workers='block'); pg = ctx.new_page(); Slow.delays = {}; pg.goto(URL); pg.evaluate("localStorage.setItem('%s',JSON.stringify({theme:'cyber'}))" % LS); pg.close(); Slow.delays = {'app.js': .9}
        results.append(run(br, engine + '-cyber', 'cyber', reuse=ctx)); br.close()
srv.shutdown()
(OUT / 'results.json').write_text(json.dumps(results, ensure_ascii=False, indent=1), encoding='utf-8')
fails = [r for r in results if r['problems']]
print(f'{len(results)} scénarios, {len(fails)} en échec. Preuves : {OUT}')
raise SystemExit(1 if fails else 0)
