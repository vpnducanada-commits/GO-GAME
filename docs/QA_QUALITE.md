# ✅ STRATÉGIE QA & QUALITÉ — Godson FURY ARENA

**Lead QA / Performance / Release** : Sarah  
**Autorité** : Sarah dispose d’un **veto qualité** sur toute release qui échoue aux seuils ci-dessous.

## Pyramide de tests du projet

| Niveau | Outil | Ce qui est vérifié |
|---|---|---|
| Syntaxe | `node --check` | les 4 modules JS (`engine`, `render`, `render3d`, `ui`) et les scripts du bundle |
| Statique | `tools/qa-check.py` | IDs HTML référencés, ordre des scripts, version, dépendances externes, budgets, hooks replay |
| Exécution | `tests/smoke-test.js` | menus, combats, IA, Histoire, Survie, parry/EX/projections/cancels, rendus, sauvegardes, déterminisme, replays, Arena Moods, tactile et client Online contre API simulée |
| HTTP | serveur local + `curl` | toutes les ressources en 200 |
| Visuel | captures navigateur réel (Chromium headless + WebGL) et canvas natif pour la 2D | combats et arènes relus par Kenzo/Marco ; en V7.5, gros plans Brax/Zara-nova (barbe pleine contre chignon), Zara/Sora (tresses contre cheveux longs) et Krak/Drakar (orc contre barbe rousse) relus en captures Chromium, en conservant les preuves V7.4 (postures), V7.3 (plein écran) et V7.2 (quatre duels WebGL) |
| Release | Git + tag | arbre propre, commit et version traçables |

## Seuils de release non négociables

- ✅ 100 % des tests d’exécution verts.
- ✅ Version autonome régénérée et scripts extraits revalidés.
- ✅ Zéro dépendance réseau pour jouer en local ; l’Online est opt-in et aucun secret serveur ne doit apparaître dans le client.
- ✅ Bundle officiel ≤ 704 Ko (budget relevé en V7.0 sur décision d’équipe pour la sculpture, les matières et les ombres procédurales ; 675 Ko / 691 500 octets réels en V7.5, 4 scripts intégrés), sans asset externe.
- ✅ Sauvegarde des anciennes versions migrée sans perte.
- ✅ `CHANGELOG.md`, `README.md`, roadmap et indicateurs à jour.

## Budgets performance

| Ressource | Budget |
|---|---:|
| Particules simultanées | 170 / 320 / 540 selon preset |
| Projectiles simultanés | < 30 en jeu normal |
| Allocations d’objets d’entrée | objets réutilisés par joueur |
| Dégradés recréés par frame | à éviter : utiliser les caches du pipeline |
| Cible d’affichage | 60 FPS, dégradation par la qualité auto |
| Scène 3D V7.2 | arènes statiques en cache, batches/buffers réutilisés ; scènes complètes mesurées à 18 430–54 582 sommets dans Chromium SwiftShader (stade le plus dense), zéro erreur ; ombres cadencées, LOD adaptatif et repli auto si FPS durablement bas — FPS réels à confirmer sur téléphone |

## Matrice manuelle avant les grosses releases

- Clavier AZERTY et QWERTY, flèches J2, pavé numérique.
- Tactile mobile : joystick gauche (course, saut diagonal, garde), relâchement au neutre, garde brève (parry), dash, attaques et martelage M1 en multi-touch.
- Formats d’écran : Adaptatif, Cinéma 16:9 et Plein cadre sur téléphone large, tablette, portrait/paysage et plein écran ; vérifier encoches et safe-areas.
- Graphismes AAA II : ombres au sol et en l’air dans les 3 ambiances, lisibilité des impacts léger/lourd/garde/parry/M1, motifs de tenue en sélection/VS/combat et tenue des 60 FPS en qualité auto.
- Réalité 3D : réglages Auto/Toujours/2D, perte/récupération WebGL, les 4 arènes × 3 ambiances, projectiles/particules sans point géant, poses de course/saut/garde/M1/chute et retour immédiat au pipeline 2D.
- Anatomie AAA V7.0 : torse/tête/membres loftés, visage, mains, bottes, matières, bump WebGL1/WebGL2, ombres PCF et posture 3/4 sur les familles athlète, féminine, colosse, robot et armure lourde ; contrôler les trois qualités et le retour 2D.
- Visages & Costumes V7.5 : gros plans par famille (barbus, chignon, tresses, cheveux longs, mohawk, capuches, robots) — coiffe sans effet casque, mèches devant les oreilles, barbe raccordée à la mâchoire, aucune géométrie traversant le visage.
- Identités de combat V7.4 : vérifier sur représentants de chaque famille (colosse carré, moine bas, tireur en visée, lame de profil, mage droit) la stance au repos, le poing, le pied, le spécial et la posture d’affiche à la sélection/VS, sans membre cassé ni pied flottant.
- Plein écran & Sélection V7.3 : entrée « ENTRER DANS L’ARÈNE » → plein écran + verrouillage paysage sur Android/Chrome, rotation portrait bloquée puis reprise en paysage, menus sans texte parasite, les 41 cartes plein corps et le cadenas secret lisibles en paysage étroit.
- Réalité 3D II V7.2 : proportions par famille (athlète, féminine, colosse, robot, armure), armes au repos et en extension, jupes de robes, caméra de distance/saut, HUD compact en paysage étroit et les quatre arènes × ambiances sans plaque ni halo parasite.
- Tournoi & Saisons V7.1 : générer les brackets 4/8/16, changer de combattant avant le premier match puis vérifier le verrouillage, quitter/reprendre un bracket, gagner un tour, perdre et contrôler le champion CPU, empêcher tout double crédit de points, réclamer/équiper un palier et relire le tableau en paysage étroit.
- Maquettes Vivantes V6.1 : muscles/proportions/tenues/coiffures/armes sur représentants de chaque famille, IDs à casse mixte (`Zara`, `Lira`, `Kairos`, `Zara-Nova`), aucun gel perceptible après léger/lourd/M1/K.O. et thèmes d’interface des 4 arènes.
- Manettes : J1 et J2 si disponibles.
- Plein écran, changement d’onglet, reprise de pause.
- Profil vierge et profil migré depuis la version précédente.
- Online réel : deux comptes, deux navigateurs/appareils, Wi-Fi et données mobiles, salon créé/rejoint, désynchronisation impossible à classer et déconnexion propre.
- Deux téléphones V6.1 : même Wi-Fi et point d’accès d’un téléphone, invitation/réponse GF61 copiées et partagées, principal/réserviste distincts, relève après K.O., victoire à deux éliminations, isolation client du routeur, versions différentes refusées et aucun résultat classé.

## Rapport QA de sprint

Chaque rapport de livraison du Manager doit indiquer :
1. nombre de tests et résultat ;
2. taille du bundle ;
3. risques restants ;
4. décision QA : **GO** ou **NO-GO**.

---
✍️ Qualité officielle — Studio Gideon - Godson ARENA.
