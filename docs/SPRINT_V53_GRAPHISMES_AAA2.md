# 🎨 SPRINT V5.3 — « Graphismes AAA II »

**Release :** Godson FURY ARENA 5.3.0  
**Date :** 24/10/2026  
**Objectif d’équipe :** passer d’un rendu déjà peint à une image plus ancrée au sol, plus percutante et plus fidèle aux tenues des planches, sans modifier le gameplay.

## Arbitrage du studio

| Membre | Priorité | Livrable V5.3 |
|---|---|---|
| **Kenzo — Rendu** | Les combattants doivent « peser » dans l’arène et les coups doivent produire une vraie explosion lisible. | Ombres portées directionnelles en 3 couches, contacts des pieds, reflets colorés, halos de sol et sprites d’impact procéduraux. |
| **Marco — Personnages** | Les 41 combattants ne doivent plus partager un simple badge générique. | Table explicite des **41 motifs de tenue des planches**, médaillon signature, bande de tenue et initiale du joueur conservée. |
| **Nadia — Design** | Chaque type d’impact doit se comprendre instantanément. | Sprites distincts : léger, lourd, projection, contre/riposte, projectile, choc de projectiles, garde, parry, M1, final M1 et impact au sol. |
| **Lena — UX** | Le spectacle ne doit pas masquer les corps ni la zone de lecture. | Impacts courts, centrés sur le point de contact ; anneaux du final M1 fragmentés après relecture de capture pour éviter l’effet « cible ». |
| **Sarah — QA** | Aucun coût caché : pas de dégradés recréés par frame, pas de rupture replay/Online. | Sprites générés une fois puis mis en cache (plafond 48), effets exclus du hash déterministe et preuves automatisées. |

## 1. Ombres portées dynamiques

- Direction et longueur selon l’ambiance : **longue au crépuscule**, plus courte et décalée la nuit, plus zénithale le jour.
- Ajustements par arène (néons de Néon Tokyo, soleil bas de Libreville, lumière du Temple).
- Trois couches en qualité haute : halo teinté du sol, ombre portée directionnelle, contact sombre sous le corps.
- Contacts séparés sous les deux pieds au sol ; l’ombre rétrécit et s’estompe pendant les sauts et les jongles.
- Halos de lumière dynamiques entre les combattants et reflets colorés par signature sur le sol.

## 2. Sprites d’impact procéduraux

Le moteur émet des événements visuels typés avec `impactBurst()` ; le rendu les convertit en sprites étoilés générés une seule fois par type et par couleur.

| Événement | Traitement visuel |
|---|---|
| Coup léger / lourd | Éclats courts ou explosion épaisse aux couleurs du combattant |
| Projection / contre / riposte | Burst renforcé et orienté |
| Garde | Hexagone bleu de bouclier |
| Parry parfaite | Diamant doré |
| Projectile / choc de projectiles | Explosion radiale d’énergie |
| M1 | Éclats allongés horizontalement qui gagnent en puissance dans la chaîne |
| Final M1 | Grand burst signature avec anneaux fragmentés |
| Chute / météore au sol | Éventail d’impact plaqué au sol |

Les événements sont **strictement visuels** : ils ne sont pas inclus dans `replayStateHash()`, ne changent aucune hitbox et ne peuvent pas désynchroniser un duel Online.

## 3. Tenues fidèles aux planches

`BOARD_OUTFIT_MOTIFS` contient une entrée explicite pour chacun des 41 IDs du roster. Exemples :

- Gideon et Kira : éclair ; Titan/Brax/Krak : montagne ;
- Godson Prime et Astrid : couronne ; Zara et Zep : vague ;
- Kael/Kazu/Velen/Nyx Ombre : lame ; Sora/Elara : rune ;
- Ael-7, Nyx, Korben, Sera, Zara Nova et Luna : circuit ;
- Lira : boussole ; Zed : flèche ; Vorak : hache ; Drakar : Givre ;
- Lyra et Aria : soleil ; Drakesh et Raven : viseur ; Lyra Azur : aile.

Le motif est dessiné dans un médaillon de poitrine aux couleurs du combattant, accompagné d’une bande de tenue diagonale. L’initiale personnalisée du joueur reste visible dans une petite pastille, lisible dans les deux directions.

## Preuves QA (Sarah)

- **384 assertions source / 619 vérifications** vertes.
- Les 41 motifs sont dessinés un à un et correspondent exactement aux 41 IDs du roster, casse comprise.
- Ombre au crépuscule : 3 couches et direction longue ; en l’air, facteur d’ombre réduit à **0,50** dans la preuve.
- Un vrai coup M1 de Gideon déclenche un sprite `m1/m1final` en combat simulé.
- Le hash déterministe est identique avant/après création des impacts.
- Contrôle statique **n°30** ajouté ; bundle autonome **447 Ko** pour un budget de 448 Ko.
- Capture relue : `/home/user/aaa2-v53-gideon-final.png` — final « Jugement Ascendant », sprite M1, ombres au sol et motifs visibles.

## Invariants

- Gameplay, dégâts, IA, hitboxes, progression, M1, joystick et formats d’écran inchangés.
- Replays et Online restent déterministes ; l’Online exige toujours la même version des deux côtés.
- Les qualités basse/moyenne réduisent les couches et la taille des effets pour protéger les 60 FPS.
