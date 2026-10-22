"use strict";
/* =====================================================================
   GÉDÉON - Godson ARENA V2.1 PRO — RENDU HAUT GRAPHISME
   Caméra dynamique, interpolation écran haute fréquence, 3 arènes.
   Signé : Gideon - Godson
   ===================================================================== */
let renderTicker=0,renderDtFactor=1,arenaCache={},vignetteGrad=null;
const glowCache=new Map();
function glowSprite(color){
  if(glowCache.has(color))return glowCache.get(color);
  const c=document.createElement("canvas"); c.width=c.height=128; const g=c.getContext("2d");
  const gr=g.createRadialGradient(64,64,2,64,64,64); gr.addColorStop(0,"#ffffff"); gr.addColorStop(.22,color); gr.addColorStop(1,"rgba(0,0,0,0)");
  g.fillStyle=gr; g.fillRect(0,0,128,128); glowCache.set(color,c); return c;
}
function rebuildArenaCache(){
  arenaCache={};
  const mk=(stops,y1)=>{ const g=ctx.createLinearGradient(0,0,0,y1||H); stops.forEach(s=>g.addColorStop(s[0],s[1])); return g; };
  if(currentArena.id==="stadium")arenaCache.sky=mk([[0,"#1a237e"],[.38,"#6a1b9a"],[.63,"#ff7043"],[1,"#21122e"]]);
  else if(currentArena.id==="tokyo")arenaCache.sky=mk([[0,"#02061f"],[.45,"#111743"],[.72,"#3b1454"],[1,"#0a0d24"]]);
  else arenaCache.sky=mk([[0,"#2196f3"],[.42,"#81d4fa"],[.7,"#ffe9a8"],[1,"#5d4037"]]);
  vignetteGrad=ctx.createRadialGradient(W/2,H/2,H*.38,W/2,H/2,H*.86);
  vignetteGrad.addColorStop(0,"rgba(0,0,0,0)"); vignetteGrad.addColorStop(1,"rgba(0,0,0,.42)");
}
function setArenaById(id){
  const a=ARENAS.find(x=>x.id===id)||ARENAS[0];
  if(a!==currentArena){ currentArena=a; rebuildArenaCache(); if(musicTimer)startMusic(); }
}
/* Foule, nuages, pluie, pétales */
const crowd=[];
for(let r=0;r<5;r++)for(let i=0;i<68;i++)crowd.push({x:-8+i*19.4+(r%2)*8,y:238+r*27,c:["#ff8a65","#ffd54f","#81d4fa","#a5d6a7","#f48fb1","#ce93d8","#fff59d"][(Math.random()*7)|0],ph:Math.random()*6.28,sk:["#8d5524","#c68642","#e0ac69","#6d3f17"][(Math.random()*4)|0]});
const clouds=Array.from({length:9},(_,i)=>({x:Math.random()*1500-100,y:36+i*25+Math.random()*20,s:.55+Math.random()*.8,v:.22+Math.random()*.35}));
const raindrops=Array.from({length:130},()=>({x:Math.random()*W,y:Math.random()*H,s:13+Math.random()*11,l:12+Math.random()*14}));
const petals=Array.from({length:42},()=>({x:Math.random()*W,y:Math.random()*H,s:2.5+Math.random()*3.5,v:.35+Math.random()*.6,ph:Math.random()*6.28}));
const pseudo=i=>{ const x=Math.sin(i*127.1+311.7)*43758.5453; return x-Math.floor(x); };

/* ---------------- CAMÉRA DYNAMIQUE ---------------- */
const cam={x:640,zoom:1};
function resetCamera(snap){ if(snap){cam.x=640;cam.zoom=1;} }
function prepareInterpolation(alpha){
  for(const f of fighters){ f.rx=f.px+(f.x-f.px)*alpha; f.ry=f.py+(f.y-f.py)*alpha; }
  for(const pr of projectiles){ pr.rx=pr.px+(pr.x-pr.px)*alpha; pr.ry=pr.py+(pr.y-pr.py)*alpha; }
}
function updateCamera(dtMs){
  const mid=(p1.rx+p2.rx)/2, dist=Math.abs(p2.rx-p1.rx);
  let tz=(state==="menu"||state==="select"||state==="vs"||state==="scene")?1:clamp(1020/(dist+455),.78,1.11);
  if(state==="intro"||state==="roundEnd")tz=Math.min(1.16,tz+.06);
  const tx=(state==="menu"||state==="select"||state==="vs"||state==="scene")?640:clamp(mid,505,775);
  const k=dtMs<=0?1:1-Math.exp(-dtMs/135);
  cam.x+=(tx-cam.x)*k; cam.zoom+=(tz-cam.zoom)*k;
}

