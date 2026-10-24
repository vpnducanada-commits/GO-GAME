# 📱 SPRINT V6.1 — « Maquettes Vivantes & 2v2 deux téléphones »

**Date** : 24 octobre 2026  
**Propriétaire / signature** : Gideon - Godson  
**Équipe** : Manager & Développeur principal • Nadia (Game Design) • Kenzo (Rendu) • Sarah (QA) • Marco (Personnages) • Lena (UX)

## 1. Corrections demandées par le propriétaire

Après la V6.0, quatre retours ont été traités comme critères d’acceptation :

1. **Supprimer le gel lorsqu’un personnage reçoit un coup.**
2. **Formaliser les personnages d’après les maquettes**, au-delà des couleurs : muscles, proportions, silhouettes, tenues/armures, cheveux, casques et accessoires.
3. **Intégrer les textes et menus au décor**, avec une disposition relue dans son ensemble.
4. **Faire le 2v2 avec chacun son téléphone**, les deux appareils étant reliés par le même Wi-Fi ou par le point d’accès de l’un d’eux.

## 2. Zéro gel d’impact

- Les anciens mécanismes de gel d’impact et de ralenti de K.O. ont été retirés du runtime.
- Les attaques ne déclarent plus de pause à la touche ; le smoke test vérifie qu’un coup réel laisse la simulation avancer dès la frame suivante.
- La QA statique verrouille désormais l’absence de ces mécanismes dans `src/` et `index.html`.
- Les impacts restent lisibles par l’animation du corps, le recul, les étincelles/sprites, le son et les textes de dégâts — sans arrêter le jeu.

## 3. Maquettes Vivantes 3D — 41 fiches explicites

`BOARD_MODEL3D` contient maintenant une fiche individuelle pour chacun des 41 combattants. Chaque fiche décrit notamment :

- famille de corps et proportions : épaules, poitrine, taille, hanches, cou et masse musculaire ;
- tête : cheveux, barbe, oreilles, capuche, masque, couronne, cercle frontal, chapeau, casque, dôme ou tête robot ;
- tenue : armure de plaques, robe, corset, cuir, fourrure, combinaison, bandages, armure lourde ou torse nu ;
- tissus et volumes secondaires : capes, jupes/pans, manches et peintures de guerre ;
- équipement de ceinture et de dos : sacs, carquois, boucliers, réservoirs, noyaux, câbles, fourreaux ;
- arme portée : épée, katana, dague, hache, lance, massue, bâton, fusil ou dispositif technique.

Exemples directement relus en capture WebGL : KAEL en armure avec épée, Sora en robe avec chapeau et bâton, AEL-7 en robot avec fusil, Vorak en colosse à fourrure avec hache, Brutus en armure lourde à casque, Zara et Lira avec leurs silhouettes propres.

Le moteur génère muscles saillants, membres effilés avec renflements, plaques d’armure, tissus, coiffures/casques, accessoires de dos et armes à partir de ces fiches. Un bug de casse découvert par Sarah (IDs `Zara`, `Lira`, `Kairos`, `Zara-Nova`) a été corrigé et verrouillé par test : les 41 fiches sont réellement résolues, sans repli silencieux.

### Performance 3D

- Caches de couleurs et de nuances réutilisées.
- Batches et particules persistants au lieu d’allocations systématiques.
- Buffers WebGL dynamiques réemployés avec mises à jour ciblées.
- Captures Chromium/SwiftShader relues : 3D active sans repli, **4 draw calls**, environ **12 000 à 32 000 sommets** selon l’arène et `frameMs` indicatif de **15,5 à 17,2 ms** dans le harnais logiciel.

## 4. Interface construite dans le décor

Chaque arène possède son thème d’interface (`STAGE_DECOR_THEMES`) : accent, halo, profondeur, panneau et rail. `syncStageDecor()` synchronise l’arène et l’ambiance vers les variables `--stage-*` du DOM.

- Le HUD devient un tableau d’affichage suspendu de l’arène.
- Menus et Options prennent la forme de consoles fixées dans la scénographie.
- Les contrôles tactiles sont regroupés dans des pods latéraux qui gardent le centre de combat dégagé.
- Le menu principal est ancré et compacté ; le minuteur central protège ses libellés des découpes.
- La carte locale regroupe combattant principal, format, réserviste, les trois étapes, les codes et le bouton de lancement.
- Un favicon intégré supprime l’ancien 404 navigateur.

## 5. Arbitrage du format : 2v2 Relais

Le moteur de combat et le lockstep actuels font s’affronter un combattant actif par camp. L’équipe a donc formalisé le **2v2 Relais** :

