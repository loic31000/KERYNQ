# Moteurs de recherche

KERYNQ ouvre un moteur uniquement après un clic, sans API ni récupération des résultats. Une recherche n'est transmise qu'au moteur choisi. La liste vit dans `ENGINES` (`assets/js/core/search-query-core.js`) ; le tableau de l'interface en est généré.

## Moteurs et preuves (1er novembre 2026)

Adresse appelée avec un mot de test. « Titre » : le titre de la page correspond au moteur. « Sans titre » : réponse 200 sans titre lisible automatiquement.

| Moteur | Domaine | Adresse | Filtres transmis |
| --- | --- | --- | --- |
| Google | Général | Déjà intégré | Mots, exclusions, sites, type de fichier, période |
| Brave | Général | Déjà intégré | Mots, exclusions, sites, type de fichier, langue, pays |
| DuckDuckGo | Général | Déjà intégré | Mots, exclusions, un seul site, type de fichier |
| Bing | Général | Titre | Mots, exclusions, sites, type de fichier |
| Qwant | Général | Titre | Mots, exclusions, un seul site |
| Startpage | Général | Sans titre | Mots, exclusions, un seul site |
| Google Scholar | Articles scientifiques | Titre | Mots, exclusions |
| PubMed | Santé et médecine | Titre | Mots |
| arXiv | Prépublications | Titre | Mots |
| YouTube | Vidéo | Sans titre | Mots |
| Wikipédia (fr) | Encyclopédie | Titre | Mots |
| GitHub | Code | Titre | Mots |
| Reddit | Communautés | Titre | Mots |

## Limites

- **Le choix des filtres de Bing, Qwant et Startpage ne repose pas sur une documentation lue** : leurs pages n'ont pas pu être contrôlées automatiquement. Ce sont des opérateurs courants, à confirmer par des essais manuels.
- « Transmis » ne signifie pas respecté par le moteur. Le contrôle réel des résultats reste à faire pour tous les moteurs.
- Un moteur spécialisé ne reçoit que le sujet et les mots. Les autres filtres restent signalés et utilisables dans le texte pour une IA.
- La suggestion par domaine est un choix éditorial : elle ne change jamais le moteur sans clic, et ne présume pas de la qualité des résultats.
- Wikipédia est ouverte en français. Reddit et YouTube sont des plateformes communautaires : leurs contenus ne sont pas vérifiés.

## Écartés pour l'instant

Ecosia (pare-feu lors du contrôle), Mojeek (captcha) et SearXNG (pas d'instance officielle unique). Ils pourront revenir après un contrôle manuel.
