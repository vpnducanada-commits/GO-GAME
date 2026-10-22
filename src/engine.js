"use strict";
/* =====================================================================
   GÉDÉON - Godson ARENA V2.3 PRO — MOTEUR DE JEU
   Physique 60 img/s interpolée, combos annulables, IA adaptative.
   Signé : Gideon - Godson
   ===================================================================== */
const GAME_VERSION="2.3.0";
const W=1280,H=720,GROUND=600;
const canvas=document.getElementById("game"),ctx=canvas.getContext("2d",{alpha:false});
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
function shade(hex,amt){ const n=parseInt(hex.slice(1),16); let r=(n>>16)+amt,g=((n>>8)&255)+amt,b=(n&255)+amt; r=clamp(r,0,255);g=clamp(g,0,255);b=clamp(b,0,255); return "#"+((r<<16)|(g<<8)|b).toString(16).padStart(6,"0"); }

/* ---------------- PROFIL & SAUVEGARDE LOCALE ---------------- */
const SAVE_KEY="gideonGodsonArenaV2Pro";
const store={
  get(){ try{return window.localStorage.getItem(SAVE_KEY);}catch(e){return null;} },
  set(v){ try{window.localStorage.setItem(SAVE_KEY,v);}catch(e){} },
  del(){ try{window.localStorage.removeItem(SAVE_KEY);}catch(e){} }
};
function defaultProfile(){ return {
  settings:{musicVol:70,sfxVol:90,quality:"auto",roundTime:99,roundsWin:2,speed:1,shake:100,showFps:false,reduceFlash:false},
  names:{p1:"Gideon",p2:"Joueur 2"}, initials:{p1:"G",p2:"R"},
  customColors:{p1:null,p2:null},
  selection:{charP1:0,charP2:1,arena:"stadium"},
  stats:{wins:0,losses:0,matches:0,bestCombo:0,bestComboDamage:0,arcadeClears:0,bestSurvivalWave:0,survivalRuns:0},
  unlocks:{prime:false},
  story:{progressStep:1,completed:false,clears:0},
  leaderboard:[],
  ach:{}
};}
let PROFILE=defaultProfile();
try{ const raw=store.get(); if(raw){ const p=JSON.parse(raw), d=defaultProfile();
  PROFILE={...d,...p,settings:{...d.settings,...(p.settings||{})},names:{...d.names,...(p.names||{})},initials:{...d.initials,...(p.initials||{})},customColors:{...d.customColors,...(p.customColors||{})},selection:{...d.selection,...(p.selection||{})},stats:{...d.stats,...(p.stats||{})},unlocks:{...d.unlocks,...(p.unlocks||{})},story:{...d.story,...(p.story||{})},leaderboard:Array.isArray(p.leaderboard)?p.leaderboard:[],ach:p.ach||{}};
} }catch(e){}
let SETTINGS=PROFILE.settings;
function saveProfile(){ SETTINGS=PROFILE.settings; store.set(JSON.stringify(PROFILE)); if(typeof syncProfileUI==="function")syncProfileUI(); }

/* ---------------- QUALITÉ / HAUTE RÉSOLUTION ---------------- */
let DPR=1,qualityLevel=2; // 2 haute, 1 moyenne, 0 basse
function particleMul(){ return [0.45,0.75,1][qualityLevel]; }
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
 {id:"gideon",name:"GÉDÉON",title:"Le Champion Équilibré",letter:"G",style:"hero",specName:"⚡ Foudre Gédéon",superName:"🌟 Jugement Godson",hp:100,speed:1,power:1,atkSpeed:1,energyGain:1,scale:1,bulk:1,reach:1,gravity:.8,jump:15.8,knockRes:1,dashCD:28,
  skin:{primary:"#0091ea",dark:"#01579b",accent:"#ffc400",pants:"#263238",skin:"#8d5524",hair:"#14100c",glove:"#ff1744",trail:"#ffc400"}},
 {id:"kira",name:"Kira",title:"La Foudre Rapide",letter:"K",style:"kunoichi",specName:"🌪️ Rafale Kira",superName:"⚡ Tempête de Lames",hp:92,speed:1.22,power:.88,atkSpeed:1.18,energyGain:1.05,scale:.96,bulk:.85,reach:.98,gravity:.76,jump:16.9,knockRes:1.12,dashCD:20,
  skin:{primary:"#00c853",dark:"#00695c",accent:"#b9f6ca",pants:"#1b2a1e",skin:"#a06a35",hair:"#180a2a",glove:"#ffd600",trail:"#69f0ae"}},
 {id:"titan",name:"TITAN",title:"La Montagne de Fer",letter:"T",style:"titan",specName:"🌋 Onde Sismique",superName:"☄️ Séisme Titan",hp:120,speed:.82,power:1.28,atkSpeed:.88,energyGain:.9,scale:1.13,bulk:1.35,reach:1.08,gravity:.9,jump:14.6,knockRes:.72,dashCD:36,
  skin:{primary:"#e53935",dark:"#7f0000",accent:"#ffccbc",pants:"#1c1c22",skin:"#7a4a21",hair:"#050505",glove:"#263238",trail:"#ff7043"}},
 {id:"nova",name:"NOVA",title:"La Maîtresse de l’Énergie",letter:"N",style:"nova",specName:"🔮 Orbe Chercheuse",superName:"🌠 Pluie d’Énergie",hp:96,speed:1.06,power:.96,atkSpeed:1.04,energyGain:1.55,scale:1,bulk:.92,reach:1.02,gravity:.78,jump:16.2,knockRes:1.02,dashCD:25,
  skin:{primary:"#7c3aed",dark:"#311b92",accent:"#e040fb",pants:"#241040",skin:"#c68642",hair:"#2a0a3a",glove:"#69f0ae",trail:"#e040fb"}},
 {id:"godson-prime",name:"GODSON PRIME",title:"Le Champion Légendaire Secret",letter:"G",style:"prime",specName:"👑 Double Vague Royale",superName:"👑 Triple Jugement Royal",unlockKey:"prime",lockedHint:"Termine le Mode Histoire pour le débloquer",hp:108,speed:1.12,power:1.12,atkSpeed:1.1,energyGain:1.25,scale:1.04,bulk:1.08,reach:1.05,gravity:.8,jump:16.4,knockRes:.9,dashCD:23,
  skin:{primary:"#f5a623",dark:"#7a3b00",accent:"#00e5ff",pants:"#17202b",skin:"#8d5524",hair:"#120b02",glove:"#0b1c2c",trail:"#ffc400"}}
];
function charStatBars(c){ return {VIT:clamp(Math.round(c.speed*58),5,100),PUI:clamp(Math.round(c.power*62),5,100),VIE:clamp(Math.round(c.hp*.78),5,100),ÉNER:clamp(Math.round(c.energyGain*55),5,100)}; }

