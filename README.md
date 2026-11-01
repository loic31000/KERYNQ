# KERYNQ

**Explorez. Affinez. Découvrez.**

KERYNQ est une application web statique pour préparer et lancer des recherches ciblées, organiser ses favoris et composer des consignes structurées. Elle conserve **27 univers de recherche** (culture, TCG, jeux vidéo, IA, cybersécurité, politique, OSINT, etc.) et les filtres de la V5 d'OSINT SEARCH.

> **Statut : développement privé.** Ce dépôt n'est pas destiné à être publié ou à activer GitHub Pages avant validation. Aucune licence open source n'a été accordée à ce stade.

## Utilisation

- Ouvrez `index.html` dans un navigateur moderne pour utiliser l'interface localement.
- Sur HTTPS ou `localhost`, le manifeste et le service worker peuvent permettre une utilisation de l'interface hors ligne. Certains navigateurs peuvent exiger des icônes PNG pour proposer l'installation.
- Les recherches se lancent dans **Google, Brave ou DuckDuckGo**, dans un nouvel onglet. KERYNQ n'est **pas** un index ni un moteur de classement de résultats indépendant.
- Les préférences, modèles et favoris sont stockés dans le navigateur local. Sauvegardez-les avec l'export JSON avant de vider les données du navigateur.

## Fonctionnalités

- Recherche directe et raccourci `Ctrl + K`.
- Modes **simple** et **avancé** et 27 univers de filtres.
- Indication des critères réellement appliqués à la recherche Web et de ceux réservés à la consigne IA.
- Modèles de recherche, favoris et dossiers personnalisés.
- Export de consignes Markdown et import/export de profils JSON.
- Interface responsive, SVG, clair/sombre, navigation clavier et prise en charge de `prefers-reduced-motion`.
- Aucun compte, aucune API payante, aucun suivi intégré.

## Structure

| Fichier | Rôle |
|---|---|
| `index.html` | Interface et logique autonome |
| `app-icon.svg`, `favicon.svg` | Identité KERYNQ |
| `manifest.webmanifest` | Métadonnées d'installation |
| `service-worker.js` | Cache des ressources internes |
| `docs/ROADMAP.md` | Travaux et validation avant ouverture |
| `docs/CONFIDENTIALITE.md` | Données stockées et limites |
| `tests/check-static.mjs` | Contrôles statiques avec Node.js |

## Tester

`node tests/check-static.mjs`

Cela vérifie la syntaxe JavaScript intégrée, les fichiers d'application et le manifeste. Les tests visuels et d'accessibilité au clavier doivent également être faits dans des navigateurs réels.

## Confidentialité

Aucun suivi ou backend KERYNQ n'est intégré. Une requête envoyée à un moteur de recherche est soumise à la politique de confidentialité de ce moteur. Voir [docs/CONFIDENTIALITE.md](docs/CONFIDENTIALITE.md).

## Publication future

Lorsque le produit sera validé, la publication sur GitHub Pages pourra être configurée **après** le passage du dépôt en public. Aucune publication ni modification de visibilité n'est faite pour l'instant.
