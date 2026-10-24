# 👔 GESTION DE PROJET — Godson FURY ARENA *(anciennement GÉDÉON - Godson ARENA)*

**Produit** : jeu de combat 1v1 navigateur, haute résolution, signé Gideon - Godson.
**Propriétaire du produit (Product Owner)** : **Gideon - Godson** — vision, validation finale, marque.
**Manager officiel & Développeur principal** : l'assistant Arena (nommé le 22/10/2026) — priorisation, architecture, développement, tests, livraisons.
**Équipe studio renforcée (V4)** : Nadia (Game Design) • Kenzo (Rendu) • Sarah (QA/Release) • **Marco (Direction artistique personnages)** • **Lena (UX plein écran)** — fiches dans `docs/EQUIPE.md`.

---

## 🎯 Vision & principes directeurs
1. **Fun instantané** : le jeu se lance en 1 clic, en 1 seul fichier, sans installation ni compte.
2. **60 FPS partout** : la fluidité passe avant les effets ; la qualité s'adapte automatiquement.
3. **Toujours livrable** : chaque session se termine par une version jouable, testée et documentée.
4. **Signature Gideon - Godson** visible et fière dans chaque écran.
5. **Présentation de vrai jeu de combat** : plein écran manipulable, personnages détaillés inspirés des planches du propriétaire, combat 3D temps réel (avec repli 2D) et interface digne des grandes licences.

## 🔁 Méthode de travail (sprints par session)
Chaque session = 1 sprint complet :
`Audit → Plan du sprint → Développement → Tests automatisés → Build 1-fichier → Documentation → Livraison au Product Owner`

## ✅ Definition of Done (obligatoire avant toute livraison)
- [ ] Aucune erreur de syntaxe (`node --check` sur tous les fichiers JS)
- [ ] Test d'exécution automatisé 100% vert (`tests/smoke-test.js`) + gate statique `python3 tools/qa-check.py` (veto Sarah)
- [ ] Version autonome régénérée (`tools/build-single.py`) et vérifiée
- [ ] Serveur de prévisualisation actif et ressources en HTTP 200
- [ ] `CHANGELOG.md` et `README.md` à jour
- [ ] Commit Git + tag de version

## 🏷️ Versionnage
`MAJEUR.MINEUR.CORRECTIF` — V1.0 prototype • V2.0 édition PRO • V2.1 progression & histoire • V2.2 profondeur de combat • V2.3 studio quality (équipe Nadia/Kenzo/Sarah) • V2.4 Libreville Rising (Zara + Chapitre 2) • V2.5 Human Motion & Living Arenas • V2.6 Replays déterministes • V2.7 Replay Studio & Victoires • V2.8 Arena Moods & Polish • V3.0 GO GAME Online & Combat Pro • V3.1 Humanité++ (personnages plus humains, 100 % visuel) • V3.2 Paysage & Interface Épurée • V3.3 Flux d’écrans & Chargement • V3.4 Zone de combat dégagée • V3.5 Prise en main paysage & impacts fluides • V3.6 Nouveaux Champions (roster 9, planches du propriétaire) • V3.7 Sélection & Corps pleins • V4.0 Arcade plein écran & anatomie HD • V4.1 Peinture & Présentation • V4.2 Graphismes AAA (priorité visuelle du propriétaire) • V4.3 Roster complet des planches (41 combattants) • V4.4 Navigation Pro & Tenues de combat • V5.0 Édition Jeu Complet (carrière, championnat, hub) • V5.1 Godson FURY — M1 Signature (nouveau nom + 41 chaînes individuelles) • V5.2 Écran Adaptatif & Joystick Pro (consultation d’équipe, joystick gauche, 3 formats) • V5.3 Graphismes AAA II (ombres portées, impacts sprites, 41 motifs des planches) • V6.0 Réalité 3D (moteur WebGL maison, personnages articulés et arènes volumiques) • V6.1 Maquettes Vivantes & 2v2 deux téléphones (zéro gel, 41 modèles des planches, interface-décor, WebRTC local) • V7.0 Anatomie AAA (sculpture loftée, matières, bump, ombres PCF, posture 3/4) • V7.1 Tournoi & Saisons (brackets locaux 4/8/16, Saison 1 Aurore de Libreville, points et titres).

## 📊 Indicateurs suivis par le manager
| Indicateur | Cible | V7.1 (actuel) |
|---|---|---|
| Tests automatisés | 100 % verts | 453 assertions source / 689 vérifications affichées ✅ + gate QA statique (contrôle n°34) + validation Chromium du parcours Tournoi + preuves WebGL/WebRTC conservées |
| Taille version 1-fichier | ≤ 704 Ko (budget V7 arbitré pour sculpture, matières et ombres procédurales) | 655 Ko ✅ (671 709 octets, 4 scripts intégrés) |
| Dépendances externes | 0 pour jouer en solo/local ; Supabase uniquement en Online opt-in, WebRTC direct pour Online et deux téléphones | Conforme ✅ |
| Fluidité cible | 60 FPS | interpolation + qualité auto ✅ |
| Modes / Personnages / Arènes | en croissance | Campagne, Championnat 3 circuits, Tournoi 3 coupes 4/8/16 + Saison 1, Bot, 2 Joueurs, Survie, Entraînement, Duel Online et 2v2 deux téléphones (+ Défis, Carrière) / 41 / 4 arènes en 2D et 3D |

