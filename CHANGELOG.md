# 📜 CHANGELOG — Godson FURY ARENA *(anciennement GÉDÉON - Godson ARENA / GO GAME)*

Toutes les versions officielles du jeu, de la plus récente à la plus ancienne.
Gestion de projet : Manager & Développeur principal (Assistant Arena) • Propriétaire : Gideon - Godson.

## [7.6.0] — 2026-10-25 — « Mobilité Dynamique »

Demande directe du propriétaire : continuer le travail et rendre la
mobilité **plus fluide et plus dynamique**. Le sprint agit à la fois sur
la sensation de contrôle, l’animation à la fréquence réelle de l’écran
et les caméras, sans réintroduire de gel d’impact.

### Amélioré — Contrôle et déplacements (Nadia + Kenzo)
- Nouveau profil `MOBILITY76.dynamic` : accélération et freinage plus
  nets, demi-tour plus franc, course progressive plus rapide, contrôle
  aérien renforcé et élan mieux conservé pendant les attaques au sol.
- Sauts plus lisibles : montée tenue légèrement allégée, apex bref et
  descente plus franche ; coyote-time porté à 8 frames.
- Dash porté à 13 frames et 12,9 px/frame de cible, avec fantômes à
  chaque tick et nouvelles traînées de vitesse en 3D.
- Tampons d’entrée élargis (saut/dash 11 frames, attaques 12, double
  tap 21) pour le tactile et les écrans rapides.
- Contact corporel amorti avec transfert de correction au mur, afin
  d’éviter les micro-sauts quand les combattants se collent.
- Les replays antérieurs à la V7.6 utilisent le profil `legacy` exact
  de la V7.5 : leurs checkpoints et leur hash restent vérifiables.

### Amélioré — Animation et caméras (Kenzo)
- **Foulée anti-patinage** : `gaitPhase` avance avec la distance
  interpolée réellement affichée, en 2D comme en 3D.
- **Attaques fractionnaires** : `attackFlow` interpole la phase entre
  deux ticks 60 Hz pour les écrans 90/120 Hz.
- Ressorts `turnPulse`, `takeoffPulse`, `landingPulse`, `airPitch` et
  `accelLean` : appuis de pivot, étirement au décollage, compression à
  la réception et inclinaison aérienne continue.
- Caméras avec anticipation de vitesse ; la caméra 3D est amortie et
  recule/relève son cadre pour garder un saut complet dans l’image.

## [7.5.0] — 2026-10-25 — « Visages & Costumes »

Suite de la trajectoire graphique du propriétaire : après les postures
et les attaques individuelles (V7.4), les têtes et les costumes des 41
combattants gagnent en identité en 3D, toujours en rendu seul.

### Amélioré — Cheveux sculptés par style (Marco + Kenzo)
- La coiffe n’est plus un « casque » unique : plaquée pour les crânes
  rasés, abaissée sous la crête des mohawks, et panneau arrière descendu
  pour les cheveux longs, carrés et tresses.
- **Mèches d’encadrement** le long des joues pour les coiffures longues
  (long, bob, queue de cheval, tresses, chignon) : de face en 3/4, plus
  aucun héros ne semble chauve.
- Le **chignon** (Zara-nova) est enfin dessiné, avec son bandeau accent.

### Amélioré — Barbes, visages et costumes (Marco)
- Barbes en **trois volumes** (menton, joues, pointe longue) proportionnels
  à la fiche : Brax et Drakar portent de vraies grandes barbes.
- **Peintures de guerre** verticales sur les joues des orcs et aliens.
- **Ceintures-écharpes** contrastées avec boucle pour les tenues
  martiales et d’exploration (kunoichi, assassin, samouraï, ranger,
  manteaux de mage/assassin, exploratrice, pirate, cuir).
- Télémétrie `renderStats.hair3d` / `beard3d`. Aucun changement de
  simulation, de hitboxes, de replays ni d’Online.

## [7.4.0] — 2026-10-25 — « Identités de combat »

Demande directe du propriétaire, captures de référence à l’appui :
« Travaille sur chaque personnage individuellement, pour que chacun ait
ses attaques, sa posture, etc. » Chaque héros doit se reconnaître à sa
silhouette avant même de lire son nom.

### Ajouté — 41 fiches de posture individuelles (Marco)
- Nouvelle table `FIGHTER_STANCE3D` : **une fiche nommée par combattant**
  (« Mur de Fer » pour Titan, « Méditation Basse » pour Taiko, « Voie du
  Vent » pour Kazu, « Lune »…), avec écart et largeur des pieds,
  accroupissement de garde, inclinaison, hauteur des deux mains, rebond
  d’attente et torsion du buste (des colosses carrés face caméra aux
  escrimeurs presque de profil).
- Les fiches sont appliquées par `buildFighterPose3D` : au repos, en
  marche, en garde et en l’air, chaque combattant tient son corps — et
  donc son arme, ancrée à la main — différemment.

### Ajouté — Attaques au style de chacun (Marco + Kenzo)
- **7 styles de poing** : jab, cross, crochet large, uppercut, paume,
  revers, lame descendante et visée à deux mains pour les tireurs.
- **7 styles de pied** : devant, circulaire, latéral, hache (très haut),
  bas, genou et retourné — la hauteur et l’angle du pied changent
  réellement d’un héros à l’autre.
- **4 poses de spécial** : orbe à deux mains, visée, frappe écrasée
  depuis le haut et taille de lame.
- Les chaînes M1 Signature individuelles (V5.1) héritent de ces poses :
  marteler POING ne produit plus la même silhouette selon le héros.

### Ajouté — Postures d’affiche à la sélection (Marco + Lena)
- Comme sur les captures du propriétaire, chaque carte de sélection et
  chaque aperçu VS fige le héros dans **sa** posture : accroupi prêt à
  bondir, en garde, poing tendu, pied levé ou en train de lancer un sort.
- 100 % rendu : hitboxes, dégâts, timings, IA, replays, hash
  déterministe, Online et Tournoi sont inchangés ; télémétrie
  `renderStats.stance3d` pour le diagnostic.

## [7.3.0] — 2026-10-25 — « Plein écran forcé & Sélection claire »

Sprint d'affichage ordonné par le propriétaire à partir de ses captures de
référence : le jeu doit s'ouvrir directement en plein écran paysage, les
menus perdent leurs textes inutiles (M1, Signature, descriptions) et la
sélection doit montrer les combattants plein corps — posture, membres,
visages et armes lisibles d'un coup d'œil, comme sur ses images.

### Modifié — Plein écran paysage forcé (Lena)
- L'écran de chargement devient un écran-titre : à 100 %, un grand bouton
  **▶ ENTRER DANS L'ARÈNE** attend le geste du joueur (les navigateurs
  interdisent le plein écran sans interaction). Le toucher déclenche
  immédiatement plein écran + verrouillage paysage.
- Sur tactile, tout contact ultérieur sans plein écran relance
  l'immersion ; le dialogue « Tourne ton appareil » n'offre plus de
  bouton « Continuer en portrait » : en portrait téléphone, le jeu est
  bloqué jusqu'à la rotation.

### Modifié — Menus épurés (Lena)
- Menu principal : icône + nom court uniquement. Disparaissent les
  descriptions des modes, la ligne « M1 SIGNATURE • TOURNOI & SAISONS »,
  les mini-notes et les textes secondaires du hub (le rang, le niveau,
  les Godson et la barre XP restent, façon compteur de monnaie des
  captures du propriétaire).
- Le bandeau défilant de fond ne dit plus que « Godson FURY ARENA ✦
  COMBAT 1V1 ✦ LIBREVILLE ».

### Modifié — Sélection plein corps (Kenzo + Marco)
- Cartes de combattants agrandies (figurines plein corps zoomées,
  bordures aux couleurs du héros) avec **le nom seul** — titres,
  statistiques, ligne M1 et panneau « Techniques » masqués.
- Aperçus latéraux agrandis (148 px) : grand combattant + nom, rien
  d'autre ; la carte secrète devient un simple cadenas « ??? SECRET ».
- Aucun changement de simulation, de roster, de M1 en combat, de
  replays, d'Online ou de Tournoi ; les données masquées restent dans
  le DOM pour les écrans qui en ont besoin.

## [7.2.0] — 2026-10-25 — « Réalité 3D II »

Sprint 100 % visuel ordonné par le propriétaire après V7.1 : rester sur la
3D — graphisme, réalisme, disposition, mouvements et affichage — plutôt que
d’ajouter des modes. Cinq passes de rendu relues image par image dans
Chromium/WebGL, sans toucher à la simulation déterministe, aux hitboxes,
aux dégâts, aux M1, aux replays ni au lockstep.

### Amélioré — Anatomie & silhouettes (Marco + Kenzo)
- Proportions recalculées sur des mensurations humaines : épaules ramenées
  d’environ 1,15 m à ~48 cm, torse aplati (profondeur poitrine ~25 cm),
  tête réduite de 20 %, cou, mains, bottes et épaulières rééquilibrés.
- Les multiplicateurs de fiches personnages sont normalisés autour de 1 :
  les 41 combattants gardent leur silhouette sans cumul d’échelle monstre.
- Suppression des volumes plaqués qui lisaient comme des disques ou des
  balles en profil (coques, pectoraux/abdominaux en sphères, revers,
  anneaux circulaires) ; la définition vient du loft du torse et des matières.
- Torse bicolore (panneaux latéraux et bas assombris), jupes/robes en
  anneaux volumiques réservées aux vraies robes, bottes et genouillères
  sombres, armes portées derrière l’épaule au repos.
- Garde plus humaine : main arrière relevée, torsion du haut du corps
  réduite, appuis resserrés, course et impacts inchangés côté simulation.

