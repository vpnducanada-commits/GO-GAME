# Sprint V4.0 — « Arcade plein écran & anatomie HD » (24 octobre 2026)

**Directive du propriétaire :** quitter le statut de mini-jeu pour viser un véritable jeu de combat
(inspirations citées : King of Fighters, Marvel vs Capcom, Street Fighter, Tekken). Deux griefs précis :
(1) les personnages restent dans l'ancien style au lieu du style professionnel/réaliste des planches ;
(2) seule une partie de l'écran est manipulable, le reste montre des paramètres/panneaux perçus inactifs.
L'équipe doit être renforcée et tout faire minutieusement, en autonomie.

## Équipe renforcée

- **Manager** — direction V4, architecture, intégration, release.
- **Nadia** — gameplay : garantir que la refonte ne touche ni équilibrage, ni hitboxes, ni déterminisme.
- **Kenzo** — moteur de rendu : volumes, caméra, pipeline 60 fps.
- **Sarah** — QA : suite d'exécution, gate statique, captures, veto release.
- **Marco (nouveau)** — direction artistique personnages : anatomie, tenues signatures, relecture des captures.
- **Lena (nouveau)** — UX plein écran : coque arcade, navigation, suppression des zones mortes.

## Chantier 1 — Coque arcade plein écran (Lena)

Diagnostic : l'ancienne page réservait une bande au titre/boutons et un pied de page ; la scène était
calculée dans l'espace restant (`100dvh - 118px`), d'où l'impression de « moitié d'écran ».

- `#app` devient une coque fixe **100 dvw × 100 dvh**, sans défilement ni largeur maximale.
- La scène prend la **plus grande surface 16:9 possible** : `min(100dvw, 100dvh×16/9)` ×
  `min(100dvh, 100dvw×9/16)`, centrée sur un fond d'ambiance sombre (letterbox propre, jamais d'étirement).
- La barre système (logo, stats, Réglages, Tactile, Paysage, Pause) est **déplacée dans la scène**,
  en verre dépoli compact ; elle **disparaît en combat sur tous les écrans** (plus seulement mobile
  paysage), seule la pause flottante reste. Pied de page supprimé de l'affichage.
- Correctif associé : les canvas de portraits/aperçus passent en `position:static`
  (le sélecteur global `canvas` les positionnait en absolu).

## Chantier 2 — Anatomie HD inspirée des planches (Kenzo + Marco)

- Proportions adultes : tête 17→**14,5–16 px**, hanches −79→−86, épaules −129→−140, tête −152→−166 ;
  IK jambes 42/41→**46/45**, bras 34/33→**37/36** ; présence visuelle ×1,08.
- Matières : chaque membre reçoit une **ombre portée + une lumière rasante** (volume cylindrique),
  contours adoucis (0,38 d'opacité), bande latérale de pantalon, reflets et fantômes réalignés.
- Tenues signatures par style : plastron Guerrier/Titan, circuits + cœur AEL-7, liserés dorés Sora,
  écharpe royale Prime, sash Kira, orbites Nova, vague Zara, bandes Héros — compteur QA `outfitDetails`.
- Caméra combat : zoom **0,88–1,34×** (1,42× intro/fin de round), cadrage horizontal adaptatif
  selon la demi-vue réelle ; menus à 1,06×. Les combattants occupent enfin le cadre.

## Garanties (Nadia + Sarah)

- 100 % présentation/rendu : physique, hitboxes, IA, équilibrage, replays déterministes,
  sauvegardes et netcode lockstep **inchangés** (la suite complète le prouve, replays hashés inclus).
- **287 assertions source / 331 vérifications**, 2 passages verts ; gate QA contrôle permanent n°22.
- Captures relues par Marco/Kenzo : grille des 9 cartes V4 et vrai duel Kael vs AEL-7 (zoom 1,34×).
- Bundle autonome : 342 Ko (budget 352 Ko conservé), zéro ressource externe en local.

## Trajectoire V4 (décidée en équipe)

- **V4.1 Peinture & tenues avancées** : motifs par personnage (armures gravées, tissus, reflets métal),
  écran VS avec portraits plein corps, intro de round plus cinématographique.
- **V4.2 Compétition locale** : tournoi en tableau, défi tournant, récompenses cosmétiques (ex-Sprint 09).
- **V4.3 Online public** : matchmaking et spectateurs — après validation d'un duel WebRTC réel
  entre deux appareils/réseaux distincts (seule action encore attendue du propriétaire).
