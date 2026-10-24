# 🏆 Sprint V5.0 — « Édition Jeu Complet »

**Date** : 24/10/2026 • **Propriétaire** : Gideon - Godson
**Équipe** : Manager & développeur principal • Nadia (Design) • Kenzo (Rendu) • Sarah (QA) • Marco (personnages) • Lena (UX)

## 🎯 Directive du propriétaire

> « L'objectif n'est plus de créer un mini-jeu mais de créer un jeu. »

Décision d'équipe : les briques existaient déjà (Campagne 6 combats, Arcade, Survie,
Ballot, 2 Joueurs, Entraînement, Online, Hall of Fame, replays, défis, 41 combattants),
mais **aucune boucle ne les reliait**. La V5 ajoute la couche méta qui transforme une
collection de modes en expérience durable :

**jouer → gagner XP/Godson → monter de niveau → terminer des quêtes → débloquer titres
et récompenses → viser le Championnat → revenir.**

## 1. Carrière Godson (moteur)

- `PROFILE.career` persistant : `xp`, `Godson`, `title`, `titles`, `questsClaimed`,
  `fighterWins`, `circuits`, `bestStage`, `lastReward`.
- Niveaux 1→50 via `careerLevelFromXp` (seuil du niveau n : `50·n·(n−1)` XP) et rangs :
  Débutant → Espoir → Confirmé → Expert → Maître → Grand Maître → Légende → Mythe Godson.
- Récompenses centralisées dans `awardCareerForMatch(winner)`, appelé par
  `finishMatch()` avant `saveProfile()` : aucune récompense en replay ni entraînement ;
  Online récompense le combattant local, 2 Joueurs partage une prime de session.
  Bonus de performance : victoire, difficulté, combo ≥ 6, parades ≥ 3, santé > 50 %.
- **Migration honorifique** : sans carrière existante, l'XP de départ est calculée depuis
  victoires, matchs, Arcade, Survie et chapitres terminés.
- L'écran de fin affiche le gain « +X XP • +Y Godson » et célèbre les passages de niveau.

## 2. Championnat Godson (successeur de l'Arcade)

L'ancien mode Arcade « 5 étapes » est généralisé (`arcade.total`, `arcadeTotal()`) et
ses libellés `/5` codés en dur sont supprimés partout : HUD, écran VS, sélection,
replays, Hall, fins de match et enseigne d'arène du décor.

| Circuit | Combats | Difficultés | Boss final | Prime de couronne |
|---|---|---|---|---|
| 🏟️ Stade Godson | 5 | Facile → Difficile | TITAN / NOVA / Kael | +250 XP, +150 Godson |
| 🌍 Monde des Planches | 8 | Facile → 4× Difficile | Krak / Vorga / Lyra-azur / Magnus | +500 XP, +300 Godson |
| 👑 Légendes | 12 | Moyen puis 10× Difficile | **GODSON PRIME** | +1 000 XP, +650 Godson |

Chaque circuit impose ses arènes en tournée et ses adversaires sont uniques
(le boss est retiré du tirage). Les titres gagnés sont persistés par circuit.

## 3. Quêtes & récompenses (UI)

- **12 quêtes** réclamables une seule fois : premier match, 5/25 victoires, combo 8,
  8 combattants victorieux, Survie vague 8, Chapitre 1, saga complète, 3 circuits,
  niveau 10. Chaque quête rapporte XP + Godson.
- **Boutique de récompenses** (monnaie de jeu uniquement, aucun achat réel) :
  4 titres honorifiques équipables, tenue « Coucher de soleil de Libreville » et accès
  anticipé à GODSON PRIME, avec prix et niveau minimum.
- Le **prochain objectif** est calculé (`careerNextObjective`) et affiché au hub.

## 4. Hub principal (Lena)

- Carte carrière permanente : rang, niveau, barre d'XP animée, Godson, titre, objectif.
- Menu structuré en sections « 🎮 Jouer » et « 🏆 Progression, collection & options ».
- Écran **Carrière & Championnat** : résumé, 3 circuits lançables, quêtes, récompenses,
  parcours global (Campagne / Championnat / Survie / Défis / Online).
- La carte « CHAMPIONNAT » du hub lance le circuit Stade en accès rapide (2 appuis
  jusqu'au combat, comme l'ancienne Arcade).

## 5. Garanties & validation (Sarah)

- Déterminisme intact : aucune mécanique de frame modifiée ; le circuit entre dans le
  contexte des replays (`arcadeTotal`, `arcadeCircuit`) et les anciens replays restent
  lisibles.
- Suite d'exécution : **342 assertions / 577 vérifications vertes** (15 nouvelles
  preuves V5 : seuils XP, migration, quête à usage unique, achats, 3 circuits,
  lancement depuis la Carrière, récompense de match).
- Gate QA : nouveau **contrôle n°27** « Édition Jeu Complet V5.0 » ; budget bundle
  relevé en connaissance de cause à **448 Ko** (bundle réel **404 Ko**).
- Capture visuelle relue : duel Nyx vs Sélénia lancé depuis le Circuit Monde, avec
  enseigne « Circuit Monde des Planches • Combat 1/8 » dans le décor.

## 🔭 Suite décidée

- **V5.1 « Graphismes AAA II »** : ombres portées directionnelles, impacts en sprites,
  tenues fidèles aux planches (capuches, robes, fourrures).
- **V5.2** : tournoi local à brackets et saisons de carrière.
- **V5.3** : Online public, après validation d'un duel réel entre deux réseaux distincts.

✍️ Release **V5.0** signée **Gideon - Godson**.
