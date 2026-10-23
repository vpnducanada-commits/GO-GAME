# 📜 CHANGELOG — GÉDÉON - Godson ARENA

Toutes les versions officielles du jeu, de la plus récente à la plus ancienne.
Gestion de projet : Manager & Développeur principal (Assistant Arena) • Propriétaire : Gideon - Godson.

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
