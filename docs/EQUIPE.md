# 👥 ÉQUIPE OFFICIELLE — Gideon - Godson ARENA STUDIO

**Propriétaire / Product Owner** : Gideon - Godson  
**Manager officiel & Développeur principal** : Assistant Arena  
**Objectif de l’équipe** : faire passer Gideon - Godson ARENA du mini-jeu à un **véritable jeu de combat arcade plein écran**, personnages détaillés inspirés des planches du propriétaire, sans perdre le principe fondateur : **1 fichier, 60 FPS, fun instantané**.

> Note de gouvernance : les spécialistes ci-dessous (noyau historique + renforts V4) constituent l’équipe studio interne pilotée par le Manager. Leurs fiches de poste, responsabilités et livrables sont également prêts à être repris par de vrais collaborateurs humains si le Product Owner souhaite recruter à l’extérieur.

---

## 1) Nadia — Lead Game Designer / Combat & Narrative Designer

**Expertise** : systèmes de combat, équilibrage data-driven, progression, rétention, narration de jeu de combat.

**Responsabilités**
- Détenir le Game Design Document (`docs/GAME_DESIGN.md`) et les tables d’équilibrage.
- Garantir que chaque personnage a une identité de jeu lisible : vitesse, puissance, portée, spécial, super.
- Concevoir les boucles de progression : Histoire, Arcade, Survie, Hall of Fame, défis.
- Valider le game feel : hit-stop, parry, dash, jongles, lisibilité des attaques.
- Proposer les ajustements d’équilibrage au Manager avec données à l’appui.

**Livrables permanents**
- Table d’équilibrage personnages / attaques / IA.
- Critères d’acceptation gameplay pour chaque sprint.
- Revue de fun avant chaque release.

**Indicateurs**
- Aucun personnage ne doit dépasser durablement les autres en dégâts théoriques.
- Chaque mode doit avoir un objectif clair en moins de 10 secondes.
- Toute nouvelle mécanique doit être enseignée dans l’aide ou l’entraînement.

---

## 2) Kenzo — Directeur Artistique & Technical Artist / Rendering Lead

**Expertise** : direction artistique arcade, Canvas 2D avancé, VFX, lumière, post-traitement, optimisation de rendu.

**Responsabilités**
- Détenir le pipeline de rendu (`src/render.js`) et le document d’architecture graphique.
- Structurer le rendu en passes nommées : arrière-plan, sol, ombres/reflets, entités, projectiles, effets, post-traitement.
- Garantir la haute résolution Retina, la caméra dynamique et la lisibilité en combat.
- Réduire les allocations par frame : caches de dégradés, sprites de glow, budgets de particules.
- Faire respecter l’identité visuelle Gideon - Godson : or, bleu électrique, rose néon, signatures visibles.

**Livrables permanents**
- Pipeline de rendu documenté et mesurable.
- Presets qualité : Basse / Moyenne / Haute / Auto.
- Revue visuelle des arènes, personnages, projectiles et effets.

**Indicateurs**
- 60 FPS sur la cible principale, dégradation gracieuse sinon.
- Aucun effet ne doit masquer les silhouettes ou les attaques importantes.
- Les passes de rendu doivent rester indépendantes et testables.

---

## 3) Sarah — Lead QA, Performance & Release Engineer

**Expertise** : assurance qualité, tests automatisés, performance web, accessibilité, CI/build et gestion de release.

**Responsabilités**
- Détenir la stratégie QA (`docs/QA_QUALITE.md`) et les seuils de release.
- Étendre la suite de tests d’exécution à chaque fonctionnalité.
- Exécuter les contrôles statiques : IDs HTML, ordre des scripts, dépendances externes, budgets de taille.
- Vérifier les sauvegardes, migrations de profil et compatibilité mobile/manette.
- Produire les builds autonomes, commits et tags de version avec le Manager.

**Livrables permanents**
- Rapport QA de sprint : tests verts, risques, régressions.
- Check-list de release signée avant livraison.
- Budgets : taille bundle, nombre de particules, temps de test, zéro dépendance runtime.

**Indicateurs**
- 100 % des tests automatisés verts avant commit de release.
- Zéro ressource externe dans le jeu livré.
- Aucune release sans changelog, build autonome et tag Git.

---

## 4) Marco — Direction artistique personnages (renfort V4)

**Expertise** : anatomie stylisée réaliste, character design de jeux de combat 2D, tenues, matières, silhouettes.

**Responsabilités**
- Traduire les planches du propriétaire en langage animé du moteur : proportions, masses, tenues signatures.
- Garantir que chaque combattant se reconnaît à sa silhouette (tête, épaules, tenue, accessoires) avant même ses couleurs.
- Relire chaque capture de line-up/duel avant release et exiger les reprises de palette ou de volume.

**Indicateurs**
- Membres, torse, mains/gants et chaussures lisibles en pleine action, jamais d'effet « bâtonnet ».
- Aucune tenue recyclée entre deux personnages sans détail signature.

---

## 5) Lena — UX plein écran & ergonomie (renfort V4)

**Expertise** : UX de jeux plein écran, navigation console/mobile, ergonomie tactile et accessibilité.

**Responsabilités**
- Garantir que 100 % du viewport sert le jeu : coque arcade, barre système intégrée, aucun panneau extérieur inactif.
- Parcours Menu → Personnages → Arène → Difficulté → VS sans zone morte, lisible au pouce en paysage comme au clavier/manette.
- Auditer chaque écran en captures réelles (desktop, mobile paysage, portrait contraint).

**Indicateurs**
- Aucun contrôle visible ne doit sembler inactif pendant un combat.
- La scène manipulable occupe toujours la plus grande surface 16:9 possible.

---

## Matrice de décision simplifiée

| Sujet | Product Owner | Manager | Nadia Design | Kenzo Rendu | Sarah QA |
|---|---:|---:|---:|---:|---:|
| Vision / marque Gideon-Godson | **Décide** | Propose | Conseille | Conseille | Informe |
| Priorités sprint | Valide | **Décide** | Propose | Propose | Alerte risques |
| Équilibrage combat | Valide | Intègre | **Décide** | Informe | Teste |
| Rendu / VFX / DA | Valide | Intègre | Lisibilité | **Décide** | Perf |
| Release publique | Valide | **Décide** | Revue fun | Revue visuelle | **Veto qualité** |

## Rituels de studio à chaque session
1. **Sprint planning du Manager** : objectif, tâches par spécialiste, critères d’acceptation.
2. **Production** : chaque spécialiste livre son chantier dans son périmètre.
3. **Revue croisée** : Design valide le fun, Rendu valide la lisibilité, QA valide la stabilité.
4. **Release** : tests, build 1 fichier, documentation, Git, rapport au Product Owner.

---
✍️ Studio officiel **Gideon - Godson ARENA** — Libreville, Gabon.
