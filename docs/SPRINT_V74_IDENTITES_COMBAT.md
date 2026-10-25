# 🥋 SPRINT V7.4 — « Identités de combat »

**Date** : 25 octobre 2026 • **Version** : 7.4.0 • **Propriétaire** : Gideon - Godson
**Équipe** : Manager & Développeur principal • Marco (postures/attaques) • Kenzo (pose 3D) • Lena (sélection) • Sarah (QA)

## 1. Demande du propriétaire

« Travaille sur chaque personnage individuellement, pour que chacun ait
ses attaques, sa posture et etc. Regarde l’exemple. » — avec une capture
de roster où chaque figurine se reconnaît à sa stance : sabreur accroupi
lame basse, moine en garde, tireur en joue, colosse planté… Les
personnages de la capture étant sous droits d’auteur, le standard est
appliqué aux 41 héros originaux du jeu.

## 2. Les 41 fiches `FIGHTER_STANCE3D` (src/render3d.js)

Chaque combattant possède une fiche nommée unique (`ST74`) :

| Champ | Effet visible |
|---|---|
| `feet`, `width` | écart avant/arrière et largeur des appuis |
| `crouch` | hauteur de garde (0,01 prêtresse droite → 0,30 moine/assassine) |
| `lean` | inclinaison du buste vers l’avant ou l’arrière |
| `guardF` / `guardB` | position des deux mains de garde (l’arme suit la main) |
| `bounce` | amplitude du rebond d’attente (0,45 colosse → 1,5 Kira) |
| `twist` | torsion du buste (0,58 Titan carré → 1,30 Kazu/Nyx de profil) |
| `punch` | jab, cross, hook, upper, palm, revers, lame, viseur |
| `kick` | devant, circulaire, lateral, hache, bas, genou, retourne |
| `cast` | orbe, viseur, slam, lame (pose de spécial/SUPER/EX) |
| `portrait` | posture d’affiche de sélection/VS (bas, garde, poing, pied, sort, droit) |

`stanceProfile3D(f)` fusionne la fiche avec des valeurs par défaut et
résout les IDs à casse mixte (`Zara`, `Lira`, `Kairos`, `Zara-nova`)
comme `boardModel3D`.

## 3. Application

- **Combat 3D** (`buildFighterPose3D`) : pieds, bassin et mains naissent
  de la fiche ; au moment du poing, la main suit la trajectoire du style
  (crochet large en Z, lame qui descend, visée à deux mains…) ; le pied
  vise la hauteur du style (hache 1,26 m, frappe basse 0,42 m, genou
  court) ; le spécial prend sa pose de cast. Les M1 héritent des poses
  via `attackType`.
- **Sélection / VS** (`drawFighterPortrait`, src/ui.js) : le portrait est
  figé dans la posture d’affiche (accroupi, garde, poing/pied au pic
  d’extension factice, lancement de sort) — la grille se lit comme celle
  des captures du propriétaire.
- **Télémétrie** : `renderStats.stance3d` (dernier combattant dessiné)
  et `renderStats.stances3d` (41).

## 4. Périmètre protégé

Rendu seul : aucune hitbox, aucun dégât, aucun timing ne change. Les
poses utilisent les mêmes longueurs de jambes (IK `solveJoint`
inchangée) ; les pieds signature restent dans le rayon atteignable
(|pied| ≤ 0,40 m, bassin ≥ 0,88 m au repos accroupi maximal).

## 5. Preuves QA (Sarah)

- Audit navigateur : 41 fiches, 41 noms uniques ; poings
  {viseur 12, lame 10, palm 9, hook 5, cross 2, revers 2, upper 1},
  pieds {circulaire 9, bas 8, lateral 7, devant 5, genou 5, retourne 4,
  hache 3} ; mesures de pose différenciées (largeur des pieds 0,30 →
  0,40 m, bassin 0,89 → 0,98 m, torsion 0,22 → 0,47).
- Captures WebGL : Krak (Marais Penché) contre Taiko (Méditation Basse,
  lame tendue), Kira en coup de pied retourné horizontal contre AEL-7
  en visée fusil — zéro erreur d’exécution.
- Smoke + gate QA verts ; contrôle statique n°37 et assertions de
  mesures/postures V7.4 dans la suite.

---
✍️ Jeu créé et signé par **Gédéon - Godson** © 2026 — Libreville, Gabon
