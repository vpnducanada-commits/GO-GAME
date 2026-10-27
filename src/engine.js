"use strict";
/* =====================================================================
   Godson FURY ARENA V7.16 — RÉACTIONS & RÉCEPTIONS, APPUIS & PIVOTS, Colonne VIVANTE & MOUVEMENT RÉEL
   Physique 60 img/s interpolée, combos annulables, IA adaptative,
   projections, EX, Godson Cancel et lockstep en ligne Godson FURY.
   Signé : Gideon - Godson
   ===================================================================== */
const GAME_VERSION="7.16.0";
const GAME_TITLE="Godson FURY ARENA";
const GAME_SUBTITLE="L’Arène des Légendes";
const W=1280,H=720,GROUND=600;
const canvas=document.getElementById("game");
let ctx=canvas.getContext("2d",{alpha:true}); // alpha : en mode 3D, ce canvas devient l’overlay transparent au-dessus de WebGL ; « let » pour les portraits V3.7
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const _shadeCache=new Map();
function shade(hex,amt){ const key=hex+":"+amt,cached=_shadeCache.get(key); if(cached)return cached; const n=parseInt(hex.slice(1),16); let r=(n>>16)+amt,g=((n>>8)&255)+amt,b=(n&255)+amt; r=clamp(r,0,255);g=clamp(g,0,255);b=clamp(b,0,255); const out="#"+((r<<16)|(g<<8)|b).toString(16).padStart(6,"0"); if(_shadeCache.size>512)_shadeCache.clear(); _shadeCache.set(key,out); return out; }

/* ---------------- PROFIL & SAUVEGARDE LOCALE ---------------- */
const SAVE_KEY="gideonGodsonArenaV2Pro";
const store={
  get(){ try{return window.localStorage.getItem(SAVE_KEY);}catch(e){return null;} },
  set(v){ try{window.localStorage.setItem(SAVE_KEY,v);}catch(e){} },
  del(){ try{window.localStorage.removeItem(SAVE_KEY);}catch(e){} }
};
function defaultProfile(){ return {
  settings:{musicVol:70,sfxVol:90,quality:"auto",screenFormat:"adaptatif",renderer3d:"auto",roundTime:99,roundsWin:2,speed:1,shake:100,showFps:false,reduceFlash:false},
  names:{p1:"Gideon",p2:"Joueur 2"}, initials:{p1:"G",p2:"R"},
  customColors:{p1:null,p2:null},
  selection:{charP1:0,charP2:1,arena:"stadium",arenaMood:"auto"},
  stats:{wins:0,losses:0,matches:0,bestCombo:0,bestComboDamage:0,arcadeClears:0,bestSurvivalWave:0,survivalRuns:0,bestParriesMatch:0,totalParries:0},
  unlocks:{prime:false,librevilleSkin:false},
  story:{progressStep:1,completed:false,clears:0,chapter1Completed:false,chapter2Completed:false,chapter2Clears:0},
  career:{xp:0,Godson:0,title:"",titles:[],questsClaimed:{},fighterWins:{},circuits:{stade:0,monde:0,legendes:0},bestStage:0,lastReward:"",season:{id:"saison-1-aurore",points:0,claimed:{},tournaments:0,matchWins:0,titles:{express:0,godson:0,legendes:0},bestPlacementRank:0,bestPlacement:"",history:[],archive:[],lastTournament:null},activeTournament:null},
  leaderboard:[],
  ach:{}
};}
function normalizeProfileData(p){
  const d=defaultProfile(),src=p&&typeof p==="object"?p:{};
  const normalized={...d,...src,settings:{...d.settings,...(src.settings||{})},names:{...d.names,...(src.names||{})},initials:{...d.initials,...(src.initials||{})},customColors:{...d.customColors,...(src.customColors||{})},selection:{...d.selection,...(src.selection||{})},stats:{...d.stats,...(src.stats||{})},unlocks:{...d.unlocks,...(src.unlocks||{})},story:{...d.story,...(src.story||{})},leaderboard:Array.isArray(src.leaderboard)?src.leaderboard:[],ach:src.ach||{}};
  const rawCareer=(src.career&&typeof src.career==="object")?src.career:{};
  const rawSeason=(rawCareer.season&&typeof rawCareer.season==="object")?rawCareer.season:{};
  normalized.career={...d.career,...rawCareer,circuits:{...d.career.circuits,...(rawCareer.circuits||{})},questsClaimed:{...(rawCareer.questsClaimed||{})},fighterWins:{...(rawCareer.fighterWins||{})},titles:Array.isArray(rawCareer.titles)?rawCareer.titles.slice(0,32):[],season:{...d.career.season,...rawSeason,claimed:{...(rawSeason.claimed||{})},titles:{...d.career.season.titles,...(rawSeason.titles||{})},history:Array.isArray(rawSeason.history)?rawSeason.history.slice(0,12):[],archive:Array.isArray(rawSeason.archive)?rawSeason.archive.slice(0,12):[],lastTournament:(rawSeason.lastTournament&&typeof rawSeason.lastTournament==="object")?rawSeason.lastTournament:null},activeTournament:(rawCareer.activeTournament&&typeof rawCareer.activeTournament==="object")?rawCareer.activeTournament:null};
  if(!src.career){
    // Migration V5 : les anciens champions conservent leur passé sous forme d'XP et de Godson.
    normalized.career.xp=(normalized.stats.wins||0)*45+(normalized.stats.matches||0)*12+(normalized.stats.arcadeClears||0)*250+(normalized.stats.bestSurvivalWave||0)*20+(normalized.story.chapter1Completed?250:0)+(normalized.story.chapter2Completed?350:0);
    normalized.career.Godson=(normalized.stats.wins||0)*8+(normalized.stats.arcadeClears||0)*100;
  }
  // Migration V2.4 : avant le Chapitre 2, story.completed signifiait « Chapitre 1 terminé ».
  if(normalized.story.completed&&!normalized.story.chapter2Completed){
    normalized.story.chapter1Completed=true; normalized.story.completed=false; normalized.story.progressStep=4;
  }
  return normalized;
}
let PROFILE=defaultProfile();
try{ const raw=store.get(); if(raw)PROFILE=normalizeProfileData(JSON.parse(raw)); }catch(e){}
let SETTINGS=PROFILE.settings;
function saveProfile(){ if(typeof syncTournamentToProfile==="function")syncTournamentToProfile(); SETTINGS=PROFILE.settings; store.set(JSON.stringify(PROFILE)); if(typeof syncProfileUI==="function")syncProfileUI(); }
function exportProfileData(){ return JSON.parse(JSON.stringify(PROFILE)); }
/* ---------------- CARRIÈRE V5 : XP, NIVEAUX, MONNAIE & TITRES ----------------
   La carrière relie tous les modes : chaque match terminé fait progresser le
   joueur, les championnats et la campagne offrent les plus grosses primes. */
let lastCareerReward=null;
let tournament=null,tournamentPendingFormat="godson";
function careerData(){
  if(!PROFILE.career||typeof PROFILE.career!=="object")PROFILE.career=defaultProfile().career;
  const c=PROFILE.career;
  c.xp=Math.max(0,Math.floor(+c.xp||0)); c.Godson=Math.max(0,Math.floor(+c.Godson||0));
  if(!c.circuits||typeof c.circuits!=="object")c.circuits={stade:0,monde:0,legendes:0};
  if(!c.season||typeof c.season!=="object")c.season=defaultProfile().career.season;
  const season=c.season;
  season.points=Math.max(0,Math.floor(+season.points||0)); season.tournaments=Math.max(0,Math.floor(+season.tournaments||0)); season.matchWins=Math.max(0,Math.floor(+season.matchWins||0));
  season.bestPlacementRank=Math.max(0,Math.floor(+season.bestPlacementRank||0)); if(typeof season.bestPlacement!=="string")season.bestPlacement="";
  if(!season.claimed||typeof season.claimed!=="object")season.claimed={};
  if(!season.titles||typeof season.titles!=="object")season.titles={express:0,godson:0,legendes:0};
  ["express","godson","legendes"].forEach(k=>{ season.titles[k]=Math.max(0,Math.floor(+season.titles[k]||0)); });
  if(!Array.isArray(season.history))season.history=[]; if(!Array.isArray(season.archive))season.archive=[];
  if(season.lastTournament&&typeof season.lastTournament!=="object")season.lastTournament=null;
  if(c.activeTournament&&typeof c.activeTournament!=="object")c.activeTournament=null;
  if(!c.questsClaimed||typeof c.questsClaimed!=="object")c.questsClaimed={};
  if(!c.fighterWins||typeof c.fighterWins!=="object")c.fighterWins={};
  if(!Array.isArray(c.titles))c.titles=[];
  if(typeof c.title!=="string")c.title="";
  return c;
}
function careerXpForLevel(level){ level=clamp(Math.floor(level)||1,1,50); return 50*level*(level-1); }
function careerLevelFromXp(xp){ xp=Math.max(0,Math.floor(+xp||0)); return clamp(Math.floor((Math.sqrt(1+8*xp/100)-1)/2)+1,1,50); }
function careerRankForLevel(level){ return level>=35?"🌌 Mythe Godson":level>=25?"👑 LÉGENDE Godson":level>=18?"🏆 Grand Maître":level>=12?"🐉 Maître de l’Arène":level>=8?"⚔️ Expert":level>=5?"🥊 Combattant confirmé":level>=3?"🌱 Espoir de l’Arène":"🎓 Débutant"; }
function careerProgress(){
  const c=careerData(),xp=c.xp,level=careerLevelFromXp(xp),floor=careerXpForLevel(level),next=level>=50?floor:careerXpForLevel(level+1),span=Math.max(1,next-floor),into=xp-floor;
  return {xp,coins:c.Godson,level,rank:careerRankForLevel(level),floor,next,into,needed:span,pct:level>=50?100:clamp(Math.round(into/span*100),0,100),title:c.title||""};
}
function awardCareer(xp,coins,reason){
  const c=careerData(),before=careerLevelFromXp(c.xp);
  c.xp+=Math.max(0,Math.round(xp||0)); c.Godson+=Math.max(0,Math.round(coins||0)); c.lastReward=reason||"Récompense de carrière";
  const after=careerLevelFromXp(c.xp);
  lastCareerReward={xp:Math.max(0,Math.round(xp||0)),coins:Math.max(0,Math.round(coins||0)),reason:c.lastReward,levelBefore:before,levelAfter:after,levelUp:after>before};
  return lastCareerReward;
}
function awardCareerForMatch(winner){
  if(replayPlayback.active||mode==="training")return null;
  const c=careerData();
  let subject=p1,localWin=winner===p1,xp=20,coins=12,reason="Match terminé";
  if(mode==="online"){ subject=onlineSession.localSide===2?p2:p1; localWin=winner===subject; xp=28; coins=16; reason="Duel en ligne"; }
  else if(mode==="2p"){ subject=winner||p1; localWin=true; xp=18; coins=10; reason="Duel local entre joueurs"; }
  else if(mode==="bot"){ xp=22; coins=14; reason="Versus Bot "+(DIFFS[botDiff]?DIFFS[botDiff].label:botDiff); if(botDiff==="moyen")xp+=8; if(botDiff==="difficile")xp+=20; }
  else if(mode==="story"){ xp=38; coins=24; reason="Campagne — combat "+story.step+"/"+story.total; if(localWin&&story.step===3){xp+=90;coins+=70;} if(localWin&&story.step>=story.total){xp+=220;coins+=180;} }
  else if(mode==="survival"){ xp=14+Math.min(30,survival.wave*2); coins=8+Math.min(30,survival.wave*2); reason="Survie — vague "+survival.wave; }
  else if(mode==="arcade"){
    const circuit=CHAMPIONSHIP_CIRCUITS[arcade.circuit]||CHAMPIONSHIP_CIRCUITS.stade;
    xp=30; coins=18; reason=circuit.name+" — combat "+arcade.stage+"/"+arcadeTotal();
    c.bestStage=Math.max(c.bestStage||0,arcade.stage);
    if(localWin&&arcade.stage>=arcadeTotal()){ xp+=circuit.xp||250; coins+=circuit.coins||150; reason="🏆 "+circuit.name+" remporté"; }
  }
  else if(mode==="tournament"){
    const fmt=(typeof tournamentFormat==="function"&&tournament)?tournamentFormat(tournament.formatId):null,last=(tournament&&tournament.lastResult)||{};
    const roundIndex=Math.max(0,last.roundIndex==null?(tournament?tournament.currentRound||0:0):last.roundIndex);
    xp=34+roundIndex*8; coins=20+roundIndex*5; reason=(fmt?fmt.name:"Tournoi Godson")+" — "+(last.roundName||"match de bracket");
    if(last.complete&&fmt){
      if(last.placementRank===1){ xp+=fmt.xp||300; coins+=fmt.coins||180; reason="👑 "+fmt.name+" remporté — +"+(last.seasonPoints||0)+" pts de saison"; }
      else if(last.placementRank===2){ xp+=Math.round((fmt.xp||300)*.45); coins+=Math.round((fmt.coins||180)*.45); }
      else if(last.placementRank===3){ xp+=Math.round((fmt.xp||300)*.25); coins+=Math.round((fmt.coins||180)*.25); }
    }
  }
  if(localWin){ xp+=mode==="survival"?18:42; coins+=mode==="survival"?8:24; }
  if(subject&&subject.stats){
    if((subject.stats.maxCombo||0)>=6)xp+=15;
    if((subject.stats.parries||0)>=3)xp+=15;
    if(localWin&&subject.maxHealth&&subject.health/subject.maxHealth>.5)xp+=10;
    if(localWin&&mode!=="2p"&&subject.char&&subject.char.id)c.fighterWins[subject.char.id]=(c.fighterWins[subject.char.id]||0)+1;
  }
  return awardCareer(xp,coins,reason);
}

/* ---------------- SAISON LOCALE V7.1 : POINTS, PALIERS & RÉCOMPENSES ----------------
   La Saison 1 — Aurore de Libreville transforme les résultats de tournoi en
   progression durable. Aucun classement réseau n'est promis : les points
   sont locaux, les récompenses sont purement cosmétiques/progression et
   les anciennes saisons seront archivées avant tout redémarrage. */
const CURRENT_SEASON={id:"saison-1-aurore",name:"Saison 1 — Aurore de Libreville",short:"Saison 1",icon:"🌅"};
const SEASON_TIERS=[
  {id:"aube",points:100,name:"Aube",icon:"🌤️",xp:100,coins:75,desc:"Premiers pas dans la saison."},
  {id:"maree",points:250,name:"Marée",icon:"🌊",xp:175,coins:125,title:"Champion de la Marée",desc:"Titre de saison : Champion de la Marée."},
  {id:"soleil",points:500,name:"Soleil de Libreville",icon:"☀️",xp:275,coins:200,desc:"Le soleil de Libreville brille sur ton bracket."},
  {id:"couronne",points:900,name:"Couronne Aurore",icon:"👑",xp:450,coins:350,title:"Champion de l’Aurore",desc:"Titre de saison : Champion de l’Aurore."},
  {id:"mythe",points:1400,name:"Mythe de Saison",icon:"🌌",xp:800,coins:600,title:"Mythe de l’Aurore",desc:"Titre ultime : Mythe de l’Aurore."}
];
function seasonData(){
  const c=careerData(); let s=c.season;
  if(!s||typeof s!=="object"){ c.season=defaultProfile().career.season; s=c.season; }
  if(s.id!==CURRENT_SEASON.id){
    const archive=Array.isArray(s.archive)?s.archive.slice(0,12):[];
    if(s.id&&(s.points||s.tournaments)&&!archive.some(a=>a&&a.id===s.id))archive.unshift({id:s.id,points:s.points||0,tournaments:s.tournaments||0,matchWins:s.matchWins||0,titles:{...(s.titles||{})},bestPlacement:s.bestPlacement||"",bestPlacementRank:s.bestPlacementRank||0});
    c.season={id:CURRENT_SEASON.id,points:0,claimed:{},tournaments:0,matchWins:0,titles:{express:0,godson:0,legendes:0},bestPlacementRank:0,bestPlacement:"",history:[],archive,lastTournament:null};
    s=c.season;
  }
  return s;
}
function seasonTierForPoints(points){
  let found=null; SEASON_TIERS.forEach(t=>{ if((points||0)>=t.points)found=t; }); return found;
}
function seasonProgress(){
  const s=seasonData(),points=s.points||0,current=seasonTierForPoints(points),next=SEASON_TIERS.find(t=>points<t.points)||null;
  const floor=current?current.points:0,span=next?Math.max(1,next.points-floor):1,into=points-floor;
  return {season:CURRENT_SEASON,data:s,points,currentTier:current,nextTier:next,into,needed:span,pct:next?clamp(Math.round(into/span*100),0,100):100,tournaments:s.tournaments||0,matchWins:s.matchWins||0,bestPlacement:s.bestPlacement||"",bestPlacementRank:s.bestPlacementRank||0};
}
function awardSeasonPoints(points){
  const s=seasonData(),gain=Math.max(0,Math.round(points||0)); s.points=(s.points||0)+gain; return gain;
}
function seasonRewardState(def){
  const s=seasonData(),c=careerData();
  return {eligible:(s.points||0)>=(def?def.points:Infinity),claimed:!!(def&&s.claimed[def.id]),owned:!!(def&&def.title&&c.titles.includes(def.title)),equipped:!!(def&&def.title&&c.title===def.title)};
}
function claimSeasonReward(id){
  const def=SEASON_TIERS.find(t=>t.id===id); if(!def)return false;
  const s=seasonData(),st=seasonRewardState(def); if(st.claimed||!st.eligible)return false;
  s.claimed[def.id]=true;
  const c=careerData();
  if(def.title&&!c.titles.includes(def.title))c.titles.push(def.title);
  if(def.title)c.title=def.title;
  awardCareer(def.xp||0,def.coins||0,"Saison — palier "+def.name);
  saveProfile();
  return true;
}
function toggleSeasonTitle(id){
  const def=SEASON_TIERS.find(t=>t.id===id); if(!def||!def.title)return false;
  const c=careerData(),st=seasonRewardState(def); if(!st.claimed||!st.owned)return false;
  c.title=st.equipped?"":def.title; saveProfile(); return true;
}

function applyProfileData(data){
  PROFILE=normalizeProfileData(data); SETTINGS=PROFILE.settings;
  if(typeof syncTournamentFromProfile==="function")syncTournamentFromProfile();
  selCharP1=PROFILE.selection.charP1||0;
  selCharP2=PROFILE.selection.charP2==null?1:PROFILE.selection.charP2;
  selArenaId=PROFILE.selection.arena||"stadium";
  selArenaMood=ARENA_MOODS[PROFILE.selection.arenaMood]?PROFILE.selection.arenaMood:"auto";
  currentArenaMood=resolveArenaMood(currentArena.id,selArenaMood);
  if(typeof applyQualitySettings==="function")applyQualitySettings();
  saveProfile();
  return PROFILE;
}

/* ---------------- REPLAYS DÉTERMINISTES & REPLAY STUDIO V2.7–V2.8 ----------------
   Enregistrement lockstep : on conserve les entrées FINALEMENT appliquées
   aux deux combattants (clavier, tactile, manettes ou bot), compactées en
   événements de changement. Physique et dégâts étant déterministes, les
   rejouer depuis l'état initial reproduit le même match ; des hashs
   d'état périodiques le prouvent pendant la lecture. */
