import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const page = readFileSync(join(root, 'index.html'), 'utf8');
const sourceFiles = ['assets/js/core/catalog-core.js', 'assets/js/app.js', 'assets/js/register-sw.js'];
// Les contrôles portent sur la page et sur le code qu'elle charge.
const html = [page, ...sourceFiles.map(file => readFileSync(join(root, file), 'utf8'))].join('\n');
const manifest = JSON.parse(readFileSync(join(root, 'manifest.webmanifest'), 'utf8'));
const fail = msg => { console.error('FAIL:', msg); process.exitCode = 1; };
const assert = (ok, msg) => { if (!ok) fail(msg); else console.log('OK:', msg); };

assert(html.includes('KERYNQ'), 'Branding KERYNQ présent');
assert(!html.includes('OSINT SEARCH'), 'Ancien nom absent');
assert(html.includes('service-worker.js'), 'Service worker référencé');
assert(html.includes('manifest.webmanifest'), 'Manifeste référencé');
assert(html.includes('id="topic"'), 'Champ de recherche présent');
assert(html.includes('id="runSearch"'), 'Action de recherche présente');
assert(html.includes('Ctrl') || html.includes('ctrlKey'), 'Raccourci clavier disponible');
assert(manifest.name === 'KERYNQ', 'Nom PWA');
for (const icon of manifest.icons) assert(existsSync(join(root, icon.src)), 'Icône '+icon.src);
for (const src of ['assets/icons/favicon.svg', 'service-worker.js']) assert(existsSync(join(root, src)), 'Fichier '+src);
const scripts = [...page.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
assert(scripts.length > 0, 'Scripts intégrés détectés');
for (const [i, script] of scripts.entries()) {
  try { new vm.Script(script[1], {filename: `inline-${i}.js`}); console.log('OK: Syntaxe script', i); }
  catch (err) { fail(`Syntaxe script ${i}: ${err.message}`); }
}
try { new vm.Script(readFileSync(join(root, 'service-worker.js'), 'utf8')); console.log('OK: Syntaxe service worker'); }
catch (err) { fail(`Syntaxe service worker: ${err.message}`); }

// Multi-assistant et documentation
const assistants = ['chatgpt','claude','gemini','kimi','grok','deepseek','perplexity','mistral','copilot'];
for (const assistant of assistants) assert(html.includes(`${assistant}:`), `Assistant disponible : ${assistant}`);
assert(html.includes('id="aiProvider"') && html.includes('id="openAIProvider"'), 'Sélecteur et ouverture multi-IA présents');
assert(html.includes('id="customAIUrl"'), 'Fournisseur personnalisé disponible');
assert(html.includes('KerynqPrivacy.safeAssistantUrl'), 'Vérification HTTPS de l’URL personnalisée');
assert(!html.includes('openChatGPT'), 'Pas de bouton ChatGPT codé en dur');
assert(!/window\.open\([^\)]*buildPrompt/.test(html), 'Pas de consigne automatiquement transmise dans URL');
for (const doc of ['LICENSE.md','docs/CONTRIBUTING.md','docs/CODE_OF_CONDUCT.md','docs/SECURITY.md','docs/SUPPORT.md','docs/ACCESSIBILITY.md','CHANGELOG.md','docs/ARCHITECTURE.md','docs/FOURNISSEURS_IA.md','docs/CONFIDENTIALITE.md','.github/ISSUE_TEMPLATE/bug_report.yml','.github/ISSUE_TEMPLATE/feature_request.yml','.github/PULL_REQUEST_TEMPLATE.md']) {
 assert(existsSync(join(root,doc)),`Document : ${doc}`);
}

// Le compilateur de requêtes est un fichier local indispensable au mode hors ligne.
assert(existsSync(join(root, 'assets/js/core/search-query-core.js')), 'Compilateur présent');
assert(html.includes('src="./assets/js/core/search-query-core.js"'), 'Compilateur chargé avant le script UI');
assert(readFileSync(join(root, 'service-worker.js'),'utf8').includes('assets/js/core/search-query-core.js'), 'Compilateur mis en cache PWA');
try { new vm.Script(readFileSync(join(root, 'assets/js/core/search-query-core.js'),'utf8')); console.log('OK: Syntaxe compilateur'); }
catch (error) { fail('Syntaxe compilateur: '+error.message); }

// Confidentialité et validation des sauvegardes (lot 2).
for(const id of ['privateSearchToggle','privateSearchInfo','clearAllData']) assert(html.includes('id="'+id+'"'), 'Contrôle vie privée : '+id);
assert(html.includes('src="./assets/js/core/privacy-core.js"'),'Module confidentialité référencé');
assert(existsSync(join(root,'assets/js/core/privacy-core.js')),'Module confidentialité présent');
assert(readFileSync(join(root,'service-worker.js'),'utf8').includes('assets/js/core/privacy-core.js'),'Module confidentialité mis en cache PWA');
try { new vm.Script(readFileSync(join(root,'assets/js/core/privacy-core.js'),'utf8'));console.log('OK: Syntaxe confidentialité'); }
catch(e){ fail('Syntaxe confidentialité : '+e.message); }

// Accessibilité clavier : contrat minimal d'interface, complété par a11y-browser-smoke.py.
assert(html.includes('aria-controls="panelPrompt"') && html.includes('aria-controls="panelWeb"'), 'Onglets reliés à leurs panneaux');
assert(html.includes("$('tabPrompt').tabIndex=prompt?0:-1"), 'Un seul onglet dans la séquence Tab');
assert(html.includes("e.key==='Home'") && html.includes("e.key==='End'"), 'Navigation clavier Home et End');
assert(html.includes("selected?.focus({preventScroll:true})"), 'Restauration du focus sur thème actif');
assert(html.includes('aria-atomic="true"'), 'Messages de statut annoncés de façon atomique');
assert(existsSync(join(root,'tests/browser/a11y-browser-smoke.py')), 'Test de navigation navigateur inclus');

// Extension généraliste (lot 4A).
for(const id of ['administration','family','animals','housing','law','personalfinance']) assert(html.includes("id:'"+id+"'") || html.includes('\"id\":\"'+id+'\"'), 'Univers : '+id);
assert(html.includes('id="familyFilter"'), 'Navigation par familles');
assert(html.includes('TOPIC_FAMILIES'), 'Regroupement thématique défini');
assert(html.includes('Santé & Médecine'), 'Santé enrichie');
assert(existsSync(join(root,'docs/UNIVERS.md')), 'Catalogue des univers documenté');

// Lot 4B : les 6 univers complémentaires doivent être identifiables et illustrés.
for (const id of ['childhood','work','retirement','cooking','homegarden','transport']) {
  assert(html.includes('"id":"'+id+'"'), 'Univers lot 4B : '+id);
  assert(html.includes(id+':`<svg'), 'Icône SVG lot 4B : '+id);
  assert(html.includes('"'+id+'":"'), 'Famille du thème lot 4B : '+id);
}

// Structure : chaque fichier chargé existe, est mis en cache PWA et reste sans ressource distante.
const worker = readFileSync(join(root, 'service-worker.js'), 'utf8');
for (const file of [...sourceFiles, 'assets/css/styles.css']) {
  assert(page.includes('./'+file), 'Fichier chargé par la page : '+file);
  assert(worker.includes('./'+file), 'Fichier mis en cache PWA : '+file);
}
for (const file of sourceFiles) {
  try { new vm.Script(readFileSync(join(root, file), 'utf8')); console.log('OK: Syntaxe '+file); }
  catch (error) { fail('Syntaxe '+file+' : '+error.message); }
}
assert(!/(?:src|href)="https?:/.test(page.replace(/<a [^>]*>/g, '')), 'Aucun script ou style distant');
assert(!/@import|url\(\s*['"]?https?:/.test(readFileSync(join(root, 'assets/css/styles.css'), 'utf8')), 'Aucune ressource distante dans le style');

// Icônes : uniquement du SVG, y compris pour chaque domaine.
const glyphs = /[\u2190-\u21FF\u2600-\u27BF\u2B00-\u2BFF]|\p{Extended_Pictographic}/u;
assert(!glyphs.test(html.replace(/[©®™]/g, '')), 'Aucun emoji ni symbole utilisé comme icône');
assert(!glyphs.test(readFileSync(join(root, 'assets/css/styles.css'), 'utf8')), 'Aucun symbole utilisé comme icône dans le style');
for (const {id} of require(join(root, 'assets/js/core/catalog-core.js')).TOPICS) assert(new RegExp('\\b'+id+':`<svg').test(html), 'Icône SVG du domaine : '+id);

// Structure : tout fichier local cité par la page, la PWA ou la documentation existe.
for (const [, ref] of page.matchAll(/(?:src|href)="\.\/([^"]+)"/g)) assert(existsSync(join(root, ref)), 'Fichier référencé : '+ref);
for (const [, ref] of worker.matchAll(/'\.\/([^']+)'/g)) assert(existsSync(join(root, ref)), 'Fichier mis en cache : '+ref);
for (const doc of ['README.md', 'CLAUDE.md', 'CHANGELOG.md', 'LICENSE.md', ...readdirSync(join(root, 'docs')).filter(file => file.endsWith('.md')).map(file => 'docs/'+file)]) {
  for (const [, ref] of readFileSync(join(root, doc), 'utf8').matchAll(/\]\((?!https?:|#)([^)#]+)/g)) assert(existsSync(join(dirname(join(root, doc)), ref)), 'Lien de '+doc+' : '+ref);
}

// Sécurité de la page : la CSP interdit tout code en ligne.
assert(page.includes("default-src 'none'") && !/script-src[^;]*unsafe/.test(page), 'CSP stricte présente');
assert(![...page.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].some(m => m[1].trim()), 'Aucun script en ligne');
assert(!/<style|\sstyle="|\son[a-z]+="/.test(page), 'Aucun style ni gestionnaire en ligne');

if (!process.exitCode) console.log('Tous les contrôles statiques passent.');
