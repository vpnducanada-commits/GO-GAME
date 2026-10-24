# 📜 CHANGELOG — GÉDÉON - Godson ARENA

Toutes les versions officielles du jeu, de la plus récente à la plus ancienne.
Gestion de projet : Manager & Développeur principal (Assistant Arena) • Propriétaire : Gideon - Godson.

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