/* ---------------- DONNÉES : ARÈNES ---------------- */
const ARENAS=[
 {id:"stadium",name:"Stade Godson — Sunset",music:{interval:205,bass:[55,55,82.4,55,65.4,55,98,73.4],lead:[220,261.6,329.6,261.6]}},
 {id:"tokyo",name:"Néon Tokyo — Pluie",music:{interval:178,bass:[49,49,73.4,49,61.7,49,98,82.4],lead:[196,246.9,293.7,246.9]}},
 {id:"temple",name:"Temple Céleste — Jour",music:{interval:235,bass:[65.4,65.4,98,65.4,73.4,65.4,110,98],lead:[261.6,329.6,392,329.6]}}
];
let currentArena=ARENAS[0];

/* ---------------- DONNÉES : ATTAQUES (frame data pro) ---------------- */
const ATTACKS={
  punch:   {dur:16,start:4, end:9, dmg:6, range:104,knock:4.2,hitstun:11,blockstun:6, hitstop:42, energy:6, label:"Poing"},
  kick:    {dur:24,start:7, end:15,dmg:9, range:116,knock:7.5,hitstun:14,blockstun:8, hitstop:62, energy:8, label:"Pied",hard:true},
  uppercut:{dur:28,start:8, end:16,dmg:11,range:97, knock:2.5,hitstun:18,blockstun:9, hitstop:78, energy:9, label:"Uppercut",hard:true,launcher:11.5},
  sweep:   {dur:27,start:8, end:16,dmg:8, range:118,knock:6,  hitstun:14,blockstun:8, hitstop:66, energy:8, label:"Balayage",hard:true,knockdown:true,low:true},
  airPunch:{dur:15,start:3, end:9, dmg:6, range:99, knock:4,  hitstun:11,blockstun:6, hitstop:42, energy:6, label:"Poing aérien",air:true},
  airKick: {dur:21,start:6, end:14,dmg:9, range:112,knock:6.5,hitstun:14,blockstun:8, hitstop:58, energy:8, label:"Pied aérien",hard:true,air:true},
  special: {dur:27,start:8, end:9, dmg:14,range:0,  knock:7,  hitstun:15,blockstun:9, hitstop:70, energy:0, label:"Spécial"},
  super:   {dur:32,start:9, end:10,dmg:23,range:0,  knock:11, hitstun:19,blockstun:11,hitstop:105,energy:0, label:"SUPER",hard:true,knockdown:true}
};
const CANCELS={ punch:["punch","kick","uppercut","sweep","special"], kick:["special"], uppercut:["special"], sweep:[], airPunch:["airKick"], airKick:[], special:[], super:[] };
const DIFFS={
  facile:{label:"Facile",react:24,agg:.42,block:.15,spec:.25,jump:.06,mistake:.38,speed:.9,combo:.18,dash:.08,parry:.04},
  moyen:{label:"Moyen",react:13,agg:.66,block:.42,spec:.6,jump:.13,mistake:.16,speed:1,combo:.55,dash:.3,parry:.17},
  difficile:{label:"Difficile",react:7,agg:.88,block:.69,spec:.92,jump:.2,mistake:.05,speed:1.07,combo:.92,dash:.55,parry:.36}
};