/* ---------------- ARRIÈRE-PLANS ANIMÉS ---------------- */
function rr(x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function drawBillboard(title,sub){
  ctx.save(); ctx.fillStyle="rgba(5,8,30,.88)"; rr(405,32,470,116,20); ctx.fill();
  const eg=ctx.createLinearGradient(405,32,875,148); eg.addColorStop(0,"#00a2ff"); eg.addColorStop(.5,"#7c3aed"); eg.addColorStop(1,"#ff2e88");
  ctx.strokeStyle=eg; ctx.lineWidth=4; rr(405,32,470,116,20); ctx.stroke();
  ctx.textAlign="center"; ctx.fillStyle="#fff"; ctx.font="1000 34px 'Segoe UI',Arial"; ctx.fillText(title,640,80);
  ctx.font="1000 17px 'Segoe UI',Arial"; ctx.fillStyle="#ffe082"; ctx.fillText("★ A R E N A   C H A M P I O N S H I P ★",640,110);
  ctx.font="800 12px 'Segoe UI',Arial"; ctx.fillStyle="rgba(255,255,255,.88)"; ctx.fillText(sub,640,134); ctx.restore();
}
function modeLabel(){ return state==="menu"||state==="select"?"CHOISIS TON MODE DE JEU":(mode==="story"?"MODE HISTOIRE • COMBAT "+story.step+"/"+story.total:mode==="arcade"?"MODE ARCADE • ÉTAGE "+arcade.stage+"/5":mode==="training"?"MODE ENTRAÎNEMENT":mode==="bot"?"MODE BOT • "+DIFFS[botDiff].label.toUpperCase():"MODE 2 JOUEURS"); }
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
  [[105,50,.45],[1175,50,-.45],[640,16,.85]].forEach((s,i)=>{ const a=Math.sin(renderTicker*.008+i*2.1)*.5+s[2]; const grd=ctx.createLinearGradient(s[0],s[1],s[0]+Math.sin(a)*560,s[1]+Math.cos(a)*560); grd.addColorStop(0,"rgba(255,255,190,.30)"); grd.addColorStop(1,"rgba(255,255,190,0)"); ctx.fillStyle=grd; ctx.beginPath(); ctx.moveTo(s[0],s[1]); ctx.lineTo(s[0]+Math.sin(a-.085)*575,s[1]+Math.cos(a-.085)*575); ctx.lineTo(s[0]+Math.sin(a+.085)*575,s[1]+Math.cos(a+.085)*575); ctx.closePath(); ctx.fill(); });
  ctx.restore();
  drawBillboard("GÉDÉON - Godson",modeLabel());
  // Tribunes et foule réactive
  ctx.fillStyle="rgba(10,10,38,.76)"; ctx.fillRect(-220,218,1720,164); ctx.fillStyle="#ffc400"; ctx.fillRect(-220,218,1720,5);
  const amp=(crowdExcite>0?5:2)*(qualityLevel===0?.6:1),step=qualityLevel===0?2:1;
  for(let i=0;i<crowd.length;i+=step){ const c=crowd[i],b=Math.abs(Math.sin(renderTicker*.09+c.ph))*amp; ctx.fillStyle=c.sk; ctx.beginPath(); ctx.arc(c.x,c.y-b,5.3,0,7); ctx.fill(); ctx.fillStyle=c.c; ctx.fillRect(c.x-6,c.y+4-b,12,10); }
  ctx.fillStyle="rgba(255,255,255,.1)"; for(let r=0;r<5;r++)ctx.fillRect(-220,252+r*27,1720,2);
  // Bandeau LED défilant
  ctx.save(); ctx.fillStyle="#050816"; ctx.fillRect(-220,382,1720,30); ctx.font="1000 19px 'Segoe UI',Arial"; ctx.textAlign="left";
  const msg=" ✦ GÉDÉON - Godson ARENA ✦ COMBAT 1V1 ✦ COMBOS • DASH • SUPER ATTAQUES ";
  const tw=ctx.measureText(msg).width,off=-((renderTicker*1.15)%tw);
  ctx.fillStyle="#69f0ae"; for(let x=off-tw;x<W+220;x+=tw)ctx.fillText(msg,x,404); ctx.restore();
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
  // Oiseaux
  ctx.save(); ctx.strokeStyle="rgba(38,50,56,.8)"; ctx.lineWidth=2.4;
  for(let i=0;i<5;i++){ const x=((renderTicker*(0.55+i*.07)+i*310)%1550)-130,y=105+i*28+Math.sin(renderTicker*.04+i)*8,w=7+Math.sin(renderTicker*.35+i)*3; ctx.beginPath(); ctx.moveTo(x-11,y+w*.4); ctx.quadraticCurveTo(x-4,y-w,x,y); ctx.quadraticCurveTo(x+4,y-w,x+11,y+w*.4); ctx.stroke(); }
  ctx.restore();
  // Pétales portés par le vent
  if(qualityLevel>0){ ctx.save(); ctx.fillStyle="rgba(255,183,197,.85)";
    for(const p of petals){ p.y+=p.v*renderDtFactor; p.x+=(.7+Math.sin(renderTicker*.03+p.ph)*.7)*renderDtFactor; if(p.y>H+10||p.x>W+10){p.y=-8;p.x=Math.random()*W*.7;} ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(renderTicker*.03+p.ph); ctx.beginPath(); ctx.ellipse(0,0,p.s,p.s*.55,0,0,7); ctx.fill(); ctx.restore(); }
    ctx.restore(); }
}
function drawBackground(){
  if(currentArena.id==="stadium")drawStadium(); else if(currentArena.id==="tokyo")drawTokyo(); else drawTemple();
}
function drawFloor(){
  const id=currentArena.id;
  let top,mid,bot,line;
  if(id==="stadium"){top="#37474f";mid="#263238";bot="#0b0f26";line="#00e5ff";}
  else if(id==="tokyo"){top="#1a2238";mid="#101728";bot="#050816";line="#ff2e88";}
  else {top="#8d6e63";mid="#6d4c41";bot="#332016";line="#ffd54f";}
  const fg=ctx.createLinearGradient(0,GROUND-22,0,H+180); fg.addColorStop(0,top); fg.addColorStop(.25,mid); fg.addColorStop(1,bot);
  ctx.fillStyle=fg; ctx.fillRect(-420,GROUND-22,2120,360);
  ctx.fillStyle=line; ctx.globalAlpha=.9; ctx.fillRect(-420,GROUND-22,2120,5); ctx.globalAlpha=1;
  if(id==="tokyo"){ ctx.save(); ctx.globalAlpha=.16; ["#00e5ff","#ff2e88","#ffc400"].forEach((c,i)=>{ctx.fillStyle=c;ctx.fillRect(90+i*420,GROUND-16,120,150);}); ctx.globalAlpha=.22; ctx.fillStyle="#b3e5fc"; [180,520,860,1120].forEach(x=>{ctx.beginPath();ctx.ellipse(x,GROUND+58,95,14,0,0,7);ctx.fill();}); ctx.restore(); }
  ctx.strokeStyle=id==="temple"?"rgba(255,255,255,.2)":"rgba(255,255,255,.13)"; ctx.lineWidth=2;
  for(let i=-10;i<=22;i++){ ctx.beginPath(); ctx.moveTo(640+(i-6)*54,GROUND-18); ctx.lineTo(640+(i-6)*118,H+170); ctx.stroke(); }
  [0,29,64,104,150].forEach(o=>{ctx.beginPath();ctx.moveTo(-420,GROUND+o);ctx.lineTo(1700,GROUND+o);ctx.stroke();});
  ctx.save(); ctx.translate(640,GROUND+55); ctx.scale(1,.35);
  ctx.beginPath(); ctx.arc(0,0,172,0,7); ctx.strokeStyle=id==="temple"?"rgba(142,36,24,.75)":"rgba(255,196,0,.62)"; ctx.lineWidth=7; ctx.stroke();
  ctx.font="1000 51px 'Segoe UI',Arial"; ctx.textAlign="center"; ctx.fillStyle=id==="temple"?"rgba(90,30,15,.5)":"rgba(255,255,255,.2)"; ctx.fillText("Gideon - Godson",0,15); ctx.restore();
}

