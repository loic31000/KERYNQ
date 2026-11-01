# Contribuer à KERYNQ

Merci de votre intérêt. **Les contributions externes ne sont pas encore ouvertes** tant que le dépôt reste privé et que la licence n'est pas choisie. Ce guide prépare l'ouverture future.

## Principes

- L'application reste **statique, gratuite, sans compte ni API externe obligatoire**.
- Conserver le choix de l'IA et du moteur de recherche, sans enfermement fournisseur.
- Ne jamais envoyer automatiquement une consigne à un tiers ou inclure des données personnelles dans une URL d'assistant.
- Séparer filtres Web réellement appliqués et critères réservés aux consignes IA.
- Conserver les 27 univers, l'accessibilité clavier et le fonctionnement mobile.
- Ne pas introduire de secrets, d'identifiants ou de traçage publicitaire.

## Démarrage local

1. Cloner le dépôt avec `git clone` (une fois l'accès accordé).
2. Ouvrir `index.html` dans un navigateur.
3. Lancer `node tests/check-static.mjs` ; aucun paquet npm n'est nécessaire pour ce contrôle.
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

Il n'existe actuellement **aucun accord de contribution open source ni de transfert implicite de droits**. Un cadre adapté sera décidé avant l'acceptation de contributions extérieures.
