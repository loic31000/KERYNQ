const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const { THEMES, normalize, DEFAULT } = require('../../assets/js/core/catalog-core.js');

const root = join(__dirname, '../..');
const code = readFileSync(join(root, 'assets/js/theme-boot.js'), 'utf8');
const css = readFileSync(join(root, 'assets/css/styles.css'), 'utf8');

function boot(store, broken) {
  const metas = { 'meta[name="theme-color"]': { setAttribute(k, v) { this.v = v; } }, 'meta[name="color-scheme"]': { setAttribute(k, v) { this.v = v; } } };
  const attrs = {};
  const classList = { contains: () => true, add() {} };
  const localStorage = { getItem(k) { if (broken) throw new Error('denied'); return k in store ? store[k] : null; }, setItem() { throw new Error('must not write'); } };
  vm.runInNewContext(code, { localStorage, document: { documentElement: { classList, setAttribute(k, v) { attrs[k] = v; } }, querySelector: q => metas[q] }, window: { addEventListener() {} } });
  return { destination: attrs['data-boot-destination'], theme: attrs['data-theme'], color: metas['meta[name="theme-color"]'].v, scheme: metas['meta[name="color-scheme"]'].v };
}
// Règle de référence : celle de load() dans app.js.
function appTheme(store) {
  try {
    const raw = store['kerynq-premium-v5'];
    if (raw) { const stored = JSON.parse(raw); if (stored && typeof stored === 'object' && !stored.theme) stored.theme = 'dark'; return normalize(stored).theme; }
    const old = store['kerynq-premium-v1'];
    if (old) return normalize({ theme: 'dark', ...JSON.parse(old) }).theme;
    return DEFAULT.theme;
  } catch { return DEFAULT.theme; }
}

test('the boot table matches the catalogue and the stylesheet', () => {
  const table = /var THEMES = (\{[\s\S]*?\});/.exec(code)[1];
  const parsed = vm.runInNewContext('(' + table + ')');
  assert.deepEqual(Object.keys(parsed).sort(), THEMES.map(x => x[0]).sort());
  for (const [name, [bg, scheme]] of Object.entries(parsed)) {
    const block = name === 'dark' ? /\[data-theme="dark"\]\{\s*--bg:(#\w+)[\s\S]*?color-scheme:(\w+)/.exec(css) : name === 'light' ? /:root\{\s*--bg:(#\w+)[\s\S]*?color-scheme:(\w+)/.exec(css) : new RegExp(`\\[data-theme="${name}"\\]\\{--bg:(#\\w+)[^}]*color-scheme:(\\w+)`).exec(css);
    assert.ok(block, name); assert.equal(bg, block[1], name); assert.equal(scheme, block[2], name);
  }
});
test('each theme is applied with its colour and scheme', () => {
  for (const [name] of THEMES) { const r = boot({ 'kerynq-premium-v5': JSON.stringify({ theme: name }) }); assert.equal(r.theme, name); assert.ok(r.color.startsWith('#')); assert.ok(['light', 'dark'].includes(r.scheme)); }
});
test('boot gives the same theme as the application in every stored state', () => {
  const v5 = ['{"theme":"cyber"}', '{"topic":"x"}', '{"theme":""}', '{"theme":"inconnu"}', '{"theme":"constructor"}', '{"theme":"__proto__"}', '{"theme":5}', '{"theme":null}', '[]', 'null', '5', '"x"', '{pas du json'];
  const v1 = ['{"theme":"light"}', '{"topic":"x"}', '{"theme":"inconnu"}', '{"theme":""}', '{"theme":5}', '[]', 'null', '5', '{pas du json'];
  for (const raw of v5) assert.equal(boot({ 'kerynq-premium-v5': raw }).theme, appTheme({ 'kerynq-premium-v5': raw }), 'v5 ' + raw);
  for (const raw of v1) assert.equal(boot({ 'kerynq-premium-v1': raw }).theme, appTheme({ 'kerynq-premium-v1': raw }), 'v1 ' + raw);
  assert.equal(boot({}).theme, DEFAULT.theme);
});
test('unavailable storage gives the default theme and writes nothing', () => {
  assert.equal(boot({}, true).theme, DEFAULT.theme);
});
test('the first rendered mode matches what the application will show', () => {
  for (const [raw, want] of [['{"previewTab":"prompt"}', 'prompt'], ['{"previewTab":"web"}', 'web'], ['{"previewTab":"x"}', 'web'], ['{}', 'web'], ['[]', 'web'], ['{bad', 'web']]) assert.equal(boot({ 'kerynq-premium-v5': raw }).destination, want, raw);
  assert.equal(boot({}).destination, 'web');
  assert.equal(boot({}, true).destination, 'web');
});
