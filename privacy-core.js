/* KERYNQ privacy and import validation. Pure local helpers, no network calls. */
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.KerynqPrivacy = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const MAX_FILE_BYTES = 1200000;
  const MAX_FAVORITES = 80;
  const MAX_TEMPLATES = 30;
  function record(x) { return x !== null && typeof x === 'object' && !Array.isArray(x); }
  function cleanText(x, max, fallback='') {
    if (typeof x !== 'string') return fallback;
    return x.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0,max) || fallback;
  }
  function safeAssistantUrl(raw) {
    if (typeof raw !== 'string' || !raw.trim() || raw.length > 300) throw Error('Adresse HTTPS invalide');
    let url;
    try { url = new URL(raw.trim()); } catch { throw Error('Adresse HTTPS invalide'); }
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password || url.search || url.hash) {
      throw Error('Adresse HTTPS sans identifiants ni paramètres requise');
    }
    return url.href;
  }
  function scrubCurrentSearch(settings) {
    if (!record(settings)) return {};
    const clean = {...settings};
    for(const key of ['topic','context','includeWords','excludeWords','includeSites','excludeSites','region','dateFrom','dateTo','customAIUrl']) clean[key]='';
    return clean;
  }
  function validateItems(items, normalizeSettings, kind) {
    if (!Array.isArray(items)) throw Error('Collection '+kind+' invalide');
    const fav = kind === 'favoris', max=fav?MAX_FAVORITES:MAX_TEMPLATES;
    if (items.length>max) throw Error('Trop de '+kind+' dans le fichier');
    const seen=new Set();
    return items.map((item,i)=>{
      if (!record(item) || !record(item.settings) || typeof item.id!=='string' || !item.id.trim()) {
        throw Error(kind+' : entrée '+(i+1)+' invalide');
      }
      const id=cleanText(item.id,90);
      if (seen.has(id)) throw Error(kind+' : identifiants dupliqués');
      seen.add(id);
      const settings=normalizeSettings(item.settings);
      if (!record(settings)) throw Error(kind+' : réglages invalides');
      if (fav) {
        return {id, name:cleanText(item.name,90,cleanText(settings.topic,90,'Favori')),
          topic:cleanText(item.topic,160,cleanText(settings.topic,160)),
          folder:cleanText(item.folder,50,'Général'),category:cleanText(item.category,80,'Tous les sujets'),
          pinned:item.pinned===true,settings};
      }
      return {id,label:cleanText(item.label,60,'Modèle'),settings};
    });
  }
  // Stored collections are recovered entry by entry; imports stay all-or-nothing.
  function salvageItems(items,normalizeSettings,kind) {
    if (!Array.isArray(items)) return {items:[],dropped:1};
    const kept=[],seen=new Set();let dropped=0;
    for (const item of items.slice(0,kind==='favoris'?MAX_FAVORITES:MAX_TEMPLATES)) {
      try {
        const [clean]=validateItems([item],normalizeSettings,kind);
        if (seen.has(clean.id)) dropped++;
        else {seen.add(clean.id);kept.push(clean);}
      } catch { dropped++; }
    }
    return {items:kept,dropped};
  }
  function withCurrentPreferences(settings,current) {
    const merged={...settings};
    for(const key of ['theme','largeText','aiProvider','customAIUrl','mode','showAll','previewTab']) merged[key]=current[key];
    return merged;
  }
  function validateImport(data,normalizeSettings) {
    if (!record(data) || data.app!=='KERYNQ' || ![3,5].includes(data.version) || !record(data.settings)) {
      throw Error('Profil KERYNQ incompatible');
    }
    const settings=normalizeSettings(data.settings);
    if (!record(settings)) throw Error('Réglages invalides');
    const hasFavorites=Object.prototype.hasOwnProperty.call(data,'favorites');
    const hasTemplates=Object.prototype.hasOwnProperty.call(data,'templates');
    const favorites=data.version===5 && hasFavorites?validateItems(data.favorites,normalizeSettings,'favoris'):null;
    const templates=data.version===5 && hasTemplates?validateItems(data.templates,normalizeSettings,'modèles'):null;
    return {settings,favorites,templates};
  }
  return Object.freeze({record,cleanText,safeAssistantUrl,scrubCurrentSearch,validateItems,salvageItems,withCurrentPreferences,validateImport,MAX_FILE_BYTES,MAX_FAVORITES,MAX_TEMPLATES});
});