const REPLAY_VERSION=1,REPLAY_STORE_KEY="gideonGodsonArenaLastReplayV1",REPLAY_LIBRARY_KEY="gideonGodsonArenaReplayLibraryV1";
const REPLAY_LIBRARY_MAX=8,REPLAY_LIBRARY_HARD_MAX=12,REPLAY_LIBRARY_BUDGET=1800000;
const REPLAY_INPUT_KEYS=["left","right","jump","block","punch","kick","special","dash"];
let replayVisualSeedState=0x676f6473;
let replayRecorder={active:false,framesElapsed:0,currentFrame:0,lastA:-1,lastB:-1,events:[],meta:null,checkpoints:[],seed:0};
let replayPlayback={active:false,ended:false,paused:false,framesElapsed:0,currentFrame:0,eventIndex:0,a:0,b:0,data:null,speed:1,verified:null,restoreSettings:null,restoreSelection:null};
const replayInputP1={left:false,right:false,jump:false,block:false,punch:false,kick:false,special:false,dash:false};
const replayInputP2={left:false,right:false,jump:false,block:false,punch:false,kick:false,special:false,dash:false};
function seedReplayVisuals(seed){ replayVisualSeedState=(seed>>>0)||0x676f6473; }
function replayRand(){
  let t=replayVisualSeedState+=0x6D2B79F5;
  t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61);
  return ((t^(t>>>14))>>>0)/4294967296;
}
function encodeReplayInput(inp){ let bits=0; REPLAY_INPUT_KEYS.forEach((k,i)=>{ if(inp&&inp[k])bits|=1<<i; }); return bits; }
function decodeReplayInput(bits,target){ REPLAY_INPUT_KEYS.forEach((k,i)=>target[k]=!!(bits&(1<<i))); return target; }
function replayStateHash(){
  const q=v=>Math.round((v||0)*1000)/1000;
  const parts=[state,round,timerSec,p1.charIndex,p2.charIndex,(typeof teamMatch!=="undefined"&&teamMatch.active?(teamMatch.p1.index+","+teamMatch.p2.index):""),
    q(p1.x),q(p1.y),q(p1.vx),q(p1.vy),q(p1.health),q(p1.energy),p1.roundWins,p1.attackType||"",p1.attackT,p1.hitStun,p1.downT,p1.stats.damage,p1.stats.hits,p1.stats.maxCombo,
    q(p2.x),q(p2.y),q(p2.vx),q(p2.vy),q(p2.health),q(p2.energy),p2.roundWins,p2.attackType||"",p2.attackT,p2.hitStun,p2.downT,p2.stats.damage,p2.stats.hits,p2.stats.maxCombo,
    projectiles.length,projectiles.map(pr=>q(pr.x)+","+q(pr.y)+","+pr.kind).join(";")];
  let h=0x811c9dc5; const s=parts.join("|");
  for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,0x01000193); }
  return ("0000000"+(h>>>0).toString(16)).slice(-8);
}
function makeReplaySeed(){ return ((Date.now()&0xffffffff)^((Math.random()*0xffffffff)>>>0))>>>0; }
function isReplayData(d){ return !!(d&&d.v===REPLAY_VERSION&&Array.isArray(d.events)&&d.mode&&d.start&&d.duration>0); }
function defaultReplayTitle(d){
  const n=d&&d.names?d.names:{};
  return ((n.p1||"Joueur 1")+" vs "+(n.p2||"Joueur 2")).slice(0,42);
}
function makeReplayId(d){
  const stamp=(d&&d.createdAt?d.createdAt:Date.now()).toString(36),seed=((d&&d.seed)||0).toString(16),hash=(d&&d.finalHash)||"replay";
  return "r"+stamp+"-"+seed+"-"+hash;
}
function normalizeReplayData(d){
  if(!isReplayData(d))return null;
  if(!d.id)d.id=makeReplayId(d);
  d.title=String(d.title||defaultReplayTitle(d)).trim().slice(0,42)||defaultReplayTitle(d);
  d.favorite=!!d.favorite;
  return d;
}
function saveLastReplay(data){ try{ window.localStorage.setItem(REPLAY_STORE_KEY,JSON.stringify(data)); }catch(e){} }
function loadLastReplay(){
  try{ const raw=window.localStorage.getItem(REPLAY_STORE_KEY); if(!raw)return null; return normalizeReplayData(JSON.parse(raw)); }
  catch(e){ return null; }
}
function pruneReplayLibrary(protectId){
  const removeOldestNonFavorite=()=>{
    for(let i=replayLibrary.length-1;i>=0;i--)if(!replayLibrary[i].favorite&&replayLibrary[i].id!==protectId){ replayLibrary.splice(i,1); return true; }
    return false;
  };
  while(replayLibrary.length>REPLAY_LIBRARY_MAX&&removeOldestNonFavorite()){}
  while(replayLibrary.length>REPLAY_LIBRARY_HARD_MAX){ const idx=replayLibrary.findIndex((d,i)=>i===replayLibrary.length-1&&d.id!==protectId); if(idx<0)break; replayLibrary.pop(); }
  while(replayLibrary.length>1&&JSON.stringify(replayLibrary).length>REPLAY_LIBRARY_BUDGET&&removeOldestNonFavorite()){}
}
function persistReplayLibrary(){
  pruneReplayLibrary(lastReplayData&&lastReplayData.id);
  for(let attempt=0;attempt<8;attempt++){
    try{ window.localStorage.setItem(REPLAY_LIBRARY_KEY,JSON.stringify(replayLibrary)); return true; }
    catch(e){
      let removed=false;
      for(let i=replayLibrary.length-1;i>=0;i--)if(!replayLibrary[i].favorite&&(!lastReplayData||replayLibrary[i].id!==lastReplayData.id)){ replayLibrary.splice(i,1); removed=true; break; }
      if(!removed)return false;
    }
  }
  return false;
}
function loadReplayLibrary(){
  let list=[];
  try{
    const raw=window.localStorage.getItem(REPLAY_LIBRARY_KEY);
    if(raw){ const parsed=JSON.parse(raw); if(Array.isArray(parsed))list=parsed.map(normalizeReplayData).filter(Boolean); }
  }catch(e){ list=[]; }
  if(!list.length){ const legacy=loadLastReplay(); if(legacy)list=[legacy]; }
  const seen=new Set();
  list=list.filter(d=>{ if(seen.has(d.id))d.id=d.id+"-"+seen.size; seen.add(d.id); return true; });
  list.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  return list.slice(0,REPLAY_LIBRARY_HARD_MAX);
}
let replayLibrary=loadReplayLibrary();
let lastReplayData=replayLibrary[0]||loadLastReplay();
if(lastReplayData&&!replayLibrary.some(d=>d.id===lastReplayData.id)){ replayLibrary=[lastReplayData]; persistReplayLibrary(); }
function refreshLastReplay(){
  lastReplayData=replayLibrary[0]||null;
  try{
    if(lastReplayData)saveLastReplay(lastReplayData); else window.localStorage.removeItem(REPLAY_STORE_KEY);
  }catch(e){}
}
function reloadReplayLibrary(){ replayLibrary=loadReplayLibrary(); refreshLastReplay(); if(typeof syncReplayUI==="function")syncReplayUI(); return replayLibrary; }
function addReplayToLibrary(data){
  data=normalizeReplayData(data); if(!data)return null;
  replayLibrary=replayLibrary.filter(d=>d.id!==data.id);
  replayLibrary.unshift(data); lastReplayData=data;
  pruneReplayLibrary(data.id); saveLastReplay(data); persistReplayLibrary();
  return data;
}
function findReplayById(id){ return replayLibrary.find(d=>d.id===id)||null; }
function renameReplayById(id,title){
  const d=findReplayById(id); if(!d)return false;
  d.title=String(title||"").trim().slice(0,42)||defaultReplayTitle(d);
  persistReplayLibrary(); refreshLastReplay(); if(typeof syncReplayUI==="function")syncReplayUI();
  return true;
}
function setReplayFavorite(id,favorite){
  const d=findReplayById(id); if(!d)return false;
  d.favorite=favorite==null?!d.favorite:!!favorite;
  persistReplayLibrary(); refreshLastReplay(); if(typeof syncReplayUI==="function")syncReplayUI();
  return d.favorite;
}
function deleteReplayById(id){
  const before=replayLibrary.length;
  replayLibrary=replayLibrary.filter(d=>d.id!==id);
  if(replayLibrary.length===before)return false;
  refreshLastReplay(); persistReplayLibrary(); if(typeof syncReplayUI==="function")syncReplayUI();
  return true;
}
function captureReplayMeta(seed){
  const snap=f=>({char:f.charIndex,health:f.health,maxHealth:f.maxHealth,energy:f.energy,powerMul:f.powerMul||1});
  return {v:REPLAY_VERSION,gameVersion:GAME_VERSION,seed:seed>>>0,createdAt:Date.now(),mode,botDiff,arena:currentArena.id,arenaMood:currentArenaMood,arenaMoodPreference:selArenaMood,
    char1:p1.charIndex,char2:p2.charIndex,names:{p1:p1.name,p2:p2.name},
    settings:{roundTime:SETTINGS.roundTime,roundsWin:SETTINGS.roundsWin},
    context:{storyStep:story.step,arcadeStage:arcade.stage,arcadeTotal:arcadeTotal(),arcadeCircuit:arcade.circuit||"stade",survivalWave:survival.wave,survivalScore:survival.score,tournament:(typeof tournamentForReplay==="function"?tournamentForReplay():null),team:(typeof teamMatchForReplay==="function"?teamMatchForReplay():null)},
    start:{p1:snap(p1),p2:snap(p2)}};
}
function startReplayRecording(seed){
  replayRecorder={active:mode!=="training"&&!replayPlayback.active,framesElapsed:0,currentFrame:0,lastA:-1,lastB:-1,events:[],meta:null,checkpoints:[],seed:seed>>>0};
  if(replayRecorder.active){ replayRecorder.meta=captureReplayMeta(seed); replayRecorder.checkpoints.push({f:0,h:replayStateHash()}); }
}
function cancelReplayRecording(){ replayRecorder.active=false; replayRecorder.events=[]; replayRecorder.meta=null; }
function tickReplayFrameStart(){
  if(replayPlayback.active){ replayPlayback.currentFrame=replayPlayback.framesElapsed++; return true; }
  if(replayRecorder.active){ replayRecorder.currentFrame=replayRecorder.framesElapsed++; return true; }
  return false;
}
function recordReplayInputs(i1,i2){
  if(!replayRecorder.active)return;
  const a=encodeReplayInput(i1),b=encodeReplayInput(i2),f=replayRecorder.currentFrame;
  if(a!==replayRecorder.lastA||b!==replayRecorder.lastB){ replayRecorder.events.push({f,a,b}); replayRecorder.lastA=a; replayRecorder.lastB=b; }
}
function replayInputsForCurrentFrame(){
  const d=replayPlayback.data,f=replayPlayback.currentFrame;
  while(d&&replayPlayback.eventIndex<d.events.length&&d.events[replayPlayback.eventIndex].f<=f){ const e=d.events[replayPlayback.eventIndex++]; replayPlayback.a=e.a; replayPlayback.b=e.b; }
  return {p1:decodeReplayInput(replayPlayback.a,replayInputP1),p2:decodeReplayInput(replayPlayback.b,replayInputP2)};
}
function verifyReplayCheckpoint(){
  if(replayPlayback.active&&replayPlayback.data&&Array.isArray(replayPlayback.data.checkpoints)){
    const cp=replayPlayback.data.checkpoints.find(c=>c.f===replayPlayback.currentFrame);
    if(cp&&cp.h!==replayStateHash())replayPlayback.verified=false;
  } else if(replayRecorder.active&&replayRecorder.currentFrame>0&&replayRecorder.currentFrame%300===0){
    replayRecorder.checkpoints.push({f:replayRecorder.currentFrame,h:replayStateHash()});
  }
}
function finalizeReplayRecording(winner){
  if(!replayRecorder.active||!replayRecorder.meta)return null;
  const finalHash=replayStateHash(),duration=Math.max(1,replayRecorder.framesElapsed);
  if(!replayRecorder.checkpoints.some(c=>c.f===replayRecorder.currentFrame))replayRecorder.checkpoints.push({f:replayRecorder.currentFrame,h:finalHash});
  const data={...replayRecorder.meta,duration,events:replayRecorder.events.slice(),checkpoints:replayRecorder.checkpoints.slice(),finalHash,
    result:{winnerSide:winner===p1?1:2,winnerName:winner.name,winnerChar:winner.charIndex,victoryLine:winner.char.victoryLine||"",p1Health:Math.round(p1.health),p2Health:Math.round(p2.health),rounds:[p1.roundWins,p2.roundWins],damage:[p1.stats.damage,p2.stats.damage],maxCombo:[p1.stats.maxCombo,p2.stats.maxCombo]}};
  data.id=makeReplayId(data); data.title=defaultReplayTitle(data); data.favorite=false;
  addReplayToLibrary(data); replayRecorder.active=false;
  if(typeof syncReplayUI==="function")syncReplayUI();
  return data;
}
function finishReplayPlayback(winner){
  const d=replayPlayback.data,okHash=!d||!d.finalHash||d.finalHash===replayStateHash(),okWinner=!d||!d.result||d.result.winnerSide===(winner===p1?1:2);
  if(replayPlayback.verified==null)replayPlayback.verified=true;
  replayPlayback.verified=replayPlayback.verified&&okHash&&okWinner;
  replayPlayback.active=false; replayPlayback.ended=true; replayPlayback.paused=false;
  state="matchEnd"; lastWinner=winner; hideAnnounce(); stopMusic(); cinematic=0;
  if(typeof onReplayFinished==="function")onReplayFinished(winner);
}
function stopReplayPlayback(restore){
  if(replayPlayback.restoreSettings){ SETTINGS.roundTime=replayPlayback.restoreSettings.roundTime; SETTINGS.roundsWin=replayPlayback.restoreSettings.roundsWin; }
  if(restore!==false&&replayPlayback.restoreSelection){ selCharP1=replayPlayback.restoreSelection.charP1; selCharP2=replayPlayback.restoreSelection.charP2; selArenaId=replayPlayback.restoreSelection.arena; if(replayPlayback.restoreSelection.arenaMood)selArenaMood=replayPlayback.restoreSelection.arenaMood; }
  replayPlayback.active=false; replayPlayback.ended=false; replayPlayback.paused=false; replayPlayback.data=null; replayPlayback.restoreSettings=null; replayPlayback.restoreSelection=null;
}

/* ---------------- QUALITÉ / HAUTE RÉSOLUTION ---------------- */
let DPR=1,qualityLevel=2,perfFxScale=1; // 2 haute, 1 moyenne, 0 basse ; perfFxScale = garde-fou FPS temps réel
function particleMul(){ return [0.45,0.75,1][qualityLevel]*(perfFxScale||1); }
function particleCap(){ return [170,320,540][qualityLevel]; }
function resizeCanvas(){
  const cap=[1,1.5,2][qualityLevel];
  DPR=Math.min(window.devicePixelRatio||1,cap);
  canvas.width=Math.round(W*DPR); canvas.height=Math.round(H*DPR);
  if(typeof rebuildArenaCache==="function")rebuildArenaCache();
}
function applyQualitySettings(){
  if(SETTINGS.quality==="high")qualityLevel=2; else if(SETTINGS.quality==="medium")qualityLevel=1; else if(SETTINGS.quality==="low")qualityLevel=0;
  resizeCanvas();
}
window.addEventListener("resize",resizeCanvas);

/* ---------------- AUDIO PRO (mixeur musique / effets) ---------------- */
let AC=null,sfxGain=null,musicGain=null,musicTimer=null,musicStep=0;
function audio(){
  if(!AC){ try{ AC=new (window.AudioContext||window.webkitAudioContext)();
    const comp=AC.createDynamicsCompressor(); comp.connect(AC.destination);
    sfxGain=AC.createGain(); musicGain=AC.createGain(); sfxGain.connect(comp); musicGain.connect(comp); applyAudioSettings();
  }catch(e){} }
  if(AC&&AC.state==="suspended")AC.resume(); return AC;
}
function applyAudioSettings(){ if(!AC)return; sfxGain.gain.value=SETTINGS.sfxVol/100; musicGain.gain.value=(SETTINGS.musicVol/100)*.9; }
function tone(f,dur,type,vol,slideTo,channel){
  if(!audio())return; const dest=channel==="music"?musicGain:sfxGain; if(channel!=="music"&&SETTINGS.sfxVol<=0)return; if(channel==="music"&&SETTINGS.musicVol<=0)return;
  const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain(); o.type=type||"square"; o.frequency.setValueAtTime(f,t);
  if(slideTo)o.frequency.exponentialRampToValueAtTime(Math.max(20,slideTo),t+dur);
  g.gain.setValueAtTime(vol||.12,t); g.gain.exponentialRampToValueAtTime(.001,t+dur);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t+dur+.02);
}
function noiseHit(dur,vol,freq){ if(!audio()||SETTINGS.sfxVol<=0)return; const t=AC.currentTime,len=Math.max(1,(AC.sampleRate*dur)|0),buf=AC.createBuffer(1,len,AC.sampleRate),d=buf.getChannelData(0); for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len); const s=AC.createBufferSource(); s.buffer=buf; const f=AC.createBiquadFilter(); f.type="lowpass"; f.frequency.value=freq||900; const g=AC.createGain(); g.gain.value=vol||.2; s.connect(f); f.connect(g); g.connect(sfxGain); s.start(t); }
const SFX={
  punch(){tone(520,.07,"sine",.05,150);noiseHit(.04,.05,2600)},
  kick(){tone(330,.09,"sine",.06,105);noiseHit(.05,.06,2100)},
  hit(hard){noiseHit(hard?.15:.09,hard?.28:.18,hard?620:950);tone(hard?115:165,.11,"square",.09,52)},
  counter(){tone(1180,.16,"square",.12,500);noiseHit(.12,.2,1200)},
  block(){tone(920,.06,"square",.06,620);noiseHit(.035,.045,3600)},
  parry(){tone(1320,.09,"square",.1,1760);setTimeout(()=>tone(1760,.14,"triangle",.1,990),45);noiseHit(.06,.08,4200)},
  jump(){tone(250,.13,"sine",.05,640)},
  dash(){noiseHit(.16,.09,1800);tone(300,.16,"sine",.045,900)},
  fire(){tone(175,.28,"sawtooth",.09,920);noiseHit(.2,.09,1450)},
  boom(){noiseHit(.38,.32,430);tone(88,.38,"square",.15,34)},
  beep(){tone(660,.11,"square",.09)},
  fight(){tone(523,.11,"square",.11);setTimeout(()=>tone(784,.11,"square",.11),85);setTimeout(()=>tone(1046,.24,"square",.13),170)},
  ko(){tone(392,.5,"sawtooth",.15,58);noiseHit(.45,.3,500)},
  win(){[523,659,784,1046,1318].forEach((f,i)=>setTimeout(()=>tone(f,.22,"square",.1),i*105))},
  click(){tone(740,.05,"square",.06)},
  confirm(){tone(660,.08,"square",.09);setTimeout(()=>tone(990,.14,"square",.09),70)},
  achieve(){[784,988,1175,1568].forEach((f,i)=>setTimeout(()=>tone(f,.18,"triangle",.11),i*80))}
};
function startMusic(){
  stopMusic(); if(!audio()||SETTINGS.musicVol<=0)return;
  const m=currentArena.music; let step=0;
  musicTimer=setInterval(()=>{
    if(SETTINGS.musicVol<=0)return;
    const inFight=(state==="fight"||state==="training"||state==="intro");
    const vol=inFight?.05:.026;
    tone(m.bass[step%m.bass.length],.21,"triangle",vol,null,"music");
    if(step%2===0&&m.lead)tone(m.lead[(step/2)%m.lead.length],.16,"sine",vol*.55,null,"music");
    if(inFight&&step%2===1)noiseHit(.025,.012,6500);
    step++;
  },m.interval);
}
function stopMusic(){ if(musicTimer)clearInterval(musicTimer); musicTimer=null; }

