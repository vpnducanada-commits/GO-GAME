# Sprint V7.13 — Mouvement Réel

**Équipe** : Marco (direction personnages), Kenzo (rendu), Sarah (QA),
Manager & développeur principal. **Déclencheur** : retour du
propriétaire — « Les personnes sont totalement déformés, les
mouvements sont trop irréaliste ».

## 1. Diagnostic (séquences continues, pas des poses)

Harnais jsdom déroulant image par image, pour 4 archétypes
(Gideon, Lyra, Krak, AEL-7) : repos, marche avant/arrière, dash, saut,
accroupi, punch/kick/uppercut/sweep/spécial/projection, blessure,
juggle, chute/relève, demi-tour, victoire. Mesures par image :
longueurs d'os monde, déplacement de chaque articulation, angles
coude/genou, vitesse horizontale des pieds en contact.

| Mesure (avant) | Valeur | Cause |
|---|---|---|
| Saut max d'articulation | **1,89 m/image** (relève) | pose au sol ↔ debout sans transition |
| Saut du pied (kick) | **1,07 m/image** départ + retour | pied affecté directement à la pose de frappe |
| Patinage en appui | moy. **2,43 px/img**, pic **6,7** | foulée sinusoïdale dans le repère du corps |
| Coude de garde | **26,7°** (hyper-replié) | distance main-épaule non bornée inférieurement |
| Avant-bras 2D | **4,6 → 59,8 px** | coudes dessinés à coordonnées libres |
| Canaux garde/air/douleur | bascule en **1 image** | filtre historique `1-exp(-rate·dt·0,62)` saturé |

Captures navigateur confirmant : coup de pied déjà tendu à la
première image, sweep debout, juggle vertical « assis en l'air »,
chute en planche puis retour debout instantané.

## 2. Correctifs

### Rendu 3D (`src/render3d.js`)
- `rateLimit3` : vitesse maximale des cibles mains/pieds selon le
  contexte (frappe rapide, transitions douces) — filet anti-saut.
- Attaques fondues par `atkW` (montée pendant le démarrage, descente
  en récupération) ; coups de pied/sweep/air en images-clés
  posture → chambre → frappe tenue jusqu'à la fin de la fenêtre
  active → chambre → posture ; pied d'appui planté sous le bassin.
- Chute/relève : `downBlend3d` linéaire passé au smootherstep
  (chute 19 img, relève 26 img), racines et cibles fondues puis
  **re-résolues en IK**, colonne/cou renormalisés en local et en
  monde — os constants pendant la transition.
- Foulée cycloïdale : appui linéaire à vitesse monde nulle,
  oscillation dont la dérivée aux extrémités égale la pente d'appui
  (le pied recule déjà avant la pose du talon) ; orientation du pied
  talon → pointe accordée au cycle ; cadence `stridePx` réaccordée.
- `stablePole3` : le pôle IK garde 55 % de mémoire du coude/genou
  précédent (local + correction monde) — plus de retournement.
- Flexions minimales dans `solveTwoBone3D` (coude ≳ 38°,
  genou ≳ 35°), extension plafonnée à 99,2 % (jamais verrouillé).
- Transferts de poids : bassin/buste en contre-balance (pied,
  sweep), uppercut flexion → détente avec poing à hauteur de
  menton, tête stabilisée (le cou absorbe 36 % des oscillations),
  juggle basculé en arrière jambes traînantes bras battants,
  demi-tour à vitesse angulaire bornée.
- Mémoire d'animation remise à zéro dans `Fighter.reset()`
  (`posePrev3d`, pôles, fondus) : aucun héritage entre rounds.

### Mouvement partagé + repli 2D (`src/render.js`)
- `dampMotionValue` : amortissement calibré par seconde pour les
  canaux corporels (face, inclinaison, course, air, garde, douleur,
  dash, poids, roulements bassin/épaules, accroupi).
- Courbe de frappe : accélération vive mais sans à-coup maximal
  (pente initiale 1,7 au lieu de 3).
- `solveLimb2D` : bras (37/36 px) et jambes (46/45 px) à longueurs
  constantes, cibles bornées à la portée — utilisé par les tracés
  bras/jambe eux-mêmes, donc valable partout où le repli dessine.
- Foulée 2D cycloïdale plantée, coups de pied 2D en images-clés,
  bras avant à cible unique fondue depuis la garde, chute/relève
  par rotation fondue (`downBlend2d`), victoire fondue, écrasement
  cartoon du corps réduit à une micro-respiration (±1 %).

## 3. Résultats mesurés (même harnais, après)

| Mesure | Avant | Après |
|---|---|---|
| Saut max d'articulation | 1,89 m/img | **0,24 m/img** (genou en pleine frappe) |
| Écart d'os monde | 0,35 % | **~0 %** |
| Patinage moyen / pic | 2,43 / 6,7 px/img | **0,22 / 1,42 px/img** |
| Angles coude/genou | 26,7° – 168,5° | **40,3° – 165,5°** |
| Segments 2D | 4,6 – 59,8 px | **constants (erreur 0)** |

Captures après : chambre du pied lisible avant extension, poing
tendu avec talon arrière levé, uppercut détendu depuis la flexion,
relève progressive, victoire levée en fondu.

## 4. Garde-fous

- Simulation déterministe, hitboxes, dégâts, IA, M1, replays et
  lockstep inchangés : seules les poses d'affichage évoluent.
- 7 nouvelles assertions smoke verrouillent continuité (< 0,30 m),
  appuis (moy. < 0,6 px/img), angles (34-172°), squelette 2D et
  fondu chute/relève ; contrôle QA statique n°46.
- Les anciens tests qui mesuraient des poses téléportées déroulent
  désormais les attaques image par image, comme en jeu réel.