### Amélioré — Matières, lumière & caméra (Kenzo)
- Grain procédural par bruit de valeur dans le shader (albédo et rugosité),
  neuf familles de matières à l’atlas (pierre, béton, sable, bois, eau,
  verre…), spéculaire non métallique fortement réduit : fin du brillant
  « plastique » et des fusils délavés.
- Lumières d’arène par ambiance, ombres de contact renforcées sous les
  combattants, et caméra de combat plus basse, en léger 3/4, qui zoome
  selon la distance et suit les sauts.

### Amélioré — Arènes & affichage (Kenzo + Lena)
- Plateforme de combat panneautée au-dessus de la dalle, allées du stade,
  train de Tokyo, toits/plafonds du temple, écume segmentée et voilier de
  Libreville ; suppression des halos octogonaux et des cônes « tentes ».
- HUD de combat compact et semi-transparent : barres fines, pips et timer
  réduits — la zone de combat reste dégagée en paysage.
- Validation Sarah : quatre duels capturés en WebGL réel (Kael/Sora,
  Krak/Brutus, Vorak/AEL-7, Gédéon/Kira), zéro erreur d’exécution.

## [7.1.0] — 2026-10-24 — « Tournoi & Saisons »

Sprint de compétition locale qui suit la roadmap après l’Anatomie AAA : le
Championnat reste la tournée linéaire de la Carrière, tandis qu’un nouveau
mode **Tournoi** ajoute de vrais tableaux à élimination directe et une
progression de saison durable.

### Ajouté — Brackets locaux 4 / 8 / 16 (Nadia + Manager)
- **Coupe Express** (4 participants), **Coupe Godson** (8) et **Coupe des
  Légendes** (16), avec difficultés et arènes progressives par tour.
- Entrants CPU uniques, cote de combattant transparente et ordre classique
  des têtes de série ; GODSON PRIME est garanti dans la Coupe des Légendes
  lorsque le joueur ne l’a pas choisi.
- Les matchs du joueur utilisent la simulation normale. Les autres affiches
  sont résolues par un hash déterministe propre à la graine du bracket et
  une probabilité fondée sur l’écart de cote, sans toucher au hasard des
  replays ni au lockstep.
- En cas d’élimination, le reste du tableau est simulé jusqu’au champion
  CPU ; le classement du joueur reste enregistré et consultable.

### Ajouté — Saison 1 « Aurore de Libreville » (Nadia + Lena)
- Les points de saison sont attribués **une seule fois, à la fin du
  tournoi**, selon le classement, plus 10 points par victoire du joueur.
  Abandonner un bracket ne donne aucun point.
- Cinq paliers à 100, 250, 500, 900 et 1 400 points offrent XP, Godson et
  trois titres équipables ; statistiques, historique et dernier bracket
  sont persistés localement.
- Quatre nouvelles quêtes de carrière couvrent le premier tournoi, le
  premier titre, 500 points de saison et la triple couronne des trois coupes.
- Une future saison archivera l’ancienne avant réinitialisation ; la Saison 1
  n’expire pas automatiquement en V7.1.

### Ajouté — Interface de tournoi (Lena)
- Carte **Tournoi & Saisons** au menu principal, écran dédié avec formats,
  progression de saison, bracket horizontal par tour, actions et historique.
- Section Carrière, objectif prioritaire du hub lorsqu’un bracket est actif
  et retour direct au tableau après chaque match, sans revanche parasite.
- Le combattant peut changer avant le premier match, puis reste verrouillé ;
  adversaire, difficulté et arène du tour sont imposés par le bracket.

### Garanti
- **453 assertions source / 689 vérifications affichées** vertes et contrôle
  QA n°34 ; migration des anciens profils, reprise d’un bracket actif et
  protection anti-double-gain testées de bout en bout.
- Simulation déterministe, hitboxes, dégâts, M1, replays, Online 1v1,
  2v2 Relais local et repli 2D préservés.
- Bundle **655 Ko** (671 709 octets, budget V7 ≤ 704 Ko).
  Détail : `docs/SPRINT_V71_TOURNOI_SAISONS.md`.

## [7.0.0] — 2026-10-24 — « Anatomie AAA »

Sprint visuel majeur demandé après la V6.1 : dépasser l’aspect « poupée » et
viser une présentation 3D digne des grandes licences de combat, sans perdre
la fluidité ni le déterminisme du jeu.

### Ajouté — Personnages sculptés procéduralement (Marco + Kenzo)
- Torse en superellipse et tête en neuf niveaux, membres loftés avec profils
  musculaires distincts pour cuisses, mollets, bras et avant-bras.
- Visage volumique, mains avec doigts et pouce, bottes loftées, vêtements et
  mèches segmentés, joug d’épaules et accessoires des 41 maquettes conservés.
- Posture de combat en 3/4 : torsion progressive hanches → poitrine → tête,
  caméra rapprochée et proportions rééquilibrées après huit séries de captures.

### Ajouté — Matières, bump et ombres (Kenzo)
- Atlas procédural de huit matières (peau, tissu, cuir, métal, cheveux,
  technologie, énergie) et propriétés rugosité/métal/peau par sommet.
- Bump mapping par dérivées, avec voie WebGL2 en GLSL ES 3.00, extension
  WebGL1 et repli automatique ; éclairage PBR simplifié et ACES.
- Shadow-map PCF 3 × 3 cadencée selon la qualité pour protéger les FPS.

### Optimisé — Génération dynamique (Sarah + Kenzo)
- Écrivain de sommets sans allocations vectorielles, caches trigonométriques,
  sphères scalaires, transformation de pose mise en cache et LOD adaptatif.
- Dans Chromium headless, la génération CPU des paires de référence baisse
  d’environ 34 % à 48 % selon la qualité ; aucun asset externe n’est ajouté.

### Garanti
- **434 assertions / 669 vérifications** vertes, contrôle QA n°33 et cinq
  captures WebGL avec atlas, ombres et bump explicitement actifs.
- Hash déterministe, hitboxes, M1, replays, Online et 2v2 local inchangés.
- Bundle **602 Ko** (617 379 octets, budget V7 ≤ 704 Ko).
  Détail : `docs/SPRINT_V70_ANATOMIE_AAA.md`.

## [6.1.0] — 2026-10-24 — « Maquettes Vivantes & 2v2 deux téléphones »

Sprint correctif et multijoueur local issu des retours directs du propriétaire
après la V6.0 : plus aucun gel à l’impact, personnages formalisés d’après les
maquettes, interface fabriquée dans le décor et vrai **2v2 chacun sur son
téléphone**.

### Corrigé — Zéro gel d’impact
- Suppression complète des anciens gels de touche et du ralenti de K.O. dans
  le runtime ; la simulation avance dès la frame qui suit un coup confirmé.
- Lisibilité conservée par recul, animation corporelle, sons, étincelles,
  sprites d’impact et textes de dégâts. Smoke et QA verrouillent la régression.

### Ajouté — Maquettes Vivantes 3D (Marco + Kenzo)
- `BOARD_MODEL3D` décrit désormais explicitement les **41 combattants** :
  masse musculaire, poitrine/épaules/taille/hanches/cou, famille de corps,
  tenue ou armure, manches, cape, pans de tissu et peintures de guerre.
- Cheveux, barbes, oreilles, capuches, masques, couronnes, chapeaux, casques,
  dômes et têtes robot ; équipements de dos/ceinture et armes portées
  (épées, katana, dagues, haches, lances, bâtons, fusils et dispositifs).
- Muscles et membres renflés, plaques, tissus et accessoires sont générés en
  géométrie 3D ; résolution des IDs à casse mixte (`Zara`, `Lira`, `Kairos`,
  `Zara-Nova`) corrigée et testée pour qu’aucune fiche ne retombe en silence
  sur le modèle générique.
- Optimisations WebGL : caches couleur/nuance, batches et particules
  persistants, buffers dynamiques réutilisés ; captures à 4 draw calls.

### Ajouté — Interface construite dans le décor (Lena + Nadia)
- Quatre thèmes d’arène synchronisent accents, halos, panneaux et rails de
  toute l’interface via `--stage-*` : HUD en tableau suspendu, menus en
  consoles d’arène et tactile en pods latéraux, centre de combat dégagé.
- Menu principal ancré/compacté, minuteur protégé des découpes, carte locale
  regroupée (principal, format, réserviste, étapes, codes, lancement),
  favicon intégré et disposition relue en captures navigateur.

### Ajouté — 2v2 Relais sur deux téléphones (Nadia + Manager)
- Chaque joueur choisit **deux combattants distincts** sur son téléphone.
  Le perdant d’un segment est relayé par son réserviste ; première équipe à
  **deux éliminations** victorieuse. Équipes déterministes incluses aux
  replays et au hash de synchronisation.
- Liaison locale WebRTC/lockstep sur même Wi-Fi ou point d’accès, sans
  compte, sans Supabase et sans classement : invitation et réponse `GF61`
  compressées/base64url à copier ou partager, puis lancement confirmé par
  handshake ordonné `start → start-ready` afin qu’aucune entrée initiale ne
  soit perdue avant l’initialisation du lockstep.
- Le Bluetooth navigateur n’est pas présenté comme transport de combat :
  le partage système peut seulement transmettre les codes ; le duel passe
  par le réseau local.

### Garanti
- **426 assertions / 661 vérifications** vertes, contrôle QA n°32, captures
  WebGL et preuve Chromium en deux contextes (canal ouvert, plus de 220
  frames lockstep, aucune désynchronisation).
- Bundle **565 Ko** (578 724 octets, nouveau budget V6.1 ≤ 640 Ko).
  Détail : `docs/SPRINT_V61_MAQUETTES_2TELEPHONES.md`.

