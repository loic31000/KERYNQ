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
  const engines = ['google', 'brave', 'duck'];
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
    const topic=String(state.topic||'').trim();
    const web=topic?['Sujet principal']:[];
    const prompt=[];
    const parts=topic?[topic]:[];
    const add=(flag,label)=>{if(flag)web.push(label)};
    const incl=tokens(state.includeWords).map(quote).filter(Boolean);
    if(incl.length){parts.push(...incl);add(true,'Mots inclus')}
    const excl=tokens(state.excludeWords).map(x=>quote(x.replace(/^-+/,''))).filter(Boolean);
    if(excl.length){parts.push(...excl.map(x=>'-'+x));add(true,'Exclusions')}
    const sites=domains(state.includeSites);
    if(sites.length===1){parts.push('site:'+sites[0]);add(true,'Site ciblé')}
    else if(sites.length>1){
      if(provider==='duck')prompt.push('Sites multiples (non transmis à DuckDuckGo)');
      else {parts.push('('+sites.map(x=>'site:'+x).join(' OR ')+')');add(true,'Sites ciblés (OR, résultat non garanti)')}
    }
    const excluded=domains(state.excludeSites);
    if(excluded.length){parts.push(...excluded.map(x=>'-site:'+x));add(true,'Sites exclus')}
    if(filetypes.includes(state.filetype)){parts.push('filetype:'+state.filetype);add(true,'Type de fichier')}
    const date=dates(state,now);
    if(state.period && state.period!=='all'){
      if(date.invalid)prompt.push('Période (dates invalides : corriger la sélection)');
      else if(provider==='google'){
        if(date.from)parts.push('after:'+date.from);
        if(date.to)parts.push('before:'+nextDay(date.to));
        add(Boolean(date.from||date.to),'Période');
      }else prompt.push('Période (non transmise au moteur choisi)');
    }
    if(['fr','en'].includes(state.language)){
      if(provider==='brave'){parts.push('lang:'+state.language);add(true,'Langue des pages')}
      else prompt.push('Langue des pages (consigne IA seulement)');
    }else if(state.language && state.language!=='all')prompt.push('Langues préférées');
    const region=String(state.region||'').trim();
    if(region){
      const country=regionCountry(region);
      if(provider==='brave'&&country){parts.push('loc:'+country);add(true,'Région')}
      else prompt.push('Région (consigne IA seulement)');
    }
    return {query:parts.join(' ').replace(/\s+/g,' ').trim(),web,prompt,engine:provider,invalidDates:date.invalid};
  }
  return Object.freeze({compile,tokens,domains,siteReport,dates,validISO,regionCountry});
});
