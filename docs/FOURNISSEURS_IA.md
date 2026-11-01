# Assistants IA : accès et confidentialité

KERYNQ est **agnostique** : le fournisseur choisi sert uniquement de destination d'ouverture dans un nouvel onglet. Aucun fournisseur n'est intégré par API et aucun texte de consigne n'est envoyé par URL.

| Assistant | Adresse de navigation |
| --- | --- |
| ChatGPT | https://chatgpt.com/ |
| Claude | https://claude.ai/new |
| Gemini | https://gemini.google.com/app |
| Kimi | https://kimi.com/ |
| Grok | https://grok.com/ |
| DeepSeek | https://chat.deepseek.com/ |
| Perplexity | https://www.perplexity.ai/ |
| Mistral Vibe (anciennement Le Chat) | https://chat.mistral.ai/ |
| Microsoft Copilot | https://copilot.com/ |
| Autre | URL HTTPS configurée par l'utilisateur |

**Utilisation :** copier la consigne, sélectionner l'assistant, cliquer « Ouvrir l'IA » et coller le texte manuellement. Cette procédure est volontaire : elle évite de mettre des recherches sensibles dans les paramètres d'URL et n'exige aucune clé API.

Le choix est enregistré localement. Les adresses personnalisées doivent être en HTTPS, sans nom d'utilisateur ou mot de passe intégré dans l'URL. Les sites tiers peuvent rediriger, demander de s'authentifier et modifier leur disponibilité.

## À investiguer plus tard

- Option d'ouverture du client desktop Claude via `claude://` **uniquement après validation**, jamais par défaut.
- Ajouter plusieurs assistants personnalisés enregistrables (au lieu d'une seule URL).
- Comparateur manuel de consignes et réponses (sans collecte automatique), avec avertissements de vie privée.
- Vérification périodique des URL officielles par le mainteneur.

Sources utiles :
- Claude : https://support.claude.com/fr/articles/8114491-commencer-avec-claude
- Kimi : https://www.kimi.ai/fr/help/getting-started/overview
- Grok : https://docs.x.ai/grok/overview
- Mistral Vibe : https://help.mistral.ai/fr/articles/682992-le-chat-devient-vibe
- Copilot : https://support.microsoft.com/fr-fr/microsoft-365-copilot/what-is-microsoft-copilot-app
