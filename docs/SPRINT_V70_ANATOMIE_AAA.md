# Sprint V7.0 — « Anatomie AAA »

**Date de livraison :** 24 octobre 2026  
**Propriétaire :** Gideon - Godson  
**Manager & développeur principal :** Assistant Arena  
**Équipe mobilisée :** Nadia (Design), Kenzo (Rendu), Sarah (QA), Marco (personnages), Lena (UX)

## 1. Mandat

Après la V6.1, le propriétaire a jugé que les combattants ressemblaient encore à de « simples poupées » et a demandé une 3D visant le niveau de présentation de Street Fighter, KOF, Marvel vs. Capcom et Mortal Combat, avec le budget nécessaire pour préserver graphismes et FPS.

Le studio a donc consacré la V7.0 à une refonte de la sculpture, des matières, de la posture et de l’éclairage des 41 combattants. La simulation de combat n’a pas été modifiée : hitboxes, dégâts, IA, M1 Signature, replays, lockstep Online, 2v2 Relais local et repli 2D Graphismes AAA II sont conservés.

## 2. Décision de production

Aucun modèle, aucune texture et aucune bibliothèque externe ne sont embarqués. Toute la géométrie reste générée procéduralement par le moteur WebGL maison afin de garder :

- un bundle autonome d’un seul fichier ;
- le jeu local hors ligne ;
- la même simulation déterministe sur tous les appareils ;
- les 41 fiches `BOARD_MODEL3D` issues des maquettes ;
- un repli propre vers WebGL1 puis vers la 2D si nécessaire.

Cette décision maximise la portabilité, mais elle ne remplace pas des meshes sculptés par des artistes, du skinning professionnel ou de la motion capture. La V7.0 est donc une étape majeure vers la cible AAA, pas une équivalence revendiquée avec les productions commerciales citées.

## 3. Sculpture des combattants — Marco + Kenzo

- **Tubes loftés** multi-anneaux pour membres, tissus, cheveux, doigts et bottes.
- **Profils musculaires différenciés** pour cuisses, mollets, bras et avant-bras : renflements décalés, sections elliptiques et lobes anatomiques.
- **Torse en superellipse** construit par niveaux, avec joug d’épaules, poitrine, taille et bassin reliés au lieu d’un simple cylindre.
- **Tête sculptée en neuf niveaux** : menton, mâchoire, joues, crâne et sommet séparés ; nez lofté, yeux, reflets, sourcils, bouche et oreilles volumiques.
- **Mains complètes** : paume, quatre doigts articulés en deux segments et pouce.
- **Bottes loftées** avec pointe, semelle et renforts d’armure.
- **Vêtements et accessoires segmentés** : cols, ourlets, pans, capes, tresses/mèches, fourrure, plaques et équipements des 41 maquettes.
- **Posture de combat 3/4** : torsion progressive des hanches vers la poitrine puis la tête, au lieu d’une silhouette strictement de profil.
- **Caméra rapprochée** à `0.00, 1.94, 5.49` dans les captures de référence pour donner plus de présence aux combattants.

## 4. Matières et lumière — Kenzo

- Atlas procédural **1024 × 512** en huit tuiles : neutre, peau, tissu, cuir, métal, cheveux/fourrure, technologie et énergie.
- Attributs matière par sommet : tuile, rugosité, métal et facteur peau.
- Éclairage de type PBR simplifié, diffusion enveloppée pour la peau, Fresnel, spéculaire dépendant de la rugosité, translucidité cutanée et tone mapping ACES.
- **Bump mapping par dérivées** :
  - WebGL1 : extension `OES_standard_derivatives` ;
  - WebGL2 : conversion contrôlée du shader principal en GLSL ES 3.00 ;
  - repli automatique sans bump si la compilation échoue.
- **Shadow-map PCF 3 × 3** de 2048 px en qualité haute et 1024 px sinon.
- Cadence des ombres adaptative : chaque frame en qualité haute, une frame sur deux en moyenne et une sur trois en basse, avec réutilisation cohérente de la carte et de la caméra de lumière.

## 5. Performance — Sarah + Kenzo

Optimisations appliquées aux boucles chaudes :

- indices 32 bits lorsque le contexte les autorise ;
- écrivain de sommets brut `vertRaw3` sans allocations de vecteurs dans les sphères, cylindres, lofts, torso et tête ;
- trigonométrie des cercles mise en cache par primitive ;
- sphères transformées en arithmétique scalaire et indexées ligne par ligne ;
- transformation de pose avec constantes de roulis/lacet et torsion mise en cache par hauteur ;
- LOD adaptatif renforcé en qualités moyenne et basse ;
- batches, buffers et arènes statiques réutilisés.

### Mesures de génération CPU dans Chromium headless

Ces mesures couvrent uniquement la génération JavaScript des deux combattants. Elles excluent l’upload et le dessin GPU ; le navigateur de test utilise SwiftShader, donc elles ne constituent pas une promesse de FPS sur téléphone réel.

| Qualité | Sommets dynamiques des deux paires testées | Temps moyen après optimisation |
|---|---:|---:|
| Haute | 27 286 / 27 551 | 23,39 ms |
| Moyenne | 18 026 / 17 745 | 14,40 ms |
| Basse | 13 797 / 13 265 | 13,41 ms |

Avant la passe d’optimisation, les mêmes paires demandaient en moyenne 35,22 ms en haute, 27,70 ms en moyenne et 22,84 ms en basse. Le gain mesuré va donc d’environ 34 % à 48 %. La qualité automatique et le repli 2D restent indispensables sur les appareils modestes.

Le harnais génère successivement **539 149 sommets** pour les 41 combattants en qualité haute : de 9 209 à 18 467 sommets par combattant. Ce total est cumulatif dans le test ; seuls deux combattants sont présents dans une frame de combat normale.

## 6. Validation — Sarah

- Smoke test : **434 assertions source / 669 vérifications affichées**, toutes vertes.
- Contrôle QA statique n°33 « Anatomie AAA V7.0 ».
- Cinq scènes Chromium/WebGL inspectées : Kael/Sora, Vorak/AEL-7, Zara/Lira, Krak/Brutus et Lyra/Velen.
- Télémétrie finale des cinq scènes : moteur 3D actif, atlas matière actif, shadow-map active, **bump actif**, caméra `0.00,1.94,5.49`, aucune erreur JavaScript ou réseau.
- Dernier combattant mesuré dans les captures : 11 670 à 13 375 sommets selon la paire.
- Hash déterministe vérifié inchangé après génération complète d’un combattant V7.
- Bundle autonome : **617 379 octets**, sous le budget V7 de 704 Ko.

## 7. Limites connues et suite

- Les personnages restent des figurines 3D stylisées générées par code ; les visages, cheveux et tissus n’ont pas encore la finesse de meshes auteur.
- Les FPS réels doivent encore être mesurés sur téléphones physiques Android/iOS représentatifs.
- Le prochain saut visuel crédible serait un pipeline de meshes auteur basse/moyenne résolution avec skinning GPU, normal maps dédiées et animations de pose plus riches, tout en conservant la simulation et le repli actuel.
- Le cap produit suivant reste **Tournoi & Saisons**, puis la validation Online publique entre deux réseaux distincts.

---

✍️ Sprint officiellement signé **Gideon - Godson**.
