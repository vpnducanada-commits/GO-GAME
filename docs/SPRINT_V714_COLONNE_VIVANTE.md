# Sprint V7.14 — Colonne VIVANTE

**Équipe** : Marco (direction personnages), Kenzo (rendu), Sarah (QA),
Manager & développeur principal. **Contexte** : la V7.13 a supprimé
les téléportations de membres, les angles impossibles et le patinage.
L'audit suivant montrait encore deux limites de réalisme : le buste
était lofté sur une droite bassin → poitrine (le ventre ne fléchissait
jamais) et les jupes/robes formaient un cône centré sur le bassin qui
pouvait cacher ou traverser les jambes pendant les coups de pied.

## 1. Diagnostic

- `addLoftedTorso3D()` plaçait les anneaux du torse par interpolation
  linéaire entre le bassin et la poitrine : aucune articulation
  intermédiaire à la taille, donc un buste visuellement rigide même
  lorsque les jambes et les bras bougeaient correctement.
- Les jupes annulaires de `addBoardCloth3D()` combinaient un centre
  fixe au bassin et un ourlet conique : pendant un coup de pied, le
  tissu ne suivait ni la cuisse ni le tibia de la jambe levée.
- Audit navigateur complémentaire : un échec transitoire de création
  du contexte WebGL verrouillait définitivement `initFailed`, donc
  condamnait toute la session au repli 2D. La matrice de flags a aussi
  isolé un piège du harnais headless Chrome 127
  (`--use-angle=swiftshader` seul renvoie des contextes nulls) ; la
  relance produit reste néanmoins utile sur les vrais appareils,
  notamment autour des transitions plein écran/orientation.

## 2. Correctifs

### Colonne articulée (`src/render3d.js`, repli `src/render.js`)
- Nouveau point de taille `local.waist`, placé à 42 % du trajet
  bassin → poitrine puis décalé par `spineBend714` (borné
  −50 mm…+55 mm) : flexion en accroupi/garde/fatigue/poing, cambrure
  en contre-balance de pied et de sweep, recul cambré sous l'impact
  et en juggle. Une composante latérale suit la contre-rotation
  bassin/épaules.
- Les anneaux intermédiaires du torse suivent une courbe quadratique
  bassin → taille → poitrine (`spinePt714`), normales incluses : le
  ventre et le bas du dos plient au lieu de glisser en bloc.
- La taille participe au fondu chute/relève V7.13 et aux deux
  renormalisations de colonne (local + monde), en suivant 58 % de la
  correction de poitrine : `BONE3D.spine` reste constant.
- Repli 2D : `spineBend2d` décale le centre de taille entre hanche et
  épaule (−4…+3 px) selon accroupi, fatigue et impact.
- Télémétrie : `pose.spineBend`, `pose.spineLive14`,
  `renderStats.spineBend3d`.

### Tenues qui suivent les jambes (`src/render3d.js`)
- `skirtLegPoint3D()` échantillonne chaque jambe à la hauteur d'un
  anneau de jupe : segment hanche → genou au-dessus du genou, genou →
  pied en dessous, borné aux extrémités.
- Les anneaux libres de l'ourlet sont attirés vers la jambe
  correspondante (32 % à mi-hauteur, 55 % à l'ourlet, pondérés par le
  côté du sommet) tout en conservant 55 % du rayon d'évasement : le
  tissu accompagne la jambe sans s'effondrer sur elle.
- Ourlet légèrement raccourci pour dégager les tibias ; télémétrie
  `renderStats.skirtFollow3d = 0,55` lorsque le suivi est actif.

### Robustesse WebGL (`src/render3d.js`)
- Un premier échec d'initialisation ne verrouille plus la session :
  relances espacées (700 ms → 2,5 s max) tant que le combat dure.
- Après un échec, la relance repart d'un canvas `#gl3d` neuf
  (maximum 10 remplacements) car certains navigateurs empoisonnent
  un canvas dont la création de contexte a échoué.
- `fullscreenchange`, `orientationchange` et retour de visibilité
  réarment une relance rapide (+350 ms) ; télémétrie
  `renderStats.renderer3dRetries`. Le repli 2D AAA II continue de
  dessiner pendant les relances : aucun écran noir.

## 3. Résultats mesurés

Diagnostic jsdom déroulé image par image avec `renderDtFactor = 1`
(la taille est incluse dans les articulations mesurées) :

| Mesure | Résultat V7.14 |
|---|---|
| Flexion de taille au repos | **−2 mm** |
| Flexion en accroupi stabilisé | **−25 mm** |
| Cambrure sous impact | **+21 mm** |
| Cambrure au coup de pied de Lyra | **+20 mm**, pied à 0,906 m |
| Saut max d'articulation (taille incluse) | **0,244 m/image** (genou en pleine frappe) |
| Écart d'os (`boneError`) | **~0** sur repos, accroupi et impact |
| Point de jupe (hanche/genou/pied) | milieux exacts, extrémités bornées |

Validation navigateur (WebGL SwiftShader, flags corrigés) : 3D
active (`body.render3d-on`), zéro erreur de page, flexions directes
du joueur 1 mesurées en session (accroupi −14 mm en cours
d'amortissement, impact +19 mm, pied Lyra +13 mm, sweep −15 mm) et
suivi d'ourlet à 0,55. Sur la capture du coup de pied de Lyra, la
jambe sort nettement de la tenue, le tissu accompagne la cuisse levée
et le buste se contre-balance sans déformation.

## 4. Garde-fous

- Animation et robustesse de rendu uniquement : simulation
  déterministe, hitboxes, dégâts, IA, M1, replays et lockstep
  inchangés ; `BONE3D` et les protections V7.13 sont conservés.
- 6 nouvelles assertions smoke (528 au total) verrouillent version,
  flexion/cambrure avec os constants, continuité taille incluse
  (< 0,30 m), suivi de jupe et coup de pied de Lyra ; contrôle QA
  statique n°47.
- Aucun gel ni ralenti d'impact ajouté ; le budget bundle passe à
  740 Kio (bundle V7.14 : 756 633 octets, soit 738 Kio).
