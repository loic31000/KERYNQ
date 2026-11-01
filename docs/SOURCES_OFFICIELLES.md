# Packs de sources officielles

Les packs sont **facultatifs** : sans pays choisi, rien n'apparaît ; sans clic sur **Ajouter à ma recherche**, la recherche ne change pas. Ils remplissent le champ « Sites à privilégier », que l'utilisateur peut modifier. Le format des favoris, modèles et profils ne change pas ; seul le réglage `sourceCountry` s'ajoute, vide par défaut et effacé en mode privé.

## Limites

- Un `site:` limite la recherche à un domaine si le moteur le respecte. Il ne garantit ni le résultat, ni l'actualité ou l'exactitude d'une page.
- Google et Brave reçoivent plusieurs sites avec `OR`, résultat non garanti. DuckDuckGo ne reçoit aucun site quand plusieurs sont choisis : l'interface demande d'en garder un seul.
- Certains univers n'ont pas de pack, faute de source officielle pertinente.
- Limite de 10 sites : un ajout qui la dépasserait est refusé en entier.

## Vérification du 1er novembre 2026 (France)

Chaque domaine candidat a été appelé en HTTPS, page d'accueil seulement.

- **`page`** : page lue, organisme confirmé par son titre.
- **`gouv`** : domaine en `.gouv.fr`, réservé à l'État, mais lecture automatisée bloquée ou page sans titre exploitable. À contrôler dans un navigateur : `legifrance.gouv.fr`, `sante.gouv.fr`, `economie.gouv.fr`, `education.gouv.fr`, `travail-emploi.gouv.fr`, `enseignementsup-recherche.gouv.fr`, `ants.gouv.fr`, `cyber.gouv.fr`.

**Écartés de ce lot**, car non confirmés et hors `.gouv.fr` : `banque-france.fr`, `abe-infoservice.fr`, `ademe.fr`, `urssaf.fr`, `gallica.bnf.fr`, `courdecassation.fr`, `vie-publique.fr`. Ils pourront revenir après un contrôle manuel.

## Ajouter un pays

Ajouter une entrée dans `COUNTRIES` (`source-packs-core.js`), couvrant explicitement les 39 univers, et le code pays dans `SOURCE_COUNTRIES` (`catalog-core.js`). Les tests refusent un univers manquant. Consigner la vérification ici, avec sa date.
