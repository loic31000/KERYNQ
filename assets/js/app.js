/* KERYNQ · logique de l'interface. Aucun envoi automatique : tout départ vers un tiers suit un clic. */
(()=>{'use strict';
const {THEMES,TOPICS,TOPIC_FAMILIES,GOALS,GOAL_TEXT,SOURCES,FORMATS,DEFAULT,AI_PROVIDERS,clone,normalize}=KerynqCatalog;
const LS='kerynq-premium-v5', $=id=>document.getElementById(id), topicById=id=>TOPICS.find(t=>t.id===id)||TOPICS[0];
function load(){try{const raw=localStorage.getItem(LS);if(raw)return normalize(JSON.parse(raw));const old=localStorage.getItem('kerynq-premium-v1');if(old){const o=normalize(JSON.parse(old));o.previewTab='web';o.mode='simple';o.engine='google';return o}return clone(DEFAULT)}catch{return clone(DEFAULT)}}let state=load(), toastTimeout, privateMode=false, suppressSave=false;
function save(){if(privateMode||suppressSave)return;try{localStorage.setItem(LS,JSON.stringify(state))}catch{notify('Stockage local indisponible')}}
function updatePrivateUI(){
 const b=$('privateSearchToggle');b.setAttribute('aria-pressed',String(privateMode));$('privateSearchInfo').hidden=!privateMode;
 b.textContent=privateMode?'Mode privé activé':'Mode privé';
 $('privateSearchInfo').textContent=privateMode
  ?'Mode privé actif : aucune nouvelle recherche ni modification de filtre n’est conservée localement. Les moteurs externes voient toujours vos requêtes. Quitter ce mode effacera les champs privés.'
  :'Mode privé désactivé : vos réglages et votre recherche peuvent être enregistrés sur cet appareil. Les moteurs externes reçoivent les requêtes lancées.';
 for(const id of ['exportConfig','importConfig'])$(id).disabled=privateMode;
}
function togglePrivateMode(){
 if(!privateMode){
  // Remove the active query already saved before entering private mode.
  try{localStorage.setItem(LS,JSON.stringify(KerynqPrivacy.scrubCurrentSearch(state)));localStorage.removeItem('kerynq-premium-v1')}catch{notify('Impossible de garantir le mode privé : stockage inaccessible');return}
  privateMode=true;
  updatePrivateUI();notify('Mode privé activé : aucune recherche en cours enregistrée');
 }else{
  privateMode=false;
  state=load();initOptions(state.category);sync();
  updatePrivateUI();notify('Mode privé désactivé : champs temporaires effacés');
 }
}
function eraseAllKerynqData(){
 if(!window.confirm('Supprimer définitivement les favoris, modèles, recherches et préférences stockés par KERYNQ sur cet appareil ? Les exports déjà téléchargés ne seront pas supprimés.'))return;
 const keys=[LS,SAVED_KEY,CUSTOM_TEMPLATES_KEY,'kerynq-premium-v1',WELCOME_KEY];
 try{for(const key of keys)localStorage.removeItem(key)}catch{notify('Effacement incomplet : vérifier les données du navigateur');return}
 privateMode=false;state=clone(DEFAULT);initOptions(state.category);$('categorySearch').value='';summaryOpen=false;
 suppressSave=true;
 try{sync();updatePrivateUI()}
 finally{suppressSave=false}
 notify('Données locales KERYNQ effacées');
}

function notify(s){const box=$('status');box.textContent=s;box.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>box.classList.remove('show'),2900)}
const ICONS={
 childhood:`<svg viewBox="0 0 24 24"><path d="M4 7v12h16V7l-8-4-8 4Z"></path><path d="M8 12h8M8 16h8M12 3v4"></path></svg>`,
 work:`<svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"></rect><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 11h4v3h-4z"></path></svg>`,
 retirement:`<svg viewBox="0 0 24 24"><circle cx="12" cy="7" r="3"></circle><path d="M6 20v-4a6 6 0 0 1 12 0v4M4 20h16M17 4l3-2v5"></path></svg>`,
 cooking:`<svg viewBox="0 0 24 24"><path d="M6 3v8M9 3v8M6 7h3M7.5 11v10M16 3c3 4 3 7 0 10v8M16 3v10"></path></svg>`,
 homegarden:`<svg viewBox="0 0 24 24"><path d="M3 12l9-8 9 8M5 10v11h14V10M9 21v-7h6v7"></path><path d="M16 5c1-2 3-2 4-1-1 2-2 3-4 3"></path></svg>`,
 transport:`<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="15" rx="3"></rect><path d="M5 12h14M8 21l2-3M16 21l-2-3M8 7h8M8 15h.01M16 15h.01"></path></svg>`,
 general:`<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"></circle><path d="M20 20l-4.2-4.2"></path></svg>`,
 manga:`<svg viewBox="0 0 24 24"><path d="M4 6.5c0-1.1.9-2 2-2h5v15H6a2 2 0 0 0-2 2V6.5Z"></path><path d="M20 6.5c0-1.1-.9-2-2-2h-5v15h5a2 2 0 0 1 2 2V6.5Z"></path></svg>`,
 anime:`<svg viewBox="0 0 24 24"><path d="M12 3c3 3 6 4.5 8 5-1.5 3.5-4.7 8.2-8 13-3.3-4.8-6.5-9.5-8-13 2-.5 5-2 8-5Z"></path><path d="M9.5 10.5c1 .7 1.8 1 2.5 1.1.7-.1 1.5-.4 2.5-1.1"></path></svg>`,
 series:`<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="12" rx="2"></rect><path d="M9 19h6"></path><path d="M7 3l2 2M17 3l-2 2"></path></svg>`,
 films:`<svg viewBox="0 0 24 24"><path d="M4 7h16v12H4z"></path><path d="M8 7l2-3M14 7l2-3"></path><path d="M8 11h8M8 15h5"></path></svg>`,
 tcg:`<svg viewBox="0 0 24 24"><rect x="6" y="5" width="11" height="15" rx="2"></rect><path d="M9 8h5M9 11h5M9 14h3"></path><path d="M9 5h8a2 2 0 0 1 2 2v11"></path></svg>`,
 games:`<svg viewBox="0 0 24 24"><path d="M7 8h10l1 3v5a2 2 0 0 1-2 2h-2l-2-2h-2l-2 2H6a2 2 0 0 1-2-2v-5l1-3Z"></path><path d="M8.5 12h3M10 10.5v3"></path><path d="M15.5 11.5h.01M17 13h.01"></path></svg>`,
 politics:`<svg viewBox="0 0 24 24"><path d="M4 20h16"></path><path d="M6 20V10"></path><path d="M10 20V10"></path><path d="M14 20V10"></path><path d="M18 20V10"></path><path d="M3 10h18L12 4 3 10Z"></path></svg>`,
 news:`<svg viewBox="0 0 24 24"><path d="M5 6h12a2 2 0 0 1 2 2v10H7a2 2 0 0 1-2-2V6Z"></path><path d="M7 9h10M7 12h10M7 15h6"></path><path d="M5 6v10a2 2 0 0 0 2 2"></path></svg>`,
 ai:`<svg viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="2"></rect><path d="M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4"></path><path d="M10 10h4v4h-4z"></path></svg>`,
 cyber:`<svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3Z"></path><path d="M9.5 12l1.7 1.7 3.8-4"></path></svg>`,
 science:`<svg viewBox="0 0 24 24"><path d="M10 3v6l-4.5 8A2 2 0 0 0 7.2 20h9.6a2 2 0 0 0 1.7-3L14 9V3"></path><path d="M9 13h6"></path></svg>`,
 tech:`<svg viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="2"></rect><path d="M4 10h3M4 14h3M17 10h3M17 14h3M10 4v3M14 4v3M10 17v3M14 17v3"></path></svg>`,
 history:`<svg viewBox="0 0 24 24"><path d="M12 8v5l3 2"></path><circle cx="12" cy="12" r="8"></circle></svg>`,
 economy:`<svg viewBox="0 0 24 24"><path d="M5 18V9M10 18V5M15 18v-7M20 18v-3"></path><path d="M3 18h18"></path></svg>`,
 sports:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"></circle><path d="M12 5v14M5 12h14"></path><path d="M7.5 7.5c4 2 5 7 9 9"></path></svg>`,
 music:`<svg viewBox="0 0 24 24"><path d="M15 5v10.5a2.5 2.5 0 1 1-2-2.45V7l7-2v8.5a2.5 2.5 0 1 1-2-2.45V5"></path></svg>`,
 books:`<svg viewBox="0 0 24 24"><path d="M5 5h11a3 3 0 0 1 3 3v11H8a3 3 0 0 0-3 3V5Z"></path><path d="M8 5v14"></path></svg>`,
 travel:`<svg viewBox="0 0 24 24"><path d="M3 13l18-5-5 5 3 6-4-3-5 4 1-6-8-1Z"></path></svg>`,
 health:`<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"></path><path d="M10 10h4M12 8v4"></path></svg>`,
 shopping:`<svg viewBox="0 0 24 24"><path d="M6 7h12l-1.2 9H7.2L6 7Z"></path><path d="M9 7a3 3 0 1 1 6 0"></path><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>`,
 culture:`<svg viewBox="0 0 24 24"><path d="M5 18V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v9"></path><path d="M9 18v-4h6v4"></path><path d="M3 20h18"></path></svg>`,
 environment:`<svg viewBox="0 0 24 24"><path d="M12 20c4 0 7-3 7-7 0-5-7-9-7-9s-7 4-7 9c0 4 3 7 7 7Z"></path><path d="M12 8c1.8 2 2 5.5 0 9"></path></svg>`,
 space:`<svg viewBox="0 0 24 24"><path d="M13 4c4 1 6 5 7 8-2 .5-5.5.7-8 4-3-3-3.5-6.5-3-8 1-2 2-3 4-4Z"></path><path d="M8 16l-3 3M16 8l3-3"></path></svg>`,
 osint:`<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="5.5"></circle><path d="M15 15l5 5"></path><path d="M10.5 7v7M7 10.5h7"></path></svg>`,
 automotive:`<svg viewBox="0 0 24 24"><path d="M5 16l1.5-5h11L19 16"></path><path d="M4 16h16v3H4z"></path><circle cx="7.5" cy="18.5" r="1"></circle><circle cx="16.5" cy="18.5" r="1"></circle></svg>`,
 learning:`<svg viewBox="0 0 24 24"><path d="M4 8l8-4 8 4-8 4-8-4Z"></path><path d="M7 10v5c0 1.7 2.2 3 5 3s5-1.3 5-3v-5"></path></svg>`,
 administration:`<svg viewBox="0 0 24 24"><path d="M3 21h18M5 19V9l7-4 7 4v10M8 11h2v2H8zM14 11h2v2h-2zM10 19v-4h4v4"/></svg>`,
 family:`<svg viewBox="0 0 24 24"><circle cx="8" cy="7" r="2"/><circle cx="16" cy="7" r="2"/><path d="M3 19v-5c0-2.5 2-4 5-4s5 1.5 5 4v5M11 19v-4c0-2.6 2-4 5-4s5 1.5 5 4v4"/></svg>`,
 animals:`<svg viewBox="0 0 24 24"><circle cx="8" cy="7" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="16" cy="7" r="1"/><path d="M6 13c1-3 4-4 6-4s5 1 6 4c1.5 4-1 6-3 6-1.5 0-2-1-3-1s-1.5 1-3 1c-2 0-4.5-2-3-6Z"/></svg>`,
 housing:`<svg viewBox="0 0 24 24"><path d="M3 11 12 4l9 7M5 10v10h14V10M10 20v-7h4v7"/></svg>`,
 law:`<svg viewBox="0 0 24 24"><path d="M12 3v18M4 7h16M6 7l-3 6h6L6 7ZM18 7l-3 6h6l-3-6ZM7 21h10"/></svg>`,
 personalfinance:`<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M16 15h2M9 4v2"/></svg>`
};
function iconHTML(id){return ICONS[id]||ICONS.general}
function iconNode(id){const wrap=node('span','category-icon');wrap.setAttribute('aria-hidden','true');wrap.innerHTML=iconHTML(id);return wrap}

function node(tag,cls,txt){const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n}
function initOptions(category){if(!Array.isArray(state.options[category]))state.options[category]=[...topicById(category).defaults];if(!Array.isArray(state.custom[category]))state.custom[category]=[]}
function switchCategory(id){if(state.category===id)return;state.category=id;initOptions(id);save();renderCategories();renderExamples();renderSpecial();renderResult()}
const domainOptions=()=>[...$('categories').querySelectorAll('[role="option"]')];
let domainActive=-1;
function setDomainActive(index){const all=domainOptions();all.forEach(o=>o.classList.remove('is-active'));domainActive=all.length?Math.max(0,Math.min(index,all.length-1)):-1;const current=all[domainActive];if(current){current.classList.add('is-active');current.scrollIntoView({block:'nearest'});$('categorySearch').setAttribute('aria-activedescendant',current.id)}else $('categorySearch').removeAttribute('aria-activedescendant')}
function renderCategories(){const root=$('categories');root.replaceChildren();const term=$('categorySearch').value.trim().toLocaleLowerCase('fr');const family=$('familyFilter').value;const options=TOPICS.filter(t=>(family==='all'||TOPIC_FAMILIES[t.id]===family)&&(!term||(t.name+' '+t.id).toLocaleLowerCase('fr').includes(term)));const names=Object.fromEntries([...$('familyFilter').options].map(o=>[o.value,o.textContent]));const groups=new Map();for(const t of options){const key=TOPIC_FAMILIES[t.id]||'all';if(!groups.has(key))groups.set(key,[]);groups.get(key).push(t)}const order=[...$('familyFilter').options].map(o=>o.value).filter(k=>groups.has(k));for(const key of order){const group=node('div','domain-group');group.setAttribute('role','group');const title=node('div','domain-group-title',key==='all'?'Général':names[key]);title.id='domain-family-'+key;group.setAttribute('aria-labelledby',title.id);group.append(title);for(const t of groups.get(key)){const item=node('div','domain-option');item.id='domain-'+t.id;item.setAttribute('role','option');item.setAttribute('aria-selected',String(state.category===t.id));item.dataset.categoryId=t.id;item.append(iconNode(t.id),node('span','category-name',t.name));item.addEventListener('mousedown',e=>e.preventDefault());item.addEventListener('click',()=>chooseDomain(t.id));group.append(item)}root.append(group)}$('categoryCount').textContent=options.length?options.length+' domaine'+(options.length>1?'s':''):'Aucun domaine trouvé';$('domainName').textContent=topicById(state.category).name;$('domainIcon').replaceChildren(iconNode(state.category));if(!$('domainPanel').hidden)setDomainActive(Math.max(0,domainOptions().findIndex(o=>o.dataset.categoryId===state.category)))}
function toggleDomainPanel(open){$('domainPanel').hidden=!open;$('domainToggle').setAttribute('aria-expanded',String(open));if(open){$('categorySearch').value='';$('familyFilter').value='all';renderCategories();$('categorySearch').focus()}else $('categorySearch').removeAttribute('aria-activedescendant')}
function chooseDomain(id){switchCategory(id);toggleDomainPanel(false);const selected=$('domainToggle');selected?.focus({preventScroll:true});notify('Domaine : '+topicById(id).name)}
function setupDomainPicker(){
 $('domainToggle').addEventListener('click',()=>toggleDomainPanel($('domainPanel').hidden));
 $('categorySearch').addEventListener('input',()=>{renderCategories();const term=$('categorySearch').value.trim().toLocaleLowerCase('fr');setDomainActive(Math.max(0,domainOptions().findIndex(o=>o.textContent.toLocaleLowerCase('fr').startsWith(term))))});
 $('familyFilter').addEventListener('change',()=>{renderCategories();setDomainActive(0)});
 $('categorySearch').addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();setDomainActive(domainActive+(e.key==='ArrowDown'?1:-1))}else if(e.key==='Enter'){e.preventDefault();const current=domainOptions()[domainActive];if(current)chooseDomain(current.dataset.categoryId)}});
 $('domainPanel').addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();toggleDomainPanel(false);$('domainToggle').focus()}});
 $('domainPicker').addEventListener('focusout',e=>{if(!$('domainPanel').hidden&&e.relatedTarget&&!$('domainPicker').contains(e.relatedTarget))toggleDomainPanel(false)});
 document.addEventListener('click',e=>{if(!$('domainPanel').hidden&&!e.target.closest('#domainPicker'))toggleDomainPanel(false)});
}
function renderExamples(){const t=topicById(state.category);const root=$('examples');root.replaceChildren();for(const ex of t.examples){const b=node('button','example',ex);b.type='button';b.addEventListener('click',()=>{state.topic=ex;$('topic').value=ex;save();renderResult();notify('Exemple ajouté à votre recherche')});root.append(b)}}
function renderGoals(){const root=$('goals');root.replaceChildren();for(const [id,name] of GOALS){const b=node('button','goal-btn',name);b.type='button';b.setAttribute('aria-pressed',String(state.goal===id));b.addEventListener('click',()=>{const keyboardFocus=document.activeElement===b;state.goal=id;save();renderGoals();renderResult();if(keyboardFocus){[...root.children].find(x=>x.dataset.goalId===id)?.focus({preventScroll:true})}});b.dataset.goalId=id;root.append(b)}}
function makeCheckbox(id,title,desc,checked,onChange,card=false){const lab=node('label',card?'check-card':'pill-check');const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=checked;checkbox.id=id;checkbox.addEventListener('change',()=>onChange(checkbox.checked));const span=node('span');span.append(node('strong','',title));if(desc)span.append(node('small','',desc));lab.append(checkbox,span);return lab}
function renderSpecial(){initOptions(state.category);const root=$('specialFilters');root.replaceChildren();const t=topicById(state.category);$('specificTitle').textContent='Filtres : '+t.name;$('specificHelp').textContent='Ces options changent selon le domaine choisi.';for(const [id,label,desc] of t.options){root.append(makeCheckbox('special-'+id,label,desc,state.options[t.id].includes(id),checked=>{if(checked&&!state.options[t.id].includes(id))state.options[t.id].push(id);else if(!checked)state.options[t.id]=state.options[t.id].filter(x=>x!==id);save();renderResult()},true))}renderCustom()}
function setupEngines(){const select=$('engineSelect'),buttons=$('engineButtons');for(const [group,title] of [['general','Moteurs généraux'],['images','Images'],['special','Moteurs spécialisés']]){const box=document.createElement('optgroup');box.label=title;for(const e of KerynqSearch.ENGINES.filter(x=>x.group===group)){const o=node('option','',e.field?e.label+' · '+e.field:e.label);o.value=e.id;box.append(o);const b=node('button','btn ico-after ico-external',e.label);b.type='button';b.dataset.engine=e.id;buttons.append(b)}select.append(box)}
 $('useSuggestedEngine').addEventListener('click',()=>{const e=KerynqSearch.suggestedEngine(state.category);if(!e)return;state.engine=e.id;$('engineSelect').value=e.id;save();renderResult();$('engineSelect').focus();notify('Moteur choisi : '+e.label)})}
