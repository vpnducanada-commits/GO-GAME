# 👊 Sprint V5.1 — « Godson FURY — M1 Signature »

**Date** : 24/10/2026 • **Propriétaire** : Gideon - Godson  
**Équipe** : Manager & développeur principal • Nadia (Design) • Kenzo (Rendu) • Sarah (QA) • Marco (personnages) • Lena (UX)

## 🎯 Directives du propriétaire

1. **Trouver un autre nom** pour le jeu.
2. **Travailler individuellement chaque personnage.**
3. Mettre des **M1 spécifiques pour chacun**.
4. Les joueurs doivent faire des combos **juste en appuyant de manière répétée sur les boutons**.

## 🏷️ Nouveau nom officiel

Le jeu devient **Godson FURY ARENA — L’Arène des Légendes**.

- Plus court, plus international et plus « grande licence » que l’ancien titre.
- La signature **Gédéon - Godson** reste dans les crédits, les documents et l’univers Godson.
- Bundle officiel : `Godson-FURY-Arena-V5.1-PRO.html`.
- L’adresse GitHub Pages, les profils, les sauvegardes et le backend ne changent pas.

## 👊 Le système M1 Signature

Au sol, **chaque nouvel appui sur POING** avance d’un maillon dans la chaîne propre au combattant.
La chaîne mélange les vraies animations du moteur : 👊 poing, 🦵 pied, ⬆️ uppercut et ⬇️ balayage.

- **Tampon d’entrée M1 : 18 frames** — un martelage humain normal est accepté, sans timing d’horloger.
- **Tracking avant** pendant le démarrage de chaque coup : le combattant recolle à sa cible au lieu de frapper dans le vide.
- **Recul intermédiaire réduit** et **hitstun de liaison** : une fois le premier coup placé, marteler produit un **vrai combo** reconnu par le compteur.
- Les coups durs intermédiaires ne font plus décoller la cible : l’atterrissage ne peut plus casser la chaîne avant le final.
- **Final propre** à chaque signature : `launch` (projection en l’air), `down` (mise au sol) ou `burst` (expulsion puissante).
- Une technique manuelle (Pied, Spécial, projection, dash...) remplace proprement la chaîne en cours.
- Le **bot** poursuit sa propre chaîne M1 après un impact confirmé, selon sa difficulté.
- Les replays antérieurs à V5.1 relisent l’ancien poing générique ; ils ne sont pas réinterprétés.

Chaque ligne de `M1_RAW` est écrite pour un combattant précis : nom de chaîne, effet visuel,
tempo, bonus de portée, puissance propre, final et nom de chaque coup. La normalisation
transforme ces choix d’auteur en frame data complète (dégâts, durée, portée, avance, hitstun, recul).

## 📋 Les 41 M1 Signature

