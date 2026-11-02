# Instructions pour Claude Code : KERYNQ

Lire ce fichier en premier, puis [docs/HANDOFF_CLAUDE_CODE.md](docs/HANDOFF_CLAUDE_CODE.md), [README.md](README.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) et [docs/ROADMAP.md](docs/ROADMAP.md).

## Objectif et périmètre

KERYNQ est une application de recherche **100 % statique, gratuite et utilisable sur GitHub Pages**. Elle prépare des requêtes pour 28 moteurs Web (voir `docs/MOTEURS.md`) et des consignes à copier manuellement dans plusieurs assistants IA. **Elle n'indexe pas les résultats**. Il y a 39 univers et 8 familles, des favoris locaux, des modèles, un mode privé et une importation/exportation JSON.

Conserver le coût d'hébergement à 0 euro et le fonctionnement sans serveur, API IA obligatoire, compte, tracking, clé secrète ou service tiers payant.

## Règles à respecter

1. Le dépôt doit rester **privé**. Ne pas activer GitHub Pages, ne pas publier de release et ne pas modifier sa visibilité sans instruction explicite du propriétaire.
2. La licence du **code et de la documentation** est **MIT** (`LICENSE`). Le nom et les logos sont exclus de cette licence (`BRANDING.md`). Ne pas modifier le choix juridique ni redistribuer des ressources graphiques historiques sans accord.
3. Travailler sur des branches `feat/...` ou `fix/...`, tester, commiter et ouvrir une PR pour validation ; ne pas fusionner une future PR sans demande explicite.
4. Éviter GitHub Actions. Les contrôles sont utilisables localement et doivent être documentés honnêtement.
5. Utiliser `git` et éventuellement `gh` en CLI ; ne pas supposer GitHub Desktop. Préserver `main` et les sauvegardes locales existantes.
6. Ne jamais envoyer automatiquement une consigne IA aux fournisseurs ; seuls les liens officiels HTTPS s'ouvrent après action volontaire. Ne pas intégrer d'API payante.
7. Ne pas confondre les filtres thématiques qui enrichissent la consigne IA avec des opérateurs réellement interprétés par les moteurs Web. Mentionner les limites du fournisseur.
8. Ne pas prétendre à une conformité WCAG ou à une sécurité certifiée tant que les audits manuels ne sont pas réalisés.

## Contrôles à exécuter

```bash
node tests/check-static.mjs
node --test tests/unit/search-query.test.mjs tests/unit/privacy.test.cjs tests/unit/catalog.test.cjs tests/unit/prompt.test.cjs tests/unit/theme-boot.test.cjs
python tests/browser/univers-browser-smoke.py
python tests/browser/a11y-browser-smoke.py
python tests/browser/regressions-browser-smoke.py
python tests/browser/cross-browser-smoke.py
python tests/browser/theme-flash-smoke.py
```

Les scripts Python requièrent Playwright et Chromium, de préférence dans un environnement virtuel hors du dépôt. `KERYNQ_CHROMIUM` permet d'indiquer un autre exécutable Chromium. Tester aussi manuellement les navigateurs concernés avant publication. Pour servir le site en local : `python -m http.server 8000`.

## Suite

Les packs de sources officielles ont été retirés à la demande du propriétaire (voir `CHANGELOG.md`) : ne pas les réintroduire sans sa demande. Consulter `docs/ROADMAP.md`.

Détail des étapes, risques et priorités : [docs/HANDOFF_CLAUDE_CODE.md](docs/HANDOFF_CLAUDE_CODE.md).