function renderEngineTable(){const root=$('engineTable');root.replaceChildren();const current=KerynqSearch.engineById(state.engine);$('engineTableName').textContent=current.label;for(const f of KerynqSearch.capabilities()){const row=document.createElement('tr');const head=node('th','',f.label);head.scope='row';const on=f.engines[current.id];row.append(head,node('td',on?'cap-yes':'cap-no',on?'Transmis':'Non transmis'));root.append(row)}const suggested=KerynqSearch.suggestedEngine(state.category);const show=!!suggested&&suggested.id!==state.engine;$('engineSuggest').hidden=!show;if(show)$('engineSuggestText').textContent='Conseillé pour ce domaine : '+suggested.label+' ('+suggested.field.toLowerCase()+').'}
function renderCustom(){const root=$('customList');root.replaceChildren();for(const entry of state.custom[state.category]||[]){const pill=node('span','custom-pill');const chk=document.createElement('input');chk.type='checkbox';chk.checked=entry.checked;chk.setAttribute('aria-label','Activer '+entry.label);chk.addEventListener('change',()=>{entry.checked=chk.checked;save();renderResult()});const lbl=node('span','',entry.label);const rm=node('button','ico ico-close');rm.type='button';rm.setAttribute('aria-label','Supprimer le critère '+entry.label);rm.addEventListener('click',()=>{state.custom[state.category]=state.custom[state.category].filter(x=>x.id!==entry.id);save();renderCustom();renderResult();$('customInput').focus()});pill.append(chk,lbl,rm);root.append(pill)}}
function renderPillGroup(rootId,source,field){const root=$(rootId);root.replaceChildren();for(const [id,label] of source){const lab=makeCheckbox(field+'-'+id,label,'',state[field].includes(id),checked=>{state[field]=checked?[...new Set([...state[field],id])]:state[field].filter(x=>x!==id);save();renderResult()});root.append(lab)}}
function mapSelected(items,ids){return items.filter(x=>ids.includes(x[0])).map(x=>x[1])}function tokens(text){return KerynqSearch.tokens(text)}
function domains(text){return KerynqSearch.domains(text)}
function categorySelected(){const t=topicById(state.category);return t.options.filter(x=>state.options[t.id]?.includes(x[0])).map(x=>x[1]).concat((state.custom[t.id]||[]).filter(x=>x.checked).map(x=>x.label))}
function buildPrompt(){const t=topicById(state.category);const s=['# Recherche structurée','','## Sujet',state.topic.trim()||'[Indiquez ici votre question ou votre sujet]','','## Thème',t.name,'','## Objectif',GOAL_TEXT[state.goal]||GOAL_TEXT.explore];if(state.context.trim())s.push('','## Précisions',state.context.trim());const opts=categorySelected();if(opts.length)s.push('','## Critères sélectionnés',...opts.map(x=>'- '+x));const sources=mapSelected(SOURCES,state.sources);if(sources.length)s.push('','## Sources à privilégier',...sources.map(x=>'- '+x));const formats=mapSelected(FORMATS,state.formats);if(formats.length)s.push('','## Format de réponse',...formats.map(x=>'- '+x));const periods={all:'Toutes les périodes',day:'Dernières 24 heures',week:'7 derniers jours',month:'30 derniers jours',year:'12 derniers mois',custom:'Plage personnalisée'};const langs={all:'Toutes les langues',fr:'Français',en:'Anglais','fr-en':'Français et anglais',multi:'Multilingue'};s.push('','## Périmètre','- Période : '+(periods[state.period]||periods.all)+(state.period==='custom'?' ('+(state.dateFrom||'?')+' à '+(state.dateTo||'?')+')':''),'- Langue des sources : '+(langs[state.language]||langs.all));if(state.region.trim())s.push('- Zone géographique : '+state.region.trim());if(state.filetype)s.push('- Format documentaire : '+state.filetype.toUpperCase());if(tokens(state.includeWords).length)s.push('- Inclure ces mots ou expressions : '+tokens(state.includeWords).join(' ; '));if(tokens(state.excludeWords).length)s.push('- Éviter ces termes : '+tokens(state.excludeWords).join(' ; '));if(domains(state.includeSites).length)s.push('- Sites à privilégier : '+domains(state.includeSites).join(', '));if(domains(state.excludeSites).length)s.push('- Sites à exclure : '+domains(state.excludeSites).join(', '));const guide=KerynqPrompt.guidance({topicId:t.id,family:TOPIC_FAMILIES[t.id],provider:state.aiProvider,style:state.promptStyle});if(guide.method.length)s.push('','## Méthode pour ce domaine',...guide.method.map(x=>'- '+x));s.push('','## Qualité et fiabilité',...guide.quality.map(x=>'- '+x));return s.join('\n')}
function searchQuery(engine=state.engine||'google') {return KerynqSearch.compile(state,engine).query}
function compatibility(){
 const compiled=KerynqSearch.compile(state,state.engine);
 const {web,prompt}=compiled;
 if(state.category!=='general')prompt.push('Domaine : '+topicById(state.category).name);
 if(categorySelected().length)prompt.push('Filtres du domaine ('+categorySelected().length+')');
 if(state.sources.length)prompt.push('Sources recherchées');
 if(state.formats.length)prompt.push('Format de restitution');
 if(state.goal!=='explore')prompt.push('Objectif');
 if(state.context.trim())prompt.push('Précisions');
 const sites=[state.includeSites,state.excludeSites].map(KerynqSearch.siteReport);
 const ignored=[...sites.flatMap(x=>x.invalid).map(x=>x+' (format non reconnu, séparer par une virgule)'),...sites.flatMap(x=>x.overflow).map(x=>x+' (limite de 10 sites)')];
 return {web,prompt,ignored};
}
function renderCompatibility(){const root=$('queryCompatibility');root.replaceChildren();const c=compatibility();function line(heading,items,ok){const el=node('div','compat-line');const title=node('strong','',heading);const content=node('span','',items.length?items.join(' · '):'Aucun');el.append(title,content);if(ok)el.classList.add('compat-applied');root.append(el)}line('Appliqué par le moteur',c.web,true);line('Utilisé seulement dans le texte pour une IA',c.prompt,false);if(c.ignored.length)line('Sites ignorés',c.ignored,false);}
// Résumé des critères actifs. Un critère est « web » seulement si le compilateur le transmet au moteur choisi.
let summaryOpen=false;
const short=(text,max=28)=>text.length>max?text.slice(0,max-1).trim()+'…':text;
function transmitted(fields){return KerynqSearch.compile({topic:'x',...fields},state.engine).web.length>1}
function activeCriteria(){
 const list=[],t=topicById(state.category);
 const field=(key,label,fields,clear)=>list.push({key,label,web:transmitted(fields),remove:clear});
 const text=(key,prefix)=>{if(String(state[key]||'').trim())field(key,prefix+short(state[key].trim()),{[key]:state[key]},()=>{state[key]=''})};
 if(state.period!=='all')field('period',$('period').selectedOptions[0]?.textContent||'Période',{period:state.period,dateFrom:state.dateFrom,dateTo:state.dateTo},()=>{state.period='all';state.dateFrom='';state.dateTo=''});
 if(state.language!=='all')field('language',$('language').selectedOptions[0]?.textContent||'Langue',{language:state.language},()=>{state.language='all'});
 text('region','Lieu : ');
 if(state.filetype)field('filetype','Fichier '+state.filetype.toUpperCase(),{filetype:state.filetype},()=>{state.filetype=''});
 text('includeWords','Avec : ');text('excludeWords','Sans : ');text('includeSites','Sites : ');text('excludeSites','Sites exclus : ');
 if(state.goal!=='explore')list.push({key:'goal',label:'Objectif : '+(GOALS.find(x=>x[0]===state.goal)?.[1]||''),web:false,remove:()=>{state.goal='explore'}});
 for(const [id,label] of t.options)if(state.options[t.id]?.includes(id))list.push({key:'option-'+id,label,web:false,remove:()=>{state.options[t.id]=state.options[t.id].filter(x=>x!==id)}});
 for(const entry of state.custom[t.id]||[])if(entry.checked)list.push({key:'custom-'+entry.id,label:short(entry.label),web:false,remove:()=>{entry.checked=false}});
 for(const [id,label] of SOURCES)if(state.sources.includes(id))list.push({key:'source-'+id,label,web:false,remove:()=>{state.sources=state.sources.filter(x=>x!==id)}});
 for(const [id,label] of FORMATS)if(state.formats.includes(id))list.push({key:'format-'+id,label,web:false,remove:()=>{state.formats=state.formats.filter(x=>x!==id)}});
 if(state.context.trim())list.push({key:'context',label:'Précisions pour l’IA',web:false,remove:()=>{state.context=''}});
 return list;
}
function renderSummary(){
 const root=$('activeSummary'),web=state.previewTab==='web',all=activeCriteria();
 const ordered=web?[...all.filter(x=>x.web),...all.filter(x=>!x.web)]:all;
 const limit=web?Math.min(all.filter(x=>x.web).length,3):3;
 const shown=summaryOpen?ordered:ordered.slice(0,limit);
 root.replaceChildren();
 for(const item of shown){
  const isWeb=web&&item.web,chip=node('span','chip '+(web?(isWeb?'chip-web':'chip-ai'):''));
  chip.append(node('span','',item.label));
  if(web)chip.append(node('span','sr-only',isWeb?' (transmis au moteur)':' (texte pour une IA seulement)'));
  const rm=node('button','chip-remove ico ico-close');rm.type='button';rm.dataset.summaryKey=item.key;rm.setAttribute('aria-label','Retirer le critère '+item.label);
  rm.addEventListener('click',()=>{const keys=[...root.querySelectorAll('[data-summary-key]')].map(b=>b.dataset.summaryKey),next=keys[keys.indexOf(item.key)+1]??keys[keys.indexOf(item.key)-1];item.remove();save();sync();notify('Critère retiré : '+item.label);([...root.querySelectorAll('[data-summary-key]')].find(b=>b.dataset.summaryKey===next)||$('refineToggle')).focus()});
  chip.append(rm);root.append(chip);
 }
 const rest=ordered.length-limit;
 if(rest>0){const iaOnly=web&&ordered.slice(limit).every(x=>!x.web);const more=node('button','link-button summary-more',summaryOpen?'Réduire':'+'+rest+(iaOnly?' pour l’IA':''));more.type='button';more.id='summaryMore';more.setAttribute('aria-expanded',String(summaryOpen));if(!summaryOpen)more.setAttribute('aria-label','Afficher '+rest+' autre'+(rest>1?'s':'')+' critère'+(rest>1?'s':'')+(iaOnly?' réservés au texte pour une IA':''));more.addEventListener('click',()=>{summaryOpen=!summaryOpen;renderSummary();$('summaryMore').focus()});root.append(more)}
 return all.length;
}
function renderResult(){const active=renderSummary();$('resultPreview').classList.toggle('is-empty',!state.topic.trim());$('resultEmptyText').textContent=state.previewTab==='prompt'?'Saisissez une question : le texte à coller dans l’assistant apparaîtra ici. Besoin d’une idée ?':'Saisissez une question : la recherche préparée apparaîtra ici. Besoin d’une idée ?';$('themeStatus').textContent=topicById(state.category).name;$('filterStatus').textContent=active+' critère'+(active>1?'s':'')+' actif'+(active>1?'s':'');$('promptPreview').value=buildPrompt();$('queryPreview').textContent=searchQuery(state.engine)||'Saisissez un sujet pour préparer votre recherche web.';$('copyQuery').disabled=!state.topic.trim();$('runSearch').disabled=!state.topic.trim();for(const el of document.querySelectorAll('[data-engine]'))el.disabled=!state.topic.trim();updatePrimary();renderCompatibility();renderEngineTable();}

