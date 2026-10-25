# 🎮 Godson FURY ARENA — V7.3 « L’Arène des Légendes • Plein écran & Sélection claire »

**Jeu de combat 1v1 professionnel — haute résolution, 60 FPS, haut graphisme**
✍️ *Créé et signé par **Gideon - Godson** © 2026 — Libreville, Gabon*
👔 *Manager officiel & Développeur principal : Assistant Arena*
🏭 *Studio renforcé V4 : Nadia (Game Design) • Kenzo (Rendu) • Sarah (QA) • Marco (Direction artistique personnages) • Lena (UX plein écran)*

## ▶️ Lancer le jeu
| Fichier | Usage |
|---|---|
| ⭐ **`Godson-FURY-Arena-V7.3-PRO.html`** | Version autonome **1 seul fichier** : ouvre-la dans un navigateur, partage-la, aucune installation. Le jeu local fonctionne hors ligne ; Godson FURY Online et le duel deux téléphones demandent leurs réseaux respectifs. |
| 🌐 **[Jouer en ligne (GitHub Pages HTTPS)](https://vpnducanada-commits.github.io/GO-GAME/)** | Version publique recommandée en HTTPS pour créer un compte, disputer des duels WebRTC et utiliser le mode deux téléphones sur mobile. |
| `index.html` + `src/` | Version développement modulaire (`python3 -m http.server 8000`). |
| `docs/` | Charte de gestion, roadmap officielle et suivi des sprints. |

Après modification dans `src/` : `python3 tools/build-single.py` régénère la version 1 fichier.

## 🕹️ Modes de jeu
- 📖 **Mode Histoire — Saga en 2 chapitres** *(Chapitre 2 nouveau V2.4)* : 6 combats scénarisés, Zara à Libreville, Nova Déchaînée et boss ultime GODSON PRIME. Récompenses : Prime + tenue de Libreville. Sauvegardes V2.3 compatibles.
- 🌊 **Survie** *(nouveau V2.2)* : vagues infinies, +35% de vie entre vagues, boss toutes les 5 vagues, score cumulé au Hall of Fame
- 🤖 **Versus Bot** : IA Facile / Moyen / Difficile adaptative (elle sait même faire des *parry* !)
- 👥 **2 Joueurs** : clavier partagé ou 2 manettes
- 🏆 **Championnat Godson** : 3 circuits linéaires de 5, 8 et 12 combats dans la Carrière, boss final et récompenses de circuit
- ⛶ **Plein écran forcé & Sélection claire (nouveau V7.3)** : écran-titre « ENTRER DANS L’ARÈNE » qui bascule immédiatement en plein écran paysage (portrait bloqué sans échappatoire sur téléphone), menus réduits à l’icône + nom court, et sélection en grandes figurines plein corps — posture, membres, visages et armes lisibles, nom seul, façon captures du propriétaire.
- 🎥 **Réalité 3D II (nouveau V7.2)** : proportions humaines recalculées (épaules ~48 cm, torse aplati, tête réduite), torse bicolore, jupes volumiques, grain de matière procédural, caméra basse en léger 3/4 avec zoom de distance, arènes enrichies (train de Tokyo, allées du stade, plateforme panneautée) et HUD de combat fin et semi-transparent. Refonte 100 % visuelle : simulation, M1, replays et Online inchangés.
- 🌅 **Tournoi & Saisons (nouveau V7.1)** : vrais brackets locaux à élimination directe de **4, 8 ou 16 participants**. Tu joues tes matchs, les autres affiches CPU sont simulées de façon déterministe, ton bracket se sauvegarde et la **Saison 1 — Aurore de Libreville** transforme tes classements en points, paliers XP/Godson et titres.
- 🥋 **Entraînement** : mannequin réglable, vie/temps illimités
- 🎯 **Défis & carrière** *(nouveau V2.4)* : combo x6, 3 parry, 10 victoires, Survie vague 5, Arcade et saga complète, avec barres de progression
- 🎬 **Replay Studio** *(V2.6 + bibliothèque V2.7)* : conserve plusieurs matchs exactement comme ils se sont joués — *lockstep*, pause, vitesses 0,5×/1×/2×/4×, favoris protégés, renommage, suppression et **hash de vérification**. Le replay ne modifie jamais ton profil.
- 🏅 **Hall of Fame** : Top 10 local de tes meilleurs scores + grades de carrière (Débutant → 👑 Légende Godson)
- 📱 **2v2 — 2 téléphones (nouveau V6.1)** : même Wi-Fi ou point d’accès, chacun son téléphone ; chaque joueur engage un combattant principal et un réserviste, le perdant d’un segment est relayé, première équipe à deux éliminations victorieuse. Codes `GF61` à copier/partager, aucun compte ni classement.
- 🌐 **Godson FURY Online** *(lancé en V3.0 sous le nom GO GAME Online)* : compte Supabase, profil mondial, **salon privé par code**, duel WebRTC en lockstep, classement uniquement co-vérifié, sauvegarde cloud et replays publics/privés. Les deux joueurs doivent utiliser la même version du jeu.

## 🥋 Les 41 combattants

👊 **Nouveau V5.1 — M1 Signature individuel :** chaque combattant possède sa propre
chaîne de 3 à 5 coups, exécutée en **martelant simplement le bouton POING** au sol.
168 coups nommés uniques composent ces 41 enchaînements (détail complet et réglages
dans `docs/SPRINT_V51_M1_SIGNATURE.md`). Exemples : Gideon « Foudre du Champion »,
KAEL « Croisade d’Acier », Zara « Marée de Libreville », TITAN « Marteau de la Montagne ».

⛶ **Nouveau V7.3 — Plein écran & Sélection claire :** ouverture directe en plein écran paysage, menus sans textes inutiles et grille de combattants plein corps. 🎥 **V7.2 — Réalité 3D II :** cinq passes de rendu relues image par image pour quitter l’aspect « dessin d’enfant » : anatomie normalisée, matières grainées, lumière et caméra de combat retravaillées, décors densifiés et zone de combat dégagée. 🌅 **V7.1 — Tournoi & Saisons :** Coupe Express, Coupe Godson et Coupe des Légendes ; têtes de série, scores CPU reproductibles, reprise persistante, historique et cinq paliers de Saison 1. Les points ne sont crédités qu’à la fin du tournoi pour empêcher le farming par abandon.

🗿 **V7.0 — Anatomie AAA :** torse et tête sculptés par niveaux, membres musculaires loftés, visage/mains/bottes volumiques, posture 3/4, atlas de matières peau/tissu/cuir/métal/tech, bump mapping et ombres PCF. Toute la géométrie reste procédurale et la simulation déterministe inchangée.

🎭 **Maquettes Vivantes (V6.1, conservées) :** les 41 combattants ont une fiche 3D explicite tirée des maquettes — muscles, proportions, famille de corps, tenue/armure, cheveux ou casque, cape/tissus, équipement de dos et arme. Les impacts ne gèlent plus jamais la simulation, et l’interface entière adopte les matériaux et couleurs de l’arène active.

🧊 **Réalité 3D (depuis V6.0) :** les combats sont dessinés par un moteur **WebGL maison** : combattants humanoïdes articulés en volume, caméra perspective, éclairage dynamique, ombres de contact, projectiles/effets 3D et les 4 arènes reconstruites en profondeur. Dans **Réglages → Rendu de combat 3D**, choisis Automatique, Toujours ou le retour immédiat à la 2D classique ; sans WebGL, le repli est automatique.

🎨 **Graphismes AAA II (V5.3, conservés en 2D) :** ombres portées directionnelles selon la lumière de l’arène, reflets et halos au sol, sprites d’impact spectaculaires pour garde/parry/projectiles/M1, et **motif de tenue des planches propre à chacun des 41 combattants** (couronne, vague, lame, circuit, rune, montagne, Givre, aile…).

| Personnage | Style | Spécial (50%) / SUPER (100%) uniques |
|---|---|---|
| **GÉDÉON** | Champion équilibré | ⚡ Foudre Gideon / 🌟 Jugement perforant |
| **Kira** | Foudre ultra-rapide | 🌪️ Rafale ×3 / ⚡ Tempête de 5 lames |
| **TITAN** | Montagne : 120 PV | 🌋 Onde sismique au sol / ☄️ Séisme |
| **NOVA** | Maîtresse de l'énergie | 🔮 Orbe chercheuse / 🌠 Pluie de météores |
| 👑 **GODSON PRIME** | **Secret** (finir le Chapitre 1) | 👑 Double vague / Triple Jugement royal |
| **Zara** *(nouvelle V2.4)* | Vague rapide de Libreville | 🌊 Lames de Marée ×2 / 🌀 Raz-de-Marée au sol |
| **KAEL** *(nouveau V3.6)* | Guerrier d'Acier : 112 PV, grande allonge | ⚔️ Lame perforante / ⚔️ Croisade d'Acier ×3 |
| **Sora** *(nouvelle V3.6)* | Magicienne flottante, énergie ×1,4 | 🔮 Orbe chercheuse / ☄️ Comète Pourpre ×3 |
| **AEL-7** *(nouveau V3.6)* | Synthétique ultra-rapide | 🔷 Double plasma / 🛰️ Canon Orbital |
| **+32 héros des planches** *(V4.3)* | **Les 35 designs des 3 planches du propriétaire sont tous jouables** : Lira, Zed, Nyx, Vorak, Aerin, Korben, Lyra, Drakesh, Selene, Taiko, Vex, Elara, Brax, Kazu, Sera, Vorga, Nox, Raven, Zep, Astrid, Sélénia, Drakar, Nyx, Kairos, Zara, Brutus, Aria, Krak, Luna, Velen, Lyra, Orion — chacun avec ses stats, sa morphologie, son spécial/son EX/son super | voir `docs/CONCEPTS_PERSONNAGES.md` |

## 🏟️ Arènes
🌇 Stade Gideon Sunset • 🌧️ Néon Tokyo Pluie • ⛩️ Temple Céleste • 🌴 **Plage de Libreville au coucher de soleil** — musiques dédiées, caméra dynamique et **Arena Moods V2.8** : chaque lieu peut se jouer en **Jour, Crépuscule ou Nuit**, ou en Auto signature.

## ⌨️ Commandes
| Action | Joueur 1 (AZERTY) | Joueur 2 |
|---|---|---|
| Bouger / courir | `Q` `D` | `⬅` `➡` |
| Saut variable | `Z` | `⬆` |
| Accroupi / Garde | `S` | `⬇` |
| Poing (répété = **M1 Signature**) / Pied / Spécial | `F` / `G` / `H` | `K` / `L` / `M` |
| Dash | `Maj` ou double-direction | `Maj droite` / `O` |
| Pause | `P` / `Échap` | — |

📱 **Tactile V5.2 (décision d’équipe)** : **joystick analogique à gauche** (◀ ▶ bouger, ▲ sauter, ▼ garde/modificateur, diagonales acceptées) et actions à droite — Spécial, Dash, Garde, Pied et grand **POING • M1**. Dans **Réglages → Format d’écran**, choisis **Adaptatif** (recommandé : scène nette + touches aux bords), **Cinéma 16:9** ou **Plein cadre** recadré sans déformation.

🔥 **Techniques** : 👊 **POING répété = M1 Signature** (combo unique de 3 à 5 coups selon le combattant) • ⬇+Poing = Uppercut (lance en l'air) → saut + Pied = jongle • ⬇+Pied = Balayage • Poing → Pied → Spécial (annulations) • 🤼 **Projection** = Poing+Pied au corps-à-corps (traverse la garde, direction = sens) • ✨ **EX** = Spécial+Poing à 75% • ⚡ **Godson Cancel** = Dash après impact confirmé pour 25% (1×/combo) • CONTRE = +25% • Énergie 100% = SUPER unique • ✨ **Parry** : tape la garde juste avant l'impact (bouclier doré) = 0 dégât + riposte à +35% !

## ⚙️ Personnalisation & progression
Noms, initiales, couleurs (tenues/auras/projectiles), volumes, qualité auto selon FPS, format d’écran, **rendu 3D Auto/Toujours/2D**, durée/rounds/vitesse des matchs — tout est **sauvegardé automatiquement**, avec statistiques de carrière, quêtes, défis, succès, tenue « Coucher de soleil de Libreville » déblocable et classement Hall of Fame. La V7.1 ajoute les points de la Saison 1, cinq paliers de récompenses, les titres de saison, l’historique des tournois et la reprise du bracket actif.

## 🌐 Godson FURY Online & combat pro (lancé en V3.0)
- **Compte & profil** : inscription/connexion email via Supabase Auth, pseudo public unique, pays et combattant principal. Le mot de passe n’est jamais stocké par le jeu.
- **Duel privé** : l’hôte crée un code de salon, choisit l’arène/ambiance et les règles ; l’invité rejoint avec le code. Supabase sert à la signalisation, puis les navigateurs échangent directement leurs inputs via **WebRTC**.
- **Netcode lockstep** : seuls des masques d’inputs de 8 bits circulent, avec délai adaptatif, checksums périodiques et arrêt propre en cas de désynchronisation/déconnexion. La pause et le turbo local sont désactivés pour garder les deux simulations identiques.
- **Classement anti-triche** : aucun navigateur ne peut insérer directement un résultat vérifié. Les deux clients envoient un claim à l’Edge Function `submit-match-result` ; le classement n’est mis à jour que si joueurs, vainqueur et hash final concordent.
- **Cloud** : sauvegarde/restauration du profil et publication/import de replays déterministes, publics ou privés.
- **Deux téléphones en local (V6.1)** : l’hôte crée une invitation `GF61`, l’invité renvoie une réponse, puis l’hôte connecte et lance. Le duel réutilise WebRTC/lockstep sur le Wi-Fi/point d’accès, avec confirmation de démarrage ordonnée, sans Supabase ; le partage système (Bluetooth/appareil proche) peut transmettre les codes, mais ne transporte pas le combat.
- **Combat enrichi** : projection anti-garde avant/arrière, EX pour chacun des 41 combattants, Godson Cancel, backdash défensif, scaling anti-combo infini, bot qui projette/utilise les EX et arsenal affiché à la sélection.
- **Performance** : métriques CPU/logic/render, échelle FX adaptative et qualité automatique renforcée pour protéger les 60 FPS sans sacrifier la lisibilité.

## 🕺 Animation humaine & décors vivants (V2.5)
- **Corps vivant** : respiration visible, tête qui suit l’adversaire, épaules et hanches qui se tordent séparément, poids transféré d’un appui à l’autre.
- **Locomotion** : foulée alternée proportionnelle à la vitesse réelle, pieds qui se lèvent, genoux articulés, bras en balancier opposé, accélération/freinage plus humains.
- **Attaques** : chaque coup recule d’abord (*anticipation*), frappe avec une courbe rapide, puis récupère en douceur (*follow-through*) au lieu de changer de pose d’un coup.
- **Retournements souples** : le personnage pivote progressivement au lieu d’être retourné instantanément comme une image.
- **Arènes peuplées** : passants qui marchent réellement au Stade, sous parapluies à Néon Tokyo, au Temple et sur la Plage de Libreville ; ola des supporters, drapeaux au vent et pirogues qui tanguent.

## 🎬 Replay Studio déterministe (V2.6 → V2.7)
- **Enregistrement lockstep** : les entrées finales des deux combattants — clavier, tactile, manettes ou décisions déjà produites par le bot — sont encodées en masques 8 bits et compactées en événements de changement.
- **Relecture fidèle** : mêmes personnages, arène, règles, vie/énergie de départ et graine visuelle ; checkpoints d’état tous les 300 frames et hash final.
- **Lecteur intégré** : ⏮ redémarrer, ⏸/▶ pause (touche `P`), vitesses 0,5× à 4×, barre de progression et statut « ✅ Replay vérifié ».
- **Bibliothèque locale** : 8 replays en rotation normale, favoris protégés, titres personnalisés, cartes détaillées et migration automatique du replay V2.6.
- **Zéro effet de bord** : statistiques, succès, progression, scores et Hall of Fame sont verrouillés pendant la lecture ; les réglages du joueur sont restaurés à la sortie.
- **Victoires signées** : chaque combattant conclut le match par sa phrase de victoire, aussi affichée après un replay vérifié.

## 🌤️ Arena Moods, VFX signatures & tactile (V2.8)
- **Ambiances** : Auto signature ou Jour/Crépuscule/Nuit forcé pour les 4 arènes. Le ciel, le sol, la vignette, le grade coloré, les étoiles et l’astre changent sans assombrir les combattants.
- **Replay fidèle à la lumière** : l’ambiance effective est enregistrée dans le replay puis restaurée à la lecture ; les anciens replays restent en Auto.
- **VFX signatures** : éclairs de Gideon, traînées de Kira, éclats sismiques de Titan, orbites de Nova, couronne de Godson Prime et écume de Zara autour de leurs projectiles.
- **Tactile multi-touch** : chaque doigt est suivi par `pointerId`, les boutons affichent leur état enfoncé et un nettoyage global empêche les touches collées.

## 🏭 Studio Gideon - Godson ARENA
| Membre | Rôle | Responsabilités |
|---|---|---|
| Assistant Arena | **Manager & Développeur principal** | Vision, priorités, intégration, releases |
| **Nadia** | Lead Game Designer | Combat, équilibrage, modes, narration (`docs/GAME_DESIGN.md`) |
| **Kenzo** | Directeur Artistique & Rendering Lead | Pipeline de rendu en 7 passes, VFX, lumière, post-traitement (`docs/ARCHITECTURE.md`) |
| **Sarah** | Lead QA, Performance & Release | Tests, budgets performance, veto qualité (`docs/QA_QUALITE.md`, `tools/qa-check.py`) |
| **Marco** | Direction artistique personnages | Anatomie HD, tenues signatures, matières et silhouettes inspirées des planches |
| **Lena** | UX plein écran & ergonomie | Coque arcade 100 % viewport, navigation, lisibilité mobile/desktop |

**V7.3 « Plein écran forcé & Sélection claire »** : porte d’entrée immersive paysage, portrait bloqué, menus icône+nom et sélection plein corps lisible. **V7.2 « Réalité 3D II »** : sprint visuel du propriétaire — anatomie humaine normalisée, torse bicolore et jupes volumiques, grain procédural et spéculaire dompté, caméra basse 3/4 dynamique, arènes enrichies et HUD compact ; aucune modification de simulation. **V7.1 « Tournoi & Saisons »** : brackets locaux persistants 4/8/16, affiches CPU déterministes selon la cote des combattants, classement final même après élimination, Saison 1 « Aurore de Libreville » avec points anti-farming, cinq paliers XP/Godson et titres équipables. **V7.0 « Anatomie AAA »** : refonte sculpturale des 41 combattants — torse en superellipse, tête en neuf niveaux, membres/mains/bottes loftés, matières procédurales, bump WebGL1/WebGL2, ombres PCF cadencées, posture 3/4 et passe de performance mesurée. **V6.1 « Maquettes Vivantes & 2v2 deux téléphones »** : sprint né des corrections du propriétaire — zéro gel d’impact, 41 fiches 3D de muscles/tenues/coiffures/armes d’après les maquettes, interface construite dans les matériaux de l’arène et duel local WebRTC où chaque joueur engage deux combattants sur son propre téléphone. **V6.0 « Réalité 3D »** : pivot demandé par le propriétaire — vrai moteur WebGL maison, 41 combattants humanoïdes articulés, 4 arènes volumiques, caméra perspective et mouvements humains (course, sauts, garde, chutes, M1) ; la simulation déterministe reste inchangée et la 2D AAA II devient le repli automatique/manuel. **V5.3 « Graphismes AAA II »** : les combattants sont ancrés par des ombres portées en 3 couches, les impacts deviennent des sprites procéduraux typés (garde, parry, projectile, M1 et final M1) et chaque héros porte un médaillon de tenue issu des planches — refonte 100 % visuelle, hash déterministe inchangé. **V5.2 « Écran Adaptatif & Joystick Pro »** : après consultation de toute l’équipe, le tactile passe au **joystick gauche 8 directions** et à un cluster droit dominé par le bouton POING•M1 ; trois formats d’écran sauvegardés (Adaptatif par défaut, Cinéma 16:9, Plein cadre) utilisent tout l’appareil sans jamais étirer les personnages ni casser le déterminisme. **V5.1 « Godson FURY — M1 Signature »** : nouveau nom officiel **Godson FURY ARENA** et travail individuel des 41 combattants — chacun reçoit une chaîne M1 spécifique de 3 à 5 coups (168 coups nommés uniques), exécutable en martelant POING, avec tracking, final signature et affichage en sélection/VS. **V5.0 « Édition Jeu Complet »** : le mini-jeu devient un jeu — carrière permanente (XP, niveaux 1→50, rangs, monnaie Godson, titres), **Championnat Godson** en 3 circuits de 5/8/12 combats avec boss, 12 quêtes de carrière, boutique de récompenses, hub principal avec progression et prochain objectif toujours visibles. **V4.4 « Navigation Pro & Tenues de combat »** : recherche instantanée et filtres par famille (Rapides, Colosses, Énergie, Tech, Lames) pour trouver son combattant parmi 41, barres d’action toujours visibles, grilles à défilement interne, navigation clavier par colonnes réelles — et tenues de combat peintes (ouverture, col, plis) sur tous les combattants. **V4.3 « Roster complet des planches »** : les 35 personnages des 3 planches du propriétaire sont désormais tous jouables (41 combattants), avec morphologies, palettes et coups spéciaux dédiés, Arcade/Survie alimentés par tout le roster et grille de sélection dense. **V4.2 « Graphismes AAA »** : peinture cylindrique des membres, lumière d'arène sur les combattants, rayons et poussières d'ambiance, avant-plans de profondeur par arène. **V4.1 « Peinture & Présentation »** : écran VS plein corps animé et face à face, bandeaux nominatifs cinématographiques en intro de round, métal brossé, cœur d’énergie, étincelles arcaniques et tissus peints par personnage. **V4.0 « Arcade plein écran & anatomie HD »** : le jeu quitte le cadre de page — scène 16:9 maximale sur tout le viewport, barre système intégrée puis masquée en combat, proportions adultes allongées, membres ombrés comme des volumes, tenues signatures par personnage et caméra de combat jusqu’à 1,34×. **V3.7 « Sélection & Corps pleins »** : écran de sélection reconstruit avec portraits animés du vrai moteur, bordures colorées à halo/reflet/pulsation, grand aperçu nommé avec statistiques, navigation par flèches, et combattants aux membres pleins — bras, jambes, torse, gants et chaussures bien visibles, sans toucher aux hitboxes ni au déterminisme. **V3.6 « Nouveaux Champions »** : les planches de personnages du propriétaire deviennent 3 combattants jouables — KAEL le Guerrier d'Acier, Sora la Magicienne et AEL-7 le Synthétique — avec morphologies, signatures VFX et EX dédiés ; roster porté à 9 sans toucher à l'Histoire ni aux sauvegardes. **V3.5 « Prise en main paysage & impacts fluides »** : tenu à deux mains en paysage, le combat devient immersif (arène pleine hauteur, pause flottante, pouces et encoches respectés) et le gel d’impact passe de 42–105 ms à 14–48 ms — les coups ne ralentissent plus le jeu. **V3.4 « Zone de combat dégagée »** : boutons tactiles compacts et semi-transparents dans les coins, plus de plaque de nom sur les combattants, écran géant des arènes discret pendant les combats, textes de dégâts espacés et halo de lumière qui suit l’action. **V3.3 « Flux d’écrans & Chargement »** : écran de chargement rapide, puis un vrai parcours Menu → Personnages → Arène → Difficulté → VS, avec indicateur d’étapes et transitions. **V3.2 « Paysage & Interface Épurée »** : le jeu se joue en paysage (invite à tourner l’appareil, plein écran immersif, pause protectrice en portrait) et l’interface respire — textes superflus supprimés, aide repliée, scène toujours visible sans défiler. **V3.1 « Humanité++ »** : personnages aux proportions adultes, visages expressifs, regard vivant, membres articulés en IK et fatigue visible — refonte 100 % visuelle, sans toucher aux hitboxes, aux replays ni au netcode. **V3.0 « GO GAME Online & Combat Pro »** : duels privés WebRTC lockstep, classement mondial co-vérifié, profils/sauvegardes/replays cloud, projections, EX uniques et Godson Cancel. Arena Moods V2.8, le Replay Studio V2.7, les replays déterministes V2.6, l’animation humaine V2.5 et Libreville V2.4 restent intégralement conservés — et tout le jeu local reste jouable hors ligne.

## 🧱 Projet (gestion professionnelle)
```
├── Godson-FURY-Arena-V7.1-PRO.html   ⭐ build autonome (655 Ko)
├── index.html + src/ (engine/render/render3d/ui/style)
├── docs/ EQUIPE • ARCHITECTURE • GAME_DESIGN • QA_QUALITE • ROADMAP • sprints
├── tests/smoke-test.js   → 453 assertions source / 689 vérifications affichées ✅
├── supabase/ migrations • Edge Function • configuration publique
└── tools/ build-single.py • qa-check.py • supabase-smoke.mjs
```
Chaque livraison suit la **Definition of Done** du manager : syntaxe vérifiée, tests 100% verts, build régénéré, documentation à jour, commit Git + tag de version.

---
✍️ **Un jeu signé Gideon - Godson © 2026 — Libreville, Gabon** 🇬🇦
