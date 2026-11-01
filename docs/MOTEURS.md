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
| Bing Actualités | Journalisme et actualité | Titre | Mots |
| Fact Check Explorer | Vérification des faits | Titre | Mots |
| Internet Archive | OSINT et archives | Titre | Mots |
| Shodan | OSINT et services exposés | Titre | Mots |
| data.gouv.fr | Données publiques | Titre | Mots |
| Open Library | Livres | Titre | Mots |
| MyAnimeList | Anime et mangas | Titre | Mots |
| Steam | Jeux vidéo | Titre | Mots |
| MusicBrainz | Musique | Titre | Mots |
| OpenStreetMap | Cartes et lieux | Titre | Mots |
| Google Images | Images | Titre | Mots |
| Bing Images | Images | Titre | Mots |
| Brave Images | Images | Titre | Mots |
| DuckDuckGo Images | Images | Titre | Mots |
| Wikimedia Commons | Images | Titre | Mots |
| Flickr | Images | Titre | Mots |

## Limites

- **Le choix des filtres de Bing, Qwant et Startpage ne repose pas sur une documentation lue** : leurs pages n'ont pas pu être contrôlées automatiquement. Ce sont des opérateurs courants, à confirmer par des essais manuels.
- « Transmis » ne signifie pas respecté par le moteur. Le contrôle réel des résultats reste à faire pour tous les moteurs.
- Un moteur spécialisé ne reçoit que le sujet et les mots. Les autres filtres restent signalés et utilisables dans le texte pour une IA.
- La suggestion par domaine est un choix éditorial : elle ne change jamais le moteur sans clic, et ne présume pas de la qualité des résultats.
- Shodan peut demander un compte et limiter les résultats gratuits. Il recense des services exposés sur Internet : à utiliser dans un cadre légal. Aucun moteur de recherche de personnes n'est proposé, par choix.
- MusicBrainz cherche par artiste.
- Wikipédia est ouverte en français. Reddit et YouTube sont des plateformes communautaires : leurs contenus ne sont pas vérifiés.

## Écartés pour l'instant

Ecosia (pare-feu lors du contrôle), Mojeek (captcha), SearXNG (pas d'instance officielle unique), et, bloqués ou soumis à une vérification anti-robot lors du contrôle : Google Actualités, Légifrance, HAL, Pappers, OpenCorporates, IMDb et Stack Overflow. Ils pourront revenir après un contrôle manuel.

Les moteurs d'images cherchent à partir de mots. Openverse, Unsplash et Pixabay ont bloqué le contrôle automatique. Yandex Images répond, mais n'est pas retenu par choix. La recherche inversée (Google Lens, TinEye) demande d'importer une image : elle n'est pas proposée ici.