## 🗂️ Sprint en cours
V7.1 « Tournoi & Saisons » livrée : brackets locaux persistants de 4, 8 et 16 participants, têtes de série et affiches CPU déterministes, Saison 1 « Aurore de Libreville » avec points finaux uniques, cinq paliers et titres, intégration Carrière/hub/replays ; voir `docs/SPRINT_V71_TOURNOI_SAISONS.md`. V7.0 « Anatomie AAA » livrée : sculpture loftée des 41 combattants, tête/visage/mains/bottes volumiques, matières et bump procéduraux, ombres PCF cadencées, posture 3/4 et génération CPU optimisée ; voir `docs/SPRINT_V70_ANATOMIE_AAA.md`. V6.1 « Maquettes Vivantes & 2v2 deux téléphones » livrée : zéro gel d’impact, 41 fiches 3D explicites d’après les maquettes, interface synchronisée aux matériaux des 4 arènes et 2v2 Relais WebRTC local par codes GF61 ; voir `docs/SPRINT_V61_MAQUETTES_2TELEPHONES.md`. V6.0 « Réalité 3D » livrée : moteur WebGL maison, 41 combattants humanoïdes articulés, 4 arènes en profondeur, caméra de combat et repli 2D automatique/manuel ; voir `docs/SPRINT_V60_REALITE_3D.md`. V5.3 « Graphismes AAA II » livrée : ombres portées directionnelles, sprites d’impact typés en cache et motifs de tenue explicites pour les 41 combattants, en render-only. V5.2 « Écran Adaptatif & Joystick Pro » livrée : consultation complète de l’équipe, joystick analogique à gauche, actions à droite et trois formats d’écran sans déformation. V5.1 « Godson FURY — M1 Signature » livrée : nouveau nom officiel et chaîne M1 martelable, spécifique et prouvée pour chacun des 41 combattants. V5.0 « Édition Jeu Complet » livrée : carrière XP/Godson/titres/quêtes, Championnat Godson 5/8/12 combats et hub de progression. V4.4 « Navigation Pro & Tenues de combat » livrée : recherche/filtres de sélection, actions fixes et vêtements peints. V4.3 « Roster complet des planches » livrée : les 35 personnages des planches du propriétaire jouables (roster 41). V4.2 « Graphismes AAA » livrée : peinture cylindrique, lumière d'arène, ambiance vivante et avant-plans de profondeur (priorité visuelle du propriétaire). V4.1 « Peinture & Présentation » livrée : VS plein corps face à face, intro cinéma et matières par style. V4.0 « Arcade plein écran & anatomie HD » livrée : coque 100 % viewport, barre système intégrée/masquée en combat, proportions adultes, tenues HD et caméra 1,34×. V3.7 « Sélection & Corps pleins » livrée : portraits animés en sélection, bordures à effets et membres volumineux en combat. V3.6 « Nouveaux Champions » livrée : KAEL, Sora et AEL-7 jouables à partir des planches du propriétaire. V3.5 « Prise en main paysage & impacts fluides » livrée : combat immersif tenu à deux mains et gel d’impact quasi supprimé. V3.4 « Zone de combat dégagée » livrée : tactile compact aux coins, plaques retirées, écran géant discret en combat. V3.3 « Flux d’écrans & Chargement » livrée : écran de chargement + parcours Menu → Personnages → Arène → Difficulté. V3.2 « Paysage & Interface Épurée » livrée : retour direct du propriétaire — jeu en paysage prioritaire et cure de textes dans toute l’interface. V3.1 « Humanité++ » livrée : refonte visuelle complète des personnages (proportions adultes, visages expressifs, regard vivant, IK), strictement render-only. Track V3 « GO GAME Online & Combat Pro » livrée (V3.0). Voir `docs/SPRINT_V3_GO_GAME_ONLINE.md`, `docs/BACKEND_SUPABASE_GO_GAME.md` et `docs/ROADMAP.md`. Le jeu local reste autonome hors ligne ; les duels privés, le cloud et le classement co-vérifié sont branchés sur Supabase + WebRTC. Le Sprint 09 « Compétition locale » est désormais complet : Championnat Godson linéaire en V5.0 et Tournoi & Saisons en V7.1. Prochaines validations : terrain sur téléphones physiques et duel Online entre deux réseaux distincts avant ouverture publique renforcée.

---
✍️ Document officiel du projet **Godson FURY ARENA** — tenu par le Manager & Développeur principal.
