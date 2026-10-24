"use strict";
/* =====================================================================
   GÉDÉON - Godson ARENA V5.0 — JEU COMPLET : CARRIÈRE, CHAMPIONNAT & GO GAME ONLINE
   Signed: Gideon - Godson
   ===================================================================== */
const MENUS=["menuMain","menuBot","menuSelect","menuArena","menuVS","menuStory","menuCareer","menuHall","menuReplays","menuOnline","menuChallenges","menuCustomize","menuSettings","menuHow","menuPause","menuEnd"];
let settingsReturn="menuMain",vsTimeout=null,preparedCharP2=1,preparedArenaId="stadium";
/* V3.3 : le parcours Personnages -> Arène -> Difficulté ne demande le niveau
   du bot qu'à la dernière étape (sauf s'il est déjà choisi dans ce parcours). */
let flowDifficultyChosen=false,pendingLaunch=false;
let storyPhase="intro",lastHallRank=0,lastEndWinner=null,recordedMatchKey="";
/* Tactile V2.8 : suivi indépendant de chaque pointerId pour éviter
   qu’un doigt relâché coupe une touche encore tenue par un autre doigt. */
const touchActivePointers={left:new Set(),right:new Set(),jump:new Set(),block:new Set(),punch:new Set(),kick:new Set(),special:new Set(),dash:new Set()};
let touchPointerState={activePointers:0,lastKey:"",presses:0};
function refreshTouchPointerState(key){
  const set=touchActivePointers[key]; if(!set)return;
  const on=set.size>0; touchIn[key]=on;
  const btn=document.querySelector('.tBtn[data-t="'+key+'"]');
  if(btn){ btn.classList.toggle("on",on); btn.setAttribute("aria-pressed",on?"true":"false"); }
  touchPointerState.activePointers=Object.values(touchActivePointers).reduce((n,s)=>n+s.size,0);
}
function setTouchPointer(key,pointerId,active){
  const set=touchActivePointers[key]; if(!set)return false;
  const id=pointerId==null?"pointer":pointerId;
  if(active){ if(!set.has(id)){ touchPointerState.presses++; touchPointerState.lastKey=key; } set.add(id); }
  else set.delete(id);
  refreshTouchPointerState(key);
  return touchIn[key];
}
function clearTouchInputs(){
  Object.keys(touchActivePointers).forEach(k=>{ touchActivePointers[k].clear(); refreshTouchPointerState(k); });
  Object.keys(touchIn).forEach(k=>touchIn[k]=false);
  touchPointerState.activePointers=0; touchPointerState.lastKey="";
}
function showOnly(id){
  MENUS.forEach(m=>$(m).classList.toggle("hidden",m!==id));
  if(id==="menuMain"||id==="menuBot"||id==="menuHow"||id==="menuCustomize"||id==="menuCareer"||id==="menuHall"||id==="menuReplays"||id==="menuOnline"){ if(state!=="pause")state="menu"; }
  else if(id==="menuSelect"||id==="menuArena")state="select";
  else if(id==="menuVS")state="vs";
  else if(id==="menuStory")state="scene";
}
function profileRank(){
  if(typeof careerProgress==="function"){ const cp=careerProgress(); return cp.rank+" • Niv. "+cp.level; }
  return "🎓 Débutant";
}
const CHALLENGE_DEFS=[
  {id:"combo6",icon:"🌪️",name:"Tempête Gideon",desc:"Réalise un combo de 6 hits.",target:6,unit:"hits",reward:"+2 points de carrière",progress:()=>PROFILE.stats.bestCombo||0},
  {id:"parry3",icon:"✨",name:"Mur d’or",desc:"Réussis 3 parry parfaites dans un même match.",target:3,unit:"parry",reward:"+2 points de carrière",progress:()=>PROFILE.stats.bestParriesMatch||0},
  {id:"wins10",icon:"🏟️",name:"Habitué de l’Arène",desc:"Remporte 10 victoires contre le bot, en Arcade, Histoire ou Survie.",target:10,unit:"victoires",reward:"+2 points de carrière",progress:()=>PROFILE.stats.wins||0},
  {id:"survival5",icon:"🌊",name:"Domiteur de vagues",desc:"Atteins et termine la vague 5 du mode Survie.",target:5,unit:"vagues",reward:"+2 points de carrière",progress:()=>PROFILE.stats.bestSurvivalWave||0},
  {id:"arcade",icon:"🏆",name:"Roi du Championnat",desc:"Termine un circuit complet du Championnat Godson.",target:1,unit:"circuit remporté",reward:"+2 points de carrière",progress:()=>PROFILE.stats.arcadeClears||0},
  {id:"storych2",icon:"📖",name:"Saga Godson",desc:"Termine les Chapitres 1 et 2 du Mode Histoire.",target:6,unit:"combats d’Histoire",reward:"Tenue Coucher de soleil de Libreville",progress:()=>{ const st=PROFILE.story||{}; return st.chapter2Completed?6:clamp((st.progressStep||1)-1,0,6); }}
];
function challengeState(def){ const raw=def.progress()||0; return {value:Math.min(raw,def.target),raw,done:raw>=def.target,pct:clamp(Math.round(raw/def.target*100),0,100)}; }
function completedChallenges(){ return CHALLENGE_DEFS.filter(d=>challengeState(d).done).length; }
function renderChallenges(){
  const done=completedChallenges();
  $("challengeSummary").textContent=done+"/"+CHALLENGE_DEFS.length+" défis terminés • "+(done*2)+" points de carrière gagnés • Prochaine grande récompense : tenue de Libreville (Chapitre 2).";
  $("challengeList").innerHTML=CHALLENGE_DEFS.map(d=>{ const s=challengeState(d);
    return "<article class='challengeCard"+(s.done?" done":"")+"'><div class='challengeIcon'>"+d.icon+"</div><div class='challengeBody'><div class='challengeTop'><b>"+escapeHTML(d.name)+"</b><span>"+(s.done?"✅ TERMINÉ":s.value+" / "+d.target+" "+d.unit)+"</span></div><p>"+escapeHTML(d.desc)+"</p><div class='challengeBar'><i style='width:"+s.pct+"%'></i></div><small>🎁 "+escapeHTML(d.reward)+"</small></div></article>";
  }).join("");
}
function syncProfileUI(){
  const s=PROFILE.stats,storyInfo=PROFILE.story||{},top=(PROFILE.leaderboard&&PROFILE.leaderboard[0])?PROFILE.leaderboard[0].score:0;
  $("profileStats").textContent=profileRank()+" • 🏆 "+s.wins+"V • "+s.losses+"D • Combo "+s.bestCombo+" • Défis "+completedChallenges()+"/6"+(top?" • Record "+top:"");
  const chapter=(storyInfo.progressStep||1)>3?"Chapitre 2":"Chapitre 1";
  $("menuStats").textContent="🏆 "+s.matches+" match(s) • "+s.wins+" V • Combo max "+s.bestCombo+" • Histoire "+(storyInfo.chapter2Completed?"terminée":(storyInfo.progressStep||1)+"/6")+" • Survie vague "+(s.bestSurvivalWave||0);
  const lbl=$("storyProgressLabel");
  if(lbl)lbl.textContent=storyInfo.chapter2Completed?"✅ Saga terminée — Rejouer":storyInfo.chapter1Completed?"🌴 Chapitre 2 — Combat "+(storyInfo.progressStep||4)+"/6":(storyInfo.progressStep&&storyInfo.progressStep>1?"▶ Reprendre — Combat "+storyInfo.progressStep+"/6":"6 combats • GODSON PRIME à débloquer");
  if(typeof careerProgress==="function"){
    const cp=careerProgress(),setText=(id,txt)=>{ const el=$(id); if(el)el.textContent=txt; };
    setText("hubCareerRank",cp.rank); setText("hubCareerLevel","NIVEAU "+cp.level);
    setText("hubCareerTitle",cp.title?"🎖️ "+cp.title:"Ta légende commence ici");
    setText("hubCareerXp",cp.into+" / "+cp.needed+" XP — prochain niveau");
    setText("hubCareerCoins","🪙 "+cp.coins+" Godson");
    setText("hubNextObjective","🎯 Prochain objectif : "+careerNextObjective());
    const fill=$("hubXpFill"); if(fill)fill.style.width=cp.pct+"%";
  }
}
/* ---------------- CARRIÈRE V5 : QUÊTES, RÉCOMPENSES & CHAMPIONNAT ---------------- */
const CAREER_QUESTS=[
  {id:"first-steps",icon:"👣",name:"Premier pas dans l’Arène",desc:"Termine ton premier match.",target:1,unit:"match",xp:50,coins:50,progress:()=>PROFILE.stats.matches||0},
  {id:"wins5",icon:"🥊",name:"Série naissante",desc:"Remporte 5 victoires en solo ou en ligne.",target:5,unit:"victoires",xp:100,coins:75,progress:()=>PROFILE.stats.wins||0},
  {id:"wins25",icon:"🏟️",name:"Pilier de l’Arène",desc:"Remporte 25 victoires.",target:25,unit:"victoires",xp:250,coins:175,progress:()=>PROFILE.stats.wins||0},
  {id:"combo8",icon:"🌪️",name:"Artiste du combo",desc:"Réalise un combo de 8 hits.",target:8,unit:"hits",xp:150,coins:100,progress:()=>PROFILE.stats.bestCombo||0},
  {id:"polyvalent",icon:"🎭",name:"Polyvalent",desc:"Gagne avec 8 combattants différents.",target:8,unit:"combattants",xp:200,coins:150,progress:()=>Object.keys(careerData().fighterWins||{}).length},
  {id:"survival8",icon:"🌊",name:"Endurance Godson",desc:"Atteins la vague 8 en Survie.",target:8,unit:"vagues",xp:200,coins:150,progress:()=>PROFILE.stats.bestSurvivalWave||0},
  {id:"story1",icon:"📖",name:"L’Appel de l’Arène",desc:"Termine le Chapitre 1 de la Campagne.",target:1,unit:"chapitre",xp:200,coins:150,progress:()=>PROFILE.story&&PROFILE.story.chapter1Completed?1:0},
  {id:"saga",icon:"🌴",name:"Saga de Libreville",desc:"Termine toute la Campagne (Chapitres 1 et 2).",target:1,unit:"saga",xp:350,coins:250,progress:()=>PROFILE.story&&PROFILE.story.chapter2Completed?1:0},
  {id:"circuit-stade",icon:"🏟️",name:"Champion du Stade",desc:"Remporte le Circuit Stade Godson.",target:1,unit:"circuit",xp:300,coins:200,progress:()=>careerData().circuits.stade||0},
  {id:"circuit-monde",icon:"🌍",name:"Champion du Monde des Planches",desc:"Remporte le Circuit Monde (8 combats).",target:1,unit:"circuit",xp:500,coins:350,progress:()=>careerData().circuits.monde||0},
  {id:"circuit-legendes",icon:"👑",name:"Couronne des Légendes",desc:"Remporte le Circuit des Légendes (12 combats).",target:1,unit:"circuit",xp:900,coins:600,progress:()=>careerData().circuits.legendes||0},
  {id:"level10",icon:"⭐",name:"Ascension",desc:"Atteins le niveau de carrière 10.",target:10,unit:"niveaux",xp:400,coins:300,progress:()=>careerProgress().level}
];
const CAREER_SHOP=[
  {id:"title-Libreville",kind:"title",icon:"🌴",name:"Champion de Libreville",cost:150,minLevel:2,desc:"Titre honorifique affiché sur ton profil."},
  {id:"title-tokyo",kind:"title",icon:"🌃",name:"Terreur de Néon Tokyo",cost:200,minLevel:3,desc:"Titre honorifique affiché sur ton profil."},
  {id:"title-temple",kind:"title",icon:"⛩️",name:"Gardien du Temple Céleste",cost:200,minLevel:3,desc:"Titre honorifique affiché sur ton profil."},
  {id:"title-legende",kind:"title",icon:"🌌",name:"Légende Vivante",cost:750,minLevel:10,desc:"Le titre réservé aux carrières accomplies."},
  {id:"unlock-Libreville",kind:"unlock",unlockKey:"librevilleSkin",icon:"👕",name:"Tenue Coucher de soleil de Libreville",cost:300,minLevel:3,desc:"Débloque immédiatement la tenue récompense de la Campagne."},
  {id:"unlock-prime",kind:"unlock",unlockKey:"prime",icon:"👑",name:"Accès anticipé GODSON PRIME",cost:600,minLevel:5,desc:"Débloque le champion secret sans attendre la fin du Chapitre 1."}
];
function careerQuestState(def){ const raw=Math.max(0,def.progress()||0),claimed=!!careerData().questsClaimed[def.id]; return {raw,value:Math.min(raw,def.target),done:raw>=def.target,claimed,pct:clamp(Math.round(raw/def.target*100),0,100)}; }
function careerNextObjective(){
  const claimable=CAREER_QUESTS.find(d=>{ const st=careerQuestState(d); return st.done&&!st.claimed; });
  if(claimable)return "Réclame ta quête terminée : "+claimable.name+" (+"+claimable.xp+" XP, +"+claimable.coins+" Godson)";
  const next=CAREER_QUESTS.find(d=>!careerQuestState(d).done);
  if(next){ const st=careerQuestState(next); return next.name+" — "+st.value+"/"+next.target+" "+next.unit; }
  return "Toutes les quêtes sont terminées : vise le niveau 50 et le Hall of Fame !";
}
function claimCareerQuest(id){
  const def=CAREER_QUESTS.find(d=>d.id===id); if(!def)return false;
  const st=careerQuestState(def); if(!st.done||st.claimed)return false;
  careerData().questsClaimed[def.id]=true;
  awardCareer(def.xp,def.coins,"Quête : "+def.name); saveProfile(); renderCareer();
  showToast("🏆 Quête réclamée : +"+def.xp+" XP • +"+def.coins+" Godson");
  return true;
}
function careerShopState(item){
  const c=careerData(),cp=careerProgress();
  const owned=item.kind==="title"?c.titles.includes(item.name):!!(PROFILE.unlocks&&PROFILE.unlocks[item.unlockKey]);
  return {owned,equipped:item.kind==="title"&&c.title===item.name,canBuy:!owned&&cp.level>=(item.minLevel||1)&&c.Godson>=item.cost,levelOk:cp.level>=(item.minLevel||1)};
}
function buyCareerItem(id){
  const item=CAREER_SHOP.find(x=>x.id===id); if(!item)return false;
  const c=careerData(),st=careerShopState(item);
  if(st.owned){ if(item.kind==="title"){ c.title=st.equipped?"":item.name; saveProfile(); renderCareer(); showToast(st.equipped?"Titre retiré":"🎖️ Titre équipé : "+item.name); return true; } return false; }
  if(!st.levelOk){ showToast("⭐ Niveau "+item.minLevel+" requis pour : "+item.name); return false; }
  if(c.Godson<item.cost){ showToast("🪙 Godson insuffisants : "+c.Godson+" / "+item.cost); return false; }
  c.Godson-=item.cost;
  if(item.kind==="title"){ c.titles.push(item.name); c.title=item.name; }
  else { if(!PROFILE.unlocks)PROFILE.unlocks={}; PROFILE.unlocks[item.unlockKey]=true; }
  saveProfile(); renderCareer(); buildRosters();
  showToast("🎁 Récompense obtenue : "+item.name);
  return true;
}
function renderCareer(){
  const summary=$("careerSummary"); if(!summary)return;
  const cp=careerProgress(),c=careerData(),s=PROFILE.stats,winRate=s.matches?Math.round(s.wins/Math.max(1,s.wins+s.losses)*100):0;
  summary.innerHTML="<div class='careerHero'><div><span>"+cp.rank+"</span><b>NIVEAU "+cp.level+"</b><small>"+escapeHTML(cp.title||"Aucun titre équipé")+"</small></div><div class='careerWallet'><b>🪙 "+cp.coins+" Godson</b><small>Monnaie de carrière</small></div></div>"+
    "<div class='xpBar'><i style='width:"+cp.pct+"%'></i></div><p class='careerNext'>⭐ "+cp.xp+" XP au total • "+cp.into+" / "+cp.needed+" XP vers le niveau "+Math.min(50,cp.level+1)+" • 🎯 "+escapeHTML(careerNextObjective())+"</p>"+
    "<div class='careerStats'><span>🏆 "+s.wins+"V / "+s.losses+"D ("+winRate+"%)</span><span>🥊 "+s.matches+" matchs</span><span>🌪️ Combo max x"+(s.bestCombo||0)+"</span><span>🎭 "+Object.keys(c.fighterWins||{}).length+" combattants victorieux</span></div>";
  $("circuitList").innerHTML=Object.values(CHAMPIONSHIP_CIRCUITS).map(cir=>"<article class='circuitCard'><div class='circuitTop'><span>"+cir.icon+"</span><b>"+escapeHTML(cir.name)+"</b><em>"+(c.circuits[cir.id]||0)+" titre(s)</em></div><p>"+escapeHTML(cir.desc)+"</p><small>"+cir.stages+" combats • Boss final • Récompense : +"+cir.xp+" XP, +"+cir.coins+" Godson</small><button type='button' data-circuit='"+cir.id+"'>⚔️ Lancer ce circuit</button></article>").join("");
  document.querySelectorAll("[data-circuit]").forEach(b=>b.onclick=()=>startChampionship(b.dataset.circuit));
  $("questList").innerHTML=CAREER_QUESTS.map(d=>{ const st=careerQuestState(d); const label=st.claimed?"✅ Réclamée":st.done?"🎁 Réclamer +"+d.xp+" XP • +"+d.coins+"🪙":st.value+" / "+d.target+" "+d.unit;
    return "<article class='questCard"+(st.done?" done":"")+"'><span>"+d.icon+"</span><div><b>"+escapeHTML(d.name)+"</b><p>"+escapeHTML(d.desc)+"</p><div class='challengeBar'><i style='width:"+st.pct+"%'></i></div></div><button type='button' data-quest='"+d.id+"' "+(st.done&&!st.claimed?"":"disabled")+">"+label+"</button></article>"; }).join("");
  document.querySelectorAll("[data-quest]").forEach(b=>b.onclick=()=>claimCareerQuest(b.dataset.quest));
  $("careerShop").innerHTML=CAREER_SHOP.map(item=>{ const st=careerShopState(item); const label=st.equipped?"✅ Titre équipé — retirer":st.owned?(item.kind==="title"?"🎖️ Équiper ce titre":"✅ Débloqué"):"🪙 "+item.cost+" Godson • Niv. "+item.minLevel;
    return "<article class='shopCard'><span>"+item.icon+"</span><div><b>"+escapeHTML(item.name)+"</b><p>"+escapeHTML(item.desc)+"</p></div><button type='button' data-shop='"+item.id+"' "+((st.canBuy||st.owned)?"":"disabled")+">"+label+"</button></article>"; }).join("");
  document.querySelectorAll("[data-shop]").forEach(b=>b.onclick=()=>buyCareerItem(b.dataset.shop));
  const st=PROFILE.story||{};
  $("careerJourney").innerHTML="<ol class='journeyList'>"+
    "<li><b>📖 Campagne Gideon - Godson</b><span>"+(st.chapter2Completed?"Saga terminée":st.chapter1Completed?"Chapitre 2 — combat "+(st.progressStep||4)+"/6":"Chapitre 1 — combat "+(st.progressStep||1)+"/6")+"</span></li>"+
    "<li><b>🏆 Championnat Godson</b><span>"+(c.circuits.stade||0)+" Stade • "+(c.circuits.monde||0)+" Monde • "+(c.circuits.legendes||0)+" Légendes</span></li>"+
    "<li><b>🌊 Survie</b><span>Record : vague "+(s.bestSurvivalWave||0)+"</span></li>"+
    "<li><b>🎯 Défis techniques</b><span>"+completedChallenges()+"/"+CHALLENGE_DEFS.length+" terminés</span></li>"+
    "<li><b>🌐 GO GAME Online</b><span>Duels privés et classement mondial dans le menu Online</span></li></ol>"+
    "<p class='careerNote'>La carrière progresse dans tous les modes locaux et en ligne. Les Godson débloquent titres et récompenses ; aucun achat réel n'existe dans GO GAME.</p>";
}
function openCareer(){ audio(); renderCareer(); showOnly("menuCareer"); }
function startChampionship(circuitId){ audio(); setupArcadeRun(circuitId||"stade"); enterSelect("arcade"); showToast("🏆 "+arcade.circuitName+" — "+arcadeTotal()+" combats vers la couronne !"); }
function effectiveSkin(char,side){
  const sk={...char.skin},custom=side===1?PROFILE.customColors.p1:PROFILE.customColors.p2;
  if(custom&&custom.primary){sk.primary=custom.primary;sk.accent=custom.accent||sk.accent;sk.trail=custom.accent||sk.trail;}
  return sk;
}
function saveSelection(){ PROFILE.selection.charP1=selCharP1; PROFILE.selection.charP2=selCharP2; PROFILE.selection.arena=selArenaId; PROFILE.selection.arenaMood=selArenaMood; saveProfile(); }

