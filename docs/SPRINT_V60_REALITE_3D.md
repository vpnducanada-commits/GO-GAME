# 🧊 SPRINT V6.0 — « Réalité 3D »

**Produit** : Godson FURY ARENA — signé Gédéon - Godson  
**Date** : 24 octobre 2026  
**Manager & développeur principal** : Assistant Arena  
**Équipe** : Nadia (Game Design), Kenzo (Rendu), Sarah (QA/Release), Marco (Personnages), Lena (UX)

## Mandat du propriétaire

Après inspection de la V5.3, le cap change explicitement : passer à la **3D**, avec des personnages et des décors plus réalistes et des mouvements plus humains. Le tournoi/saisons imaginé pour la suite de la V5.3 est donc reporté sans être abandonné.

## Décisions d’équipe

| Responsable | Décision verrouillée |
|---|---|
| **Kenzo** | Moteur **WebGL maison**, sans bibliothèque externe : shaders, matrices, géométrie indexée, batches opaque/transparent/points et cache statique des arènes. Le canvas 2D devient un overlay transparent pour les textes, la vignette et les bandeaux. |
| **Marco** | Combattants humanoïdes volumiques en posture de combat trois-quarts : bassin, torse, tête, bras et jambes articulés, genoux/coudes, visage, cheveux, chaussures, gants, armures, capes segmentées, couronne, visière synthétique et médaillon de tenue. |
| **Nadia** | La 3D est une **couche de rendu uniquement**. Elle réutilise `fighterMotion()`, `humanProfile()`, les positions interpolées et les états d’attaque. Simulation, hitboxes, dégâts, IA, M1, replays et lockstep Online ne changent pas. |
| **Lena** | HUD DOM, joystick gauche, cluster d’actions et trois formats d’écran restent inchangés. Nouveau réglage **Réglages → Rendu de combat 3D** : Automatique, Toujours ou 2D classique. |
| **Sarah** | Aucun écran noir silencieux : diagnostic WebGL exposé et **repli automatique** vers Graphismes AAA II. Validation par navigateur réel headless sur les quatre arènes, pas seulement par le harnais jsdom. |

## Architecture livrée

- Nouveau module `src/render3d.js`, chargé après `src/render.js` et avant `src/ui.js`.
- Canvas `#gl3d` derrière le canvas 2D `#game` ; ce dernier passe en `alpha:true` afin de servir d’overlay lorsque WebGL dessine la scène.
- Caméra perspective qui suit le midpoint des combattants, utilise le zoom de combat existant, s’élève légèrement pendant les sauts et conserve les secousses d’impact.
- Éclairage directionnel + hémisphérique + spéculaire + rim light, brouillard de profondeur et lumières Jour/Crépuscule/Nuit.
- Ombres de contact directionnelles et ellipses sous les pieds, atténuées en l’air.
- Projectiles volumiques, anneaux fragmentés, impacts 3D sans « cible » géante, auras d’énergie discrètes, boucliers de garde/parry et particules GPU exprimées en **mètres monde**.
- Arènes statiques mises en cache par arène/ambiance/niveau de qualité ; seuls les combattants et effets sont reconstruits à chaque frame.
- Qualité auto existante réutilisée pour la tessellation ; en mode 3D automatique, un FPS durablement trop bas peut désactiver la 3D pour la session.

## Les quatre arènes 3D

1. **Stade Godson** : tribunes en gradins, foule assise atténuée, barrière publicitaire, grand écran, projecteurs et soleil couchant.
2. **Néon Tokyo** : immeubles profonds, fenêtres émissives, enseignes verticales, lampadaires et flaques réfléchissantes.
3. **Temple Céleste** : marches, piliers, chapiteaux, toit, lanternes suspendues et montagnes lointaines.
4. **Plage de Libreville** : océan, vagues blanches, palmiers inclinés, dunes et voiliers à l’horizon.

## Animation humaine

Les poses 3D couvrent respiration, transfert de poids, marche/course avec levée de pieds, dash, saut, accroupissement, garde, douleur, dash, chute/KO, victoire, poings, pieds, uppercut, balayage, projection et spéciaux. Les extensions utilisent les mêmes courbes d’anticipation, frappe et récupération que le rendu 2D. Les chaînes M1 des 41 combattants bénéficient automatiquement des poses de leurs coups réels.

## Validation Sarah

- `node --check` : **4/4 modules valides**.
- Smoke-test : **398 assertions source / 633 vérifications affichées, 0 échec**.
- QA statique : contrôle **n°31 « Réalité 3D V6.0 »** ajouté ; release autorisée après documentation.
- Bundle autonome V6.0 : **506 816 octets (495 Ko)**, nouveau budget d’équipe **≤ 512 Ko**, 4 scripts intégrés, zéro ressource externe.
- Navigateur réel : Chromium headless + WebGL 2.0 SwiftShader.
  - Une première capture a détecté une incompatibilité de précision entre shaders vertex/fragment ; corrigée par `precision mediump float;` des deux côtés.
  - Une capture Tokyo a détecté des points de particules géants ; la taille est désormais un diamètre monde `(r × 2 / 95)`, avec test de régression dédié.
- Captures finales relues par l’équipe : Stade, Néon Tokyo, Temple Céleste et Plage de Libreville.
- Charges mesurées sur les captures : environ **20 000 à 41 000 sommets/frame** et **4 à 5 appels de dessin batchés**, selon l’arène et les effets.

## Garanties de compatibilité

- Les 41 combattants, les 41 chaînes M1, la carrière, les circuits, le joystick V5.2 et les formats d’écran sont conservés.
- Le hash déterministe est prouvé inchangé après construction des poses et de la caméra 3D.
- En choisissant **2D classique**, le pipeline complet V5.3 `background → floor → shadows → entities → projectiles → effects → post` est restauré immédiatement.
- Sans WebGL réel, la raison du repli est disponible dans `renderStats.renderer3dFallback` et le combat continue en 2D.

## Limites assumées et suite

La V6.0 est une 3D temps réel stylisée et procédurale, pas un import de modèles photoréalistes externes : aucun asset lourd n’est téléchargé et le bundle reste sous 512 Ko. Les ombres sont des ombres de contact directionnelles plutôt qu’une shadow-map complète.

Prochain cap proposé : **V6.1 « Matière & Performance 3D »** (détails de tenues et visages supplémentaires, mesures FPS par appareil, ombres projetées des membres), puis retour du **Tournoi & Saisons**. Le duel WebRTC réel entre deux réseaux distincts reste le test réseau à réaliser avant toute annonce d’Online public.