/* ---------------- DONNÉES : PERSONNAGES ---------------- */
const CHARACTERS=[
 {id:"gideon",name:"GÉDÉON",title:"Le Champion Équilibré",letter:"G",style:"hero",specName:"⚡ Foudre Gédéon",superName:"🌟 Jugement Godson",victoryLine:"Pour Libreville, pour l’Arène — le nom Godson ne recule jamais.",hp:100,speed:1,power:1,atkSpeed:1,energyGain:1,scale:1,bulk:1,reach:1,gravity:.8,jump:15.8,knockRes:1,dashCD:28,
  skin:{primary:"#0091ea",dark:"#01579b",accent:"#ffc400",pants:"#263238",skin:"#8d5524",hair:"#14100c",glove:"#ff1744",trail:"#ffc400"}},
 {id:"kira",name:"Kira",title:"La Foudre Rapide",letter:"K",style:"kunoichi",specName:"🌪️ Rafale Kira",superName:"⚡ Tempête de Lames",victoryLine:"Trop lent. La foudre avait déjà gagné avant ton premier pas.",hp:92,speed:1.22,power:.88,atkSpeed:1.18,energyGain:1.05,scale:.96,bulk:.85,reach:.98,gravity:.76,jump:16.9,knockRes:1.12,dashCD:20,
  skin:{primary:"#00c853",dark:"#00695c",accent:"#b9f6ca",pants:"#1b2a1e",skin:"#a06a35",hair:"#180a2a",glove:"#ffd600",trail:"#69f0ae"}},
 {id:"titan",name:"TITAN",title:"La Montagne de Fer",letter:"T",style:"titan",specName:"🌋 Onde Sismique",superName:"☄️ Séisme Titan",victoryLine:"Une montagne ne négocie pas avec le vent.",hp:120,speed:.82,power:1.28,atkSpeed:.88,energyGain:.9,scale:1.13,bulk:1.35,reach:1.08,gravity:.9,jump:14.6,knockRes:.72,dashCD:36,
  skin:{primary:"#e53935",dark:"#7f0000",accent:"#ffccbc",pants:"#1c1c22",skin:"#7a4a21",hair:"#050505",glove:"#263238",trail:"#ff7043"}},
 {id:"nova",name:"NOVA",title:"La Maîtresse de l’Énergie",letter:"N",style:"nova",specName:"🔮 Orbe Chercheuse",superName:"🌠 Pluie d’Énergie",victoryLine:"J’ai lu ton énergie… puis je l’ai réécrite en lumière.",hp:96,speed:1.06,power:.96,atkSpeed:1.04,energyGain:1.55,scale:1,bulk:.92,reach:1.02,gravity:.78,jump:16.2,knockRes:1.02,dashCD:25,
  skin:{primary:"#7c3aed",dark:"#311b92",accent:"#e040fb",pants:"#241040",skin:"#c68642",hair:"#2a0a3a",glove:"#69f0ae",trail:"#e040fb"}},
 {id:"godson-prime",name:"GODSON PRIME",title:"Le Champion Légendaire Secret",letter:"G",style:"prime",specName:"👑 Double Vague Royale",superName:"👑 Triple Jugement Royal",victoryLine:"Agenouille-toi devant la légende — puis relève-toi et deviens-en une.",unlockKey:"prime",lockedHint:"Termine le Chapitre 1 de l’Histoire pour le débloquer",hp:108,speed:1.12,power:1.12,atkSpeed:1.1,energyGain:1.25,scale:1.04,bulk:1.08,reach:1.05,gravity:.8,jump:16.4,knockRes:.9,dashCD:23,
  skin:{primary:"#f5a623",dark:"#7a3b00",accent:"#00e5ff",pants:"#17202b",skin:"#8d5524",hair:"#120b02",glove:"#0b1c2c",trail:"#ffc400"}},
 {id:"Zara",name:"Zara",title:"La Vague de Libreville",letter:"Z",style:"Zara",specName:"🌊 Lames de Marée",superName:"🌀 Raz-de-Marée Libreville",victoryLine:"La marée de Libreville finit toujours par emporter les certitudes.",hp:102,speed:1.14,power:1,atkSpeed:1.09,energyGain:1.18,scale:1,bulk:.94,reach:1.05,gravity:.77,jump:16.7,knockRes:.98,dashCD:22,
  skin:{primary:"#00acc1",dark:"#006064",accent:"#ff7043",pants:"#073642",skin:"#7a4a21",hair:"#06202b",glove:"#ffd54f",trail:"#4dd0e1"}},
 {id:"kael",name:"KAEL",title:"Le Guerrier d'Acier",letter:"K",style:"guerrier",specName:"⚔️ Lame d'Acier",superName:"⚔️ Croisade d'Acier",victoryLine:"Mon épée a tranché le doute bien avant ton premier pas.",hp:112,speed:.95,power:1.15,atkSpeed:.97,energyGain:1,scale:1.06,bulk:1.12,reach:1.12,gravity:.84,jump:15.2,knockRes:.88,dashCD:30,
  skin:{primary:"#607d8b",dark:"#263238",accent:"#e53935",pants:"#2b343a",skin:"#d9a066",hair:"#16181c",glove:"#546e7a",trail:"#ff5252"}},
 {id:"sora",name:"SORA",title:"La Magicienne des Arcanes",letter:"S",style:"magicienne",specName:"🔮 Orbe Arcanique",superName:"☄️ Comète Pourpre",victoryLine:"Les étoiles avaient déjà écrit ta défaite, je n'ai fait que la lire.",hp:94,speed:1.02,power:1.02,atkSpeed:1,energyGain:1.4,scale:.99,bulk:.88,reach:1,gravity:.74,jump:16.4,knockRes:1.05,dashCD:24,
  skin:{primary:"#5e35b1",dark:"#2a1454",accent:"#b388ff",pants:"#1d1038",skin:"#e8b98d",hair:"#e8e6f5",glove:"#ffd54f",trail:"#b388ff"}},
 {id:"ael",name:"AEL-7",title:"L'Unité Synthétique",letter:"A",style:"synthetique",specName:"🔷 Tir Plasma",superName:"🛰️ Canon Orbital",victoryLine:"Probabilité de ta victoire recalculée : 0,00 %.",hp:104,speed:1.18,power:.98,atkSpeed:1.12,energyGain:1.1,scale:1.02,bulk:.95,reach:1.04,gravity:.79,jump:16.8,knockRes:.95,dashCD:21,
  skin:{primary:"#eceff1",dark:"#90a4ae",accent:"#18ffff",pants:"#263238",skin:"#cfd8dc",hair:"#eceff1",glove:"#102027",trail:"#18ffff"}},
 {id:"Lira",name:"Lira",title:"L'Exploratrice",letter:"L",style:"kunoichi",specName:"🧭 Lame de Route",superName:"🗺️ Grande Traversée",victoryLine:"J'ai traversé des déserts entiers ; ton arène n'était qu'une étape.",hp:100,speed:1.08,power:1,atkSpeed:1.06,energyGain:1.08,scale:0.99,bulk:0.93,reach:1.03,gravity:0.78,jump:16.3,knockRes:1,dashCD:24,
  skin:{primary:"#6b7c4f",dark:"#39432a",accent:"#d7ccc8",pants:"#4a4a38",skin:"#c68642",hair:"#2b1c10",glove:"#5d4037",trail:"#aed581"}},
 {id:"zed",name:"Zed",title:"Le Traqueur",letter:"Z",style:"hero",specName:"🏹 Pluie de Flèches",superName:"🎯 Traque Fatale",victoryLine:"Un bon traqueur ne court jamais : sa proie vient à lui.",hp:96,speed:1.16,power:0.97,atkSpeed:1.1,energyGain:1.06,scale:1,bulk:0.92,reach:1.06,gravity:0.77,jump:16.6,knockRes:1.04,dashCD:22,
  skin:{primary:"#4e5a4e",dark:"#232a24",accent:"#a1887f",pants:"#2e332c",skin:"#a06a35",hair:"#1c1c1c",glove:"#37474f",trail:"#9ccc65"}},
 {id:"nyx",name:"Nyx",title:"L'Ingénieure",letter:"N",style:"hero",specName:"🔷 Impulsion Tech",superName:"🛠️ Surcharge Système",victoryLine:"Diagnostic terminé : ta défaite était un défaut de conception.",hp:97,speed:1.13,power:0.96,atkSpeed:1.12,energyGain:1.2,scale:0.98,bulk:0.9,reach:1.01,gravity:0.78,jump:16.5,knockRes:1.03,dashCD:22,
  skin:{primary:"#263238",dark:"#10181d",accent:"#29b6f6",pants:"#1b242b",skin:"#e0ac82",hair:"#1e88e5",glove:"#29b6f6",trail:"#4fc3f7"}},
 {id:"vorak",name:"VORAK",title:"Le Berserker",letter:"V",style:"titan",specName:"🪓 Fracas Sauvage",superName:"🌋 Rage du Berserker",victoryLine:"Vorak ÉCRASE. Vorak ne discute pas.",hp:122,speed:0.8,power:1.3,atkSpeed:0.86,energyGain:0.88,scale:1.14,bulk:1.38,reach:1.09,gravity:0.91,jump:14.4,knockRes:0.7,dashCD:37,
  skin:{primary:"#6d4c41",dark:"#3e2723",accent:"#c62828",pants:"#4e342e",skin:"#9e8f83",hair:"#212121",glove:"#4e342e",trail:"#ef5350"}},
 {id:"aerin",name:"AERIN",title:"Éclaireuse des Terres Vertes",letter:"A",style:"nova",specName:"🍃 Flèches des Cimes",superName:"🌲 Colère des Terres Vertes",victoryLine:"Les Terres Vertes protègent celles qui les écoutent.",hp:93,speed:1.2,power:0.9,atkSpeed:1.14,energyGain:1.12,scale:0.97,bulk:0.86,reach:1.04,gravity:0.75,jump:17,knockRes:1.1,dashCD:21,
  skin:{primary:"#2e7d32",dark:"#1b3a1f",accent:"#a5d6a7",pants:"#2c4630",skin:"#e8b98d",hair:"#3a2410",glove:"#4e6b3a",trail:"#81c784"}},
 {id:"korben",name:"KORBEN",title:"Ingénieur Spatial",letter:"K",style:"hero",specName:"🔧 Décharge Orbitale",superName:"🚀 Protocole Korben",victoryLine:"J'ai réparé des stations en plein vide. Toi, c'était facile.",hp:106,speed:1,power:1.06,atkSpeed:1,energyGain:1.15,scale:1.03,bulk:1.04,reach:1.03,gravity:0.81,jump:15.9,knockRes:0.95,dashCD:26,
  skin:{primary:"#f57c00",dark:"#37474f",accent:"#4fc3f7",pants:"#455a64",skin:"#d9a066",hair:"#14100c",glove:"#263238",trail:"#ffb74d"}},
 {id:"lyra",name:"Lyra",title:"Prêtresse Solaire",letter:"L",style:"nova",specName:"☀️ Rayon Solaire",superName:"🌞 Aurore Sacrée",victoryLine:"Le soleil ne demande pas la permission de briller.",hp:97,speed:1.03,power:1,atkSpeed:1.02,energyGain:1.5,scale:1,bulk:0.91,reach:1.02,gravity:0.76,jump:16.3,knockRes:1.02,dashCD:25,
  skin:{primary:"#f5efe0",dark:"#c9a227",accent:"#ffd54f",pants:"#e8dcc0",skin:"#7a4a21",hair:"#f5f0e6",glove:"#ffd54f",trail:"#ffe082"}},
 {id:"drakesh",name:"Drakesh",title:"Chasseur de Primes",letter:"D",style:"guerrier",specName:"🎯 Tir du Chasseur",superName:"💀 Prime Réclamée",victoryLine:"Ta tête valait cher. Le combat, lui, ne valait rien.",hp:108,speed:1.05,power:1.1,atkSpeed:1.06,energyGain:1.05,scale:1.05,bulk:1.06,reach:1.08,gravity:0.82,jump:15.8,knockRes:0.92,dashCD:25,
  skin:{primary:"#37474f",dark:"#14181c",accent:"#ff5722",pants:"#1c2226",skin:"#7f9db9",hair:"#10151c",glove:"#263238",trail:"#ff7043"}},
 {id:"selene",name:"SELENE",title:"Pirate de l'Espace",letter:"S",style:"kunoichi",specName:"🏴‍☠️ Sabre Stellaire",superName:"☠️ Abordage Spatial",victoryLine:"Ton trésor, ton honneur, ton arène : tout est à moi maintenant.",hp:95,speed:1.19,power:0.95,atkSpeed:1.14,energyGain:1.08,scale:0.98,bulk:0.89,reach:1.02,gravity:0.76,jump:16.8,knockRes:1.07,dashCD:21,
  skin:{primary:"#ad1457",dark:"#1a0e16",accent:"#f48fb1",pants:"#200f1c",skin:"#e8b98d",hair:"#ec407a",glove:"#212121",trail:"#f06292"}},
 {id:"taiko",name:"Taiko",title:"Moine de l'Ombre",letter:"T",style:"kunoichi",specName:"🌑 Lame d'Ombre",superName:"🕯️ Méditation Fatale",victoryLine:"L'ombre ne frappe pas fort. Elle frappe juste.",hp:100,speed:1.14,power:1.02,atkSpeed:1.1,energyGain:1.1,scale:1,bulk:0.94,reach:1.05,gravity:0.78,jump:16.5,knockRes:1,dashCD:23,
  skin:{primary:"#263238",dark:"#0d1114",accent:"#90a4ae",pants:"#161c20",skin:"#c68642",hair:"#0a0a0c",glove:"#37474f",trail:"#b0bec5"}},
 {id:"vex",name:"Vex",title:"Cyborg Berserker",letter:"V",style:"titan",specName:"🤖 Poing Hydraulique",superName:"⚙️ Furie Cyborg",victoryLine:"Chair contre acier : tu connais déjà la fin.",hp:118,speed:0.86,power:1.24,atkSpeed:0.92,energyGain:0.95,scale:1.11,bulk:1.3,reach:1.07,gravity:0.88,jump:15,knockRes:0.76,dashCD:33,
  skin:{primary:"#546e7a",dark:"#263238",accent:"#ff1744",pants:"#20262b",skin:"#c9b8a6",hair:"#37474f",glove:"#455a64",trail:"#ff5252"}},
 {id:"elara",name:"ELARA",title:"Chasseuse de Rêves",letter:"E",style:"nova",specName:"💭 Orbe Onirique",superName:"🌙 Chasse de Rêves",victoryLine:"Je t'ai battu dans tes rêves bien avant ce combat.",hp:93,speed:1.08,power:0.95,atkSpeed:1.03,energyGain:1.42,scale:0.98,bulk:0.87,reach:1,gravity:0.73,jump:16.6,knockRes:1.06,dashCD:24,
  skin:{primary:"#b39ddb",dark:"#4a3670",accent:"#e1f5fe",pants:"#5e4b8b",skin:"#f0d9c8",hair:"#dfe6f5",glove:"#9575cd",trail:"#b3e5fc"}},
 {id:"brax",name:"Brax",title:"Titan des Montagnes",letter:"B",style:"titan",specName:"🏔️ Éboulement",superName:"⛰️ Réveil du Titan",victoryLine:"Les montagnes ne reculent devant personne.",hp:124,speed:0.79,power:1.32,atkSpeed:0.85,energyGain:0.87,scale:1.16,bulk:1.4,reach:1.1,gravity:0.92,jump:14.2,knockRes:0.68,dashCD:38,
  skin:{primary:"#6d4c41",dark:"#3e2723",accent:"#d7ccc8",pants:"#4e342e",skin:"#d9a066",hair:"#4a2f1c",glove:"#5d4037",trail:"#bcaaa4"}},
 {id:"kazu",name:"Kazu",title:"Samouraï du Vent",letter:"K",style:"guerrier",specName:"🍂 Lame du Vent",superName:"🌪️ Voie du Samouraï",victoryLine:"Mon sabre suit le vent ; toi, tu suivais ta peur.",hp:101,speed:1.15,power:1.04,atkSpeed:1.13,energyGain:1.06,scale:1.01,bulk:0.95,reach:1.09,gravity:0.77,jump:16.7,knockRes:1,dashCD:22,
  skin:{primary:"#90a4ae",dark:"#37474f",accent:"#00b0ff",pants:"#455a64",skin:"#e0ac82",hair:"#14100c",glove:"#607d8b",trail:"#80d8ff"}},
 {id:"sera",name:"Sera",title:"Hacker Nomade",letter:"S",style:"kunoichi",specName:"💻 Intrusion Éclair",superName:"📡 Piratage Total",victoryLine:"Accès refusé à ta victoire. Je viens de la supprimer.",hp:94,speed:1.18,power:0.92,atkSpeed:1.16,energyGain:1.22,scale:0.97,bulk:0.87,reach:1,gravity:0.76,jump:16.8,knockRes:1.08,dashCD:21,
  skin:{primary:"#6a1b9a",dark:"#1a0f2e",accent:"#1de9b6",pants:"#1c1c26",skin:"#e8b98d",hair:"#00bfa5",glove:"#00bfa5",trail:"#64ffda"}},
 {id:"vorga",name:"VORGA",title:"Guerrière Déchue",letter:"V",style:"kunoichi",specName:"🏜️ Sables Anciens",superName:"⚰️ Malédiction Déchue",victoryLine:"Le désert garde ses morts… et ses vaincus.",hp:105,speed:1.02,power:1.08,atkSpeed:1,energyGain:1.05,scale:1.02,bulk:1,reach:1.07,gravity:0.8,jump:15.9,knockRes:0.94,dashCD:27,
  skin:{primary:"#d7ccc8",dark:"#8d6e63",accent:"#ffb300",pants:"#a1887f",skin:"#d9c9a8",hair:"#e8e0cc",glove:"#8d6e63",trail:"#ffca28"}},
 {id:"nox",name:"Nox",title:"Esprit des Forêts",letter:"N",style:"nova",specName:"🌿 Étreinte Sylvestre",superName:"🍄 Réveil de la Forêt",victoryLine:"La forêt reprend toujours ce qui lui appartient.",hp:95,speed:1.07,power:0.97,atkSpeed:1.02,energyGain:1.38,scale:0.99,bulk:0.89,reach:1.02,gravity:0.74,jump:16.4,knockRes:1.04,dashCD:24,
  skin:{primary:"#33691e",dark:"#12240c",accent:"#ffd54f",pants:"#1e3315",skin:"#b9c49a",hair:"#24401a",glove:"#558b2f",trail:"#aeea00"}},
 {id:"raven",name:"Raven",title:"Tireuse d'Élite",letter:"R",style:"hero",specName:"🎯 Tir de Précision",superName:"🔭 Visée Parfaite",victoryLine:"Une balle, une cible, aucune hésitation.",hp:96,speed:1.12,power:1,atkSpeed:1.08,energyGain:1.14,scale:0.99,bulk:0.91,reach:1.08,gravity:0.78,jump:16.3,knockRes:1.02,dashCD:23,
  skin:{primary:"#4527a0",dark:"#160b2e",accent:"#b388ff",pants:"#1c1430",skin:"#e0ac82",hair:"#241040",glove:"#7c4dff",trail:"#b388ff"}},
 {id:"zep",name:"Zep",title:"Explorateur des Abysses",letter:"Z",style:"synthetique",specName:"🌊 Torpille Abyssale",superName:"🐙 Pression des Abysses",victoryLine:"Là d'où je viens, même la lumière apprend à craindre.",hp:107,speed:1,power:1.05,atkSpeed:1,energyGain:1.12,scale:1.04,bulk:1.05,reach:1.04,gravity:0.85,jump:15.3,knockRes:0.93,dashCD:27,
  skin:{primary:"#006064",dark:"#02262b",accent:"#18ffff",pants:"#06333a",skin:"#90a4ae",hair:"#004d5a",glove:"#00838f",trail:"#18ffff"}},
 {id:"astrid",name:"ASTRID",title:"Noblesse Déchue",letter:"A",style:"prime",specName:"👑 Lames Royales Déchues",superName:"🏰 Trône Reconquis",victoryLine:"On m'a tout pris, sauf l'habitude de gagner.",hp:104,speed:1.06,power:1.08,atkSpeed:1.06,energyGain:1.2,scale:1.02,bulk:0.98,reach:1.05,gravity:0.79,jump:16.1,knockRes:0.96,dashCD:24,
  skin:{primary:"#6a1220",dark:"#1a0508",accent:"#ffc400",pants:"#20060a",skin:"#f0d9c8",hair:"#5a2a16",glove:"#263238",trail:"#ff5252"}},
 {id:"selenia",name:"SÉLÉNIA",title:"Rôdeuse de la Forêt Sacrée",letter:"S",style:"nova",specName:"🏹 Flèche Sacrée",superName:"🌳 Bénédiction de la Forêt",victoryLine:"La forêt sacrée m'a vue grandir ; elle t'a vu tomber.",hp:94,speed:1.19,power:0.92,atkSpeed:1.13,energyGain:1.1,scale:0.97,bulk:0.87,reach:1.04,gravity:0.75,jump:16.9,knockRes:1.09,dashCD:21,
  skin:{primary:"#558b2f",dark:"#264015",accent:"#c5e1a5",pants:"#31451f",skin:"#e8b98d",hair:"#3a2410",glove:"#6d4c41",trail:"#9ccc65"}},
 {id:"drakar",name:"Drakar",title:"Guerrier Nordique du Givre",letter:"D",style:"titan",specName:"❄️ Hache du Givre",superName:"🧊 Hiver du Clan",victoryLine:"Le Givre ne plie pas. Le Givre brise.",hp:116,speed:0.88,power:1.2,atkSpeed:0.93,energyGain:0.94,scale:1.1,bulk:1.26,reach:1.08,gravity:0.87,jump:15.1,knockRes:0.8,dashCD:32,
  skin:{primary:"#78909c",dark:"#37474f",accent:"#b3e5fc",pants:"#455a64",skin:"#d9a066",hair:"#6d4c41",glove:"#546e7a",trail:"#81d4fa"}},
 {id:"nyx-ombre",name:"Nyx",title:"Assassine de l'Ordre des Ombres",letter:"N",style:"kunoichi",specName:"🗡️ Dagues de l'Ordre",superName:"🌑 Sentence des Ombres",victoryLine:"L'Ordre des Ombres ne laisse jamais de témoins.",hp:92,speed:1.23,power:0.9,atkSpeed:1.19,energyGain:1.08,scale:0.96,bulk:0.85,reach:1,gravity:0.75,jump:17.1,knockRes:1.12,dashCD:20,
  skin:{primary:"#311b4d",dark:"#12081f",accent:"#b388ff",pants:"#1a1026",skin:"#e0c8b8",hair:"#140a20",glove:"#4527a0",trail:"#b388ff"}},
 {id:"Kairos",name:"Kairos",title:"Mage des Tempêtes",letter:"K",style:"hero",specName:"⛈️ Foudre des Tempêtes",superName:"🌩️ Jugement du Ciel",victoryLine:"Je suis le calme juste avant l'orage… et l'orage lui-même.",hp:98,speed:1.05,power:1.03,atkSpeed:1.03,energyGain:1.44,scale:1.01,bulk:0.94,reach:1.03,gravity:0.77,jump:16.2,knockRes:1.01,dashCD:25,
  skin:{primary:"#1565c0",dark:"#0a2a5e",accent:"#82b1ff",pants:"#10243e",skin:"#d9a066",hair:"#101418",glove:"#1976d2",trail:"#82b1ff"}},
 {id:"Zara-nova",name:"Zara",title:"Ingénieure de la Colonie Nova",letter:"Z",style:"hero",specName:"🔩 Tir d'Ingénieure",superName:"🛰️ Colonie Nova",victoryLine:"Sur Nova, on répare tout. Même les défaites des autres.",hp:99,speed:1.1,power:0.99,atkSpeed:1.08,energyGain:1.18,scale:0.99,bulk:0.92,reach:1.02,gravity:0.78,jump:16.4,knockRes:1,dashCD:23,
  skin:{primary:"#f9a825",dark:"#7a5200",accent:"#4fc3f7",pants:"#37474f",skin:"#e0ac82",hair:"#3a2410",glove:"#fbc02d",trail:"#ffd54f"}},
 {id:"brutus",name:"BRUTUS",title:"Tank de la Légion de Fer",letter:"B",style:"synthetique",specName:"🛡️ Charge de la Légion",superName:"💥 Marteau de Fer",victoryLine:"La Légion de Fer avance. Elle ne négocie pas.",hp:123,speed:0.81,power:1.29,atkSpeed:0.87,energyGain:0.9,scale:1.15,bulk:1.39,reach:1.09,gravity:0.91,jump:14.3,knockRes:0.69,dashCD:37,
  skin:{primary:"#b71c1c",dark:"#2b0d0d",accent:"#ff8a65",pants:"#26181c",skin:"#8a8f94",hair:"#37474f",glove:"#263238",trail:"#ff7043"}},
 {id:"aria",name:"Aria",title:"Prêtresse de la Lumière Céleste",letter:"A",style:"nova",specName:"✨ Lumière Céleste",superName:"🌟 Chœur des Cieux",victoryLine:"Que la lumière guide tes pas… hors de mon arène.",hp:96,speed:1.04,power:0.98,atkSpeed:1.02,energyGain:1.48,scale:1,bulk:0.9,reach:1.01,gravity:0.75,jump:16.3,knockRes:1.03,dashCD:25,
  skin:{primary:"#eef0f4",dark:"#b0a58c",accent:"#ffd54f",pants:"#d8d2c0",skin:"#f0d9c8",hair:"#eae6da",glove:"#ffd54f",trail:"#fff9c4"}},
 {id:"krak",name:"Krak",title:"Brute de la Tribu des Marais",letter:"K",style:"titan",specName:"🐊 Fureur des Marais",superName:"🌋 Krak Écrase",victoryLine:"Krak pas content. Krak ÉCRASE. Toi par terre.",hp:126,speed:0.78,power:1.34,atkSpeed:0.84,energyGain:0.86,scale:1.17,bulk:1.42,reach:1.11,gravity:0.93,jump:14,knockRes:0.66,dashCD:39,
  skin:{primary:"#5d4037",dark:"#2e1d16",accent:"#ffb300",pants:"#3e2723",skin:"#6d9c3f",hair:"#1c2410",glove:"#4e342e",trail:"#9ccc65"}},
 {id:"luna",name:"Luna",title:"Robot Exploratrice Unité 7",letter:"L",style:"synthetique",specName:"🤖 Tir d'Exploration",superName:"🌕 Protocole Luna",victoryLine:"Exploration terminée : ce territoire est conquis.",hp:102,speed:1.17,power:0.97,atkSpeed:1.11,energyGain:1.12,scale:1,bulk:0.92,reach:1.03,gravity:0.78,jump:16.7,knockRes:0.97,dashCD:22,
  skin:{primary:"#eceff1",dark:"#78909c",accent:"#40c4ff",pants:"#263238",skin:"#dfe7eb",hair:"#eceff1",glove:"#102027",trail:"#40c4ff"}},
 {id:"velen",name:"Velen",title:"Tueur du Syndicat",letter:"V",style:"kunoichi",specName:"🎭 Frappe du Syndicat",superName:"📜 Contrat Rempli",victoryLine:"Ce n'était pas personnel. Juste un contrat.",hp:97,speed:1.18,power:1,atkSpeed:1.12,energyGain:1.06,scale:1,bulk:0.93,reach:1.04,gravity:0.77,jump:16.6,knockRes:1.03,dashCD:22,
  skin:{primary:"#8e1414",dark:"#14060a",accent:"#ff5252",pants:"#1a0c10",skin:"#b97f4e",hair:"#160809",glove:"#263238",trail:"#ff5252"}},
 {id:"lyra-azur",name:"Lyra",title:"Dragonnière des Ciels d'Azur",letter:"L",style:"guerrier",specName:"🐉 Souffle d'Azur",superName:"🐲 Chevauchée des Ciels",victoryLine:"Les ciels d'Azur ont une nouvelle légende.",hp:103,speed:1.08,power:1.06,atkSpeed:1.05,energyGain:1.16,scale:1.02,bulk:0.97,reach:1.07,gravity:0.79,jump:16.2,knockRes:0.97,dashCD:24,
  skin:{primary:"#42a5f5",dark:"#1c3f6e",accent:"#e3f2fd",pants:"#2c4a73",skin:"#e8b98d",hair:"#3a2410",glove:"#90a4ae",trail:"#82b1ff"}},
 {id:"orion",name:"ORION",title:"Scientifique de l'Alliance Galactique",letter:"O",style:"hero",specName:"🔬 Rayon Expérimental",superName:"🧪 Théorie Vérifiée",victoryLine:"Hypothèse : ma victoire. Résultat : confirmé.",hp:98,speed:1.06,power:0.97,atkSpeed:1.04,energyGain:1.3,scale:1,bulk:0.93,reach:1.02,gravity:0.79,jump:16,knockRes:1.02,dashCD:25,
  skin:{primary:"#eceff1",dark:"#90a4ae",accent:"#00b0ff",pants:"#37474f",skin:"#d9a066",hair:"#14100c",glove:"#00b0ff",trail:"#80d8ff"}}
];
function charStatBars(c){ return {VIT:clamp(Math.round(c.speed*58),5,100),PUI:clamp(Math.round(c.power*62),5,100),VIE:clamp(Math.round(c.hp*.78),5,100),ÉNER:clamp(Math.round(c.energyGain*55),5,100)}; }

/* ---------------- DONNÉES : ARÈNES ---------------- */
const ARENAS=[
 {id:"stadium",name:"Stade Godson — Sunset",music:{interval:205,bass:[55,55,82.4,55,65.4,55,98,73.4],lead:[220,261.6,329.6,261.6]}},
 {id:"tokyo",name:"Néon Tokyo — Pluie",music:{interval:178,bass:[49,49,73.4,49,61.7,49,98,82.4],lead:[196,246.9,293.7,246.9]}},
 {id:"temple",name:"Temple Céleste — Jour",music:{interval:235,bass:[65.4,65.4,98,65.4,73.4,65.4,110,98],lead:[261.6,329.6,392,329.6]}},
 {id:"Libreville",name:"Plage de Libreville — Coucher de soleil",music:{interval:218,bass:[55,65.4,82.4,65.4,73.4,82.4,98,73.4],lead:[220,329.6,392,329.6,261.6]}}
];
let currentArena=ARENAS[0];
/* Arena Moods V2.8 : la préférence peut être Auto ou forcée par le joueur ;
   currentArenaMood contient toujours l’ambiance réellement affichée. */
const ARENA_MOODS={
  auto:{id:"auto",label:"Auto",icon:"🎨",short:"Ambiance signature de l’arène"},
  jour:{id:"jour",label:"Jour",icon:"☀️",short:"Lumière claire et ciel lumineux"},
  crepuscule:{id:"crepuscule",label:"Crépuscule",icon:"🌇",short:"Horizon doré et reflets chauds"},
  nuit:{id:"nuit",label:"Nuit",icon:"🌙",short:"Étoiles, lune et néons renforcés"}
};
const ARENA_DEFAULT_MOODS={stadium:"crepuscule",tokyo:"nuit",temple:"jour",Libreville:"crepuscule"};
/* ---------------- CHAMPIONNAT Godson V5 : 3 CIRCUITS ----------------
   Le mode Arcade devient un championnat structuré : adversaires uniques,
   arènes imposées en tournée, difficulté croissante et boss final. */
const CHAMPIONSHIP_CIRCUITS={
  stade:{id:"stade",name:"Circuit Stade Godson",icon:"🏟️",stages:5,xp:250,coins:150,arenas:["stadium","tokyo","temple","Libreville","stadium"],diffs:["facile","facile","moyen","moyen","difficile"],bossPool:[2,3,6],desc:"5 combats pour entrer dans la légende locale."},
  monde:{id:"monde",name:"Circuit Monde des Planches",icon:"🌍",stages:8,xp:500,coins:300,arenas:["stadium","temple","tokyo","Libreville","temple","stadium","tokyo","Libreville"],diffs:["facile","moyen","moyen","moyen","difficile","difficile","difficile","difficile"],bossPool:[36,21,34,28],desc:"8 champions des planches sur toutes les arènes."},
  legendes:{id:"legendes",name:"Circuit des Légendes",icon:"👑",stages:12,xp:1000,coins:650,arenas:["stadium","tokyo","temple","Libreville","tokyo","temple","Libreville","stadium","temple","tokyo","stadium","Libreville"],diffs:["moyen","moyen","difficile","difficile","difficile","difficile","difficile","difficile","difficile","difficile","difficile","difficile"],bossPool:[4],desc:"12 combats, presque tous en Difficile. GODSON PRIME garde la couronne."}
};
function resolveArenaMood(arenaId,preference){ return preference&&preference!=="auto"&&ARENA_MOODS[preference]?preference:(ARENA_DEFAULT_MOODS[arenaId]||"jour"); }
function arenaMoodLabel(mood){ const m=ARENA_MOODS[mood]||ARENA_MOODS.auto; return m.icon+" "+m.label; }
let selArenaMood=ARENA_MOODS[PROFILE.selection.arenaMood]?PROFILE.selection.arenaMood:"auto";
let currentArenaMood=resolveArenaMood(currentArena.id,selArenaMood);

/* ---------------- DONNÉES : ATTAQUES (frame data pro) ---------------- */
const ATTACKS={
  punch:   {dur:16,start:4, end:9, dmg:6, range:104,knock:4.2,hitstun:11,blockstun:6, energy:6, label:"Poing"},
  kick:    {dur:24,start:7, end:15,dmg:9, range:116,knock:7.5,hitstun:14,blockstun:8, energy:8, label:"Pied",hard:true},
  uppercut:{dur:28,start:8, end:16,dmg:11,range:97, knock:2.5,hitstun:18,blockstun:9, energy:9, label:"Uppercut",hard:true,launcher:11.5},
  sweep:   {dur:27,start:8, end:16,dmg:8, range:118,knock:6,  hitstun:14,blockstun:8, energy:8, label:"Balayage",hard:true,knockdown:true,low:true},
  airPunch:{dur:15,start:3, end:9, dmg:6, range:99, knock:4,  hitstun:11,blockstun:6, energy:6, label:"Poing aérien",air:true},
  airKick: {dur:21,start:6, end:14,dmg:9, range:112,knock:6.5,hitstun:14,blockstun:8, energy:8, label:"Pied aérien",hard:true,air:true},
  special: {dur:27,start:8, end:9, dmg:14,range:0,  knock:7,  hitstun:15,blockstun:9, energy:0, label:"Spécial"},
  exspecial:{dur:24,start:7, end:9, dmg:17,range:0,  knock:8,  hitstun:16,blockstun:10,energy:0, label:"EX Spécial",hard:true},
  super:   {dur:32,start:9, end:10,dmg:23,range:0,  knock:11, hitstun:19,blockstun:11,energy:0, label:"SUPER",hard:true,knockdown:true},
  throw:   {dur:25,start:5, end:8, dmg:12,range:82, knock:10, hitstun:20,blockstun:0, energy:10,label:"Projection",hard:true,knockdown:true,throw:true}
};
const CANCELS={ punch:["punch","kick","uppercut","sweep","special","exspecial"], kick:["special","exspecial"], uppercut:["special","exspecial"], sweep:[], airPunch:["airKick"], airKick:[], special:[], exspecial:[], super:[], throw:[] };
/* ---------------- M1 SIGNATURE V5.1 : UNE CHAÎNE PAR COMBATTANT ----------------
   Demande prioritaire du propriétaire : chaque personnage possède son M1.
   On le joue simplement en appuyant de façon répétée sur POING au sol.
   Format compact d'une ligne : [id, nom de la chaîne, effet visuel, tempo,
   bonus de portée, puissance propre, type de final, [[type, nom du coup], ...]].
   P=Poing, K=Pied (Kick), U=Uppercut, S=Balayage (Sweep). La normalisation
   transforme ensuite ces données d'auteur en frame data complète. */
