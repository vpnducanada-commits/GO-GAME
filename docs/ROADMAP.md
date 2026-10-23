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

## 🔜 Sprint suivant — à arbitrer par le Manager après retour du PO
- Bibliothèque de plusieurs replays et renommage des meilleurs matchs
- Polish VFX par personnage et variations d’arènes jour/nuit (Kenzo)
- Nouvel équilibrage post-Zara et lignes de victoire (Nadia)

## 🌐 V3.0 « Connecté » *(décision du manager : après validation PO)*
Nécessite un serveur (comptes, classement mondial, duels en ligne). N'engagé qu'après feu vert explicite du Product Owner, car il casse le principe « 1 fichier, zéro installation ».

## ⚠️ Risques & réponses
| Risque | Réponse du manager |
|---|---|
| Perte de fluidité avec le nouveau contenu | Budget particules + qualité auto + tests de rendu des 3 arènes |
| Sauvegardes V2.0 incompatibles | Migration douce du profil (valeurs par défaut fusionnées) |
| Scope creep | 1 thème par sprint, Definition of Done non négociable |

---
✍️ Roadmap officielle — **Gédéon - Godson ARENA**, Libreville, Gabon.
