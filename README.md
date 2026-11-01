# KERYNQ

**Explorez. Affinez. Découvrez.**

KERYNQ est une application web de recherche personnalisée, gratuite, sans compte et sans backend. Elle reprend la V5 d'OSINT SEARCH avec son moteur de préparation de requêtes, ses **27 univers**, ses filtres, favoris et modèles.

> **Projet en développement privé.** Aucun hébergement public activé, et aucune licence open source accordée à ce stade.

## Lancer

Ouvrir `index.html` dans un navigateur moderne. La recherche s'ouvre dans Google, Brave ou DuckDuckGo, dans un nouvel onglet. L'application n'indexe pas elle-même les résultats Web.

Sur un serveur HTTPS ou localhost, le manifeste et le service worker permettent de mettre en cache l'interface. L'installation PWA doit encore être vérifiée sur les navigateurs ciblés.

## Fonctionnalités

- Recherche directe et raccourci `Ctrl + K`.
- Modes essentiel/avancé, 27 univers, filtres et opérateurs par moteur.
- Séparation explicite des critères Web et des critères réservés aux consignes IA.
- Favoris enregistrés par dossiers, modèles de recherche personnels.
- Import/export de profil JSON et de consignes Markdown.
- SVG, mode clair/sombre, navigation clavier et animations réduites.

## Structure

- `index.html` : interface statique autonome.
- `favicon.svg`, `app-icon.svg` : icônes KERYNQ.
- `manifest.webmanifest`, `service-worker.js` : métadonnées et cache.
- `docs/ROADMAP.md` : étapes avant publication.
- `docs/CONFIDENTIALITE.md` : description du traitement local des données.
- `tests/check-static.mjs` : vérifications sans dépendances (`node tests/check-static.mjs`).

## Confidentialité et limites

Favoris et paramètres sont enregistrés localement dans le navigateur et ne sont pas synchronisés. Ils peuvent contenir des recherches sensibles : exportez-les avec précaution. Cliquer sur Google, Brave ou DuckDuckGo envoie la requête au moteur choisi, selon sa politique de confidentialité. L'application ne réalise pas de vérification factuelle autonome et n'envoie pas automatiquement de consignes à ChatGPT.

## Publication future

Lorsque KERYNQ sera validé, une publication GitHub Pages pourra être préparée. **Ne pas activer Pages ni passer le dépôt en public avant une décision explicite.**
