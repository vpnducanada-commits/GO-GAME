# 👔 GESTION DE PROJET — GÉDÉON - Godson ARENA

**Produit** : jeu de combat 1v1 navigateur, haute résolution, signé Gideon - Godson.
**Propriétaire du produit (Product Owner)** : **Gideon - Godson** — vision, validation finale, marque.
**Manager officiel & Développeur principal** : l'assistant Arena (nommé le 22/10/2026) — priorisation, architecture, développement, tests, livraisons.

---

## 🎯 Vision & principes directeurs
1. **Fun instantané** : le jeu se lance en 1 clic, en 1 seul fichier, sans installation ni compte.
2. **60 FPS partout** : la fluidité passe avant les effets ; la qualité s'adapte automatiquement.
3. **Toujours livrable** : chaque session se termine par une version jouable, testée et documentée.
4. **Signature Gideon - Godson** visible et fière dans chaque écran.

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
`MAJEUR.MINEUR.CORRECTIF` — V1.0 prototype • V2.0 édition PRO • V2.1 progression & histoire • V2.2 profondeur de combat • V2.3 studio quality (équipe Nadia/Kenzo/Sarah) • V2.4 Libreville Rising (Zara + Chapitre 2) • V2.5 Human Motion & Living Arenas • V2.6 Replays déterministes • V2.7 Replay Studio & Victoires • V2.8 Arena Moods & Polish • V3.0 GO GAME Online & Combat Pro • V3.1 Humanité++ (personnages plus humains, 100 % visuel) • V3.2 Paysage & Interface Épurée • V3.3 Flux d’écrans & Chargement • V3.4 Zone de combat dégagée.

## 📊 Indicateurs suivis par le manager
| Indicateur | Cible | V3.4 (actuel) |
|---|---|---|
| Tests automatisés | 100 % verts | 241 assertions source / 270 vérifications affichées ✅ + gate QA statique + contrôle visuel par captures |
| Taille version 1-fichier | ≤ 320 Ko avec client Online | 293 Ko ✅ |
| Dépendances externes | 0 pour jouer en local ; Supabase/WebRTC uniquement en Online opt-in | Conforme ✅ |
| Fluidité cible | 60 FPS | interpolation + qualité auto ✅ |
| Modes / Personnages / Arènes | en croissance | 6 locaux + Duel Online (+ Défis) / 6 / 4 |

## 🗂️ Sprint en cours
V3.4 « Zone de combat dégagée » livrée : tactile compact aux coins, plaques retirées, écran géant discret en combat. V3.3 « Flux d’écrans & Chargement » livrée : écran de chargement + parcours Menu → Personnages → Arène → Difficulté. V3.2 « Paysage & Interface Épurée » livrée : retour direct du propriétaire — jeu en paysage prioritaire et cure de textes dans toute l’interface. V3.1 « Humanité++ » livrée : refonte visuelle complète des personnages (proportions adultes, visages expressifs, regard vivant, IK), strictement render-only. Track V3 « GO GAME Online & Combat Pro » livrée (V3.0). Voir `docs/SPRINT_V3_GO_GAME_ONLINE.md`, `docs/BACKEND_SUPABASE_GO_GAME.md` et `docs/ROADMAP.md`. Le jeu local reste autonome hors ligne ; les duels privés, le cloud et le classement co-vérifié sont branchés sur Supabase + WebRTC. Le Sprint 09 « Compétition locale » reste le prochain cap de contenu local.

---
✍️ Document officiel du projet **Gideon - Godson ARENA** — tenu par le Manager & Développeur principal.
