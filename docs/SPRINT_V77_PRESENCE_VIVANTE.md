# ✨ SPRINT V7.7 — « Présence Vivante »

**Date** : 25 octobre 2026 • **Version** : 7.7.0 • **Propriétaire** : Gideon - Godson
**Équipe** : Manager & Développeur principal • Marco (direction personnages) • Kenzo (animation/rendu) • Nadia (game feel) • Sarah (QA)

## 1. Point de départ

Le propriétaire demande de continuer le travail après la V7.6
« Mobilité Dynamique ». La trajectoire graphique reste prioritaire :
les personnages doivent continuer à quitter l’aspect de figurines
figées pour se rapprocher d’une vraie présence de jeu de combat 3D.

L’audit de Kenzo et Marco a relevé quatre limites visibles à taille
réelle :

1. le visage 3D restait neutre pendant l’attaque, la douleur, la
   garde et le K.O. alors que le moteur d’animation calculait déjà
   regard, sourcils, bouche et fatigue ;
2. les doigts avaient une courbure unique, incapable de distinguer
   un poing fermé, une paume de sort, une projection et une prise
   d’arme ;
3. fusils, bâtons, lances, katanas et haches n’étaient tenus que par
   la main avant ;
4. les bottes restaient horizontales pendant toute la foulée : ni
   attaque du talon, ni poussée de pointe, ni cheville relâchée en
   l’air, malgré la nouvelle foulée anti-patinage de la V7.6.

## 2. Réalisations

### Visages pilotés par l’état de combat

`buildFighterPose3D()` produit un `face77` nommé : `focus`, `attack`,
`hurt`, `block`, `parry`, `guard`, `tired`, `win` ou `ko`.

- l’iris suit le `gazeX/gazeY` déjà calculé vers l’adversaire ;
- l’ouverture des yeux varie avec l’expression et `blinkT` referme
  les paupières pendant les clignements ;
- chaque sourcil est dessiné en deux segments dont les hauteurs
  interne/externe créent une vraie inclinaison ;
- la bouche s’ouvre avec cavité, rangée de dents et langue lors des
  efforts et impacts forts ; la victoire compose un sourire en trois
  petites pièces ;
- les narines se dilatent légèrement avec la tension.

Les combattants couverts ne sont pas exclus : la hauteur et l’éclat
des visières robot/casque, la fente lumineuse des capuches et les
fentes oculaires des bandeaux voilés suivent le même `face77`.

### Mains en phalanges et armes à deux mains

Chaque doigt est désormais construit en trois segments dont l’angle
cumulé dépend d’un `curl` continu. Le pouce possède deux segments et
traverse la paume quand la main se ferme.

États produits par `hand77` :

- `paume` pour les sorts en orbe, les orbes/cristaux et la victoire ;
- `semi` pour projections et mains relâchées ;
- `garde` pour une garde souple ;
- `poing` pour les frappes à main nue ;
- `prise` pour toute arme tenue par la main avant ;
- `soutien` pour la seconde main des armes longues/lourdes.

Au repos, en garde et en course, la main arrière vient se placer sur
le fût du fusil, le manche du bâton ou de la lance, près du pommeau
du katana, ou plus bas sur la hampe d’une hache/massue.

### Bottes articulées

`foot77` fournit pour chaque pied un pas (`pitch`), une flexion
d’orteils (`toe`) et un taux de contact :

- en course, le pied avant attaque par le talon pendant que le pied
  arrière pousse sur la pointe avec talon levé ;
- en l’air, les chevilles se relâchent et les pointes descendent ;
- en coup de pied, le pied frappeur se pointe et le pied d’appui
  pivote au sol ;
- le dash oppose un talon avant franc à une poussée arrière ;
- la réception écrase progressivement l’angle vers un appui plat ;
- la semelle et le bout de botte suivent l’angle réel du pied, avec
  garde-fou pour ne jamais passer sous le sol au contact franc.

### Réaction d’impact sans gel

Un `impact77` visuel est dérivé de `hitStun`, `hitFlash`,
`blockStun`, `parryT/parryFlashT`, de la vitesse de recul et du
jonglage éventuel. Il déplace en cascade bassin, buste, épaules,
tête et mains, abaisse les mains du combattant touché, écarte la
main d’un parry et pousse cheveux/tissus dans le sens du choc.

Aucune temporisation n’est ajoutée : la règle « zéro gel d’impact »
du propriétaire reste absolue.

## 3. Preuves QA (Sarah)

- Smoke V7.7 : expressions mesurées de Gideon (focus → attaque),
  Titan (douleur → K.O.), prise/soutien du fusil d’AEL-7, paume de
  sort de Nova, course de Kira à `gaitPhase=2,2` (avant
  `pitch≈+0,105/contact=1`, arrière `pitch≈−0,223/contact≈0,26`),
  air à `pitch=−0,34`, et poses séparées coup/garde/parry.
- Chromium WebGL réel, zéro erreur : AEL-7 tient le fusil à deux
  mains (`prise/soutien`, curl 0,96/0,96) ; Titan encaisse avec
  `impact=0,83`, yeux à 0,18 et bouche à 1 ; Kira court avec appui
  talon/pointe opposé ; Zara présente des chevilles relâchées en
  l’air. Scènes complètes mesurées entre 50 219 et 53 134 sommets.
- Périmètre : aucun fichier de simulation modifié par le cœur du
  sprint ; seuls l’affichage de version et les constantes de
  télémétrie changent hors `render3d.js`. Les replays V7.6 restent
  donc relus avec le profil dynamique, et les replays plus anciens
  avec le profil legacy de la V7.6.
- Limites honnêtes : Chromium/SwiftShader ne mesure pas les FPS d’un
  téléphone réel. La validation tactile et thermique sur appareils
  physiques, ainsi qu’un duel Online entre deux réseaux distincts,
  restent les prochaines preuves terrain à obtenir.

---
✍️ Jeu créé et signé par **Gédéon - Godson** © 2026 — Libreville, Gabon
