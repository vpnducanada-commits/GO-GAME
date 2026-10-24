# 🌐 Backend Supabase — GO GAME

Backend de la V3.0 connectée de **GÉDÉON - Godson ARENA** : comptes, profils, sauvegarde cloud, replays, salons WebRTC et classement co-vérifié.

## Projet

- **Nom Supabase** : GO GAME
- **Référence** : `mcyousugmxgugfremmsq`
- **Région** : `eu-central-1` (Francfort)
- **URL API** : https://mcyousugmxgugfremmsq.supabase.co
- **Dashboard** : https://supabase.com/dashboard/project/mcyousugmxgugfremmsq
- **Configuration publique versionnée** : `supabase/public-config.json`
- **Auth** : email/mot de passe activé, autoconfirmation activée, redirections localhost et GitHub Pages autorisées. Les utilisateurs anonymes restent désactivés.

## Migrations appliquées

| Version | Nom | Contenu |
|---|---|---|
| `20261024040044` | `go_game_initial_backend` | profils, cloud saves, replays partagés, résultats et vue classement |
| `20261024042334` | `go_game_online_rooms_claims` | salons privés, signaux WebRTC, RPC de jonction, claims et `match_key` unique |

Les fichiers SQL versionnés sont dans `supabase/migrations/`. Ne pas réappliquer une migration déjà présente dans l’historique Supabase.

## Objets et sécurité

| Objet | Rôle | Sécurité |
|---|---|---|
| `player_profiles` | pseudo unique, pays, combattant principal | lecture publique ; écriture par le propriétaire uniquement |
| `cloud_saves` | profil local complet dans le slot `main` | privée par utilisateur authentifié |
| `shared_replays` | replays déterministes | lecture si public ou propriétaire ; écriture par le propriétaire |
| `online_rooms` | salon privé, hôte/invité, statut et configuration | participants authentifiés ; création par l’hôte, jonction par RPC |
| `online_signals` | offre/réponse SDP et candidats ICE | lecture/écriture réservées aux participants du salon |
| `match_result_claims` | déclaration individuelle de fin de duel | aucune policy client ; Edge Function uniquement |
| `match_results` | résultats classés vérifiés | lecture publique des vérifiés ; pas d’insertion client libre |
| `leaderboard` | victoires/défaites/matchs | calculée uniquement depuis `match_results.verified = true` |
| `join_online_room` | jonction atomique d’un salon ouvert | fonction `security definer`, invité et champs publics assainis |

Le RLS est activé sur toutes les tables publiques du jeu.

## Edge Function de classement

- **Slug** : `submit-match-result`
- **Source** : `supabase/functions/submit-match-result/index.ts`
- **Version active** : 2 — implémentation JavaScript sans import externe, appels Auth/PostgREST par `fetch` pour éviter tout échec de démarrage lié au bundling
- **JWT** : requis
- **Règle** : le premier joueur reçoit `waiting_counterparty` ; le second déclenche `verified` seulement si les deux claims ont le même `match_key`, les mêmes joueurs, le même vainqueur et le même hash de vérification. Les divergences renvoient `mismatch`, et un doublon renvoie `already_verified`.

Le client navigateur n’envoie jamais de clé secrète. La fonction utilise côté serveur les variables d’environnement Supabase réservées aux Edge Functions.

## Client navigateur

Le jeu n’embarque pas le SDK Supabase : `src/ui.js` appelle directement, avec la clé publishable et le JWT de session :

- `/auth/v1/signup`, `/auth/v1/token`, `/auth/v1/user`, `/auth/v1/logout` ;
- `/rest/v1/player_profiles`, `cloud_saves`, `shared_replays`, `leaderboard` ;
- `/rest/v1/online_rooms`, `online_signals`, `rpc/join_online_room` ;
- `/functions/v1/submit-match-result`.

Après signalisation, les inputs du duel ne passent plus par Supabase : ils circulent dans un DataChannel WebRTC ordonné entre les deux navigateurs.

## Test rapide public

Depuis la racine du dépôt :

```bash
node tools/supabase-smoke.mjs
```

Le test lit `supabase/public-config.json` et vérifie en HTTP 200 le classement, les profils publics et les métadonnées des replays publics. Aucune écriture et aucun secret ne sont utilisés.

## Règles non négociables

- La clé **publishable** peut vivre côté client car RLS gouverne les accès.
- Ne jamais committer de clé `sb_secret_...`, `service_role`, mot de passe de base de données ou token GitHub.
- Le mot de passe temporaire de la base doit être redéfini par le Product Owner dans **Supabase → Settings → Database → Reset database password**.
- Le classement ne doit jamais accepter un score déclaré librement par un seul navigateur.
- Pour un tournoi à enjeu, ajouter à terme une relecture serveur du replay et un TURN dédié ; la V3.0 vise les duels privés entre joueurs de confiance raisonnable.
