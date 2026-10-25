# 🎥 SPRINT V7.2 — « Réalité 3D II »

**Date** : 25 octobre 2026 • **Version** : 7.2.0 • **Propriétaire** : Gideon - Godson
**Équipe** : Manager & Développeur principal • Nadia (périmètre) • Kenzo (rendu 3D) • Marco (anatomie/costumes) • Lena (HUD/disposition) • Sarah (QA)

## 1. Déclencheur

Après la livraison V7.1, le propriétaire suspend explicitement la suite
fonctionnelle : « travaillons encore et encore sur le graphisme, le
réalisme, la disposition, l’affiche, les mouvements et tout ce qui est
jouabilité et affichage. Tant que nous n’aurons pas une véritable 3D
digne de ce nom nous resterons dessus. Tout paraît encore comme un
dessin d’enfant ».

Décision d’équipe : aucun nouveau mode en V7.2. Cinq passes de rendu
successives, chacune recapturée dans Chromium avec WebGL réel
(SwiftShader) et relue image par image avant la suivante.

## 2. Diagnostic chiffré de départ

| Défaut mesuré | Valeur V7.1 | Cible humaine |
|---|---:|---:|
| Largeur d’épaules | ~1,15 m | 0,44–0,52 m |
| Profondeur du torse | ~0,40 m | 0,22–0,27 m |
| Rayon de tête | ~0,13 m | ~0,105 m |
| Écart des pieds | ~0,55 m | 0,30–0,38 m |
| Spéculaire non métallique | 0,22 (plastique) | 0,08 |
| Hauteur du HUD supérieur | ~74 px | ~50 px, semi-transparent |

## 3. Les cinq passes

1. **Matières & lumière** — bruit de valeur GLSL (grain d’albédo et de
   rugosité compatible WebGL1/WebGL2), neuf tuiles d’atlas
   (pierre/béton/sable/bois/eau/verre), lumières par ambiance, ombres de
   contact, caméra basse en léger 3/4 avec zoom de distance et suivi des
   sauts, décors densifiés (gradins, toits, train, palmiers).
2. **Volumes & armes** — membres sans lobes sphériques parasites, garde
   à deux mains hautes, torsion réduite, `addWeapon3D()` réécrite dans
   le repère de la main avant (lames vers l’avant, crosses sombres,
   bâtons et boucliers ancrés).
3. **Torse aplati & suppressions** — profondeurs de loft humaines,
   retrait des coques/pectoraux en sphères, revers, anneaux circulaires,
   halos octogonaux, « mottes » du temple et plateforme enterrée.
4. **Costumes & décors** — torse bicolore par secteurs, palette armure
   domptée, bottes/genouillères sombres, jupe annulaire volumique,
   armes lourdes portées en arrière au repos, plateforme panneautée,
   allées du stade, écume segmentée et bateaux de Libreville.
5. **Corrections de capture** — suppression de la rayure accent
   « bavoir », superellipse assouplie, jupe réservée aux robes et
   relevée aux genoux, hache/masse dégagées du visage, spéculaire
   0,22 → 0,08 (fin des fusils gris et de la peau plastique), cônes du
   temple retirés, voilier réduit.

Lena : HUD de combat compact en fin de `src/style.css` (barres de vie
13 px, énergie 7 px, pips 9 px, timer réduit, panneaux
semi-transparents) sans retirer d’élément DOM fonctionnel.

## 4. Périmètre protégé

Aucun changement de simulation : déplacement, hitboxes, dégâts, IA,
chaînes M1, replays et hash, lockstep Supabase 1v1, 2v2 Relais local,
Tournoi & Saisons et repli 2D AAA II sont inchangés. Les fichiers
modifiés sont `src/render3d.js`, `src/render.js` (libellé de
télémétrie) et `src/style.css` (HUD), plus version/tests/docs.

## 5. Preuves QA (Sarah)

- Quatre duels capturés après chaque passe : Kael/Sora (stade),
  Krak/Brutus (temple), Vorak/AEL-7 (Tokyo), Gédéon/Kira (Libreville) —
  WebGL actif confirmé, zéro erreur d’exécution, scènes de 18 430 à
  54 582 sommets selon l’arène et la qualité adaptative.
- Smoke test et gate QA verts ; nouveau contrôle statique n°35 et
  assertions d’anatomie/arènes V7.2 dans la suite.
- Limites honnêtes : la géométrie reste procédurale et stylisée — pas
  de meshes auteur de studio ; SwiftShader ne prouve pas les FPS d’un
  téléphone. La trajectoire « véritable 3D » se poursuit en V7.3
  (visages, cheveux et costumes auteur par famille, animation d’armes
  et éclairage d’arène), en parallèle des validations Online/terrain.

---
✍️ Jeu créé et signé par **Gédéon - Godson** © 2026 — Libreville, Gabon
