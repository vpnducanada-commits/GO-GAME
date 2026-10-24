# 🚀 V3 Connectée — Fondations GO GAME

Track ouverte après validation du Product Owner pour préparer l’expérience en ligne de **GÉDÉON - Godson ARENA**, sans casser la V2.8 locale déjà livrée.

## ✅ Étapes réalisées

1. **Dépôt GitHub GO-GAME alimenté** : branche `main` et tags `v2.1.0` → `v2.8.0` poussés.
2. **Projet Supabase GO GAME créé** : région `eu-central-1`, services Auth/DB/Realtime/REST/Storage sains.
3. **Backend initial versionné et testé** : migration SQL, configuration publique, smoke test REST et documentation de sécurité.

## 🎯 Objectif V3

Ajouter progressivement, sans dégrader le jeu local :

- comptes joueurs et profils publics ;
- sauvegarde cloud optionnelle ;
- classement mondial basé sur matchs vérifiés ;
- partage de replays déterministes ;
- salons/matchmaking puis duels en ligne.

## 🧩 Tickets suivants

| Ticket | Sujet | Owner | Critère d’acceptation |
|---|---|---|---|
| V3-01 | Auth & profil joueur | Manager + Nadia | création/connexion, pseudo unique, profil visible |
| V3-02 | Panneau Online & classement | Kenzo + Manager | lecture `leaderboard`, états vide/erreur/chargement propres |
| V3-03 | Cloud save | Manager | sauvegarde/restauration du profil local sans perte |
| V3-04 | Replays cloud | Manager + Sarah | replay partagé relu et hash vérifié avant publication |
| V3-05 | Matchmaking Realtime | Manager | salon privé par code, présence, déconnexion propre |
| V3-06 | Duel en ligne lockstep | Manager + Sarah | inputs échangés, hash de synchronisation, abandon/désynchro gérés |
| V3-07 | Anti-triche & validation | Sarah | résultat classé uniquement si replay/hash validés côté serveur |

## Décisions du Manager

- La V2.8 reste la version jouable stable tant que la V3 n’est pas validée.
- Le moteur déterministe et les replays existants sont la base du netcode : on échange les inputs, pas les positions.
- Aucun résultat classé ne sera accepté sur simple déclaration du client.
- Les secrets serveur restent hors dépôt ; seule la configuration publique protégée par RLS est versionnée.
