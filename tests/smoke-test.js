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
  assert(ev('p1.health') <= hpP1BeforeRiposte - 7, 'riposte renforcée (+35%) appliquée (' + hpP1BeforeRiposte + ' -> ' + ev('p1.health') + ')');
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
  for (let i = 0; i < 6; i++) { ev(`applyCharacterTo(p1,${i}); p1.reset(); render();`); }
  assert(ev('CHARACTERS.length') === 6, 'les 6 personnages se rendent sans erreur');
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
  assert(ev('CHARACTERS.every(c=>c.victoryLine&&c.victoryLine.length>12)') === true, 'les 6 combattants ont une ligne de victoire signature');
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
  for (let i = 0; i < 6; i++) {
    ev(`applyCharacterTo(p1,${i}); p1.reset(); projectiles=[{x:640,y:400,px:640,py:400,rx:640,ry:400,vx:8,vy:0,r:18,owner:p1,super:false,life:100,kind:"bolt"}]; renderStats.signatureVfx=0; qualityLevel=0; drawProjectiles();`);
    signatureStyles.add(ev('renderStats.lastSignatureVfx'));
    assert(ev('renderStats.signatureVfx') === 1, 'VFX signature actif même en qualité basse : ' + ev('CHARACTERS[' + i + '].name'));
  }
  assert(signatureStyles.size === 6, '6 signatures VFX distinctes pour les 6 combattants');
  ev('projectiles=[]; qualityLevel=2; resizeCanvas();');

  ev('clearTouchInputs(); setTouchPointer("right",101,true); setTouchPointer("right",102,true);');
  assert(ev('touchIn.right') === true && ev('touchPointerState.activePointers') === 2 && window.document.querySelector('.tBtn[data-t="right"]').classList.contains('on'), 'tactile multi-touch : deux pointeurs suivis sur le même bouton');
  ev('setTouchPointer("right",101,false);');
  assert(ev('touchIn.right') === true && ev('touchPointerState.activePointers') === 1, 'tactile : relâcher un doigt ne coupe pas le second');
  ev('setTouchPointer("right",102,false); setTouchPointer("punch",103,true); clearTouchInputs();');
  assert(ev('touchIn.right') === false && ev('touchIn.punch') === false && ev('touchPointerState.activePointers') === 0 && !window.document.querySelector('.tBtn[data-t="punch"]').classList.contains('on'), 'tactile : nettoyage complet anti-boutons collés');

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

} catch (e) {
  errors.push('EXCEPTION TEST: ' + e.stack);
}

console.log('\n================ RÉSULTAT ================');
if (errors.length) { console.log('❌ ' + errors.length + ' problème(s) :'); errors.forEach(e => console.log(' - ' + String(e).slice(0, 500))); process.exit(1); }
console.log('✅ TOUS LES TESTS PASSENT — aucune erreur d’exécution.');
process.exit(0);
