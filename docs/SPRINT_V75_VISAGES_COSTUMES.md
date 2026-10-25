# 💇 SPRINT V7.5 — « Visages & Costumes »

**Date** : 25 octobre 2026 • **Version** : 7.5.0 • **Propriétaire** : Gideon - Godson
**Équipe** : Manager & Développeur principal • Marco (visages/costumes) • Kenzo (rendu 3D) • Sarah (QA)

## 1. Contexte

Le propriétaire a demandé de continuer le travail. Après l’anatomie
(V7.2), l’affichage (V7.3) et les postures/attaques individuelles
(V7.4), l’audit des têtes 3D a montré un écart : les 41 fiches
`BOARD_MODEL3D` décrivent **13 coiffures** (long ×11, short ×7, hood ×4,
ponytail ×3, bob ×3, shaved ×2, mohawk ×2, braids, topknot, bun, wraps,
alien, none), mais le moteur n’en dessinait que six, avec une coiffe
ellipsoïde unique façon « casque » et des barbes réduites à une boule.

## 2. Réalisations (src/render3d.js, rendu seul)

- **Coiffe sculptée par style** (`capFlat75`, `capLift75`, `backDeep75`) :
  plaquée pour les crânes rasés, abaissée sous les crêtes mohawk,
  panneau arrière descendu et élargi pour long/carré/tresses.
- **Mèches d’encadrement** : deux tubes loftés devant les oreilles
  jusqu’à la mâchoire (plus longs pour `long`/`braids`) — de face 3/4,
  les héroïnes ne paraissent plus chauves sous la coiffe.
- **Chignon** : sphère nouée + bandeau accent (Zara-nova), style
  jusqu’ici ignoré par le moteur.
- **Barbes en trois volumes** (`beard75`) : menton + joues dès 0,30,
  pointe longue dès 0,65 — Brax (1,0) et Drakar (0,9) portent de
  vraies grandes barbes raccordées à la mâchoire.
- **Peintures de guerre** verticales sur les joues des frames
  `orc`/`alien`, couleur accent assombrie.
- **Ceintures-écharpes** (`sashCenter75`) avec boucle sombre pour les
  tenues `kunoichi/assassin/samurai/ranger/mageCoat/assassinCoat/
  explorer/pirateArmor/leather`.
- Télémétrie `renderStats.hair3d` / `beard3d`.

## 3. Preuves QA (Sarah)

- Captures Chromium WebGL en gros plan (combattants rapprochés,
  caméra zoomée) : Brax (cheveux longs + barbe pleine) contre Zara-nova
  (chignon + lunettes), Zara (tresses encadrant le visage) contre
  Sora (cheveux blancs longs sous chapeau de mage), Krak (mohawk orc)
  contre Drakar (barbe rousse en trois volumes) — zéro erreur.
- Smoke + gate QA verts ; contrôle statique n°38 ; seuils d’anatomie
  V7 toujours respectés (la géométrie ajoutée reste marginale).
- Limites honnêtes : les visages restent procéduraux (yeux/nez/bouche
  en volumes simples) ; les expressions faciales dynamiques 3D sont
  une étape ultérieure possible.

---
✍️ Jeu créé et signé par **Gédéon - Godson** © 2026 — Libreville, Gabon
