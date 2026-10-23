# 🚀 SPRINT 06 — V2.6 « Replays déterministes »

**Manager** : Assistant Arena  
**Product Owner** : Gideon - Godson  
**Équipe** : Nadia (Design), Kenzo (Rendu/Interface), Sarah (QA/Performance/Release)

## Objectif du sprint

Permettre de **revoir fidèlement son dernier match** : mêmes entrées, même physique, même vainqueur — avec une preuve automatique que la relecture n’a pas divergé.

## Choix technique du Manager

Enregistrement **lockstep** des entrées finales des deux combattants à chaque frame de simulation (humain, joueur 2 ou entrées produites par le bot), compactées en événements de changement (RLE). La physique et les dégâts du jeu ne dépendent d’aucun tirage aléatoire : rejouer les entrées depuis l’état initial reproduit donc le match. Un hash d’état est capturé tous les 300 frames et à la fin pour vérifier la relecture.

## Tableau du sprint

| ID | Livrable | Responsable | Critère d’acceptation | Statut |
|---|---|---|---|---|
| S06-01 | Enregistreur d’entrées + graine visuelle | Manager | Matchs hors entraînement enregistrés en RLE, métadonnées complètes | ✅ |
| S06-02 | Lecteur de replay | Kenzo | Lecture, pause, vitesses 0.5×→4×, redémarrage, progression et sortie | ✅ |
| S06-03 | Isolation profil | Sarah | Aucune stat, aucun succès, aucun score modifié pendant un replay | ✅ |
| S06-04 | Preuve de déterminisme | Sarah | Un vrai match relu de bout en bout donne le même hash final et le même vainqueur | ✅ |
| S06-05 | Persistance du dernier replay | Manager | Replay conservé après rechargement, accès menu + écran de fin | ✅ |
| S06-06 | Release V2.6 | Manager + Sarah | Definition of Done complète, bundle, tag `v2.6.0` | ✅ Livré en `v2.6.0` |

## Limites assumées de cette première version

- Seul le **dernier match terminé** est conservé (pas encore de bibliothèque).
- Pas de scrub arrière instantané : redémarrage + vitesses rapides pour revoir le finish.
- Les particules cosmétiques peuvent varier légèrement ; l’état de jeu vérifié par hash, lui, doit être identique.

---
✍️ Sprint piloté par le Manager officiel du Studio Gideon - Godson ARENA.
