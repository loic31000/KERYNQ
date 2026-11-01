# Politique de sécurité

## Versions

| Version | État |
| --- | --- |
| Branche de développement `feat/kerynq-app-foundation` | En développement, non publiée |
| Versions publiques | Aucune à ce jour |

Aucune garantie de support ni de délai de correction n'est annoncée avant publication.

## Signaler une vulnérabilité

**Ne publiez pas de preuve de concept, de secrets ou d'informations personnelles dans une issue publique.** Le dépôt est actuellement privé ; les personnes ayant accès peuvent demander au propriétaire un canal privé depuis GitHub. Si le projet devient public et que le signalement privé GitHub est activé, utilisez alors l'onglet **Security > Report a vulnerability**. Ce canal ne doit pas être présenté comme déjà actif.

Un signalement utile contient : versions/navigateur, impact, étapes reproductibles, capture caviardée et correctif suggéré. Le propriétaire confirmera la réception lorsqu'il pourra examiner le rapport, sans SLA annoncé.

## Risques pertinents

- **Import JSON** : vérifier schéma, tailles, longueurs et affichage sans exécution de HTML.
- **Stockage local** : les favoris et modèles ne sont pas chiffrés et peuvent contenir des recherches privées.
- **Liens externes** : seules des adresses HTTPS sont acceptées pour les fournisseurs personnalisés ; ne pas y joindre la consigne automatiquement.
- **Service worker** : mettre en cache uniquement les ressources de l'application d'origine ; ne pas intercepter les réponses des moteurs ou des IA.
- **Dépendances et visuels** : vérifier la provenance, les licences et les ressources distantes avant publication.

## Publication

Effectuer une revue de sécurité, de confidentialité et des vulnérabilités avant toute ouverture publique. Voir [docs/ROADMAP.md](docs/ROADMAP.md).
