# Sprint V3.6 — « Nouveaux Champions » (24 octobre 2026)

**Déclencheur :** le propriétaire dépose 3 planches de personnages (≈ 33 designs 3D stylisés).
**Mandat :** décider avec l'équipe, revenir uniquement si l'action du propriétaire est indispensable.

## Décision d'équipe (Manager + Nadia + Kenzo + Sarah)

1. **Traduire, ne pas coller.** Les planches sont de la 3D stylisée ; les découper en portraits bitmap
   créerait un contraste violent avec les combattants procéduraux animés à 60 fps. Les designs deviennent
   donc des combattants natifs du moteur (squelette Humanité++, expressions, IK), et les planches vivent
   comme **art conceptuel officiel** (`assets/concepts/`, `docs/CONCEPTS_PERSONNAGES.md`).
2. **Trois champions, trois identités de gameplay** (pas des recolors) :
   - **KAEL, le Guerrier d'Acier** — 112 PV, allonge maximale, lame perforante, EX double lame,
     SUPER Croisade d'Acier (3 lames).
   - **Sora, la Magicienne des Arcanes** — gravité réduite (elle flotte), énergie ×1,4, orbe chercheuse,
     EX triple orbe, SUPER Comète Pourpre (3 météores).
   - **AEL-7, l'Unité Synthétique** — vitesse 1,18, double tir plasma, EX rafale ×4,
     SUPER Canon Orbital (projectile lourd perforant).
3. **Ajout en fin de roster (indices 6-8)** : Histoire, sauvegardes, replays et netcode intacts.
   Présence en Arcade + Survie (Kael possible boss de vague).

## Rendu (Kenzo)

- Morphologies dédiées (guerrier cuirassé / magicienne gracieuse / androïde athlétique).
- Sora : chapeau pointu à gemme et ruban, cheveux longs argentés avec inertie, cape violette.
- Kael : cape rouge, épaulettes acier clair (palette éclaircie après relecture visuelle — il lisait
  « Ninja sombre » en première passe).
- AEL-7 : casque lisse blanc, **visière cyan** dont la fente lumineuse suit le regard, bouche à segments
  de niveau sonore, capteur frontal.
- Signatures VFX : lames (Kael), runes tournantes (Sora), circuits (AEL-7).

## Validation (Sarah)

- Suite : **263 assertions source / 307 vérifications affichées**, 2 passages verts.
  Spéciaux/EX/supers des 9 combattants mesurés ; équilibrage borné ; signatures distinctes.
- Captures natives relues avant release : line-up des 3 champions + duel Kael vs AEL-7 sur Libreville.
- Gate QA : contrôle permanent n°20 ; bundle 327 Ko (budget documenté 352 Ko).
- Déterminisme/replays/Online : inchangés par construction (ajout additif en fin de roster).

## Suite

Réserve de concepts pour une V3.7+ « Deuxième vague » : Muscle, Pirate, Karatéka, Elfe, Chapeau —
chacun avec identité de gameplay propre. Prochain cap contenu : Sprint 09 « Compétition locale ».
