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

## Frame data de référence

| Attaque | Démarrage | Dégâts de base | Rôle design |
|---|---:|---:|---|
| Poing | rapide | 6 | pression et début de combo |
| Pied | moyen | 9 | punition et recul |
| Uppercut ⬇+Poing | moyen | 11 | lanceur de jongle / anti-aérien |
| Balayage ⬇+Pied | moyen | 8 | ouverture basse, mise au sol |
| Spécial 50% | variable | 14 éq. | identité du personnage |
| SUPER 100% | spectaculaire | 23–25 éq. | fin de round, moment signature |
| Parry | fenêtre ~150 ms | 0 encaissé | défense experte, riposte +35% |

*Les dégâts réels appliquent puissance du personnage, réduction de combo et bonus CONTRE/Riposte.*

## Boucles de rétention

| Boucle | Durée cible | Récompense |
|---|---:|---|
| Match rapide Bot/2J | 2–4 min | score, grade S→D, Hall of Fame |
| Histoire Chapitre 1 | 8–15 min | GODSON PRIME |
| Arcade | 10–20 min | titre de champion, succès |
| Survie | 3–15 min | record de vague, score cumulé |
| Carrière | long terme | grades Débutant → Légende Godson |

## Règles d’équilibrage de Nadia

- Un SUPER ne doit pas décider seul d’un round contre un joueur en garde correcte.
- Les projectiles multiples ont des dégâts unitaires réduits et restent soumis à la réduction de combo.
- Toute attaque au sol doit avoir une réponse claire : sauter, dasher, bloquer ou parer.
- Le bot Difficile doit punir les habitudes, mais garder une part d’erreur lisible.
- Les changements d’équilibrage se font par petits pas et sont notés au changelog.

## Prochains chantiers design validés

1. Chapitre 2 : rival récurrent et choix de dialogue simples.
2. Défis : objectifs courts mesurables (combo, parry, vague de Survie).
3. 6e personnage : profil “zoner technique” distinct de Nova, à prototyper sur données avant dessin.

---
✍️ Design officiel — Studio Gideon - Godson ARENA.
