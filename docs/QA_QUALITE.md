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
| Visuel | captures navigateur réel (Chromium headless + WebGL) et canvas natif pour la 2D | combats et arènes relus par Kenzo/Marco ; en V6.1, maquettes 3D, interface-décor, carte deux téléphones et liaison WebRTC entre deux contextes Chromium sont vérifiés |
| Release | Git + tag | arbre propre, commit et version traçables |

## Seuils de release non négociables

- ✅ 100 % des tests d’exécution verts.
- ✅ Version autonome régénérée et scripts extraits revalidés.
- ✅ Zéro dépendance réseau pour jouer en local ; l’Online est opt-in et aucun secret serveur ne doit apparaître dans le client.
- ✅ Bundle officiel ≤ 640 Ko (budget relevé en V6.1 sur décision d’équipe pour les 41 maquettes 3D, l’interface-décor et le multijoueur local ; 565 Ko / 578 724 octets réels, 4 scripts intégrés), sans asset externe.
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
| Scène 3D V6.1 | arènes statiques en cache, couleurs/batches/buffers réutilisés ; environ 12 000–32 000 sommets/frame et 4 draw calls batchés sur les captures de référence ; repli auto si FPS durablement bas |

## Matrice manuelle avant les grosses releases

- Clavier AZERTY et QWERTY, flèches J2, pavé numérique.
- Tactile mobile : joystick gauche (course, saut diagonal, garde), relâchement au neutre, garde brève (parry), dash, attaques et martelage M1 en multi-touch.
- Formats d’écran : Adaptatif, Cinéma 16:9 et Plein cadre sur téléphone large, tablette, portrait/paysage et plein écran ; vérifier encoches et safe-areas.
- Graphismes AAA II : ombres au sol et en l’air dans les 3 ambiances, lisibilité des impacts léger/lourd/garde/parry/M1, motifs de tenue en sélection/VS/combat et tenue des 60 FPS en qualité auto.
- Réalité 3D : réglages Auto/Toujours/2D, perte/récupération WebGL, les 4 arènes × 3 ambiances, projectiles/particules sans point géant, poses de course/saut/garde/M1/chute et retour immédiat au pipeline 2D.
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
