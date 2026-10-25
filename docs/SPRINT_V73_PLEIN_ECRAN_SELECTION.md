# ⛶ SPRINT V7.3 — « Plein écran forcé & Sélection claire »

**Date** : 25 octobre 2026 • **Version** : 7.3.0 • **Propriétaire** : Gideon - Godson
**Équipe** : Manager & Développeur principal • Lena (UX plein écran) • Kenzo (affichage) • Marco (lisibilité personnages) • Sarah (QA)

## 1. Demandes du propriétaire (avec captures à l’appui)

1. « Le jeu doit directement s’ouvrir en plein écran paysage, ça doit
   être forcé. »
2. « La page du menu a trop de textes inutiles (M1, signature, etc.) »
3. Sur ses captures d’un écran de sélection de référence : « tu vois
   bien comment on peut voir la posture, les membres, les visages, les
   objets… C’est ce que je veux. » — sans exiger la même disposition,
   et sans copier de personnages sous droits d’auteur : le standard de
   lisibilité est appliqué aux 41 héros originaux du jeu.

## 2. Plein écran paysage forcé — ce que « forcé » veut dire en web

Les navigateurs interdisent tout plein écran sans geste utilisateur.
La solution des jeux web professionnels est appliquée :

- l’écran de chargement se termine sur un écran-titre **▶ ENTRER DANS
  L’ARÈNE** ; le toucher appelle `finishBoot()` →
  `requestImmersiveLandscape()` (plein écran `navigationUI:"hide"` +
  `screen.orientation.lock("landscape")`) ;
- sur tactile (`pointer:coarse`), tout contact ultérieur sans plein
  écran relance l’immersion ;
- le bouton **« Continuer en portrait » est supprimé** : en portrait
  (≤ 860 px), seul le dialogue « Tourne ton appareil » couvre l’écran ;
- sur iPhone/Safari, le verrouillage d’orientation n’existe pas en web :
  le blocage portrait reste la garantie équivalente.

## 3. Menus épurés

Bloc CSS « V7.3 » en fin de `src/style.css` (prioritaire) : les cartes
de modes deviennent icône (33 px) + nom court centrés ; descriptions
des modes, sous-titres de bannières, mini-notes et petits textes du hub
sont masqués. La ligne signée du menu ne garde que « ✍️ Créé & signé
par Gédéon - Godson © 2026 ». Le bandeau canvas défilant de fond ne
dit plus que « Godson FURY ARENA ✦ COMBAT 1V1 ✦ LIBREVILLE ».
Les éléments masqués restent dans le DOM : aucun écran fonctionnel
(Carrière, Tournoi, replays) ne perd ses données.

## 4. Sélection plein corps

- Grille : colonnes `minmax(106px,1fr)` (84 px sous 900 px), cartes
  mesurées à 137 px de large en 1280×720 ; figurines du moteur 2D
  zoomées (cartes ×1,12, aperçus ×1,5) pour remplir le cadre.
- Nom seul sous chaque figurine ; titres de personnage masqués.
- Aperçus latéraux : canvas affiché à 148 px + nom en 22 px ;
  statistiques, ligne « M1 … (n coups) » et panneau « Techniques »
  masqués à la sélection.
- Combattant secret : grand cadenas + « ??? SECRET », comme les
  cadenas des captures du propriétaire.

## 5. Preuves QA (Sarah)

- Captures Chromium réelles : écran-titre (bouton d’entrée visible,
  boot non terminé), menu épuré, sélection (41 cartes, statistiques
  masquées `display:none` vérifié), portrait 390×844 (dialogue de
  rotation `flex`, aucun bouton portrait) — **zéro erreur** console.
- Smoke + gate QA verts, nouveau contrôle statique n°36 ; l’ancien
  test « choix portrait respecté » devient « aucun mode portrait
  toléré (V7.3) ».
- Limites honnêtes : le plein écran automatique sans aucun toucher
  reste impossible dans un navigateur ; les portraits de sélection
  sont ceux du moteur 2D stylisé (le combat, lui, est en 3D V7.2) —
  leur enrichissement continue avec la trajectoire graphique.

---
✍️ Jeu créé et signé par **Gédéon - Godson** © 2026 — Libreville, Gabon
