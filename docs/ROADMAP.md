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
- [ ] Revue XSS/import JSON, limites de stockage, ouverture d'URL et accès aux contenus tiers.
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
