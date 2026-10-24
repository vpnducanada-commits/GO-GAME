# 🚀 TRACK V3 — « GO GAME Online & Combat Pro »

**Release** : `v3.0.0` — 24 octobre 2026
**Manager & Développeur principal** : Assistant Arena
**Équipe** : Nadia (Design & équilibrage), Kenzo (Rendu & performance), Sarah (QA, sécurité & release)
**Product Owner** : Gideon - Godson

## Objectif

Livrer la première expérience connectée complète de GO GAME sans sacrifier le jeu local : comptes, profils, cloud, replays partagés, salons privés, duel en ligne déterministe et classement mondial impossible à alimenter par une simple déclaration du navigateur. Le même sprint approfondit le combat local et protège le budget 60 FPS.

## Board de livraison

| ID | Livrable | Responsable | Critère d’acceptation | Statut |
|---|---|---|---|---|
| V3-01 | Auth & profil joueur | Manager + Nadia | email/mot de passe Supabase, pseudo unique, pays, main fighter, session rafraîchie | ✅ |
| V3-02 | Panneau Online & classement | Kenzo + Manager | classement public, états vides/erreurs propres, responsive | ✅ |
| V3-03 | Sauvegarde cloud | Manager | upload/download du profil complet avec confirmation avant remplacement local | ✅ |
| V3-04 | Replays cloud | Manager + Sarah | publication publique/privée, liste publique allégée, import dans Replay Studio | ✅ |
| V3-05 | Salon privé & signalisation | Manager | code de salon, RPC atomique `join_online_room`, offre/réponse/ICE WebRTC | ✅ |
| V3-06 | Duel lockstep | Manager + Sarah | inputs 8 bits, délai adaptatif, stall sans simulation, checksum et déconnexion | ✅ |
| V3-07 | Anti-triche classé | Sarah | claim des deux joueurs et création serveur du seul résultat vérifié | ✅ |
| V3-08 | Combat Pro | Nadia | Projection, 6 EX, Godson Cancel, backdash, scaling et IA enrichie | ✅ |
| V3-09 | Performance & présentation | Kenzo | métriques CPU, FX adaptatifs, poses/VFX EX et projection | ✅ |
| V3-10 | Release | Sarah + Manager | suite verte, QA, bundle, documentation, commit et tag | ✅ à la publication `v3.0.0` |

## Décisions techniques verrouillées

1. **Aucun SDK externe dans le bundle** : le client utilise les API REST/Auth publiques de Supabase avec `fetch`, afin de conserver un fichier autonome, auditable et léger.
2. **WebRTC pour le temps réel** : Supabase ne transporte que le salon et les signaux SDP/ICE ; les inputs 60 Hz passent par un DataChannel ordonné.
3. **Lockstep, jamais les positions** : même version, même seed, mêmes combattants, mêmes règles et mêmes inputs produisent le même match.
4. **Classement co-signé** : l’Edge Function compare les deux claims et le hash final avant d’insérer le résultat vérifié avec le rôle serveur.
5. **Local d’abord** : aucun écran local n’attend le réseau ; Online est un panneau opt-in.
6. **Aucun secret client** : seule la clé publishable protégée par RLS est présente dans le navigateur.

## Limites assumées de la V3.0

- Salons **privés par code** uniquement ; le matchmaking public automatique reste un chantier ultérieur.
- WebRTC utilise des serveurs STUN publics, sans TURN dédié : certains réseaux très restrictifs peuvent empêcher la connexion directe.
- Le duel demande la **même version exacte** du jeu des deux côtés et fonctionne au mieux depuis GitHub Pages/HTTPS ou un navigateur moderne.
- Les replays créés par d’anciennes versions de gameplay peuvent être signalés divergents par le hash si les règles de combat ont changé ; c’est le comportement de sécurité attendu.

## Preuves QA

- 194 assertions source et 218 vérifications affichées dans `tests/smoke-test.js`.
- Tests réels de projection contre garde, EX des 6 combattants, entrée EX à 75 %, Godson Cancel et IA.
- Test lockstep invité/hôte, frame bloquée sans input distant, checksum divergent différé, pause interdite et restauration des réglages.
- Client Supabase/WebRTC exercé contre une API simulée déterministe, lectures publiques réelles vérifiées par `tools/supabase-smoke.mjs`, puis **test réel avec deux comptes QA jetables** : profils, cloud, replay privé, salon/RPC/signaux, premier claim `waiting_counterparty`, second claim `verified` et classement contrôlé. Toutes les données et les quatre comptes QA (dont la première tentative ayant révélé le `BOOT_ERROR`) ont été supprimés après preuve.
- Un test manuel final avec deux comptes et deux navigateurs/appareils reste recommandé avant un tournoi public, car JSDOM ne remplace ni les NAT ni les réseaux mobiles réels.
- Déploiement public vérifié en HTTPS : https://vpnducanada-commits.github.io/GO-GAME/ (branche `gh-pages` synchronisée avec la release).

---
✍️ Track pilotée par le Manager officiel du Studio Gideon - Godson ARENA.
