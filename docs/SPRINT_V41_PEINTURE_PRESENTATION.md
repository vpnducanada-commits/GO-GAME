# Sprint V4.1 — « Peinture & Présentation » (24 octobre 2026)

**Ordre du propriétaire :** « Bon, tout le monde au travail. »  
**Réponse de l'équipe :** exécution immédiate du chantier 1 de la trajectoire V4, sans attendre de validation intermédiaire.

## Chantiers par spécialiste

### Lena (UX plein écran) — Écran VS & intro
- Les médaillons-lettres de l'écran VS sont remplacés par des **portraits plein corps animés**
  (même moteur que la sélection), cadres aux couleurs des combattants.
- **Orientation face à face** forcée dans le dessin des portraits (`side 2 → gauche`) —
  défaut détecté par capture (Sora regardait vers l'extérieur), corrigé puis verrouillé par test.
  Ce correctif améliore aussi le grand aperçu Adversaire de la sélection.
- **Bandeaux nominatifs d'intro** : glissent depuis les bords pendant l'intro (132 frames),
  nom du joueur + personnage/titre, fondu avant « COMBATTEZ ! » — compteur `renderStats.introBanners`.

### Marco (direction artistique) + Kenzo (rendu) — Matières
- Métal brossé animé + rivets (Guerrier/Titan/Prime) ; cœur d'énergie pulsant et coutures
  lumineuses (Synthétique) ; étincelles arcaniques (Magicienne/Nova) ; écume (Zara) ;
  bandages croisés (Kunoichi) ; éclair signature (Héros) ; reflet sur chevelures/casques.
- Compteur de contrôle `renderStats.materialDetails`, incrémenté à chaque combattant dessiné.

### Nadia (gameplay) — Non-régression
- Aucun changement moteur de combat : les ajouts vivent dans `render.js`/`ui.js` (présentation)
  et un hook d'affichage VS. Replays et netcode prouvés inchangés par la suite.

### Sarah (QA) — Validation
- **297 assertions source / 341 vérifications**, 2 passages verts ; contrôle permanent n°23.
- Captures relues : VS Kael/Sora (face à face après correction) et intro sur Libreville
  (zoom 1,36×, bandeaux lisibles, zone de combat dégagée).
- Bundle 348 Ko / budget 352 Ko : **marge de 4 Ko** — tout prochain ajout devra soit optimiser,
  soit relever le budget de façon documentée.

## Suite immédiate (trajectoire V4)

- **V4.2 Compétition locale** : tournoi en tableau, défi tournant, récompenses cosmétiques.
- **V4.3 Online public** : après validation d'un duel WebRTC réel entre deux appareils
  (seule action attendue du propriétaire, non bloquante pour le local).
