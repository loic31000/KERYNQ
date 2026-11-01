# Roadmap KERYNQ

## Base intégrée

- [x] Identité KERYNQ et recherche navigateur.
- [x] 39 univers après les lots 4A et 4B, modes simple/avancé, filtres par moteur.
- [x] Favoris et modèles locaux, import/export.
- [x] Sélecteur de neuf IA + URL HTTPS personnalisée, sans transfert automatique.
- [x] Documentation sécurité, contribution, licence MIT, accessibilité.

## Avant ouverture du dépôt

- [x] Choisir la licence MIT pour le code et la documentation ; voir `LICENSE` et `BRANDING.md`.
- [ ] Vérifier la provenance et les droits des ressources graphiques actuelles **et historiques** avant publication (notamment l'ancien globe et les logos).
- [ ] Tester sur navigateurs et appareils réels : moteurs et largeurs déjà automatisés, voir `AUDIT_PREPUBLICATION.md`.
- [ ] Audit accessibilité WCAG 2.2 AA avec lecteurs d'écran et clavier.
- [x] Lot 2 : garde-fous de schéma JSON, mode privé, effacement local, validation des URL personnalisées, tests unitaires.
- [ ] Revue de sécurité indépendante avant publication : CSP et premier audit livrés, voir `AUDIT_PREPUBLICATION.md`.
- [ ] Tester l'installation PWA sous HTTPS et cache hors ligne ; vérifier icônes requises.
- [ ] Analyser la compatibilité réelle des opérateurs par moteur : ce que KERYNQ transmet est documenté (`MOTEURS.md`), le respect par chaque moteur reste à contrôler.
- [ ] Choisir la politique de suivi d'incidents et activer les rapports de vulnérabilités privés **après publication**, si souhaité.
- [ ] Définir nom de domaine, mentions légales et politique de confidentialité publique.
- [ ] Ne changer la visibilité et ne mettre GitHub Pages en ligne qu'avec accord explicite.

## Améliorations proposées après revue

1. **Recherches partageables sans données privées** : encoder seulement les filtres non sensibles, avec un aperçu avant partage.
2. **Collections et vues** : regrouper plusieurs moteurs ou assistants à lancer manuellement, avec options mémorisées.
3. **Filtres vérifiables** : tests et matrice de compatibilité des opérateurs régulièrement mise à jour.
4. **Assistant local de formulation** : suggérer des variantes de requêtes dans le navigateur, sans API obligatoire.
5. **Fonctions d'accessibilité** : raccourcis documentés, messages lecteurs d'écran, zoom et contraste.
6. **Qualité et architecture** : découper le HTML monolithique en modules CSS/JS lorsque la base sera stabilisée, et ajouter tests unitaires navigateur.
7. **Vie privée** : bouton d'effacement complet des données, export sélectif et avertissement avant ouverture de sites tiers.
8. **Multi-IA** : favoris de fournisseurs, liens desktop documentés, comparaison manuelle facultative de réponses.

**Priorité :** sécurité et transparence des filtres avant les nouvelles animations.

## Phase 1, lot 1 : compilateur Web

- [x] Extraction du compilateur Web dans `search-query-core.js` (compatible ouverture `file://`).
- [x] Tests unitaires Google, Brave et DuckDuckGo et cas limites des dates/domaines.
- [x] Message de compatibilité indiquant les opérateurs inclus mais non garantis par les moteurs.
- [x] Phase 1, lot 2 : validation et transaction d’import JSON, mode privé, URLs IA et suppression complète des données locales.
- [x] Phase 1, lot 3 : navigation clavier et contrôles Chromium. Audit complet avec lecteurs d'écran toujours à faire.

Aucun nouvel univers ajouté dans ce lot ; les 12 catégories du rapport V6 ont ensuite été livrées par les lots 4A et 4B.

## Phase 1, lot 2 : sécurité et confidentialité (prépublication)

- [x] Extraction de fonctions de validation dans `privacy-core.js` et mise en cache dans la PWA.
- [x] Import profil avec contrôles de forme, limites de volume et confirmation ; tentative de rollback sur erreur de stockage.
- [x] Mode privé temporaire : suspend la persistance des recherches et nettoie la dernière requête active enregistrée.
- [x] Bouton d'effacement complet du stockage KERYNQ avec confirmation.
- [x] URL HTTPS personnalisée sans identifiants, query-string ou fragment.
- [x] Tests unitaires et scénarios Chromium 1440/390/320 px.
- [ ] Phase 1, lot 3 : clavier livré (voir ci-dessous) ; zoom à 200 %, lecteurs d'écran et détails PWA restent à faire.

## Plus tard : moteurs de recherche supplémentaires

- [x] Bing, Qwant et Startpage intégrés, avec des moteurs spécialisés : voir `MOTEURS.md`.
- [ ] Ecosia, Mojeek et SearXNG : adresse à confirmer manuellement ; opérateurs réels à contrôler.
- [ ] Garder les moteurs facultatifs : pas de clés API, pas de serveur, pas d'envoi automatique des requêtes à plusieurs moteurs.
- [ ] Différencier clairement les capacités de chaque moteur dans le compilateur de requêtes.

Les 39 univers sont maintenant intégrés. Les packs de sources officiels ont été abandonnés à la demande du propriétaire.

## Phase 1, lot 3 : accessibilité clavier

- [x] Navigation des onglets IA/Web par flèches/Home/End et roving tabindex.
- [x] Conservation du focus après sélection des thèmes, objectifs et filtres rapides.
- [x] Commandes pour les modèles accessibles et annonces persistantes.
- [x] Contrôles navigateur automatisés (Chromium, petits écrans).
- [ ] Test NVDA/VoiceOver/TalkBack et audit WCAG complet avant publication.

Les univers supplémentaires et les moteurs de recherche restent planifiés pour les phases ultérieures.

## Phase 2 · Généralisation par petits lots

- [x] **Lot 4A** : 6 univers du quotidien (administration, famille, animaux, logement, droit, finances personnelles) ; navigation par 8 familles ; enrichissement Santé & Médecine.
- [x] **Lot 4B** : enfance/scolarité, travail/emploi, retraite/autonomie, cuisine/alimentation, maison/jardin, mobilité/transports (réutiliser ou distinguer l'univers auto/mobilité existant).
- Packs de sources institutionnelles : livrés pour la France puis retirés à la demande du propriétaire.
- [ ] Tests de validation sur tous les univers avant fusion.
- [ ] Autres moteurs de recherche, **après** stabilisation, sans API payante.

## Phase 2 · Lot 4B (39 univers)

- [x] Six domaines ajoutés, options contextualisées, SVG et familles conservées.
- [x] Distinction véhicule / réseau de transports collectifs, titres métier / scolarité.
- [x] Tests 39 univers, navigation 8 familles et régression des requêtes Web.
- Packs de sources officielles : retirés à la demande du propriétaire.

## Dernière passe avant publication

- [x] Consignes adaptées au domaine et à l'assistant, format court ou détaillé.
- [x] Exemple au premier lancement et section d'aide.
- [x] Détail des filtres limité au moteur choisi.
- Écartés par le propriétaire : variantes de requêtes. Reporté pour éviter de complexifier : lien de partage.
- [ ] Audit de sécurité, puis publication : décision du propriétaire.

## Refonte de l'ergonomie

- [x] Domaines en pastilles filtrables, texte pour l'IA agrandi, moteurs d'images, onze thèmes.
- Retiré à la demande du propriétaire : section des modèles (les modèles enregistrés restent dans les sauvegardes). Recherche par fichier abandonnée.