/* ---------------- SÉLECTION PERSONNAGES / ARÈNES ---------------- */
function statRows(c){ const b=charStatBars(c); return Object.keys(b).map(k=>"<span class='stat'><span>"+k+"</span><i><b style='width:"+b[k]+"%'></b></i></span>").join(""); }
function isCharLocked(c){ return !!(c.unlockKey&&!(PROFILE.unlocks&&PROFILE.unlocks[c.unlockKey])); }
/* Portraits animés V3.7 : les vrais combattants du moteur, dessinés en miniature
   dans chaque carte de sélection et en grand dans les aperçus. Le contexte principal
   est échangé le temps du dessin (ctx est un « let »), toujours restauré. */
let portraitCards=[],portraitTick=0,previewRigs=null;
let rosterFilter="tous",rosterSearch="";
const portraitFighterCache={};
function portraitFighterFor(index,side){
  const key=side+":"+index;
  if(!portraitFighterCache[key]){
    const f=new Fighter(0,side); applyCharacterTo(f,index); f.reset();
    f.id=index+1; f.anim=(index*37+side*13)%120; portraitFighterCache[key]=f;
  }
  return portraitFighterCache[key];
}
function drawFighterPortrait(pctx,f,w,h,cx,groundY,k,sk){
  if(!pctx||!f)return;
  const mainCtx=ctx;
  try{
    ctx=pctx;
    pctx.setTransform(1,0,0,1,0,0); pctx.clearRect(0,0,w,h);
    const g=pctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0,"#0b1020"); g.addColorStop(.55,sk.dark||"#141c2e"); g.addColorStop(1,"#05070d");
    pctx.fillStyle=g; pctx.fillRect(0,0,w,h);
    const rg=pctx.createRadialGradient(cx,groundY-95*k,6,cx,groundY-95*k,125*k);
    rg.addColorStop(0,sk.accent||"#ffc400"); rg.addColorStop(1,"rgba(0,0,0,0)");
    pctx.save(); pctx.globalAlpha=.32; pctx.fillStyle=rg; pctx.fillRect(0,0,w,h); pctx.restore();
    pctx.save(); pctx.fillStyle="rgba(0,0,0,.45)"; pctx.beginPath(); pctx.ellipse(cx,groundY+4,54*k,9*k,0,0,7); pctx.fill(); pctx.restore();
    f.x=f.rx=0; f.ry=0; f.y=GROUND; f.vy=0; f.vx=0; f.kvx=0; f.grounded=true;
    f.energy=0; f.hitFlash=0; f.attack=null; f.attackT=0; f.hitStun=0; f.downT=0; f.dead=false; f.blocking=false; f.crouching=false; f.dashT=0; f.victory=false;
    f.blinkT=((portraitTick+(f.charIndex||0)*47)%260)<7?-1:90;
    f.facing=f.side===2?-1:1; if(f.motion)f.motion.face=f.facing; // les portraits se font face (P1 → droite, P2 → gauche)
    f.anim=(f.anim||0)+1;
    pctx.save(); pctx.translate(cx,groundY); pctx.scale(k,k); drawFighter(f); pctx.restore();
    renderStats.portraits=(renderStats.portraits||0)+1;
  }catch(e){} finally{ ctx=mainCtx; }
}
function ensurePreviewRigs(){
  if(previewRigs)return;
  previewRigs=[1,2].map(side=>{
    const cv=$("previewP"+side); if(!cv)return null;
    const f=new Fighter(0,side); applyCharacterTo(f,side===1?selCharP1:1); f.reset();
    return {ctx:cv.getContext("2d"),f,sk:f.skin,charIndex:-1};
  }).filter(Boolean);
}
function updatePreviewBoxes(previewP2Index){
  ensurePreviewRigs();
  const setRig=(rig,index)=>{ if(rig&&rig.charIndex!==index){ applyCharacterTo(rig.f,index); rig.f.reset(); rig.charIndex=index; rig.sk=rig.f.skin; } };
  setRig(previewRigs[0],selCharP1); setRig(previewRigs[1],previewP2Index);
  const fill=(side,index,random)=>{
    const c=CHARACTERS[index]; if(!c)return;
    const sk=effectiveSkin(c,side),box=$("previewBoxP"+side); if(!box)return;
    box.style.setProperty("--cc",sk.primary); box.style.setProperty("--ca",sk.accent);
    $("previewNameP"+side).textContent=random?"🎲 ALÉATOIRE":c.name;
    $("previewTitleP"+side).textContent=random?"Adversaire surprise":(c.title+" • "+(c.superName||""));
    $("previewStatsP"+side).innerHTML=random?"":statRows(c);
  };
  fill(1,selCharP1,false);
  fill(2,previewP2Index,selCharP2<0&&pendingMode!=="arcade"&&pendingMode!=="story"&&pendingMode!=="survival");
}
/* Portraits plein corps de l'écran VS (V4.1) : les deux combattants du match,
   animés par le même moteur que les cartes de sélection. */
let vsRigs=null;
function ensureVSRigs(){
  if(vsRigs)return;
  vsRigs=[1,2].map(side=>{
    const cv=$("vsPortrait"+side); if(!cv)return null;
    const f=new Fighter(0,side); applyCharacterTo(f,side===1?selCharP1:1); f.reset();
    return {ctx:cv.getContext("2d"),f,sk:f.skin,charIndex:-1};
  }).filter(Boolean);
}
function syncVSPortraitsToFighters(){
  ensureVSRigs(); if(!vsRigs)return;
  [[vsRigs[0],p1],[vsRigs[1],p2]].forEach(pair=>{
    const rig=pair[0],src=pair[1]; if(!rig||!src)return;
    if(rig.charIndex!==src.charIndex){ applyCharacterTo(rig.f,src.charIndex); rig.f.reset(); rig.charIndex=src.charIndex; }
    rig.f.skin={...src.skin}; rig.f.letter=src.letter; rig.sk=rig.f.skin;
  });
}
function updateVSPortraits(){
  const menu=$("menuVS"); if(!menu||menu.classList.contains("hidden"))return;
  if(!vsRigs)syncVSPortraitsToFighters();
  if(vsRigs)for(const rig of vsRigs)drawFighterPortrait(rig.ctx,rig.f,300,340,150,326,1.38,rig.sk);
}

function updateSelectPortraits(){
  const menu=$("menuSelect"); if(!menu||menu.classList.contains("hidden"))return;
  portraitTick++;
  if(previewRigs)for(const rig of previewRigs)drawFighterPortrait(rig.ctx,rig.f,300,340,150,326,1.38,rig.sk);
  for(let i=0;i<portraitCards.length;i++)if((portraitTick+i)%6===0){ const pc=portraitCards[i]; drawFighterPortrait(pc.ctx,pc.f,220,250,110,240,1.0,pc.sk); }
}
/* Navigation clavier dans la grille de sélection (flèches : gauche/droite/haut/bas). */
document.addEventListener("keydown",e=>{
  const menu=$("menuSelect"); if(!menu||menu.classList.contains("hidden")||state!=="select")return;
  let cols=3; try{ cols=Math.max(1,getComputedStyle(menu.querySelector("#rosterP1")).gridTemplateColumns.split(" ").length); }catch(_){ }
  const step=e.code==="ArrowRight"?1:e.code==="ArrowLeft"?-1:e.code==="ArrowDown"?cols:e.code==="ArrowUp"?-cols:0;
  if(!step)return; e.preventDefault();
  let n=selCharP1;
  for(let k=0;k<CHARACTERS.length;k++){ n=(n+step+CHARACTERS.length)%CHARACTERS.length; if(!isCharLocked(CHARACTERS[n])&&rosterMatches(CHARACTERS[n]))break; }
  if(n!==selCharP1){ selCharP1=n; saveSelection(); refreshSelect(); const selCard=document.querySelector("#rosterP1 .charCard.sel"); if(selCard&&typeof selCard.scrollIntoView==="function")selCard.scrollIntoView({block:"nearest"}); }
});

