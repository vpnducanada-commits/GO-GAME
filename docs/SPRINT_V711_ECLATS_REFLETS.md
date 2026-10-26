# ✨ SPRINT V7.11 — « Éclats & Reflets »

**Demande du propriétaire** : « Continuez » (travail sur le graphisme).
L'équipe pousse la lumière et les détails visibles en combat rapproché,
sans toucher au squelette IK V7.9 ni au shader cinéma V7.10.

**Équipe** : Kenzo (reflets/éclats), Marco (visages/cheveux/tenues),
Nadia (brillances par arène), Sarah (captures, budgets, veto).

## Reflets directionnels (Kenzo + Nadia)
- Les ellipses fixes de la V7.10 deviennent des **traînées orientées
  par la direction de la lumière** : couche large douce + cœur fin,
  dégradé d'alpha du combattant vers la caméra, atténuation avec la
  hauteur du saut.
- Brillance propre à chaque arène : **Tokyo 1** (verre), **Stade 0,9**,
  **Temple 0,45** (pierre), **Libreville 0,3** (sable mat) —
  télémétrie `reflDir3d`, deux combattants reflétés en permanence.
- Flaques de lumière statiques aux zones de départ, teintées par la
  ligne d'arène.

## Éclats (Kenzo)
- Halo extérieur lissé autour des projectiles et des impacts,
  aura volumique douce à pleine énergie (100) autour du buste.
- Première passe relue en capture : le halo d'impact faisait « bulle
  facetée » — détail relevé (sphère lisse) et alpha réduit avant release.
- Comptage `glow3d` remis à zéro à chaque frame : aura + projectile +
  impact = 3 éclats mesurés sur la scène de référence.

## Visages, cheveux et tenues (Marco)
- Paupière basse et angles de mâchoire ; couronne et mâchoire de la
  tête sculptée affinées, pommettes déjà posées en V7.10 conservées.
- Cheveux en **mèches de reflet** (dessus de tête et longueurs,
  teinte éclaircie), favoris pour les barbes fournies — le tout
  supprimé en qualité basse, compté par `hairDetail3d`.
- **Emblème de tenue des planches en relief** sur la poitrine : orbe,
  losange ou plaque selon le motif officiel des 41 fiches (`emblem3d`).

## Validation (Sarah)
- Captures Chromium relues : Tokyo (projectile + impact + aura,
  reflets miroir), stade en gros plan, temple (barbes au couchant) —
  3D active, zéro erreur, os à **≤ 0,1 %** d'écart.
- Sommets : stade 69 515, Tokyo 45 421, temple 39 986.
- Smoke source + bundle : **509 assertions / 745 vérifications ✅** ;
  gate QA n°44, **RELEASE AUTORISÉE**, 0 refus, 0 avertissement.
- Bundle : 734 035 octets (716 Ko), sous le plafond de 720 Ko —
  marge restante faible : tout ajout futur devra être compensé.

## Périmètre garanti
Visuel pur : simulation, hitboxes, dégâts, M1, replays, lockstep,
Online, 2v2 local, sauvegardes et squelette IK inchangés.
