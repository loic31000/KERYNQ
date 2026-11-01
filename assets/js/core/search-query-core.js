/* KERYNQ · compilation locale des requêtes par moteur.
 * Pas d'API, de dépendance ou de transmission réseau.
 * Chaque opérateur décrit l'intention de recherche, jamais un résultat garanti.
 */
(function (global, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (global) global.KerynqSearch = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  // words : mots inclus. exclude : mots exclus. site, sites, excludeSite, filetype, period, lang, loc : opérateurs transmis.
  // Un moteur spécialisé ne reçoit que le sujet et les mots : sa syntaxe propre n'est pas supposée.
  const OPEN_WEB = {words:true,exclude:true,site:true,excludeSite:true};
  const ENGINES = Object.freeze([
    {id:'google',label:'Google',group:'general',url:'https://www.google.com/search?q=',ops:{...OPEN_WEB,sites:true,filetype:true,period:true}},
    {id:'brave',label:'Brave',group:'general',url:'https://search.brave.com/search?q=',ops:{...OPEN_WEB,sites:true,filetype:true,lang:true,loc:true}},
    {id:'duck',label:'DuckDuckGo',group:'general',url:'https://duckduckgo.com/?q=',ops:{...OPEN_WEB,filetype:true}},
    {id:'bing',label:'Bing',group:'general',url:'https://www.bing.com/search?q=',ops:{...OPEN_WEB,sites:true,filetype:true}},
    {id:'qwant',label:'Qwant',group:'general',url:'https://www.qwant.com/?q=',ops:{...OPEN_WEB}},
    {id:'startpage',label:'Startpage',group:'general',url:'https://www.startpage.com/do/search?query=',ops:{...OPEN_WEB}},
    {id:'scholar',label:'Google Scholar',group:'special',field:'Articles scientifiques',url:'https://scholar.google.com/scholar?q=',ops:{words:true,exclude:true}},
    {id:'pubmed',label:'PubMed',group:'special',field:'Santé et médecine',url:'https://pubmed.ncbi.nlm.nih.gov/?term=',ops:{words:true}},
    {id:'arxiv',label:'arXiv',group:'special',field:'Prépublications scientifiques',url:'https://arxiv.org/search/?searchtype=all&query=',ops:{words:true}},
    {id:'youtube',label:'YouTube',group:'special',field:'Vidéo',url:'https://www.youtube.com/results?search_query=',ops:{words:true}},
    {id:'wikipedia',label:'Wikipédia',group:'special',field:'Encyclopédie',url:'https://fr.wikipedia.org/w/index.php?search=',ops:{words:true}},
    {id:'github',label:'GitHub',group:'special',field:'Code',url:'https://github.com/search?q=',ops:{words:true}},
    {id:'reddit',label:'Reddit',group:'special',field:'Communautés',url:'https://www.reddit.com/search/?q=',ops:{words:true}},
    {id:'bingnews',label:'Bing Actualités',group:'special',field:'Journalisme et actualité',url:'https://www.bing.com/news/search?q=',ops:{words:true}},
    {id:'factcheck',label:'Fact Check Explorer',group:'special',field:'Vérification des faits',url:'https://toolbox.google.com/factcheck/explorer/search/',ops:{words:true}},
    {id:'archive',label:'Internet Archive',group:'special',field:'OSINT et archives',url:'https://archive.org/search?query=',ops:{words:true}},
    {id:'shodan',label:'Shodan',group:'special',field:'OSINT et services exposés',url:'https://www.shodan.io/search?query=',ops:{words:true}},
    {id:'datagouv',label:'data.gouv.fr',group:'special',field:'Données publiques',url:'https://www.data.gouv.fr/datasets/search?q=',ops:{words:true}},
    {id:'openlibrary',label:'Open Library',group:'special',field:'Livres',url:'https://openlibrary.org/search?q=',ops:{words:true}},
    {id:'myanimelist',label:'MyAnimeList',group:'special',field:'Anime et mangas',url:'https://myanimelist.net/search/all?q=',ops:{words:true}},
    {id:'steam',label:'Steam',group:'special',field:'Jeux vidéo',url:'https://store.steampowered.com/search/?term=',ops:{words:true}},
    {id:'musicbrainz',label:'MusicBrainz',group:'special',field:'Musique',url:'https://musicbrainz.org/search?type=artist&query=',ops:{words:true}},
    {id:'openstreetmap',label:'OpenStreetMap',group:'special',field:'Cartes et lieux',url:'https://www.openstreetmap.org/search?query=',ops:{words:true}}
  ]);
  const engines = ENGINES.map(e => e.id);
  // Simple suggestion par univers : elle ne change jamais le moteur sans clic.
  const SUGGESTIONS = Object.freeze({health:'pubmed',science:'scholar',space:'arxiv',ai:'github',tech:'github',cyber:'github',history:'wikipedia',culture:'wikipedia',films:'youtube',series:'youtube',learning:'youtube',manga:'myanimelist',anime:'myanimelist',music:'musicbrainz',games:'steam',books:'openlibrary',news:'bingnews',politics:'factcheck',osint:'archive',economy:'datagouv',environment:'datagouv',travel:'openstreetmap',transport:'openstreetmap'});
  function engineById(id) { return ENGINES.find(e => e.id === id) || ENGINES[0]; }
  function suggestedEngine(topicId) { return Object.prototype.hasOwnProperty.call(SUGGESTIONS,topicId) ? engineById(SUGGESTIONS[topicId]) : null; }
  const filetypes = ['pdf', 'docx', 'xlsx', 'pptx'];
  const countryMap = {
    'france':'fr','japon':'jp','japan':'jp','allemagne':'de','germany':'de',
    'espagne':'es','spain':'es','italie':'it','italy':'it','canada':'ca',
    'etats-unis':'us','états-unis':'us','usa':'us','united states':'us',
    'royaume-uni':'gb','united kingdom':'gb'
  };
  function tokens(input) {
    return String(input || '').split(/[,;\n]+/).map(x=>x.trim()).filter(Boolean).slice(0,22);
  }
  function siteReport(input) {
    const valid=[],invalid=[],overflow=[];
    for(const raw of String(input || '').split(/[,;\n]+/).map(x=>x.trim()).filter(Boolean)) {
      const value=raw.replace(/^https?:\/\//i,'').replace(/^www\./i,'').replace(/[/?#].*$/,'').toLowerCase().trim();
      const ok=/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/.test(value) &&
         value.split('.').every(label=>label.length<=63 && !label.startsWith('-') && !label.endsWith('-')) &&
         value.length<=253;
      if(!ok) invalid.push(raw);
      else if(valid.includes(value)) continue;
      else if(valid.length<10) valid.push(value);
      else if(!overflow.includes(value)) overflow.push(value);
    }
    return {valid,invalid,overflow};
  }
  function domains(input) {return siteReport(input).valid}
  function iso(date){return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-')}
  function validISO(value) {
    if(!/^\d{4}-\d{2}-\d{2}$/.test(value || ''))return false;
    const [year,month,day]=value.split('-').map(Number);
    const date=new Date(Date.UTC(year,month-1,day));
    return date.getUTCFullYear()===year && date.getUTCMonth()+1===month && date.getUTCDate()===day;
  }
  function nextDay(date) {
    const [year,month,day]=date.split('-').map(Number);
    const next=new Date(Date.UTC(year,month-1,day+1));
    return [next.getUTCFullYear(),String(next.getUTCMonth()+1).padStart(2,'0'),String(next.getUTCDate()).padStart(2,'0')].join('-');
  }
  function dates(state,now=new Date()) {
    if(state.period==='all' || !state.period)return {from:'',to:'',invalid:false};
    if(state.period==='custom') {
      const from=String(state.dateFrom||''),to=String(state.dateTo||'');
      const invalid=(!from&&!to)||Boolean(from&&!validISO(from))||Boolean(to&&!validISO(to))||Boolean(from&&to&&from>to);
      return {from:invalid?'':from,to:invalid?'':to,invalid};
    }
    const duration={day:1,week:7,month:30,year:365}[state.period];
    if(!duration)return {from:'',to:'',invalid:false};
    const first=new Date(now);first.setDate(first.getDate()-duration);
    return {from:iso(first),to:iso(now),invalid:false};
  }
  function quote(text){
    const cleaned=String(text||'').trim().replace(/^["“”]+|["“”]+$/g,'').replace(/["“”]/g,'').trim();
    if(!cleaned)return '';
    return /\s/.test(cleaned)?'"'+cleaned+'"':cleaned;
  }
  function regionCountry(value){return countryMap[String(value||'').trim().toLowerCase()]||''}
  function compile(state, engine='google', now=new Date()) {
    const provider=engines.includes(engine)?engine:'google';
    const info=engineById(provider),ops=info.ops;
    const topic=String(state.topic||'').trim();
    const web=topic?['Sujet principal']:[];
    const prompt=[];
    const parts=topic?[topic]:[];
    const add=(flag,label)=>{if(flag)web.push(label)};
    const incl=tokens(state.includeWords).map(quote).filter(Boolean);
    if(incl.length){if(ops.words){parts.push(...incl);add(true,'Mots inclus')}else prompt.push('Mots inclus (non transmis à '+info.label+')')}
    const excl=tokens(state.excludeWords).map(x=>quote(x.replace(/^-+/,''))).filter(Boolean);
    if(excl.length){if(ops.exclude){parts.push(...excl.map(x=>'-'+x));add(true,'Exclusions')}else prompt.push('Exclusions (non transmises à '+info.label+')')}
    const sites=domains(state.includeSites);
    if(sites.length===1){if(ops.site){parts.push('site:'+sites[0]);add(true,'Site ciblé')}else prompt.push('Site ciblé (non transmis à '+info.label+')')}
    else if(sites.length>1){
      if(!ops.sites)prompt.push('Sites multiples (non transmis à '+info.label+')');
      else {parts.push('('+sites.map(x=>'site:'+x).join(' OR ')+')');add(true,'Sites ciblés (OR, résultat non garanti)')}
    }
    const excluded=domains(state.excludeSites);
    if(excluded.length){if(ops.excludeSite){parts.push(...excluded.map(x=>'-site:'+x));add(true,'Sites exclus')}else prompt.push('Sites exclus (non transmis à '+info.label+')')}
    if(filetypes.includes(state.filetype)){if(ops.filetype){parts.push('filetype:'+state.filetype);add(true,'Type de fichier')}else prompt.push('Type de fichier (non transmis à '+info.label+')')}
    const date=dates(state,now);
    if(state.period && state.period!=='all'){
      if(date.invalid)prompt.push('Période (dates invalides : corriger la sélection)');
      else if(ops.period){
        if(date.from)parts.push('after:'+date.from);
        if(date.to)parts.push('before:'+nextDay(date.to));
        add(Boolean(date.from||date.to),'Période');
      }else prompt.push('Période (non transmise au moteur choisi)');
    }
    if(['fr','en'].includes(state.language)){
      if(ops.lang){parts.push('lang:'+state.language);add(true,'Langue des pages')}
      else prompt.push('Langue des pages (consigne IA seulement)');
    }else if(state.language && state.language!=='all')prompt.push('Langues préférées');
    const region=String(state.region||'').trim();
    if(region){
      const country=regionCountry(region);
      if(ops.loc&&country){parts.push('loc:'+country);add(true,'Région')}
      else prompt.push('Région (consigne IA seulement)');
    }
    return {query:parts.join(' ').replace(/\s+/g,' ').trim(),web,prompt,engine:provider,invalidDates:date.invalid};
  }
  // Tableau issu du compilateur : il décrit ce que KERYNQ envoie, pas ce que le moteur respecte ensuite.
  const features = [
    ['words','Mots à inclure',{includeWords:'mot exact'},'"mot exact"'],
    ['exclude','Mots à exclure',{excludeWords:'autre'},'-autre'],
    ['site','Un site',{includeSites:'a.fr'},'site:a.fr'],
    ['sites','Plusieurs sites',{includeSites:'a.fr,b.fr'},'site:a.fr OR site:b.fr'],
    ['excludeSite','Site à exclure',{excludeSites:'a.fr'},'-site:a.fr'],
    ['filetype','Type de fichier',{filetype:'pdf'},'filetype:pdf'],
    ['period','Période',{period:'custom',dateFrom:'2026-01-01',dateTo:'2026-01-31'},'after:2026-01-01'],
    ['language','Langue',{language:'fr'},'lang:fr'],
    ['region','Pays',{region:'France'},'loc:fr']
  ];
  function capabilities() {
    return features.map(([id,label,settings,marker]) => ({id,label,engines:Object.fromEntries(engines.map(engine => [engine,compile({topic:'x',...settings},engine).query.includes(marker)]))}));
  }
  return Object.freeze({ENGINES,engineById,suggestedEngine,capabilities,compile,tokens,domains,siteReport,dates});
});
