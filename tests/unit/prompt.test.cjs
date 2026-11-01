const test = require('node:test');
const assert = require('node:assert/strict');
const {guidance,FAMILY_METHODS,TOPIC_METHODS} = require('../../assets/js/core/prompt-core.js');
const {TOPICS,TOPIC_FAMILIES,normalize} = require('../../assets/js/core/catalog-core.js');
const of = (topicId,extra={}) => guidance({topicId,family:TOPIC_FAMILIES[topicId],provider:'chatgpt',style:'detailed',...extra});

test('every universe except the general one receives a method',()=>{
 for(const t of TOPICS){
  if(t.id==='general')assert.deepEqual(of(t.id).method,[]);
  else assert.ok(of(t.id).method.length>=1,t.id);
 }
});
test('the 8 families and specific universes have distinct methods',()=>{
 assert.deepEqual(Object.keys(FAMILY_METHODS).sort(),[...new Set(Object.values(TOPIC_FAMILIES))].sort());
 for(const id of Object.keys(TOPIC_METHODS))assert.ok(TOPICS.some(t=>t.id===id),id);
 assert.notDeepEqual(of('osint').method,of('cooking').method);
 assert.match(of('osint').method.join(' '),/provenance/);
 assert.match(of('osint').method.join(' '),/personne privée/);
 assert.match(of('news').method.join(' '),/indépendantes/);
 assert.match(of('cyber').method.join(' '),/défensif/);
});
test('safety rules stay in the short format',()=>{
 for(const [id,word] of [['health','diagnostic'],['animals','diagnostic'],['law','juridiction'],['administration','juridiction'],['personalfinance','juridiction'],['housing','juridiction']])
  assert.match(of(id,{style:'short'}).method.join(' '),new RegExp(word),id);
 assert.ok(of('news',{style:'short'}).quality.length<of('news').quality.length);
 assert.match(of('news',{style:'short'}).quality.join(' '),/Ne prétends jamais/);
});
test('the assistant note adapts without promising a feature',()=>{
 assert.match(of('news').quality.at(-1),/pas accès au Web/);
 assert.match(of('news',{provider:'perplexity'}).quality.at(-1),/source citée/);
 assert.doesNotMatch(of('news',{provider:'custom'}).quality.join(' '),/pas accès au Web|source citée/);
 assert.ok(guidance({topicId:'constructor',family:'constructor',provider:'constructor',style:'x'}).quality.length>0);
 assert.deepEqual(guidance({topicId:'constructor',family:'constructor',provider:'chatgpt',style:'x'}).method,[]);
});
test('prompt format setting is safe for old profiles',()=>{
 assert.equal(normalize({topic:'Ancien'}).promptStyle,'detailed');
 assert.equal(normalize({promptStyle:'short'}).promptStyle,'short');
 assert.equal(normalize({promptStyle:'constructor'}).promptStyle,'detailed');
});
