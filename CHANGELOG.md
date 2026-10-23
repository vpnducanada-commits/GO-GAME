# 📜 CHANGELOG — GÉDÉON - Godson ARENA

Toutes les versions officielles du jeu, de la plus récente à la plus ancienne.
Gestion de projet : Manager & Développeur principal (Assistant Arena) • Propriétaire : Gideon - Godson.

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
