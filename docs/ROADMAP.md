# Roadmap KERYNQ

## Base intégrée

- [x] Identité KERYNQ et recherche navigateur.
- [x] 27 univers, modes simple/avancé, filtres par moteur.
- [x] Favoris et modèles locaux, import/export.
- [x] Sélecteur de neuf IA + URL HTTPS personnalisée, sans transfert automatique.
- [x] Documentation sécurité, contribution, licence provisoire, accessibilité.

## Avant fusion et ouverture du dépôt

- [ ] Décider d'une licence (MIT, Apache-2.0, GPL ou autre) et vérifier toutes les ressources (visuel du globe, icônes, polices).
- [ ] Tester le projet dans Brave, Chrome, Firefox, Safari si disponible, mobile 320/390 px et zoom 200 %.
- [ ] Audit accessibilité WCAG 2.2 AA avec lecteurs d'écran et clavier.
- [x] Lot 2 : garde-fous de schéma JSON, mode privé, effacement local, validation des URL personnalisées, tests unitaires.
- [ ] Audit de sécurité approfondi (XSS, CSP, données externes, stockage, tests multi-navigateurs) avant publication.
- [ ] Tester l'installation PWA sous HTTPS et cache hors ligne ; vérifier icônes requises.
- [ ] Analyser la compatibilité réelle des opérateurs par moteur et documenter les limites.
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
- [ ] Phase 1, lot 3 : navigation clavier et tests lecteurs d’écran.

Aucun nouvel univers ajouté dans ce lot ; les 12 catégories du rapport V6 restent à concevoir sans surcharger l’accueil.

## Phase 1, lot 2 : sécurité et confidentialité (prépublication)

- [x] Extraction de fonctions de validation dans `privacy-core.js` et mise en cache dans la PWA.
- [x] Import profil avec contrôles de forme, limites de volume et confirmation ; tentative de rollback sur erreur de stockage.
- [x] Mode privé temporaire : suspend la persistance des recherches et nettoie la dernière requête active enregistrée.
- [x] Bouton d'effacement complet du stockage KERYNQ avec confirmation.
- [x] URL HTTPS personnalisée sans identifiants, query-string ou fragment.
- [x] Tests unitaires et scénarios Chromium 1440/390/320 px.
- [ ] Phase 1, lot 3 : accessibilité clavier, zoom à 200 %, lecteurs d'écran et détails PWA.

## Plus tard : moteurs de recherche supplémentaires

- [ ] Étudier Startpage, Qwant, Ecosia, Bing, Mojeek et SearXNG, en vérifiant les URL officielles et les opérateurs supportés avant chaque intégration.
- [ ] Garder les moteurs facultatifs : pas de clés API, pas de serveur, pas d'envoi automatique des requêtes à plusieurs moteurs.
- [ ] Différencier clairement les capacités de chaque moteur dans le compilateur de requêtes.

Le nombre d'univers reste à 27 durant la fiabilisation ; les nouveaux thèmes généraux arrivent après validation de la phase 1.
