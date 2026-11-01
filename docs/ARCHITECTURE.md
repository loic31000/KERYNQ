# Architecture de KERYNQ

## Objectif

Application **statique côté navigateur**. Pas de serveur, de base distante ou de fournisseur IA imposé.

## Fichiers principaux

- `index.html` : structure de la page.
- `styles.css` : thèmes et mise en page, sans ressource externe.
- `catalog-core.js` : 39 thèmes, valeurs par défaut et `normalize()`, testables sans navigateur.
- `source-packs-core.js` : packs facultatifs de sources officielles.
- `app.js` : logique de l'interface.
- `search-query-core.js` : générateur de requêtes Web sans dépendances, testé séparément (Google, Brave, DuckDuckGo).
- `manifest.webmanifest` : manifeste d'installation.
- `favicon.svg` / `app-icon.svg` : identité SVG.
- `service-worker.js` : cache des seules ressources same-origin.
- `privacy-core.js` : validation locale des sauvegardes et des URL HTTPS d’assistants.
- `tests/check-static.mjs`, `tests/privacy.test.cjs` : contrôles statiques et tests unitaires sans dépendances. `tests/*-browser-smoke.py` : scénarios Chromium via Playwright.

## Flux de recherche Web

1. Saisie d'un sujet, moteur, univers, filtres et exclusions.
2. Génération locale d'une requête compatible avec le moteur choisi.
3. Ouverture **déclenchée par l'utilisateur** vers Google, Brave ou DuckDuckGo.
4. Les résultats sont affichés par le moteur externe, jamais ingérés par KERYNQ.

## Flux de recherche IA

1. La consigne est générée localement à partir des mêmes réglages.
2. L'utilisateur choisit son fournisseur, copie la consigne et ouvre son site HTTPS officiel.
3. Il colle **manuellement** la consigne dans le chat. **Aucune API, aucune clé, aucun paramètre contenant la consigne n'est transmis**.
4. Les règles de confidentialité du fournisseur externe s'appliquent après la navigation.

## Données

- `localStorage` : réglages, thèmes, assistants, favoris et modèles.
- Import/export JSON : transfert manuel sur décision de l'utilisateur.
- Aucun identifiant ou secret requis. Aucune télémétrie intégrée.

## Risques, coûts et limites

- Les scripts restent classiques, sans module ni compilation, pour conserver l'ouverture directe en `file://`.
- Les moteurs peuvent changer leurs opérateurs ou conditions d'accès.
- Les IA peuvent exiger une connexion ou un abonnement : leur ouverture ne garantit pas un accès gratuit.
- Pas de filtrage de résultats côté KERYNQ, pas de comparaison automatique de réponses IA.
- Hors ligne, le cache de l'interface ne fournit pas les services externes.

## Tests du moteur de requêtes

`node --test tests/search-query.test.mjs` lance les tests unitaires sans dépendances. Le service worker met en cache le compilateur en même temps que l’interface pour conserver la préparation hors ligne. La présence d’un opérateur dans la requête ne garantit pas que le moteur externe le respecte.

**Lot 2 :** le service worker inclut `privacy-core.js` dans son cache, aujourd'hui `kerynq-static-v5`. À tester sous HTTPS avant publication.
