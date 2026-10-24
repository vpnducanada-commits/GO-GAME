# 🧭 SPRINT V4.4 — « Navigation Pro & Tenues de combat »

**Retour du propriétaire (24/10/2026)** : « Le mode de navigation et d'affichage n'est pas
encore top ; les personnages évoluent, mais on est encore loin de quitter le mini-jeu
pour le jeu professionnel. »

## Diagnostic de l'équipe

Avec 41 combattants, l'écran de sélection était devenu le point faible n°1 : deux longues
grilles à faire défiler avec tout l'écran, bouton d'étape tout en bas, aucun moyen de
chercher un personnage précis. Côté personnages, le torse — déjà en dégradé — restait un
volume nu, sans vêtement lisible. Ce sprint traite ces deux fronts, sans toucher au
gameplay.

## Réalisé

### Navigation & affichage (Lena)
- **Recherche instantanée** par nom et titre (`#rosterSearch`) : taper « Krak » ne laisse
  qu'une carte ; les deux camps sont filtrés ensemble.
- **Filtres par famille** avec compteur en direct : Tous / ⚡ Rapides (vitesse ≥ 1,12) /
  🛡️ Colosses (PV ≥ 112) / 🔮 Énergie (gain ≥ 1,3) / 🤖 Tech (synthétiques + ingénieurs)
  / ⚔️ Lames (guerriers & kunoichi).
- **Barres d'action fixes** (`position:sticky`) sur les écrans Personnages et Arène :
  l'action principale reste sous le pouce en permanence.
- **Défilement interne des grilles** : les rosters défilent dans leur panneau
  (54 dvh, 42 dvh en paysage bas) ; aperçus et en-têtes ne bougent plus.
- **Clavier intelligent** : haut/bas suivent le nombre réel de colonnes de la grille,
  sautent les cartes filtrées/verrouillées et ramènent la carte active à l'écran.

### Personnages (Marco/Kenzo)
- **Tenues de combat peintes** dans la passe tenue de `drawFighter` : ouverture du
  vêtement sur le devant (liseré ombré de l'épaule à la hanche), col aux couleurs
  d'accent, deux plis de tissu ombrés qui suivent la taille, reflet dorsal. Les 41
  combattants en bénéficient, compteur QA `renderStats.torsoPaint`.

## Preuves
- Smoke : **327 assertions source / 561 vérifications affichées**, suite verte — section
  V4.4 : recherche « Krak » = 1 visible, Colosses = 8, Énergie ≥ 3, Tous = 41, compteur
  synchronisé, 2 barres fixes, tenues peintes sur les deux combattants d'un duel.
- Gate QA : contrôle permanent **n°26** ; bundle **379 Ko / 384 Ko**.
- Capture relue : duel Kael vs Krak à Libreville (col et ouverture visibles sur l'armure
  de Kael, plis sur la tenue de Krak).

## Prochaine marche vers le « jeu professionnel » (V4.5 Graphismes AAA II)
Ombres portées directionnelles selon la lumière de l'arène, impacts en sprites
pré-rendus, et tenues signature plus fidèles aux planches (capuches des assassins,
robes des prêtresses, fourrures nordiques) — puis la compétition locale (V4.6) qui
donnera au roster de 41 sa raison d'être sportive.

*Signé Gideon - Godson — © 2026. Manager & Développeur principal : Assistant Arena.*
