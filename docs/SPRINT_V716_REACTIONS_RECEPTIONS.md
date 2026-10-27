# Sprint V7.16 — Réactions & Réceptions

**Équipe** : Marco (direction personnages), Kenzo (rendu), Sarah (QA),
Manager & développeur principal. **Contexte** : après la colonne
(V7.14) et les appuis d'attaque (V7.15), l'audit en séquences
continues a fermé la zone restée sans preuve : les pieds pendant le
**recul sous impact** (le diagnostic V7.15 affichait « samples=0 »),
plus la **réception de saut** et l'**arrêt de course**.

## 1. Diagnostic (loi moteur reproduite image par image)

Recul : `x += kvx ; kvx ×= 0,76` au sol, kvx initial −4 / −8,5 px.
Atterrissage : chute avec la gravité du personnage jusqu'au sol.
Arrêt : course à 5 px/image puis vitesse nulle. Le frottement est
compté uniquement quand le pied annonce un contact fort (≥ 0,8).

| Mesure (avant) | Valeur | Verdict |
|---|---|---|
| Frottement pied avant — recul dur (recul 0,394 m) | **0,429 m** (pic 180 mm/img) | le pied racle plus que le corps ne recule |
| Frottement pied avant — recul léger / blocage | **0,251 m / 0,211 m** | la foulée de course s'inversait d'un coup à l'impact |
| Chevilles après atterrissage | jusqu'à **23 cm / 14 cm** au-dessus du sol, contact annoncé | réception « sur pieds invisibles » |
| Amorti du bassin à la réception | **≈4 cm** | réception raide, jambes droites |
| Rétablissement des pieds à l'arrêt | **0,101 m** de glissement | même famille de défaut que le demi-tour V7.15 |

La durée d'un recul (17-42 px) est inférieure à un demi-cycle de
foulée : une démarche cycloïdale ne peut pas modéliser un rattrapage.
Il fallait des **pas discrets**, comme un combattant sonné qui plante
un pied derrière lui.

## 2. Correctifs (rendu uniquement)

### Régime d'appuis plantés `plant716` (`src/render3d.js`)
- Actif au sol sous impact (hitStun / blockStun / |kvx| ≥ 1,2), juste
  après un atterrissage (`landT < 13`) et pendant l'arrêt de course
  (vitesse faible sans direction tenue) ; la foulée cycloïdale est
  coupée dans ces régimes.
- Les deux pieds sont **ancrés en monde** (machinerie V7.15 réutilisée,
  capture compensée du déplacement du frame). Chaque pied déclenche
  **son propre pas** en 8 images (arc de 7 cm) quand il s'écarte de la
  posture ou sort de portée — posture élargie de 5 cm vers l'arrière
  sous impact, comme une résistance au recul.
- Le régime se maintient au calme jusqu'au rétablissement complet des
  appuis (écart < 7 cm) : plus aucun retour glissé en sortie de recul.
- Contacts annoncés cohérents : le pied en pas passe à 0,12, l'autre
  reste à 1 ; la course volontaire, les attaques, les dashs et le
  demi-tour V7.15 gardent leurs propres systèmes.

### Réception amortie (`src/render.js` + `src/render3d.js`)
- `fighterMotion` expose `landT` / `landImpact` / `landDip716` : une
  courbe d'amorti sinusoïdale de 16 images, proportionnelle à la
  vitesse d'impact, partagée par la 3D et le repli 2D.
- En descente, dès que le sol est à moins de 0,45 m, les pieds
  **se préparent** : ils s'étendent vers la posture de réception au
  lieu de rester repliés sous le bassin.
- Au contact : le bassin descend (jusqu'à ~9 cm, plus le ressort
  existant), les pieds restent plantés au point de touche pendant
  l'amorti — les genoux plient naturellement via l'IK (117-118°
  mesurés contre 138° debout).

### Repli 2D assorti (`src/render.js`)
- Foulée coupée sous impact, posture de résistance élargie, amorti de
  réception (même `landDip716`) et pieds d'air préparés en descente.

## 3. Résultats mesurés (même harnais, après)

| Mesure | Avant | Après |
|---|---|---|
| Recul dur — frottement pied avant | 0,429 m | **0,078 m** |
| Recul léger / blocage — pied avant | 0,251 / 0,211 m | **0,016 / 0,015 m** |
| Recul — pied arrière (tous cas) | bruit faible | **≤ 0,042 m** |
| Réception — chevilles au contact | 23 / 14 cm en l'air | **4 / 0 cm** |
| Réception — creux du bassin | ~0,93 m | **0,85 m** (amorti ~12 cm) |
| Arrêt — rétablissement glissé | 0,101 m | **0,028 / 0,000 m** |
| Erreur d'os (`boneError`) | ~0 | **~0** |

Non-régression vérifiée sur le diagnostic V7.15 complet : appui du
coup de pied 0,002 m, sweep 0,072 m, demi-tour inchangé (frottement
0,070/0,055 m, pivot 0,99), course 0,22 px/image de patinage,
balancier bras/jambes −0,96/+0,95.

Validation navigateur (WebGL actif, zéro erreur de page) : recul
violent photographié en pas chancelant et en stabilisation, réception
figée au creux de l'amorti (dip 0,88, bassin 0,89 m, régime planté
actif) ; captures `reactions-*.png` relues par l'équipe.

## 4. Garde-fous

- Rendu uniquement : simulation déterministe, hitboxes, dégâts, IA,
  M1, replays et lockstep inchangés ; `Fighter.reset()` efface la
  nouvelle mémoire visuelle (`plant716=null`).
- 5 nouvelles assertions smoke (539 au total) verrouillent le recul
  planté avec pas levés, la réception (chevilles basses, creux du
  bassin, frottement nul) et l'arrêt propre ; contrôle QA statique
  n°49.
- Budget bundle porté à 749 Kio (bundle V7.16 : 766 410 octets, soit
  748 Kio) — arbitrage déjà acté : le mouvement prime.