/* Navigation Pro V4.4 (Lena) : recherche + filtres par famille sur les 41 cartes. */
function rosterMatches(c){
  if(!c)return false;
  if(rosterSearch&&!(c.name+" "+c.title).toLowerCase().includes(rosterSearch))return false;
  switch(rosterFilter){
    case "rapide": return c.speed>=1.12;
    case "colosse": return c.hp>=112;
    case "energie": return c.energyGain>=1.3;
    case "tech": return c.style==="synthetique"||["nyx","korben","sera","raven","zara-nova","orion","drakesh"].includes(c.id);
    case "lames": return c.style==="guerrier"||c.style==="kunoichi";
    default: return true;
  }
}
function applyRosterFilter(){
  let visible=0;
  document.querySelectorAll("#rosterP1 .charCard,#rosterP2 .charCard").forEach(card=>{
    if(card.dataset.idx===undefined){card.style.display="";return;}
    const show=rosterMatches(CHARACTERS[+card.dataset.idx]);
    card.style.display=show?"":"none";
    if(show&&card.parentElement&&card.parentElement.id==="rosterP1")visible++;
  });
  const el=$("rosterCount"); if(el)el.textContent=visible+" / "+CHARACTERS.length+" combattants";
  renderStats.rosterVisible=visible;
}
function bindRosterTools(){
  const input=$("rosterSearch"); if(!input||input.dataset.bound)return; input.dataset.bound="1";
  input.addEventListener("input",()=>{ rosterSearch=input.value.trim().toLowerCase(); applyRosterFilter(); });
  document.querySelectorAll(".filterChip").forEach(chip=>chip.addEventListener("click",()=>{
    rosterFilter=chip.dataset.f||"tous";
    document.querySelectorAll(".filterChip").forEach(c=>c.classList.toggle("on",c===chip));
    applyRosterFilter();
  }));
}
function buildRosters(){
  portraitCards=[];
  const build=(container,side,selected,allowRandom)=>{
    container.innerHTML="";
    CHARACTERS.forEach((c,i)=>{
      const sk=effectiveSkin(c,side),btn=document.createElement("button"),locked=isCharLocked(c);
      btn.className="charCard"+(selected===i&&!locked?" sel":"")+(locked?" locked":""); btn.type="button"; btn.dataset.idx=i;
      btn.style.setProperty("--cc",locked?"#546e7a":sk.primary); btn.style.setProperty("--ca",locked?"#ffc400":sk.accent);
      btn.innerHTML=locked
        ?"<span class='portraitWrap'><span class='portraitFallback'>🔒</span></span><b>??? SECRET</b><small>Personnage légendaire</small><small>"+escapeHTML(c.lockedHint||"À débloquer")+"</small>"
        :"<span class='portraitWrap'><canvas class='portraitCanvas' width='220' height='250'></canvas></span><b>"+c.name+"</b><small>"+c.title+"</small>";
      btn.onclick=()=>{
        if(locked){ showToast("🔒 Personnage secret — "+(c.lockedHint||"à débloquer")); return; }
        if(side===2&&(pendingMode==="arcade"||pendingMode==="story"||pendingMode==="survival"))return;
        if(side===1)selCharP1=i; else selCharP2=i; saveSelection(); refreshSelect();
      };
      container.appendChild(btn);
      if(!locked){ const pcv=btn.querySelector("canvas"); if(pcv)portraitCards.push({ctx:pcv.getContext("2d"),f:portraitFighterFor(i,side),sk}); }
    });
    if(allowRandom){ const btn=document.createElement("button"); btn.className="charCard"+(selected===-1?" sel":""); btn.type="button";
      btn.style.setProperty("--cc","#607d8b"); btn.style.setProperty("--ca","#b0bec5");
      btn.innerHTML="<span class='portraitWrap'><span class='portraitFallback'>🎲</span></span><b>ALÉATOIRE</b><small>Adversaire surprise</small>";
      btn.onclick=()=>{ if(pendingMode==="arcade"||pendingMode==="story"||pendingMode==="survival")return; selCharP2=-1; saveSelection(); refreshSelect(); }; container.appendChild(btn); }
  };
  build($("rosterP1"),1,selCharP1,false);
  build($("rosterP2"),2,selCharP2,true);
  const autoP2=pendingMode==="arcade"||pendingMode==="story"||pendingMode==="survival";
  $("rosterP2").style.opacity=autoP2?.5:1;
  $("rosterP2").style.pointerEvents=autoP2?"none":"auto";
  $("arenaRow").style.opacity=(pendingMode==="story"||pendingMode==="survival"||pendingMode==="arcade")?.5:1;
  $("arenaRow").style.pointerEvents=(pendingMode==="story"||pendingMode==="survival"||pendingMode==="arcade")?"none":"auto";
  bindRosterTools(); applyRosterFilter();
}
function buildArenaCards(){
  const row=$("arenaRow"); row.innerHTML="";
  ARENAS.forEach(a=>{ const b=document.createElement("button"); b.type="button"; b.className="arenaCard ar-"+a.id+(selArenaId===a.id?" sel":""); b.textContent=a.name;
    b.onclick=()=>{ selArenaId=a.id; setArenaById(a.id); saveSelection(); buildArenaCards(); updateLaunchSummary(); }; row.appendChild(b); });
  const r=document.createElement("button"); r.type="button"; r.className="arenaCard ar-random"+(selArenaId==="random"?" sel":""); r.textContent="🎲 Aléatoire";
  r.onclick=()=>{ selArenaId="random"; saveSelection(); buildArenaCards(); updateLaunchSummary(); }; row.appendChild(r);
}
function buildArenaMoodCards(){
  const row=$("arenaMoodRow"); if(!row)return; row.innerHTML="";
  Object.values(ARENA_MOODS).forEach(mood=>{
    const b=document.createElement("button"); b.type="button"; b.dataset.mood=mood.id;
    b.className="arenaMoodCard"+(selArenaMood===mood.id?" sel":"");
    b.setAttribute("aria-pressed",selArenaMood===mood.id?"true":"false");
    b.innerHTML=mood.icon+" "+mood.label+"<small>"+mood.short+"</small>";
    b.onclick=()=>{ setArenaMood(mood.id); saveSelection(); buildArenaMoodCards(); updateLaunchSummary(); showToast("🌤️ Ambiance : "+arenaMoodLabel(currentArenaMood)+(selArenaMood==="auto"?" (Auto)":"")); };
    row.appendChild(b);
  });
}
function stageOpponent(){ if(!arcade.seq.length)setupArcadeRun(); return arcade.seq[clamp(arcade.stage-1,0,Math.max(0,arcade.seq.length-1))]; }
function generateSurvivalWave(){
  const wave=survival.wave,bossWave=wave%5===0;
  const pattern=wave>6?"difficile":(["facile","moyen","moyen","difficile","difficile"][(wave-1)%5]);
  const normalPool=CHARACTERS.map((c,i)=>i).filter(i=>i!==4),bossPool=[4,4,2,5,6,36,21,34];
  const char=bossWave?bossPool[(Math.random()*bossPool.length)|0]:normalPool[(Math.random()*normalPool.length)|0];
  survival.next={char,diff:pattern,arena:ARENAS[(Math.random()*ARENAS.length)|0].id,boss:bossWave};
  return survival.next;
}
function survivalOpponent(){ return survival.next||generateSurvivalWave(); }
function setupSurvivalRun(){
  survival.wave=1; survival.score=0; survival.lastWaveScore=0; survival.lastWin=false;
  survival.carryHealth=null; survival.carryEnergy=0; survival.recorded=false; survival.runCounted=false;
  generateSurvivalWave();
}
function updateLaunchSummary(){
  const c1=CHARACTERS[selCharP1];
  let opp="Adversaire";
  if(pendingMode==="story"){ const f=currentStoryFight(); opp=f.foeName+" ("+DIFFS[f.diff].label+") — Combat "+story.step+"/"+story.total; }
  else if(pendingMode==="survival"){ const o=survivalOpponent(); opp=CHARACTERS[o.char].name+" ("+DIFFS[o.diff].label+") — Vague "+survival.wave; }
  else if(pendingMode==="arcade"){ const o=stageOpponent(); opp=CHARACTERS[o.char].name+" ("+DIFFS[o.diff].label+") — "+(arcade.circuitName||"Championnat")+" "+arcade.stage+"/"+arcadeTotal(); }
  else if(pendingMode==="training")opp=(selCharP2<0?"Mannequin surprise":CHARACTERS[selCharP2].name+" (mannequin)");
  else opp=selCharP2<0?"Aléatoire":CHARACTERS[selCharP2].name;
  const ar=pendingMode==="story"?(ARENAS.find(a=>a.id===currentStoryFight().arena)||ARENAS[0]).name+" (scénario)":pendingMode==="survival"?(ARENAS.find(a=>a.id===survivalOpponent().arena)||ARENAS[0]).name+" (vague)":pendingMode==="arcade"?(ARENAS.find(a=>a.id===stageOpponent().arena)||ARENAS[0]).name+" (circuit)":(selArenaId==="random"?"Arène aléatoire":(ARENAS.find(a=>a.id===selArenaId)||ARENAS[0]).name);
  const arId=pendingMode==="story"?currentStoryFight().arena:pendingMode==="survival"?survivalOpponent().arena:pendingMode==="arcade"?(stageOpponent().arena||currentArena.id):(selArenaId==="random"?currentArena.id:selArenaId);
  const moodText=selArenaMood==="auto"?("🎨 Auto → "+arenaMoodLabel(resolveArenaMood(arId,selArenaMood))):arenaMoodLabel(selArenaMood);
  $("launchSummary").textContent=c1.name+" vs "+opp+" • "+ar+" • "+moodText;
}
function renderMoveList(){
  const el=$("moveList"); if(!el)return;
  const c=CHARACTERS[selCharP1]||CHARACTERS[0];
  el.innerHTML="<b>🥋 Arsenal de "+escapeHTML(c.name)+"</b> "+
    "<span>Spécial 50% : "+escapeHTML(c.specName||"Spécial")+"</span>"+
    "<span>EX 75% : Spécial + Poing</span>"+
    "<span>SUPER 100% : "+escapeHTML(c.superName||"Super")+"</span>"+
    "<span>🤼 Projection : Poing + Pied</span>"+
    "<span>⚡ Godson Cancel : Dash après impact (-25%)</span>"+
    "<span>💨 Dash aérien unique + backdash protégé</span>"+
    "<span>✨ Parry : garde au dernier instant</span>";
}
function refreshSelect(){
  mode=pendingMode;
  buildRosters(); buildArenaCards(); buildArenaMoodCards(); updateLaunchSummary(); renderMoveList(); syncFlowUI();
  let previewP2=selCharP2<0?1:selCharP2;
  if(pendingMode==="arcade")previewP2=stageOpponent().char;
  if(pendingMode==="story")previewP2=currentStoryFight().char;
  if(pendingMode==="survival")previewP2=survivalOpponent().char;
  applyCharacterTo(p1,selCharP1); applyCharacterTo(p2,previewP2);
  p1.reset(); p2.reset(); buildDisplayNames(); placeMenuFighters();
  if(pendingMode==="story")setArenaById(currentStoryFight().arena);
  if(pendingMode==="survival")setArenaById(survivalOpponent().arena);
  if(pendingMode==="arcade"&&stageOpponent().arena)setArenaById(stageOpponent().arena);
  const titles={bot:"Affronte le BOT "+DIFFS[botDiff].label,"2p":"Duel entre joueurs",arcade:"🏆 "+(arcade.circuitName||"Championnat Godson")+" — "+arcadeTotal()+" combats",training:"Salle d’entraînement",story:STORY_CAMPAIGN.title,survival:"🌊 Survie — Combien de vagues tiendras-tu ?"};
  $("selectTitle").textContent=titles[pendingMode]||"Choisis ton combattant";
  $("rosterTitleP1").textContent="🟦 "+((PROFILE.names.p1||"Joueur 1").toUpperCase());
  $("rosterTitleP2").textContent=pendingMode==="2p"?"🟥 JOUEUR 2":pendingMode==="training"?"🥋 MANNEQUIN":pendingMode==="arcade"?"🏆 CHAMPIONNAT (AUTO)":pendingMode==="story"?"📖 ADVERSAIRE DE L’HISTOIRE (AUTO)":pendingMode==="survival"?"🌊 VAGUE "+survival.wave+" (AUTO)":"🤖 BOT "+DIFFS[botDiff].label.toUpperCase();
  updatePreviewBoxes(previewP2);
}
function enterSelect(newMode){ pendingMode=newMode; mode=newMode; refreshSelect(); showOnly("menuSelect"); }
/* V3.3 : libellés du parcours (étape 3 = Difficulté seulement contre le bot),
   note d'arène imposée et bouton de l'écran Arène adaptés au contexte. */
function syncFlowUI(){
  document.querySelectorAll(".flowLast").forEach(e=>e.textContent=pendingMode==="bot"?"Difficulté":"Combat");
  const imp=$("arenaImposed"); if(imp)imp.classList.toggle("hidden",!(pendingMode==="story"||pendingMode==="survival"||pendingMode==="arcade"));
  const lf=$("btnLaunchFight");
  if(lf&&lf.firstChild)lf.firstChild.textContent=(pendingMode==="bot"&&!flowDifficultyChosen)?"🎯 Choisir la difficulté ":"⚔️ LANCER LE COMBAT";
}
function launchFromFlow(){ if(pendingMode==="story")showStoryScene("intro"); else showVS(false); }
function setupArcadeRun(circuitId){
  const circuit=CHAMPIONSHIP_CIRCUITS[circuitId]||CHAMPIONSHIP_CIRCUITS[arcade.circuit]||CHAMPIONSHIP_CIRCUITS.stade;
  arcade.circuit=circuit.id; arcade.circuitName=circuit.name; arcade.total=circuit.stages; arcade.stage=1; arcade.lastWin=false;
  const boss=circuit.bossPool[(Math.random()*circuit.bossPool.length)|0];
  const order=CHARACTERS.map((c,i)=>i).filter(i=>i!==4).filter(i=>i!==boss).sort(()=>Math.random()-.5).slice(0,circuit.stages-1);
  arcade.seq=order.map((char,i)=>({char,diff:circuit.diffs[i]||"moyen",arena:circuit.arenas[i%circuit.arenas.length]}));
  arcade.seq.push({char:boss,diff:circuit.diffs[circuit.stages-1]||"difficile",arena:circuit.arenas[(circuit.stages-1)%circuit.arenas.length],boss:true});
  return arcade;
}
function setupStoryRun(){
  const saved=PROFILE.story||{};
  if(saved.chapter2Completed)story.step=1; // saga terminée : nouvelle partie complète
  else if(saved.chapter1Completed)story.step=clamp(saved.progressStep||4,4,story.total);
  else story.step=clamp(saved.progressStep||1,1,story.total);
  story.lastWin=false;
}

/* ---------------- LANCEMENT / ÉCRAN VS ---------------- */
function prepareMatch(keepPrepared){
  mode=pendingMode;
  if(mode==="story"){ const f=currentStoryFight(); preparedCharP2=f.char; botDiff=f.diff; preparedArenaId=f.arena; }
  else if(mode==="survival"){ const o=survivalOpponent(); preparedCharP2=o.char; botDiff=o.diff; preparedArenaId=o.arena; }
  else if(mode==="arcade"){ const o=stageOpponent(); preparedCharP2=o.char; botDiff=o.diff; if(!keepPrepared)preparedArenaId=o.arena||(selArenaId==="random"?ARENAS[(Math.random()*ARENAS.length)|0].id:selArenaId); }
  else if(!keepPrepared){ preparedCharP2=selCharP2<0?((Math.random()*CHARACTERS.length)|0):selCharP2; preparedArenaId=selArenaId==="random"?ARENAS[(Math.random()*ARENAS.length)|0].id:selArenaId; }
  applyCharacterTo(p1,selCharP1); applyCharacterTo(p2,preparedCharP2);
  setArenaById(preparedArenaId); buildDisplayNames(); p1.reset(); p2.reset(); placeMenuFighters();
}
function showVS(keepPrepared){
  audio(); prepareMatch(!!keepPrepared); SFX.confirm();
  $("hud").style.display="none"; $("trainingBar").style.display="none";
  const setSide=(avatar,name,char,f)=>{ const a=$(avatar); a.style.borderColor=f.skin.accent; a.style.boxShadow="0 0 34px "+f.skin.primary+",0 22px 50px rgba(0,0,0,.55)"; $(name).textContent=f.name; $(char).textContent=f.char.name+" — "+f.char.title+" • "+(f.char.superName||""); };
  setSide("vsAvatar1","vsName1","vsChar1",p1); setSide("vsAvatar2","vsName2","vsChar2",p2);
  syncVSPortraitsToFighters();
  $("vsArena").textContent="🏟️ "+currentArena.name+" • "+arenaMoodLabel(currentArenaMood)+(mode==="arcade"?" • "+(arcade.circuitName||"Championnat")+" "+arcade.stage+"/"+arcadeTotal():mode==="story"?" • Histoire "+story.step+"/"+story.total:mode==="survival"?" • 🌊 Vague "+survival.wave:"");
  showOnly("menuVS");
  clearTimeout(vsTimeout); vsTimeout=setTimeout(()=>{ if(state==="vs")launchPreparedMatch(); },2450);
}
function launchPreparedMatch(){ clearTimeout(vsTimeout); showOnly(null); beginMatch(); }
function skipVS(){ if(state==="vs")launchPreparedMatch(); }

