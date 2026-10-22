/* Test d’exécution automatisé — GÉDÉON - Godson ARENA V2 PRO
   Usage : NODE_PATH=/tmp/smoke/node_modules node tests/smoke-test.js
   (nécessite le paquet jsdom) */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const root = path.join(__dirname, '..');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html.replace('<script src="src/engine.js"></script>', () => '<script>' + fs.readFileSync(path.join(root, 'src/engine.js'), 'utf8') + '</script>');
html = html.replace('<script src="src/render.js"></script>', () => '<script>' + fs.readFileSync(path.join(root, 'src/render.js'), 'utf8') + '</script>');
html = html.replace('<script src="src/ui.js"></script>', () => '<script>' + fs.readFileSync(path.join(root, 'src/ui.js'), 'utf8') + '</script>');
html = html.replace('<link rel="stylesheet" href="src/style.css">', '');

const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => { if (!/Could not load|getContext|canvas/i.test(e.message)) errors.push('jsdomError: ' + e.message); });
vc.on('error', m => errors.push('console.error: ' + m));

const dom = new JSDOM(html, {
  url: 'http://localhost/',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
  virtualConsole: vc
});
const { window } = dom;

/* Faux contexte canvas 2D (jsdom n’en fournit pas) */
function fakeGradient() { return { addColorStop() {} }; }
const baseCtx = {
  canvas: null,
  measureText: () => ({ width: 120 }),
  createLinearGradient: fakeGradient,
  createRadialGradient: fakeGradient
};
window.HTMLCanvasElement.prototype.getContext = function () {
  if (this.__ctx) return this.__ctx;
  const target = { ...baseCtx, canvas: this };
  const proxy = new Proxy(target, {
    get(t, prop) {
      if (prop in t) return t[prop];
      return () => {};
    },
    set(t, prop, value) { t[prop] = value; return true; }
  });
  this.__ctx = proxy;
  return proxy;
};
window.addEventListener('error', e => errors.push('window.error: ' + e.message));

const vmCtx = dom.getInternalVMContext();
function runScript(file) {
  const code = fs.readFileSync(path.join(root, file), 'utf8');
  try { vm.runInContext(code, vmCtx, { filename: file }); console.log('Chargé :', file); }
  catch (e) { errors.push(file + ' -> ' + e.stack.split('\n')[0]); }
}
['src/engine.js', 'src/render.js', 'src/ui.js'].forEach(runScript);

const ev = expr => vm.runInContext(expr, vmCtx);
const assert = (cond, msg) => { console.log((cond ? '  ✅ ' : '  ❌ ') + msg); if (!cond) errors.push('ASSERT: ' + msg); };
const click = id => window.document.getElementById(id).click();
function step(n) { for (let i = 0; i < n; i++) { ev('updateGameLogic()'); ev('prepareInterpolation(1)'); ev('updateCamera(16)'); ev('render()'); ev('updateHUD()'); } }
function press(code, frames) { ev(`keys.add(${JSON.stringify(code)})`); step(frames || 2); ev(`keys.delete(${JSON.stringify(code)})`); }
function winCurrentMatch(maxSteps) {
  let guard = 0;
  while (ev('state') !== 'matchEnd' && guard < (maxSteps || 2600)) {
    if (ev('state') === 'fight') {
      ev('p2.health=Math.min(p2.health,3); p1.x=760; p2.x=850; p1.y=p2.y=GROUND; p1.vy=p2.vy=0; p1.attackT=0; p1.attack=null; p1.hitStun=0; p1.blockStun=0; p1.downT=0; p2.hitStun=0; p2.blockStun=0; p2.downT=0; p2.blocking=false; p2.crouching=false; p2.invulnT=0; p2.dashT=0; p2.attackT=0;');
      press('KeyF', 2); step(18); guard += 20;
    } else { step(25); guard += 25; }
  }
}