const M1_STEP_TYPES={P:"punch",K:"kick",U:"uppercut",S:"sweep"};
const M1_RAW=[["gideon","Foudre du Champion","foudre",0.9,5,1.0,"launch",[["P","Jab Fulgurant"],["P","Direct du Champion"],["K","Fouet du Stade"],["U","Jugement Ascendant"]]],["kira","Danse de la Foudre","traînées",0.74,3,0.9,"down",[["P","Griffe Éclair"],["P","Double Crochet"],["K","Talon Foudre"],["P","Rafale Kira"],["S","Balayage Tempête"]]],["titan","Marteau de la Montagne","éclats sismiques",1.12,7,1.12,"launch",[["P","Poing Sismique"],["K","Botte de Fer"],["U","Éruption Titan"]]],["nova","Pulsar Arcanique","orbites",0.86,8,0.95,"burst",[["P","Étincelle Nova"],["P","Rayon Court"],["K","Talon Orbital"],["P","Cœur Pulsar"]]],["godson-prime","Jugement Royal","couronne royale",0.82,8,1.08,"down",[["P","Sceptre Droit"],["K","Botte Royale"],["P","Main du Trône"],["U","Ascension Prime"],["K","Chute Royale"]]],["Zara","Marée de Libreville","écume",0.84,7,1.0,"burst",[["P","Vague Courte"],["K","Lame de Marée"],["S","Ressac Bas"],["K","Raz-de-Marée"]]],["kael","Croisade d’Acier","lames",0.94,14,1.05,"launch",[["P","Estoc d’Acier"],["P","Taille d’Honneur"],["K","Botte Blindée"],["U","Levée du Serment"]]],["sora","Rune Tourbillonnante","runes",0.88,9,0.96,"down",[["P","Sceau Arcanique"],["P","Glyphe Frappeur"],["U","Comète Montante"],["K","Chute Pourpre"]]],["ael","Protocole Sept","circuits",0.76,6,0.94,"launch",[["P","Percuteur 01"],["P","Double Servo"],["P","Servo Croisé"],["K","Propulseur AEL"],["U","Éjection Orbitale"]]],["Lira","Route Sauvage","lames",0.85,9,0.98,"down",[["P","Couteau de Route"],["K","Pas de Piste"],["P","Crochet d’Exploratrice"],["S","Chute du Canyon"]]],["zed","Traque Silencieuse","traînées",0.82,7,0.95,"burst",[["P","Flèche Courte"],["P","Crochet du Traqueur"],["K","Botte de Piste"],["K","Coup Fatal"]]],["nyx","Surcharge Atelier","circuits",0.8,5,0.94,"burst",[["P","Clé Dynamique"],["P","Impulsion Tech"],["K","Talon Magnétique"],["P","Décharge Atelier"]]],["vorak","Berserk Sauvage","éclats sismiques",1.1,7,1.13,"down",[["P","Griffe Sauvage"],["K","Botte Bestiale"],["P","Fracas Vorak"]]],["aerin","Vent des Cimes","traînées",0.75,6,0.9,"burst",[["P","Flèche Vive"],["P","Double Rameau"],["K","Talon des Cimes"],["P","Feuille Frappeuse"],["K","Rafale Verte"]]],["korben","Maintenance Orbitale","circuits",0.92,6,1.02,"launch",[["P","Marteau de Bord"],["K","Botte à Propulsion"],["P","Visseuse Korben"],["U","Lancement Orbital"]]],["lyra","Aurore Sacrée","orbites",0.87,7,0.97,"launch",[["P","Main Solaire"],["P","Halo Frappeur"],["K","Talon de Lumière"],["U","Lever d’Aurore"]]],["drakesh","Contrat du Chasseur","circuits",0.88,9,1.02,"burst",[["P","Crosse Rapide"],["K","Botte de Prime"],["P","Tir à Bout Portant"],["K","Exécution du Contrat"]]],["selene","Abordage Stellaire","lames",0.78,10,0.94,"burst",[["P","Sabre Court"],["P","Double Entaille"],["S","Crochet de Pirate"],["K","Botte d’Abordage"],["P","Trésor Perdu"]]],["taiko","Méditation de l’Ombre","lames",0.83,8,0.98,"down",[["P","Paume Silencieuse"],["U","Ombre Montante"],["P","Frappe du Lotus"],["S","Chute de Lune"]]],["vex","Hydraulique Maximale","éclats sismiques",1.08,7,1.1,"launch",[["P","Piston Vex"],["K","Botte Hydraulique"],["U","Soulèvement Cyber"]]],["elara","Songe Éveillé","runes",0.84,8,0.92,"burst",[["P","Toucher Onirique"],["P","Miroir de Rêve"],["U","Lune Montante"],["P","Réveil Brutal"]]],["brax","Éboulement Vivant","éclats sismiques",1.14,8,1.14,"down",[["P","Poing de Granit"],["S","Ravine Basse"],["K","Avalanche Brax"]]],["kazu","Voie du Vent","lames",0.85,12,1.0,"launch",[["P","Iai Court"],["P","Coupe du Vent"],["K","Talon du Samouraï"],["U","Montée du Dragon"]]],["sera","Intrusion Express","circuits",0.72,4,0.9,"down",[["P","Ping Frappeur"],["P","Double Paquet"],["P","Cheval de Troie"],["K","Botte Root"],["S","Crash Système"]]],["vorga","Sables Déchus","écume",0.9,8,1.02,"burst",[["P","Griffe du Désert"],["S","Dune Basse"],["P","Main Déchue"],["K","Tempête de Sable"]]],["nox","Étreinte Sylvestre","runes",0.86,7,0.95,"burst",[["P","Rameau Frappeur"],["K","Botte Racine"],["U","Cime Montante"],["P","Cœur de Forêt"]]],["raven","Visée Parfaite","circuits",0.84,8,0.97,"launch",[["P","Crosse Tactique"],["P","Double Point"],["K","Talon de Tireuse"],["U","Détente Verticale"]]],["zep","Pression Abyssale","circuits",0.91,7,1.0,"down",[["P","Harpon Court"],["K","Botte Ballast"],["P","Crochet des Abysses"],["S","Vague de Fond"]]],["astrid","Trône Déchu","couronne royale",0.83,10,1.04,"down",[["P","Lame Noble"],["P","Seconde Lame"],["K","Botte d’Argent"],["U","Couronne Montante"],["K","Sentence Royale"]]],["selenia","Bénédiction des Rôdeurs","traînées",0.8,7,0.94,"burst",[["P","Flèche de Ronce"],["P","Double Rôdeuse"],["K","Talon Sacré"],["P","Flèche Finale"]]],["drakar","Hiver du Clan","éclats sismiques",1.1,10,1.11,"down",[["P","Hache Courte"],["K","Botte de Givre"],["S","Balayage du Nord"]]],["nyx-ombre","Sentence des Ombres","traînées",0.73,6,0.93,"launch",[["P","Dague Furtive"],["P","Seconde Dague"],["S","Ombre Basse"],["P","Point Vital"],["U","Sentence de l’Ordre"]]],["Kairos","Orage Temporel","foudre",0.87,7,1.0,"burst",[["P","Éclair Retardé"],["U","Orbe Montant"],["P","Seconde Frappe"],["K","Foudre Finale"]]],["Zara-nova","Protocole Colonie","circuits",0.77,5,0.94,"launch",[["P","Riveteuse Nova"],["P","Double Outil"],["K","Botte Antigrav"],["P","Clé Orbitale"],["U","Éjection Nova"]]],["brutus","Marteau de la Légion","éclats sismiques",1.12,8,1.13,"down",[["P","Poing Blindé"],["K","Botte de Légion"],["P","Marteau de Fer"]]],["aria","Chœur Céleste","orbites",0.82,7,0.96,"down",[["P","Note de Lumière"],["P","Accord Sacré"],["U","Hymne Ascendant"],["K","Chœur Final"]]],["krak","Fureur des Marais","éclats sismiques",1.13,7,1.14,"launch",[["P","Griffe du Marais"],["S","Boue Basse"],["U","Krak Soulève"]]],["luna","Exploration Lunaire","circuits",0.84,6,0.95,"burst",[["P","Sonde Courte"],["P","Bras d’Exploration"],["K","Botte Lunaire"],["P","Signal Lunaire"]]],["velen","Contrat Rempli","traînées",0.78,7,0.98,"launch",[["P","Lame du Syndicat"],["S","Coupe Basse"],["P","Frappe Discrète"],["K","Talon du Tueur"],["U","Exécution Velen"]]],["lyra-azur","Chevauchée Dragonaile","couronne royale",0.8,9,1.03,"down",[["P","Griffe d’Azur"],["K","Botte Écaille"],["P","Souffle Court"],["U","Aile Montante"],["K","Chute du Dragon"]]],["orion","Théorie Appliquée","foudre",0.89,7,0.97,"launch",[["P","Calcul Frappeur"],["P","Hypothèse Orion"],["K","Botte Expérimentale"],["U","Conclusion Verticale"]]]];
function normalizeM1Signature(rawDef){
  const [id,name,fx,tempo,reach,power,finalKind,rawSteps]=rawDef;
  const steps=rawSteps.map((rawStep,idx)=>{
    const type=M1_STEP_TYPES[rawStep[0]]||"punch",final=idx===rawSteps.length-1;
    return {
      type,label:rawStep[1],final,finalKind:final?finalKind:"",
      dmgMul:(final?1.16:(idx===0?.84:.90+idx*.02))*power,
      durMul:tempo*(final?1.05:.90+idx*.02),
      rangeAdd:reach+(type==="kick"?4:type==="sweep"?5:type==="uppercut"?1:0)+(final?3:0),
      advance:(idx===0?.65:(final?.95:.52))*(tempo>1?1.15:1),
      hitstunAdd:final?1:7,
      knockAdd:final?(finalKind==="burst"?2.4:1.4):-1.15
    };
  });
  return {id,name,fx,tempo,reach,power,finalKind,steps,pattern:steps.map(st=>st.type).join(">"),labels:steps.map(st=>st.label)};
}
const M1_SIGNATURES={}; M1_RAW.forEach(d=>{ M1_SIGNATURES[d[0]]=normalizeM1Signature(d); });
function m1SignatureFor(source){
  const id=source&&source.char?source.char.id:(source&&source.id?source.id:source);
  return M1_SIGNATURES[id]||M1_SIGNATURES.gideon;
}
function versionAtLeast(v,min){
  const a=String(v||"0").split(".").map(n=>parseInt(n,10)||0),b=String(min).split(".").map(n=>parseInt(n,10)||0);
  for(let i=0;i<3;i++){ if((a[i]||0)>(b[i]||0))return true; if((a[i]||0)<(b[i]||0))return false; }
  return true;
}
function m1Enabled(){
  if(!replayPlayback.active||!replayPlayback.data)return true;
  const v=replayPlayback.data.gameVersion;
  return !v||versionAtLeast(v,"5.1.0"); // les replays antérieurs gardent l'ancien poing générique
}
function resetM1Chain(f){ f.m1Next=0; f.m1Step=-1; f.m1ChainT=0; }
/* V7.6 — MOBILITÉ DYNAMIQUE : le jeu direct gagne en accélération, contrôle
   aérien, dash et tolérance d'entrée. Les anciens replays gardent le profil
   V7.5 exact afin que leurs checkpoints et leur hash restent vérifiables. */
const MOBILITY76={
  legacy:{name:"legacy",buffer:9,attackBuffer:10,doubleTap:18,coyote:6,dashDur:12,dashSpeed:12.4,baseSpeed:4.7,runMax:.3,runRamp:160,groundAccel:.3,groundStop:.36,groundReverse:.3,attackSlide:.36,airSpeed:.8,airBlend:.15,dashBlend:.65,riseGravity:1,apexGravity:1,fallGravity:1,fallCap:19,ghostEvery:2},
  dynamic:{name:"dynamic",buffer:11,attackBuffer:12,doubleTap:21,coyote:8,dashDur:13,dashSpeed:12.9,baseSpeed:4.85,runMax:.34,runRamp:135,groundAccel:.34,groundStop:.4,groundReverse:.43,attackSlide:.22,airSpeed:.88,airBlend:.2,dashBlend:.7,riseGravity:.9,apexGravity:.68,fallGravity:1.12,fallCap:20,ghostEvery:1}
};
function mobilityProfile76(){
  const replayVersion=replayPlayback.active&&replayPlayback.data?replayPlayback.data.gameVersion:null;
  if(replayVersion!==null&&replayVersion!==GAME_VERSION&&!versionAtLeast(replayVersion||"0","7.6.0"))return MOBILITY76.legacy;
  return MOBILITY76.dynamic;
}

const DIFFS={
  facile:{label:"Facile",react:24,agg:.42,block:.15,spec:.25,jump:.06,mistake:.38,speed:.9,combo:.18,dash:.08,parry:.04},
  moyen:{label:"Moyen",react:13,agg:.66,block:.42,spec:.6,jump:.13,mistake:.16,speed:1,combo:.55,dash:.3,parry:.17},
  difficile:{label:"Difficile",react:7,agg:.88,block:.69,spec:.92,jump:.2,mistake:.05,speed:1.07,combo:.92,dash:.55,parry:.36}
};

/* ---------------- MODE HISTOIRE : SAGA Gideon - Godson (CHAPITRES 1 & 2) ---------------- */
const STORY_CAMPAIGN={
  title:"Saga Gideon - Godson — Chapitres 1 & 2",
  fights:[
    {char:1,diff:"facile",arena:"stadium",foeName:"Kira, la Rivale",act:"Chapitre 1 — L’Appel de l’Arène",chapter:"Combat 1 — La porte du Stade Gideon",
     objective:"Prouve ta valeur : remporte le duel d’entrée de l’Arène.",
     dialogue:[
       ["NARRATION","Libreville s’embrase : le tournoi Gideon - Godson va couronner un nouveau champion. Une seule porte, une seule règle — gagner."],
       ["Kira","Tu veux entrer dans la grande Arène ? Les champions ne frappent pas à la porte… ils la traversent. Montre-moi ton dash, tes combos, ton courage !"],
       ["TOI","Je ne suis pas venu regarder les projecteurs. Je suis venu écrire mon nom au sommet. Que le premier combat commence !"]
     ],
     retry:"Kira te tend la main : « Relève-toi. Un champion se mesure à sa façon de revenir. Encore une fois ! »"},
    {char:3,diff:"moyen",arena:"temple",foeName:"NOVA, Gardienne de l’Énergie",act:"Chapitre 1 — L’Appel de l’Arène",chapter:"Combat 2 — Le secret du Temple Céleste",
     objective:"Maîtrise l’énergie : bats Nova et apprends la voie des attaques spéciales.",
     dialogue:[
       ["NARRATION","Au Temple Céleste, les anciens champions ont caché le secret de l’énergie Godson — celle qui transforme un coup en légende."],
       ["NOVA","Ta force brute t’a mené jusqu’ici. Mais sais-tu charger ton énergie, la garder… puis la libérer au moment parfait ?"],
       ["TOI","Apprends-moi en combattant. Si je dois mériter cette lumière, je la gagnerai à la loyale !"]
     ],
     retry:"Nova sourit : « L’énergie ne se vole pas, elle s’apprend. Respire, observe mes projectiles… et réessaie. »"},
    {char:2,diff:"difficile",arena:"tokyo",foeName:"TITAN, le Boss de Néon Tokyo",act:"Chapitre 1 — L’Appel de l’Arène",chapter:"Combat final du Chapitre 1 — Le Boss sous la pluie de néons",
     objective:"BOSS FINAL : fais tomber TITAN et deviens le Champion de l’Arène.",
     dialogue:[
       ["NARRATION","Néon Tokyo, minuit. Sous la pluie, le champion invaincu TITAN garde la ceinture Gideon - Godson depuis mille combats."],
       ["TITAN","On dit qu’un nouveau nom fait trembler l’Arène. Les noms ne me font pas peur. Seuls les poings parlent ici."],
       ["TOI","Alors écoute bien, Titan : ce soir, l’Arène apprendra à prononcer un nouveau champion. Pour Gideon - Godson !"]
     ],
     retry:"TITAN croise les bras sous la pluie : « Bien frappé… mais un boss ne tombe pas au premier orage. Reviens plus fort ! »"},
    {char:5,diff:"moyen",arena:"Libreville",foeName:"Zara, la Vague de Libreville",act:"Chapitre 2 — La Marée des Champions",chapter:"Combat 4 — Retour à Libreville",
     objective:"Nouvelle rivale : résiste aux Lames de Marée de Zara et saute par-dessus son Raz-de-Marée.",
     dialogue:[
       ["NARRATION","Après la pluie de Néon Tokyo, le champion rentre à Libreville. Sur la plage, au coucher du soleil, une nouvelle foule l’attend… et une vague ne demande jamais la permission."],
       ["Zara","Bienvenue chez toi, champion. Ici, le sable glisse, le vent pousse et la mer frappe sans prévenir. Montre-moi que ton titre tient debout face à la marée !"],
       ["TOI","Libreville m’a vu commencer. Ce soir, elle me verra défendre mon nom. Zara, que la marée monte !"]
     ],
     retry:"Zara trace un cercle dans le sable : « La mer recule toujours avant de revenir plus fort. Respire… et reviens avec la prochaine vague. »"},
    {char:3,diff:"difficile",arena:"tokyo",foeName:"Nova Déchaînée",act:"Chapitre 2 — La Marée des Champions",chapter:"Combat 5 — L’orage d’énergie",
     objective:"Nova revient en mode difficile : surveille son orbe chercheuse et sa pluie d’énergie.",
     dialogue:[
       ["NARRATION","Une tempête d’énergie s’abat sur Néon Tokyo. Nova, battue au Temple, a passé des mois à étudier chaque combo du champion."],
       ["NOVA","Tu m’as appris la défaite, champion. Je te dois une leçon en retour : mon orbe te suivra, ma pluie te jugera. Cette fois, je ne retiendrai rien."],
       ["TOI","Alors viens, Nova. Un vrai champion ne craint pas l’orage : il apprend à danser sous la foudre !"]
     ],
     retry:"Nova relève ses lunettes d’énergie : « J’ai noté tes habitudes. Change de rythme, champion… surprends-moi. »"},
    {char:4,diff:"difficile",arena:"Libreville",foeName:"GODSON PRIME — L’Épreuve du Champion",act:"Chapitre 2 — La Marée des Champions",chapter:"Combat final — L’héritier face à la légende",
     objective:"BOSS ULTIME : vaincs GODSON PRIME sur la Plage de Libreville et deviens une légende vivante.",
     dialogue:[
       ["NARRATION","Le soleil touche l’horizon de Libreville. Devant toute l’Arène réunie, une silhouette dorée descend sur le sable : GODSON PRIME, la légende elle-même."],
       ["GODSON PRIME","Tu as conquis l’Arène, champion. Mais une légende ne se reçoit pas : elle se prouve. Bats-moi, et ton nom dépassera les mers."],
       ["TOI","Je respecte la légende… mais je suis venu écrire la suite. Pour Libreville, pour l’Arène, pour Gideon - Godson !"]
     ],
     retry:"GODSON PRIME tend sa couronne vers l’horizon : « Une légende tombe mille fois avant de se relever une fois pour l’histoire. Encore ! »"}
  ],
  chapter1Ending:[
    ["NARRATION","TITAN s’incline sous les néons. La foule explose : l’Arène Gideon - Godson a trouvé son champion !"],
    ["TITAN","Cette ceinture… elle attendait quelqu’un comme toi. Porte-la avec honneur, champion."],
    ["NARRATION","🏆 RÉCOMPENSE DÉBLOQUÉE : le personnage secret GODSON PRIME rejoint ton équipe, avec sa SUPER attaque triple !"],
    ["TOI","Ce n’est que le Chapitre 1. Une vague monte déjà du côté de Libreville…"]
  ],
  ending:[
    ["NARRATION","Le dernier coup résonne sur la Plage de Libreville. Le soleil embrase l’océan, la foule se lève : la légende vient de passer le relais."],
    ["GODSON PRIME","Tu n’as pas seulement gagné un combat. Tu as protégé un nom, une ville et une Arène. À partir d’aujourd’hui, les champions prononceront le tien avec respect."],
    ["Zara","La marée t’a choisi, champion. Libreville entière combattra à tes côtés !"],
    ["NARRATION","🌴 RÉCOMPENSE DÉBLOQUÉE : la tenue « Coucher de soleil de Libreville » est disponible dans la Personnalisation. La saga Gideon - Godson continue…"]
  ]
};
function currentStoryFight(){ return STORY_CAMPAIGN.fights[clamp((typeof story!=="undefined"?story.step:1)-1,0,STORY_CAMPAIGN.fights.length-1)]; }

/* ---------------- COMBATTANTS ---------------- */
let fighterSeq=0;
class Fighter{
  constructor(startX,side){
    this.id=++fighterSeq; this.side=side; this.startX=startX;
    this.char=CHARACTERS[side===1?0:2]; this.charIndex=side===1?0:2;
    this.skin={...this.char.skin}; this.letter=this.char.letter;
    this.name=side===1?"Gédéon":"Adversaire"; this.displayName=this.name;
    this.maxHealth=this.char.hp; this.roundWins=0;
    this.stats={damage:0,hits:0,attacks:0,maxCombo:0,maxComboDamage:0,blocked:0,parries:0,throws:0,cancels:0,ex:0,m1Hits:0,m1Chains:0,m1Finishers:0};
    this.reset();
  }
  reset(){
    this.x=this.startX; this.y=GROUND; this.px=this.x; this.py=this.y; this.rx=this.x; this.ry=this.y;
    this.vx=0; this.vy=0; this.kvx=0; this.facing=this.startX<W/2?1:-1;
    this.health=this.maxHealth; this.energy=0; this.grounded=true;
    this.blocking=false; this.crouching=false; this.dead=false; this.victory=false; this.koT=0;
    this.attackT=0; this.attackDur=0; this.attackType=null; this.attack=null; this.attackId=0; this.hasHit=false; this.hitConfirmed=false; this.spawned=true;
    this.hitStun=0; this.blockStun=0; this.hitFlash=0; this.downT=0; this.knockdownPending=false; this.invulnT=0; this.juggleT=0; this.comboVuln=false;
    this.parryT=0; this.parryFlashT=0; this.counterWindowT=0; this.powerMul=1;
    this.combo=0; this.comboT=0; this.comboDamage=0; this.comboSeq=[]; this.lastHitBy=null;
    this.dashT=0; this.dashDir=1; this.dashCD=0; this.airDashed=false; this.godsonCancelReady=true; this.inputDir=0; this.lastVXSign=0; this.attackEx=false; this.throwDir=1;
    this.bufType=null; this.bufT=0; this.jumpBufT=0; this.dashBufT=0; this.dashBufDir=1; this.coyote=0; this.jumpCut=false;
    this.m1Next=0; this.m1Step=-1; this.m1ChainT=0;
    this.lastTapDir=0; this.lastTapFrame=-99; this.holdDir=0; this.holdT=0;
    this.anim=replayRand()*100; this.walkPhase=0; this.squashT=0; this.blinkT=80+replayRand()*120;
    this.prev={left:false,right:false,jump:false,block:false,punch:false,kick:false,special:false,dash:false};
    this.motion=null; this.crouchBlend=0; // V7.6 : aucun ressort visuel hérité au changement de round/personnage
    this.posePrev3d=null; this.poseMidL3d=null; this.poseMidW3d=null; this.downBlend3d=0; this.downBlend2d=0; this.victoryBlend2d=0; this.faceSmooth3d=null; this.supportAnchor715=null; this.turnAnchor715=null; this.plant716=null; // V7.13/V7.15 : mémoire d'animation et d'appuis repartie à zéro
  }
}
const p1=new Fighter(390,1), p2=new Fighter(890,2);
const fighters=[p1,p2];
function applyCharacterTo(f,charIndex){
  const c=CHARACTERS[clamp(charIndex,0,CHARACTERS.length-1)];
  f.char=c; f.charIndex=CHARACTERS.indexOf(c); f.maxHealth=c.hp;
  const custom=f.side===1?PROFILE.customColors.p1:PROFILE.customColors.p2;
  f.skin={...c.skin};
  if(custom&&custom.primary){ f.skin.primary=custom.primary; f.skin.dark=shade(custom.primary,-62); f.skin.accent=custom.accent||c.skin.accent; f.skin.trail=custom.accent||c.skin.trail; }
  f.letter=(f.side===1?PROFILE.initials.p1:(pendingMode==="2p"?PROFILE.initials.p2:c.letter))||c.letter;
  f.health=Math.min(f.health||c.hp,c.hp);
}
function isLocalCareerFighter(f){
  if(replayPlayback.active)return false;
  if(mode==="online"&&typeof onlineSession!=="undefined"&&onlineSession)return f.side===(onlineSession.localSide||1);
  return f===p1;
}
function buildDisplayNames(){
  p1.name=(PROFILE.names.p1||"Gédéon").trim()||"Gédéon";
  if(mode==="online"&&replayPlayback.active&&replayPlayback.data&&replayPlayback.data.names){ p1.name=String(replayPlayback.data.names.p1||p1.name).slice(0,24); p2.name=String(replayPlayback.data.names.p2||"Joueur 2").slice(0,24); }
  else if(mode==="online"&&typeof onlineSession!=="undefined"&&onlineSession&&onlineSession.config){ p1.name=String(onlineSession.config.hostName||"Joueur 1").slice(0,24); p2.name=String(onlineSession.config.guestName||"Joueur 2").slice(0,24); }
  else if(mode==="2p")p2.name=(PROFILE.names.p2||"Joueur 2").trim()||"Joueur 2";
  else if(mode==="training")p2.name="Mannequin";
  else if(mode==="story")p2.name=currentStoryFight().foeName;
  else if(mode==="survival")p2.name=(survival.next&&survival.next.boss?"👑 BOSS — Vague ":"🌊 Vague ")+survival.wave;
  else if(mode==="arcade")p2.name="BOT "+arcade.stage+"/"+arcadeTotal();
  else if(mode==="tournament")p2.name="🏆 "+(((typeof tournamentCurrentMatch==="function"&&tournamentCurrentMatch())||{}).roundName||"Tournoi");
  else p2.name="BOT "+DIFFS[botDiff].label.toUpperCase();
  p1.displayName=p1.name+" • "+p1.char.name;
  p2.displayName=p2.name+" • "+p2.char.name;
}