## [6.0.0] — 2026-10-24 — « Réalité 3D »

Pivot majeur demandé par le propriétaire après la V5.3 : les combats passent en
**vraie 3D temps réel**, avec des personnages volumiques, des arènes en
profondeur et une animation humaine articulée — sans modifier la simulation.

### Ajouté — Moteur 3D Réalité (Kenzo)
- Nouveau module `src/render3d.js` : WebGL maison sans dépendance, shaders,
  géométrie indexée, batches opaque/transparent/particules et cache d’arènes.
- Canvas WebGL derrière l’overlay 2D transparent : HUD, textes d’impact,
  vignette, bandeaux et post-traitement restent nets au-dessus de la scène.
- Caméra perspective de combat, éclairage directionnel/hémisphérique/spéculaire,
  rim light, brouillard, ombres de contact et lumières Jour/Crépuscule/Nuit.

### Ajouté — Personnages et mouvements humains (Marco + Nadia)
- Les 41 combattants deviennent des humanoïdes 3D articulés : torse, bassin,
  tête, visage, cheveux, bras/jambes en deux segments, genoux, coudes, gants,
  chaussures, capes, armures, couronne/visière et motifs de tenue.
- Poses dédiées pour respiration, course, saut, dash, accroupissement, garde,
  coups/M1, projections, réactions, chutes et victoire, pilotées par les mêmes
  courbes humaines que le moteur 2D.

### Ajouté — Quatre arènes en profondeur
- Stade avec tribunes/foule/grand écran, Néon Tokyo et ses immeubles lumineux,
  Temple Céleste à piliers/lanternes, Plage de Libreville avec océan, palmiers
  et voiliers. Projectiles, impacts, auras, boucliers et particules passent en 3D.

### Ajouté — Choix et sécurité du rendu (Lena + Sarah)
- Réglages → **Rendu de combat 3D** : Automatique (défaut), Toujours ou
  **2D classique**. Sans WebGL ou en cas de FPS durablement insuffisants en
  automatique, retour propre aux Graphismes AAA II avec diagnostic exposé.
- Simulation, hitboxes, dégâts, IA, replays, Online et progression inchangés ;
  hash déterministe prouvé identique avant/après génération des poses 3D.

### Garanti
- **398 assertions / 633 vérifications** vertes, contrôle QA n°31, captures
  WebGL réelles des 4 arènes relues, bundle **495 Ko** (budget V6 ≤ 512 Ko).
  Détail : `docs/SPRINT_V60_REALITE_3D.md`.

## [5.3.0] — 2026-10-24 — « Graphismes AAA II »

Cap visuel décidé par le studio après la V5.2 : **ancrer les combattants au sol**,
rendre chaque impact plus spectaculaire et porter les tenues des planches sur les
41 héros — sans toucher au gameplay.

### Ajouté — Ombres portées et lumière de sol (Kenzo)
- Ombres **directionnelles en 3 couches** selon Jour/Crépuscule/Nuit et l’arène,
  contacts séparés sous les pieds, rétrécissement naturel pendant les sauts.
- Halos de scène entre les combattants et reflets colorés par signature sur le sol.

### Ajouté — Sprites d’impact procéduraux (Kenzo + Nadia)
- Bursts typés et mis en cache : léger, lourd, projection, contre/riposte,
  projectile, choc de projectiles, **garde hexagonale**, **parry diamant doré**,
  **M1**, **final M1 à anneaux fragmentés** et impact au sol en éventail.
- Effets strictement visuels : hash replay/Online, hitboxes et équilibrage inchangés.

### Ajouté — Tenues des planches pour les 41 combattants (Marco)
- Table explicite de **41 motifs** (couronne, vague, lame, circuit, rune, montagne,
  Givre, aile, viseur…) dessinés dans un médaillon de tenue aux couleurs du héros.
- Bande de tenue signature et initiale personnalisée du joueur conservée.

### Garanti
- **384 assertions / 619 vérifications** vertes, contrôle QA n°30, bundle **447 Ko**.
  Détail : `docs/SPRINT_V53_GRAPHISMES_AAA2.md`.

## [5.2.0] — 2026-10-24 — « Écran Adaptatif & Joystick Pro »

Directives du propriétaire : **joystick à gauche**, nouvel ajustement du **format
du jeu**, de l’écran visuel et des touches, après consultation de **toute l’équipe**.

### Décision d’équipe
- **Lena** place le joystick au pouce gauche et les actions au pouce droit, aux
  vrais bords de l’appareil ; **Nadia** valide le mapping 8 directions ;
  **Kenzo** interdit tout étirement (simulation logique 1280×720 inchangée) ;
  **Marco** impose un grand bouton POING•M1 et un centre dégagé ; **Sarah**
  verrouille le multi-touch et les preuves de combat.

### Ajouté — Joystick tactile gauche
- Base analogique translucide avec bouton mobile : gauche/droite, **haut = saut**,
  **bas = garde/modificateur**, diagonales simultanées et zone morte anti-dérive.
- Capture par `pointerId`, retour au neutre à la relâche/perte de capture et
  nettoyage anti-joystick collé ; les anciens boutons Gauche/Droite/Saut disparaissent.
- Cluster droit réorganisé : **Spécial, Dash, Garde, Pied et grand POING • M1**,
  pensé pour diriger d’une main et marteler les combos de l’autre.

### Ajouté — Trois formats d’écran (Réglages → Format d’écran)
- **Adaptatif (défaut)** : scène 16:9 nette, fond sur tout l’appareil, HUD aligné
  sur la scène et touches aux bords physiques avec *safe-areas*.
- **Cinéma 16:9** : cadre centré classique des versions précédentes.
- **Plein cadre** : remplissage complet par recadrage, sans déformation.
- `viewport-fit=cover`, variables de scène responsive et plein écran corrigé.

### Garanti
- Déterminisme, replays, Online, M1, hitboxes et progression inchangés.
- **371 assertions / 606 vérifications** vertes, contrôle QA n°29, bundle **431 Ko**.
  Détail et arbitrage : `docs/SPRINT_V52_ECRAN_JOYSTICK.md`.

## [5.1.0] — 2026-10-24 — « Godson FURY — M1 Signature »

Directives du propriétaire : **trouver un autre nom**, travailler **individuellement
chaque personnage**, donner à chacun un **M1 spécifique**, et permettre les combos
**simplement en appuyant de manière répétée sur le bouton d’attaque**.

### Changé — Nouveau nom officiel
- Le jeu devient **Godson FURY ARENA — L’Arène des Légendes**. La signature
  **« Gédéon - Godson »** reste présente dans le jeu, les documents et les crédits.
- Le bundle autonome devient `Godson-FURY-Arena-V5.1-PRO.html` ; l’adresse GitHub
  Pages et les sauvegardes existantes ne changent pas.

### Ajouté — M1 Signature pour les 41 combattants (Marco + moteur)
- **41 chaînes M1 écrites individuellement** : 3 coups lourds pour les colosses,
  4 coups pour la majorité du roster, 5 coups pour les rapides et les légendes.
- **168 coups nommés uniques** (ex. Gideon : Jab Fulgurant → Direct du Champion →
  Fouet du Stade → Jugement Ascendant ; KAEL : Croisade d’Acier ; Nyx Ombre :
  Sentence des Ombres en 5 coups).
- Exécution accessible : **martèle POING au sol** et la chaîne du personnage se
  déroule (poings, pieds, uppercuts et balayages animés), avec avance de tracking,
  recul réduit entre maillons et final propre (launcher, knockdown ou burst).
- Le compteur reconnaît un **vrai combo complet** : la liaison a été réglée frame
  par frame (hitstun de liaison, pas de décollage parasite avant le final).
- Le bot poursuit désormais **sa propre chaîne M1** après un coup confirmé.

### Ajouté — Présentation du M1 (Kenzo/Lena)
- Traînées signature qui **s’intensifient coup après coup** et extension des
  membres croissante dans la chaîne ; le final affiche
  « M1 SIGNATURE — <nom de la chaîne> ».
- L’arsenal de sélection, les aperçus, l’écran VS et l’aide affichent le M1 du
  combattant ; la recherche roster trouve aussi un héros par le nom de son M1.
- Bouton tactile renommé **POING • M1** ; l’entraînement invite à marteler POING.

### Compatibilité / garanti
- Les replays d’avant la V5.1 relisent l’ancien poing générique (ils ne sont pas
  réinterprétés en M1) ; Online reste verrouillé à version identique.
- **357 assertions / 592 vérifications** vertes — dont la simulation réelle du
  martelage pour les **41/41** chaînes jusqu’au final —, contrôle QA n°28,
  bundle **418 Ko**.

## [5.0.0] — 2026-10-24 — « Édition Jeu Complet »

Nouvelle ambition du propriétaire : **l'objectif n'est plus de créer un mini-jeu,
mais un jeu.** La V5 relie enfin les modes existants en une progression durable :
jouer → progresser → débloquer → viser la couronne.

### Ajouté — Carrière Godson (le cœur de la V5)
- **XP, niveaux 1→50 et rangs** (Débutant → Mythe Godson) gagnés dans tous les modes :
  Campagne, Championnat, Bot, 2 Joueurs, Survie et Online ; bonus de performance
  (grande victoire, combo, parades, santé restante).
- **Godson** : monnaie de carrière dépensée en **titres honorifiques équipables** et
  récompenses (tenue de Libreville, accès anticipé à GODSON PRIME) — aucun achat réel.
- **12 quêtes de carrière** réclamables une seule fois (victoires, combo, polyvalence,
  Survie, Campagne, circuits, ascension) avec primes XP/Godson.
- **Migration honorifique** : les anciens profils convertissent victoires, Arcade,
  Survie et chapitres en XP/Godson de départ.
