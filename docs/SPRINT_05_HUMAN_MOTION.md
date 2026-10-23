# 🚀 SPRINT 05 — V2.5 « Human Motion & Living Arenas »

**Manager** : Assistant Arena  
**Product Owner** : Gideon - Godson  
**Équipe** : Nadia (Design), Kenzo (Rendu/Animation), Sarah (QA/Performance/Release)

## Retour du Product Owner

> « Pas encore assez de fluidité dans les mouvements, les décors et les personnes peuvent être plus humaines et plus mobiles. »

## Objectif du sprint

Transformer le rendu procédural en **animation corporelle continue** et les arrière-plans en lieux de vie : pas de changement d’équilibrage majeur, mais une impression de corps humain qui respire, transfère son poids, anticipe ses attaques et évolue dans des arènes peuplées.

## Tableau du sprint

| ID | Livrable | Responsable | Critère d’acceptation | Statut |
|---|---|---|---|---|
| S05-01 | Moteur d’animation corporelle à valeurs lissées | Kenzo | posture, inclinaison, respiration, torsion et retournement interpolés au rendu | ✅ |
| S05-02 | Locomotion humaine | Kenzo + Nadia | pas alternés liés à la vitesse, genoux/pieds articulés, balancier des bras, appuis | ✅ |
| S05-03 | Attaques en anticipation / impact / récupération | Nadia + Kenzo | courbes d’easing, transfert de poids et follow-through lisibles | ✅ |
| S05-04 | Arènes vivantes | Kenzo | passants qui marchent dans chaque arène, ola de foule, drapeaux, oiseaux et détails animés | ✅ |
| S05-05 | Fluidité / optimisation | Sarah | caches de mesure de texte, stats d’animation, qualité adaptative respectée | ✅ |
| S05-06 | Tests + release V2.5 | Manager + Sarah | suite verte en répétitions, gate QA, bundle, HTTP 200, commit + tag | ✅ clôturé à la release `v2.5.0` |

## Décisions de sprint

- La simulation de combat et la frame data ne changent pas : on fluidifie la **représentation**, pas les règles.
- Tous les lissages sont calculés côté rendu avec le vrai delta d’écran, pour rester fluides à 60, 120 ou 144 Hz.
- Les passants sont une couche d’ambiance derrière le combat : jamais de collision, jamais d’obstruction de lisibilité.
- La graine des passants est pseudo-aléatoire stable par arène afin d’éviter les allocations et les sauts d’identité.

---
✍️ Sprint piloté par le Manager officiel du Studio Gideon - Godson ARENA.
