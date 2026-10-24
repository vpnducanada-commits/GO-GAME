# Sprint V7.1 — « Tournoi & Saisons »

**Date de livraison :** 24 octobre 2026  
**Propriétaire :** Gideon - Godson  
**Manager & développeur principal :** Assistant Arena  
**Équipe mobilisée :** Nadia (Design), Kenzo (Rendu), Sarah (QA), Marco (personnages), Lena (UX)

## 1. Mandat

Après la V7.0 « Anatomie AAA », la roadmap demandait le cap **Tournoi & Saisons**. L’audit a confirmé que le Championnat Godson existant est une tournée linéaire de 5, 8 ou 12 combats : utile, mais ce n’est pas un tableau de tournoi. La V7.1 ajoute donc un mode distinct, sans remplacer ni casser la progression V5.

## 2. Arbitrages de production

- **Local contre le bot uniquement.** Les salons Supabase restent des duels 1v1 ; le 2v2 Relais reste le mode deux téléphones non classé.
- **Aucun classement de saison réseau** n’est promis : les points V7.1 sont sauvegardés dans la carrière locale/cloud du profil, sans autorité serveur.
- **Anti-farming :** les points ne sont crédités qu’une seule fois lorsque le tournoi est terminé. Un abandon ne rapporte aucun point.
- **Saison fixe :** la Saison 1 n’expire pas selon une horloge en V7.1. Le code archive déjà une ancienne saison avant de réinitialiser la suivante lors d’un futur changement manuel.
- **Simulation préservée :** les matchs du joueur utilisent le moteur normal ; les affiches CPU emploient un hash dédié au bracket, jamais le hasard visuel des replays.

## 3. Les trois coupes

| Coupe | Participants | Tours | Difficultés | Récompense champion | Points champion de base |
|---|---:|---|---|---:|---:|
| ⚡ Coupe Express | 4 | Demi-finales → Finale | Facile → Difficile | 220 XP + 140 Godson | 160 |
| 🏆 Coupe Godson | 8 | Quarts → Demis → Finale | Moyen → Difficile → Difficile | 420 XP + 260 Godson | 260 |
| 👑 Coupe des Légendes | 16 | Huitièmes → Quarts → Demis → Finale | Moyen → Difficile ×3 | 750 XP + 480 Godson | 420 |

Chaque victoire du joueur ajoute aussi **10 points de saison**, uniquement dans le total final. Les autres classements rapportent :

- Express : finaliste 90, demi-finaliste 40 ;
- Godson : finaliste 150, demi-finaliste 80, quart de finaliste 35 ;
- Légendes : finaliste 240, demi-finaliste 130, quart de finaliste 70, huitième de finaliste 30.

## 4. Construction du bracket

1. Le combattant du joueur est inclus une seule fois ; les autres entrants CPU sont uniques.
2. Une cote lisible combine PV, puissance, vitesse, vitesse d’attaque, gain d’énergie et portée.
3. Les entrants sont classés par cote puis placés avec l’ordre classique des têtes de série (par exemple 1, 8, 4, 5, 2, 7, 3, 6 pour huit participants).
4. La Coupe des Légendes garantit GODSON PRIME parmi les CPU si le joueur ne l’a pas choisi ; la Coupe Godson garantit au moins un profil d’élite.
5. Une graine de bracket rend le tirage et les affiches CPU reproductibles. La probabilité CPU suit une courbe logistique selon l’écart de cote ; les scores respectent le nombre de rounds à gagner choisi dans les réglages.

Le joueur peut changer de combattant tant que le bracket est en prévisualisation. Au premier lancement, le combattant devient verrouillé jusqu’à la fin ou l’abandon. Quitter un match en cours ne consigne aucun résultat : la rencontre reste à jouer.

## 5. Saison 1 — Aurore de Libreville

| Palier | Points | Récompense |
|---|---:|---|
| 🌤️ Aube | 100 | 100 XP + 75 Godson |
| 🌊 Marée | 250 | 175 XP + 125 Godson + titre « Champion de la Marée » |
| ☀️ Soleil de Libreville | 500 | 275 XP + 200 Godson |
| 👑 Couronne Aurore | 900 | 450 XP + 350 Godson + titre « Champion de l’Aurore » |
| 🌌 Mythe de Saison | 1 400 | 800 XP + 600 Godson + titre « Mythe de l’Aurore » |

La saison conserve les points, réclamations, nombre de tournois, victoires de bracket, titres par coupe, meilleur classement, un historique de 12 résultats, le dernier bracket terminé et les archives de saisons. Quatre quêtes relient le mode à la Carrière : premier tournoi terminé, premier titre, 500 points et triple couronne.

## 6. Interface et parcours — Lena

- Carte pleine largeur **Tournoi & Saisons** dans le menu principal.
- Écran dédié : statut, jauge de saison, statistiques, cinq paliers, trois formats, bracket en colonnes à défilement horizontal, actions principales et historique.
- Section dédiée dans la Carrière et objectif prioritaire du hub quand un match de bracket attend.
- Sélection verrouillée sur l’adversaire du tour ; arène et difficulté imposées ; écran VS et HUD nomment la coupe et le tour.
- Fin de match sans revanche : le bouton principal rouvre le bracket, déjà avancé ou terminé.

## 7. Persistance, replays et compatibilité

- `career.activeTournament` conserve un bracket en prévisualisation ou actif ; `career.season.lastTournament` conserve le dernier tableau terminé.
- Les profils antérieurs sont migrés avec une Saison 1 vierge, sans effacer XP, Godson, circuits, quêtes, titres ou déblocages.
- Le contexte replay enregistre format, graine, tour et match. Lire un replay ne modifie ni le bracket actif ni les points.
- Hitboxes, dégâts, M1 Signature, IA, lockstep, Online 1v1, 2v2 Relais, zéro gel d’impact, Anatomie AAA et repli 2D sont conservés.

## 8. Validation — Sarah

- Smoke test : **453 assertions source / 689 vérifications affichées**, toutes vertes.
- Contrôle QA statique n°34 « Tournoi & Saisons V7.1 ».
- Couverture spécifique : migration, tailles 4/8/16, unicité, même graine → même bracket, reprise après rechargement d’état, victoire et avancement, champion sans double point, défaite avec champion CPU, palier unique et titre équipable, DOM complet et vrai match de demi-finale jusqu’au retour au bracket.
- Validation navigateur en paysage : menu principal, console Tournoi/Saison, sélection du match, combat et fin de match/bracket relus visuellement ; aucune erreur JavaScript relevée pendant le parcours contrôlé.
- Bundle autonome : **671 709 octets (655 Ko)**, sous le budget V7 de 704 Ko, sans ressource externe.

## 9. Limites connues et suite

- Les matchs CPU sont une résolution statistique déterministe, pas des combats complets simulés frame par frame en arrière-plan.
- La saison est locale au profil ; un classement mondial exigerait une validation serveur dédiée et n’est pas annoncé comme livré.
- Aucun tournoi Online n’est inclus : les salons réseau restent en duel 1v1 et le 2v2 local reste non classé.
- Les FPS et l’ergonomie doivent encore être confirmés sur téléphones physiques représentatifs, comme pour la V7.0.
- Prochaines validations : duel Online public entre deux réseaux distincts, session deux téléphones physiques et mesures de performance réelles.

---
✍️ **Godson FURY ARENA V7.1**, créé et signé par **Gideon - Godson** — Libreville, Gabon.