/* ---------------- REPLAYS DÉTERMINISTES & REPLAY STUDIO V2.7–V2.8 ---------------- */
let lastReplayUiKey="";
function replayModeLabel(d){
  if(!d)return "";
  const c=d.context||{};
  return d.mode==="story"?"Histoire "+(c.storyStep||"?")+"/6":d.mode==="survival"?"Survie — vague "+(c.survivalWave||1):d.mode==="arcade"?"Championnat "+(c.arcadeStage||1)+"/"+(c.arcadeTotal||5):d.mode==="online"?"Duel en ligne GO GAME":d.mode==="2p"?"2 Joueurs":"Bot "+((DIFFS[d.botDiff]||{}).label||d.botDiff||"");
}
function replaySummary(d){
  if(!d)return "Aucun replay enregistré";
  const c1=(CHARACTERS[d.char1]||{}).name||"J1",c2=(CHARACTERS[d.char2]||{}).name||"J2",winner=d.result?d.result.winnerName:"?";
  return c1+" vs "+c2+" • "+replayModeLabel(d)+" • "+fmtClock((d.duration||0)/60)+" • Vainqueur : "+winner;
}
function replayArenaName(d){ const a=ARENAS.find(x=>x.id===(d&&d.arena)); return a?a.name:"Arène Godson"; }
function replayDateLabel(d){
  if(!d||!d.createdAt)return "Date inconnue";
  try{ return new Date(d.createdAt).toLocaleString("fr-FR",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}); }catch(e){ return "Date inconnue"; }
}
function replayWinnerLine(d){
  if(!d||!d.result)return "";
  if(d.result.victoryLine)return d.result.victoryLine;
  const idx=d.result.winnerChar!=null?d.result.winnerChar:(d.result.winnerSide===1?d.char1:d.char2);
  return (CHARACTERS[idx]||{}).victoryLine||"";
}
function syncReplayUI(){
  const count=Array.isArray(replayLibrary)?replayLibrary.length:0,has=count>0&&!!(lastReplayData&&lastReplayData.duration>0),main=$("btnLastReplay"),end=$("btnWatchReplay"),info=$("replayInfo");
  if(main)main.disabled=!has;
  if(end)end.disabled=!has;
  if(info)info.textContent=has?("🎬 "+count+" replay"+(count>1?"s":"")+" • Dernier : "+replaySummary(lastReplayData)+"."):"🎬 Termine un match pour créer ton premier replay.";
  const libraryMenu=$("menuReplays"); if(libraryMenu&&!libraryMenu.classList.contains("hidden"))renderReplayLibrary();
  updateReplayBar(true);
}
function renderReplayLibrary(){
  const list=$("replayLibraryList"),summary=$("replayLibrarySummary"); if(!list||!summary)return;
  const favorites=replayLibrary.filter(d=>d.favorite).length;
  summary.textContent=replayLibrary.length?("🎬 "+replayLibrary.length+" replay"+(replayLibrary.length>1?"s":"")+" • ⭐ "+favorites+" favori"+(favorites>1?"s":"")+" • rotation normale : "+REPLAY_LIBRARY_MAX):"Aucun replay enregistré pour le moment — termine un match hors entraînement pour inaugurer ton Replay Studio.";
  if(!replayLibrary.length){ list.innerHTML="<div class='replayLibraryEmpty'>🎞️ <b>Ton studio est encore vide.</b><br>Après ton prochain match, touche « Revoir le match » ou reviens ici pour le retrouver.</div>"; return; }
  list.innerHTML=replayLibrary.map((d,i)=>{
    const result=d.result||{},damage=(result.damage||[0,0]).reduce((a,b)=>a+(+b||0),0),combo=Math.max(...(result.maxCombo||[0,0]));
    return "<article class='replayCard"+(d.favorite?" favorite":"")+"'>"+
      "<div class='replayCardTop'><b>"+(d.favorite?"⭐ ":"")+escapeHTML(d.title||defaultReplayTitle(d))+"</b>"+(i===0?"<span>DERNIER</span>":d.favorite?"<span>FAVORI</span>":"")+"</div>"+
      "<p>"+escapeHTML(replaySummary(d))+"</p>"+
      "<small>🏟️ "+escapeHTML(replayArenaName(d))+" • "+escapeHTML(arenaMoodLabel(resolveArenaMood(d.arena,d.arenaMood||"auto")))+" • "+escapeHTML(replayDateLabel(d))+"</small>"+
      "<small>⚔️ "+damage+" dégâts • 🔥 Combo max "+combo+" • 🔐 #"+escapeHTML(d.finalHash||"sans-hash")+"</small>"+
      "<div class='replayActions'>"+
      "<button data-action='play' data-id='"+escapeHTML(d.id)+"'>▶ Lire</button>"+
      "<button data-action='favorite' data-id='"+escapeHTML(d.id)+"'>"+(d.favorite?"⭐ Favori":"☆ Favori")+"</button>"+
      "<button data-action='rename' data-id='"+escapeHTML(d.id)+"'>✏️ Renommer</button>"+
      "<button data-action='delete' data-id='"+escapeHTML(d.id)+"'>🗑 Supprimer</button>"+
      "</div></article>";
  }).join("");
  list.querySelectorAll("[data-action]").forEach(btn=>btn.onclick=()=>handleReplayLibraryAction(btn.dataset.action,btn.dataset.id));
}
function openReplayLibrary(){ audio(); renderReplayLibrary(); showOnly("menuReplays"); }
function handleReplayLibraryAction(action,id){
  const d=findReplayById(id); if(!d){ renderReplayLibrary(); return; }
  if(action==="play"){ startReplayPlayback(d); return; }
  if(action==="favorite"){ setReplayFavorite(id); showToast(d.favorite?"⭐ Replay ajouté aux favoris — il sera protégé du nettoyage automatique.":"☆ Replay retiré des favoris."); renderReplayLibrary(); return; }
  if(action==="rename"){
    const title=typeof window.prompt==="function"?window.prompt("Nouveau titre pour ce replay :",d.title||defaultReplayTitle(d)):null;
    if(title!=null){ renameReplayById(id,title); showToast("✏️ Replay renommé : "+(findReplayById(id)||{}).title); renderReplayLibrary(); }
    return;
  }
  if(action==="delete"){
    if(typeof window.confirm==="function"&&!window.confirm("Supprimer définitivement ce replay ?"))return;
    deleteReplayById(id); showToast("🗑 Replay supprimé de la bibliothèque."); renderReplayLibrary();
  }
}
function updateReplayBar(force){
  const bar=$("replayBar"); if(!bar)return;
  const visible=!!(replayPlayback.active||replayPlayback.ended),d=replayPlayback.data;
  bar.classList.toggle("show",visible);
  if(!visible){ lastReplayUiKey=""; return; }
  const pct=d?clamp(Math.round((replayPlayback.framesElapsed||0)/Math.max(1,d.duration)*100),0,100):0;
  const winnerLine=replayWinnerLine(d);
  const status=replayPlayback.ended?(replayPlayback.verified?("✅ Replay vérifié"+(winnerLine?" — «"+winnerLine+"»":" — même état final")):"⚠️ Replay divergent — ancienne version ?"):replayPlayback.paused?"⏸ En pause":replayPlayback.verified===false?"⚠️ Divergence détectée":"▶ Lecture déterministe";
  const key=pct+"|"+status+"|"+(replayPlayback.paused?1:0)+"|"+(replayPlayback.ended?1:0);
  if(!force&&key===lastReplayUiKey)return; lastReplayUiKey=key;
  $("replayProgressFill").style.width=pct+"%";
  $("replayProgress").textContent=pct+"%";
  $("replayStatus").textContent=status;
  const play=$("btnReplayPlay"); play.disabled=!!replayPlayback.ended; play.textContent=replayPlayback.paused?"▶ Reprendre":"⏸ Pause";
  const spd=$("replaySpeed"); if(spd&&document.activeElement!==spd)spd.value=String(replayPlayback.speed||1);
}
function startReplayPlayback(data){
  data=data||lastReplayData||loadLastReplay();
  if(!data||!Array.isArray(data.events)){ showToast("🎬 Aucun replay disponible — termine d’abord un match !"); return false; }
  audio(); clearTimeout(vsTimeout);
  const keepSpeed=replayPlayback.speed||1;
  const restoreSettings=replayPlayback.restoreSettings||{roundTime:SETTINGS.roundTime,roundsWin:SETTINGS.roundsWin};
  const restoreSelection=replayPlayback.restoreSelection||{charP1:selCharP1,charP2:selCharP2,arena:selArenaId,arenaMood:selArenaMood};
  const ctx=data.context||{};
  cancelReplayRecording();
  replayPlayback={active:true,ended:false,paused:false,framesElapsed:0,currentFrame:0,eventIndex:0,a:0,b:0,data,speed:keepSpeed,verified:null,restoreSettings,restoreSelection};
  mode=data.mode; pendingMode=data.mode; if(data.botDiff)botDiff=data.botDiff;
  if(ctx.storyStep)story.step=ctx.storyStep;
  if(ctx.arcadeStage)arcade.stage=ctx.arcadeStage; if(ctx.arcadeTotal)arcade.total=ctx.arcadeTotal; if(ctx.arcadeCircuit&&CHAMPIONSHIP_CIRCUITS[ctx.arcadeCircuit]){ arcade.circuit=ctx.arcadeCircuit; arcade.circuitName=CHAMPIONSHIP_CIRCUITS[ctx.arcadeCircuit].name; }
  if(ctx.survivalWave)survival.wave=ctx.survivalWave;
  survival.score=ctx.survivalScore||0; survival.carryHealth=null; survival.lastWin=false;
  if(data.settings){ SETTINGS.roundTime=data.settings.roundTime; SETTINGS.roundsWin=data.settings.roundsWin; }
  applyCharacterTo(p1,data.char1); applyCharacterTo(p2,data.char2);
  setArenaById(data.arena||"stadium",data.arenaMood||"auto");
  showOnly(null);
  beginMatch();
  $("touchUI").style.display="none"; $("trainingBar").style.display="none";
  $("roundLabel").textContent="🎬 REPLAY • "+replayModeLabel(data).toUpperCase();
  syncReplayUI();
  showToast("🎬 Replay : "+(data.title?data.title+" — ":"")+replaySummary(data));
  return true;
}
function toggleReplayPause(){ if(!replayPlayback.active)return; replayPlayback.paused=!replayPlayback.paused; updateReplayBar(true); }
function restartReplayPlayback(){ const d=replayPlayback.data||lastReplayData; if(d)startReplayPlayback(d); }
function exitReplayPlayback(){ stopReplayPlayback(true); goMenu(); }
function onReplayFinished(winner){
  SFX.win();
  $("roundLabel").textContent="🎬 REPLAY TERMINÉ";
  syncReplayUI();
  showToast(replayPlayback.verified?("✅ Replay vérifié — "+winner.name+" gagne, exactement comme la première fois !"):"⚠️ Replay terminé, mais l’état final diverge (replay d’une autre version ?)");
}
function bindReplayUI(){
  $("btnLastReplay").onclick=openReplayLibrary;
  $("btnReplaysBack").onclick=()=>showOnly("menuMain");
  $("btnWatchReplay").onclick=()=>startReplayPlayback();
  $("btnReplayPlay").onclick=toggleReplayPause;
  $("btnReplayRestart").onclick=restartReplayPlayback;
  $("btnReplayQuit").onclick=exitReplayPlayback;
  $("replaySpeed").addEventListener("change",e=>{ replayPlayback.speed=+e.target.value||1; updateReplayBar(true); });
}

/* ---------------- GO GAME ONLINE : SUPABASE + WEBRTC LOCKSTEP ----------------
   Décision Studio : REST/Auth Supabase sans librairie externe, salon privé
   signalé par la base, puis DataChannel WebRTC pour les inputs 60 Hz.
   Le jeu local ne dépend jamais du réseau : chaque appel Online est opt-in. */