- Écran de fin enrichi : gain XP/Godson et passage de niveau annoncés après chaque match.

### Ajouté — Championnat Godson (successeur du mode Arcade)
- **3 circuits** : Stade Godson (5 combats), Monde des Planches (8), Légendes (12,
  GODSON PRIME en finale) — adversaires uniques, arènes imposées en tournée,
  difficulté croissante, boss final et grosses primes de couronne.
- L'ancienne Arcade 5 étapes devient le circuit Stade ; tous les compteurs « /5 » sont
  généralisés (HUD, VS, replays, Hall, fins de match, enseigne d'arène).

### Ajouté — Hub principal (Lena)
- **Carte carrière vivante** au menu : rang, niveau, barre d'XP, Godson, titre équipé et
  **prochain objectif** toujours visible.
- Menu structuré en sections « Jouer » et « Progression & collection », écran Carrière
  complet (circuits, quêtes, récompenses, parcours du jeu).

### Inchangé / garanti
- Déterminisme, replays, lockstep Online, hitboxes et sauvegardes intacts ; les replays
  anciens restent lisibles (le circuit entre dans le contexte d'enregistrement).
- **342 assertions / 577 vérifications** vertes, nouveau contrôle QA n°27, bundle
  **404 Ko** (budget officiellement relevé à 448 Ko pour l'édition complète).

## [4.4.0] — 2026-10-24 — « Navigation Pro & Tenues de combat »

Retour du propriétaire : la navigation et l'affichage n'étaient pas encore au niveau,
et les personnages devaient continuer à quitter le statut de mini-jeu.

### Ajouté — Navigation & affichage (Lena)
- **Recherche instantanée** de combattant (nom + titre) dans l'écran de sélection.
- **Filtres par famille** : Tous, ⚡ Rapides, 🛡️ Colosses, 🔮 Énergie, 🤖 Tech, ⚔️ Lames,
  avec compteur en direct (« 8 / 41 combattants »).
- **Barres d'action fixes** : « Choisir l'arène » et « Lancer le combat » restent collées
  en bas de l'écran, toujours atteignables au pouce.
- **Grilles à défilement interne** : les listes défilent dans leur panneau, les aperçus
  grands formats et les titres restent en place.
- **Clavier par colonnes réelles** : les flèches haut/bas suivent la vraie grille,
  ne visitent que les cartes filtrées et font défiler la carte sélectionnée à l'écran.

### Ajouté — Personnages (Marco/Kenzo)
- **Tenues de combat peintes** sur les 41 combattants : ouverture du vêtement sur le
  devant, col aux couleurs d'accent, plis du tissu ombrés et reflet dorsal — le torse
  n'est plus un simple aplat dégradé.

### Inchangé / garanti
- Gameplay, hitboxes, déterminisme, replays, Histoire et Online intacts (présentation
  et navigation uniquement). 327 assertions / 561 vérifications vertes, gate QA 26
  contrôles, bundle 379 Ko (budget 384 Ko tenu).

## [4.3.0] — 2026-10-24 — « Roster complet des planches »

Correction demandée par le propriétaire : la V3.6 n'avait traduit que 3 des 35 personnages
de ses planches. **Les 32 manquants sont désormais jouables — roster porté à 41 combattants.**

### Ajouté
- **Planche 1 complétée** : Lira l'Exploratrice, Zed le Traqueur, Nyx l'Ingénieure,
  Vorak le Berserker (KAEL, Sora et AEL-7 déjà présents).
- **Planche 2 « Univers original » intégrale (16)** : Aerin, Korben, Lyra la Prêtresse
  solaire, Drakesh, Selene, Taiko, Vex, Elara, Brax, Kazu, Sera, Vorga, Nox, Raven, Zep, Astrid.
- **Planche 3 intégrale (12)** : Sélénia, Drakar, Nyx l'Assassine, Kairos, Zara ingénieure
  de la Colonie Nova, Brutus, Aria, Krak l'orc des marais, Luna, Velen, Lyra la
  Dragonnière, Orion.
- Chaque personnage : **palette et morphologie dédiées** (41 profils humains — du colosse
  Krak à 126 PV à l'assassine Nyx ultra-rapide, peau verte de l'orc, peau bleutée de
  Drakesh, robots Luna/Zep/Brutus…), statistique propre, **spécial/EX/super fonctionnels**
  par famille d'archétype (flèches, lames, ondes sismiques, orbes chercheuses, plasma,
  vagues royales…) et signature VFX assortie.
- **Arcade et Survie** puisent dans tout le roster ; les colosses peuvent surgir en boss.
- **Sélection adaptée aux 41 cartes** : grille dense et élargie, lisible au pouce en paysage.
- Homonymes des planches conservés et documentés (Nyx ×2, Lyra ×2, Zara ×2) avec titres
  différenciants — inventaire exact dans `docs/CONCEPTS_PERSONNAGES.md` (rewritten).

### Inchangé / garanti
- Indices 0–8 intacts : Histoire, sauvegardes, replays et Online inchangés ; déterminisme
  préservé. 317 assertions / 553 vérifications vertes, gate QA 25 contrôles, bundle 374 Ko.

## [4.2.0] — 2026-10-24 — « Graphismes AAA »

Recentrage décidé par le propriétaire : toute l'équipe se focalise d'abord sur le visuel,
avec pour références Tekken, Street Fighter, KOF, Marvel vs Capcom et Mortal Kombat.

### Ajouté
- **Peinture cylindrique des membres** : chaque segment (cuisses, mollets, bras, avant-bras)
  est rempli d'un dégradé ombre → lumière → ombre calculé dans l'axe du membre — le volume
  « tube peint » des sprites AAA, sans coût d'image (désactivé en qualité basse).
- **Lumière d'arène sur les combattants** : rim light aux couleurs de l'ambiance (bleue la
  nuit, dorée le jour, orangée au crépuscule) le long du dos, et halo de contact au sol teinté
  par l'arène sous chaque combattant.
- **Peinture du visage** : ombre portée sous la mâchoire et lumière sur l'arête du nez.
- **Atmosphère vivante** : trois rayons de lumière traversent chaque arène et des poussières
  dorées (ou bleutées la nuit) dérivent dans l'air — pur rendu, zéro effet sur la simulation.
- **Avant-plans de profondeur par arène** : poteau + enseigne néon clignotante (tokyo), piliers
  de pierre (temple), barrières lumineuses (stade), palmes en silhouette (Libreville), coins bas
  hors foyer — la scène gagne un vrai premier plan façon AAA.
- **Budget bundle relevé à 384 Ko** (décision propriétaire : mandat visuel AAA), verrouillé au gate QA.

### Inchangé / garanti
- Gameplay, hitboxes, déterminisme, replays, Online, lisibilité des impacts et toutes les
  acquisitions V4.0/V4.1 — prouvés par 306 assertions de smoke test et le gate QA (24 contrôles).

## [4.1.0] — 24 octobre 2026 — « Peinture & Présentation » (trajectoire V4, chantier 1)
### Écran VS plein corps — Lena
- 🆚 Fini les médaillons avec une lettre : les deux combattants du match s’affichent **en pied, animés par le moteur**, dans des cadres aux couleurs de leur personnage — et **face à face** (orientation vérifiée par capture et verrouillée par test).
- 🎬 **Intro de round cinématographique** : bandeaux nominatifs façon grande licence qui glissent depuis les bords (nom du joueur, personnage et titre), puis s’effacent avant « COMBATTEZ ! ».

### Peinture & matières — Marco + Kenzo
- 🛡️ **Métal brossé** pour Kael/Titan/Prime : reflet diagonal animé et rivets de plastron.
- 🔷 **Énergie synthétique** pour AEL-7 : cœur lumineux pulsant et coutures cyan.
- ✨ **Étincelles arcaniques** pour Sora/Nova, bulles d’écume pour Zara, bandages croisés pour Kira, éclair signature pour le héros.
- 💈 Reflet de matière sur chaque chevelure/casque.

### Garanties — Nadia + Sarah
- 🎯 Présentation et rendu uniquement : gameplay, hitboxes, déterminisme, replays et Online inchangés.
- 🧪 **297 assertions source / 341 vérifications affichées**, gate QA contrôle permanent n°23, captures relues (VS Kael/Sora face à face, intro sur Libreville). Bundle 348 Ko (budget 352 Ko — marge surveillée).

---

## [4.0.0] — 24 octobre 2026 — « Arcade plein écran & anatomie HD » (nouvelle direction du propriétaire)
### Quitter le mini-jeu : coque de vrai jeu — Manager + Lena
- 🖥️ **100 % de l’écran appartient au jeu** : l’application occupe tout le viewport et la scène 16:9 prend la plus grande surface manipulable possible. Fini la page avec cadre réduit, pied de page et zones mortes.
- 🎛️ **Barre système intégrée à la scène** : logo, statistiques, Réglages, Tactile, Paysage et Pause vivent dans le jeu ; en combat, elle disparaît complètement sur tous les écrans — seule la pause flottante demeure.
- 📱 Safe-areas conservées, défilement de page supprimé, menus et overlays recalés sous la barre système.

### Personnages HD inspirés des planches — Kenzo + Marco
- 🧍 **Proportions adultes renforcées** : tête réduite (14,5–16 px), jambes et bras allongés (IK 46/45 et 37/36), squelette relevé et présence visuelle +8 %.
- 🎨 **Matières et volumes** : chaque membre reçoit ombre portée et lumière rasante (volume cylindrique), contours adoucis, bande latérale de pantalon et reflets alignés sur la nouvelle anatomie.
- 👕 **Tenues signatures par style** : plastron du Guerrier/Titan, circuits et cœur lumineux d’AEL-7, liserés dorés de Sora, écharpe royale de Prime, sash de Kira, orbites de Nova, vague de Zara.
- 🎥 **Caméra de jeu de combat** : zoom rapproché jusqu’à **1,34×** (1,42× en intro/fin de round) avec cadrage adaptatif — les combattants occupent enfin l’écran comme dans les grandes licences 2D.

### Garanties — Nadia + Sarah
- 🎯 Refonte strictement présentation/rendu : hitboxes, équilibrage, déterminisme, replays, sauvegardes et Online inchangés.
- 🧪 Suite portée à **287 assertions source / 331 vérifications affichées** ; gate QA avec contrôle permanent n°22 ; captures natives relues (grille des cartes + vrai duel Kael vs AEL-7 à zoom 1,34×).
- 👥 Équipe renforcée : **Marco** (direction artistique personnages) et **Lena** (UX plein écran) rejoignent Nadia, Kenzo et Sarah — voir `docs/EQUIPE.md` et `docs/SPRINT_V40_ARCADE_PRO.md`.

---

## [3.7.0] — 24 octobre 2026 — « Sélection & Corps pleins » (retour direct du propriétaire)
### Écran de sélection reconstruit — Manager + Kenzo
- 🃏 **Cartes avec aperçu animé du vrai combattant** : fini le simple médaillon avec une lettre. Chaque personnage est dessiné en miniature par le moteur du jeu — tête, torse, bras, gants, jambes et chaussures visibles — avec respiration et clignements.
- ✨ **Bordures personnalisées à effets** : chaque carte porte la couleur primaire et l’accent de son combattant, avec halo lumineux, reflet balayant au survol et **pulsation** quand le personnage est sélectionné.
- 👀 **Grand aperçu par camp** : le personnage choisi s’affiche en grand au-dessus de chaque roster, avec nom, titre, SUPER et statistiques. Les statistiques quittent les petites cartes pour rendre la grille plus lisible.
- 🧭 **Navigation améliorée** : sélection beaucoup plus visuelle au toucher, et navigation au clavier par flèches (gauche/droite/haut/bas) avec mise à jour immédiate de l’aperçu.

### Corps pleins en combat — Kenzo + Nadia
- 💪 **Membres visibles et volumineux** : cuisses, mollets articulés, revers de pantalon, bras et avant-bras épaissis, gants et chaussures plus présents, épaules et hanches élargies. Les silhouettes ne sont plus des « bâtonnets ».
- 🎨 Le volume est adapté à chaque morphologie : Kira et Sora restent agiles, Titan et Kael deviennent nettement plus massifs. Présence visuelle globale renforcée de 4 %.
- 🎯 Refonte **100 % visuelle** : physique, hitboxes, équilibrage, déterminisme, replays et Online inchangés.

### Qualité — Sarah
- 🧪 Suite portée à **277 assertions source / 321 vérifications affichées** : portraits réellement dessinés, bordures aux couleurs, aperçu synchronisé, navigation clavier et dimensions des membres verrouillées.
- 📸 Captures natives relues avant release : grille des 9 cartes, grand aperçu de Sora et line-up de combat sur Libreville.
- 🛡️ Gate QA : contrôle permanent n°21 « Sélection & Corps pleins V3.7 » ; bundle autonome 336 Ko, toujours sous le budget documenté de 352 Ko.

---

## [3.6.0] — 24 octobre 2026 — « Nouveaux Champions » (planches déposées par le propriétaire)
### Vos personnages entrent dans l'arène — Manager + Kenzo + Nadia
- 🎨 Le propriétaire a déposé **3 planches de personnages** (≈ 33 designs). Décision d'équipe : les traduire en **combattants jouables dans le style animé du jeu** (même squelette Humanité++, mêmes expressions, 60 fps) plutôt que coller des images 3D qui jureraient avec le combat. Les planches sont archivées en art conceptuel officiel (`assets/concepts/` + `docs/CONCEPTS_PERSONNAGES.md`).
- ⚔️ **KAEL — le Guerrier d'Acier** : armure acier clair, cape rouge, épaulettes cuirassées, 112 PV et la plus longue allonge du roster. Spécial : Lame d'Acier **perforante** ; SUPER : Croisade d'Acier (3 lames).
- 🔮 **Sora — la Magicienne des Arcanes** : chapeau pointu à gemme, cheveux longs argentés, cape violette. Elle flotte (gravité réduite), recharge son énergie 40 % plus vite et tire des **orbes chercheuses** ; SUPER : Comète Pourpre (3 météores).
- 🔷 **AEL-7 — l'Unité Synthétique** : casque lisse blanc, visière cyan lumineuse qui suit le regard, bouche à segments sonores. Le plus rapide au sol après Kira ; rafales plasma et SUPER Canon Orbital (projectile lourd perforant).
- 🎭 Chaque champion a sa **morphologie**, sa **signature VFX** (lames / runes / circuits), son **EX unique** (2 / 3 / 4 projectiles) et sa ligne de victoire — aucun recolor.
- 🗺️ Roster porté de **6 à 9 combattants**, ajoutés en fin de grille : Histoire, sauvegardes et replays existants intacts. Les champions apparaissent en **Arcade** et **Survie** (Kael peut même y être boss de vague).

### Garanties — Sarah
- 🧪 Suite portée à **263 assertions source / 307 vérifications affichées** : spéciaux/EX/supers des 9 combattants mesurés, morphologies et signatures distinctes, équilibrage borné, planches archivées.
- 📸 Contrôle visuel par capture native : line-up des 3 champions + duel Kael vs AEL-7 relus avant release (palette de Kael éclaircie après relecture : il lisait « Ninja sombre »).
- 🛡️ Gate QA : contrôle permanent n°20 « Nouveaux Champions V3.6 » ; budget bundle documenté à 352 Ko (327 Ko réels). Déterminisme, replays et Online inchangés (ajout en fin de roster uniquement).

---

## [3.5.0] — 24 octobre 2026 — « Prise en main paysage & impacts fluides » (retours directs du propriétaire)
### Le téléphone se tient en paysage, à deux mains — Manager + Kenzo
- 🎮 **Combat immersif** : sur téléphone tenu en paysage, dès qu'un match est en cours, l'en-tête disparaît et l'arène occupe **100 % de la hauteur de l'écran** (mode `combatImmersif`, synchronisé à chaque frame). Un bouton **⏸ flottant** discret remplace celui de l'en-tête.
- 👍 **Pouces aux bons endroits** : les grappes tactiles sont relevées dans l'arc naturel des pouces (marge basse 4,5 vh), écartées vers les bords avec respect des **encoches** (safe-areas aussi appliquées au HUD), boutons de 48–62 px. Anti-scroll total pendant le jeu (`touch-action: none`, `overscroll-behavior: none`) : plus de page qui bouge ou se recharge en plein combo.
- Les menus gardent l'en-tête et la navigation habituels ; l'immersion ne concerne que les combats (et les replays) en paysage court.

### Fluidité des impacts — Nadia + Manager
- 🥊 **Fini le ralentissement à chaque coup** : le gel d'impact (hitstop) mangeait 42 à 105 ms de simulation par coup touché — jusqu'à ~150 ms sur un contre. Nouvelles valeurs pro et fluides : **14 ms** (coups légers, < 1 frame), **24–26 ms** (moyens), **32–38 ms** (lourds/EX/projection), **48 ms** (SUPER), contre ×1,2 au lieu de ×1,45, parry 38 ms au lieu de 92 ms.
- 🎬 Le ralenti ne subsiste que sur le **K.O.** (raccourci de 55 à 38 frames) ; secousse d'écran des coups légers réduite. L'Online était déjà sans gel (lockstep) et reste inchangé.

### Garanties — Manager + Sarah
- 🎯 Le gel d'impact et le ralenti vivent dans la boucle d'affichage, pas dans la simulation : **déterminisme, replays et Online intacts** (vérifiés par la suite complète, replays hashés inclus).
- 🧪 Suite portée à **248 assertions source / 277 vérifications affichées** : plafond de gel mesuré dans les données d'attaques, coup de poing réel sans ralentissement (≤ 16 ms, aucun slow-mo), mode immersif et pause flottante présents et sûrs hors mobile.
- 🛡️ Gate QA : contrôle permanent « Prise en main paysage & impacts fluides V3.5 » ; budget bundle relevé à **336 Ko** (documenté) après quatre chantiers d'interface successifs.

## [3.4.0] — 24 octobre 2026 — « Zone de combat dégagée » (retour direct du propriétaire)
### La scène appartient aux personnages — Kenzo + Manager
- 📱 **Tactile compact aux coins** : les boutons ne s'étalent plus sur le stage. Grille resserrée en bas à gauche (déplacements) et en bas à droite (attaques), taille ramenée à ~46–52 px en paysage (bornée par la hauteur d'écran), fond semi-transparent flouté et libellés masqués en paysage court — on voit le décor et les jambes des combattants à travers.
- 🏷️ **Plaques de nom retirées** au-dessus des combattants pendant les combats : le HUD affiche déjà les noms, la zone de jeu ne montre plus que les personnages.
- 📺 **Écran géant des arènes réduit** (344×82 au lieu de 470×116) et **effacé à 30 % pendant le combat** (55 % en fin de round, plein visible dans les menus où il fait partie du décor).
- 💬 **Textes flottants espacés** : dégâts, « CONTRE ! » et noms de techniques proches se décalent verticalement au lieu de se chevaucher illisiblement.

### Graphisme & lisibilité — Kenzo
- 💡 **Halo de scène** : une lumière douce au sol suit le centre de l'action entre les deux combattants (passe POST, qualités moyenne/haute) — les personnages ressortent mieux du décor sans aucun élément ajouté à l'écran.
- Le rendu conserve Humanité++ (V3.1), le paysage prioritaire (V3.2) et le parcours d'écrans (V3.3).

### Garanties — Manager + Sarah
- 🎯 **Présentation uniquement** : le tactile garde exactement les mêmes boutons et la même logique multi-touch (seul le CSS change), aucun impact sur la physique, le déterminisme, les replays ou l'Online.
- 🧪 Suite portée à **241 assertions source / 270 vérifications affichées** : tactile compact vérifié dans le CSS livré, plaque de nom absente du rendu, écran géant mesuré à 100 % au menu et ≤ 35 % en combat, halo actif et décalage des textes flottants mesuré. Contrôle visuel par capture réelle de combat.
- 🛡️ Gate QA enrichie d'un contrôle permanent « Zone de combat dégagée V3.4 ».

## [3.3.0] — 24 octobre 2026 — « Flux d'écrans & Chargement » (retour direct du propriétaire)
### Un vrai parcours d'écrans — Manager + Nadia
- ⏳ **Écran de chargement** à l'ouverture : logo animé, barre de progression avec pourcentage, étapes affichées (« Préparation des combattants… », « Ouverture des arènes… ») et astuces de combat — environ **1,2 seconde**, skippable au clic ou au clavier, avec fondu de sortie et filet de sécurité anti-blocage.
- 🗂️ **Parcours en étapes** au lieu d'un méga-écran fourre-tout : **1 · Menu → 2 · Personnages → 3 · Arène → 4 · Difficulté (contre le bot) → VS → Combat**, avec indicateur d'étapes visible sur chaque écran et boutons retour en chaîne (Difficulté → Arène → Personnages → Menu).
- 🏟️ **Écran Arène dédié** : grandes cartes d'arènes + choix d'ambiance Arena Moods. En Histoire/Survie, l'arène imposée est signalée et l'ambiance reste libre.
- 🎯 **Difficulté en dernière étape** contre le bot, présentée en 3 grandes cartes (Facile/Moyen/Difficile) ; le bouton de l'écran Arène devient « Choisir la difficulté » tant qu'elle n'est pas fixée dans le parcours.
- Les autres modes gardent leur logique : Arcade/Survie/Histoire (difficulté scénarisée), 2 Joueurs et Entraînement enchainent directement de l'Arène vers le VS.

### Affichage amélioré — Kenzo
- ✨ **Transitions d'écran** : chaque panneau entre en fondu glissé (220 ms), fini les apparitions sèches.
- 🃏 Cartes personnages agrandies (avatars 54 px, grille aérée) maintenant que l'écran Personnages ne partage plus la place avec les arènes ; cartes d'arène portées à 110 px de haut sur leur écran dédié.
- L'ensemble conserve le paysage prioritaire, l'interface épurée V3.2 et les personnages Humanité++ V3.1.

### Garanties — Manager + Sarah
- 🎯 **Navigation uniquement** : aucun changement de gameplay, physique, déterminisme, replays ou protocole Online. `menuArena` rejoint la liste `MENUS`/`showOnly` avec l'état `select`, et le lancement réutilise exactement le même code (`launchFromFlow`).
- 🧪 Suite portée à **234 assertions source / 263 vérifications affichées** : chargement présent et terminé proprement, parcours 2 joueurs complet écran par écran, difficulté du bot exigée après l'arène puis lancement réel du combat — en plus de toutes les anciennes traversées de menus qui restent compatibles.
- 🛡️ Gate QA enrichie d'un contrôle permanent « Chargement & parcours d'écrans V3.3 ».

## [3.2.0] — 24 octobre 2026 — « Paysage & Interface Épurée » (retour direct du propriétaire)
### Le jeu se joue en paysage — Manager + Kenzo
- 🌄 **Scène paysage d'abord** : la zone de jeu tient désormais toujours dans la hauteur visible de l'écran (largeur bornée par `100dvh` en 16:9), sans défilement parasite pendant les combats.
- 📱 **« Tourne ton appareil »** : sur téléphone en portrait, un écran dédié propose le **plein écran paysage** (avec tentative de verrouillage d'orientation) ou, au choix du joueur, de continuer en portrait. Si l'appareil repasse en portrait pendant un combat local, le jeu se met en pause automatiquement pour protéger la partie (jamais en ligne ni en replay).
- 🎬 **Mode cinéma** : en paysage sur écran court (téléphones), l'en-tête se compacte et le pied de page disparaît pour laisser toute la place à l'arène ; en plein écran, la scène occupe 100 % de l'écran sans coins arrondis.
- ⛶ Le bouton d'en-tête devient **« Paysage »** et déclenche le même plein écran immersif.

### Interface épurée — Nadia + Kenzo
- ✂️ **Supprimés** : les 4 cartes d'aide sous la scène (doublon de « Comment jouer »), le pied de page géant (remplacé par une ligne signature), les notes de bas de panneau (Hall of Fame, Replays, Défis), les signatures répétées sur les écrans VS/Histoire/Pause, le badge « VERSION 2.8 » périmé et les libellés redondants (ARÈNE/AMBIANCE, énergie détaillée du HUD).
- 🧹 **Condensés** : menu principal (bannières et cartes en quelques mots), panneau GO GAME Online (titres courts, statuts d'une ligne), écran d'aide resserré, ligne de carrière du menu et progression Histoire en format compact, toasts les plus longs raccourcis.
- 🥋 Les **techniques du combattant** à la sélection sont repliées sous un résumé dépliable : disponibles en un toucher, invisibles le reste du temps.

### Garanties — Manager + Sarah
- 🎯 Refonte **présentation uniquement** : gameplay, physique, déterminisme, replays et protocole Online inchangés (la pause portrait réutilise la pause existante et reste interdite en ligne). Tous les identifiants DOM utilisés par le jeu sont conservés.
- 🧪 Suite portée à **221 assertions source / 250 vérifications affichées** : écran de rotation et ses choix, logique paysage sans crash hors navigateur, suppression de la barre d'aide, footer borné, règles CSS portrait/paysage/plein écran et menu toujours complet.
- 🛡️ Gate QA enrichie d'un contrôle permanent « Paysage & interface épurée V3.2 ».

## [3.1.0] — 24 octobre 2026 — « Humanité++ » (demande prioritaire du propriétaire)
### Personnages plus humains — Kenzo + Nadia + Manager
- 🧍 **Proportions adultes stylisées** : tête réduite (rayon 16,5 à 17,8 px), cou et trapèzes dessinés, épaules/hanches/mâchoires propres à chaque combattant. Six morphologies déclarées dans `HUMAN_PROFILES` : athlète équilibré (Gideon), sprinteuse agile (Kira), colosse puissant (Titan), stratège élancée (Nova), champion royal (GODSON Prime) et vague athlétique (Zara).
- 🙂 **Visage de trois-quarts complet** : front, pommette, nez et narine, oreille, œil en amande avec iris mobile et clignement, sourcil tendu, bouche expressive (focus, effort, garde, douleur, fatigue, victoire, KO), barbe légère selon le personnage et goutte de sueur en fin de vie.
- 👀 **Regard vivant** : les yeux suivent l'adversaire, la tête accuse un léger retard sur le buste, les cheveux et les vêtements répondent à l'inertie, bassin et épaules contre-tournent pendant la marche, et la **fatigue** devient visible (respiration ample, épaules tombantes) quand la vie baisse.
- 🦵 **Membres volumiques articulés** : segments effilés ombrés plutôt que bâtons, genoux/coudes résolus par cinématique inverse à deux segments, poings gantés orientés et chaussures articulées au pas. Le buste gagne cage thoracique, taille, bassin, ceinture articulée et plis de tissu animés ; reflets et traînées de dash utilisent la même silhouette.
- 🔤 Lettres d'emblème et de bandeau contre-miroitées : elles restent lisibles quand le combattant regarde à gauche.

### Garanties techniques — Manager + Sarah
- 🎯 **100 % visuel (render-only)** : aucune hitbox, aucune constante de physique, aucun input et aucun octet du protocole n'ont changé. Les replays déterministes, le Replay Studio et le lockstep GO GAME Online restent valides à l'identique.
- 🧪 Suite portée à **211 assertions source / 240 vérifications affichées** : 6 morphologies distinctes, proportions adultes bornées, IK aux longueurs exactes et cible hors de portée clampée, regard qui suit l'adversaire des deux côtés, inertie cheveux/vêtements, fatigue > 60 % à vie basse, expressions faciales et invariance physique pendant le rendu. Contrôle visuel réel par captures hors-navigateur (lineup des 6 combattants + combat à Libreville).
- 🛡️ Gate QA enrichie d'un contrôle permanent Humanité++ (hooks anatomiques présents dans le client livré).

## [3.0.0] — 24 octobre 2026 — « GO GAME Online & Combat Pro » (Track V3)
### GO GAME Online — Manager + Kenzo + Nadia
- 🌐 **Panneau GO GAME complet** : inscription/connexion Supabase Auth par email, session persistée et rafraîchie, pseudo public unique, pays et combattant principal. Le jeu local reste intégralement disponible hors ligne et sans compte.
- ⚔️ **Duels privés en ligne** : salon par code, choix d’arène/ambiance/règles par l’hôte, signalisation WebRTC stockée dans Supabase, puis **DataChannel pair-à-pair** pour le combat.
- 🎮 **Netcode lockstep déterministe** : échange de masques d’inputs 8 bits, délai d’entrée adaptatif estimé par ping, pipeline anti-blocage, hashs d’état périodiques comparés dès réception, déconnexion et désynchronisation gérées proprement.
- 🏆 **Classement mondial co-vérifié** : les deux clients envoient un claim signé par leur session à l’Edge Function `submit-match-result` ; un résultat n’entre au classement que si joueurs, vainqueur, combattants et hash final concordent. Aucune écriture directe de résultat vérifié depuis le navigateur.
- ☁️ **Cloud GO GAME** : envoi/restauration du profil local, publication privée ou publique du dernier replay, découverte et import des replays publics dans le Replay Studio.
- 🛡️ **Garde-fous de duel** : même version obligatoire, règles de l’hôte validées, pause et vitesse turbo désactivées pendant le lockstep, réglages locaux restaurés avant toute sauvegarde de fin de match.

### Combat professionnel — Nadia + Manager
- 🤼 **Projection** Poing+Pied au corps-à-corps : traverse la garde, met au sol, choisit le sens avec la direction tenue et possède sa statistique de fin de match. Le bot l’utilise contre les gardes abusives.
- ✨ **EX Spéciaux uniques** Spécial+Poing pour 75 % d’énergie : variantes renforcées et visuellement marquées pour les 6 combattants, sans remplacer les Supers à 100 %.
- ⚡ **Godson Cancel** : après un coup confirmé, un Dash annule la récupération pour 25 % d’énergie, une seule fois par combo, afin de créer de vraies routes avancées sans boucle infinie.
- 💨 Backdash défensif bref, scaling de dégâts/hitstun anti-infini, dérapage plus lisible et bot capable d’EX, projections et cancels selon la difficulté.
- 🥋 **Move list contextuelle** sur l’écran de sélection : coût du Spécial/EX/Super, projection, Godson Cancel, dash aérien, backdash et parry du combattant choisi.

### Performance & présentation — Kenzo + Sarah
- 📈 Métriques CPU séparées logique/rendu/frame, tier de performance et état online dans `renderStats` ; la qualité automatique tient compte à la fois des FPS de l’écran et du temps CPU réel.
- ✨ Échelle FX adaptative, anneaux dorés des projectiles EX, poses dédiées projection/EX et tri des combattants sans allocation temporaire.
- 🧪 Suite portée à **194 assertions source / 218 vérifications affichées** : techniques V3 en combat réel, lockstep hôte/invité, stall réseau, checksum différé, restauration des réglages, puis Auth/REST/salons/signaux/cloud exercés contre une API simulée déterministe. Un test réel séparé avec deux comptes QA jetables a aussi vérifié le salon, la RPC, les signaux, le double claim et le classement, avant nettoyage complet.
- 🛡️ Gate QA enrichie : hooks GO GAME permanents, scan anti-secret du client et budget bundle explicite de 320 Ko pour le client Online complet (bundle V3.0 : 293 Ko).

## [2.8.0] — 23 octobre 2026 — « Arena Moods & Polish » (Sprint 08)
### Ambiances d’arène — Kenzo
- 🌤️ **Arena Moods** : les 4 arènes peuvent se jouer en **Auto, Jour, Crépuscule ou Nuit**. Auto conserve l’intention originale : Stade et Libreville au crépuscule, Tokyo la nuit, Temple le jour.
- 🎨 Chaque combinaison possède son ciel, son sol, sa vignette, son grade coloré, son horizon, ses étoiles et son astre. L’atmosphère est appliquée au fond pour ne jamais sacrifier la lisibilité des combattants.
- 💾 Préférence sauvegardée, affichée dans le résumé de lancement et l’écran VS ; l’ambiance effective est capturée dans les replays puis restaurée pendant la lecture, sans écraser le choix actuel du joueur.
### Polish combat & mobile — Kenzo + Manager
- ✨ **VFX signatures** autour des projectiles : éclairs de Gideon, traînées de Kira, éclats sismiques de Titan, orbites de Nova, couronne royale de Godson Prime et écume de Zara — y compris en qualité basse.
- 📱 **Tactile multi-touch fiable** : suivi indépendant de chaque `pointerId`, capture du pointeur, état visuel/ARIA enfoncé, boutons libellés plus généreux et nettoyage global anti-touches collées.
### Qualité — Sarah
- ✅ Suite étendue à **151 assertions source** : matrice **4 arènes × 3 ambiances**, 6 signatures VFX, relâchement multi-doigts et vrai match en Nuit forcée relu et vérifié.
- Nouvelles métriques `renderStats` pour l’ambiance, les étoiles, les VFX signatures, l’estimation FPS et le budget d’image ; gate QA enrichie d’un contrôle Arena Moods permanent.
- Board du sprint : `docs/SPRINT_08_ARENA_MOODS.md`.

## [2.7.0] — 23 octobre 2026 — « Replay Studio & Victoires » (Sprint 07)
### Bibliothèque Replay Studio — Manager + Kenzo
- 🎬 **Plusieurs replays conservés localement** au lieu du seul dernier match : rotation normale de 8 matchs, plafond de sécurité à 12 et budget de stockage d’environ 1,8 Mo.
- ⭐ **Favoris protégés** du nettoyage automatique, **renommage** des grands combats, suppression ciblée et lecture de n’importe quel replay de la bibliothèque.
- 🃏 **Cartes détaillées** : titre, personnages, mode, vainqueur, durée, arène, date, dégâts totaux, combo maximal et hash de vérification.
- 💾 **Migration automatique** : un replay V2.6 déjà présent sur l’appareil devient la première entrée du Replay Studio, sans perte.
### Personnalité des victoires — Nadia
- 🏆 **Phrase de victoire signature** pour GÉDÉON, Kira, TITAN, Nova, GODSON PRIME et Zara, affichée sur l’écran de fin et dans la barre du lecteur après un replay vérifié.
### Qualité — Sarah
- ✅ Suite étendue à **136 assertions source** : deuxième vrai match joué par entrées, ancien replay renommé/favori sélectionné dans la bibliothèque puis relu et vérifié, suppression ciblée, rotation et migration V2.6.
- Gate QA enrichie pour verrouiller durablement les hooks Bibliothèque/Replay Studio.
- Board du sprint : `docs/SPRINT_07_REPLAY_STUDIO.md`.

## [2.6.0] — 23 octobre 2026 — « Replays déterministes » (Sprint 06)
### Replay du dernier match — Manager + Kenzo
- 🎬 **Enregistrement lockstep** de tous les matchs terminés hors entraînement : les entrées finales des deux combattants (clavier, tactile, manettes et décisions déjà produites par le bot) sont encodées en masques 8 bits puis compactées en événements de changement.
- ▶️ **Lecteur intégré** accessible depuis l’écran de fin et le menu principal : redémarrage, pause/reprise avec la touche `P`, vitesses **0,5×, 1×, 2× et 4×**, barre de progression et sortie propre.
- 💾 **Persistance locale** du dernier replay avec ses personnages, son arène, son mode, ses règles, ses conditions de départ et son résultat ; il reste disponible après rechargement de la page.
### Déterminisme & sécurité du profil — Sarah
- 🎲 **Graine visuelle reproductible** pour l’état d’animation initial et les clignements ; la physique et les dégâts ne dépendent d’aucun tirage aléatoire.
- 🔐 **Hashs d’état** au départ, tous les 300 frames et à la fin : le lecteur affiche « ✅ Replay vérifié » uniquement si la relecture produit le même état final et le même vainqueur.
- 🛡️ **Isolation complète** pendant la lecture : statistiques, combos records, parry, succès, Histoire, Survie, Arcade et Hall of Fame ne peuvent pas être modifiés une deuxième fois. Les réglages temporaires du match original sont restaurés à la sortie.
- ✅ Suite étendue à **122 assertions source**, dont un vrai match 2 joueurs joué uniquement par les entrées puis relu intégralement ; gate QA enrichie d’un contrôle permanent des hooks replay.
- Board du sprint : `docs/SPRINT_06_REPLAYS.md`.

## [2.5.0] — 23 octobre 2026 — « Human Motion & Living Arenas » (Sprint 05 — demande directe du Product Owner)
### Fluidité & corps humain — Kenzo, game feel Nadia
- 🕺 **Moteur d’animation corporelle continue** : posture, inclinaison, course, saut, garde, douleur, dash, squash et regard sont lissés avec le vrai delta d’écran (60/120/144 Hz), au lieu de suivre les paliers bruts de la simulation 60 Hz.
- 🌬️ **Respiration et transfert de poids** : torse qui respire, hanches et épaules décalées séparément, tête qui suit l’adversaire, cape/cheveux davantage réactifs à la vitesse.
- 🏃 **Locomotion reconstruite** : foulée alternée proportionnelle à la vitesse réelle, levée des pieds, genoux articulés, balancier opposé des bras, mélange progressif sol/air/dash, accélération et freinage plus humains.
- 🥊 **Attaques en trois temps** : anticipation (le membre recule), impact rapide, puis récupération/follow-through par courbes d’easing ; **retournement progressif** du personnage au lieu d’un flip instantané.
### Décors vivants — Kenzo
- 🚶 **Passants animés dans les 4 arènes** : supporters en coursive au Stade, piétons sous parapluies à Néon Tokyo, visiteurs/moines au Temple et promeneurs à chapeaux à Libreville — jambes et bras articulés, directions et rythmes variés, quantité adaptée au preset de qualité.
- 🙌 **Foule plus humaine** : ola qui traverse les tribunes du Stade, bras levés et lumières de téléphones pendant les moments chauds.
- 🌴 Drapeaux qui claquent au vent, pirogues qui dérivent et tanguent sur la Plage de Libreville.
### Performance & qualité — Sarah
- Cache des mesures de texte (noms et bandeau LED), dessin des particules/anneaux allégé et métriques d’animation dans `renderStats` (échantillons, passants actifs, cache).
- Suite étendue à **104 assertions** : lissage, courbes d’attaque, retournement progressif, passants mobiles et vie active dans chaque arène.
- Board du sprint : `docs/SPRINT_05_HUMAN_MOTION.md`.

## [2.4.0] — 23 octobre 2026 — « Libreville Rising » (Sprint 04 — contenu de l’équipe studio)
### Ajouté — contenu Nadia + Kenzo
- 🥋 **6e combattante jouable : Zara — la Vague de Libreville** (rapide, portée longue, tresse et fleur corail). Techniques uniques : **Lames de Marée ×2** en croix et **Raz-de-Marée Libreville**, énorme vague au sol à éviter en sautant. Intégrée à la sélection, l’écran VS, Arcade et Survie.
- 🌴 **4e arène : Plage de Libreville — Coucher de soleil** : océan Atlantique animé avec reflets, skyline, pirogues, parasols, supporters, palmiers, mouettes, plage décorée et musique dédiée. Thème de sol sable + teinte de post-traitement chaude.
- 📖 **Mode Histoire — Chapitre 2 « La Marée des Champions »** : la saga passe à **6 combats** — Zara à Libreville, Nova Déchaînée (difficile), puis boss ultime **GODSON PRIME** sur la plage. Scène de fin du Chapitre 1 conservée avec sa récompense, nouvelle fin de saga et progression en 6 points.
- 🎯 **Écran Défis & carrière** : Tempête Gideon (combo x6), Mur d’or (3 parry dans un match), Habitué de l’Arène (10 victoires), Domiteur de vagues (Survie 5), Roi de l’Arcade et Saga Godson, avec progression sauvegardée et points intégrés aux grades.
- 🌅 **Tenue « Coucher de soleil de Libreville »** déblocable en terminant le Chapitre 2 et applicable au Joueur 1 dans la Personnalisation.
### Compatibilité & qualité — Sarah
- Migration douce des sauvegardes V2.0 → V2.3 : une ancienne Histoire terminée devient « Chapitre 1 terminé » et reprend directement au combat 4 ; nouveaux champs de profil fusionnés sans perdre les records.
- Record de parry par match désormais suivi en carrière ; suite d’exécution étendue à **94 assertions** couvrant Zara, sa vague, Libreville, les 6 combats, les défis et le preset cosmétique.
- Board du sprint : `docs/SPRINT_04_LIBREVILLE_RISING.md`.

## [2.3.0] — 22 octobre 2026 — « Studio Quality » (Sprint 03 — le studio s’agrandit)
### Studio & organisation
- 🏭 **3 spécialistes recrutés** par le Manager officiel : **Nadia** — Lead Game Designer (combat, équilibrage, narration), **Kenzo** — Directeur Artistique & Rendering Lead (rendu, VFX, lumière, post-traitement), **Sarah** — Lead QA, Performance & Release (tests, budgets, **veto qualité**). Charte d’équipe, RACI et rituels : `docs/EQUIPE.md`.
- 📐 Documents de production : `docs/ARCHITECTURE.md` (modules, pipeline, budgets), `docs/GAME_DESIGN.md` (piliers, identités, frame data), `docs/QA_QUALITE.md` (pyramide de tests, seuils de release), `docs/SPRINT_03_STUDIO_QUALITY.md`.
### Rendu & qualité visuelle (chantier Kenzo)
- 🎼 **Pipeline de rendu en 7 passes nommées et mesurables** : `background → floor → shadows → entities → projectiles → effects → post`, piloté par `runRenderPass()` + `renderStats` (frames, passes, allocations).
- 🗄️ **Cache de dégradés** : ciel, sol, écran géant, faisceaux du stade, cape et torse des combattants sont désormais réutilisés au lieu d’être recréés à chaque frame (moins de pression mémoire, 60 FPS mieux tenus).
- 🎨 **Post-traitement par arène** : teinte colorée « grade » propre à chaque scène (ambre Stade, rose Néon Tokyo, doré Temple) + flash d’impact en qualité haute ; automatiquement adapté selon le preset de qualité, sans nuire à la lisibilité.
### Qualité d’exécution (chantier Sarah)
- 🛡️ **Gate QA automatique** `tools/qa-check.py` : 13 contrôles de release en une commande (syntaxe, alignement DOM↔JS, version unique, cache de dégradés, ordre du pipeline, budgets de poids, autonomie du bundle). La release est refusée si un contrôle critique échoue.
- ✅ Suite de tests étendue à **73 assertions** (pipeline, cache, post-traitement, presets) et vérifiée en double exécution.
- 🐛 Correctif de robustesse décelé par les exécutions répétées de Sarah : une fin de round déclenchée par un projectile ne peut plus interrompre l’itération des autres projectiles (test de non-régression ajouté).
### Note de roadmap
- Le Chapitre 2 et les replays passent au Sprint 04 : la base studio (structure + rendu + QA) était prioritaire pour le Product Owner.

## [2.2.0] — 22 octobre 2026 — « Profondeur de combat » (Sprint 02 du Manager)
### Ajouté
- ✨ **Supers uniques pour les 5 personnages** (spécial 50% + SUPER 100%) :
  Gédéon *Foudre / Jugement perforant* • Kira *Rafale de 3 lames / Tempête de 5 lames* • TITAN *Onde sismique au sol / Séisme* (à éviter en sautant) • Nova *Orbe chercheuse / Pluie de 4 météores* • GODSON PRIME *Double vague royale / Triple Jugement*. Noms affichés sur les cartes personnages et l'écran VS ; projectiles différenciés visuellement (lames, onde de terre, météores…).
- 🛡️ **PARRY PARFAITE** : garde déclenchée dans les ~150 ms avant l'impact (bouclier doré) = **0 dégât**, attaquant repoussé et ralenti, fenêtre de **riposte +35%**, +12% d'énergie. Le bot tente des parry selon sa difficulté et riposte. Statistique « Parry parfaites » en fin de match + succès dédiés. Les SUPER attaques restent imparables.
- 🌊 **Mode SURVIE** : vagues infinies en 1 round, adversaires et arènes aléatoires, difficulté croissante (PV/puissance des ennemis en hausse), **boss toutes les 5 vagues**, soin **+35% de vie** et énergie conservée entre vagues, score cumulé enregistré au Hall of Fame, record de vague, succès vagues 3/5/10.
### Équilibrage
- Triple SUPER de GODSON PRIME rééquilibré (13/10/10 au lieu de 23/11/11) pour rester légendaire sans être injouable.
- Physique des projectiles enrichie : trajectoires verticales, gravité, guidage, perforation, explosions au sol.
### Qualité
- Suite de tests portée à **63 vérifications automatisées** (signatures des 10 habiletés, parry+riposte en combat réel, run de Survie complète).
- Le replay des combos, initialement envisagé, est **reporté au Sprint 03** (décision du manager : il exige un moteur déterministe à graine fixe pour être fiable).

## [2.1.0] — 22 octobre 2026 — « Progression & Histoire » (Sprint 01 du Manager)
### Ajouté
- 📖 **Mode Histoire — Chapitre 1 « L'Appel de l'Arène »** : 3 combats scénarisés (Kira au Stade, Nova au Temple, boss TITAN à Tokyo), dialogues avant chaque combat, objectifs, scènes de nouvel essai et de fin, progression sauvegardée (reprendre où l'on s'était arrêté).
- 👑 **GODSON PRIME** : 5e personnage **secret déblocable** en terminant l'Histoire — couronne dorée, cape, stats légendaires et **SUPER attaque triple**. Il peut aussi apparaître comme boss secret en Arcade.
- 🏅 **Hall of Fame** : classement local Top 10 des scores (dégâts + combos + vie restante + rounds), enregistré après chaque match hors entraînement, avec ton rang affiché sur l'écran de fin.
- 🎖️ **Grades de carrière** : Débutant → Espoir → Confirmé → Expert → Maître → 👑 Légende Godson, affichés dans l'en-tête.
- Succès : « Finir le Chapitre 1 », « GODSON PRIME débloqué ».
- Gouvernance projet : `docs/GESTION_PROJET.md`, `docs/ROADMAP.md`, dépôt Git versionné + tag `v2.1.0`.

### Amélioré
- Migration douce des sauvegardes V2.0 (aucune perte de profil/stats/couleurs).
- Réinitialisation des stats : efface aussi le classement, conserve les déblocages.
- Suite de tests portée à **44 vérifications automatisées** (campagne Histoire complète simulée de bout en bout).

## [2.0.0] — 22 octobre 2026 — « Édition PRO »
- Réécriture professionnelle modulaire (`src/engine.js`, `render.js`, `ui.js`, `style.css`) + build autonome 1 fichier.
- Fluidité : simulation 60 Hz interpolée (écrans 120/144 Hz), hit-stop, ralenti K.O., qualité auto-adaptative selon FPS.
- Gameplay : dash (sol/air), course, saut variable + coyote-time, uppercut lanceur, balayage, jongles aériennes, combos annulables, CONTRE +25%, mise au sol/relevée, chocs de projectiles.
- 4 combattants (GÉDÉON, Kira, TITAN, Nova), 3 arènes animées avec musiques dédiées (Stade Sunset, Tokyo-Neon Pluie, Temple Céleste), caméra dynamique.
- Modes Versus Bot (IA adaptative 3 niveaux), 2 Joueurs, Arcade 5 étages, Entraînement à mannequin réglable.
- Personnalisation (noms, initiales, couleurs), réglages complets, sauvegardes locales, succès, écran VS, statistiques de match notées S→D, manettes, tactile.

## [1.0.0] — 22 octobre 2026 — Prototype
- Premier jeu de combat 1v1 signé Gideon - Godson : Versus Bot (3 difficultés) et 2 Joueurs, arène unique, fichier HTML unique. Conservé dans `index-v1.html`.

---
✍️ **Gédéon - Godson ARENA** © 2026 — Libreville, Gabon.
