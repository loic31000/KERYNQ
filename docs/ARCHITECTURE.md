# Architecture de KERYNQ

## Objectif

Application **statique côté navigateur**. Pas de serveur, de base distante ou de fournisseur IA imposé.

## Organisation du projet

```text
index.html              Page de l'application
manifest.webmanifest    Installation (PWA)
service-worker.js       Cache hors ligne ; doit rester à la racine pour couvrir tout le site
assets/
  css/styles.css        Thèmes et mise en page
  icons/                Icônes SVG du site
  js/app.js             Comportement de l'interface
  js/core/              Logique testable sans navigateur
    search-query-core.js   Liste des moteurs et requêtes
    privacy-core.js        Validation des sauvegardes et des URL
    prompt-core.js         Méthode des consignes IA
    catalog-core.js        39 univers, réglages par défaut, normalize()
tests/
  check-static.mjs      Contrôles de structure, sans dépendance
  unit/                 Tests Node
  browser/              Scénarios Chromium (Playwright)
docs/                   Architecture, confidentialité, roadmap, contribution, sécurité
```

Pour modifier : l'apparence dans `assets/css`, le comportement dans `assets/js/app.js`, les univers dans `catalog-core.js`.

Les scripts restent classiques, sans module ni compilation, pour conserver l'ouverture directe de `index.html`.

## Flux de recherche Web

1. Saisie d'un sujet, moteur, univers, filtres et exclusions.
2. Génération locale d'une requête compatible avec le moteur choisi.
3. Ouverture **déclenchée par l'utilisateur** vers le moteur choisi, jamais vers plusieurs.
4. Les résultats sont affichés par le moteur externe, jamais ingérés par KERYNQ.

## Flux de recherche IA

1. La consigne est générée localement à partir des mêmes réglages, avec une méthode propre au domaine (`prompt-core.js`), un format court ou détaillé et une note selon l'assistant.
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

`node --test tests/unit/search-query.test.mjs` lance les tests unitaires sans dépendances. Le service worker met en cache le compilateur en même temps que l’interface pour conserver la préparation hors ligne. La présence d’un opérateur dans la requête ne garantit pas que le moteur externe le respecte.

**État du 2 novembre 2026 :** le service worker inclut `assets/js/core/privacy-core.js` dans `kerynq-static-v21`. La version fait foi dans `service-worker.js`. Voir [MISES_A_JOUR.md](MISES_A_JOUR.md) pour les règles de cohérence et les limites des mises à jour.

**Détail du moteur choisi :** `capabilities()` interroge `compile()`. Il décrit ce que KERYNQ transmet ; le respect réel par chaque moteur n'est pas vérifié et peut changer.

## Thème au démarrage

`assets/js/theme-boot.js` est chargé dans le `head`, avant la feuille de style. Il lit le thème enregistré, sans écrire, et règle `data-theme`, `theme-color` et `color-scheme` avant le premier rendu. Il reprend les règles de `load()` et `normalize()`. Pour ajouter un thème, mettez aussi à jour sa table : `tests/unit/theme-boot.test.cjs` vérifie la correspondance avec le catalogue et le CSS, et `tests/browser/theme-flash-smoke.py` vérifie le rendu.
