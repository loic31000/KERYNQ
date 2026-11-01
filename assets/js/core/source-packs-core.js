/* KERYNQ · packs facultatifs de sources officielles. Données locales, aucun appel réseau.
 * Un pack ne s'applique qu'après un clic, et ne garantit ni les résultats ni le statut de chaque page.
 */
(function (root, factory) {
  const search = root && root.KerynqSearch ? root.KerynqSearch : require('./search-query-core.js');
  const api = factory(search);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.KerynqSourcePacks = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (search) {
  'use strict';
  const MAX_SITES = 10;
  // page : page d'accueil lue et organisme confirmé. owner : domaine .gouv.fr bloquant la lecture automatisée, confirmé par le propriétaire dans un navigateur.
  const VERIFIED = '2026-11-01';
  const FR_DOMAINS = {
    'service-public.gouv.fr':['Service Public','page'],'legifrance.gouv.fr':['Légifrance','owner'],'justice.gouv.fr':['Ministère de la Justice','page'],'conseil-etat.fr':['Conseil d’État','page'],
    'ameli.fr':['Assurance Maladie','page'],'has-sante.fr':['Haute Autorité de Santé','page'],'sante.gouv.fr':['Ministère de la Santé','owner'],'ansm.sante.fr':['ANSM, sécurité du médicament','page'],'santepubliquefrance.fr':['Santé publique France','page'],
    'impots.gouv.fr':['Impôts','page'],'economie.gouv.fr':['Ministère de l’Économie','owner'],'anil.org':['ANIL, information logement','page'],'france-renov.gouv.fr':['France Rénov’','page'],'ecologie.gouv.fr':['Ministère de la Transition écologique','page'],
    'caf.fr':['Caisses d’Allocations familiales','page'],'education.gouv.fr':['Ministère de l’Éducation nationale','owner'],'onisep.fr':['Onisep, orientation','page'],'travail-emploi.gouv.fr':['Ministère du Travail','owner'],'francetravail.fr':['France Travail','page'],
    'info-retraite.fr':['Info Retraite','page'],'lassuranceretraite.fr':['L’Assurance retraite','page'],'pour-les-personnes-agees.gouv.fr':['Portail des personnes âgées','page'],'agriculture.gouv.fr':['Ministère de l’Agriculture','page'],'anses.fr':['Anses, sécurité sanitaire','page'],
    'rappel.conso.gouv.fr':['Rappel Conso','page'],'signal.conso.gouv.fr':['SignalConso','page'],'securite-routiere.gouv.fr':['Sécurité routière','page'],'ants.gouv.fr':['France Titres (ANTS)','owner'],'diplomatie.gouv.fr':['France Diplomatie','page'],
    'insee.fr':['Insee','page'],'assemblee-nationale.fr':['Assemblée nationale','page'],'senat.fr':['Sénat','page'],'meteofrance.com':['Météo-France','page'],'cnrs.fr':['CNRS','page'],'inserm.fr':['Inserm','page'],'cnes.fr':['CNES','page'],
    'cyber.gouv.fr':['ANSSI','owner'],'cybermalveillance.gouv.fr':['Cybermalveillance.gouv.fr','page'],'cnil.fr':['CNIL','page'],'bnf.fr':['Bibliothèque nationale de France','page'],'culture.gouv.fr':['Ministère de la Culture','page'],'cnc.fr':['CNC, cinéma et image animée','page'],
    'enseignementsup-recherche.gouv.fr':['Ministère de l’Enseignement supérieur','owner'],'moncompteformation.gouv.fr':['Mon Compte Formation','page'],'inc-conso.fr':['Institut national de la consommation','page'],'sports.gouv.fr':['Ministère des Sports','page'],'arcep.fr':['Arcep','page'],'data.gouv.fr':['data.gouv.fr','page']
  };
  // Chaque univers est explicitement couvert : une liste vide signifie « aucune source officielle pertinente ».
  const FR_UNIVERSES = {
    general:[],manga:[],anime:[],tcg:[],music:[],news:[],
    series:['cnc.fr'],films:['cnc.fr'],games:['cnc.fr'],
    politics:['assemblee-nationale.fr','senat.fr','legifrance.gouv.fr'],
    ai:['cnil.fr','cyber.gouv.fr'],cyber:['cyber.gouv.fr','cybermalveillance.gouv.fr','cnil.fr'],science:['cnrs.fr','inserm.fr'],tech:['arcep.fr','cnil.fr'],
    history:['bnf.fr','culture.gouv.fr'],economy:['insee.fr','economie.gouv.fr'],sports:['sports.gouv.fr'],books:['bnf.fr','culture.gouv.fr'],travel:['diplomatie.gouv.fr','service-public.gouv.fr'],
    health:['ameli.fr','has-sante.fr','sante.gouv.fr','ansm.sante.fr','santepubliquefrance.fr'],shopping:['signal.conso.gouv.fr','rappel.conso.gouv.fr','inc-conso.fr','economie.gouv.fr'],culture:['culture.gouv.fr','bnf.fr'],
    environment:['ecologie.gouv.fr','meteofrance.com'],space:['cnes.fr'],osint:['data.gouv.fr','insee.fr','legifrance.gouv.fr'],automotive:['securite-routiere.gouv.fr','ants.gouv.fr','service-public.gouv.fr'],
    learning:['onisep.fr','enseignementsup-recherche.gouv.fr','moncompteformation.gouv.fr'],administration:['service-public.gouv.fr','ants.gouv.fr','impots.gouv.fr'],family:['service-public.gouv.fr','caf.fr'],
    animals:['agriculture.gouv.fr','anses.fr','service-public.gouv.fr'],housing:['service-public.gouv.fr','anil.org','france-renov.gouv.fr'],law:['legifrance.gouv.fr','service-public.gouv.fr','justice.gouv.fr','conseil-etat.fr'],
    personalfinance:['impots.gouv.fr','economie.gouv.fr','service-public.gouv.fr'],childhood:['education.gouv.fr','service-public.gouv.fr','onisep.fr'],work:['travail-emploi.gouv.fr','service-public.gouv.fr','francetravail.fr','moncompteformation.gouv.fr'],
    retirement:['info-retraite.fr','lassuranceretraite.fr','pour-les-personnes-agees.gouv.fr'],cooking:['anses.fr','rappel.conso.gouv.fr','agriculture.gouv.fr'],homegarden:['france-renov.gouv.fr','anil.org'],transport:['ecologie.gouv.fr','securite-routiere.gouv.fr']
  };
  const COUNTRIES = Object.freeze({FR:{label:'France',domains:FR_DOMAINS,universes:FR_UNIVERSES}});
  function countries() { return Object.keys(COUNTRIES).map(id => ({id,label:COUNTRIES[id].label})); }
  function packFor(country, topicId) {
    if (!Object.prototype.hasOwnProperty.call(COUNTRIES,country)) return [];
    const entry = COUNTRIES[country];
    if (!Object.prototype.hasOwnProperty.call(entry.universes,topicId)) return [];
    return entry.universes[topicId].map(domain => ({domain,label:entry.domains[domain][0],check:entry.domains[domain][1],verified:VERIFIED}));
  }
  function pieces(text) { return String(text || '').split(/[,;\n]+/).map(x => x.trim()).filter(Boolean); }
  function addSites(current, list) {
    const present = search.siteReport(current);
    const fresh = [...new Set(list)].filter(domain => !present.valid.includes(domain) && !present.overflow.includes(domain));
    if (present.valid.length + present.overflow.length + fresh.length > MAX_SITES) return {ok:false,value:String(current || ''),added:[]};
    return {ok:true,value:[...pieces(current),...fresh].join(', '),added:fresh};
  }
  function removeSites(current, list) {
    return pieces(current).filter(piece => !list.includes(search.domains(piece)[0])).join(', ');
  }
  return Object.freeze({MAX_SITES,VERIFIED,countries,packFor,addSites,removeSites,_coverage:COUNTRIES});
});
