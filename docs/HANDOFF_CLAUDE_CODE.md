# Passation de KERYNQ à Claude Code

**Date de référence : 1er novembre 2026.**

## Contexte produit

Nom : **KERYNQ** (« Explorez. Affinez. Découvrez. »). Dépôt : https://github.com/loic31000/KERYNQ. L'application reste **privée, en prépublication**, et a vocation à fonctionner gratuitement sur GitHub Pages **uniquement quand le propriétaire choisira de la rendre publique**.

KERYNQ est un atelier de recherche personnalisée, non un moteur d'indexation. Le traitement local construit des requêtes vers 23 moteurs (`MOTEURS.md`), et des consignes destinées à ChatGPT, Claude, Gemini, Kimi, Grok, DeepSeek, Perplexity, Mistral Vibe, Copilot et une URL HTTPS personnalisée. Les assistants ne reçoivent **aucune consigne automatiquement**. La recherche et les pages IA s'ouvrent à l'initiative de l'utilisateur.

## État à jour

Les lignes ci-dessous conservent l'historique de la passation ; pour l'état courant, voir `CHANGELOG.md`, `ROADMAP.md`, `ARCHITECTURE.md`, `MOTEURS.md` et `AUDIT_PREPUBLICATION.md`.

## Ce qui est déjà fait

- Lots 1 à 3 : compilateur de requêtes séparé (`assets/js/core/search-query-core.js`), tests des opérateurs et dates ; contrôles des imports et URL (`assets/js/core/privacy-core.js`), mode privé, effacement des données locales ; améliorations de l'accès clavier et du reflow.
- Lots 4A et 4B : passage de 27 à **39 univers**, répartis en **8 familles**, avec des filtres propres et une compatibilité des identifiants historiques. Les douze nouvelles catégories concernent administration, famille, animaux, logement, droit, finances personnelles, enfance et scolarité, travail et emploi, retraite et autonomie, cuisine et alimentation, maison et jardin, transports et déplacements.
- Multi-IA, favoris et dossiers, modèles, export/import JSON, six thèmes interchangeables, bulles d'aide, interface responsive, manifeste PWA et service worker limitant le cache aux ressources de l'application.
- Documentation existante : README, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, SUPPORT, ACCESSIBILITY, CHANGELOG, LICENSE et `docs/*`.
- Aucune GitHub Action mise en place.

## Architecture

- `index.html` (structure), `assets/css/styles.css`, `assets/js/core/catalog-core.js` (catalogue et normalisation), `assets/js/app.js` (logique UI).
- `assets/js/core/search-query-core.js` : compilation locale de requêtes par moteur.
- `assets/js/core/privacy-core.js` : validation/sanitation des sauvegardes et URL.
- `manifest.webmanifest`, `service-worker.js`, `assets/icons/app-icon.svg`, `assets/icons/favicon.svg` : installation et cache.
- `tests/check-static.mjs`, `tests/unit/`, `tests/browser/` (commandes dans `CLAUDE.md`) : tests sans pipeline CI.
- Favoris, préférences et modèles dans le stockage local du navigateur. Ce stockage n'est **pas chiffré**.

## Vérification de référence (local, pas CI GitHub)

Le 1er novembre 2026, une copie locale du lot 4B a passé :
- `node tests/check-static.mjs`
- `node --test tests/unit/search-query.test.mjs tests/unit/privacy.test.cjs` : **17 tests sur 17**.
- `python tests/browser/univers-browser-smoke.py` : **39 univers, 8 familles**, Chromium 1440, 390 et 320 px.
- `python tests/browser/a11y-browser-smoke.py` : Chromium 1440, 390 et 320 px.

Relancer les tests depuis `main` sur le PC de développement. **Ne pas présenter ces tests comme un audit exhaustif**. Les tests NVDA/VoiceOver/TalkBack, navigateurs Firefox/Safari, zoom fort, PWA installée sous HTTPS et audit XSS/CSP restent à accomplir. Aucun statut CI GitHub concluant n'a été relevé (pas de checks configurés).

## Suite, par lots et sans serveur

### Priorité 0 : vérifier et consolider
1. `git pull origin main`, `git status`, identifier le HEAD.
2. Lancer les tests et vérifier le catalogue, les anciens favoris/imports, la sécurité des URL.
3. Revoir les derniers textes de `docs/ROADMAP.md` et les issues ; corriger les notes historiques obsolètes, sans effacer l'historique utile.
4. Réaliser un audit visuel, clavier, zoom et sécurité avant toute mise en ligne. Ne pas afficher « conforme WCAG » sans contrôle.

### Priorité 1 : packs de sources institutionnelles facultatifs (retirés à la demande du propriétaire, ne pas réintroduire sans sa demande)
1. Prévoir des **packs par pays et par univers** : par exemple France + administration (Service Public), santé (Ameli/HAS), droit (Légifrance), recherche scientifique (sources reconnues), sans en imposer un par défaut.
2. Les domaines officiels doivent être **vérifiés**, proposés et sélectionnables ; l'utilisateur peut retirer ou modifier un domaine.
3. Les packs enrichissent la recherche uniquement sur **action explicite** ; vérifier la capacité réelle du moteur à respecter un ou plusieurs `site:`.
4. Ne pas ajouter d'API ni récupérer de résultats par scraping.
5. Ajouter des tests unitaires du catalogue et des tests d'interface pour la sélection, le changement de pays et la préservation des configurations importées.

### Priorité 2 : fiabilité et expérience
- Consolider les messages de compatibilité des opérateurs Google/Brave/DuckDuckGo, les cas limites et la localisation.
- Vérifier les longues catégories, le zoom jusqu'à 200/400 %, focus visible et lecteurs d'écran.
- Mettre à jour le PWA pour une installation sur HTTPS et une purge contrôlée des caches. Auditer les actifs et droits de redistribution.
- Si la taille du HTML rend les changements risqués, modulariser **sans briser l'ouverture directe du fichier** ou fournir une version autonome de distribution.

### Priorité 3 : recherches et IA avancées, après stabilisation
- Moteurs : 23 intégrés. À confirmer manuellement : ceux listés comme écartés dans `MOTEURS.md`.
- Ajouter des favoris de fournisseurs, modèles de consignes, et une comparaison **manuelle** multi-moteurs ou multi-IA si cela reste utile.
- Préserver un fonctionnement local, sans télémétrie ni transmission masquée de requêtes sensibles.

## Issues GitHub existantes
- [#2](https://github.com/loic31000/KERYNQ/issues/2) : licence et droits de ressources, **décision propriétaire requise**.
- [#3](https://github.com/loic31000/KERYNQ/issues/3) : sécurité, confidentialité et accessibilité.
- [#4](https://github.com/loic31000/KERYNQ/issues/4) : profils et multi-moteurs.
- [#5](https://github.com/loic31000/KERYNQ/issues/5) : multi-IA.
- [#6](https://github.com/loic31000/KERYNQ/issues/6) : fermée.

## Décisions réservées au propriétaire
- Visibilité du dépôt, activation de GitHub Pages et mise en ligne.
- Licence open source définitive et droit de publier les visuels.
- Fusion des futures PR, coûts récurrents, services externes avec API et nouvelles données envoyées à des tiers.

## Conditions de validation d'un nouveau lot
Changements limités, code lisible, tests reproduits et rapport honnête, `git diff --check`, absence de secrets, tests du thème et des moteurs concernés, état du dépôt connu, nouvelle branche/PR et **pas de fusion automatique** sans accord.

Le résultat souhaité est une application réellement utile et compréhensible du grand public, et non un empilement de filtres visuels.
