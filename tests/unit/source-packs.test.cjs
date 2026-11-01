const test = require('node:test');
const assert = require('node:assert/strict');
const packs = require('../../assets/js/core/source-packs-core.js');
const search = require('../../assets/js/core/search-query-core.js');
const {TOPICS,normalize,SOURCE_COUNTRIES} = require('../../assets/js/core/catalog-core.js');
const privacy = require('../../assets/js/core/privacy-core.js');

test('each of the 39 universes is explicitly covered for each country, with no unknown universe',()=>{
 const ids=TOPICS.map(t=>t.id).sort();
 for(const entry of Object.values(packs._coverage))assert.deepEqual(Object.keys(entry.universes).sort(),ids);
});
test('countries in the catalog match the source packs',()=>{
 assert.deepEqual(SOURCE_COUNTRIES,packs.countries().map(x=>x.id));
});
test('pack domains are valid, unique, documented and kept short',()=>{
 for(const t of TOPICS){
  const pack=packs.packFor('FR',t.id);
  assert.ok(pack.length<=5,t.id);
  assert.equal(new Set(pack.map(x=>x.domain)).size,pack.length);
  for(const d of pack){assert.deepEqual(search.domains(d.domain),[d.domain]);assert.ok(d.label);assert.ok(['page','gouv'].includes(d.check));assert.equal(d.verified,packs.VERIFIED)}
 }
});
test('unverifiable domains are limited to .gouv.fr',()=>{
 for(const t of TOPICS)for(const d of packs.packFor('FR',t.id))if(d.check==='gouv')assert.match(d.domain,/\.gouv\.fr$/);
});
test('no country or an unknown country yields no pack',()=>{
 for(const country of ['','XX','constructor'])assert.deepEqual(packs.packFor(country,'health'),[]);
 assert.deepEqual(packs.packFor('FR','constructor'),[]);
});
test('adding keeps manual entries and skips duplicates',()=>{
 const got=packs.addSites('monsite.fr, https://www.ameli.fr/x, mal écrit',['ameli.fr','has-sante.fr']);
 assert.ok(got.ok);assert.deepEqual(got.added,['has-sante.fr']);
 assert.equal(got.value,'monsite.fr, https://www.ameli.fr/x, mal écrit, has-sante.fr');
});
test('adding beyond the limit is refused without changing anything',()=>{
 const nine=Array.from({length:9},(_,i)=>'s'+i+'.fr').join(', ');
 const got=packs.addSites(nine,['a.fr','b.fr']);
 assert.equal(got.ok,false);assert.equal(got.value,nine);
 assert.equal(search.domains(packs.addSites(nine,['a.fr']).value).length,10);
});
test('removing only touches the listed domains',()=>{
 assert.equal(packs.removeSites('monsite.fr, https://www.ameli.fr/x, mal écrit, has-sante.fr',['ameli.fr','has-sante.fr']),'monsite.fr, mal écrit');
});
test('old profiles have no country; invalid countries are dropped; private mode clears it',()=>{
 assert.equal(normalize({topic:'Ancien',includeSites:'ameli.fr'}).sourceCountry,'');
 assert.equal(normalize({topic:'Ancien',includeSites:'ameli.fr'}).includeSites,'ameli.fr');
 assert.equal(normalize({sourceCountry:'FR'}).sourceCountry,'FR');
 for(const sourceCountry of ['XX','constructor',5])assert.equal(normalize({sourceCountry}).sourceCountry,'');
 assert.equal(privacy.scrubCurrentSearch({sourceCountry:'FR'}).sourceCountry,'');
});
test('a pack changes the query only through the sites field, per engine',()=>{
 const includeSites=packs.addSites('',['ameli.fr','has-sante.fr']).value;
 assert.match(search.compile({topic:'x',includeSites},'google').query,/\(site:ameli\.fr OR site:has-sante\.fr\)/);
 assert.doesNotMatch(search.compile({topic:'x',includeSites},'duck').query,/site:/);
 assert.equal(search.compile({topic:'x',sourceCountry:'FR'},'google').query,'x');
});
