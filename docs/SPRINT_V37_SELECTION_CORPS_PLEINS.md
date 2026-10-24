# Sprint V3.7 — « Sélection & Corps pleins » (24 octobre 2026)

**Déclencheur :** retour direct du propriétaire — améliorer la navigation à l'écran de sélection,
montrer un aperçu nommé de chaque personnage avec des bordures à effets, et abandonner les silhouettes
« bâtonnets » au profit de corps complets inspirés des planches : bras, jambes, tête et torse visibles.

## Décisions d'équipe (Manager + Kenzo + Nadia + Sarah)

1. **Les aperçus utilisent le vrai moteur de rendu.** Chaque carte dessine en miniature le combattant
   réel (respiration, clignements, cape, chapeau, visière) au lieu d'une image fixe : ce que l'on choisit
   est exactement ce qui entre dans l'arène. Les images 3D des planches restent la référence de style,
   mais des images fixes ne peuvent ni frapper ni être animées proprement à 60 fps.
2. **Bordures = identité.** Chaque carte reçoit la couleur primaire et l'accent du personnage
   (`--cc` / `--ca`) : bordure épaisse, halo, reflet balayant au survol et pulsation si sélectionnée.
3. **Navigation d'abord.** Les statistiques quittent les petites cartes et rejoignent le grand aperçu
   (nom, titre, SUPER, barres) : la grille devient une galerie de combattants lisible d'un coup d'œil.
   Les flèches du clavier naviguent dans la grille du Joueur 1.
4. **Corps pleins, physique intacte.** L'épaississement des membres et du torse est strictement visuel :
   hitboxes, équilibrage, déterminisme, replays et netcode ne changent pas d'un bit.

## Réalisation (Kenzo, rendu & interface)

- Portraits : mini-combattants mis en cache par personnage/camp, dessinés par rotation
  (≈ 10 images/s par carte) pour préserver la fluidité ; grands aperçus à pleine fréquence.
  Le contexte canvas principal est échangé le temps du dessin puis toujours restauré
  (`ctx` passe en `let`, échange protégé par try/finally).
- Corps pleins : cuisses 20,2 × morphologie, mollets articulés avec revers de pantalon,
  bras 16,4 × morphologie, avant-bras et gants épaissis, épaules/hanches élargies,
  chaussures agrandies, présence visuelle globale +4 %. Les morphologies légères
  (Kira 0,95 ; Sora 0,96) restent distinctes des masses (Kael 1,16 ; Titan 1,28).

## Validation (Sarah)

- Suite : **277 assertions source / 321 vérifications affichées**, 2 passages verts.
  Portraits comptés en réel (`renderStats.portraits`), bordures comparées aux couleurs
  effectives, aperçu synchronisé après clic, navigation par `ArrowRight` simulée.
- Captures natives relues : grille 3×3 des cartes (portraits + bordures + noms),
  grand aperçu Sora, line-up de combat sur Libreville.
- Gate QA : contrôle permanent n°21 ; bundle autonome 336 Ko (budget 352 Ko conservé).

## Suite

Poursuivre l'enrichissement visuel des tenues par personnage (motifs d'armure, tissus)
et la V3.8 candidate « Deuxième vague » des planches (Muscle, Pirate, Karatéka…),
puis Sprint 09 « Compétition locale ».