/* ---------------- DESSIN DES COMBATTANTS PRO ---------------- */
function drawShadow(f){ const air=GROUND-f.ry,s=Math.max(.34,1-air/430)*f.char.scale; ctx.save(); ctx.fillStyle="rgba(0,0,0,"+(.42*s)+")"; ctx.beginPath(); ctx.ellipse(f.rx,GROUND+10,60*s,13*s,0,0,7); ctx.fill(); ctx.restore(); }
function drawReflection(f){
  if(qualityLevel===0)return;
  ctx.save(); ctx.globalAlpha=currentArena.id==="tokyo"?.2:.1; ctx.translate(f.rx,GROUND+18+(GROUND-f.ry)*.18); ctx.scale(f.facing*f.char.scale,-.32*f.char.scale);
  ctx.fillStyle=f.skin.primary; rr(-18,-128,38,58,16); ctx.fill(); ctx.beginPath(); ctx.arc(7,-148,20,0,7); ctx.fill();
  ctx.fillStyle=f.skin.pants; rr(-19,-76,15,72,7); ctx.fill(); rr(6,-76,15,72,7); ctx.fill(); ctx.restore();
}
function limb(x1,y1,x2,y2,x3,y3,w,c,endC,endR){
  ctx.lineCap="round"; ctx.lineJoin="round";
  ctx.strokeStyle="rgba(8,8,18,.88)"; ctx.lineWidth=w+3.4; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.lineTo(x3,y3); ctx.stroke();
  ctx.strokeStyle=c; ctx.lineWidth=w; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.lineTo(x3,y3); ctx.stroke();
  if(endC){ ctx.fillStyle=endC; ctx.beginPath(); ctx.arc(x3,y3,endR||10,0,7); ctx.fill(); ctx.strokeStyle="rgba(0,0,0,.35)"; ctx.lineWidth=2; ctx.stroke(); ctx.fillStyle="rgba(255,255,255,.35)"; ctx.beginPath(); ctx.arc(x3-3,y3-3,(endR||10)*.35,0,7); ctx.fill(); }
}
function drawGhosts(){
  for(const g of ghosts){ ctx.save(); ctx.globalAlpha=(g.life/g.max)*.34; ctx.translate(g.x,g.y); ctx.scale(g.facing*g.scale,g.scale);
    ctx.fillStyle=g.c; rr(-18*g.bulk,-128,38*g.bulk,58,16); ctx.fill(); ctx.beginPath(); ctx.arc(7,-148,20,0,7); ctx.fill();
    ctx.strokeStyle=g.accent; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(-24,-104); ctx.lineTo(-48,-92); ctx.stroke(); ctx.restore(); }
}
function drawFighter(f){
  const sk=f.skin,ch=f.char,elapsed=f.attackT>0?f.attackDur-f.attackT:0,atk=f.attack;
  const phase=atk?clamp(elapsed/Math.max(1,atk.start+2),0,1):0;
  const punchExt=(f.attackType==="punch"||f.attackType==="airPunch")?Math.sin(phase*Math.PI*.72)*48:0;
  const kickExt=(f.attackType==="kick"||f.attackType==="airKick"||f.attackType==="sweep")?Math.sin(phase*Math.PI*.72)*54:0;
  const upperExt=f.attackType==="uppercut"?Math.sin(phase*Math.PI*.7)*44:0;
  if(f.crouchBlend==null)f.crouchBlend=0; f.crouchBlend+=(((f.crouching||f.attackType==="uppercut"||f.attackType==="sweep")?1:0)-f.crouchBlend)*.3;
  const cb=f.crouchBlend,bob=f.grounded&&!f.dead&&f.downT<=0?Math.sin(f.anim*.14)*2.5*(1-cb*.6):0;
  const walking=Math.abs(f.vx)>.7&&f.grounded&&f.dashT<=0,hurt=f.hitStun>0,down=f.downT>0;
  drawShadow(f);
  if(f.energy>=50&&!f.dead&&!down){ const size=f.energy>=100?225:168,pulse=1+Math.sin(renderTicker*.12+f.id)*.06; ctx.save(); ctx.globalAlpha=f.energy>=100?.62:.42; ctx.drawImage(glowSprite(sk.trail),f.rx-size*pulse/2,f.ry-92*ch.scale-size*pulse/2,size*pulse,size*pulse); ctx.restore(); }
  ctx.save(); ctx.translate(f.rx,f.ry);
  if(f.dead){ const k=Math.min(1,f.koT/25); ctx.rotate(-f.facing*1.42*k); }
  else if(down){ const k=Math.min(1,(42-f.downT)/10); ctx.rotate(-f.facing*1.38*k); }
  else ctx.rotate(clamp(f.vx*.008,-.09,.09)+(f.dashT>0?f.dashDir*f.facing*.13:0)+(hurt?-f.facing*.09:0));
  let sx=ch.scale,sy=ch.scale;
  if(f.squashT>3){sy*=.93;sx*=1.07;} else if(f.squashT>0){sy*=1.04;sx*=.97;}
  if(!f.grounded&&f.vy<-8){sy*=1.05;sx*=.96;}
  ctx.scale(f.facing*sx,sy);
  if(f.hitFlash>0){ try{ctx.filter="brightness(2.05) saturate(.45)";}catch(e){} }
  const hipY=lerp(-76,-57,cb)+bob,shY=lerp(-126,-102,cb)+bob,headY=lerp(-148,-123,cb)+bob;
  // Cape de Nova et de GODSON PRIME
  if((ch.style==="nova"||ch.style==="prime")&&!f.dead){ ctx.save(); const wv=Math.sin(renderTicker*.09+f.anim*.05)*8-f.vx*f.facing*1.4; const cg=ctx.createLinearGradient(0,shY,0,-8); cg.addColorStop(0,sk.dark); cg.addColorStop(1,sk.accent); ctx.fillStyle=cg; ctx.beginPath(); ctx.moveTo(-13,shY+4); ctx.quadraticCurveTo(-44+wv,-62,-35+wv*1.3,-8); ctx.quadraticCurveTo(-14,-28,-8,hipY); ctx.closePath(); ctx.fill(); ctx.restore(); }
  // Jambes
  let bFoot={x:-23,y:0},fFoot={x:25,y:0},bKnee={x:-16,y:lerp(-40,-28,cb)},fKnee={x:18,y:lerp(-39,-27,cb)};
  if(cb>.4){ bFoot={x:-29,y:0}; fFoot={x:27,y:0}; }
  if(walking){ const s=Math.sin(f.walkPhase); bFoot.x=-12+s*19; fFoot.x=14-s*19; bFoot.y=-Math.max(0,s)*7; fFoot.y=-Math.max(0,-s)*7; }
  if(!f.grounded&&!f.dead){ bFoot={x:-17,y:-29}; fFoot={x:23,y:-18}; bKnee={x:-12,y:-49}; fKnee={x:20,y:-49}; }
  if(f.attackType==="kick"){ fFoot={x:45+kickExt,y:-78}; fKnee={x:27+kickExt*.45,y:-83}; }
  if(f.attackType==="airKick"){ fFoot={x:45+kickExt,y:-48}; fKnee={x:27+kickExt*.4,y:-63}; }
  if(f.attackType==="sweep"){ fFoot={x:45+kickExt,y:-8}; fKnee={x:27+kickExt*.45,y:-25}; }
  if(f.dashT>0){ bFoot={x:-34,y:-7}; fFoot={x:30,y:-2}; }
  const legW=14.5*ch.bulk;
  limb(-4,hipY,bKnee.x,bKnee.y,bFoot.x,bFoot.y,legW,sk.pants,null,0);
  ctx.fillStyle="#fff"; ctx.beginPath(); ctx.ellipse(bFoot.x+5,bFoot.y-2,13,6,0,0,7); ctx.fill(); ctx.fillStyle=sk.accent; ctx.fillRect(bFoot.x-6,bFoot.y-8,18,4);
  limb(5,hipY,fKnee.x,fKnee.y,fFoot.x,fFoot.y,legW+1,sk.pants,null,0);
  ctx.fillStyle="#fff"; ctx.beginPath(); ctx.ellipse(fFoot.x+6,fFoot.y-2,14,6,0,0,7); ctx.fill(); ctx.fillStyle=sk.accent; ctx.fillRect(fFoot.x-6,fFoot.y-8,19,4);
  // Bras arrière
  limb(-6,shY+5,-21,-98+bob-cb*-8,-8,-82+bob-cb*-6,11.5*ch.bulk,sk.dark,sk.glove,10.5*ch.bulk);
  // Torse structuré
  const tw=20*ch.bulk;
  const tg=ctx.createLinearGradient(-tw,hipY,tw,shY); tg.addColorStop(0,sk.dark); tg.addColorStop(.55,sk.primary); tg.addColorStop(1,shade(sk.primary,28));
  ctx.fillStyle=tg; ctx.beginPath(); ctx.moveTo(-tw,hipY+5); ctx.lineTo(-tw+3,shY+2); ctx.quadraticCurveTo(0,shY-10,tw-2,shY+2); ctx.lineTo(tw+2,hipY+5); ctx.quadraticCurveTo(0,hipY+14,-tw,hipY+5); ctx.fill();
  ctx.strokeStyle="rgba(0,0,0,.4)"; ctx.lineWidth=2.2; ctx.stroke();
  ctx.fillStyle="rgba(255,255,255,.2)"; ctx.fillRect(-tw+6,shY+7,6,42*(1-cb*.25));
  if(ch.style==="titan"||ch.style==="prime"){ ctx.fillStyle=ch.style==="prime"?"#ffc400":"#37474f"; ctx.beginPath(); ctx.arc(-tw+2,shY+5,11,0,7); ctx.arc(tw-2,shY+5,11,0,7); ctx.fill(); ctx.strokeStyle=ch.style==="prime"?"#fff3c4":"#90a4ae"; ctx.stroke(); }
  ctx.fillStyle="#111827"; ctx.fillRect(-tw-1,hipY-3,tw*2+3,9); ctx.fillStyle=sk.accent; ctx.fillRect(-6,hipY-4,15,11);
  ctx.fillStyle="rgba(255,255,255,.94)"; ctx.beginPath(); ctx.arc(4,(shY+hipY)/2,12,0,7); ctx.fill(); ctx.strokeStyle="rgba(0,0,0,.25)"; ctx.stroke();
  ctx.fillStyle=sk.dark; ctx.font="1000 14px Arial"; ctx.textAlign="center"; ctx.fillText(f.letter,4,(shY+hipY)/2+5);
  // Tête, cheveux distinctifs, bandeau
  ctx.fillStyle=sk.skin; ctx.beginPath(); ctx.arc(8,headY,21,0,7); ctx.fill(); ctx.strokeStyle="rgba(0,0,0,.3)"; ctx.lineWidth=2; ctx.stroke();
  if(ch.style==="kunoichi"||ch.style==="nova"){ ctx.save(); ctx.strokeStyle=sk.hair; ctx.lineWidth=9; ctx.lineCap="round"; const wv=Math.sin(renderTicker*.11+f.anim*.04)*5-f.vx*f.facing; ctx.beginPath(); ctx.moveTo(-8,headY-15); ctx.quadraticCurveTo(-29+wv,headY-2,-25+wv*1.3,headY+34); ctx.stroke(); ctx.restore(); }
  ctx.fillStyle=sk.hair; ctx.beginPath(); ctx.arc(6,headY-8,20,Math.PI*1.02,Math.PI*2.04); ctx.quadraticCurveTo(26,headY-19,8,headY-15); ctx.quadraticCurveTo(-8,headY-20,-13,headY-8); ctx.fill();
  if(ch.style==="titan"){ ctx.fillRect(-10,headY-24,34,8); }
  ctx.fillStyle=sk.primary; ctx.fillRect(-12,headY-10,42,8);
  ctx.strokeStyle=sk.primary; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(-12,headY-6); ctx.quadraticCurveTo(-27-Math.abs(f.vx),headY+2,-24+Math.sin(renderTicker*.12+f.id)*3-Math.abs(f.vx)*1.2,headY+16); ctx.stroke();
  ctx.fillStyle="#fff"; ctx.font="1000 10px Arial"; ctx.fillText(f.letter,10,headY-2.5);
  if(ch.style==="prime"){ ctx.save(); ctx.fillStyle="#ffc400"; ctx.strokeStyle="#8f4b00"; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(-9,headY-18); ctx.lineTo(-9,headY-31); ctx.lineTo(-2,headY-22); ctx.lineTo(5,headY-34); ctx.lineTo(12,headY-22); ctx.lineTo(20,headY-31); ctx.lineTo(20,headY-18); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle="#00e5ff"; ctx.beginPath(); ctx.arc(5,headY-22,2.6,0,7); ctx.fill(); ctx.restore(); }
  ctx.fillStyle="#161616";
  if(f.dead||down){ ctx.font="1000 13px Arial"; ctx.fillText("×",17,headY+4); }
  else if(f.blinkT<0){ ctx.strokeStyle="#161616"; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(14,headY+1); ctx.lineTo(22,headY+1); ctx.stroke(); }
  else { ctx.beginPath(); ctx.arc(18,headY+1,2.6,0,7); ctx.fill(); }
  ctx.strokeStyle="#161616"; ctx.lineWidth=2; ctx.beginPath();
  if(hurt)ctx.arc(20,headY+14,4,0,7); else if(f.victory&&(state==="roundEnd"||state==="matchEnd")){ctx.arc(19,headY+9,6,.15,Math.PI-.2);} else {ctx.moveTo(14,headY+11);ctx.quadraticCurveTo(20,headY+14,25,headY+10);} ctx.stroke();
  // Bras avant selon pose
  const armW=12.5*ch.bulk,gloveR=12*ch.bulk;
  if(f.victory&&(state==="roundEnd"||state==="matchEnd")&&!f.dead){
    limb(8,shY+4,22,-142+bob,27,-176+bob+Math.sin(renderTicker*.15)*4,armW,sk.primary,sk.glove,gloveR);
  }else if(f.blocking){
    limb(8,shY+4,27,shY+15,24,shY+33,armW,sk.primary,sk.glove,gloveR);
    limb(-2,shY+6,23,shY+31,27,shY+11,armW-1,sk.dark,sk.glove,gloveR-1);
  }else if(f.attackType==="special"||f.attackType==="super"){
    const ext=Math.sin(phase*Math.PI*.7)*21;
    limb(8,shY+4,26,shY+11,39+ext,shY+14,armW,sk.primary,sk.glove,gloveR);
    limb(-2,shY+6,18,shY+27,36+ext,shY+18,armW-1,sk.dark,sk.glove,gloveR-1);
  }else if(f.attackType==="uppercut"){
    limb(8,shY+5,25,shY+28-upperExt*.5,30+upperExt*.22,shY-8-upperExt,armW,sk.primary,sk.glove,gloveR+1);
  }else if(state==="intro"&&introT>82){
    limb(8,shY+4,27,shY+8,47,shY+2,armW,sk.primary,sk.glove,gloveR);
  }else{
    limb(8,shY+4,24+punchExt*.35,shY+16,34+punchExt,shY+12,armW,sk.primary,sk.glove,gloveR);
  }
  // Traînées d’attaque
  if(atk&&elapsed>=atk.start&&elapsed<=atk.end+2&&f.attackType!=="special"&&f.attackType!=="super"){
    ctx.save(); ctx.globalAlpha=.55; ctx.strokeStyle=sk.trail; ctx.lineWidth=f.attackType.includes("kick")||f.attackType==="sweep"?9:7; ctx.lineCap="round";
    ctx.beginPath();
    if(f.attackType==="uppercut"){ctx.moveTo(22,shY+30);ctx.quadraticCurveTo(46,shY-12,34,shY-48);}
    else if(f.attackType==="sweep"){ctx.moveTo(15,-12);ctx.quadraticCurveTo(58,-20,92,-8);}
    else if(f.attackType.includes("kick")){ctx.moveTo(18,-62);ctx.quadraticCurveTo(64,-92,98,-72);}
    else {ctx.moveTo(26,shY+13);ctx.lineTo(78,shY+11);}
    ctx.stroke(); ctx.restore();
  }
  try{ctx.filter="none";}catch(e){}
  ctx.restore();
  if(down||f.dead){ ctx.save(); ctx.fillStyle="#ffd54f"; ctx.font="15px Arial"; ctx.textAlign="center"; for(let i=0;i<3;i++){ const a=renderTicker*.09+i*2.1; ctx.fillText("★",f.rx+Math.cos(a)*24,f.ry-30+Math.sin(a)*7); } ctx.restore(); }
  if(f.blocking){ ctx.save(); ctx.strokeStyle="rgba(129,212,250,.95)"; ctx.fillStyle="rgba(79,195,247,.15)"; ctx.lineWidth=4; ctx.drawImage(glowSprite("#4fc3f7"),f.rx+f.facing*36-45,f.ry-102*ch.scale-45,90,90); ctx.beginPath(); ctx.arc(f.rx+f.facing*36,f.ry-96*ch.scale,50*ch.scale,f.facing>0?-.95:Math.PI-.95,f.facing>0?.95:Math.PI+.95); ctx.fill(); ctx.stroke(); ctx.restore(); }
  if(isCombat()||state==="intro"){ ctx.save(); ctx.font="1000 11px 'Segoe UI',Arial"; ctx.textAlign="center"; const label=f.name.toUpperCase(),wdt=Math.max(72,ctx.measureText(label).width+18); ctx.fillStyle="rgba(0,0,0,.46)"; rr(f.rx-wdt/2,f.ry-212*ch.scale,wdt,19,9); ctx.fill(); ctx.fillStyle="#fff"; ctx.fillText(label,f.rx,f.ry-198*ch.scale); ctx.restore(); }
}
function drawProjectiles(){
  for(const pr of projectiles){
    const size=pr.r*4.2; ctx.save(); ctx.globalAlpha=.95; ctx.drawImage(glowSprite(pr.owner.skin.trail),pr.rx-size/2,pr.ry-size/2,size,size);
    ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(pr.rx,pr.ry,pr.r*.48,0,7); ctx.fill(); ctx.restore();
  }
}
function drawEffects(){
  for(const r of rings){ ctx.save(); ctx.globalAlpha=Math.max(0,r.life/15); ctx.strokeStyle=r.c; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(r.x,r.y,r.r,0,7); ctx.stroke(); ctx.restore(); }
  for(const p of particles){ ctx.save(); ctx.globalAlpha=Math.max(0,Math.min(1,p.life/(p.max||30))); ctx.fillStyle=p.c; if(p.rect){ctx.translate(p.x,p.y);ctx.rotate((p.rot||0)+renderTicker*.06);ctx.fillRect(-p.r,-p.r*.55,p.r*2,p.r*1.1);}else{ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill();} ctx.restore(); }
  ctx.textAlign="center";
  for(const fl of floaters){ ctx.save(); ctx.globalAlpha=Math.min(1,fl.life/28); ctx.font="1000 "+(fl.big?27:18)+"px 'Segoe UI',Arial"; ctx.lineWidth=5; ctx.strokeStyle="rgba(0,0,0,.68)"; ctx.strokeText(fl.text,fl.x,fl.y); ctx.fillStyle=fl.c; ctx.fillText(fl.text,fl.x,fl.y); ctx.restore(); }
}
function render(){
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.clearRect(0,0,W,H);
  const shakeAmt=shake*(SETTINGS.shake/100);
  const shX=(Math.random()-.5)*shakeAmt*2,shY=(Math.random()-.5)*shakeAmt*1.35;
  // Arrière-plan avec parallaxe douce
  ctx.save(); const bgZoom=1+(cam.zoom-1)*.32,panX=(640-cam.x)*.045;
  ctx.translate(W/2+shX*.35,H*.46+shY*.35); ctx.scale(bgZoom,bgZoom); ctx.translate(-W/2+panX,-H*.46);
  drawBackground(); ctx.restore();
  // Monde du combat sous caméra dynamique
  ctx.save(); ctx.translate(W/2+shX,GROUND+shY); ctx.scale(cam.zoom,cam.zoom); ctx.translate(-cam.x,-GROUND);
  drawFloor(); drawReflection(p1); drawReflection(p2); drawGhosts();
  const order=[p1,p2].sort((a,b)=>b.ry-a.ry); drawFighter(order[0]); drawFighter(order[1]);
  drawProjectiles(); drawEffects(); ctx.restore();
  // Vignette, alerte vie basse, barres cinéma, signature
  if(vignetteGrad){ ctx.fillStyle=vignetteGrad; ctx.fillRect(0,0,W,H); }
  const Low=(p1.health/p1.maxHealth<.25||p2.health/p2.maxHealth<.25)&&isCombat();
  if(Low&&!SETTINGS.reduceFlash){ ctx.save(); ctx.globalAlpha=.1+.07*Math.sin(renderTicker*.18); ctx.fillStyle="#ff1744"; ctx.fillRect(0,0,W,8); ctx.fillRect(0,H-8,W,8); ctx.fillRect(0,0,8,H); ctx.fillRect(W-8,0,8,H); ctx.restore(); }
  const bars=(state==="intro"||state==="roundEnd"||cinematic>0)?34:0;
  if(bars){ ctx.fillStyle="#000"; ctx.fillRect(0,0,W,bars); ctx.fillRect(0,H-bars,W,bars); }
  ctx.save(); ctx.font="italic 1000 16px 'Segoe UI',Arial"; ctx.textAlign="right"; ctx.fillStyle="rgba(255,255,255,.74)"; ctx.fillText("✍️ Gideon - Godson",W-17,H-13-Math.max(0,bars-4)); ctx.restore();
}

