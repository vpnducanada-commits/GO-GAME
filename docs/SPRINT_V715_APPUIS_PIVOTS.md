# Sprint V7.15 — Appuis & Pivots

**Équipe** : Marco (direction personnages), Kenzo (rendu), Sarah (QA),
Manager & développeur principal. **Contexte** : après « Mouvement
Réel » (V7.13) et « Colonne VIVANTE » (V7.14), l'audit en séquences
continues a cherché le prochain défaut visible quand le corps bouge,
plutôt qu'un nouvel effet graphique.

## 1. Diagnostic (mesures image par image)

Harnais jsdom déroulant les poses avec `renderDtFactor = 1` :
déplacement monde des chevilles, contact annoncé par `foot77`,
corrélation bras/jambes en course, distance main/tête en garde et
profondeur estimée des semelles.

| Mesure (avant) | Valeur | Verdict |
|---|---|---|
| Trajet du pied d'appui — coup de pied | **0,367 m** (pic 46 mm/img) | la cible glissait sous le bassin puis revenait |
| Trajet du pied d'appui — sweep | **0,490 m** (pic 49 mm/img) | même cause, en position basse |
| Demi-tour sur place | semelles : **1,16 m / 1,21 m**, contact = 1 | corps tourné « sur plateau », aucun pas |
| Balancier des bras en course | corrélation **−0,96 / +0,95** | sain, inchangé |
| Patinage en course | **0,22 px/img** (pic 1,42) | acquis V7.13 conservé |
| Mains de garde ↔ tête | **0,43 m / 0,47 m** | aucune intersection |
| Semelles au contact | ≈ **−11 mm** | compression d'appui négligeable |

Le poing, lui, était déjà propre (appuis : 0,014 m / 0,006 m).

## 2. Correctifs

### Pied d'appui ancré dans le monde (`src/render3d.js`)
- Au premier frame d'un coup de pied ou d'un sweep au sol, la pose
  capture le pied d'appui réel (`makeFootAnchor715`, clé `attackId`)
  en coordonnées monde ; chaque frame reconvertit cette ancre en
  cible locale (`anchorFootLocal715`) en tenant compte de la
  position et de l'orientation *prédite* du combattant.
- Garde de portée : si l'ancre sort de la longueur de jambe, la cible
  se rapproche progressivement de la posture au lieu d'étirer le
  membre — l'IK V7.9/V7.13 reste seule juge des longueurs.
- L'ancienne cible qui glissait à −0,10 m sous le bassin pendant la
  frappe est supprimée ; l'ancre est libérée dès que l'attaque se
  termine ou que le combattant quitte le sol.

### Chaussure qui pivote (`src/render3d.js`, repli `src/render.js`)
- Chaque chaussure reçoit un angle propre (`foot77.yaw`) : la botte
  3D pivote autour de la cheville (tube, semelle, pointe et renfort
  d'armure tournent ensemble, jamais détachés de la jambe).
- Pendant la frappe, le pied d'appui passe sur l'avant-pied : talon
  levé (pitch −0,08 → −0,32) et pointe tournée vers l'extérieur
  (yaw −0,09 → −0,58 au coup de pied, −0,38 au sweep), au rythme de
  l'ouverture des hanches. Orteils ouverts en accroupi, angle de
  poussée en dash ; le repli 2D lève aussi le talon d'appui.

### Demi-tour en deux pas (`src/render3d.js`)
- Phase 1 (0 → 68 %) : le pied arrière reste ancré au même point du
  sol et pivote (talon levé, yaw jusqu'à −0,48) pendant que le pied
  avant, levé (contact → 0,13), fait son pas vers son point
  d'arrivée *final* calculé dès le départ (`frontOffsetX`).
- Phase 2 (62 → 100 %) : le pied avant est planté sur ce point
  final ; le pied arrière se lève à son tour et rejoint la posture
  dans un arc de pas. À la fin, les deux pieds sont déjà à leur
  place définitive : aucun réglage glissé après la rotation.
- Les deux ancres sont des mémoires purement visuelles, effacées par
  `Fighter.reset()` comme le reste de l'état d'animation.

## 3. Résultats mesurés (même harnais, après)

| Mesure | Avant | Après |
|---|---|---|
| Appui — coup de pied | 0,367 m (pic 46 mm) | **0,027 m** (pic 25 mm, un seul pas d'installation) |
| Appui — sweep | 0,490 m (pic 49 mm) | **0,113 m** (pic 20 mm) |
| Demi-tour — frottement semelle arrière | ≈1,16 m | **0,070 m** (pivot : 6 mm/img) |
| Demi-tour — frottement semelle avant | ≈1,21 m | **0,055 m** |
| Pivot maximal mesuré | inexistant | **0,99**, yaw chaussure **0,47 rad** |
| Erreur d'os (`boneError`) | ~0 | **~0** |

Validation navigateur (WebGL actif, zéro erreur de page) : appui
ancré = 1 et chaussure pivotée à la frappe du pied et du sweep,
demi-tour photographié en plein pas (pivot 0,98, contact avant
0,13) puis garde stable dans l'autre sens, captures
`appuis-*.png` relues par l'équipe.

## 4. Garde-fous

- Rendu uniquement : simulation déterministe, hitboxes, dégâts, IA,
  M1, replays et lockstep inchangés ; la course V7.13 (appuis
  plantés, balancier opposé) est explicitement préservée.
- 6 nouvelles assertions smoke (534 au total) verrouillent les
  trajets d'appui, le pivot à la frappe, le frottement du demi-tour
  et la réversibilité des ancres ; contrôle QA statique n°48.
- Budget bundle porté à 744 Kio (bundle V7.15 : 761 550 octets,
  soit 743 Kio) — arbitrage déjà acté : le mouvement prime.
