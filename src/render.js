"use strict";
/* =====================================================================
   Godson FURY ARENA V5.3 — GRAPHISMES AAA II, M1 SIGNATURE & ROSTER 41
   Caméra dynamique, interpolation écran haute fréquence, 3 arènes.
   Signé : Gideon - Godson
   ===================================================================== */
let renderTicker=0,renderDtFactor=1,arenaCache={},vignetteGrad=null;
const glowCache=new Map();
const impactSpriteCache=new Map();
const gradientCache=new Map();
const RENDER_PIPELINE=["background","floor","shadows","entities","projectiles","effects","post"];
const renderStats={frame:0,passesRun:[],gradientHits:0,gradientMisses:0,gradientCacheSize:0,lastPost:"",motionSamples:0,ambientPeople:0,textCacheSize:0,arenaMood:"crepuscule",moodStars:0,moodCelestial:"",signatureVfx:0,lastSignatureVfx:"",fpsEstimate:60,frameBudgetOk:true,frameMs:0,logicMs:0,renderMs:0,perfTier:"ultra",effectScale:1,onlineFrame:0,onlineStalls:0,onlineDesync:false,speedScale:1,portraits:0,outfitDetails:0,materialDetails:0,torsoPaint:0,rosterVisible:41,introBanners:0,ambientMotes:0,foregroundDepth:"",rimLight:"",cylinderShading:false,facePaint:0,artDirection:"Graphismes AAA II V5.3",humanProfiles:0,lastHumanProfile:"",lastFacialExpression:"focus",humanMotionSamples:0,gazeX:0,gazeY:0,hairSway:0,fatigue:0,billboardAlpha:1,floaterSpread:0,spotlightX:-1,dynamicShadows:0,shadowLayers:0,shadowDirection:"",shadowHeightFactor:1,floorLightPools:0,floorReflections:0,boardOutfits:0,boardOutfit:"",impactBurstsDrawn:0,impactSpriteCacheSize:0,lastImpactFx:""};
const FLOOR_THEMES={
  stadium:{top:"#37474f",mid:"#263238",bot:"#0b0f26",line:"#00e5ff",grade:"rgba(255,138,60,.16)"},
  tokyo:{top:"#1a2238",mid:"#101728",bot:"#050816",line:"#ff2e88",grade:"rgba(80,90,255,.15)"},
  temple:{top:"#8d6e63",mid:"#6d4c41",bot:"#332016",line:"#ffd54f",grade:"rgba(255,205,90,.13)"},
  Libreville:{top:"#d7a86a",mid:"#b9844f",bot:"#65452d",line:"#4dd0e1",grade:"rgba(255,130,70,.15)"}
};
/* Arena Moods V2.8 (Kenzo) : chaque lieu garde son identité, mais la lumière,
   le ciel, le sol et l’atmosphère changent réellement selon l’heure choisie. */
const ARENA_MOOD_THEMES={
  stadium:{
    jour:{sky:[[0,"#1976d2"],[.42,"#64b5f6"],[.72,"#ffe9a8"],[1,"#263238"]],grade:"rgba(120,205,255,.12)",overlay:"rgba(255,246,190,.13)",horizon:"rgba(255,224,130,.18)",floorShift:24,celestial:"sun",stars:0,vignette:.32},
    crepuscule:{sky:[[0,"#1a237e"],[.38,"#6a1b9a"],[.63,"#ff7043"],[1,"#21122e"]],grade:"rgba(255,138,60,.16)",overlay:"rgba(255,110,64,.08)",horizon:"rgba(255,150,70,.24)",floorShift:0,celestial:"sunLow",stars:12,vignette:.42},
    nuit:{sky:[[0,"#01030f"],[.42,"#0b1640"],[.74,"#293064"],[1,"#050716"]],grade:"rgba(55,85,255,.17)",overlay:"rgba(2,7,35,.20)",horizon:"rgba(95,145,255,.13)",floorShift:-20,celestial:"moon",stars:76,vignette:.5}
  },
  tokyo:{
    jour:{sky:[[0,"#31547f"],[.42,"#6f9fc4"],[.74,"#c4d9e8"],[1,"#111743"]],grade:"rgba(145,205,255,.12)",overlay:"rgba(230,244,255,.10)",horizon:"rgba(255,255,255,.12)",floorShift:26,celestial:"sun",stars:0,vignette:.34},
    crepuscule:{sky:[[0,"#170f38"],[.42,"#51245e"],[.74,"#b84a6e"],[1,"#0a0d24"]],grade:"rgba(255,80,150,.15)",overlay:"rgba(90,25,80,.10)",horizon:"rgba(255,110,110,.18)",floorShift:-4,celestial:"sunLow",stars:18,vignette:.44},
    nuit:{sky:[[0,"#02061f"],[.45,"#111743"],[.72,"#3b1454"],[1,"#0a0d24"]],grade:"rgba(80,90,255,.15)",overlay:"rgba(2,5,28,.10)",horizon:"rgba(255,46,136,.12)",floorShift:0,celestial:"moon",stars:58,vignette:.48}
  },
  temple:{
    jour:{sky:[[0,"#2196f3"],[.42,"#81d4fa"],[.7,"#ffe9a8"],[1,"#5d4037"]],grade:"rgba(255,205,90,.13)",overlay:"rgba(255,248,205,.08)",horizon:"rgba(255,224,130,.15)",floorShift:10,celestial:"sun",stars:0,vignette:.34},
    crepuscule:{sky:[[0,"#31456e"],[.42,"#9a5570"],[.72,"#ffb37a"],[1,"#4e342e"]],grade:"rgba(255,145,80,.16)",overlay:"rgba(255,130,65,.10)",horizon:"rgba(255,180,90,.24)",floorShift:-10,celestial:"sunLow",stars:16,vignette:.43},
    nuit:{sky:[[0,"#030e24"],[.42,"#102f57"],[.74,"#405f7d"],[1,"#211711"]],grade:"rgba(70,110,255,.15)",overlay:"rgba(2,8,30,.18)",horizon:"rgba(255,180,80,.12)",floorShift:-26,celestial:"moon",stars:84,vignette:.5}
  },
  Libreville:{
    jour:{sky:[[0,"#0f6fb4"],[.4,"#4db6e8"],[.72,"#c8f2ff"],[1,"#087f9d"]],grade:"rgba(110,220,255,.12)",overlay:"rgba(255,250,205,.09)",horizon:"rgba(255,255,255,.16)",floorShift:18,celestial:"sun",stars:0,vignette:.32},
    crepuscule:{sky:[[0,"#24406e"],[.34,"#7c3a6e"],[.58,"#e85d75"],[.76,"#ff9e57"],[1,"#0b536d"]],grade:"rgba(255,130,70,.15)",overlay:"rgba(255,120,60,.07)",horizon:"rgba(255,158,87,.25)",floorShift:0,celestial:"sunLow",stars:10,vignette:.42},
    nuit:{sky:[[0,"#010817"],[.4,"#082744"],[.72,"#145374"],[1,"#032f42"]],grade:"rgba(45,100,255,.16)",overlay:"rgba(1,8,32,.20)",horizon:"rgba(120,210,255,.13)",floorShift:-28,celestial:"moon",stars:88,vignette:.5}
  }
};
function arenaMoodTheme(){ const byArena=ARENA_MOOD_THEMES[currentArena.id]||ARENA_MOOD_THEMES.stadium; return byArena[currentArenaMood]||byArena.crepuscule; }
function cachedLinearGradient(key,x0,y0,x1,y1,stops){
  const hit=gradientCache.get(key);
  if(hit){ renderStats.gradientHits++; return hit; }
  if(gradientCache.size>110)gradientCache.clear();
  const g=ctx.createLinearGradient(x0,y0,x1,y1);
  stops.forEach(s=>g.addColorStop(s[0],s[1]));
  gradientCache.set(key,g); renderStats.gradientMisses++; renderStats.gradientCacheSize=gradientCache.size;
  return g;
}
function runRenderPass(name,fn){ renderStats.passesRun.push(name); fn(); }

/* ---------------- ANIMATION HUMAINE V2.5 (Kenzo) ----------------
   La simulation reste à 60 Hz, mais toutes les poses sont filtrées au
   rythme réel de l'écran : respiration, transfert de poids, retournement,
   garde, douleur et course ne changent donc plus par paliers visibles. */
function smoothMotionValue(current,target,rate){
  const dt=clamp(renderDtFactor||1,.2,3),k=1-Math.exp(-rate*dt*.62);
  return current+(target-current)*k;
}
function easeOutCubic(t){ return 1-Math.pow(1-clamp(t,0,1),3); }
function easeInOutCubic(t){ t=clamp(t,0,1); return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2; }
function attackMotionCurve(elapsed,start,duration){
  if(!duration||duration<=0)return 0;
  const windup=Math.max(1,start||1),strikeEnd=Math.min(duration,windup+Math.max(2,(duration-windup)*.34));
  if(elapsed<windup)return -.2*easeInOutCubic(elapsed/windup); // anticipation : le membre recule avant de frapper
  if(elapsed<=strikeEnd)return -.2+1.2*easeOutCubic((elapsed-windup)/Math.max(1,strikeEnd-windup));
  return 1-easeInOutCubic((elapsed-strikeEnd)/Math.max(1,duration-strikeEnd)); // récupération / follow-through
}
function fighterMotion(f){
  if(!f.motion)f.motion={face:f.facing||1,lean:0,run:0,air:f.grounded?0:1,guard:0,hurt:0,dash:0,breath:(f.id||1)*1.7,head:0,weight:0,squash:0,attack:0,gazeX:0,gazeY:0,headLag:0,hairSway:0,clothSway:0,pelvisRoll:0,shoulderRoll:0,fatigue:0,mouthOpen:0,browTension:0,prevVX:0}; 
  const m=f.motion,op=f===p1?p2:p1,apparentVX=(f.vx||0)+(f.kvx||0),localSpeed=apparentVX*(f.facing||1);
  if(m.gazeX==null){ m.gazeX=0; m.gazeY=0; m.headLag=0; m.hairSway=0; m.clothSway=0; m.pelvisRoll=0; m.shoulderRoll=0; m.fatigue=0; m.mouthOpen=0; m.browTension=0; m.prevVX=apparentVX; }
  m.face=smoothMotionValue(m.face,f.facing||1,15);
  if(Math.sign(m.face)!==Math.sign(f.facing||1)&&Math.abs(m.face)<.2)m.face=(f.facing||1)*.2;
  m.lean=smoothMotionValue(m.lean,clamp(localSpeed*.014,-.13,.16)+(f.dashT>0?.06:0),10);
  m.run=smoothMotionValue(m.run,f.grounded?clamp(Math.abs(apparentVX)/6.1,0,1.25):0,9);
  m.air=smoothMotionValue(m.air,f.grounded?0:1,13);
  m.guard=smoothMotionValue(m.guard,f.blocking?1:0,16);
  m.hurt=smoothMotionValue(m.hurt,f.hitStun>0?1:0,f.hitStun>0?30:8);
  m.dash=smoothMotionValue(m.dash,f.dashT>0?1:0,18);
  const hpRatio=f.maxHealth?f.health/f.maxHealth:1;
  m.breath+=clamp(renderDtFactor||1,.2,3)*(.055+(1-hpRatio)*.05+m.run*.055+(f.blocking?.015:0));
  m.weight=smoothMotionValue(m.weight,Math.sin((f.walkPhase||0)*2)*(.45+m.run*.8),18);
  m.head=smoothMotionValue(m.head,clamp(((op&&op.ry!=null?op.ry:f.ry)-f.ry)*.0016,-.16,.16),7);
  m.squash=smoothMotionValue(m.squash,f.squashT>3?-1:(f.squashT>0?.55:0),15);
  const elapsed=f.attackT>0?f.attackDur-f.attackT:0;
  m.attack=f.attack?attackMotionCurve(elapsed,f.attack.start||4,f.attackDur||elapsed+1):0;
  /* Humanité++ : le regard cherche l'adversaire, la tête accuse un léger
     retard sur le buste, cheveux/vêtements suivent l'inertie et la fatigue
     devient visible dans la respiration comme dans les épaules. */
  const opX=op?(op.rx!=null?op.rx:op.x):f.rx,opY=op?(op.ry!=null?op.ry:op.y):f.ry;
  const accel=apparentVX-(m.prevVX||0);
  m.gazeX=smoothMotionValue(m.gazeX,clamp((opX-f.rx)*(f.facing||1)/420,-1,1),10);
  m.gazeY=smoothMotionValue(m.gazeY,clamp((opY-f.ry)/190,-1,1),9);
  m.headLag=smoothMotionValue(m.headLag,clamp(-accel*.5-localSpeed*.22,-7,7),8);
  m.prevVX=lerp(m.prevVX||0,apparentVX,.38);
  m.hairSway=smoothMotionValue(m.hairSway,clamp(-localSpeed*1.05-accel*.16+(f.vy||0)*.2+Math.sin(m.breath*.72)*.55,-11,11),6.5);
  m.clothSway=smoothMotionValue(m.clothSway,clamp(m.hairSway*.62-m.dash*3,-8,8),4.6);
  const gaitRoll=Math.sin((f.walkPhase||0)*2)*m.run*3.1;
  m.pelvisRoll=smoothMotionValue(m.pelvisRoll,gaitRoll+m.attack*1.2-m.hurt*1.1,13);
  m.shoulderRoll=smoothMotionValue(m.shoulderRoll,-gaitRoll*.78+m.attack*1.7+m.guard*.45-m.hurt*1.4,13);
  const fatigueTarget=clamp((1-hpRatio)*.9+(f.hitStun>0?.16:0)+m.run*.07,0,1);
  m.fatigue=smoothMotionValue(m.fatigue,fatigueTarget,5.5);
  const mouthTarget=f.dead||f.downT>0?.38:f.hitStun>0?1:f.attack&&m.attack>.22?.78:f.victory?.24:m.fatigue>.62?.34:.06;
  m.mouthOpen=smoothMotionValue(m.mouthOpen,mouthTarget,14);
  const browTarget=f.victory&&!f.dead?-.55:f.hitStun>0?1:f.attack?.82:f.blocking?.64:m.fatigue>.65?.38:.12;
  m.browTension=smoothMotionValue(m.browTension,browTarget,13);
  renderStats.motionSamples=(renderStats.motionSamples||0)+1;
  renderStats.humanMotionSamples=(renderStats.humanMotionSamples||0)+1;
  renderStats.gazeX=Math.round(m.gazeX*100)/100; renderStats.gazeY=Math.round(m.gazeY*100)/100;
  renderStats.hairSway=Math.round(m.hairSway*10)/10; renderStats.fatigue=Math.round(m.fatigue*100)/100;
  return m;
}
const textWidthCache=new Map();
function cachedTextWidth(text,font){
  const key=font+"|"+text; let w=textWidthCache.get(key);
  if(w==null){ const old=ctx.font; ctx.font=font; w=ctx.measureText(text).width; ctx.font=old; if(textWidthCache.size>90)textWidthCache.clear(); textWidthCache.set(key,w); }
  renderStats.textCacheSize=textWidthCache.size; return w;
}
function glowSprite(color){
  if(glowCache.has(color))return glowCache.get(color);
  const c=document.createElement("canvas"); c.width=c.height=128; const g=c.getContext("2d");
  const gr=g.createRadialGradient(64,64,2,64,64,64); gr.addColorStop(0,"#ffffff"); gr.addColorStop(.22,color); gr.addColorStop(1,"rgba(0,0,0,0)");
  g.fillStyle=gr; g.fillRect(0,0,128,128); glowCache.set(color,c); return c;
}
function rebuildArenaCache(){
  arenaCache={};
  const mk=(stops,y1)=>{ const g=ctx.createLinearGradient(0,0,0,y1||H); stops.forEach(s=>g.addColorStop(s[0],s[1])); return g; };
  const mood=arenaMoodTheme(),theme=FLOOR_THEMES[currentArena.id]||FLOOR_THEMES.stadium,shift=mood.floorShift||0;
  arenaCache.sky=mk(mood.sky);
  arenaCache.floor=cachedLinearGradient("floor:"+currentArena.id+":"+currentArenaMood,0,GROUND-22,0,H+180,[[0,shade(theme.top,shift)],[.25,shade(theme.mid,shift)],[1,shade(theme.bot,Math.round(shift*.55))]]);
  arenaCache.billboard=cachedLinearGradient("billboard",468,14,812,96,[[0,"#00a2ff"],[.5,"#7c3aed"],[1,"#ff2e88"]]);
  arenaCache.grade=mood.grade; arenaCache.moodTheme=mood;
  renderStats.arenaMood=currentArenaMood;
  vignetteGrad=ctx.createRadialGradient(W/2,H/2,H*.38,W/2,H/2,H*.86);
  vignetteGrad.addColorStop(0,"rgba(0,0,0,0)"); vignetteGrad.addColorStop(1,"rgba(0,0,0,"+(mood.vignette||.42)+")");
}
function setArenaById(id,moodPreference){
  const a=ARENAS.find(x=>x.id===id)||ARENAS[0],resolvedMood=resolveArenaMood(a.id,moodPreference||selArenaMood||"auto");
  if(a!==currentArena||resolvedMood!==currentArenaMood){ currentArena=a; currentArenaMood=resolvedMood; rebuildArenaCache(); if(musicTimer)startMusic(); }
}
function setArenaMood(mood){
  selArenaMood=ARENA_MOODS[mood]?mood:"auto";
  const resolvedMood=resolveArenaMood(currentArena.id,selArenaMood);
  if(resolvedMood!==currentArenaMood){ currentArenaMood=resolvedMood; rebuildArenaCache(); }
  renderStats.arenaMood=currentArenaMood;
  return currentArenaMood;
}
function drawArenaMoodAtmosphere(){
  const theme=arenaMoodTheme(),id=currentArena.id;
  renderStats.arenaMood=currentArenaMood; renderStats.moodCelestial=theme.celestial||"";
  const starTotal=qualityLevel===0?Math.ceil((theme.stars||0)*.45):qualityLevel===1?Math.ceil((theme.stars||0)*.7):(theme.stars||0);
  renderStats.moodStars=starTotal;
  ctx.save();
  ctx.fillStyle=cachedLinearGradient("mood-atmosphere:"+id+":"+currentArenaMood,0,-60,0,GROUND,[[0,theme.overlay],[.62,theme.horizon],[1,"rgba(0,0,0,0)"]]);
  ctx.fillRect(-220,-60,1720,GROUND+40);
  if(starTotal>0){
    ctx.fillStyle="#ffffff";
    for(let i=0;i<starTotal;i++){ const x=-180+pseudo(i*19+id.length*7)*1640,y=-30+pseudo(i*31+4)*330,tw=.35+.65*Math.abs(Math.sin(renderTicker*.018+i)); ctx.globalAlpha=tw; ctx.fillRect(x,y,i%11===0?3:2,i%11===0?3:2); }
    ctx.globalAlpha=1;
  }
  const bodies={stadium:[640,215,58],tokyo:[1120,92,36],temple:[108,72,40],Libreville:[640,286,56]},body=bodies[id]||bodies.stadium;
  if(theme.celestial==="moon"){
    ctx.globalAlpha=.9; ctx.drawImage(glowSprite("#90caf9"),body[0]-body[2]*2.2,body[1]-body[2]*2.2,body[2]*4.4,body[2]*4.4); ctx.globalAlpha=1;
    ctx.fillStyle="#eef6ff"; ctx.beginPath(); ctx.arc(body[0],body[1],body[2]*.72,0,7); ctx.fill();
    ctx.fillStyle="rgba(5,12,38,.88)"; ctx.beginPath(); ctx.arc(body[0]-body[2]*.3,body[1]-body[2]*.12,body[2]*.62,0,7); ctx.fill();
  }else{
    const sunColor=theme.celestial==="sunLow"?"#ffb74d":"#fff59d";
    ctx.globalAlpha=.88; ctx.drawImage(glowSprite(sunColor),body[0]-body[2]*2.5,body[1]-body[2]*2.5,body[2]*5,body[2]*5); ctx.globalAlpha=1;
    ctx.fillStyle=theme.celestial==="sunLow"?"#ffd166":"#fffde7"; ctx.beginPath(); ctx.arc(body[0],body[1],body[2]*(theme.celestial==="sunLow"?.78:.66),0,7); ctx.fill();
    if(qualityLevel>0){ ctx.strokeStyle=theme.celestial==="sunLow"?"rgba(255,170,80,.35)":"rgba(255,255,210,.35)"; ctx.lineWidth=3; for(let i=0;i<6;i++){ const a=i*Math.PI/3+renderTicker*.002; ctx.beginPath(); ctx.moveTo(body[0]+Math.cos(a)*body[2]*.85,body[1]+Math.sin(a)*body[2]*.85); ctx.lineTo(body[0]+Math.cos(a)*body[2]*1.18,body[1]+Math.sin(a)*body[2]*1.18); ctx.stroke(); } }
  }
  ctx.save(); ctx.globalCompositeOperation="screen"; ctx.globalAlpha=currentArenaMood==="nuit"?.16:.22; ctx.fillStyle=theme.horizon;
  ctx.beginPath(); ctx.ellipse(640,392,760,92,0,0,7); ctx.fill(); ctx.restore();
  ctx.restore();
}
/* Foule, nuages, pluie, pétales */
const crowd=[];
for(let r=0;r<5;r++)for(let i=0;i<68;i++)crowd.push({x:-8+i*19.4+(r%2)*8,y:238+r*27,c:["#ff8a65","#ffd54f","#81d4fa","#a5d6a7","#f48fb1","#ce93d8","#fff59d"][(Math.random()*7)|0],ph:Math.random()*6.28,sk:["#8d5524","#c68642","#e0ac69","#6d3f17"][(Math.random()*4)|0]});
const clouds=Array.from({length:9},(_,i)=>({x:Math.random()*1500-100,y:36+i*25+Math.random()*20,s:.55+Math.random()*.8,v:.22+Math.random()*.35}));
const raindrops=Array.from({length:130},()=>({x:Math.random()*W,y:Math.random()*H,s:13+Math.random()*11,l:12+Math.random()*14}));
const petals=Array.from({length:42},()=>({x:Math.random()*W,y:Math.random()*H,s:2.5+Math.random()*3.5,v:.35+Math.random()*.6,ph:Math.random()*6.28}));
const pseudo=i=>{ const x=Math.sin(i*127.1+311.7)*43758.5453; return x-Math.floor(x); };
/* Passants et supporters mobiles : identités stables, mouvements continus, aucune collision. */
const ambientWalkers=Array.from({length:18},(_,i)=>({
  x:-160+pseudo(i*13+4)*1640,dir:i%3===2?-1:1,speed:.32+pseudo(i*17+2)*.72,scale:.58+pseudo(i*19+8)*.48,
  lane:pseudo(i*23+6),phase:pseudo(i*29+1)*6.28,coat:["#37474f","#6a1b9a","#00897b","#c62828","#f9a825","#1565c0","#5d4037","#e1f5fe"][i%8],
  pants:["#17202b","#263238","#3e2723","#1a237e"][i%4],skin:["#8d5524","#c68642","#e0ac69","#6d3f17"][i%4],hair:["#111","#2b1608","#263238","#4e260d"][i%4]
}));
function drawAmbientPeople(kind,baseY,count,depth){
  if(state==="pause")return;
  const total=qualityLevel===0?Math.ceil(count*.45):qualityLevel===1?Math.ceil(count*.75):count;
  renderStats.ambientPeople=total;
  ctx.save(); ctx.lineCap="round"; ctx.lineJoin="round";
  for(let i=0;i<total;i++){
    const w=ambientWalkers[i],speedMul=kind==="tokyo"?.82:kind==="temple"?.68:1;
    w.x+=w.dir*w.speed*speedMul*clamp(renderDtFactor||1,.25,2.5);
    if(w.x>1510){ w.x=-190; w.lane=pseudo(i*41+((renderStats.frame/120)|0)); }
    if(w.x<-210){ w.x=1490; w.lane=pseudo(i*43+((renderStats.frame/120)|0)); }
    const laneY=baseY+w.lane*(depth||18),s=w.scale*(0.85+w.lane*.25),step=renderTicker*(.12+w.speed*.085)+w.phase,swing=Math.sin(step)*7*s,lift=Math.abs(Math.cos(step))*2.2*s;
    const hipY=laneY-25*s-lift,shY=laneY-49*s-lift,headY=laneY-61*s-lift;
    ctx.fillStyle="rgba(0,0,0,.22)"; ctx.beginPath(); ctx.ellipse(w.x,laneY+2,15*s,3.5*s,0,0,7); ctx.fill();
    ctx.strokeStyle=w.pants; ctx.lineWidth=4.6*s;
    ctx.beginPath(); ctx.moveTo(w.x,hipY); ctx.lineTo(w.x-swing*.45,hipY+12*s); ctx.lineTo(w.x-swing,laneY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w.x,hipY); ctx.lineTo(w.x+swing*.45,hipY+12*s); ctx.lineTo(w.x+swing,laneY); ctx.stroke();
    ctx.strokeStyle=w.coat; ctx.lineWidth=7*s; ctx.beginPath(); ctx.moveTo(w.x,hipY+2); ctx.lineTo(w.x+w.dir*2*s,shY); ctx.stroke();
    ctx.lineWidth=3.6*s;
    const armY=shY+17*s+Math.sin(step+1.4)*1.4*s;
    ctx.beginPath(); ctx.moveTo(w.x+w.dir*2*s,shY+3*s); ctx.lineTo(w.x+swing*.65,armY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w.x+w.dir*2*s,shY+3*s); ctx.lineTo(w.x-swing*.65,armY); ctx.stroke();
    ctx.fillStyle=w.skin; ctx.beginPath(); ctx.arc(w.x+w.dir*3*s,headY,6.4*s,0,7); ctx.fill();
    ctx.fillStyle=w.hair; ctx.beginPath(); ctx.arc(w.x+w.dir*2*s,headY-2*s,6.2*s,Math.PI,0); ctx.fill();
    if(kind==="tokyo"){
      ctx.strokeStyle="#cfd8dc"; ctx.lineWidth=1.6*s; ctx.beginPath(); ctx.moveTo(w.x+swing*.65,armY); ctx.lineTo(w.x+3*s,headY-13*s); ctx.stroke();
      ctx.fillStyle=["#ff2e88","#00e5ff","#ffc400"][i%3]; ctx.beginPath(); ctx.arc(w.x+3*s,headY-12*s,17*s,Math.PI,0); ctx.fill();
    }else if(kind==="temple"&&i%3===0){
      ctx.fillStyle="#8e2418"; ctx.beginPath(); ctx.moveTo(w.x-8*s,hipY+3*s); ctx.lineTo(w.x+9*s,hipY+3*s); ctx.lineTo(w.x+6*s,shY); ctx.lineTo(w.x-5*s,shY); ctx.closePath(); ctx.fill();
    }else if(kind==="Libreville"&&i%3!==1){
      ctx.strokeStyle="#fff3c4"; ctx.lineWidth=3*s; ctx.beginPath(); ctx.moveTo(w.x-8*s,headY-5*s); ctx.lineTo(w.x+10*s,headY-5*s); ctx.stroke();
      ctx.fillStyle="#ffd54f"; ctx.beginPath(); ctx.arc(w.x+2*s,headY-6*s,5.5*s,Math.PI,0); ctx.fill();
    }
  }
  ctx.restore();
}
function drawWavingFlag(x,y,color,scale,phase){
  const wave=Math.sin(renderTicker*.11+phase)*4*scale, Wave2=Math.sin(renderTicker*.11+phase+1.1)*6*scale;
  ctx.save(); ctx.strokeStyle="#263238"; ctx.lineWidth=3*scale; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x,y-56*scale); ctx.stroke();
  ctx.fillStyle=color; ctx.beginPath(); ctx.moveTo(x,y-56*scale); ctx.quadraticCurveTo(x+22*scale,y-52*scale+wave,x+43*scale,y-48*scale+Wave2); ctx.quadraticCurveTo(x+21*scale,y-36*scale+wave,x,y-31*scale); ctx.closePath(); ctx.fill(); ctx.restore();
}