/* ---------------- HUD PRO ---------------- */
const HE={hud:$("hud"),hp1:$("hpP1"),hp2:$("hpP2"),gh1:$("ghostP1"),gh2:$("ghostP2"),bar1:$("barP1"),bar2:$("barP2"),timer:$("timerNum"),clock:$("matchClock"),combo:$("comboBox"),pips1:$("pipsP1"),pips2:$("pipsP2")};
let ghost1=100,ghost2=100,lastClock="",comboKey="",comboFillEl=null;
function buildPips(){
  const mk=(el,wins)=>{ el.innerHTML=""; for(let i=0;i<SETTINGS.roundsWin;i++){ const s=document.createElement("span"); s.className="pip"+(i<wins?" on":""); el.appendChild(s); } };
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
  if(HE.pips1.children.length!==SETTINGS.roundsWin||HE.pips2.children.length!==SETTINGS.roundsWin)buildPips();
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
  // Qualité automatique régulière
  if(SETTINGS.quality==="auto"&&rafCount%100===0){
    if(fpsEMA<45&&qualityLevel>0){ qualityLevel--; resizeCanvas(); autoGoodChecks=0; }
    else if(fpsEMA>58&&qualityLevel<2){ if(++autoGoodChecks>=7){qualityLevel++;resizeCanvas();autoGoodChecks=0;} }
    else autoGoodChecks=0;
  }
  if(SETTINGS.showFps&&rafCount%12===0){ const txt=Math.round(fpsEMA)+" FPS • Q"+qualityLevel; if(txt!==lastFpsShown){lastFpsShown=txt;$("fpsChip").textContent=txt;} }
  if(state==="pause"){ prepareInterpolation(1); updateCamera(0); render(); return; }
  if(hitStopT>0){ hitStopT-=dt; shake*=.9; prepareInterpolation(1); updateCamera(dt); render(); updateHUD(); return; }
  let scale=SETTINGS.speed;
  if(slowmoT>0){ slowmoT-=dt/16.667; scale*=.34; }
  acc+=dt*scale;
  const step=1000/60; let n=0;
  while(acc>=step&&n<3){ updateGameLogic(); acc-=step; n++; }
  if(n===3&&acc>=step)acc=0;
  prepareInterpolation(clamp(acc/step,0,1));
  updateCamera(dt);
  render(); updateHUD();
}
function startLoop(){ resizeCanvas(); requestAnimationFrame(loop); }
rebuildArenaCache();
