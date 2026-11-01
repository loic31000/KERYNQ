const test = require('node:test');
const assert = require('node:assert/strict');
const privacy = require('../../assets/js/core/privacy-core.js');
const normalized = v => ({topic:typeof v.topic==='string'?v.topic.slice(0,2200):'',category:'general'});
const sample = {app:'KERYNQ',version:5,settings:{topic:'Hello'},favorites:[{id:'one',name:'Search',folder:'Travel',topic:'Hello',settings:{topic:'Hello'}}],templates:[{id:'t1',label:'Daily',settings:{topic:'Welcome'}}]};

test('parses KERYNQ v5 backup and normalizes collection settings',()=>{
 const got=privacy.validateImport(sample,normalized);
 assert.equal(got.settings.topic,'Hello');assert.equal(got.favorites.length,1);
 assert.equal(got.templates[0].label,'Daily');assert.equal(got.favorites[0].pinned,false);
});
test('legacy KERYNQ v3 backup preserves existing favorites',()=>{
 const got=privacy.validateImport({app:'KERYNQ',version:3,settings:{topic:'X'}},normalized);
 assert.equal(got.favorites,null);assert.equal(got.templates,null);
});
test('rejects malformed schema before mutation',()=>{
 for(const input of [null,[],{}, {app:'OTHER',version:5,settings:{}},{app:'KERYNQ',version:9,settings:{}},{app:'KERYNQ',version:5,settings:{},favorites:{}},{...sample,favorites:[{id:'same',settings:{}},{id:'same',settings:{}}]},{...sample,templates:[{label:'missing-id',settings:{}}]}]){
   assert.throws(()=>privacy.validateImport(input,normalized));
 }
});
test('rejects over-capacity collections (no silent loss)',()=>{
 const favorites=Array.from({length:81},(_,i)=>({id:String(i),settings:{}}));
 const templates=Array.from({length:31},(_,i)=>({id:String(i),settings:{}}));
 assert.throws(()=>privacy.validateImport({...sample,favorites},normalized),/Trop de/);
 assert.throws(()=>privacy.validateImport({...sample,templates},normalized),/Trop de/);
});
test('sanitizes display labels while keeping settings explicit',()=>{
 const got=privacy.validateItems([{id:'  id  ',name:' A\u0000B\n',folder:5,pinned:'true',settings:{topic:'q'}}],normalized,'favoris');
 assert.equal(got[0].name,'A B');assert.equal(got[0].folder,'Général');assert.equal(got[0].pinned,false);
});
test('private mode scrubs active-search fields, not saved preferences',()=>{
 const s={topic:'secret',context:'private',includeWords:'private',excludeWords:'private',includeSites:'private',excludeSites:'private',region:'secret',dateFrom:'x',dateTo:'y',customAIUrl:'https://site/',theme:'dark',engine:'brave'};
 const result=privacy.scrubCurrentSearch(s);
 for(const key of ['topic','context','includeWords','excludeWords','includeSites','excludeSites','region','dateFrom','dateTo','customAIUrl'])assert.equal(result[key],'');
 assert.equal(result.engine,'brave');assert.equal(s.topic,'secret');
});
test('assistant URLs require HTTPS, no credentials and no query/fragment',()=>{
 assert.equal(privacy.safeAssistantUrl('https://example.org/chat'), 'https://example.org/chat');
 for(const input of ['javascript:alert(1)','http://example.org','https://user:pass@example.org','https://example.org/?q=secret','https://example.org/#section','data:text/html,hi','bad URL'])assert.throws(()=>privacy.safeAssistantUrl(input));
});
test('stored collections keep valid entries when one is invalid',()=>{
 const got=privacy.salvageItems([{id:1,settings:{}},{id:'ok',settings:{topic:'A'}},{id:'ok',settings:{topic:'B'}},null],normalized,'favoris');
 assert.deepEqual(got.items.map(x=>x.id),['ok']);assert.equal(got.items[0].settings.topic,'A');assert.equal(got.dropped,3);
 assert.deepEqual(privacy.salvageItems({},normalized,'favoris'),{items:[],dropped:1});
});
test('restoring a search keeps the current display and assistant preferences',()=>{
 const got=privacy.withCurrentPreferences({topic:'F',engine:'brave',theme:'light',largeText:true,aiProvider:'claude',customAIUrl:'https://a.example/',mode:'advanced',showAll:true,previewTab:'prompt'},{theme:'dark',largeText:false,aiProvider:'chatgpt',customAIUrl:'',mode:'simple',showAll:false,previewTab:'web',engine:'google'});
 assert.deepEqual(got,{topic:'F',engine:'brave',theme:'dark',largeText:false,aiProvider:'chatgpt',customAIUrl:'',mode:'simple',showAll:false,previewTab:'web'});
});
