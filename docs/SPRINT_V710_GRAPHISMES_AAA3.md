# 🎬 SPRINT V7.10 — « Graphismes AAA III »

**Demande du propriétaire** : « On va continuer à travailler sur le
graphisme. » L'équipe cible ce qui se voyait encore sur les captures
V7.9 : grain dur des matières, bustes et têtes trop lisses façon
mannequin, ciel plat et sols sans vie.

**Équipe** : Nadia (direction artistique/couleurs), Kenzo (shader et
rendu), Marco (silhouettes), Sarah (captures, budgets et veto).

## Lumière cinéma & matières (Kenzo)
- Réponse de l'atlas adoucie et grain par matière réduit (la peau
  presque sans grain) ; bump divisé par deux — les robes et visages ne
  « pixellisent » plus en damier.
- Ciel ambiant teinté, reflets d'environnement au Fresnel atténués
  dans l'ombre, *sheen* des tissus **teinté par l'albédo**, spéculaire
  large de peau, occlusion au sol moins noire, brume de profondeur
  rapprochée (12→38 m) et grade ACES rééquilibré.
- Piège reproduit en capture puis corrigé avant release : un *sheen*
  indépendant de la couleur lavait les sols rugueux au magenta/bleu
  (stade rose, sable de Libreville violet). Après teinte par l'albédo,
  chaque sol retrouve son identité.

## Silhouettes sculptées (Marco)
- Buste : pectoraux, ventre, dos aplati et trapèzes intégrés à la
  section du loft — aucun volume plaqué, aucun os déplacé.
- Tête : plan facial affirmé, pommettes, arcade sourcilière, crâne
  arrière et mâchoire affinée ; orbites douces, narines et ligne de
  cheveux frontale (fini l'effet casque posé).
- Membres : galbes renforcés à sections elliptiques (cuisses,
  mollets, bras, avant-bras), longueurs V7.9 strictement conservées.

## Ciel & sols (Nadia)
- Halos doux autour du soleil et de la lune, étoiles 3D (28/46/64
  selon qualité) et cinq couches de nuages/brumes par arène.
- Reflets doux et colorés des deux combattants sur les sols
  brillants, atténués avec la hauteur ; projectiles à cœur blanc,
  halo et traînée conique.

## Validation (Sarah)
- Captures Chromium relues sur les quatre arènes, avec **deux passes
  de réglage couleur** (teinte d'ambiance, puis *sheen*) et halo
  solaire adouci ; 3D active partout, zéro erreur console.
- Sommets mesurés : stade 68 247, Tokyo 42 156, temple 37 784,
  Libreville 32 746 — budgets tenus, ciel réduit en qualité basse.
- Squelette V7.9 intact : écart d'os ≤ 0,1 % sur les scènes mesurées.
- Smoke source + bundle : **503 assertions / 739 vérifications ✅** ;
  gate QA n°43, **RELEASE AUTORISÉE**, 0 refus, 0 avertissement.
- Bundle : 730 581 octets (713 Ko), sous le plafond de 720 Ko.

## Périmètre garanti
Visuel pur : simulation, hitboxes, dégâts, M1, replays, lockstep,
Online, 2v2 local, sauvegardes et squelette IK inchangés.
