# 🚀 SPRINT 08 — V2.8 « Arena Moods & Polish »

**Manager** : Assistant Arena  
**Product Owner** : Gideon - Godson  
**Équipe** : Nadia (Game Design), Kenzo (Direction Artistique & Rendu), Sarah (QA/Performance/Release)

## Objectif du sprint

Donner aux 4 arènes une vraie seconde vie visuelle avec des ambiances **Jour / Crépuscule / Nuit**, renforcer l’identité visuelle des projectiles de chaque combattant et rendre les contrôles tactiles plus fiables en multi-touch.

## Tableau du sprint

| ID | Livrable | Responsable | Critère d’acceptation | Statut |
|---|---|---|---|---|
| S08-01 | Système Arena Moods | Kenzo + Manager | Auto + Jour/Crépuscule/Nuit sur les 4 arènes, ciel/sol/post/atmosphère cohérents | ✅ |
| S08-02 | Sélection et persistance de l’ambiance | Kenzo | Choix visible à la préparation, sauvegardé, résumé de lancement et écran VS alignés | ✅ |
| S08-03 | Compatibilité Replay Studio | Manager | Ambiance capturée dans le replay et restaurée à la lecture, anciens replays en Auto | ✅ |
| S08-04 | VFX signatures | Kenzo | Effet distinct pour les projectiles des 6 combattants, y compris en qualité basse | ✅ |
| S08-05 | Finition tactile | Manager + Sarah | Multi-touch par identifiants de pointeur, état visuel actif, nettoyage anti-boutons collés | ✅ |
| S08-06 | Matrice QA 12 combinaisons | Sarah | 4 arènes × 3 ambiances rendues, pipeline 7 passes et métriques de mood/VFX vérifiées | ✅ |
| S08-07 | Release V2.8 | Manager + Sarah | Definition of Done complète, bundle, tag `v2.8.0` | ✅ Livré en `v2.8.0` |

## Décisions du Manager

- **Auto** conserve l’intention originale : Stade et Libreville au crépuscule, Tokyo la nuit, Temple le jour.
- L’ambiance modifie le ciel, le sol, le post-traitement et l’atmosphère du fond ; les combattants ne sont jamais assombris au point de nuire à la lecture du combat.
- Les anciens replays sans champ d’ambiance se relisent en mode Auto.
- Les VFX signatures restent purement cosmétiques : aucun impact sur la physique, les dégâts ou le déterminisme.

## Suite envisagée

- **Sprint 09 — Compétition locale** : tournoi local, défi tournant et équilibrage post-Zara (Nadia).
- **V3.0 — Connecté** : uniquement après feu vert explicite du Product Owner, car un backend devient nécessaire.

---
✍️ Sprint piloté par le Manager officiel du Studio Gideon - Godson ARENA.