/* ---------------- CAMÉRA DYNAMIQUE ---------------- */
const cam={x:640,zoom:1};
function resetCamera(snap){ if(snap){cam.x=640;cam.zoom=1;} }
function prepareInterpolation(alpha){
  for(const f of fighters){ f.rx=f.px+(f.x-f.px)*alpha; f.ry=f.py+(f.y-f.py)*alpha; }
  for(const pr of projectiles){ pr.rx=pr.px+(pr.x-pr.px)*alpha; pr.ry=pr.py+(pr.y-pr.py)*alpha; }
}
function updateCamera(dtMs){
  const mid=(p1.rx+p2.rx)/2, dist=Math.abs(p2.rx-p1.rx);
  let tz=(state==="menu"||state==="select"||state==="vs"||state==="scene")?1.06:clamp(1180/(dist+420),.88,1.34);
  if(state==="intro"||state==="roundEnd")tz=Math.min(1.42,tz+.08);
  const halfView=640/Math.max(.7,tz),tx=(state==="menu"||state==="select"||state==="vs"||state==="scene")?640:clamp(mid,Math.min(640,halfView),Math.max(640,1280-halfView));
  const k=dtMs<=0?1:1-Math.exp(-dtMs/135);
  cam.x+=(tx-cam.x)*k; cam.zoom+=(tz-cam.zoom)*k;
}