try {
  console.log('\n— Démarrage / menu —');
  assert(ev('state') === 'menu', 'état initial = menu');
  assert(!window.document.getElementById('menuMain').classList.contains('hidden'), 'menu principal visible');
  assert(window.document.querySelectorAll('#rosterP1 .charCard').length >= 4, 'roster personnages généré');

  console.log('\n— Mode 2 joueurs : sélection → VS → combat —');
  click('btnMode2P');
  assert(ev('state') === 'select', 'écran de sélection');
  click('btnLaunchFight');
  assert(ev('state') === 'vs', 'écran VS');
  ev('skipVS()');
  assert(ev('state') === 'intro', 'intro du round');
  step(160);
  assert(ev('state') === 'fight', 'combat commencé');

  console.log('\n— Déplacement, dash, coup de poing, combo, spécial —');
  press('KeyD', 20);
  assert(ev('p1.x') > 395, 'P1 se déplace vers la droite (x=' + Math.round(ev('p1.x')) + ')');
  press('ShiftLeft', 3); step(14);
  ev('p1.x=740; p2.x=845; p1.y=p2.y=GROUND; p1.vx=p2.vx=0;');
  const hpBefore = ev('p2.health');
  press('KeyF', 2); step(12); press('KeyG', 2); step(25);
  assert(ev('p2.health') < hpBefore, 'poing/pied infligent des dégâts (' + hpBefore + ' -> ' + ev('p2.health') + ')');
  ev('p1.energy=100; p1.x=500; p2.x=850; p1.attackT=0; p1.hitStun=0;');
  const hp2 = ev('p2.health');
  press('KeyH', 2); step(60);
  assert(ev('p2.health') < hp2, 'SUPER attaque (projectile) touche (' + hp2 + ' -> ' + ev('p2.health') + ')');
  press('KeyW', 3); assert(ev('p1.y') < 600 || ev('p1.vy') < 0, 'saut fonctionnel'); step(45);

  console.log('\n— K.O. et enchaînement des rounds —');
  ev('p2.health=3; p1.x=760; p2.x=850; p1.y=p2.y=GROUND; p1.attackT=0; p1.hitStun=0; p2.hitStun=0; p2.downT=0; p2.blocking=false;');
  press('KeyF', 2); step(20);
  assert(ev('state') === 'roundEnd', 'K.O. -> fin de round (état=' + ev('state') + ')');
  step(260);
  assert(['intro', 'fight'].includes(ev('state')), 'round suivant lancé (état=' + ev('state') + ', round=' + ev('round') + ')');

  console.log('\n— Retour menu + Versus Bot difficile (600 frames) —');
  ev('goMenu()'); click('btnModeBot');
  window.document.querySelector('#menuBot [data-diff="difficile"]').click();
  click('btnLaunchFight'); ev('skipVS()'); step(160);
  assert(ev('state') === 'fight', 'combat vs bot difficile');
  const codes = ['KeyD', 'KeyA', 'KeyF', 'KeyG', 'KeyW', 'KeyS', 'ShiftLeft', 'KeyH'];
  for (let i = 0; i < 12; i++) { press(codes[i % codes.length], 4); step(32); }
  assert(ev('p1.health') >= 0 && ev('p2.health') >= 0, 'vies cohérentes après simulation bot (P1=' + ev('Math.round(p1.health)') + ', BOT=' + ev('Math.round(p2.health)') + ')');
  assert(ev('p2.stats.attacks') > 0, 'le bot attaque (' + ev('p2.stats.attacks') + ' attaques)');

  console.log('\n— Entraînement et Arcade —');
  ev('goMenu()'); click('btnModeTraining'); click('btnLaunchFight'); ev('skipVS()'); step(10);
  assert(ev('state') === 'training', 'mode entraînement actif');
  ev('goMenu()'); click('btnModeArcade'); click('btnLaunchFight'); ev('skipVS()'); step(160);
  assert(ev('state') === 'fight' && ev('arcade.stage') === 1, 'arcade étage 1 en combat');

  console.log('\n— V2.1 : personnage secret verrouillé —');
  ev('goMenu()'); click('btnMode2P');
  const lockedCard = window.document.querySelector('#rosterP1 .charCard.locked');
  assert(!!lockedCard, 'GODSON PRIME verrouillé au départ');
  if (lockedCard) lockedCard.click();
  assert(ev('selCharP1') === 0, 'clic sur carte verrouillée refusé');

  console.log('\n— V2.1 : Mode Histoire complet (3 combats) —');
  ev('goMenu()'); click('btnModeStory');
  assert(ev('state') === 'select' && ev('story.step') === 1, 'Histoire : sélection au combat 1/3');
  click('btnLaunchFight');
  assert(ev('state') === 'scene', 'scène scénarisée affichée avant le combat 1');
  click('btnStoryContinue'); ev('skipVS()'); step(170);
  assert(ev('state') === 'fight' && ev('p2.char.id') === 'kira' && ev('currentArena.id') === 'stadium', 'combat 1 : Kira au Stade');
  winCurrentMatch();
  assert(ev('state') === 'matchEnd' && ev('PROFILE.story.progressStep') === 2, 'progression Histoire sauvegardée (combat 2)');
  assert(ev('PROFILE.leaderboard.length') >= 1, 'score enregistré au Hall of Fame');
  click('btnNextStage');
  assert(ev('state') === 'scene' && ev('story.step') === 2, 'scène du combat 2');
  click('btnStoryContinue'); ev('skipVS()'); step(170);
  assert(ev('p2.char.id') === 'nova' && ev('currentArena.id') === 'temple', 'combat 2 : Nova au Temple');
  winCurrentMatch();
  click('btnNextStage');
  assert(ev('state') === 'scene' && ev('story.step') === 3, 'scène du boss final');
  click('btnStoryContinue'); ev('skipVS()'); step(170);
  assert(ev('p2.char.id') === 'titan' && ev('currentArena.id') === 'tokyo' && ev('botDiff') === 'difficile', 'boss final : TITAN difficile à Tokyo');
  winCurrentMatch();
  assert(ev('PROFILE.story.completed') === true && ev('PROFILE.unlocks.prime') === true, 'Chapitre 1 terminé -> GODSON PRIME débloqué');
  click('btnNextStage');
  assert(ev('state') === 'scene' && ev('storyPhase') === 'ending', 'scène de fin affichée');
  click('btnStoryContinue');
  assert(ev('state') === 'menu', 'retour au menu après la fin');
  click('btnMode2P');
  assert(!window.document.querySelector('#rosterP1 .charCard.locked'), 'plus aucune carte verrouillée');
  window.document.querySelectorAll('#rosterP1 .charCard')[4].click();
  assert(ev('selCharP1') === 4, 'GODSON PRIME sélectionnable');
  ev('applyCharacterTo(p1,4); p1.reset(); projectiles=[]; p1.attackType="super"; spawnProjectile(p1);');
  assert(ev('projectiles.length') === 3, 'SUPER de GODSON PRIME = 3 projectiles');
  ev('goMenu()'); click('btnHall');
  assert(window.document.getElementById('hallList').innerHTML.includes('hallTable'), 'Hall of Fame affiche le classement');
  assert(ev('PROFILE.leaderboard.length') >= 3, 'au moins 3 scores au classement (' + ev('PROFILE.leaderboard.length') + ')');
  ev('goMenu()');

  console.log('\n— Pause, réglages, personnalisation, arènes —');
  click('btnMode2P'); click('btnLaunchFight'); ev('skipVS()'); step(170);
  assert(ev('state') === 'fight', 'combat relancé pour tester la pause');
  ev('togglePause()'); assert(ev('state') === 'pause', 'pause');
  ev('togglePause()'); assert(ev('state') === 'fight', 'reprise');
  ev('goMenu()'); click('btnSettings');
  window.document.getElementById('setQuality').value = 'low';
  window.document.getElementById('setQuality').dispatchEvent(new window.Event('change'));
  assert(ev('qualityLevel') === 0, 'qualité basse appliquée');
  click('btnSettingsDone');
  click('btnCustomize');
  const nameInput = window.document.getElementById('custNameP1');
  nameInput.value = 'Champion GG'; nameInput.dispatchEvent(new window.Event('input'));
  click('btnCustDone');
  assert(ev('PROFILE.names.p1') === 'Champion GG', 'nom personnalisé sauvegardé');
  for (const id of ['stadium', 'tokyo', 'temple']) { ev(`setArenaById(${JSON.stringify(id)})`); ev('render()'); }
  assert(ev('currentArena.id') === 'temple', 'les 3 arènes se rendent sans erreur');
  for (let i = 0; i < 5; i++) { ev(`applyCharacterTo(p1,${i}); p1.reset(); render();`); }
  assert(true, 'les 5 personnages se rendent sans erreur');

} catch (e) {
  errors.push('EXCEPTION TEST: ' + e.stack);
}

console.log('\n================ RÉSULTAT ================');
if (errors.length) { console.log('❌ ' + errors.length + ' problème(s) :'); errors.forEach(e => console.log(' - ' + String(e).slice(0, 500))); process.exit(1); }
console.log('✅ TOUS LES TESTS PASSENT — aucune erreur d’exécution.');
process.exit(0);