function switchPreview(tab){state.previewTab=tab;const prompt=tab==='prompt';$('tabPrompt').setAttribute('aria-selected',String(prompt));$('tabWeb').setAttribute('aria-selected',String(!prompt));$('tabPrompt').tabIndex=prompt?0:-1;$('tabWeb').tabIndex=prompt?-1:0;$('panelPrompt').hidden=!prompt;$('panelWeb').hidden=prompt;$('enginePicker').hidden=prompt;$('assistantPicker').hidden=!prompt;$('customAIWrap').hidden=!prompt||state.aiProvider!=='custom';document.body.dataset.destination=tab;$('refineHelp').textContent=prompt?'Tout est facultatif. Ces réglages enrichissent le texte pour l’assistant.':'Tout est facultatif. Les réglages réservés à l’IA sont conservés et réapparaissent avec « Avec une IA ».';updatePrimary();save();renderResult()}
function updatePrimary(){const ai=state.previewTab==='prompt';const name=$(ai?'aiProvider':'engineSelect').selectedOptions[0]?.textContent.replace(/ \(.*/,'')||'';$('runSearch').textContent=(ai?'Copier et ouvrir ':'Rechercher sur ')+name}
function sync(){if($('familyFilter'))$('familyFilter').value='all';if($('aiProvider')){$('aiProvider').value=state.aiProvider;$('customAIUrl').value=state.customAIUrl;}for(const id of ['topic','period','language','dateFrom','dateTo','region','filetype','includeWords','excludeWords','includeSites','excludeSites','context','promptStyle'])$(id).value=state[id]||'';$('engineSelect').value=state.engine;document.documentElement.dataset.theme=state.theme;document.body.classList.toggle('large-text',state.largeText);$('fontToggle').setAttribute('aria-pressed',String(state.largeText));$('fontToggle').textContent=state.largeText?'A− Texte normal':'A+ Texte';renderThemeMenu();$('fromContainer').hidden=state.period!=='custom';$('toContainer').hidden=state.period!=='custom';renderCategories();renderExamples();renderGoals();renderSpecial();renderPillGroup('sourceFilters',SOURCES,'sources');renderPillGroup('formatFilters',FORMATS,'formats');switchPreview(state.previewTab);renderResult()}
async function copy(text){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text)}else{const tmp=document.createElement('textarea');tmp.value=text;tmp.style.position='fixed';tmp.style.left='-9999px';document.body.append(tmp);tmp.select();const ok=document.execCommand('copy');tmp.remove();if(!ok)throw Error('Copie non disponible')}notify('Copié dans le presse-papiers');return true}catch{notify('Copie bloquée par le navigateur. Sélectionnez le texte à copier.');return false}}
function download(name,s,mime){const url=URL.createObjectURL(new Blob([s],{type:mime}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}

const CUSTOM_TEMPLATES_KEY='kerynq-v5-templates';
let damagedStorageNotified=false;
function readStoredItems(key,kind){let raw;try{raw=JSON.parse(localStorage.getItem(key)||'[]')}catch{return []}const {items,dropped}=KerynqPrivacy.salvageItems(raw,normalize,kind);if(dropped&&!damagedStorageNotified){damagedStorageNotified=true;notify(dropped+' entrée(s) illisible(s) ignorée(s) dans vos '+kind)}return items}
function getCustomTemplates(){return readStoredItems(CUSTOM_TEMPLATES_KEY,'modèles')}
function searchUrl(engine=state.engine){return KerynqSearch.engineById(engine).url+encodeURIComponent(searchQuery(engine))}
function runSearch(){if(!state.topic.trim()){notify('Saisissez un sujet avant de rechercher');$('topic').focus();return}if(state.previewTab==='prompt'){openAssistant();return}const a=document.createElement('a');a.href=searchUrl();a.target='_blank';a.rel='noopener noreferrer';document.body.append(a);a.click();a.remove();}
function setupV5(){
 $('engineSelect').addEventListener('change',e=>{state.engine=e.target.value;save();renderResult()});
 $('runSearch').addEventListener('click',runSearch);
 $('topic').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.ctrlKey&&!e.metaKey){e.preventDefault();runSearch()}});
 window.addEventListener('keydown',e=>{const k=(e.key||'').toLowerCase();if((e.ctrlKey||e.metaKey)&&k==='k'){e.preventDefault();$('topic').focus();$('topic').select()}else if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();runSearch()}});
}

