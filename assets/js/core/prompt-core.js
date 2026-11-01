/* KERYNQ · méthode de la consigne IA selon le domaine, l'assistant et le format. Modèles locaux, aucun appel réseau.
 * Une consigne oriente l'assistant ; elle ne garantit ni une recherche réelle ni la qualité de la réponse.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.KerynqPrompt = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const FAMILY_METHODS = {
    actus: ['Date chaque fait et distingue la date de l’événement de celle de la publication.','Croise au moins deux sources indépendantes avant de présenter un fait comme établi.','Sépare les faits, les déclarations et les analyses.'],
    culture: ['Distingue les informations officielles, les critiques et les avis de communauté.','Signale les rumeurs et les annonces non confirmées.','Préviens avant de révéler un élément d’intrigue.'],
    tech: ['Indique la version, la date et la documentation d’origine.','Signale ce qui dépend de l’environnement ou peut être devenu obsolète.','Propose un moyen simple de vérifier ce que tu avances.'],
    sciences: ['Privilégie les publications originales et les synthèses reconnues.','Indique le niveau de preuve, la taille des études et leurs limites.','Distingue corrélation et causalité.'],
    quotidien: ['Donne des étapes concrètes, avec leur coût et leurs conditions quand ils sont connus.','Précise ce qui dépend du pays, de la région ou de la situation.','Signale quand l’avis d’un professionnel est utile.'],
    demarches: ['Cite le texte ou l’organisme d’origine, avec sa date.','Indique les délais, les pièces et les recours quand ils sont connus.','Précise ce qui varie selon la situation.'],
    mobilite: ['Vérifie que les horaires, tarifs et conditions sont à jour, et donne leur date.','Renvoie vers l’exploitant ou le constructeur concerné.','Signale les règles de sécurité et les règles locales.'],
    formation: ['Indique le niveau visé, la durée et les prérequis.','Distingue les ressources gratuites, payantes et certifiantes.','Vérifie les dates et conditions d’inscription auprès de l’organisme.']
  };
  const TOPIC_METHODS = {
    osint: ['Utilise uniquement des sources publiques, et indique pour chacune sa provenance et sa date de consultation.','Conserve la chaîne de preuve : source d’origine, reprises, archives.','Distingue fait établi, déduction et hypothèse, avec un niveau de confiance.','Ne cherche pas à localiser, identifier ou profiler une personne privée.'],
    news: ['Remonte à la source d’origine de l’information plutôt qu’à ses reprises.','Croise au moins deux sources indépendantes et signale les informations non confirmées.','Date chaque fait et signale ce qui a pu évoluer depuis.'],
    cyber: ['Reste dans un cadre défensif et légal : détection, correction, prévention.','Cite les avis de sécurité officiels et les versions concernées.','Ne fournis pas de procédure pour attaquer un système sans autorisation.'],
    health: ['Privilégie les recommandations officielles et les synthèses reconnues, avec leur date.','Indique le niveau de preuve et les signes qui justifient de consulter.','Donne des informations générales sourcées, sans poser de diagnostic. Oriente vers un professionnel compétent lorsque nécessaire.'],
    animals: ['Donne des informations générales sourcées, sans poser de diagnostic. Oriente vers un professionnel compétent lorsque nécessaire.','Précise ce qui varie selon l’espèce, l’âge et l’état de l’animal.'],
    law: ['Vérifie la juridiction, la date de validité des règles et les sources officielles ; ne présente pas une information générale comme un conseil personnalisé.','Cite le texte applicable et distingue la loi, la jurisprudence et les commentaires.'],
    administration: ['Vérifie la juridiction, la date de validité des règles et les sources officielles ; ne présente pas une information générale comme un conseil personnalisé.','Indique les démarches, pièces et délais, avec l’organisme compétent.'],
    personalfinance: ['Vérifie la juridiction, la date de validité des règles et les sources officielles ; ne présente pas une information générale comme un conseil personnalisé.','Indique les frais et les risques, et distingue information et recommandation.'],
    housing: ['Vérifie la juridiction, la date de validité des règles et les sources officielles ; ne présente pas une information générale comme un conseil personnalisé.','Précise ce qui dépend du logement, de la commune et du statut de la personne.'],
    cooking: ['Signale les allergènes et les règles de conservation et de cuisson.'],
    homegarden: ['Signale les risques des travaux et quand faire appel à un professionnel.']
  };
  const QUALITY = ['Cherche réellement sur le Web si les outils nécessaires sont disponibles. Ne prétends jamais avoir effectué une recherche qui n’a pas été faite.','Cite les sources utiles avec liens et dates, et privilégie les documents originaux lorsque cela apporte une preuve.','Distingue les faits confirmés, les informations non vérifiées, les rumeurs et les opinions.','Pour une actualité, une sortie, un prix, une disponibilité ou une règle, vérifie que l’information est toujours valable.','Ne déduis pas une implication ou une causalité du simple fait que des noms ou des événements sont associés.','En cas de désaccord entre sources fiables, présente les points de divergence.','Indique clairement les limites de ce qui a pu être vérifié.','Réponds en français, avec des titres simples et une structure lisible.'];
  const QUALITY_SHORT = ['Ne prétends jamais avoir effectué une recherche qui n’a pas été faite.','Cite tes sources avec liens et dates, et indique les limites de ce qui a pu être vérifié.','Réponds en français, de façon brève : l’essentiel d’abord.'];
  // Les fonctions de chaque assistant changent souvent : seule la distinction stable est retenue.
  const ASSISTANT_NOTES = {
    perplexity: 'Appuie chaque affirmation importante sur une source citée dans ta réponse.',
    custom: ''
  };
  const DEFAULT_ASSISTANT_NOTE = 'Si tu n’as pas accès au Web dans cette conversation, dis-le dès le début de ta réponse.';
  function own(map, key) { return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : undefined; }
  function guidance({topicId, family, provider, style}) {
    const short = style === 'short';
    const method = own(TOPIC_METHODS, topicId) || own(FAMILY_METHODS, family) || [];
    const note = own(ASSISTANT_NOTES, provider);
    const assistant = note === undefined ? DEFAULT_ASSISTANT_NOTE : note;
    const quality = short ? QUALITY_SHORT : QUALITY;
    return {method:[...method],quality:assistant ? [...quality,assistant] : [...quality]};
  }
  return Object.freeze({guidance,FAMILY_METHODS,TOPIC_METHODS});
});
