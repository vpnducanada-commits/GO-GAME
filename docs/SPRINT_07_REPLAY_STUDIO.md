# 🚀 SPRINT 07 — V2.7 « Replay Studio & Victoires »

**Manager** : Assistant Arena  
**Product Owner** : Gideon - Godson  
**Équipe** : Nadia (Game Design), Kenzo (Interface/Rendu), Sarah (QA/Performance/Release)

## Objectif du sprint

Transformer le replay unique de la V2.6 en **petit studio personnel** : conserver plusieurs grands matchs, protéger ses favoris, les renommer et relancer n’importe lequel d’entre eux — tout en donnant davantage de personnalité aux victoires.

## Tableau du sprint

| ID | Livrable | Responsable | Critère d’acceptation | Statut |
|---|---|---|---|---|
| S07-01 | Bibliothèque locale de replays | Manager | Jusqu’à 8 replays en rotation normale, favoris protégés, migration du replay V2.6 | ✅ |
| S07-02 | Écran Bibliothèque | Kenzo | Cartes lisibles avec titre, mode, durée, vainqueur, date, arène et hash | ✅ |
| S07-03 | Actions sur les replays | Kenzo + Manager | Lire, renommer, mettre en favori et supprimer un replay choisi | ✅ |
| S07-04 | Lignes de victoire | Nadia | Une phrase signature pour les 6 combattants, affichée en fin de match et après replay vérifié | ✅ |
| S07-05 | Sécurité stockage & preuves | Sarah | Ancien replay sélectionné relu et vérifié ; profil inchangé ; migration et rotation testées | ✅ |
| S07-06 | Release V2.7 | Manager + Sarah | Definition of Done complète, bundle, tag `v2.7.0` | ✅ Livré en `v2.7.0` |

## Décisions du Manager

- La bibliothèque conserve **8 replays en rotation normale** ; les favoris échappent au nettoyage automatique, avec un plafond absolu de sécurité à 12 et un budget de stockage d’environ 1,8 Mo.
- Le replay V2.6 déjà présent sur l’appareil est **migré automatiquement**, sans perte.
- Aucun mode en ligne dans ce sprint : il reste réservé à une éventuelle V3 après validation explicite du Product Owner.

## Suite envisagée après ce sprint

1. **Sprint 08 — Arena Moods** : variantes Jour/Crépuscule/Nuit, VFX de personnage renforcés et finition tactile (Kenzo).
2. **Sprint 09 — Compétition locale** : tournoi local, défi tournant et équilibrage fondé sur les données de combat (Nadia).
3. **V3.0 — Connecté, uniquement si le PO le valide** : comptes, classement mondial et duels en ligne avec backend dédié.

---
✍️ Sprint piloté par le Manager officiel du Studio Gideon - Godson ARENA.
