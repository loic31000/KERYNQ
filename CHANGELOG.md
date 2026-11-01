## 2026-11-01 · Lot 4B : 39 univers (branche privée)

- Ajout de six univers généralistes et de leurs filtres contextuels, exemples et icônes SVG.
- Regroupement dans les huit familles existantes ; conservation des identifiants de favoris.
- Distinction des transports collectifs avec l’univers automobile existant.
- Tests statiques et de navigation portés à 39 univers.

# Historique des changements

Ce journal suit les changements vérifiables de KERYNQ. Les versions décrivent le développement et ne signifient pas une publication publique.

## Non publié (branche de préparation)

- Projet rangé : code et icônes dans `assets/`, tests dans `tests/unit` et `tests/browser`, documents communautaires dans `docs/`. Comportement inchangé ; cache PWA `kerynq-static-v8`.
- Packs de sources officielles facultatifs pour la France, couvrant explicitement les 39 univers : ajout au clic, retrait ciblé, limite de 10 sites et avertissement DuckDuckGo. Voir `docs/SOURCES_OFFICIELLES.md`.
- Six thèmes interchangeables (Nuit, Clair, Pro, Cyber, Girly, Aurore), effets visuels désactivés si l'animation réduite est demandée, bulles d'aide au survol, au focus et au toucher.
- Nouvelle interface : KERYNQ explique ce qu'il fait dès l'accueil, parcours en trois étapes, vocabulaire simplifié, favoris et données regroupés à part.
- Bouton principal unique : il annonce sa cible et, pour une IA, copie le texte puis ouvre l'assistant ; le texte n'est jamais placé dans l'adresse.
- Icônes d'interface uniquement en SVG ; le visuel du globe en base64 n'est plus utilisé.
- `index.html` découpé en `styles.css`, `catalog-core.js` et `app.js` ; cache PWA `kerynq-static-v6`.
- Tests : `tests/catalog.test.cjs` vérifie la vraie normalisation des anciens profils et favoris.
- Favoris et modèles stockés : une entrée illisible est ignorée avec un message, au lieu de masquer puis d'écraser toute la liste.
- `Ctrl+Entrée` lance une seule recherche : plus de deuxième onglet ni de copie de la consigne en parallèle.
- Charger un favori ou un modèle ne change plus le thème, la taille du texte, l'IA choisie ni le mode.
- Les sites ignorés (format non reconnu, plus de 10 sites) sont signalés dans la compatibilité de la requête.
- Focus clavier conservé après les actions sur les favoris, modèles et critères ; champ de renommage étiqueté.
- Un fournisseur IA importé ne peut plus désigner une propriété héritée (`constructor`).
- Tests : `tests/regressions-browser-smoke.py` ajouté ; test `univers` exécutable hors Linux et sans `--no-sandbox`.
- Retrait de l'archive héritée `osint-search-v5-github-pages.zip` du suivi Git ; elle reste dans l'historique.
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
