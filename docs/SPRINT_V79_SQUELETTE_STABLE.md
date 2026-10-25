# 🦴 SPRINT V7.9 — « Squelette Stable & 3D fiable »

**Déclencheur** : retour direct du propriétaire après la V7.8 —
« La 3D bug et ne s'applique pas correctement […] les personnes ne se
déforment pas ». Consigne : ne revenir qu'avec une 3D qui s'applique
correctement et des personnages qui ne se déforment plus.

**Équipe** : Kenzo (pipeline WebGL), Marco (anatomie/poses),
Sarah (mesures et veto QA), Manager (arbitrages et release).

## Diagnostic mesuré (738 poses = 41 combattants × 18 états)

| Mesure | Avant (V7.8) | Après (V7.9) |
|---|---|---|
| Bras supérieur | 0,081 → 0,465 m | **0,310 m fixe** |
| Avant-bras | 0,066 → 0,588 m | **0,290 m fixe** |
| Cuisse / tibia | 0,310→0,557 / 0,252→0,546 m | **0,540 / 0,530 m fixes** |
| Portée d'un poing | jusqu'à **0,998 m** | **≤ 0,600 m** (anatomie) |
| Écart d'os dans le monde affiché | jusqu'à **+110 % / −87 %**, +33 % par la seule torsion | **≤ 0,6 %** (buste), membres exacts |
| Sommet le plus bas (colosses) | −51 mm sous la plateforme | **−9 mm** (compression de semelle) |
| NaN / indices / normales | aucun | aucun |

Causes racines : coudes/genoux placés au milieu des segments (les os
s'étiraient ou se comprimaient au lieu de plier), torsion du buste
appliquée point par point selon la hauteur (champ de déformation),
inclinaison globale autour du sol, pied avant levé pendant les
poings (la glissade d'attaque était lue comme une course) et
demi-tour qui sautait de 43° en une image.

## Corrections

### Squelette IK à os fixes (`solveTwoBone3D`, `BONE3D`)
- Vraie IK deux os avec pôles anatomiques (coudes bas/arrière, genoux
  devant), cibles clampées à la portée réelle ; la portée des attaques
  vient désormais du buste et de l'épaule, pas d'un bras élastique.
- Colonne et cou à longueurs constantes (0,505 / 0,302 m).
- **Recalage IK dans le monde** après la torsion du buste : ce sont les
  longueurs *affichées* qui sont exactes, pas seulement les locales.
- Pose au sol reconstruite aux vraies longueurs, prise de fusil à deux
  mains rendue atteignable (détente près du buste, épaule de soutien
  avancée), appuis plantés pendant les attaques, chevilles relevées
  au-dessus de la semelle, demi-tour continu (~6 images, torsion signée
  continue) et inclinaison globale supprimée au sol.

### Activation 3D fiable
- Vertex shaders en `highp` (positions/matrices) pour les GPU mobiles,
  *varyings* et uniforme partagé explicitement en `mediump` — le piège
  de liaison « Precisions of uniform differ » qui éteint la 3D est
  verrouillé par les captures navigateur (il a été reproduit puis corrigé).
- Perte de contexte WebGL : repli 2D propre puis **restauration
  automatique** complète (programmes, buffers, textures, ombres, arène).
- Indices 32 bits reconnus en WebGL2 ; auto-désactivation seulement
  sous 26 FPS soutenus après 15 s en qualité basse (au lieu de 34 FPS / 4 s).
- Télémétrie : `skeleton3d`, `boneError3d`, `context3d`, `canvas3d`.

## Preuves navigateur (Chromium + WebGL, zéro erreur)
- Avant/après mêmes scènes : poing M1 final de Lyra (bras 0,465+0,571 m
  → 0,31+0,29 m), genou de Krak (jambe comprimée → chambre anatomique),
  projection de Zara, K.O./victoire Krak/Selene, fusil d'AEL-7 à deux mains.
- Robustesse : qualités 0/1/2 actives (28 642 / 42 264 / 60 319 sommets),
  formats Adaptatif/Cinéma/Plein cadre alignés au pixel, téléphone
  915×412 (canvas 2240×1260, scène 16:9 centrée, aucun étirement),
  **WebGL1 forcé** actif, perte de contexte simulée puis restaurée.
- Smoke source + bundle : **497 assertions / 733 vérifications ✅**
  (dont les 41 combattants mesurés en repos/poing/pied/sweep/air/sol).
- Gate QA : contrôle n°42 ajouté, **RELEASE AUTORISÉE**, 0 refus.
- Bundle : 727 290 octets (710 Ko), budget porté à 720 Ko par arbitrage
  d'équipe (la stabilité 3D prime ; surcoût = code uniquement).

## Périmètre garanti
Rendu seul : simulation, hitboxes, dégâts, M1, replays, lockstep
Online, 2v2 local et sauvegardes inchangés. Les anciennes captures de
diagnostic vivent hors dépôt (`diag-before-*.png`, `diag-after-*.png`,
`diag-robust-*.png` dans l'espace de travail du Manager).
