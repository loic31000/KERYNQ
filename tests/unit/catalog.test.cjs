const test = require('node:test');
const assert = require('node:assert/strict');
const {TOPICS,TOPIC_FAMILIES,DEFAULT,normalize} = require('../../assets/js/core/catalog-core.js');
const privacy = require('../../assets/js/core/privacy-core.js');
const LEGACY_27=['general','manga','anime','series','films','tcg','games','politics','news','ai','cyber','science','tech','history','economy','sports','music','books','travel','health','shopping','culture','environment','space','osint','automotive','learning'];

test('catalog keeps 39 universes and the 27 historical identifiers',()=>{
 const ids=TOPICS.map(t=>t.id);
 assert.equal(ids.length,39);assert.equal(new Set(ids).size,39);
 for(const id of LEGACY_27)assert.ok(ids.includes(id),id);
});
test('every universe except the general one has a family and valid defaults',()=>{
 for(const t of TOPICS){
  if(t.id!=='general')assert.ok(TOPIC_FAMILIES[t.id],t.id);
  for(const d of t.defaults)assert.ok(t.options.some(o=>o[0]===d),t.id+':'+d);
 }
 assert.equal(new Set(Object.values(TOPIC_FAMILIES)).size,8);
});
test('real normalize keeps legacy favorites of the 27 first universes',()=>{
 for(const id of LEGACY_27){
  const option=TOPICS.find(t=>t.id===id).options[0][0];
  const got=normalize({topic:'Ancien',category:id,options:{[id]:[option,'disparu']},includeSites:'ameli.fr',engine:'brave',unknown:'ignored'});
  assert.equal(got.category,id);assert.deepEqual(got.options[id],[option]);
  assert.equal(got.includeSites,'ameli.fr');assert.equal(got.engine,'brave');assert.equal('unknown' in got,false);
 }
});
test('real normalize falls back safely on invalid values',()=>{
 const got=normalize({category:'disparu',goal:'x',engine:'x',mode:'x',aiProvider:'constructor',theme:'x'});
 assert.deepEqual([got.category,got.goal,got.engine,got.mode,got.aiProvider,got.theme],[DEFAULT.category,DEFAULT.goal,DEFAULT.engine,DEFAULT.mode,DEFAULT.aiProvider,DEFAULT.theme]);
 assert.equal(normalize({aiProvider:'custom'}).aiProvider,'custom');
});
test('themes accept historic and new values only',()=>{
 for(const theme of ['dark','light','pro','cyber','girly','aurora'])assert.equal(normalize({theme}).theme,theme);
 assert.equal(normalize({theme:'constructor'}).theme,'dark');
});
test('real v3 and v5 profiles import with the real normalize',()=>{
 const v3=privacy.validateImport({app:'KERYNQ',version:3,settings:{topic:'A',category:'manga'}},normalize);
 assert.equal(v3.settings.category,'manga');assert.equal(v3.favorites,null);
 const v5=privacy.validateImport({app:'KERYNQ',version:5,settings:{topic:'B'},favorites:[{id:'f',settings:{topic:'C',category:'cooking'}}],templates:[{id:'t',label:'M',settings:{category:'law'}}]},normalize);
 assert.equal(v5.favorites[0].settings.category,'cooking');assert.equal(v5.templates[0].settings.category,'law');
});
