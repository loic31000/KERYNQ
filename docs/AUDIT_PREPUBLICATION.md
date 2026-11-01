# Audit avant publication

Compte rendu pour l'issue #3, du 1er novembre 2026. Ce n'est **ni une certification de sécurité, ni une conformité WCAG**.

Rejouer : `python tests/browser/cross-browser-smoke.py`, après `playwright install chromium firefox webkit`.

## Vérifié automatiquement

| Point | Résultat |
| --- | --- |
| Chromium, Firefox, WebKit en 1440, 390 et 320 px, et ouverture directe de `index.html` | Parcours sans erreur ni débordement |
| CSP (`default-src 'none'`, scripts et styles locaux seulement) | Aucun blocage dans Chromium et Firefox ; WebKit : voir les limites |
| Chargement de la page | Aucune requête hors du serveur local |
| Reflow équivalent à un zoom de 200 % et 400 % sur écran 1280 px | Aucun débordement horizontal |
| Clavier | Focus visible sur 45 tabulations, contrôles nommés, identifiants uniques |
| Contraste des couleurs de base des 6 thèmes | Au moins 4,5:1 (`regressions-browser-smoke.py`) |
| Service worker en local | Cache, purge d'un ancien cache, fonctionnement hors ligne |
| Consigne IA | Absente de l'adresse de l'assistant (`regressions-browser-smoke.py`) |
| Import JSON | Forme, taille, types et identifiants contrôlés, tout ou rien (tests unitaires) |

## Relu dans le code

- Le seul `innerHTML` insère des icônes fixes ; les textes passent par `textContent`.
- Les liens externes utilisent `noopener` et `noreferrer` ; la page ajoute `no-referrer`.
- L'URL d'assistant personnalisée exige HTTPS, sans identifiants ni paramètres.

## Limites connues

- `frame-ancestors` ne fonctionne pas dans une balise `meta`, et GitHub Pages ne permet pas d'envoyer d'en-têtes : la protection contre l'intégration dans un cadre n'est pas assurée.
- WebKit sous Playwright signale un blocage de style sur ses `<select>`, alors que la page n'en définit aucun : signature tolérée dans le test uniquement, à contrôler sur Safari réel.
- WebKit refuse de lire le manifeste en ouverture directe : sans effet sur l'application, l'installation exigeant HTTPS.
- `localStorage` n'est pas chiffré.
- WebKit sous Playwright n'équivaut pas à Safari sur iPhone ou Mac.
- Le contraste n'est pas mesuré sur les dégradés, le grand titre et l'effet verre.

## Reste à faire par une personne

- [ ] NVDA avec Firefox, VoiceOver, TalkBack.
- [ ] Safari réel sur iPhone et Mac, Android réel.
- [ ] Zoom réel du navigateur à 200 % et 400 %.
- [ ] Installation de la PWA sous HTTPS réel, ce qui suppose de publier : décision du propriétaire.
- [ ] Revue de sécurité indépendante, si le projet ouvre au public.
