# 🏃 SPRINT V7.6 — « Mobilité Dynamique »

**Date** : 25 octobre 2026 • **Version** : 7.6.0 • **Propriétaire** : Gideon - Godson
**Équipe** : Manager & Développeur principal • Nadia (game feel) • Kenzo (animation/caméras) • Sarah (QA)

## 1. Demande et audit

Le propriétaire a demandé de continuer le travail et, explicitement,
de travailler la mobilité pour un jeu « plus fluide et dynamique ».

La base était saine (simulation 60 Hz, interpolation des positions,
tampons d’entrée, coyote-time), mais l’audit a relevé quatre limites :

1. la phase de marche avançait à 60 Hz indépendamment de la distance
   interpolée réellement affichée, d’où un léger patinage des pieds ;
2. la phase d’attaque restait quantifiée par tick, visible sur les
   écrans 90/120 Hz malgré des racines interpolées ;
3. demi-tour, décollage et réception n’avaient pas de ressort dédié ;
4. la caméra 3D suivait le centre sans anticipation et pouvait perdre
   la tête d’un combattant au sommet d’un saut.

## 2. Réalisations

### Contrôle direct (`MOBILITY76.dynamic`)

- vitesse de base 4,85 px/frame, course progressive jusqu’à +34 % en
  135 frames de maintien, accélération .34, freinage .40 et demi-tour
  .43 ;
- élan d’attaque au sol conservé avec un amorti .22 au lieu de .36 ;
- air : cible à 88 % de la vitesse sol et correction .20 ; gravité de
  montée tenue ×.90, apex ×.68, chute ×1.12, plafond 20 ;
- dash : 13 frames, cible 12,9 px/frame, blend .70, fantôme à chaque
  tick ; coyote 8 frames ; tampons saut/dash 11, attaque 12 et double
  tap 21 frames ;
- séparation corporelle amortie à 78 % avec transfert au mur et
  réduction de la vitesse entrante au contact.

### Compatibilité replay

Le profil `MOBILITY76.legacy` reproduit les constantes V7.5. Pendant
la lecture d’un replay antérieur à la V7.6, `mobilityProfile76()`
sélectionne ce profil : les anciens checkpoints/hash restent donc
vérifiables. Les parties V7.6 et l’Online entre clients V7.6 utilisent
le profil dynamique des deux côtés du lockstep.

### Animation à la fréquence écran

- `gaitPhase` avance de `distance interpolée / longueur de foulée` et
  pilote jambes, bras, roulis et ombres de contact en 2D et 3D ;
- `attackFlow = elapsed - (1 - alpha)` rend la courbe d’attaque
  continue entre deux ticks ;
- `accelLean`, `airPitch`, `turnPulse`, `takeoffPulse` et
  `landingPulse` nourrissent inclinaisons, appuis de pivot,
  étirement/compression et balancement secondaire ;
- les fantômes de dash portent leur vitesse et produisent des
  traînées 3D (`dashTrails3d`) en plus des silhouettes 2D.

### Caméras

- 2D : avance de visée jusqu’à ±44 px selon la vitesse moyenne et
  recul maximal de .045 quand la vitesse relative explose ;
- 3D : centre, hauteur et distance amortis (`cameraSmooth`), même
  anticipation horizontale, et distance calculée depuis le sommet de
  tête le plus haut (`headTop76`) pour conserver saut et pieds au sol
  dans le même cadre.

## 3. Preuves QA (Sarah)

- Smoke V7.6 : sélection dynamic/legacy, course de Kira mesurée
  (>250 px, vx >7,1 et foulée >7,5 en 42 ticks), dash 13 frames avec
  au moins 5 traînées, demi-tour >0,45, réception >0,35, phase
  fractionnaire .37 et projection caméra du saut dans l’écran.
- Chromium WebGL réel : course Kira (vx 7,87, foulée 10,13), dash
  (5 fantômes/traînées en 5 ticks), saut Zara à y=406 avec tête
  projetée dans le cadre et pieds adverses visibles, demi-tour .68
  et réception .67 — zéro erreur console/page.
- Aucun mécanisme de gel ou de ralenti d’impact n’a été réintroduit.
- Limites honnêtes : les FPS SwiftShader du harnais ne représentent
  pas un téléphone réel ; la sensation tactile finale reste à valider
  sur appareils physiques, comme l’Online entre deux réseaux.

---
✍️ Jeu créé et signé par **Gédéon - Godson** © 2026 — Libreville, Gabon
