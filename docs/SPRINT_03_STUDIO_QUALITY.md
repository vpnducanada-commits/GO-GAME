# 🚀 SPRINT 03 — V2.3 « Studio Quality »

**Manager** : Assistant Arena  
**Product Owner** : Gideon - Godson  
**Équipe** : Nadia (Design), Kenzo (Rendu), Sarah (QA/Performance/Release)

## Objectif du sprint

Structurer le jeu comme une production de studio et élever le niveau de rendu sans sacrifier les 60 FPS :
équipe formalisée, pipeline graphique en passes, caches de rendu, post-traitement léger, contrôles QA automatisés supplémentaires.

## Tableau de sprint

| ID | Tâche | Responsable | Critère d’acceptation | Statut |
|---|---|---|---|---|
| S03-01 | Charte d’équipe, RACI, rituels | Manager | `docs/EQUIPE.md` validé | ✅ |
| S03-02 | Architecture technique et pipeline de rendu | Kenzo + Manager | `docs/ARCHITECTURE.md` + passes nommées dans le code | ✅ |
| S03-03 | Game Design Document et tables d’équilibrage | Nadia | `docs/GAME_DESIGN.md` complet | ✅ |
| S03-04 | Stratégie QA et seuils de release | Sarah | `docs/QA_QUALITE.md` + veto qualité formalisé | ✅ |
| S03-05 | Cache de dégradés et passes de rendu mesurables | Kenzo | moins d’allocations par frame, rendu inchangé ou meilleur | ✅ |
| S03-06 | Post-traitement : teinte d’arène, flash d’impact, lisibilité | Kenzo | actif selon preset, désactivable par qualité basse | ✅ |
| S03-07 | Contrôle statique automatisé `tools/qa-check.py` | Sarah | IDs, version, scripts, budgets vérifiés en une commande | ✅ |
| S03-08 | Tests du pipeline et des presets qualité | Sarah + Kenzo | suite d’exécution étendue et verte | ✅ |
| S03-09 | Build V2.3, changelog, Git, tag | Manager + Sarah | Definition of Done complète | ✅ clôturé à la release `v2.3.0` |

## Décisions du sprint

- Le Chapitre 2 et les replays passent au sprint suivant : la base studio passe d’abord.
- Aucune refonte risquée en micro-fichiers : on structure l’intérieur des modules avant de les éclater.
- Le Product Owner conserve la validation de la vision et de la marque à chaque release.

---
✍️ Sprint piloté par le Manager officiel du Studio Gideon - Godson ARENA.
