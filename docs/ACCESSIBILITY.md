# Accessibilité de KERYNQ

KERYNQ vise les **WCAG 2.2 AA**. Le projet ne revendique pas encore une conformité certifiée.

## Mesures ajoutées au lot 3

- Onglets IA/Web : **Tab**, flèches gauche/droite, **Home** / **End**, activation et focus visible.
- Maintien du focus clavier lors des mises à jour de catégories, objectifs et filtres essentiels.
- Gestion des modèles : `aria-expanded`, `aria-controls` et focus sur le champ lors de l'ouverture.
- Messages d'état via une zone `role=status` conservée dans l'arbre d'accessibilité.
- Focus renforcé, marges de défilement et adaptations pour petits écrans.
- Prise en charge de `prefers-reduced-motion` pour les effets décoratifs.

## Vérifications

`node tests/check-static.mjs`, `python tests/browser/a11y-browser-smoke.py` et `python tests/browser/cross-browser-smoke.py` (Python Playwright requis). Résultats et limites : `AUDIT_PREPUBLICATION.md`.

## Restant à valider avant publication

- Tests manuels NVDA avec Firefox/Windows, VoiceOver avec Safari/iOS et TalkBack/Android.
- Audit complet WCAG 2.2 AA : calcul de contrastes, reflow, zoom 200 % et 400 %, focus masqué.
- Vérification des annonces en situation réelle avec lecteur d'écran.

Références : https://www.w3.org/TR/WCAG22/ et https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
