# 🌐 Backend Supabase — GO GAME

Backend cloud préparé pour la future V3 connectée de **GÉDÉON - Godson ARENA**.

## Projet

- **Nom Supabase** : GO GAME
- **Référence** : `mcyousugmxgugfremmsq`
- **Région** : `eu-central-1` (Francfort)
- **URL API** : https://mcyousugmxgugfremmsq.supabase.co
- **Dashboard** : https://supabase.com/dashboard/project/mcyousugmxgugfremmsq
- **Migration initiale** : `20261024040044_go_game_initial_backend`
- **Configuration publique versionnée** : `supabase/public-config.json`

## Objets créés

| Objet | Rôle | Sécurité |
|---|---|---|
| `player_profiles` | pseudo, pays, combattant principal | lecture publique ; écriture uniquement par le propriétaire |
| `cloud_saves` | sauvegarde cloud du profil local | privée par utilisateur authentifié |
| `shared_replays` | replays déterministes partageables | privés par défaut ; lecture publique si `is_public = true` |
| `match_results` | résultats de matchs en ligne | lecture des matchs vérifiés ou de ses propres matchs ; pas d’écriture client libre |
| `leaderboard` | classement mondial calculé | uniquement depuis `match_results.verified = true` |

Le RLS est activé sur toutes les tables. Les résultats classés devront passer par une validation serveur (replay/hash et/ou Edge Function) avant d’être marqués `verified`.

## Test rapide public

Depuis la racine du dépôt :

```bash
node tools/supabase-smoke.mjs
```

Le test lit `supabase/public-config.json`, appelle les vues/tables publiques en lecture et doit répondre HTTP 200.

## Règles de sécurité non négociables

- La clé **publishable** peut vivre côté client car les accès sont gouvernés par RLS.
- Ne jamais committer de clé `sb_secret_...`, `service_role`, mot de passe de base de données ou token GitHub.
- Le mot de passe de la base doit être redéfini par le Product Owner dans **Supabase → Settings → Database → Reset database password**.
- L’auth anonyme/pseudo rapide reste désactivée tant que le client V3 et ses garde-fous ne sont pas branchés.
- Le classement ne doit jamais accepter un score déclaré librement par le navigateur : replay déterministe + hash + validation serveur.

## Prochaines intégrations client

1. Brancher l’authentification et la création de profil joueur.
2. Synchroniser le profil local vers `cloud_saves`.
3. Afficher `leaderboard` dans un panneau Online.
4. Partager les replays vérifiés via `shared_replays`.
5. Ajouter matchmaking/signalisation Realtime, puis duels en ligne par échange d’inputs déterministes.
