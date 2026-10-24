# 🗂️ SPRINT V3.3 — « Flux d'écrans & Chargement »

**Retour du propriétaire** : « C'est saturé parce qu'il n'y a que 2 écrans et
aucun chargement. Lorsqu'on ouvre le jeu il doit avoir un écran de charge
(rapide), on arrive au 1er écran le menu, on sélectionne les options, après
y'a un 2e écran on sélectionne les personnages, ensuite un autre écran on
sélectionne l'arène, puis la difficulté. Améliore aussi l'affichage. »

**Décision d'équipe (Manager + Nadia + Kenzo + Sarah)** : refonte de la
navigation uniquement — moteur, physique, déterminisme, replays et protocole
Online strictement inchangés. Le lancement d'un match réutilise le même code
(`launchFromFlow` = ancien handler de `btnLaunchFight`).

## Le nouveau parcours

```
Ouverture → ⏳ CHARGEMENT (~1,2 s) → 🏠 MENU
  → 1 · PERSONNAGES (#menuSelect : rosters + techniques repliées)
  → 2 · ARÈNE       (#menuArena  : cartes d'arène + Arena Moods)
  → 3 · DIFFICULTÉ  (#menuBot    : mode Versus Bot uniquement)
  → VS → COMBAT
```

- **Chargement** (`#bootLoader`, `startBoot`/`finishBoot`) : barre + %,
  étapes libellées, astuces rotatives, fondu de sortie, skip au clic/clavier,
  filet de sécurité à 4,2 s — jamais bloqué. Le menu reste monté en dessous,
  donc aucun délai fonctionnel.
- **Indicateur d'étapes** `.flowSteps` sur les 3 écrans ; l'étape 3 s'intitule
  « Difficulté » contre le bot, « Combat » sinon (`syncFlowUI`).
- **Difficulté en dernier** : `flowDifficultyChosen` / `pendingLaunch`
  routent le bouton de l'écran Arène vers `#menuBot` puis lancent le match
  dès le choix. Réinitialisés par `goMenu()` et par le bouton Versus Bot.
  Depuis l'écran de fin (« Changer de combattant »), la difficulté déjà
  choisie est conservée — pas d'étape redondante.
- **Arène imposée** (Histoire/Survie) : cartes désactivées comme avant,
  badge explicatif `#arenaImposed`, ambiance toujours libre.
- **Retours en chaîne** : Difficulté → Arène → Personnages → Menu.
- `menuArena` ajouté à `MENUS` et mappé sur l'état `select` dans `showOnly`,
  comme l'écran Personnages.

## Affichage (Kenzo)

- Transition `screenIn` (fondu + léger glissement, 220 ms) sur tous les
  écrans superposés.
- Avatars personnages 46 → 54 px, grille aérée ; cartes d'arène
  158×74 → jusqu'à 212×110 sur leur écran dédié.
- Difficultés en 3 grandes cartes verticales avec icône et description.

## Validation (Sarah)

- **234 assertions source / 263 vérifications affichées**, suite verte :
  chargement présent/terminé, étapes visibles, parcours 2 joueurs et bot
  traversés écran par écran jusqu'au combat réel — et toutes les anciennes
  traversées (Histoire, Arcade, Survie, replays, Online simulé) restent
  compatibles avec le nouveau routage.
- Gate QA : contrôle permanent n°17 « Chargement & parcours d'écrans V3.3 ».

## Prochain cap
Sprint 09 « Compétition locale » — voir `docs/ROADMAP.md`.
