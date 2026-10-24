# 🎯 SPRINT V3.4 — « Zone de combat dégagée »

**Retour du propriétaire** : « les touches s'affichent [dans] la partie où on
est censé voir que les personnages, le graphisme » — l'écran de combat est
pollué par des éléments qui recouvrent les combattants.

**Décision d'équipe (Manager + Nadia + Kenzo + Sarah)** : audit complet de
tout ce qui se superpose aux personnages pendant un combat, correction
présentation uniquement (gameplay, déterminisme, replays et Online inchangés).

## Coupables identifiés et corrigés

1. **Boutons tactiles** (le signalement principal) : cercles de 68 px opaques
   en rangées flex qui s'étalaient sur la moitié du stage et masquaient les
   jambes des combattants.
   → Grille compacte **collée aux coins** (déplacements bas-gauche :
   saut/Garde en haut, gauche/droite/dash en bas ; attaques bas-droite :
   spécial en haut, poing/pied en bas), taille `clamp(46px, 11.5vh, 60px)`
   (≈ 46–52 px sur téléphone en paysage), fond `rgba(6,10,26,.42)` flouté,
   conteneur à 88 % d'opacité, **libellés masqués** quand la hauteur
   d'écran ≤ 520 px. La logique multi-touch V2.8 est inchangée (CSS seul).
2. **Plaques de nom** au-dessus de la tête des combattants : doublon des
   noms du HUD DOM → dessin supprimé de `drawFighter`.
3. **Écran géant des arènes** (470×116, opaque, permanent au centre haut) :
   réduit à 344×82, relevé, et **alpha dynamique** — 100 % menus/intro,
   55 % fin de round, **30 % pendant le combat** (`renderStats.billboardAlpha`
   pour la mesure en test).
4. **Textes flottants qui se chevauchent** (« Lames de Marée » +
   « FINISH ÉNERGÉTIQUE » illisibles) : au rendu, chaque floater proche
   d'un floater déjà placé est **décalé de 27 px vers le haut**
   (`renderStats.floaterSpread`), sans toucher aux données de simulation.

## Amélioration graphique

- **Halo de scène** : ellipse de lumière douce (composite `screen`, α 0,08)
  centrée entre les deux combattants dans la passe POST (qualités
  moyenne/haute) — l'action est éclairée, les silhouettes ressortent du
  décor, aucun nouvel élément d'interface (`renderStats.spotlightX`).

## Validation (Sarah)

- **241 assertions source / 270 vérifications affichées**, suite verte :
  CSS tactile compact présent dans le livrable, plaque de nom absente du
  code de rendu, `billboardAlpha` mesuré à 1 au menu et ≤ 0,35 en combat
  réel, halo actif, décalage floaters ≥ 24 px mesuré sur collision forcée.
- **Contrôle visuel** : capture réelle de combat régénérée — écran géant
  discret, plus aucune plaque sur les combattants, textes lisibles en pile.
- Gate QA : contrôle permanent n°18 « Zone de combat dégagée V3.4 ».

## Prochain cap
Sprint 09 « Compétition locale » — voir `docs/ROADMAP.md`.
