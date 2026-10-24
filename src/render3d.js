"use strict";
/* =====================================================================
   Godson FURY ARENA V6.0 — RÉALITÉ 3D (WebGL maison, zéro dépendance)
   Personnages humanoïdes articulés, arènes en profondeur, caméra combat.
   La simulation reste celle du moteur déterministe : ce module ne fait
   que dessiner. Repli automatique vers le rendu 2D AAA II si besoin.
   Signé : Gédéon - Godson
   ===================================================================== */
const renderer3DState={requested:true,mode:"auto",active:false,available:false,initialized:false,initFailed:false,fallback:"",frames:0,vertices:0,drawCalls:0,arenaKey:"",autoDisabled:false,camera:{x:0,y:2.05,z:8.6}};
const R3D={canvas:null,gl:null,program:null,pointProgram:null,attribs:{},uniforms:{},pointAttribs:{},pointUniforms:{},dyn:null,dynTrans:null,points:null,arena:null,arenaTrans:null,vp:null,view:null,camPos:[0,2.05,8.6],lightDir:[-.45,.82,.35],lightColor:[1,.86,.68],fogColor:[.04,.05,.12]};
const R3D_WORLD=1/95;
function syncRenderer3DStats(){
  if(typeof renderStats==="undefined")return;
  renderStats.renderer3dMode=renderer3DState.mode;
  renderStats.renderer3dRequested=renderer3DState.requested;
  renderStats.renderer3dActive=renderer3DState.active;
  renderStats.renderer3dAvailable=renderer3DState.available;
  renderStats.renderer3dFallback=renderer3DState.fallback;
  renderStats.renderer3dFrames=renderer3DState.frames;
  renderStats.renderer3dVertices=renderer3DState.vertices;
  renderStats.renderer3dDrawCalls=renderer3DState.drawCalls;
  renderStats.camera3d=renderer3DState.camera.x.toFixed(2)+","+renderer3DState.camera.y.toFixed(2)+","+renderer3DState.camera.z.toFixed(2);
}
function setRenderer3DEnabled(on,mode){
  renderer3DState.requested=!!on;
  if(mode)renderer3DState.mode=mode;
  if(on)renderer3DState.autoDisabled=false;
  if(!on){ renderer3DState.active=false; if(document.body)document.body.classList.remove("render3d-on"); }
  syncRenderer3DStats();
}
function renderer3DCombatState(){ return !!(typeof p1!=="undefined"&&typeof p2!=="undefined"&&p1&&p2&&["vs","intro","fight","training","roundEnd","matchEnd","pause"].includes(state)); }
function rand3(i){ const x=Math.sin(i*127.1+311.7)*43758.5453; return x-Math.floor(x); }
function v3a(x,y,z){ return [x||0,y||0,z||0]; }
function add3(a,b){ return [a[0]+b[0],a[1]+b[1],a[2]+b[2]]; }
function sub3(a,b){ return [a[0]-b[0],a[1]-b[1],a[2]-b[2]]; }
function scale3(a,s){ return [a[0]*s,a[1]*s,a[2]*s]; }
function dot3(a,b){ return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; }
function cross3(a,b){ return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]; }
function len3(a){ return Math.hypot(a[0],a[1],a[2])||0; }
function norm3(a){ const l=len3(a)||1; return [a[0]/l,a[1]/l,a[2]/l]; }
function mix3(a,b,t){ return [lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)]; }
function parseColor3(input,alpha,emissive){
  let r=1,g=1,b=1,a=alpha==null?1:alpha;
  if(Array.isArray(input)){ r=input[0]||0; g=input[1]||0; b=input[2]||0; if(input.length>3&&alpha==null)a=input[3]; }
  else if(typeof input==="string"&&input.charAt(0)==="#"){
    let h=input.slice(1); if(h.length===3)h=h.split("").map(c=>c+c).join("");
    const n=parseInt(h,16); r=((n>>16)&255)/255; g=((n>>8)&255)/255; b=(n&255)/255;
  }else if(typeof input==="string"){
    const mm=input.match(/rgba?\(([^)]+)\)/i);
    if(mm){ const p=mm[1].split(",").map(v=>parseFloat(v)); r=(p[0]||0)/255; g=(p[1]||0)/255; b=(p[2]||0)/255; if(p.length>3&&alpha==null)a=p[3]; }
  }
  return [clamp(r,0,1),clamp(g,0,1),clamp(b,0,1),clamp(a,0,1),emissive||0];
}
function mat4Multiply3(a,b){
  const out=new Array(16);
  for(let c=0;c<4;c++)for(let r=0;r<4;r++)out[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];
  return out;
}
function mat4Perspective3(fov,aspect,near,far){
  const f=1/Math.tan(fov/2),nf=1/(near-far);
  return [f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*nf,-1,0,0,2*far*near*nf,0];
}
function mat4LookAt3(eye,target,up){
  const z=norm3(sub3(eye,target)),x=norm3(cross3(up,z)),y=cross3(z,x);
  return [x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot3(x,eye),-dot3(y,eye),-dot3(z,eye),1];
}
function transformVec4_3(m,p){
  return [m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14],m[3]*p[0]+m[7]*p[1]+m[11]*p[2]+m[15]];
}
function project3DPoint(p){
  if(!R3D.vp)return null;
  const c=transformVec4_3(R3D.vp,p); if(!c[3]||c[3]<=0)return null;
  const nx=c[0]/c[3],ny=c[1]/c[3],nz=c[2]/c[3];
  return {x:(nx*.5+.5)*W,y:(.5-ny*.5)*H,z:nz};
}
function worldFromGame3D(x,y,z){ return [(x-640)*R3D_WORLD,(GROUND-y)*R3D_WORLD,z||0]; }
function rotate3(p,rot){
  let x=p[0],y=p[1],z=p[2],c,s,t;
  c=Math.cos(rot[0]||0); s=Math.sin(rot[0]||0); t=y*c-z*s; z=y*s+z*c; y=t;
  c=Math.cos(rot[1]||0); s=Math.sin(rot[1]||0); t=x*c+z*s; z=-x*s+z*c; x=t;
  c=Math.cos(rot[2]||0); s=Math.sin(rot[2]||0); t=x*c-y*s; y=x*s+y*c; x=t;
  return [x,y,z];
}
function xform3(p,center,rot,scale){
  const sc=Array.isArray(scale)?scale:[scale,scale,scale];
  return add3(center,rotate3([p[0]*sc[0],p[1]*sc[1],p[2]*sc[2]],rot||[0,0,0]));
}
function newBatch3D(){ return {pos:[],norm:[],col:[],emi:[],idx:[],count:0}; }
function vert3(b,p,n,c){
  b.pos.push(p[0],p[1],p[2]); b.norm.push(n[0],n[1],n[2]); b.col.push(c[0],c[1],c[2],c[3]); b.emi.push(c[4]||0);
  return b.count++;
}
function tri3(b,a,bp,c,color,normal){
  const n=normal?norm3(normal):norm3(cross3(sub3(bp,a),sub3(c,a)));
  const cols=Array.isArray(color[0])?color:[color,color,color];
  b.idx.push(vert3(b,a,n,cols[0]),vert3(b,bp,n,cols[1]),vert3(b,c,n,cols[2]));
}
function quad3(b,a,bp,c,d,color){
  const n=norm3(cross3(sub3(bp,a),sub3(d,a)));
  const cols=Array.isArray(color[0])?color:[color,color,color,color];
  const i0=vert3(b,a,n,cols[0]),i1=vert3(b,bp,n,cols[1]),i2=vert3(b,c,n,cols[2]),i3=vert3(b,d,n,cols[3]);
  b.idx.push(i0,i1,i2,i0,i2,i3);
}
function addBox3D(b,center,size,rot,color){
  const cs=[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5],[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]].map(p=>xform3(p,center,rot||[0,0,0],size));
  quad3(b,cs[0],cs[1],cs[2],cs[3],color); quad3(b,cs[5],cs[4],cs[7],cs[6],color);
  quad3(b,cs[4],cs[0],cs[3],cs[7],color); quad3(b,cs[1],cs[5],cs[6],cs[2],color);
  quad3(b,cs[4],cs[5],cs[1],cs[0],color); quad3(b,cs[3],cs[2],cs[6],cs[7],color);
}
function detail3(){ return qualityLevel===0?{sector:9,rings:6,cyl:8}:qualityLevel===1?{sector:12,rings:8,cyl:10}:{sector:16,rings:10,cyl:12}; }
function addSphere3D(b,center,radius,rot,color){
  const d=detail3(),rad=Array.isArray(radius)?radius:[radius,radius,radius],grid=[];
  for(let i=0;i<=d.rings;i++){
    const phi=-Math.PI/2+i/d.rings*Math.PI,row=[];
    for(let j=0;j<=d.sector;j++){
      const th=j/d.sector*Math.PI*2,unit=[Math.cos(phi)*Math.cos(th),Math.sin(phi),Math.cos(phi)*Math.sin(th)];
      const p=xform3(unit,center,rot||[0,0,0],rad);
      const n=norm3(rotate3([unit[0]/Math.max(.001,rad[0]),unit[1]/Math.max(.001,rad[1]),unit[2]/Math.max(.001,rad[2])],rot||[0,0,0]));
      row.push(vert3(b,p,n,color));
    }
    grid.push(row);
  }
  for(let i=0;i<d.rings;i++)for(let j=0;j<d.sector;j++)b.idx.push(grid[i][j],grid[i+1][j],grid[i+1][j+1],grid[i][j],grid[i+1][j+1],grid[i][j+1]);
}
function addCylinder3D(b,a,bp,r1,r2,color,segments){
  const seg=segments||detail3().cyl,axis=norm3(sub3(bp,a));
  const helper=Math.abs(dot3(axis,[0,1,0]))>.9?[1,0,0]:[0,1,0],u=norm3(cross3(axis,helper)),v=cross3(u,axis),ringA=[],ringB=[];
  for(let i=0;i<=seg;i++){
    const th=i/seg*Math.PI*2,dir=add3(scale3(u,Math.cos(th)),scale3(v,Math.sin(th)));
    ringA.push(vert3(b,add3(a,scale3(dir,r1)),dir,color)); ringB.push(vert3(b,add3(bp,scale3(dir,r2)),dir,color));
  }
  for(let i=0;i<seg;i++)b.idx.push(ringA[i],ringB[i],ringB[i+1],ringA[i],ringB[i+1],ringA[i+1]);
  const ca=vert3(b,a,scale3(axis,-1),color),cb=vert3(b,bp,axis,color);
  for(let i=0;i<seg;i++){ b.idx.push(ca,ringA[i+1],ringA[i]); b.idx.push(cb,ringB[i],ringB[i+1]); }
}
function addCapsule3D(b,a,bp,r1,r2,color){
  addCylinder3D(b,a,bp,r1,r2,color);
  addSphere3D(b,a,r1,[0,0,0],color); addSphere3D(b,bp,r2,[0,0,0],color);
}
function compileShader3D(gl,type,src){
  const sh=gl.createShader(type); gl.shaderSource(sh,src); gl.compileShader(sh);
  if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh)||"shader");
  return sh;
}
function makeProgram3D(gl,vs,fs,attrs,uniforms){
  const prog=gl.createProgram();
  gl.attachShader(prog,compileShader3D(gl,gl.VERTEX_SHADER,vs)); gl.attachShader(prog,compileShader3D(gl,gl.FRAGMENT_SHADER,fs)); gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(prog)||"link");
  const out={prog,attribs:{},uniforms:{}};
  attrs.forEach(n=>out.attribs[n]=gl.getAttribLocation(prog,n)); uniforms.forEach(n=>out.uniforms[n]=gl.getUniformLocation(prog,n));
  return out;
}
function makeBatchBuffers3D(gl){ return {pos:gl.createBuffer(),norm:gl.createBuffer(),col:gl.createBuffer(),emi:gl.createBuffer(),idx:gl.createBuffer(),count:0,vertices:0}; }
function uploadBatch3D(gl,buffers,batch,usage){
  gl.bindBuffer(gl.ARRAY_BUFFER,buffers.pos); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(batch.pos),usage);
  gl.bindBuffer(gl.ARRAY_BUFFER,buffers.norm); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(batch.norm),usage);
  gl.bindBuffer(gl.ARRAY_BUFFER,buffers.col); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(batch.col),usage);
  gl.bindBuffer(gl.ARRAY_BUFFER,buffers.emi); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(batch.emi),usage);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,buffers.idx); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(batch.idx),usage);
  buffers.count=batch.idx.length; buffers.vertices=batch.count;
}
function drawBatch3D(gl,buffers){
  if(!buffers||!buffers.count)return;
  const at=R3D.program.attribs;
  gl.bindBuffer(gl.ARRAY_BUFFER,buffers.pos); gl.enableVertexAttribArray(at.aPos); gl.vertexAttribPointer(at.aPos,3,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,buffers.norm); gl.enableVertexAttribArray(at.aNorm); gl.vertexAttribPointer(at.aNorm,3,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,buffers.col); gl.enableVertexAttribArray(at.aColor); gl.vertexAttribPointer(at.aColor,4,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,buffers.emi); gl.enableVertexAttribArray(at.aEmissive); gl.vertexAttribPointer(at.aEmissive,1,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,buffers.idx); gl.drawElements(gl.TRIANGLES,buffers.count,gl.UNSIGNED_SHORT,0);
  renderer3DState.drawCalls++; renderer3DState.vertices+=buffers.vertices;
}
function initRenderer3D(){
  if(renderer3DState.initialized)return true;
  if(renderer3DState.initFailed)return false;
  try{
    const canvas3d=document.getElementById("gl3d"); if(!canvas3d)throw new Error("canvas WebGL absent");
    const opts={alpha:true,antialias:true,depth:true,stencil:false,powerPreference:"high-performance"};
    const gl=canvas3d.getContext("webgl2",opts)||canvas3d.getContext("webgl",opts)||canvas3d.getContext("experimental-webgl",opts);
    if(!gl||typeof gl.COLOR_BUFFER_BIT!=="number"||typeof gl.createShader!=="function"||typeof gl.createBuffer!=="function")throw new Error("WebGL indisponible");
    R3D.canvas=canvas3d; R3D.gl=gl;
    canvas3d.addEventListener("webglcontextlost",e=>{ e.preventDefault(); renderer3DState.initialized=false; renderer3DState.active=false; renderer3DState.fallback="Contexte WebGL perdu"; document.body.classList.remove("render3d-on"); syncRenderer3DStats(); });
    R3D.program=makeProgram3D(gl,
      "precision mediump float;attribute vec3 aPos;attribute vec3 aNorm;attribute vec4 aColor;attribute float aEmissive;uniform mat4 uVP;uniform vec3 uCamPos;varying vec4 vColor;varying vec3 vNorm;varying vec3 vWorld;varying float vEmissive;varying float vFog;void main(){vColor=aColor;vNorm=aNorm;vWorld=aPos;vEmissive=aEmissive;vFog=distance(uCamPos,aPos);gl_Position=uVP*vec4(aPos,1.0);}",
      "precision mediump float;uniform vec3 uLightDir;uniform vec3 uLightColor;uniform vec3 uCamPos;uniform vec3 uFogColor;varying vec4 vColor;varying vec3 vNorm;varying vec3 vWorld;varying float vEmissive;varying float vFog;void main(){vec3 n=normalize(vNorm);vec3 l=normalize(uLightDir);float diff=max(dot(n,l),0.0);float hemi=0.30+0.24*(n.y*0.5+0.5);vec3 v=normalize(uCamPos-vWorld);vec3 h=normalize(l+v);float spec=pow(max(dot(n,h),0.0),38.0)*0.17;float rim=pow(1.0-max(dot(n,v),0.0),3.0)*0.16;float groundShade=0.86+0.14*clamp(vWorld.y/2.2,0.0,1.0);vec3 col=(vColor.rgb*(hemi+uLightColor*diff*0.95)+spec+uLightColor*rim+vColor.rgb*vEmissive)*groundShade;float f=smoothstep(16.0,38.0,vFog);col=mix(col,uFogColor,f*0.72);gl_FragColor=vec4(col,vColor.a);}",
      ["aPos","aNorm","aColor","aEmissive"],["uVP","uCamPos","uLightDir","uLightColor","uFogColor"]);
    R3D.pointProgram=makeProgram3D(gl,
      "precision mediump float;attribute vec3 aPos;attribute vec4 aColor;attribute float aSize;uniform mat4 uVP;uniform float uScale;varying vec4 vColor;void main(){vColor=aColor;vec4 clip=uVP*vec4(aPos,1.0);gl_PointSize=aSize*uScale/max(1.0,clip.w);gl_Position=clip;}",
      "precision mediump float;varying vec4 vColor;void main(){float d=distance(gl_PointCoord,vec2(0.5));float a=vColor.a*smoothstep(0.5,0.08,d);if(a<0.01)discard;gl_FragColor=vec4(vColor.rgb,a);}",
      ["aPos","aColor","aSize"],["uVP","uScale"]);
    R3D.dyn=makeBatchBuffers3D(gl); R3D.dynTrans=makeBatchBuffers3D(gl);
    R3D.points={pos:gl.createBuffer(),col:gl.createBuffer(),size:gl.createBuffer(),count:0};
    renderer3DState.initialized=true; renderer3DState.available=true; renderer3DState.fallback="";
    syncRenderer3DStats(); return true;
  }catch(e){
    renderer3DState.initFailed=true; renderer3DState.available=false; renderer3DState.active=false; renderer3DState.fallback=String(e&&e.message||e||"WebGL indisponible");
    if(document.body)document.body.classList.remove("render3d-on"); syncRenderer3DStats(); return false;
  }
}
function resizeRenderer3D(){
  const gl=R3D.gl,c=R3D.canvas; if(!gl||!c)return;
  const targetW=Math.max(320,Math.round(W*(DPR||1))),targetH=Math.max(180,Math.round(H*(DPR||1)));
  if(c.width!==targetW||c.height!==targetH){ c.width=targetW; c.height=targetH; }
  gl.viewport(0,0,c.width,c.height);
}
function buildArenaBatch3D(){
  const opaque=newBatch3D(),trans=newBatch3D(),id=currentArena.id,mood=arenaMoodTheme(),floor=FLOOR_THEMES[id]||FLOOR_THEMES.stadium;
  for(let i=0;i<mood.sky.length-1;i++){ const topStop=mood.sky[i],botStop=mood.sky[i+1],yTop=14*(1-topStop[0]),yBot=14*(1-botStop[0]),topCol=parseColor3(topStop[1]),botCol=parseColor3(botStop[1]); quad3(opaque,[-26,yBot,-20],[26,yBot,-20],[26,yTop,-20],[-26,yTop,-20],[botCol,botCol,topCol,topCol]); }
  const celestial=mood.celestial==="moon"?[-5.5,5.9,-17]:mood.celestial==="sunLow"?[-6.2,4.9,-17]:[6,6.35,-17];
  addSphere3D(opaque,celestial,mood.celestial==="moon"?.55:mood.celestial==="sunLow"?.92:1.02,[0,0,0],parseColor3(mood.celestial==="moon"?"#dbeafe":"#ffd54f",1,.9));
  addBox3D(opaque,[0,-.1,-1],[36,.2,23],[0,0,0],parseColor3(floor.mid));
  addBox3D(opaque,[0,.006,.35],[15.5,.025,7.2],[0,0,0],parseColor3(floor.top));
  const line=parseColor3(floor.line,1,.08),grid=parseColor3(id==="temple"||id==="Libreville"?"#ffffff":floor.line,id==="stadium"?.24:id==="temple"||id==="Libreville"?.16:.38,.015);
  for(let x=-8;x<=8;x++)addBox3D(trans,[x,.016,.9],[.018,.01,8.6],[0,0,0],grid);
  for(let z=-3;z<=5;z++)addBox3D(trans,[0,.016,z],[17,.01,.018],[0,0,0],grid);
  for(let i=0;i<64;i++){ const a=i/64*Math.PI*2; addBox3D(trans,[Math.cos(a)*2.05,.022,Math.sin(a)*.92],[.2,.016,.04],[0,-a,0],parseColor3(id==="temple"?"#8e2418":"#ffc400",.48,.03)); }
  addBox3D(opaque,[0,.035,-4.45],[22,.07,.09],[0,0,0],line);
  if(id==="stadium"){
    for(let i=0;i<5;i++)addBox3D(opaque,[0,.45+i*.5,-5.4-i*1.05],[23,.9,1.05],[0,0,0],parseColor3(i%2?"#1f2d3d":"#2d4054"));
    addBox3D(opaque,[0,.38,-4.72],[23,.42,.18],[0,0,0],parseColor3("#162536"));
    [-8.4,-4.2,0,4.2,8.4].forEach((x,i)=>addBox3D(opaque,[x,.4,-4.61],[3.4,.3,.045],[0,0,0],parseColor3(["#123a63","#5b2147","#6b4b08","#123f39","#33275f"][i%5],1,.18)));
    const crowdN=qualityLevel===0?150:qualityLevel===1?250:360,slots=Math.ceil(crowdN/5),palette=["#334155","#475569","#5b3a44","#315a68","#67543a","#39496f","#5f7052","#6b4b5a"],bright=["#ffc400","#ff2e88","#00a2ff","#00e676","#ff7043"],skins=["#8d5524","#c68642","#e8b98d","#5d4037","#a9714b"];
    for(let i=0;i<crowdN;i++){
      const tier=i%5,slot=(i/5)|0,x=-10.7+slot/Math.max(1,slots-1)*21.4+(rand3(i*5+2)-.5)*.17,h=.2+rand3(i*7)*.06,w=.19+rand3(i*11)*.04,y=.99+tier*.5+(rand3(i*13)-.5)*.03,z=-5.35-tier*1.05+(rand3(i*17)-.5)*.36;
      const clothes=rand3(i*19)<.16?bright[(rand3(i*23)*bright.length)|0]:palette[(rand3(i*23)*palette.length)|0];
      addBox3D(opaque,[x,y,z],[w,h,.14],[0,(rand3(i*29)-.5)*.18,0],parseColor3(clothes));
      addBox3D(opaque,[x+(rand3(i*31)-.5)*.02,y+h/2+.055,z],[.085,.105,.085],[0,0,0],parseColor3(skins[(rand3(i*37)*skins.length)|0]));
      if(rand3(i*41)>.64)addBox3D(opaque,[x,y+h/2+.115,z],[.095,.025,.095],[0,(rand3(i*43)-.5)*.3,0],parseColor3(rand3(i*47)>.5?"#1f2937":clothes));
    }
    [-2.2,2.2].forEach(x=>addCylinder3D(opaque,[x,2.75,-9.55],[x,3.65,-9.55],.055,.05,parseColor3("#263238"))); addBox3D(opaque,[0,4.35,-9.45],[6.1,1.5,.3],[0,0,0],parseColor3("#101827")); addBox3D(opaque,[0,4.35,-9.27],[5.3,1.08,.06],[0,0,0],parseColor3("#123a63",1,.35));
    addBox3D(opaque,[-1.25,4.58,-9.22],[2.2,.18,.03],[0,0,0],parseColor3("#00e5ff",1,.8)); addBox3D(opaque,[1.15,4.14,-9.22],[2.5,.18,.03],[0,0,0],parseColor3("#ff2e88",1,.8));
    [-7.35,7.35].forEach(x=>{ addCylinder3D(opaque,[x,0,-4.9],[x,5.75,-5.2],.085,.065,parseColor3("#90a4ae")); addBox3D(opaque,[x,5.92,-5.2],[1.05,.42,.18],[0,0,0],parseColor3("#ffffff",1,.85)); });
  }else if(id==="tokyo"){
    const buildings=[];
    for(let i=0;i<19;i++){ const w=.9+rand3(i*3)*.8,h=2.4+rand3(i*5+1)*4.6,x=-12+i*1.32+(rand3(i*7)-.5)*.35,z=-7.2-rand3(i*11)*4.3; buildings.push({x,w,h,z}); addBox3D(opaque,[x,h/2,z],[w,h,1.1],[0,0,0],parseColor3(i%3?"#0b102b":"#17203d")); }
    let windows=0; const maxWindows=qualityLevel===0?140:qualityLevel===1?230:340;
    buildings.forEach((bd,bi)=>{ for(let y=.45;y<bd.h-.25&&windows<maxWindows;y+=.42)for(let x=-bd.w/2+.2;x<bd.w/2-.1&&windows<maxWindows;x+=.3){ if(rand3(bi*101+y*17+x*31)>.48){ addBox3D(opaque,[bd.x+x,y,bd.z+.57],[.11,.16,.025],[0,0,0],parseColor3(["#69f0ae","#ffd54f","#4fc3f7","#ff80ab"][(rand3(windows*7)*4)|0],1,.75)); windows++; } } });
    addBox3D(opaque,[-6,3,-6.3],[.22,3.6,.14],[0,0,0],parseColor3("#ff2e88",1,.85)); addBox3D(opaque,[4.8,2.6,-6.1],[.22,2.8,.14],[0,0,0],parseColor3("#00e5ff",1,.85));
    [-5,-1.5,2.5,6].forEach((x,i)=>{ addCylinder3D(opaque,[x,0,-3.6],[x,2.7,-3.6],.045,.04,parseColor3("#263238")); addSphere3D(opaque,[x,2.85,-3.6],.11,[0,0,0],parseColor3(i%2?"#00e5ff":"#ff80ab",1,.8)); });
    [[-3,.5],[1,1],[5,.7]].forEach(p=>addSphere3D(trans,[p[0],.022,p[1]],[.68,.02,.2],[0,0,0],parseColor3("#4fc3f7",.15,.2)));
  }else if(id==="temple"){
    for(let i=0;i<3;i++)addBox3D(opaque,[0,.08+i*.13,-4.2-i*.35],[11-i*1.2,.16,1.1],[0,0,0],parseColor3(i%2?"#8d6e63":"#a1887f"));
    [-6.5,-4,-1.5,1.5,4,6.5].forEach(x=>{ addCylinder3D(opaque,[x,0,-5.2],[x,4.15,-5.2],.21,.19,parseColor3("#bcaaa4")); addBox3D(opaque,[x,4.29,-5.2],[.65,.28,.65],[0,0,0],parseColor3("#6d4c41")); });
    addBox3D(opaque,[-3.1,4.87,-5.2],[7,.24,2.4],[0,0,.24],parseColor3("#8e2418")); addBox3D(opaque,[3.1,4.87,-5.2],[7,.24,2.4],[0,0,-.24],parseColor3("#8e2418"));
    [-8.5,0,8.5].forEach((x,i)=>addCylinder3D(opaque,[x,0,-16-i],[x,3.35+i*.35,-16-i],2.35,.02,parseColor3(i===1?"#607d8b":"#546e7a"),7));
    [-5,-2.5,0,2.5,5].forEach(x=>{ addCylinder3D(opaque,[x,4.02,-4.9],[x,3.56,-4.9],.012,.012,parseColor3("#3e2723")); addSphere3D(opaque,[x,3.38,-4.9],[.15,.18,.15],[0,0,0],parseColor3("#ffb74d",1,.72)); });
  }else{
    addBox3D(opaque,[0,.015,-8],[36,.03,7.5],[0,0,0],parseColor3(currentArenaMood==="nuit"?"#075a78":"#0b7da3",1,.05));
    [-4.55,-4.05,-3.55].forEach((z,i)=>addBox3D(trans,[Math.sin(i*2.1)*1.2,.035,z],[18,.018,.09],[0,0,0],parseColor3("#ffffff",.38,.1)));
    [[-8.5,-2.8],[-5.2,-3.8],[5.8,-3.8],[9,-2.7]].forEach((p,pi)=>{
      let prev=[p[0],0,p[1]]; for(let sgm=1;sgm<=3;sgm++){ const pt=[p[0]+Math.sin(pi+sgm)*.22*sgm,sgm*1.05,p[1]-sgm*.08]; addCylinder3D(opaque,prev,pt,.11-.015*sgm,.09-.012*sgm,parseColor3("#6d4c41")); prev=pt; }
      for(let k=0;k<7;k++){ const a=k/7*Math.PI*2+pi,end=[prev[0]+Math.cos(a)*1.15,prev[1]+.18-Math.abs(Math.sin(a))*.25,prev[2]+Math.sin(a)*1.15]; addCylinder3D(opaque,prev,end,.055,.012,parseColor3("#1b7a43"),6); }
    });
    [[-6.6,-10.5],[7,-11]].forEach(p=>{ addBox3D(opaque,[p[0],.14,p[1]],[1.05,.18,.32],[0,.25,0],parseColor3("#5d4037")); addCylinder3D(opaque,[p[0],.2,p[1]],[p[0],1.05,p[1]],.028,.024,parseColor3("#3e2723")); tri3(opaque,[p[0],1,p[1]],[p[0],.28,p[1]],[p[0]+.5,.32,p[1]],parseColor3("#fff8e1")); });
    addSphere3D(opaque,[-8,.05,2.8],[1.3,.16,.55],[0,0,0],parseColor3("#e0b073")); addSphere3D(opaque,[8.2,.05,3],[1.5,.18,.6],[0,0,0],parseColor3("#e0b073"));
  }
  return {opaque,trans};
}
function ensureArena3D(){
  const key=currentArena.id+":"+currentArenaMood+":q"+qualityLevel,gl=R3D.gl;
  if(renderer3DState.arenaKey===key&&R3D.arena)return;
  const built=buildArenaBatch3D();
  if(!R3D.arena){ R3D.arena=makeBatchBuffers3D(gl); R3D.arenaTrans=makeBatchBuffers3D(gl); }
  uploadBatch3D(gl,R3D.arena,built.opaque,gl.STATIC_DRAW); uploadBatch3D(gl,R3D.arenaTrans,built.trans,gl.STATIC_DRAW);
  renderer3DState.arenaKey=key; if(typeof renderStats!=="undefined")renderStats.arena3d=key;
}
function buildFighterPose3D(f){
  const ch=f.char,human=humanProfile(f),motion=fighterMotion(f),atk=f.attack,phase=motion.attack||0,S=ch.scale||1;
  if(f.crouchBlend==null)f.crouchBlend=0;
  f.crouchBlend=smoothMotionValue(f.crouchBlend,(f.crouching||f.attackType==="uppercut"||f.attackType==="sweep")?1:0,14);
  const cb=f.crouchBlend,gaitLift=Math.abs(Math.sin(f.walkPhase||0))*motion.run;
  const bobPx=!f.dead&&f.downT<=0?(Math.sin(motion.breath)*(1.45+motion.fatigue*1.25)*(1-cb*.45)*(1-motion.air*.72)-gaitLift*2.1+motion.weight*.85-motion.hurt*1.3+motion.guard*1.1):0;
  const bob=bobPx/95,m1Boost=atk&&atk.m1?(4+(atk.m1Step||0)*3+(atk.m1Final?7:0)):0;
  const punchExt=(f.attackType==="punch"||f.attackType==="airPunch")?phase*(48+m1Boost)/95:0;
  const kickExt=(f.attackType==="kick"||f.attackType==="airKick"||f.attackType==="sweep")?phase*(54+m1Boost)/95:0;
  const upperExt=f.attackType==="uppercut"?phase*(44+m1Boost)/95:0;
  const attackShift=(f.attackType==="throw"?phase*10:f.attackType==="punch"||f.attackType==="airPunch"?phase*8:f.attackType==="kick"||f.attackType==="airKick"?phase*4:f.attackType==="special"||f.attackType==="super"||f.attackType==="exspecial"?phase*6:0)/95;
  const walking=motion.run>.07&&f.grounded&&f.dashT<=0,local={};
  local.pelvis=[motion.lean*.1+motion.weight*.014-motion.hurt*.02,lerp(.94,.67,cb)+bob,0];
  local.chest=[motion.lean*.27+motion.weight*.022+attackShift+motion.guard*.03-motion.hurt*.06,lerp(1.44,1.16,cb)+bob+motion.fatigue*.018,0];
  local.head=[.055+local.chest[0]*.62+motion.head*.09+(motion.headLag||0)/95-motion.hurt*.03,lerp(1.73,1.44,cb)+bob+motion.fatigue*.012,0];
  local.neck=mix3(local.chest,local.head,.55);
  const shoulderHalf=(human.shoulder/95)*(.9+ch.bulk*.2),hipHalf=(human.hip/95)*(.92+ch.bulk*.18);
  local.shoulderBack=[local.chest[0]-.015,local.chest[1]+.035-(motion.shoulderRoll||0)/95,-shoulderHalf];
  local.shoulderFront=[local.chest[0]+.015,local.chest[1]+.035+(motion.shoulderRoll||0)/95,shoulderHalf];
  local.hipBack=[local.pelvis[0]-.01,local.pelvis[1]+.01-(motion.pelvisRoll||0)/95,-hipHalf];
  local.hipFront=[local.pelvis[0]+.01,local.pelvis[1]+.01+(motion.pelvisRoll||0)/95,hipHalf];
  let bFoot=[-.25-motion.lean*.08,0,-.115],fFoot=[.27+motion.lean*.05,0,.115];
  if(cb>.12){ bFoot[0]=lerp(bFoot[0],-.31,cb); fFoot[0]=lerp(fFoot[0],.29,cb); }
  if(walking){
    const strideDir=Math.sign(((f.vx||0)+(f.kvx||0))*(f.facing||1))||1,stride=(.16+motion.run*.19)*strideDir,s=Math.sin(f.walkPhase||0),c=Math.cos(f.walkPhase||0),mix=clamp(motion.run*1.35,0,1);
    bFoot[0]=lerp(bFoot[0],-.03-s*stride,mix); fFoot[0]=lerp(fFoot[0],.05+s*stride,mix);
    bFoot[1]=lerp(bFoot[1],Math.max(0,-c)*(.035+motion.run*.075),mix); fFoot[1]=lerp(fFoot[1],Math.max(0,c)*(.035+motion.run*.075),mix);
  }
  if(!f.dead&&motion.air>.03){ const a=motion.air,sw=clamp((f.vy||0)*.006,-.035,.045); bFoot=mix3(bFoot,[-.19-sw,.3+sw,-.115],a); fFoot=mix3(fFoot,[.24+sw,.2-sw,.115],a); }
  if(f.attackType==="kick")fFoot=[.44+kickExt*.82,.94,.12];
  if(f.attackType==="airKick")fFoot=[.45+kickExt*.82,.6,.12];
  if(f.attackType==="sweep")fFoot=[.46+kickExt*.82,.07,.12];
  if(motion.dash>.04){ bFoot=mix3(bFoot,[-.36,.06,-.115],motion.dash); fFoot=mix3(fFoot,[.34,.02,.115],motion.dash); }
  local.footBack=bFoot; local.footFront=fFoot;
  const kneeFor=(hip,foot,isKick)=>{
    if(isKick)return [(hip[0]+foot[0])/2+.035,(hip[1]+foot[1])/2+.035,foot[2]];
    const k=solveJoint(hip[0],hip[1],foot[0],foot[1]-.06,.48,.47,-1); return [k.x,k.y,foot[2]];
  };
  local.kneeBack=kneeFor(local.hipBack,bFoot,false); local.kneeFront=kneeFor(local.hipFront,fFoot,f.attackType==="kick"||f.attackType==="airKick"||f.attackType==="sweep");
  const armSwing=Math.sin(f.walkPhase||0)*.09*motion.run*strideSign3(f),guard=motion.guard;
  let backHand=[lerp(-.06+armSwing,.29,guard),lerp(1.04+bob+cb*.05,local.chest[1]-.03,guard),-.19];
  let frontHand=[.36+punchExt-armSwing*.5,local.chest[1]-.025,.2];
  if(f.victory&&(state==="roundEnd"||state==="matchEnd")&&!f.dead)frontHand=[.18,2.02+Math.sin(renderTicker*.15)*.04,.18];
  else if(guard>.08&&f.attackT<=0)frontHand=mix3(frontHand,[.27,local.chest[1]+.02,.19],guard);
  else if(f.attackType==="throw"){ frontHand=[.5+phase*.3,local.chest[1]-.02,.17]; backHand=[.44+phase*.28,local.chest[1]-.18,-.17]; }
  else if(f.attackType==="special"||f.attackType==="super"||f.attackType==="exspecial"){ frontHand=[.43+phase*.22,local.chest[1]-.02,.15]; backHand=[.39+phase*.2,local.chest[1]-.14,-.15]; }
  else if(f.attackType==="uppercut")frontHand=[.32+upperExt*.18,1.55+upperExt,.18];
  else if(state==="intro"&&introT>82)frontHand=[.52,local.chest[1]+.03,.18];
  local.handBack=backHand; local.handFront=frontHand;
  const elbowFor=(sh,hand,side)=>{ const mid=mix3(sh,hand,.5),straight=clamp(phase,0,1); return [mid[0]-.045,mid[1]-.16*(1-straight*.55)-.025,mid[2]+side*.035]; };
  local.elbowBack=elbowFor(local.shoulderBack,backHand,-1); local.elbowFront=elbowFor(local.shoulderFront,frontHand,1);
  if(f.dead||f.downT>0){
    local.pelvis=[.02,.27,0]; local.chest=[-.43,.3,0]; local.head=[-.74,.31,0]; local.neck=mix3(local.chest,local.head,.55);
    local.shoulderBack=[-.43,.34,-shoulderHalf]; local.shoulderFront=[-.43,.34,shoulderHalf]; local.hipBack=[.02,.28,-hipHalf]; local.hipFront=[.02,.28,hipHalf];
    local.footBack=[.62,.07,-.13]; local.footFront=[.84,.07,.13]; local.kneeBack=[.34,.16,-.12]; local.kneeFront=[.44,.15,.12];
    local.handBack=[-.58,.12,-.28]; local.handFront=[-.18,.1,.3]; local.elbowBack=[-.55,.18,-.22]; local.elbowFront=[-.34,.16,.24];
  }
  const root=[((f.rx==null?f.x:f.rx)-640)*R3D_WORLD,(GROUND-(f.ry==null?f.y:f.ry))*R3D_WORLD,0];
  const visualFace=clamp(Math.abs(motion.face)<.22?(motion.face<0?-.22:.22):motion.face,-1,1),yaw=(1-visualFace)*Math.PI/2-visualFace*.2;
  const roll=(f.dead||f.downT>0)?0:clamp(-(motion.lean+motion.air*clamp((f.vy||0)*.0016,-.025,.035)-motion.hurt*.055+motion.dash*.09),-.2,.24);
  const toWorld=p=>{
    const sx=p[0]*S,sy=p[1]*S,sz=p[2]*S,cr=Math.cos(roll),sr=Math.sin(roll);
    const rx=sx*cr-sy*sr,ry=sx*sr+sy*cr,cy=Math.cos(yaw),syaw=Math.sin(yaw);
    return [root[0]+rx*cy+sz*syaw,root[1]+ry,root[2]-rx*syaw+sz*cy];
  };
  const world={}; Object.keys(local).forEach(k=>world[k]=toWorld(local[k]));
  return {motion,human,cb,phase,yaw,roll,root,visualFace,local,world,toWorld,punchExt,kickExt,upperExt};
}
function strideSign3(f){ return Math.sign(((f.vx||0)+(f.kvx||0))*(f.facing||1))||1; }
function addFighter3D(opaque,trans,f){
  const pose=buildFighterPose3D(f),ch=f.char,sk=f.skin,human=pose.human,W3=pose.world,S=ch.scale||1;
  const mat=(hex,alpha,emi)=>parseColor3(f.hitFlash>0&&typeof shade==="function"?shade(hex,42):hex,alpha==null?1:alpha,(emi||0)+(f.hitFlash>0?.22:0));
  const limb=human.limb||1,air=Math.max(0,pose.root[1]),heightFactor=clamp(1-air/2.6,.25,1),vec=typeof arenaShadowVector==="function"?arenaShadowVector():{x:-.4,len:1};
  addSphere3D(trans,[pose.root[0]+vec.x*(.22+air*.18),.022,.02],[.58*vec.len*(.55+heightFactor*.45)*S,.025,.34*S],[0,vec.x*.08,0],parseColor3("#000000",.34*heightFactor,0));
  if(f.grounded)[W3.footBack,W3.footFront].forEach(ft=>addSphere3D(trans,[ft[0],.018,ft[2]],[.17*S,.018,.09*S],[0,pose.yaw,0],parseColor3("#000000",.3,0)));
  if((ch.style==="nova"||ch.style==="prime"||ch.style==="guerrier"||ch.style==="magicienne")&&!f.dead){
    const wave=Math.sin(renderTicker*.08+(f.anim||0)*.05)*.05-pose.motion.dash*.08;
    const capeTopA=pose.toWorld([pose.local.chest[0]-.12,pose.local.chest[1]+.04,-.17]),capeTopB=pose.toWorld([pose.local.chest[0]-.12,pose.local.chest[1]+.04,.17]);
    const capeMidA=pose.toWorld([pose.local.pelvis[0]-.23+wave*.5,.58,-.2]),capeMidB=pose.toWorld([pose.local.pelvis[0]-.23+wave*.5,.58,.2]);
    const capeBotA=pose.toWorld([pose.local.pelvis[0]-.34+wave,.14,-.18]),capeBotB=pose.toWorld([pose.local.pelvis[0]-.34+wave,.14,.18]);
    quad3(opaque,capeTopA,capeTopB,capeMidB,capeMidA,mat(sk.dark)); quad3(opaque,capeMidA,capeMidB,capeBotB,capeBotA,mat(shade(sk.dark,-14)));
  }
  const legR=.094*limb*S,armR=.076*limb*S;
  addCapsule3D(opaque,W3.hipBack,W3.kneeBack,legR*1.05,legR*.88,mat(shade(sk.pants,-18))); addCapsule3D(opaque,W3.kneeBack,W3.footBack,legR*.82,legR*.62,mat(shade(sk.pants,-18)));
  addCapsule3D(opaque,W3.hipFront,W3.kneeFront,legR*1.08,legR*.9,mat(sk.pants)); addCapsule3D(opaque,W3.kneeFront,W3.footFront,legR*.84,legR*.64,mat(sk.pants)); addSphere3D(opaque,W3.kneeBack,legR*1.02,[0,pose.yaw,0],mat(shade(sk.pants,-34))); addSphere3D(opaque,W3.kneeFront,legR*1.04,[0,pose.yaw,0],mat(shade(sk.pants,-24)));
  [pose.local.footBack,pose.local.footFront].forEach(localFoot=>{ const shoe=pose.toWorld([localFoot[0]+.075,Math.max(.045,localFoot[1]+.038),localFoot[2]]); addBox3D(opaque,shoe,[.3*S,.082*S,.108*S],[0,pose.yaw,pose.roll],mat(sk.accent)); addBox3D(opaque,[shoe[0],shoe[1]-.034*S,shoe[2]],[.32*S,.026*S,.113*S],[0,pose.yaw,pose.roll],mat("#151923")); });
  addCapsule3D(opaque,W3.shoulderBack,W3.elbowBack,armR*1.05,armR*.9,mat(sk.dark)); addCapsule3D(opaque,W3.elbowBack,W3.handBack,armR*.84,armR*.7,mat(shade(sk.skin,-18))); addCylinder3D(opaque,mix3(W3.elbowBack,W3.handBack,.76),mix3(W3.elbowBack,W3.handBack,.94),armR*.86,armR*.82,mat(sk.dark)); addSphere3D(opaque,W3.handBack,.082*limb*S,[0,pose.yaw,0],mat(sk.glove));
  addBox3D(opaque,mix3(W3.hipBack,W3.hipFront,.5),[.27*S,.21*S,.4*S],[0,pose.yaw,pose.roll],mat(sk.pants));
  addCapsule3D(opaque,W3.pelvis,W3.chest,.178*S,.198*S,mat(sk.primary));
  addSphere3D(opaque,W3.chest,[.235*S,.275*S,.305*S],[0,pose.yaw,pose.roll],mat(sk.primary));
  addBox3D(opaque,pose.toWorld([pose.local.pelvis[0],pose.local.pelvis[1]+.1,0]),[.28*S,.075*S,.42*S],[0,pose.yaw,pose.roll],mat("#111827"));
  addBox3D(opaque,pose.toWorld([pose.local.pelvis[0]+.15,pose.local.pelvis[1]+.1,0]),[.07*S,.09*S,.16*S],[0,pose.yaw,pose.roll],mat(sk.accent,1,.12));
  addSphere3D(opaque,W3.shoulderBack,.105*limb*S,[0,pose.yaw,0],mat(sk.dark)); addSphere3D(opaque,W3.shoulderFront,.11*limb*S,[0,pose.yaw,0],mat(sk.primary));
  if(ch.style==="titan"||ch.style==="prime"||ch.style==="guerrier"||ch.style==="synthetique"){ const armor=ch.style==="prime"?"#ffc400":ch.style==="synthetique"?sk.primary:ch.style==="guerrier"?"#90a4ae":"#37474f"; addSphere3D(opaque,[W3.shoulderFront[0],W3.shoulderFront[1]+.035*S,W3.shoulderFront[2]],[.088*limb*S,.068*limb*S,.118*limb*S],[0,pose.yaw,0],mat(armor,1,.08)); addSphere3D(opaque,[W3.shoulderBack[0],W3.shoulderBack[1]+.032*S,W3.shoulderBack[2]],[.084*limb*S,.064*limb*S,.112*limb*S],[0,pose.yaw,0],mat(armor,1,.05)); }
  addCapsule3D(opaque,W3.shoulderFront,W3.elbowFront,armR*1.08,armR*.92,mat(sk.primary)); addCapsule3D(opaque,W3.elbowFront,W3.handFront,armR*.86,armR*.72,mat(sk.skin)); addCylinder3D(opaque,mix3(W3.elbowFront,W3.handFront,.76),mix3(W3.elbowFront,W3.handFront,.94),armR*.9,armR*.85,mat(sk.accent)); addSphere3D(opaque,W3.handFront,.086*limb*S,[0,pose.yaw,0],mat(sk.glove));
  addCapsule3D(opaque,W3.neck,W3.head,.058*S,.064*S,mat(shade(sk.skin,-12)));
  const headR=(human.headR||15)/95*S;
  addSphere3D(opaque,W3.head,[headR,headR*1.12,headR*.98],[0,pose.yaw,pose.roll],mat(sk.skin));
  addSphere3D(opaque,pose.toWorld([pose.local.head[0]-.035,pose.local.head[1]+.062,0]),[headR*1.03,headR*.74,headR*1.03],[0,pose.yaw,pose.roll],mat(sk.hair));
  addSphere3D(opaque,pose.toWorld([pose.local.head[0]-.105,pose.local.head[1]+.005,0]),[headR*.48,headR*.72,headR*.88],[0,pose.yaw,pose.roll],mat(sk.hair));
  [-1,1].forEach(side=>{
    addSphere3D(opaque,pose.toWorld([pose.local.head[0]+.147,pose.local.head[1]+.014,side*.058]),.016*S,[0,0,0],mat("#101018"));
    addBox3D(opaque,pose.toWorld([pose.local.head[0]+.139,pose.local.head[1]+.058,side*.058]),[.018*S,.011*S,.052*S],[0,pose.yaw,pose.roll],mat(sk.hair));
    addSphere3D(opaque,pose.toWorld([pose.local.head[0]-.012,pose.local.head[1],side*.142]),[.018*S,.03*S,.018*S],[0,pose.yaw,pose.roll],mat(shade(sk.skin,-10)));
  });
  addBox3D(opaque,pose.toWorld([pose.local.head[0]+.148,pose.local.head[1]-.058,0]),[.016*S,.009*S,.055*S],[0,pose.yaw,pose.roll],mat(shade(sk.skin,-48)));
  addCylinder3D(opaque,pose.toWorld([pose.local.head[0]+.14,pose.local.head[1]-.018,0]),pose.toWorld([pose.local.head[0]+.184,pose.local.head[1]-.027,0]),.014*S,.008*S,mat(shade(sk.skin,-8)),6);
  const hairText=String(human.hair||"");
  if(/long|queue|tresses|chignon/.test(hairText))addCapsule3D(opaque,pose.toWorld([pose.local.head[0]-.12,pose.local.head[1]+.02,-.035]),pose.toWorld([pose.local.pelvis[0]-.17,pose.local.pelvis[1]+.17,-.04]),.045*S,.028*S,mat(sk.hair));
  if(ch.style==="synthetique")addBox3D(opaque,pose.toWorld([pose.local.head[0]+.125,pose.local.head[1]+.015,0]),[.045*S,.055*S,.17*S],[0,pose.yaw,pose.roll],mat(sk.accent,1,.65));
  const motif=typeof boardOutfitMotif==="function"?boardOutfitMotif(f):"eclair";
  if(motif==="couronne"){ addCylinder3D(opaque,pose.toWorld([pose.local.head[0],pose.local.head[1]+.105,0]),pose.toWorld([pose.local.head[0],pose.local.head[1]+.148,0]),.088*S,.088*S,mat("#ffc400",1,.3),10); [-.055,0,.055].forEach(z=>addCylinder3D(opaque,pose.toWorld([pose.local.head[0],pose.local.head[1]+.142,z]),pose.toWorld([pose.local.head[0],pose.local.head[1]+.225,z]),.019*S,.003*S,mat("#ffc400",1,.3),6)); }
  addCylinder3D(opaque,[W3.chest[0],W3.chest[1]+.045*S,W3.chest[2]+.235*S],[W3.chest[0],W3.chest[1]+.045*S,W3.chest[2]+.29*S],.06*S,.06*S,mat(sk.dark,1,.08),12); addCylinder3D(opaque,[W3.chest[0],W3.chest[1]+.045*S,W3.chest[2]+.29*S],[W3.chest[0],W3.chest[1]+.045*S,W3.chest[2]+.312*S],.05*S,.05*S,mat(sk.accent,1,.34),12);
  if(f.energy>=50&&!f.dead&&f.downT<=0){
    const pulse=1+Math.sin(renderTicker*.12+(f.id||0))*.05;
    addSphere3D(trans,mix3(W3.pelvis,W3.chest,.55),[.39*S*pulse,.63*S*pulse,.39*S*pulse],[0,pose.yaw,0],mat(sk.trail,f.energy>=100?.05:.028,.38));
    addSphere3D(trans,[pose.root[0],.025,pose.root[2]],[.46*S*pulse,.018,.3*S*pulse],[0,pose.yaw,0],mat(sk.trail,f.energy>=100?.16:.1,.45));
    addSphere3D(trans,[pose.root[0],.018,pose.root[2]],[.62*S*pulse,.014,.4*S*pulse],[0,pose.yaw,0],mat(sk.trail,f.energy>=100?.07:.04,.35));
  }
  if(f.blocking||f.parryFlashT>0){ const parry=f.parryT>0||f.parryFlashT>0; addSphere3D(trans,pose.toWorld([.5,1.22,0]),[.13*S,.5*S,.4*S],[0,pose.yaw,0],parseColor3(parry?"#ffc400":"#4fc3f7",.17,.55)); }
  if(f.attack&&pose.phase>.08&&!["special","super","exspecial"].includes(f.attackType)){
    const isKick=f.attackType.includes("kick")||f.attackType==="sweep",end=isKick?W3.footFront:W3.handFront,localEnd=isKick?pose.local.footFront:pose.local.handFront;
    const trailStart=pose.toWorld([localEnd[0]-.3,localEnd[1]+(f.attackType==="uppercut"?-.3:isKick?-.1:-.015),localEnd[2]]);
    addCapsule3D(trans,trailStart,end,.024*S,.012*S,mat(sk.trail,.24,.55));
  }
  renderStats.fighterPose3d=ch.id+":"+(f.attackType||"idle")+":"+pose.phase.toFixed(2);
  return pose;
}
function addProjectilesAndEffects3D(trans){
  if(typeof projectiles!=="undefined")for(const pr of projectiles){
    const center=worldFromGame3D(pr.rx,pr.ry,0),r=Math.max(.09,(pr.r||16)/95),col=parseColor3(pr.owner&&pr.owner.skin?pr.owner.skin.trail:"#fff",.92,.9);
    if(pr.kind==="wave"||pr.kind==="ground")center[1]=.18;
    if(pr.kind==="blade")addBox3D(trans,center,[r*2.3,r*.55,r*.55],[0,0,-Math.atan2(pr.vy||0,pr.vx||1)],col);
    else addSphere3D(trans,center,pr.kind==="wave"||pr.kind==="ground"?[r*1.35,r*.65,r*1.05]:r,[0,0,0],col);
    addSphere3D(trans,center,r*1.45,[0,0,0],parseColor3(pr.owner&&pr.owner.skin?pr.owner.skin.trail:"#fff",.08,.65));
  }
  if(typeof rings!=="undefined")for(const r of rings){
    const center=worldFromGame3D(r.x,r.y,.03),radius=Math.max(.07,r.r/95),alpha=clamp(r.life/15,0,1)*.62;
    for(let i=0;i<18;i++){ if(i%5===4)continue; const a=i/18*Math.PI*2; addBox3D(trans,[center[0]+Math.cos(a)*radius,center[1]+Math.sin(a)*radius,center[2]],[radius*.32,.016,.016],[0,0,a+Math.PI/2],parseColor3(r.c,alpha,.55)); }
  }
  if(typeof impactBursts!=="undefined")for(const b of impactBursts){
    const age=clamp(1-b.life/Math.max(1,b.max||b.life||1),0,1),pop=easeOutCubic(age),center=worldFromGame3D(b.x,b.y,.08),ground=b.kind==="ground",size=(ground?.55:.42)*(b.power||1)*(.62+pop*.52),alpha=clamp(1.08-age*1.12,0,1);
    addSphere3D(trans,center,[size*.3,size*(ground?.14:.24),size*.08],[0,0,0],parseColor3(b.color,alpha*.13,.65));
    addSphere3D(trans,center,[size*.15,size*(ground?.07:.12),size*.05],[0,0,0],parseColor3("#ffffff",alpha*.5,.75));
    const arcCount=b.kind==="block"||b.kind==="parry"?6:5,base=(b.seed||0)*6.283+age*.45*(b.dir||1),seedBase=Math.round((b.seed||0)*997);
    for(let i=0;i<arcCount;i++){
      const rnd=rand3(seedBase+i*19); if(rnd<.16)continue;
      const a=base+i*(Math.PI*2/arcCount)+(rand3(seedBase+i*23)-.5)*.22,rr=size*(.34+rand3(seedBase+i*29)*.16);
      addBox3D(trans,[center[0]+Math.cos(a)*rr,center[1]+Math.sin(a)*rr*(ground?.32:1),center[2]+i*.002],[size*(.18+rand3(seedBase+i*31)*.13),.017,.017],[0,0,a+Math.PI/2],parseColor3(i%3===0?"#ffffff":b.color,alpha*.78,.7));
    }
    const shardCount=qualityLevel===0?3:4;
    for(let i=0;i<shardCount;i++){
      const spread=(shardCount===1?0:i/(shardCount-1)-.5),a=ground?Math.PI/2+spread*.95:((b.dir||1)<0?Math.PI:0)+spread*1.15+(rand3(seedBase+i*37)-.5)*.12,dist=size*.18;
      addBox3D(trans,[center[0]+Math.cos(a)*dist,center[1]+Math.sin(a)*dist*(ground?.55:1),center[2]+.004],[size*(.2+rand3(seedBase+i*41)*.08),.014,.014],[0,0,a],parseColor3(i%2?"#ffffff":b.color,alpha*.72,.72));
    }
    renderStats.impactBurstsDrawn=(renderStats.impactBurstsDrawn||0)+1; renderStats.lastImpactFx=b.kind+":"+(b.color||"");
  }
}
function buildParticles3D(){
  const pos=[],col=[],sizes=[];
  if(typeof particles==="undefined")return {pos,col,sizes,count:0};
  particles.forEach((p,i)=>{
    const wp=worldFromGame3D(p.x,p.y,(rand3(i*31+p.life)-.5)*.35),c=parseColor3(p.c,clamp(p.life/(p.max||30),0,1),0);
    pos.push(wp[0],wp[1],wp[2]); col.push(c[0],c[1],c[2],c[3]); sizes.push(Math.max(.025,(p.r||3)*2/95));
  });
  return {pos,col,sizes,count:particles.length};
}
function computeCamera3D(){
  const midGame=(p1.rx+p2.rx)/2,mid=(midGame-640)*R3D_WORLD,avgAir=((GROUND-p1.ry)+(GROUND-p2.ry))/2*R3D_WORLD;
  const shakeAmt=(typeof shake!=="undefined"?shake:0)*(SETTINGS.shake/100);
  const eye=[mid*.88+(Math.random()-.5)*shakeAmt*.012,2.05+clamp(avgAir,.0,1.4)*.16+(Math.random()-.5)*shakeAmt*.008,clamp(8.75/Math.max(.75,cam.zoom||1),6.1,10.6)];
  const target=[mid,1.12+clamp(avgAir,0,1.4)*.28,0];
  R3D.camPos=eye; renderer3DState.camera={x:eye[0],y:eye[1],z:eye[2]};
  const proj=mat4Perspective3(42*Math.PI/180,W/H,.1,70); R3D.view=mat4LookAt3(eye,target,[0,1,0]); R3D.vp=mat4Multiply3(proj,R3D.view);
  const mood=arenaMoodTheme();
  R3D.fogColor=parseColor3(mood.sky[mood.sky.length-1][1]).slice(0,3);
  if(currentArenaMood==="jour"){ R3D.lightDir=[-.38,.9,.34]; R3D.lightColor=[1,.94,.78]; }
  else if(currentArenaMood==="nuit"){ R3D.lightDir=[.32,.72,.45]; R3D.lightColor=[.62,.74,1]; }
  else { R3D.lightDir=[-.72,.38,.3]; R3D.lightColor=[1,.68,.42]; }
}
function drawPoints3D(points){
  if(!points.count)return;
  const gl=R3D.gl,prog=R3D.pointProgram; gl.useProgram(prog.prog);
  gl.uniformMatrix4fv(prog.uniforms.uVP,false,R3D.vp); gl.uniform1f(prog.uniforms.uScale,(R3D.canvas.height||720)*1.0);
  gl.bindBuffer(gl.ARRAY_BUFFER,R3D.points.pos); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(points.pos),gl.DYNAMIC_DRAW); gl.enableVertexAttribArray(prog.attribs.aPos); gl.vertexAttribPointer(prog.attribs.aPos,3,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,R3D.points.col); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(points.col),gl.DYNAMIC_DRAW); gl.enableVertexAttribArray(prog.attribs.aColor); gl.vertexAttribPointer(prog.attribs.aColor,4,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,R3D.points.size); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(points.sizes),gl.DYNAMIC_DRAW); gl.enableVertexAttribArray(prog.attribs.aSize); gl.vertexAttribPointer(prog.attribs.aSize,1,gl.FLOAT,false,0,0);
  gl.drawArrays(gl.POINTS,0,points.count); renderer3DState.drawCalls++; renderer3DState.vertices+=points.count;
}
function draw3DScene(){
  syncRenderer3DStats();
  if(!renderer3DState.requested||renderer3DState.autoDisabled||!renderer3DCombatState()){
    renderer3DState.active=false; if(document.body)document.body.classList.remove("render3d-on"); syncRenderer3DStats(); return false;
  }
  if(!initRenderer3D())return false;
  const gl=R3D.gl;
  try{
    resizeRenderer3D(); computeCamera3D(); ensureArena3D();
    renderer3DState.vertices=0; renderer3DState.drawCalls=0; renderStats.impactBurstsDrawn=0;
    const opaque=newBatch3D(),trans=newBatch3D();
    const first=p1.ry>=p2.ry?p1:p2,second=first===p1?p2:p1;
    addFighter3D(opaque,trans,first); addFighter3D(opaque,trans,second); addProjectilesAndEffects3D(trans);
    uploadBatch3D(gl,R3D.dyn,opaque,gl.DYNAMIC_DRAW); uploadBatch3D(gl,R3D.dynTrans,trans,gl.DYNAMIC_DRAW);
    const mood=arenaMoodTheme(),sky=parseColor3(mood.sky[mood.sky.length-1][1]);
    gl.clearColor(sky[0],sky[1],sky[2],1); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.disable(gl.CULL_FACE); gl.disable(gl.BLEND);
    gl.useProgram(R3D.program.prog);
    gl.uniformMatrix4fv(R3D.program.uniforms.uVP,false,R3D.vp); gl.uniform3fv(R3D.program.uniforms.uCamPos,R3D.camPos);
    gl.uniform3fv(R3D.program.uniforms.uLightDir,R3D.lightDir); gl.uniform3fv(R3D.program.uniforms.uLightColor,R3D.lightColor); gl.uniform3fv(R3D.program.uniforms.uFogColor,R3D.fogColor);
    drawBatch3D(gl,R3D.arena); drawBatch3D(gl,R3D.dyn);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
    drawBatch3D(gl,R3D.arenaTrans); drawBatch3D(gl,R3D.dynTrans);
    drawPoints3D(buildParticles3D());
    gl.depthMask(true); gl.disable(gl.BLEND);
    renderer3DState.active=true; renderer3DState.frames++; document.body.classList.add("render3d-on");
    if(renderer3DState.mode==="auto"&&qualityLevel===0&&renderer3DState.frames>240&&renderStats.fpsEstimate>0&&renderStats.fpsEstimate<34){ renderer3DState.autoDisabled=true; renderer3DState.fallback="3D auto désactivée pour protéger les FPS"; }
    syncRenderer3DStats(); return true;
  }catch(e){
    renderer3DState.active=false; renderer3DState.fallback=String(e&&e.message||e||"Erreur WebGL"); document.body.classList.remove("render3d-on"); syncRenderer3DStats(); return false;
  }
}
function draw3DOverlay(){
  if(!renderer3DState.active||!R3D.vp||typeof floaters==="undefined")return;
  ctx.save(); ctx.textAlign="center";
  const placed=[]; let spreadMax=0;
  for(const fl of floaters){
    const pr=project3DPoint(worldFromGame3D(fl.x,fl.y,.18)); if(!pr)continue;
    let dy=0; for(const pl of placed){ if(Math.abs(pl.x-pr.x)<170&&Math.abs(pl.y-(pr.y-dy))<30)dy+=27; }
    placed.push({x:pr.x,y:pr.y-dy}); if(dy>spreadMax)spreadMax=dy;
    ctx.save(); ctx.globalAlpha=Math.min(1,fl.life/28); ctx.font="1000 "+(fl.big?27:18)+"px 'Segoe UI',Arial"; ctx.lineWidth=5; ctx.strokeStyle="rgba(0,0,0,.68)"; ctx.strokeText(fl.text,pr.x,pr.y-dy); ctx.fillStyle=fl.c; ctx.fillText(fl.text,pr.x,pr.y-dy); ctx.restore();
  }
  renderStats.floaterSpread=spreadMax;
  [p1,p2].forEach(f=>{
    if(!f)return;
    if(f.downT>0||f.dead){ const pr=project3DPoint(worldFromGame3D(f.rx,f.ry-50,.2)); if(pr){ ctx.fillStyle="#ffd54f"; ctx.font="15px Arial"; for(let i=0;i<3;i++){ const a=renderTicker*.09+i*2.1; ctx.fillText("★",pr.x+Math.cos(a)*24,pr.y+Math.sin(a)*7); } } }
    if(f.counterWindowT>0&&isCombat()){ const pr=project3DPoint(worldFromGame3D(f.rx,f.ry-236*f.char.scale,.2)); if(pr){ ctx.font="1000 12px 'Segoe UI',Arial"; ctx.fillStyle="rgba(90,50,0,.82)"; if(typeof rr==="function")rr(pr.x-43,pr.y-10,86,20,10); ctx.fill(); ctx.fillStyle="#ffc400"; ctx.fillText("⚡ RIPOSTE !",pr.x,pr.y+4); } }
  });
  ctx.restore();
}
syncRenderer3DStats();
