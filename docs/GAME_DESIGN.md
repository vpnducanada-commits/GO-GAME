# 🎨 GAME DESIGN DOCUMENT — Gideon - Godson ARENA

**Lead Game Designer** : Nadia  
**Validation** : Manager officiel • **Vision** : Gideon - Godson, Product Owner

## Piliers de design

1. **Lire le combat en une seconde** : silhouettes nettes, attaques télégraphiées, effets distincts.
2. **Récompenser l’audace** : dash, jongles, contres et parry donnent l’avantage au joueur actif.
3. **Progression partout** : Histoire, Survie, Arcade, Hall of Fame, succès et personnage secret.
4. **Aucun personnage “inutile”** : chaque combattant gagne par un plan de jeu différent.

## Identités des personnages

| Personnage | Plan de jeu | Forces | Faiblesses volontaires | Spécial / SUPER |
|---|---|---|---|---|
| GÉDÉON | Pression équilibrée | fiable partout | aucun pic extrême | éclair rapide / vague perforante |
| Kira | Rush et rafales | vitesse, dash court | PV et dégâts unitaires faibles | 3 lames / tempête de 5 lames |
| TITAN | Mur offensif | 120 PV, puissance, portée | lent, récupération longue | onde au sol / séisme |
| Nova | Contrôle d’espace | énergie rapide, projectiles guidés | PV moyens | orbe chercheuse / pluie de météores |
| GODSON PRIME | Récompense légendaire | complet et spectaculaire | déblocage tardif | double vague / triple jugement |
| Zara | Marée mobile de Libreville | vitesse, portée, énergie | PV/défense moyens | Lames de Marée / raz-de-marée au sol |

## Frame data de référence

| Attaque | Démarrage | Dégâts de base | Rôle design |
|---|---:|---:|---|
| Poing | rapide | 6 | pression et début de combo |
| Pied | moyen | 9 | punition et recul |
| Uppercut ⬇+Poing | moyen | 11 | lanceur de jongle / anti-aérien |
| Balayage ⬇+Pied | moyen | 8 | ouverture basse, mise au sol |
| Spécial 50% | variable | 14 éq. | identité du personnage |
| EX Spécial 75% | rapide/moyen | 17 éq. | version renforcée unique, route intermédiaire entre Spécial et SUPER |
| Projection | très rapide, courte portée | 12 | réponse à la garde tenue, repositionnement et mise au sol |
| Godson Cancel | après impact confirmé | coût 25% | dash qui annule la récupération, 1 fois par combo |
| SUPER 100% | spectaculaire | 23–25 éq. | fin de round, moment signature |
| Parry | fenêtre ~150 ms | 0 encaissé | défense experte, riposte +35% |

*Les dégâts réels appliquent puissance du personnage, réduction de combo et bonus CONTRE/Riposte.*

## Systèmes V3.0 — profondeur sans casser la lisibilité

- **Projection** : Poing+Pied au corps-à-corps. Elle traverse la garde, mais exige d’être collé à une cible au sol et non déjà en hitstun ; la direction tenue choisit une projection avant ou arrière.
- **EX** : Spécial+Poing à 75 %. Chaque personnage reçoit une vraie variante (nombre, guidage, perforation ou taille), reconnaissable à son anneau doré.
- **Godson Cancel** : Dash pendant une attaque confirmée. Il coûte 25 %, reste verrouillé jusqu’à la fin du combo et transforme un hit en course de pression plutôt qu’en saut d’animation gratuit.
- **Anti-infini** : scaling de dégâts dès 0,92 puis plancher à 45 %, hitstun de jongle décroissant, backdash défensif et mise au sol protégée.
- **IA** : le bot peut projeter une garde, choisir un EX à distance et, en Difficile, tenter occasionnellement un Godson Cancel.
- **Online** : salon privé, mêmes règles des deux côtés, vitesse 100 %, pause désactivée et classement uniquement après accord des deux simulations.

## Boucles de rétention

| Boucle | Durée cible | Récompense |
|---|---:|---|
| Match rapide Bot/2J | 2–4 min | score, grade S→D, Hall of Fame |
| Histoire Chapitre 1 | 8–15 min | GODSON PRIME |
| Arcade | 10–20 min | titre de champion, succès |
| Survie | 3–15 min | record de vague, score cumulé |
| Carrière | long terme | grades Débutant → Légende Godson |
| Duel GO GAME Online | 2–5 min | rang mondial co-vérifié, replay partageable |

## Règles d’équilibrage de Nadia

- Un SUPER ne doit pas décider seul d’un round contre un joueur en garde correcte.
- Les projectiles multiples ont des dégâts unitaires réduits et restent soumis à la réduction de combo.
- Toute attaque au sol doit avoir une réponse claire : sauter, dasher, bloquer ou parer.
- Le bot Difficile doit punir les habitudes, mais garder une part d’erreur lisible.
- Les changements d’équilibrage se font par petits pas et sont notés au changelog.

## Prochains chantiers design validés

1. Sprint 09 « Compétition locale » : tournoi en tableau, défi tournant et équilibrage fondé sur les données de combat.
2. Online public éventuel : matchmaking, revanche synchronisée et spectateurs seulement après retours réseau réels sur les salons privés V3.0.
3. Nouveaux défis courts autour des projections, EX et Godson Cancels.

---
✍️ Design officiel — Studio Gideon - Godson ARENA.
