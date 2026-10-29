# Sprint V7.18 — Appuis sous pression

**Équipe** : Marco (direction personnages), Kenzo (rendu), Sarah (QA),
Manager & développeur principal. **Contexte** : l'équipe entière reste
sur le mouvement (directive du propriétaire). Après le recul défensif
(V7.16) et les déplacements rapides (V7.17), l'audit a couvert les
corps **imposés** : projection et knockdown, juggle en l'air,
atterrissage en attaque aérienne, et recul d'attaque parée.

## 1. Diagnostic (lois moteur reproduites image par image)

Métriques : pas relatif d'articulation (déplacement monde moins
translation de la racine), hauteur minimale des articulations au sol
(pénétration), frottement des semelles en contact fort, erreur d'os.

| Scène | Mesure (avant) | Verdict |
|---|---|---|
| Projection → knockdown → relève | pas relatif max 0,204 m (tête), minima au sol ≥ 0 | **sain** : aucune pénétration, os exacts |
| Juggle (4 impacts en l'air) | pas relatif max 0,136 m | **sain** |
| Atterrissage en coup de pied aérien | cheville de frappe à 1,06 m au touche (pose de frappe), frottement 0 | **sain** : réception sur le pied d'appui |
| **Poing paré (kvx −4,6, attaque qui continue)** | pieds : **0,211 / 0,207 m** de frottement | **défaut** : l'attaquant racle sur tout son recul (~0,20 m) |
| Uppercut paré | pied avant **0,22 m** | même défaut |
| Coup de pied paré | 0,029 / 0,005 m | déjà couvert (ancre V7.15 + step-in V7.17) |

Cause unique du défaut : le régime d'appuis plantés V7.16 était
interdit pendant toute attaque, et seules les attaques de pied
avaient une ancre dédiée. Or l'attaquant **parfaitement paré**
conserve son attaque (le moteur prolonge même son `attackT`) tout en
étant repoussé — ses pieds suivaient donc le corps en raclant.

## 2. Correctif (rendu uniquement)

- **Le régime planté couvre l'attaquant repoussé** : pendant une
  attaque au sol hors coup de pied/sweep (qui gardent leur ancre),
  un recul forcé (|kvx| ≥ 1,2) active le même régime : pieds ancrés
  au monde, **pas de rattrapage rapides** (seuil abaissé à 7 cm,
  6 images) car le recul de parade est bref et violent.
- Sans recul forcé, rien ne change : une attaque lancée en avançant
  volontairement garde exactement le comportement V7.17 (la
  condition exige un `kvx` moteur, pas une vitesse choisie).
- Repli 2D : la posture de résistance s'applique aussi pendant les
  attaques non-kick repoussées.

## 3. Résultats mesurés (même harnais, après)

| Mesure | Avant | Après |
|---|---|---|
| Poing paré — frottement arrière / avant | 0,211 / 0,207 m | **0,100 / 0,107 m** |
| Uppercut paré — frottement arrière / avant | — / 0,220 m | **0,047 / 0,066 m** |
| Coup de pied paré | 0,029 / 0,005 m | inchangé (déjà correct) |
| Projection / juggle / air-kick | sains | sains (vérifiés, inchangés) |
| Erreur d'os (`boneError`) | ~0 | **~0** |

Le résiduel du poing (~0,10 m) correspond aux toutes premières
images du recul et à la sortie de régime en fin d'attaque courte ;
la nature du geste change (plantage puis pas levés, mesurés en
télémétrie navigateur : les deux pas en cours dès l'image 6).

Validation navigateur (WebGL actif, zéro erreur de page) : poing
paré figé en pleine retraite — bras encore tendu, les deux pas de
rattrapage en cours — et knockdown photographié à mi-fondu (tête à
411 mm, bassin 315 mm en descente, aucune pénétration) ; captures
`pression-*.png` relues par l'équipe.

## 4. Garde-fous

- Rendu uniquement : simulation déterministe, hitboxes, dégâts, IA,
  M1, replays et lockstep inchangés ; le smoke historique V7.13→V7.17
  reste vert intégralement.
- 4 nouvelles assertions smoke (548 au total) verrouillent la
  parade poing/uppercut et l'audit de projection ; contrôle QA
  statique n°51.
