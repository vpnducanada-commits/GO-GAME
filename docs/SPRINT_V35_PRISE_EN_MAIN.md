# 🎮 SPRINT V3.5 — « Prise en main paysage & impacts fluides »

**Retours du propriétaire** :
1. « Est-ce que vous avez compris le fait que la personne doit tenir le
   téléphone en paysage lorsqu'elle joue ? Si oui il y a des correctifs à faire. »
2. « Chaque [fois] que l'un des personnages prend un coup il y a un
   ralentissement, c'est pas correct. »

## 1. Diagnostic du ralentissement (Nadia)

Le « gel d'impact » (hitstop), effet classique des jeux de combat, était
réglé beaucoup trop fort : **la simulation entière se figeait** à chaque
coup touché, dans la boucle d'affichage (`src/render.js`, branche
`hitStopT>0` qui rend l'image sans faire avancer le jeu) :

| Coup | Avant | Après V3.5 |
|---|---:|---:|
| Poing / poing aérien | 42 ms | **14 ms** (< 1 frame) |
| Pied / pied aérien / balayage | 58–66 ms | **24–26 ms** |
| Uppercut / spécial / EX / projection | 70–86 ms | **32–38 ms** |
| SUPER | 105 ms | **48 ms** |
| Contre / riposte | × 1,45 (jusqu'à ~152 ms) | **× 1,2** |
| Parry réussie | 92 ms | **38 ms** |
| Ralenti de K.O. | 55 frames à 34 % | **38 frames** |

Secousse des coups légers réduite (4,6 → 3,4) pour éviter la sensation de
saccade. Le gel et le ralenti vivent **hors simulation** (et sont déjà
forcés à 0 en Online) : déterminisme, replays hashés et lockstep sont
intacts — toute la suite, replays compris, reste verte.

## 2. Prise en main paysage (Kenzo + Manager)

Tenu en paysage, le téléphone est pris à deux mains, pouces sur les bords :
- **Combat immersif** (`body.combatImmersif`, synchronisé à chaque frame
  par `syncImmersiveCombat`) : en paysage court (hauteur ≤ 580 px) et
  pendant un match/replay, l'en-tête est masqué et l'arène prend
  **100 % de la hauteur** (`(100dvh - 8px) × 16/9`).
- **Pause flottante** `#btnPauseFloat` (coin supérieur, à côté du timer)
  visible uniquement en immersif.
- **Grappes tactiles dans l'arc des pouces** : marge basse relevée
  (`4,5vh`), bords alignés sur `env(safe-area-inset-*)`, boutons
  `clamp(48px, 12.5vh, 62px)`.
- **Encoches** : safe-areas appliquées au HUD en paysage.
- **Anti-accidents** : `touch-action: none` sur la scène et
  `overscroll-behavior: none` — plus de scroll ni de pull-to-refresh
  pendant un combo.

## 3. Validation (Sarah)

- **248 assertions source / 277 vérifications affichées**, suite verte :
  plafond de gel (max des données d'attaque ≤ 48 ms, poing ≤ 16 ms),
  coup de poing réel mesuré sans ralentissement (`hitStopT ≤ 16`,
  `slowmoT = 0`), immersif + pause flottante présents et sans crash hors
  mobile, règles CSS deux-mains présentes dans le livrable.
- Gate QA : contrôle permanent n°19 ; budget bundle relevé à 336 Ko
  (documenté dans `docs/QA_QUALITE.md`).

## Prochain cap
Sprint 09 « Compétition locale » — voir `docs/ROADMAP.md`.
