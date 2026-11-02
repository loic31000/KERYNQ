# Politique de sécurité

## Versions

| Version | État |
| --- | --- |
| `main` | Code public en évolution ; aucun support garanti |
| Releases | Aucune version officiellement prise en charge annoncée |

Aucune garantie de support ni de délai de correction n'est annoncée.

## Signaler une vulnérabilité

**Ne publiez pas de preuve de concept, de secrets ou d'informations personnelles dans une issue publique.** Le dépôt est public. Si l'option **Security > Report a vulnerability** est disponible, utilisez-la. Sinon, demandez un canal privé au propriétaire via [son profil GitHub](https://github.com/loic31000). L'activation de ce canal n'a pas été recontrôlée ici.

Un signalement utile contient : versions/navigateur, impact, étapes reproductibles, capture caviardée et correctif suggéré. Le propriétaire confirmera la réception lorsqu'il pourra examiner le rapport, sans SLA annoncé.

## Risques pertinents

- **Import JSON** : vérifier schéma, tailles, longueurs et affichage sans exécution de HTML.
- **Stockage local** : les favoris et modèles ne sont pas chiffrés et peuvent contenir des recherches privées.
- **Liens externes** : seules des adresses HTTPS sont acceptées pour les fournisseurs personnalisés ; ne pas y joindre la consigne automatiquement.
- **Service worker** : mettre en cache uniquement les ressources de l'application d'origine ; ne pas intercepter les réponses des moteurs ou des IA.
- **Dépendances et visuels** : vérifier la provenance, les licences et les ressources distantes avant publication.

## Suivi après ouverture publique

Le dépôt est déjà public. Réexaminer régulièrement la sécurité, les données, les actifs et l'historique Git. Voir [ROADMAP.md](ROADMAP.md) et [AUDIT_PREPUBLICATION.md](AUDIT_PREPUBLICATION.md).
