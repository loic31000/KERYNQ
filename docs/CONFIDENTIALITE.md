# Confidentialité et protection des données

KERYNQ est un outil statique. Il ne possède ni serveur utilisateur, ni compte, ni télémétrie intégrée. Les données saisies et les configurations sont conservées **dans le navigateur utilisé**, sauf lorsqu'une action explicite ouvre un site externe ou exporte un fichier.

## Données locales

- Recherches en cours, favoris, dossiers, modèles, sources choisies, thèmes et fournisseurs IA.
- `localStorage` : **non chiffré par KERYNQ**, accessible à quiconque contrôle le même profil navigateur.
- Supprimer les données de site du navigateur les efface ; les profils sauvegardés peuvent être restaurés manuellement.

## Mode privé (nouveau, expérimental)

- Le bouton **Mode privé** suspend l'enregistrement automatique des modifications de la recherche en cours. La requête et les critères restent visibles durant la session courante, puis sont oubliés en quittant le mode ou en rechargeant la page.
- Lors de l'activation, KERYNQ nettoie dans les réglages courants déjà conservés le sujet et les champs de précisions/exclusions/sites. **Cela n'efface pas les anciens favoris et modèles, ni les exports déjà téléchargés.**
- L'ajout de nouveaux favoris ou modèles et l'import/export de profils sont désactivés pendant le mode privé ; la copie de la consigne ou le lancement d'une recherche restent possibles sur décision de l'utilisateur.
- **Le mode privé ne rend pas les moteurs externes anonymes.** Les requêtes envoyées à Google, Brave ou DuckDuckGo restent visibles par le fournisseur ; les consignes collées dans une IA sont soumises à ses règles. Le presse-papiers est géré par le système et peut conserver une copie.
- L'état « Mode privé » est volontairement temporaire : il ne se réactive pas automatiquement après rechargement.

## Effacement complet des données locales KERYNQ

Le bouton **Effacer mes données locales** demande confirmation et efface les clés de préférences, favoris et modèles KERYNQ de ce navigateur. Cela n'efface pas les archives téléchargées, l'historique du navigateur, les données d'autres sites ou les éventuelles requêtes traitées par des moteurs externes. L'effacement des données de site du navigateur peut également supprimer d'autres informations conservées par ce navigateur.

## Import JSON

Les sauvegardes sont limitées à 1,2 Mo, vérifiées avant application, et limitées à 80 favoris et 30 modèles. Les chaînes utilisées dans l'interface sont nettoyées ; les champs inconnus ne sont pas exécutés. L'import d'une sauvegarde complète remplace explicitement les collections présentes après confirmation. En cas d'échec d'écriture locale, KERYNQ tente de rétablir les données précédentes. Cette validation ne dispense pas d'un audit de sécurité.

## Échanges avec des sites tiers

- **Google, Brave, DuckDuckGo** : la recherche est transmise lorsque vous cliquez pour lancer le moteur.
- **ChatGPT, Claude, Gemini, Kimi, Grok, DeepSeek, Perplexity, Mistral Vibe, Copilot, autre** : seule leur page est ouverte, sans transmettre la consigne automatiquement. Une URL d’assistant personnalisée est acceptée uniquement en HTTPS, sans identifiants, paramètres de requête ni fragment. Vous décidez si et quand vous collez le texte.
- Les sites externes possèdent leurs propres conditions, cookies et traitements de données. KERYNQ ne peut pas les contrôler.

## Précautions

- Ne pas inclure de données personnelles sensibles dans une recherche destinée à un moteur tiers.
- Vérifier les exports JSON, qui peuvent contenir l'historique des requêtes favorites.
- Éviter de conserver les recherches privées sur un ordinateur partagé.
- Ne pas supposer qu'un filtre ou une demande « sources fiables » représente une vérification factuelle accomplie.
