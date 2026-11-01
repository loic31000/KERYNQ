# Historique des changements

Ce journal suit les changements vérifiables de KERYNQ. Les versions décrivent le développement et ne signifient pas une publication publique.

## Non publié (branche de préparation)

- Documentation communautaire, sécurité, statut de licence et architecture.
- Sélecteur de neuf assistants IA + fournisseur personnalisé HTTPS, sans transmission automatique de la consigne.
- Mise à jour des tests statiques et vérifications d'interface associées.

## Base V5 importée

- Identité KERYNQ et 27 univers thématiques.
- Recherche directe, modes essentiel et avancé, filtres par moteur.
- Favoris, dossiers, modèles, export/import, interface responsive et PWA expérimentale.

### Phase 1, lot 1 (prépublication)

- Compilateur local de requêtes Web isolé et couvert par tests.
- Compatibilité des opérateurs plus transparente, prise en charge des dates invalides et des domaines ciblés.
- Application HTML autonome conservée et compatible GitHub Pages gratuit.

### Phase 1, lot 2 (prépublication)

- Mode privé temporaire avec arrêt de la persistance des nouvelles recherches et nettoyage de la recherche active déjà stockée.
- Bouton d'effacement confirmé des préférences, favoris et modèles locaux.
- Validation des imports JSON (taille, forme, collections, doublons), confirmation du remplacement et tentative de restauration en cas d’échec du stockage.
- Blocage des paramètres et identifiants dans les URL HTTPS des assistants personnalisés.
- Module `privacy-core.js`, 7 tests de sécurité/confidentialité supplémentaires et scénarios navigateur de validation.
- Mise à jour du cache PWA et documentation de la confidentialité.

### Phase 1, lot 3 : accessibilité et ergonomie (novembre 2026)

- Parcours clavier des onglets conforme au motif WAI-ARIA.
- Maintien du focus lors des mises à jour des catégories, objectifs et filtres rapides.
- Gestion explicite de l’ouverture et fermeture des modèles et des messages d’état.
- Tests navigateurs dédiés aux interactions clavier et au reflow.

## V6 · Lot 4A : univers du quotidien (en cours de validation)

- Six univers ajoutés : Administration, Famille / Parentalité, Animaux, Logement, Droit / Justice, Finances personnelles.
- Santé enrichie vers Santé & Médecine, avec critères sur la fiabilité des preuves et les alertes.
- Filtre de navigation par huit familles, compatible recherche et sélection clavier.
- Instructions IA adaptées aux thèmes sensibles ; ces critères ne filtrent pas directement les résultats web.
- Conservation des identifiants des 27 univers d'origine et des recherches enregistrées.
