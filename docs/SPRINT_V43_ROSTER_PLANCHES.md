# 🥋 SPRINT V4.3 — « Roster complet des planches »

**Correction du propriétaire (24/10/2026)** : « Tu n'as pas intégré tous les personnages
qui étaient sur les planches. » — Exact : la V3.6 n'en avait traduit que 3 sur 35.
Ce sprint intègre **les 32 manquants**. Roster : **41 combattants jouables**.

## Méthode (équipe au complet)

1. **Audit planche par planche** (Marco) : relecture des 3 images — 7 + 16 + 12 = 35
   designs nommés. L'ancien `docs/CONCEPTS_PERSONNAGES.md` décrivait d'autres archétypes :
   il a été **réécrit** avec l'inventaire exact, y compris les homonymes des planches
   (Nyx ×2, Lyra ×2, Zara ×2) gardés fidèlement avec identifiants distincts.
2. **Traduction procédurale** (Marco/Kenzo) : chaque personnage reçoit palette relevée sur
   sa planche (peau verte de Krak, bleutée de Drakesh, cheveux bleus de Nyx, roses de
   Selene, turquoise de Sera, scaphandre de Zep, couronne d'Astrid…), une **morphologie
   dédiée** (41 profils : colosses à 29 d'épaules, elfes fines, robots…) et une famille
   visuelle du moteur (armure, cape, chapeau, visière, bandages, tresses…).
3. **Gameplay** (Nadia) : stats propres dans les bornes du studio (PV 92–126, vitesse
   0,78–1,23…) et **spécial/EX/super par famille d'archétype** — flèches en éventail des
   archers, lames perçantes des épéistes, ondes sismiques des brutes, orbes chercheuses
   des mages/prêtresses, plasma des techs/robots, vagues royales des nobles, foudre pure
   de Kairos/Orion. Signatures VFX assorties. Arcade et Survie puisent dans tout le
   roster ; Krak, Brax et Brutus rejoignent le pool des boss.
4. **UX** (Lena) : grille de sélection **dense et élargie** (41 cartes/camp lisibles au
   pouce en paysage, titres masqués en très basse hauteur).
5. **QA** (Sarah) : suite portée à l'échelle 41 — chaque nouveau combattant prouvé en
   spécial, super, EX et rendu complet ; contrôle permanent **n°25** ; les indices 0–8
   sont intacts (Histoire, sauvegardes, replays, Online préservés).

## Preuves

- Smoke : **317 assertions source / 553 vérifications affichées**, suite verte.
- Captures relues : planche-contact des 40 portraits de sélection (+ Prime verrouillé)
  et duel Krak vs Astrid à Libreville.
- Bundle **374 Ko / 384 Ko**, gate QA 25 contrôles.

## Honnêteté du studio

Les planches sont des concepts 3D détaillés ; leur traduction reste procédurale (même
squelette animé pour tous, familles de tenues partagées). L'identité de chacun passe par
la palette, la morphologie, la coiffure/couvre-chef de sa famille, ses stats et ses
projectiles. Des tenues encore plus fidèles (capuches, robes longues, fourrures) sont un
chantier visuel candidat pour la passe Graphismes AAA II (V4.4).

*Signé Gideon - Godson — © 2026. Manager & Développeur principal : Assistant Arena.*