| Combattant | M1 Signature | Coups | Chaîne (martèle POING) | Final |
|---|---|---:|---|---|
| GÉDÉON | **Foudre du Champion** | 4 | 👊 Jab Fulgurant → 👊 Direct du Champion → 🦵 Fouet du Stade → ⬆️ Jugement Ascendant | launch |
| Kira | **Danse de la Foudre** | 5 | 👊 Griffe Éclair → 👊 Double Crochet → 🦵 Talon Foudre → 👊 Rafale Kira → ⬇️ Balayage Tempête | down |
| TITAN | **Marteau de la Montagne** | 3 | 👊 Poing Sismique → 🦵 Botte de Fer → ⬆️ Éruption Titan | launch |
| NOVA | **Pulsar Arcanique** | 4 | 👊 Étincelle Nova → 👊 Rayon Court → 🦵 Talon Orbital → 👊 Cœur Pulsar | burst |
| GODSON PRIME | **Jugement Royal** | 5 | 👊 Sceptre Droit → 🦵 Botte Royale → 👊 Main du Trône → ⬆️ Ascension Prime → 🦵 Chute Royale | down |
| Zara | **Marée de Libreville** | 4 | 👊 Vague Courte → 🦵 Lame de Marée → ⬇️ Ressac Bas → 🦵 Raz-de-Marée | burst |
| KAEL | **Croisade d’Acier** | 4 | 👊 Estoc d’Acier → 👊 Taille d’Honneur → 🦵 Botte Blindée → ⬆️ Levée du Serment | launch |
| SORA | **Rune Tourbillonnante** | 4 | 👊 Sceau Arcanique → 👊 Glyphe Frappeur → ⬆️ Comète Montante → 🦵 Chute Pourpre | down |
| AEL-7 | **Protocole Sept** | 5 | 👊 Percuteur 01 → 👊 Double Servo → 👊 Servo Croisé → 🦵 Propulseur AEL → ⬆️ Éjection Orbitale | launch |
| Lira | **Route Sauvage** | 4 | 👊 Couteau de Route → 🦵 Pas de Piste → 👊 Crochet d’Exploratrice → ⬇️ Chute du Canyon | down |
| Zed | **Traque Silencieuse** | 4 | 👊 Flèche Courte → 👊 Crochet du Traqueur → 🦵 Botte de Piste → 🦵 Coup Fatal | burst |
| Nyx | **Surcharge Atelier** | 4 | 👊 Clé Dynamique → 👊 Impulsion Tech → 🦵 Talon Magnétique → 👊 Décharge Atelier | burst |
| VORAK | **Berserk Sauvage** | 3 | 👊 Griffe Sauvage → 🦵 Botte Bestiale → 👊 Fracas Vorak | down |
| AERIN | **Vent des Cimes** | 5 | 👊 Flèche Vive → 👊 Double Rameau → 🦵 Talon des Cimes → 👊 Feuille Frappeuse → 🦵 Rafale Verte | burst |
| KORBEN | **Maintenance Orbitale** | 4 | 👊 Marteau de Bord → 🦵 Botte à Propulsion → 👊 Visseuse Korben → ⬆️ Lancement Orbital | launch |
| Lyra | **Aurore Sacrée** | 4 | 👊 Main Solaire → 👊 Halo Frappeur → 🦵 Talon de Lumière → ⬆️ Lever d’Aurore | launch |
| Drakesh | **Contrat du Chasseur** | 4 | 👊 Crosse Rapide → 🦵 Botte de Prime → 👊 Tir à Bout Portant → 🦵 Exécution du Contrat | burst |
| SELENE | **Abordage Stellaire** | 5 | 👊 Sabre Court → 👊 Double Entaille → ⬇️ Crochet de Pirate → 🦵 Botte d’Abordage → 👊 Trésor Perdu | burst |
| Taiko | **Méditation de l’Ombre** | 4 | 👊 Paume Silencieuse → ⬆️ Ombre Montante → 👊 Frappe du Lotus → ⬇️ Chute de Lune | down |
| Vex | **Hydraulique Maximale** | 3 | 👊 Piston Vex → 🦵 Botte Hydraulique → ⬆️ Soulèvement Cyber | launch |
| ELARA | **Songe Éveillé** | 4 | 👊 Toucher Onirique → 👊 Miroir de Rêve → ⬆️ Lune Montante → 👊 Réveil Brutal | burst |
| Brax | **Éboulement Vivant** | 3 | 👊 Poing de Granit → ⬇️ Ravine Basse → 🦵 Avalanche Brax | down |
| Kazu | **Voie du Vent** | 4 | 👊 Iai Court → 👊 Coupe du Vent → 🦵 Talon du Samouraï → ⬆️ Montée du Dragon | launch |
| Sera | **Intrusion Express** | 5 | 👊 Ping Frappeur → 👊 Double Paquet → 👊 Cheval de Troie → 🦵 Botte Root → ⬇️ Crash Système | down |
| VORGA | **Sables Déchus** | 4 | 👊 Griffe du Désert → ⬇️ Dune Basse → 👊 Main Déchue → 🦵 Tempête de Sable | burst |
| Nox | **Étreinte Sylvestre** | 4 | 👊 Rameau Frappeur → 🦵 Botte Racine → ⬆️ Cime Montante → 👊 Cœur de Forêt | burst |
| Raven | **Visée Parfaite** | 4 | 👊 Crosse Tactique → 👊 Double Point → 🦵 Talon de Tireuse → ⬆️ Détente Verticale | launch |
| Zep | **Pression Abyssale** | 4 | 👊 Harpon Court → 🦵 Botte Ballast → 👊 Crochet des Abysses → ⬇️ Vague de Fond | down |
| ASTRID | **Trône Déchu** | 5 | 👊 Lame Noble → 👊 Seconde Lame → 🦵 Botte d’Argent → ⬆️ Couronne Montante → 🦵 Sentence Royale | down |
| SÉLÉNIA | **Bénédiction des Rôdeurs** | 4 | 👊 Flèche de Ronce → 👊 Double Rôdeuse → 🦵 Talon Sacré → 👊 Flèche Finale | burst |
| Drakar | **Hiver du Clan** | 3 | 👊 Hache Courte → 🦵 Botte de Givre → ⬇️ Balayage du Nord | down |
| Nyx | **Sentence des Ombres** | 5 | 👊 Dague Furtive → 👊 Seconde Dague → ⬇️ Ombre Basse → 👊 Point Vital → ⬆️ Sentence de l’Ordre | launch |
| Kairos | **Orage Temporel** | 4 | 👊 Éclair Retardé → ⬆️ Orbe Montant → 👊 Seconde Frappe → 🦵 Foudre Finale | burst |
| Zara | **Protocole Colonie** | 5 | 👊 Riveteuse Nova → 👊 Double Outil → 🦵 Botte Antigrav → 👊 Clé Orbitale → ⬆️ Éjection Nova | launch |
| BRUTUS | **Marteau de la Légion** | 3 | 👊 Poing Blindé → 🦵 Botte de Légion → 👊 Marteau de Fer | down |
| Aria | **Chœur Céleste** | 4 | 👊 Note de Lumière → 👊 Accord Sacré → ⬆️ Hymne Ascendant → 🦵 Chœur Final | down |
| Krak | **Fureur des Marais** | 3 | 👊 Griffe du Marais → ⬇️ Boue Basse → ⬆️ Krak Soulève | launch |
| Luna | **Exploration Lunaire** | 4 | 👊 Sonde Courte → 👊 Bras d’Exploration → 🦵 Botte Lunaire → 👊 Signal Lunaire | burst |
| Velen | **Contrat Rempli** | 5 | 👊 Lame du Syndicat → ⬇️ Coupe Basse → 👊 Frappe Discrète → 🦵 Talon du Tueur → ⬆️ Exécution Velen | launch |
| Lyra | **Chevauchée Dragonaile** | 5 | 👊 Griffe d’Azur → 🦵 Botte Écaille → 👊 Souffle Court → ⬆️ Aile Montante → 🦵 Chute du Dragon | down |
| ORION | **Théorie Appliquée** | 4 | 👊 Calcul Frappeur → 👊 Hypothèse Orion → 🦵 Botte Expérimentale → ⬆️ Conclusion Verticale | launch |

