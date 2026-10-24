# 🌄 SPRINT V3.2 — « Paysage & Interface Épurée »

**Retour du propriétaire** : « Je veux que ça se joue en paysage et non en portrait,
et il y a trop de textes unitiles. Il y a une saturation, une mauvaise disposition
des textes. »

**Décision d'équipe (Manager + Nadia + Kenzo + Sarah)** : chantier de présentation
uniquement. Aucun changement de gameplay, de physique, de déterminisme ou de
protocole Online. Tous les identifiants DOM utilisés par le JavaScript sont
conservés (vérifié par le contrôle d'alignement des IDs de la gate QA).

## 1. Le jeu se joue en paysage

- **Scène bornée par la hauteur** : `#gameWrap` a pour largeur
  `min(100%, (100dvh - 118px) × 16/9)` — l'arène entière est visible sans
  défilement, en conservant le vrai ratio 16:9 (l'ancien correctif mobile
  étirait le canvas en 70vh : supprimé).
- **Écran « Tourne ton appareil »** (`#rotateHint`, CSS
  `@media(orientation:portrait) and (max-width:860px)`) avec icône animée :
  - **⛶ Plein écran paysage** → `requestImmersiveLandscape()` : plein écran
    sur la scène + tentative `screen.orientation.lock('landscape')` en
    best effort (tous les échecs sont silencieux) ;
  - **Continuer en portrait** → classe `allowPortrait` : le choix du joueur
    est respecté pour la session.
- **Pause protectrice** : `handlePortraitChange()` met le combat en pause si
  l'appareil passe en portrait pendant un `fight` local — jamais en ligne
  (lockstep) ni pendant un replay.
- **Mode cinéma** (`orientation:landscape` + hauteur ≤ 580 px) : en-tête
  compact, pied de page masqué, scène à `100dvh - 54px`, menus resserrés.
- **Plein écran** : `#gameWrap:fullscreen` occupe 100 % de l'écran ; le chip
  d'en-tête devient « ⛶ Paysage ».

## 2. Cure de textes (anti-saturation)

Supprimés :
- les **4 cartes d'aide** sous la scène (doublon intégral de « Comment jouer ») ;
- le **pied de page géant** → 1 ligne signature ;
- les notes de bas de panneau (Hall of Fame, Replays, Défis) ;
- les signatures répétées (VS, Histoire, Pause) et le badge « VERSION 2.8 » périmé ;
- le sous-titre d'en-tête, les libellés « ARÈNE / AMBIANCE » et la légende
  détaillée de l'énergie dans le HUD.

Condensés :
- menu principal : bannières Histoire/Online et 5 cartes de mode en quelques mots ;
- panneau GO GAME : titres courts, statuts et listes vides en une ligne ;
- aide « Comment jouer » resserrée (4 blocs compacts + 1 astuce) ;
- textes dynamiques : ligne de carrière du menu, progression Histoire,
  résumé Replays, toasts les plus longs ;
- techniques du combattant à la sélection : repliées sous
  `<details><summary>` (contenu généré par `renderMoveList` inchangé).

## 3. Validation (Sarah)

- **221 assertions source / 250 vérifications affichées**, suite verte :
  présence de l'écran de rotation et de ses boutons, logique paysage
  appelable sans crash sans API navigateur, classe `allowPortrait`,
  absence de `.helpBar`, footer < 130 caractères, règles CSS
  portrait/paysage/`:fullscreen`, techniques repliées, menu complet.
- Gate `tools/qa-check.py` : contrôle permanent n°16 « Paysage &
  interface épurée V3.2 » + alignement des IDs DOM inchangé (181 → nouvel
  inventaire sans référence cassée).

## Prochain cap
Sprint 09 « Compétition locale » — voir `docs/ROADMAP.md`.
