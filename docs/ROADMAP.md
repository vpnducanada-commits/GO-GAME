# 🗺️ ROADMAP OFFICIELLE — Godson FURY ARENA *(anciennement GÉDÉON - Godson ARENA)*

*Mise à jour par le Manager & Développeur principal. Propriétaire : Gideon - Godson.*

## ✅ Déjà livré
### V1.0 — Prototype (22/12/2026)
Combat 1v1, modes Bot (3 difficultés) et 2 joueurs, fichier unique.

### V2.0 PRO — Édition professionnelle (22-10- 2026)
Moteur 60 Hz interpolé, caméra dynamique, dash/uppercut/balayage, combos annulables et jongles,
4 combattants, 3 arènes animées, modes Arcade + Entraînement, personnalisation + sauvegardes,
écran VS, statistiques de match, qualité auto-adaptative, 24 tests automatisés verts.

---

## ✅ SPRINT 01 — V2.1 « Progression & Histoire » *(LIVRÉ le 22/10/2026 — 44/44 tests verts)*
**Objectif manager** : transformer un excellent jeu d'arcade en jeu auquel on **revient** : objectifs, récompenses, records.

| # | Livrable | Critère d'acceptation |
|---|---|---|
| 1 | Gouvernance projet (charte, roadmap, changelog, Git) | Documents présents, dépôt versionné, tag `v2.1.0` |
| 2 | 📖 **Mode Histoire — Chapitre 1** : 3 combats scénarisés avec dialogues, objectifs, sauvegarde de progression, fin + récompense | Jouable du début à la fin, reprise possible après fermeture |
| 3 | 👑 **GODSON PRIME** : 5e personnage secret déblocable (finir l'Histoire), super attaque triple | Verrouillé au départ, déblocage persistant |
| 4 | 🏅 **Hall of Fame** : classement local Top 10 des scores (tous modes hors entraînement) | Score enregistré après chaque match, tableau consultable |
| 5 | Grades de carrière (Débutant → Légende Godson) | Affichés dans l'en-tête et le menu |
| 6 | Qualité : tests étendus (Histoire, déblocage, classement), build 1-fichier V2.1 | Tous les tests verts, Definition of Done respectée |

## ✅ SPRINT 02 — V2.2 « Profondeur de combat » *(LIVRÉ le 22/10/2026 — 63/63 tests verts)*
- ✅ Supers **uniques par personnage** : rafale/tempête de lames (Kira), onde sismique/séisme (Titan), orbe chercheuse/pluie de météores (Nova), jugement perforant (Gideon), doubles/triples vagues royales (GODSON PRIME)
- ✅ Garde parfaite (*parry*) : fenêtre ~150 ms, 0 dégât, riposte +35%, bot capable de parry selon difficulté
- ✅ Mode **Survie** : vagues infinies, +35% de vie entre vagues, boss toutes les 5 vagues, score cumulé au Hall of Fame
- ↪️ Replays des combos **reportés au Sprint 03** (exigent une graine aléatoire déterministe — décision technique du manager)

## ✅ SPRINT 03 — V2.3 « Studio Quality » *(LIVRÉ le 22/10/2026 — décision PO)*
*Décision du Product Owner : agrandir l’équipe et structurer le studio avant d’ajouter du contenu.*
- 🏭 Équipe de 4 : Manager (Assistant Arena) + **Nadia** (Design), **Kenzo** (Rendu/Tech Art), **Sarah** (QA/Performance) — voir `docs/EQUIPE.md`
- 🎼 Pipeline de rendu en 7 passes + cache de dégradés + post-traitement par arène (Kenzo)
- 🛡️ Gate QA automatique `tools/qa-check.py` + 73 tests d’exécution (Sarah)
- 📐 Docs `ARCHITECTURE`, `GAME_DESIGN`, `QA_QUALITE` + board Sprint 03

## ✅ SPRINT 04 — V2.4 « Libreville Rising » *(LIVRÉ le 23/10/2026 — 94/94 tests verts)*
- 🥋 **Zara** (6e combattante, jouable immédiatement) : Lames de Marée ×2 et Raz-de-Marée géant
- 🌴 **Plage de Libreville** : océan animé, palmiers, pirogues, soleil couchant, musique dédiée
- 📖 **Chapitre 2** : combats 4 à 6 (Zara, Nova Déchaînée, GODSON PRIME boss ultime), migration douce des anciennes sauvegardes
- 🎯 **Défis & carrière** : 6 objectifs persistants ; 🌅 tenue de Libreville en récompense de saga

## ✅ SPRINT 05 — V2.5 « Human Motion & Living Arenas » *(LIVRÉ le 23/10/2026 — demande directe du PO, 104/104 tests verts)*
- 🕺 Animation corporelle lissée à la fréquence d’écran : respiration, poids, torsion, regard, retournement progressif
- 🏃 Locomotion articulée liée à la vitesse + attaques anticipation → impact → récupération
- 🚶 Passants mobiles dans les 4 arènes, ola de foule, drapeaux et pirogues animées
- ⚡ Optimisations ciblées (cache texte, effets) et métriques d’animation testables

## ✅ SPRINT 06 — V2.6 « Replays déterministes » *(LIVRÉ le 23/10/2026 — 122 assertions source, suite verte)*
- 🎬 **Enregistrement lockstep** des entrées finales des deux combattants (bot inclus), compacté en RLE et persisté localement
- ▶️ **Lecteur intégré** : pause/reprise, 0,5×→4×, redémarrage, progression, sortie propre et restauration des réglages
- 🔐 **Isolation totale** : aucun gain de profil, succès, progression ou Hall of Fame pendant un replay
- ✅ **Preuve Sarah** : vrai match joué uniquement par entrées, relu de bout en bout avec hash final et vainqueur identiques

## ✅ SPRINT 07 — V2.7 « Replay Studio & Victoires » *(LIVRÉ le 23/10/2026 — 136 assertions source, suite verte)*
- 🎬 **Bibliothèque Replay Studio** : 8 replays en rotation, favoris protégés, renommage, suppression et migration du replay V2.6
- 🃏 **Cartes détaillées** : titre, mode, durée, vainqueur, arène, date, dégâts, combo max et hash
- 🏆 **Lignes de victoire** : phrase signature pour les 6 combattants, affichée en fin de match et après replay vérifié
- ✅ **Preuve Sarah** : deuxième vrai match ajouté, ancien replay favori sélectionné dans la bibliothèque puis relu et vérifié

## ✅ SPRINT 08 — V2.8 « Arena Moods & Polish » *(LIVRÉ le 23/10/2026 — 151 assertions source, suite verte)*
- 🌤️ **Arena Moods** : Auto/Jour/Crépuscule/Nuit sur les 4 arènes, avec ciel, sol, poste et atmosphère dédiés
- ✨ **VFX signatures** distincts pour les projectiles des 6 combattants, actifs aussi en qualité basse
- 📱 **Tactile multi-touch** par `pointerId`, retour visuel enfoncé et nettoyage anti-touches collées
- ✅ **Matrice Sarah** : 12 combinaisons d’arène/ambiance, replay Nuit forcée vérifié et préférence du joueur restaurée

## ✅ TRACK V3 — V3.0 « GO GAME Online & Combat Pro » *(LIVRÉ le 24/10/2026 — 194 assertions source, suite verte)*
- 🌐 **GO GAME Online complet** : comptes Supabase, profils mondiaux, cloud saves et replays cloud
- ⚔️ **Salons privés WebRTC** : code d’invitation, signalisation Supabase et duel pair-à-pair en lockstep
- 🏆 **Classement co-vérifié** : claims identiques des deux joueurs et hash final validés par Edge Function
- 🥋 **Combat Pro** : Projection anti-garde, 6 EX uniques, Godson Cancel, backdash défensif et IA enrichie
- 📈 **Performance** : métriques CPU logique/rendu, FX adaptatifs et verrouillage réseau à 60 Hz/100 %

## ✅ V3.1 — « Humanité++ » *(LIVRÉ le 24/10/2026 — 211 assertions source, suite verte)*
- 🧍 **Proportions adultes stylisées** et 6 morphologies distinctes (`HUMAN_PROFILES`), cou/trapèzes/épaules/hanches/mâchoires par combattant
- 🙂 **Visages de trois-quarts expressifs** : iris mobile, clignement, sourcil, bouche (focus/effort/garde/douleur/fatigue/victoire/KO), chevelures signatures inertielles
- 🦵 **Membres volumiques en IK deux segments**, poings et chaussures orientés, buste avec taille/bassin/plis animés, regard qui suit l'adversaire et fatigue visible
- 🎯 **Render-only garanti** : hitboxes, physique, déterminisme, replays et lockstep Online inchangés ; contrôle visuel par captures réelles (lineup + combat)
- 📋 Board du chantier : `docs/SPRINT_V31_HUMANITE.md`

## ✅ V3.2 — « Paysage & Interface Épurée » *(LIVRÉ le 24/10/2026 — 221 assertions source, suite verte)*
- 🌄 **Paysage prioritaire** : scène 16:9 qui tient dans `100dvh`, écran « Tourne ton appareil » en portrait mobile, plein écran + verrouillage d'orientation best effort, pause protectrice en combat local
- 🎬 **Mode cinéma** en paysage court : en-tête compact, pied de page masqué, menus resserrés
- ✂️ **Interface épurée** : barre d'aide sous la scène supprimée, footer d'une ligne, notes et signatures redondantes retirées, techniques repliées, statuts Online et carrière condensés
- 🎯 Présentation uniquement : gameplay, déterminisme, replays et Online inchangés ; board : `docs/SPRINT_V32_PAYSAGE.md`

## ✅ V3.3 — « Flux d'écrans & Chargement » *(LIVRÉ le 24/10/2026 — 234 assertions source, suite verte)*
- ⏳ **Écran de chargement** rapide : progression, étapes, astuces, fondu de sortie, skippable
- 🗂️ **Parcours en étapes** : Menu → Personnages → Arène → Difficulté (bot) → VS, indicateur d'étapes et retours en chaîne
- 🏟️ **Écran Arène dédié** (grandes cartes + Arena Moods ; arène imposée signalée en Histoire/Survie)
- ✨ Transitions d'écran en fondu glissé, cartes personnages et arènes agrandies ; gameplay et Online inchangés — board : `docs/SPRINT_V33_FLUX_ECRANS.md`

## ✅ V3.4 — « Zone de combat dégagée » *(LIVRÉ le 24/10/2026 — 241 assertions source, suite verte)*
- 📱 **Tactile v2** : grille compacte aux coins, boutons ~46–52 px semi-transparents, libellés masqués en paysage court — la scène reste visible
- 🏷️ **Plaques de nom supprimées** en combat (HUD), **écran géant réduit et effacé à 30 %** pendant les combats, **textes flottants espacés** anti-chevauchement
- 💡 **Halo de scène** qui suit l'action pour faire ressortir les combattants ; board : `docs/SPRINT_V34_ZONE_DEGAGEE.md`

## ✅ V3.5 — « Prise en main paysage & impacts fluides » *(LIVRÉ le 24/10/2026 — 248 assertions source, suite verte)*
- 🎮 **Combat immersif paysage** : en-tête masqué pendant les matchs, arène à 100 % de la hauteur, pause flottante, anti-scroll et safe-areas (encoches)
- 👍 Grappes tactiles remontées dans **l'arc des pouces**, aux bords de l'écran
- 🥊 **Gel d'impact divisé par ~3** (14–48 ms au lieu de 42–105 ms, contre ×1,2, parry 38 ms) : plus aucun ralentissement perceptible sur les coups normaux ; ralenti conservé uniquement sur le K.O.
- 🎯 Boucle d'affichage uniquement : déterminisme, replays et Online intacts ; board : `docs/SPRINT_V35_PRISE_EN_MAIN.md`

## ✅ SPRINT 09 — « Compétition locale » *(livré en deux étapes : Championnat V5.0, puis Tournoi V7.1)*
- **Nadia** : tournoi local en tableau 4/8/16 et simulation CPU fondée sur les données des combattants
- **Manager** : historique, points de saison, paliers et titres locaux persistants

## 🌐 Après la V3.0 *(pistes, non engagées)*
## ✅ V3.6 — « Nouveaux Champions » *(LIVRÉ le 24/10/2026 — 263 assertions source / 307 vérifications, suite verte)*
- 🎨 À partir des 3 planches déposées par le propriétaire : **KAEL** (Guerrier d'Acier), **Sora** (Magicienne) et **AEL-7** (Synthétique) deviennent jouables dans le style procédural du jeu ; roster 6 → 9, ajout en fin de grille (Histoire/sauvegardes intacts), présents en Arcade et Survie.
- 🎭 Morphologies, têtes dédiées (chapeau pointu, visière cyan, épaulettes cuirassées), signatures VFX (lames/runes/circuits) et EX uniques ; planches archivées dans `assets/concepts/` (voir `docs/CONCEPTS_PERSONNAGES.md`). Réserve V3.7+ : Muscle, Pirate, Karatéka, Elfe…

## ✅ V3.7 — « Sélection & Corps pleins » *(LIVRÉ le 24/10/2026 — 277 assertions source / 321 vérifications, suite verte)*
- 🃏 Retour direct du propriétaire : sélection reconstruite avec **aperçu animé du vrai combattant dans chaque carte**, bordure aux couleurs du personnage (halo, reflet, pulsation de sélection), grand aperçu par camp avec nom/SUPER/statistiques et navigation par flèches.
- 💪 Corps pleins en combat : jambes et bras volumineux, mollets articulés, torse élargi, gants et chaussures plus présents, présence visuelle +4 % — strictement render-only (hitboxes, replays et Online inchangés).

## ✅ V4.0 — « Arcade plein écran & anatomie HD » *(LIVRÉ le 24/10/2026 — 287 assertions source / 331 vérifications, suite verte)*
- 🖥️ Nouvelle direction du propriétaire (« quitter le mini-jeu ») : coque **100 % viewport**, scène 16:9 maximale, barre système intégrée à la scène et masquée en combat, aucun pied de page ni panneau extérieur.
- 🧍 Personnages : proportions adultes allongées, volumes ombrés, tenues signatures par style et caméra combat 1,34× — présentation inspirée des grandes licences 2D, sans toucher hitboxes/déterminisme/Online.
- 🔜 Trajectoire V4 : V4.1 → V4.4 livrées ci-dessous. Priorités du propriétaire : visuel AAA (V4.2), TOUS les personnages des planches (V4.3), navigation/affichage professionnels (V4.4). Cap suivant décidé par le propriétaire : **V5.0 Édition Jeu Complet** (livrée ci-dessous). La compétition locale devient le Championnat Godson ; les priorités Graphismes AAA II et Online public sont reportées en V5.1/V5.3.

## ✅ V7.8 — « Arènes Spectacle » *(LIVRÉ le 25/10/2026 — 491 assertions source / 727 vérifications, suite verte)*

- **Trajectoire graphique du propriétaire, étape décors** : après les postures (V7.4), les têtes (V7.5), la mobilité (V7.6) et la présence (V7.7), les quatre arènes 3D deviennent des scènes vivantes qui réagissent au match.
- **Stade** : vague de bras des tribunes synchronisée avec la foule statique, écran géant animé (égaliseur + balayage), sièges continus, tribunes de retour et arche technique avec enceintes.
- **Tokyo / Temple / Libreville** : second train qui traverse la ville et skyline lointaine ; braises dorées, pagodes et collines au loin ; pirogue à voile avec sillage, écume mobile, caps boisés et lanternes du front de mer.
- **Lumière de spectacle** : faisceaux volumiques et flaques au sol, état partagé d’intensité (vie, combos, énergie, célébration de fin de round), pulsations par arène et poussières d’ambiance — réglés finement après relecture des captures (rayons du temple parallèles et discrets, pirogue rapprochée et agrandie).
- **Périmètre** : rendu seul, quantités bornées par le niveau de qualité, zone de combat toujours dégagée ; stade optimisé à 61 005 sommets en scène complète. Voir `docs/SPRINT_V78_ARENES_SPECTACLE.md`.
- 🔜 Prochaines étapes possibles : validation terrain sur téléphones physiques, duel Online entre deux réseaux distincts, puis nouvelle passe personnages ou modes selon la priorité du propriétaire.

## ✅ V7.7 — « Présence Vivante » *(LIVRÉ le 25/10/2026 — 485 assertions source / 721 vérifications, suite verte)*

- **Trajectoire graphique du propriétaire** : après les postures (V7.4), les têtes (V7.5) et la mobilité (V7.6), les combattants gagnent un langage corporel lisible en plein combat.
- **Visages** : expressions focus/attaque/douleur/garde/parry/fatigue/victoire/K.O., regard poursuivant l’adversaire, paupières, sourcils segmentés, bouche avec dents/langue ; visières et capuches expriment aussi l’état.
- **Mains & armes** : trois phalanges par doigt et pouce opposé, fermeture continue paume→poing→prise, main de soutien placée sur fusil, bâton/lance, katana et haches/massues.
- **Appuis & impact** : bottes articulées talon-pointe en course, pied pointé en frappe/air, semelle orientée ; tête, épaules, mains, cheveux et tissus absorbent les impacts sans aucun gel.
- **Périmètre** : rendu seul, aucune constante de simulation modifiée. Voir `docs/SPRINT_V77_PRESENCE_VIVANTE.md`.
- 🔜 Prochaines étapes possibles : validation terrain sur téléphones physiques, duel Online entre deux réseaux distincts, puis nouvelle passe décors/lumière si le propriétaire la priorise.

## ✅ V7.6 — « Mobilité Dynamique » *(LIVRÉ le 25/10/2026 — 478 assertions source / 714 vérifications, suite verte)*

- **Demande directe du propriétaire** : « Continuez le travail et travaillez aussi la mobilité, que ça soit plus fluide et dynamique. »
- **Contrôle** : profil direct plus vif (accélération, demi-tour, course progressive, air, dash 13 frames, coyote 8 frames, tampons élargis, contact amorti) et profil `legacy` exact pour relire les replays antérieurs.
- **Animation** : foulée avancée par la distance interpolée affichée, phases d’attaque fractionnaires pour 90/120 Hz, ressorts de pivot/décollage/réception et traînées de dash en 3D.
- **Caméras** : anticipation de vitesse en 2D/3D, caméra 3D amortie et cadrage vertical qui garde le sommet d’un saut dans l’image.
- **Preuves** : mesures navigateur de course/dash/saut/demi-tour/réception et captures WebGL relues, zéro erreur ; aucun gel d’impact réintroduit. Voir `docs/SPRINT_V76_MOBILITE_DYNAMIQUE.md`.
- 🔜 Prochaines étapes possibles : expressions faciales 3D en combat, mains/armes plus détaillées, puis validations Online/terrain sur téléphones physiques.

## ✅ V7.5 — « Visages & Costumes » *(LIVRÉ le 25/10/2026 — 470 assertions source / 706 vérifications, suite verte)*

- **Trajectoire graphique du propriétaire, étape têtes** : les fiches prévoyaient 13 coiffures mais le moteur n’en dessinait que 6, avec une coiffe « casque » unique et des barbes en une seule boule.
- **Cheveux** : coiffe sculptée par style (plaquée rasé, basse sous mohawk, panneau arrière descendu long/carré/tresses), mèches d’encadrement des joues pour les coiffures longues et chignon dessiné avec bandeau.
- **Barbes & visages** : barbes en trois volumes proportionnels à la fiche (Brax/Drakar en grandes barbes), peintures de guerre verticales chez les orcs/aliens.
- **Costumes** : ceintures-écharpes contrastées avec boucle pour les tenues martiales/d’exploration ; télémétrie `hair3d`/`beard3d`.
- **Périmètre** : rendu seul, captures gros plan relues (Brax/Zara-nova, Zara/Sora, Krak/Drakar), zéro erreur. Voir `docs/SPRINT_V75_VISAGES_COSTUMES.md`.
- 🔜 Prochaines étapes possibles : expressions faciales en combat 3D (sourcils/bouche selon l’état), mains et armes plus détaillées, puis validations Online/terrain sur téléphones physiques.

## ✅ V7.4 — « Identités de combat » *(LIVRÉ le 25/10/2026 — 466 assertions source / 702 vérifications, suite verte)*

- **Demande directe du propriétaire** (capture de roster à l’appui) : « Travaille sur chaque personnage individuellement, pour que chacun ait ses attaques, sa posture et etc. Regarde l’exemple. »
- **41 fiches `FIGHTER_STANCE3D` nommées et uniques** : pieds, largeur, accroupissement, inclinaison, hauteur des gardes, rebond et torsion propres à chaque héros ; mesures vérifiées en navigateur (Titan large et carré, Taiko bas, Lyra droite garde haute, Kazu presque de profil…).
- **Attaques signées** : 7 styles de poing, 7 styles de pied et 4 poses de spécial répartis selon l’identité (lames, tireurs en visée, colosses en frappe écrasée, mages en orbe), hérités par les chaînes M1.
- **Sélection façon captures du propriétaire** : chaque carte/aperçu fige la posture d’affiche du héros (accroupi, garde, poing, pied levé, sort).
- **Périmètre** : rendu seul — simulation, hitboxes, dégâts, replays/hash, Online et Tournoi inchangés. Voir `docs/SPRINT_V74_IDENTITES_COMBAT.md`.
- 🔜 Suite de la trajectoire : visages/cheveux/costumes auteur par famille en 3D, puis validations Online entre deux réseaux et terrain sur téléphones physiques.

## ✅ V7.3 — « Plein écran forcé & Sélection claire » *(LIVRÉ le 25/10/2026 — 461 assertions source / 697 vérifications, suite verte)*

- **Demandes directes du propriétaire** (avec captures de référence) : « le jeu doit directement s’ouvrir en plein écran paysage, ça doit être forcé », « la page du menu a trop de textes inutiles (M1, signature…) », et une sélection où l’on voit « la posture, les membres, les visages, les objets ».
- **Plein écran forcé** : écran-titre « ▶ ENTRER DANS L’ARÈNE » (le plein écran navigateur exige un geste), verrouillage paysage immédiat, relance d’immersion à tout contact tactile sans plein écran, et suppression du bouton « Continuer en portrait » — en portrait téléphone, seul l’écran de rotation s’affiche.
- **Menus épurés** : modes en icône + nom court ; descriptions, ligne signature gonflée, mini-notes et bandeau défilant « M1 SIGNATURE • COMBOS » retirés de l’affichage.
- **Sélection plein corps** : cartes agrandies et zoomées façon grille des captures du propriétaire (figurine entière, bordure couleur, nom seul, cadenas minimal), aperçus latéraux grand format sans statistiques ni texte M1.
- **Périmètre** : affichage uniquement — simulation, M1 en combat, replays, Online, Tournoi et données DOM techniques inchangés. Voir `docs/SPRINT_V73_PLEIN_ECRAN_SELECTION.md`.
- 🔜 La trajectoire graphique continue : costumes/visages auteur par famille en 3D et portraits de sélection toujours plus détaillés, plus validations Online/terrain sur téléphones physiques.

## ✅ V7.2 — « Réalité 3D II » *(LIVRÉ le 25/10/2026 — 457 assertions source / 693 vérifications, suite verte)*

- **Instruction du propriétaire** : avant toute validation Online/terrain, « travaillons encore et encore sur le graphisme, le réalisme, la disposition, l’affiche, les mouvements et tout ce qui est jouabilité et affichage » — « tout paraît encore comme un dessin d’enfant ».
- **Cinq passes de rendu relues en captures WebGL réelles** : proportions humaines (épaules ~48 cm, torse aplati, tête −20 %), suppression des volumes plaqués « disques/balles », torse bicolore, jupes annulaires de robes, armes portées en arrière, grain procédural et spéculaire non métallique réduit (fin du plastique), caméra basse en léger 3/4 avec zoom de distance, plateforme panneautée, allées du stade, train de Tokyo, écume segmentée de Libreville et HUD de combat compact.
- **Périmètre strict** : 100 % rendu/affichage — simulation déterministe, hitboxes, dégâts, M1, replays, lockstep, 2v2 Relais local et salons Supabase 1v1 inchangés ; repli 2D AAA II conservé.
- **Preuves Sarah** : contrôle QA n°35, quatre duels capturés (18 430–54 582 sommets, zéro erreur), hash de replay inchangé par le rendu. Limite assumée : géométrie toujours procédurale stylisée ; les FPS réels restent à mesurer sur téléphones physiques. Voir `docs/SPRINT_V72_REALITE_3D_II.md`.
- 🔜 La trajectoire « véritable 3D » continue (V7.3 prévue : visages/cheveux/costumes auteur par famille, éclairage d’arène et animation d’armes), en parallèle des validations Online entre deux réseaux et terrain mobile.

## ✅ V7.1 — « Tournoi & Saisons » *(LIVRÉ le 24/10/2026 — 453 assertions source / 689 vérifications, suite verte)*

- **Arbitrage d’équipe** : le Championnat Godson reste une tournée linéaire ; le nouveau mode `tournament` est un vrai tableau à élimination directe, local et contrôlé par le bot.
- **Trois coupes persistantes** : Express 4, Godson 8 et Légendes 16, avec entrants uniques, têtes de série classiques, difficultés/arènes par tour et combattant joueur verrouillé après le premier match.
- **Simulation CPU déterministe** : cote fondée sur PV, puissance, vitesse, énergie, vitesse d’attaque et portée ; hash propre à la graine du bracket, sans utiliser le hasard des replays. Après une élimination, le tableau se termine et révèle le champion CPU.
- **Saison 1 — Aurore de Libreville** : points de classement + 10 par victoire, crédités une seule fois à la fin ; cinq paliers XP/Godson et titres, statistiques, historique, dernier bracket et archivage préparé pour les saisons suivantes.
- **Intégration complète** : carte du menu principal, écran Bracket/Saison, section Carrière, objectif du hub, quatre quêtes, contexte replay et retour de fin de match vers le tableau. Voir `docs/SPRINT_V71_TOURNOI_SAISONS.md`.
- 🔜 Validation Online publique entre deux réseaux distincts et test terrain sur téléphones physiques ; aucun tournoi réseau ni classement de saison serveur n’est promis en V7.1.

## ✅ V7.0 — « Anatomie AAA » *(LIVRÉ le 24/10/2026 — 434 assertions source / 669 vérifications, suite verte)*

- **Retour direct du propriétaire après V6.1** : les personnages devaient dépasser l’aspect « simples poupées » et viser la présentation des grandes licences 3D de combat, avec le budget nécessaire pour les graphismes et les FPS.
- **Sculpture procédurale des 41 combattants** : torse en superellipse, tête en neuf niveaux, membres musculaires loftés, visage, mains à doigts, bottes, tissus et cheveux segmentés ; posture 3/4 et caméra rapprochée.
- **Matières et lumière** : atlas de huit matières, rugosité/métal/peau par sommet, bump par dérivées (WebGL1 ou GLSL ES 3.00 en WebGL2), éclairage PBR simplifié, ACES et shadow-map PCF cadencée.
- **Performance** : écrivain de sommets brut, caches trigonométriques, sphères scalaires, LOD adaptatif et indices 32 bits ; gain CPU de génération mesuré d’environ 34 % à 48 % dans Chromium headless.
- **Preuves Sarah** : contrôle QA n°33, hash déterministe inchangé et cinq captures avec atlas/ombres/bump actifs. Limite assumée : géométrie procédurale stylisée, pas encore de meshes auteur ni de mesure FPS sur téléphone physique. Voir `docs/SPRINT_V70_ANATOMIE_AAA.md`.
- ↪️ **Tournoi & Saisons livré en V7.1 ci-dessus** ; prochaines validations : Online public entre deux réseaux distincts et test terrain sur téléphones physiques.

## ✅ V6.1 — « Maquettes Vivantes & 2v2 deux téléphones » *(LIVRÉ le 24/10/2026 — 426 assertions source / 661 vérifications, suite verte)*

- **Corrections du propriétaire traitées comme critères de release** : suppression totale du gel/ralenti à l’impact, personnages formalisés d’après les maquettes et interface intégrée au décor plutôt que superposée.
- **41 fiches `BOARD_MODEL3D`** : muscles, proportions, silhouettes, tenues/armures, tissus, coiffures/casques, équipements et armes ; bug de casse des IDs corrigé pour que chaque fiche soit réellement utilisée. WebGL optimisé par caches, batches persistants et buffers réutilisés.
- **Interface-décor** : thèmes des 4 arènes synchronisés vers `--stage-*`, HUD en tableau suspendu, panneaux-consoles, pods tactiles et disposition relue en captures Chromium.
- **2v2 Relais sur deux téléphones** : principal + réserviste par joueur, relève du perdant et victoire à deux éliminations ; WebRTC/lockstep local par codes `GF61`, sans compte/Supabase/classement. Bluetooth réservé au partage éventuel des codes, jamais promis comme transport navigateur du combat.
- **Preuves Sarah** : contrôle QA n°32, zéro mécanisme de gel dans le runtime, relève et replay 2v2 simulés, deux contextes Chromium connectés et plus de 220 frames synchronisées sans désync. Voir `docs/SPRINT_V61_MAQUETTES_2TELEPHONES.md`.
- 🔜 **Tournoi & Saisons** (brackets locaux et récompenses de saison), puis validation Online public entre deux réseaux distincts et test terrain du mode local sur deux téléphones physiques.

## ✅ V6.0 — « Réalité 3D » *(LIVRÉ le 24/10/2026 — 398 assertions source / 633 vérifications, suite verte)*

- **Pivot du propriétaire après V5.3** : vraie 3D temps réel plutôt que le tournoi initialement envisagé ; moteur WebGL maison sans dépendance, canvas `#gl3d` sous l’overlay 2D et HUD/joystick inchangés.
- **41 combattants humanoïdes articulés** : volumes, visages, cheveux, tenues, capes/armures/accessoires, course/saut/garde/coups/M1/chutes pilotés par les profils humains existants.
- **4 arènes volumiques** : Stade en gradins, Néon Tokyo, Temple Céleste et Plage de Libreville, avec caméra perspective, lumières d’ambiance, ombres de contact, projectiles et impacts 3D.
- **Sécurité Sarah** : réglage Auto/Toujours/2D, diagnostic et repli AAA II sans WebGL ; captures Chromium/WebGL réelles des 4 arènes ; hash déterministe inchangé. Voir `docs/SPRINT_V60_REALITE_3D.md`.
- ↪️ La V6.1 ci-dessus a ensuite été réorientée par les corrections du propriétaire vers les Maquettes Vivantes, le zéro gel, l’interface-décor et le 2v2 deux téléphones. Prochain cap : **Tournoi & Saisons** ; Online public toujours conditionné à un duel WebRTC réel entre deux réseaux distincts.

## ✅ V5.3 — « Graphismes AAA II » *(LIVRÉ le 24/10/2026 — 384 assertions source / 619 vérifications, suite verte)*

- **Ombres portées directionnelles** : 3 couches, direction/longueur par ambiance et arène, contacts des pieds, atténuation en l’air, halos et reflets colorés au sol.
- **Sprites d’impact procéduraux** : léger/lourd/projection/contre/projectile/clash/garde/parry/M1/final M1/sol, cache borné à 48 sprites et hash déterministe prouvé inchangé.
- **Tenues des planches** : motif explicite et médaillon signature pour les 41 combattants, initiale du joueur conservée. Voir `docs/SPRINT_V53_GRAPHISMES_AAA2.md`.
- ↪️ Le Tournoi & Saisons alors envisagé en V5.4 a été reporté par le pivot 3D du propriétaire et la livraison V6.0 ci-dessus ; Online public toujours selon validation réseau réelle entre deux réseaux distincts.

## ✅ V5.2 — « Écran Adaptatif & Joystick Pro » *(LIVRÉ le 24/10/2026 — 371 assertions source / 606 vérifications, suite verte)*

- **Consultation complète de l’équipe** à la demande du propriétaire : Lena (joystick au pouce gauche, contrôles aux bords physiques), Nadia (mapping 8 directions + Dash dédié), Kenzo (aucun étirement, logique 1280×720), Marco (grand POING•M1, centre dégagé), Sarah (multi-touch et simulations réelles).
- **Joystick analogique gauche** : course, saut, garde/modificateur et diagonales ; anciens boutons directionnels supprimés. Cluster droit : Spécial, Dash, Garde, Pied et grand POING•M1.
- **Trois formats persistants** : Adaptatif par défaut (scène nette + touches aux bords + safe-areas), Cinéma 16:9 et Plein cadre recadré. Voir `docs/SPRINT_V52_ECRAN_JOYSTICK.md`.
- ↪️ La V5.3 Graphismes AAA II a ensuite été livrée ci-dessus ; le cap suivant devient le Tournoi & Saisons V5.4.

## ✅ V5.1 — « Godson FURY — M1 Signature » *(LIVRÉ le 24/10/2026 — 357 assertions source / 592 vérifications, suite verte)*

- **Nouveau nom officiel** choisi avec l’équipe : **Godson FURY ARENA — L’Arène des Légendes** (signature Gédéon - Godson conservée).
- **Travail individuel des 41 combattants** : chacun reçoit un **M1 spécifique** de 3 à 5 coups (168 coups nommés uniques), avec tempo, portée, puissance, avance et final propres.
- **Combo accessible** : il suffit de marteler **POING** au sol pour dérouler la chaîne en vrai combo ; liaison réglée frame par frame et prouvée en simulation pour les 41/41.
- Bot utilisateur de son propre M1, traînées qui s’intensifient, arsenal/aperçus/VS/aide mis à jour, replays pré-V5.1 relus avec l’ancien poing. Voir `docs/SPRINT_V51_M1_SIGNATURE.md`.
- ↪️ Le cap V5.2 a ensuite été réaffecté par le propriétaire au joystick et au format d’écran ; Graphismes AAA II devient la priorité V5.3.

## ✅ V5.0 — « Édition Jeu Complet » *(LIVRÉ le 24/10/2026 — 342 assertions source / 577 vérifications, suite verte)*

- **Carrière Godson** : XP, niveaux 1→50, rangs, monnaie Godson, titres équipables et 12 quêtes relient Campagne, Championnat, Survie, Défis et Online dans une seule boucle de progression.
- **Championnat Godson** : l'Arcade devient 3 circuits (Stade 5, Monde 8, Légendes 12 combats) à adversaires uniques, arènes imposées, difficulté croissante et boss final (GODSON PRIME sur Légendes).
- **Hub principal vivant** : niveau, barre XP, Godson, titre et prochain objectif toujours visibles ; écran Carrière avec circuits, quêtes, récompenses et parcours complet du jeu.
- Anciens profils migrés honorifiquement (XP/Godson selon l'historique) ; déterminisme et replays préservés. Voir `docs/SPRINT_V50_JEU_COMPLET.md`.
- 🔜 Le cap V5.1 a ensuite été réaffecté par le propriétaire au nouveau nom et aux M1 individuels ; Graphismes AAA II est ensuite devenu la priorité V5.3 après le sprint Joystick V5.2.

## ✅ V4.4 — « Navigation Pro & Tenues de combat » *(LIVRÉ le 24/10/2026 — 327 assertions source / 561 vérifications, suite verte)*

- **Navigation de sélection professionnelle** : recherche instantanée, filtres par famille avec compteur, barres d'action fixes, grilles à défilement interne, clavier par colonnes réelles.
- **Tenues de combat peintes** : ouverture, col et plis du tissu sur les 41 combattants.

## ✅ V4.3 — « Roster complet des planches » *(LIVRÉ le 24/10/2026 — 317 assertions source / 553 vérifications, suite verte)*

- **Les 35 personnages des 3 planches du propriétaire sont jouables** (+32 d'un coup, roster 41) : stats, morphologies, palettes, spécial/EX/super et signatures VFX par archétype ; inventaire fidèle dans `docs/CONCEPTS_PERSONNAGES.md`.
- Arcade/Survie alimentés par tout le roster (boss colosses inclus), grille de sélection dense 41 cartes, indices historiques intacts (Histoire/replays/Online préservés).

## ✅ V4.2 — « Graphismes AAA » *(LIVRÉ le 24/10/2026 — 306 assertions source / 354 vérifications, suite verte)*

- **Peinture cylindrique** des membres (dégradé ombre → lumière → ombre), **rim light aux couleurs de l'arène** et halo de contact teinté, **visage peint** (mâchoire/arête du nez).
- **Atmosphère vivante** : rayons de lumière et poussières flottantes dans chaque arène.
- **Avant-plans de profondeur** par arène (néon clignotant tokyo, piliers du temple, barrières du stade, palmes de Libreville).
- Budget bundle relevé à 384 Ko (mandat visuel) ; gameplay, déterminisme et Online inchangés.

## ✅ V4.1 — « Peinture & Présentation » *(LIVRÉ le 24/10/2026 — 297 assertions source / 341 vérifications, suite verte)*
- 🆚 Écran VS **plein corps animé et face à face**, cadres aux couleurs des combattants ; intro de round avec **bandeaux nominatifs** glissants façon grande licence.
- 🎨 Matières par style : métal brossé + rivets, cœur d’énergie pulsant, étincelles arcaniques, écume, bandages, éclair signature et reflet de chevelure — strictement visuel.

Le socle connecté est livré et documenté dans `docs/V3_GO_GAME_FONDATIONS.md`, `docs/BACKEND_SUPABASE_GO_GAME.md` et `docs/SPRINT_V3_GO_GAME_ONLINE.md`. Les suites possibles sont le matchmaking public, un TURN dédié, la revanche synchronisée, les spectateurs et la relecture serveur des replays de tournoi. Le Sprint 09 local reste le prochain cap de contenu hors ligne.

## ⚠️ Risques & réponses
| Risque | Réponse du manager |
|---|---|
| Perte de fluidité avec le nouveau contenu | Budget particules + qualité auto + tests de rendu des 3 arènes |
| Sauvegardes V2.0 incompatibles | Migration douce du profil (valeurs par défaut fusionnées) |
| Scope creep | 1 thème par sprint, Definition of Done non négociable |

---
✍️ Roadmap officielle — **Gédéon - Godson ARENA**, Libreville, Gabon.