const GO_GAME_SUPABASE_URL="https://mcyousugmxgugfremmsq.supabase.co";
const GO_GAME_SUPABASE_PUBLISHABLE_KEY="sb_publishable_F4-BiEBa5ZHkESEXD93qnA_OkCBQd9K";
const GO_GAME_SESSION_KEY="gideonGodsonArenaOnlineSessionV1";
let onlineState={session:null,profile:null,busy:false,leaderboard:[],publicReplays:[],room:null,isHost:false,peer:null,channel:null,pollTimer:0,signalBusy:false,processedSignals:new Set(),pendingIce:[],remoteDescriptionSet:false,rttMs:null,suggestedDelay:6,pingSeq:0,lastPingAt:0,started:false,closing:false};
function onlineEl(id){ return $(id); }
function onlineSetStatus(text){
  const el=onlineEl("onlineStatus"); if(el)el.textContent=text;
  const menu=onlineEl("onlineMenuStatus"); if(menu)menu.textContent=text.length>118?text.slice(0,115)+"…":text;
}
function onlineSetRoomStatus(text){ const el=onlineEl("onlineRoomStatus"); if(el)el.textContent=text; }
function onlineSetCloudStatus(text){ const el=onlineEl("onlineCloudStatus"); if(el)el.textContent=text; }
function onlineErrorText(err){
  if(!err)return "Erreur inconnue";
  const data=err.data||{};
  return String(data.message||data.error_description||data.error||data.detail||err.message||err).slice(0,240);
}
function onlineSetBusy(busy){
  onlineState.busy=!!busy;
  ["btnOnlineSignUp","btnOnlineSignIn","btnOnlineSaveProfile","btnOnlineSignOut","btnOnlineCreateRoom","btnOnlineJoinRoom","btnOnlineStartDuel","btnOnlineRefreshLeaderboard","btnOnlineUploadSave","btnOnlineDownloadSave","btnOnlinePublishReplay","btnOnlineRefreshReplays"].forEach(id=>{ const b=onlineEl(id); if(b)b.disabled=!!busy; });
}
async function onlineRun(task){
  if(onlineState.busy)return;
  onlineSetBusy(true);
  try{ await task(); }
  catch(err){ const msg=onlineErrorText(err); onlineSetStatus("⚠️ "+msg); showToast("🌐 GO GAME : "+msg); }
  finally{ onlineSetBusy(false); syncOnlineUI(); }
}
function onlineStoreSession(data){
  if(!data||!data.access_token)return false;
  const rawExpiry=Number(data.expires_at||0);
  const expiresAt=rawExpiry?(rawExpiry>1000000000000?rawExpiry:rawExpiry*1000):Date.now()+((data.expires_in||3600)*1000);
  onlineState.session={access_token:data.access_token,refresh_token:data.refresh_token||"",expires_at:expiresAt,user:data.user||(onlineState.session&&onlineState.session.user)||null};
  try{ window.localStorage.setItem(GO_GAME_SESSION_KEY,JSON.stringify(onlineState.session)); }catch(e){}
  return true;
}
function loadOnlineSession(){
  try{ const raw=window.localStorage.getItem(GO_GAME_SESSION_KEY); if(raw)onlineState.session=JSON.parse(raw); }catch(e){ onlineState.session=null; }
  return onlineState.session;
}
function clearOnlineSession(){
  onlineState.session=null; onlineState.profile=null;
  try{ window.localStorage.removeItem(GO_GAME_SESSION_KEY); }catch(e){}
}
async function onlineRequest(path,options){
  options=options||{};
  if(typeof fetch!=="function")throw new Error("Réseau indisponible dans ce navigateur");
  const headers={apikey:GO_GAME_SUPABASE_PUBLISHABLE_KEY,"Content-Type":"application/json",...(options.headers||{})};
  const token=options.auth===false?GO_GAME_SUPABASE_PUBLISHABLE_KEY:((onlineState.session&&onlineState.session.access_token)||GO_GAME_SUPABASE_PUBLISHABLE_KEY);
  headers.Authorization="Bearer "+token;
  let controller=null,timeoutId=0;
  if(typeof AbortController!=="undefined"){ controller=new AbortController(); timeoutId=setTimeout(()=>controller.abort(),options.timeout||14000); }
  let res,text="";
  try{
    res=await fetch(GO_GAME_SUPABASE_URL+path,{method:options.method||"GET",headers,body:options.body==null?undefined:JSON.stringify(options.body),signal:controller?controller.signal:undefined});
    text=await res.text();
  }finally{ if(timeoutId)clearTimeout(timeoutId); }
  let data=null; try{ data=text?JSON.parse(text):null; }catch(e){ data=text; }
  if(!res.ok){
    if(res.status===401&&options.retry!==false&&onlineState.session&&onlineState.session.refresh_token&&!path.includes("/auth/v1/token")){
      const refreshed=await refreshOnlineSession().catch(()=>false);
      if(refreshed)return onlineRequest(path,{...options,retry:false});
    }
    const err=new Error((data&&(data.message||data.error_description||data.error))||("HTTP "+res.status)); err.status=res.status; err.data=data; throw err;
  }
  return data;
}
async function refreshOnlineSession(){
  const refresh=onlineState.session&&onlineState.session.refresh_token;
  if(!refresh)return false;
  const data=await onlineRequest("/auth/v1/token?grant_type=refresh_token",{method:"POST",auth:false,retry:false,body:{refresh_token:refresh}});
  return onlineStoreSession(data);
}
async function ensureOnlineSession(){
  if(!onlineState.session)loadOnlineSession();
  if(!onlineState.session||!onlineState.session.access_token)throw new Error("Connecte ton compte GO GAME d’abord");
  if(onlineState.session.expires_at&&onlineState.session.expires_at<Date.now()+30000){
    const ok=await refreshOnlineSession().catch(()=>false);
    if(!ok){ clearOnlineSession(); throw new Error("Session expirée — reconnecte ton compte GO GAME"); }
  }
  if(!onlineState.session.user||!onlineState.session.user.id){
    const user=await onlineRequest("/auth/v1/user",{retry:false});
    onlineState.session.user=user; onlineStoreSession(onlineState.session);
  }
  return onlineState.session.user;
}
function onlineCredentials(){
  const email=String(onlineEl("onlineEmail").value||"").trim().toLowerCase();
  const password=String(onlineEl("onlinePassword").value||"");
  if(!/^\S+@\S+\.\S+$/.test(email))throw new Error("Adresse email invalide");
  if(password.length<6)throw new Error("Mot de passe : 6 caractères minimum");
  return {email,password};
}
async function onlineSignUp(){
  const creds=onlineCredentials();
  onlineSetStatus("✨ Création du compte GO GAME…");
  const data=await onlineRequest("/auth/v1/signup",{method:"POST",auth:false,body:creds});
  if(!onlineStoreSession(data))await onlineSignInWith(creds);
  onlineSetStatus("✅ Compte créé et connecté. Publie maintenant ton profil mondial.");
  await saveOnlineProfile().catch(()=>{});
}
async function onlineSignInWith(creds){
  const data=await onlineRequest("/auth/v1/token?grant_type=password",{method:"POST",auth:false,body:creds});
  if(!onlineStoreSession(data))throw new Error("Connexion refusée par Supabase Auth");
  return data;
}
async function onlineSignIn(){
  onlineSetStatus("🔐 Connexion GO GAME…");
  await onlineSignInWith(onlineCredentials());
  await fetchOnlineProfile().catch(()=>null);
  onlineSetStatus("✅ Connecté à GO GAME. Bon retour dans l’Arène, champion !");
}
async function onlineSignOut(){
  await leaveOnlineRoom(true).catch(()=>{});
  if(onlineState.session&&onlineState.session.access_token)await onlineRequest("/auth/v1/logout",{method:"POST",retry:false}).catch(()=>{});
  clearOnlineSession();
  onlineSetStatus("Hors ligne — le jeu local reste entièrement disponible.");
  showToast("🌐 Déconnecté de GO GAME");
}
async function fetchOnlineProfile(){
  const user=await ensureOnlineSession();
  const rows=await onlineRequest("/rest/v1/player_profiles?select=*&id=eq."+encodeURIComponent(user.id)+"&limit=1");
  onlineState.profile=Array.isArray(rows)&&rows.length?rows[0]:null;
  if(onlineState.profile){
    onlineEl("onlineDisplayName").value=onlineState.profile.display_name||"";
    onlineEl("onlineCountry").value=onlineState.profile.country_code||"GA";
    const idx=CHARACTERS.findIndex(c=>c.name===onlineState.profile.main_fighter);
    if(idx>=0){ onlineEl("onlineMainFighter").value=String(idx); onlineEl("onlineFighter").value=String(idx); }
  }
  syncOnlineUI();
  return onlineState.profile;
}
async function saveOnlineProfile(){
  const user=await ensureOnlineSession();
  const displayName=String(onlineEl("onlineDisplayName").value||"").trim().replace(/\s+/g," ");
  const country=String(onlineEl("onlineCountry").value||"GA").trim().toUpperCase().replace(/[^A-Z]/g,"").slice(0,2)||"GA";
  const fighterIdx=clamp(parseInt(onlineEl("onlineMainFighter").value||"0",10)||0,0,CHARACTERS.length-1);
  if(displayName.length<3||displayName.length>24)throw new Error("Pseudo public : 3 à 24 caractères");
  const row={id:user.id,display_name:displayName,country_code:country,main_fighter:CHARACTERS[fighterIdx].name};
  const rows=await onlineRequest("/rest/v1/player_profiles?on_conflict=id",{method:"POST",headers:{Prefer:"return=representation,resolution=merge-duplicates"},body:row}).catch(err=>{
    if(err&&err.status===409)throw new Error("Ce pseudo est déjà pris — choisis-en un autre");
    throw err;
  });
  onlineState.profile=Array.isArray(rows)&&rows.length?rows[0]:row;
  onlineSetStatus("✅ Profil mondial publié : "+displayName+" ("+country+")");
  syncOnlineUI();
  return onlineState.profile;
}
async function ensureOnlineProfile(){
  await ensureOnlineSession();
  if(!onlineState.profile)await fetchOnlineProfile().catch(()=>null);
  if(!onlineState.profile)await saveOnlineProfile();
  return onlineState.profile;
}
function populateOnlineFighters(){
  ["onlineMainFighter","onlineFighter"].forEach(id=>{
    const select=onlineEl(id); if(!select)return;
    const current=select.value||String(id==="onlineMainFighter"?selCharP1:selCharP1);
    select.innerHTML=CHARACTERS.map((c,i)=>{
      const locked=isCharLocked(c);
      return "<option value='"+i+"'"+(locked?" disabled":"")+">"+escapeHTML(c.name)+(locked?" 🔒":"")+" — "+escapeHTML(c.title)+"</option>";
    }).join("");
    select.value=isCharLocked(CHARACTERS[+current]||CHARACTERS[0])?"0":current;
  });
}
function syncOnlineUI(){
  const user=onlineState.session&&onlineState.session.user,profile=onlineState.profile;
  const summary=onlineEl("onlineAccountSummary");
  if(summary)summary.textContent=user?(profile?("✅ "+profile.display_name+" • "+(profile.country_code||"GA")+" • Main : "+(profile.main_fighter||"GÉDÉON")):("✅ Compte connecté ("+(user.email||"joueur GO GAME")+"). Publie ton profil pour rejoindre le classement.")):"Aucun compte connecté. Le classement public reste lisible, le jeu local reste 100 % jouable hors ligne.";
  const start=onlineEl("btnOnlineStartDuel");
  if(start)start.disabled=onlineState.busy||!(onlineState.isHost&&onlineState.room&&onlineState.room.guest_id&&onlineState.channel&&onlineState.channel.readyState==="open"&&!onlineState.started);
  const net=onlineEl("onlineNetStats");
  if(net)net.textContent="Réseau : "+(onlineState.channel&&onlineState.channel.readyState==="open"?"canal WebRTC ouvert":onlineState.room?"salon "+onlineState.room.code+" • "+onlineState.room.status:"en attente")+(onlineState.rttMs!=null?(" • ping ~"+Math.round(onlineState.rttMs)+" ms • délai d’entrée "+onlineState.suggestedDelay+" frames"):"")+" • Lockstep déterministe, pause désactivée pendant le duel.";
}
async function refreshOnlineLeaderboard(){
  const rows=await onlineRequest("/rest/v1/leaderboard?select=*&limit=100",{auth:false});
  onlineState.leaderboard=Array.isArray(rows)?rows:[];
  renderOnlineLeaderboard();
  return onlineState.leaderboard;
}
function renderOnlineLeaderboard(){
  const list=onlineEl("onlineLeaderboardList"); if(!list)return;
  const rows=[...onlineState.leaderboard].sort((a,b)=>((+b.wins||0)-(+a.wins||0))||(((+b.wins||0)/Math.max(1,+b.matches||1))-((+a.wins||0)/Math.max(1,+a.matches||1))));
  if(!rows.length){ list.innerHTML="<div class='onlineEmpty'>Classement vide pour le moment : les premiers duels co-vérifiés ouvriront le tableau.</div>"; return; }
  const medals=["🥇","🥈","🥉"];
  list.innerHTML="<table class='hallTable'><tr><th>#</th><th>Champion</th><th>Pays</th><th>V</th><th>D</th><th>Matchs</th><th>Ratio</th></tr>"+
    rows.slice(0,20).map((e,i)=>"<tr class='"+(i===0?"top1":"")+"'><td>"+(medals[i]||(i+1))+"</td><td>"+escapeHTML(e.display_name||"Joueur")+"</td><td>"+escapeHTML(e.country_code||"")+"</td><td><b>"+(+e.wins||0)+"</b></td><td>"+(+e.losses||0)+"</td><td>"+(+e.matches||0)+"</td><td>"+Math.round((+e.wins||0)/Math.max(1,+e.matches||1)*100)+"%</td></tr>").join("")+"</table>";
}
async function uploadOnlineSave(){
  const user=await ensureOnlineSession(); await ensureOnlineProfile();
  const row={user_id:user.id,slot:"main",save_data:exportProfileData(),game_version:GAME_VERSION};
  await onlineRequest("/rest/v1/cloud_saves?on_conflict=user_id,slot",{method:"POST",headers:{Prefer:"return=representation,resolution=merge-duplicates"},body:row});
  onlineSetCloudStatus("✅ Sauvegarde cloud envoyée le "+new Date().toLocaleString("fr-FR")+" (profil local V"+GAME_VERSION+").");
  showToast("☁️ Sauvegarde GO GAME envoyée");
}
async function downloadOnlineSave(){
  const user=await ensureOnlineSession();
  const rows=await onlineRequest("/rest/v1/cloud_saves?select=*&user_id=eq."+encodeURIComponent(user.id)+"&slot=eq.main&limit=1");
  if(!Array.isArray(rows)||!rows.length)throw new Error("Aucune sauvegarde cloud trouvée pour ce compte");
  if(typeof window.confirm==="function"&&!window.confirm("Télécharger la sauvegarde cloud et remplacer le profil local actuel ?"))return;
  applyProfileData(rows[0].save_data||{});
  populateSettings(); populateCustomize(); populateOnlineFighters();
  onlineEl("onlineDisplayName").value=(onlineState.profile&&onlineState.profile.display_name)||PROFILE.names.p1||"";
  goMenu();
  showToast("☁️ Sauvegarde cloud restaurée sur cet appareil");
}
async function publishOnlineReplay(){
  const user=await ensureOnlineSession(); await ensureOnlineProfile();
  const replay=lastReplayData||loadLastReplay();
  if(!replay||!isReplayData(replay))throw new Error("Aucun replay local à publier — termine un match d’abord");
  const size=JSON.stringify(replay).length;
  if(size>1600000)throw new Error("Replay trop volumineux pour la publication cloud");
  const row={owner_id:user.id,title:String(replay.title||defaultReplayTitle(replay)).slice(0,80),is_public:!!onlineEl("onlineReplayPublic").checked,replay_data:replay,replay_hash:replay.finalHash||null,game_version:replay.gameVersion||GAME_VERSION};
  const rows=await onlineRequest("/rest/v1/shared_replays",{method:"POST",headers:{Prefer:"return=representation"},body:row});
  onlineSetCloudStatus("✅ Replay publié dans le cloud ("+(row.is_public?"public":"privé")+") : "+row.title);
  if(row.is_public)await refreshOnlinePublicReplays().catch(()=>{});
  return Array.isArray(rows)?rows[0]:rows;
}
async function refreshOnlinePublicReplays(){
  const rows=await onlineRequest("/rest/v1/shared_replays?select=id,title,is_public,replay_hash,game_version,created_at&is_public=eq.true&order=created_at.desc&limit=12",{auth:false});
  onlineState.publicReplays=Array.isArray(rows)?rows:[];
  renderOnlinePublicReplays();
  return onlineState.publicReplays;
}
function renderOnlinePublicReplays(){
  const list=onlineEl("onlineReplayList"); if(!list)return;
  if(!onlineState.publicReplays.length){ list.innerHTML="<div class='onlineEmpty'>Aucun replay public pour le moment. Publie le premier grand match GO GAME !</div>"; return; }
  list.innerHTML=onlineState.publicReplays.map(r=>"<article class='replayCard'><div class='replayCardTop'><b>🎬 "+escapeHTML(r.title||"Replay GO GAME")+"</b><span>PUBLIC</span></div><small>🗓️ "+escapeHTML(new Date(r.created_at).toLocaleString("fr-FR"))+" • Version "+escapeHTML(r.game_version||"?")+" • 🔐 #"+escapeHTML(r.replay_hash||"sans-hash")+"</small><div class='replayActions'><button data-cloud-replay='"+escapeHTML(r.id)+"'>▶ Importer &amp; lire</button></div></article>").join("");
  list.querySelectorAll("[data-cloud-replay]").forEach(btn=>btn.onclick=()=>onlineRun(()=>importOnlineReplay(btn.dataset.cloudReplay)));
}
async function importOnlineReplay(id){
  const rows=await onlineRequest("/rest/v1/shared_replays?select=id,title,replay_data,replay_hash,game_version&id=eq."+encodeURIComponent(id)+"&limit=1",{auth:false});
  if(!Array.isArray(rows)||!rows.length||!rows[0].replay_data)throw new Error("Replay cloud introuvable");
  let replay=normalizeReplayData(JSON.parse(JSON.stringify(rows[0].replay_data)));
  if(!replay)throw new Error("Replay cloud incompatible avec cette version");
  const existing=replayLibrary.find(d=>d.finalHash&&replay.finalHash&&d.finalHash===replay.finalHash);
  if(existing)replay=existing;
  else {
    if(findReplayById(replay.id))replay.id="cloud-"+rows[0].id;
    addReplayToLibrary(replay);
  }
  showToast("🎬 Replay cloud importé dans ton Replay Studio");
  startReplayPlayback(replay);
}
function onlineSkinPayload(){
  const c=PROFILE.customColors&&PROFILE.customColors.p1;
  return c&&c.primary?{primary:c.primary,accent:c.accent||""}:{};
}
function applyOnlineIdentity(f,initial,skin){
  if(initial)f.letter=String(initial).toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,2)||f.letter;
  if(skin&&/^#[0-9a-f]{6}$/i.test(skin.primary||"")){
    f.skin.primary=skin.primary; f.skin.dark=shade(skin.primary,-62);
    if(/^#[0-9a-f]{6}$/i.test(skin.accent||"")){ f.skin.accent=skin.accent; f.skin.trail=skin.accent; }
  }
}
function makeOnlineRoomCode(){
  const alphabet="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let code="";
  const values=new Uint32Array(6);
  if(window.crypto&&crypto.getRandomValues)crypto.getRandomValues(values); else for(let i=0;i<values.length;i++)values[i]=(Math.random()*0xffffffff)>>>0;
  for(let i=0;i<6;i++)code+=alphabet[values[i]%alphabet.length];
  return code;
}
function onlineSelectedFighter(){ return clamp(parseInt(onlineEl("onlineFighter").value||String(selCharP1),10)||0,0,CHARACTERS.length-1); }
async function insertOnlineSignal(kind,payload){
  if(!onlineState.room||!onlineState.session||!onlineState.session.user)return;
  await onlineRequest("/rest/v1/online_signals",{method:"POST",headers:{Prefer:"return=minimal"},body:{room_code:onlineState.room.code,sender_id:onlineState.session.user.id,kind,payload:payload||{}}});
}
function sendOnlineChannel(msg){
  const ch=onlineState.channel;
  if(!ch||ch.readyState!=="open")return false;
  try{ ch.send(JSON.stringify(msg)); return true; }catch(e){ return false; }
}
function sendOnlinePing(){
  onlineState.pingSeq++; onlineState.lastPingAt=(typeof performance!=="undefined"?performance.now():Date.now());
  sendOnlineChannel({t:"ping",id:onlineState.pingSeq,ts:onlineState.lastPingAt});
}
function setupOnlineChannel(channel){
  onlineState.channel=channel; onlineTransportSend=sendOnlineChannel;
  channel.onopen=()=>{
    const cfg=(onlineState.room&&onlineState.room.config)||{};
    const opponentName=onlineState.isHost?(cfg.guestName||"ton adversaire"):(cfg.hostName||"ton adversaire");
    onlineSetRoomStatus("✅ Canal de duel ouvert avec "+opponentName+". "+(onlineState.isHost?"Tu peux lancer le duel.":"En attente du lancement par l’hôte."));
    sendOnlineChannel({t:"hello",name:onlineState.profile?onlineState.profile.display_name:"Joueur GO GAME",version:GAME_VERSION});
    sendOnlinePing(); syncOnlineUI();
  };
  channel.onmessage=event=>{
    let msg=null; try{ msg=JSON.parse(event.data); }catch(e){ return; }
    if(receiveOnlineNetMessage(msg)&&(msg.t==="input"||msg.t==="inputs"||msg.t==="check"))return;
    if(msg.t==="hello")onlineSetRoomStatus("🤝 Adversaire connecté : "+String(msg.name||"Joueur GO GAME").slice(0,24)+" • Version "+String(msg.version||"?"));
    else if(msg.t==="ping")sendOnlineChannel({t:"pong",id:msg.id,ts:msg.ts});
    else if(msg.t==="pong"&&msg.id===onlineState.pingSeq){
      const now=(typeof performance!=="undefined"?performance.now():Date.now());
      onlineState.rttMs=Math.max(1,now-onlineState.lastPingAt);
      onlineState.suggestedDelay=clamp(Math.ceil((onlineState.rttMs/2)/16.7)+3,4,12);
      syncOnlineUI();
    }
    else if(msg.t==="start"&&!onlineState.isHost)launchOnlineMatch(msg.config||(onlineState.room&&onlineState.room.config));
    else if(msg.t==="bye"){
      if(onlineSession.active)handleOnlinePeerClosed("L’adversaire a quitté le duel.");
      else onlineSetRoomStatus("L’adversaire a quitté le salon.");
    }
  };
  channel.onclose=()=>{ if(!onlineState.closing)handleOnlinePeerClosed("Connexion WebRTC fermée."); };
  channel.onerror=()=>{ if(!onlineState.closing)onlineSetRoomStatus("⚠️ Erreur du canal WebRTC — le salon reste ouvert quelques instants."); };
}
function createOnlinePeer(isHost){
  const PC=window.RTCPeerConnection||window.webkitRTCPeerConnection;
  if(!PC)throw new Error("WebRTC indisponible : utilise un navigateur moderne en HTTPS pour les duels");
  if(onlineState.peer){ try{onlineState.peer.close();}catch(e){} }
  const pc=new PC({iceServers:[{urls:"stun:stun.l.google.com:19302"},{urls:"stun:stun1.l.google.com:19302"}]});
  onlineState.peer=pc; onlineState.pendingIce=[]; onlineState.remoteDescriptionSet=false; onlineState.channel=null;
  pc.onicecandidate=event=>{ if(event.candidate)insertOnlineSignal("ice",event.candidate.toJSON?event.candidate.toJSON():event.candidate).catch(()=>{}); };
  pc.onconnectionstatechange=()=>{
    if(pc.connectionState==="failed"&&!onlineState.closing)onlineSetRoomStatus("⚠️ Connexion directe impossible entre les deux réseaux. Réessaie ou change de Wi-Fi/4G.");
    if(pc.connectionState==="disconnected"&&onlineSession.active&&!onlineState.closing)onlineSetRoomStatus("⚠️ Connexion instable — le lockstep attend les inputs pour éviter toute désynchronisation.");
  };
  if(isHost)setupOnlineChannel(pc.createDataChannel("gogame-lockstep",{ordered:true}));
  else pc.ondatachannel=event=>setupOnlineChannel(event.channel);
  return pc;
}
async function flushOnlineIce(){
  const pc=onlineState.peer; if(!pc||!onlineState.remoteDescriptionSet)return;
  const pending=onlineState.pendingIce.splice(0);
  for(const candidate of pending){ try{ await pc.addIceCandidate(candidate); }catch(e){} }
}
async function processOnlineSignal(row){
  const pc=onlineState.peer; if(!pc||!row)return;
  if(row.kind==="ice"){
    const candidate=row.payload;
    if(onlineState.remoteDescriptionSet){ try{ await pc.addIceCandidate(candidate); }catch(e){} }
    else onlineState.pendingIce.push(candidate);
    return;
  }
  if(row.kind==="offer"&&!onlineState.isHost&&!onlineState.remoteDescriptionSet){
    await pc.setRemoteDescription(row.payload); onlineState.remoteDescriptionSet=true; await flushOnlineIce();
    const answer=await pc.createAnswer(); await pc.setLocalDescription(answer);
    await insertOnlineSignal("answer",{type:pc.localDescription.type,sdp:pc.localDescription.sdp});
    onlineSetRoomStatus("📡 Offre reçue, réponse envoyée. Ouverture du canal de duel…");
    return;
  }
  if(row.kind==="answer"&&onlineState.isHost&&!onlineState.remoteDescriptionSet){
    await pc.setRemoteDescription(row.payload); onlineState.remoteDescriptionSet=true; await flushOnlineIce();
    onlineSetRoomStatus("📡 Réponse de l’adversaire reçue. Ouverture du canal de duel…");
  }
}
async function pollOnlineSignals(){
  if(!onlineState.room||onlineState.signalBusy||!onlineState.session)return;
  onlineState.signalBusy=true;
  try{
    const rows=await onlineRequest("/rest/v1/online_signals?select=*&room_code=eq."+encodeURIComponent(onlineState.room.code)+"&order=created_at.asc&limit=120",{timeout:8000});
    const myId=onlineState.session.user&&onlineState.session.user.id;
    for(const row of (Array.isArray(rows)?rows:[])){
      if(!row||onlineState.processedSignals.has(row.id))continue;
      onlineState.processedSignals.add(row.id);
      if(row.sender_id===myId)continue;
      await processOnlineSignal(row);
    }
  }catch(e){ /* le prochain cycle réessaie */ }
  finally{ onlineState.signalBusy=false; }
}
async function pollOnlineRoom(){
  if(!onlineState.room||!onlineState.session)return;
  try{
    const rows=await onlineRequest("/rest/v1/online_rooms?select=*&code=eq."+encodeURIComponent(onlineState.room.code)+"&limit=1",{timeout:8000});
    if(Array.isArray(rows)&&rows.length){
      onlineState.room=rows[0];
      if(onlineState.room.guest_id&&onlineState.isHost&&!onlineState.started)onlineSetRoomStatus("🎟️ "+String((onlineState.room.config||{}).guestName||"Ton adversaire")+" a rejoint le salon "+onlineState.room.code+".");
      syncOnlineUI();
    }
  }catch(e){}
}
function startOnlinePolling(){
  if(onlineState.pollTimer)return;
  onlineState.pollTimer=setInterval(()=>{ pollOnlineSignals(); pollOnlineRoom(); },700);
  pollOnlineSignals(); pollOnlineRoom();
}
function stopOnlinePolling(){ if(onlineState.pollTimer){ clearInterval(onlineState.pollTimer); onlineState.pollTimer=0; } }
async function createOnlineRoom(){
  const user=await ensureOnlineSession(); const profile=await ensureOnlineProfile();
  await leaveOnlineRoom(false).catch(()=>{});
  let code=String(onlineEl("onlineRoomCode").value||"").trim().toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,8);
  if(code.length<4)code=makeOnlineRoomCode();
  const seed=makeReplaySeed();
  const arenaId=onlineEl("onlineArena").value||"stadium",moodPref=onlineEl("onlineMood").value||"auto";
  const config={version:GAME_VERSION,seed,matchKey:code+"-"+seed.toString(16)+"-"+Date.now().toString(36),hostId:user.id,hostName:profile.display_name,hostChar:onlineSelectedFighter(),hostCountry:profile.country_code||"GA",hostInitial:PROFILE.initials.p1||"G",hostSkin:onlineSkinPayload(),arena:arenaId,arenaMood:resolveArenaMood(arenaId,moodPref),arenaMoodPreference:moodPref,settings:{roundTime:SETTINGS.roundTime,roundsWin:SETTINGS.roundsWin},inputDelay:6};
  const rows=await onlineRequest("/rest/v1/online_rooms",{method:"POST",headers:{Prefer:"return=representation"},body:{code,host_id:user.id,status:"open",config}}).catch(err=>{
    if(err&&err.status===409)throw new Error("Ce code de salon est déjà utilisé — laisse le champ vide pour en générer un");
    throw err;
  });
  onlineState.room=Array.isArray(rows)?rows[0]:rows; onlineState.isHost=true; onlineState.started=false; onlineState.closing=false; onlineState.processedSignals.clear();
  onlineEl("onlineRoomCode").value=code;
  const pc=createOnlinePeer(true);
  const offer=await pc.createOffer(); await pc.setLocalDescription(offer);
  await insertOnlineSignal("offer",{type:pc.localDescription.type,sdp:pc.localDescription.sdp});
  startOnlinePolling();
  onlineSetRoomStatus("🏟️ Salon créé : code "+code+" — envoie-le à ton adversaire. En attente de connexion…");
  onlineSetStatus("🌐 Salon GO GAME "+code+" ouvert. Ton adversaire peut le rejoindre.");
  syncOnlineUI();
}
async function joinOnlineRoom(){
  const user=await ensureOnlineSession(); const profile=await ensureOnlineProfile();
  const code=String(onlineEl("onlineRoomCode").value||"").trim().toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,8);
  if(code.length<4)throw new Error("Entre le code du salon de ton adversaire");
  await leaveOnlineRoom(false).catch(()=>{});
  const guestConfig={guestName:profile.display_name,guestChar:onlineSelectedFighter(),guestCountry:profile.country_code||"GA",guestInitial:PROFILE.initials.p1||"J",guestSkin:onlineSkinPayload()};
  const room=await onlineRequest("/rest/v1/rpc/join_online_room",{method:"POST",body:{room_code:code,guest_config:guestConfig}});
  onlineState.room=Array.isArray(room)?room[0]:room; onlineState.isHost=false; onlineState.started=false; onlineState.closing=false; onlineState.processedSignals.clear();
  createOnlinePeer(false); startOnlinePolling();
  onlineSetRoomStatus("🎟️ Salon "+code+" rejoint. Connexion directe à l’hôte en cours…");
  syncOnlineUI();
}
async function startOnlineDuel(){
  if(!onlineState.isHost)throw new Error("Seul l’hôte lance le duel");
  if(!onlineState.room||!onlineState.room.guest_id)throw new Error("En attente de ton adversaire dans le salon");
  if(!onlineState.channel||onlineState.channel.readyState!=="open")throw new Error("Le canal WebRTC n’est pas encore ouvert");
  const config={...(onlineState.room.config||{}),inputDelay:onlineState.suggestedDelay||6};
  const rows=await onlineRequest("/rest/v1/online_rooms?code=eq."+encodeURIComponent(onlineState.room.code),{method:"PATCH",headers:{Prefer:"return=representation"},body:{status:"playing",config}});
  onlineState.room=Array.isArray(rows)&&rows.length?rows[0]:{...onlineState.room,status:"playing",config};
  sendOnlineChannel({t:"start",config});
  onlineSetRoomStatus("🚀 Duel lancé ! Synchronisation lockstep…");
  setTimeout(()=>launchOnlineMatch(config),320);
}
function launchOnlineMatch(config){
  if(!config||onlineState.started)return false;
  if(!config.hostId||!config.guestId||String(config.matchKey||"").length<8){ onlineSetRoomStatus("⚠️ Configuration du duel incomplète (joueur ou clé de match manquant)."); return false; }
  if(config.version!==GAME_VERSION){
    onlineSetRoomStatus("⚠️ Versions incompatibles : hôte V"+String(config.version||"?")+", ton jeu V"+GAME_VERSION+". Mettez tous les deux GO GAME à jour.");
    showToast("🌐 Duel refusé : versions du jeu différentes.");
    sendOnlineChannel({t:"bye"});
    return false;
  }
  onlineState.started=true; stopOnlinePolling();
  mode="online"; pendingMode="online";
  resetOnlineSession(config,onlineState.isHost?1:2);
  if(config.settings){
    SETTINGS.roundTime=[0,60,99,120].includes(+config.settings.roundTime)?+config.settings.roundTime:99;
    SETTINGS.roundsWin=clamp(parseInt(config.settings.roundsWin,10)||2,1,3);
  }
  applyCharacterTo(p1,clamp(config.hostChar||0,0,CHARACTERS.length-1));
  applyCharacterTo(p2,clamp(config.guestChar==null?1:config.guestChar,0,CHARACTERS.length-1));
  applyOnlineIdentity(p1,config.hostInitial,config.hostSkin);
  applyOnlineIdentity(p2,config.guestInitial,config.guestSkin);
  setArenaById(config.arena||"stadium",config.arenaMood||"auto");
  buildDisplayNames(); p1.reset(); p2.reset(); placeMenuFighters();
  showOnly(null); beginMatch();
  $("roundLabel").textContent="🌐 DUEL EN LIGNE • "+String(config.hostName||"J1").toUpperCase()+" VS "+String(config.guestName||"J2").toUpperCase();
  showToast("🌐 Duel GO GAME synchronisé — que le meilleur gagne !");
  return true;
}
async function submitOnlineMatchResult(winner){
  const config=onlineSession&&onlineSession.config;
  if(!config||!onlineState.session)return;
  try{
    await ensureOnlineSession();
    const replay=lastReplayData;
    const body={match_key:config.matchKey,player_one_id:config.hostId,player_two_id:config.guestId,winner_id:winner===p1?config.hostId:config.guestId,player_one_fighter:(CHARACTERS[config.hostChar]||{}).name||p1.char.name,player_two_fighter:(CHARACTERS[config.guestChar]||{}).name||p2.char.name,arena:config.arena,arena_mood:config.arenaMood,mode:"online",verification_hash:(replay&&replay.finalHash)||replayStateHash(),replay_hash:(replay&&replay.finalHash)||null,game_version:GAME_VERSION};
    const result=await onlineRequest("/functions/v1/submit-match-result",{method:"POST",body});
    if(result&&result.status==="verified"){ onlineSetStatus("🏆 Résultat en ligne co-vérifié et ajouté au classement mondial !"); refreshOnlineLeaderboard().catch(()=>{}); }
    else if(result&&result.status==="already_verified")onlineSetStatus("🏆 Résultat déjà vérifié au classement mondial.");
    else onlineSetStatus("🌐 Résultat envoyé : en attente de la confirmation identique de ton adversaire.");
  }catch(err){
    const data=err&&err.data;
    onlineSetStatus(data&&data.status==="mismatch"?"⚠️ Résultats divergents entre les deux joueurs : aucun point classé.":("⚠️ Résultat non classé : "+onlineErrorText(err)));
  }
}
function handleOnlinePeerClosed(message){
  if(onlineState.closing)return;
  onlineSetRoomStatus("⚠️ "+message);
  if(onlineSession.active){
    showToast("🌐 "+message+" Match interrompu proprement.");
    leaveOnlineRoom(true).catch(()=>{}).finally(()=>goMenu());
  }
}
function onOnlineDesync(frame){
  setTimeout(()=>{
    showToast("⚠️ Désynchronisation détectée à la frame "+frame+" — duel arrêté avant tout résultat classé.");
    onlineSetStatus("⚠️ Désynchronisation réseau détectée : aucun résultat ne sera classé.");
    leaveOnlineRoom(true).catch(()=>{}).finally(()=>goMenu());
  },0);
}
async function leaveOnlineRoom(updateRemote){
  const room=onlineState.room;
  onlineState.closing=true; stopOnlinePolling();
  if(onlineState.channel&&onlineState.channel.readyState==="open")sendOnlineChannel({t:"bye"});
  if(onlineSession&&(onlineSession.active||onlineSession.started))stopOnlineSession("disconnect");
  if(onlineState.channel){ try{onlineState.channel.close();}catch(e){} }
  if(onlineState.peer){ try{onlineState.peer.close();}catch(e){} }
  onlineState.channel=null; onlineState.peer=null; onlineTransportSend=null; onlineState.started=false;
  onlineState.room=null; onlineState.isHost=false; onlineState.processedSignals.clear(); onlineState.pendingIce=[];
  if(updateRemote&&room&&onlineState.session){
    await onlineRequest("/rest/v1/online_rooms?code=eq."+encodeURIComponent(room.code),{method:"PATCH",headers:{Prefer:"return=minimal"},body:{status:"closed"},timeout:6000}).catch(()=>{});
  }
  onlineState.closing=false; syncOnlineUI();
}
async function openOnline(){
  audio(); populateOnlineFighters();
  if(!onlineEl("onlineDisplayName").value)onlineEl("onlineDisplayName").value=(PROFILE.names.p1||"Champion GO GAME").slice(0,24);
  if(selArenaId!=="random")onlineEl("onlineArena").value=selArenaId;
  onlineEl("onlineMood").value=selArenaMood;
  showOnly("menuOnline"); syncOnlineUI();
  onlineRun(async()=>{
    await refreshOnlineLeaderboard().catch(()=>{});
    if(onlineState.session)await fetchOnlineProfile().catch(()=>null);
  });
}
function initOnlineClient(){
  loadOnlineSession(); populateOnlineFighters();
  const user=onlineState.session&&onlineState.session.user;
  if(user&&user.email)onlineEl("onlineEmail").value=user.email;
  onlineEl("onlineDisplayName").value=(PROFILE.names.p1||"Champion GO GAME").slice(0,24);
  onlineEl("onlineCountry").value="GA";
  if(selArenaId!=="random")onlineEl("onlineArena").value=selArenaId;
  onlineEl("onlineMood").value=selArenaMood;
  syncOnlineUI();
}
function bindOnlineUI(){
  onlineEl("btnOnline").onclick=openOnline;
  onlineEl("btnOnlineBack").onclick=()=>showOnly("menuMain");
  onlineEl("btnOnlineSignUp").onclick=()=>onlineRun(onlineSignUp);
  onlineEl("btnOnlineSignIn").onclick=()=>onlineRun(onlineSignIn);
  onlineEl("btnOnlineSaveProfile").onclick=()=>onlineRun(saveOnlineProfile);
  onlineEl("btnOnlineSignOut").onclick=()=>onlineRun(onlineSignOut);
  onlineEl("btnOnlineCreateRoom").onclick=()=>onlineRun(createOnlineRoom);
  onlineEl("btnOnlineJoinRoom").onclick=()=>onlineRun(joinOnlineRoom);
  onlineEl("btnOnlineStartDuel").onclick=()=>onlineRun(startOnlineDuel);
  onlineEl("btnOnlineLeaveRoom").onclick=()=>onlineRun(async()=>{ await leaveOnlineRoom(true); onlineSetRoomStatus("Salon quitté. Crée un nouveau code ou rejoins celui d’un adversaire."); });
  onlineEl("btnOnlineRefreshLeaderboard").onclick=()=>onlineRun(refreshOnlineLeaderboard);
  onlineEl("btnOnlineUploadSave").onclick=()=>onlineRun(uploadOnlineSave);
  onlineEl("btnOnlineDownloadSave").onclick=()=>onlineRun(downloadOnlineSave);
  onlineEl("btnOnlinePublishReplay").onclick=()=>onlineRun(publishOnlineReplay);
  onlineEl("btnOnlineRefreshReplays").onclick=()=>onlineRun(refreshOnlinePublicReplays);
  onlineEl("onlineRoomCode").addEventListener("input",e=>{ e.target.value=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,8); });
  onlineEl("onlineCountry").addEventListener("input",e=>{ e.target.value=e.target.value.toUpperCase().replace(/[^A-Z]/g,"").slice(0,2); });
  onlineEl("onlineMainFighter").addEventListener("change",e=>{ onlineEl("onlineFighter").value=e.target.value; });
}

