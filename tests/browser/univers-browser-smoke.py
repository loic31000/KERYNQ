import os
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
def serve(route):
    url=route.request.url
    file=ROOT/url.replace('http://kerynq.test/','').split('?')[0]
    if url.startswith('http://kerynq.test/') and file.is_file():route.fulfill(body=file.read_bytes(),content_type={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml'}.get(file.suffix,'application/json'))
    else:route.abort()
EXPECT={'administration':'Administration','family':'Famille / Parentalité','animals':'Animaux','housing':'Logement','law':'Droit / Justice','personalfinance':'Finances personnelles','childhood':'Enfance & Scolarité','work':'Travail & Emploi','retirement':'Retraite & Autonomie','cooking':'Cuisine & Alimentation','homegarden':'Maison & Jardin','transport':'Transports & Déplacements'}
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=os.environ.get('KERYNQ_CHROMIUM') or None)
 for width in [1440,1024,768,390,320]:
  ctx=browser.new_context(viewport={'width':width,'height':850},reduced_motion='reduce',service_workers='block')
  page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.route('**/*',serve);page.goto('http://kerynq.test/index.html')
  page.locator('#tabPrompt').click()
  page.locator('#domainToggle').click()
  assert page.locator('.domain-option').count()==39,('count',page.locator('.domain-option').count())
  assert page.locator('#categories svg').count()==39
  # Chaque domaine des 39 est sélectionnable, y compris le premier et le dernier de chaque famille.
  ids=page.evaluate("KerynqCatalog.TOPICS.map(t=>t.id)")
  for id in ids:
   if page.locator('#domainPanel').is_hidden():page.locator('#domainToggle').click()
   page.locator(f'.domain-option[data-category-id="{id}"]').click()
   assert page.evaluate("JSON.parse(localStorage.getItem('kerynq-premium-v5')).category")==id,id
   assert page.locator('#domainPanel').is_hidden()
  for id,name in EXPECT.items():
   page.locator('#domainToggle').click()
   page.locator('#categorySearch').fill(name)
   opt=page.locator(f'.domain-option[data-category-id="{id}"]')
   assert opt.count()==1,(id,'search')
   page.keyboard.press('Enter')
   assert page.locator('#domainName').inner_text()==name
   assert page.evaluate('document.activeElement.id')=='domainToggle'
   assert name in page.locator('#specificTitle').text_content()
   assert page.locator('#specialFilters input[type=checkbox]').count()>=7
   page.locator('#topic').fill('Question de test')
   prompt=page.locator('#promptPreview').input_value()
   assert name in prompt and 'Question de test' in prompt
   if id in ('law','administration','personalfinance','housing'):
    assert 'juridiction' in prompt.lower()
   assert page.locator('#queryPreview').text_content().strip()=='Question de test'
  # Familles : elles filtrent la liste sans changer le domaine choisi.
  page.locator('#domainToggle').click()
  current=page.locator('#domainName').inner_text()
  for family,count in (('quotidien',6),('demarches',4),('sciences',4),('formation',3),('mobilite',3)):
   page.locator('#familyFilter').select_option(family)
   assert page.locator('.domain-option').count()==count,(family,page.locator('.domain-option').count())
   assert page.locator('#domainName').inner_text()==current
  page.locator('#familyFilter').select_option('all')
  page.locator('#categorySearch').fill('santé')
  health=page.locator('[data-category-id="health"]');assert health.count()==1;health.click()
  assert 'Médecine' in page.locator('#specificTitle').text_content()
  assert 'diagnostic' in page.locator('#promptPreview').input_value().lower()
  assert not errors,(width,errors)
  dim=page.evaluate('({a:document.documentElement.scrollWidth,b:document.documentElement.clientWidth})')
  assert dim['a']<=dim['b']+2,(width,dim)
  print('PASS 39 thèmes, 8 familles, sécurité des consignes, reflow',width)
  ctx.close()
 browser.close()