/* ---------------- ARRIÈRE-PLANS ANIMÉS ---------------- */
function rr(x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function drawBillboard(title,sub){
  /* V3.4 : écran géant réduit et discret — plein visible dans les menus,
     il s'efface pendant le combat pour laisser la scène aux combattants. */
  const a=state==="fight"?.3:(state==="roundEnd"||state==="matchEnd")?.55:1;
  renderStats.billboardAlpha=a;
  ctx.save(); ctx.globalAlpha=a; ctx.fillStyle="rgba(5,8,30,.82)"; rr(468,14,344,82,16); ctx.fill();
  const eg=arenaCache.billboard||cachedLinearGradient("billboard",468,14,812,96,[[0,"#00a2ff"],[.5,"#7c3aed"],[1,"#ff2e88"]]);
  ctx.strokeStyle=eg; ctx.lineWidth=3; rr(468,14,344,82,16); ctx.stroke();
  ctx.textAlign="center"; ctx.fillStyle="#fff"; ctx.font="1000 25px 'Segoe UI',Arial"; ctx.fillText(title,640,48);
  ctx.font="1000 12.5px 'Segoe UI',Arial"; ctx.fillStyle="#ffe082"; ctx.fillText("★ Arena Championship ★",640,69);
  ctx.font="800 10px 'Segoe UI',Arial"; ctx.fillStyle="rgba(255,255,255,.85)"; ctx.fillText(sub,640,87); ctx.restore();
}
function modeLabel(){ return state==="menu"||state==="select"?"CHOISIS TON MODE DE JEU":(mode==="story"?"MODE HISTOIRE • COMBAT "+story.step+"/"+story.total:mode==="survival"?"MODE SURVIE • VAGUE "+survival.wave:mode==="arcade"?((arcade.circuitName||"CHAMPIONNAT Godson").toUpperCase()+" • COMBAT "+arcade.stage+"/"+arcadeTotal()):mode==="training"?"MODE ENTRAÎNEMENT":mode==="bot"?"MODE BOT • "+DIFFS[botDiff].label.toUpperCase():"MODE 2 JOUEURS"); }
function drawStadium(){
  ctx.fillStyle=arenaCache.sky; ctx.fillRect(-220,-60,1720,H+120);
  ctx.save(); ctx.globalAlpha=.95; ctx.drawImage(glowSprite("#ff9800"),640-235,215-235,470,470); ctx.restore();
  ctx.fillStyle="#ffe082"; ctx.beginPath(); ctx.arc(640,215,56,0,7); ctx.fill();
  const pan=(640-cam.x)*.12;
  ctx.save(); ctx.translate(pan,0); ctx.fillStyle="rgba(18,14,55,.84)";
  const hs=[110,160,90,190,125,210,105,170,140,195,95,155,120,180,135,165];
  hs.forEach((h,i)=>ctx.fillRect(-160+i*96,360-h,72,h));
  ctx.fillStyle="rgba(255,224,130,.72)";
  for(let i=0;i<76;i++){ if(((i*13+((renderTicker*.03)|0))%19)!==0)ctx.fillRect(-140+(i*173)%1500,205+((i*67)%140),5,7); }
  ctx.restore();
  // Faisceaux lumineux
  ctx.save(); ctx.globalCompositeOperation="screen";
  [[105,50,.45],[1175,50,-.45],[640,16,.85]].forEach((s,i)=>{ const a=Math.sin(renderTicker*.008+i*2.1)*.5+s[2]; const ex=Math.round((s[0]+Math.sin(a)*560)/12)*12,ey=Math.round((s[1]+Math.cos(a)*560)/12)*12; const grd=cachedLinearGradient("beam:"+i+":"+ex+":"+ey,s[0],s[1],ex,ey,[[0,"rgba(255,255,190,.30)"],[1,"rgba(255,255,190,0)"]]); ctx.fillStyle=grd; ctx.beginPath(); ctx.moveTo(s[0],s[1]); ctx.lineTo(s[0]+Math.sin(a-.085)*575,s[1]+Math.cos(a-.085)*575); ctx.lineTo(s[0]+Math.sin(a+.085)*575,s[1]+Math.cos(a+.085)*575); ctx.closePath(); ctx.fill(); });
  ctx.restore();
  drawBillboard("GÉDÉON - Godson",modeLabel());
  // Tribunes et foule réactive
  ctx.fillStyle="rgba(10,10,38,.76)"; ctx.fillRect(-220,218,1720,164); ctx.fillStyle="#ffc400"; ctx.fillRect(-220,218,1720,5);
  const amp=(crowdExcite>0?5:2)*(qualityLevel===0?.6:1),step=qualityLevel===0?2:1;
  for(let i=0;i<crowd.length;i+=step){ const c=crowd[i],travel=Math.pow(Math.max(0,Math.sin(renderTicker*.026-c.x*.0052+c.y*.002)),7)*(crowdExcite>0?13:8),b=Math.abs(Math.sin(renderTicker*.09+c.ph))*amp+travel;
    if(travel>2.4||pseudo(i*7)>.82){ ctx.strokeStyle=c.sk; ctx.lineWidth=2.4; ctx.beginPath(); ctx.moveTo(c.x-5,c.y+7-b); ctx.lineTo(c.x-10,c.y-6-b-travel*.35); ctx.moveTo(c.x+5,c.y+7-b); ctx.lineTo(c.x+10,c.y-6-b-travel*.35); ctx.stroke(); if(crowdExcite>0&&i%37===0){ctx.fillStyle="#fff";ctx.fillRect(c.x+9,c.y-12-b-travel*.35,4,6);} }
    ctx.fillStyle=c.sk; ctx.beginPath(); ctx.arc(c.x,c.y-b,5.3,0,7); ctx.fill(); ctx.fillStyle=c.c; ctx.fillRect(c.x-6,c.y+4-b,12,10); }
  ctx.fillStyle="rgba(255,255,255,.1)"; for(let r=0;r<5;r++)ctx.fillRect(-220,252+r*27,1720,2);
  // Bandeau LED défilant
  ctx.save(); ctx.fillStyle="#050816"; ctx.fillRect(-220,382,1720,30); ctx.font="1000 19px 'Segoe UI',Arial"; ctx.textAlign="left";
  const msg=" ✦ Godson FURY ARENA ✦ COMBAT 1V1 ✦ M1 SIGNATURE • COMBOS • DASH • SUPER ATTAQUES ";
  const tw=cachedTextWidth(msg,"1000 19px 'Segoe UI',Arial"),off=-((renderTicker*1.15)%tw);
  ctx.fillStyle="#69f0ae"; for(let x=off-tw;x<W+220;x+=tw)ctx.fillText(msg,x,404); ctx.restore();
  ctx.fillStyle="rgba(11,14,42,.68)"; ctx.fillRect(-220,428,1720,50); ctx.fillStyle="rgba(255,255,255,.13)"; ctx.fillRect(-220,428,1720,3);
  drawWavingFlag(82,430,"#ffc400",1,1.4); drawWavingFlag(1195,430,"#00e5ff",1,4.2);
  drawAmbientPeople("stadium",472,10,14);
  ctx.save(); ctx.textAlign="center"; ctx.font="1000 20px 'Segoe UI',Arial";
  ctx.fillStyle="#0091ea"; rr(22,164,220,37,10); ctx.fill(); ctx.fillStyle="#fff"; ctx.fillText("🟦 "+p1.name,132,189);
  ctx.fillStyle="#d50000"; rr(1038,164,220,37,10); ctx.fill(); ctx.fillStyle="#fff"; ctx.fillText((mode==="2p"?"🟥 ":"🤖 ")+String(p2.name).slice(0,15),1148,189); ctx.restore();
}
function drawTokyo(){
  ctx.fillStyle=arenaCache.sky; ctx.fillRect(-220,-60,1720,H+120);
  ctx.fillStyle="#eceff1"; ctx.beginPath(); ctx.arc(1120,92,34,0,7); ctx.fill(); ctx.fillStyle="rgba(2,6,31,.82)"; ctx.beginPath(); ctx.arc(1104,82,31,0,7); ctx.fill();
  ctx.drawImage(glowSprite("#5c6bc0"),1030,-5,190,190);
  const pan=(640-cam.x)*.1;
  ctx.save(); ctx.translate(pan,0);
  for(let i=0;i<19;i++){ const x=-190+i*86,h=170+pseudo(i)*230,w=62+pseudo(i+40)*28; ctx.fillStyle=i%3?"#0b102b":"#131a3d"; ctx.fillRect(x,430-h,w,h+60);
    for(let wy=0;wy<10;wy++)for(let wx=0;wx<3;wx++){ const on=pseudo(i*31+wy*7+wx)>.38; if(on){ ctx.fillStyle=["#69f0ae","#ffd54f","#4fc3f7","#ff80ab"][(pseudo(i+wy+wx)*4)|0]; ctx.globalAlpha=.55+pseudo(wy+i)*.4; ctx.fillRect(x+8+wx*18,438-h+wy*22,9,12); } }
    ctx.globalAlpha=1;
  }
  ctx.restore();
  // Enseignes néon
  const signs=[[58,116,"Gédéon","#00e5ff"],[85,205,"Godson","#ff2e88"],[1018,108,"FIGHT!","#ffc400"],[1045,198,"ARENA","#69f0ae"]];
  ctx.save(); ctx.textAlign="center"; ctx.font="1000 27px 'Segoe UI',Arial";
  signs.forEach((s,i)=>{ const flick=(i===1&&((renderTicker+i*20)%97<4))?.25:1; ctx.globalAlpha=.18*flick; ctx.fillStyle=s[3]; rr(s[0]-12,s[1]-35,174,52,12); ctx.fill(); ctx.globalAlpha=flick; ctx.strokeStyle=s[3]; ctx.lineWidth=3; rr(s[0]-12,s[1]-35,174,52,12); ctx.stroke(); ctx.fillStyle="#fff"; ctx.fillText(s[2],s[0]+75,s[1]); });
  ctx.restore();
  drawBillboard("GÉDÉON - Godson",modeLabel()+" • TOKYO");
  // Silhouettes de spectateurs sous parapluies
  ctx.fillStyle="rgba(4,6,20,.82)"; ctx.fillRect(-220,354,1720,58);
  for(let i=0;i<26;i++){ const x=-40+i*53+Math.sin(renderTicker*.05+i)*1.5; ctx.fillStyle="#02040f"; ctx.beginPath(); ctx.arc(x,374,8,0,7); ctx.fill(); ctx.fillRect(x-8,381,16,25); ctx.fillStyle=["#ff2e88","#00e5ff","#ffc400"] [i%3]; ctx.beginPath(); ctx.arc(x,368,19,Math.PI,0); ctx.fill(); }
  ctx.fillStyle="rgba(2,4,16,.55)"; ctx.fillRect(-220,430,1720,48);
  drawAmbientPeople("tokyo",474,11,16);
  // Pluie cinématique
  if(qualityLevel>0){ ctx.save(); ctx.strokeStyle="rgba(178,235,255,.5)"; ctx.lineWidth=1.4; ctx.beginPath();
    const n=qualityLevel===1?70:130;
    for(let i=0;i<n;i++){ const d=raindrops[i]; d.y+=d.s*renderDtFactor; d.x-=2.2*renderDtFactor; if(d.y>H){d.y=-15;d.x=Math.random()*(W+100);} ctx.moveTo(d.x,d.y); ctx.lineTo(d.x-4,d.y+d.l); }
    ctx.stroke(); ctx.restore(); }
}
function drawTemple(){
  ctx.fillStyle=arenaCache.sky; ctx.fillRect(-220,-60,1720,H+120);
  ctx.drawImage(glowSprite("#ffd54f"),-40,-85,300,300); ctx.fillStyle="#fff59d"; ctx.beginPath(); ctx.arc(108,72,38,0,7); ctx.fill();
  // Nuages dérivants
  ctx.save(); ctx.fillStyle="rgba(255,255,255,.9)";
  for(const c of clouds){ c.x+=c.v*renderDtFactor; if(c.x>1500)c.x=-220; ctx.beginPath(); ctx.ellipse(c.x,c.y,54*c.s,17*c.s,0,0,7); ctx.ellipse(c.x+32*c.s,c.y+3,38*c.s,13*c.s,0,0,7); ctx.ellipse(c.x-34*c.s,c.y+5,34*c.s,12*c.s,0,0,7); ctx.fill(); }
  ctx.restore();
  const pan=(640-cam.x)*.1;
  ctx.save(); ctx.translate(pan,0);
  ctx.fillStyle="rgba(55,71,79,.55)"; ctx.beginPath(); ctx.moveTo(-220,398); [[-60,250],[110,340],[280,225],[450,345],[640,205],[835,340],[1010,235],[1190,340],[1370,255],[1500,398]].forEach(p=>ctx.lineTo(p[0],p[1])); ctx.closePath(); ctx.fill();
  ctx.fillStyle="rgba(46,125,50,.62)"; ctx.beginPath(); ctx.moveTo(-220,430); [[0,345],[240,405],[470,330],[720,410],[960,338],[1200,408],[1500,350],[1500,430]].forEach(p=>ctx.lineTo(p[0],p[1])); ctx.closePath(); ctx.fill();
  ctx.restore();
  // Torii / temple central
  ctx.save(); ctx.fillStyle="#8e2418"; ctx.fillRect(438,190,24,222); ctx.fillRect(818,190,24,222); ctx.fillRect(405,166,470,24); ctx.fillRect(438,220,404,17);
  ctx.fillStyle="#5d160f"; ctx.beginPath(); ctx.moveTo(385,168); ctx.quadraticCurveTo(640,130,895,168); ctx.lineTo(875,190); ctx.quadraticCurveTo(640,158,405,190); ctx.closePath(); ctx.fill();
  ctx.fillStyle="#f7e7bd"; rr(472,248,336,104,12); ctx.fill(); ctx.strokeStyle="#8e2418"; ctx.lineWidth=5; rr(472,248,336,104,12); ctx.stroke();
  ctx.textAlign="center"; ctx.fillStyle="#6d1a10"; ctx.font="1000 30px Georgia,serif"; ctx.fillText("Gédéon - Godson",640,292); ctx.font="1000 15px Georgia,serif"; ctx.fillStyle="#8e5a12"; ctx.fillText("TEMPLE DES CHAMPIONS",640,322);
  // Lanternes oscillantes
  [385,500,640,780,895].forEach((x,i)=>{ const sway=Math.sin(renderTicker*.035+i)*7; ctx.strokeStyle="#4e260d"; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x,190); ctx.lineTo(x+sway,224); ctx.stroke(); ctx.drawImage(glowSprite("#ff9800"),x+sway-25,205,50,50); ctx.fillStyle="#ff7043"; ctx.beginPath(); ctx.ellipse(x+sway,232,14,18,0,0,7); ctx.fill(); ctx.fillStyle="#6d1a10"; ctx.fillRect(x+sway-9,212,18,5); });
  ctx.restore();
  ctx.fillStyle="rgba(93,64,55,.24)"; ctx.fillRect(-220,432,1720,42);
  drawAmbientPeople("temple",470,7,13);
  // Oiseaux
  ctx.save(); ctx.strokeStyle="rgba(38,50,56,.8)"; ctx.lineWidth=2.4;
  for(let i=0;i<5;i++){ const x=((renderTicker*(0.55+i*.07)+i*310)%1550)-130,y=105+i*28+Math.sin(renderTicker*.04+i)*8,w=7+Math.sin(renderTicker*.35+i)*3; ctx.beginPath(); ctx.moveTo(x-11,y+w*.4); ctx.quadraticCurveTo(x-4,y-w,x,y); ctx.quadraticCurveTo(x+4,y-w,x+11,y+w*.4); ctx.stroke(); }
  ctx.restore();
  // Pétales portés par le vent
  if(qualityLevel>0){ ctx.save(); ctx.fillStyle="rgba(255,183,197,.85)";
    for(const p of petals){ p.y+=p.v*renderDtFactor; p.x+=(.7+Math.sin(renderTicker*.03+p.ph)*.7)*renderDtFactor; if(p.y>H+10||p.x>W+10){p.y=-8;p.x=Math.random()*W*.7;} ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(renderTicker*.03+p.ph); ctx.beginPath(); ctx.ellipse(0,0,p.s,p.s*.55,0,0,7); ctx.fill(); ctx.restore(); }
    ctx.restore(); }
}
function drawLibreville(){
  ctx.fillStyle=arenaCache.sky; ctx.fillRect(-220,-60,1720,H+120);
  // Soleil couchant sur l'Atlantique
  ctx.save(); ctx.globalAlpha=.96; ctx.drawImage(glowSprite("#ff7043"),640-260,286-260,520,520); ctx.restore();
  ctx.fillStyle="#ffd166"; ctx.beginPath(); ctx.arc(640,286,58,Math.PI,0); ctx.fill();
  ctx.fillStyle="#ffe8a3"; ctx.beginPath(); ctx.arc(640,286,44,Math.PI,0); ctx.fill();
  // Nuages chauds
  ctx.save(); ctx.fillStyle="rgba(255,214,190,.82)";
  for(const c of clouds){ c.x+=c.v*.72*renderDtFactor; if(c.x>1500)c.x=-220; ctx.beginPath(); ctx.ellipse(c.x,c.y+12,54*c.s,15*c.s,0,0,7); ctx.ellipse(c.x+32*c.s,c.y+16,38*c.s,12*c.s,0,0,7); ctx.fill(); }
  ctx.restore();
  const pan=(640-cam.x)*.08;
  // Skyline lointaine de Libreville à droite, collines à gauche
  ctx.save(); ctx.translate(pan,0);
  ctx.fillStyle="rgba(42,48,82,.68)"; ctx.beginPath(); ctx.moveTo(-220,310); [[-80,248],[90,286],[250,236],[410,302],[560,310]].forEach(p=>ctx.lineTo(p[0],p[1])); ctx.lineTo(560,322); ctx.lineTo(-220,322); ctx.closePath(); ctx.fill();
  ctx.fillStyle="rgba(22,30,64,.82)";
  [930,990,1048,1115,1180,1245,1320,1390].forEach((x,i)=>{ const h=58+pseudo(i+80)*84; ctx.fillRect(x,318-h,42+pseudo(i+90)*24,h); });
  ctx.fillStyle="rgba(255,224,130,.75)"; for(let i=0;i<42;i++)ctx.fillRect(930+((i*97)%520),218+((i*41)%82),4,6);
  ctx.restore();
  drawBillboard("LIBREVILLE",modeLabel()+" • Gideon - Godson");
  // Océan animé
  const sea=cachedLinearGradient("Libreville:sea",0,286,0,430,[[0,"#1976a8"],[.45,"#0097a7"],[1,"#005b73"]]);
  ctx.fillStyle=sea; ctx.fillRect(-220,286,1720,142);
  ctx.save(); ctx.globalAlpha=.42; ctx.fillStyle="#ffd166";
  for(let i=0;i<34;i++){ const y=294+i*4,x=640+(pseudo(i*7)-.5)*(90+i*6)+Math.sin(renderTicker*.05+i)*7; ctx.fillRect(x,y,22+pseudo(i)*44,2); }
  ctx.restore();
  ctx.save(); ctx.strokeStyle="rgba(224,251,255,.72)"; ctx.lineWidth=2;
  for(let r=0;r<6;r++){ ctx.beginPath(); for(let x=-220;x<=1500;x+=36){ const y=306+r*20+Math.sin(x*.018+renderTicker*.045+r)*3; if(x===-220)ctx.moveTo(x,y); else ctx.lineTo(x,y); } ctx.globalAlpha=.22+r*.06; ctx.stroke(); }
  ctx.restore();
  // Pirogues au loin
  [[250,332],[1025,348]].forEach((b,i)=>{ const bobY=Math.sin(renderTicker*.05+i*2)*3,drift=Math.sin(renderTicker*.011+i*2.4)*22; ctx.save(); ctx.translate(b[0]+pan*.5+drift,b[1]+bobY); ctx.rotate(Math.sin(renderTicker*.045+i*1.7)*.035); ctx.fillStyle="#17324a"; ctx.beginPath(); ctx.moveTo(-52,8); ctx.quadraticCurveTo(0,22,52,8); ctx.lineTo(39,-3); ctx.lineTo(-39,-3); ctx.closePath(); ctx.fill(); ctx.strokeStyle="#17324a"; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(0,-3); ctx.lineTo(0,-38); ctx.stroke(); ctx.fillStyle=i?"#ffd54f":"#ff7043"; ctx.beginPath(); ctx.moveTo(2,-37); ctx.lineTo(28,-5); ctx.lineTo(2,-5); ctx.closePath(); ctx.fill(); ctx.restore(); });
  // Bord de plage, parasols et supporters
  ctx.fillStyle="#c99a5b"; ctx.fillRect(-220,410,1720,38);
  ctx.fillStyle="rgba(255,255,255,.72)"; ctx.fillRect(-220,408,1720,4);
  for(let i=0;i<9;i++){ const x=-110+i*180+Math.sin(renderTicker*.02+i)*2; ctx.strokeStyle="#5d4037"; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(x,446); ctx.lineTo(x+7,410); ctx.stroke(); ctx.fillStyle=["#ff5252","#ffc400","#00acc1","#69f0ae"][i%4]; ctx.beginPath(); ctx.arc(x+7,410,36,Math.PI,0); ctx.fill(); ctx.fillStyle="rgba(255,255,255,.75)"; ctx.beginPath(); ctx.arc(x+7,410,36,Math.PI,Math.PI*1.5); ctx.lineTo(x+7,410); ctx.fill(); }
  for(let i=0;i<42;i++){ const x=-140+i*38,b=Math.abs(Math.sin(renderTicker*.08+i))*(crowdExcite>0?4:1.5); ctx.fillStyle=["#8d5524","#c68642","#6d3f17","#e0ac69"][i%4]; ctx.beginPath(); ctx.arc(x,438-b,6,0,7); ctx.fill(); ctx.fillStyle=["#fff","#ffc400","#00e5ff","#ff80ab","#69f0ae"][i%5]; ctx.fillRect(x-6,444-b,12,13); }
  drawWavingFlag(188,456,"#00e5ff",.82,2.2); drawWavingFlag(1095,456,"#ff7043",.82,5.1);
  drawAmbientPeople("Libreville",496,9,15);
  // Palmiers au premier plan
  const palm=(x,flip,s)=>{ const sway=Math.sin(renderTicker*.025+x)*5*flip; ctx.save(); ctx.translate(x,470); ctx.scale(flip*s,s); ctx.strokeStyle="#4b2f22"; ctx.lineWidth=15; ctx.lineCap="round"; ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(22,-105,58+sway,-190); ctx.stroke(); ctx.strokeStyle="#1b7a43"; ctx.lineWidth=8; for(let i=0;i<7;i++){ const a=-.25-i*.38; ctx.beginPath(); ctx.moveTo(58+sway,-190); ctx.quadraticCurveTo(58+sway+Math.cos(a)*55,-214+Math.sin(a)*22,58+sway+Math.cos(a)*92,-190+Math.sin(a)*48+24); ctx.stroke(); } ctx.fillStyle="#6d4c41"; ctx.beginPath(); ctx.arc(50+sway,-182,9,0,7); ctx.arc(66+sway,-180,8,0,7); ctx.fill(); ctx.restore(); };
  palm(-78,1,1.08); palm(1390,-1,1.15); palm(108,1,.72);
  // Mouettes
  ctx.save(); ctx.strokeStyle="rgba(255,255,255,.9)"; ctx.lineWidth=2.4;
  for(let i=0;i<5;i++){ const x=((renderTicker*(0.48+i*.06)+i*340)%1550)-130,y=88+i*25+Math.sin(renderTicker*.04+i)*7,w=6+Math.sin(renderTicker*.3+i)*3; ctx.beginPath(); ctx.moveTo(x-11,y+w*.4); ctx.quadraticCurveTo(x-4,y-w,x,y); ctx.quadraticCurveTo(x+4,y-w,x+11,y+w*.4); ctx.stroke(); }
  ctx.restore();
}
function drawAmbientLife(){
  if(qualityLevel===0){ renderStats.ambientMotes=0; return; }
  const n=qualityLevel===2?26:16; renderStats.ambientMotes=n;
  ctx.save(); try{ctx.globalCompositeOperation="screen";}catch(e){}
  ctx.fillStyle=currentArenaMood==="nuit"?"rgba(130,170,255,.05)":"rgba(255,230,170,.06)";
  for(let i=0;i<3;i++){ const x=210+i*370+Math.sin(renderTicker*.004+i*1.7)*26; ctx.beginPath(); ctx.moveTo(x,-20); ctx.lineTo(x+120,-20); ctx.lineTo(x+310,GROUND); ctx.lineTo(x+90,GROUND); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle=currentArenaMood==="nuit"?"#bcd6ff":"#ffe9b0";
  for(let i=0;i<n;i++){ const sp=.12+pseudo(i*13+3)*.3,x=((pseudo(i*41+7)*1500+renderTicker*sp*9)%1500)-110,y=90+pseudo(i*29+5)*430+Math.sin(renderTicker*.011+i*1.3)*16; ctx.globalAlpha=.1+.3*Math.abs(Math.sin(renderTicker*.02+i*1.7)); ctx.beginPath(); ctx.arc(x,y,1.1+pseudo(i*7+1)*1.9,0,7); ctx.fill(); }
  ctx.restore(); ctx.globalAlpha=1;
}
function drawBackground(){
  if(currentArena.id==="stadium")drawStadium(); else if(currentArena.id==="tokyo")drawTokyo(); else if(currentArena.id==="Libreville")drawLibreville(); else drawTemple();
  drawArenaMoodAtmosphere();
  drawAmbientLife();
}
function drawFloor(){
  const id=currentArena.id,theme=FLOOR_THEMES[id]||FLOOR_THEMES.stadium,line=theme.line;
  const fg=arenaCache.floor||cachedLinearGradient("floor:"+id+":"+currentArenaMood,0,GROUND-22,0,H+180,[[0,shade(theme.top,arenaMoodTheme().floorShift||0)],[.25,shade(theme.mid,arenaMoodTheme().floorShift||0)],[1,theme.bot]]);
  ctx.fillStyle=fg; ctx.fillRect(-420,GROUND-22,2120,360);
  ctx.fillStyle=line; ctx.globalAlpha=.9; ctx.fillRect(-420,GROUND-22,2120,5); ctx.globalAlpha=1;
  if(id==="tokyo"){ ctx.save(); ctx.globalAlpha=.16; ["#00e5ff","#ff2e88","#ffc400"].forEach((c,i)=>{ctx.fillStyle=c;ctx.fillRect(90+i*420,GROUND-16,120,150);}); ctx.globalAlpha=.22; ctx.fillStyle="#b3e5fc"; [180,520,860,1120].forEach(x=>{ctx.beginPath();ctx.ellipse(x,GROUND+58,95,14,0,0,7);ctx.fill();}); ctx.restore(); }
  if(id==="Libreville"){ ctx.save();
    ctx.strokeStyle="rgba(255,255,255,.58)"; ctx.lineWidth=3; ctx.beginPath();
    for(let x=-420;x<=1700;x+=34){ const y=GROUND-8+Math.sin(x*.02+renderTicker*.035)*3; if(x===-420)ctx.moveTo(x,y); else ctx.lineTo(x,y); } ctx.stroke();
    ctx.font="15px Arial"; ctx.textAlign="center"; [[120,18,"🐚"],[420,82,"⭐"],[760,30,"🐚"],[1040,96,"🦀"],[1210,22,"⭐"]].forEach(s=>ctx.fillText(s[2],s[0],GROUND+s[1]));
    ctx.fillStyle="rgba(0,151,167,.18)"; [210,610,980].forEach(x=>{ctx.beginPath();ctx.ellipse(x,GROUND+48,115,15,0,0,7);ctx.fill();});
    ctx.restore(); }
  ctx.strokeStyle=id==="temple"||id==="Libreville"?"rgba(255,255,255,.2)":"rgba(255,255,255,.13)"; ctx.lineWidth=2;
  for(let i=-10;i<=22;i++){ ctx.beginPath(); ctx.moveTo(640+(i-6)*54,GROUND-18); ctx.lineTo(640+(i-6)*118,H+170); ctx.stroke(); }
  [0,29,64,104,150].forEach(o=>{ctx.beginPath();ctx.moveTo(-420,GROUND+o);ctx.lineTo(1700,GROUND+o);ctx.stroke();});
  ctx.save(); ctx.translate(640,GROUND+55); ctx.scale(1,.35);
  ctx.beginPath(); ctx.arc(0,0,172,0,7); ctx.strokeStyle=id==="temple"?"rgba(142,36,24,.75)":"rgba(255,196,0,.62)"; ctx.lineWidth=7; ctx.stroke();
  ctx.font="1000 51px 'Segoe UI',Arial"; ctx.textAlign="center"; ctx.fillStyle=id==="temple"?"rgba(90,30,15,.5)":"rgba(255,255,255,.2)"; ctx.fillText("Gideon - Godson",0,15); ctx.restore();
  /* Graphismes AAA II : la lumière de scène se pose entre les combattants et
     chaque signature colore légèrement le sol, sans coût de dégradé par frame. */
  if(qualityLevel>0&&p1&&p2){
    const mid=(p1.rx+p2.rx)/2; renderStats.floorLightPools=3;
    ctx.save(); try{ctx.globalCompositeOperation="screen";}catch(e){}
    ctx.globalAlpha=currentArenaMood==="nuit"?.13:.1; ctx.drawImage(glowSprite(line),mid-275,GROUND-17,550,82);
    [p1,p2].forEach(f=>{ ctx.globalAlpha=.08; ctx.drawImage(glowSprite(f.skin.trail),f.rx-88,GROUND-5,176,42); });
    ctx.restore();
  } else renderStats.floorLightPools=0;
}

/* ---------------- DESSIN DES COMBATTANTS PRO ---------------- */
function arenaShadowVector(){
  const base=currentArenaMood==="jour"?{x:-.22,len:.78,soft:.8}:currentArenaMood==="nuit"?{x:.26,len:.55,soft:.62}:{x:-.58,len:1.22,soft:.92};
  if(currentArena.id==="tokyo")base.x+=.18;
  if(currentArena.id==="Libreville"&&currentArenaMood==="crepuscule")base.x-=.12;
  if(currentArena.id==="temple"&&currentArenaMood==="jour")base.x-=.08;
  renderStats.shadowDirection=base.x<-.35?"longue-gauche":base.x>.2?"courte-droite":"zenithale";
  return base;
}
function drawShadow(f){
  const air=Math.max(0,GROUND-(f.ry==null?f.y:f.ry)),heightFactor=clamp(1-air/460,.25,1),vec=arenaShadowVector();
  const floorTheme=FLOOR_THEMES[currentArena.id]||FLOOR_THEMES.stadium;
  const bodyScale=f.char.scale*(.92+(f.char.bulk||1)*.13)*((f.downT>0||f.dead)?1.28:f.crouching?1.1:1);
  const layers=qualityLevel===0?1:qualityLevel===1?2:3;
  renderStats.dynamicShadows=(renderStats.dynamicShadows||0)+1; renderStats.shadowLayers=layers; renderStats.shadowHeightFactor=Math.round(heightFactor*100)/100;
  ctx.save();
  if(layers>=3){ ctx.globalAlpha=.09*vec.soft*heightFactor; ctx.fillStyle=floorTheme.line; ctx.beginPath(); ctx.ellipse(f.rx+vec.x*18*bodyScale,GROUND+12,96*bodyScale,19*bodyScale,vec.x*.06,0,7); ctx.fill(); }
  if(layers>=2){
    const castX=f.rx+vec.x*(34+air*.17)*bodyScale,castW=82*bodyScale*vec.len*(.68+heightFactor*.42),castH=(10+8*heightFactor)*bodyScale;
    ctx.globalAlpha=.13+.13*heightFactor; ctx.fillStyle="#000000"; ctx.beginPath(); ctx.ellipse(castX,GROUND+11,castW,castH,vec.x*.08,0,7); ctx.fill();
  }
  ctx.globalAlpha=1; ctx.fillStyle="rgba(0,0,0,"+(.18+.28*heightFactor)+")"; ctx.beginPath(); ctx.ellipse(f.rx,GROUND+10,58*bodyScale*(.55+heightFactor*.45),12.5*bodyScale,0,0,7); ctx.fill();
  if(qualityLevel>0&&f.grounded&&!f.dead&&f.downT<=0){
    const stride=Math.sin(f.walkPhase||0)*12*clamp(Math.abs((f.vx||0)+(f.kvx||0))/6,0,1),spread=f.crouching?25:20;
    ctx.fillStyle="rgba(0,0,0,.3)";
    [-spread-stride,spread+stride].forEach(off=>{ ctx.beginPath(); ctx.ellipse(f.rx+(f.facing||1)*off,GROUND+11,16*bodyScale,5*bodyScale,0,0,7); ctx.fill(); });
  }
  ctx.restore();
}
function drawReflection(f){
  if(qualityLevel===0)return;
  ctx.save(); ctx.globalAlpha=currentArena.id==="tokyo"?.2:currentArena.id==="Libreville"?.16:.1; ctx.translate(f.rx,GROUND+18+(GROUND-f.ry)*.18); ctx.scale(f.facing*f.char.scale,-.32*f.char.scale);
  ctx.fillStyle=f.skin.primary; ctx.beginPath(); ctx.moveTo(-20,-138); ctx.quadraticCurveTo(0,-148,20,-138); ctx.quadraticCurveTo(17,-106,18,-86); ctx.lineTo(-18,-86); ctx.quadraticCurveTo(-17,-110,-20,-138); ctx.fill();
  ctx.fillStyle=f.skin.skin; ctx.beginPath(); ctx.ellipse(7,-163,14,16,0,0,7); ctx.fill();
  ctx.strokeStyle=f.skin.pants; ctx.lineWidth=14; ctx.lineCap="round"; ctx.beginPath(); ctx.moveTo(-7,-88); ctx.lineTo(-14,-42); ctx.lineTo(-18,-4); ctx.moveTo(8,-88); ctx.lineTo(16,-39); ctx.lineTo(23,-4); ctx.stroke(); ctx.restore();
  ctx.save(); try{ctx.globalCompositeOperation="screen";}catch(e){} ctx.globalAlpha=currentArena.id==="tokyo"?.16:currentArena.id==="Libreville"?.13:.08;
  ctx.drawImage(glowSprite(f.skin.trail),f.rx-82,GROUND+13+(GROUND-f.ry)*.1,164,38); ctx.restore();
  renderStats.floorReflections=(renderStats.floorReflections||0)+1;
}
function limb(x1,y1,x2,y2,x3,y3,w,c,endC,endR){
  ctx.lineCap="round"; ctx.lineJoin="round";
  ctx.strokeStyle="rgba(8,8,18,.88)"; ctx.lineWidth=w+3.4; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.lineTo(x3,y3); ctx.stroke();
  ctx.strokeStyle=c; ctx.lineWidth=w; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.lineTo(x3,y3); ctx.stroke();
  if(endC){ ctx.fillStyle=endC; ctx.beginPath(); ctx.arc(x3,y3,endR||10,0,7); ctx.fill(); ctx.strokeStyle="rgba(0,0,0,.35)"; ctx.lineWidth=2; ctx.stroke(); ctx.fillStyle="rgba(255,255,255,.35)"; ctx.beginPath(); ctx.arc(x3-3,y3-3,(endR||10)*.35,0,7); ctx.fill(); }
}
/* ---------------- HUMAIN++ : ANATOMIE PROCÉDURALE ----------------
   Kenzo remplace les membres « tuyaux » par des volumes effilés : cuisse,
   mollet, bras, avant-bras, poing et chaussure ont chacun leur silhouette.
   Les proportions restent stylisées arcade, mais la tête redevient celle
   d'un adulte et chaque combattant reçoit sa morphologie propre. */
const HUMAN_PROFILES={
  gideon:{label:"athlète équilibré",headR:15.3,jaw:.68,neck:9,shoulder:22,hip:17,limb:1.06,hair:"court texturé",beard:.2,brow:.72},
  kira:{label:"sprinteuse agile",headR:14.6,jaw:.48,neck:7.4,shoulder:18.4,hip:16.2,limb:.95,hair:"queue haute",beard:0,brow:.62},
  titan:{label:"colosse puissant",headR:15.7,jaw:.94,neck:12.2,shoulder:28,hip:20,limb:1.28,hair:"rasé",beard:.52,brow:.92},
  nova:{label:"stratège élancée",headR:14.8,jaw:.52,neck:8,shoulder:19.6,hip:16.8,limb:1,hair:"long ondulé",beard:0,brow:.58},
  "godson-prime":{label:"champion royal",headR:15.4,jaw:.72,neck:10,shoulder:23.4,hip:18,limb:1.12,hair:"court royal",beard:.16,brow:.76},
  zara:{label:"vague athlétique",headR:14.9,jaw:.55,neck:8.1,shoulder:19.2,hip:17.4,limb:1.02,hair:"tresses marines",beard:0,brow:.6},
  kael:{label:"guerrier cuirassé",headR:15.5,jaw:.8,neck:10.5,shoulder:25,hip:18.5,limb:1.16,hair:"court guerrier",beard:.3,brow:.8},
  sora:{label:"magicienne gracieuse",headR:14.7,jaw:.5,neck:7.8,shoulder:18.8,hip:16.6,limb:.96,hair:"long argenté",beard:0,brow:.55},
  ael:{label:"androïde athlétique",headR:14.9,jaw:.55,neck:8.6,shoulder:21,hip:15.8,limb:1.04,hair:"casque synthétique",beard:0,brow:.3},
  "Lira":{label:"exploratrice athlétique",headR:14.8,jaw:0.55,neck:8,shoulder:19.2,hip:17,limb:1,hair:"queue d'exploratrice",beard:0,brow:0.6},
  "zed":{label:"traqueur sec",headR:15,jaw:0.7,neck:8.8,shoulder:20.5,hip:16.5,limb:1.02,hair:"capuche de traqueur",beard:0.15,brow:0.8},
  "nyx":{label:"ingénieure vive",headR:14.7,jaw:0.52,neck:7.8,shoulder:18.8,hip:16.6,limb:0.97,hair:"court bleu électrique",beard:0,brow:0.58},
  "vorak":{label:"berserker massif",headR:15.8,jaw:0.95,neck:12.4,shoulder:28.4,hip:20.4,limb:1.3,hair:"crête de guerre",beard:0.4,brow:0.95},
  "aerin":{label:"elfe éclaireuse",headR:14.6,jaw:0.48,neck:7.4,shoulder:18.2,hip:16.2,limb:0.95,hair:"long elfique",beard:0,brow:0.55},
  "korben":{label:"ingénieur spatial costaud",headR:15.2,jaw:0.72,neck:9.6,shoulder:22.4,hip:17.8,limb:1.06,hair:"court spatial",beard:0.25,brow:0.7},
  "lyra":{label:"prêtresse solaire",headR:14.9,jaw:0.54,neck:8.1,shoulder:19.4,hip:17.2,limb:1,hair:"coiffe solaire",beard:0,brow:0.5},
  "drakesh":{label:"chasseur alien",headR:15.4,jaw:0.8,neck:10,shoulder:23.6,hip:17.6,limb:1.1,hair:"rasé alien",beard:0,brow:0.85},
  "selene":{label:"pirate spatiale",headR:14.7,jaw:0.52,neck:7.8,shoulder:18.9,hip:16.8,limb:0.98,hair:"queue rose pirate",beard:0,brow:0.66},
  "taiko":{label:"moine de l'ombre",headR:15.1,jaw:0.66,neck:8.9,shoulder:20.8,hip:16.4,limb:1.03,hair:"capuche de moine",beard:0.1,brow:0.78},
  "vex":{label:"cyborg berserker",headR:15.6,jaw:0.9,neck:11.8,shoulder:27,hip:19.6,limb:1.24,hair:"implants rasés",beard:0,brow:0.9},
  "elara":{label:"chasseuse éthérée",headR:14.6,jaw:0.47,neck:7.3,shoulder:18,hip:16,limb:0.94,hair:"long argenté onirique",beard:0,brow:0.5},
  "brax":{label:"titan des montagnes",headR:15.9,jaw:0.96,neck:12.6,shoulder:28.8,hip:20.6,limb:1.32,hair:"barbe de montagne",beard:0.9,brow:0.88},
  "kazu":{label:"samouraï élancé",headR:15,jaw:0.64,neck:8.7,shoulder:20.6,hip:16.2,limb:1.04,hair:"chignon samouraï",beard:0,brow:0.72},
  "sera":{label:"hacker nomade",headR:14.7,jaw:0.52,neck:7.7,shoulder:18.6,hip:16.5,limb:0.97,hair:"queue turquoise hacker",beard:0,brow:0.6},
  "vorga":{label:"guerrière bandagée",headR:14.9,jaw:0.56,neck:8.2,shoulder:19.6,hip:17,limb:1.01,hair:"bandages du désert",beard:0,brow:0.62},
  "nox":{label:"esprit sylvestre",headR:14.8,jaw:0.5,neck:7.6,shoulder:18.4,hip:16.4,limb:0.96,hair:"couronne de ramures",beard:0,brow:0.52},
  "raven":{label:"tireuse d'élite",headR:14.8,jaw:0.53,neck:7.9,shoulder:19,hip:16.6,limb:0.99,hair:"court violet tactique",beard:0,brow:0.7},
  "zep":{label:"scaphandrier des abysses",headR:15.2,jaw:0.6,neck:9.4,shoulder:22,hip:17.4,limb:1.07,hair:"casque des abysses",beard:0,brow:0.4},
  "astrid":{label:"reine déchue",headR:14.9,jaw:0.55,neck:8.1,shoulder:19.8,hip:17.2,limb:1.01,hair:"couronne déchue",beard:0,brow:0.68},
  "selenia":{label:"rôdeuse elfique",headR:14.6,jaw:0.48,neck:7.4,shoulder:18.3,hip:16.3,limb:0.96,hair:"long de rôdeuse",beard:0,brow:0.56},
  "drakar":{label:"nordique du givre",headR:15.6,jaw:0.88,neck:11.4,shoulder:26.4,hip:19.4,limb:1.22,hair:"barbe nordique",beard:0.85,brow:0.86},
  "nyx-ombre":{label:"assassine voilée",headR:14.7,jaw:0.5,neck:7.6,shoulder:18.5,hip:16.4,limb:0.97,hair:"capuche d'assassine",beard:0,brow:0.74},
  "Kairos":{label:"mage des tempêtes",headR:15.1,jaw:0.66,neck:8.8,shoulder:20.9,hip:16.6,limb:1.03,hair:"court de mage",beard:0.12,brow:0.7},
  "Zara-nova":{label:"ingénieure de colonie",headR:14.8,jaw:0.54,neck:7.9,shoulder:19,hip:16.9,limb:0.99,hair:"court d'ingénieure",beard:0,brow:0.6},
  "brutus":{label:"tank blindé",headR:15.8,jaw:0.92,neck:12.2,shoulder:28.2,hip:20.2,limb:1.28,hair:"casque de légion",beard:0,brow:0.5},
  "aria":{label:"prêtresse céleste",headR:14.8,jaw:0.5,neck:7.7,shoulder:18.7,hip:16.7,limb:0.98,hair:"long céleste",beard:0,brow:0.48},
  "krak":{label:"orc des marais",headR:16,jaw:0.98,neck:12.8,shoulder:29,hip:20.8,limb:1.34,hair:"crête de marais",beard:0.2,brow:0.95},
  "luna":{label:"androïde exploratrice",headR:14.8,jaw:0.52,neck:8.2,shoulder:19.6,hip:15.6,limb:1,hair:"casque exploratrice",beard:0,brow:0.3},
  "velen":{label:"tueur du syndicat",headR:15.1,jaw:0.7,neck:9,shoulder:21,hip:16.6,limb:1.04,hair:"capuche de tueur",beard:0.15,brow:0.82},
  "lyra-azur":{label:"dragonnière azur",headR:14.9,jaw:0.55,neck:8.1,shoulder:19.8,hip:17,limb:1.02,hair:"queue de dragonnière",beard:0,brow:0.64},
  "orion":{label:"scientifique",headR:15.1,jaw:0.62,neck:8.6,shoulder:20.2,hip:16.8,limb:1,hair:"court scientifique",beard:0.08,brow:0.55}
};
const HUMAN_PROFILE_LOOKUP={}; Object.keys(HUMAN_PROFILES).forEach(k=>{ HUMAN_PROFILE_LOOKUP[k.toLowerCase()]=HUMAN_PROFILES[k]; });
function humanProfile(f){ const key=String((f&&f.char&&f.char.id)||"gideon").toLowerCase(); return HUMAN_PROFILE_LOOKUP[key]||HUMAN_PROFILES.gideon; }
/* Tenues des planches AAA II (Marco) : chaque combattant porte un motif de
   tenue issu de son identité visuelle. La table est explicite pour les 41
   héros : aucun nouveau personnage ne doit retomber sur un badge générique. */
const BOARD_OUTFIT_MOTIFS={
  "gideon":"eclair","kira":"eclair","titan":"montagne","nova":"orbite","godson-prime":"couronne","zara":"vague",
  "kael":"lame","sora":"rune","ael":"circuit","lira":"boussole","zed":"fleche","nyx":"circuit",
  "vorak":"hache","aerin":"feuille","korben":"circuit","lyra":"soleil","drakesh":"viseur","selene":"lune",
  "taiko":"lune","vex":"circuit","elara":"rune","brax":"montagne","kazu":"lame","sera":"circuit",
  "vorga":"sablier","nox":"feuille","raven":"viseur","zep":"vague","astrid":"couronne","selenia":"feuille",
  "drakar":"Givre","nyx-ombre":"lame","kairos":"eclair","zara-nova":"circuit","brutus":"bouclier","aria":"soleil",
  "krak":"montagne","luna":"circuit","velen":"lame","lyra-azur":"aile","orion":"orbite"
};
function boardOutfitMotif(f){
  const id=String((f&&f.char&&f.char.id)||"gideon").toLowerCase();
  if(BOARD_OUTFIT_MOTIFS[id])return BOARD_OUTFIT_MOTIFS[id];
  const style=(f&&f.char&&f.char.style)||"hero";
  return style==="titan"?"montagne":style==="synthetique"?"circuit":style==="magicienne"||style==="nova"?"rune":style==="guerrier"?"lame":style==="Zara"?"vague":"eclair";
}
function drawBoardMotif(kind,x,y,size,color){
  const u=(size||10)/10;
  ctx.save(); ctx.translate(x,y); ctx.scale(u,u); ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=1.55/u; ctx.lineCap="round"; ctx.lineJoin="round";
  if(kind==="eclair"){
    ctx.beginPath(); ctx.moveTo(2,-9); ctx.lineTo(-4,1); ctx.lineTo(0,1); ctx.lineTo(-2,9); ctx.lineTo(5,-2); ctx.lineTo(1,-2); ctx.closePath(); ctx.fill();
  }else if(kind==="montagne"){
    ctx.beginPath(); ctx.moveTo(-9,7); ctx.lineTo(-4,-3); ctx.lineTo(-1,2); ctx.lineTo(3,-6); ctx.lineTo(9,7); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1.1,-3.2); ctx.lineTo(3,-6); ctx.lineTo(4.9,-3.2); ctx.stroke();
  }else if(kind==="orbite"){
    ctx.beginPath(); ctx.arc(0,0,3.1,0,7); ctx.fill(); ctx.beginPath(); ctx.ellipse(0,0,8.4,3,-.45,0,7); ctx.stroke();
    ctx.beginPath(); ctx.arc(6.2,-2.8,1.5,0,7); ctx.fill();
  }else if(kind==="couronne"){
    ctx.beginPath(); ctx.moveTo(-8,6); ctx.lineTo(-7,-4); ctx.lineTo(-3,1); ctx.lineTo(0,-7); ctx.lineTo(3,1); ctx.lineTo(7,-4); ctx.lineTo(8,6); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-7,8.4); ctx.lineTo(7,8.4); ctx.stroke();
  }else if(kind==="vague"){
    [-3.4,2.8].forEach(yy=>{ ctx.beginPath(); ctx.moveTo(-8,yy); ctx.quadraticCurveTo(-4,yy-4,0,yy); ctx.quadraticCurveTo(4,yy+4,8,yy-1); ctx.stroke(); });
  }else if(kind==="lame"){
    ctx.rotate(-.62); ctx.beginPath(); ctx.moveTo(0,-9); ctx.lineTo(3,-2); ctx.lineTo(1,3); ctx.lineTo(-1,3); ctx.lineTo(-3,-2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-4,4.2); ctx.lineTo(4,4.2); ctx.moveTo(0,4.2); ctx.lineTo(0,8.4); ctx.stroke();
  }else if(kind==="rune"){
    ctx.beginPath(); ctx.moveTo(0,-8.6); ctx.lineTo(6.8,0); ctx.lineTo(0,8.6); ctx.lineTo(-6.8,0); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,-5); ctx.lineTo(0,5); ctx.moveTo(-3.8,-2.4); ctx.lineTo(3.8,2.4); ctx.moveTo(3.8,-2.4); ctx.lineTo(-3.8,2.4); ctx.stroke();
  }else if(kind==="circuit"){
    ctx.strokeRect(-4,-4,8,8);
    [[-4,0,-8,0],[4,0,8,0],[0,-4,0,-8],[0,4,0,8]].forEach(l=>{ ctx.beginPath(); ctx.moveTo(l[0],l[1]); ctx.lineTo(l[2],l[3]); ctx.stroke(); ctx.beginPath(); ctx.arc(l[2],l[3],1.25,0,7); ctx.fill(); });
    ctx.beginPath(); ctx.arc(0,0,1.5,0,7); ctx.fill();
  }else if(kind==="boussole"){
    [[0,-9,2.2,-2.2,0,0,-2.2,-2.2],[9,0,2.2,2.2,0,0,2.2,-2.2],[0,9,-2.2,2.2,0,0,2.2,2.2],[-9,0,-2.2,-2.2,0,0,-2.2,2.2]].forEach(t=>{ ctx.beginPath(); ctx.moveTo(t[0],t[1]); ctx.lineTo(t[2],t[3]); ctx.lineTo(t[4],t[5]); ctx.lineTo(t[6],t[7]); ctx.closePath(); ctx.fill(); });
  }else if(kind==="fleche"){
    ctx.rotate(-.48); ctx.beginPath(); ctx.moveTo(-8,6); ctx.lineTo(7,-6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8.6,-7.4); ctx.lineTo(3.5,-6.8); ctx.lineTo(6.6,-2.8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-7.6,6.4); ctx.lineTo(-3.4,5.4); ctx.moveTo(-7.2,6.8); ctx.lineTo(-6,2.8); ctx.stroke();
  }else if(kind==="hache"){
    ctx.rotate(.48); ctx.beginPath(); ctx.moveTo(0,-8.4); ctx.lineTo(0,9); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,-7); ctx.lineTo(7,-5.2); ctx.quadraticCurveTo(8.6,-1,7,2.4); ctx.lineTo(0,.8); ctx.closePath(); ctx.fill();
  }else if(kind==="feuille"){
    ctx.beginPath(); ctx.moveTo(0,8.4); ctx.quadraticCurveTo(-8.4,.4,0,-8.8); ctx.quadraticCurveTo(8.4,.4,0,8.4); ctx.fill();
    ctx.strokeStyle="rgba(0,0,0,.35)"; ctx.beginPath(); ctx.moveTo(0,7.4); ctx.quadraticCurveTo(1.4,0,0,-7.2); ctx.stroke();
  }else if(kind==="soleil"){
    ctx.beginPath(); ctx.arc(0,0,3.5,0,7); ctx.fill();
    for(let i=0;i<8;i++){ const a=i*Math.PI/4; ctx.beginPath(); ctx.moveTo(Math.cos(a)*5.2,Math.sin(a)*5.2); ctx.lineTo(Math.cos(a)*8.6,Math.sin(a)*8.6); ctx.stroke(); }
  }else if(kind==="viseur"){
    ctx.beginPath(); ctx.arc(0,0,6.1,0,7); ctx.stroke(); ctx.beginPath(); ctx.arc(0,0,1.35,0,7); ctx.fill();
    [[0,-8.8,0,-4.8],[0,4.8,0,8.8],[-8.8,0,-4.8,0],[4.8,0,8.8,0]].forEach(l=>{ ctx.beginPath(); ctx.moveTo(l[0],l[1]); ctx.lineTo(l[2],l[3]); ctx.stroke(); });
  }else if(kind==="lune"){
    ctx.beginPath(); ctx.arc(0,0,8,-1.12,1.12); ctx.arc(3.4,0,6.2,1.05,-1.05,true); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(5.6,-5.2,1.2,0,7); ctx.fill();
  }else if(kind==="sablier"){
    ctx.beginPath(); ctx.moveTo(-6,-8); ctx.lineTo(6,-8); ctx.lineTo(0,0); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-6,8); ctx.lineTo(6,8); ctx.lineTo(0,0); ctx.closePath(); ctx.fill();
  }else if(kind==="Givre"){
    for(let i=0;i<3;i++){ const a=i*Math.PI/3; ctx.beginPath(); ctx.moveTo(-Math.cos(a)*8.4,-Math.sin(a)*8.4); ctx.lineTo(Math.cos(a)*8.4,Math.sin(a)*8.4); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(0,0,2.1,0,7); ctx.stroke();
  }else if(kind==="bouclier"){
    ctx.beginPath(); ctx.moveTo(0,-8.8); ctx.lineTo(7,-6.2); ctx.quadraticCurveTo(7,3.4,0,8.8); ctx.quadraticCurveTo(-7,3.4,-7,-6.2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle="rgba(0,0,0,.32)"; ctx.beginPath(); ctx.moveTo(0,-6.6); ctx.lineTo(0,6.8); ctx.stroke();
  }else if(kind==="aile"){
    [-4.6,-1,2.6].forEach((yy,i)=>{ ctx.beginPath(); ctx.moveTo(-7.6,6.6-i); ctx.quadraticCurveTo(-1.5,yy,8.4,yy-2.4); ctx.quadraticCurveTo(2.6,yy+2.5,-5.4,7.2-i*.7); ctx.stroke(); });
  }else{
    ctx.beginPath(); ctx.moveTo(0,-8.4); ctx.lineTo(7,0); ctx.lineTo(0,8.4); ctx.lineTo(-7,0); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
function solveJoint(ax,ay,cx,cy,l1,l2,bend){
  const dx=cx-ax,dy=cy-ay; let d=Math.hypot(dx,dy)||.001;
  d=clamp(d,Math.abs(l1-l2)+.01,l1+l2-.01);
  const a=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-a*a)),xm=ax+dx/d*a,ym=ay+dy/d*a;
  return {x:xm-dy/d*h*(bend||1),y:ym+dx/d*h*(bend||1)};
}
function taperedSegment(x1,y1,x2,y2,w1,w2,color,highlight){
  const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
  ctx.beginPath();
  ctx.moveTo(x1+nx*w1/2,y1+ny*w1/2);
  ctx.quadraticCurveTo((x1+x2)/2+nx*(w1+w2)*.27,(y1+y2)/2+ny*(w1+w2)*.27,x2+nx*w2/2,y2+ny*w2/2);
  ctx.quadraticCurveTo(x2+dx/len*w2*.22,y2+dy/len*w2*.22,x2-nx*w2/2,y2-ny*w2/2);
  ctx.quadraticCurveTo((x1+x2)/2-nx*(w1+w2)*.27,(y1+y2)/2-ny*(w1+w2)*.27,x1-nx*w1/2,y1-ny*w1/2);
  ctx.quadraticCurveTo(x1-dx/len*w1*.2,y1-dy/len*w1*.2,x1+nx*w1/2,y1+ny*w1/2);
  let segFill=color;
  if(qualityLevel>0&&typeof color==="string"&&color.charAt(0)==="#"){
    const mx=(x1+x2)/2,my=(y1+y2)/2,hw=Math.max(w1,w2)/2,gr=ctx.createLinearGradient(mx-nx*hw,my-ny*hw,mx+nx*hw,my+ny*hw);
    gr.addColorStop(0,shade(color,-48)); gr.addColorStop(.38,shade(color,26)); gr.addColorStop(.72,color); gr.addColorStop(1,shade(color,-30));
    segFill=gr; renderStats.cylinderShading=true;
  }
  ctx.fillStyle=segFill; ctx.fill(); ctx.strokeStyle="rgba(5,8,16,.38)"; ctx.lineWidth=1.25; ctx.stroke();
  ctx.save(); ctx.lineCap="round";
  ctx.globalAlpha=.23; ctx.strokeStyle="#000000"; ctx.lineWidth=Math.max(1.6,w1*.21); ctx.beginPath(); ctx.moveTo(lerp(x1,x2,.13)+nx*w1*.21,lerp(y1,y2,.13)+ny*w1*.21); ctx.lineTo(lerp(x1,x2,.84)+nx*w2*.19,lerp(y1,y2,.84)+ny*w2*.19); ctx.stroke();
  ctx.globalAlpha=highlight?.3:.17; ctx.strokeStyle="#ffffff"; ctx.lineWidth=Math.max(1.3,w1*.16); ctx.beginPath(); ctx.moveTo(lerp(x1,x2,.13)-nx*w1*.2,lerp(y1,y2,.13)-ny*w1*.2); ctx.lineTo(lerp(x1,x2,.82)-nx*w2*.18,lerp(y1,y2,.82)-ny*w2*.18); ctx.stroke();
  ctx.restore();
}
function drawFist(x,y,r,angle,color){
  ctx.save(); ctx.translate(x,y); ctx.rotate(angle||0);
  ctx.fillStyle=color; ctx.beginPath(); ctx.ellipse(0,0,r*1.08,r*.8,0,0,7); ctx.fill();
  ctx.strokeStyle="rgba(0,0,0,.38)"; ctx.lineWidth=1.7; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-r*.18,r*.42,r*.48,r*.3,-.35,0,7); ctx.fill(); ctx.stroke();
  ctx.fillStyle="rgba(255,255,255,.34)"; [-.42,-.08,.28].forEach((o,i)=>{ ctx.beginPath(); ctx.arc(r*o,-r*(.34+((i%2)*.08)),r*.17,0,7); ctx.fill(); });
  ctx.strokeStyle="rgba(0,0,0,.22)"; ctx.lineWidth=1.2; [-.22,.12].forEach(o=>{ ctx.beginPath(); ctx.moveTo(r*o,-r*.48); ctx.lineTo(r*o,-r*.05); ctx.stroke(); });
  ctx.restore();
}
function drawHumanArm(x1,y1,x2,y2,x3,y3,width,sleeve,skin,glove,front){
  const solved=solveJoint(x1,y1,x3,y3,37,36,1),ex=lerp(x2,solved.x,.48),ey=lerp(y2,solved.y,.48);
  const wrist={x:lerp(ex,x3,.8),y:lerp(ey,y3,.8)},angle=Math.atan2(y3-wrist.y,x3-wrist.x);
  taperedSegment(x1,y1,ex,ey,width,width*.8,sleeve,front);
  taperedSegment(ex,ey,wrist.x,wrist.y,width*.74,width*.56,skin,front);
  taperedSegment(lerp(ex,wrist.x,.72),lerp(ey,wrist.y,.72),wrist.x,wrist.y,width*.62,width*.58,glove,false);
  ctx.fillStyle=front?skin:shade(skin,-24); ctx.beginPath(); ctx.arc(ex,ey,width*.38,0,7); ctx.fill();
  drawFist(x3,y3,width*.95,angle,glove);
}
function drawShoe(x,y,angle,size,accent,front){
  ctx.save(); ctx.translate(x,y); ctx.rotate(angle||0); ctx.scale(size||1,size||1);
  ctx.fillStyle=front?"#ffffff":"#d7dee6"; ctx.beginPath(); ctx.moveTo(-12,-5); ctx.quadraticCurveTo(-8,-11,1,-10); ctx.quadraticCurveTo(12,-9,18,-4); ctx.quadraticCurveTo(19,0,12,1); ctx.lineTo(-10,1); ctx.quadraticCurveTo(-14,-1,-12,-5); ctx.fill();
  ctx.strokeStyle="rgba(0,0,0,.35)"; ctx.lineWidth=1.5; ctx.stroke();
  ctx.fillStyle="#17202b"; ctx.fillRect(-13,0,32,4); ctx.fillStyle=accent; ctx.fillRect(-5,-7,15,3.4);
  ctx.strokeStyle="rgba(23,32,43,.4)"; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(2,-9); ctx.lineTo(7,-5); ctx.moveTo(6,-9); ctx.lineTo(11,-5); ctx.stroke();
  ctx.restore();
}
function drawHumanLeg(x1,y1,x2,y2,x3,y3,width,pants,accent,front,shoeAngle){
  const ankle={x:x3,y:y3-7};
  taperedSegment(x1,y1,x2,y2,width,width*.8,pants,front);
  taperedSegment(x2,y2,ankle.x,ankle.y,width*.74,width*.52,shade(pants,-16),front);
  taperedSegment(lerp(x2,ankle.x,.78),lerp(y2,ankle.y,.78),ankle.x,ankle.y,width*.56,width*.54,pants,false);
  if(front){ ctx.save(); ctx.globalAlpha=.72; ctx.strokeStyle=accent; ctx.lineWidth=2.2; ctx.lineCap="round"; ctx.beginPath(); ctx.moveTo(x1+width*.2,y1+5); ctx.quadraticCurveTo(x2+width*.22,y2,ankle.x+width*.13,ankle.y-4); ctx.stroke(); ctx.restore(); }
  ctx.fillStyle=front?"rgba(255,255,255,.18)":"rgba(0,0,0,.18)"; ctx.beginPath(); ctx.arc(x2,y2,width*.34,0,7); ctx.fill();
  drawShoe(x3+4,y3-1,shoeAngle||0,front?1.14:1.06,accent,front);
}

