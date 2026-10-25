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
html = html.replace('<script src="src/render3d.js"></script>', () => '<script>' + fs.readFileSync(path.join(root, 'src/render3d.js'), 'utf8') + '</script>');
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
window.TextEncoder = TextEncoder; window.TextDecoder = TextDecoder; /* API navigateur absente du contexte jsdom */

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
['src/engine.js', 'src/render.js', 'src/render3d.js', 'src/ui.js'].forEach(runScript);

const ev = expr => vm.runInContext(expr, vmCtx);
let v3AsyncWork = null;
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
function holdCodes(codes, frames) { codes.forEach(c => ev(`keys.add(${JSON.stringify(c)})`)); step(frames); codes.forEach(c => ev(`keys.delete(${JSON.stringify(c)})`)); }
function loseCurrentMatch(maxSteps) {
  let guard = 0;
  while (ev('state') !== 'matchEnd' && guard < (maxSteps || 2600)) {
    if (ev('state') === 'fight') {
      ev('p1.health=Math.min(p1.health,2); p1.x=760; p2.x=850; p1.y=p2.y=GROUND; p2.facing=-1; p1.blocking=false; p1.crouching=false; p1.invulnT=0; p1.dashT=0; p1.parryT=0; p1.downT=0; applyDamage(p2,p1,ATTACKS.punch,"punch");');
      step(20); guard += 20;
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

  console.log('\n— V2.4 : Saga Histoire complète (Chapitres 1 & 2, 6 combats) —');
  ev('goMenu()'); click('btnModeStory');
  assert(ev('state') === 'select' && ev('story.step') === 1 && ev('story.total') === 6, 'Histoire : sélection au combat 1/6');
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
  assert(ev('state') === 'scene' && ev('story.step') === 3, 'scène du boss du Chapitre 1');
  click('btnStoryContinue'); ev('skipVS()'); step(170);
  assert(ev('p2.char.id') === 'titan' && ev('currentArena.id') === 'tokyo' && ev('botDiff') === 'difficile', 'boss du Chapitre 1 : TITAN difficile à Tokyo');
  winCurrentMatch();
  assert(ev('PROFILE.story.chapter1Completed') === true && ev('PROFILE.story.progressStep') === 4 && ev('PROFILE.unlocks.prime') === true, 'Chapitre 1 terminé -> GODSON PRIME débloqué, Chapitre 2 prêt');
  click('btnNextStage');
  assert(ev('state') === 'scene' && ev('storyPhase') === 'chapter1Ending', 'scène de fin du Chapitre 1 affichée');
  click('btnStoryContinue');
  assert(ev('state') === 'scene' && ev('story.step') === 4, 'Chapitre 2 : scène du combat 4');
  click('btnStoryContinue'); ev('skipVS()'); step(170);
  assert(ev('p2.char.id') === 'Zara' && ev('currentArena.id') === 'Libreville', 'combat 4 : Zara sur la Plage de Libreville');
  winCurrentMatch();
  assert(ev('PROFILE.story.progressStep') === 5, 'progression du Chapitre 2 sauvegardée (combat 5)');
  click('btnNextStage');
  assert(ev('state') === 'scene' && ev('story.step') === 5, 'scène du combat 5');
  click('btnStoryContinue'); ev('skipVS()'); step(170);
  assert(ev('p2.char.id') === 'nova' && ev('botDiff') === 'difficile' && ev('currentArena.id') === 'tokyo', 'combat 5 : Nova Déchaînée difficile à Tokyo');
  winCurrentMatch();
  click('btnNextStage');
  assert(ev('state') === 'scene' && ev('story.step') === 6, 'scène du boss ultime');
  click('btnStoryContinue'); ev('skipVS()'); step(170);
  assert(ev('p2.char.id') === 'godson-prime' && ev('currentArena.id') === 'Libreville', 'combat final : GODSON PRIME à Libreville');
  winCurrentMatch();
  assert(ev('PROFILE.story.chapter2Completed') === true && ev('PROFILE.unlocks.librevilleSkin') === true, 'Chapitre 2 terminé -> tenue de Libreville débloquée');
  click('btnNextStage');
  assert(ev('state') === 'scene' && ev('storyPhase') === 'ending', 'scène de fin de la saga affichée');
  click('btnStoryContinue');
  assert(ev('state') === 'menu', 'retour au menu après la fin de la saga');
  click('btnMode2P');
  assert(!window.document.querySelector('#rosterP1 .charCard.locked'), 'plus aucune carte verrouillée');
  window.document.querySelectorAll('#rosterP1 .charCard')[4].click();
  assert(ev('selCharP1') === 4, 'GODSON PRIME sélectionnable');
  ev('applyCharacterTo(p1,4); p1.reset(); projectiles=[]; p1.attackType="super"; spawnProjectile(p1);');
  assert(ev('projectiles.length') === 3, 'SUPER de GODSON PRIME = 3 projectiles');
  window.document.querySelectorAll('#rosterP1 .charCard')[5].click();
  assert(ev('selCharP1') === 5 && ev('CHARACTERS[5].id') === 'Zara', 'Zara sélectionnable immédiatement');
  ev('goMenu()'); click('btnHall');
  assert(window.document.getElementById('hallList').innerHTML.includes('hallTable'), 'Hall of Fame affiche le classement');
  assert(ev('PROFILE.leaderboard.length') >= 3, 'au moins 3 scores au classement (' + ev('PROFILE.leaderboard.length') + ')');
  ev('goMenu()');

  console.log('\n— V2.2 : supers uniques par personnage —');
  ev('goMenu()');
  const sig = (char, type) => ev(`applyCharacterTo(p1,${char}); p1.reset(); p1.x=420; p2.x=880; projectiles=[]; p1.attackType=${JSON.stringify(type)}; spawnProjectile(p1); projectiles.length + ":" + projectiles.map(p=>p.kind).join(",") + ":" + projectiles.some(p=>p.pierce)`);
  assert(sig(0, 'special') === '1:bolt:false', 'Gideon spécial : éclair rapide');
  assert(sig(0, 'super') === '1:judgment:true', 'Gideon SUPER : vague perforante');
  assert(sig(1, 'special').startsWith('3:blade,blade,blade'), 'Kira spécial : rafale de 3 lames');
  assert(sig(1, 'super').startsWith('5:blade,blade,blade,blade,blade'), 'Kira SUPER : tempête de 5 lames');
  assert(sig(2, 'special') === '1:ground:false' && ev('projectiles[0].y') > 560, 'TITAN spécial : onde sismique au sol');
  assert(sig(3, 'special') === '1:orb:false' && ev('projectiles[0].homing') > 0, 'Nova spécial : orbe chercheuse');
  assert(sig(3, 'super').startsWith('4:meteor,meteor,meteor,meteor'), 'Nova SUPER : pluie de 4 météores');
  assert(sig(4, 'special').startsWith('2:royal,royal'), 'GODSON PRIME spécial : double vague royale');
  assert(sig(5, 'special').startsWith('2:blade,blade'), 'Zara spécial : deux Lames de Marée');
  assert(sig(5, 'super') === '1:wave:false' && ev('projectiles[0].r') === 40, 'Zara SUPER : raz-de-marée géant au sol');

  console.log('\n— V2.2 : parry parfaite + riposte —');
  click('btnMode2P'); click('btnLaunchFight'); ev('skipVS()'); step(170);
  ev('p1.x=760; p2.x=850; p1.y=p2.y=GROUND; p1.vy=p2.vy=0; p1.attackT=0; p1.attack=null; p2.attackT=0; p2.attack=null; p1.hitStun=p2.hitStun=0; p1.blockStun=p2.blockStun=0; p1.downT=p2.downT=0; p2.parryT=0;');
  const hpP2BeforeParry = ev('p2.health'), hpP1BeforeRiposte = ev('p1.health');
  holdCodes(['ArrowDown', 'KeyF'], 9);
  assert(ev('p2.stats.parries') === 1, 'parry réussie comptabilisée');
  assert(ev('p2.health') === hpP2BeforeParry, 'parry = zéro dégât encaissé');
  assert(ev('p2.counterWindowT') > 0, 'fenêtre de riposte ouverte');
  press('KeyK', 2); step(14);
  assert(ev('p1.health') <= hpP1BeforeRiposte - 6, 'riposte renforcée (+35%) appliquée au premier coup M1 (' + hpP1BeforeRiposte + ' -> ' + ev('p1.health') + ')');
  ev('p1.x=700; p2.x=790; p1.y=p2.y=GROUND; p1.facing=1; p2.facing=-1; p1.grounded=true; p1.blocking=true; p1.parryT=8; p1.hitStun=0; p1.blockStun=0; p2.attackT=0; p2.attack=null; applyDamage(p2,p1,ATTACKS.punch,"punch");');
  assert(ev('PROFILE.stats.bestParriesMatch') >= 1 && ev('p1.stats.parries') >= 1, 'parry du Joueur 1 comptée dans les défis de carrière');

  console.log('\n— V2.2 : mode Survie (vagues, soin, score) —');
  ev('goMenu()'); click('btnModeSurvival');
  assert(ev('state') === 'select' && ev('survival.wave') === 1 && !!ev('survival.next'), 'Survie : sélection vague 1 générée');
  const firstWaveChar = ev('survival.next.char');
  click('btnLaunchFight'); ev('skipVS()'); step(170);
  assert(ev('state') === 'fight' && ev('mode') === 'survival' && ev('p2.charIndex') === firstWaveChar && ev('roundsToWin()') === 1, 'vague 1 en combat (1 round)');
  ev('p1.health=45');
  winCurrentMatch();
  assert(ev('state') === 'matchEnd' && ev('survival.score') > 0 && ev('PROFILE.stats.bestSurvivalWave') >= 1, 'vague 1 terminée : score et record enregistrés');
  const carry = ev('survival.carryHealth');
  assert(carry > 45, 'soin +35% préparé entre vagues (' + carry + ' PV)');
  click('btnNextStage'); ev('skipVS()'); step(170);
  assert(ev('survival.wave') === 2 && ev('state') === 'fight' && ev('p1.health') === carry, 'vague 2 lancée avec la vie soignée conservée');
  loseCurrentMatch();
  assert(ev('state') === 'matchEnd' && ev('survival.recorded') === true && ev('PROFILE.leaderboard.some(e=>String(e.mode).includes("Survie"))'), 'défaite : run enregistrée au Hall of Fame');
  click('btnRematch');
  assert(ev('state') === 'vs' && ev('survival.wave') === 1 && ev('survival.score') === 0, 'nouvelle run relancée à la vague 1');
  ev('goMenu()');

  console.log('\n— Pause, réglages, personnalisation, arènes —');
  click('btnMode2P'); click('btnLaunchFight'); ev('skipVS()'); step(170);
  assert(ev('state') === 'fight', 'combat relancé pour tester la pause');
  ev('togglePause()'); assert(ev('state') === 'pause', 'pause');
  ev('togglePause()'); assert(ev('state') === 'fight', 'reprise');
  // Régression Sarah : un impact de projectile qui termine le round ne doit pas casser l’itération des projectiles restants.
  ev('applyCharacterTo(p1,1); p1.reset(); p1.x=740; p1.facing=1; p2.x=800; p1.y=p2.y=GROUND; p2.health=1; p2.hitStun=0; p2.blockStun=0; p2.downT=0; p2.invulnT=0; p2.dashT=0; p1.attackType="special"; projectiles=[]; spawnProjectile(p1); updateProjectiles();');
  assert(ev('state') === 'roundEnd' && ev('projectiles.length') === 0, 'régression : fin de round pendant updateProjectiles sans crash');
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
  for (const id of ['stadium', 'tokyo', 'temple', 'Libreville']) { ev(`setArenaById(${JSON.stringify(id)})`); ev('render()'); }
  assert(ev('currentArena.id') === 'Libreville' && ev('ARENAS.length') === 4, 'les 4 arènes se rendent sans erreur, dont Libreville');
  for (let i = 0; i < 41; i++) { ev(`applyCharacterTo(p1,${i}); p1.reset(); render();`); }
  assert(ev('CHARACTERS.length') === 41, 'les 41 personnages se rendent sans erreur');
  ev('applyCharacterTo(p1,5); p1.reset(); p1.x=300; p1.facing=1; p2.x=1000; p1.y=p2.y=GROUND; projectiles=[]; p1.attackType="super"; spawnProjectile(p1); updateProjectiles();');
  assert(ev('projectiles[0].kind') === 'wave' && ev('projectiles[0].y') === 572, 'physique Zara : la vague reste au ras du sol');

  // ===== V2.3 — Pipeline de rendu Kenzo + QA Sarah =====
  ev('qualityLevel=2; resizeCanvas(); render()');
  assert(ev('JSON.stringify(renderStats.passesRun)') === JSON.stringify(['background','floor','shadows','entities','projectiles','effects','post']), 'pipeline : les 7 passes s’exécutent dans l’ordre');
  assert(ev('RENDER_PIPELINE.length') === 7, 'pipeline : 7 passes déclarées');
  assert(ev('typeof cachedLinearGradient') === 'function' && ev('typeof drawPostProcess') === 'function' && ev('typeof runRenderPass') === 'function', 'API pipeline V2.3 disponible');
  const before = ev('renderStats.frame');
  ev('render(); render(); render()');
  assert(ev('renderStats.frame') === before + 3, 'pipeline : compteur de frames (+3)');
  assert(ev('cachedLinearGradient("t:1",0,0,10,10,[[0,"#fff"],[1,"#000"]])===cachedLinearGradient("t:1",0,0,10,10,[[0,"#fff"],[1,"#000"]])'), 'cache dégradés : même instance réutilisée');
  const alloc = ev('renderStats.gradientMisses');
  ev('cachedLinearGradient("t:1",0,0,10,10,[[0,"#fff"],[1,"#000"]]); cachedLinearGradient("t:1",0,0,10,10,[[0,"#fff"],[1,"#000"]])');
  assert(ev('renderStats.gradientMisses') === alloc, 'cache dégradés : aucune allocation sur hit');
  ev('qualityLevel=2; render()'); assert(String(ev('renderStats.lastPost')).endsWith(':q2'), 'post-traitement : trace qualité haute');
  ev('qualityLevel=0; render()'); assert(String(ev('renderStats.lastPost')).endsWith(':q0'), 'post-traitement : contourné en qualité basse mais tracé');
  assert(ev('Object.keys(FLOOR_THEMES).length') === 4 && !!ev('FLOOR_THEMES.Libreville'), 'thèmes de sol : 4 arènes couvertes');
  assert(ev('typeof drawLibreville') === 'function' && ev('ARENAS.some(a=>a.id==="Libreville")'), 'arène Plage de Libreville disponible');
  ev('qualityLevel=2; resizeCanvas();');

  console.log('\n— V2.4 : Défis & récompense de Libreville —');
  ev('goMenu()'); click('btnChallenges');
  assert(ev('CHALLENGE_DEFS.length') === 6 && window.document.querySelectorAll('.challengeCard').length === 6, 'écran Défis : 6 cartes affichées');
  assert(window.document.getElementById('challengeList').innerHTML.includes('Saga Godson'), 'défi du Chapitre 2 présent');
  assert(ev('challengeState(CHALLENGE_DEFS.find(d=>d.id==="storych2")).done') === true, 'défi Saga Godson terminé après la saga');
  assert(ev('PROFILE.stats.bestParriesMatch') >= 1, 'record de parry par match sauvegardé');
  click('btnChallengesBack'); click('btnCustomize');
  assert(window.document.getElementById('btnSunsetPreset').disabled === false, 'tenue de Libreville débloquée dans la Personnalisation');
  click('btnSunsetPreset');
  assert(ev('PROFILE.customColors.p1.primary') === '#00acc1' && ev('PROFILE.customColors.p1.accent') === '#ff7043', 'tenue Coucher de soleil appliquée au Joueur 1');
  click('btnCustReset');

  console.log('\n— V2.5 : animation humaine & arènes vivantes —');
  assert(ev('typeof fighterMotion') === 'function' && ev('typeof smoothMotionValue') === 'function' && ev('typeof attackMotionCurve') === 'function', 'moteur d’animation V2.5 disponible');
  assert(ev('smoothMotionValue(0,10,12)') > 0 && ev('smoothMotionValue(0,10,12)') < 10, 'lissage : approche progressive sans saut instantané');
  assert(ev('attackMotionCurve(1,5,20)') < 0 && ev('attackMotionCurve(8,5,20)') > .75 && ev('attackMotionCurve(20,5,20)') < .05, 'attaque : anticipation → impact → récupération');
  ev('qualityLevel=2; renderDtFactor=1; p1.motion=null; p1.facing=1; p1.grounded=true; p1.vx=6; p1.kvx=0; render();');
  assert(ev('!!p1.motion') && ev('p1.motion.face') > 0 && ev('renderStats.motionSamples') > 0, 'état corporel initialisé et échantillonné');
  ev('p1.facing=-1; render()');
  assert(ev('p1.motion.face') > -1, 'retournement corporel progressif, pas de flip instantané');
  ev('for(let i=0;i<14;i++)render();');
  assert(ev('p1.motion.face') < 0 && ev('p1.motion.run') > .45, 'retournement terminé en douceur + course détectée');
  ev('p1.facing=1; p1.vx=0;');
  assert(ev('cachedTextWidth("Gideon","1000 11px Arial")') === ev('cachedTextWidth("Gideon","1000 11px Arial")') && ev('renderStats.textCacheSize') > 0, 'cache des mesures de texte actif');
  const walkerX = ev('setArenaById("Libreville"); render(); ambientWalkers[0].x');
  ev('for(let i=0;i<8;i++)render();');
  assert(ev('ambientWalkers.length') === 18 && ev('ambientWalkers[0].x') !== walkerX, 'passants : positions réellement mobiles entre frames');
  for (const id of ['stadium', 'tokyo', 'temple', 'Libreville']) { ev(`setArenaById(${JSON.stringify(id)}); render();`); assert(ev('renderStats.ambientPeople') > 0, 'vie d’ambiance active dans l’arène ' + id); }
  ev('qualityLevel=0; render()');
  assert(ev('renderStats.ambientPeople') > 0 && ev('renderStats.ambientPeople') <= 5, 'qualité basse : foule réduite mais arène toujours vivante');
  ev('qualityLevel=2; resizeCanvas();');

  console.log('\n— V2.6 : replays déterministes —');
  assert(ev('typeof startReplayRecording') === 'function' && ev('typeof replayStateHash') === 'function' && ev('typeof startReplayPlayback') === 'function', 'moteur de replay disponible');
  assert(ev('encodeReplayInput({left:false,right:true,jump:false,block:false,punch:true,kick:false,special:false,dash:true})') === 146 && ev('decodeReplayInput(146,replayInputP1).right') === true && ev('replayInputP1.punch') === true && ev('replayInputP1.dash') === true, 'encodage/décodage des entrées en masque 8 bits');

  /* Vrai match joué UNIQUEMENT par les entrées : aucune santé ni position
     n’est forcée ici, sinon la preuve de déterminisme ne vaudrait rien. */
  ev('goMenu(); SETTINGS.roundsWin=1; SETTINGS.roundTime=99; selCharP1=0; selCharP2=1; selArenaId="stadium"; saveSelection();');
  click('btnMode2P'); click('btnLaunchFight'); ev('skipVS()');
  assert(ev('replayRecorder.active') === true, 'enregistrement du match démarré');
  ev(`(() => { let guard=0; while(state!=="matchEnd"&&guard++<7000){ keys.clear(); if(state==="fight"){ const dx=p2.x-p1.x; if(dx>92)keys.add("KeyD"); else if(dx<-92)keys.add("KeyA"); else if(simFrame%22<2)keys.add("KeyF"); } updateGameLogic(); } keys.clear(); return guard; })()`);
  step(2);
  assert(ev('state') === 'matchEnd' && ev('p1.roundWins') === 1, 'match de référence terminé par les seules entrées');
  assert(ev('!!lastReplayData') && ev('lastReplayData.duration') > 500 && ev('lastReplayData.events.length') > 10 && ev('lastReplayData.events.length') < ev('lastReplayData.duration'), 'replay enregistré et compacté en événements de changement');
  assert(ev('loadLastReplay().finalHash') === ev('lastReplayData.finalHash'), 'replay persisté dans le stockage local');
  assert(window.document.getElementById('btnWatchReplay').disabled === false && window.document.getElementById('replayInfo').textContent.includes(' vs Kira '), 'replay proposé sur l’écran de fin et au menu');

  const profileBeforeReplay = ev('JSON.stringify({stats:PROFILE.stats,story:PROFILE.story,unlocks:PROFILE.unlocks,ach:PROFILE.ach,leaderboard:PROFILE.leaderboard})');
  ev('SETTINGS.roundTime=60; SETTINGS.roundsWin=3;');
  click('btnWatchReplay');
  assert(ev('replayPlayback.active') === true && window.document.getElementById('replayBar').classList.contains('show'), 'lecteur de replay affiché');
  assert(ev('SETTINGS.roundTime') === 99 && ev('SETTINGS.roundsWin') === 1, 'le replay réutilise les règles du match original');
  step(90);
  click('btnReplayPlay');
  assert(ev('replayPlayback.paused') === true, 'pause du replay');
  click('btnReplayPlay');
  const speedSelect = window.document.getElementById('replaySpeed');
  speedSelect.value = '4'; speedSelect.dispatchEvent(new window.Event('change'));
  assert(ev('replayPlayback.speed') === 4 && ev('replayPlayback.paused') === false, 'reprise et vitesse 4× du replay');
  click('btnReplayRestart');
  assert(ev('replayPlayback.active') === true && ev('replayPlayback.framesElapsed') === 0, 'redémarrage du replay depuis le début');
  ev(`(() => { let guard=0; while(replayPlayback.active&&guard++<9000)updateGameLogic(); return guard; })()`);
  assert(ev('replayPlayback.ended') === true && ev('replayPlayback.verified') === true, 'relecture complète vérifiée par hash d’état');
  assert(ev('lastWinner===p1') && ev('p1.stats.damage') === ev('lastReplayData.result.damage[0]') && ev('p2.stats.damage') === ev('lastReplayData.result.damage[1]'), 'même vainqueur et mêmes dégâts qu’à l’original');
  click('btnReplayQuit');
  assert(ev('state') === 'menu' && !window.document.getElementById('replayBar').classList.contains('show'), 'sortie propre du replay vers le menu');
  assert(ev('SETTINGS.roundTime') === 60 && ev('SETTINGS.roundsWin') === 3, 'réglages du joueur restaurés après le replay');
  assert(ev('JSON.stringify({stats:PROFILE.stats,story:PROFILE.story,unlocks:PROFILE.unlocks,ach:PROFILE.ach,leaderboard:PROFILE.leaderboard})') === profileBeforeReplay, 'profil strictement inchangé pendant le replay');
  assert(window.document.getElementById('btnLastReplay').disabled === false, 'dernier replay toujours disponible après retour au menu');
  ev('SETTINGS.roundTime=99; SETTINGS.roundsWin=2; saveProfile();');

  console.log('\n— V2.7 : Replay Studio & lignes de victoire —');
  assert(ev('typeof loadReplayLibrary') === 'function' && ev('typeof renderReplayLibrary') === 'function' && ev('typeof renameReplayById') === 'function', 'bibliothèque de replays disponible');
  assert(ev('CHARACTERS.every(c=>c.victoryLine&&c.victoryLine.length>12)') === true, 'les 41 combattants ont une ligne de victoire signature');
  const firstStudioReplayId = ev('lastReplayData.id'), firstStudioHash = ev('lastReplayData.finalHash');
  assert(!!firstStudioReplayId && ev('replayLibrary[0].id') === firstStudioReplayId && ev('loadReplayLibrary()[0].finalHash') === firstStudioHash, 'le replay V2.6 devient le premier élément persisté de la bibliothèque');
  ev(`renameReplayById(${JSON.stringify(firstStudioReplayId)},"Finale Godson Studio"); setReplayFavorite(${JSON.stringify(firstStudioReplayId)},true);`);
  assert(ev(`findReplayById(${JSON.stringify(firstStudioReplayId)}).title`) === 'Finale Godson Studio' && ev(`findReplayById(${JSON.stringify(firstStudioReplayId)}).favorite`) === true, 'renommage et favori persistés sur un replay');

  /* Deuxième vrai match, toujours joué uniquement par entrées simulées. */
  ev('goMenu(); SETTINGS.roundsWin=1; SETTINGS.roundTime=99; selCharP1=5; selCharP2=2; selArenaId="Libreville"; saveSelection();');
  click('btnMode2P'); click('btnLaunchFight'); ev('skipVS()');
  ev(`(() => { let guard=0; while(state!=="matchEnd"&&guard++<8000){ keys.clear(); if(state==="fight"){ const dx=p2.x-p1.x; if(dx>92)keys.add("KeyD"); else if(dx<-92)keys.add("KeyA"); else if(simFrame%22<2)keys.add("KeyF"); } updateGameLogic(); } keys.clear(); return guard; })()`);
  step(2);
  const secondStudioReplayId = ev('lastReplayData.id');
  assert(ev('state') === 'matchEnd' && ev('p1.roundWins') === 1 && secondStudioReplayId !== firstStudioReplayId && ev('replayLibrary[0].id') === secondStudioReplayId, 'deuxième match ajouté en tête de bibliothèque sans écraser le favori');
  assert(window.document.getElementById('winnerQuote').textContent.includes('Libreville'), 'ligne de victoire de Zara affichée sur l’écran de fin');

  ev('goMenu()'); click('btnLastReplay');
  assert(!window.document.getElementById('menuReplays').classList.contains('hidden') && window.document.querySelectorAll('.replayCard').length >= 2 && window.document.getElementById('replayLibraryList').textContent.includes('Finale Godson Studio'), 'écran Bibliothèque : cartes et titre personnalisé visibles');
  const playOldButton = window.document.querySelector(`[data-action="play"][data-id="${firstStudioReplayId}"]`);
  assert(!!playOldButton, 'bouton Lire présent sur l’ancien replay favori');
  if (playOldButton) playOldButton.click();
  assert(ev('replayPlayback.active') === true && ev('replayPlayback.data.id') === firstStudioReplayId, 'lecture lancée sur le replay ancien sélectionné, pas seulement le dernier');
  ev(`(() => { let guard=0; while(replayPlayback.active&&guard++<9000)updateGameLogic(); return guard; })()`);
  assert(ev('replayPlayback.ended') === true && ev('replayPlayback.verified') === true && window.document.getElementById('replayStatus').textContent.includes('nom Godson'), 'ancien replay favori relu, vérifié et conclu par la ligne du vainqueur');
  click('btnReplayQuit'); click('btnLastReplay');
  window.confirm = () => true;
  const deleteSecondButton = window.document.querySelector(`[data-action="delete"][data-id="${secondStudioReplayId}"]`);
  assert(!!deleteSecondButton, 'bouton Supprimer présent dans la bibliothèque');
  if (deleteSecondButton) deleteSecondButton.click();
  assert(ev(`findReplayById(${JSON.stringify(secondStudioReplayId)})`) === null && !!ev(`findReplayById(${JSON.stringify(firstStudioReplayId)})`), 'suppression ciblée sans toucher au replay favori');

  ev(`(() => { const base=findReplayById(${JSON.stringify(firstStudioReplayId)}); for(let i=0;i<10;i++){ const c=JSON.parse(JSON.stringify(base)); c.id="test-rotation-"+i; c.title="Clone rotation "+i; c.favorite=false; c.createdAt=Date.now()+10000+i; addReplayToLibrary(c); } return replayLibrary.length; })()`);
  assert(ev('replayLibrary.length') <= ev('REPLAY_LIBRARY_MAX') && !!ev(`findReplayById(${JSON.stringify(firstStudioReplayId)})`), 'rotation automatique plafonnée et favori protégé');

  const savedLibraryRaw = window.localStorage.getItem('gideonGodsonArenaReplayLibraryV1');
  const legacyHash = ev(`(() => { const d=JSON.parse(JSON.stringify(findReplayById(${JSON.stringify(firstStudioReplayId)}))); delete d.id; delete d.title; delete d.favorite; localStorage.setItem(REPLAY_STORE_KEY,JSON.stringify(d)); localStorage.removeItem(REPLAY_LIBRARY_KEY); return d.finalHash; })()`);
  assert(ev('loadReplayLibrary().length') === 1 && ev('loadReplayLibrary()[0].finalHash') === legacyHash && !!ev('loadReplayLibrary()[0].id') && !!ev('loadReplayLibrary()[0].title'), 'migration automatique d’un replay V2.6 sans bibliothèque');
  if (savedLibraryRaw) window.localStorage.setItem('gideonGodsonArenaReplayLibraryV1', savedLibraryRaw);
  ev('reloadReplayLibrary(); SETTINGS.roundTime=99; SETTINGS.roundsWin=2; saveProfile(); goMenu();');

  console.log('\n— V2.8 : Arena Moods, VFX signatures & tactile —');
  assert(ev('Object.keys(ARENA_MOOD_THEMES).length') === 4 && ev('Object.values(ARENA_MOOD_THEMES).every(a=>a.jour&&a.crepuscule&&a.nuit)') === true && ev('typeof setArenaMood') === 'function', 'Arena Moods : 4 arènes × 3 ambiances disponibles');
  assert(ev('resolveArenaMood("stadium","auto")') === 'crepuscule' && ev('resolveArenaMood("tokyo","auto")') === 'nuit' && ev('resolveArenaMood("temple","auto")') === 'jour' && ev('resolveArenaMood("Libreville","auto")') === 'crepuscule', 'mode Auto fidèle à l’identité originale de chaque arène');

  ev('goMenu()'); click('btnMode2P');
  assert(window.document.querySelectorAll('.arenaMoodCard').length === 4, 'sélection : Auto, Jour, Crépuscule et Nuit affichés');
  const nightButton = window.document.querySelector('.arenaMoodCard[data-mood="nuit"]');
  if (nightButton) nightButton.click();
  assert(ev('selArenaMood') === 'nuit' && ev('currentArenaMood') === 'nuit' && ev('PROFILE.selection.arenaMood') === 'nuit' && window.document.getElementById('launchSummary').textContent.includes('Nuit'), 'ambiance Nuit sélectionnée, appliquée et sauvegardée');

  for (const arenaId of ['stadium', 'tokyo', 'temple', 'Libreville']) {
    for (const mood of ['jour', 'crepuscule', 'nuit']) {
      ev(`qualityLevel=2; setArenaById(${JSON.stringify(arenaId)},${JSON.stringify(mood)}); render();`);
      assert(ev('currentArena.id') === arenaId && ev('currentArenaMood') === mood && ev('renderStats.arenaMood') === mood && ev('renderStats.lastPost').startsWith(arenaId + ':' + mood + ':') && ev('renderStats.passesRun.length') === 7 && (mood === 'nuit' ? ev('renderStats.moodStars') > 0 : mood === 'jour' ? ev('renderStats.moodStars') === 0 : ev('renderStats.moodStars') >= 0), 'rendu ' + arenaId + ' / ' + mood + ' : mood, poste et 7 passes cohérents');
    }
  }

  const signatureStyles = new Set();
  for (let i = 0; i < 41; i++) {
    ev(`applyCharacterTo(p1,${i}); p1.reset(); projectiles=[{x:640,y:400,px:640,py:400,rx:640,ry:400,vx:8,vy:0,r:18,owner:p1,super:false,life:100,kind:"bolt"}]; renderStats.signatureVfx=0; qualityLevel=0; drawProjectiles();`);
    signatureStyles.add(ev('renderStats.lastSignatureVfx'));
    assert(ev('renderStats.signatureVfx') === 1, 'VFX signature actif même en qualité basse : ' + ev('CHARACTERS[' + i + '].name'));
  }
  assert(signatureStyles.size === 41, '41 signatures VFX actives (9 styles de famille, une par combattant)');
  ev('projectiles=[]; qualityLevel=2; resizeCanvas();');

  ev('clearTouchInputs(); setTouchPointer("punch",101,true); setTouchPointer("punch",102,true);');
  assert(ev('touchIn.punch') === true && ev('touchPointerState.activePointers') === 2 && window.document.querySelector('.tBtn[data-t="punch"]').classList.contains('on'), 'tactile multi-touch : deux pointeurs suivis sur le même bouton d’action');
  ev('setTouchPointer("punch",101,false);');
  assert(ev('touchIn.punch') === true && ev('touchPointerState.activePointers') === 1, 'tactile : relâcher un doigt ne coupe pas le second');
  ev('setTouchPointer("punch",102,false); setJoystickVector(1,0,103); clearTouchInputs();');
  assert(ev('touchIn.right') === false && ev('touchIn.punch') === false && ev('joystickState.active') === false && ev('touchPointerState.activePointers') === 0 && !window.document.querySelector('.tBtn[data-t="punch"]').classList.contains('on'), 'tactile : nettoyage complet anti-boutons/joystick collés');

  /* Preuve d’intégration : un vrai match en Nuit forcée doit conserver
     cette ambiance dans son replay, même si la préférence change ensuite. */
  ev('SETTINGS.roundsWin=1; SETTINGS.roundTime=99; selCharP1=0; selCharP2=1; selArenaId="stadium"; setArenaMood("nuit"); setArenaById("stadium","nuit"); saveSelection(); refreshSelect();');
  click('btnLaunchFight'); ev('skipVS()');
  assert(ev('currentArenaMood') === 'nuit' && ev('replayRecorder.active') === true, 'match Arena Moods lancé en Nuit avec enregistrement actif');
  ev(`(() => { let guard=0; while(state!=="matchEnd"&&guard++<7000){ keys.clear(); if(state==="fight"){ const dx=p2.x-p1.x; if(dx>92)keys.add("KeyD"); else if(dx<-92)keys.add("KeyA"); else if(simFrame%22<2)keys.add("KeyF"); } updateGameLogic(); } keys.clear(); return guard; })()`);
  step(2);
  assert(ev('lastReplayData.arenaMood') === 'nuit' && ev('lastReplayData.arenaMoodPreference') === 'nuit', 'ambiance Nuit capturée dans les métadonnées du replay');
  ev('setArenaMood("jour");');
  click('btnWatchReplay');
  assert(ev('replayPlayback.active') === true && ev('currentArenaMood') === 'nuit' && ev('selArenaMood') === 'jour', 'replay relu en Nuit sans écraser la préférence Jour du joueur');
  ev(`(() => { let guard=0; while(replayPlayback.active&&guard++<9000)updateGameLogic(); return guard; })()`);
  assert(ev('replayPlayback.ended') === true && ev('replayPlayback.verified') === true, 'replay Arena Moods intégralement vérifié');
  click('btnReplayQuit');
  assert(ev('currentArenaMood') === 'jour' && ev('selArenaMood') === 'jour', 'ambiance du joueur restaurée à la sortie du replay');
  ev('setArenaMood("auto"); SETTINGS.roundTime=99; SETTINGS.roundsWin=2; saveSelection(); saveProfile(); goMenu();');

  console.log('\n— V3.0 : combat pro, GO GAME Online & lockstep —');
  assert(/^[3-9]\.\d+\.\d+$/.test(ev('GAME_VERSION')) && (window.document.querySelector('h1').textContent.includes('PRO')||/V[6-9]\.\d+/.test(window.document.querySelector('h1').textContent)), 'génération V3 affichée et exposée au moteur');
  const normalizedCloudProfile = ev('normalizeProfileData({names:{p1:"Nuage Godson"},settings:{roundTime:77},customColors:{p1:{primary:"#123456",accent:"#abcdef"}}})');
  assert(normalizedCloudProfile.names.p1 === 'Nuage Godson' && normalizedCloudProfile.settings.roundTime === 77 && normalizedCloudProfile.settings.quality === 'auto' && !!normalizedCloudProfile.story && !!normalizedCloudProfile.stats, 'profil cloud normalisé avec valeurs par défaut sûres');
  const exportedCloudProfile = ev('exportProfileData()'); exportedCloudProfile.names.p1 = 'Copie uniquement';
  assert(ev('PROFILE.names.p1') !== 'Copie uniquement', 'export cloud = copie profonde, jamais une référence mutable du profil');

  ev('goMenu(); selCharP1=0; selCharP2=1; saveSelection();');
  click('btnMode2P');
  assert(window.document.getElementById('moveList').textContent.includes('EX 75%') && window.document.getElementById('moveList').textContent.includes('Projection') && window.document.getElementById('moveList').textContent.includes('Godson Cancel'), 'move list V3 : EX, projection et Godson Cancel expliqués à la sélection');
  window.document.querySelectorAll('#rosterP1 .charCard')[1].click();
  assert(ev('selCharP1') === 1 && window.document.getElementById('moveList').textContent.includes('Kira'), 'move list mise à jour selon le combattant P1');
  window.document.querySelectorAll('#rosterP1 .charCard')[0].click();
  ev('SETTINGS.roundsWin=2; SETTINGS.roundTime=99; SETTINGS.speed=1;');
  click('btnLaunchFight'); ev('skipVS()'); step(170);
  assert(ev('state') === 'fight', 'combat V3 lancé pour les nouvelles techniques');

  /* Projection : elle doit traverser une garde tenue et mettre au sol. */
  ev('keys.clear(); resetFighterStats(); p1.reset(); p2.reset(); applyCharacterTo(p1,0); applyCharacterTo(p2,1); p1.x=760; p2.x=850; p1.y=p2.y=GROUND; p1.facing=1; p2.facing=-1; projectiles=[];');
  ev('keys.add("ArrowDown")'); step(3);
  assert(ev('p2.blocking') === true, 'projection V3 : la cible tient réellement sa garde avant le test');
  const hpBeforeThrow = ev('p2.health');
  holdCodes(['KeyF', 'KeyG'], 2); step(24); ev('keys.delete("ArrowDown")');
  assert(ev('p1.stats.throws') === 1 && ev('p2.health') < hpBeforeThrow, 'projection Poing+Pied : traverse la garde, dégâts et statistique comptabilisés');

  /* EX : une variante renforcée et marquée pour chacun des 9 combattants. */
  const expectedExCounts = [1, 4, 2, 2, 3, 3, 2, 3, 4];
  for (let i = 0; i < 9; i++) {
    ev(`applyCharacterTo(p1,${i}); p1.reset(); p1.x=420; p2.x=880; p1.y=p2.y=GROUND; projectiles=[]; p1.attackType="exspecial"; p1.attackEx=true; spawnProjectile(p1);`);
    assert(ev('projectiles.length') === expectedExCounts[i] && ev('projectiles.every(p=>p.ex)') === true, 'EX unique et marqué : ' + ev('CHARACTERS[' + i + '].name'));
  }
  ev('keys.clear(); resetFighterStats(); applyCharacterTo(p1,0); applyCharacterTo(p2,1); p1.reset(); p2.reset(); p1.x=420; p2.x=880; p1.y=p2.y=GROUND; p1.energy=80; projectiles=[];'); step(2);
  holdCodes(['KeyH', 'KeyF'], 2);
  assert(ev('p1.attackType') === 'exspecial' && ev('p1.stats.ex') === 1 && ev('p1.energy') < 12, 'entrée EX Spécial+Poing : 75 % d’énergie consommés');
  step(14);
  assert(ev('projectiles.some(p=>p.ex&&p.pierce)') === true, 'EX de Gideon : projectile renforcé et perforant réellement tiré');
  const hpBeforeExHit = ev('p2.health'); step(55);
  assert(ev('p2.health') < hpBeforeExHit, 'EX de Gideon : le projectile touche et inflige des dégâts');

  /* Godson Cancel : seulement après confirmation, pour 25 %, une fois par combo. */
  ev('keys.clear(); resetFighterStats(); p1.reset(); p2.reset(); applyCharacterTo(p1,0); applyCharacterTo(p2,1); p1.x=760; p2.x=850; p1.y=p2.y=GROUND; p1.energy=60; projectiles=[];'); step(2);
  press('KeyF', 2); step(5);
  assert(ev('p1.hitConfirmed') === true && ev('p1.attackT') > 0, 'Godson Cancel : coup confirmé pendant la récupération');
  const energyBeforeCancel = ev('p1.energy');
  press('ShiftLeft', 2);
  assert(ev('p1.stats.cancels') === 1 && ev('p1.dashT') > 0 && ev('p1.energy') < energyBeforeCancel - 20 && ev('p1.godsonCancelReady') === false, 'Godson Cancel : dash immédiat, -25 % et verrou anti-infini');
  ev('resetFighterStats(); p1.reset(); p2.reset(); p1.x=760; p2.x=850; p1.y=p2.y=GROUND; p1.facing=1; startDash(p1,-1);');
  assert(ev('p1.dashT') > 0 && ev('p1.invulnT') >= 6, 'backdash défensif : brève protection en reculant');
  ev('bot.press={}; bot.queue=[]; bot.blockT=0; bot.downT=0; botAction("throw"); updateBot();');
  assert(ev('bot.input.punch') === true && ev('bot.input.kick') === true, 'IA V3 : le bot sait déclencher une projection');
  ev('bot.press={}; bot.queue=[]; bot.blockT=0; bot.downT=0; botAction("exspecial"); updateBot();');
  assert(ev('bot.input.special') === true && ev('bot.input.punch') === true, 'IA V3 : le bot sait déclencher un EX');
  ev('qualityLevel=2; perfFxScale=.5; render();');
  assert(Math.abs(ev('particleMul()') - .5) < .001 && Number.isFinite(ev('renderStats.frameMs')) && !!ev('renderStats.perfTier'), 'performance V3 : échelle FX adaptative et métriques CPU exposées');
  ev('perfFxScale=1; keys.clear(); goMenu();');

  /* Lockstep invité : les touches physiques du P1 local doivent piloter le
     combattant invité (côté 2), pendant que les bits distants pilotent l’hôte. */
  const onlineHostId = '11111111-1111-4111-8111-111111111111';
  const onlineGuestId = '22222222-2222-4222-8222-222222222222';
  const onlineConfigExpr = `({version:GAME_VERSION,seed:987654321,matchKey:"TESTV3-12345678",hostId:"${onlineHostId}",guestId:"${onlineGuestId}",hostName:"Hôte V3",guestName:"Invitée V3",hostChar:0,guestChar:1,hostInitial:"HV",guestInitial:"IV",hostSkin:{primary:"#123456",accent:"#abcdef"},guestSkin:{primary:"#654321",accent:"#fedcba"},arena:"Libreville",arenaMood:"nuit",settings:{roundTime:120,roundsWin:3},inputDelay:3})`;
  ev(`onlineState.session=null; onlineState.profile=null; onlineState.isHost=false; onlineState.started=false; onlineState.room={code:"TESTV3",status:"playing",guest_id:"${onlineGuestId}"}; onlineState.channel=null; onlineState.peer=null; window.__onlineSent=[]; onlineTransportSend=m=>{window.__onlineSent.push({...m}); return true;}; SETTINGS.roundTime=60; SETTINGS.roundsWin=2; SETTINGS.speed=1.12;`);
  assert(ev(`launchOnlineMatch(${onlineConfigExpr})`) === true && ev('mode') === 'online' && ev('onlineSession.localSide') === 2 && ev('replayRecorder.seed') === 987654321, 'duel invité lancé avec seed, côté local et config partagés');
  assert(ev('p1.name') === 'Hôte V3' && ev('p2.name') === 'Invitée V3' && ev('p1.skin.primary') === '#123456' && ev('p2.skin.primary') === '#654321' && ev('SETTINGS.roundTime') === 120 && ev('SETTINGS.roundsWin') === 3, 'identités, tenues et règles de l’hôte appliquées des deux côtés');
  ev('loop(lastTs||0)');
  assert(ev('renderStats.speedScale') === 1 && ev('renderStats.onlineFrame') === ev('onlineSession.frame'), 'en ligne : vitesse verrouillée à 100 % malgré le turbo local');
  ev('keys.clear(); keys.add("KeyF"); updateGameLogic(); keys.delete("KeyF"); updateGameLogic(); updateGameLogic();');
  ev('p1.x=760; p2.x=850; p1.y=p2.y=GROUND; p1.vx=p2.vx=0; p1.attackT=p2.attackT=0; p1.attack=p2.attack=null; state="fight"; receiveOnlineNetMessage({t:"input",f:3,b:0}); updateGameLogic();');
  assert(ev('p2.attackType') === 'punch' && ev('window.__onlineSent.some(m=>m.t==="input"&&m.f===3&&m.b===16)') === true, 'lockstep invité : le poing local échantillonné est appliqué au combattant invité');
  const simBeforeOnlineStall = ev('simFrame');
  assert(ev('updateGameLogic()') === false && ev('simFrame') === simBeforeOnlineStall && ev('onlineSession.stalls') >= 1, 'lockstep : aucune frame simulée sans l’input distant');
  ev('receiveOnlineNetMessage({t:"input",f:4,b:16}); updateGameLogic();');
  assert(ev('p1.attackType') === 'punch', 'lockstep hôte : les bits distants pilotent le combattant hôte');
  ev('togglePause()');
  assert(ev('state') !== 'pause', 'pause interdite pendant un duel en ligne');
  ev('onOnlineDesync=()=>{}; onlineSession.frame=300; onlineSession.nextInputFrame=400; onlineSession.localInputs.set(300,0); onlineSession.remoteInputs.set(300,0); updateGameLogic(); onlineSession.localInputs.set(301,0); onlineSession.remoteInputs.set(301,0); receiveOnlineNetMessage({t:"check",f:300,h:onlineSession.localChecks.get(300)==="00000000"?"11111111":"00000000"});');
  assert(ev('updateGameLogic()') === false && ev('onlineSession.desync') === true, 'checksum différé : une divergence tardive arrête le duel avant classement');
  ev('stopOnlineSession("disconnect"); onlineState.room=null; onlineState.started=false; onlineTransportSend=null; SETTINGS.speed=1; goMenu();');
  assert(ev('SETTINGS.roundTime') === 60 && ev('SETTINGS.roundsWin') === 2, 'réglages locaux restaurés après déconnexion du lockstep');
  assert(ev(`launchOnlineMatch({version:"2.8.0",seed:1,matchKey:"OLDV123456",hostId:"${onlineHostId}",guestId:"${onlineGuestId}",hostChar:0,guestChar:1,arena:"stadium",arenaMood:"jour",settings:{roundTime:99,roundsWin:2},inputDelay:3})`) === false && window.document.getElementById('onlineRoomStatus').textContent.includes('incompatibles'), 'duel refusé si les deux versions du jeu diffèrent');

  /* Fin de match hôte : les réglages distants ne doivent jamais être persistés. */
  ev(`onlineState.session=null; onlineState.isHost=true; onlineState.started=false; onlineState.room={code:"TESTV3",status:"playing",guest_id:"${onlineGuestId}"}; window.__onlineSent=[]; onlineTransportSend=m=>{window.__onlineSent.push({...m}); return true;}; SETTINGS.roundTime=60; SETTINGS.roundsWin=2;`);
  assert(ev(`launchOnlineMatch(${onlineConfigExpr})`) === true, 'duel hôte relancé pour la fin de match en ligne');
  ev('updateGameLogic(); updateGameLogic(); updateGameLogic();');
  const matchesBeforeOnlineFinish = ev('PROFILE.stats.matches');
  ev('finishMatch(p1)');
  assert(ev('state') === 'matchEnd' && ev('onlineSession.active') === false && ev('SETTINGS.roundTime') === 60 && ev('SETTINGS.roundsWin') === 2 && ev('PROFILE.stats.matches') === matchesBeforeOnlineFinish + 1, 'fin en ligne : stats locales comptées et réglages restaurés avant sauvegarde');
  assert(window.document.getElementById('btnRematch').classList.contains('hidden') && window.document.getElementById('btnEndSelect').classList.contains('hidden'), 'fin en ligne : pas de revanche locale non synchronisée proposée');
  ev('goMenu();');
  assert(ev('onlineState.room') === null && ev('state') === 'menu', 'retour menu : salon et transport en ligne nettoyés');

  console.log('\n— V3.1 : Humanité++ (proportions, visage, regard, IK) —');
  assert(/^[3-9]\.\d+\.\d+$/.test(ev('GAME_VERSION')) && (window.document.querySelector('h1').textContent.includes('PRO')||/V[6-9]\.\d+/.test(window.document.querySelector('h1').textContent)), 'version Humanité++ (génération 3.1+) exposée au moteur');
  assert(ev('typeof humanProfile') === 'function' && ev('typeof drawHumanHead') === 'function' && ev('typeof drawHumanArm') === 'function' && ev('typeof drawHumanLeg') === 'function' && ev('typeof solveJoint') === 'function' && ev('typeof taperedSegment') === 'function', 'moteur anatomique humain V3.1 disponible');
  assert(ev('Object.keys(HUMAN_PROFILES).length') === 41, '41 morphologies humaines déclarées');
  const humanSignatures = new Set(); let minShoulder = 999, maxShoulder = 0;
  for (let i = 0; i < 41; i++) {
    const prof = ev(`(()=>{const p=humanProfile({char:CHARACTERS[${i}]}); return p.label+'|'+p.headR+'|'+p.shoulder+'|'+p.hip+'|'+p.limb+'|'+p.hair;})()`);
    humanSignatures.add(prof);
    const shoulder = Number(prof.split('|')[2]); minShoulder = Math.min(minShoulder, shoulder); maxShoulder = Math.max(maxShoulder, shoulder);
  }
  assert(humanSignatures.size === 41 && maxShoulder - minShoulder >= 9, 'silhouettes distinctes : épaules de ' + minShoulder + ' à ' + maxShoulder);
  assert(ev('(()=>{const rs=Object.values(HUMAN_PROFILES).map(p=>p.headR); return Math.max(...rs)<=16&&Math.min(...rs)>=14.5;})()') === true, 'proportions V4 : tête adulte réduite (14,5 à 16 px) pour les 41 combattants');
  assert(ev('(()=>{const j=solveJoint(0,0,60,20,42,41,-1); return Math.abs(Math.hypot(j.x,j.y)-42)<1.5&&Math.abs(Math.hypot(60-j.x,20-j.y)-41)<1.5;})()') === true, 'IK deux segments : longueurs des membres respectées');
  assert(ev('(()=>{const j=solveJoint(0,0,400,0,42,41,1); return Number.isFinite(j.x)&&Number.isFinite(j.y);})()') === true, 'IK : cible hors de portée clampée sans NaN');
  ev('p1.reset(); p2.reset(); p1.x=p1.rx=500; p2.x=p2.rx=900; p1.y=p1.ry=p2.y=p2.ry=GROUND; p1.facing=1; p2.facing=-1; p1.health=p1.maxHealth;');
  ev('for(let k=0;k<60;k++)fighterMotion(p1);');
  assert(ev('renderStats.gazeX') > 0.5 && ev('renderStats.humanMotionSamples') > 0, 'regard : les yeux suivent l’adversaire placé devant');
  ev('p2.x=p2.rx=120; for(let k=0;k<60;k++)fighterMotion(p1);');
  assert(ev('renderStats.gazeX') < -0.5, 'regard : les yeux suivent l’adversaire passé derrière');
  ev('p1.reset(); p1.vx=6; p1.facing=1; for(let k=0;k<40;k++)fighterMotion(p1); p1.vx=0;');
  assert(Math.abs(ev('renderStats.hairSway')) > 1.5, 'inertie : cheveux et vêtements réagissent à la vitesse');
  ev('p1.health=Math.round(p1.maxHealth*.12); for(let k=0;k<60;k++)fighterMotion(p1);');
  assert(ev('renderStats.fatigue') > 0.6, 'fatigue : vie basse = respiration et épaules marquées');
  ev('p1.reset(); p1.health=p1.maxHealth; if(p1.motion)p1.motion.fatigue=0; p1.hitStun=0; p1.attack=null; p1.blocking=false; drawFighter(p1);');
  assert(ev('renderStats.lastFacialExpression') === 'focus', 'visage : expression concentrée au repos');
  ev('p1.hitStun=12; drawFighter(p1); p1.hitStun=0;');
  assert(ev('renderStats.lastFacialExpression') === 'douleur', 'visage : expression de douleur sur impact');
  ev('p1.blocking=true; drawFighter(p1); p1.blocking=false;');
  assert(ev('renderStats.lastFacialExpression') === 'garde', 'visage : expression de garde');
  for (let i = 0; i < 41; i++) {
    ev(`applyCharacterTo(p1,${i}); p1.reset(); if(p1.motion)p1.motion.fatigue=0; drawFighter(p1);`);
    assert(ev('renderStats.lastHumanProfile') === ev('CHARACTERS[' + i + '].id'), 'rendu humain complet sans erreur : ' + ev('CHARACTERS[' + i + '].name'));
  }
  assert(ev('renderStats.humanProfiles') === 41, 'métriques Humanité++ exposées (41 profils actifs)');
  const logicalBeforeHuman = ev('p1.x+","+p1.y+","+p1.health+","+p1.vx');
  ev('drawFighter(p1); drawFighter(p2);');
  assert(ev('p1.x+","+p1.y+","+p1.health+","+p1.vx') === logicalBeforeHuman, 'Humanité++ 100 % visuel : physique, hitboxes et déterminisme inchangés');
  ev('p1.reset(); p2.reset(); goMenu();');

  console.log('\n— V3.2 : Paysage prioritaire & interface épurée —');
  assert(/^[3-9]\.\d+\.\d+$/.test(ev('GAME_VERSION')) && (window.document.querySelector('h1').textContent.includes('PRO')||/V[6-9]\.\d+/.test(window.document.querySelector('h1').textContent)), 'version Paysage (génération 3.2+) exposée au moteur');
  assert(!!window.document.getElementById('rotateHint') && !!window.document.getElementById('btnLandscape') && !window.document.getElementById('btnPortraitAnyway'), 'écran « Tourne ton appareil » présent — paysage forcé V7.3, aucune échappatoire portrait');
  assert(ev('typeof requestImmersiveLandscape') === 'function' && ev('typeof handlePortraitChange') === 'function' && ev('typeof initPortraitGuard') === 'function', 'logique paysage (plein écran, orientation, pause portrait) disponible');
  let landscapeCallOk = true;
  try { ev('requestImmersiveLandscape()'); } catch (e) { landscapeCallOk = false; }
  assert(landscapeCallOk, 'plein écran paysage : aucun crash si l’API est absente');
  assert(!window.document.body.classList.contains('allowPortrait'), 'aucun mode portrait toléré par défaut (V7.3)');
  assert(window.document.querySelector('.helpBar') === null, 'barre d’aide sous le jeu supprimée (anti-saturation)');
  assert(window.document.querySelector('footer').textContent.trim().length < 130, 'pied de page condensé en une ligne signature');
  const cssV32 = fs.readFileSync(path.join(root, 'src/style.css'), 'utf8');
  assert(cssV32.includes('orientation:portrait') && cssV32.includes('orientation:landscape') && cssV32.includes('#rotateHint') && cssV32.includes(':fullscreen'), 'CSS paysage : invite portrait, mode cinéma et plein écran');
  assert(!!window.document.getElementById('moveList') && !!window.document.querySelector('.moveDetails summary'), 'techniques repliées sous un résumé dépliable à la sélection');
  ev('goMenu()');
  assert(!window.document.getElementById('menuMain').classList.contains('hidden') && !!window.document.getElementById('btnModeBot') && !!window.document.getElementById('btnOnline'), 'menu principal épuré mais complet');

  console.log('\n— V3.3 : écran de chargement & parcours d’écrans —');
  assert(/^[3-9]\.\d+\.\d+$/.test(ev('GAME_VERSION')) && (window.document.querySelector('h1').textContent.includes('PRO')||/V[6-9]\.\d+/.test(window.document.querySelector('h1').textContent)), 'version Flux d’écrans (génération 3.3+) exposée au moteur');
  assert(!!window.document.getElementById('bootLoader') && !!window.document.getElementById('bootFill') && !!window.document.getElementById('bootPct') && ev('typeof startBoot') === 'function' && ev('typeof finishBoot') === 'function', 'écran de chargement présent (barre, pourcentage, étapes)');
  ev('finishBoot()');
  assert(ev('bootDone') === true && window.document.getElementById('bootLoader').classList.contains('done'), 'chargement terminé proprement (fondu de sortie)');
  assert(window.document.querySelectorAll('.flowSteps').length >= 3, 'indicateur d’étapes présent sur les écrans du parcours');
  assert(!!window.document.getElementById('menuArena') && !!window.document.getElementById('btnSelectNext') && !!window.document.getElementById('btnArenaBack'), 'écran Arène dédié avec navigation avant/arrière');
  /* Parcours 2 joueurs : Menu -> Personnages -> Arène -> VS */
  ev('goMenu()'); click('btnMode2P');
  assert(!window.document.getElementById('menuSelect').classList.contains('hidden') && window.document.getElementById('menuArena').classList.contains('hidden'), 'étape 1 : écran Personnages d’abord');
  click('btnSelectNext');
  assert(!window.document.getElementById('menuArena').classList.contains('hidden') && window.document.getElementById('menuSelect').classList.contains('hidden'), 'étape 2 : écran Arène ensuite');
  click('btnArenaBack');
  assert(!window.document.getElementById('menuSelect').classList.contains('hidden'), 'retour Arène -> Personnages');
  click('btnSelectNext'); click('btnLaunchFight');
  assert(ev('state') === 'vs' && !window.document.getElementById('menuVS').classList.contains('hidden'), 'parcours 2 joueurs : l’arène mène à l’écran VS');
  /* Parcours Bot : la difficulté arrive EN DERNIER, après l’arène */
  ev('goMenu()'); click('btnModeBot');
  assert(!window.document.getElementById('menuSelect').classList.contains('hidden') && window.document.getElementById('menuBot').classList.contains('hidden'), 'bot : Personnages avant la difficulté');
  click('btnSelectNext'); click('btnLaunchFight');
  assert(!window.document.getElementById('menuBot').classList.contains('hidden') && ev('state') !== 'vs', 'bot : difficulté demandée après l’arène, avant le combat');
  window.document.querySelector('#menuBot [data-diff="difficile"]').click();
  assert(ev('botDiff') === 'difficile' && ev('state') === 'vs', 'bot : choisir la difficulté lance le match (VS)');
  ev('skipVS()'); step(170);
  assert(ev('state') === 'fight', 'bot : combat démarré au bout du parcours complet');
  ev('goMenu()');

  console.log('\n— V3.4 : zone de combat dégagée & tactile compact —');
  assert(/^[3-9]\.\d+\.\d+$/.test(ev('GAME_VERSION')) && (window.document.querySelector('h1').textContent.includes('PRO')||/V[6-9]\.\d+/.test(window.document.querySelector('h1').textContent)), 'version Zone dégagée (génération 3.4+) exposée au moteur');
  const css34 = fs.readFileSync(path.join(root, 'src/style.css'), 'utf8');
  assert(css34.includes('ga-jump') && css34.includes('11.5vh') && css34.includes('max-height:520px') && css34.includes('rgba(6,10,26,.42)'), 'tactile compact : grille aux coins, boutons réduits semi-transparents, libellés masqués en paysage court');
  const renderSrc34 = fs.readFileSync(path.join(root, 'src/render.js'), 'utf8');
  assert(!renderSrc34.includes('f.ry-212'), 'plaque de nom retirée au-dessus des combattants (le HUD suffit)');
  ev('goMenu(); render()');
  assert(ev('renderStats.billboardAlpha') === 1, 'écran géant de l’arène pleinement visible dans les menus');
  click('btnMode2P'); click('btnLaunchFight'); ev('skipVS()'); step(170); ev('render()');
  assert(ev('state') === 'fight' && ev('renderStats.billboardAlpha') <= 0.35, 'écran géant effacé pendant le combat : la scène appartient aux personnages');
  assert(ev('renderStats.spotlightX') > 0, 'halo de scène actif qui suit les combattants');
  ev('floaters=[{x:640,y:300,text:"A",c:"#ffffff",life:60,big:false},{x:645,y:305,text:"B",c:"#ffffff",life:60,big:false},{x:638,y:298,text:"C",c:"#ffffff",life:60,big:true}]; drawEffects();');
  assert(ev('renderStats.floaterSpread') >= 24, 'textes flottants décalés au lieu de se chevaucher');
  ev('floaters=[]; goMenu()');

  console.log('\n— V3.5 : prise en main paysage & impacts fluides —');
  assert(/^[3-9]\.\d+\.\d+$/.test(ev('GAME_VERSION')) && (window.document.querySelector('h1').textContent.includes('PRO')||/V[6-9]\.\d+/.test(window.document.querySelector('h1').textContent)), 'version V3.5+ affichée et exposée au moteur');
  assert(ev('Object.values(ATTACKS).every(a=>!("hitstop" in a))') === true, 'zéro gel d’impact : aucune attaque ne déclare de pause ou de ralentissement à la touche');
  ev('goMenu(); selCharP1=0; selCharP2=1; saveSelection();');
  click('btnMode2P'); click('btnLaunchFight'); ev('skipVS()'); step(170);
  ev('keys.clear(); p1.reset(); p2.reset(); p1.x=760; p2.x=850; p1.y=p2.y=GROUND; p1.facing=1; p2.facing=-1;');
  press('KeyF', 2); step(5);
  const noFreezeFrame = ev('simFrame'), noFreezeStun = ev('p2.hitStun'); step(1);
  assert(ev('p1.hitConfirmed') === true && ev('simFrame') === noFreezeFrame + 1 && (noFreezeStun === 0 || ev('p2.hitStun') === noFreezeStun - 1), 'coup de poing réel : la simulation avance dès la frame suivante, sans gel ni slow-mo');
  assert(ev('typeof syncImmersiveCombat') === 'function' && !!window.document.getElementById('btnPauseFloat'), 'combat immersif paysage + pause flottante disponibles');
  let immersiveOk = true;
  try { ev('syncImmersiveCombat()'); } catch (e) { immersiveOk = false; }
  assert(immersiveOk, 'synchronisation immersive sans crash hors mobile paysage');
  const css35 = fs.readFileSync(path.join(root, 'src/style.css'), 'utf8');
  assert(css35.includes('body.combatImmersif header.sig') && css35.includes('touch-action:none') && css35.includes('safe-area-inset-left'), 'paysage tenu à deux mains : en-tête masqué en combat, anti-scroll, encoches respectées');
  assert(fs.readFileSync(path.join(root, 'src/render.js'), 'utf8').includes('syncImmersiveCombat()'), 'boucle de jeu synchronisée avec le mode immersif');
  ev('goMenu()');

  /* Client Supabase/WebRTC : transport et API simulés, mais tout le code
     applicatif réel (auth, REST, salons, signaux, cloud) est exercé. */
  v3AsyncWork = (async () => {
    console.log('\n— V3.0 : client Supabase, salons WebRTC & cloud (API simulée) —');
    const waitMs = ms => new Promise(resolve => setTimeout(resolve, ms));
    const asyncUserId = '11111111-1111-4111-8111-111111111111';
    const asyncOtherId = '22222222-2222-4222-8222-222222222222';
    const fetchCalls = [];
    let asyncProfile = null;
    let asyncRoom = { code: 'TEST42', host_id: asyncOtherId, guest_id: null, status: 'open', config: { version: ev('GAME_VERSION'), seed: 424242, matchKey: 'TEST42-424242', hostId: asyncOtherId, hostName: 'Hôte Cloud', hostChar: 2, arena: 'tokyo', arenaMood: 'nuit', settings: { roundTime: 99, roundsWin: 2 }, inputDelay: 5 } };
    const jsonResponse = (data, status = 200) => ({ ok: status >= 200 && status < 300, status, text: async () => JSON.stringify(data) });
    class FakeDataChannel {
      constructor() { this.readyState = 'open'; this.sent = []; }
      send(data) { this.sent.push(data); }
      close() { this.readyState = 'closed'; if (this.onclose) this.onclose(); }
    }
    class FakePeerConnection {
      constructor() { this.connectionState = 'connected'; this.iceGatheringState = 'complete'; this.localDescription = null; this.remoteDescription = null; }
      createDataChannel() { return new FakeDataChannel(); }
      async createOffer() { return { type: 'offer', sdp: 'fake-offer' }; }
      async createAnswer() { return { type: 'answer', sdp: 'fake-answer' }; }
      async setLocalDescription(desc) { this.localDescription = desc; }
      async setRemoteDescription(desc) { this.remoteDescription = desc; }
      async addIceCandidate() {}
      close() { this.connectionState = 'closed'; }
    }
    window.RTCPeerConnection = FakePeerConnection;
    window.webkitRTCPeerConnection = FakePeerConnection;
    window.fetch = async (url, options = {}) => {
      const method = options.method || 'GET';
      const body = options.body ? JSON.parse(options.body) : null;
      fetchCalls.push({ url: String(url), method, body, headers: options.headers || {} });
      if (url.includes('/auth/v1/signup') || url.includes('/auth/v1/token')) return jsonResponse({ access_token: 'fake-access-token', refresh_token: 'fake-refresh-token', expires_in: 3600, user: { id: asyncUserId, email: 'champion@example.com' } });
      if (url.includes('/auth/v1/user')) return jsonResponse({ id: asyncUserId, email: 'champion@example.com' });
      if (url.includes('/auth/v1/logout')) return jsonResponse({});
      if (url.includes('/rest/v1/player_profiles')) {
        if (method === 'POST') { asyncProfile = body; return jsonResponse([asyncProfile]); }
        return jsonResponse(asyncProfile ? [asyncProfile] : []);
      }
      if (url.includes('/rest/v1/leaderboard')) return jsonResponse([{ player_id: asyncOtherId, display_name: 'Champion Mondial', country_code: 'GA', wins: 4, losses: 1, matches: 5 }]);
      if (url.includes('/rest/v1/cloud_saves')) return jsonResponse(method === 'POST' ? [body] : [{ user_id: asyncUserId, slot: 'main', save_data: ev('exportProfileData()'), game_version: ev('GAME_VERSION') }]);
      if (url.includes('/rest/v1/shared_replays')) {
        if (method === 'POST') return jsonResponse([{ id: '33333333-3333-4333-8333-333333333333', ...body }]);
        if (url.includes('replay_data')) return jsonResponse([{ id: '44444444-4444-4444-8444-444444444444', title: 'Replay Cloud Test', replay_data: ev('lastReplayData'), replay_hash: ev('lastReplayData.finalHash'), game_version: ev('GAME_VERSION') }]);
        return jsonResponse([{ id: '44444444-4444-4444-8444-444444444444', title: 'Replay Cloud Test', is_public: true, replay_hash: ev('lastReplayData.finalHash'), game_version: ev('GAME_VERSION'), created_at: new Date().toISOString() }]);
      }
      if (url.includes('/rest/v1/online_signals')) {
        if (method === 'POST') return jsonResponse(null, 201);
        return jsonResponse([{ id: 'signal-offer-1', room_code: 'TEST42', sender_id: asyncOtherId, kind: 'offer', payload: { type: 'offer', sdp: 'fake-offer' } }]);
      }
      if (url.includes('/rest/v1/rpc/join_online_room')) {
        asyncRoom = { ...asyncRoom, guest_id: asyncUserId, status: 'locked', config: { ...asyncRoom.config, ...(body.guest_config || {}), guestId: asyncUserId } };
        return jsonResponse(asyncRoom);
      }
      if (url.includes('/rest/v1/online_rooms')) {
        if (method === 'POST') { asyncRoom = { code: body.code, host_id: body.host_id, guest_id: null, status: body.status, config: body.config }; return jsonResponse([asyncRoom]); }
        if (method === 'PATCH') { asyncRoom = { ...asyncRoom, ...body }; return jsonResponse([asyncRoom]); }
        return jsonResponse([asyncRoom]);
      }
      if (url.includes('/functions/v1/submit-match-result')) return jsonResponse({ status: 'waiting_counterparty' });
      return jsonResponse([]);
    };

    click('btnOnline'); await waitMs(25);
    assert(!window.document.getElementById('menuOnline').classList.contains('hidden') && window.document.getElementById('onlineLeaderboardList').textContent.includes('Champion Mondial'), 'panneau GO GAME : classement public chargé sans compte');
    window.document.getElementById('onlineEmail').value = 'champion@example.com';
    window.document.getElementById('onlinePassword').value = 'secret6';
    window.document.getElementById('onlineDisplayName').value = 'Champion Async';
    window.document.getElementById('onlineCountry').value = 'GA';
    window.document.getElementById('onlineMainFighter').value = '5';
    await ev('onlineSignUp()');
    assert(ev('onlineState.session.access_token') === 'fake-access-token' && ev('onlineState.profile.display_name') === 'Champion Async' && String(window.localStorage.getItem(ev('GO_GAME_SESSION_KEY')) || '').includes('fake-access-token'), 'Supabase Auth simulée : compte, session persistée et profil publié');
    await ev('uploadOnlineSave()');
    assert(fetchCalls.some(c => c.url.includes('/rest/v1/cloud_saves') && c.method === 'POST' && c.body.save_data && c.body.save_data.names) && window.document.getElementById('onlineCloudStatus').textContent.includes('envoyée'), 'cloud save : profil complet envoyé dans le slot main');
    window.document.getElementById('onlineReplayPublic').checked = true;
    await ev('publishOnlineReplay()');
    assert(fetchCalls.some(c => c.url.includes('/rest/v1/shared_replays') && c.method === 'POST' && c.body.replay_hash) && window.document.getElementById('onlineReplayList').textContent.includes('Replay Cloud Test'), 'replays cloud : publication et liste publique actualisée');
    await ev('importOnlineReplay("44444444-4444-4444-8444-444444444444")');
    assert(ev('replayPlayback.active') === true, 'replay cloud public importé et lecture lancée');
    ev('stopReplayPlayback(true); goMenu();'); click('btnOnline'); await waitMs(5);

    window.document.getElementById('onlineRoomCode').value = 'TEST42';
    window.document.getElementById('onlineFighter').value = '5';
    await ev('joinOnlineRoom()'); await waitMs(30);
    assert(ev('onlineState.isHost') === false && ev('onlineState.room.guest_id') === asyncUserId && fetchCalls.some(c => c.url.includes('/rest/v1/online_signals') && c.method === 'POST' && c.body.kind === 'answer'), 'signalisation WebRTC : salon rejoint par RPC et réponse SDP envoyée');
    await ev('leaveOnlineRoom(true)');
    assert(ev('onlineState.room') === null && asyncRoom.status === 'closed', 'salon invité quitté et fermé côté serveur simulé');

    window.document.getElementById('onlineRoomCode').value = '';
    window.document.getElementById('onlineArena').value = 'Libreville';
    window.document.getElementById('onlineMood').value = 'nuit';
    await ev('createOnlineRoom()');
    assert(/^[A-Z0-9]{6}$/.test(ev('onlineState.room.code')) && ev('onlineState.isHost') === true && fetchCalls.some(c => c.url.includes('/rest/v1/online_signals') && c.method === 'POST' && c.body.kind === 'offer'), 'salon hôte : code généré, room créée et offre SDP publiée');
    asyncRoom.guest_id = asyncOtherId; asyncRoom.status = 'locked'; asyncRoom.config = { ...asyncRoom.config, guestId: asyncOtherId, guestName: 'Rivale Cloud', guestChar: 1 };
    await ev('pollOnlineRoom()');
    ev('if(onlineState.channel&&onlineState.channel.onopen)onlineState.channel.onopen(); syncOnlineUI();');
    assert(window.document.getElementById('btnOnlineStartDuel').disabled === false && window.document.getElementById('onlineRoomStatus').textContent.includes('Rivale Cloud'), 'salon hôte : adversaire détecté, canal ouvert et lancement activé');
    await ev('leaveOnlineRoom(true)');

    ev(`onlineSession.config={matchKey:"ASYNCV3-123456",hostId:"${asyncUserId}",guestId:"${asyncOtherId}",hostChar:0,guestChar:1,arena:"stadium",arenaMood:"crepuscule"};`);
    await ev('submitOnlineMatchResult(p1)');
    assert(fetchCalls.some(c => c.url.includes('/functions/v1/submit-match-result') && c.body.match_key === 'ASYNCV3-123456' && c.body.verification_hash) && window.document.getElementById('onlineStatus').textContent.includes('attente'), 'résultat classé : claim envoyé à l’Edge Function, en attente du co-signataire');

    console.log('\n— V6.1 : duel local 2 téléphones (signalisation manuelle simulée) —');
    const setLocalSelection61 = (main, reserve) => {
      const mainEl = window.document.getElementById('localFighterMain');
      mainEl.value = String(main); mainEl.dispatchEvent(new window.Event('change', { bubbles: true }));
      const reserveEl = window.document.getElementById('onlineFighterReserve');
      reserveEl.value = String(reserve); reserveEl.dispatchEvent(new window.Event('change', { bubbles: true }));
      window.document.getElementById('localMatchFormat').value = 'team2v2';
    };
    click('btnModePhones'); await waitMs(5);
    assert(!window.document.getElementById('menuOnline').classList.contains('hidden') && window.document.getElementById('localPhoneStatus').textContent.includes('2 téléphones'), 'entrée 2 téléphones : panneau local ouvert sans compte ni classement');
    setLocalSelection61(6, 12);
    assert(ev('localSelectedTeam().join("-")') === '6-12' && ev('localSelectedFormat()') === 'team2v2', 'équipe locale hôte : KAEL + remplaçant VORAK, format 2v2 Relais');
    const inviteCode61 = await ev('createLocalPhoneInvite()');
    assert(/^GF61\.[GR]\./.test(inviteCode61) && ev('onlineState.localManual') === true && ev('onlineState.localConfig.hostTeam.join("-")') === '6-12' && ev('onlineState.room.localOnly') === true, 'invitation GF61 créée en WebRTC local, sans salon Supabase');
    const invitePayload61 = await ev('decodeLocalSignal(document.getElementById("localSignalOut").value)');
    assert(invitePayload61.kind === 'invite' && invitePayload61.desc.sdp === 'fake-offer' && invitePayload61.config.format === 'team2v2' && invitePayload61.config.hostTeam.join('-') === '6-12', 'code d’invitation relisible : SDP locale + équipe hôte + format 2v2');
    let invalidLocalCode61 = false;
    try { await ev('decodeLocalSignal("GF61.X.nope")'); } catch (e) { invalidLocalCode61 = true; }
    assert(invalidLocalCode61, 'code local invalide rejeté proprement avant toute connexion');
    setLocalSelection61(7, 8);
    await ev('encodeLocalSignal({kind:"answer",version:GAME_VERSION,matchKey:onlineState.localConfig.matchKey,desc:{type:"answer",sdp:"fake-local-answer"},guest:localGuestPayload()}).then(code=>{document.getElementById("localSignalIn").value=code; return code;})');
    await ev('finalizeLocalPhoneAnswer()');
    assert(ev('onlineState.localConfig.guestTeam.join("-")') === '7-8' && ev('onlineState.peer.remoteDescription.sdp') === 'fake-local-answer' && ev('onlineState.room.guest_id') === 'local-guest', 'réponse invitée connectée : Sora + AEL-7 fusionnés dans la config du match');
    ev('if(onlineState.channel&&onlineState.channel.onopen)onlineState.channel.onopen(); syncOnlineUI();');
    await ev('startOnlineDuel()');
    assert(ev('!!onlineState.pendingStartConfig') === true && ev('mode') !== 'online', 'démarrage WebRTC ordonné : l’hôte attend la confirmation start-ready avant d’initialiser le lockstep');
    ev('onlineState.channel.onmessage({data:JSON.stringify({t:"start-ready",matchKey:onlineState.pendingStartConfig.matchKey})})'); await waitMs(50);
    assert(ev('mode') === 'online' && ev('teamMatch.active') === true && ev('p1.char.id') === 'kael' && ev('p2.char.id') === 'sora' && ev('onlineSession.config.localOnly') === true, 'match local lancé par le même lockstep : KAEL contre Sora, réservistes prêts');
    await ev('leaveOnlineRoom(false)'); ev('clearTeamMatch(); goMenu();');
    setLocalSelection61(6, 12);
    await ev('encodeLocalSignal({kind:"invite",version:GAME_VERSION,desc:{type:"offer",sdp:"fake-local-offer"},config:buildLocalHostConfig()}).then(code=>{document.getElementById("localSignalIn").value=code; return code;})');
    setLocalSelection61(7, 8);
    const answerCode61 = await ev('acceptLocalPhoneInvite()');
    const answerPayload61 = await ev('decodeLocalSignal(document.getElementById("localSignalOut").value)');
    assert(/^GF61\.[GR]\./.test(answerCode61) && answerPayload61.kind === 'answer' && answerPayload61.guest.guestTeam.join('-') === '7-8' && ev('onlineState.isHost') === false && ev('onlineState.localConfig.hostTeam.join("-")') === '6-12', 'téléphone invité : réponse GF61 créée avec son équipe et la config hôte');
    await ev('leaveOnlineRoom(false)'); ev('clearTeamMatch(); goMenu();');
    await ev('onlineSignOut()');
    assert(ev('onlineState.session') === null && window.localStorage.getItem(ev('GO_GAME_SESSION_KEY')) === null, 'déconnexion GO GAME : session locale effacée');
  })();

} catch (e) {
  errors.push('EXCEPTION TEST: ' + e.stack);
}

function finishTestRun() {

  console.log('\n— V3.6 : Nouveaux Champions (planches du propriétaire) —');
  assert(/^(3\.[67]|[4-9]\.\d+)\.\d+$/.test(ev('GAME_VERSION')) && (window.document.querySelector('h1').textContent.includes('PRO')||/V[6-9]\.\d+/.test(window.document.querySelector('h1').textContent)), 'version génération Nouveaux Champions (3.6+) exposée');
  assert(ev('CHARACTERS[6].name+"/"+CHARACTERS[7].name+"/"+CHARACTERS[8].name') === 'KAEL/SORA/AEL-7', 'roster : KAEL, SORA et AEL-7 en fin de grille (indices 6-8, Histoire intacte)');
  assert(ev('CHARACTERS.slice(6,9).map(c=>c.style).join()') === 'guerrier,magicienne,synthetique', '3 styles de rendu dédiés : Guerrier, Magicienne, Synthétique');
  assert(ev('new Set(CHARACTERS.map(c=>c.id)).size') === 41, 'identifiants uniques pour les 41 combattants');
  assert(ev('CHARACTERS.slice(6,9).every(c=>c.hp>=90&&c.hp<=115&&c.speed>=.9&&c.speed<=1.25)') === true, 'équilibrage : PV et vitesse des champions dans la fourchette du roster');
  assert(ev('Boolean(HUMAN_PROFILES.kael&&HUMAN_PROFILES.sora&&HUMAN_PROFILES.ael)') === true, 'morphologies humaines dédiées aux 3 champions');
  for (let i = 6; i < 9; i++) {
    ev(`applyCharacterTo(p1,${i}); p1.reset(); p1.x=420; p2.x=880; p1.y=p2.y=GROUND; projectiles=[]; p1.attackType="special"; p1.attackEx=false; spawnProjectile(p1);`);
    assert(ev('projectiles.length') === [1, 1, 2][i - 6], 'spécial du champion : ' + ev('CHARACTERS[' + i + '].name'));
    ev('projectiles=[]; p1.attackType="super"; spawnProjectile(p1);');
    assert(ev('projectiles.length') === [3, 3, 1][i - 6], 'super du champion : ' + ev('CHARACTERS[' + i + '].name'));
  }
  assert(ev('(()=>{applyCharacterTo(p1,6); p1.reset(); p1.x=420; p2.x=880; p1.y=GROUND; projectiles=[]; p1.attackType="special"; p1.attackEx=false; spawnProjectile(p1); return projectiles[0].kind==="blade"&&projectiles[0].pierce;})()') === true, 'KAEL : lame perçante signature');
  assert(ev('(()=>{applyCharacterTo(p1,7); p1.reset(); p1.x=420; p2.x=880; p1.y=GROUND; projectiles=[]; p1.attackType="special"; p1.attackEx=false; spawnProjectile(p1); return projectiles[0].kind==="orb"&&projectiles[0].homing>0;})()') === true, 'Sora : orbe chercheuse signature');
  assert(ev('(()=>{applyCharacterTo(p1,8); p1.reset(); p1.x=420; p2.x=880; p1.y=GROUND; projectiles=[]; p1.attackType="super"; spawnProjectile(p1); return projectiles[0].kind==="judgment"&&projectiles[0].r>=30;})()') === true, 'AEL-7 : Canon Orbital (projectile lourd)');
  for (let i = 6; i < 9; i++) {
    ev(`applyCharacterTo(p1,${i}); p1.reset(); if(p1.motion)p1.motion.fatigue=0; drawFighter(p1);`);
    assert(ev('renderStats.lastHumanProfile') === ev('CHARACTERS[' + i + '].id'), 'rendu du champion avec sa morphologie : ' + ev('CHARACTERS[' + i + '].name'));
  }
  const renderSrcV36 = fs.readFileSync(path.join(root, 'src/render.js'), 'utf8');
  assert(renderSrcV36.includes('chapeau pointu pour Sora') && renderSrcV36.includes('ch.style==="synthetique"') && renderSrcV36.includes('kael:"lames"') && renderSrcV36.includes('ael:"circuits"'), 'visuels dédiés : chapeau, visière et signatures VFX des champions');
  const uiSrcV36 = fs.readFileSync(path.join(root, 'src/ui.js'), 'utf8');
  assert((uiSrcV36.match(/CHARACTERS\.map\(\(c,i\)=>i\)\.filter\(i=>i!==4\)/g)||[]).length >= 2, 'Arcade et Survie puisent dans tout le roster (hors boss secret)');
  assert(['planche-personnages-1.jpg', 'planche-personnages-2.jpg', 'planche-personnages-3.jpg'].every(f => fs.existsSync(path.join(root, 'assets/concepts', f))) && fs.existsSync(path.join(root, 'docs/CONCEPTS_PERSONNAGES.md')), 'planches du propriétaire archivées en art conceptuel officiel');
  ev('applyCharacterTo(p1,0); applyCharacterTo(p2,1); p1.reset(); p2.reset(); goMenu();');


  console.log('\n— V3.7 : Sélection (aperçus animés, bordures à effets) & Corps pleins —');
  assert(/^(3\.7|[4-9]\.\d+)\.\d+$/.test(ev('GAME_VERSION')) && (window.document.querySelector('h1').textContent.includes('PRO')||/V[6-9]\.\d+/.test(window.document.querySelector('h1').textContent)), 'version génération Sélection & Corps pleins (3.7+) exposée');
  ev('goMenu()'); click('btnMode2P');
  assert(!window.document.getElementById('menuSelect').classList.contains('hidden') && ev('state') === 'select', 'écran de sélection ouvert pour les aperçus');
  assert(!!window.document.getElementById('previewP1') && !!window.document.getElementById('previewP2') && !!window.document.getElementById('previewNameP1'), 'grands aperçus présents pour les deux camps');
  assert(window.document.querySelectorAll('#rosterP1 canvas.portraitCanvas').length >= 8, 'chaque carte affiche le portrait animé de son combattant');
  const firstCard = window.document.querySelectorAll('#rosterP1 .charCard')[0];
  assert(firstCard.style.getPropertyValue('--cc') === ev('effectiveSkin(CHARACTERS[0],1).primary') && firstCard.style.getPropertyValue('--ca'), 'bordure de carte aux couleurs du personnage (primaire + accent)');
  assert(window.document.getElementById('previewBoxP1').style.getPropertyValue('--cc'), 'aperçu encadré aux couleurs du combattant choisi');
  window.document.querySelectorAll('#rosterP1 .charCard')[7].click();
  assert(window.document.getElementById('previewNameP1').textContent === 'SORA' && window.document.getElementById('previewStatsP1').innerHTML.includes('stat'), 'aperçu synchronisé : nom + statistiques du personnage choisi');
  ev('renderStats.portraits=0; updateSelectPortraits(); updateSelectPortraits();');
  for (let k = 0; k < 6; k++) ev('updateSelectPortraits()');
  assert(ev('renderStats.portraits') > 0, 'portraits réellement dessinés par le moteur (' + ev('renderStats.portraits') + ' dessins)');
  assert(ev('selCharP1') === 7, 'sélection clavier : point de départ SORA');
  window.document.dispatchEvent(new window.KeyboardEvent('keydown', { code: 'ArrowRight', bubbles: true }));
  assert(ev('selCharP1') === 8 && window.document.getElementById('previewNameP1').textContent === 'AEL-7', 'navigation clavier : flèche droite -> personnage suivant + aperçu mis à jour');
  const renderSrcV37 = fs.readFileSync(path.join(root, 'src/render.js'), 'utf8');
  assert(renderSrcV37.includes('const legW=20.2*human.limb') && renderSrcV37.includes('const armW=16.4*human.limb') && renderSrcV37.includes('updateSelectPortraits()'), 'corps pleins : jambes et bras volumineux + portraits branchés sur la boucle');
  const cssV37 = fs.readFileSync(path.join(root, 'src/style.css'), 'utf8');
  assert(cssV37.includes('@keyframes cardPulse') && cssV37.includes('@keyframes cardShine') && cssV37.includes('.previewBox') && cssV37.includes('border:3px solid var(--cc'), 'effets de bordure : halo pulsant, reflet balayant, cadre d’aperçu');
  const engineSrcV37 = fs.readFileSync(path.join(root, 'src/engine.js'), 'utf8');
  assert(engineSrcV37.includes('let ctx=canvas.getContext'), 'contexte échangeable pour les portraits (toujours restauré)');
  for (let i = 0; i < 41; i++) { ev(`applyCharacterTo(p1,${i}); p1.reset(); drawFighter(p1);`); }
  assert(true, 'les 41 combattants aux corps pleins se rendent sans erreur');
  ev('applyCharacterTo(p1,0); applyCharacterTo(p2,1); p1.reset(); p2.reset(); goMenu();');


  console.log('\n— V4.0 : Arcade plein écran & anatomie HD —');
  assert(/^[4-9]\.\d+\.\d+$/.test(ev('GAME_VERSION')), 'version génération Arcade plein écran (4.0+) exposée');
  assert(!!window.document.querySelector('#gameWrap > header.sig'), 'barre système intégrée DANS la scène (aucun panneau extérieur)');
  const cssV4 = fs.readFileSync(path.join(root, 'src/style.css'), 'utf8');
  assert(cssV4.includes('#app{position:fixed;inset:0') && cssV4.includes('width:min(100dvw,calc(100dvh * 16 / 9))') && cssV4.includes('height:min(100dvh,calc(100dvw * 9 / 16))') && cssV4.includes('footer{display:none!important}'), 'coque plein écran : scène 16:9 maximale manipulable, aucun pied de page');
  assert(cssV4.includes('body.combatImmersif header.sig{display:none!important}') && cssV4.includes('.portraitCanvas,.previewBox canvas{position:static}'), 'en combat la barre système disparaît ; portraits correctement positionnés');
  ev('state="fight"; syncImmersiveCombat();');
  assert(window.document.body.classList.contains('combatImmersif'), 'immersion combat active sur tous les écrans (pas seulement mobile paysage)');
  ev('state="menu"; syncImmersiveCombat();');
  assert(!window.document.body.classList.contains('combatImmersif'), 'barre système de retour dans les menus');
  assert(ev('(()=>{const rs=Object.values(HUMAN_PROFILES).map(p=>p.headR); return Math.max(...rs)<=16&&Math.min(...rs)>=14.5;})()') === true, 'anatomie V4 : proportions adultes (tête 14,5–16 px, corps allongé)');
  ev('p1.rx=560; p2.rx=720; state="fight"; resetCamera(true); updateCamera(1000);');
  assert(ev('cam.zoom') >= 1.3, 'caméra de jeu de combat : zoom rapproché ' + ev('cam.zoom'));
  ev('renderStats.outfitDetails=0;');
  for (let i = 0; i < 41; i++) { ev(`applyCharacterTo(p1,${i}); p1.reset(); drawFighter(p1);`); }
  assert(ev('renderStats.outfitDetails') >= 41 && ev('renderStats.artDirection').includes('Graphismes AAA'), 'tenues signatures HD dessinées pour les 41 combattants');
  const renderSrcV4 = fs.readFileSync(path.join(root, 'src/render.js'), 'utf8');
  assert(renderSrcV4.includes('const hipY=lerp(-86,-63,cb)') && renderSrcV4.includes('solveJoint(hipX-4,hipY,bFoot.x,bFoot.y-7,46,45,-1)') && renderSrcV4.includes('clamp(1180/(dist+420),.88,1.34)') && renderSrcV4.includes('ch.scale*1.08'), 'squelette allongé, IK adulte et présence visuelle renforcée verrouillés');
  ev('applyCharacterTo(p1,0); applyCharacterTo(p2,1); p1.reset(); p2.reset(); goMenu();');


  console.log('\n— V4.1 : Peinture, matières & présentation (VS plein corps, intro cinéma) —');
  assert(/^[4-9]\.\d+\.\d+$/.test(ev('GAME_VERSION')), 'version V4.1+ exposée');
  ev('goMenu()'); click('btnMode2P'); click('btnLaunchFight');
  assert(ev('state') === 'vs' && !!window.document.getElementById('vsPortrait1') && !!window.document.getElementById('vsPortrait2'), 'écran VS : portraits plein corps des deux combattants');
  assert(window.document.querySelector('#vsAvatar1 canvas') && window.document.getElementById('vsAvatar1').style.borderColor, 'cadre VS aux couleurs du combattant');
  ev('renderStats.portraits=0; updateVSPortraits(); updateVSPortraits();');
  assert(ev('renderStats.portraits') >= 4 && ev('vsRigs[0].f.facing') === 1 && ev('vsRigs[1].f.facing') === -1, 'portraits VS animés et face à face (' + ev('renderStats.portraits') + ' dessins)');
  assert(window.document.getElementById('vsName1').textContent === ev('p1.name'), 'VS synchronisé avec les combattants du match');
  ev('skipVS()');
  assert(ev('state') === 'intro' && ev('introT') > 90, 'intro de round en cours après le VS');
  ev('for(let k=0;k<30;k++)updateGameLogic(); renderStats.introBanners=0; render();');
  assert(ev('renderStats.introBanners') >= 1, 'bandeaux nominatifs cinématographiques pendant l’intro');
  ev('renderStats.materialDetails=0;');
  for (let i = 0; i < 41; i++) { ev(`applyCharacterTo(p1,${i}); p1.reset(); drawFighter(p1);`); }
  assert(ev('renderStats.materialDetails') >= 41, 'peinture & matières V4.1 appliquées aux 41 combattants');
  const renderSrcV41 = fs.readFileSync(path.join(root, 'src/render.js'), 'utf8');
  assert(renderSrcV41.includes('Peinture & matières V4.1') && renderSrcV41.includes('Intro cinématographique V4.1') && renderSrcV41.includes('updateVSPortraits()'), 'hooks V4.1 présents dans le rendu et la boucle');
  const cssV41 = fs.readFileSync(path.join(root, 'src/style.css'), 'utf8');
  assert(cssV41.includes('ÉCRAN VS PLEIN CORPS') && cssV41.includes('aspect-ratio:300/340'), 'cadre VS plein corps stylé');
  ev('applyCharacterTo(p1,0); applyCharacterTo(p2,1); p1.reset(); p2.reset(); goMenu();');


  /* ===== V4.2 « Graphismes AAA » : peinture, lumière d'arène, profondeur ===== */
  assert(/^[4-9]\.\d+\.\d+$/.test(ev('GAME_VERSION')),'version 4.2+');
  assert(/Graphismes AAA/.test(ev('renderStats.artDirection')),'direction artistique AAA (V4.2+)');
  ev('qualityLevel=2');
  window.document.querySelector('#btnMode2P').click(); window.document.querySelector('#btnLaunchFight').click();
  for(let i=0;i<60;i++)ev('updateGameLogic()'); ev('render()');
  assert(ev('renderStats.cylinderShading')===true,'peinture cylindrique des membres active');
  assert(/^#[0-9a-f]{6}$/i.test(ev('renderStats.rimLight')),'rim light aux couleurs de l arene : '+ev('renderStats.rimLight'));
  assert(ev('renderStats.facePaint')>0,'peinture du visage (machoire/nez) appliquee');
  assert(ev('renderStats.ambientMotes')>=16,'rayons + poussieres d ambiance : '+ev('renderStats.ambientMotes'));
  assert(['stadium','tokyo','temple','Libreville'].includes(ev('renderStats.foregroundDepth')),'avant-plan de profondeur par arene : '+ev('renderStats.foregroundDepth'));
  ['tokyo','temple','stadium','Libreville'].forEach(function(id){ ev('setArenaById("'+id+'")'); ev('render()'); assert(ev('renderStats.foregroundDepth')===id,'avant-plan '+id); });
  const r42=fs.readFileSync(path.join(root,'src/render.js'),'utf8');
  assert(r42.includes('createLinearGradient(mx-nx*hw')&&r42.includes('function drawAmbientLife()')&&r42.includes('function drawForegroundDepth()'),'hooks sources graphismes AAA');

  /* ===== V4.3 « Roster complet des planches » : les 35 designs du propriétaire jouables ===== */
  console.log('\n— V4.3 : Roster complet des planches (41 combattants) —');
  assert(/^(4\.[34]|[5-9]\.\d+)\.\d+$/.test(ev('GAME_VERSION')),'version 4.3+');
  assert(ev('CHARACTERS.length')===41,'roster complet : 41 combattants jouables');
  const boardIds=["Lira","kael","sora","zed","nyx","vorak","ael","aerin","korben","lyra","drakesh","selene","taiko","vex","elara","brax","kazu","sera","vorga","nox","raven","zep","astrid","selenia","drakar","nyx-ombre","Kairos","Zara-nova","brutus","aria","krak","luna","velen","lyra-azur","orion"];
  assert(ev('(()=>{const ids='+JSON.stringify(boardIds)+'; return ids.every(id=>CHARACTERS.some(c=>c.id===id));})()')===true,'les 35 personnages des 3 planches du propriétaire sont dans le roster');
  assert(ev('CHARACTERS.every(c=>c.hp>=85&&c.hp<=130&&c.speed>=.75&&c.speed<=1.26&&c.power>=.8&&c.power<=1.38)')===true,'équilibrage global : les 41 combattants dans les bornes du studio');
  for (let i = 9; i < 41; i++) {
    ev(`applyCharacterTo(p1,${i}); p1.reset(); p1.x=420; p2.x=880; p1.y=p2.y=GROUND; projectiles=[]; p1.attackType="special"; p1.attackEx=false; spawnProjectile(p1);`);
    assert(ev('projectiles.length') >= 1, 'spécial fonctionnel : ' + ev('CHARACTERS[' + i + '].name'));
    ev('projectiles=[]; p1.attackType="super"; spawnProjectile(p1);');
    assert(ev('projectiles.length') >= 1, 'super fonctionnel : ' + ev('CHARACTERS[' + i + '].name'));
    ev('projectiles=[]; p1.attackType="exspecial"; p1.attackEx=true; spawnProjectile(p1);');
    assert(ev('projectiles.length') >= 1 && ev('projectiles.every(p=>p.ex)') === true, 'EX fonctionnel et marqué : ' + ev('CHARACTERS[' + i + '].name'));
    ev('projectiles=[]; drawFighter(p1);');
    assert(ev('renderStats.lastHumanProfile') === ev('CHARACTERS[' + i + '].id'), 'rendu complet avec morphologie dédiée : ' + ev('CHARACTERS[' + i + '].name'));
  }
  ev('projectiles=[]; goMenu();'); click('btnMode2P');
  assert(window.document.querySelectorAll('#rosterP1 .charCard').length===41,'sélection Joueurs 1 : 41 cartes affichées');
  assert(window.document.querySelectorAll('#rosterP2 .charCard').length===42,'sélection Joueurs 2 : 41 cartes + carte aléatoire');
  const eng43=fs.readFileSync(path.join(root,'src/engine.js'),'utf8');
  assert(boardIds.every(id=>eng43.includes('id:"'+id+'"')),'hooks sources : les 35 identifiants des planches présents dans le moteur');
  ev('applyCharacterTo(p1,0); applyCharacterTo(p2,1); p1.reset(); p2.reset(); goMenu();');

  /* ===== V4.4 « Navigation Pro & tenues de combat peintes » ===== */
  console.log('\n— V4.4 : Navigation Pro & tenues de combat peintes —');
  assert(/^(4\.4|[5-9]\.\d+)\.\d+$/.test(ev('GAME_VERSION')),'version 4.4+');
  ev('goMenu()'); click('btnMode2P');
  assert(!!window.document.getElementById('rosterSearch')&&window.document.querySelectorAll('.filterChip').length>=6,'recherche + filtres par famille présents dans la sélection');
  assert(window.document.querySelectorAll('.stickyActions').length>=2,'barres d’action fixes : Personnages et Arène toujours atteignables');
  ev('rosterFilter="tous"; rosterSearch="krak"; applyRosterFilter()');
  assert(ev('renderStats.rosterVisible')===1,'recherche « krak » : exactement 1 combattant visible');
  ev('rosterSearch=""; rosterFilter="colosse"; applyRosterFilter()');
  assert(ev('renderStats.rosterVisible')>=5&&ev('renderStats.rosterVisible')<41,'filtre Colosses : '+ev('renderStats.rosterVisible')+' combattants');
  ev('rosterFilter="energie"; applyRosterFilter()');
  assert(ev('renderStats.rosterVisible')>=3,'filtre Énergie : '+ev('renderStats.rosterVisible')+' combattants');
  ev('rosterFilter="tous"; applyRosterFilter()');
  assert(ev('renderStats.rosterVisible')===41,'filtre Tous : les 41 combattants visibles');
  assert(window.document.getElementById('rosterCount').textContent.includes('41'),'compteur de roster à jour : '+window.document.getElementById('rosterCount').textContent);
  const ui44=fs.readFileSync(path.join(root,'src/ui.js'),'utf8');
  assert(ui44.includes('function applyRosterFilter()')&&ui44.includes('function rosterMatches(')&&ui44.includes('gridTemplateColumns'),'hooks navigation : filtres + clavier par colonnes réelles');
  click('btnLaunchFight'); ev('skipVS(); state="fight"; introT=0;');
  for(let i=0;i<20;i++)ev('updateGameLogic()');
  ev('renderStats.torsoPaint=0; render()');
  assert(ev('renderStats.torsoPaint')>=2,'tenues de combat peintes (ouverture, col, plis) sur les deux combattants');
  ev('goMenu()');

  /* ===== V5.0 « Édition Jeu Complet » : carrière, championnat, quêtes & récompenses ===== */
  console.log('\n— V5.0 : Édition Jeu Complet (carrière & championnat) —');
  assert(/^[5-9]\.\d+\.\d+$/.test(ev('GAME_VERSION')),'version 5.0+ — édition jeu complet');
  assert(ev('careerLevelFromXp(0)===1&&careerLevelFromXp(100)===2&&careerLevelFromXp(300)===3&&careerLevelFromXp(1000)===5')===true,'niveaux de carrière : seuils XP 0/100/300/1000 respectés');
  assert(ev('(()=>{const p=normalizeProfileData({stats:{wins:10,losses:2,matches:12,arcadeClears:1,bestSurvivalWave:3},story:{chapter1Completed:true}}); return p.career.xp>0&&p.career.Godson>0&&p.career.circuits.stade===0&&Array.isArray(p.career.titles);})()')===true,'migration V5 : un ancien profil reçoit XP, Godson et circuits');
  ev('PROFILE.career={xp:90,Godson:20,title:"",titles:[],questsClaimed:{},fighterWins:{},circuits:{stade:0,monde:0,legendes:0},bestStage:0,lastReward:""}; PROFILE.stats.matches=1; saveProfile();');
  assert(ev('claimCareerQuest("first-steps")')===true&&ev('PROFILE.career.xp')===140&&ev('PROFILE.career.Godson')===70&&ev('claimCareerQuest("first-steps")')===false,'quête réclamée une seule fois : +50 XP, +50 Godson, niveau 2');
  ev('PROFILE.career.xp=1000; PROFILE.career.Godson=1000; PROFILE.unlocks.prime=false; saveProfile();');
  assert(ev('buyCareerItem("unlock-prime")')===true&&ev('PROFILE.unlocks.prime')===true&&ev('PROFILE.career.Godson')===400,'boutique carrière : GODSON PRIME débloqué pour 600 Godson au niveau 5');
  assert(ev('buyCareerItem("title-Libreville")')===true&&ev('PROFILE.career.title')==='Champion de Libreville'&&ev('PROFILE.career.Godson')===250,'boutique carrière : titre acheté et équipé');
  ev('setupArcadeRun("stade")');
  assert(ev('arcade.seq.length')===5&&ev('arcadeTotal()')===5&&ev('arcade.seq.every(x=>x.arena&&x.diff)')===true,'Circuit Stade : 5 combats avec arène et difficulté par étape');
  ev('setupArcadeRun("monde")');
  assert(ev('arcade.seq.length')===8&&ev('arcadeTotal()')===8&&ev('arcade.circuit')==='monde'&&ev('arcade.seq[7].boss')===true,'Circuit Monde : 8 combats et boss final');
  ev('setupArcadeRun("legendes")');
  assert(ev('arcade.seq.length')===12&&ev('arcadeTotal()')===12&&ev('arcade.seq[11].char')===4,'Circuit des Légendes : 12 combats, GODSON PRIME en finale');
  assert(ev('new Set(arcade.seq.map(x=>x.char)).size')===12,'Championnat : 12 adversaires uniques sur le circuit Légendes');
  ev('goMenu()'); click('btnCareer');
  assert(!window.document.getElementById('menuCareer').classList.contains('hidden')&&window.document.querySelectorAll('[data-circuit]').length===3&&window.document.querySelectorAll('[data-quest]').length>=12&&window.document.querySelectorAll('[data-shop]').length>=6,'écran Carrière complet : 3 circuits, 12 quêtes, boutique de récompenses');
  assert(window.document.getElementById('hubCareerLevel').textContent.includes('NIVEAU')&&window.document.getElementById('hubCareerCoins').textContent.includes('Godson'),'hub principal : niveau, XP et monnaie de carrière visibles');
  ev('document.querySelector("[data-circuit=\\"monde\\"]").click()');
  assert(ev('state')==='select'&&ev('pendingMode')==='arcade'&&ev('arcade.circuit')==='monde','depuis la Carrière, le Circuit Monde lance la sélection du championnat');
  ev('mode="bot"; botDiff="moyen"; PROFILE.career.xp=0; PROFILE.career.Godson=0; PROFILE.career.fighterWins={}; p1.stats.maxCombo=7; p1.stats.parries=3; p1.health=p1.maxHealth; awardCareerForMatch(p1);');
  assert(ev('PROFILE.career.xp')>=100&&ev('PROFILE.career.Godson')>=30&&ev('lastCareerReward.levelAfter')>=2&&ev('Object.keys(PROFILE.career.fighterWins).length')===1,'récompense de match : victoire performante = XP, Godson, niveau et combattant victorieux suivis');
  const eng5=fs.readFileSync(path.join(root,'src/engine.js'),'utf8'),ui5=fs.readFileSync(path.join(root,'src/ui.js'),'utf8');
  assert(eng5.includes('CHAMPIONSHIP_CIRCUITS')&&eng5.includes('function awardCareerForMatch')&&ui5.includes('function renderCareer()')&&ui5.includes('CAREER_QUESTS'),'hooks sources V5 : circuits, récompenses, quêtes et écran carrière');
  ev('goMenu()');

  /* ===== V5.1 « Godson FURY — M1 Signature » : nouveau nom + 41 chaînes martelables ===== */
  console.log('\n— V5.1 : Godson FURY ARENA & M1 Signature par combattant —');
  assert(/^[5-9]\.\d+\.\d+$/.test(ev('GAME_VERSION'))&&ev('GAME_TITLE')==='Godson FURY ARENA'&&window.document.querySelector('h1').textContent.includes('FURY'),'nouveau nom officiel : Godson FURY ARENA (V5.1+)');
  assert(ev('Object.keys(M1_SIGNATURES).length')===41&&ev('CHARACTERS.every(c=>!!M1_SIGNATURES[c.id])')===true,'M1 Signature : les 41 combattants possèdent une chaîne dédiée');
  assert(ev('new Set(Object.values(M1_SIGNATURES).map(s=>s.name)).size')===41&&ev('new Set(Object.values(M1_SIGNATURES).flatMap(s=>s.labels)).size')===168,'M1 Signature : 41 noms de chaînes et 168 coups nommés, tous uniques');
  assert(ev('Object.values(M1_SIGNATURES).every(s=>s.steps.length>=3&&s.steps.length<=5&&s.steps[0].type==="punch"&&s.steps[s.steps.length-1].final)')===true,'M1 Signature : 3 à 5 coups, ouverture Poing et final marqué pour chacun');
  assert(ev('m1SignatureFor(CHARACTERS[6]).name')==='Croisade d’Acier'&&ev('m1SignatureFor(CHARACTERS[31]).steps.length')===5&&ev('m1SignatureFor(CHARACTERS[2]).steps.length')===3,'exemples individuels : KAEL 4 coups, Nyx Ombre 5 coups, TITAN 3 coups lourds');
  ev('replayPlayback.active=true; replayPlayback.data={gameVersion:"5.0.0"};');
  assert(ev('m1Enabled()')===false,'compatibilité : un replay 5.0 relit l’ancien poing générique, sans être réinterprété en M1');
  ev('replayPlayback.active=false; replayPlayback.data=null;');
  assert(ev('m1Enabled()')===true,'M1 actif en jeu normal et en Online de même version');

  ev('goMenu()'); click('btnMode2P'); click('btnLaunchFight'); ev('skipVS()'); step(170);
  const directSeq=ev('(()=>{keys.clear(); resetFighterStats(); applyCharacterTo(p1,0); applyCharacterTo(p2,2); p1.reset(); p2.reset(); p1.x=620; p2.x=705; p1.y=p2.y=GROUND; const out=[]; for(let i=0;i<4;i++){p1.attackT=0;p1.attackType=null;p1.attack=null; startAttack(p1,"m1"); out.push(p1.attackType+":"+(p1.attack.m1Label||"")+":"+(p1.attack.m1Final?"F":"-"));} return out.join("|");})()');
  assert(directSeq.includes('punch:Jab Fulgurant')&&directSeq.includes('kick:Fouet du Stade')&&directSeq.includes('uppercut:Jugement Ascendant:F'),'Gideon : Poing répété déroule Jab → Direct → Fouet → Jugement Ascendant ('+directSeq+')');
  assert(ev('p1.attack.launcher')>0&&ev('p1.stats.m1Chains')>=1,'final M1 de Gideon : launcher réel et chaîne comptabilisée');
  ev('p1.attackT=0; p1.attackType=null; p1.attack=null; startAttack(p1,"kick");');
  assert(ev('p1.m1Next')===0&&ev('p1.m1ChainT')===0,'une technique manuelle remplace proprement la chaîne M1 en cours');

  const m1Failures=[];
  for(let i=0;i<41;i++){
    const len=ev(`m1SignatureFor(CHARACTERS[${i}]).steps.length`);
    ev(`keys.clear(); resetFighterStats(); applyCharacterTo(p1,${i}); applyCharacterTo(p2,2); p1.reset(); p2.reset(); p1.x=620; p2.x=705; p1.y=p2.y=GROUND; p1.vx=p2.vx=0; p1.vy=p2.vy=0; p1.facing=1; p2.facing=-1; p2.health=p2.maxHealth; projectiles=[]; floaters=[];`);
    for(let t=0;t<36;t++){
      if(ev('p1.stats.m1Finishers')>=1)break;
      press('KeyF',1); step(2);
    }
    step(4);
    const hits=ev('p1.stats.m1Hits'),fin=ev('p1.stats.m1Finishers'),maxCombo=ev('p1.stats.maxCombo');
    if(!(hits>=len&&fin>=1&&maxCombo>=len))m1Failures.push(ev(`CHARACTERS[${i}].name`)+' '+hits+'/'+len+' fin='+fin+' combo='+maxCombo);
    ev('keys.clear(); p1.attackT=0; p2.attackT=0;');
  }
  assert(m1Failures.length===0,'martelage réel du bouton Poing : les 41 chaînes M1 touchent jusqu’au final'+(m1Failures.length?' — échecs : '+m1Failures.join(' ; '):''));
  assert(ev('renderStats.m1Trail')>0&&String(ev('renderStats.m1Fx')).includes(':'),'rendu M1 : traînées signature intensifiées et effet du combattant exposés');
  ev('goMenu(); selCharP1=6; refreshSelect(); renderMoveList();');
  assert(window.document.getElementById('moveList').textContent.includes('Croisade d’Acier')&&window.document.getElementById('moveList').textContent.includes('Levée du Serment'),'sélection : l’arsenal affiche le M1 complet du combattant choisi (KAEL)');
  assert(ev('rosterSearch="sentence des ombres"; rosterMatches(CHARACTERS[31])')===true&&ev('rosterMatches(CHARACTERS[0])')===false,'recherche roster : on peut aussi trouver un combattant par le nom de son M1');
  ev('rosterSearch=""; goMenu()');
  const eng51=fs.readFileSync(path.join(root,'src/engine.js'),'utf8'),ui51=fs.readFileSync(path.join(root,'src/ui.js'),'utf8'),html51=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert(eng51.includes('const M1_RAW=')&&eng51.includes('function startM1Attack')&&eng51.includes('martèle Poing'.replace('Poing','punch'))===false&&ui51.includes('M1 Signature — martèle POING')&&/Godson FURY ARENA V[6-9]\.\d+/.test(html51),'hooks sources V5.1 : données 41 M1, moteur de chaîne, aide et nouveau titre');

  /* ===== V5.2 « Écran Adaptatif & Joystick Pro » : décision d'équipe Lena/Nadia/Kenzo/Marco/Sarah ===== */
  console.log('\n— V5.2 : joystick gauche, actions à droite & formats d’écran —');
  assert(/^(5\.[23]|[6-9]\.\d+)\.\d+$/.test(ev('GAME_VERSION'))&&ev('SETTINGS.screenFormat')==='adaptatif'&&window.document.body.classList.contains('screen-adaptatif'),'format par défaut validé par l’équipe : Adaptatif');
  assert(!!window.document.getElementById('joyBase')&&!!window.document.getElementById('joyKnob'),'joystick tactile présent en bas à gauche avec bouton mobile');
  assert(!window.document.querySelector('.tBtn[data-t="left"]')&&!window.document.querySelector('.tBtn[data-t="right"]')&&!window.document.querySelector('.tBtn[data-t="jump"]'),'anciens boutons directionnels supprimés : le joystick remplace gauche/droite/saut');
  assert([...window.document.querySelectorAll('.actionGroup .tBtn')].map(b=>b.dataset.t).join(',')==='special,dash,block,kick,punch','cluster droit ergonomique : Spécial, Dash, Garde, Pied et grand POING•M1');
  assert(ev('joystickKeysForVector(1,0).right')===true&&ev('joystickKeysForVector(-1,-1).left')===true&&ev('joystickKeysForVector(-1,-1).jump')===true&&ev('joystickKeysForVector(0,1).block')===true&&ev('joystickDirectionLabel(0,1)')==='garde','mapping joystick 8 directions : course, saut diagonal et garde vers le bas');
  ev('clearTouchInputs(); setJoystickVector(1,0,777);');
  assert(ev('touchIn.right')===true&&ev('joystickState.direction')==='droite'&&window.document.getElementById('joyBase').classList.contains('active')&&window.document.getElementById('joyKnob').style.transform.includes('34.0px'),'joystick poussé à droite : entrée moteur, état visuel et déplacement du bouton');
  ev('setJoystickVector(-1,-1,777);');
  assert(ev('touchIn.left')===true&&ev('touchIn.jump')===true&&ev('joystickState.direction')==='saut-gauche','joystick diagonal haut-gauche : déplacement + saut simultanés');
  ev('setJoystickVector(0,1,777);');
  assert(ev('touchIn.block')===true&&ev('joystickState.direction')==='garde','joystick vers le bas : garde / modificateur uppercut-balayage');
  ev('resetJoystick();');
  assert(ev('joystickState.active')===false&&ev('touchIn.left')===false&&ev('touchIn.jump')===false&&ev('touchIn.block')===false,'relâcher le joystick remet toutes les directions au neutre');
  assert(ev('applyScreenFormat("plein")')==='plein'&&window.document.body.classList.contains('screen-plein')&&ev('applyScreenFormat("cinema")')==='cinema'&&window.document.body.classList.contains('screen-cinema')&&ev('applyScreenFormat("adaptatif")')==='adaptatif'&&window.document.body.classList.contains('screen-adaptatif'),'trois formats commutables sans recharger : Plein cadre, Cinéma 16:9, Adaptatif');

  ev('goMenu()'); click('btnMode2P'); click('btnLaunchFight'); ev('skipVS()'); step(170);
  ev('keys.clear(); clearTouchInputs(); p1.reset(); p2.reset(); p1.x=500; p2.x=900; p1.y=p2.y=GROUND; p1.facing=1; p2.facing=-1;');
  const joyX0=ev('p1.x');
  ev('setJoystickVector(1,0,901);'); step(18);
  assert(ev('p1.x')>joyX0+20,'combat réel : pousser le joystick à droite déplace le Joueur 1 ('+Math.round(joyX0)+' -> '+Math.round(ev('p1.x'))+')');
  ev('resetJoystick(); p1.reset(); p2.reset(); p1.x=500; p2.x=900; p1.y=p2.y=GROUND; setJoystickVector(0,-1,902);'); step(4);
  assert(ev('p1.grounded')===false||ev('p1.vy')<0,'combat réel : pousser le joystick vers le haut fait sauter');
  ev('resetJoystick();'); step(55);
  ev('p1.reset(); p2.reset(); p1.x=500; p2.x=900; p1.y=p2.y=GROUND; setJoystickVector(0,1,903);'); step(3);
  assert(ev('p1.crouching')===true&&ev('p1.blocking')===true,'combat réel : pousser le joystick vers le bas met en garde');
  ev('resetJoystick(); clearTouchInputs(); goMenu()');
  const css52=fs.readFileSync(path.join(root,'src/style.css'),'utf8'),ui52=fs.readFileSync(path.join(root,'src/ui.js'),'utf8'),html52=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert(css52.includes('--stage-w:min(100dvw')&&css52.includes('.joyBase{')&&css52.includes('#touchUI{\n  position:fixed')&&css52.includes('body.screen-plein #game')&&html52.includes('viewport-fit=cover')&&html52.includes('id="setScreenFormat"')&&ui52.includes('function bindJoystick()')&&ui52.includes('function applyScreenFormat'),'hooks sources V5.2 : scène responsive, joystick, safe-areas et réglage de format');

  /* ===== V5.3 « Graphismes AAA II » : ombres portées, impacts sprites, tenues des planches ===== */
  console.log('\n— V5.3 : Graphismes AAA II (Kenzo + Marco, render-only) —');
  assert(/^[6-9]\.\d+\.\d+$/.test(ev('GAME_VERSION'))&&ev('renderStats.artDirection').includes('Graphismes AAA II'),'direction artistique génération 6+ : Réalité 3D avec repli Graphismes AAA II');
  assert(ev('Object.keys(BOARD_OUTFIT_MOTIFS).length')===41&&ev('CHARACTERS.every(c=>!!BOARD_OUTFIT_MOTIFS[String(c.id).toLowerCase()])')===true,'tenues des planches : motif explicite pour chacun des 41 combattants');
  assert(ev('BOARD_OUTFIT_MOTIFS["godson-prime"]')==='couronne'&&ev('BOARD_OUTFIT_MOTIFS["zara"]')==='vague'&&ev('BOARD_OUTFIT_MOTIFS["kael"]')==='lame'&&ev('BOARD_OUTFIT_MOTIFS["lyra-azur"]')==='aile','motifs fidèles aux identités : couronne royale, vague de Libreville, lame d’acier, aile d’Azur');
  ev('qualityLevel=2; renderStats.boardOutfits=0;');
  const boardMotifsSeen=new Set();
  for(let i=0;i<41;i++){ ev(`applyCharacterTo(p1,${i}); p1.reset(); drawFighter(p1);`); boardMotifsSeen.add(ev('renderStats.boardOutfit')); }
  assert(boardMotifsSeen.size===41&&ev('renderStats.boardOutfits')>=41,'les 41 médaillons de tenue des planches sont réellement dessinés');
  ev('applyCharacterTo(p1,0); applyCharacterTo(p2,2); p1.reset(); p2.reset(); p1.rx=560; p2.rx=760; p1.ry=p2.ry=GROUND;');
  ev('setArenaById("stadium","crepuscule"); renderStats.dynamicShadows=0; drawShadow(p1);');
  assert(ev('renderStats.dynamicShadows')===1&&ev('renderStats.shadowLayers')===3&&ev('renderStats.shadowDirection')==='longue-gauche'&&ev('renderStats.shadowHeightFactor')===1,'ombre portée AAA II : 3 couches, longue au crépuscule, pleine au sol');
  ev('p1.ry=GROUND-230; drawShadow(p1);');
  assert(ev('renderStats.shadowHeightFactor')<.55,'ombre portée : elle rétrécit et s’estompe quand le combattant s’envole ('+ev('renderStats.shadowHeightFactor')+')');
  ev('p1.ry=GROUND; setArenaById("stadium","nuit"); drawShadow(p1);');
  assert(ev('renderStats.shadowDirection')==='courte-droite','ombre portée : direction et longueur changent avec la lumière de l’arène');
  ev('renderStats.floorLightPools=0; renderStats.floorReflections=0; drawFloor(); drawReflection(p1);');
  assert(ev('renderStats.floorLightPools')===3&&ev('renderStats.floorReflections')>=1,'sol AAA II : halo de scène + reflets colorés des combattants');
  ev('impactBursts=[];');
  const hashBeforeBursts=ev('replayStateHash()');
  ev('impactBurst(640,400,"m1final","#ffc400",1.75,1); impactBurst(680,420,"block","#81d4fa",.85,-1);');
  assert(ev('impactBursts.length')===2&&ev('impactBursts[0].kind')==='m1final'&&ev('impactBursts[1].kind')==='block'&&ev('replayStateHash()')===hashBeforeBursts,'impacts sprites : événements typés 100 % visuels, hash déterministe inchangé');
  ev('renderStats.impactBurstsDrawn=0; drawEffects();');
  assert(ev('renderStats.impactBurstsDrawn')===2&&ev('renderStats.lastImpactFx')==='block:#81d4fa'&&ev('impactSprite("m1final","#ffc400")===impactSprite("m1final","#ffc400")')===true,'sprites d’impact dessinés depuis un cache borné (aucune régénération par frame)');
  ev('for(let k=0;k<32;k++)updateEffects();');
  assert(ev('impactBursts.length')===0,'sprites d’impact : durée courte et nettoyage automatique');
  ev('goMenu()'); click('btnMode2P'); click('btnLaunchFight'); ev('skipVS()'); step(170);
  ev('keys.clear(); clearTouchInputs(); applyCharacterTo(p1,0); applyCharacterTo(p2,2); p1.reset(); p2.reset(); p1.x=600; p2.x=690; p1.y=p2.y=GROUND; p1.facing=1; p2.facing=-1; impactBursts=[]; projectiles=[]; state="fight"; introT=0;');
  let sawM1Burst=false;
  for(let t=0;t<42&&!sawM1Burst;t++){
    if(t%3===0)ev('keys.add("KeyF")');
    step(1);
    if(t%3===0)ev('keys.delete("KeyF")');
    sawM1Burst=ev('impactBursts.some(b=>b.kind==="m1"||b.kind==="m1final")')===true;
  }
  assert(sawM1Burst&&ev('p1.stats.hits')>=1,'combat réel : un coup M1 confirmé déclenche son sprite d’impact signature');
  ev('keys.clear(); impactBursts=[]; setArenaById("stadium","auto"); applyCharacterTo(p1,0); applyCharacterTo(p2,1); p1.reset(); p2.reset(); goMenu()');
  const render53=fs.readFileSync(path.join(root,'src/render.js'),'utf8'),engine53=fs.readFileSync(path.join(root,'src/engine.js'),'utf8');
  assert(render53.includes('BOARD_OUTFIT_MOTIFS')&&render53.includes('function drawBoardMotif')&&render53.includes('function arenaShadowVector')&&render53.includes('function impactSprite')&&render53.includes('function drawImpactBursts')&&engine53.includes('function impactBurst')&&engine53.includes('"m1final"')&&engine53.includes('"parry"'),'hooks sources V5.3 : motifs 41, ombres directionnelles et impacts typés');
  /* ===== V6.0 « Réalité 3D » : WebGL maison, poses humanoïdes, arènes 3D, repli 2D ===== */
  console.log('\n— V6.0 : Réalité 3D (Kenzo + Marco + Nadia, moteur WebGL maison) —');
  assert(/^[6-9]\.\d+\.\d+$/.test(ev('GAME_VERSION'))&&/V[6-9]\.\d+/.test(window.document.title)&&/V[6-9]\.\d+/.test(window.document.querySelector('h1').textContent),'génération officielle V6+ « Réalité 3D » affichée');
  assert(ev('SETTINGS.renderer3d')==='auto'&&!!window.document.getElementById('setRenderer3d')&&!!window.document.getElementById('gl3d')&&ev('typeof draw3DScene')==='function'&&ev('typeof buildFighterPose3D')==='function','3D Réalité activée par défaut en automatique, canvas WebGL et réglage présents');
  assert(ev('(() => { const b=newBatch3D(); addBox3D(b,[0,1,0],[1,2,1],[0,.4,0],parseColor3("#ff8000")); const c=parseColor3("#ff8000"); return b.count===24&&b.idx.length===36&&c[0]===1&&Math.abs(c[1]-128/255)<.002; })()')===true,'moteur 3D : géométrie indexée et couleurs converties sans bibliothèque externe');
  ev('applyCharacterTo(p1,0); applyCharacterTo(p2,2); p1.reset(); p2.reset(); p1.rx=560; p2.rx=760; p1.ry=p2.ry=GROUND; state="fight"; computeCamera3D();');
  assert(ev('(() => { const a=project3DPoint(worldFromGame3D(560,GROUND-160,0)),b=project3DPoint(worldFromGame3D(760,GROUND-160,0)); return !!a&&!!b&&a.x<b.x&&a.y>120&&a.y<620&&renderStats.camera3d.includes(","); })()')===true,'caméra 3D : perspective et projection écran orientées correctement');
  const arenaCounts3D=ev('(() => ARENAS.map(a=>{ setArenaById(a.id,"nuit"); const built=buildArenaBatch3D(); return built.opaque.count+":"+built.trans.count; }).join(","))()');
  assert(arenaCounts3D.split(',').length===4&&arenaCounts3D.split(',').every(v=>parseInt(v.split(':')[0],10)>1000),'les 4 arènes ont un décor 3D volumique complet ('+arenaCounts3D+')');
  let poses3DOk=true, fighters3DVertices=0;
  for(let i=0;i<41;i++){
    const ok=ev(`(() => { applyCharacterTo(p1,${i}); p1.reset(); p1.rx=560; p1.ry=GROUND; const pose=buildFighterPose3D(p1),keys=["pelvis","chest","head","handFront","handBack","footFront","footBack","kneeFront","elbowFront"]; return keys.every(k=>pose.world[k].every(Number.isFinite))&&pose.world.head[1]>pose.world.chest[1]&&pose.world.chest[1]>pose.world.pelvis[1]; })()`);
    const verts=ev('(() => { const o=newBatch3D(),t=newBatch3D(); addFighter3D(o,t,p1); return o.count+t.count; })()');
    poses3DOk=poses3DOk&&ok===true; fighters3DVertices+=verts;
  }
  assert(poses3DOk&&fighters3DVertices>80000,'poses humanoïdes 3D valides pour les 41 combattants ('+fighters3DVertices+' sommets générés)');
  const hashBeforePose3D=ev('replayStateHash()');
  ev('(() => { const o=newBatch3D(),t=newBatch3D(); addFighter3D(o,t,p1); computeCamera3D(); return o.count; })()');
  assert(ev('replayStateHash()')===hashBeforePose3D,'la couche 3D est purement visuelle : déterminisme, replays et Online inchangés');
  assert(ev('(() => { p1.reset(); p1.rx=560; p1.ry=GROUND; startAttack(p1,"punch"); p1.attackT=Math.max(1,p1.attackDur-(p1.attack.start+4)); const a=buildFighterPose3D(p1); p1.attack=null; p1.attackType=""; p1.attackT=0; p1.cooldown=0; startAttack(p1,"kick"); p1.attackT=Math.max(1,p1.attackDur-(p1.attack.start+4)); const b=buildFighterPose3D(p1); p1.attack=null; p1.attackType=""; p1.attackT=0; p1.cooldown=0; return a.phase>.65&&a.local.handFront[0]>.65&&b.phase>.65&&b.local.footFront[0]>.85&&b.local.footFront[1]>.85; })()')===true,'animations 3D : extension réelle du poing et du pied pendant les attaques');
  assert(ev('(() => { p1.crouching=true; const a=buildFighterPose3D(p1); p1.crouching=false; p1.downT=40; const b=buildFighterPose3D(p1); p1.downT=0; p1.reset(); return a.local.head[1]<1.62&&b.local.head[1]<.45&&b.local.footFront[0]>.7; })()')===true,'mouvements humains 3D : accroupissement, garde et chute au sol ont des poses dédiées');
  ev('applyRenderer3DSetting("off"); renderStats.passesRun=[]; render();');
  assert(ev('SETTINGS.renderer3d')==='off'&&ev('renderStats.renderer3dActive')===false&&ev('renderStats.passesRun.join("/")')==='background/floor/shadows/entities/projectiles/effects/post','réglage 2D classique : retour immédiat au pipeline Graphismes AAA II');
  ev('applyRenderer3DSetting("auto"); renderStats.passesRun=[]; render();');
  assert(ev('renderStats.renderer3dRequested')===true&&ev('renderStats.passesRun.join("/")')==='background/floor/shadows/entities/projectiles/effects/post','sans vrai WebGL (harnais jsdom), repli 2D propre sans bloquer le combat');
  assert(ev('draw3DScene()')===false&&ev('renderStats.renderer3dFallback.length')>0,'diagnostic 3D : la raison du repli est exposée, jamais d’écran noir silencieux');
  assert(ev('(() => { const oldParticles=particles; particles=[{x:640,y:400,life:15,max:30,r:4,c:"#00e5ff"}]; const pts=buildParticles3D(); particles=oldParticles; return pts.count===1&&pts.sizes[0]>.07&&pts.sizes[0]<.1; })()')===true,'particules 3D : diamètre exprimé en mètres monde, aucun point géant à l’écran');
  const render60=fs.readFileSync(path.join(root,'src/render3d.js'),'utf8'),css60=fs.readFileSync(path.join(root,'src/style.css'),'utf8'),html60=fs.readFileSync(path.join(root,'index.html'),'utf8'),ui60=fs.readFileSync(path.join(root,'src/ui.js'),'utf8');
  assert(render60.includes('function buildFighterPose3D')&&render60.includes('function buildArenaBatch3D')&&render60.includes('function computeCamera3D')&&render60.includes('webgl2')&&css60.includes('body.render3d-on #gl3d')&&html60.includes('id="setRenderer3d"')&&ui60.includes('function applyRenderer3DSetting'),'hooks sources V6.0 : WebGL, caméra, arènes, CSS et réglage synchronisés');
  ev('setArenaById("stadium","auto"); applyCharacterTo(p1,0); applyCharacterTo(p2,1); p1.reset(); p2.reset(); goMenu()');

  /* ===== V6.1 « Maquettes Vivantes & 2v2 deux téléphones » ===== */
  console.log('\n— V6.1 : zéro gel, personnages des maquettes, interface-décor et 2v2 Relais —');
  assert((ev('GAME_VERSION')==='6.1.0'||/^7\.\d+\.0$/.test(ev('GAME_VERSION')))&&/V(6\.1|7\.\d+)/.test(window.document.title)&&/V(6\.1|7\.\d+)/.test(window.document.querySelector('h1').textContent)&&ev('renderStats.artDirection').includes('Graphismes AAA II'),'acquis V6.1 conservés : Maquettes Vivantes & 2v2 deux téléphones restent affichés et fonctionnels');
  const runtime61=['src/engine.js','src/render.js','src/render3d.js','src/ui.js','index.html'].map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
  assert(!/(hitstop|hitStopT|slowmoT)/.test(runtime61),'runtime V6.1 verrouillé : aucun mécanisme de gel ou de ralenti d’impact ne subsiste');
  assert(ev('Object.keys(BOARD_MODEL3D).length')===41&&ev('CHARACTERS.every(c=>!!BOARD_MODEL3D[c.id]&&boardModel3D({char:c})===BOARD_MODEL3D[c.id])')===true,'maquettes 3D : fiche morphologique explicite réellement résolue pour chacun des 41 combattants, casse des IDs comprise');
  assert(ev('(() => { const models=Object.values(BOARD_MODEL3D),sig=new Set(models.map(m=>[m.frame,m.top,m.head,m.hair,m.weapon,m.gear,m.muscle,m.chest,m.waist,m.shoulders].join("/"))); return sig.size>=38&&models.some(m=>m.muscle>=1.3)&&models.some(m=>m.muscle<=.5)&&models.some(m=>m.frame==="robot")&&models.some(m=>m.frame==="powerArmor")&&models.some(m=>m.frame==="feminine")&&models.some(m=>m.frame==="colossus"); })()')===true,'silhouettes des maquettes : muscles, épaules, taille, hanches et familles de corps réellement différenciés');
  assert(ev('BOARD_MODEL3D.kael.weapon==="sword"&&BOARD_MODEL3D.kael.top==="plate"&&BOARD_MODEL3D.sora.head==="wizard"&&BOARD_MODEL3D.sora.weapon==="staff"&&BOARD_MODEL3D.sora.skirt>=.95&&BOARD_MODEL3D.ael.frame==="robot"&&BOARD_MODEL3D.ael.weapon==="rifle"&&BOARD_MODEL3D.vorak.muscle>=1.3&&BOARD_MODEL3D.vorak.fur===1&&BOARD_MODEL3D.brutus.head==="helmet"&&BOARD_MODEL3D.brutus.frame==="powerArmor"&&BOARD_MODEL3D.lyra.back==="none"')===true,'identités des planches respectées : armure/épée de KAEL, robe/chapeau/bâton de Sora, robot d’AEL-7, colosse de Vorak, armure lourde de Brutus');
  const board61=ev('(() => { const seen=new Set(); let vertices=0; CHARACTERS.forEach((c,i)=>{ applyCharacterTo(p1,i); p1.reset(); p1.rx=560; p1.ry=GROUND; const o=newBatch3D(),t=newBatch3D(); addFighter3D(o,t,p1); vertices+=o.count+t.count; seen.add(renderStats.boardModel3d); }); return seen.size+":"+vertices+":"+renderStats.boardModels3d; })()');
  assert(board61.startsWith('41:')&&board61.endsWith(':41')&&parseInt(board61.split(':')[1],10)>120000,'les 41 modèles des maquettes génèrent leur géométrie 3D complète ('+board61+')');
  const stageDecors61=ev('(() => ARENAS.map(a=>{ setArenaById(a.id,"nuit"); const w=document.getElementById("gameWrap"); return [w.dataset.arena,w.dataset.mood,w.style.getPropertyValue("--stage-accent"),w.style.getPropertyValue("--stage-panel"),renderStats.stageDecor].join("/"); }).join("|"))()');
  assert(stageDecors61.split('|').length===4&&stageDecors61.split('|').every(v=>v.includes('/nuit/#')&&v.includes(':nuit')),'interface construite dans le décor : les 4 arènes pilotent accents, panneaux et ambiance du HUD');
  const css61=fs.readFileSync(path.join(root,'src/style.css'),'utf8'),html61=fs.readFileSync(path.join(root,'index.html'),'utf8'),ui61=fs.readFileSync(path.join(root,'src/ui.js'),'utf8'),engine61=fs.readFileSync(path.join(root,'src/engine.js'),'utf8');
  assert(css61.includes('V6.1 — INTERFACE CONSTRUITE DANS LE DÉCOR')&&['--stage-accent','--stage-glow','--stage-deep','--stage-panel','--stage-rail'].every(v=>css61.includes(v))&&css61.includes('.fighterHud::before')&&css61.includes('.touchGroup.actionGroup'),'présentation V6.1 : scoreboard, panneaux-consoles et pods tactiles partagent les matériaux de l’arène');
  assert(html61.includes('rel="icon" href="data:image/svg+xml')&&html61.includes('id="btnModePhones"')&&html61.includes('id="localPhoneCard"')&&html61.includes('navigateurs ne savent pas ouvrir un canal de jeu Bluetooth direct'),'coque V6.1 : favicon intégré, entrée 2 téléphones et limite Bluetooth expliquée sans fausse promesse');

  ev('mode="2p"; configureTeamMatch({format:"team2v2",hostTeam:[6,12],guestTeam:[7,8],hostChar:6,guestChar:7}); applyCharacterTo(p1,6); applyCharacterTo(p2,7); p1.roundWins=0; p2.roundWins=0; round=1; beginMatch();');
  assert(ev('teamMatch.active')===true&&ev('roundsToWin()')===2&&ev('p1.char.id')==='kael'&&ev('p2.char.id')==='sora'&&window.document.getElementById('roundLabel').textContent.includes('2V2'),'2v2 Relais lancé : KAEL contre Sora, victoire à deux éliminations');
  assert(ev('JSON.stringify(replayRecorder.meta.context.team)')==='{"p1":[6,12],"p2":[7,8]}','replay 2v2 : les deux équipes complètes sont enregistrées pour une relecture déterministe');
  step(145); ev('p2.health=0; endRound(p1,true,"ko");');
  assert(ev('state')==='roundEnd'&&ev('p1.roundWins')===1&&ev('p2.char.id')==='sora','premier segment : Sora est éliminée, score d’équipe 1–0');
  ev('roundEndT=1;'); step(1);
  assert(ev('state')==='intro'&&ev('round')===2&&ev('p1.char.id')==='kael'&&ev('p2.char.id')==='ael'&&ev('teamMatch.p2.index')===1&&ev('p2.health')===ev('p2.maxHealth'),'relève automatique : AEL-7 remplace Sora à pleine vie, KAEL reste en piste');
  step(145); ev('p2.health=0; endRound(p1,true,"ko"); roundEndT=1;'); step(1);
  assert(ev('state')==='matchEnd'&&ev('p1.roundWins')===2&&ev('lastWinner')===ev('p1')&&ev('lastReplayData.context.team.p2.join("-")')==='7-8','fin du 2v2 : les deux combattants adverses éliminés, victoire d’équipe et replay finalisé');
  ev('clearTeamMatch(); goMenu(); applyCharacterTo(p1,0); applyCharacterTo(p2,1); p1.reset(); p2.reset();');

  click('btnModePhones');
  const localMain61=window.document.getElementById('localFighterMain'); localMain61.value='6'; localMain61.dispatchEvent(new window.Event('change',{bubbles:true}));
  window.document.getElementById('onlineFighterReserve').value='12'; window.document.getElementById('localMatchFormat').value='team2v2';
  assert(!window.document.getElementById('menuOnline').classList.contains('hidden')&&window.document.getElementById('onlineFighter').value==='6'&&ev('localSelectedTeam().join("-")')==='6-12','disposition locale : combattant principal, réserviste et format sont ensemble dans la carte 2 téléphones');
  const localCfg61=ev('(() => { const c=buildLocalHostConfig(),m=mergeLocalGuestConfig(c,{guestName:"Invitée Locale",guestChar:7,guestTeam:[7,7],guestCountry:"ga",guestInitial:"il",guestSkin:{primary:"#123456",accent:"#abcdef"}}); return [c.format,c.hostTeam.join("-"),m.guestTeam.join("-"),m.localOnly,m.guestName,m.guestCountry].join("|"); })()');
  assert(localCfg61==='team2v2|6-12|7-8|true|Invitée Locale|GA','config deux téléphones : équipes distinctes, identité invitée assainie et match explicitement non classé');
  assert(ev('(() => { configureTeamMatch({format:"duel",hostTeam:[6,12],guestTeam:[7,8]}); const duelRespected=!teamMatch.active&&teamMatch.format==="duel"; configureTeamMatch({format:"team2v2",hostTeam:[6,12],guestTeam:[7,8]}); const teamRespected=teamMatch.active; clearTeamMatch(); return duelRespected&&teamRespected; })()')===true,'format explicite prioritaire : le Duel 1v1 reste un duel même si une config transporte des réservistes');
  assert(ui61.includes('"GF61."')&&ui61.includes('CompressionStream')&&ui61.includes('DecompressionStream')&&ui61.includes('{iceServers:[]}')&&ui61.includes('function waitForIceGathering')&&ui61.includes('async function createLocalPhoneInvite')&&ui61.includes('async function acceptLocalPhoneInvite')&&ui61.includes('async function finalizeLocalPhoneAnswer')&&ui61.includes('navigator.share')&&ui61.includes('start-ready')&&ui61.includes('pendingStartConfig'),'hooks sources V6.1 : codes GF61 compressés, ICE local sans STUN/Supabase, invitation/réponse/finalisation et partage système');
  assert(engine61.includes('function configureTeamMatch')&&engine61.includes('function prepareTeamRelayNext')&&engine61.includes('function sanitizeTeamChars')&&engine61.includes('teamMatch.p1.index')&&engine61.includes('team:(typeof teamMatchForReplay'),'hooks moteur V6.1 : relève déterministe, équipes assainies, hash et contexte replay synchronisés');
  ev('goMenu()');

  /* ===== V7.0 « Anatomie AAA » : volumes loftés, matières, ombres et posture 3/4 ===== */
  console.log('\n— V7.0 : Anatomie AAA (Kenzo + Marco + Nadia, personnages sculptés) —');
  assert(/^7\.\d+\.0$/.test(ev('GAME_VERSION'))&&/V7\.\d+/.test(window.document.title)&&/V7\.\d+/.test(window.document.querySelector('h1').textContent)&&ev('renderStats.artDirection').includes('Anatomie'),'génération officielle V7 affichée (Anatomie AAA → Réalité 3D II)');
  assert(ev('(() => { const b=newBatch3D(); addBox3D(b,[0,1,0],[1,2,1],[0,.4,0],materialColor3("#c68642","skin")); const skin=materialColor3("#c68642","skin"),metal=materialColor3("#90a4ae","metal"); return b.uv.length===b.count*2&&b.mat.length===b.count*3&&skin[5]===1&&skin[8]===1&&metal[5]===4&&metal[7]>.8; })()')===true,'matières V7 : UV atlas + rugosité/métal/peau par sommet, sans asset externe');
  assert(ev('(() => { const b=newBatch3D(); addLoftedTube3D(b,[[0,0,0],[0,.5,.05],[0,1,0]],[.08,.1,.06],materialColor3("#455a64","fabric"),12,[0,0,1]); addAnatomyLimb3D(b,[0,1,0],[0,1.8,.1],.08,.06,materialColor3("#c68642","skin"),"upper",1); return b.count>150&&b.idx.every(i=>i>=0&&i<b.count)&&b.pos.every(Number.isFinite)&&b.norm.every(Number.isFinite); })()')===true,'géométrie V7 : tubes loftés et membres musculaires indexés, finis et fermés');
  const anatomy70=ev('(() => { let total=0,min=1e9; CHARACTERS.forEach((c,i)=>{ applyCharacterTo(p1,i); p1.reset(); p1.rx=560; p1.ry=GROUND; const o=newBatch3D(),t=newBatch3D(); addFighter3D(o,t,p1); const n=o.count+t.count; total+=n; min=Math.min(min,n); }); return total+":"+min+":"+renderStats.lastFighterVertices3d; })()');
  assert(parseInt(anatomy70.split(':')[0],10)>420000&&parseInt(anatomy70.split(':')[1],10)>7000&&parseInt(anatomy70.split(':')[2],10)>7000,'anatomie V7 : les 41 combattants dépassent le seuil de sculpture complète ('+anatomy70+' sommets)');
  assert(ev('(() => { applyCharacterTo(p1,6); applyCharacterTo(p2,7); p1.reset(); p2.reset(); p1.rx=560; p2.rx=730; p1.ry=p2.ry=GROUND; p1.facing=1; p2.facing=-1; const a=buildFighterPose3D(p1),b=buildFighterPose3D(p2); return Math.abs(a.twist)>.3&&Math.abs(a.twist)<.42&&Math.abs(b.twist)>.3&&Math.abs(b.twist)<.42&&Math.abs((a.torsoYaw-a.yaw)+a.twist)<.12&&a.world.head[2]>0.015&&b.world.head[2]>0.015; })()')===true,'posture V7 : torsion progressive 3/4 hanches→poitrine→tête des deux côtés');
  assert(ev('(() => { applyCharacterTo(p1,6); p1.reset(); p1.rx=560; p1.ry=GROUND; const before=replayStateHash(),o=newBatch3D(),t=newBatch3D(); addFighter3D(o,t,p1); computeCamera3D(); const vp=computeLightVP3D(); return replayStateHash()===before&&vp.length===16&&vp.every(Number.isFinite)&&bodyDetail3().sector>=20&&headDetail3().sector>=24; })()')===true,'V7 render-only : hash déterministe inchangé, shadow-camera valide et détail haute fidélité actif');
  const render70=fs.readFileSync(path.join(root,'src/render3d.js'),'utf8');
  assert(['function convertShader3003D','#version 300 es','function createMaterialAtlas3D','function vertRaw3','function detailLow3','function addLoftedTube3D','function addAnatomyLimb3D','function addLoftedTorso3D','function addSculptedHead3D','function addHand3D','function addBoot3D','function addHairLocks3D','function addGarmentDetails3D','function ensureShadowTarget3D','function renderShadowMap3D','perturbNormal3D','Uint32Array','shadowInterval'].every(h=>render70.includes(h)),'hooks sources V7 : atlas de matières, sculpture loftée, visage/mains/bottes, bump, shadow-map cadencée et indices 32 bits');
  assert(ev('(() => { const c=withMaterial3(parseColor3("#ffffff"),"hair"); const uvA=atlasUV3([1.25,2.5],5),uvB=atlasUV3([.25,.5],5); return c[5]===5&&Math.abs(uvA[0]-uvB[0])<1e-9&&Math.abs(uvA[1]-uvB[1])<1e-9&&typeof createMaterialAtlas3D==="function"&&typeof ensureShadowTarget3D==="function"; })()')===true,'atlas V7 : tuiles matière répétables et cibles d’ombre encapsulées avec repli propre');
  ev('applyCharacterTo(p1,0); applyCharacterTo(p2,1); p1.reset(); p2.reset(); goMenu()');


  /* ===== V7.1 « Tournoi & Saisons » : brackets locaux 4/8/16, points et titres ===== */
  console.log('\n— V7.1 : Tournoi & Saisons (Nadia + Lena + Sarah, brackets persistants) —');
  assert(ev('TOURNAMENT_FORMATS.legendes.size')===16&&window.document.getElementById('menuTournament')&&ev('CURRENT_SEASON.name').includes('Aurore de Libreville'),'héritage V7.1 : Tournoi & Saisons toujours intégrés à l’édition courante');
  assert(ev('(() => { const legacy=defaultProfile(); delete legacy.career.season; delete legacy.career.activeTournament; const n=normalizeProfileData(legacy); return n.career.season.id===CURRENT_SEASON.id&&n.career.season.points===0&&n.career.activeTournament===null&&Array.isArray(n.career.season.history); })()')===true,'migration V7.1 : une ancienne carrière reçoit Saison 1 et emplacement de bracket sans perdre ses données');
  assert(ev('(() => { const f=TOURNAMENT_FORMATS; return f.express.size===4&&f.godson.size===8&&f.legendes.size===16&&f.express.placementPoints[1]===160&&f.godson.placementPoints[1]===260&&f.legendes.placementPoints[1]===420&&SEASON_TIERS.length===5&&SEASON_TIERS.every((t,i)=>i===0||t.points>SEASON_TIERS[i-1].points)&&SEASON_TIERS.every(t=>t.xp>0&&t.coins>0); })()')===true,'formats et saison : 3 coupes 4/8/16, barème de champion croissant et 5 paliers monotones');
  ev('(() => { tournament=defaultTournamentState(); careerData().activeTournament=null; const s=seasonData(); s.points=0; s.claimed={}; s.tournaments=0; s.matchWins=0; s.titles={express:0,godson:0,legendes:0}; s.bestPlacementRank=0; s.bestPlacement=""; s.history=[]; s.lastTournament=null; saveProfile(); return true; })()');
  const bracketShapes71=ev('(() => ["express","godson","legendes"].map(id=>{ if(tournament&&(tournament.status==="preview"||tournament.status==="active"))abandonTournament(); const t=setupTournamentRun(id,6,9917); const out=[t.size,t.entrants.length,new Set(t.entrants.map(e=>e.char)).size,t.entrants.filter(e=>e.player).length,t.rounds.map(r=>r.matches.length).join("-"),t.entrants.some(e=>e.char===4)].join(":"); abandonTournament(); return out; }).join("|"))()');
  assert(bracketShapes71==='4:4:4:1:2-1:true|8:8:8:1:4-2-1:true|16:16:16:1:8-4-2-1:true','tirages V7.1 : entrants uniques, un seul joueur et tableaux complets — GODSON PRIME garanti en Légendes ('+bracketShapes71+')');
  const bracketSig71a=ev('(() => { const t=setupTournamentRun("godson",0,71041); return t.entrants.map(e=>e.char+":"+e.seed).join(",")+"|"+t.rounds[0].matches.map(m=>m.winner==null?"-":m.winner).join(",")+"|"+tournamentCurrentOpponent().char; })()');
  const bracketSig71b=ev('(() => { abandonTournament(); const t=setupTournamentRun("godson",0,71041); return t.entrants.map(e=>e.char+":"+e.seed).join(",")+"|"+t.rounds[0].matches.map(m=>m.winner==null?"-":m.winner).join(",")+"|"+tournamentCurrentOpponent().char; })()');
  assert(bracketSig71a===bracketSig71b&&bracketSig71a.split('|')[1].split(',').filter(v=>v==='-').length===1,'simulation CPU déterministe : même graine, mêmes têtes de série et mêmes qualifiés — seul le match du joueur attend');
  const resume71=ev('(() => { tournament.started=true; tournament.status="active"; persistTournamentState(); const sig=tournament.entrants.map(e=>e.char).join("-"); tournament=defaultTournamentState(); syncTournamentFromProfile(); return [tournament.status,tournament.seed,tournament.entrants.map(e=>e.char).join("-")===sig,PROFILE.career.activeTournament&&PROFILE.career.activeTournament.seed].join("|"); })()');
  assert(resume71==='active|71041|true|71041','persistance V7.1 : un bracket actif sauvegardé dans la carrière se recharge exactement');
  ev('(() => { abandonTournament(); const s=seasonData(); s.points=0; s.tournaments=0; s.matchWins=0; s.titles={express:0,godson:0,legendes:0}; s.history=[]; s.lastTournament=null; setupTournamentRun("express",0,4242); tournament.started=true; tournament.status="active"; mode="tournament"; const o=tournamentCurrentOpponent(); applyCharacterTo(p1,tournament.playerChar); applyCharacterTo(p2,o.char); p1.reset(); p2.reset(); p1.roundWins=2; p2.roundWins=1; return completeTournamentPlayerMatch(p1); })()');
  assert(ev('tournament.status')==='active'&&ev('tournament.currentRound')===1&&ev('tournament.playerWins')===1&&ev('tournament.lastResult.complete')===false&&ev('tournament.rounds[1].matches[0].a')!==null&&ev('tournament.rounds[1].matches[0].b')!==null,'avancement de bracket : victoire en demi-finale, autre affiche CPU résolue et finale complète');
  const champion71=ev('(() => { const o=tournamentCurrentOpponent(); applyCharacterTo(p2,o.char); p2.reset(); p1.roundWins=2; p2.roundWins=0; const ok=completeTournamentPlayerMatch(p1),pointsAfter=seasonData().points,again=recordTournamentCompletion(); return [ok,tournament.status,tournament.placementRank,tournament.entrants[tournament.champion].player,pointsAfter,seasonData().points,again,seasonData().titles.express,seasonData().tournaments,PROFILE.career.activeTournament].join("|"); })()');
  assert(champion71==='true|complete|1|true|180|180|180|1|1|','champion V7.1 : 160 pts de coupe + 2×10 pts de victoire, enregistrés une seule fois ('+champion71+')');
  const loss71=ev('(() => { const before=seasonData().points; setupTournamentRun("godson",2,777); tournament.started=true; tournament.status="active"; mode="tournament"; const o=tournamentCurrentOpponent(); applyCharacterTo(p1,tournament.playerChar); applyCharacterTo(p2,o.char); p1.reset(); p2.reset(); p1.roundWins=0; p2.roundWins=2; const ok=completeTournamentPlayerMatch(p2); return [ok,tournament.status,tournament.placementRank,tournament.placement,seasonData().points-before,tournament.champion!==tournament.playerEntrant,tournament.rounds.every(r=>r.matches.every(m=>m.winner!=null))].join("|"); })()');
  assert(loss71==='true|complete|5|Quart de finaliste|35|true|true','élimination V7.1 : classement de quart, 35 pts et champion CPU simulé jusqu’au bout ('+loss71+')');
  const reward71=ev('(() => { const c=careerData(),s=seasonData(),before=[c.xp,c.Godson]; s.points=250; s.claimed={}; c.titles=c.titles.filter(t=>t!=="Champion de la Marée"); c.title=""; const first=claimSeasonReward("maree"),second=claimSeasonReward("maree"),dx=c.xp-before[0],dc=c.Godson-before[1],equipped=c.title; toggleSeasonTitle("maree"); const off=c.title; toggleSeasonTitle("maree"); return [first,second,dx,dc,equipped,c.titles.includes("Champion de la Marée"),off,c.title].join("|"); })()');
  assert(reward71==='true|false|175|125|Champion de la Marée|true||Champion de la Marée','palier de saison : Marée se réclame une fois, crédite XP/Godson et son titre s’équipe ou se retire');
  click('btnModeTournament');
  assert(!window.document.getElementById('menuTournament').classList.contains('hidden')&&window.document.querySelectorAll('[data-tournament-format]').length===3&&window.document.querySelectorAll('[data-season-reward]').length===5&&window.document.querySelectorAll('.bracketMatch').length===7,'DOM Tournoi : 3 coupes, 5 paliers et dernier bracket 8 complet affichés');
  window.document.querySelector('[data-tournament-format="express"]').click();
  assert(ev('tournament.formatId')==='express'&&ev('tournament.status')==='preview'&&window.document.querySelectorAll('.bracketMatch').length===3&&window.document.getElementById('btnTournamentPlay').disabled===false,'DOM Coupe Express : tirage immédiat, 2 demis + finale et bouton de match actif');
  click('btnTournamentCareer');
  assert(!window.document.getElementById('menuCareer').classList.contains('hidden')&&window.document.getElementById('careerTournament').textContent.includes('Aurore de Libreville')&&window.document.querySelectorAll('[data-quest]').length>=16,'Carrière V7.1 : résumé de Saison 1 et nouvelles quêtes de tournoi intégrés');
  window.document.querySelector('[data-open-tournament]').click();
  click('btnTournamentPlay');
  assert(ev('state')==='select'&&ev('pendingMode')==='tournament'&&ev('p2.charIndex')===ev('tournamentCurrentOpponent().char')&&window.document.getElementById('rosterP2').style.pointerEvents==='none'&&window.document.getElementById('launchSummary').textContent.includes('Coupe Express'),'sélection de tournoi : adversaire et arène du bracket imposés, ton combattant confirmé');
  click('btnLaunchFight'); ev('skipVS()'); step(170);
  assert(ev('state')==='fight'&&ev('mode')==='tournament'&&ev('botDiff')==='facile'&&ev('tournament.started')===true&&ev('tournament.status')==='active'&&ev('replayRecorder.meta.context.tournament.formatId')==='express','match réel de bracket : simulation normale, difficulté du format et contexte replay de tournoi');
  winCurrentMatch();
  assert(ev('state')==='matchEnd'&&ev('tournament.playerWins')===1&&ev('tournament.currentRound')===1&&ev('tournament.lastResult.win')===true&&ev('lastReplayData.context.tournament.roundIndex')===0,'fin de match intégrée : victoire comptée, finale débloquée et replay rattaché à la demi-finale');
  click('btnNextStage');
  assert(!window.document.getElementById('menuTournament').classList.contains('hidden')&&ev('tournament.status')==='active'&&window.document.getElementById('tournamentStatus').textContent.includes('Finale'),'retour de match : le bouton principal rouvre le bracket directement sur la finale');
  const engine71=fs.readFileSync(path.join(root,'src/engine.js'),'utf8'),ui71=fs.readFileSync(path.join(root,'src/ui.js'),'utf8'),html71=fs.readFileSync(path.join(root,'index.html'),'utf8'),css71=fs.readFileSync(path.join(root,'src/style.css'),'utf8');
  assert(['const CURRENT_SEASON','const SEASON_TIERS','const TOURNAMENT_FORMATS','function setupTournamentRun','function simulateTournamentMatch','function completeTournamentPlayerMatch','function claimSeasonReward','function syncTournamentFromProfile','function tournamentForReplay'].every(h=>engine71.includes(h))&&['function renderTournament','function startTournament','function playTournamentMatch','id:"tournament-first"'].every(h=>ui71.includes(h))&&['id="btnModeTournament"','id="menuTournament"','id="tournamentBracket"','id="careerTournament"'].every(h=>html71.includes(h))&&['.bracketGrid','.seasonTier','.mc-tournament'].every(h=>css71.includes(h)),'hooks sources V7.1 : moteur de bracket/saison, écran dédié, Carrière et styles paysage synchronisés');
  assert(ev('(() => { const c=careerData(); c.season={id:"saison-archive-test",points:777,claimed:{},tournaments:9,matchWins:20,titles:{express:1,godson:2,legendes:0},bestPlacementRank:2,bestPlacement:"Finaliste",history:[],archive:[],lastTournament:null}; const s=seasonData(); return s.id===CURRENT_SEASON.id&&s.points===0&&s.archive.length===1&&s.archive[0].points===777&&s.archive[0].tournaments===9; })()')===true,'rotation future : une ancienne saison est archivée avant la réinitialisation de la nouvelle');
  ev('if(tournament&&(tournament.status==="preview"||tournament.status==="active"))abandonTournament(); applyCharacterTo(p1,0); applyCharacterTo(p2,1); p1.reset(); p2.reset(); goMenu()');

  /* ===== V7.2 « Réalité 3D II » : anatomie humaine, matières, caméra & HUD ===== */
  console.log('\n— V7.2 : Réalité 3D II (Kenzo + Marco + Lena, proportions humaines) —');
  assert(/^7\.[2-9]\.\d+$/.test(ev('GAME_VERSION'))&&/V7\.[2-9]/.test(window.document.title)&&ev('renderStats.artDirection').includes('Réalité 3D II'),'édition Réalité 3D II (V7.2+) affichée');
  assert(ev('(() => { applyCharacterTo(p1,6); applyCharacterTo(p2,7); p1.reset(); p2.reset(); p1.rx=560; p2.rx=730; p1.ry=p2.ry=GROUND; const a=buildFighterPose3D(p1),b=buildFighterPose3D(p2),wA=a.local.shoulderFront[2]-a.local.shoulderBack[2],wB=b.local.shoulderFront[2]-b.local.shoulderBack[2],feet=Math.abs(a.local.footFront[2]-a.local.footBack[2]); return wA>.4&&wA<.58&&wB>.34&&wB<.5&&wB<wA&&a.local.head[1]>1.6&&feet>.28; })()')===true,'proportions V7.2 : épaules d’environ 48 cm, silhouette féminine distincte et appuis écartés');
  assert(ev('(() => { const keep=currentArena,counts=ARENAS.map(a=>{ currentArena=a; return buildArenaBatch3D().opaque.count; }); currentArena=keep; return counts.length===4&&counts.every(c=>c>500); })()')===true,'arènes V7.2 : les quatre décors volumiques se génèrent sans erreur avec leur géométrie enrichie');
  const render72=fs.readFileSync(path.join(root,'src/render3d.js'),'utf8'),css72=fs.readFileSync(path.join(root,'src/style.css'),'utf8');
  assert(['float vnoise','camDist3D','ringSkirt3D','palette=color&&color.main','Réalité 3D II V7.2','shoulderScale3','addWeapon3D'].every(h=>render72.includes(h))&&css72.includes('V7.2 RÉALITÉ 3D II'),'hooks sources V7.2 : grain procédural, caméra dynamique, torse bicolore, jupes volumiques et HUD compact');
  ev('applyCharacterTo(p1,0); applyCharacterTo(p2,1); p1.reset(); p2.reset(); goMenu()');

  /* ===== V7.3 « Plein écran forcé & Sélection claire » : demande directe du propriétaire ===== */
  console.log('\n— V7.3 : Plein écran forcé & Sélection claire (Lena + Kenzo) —');
  assert(/^7\.[3-9]\.\d+$/.test(ev('GAME_VERSION'))&&/V7\.[3-9]/.test(window.document.title),'édition Plein écran forcé (V7.3+) affichée');
  assert(!!window.document.getElementById('bootEnter')&&!window.document.getElementById('btnPortraitAnyway')&&!!window.document.getElementById('rotateHint'),'paysage forcé V7.3 : porte d’entrée plein écran, aucun bouton « continuer en portrait »');
  assert(!window.document.querySelector('#menuMain .signed').textContent.includes('M1'),'menu épuré V7.3 : la ligne signée ne contient plus de texte M1/Signature');
  const css73=fs.readFileSync(path.join(root,'src/style.css'),'utf8'),ui73=fs.readFileSync(path.join(root,'src/ui.js'),'utf8'),render73=fs.readFileSync(path.join(root,'src/render.js'),'utf8');
  assert(css73.includes('V7.3 — PLEIN ÉCRAN FORCÉ')&&css73.includes('minmax(106px')&&css73.includes('.bootEnter')&&ui73.includes('bootEnter')&&ui73.includes('(pointer:coarse)')&&!render73.includes('M1 SIGNATURE • COMBOS'),'hooks sources V7.3 : grandes cartes plein corps, entrée immersive tactile et bandeau de fond sans texte M1');

  /* ===== V7.4 « Identités de combat » : 41 postures et attaques individuelles ===== */
  console.log('\n— V7.4 : Identités de combat (Marco, une fiche par combattant) —');
  assert(ev('GAME_VERSION')==='7.4.0'&&window.document.title.includes('V7.4')&&window.document.querySelector('h1').textContent.includes('V7.4'),'édition officielle V7.4 affichée');
  assert(ev('(() => { const all=CHARACTERS.map(c=>stanceProfile3D({char:c})); return Object.keys(FIGHTER_STANCE3D).length===41&&new Set(all.map(s=>s.name)).size===41&&new Set(all.map(s=>s.punch)).size>=6&&new Set(all.map(s=>s.kick)).size>=6&&new Set(all.map(s=>s.portrait)).size>=5; })()')===true,'fiches V7.4 : 41 postures nommées uniques, au moins 6 styles de poing et 6 styles de pied');
  assert(ev('(() => { const P=i=>{ applyCharacterTo(p1,i); p1.reset(); p1.rx=560; p1.ry=GROUND; return buildFighterPose3D(p1); }; const titan=P(2),taiko=P(18),lyra=P(15),kazu=P(22); const fz=q=>Math.abs(q.local.footFront[2]-q.local.footBack[2]); return fz(titan)>fz(lyra)&&taiko.local.pelvis[1]<lyra.local.pelvis[1]-.04&&Math.abs(kazu.twist)>Math.abs(titan.twist)+.12&&(lyra.local.handFront[1]-lyra.local.chest[1])>(titan.local.handFront[1]-titan.local.chest[1])+.08; })()')===true,'postures mesurées : Titan large et carré, Taiko bas, Lyra droite garde haute, Kazu très de profil');
  assert(ev('(() => { const atk=(i,type)=>{ applyCharacterTo(p1,i); p1.reset(); p1.rx=560; p1.ry=GROUND; startAttack(p1,type); p1.attackT=Math.max(1,p1.attackDur-(p1.attack.start+4)); const q=buildFighterPose3D(p1); p1.attack=null; p1.attackType=""; p1.attackT=0; p1.cooldown=0; return q; }; const hook=atk(2,"punch"),viseur=atk(8,"punch"),hache=atk(39,"kick"),bas=atk(2,"kick"); return Math.abs(hook.local.handFront[2]-viseur.local.handFront[2])>.08&&hache.local.footFront[1]>bas.local.footFront[1]+.5; })()')===true,'attaques individuelles : crochet large contre visée droite, coup de pied hache très haut contre frappe basse');
  const render74=fs.readFileSync(path.join(root,'src/render3d.js'),'utf8'),ui74=fs.readFileSync(path.join(root,'src/ui.js'),'utf8');
  assert(['const FIGHTER_STANCE3D','function stanceProfile3D','kickPose74','renderStats.stance3d','stance.twist'].every(h=>render74.includes(h))&&ui74.includes('stanceP')&&ui74.includes('stanceProfile3D(f)'),'hooks sources V7.4 : table des 41 fiches, poses d’attaque et postures d’affiche synchronisées');
  ev('applyCharacterTo(p1,0); applyCharacterTo(p2,1); p1.reset(); p2.reset(); goMenu()');

  console.log('\n================ RÉSULTAT ================');
  if (errors.length) { console.log('❌ ' + errors.length + ' problème(s) :'); errors.forEach(e => console.log(' - ' + String(e).slice(0, 500))); process.exit(1); }
  console.log('✅ TOUS LES TESTS PASSENT — aucune erreur d’exécution.');
  process.exit(0);
}
if (v3AsyncWork) {
  v3AsyncWork.catch(e => errors.push('EXCEPTION TEST V3 ASYNC: ' + e.stack)).finally(finishTestRun);
} else finishTestRun();
