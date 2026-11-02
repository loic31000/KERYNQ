<div align="center">
  <img src="assets/icons/favicon.svg" width="76" alt="Logo KERYNQ">

  # KERYNQ

  **Explorez. Affinez. Découvrez.**

  *Un atelier de recherche Web et IA pour passer d'une question à une recherche mieux ciblée.*

  ![HTML5](https://img.shields.io/badge/HTML5-Statique-E34F26?logo=html5&logoColor=white)
  ![CSS3](https://img.shields.io/badge/CSS3-Th%C3%A8mes-1572B6?logo=css3&logoColor=white)
  ![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)
  ![PWA](https://img.shields.io/badge/PWA-Cache_local-5B4DAB)
  ![GitHub Pages](https://img.shields.io/badge/H%C3%A9bergement-GitHub_Pages-24292F?logo=github&logoColor=white)
  [![MIT](https://img.shields.io/badge/Code-MIT-2EA44F)](LICENSE)

  [**Utiliser KERYNQ**](https://loic31000.github.io/KERYNQ/) · [**Fonctionnalités**](#fonctionnalités) · [**Documentation**](#documentation)
</div>

---

## Pourquoi KERYNQ ?

KERYNQ aide à **formuler des recherches plus précises**, sans imposer de moteur ou d'assistant IA. Choisissez un univers, ajoutez vos critères, puis ouvrez **un moteur Web** ou copiez une **consigne préparée pour une IA**.

**Ce n'est pas un moteur de recherche autonome :** KERYNQ n'indexe aucun résultat, ne vérifie pas automatiquement les sources et n'envoie jamais votre consigne à une IA sans que vous décidiez de la coller vous-même.

## Fonctionnalités

| Explorer | Organiser | Garder le contrôle |
| --- | --- | --- |
| **39 univers**, 8 familles et filtres contextuels | Favoris, dossiers, modèles, profils JSON | Aucun compte KERYNQ, backend ou tracking intégré |
| **28 moteurs** généralistes, d'images et spécialisés | Consignes IA adaptées au sujet | Un seul moteur externe ouvert volontairement |
| **9 assistants IA** et une URL HTTPS personnalisée | **12 thèmes**, mobile et navigation clavier | Mode privé temporaire et effacement des données locales |

Les moteurs disponibles sont documentés dans [MOTEURS.md](docs/MOTEURS.md). Les sites tiers peuvent exiger leur propre compte ou abonnement.

## Démarrer

**En ligne :** [ouvrir KERYNQ sur GitHub Pages](https://loic31000.github.io/KERYNQ/).

**Localement :** cloner le dépôt ou télécharger les fichiers, puis ouvrir `index.html` dans un navigateur moderne. Aucun build ni serveur applicatif n'est nécessaire.

```bash
git clone https://github.com/loic31000/KERYNQ.git
cd KERYNQ
```

La préparation des requêtes et l'accès aux favoris sont possibles hors ligne si les fichiers sont disponibles, mais **les moteurs et assistants externes nécessitent Internet**. Pour tester le service worker et la PWA, utiliser `localhost` ou HTTPS. Voir [les mises à jour](docs/MISES_A_JOUR.md).

## Architecture et stack

- **Interface :** HTML5, CSS3 et JavaScript natif, sans framework ni compilation.
- **Données :** `localStorage` dans le navigateur, import/export JSON manuel.
- **PWA :** manifeste et service worker qui cachent les fichiers de l'interface. Cache technique **v21**, pas une release GitHub.
- **Tests :** Node.js pour les contrôles statiques et unitaires ; Python avec Playwright pour les tests navigateur, pas pour l'application en production.
- **Hébergement :** GitHub Pages, sans serveur applicatif ni API IA obligatoire.

[Architecture détaillée](docs/ARCHITECTURE.md)

## Vérifier le code

```bash
node tests/check-static.mjs
node --test tests/unit/search-query.test.mjs tests/unit/privacy.test.cjs tests/unit/catalog.test.cjs tests/unit/prompt.test.cjs tests/unit/theme-boot.test.cjs
```

Les scénarios `tests/browser/` utilisent Python et Playwright ; voir [CLAUDE.md](CLAUDE.md). Il n'y a pas de badge CI inventé : aucun workflow de tests GitHub Actions n'est présent. Les essais documentés ne constituent ni certification de sécurité ni conformité WCAG.

## Confidentialité, sécurité et licence

Les préférences, favoris et modèles sont stockés localement, **sans chiffrement fourni par KERYNQ**. Le mode privé suspend l'enregistrement des nouvelles recherches mais ne rend pas anonyme l'utilisation de services externes. L'utilisateur décide de copier et de coller toute consigne IA.

Le **dépôt est public** et GitHub Pages est configuré. Code et documentation sous **[licence MIT](LICENSE)** ; nom, logos et identité visuelle soumis à des [droits distincts](BRANDING.md). Les ressources et services tiers conservent leurs propres droits. Les vérifications des actifs historiques, de la sécurité et de l'accessibilité restent à poursuivre : [audit daté](docs/AUDIT_PREPUBLICATION.md) et [roadmap](docs/ROADMAP.md).

## Documentation

| Thème | Documents |
| --- | --- |
| Identité et architecture | [Branding](BRANDING.md) · [Architecture](docs/ARCHITECTURE.md) · [Design system](docs/DESIGN_SYSTEM.md) · [UX](docs/UX_REFONTE.md) |
| Recherche Web et IA | [Univers](docs/UNIVERS.md) · [Moteurs](docs/MOTEURS.md) · [Fournisseurs IA](docs/FOURNISSEURS_IA.md) |
| Qualité et données | [Confidentialité](docs/CONFIDENTIALITE.md) · [Accessibilité](docs/ACCESSIBILITY.md) · [Audit](docs/AUDIT_PREPUBLICATION.md) · [Mises à jour](docs/MISES_A_JOUR.md) |
| Communauté | [Contribuer](docs/CONTRIBUTING.md) · [Code de conduite](docs/CODE_OF_CONDUCT.md) · [Sécurité](docs/SECURITY.md) · [Support](docs/SUPPORT.md) |
| Suivi du projet | [Roadmap](docs/ROADMAP.md) · [Changelog](CHANGELOG.md) · [Instructions Claude Code](CLAUDE.md) · [Passation historique](docs/HANDOFF_CLAUDE_CODE.md) |