function drawGhosts(){
  for(const g of ghosts){ ctx.save(); ctx.globalAlpha=(g.life/g.max)*.34; ctx.translate(g.x,g.y); ctx.scale(g.facing*g.scale,g.scale);
    ctx.fillStyle=g.c; ctx.beginPath(); ctx.ellipse(8,-164,14,16,0,0,7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-20*g.bulk,-138); ctx.quadraticCurveTo(2,-149,21*g.bulk,-136); ctx.quadraticCurveTo(17*g.bulk,-106,18*g.bulk,-84); ctx.lineTo(-18*g.bulk,-84); ctx.quadraticCurveTo(-18*g.bulk,-113,-20*g.bulk,-138); ctx.fill();
    taperedSegment(-5,-86,-16,-42,15*g.bulk,9,g.c,false); taperedSegment(7,-86,17,-43,15*g.bulk,9,g.c,false);
    ctx.strokeStyle=g.accent; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(-24,-104); ctx.lineTo(-48,-92); ctx.stroke(); ctx.restore(); }
}
function drawHumanHead(f,sk,ch,human,headX,headY,motion,hurt,down){
  const r=human.headR,sway=motion.hairSway||0;
  const expression=f.dead||down?"KO":hurt?"douleur":f.victory&&(state==="roundEnd"||state==="matchEnd")?"victoire":f.attack?"effort":motion.fatigue>.65?"fatigue":f.blocking?"garde":"focus";
  renderStats.lastFacialExpression=expression; renderStats.lastHumanProfile=ch.id;
  ctx.save();
  ctx.translate(headX,headY+Math.sin(motion.breath)*.5+(motion.headLag||0)*.08);
  ctx.rotate((motion.head||0)*.38+(motion.headLag||0)*.011-motion.hurt*.07);
  ctx.lineCap="round"; ctx.lineJoin="round";
  // Chevelures longues derrière le visage, avec inertie propre.
  if(ch.style==="kunoichi"){
    ctx.strokeStyle=sk.hair; ctx.lineWidth=8; ctx.beginPath(); ctx.moveTo(-r*.42,-r*.72); ctx.quadraticCurveTo(-r*1.25+sway*.55,-r*.18,-r*1.05+sway,r*1.95); ctx.stroke();
    ctx.lineWidth=4.5; ctx.beginPath(); ctx.moveTo(-r*.3,-r*.66); ctx.quadraticCurveTo(-r*.98+sway*.45,0,-r*.82+sway*.85,r*1.62); ctx.stroke();
    ctx.fillStyle=sk.accent; ctx.beginPath(); ctx.arc(-r*.44,-r*.72,3.4,0,7); ctx.fill();
  }else if(ch.style==="nova"||ch.style==="magicienne"){
    ctx.strokeStyle=sk.hair; ctx.lineWidth=9; ctx.beginPath(); ctx.moveTo(-r*.62,-r*.58); ctx.quadraticCurveTo(-r*1.02+sway*.45,r*.55,-r*.72+sway*.9,r*2.05); ctx.stroke();
    ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(-r*.2,-r*.72); ctx.quadraticCurveTo(-r*.72+sway*.35,r*.55,-r*.5+sway*.75,r*1.72); ctx.stroke();
  }else if(ch.style==="Zara"){
    ctx.strokeStyle=sk.hair;
    [-.52,-.28,-.04].forEach((o,i)=>{ ctx.lineWidth=5.5-i*.55; ctx.beginPath(); ctx.moveTo(r*o,-r*.72); ctx.quadraticCurveTo(-r*(1.05-i*.14)+sway*.42,r*(.45+i*.16),-r*(0.92-i*.12)+sway*(0.78+i*.12),r*(1.72+i*.22)); ctx.stroke(); });
    ctx.fillStyle=sk.accent; [-0.92,-0.8,-0.68].forEach((o,i)=>{ ctx.beginPath(); ctx.arc(r*o+sway*(0.78+i*.12),r*(1.78+i*.22),2.7,0,7); ctx.fill(); });
  }
  // Oreille et volume du visage de trois-quarts : front, nez, pommette, mâchoire.
  ctx.fillStyle=shade(sk.skin,-28); ctx.beginPath(); ctx.ellipse(-r*.48,r*.04,r*.17,r*.25,-.12,0,7); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-r*.7,-r*.4);
  ctx.quadraticCurveTo(-r*.76,-r*1.02,0,-r*1.08);
  ctx.quadraticCurveTo(r*.74,-r*1.02,r*.82,-r*.38);
  ctx.quadraticCurveTo(r*.91,-r*.08,r*.82,r*.06);
  ctx.quadraticCurveTo(r*1.04,r*.25,r*.98,r*.39);
  ctx.quadraticCurveTo(r*.78,r*.45,r*.76,r*.57);
  ctx.quadraticCurveTo(r*.82,r*.76,r*human.jaw,r*.94);
  ctx.quadraticCurveTo(0,r*1.03,-r*.48,r*.74);
  ctx.quadraticCurveTo(-r*.84,r*.28,-r*.7,-r*.4);
  ctx.closePath(); ctx.fillStyle=sk.skin; ctx.fill(); ctx.strokeStyle="rgba(25,12,6,.42)"; ctx.lineWidth=1.8; ctx.stroke();
  ctx.save(); ctx.globalAlpha=.22; ctx.fillStyle=shade(sk.skin,-46); ctx.beginPath(); ctx.ellipse(-r*.48,r*.13,r*.27,r*.58,-.18,0,7); ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalAlpha=.2; ctx.fillStyle="#ffffff"; ctx.beginPath(); ctx.ellipse(r*.34,r*.24,r*.2,r*.1,-.45,0,7); ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalAlpha=.16; ctx.fillStyle=shade(sk.skin,-52); ctx.beginPath(); ctx.ellipse(r*.16,r*.8,r*.44,r*.15,-.12,0,7); ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalAlpha=.22; ctx.strokeStyle="#ffffff"; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(r*.7,-r*.04); ctx.quadraticCurveTo(r*.9,r*.16,r*.93,r*.33); ctx.stroke(); ctx.restore();
  renderStats.facePaint=(renderStats.facePaint||0)+1;
  if(human.beard>0){ ctx.save(); ctx.globalAlpha=human.beard*.34; ctx.fillStyle=sk.hair; ctx.beginPath(); ctx.moveTo(-r*.35,r*.42); ctx.quadraticCurveTo(r*.18,r*.98,r*.68,r*.58); ctx.quadraticCurveTo(r*.48,r*.88,r*.05,r*.88); ctx.quadraticCurveTo(-r*.28,r*.76,-r*.35,r*.42); ctx.fill(); ctx.restore(); }
  // Coiffures signatures, dessinées comme des masses et mèches plutôt qu'un casque.
  ctx.fillStyle=sk.hair;
  if(ch.style==="titan"){
    ctx.beginPath(); ctx.ellipse(-r*.03,-r*.82,r*.58,r*.26,-.04,Math.PI,0); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-r*.48,-r*.82); ctx.lineTo(-r*.25,-r*1.18); ctx.lineTo(-r*.05,-r*.9); ctx.lineTo(r*.18,-r*1.14); ctx.lineTo(r*.3,-r*.84); ctx.closePath(); ctx.fill();
  }else if(ch.style==="kunoichi"){
    ctx.beginPath(); ctx.moveTo(-r*.76,-r*.34); ctx.quadraticCurveTo(-r*.66,-r*1.08,r*.14,-r*1.1); ctx.quadraticCurveTo(r*.82,-r*1.02,r*.76,-r*.48); ctx.quadraticCurveTo(r*.3,-r*.62,0,-r*.47); ctx.quadraticCurveTo(-r*.42,-r*.7,-r*.76,-r*.34); ctx.fill();
    ctx.beginPath(); ctx.moveTo(r*.55,-r*.72); ctx.lineTo(r*.78,-r*.24); ctx.lineTo(r*.55,-r*.3); ctx.closePath(); ctx.fill();
  }else if(ch.style==="nova"||ch.style==="magicienne"){
    ctx.beginPath(); ctx.moveTo(-r*.78,-r*.28); ctx.quadraticCurveTo(-r*.72,-r*1.1,r*.1,-r*1.12); ctx.quadraticCurveTo(r*.86,-r*1.02,r*.8,-r*.4); ctx.quadraticCurveTo(r*.42,-r*.56,-r*.06,-r*.62); ctx.quadraticCurveTo(-r*.52,-r*.68,-r*.78,-r*.28); ctx.fill();
    ctx.strokeStyle=sk.hair; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(r*.64,-r*.55); ctx.quadraticCurveTo(r*.8,r*.1,r*.58,r*.68); ctx.stroke();
  }else if(ch.style==="Zara"){
    ctx.beginPath(); ctx.moveTo(-r*.78,-r*.3); ctx.quadraticCurveTo(-r*.7,-r*1.1,r*.08,-r*1.12); ctx.quadraticCurveTo(r*.82,-r*1.03,r*.78,-r*.42); ctx.quadraticCurveTo(r*.32,-r*.62,-r*.18,-r*.54); ctx.quadraticCurveTo(-r*.58,-r*.7,-r*.78,-r*.3); ctx.fill();
    ctx.strokeStyle=shade(sk.hair,34); ctx.lineWidth=1.5; [-.46,-.18,.12,.4].forEach(o=>{ ctx.beginPath(); ctx.moveTo(r*o,-r*1.02); ctx.quadraticCurveTo(r*(o+.12),-r*.72,r*(o-.05),-r*.5); ctx.stroke(); });
  }else if(ch.style==="synthetique"){
    ctx.beginPath(); ctx.moveTo(-r*.8,-r*.3); ctx.quadraticCurveTo(-r*.75,-r*1.08,0,-r*1.12); ctx.quadraticCurveTo(r*.8,-r*1.05,r*.78,-r*.4); ctx.quadraticCurveTo(r*.3,-r*.58,-r*.1,-r*.55); ctx.quadraticCurveTo(-r*.55,-r*.62,-r*.8,-r*.3); ctx.fill();
    ctx.strokeStyle="rgba(24,255,255,.8)"; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(-r*.2,-r*1.05); ctx.quadraticCurveTo(0,-r*.78,r*.05,-r*.58); ctx.stroke();
    ctx.fillStyle="#18ffff"; ctx.beginPath(); ctx.arc(-r*.62,-r*.32,2,0,7); ctx.fill();
  }else{
    ctx.beginPath(); ctx.moveTo(-r*.78,-r*.34); ctx.quadraticCurveTo(-r*.68,-r*1.08,0,-r*1.11); ctx.quadraticCurveTo(r*.76,-r*1.04,r*.8,-r*.42); ctx.quadraticCurveTo(r*.36,-r*.62,-r*.08,-r*.56); ctx.quadraticCurveTo(-r*.54,-r*.68,-r*.78,-r*.34); ctx.fill();
    ctx.beginPath(); [-.46,-.16,.16,.44].forEach((o,i)=>{ ctx.moveTo(r*o,-r*.94); ctx.lineTo(r*(o+.08),-r*(1.13+(i%2)*.08)); ctx.lineTo(r*(o+.22),-r*.92); }); ctx.fill();
  }
  // Reflet de matière V4.1 (Marco) : lumière sur la chevelure ou le casque.
  ctx.save(); ctx.globalAlpha=.16; ctx.strokeStyle="#ffffff"; ctx.lineWidth=2.4; ctx.beginPath(); ctx.arc(-r*.06,-r*.48,r*.55,Math.PI*1.08,Math.PI*1.52); ctx.stroke(); ctx.restore();
  // Bandeau qui épouse le front ; couronne pour Prime, chapeau pointu pour Sora, capteur pour AEL-7.
  if(ch.style==="magicienne"){
    ctx.fillStyle=sk.primary; ctx.strokeStyle="rgba(10,4,24,.55)"; ctx.lineWidth=1.6;
    ctx.beginPath(); ctx.moveTo(-r*.55,-r*.6); ctx.quadraticCurveTo(-r*.32,-r*1.5,r*.1,-r*1.95+sway*.14); ctx.quadraticCurveTo(r*.48,-r*1.5,r*.52,-r*.6); ctx.quadraticCurveTo(0,-r*.76,-r*.55,-r*.6); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0,-r*.52,r*1.06,r*.21,-.06,0,7); ctx.fill(); ctx.stroke();
    ctx.strokeStyle=sk.accent; ctx.lineWidth=2.4; ctx.beginPath(); ctx.moveTo(-r*.5,-r*.64); ctx.quadraticCurveTo(0,-r*.78,r*.48,-r*.64); ctx.stroke();
    ctx.fillStyle=sk.accent; ctx.beginPath(); ctx.arc(r*.04,-r*.98,3,0,7); ctx.fill();
  }else if(ch.style==="synthetique"){
    ctx.fillStyle="#18ffff"; ctx.beginPath(); ctx.arc(r*.1,-r*.55,2.2,0,7); ctx.fill();
  }else if(ch.style!=="prime"){
    ctx.strokeStyle=sk.primary; ctx.lineWidth=6.5; ctx.beginPath(); ctx.moveTo(-r*.74,-r*.4); ctx.quadraticCurveTo(0,-r*.73,r*.79,-r*.42); ctx.stroke();
    ctx.strokeStyle="rgba(255,255,255,.28)"; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(-r*.68,-r*.45); ctx.quadraticCurveTo(0,-r*.75,r*.7,-r*.47); ctx.stroke();
    ctx.strokeStyle=sk.primary; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(-r*.73,-r*.38); ctx.quadraticCurveTo(-r*1.12+sway*.35,-r*.08,-r*1.02+sway*.65,r*.34); ctx.stroke();
    ctx.fillStyle="#fff"; ctx.font="1000 8px Arial"; ctx.textAlign="center";
    ctx.save(); ctx.translate(r*.34,-r*.42); ctx.scale(Math.sign((f.motion&&f.motion.face)||f.facing||1),1); ctx.fillText(f.letter,0,0); ctx.restore();
  }else{
    ctx.fillStyle="#ffc400"; ctx.strokeStyle="#8f4b00"; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(-r*.62,-r*.72); ctx.lineTo(-r*.58,-r*1.1); ctx.lineTo(-r*.24,-r*.84); ctx.lineTo(r*.02,-r*1.22); ctx.lineTo(r*.28,-r*.84); ctx.lineTo(r*.58,-r*1.08); ctx.lineTo(r*.6,-r*.7); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle="#00e5ff"; ctx.beginPath(); ctx.arc(r*.02,-r*.82,2.4,0,7); ctx.fill();
  }
  if(ch.style==="Zara"){ ctx.fillStyle="#ff7043"; [[-.38,-.88],[.02,-1.02],[.36,-.9]].forEach(p=>{ ctx.beginPath(); ctx.arc(r*p[0],r*p[1],3.3,0,7); ctx.fill(); }); ctx.fillStyle="#ffd54f"; ctx.beginPath(); ctx.arc(0,-r*.96,2.3,0,7); ctx.fill(); }
  // Sourcil, œil en amande, iris mobile et clignement.
  const tension=motion.browTension||0,eyeX=r*.43,eyeY=-r*.02;
  ctx.strokeStyle= shade(sk.hair,-8); ctx.lineWidth=2.5; ctx.beginPath(); ctx.moveTo(r*.13,-r*.3+tension*1.2); ctx.quadraticCurveTo(r*.42,-r*.39,r*.69,-r*.29+tension*2.6); ctx.stroke();
  ctx.save(); ctx.globalAlpha=.55; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(-r*.12,-r*.27); ctx.lineTo(r*.08,-r*.25); ctx.stroke(); ctx.restore();
  if(ch.style==="synthetique"&&!f.dead&&!down){
    ctx.fillStyle="#0b1c22"; ctx.beginPath(); ctx.ellipse(r*.32,eyeY,r*.5,r*.2,-.08,0,7); ctx.fill();
    const gx=(motion.gazeX||0)*r*.18;
    ctx.strokeStyle="#18ffff"; ctx.lineWidth=2.6; ctx.beginPath(); ctx.moveTo(r*.05+gx,eyeY); ctx.lineTo(r*.58+gx,eyeY-1); ctx.stroke();
    ctx.fillStyle="#aefcff"; ctx.beginPath(); ctx.arc(r*.42+gx,eyeY,2,0,7); ctx.fill();
  }else if(f.dead||down){
    ctx.strokeStyle="#161616"; ctx.lineWidth=2.1; ctx.beginPath(); ctx.moveTo(eyeX-4,eyeY-4); ctx.lineTo(eyeX+4,eyeY+4); ctx.moveTo(eyeX+4,eyeY-4); ctx.lineTo(eyeX-4,eyeY+4); ctx.stroke();
  }else if(f.blinkT<0){
    ctx.strokeStyle="#161616"; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(eyeX-r*.24,eyeY); ctx.quadraticCurveTo(eyeX,eyeY+2,eyeX+r*.25,eyeY); ctx.stroke();
  }else{
    ctx.fillStyle="#ffffff"; ctx.beginPath(); ctx.moveTo(eyeX-r*.25,eyeY); ctx.quadraticCurveTo(eyeX,eyeY-r*.17,eyeX+r*.26,eyeY); ctx.quadraticCurveTo(eyeX,eyeY+r*.13,eyeX-r*.25,eyeY); ctx.fill(); ctx.strokeStyle="rgba(20,10,4,.55)"; ctx.lineWidth=1.1; ctx.stroke();
    const irisX=eyeX+(motion.gazeX||0)*2.2,irisY=eyeY+(motion.gazeY||0)*1.25;
    ctx.fillStyle="#3a2110"; ctx.beginPath(); ctx.arc(irisX,irisY,r*.105,0,7); ctx.fill(); ctx.fillStyle="#050505"; ctx.beginPath(); ctx.arc(irisX,irisY,r*.055,0,7); ctx.fill(); ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(irisX+r*.035,irisY-r*.04,r*.026,0,7); ctx.fill();
    ctx.strokeStyle="#161616"; ctx.lineWidth=1.7; ctx.beginPath(); ctx.moveTo(eyeX-r*.25,eyeY-r*.02); ctx.quadraticCurveTo(eyeX,eyeY-r*.18,eyeX+r*.26,eyeY-r*.02); ctx.stroke();
    if(ch.style==="kunoichi"||ch.style==="nova"||ch.style==="Zara"||ch.style==="magicienne"){ ctx.lineWidth=1.1; ctx.beginPath(); ctx.moveTo(eyeX+r*.2,eyeY-r*.08); ctx.lineTo(eyeX+r*.31,eyeY-r*.13); ctx.stroke(); }
  }
  // Nez, narine et bouche expressive.
  ctx.strokeStyle="rgba(65,32,12,.68)"; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(r*.78,r*.08); ctx.quadraticCurveTo(r*.95,r*.25,r*.9,r*.38); ctx.stroke();
  ctx.fillStyle="rgba(45,20,8,.72)"; ctx.beginPath(); ctx.arc(r*.78,r*.41,1.25,0,7); ctx.fill();
  const mouthX=r*.58,mouthY=r*.61,open=clamp(motion.mouthOpen||0,0,1);
  if(ch.style==="synthetique"){
    ctx.strokeStyle="rgba(16,32,39,.8)"; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(mouthX-r*.14,mouthY); ctx.lineTo(mouthX+r*.14,mouthY); ctx.stroke();
    ctx.fillStyle="#18ffff"; const lvl=1+Math.round(open*2); for(let i=0;i<lvl;i++)ctx.fillRect(mouthX-6+i*5,mouthY+3,3,2);
  }else if(open>.14){
    ctx.fillStyle="#321109"; ctx.beginPath(); ctx.ellipse(mouthX,mouthY+open*2.2,r*.17,r*(.05+open*.13),-.08,0,7); ctx.fill();
    ctx.fillStyle="#fff"; ctx.fillRect(mouthX-r*.13,mouthY-r*.035,r*.25,r*.055);
    if(open>.55){ ctx.fillStyle="#b44a55"; ctx.beginPath(); ctx.ellipse(mouthX,mouthY+r*.09,r*.09,r*.045,0,0,7); ctx.fill(); }
  }else{
    ctx.strokeStyle="#4a1e10"; ctx.lineWidth=1.8; ctx.beginPath();
    if(expression==="victoire"){ ctx.moveTo(mouthX-r*.18,mouthY-r*.03); ctx.quadraticCurveTo(mouthX+r*.02,mouthY+r*.11,mouthX+r*.2,mouthY-r*.06); }
    else if(expression==="garde"||expression==="effort"){ ctx.moveTo(mouthX-r*.17,mouthY+r*.03); ctx.lineTo(mouthX+r*.18,mouthY+r*.01); }
    else { ctx.moveTo(mouthX-r*.16,mouthY); ctx.quadraticCurveTo(mouthX+r*.02,mouthY+r*.05,mouthX+r*.18,mouthY-r*.02); }
    ctx.stroke();
  }
  if(motion.fatigue>.55&&qualityLevel>0){ ctx.fillStyle="rgba(174,229,255,.9)"; const drop=((renderTicker*.7+f.id*17)%18); ctx.beginPath(); ctx.ellipse(-r*.62,-r*.26+drop,2.1,3.4,.2,0,7); ctx.fill(); }
  ctx.restore();
}