/* ---------------- MODE HISTOIRE : SCÈNES ---------------- */
function storyDialogueHTML(lines){
  return lines.map(line=>"<p class='"+(line[0]==="NARRATION"?"narr":"")+"'><b>"+escapeHTML(line[0]==="TOI"?(PROFILE.names.p1||"TOI").toUpperCase():line[0])+"</b>"+escapeHTML(line[1])+"</p>").join("");
}
function showStoryScene(phase){
  audio(); pendingMode="story"; mode="story"; storyPhase=phase||"intro";
  const fight=currentStoryFight();
  $("hud").style.display="none"; $("trainingBar").style.display="none"; hideAnnounce();
  if(storyPhase!=="ending"&&storyPhase!=="chapter1Ending")prepareMatch(false);
  $("storyKicker").textContent=storyPhase==="ending"?"👑 FIN DE LA SAGA — CHAPITRE 2 TERMINÉ":storyPhase==="chapter1Ending"?"🏆 FIN DU CHAPITRE 1":storyPhase==="retry"?"📖 MODE HISTOIRE — NOUVEL ESSAI":"📖 "+(fight.act||STORY_CAMPAIGN.title).toUpperCase();
  $("storyTitle").textContent=storyPhase==="ending"?"🌴 La légende de Libreville":storyPhase==="chapter1Ending"?"👑 Un champion est né":fight.chapter;
  $("storyText").innerHTML=storyPhase==="ending"?storyDialogueHTML(STORY_CAMPAIGN.ending):storyPhase==="chapter1Ending"?storyDialogueHTML(STORY_CAMPAIGN.chapter1Ending):storyPhase==="retry"?storyDialogueHTML([["NARRATION",fight.retry]]):storyDialogueHTML(fight.dialogue);
  $("storyObjective").textContent=storyPhase==="ending"?"🎁 Récompenses : GODSON PRIME jouable + tenue « Coucher de soleil de Libreville » disponible dans la Personnalisation. Ton score est au Hall of Fame !":storyPhase==="chapter1Ending"?"🎁 Récompense : GODSON PRIME est jouable. Le Chapitre 2 t’attend maintenant sur la Plage de Libreville !":"🎯 Objectif : "+fight.objective;
  $("storyDots").innerHTML=STORY_CAMPAIGN.fights.map((_,i)=>"<i class='"+(storyPhase==="ending"||(storyPhase==="chapter1Ending"&&i<3)||i+1<story.step?"done":i+1===story.step?"now":"")+"'></i>").join("");
  $("btnStoryContinue").textContent=storyPhase==="ending"?"🏆 Retourner au menu — Légende !":storyPhase==="chapter1Ending"?"🌴 Commencer le Chapitre 2 — Libreville":storyPhase==="retry"?"↻ Relever le défi":"⚔️ Commencer le combat";
  $("btnStoryQuit").style.display=storyPhase==="ending"?"none":"";
  showOnly("menuStory");
  if(AC&&!musicTimer)startMusic();
}
function storyContinue(){
  if(storyPhase==="ending"){ goMenu(); showToast("🌴 Saga terminée : GODSON PRIME + tenue de Libreville débloqués !"); return; }
  if(storyPhase==="chapter1Ending"){ story.step=4; showStoryScene("intro"); return; }
  showVS(true);
}

