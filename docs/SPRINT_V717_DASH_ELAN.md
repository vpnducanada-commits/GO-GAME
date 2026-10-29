# Sprint V7.17 — Dash & Élan

**Équipe** : Marco (direction personnages), Kenzo (rendu), Sarah (QA),
Manager & développeur principal. **Contexte** : l'équipe entière reste
sur le mouvement (directive du propriétaire). Après les réactions au
recul et les réceptions à vitesse nulle (V7.16), l'audit a porté sur
les déplacements à haute énergie jamais mesurés : **dash avant et
arrière**, **réception de saut avec vitesse horizontale** et **coup de
pied en élan** (dash-in).

## 1. Diagnostic (lois moteur reproduites image par image)

Dash : profil `dynamic` (13 images, 12,9 px/image, mélange 0,7).
Réception en course : chute à vx = 5 px/image, poursuite en course.
Kick en élan : vx résiduel 8 px/image amorti par `attackSlide` (0,22).

| Mesure (avant) | Valeur | Verdict |
|---|---|---|
| Dash avant (1,911 m) — frottement pied avant | **1,877 m** en contact ≥ 0,8 | glissement sur glace intégral |
| Dash arrière — frottement pied avant | **2,565 m** | pire : aller-retour de semelle |
| Réception en course — pied arrière | **0,369 m**, pic **169 mm/image** | le pied « saute » quand la foulée reprend |
| Kick en élan (translation 0,298 m) — appui | **0,298 m** | l'ancre V7.15 cédait sur toute la translation |

Trois causes distinctes : le dash mélait des cibles de pieds fixes au
glissement du corps sans aucun pas ; la phase de foulée, qui continue
d'avancer pendant la réception, repartait désynchronisée des pieds
réels (série image par image : sauts de 167 puis 146 mm aux deux
premières images de reprise) ; et la garde de portée de l'ancre
d'appui transformait tout élan en glissement continu.

## 2. Correctifs (rendu uniquement)

### Le dash devient une foulée d'attaque (`src/render3d.js`)
- Le régime d'appuis plantés V7.16 s'ouvre au dash au sol : posture
  cible en **fente élargie** dans le sens du dash, pas rapides de
  5 images avec arc de 10 cm, déclenchement anticipé (seuil hanche
  1,02 m). Le dash se lit désormais poussée plantée → pas de
  réception → récupération.
- Quand un appui planté est **arraché** par le corps (cession de
  portée), la cheville se relève réellement et le contact annoncé
  retombe en proportion : la semelle quitte le sol au lieu de racler.

### Réception en course sans rupture (`src/render.js` + `src/render3d.js`)
- Le régime planté se maintient jusqu'à 22 images après l'impact,
  même si le joueur court déjà : l'atterrissage se termine en pas.
- **Recalage de la phase de foulée** : tant que le régime est actif,
  la phase est figée sur la valeur correspondant aux pieds en
  posture (pied de tête en début d'appui). À la reprise, la foulée
  repart du bon pied dans tous les sens — fin des sauts de 169 mm,
  en sortie de réception comme en fin de dash.

### Micro-pas d'élan du pied d'appui (`src/render3d.js`)
- Pendant kick/sweep, si l'élan éloigne l'ancre de plus de 15 cm de
  la posture (ou tend la jambe au-delà de 1,05 m), le pied d'appui se
  **replante en un micro-pas de 4 images** (arc 4,5 cm, contact
  relâché pendant le pas) puis se ré-ancre — le « step-in » d'un vrai
  coup de pied en avançant. À racine fixe, les seuils ne sont jamais
  atteints : le comportement V7.15 est strictement conservé.
- Repli 2D : pieds davantage levés pendant le dash.

## 3. Résultats mesurés (même harnais, après)

| Mesure | Avant | Après |
|---|---|---|
| Dash avant — frottement (contact ≥ 0,5) | 1,81 / 1,88 m | **0,19 / 0,18 m** |
| Dash arrière — frottement (contact ≥ 0,5) | 2,24 / 2,57 m | **0,16 / 0,16 m** |
| Réception en course — pied arrière (≥ 0,8) | 0,369 m, pic 169 mm | **0,122 m**, pic **53 mm** |
| Réception en course — amorti du bassin | 0,85 m | 0,85 m (conservé) |
| Kick en élan — trajet du pied d'appui | 0,298 m | **0,120 m** (2 micro-pas levés de 4 cm) |
| Erreur d'os (`boneError`) | ~0 | **~0** |

Validation navigateur (WebGL actif, zéro erreur de page) : dash figé
en plein pas (contacts annoncés 0,16 = phase de vol), kick en élan
avec micro-pas d'appui accompli (appui re-planté, contact 1), réception
en course au creux de l'amorti (dip 0,77, bassin 0,88 m) ; captures
`elan-*.png` relues par l'équipe.

## 4. Garde-fous

- Rendu uniquement : simulation déterministe, hitboxes, dégâts, IA,
  M1, replays et lockstep inchangés. Le smoke historique V7.13→V7.16
  (course, attaques, demi-tour, recul, réception, arrêt) reste vert :
  le recalage de phase n'agit que pendant le régime planté.
- 5 nouvelles assertions smoke (544 au total) ; contrôle QA statique
  n°50.
- Budget bundle porté à 751 Kio (bundle V7.17 : 768 623 octets, soit
  750 Kio) — arbitrage déjà acté : le mouvement prime.
