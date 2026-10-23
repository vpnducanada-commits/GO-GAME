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
`MAJEUR.MINEUR.CORRECTIF` — V1.0 prototype • V2.0 édition PRO • V2.1 progression & histoire • V2.2 profondeur de combat • V2.3 studio quality (équipe Nadia/Kenzo/Sarah) • V2.4 Libreville Rising (Zara + Chapitre 2) • V2.5 Human Motion & Living Arenas • V2.6 Replays déterministes • V2.7 Replay Studio & Victoires • V2.8 Arena Moods & Polish • V3.0 (futur) expérience connectée.

## 📊 Indicateurs suivis par le manager
| Indicateur | Cible | V2.8 (actuel) |
|---|---|---|
| Tests automatisés | 100 % verts | 151 assertions source ✅ + gate QA statique |
| Taille version 1-fichier | < 200 Ko | ≤ 250 Ko (gate) ✅ |
| Dépendances externes | 0 | 0 ✅ |
| Fluidité cible | 60 FPS | interpolation + qualité auto ✅ |
| Modes / Personnages / Arènes | en croissance | 6 (+ Défis) / 6 / 4 |

## 🗂️ Sprint en cours
Sprint 08 « Arena Moods & Polish » livré (V2.8). Voir `docs/SPRINT_08_ARENA_MOODS.md` et `docs/ROADMAP.md`. Prochain cap envisagé : Sprint 09 « Compétition locale » ; le mode en ligne reste réservé à une éventuelle V3 après validation explicite du Product Owner.

---
✍️ Document officiel du projet **Gideon - Godson ARENA** — tenu par le Manager & Développeur principal.