/* ---------------- NAVIGATION MENUS ---------------- */
function goMenu(){
  flowDifficultyChosen=false; pendingLaunch=false;
  clearTimeout(vsTimeout); clearTouchInputs();
  cancelReplayRecording();
  if(replayPlayback.active||replayPlayback.ended)stopReplayPlayback(true);
  if(typeof leaveOnlineRoom==="function"&&(onlineSession.active||(typeof onlineState!=="undefined"&&onlineState.room&&state==="matchEnd")))leaveOnlineRoom(true);
  state="menu"; mode="bot"; stopMusic(); hideAnnounce();
  $("hud").style.display="none"; $("trainingBar").style.display="none"; $("touchUI").style.display="none";
  p1.roundWins=0; p2.roundWins=0; projectiles=[]; particles=[]; floaters=[]; rings=[]; ghosts=[];
  applyCharacterTo(p1,selCharP1); applyCharacterTo(p2,selCharP2<0?1:selCharP2);
  p1.reset(); p2.reset(); buildDisplayNames(); placeMenuFighters(); resetCamera(true);
  if(selArenaId!=="random")setArenaById(selArenaId);
  syncProfileUI(); showOnly("menuMain"); syncReplayUI();
  if(AC)startMusic();
}
/* V3.2 — Paysage prioritaire : plein écran immersif et verrouillage
   d'orientation en best effort, plus pause de Protection si l'appareil
   repasse en portrait pendant un combat local. */
async function requestImmersiveLandscape(){
  const el=$("gameWrap");
  try{
    if(el&&el.requestFullscreen){
      const r=el.requestFullscreen({navigationUI:"hide"});
      if(r&&r.catch)r.catch(()=>{ try{el.requestFullscreen();}catch(e){} });
    }
  }catch(e){ try{ if(el&&el.requestFullscreen)el.requestFullscreen(); }catch(e2){} }
  try{
    if(window.screen&&screen.orientation&&screen.orientation.lock){
      const p=screen.orientation.lock("landscape");
      if(p&&p.catch)p.catch(()=>{});
    }
  }catch(e){}
}
let portraitQuery=null;
function handlePortraitChange(){
  if(!portraitQuery)return;
  const portrait=!!portraitQuery.matches;
  document.body.classList.toggle("portraitSmall",portrait);
  if(portrait&&!document.body.classList.contains("allowPortrait")&&state==="fight"&&mode!=="online"&&!(typeof replayPlayback!=="undefined"&&replayPlayback.active))togglePause();
}
/* V3.5 : tenu en paysage sur téléphone, l'écran entier appartient au combat
   (en-tête masqué, stage à 100 % de la hauteur) dès qu'un match est en cours. */
function syncImmersiveCombat(){
  /* V4.0 : en combat, la barre système disparaît sur TOUS les écrans —
     100 % de la scène appartient au jeu, seule la pause flottante reste. */
  const on=(((typeof isCombat==="function")&&isCombat())||state==="intro"||state==="roundEnd"||state==="pause"||(typeof replayPlayback!=="undefined"&&replayPlayback.active));
  document.body.classList.toggle("combatImmersif",!!on);
}
function initPortraitGuard(){
  try{
    portraitQuery=window.matchMedia("(orientation: portrait) and (max-width: 860px)");
    if(portraitQuery.addEventListener)portraitQuery.addEventListener("change",handlePortraitChange);
    else if(portraitQuery.addListener)portraitQuery.addListener(handlePortraitChange);
    handlePortraitChange();
  }catch(e){}
}
function togglePause(){
  if(mode==="online"&&onlineSession.active){ showToast("🌐 Pause désactivée en duel en ligne."); return; }
  if(replayPlayback.active){ toggleReplayPause(); return; }
  if(replayPlayback.ended)return;
  if(state==="fight"||state==="intro"||state==="roundEnd"||state==="training"){ prevState=state; state="pause"; showOnly("menuPause"); }
  else if(state==="pause"){ state=prevState; showOnly(null); }
}

/* ---------------- FIN DE MATCH PRO ---------------- */
function matchScore(f,op){ return fighterMatchScore(f,op); }
function gradeFromScore(score){ return score>=520?"S":score>=420?"A":score>=315?"B":score>=210?"C":"D"; }
function matchGrade(f,op){ return gradeFromScore(matchScore(f,op)); }
function modeDisplayName(){
  return mode==="story"?"Histoire "+story.step+"/"+story.total:mode==="survival"?"Survie vague "+survival.wave:mode==="arcade"?"Championnat "+arcade.stage+"/"+arcadeTotal():mode==="online"?"Duel en ligne GO GAME":mode==="2p"?"2 Joueurs":mode==="training"?"Entraînement":"Bot "+DIFFS[botDiff].label;
}
function recordSurvivalRun(){
  if(survival.recorded)return;
  survival.recorded=true;
  if(!Array.isArray(PROFILE.leaderboard))PROFILE.leaderboard=[];
  const entry={id:"surv-"+Date.now(),name:p1.name,char:p1.char.name,score:survival.score,grade:gradeFromScore(survival.score),mode:"🌊 Survie — "+(PROFILE.stats.bestSurvivalWave||0)+" vague(s)",combo:p1.stats.maxCombo,date:new Date().toLocaleDateString("fr-FR")};
  PROFILE.leaderboard.push(entry); PROFILE.leaderboard.sort((a,b)=>b.score-a.score); PROFILE.leaderboard=PROFILE.leaderboard.slice(0,10);
  const idx=PROFILE.leaderboard.indexOf(entry); if(idx>=0)lastHallRank=idx+1;
  saveProfile();
}
function recordLeaderboard(winner){
  lastHallRank=0;
  if(mode==="training")return;
  if(mode==="survival"){ if(winner!==p1)recordSurvivalRun(); return; } // en Survie, une seule entrée par run (à la défaite ou via « Terminer »)
  const key=mode+"-"+simFrame+"-"+winner.id+"-"+p1.stats.damage+"-"+p2.stats.damage;
  if(recordedMatchKey===key)return; recordedMatchKey=key;
  if(!Array.isArray(PROFILE.leaderboard))PROFILE.leaderboard=[];
  const subjects=mode==="2p"?[winner]:(mode==="online"?[(onlineSession.localSide===2?p2:p1)]:[p1]);
  const stamp=Date.now();
  subjects.forEach((f,idx)=>{
    const op=f===p1?p2:p1,score=matchScore(f,op);
    const entry={id:stamp+"-"+idx+"-"+f.id,name:f.name,char:f.char.name,score,grade:gradeFromScore(score),mode:modeDisplayName(),combo:f.stats.maxCombo,date:new Date().toLocaleDateString("fr-FR")};
    PROFILE.leaderboard.push(entry);
  });
  PROFILE.leaderboard.sort((a,b)=>b.score-a.score);
  PROFILE.leaderboard=PROFILE.leaderboard.slice(0,10);
  const mine=PROFILE.leaderboard.findIndex(e=>String(e.id).startsWith(stamp+"-"));
  if(mine>=0)lastHallRank=mine+1;
  saveProfile();
}
function renderHall(){
  const list=$("hallList"),rows=PROFILE.leaderboard||[];
  if(!rows.length){ list.innerHTML="<div class='hallEmpty'>Aucun score pour le moment.<br>🏆 Termine un match pour inscrire ton nom dans la légende Gideon - Godson !</div>"; return; }
  const medals=["🥇","🥈","🥉"];
  list.innerHTML="<table class='hallTable'><tr><th>#</th><th>Champion</th><th>Personnage</th><th>Score</th><th>Note</th><th>Mode</th><th>Combo</th><th>Date</th></tr>"+
    rows.map((e,i)=>"<tr class='"+(i===0?"top1":"")+"'><td>"+(medals[i]||(i+1))+"</td><td>"+escapeHTML(e.name)+"</td><td>"+escapeHTML(e.char)+"</td><td><b>"+e.score+"</b></td><td>"+escapeHTML(e.grade)+"</td><td>"+escapeHTML(e.mode)+"</td><td>x"+e.combo+"</td><td>"+escapeHTML(e.date)+"</td></tr>").join("")+"</table>";
}
function statTable(winner){
  const row=(label,a,b)=>"<tr><th>"+label+"</th><td>"+a+"</td><td>"+b+"</td></tr>";
  const prec=f=>f.stats.attacks?Math.round(f.stats.hits/f.stats.attacks*100):0;
  return "<table><tr><th>📊 Statistiques</th><th>"+escapeHTML(p1.name)+"</th><th>"+escapeHTML(p2.name)+"</th></tr>"+
   row("Rounds gagnés",p1.roundWins,p2.roundWins)+
   row("Dégâts infligés",p1.stats.damage,p2.stats.damage)+
   row("Coups réussis / tentés",p1.stats.hits+" / "+p1.stats.attacks+" ("+prec(p1)+"%)",p2.stats.hits+" / "+p2.stats.attacks+" ("+prec(p2)+"%)")+
   row("Meilleur combo",p1.stats.maxCombo+" hits • "+p1.stats.maxComboDamage+" dégâts",p2.stats.maxCombo+" hits • "+p2.stats.maxComboDamage+" dégâts")+
   row("Coups bloqués",p1.stats.blocked,p2.stats.blocked)+
   row("✨ Parry parfaites",p1.stats.parries||0,p2.stats.parries||0)+
   row("🤼 Projections",p1.stats.throws||0,p2.stats.throws||0)+
   row("⚡ Godson Cancels / EX",(p1.stats.cancels||0)+" / "+(p1.stats.ex||0),(p2.stats.cancels||0)+" / "+(p2.stats.ex||0))+
   row("Temps de match","<span colspan='2'>"+fmtClock(matchElapsed)+"</span>","")+
   "</table><p style='margin-top:8px;text-align:center'>Score du vainqueur : <b>"+matchScore(winner,winner===p1?p2:p1)+"</b> • Note : <span class='grade'>"+matchGrade(winner,winner===p1?p2:p1)+"</span>"+(mode==="survival"?"<br>🌊 Run de Survie : vague "+survival.wave+" • Points de vague +"+survival.lastWaveScore+" • <b>Score total "+survival.score+"</b> • Record : vague "+(PROFILE.stats.bestSurvivalWave||0):"")+((typeof lastCareerReward!=="undefined"&&lastCareerReward)?"<br>🏆 Carrière Godson : <b>+"+lastCareerReward.xp+" XP</b> • <b>+"+lastCareerReward.coins+" Godson</b>"+(lastCareerReward.levelUp?" • ⭐ <b>NIVEAU "+lastCareerReward.levelAfter+" ATTEINT !</b>":" • Niveau "+lastCareerReward.levelAfter):"")+(lastHallRank?"<br>🏅 Nouveau Hall of Fame : <b>"+lastHallRank+"e place</b> !":"")+"</p>";
}
function showEndScreen(winner){
  lastEndWinner=winner; recordLeaderboard(winner);
  $("winnerTitle").textContent=winner.name.toUpperCase();
  $("winnerQuote").textContent="«"+(winner.char.victoryLine||"La victoire appartient à celles et ceux qui se relèvent toujours.")+"»";
  let kicker="🏆 VAINQUEUR DU MATCH 🏆",next=$("btnNextStage"),rematch=$("btnRematch"),change=$("btnEndSelect");
  next.classList.add("hidden"); rematch.classList.remove("hidden"); change.classList.remove("hidden");
  rematch.textContent="🔥 REVANCHE"; change.textContent="🥋 Changer de combattant";
  if(mode==="arcade"){
    rematch.classList.add("hidden");
    if(winner===p1&&arcade.stage>=arcadeTotal())kicker="👑 CHAMPION — "+(arcade.circuitName||"CHAMPIONNAT Godson").toUpperCase()+" 👑";
    else if(winner===p1){ kicker="✅ COMBAT "+arcade.stage+"/"+arcadeTotal()+" TERMINÉ — "+(arcade.circuitName||"Championnat"); next.textContent="➡ Combat suivant ("+(arcade.stage+1)+"/"+arcadeTotal()+")"; next.classList.remove("hidden"); }
    else { kicker="💀 DÉFAITE AU COMBAT "+arcade.stage+"/"+arcadeTotal(); next.textContent="↻ Réessayer ce combat"; next.classList.remove("hidden"); }
  }
  if(mode==="story"){
    rematch.classList.add("hidden"); change.classList.add("hidden");
    if(winner===p1&&story.step>=story.total){ kicker="👑 GODSON PRIME VAINCU — SAGA TERMINÉE 👑"; next.textContent="🎬 Voir la fin de la saga"; }
    else if(winner===p1&&story.step===3){ kicker="🏆 CHAPITRE 1 TERMINÉ — RÉCOMPENSE SECRÈTE 🏆"; next.textContent="🎬 Fin du Chapitre 1 & récompense"; }
    else if(winner===p1){ kicker="📖 COMBAT "+story.step+"/"+story.total+" TERMINÉ"; next.textContent="➡ Scène suivante (combat "+(story.step+1)+"/"+story.total+")"; }
    else { kicker="💀 DÉFAITE — "+currentStoryFight().chapter.toUpperCase(); next.textContent="↻ Réessayer ce combat"; }
    next.classList.remove("hidden");
  }
  if(mode==="survival"){
    if(winner===p1){
      rematch.classList.add("hidden");
      kicker="🌊 VAGUE "+survival.wave+" TERMINÉE — +35% DE VIE";
      next.textContent="➡ Vague suivante ("+(survival.wave+1)+")"; next.classList.remove("hidden");
      change.textContent="🏅 Terminer & enregistrer le score";
    }else{
      kicker="💀 RUN TERMINÉE — VAGUE "+survival.wave;
      rematch.textContent="🌊 Nouvelle run de Survie";
    }
  }
  if(mode==="online"){
    rematch.classList.add("hidden"); change.classList.add("hidden"); next.classList.add("hidden");
    kicker="🌐 DUEL EN LIGNE GO GAME TERMINÉ";
  }
  $("endKicker").textContent=kicker;
  $("endStats").innerHTML=statTable(winner);
  showOnly("menuEnd"); syncProfileUI();
}
function handleCampaignNext(){
  if(mode==="arcade"){ if(arcade.lastWin)arcade.stage=Math.min(arcadeTotal(),arcade.stage+1); pendingMode="arcade"; showVS(false); return; }
  if(mode==="survival"){ if(!survival.lastWin)return; survival.wave++; generateSurvivalWave(); pendingMode="survival"; showVS(false); return; }
  if(mode!=="story")return;
  pendingMode="story";
  if(!story.lastWin)showStoryScene("retry");
  else if(story.step===3)showStoryScene("chapter1Ending");
  else if(story.step<story.total){ story.step++; showStoryScene("intro"); }
  else showStoryScene("ending");
}