function drawFighter(f){
  const sk=f.skin,ch=f.char,elapsed=f.attackT>0?f.attackDur-f.attackT:0,atk=f.attack;
  const motion=fighterMotion(f),phase=motion.attack,human=humanProfile(f);
  renderStats.humanProfiles=Object.keys(HUMAN_PROFILES).length; renderStats.lastHumanProfile=ch.id;
  const m1Boost=atk&&atk.m1?(4+(atk.m1Step||0)*3+(atk.m1Final?7:0)):0;
  const punchExt=(f.attackType==="punch"||f.attackType==="airPunch")?phase*(48+m1Boost):0;
  const kickExt=(f.attackType==="kick"||f.attackType==="airKick"||f.attackType==="sweep")?phase*(54+m1Boost):0;
  const upperExt=f.attackType==="uppercut"?phase*(44+m1Boost):0;
  if(f.crouchBlend==null)f.crouchBlend=0;
  f.crouchBlend=smoothMotionValue(f.crouchBlend,(f.crouching||f.attackType==="uppercut"||f.attackType==="sweep")?1:0,14);
  const cb=f.crouchBlend;
  const gaitLift=Math.abs(Math.sin(f.walkPhase||0))*motion.run;
  const bob=!f.dead&&f.downT<=0?(Math.sin(motion.breath)*(1.45+motion.fatigue*1.25)*(1-cb*.45)*(1-motion.air*.72)-gaitLift*2.1+motion.weight*.85-motion.hurt*1.3+motion.guard*1.1):0;
  const walking=motion.run>.07&&f.grounded&&f.dashT<=0,hurt=f.hitStun>0,down=f.downT>0;
  drawShadow(f);
  if(f.energy>=50&&!f.dead&&!down){ const size=f.energy>=100?225:168,pulse=1+Math.sin(renderTicker*.12+f.id)*.06; ctx.save(); ctx.globalAlpha=f.energy>=100?.62:.42; ctx.drawImage(glowSprite(sk.trail),f.rx-size*pulse/2,f.ry-104*ch.scale-size*pulse/2,size*pulse,size*pulse); ctx.restore(); }
  ctx.save(); ctx.translate(f.rx,f.ry);
  if(f.dead){ const k=easeOutCubic(Math.min(1,f.koT/25)); ctx.rotate(-f.facing*1.42*k); }
  else if(down){ const k=easeOutCubic(Math.min(1,(42-f.downT)/10)); ctx.rotate(-f.facing*1.38*k); }
  else ctx.rotate((motion.lean+motion.air*clamp(f.vy*.0016,-.025,.035)-motion.hurt*.055+motion.dash*.09)*(f.facing||1));
  let sx=ch.scale*1.08,sy=ch.scale*1.08;
  sy*=1+motion.squash*.045+motion.air*clamp(-f.vy*.0018,-.015,.045); sx*=1-motion.squash*.035;
  const visualFace=Math.abs(motion.face)<.22?(motion.face<0?-.22:.22):motion.face;
  ctx.scale(visualFace*sx,sy);
  if(f.hitFlash>0){ try{ctx.filter="brightness(2.05) saturate(.45)";}catch(e){} }
  const hipY=lerp(-86,-63,cb)+bob,shY=lerp(-140,-113,cb)+bob+motion.fatigue*2.1,headY=lerp(-166,-137,cb)+bob+motion.fatigue*1.2;
  const attackShift=(f.attackType==="throw"?phase*10:f.attackType==="punch"||f.attackType==="airPunch"?phase*8:f.attackType==="kick"||f.attackType==="airKick"?phase*4:f.attackType==="special"||f.attackType==="super"||f.attackType==="exspecial"?phase*6:0);
  const hipX=motion.lean*9+motion.weight*1.15-motion.hurt*2,shX=motion.lean*25+motion.weight*2.1+attackShift+motion.guard*3-motion.hurt*6,headX=6+shX*.62+motion.head*9+(motion.headLag||0)-motion.hurt*3;
  // Cape de Nova et de GODSON PRIME
  if((ch.style==="nova"||ch.style==="prime"||ch.style==="guerrier"||ch.style==="magicienne")&&!f.dead){ ctx.save(); const wv=Math.sin(renderTicker*.09+f.anim*.05)*(6+motion.run*5)-((f.vx||0)+(f.kvx||0))*(f.facing||1)*1.7-motion.dash*9; const cg=cachedLinearGradient("cape:"+sk.dark+":"+sk.accent+":"+Math.round(shY/4),0,shY,0,-8,[[0,sk.dark],[1,sk.accent]]); ctx.fillStyle=cg; ctx.beginPath(); ctx.moveTo(shX-13,shY+4); ctx.quadraticCurveTo(shX-44+wv,-62,hipX-35+wv*1.3,-8); ctx.quadraticCurveTo(hipX-14,-28,hipX-8,hipY); ctx.closePath(); ctx.fill(); ctx.restore(); }
  // Jambes : cycle de marche/course lié à la vitesse, appuis et genoux articulés
  let bFoot={x:hipX-23-motion.lean*8,y:0},fFoot={x:hipX+25+motion.lean*5,y:0},bKnee={x:hipX-16,y:lerp(-44,-31,cb)},fKnee={x:hipX+18,y:lerp(-43,-30,cb)};
  if(cb>.12){ bFoot.x=lerp(bFoot.x,hipX-29,cb); fFoot.x=lerp(fFoot.x,hipX+27,cb); }
  if(walking){
    const strideDir=Math.sign(((f.vx||0)+(f.kvx||0))*(f.facing||1))||1,stride=(15+motion.run*18)*strideDir,s=Math.sin(f.walkPhase||0),c=Math.cos(f.walkPhase||0),mix=clamp(motion.run*1.35,0,1);
    bFoot.x=lerp(bFoot.x,hipX-4-s*stride,mix); fFoot.x=lerp(fFoot.x,hipX+6+s*stride,mix);
    bFoot.y=lerp(bFoot.y,-Math.max(0,-c)*(4+motion.run*8),mix); fFoot.y=lerp(fFoot.y,-Math.max(0,c)*(4+motion.run*8),mix);
    bKnee.x=(hipX-4+bFoot.x)/2+7*strideDir; fKnee.x=(hipX+5+fFoot.x)/2+8*strideDir;
    bKnee.y=lerp(bKnee.y,-46-Math.max(0,-c)*7,mix); fKnee.y=lerp(fKnee.y,-46-Math.max(0,c)*7,mix);
  }
  if(!f.dead&&motion.air>.03){
    const a=motion.air,airSwing=clamp(f.vy*.22,-3,4);
    bFoot={x:lerp(bFoot.x,hipX-18-airSwing,a),y:lerp(bFoot.y,-29+airSwing,a)}; fFoot={x:lerp(fFoot.x,hipX+23+airSwing,a),y:lerp(fFoot.y,-18-airSwing,a)};
    bKnee={x:lerp(bKnee.x,hipX-12,a),y:lerp(bKnee.y,-55,a)}; fKnee={x:lerp(fKnee.x,hipX+20,a),y:lerp(fKnee.y,-55,a)};
  }
  if(f.attackType==="kick"){ fFoot={x:hipX+45+kickExt,y:-92-phase*4}; fKnee={x:hipX+27+kickExt*.45,y:-96}; }
  if(f.attackType==="airKick"){ fFoot={x:hipX+45+kickExt,y:-56-phase*3}; fKnee={x:hipX+27+kickExt*.4,y:-70}; }
  if(f.attackType==="sweep"){ fFoot={x:hipX+45+kickExt,y:-8}; fKnee={x:hipX+27+kickExt*.45,y:-25}; }
  if(motion.dash>.04){ const d=motion.dash; bFoot={x:lerp(bFoot.x,hipX-34,d),y:lerp(bFoot.y,-7,d)}; fFoot={x:lerp(fFoot.x,hipX+31,d),y:lerp(fFoot.y,-2,d)}; }
  if(!f.dead){
    bKnee=solveJoint(hipX-4,hipY,bFoot.x,bFoot.y-7,46,45,-1);
    if(f.attackType!=="kick"&&f.attackType!=="airKick"&&f.attackType!=="sweep")fKnee=solveJoint(hipX+5,hipY,fFoot.x,fFoot.y-7,46,45,-1);
  }
  const legW=20.2*human.limb;
  const backShoeAngle=clamp(-bFoot.y*.018,0,.34),frontShoeAngle=f.attackType==="kick"||f.attackType==="airKick"?-.1:clamp(-fFoot.y*.018,0,.34);
  drawHumanLeg(hipX-4,hipY,bKnee.x,bKnee.y,bFoot.x,bFoot.y,legW,shade(sk.pants,-22),sk.accent,false,backShoeAngle);
  drawHumanLeg(hipX+5,hipY,fKnee.x,fKnee.y,fFoot.x,fFoot.y,legW+1.6,sk.pants,sk.accent,true,frontShoeAngle);
  // Bras arrière : balancier opposé à la foulée + transition douce vers la garde
  const armSwing=Math.sin(f.walkPhase||0)*9*motion.run*(Math.sign(((f.vx||0)+(f.kvx||0))*(f.facing||1))||1),guardMix=motion.guard;
  const backHand={x:lerp(shX-8+armSwing,shX+24,guardMix),y:lerp(-82+bob+cb*6-Math.abs(armSwing)*.16,shY+13,guardMix)};
  drawHumanArm(shX-6,shY+5,lerp(shX-21+armSwing*.45,shX+18,guardMix),lerp(-98+bob+cb*8,shY+27,guardMix),backHand.x,backHand.y,15.6*human.limb,sk.dark,shade(sk.skin,-24),sk.glove,false);
  // Buste humain : cou, trapèzes, cage thoracique, taille et bassin ne forment
  // plus un rectangle. Épaules et hanches contre-tournent comme dans la marche.
  const shoulderHalf=human.shoulder*(0.9+ch.bulk*.2)*(1+Math.sin(motion.breath)*.012),hipHalf=human.hip*(0.92+ch.bulk*.18);
  const waistX=lerp(hipX,shX,.48)+(motion.clothSway||0)*.12,waistY=lerp(hipY,shY,.48);
  const shoulderBack={x:shX-shoulderHalf,y:shY+5-(motion.shoulderRoll||0)},shoulderFront={x:shX+shoulderHalf,y:shY+5+(motion.shoulderRoll||0)};
  const hipBack={x:hipX-hipHalf,y:hipY+3-(motion.pelvisRoll||0)},hipFront={x:hipX+hipHalf,y:hipY+3+(motion.pelvisRoll||0)};
  ctx.fillStyle=shade(sk.skin,-18); ctx.beginPath();
  ctx.moveTo(headX-human.neck*.5,headY+human.headR*.66); ctx.lineTo(headX+human.neck*.36,headY+human.headR*.72);
  ctx.lineTo(shX+human.neck*.82,shY+9); ctx.lineTo(shX-human.neck*.9,shY+9); ctx.closePath(); ctx.fill();
  ctx.strokeStyle="rgba(25,12,6,.28)"; ctx.lineWidth=1.4; ctx.stroke();
  const light=shade(sk.primary,28);
  const tg=cachedLinearGradient("torso-human:"+sk.dark+":"+sk.primary+":"+light+":"+Math.round(shoulderHalf)+":"+Math.round(hipY/4)+":"+Math.round(shY/4),-shoulderHalf,hipY,shoulderHalf,shY,[[0,sk.dark],[.55,sk.primary],[1,light]]);
  ctx.fillStyle=tg; ctx.beginPath();
  ctx.moveTo(shoulderBack.x,shoulderBack.y);
  ctx.quadraticCurveTo(shX-human.neck*.72,shY-7,shX-2,shY-5);
  ctx.quadraticCurveTo(shX+human.neck*.74,shY-7,shoulderFront.x,shoulderFront.y);
  ctx.quadraticCurveTo(waistX+hipHalf*.82,waistY,hipFront.x,hipFront.y+4);
  ctx.quadraticCurveTo(hipX,hipY+13,hipBack.x,hipBack.y+4);
  ctx.quadraticCurveTo(waistX-hipHalf*.8,waistY,shoulderBack.x,shoulderBack.y);
  ctx.closePath(); ctx.fill(); ctx.strokeStyle="rgba(0,0,0,.42)"; ctx.lineWidth=2.1; ctx.stroke();
  const rimColor=currentArenaMood==="nuit"?"#7fb2ff":currentArenaMood==="jour"?"#fff3b0":"#ffb37a";
  renderStats.rimLight=rimColor;
  ctx.save(); ctx.globalAlpha=.55; ctx.strokeStyle=rimColor; ctx.lineWidth=2.3; ctx.lineCap="round"; ctx.beginPath(); ctx.moveTo(shoulderBack.x+1,shoulderBack.y+2); ctx.quadraticCurveTo(waistX-hipHalf*.78,waistY,hipBack.x+1,hipBack.y+3); ctx.stroke(); ctx.restore();
  // Volume du bassin/vêtement et ceinture articulée sur les hanches.
  ctx.fillStyle=sk.pants; ctx.beginPath();
  ctx.moveTo(hipBack.x-1,hipBack.y+1); ctx.lineTo(hipFront.x+1,hipFront.y+1);
  ctx.quadraticCurveTo(hipX+hipHalf*.72,hipY+22,hipX+3,hipY+23);
  ctx.quadraticCurveTo(hipX-hipHalf*.72,hipY+22,hipBack.x-1,hipBack.y+1); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle="#111827"; ctx.beginPath(); ctx.moveTo(hipBack.x-2,hipBack.y-3); ctx.lineTo(hipFront.x+2,hipFront.y-3); ctx.lineTo(hipFront.x+1,hipFront.y+6); ctx.lineTo(hipBack.x-1,hipBack.y+6); ctx.closePath(); ctx.fill();
  ctx.fillStyle=sk.accent; ctx.fillRect(hipX-8,hipY-3+(motion.pelvisRoll||0)*.25,17,9); ctx.fillStyle="rgba(0,0,0,.35)"; ctx.fillRect(hipX-4,hipY-1+(motion.pelvisRoll||0)*.25,9,5);
  // Deltoïdes, clavicule, ombre latérale et plis qui suivent l'inertie du tissu.
  ctx.fillStyle=sk.primary; ctx.beginPath(); ctx.arc(shoulderBack.x+2,shoulderBack.y+3,9.6*human.limb,0,7); ctx.arc(shoulderFront.x-2,shoulderFront.y+3,10.2*human.limb,0,7); ctx.fill();
  if(ch.style==="titan"||ch.style==="prime"||ch.style==="guerrier"||ch.style==="synthetique"){ ctx.fillStyle=ch.style==="prime"?"#ffc400":(ch.style==="synthetique"?sk.primary:(ch.style==="guerrier"?"#90a4ae":"#37474f")); ctx.beginPath(); ctx.arc(shoulderBack.x+2,shoulderBack.y+2,10.6,0,7); ctx.arc(shoulderFront.x-2,shoulderFront.y+2,10.6,0,7); ctx.fill(); ctx.strokeStyle=ch.style==="prime"?"#fff3c4":"#90a4ae"; ctx.stroke(); }
  ctx.save(); ctx.globalAlpha=.18; ctx.fillStyle="#000"; ctx.beginPath(); ctx.ellipse(waistX-hipHalf*.48,waistY+4,hipHalf*.28,25,.08,0,7); ctx.fill(); ctx.restore();
  ctx.save(); ctx.strokeStyle="rgba(0,0,0,.24)"; ctx.lineWidth=1.5;
  [-.38,0,.36].forEach((o,i)=>{ ctx.beginPath(); ctx.moveTo(shX+shoulderHalf*o,shY+12); ctx.quadraticCurveTo(waistX+hipHalf*o+(motion.clothSway||0)*(.22+i*.08),waistY,hipX+hipHalf*o*.82,hipY-2); ctx.stroke(); });
  ctx.strokeStyle="rgba(255,255,255,.24)"; ctx.beginPath(); ctx.moveTo(shX-shoulderHalf*.55,shY+8); ctx.quadraticCurveTo(shX,shY+1,shX+shoulderHalf*.52,shY+8); ctx.stroke(); ctx.restore();
  // Tenues signatures V4 HD : col, lumière rasante et détails propres à chaque style.
  ctx.save(); ctx.lineCap="round"; ctx.lineJoin="round";
  ctx.strokeStyle=sk.accent; ctx.lineWidth=2.2; ctx.globalAlpha=.8; ctx.beginPath(); ctx.moveTo(shX-8,shY+2); ctx.lineTo(shX+3,shY+17); ctx.lineTo(shX+13,shY+2); ctx.stroke();
  ctx.globalAlpha=.3; ctx.strokeStyle="#ffffff"; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(shoulderFront.x-2,shoulderFront.y+5); ctx.quadraticCurveTo(waistX+hipHalf*.76,waistY,hipFront.x-1,hipFront.y+2); ctx.stroke();
  ctx.globalAlpha=.9; ctx.lineWidth=2.1;
  if(ch.style==="guerrier"||ch.style==="titan"){
    ctx.strokeStyle="rgba(0,0,0,.34)"; ctx.beginPath(); ctx.moveTo(shX-shoulderHalf*.62,shY+20); ctx.quadraticCurveTo(shX,shY+28,shX+shoulderHalf*.62,shY+20); ctx.moveTo(shX-shoulderHalf*.55,shY+34); ctx.quadraticCurveTo(shX,shY+42,shX+shoulderHalf*.55,shY+34); ctx.stroke();
    ctx.strokeStyle=sk.accent; ctx.beginPath(); ctx.moveTo(shX+2,shY+16); ctx.lineTo(shX+2,hipY-3); ctx.stroke();
  }else if(ch.style==="synthetique"){
    ctx.strokeStyle=sk.accent; ctx.beginPath(); ctx.moveTo(shX-shoulderHalf*.58,shY+22); ctx.lineTo(shX+shoulderHalf*.58,shY+22); ctx.moveTo(shX+3,shY+34); ctx.lineTo(shX+3,hipY-4); ctx.stroke();
    ctx.fillStyle=sk.accent; ctx.beginPath(); ctx.moveTo(shX+3,shY+39); ctx.lineTo(shX+8,shY+45); ctx.lineTo(shX+3,shY+51); ctx.lineTo(shX-2,shY+45); ctx.closePath(); ctx.fill();
  }else if(ch.style==="magicienne"){
    ctx.strokeStyle="#ffd54f"; ctx.beginPath(); ctx.moveTo(shX-6,shY+8); ctx.quadraticCurveTo(shX+3,waistY,shX+2,hipY-2); ctx.moveTo(shX+12,shY+8); ctx.quadraticCurveTo(shX+6,waistY,shX+8,hipY-2); ctx.stroke();
    ctx.fillStyle=sk.accent; ctx.beginPath(); ctx.arc(shX+4,waistY+5,3.2,0,7); ctx.fill();
  }else if(ch.style==="prime"){
    ctx.strokeStyle="#ffc400"; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(shoulderBack.x+7,shoulderBack.y+8); ctx.quadraticCurveTo(waistX,waistY,hipFront.x-4,hipFront.y); ctx.stroke();
  }else if(ch.style==="kunoichi"){
    ctx.strokeStyle=sk.dark; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(shoulderFront.x-6,shoulderFront.y+7); ctx.quadraticCurveTo(waistX,waistY,hipBack.x+5,hipBack.y); ctx.stroke();
    ctx.strokeStyle=sk.accent; ctx.lineWidth=1.8; ctx.beginPath(); ctx.moveTo(shoulderFront.x-9,shoulderFront.y+10); ctx.quadraticCurveTo(waistX-2,waistY+2,hipBack.x+3,hipBack.y+3); ctx.stroke();
  }else if(ch.style==="nova"){
    ctx.strokeStyle=sk.accent; ctx.beginPath(); ctx.arc(shX+4,shY+24,15,3.75,5.75); ctx.stroke(); ctx.beginPath(); ctx.arc(shX+4,shY+24,19,0.55,2.35); ctx.stroke();
  }else if(ch.style==="Zara"){
    ctx.strokeStyle=sk.accent; ctx.beginPath(); ctx.moveTo(shX-shoulderHalf*.55,shY+37); ctx.quadraticCurveTo(shX-shoulderHalf*.2,shY+30,shX,shY+37); ctx.quadraticCurveTo(shX+shoulderHalf*.25,shY+44,shX+shoulderHalf*.55,shY+36); ctx.stroke();
  }else{
    ctx.strokeStyle=sk.accent; ctx.beginPath(); ctx.moveTo(shX-shoulderHalf*.58,shY+18); ctx.lineTo(shX+shoulderHalf*.58,shY+18); ctx.moveTo(shX-shoulderHalf*.5,shY+31); ctx.lineTo(shX+shoulderHalf*.5,shY+31); ctx.stroke();
  }
  // Tenues de combat peintes V4.4 (Marco) : ouverture du vêtement, col et plis du tissu.
  ctx.save(); ctx.lineCap="round";
  ctx.globalAlpha=.5; ctx.strokeStyle=shade(sk.primary,-52); ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(shoulderFront.x-5,shoulderFront.y+8); ctx.quadraticCurveTo(waistX+hipHalf*.68,waistY,hipFront.x-3,hipFront.y-2); ctx.stroke();
  ctx.globalAlpha=.85; ctx.strokeStyle=sk.accent; ctx.lineWidth=2.6;
  ctx.beginPath(); ctx.moveTo(shX-human.neck*1.15,shY+12); ctx.quadraticCurveTo(shX+3,shY+17,shX+human.neck*1.2,shY+12); ctx.stroke();
  ctx.globalAlpha=.16; ctx.strokeStyle="#000000"; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(shX-shoulderHalf*.25,shY+22); ctx.quadraticCurveTo(waistX-3,waistY-4,hipX-hipHalf*.3,hipY-4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(shX+shoulderHalf*.18,shY+26); ctx.quadraticCurveTo(waistX+5,waistY,hipX+hipHalf*.28,hipY-3); ctx.stroke();
  ctx.globalAlpha=.2; ctx.strokeStyle="#ffffff";
  ctx.beginPath(); ctx.moveTo(shX-shoulderHalf*.45,shY+16); ctx.quadraticCurveTo(waistX-hipHalf*.4,waistY,hipBack.x+4,hipBack.y-2); ctx.stroke();
  ctx.restore(); renderStats.torsoPaint=(renderStats.torsoPaint||0)+1;
  renderStats.outfitDetails=(renderStats.outfitDetails||0)+1; ctx.restore();
  // Peinture & matières V4.1 (Marco) : métal brossé, énergie, étincelles, tissus.
  ctx.save(); ctx.lineCap="round"; ctx.lineJoin="round";
  const matPulse=.5+.5*Math.sin(renderTicker*.11+(f.id||1)*1.7);
  if(ch.style==="guerrier"||ch.style==="titan"||ch.style==="prime"){
    ctx.globalAlpha=.16+.1*matPulse; ctx.strokeStyle="#ffffff"; ctx.lineWidth=7; ctx.beginPath(); ctx.moveTo(shX-shoulderHalf*.5,shY+12); ctx.lineTo(shX+shoulderHalf*.18,waistY+8); ctx.stroke();
    ctx.globalAlpha=.55; ctx.fillStyle="rgba(8,10,18,.8)";
    [[-.62,14],[.62,14],[-.55,34],[.55,34]].forEach(pt=>{ ctx.beginPath(); ctx.arc(shX+shoulderHalf*pt[0],shY+pt[1],1.7,0,7); ctx.fill(); });
  }else if(ch.style==="synthetique"){
    ctx.globalAlpha=.3+.25*matPulse; ctx.drawImage(glowSprite(sk.accent),shX-14,shY+31,34,34);
    ctx.globalAlpha=.6; ctx.strokeStyle=sk.accent; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(shX-shoulderHalf*.6,waistY+4); ctx.lineTo(shX+shoulderHalf*.6,waistY+4); ctx.moveTo(shX-shoulderHalf*.45,hipY-7); ctx.lineTo(shX+shoulderHalf*.48,hipY-7); ctx.stroke();
  }else if(ch.style==="magicienne"||ch.style==="nova"){
    ctx.fillStyle="#ffffff";
    for(let i=0;i<5;i++){ const ox=(pseudo(i*17+(f.charIndex||0)*31)-.5)*shoulderHalf*1.5,oy=shY+16+pseudo(i*29+7)*44,tw=.3+.45*Math.abs(Math.sin(renderTicker*.09+i*1.4)); ctx.globalAlpha=tw; ctx.beginPath(); ctx.moveTo(shX+ox,oy-3.4); ctx.lineTo(shX+ox+1.1,oy-1.1); ctx.lineTo(shX+ox+3.4,oy); ctx.lineTo(shX+ox+1.1,oy+1.1); ctx.lineTo(shX+ox,oy+3.4); ctx.lineTo(shX+ox-1.1,oy+1.1); ctx.lineTo(shX+ox-3.4,oy); ctx.lineTo(shX+ox-1.1,oy-1.1); ctx.closePath(); ctx.fill(); }
  }else if(ch.style==="Zara"){
    ctx.strokeStyle="#e0f7fa"; ctx.lineWidth=1.4;
    for(let i=0;i<4;i++){ const ox=(pseudo(i*23+11)-.5)*shoulderHalf*1.4,oy=shY+30+pseudo(i*13+3)*22; ctx.globalAlpha=.35+.3*Math.abs(Math.sin(renderTicker*.07+i)); ctx.beginPath(); ctx.arc(shX+ox,oy,2.1+(i%2),0,7); ctx.stroke(); }
  }else if(ch.style==="kunoichi"){
    ctx.globalAlpha=.5; ctx.strokeStyle="rgba(0,0,0,.4)"; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(shX-shoulderHalf*.4,shY+16); ctx.lineTo(shX+shoulderHalf*.3,waistY+6); ctx.moveTo(shX+shoulderHalf*.42,shY+18); ctx.lineTo(shX-shoulderHalf*.28,waistY+8); ctx.stroke();
  }else{
    ctx.globalAlpha=.85; ctx.strokeStyle=sk.accent; ctx.lineWidth=2.2; const bx=shX-shoulderHalf*.66,by=shY+16; ctx.beginPath(); ctx.moveTo(bx+5,by); ctx.lineTo(bx-2,by+10); ctx.lineTo(bx+2.5,by+10); ctx.lineTo(bx-4,by+21); ctx.stroke();
  }
  renderStats.materialDetails=(renderStats.materialDetails||0)+1; ctx.restore();
  const emblemX=shX+4,emblemY=shY+24,boardMotif=boardOutfitMotif(f);
  ctx.save(); ctx.lineCap="round"; ctx.lineJoin="round";
  if(qualityLevel>0){
    ctx.globalAlpha=.46; ctx.strokeStyle=sk.accent; ctx.lineWidth=3.1;
    ctx.beginPath(); ctx.moveTo(shoulderFront.x-4,shoulderFront.y+8); ctx.quadraticCurveTo(waistX+2,waistY,hipBack.x+4,hipBack.y-1); ctx.stroke();
    ctx.globalAlpha=.8; ctx.fillStyle=sk.accent;
    [.24,.5,.76].forEach(t=>{ ctx.beginPath(); ctx.arc(lerp(shoulderFront.x-4,hipBack.x+4,t),lerp(shoulderFront.y+8,hipBack.y-1,t),1.5,0,7); ctx.fill(); });
    ctx.globalAlpha=.42; ctx.drawImage(glowSprite(sk.accent),emblemX-19,emblemY-19,38,38); ctx.globalAlpha=1;
  }
  ctx.fillStyle=shade(sk.dark,-8); ctx.beginPath(); ctx.arc(emblemX,emblemY,11.2,0,7); ctx.fill();
  ctx.strokeStyle=sk.accent; ctx.lineWidth=2.4; ctx.stroke();
  ctx.fillStyle=shade(sk.primary,-18); ctx.beginPath(); ctx.arc(emblemX,emblemY,8.7,0,7); ctx.fill();
  drawBoardMotif(boardMotif,emblemX,emblemY,10.6,"#ffffff");
  ctx.fillStyle="rgba(255,255,255,.94)"; ctx.beginPath(); ctx.arc(emblemX+9.5,emblemY+9.5,5.6,0,7); ctx.fill(); ctx.strokeStyle="rgba(0,0,0,.28)"; ctx.lineWidth=1; ctx.stroke();
  ctx.fillStyle=sk.dark; ctx.font="1000 7px Arial"; ctx.textAlign="center";
  // Contre-miroir : l'initiale du joueur reste lisible quand le combattant regarde à gauche.
  ctx.save(); ctx.translate(emblemX+9.5,emblemY+12); ctx.scale(Math.sign(visualFace)||1,1); ctx.fillText(f.letter,0,0); ctx.restore();
  renderStats.boardOutfit=ch.id+":"+boardMotif; renderStats.boardOutfits=(renderStats.boardOutfits||0)+1;
  ctx.restore();
  drawHumanHead(f,sk,ch,human,headX,headY,motion,hurt,down);
  // Bras avant selon pose
  const armW=16.4*human.limb;
  if(f.victory&&(state==="roundEnd"||state==="matchEnd")&&!f.dead){
    drawHumanArm(shX+8,shY+4,shX+22,-154+bob,shX+27,-190+bob+Math.sin(renderTicker*.15)*4,armW,sk.primary,sk.skin,sk.glove,true);
  }else if(guardMix>.08&&f.attackT<=0){
    const g=guardMix,frontSwing=-armSwing*.35*(1-g);
    drawHumanArm(shX+8,shY+4,lerp(shX+24+frontSwing,shX+27,g),lerp(shY+16,shY+15,g),lerp(shX+34+frontSwing*1.35,shX+24,g),lerp(shY+12+Math.sin(motion.breath)*1.2,shY+21,g),armW,sk.primary,sk.skin,sk.glove,true);
  }else if(f.attackType==="throw"){
    const ext=phase*30;
    drawHumanArm(shX+8,shY+4,shX+27+ext*.35,shY+10,shX+48+ext,shY+9,armW,sk.primary,sk.skin,sk.glove,true);
    drawHumanArm(shX-2,shY+7,shX+20+ext*.3,shY+28,shX+42+ext,shY+25,armW-1,sk.dark,shade(sk.skin,-24),sk.glove,false);
  }else if(f.attackType==="special"||f.attackType==="super"||f.attackType==="exspecial"){
    const ext=phase*21;
    drawHumanArm(shX+8,shY+4,shX+26,shY+11,shX+39+ext,shY+14,armW,sk.primary,sk.skin,sk.glove,true);
    drawHumanArm(shX-2,shY+6,shX+18,shY+27,shX+36+ext,shY+18,armW-1,sk.dark,shade(sk.skin,-24),sk.glove,false);
  }else if(f.attackType==="uppercut"){
    drawHumanArm(shX+8,shY+5,shX+25,shY+28-upperExt*.5,shX+30+upperExt*.22,shY-8-upperExt,armW,sk.primary,sk.skin,sk.glove,true);
  }else if(state==="intro"&&introT>82){
    drawHumanArm(shX+8,shY+4,shX+27,shY+8,shX+47,shY+2,armW,sk.primary,sk.skin,sk.glove,true);
  }else{
    const frontSwing=-armSwing*(f.attackType?0:.85),guardDrift=Math.sin(motion.breath*1.15)*1.6;
    drawHumanArm(shX+8,shY+4,shX+24+punchExt*.35+frontSwing*.4,shY+16+guardDrift,shX+34+punchExt+frontSwing,shY+12+guardDrift,armW,sk.primary,sk.skin,sk.glove,true);
  }
  // Traînées d’attaque
  if(atk&&elapsed>=atk.start&&elapsed<=atk.end+2&&f.attackType!=="special"&&f.attackType!=="super"&&f.attackType!=="exspecial"){
    const isM1=!!atk.m1;
    if(isM1){ renderStats.m1Trail=(renderStats.m1Trail||0)+1; renderStats.m1Fx=ch.id+":"+(atk.m1Fx||"signature")+":"+(atk.m1Step||0); }
    ctx.save(); ctx.globalAlpha=isM1?.74:.55; ctx.strokeStyle=sk.trail; ctx.lineWidth=(f.attackType.includes("kick")||f.attackType==="sweep"?9:7)+(isM1?1.5+(atk.m1Step||0)+(atk.m1Final?2:0):0); ctx.lineCap="round";
    ctx.beginPath();
    if(f.attackType==="uppercut"){ctx.moveTo(shX+22,shY+30);ctx.quadraticCurveTo(shX+46,shY-12,shX+34,shY-48);}
    else if(f.attackType==="sweep"){ctx.moveTo(hipX+15,-12);ctx.quadraticCurveTo(hipX+58,-20,hipX+92,-8);}
    else if(f.attackType.includes("kick")){ctx.moveTo(hipX+18,-62);ctx.quadraticCurveTo(hipX+64,-92,hipX+98,-72);}
    else {ctx.moveTo(shX+26,shY+13);ctx.lineTo(shX+78,shY+11);}
    ctx.stroke();
    if(isM1){ // seconde traînée décalée : la chaîne s'intensifie visuellement coup après coup
      ctx.globalAlpha=.34; ctx.lineWidth=3; ctx.beginPath();
      const off=5+(atk.m1Step||0)*3;
      if(f.attackType==="uppercut"){ctx.moveTo(shX+22-off,shY+30);ctx.quadraticCurveTo(shX+46-off,shY-12,shX+34-off,shY-48);}
      else if(f.attackType==="sweep"){ctx.moveTo(hipX+15,-12-off);ctx.quadraticCurveTo(hipX+58,-20-off,hipX+92,-8-off);}
      else if(f.attackType.includes("kick")){ctx.moveTo(hipX+18,-62+off);ctx.quadraticCurveTo(hipX+64,-92+off,hipX+98,-72+off);}
      else {ctx.moveTo(shX+26,shY+13-off);ctx.lineTo(shX+78,shY+11-off);}
      ctx.stroke();
    }
    ctx.restore();
  }
  try{ctx.filter="none";}catch(e){}
  ctx.restore();
  if(down||f.dead){ ctx.save(); ctx.fillStyle="#ffd54f"; ctx.font="15px Arial"; ctx.textAlign="center"; for(let i=0;i<3;i++){ const a=renderTicker*.09+i*2.1; ctx.fillText("★",f.rx+Math.cos(a)*24,f.ry-30+Math.sin(a)*7); } ctx.restore(); }
  if(f.blocking||f.parryFlashT>0){ const parryReady=f.parryT>0||f.parryFlashT>0; ctx.save(); ctx.strokeStyle=parryReady?"rgba(255,196,0,.98)":"rgba(129,212,250,.95)"; ctx.fillStyle=parryReady?"rgba(255,196,0,.2)":"rgba(79,195,247,.15)"; ctx.lineWidth=parryReady?5:4; ctx.drawImage(glowSprite(parryReady?"#ffc400":"#4fc3f7"),f.rx+f.facing*36-48,f.ry-112*ch.scale-48,96,96); ctx.beginPath(); ctx.arc(f.rx+f.facing*36,f.ry-106*ch.scale,(50+(f.parryFlashT>0?(16-f.parryFlashT)*1.4:0))*ch.scale,f.facing>0?-.95:Math.PI-.95,f.facing>0?.95:Math.PI+.95); ctx.fill(); ctx.stroke(); ctx.restore(); }
  if(f.counterWindowT>0&&isCombat()){ ctx.save(); ctx.font="1000 12px 'Segoe UI',Arial"; ctx.textAlign="center"; ctx.fillStyle="rgba(90,50,0,.82)"; rr(f.rx-43,f.ry-236*ch.scale,86,20,10); ctx.fill(); ctx.fillStyle="#ffc400"; ctx.fillText("⚡ RIPOSTE !",f.rx,f.ry-222*ch.scale); ctx.restore(); }
  /* V3.4 : plus de plaque de nom au-dessus des combattants — le HUD affiche déjà les noms ; la zone de combat reste dégagée. */
}
const SIGNATURE_VFX={gideon:"foudre",kira:"traînées",titan:"éclats sismiques",nova:"orbites","godson-prime":"couronne royale",Zara:"écume",kael:"lames",sora:"runes",ael:"circuits","Lira":"lames","zed":"traînées","nyx":"circuits","vorak":"éclats sismiques","aerin":"traînées","korben":"circuits","lyra":"orbites","drakesh":"circuits","selene":"lames","taiko":"lames","vex":"éclats sismiques","elara":"runes","brax":"éclats sismiques","kazu":"lames","sera":"circuits","vorga":"écume","nox":"runes","raven":"circuits","zep":"circuits","astrid":"couronne royale","selenia":"traînées","drakar":"éclats sismiques","nyx-ombre":"traînées","Kairos":"foudre","Zara-nova":"circuits","brutus":"éclats sismiques","aria":"orbites","krak":"éclats sismiques","luna":"circuits","velen":"traînées","lyra-azur":"couronne royale","orion":"foudre"};
function signatureVfxStyle(owner){ return SIGNATURE_VFX[(owner&&owner.char&&owner.char.id)||""]||"énergie"; }
function drawSignatureVfx(pr){
  const owner=pr.owner||{},style=signatureVfxStyle(owner),trail=(owner.skin&&owner.skin.trail)||"#ffc400";
  const dir=Math.sign(pr.vx||owner.facing||1)||1,count=qualityLevel===0?2:qualityLevel===1?3:5,r=Math.max(10,pr.r||16);
  renderStats.signatureVfx++; renderStats.lastSignatureVfx=((owner.char&&owner.char.id)||"inconnu")+":"+style;
  ctx.save(); ctx.lineCap="round"; ctx.lineJoin="round";
  if(style==="foudre"){
    ctx.strokeStyle="#ffe082"; ctx.lineWidth=2.4; ctx.globalAlpha=.9;
    for(let i=0;i<count;i++){ const a=renderTicker*.07+i*1.26,x=pr.rx+Math.cos(a)*r*.78,y=pr.ry+Math.sin(a)*r*.58; ctx.beginPath(); ctx.moveTo(x-7,y+5); ctx.lineTo(x,y-3); ctx.lineTo(x-3,y-3); ctx.lineTo(x+5,y-10); ctx.stroke(); }
  }else if(style==="traînées"){
    ctx.strokeStyle=trail; ctx.lineWidth=3; ctx.globalAlpha=.75;
    for(let i=0;i<count;i++){ const y=pr.ry+(i-(count-1)/2)*r*.28; ctx.beginPath(); ctx.moveTo(pr.rx-dir*r*.35,y); ctx.lineTo(pr.rx-dir*r*(1.5+i*.16),y+Math.sin(renderTicker*.12+i)*2); ctx.stroke(); }
  }else if(style==="éclats sismiques"){
    ctx.fillStyle="#ffccbc"; ctx.strokeStyle=trail; ctx.lineWidth=2;
    for(let i=0;i<count;i++){ const a=i*1.35+renderTicker*.025,x=pr.rx+Math.cos(a)*r*.85,y=pr.ry+Math.sin(a)*r*.62; ctx.beginPath(); ctx.moveTo(x,y-r*.22); ctx.lineTo(x+r*.2,y+r*.14); ctx.lineTo(x-r*.18,y+r*.18); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    ctx.globalAlpha=.42; ctx.beginPath(); ctx.ellipse(pr.rx,Math.min(GROUND-4,pr.ry+r),r*(1.15+Math.sin(renderTicker*.08)*.08),r*.3,0,0,7); ctx.stroke();
  }else if(style==="orbites"){
    ctx.fillStyle="#ffffff"; ctx.strokeStyle=trail; ctx.lineWidth=1.6;
    for(let i=0;i<count;i++){ const a=renderTicker*.1+i*(6.28/count),x=pr.rx+Math.cos(a)*r*.95,y=pr.ry+Math.sin(a)*r*.62; ctx.beginPath(); ctx.arc(x,y,2.6,0,7); ctx.fill(); ctx.beginPath(); ctx.ellipse(pr.rx,pr.ry,r*.95,r*.62,a*.12,0,7); ctx.globalAlpha=.22; ctx.stroke(); ctx.globalAlpha=1; }
  }else if(style==="couronne royale"){
    ctx.fillStyle="#ffc400"; ctx.strokeStyle="#fff3b0"; ctx.lineWidth=1.6; const y=pr.ry-r*.92+Math.sin(renderTicker*.07)*2;
    ctx.beginPath(); ctx.moveTo(pr.rx-r*.62,y+r*.42); ctx.lineTo(pr.rx-r*.62,y); ctx.lineTo(pr.rx-r*.28,y+r*.22); ctx.lineTo(pr.rx,y-r*.18); ctx.lineTo(pr.rx+r*.28,y+r*.22); ctx.lineTo(pr.rx+r*.62,y); ctx.lineTo(pr.rx+r*.62,y+r*.42); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.globalAlpha=.65; ctx.beginPath(); ctx.arc(pr.rx,pr.ry,r*1.05,0,7); ctx.stroke();
  }else if(style==="écume"){
    ctx.fillStyle="#e0f7fa"; ctx.strokeStyle=trail; ctx.lineWidth=1.8;
    for(let i=0;i<count;i++){ const x=pr.rx-dir*i*r*.34,y=pr.ry+Math.sin(renderTicker*.09+i*1.4)*r*.34; ctx.beginPath(); ctx.arc(x,y,r*(.18+(i%3)*.05),0,7); ctx.fill(); }
    ctx.beginPath(); ctx.arc(pr.rx,pr.ry,r*1.02,renderTicker*.03,renderTicker*.03+4.4); ctx.stroke();
  }else if(style==="lames"){
    ctx.strokeStyle="#eceff1"; ctx.lineWidth=2.4; ctx.globalAlpha=.9;
    for(let i=0;i<count;i++){ const a=renderTicker*.09+i*1.7,x=pr.rx+Math.cos(a)*r*.8,y=pr.ry+Math.sin(a)*r*.55; ctx.beginPath(); ctx.moveTo(x-6,y+6); ctx.quadraticCurveTo(x,y-2,x+7,y-8); ctx.stroke(); }
  }else if(style==="runes"){
    ctx.strokeStyle=trail; ctx.fillStyle="#ffffff"; ctx.lineWidth=1.6; ctx.globalAlpha=.9;
    ctx.beginPath(); ctx.arc(pr.rx,pr.ry,r*1.02,renderTicker*.05,renderTicker*.05+5.1); ctx.stroke();
    for(let i=0;i<count;i++){ const a=renderTicker*.06+i*(6.28/count),x=pr.rx+Math.cos(a)*r*1.02,y=pr.ry+Math.sin(a)*r*1.02; ctx.fillRect(x-1.6,y-1.6,3.2,3.2); }
  }else if(style==="circuits"){
    ctx.strokeStyle=trail; ctx.fillStyle=trail; ctx.lineWidth=1.6; ctx.globalAlpha=.9;
    for(let i=0;i<count;i++){ const a=i*1.9+renderTicker*.04,x=pr.rx+Math.cos(a)*r*.9,y=pr.ry+Math.sin(a)*r*.65; ctx.strokeRect(x-3.4,y-3.4,6.8,6.8); ctx.beginPath(); ctx.arc(x,y,1.4,0,7); ctx.fill(); }
  }else{
    ctx.strokeStyle=trail; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(pr.rx,pr.ry,r,0,7); ctx.stroke();
  }
  ctx.restore();
}
function drawProjectiles(){
  for(const pr of projectiles){
    const kind=pr.kind||"bolt",size=pr.r*(kind==="judgment"?4.8:4.2);
    drawSignatureVfx(pr);
    ctx.save(); ctx.globalAlpha=.95;
    if(pr.ex){ ctx.save(); ctx.strokeStyle="rgba(255,213,79,.9)"; ctx.lineWidth=2.4; ctx.beginPath(); ctx.arc(pr.rx,pr.ry,pr.r*1.18+Math.sin(renderTicker*.14)*1.5,0,7); ctx.stroke(); ctx.restore(); }
    if(kind==="wave"){
      ctx.drawImage(glowSprite(pr.owner.skin.trail),pr.rx-size/2,GROUND-size/2-24,size,size);
      ctx.fillStyle="#0087a5"; ctx.beginPath(); ctx.ellipse(pr.rx,GROUND+3,pr.r*1.35,pr.r*.72,0,Math.PI,0); ctx.fill();
      ctx.fillStyle="#18b7cf"; ctx.beginPath(); ctx.ellipse(pr.rx,GROUND-3,pr.r*1.05,pr.r*.5,0,Math.PI,0); ctx.fill();
      ctx.fillStyle="#e0f7fa"; [-.65,-.25,.22,.68].forEach((o,i)=>{ctx.beginPath();ctx.arc(pr.rx+o*pr.r,GROUND-pr.r*(.58+((i+((renderTicker*.05)|0))%3)*.05),pr.r*.24,0,7);ctx.fill();});
    }else if(kind==="ground"){
      ctx.drawImage(glowSprite(pr.owner.skin.trail),pr.rx-size/2,pr.ry-size/2,size,size);
      ctx.fillStyle="#5d4037"; ctx.beginPath(); ctx.ellipse(pr.rx,GROUND+2,pr.r*1.25,pr.r*.58,0,Math.PI,0); ctx.fill();
      ctx.fillStyle=pr.owner.skin.trail; ctx.beginPath(); ctx.ellipse(pr.rx,GROUND-2,pr.r*.82,pr.r*.36,0,Math.PI,0); ctx.fill();
      ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(pr.rx,pr.ry,pr.r*.28,0,7); ctx.fill();
    }else if(kind==="blade"){
      const ang=Math.atan2(pr.vy||0,pr.vx||1); ctx.translate(pr.rx,pr.ry); ctx.rotate(ang);
      ctx.drawImage(glowSprite(pr.owner.skin.trail),-size/2,-size/2,size,size);
      ctx.fillStyle="#fff"; ctx.beginPath(); ctx.ellipse(0,0,pr.r*1.05,pr.r*.34,0,0,7); ctx.fill();
    }else if(kind==="meteor"){
      ctx.drawImage(glowSprite(pr.owner.skin.trail),pr.rx-size/2,pr.ry-size/2,size,size);
      ctx.fillStyle=pr.owner.skin.trail; ctx.beginPath(); ctx.arc(pr.rx,pr.ry,pr.r*.62,0,7); ctx.fill();
      ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(pr.rx-2,pr.ry-3,pr.r*.3,0,7); ctx.fill();
    }else{
      ctx.drawImage(glowSprite(pr.owner.skin.trail),pr.rx-size/2,pr.ry-size/2,size,size);
      ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(pr.rx,pr.ry,pr.r*(kind==="judgment"?.56:.48),0,7); ctx.fill();
      if(kind==="royal"){ ctx.fillStyle="#ffc400"; ctx.font="1000 "+Math.max(10,pr.r*.6)+"px Arial"; ctx.textAlign="center"; ctx.fillText("G",pr.rx,pr.ry+4); }
    }
    ctx.restore();
  }
}
/* Sprites d'impact AAA II : générés une fois par type/couleur, puis dessinés
   en un seul drawImage rotatif. Le cache est borné pour protéger les mobiles. */
function impactSprite(kind,color){
  const kinds=["light","heavy","block","parry","throw","counter","projectile","clash","m1","m1final","ground"];
  const safeKind=kinds.includes(kind)?kind:"light";
  const safeColor=/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(color||"")?color:"#fff59d";
  const key=safeKind+":"+safeColor;
  if(impactSpriteCache.has(key))return impactSpriteCache.get(key);
  if(impactSpriteCache.size>48)impactSpriteCache.clear();
  const c=document.createElement("canvas"); c.width=c.height=160; const g=c.getContext("2d");
  if(!g)return glowSprite(safeColor);
  g.translate(80,80); g.lineCap="round"; g.lineJoin="round";
  const glow=g.createRadialGradient(0,0,2,0,0,78);
  glow.addColorStop(0,"rgba(255,255,255,.96)"); glow.addColorStop(.22,safeColor); glow.addColorStop(.58,"rgba(255,255,255,.12)"); glow.addColorStop(1,"rgba(0,0,0,0)");
  g.fillStyle=glow; g.fillRect(-80,-80,160,160);
  const dark=safeColor.length===7?shade(safeColor,-42):safeColor;
  const spike=(angle,len,width,fill,base)=>{
    g.save(); g.rotate(angle); g.fillStyle=fill; g.strokeStyle="rgba(0,0,0,.2)"; g.lineWidth=1;
    g.beginPath(); g.moveTo(base||7,0); g.lineTo(len,-width); g.lineTo(len*.72,0); g.lineTo(len,width); g.closePath(); g.fill(); g.stroke(); g.restore();
  };
  if(safeKind==="ground"){
    for(let i=0;i<10;i++){
      const a=Math.PI+i*(Math.PI/9),len=34+pseudo(i*17+safeColor.length)*30,w=4+pseudo(i*23)*4;
      g.save(); g.translate(0,28); spike(a,len,w,i%3===0?"#ffffff":(i%3===1?safeColor:dark),2); g.restore();
    }
    g.globalAlpha=.48; g.fillStyle=safeColor; g.beginPath(); g.ellipse(0,31,48,11,0,0,7); g.fill(); g.globalAlpha=1;
  }else{
    const count=safeKind==="light"?8:safeKind==="m1final"||safeKind==="clash"?14:safeKind==="heavy"||safeKind==="projectile"?12:safeKind==="block"?7:10;
    for(let i=0;i<count;i++){
      const a=i/count*Math.PI*2+pseudo(i*13+safeKind.length)*.22;
      let len=(safeKind==="light"?38:safeKind==="block"?42:52)+pseudo(i*29+safeColor.length)*(safeKind==="m1final"?27:19);
      if(safeKind==="m1"||safeKind==="m1final")len*=1+Math.abs(Math.cos(a))*.28;
      spike(a,len,3.2+pseudo(i*7)*4+(safeKind==="heavy"?1.6:0),i%3===0?"#ffffff":(i%3===1?safeColor:dark),6);
    }
  }
  g.strokeStyle=safeColor;
  for(let i=0;i<3;i++){ g.globalAlpha=.42-i*.08; g.lineWidth=4.5-i; g.beginPath(); g.arc(0,0,28+i*13,pseudo(i*31+safeColor.length)*5,pseudo(i*31+safeColor.length)*5+1.15+pseudo(i*17)*1.2); g.stroke(); }
  g.globalAlpha=1;
  if(safeKind==="block"){
    g.strokeStyle="#ffffff"; g.lineWidth=5; g.beginPath();
    for(let i=0;i<6;i++){ const a=i*Math.PI/3+Math.PI/6,x=Math.cos(a)*34,y=Math.sin(a)*34; if(i===0)g.moveTo(x,y); else g.lineTo(x,y); }
    g.closePath(); g.stroke();
  }else if(safeKind==="parry"){
    g.strokeStyle="#ffffff"; g.lineWidth=5; g.beginPath(); g.moveTo(0,-38); g.lineTo(29,0); g.lineTo(0,38); g.lineTo(-29,0); g.closePath(); g.stroke();
  }else if(safeKind==="m1final"){
    g.strokeStyle="#ffffff"; g.lineWidth=3; [48,61].forEach((r,i)=>{ for(let k=0;k<4;k++){ const a=i*.45+k*1.57; g.beginPath(); g.arc(0,0,r,a,a+.72); g.stroke(); } });
  }
  g.fillStyle="#ffffff"; g.beginPath(); g.arc(0,safeKind==="ground"?26:0,safeKind==="heavy"||safeKind==="m1final"?13:9.5,0,7); g.fill();
  impactSpriteCache.set(key,c); renderStats.impactSpriteCacheSize=impactSpriteCache.size;
  return c;
}
function drawImpactBursts(){
  renderStats.impactBurstsDrawn=0;
  if(typeof impactBursts==="undefined"||!impactBursts.length){ renderStats.impactSpriteCacheSize=impactSpriteCache.size; return; }
  for(const b of impactBursts){
    const age=clamp(1-b.life/Math.max(1,b.max||b.life||1),0,1),pop=easeOutCubic(age);
    const size=(b.kind==="ground"?122:98)*(b.power||1)*(.56+pop*.82)*(qualityLevel===0?.72:1);
    ctx.save(); ctx.translate(b.x,b.y); ctx.globalAlpha=clamp(1.16-age*1.25,0,1)*(qualityLevel===0?.78:1);
    if(b.kind==="ground"){ ctx.scale(b.dir||1,1); ctx.rotate(((b.seed||0)-.5)*.08); }
    else ctx.rotate((b.seed||0)*6.283+age*.48*(b.dir||1));
    ctx.drawImage(impactSprite(b.kind,b.color),-size/2,-size/2,size,size);
    ctx.restore(); renderStats.impactBurstsDrawn++; renderStats.lastImpactFx=b.kind+":"+(b.color||"");
  }
  renderStats.impactSpriteCacheSize=impactSpriteCache.size;
}
function drawEffects(){
  drawImpactBursts();
  for(const r of rings){ ctx.globalAlpha=Math.max(0,r.life/15); ctx.strokeStyle=r.c; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(r.x,r.y,r.r,0,7); ctx.stroke(); }
  for(const p of particles){ ctx.globalAlpha=Math.max(0,Math.min(1,p.life/(p.max||30))); ctx.fillStyle=p.c; if(p.rect){ctx.save();ctx.translate(p.x,p.y);ctx.rotate((p.rot||0)+renderTicker*.06);ctx.fillRect(-p.r,-p.r*.55,p.r*2,p.r*1.1);ctx.restore();}else{ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill();} }
  ctx.globalAlpha=1;
  ctx.textAlign="center";
  /* V3.4 : les textes flottants proches se décalent au lieu de se chevaucher */
  const placed=[]; let spreadMax=0;
  for(const fl of floaters){ let dy=0; for(const pl of placed){ if(Math.abs(pl.x-fl.x)<170&&Math.abs(pl.y-(fl.y-dy))<30)dy+=27; } placed.push({x:fl.x,y:fl.y-dy}); if(dy>spreadMax)spreadMax=dy; ctx.save(); ctx.globalAlpha=Math.min(1,fl.life/28); ctx.font="1000 "+(fl.big?27:18)+"px 'Segoe UI',Arial"; ctx.lineWidth=5; ctx.strokeStyle="rgba(0,0,0,.68)"; ctx.strokeText(fl.text,fl.x,fl.y-dy); ctx.fillStyle=fl.c; ctx.fillText(fl.text,fl.x,fl.y-dy); ctx.restore(); }
  renderStats.floaterSpread=spreadMax;
}
function drawForegroundDepth(){
  if(qualityLevel===0)return;
  const id=currentArena.id; renderStats.foregroundDepth=id;
  ctx.save();
  ctx.fillStyle="rgba(2,4,10,.3)";
  ctx.beginPath(); ctx.ellipse(-70,H+34,250,88,-.16,0,7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(W+70,H+38,270,94,.15,0,7); ctx.fill();
  if(id==="tokyo"){
    ctx.fillStyle="rgba(2,4,12,.52)"; ctx.fillRect(W-44,110,18,H-110); ctx.fillRect(W-122,142,78,118);
    const flick=.35+.4*Math.abs(Math.sin(renderTicker*.05))*(pseudo((renderStats.frame/9)|0)>.18?1:.25);
    ctx.globalAlpha=flick; ctx.fillStyle="#ff2e88"; ctx.fillRect(W-112,156,58,9); ctx.fillStyle="#00e5ff"; ctx.fillRect(W-112,178,40,7); ctx.globalAlpha=1;
  }else if(id==="temple"){
    ctx.fillStyle="rgba(12,6,4,.42)"; ctx.fillRect(-8,0,34,300); ctx.fillRect(W-26,0,34,300);
    ctx.fillStyle="rgba(255,190,90,.16)"; ctx.fillRect(24,0,3,300); ctx.fillRect(W-29,0,3,300);
  }else if(id==="stadium"){
    ctx.fillStyle="rgba(3,6,16,.4)"; ctx.fillRect(-20,H-26,300,40); ctx.fillRect(W-280,H-26,300,40);
    ctx.fillStyle="rgba(0,229,255,.35)"; ctx.fillRect(-20,H-28,300,3); ctx.fillRect(W-280,H-28,300,3);
  }else{
    ctx.strokeStyle="rgba(6,26,12,.55)"; ctx.lineWidth=9; ctx.lineCap="round";
    for(let i=0;i<4;i++){ const a=.35+i*.3; ctx.beginPath(); ctx.moveTo(-16,-8); ctx.quadraticCurveTo(Math.cos(a)*120,26+Math.sin(a)*20,Math.cos(a)*205,58+Math.sin(a)*44); ctx.stroke(); }
  }
  ctx.restore();
}
function drawPostProcess(){
  // Passe POST (V2.3 Kenzo) : teinte colorée par arène, vignette, alertes, barres cinéma.
  renderStats.lastPost=currentArena.id+":"+currentArenaMood+":q"+qualityLevel; renderStats.arenaMood=currentArenaMood;
  if(qualityLevel>0&&arenaCache.grade){ ctx.save(); try{ctx.globalCompositeOperation="soft-light";}catch(e){} ctx.fillStyle=arenaCache.grade; ctx.fillRect(0,0,W,H); ctx.restore(); }
  if(vignetteGrad){ ctx.fillStyle=vignetteGrad; ctx.fillRect(0,0,W,H); }
  /* V3.4 : halo de scène qui suit l'action — les combattants ressortent du décor */
  if(qualityLevel>0&&isCombat()&&p1&&p2){ const mid=(p1.rx+p2.rx)/2; renderStats.spotlightX=Math.round(mid); ctx.save(); try{ctx.globalCompositeOperation="screen";}catch(e){} ctx.globalAlpha=.08; ctx.drawImage(glowSprite("#ffffff"),mid-280,GROUND-52,560,110); ctx.restore(); }
  const Low=(p1.health/p1.maxHealth<.25||p2.health/p2.maxHealth<.25)&&isCombat();
  if(Low&&!SETTINGS.reduceFlash){ ctx.save(); ctx.globalAlpha=.1+.07*Math.sin(renderTicker*.18); ctx.fillStyle="#ff1744"; ctx.fillRect(0,0,W,8); ctx.fillRect(0,H-8,W,8); ctx.fillRect(0,0,8,H); ctx.fillRect(W-8,0,8,H); ctx.restore(); }
  if(qualityLevel===2&&shake>6.5&&!SETTINGS.reduceFlash){
    ctx.save(); ctx.strokeStyle="rgba(255,255,255,"+clamp((shake-6.5)/26,.05,.3)+")"; ctx.lineWidth=2;
    for(let i=0;i<8;i++){ const y=60+pseudo(i*17+renderStats.frame)*600,len=45+pseudo(i*31)*90,left=i%2===0; ctx.beginPath(); ctx.moveTo(left?0:W,y); ctx.lineTo(left?len:W-len,y+(left?8:-8)); ctx.stroke(); }
    ctx.restore();
  }
  const bars=(state==="intro"||state==="roundEnd"||cinematic>0)?34:0;
  if(bars){ ctx.fillStyle="#000"; ctx.fillRect(0,0,W,bars); ctx.fillRect(0,H-bars,W,bars); }
  drawForegroundDepth();
  /* Intro cinématographique V4.1 (Lena) : bandeaux nominatifs façon grande licence. */
  if(state==="intro"&&p1&&p2&&typeof introT!=="undefined"){
    const tIn=clamp(1-introT/132,0,1),slide=(1-easeOutCubic(clamp(tIn*2.2,0,1)))*360,bAlpha=clamp(Math.min(tIn*3,(introT-28)/16),0,1);
    if(bAlpha>0){
      ctx.save(); ctx.globalAlpha=bAlpha;
      const drawBanner=(f,left)=>{
        const bw=372,bx=left?26-slide:W-26-bw+slide,by=H-124;
        ctx.fillStyle="rgba(4,7,20,.8)"; rr(bx,by,bw,56,12); ctx.fill();
        ctx.fillStyle=f.skin.primary; rr(left?bx:bx+bw-7,by,7,56,3); ctx.fill();
        ctx.fillStyle="#ffffff"; ctx.font="italic 1000 23px 'Segoe UI',Arial"; ctx.textAlign=left?"left":"right";
        ctx.fillText(String(f.name||f.char.name).toUpperCase(),left?bx+18:bx+bw-18,by+27);
        ctx.fillStyle="rgba(255,255,255,.78)"; ctx.font="900 11.5px 'Segoe UI',Arial";
        ctx.fillText((f.char.name+" • "+f.char.title).toUpperCase(),left?bx+18:bx+bw-18,by+46);
      };
      drawBanner(p1,true); drawBanner(p2,false);
      renderStats.introBanners=(renderStats.introBanners||0)+1; ctx.restore();
    }
  }
  ctx.save(); ctx.font="italic 1000 16px 'Segoe UI',Arial"; ctx.textAlign="right"; ctx.fillStyle="rgba(255,255,255,.74)"; ctx.fillText("✍️ Gideon - Godson",W-17,H-13-Math.max(0,bars-4)); ctx.restore();
}
function render(){
  renderStats.frame++; renderStats.passesRun.length=0;
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.clearRect(0,0,W,H);
  const shakeAmt=shake*(SETTINGS.shake/100);
  const shX=(Math.random()-.5)*shakeAmt*2,shY=(Math.random()-.5)*shakeAmt*1.35;
  runRenderPass("background",()=>{
    ctx.save(); const bgZoom=1+(cam.zoom-1)*.32,panX=(640-cam.x)*.045;
    ctx.translate(W/2+shX*.35,H*.46+shY*.35); ctx.scale(bgZoom,bgZoom); ctx.translate(-W/2+panX,-H*.46);
    drawBackground(); ctx.restore();
  });
  ctx.save(); ctx.translate(W/2+shX,GROUND+shY); ctx.scale(cam.zoom,cam.zoom); ctx.translate(-cam.x,-GROUND);
  runRenderPass("floor",drawFloor);
  runRenderPass("shadows",()=>{ drawReflection(p1); drawReflection(p2); drawGhosts(); });
  runRenderPass("entities",()=>{ const first=p1.ry>=p2.ry?p1:p2,second=first===p1?p2:p1; drawFighter(first); drawFighter(second); });
  runRenderPass("projectiles",drawProjectiles);
  runRenderPass("effects",drawEffects);
  ctx.restore();
  runRenderPass("post",drawPostProcess);
}

/* ---------------- HUD PRO ---------------- */
const HE={hud:$("hud"),hp1:$("hpP1"),hp2:$("hpP2"),gh1:$("ghostP1"),gh2:$("ghostP2"),bar1:$("barP1"),bar2:$("barP2"),timer:$("timerNum"),clock:$("matchClock"),combo:$("comboBox"),pips1:$("pipsP1"),pips2:$("pipsP2")};
let ghost1=100,ghost2=100,lastClock="",comboKey="",comboFillEl=null;
function buildPips(){
  const total=roundsToWin();
  const mk=(el,wins)=>{ el.innerHTML=""; for(let i=0;i<total;i++){ const s=document.createElement("span"); s.className="pip"+(i<wins?" on":""); el.appendChild(s); } };
  mk(HE.pips1,p1.roundWins); mk(HE.pips2,p2.roundWins);
}
function snapHUD(){ ghost1=p1.health/p1.maxHealth*100; ghost2=p2.health/p2.maxHealth*100; }
function setEnergy(prefix,val){
  [0,1].forEach(i=>{ const seg=$(prefix+(i===0?"a":"b")); if(!seg)return; const fill=clamp((val-i*50)/50*100,0,100); seg.firstElementChild.style.width=fill+"%"; seg.classList.toggle("full",fill>=100); });
}
function fmtClock(sec){ const m=Math.floor(sec/60),s=Math.floor(sec%60); return String(m).padStart(2,"0")+":"+String(s).padStart(2,"0"); }
function updateHUD(){
  if(HE.hud.style.display==="none")return;
  const h1=p1.health/p1.maxHealth*100,h2=p2.health/p2.maxHealth*100;
  ghost1+=(h1-ghost1)*.045; ghost2+=(h2-ghost2)*.045;
  HE.hp1.style.width=h1+"%"; HE.hp2.style.width=h2+"%"; HE.gh1.style.width=ghost1+"%"; HE.gh2.style.width=ghost2+"%";
  HE.bar1.classList.toggle("Low",h1<28); HE.bar2.classList.toggle("Low",h2<28);
  setEnergy("en1",p1.energy); setEnergy("en2",p2.energy);
  const t=(state==="training"||SETTINGS.roundTime===0)?"∞":String(timerSec);
  if(HE.timer.textContent!==t)HE.timer.textContent=t;
  HE.timer.classList.toggle("urgent",state==="fight"&&SETTINGS.roundTime>0&&timerSec<=10);
  const ck=fmtClock(matchElapsed); if(ck!==lastClock){lastClock=ck;HE.clock.textContent=ck;}
  if(HE.pips1.children.length!==roundsToWin()||HE.pips2.children.length!==roundsToWin())buildPips();
  const best=p1.combo>=p2.combo?p1:p2;
  if(best.combo>=2&&best.comboT>0&&isCombat()){
    const key=best.id+":"+best.combo+":"+best.comboDamage;
    if(key!==comboKey){ comboKey=key; HE.combo.className=best===p1?"left":"right"; HE.combo.innerHTML=best.combo+" HITS<small>COMBO • "+best.comboDamage+" DÉGÂTS"+(comboSequenceName(best)?"<br>"+comboSequenceName(best):"")+"</small><span class='cbar'><i></i></span>"; comboFillEl=HE.combo.querySelector(".cbar i"); }
    HE.combo.style.display="block"; if(comboFillEl)comboFillEl.style.width=(best.comboT/62*100)+"%";
  } else { HE.combo.style.display="none"; comboKey=""; }
}

/* ---------------- BOUCLE PRO : fixe 60 Hz + interpolation + FPS adaptatif ---------------- */
let lastTs=0,acc=0,fpsEMA=60,rafCount=0,autoGoodChecks=0,lastFpsShown="";
function loop(ts){
  requestAnimationFrame(loop);
  if(!lastTs)lastTs=ts;
  let dt=ts-lastTs; lastTs=ts;
  if(dt>250)dt=16.7; // retour d’onglet / pause navigateur
  renderDtFactor=clamp(dt/16.667,.25,3); renderTicker+=renderDtFactor; rafCount++;
  if(dt>0)fpsEMA+=(1000/dt-fpsEMA)*.05;
  perfFxScale=qualityLevel===2?(fpsEMA<38?.55:(fpsEMA<50?.8:1)):(qualityLevel===1?(fpsEMA<38?.72:1):1);
  renderStats.fpsEstimate=Math.round(fpsEMA); renderStats.effectScale=perfFxScale;
  renderStats.perfTier=qualityLevel===2?"ultra":(qualityLevel===1?"équilibrée":"performance");
  renderStats.frameBudgetOk=(fpsEMA>=45&&renderStats.frameMs<21)||qualityLevel===0; renderStats.arenaMood=currentArenaMood;
  renderStats.onlineFrame=onlineSession?onlineSession.frame:0; renderStats.onlineStalls=onlineSession?onlineSession.stalls:0; renderStats.onlineDesync=!!(onlineSession&&onlineSession.desync);
  // Qualité automatique régulière : FPS navigateur + temps CPU réel (utile sur écrans 120 Hz)
  if(SETTINGS.quality==="auto"&&rafCount%100===0){
    if((fpsEMA<45||renderStats.frameMs>21)&&qualityLevel>0){ qualityLevel--; resizeCanvas(); autoGoodChecks=0; }
    else if(fpsEMA>58&&renderStats.frameMs<12.5&&qualityLevel<2){ if(++autoGoodChecks>=7){qualityLevel++;resizeCanvas();autoGoodChecks=0;} }
    else autoGoodChecks=0;
  }
  if(SETTINGS.showFps&&rafCount%12===0){ const txt=Math.round(fpsEMA)+" FPS • "+renderStats.frameMs.toFixed(1)+" ms • Q"+qualityLevel; if(txt!==lastFpsShown){lastFpsShown=txt;$("fpsChip").textContent=txt;} }
  const onlineLive=mode==="online"&&onlineSession&&onlineSession.active&&!replayPlayback.active;
  renderStats.speedScale=onlineLive?1:(replayPlayback.active?replayPlayback.speed:SETTINGS.speed);
  if(typeof syncImmersiveCombat==="function")syncImmersiveCombat();
  if(typeof updateSelectPortraits==="function")updateSelectPortraits();
  if(typeof updateVSPortraits==="function")updateVSPortraits();
  if(onlineLive){ hitStopT=0; slowmoT=0; }
  if(state==="pause"||(replayPlayback.active&&replayPlayback.paused)){ prepareInterpolation(1); updateCamera(0); render(); updateHUD(); if(typeof updateReplayBar==="function")updateReplayBar(); return; }
  if(hitStopT>0&&!onlineLive){ hitStopT-=dt; shake*=.9; prepareInterpolation(1); updateCamera(dt); render(); updateHUD(); if(typeof updateReplayBar==="function")updateReplayBar(); return; }
  let scale=renderStats.speedScale;
  if(slowmoT>0&&!onlineLive){ slowmoT-=dt/16.667; scale*=.34; }
  acc+=dt*scale;
  const step=1000/60; let n=0;
  const maxSteps=replayPlayback.active?Math.max(3,Math.ceil(replayPlayback.speed)+1):3;
  const cpuNow=()=> (typeof performance!=="undefined"&&performance.now)?performance.now():0;
  const logicStart=cpuNow();
  while(acc>=step&&n<maxSteps){ if(updateGameLogic()===false){ acc=0; break; } acc-=step; n++; }
  if(n===maxSteps&&acc>=step)acc=0;
  const logicEnd=cpuNow();
  prepareInterpolation(clamp(acc/step,0,1));
  updateCamera(dt);
  render(); updateHUD(); if(typeof updateReplayBar==="function")updateReplayBar();
  const frameEnd=cpuNow();
  if(frameEnd&&logicStart){
    const logicMs=Math.max(0,logicEnd-logicStart),renderMs=Math.max(0,frameEnd-logicEnd),totalMs=Math.max(0,frameEnd-logicStart);
    renderStats.logicMs+=(logicMs-renderStats.logicMs)*.12;
    renderStats.renderMs+=(renderMs-renderStats.renderMs)*.12;
    renderStats.frameMs+=(totalMs-renderStats.frameMs)*.12;
  }
}
function startLoop(){ resizeCanvas(); requestAnimationFrame(loop); }
rebuildArenaCache();
