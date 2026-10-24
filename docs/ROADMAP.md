# 🗺️ ROADMAP OFFICIELLE — GÉDÉON - Godson ARENA

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

## 🔜 SPRINT 09 — « Compétition locale » *(envisagé)*
- **Nadia** : tournoi local en tableau, défi tournant et équilibrage post-Zara fondé sur les données de combat
- **Manager** : historique de tournoi et récompenses cosmétiques locales

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

## ✅ V5.0 — « Édition Jeu Complet » *(LIVRÉ le 24/10/2026 — 342 assertions source / 577 vérifications, suite verte)*

- **Carrière Godson** : XP, niveaux 1→50, rangs, monnaie Godson, titres équipables et 12 quêtes relient Campagne, Championnat, Survie, Défis et Online dans une seule boucle de progression.
- **Championnat Godson** : l'Arcade devient 3 circuits (Stade 5, Monde 8, Légendes 12 combats) à adversaires uniques, arènes imposées, difficulté croissante et boss final (GODSON PRIME sur Légendes).
- **Hub principal vivant** : niveau, barre XP, Godson, titre et prochain objectif toujours visibles ; écran Carrière avec circuits, quêtes, récompenses et parcours complet du jeu.
- Anciens profils migrés honorifiquement (XP/Godson selon l'historique) ; déterminisme et replays préservés. Voir `docs/SPRINT_V50_JEU_COMPLET.md`.
- 🔜 **V5.1 Graphismes AAA II** : ombres portées directionnelles, impacts en sprites, tenues fidèles aux planches (capuches, robes, fourrures). **V5.2** : tournoi à brackets + saisons de carrière. **V5.3** : Online public selon validation réseau réelle entre deux appareils.

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