/* ---------------- RÉGLAGES ---------------- */
function populateSettings(){
  $("setMusicVol").value=SETTINGS.musicVol; $("setSfxVol").value=SETTINGS.sfxVol;
  $("lblMusicVol").textContent=SETTINGS.musicVol; $("lblSfxVol").textContent=SETTINGS.sfxVol;
  $("setQuality").value=SETTINGS.quality; $("setRoundTime").value=String(SETTINGS.roundTime);
  $("setRoundsWin").value=String(SETTINGS.roundsWin); $("setSpeed").value=String(SETTINGS.speed);
  $("setShake").value=SETTINGS.shake; $("lblShake").textContent=SETTINGS.shake;
  $("setShowFps").checked=!!SETTINGS.showFps; $("setReduceFlash").checked=!!SETTINGS.reduceFlash;
  $("fpsChip").classList.toggle("hidden",!SETTINGS.showFps);
}
function openSettings(){
  if(replayPlayback.active||replayPlayback.ended){ showToast("🎬 Quitte le replay pour ouvrir les réglages."); return; }
  audio();
  if(state==="fight"||state==="intro"||state==="roundEnd"||state==="training"){ prevState=state; state="pause"; settingsReturn="menuPause"; }
  else settingsReturn=state==="pause"?"menuPause":"menuMain";
  populateSettings(); showOnly("menuSettings");
}
function bindSettings(){
  const on=(id,fn,ev)=>$(id).addEventListener(ev||"input",fn);
  on("setMusicVol",e=>{ SETTINGS.musicVol=+e.target.value; $("lblMusicVol").textContent=e.target.value; applyAudioSettings(); saveProfile(); if(SETTINGS.musicVol>0&&AC&&!musicTimer)startMusic(); if(SETTINGS.musicVol<=0)stopMusic(); });
  on("setSfxVol",e=>{ SETTINGS.sfxVol=+e.target.value; $("lblSfxVol").textContent=e.target.value; applyAudioSettings(); saveProfile(); });
  on("setQuality",e=>{ SETTINGS.quality=e.target.value; applyQualitySettings(); saveProfile(); showToast("🎨 Qualité : "+e.target.options[e.target.selectedIndex].text); },"change");
  on("setRoundTime",e=>{ SETTINGS.roundTime=+e.target.value; saveProfile(); },"change");
  on("setRoundsWin",e=>{ SETTINGS.roundsWin=+e.target.value; buildPips(); saveProfile(); },"change");
  on("setSpeed",e=>{ SETTINGS.speed=+e.target.value; saveProfile(); },"change");
  on("setShake",e=>{ SETTINGS.shake=+e.target.value; $("lblShake").textContent=e.target.value; saveProfile(); });
  on("setShowFps",e=>{ SETTINGS.showFps=e.target.checked; $("fpsChip").classList.toggle("hidden",!SETTINGS.showFps); saveProfile(); },"change");
  on("setReduceFlash",e=>{ SETTINGS.reduceFlash=e.target.checked; saveProfile(); },"change");
  $("btnSettingsDone").onclick=()=>{ saveProfile(); if(settingsReturn==="menuPause"&&state==="pause")showOnly("menuPause"); else goMenu(); };
  $("btnResetStats").onclick=()=>{ if(confirm("Réinitialiser tes victoires, combos, succès et le Hall of Fame ? (GODSON PRIME et l’Histoire terminée seront conservés)")){ PROFILE.stats=defaultProfile().stats; PROFILE.ach={}; PROFILE.leaderboard=[]; saveProfile(); showToast("🗑 Statistiques et classement réinitialisés"); } };
}

/* ---------------- PERSONNALISATION ---------------- */
function populateCustomize(){
  $("custNameP1").value=PROFILE.names.p1; $("custNameP2").value=PROFILE.names.p2;
  $("custInitP1").value=PROFILE.initials.p1; $("custInitP2").value=PROFILE.initials.p2;
  const s1=effectiveSkin(CHARACTERS[selCharP1],1),s2=effectiveSkin(CHARACTERS[selCharP2<0?1:selCharP2],2);
  $("custP1Primary").value=s1.primary; $("custP1Accent").value=s1.accent;
  $("custP2Primary").value=s2.primary; $("custP2Accent").value=s2.accent;
  const preset=$("btnSunsetPreset");
  if(preset){ const unlocked=!!(PROFILE.unlocks&&PROFILE.unlocks.librevilleSkin); preset.disabled=!unlocked; preset.textContent=unlocked?"🌴 Tenue Coucher de soleil de Libreville (J1)":"🔒 Tenue de Libreville — termine le Chapitre 2"; preset.style.opacity=unlocked?1:.65; }
}
function applyCustomizePreview(){
  applyCharacterTo(p1,selCharP1); applyCharacterTo(p2,selCharP2<0?p2.charIndex:selCharP2);
  buildDisplayNames(); buildRosters();
}
function bindCustomize(){
  const name=(id,key)=>$(id).addEventListener("input",e=>{ PROFILE.names[key]=e.target.value.slice(0,16); saveProfile(); buildDisplayNames(); });
  name("custNameP1","p1"); name("custNameP2","p2");
  const init=(id,key)=>$(id).addEventListener("input",e=>{ e.target.value=e.target.value.toUpperCase().replace(/[^A-Z0-9]/gi,"").slice(0,2); PROFILE.initials[key]=e.target.value||(key==="p1"?"G":"R"); saveProfile(); applyCustomizePreview(); });
  init("custInitP1","p1"); init("custInitP2","p2");
  const color=(pid,aid,key)=>{ const upd=()=>{ PROFILE.customColors[key]={primary:$(pid).value,accent:$(aid).value}; saveProfile(); applyCustomizePreview(); }; $(pid).addEventListener("input",upd); $(aid).addEventListener("input",upd); };
  color("custP1Primary","custP1Accent","p1"); color("custP2Primary","custP2Accent","p2");
  $("btnCustReset").onclick=()=>{ PROFILE.customColors.p1=null; PROFILE.customColors.p2=null; saveProfile(); populateCustomize(); applyCustomizePreview(); showToast("🎨 Couleurs par défaut restaurées"); };
  $("btnSunsetPreset").onclick=()=>{
    if(!(PROFILE.unlocks&&PROFILE.unlocks.librevilleSkin)){ showToast("🔒 Termine le Chapitre 2 pour débloquer la tenue de Libreville"); return; }
    PROFILE.customColors.p1={primary:"#00acc1",accent:"#ff7043"}; saveProfile(); populateCustomize(); applyCustomizePreview(); showToast("🌴 Tenue Coucher de soleil de Libreville équipée pour le Joueur 1");
  };
  $("btnCustDone").onclick=()=>{ saveProfile(); populateOnlineFighters(); goMenu(); };
}

/* ---------------- LIAISONS GÉNÉRALES ---------------- */
/* V3.3 — Écran de chargement rapide : barre de progression, étapes et
   astuces, puis fondu vers le menu (environ 1,2 s, skippable au clic). */
const BOOT_TIPS=["💡 Astuce : garde juste avant l’impact = PARRY dorée, 0 dégât !","💡 Astuce : Poing + Pied au corps-à-corps = projection qui traverse la garde.","💡 Astuce : Spécial + Poing à 75 % d’énergie = attaque EX renforcée.","💡 Astuce : dash après un coup confirmé = Godson Cancel, le combo continue !"];
let bootTimer=null,bootDone=false;
function finishBoot(){
  if(bootDone)return; bootDone=true; window.__bootDone=true;
  if(bootTimer){ clearInterval(bootTimer); bootTimer=null; }
  const el=$("bootLoader"); if(!el)return;
  el.classList.add("done"); setTimeout(()=>el.classList.add("hidden"),300);
}
function startBoot(){
  const el=$("bootLoader"); if(!el){ bootDone=true; window.__bootDone=true; return; }
  const fill=$("bootFill"),pct=$("bootPct"),step=$("bootStep"),tip=$("bootTip");
  const steps=["Chargement du moteur…","Préparation des combattants…","Ouverture des arènes…","Accordage de l’ambiance…","Prêt !"];
  let p=0,tipIndex=0;
  const show=()=>{
    if(fill)fill.style.width=p+"%";
    if(pct)pct.textContent=p+"%";
    if(step)step.textContent=steps[Math.min(steps.length-1,Math.floor(p/25))];
    if(tip&&p>0&&p%34<9)tip.textContent=BOOT_TIPS[tipIndex++%BOOT_TIPS.length];
  };
  show();
  bootTimer=setInterval(()=>{
    p=Math.min(100,p+Math.ceil(Math.random()*13)+6); show();
    if(p>=100){ clearInterval(bootTimer); bootTimer=null; setTimeout(finishBoot,190); }
  },105);
  el.addEventListener("click",finishBoot);
  window.addEventListener("keydown",function skipBoot(){ finishBoot(); window.removeEventListener("keydown",skipBoot); });
  setTimeout(finishBoot,4200); /* filet de sécurité : jamais bloqué au chargement */
}
function bindUI(){
  document.addEventListener("pointerdown",()=>{ audio(); if((state==="menu"||state==="select"||state==="scene")&&AC&&!musicTimer)startMusic(); },{once:true});
  document.addEventListener("click",e=>{ if(e.target.closest("button")&&AC)SFX.click(); });
  $("btnModeStory").onclick=()=>{ audio(); setupStoryRun(); enterSelect("story"); };
  $("btnModeBot").onclick=()=>{ audio(); flowDifficultyChosen=false; pendingLaunch=false; enterSelect("bot"); };
  document.querySelectorAll("#menuBot [data-diff]").forEach(b=>b.onclick=()=>{ botDiff=b.dataset.diff; flowDifficultyChosen=true; refreshSelect(); if(pendingLaunch){ pendingLaunch=false; launchFromFlow(); } else enterSelect("bot"); });
  $("btnBotBack").onclick=()=>{ pendingLaunch=false; showOnly("menuArena"); };
  $("btnMode2P").onclick=()=>enterSelect("2p");
  $("btnModeArcade").onclick=()=>{ setupArcadeRun("stade"); enterSelect("arcade"); };
  const _bCareer=$("btnCareer"); if(_bCareer)_bCareer.onclick=openCareer;
  const _bCareerBack=$("btnCareerBack"); if(_bCareerBack)_bCareerBack.onclick=()=>showOnly("menuMain");
  $("btnModeSurvival").onclick=()=>{ audio(); setupSurvivalRun(); enterSelect("survival"); };
  $("btnModeTraining").onclick=()=>enterSelect("training");
  $("btnCustomize").onclick=()=>{ populateCustomize(); showOnly("menuCustomize"); };
  $("btnHall").onclick=()=>{ renderHall(); showOnly("menuHall"); };
  $("btnHallBack").onclick=()=>showOnly("menuMain");
  $("btnChallenges").onclick=()=>{ renderChallenges(); showOnly("menuChallenges"); };
  $("btnChallengesBack").onclick=()=>showOnly("menuMain");
  $("btnHow").onclick=()=>showOnly("menuHow");
  $("btnHowBack").onclick=()=>showOnly("menuMain");
  $("btnSettings").onclick=openSettings; $("btnSettingsTop").onclick=openSettings; $("btnPauseSettings").onclick=openSettings;
  $("btnSelectBack").onclick=()=>goMenu();
  $("btnSelectNext").onclick=()=>{ refreshSelect(); showOnly("menuArena"); };
  $("btnArenaBack").onclick=()=>showOnly("menuSelect");
  $("btnLaunchFight").onclick=()=>{ if(pendingMode==="bot"&&!flowDifficultyChosen){ pendingLaunch=true; showOnly("menuBot"); } else launchFromFlow(); };
  $("menuVS").onclick=skipVS;
  $("btnStoryContinue").onclick=storyContinue;
  $("btnStoryQuit").onclick=()=>{ saveProfile(); goMenu(); showToast("📖 Progression de l’Histoire sauvegardée — combat "+story.step+"/"+story.total); };
  $("btnResume").onclick=togglePause;
  $("btnRestart").onclick=()=>{ showOnly(null); beginMatch(); };
  $("btnRematch").onclick=()=>{ if(mode==="survival"){ setupSurvivalRun(); pendingMode="survival"; showVS(false); } else showVS(true); };
  $("btnNextStage").onclick=handleCampaignNext;
  $("btnEndSelect").onclick=()=>{ const m=mode;
    if(m==="survival"&&survival.lastWin&&state==="matchEnd"){ recordSurvivalRun(); goMenu(); showToast("🏅 Run de Survie enregistrée au Hall of Fame : "+survival.score+" points"); return; }
    if(m==="arcade")setupArcadeRun(arcade.circuit||"stade"); if(m==="story")setupStoryRun(); if(m==="survival")setupSurvivalRun(); enterSelect(m); };
  $("btnQuit1").onclick=goMenu; $("btnQuit2").onclick=goMenu; $("btnPauseTop").onclick=togglePause;
  $("btnFull").onclick=()=>{ if(document.fullscreenElement)document.exitFullscreen(); else requestImmersiveLandscape(); };
  const _bLand=$("btnLandscape"); if(_bLand)_bLand.onclick=requestImmersiveLandscape;
  const _bPort=$("btnPortraitAnyway"); if(_bPort)_bPort.onclick=()=>{ document.body.classList.add("allowPortrait"); };
  const _bPF=$("btnPauseFloat"); if(_bPF)_bPF.onclick=togglePause;
  initPortraitGuard();
  startBoot();
  $("btnTouch").onclick=function(){ touchEnabled=!touchEnabled; this.textContent=touchEnabled?"📱 Tactile : ON":"📱 Tactile"; $("touchUI").style.display=(touchEnabled&&(isCombat()||state==="intro"))?"flex":"none"; };
  // Entraînement
  document.querySelectorAll("#trainingBar [data-dummy]").forEach(b=>b.onclick=()=>{ dummyMode=b.dataset.dummy; document.querySelectorAll("#trainingBar [data-dummy]").forEach(x=>x.classList.toggle("on",x===b)); floater(640,240,"Mannequin : "+b.textContent,"#69f0ae"); });
  $("btnTrainReset").onclick=()=>resetTrainingPositions(false);
  $("btnTrainQuit").onclick=goMenu;
  // Tactile multi-touch : capture du pointeur + état visuel par bouton
  document.querySelectorAll(".tBtn").forEach(b=>{
    const k=b.dataset.t;
    b.setAttribute("aria-pressed","false");
    const on=e=>{ e.preventDefault(); audio(); try{ b.setPointerCapture(e.pointerId); }catch(err){} setTouchPointer(k,e.pointerId,true); };
    const off=e=>{ e.preventDefault(); setTouchPointer(k,e.pointerId,false); };
    b.addEventListener("pointerdown",on);
    b.addEventListener("pointerup",off);
    b.addEventListener("pointercancel",off);
    b.addEventListener("lostpointercapture",off);
    b.addEventListener("contextmenu",e=>e.preventDefault());
  });
  window.addEventListener("blur",clearTouchInputs);
  document.addEventListener("visibilitychange",()=>{ if(document.hidden)clearTouchInputs(); });
  window.addEventListener("gamepadconnected",e=>showToast("🎮 Manette connectée : "+String(e.gamepad.id).slice(0,34)));
}

/* ---------------- DÉMARRAGE ---------------- */
if("ontouchstart" in window){ touchEnabled=true; $("btnTouch").textContent="📱 Tactile : ON"; }
pendingMode="bot"; mode="bot";
if(isCharLocked(CHARACTERS[selCharP1]))selCharP1=0;
if(selCharP2>=0&&isCharLocked(CHARACTERS[selCharP2]))selCharP2=1;
if(selArenaId!=="random")setArenaById(selArenaId);
bindSettings(); bindCustomize(); bindUI(); bindReplayUI(); bindOnlineUI(); populateSettings(); populateCustomize(); initOnlineClient();
buildRosters(); buildArenaCards(); buildArenaMoodCards(); updateLaunchSummary(); renderMoveList();
buildPips(); goMenu(); startLoop();
console.log("%cGÉDÉON - Godson ARENA V"+GAME_VERSION+" PRO%c signé Gideon - Godson © 2026 • Manager & Développeur principal : Assistant Arena","font-size:20px;font-weight:900;color:#ffc400","color:#7ee2a8");
