# 🎮 GÉDÉON - Godson ARENA — V2.2 PRO

**Jeu de combat 1v1 professionnel — haute résolution, 60 FPS, haut graphisme**
✍️ *Créé et signé par **Gideon - Godson** © 2026 — Libreville, Gabon*
👔 *Manager officiel & Développeur principal : Assistant Arena*

## ▶️ Lancer le jeu
| Fichier | Usage |
|---|---|
| ⭐ **`Gedeon-GODSON-Arena-V2.2-PRO.html`** | Version autonome **1 seul fichier** : ouvre-la dans un navigateur, partage-la, aucune installation. |
| `index.html` + `src/` | Version développement modulaire (`python3 -m http.server 8000`). |
| `docs/` | Charte de gestion, roadmap officielle et suivi des sprints. |

Après modification dans `src/` : `python3 tools/build-single.py` régénère la version 1 fichier.

## 🕹️ Modes de jeu
- 📖 **Mode Histoire — Chapitre 1** : 3 combats scénarisés avec dialogues, boss final TITAN et récompense secrète. Progression sauvegardée.
- 🌊 **Survie** *(nouveau V2.2)* : vagues infinies, +35% de vie entre vagues, boss toutes les 5 vagues, score cumulé au Hall of Fame
- 🤖 **Versus Bot** : IA Facile / Moyen / Difficile adaptative (elle sait même faire des *parry* !)
- 👥 **2 Joueurs** : clavier partagé ou 2 manettes
- 🏆 **Arcade** : 5 étages, boss secret possible
- 🥋 **Entraînement** : mannequin réglable, vie/temps illimités
- 🏅 **Hall of Fame** : Top 10 local de tes meilleurs scores + grades de carrière (Débutant → 👑 Légende Godson)

## 🥋 Les 5 combattants
| Personnage | Style | Spécial (50%) / SUPER (100%) uniques |
|---|---|---|
| **GÉDÉON** | Champion équilibré | ⚡ Foudre Gideon / 🌟 Jugement perforant |
| **Kira** | Foudre ultra-rapide | 🌪️ Rafale ×3 / ⚡ Tempête de 5 lames |
| **TITAN** | Montagne : 120 PV | 🌋 Onde sismique au sol / ☄️ Séisme |
| **NOVA** | Maîtresse de l'énergie | 🔮 Orbe chercheuse / 🌠 Pluie de météores |
| 👑 **GODSON PRIME** | **Secret** (finir l'Histoire) | 👑 Double vague / Triple Jugement royal |

## 🏟️ Arènes
🌇 Stade Gideon Sunset • 🌧️ Néon Tokyo Pluie • ⛩️ Temple Céleste — animées, avec musiques dédiées et caméra dynamique.

## ⌨️ Commandes
| Action | Joueur 1 (AZERTY) | Joueur 2 |
|---|---|---|
| Bouger / courir | `Q` `D` | `⬅` `➡` |
| Saut variable | `Z` | `⬆` |
| Accroupi / Garde | `S` | `⬇` |
| Poing / Pied / Spécial | `F` / `G` / `H` | `K` / `L` / `M` |
| Dash | `Maj` ou double-direction | `Maj droite` / `O` |
| Pause | `P` / `Échap` | — |

🔥 **Techniques** : ⬇+Poing = Uppercut (lance en l'air) → saut + Pied = jongle • ⬇+Pied = Balayage • Poing → Pied → Spécial (annulations) • CONTRE = +25% • Énergie 100% = SUPER unique • ✨ **Parry** : tape la garde juste avant l'impact (bouclier doré) = 0 dégât + riposte à +35% !

## ⚙️ Personnalisation & progression
Noms, initiales, couleurs (tenues/auras/projectiles), volumes, qualité auto selon FPS, durée/rounds/vitesse des matchs — tout est **sauvegardé automatiquement**, avec statistiques de carrière, succès déblocables et classement Hall of Fame.

## 🧱 Projet (gestion professionnelle)
```
├── Gedeon-GODSON-Arena-V2.2-PRO.html   ⭐ build autonome
├── index.html + src/ (engine/render/ui/style)
├── docs/GESTION_PROJET.md • docs/ROADMAP.md • CHANGELOG.md
├── tests/smoke-test.js   → 63 vérifications automatisées ✅
└── tools/build-single.py → génère la version 1 fichier
```
Chaque livraison suit la **Definition of Done** du manager : syntaxe vérifiée, tests 100% verts, build régénéré, documentation à jour, commit Git + tag de version.

---
✍️ **Un jeu signé Gideon - Godson © 2026 — Libreville, Gabon** 🇬🇦
