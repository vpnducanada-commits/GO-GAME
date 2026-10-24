# 🚀 V3.0 Connectée — GO GAME Online livré

La V3 de **GÉDÉON - Godson ARENA** transforme les fondations GO GAME en expérience jouable : comptes, profils, cloud, replays partagés, salons privés, duels WebRTC lockstep et classement mondial co-vérifié.

## ✅ Périmètre livré

| Ticket | Sujet | Réalisation |
|---|---|---|
| V3-01 | Auth & profil | Supabase Auth email/mot de passe autoconfirmé, session persistée/rafraîchie, pseudo unique, pays et combattant principal |
| V3-02 | Panneau Online & classement | panneau responsive, classement public issu uniquement des résultats vérifiés |
| V3-03 | Cloud save | slot `main`, export profond du profil local et restauration après confirmation |
| V3-04 | Replays cloud | publication publique/privée, métadonnées publiques allégées, import complet à la demande |
| V3-05 | Salon & signalisation | code privé, RPC `join_online_room`, signaux offre/réponse/ICE protégés par RLS |
| V3-06 | Duel lockstep | DataChannel WebRTC ordonné, masques d’inputs 8 bits, délai adaptatif, checksums |
| V3-07 | Anti-triche | claims des deux joueurs comparés par l’Edge Function `submit-match-result` |
| V3-08 | Combat Pro | Projection, EX uniques, Godson Cancel, backdash défensif, scaling, IA enrichie |
| V3-09 | Performance | temps CPU logique/rendu, FX adaptatifs et qualité automatique renforcée |

## Parcours d’un duel

1. Les deux joueurs créent un compte et publient un profil.
2. L’hôte crée un salon et communique son code.
3. L’invité rejoint via la RPC atomique ; son identité et son combattant sont fusionnés dans la configuration du salon.
4. Les navigateurs échangent offre, réponse et candidats ICE via `online_signals`.
5. Le DataChannel s’ouvre ; un ping estime le délai d’entrée.
6. L’hôte lance le duel. Les deux clients vérifient la version, la seed, les règles et les identités.
7. À chaque frame, chaque client envoie son input futur et ne simule une frame que lorsque les deux inputs correspondants existent.
8. Des hashs d’état sont comparés périodiquement. Toute divergence stoppe le duel avant classement.
9. À la fin, chaque client soumet son claim. Le serveur ne crée le résultat classé que si les deux claims concordent.

## Garanties

- Le mode local ne dépend ni d’un compte ni du réseau.
- Aucun secret serveur, mot de passe de base ou clé `service_role` n’est présent dans le client.
- Les résultats vérifiés ne peuvent pas être insérés directement depuis le navigateur.
- Les réglages imposés par l’hôte sont temporaires et restaurés avant la sauvegarde locale de fin de match.
- La pause et le turbo sont neutralisés pendant un duel afin de protéger le déterminisme.

## Suites possibles

- Matchmaking public et file classée.
- Serveur TURN dédié pour les réseaux restrictifs.
- Revanche synchronisée et spectateurs.
- Rejeu serveur complet du replay avant classement pour les tournois à enjeu.
- Sprint local « Compétition locale » déjà prévu par Nadia.

Voir aussi `docs/BACKEND_SUPABASE_GO_GAME.md` et `docs/SPRINT_V3_GO_GAME_ONLINE.md`.
