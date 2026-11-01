# KERYNQ

> **Explorez. Affinez. Découvrez.**

**KERYNQ** est un atelier de recherche web personnalisée, gratuit, sans inscription ni serveur applicatif. Il construit des requêtes adaptées au moteur choisi et des consignes pour différents assistants IA. Il **ne collecte pas de résultats lui-même** et **ne transmet pas de consignes automatiquement aux IA**.

**État : développement privé / prépublication.** Le dépôt est volontairement privé. Aucune activation de GitHub Pages ni publication ouverte n'est prévue sans décision du propriétaire.

## Démarrer

Ouvrir `index.html` dans un navigateur moderne. Écrivez votre question, précisez éventuellement le domaine et les filtres, puis choisissez **Sur le Web** ou **Avec une IA**. Pour une IA, le bouton principal copie le texte et ouvre l'assistant : collez-le vous-même dans la conversation.

- **Sans installation** : ouverture directe de `index.html`.
- **Hébergement statique** : fichiers utilisables sur GitHub Pages après décision de publication.
- **Fonctionnement hors ligne** : préparation de requêtes et favoris locaux possibles, mais les moteurs et assistants externes nécessitent Internet. La mise en cache PWA est destinée aux environnements HTTPS/localhost.
- **Vérifier le code** : `node tests/check-static.mjs` puis `node --test tests/unit/search-query.test.mjs tests/unit/privacy.test.cjs tests/unit/catalog.test.cjs` (Node.js récent).

## Organisation

`index.html` est la page ; le code et les icônes sont dans `assets/`, les tests dans `tests/`, les documents dans `docs/`. Détail : [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Fonctionnalités

- Recherche directe, `Ctrl + K`, modes essentiel et avancé.
- 39 univers et leurs filtres contextuels, modèles et recherches favorites par dossier.
- Requêtes dédiées à Google, Brave et DuckDuckGo, avec indication des limites des opérateurs.
- Export et import validé de profils JSON ; export des consignes Markdown.
- **Mode privé temporaire** : pas de sauvegarde des nouvelles recherches, effacement de la recherche courante déjà enregistrée à l’activation et disparition de la session privée à la fermeture/recharge. Les favoris existants ne sont pas supprimés.
- **Effacer mes données locales** : suppression confirmée des préférences, favoris et modèles stockés par KERYNQ (ne supprime pas les fichiers déjà exportés).
- **Assistants IA au choix** : ChatGPT, Claude, Gemini, Kimi, Grok, DeepSeek, Perplexity, Mistral Vibe, Copilot, autre URL HTTPS. Aucun compte ni API de fournisseur n'est connecté à KERYNQ.
- Icônes SVG, clair/sombre, texte agrandi, adaptations mobiles et animation réduite.

## Documentation

| Document | À quoi il sert |
| --- | --- |
| [CONTRIBUTING.md](docs/CONTRIBUTING.md) | Développement, tests et contributions |
| [CODE_OF_CONDUCT.md](docs/CODE_OF_CONDUCT.md) | Règles de participation |
| [SECURITY.md](docs/SECURITY.md) | Signalement de failles et politique de sécurité |
| [SUPPORT.md](docs/SUPPORT.md) | Aide et limites du support |
| [LICENSE.md](LICENSE.md) | Statut juridique actuel et décision de licence à venir |
| [ACCESSIBILITY.md](docs/ACCESSIBILITY.md) | Objectifs et vérifications d'accessibilité |
| [CHANGELOG.md](CHANGELOG.md) | Historique des modifications |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Architecture et flux de données |
| [docs/FOURNISSEURS_IA.md](docs/FOURNISSEURS_IA.md) | Accès multi-IA et confidentialité |
| [docs/CONFIDENTIALITE.md](docs/CONFIDENTIALITE.md) | Stockage et partage des données |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Priorités et vérifications avant publication |
| [CLAUDE.md](CLAUDE.md) | Instructions de travail pour Claude Code |
| [docs/HANDOFF_CLAUDE_CODE.md](docs/HANDOFF_CLAUDE_CODE.md) | Passation et chantiers restants |

## Vie privée et sécurité

Hors mode privé, la recherche en cours, les préférences, favoris et modèles sont stockés **localement dans le navigateur**. Ils ne sont pas chiffrés par KERYNQ ; évitez d'y conserver des données sensibles sur un appareil partagé. Quand vous ouvrez un moteur ou un assistant, vous quittez KERYNQ : ce site tiers applique ses propres conditions et sa propre politique de confidentialité. L'ouverture d'un assistant **n'envoie jamais la consigne**.

Les filtres ne garantissent pas la qualité des résultats. Une consigne demandant de « vérifier les faits » ne signifie pas qu'une vérification a été réalisée.

## Licence

**Aucune licence open source n'est accordée pour le moment.** Le code est sous droits réservés tant que le propriétaire n'a pas choisi et publié de licence. Voir [LICENSE.md](LICENSE.md). L'accès à un dépôt, même public ultérieurement, n'est pas en lui-même une autorisation de réutilisation.

### Nouveaux univers du lot 4A

39 univers dont 12 nouveaux domaines généralistes, organisés par 8 familles. Santé & Médecine comporte des critères supplémentaires sur la qualité des sources ; aucun thème ne remplace un professionnel. Les filtres thématiques concernent la consigne IA, sauf opérateur Web explicitement indiqué dans l'aperçu.

Vérification des nouveaux univers (Chromium + Playwright Python) : `python tests/browser/univers-browser-smoke.py`.

## Nouveaux univers (lot 4B)

Enfance & Scolarité, Travail & Emploi, Retraite & Autonomie, Cuisine & Alimentation, Maison & Jardin et Transports & Déplacements. L’univers « Auto / Mobilité » reste distinct : il concerne les véhicules, tandis que « Transports & Déplacements » traite des trajets multimodaux et des transports collectifs.