## 🎨 Présentation (Kenzo/Lena)

- Les traînées M1 gagnent une seconde ligne décalée et **s’intensifient à chaque maillon** ; l’extension des membres augmente légèrement jusqu’au final.
- Le final qui touche affiche **« M1 SIGNATURE — <nom de la chaîne> »**.
- L’arsenal de sélection détaille la chaîne complète du combattant choisi ; aperçus et écran VS affichent son nom et son nombre de coups.
- La recherche du roster accepte le nom d’un M1 ou d’un de ses coups.
- Aide et tactile mis à jour : **POING • M1**.

## ✅ Validation (Sarah)

- Données : **41/41** signatures, **41** noms de chaînes uniques, **168** coups nommés uniques, longueurs 3 à 5.
- Simulation réelle : pour chaque combattant, martelage de `KeyF` contre TITAN ; exigence
  `m1Hits ≥ longueur`, `m1Finishers ≥ 1` et `maxCombo ≥ longueur`. **Résultat : 41/41.**
- Suite complète : **357 assertions / 592 vérifications vertes**.
- Gate QA : contrôle permanent **n°28** (nouveau nom + intégrité des 41 M1).
- Capture relue : final « Jugement Ascendant » de Gideon, combo 4, mention
  « M1 SIGNATURE — FOUDRE DU CHAMPION ».
- Bundle autonome : **418 Ko** (budget 448 Ko).

## 🔭 Suite

Le sprint **Graphismes AAA II** initialement prévu en V5.1 devient **V5.2** : ombres portées
directionnelles, impacts en sprites et tenues encore plus fidèles aux planches.

✍️ **Godson FURY ARENA V5.1**, signé **Gideon - Godson**.
