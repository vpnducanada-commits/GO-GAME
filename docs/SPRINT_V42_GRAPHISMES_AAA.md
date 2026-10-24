# 🎨 SPRINT V4.2 — « Graphismes AAA »

**Directive du propriétaire (24/10/2026)** : « Tout le monde se focalise d'abord sur
l'amélioration visuelle — objectif : graphisme similaire à TEKKEN, STREET FIGHTER, KOF,
MARVEL vs CAPCOM, MORTAL KOMBAT. »

**Cadrage honnête du studio** : ces références sont des productions 3D ou des sprites peints
à la main par des centaines d'artistes. GO GAME reste un Canvas 2D procédural en un seul
fichier à 60 fps : l'objectif poursuivi est le **même langage visuel** — volumes peints,
lumière de scène cohérente, profondeur de champ, ambiance vivante — dans les limites du
procédural temps réel, sans jamais sacrifier fluidité ni déterminisme.

## Réalisé (100 % rendu, zéro impact gameplay/simulation)

| Axe | Technique | Responsables |
|---|---|---|
| Peinture des membres | Dégradé cylindrique ombre → lumière → ombre dans l'axe de chaque segment (qualité > basse) | Kenzo + Marco |
| Lumière d'arène | Rim light dos aux couleurs de l'ambiance (nuit bleue, jour doré, crépuscule orangé) + halo de contact teinté au sol | Marco |
| Visage | Ombre de mâchoire + lumière sur l'arête du nez | Marco |
| Atmosphère | 3 rayons de lumière « screen » + poussières flottantes animées (26 en haute qualité) | Lena |
| Profondeur | Avant-plans par arène : néon clignotant (tokyo), piliers (temple), barrières lumineuses (stade), palmes (Libreville), coins hors foyer | Lena |
| Lisibilité | Aucune gêne dans la zone de combat : avant-plans cantonnés aux bords/coins bas | Nadia |
| Performance & budget | Effets conditionnés par `qualityLevel` ; budget bundle relevé à 384 Ko (décision propriétaire), 352 Ko réels | Sarah |

## Preuves
- Smoke : **306 assertions source / 354 vérifications affichées**, suite verte (section V4.2 :
  peinture cylindrique, rim light hexadécimale, visage peint, poussières ≥ 16, avant-plan
  vérifié pour les 4 arènes).
- Gate QA : contrôle permanent **n°24** + budget 384 Ko verrouillé.
- Captures relues par Marco/Lena : duel Libreville crépuscule (rayons, palmes en avant-plan)
  et tokyo nuit (rim bleue, pluie, néons).

## Next — V4.3 « Graphismes AAA II »
Volumes peints du torse et des vêtements (dégradés verticaux + plis), ombres portées
directionnelles selon la source de lumière de l'arène, étincelles d'impact en sprites
pré-rendus, reflets au sol avec fondu. La compétition locale suivra en V4.4.

*Signé Gideon - Godson — © 2026. Manager & Développeur principal : Assistant Arena.*
