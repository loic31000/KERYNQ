# Accessibilité

KERYNQ vise une expérience accessible à un large public, avec les recommandations **WCAG 2.2 AA** comme cible. Il ne revendique **pas** actuellement une conformité certifiée.

## Mesures présentes

- Sémantique des champs, boutons et zones de formulaire.
- Focus clavier visible, taille du texte ajustable.
- Disposition responsive, 320 px et 390 px pris en compte.
- Respect de `prefers-reduced-motion` pour les effets décoratifs.
- Contraste travaillé pour les thèmes clair et sombre.

## Tests à effectuer avant publication

- Navigation clavier complète, ordre de focus et annonce des messages d'état.
- Lecteurs d'écran : NVDA/Firefox sur Windows, VoiceOver/Safari et TalkBack/Android si possible.
- Zoom 200 % et 400 %, orientation mobile, grandes polices.
- Mesure automatique du contraste et tests manuels (pas de conformité déduite d'un seul outil).
- Envoi et sélection d'un assistant IA au clavier et dans un écran étroit.

Signaler les obstacles d'accessibilité via les futures issues du dépôt, sans données personnelles. Référence : https://www.w3.org/TR/WCAG22/