function renderThemeMenu(){const root=$('themeMenu');root.replaceChildren();const current=THEMES.find(x=>x[0]===state.theme);$('themeToggle').textContent='Thème : '+current[1];document.querySelector('meta[name="theme-color"]').content=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();for(const [id,label] of THEMES){const b=node('button','theme-choice');b.type='button';b.dataset.themeChoice=id;b.setAttribute('aria-pressed',String(state.theme===id));const dot=node('span','swatch swatch-'+id);dot.setAttribute('aria-hidden','true');b.append(dot,node('span','',label));b.addEventListener('click',()=>{state.theme=id;save();document.documentElement.dataset.theme=id;renderThemeMenu();root.querySelector('[aria-pressed="true"]')?.focus();notify('Thème '+label+' appliqué')});root.append(b)}}
function toggleThemeMenu(open=$('themeMenu').hidden){$('themeMenu').hidden=!open;$('themeToggle').setAttribute('aria-expanded',String(open));if(open)$('themeMenu').querySelector('[aria-pressed="true"]')?.focus()}
const TIPS=[
 ["composerLabel","Votre question","Écrivez ce que vous cherchez, comme si vous le demandiez à quelqu’un. Rien n’est envoyé tant que vous ne cliquez pas."],
 ["destinationLabel","Où chercher","Sur le Web : vous obtenez une liste de sites. Avec une IA : vous obtenez un texte à coller dans un assistant, qui vous répond."],
 ["engineLabel","Moteur","C’est le site qui fera la recherche. Google convient à presque tout. Les autres sont utiles pour un sujet précis."],
 ["resultTitle","Votre résultat","Voici ce que KERYNQ a préparé. Cela change à chaque réglage. Vous pouvez le relire avant de lancer."],
 ["assistantLabel","Assistant","Choisissez l’IA que vous voulez utiliser. Elle s’ouvre dans un nouvel onglet, et vous y collez le texte. Elle peut demander un compte."]
];
function setupTips(){const bubble=$('tipBubble');let active=null;
 const hide=()=>{if(active){active.removeAttribute('aria-describedby');active.setAttribute('aria-expanded','false')}active=null;bubble.hidden=true};
 const show=btn=>{if(active&&active!==btn)hide();active=btn;bubble.textContent=btn.dataset.tip;bubble.hidden=false;btn.setAttribute('aria-describedby','tipBubble');btn.setAttribute('aria-expanded','true');place(btn)};
 const place=btn=>{const b=btn.getBoundingClientRect(),w=bubble.offsetWidth,h=bubble.offsetHeight,left=Math.max(10,Math.min(b.left+b.width/2-w/2,document.documentElement.clientWidth-w-10));bubble.style.left=left+'px';bubble.style.top=(b.top-h-10<10?b.bottom+10:b.top-h-10)+'px'};
 for(const [id,label,text] of TIPS){const target=$(id);const row=node('div','tip-row');target.replaceWith(row);const btn=node('button','tip ico ico-help');btn.type='button';btn.dataset.tip=text;btn.setAttribute('aria-label','Aide : '+label);btn.setAttribute('aria-expanded','false');btn.addEventListener('mouseenter',()=>show(btn));btn.addEventListener('mouseleave',hide);btn.addEventListener('focus',()=>show(btn));btn.addEventListener('blur',hide);btn.addEventListener('click',()=>show(btn));row.append(target,btn)}
 window.addEventListener('scroll',()=>{if(active)place(active)},{passive:true});
 window.addEventListener('keydown',e=>{if(e.key!=='Escape')return;hide();if(!$('themeMenu').hidden){toggleThemeMenu(false);$('themeToggle').focus()}});
 document.addEventListener('click',e=>{if(!$('themeMenu').hidden&&!e.target.closest('.theme-picker'))toggleThemeMenu(false)});
}
const WELCOME_KEY='kerynq-welcome-seen';
function setupWelcome(){const box=$('welcome');let seen=false;try{seen=localStorage.getItem(WELCOME_KEY)==='1'||localStorage.getItem(LS)!==null}catch{}box.hidden=seen;const dismiss=()=>{box.hidden=true;if(privateMode)return;try{localStorage.setItem(WELCOME_KEY,'1')}catch{}};$('hideWelcome').addEventListener('click',()=>{dismiss();$('topic').focus()});const example=()=>{if(state.topic.trim())return notify('Videz d’abord votre question pour essayer l’exemple');state.topic='Quelles aides pour rénover un logement ancien ?';$('topic').value=state.topic;switchCategory('housing');save();renderResult();$('topic').focus();notify('Exemple chargé : regardez « Votre résultat », puis lancez')};for(const id of ['tryExample','helpExample'])$(id).addEventListener('click',()=>{dismiss();example()})}
function setup(){setupWelcome();setupEngines();setupTips();setupDomainPicker();initOptions(state.category);sync();for(const id of ['topic','period','language','dateFrom','dateTo','region','filetype','includeWords','excludeWords','includeSites','excludeSites','context','promptStyle']){const el=$(id);for(const ev of ['input','change'])el.addEventListener(ev,()=>{if(state[id]===el.value)return;state[id]=el.value;if(id==='period'){$('fromContainer').hidden=state.period!=='custom';$('toContainer').hidden=state.period!=='custom'}save();renderResult()})}
$('clearSpecial').addEventListener('click',()=>{state.options[state.category]=[];save();renderSpecial();renderResult();notify('Filtres du thème décochés')});$('addCustom').addEventListener('click',()=>{const label=$('customInput').value.trim();if(!label){notify('Écris un critère à ajouter');return}initOptions(state.category);if(state.custom[state.category].length>=25){notify('25 critères personnels maximum par thème');return}const id='custom_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);state.custom[state.category].push({id,label,checked:true});$('customInput').value='';save();renderCustom();renderResult();notify('Critère personnel ajouté')});$('customInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('addCustom').click()}});
$('tabPrompt').addEventListener('click',()=>switchPreview('prompt'));$('tabWeb').addEventListener('click',()=>switchPreview('web'));for(const b of [$('tabPrompt'),$('tabWeb')])b.addEventListener('keydown',e=>{const keys=['ArrowLeft','ArrowRight','Home','End'];if(!keys.includes(e.key))return;e.preventDefault();const target=e.key==='Home'?$('tabPrompt'):e.key==='End'?$('tabWeb'):b===$('tabPrompt')?$('tabWeb'):$('tabPrompt');target.focus();target.click()});
$('copyPrompt').addEventListener('click',()=>copy(buildPrompt()));$('copyQuery').addEventListener('click',()=>copy(searchQuery(state.engine)));$('downloadPrompt').addEventListener('click',()=>download('kerynq-consigne.md',buildPrompt()+'\n','text/markdown;charset=utf-8'));
for(const b of document.querySelectorAll('[data-engine]'))b.addEventListener('click',()=>{if(!state.topic.trim())return notify('Écris d’abord un sujet');const engine=b.dataset.engine;state.engine=engine;$('engineSelect').value=engine;save();renderResult();const url=searchUrl(engine);const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';document.body.append(a);a.click();a.remove()});
$('refineToggle').addEventListener('click',()=>{const open=$('refinePanel').hidden;$('refinePanel').hidden=!open;document.body.classList.toggle('refine-open',open);$('refineToggle').setAttribute('aria-expanded',String(open));$('refineToggle').textContent=open?'Masquer les réglages':'Affiner ma recherche'});
$('jumpToResult').addEventListener('click',()=>{const target=$('resultPreview');target?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});const selected=state.previewTab==='prompt'?'tabPrompt':'tabWeb';$(selected).focus({preventScroll:true})});$('fontToggle').addEventListener('click',()=>{state.largeText=!state.largeText;save();sync()});$('themeToggle').addEventListener('click',()=>toggleThemeMenu());
$('exportConfig').addEventListener('click',()=>{if(privateMode)return notify('Quittez le mode privé pour exporter un profil');download('kerynq-v5-sauvegarde.json',JSON.stringify({app:'KERYNQ',version:5,settings:state,favorites:getSaved(),templates:getCustomTemplates()},null,2),'application/json;charset=utf-8')});
$('importConfig').addEventListener('click',()=>{if(privateMode)return notify('Quittez le mode privé pour importer');$('profileFile').click()});
$('profileFile').addEventListener('change',async e=>{const file=e.target.files&&e.target.files[0];if(!file)return;
 try{
  if(privateMode)throw Error('Quittez le mode privé pour importer');
  if(file.size>KerynqPrivacy.MAX_FILE_BYTES)throw Error('Fichier trop volumineux (1,2 Mo maximum)');
  const imported=KerynqPrivacy.validateImport(JSON.parse(await file.text()),normalize);
  if((imported.favorites!==null||imported.templates!==null)&&!window.confirm('Importer le profil et remplacer les favoris/modèles présents dans la sauvegarde ?'))return;
  // Validate all data before mutating storage; rollback on quota/security errors.
  const keys=[LS,SAVED_KEY,CUSTOM_TEMPLATES_KEY];
  const previous=keys.map(key=>localStorage.getItem(key));
  try{
   localStorage.setItem(LS,JSON.stringify(imported.settings));
   if(imported.favorites!==null)localStorage.setItem(SAVED_KEY,JSON.stringify(imported.favorites));
   if(imported.templates!==null)localStorage.setItem(CUSTOM_TEMPLATES_KEY,JSON.stringify(imported.templates));
  }catch(storageError){for(let i=0;i<keys.length;i++)try{if(previous[i]===null)localStorage.removeItem(keys[i]);else localStorage.setItem(keys[i],previous[i])}catch{}throw Error('Stockage indisponible ou plein : import annulé')}
  state=imported.settings;initOptions(state.category);sync();
  notify('Import validé et appliqué');
 }catch(err){notify('Import impossible : '+err.message)}finally{e.target.value=''}
});
$('reset').addEventListener('click',()=>{if(!window.confirm('Effacer tous les réglages et critères personnalisés de KERYNQ ?'))return;state=clone(DEFAULT);initOptions(state.category);$('categorySearch').value='';save();sync();notify('Préférences KERYNQ réinitialisées')});}setup();setupV5();
const SAVED_KEY='kerynq-saved-v1';
function getSaved(){return readStoredItems(SAVED_KEY,'favoris')}
$('privateSearchToggle').addEventListener('click',togglePrivateMode);
$('clearAllData').addEventListener('click',eraseAllKerynqData);
updatePrivateUI();
$('aiProvider').addEventListener('change',()=>{state.aiProvider=$('aiProvider').value;$('customAIWrap').hidden=state.aiProvider!=='custom';save();renderResult()});
$('customAIUrl').addEventListener('input',()=>{state.customAIUrl=$('customAIUrl').value.slice(0,300);save()});
async function openAssistant(){
 if(!state.topic.trim()){notify('Saisissez un sujet avant de préparer le texte');$('topic').focus();return}
 let url=AI_PROVIDERS[state.aiProvider];
 if(state.aiProvider==='custom'){
  try{url=KerynqPrivacy.safeAssistantUrl(state.customAIUrl)}
  catch{notify('Adresse HTTPS requise, sans identifiants ni paramètres');$('customAIUrl').focus();return}
 }
 if(!await copy(buildPrompt()))return;
 // La consigne n'est jamais placée dans l'URL ni envoyée par API : l'utilisateur la colle lui-même.
 window.open(url,'_blank','noopener,noreferrer');
 notify('Texte copié : collez-le dans la conversation de l’IA');
}

})();
