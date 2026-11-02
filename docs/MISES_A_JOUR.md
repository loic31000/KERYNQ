# Chargement et mises à jour

## Publier une version

Le numéro de version doit être identique à ces endroits : `VERSION`, `CACHE` et les adresses `?v=` de `service-worker.js`, le `meta kerynq-build` et les adresses `?v=` de `index.html`. `tests/check-static.mjs` refuse tout décalage.

## Cycle d'une mise à jour

1. **Installation :** le navigateur détecte un nouveau `service-worker.js`. Tous les fichiers sont téléchargés sans passer par le cache HTTP, puis vérifiés. Si l'un échoue, ou si la page n'a pas le bon numéro, l'installation est abandonnée et l'ancienne version continue.
2. **Attente :** le nouveau worker attend. Les onglets continuent sur leur instantané complet, en ligne comme hors ligne.
3. **Proposition :** chaque onglet affiche « Nouvelle version disponible ». Rien ne se recharge tout seul.
4. **Activation :** le clic sur « Mettre à jour » active la version et recharge cet onglet, une seule fois.
5. **Autres onglets :** ils gardent leur session et affichent « Rechargez quand vous êtes prêt ».
6. **Nettoyage :** seuls les anciens caches `kerynq-static-*` sont retirés. Favoris, modèles et préférences restent dans le stockage local, jamais touché.

Si tous les onglets sont fermés, le navigateur active la version en attente à la visite suivante.

## Pourquoi plus de mélange

- Le worker sert uniquement l'instantané de sa version, sans passer par le réseau pour ces fichiers.
- Sans worker, les adresses `?v=` évitent qu'un ancien fichier du cache HTTP accompagne une nouvelle page.
- Le numéro de version est contrôlé à l'installation.

**Mode privé :** le bandeau prévient que la recherche en cours sera effacée. Elle n'est jamais enregistrée, par conception.

**Limite :** un visiteur sans worker dont le chargement chevauche exactement un déploiement peut encore recevoir deux versions, car le serveur sert le dernier fichier pour toute adresse `?v=`.

## Pendant le chargement

`theme-boot.js` applique le thème et le mode Web ou IA avant le rendu. Le HTML démarre avec `is-booting` : commandes désactivées, libellé « Chargement… ». `app.js` active tout à la fin de son initialisation.

Si un fichier ou l'initialisation échoue, `theme-boot.js` passe en `boot-failed` : message visible, commandes désactivées, libellé « Indisponible ». Sans JavaScript, le message vient de `noscript`.
