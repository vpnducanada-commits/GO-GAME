# 📐 SPRINT V7.12 — « Lancement & Disposition »

**Retour du propriétaire** : « Impossible de lancer le jeu car
l'affichage, la disposition ne sont pas optimales. »

**Équipe** : Lena (coque et parcours), Kenzo (viewport/canvas),
Sarah (matrice d'écrans et veto), Manager (arbitrages).

## Audit navigateur — 9 tailles, avant correction

| Écran | Boot | Menu principal | Verdict |
|---|---|---|---|
| 568×320 → 915×412 (paysage) | bouton visible mais contenu rogné haut/bas (395–427 px utiles) | **bouton Bot à 471–500 px** : sous l'écran, menu de 916–1 097 px à défiler | ❌ modes inaccessibles au premier écran |
| 360×640 / 390×844 (portrait) | OK | **écran « Tourne ton appareil » sans issue** si le plein écran/rotation échoue | ❌ joueur piégé |
| 1280×720 | OK | Bot visible (583 px) | ✅ |
| 1366×640 | OK | Bot coupé en bas (571–665 px) | ⚠️ |

Causes : titre + hub carrière + deux bannières (~480 px) avant les
modes ; `touch-action:none` sur la scène qui gêne le défilement des
panneaux ; boot dimensionné en pixels fixes ; demande de plein écran
à **chaque** toucher ; verrouillage d'orientation tenté avant l'entrée
effective en plein écran ; aucune issue si la rotation est refusée.

## Corrections
- **Boot compact garanti** : tailles en `vh`, astuce/signature masquées
  sous 500 px de haut, badge retiré sous 350 px, défilement possible —
  contenu mesuré de 89→231 px en 568×320 (tout visible).
- **Menu en un écran jusqu'à 700 px de haut** : titre sur une ligne
  (retiré sous 430 px), hub carrière en une rangée, bannières
  compactes, modes en 4 colonnes — le bouton Bot passe de ~500 px à
  **239–242 px** sur les téléphones en paysage.
- **Défilement tactile réel** : `touch-action:pan-y` sur overlays,
  rosters et panneaux — glisser mesuré de +87 à +251 px.
- **Portrait sans piège** : bouton « Jouer quand même » → affichage
  adapté (scène 16:9 centrée **non étirée**, menus plein format,
  contrôles aux bords) ; le paysage reste recommandé et tenté d'abord.
- **Plein écran fiable** : attente de l'entrée effective avant le
  verrouillage d'orientation, tentatives automatiques espacées de
  2,5 s (fini la demande à chaque toucher).
- **Viewport réel** : `--app-w/--app-h` synchronisés sur
  `visualViewport` (barres navigateur mobiles), replis `vh/vw` pour
  les navigateurs sans `dvh` ; télémétrie `layoutMode`/`viewportBox`.

## Validation après correction (même matrice)
- Boot : bouton visible et cliquable sur les **9/9 tailles**, contenu
  complet partout.
- Menu : bouton Bot visible et frappable **sans défiler** sur 8/9
  tailles (1366×640 inclus après extension du compact à 700 px).
- Parcours complet **boot → menu → personnages → arène → difficulté →
  VS → combat** réussi en 568×320, 915×412, **360×640 portrait
  adapté** et 1280×720 — 3D active, HUD et tactile affichés, zéro erreur.
- Smoke source + bundle : **515 assertions / 751 vérifications ✅** ;
  gate QA n°45, **RELEASE AUTORISÉE**, 0 refus, 0 avertissement.
- Bundle : 741 232 octets (723 Ko) — plafond porté à **736 Ko** par
  arbitrage d'équipe (un jeu qui se lance partout prime).

## Périmètre garanti
Disposition et lancement seuls : simulation, graphismes 3D, squelette,
Online, replays et sauvegardes inchangés. Le paysage reste l'expérience
de référence ; le portrait adapté est un filet de sécurité, pas le mode
principal.