/* ---------------- ÉTAT GLOBAL ---------------- */
let state="menu",prevState="menu",mode="bot",pendingMode="bot",botDiff="moyen";
let selCharP1=PROFILE.selection.charP1||0, selCharP2=(PROFILE.selection.charP2==null?1:PROFILE.selection.charP2), selArenaId=PROFILE.selection.arena||"stadium";
let arcade={stage:1,seq:[],lastWin:false,total:5,circuit:"stade",circuitName:"Circuit Stade Godson"};
function arcadeTotal(){ return Math.max(1,arcade.total||(arcade.seq&&arcade.seq.length)||5); }
let story={step:1,total:STORY_CAMPAIGN.fights.length,lastWin:false};
let survival={wave:1,score:0,lastWaveScore:0,lastWin:false,next:null,carryHealth:null,carryEnergy:0,recorded:false,runCounted:false};
/* ---------------- TOURNOI LOCAL V7.1 : BRACKETS 4 / 8 / 16 ----------------
   Nadia : le Championnat reste une tournée linéaire ; le Tournoi est un vrai
   tableau à élimination directe. Le joueur dispute ses matchs en simulation
   normale, les autres affiches sont résolues par une formule déterministe
   fondée sur la graine du bracket et la cote des combattants. L'état est
   sauvegardé dans la carrière : quitter le jeu ne perd jamais un bracket. */
const TOURNAMENT_FORMATS={
  express:{id:"express",name:"Coupe Express",icon:"⚡",size:4,xp:220,coins:140,diffs:["facile","difficile"],arenas:["stadium","Libreville"],placementPoints:{1:160,2:90,3:40},desc:"4 combattants, 2 victoires pour soulever la coupe."},
  godson:{id:"godson",name:"Coupe Godson",icon:"🏆",size:8,xp:420,coins:260,diffs:["moyen","difficile","difficile"],arenas:["stadium","tokyo","temple"],placementPoints:{1:260,2:150,3:80,5:35},desc:"Le bracket signature : quarts, demis et grande finale."},
  legendes:{id:"legendes",name:"Coupe des Légendes",icon:"👑",size:16,xp:750,coins:480,diffs:["moyen","difficile","difficile","difficile"],arenas:["temple","tokyo","stadium","Libreville"],placementPoints:{1:420,2:240,3:130,5:70,9:30},desc:"16 entrants et quatre tours vers la couronne. GODSON PRIME veille."}
};
function tournamentFormat(id){ return TOURNAMENT_FORMATS[id]||TOURNAMENT_FORMATS.godson; }
function tournamentHash01(seed,salt){
  let h=((seed>>>0)^Math.imul(((salt|0)+0x9e3779b9),0x85ebca6b))>>>0;
  h=Math.imul(h^(h>>>13),0xc2b2ae35); h^=h>>>16; return (h>>>0)/4294967296;
}
function tournamentRating(charIndex){
  const c=CHARACTERS[clamp(charIndex,0,CHARACTERS.length-1)]||CHARACTERS[0];
  const rating=(c.hp||100)*.3+(c.power||1)*25+(c.speed||1)*15+(c.atkSpeed||1)*12+(c.energyGain||1)*10+(c.reach||1)*5;
  return Math.round(rating*10)/10;
}
function tournamentSeedOrder(size){
  let order=[1];
  while(order.length<size){ const total=order.length*2+1,next=[]; order.forEach(seed=>{ next.push(seed,total-seed); }); order=next; }
  return order.slice(0,size);
}
function tournamentRoundName(remaining){
  return remaining>=16?"Huitièmes de finale":remaining===8?"Quarts de finale":remaining===4?"Demi-finales":remaining===2?"Finale":"Tournoi";
}
function defaultTournamentState(){
  return {active:false,started:false,status:"idle",formatId:"godson",formatName:TOURNAMENT_FORMATS.godson.name,size:8,seed:0,playerChar:0,playerEntrant:-1,entrants:[],rounds:[],currentRound:0,currentMatch:-1,playerWins:0,champion:null,placement:"",placementRank:0,seasonPoints:0,seasonRecorded:false,lastResult:null,createdAt:0,updatedAt:0,completedAt:0};
}
function tournamentClone(value){ try{ return JSON.parse(JSON.stringify(value)); }catch(e){ return null; } }
function normalizeTournamentState(raw){
  if(!raw||typeof raw!=="object")return null;
  const fmt=TOURNAMENT_FORMATS[raw.formatId]; if(!fmt||!Array.isArray(raw.entrants)||raw.entrants.length!==fmt.size||!Array.isArray(raw.rounds)||!raw.rounds.length)return null;
  const t=tournamentClone(raw); if(!t)return null;
  t.formatName=fmt.name; t.size=fmt.size; t.seed=(+t.seed||0)>>>0; t.playerChar=clamp(Math.floor(+t.playerChar||0),0,CHARACTERS.length-1);
  t.currentRound=clamp(Math.floor(+t.currentRound||0),0,Math.max(0,t.rounds.length-1)); t.playerWins=Math.max(0,Math.floor(+t.playerWins||0));
  t.playerEntrant=t.entrants.findIndex(e=>e&&e.player); if(t.playerEntrant<0)return null;
  for(const e of t.entrants){ if(!e||!CHARACTERS[clamp(Math.floor(+e.char||0),0,CHARACTERS.length-1)])return null; e.char=clamp(Math.floor(+e.char||0),0,CHARACTERS.length-1); e.seed=Math.max(1,Math.floor(+e.seed||1)); e.rating=+e.rating||tournamentRating(e.char); e.player=!!e.player; }
  t.active=t.status==="preview"||t.status==="active"; t.started=!!t.started;
  return t;
}
function syncTournamentToProfile(){
  const c=careerData();
  if(tournament&&(tournament.status==="preview"||tournament.status==="active"))c.activeTournament=tournamentClone(tournament);
  else c.activeTournament=null;
  if(tournament&&tournament.status==="complete"&&tournament.seasonRecorded)seasonData().lastTournament=tournamentClone(tournament);
  return c.activeTournament;
}
function syncTournamentFromProfile(){
  const c=careerData(),s=seasonData();
  tournament=normalizeTournamentState(c.activeTournament)||normalizeTournamentState(s.lastTournament)||defaultTournamentState();
  tournamentPendingFormat=tournament.formatId||tournamentPendingFormat||"godson";
  return tournament;
}
function persistTournamentState(){ syncTournamentToProfile(); saveProfile(); return tournament; }
function tournamentEntrant(entry){ return typeof entry==="number"?(tournament&&tournament.entrants?tournament.entrants[entry]:null):entry; }
function tournamentEntrantLabel(entry){
  const e=tournamentEntrant(entry); if(!e)return "À déterminer";
  const c=CHARACTERS[e.char]||{}; return (e.player?"🟦 ":"")+(c.name||"Combattant")+" • Tête de série "+(e.seed||"—");
}
function setupTournamentRun(formatId,playerChar,seed){
  if(tournament&&tournament.started&&tournament.status==="active")return tournament;
  const fmt=tournamentFormat(formatId||tournamentPendingFormat||"godson"),chosen=clamp(playerChar==null?selCharP1:Math.floor(+playerChar||0),0,CHARACTERS.length-1),actualSeed=(seed==null?makeReplaySeed():(+seed>>>0));
  let candidates=CHARACTERS.map((c,i)=>i).filter(i=>i!==chosen);
  candidates.sort((a,b)=>tournamentHash01(actualSeed,a*97+13)-tournamentHash01(actualSeed,b*97+13)||a-b);
  let selected=candidates.slice(0,fmt.size-1);
  const ensureElite=pool=>{ const elite=pool.find(i=>i!==chosen&&!selected.includes(i)); if(elite!=null&&!selected.some(i=>pool.includes(i)))selected[selected.length-1]=elite; };
  if(fmt.id==="legendes")ensureElite([4]);
  if(fmt.id==="godson")ensureElite([4,36,34,21]);
  const ranked=[chosen,...selected].map(char=>({char,player:char===chosen,rating:tournamentRating(char)})).sort((a,b)=>b.rating-a.rating||a.char-b.char);
  ranked.forEach((e,i)=>{ e.seed=i+1; });
  const bySeed=new Map(ranked.map(e=>[e.seed,e])),entrants=tournamentSeedOrder(fmt.size).map(seedNo=>bySeed.get(seedNo));
  const rounds=[],roundCount=Math.round(Math.log2(fmt.size));
  for(let r=0;r<roundCount;r++){
    const remaining=fmt.size>>r,matches=[];
    for(let m=0;m<remaining/2;m++)matches.push({id:"R"+r+"M"+m,roundName:tournamentRoundName(remaining),a:r===0?m*2:null,b:r===0?m*2+1:null,winner:null,loser:null,score:[0,0],simulated:false,resultRecorded:false});
    rounds.push({name:tournamentRoundName(remaining),matches});
  }
  tournament={active:true,started:false,status:"preview",formatId:fmt.id,formatName:fmt.name,size:fmt.size,seed:actualSeed,playerChar:chosen,playerEntrant:entrants.findIndex(e=>e.player),entrants,rounds,currentRound:0,currentMatch:-1,playerWins:0,champion:null,placement:"",placementRank:0,seasonPoints:0,seasonRecorded:false,lastResult:null,createdAt:Date.now(),updatedAt:Date.now(),completedAt:0};
  tournamentPendingFormat=fmt.id;
  simulateTournamentRound(0,false);
  tournament.updatedAt=Date.now(); persistTournamentState();
  return tournament;
}
function ensureTournamentForSelection(){
  if(!tournament)syncTournamentFromProfile();
  if(tournament&&tournament.started&&tournament.status==="active"){ selCharP1=tournament.playerChar; return tournament; }
  if(!tournament||tournament.status==="idle"||tournament.status==="complete"||tournament.status==="abandoned"||tournament.formatId!==tournamentPendingFormat||tournament.playerChar!==selCharP1){
    const keepSeed=tournament&&tournament.status==="preview"?tournament.seed:null;
    return setupTournamentRun(tournamentPendingFormat,selCharP1,keepSeed);
  }
  return tournament;
}
function tournamentCurrentMatch(){
  if(!tournament||!tournament.rounds||tournament.status==="idle"||tournament.status==="abandoned")return null;
  const round=tournament.rounds[tournament.currentRound]; if(!round)return null;
  const index=round.matches.findIndex(m=>m&&m.winner==null&&(m.a===tournament.playerEntrant||m.b===tournament.playerEntrant));
  if(index<0)return null;
  tournament.currentMatch=index;
  return {...round.matches[index],roundIndex:tournament.currentRound,matchIndex:index,roundName:round.name};
}
function simulateTournamentMatch(roundIndex,matchIndex){
  if(!tournament||!tournament.rounds[roundIndex])return false;
  const match=tournament.rounds[roundIndex].matches[matchIndex]; if(!match||match.winner!=null||match.a==null||match.b==null)return false;
  const a=tournament.entrants[match.a],b=tournament.entrants[match.b]; if(!a||!b)return false;
  const pA=1/(1+Math.pow(10,-((a.rating||0)-(b.rating||0))/18)),roll=tournamentHash01(tournament.seed,1009+roundIndex*131+matchIndex*17+match.a*7+match.b*3);
  const aWins=roll<pA,target=clamp(Math.floor(+SETTINGS.roundsWin||2),1,3),loserRoll=tournamentHash01(tournament.seed,7919+roundIndex*197+matchIndex*29+match.a*11+match.b*5);
  const loserScore=target===1?0:(loserRoll<.42?target-1:loserRoll<.72&&target>2?1:0);
  match.winner=aWins?match.a:match.b; match.loser=aWins?match.b:match.a;
  match.score=aWins?[target,loserScore]:[loserScore,target]; match.simulated=true; match.resultRecorded=true;
  return true;
}
function simulateTournamentRound(roundIndex,includePlayer){
  if(!tournament||!tournament.rounds[roundIndex])return false;
  let changed=false;
  tournament.rounds[roundIndex].matches.forEach((match,i)=>{ if(includePlayer||!(match.a===tournament.playerEntrant||match.b===tournament.playerEntrant))changed=simulateTournamentMatch(roundIndex,i)||changed; });
  return changed;
}
function advanceTournamentRoundIfReady(roundIndex){
  if(!tournament||roundIndex>=tournament.rounds.length-1)return false;
  const round=tournament.rounds[roundIndex],next=tournament.rounds[roundIndex+1];
  if(!round||!next||round.matches.some(m=>m.winner==null))return false;
  next.matches.forEach((match,i)=>{ match.a=round.matches[i*2].winner; match.b=round.matches[i*2+1].winner; });
  if(tournament.currentRound===roundIndex)tournament.currentRound=roundIndex+1;
  return true;
}
function tournamentChampionEntrant(){
  if(!tournament||!tournament.rounds.length)return null;
  const final=tournament.rounds[tournament.rounds.length-1].matches[0];
  return final&&final.winner!=null?final.winner:null;
}
function simulateTournamentToEnd(){
  if(!tournament)return false;
  for(let guard=0;guard<12;guard++){
    if(tournamentChampionEntrant()!=null)break;
    const r=tournament.currentRound;
    simulateTournamentRound(r,false);
    if(r>=tournament.rounds.length-1)break;
    if(!advanceTournamentRoundIfReady(r))break;
  }
  const champ=tournamentChampionEntrant(); if(champ!=null)tournament.champion=champ;
  return champ!=null;
}
function tournamentPlacementForLoss(roundIndex){
  const remaining=((tournament&&tournament.size)||8)>>Math.max(0,roundIndex||0);
  if(remaining<=2)return {rank:2,label:"Finaliste"};
  if(remaining===4)return {rank:3,label:"Demi-finaliste"};
  if(remaining===8)return {rank:5,label:"Quart de finaliste"};
  return {rank:9,label:"Huitième de finaliste"};
}
function recordTournamentCompletion(){
  if(!tournament||tournament.seasonRecorded)return tournament?tournament.seasonPoints||0:0;
  const fmt=tournamentFormat(tournament.formatId),s=seasonData();
  const base=(fmt.placementPoints&&fmt.placementPoints[tournament.placementRank])||0,points=base+(tournament.playerWins||0)*10;
  tournament.seasonPoints=points; tournament.seasonRecorded=true; tournament.status="complete"; tournament.active=false; tournament.completedAt=Date.now(); tournament.updatedAt=tournament.completedAt;
  awardSeasonPoints(points);
  s.tournaments=(s.tournaments||0)+1; s.matchWins=(s.matchWins||0)+(tournament.playerWins||0);
  if(tournament.placementRank===1)s.titles[fmt.id]=(s.titles[fmt.id]||0)+1;
  if(!s.bestPlacementRank||tournament.placementRank<s.bestPlacementRank){ s.bestPlacementRank=tournament.placementRank; s.bestPlacement=tournament.placement; }
  const champ=tournament.entrants[tournament.champion];
  s.history.unshift({date:tournament.completedAt,formatId:fmt.id,formatName:fmt.name,playerChar:tournament.playerChar,championChar:champ?champ.char:null,placement:tournament.placement,placementRank:tournament.placementRank,wins:tournament.playerWins||0,points});
  s.history=s.history.slice(0,12);
  s.lastTournament=tournamentClone(tournament);
  careerData().activeTournament=null;
  if(typeof unlock==="function"){
    unlock("tournament-first","Premier tournoi terminé");
    if(tournament.placementRank===1)unlock("tournament-"+fmt.id,"Champion — "+fmt.name);
  }
  return points;
}
function completeTournamentPlayerMatch(winner){
  if(!tournament||replayPlayback.active||(winner!==p1&&winner!==p2))return false;
  if(tournament.status!=="active"&&tournament.status!=="preview")return false;
  const current=tournamentCurrentMatch(); if(!current)return false;
  const match=tournament.rounds[current.roundIndex].matches[current.matchIndex]; if(!match||match.winner!=null)return false;
  const playerWon=winner===p1,opponentEntrant=match.a===tournament.playerEntrant?match.b:match.a,target=clamp(Math.floor(+SETTINGS.roundsWin||2),1,3);
  const playerScore=Math.max(playerWon?target:0,p1.roundWins||0),oppScore=Math.max(playerWon?0:target,p2.roundWins||0);
  match.winner=playerWon?tournament.playerEntrant:opponentEntrant; match.loser=playerWon?opponentEntrant:tournament.playerEntrant;
  match.score=match.a===tournament.playerEntrant?[playerScore,oppScore]:[oppScore,playerScore]; match.simulated=false; match.resultRecorded=true;
  if(playerWon)tournament.playerWins=(tournament.playerWins||0)+1;
  const isFinal=current.roundIndex>=tournament.rounds.length-1;
  simulateTournamentRound(current.roundIndex,false);
  if(playerWon&&isFinal){
    tournament.champion=tournament.playerEntrant; tournament.placementRank=1; tournament.placement="Champion";
  }else if(playerWon){
    advanceTournamentRoundIfReady(current.roundIndex);
    simulateTournamentRound(tournament.currentRound,false);
  }else{
    const placement=tournamentPlacementForLoss(current.roundIndex); tournament.placementRank=placement.rank; tournament.placement=placement.label;
    simulateTournamentToEnd();
  }
  const complete=playerWon?isFinal:tournamentChampionEntrant()!=null;
  let points=0; if(complete)points=recordTournamentCompletion();
  tournament.lastResult={roundIndex:current.roundIndex,matchIndex:current.matchIndex,roundName:current.roundName,win:playerWon,complete:!!complete,champion:tournament.champion,placement:tournament.placement,placementRank:tournament.placementRank,seasonPoints:points,opponent:opponentEntrant};
  if(complete&&seasonData().lastTournament)seasonData().lastTournament.lastResult=tournamentClone(tournament.lastResult);
  tournament.updatedAt=Date.now(); persistTournamentState();
  return true;
}
function tournamentCurrentOpponent(){
  const current=tournamentCurrentMatch(); if(!current)return null;
  const fmt=tournamentFormat(tournament.formatId),oppIndex=current.a===tournament.playerEntrant?current.b:current.a,opp=tournament.entrants[oppIndex];
  if(!opp)return null;
  return {char:opp.char,entrant:oppIndex,diff:fmt.diffs[current.roundIndex]||"difficile",arena:fmt.arenas[current.roundIndex%fmt.arenas.length]||currentArena.id,roundName:current.roundName,roundIndex:current.roundIndex,matchIndex:current.matchIndex,seed:opp.seed,rating:opp.rating};
}
function tournamentForReplay(){
  if(!tournament||!(tournament.status==="active"||tournament.status==="preview"))return null;
  const current=tournamentCurrentMatch();
  return {formatId:tournament.formatId,seed:tournament.seed,roundIndex:current?current.roundIndex:tournament.currentRound,roundName:current?current.roundName:"",matchIndex:current?current.matchIndex:-1,playerChar:tournament.playerChar};
}
function abandonTournament(){
  if(!tournament||!(tournament.status==="preview"||tournament.status==="active"))return false;
  tournament.status="abandoned"; tournament.active=false; tournament.updatedAt=Date.now(); careerData().activeTournament=null; persistTournamentState();
  return true;
}
syncTournamentFromProfile();

/* V6.1 — 2v2 RELAIS : chaque joueur engage DEUX combattants. Le perdant
   d'une manche est éliminé et son partenaire entre immédiatement ; la
   première équipe à éliminer les deux adversaires gagne. Le format reste
   déterministe et compatible lockstep/replay : les deux téléphones
   appliquent la même relève à partir des mêmes équipes négociées. */
let teamMatch={active:false,format:"duel",p1:{chars:[],index:0},p2:{chars:[],index:0}};
function sanitizeTeamChars(list,fallback){
  const out=[];
  const push=v=>{ const idx=clamp(parseInt(v,10)||0,0,CHARACTERS.length-1); if(!out.includes(idx))out.push(idx); };
  if(Array.isArray(list))list.forEach(push);
  if(!out.length)push(fallback||0);
  let extra=(out[0]+1)%CHARACTERS.length;
  while(out.length<2){ push(extra); extra=(extra+1)%CHARACTERS.length; }
  return out.slice(0,2);
}
function clearTeamMatch(){ teamMatch={active:false,format:"duel",p1:{chars:[],index:0},p2:{chars:[],index:0}}; return teamMatch; }
function configureTeamMatch(source){
  if(!source){ return clearTeamMatch(); }
  const p1List=source.hostTeam||source.p1Team||(source.teams&&source.teams.p1)||(source.team&&source.team.p1)||source.p1;
  const p2List=source.guestTeam||source.p2Team||(source.teams&&source.teams.p2)||(source.team&&source.team.p2)||source.p2;
  const explicitFormat=source.format||source.mode;
  const wantsTeam=explicitFormat?explicitFormat==="team2v2":(source.team2v2===true||(Array.isArray(p1List)&&Array.isArray(p2List)));
  if(!wantsTeam)return clearTeamMatch();
  teamMatch={active:true,format:"team2v2",
    p1:{chars:sanitizeTeamChars(p1List,source.hostChar||0),index:0},
    p2:{chars:sanitizeTeamChars(p2List,source.guestChar==null?1:source.guestChar),index:0}};
  return teamMatch;
}
function teamMatchForReplay(){ return teamMatch.active?{p1:[...teamMatch.p1.chars],p2:[...teamMatch.p2.chars]}:null; }
function teamScoreLabel(){ return teamMatch.active?("ÉQUIPES "+p1.roundWins+"–"+p2.roundWins+" • Remplaçants : "+(CHARACTERS[teamMatch.p1.chars[1]]||{}).name+" / "+(CHARACTERS[teamMatch.p2.chars[1]]||{}).name):""; }
function prepareTeamRelayNext(winner){
  if(!teamMatch.active||!winner)return false;
  const loser=winner===p1?p2:p1,side=loser===p1?"p1":"p2",team=teamMatch[side];
  if(!team||team.index>=team.chars.length-1)return false;
  team.index++;
  applyCharacterTo(loser,team.chars[team.index]);
  if(mode==="online"&&typeof applyOnlineIdentity==="function"&&typeof onlineSession!=="undefined"&&onlineSession&&onlineSession.config){
    const cfg=onlineSession.config;
    applyOnlineIdentity(loser,side==="p1"?cfg.hostInitial:cfg.guestInitial,side==="p1"?cfg.hostSkin:cfg.guestSkin);
  }
  buildDisplayNames();
  const nameEl=$(side==="p1"?"nameP1":"nameP2");
  if(nameEl)nameEl.innerHTML=(side==="p1"?"🟦 ":(mode==="online"?"🌐 ":"🟥 "))+escapeHTML(loser.displayName);
  return true;
}
function roundsToWin(){ return teamMatch.active?2:mode==="survival"?1:SETTINGS.roundsWin; }
function fighterMatchScore(f,op){ return Math.max(0,Math.round(f.stats.damage+f.stats.maxComboDamage*4+(f.health/f.maxHealth)*120+f.roundWins*90-op.stats.damage*.35)); }
let dummyMode="immobile";
let round=1,timerSec=99,timerFrames=0,matchElapsed=0,simFrame=0,timeGlobal=0;
let introT=0,roundEndT=0,announcedFight=false,announceT=0,lastWinner=null,lastFinishType="";
let shake=0,crowdExcite=0,cinematic=0;
let particles=[],projectiles=[],floaters=[],rings=[],ghosts=[],impactBursts=[];
const playerHabits={jumps:0,blocks:0,dashes:0};
function isCombat(){ return state==="fight"||state==="training"; }
function placeMenuFighters(){ p1.x=p1.px=p1.rx=390; p2.x=p2.px=p2.rx=890; p1.y=p1.py=p1.ry=GROUND; p2.y=p2.py=p2.ry=GROUND; p1.facing=1; p2.facing=-1; }

