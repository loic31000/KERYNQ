# Confidentialité et protection des données

KERYNQ est un outil statique. Il ne possède ni serveur utilisateur, ni compte, ni télémétrie intégrée. Les données saisies et les configurations sont conservées **dans le navigateur utilisé**, sauf lorsqu'une action explicite ouvre un site externe ou exporte un fichier.

## Données locales

- Recherches en cours, favoris, dossiers, modèles, sources choisies, thèmes et fournisseurs IA.
- `localStorage` : **non chiffré par KERYNQ**, accessible à quiconque contrôle le même profil navigateur.
- Supprimer les données de site du navigateur les efface ; les profils sauvegardés peuvent être restaurés manuellement.

## Échanges avec des sites tiers

- **Google, Brave, DuckDuckGo** : la recherche est transmise lorsque vous cliquez pour lancer le moteur.
- **ChatGPT, Claude, Gemini, Kimi, Grok, DeepSeek, Perplexity, Mistral Vibe, Copilot, autre** : seule leur page est ouverte, sans transmettre la consigne automatiquement. Vous décidez si et quand vous collez le texte.
- Les sites externes possèdent leurs propres conditions, cookies et traitements de données. KERYNQ ne peut pas les contrôler.

## Précautions

- Ne pas inclure de données personnelles sensibles dans une recherche destinée à un moteur tiers.
- Vérifier les exports JSON, qui peuvent contenir l'historique des requêtes favorites.
- Éviter de conserver les recherches privées sur un ordinateur partagé.
- Ne pas supposer qu'un filtre ou une demande « sources fiables » représente une vérification factuelle accomplie.
