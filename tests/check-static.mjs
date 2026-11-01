import {readFileSync, existsSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const html=readFileSync(join(root,'index.html'),'utf8');
const manifest=JSON.parse(readFileSync(join(root,'manifest.webmanifest'),'utf8'));
function check(ok,label){if(!ok){console.error('FAIL:',label);process.exitCode=1}else console.log('OK:',label)}
check(html.includes('KERYNQ')&&!html.includes('OSINT SEARCH'),'Branding KERYNQ');
check(html.includes('id="topic"')&&html.includes('id="runSearch"'),'Barre de recherche');
check(html.includes('service-worker.js'),'Lien service worker');
check(manifest.name==='KERYNQ','Nom manifest');
for(const icon of manifest.icons)check(existsSync(join(root,icon.src)),'Icon '+icon.src);
for(const file of ['service-worker.js','favicon.svg'])check(existsSync(join(root,file)),file);
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
check(scripts.length>0,'Scripts intégrés');
for(let i=0;i<scripts.length;i++)try{new vm.Script(scripts[i][1]);console.log('OK: script',i)}catch(e){check(false,'script '+i+': '+e.message)}
try{new vm.Script(readFileSync(join(root,'service-worker.js'),'utf8'));console.log('OK: service worker')}catch(e){check(false,e.message)}
if(!process.exitCode)console.log('Contrôles statiques OK');