/* ---------------- DUELS EN LIGNE : LOCKSTEP DÉTERMINISTE Godson FURY ----------------
   On échange uniquement les entrées finales (8 bits/frame), jamais les
   positions : mêmes entrées + même état initial = même match des deux côtés.
   Un délai d'entrée court pipelinise les frames ; des hashs périodiques
   détectent toute désynchronisation avant qu'elle ne corrompe un replay. */
const ONLINE_INPUT_DELAY_DEFAULT=6,ONLINE_MAX_AHEAD=18;
let onlineTransportSend=null;
let onlineSession={active:false,started:false,ended:false,desync:false,desyncNotified:false,disconnected:false,localSide:1,frame:0,nextInputFrame:0,delay:ONLINE_INPUT_DELAY_DEFAULT,localInputs:new Map(),remoteInputs:new Map(),localChecks:new Map(),remoteChecks:new Map(),sentChecks:new Set(),config:null,restoreSettings:null,lastStallFrame:-1,stalls:0,checksumMismatches:0};
const onlineInputP1={left:false,right:false,jump:false,block:false,punch:false,kick:false,special:false,dash:false};
const onlineInputP2={left:false,right:false,jump:false,block:false,punch:false,kick:false,special:false,dash:false};
function resetOnlineSession(config,localSide){
  const delay=clamp((config&&config.inputDelay)||ONLINE_INPUT_DELAY_DEFAULT,3,12);
  onlineSession={active:true,started:true,ended:false,desync:false,desyncNotified:false,disconnected:false,localSide:localSide===2?2:1,frame:0,nextInputFrame:delay,delay,localInputs:new Map(),remoteInputs:new Map(),localChecks:new Map(),remoteChecks:new Map(),sentChecks:new Set(),config:config||null,restoreSettings:{roundTime:SETTINGS.roundTime,roundsWin:SETTINGS.roundsWin},lastStallFrame:-1,stalls:0,checksumMismatches:0};
  for(let f=0;f<delay;f++){ onlineSession.localInputs.set(f,0); onlineSession.remoteInputs.set(f,0); }
  return onlineSession;
}
function stopOnlineSession(reason){
  if(!onlineSession)return;
  onlineSession.active=false; onlineSession.started=false; onlineSession.ended=true;
  if(reason==="disconnect")onlineSession.disconnected=true;
  if(onlineSession.restoreSettings){ SETTINGS.roundTime=onlineSession.restoreSettings.roundTime; SETTINGS.roundsWin=onlineSession.restoreSettings.roundsWin; }
}
function onlineSend(msg){
  try{ if(typeof onlineTransportSend==="function")return onlineTransportSend(msg); }catch(e){}
  return false;
}
function receiveOnlineNetMessage(msg){
  if(!msg||typeof msg!=="object")return false;
  if(msg.t==="input"){
    const f=msg.f|0,b=(msg.b|0)&255;
    if(f>=0)onlineSession.remoteInputs.set(f,b);
    return true;
  }
  if(msg.t==="inputs"&&Array.isArray(msg.items)){
    msg.items.forEach(it=>{ if(it&&it.f>=0)onlineSession.remoteInputs.set(it.f|0,(it.b|0)&255); });
    return true;
  }
  if(msg.t==="check"){
    const f=msg.f|0,h=String(msg.h||"");
    if(f>=0&&h)onlineSession.remoteChecks.set(f,h);
    return true;
  }
  if(msg.t==="bye"){ onlineSession.disconnected=true; return true; }
  return false;
}
function flagOnlineDesync(frame){
  onlineSession.desync=true; onlineSession.checksumMismatches++;
  if(!onlineSession.desyncNotified){ onlineSession.desyncNotified=true; if(typeof onOnlineDesync==="function")onOnlineDesync(frame); }
}
function prepareOnlineFrame(){
  if(!onlineSession.active||replayPlayback.active||mode!=="online")return {ready:true};
  if(onlineSession.desync)return {ready:false,desync:true};
  const frame=onlineSession.frame;
  if(frame>0&&frame%300===0){
    if(!onlineSession.localChecks.has(frame))onlineSession.localChecks.set(frame,replayStateHash());
    if(!onlineSession.sentChecks.has(frame)){ onlineSession.sentChecks.add(frame); onlineSend({t:"check",f:frame,h:onlineSession.localChecks.get(frame)}); }
  }
  // Le hash distant peut arriver après la frame exacte : on compare dès que
  // les deux empreintes sont disponibles, puis on libère la paire vérifiée.
  for(const [checkFrame,localHash] of onlineSession.localChecks){
    const remoteHash=onlineSession.remoteChecks.get(checkFrame);
    if(!remoteHash)continue;
    if(remoteHash!==localHash){ flagOnlineDesync(checkFrame); return {ready:false,desync:true}; }
    onlineSession.localChecks.delete(checkFrame); onlineSession.remoteChecks.delete(checkFrame); onlineSession.sentChecks.delete(checkFrame);
  }
  const cap=frame+ONLINE_MAX_AHEAD;
  if(onlineSession.nextInputFrame<=cap){
    const bits=encodeReplayInput(getInputP1());
    onlineSession.localInputs.set(onlineSession.nextInputFrame,bits);
    onlineSend({t:"input",f:onlineSession.nextInputFrame,b:bits});
    onlineSession.nextInputFrame++;
  }
  if(!onlineSession.localInputs.has(frame)||!onlineSession.remoteInputs.has(frame)){
    if(onlineSession.lastStallFrame!==frame){ onlineSession.lastStallFrame=frame; onlineSession.stalls++; }
    return {ready:false};
  }
  const localBits=onlineSession.localInputs.get(frame),remoteBits=onlineSession.remoteInputs.get(frame);
  onlineSession.localInputs.delete(frame); onlineSession.remoteInputs.delete(frame);
  const p1Bits=onlineSession.localSide===1?localBits:remoteBits,p2Bits=onlineSession.localSide===1?remoteBits:localBits;
  return {ready:true,p1:decodeReplayInput(p1Bits,onlineInputP1),p2:decodeReplayInput(p2Bits,onlineInputP2)};
}

/* ---------------- EFFETS (pool limité selon qualité) ---------------- */
function pushParticle(p){ if(particles.length>=particleCap())particles.splice(0,particles.length-particleCap()+1); particles.push(p); }
function spark(x,y,color,n,pow){ n=Math.max(1,Math.round(n*particleMul())); for(let i=0;i<n;i++){ const a=Math.random()*6.28,s=(.5+Math.random())*(pow||4); pushParticle({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,life:16+Math.random()*16,max:32,r:1.8+Math.random()*3.2,c:color,grav:.12}); } }
function dust(x,y,n){ n=Math.max(1,Math.round(n*particleMul())); for(let i=0;i<n;i++)pushParticle({x:x+(Math.random()-.5)*38,y:y-2,vx:(Math.random()-.5)*2.5,vy:-Math.random()*1.4,life:20+Math.random()*18,max:38,r:3.6+Math.random()*6.5,c:"rgba(214,205,195,.5)",grav:-.012}); }
function ring(x,y,c){ if(rings.length<24)rings.push({x,y,r:8,life:15,c}); }
/* V5.3 (Kenzo) : événements d'impact typés, convertis en sprites par le rendu.
   Strictement visuel : aucun impact sprite n'entre dans replayStateHash(). */
function impactBurst(x,y,kind,color,power,dir){
  if(impactBursts.length>=18)impactBursts.shift();
  const p=clamp(power||1,.55,1.9),life=Math.round((kind==="m1final"?19:kind==="ground"?15:13)+p*3);
  const burst={x,y,kind:kind||"light",color:color||"#fff59d",power:p,dir:dir||1,life,max:life,seed:(((simFrame*37+Math.round(x)*3+Math.round(y))%997)+997)%997/997};
  impactBursts.push(burst); return burst;
}
function floater(x,y,text,c,big){ if(floaters.length>14)floaters.shift(); floaters.push({x,y,text,c:c||"#fff",life:52,vy:-1.1,big:!!big}); }
function confetti(){ const n=Math.round(120*particleMul()); for(let i=0;i<n;i++)pushParticle({x:Math.random()*W,y:-10-Math.random()*170,vx:(Math.random()-.5)*2,vy:1.4+Math.random()*2.6,life:125+Math.random()*90,max:215,r:2.8+Math.random()*4,c:["#ffc400","#ff2e88","#00a2ff","#00e676","#fff"][(Math.random()*5)|0],grav:.014,rect:true,rot:Math.random()*6}); }
function firework(x,y){ const c=["#ffc400","#ff2e88","#00e5ff","#69f0ae"][(Math.random()*4)|0]; spark(x,y,c,34,5.5); ring(x,y,c); }
function addGhost(f){ if(ghosts.length>36)ghosts.shift(); ghosts.push({x:f.x,y:f.y,facing:f.facing,scale:f.char.scale,bulk:f.char.bulk,c:f.skin.primary,accent:f.skin.trail,life:15,max:15,crouch:f.crouching,vx:(f.vx||0)+(f.kvx||0),vy:f.vy||0,dashDir:f.dashDir||f.facing}); }

/* ---------------- SUCCÈS / TOAST ---------------- */
let toastTimer=null;
function showToast(text){ const t=$("toast"); if(!t)return; t.textContent=text; t.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove("show"),3400); }
function unlock(id,label){ if(replayPlayback.active||PROFILE.ach[id])return; PROFILE.ach[id]=true; saveProfile(); showToast("🏆 Succès débloqué : "+label); SFX.achieve(); }

/* ---------------- ENTRÉES : clavier, tactile, manettes ---------------- */
const keys=new Set();
const touchIn={left:false,right:false,jump:false,block:false,punch:false,kick:false,special:false,dash:false};
let touchEnabled=false;
window.addEventListener("keydown",e=>{
  if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Space"].includes(e.code))e.preventDefault();
  if(e.target&&(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)))return;
  if(state==="vs"&&(e.code==="Enter"||e.code==="Space")){ if(typeof skipVS==="function")skipVS(); return; }
  if(e.code==="KeyP"||e.code==="Escape"){ if(typeof togglePause==="function")togglePause(); return; }
  keys.add(e.code);
});
window.addEventListener("keyup",e=>keys.delete(e.code));
window.addEventListener("blur",()=>keys.clear());
document.addEventListener("visibilitychange",()=>{ if(document.hidden&&(state==="fight"||state==="intro")&&typeof togglePause==="function"&&state!=="pause")togglePause(); });
const INPUT_P1={left:false,right:false,jump:false,block:false,punch:false,kick:false,special:false,dash:false};
const INPUT_P2={left:false,right:false,jump:false,block:false,punch:false,kick:false,special:false,dash:false};
const INPUT_BLANK={left:false,right:false,jump:false,block:false,punch:false,kick:false,special:false,dash:false};
function gpMerge(target,idx){
  try{ const gps=navigator.getGamepads?navigator.getGamepads():[]; const g=gps&&gps[idx]; if(!g)return;
    const ax=g.axes[0]||0,ay=g.axes[1]||0,b=i=>!!(g.buttons[i]&&g.buttons[i].pressed);
    if(ax<-.4||b(14))target.left=true; if(ax>.4||b(15))target.right=true;
    if(b(0)||b(12))target.jump=true; if(ay>.55||b(13)||b(4))target.block=true;
    if(b(2))target.punch=true; if(b(3))target.kick=true; if(b(1))target.special=true; if(b(5))target.dash=true;
  }catch(e){}
}
function getInputP1(){
  const t=INPUT_P1;
  t.left=keys.has("KeyA")||touchIn.left; t.right=keys.has("KeyD")||touchIn.right;
  t.jump=keys.has("KeyW")||touchIn.jump; t.block=keys.has("KeyS")||touchIn.block;
  t.punch=keys.has("KeyF")||touchIn.punch; t.kick=keys.has("KeyG")||touchIn.kick;
  t.special=keys.has("KeyH")||keys.has("KeyR")||touchIn.special;
  t.dash=keys.has("ShiftLeft")||touchIn.dash;
  gpMerge(t,0); return t;
}
function getInputP2(){
  const t=INPUT_P2;
  t.left=keys.has("ArrowLeft"); t.right=keys.has("ArrowRight"); t.jump=keys.has("ArrowUp"); t.block=keys.has("ArrowDown");
  t.punch=keys.has("KeyK")||keys.has("Numpad1"); t.kick=keys.has("KeyL")||keys.has("Numpad2");
  t.special=keys.has("Semicolon")||keys.has("KeyM")||keys.has("Numpad3");
  t.dash=keys.has("ShiftRight")||keys.has("KeyO")||keys.has("Numpad0");
  gpMerge(t,1); return t;
}
const pressed=(f,inp,k)=>!!inp[k]&&!f.prev[k];

/* ---------------- IA / BOT PRO ---------------- */
const bot={input:{left:false,right:false,jump:false,block:false,punch:false,kick:false,special:false,dash:false},move:0,timer:0,blockT:0,downT:0,press:{},queue:[],lastFollowId:-1,lastParryFollow:-999};
function botPress(key){ bot.press[key]=2; }
function botAction(a){
  if(a==="uppercut"){ bot.downT=Math.max(bot.downT,4); botPress("punch"); }
  else if(a==="sweep"){ bot.downT=Math.max(bot.downT,4); botPress("kick"); }
  else if(a==="dashIn"){ bot.move=Math.sign(p1.x-p2.x)||1; botPress("dash"); }
  else if(a==="throw"){ botPress("punch"); botPress("kick"); }
  else if(a==="exspecial"){ botPress("special"); botPress("punch"); }
  else botPress(a);
}
function botQueue(a,delay){ bot.queue.push({a,t:delay||0}); }
function currentDiff(){ return DIFFS[(mode==="training")?"moyen":botDiff]||DIFFS.moyen; }
function updateBot(){
  const inp=bot.input,D=currentDiff(),me=p2,op=p1;
  for(const k in inp)inp[k]=false;
  for(const k in bot.press){ if(bot.press[k]>0){ bot.press[k]--; inp[k]=bot.press[k]>0; } }
  if(bot.queue.length){ const q=bot.queue[0]; if(q.t>0)q.t--; else { bot.queue.shift(); botAction(q.a); } }
  if(bot.downT>0){ bot.downT--; inp.block=true; }
  if(bot.blockT>0){ bot.blockT--; inp.block=true; inp.left=inp.right=false; return; }
  inp.left=bot.move<0; inp.right=bot.move>0;
  if(!isCombat()||me.dead)return;
  // Riposte immédiate après un parry réussi
  if(me.counterWindowT>8&&simFrame-bot.lastParryFollow>20){ bot.lastParryFollow=simFrame; bot.blockT=0; bot.move=0; botPress(Math.random()<.55?"punch":"kick"); return; }
  // Enchaînement automatique après un coup confirmé (vrais combos du bot)
  if(me.hitConfirmed&&me.attack&&bot.lastFollowId!==me.attackId&&Math.random()<D.combo){
    bot.lastFollowId=me.attackId;
    const wait=Math.max(2,(me.attack.end-(me.attackDur-me.attackT))+2);
    if(botDiff==="difficile"&&me.energy>=25&&me.godsonCancelReady&&Math.random()<.24){ botQueue("dash",wait); botQueue("punch",wait+11); }
    else if(me.attack&&me.attack.m1&&!me.attack.m1Final)botQueue("punch",wait); // M1 Signature : le bot martèle Poing pour poursuivre SA chaîne
    else if(me.attack&&me.attack.m1Final&&me.energy>=50)botQueue("special",wait);
    else if(me.attackType==="punch")botQueue(Math.random()<.65?"kick":"uppercut",wait);
    else if(me.attackType==="kick"&&me.energy>=50)botQueue("special",wait);
    else if(me.attackType==="uppercut"&&botDiff==="difficile"){ botQueue("jump",wait+1); botQueue("kick",wait+13); }
  }
  bot.timer--; if(bot.timer>0)return;
  bot.timer=D.react+((Math.random()*6)|0);
  const dx=op.x-me.x,ad=Math.abs(dx),dir=Math.sign(dx)||1;
  if(Math.random()<D.mistake){ bot.move=[-1,0,1][(Math.random()*3)|0]; return; }
  const projThreat=projectiles.some(pr=>pr.owner!==me&&Math.sign(pr.vx)===Math.sign(me.x-pr.x)&&Math.abs(pr.x-me.x)<250);
  if(((op.attackT>0&&ad<180)||projThreat)&&Math.random()<D.block+.07){
    if(projThreat&&Math.random()<D.dash*.6){ bot.move=dir; botPress("dash"); }
    else if(Math.random()<(D.parry||0)){ bot.blockT=3; bot.move=0; } // garde tapée au dernier moment = tentative de parry
    else { bot.blockT=9+((Math.random()*10)|0); bot.move=0; }
    return;
  }
  if(!op.grounded&&ad<175&&op.vy>-2&&Math.random()<D.block+.22){ botAction("uppercut"); bot.move=0; return; } // anti-aérien
  if(me.energy>=50&&ad>265&&Math.random()<D.spec){ if(me.energy>=75&&me.energy<100&&Math.random()<.48)botAction("exspecial"); else botPress("special"); bot.move=0; return; }
  if(ad>430){ bot.move=dir; if(Math.random()<D.dash)botPress("dash"); else if(Math.random()<D.jump)botPress("jump"); return; }
  if(ad>235){ bot.move=dir; if(Math.random()<D.jump)botPress("jump"); return; }
  if(ad>128){ bot.move=Math.random()<D.agg?dir:0; if(ad<152&&Math.random()<.4)botPress("kick"); return; }
  bot.move=0; const r=Math.random();
  if(op.blocking&&ad<102&&Math.random()<.36){ botAction("throw"); return; }
  if(op.blocking&&Math.random()<.45){ botAction("sweep"); return; }
  if(r<D.agg){
    const pick=Math.random();
    if(pick<.5)botPress("punch"); else if(pick<.78)botPress("kick"); else if(pick<.9)botAction("uppercut"); else botAction("sweep");
  } else if(r<D.agg+.14)bot.move=-dir; else bot.blockT=8;
}
const dummyInput={left:false,right:false,jump:false,block:false,punch:false,kick:false,special:false,dash:false};
function getDummyInput(){
  for(const k in dummyInput)dummyInput[k]=false;
  if(dummyMode==="garde")dummyInput.block=true;
  else if(dummyMode==="saut")dummyInput.jump=(simFrame%55<3);
  else if(dummyMode==="combat"){ updateBot(); return bot.input; }
  return dummyInput;
}

