# 🧍 SPRINT V3.1 — « Humanité++ »

**Demande du propriétaire** : « Je veux que les personnages soient plus humains. »
**Décision d'équipe (Manager + Nadia + Kenzo + Sarah)** : refonte **strictement visuelle** (render-only)
des combattants. Aucune hitbox, aucune constante de physique, aucun input et aucun octet du
protocole Online ne changent — les replays déterministes, le Replay Studio et le lockstep
GO GAME restent valides à l'identique.

## Ce qui a été livré

### Anatomie (Kenzo)
- **Proportions adultes stylisées** : tête réduite (rayon 16,5 → 17,8 px), cou et trapèzes,
  épaules, hanches et mâchoires propres à chaque combattant.
- **6 morphologies** déclarées dans `HUMAN_PROFILES` (résolution insensible à la casse via
  `HUMAN_PROFILE_LOOKUP`) : athlète équilibré (Gideon), sprinteuse agile (Kira), colosse
  puissant (Titan), stratège élancée (Nova), champion royal (GODSON Prime), vague athlétique (Zara).
- **Membres volumiques** : segments effilés et ombrés (`taperedSegment`), genoux/coudes résolus
  par cinématique inverse à deux segments (`solveJoint`, longueurs constantes, cible clampée),
  poings gantés orientés (`drawFist`) et chaussures articulées (`drawShoe`).
- **Buste complet** : cage thoracique, taille, bassin, ceinture articulée avec boucle,
  deltoïdes, clavicule, ombre latérale et plis de tissu qui suivent l'inertie.
- Reflets au sol et traînées de dash redessinés avec la même silhouette humaine.

### Visage & vie (Kenzo + Nadia)
- **Visage de trois-quarts procédural** (`drawHumanHead`) : front, pommette, nez/narine,
  oreille, œil en amande, sclérotique, iris/pupille mobiles, reflet, cils signatures,
  sourcil tendu selon l'état, bouche expressive, barbe légère selon profil, sueur de fatigue.
- **Expressions** : `focus`, `effort`, `garde`, `douleur`, `fatigue`, `victoire`, `KO`
  (exposées dans `renderStats.lastFacialExpression`).
- **Regard vivant** : les yeux suivent l'adversaire (même passé derrière), la tête accuse un
  retard d'inertie sur le buste (`headLag`), chevelures signatures et vêtements balancent
  avec la vitesse (`hairSway`/`clothSway`), bassin et épaules contre-tournent en marche
  (`pelvisRoll`/`shoulderRoll`), et la **fatigue** (vie basse) amplifie la respiration et
  affaisse les épaules.
- Lettres d'emblème et de bandeau **contre-miroitées** : lisibles face à gauche comme à droite.

### Garanties (Manager)
- Le rendu ne lit que l'état de simulation ; il n'écrit ni position, ni vie, ni vitesse
  (vérifié par test d'invariance pendant `drawFighter`).
- Budget 60 Hz inchangé : dégradés mis en cache, aucune allocation structurelle nouvelle
  par frame hors objets de pose déjà existants.

## Validation (Sarah)
- **211 assertions source / 240 vérifications affichées**, suite complète verte (3 passages),
  incluant une section V3.1 dédiée : 6 signatures morphologiques distinctes, tête bornée
  16–18 px, IK aux longueurs exactes (±1,5 px) et sans NaN hors de portée, regard des deux
  côtés, inertie, fatigue > 60 % à vie basse, 3 expressions faciales, rendu complet des
  6 combattants et invariance physique.
- **Contrôle visuel réel** : captures générées hors-navigateur (canvas natif) — lineup des
  6 morphologies et combat Gideon vs Zara à Libreville — relues par Kenzo ; 3 polissages
  appliqués (boucle de ceinture, épaulettes Titan/Prime, lettres contre-miroitées).
- Gate `tools/qa-check.py` : contrôle permanent n°15 « Humanité++ V3.1 présente ».

## Bug réel attrapé par les tests
Les identifiants moteur `kira` et `Zara` ne correspondaient pas aux clés de profils
(`Kira`/`Zara`) : les deux combattantes héritaient de la morphologie de Gideon.
La résolution est désormais normalisée des deux côtés (clés minuscules + lookup
insensible à la casse) et verrouillée par le test des 6 signatures distinctes.

## Prochain cap
Sprint 09 « Compétition locale » (tournoi local en tableau, défi tournant) — voir `docs/ROADMAP.md`.
Rappel non bloquant : tester un duel WebRTC réel entre deux appareils/réseaux avant tout
tournoi public, et réinitialiser le mot de passe temporaire de la base Supabase dans le dashboard.
