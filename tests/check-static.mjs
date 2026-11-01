import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const html = readFileSync(join(root, 'index.html'), 'utf8');
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
for (const src of ['favicon.svg', 'service-worker.js']) assert(existsSync(join(root, src)), 'Fichier '+src);
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
assert(scripts.length > 0, 'Scripts intégrés détectés');
for (const [i, script] of scripts.entries()) {
  try { new vm.Script(script[1], {filename: `inline-${i}.js`}); console.log('OK: Syntaxe script', i); }
  catch (err) { fail(`Syntaxe script ${i}: ${err.message}`); }
}
try { new vm.Script(readFileSync(join(root, 'service-worker.js'), 'utf8')); console.log('OK: Syntaxe service worker'); }
catch (err) { fail(`Syntaxe service worker: ${err.message}`); }
if (!process.exitCode) console.log('Tous les contrôles statiques passent.');

// Multi-assistant et documentation
const assistants = ['chatgpt','claude','gemini','kimi','grok','deepseek','perplexity','mistral','copilot'];
for (const assistant of assistants) assert(html.includes(`${assistant}:`), `Assistant disponible : ${assistant}`);
assert(html.includes('id="aiProvider"') && html.includes('id="openAIProvider"'), 'Sélecteur et ouverture multi-IA présents');
assert(html.includes('id="customAIUrl"'), 'Fournisseur personnalisé disponible');
assert(html.includes('KerynqPrivacy.safeAssistantUrl'), 'Vérification HTTPS de l’URL personnalisée');
assert(!html.includes('openChatGPT'), 'Pas de bouton ChatGPT codé en dur');
assert(!/window\.open\([^\)]*buildPrompt/.test(html), 'Pas de consigne automatiquement transmise dans URL');
for (const doc of ['LICENSE.md','CONTRIBUTING.md','CODE_OF_CONDUCT.md','SECURITY.md','SUPPORT.md','ACCESSIBILITY.md','CHANGELOG.md','docs/ARCHITECTURE.md','docs/FOURNISSEURS_IA.md','docs/CONFIDENTIALITE.md','.github/ISSUE_TEMPLATE/bug_report.yml','.github/ISSUE_TEMPLATE/feature_request.yml','.github/PULL_REQUEST_TEMPLATE.md']) {
 assert(existsSync(join(root,doc)),`Document : ${doc}`);
}

// Le compilateur de requêtes est un fichier local indispensable au mode hors ligne.
assert(existsSync(join(root, 'search-query-core.js')), 'Compilateur présent');
assert(html.includes('src="./search-query-core.js"'), 'Compilateur chargé avant le script UI');
assert(readFileSync(join(root, 'service-worker.js'),'utf8').includes('search-query-core.js'), 'Compilateur mis en cache PWA');
try { new vm.Script(readFileSync(join(root, 'search-query-core.js'),'utf8')); console.log('OK: Syntaxe compilateur'); }
catch (error) { fail('Syntaxe compilateur: '+error.message); }

// Confidentialité et validation des sauvegardes (lot 2).
for(const id of ['privateSearchToggle','privateSearchInfo','clearAllData']) assert(html.includes('id="'+id+'"'), 'Contrôle vie privée : '+id);
assert(html.includes('src="./privacy-core.js"'),'Module confidentialité référencé');
assert(existsSync(join(root,'privacy-core.js')),'Module confidentialité présent');
assert(readFileSync(join(root,'service-worker.js'),'utf8').includes('privacy-core.js'),'Module confidentialité mis en cache PWA');
try { new vm.Script(readFileSync(join(root,'privacy-core.js'),'utf8'));console.log('OK: Syntaxe confidentialité'); }
catch(e){ fail('Syntaxe confidentialité : '+e.message); }

// Contrat d'accessibilité clavier complété par le smoke test navigateur.
assert(html.includes('aria-controls="panelPrompt"') && html.includes('aria-controls="panelWeb"'), 'Onglets reliés aux panneaux');
assert(html.includes("$('tabPrompt').tabIndex=prompt?0:-1"), 'Un seul onglet dans la séquence Tab');
assert(html.includes("e.key==='Home'") && html.includes("e.key==='End'"), 'Touches Home et End');
assert(html.includes("selected?.focus({preventScroll:true})"), 'Focus maintenu après changement de thème');
assert(html.includes('aria-atomic="true"'), 'Annonces de statut atomiques');
assert(existsSync(join(root,'tests/a11y-browser-smoke.py')), 'Test navigateur inclus');