/* ---------------- MODE HISTOIRE : CHAPITRE 1 ---------------- */
const STORY_CAMPAIGN={
  title:"Chapitre 1 — L’Appel de l’Arène",
  fights:[
    {char:1,diff:"facile",arena:"stadium",foeName:"Kira, la Rivale",chapter:"Combat 1 — La porte du Stade Gideon",
     objective:"Prouve ta valeur : remporte le duel d’entrée de l’Arène.",
     dialogue:[
       ["NARRATION","Libreville s’embrase : le tournoi Gideon - Godson va couronner un nouveau champion. Une seule porte, une seule règle — gagner."],
       ["Kira","Tu veux entrer dans la grande Arène ? Les champions ne frappent pas à la porte… ils la traversent. Montre-moi ton dash, tes combos, ton courage !"],
       ["TOI","Je ne suis pas venu regarder les projecteurs. Je suis venu écrire mon nom au sommet. Que le premier combat commence !"]
     ],
     retry:"Kira te tend la main : « Relève-toi. Un champion se mesure à sa façon de revenir. Encore une fois ! »"},
    {char:3,diff:"moyen",arena:"temple",foeName:"NOVA, Gardienne de l’Énergie",chapter:"Combat 2 — Le secret du Temple Céleste",
     objective:"Maîtrise l’énergie : bats Nova et apprends la voie des attaques spéciales.",
     dialogue:[
       ["NARRATION","Au Temple Céleste, les anciens champions ont caché le secret de l’énergie Godson — celle qui transforme un coup en légende."],
       ["NOVA","Ta force brute t’a mené jusqu’ici. Mais sais-tu charger ton énergie, la garder… puis la libérer au moment parfait ?"],
       ["TOI","Apprends-moi en combattant. Si je dois mériter cette lumière, je la gagnerai à la loyale !"]
     ],
     retry:"Nova sourit : « L’énergie ne se vole pas, elle s’apprend. Respire, observe mes projectiles… et réessaie. »"},
    {char:2,diff:"difficile",arena:"tokyo",foeName:"TITAN, le Boss de Néon Tokyo",chapter:"Combat final — Le Boss sous la pluie de néons",
     objective:"BOSS FINAL : fais tomber TITAN et deviens le Champion de l’Arène.",
     dialogue:[
       ["NARRATION","Néon Tokyo, minuit. Sous la pluie, le champion invaincu TITAN garde la ceinture Gideon - Godson depuis mille combats."],
       ["TITAN","On dit qu’un nouveau nom fait trembler l’Arène. Les noms ne me font pas peur. Seuls les poings parlent ici."],
       ["TOI","Alors écoute bien, Titan : ce soir, l’Arène apprendra à prononcer un nouveau champion. Pour Gideon - Godson !"]
     ],
     retry:"TITAN croise les bras sous la pluie : « Bien frappé… mais un boss ne tombe pas au premier orage. Reviens plus fort ! »"}
  ],
  ending:[
    ["NARRATION","TITAN s’incline sous les néons. La foule explose : l’Arène Gideon - Godson a trouvé son champion !"],
    ["TITAN","Cette ceinture… elle attendait quelqu’un comme toi. Porte-la avec honneur, champion."],
    ["NARRATION","🏆 RÉCOMPENSE DÉBLOQUÉE : le personnage secret GODSON PRIME rejoint ton équipe, avec sa SUPER attaque triple !"],
    ["TOI","Ce n’est que le Chapitre 1. L’Arène Gideon - Godson ne fait que commencer…"]
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
    this.stats={damage:0,hits:0,attacks:0,maxCombo:0,maxComboDamage:0,blocked:0,parries:0};
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
    this.dashT=0; this.dashDir=1; this.dashCD=0; this.airDashed=false;
    this.bufType=null; this.bufT=0; this.jumpBufT=0; this.dashBufT=0; this.dashBufDir=1; this.coyote=0; this.jumpCut=false;
    this.lastTapDir=0; this.lastTapFrame=-99; this.holdDir=0; this.holdT=0;
    this.anim=Math.random()*100; this.walkPhase=0; this.squashT=0; this.blinkT=80+Math.random()*120;
    this.prev={left:false,right:false,jump:false,block:false,punch:false,kick:false,special:false,dash:false};
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
function buildDisplayNames(){
  p1.name=(PROFILE.names.p1||"Gédéon").trim()||"Gédéon";
  if(mode==="2p")p2.name=(PROFILE.names.p2||"Joueur 2").trim()||"Joueur 2";
  else if(mode==="training")p2.name="Mannequin";
  else if(mode==="story")p2.name=currentStoryFight().foeName;
  else if(mode==="survival")p2.name=(survival.next&&survival.next.boss?"👑 BOSS — Vague ":"🌊 Vague ")+survival.wave;
  else if(mode==="arcade")p2.name="BOT — Étage "+arcade.stage+"/5";
  else p2.name="BOT "+DIFFS[botDiff].label.toUpperCase();
  p1.displayName=p1.name+" • "+p1.char.name;
  p2.displayName=p2.name+" • "+p2.char.name;
}

/* ---------------- ÉTAT GLOBAL ---------------- */
let state="menu",prevState="menu",mode="bot",pendingMode="bot",botDiff="moyen";
let selCharP1=PROFILE.selection.charP1||0, selCharP2=(PROFILE.selection.charP2==null?1:PROFILE.selection.charP2), selArenaId=PROFILE.selection.arena||"stadium";
let arcade={stage:1,seq:[],lastWin:false};
let story={step:1,total:STORY_CAMPAIGN.fights.length,lastWin:false};
let survival={wave:1,score:0,lastWaveScore:0,lastWin:false,next:null,carryHealth:null,carryEnergy:0,recorded:false,runCounted:false};
function roundsToWin(){ return mode==="survival"?1:SETTINGS.roundsWin; }
function fighterMatchScore(f,op){ return Math.max(0,Math.round(f.stats.damage+f.stats.maxComboDamage*4+(f.health/f.maxHealth)*120+f.roundWins*90-op.stats.damage*.35)); }
let dummyMode="immobile";
let round=1,timerSec=99,timerFrames=0,matchElapsed=0,simFrame=0,timeGlobal=0;
let introT=0,roundEndT=0,announcedFight=false,announceT=0,lastWinner=null,lastFinishType="";
let shake=0,slowmoT=0,hitStopT=0,crowdExcite=0,cinematic=0;
let particles=[],projectiles=[],floaters=[],rings=[],ghosts=[];
const playerHabits={jumps:0,blocks:0,dashes:0};
function isCombat(){ return state==="fight"||state==="training"; }
function placeMenuFighters(){ p1.x=p1.px=p1.rx=390; p2.x=p2.px=p2.rx=890; p1.y=p1.py=p1.ry=GROUND; p2.y=p2.py=p2.ry=GROUND; p1.facing=1; p2.facing=-1; }

/* ---------------- EFFETS (pool limité selon qualité) ---------------- */
function pushParticle(p){ if(particles.length>=particleCap())particles.splice(0,particles.length-particleCap()+1); particles.push(p); }
function spark(x,y,color,n,pow){ n=Math.max(1,Math.round(n*particleMul())); for(let i=0;i<n;i++){ const a=Math.random()*6.28,s=(.5+Math.random())*(pow||4); pushParticle({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,life:16+Math.random()*16,max:32,r:1.8+Math.random()*3.2,c:color,grav:.12}); } }
function dust(x,y,n){ n=Math.max(1,Math.round(n*particleMul())); for(let i=0;i<n;i++)pushParticle({x:x+(Math.random()-.5)*38,y:y-2,vx:(Math.random()-.5)*2.5,vy:-Math.random()*1.4,life:20+Math.random()*18,max:38,r:3.6+Math.random()*6.5,c:"rgba(214,205,195,.5)",grav:-.012}); }
function ring(x,y,c){ if(rings.length<24)rings.push({x,y,r:8,life:15,c}); }
function floater(x,y,text,c,big){ if(floaters.length>14)floaters.shift(); floaters.push({x,y,text,c:c||"#fff",life:52,vy:-1.1,big:!!big}); }
function confetti(){ const n=Math.round(120*particleMul()); for(let i=0;i<n;i++)pushParticle({x:Math.random()*W,y:-10-Math.random()*170,vx:(Math.random()-.5)*2,vy:1.4+Math.random()*2.6,life:125+Math.random()*90,max:215,r:2.8+Math.random()*4,c:["#ffc400","#ff2e88","#00a2ff","#00e676","#fff"][(Math.random()*5)|0],grav:.014,rect:true,rot:Math.random()*6}); }
function firework(x,y){ const c=["#ffc400","#ff2e88","#00e5ff","#69f0ae"][(Math.random()*4)|0]; spark(x,y,c,34,5.5); ring(x,y,c); }
function addGhost(f){ if(ghosts.length>36)ghosts.shift(); ghosts.push({x:f.x,y:f.y,facing:f.facing,scale:f.char.scale,bulk:f.char.bulk,c:f.skin.primary,accent:f.skin.trail,life:15,max:15,crouch:f.crouching}); }

/* ---------------- SUCCÈS / TOAST ---------------- */
let toastTimer=null;
function showToast(text){ const t=$("toast"); if(!t)return; t.textContent=text; t.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove("show"),3400); }
function unlock(id,label){ if(PROFILE.ach[id])return; PROFILE.ach[id]=true; saveProfile(); showToast("🏆 Succès débloqué : "+label); SFX.achieve(); }

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
    if(me.attackType==="punch")botQueue(Math.random()<.65?"kick":"uppercut",wait);
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
  if(me.energy>=50&&ad>265&&Math.random()<D.spec){ botPress("special"); bot.move=0; return; }
  if(ad>430){ bot.move=dir; if(Math.random()<D.dash)botPress("dash"); else if(Math.random()<D.jump)botPress("jump"); return; }
  if(ad>235){ bot.move=dir; if(Math.random()<D.jump)botPress("jump"); return; }
  if(ad>128){ bot.move=Math.random()<D.agg?dir:0; if(ad<152&&Math.random()<.4)botPress("kick"); return; }
  bot.move=0; const r=Math.random();
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
  if(pressed(f,inp,"special"))return "special";
  if(pressed(f,inp,"punch"))return !f.grounded?"airPunch":(inp.block?"uppercut":"punch");
  if(pressed(f,inp,"kick"))return !f.grounded?"airKick":(inp.block?"sweep":"kick");
  return null;
}
function startAttack(f,type){
  if(f.dead||f.downT>0)return false;
  let atkType=type;
  if(type==="special"){
    if(f.energy<50){ floater(f.x,f.y-190,"ÉNERGIE 50% REQUISE","#bfe7ff"); return false; }
    atkType=f.energy>=100?"super":"special";
    f.energy-=atkType==="super"?100:50;
  }
  const base=ATTACKS[atkType]; if(!base)return false;
  const sp=f.char.atkSpeed;
  f.attack={...base,dur:Math.max(8,Math.round(base.dur/sp)),start:Math.round(base.start/sp),end:Math.round(base.end/sp)};
  f.attackType=atkType; f.attackDur=f.attackT=f.attack.dur; f.attackId++; f.hasHit=false; f.hitConfirmed=false; f.spawned=!(atkType==="special"||atkType==="super");
  f.stats.attacks++;
  if(f.grounded&&(atkType==="kick"||atkType==="uppercut"))f.vx+=f.facing*1.3;
  if(atkType==="punch"||atkType==="airPunch")SFX.punch(); else if(atkType!=="special"&&atkType!=="super")SFX.kick();
  return true;
}
function abilitySpecs(f,isSuper){
  // Supers UNIQUES par personnage (V2.2) — chaque spec décrit un projectile.
  const dir=f.facing,op=f===p1?p2:p1,baseY=f.y-112*f.char.scale;
  const S=(o)=>Object.assign({x:f.x+dir*52,y:baseY,vx:dir*8.7,vy:0,r:18,dmg:isSuper?23:14,kind:"bolt",grav:0,life:175,pierce:false,homing:0},o||{});
  switch(f.char.id){
    case "kira":
      return isSuper
        ?[-2,-1,0,1,2].map(i=>S({y:baseY+i*17,vx:dir*11.2,vy:i*.72,r:13,dmg:7,kind:"blade"}))
        :[-1,0,1].map(i=>S({y:baseY+i*16,vx:dir*10.6,vy:i*.42,r:12.5,dmg:6,kind:"blade"}));
    case "titan":
      return isSuper
        ?[S({y:GROUND-20,vx:dir*7.9,r:38,dmg:24,kind:"ground",life:190})]
        :[S({y:GROUND-18,vx:dir*7.1,r:26,dmg:15,kind:"ground",life:185})];
    case "nova":
      return isSuper
        ?[-125,-42,42,125].map((off,i)=>S({x:clamp(op.x+off,45,W-45),y:74+i*22,vx:-off/52,vy:5.2,r:17,dmg:9,kind:"meteor",grav:.16,life:150}))
        :[S({vx:dir*8.1,r:21,dmg:14,kind:"orb",homing:.16,life:190})];
    case "godson-prime":
      return isSuper
        ?[-32,0,32].map(off=>S({y:baseY+off,vx:dir*10.4,r:off===0?24:19,dmg:off===0?13:10,kind:"royal"}))
        :[-18,18].map(off=>S({y:baseY+off,vx:dir*9.6,r:16,dmg:9,kind:"royal"}));
    default: // Gideon
      return isSuper
        ?[S({vx:dir*9.2,r:34,dmg:25,kind:"judgment",pierce:true,life:190})]
        :[S({vx:dir*10.3,r:19,dmg:14,kind:"bolt"})];
  }
}
function spawnProjectile(f){
  const isSuper=f.attackType==="super";
  const baseAtk={...(isSuper?ATTACKS.super:ATTACKS.special)};
  const specs=abilitySpecs(f,isSuper);
  specs.forEach(sp=>{
    const atk={...baseAtk,dmg:sp.dmg};
    if(specs.length>1){ atk.hitstun=Math.min(atk.hitstun,13); atk.hitstop=Math.min(atk.hitstop,55); if(sp.y!==specs[0].y)atk.knockdown=false; }
    projectiles.push({x:sp.x,y:sp.y,px:sp.x,py:sp.y,rx:sp.x,ry:sp.y,vx:sp.vx,vy:sp.vy||0,r:sp.r,owner:f,super:isSuper,life:sp.life||175,atk,kind:sp.kind||"bolt",grav:sp.grav||0,pierce:!!sp.pierce,homing:sp.homing||0});
  });
  ring(f.x+f.facing*50,f.y-112*f.char.scale,f.skin.trail); spark(f.x+f.facing*50,f.y-112*f.char.scale,f.skin.trail,specs.length>2?22:13,3);
  SFX.fire();
  floater(f.x,f.y-198*f.char.scale,(isSuper?(f.char.superName||"💥 SUPER ATTAQUE"):(f.char.specName||"✨ SPÉCIAL"))+" !",f.skin.trail,isSuper);
  if(isSuper){ shake=Math.max(shake,f.char.id==="titan"||f.char.id==="godson-prime"?10:7); cinematic=Math.max(cinematic,16); }
}
function comboSequenceName(f){
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
  const blocked=def.blocking&&def.grounded&&Math.sign(att.x-def.x)===(def.facing||1);
  if(blocked&&def.parryT>0&&typeLabel!=="super"){
    // ✨ PARRY PARFAITE : garde déclenchée à la dernière fraction de seconde
    def.parryT=0; def.parryFlashT=16; def.counterWindowT=30; def.blockStun=0; def.kvx=0;
    def.energy=Math.min(100,def.energy+12*def.char.energyGain); def.stats.parries=(def.stats.parries||0)+1; def.stats.blocked++;
    att.hitConfirmed=false; att.kvx=-att.facing*4.6; if(att.attackT>0)att.attackT=Math.max(att.attackT,11);
    spark(def.x+def.facing*44,hitY,"#ffc400",20,5); spark(def.x+def.facing*44,hitY,"#fff",10,3.4); ring(def.x+def.facing*44,hitY,"#ffc400");
    floater(def.x,def.y-196*def.char.scale,"✨ PARRY PARFAITE !","#ffc400",true);
    hitStopT=Math.max(hitStopT,92); shake=Math.max(shake,5.5); crowdExcite=110; SFX.parry();
    if(def===p1){ unlock("firstparry","Première parry parfaite"); if(def.stats.parries>=3)unlock("parry3","3 parry dans un match"); }
    return;
  }
  if(blocked){
    const chip=def.health>1?1:0;
    def.health-=chip; def.blockStun=Math.max(def.blockStun,atk.blockstun||6); def.kvx=att.facing*(atk.knock||4)*.32*def.char.knockRes;
    def.energy=Math.min(100,def.energy+5*def.char.energyGain); def.stats.blocked++; att.hitConfirmed=true;
    spark(def.x+def.facing*42,hitY,"#bfe7ff",9,3); ring(def.x+def.facing*42,hitY,"#81d4fa"); SFX.block();
    floater(def.x,def.y-184*def.char.scale,"BLOQUÉ !","#bfe7ff");
    return;
  }
  const continuing=def.comboVuln&&att.comboT>0&&def.lastHitBy===att;
  att.combo=continuing?att.combo+1:1; if(!continuing){att.comboDamage=0;att.comboSeq=[];}
  att.comboSeq.push(typeLabel); att.comboT=62;
  const scaling=Math.max(.45,1-(att.combo-1)*.08);
  const isRiposte=att.counterWindowT>0; if(isRiposte)att.counterWindowT=0;
  const bonusMul=isRiposte?1.35:(isCounter?1.25:1);
  let dmg=Math.max(1,Math.round((atk.dmg||6)*att.char.power*(att.powerMul||1)*scaling*bonusMul));
  def.health=Math.max(0,def.health-dmg);
  def.hitStun=Math.max(def.hitStun,atk.hitstun||11); def.hitFlash=SETTINGS.reduceFlash?2:6;
  def.comboVuln=true; def.lastHitBy=att; def.energy=Math.min(100,def.energy+4*def.char.energyGain);
  att.energy=Math.min(100,att.energy+(atk.energy||6)*att.char.energyGain);
  att.hitConfirmed=true; att.comboDamage+=dmg; att.stats.damage+=dmg; att.stats.hits++;
  att.stats.maxCombo=Math.max(att.stats.maxCombo,att.combo); att.stats.maxComboDamage=Math.max(att.stats.maxComboDamage,att.comboDamage);
  if(att===p1){ PROFILE.stats.bestCombo=Math.max(PROFILE.stats.bestCombo,att.combo); PROFILE.stats.bestComboDamage=Math.max(PROFILE.stats.bestComboDamage,att.comboDamage);
    if(att.combo>=5)unlock("combo5","Combo x5"); if(att.comboDamage>=30)unlock("combo30","30 dégâts en un combo"); }
  def.kvx=att.facing*(atk.knock||4)*def.char.knockRes;
  if(atk.launcher){ def.vy=-atk.launcher; def.grounded=false; def.juggleT=36; }
  else if(!def.grounded){ def.vy=Math.min(def.vy,-3.7+Math.min(2,att.combo*.22)); def.juggleT=Math.max(def.juggleT,22); }
  else if(atk.knockdown){ def.vy=-5; def.grounded=false; def.knockdownPending=true; }
  else if(atk.hard&&def.grounded)def.vy=-2.6;
  spark(midX,hitY,atk.hard?att.skin.trail:"#fff59d",atk.hard?22:14,atk.hard?6:4.4); spark(midX,hitY,"#ff5252",7,3.2);
  floater(def.x,def.y-184*def.char.scale,(isRiposte?"Riposte ! -":isCounter?"CONTRE ! -":"-")+dmg,isRiposte?"#ffc400":isCounter?"#ff9100":(atk.hard?att.skin.trail:"#ffffff"),atk.hard||isCounter||isRiposte);
  const seqName=comboSequenceName(att); if(att.combo>=3&&seqName)floater(att.x,att.y-212*att.char.scale,seqName,"#ffc400");
  shake=Math.max(shake,(atk.hard?8.5:4.6)*((isCounter||isRiposte)?1.3:1)); crowdExcite=95;
  hitStopT=Math.max(hitStopT,(atk.hitstop||45)*((isCounter||isRiposte)?1.45:1));
  if(isCounter||isRiposte)SFX.counter(); else SFX.hit(!!atk.hard);
  if(def.health<=0){
    if(state==="training"){ spark(def.x,hitY,"#ffffff",30,6); floater(def.x,def.y-220,"MANNEQUIN RÉINITIALISÉ","#69f0ae",true); def.health=def.maxHealth; def.comboVuln=false; att.combo=0; att.comboT=0; }
    else { if(att===p1&&(typeLabel==="super"))unlock("superko","K.O. par SUPER attaque"); endRound(att,true,typeLabel); }
  }
}
function tryMeleeHit(f,op){
  if(f.hasHit||!f.attack||!f.attack.range||op.dead||op.downT>0||op.invulnT>0||op.dashT>7)return;
  const elapsed=f.attackDur-f.attackT;
  if(elapsed<f.attack.start||elapsed>f.attack.end)return;
  const dx=op.x-f.x, range=f.attack.range*f.char.reach+16;
  const vTol=f.attack.launcher?128:(f.attack.low?52:102);
  if(Math.sign(dx)===f.facing&&Math.abs(dx)<range&&Math.abs(op.y-f.y)<vTol){
    f.hasHit=true; applyDamage(f,op,f.attack,f.attackType);
  }
}
function clampX(f){ f.x=clamp(f.x,55,W-55); }
function startDash(f,dir){
  if(f.dashCD>0||f.dead||f.downT>0||(!f.grounded&&f.airDashed))return;
  f.dashT=12; f.dashDir=dir||f.facing; f.dashCD=f.char.dashCD; f.dashBufT=0;
  if(!f.grounded){ f.airDashed=true; f.vy=Math.min(f.vy,0); }
  f.attackT=0; f.attackType=null; f.attack=null;
  dust(f.x,f.y,6); SFX.dash(); if(f===p1)playerHabits.dashes++;
}
function updateFighter(f,inp,op){
  f.px=f.x; f.py=f.y; f.anim++;
  if(f.hitFlash>0)f.hitFlash--; if(f.squashT>0)f.squashT--; if(f.dashCD>0)f.dashCD--; if(f.invulnT>0)f.invulnT--; if(f.juggleT>0)f.juggleT--;
  if(f.bufT>0)f.bufT--; if(f.jumpBufT>0)f.jumpBufT--; if(f.dashBufT>0)f.dashBufT--;
  if(f.parryT>0)f.parryT--; if(f.parryFlashT>0)f.parryFlashT--; if(f.counterWindowT>0)f.counterWindowT--;
  if(f.comboT>0){ f.comboT--; if(f.comboT===0){f.combo=0;f.comboDamage=0;f.comboSeq=[];} }
  if(--f.blinkT<-7)f.blinkT=90+Math.random()*140;
  if(f.dead){ f.koT++; f.vy+=.85; f.y+=f.vy; f.x+=f.kvx; f.kvx*=.9; if(f.y>=GROUND){ if(!f.grounded)dust(f.x,GROUND,8); f.y=GROUND;f.vy=0;f.grounded=true; } clampX(f); Object.assign(f.prev,inp); return; }
  const wasHitStun=f.hitStun>0;
  if(f.hitStun>0)f.hitStun--; if(f.blockStun>0)f.blockStun--;
  if(wasHitStun&&f.hitStun===0&&f.grounded&&f.downT<=0)f.comboVuln=false;
  if(f.downT>0){ f.downT--; if(f.downT===0){f.invulnT=13;f.comboVuln=false;f.squashT=6;} }
  if(f.dashT>0){ f.dashT--; if(simFrame%2===0)addGhost(f); }
  if(f.attackT>0){
    f.attackT--; const el=f.attackDur-f.attackT;
    if(!f.spawned&&f.attack&&el>=f.attack.start){ f.spawned=true; spawnProjectile(f); }
    tryMeleeHit(f,op);
    if(f.attackT===0){ f.attackType=null; f.attack=null; f.hitConfirmed=false; }
  }
  const canAct=isCombat()&&f.hitStun<=0&&f.blockStun<=0&&f.downT<=0;
  // --- Tampons d’entrée (fluidité pro) ---
  if(f===p1){ if(pressed(f,inp,"jump"))playerHabits.jumps++; if(inp.block&&simFrame%24===0)playerHabits.blocks++; }
  if(pressed(f,inp,"jump"))f.jumpBufT=9;
  if(pressed(f,inp,"block")&&f.grounded&&f.attackT<=0&&f.downT<=0)f.parryT=9; // fenêtre de parry : 9 frames (~150 ms)
  let tapDir=0; if(pressed(f,inp,"left"))tapDir=-1; if(pressed(f,inp,"right"))tapDir=1;
  if(tapDir!==0){ if(f.lastTapDir===tapDir&&simFrame-f.lastTapFrame<=18){ f.dashBufT=9; f.dashBufDir=tapDir; } f.lastTapDir=tapDir; f.lastTapFrame=simFrame; }
  if(pressed(f,inp,"dash")){ f.dashBufT=9; f.dashBufDir=inp.left?-1:(inp.right?1:f.facing); }
  const want=desiredAttack(f,inp); if(want){ f.bufType=want; f.bufT=10; }
  f.crouching=!!inp.block&&f.grounded&&f.attackT<=0&&f.dashT<=0;
  f.blocking=canAct&&f.crouching;
  if(canAct&&f.dashBufT>0&&f.dashCD<=0&&f.attackT<=0)startDash(f,f.dashBufDir);
  // --- Attaque tamponnée / annulation de combo ---
  if(canAct&&f.bufT>0&&f.bufType&&f.dashT<=3){
    if(f.attackT<=0){ if(startAttack(f,f.bufType))f.bufT=0; else f.bufT=0; }
    else if(f.hitConfirmed&&f.attack){ const el=f.attackDur-f.attackT; const target=f.bufType==="special"?"special":f.bufType;
      if(el>=f.attack.end&&(CANCELS[f.attackType]||[]).includes(target)){ f.vx+=f.facing*1.6; if(startAttack(f,f.bufType))f.bufT=0; } }
  }
  // --- Saut : coyote-time + hauteur variable ---
  if(f.grounded)f.coyote=6; else if(f.coyote>0)f.coyote--;
  if(canAct&&f.jumpBufT>0&&(f.grounded||f.coyote>0)&&!f.crouching&&f.attackT<=0&&f.dashT<=0){
    f.vy=-f.char.jump; f.grounded=false; f.coyote=0; f.jumpBufT=0; f.jumpCut=false; f.squashT=7; dust(f.x,GROUND,6); SFX.jump();
  }
  if(!inp.jump&&!f.grounded&&f.vy<-7&&!f.jumpCut){ f.vy*=.55; f.jumpCut=true; }
  // --- Déplacement doux + course progressive ---
  let move=0; if(canAct&&!f.crouching&&!(f.attackT>0&&f.grounded)){ if(inp.left)move-=1; if(inp.right)move+=1; }
  if(move!==0&&move===f.holdDir)f.holdT++; else {f.holdDir=move;f.holdT=0;}
  const runMul=f.grounded?1+Math.min(.3,f.holdT/160):1;
  const botMul=(f===p2&&(mode==="bot"||mode==="arcade"||mode==="story"||mode==="survival"||(mode==="training"&&dummyMode==="combat")))?currentDiff().speed:1;
  let target=move*4.7*f.char.speed*botMul*runMul*(f.grounded?1:.8);
  if(f.dashT>0)target=f.dashDir*12.4*f.char.speed;
  f.vx+=(target-f.vx)*(f.dashT>0?.65:(f.grounded?.42:.13));
  if(move!==0&&f.grounded)f.walkPhase+=.25*runMul;
  // --- Physique ---
  let grav=f.char.gravity; if(f.juggleT>0)grav*=.55; if(f.dashT>0&&!f.grounded)grav*=.25; if(inp.block&&!f.grounded)grav+=.5;
  f.vy+=grav; if(f.vy>19)f.vy=19;
  f.x+=f.vx+f.kvx; f.y+=f.vy; f.kvx*=(f.grounded?.76:.94);
  if(f.y>=GROUND){
    if(!f.grounded){ if(f.vy>5)dust(f.x,GROUND,6); f.squashT=8; f.airDashed=false;
      if(f.knockdownPending&&f.health>0){ f.knockdownPending=false; f.downT=42; f.comboVuln=false; ring(f.x,GROUND-4,"#fff"); }
      if(f.hitStun>0&&!f.knockdownPending)f.comboVuln=false;
    }
    f.y=GROUND; f.vy=0; f.grounded=true;
  } else f.grounded=false;
  clampX(f);
  if(f.grounded&&f.attackT<=0&&f.dashT<=0&&isCombat())f.facing=op.x>=f.x?1:-1;
  if(isCombat())f.energy=Math.min(100,f.energy+.016*f.char.energyGain);
  Object.assign(f.prev,inp);
}
function separate(){
  const dx=p2.x-p1.x,ad=Math.abs(dx),minD=58*(p1.char.bulk+p2.char.bulk)/2;
  if(ad<minD&&Math.abs(p1.y-p2.y)<105&&!p1.dead&&!p2.dead&&p1.downT<=0&&p2.downT<=0){
    const push=(minD-ad)/2,s=dx>=0?1:-1; p1.x-=push*s; p2.x+=push*s; clampX(p1); clampX(p2);
  }
}
function updateProjectiles(){
  // Chocs de projectiles entre eux (un projectile « perforant » traverse les autres)
  const clashRemove=new Set();
  for(let i=0;i<projectiles.length;i++)for(let j=i+1;j<projectiles.length;j++){
    const a=projectiles[i],b=projectiles[j];
    if(a.owner!==b.owner&&Math.abs(a.x-b.x)<a.r+b.r&&Math.abs(a.y-b.y)<46){
      spark((a.x+b.x)/2,(a.y+b.y)/2,"#ffffff",24,5.2); ring((a.x+b.x)/2,(a.y+b.y)/2,"#fff"); SFX.boom();
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
    if(qualityLevel>0||simFrame%2===0)pushParticle({x:pr.x,y:pr.y+(Math.random()-.5)*11,vx:-pr.vx*.04,vy:(Math.random()-.5)*.65,life:14,max:14,r:pr.r*.3,c:pr.owner.skin.trail,grav:0});
    let remove=pr.life<=0||pr.x<-55||pr.x>W+55||pr.y>H+70;
    // Explosion des météores au sol
    if(!remove&&pr.kind==="meteor"&&pr.y>=GROUND-13){
      spark(pr.x,GROUND-8,pr.owner.skin.trail,20,5.2); ring(pr.x,GROUND-8,"#fff"); dust(pr.x,GROUND,7); SFX.boom();
      if(!def.dead&&def.downT<=0&&def.invulnT<=0&&def.dashT<=7&&Math.abs(pr.x-def.x)<76&&def.y>GROUND-95)applyDamage(pr.owner,def,pr.atk,pr.super?"super":"special");
      remove=true;
    }
    if(!remove&&!def.dead&&def.downT<=0&&def.invulnT<=0&&def.dashT<=7&&Math.abs(pr.x-def.x)<pr.r+34&&Math.abs(pr.y-(def.y-86*def.char.scale))<94*def.char.scale){
      applyDamage(pr.owner,def,pr.atk,pr.super?"super":"special"); spark(pr.x,pr.y,pr.owner.skin.trail,25,6); ring(pr.x,pr.y,"#fff"); SFX.boom(); remove=true;
    }
    if(remove&&projectiles[i]===pr)projectiles.splice(i,1);
  }
}
function updateEffects(){
  for(let i=particles.length-1;i>=0;i--){ const p=particles[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=(p.grav||0); if(--p.life<=0)particles.splice(i,1); }
  for(let i=floaters.length-1;i>=0;i--){ const f=floaters[i]; f.y+=f.vy; if(--f.life<=0)floaters.splice(i,1); }
  for(let i=rings.length-1;i>=0;i--){ const r=rings[i]; r.r+=5.4; if(--r.life<=0)rings.splice(i,1); }
  for(let i=ghosts.length-1;i>=0;i--){ if(--ghosts[i].life<=0)ghosts.splice(i,1); }
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
function resetFighterStats(){ fighters.forEach(f=>f.stats={damage:0,hits:0,attacks:0,maxCombo:0,maxComboDamage:0,blocked:0,parries:0}); }
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
  projectiles=[]; floaters=[]; rings=[]; ghosts=[]; bot.queue=[]; bot.press={}; bot.lastFollowId=-1; bot.move=0; bot.blockT=0;
  timerSec=SETTINGS.roundTime; timerFrames=0; state="intro"; introT=132; announcedFight=false; lastWinner=null; cinematic=70;
  if(typeof buildPips==="function")buildPips();
  $("roundLabel").textContent=mode==="arcade"?("ARCADE "+arcade.stage+"/5 • ROUND "+round):mode==="story"?("HISTOIRE "+story.step+"/"+story.total+" • ROUND "+round):mode==="survival"?("SURVIE • VAGUE "+survival.wave):("ROUND "+round);
  announce(mode==="survival"?("VAGUE "+survival.wave):("ROUND "+round),mode==="arcade"?("Étage "+arcade.stage+" / 5"):mode==="story"?currentStoryFight().chapter:mode==="survival"?("Score : "+survival.score+" • Un seul round !"):"Prêt… ?"); SFX.beep();
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
  buildDisplayNames();
  if(mode==="survival"&&survival.wave===1&&!survival.runCounted){ survival.runCounted=true; PROFILE.stats.survivalRuns=(PROFILE.stats.survivalRuns||0)+1; saveProfile(); }
  p1.roundWins=0; p2.roundWins=0; round=1; matchElapsed=0; resetFighterStats();
  playerHabits.jumps=0; playerHabits.blocks=0; playerHabits.dashes=0;
  $("nameP1").innerHTML="🟦 "+escapeHTML(p1.displayName);
  $("nameP2").innerHTML=(mode==="2p"?"🟥 ":"🤖 ")+escapeHTML(p2.displayName);
  $("hud").style.display="grid";
  $("trainingBar").style.display=mode==="training"?"flex":"none";
  $("touchUI").style.display=(touchEnabled||("ontouchstart" in window&&mode!=="2p"))?"flex":"none";
  if(mode==="training"){
    p1.reset(); p2.reset(); projectiles=[]; timerSec=0; state="training"; announceT=95;
    $("roundLabel").textContent="ENTRAÎNEMENT";
    announce("ENTRAÎNEMENT","Teste tes combos — vie et temps illimités");
    if(typeof snapHUD==="function")snapHUD();
    if(typeof resetCamera==="function")resetCamera(true);
  } else resetRound();
  startMusic();
}
function endRound(winner,byKO,finishType){
  if(state!=="fight")return;
  state="roundEnd"; roundEndT=168; lastWinner=winner||null; lastFinishType=finishType||(byKO?"ko":"temps");
  projectiles=[];
  if(winner){ winner.roundWins++; winner.victory=true; const loser=winner===p1?p2:p1;
    if(byKO){ loser.dead=true; loser.vy=-6.5; loser.kvx=winner.facing*7; } }
  if(byKO){ announce("K.O. !",finishType==="super"?"FINISH PAR SUPER ATTAQUE !":"",true); SFX.ko(); slowmoT=55; shake=Math.max(shake,13); cinematic=110; }
  else announce(winner?"TEMPS ÉCOULÉ":"ÉGALITÉ !",winner?winner.name+" remporte le round":"Aucun point marqué");
  crowdExcite=170; firework(240+Math.random()*800,150+Math.random()*90);
  if(typeof buildPips==="function")buildPips();
}
function finishMatch(winner){
  state="matchEnd"; hideAnnounce(); stopMusic(); SFX.win(); confetti(); cinematic=0;
  if(mode==="bot"||mode==="arcade"||mode==="story"||mode==="survival"){
    PROFILE.stats.matches++;
    if(winner===p1){ PROFILE.stats.wins++; unlock("firstwin","Première victoire"); if(botDiff==="difficile"&&mode==="bot")unlock("hardwin","Vaincre le bot Difficile"); }
    else PROFILE.stats.losses++;
  } else if(mode==="2p")PROFILE.stats.matches++;
  arcade.lastWin=(winner===p1);
  if(mode==="arcade"&&winner===p1&&arcade.stage>=5){ PROFILE.stats.arcadeClears++; unlock("arcade","Champion du mode Arcade"); }
  if(mode==="story"){
    story.lastWin=(winner===p1);
    if(winner===p1){
      if(story.step<story.total)PROFILE.story.progressStep=Math.max(PROFILE.story.progressStep||1,story.step+1);
      else {
        PROFILE.story.completed=true; PROFILE.story.clears=(PROFILE.story.clears||0)+1; PROFILE.story.progressStep=1;
        PROFILE.unlocks.prime=true;
        unlock("storych1","Finir le Chapitre 1 de l’Histoire");
        unlock("primeunlock","GODSON PRIME débloqué");
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
  saveProfile();
  if(typeof showEndScreen==="function")showEndScreen(winner);
}
function updateGameLogic(){
  simFrame++; timeGlobal++;
  if(state==="intro"){
    introT--; updateFighter(p1,INPUT_BLANK,p2); updateFighter(p2,INPUT_BLANK,p1); separate();
    if(introT===56&&!announcedFight){ announcedFight=true; announce("COMBATTEZ !",""); SFX.fight(); }
    if(introT<=0){ state="fight"; hideAnnounce(); cinematic=0; }
  }
  else if(state==="fight"||state==="training"){
    matchElapsed+=1/60;
    const i1=getInputP1();
    let i2;
    if(mode==="2p")i2=getInputP2(); else if(mode==="training")i2=getDummyInput(); else { updateBot(); i2=bot.input; }
    updateFighter(p1,i1,p2); updateFighter(p2,i2,p1); separate(); updateProjectiles();
    if(state==="fight"&&SETTINGS.roundTime>0){
      timerFrames++; if(timerFrames>=60){ timerFrames=0; timerSec--; if(timerSec<=10&&timerSec>0)SFX.beep();
        if(timerSec<=0){ timerSec=0; endRound(p1.health===p2.health?null:(p1.health>p2.health?p1:p2),false,"temps"); } }
    }
    if(state==="training"&&announceT>0){ if(--announceT===0)hideAnnounce(); }
  }
  else if(state==="roundEnd"){
    updateFighter(p1,INPUT_BLANK,p2); updateFighter(p2,INPUT_BLANK,p1); separate();
    if(roundEndT===108&&lastWinner)announce(lastWinner.name.toUpperCase()+" GAGNE !","Round "+round+" terminé");
    if(roundEndT===70)firework(200+Math.random()*880,140+Math.random()*100);
    if(--roundEndT<=0){
      if(lastWinner&&lastWinner.roundWins>=roundsToWin())finishMatch(lastWinner);
      else { if(lastWinner)round++; resetRound(); }
    }
  }
  else if(state==="menu"||state==="vs"||state==="matchEnd"||state==="select"||state==="scene"){
    p1.anim++; p2.anim++; p1.px=p1.rx=p1.x; p1.py=p1.ry=p1.y; p2.px=p2.rx=p2.x; p2.py=p2.ry=p2.y;
    p1.facing=1; p2.facing=-1;
    if(state==="matchEnd"&&Math.random()<.012)confetti();
  }
  updateEffects();
}
function escapeHTML(s){ return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

/* Préparation initiale */
applyQualitySettings();
applyCharacterTo(p1,selCharP1); applyCharacterTo(p2,selCharP2<0?2:selCharP2);
buildDisplayNames(); placeMenuFighters();
