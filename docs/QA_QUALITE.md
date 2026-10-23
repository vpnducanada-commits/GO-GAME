# ✅ STRATÉGIE QA & QUALITÉ — Gideon - Godson ARENA

**Lead QA / Performance / Release** : Sarah  
**Autorité** : Sarah dispose d’un **veto qualité** sur toute release qui échoue aux seuils ci-dessous.

## Pyramide de tests du projet

| Niveau | Outil | Ce qui est vérifié |
|---|---|---|
| Syntaxe | `node --check` | les 3 modules JS et les scripts du bundle |
| Statique | `tools/qa-check.py` | IDs HTML référencés, ordre des scripts, version, dépendances externes, budgets, hooks replay |
| Exécution | `tests/smoke-test.js` | menus, combats, IA, Histoire, Survie, parry, rendus, sauvegardes, déterminisme des replays |
| HTTP | serveur local + `curl` | toutes les ressources en 200 |
| Release | Git + tag | arbre propre, commit et version traçables |

## Seuils de release non négociables

- ✅ 100 % des tests d’exécution verts.
- ✅ Version autonome régénérée et scripts extraits revalidés.
- ✅ Zéro dépendance réseau dans le jeu livré.
- ✅ Bundle officiel < 200 Ko tant qu’aucun asset externe n’est introduit.
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

## Rapport QA de sprint

Chaque rapport de livraison du Manager doit indiquer :
1. nombre de tests et résultat ;
2. taille du bundle ;
3. risques restants ;
4. décision QA : **GO** ou **NO-GO**.

---
✍️ Qualité officielle — Studio Gideon - Godson ARENA.
