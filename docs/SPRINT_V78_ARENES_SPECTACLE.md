# 🎇 SPRINT V7.8 — « Arènes Spectacle »

**Objectif** : après les corps (V7.4 → V7.7), donner aux quatre arènes 3D
la profondeur et la vie d'une vraie scène de spectacle, sans jamais
masquer les combattants ni toucher à la simulation.

**Équipe** : Nadia (direction des décors), Kenzo (rendu), Sarah (QA et
budgets), Manager (arbitrages et release).

## Ce qui a été fait

### État de spectacle partagé — `arenaSpectacleState3D()`
Calculé une fois par frame (cache par `renderTicker`, arène et ambiance) :
intensité dérivée de la vie restante, des combos, de l'énergie, des
impacts récents et des fins de round (`celebration` = intensité 1).
Télémétrie : `arenaSpectacle3d`, `spectacleBeams3d`,
`spectacleActors3d`, `spectaclePulse3d`, `ambientMotes3d`.

### Couche dynamique — `addArenaSpectacle3D(opaque, trans)`
Injectée dans `draw3DScene()` avant les combattants, tout se joue
derrière ou au-dessus de la zone de combat :
- **Stade** : vague de bras synchronisée sur les mêmes sièges que la
  foule statique (jusqu'à 42 supporters animés), égaliseur 9 barres et
  ligne de balayage sur l'écran géant.
- **Tokyo** : second train qui traverse la ville (fenêtres éclairées,
  phare), halos de lampadaires qui respirent.
- **Temple** : 12 braises dorées en ascension lente.
- **Libreville** : pirogue à voile qui navigue (roulis, sillage) et
  écume qui avance sur le rivage.
- **Faisceaux** : deux plans croisés à alpha dégradé + flaque au sol +
  halo source, par projecteur (stade, Tokyo, temple).

### Profondeur statique
Sièges continus et foule étoffée (épaules sur les 2 premiers rangs,
bras au repos, plus de casquettes), tribunes de retour, arche technique
et enceintes au stade ; skyline lointaine à Tokyo ; pagodes et collines
au temple ; caps boisés et lanternes de front de mer à Libreville.

### Lumière vivante
Pulsation globale légère, remplissage tokyoïte qui cycle cyan↔rose la
nuit, scintillement chaud des lanternes du temple, et poussières
d'ambiance (14/24/36 selon qualité) dans le programme de points existant.

## Réglages après relecture des captures (Chromium + WebGL)
1. Rayons du temple trop larges et croisés façon « vitres » → alpha
   divisée par deux, largeur réduite, cibles rendues parallèles
   (formule ancrée sur la source, balayage ±1,25 m).
2. Pirogue « flottant à l'horizon » → rapprochée (z = −6,4), agrandie
   ×1,5 et dotée d'un sillage.
3. Épaules de foule limitées aux deux premiers rangs : le stade passe
   de 66 189 à **61 005 sommets** en scène complète.

## Budgets (Sarah)
- Dynamique borné par `qualityLevel` (bras 18/30/42, braises 7/12,
  poussières 14/24/36) ; faisceaux coupés en qualité 0 hors célébration.
- Bundle : 720 894 octets (703 Ko affichés par la QA), sous le plafond
  de 704 Kio — marge quasi nulle, tout ajout futur devra être compensé.

## Validation
- Smoke source et bundle : **491 assertions / 727 vérifications ✅**
  (6 nouvelles assertions V7.8, dont hash déterministe inchangé pendant
  le spectacle et les 4 arènes mesurées).
- Gate QA statique : contrôle n°41 ajouté, **RELEASE AUTORISÉE**,
  0 refus, 0 avertissement.
- Captures WebGL relues : stade (61 005 sommets, 2 faisceaux, 27
  acteurs, pulse 0,88), Tokyo (38 277), temple (28 750), Libreville
  (28 208) — `ERRORS []`.

## Périmètre garanti
Rendu seul : simulation, hitboxes, dégâts, M1, replays, lockstep
Online, 2v2 local et sauvegardes strictement inchangés. Repli 2D
Graphismes AAA II conservé intégralement.