/* ---------------- MOTEUR DE COMBAT ---------------- */
function desiredAttack(f,inp){
  if(f.grounded&&pressed(f,inp,"punch")&&pressed(f,inp,"kick"))return "throw";
  if(pressed(f,inp,"special")&&pressed(f,inp,"punch"))return "exspecial";
  if(pressed(f,inp,"special"))return "special";
  if(pressed(f,inp,"punch"))return !f.grounded?"airPunch":(inp.block?"uppercut":(m1Enabled()?"m1":"punch"));
  if(pressed(f,inp,"kick"))return !f.grounded?"airKick":(inp.block?"sweep":"kick");
  return null;
}
function startAttack(f,type){
  if(type==="m1")return startM1Attack(f);
  if(f.dead||f.downT>0)return false;
  let atkType=type; f.attackEx=false;
  if(type==="exspecial"){
    if(f.energy<75){ floater(f.x,f.y-190,"ÉNERGIE 75% REQUISE POUR L’EX","#ffd54f"); return false; }
    f.energy-=75; f.attackEx=true; f.stats.ex=(f.stats.ex||0)+1;
  } else if(type==="special"){
    if(f.energy<50){ floater(f.x,f.y-190,"ÉNERGIE 50% REQUISE","#bfe7ff"); return false; }
    atkType=f.energy>=100?"super":"special";
    f.energy-=atkType==="super"?100:50;
  }
  const base=ATTACKS[atkType]; if(!base)return false;
  const sp=f.char.atkSpeed;
  f.attack={...base,dur:Math.max(8,Math.round(base.dur/sp)),start:Math.round(base.start/sp),end:Math.round(base.end/sp)};
  if(f.dashT>0&&f.attack.range)f.attack.dmg=Math.max(1,Math.round(f.attack.dmg*1.1)); // élan de dash-in
  f.attackType=atkType; f.attackDur=f.attackT=f.attack.dur; f.attackId++; f.hasHit=false; f.hitConfirmed=false; f.spawned=!(atkType==="special"||atkType==="super"||atkType==="exspecial");
  f.stats.attacks++;
  if(f.grounded&&(atkType==="kick"||atkType==="uppercut"))f.vx+=f.facing*1.3;
  if(f.grounded&&atkType==="punch")f.vx+=f.facing*.55;
  if(f.grounded&&atkType==="sweep")f.vx+=f.facing*.8;
  if(atkType==="throw"){ f.throwDir=f.inputDir===-f.facing?-f.facing:f.facing; f.attack.throwDir=f.throwDir; f.vx+=f.facing*1.7; }
  if(atkType==="punch"||atkType==="airPunch"||atkType==="throw")SFX.punch(); else if(atkType!=="special"&&atkType!=="super"&&atkType!=="exspecial")SFX.kick();
  if(!f.attack.m1)resetM1Chain(f); // toute technique manuelle remplace la chaîne en cours
  return true;
}
function startM1Attack(f){
  if(f.dead||f.downT>0)return false;
  if(!f.grounded)return startAttack(f,"airPunch");
  const sig=m1SignatureFor(f);
  let idx=f.m1ChainT>0?clamp(f.m1Next||0,0,sig.steps.length-1):0;
  const step=sig.steps[idx];
  if(!startAttack(f,step.type))return false;
  const atk=f.attack; if(!atk)return false;
  atk.dur=Math.max(8,Math.round(atk.dur*step.durMul));
  atk.start=Math.max(2,Math.round(atk.start*Math.min(1,step.durMul*.94)));
  atk.end=Math.max(atk.start+1,Math.round(atk.end*step.durMul));
  f.attackDur=f.attackT=atk.dur;
  atk.dmg=Math.max(1,Math.round(atk.dmg*step.dmgMul));
  atk.range=(atk.range||0)+step.rangeAdd;
  atk.hitstun=(atk.hitstun||11)+step.hitstunAdd;
  atk.blockstun=(atk.blockstun||6)+(step.final?2:1);
  atk.knock=Math.max(1.2,(atk.knock||4)+step.knockAdd);
  atk.energy=Math.max(3,Math.round((atk.energy||6)*(step.final?1.05:.82)));
  atk.low=step.type==="sweep";
  if(!step.final){ atk.launcher=0; atk.knockdown=false; }
  else {
    atk.hard=true;
    if(step.finalKind==="launch"&&!atk.launcher)atk.launcher=9.5;
    if(step.finalKind==="down")atk.knockdown=true;
  }
  atk.m1=true; atk.m1Step=idx; atk.m1Final=!!step.final; atk.m1Name=sig.name; atk.m1Label=step.label; atk.m1Fx=sig.fx; atk.m1Pattern=sig.pattern; atk.m1Advance=step.advance;
  atk.label="M1 "+(idx+1)+"/"+sig.steps.length+" — "+step.label;
  f.m1Step=idx; f.m1Next=(idx+1)%sig.steps.length; f.m1ChainT=step.final?26:58;
  f.vx+=f.facing*step.advance;
  if(idx===0)f.stats.m1Chains=(f.stats.m1Chains||0)+1;
  return true;
}
function abilitySpecs(f,isSuper,isEx){
  // Spéciaux, EX et Supers UNIQUES par personnage — chaque spec décrit un projectile.
  const dir=f.facing,op=f===p1?p2:p1,baseY=f.y-112*f.char.scale;
  const S=(o)=>Object.assign({x:f.x+dir*52,y:baseY,vx:dir*8.7,vy:0,r:18,dmg:isSuper?23:(isEx?17:14),kind:"bolt",grav:0,life:175,pierce:false,homing:0,ex:!!isEx},o||{});
  let specs;
  switch(f.char.id){
    case "kira": case "zed": case "aerin": case "selenia": case "nyx-ombre": case "velen":
      specs=isSuper
        ?[-2,-1,0,1,2].map(i=>S({y:baseY+i*17,vx:dir*11.2,vy:i*.72,r:13,dmg:7,kind:"blade"}))
        :isEx?[-1.5,-.5,.5,1.5].map(i=>S({y:baseY+i*14,vx:dir*11.6,vy:i*.48,r:13,dmg:6,kind:"blade"}))
        :[-1,0,1].map(i=>S({y:baseY+i*16,vx:dir*10.6,vy:i*.42,r:12.5,dmg:6,kind:"blade"}));
      break;
    case "titan": case "vorak": case "vex": case "brax": case "drakar": case "brutus": case "krak":
      specs=isSuper
        ?[S({y:GROUND-20,vx:dir*7.9,r:38,dmg:24,kind:"ground",life:190})]
        :isEx?[S({y:GROUND-19,vx:dir*7.7,r:31,dmg:17,kind:"ground",life:190}),S({x:f.x+dir*20,y:GROUND-18,vx:dir*7.7,r:23,dmg:8,kind:"ground",life:190})]
        :[S({y:GROUND-18,vx:dir*7.1,r:26,dmg:15,kind:"ground",life:185})];
      break;
    case "nova": case "lyra": case "aria":
      specs=isSuper
        ?[-125,-42,42,125].map((off,i)=>S({x:clamp(op.x+off,45,W-45),y:74+i*22,vx:-off/52,vy:5.2,r:17,dmg:9,kind:"meteor",grav:.16,life:150}))
        :isEx?[S({vx:dir*9.2,r:24,dmg:16,kind:"orb",homing:.26,life:200}),S({y:baseY-28,vx:dir*8.4,vy:-.5,r:14,dmg:7,kind:"orb",homing:.2,life:180})]
        :[S({vx:dir*8.1,r:21,dmg:14,kind:"orb",homing:.16,life:190})];
      break;
    case "godson-prime": case "astrid": case "lyra-azur":
      specs=isSuper
        ?[-32,0,32].map(off=>S({y:baseY+off,vx:dir*10.4,r:off===0?24:19,dmg:off===0?13:10,kind:"royal"}))
        :isEx?[-24,0,24].map(off=>S({y:baseY+off,vx:dir*10.7,r:off===0?20:16,dmg:off===0?11:8,kind:"royal",pierce:off===0}))
        :[-18,18].map(off=>S({y:baseY+off,vx:dir*9.6,r:16,dmg:9,kind:"royal"}));
      break;
    case "Zara": case "vorga":
      specs=isSuper
        ?[S({y:GROUND-28,vx:dir*8.4,r:40,dmg:25,kind:"wave",life:190})]
        :isEx?[-1,0,1].map(i=>S({y:baseY+i*13,vx:dir*11.7,vy:i*.6,r:15,dmg:8,kind:"blade",pierce:i===0}))
        :[-1,1].map(i=>S({y:baseY+i*13,vx:dir*10.8,vy:i*.62,r:14,dmg:8,kind:"blade"}));
      break;
    case "kael": case "Lira": case "selene": case "taiko": case "kazu":
      specs=isSuper
        ?[-26,0,26].map(off=>S({y:baseY+off,vx:dir*11.2,r:off===0?22:17,dmg:off===0?12:9,kind:"blade"}))
        :isEx?[-16,16].map(off=>S({y:baseY+off,vx:dir*12,r:16,dmg:9,kind:"blade",pierce:true}))
        :[S({vx:dir*11.8,r:16,dmg:13,kind:"blade",pierce:true})];
      break;
    case "sora": case "elara": case "nox":
      specs=isSuper
        ?[-70,0,70].map((off,i)=>S({x:clamp(op.x+off,45,W-45),y:70+i*24,vx:-off/60,vy:5.4,r:18,dmg:10,kind:"meteor",grav:.15,life:150}))
        :isEx?[-26,0,26].map(off=>S({y:baseY+off,vx:dir*8.2,r:15,dmg:8,kind:"orb",homing:.15,life:190}))
        :[S({vx:dir*7.4,r:20,dmg:13,kind:"orb",homing:.22,life:200})];
      break;
    case "ael": case "nyx": case "korben": case "drakesh": case "sera": case "raven": case "zep": case "Zara-nova": case "luna":
      specs=isSuper
        ?[S({vx:dir*9.8,r:32,dmg:24,kind:"judgment",pierce:true,life:190})]
        :isEx?[-24,-8,8,24].map(off=>S({y:baseY+off,vx:dir*12.6,r:12,dmg:6,kind:"bolt",pierce:true}))
        :[-8,8].map(off=>S({y:baseY+off,vx:dir*12.2,r:12,dmg:7,kind:"bolt"}));
      break;
    default: // Gideon
      specs=isSuper
        ?[S({vx:dir*9.2,r:34,dmg:25,kind:"judgment",pierce:true,life:190})]
        :isEx?[S({vx:dir*11.4,r:24,dmg:18,kind:"bolt",pierce:true,life:190})]
        :[S({vx:dir*10.3,r:19,dmg:14,kind:"bolt"})];
  }
  if(isEx)specs=specs.map(sp=>({...sp,vx:(sp.vx||0)*1.05,r:(sp.r||18)*1.08,life:(sp.life||175)+18,ex:true}));
  return specs;
}
function spawnProjectile(f){
  const isSuper=f.attackType==="super",isEx=f.attackType==="exspecial"||!!f.attackEx;
  const baseAtk={...(isSuper?ATTACKS.super:(isEx?ATTACKS.exspecial:ATTACKS.special))};
  const specs=abilitySpecs(f,isSuper,isEx);
  specs.forEach(sp=>{
    const atk={...baseAtk,dmg:sp.dmg};
    if(specs.length>1){ atk.hitstun=Math.min(atk.hitstun,13); if(sp.y!==specs[0].y)atk.knockdown=false; }
    projectiles.push({x:sp.x,y:sp.y,px:sp.x,py:sp.y,rx:sp.x,ry:sp.y,vx:sp.vx,vy:sp.vy||0,r:sp.r,owner:f,super:isSuper,ex:isEx||!!sp.ex,life:sp.life||175,atk,kind:sp.kind||"bolt",grav:sp.grav||0,pierce:!!sp.pierce,homing:sp.homing||0});
  });
  ring(f.x+f.facing*50,f.y-112*f.char.scale,f.skin.trail); spark(f.x+f.facing*50,f.y-112*f.char.scale,f.skin.trail,specs.length>2?22:13,3);
  SFX.fire();
  floater(f.x,f.y-198*f.char.scale,(isSuper?(f.char.superName||"💥 SUPER ATTAQUE"):isEx?("✨ EX "+(f.char.specName||"Spécial")):(f.char.specName||"✨ SPÉCIAL"))+" !",f.skin.trail,isSuper||isEx);
  if(isSuper){ shake=Math.max(shake,f.char.id==="titan"||f.char.id==="godson-prime"||f.char.id==="Zara"?10:7); cinematic=Math.max(cinematic,16); }
  else if(isEx){ shake=Math.max(shake,5); cinematic=Math.max(cinematic,8); }
}
function comboSequenceName(f){
  if(f.attack&&f.attack.m1Final&&f.combo>=3)return "👊 M1 SIGNATURE — "+String(f.attack.m1Name||"").toUpperCase();
  if(f.attack&&f.attack.m1&&f.combo>=4)return "🔥 M1 "+String(f.char.name||"").toUpperCase()+" x"+f.combo;
  const s=f.comboSeq.join(">");
  if(s.includes("uppercut")&&(s.includes("airKick")||s.includes("airPunch")))return "☁️ JONGLE CÉLESTE";
  if(s.endsWith("super")||s.endsWith("special"))return "⚡ FINISH ÉNERGÉTIQUE";
  if(f.combo>=5)return "🌪️ TEMPÊTE Godson";
  if(f.combo>=3)return "🔥 ENCHAÎNEMENT PRO";
  return "";
}
function applyDamage(att,def,atk,typeLabel){
  const hitY=def.y-106*def.char.scale,midX=(att.x+def.x)/2;
  const atkElapsed=def.attack?def.attackDur-def.attackT:99;
  const isCounter=!def.blocking&&def.attackT>0&&def.attack&&atkElapsed<def.attack.start;
  const isThrow=!!atk.throw;
  const blocked=!isThrow&&def.blocking&&def.grounded&&Math.sign(att.x-def.x)===(def.facing||1);
  if(blocked&&def.parryT>0&&typeLabel!=="super"){
    // ✨ PARRY PARFAITE : garde déclenchée à la dernière fraction de seconde
    def.parryT=0; def.parryFlashT=16; def.counterWindowT=30; def.blockStun=0; def.kvx=0;
    def.energy=Math.min(100,def.energy+12*def.char.energyGain); def.stats.parries=(def.stats.parries||0)+1; def.stats.blocked++;
    att.hitConfirmed=false; resetM1Chain(att); att.kvx=-att.facing*4.6; if(att.attackT>0)att.attackT=Math.max(att.attackT,11);
    spark(def.x+def.facing*44,hitY,"#ffc400",20,5); spark(def.x+def.facing*44,hitY,"#fff",10,3.4); ring(def.x+def.facing*44,hitY,"#ffc400"); impactBurst(def.x+def.facing*44,hitY,"parry","#ffc400",1.45,def.facing);
    floater(def.x,def.y-196*def.char.scale,"✨ PARRY PARFAITE !","#ffc400",true);
    shake=Math.max(shake,4.2); crowdExcite=110; SFX.parry();
    if(isLocalCareerFighter(def)){ PROFILE.stats.totalParries=(PROFILE.stats.totalParries||0)+1; PROFILE.stats.bestParriesMatch=Math.max(PROFILE.stats.bestParriesMatch||0,def.stats.parries); unlock("firstparry","Première parry parfaite"); if(def.stats.parries>=3)unlock("parry3","Défi Mur d’or — 3 parry dans un match"); }
    return;
  }
  if(blocked){
    const chip=def.health>1?1:0;
    def.health-=chip; def.blockStun=Math.max(def.blockStun,atk.blockstun||6); def.kvx=att.facing*(atk.knock||4)*.32*def.char.knockRes;
    def.energy=Math.min(100,def.energy+5*def.char.energyGain); def.stats.blocked++; att.hitConfirmed=true;
    spark(def.x+def.facing*42,hitY,"#bfe7ff",9,3); ring(def.x+def.facing*42,hitY,"#81d4fa"); impactBurst(def.x+def.facing*42,hitY,"block","#81d4fa",.85,def.facing); SFX.block();
    floater(def.x,def.y-184*def.char.scale,"BLOQUÉ !","#bfe7ff");
    return;
  }
  const continuing=!isThrow&&def.comboVuln&&att.comboT>0&&def.lastHitBy===att;
  att.combo=continuing?att.combo+1:1; if(!continuing){att.comboDamage=0;att.comboSeq=[];}
  att.comboSeq.push(typeLabel); att.comboT=62;
  const scaling=Math.max(.45,1-(att.combo-1)*.08);
  const isRiposte=att.counterWindowT>0; if(isRiposte)att.counterWindowT=0;
  const bonusMul=isRiposte?1.35:(isCounter?1.25:1);
  let dmg=Math.max(1,Math.round((atk.dmg||6)*att.char.power*(att.powerMul||1)*scaling*bonusMul));
  def.health=Math.max(0,def.health-dmg);
  const scaledHitstun=Math.max(6,Math.round((atk.hitstun||11)*(continuing?Math.max(.62,1-(att.combo-1)*.05):1)));
  def.hitStun=Math.max(def.hitStun,scaledHitstun); def.hitFlash=SETTINGS.reduceFlash?2:6;
  def.comboVuln=true; def.lastHitBy=att; def.energy=Math.min(100,def.energy+4*def.char.energyGain);
  att.energy=Math.min(100,att.energy+(atk.energy||6)*att.char.energyGain);
  att.hitConfirmed=true; att.comboDamage+=dmg; att.stats.damage+=dmg; att.stats.hits++;
  if(atk.m1){ att.stats.m1Hits=(att.stats.m1Hits||0)+1; if(atk.m1Final)att.stats.m1Finishers=(att.stats.m1Finishers||0)+1; }
  resetM1Chain(def);
  att.stats.maxCombo=Math.max(att.stats.maxCombo,att.combo); att.stats.maxComboDamage=Math.max(att.stats.maxComboDamage,att.comboDamage);
  if(isLocalCareerFighter(att)){ PROFILE.stats.bestCombo=Math.max(PROFILE.stats.bestCombo,att.combo); PROFILE.stats.bestComboDamage=Math.max(PROFILE.stats.bestComboDamage,att.comboDamage);
    if(att.combo>=5)unlock("combo5","Combo x5"); if(att.combo>=6)unlock("combo6","Défi Tempête Gideon — Combo x6"); if(att.comboDamage>=30)unlock("combo30","30 dégâts en un combo"); }
  if(isThrow){
    att.stats.throws=(att.stats.throws||0)+1;
    const throwDir=atk.throwDir||att.facing;
    if(throwDir===-att.facing){ def.x=clamp(att.x-att.facing*76,55,W-55); att.x=clamp(att.x+att.facing*18,55,W-55); def.facing=att.facing; }
    def.kvx=throwDir*(atk.knock||10)*def.char.knockRes; def.vy=-6.8; def.grounded=false; def.knockdownPending=true; def.juggleT=0;
  } else {
    def.kvx=att.facing*(atk.knock||4)*def.char.knockRes;
    if(atk.launcher){ def.vy=-atk.launcher; def.grounded=false; def.juggleT=36; }
    else if(!def.grounded){ def.vy=Math.min(def.vy,-3.7+Math.min(2,att.combo*.22)); def.juggleT=Math.max(def.juggleT,22); }
    else if(atk.knockdown){ def.vy=-5; def.grounded=false; def.knockdownPending=true; }
    else if(atk.hard&&def.grounded&&!(atk.m1&&!atk.m1Final))def.vy=-2.6; // les maillons M1 gardent la cible au sol pour que le combo reste vrai
  }
  spark(midX,hitY,atk.hard?att.skin.trail:"#fff59d",atk.hard?22:14,atk.hard?6:4.4); spark(midX,hitY,"#ff5252",7,3.2);
  const burstKind=isThrow?"throw":(atk.m1Final?"m1final":atk.m1?"m1":(isCounter||isRiposte)?"counter":(typeLabel==="special"||typeLabel==="super"||typeLabel==="exspecial")?"projectile":atk.hard?"heavy":"light");
  impactBurst(midX,hitY,burstKind,(atk.hard||atk.m1)?att.skin.trail:((isCounter||isRiposte)?"#ff9100":"#fff59d"),atk.m1Final?1.75:atk.hard?1.3:atk.m1?1.08+(atk.m1Step||0)*.08:(isCounter||isRiposte)?1.35:.92,att.facing);
  floater(def.x,def.y-184*def.char.scale,(isRiposte?"Riposte ! -":isCounter?"CONTRE ! -":"-")+dmg,isRiposte?"#ffc400":isCounter?"#ff9100":(atk.hard?att.skin.trail:"#ffffff"),atk.hard||isCounter||isRiposte);
  const seqName=comboSequenceName(att); if(att.combo>=3&&seqName)floater(att.x,att.y-212*att.char.scale,seqName,"#ffc400");
  shake=Math.max(shake,(atk.hard?7:3.4)*((isCounter||isRiposte)?1.15:1)); crowdExcite=95;
  if(isCounter||isRiposte)SFX.counter(); else SFX.hit(!!atk.hard);
  if(def.health<=0){
    if(state==="training"){ spark(def.x,hitY,"#ffffff",30,6); floater(def.x,def.y-220,"MANNEQUIN RÉINITIALISÉ","#69f0ae",true); def.health=def.maxHealth; def.comboVuln=false; att.combo=0; att.comboT=0; }
    else { if(isLocalCareerFighter(att)&&(typeLabel==="super"))unlock("superko","K.O. par SUPER attaque"); endRound(att,true,typeLabel); }
  }
}
function tryMeleeHit(f,op){
  if(f.hasHit||!f.attack||!f.attack.range||op.dead||op.downT>0||op.invulnT>0||op.dashT>7)return;
  if(f.attack.throw&&(!op.grounded||op.hitStun>0||op.blockStun>3))return; // projection : cible au sol, pas en pleine souffrance
  const elapsed=f.attackDur-f.attackT;
  if(elapsed<f.attack.start||elapsed>f.attack.end)return;
  const dx=op.x-f.x, range=f.attack.range*f.char.reach+16;
  const vTol=f.attack.throw?58:(f.attack.launcher?128:(f.attack.low?52:102));
  if(Math.sign(dx)===f.facing&&Math.abs(dx)<range&&Math.abs(op.y-f.y)<vTol){
    f.hasHit=true; applyDamage(f,op,f.attack,f.attackType);
  }
}
function clampX(f){ f.x=clamp(f.x,55,W-55); }
function startDash(f,dir){
  if(f.dashCD>0||f.dead||f.downT>0||(!f.grounded&&f.airDashed))return;
  f.dashT=mobilityProfile76().dashDur; f.dashDir=dir||f.facing; f.dashCD=f.char.dashCD; f.dashBufT=0;
  const dashOpponent=f===p1?p2:p1;
  if(f.grounded&&dashOpponent&&Math.sign(dashOpponent.x-f.x)===-f.dashDir)f.invulnT=Math.max(f.invulnT,6); // backdash défensif bref
  if(!f.grounded){ f.airDashed=true; f.vy=Math.min(f.vy,0); }
  f.attackT=0; f.attackType=null; f.attack=null; resetM1Chain(f);
  dust(f.x,f.y,6); SFX.dash(); if(f===p1)playerHabits.dashes++;
}
function updateFighter(f,inp,op){
  const mob76=mobilityProfile76();
  f.px=f.x; f.py=f.y; f.anim++;
  if(f.hitFlash>0)f.hitFlash--; if(f.squashT>0)f.squashT--; if(f.dashCD>0)f.dashCD--; if(f.invulnT>0)f.invulnT--; if(f.juggleT>0)f.juggleT--;
  if(f.bufT>0)f.bufT--; if(f.jumpBufT>0)f.jumpBufT--; if(f.dashBufT>0)f.dashBufT--;
  if(f.m1ChainT>0){ f.m1ChainT--; if(f.m1ChainT===0)resetM1Chain(f); }
  if(f.parryT>0)f.parryT--; if(f.parryFlashT>0)f.parryFlashT--; if(f.counterWindowT>0)f.counterWindowT--;
  if(f.comboT>0){ f.comboT--; if(f.comboT===0){f.combo=0;f.comboDamage=0;f.comboSeq=[];f.godsonCancelReady=true;} }
  if(--f.blinkT<-7)f.blinkT=90+replayRand()*140;
  if(f.dead){ f.koT++; f.vy+=.85; f.y+=f.vy; f.x+=f.kvx; f.kvx*=.9; if(f.y>=GROUND){ if(!f.grounded)dust(f.x,GROUND,8); f.y=GROUND;f.vy=0;f.grounded=true; } clampX(f); Object.assign(f.prev,inp); return; }
  const wasHitStun=f.hitStun>0;
  if(f.hitStun>0)f.hitStun--; if(f.blockStun>0)f.blockStun--;
  if(wasHitStun&&f.hitStun===0&&f.grounded&&f.downT<=0)f.comboVuln=false;
  if(f.downT>0){ f.downT--; if(f.downT===0){f.invulnT=13;f.comboVuln=false;f.squashT=6;} }
  if(f.dashT>0){ f.dashT--; if(simFrame%(mob76.ghostEvery||2)===0)addGhost(f); }
  if(f.attackT>0){
    f.attackT--; const el=f.attackDur-f.attackT;
    if(f.attack&&f.attack.m1&&f.grounded&&el>0&&el<=f.attack.start)f.x+=f.facing*(0.9+(f.attack.m1Advance||0)*.5); // tracking M1 : le combattant recolle pendant le démarrage
    if(!f.spawned&&f.attack&&el>=f.attack.start){ f.spawned=true; spawnProjectile(f); }
    tryMeleeHit(f,op);
    if(f.attackT===0){ f.attackType=null; f.attack=null; f.hitConfirmed=false; }
  }
  const canAct=isCombat()&&f.hitStun<=0&&f.blockStun<=0&&f.downT<=0;
  // --- Tampons d’entrée (fluidité pro) ---
  if(f===p1){ if(pressed(f,inp,"jump"))playerHabits.jumps++; if(inp.block&&simFrame%24===0)playerHabits.blocks++; }
  if(pressed(f,inp,"jump"))f.jumpBufT=mob76.buffer;
  if(pressed(f,inp,"block")&&f.grounded&&f.attackT<=0&&f.downT<=0)f.parryT=9; // fenêtre de parry : 9 frames (~150 ms)
  let tapDir=0; if(pressed(f,inp,"left"))tapDir=-1; if(pressed(f,inp,"right"))tapDir=1;
  if(tapDir!==0){ if(f.lastTapDir===tapDir&&simFrame-f.lastTapFrame<=mob76.doubleTap){ f.dashBufT=mob76.buffer; f.dashBufDir=tapDir; } f.lastTapDir=tapDir; f.lastTapFrame=simFrame; }
  if(pressed(f,inp,"dash")){ f.dashBufT=mob76.buffer; f.dashBufDir=inp.left?-1:(inp.right?1:f.facing); }
  f.inputDir=(inp.right?1:0)-(inp.left?1:0); // direction brute immédiate : projections avant/arrière réactives
  const want=desiredAttack(f,inp); if(want){ f.bufType=want; f.bufT=want==="m1"?18:mob76.attackBuffer; } // 18 frames : martelage humain toléré
  f.crouching=!!inp.block&&f.grounded&&f.attackT<=0&&f.dashT<=0;
  f.blocking=canAct&&f.crouching;
  if(canAct&&f.dashBufT>0&&f.attackT>0&&f.hitConfirmed&&f.godsonCancelReady&&f.energy>=25&&f.dashCD<=0){
    f.energy-=25; f.godsonCancelReady=false; f.stats.cancels=(f.stats.cancels||0)+1;
    floater(f.x,f.y-205*f.char.scale,"⚡ Godson CANCEL -25%","#ffc400",true); ring(f.x,f.y-96*f.char.scale,"#ffc400");
    startDash(f,f.dashBufDir);
  }
  if(canAct&&f.dashBufT>0&&f.dashCD<=0&&f.attackT<=0)startDash(f,f.dashBufDir);
  // --- Attaque tamponnée / annulation de combo ---
  if(canAct&&f.bufT>0&&f.bufType&&f.dashT<=3){
    if(f.attackT<=0){ if(startAttack(f,f.bufType))f.bufT=0; else f.bufT=0; }
    else if(f.bufType==="m1"&&f.attack&&f.attack.m1&&!f.attack.m1Final){
      const el=f.attackDur-f.attackT,cancelAt=Math.max((f.attack.start||3)+1,(f.attack.end||f.attack.start||4)-2);
      if(el>=cancelAt&&startAttack(f,"m1"))f.bufT=0; // le martelage enchaîne même si le coup précédent a manqué
    }
    else if(f.hitConfirmed&&f.attack){ const el=f.attackDur-f.attackT; const target=f.bufType==="special"?"special":f.bufType;
      if(el>=f.attack.end&&(CANCELS[f.attackType]||[]).includes(target)){ f.vx+=f.facing*1.6; if(startAttack(f,f.bufType))f.bufT=0; } }
  }
  // --- Saut : coyote-time + hauteur variable ---
  if(f.grounded)f.coyote=mob76.coyote; else if(f.coyote>0)f.coyote--;
  if(canAct&&f.jumpBufT>0&&(f.grounded||f.coyote>0)&&!f.crouching&&f.attackT<=0&&f.dashT<=0){
    f.vy=-f.char.jump; f.grounded=false; f.coyote=0; f.jumpBufT=0; f.jumpCut=false; f.squashT=7; dust(f.x,GROUND,6); SFX.jump();
  }
  if(!inp.jump&&!f.grounded&&f.vy<-7&&!f.jumpCut){ f.vy*=.55; f.jumpCut=true; }
  // --- Déplacement doux + course progressive ---
  let move=0; if(canAct&&!f.crouching&&!(f.attackT>0&&f.grounded)){ if(inp.left)move-=1; if(inp.right)move+=1; }
  f.inputDir=move;
  const vxSign=Math.abs(f.vx)>2.6?Math.sign(f.vx):0;
  if(f.grounded&&vxSign&&f.lastVXSign&&vxSign!==f.lastVXSign){ f.squashT=Math.max(f.squashT,4); if(simFrame%3===0)dust(f.x,GROUND,3); }
  if(vxSign)f.lastVXSign=vxSign;
  if(move!==0&&move===f.holdDir)f.holdT++; else {f.holdDir=move;f.holdT=0;}
  const runMul=f.grounded?1+Math.min(mob76.runMax,f.holdT/mob76.runRamp):1;
  const botMul=(f===p2&&(mode==="bot"||mode==="arcade"||mode==="tournament"||mode==="story"||mode==="survival"||(mode==="training"&&dummyMode==="combat")))?currentDiff().speed:1;
  let target=move*mob76.baseSpeed*f.char.speed*botMul*runMul*(f.grounded?1:mob76.airSpeed);
  if(f.dashT>0)target=f.dashDir*mob76.dashSpeed*f.char.speed;
  // V7.6 : demi-tour plus franc, freinage net et élan conservé pendant les attaques au sol.
  const reversing76=move!==0&&Math.abs(f.vx)>1&&Math.sign(f.vx)!==move;
  const groundBlend=f.attackT>0?mob76.attackSlide:(reversing76?mob76.groundReverse:(move!==0?mob76.groundAccel:mob76.groundStop));
  f.vx+=(target-f.vx)*(f.dashT>0?mob76.dashBlend:(f.grounded?groundBlend:mob76.airBlend));
  // --- Physique ---
  let grav=f.char.gravity; if(f.juggleT>0)grav*=.55; if(f.dashT>0&&!f.grounded)grav*=.25;
  if(!f.grounded&&f.juggleT<=0&&f.dashT<=0){ if(f.vy<-2.6&&inp.jump&&!f.jumpCut)grav*=mob76.riseGravity; else if(Math.abs(f.vy)<=2.6)grav*=mob76.apexGravity; else if(f.vy>3)grav*=mob76.fallGravity; }
  if(inp.block&&!f.grounded)grav+=.5;
  f.vy+=grav; if(f.vy>mob76.fallCap)f.vy=mob76.fallCap;
  f.x+=f.vx+f.kvx; f.y+=f.vy; f.kvx*=(f.grounded?.76:.94);
  if(f.y>=GROUND){
    if(!f.grounded){ if(f.vy>5)dust(f.x,GROUND,6); f.squashT=8; f.airDashed=false;
      if(f.knockdownPending&&f.health>0){ f.knockdownPending=false; f.downT=42; f.comboVuln=false; ring(f.x,GROUND-4,"#fff"); impactBurst(f.x,GROUND-6,"ground","#ffffff",1.05,f.facing); }
      if(f.hitStun>0&&!f.knockdownPending)f.comboVuln=false;
    }
    f.y=GROUND; f.vy=0; f.grounded=true;
  } else f.grounded=false;
  clampX(f);
  if(f.grounded&&Math.abs(f.vx+f.kvx)>.25)f.walkPhase+=clamp(Math.abs(f.vx+f.kvx)*.052,.07,.42)*runMul;
  if(f.grounded&&f.attackT<=0&&f.dashT<=0&&isCombat())f.facing=op.x>=f.x?1:-1;
  if(isCombat())f.energy=Math.min(100,f.energy+.016*f.char.energyGain);
  Object.assign(f.prev,inp);
}
function separate(){
  const mob76=mobilityProfile76(),dx=p2.x-p1.x,ad=Math.abs(dx),minD=58*(p1.char.bulk+p2.char.bulk)/2;
  if(ad<minD&&Math.abs(p1.y-p2.y)<105&&!p1.dead&&!p2.dead&&p1.downT<=0&&p2.downT<=0){
    const s=dx>=0?1:-1;
    if(mob76.name==="legacy"){
      const push=(minD-ad)/2; p1.x-=push*s; p2.x+=push*s; clampX(p1); clampX(p2);
    }else{
      // V7.6 : contact corporel amorti, avec transfert de correction au mur.
      const total=(minD-ad)*.78,d1=-s*total/2,d2=s*total/2;
      let c1=clamp(p1.x+d1,55,W-55),c2=clamp(p2.x+d2,55,W-55);
      const miss1=d1-(c1-p1.x),miss2=d2-(c2-p2.x);
      if(Math.abs(miss1)>.001)c2=clamp(c2-miss1,55,W-55);
      if(Math.abs(miss2)>.001)c1=clamp(c1-miss2,55,W-55);
      p1.x=c1; p2.x=c2;
      const inward1=s*p1.vx,inward2=-s*p2.vx;
      if(inward1>0)p1.vx-=s*inward1*.26;
      if(inward2>0)p2.vx+=s*inward2*.26;
    }
  }
}
function updateProjectiles(){
  // Chocs de projectiles entre eux (un projectile « perforant » traverse les autres)
  const clashRemove=new Set();
  for(let i=0;i<projectiles.length;i++)for(let j=i+1;j<projectiles.length;j++){
    const a=projectiles[i],b=projectiles[j];
    if(a.owner!==b.owner&&Math.abs(a.x-b.x)<a.r+b.r&&Math.abs(a.y-b.y)<46){
      spark((a.x+b.x)/2,(a.y+b.y)/2,"#ffffff",24,5.2); ring((a.x+b.x)/2,(a.y+b.y)/2,"#fff"); impactBurst((a.x+b.x)/2,(a.y+b.y)/2,"clash","#ffffff",1.25,1); SFX.boom();
      if(a.pierce&&!b.pierce)clashRemove.add(j);
      else if(b.pierce&&!a.pierce)clashRemove.add(i);
      else { clashRemove.add(i); clashRemove.add(j); }
    }
  }
  if(clashRemove.size)projectiles=projectiles.filter((_,idx)=>!clashRemove.has(idx));
  for(let i=projectiles.length-1;i>=0;i--){
    // applyDamage() peut terminer le round et vider projectiles pendant l'itération.
    const pr=projectiles[i]; if(!pr)break;
    const def=pr.owner===p1?p2:p1;
    pr.px=pr.x; pr.py=pr.y;
    if(pr.homing&&!def.dead){ const ty=def.y-92*def.char.scale; pr.vy=clamp((pr.vy||0)+(ty-pr.y)*.012,-3.4,3.4); }
    pr.vy=(pr.vy||0)+(pr.grav||0);
    pr.x+=pr.vx; pr.y+=pr.vy; pr.life--;
    if(pr.kind==="ground"){ pr.y=GROUND-19; if(simFrame%3===0)dust(pr.x,GROUND,2); }
    if(pr.kind==="wave"){ pr.y=GROUND-28; pr.vy=0; if(simFrame%2===0)pushParticle({x:pr.x+(Math.random()-.5)*42,y:GROUND-8-Math.random()*18,vx:-pr.vx*.08,vy:-.8-Math.random()*.9,life:16,max:16,r:2.4+Math.random()*3.4,c:pr.owner.skin.trail,grav:.03}); }
    if(qualityLevel>0||simFrame%2===0)pushParticle({x:pr.x,y:pr.y+(Math.random()-.5)*11,vx:-pr.vx*.04,vy:(Math.random()-.5)*.65,life:14,max:14,r:pr.r*.3,c:pr.owner.skin.trail,grav:0});
    let remove=pr.life<=0||pr.x<-55||pr.x>W+55||pr.y>H+70;
    // Explosion des météores au sol
    if(!remove&&pr.kind==="meteor"&&pr.y>=GROUND-13){
      spark(pr.x,GROUND-8,pr.owner.skin.trail,20,5.2); ring(pr.x,GROUND-8,"#fff"); impactBurst(pr.x,GROUND-10,"ground",pr.owner.skin.trail,1.45,Math.sign(pr.vx)||1); dust(pr.x,GROUND,7); SFX.boom();
      if(!def.dead&&def.downT<=0&&def.invulnT<=0&&def.dashT<=7&&Math.abs(pr.x-def.x)<76&&def.y>GROUND-95)applyDamage(pr.owner,def,pr.atk,pr.super?"super":(pr.ex?"exspecial":"special"));
      remove=true;
    }
    if(!remove&&!def.dead&&def.downT<=0&&def.invulnT<=0&&def.dashT<=7&&Math.abs(pr.x-def.x)<pr.r+34&&Math.abs(pr.y-(def.y-86*def.char.scale))<94*def.char.scale){
      applyDamage(pr.owner,def,pr.atk,pr.super?"super":(pr.ex?"exspecial":"special")); spark(pr.x,pr.y,pr.owner.skin.trail,25,6); ring(pr.x,pr.y,"#fff"); SFX.boom(); remove=true;
    }
    if(remove&&projectiles[i]===pr)projectiles.splice(i,1);
  }
}
function updateEffects(){
  for(let i=particles.length-1;i>=0;i--){ const p=particles[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=(p.grav||0); if(--p.life<=0)particles.splice(i,1); }
  for(let i=floaters.length-1;i>=0;i--){ const f=floaters[i]; f.y+=f.vy; if(--f.life<=0)floaters.splice(i,1); }
  for(let i=rings.length-1;i>=0;i--){ const r=rings[i]; r.r+=5.4; if(--r.life<=0)rings.splice(i,1); }
  for(let i=ghosts.length-1;i>=0;i--){ if(--ghosts[i].life<=0)ghosts.splice(i,1); }
  for(let i=impactBursts.length-1;i>=0;i--){ if(--impactBursts[i].life<=0)impactBursts.splice(i,1); }
  shake*=.86; if(shake<.25)shake=0;
  if(crowdExcite>0)crowdExcite--; if(cinematic>0)cinematic--;
}

/* ---------------- ROUNDS / MATCH / TEMPS ---------------- */
function announce(text,sub,ko){
  const a=$("announce"),t=$("announceText"); if(!a||!t)return;
  t.textContent=text; t.className=ko?"ko":""; $("announceSub").textContent=sub||"";
  a.style.display="grid"; t.style.animation="none"; void t.offsetWidth; t.style.animation="";
}
function hideAnnounce(){ const a=$("announce"); if(a)a.style.display="none"; }
function resetFighterStats(){ fighters.forEach(f=>f.stats={damage:0,hits:0,attacks:0,maxCombo:0,maxComboDamage:0,blocked:0,parries:0,throws:0,cancels:0,ex:0,m1Hits:0,m1Chains:0,m1Finishers:0}); }
function applySurvivalScaling(){
  p1.powerMul=1; p2.powerMul=1;
  if(mode!=="survival")return;
  const hpMul=1+Math.min(.38,Math.max(0,survival.wave-2)*.045);
  p2.maxHealth=Math.round(p2.char.hp*hpMul); p2.health=p2.maxHealth;
  p2.powerMul=1+Math.min(.28,Math.max(0,survival.wave-3)*.035);
  if(survival.carryHealth!=null){ p1.health=clamp(survival.carryHealth,1,p1.maxHealth); p1.energy=clamp(survival.carryEnergy||0,0,100); survival.carryHealth=null; }
}
function resetRound(){
  const w1=p1.roundWins,w2=p2.roundWins;
  p1.reset(); p2.reset(); p1.roundWins=w1; p2.roundWins=w2; applySurvivalScaling();
  projectiles=[]; floaters=[]; rings=[]; ghosts=[]; impactBursts=[]; bot.queue=[]; bot.press={}; bot.lastFollowId=-1; bot.move=0; bot.blockT=0;
  timerSec=SETTINGS.roundTime; timerFrames=0; state="intro"; introT=132; announcedFight=false; lastWinner=null; cinematic=70;
  if(typeof buildPips==="function")buildPips();
  $("roundLabel").textContent=teamMatch.active?("2V2 • MANCHE "+round+" • "+p1.roundWins+"–"+p2.roundWins):mode==="arcade"?("CHAMPIONNAT "+arcade.stage+"/"+arcadeTotal()+" • ROUND "+round):mode==="tournament"?((((typeof tournamentCurrentMatch==="function"&&tournamentCurrentMatch())||{}).roundName||"TOURNOI").toUpperCase()+" • ROUND "+round):mode==="story"?("HISTOIRE "+story.step+"/"+story.total+" • ROUND "+round):mode==="survival"?("SURVIE • VAGUE "+survival.wave):("ROUND "+round);
  announce(teamMatch.active?("MANCHE "+round):mode==="survival"?("VAGUE "+survival.wave):("ROUND "+round),teamMatch.active?(p1.char.name+" VS "+p2.char.name+" • "+teamScoreLabel()):mode==="arcade"?((arcade.circuitName||"Championnat Godson")+" — combat "+arcade.stage+" / "+arcadeTotal()):mode==="tournament"?((tournament?tournament.formatName:"Tournoi Godson")+" — "+(((typeof tournamentCurrentMatch==="function"&&tournamentCurrentMatch())||{}).roundName||"Bracket")):mode==="story"?currentStoryFight().chapter:mode==="survival"?("Score : "+survival.score+" • Un seul round !"):"Prêt… ?"); SFX.beep();
  if(typeof resetCamera==="function")resetCamera(true);
  if(typeof snapHUD==="function")snapHUD();
}
function resetTrainingPositions(full){
  const e1=p1.energy,e2=p2.energy;
  p1.reset(); p2.reset(); if(!full){p1.energy=e1;p2.energy=e2;}
  projectiles=[]; floater(640,250,"POSITIONS RÉINITIALISÉES","#69f0ae");
  if(typeof snapHUD==="function")snapHUD();
}
function beginMatch(){
  const replaySeed=replayPlayback.active&&replayPlayback.data?replayPlayback.data.seed:(mode==="online"&&onlineSession.config&&onlineSession.config.seed!=null?(onlineSession.config.seed>>>0):makeReplaySeed());
  seedReplayVisuals(replaySeed);
  buildDisplayNames();
  if(!replayPlayback.active&&mode==="survival"&&survival.wave===1&&!survival.runCounted){ survival.runCounted=true; PROFILE.stats.survivalRuns=(PROFILE.stats.survivalRuns||0)+1; saveProfile(); }
  p1.roundWins=0; p2.roundWins=0; round=1; matchElapsed=0; resetFighterStats();
  playerHabits.jumps=0; playerHabits.blocks=0; playerHabits.dashes=0;
  $("nameP1").innerHTML="🟦 "+escapeHTML(p1.displayName);
  $("nameP2").innerHTML=(mode==="online"?"🌐 ":(mode==="2p"?"🟥 ":"🤖 "))+escapeHTML(p2.displayName);
  $("hud").style.display="grid";
  $("trainingBar").style.display=mode==="training"?"flex":"none";
  $("touchUI").style.display=(touchEnabled||("ontouchstart" in window&&mode!=="2p"))?"flex":"none";
  if(mode==="training"){
    p1.reset(); p2.reset(); projectiles=[]; timerSec=0; state="training"; announceT=95;
    $("roundLabel").textContent="ENTRAÎNEMENT";
    announce("ENTRAÎNEMENT","Martèle POING pour découvrir ton M1 Signature — vie et temps illimités");
    if(typeof snapHUD==="function")snapHUD();
    if(typeof resetCamera==="function")resetCamera(true);
  } else resetRound();
  if(replayPlayback.active&&replayPlayback.data&&replayPlayback.data.start){
    const restoreFighter=(f,s)=>{ if(!s)return; f.maxHealth=s.maxHealth; f.health=s.health; f.energy=s.energy; f.powerMul=s.powerMul||1; };
    restoreFighter(p1,replayPlayback.data.start.p1); restoreFighter(p2,replayPlayback.data.start.p2);
    if(typeof snapHUD==="function")snapHUD();
  } else startReplayRecording(replaySeed);
  startMusic();
}
function endRound(winner,byKO,finishType){
  if(state!=="fight")return;
  state="roundEnd"; roundEndT=168; lastWinner=winner||null; lastFinishType=finishType||(byKO?"ko":"temps");
  projectiles=[];
  if(winner){ winner.roundWins++; winner.victory=true; const loser=winner===p1?p2:p1;
    if(byKO){ loser.dead=true; loser.vy=-6.5; loser.kvx=winner.facing*7; } }
  if(byKO){ announce("K.O. !",finishType==="super"?"FINISH PAR SUPER ATTAQUE !":"",true); SFX.ko(); shake=Math.max(shake,11); cinematic=110; }
  else announce(winner?"TEMPS ÉCOULÉ":"ÉGALITÉ !",winner?winner.name+" remporte le round":"Aucun point marqué");
  crowdExcite=170; firework(240+Math.random()*800,150+Math.random()*90);
  if(typeof buildPips==="function")buildPips();
}
function finishMatch(winner){
  if(replayPlayback.active){ finishReplayPlayback(winner); return; }
  finalizeReplayRecording(winner);
  state="matchEnd"; hideAnnounce(); stopMusic(); SFX.win(); confetti(); cinematic=0;
  if(mode==="bot"||mode==="arcade"||mode==="tournament"||mode==="story"||mode==="survival"){
    PROFILE.stats.matches++;
    if(winner===p1){ PROFILE.stats.wins++; unlock("firstwin","Première victoire"); if(PROFILE.stats.wins>=10)unlock("wins10","Défi Habitué de l’Arène — 10 victoires"); if(botDiff==="difficile"&&(mode==="bot"||mode==="tournament"))unlock("hardwin","Vaincre le bot Difficile"); }
    else PROFILE.stats.losses++;
    PROFILE.stats.bestParriesMatch=Math.max(PROFILE.stats.bestParriesMatch||0,p1.stats.parries||0);
  } else if(mode==="online"){
    PROFILE.stats.matches++;
    const localFighter=onlineSession.localSide===2?p2:p1;
    if(winner===localFighter){ PROFILE.stats.wins++; unlock("firstwin","Première victoire"); if(PROFILE.stats.wins>=10)unlock("wins10","Défi Habitué de l’Arène — 10 victoires"); }
    else PROFILE.stats.losses++;
    PROFILE.stats.bestParriesMatch=Math.max(PROFILE.stats.bestParriesMatch||0,localFighter.stats.parries||0);
    stopOnlineSession("finished"); // restaure les réglages locaux AVANT saveProfile()
    if(typeof submitOnlineMatchResult==="function")setTimeout(()=>submitOnlineMatchResult(winner),0);
  } else if(mode==="2p")PROFILE.stats.matches++;
  arcade.lastWin=(winner===p1);
  if(mode==="arcade"&&winner===p1&&arcade.stage>=arcadeTotal()){ PROFILE.stats.arcadeClears++; const cc=careerData(); const cid=arcade.circuit||"stade"; cc.circuits[cid]=(cc.circuits[cid]||0)+1; unlock("arcade","Champion du mode Arcade"); unlock("circuit-"+cid,"Champion — "+((CHAMPIONSHIP_CIRCUITS[cid]||{}).name||cid)); }
  if(mode==="story"){
    story.lastWin=(winner===p1);
    if(winner===p1){
      if(story.step===3){
        // Fin de l’acte 1 : la récompense secrète reste la même, la saga continue vers Libreville.
        PROFILE.story.chapter1Completed=true; PROFILE.story.progressStep=4; PROFILE.unlocks.prime=true;
        unlock("storych1","Finir le Chapitre 1 de l’Histoire");
        unlock("primeunlock","GODSON PRIME débloqué");
      } else if(story.step<story.total) {
        PROFILE.story.progressStep=Math.max(PROFILE.story.progressStep||1,story.step+1);
      } else {
        PROFILE.story.completed=true; PROFILE.story.chapter1Completed=true; PROFILE.story.chapter2Completed=true;
        PROFILE.story.clears=(PROFILE.story.clears||0)+1; PROFILE.story.chapter2Clears=(PROFILE.story.chapter2Clears||0)+1; PROFILE.story.progressStep=1;
        PROFILE.unlocks.prime=true; PROFILE.unlocks.librevilleSkin=true;
        unlock("storych2","Défi Saga Godson — Finir le Chapitre 2");
        unlock("Librevilleskin","Tenue Coucher de soleil de Libreville débloquée");
      }
    }
  }
  if(mode==="survival"){
    survival.lastWin=(winner===p1);
    const perf=fighterMatchScore(p1,p2);
    if(winner===p1){
      survival.lastWaveScore=100*survival.wave+perf;
      survival.carryHealth=Math.min(p1.maxHealth,p1.health+Math.round(p1.maxHealth*.35));
      survival.carryEnergy=Math.min(80,p1.energy+15);
      PROFILE.stats.bestSurvivalWave=Math.max(PROFILE.stats.bestSurvivalWave||0,survival.wave);
      if(survival.wave>=3)unlock("survival3","Survivre à la vague 3");
      if(survival.wave>=5)unlock("survival5","Survivre à la vague 5 — Boss vaincu");
      if(survival.wave>=10)unlock("survival10","Légende de la Survie : vague 10");
    } else {
      survival.lastWaveScore=Math.round(perf/3);
      survival.carryHealth=null;
    }
    survival.score+=survival.lastWaveScore;
  }
  if(mode==="tournament"&&typeof completeTournamentPlayerMatch==="function")completeTournamentPlayerMatch(winner);
  awardCareerForMatch(winner);
  saveProfile();
  if(typeof showEndScreen==="function")showEndScreen(winner);
}
function updateGameLogic(){
  const onlineFrame=prepareOnlineFrame();
  if(!onlineFrame.ready)return false;
  const onlineWasActive=!!(onlineSession.active&&mode==="online"&&!replayPlayback.active);
  tickReplayFrameStart(); verifyReplayCheckpoint();
  const replayedInputs=replayPlayback.active?replayInputsForCurrentFrame():null;
  if(!replayPlayback.active&&state!=="fight"&&state!=="training")recordReplayInputs(INPUT_BLANK,INPUT_BLANK);
  simFrame++; timeGlobal++;
  if(state==="intro"){
    introT--; updateFighter(p1,INPUT_BLANK,p2); updateFighter(p2,INPUT_BLANK,p1); separate();
    if(introT===56&&!announcedFight){ announcedFight=true; announce("COMBATTEZ !",""); SFX.fight(); }
    if(introT<=0){ state="fight"; hideAnnounce(); cinematic=0; }
  }
  else if(state==="fight"||state==="training"){
    matchElapsed+=1/60;
    let i1,i2;
    if(replayPlayback.active){ i1=replayedInputs.p1; i2=replayedInputs.p2; }
    else {
      if(mode==="online"&&onlineSession.active){ i1=onlineFrame.p1; i2=onlineFrame.p2; }
      else {
        i1=getInputP1();
        if(mode==="2p")i2=getInputP2(); else if(mode==="training")i2=getDummyInput(); else { updateBot(); i2=bot.input; }
      }
      /* Entrées finales (bot et réseau inclus) : la relecture ne redemande jamais son avis au hasard. */
      recordReplayInputs(i1,i2);
    }
    updateFighter(p1,i1,p2); updateFighter(p2,i2,p1); separate(); updateProjectiles();
    if(state==="fight"&&SETTINGS.roundTime>0){
      timerFrames++; if(timerFrames>=60){ timerFrames=0; timerSec--; if(timerSec<=10&&timerSec>0)SFX.beep();
        if(timerSec<=0){ timerSec=0; endRound(p1.health===p2.health?null:(p1.health>p2.health?p1:p2),false,"temps"); } }
    }
    if(state==="training"&&announceT>0){ if(--announceT===0)hideAnnounce(); }
  }
  else if(state==="roundEnd"){
    updateFighter(p1,INPUT_BLANK,p2); updateFighter(p2,INPUT_BLANK,p1); separate();
    if(roundEndT===108&&lastWinner)announce(lastWinner.name.toUpperCase()+" GAGNE !",teamMatch.active?("Manche "+round+" terminée • Équipes "+p1.roundWins+"–"+p2.roundWins):"Round "+round+" terminé");
    if(roundEndT===70)firework(200+Math.random()*880,140+Math.random()*100);
    if(--roundEndT<=0){
      if(lastWinner&&lastWinner.roundWins>=roundsToWin())finishMatch(lastWinner);
      else { if(lastWinner){ prepareTeamRelayNext(lastWinner); round++; } resetRound(); }
    }
  }
  else if(state==="menu"||state==="vs"||state==="matchEnd"||state==="select"||state==="scene"){
    p1.anim++; p2.anim++; p1.px=p1.rx=p1.x; p1.py=p1.ry=p1.y; p2.px=p2.rx=p2.x; p2.py=p2.ry=p2.y;
    p1.facing=1; p2.facing=-1;
    if(state==="matchEnd"&&Math.random()<.012)confetti();
  }
  if(replayPlayback.active&&replayPlayback.data&&replayPlayback.currentFrame>=replayPlayback.data.duration+180&&state!=="matchEnd")finishReplayPlayback(lastWinner||(p1.health>=p2.health?p1:p2));
  updateEffects();
  if(onlineWasActive)onlineSession.frame++;
  return true;
}
function escapeHTML(s){ return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

/* Préparation initiale */
applyQualitySettings();
applyCharacterTo(p1,selCharP1); applyCharacterTo(p2,selCharP2<0?2:selCharP2);
buildDisplayNames(); placeMenuFighters();
