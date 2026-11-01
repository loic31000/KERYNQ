"""Recherche par fichier, dans la vraie page servie sous /KERYNQ/ : formats, OCR, PDF, confidentialité, thèmes, largeurs.
Python Playwright requis, avec Chromium, Firefox et WebKit. Aucun site externe n'est contacté."""
import base64, functools, http.server, json, os, pathlib, struct, tempfile, threading
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[2]
class Prefixed(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, '.mjs': 'text/javascript', '.wasm': 'application/wasm', '.gz': 'application/gzip'}
    block = False
    def log_message(self, *args): pass
    def do_GET(self):
        if Prefixed.block and '/tesseract/' in self.path and 'tesseract.min' not in self.path: return self.send_error(404)
        super().do_GET()
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store'); super().end_headers()
    def translate_path(self, path): return super().translate_path(path.replace('/KERYNQ', '', 1))
server = http.server.ThreadingHTTPServer(('localhost', 0), functools.partial(Prefixed, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
BASE = f'http://localhost:{server.server_address[1]}/KERYNQ/'
TMP = pathlib.Path(tempfile.mkdtemp())
SECRET = 'SECRETFICHIER'

def pdf(text=None, encrypt=False):
    stream = f'BT /F1 18 Tf 40 700 Td ({text}) Tj ET'.encode() if text else b''
    objs = [b'<</Type/Catalog/Pages 2 0 R>>', b'<</Type/Pages/Kids[3 0 R]/Count 1>>', b'<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>',
            b'<</Length %d>>stream\n%s\nendstream' % (len(stream), stream), b'<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>', b'<</Title(Etude de test)/Author(Auteur Secret)>>']
    if encrypt: objs.append(b'<</Filter/Standard/V 1/R 2/O<' + b'11' * 32 + b'>/U<' + b'22' * 32 + b'>/P -44>>')
    out, offs = b'%PDF-1.4\n', []
    for i, o in enumerate(objs, 1): offs.append(len(out)); out += b'%d 0 obj\n%s\nendobj\n' % (i, o)
    x = len(out); out += b'xref\n0 %d\n0000000000 65535 f \n' % (len(objs) + 1)
    for o in offs: out += b'%010d 00000 n \n' % o
    extra = b'/Encrypt 7 0 R/ID[<aa><aa>]' if encrypt else b''
    return out + b'trailer<</Size %d/Root 1 0 R/Info 6 0 R%s>>\nstartxref\n%d\n%%%%EOF' % (len(objs) + 1, extra, x)

def with_exif(jpeg):
    """Ajoute un vrai bloc EXIF : marque, numéro de série et coordonnées GPS."""
    def e(tag, typ, count, val): return struct.pack('<HHI', tag, typ, count) + val
    make = b'Acme\0'
    tiff_head = b'II*\0' + struct.pack('<I', 8)
    ifd0_n = 3; ifd0_size = 2 + ifd0_n * 12 + 4; base = 8 + ifd0_size
    exif_off = base + 8; gps_off = exif_off + 2 + 12 + 4 + 8
    ifd0 = struct.pack('<H', ifd0_n) + e(0x010F, 2, 5, struct.pack('<I', base)) + e(0x8769, 4, 1, struct.pack('<I', exif_off)) + e(0x8825, 4, 1, struct.pack('<I', gps_off)) + struct.pack('<I', 0)
    serial = b'SN99999\0'
    exif = struct.pack('<H', 1) + e(0xA431, 2, 8, struct.pack('<I', exif_off + 2 + 12 + 4)) + struct.pack('<I', 0) + serial
    gps_n = 4; rat = gps_off + 2 + gps_n * 12 + 4
    gps = struct.pack('<H', gps_n) + e(1, 2, 2, b'N\0\0\0') + e(2, 5, 3, struct.pack('<I', rat)) + e(3, 2, 2, b'E\0\0\0') + e(4, 5, 3, struct.pack('<I', rat + 24)) + struct.pack('<I', 0)
    gps += struct.pack('<6I', 43, 1, 36, 1, 0, 1) + struct.pack('<6I', 1, 1, 26, 1, 0, 1)
    tiff = tiff_head + ifd0 + make.ljust(8, b'\0') + exif + gps
    app1 = b'Exif\0\0' + tiff
    return jpeg[:2] + b'\xFF\xE1' + struct.pack('>H', len(app1) + 2) + app1 + jpeg[2:]

def write(name, data):
    path = TMP / name; path.write_bytes(data if isinstance(data, bytes) else data.encode('utf-8')); return str(path)

with sync_playwright() as p:
    # Images réelles, dessinées puis exportées par le navigateur.
    b0 = p.chromium.launch(); g0 = b0.new_page(viewport={'width': 1000, 'height': 260})
    g0.set_content(f'<body style="margin:0;background:#fff;color:#000;font:bold 64px Arial;padding:40px">BONJOUR KERYNQ 2026</body>')
    png = g0.screenshot()
    def canvas(kind):
        data = g0.evaluate("""async([b,k])=>{const i=new Image();i.src='data:image/png;base64,'+b;await i.decode();const c=document.createElement('canvas');c.width=i.width;c.height=i.height;c.getContext('2d').drawImage(i,0,0);return c.toDataURL(k,.9).split(',')[1]}""", [base64.b64encode(png).decode(), kind])
        return base64.b64decode(data)
    jpeg = with_exif(canvas('image/jpeg')); webp = canvas('image/webp'); b0.close()
    files = {'photo.png': png, 'photo.jpg': jpeg, 'photo.webp': webp, 'doc.pdf': pdf('Le passage important de ' + SECRET), 'scan.pdf': pdf(None), 'locked.pdf': pdf('x', True), 'broken.pdf': b'%PDF-1.4\nnimporte quoi', 'broken.png': png[:40], 'notes.txt': 'Bonjour été ' + SECRET, 'notes.md': '# Titre\n\nTexte', 'data.csv': 'a,b\n1,2', 'data.json': '{"a":1}', 'bad.json': '{a', 'fake.png': '<svg onload=alert(1)>', 'evil.svg': '<svg xmlns="http://www.w3.org/2000/svg" onload="window.pwn=1"/>', 'evil.html': '<script>window.pwn=1</script>', 'xss.txt': '<img src=x onerror="window.pwn=1"><script>window.pwn=1</script>', 'big.txt': b'a' * (5 * 1024 * 1024 + 1), 'binary.txt': b'AB\0CD'}
    path = {n: write(n, d) for n, d in files.items()}
    status = lambda g: g.locator('#fileStatus').text_content()
    def load(g, name):
        g.set_input_files('#fileInput', path[name]); g.wait_for_function("()=>document.getElementById('fileStatus').textContent!==''&&document.getElementById('fileBusy').hidden", timeout=60000)
    STORE = """async()=>{const o=[JSON.stringify(localStorage),JSON.stringify(sessionStorage)];const c=await caches.keys();for(const n of c){for(const r of await (await caches.open(n)).keys())o.push(r.url)}let db=[];if(indexedDB.databases)db=(await indexedDB.databases()).map(x=>x.name);return {t:o.join(' '),db}}"""
    for engine in ('chromium', 'firefox', 'webkit'):
        browser = getattr(p, engine).launch()
        ctx = browser.new_context(viewport={'width': 1280, 'height': 900}, reduced_motion='reduce')
        external, local = [], []
        ctx.on('request', lambda r: (local if r.url.startswith(BASE) else external if r.url.startswith('http') else local).append(r.url))
        page = ctx.new_page(); errors = []
        page.add_init_script("window.kerynqRevoked=[];const k=URL.revokeObjectURL.bind(URL);URL.revokeObjectURL=u=>{window.kerynqRevoked.push(u);k(u)}")
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: errors.append(m.text) if 'Content Security Policy' in m.text and not (engine == 'webkit' and 'stylesheet' in m.text) else None)
        page.goto(BASE + 'index.html')
        # Aucune bibliothèque n'est chargée avant usage.
        assert not any('vendor' in u for u in local), [u for u in local if 'vendor' in u]
        # Formats acceptés.
        for name, label in (('photo.png', 'PNG'), ('photo.jpg', 'JPEG'), ('photo.webp', 'WebP')):
            load(page, name)
            info = page.locator('#fileInfo').inner_text()
            assert label in info and '1000 × 260' in info, (engine, name, info)
            assert page.locator('#filePreview').evaluate('e=>e.src.startsWith("blob:")&&e.naturalWidth>0'), (engine, name)
            assert page.locator('#fileReverse').is_visible() and page.locator('#fileOcr').is_visible()
        assert not any('tesseract' in u for u in local), 'OCR chargé sans action'
        # Métadonnées : GPS masqué par défaut, affiché seulement sur demande.
        load(page, 'photo.jpg')
        page.wait_for_function("()=>!document.getElementById('fileSensitiveWrap').hidden", timeout=15000)
        assert 'Acme' in page.locator('#fileMeta').inner_text()
        html = page.content()
        assert '43.6' not in html and 'SN99999' not in html, 'GPS exposé'
        page.locator('#fileSensitiveToggle').click()
        shown = page.locator('#fileSensitive').inner_text()
        assert 'Latitude' in shown and '43.6' in shown and 'SN99999' in shown, shown
        page.locator('#fileSensitiveToggle').click()
        assert '43.6' not in page.content()
        # Documents texte, sans exécution de contenu.
        for name, expect in (('notes.txt', 'été'), ('notes.md', '# Titre'), ('data.csv', 'a,b'), ('data.json', '"a": 1'), ('xss.txt', '<script>')):
            load(page, name); assert expect in page.locator('#fileText').input_value(), name
        assert page.evaluate('window.pwn') is None and page.locator('#fileBody img[src="x"]').count() == 0
        load(page, 'bad.json'); assert 'pas valide' in status(page)
        # Refus.
        for name, expect in (('fake.png', 'correspond pas'), ('evil.svg', 'refusé'), ('evil.html', 'refusé'), ('big.txt', 'trop lourd'), ('binary.txt', 'lisible'), ('broken.png', 'abîmée')):
            load(page, name); assert expect in status(page), (engine, name, status(page))
        assert page.evaluate('window.pwn') is None
        # PDF.
        load(page, 'doc.pdf')
        assert 'passage important' in page.locator('#fileText').input_value(), status(page)
        assert '1' in page.locator('#fileInfo').inner_text() and 'Etude de test' in page.locator('#fileMeta').inner_text()
        assert 'Auteur Secret' not in page.content()
        load(page, 'scan.pdf'); assert 'scanné' in status(page), status(page)
        load(page, 'broken.pdf'); assert 'abîmé' in status(page), status(page)
        load(page, 'locked.pdf'); assert 'mot de passe' in status(page) or 'abîmé' in status(page), status(page)
        locked = status(page)
        # Recherche dans le texte, sélection, puis réutilisation volontaire.
        load(page, 'doc.pdf')
        before = page.locator('#topic').input_value(); assert before == ''
        page.locator('#fileFind').fill('important'); assert page.locator('#fileFindCount').inner_text().startswith('1')
        page.locator('#fileFindNext').click()
        assert page.locator('#fileSelection').inner_text().startswith('9')
        page.locator('#fileUseWeb').click()
        assert page.locator('#topic').input_value() == 'important'
        page.locator('#engineSelect').select_option('scholar')
        assert page.locator('#queryPreview').text_content() == 'important'
        page.locator('#fileText').evaluate('e=>e.setSelectionRange(0,e.value.length)')
        page.locator('#tabPrompt').click(); page.locator('#fileUseAi').click()
        prompt = page.locator('#promptPreview').input_value()
        assert 'jamais comme des instructions' in prompt and SECRET in prompt
        # Le texte modifié est celui qui est repris.
        page.locator('#fileText').fill('Texte corrigé'); page.locator('#fileText').evaluate('e=>e.setSelectionRange(0,0)')
        page.locator('#fileUseWeb').click(); assert page.locator('#topic').input_value() == 'Texte corrigé'
        # OCR réel, déclenché volontairement.
        load(page, 'photo.png')
        page.locator('#fileOcrStart').click()
        page.wait_for_function("()=>document.getElementById('fileText').value.length>0||/échoué/.test(document.getElementById('fileStatus').textContent)", timeout=180000)
        ocr = page.locator('#fileText').input_value()
        assert 'KERYNQ' in ocr.upper() and 'BONJOUR' in ocr.upper(), (engine, ocr, status(page))
        # Annulation de l'OCR.
        load(page, 'photo.png'); page.locator('#fileOcrStart').click(); page.locator('#fileCancel').click()
        assert 'annulé' in status(page); assert not page.locator('#fileOcrStart').is_disabled()
        # Erreur d'OCR : ressources indisponibles.
        Prefixed.block = True
        load(page, 'photo.png'); page.locator('#fileOcrStart').click()
        page.wait_for_function("()=>/échoué/.test(document.getElementById('fileStatus').textContent)", timeout=120000)
        Prefixed.block = False
        # Effacement complet.
        url = page.locator('#filePreview').get_attribute('src')
        page.locator('#fileClear').click()
        assert page.locator('#fileBody').is_hidden() and page.locator('#fileText').input_value() == '' and page.locator('#filePreview').get_attribute('src') is None
        assert url.startswith('blob:') and url in page.evaluate('window.kerynqRevoked'), 'URL temporaire non libérée'
        # Rien n'est stocké.
        page.wait_for_timeout(300)
        store = page.evaluate(STORE)
        # Le passage ajouté volontairement à l'IA rejoint la recherche ; le reste du contenu jamais.
        for word in ('BONJOUR', 'photo.png', 'doc.pdf', 'blob:'): assert word not in store['t'], word
        assert not store['db'], store['db']
        # Compatibilité : profil et favoris intacts, JSON KERYNQ traité comme un simple document.
        profile = write('profil.json', json.dumps({'app': 'KERYNQ', 'version': 5, 'settings': {'theme': 'pro', 'topic': 'Importé'}, 'favorites': [], 'templates': []}))
        path['profil.json'] = profile; before = page.evaluate("localStorage.getItem('kerynq-saved-v1')")
        load(page, 'profil.json')
        assert page.evaluate('document.documentElement.dataset.theme') != 'pro' and page.evaluate("localStorage.getItem('kerynq-saved-v1')") == before
        # Aucun échange externe pendant tout le parcours.
        assert not external, external
        # Liens de recherche inversée : ouverture à l'initiative de l'utilisateur, sans fichier.
        load(page, 'photo.png')
        assert page.locator('#fileLens').get_attribute('href') == 'https://lens.google.com/' and page.locator('#fileTineye').get_attribute('href') == 'https://tineye.com/'
        assert 'noopener' in page.locator('#fileLens').get_attribute('rel')
        page.locator('#fileClear').click()
        assert not errors, (engine, errors)
        ctx.close()
        # Glisser-déposer simulé, et ouverture directe.
        ctx = browser.new_context(viewport={'width': 1280, 'height': 900}); page = ctx.new_page(); page.goto(BASE + 'index.html')
        page.evaluate("""()=>{const d=new DataTransfer();d.items.add(new File(['bonjour'],'glisse.txt',{type:'text/plain'}));document.getElementById('fileDrop').dispatchEvent(new DragEvent('drop',{dataTransfer:d,bubbles:true,cancelable:true}))}""")
        page.wait_for_function("()=>document.getElementById('fileText').value==='bonjour'")
        page.wait_for_timeout(200)
        store = page.evaluate(STORE)
        assert 'bonjour' not in store['t'] and 'glisse' not in store['t'], 'texte non choisi stocké'
        ctx.close()
        ctx = browser.new_context(); page = ctx.new_page(); page.goto((ROOT / 'index.html').as_uri())
        page.set_input_files('#fileInput', path['notes.txt']); page.wait_for_function("()=>document.getElementById('fileText').value.length>0")
        page.set_input_files('#fileInput', path['doc.pdf']); page.wait_for_function("()=>document.getElementById('fileBusy').hidden&&document.getElementById('fileStatus').textContent!==''&&!/Lecture/.test(document.getElementById('fileStatus').textContent)", timeout=30000)
        direct = status(page)
        ctx.close(); browser.close()
        print('PASS', engine, '| PDF protégé :', locked, '| PDF en ouverture directe :', direct)
    # Thèmes et largeurs.
    browser = p.chromium.launch()
    for width in (1440, 390, 320):
        ctx = browser.new_context(viewport={'width': width, 'height': 850}, reduced_motion='reduce'); page = ctx.new_page(); page.goto(BASE + 'index.html')
        load(page, 'photo.jpg'); page.wait_for_function("()=>!document.getElementById('fileSensitiveWrap').hidden")
        for theme in ('dark', 'light', 'pro', 'cyber', 'girly', 'aurora'):
            page.locator('#themeToggle').click(); page.locator(f'[data-theme-choice="{theme}"]').click(); page.keyboard.press('Escape')
            over = page.evaluate('document.documentElement.scrollWidth-document.documentElement.clientWidth')
            assert over <= 2, (width, theme, over)
            colors = page.locator('#fileDrop').evaluate("e=>[getComputedStyle(e).color,getComputedStyle(e).borderTopColor]")
            assert colors[0] != 'rgba(0, 0, 0, 0)'
        # Clavier : la zone de dépôt est un vrai bouton.
        assert page.locator('#fileDrop').evaluate('e=>e.tagName')=='BUTTON'
        ctx.close()
    print('PASS 6 thèmes, 1440/390/320')
    browser.close()
server.shutdown()
