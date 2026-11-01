from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'index.html').read_text(encoding='utf-8')
for fn in ['search-query-core.js','privacy-core.js']:
 HTML=HTML.replace(f'<script src="./{fn}"></script>',f'<script>{(ROOT/fn).read_text(encoding="utf-8")}</script>')
EXPECT={'administration':'Administration','family':'Famille / Parentalité','animals':'Animaux','housing':'Logement','law':'Droit / Justice','personalfinance':'Finances personnelles'}
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in [1440,390,320]:
  ctx=browser.new_context(viewport={'width':width,'height':850},reduced_motion='reduce',service_workers='block')
  page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(HTML,wait_until='load')
  assert page.locator('#familyFilter').is_visible(), 'families should be visible in simple mode'
  page.locator('#modeAdvanced').click()
  page.locator('#showAll').click()
  assert page.locator('.category-btn').count()==33,('count',page.locator('.category-btn').count())
  assert page.locator('#categories svg').count()==33
  for id,name in EXPECT.items():
   page.locator('#categorySearch').fill(name)
   btn=page.locator(f'.category-btn[data-category-id="{id}"]')
   assert btn.count()==1,(id,'search')
   btn.focus();btn.press('Enter')
   assert btn.get_attribute('aria-pressed')=='true'
   assert page.evaluate('document.activeElement?.dataset.categoryId')==id
   assert name in page.locator('#specificTitle').inner_text()
   assert page.locator('#specialFilters input[type=checkbox]').count()>=7
   page.locator('#topic').fill('Question de test')
   prompt=page.locator('#promptPreview').input_value()
   assert name in prompt and 'Question de test' in prompt
   if id in ('law','administration','personalfinance','housing'):
    assert 'juridiction' in prompt.lower()
   assert page.locator('#queryPreview').inner_text().strip()=='Question de test'
   page.locator('#categorySearch').fill('')
  page.locator('#familyFilter').select_option('quotidien')
  assert page.locator('.category-btn').count()==4
  assert page.locator('.category-btn[aria-pressed="true"]').count()==1
  page.locator('#familyFilter').select_option('demarches')
  assert page.locator('.category-btn').count()==3
  page.locator('#familyFilter').select_option('all')
  page.locator('#categorySearch').fill('santé')
  health=page.locator('[data-category-id="health"]');assert health.count()==1;health.click()
  assert 'Médecine' in page.locator('#specificTitle').inner_text()
  assert 'diagnostic' in page.locator('#promptPreview').input_value().lower()
  page.locator('#categorySearch').fill('')
  page.locator('#familyFilter').select_option('sciences')
  assert page.locator('.category-btn').count()==4
  assert not errors,(width,errors)
  dim=page.evaluate('({a:document.documentElement.scrollWidth,b:document.documentElement.clientWidth})')
  assert dim['a']<=dim['b']+2,(width,dim)
  print('PASS 33 thèmes, 8 familles, sécurité des consignes, reflow',width)
  ctx.close()
 browser.close()
