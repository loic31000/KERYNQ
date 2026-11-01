# KERYNQ

> **Explorez. Affinez. Découvrez.**

**KERYNQ** est un atelier de recherche web personnalisée, gratuit, sans inscription ni serveur applicatif. Il construit des requêtes adaptées au moteur choisi et des consignes pour différents assistants IA. Il **ne collecte pas de résultats lui-même** et **ne transmet pas de consignes automatiquement aux IA**.

**État : publié.** Le dépôt est public et le site est en ligne : https://loic31000.github.io/KERYNQ/

## Démarrer

Ouvrir `index.html` dans un navigateur moderne. Écrivez votre question, précisez éventuellement le domaine et les filtres, puis choisissez **Sur le Web** ou **Avec une IA**. Pour une IA, le bouton principal copie le texte et ouvre l'assistant : collez-le vous-même dans la conversation.

- **Sans installation** : ouverture directe de `index.html`.
- **Hébergement statique** : fichiers utilisables sur GitHub Pages après décision de publication.
- **Fonctionnement hors ligne** : préparation de requêtes et favoris locaux possibles, mais les moteurs et assistants externes nécessitent Internet. La mise en cache PWA est destinée aux environnements HTTPS/localhost.
- **Vérifier le code** : `node tests/check-static.mjs` puis `node --test tests/unit/search-query.test.mjs tests/unit/privacy.test.cjs tests/unit/catalog.test.cjs tests/unit/prompt.test.cjs tests/unit/file-core.test.cjs` (Node.js récent).

## Organisation

`index.html` est la page ; le code et les icônes sont dans `assets/`, les tests dans `tests/`, les documents dans `docs/`. Détail : [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Fonctionnalités

- Recherche directe, `Ctrl + K`, affichage simple ou toutes les options, bulles d'aide.
- 39 univers et leurs filtres contextuels, modèles et recherches favorites par dossier.
- 28 moteurs généraux, d'images et spécialisés (dont OSINT, journalisme, science, code, culture), avec suggestion par domaine et détail des filtres transmis. Voir [docs/MOTEURS.md](docs/MOTEURS.md).
- Consignes IA adaptées : méthode propre au domaine, format court ou détaillé, note selon l'assistant.
- Exemple au premier lancement et section d'aide.
- Recherche par fichier : images, PDF et documents lus sur votre appareil, OCR sur demande. Voir [docs/IMPORT_FICHIERS.md](docs/IMPORT_FICHIERS.md).
- Export et import validé de profils JSON ; export des consignes Markdown.
- **Mode privé temporaire** : pas de sauvegarde des nouvelles recherches, effacement de la recherche courante déjà enregistrée à l’activation et disparition de la session privée à la fermeture/recharge. Les favoris existants ne sont pas supprimés.
- **Effacer mes données locales** : suppression confirmée des préférences, favoris et modèles stockés par KERYNQ (ne supprime pas les fichiers déjà exportés).
- **Assistants IA au choix** : ChatGPT, Claude, Gemini, Kimi, Grok, DeepSeek, Perplexity, Mistral Vibe, Copilot, autre URL HTTPS. Aucun compte ni API de fournisseur n'est connecté à KERYNQ.
- Icônes SVG, douze thèmes (KERYNQ par défaut, Nuit, Clair, Pro, Cyber, Girly, Aurore, Manga, Médecine, Tuning, Animaux, Finance), texte agrandi, adaptations mobiles et animation réduite.

## Documentation

| Document | À quoi il sert |
| --- | --- |
| [CONTRIBUTING.md](docs/CONTRIBUTING.md) | Développement, tests et contributions |
| [CODE_OF_CONDUCT.md](docs/CODE_OF_CONDUCT.md) | Règles de participation |
| [SECURITY.md](docs/SECURITY.md) | Signalement de failles et politique de sécurité |
| [SUPPORT.md](docs/SUPPORT.md) | Aide et limites du support |
| [LICENSE](LICENSE) | Licence MIT du code et de la documentation |
| [BRANDING.md](BRANDING.md) | Nom et logos KERYNQ : droits distincts de la licence du code |
| [ACCESSIBILITY.md](docs/ACCESSIBILITY.md) | Objectifs et vérifications d'accessibilité |
| [CHANGELOG.md](CHANGELOG.md) | Historique des modifications |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Architecture et flux de données |
| [docs/FOURNISSEURS_IA.md](docs/FOURNISSEURS_IA.md) | Accès multi-IA et confidentialité |
| [docs/CONFIDENTIALITE.md](docs/CONFIDENTIALITE.md) | Stockage et partage des données |
| [docs/AUDIT_PREPUBLICATION.md](docs/AUDIT_PREPUBLICATION.md) | Résultats et limites de l'audit |
| [docs/MOTEURS.md](docs/MOTEURS.md) | Moteurs disponibles, vérification et limites |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Priorités et vérifications avant publication |
| [CLAUDE.md](CLAUDE.md) | Instructions de travail pour Claude Code |
| [docs/HANDOFF_CLAUDE_CODE.md](docs/HANDOFF_CLAUDE_CODE.md) | Passation et chantiers restants |

## Vie privée et sécurité

Hors mode privé, la recherche en cours, les préférences, favoris et modèles sont stockés **localement dans le navigateur**. Ils ne sont pas chiffrés par KERYNQ ; évitez d'y conserver des données sensibles sur un appareil partagé. Quand vous ouvrez un moteur ou un assistant, vous quittez KERYNQ : ce site tiers applique ses propres conditions et sa propre politique de confidentialité. L'ouverture d'un assistant **n'envoie jamais la consigne**.

Les filtres ne garantissent pas la qualité des résultats. Une consigne demandant de « vérifier les faits » ne signifie pas qu'une vérification a été réalisée.

## Licence

**Code et documentation sous licence MIT.** Voir [LICENSE](LICENSE). Le nom, les logos et les autres éléments d'identité visuelle sont traités séparément dans [BRANDING.md](BRANDING.md). Les ressources tierces restent soumises à leurs propres droits.



## Interface

La page s'organise autour de la question. Réglages et bibliothèque s'ouvrent à la demande : voir [docs/UX_REFONTE.md](docs/UX_REFONTE.md) et [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md).