- chaque joueur engage **deux combattants distincts** : un principal et un réserviste ;
- le perdant d’un segment est éliminé et remplacé immédiatement par son réserviste ;
- le vainqueur du segment reste en piste pour la manche suivante ;
- la première équipe à remporter **deux éliminations** gagne le match ;
- les équipes sont assainies, incluses au hash/contexte des replays et appliquées de façon déterministe des deux côtés.

Il ne s’agit donc ni d’un simple duel renommé, ni de quatre combattants simultanés à l’écran : c’est un vrai match d’équipe en relais, compatible avec le moteur et le réseau existants.

## 6. Deux téléphones en local — fonctionnement

Le combat utilise **WebRTC DataChannel + lockstep déterministe**, exactement comme les duels en ligne, mais sans compte, sans Supabase et sans classement.

La signalisation est manuelle et hors serveur :

1. Les deux téléphones rejoignent le même Wi-Fi ou le point d’accès créé par l’un d’eux, puis ouvrent la même version de Godson FURY.
2. Chacun choisit son combattant principal et son réserviste dans **2V2 — 2 TÉLÉPHONES**.
3. **Hôte — étape 1** : créer l’invitation `GF61…` et l’envoyer/partager.
4. **Invité — étape 2** : coller l’invitation, créer sa réponse `GF61…` et la renvoyer.
5. **Hôte — étape 3** : coller la réponse, connecter les téléphones, attendre l’ouverture du canal puis lancer le match.

Au lancement, l’hôte envoie `start` mais n’initialise pas encore sa session :
l’invité initialise la sienne puis répond `start-ready` sur le canal fiable et
ordonné ; seulement alors l’hôte initialise le lockstep. Cet ordre empêche
les premières entrées de l’invité d’arriver avant la création de la session
hôte et d’être effacées — course réellement reproduite puis corrigée pendant
la QA navigateur.

Les codes contiennent la description WebRTC et les candidats du réseau local. Ils sont compressés (gzip lorsque le navigateur le permet, repli brut sinon) puis encodés en base64url. Lors de la preuve Chromium finale, l’invitation faisait **967 caractères** et la réponse **789 caractères**.

### Bluetooth : précision importante

Les navigateurs mobiles ne fournissent pas de transport Bluetooth pair-à-pair utilisable comme canal de jeu entre deux téléphones. Godson FURY ne promet donc pas un combat « par Bluetooth navigateur ». Le combat passe par le Wi-Fi/point d’accès ; en revanche, le bouton **Partager** peut utiliser Bluetooth, Nearby Share/AirDrop ou une messagerie de l’appareil pour transmettre les codes `GF61`.

### Conditions et limites connues

- Même version du jeu sur les deux téléphones.
- Même réseau local joignable : certains routeurs/points d’accès activent l’**isolation des clients**, qui empêche deux appareils de se voir.
- La version hébergée en HTTPS est recommandée pour WebRTC sur mobile.
- Match local amical : aucun point de classement mondial n’est envoyé.
- Si la liaison échoue, recréer les deux codes après avoir vérifié le réseau.

## 7. Validation Sarah

| Contrôle | Résultat V6.1 |
|---|---|
| Smoke test complet | **426 assertions source / 661 vérifications affichées — 100 % vert** |
| QA statique Sarah | contrôle **n°32 V6.1** ajouté ; release soumise au gate complet |
| Zéro gel | mécanismes absents du runtime + coup réel suivi d’une frame de simulation immédiate |
| Maquettes 3D | 41 fiches résolues ; **123 530 sommets** cumulés générés dans le test des 41 modèles |
| Captures navigateur | menu, carte locale et combats 3D relus ; aucun 404 après favicon intégré |
| 2v2 Relais | KO, relève AEL-7, seconde élimination, fin de match et replay d’équipe prouvés en simulation |
| Deux contextes Chromium | invitation → réponse → finalisation → DataChannel ouvert → lancement ; plus de **220 frames** lockstep, positions synchronisées et `desync=false` |
| Bundle autonome | **578 724 octets / 565 Ko**, 4 scripts intégrés, budget V6.1 ≤ 640 Ko |

## 8. Limites assumées et cap suivant

- La formalisation reste une **3D temps réel procédurale et stylisée** construite dans le bundle : ce ne sont pas des meshes photoréalistes externes importés des images. Les proportions, tenues, coiffures et armes des maquettes sont désormais explicites et reconnaissables personnage par personnage, sans asset lourd à télécharger.
- La preuve réseau automatisée couvre deux contextes Chromium sur la même machine. Une validation terrain sur deux téléphones physiques et un point d’accès réel reste recommandée avant de présenter le mode comme universellement compatible avec tous les routeurs.
- Le duel Online public entre **deux réseaux distincts** reste à valider séparément ; le mode local de la V6.1 ne dépend pas de ce test.
- Cap suivant conservé : **Tournoi & Saisons**, puis validation Online public.

---
✍️ Sprint officiel **Godson FURY ARENA** — signé Gideon - Godson.
