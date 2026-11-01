# Contribuer à KERYNQ

Merci de votre intérêt. **Les contributions externes ne sont pas encore ouvertes** tant que le dépôt reste privé. La licence du code a été choisie : MIT. Ce guide prépare l'ouverture future.

## Principes

- L'application reste **statique, gratuite, sans compte ni API externe obligatoire**.
- Conserver le choix de l'IA et du moteur de recherche, sans enfermement fournisseur.
- Ne jamais envoyer automatiquement une consigne à un tiers ou inclure des données personnelles dans une URL d'assistant.
- Séparer filtres Web réellement appliqués et critères réservés aux consignes IA.
- Conserver les 39 univers, l'accessibilité clavier et le fonctionnement mobile.
- Ne pas introduire de secrets, d'identifiants ou de traçage publicitaire.

## Démarrage local

1. Cloner le dépôt avec `git clone` (une fois l'accès accordé).
2. Ouvrir `index.html` dans un navigateur.
3. Lancer `node tests/check-static.mjs` et les autres contrôles listés dans `CLAUDE.md` ; aucun paquet npm n'est nécessaire.
4. Tester manuellement les parcours utilisateur dans Chrome/Brave et Firefox, à 320 px et 200 % de zoom.
5. Pour tester PWA et cache hors ligne, servir le dossier sur `http://localhost` ou HTTPS et recharger la page.

## Proposer un changement

- Discuter le besoin avant de créer une nouvelle fonctionnalité majeure.
- Créer une branche `feat/...`, `fix/...` ou `docs/...` ; une idée par PR.
- Décrire le résultat visible, les risques et les tests exécutés (ne jamais prétendre avoir exécuté des tests non lancés).
- Fournir captures écran PC/mobile pour les modifications visuelles.
- Ajouter ou mettre à jour les tests et docs utiles.
- Ne pas fusionner ou publier le dépôt sans accord du propriétaire.

## Sécurité

**Ne signalez pas publiquement de vulnérabilité exploitable.** Voir [SECURITY.md](SECURITY.md). Tout code tiers incorporé nécessite une revue de licence et provenance.

## Licence des contributions

Le code et sa documentation sont sous [MIT](../LICENSE). Les personnes qui proposeront des changements devront disposer des droits nécessaires sur leur contribution et accepter sa distribution sous cette licence. La contribution n'implique aucun transfert automatique de propriété des droits. Le nom et les logos sont traités séparément dans [BRANDING.md](../BRANDING.md). Les contributions externes restent fermées tant que le dépôt est privé.
