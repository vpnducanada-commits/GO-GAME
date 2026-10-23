# 🧱 ARCHITECTURE TECHNIQUE — Gideon - Godson ARENA

**Responsable architecture** : Manager & Développeur principal  
**Responsable rendu** : Kenzo, Directeur Artistique & Technical Artist  
**Responsable qualité** : Sarah, Lead QA / Performance / Release

## Vue d’ensemble

```text
index.html
├── src/style.css      → présentation, menus, HUD, responsive
├── src/engine.js      → simulation, combat, IA, audio, profil, états du jeu
├── src/render.js      → pipeline graphique, caméra, HUD canvas/DOM, boucle
└── src/ui.js          → menus, sélection, réglages, personnalisation, fins de match

tools/build-single.py  → fusionne tout en un HTML autonome livrable
tests/smoke-test.js    → simulation navigateur et scénarios de jeu automatisés
tools/qa-check.py      → contrôles statiques et budgets de release
```

## Principes de structure

1. **Simulation indépendante de l’affichage**
   - La logique tourne à pas fixe de 60 Hz.
   - Le rendu interpole les positions pour les écrans 120/144 Hz.
   - `engine.js` ne doit pas dépendre de la fréquence d’affichage.

2. **Données avant code spécial**
   - Personnages, attaques, IA, arènes et campagne sont décrits par des tables de données.
   - Toute nouvelle habileté doit passer par les descripteurs existants avant d’ajouter un cas spécial.

3. **Aucune dépendance runtime**
   - Audio synthétisé en WebAudio.
   - Graphismes dessinés en Canvas.
   - Sauvegarde locale protégée par wrappers `try/catch`.

4. **Livrable unique toujours régénérable**
   - La version modulaire sert au développement.
   - `tools/build-single.py` produit le fichier autonome officiel de release.

## Pipeline de rendu haute qualité

Le rendu est organisé en passes explicites, pilotées par `RENDER_PIPELINE` dans `src/render.js` :

| Passe | Contenu | Budget / règle |
|---|---|---|
| `background` | ciel, décors, parallaxe, météo, foule | dégradés et sprites mis en cache |
| `floor` | sol, perspective, logo, reflets de zone | aucun texte critique illisible |
| `shadows` | ombres de contact, reflets combattants | désactivable en qualité basse |
| `entities` | combattants triés par profondeur | silhouettes toujours lisibles |
| `projectiles` | bolt, lames, onde au sol, météores, vagues | forme distincte par type |
| `effects` | particules, anneaux, textes flottants | plafond selon preset qualité |
| `post` | vignette, teinte d’arène, alerte vie basse, barres cinéma | jamais bloquant pour le gameplay |

## Presets qualité

| Preset | DPR max | Particules max | Usage |
|---|---:|---:|---|
| Basse | 1.0 | 170 | mobiles/PC lents |
| Moyenne | 1.5 | 320 | équilibre |
| Haute | 2.0 | 540 | écrans Retina / desktop |
| Auto | dynamique | dynamique | baisse si FPS < 45, remonte si stable |

## Règles de contribution par périmètre

- **Design (Nadia)** : modifier les tables de données et documenter l’intention avant l’implémentation.
- **Rendu (Kenzo)** : toute nouvelle passe doit avoir un coût mesurable et un repli en qualité basse.
- **QA (Sarah)** : aucune fonctionnalité n’est “terminée” sans test ou justification écrite.
- **Manager** : intégrer, arbitrer les conflits, maintenir la cohérence produit et livrer.

## Dette technique suivie

| Sujet | Plan |
|---|---|
| Replays | ✅ V2.6–V2.7 : lockstep + graine seedée + hashs ; bibliothèque locale rotative avec favoris et budget de stockage |
| Fichiers JS volumineux | conserver 3 modules lisibles tant que les tests restent rapides ; éclater par domaine si un fichier dépasse durablement ~900 lignes |
| Audio | conserver la synthèse WebAudio ; aucun asset externe sans décision du Product Owner |

---
✍️ Architecture officielle — Studio Gideon - Godson ARENA.
