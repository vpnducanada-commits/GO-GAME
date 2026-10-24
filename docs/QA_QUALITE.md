# ✅ STRATÉGIE QA & QUALITÉ — Godson FURY ARENA

**Lead QA / Performance / Release** : Sarah  
**Autorité** : Sarah dispose d’un **veto qualité** sur toute release qui échoue aux seuils ci-dessous.

## Pyramide de tests du projet

| Niveau | Outil | Ce qui est vérifié |
|---|---|---|
| Syntaxe | `node --check` | les 3 modules JS et les scripts du bundle |
| Statique | `tools/qa-check.py` | IDs HTML référencés, ordre des scripts, version, dépendances externes, budgets, hooks replay |
| Exécution | `tests/smoke-test.js` | menus, combats, IA, Histoire, Survie, parry/EX/projections/cancels, rendus, sauvegardes, déterminisme, replays, Arena Moods, tactile et client Online contre API simulée |
| HTTP | serveur local + `curl` | toutes les ressources en 200 |
| Visuel | captures hors-navigateur (canvas natif) | lineup des personnages et frame de combat relus par Kenzo avant release graphique (introduit en V3.1) |
| Release | Git + tag | arbre propre, commit et version traçables |

## Seuils de release non négociables

- ✅ 100 % des tests d’exécution verts.
- ✅ Version autonome régénérée et scripts extraits revalidés.
- ✅ Zéro dépendance réseau pour jouer en local ; l’Online est opt-in et aucun secret serveur ne doit apparaître dans le client.
- ✅ Bundle officiel ≤ 448 Ko (budget relevé en V5.0 sur décision d’équipe — édition Jeu Complet ; 418 Ko réels en V5.1 avec les 41 M1 individuels), sans asset externe.
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

## Matrice manuelle avant les grosses releases

- Clavier AZERTY et QWERTY, flèches J2, pavé numérique.
- Tactile mobile : déplacement, garde brève (parry), dash, attaques.
- Manettes : J1 et J2 si disponibles.
- Plein écran, changement d’onglet, reprise de pause.
- Profil vierge et profil migré depuis la version précédente.
- Online réel : deux comptes, deux navigateurs/appareils, Wi-Fi et données mobiles, salon créé/rejoint, désynchronisation impossible à classer et déconnexion propre.

## Rapport QA de sprint

Chaque rapport de livraison du Manager doit indiquer :
1. nombre de tests et résultat ;
2. taille du bundle ;
3. risques restants ;
4. décision QA : **GO** ou **NO-GO**.

---
✍️ Qualité officielle — Studio Gideon - Godson ARENA.
