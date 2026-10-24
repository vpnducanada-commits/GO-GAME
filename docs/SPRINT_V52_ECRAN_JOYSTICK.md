# 🕹️ SPRINT V5.2 — « Écran Adaptatif & Joystick Pro »

**Release :** Godson FURY ARENA 5.2.0  
**Date :** 24/10/2026  
**Directive du propriétaire :** préférer un **joystick à gauche**, ajuster encore le **format du jeu**, l’écran visuel et les touches, et **consulter toute l’équipe**.

## Consultation d’équipe et arbitrage

| Membre | Position défendue | Décision retenue |
|---|---|---|
| **Lena — UX plein écran** | Le pouce gauche doit trouver le déplacement sans regarder ; les contrôles doivent vivre aux bords réels du téléphone, pas seulement dans le cadre 16:9. | Joystick fixe, grand et translucide en bas à gauche ; actions en bas à droite ; ancrage aux bords physiques et aux *safe-areas* en mode Adaptatif/Plein. |
| **Nadia — Design** | Un joystick de jeu de combat doit couvrir course, saut, garde et diagonales sans perdre les techniques avancées. | Mapping 8 directions : gauche/droite, haut = saut, bas = garde/modificateur. Le Dash garde son bouton dédié pour le Godson Cancel. |
| **Kenzo — Rendu** | Interdiction d’étirer les personnages ou de changer la physique selon l’appareil : cela dégraderait l’image et casserait le déterminisme Online/replays. | Simulation logique toujours **1280×720**. Trois cadrages d’affichage : **Adaptatif** (défaut), **Cinéma 16:9**, **Plein cadre** recadré sans déformation. |
| **Marco — Personnages** | Le centre doit rester libre pour lire les corps et les impacts ; le bouton M1 doit être le plus facile à marteler. | Contrôles semi-transparents dans les coins ; **POING • M1** est le plus grand bouton du cluster droit. |
| **Sarah — QA** | Le tactile doit survivre au vrai multi-touch : joystick + attaque simultanés, relâchements partiels, rotation, perte de focus. | Suivi par `pointerId`, capture du pointeur, retour au neutre sur `pointerup/cancel/lostpointercapture`, nettoyage global et simulations de combat automatisées. |

**Arbitrage du manager :** le format **Adaptatif** devient le défaut. Il donne la meilleure image (scène 16:9 nette, jamais étirée) tout en plaçant les pouces sur les vrais bords de l’appareil. Le propriétaire peut changer de format dans **Réglages → Format d’écran** ; le choix est sauvegardé dans le profil.

## Joystick gauche — mapping officiel

| Inclinaison | Entrée moteur | Usage |
|---|---|---|
| Zone morte `< 0,16` | neutre | Évite les micro-déplacements involontaires |
| `x < -0,38` | gauche | Reculer / courir à gauche |
| `x > 0,38` | droite | Avancer / courir à droite |
| `y < -0,58` | saut | Saut vertical ou diagonal avec gauche/droite |
| `y > 0,52` | garde / accroupi | Garde, parry, modificateur Uppercut/Balayage |

Le bouton central suit le pouce dans la base, la bordure devient dorée pendant le contact et l’interface tactile gagne en opacité pendant l’action. Les anciens boutons tactiles Gauche/Droite/Saut sont supprimés.

## Cluster droit — pouce d’action

Disposition finale, du geste secondaire vers le geste principal :

- rangée haute : **SPÉCIAL**, **DASH** ;
- rangée basse : **Garde**, **PIED**, **POING • M1** (plus grand).

Le joueur peut donc tenir une direction au joystick tout en martelant le M1, exactement comme demandé en V5.1. Le bouton Garde reste aussi disponible à droite pour un parry rapide sans tirer le joystick vers le bas.

## Formats d’écran

| Format | Comportement | Recommandation |
|---|---|---|
| **Adaptatif** *(défaut)* | Scène 16:9 nette et centrée ; fond d’ambiance sur tout l’appareil ; HUD aligné sur la scène ; joystick et actions aux bords physiques. | Téléphones 19:9/20:9/21:9, tablettes et écrans larges. |
| **Cinéma 16:9** | Cadre 16:9 classique centré ; contrôles à l’intérieur du cadre. | Joueurs qui préfèrent la présentation V4/V5.1. |
| **Plein cadre** | La scène remplit tout l’écran par recadrage `cover`, sans étirement. | Immersion maximale ; sur un écran plus étroit que 16:9, une partie latérale peut être rognée. |

Correctifs associés : `viewport-fit=cover`, variables `--stage-w/--stage-h`, HUD/combos/annonces alignés sur le rectangle réel de scène, respect des encoches et coins arrondis, et comportement plein écran sans déformation.

## Preuves QA (Sarah)

- **371 assertions source / 606 vérifications** vertes.
- Simulation de combat réelle : joystick à droite → Joueur 1 avance de **500 → 573** ; joystick vers le haut → saut ; joystick vers le bas → garde.
- Diagonale haut-gauche = gauche + saut simultanés ; relâchement = retour complet au neutre.
- Les trois formats commutent sans recharger la page et le choix est persisté dans les réglages.
- Contrôle statique **n°29** ajouté à `tools/qa-check.py` ; bundle autonome **431 Ko** (budget 448 Ko).
- Capture de disposition relue par l’équipe : joystick et actions restent dans les coins, les combattants demeurent dégagés au centre.

## Invariants préservés

- Aucun changement de hitboxes, physique, dégâts, M1, IA ou progression.
- Les entrées finales restent des masques numériques : replays et Online déterministes inchangés.
- Le clavier, les manettes et le mode 2 Joueurs local restent intégralement disponibles.
