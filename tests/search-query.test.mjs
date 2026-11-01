import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {compile,domains,dates}=require('../search-query-core.js');
const base={topic:'Démarches logement',includeWords:'',excludeWords:'',includeSites:'',excludeSites:'',period:'all',language:'all',region:'',filetype:''};
const build=(params={},engine='google')=>compile({...base,...params},engine,new Date(2026,10,1));

test('base sans opérateur parasite',()=>{for(const engine of ['google','brave','duck'])assert.equal(build({},engine).query,'Démarches logement')});
test('les expressions sont correctement citées et exclues',()=>{const q=build({includeWords:'document officiel, "énergie renouvelable"',excludeWords:'publicité, faux site'}).query;assert.match(q,/"document officiel"/);assert.match(q,/"énergie renouvelable"/);assert.match(q,/-publicité/);assert.match(q,/-"faux site"/)});
test('sites valides, dedoublonnés et nettoyage URLs',()=>{assert.deepEqual(domains('https://www.service-public.gouv.fr/particuliers ; service-public.gouv.fr ; https://example.com:443/path ; bad host'),['service-public.gouv.fr']);});
test('un site et exclusions pour les trois moteurs',()=>{for(const engine of ['google','brave','duck']){const q=build({includeSites:'https://www.ameli.fr/assure',excludeSites:'forum.example.org',filetype:'pdf'},engine).query;assert.ok(q.includes('site:ameli.fr'));assert.ok(q.includes('-site:forum.example.org'));assert.ok(q.includes('filetype:pdf'))}});
test('plusieurs sites ne sont pas annoncés comme appliqués dans DuckDuckGo',()=>{const a=build({includeSites:'ameli.fr,has-sante.fr'},'duck');assert.doesNotMatch(a.query,/site:/);assert.ok(a.prompt.some(x=>x.includes('Sites multiples')));assert.ok(!a.web.some(x=>x.startsWith('Sites')))});
test('Google et Brave peuvent tenter le OR entre domaines',()=>{for(const e of ['google','brave']){const q=build({includeSites:'ameli.fr,has-sante.fr'},e).query;assert.ok(q.includes('(site:ameli.fr OR site:has-sante.fr)'))}});
test('dates uniquement Google, borne finale inclusive',()=>{const s={period:'custom',dateFrom:'2026-10-01',dateTo:'2026-10-31'};assert.ok(build(s,'google').query.includes('before:2026-11-01'));for(const e of ['brave','duck']){assert.doesNotMatch(build(s,e).query,/after:|before:/);assert.ok(build(s,e).prompt.some(x=>x.includes('Période')))}});
test('date invalide ou inversée n’ajoute pas de faux filtre',()=>{for(const s of [{dateFrom:'2026-02-30',dateTo:''},{dateFrom:'2026-11-01',dateTo:'2026-10-01'}]){const result=build({period:'custom',...s},'google');assert.equal(result.invalidDates,true);assert.doesNotMatch(result.query,/after:|before:/);assert.ok(result.prompt.some(x=>x.includes('invalides')))}});
test('langue et région seulement Brave',()=>{const params={language:'fr',region:'France'};assert.ok(build(params,'brave').query.includes('lang:fr loc:fr'));for(const e of ['google','duck']){assert.doesNotMatch(build(params,e).query,/lang:|loc:/);assert.ok(build(params,e).prompt.includes('Région (consigne IA seulement)'))}});
test('sans sujet, la requête est vide',()=>assert.equal(build({topic:''},'google').query,''));
