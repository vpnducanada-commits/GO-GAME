"use strict";
/* =====================================================================
   Godson FURY ARENA V7.0 — ANATOMIE AAA & RÉALITÉ 3D (WebGL maison, zéro dépendance)
   Personnages humanoïdes articulés, arènes en profondeur, caméra combat.
   La simulation reste celle du moteur déterministe : ce module ne fait
   que dessiner. Repli automatique vers le rendu 2D AAA II si besoin.
   Signé : Gédéon - Godson
   ===================================================================== */
const renderer3DState={requested:true,mode:"auto",active:false,available:false,initialized:false,initFailed:false,fallback:"",frames:0,vertices:0,drawCalls:0,arenaKey:"",autoDisabled:false,camera:{x:0,y:2.05,z:8.6}};
const R3D={canvas:null,gl:null,program:null,pointProgram:null,depthProgram:null,attribs:{},uniforms:{},pointAttribs:{},pointUniforms:{},dyn:null,dynTrans:null,points:null,arena:null,arenaTrans:null,vp:null,view:null,lightVP:null,camPos:[0,2.05,8.6],lightDir:[-.45,.82,.35],lightColor:[1,.86,.68],fillColor:[.32,.48,.78],fogColor:[.04,.05,.12],materialTexture:null,indexUint:false,renderScale:1,shadow:null,shadowEnabled:false,shadowFailed:false};
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
  renderStats.renderer3dScale=R3D.renderScale; renderStats.materialAtlas3d=!!R3D.materialTexture; renderStats.bumpMap3d=!!R3D.bumpEnabled; renderStats.shadowMap3d=!!R3D.shadowEnabled; renderStats.anatomie3d="Anatomie AAA V7";
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
const _color3Cache=new Map();
function parseColor3(input,alpha,emissive){
  const cacheKey=(typeof input==="string"?input:Array.isArray(input)?input.join(","):"")+":"+(alpha==null?"":alpha)+":"+(emissive||0);
  const cached=_color3Cache.get(cacheKey); if(cached)return cached;
  let r=1,g=1,b=1,a=alpha==null?1:alpha;
  if(Array.isArray(input)){ r=input[0]||0; g=input[1]||0; b=input[2]||0; if(input.length>3&&alpha==null)a=input[3]; }
  else if(typeof input==="string"&&input.charAt(0)==="#"){
    let h=input.slice(1); if(h.length===3)h=h.split("").map(c=>c+c).join("");
    const n=parseInt(h,16); r=((n>>16)&255)/255; g=((n>>8)&255)/255; b=(n&255)/255;
  }else if(typeof input==="string"){
    const mm=input.match(/rgba?\(([^)]+)\)/i);
    if(mm){ const p=mm[1].split(",").map(v=>parseFloat(v)); r=(p[0]||0)/255; g=(p[1]||0)/255; b=(p[2]||0)/255; if(p.length>3&&alpha==null)a=p[3]; }
  }
  const out=[clamp(r,0,1),clamp(g,0,1),clamp(b,0,1),clamp(a,0,1),emissive||0];
  if(_color3Cache.size>768)_color3Cache.clear();
  _color3Cache.set(cacheKey,out); return out;
}
const MATERIAL3D={
  plain:[0,.8,0,0],skin:[1,.57,0,1],fabric:[2,.9,0,0],leather:[3,.74,.02,0],
  metal:[4,.32,.86,0],hair:[5,.46,.05,0],tech:[6,.38,.58,0],energy:[7,.2,.12,0],fur:[5,.96,0,0],rubber:[3,.92,0,0]
};
const _materialColorCache=new Map();
function withMaterial3(color,kind){
  const spec=MATERIAL3D[kind||"plain"]||MATERIAL3D.plain;
  const key=(color?color.join(","):"")+":"+(kind||"plain"),cached=_materialColorCache.get(key); if(cached)return cached;
  const out=(color||[1,1,1,1,0]).slice(); out[5]=spec[0]; out[6]=spec[1]; out[7]=spec[2]; out[8]=spec[3];
  if(_materialColorCache.size>1024)_materialColorCache.clear();
  _materialColorCache.set(key,out); return out;
}
function materialColor3(input,kind,alpha,emissive){ return withMaterial3(parseColor3(input,alpha,emissive),kind); }
function atlasUV3(uv,tile){
  const u=uv&&uv.length?uv[0]:0,v=uv&&uv.length>1?uv[1]:0;
  const col=((tile|0)%4+4)%4,row=clamp(Math.floor((tile|0)/4),0,1);
  return [(col+(u-Math.floor(u)))/4,(row+(v-Math.floor(v)))/2];
}
function createMaterialAtlas3D(gl){
  try{
    if(typeof document==="undefined"||!document.createElement)return null;
    const c=document.createElement("canvas"); c.width=1024; c.height=512;
    const g=c.getContext&&c.getContext("2d"); if(!g||typeof g.fillRect!=="function")return null;
    const tile=(index,draw)=>{
      const x=(index%4)*256,y=Math.floor(index/4)*256;
      g.save(); g.translate(x,y); g.fillStyle="#e8e8e8"; g.fillRect(0,0,256,256); draw(x,y); g.restore();
    };
    const speckle=(base,n,alpha,size)=>{
      for(let i=0;i<n;i++){ const v=205+Math.round(rand3(base+i*7)*48); g.fillStyle="rgba("+v+","+v+","+v+","+alpha+")"; g.fillRect(rand3(base+i*11)*256,rand3(base+i*13)*256,size,size); }
    };
    tile(0,()=>speckle(10,900,.16,2));
    tile(1,()=>{ speckle(100,1500,.12,1); for(let i=0;i<42;i++){ const x=rand3(200+i)*256,y=rand3(300+i)*256,r=10+rand3(400+i)*28; const gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,"rgba(255,214,190,.13)"); gr.addColorStop(1,"rgba(120,70,50,0)"); g.fillStyle=gr; g.beginPath(); g.arc(x,y,r,0,7); g.fill(); } });
    tile(2,()=>{ for(let y=0;y<256;y+=4){ g.fillStyle=y%8?"rgba(65,65,65,.3)":"rgba(255,255,255,.3)"; g.fillRect(0,y,256,1); } for(let x=0;x<256;x+=4){ g.fillStyle=x%8?"rgba(50,50,50,.24)":"rgba(255,255,255,.22)"; g.fillRect(x,0,1,256); } speckle(500,500,.16,1); });
    tile(3,()=>{ speckle(700,1100,.16,2); g.strokeStyle="rgba(55,35,20,.38)"; for(let i=0;i<34;i++){ g.beginPath(); let x=rand3(800+i)*256,y=rand3(900+i)*256; g.moveTo(x,y); for(let j=0;j<4;j++){ x+=(rand3(1000+i*5+j)-.5)*54; y+=(rand3(1100+i*5+j)-.5)*54; g.lineTo(x,y); } g.stroke(); } });
    tile(4,()=>{ for(let i=0;i<260;i++){ const y=rand3(1300+i)*256,v=165+Math.round(rand3(1400+i)*80); g.fillStyle="rgba("+v+","+v+","+v+",.5)"; g.fillRect(0,y,256,1); } for(let i=0;i<28;i++){ g.strokeStyle="rgba(255,255,255,.25)"; g.beginPath(); const y=rand3(1500+i)*256; g.moveTo(rand3(1600+i)*80,y); g.lineTo(150+rand3(1700+i)*100,y+(rand3(1800+i)-.5)*8); g.stroke(); } });
    tile(5,()=>{ for(let i=0;i<190;i++){ const x=rand3(2000+i)*256,v=120+Math.round(rand3(2100+i)*110); g.strokeStyle="rgba("+v+","+v+","+v+",.58)"; g.beginPath(); g.moveTo(x,-8); g.bezierCurveTo(x+(rand3(2200+i)-.5)*18,70,x+(rand3(2300+i)-.5)*18,170,x+(rand3(2400+i)-.5)*26,264); g.stroke(); } });
    tile(6,()=>{ g.fillStyle="#d4dde8"; g.fillRect(0,0,256,256); g.strokeStyle="rgba(35,120,160,.5)"; g.lineWidth=2; for(let i=0;i<32;i++){ let x=Math.round(rand3(2600+i)*8)*32,y=Math.round(rand3(2700+i)*8)*32; g.beginPath(); g.moveTo(x,y); for(let j=0;j<3;j++){ if(rand3(2800+i*3+j)>.5)x+= (rand3(2900+i*3+j)>.5?32:-32); else y+=(rand3(3000+i*3+j)>.5?32:-32); g.lineTo(clamp(x,0,256),clamp(y,0,256)); } g.stroke(); g.fillStyle="rgba(255,255,255,.75)"; g.beginPath(); g.arc(clamp(x,0,256),clamp(y,0,256),3,0,7); g.fill(); } });
    tile(7,()=>{ for(let i=-8;i<16;i++){ g.fillStyle=i%2?"rgba(255,255,255,.23)":"rgba(90,160,255,.15)"; g.save(); g.translate(i*24,0); g.rotate(.55); g.fillRect(0,-80,10,420); g.restore(); } speckle(3200,700,.2,2); });
    const tex=gl.createTexture(); if(!tex)return null;
    gl.bindTexture(gl.TEXTURE_2D,tex); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
    if(typeof gl.generateMipmap==="function")gl.generateMipmap(gl.TEXTURE_2D);
    return tex;
  }catch(e){ return null; }
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
function mat4Ortho3(l,r,b,t,n,f){
  return [2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1];
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
function newBatch3D(){ return {pos:[],norm:[],col:[],emi:[],uv:[],mat:[],idx:[],count:0}; }
function resetBatch3D(b){ b.pos.length=0; b.norm.length=0; b.col.length=0; b.emi.length=0; b.uv.length=0; b.mat.length=0; b.idx.length=0; b.count=0; return b; }
const R3D_DYN_OPAQUE=newBatch3D(),R3D_DYN_TRANS=newBatch3D();
function vertRaw3(b,x,y,z,nx,ny,nz,c,u,v){
  b.pos.push(x,y,z); b.norm.push(nx,ny,nz); b.col.push(c[0],c[1],c[2],c[3]); b.emi.push(c[4]||0);
  const tile=c[5]||0,col=(((tile|0)%4)+4)%4,row=clamp(Math.floor((tile|0)/4),0,1);
  b.uv.push((col+((u||0)-Math.floor(u||0)))/4,(row+((v||0)-Math.floor(v||0)))/2); b.mat.push(c[6]==null?.8:c[6],c[7]||0,c[8]||0);
  return b.count++;
}
function vert3(b,p,n,c,uv){
  b.pos.push(p[0],p[1],p[2]); b.norm.push(n[0],n[1],n[2]); b.col.push(c[0],c[1],c[2],c[3]); b.emi.push(c[4]||0);
  const tile=c[5]||0,col=(((tile|0)%4)+4)%4,row=clamp(Math.floor((tile|0)/4),0,1),u=uv&&uv.length?uv[0]:0,v=uv&&uv.length>1?uv[1]:0;
  b.uv.push((col+(u-Math.floor(u)))/4,(row+(v-Math.floor(v)))/2); b.mat.push(c[6]==null?.8:c[6],c[7]||0,c[8]||0);
  return b.count++;
}
function tri3(b,a,bp,c,color,normal){
  const e1=sub3(bp,a),e2=sub3(c,a),n=normal?norm3(normal):norm3(cross3(e1,e2));
  const cols=Array.isArray(color[0])?color:[color,color,color];
  const uvU=Math.max(.15,len3(e1)*.55),uvV=Math.max(.15,len3(e2)*.55);
  b.idx.push(vert3(b,a,n,cols[0],[0,0]),vert3(b,bp,n,cols[1],[uvU,0]),vert3(b,c,n,cols[2],[0,uvV]));
}
function quad3(b,a,bp,c,d,color){
  const e1=sub3(bp,a),e2=sub3(d,a),n=norm3(cross3(e1,e2));
  const cols=Array.isArray(color[0])?color:[color,color,color,color];
  const uvU=Math.max(.15,len3(e1)*.55),uvV=Math.max(.15,len3(e2)*.55);
  const i0=vert3(b,a,n,cols[0],[0,0]),i1=vert3(b,bp,n,cols[1],[uvU,0]),i2=vert3(b,c,n,cols[2],[uvU,uvV]),i3=vert3(b,d,n,cols[3],[0,uvV]);
  b.idx.push(i0,i1,i2,i0,i2,i3);
}
function addBox3D(b,center,size,rot,color){
  const cs=[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5],[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]].map(p=>xform3(p,center,rot||[0,0,0],size));
  quad3(b,cs[0],cs[1],cs[2],cs[3],color); quad3(b,cs[5],cs[4],cs[7],cs[6],color);
  quad3(b,cs[4],cs[0],cs[3],cs[7],color); quad3(b,cs[1],cs[5],cs[6],cs[2],color);
  quad3(b,cs[4],cs[5],cs[1],cs[0],color); quad3(b,cs[3],cs[2],cs[6],cs[7],color);
}
function detail3(){ return qualityLevel===0?{sector:10,rings:7,cyl:8}:qualityLevel===1?{sector:14,rings:9,cyl:10}:{sector:20,rings:14,cyl:16}; }
function bodyDetail3(){ return qualityLevel===0?{sector:10,rings:7,cyl:8}:qualityLevel===1?{sector:14,rings:9,cyl:10}:{sector:20,rings:13,cyl:14}; }
function headDetail3(){ return qualityLevel===0?{sector:12,rings:8,cyl:8}:qualityLevel===1?{sector:16,rings:10,cyl:10}:{sector:24,rings:16,cyl:14}; }
function addSphere3D(b,center,radius,rot,color,detail){
  const d=detail||detail3(),rad=Array.isArray(radius)?radius:[radius,radius,radius],r=rot||[0,0,0];
  const cosT=[],sinT=[]; for(let j=0;j<=d.sector;j++){ const th=j/d.sector*Math.PI*2; cosT.push(Math.cos(th)); sinT.push(Math.sin(th)); }
  const cx=Math.cos(r[0]||0),sx=Math.sin(r[0]||0),cy=Math.cos(r[1]||0),sy=Math.sin(r[1]||0),cz=Math.cos(r[2]||0),sz=Math.sin(r[2]||0);
  const invX=1/Math.max(.001,rad[0]),invY=1/Math.max(.001,rad[1]),invZ=1/Math.max(.001,rad[2]); let prev=null;
  for(let i=0;i<=d.rings;i++){
    const phi=-Math.PI/2+i/d.rings*Math.PI,cp=Math.cos(phi),sp=Math.sin(phi),row=[];
    for(let j=0;j<=d.sector;j++){
      const ux=cp*cosT[j],uy=sp,uz=cp*sinT[j]; let x=ux*rad[0],y=uy*rad[1],z=uz*rad[2],t;
      t=y*cx-z*sx; z=y*sx+z*cx; y=t; t=x*cy+z*sy; z=-x*sy+z*cy; x=t; t=x*cz-y*sz; y=x*sz+y*cz; x=t;
      let nx=ux*invX,ny=uy*invY,nz=uz*invZ; t=ny*cx-nz*sx; nz=ny*sx+nz*cx; ny=t; t=nx*cy+nz*sy; nz=-nx*sy+nz*cy; nx=t; t=nx*cz-ny*sz; ny=nx*sz+ny*cz; nx=t;
      const nl=Math.hypot(nx,ny,nz)||1;
      row.push(vertRaw3(b,center[0]+x,center[1]+y,center[2]+z,nx/nl,ny/nl,nz/nl,color,j/d.sector,i/d.rings));
    }
    if(prev)for(let j=0;j<d.sector;j++)b.idx.push(prev[j],row[j],row[j+1],prev[j],row[j+1],prev[j+1]);
    prev=row;
  }
}
function addCylinder3D(b,a,bp,r1,r2,color,segments){
  const seg=segments||detail3().cyl,axis=norm3(sub3(bp,a)),uvV=Math.max(.35,len3(sub3(bp,a))*1.6);
  const helper=Math.abs(dot3(axis,[0,1,0]))>.9?[1,0,0]:[0,1,0],u=norm3(cross3(axis,helper)),v=cross3(u,axis),ringA=[],ringB=[];
  for(let i=0;i<=seg;i++){
    const th=i/seg*Math.PI*2,ca=Math.cos(th),sa=Math.sin(th),dir=[u[0]*ca+v[0]*sa,u[1]*ca+v[1]*sa,u[2]*ca+v[2]*sa];
    ringA.push(vertRaw3(b,a[0]+dir[0]*r1,a[1]+dir[1]*r1,a[2]+dir[2]*r1,dir[0],dir[1],dir[2],color,i/seg,0));
    ringB.push(vertRaw3(b,bp[0]+dir[0]*r2,bp[1]+dir[1]*r2,bp[2]+dir[2]*r2,dir[0],dir[1],dir[2],color,i/seg,uvV));
  }
  for(let i=0;i<seg;i++)b.idx.push(ringA[i],ringB[i],ringB[i+1],ringA[i],ringB[i+1],ringA[i+1]);
  const ca=vert3(b,a,scale3(axis,-1),color,[.5,0]),cb=vert3(b,bp,axis,color,[.5,1]);
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
function convertShader3003D(src,isFragment){
  let out="#version 300 es\n"+src;
  if(isFragment)out=out.replace("precision mediump float;","precision mediump float;out vec4 fragColor3D;").replace(/\bvarying\b/g,"in").replace(/\btexture2D\b/g,"texture").replace(/\bgl_FragColor\b/g,"fragColor3D");
  else out=out.replace(/\battribute\b/g,"in").replace(/\bvarying\b/g,"out");
  return out;
}
function makeProgram3D(gl,vs,fs,attrs,uniforms){
  const prog=gl.createProgram();
  gl.attachShader(prog,compileShader3D(gl,gl.VERTEX_SHADER,vs)); gl.attachShader(prog,compileShader3D(gl,gl.FRAGMENT_SHADER,fs)); gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(prog)||"link");
  const out={prog,attribs:{},uniforms:{}};
  attrs.forEach(n=>out.attribs[n]=gl.getAttribLocation(prog,n)); uniforms.forEach(n=>out.uniforms[n]=gl.getUniformLocation(prog,n));
  return out;
}
function makeBatchBuffers3D(gl){ return {pos:gl.createBuffer(),norm:gl.createBuffer(),col:gl.createBuffer(),emi:gl.createBuffer(),uv:gl.createBuffer(),mat:gl.createBuffer(),idx:gl.createBuffer(),count:0,vertices:0,indexType:gl.UNSIGNED_SHORT,_dyn:{}}; }
function _uploadDynamicAttr3D(gl,target,buffer,store,key,data,Type){
  const arrKey=key+"Arr",capKey=key+"Cap";
  if(!store[arrKey]||store[arrKey].constructor!==Type||store[arrKey].length<data.length){
    let cap=1024; while(cap<data.length)cap*=2;
    store[arrKey]=new Type(cap); store[capKey]=0;
  }
  const view=store[arrKey].subarray(0,data.length); view.set(data);
  gl.bindBuffer(target,buffer);
  if((store[capKey]||0)<store[arrKey].byteLength){ gl.bufferData(target,store[arrKey].byteLength,gl.DYNAMIC_DRAW); store[capKey]=store[arrKey].byteLength; }
  if(view.length)gl.bufferSubData(target,0,view);
}
function uploadBatch3D(gl,buffers,batch,usage){
  if(usage===gl.DYNAMIC_DRAW){
    const st=buffers._dyn||(buffers._dyn={});
    _uploadDynamicAttr3D(gl,gl.ARRAY_BUFFER,buffers.pos,st,"pos",batch.pos,Float32Array);
    _uploadDynamicAttr3D(gl,gl.ARRAY_BUFFER,buffers.norm,st,"norm",batch.norm,Float32Array);
    _uploadDynamicAttr3D(gl,gl.ARRAY_BUFFER,buffers.col,st,"col",batch.col,Float32Array);
    _uploadDynamicAttr3D(gl,gl.ARRAY_BUFFER,buffers.emi,st,"emi",batch.emi,Float32Array);
    _uploadDynamicAttr3D(gl,gl.ARRAY_BUFFER,buffers.uv,st,"uv",batch.uv,Float32Array);
    _uploadDynamicAttr3D(gl,gl.ARRAY_BUFFER,buffers.mat,st,"mat",batch.mat,Float32Array);
    const useUint=R3D.indexUint||batch.count>65535;
    buffers.indexType=useUint?gl.UNSIGNED_INT:gl.UNSIGNED_SHORT;
    _uploadDynamicAttr3D(gl,gl.ELEMENT_ARRAY_BUFFER,buffers.idx,st,useUint?"idx32":"idx16",batch.idx,useUint?Uint32Array:Uint16Array);
  }else{
    gl.bindBuffer(gl.ARRAY_BUFFER,buffers.pos); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(batch.pos),usage);
    gl.bindBuffer(gl.ARRAY_BUFFER,buffers.norm); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(batch.norm),usage);
    gl.bindBuffer(gl.ARRAY_BUFFER,buffers.col); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(batch.col),usage);
    gl.bindBuffer(gl.ARRAY_BUFFER,buffers.emi); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(batch.emi),usage);
    gl.bindBuffer(gl.ARRAY_BUFFER,buffers.uv); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(batch.uv),usage);
    gl.bindBuffer(gl.ARRAY_BUFFER,buffers.mat); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(batch.mat),usage);
    const useUint=R3D.indexUint||batch.count>65535; buffers.indexType=useUint?gl.UNSIGNED_INT:gl.UNSIGNED_SHORT;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,buffers.idx); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,useUint?new Uint32Array(batch.idx):new Uint16Array(batch.idx),usage);
  }
  buffers.count=batch.idx.length; buffers.vertices=batch.count;
}
function drawBatch3D(gl,buffers){
  if(!buffers||!buffers.count)return;
  const at=R3D.program.attribs;
  gl.bindBuffer(gl.ARRAY_BUFFER,buffers.pos); gl.enableVertexAttribArray(at.aPos); gl.vertexAttribPointer(at.aPos,3,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,buffers.norm); gl.enableVertexAttribArray(at.aNorm); gl.vertexAttribPointer(at.aNorm,3,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,buffers.col); gl.enableVertexAttribArray(at.aColor); gl.vertexAttribPointer(at.aColor,4,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,buffers.emi); gl.enableVertexAttribArray(at.aEmissive); gl.vertexAttribPointer(at.aEmissive,1,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,buffers.uv); gl.enableVertexAttribArray(at.aUV); gl.vertexAttribPointer(at.aUV,2,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,buffers.mat); gl.enableVertexAttribArray(at.aMat); gl.vertexAttribPointer(at.aMat,3,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,buffers.idx); gl.drawElements(gl.TRIANGLES,buffers.count,buffers.indexType||gl.UNSIGNED_SHORT,0);
  renderer3DState.drawCalls++; renderer3DState.vertices+=buffers.vertices;
}
function ensureShadowTarget3D(gl){
  if(R3D.shadow||R3D.shadowFailed)return !!R3D.shadow;
  try{
    const size=qualityLevel===2?2048:1024;
    const texture=gl.createTexture(),fbo=gl.createFramebuffer(),depth=gl.createRenderbuffer();
    if(!texture||!fbo||!depth)throw new Error("shadow target");
    gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,size,size,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
    gl.bindRenderbuffer(gl.RENDERBUFFER,depth); gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,size,size);
    gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,depth);
    const ok=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER,null); gl.bindTexture(gl.TEXTURE_2D,null); gl.bindRenderbuffer(gl.RENDERBUFFER,null);
    if(!ok)throw new Error("shadow framebuffer incomplet");
    R3D.shadow={fbo,texture,depth,size}; R3D.shadowEnabled=true; return true;
  }catch(e){ R3D.shadowFailed=true; R3D.shadowEnabled=false; return false; }
}
function computeLightVP3D(){
  const mid=((p1.rx+p2.rx)/2-640)*R3D_WORLD,center=[mid,1.05,0],dir=norm3(R3D.lightDir);
  const eye=add3(center,scale3(dir,17)),proj=mat4Ortho3(-8.5,8.5,-6.5,7.5,4,32),view=mat4LookAt3(eye,center,[0,1,0]);
  R3D.lightVP=mat4Multiply3(proj,view); return R3D.lightVP;
}
function disableVertexAttribs3D(gl){
  const max=gl.getParameter?Math.min(16,gl.getParameter(gl.MAX_VERTEX_ATTRIBS)||8):8;
  for(let i=0;i<max;i++)gl.disableVertexAttribArray(i);
}
function drawDepthBatch3D(gl,buffers){
  if(!buffers||!buffers.count||!R3D.depthProgram)return;
  const at=R3D.depthProgram.attribs;
  gl.bindBuffer(gl.ARRAY_BUFFER,buffers.pos); gl.enableVertexAttribArray(at.aPos); gl.vertexAttribPointer(at.aPos,3,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,buffers.idx); gl.drawElements(gl.TRIANGLES,buffers.count,buffers.indexType||gl.UNSIGNED_SHORT,0);
  renderer3DState.drawCalls++;
}
function renderShadowMap3D(gl){
  if(!ensureShadowTarget3D(gl)||!R3D.shadow)return false;
  R3D.shadowFrame=(R3D.shadowFrame||0)+1;
  const shadowInterval=qualityLevel===0?3:qualityLevel===1?2:1;
  if(R3D.shadowReady&&shadowInterval>1&&R3D.shadowFrame%shadowInterval!==0)return true;
  computeLightVP3D();
  gl.bindFramebuffer(gl.FRAMEBUFFER,R3D.shadow.fbo); gl.viewport(0,0,R3D.shadow.size,R3D.shadow.size);
  gl.clearColor(1,1,1,1); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE);
  disableVertexAttribs3D(gl); gl.useProgram(R3D.depthProgram.prog); gl.uniformMatrix4fv(R3D.depthProgram.uniforms.uVP,false,R3D.lightVP);
  drawDepthBatch3D(gl,R3D.arena); drawDepthBatch3D(gl,R3D.dyn);
  R3D.shadowReady=true;
  gl.bindFramebuffer(gl.FRAMEBUFFER,null); resizeRenderer3D(); return true;
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
    R3D.indexUint=!!gl.getExtension("OES_element_index_uint");
    R3D.materialTexture=createMaterialAtlas3D(gl);
    const mainVertex3D=
      "precision mediump float;attribute vec3 aPos;attribute vec3 aNorm;attribute vec4 aColor;attribute float aEmissive;attribute vec2 aUV;attribute vec3 aMat;uniform mat4 uVP;uniform mat4 uLightVP;uniform vec3 uCamPos;varying vec4 vColor;varying vec3 vNorm;varying vec3 vWorld;varying float vEmissive;varying float vFog;varying vec2 vUV;varying vec3 vMat;varying vec4 vShadowCoord;void main(){vColor=aColor;vNorm=aNorm;vWorld=aPos;vEmissive=aEmissive;vUV=aUV;vMat=aMat;vFog=distance(uCamPos,aPos);vShadowCoord=uLightVP*vec4(aPos,1.0);gl_Position=uVP*vec4(aPos,1.0);}";
    const mainFragment3D=
      "precision mediump float;uniform vec3 uLightDir;uniform vec3 uLightColor;uniform vec3 uFillColor;uniform vec3 uCamPos;uniform vec3 uFogColor;uniform sampler2D uAtlas;uniform sampler2D uShadowMap;uniform float uShadowEnabled;uniform float uShadowTexel;varying vec4 vColor;varying vec3 vNorm;varying vec3 vWorld;varying float vEmissive;varying float vFog;varying vec2 vUV;varying vec3 vMat;varying vec4 vShadowCoord;float unpackDepth(vec4 rgba){return dot(rgba,vec4(1.0,0.0039215686,0.0000153787,0.0000000603));}float shadowFactor(vec3 n,vec3 l){if(uShadowEnabled<0.5)return 1.0;vec3 coord=vShadowCoord.xyz/max(0.0001,vShadowCoord.w)*0.5+0.5;if(coord.x<0.0||coord.x>1.0||coord.y<0.0||coord.y>1.0||coord.z<0.0||coord.z>1.0)return 1.0;float bias=max(0.0015,0.006*(1.0-max(dot(n,l),0.0)));float total=0.0;for(int x=-1;x<=1;x++){for(int y=-1;y<=1;y++){float d=unpackDepth(texture2D(uShadowMap,coord.xy+vec2(float(x),float(y))*uShadowTexel));total+=coord.z-bias<=d?1.0:0.0;}}return 0.10+0.90*(total/9.0);}vec3 aces(vec3 x){return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.0,1.0);}void main(){vec3 tex=texture2D(uAtlas,vUV).rgb;vec3 albedo=pow(max(vColor.rgb,vec3(0.0)),vec3(2.2))*(0.48+0.62*tex);float rough=clamp(vMat.x,0.08,1.0);float metal=clamp(vMat.y,0.0,1.0);float skin=clamp(vMat.z,0.0,1.0);vec3 n=normalize(vNorm);vec3 l=normalize(uLightDir);vec3 v=normalize(uCamPos-vWorld);vec3 h=normalize(l+v);float nd=max(dot(n,l),0.0);float wrapped=pow(clamp((nd+0.48)/1.48,0.0,1.0),1.45);float diff=mix(nd,wrapped,skin*0.72);float shadow=shadowFactor(n,l);vec3 fillDir=normalize(vec3(-l.x*0.8,0.32,-0.62));float fill=max(dot(n,fillDir),0.0);float hemi=0.17+0.18*(n.y*0.5+0.5);float specPow=mix(96.0,9.0,rough);float fres=pow(1.0-max(dot(n,v),0.0),5.0);vec3 f0=mix(vec3(0.035),albedo,metal);vec3 fresCol=f0+(1.0-f0)*fres;float spec=pow(max(dot(n,h),0.0),specPow)*mix(0.22,1.25,metal)*(1.05-rough*0.58);vec3 lightLin=pow(max(uLightColor,vec3(0.0)),vec3(2.2));vec3 fillLin=pow(max(uFillColor,vec3(0.0)),vec3(2.2));float ao=0.78+0.22*clamp(vWorld.y/1.9,0.0,1.0);vec3 col=albedo*(hemi*ao+lightLin*diff*1.48*shadow+fillLin*fill*0.22);col+=lightLin*spec*shadow*(0.35+fresCol);col+=uLightColor*fres*mix(0.1,0.3,metal);col+=vec3(0.55,0.14,0.08)*skin*pow(clamp(dot(v,-l),0.0,1.0),3.0)*0.34*shadow;col+=pow(max(vColor.rgb,vec3(0.0)),vec3(2.2))*vEmissive*1.7;float fogF=smoothstep(16.0,38.0,vFog);col=mix(col,pow(max(uFogColor,vec3(0.0)),vec3(2.2)),fogF*0.72);col=aces(col*1.16);col=pow(col,vec3(0.4545));float lum=dot(col,vec3(0.299,0.587,0.114));col=mix(vec3(lum),col,1.16);col=(col-0.5)*1.07+0.5;gl_FragColor=vec4(col,vColor.a);}";
    const mainAttribs3D=["aPos","aNorm","aColor","aEmissive","aUV","aMat"],mainUniforms3D=["uVP","uLightVP","uCamPos","uLightDir","uLightColor","uFillColor","uFogColor","uAtlas","uShadowMap","uShadowEnabled","uShadowTexel"];
    const derivativeExt3D=gl.getExtension("OES_standard_derivatives");
    const isWebGL2_3D=typeof WebGL2RenderingContext!=="undefined"&&gl instanceof WebGL2RenderingContext;
    let vertex3D=mainVertex3D,fragment3D=mainFragment3D,bumpRequested3D=false; R3D.bumpEnabled=false;
    if(derivativeExt3D||isWebGL2_3D){
      bumpRequested3D=true;
      const bumpFn3D="vec3 perturbNormal3D(vec3 n,vec3 p,vec2 uv,float strength){vec3 q0=dFdx(p);vec3 q1=dFdy(p);vec2 st0=dFdx(uv);vec2 st1=dFdy(uv);float h0=texture2D(uAtlas,uv).r;float hx=texture2D(uAtlas,uv+vec2(0.004,0.0)).r-h0;float hy=texture2D(uAtlas,uv+vec2(0.0,0.008)).r-h0;vec3 ss=q0*st1.t-q1*st0.t;vec3 tt=q1*st0.s-q0*st1.s;float det=st0.s*st1.t-st1.s*st0.t;if(abs(det)<0.00001)return n;vec3 grad=sign(det)*(hx*ss+hy*tt);return normalize(abs(det)*n-strength*grad);}";
      const bumpFragment3D=mainFragment3D.replace("void main(){vec3 tex",bumpFn3D+"void main(){vec3 tex").replace("vec3 n=normalize(vNorm);","vec3 n=perturbNormal3D(normalize(vNorm),vWorld,vUV,mix(0.16,0.58,rough)*(1.0-skin*0.55));");
      if(isWebGL2_3D){ vertex3D=convertShader3003D(mainVertex3D,false); fragment3D=convertShader3003D(bumpFragment3D,true); }
      else fragment3D="#extension GL_OES_standard_derivatives : enable\n"+bumpFragment3D;
    }
    try{
      R3D.program=makeProgram3D(gl,vertex3D,fragment3D,mainAttribs3D,mainUniforms3D);
      R3D.bumpEnabled=bumpRequested3D;
    }catch(shaderError3D){
      if(fragment3D===mainFragment3D)throw shaderError3D;
      R3D.program=makeProgram3D(gl,mainVertex3D,mainFragment3D,mainAttribs3D,mainUniforms3D); R3D.bumpEnabled=false;
    }
    R3D.depthProgram=makeProgram3D(gl,
      "precision mediump float;attribute vec3 aPos;uniform mat4 uVP;varying float vDepth;void main(){vec4 clip=uVP*vec4(aPos,1.0);vDepth=clip.z/max(0.0001,clip.w)*0.5+0.5;gl_Position=clip;}",
      "precision mediump float;varying float vDepth;vec4 packDepth(float d){vec4 enc=vec4(1.0,255.0,65025.0,16581375.0)*clamp(d,0.0,1.0);enc=fract(enc);enc-=enc.yzww*vec4(0.0039215686,0.0039215686,0.0039215686,0.0);return enc;}void main(){gl_FragColor=packDepth(vDepth);}",
      ["aPos"],["uVP"]);
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
  const qualityScale=qualityLevel===0?.78:qualityLevel===1?.9:1;
  const effectiveDpr=Math.min(DPR||1,qualityLevel===0?1:qualityLevel===1?1.35:1.75)*qualityScale;
  R3D.renderScale=effectiveDpr;
  const targetW=Math.max(320,Math.round(W*effectiveDpr)),targetH=Math.max(180,Math.round(H*effectiveDpr));
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
/* ================= V6.1 — FORMALISATION DES MAQUETTES EN VOLUMES 3D =================
   Marco : les planches ne servent plus seulement de palette. Chaque combattant
   possède une fiche de construction explicite : carrure, masse musculaire,
   poitrine/taille/hanches, cou, coiffure ou casque, matière du buste, manches,
   niveau d'armure, cape, pans de robe/manteau, équipement dorsal et arme.
   Le squelette d'animation reste commun (60 Hz), mais les volumes et les
   silhouettes ne sont plus interchangeables d'un héros à l'autre. */
const BOARD_MODEL3D={
  "gideon":{frame:"athlete",muscle:.84,chest:1.09,waist:.88,shoulders:1.09,hips:.98,neck:1.06,head:"none",hair:"short",beard:.16,ears:"human",top:"jacket",bare:0,sleeves:.42,armor:.2,cape:0,skirt:0,gear:"belt",weapon:"none",back:"none"},
  "kira":{frame:"feminine",muscle:.58,chest:.95,waist:.77,shoulders:.94,hips:1.03,neck:.9,head:"none",hair:"ponytail",beard:0,ears:"human",top:"kunoichi",bare:.25,sleeves:.22,armor:.2,cape:0,skirt:.18,gear:"scarf",weapon:"dagger",back:"none"},
  "titan":{frame:"colossus",muscle:1.24,chest:1.32,waist:1.08,shoulders:1.3,hips:1.09,neck:1.36,head:"none",hair:"shaved",beard:.5,ears:"human",top:"armor",bare:.35,sleeves:.05,armor:.8,cape:0,skirt:.16,gear:"belt",weapon:"none",back:"none"},
  "nova":{frame:"feminine",muscle:.52,chest:.97,waist:.75,shoulders:.96,hips:1.05,neck:.9,head:"circlet",hair:"long",beard:0,ears:"human",top:"robe",bare:.05,sleeves:.86,armor:.14,cape:.78,skirt:.74,gear:"orb",weapon:"staff",back:"none"},
  "godson-prime":{frame:"athlete",muscle:.92,chest:1.15,waist:.9,shoulders:1.17,hips:1,neck:1.11,head:"crown",hair:"short",beard:.12,ears:"human",top:"plate",bare:0,sleeves:.66,armor:.74,cape:.96,skirt:.3,gear:"capeClasp",weapon:"sword",back:"none"},
  "Zara":{frame:"feminine",muscle:.69,chest:1.01,waist:.79,shoulders:1,hips:1.08,neck:.95,head:"none",hair:"braids",beard:0,ears:"human",top:"sport",bare:.38,sleeves:.05,armor:.08,cape:0,skirt:.13,gear:"sash",weapon:"none",back:"none"},
  "kael":{frame:"athlete",muscle:.98,chest:1.18,waist:.92,shoulders:1.21,hips:1.02,neck:1.19,head:"none",hair:"short",beard:.34,ears:"human",top:"plate",bare:.08,sleeves:.74,armor:.9,cape:.34,skirt:.38,gear:"swordBelt",weapon:"sword",back:"none"},
  "sora":{frame:"feminine",muscle:.47,chest:.96,waist:.71,shoulders:.92,hips:1.09,neck:.88,head:"wizard",hair:"long",beard:0,ears:"human",top:"corsetRobe",bare:.06,sleeves:.92,armor:.08,cape:.2,skirt:.98,gear:"pouches",weapon:"staff",back:"none"},
  "ael":{frame:"robot",muscle:.62,chest:1.03,waist:.8,shoulders:1.06,hips:.9,neck:.96,head:"robot",hair:"none",beard:0,ears:"robot",top:"robot",bare:0,sleeves:1,armor:.94,cape:0,skirt:0,gear:"core",weapon:"rifle",back:"core"},
  "Lira":{frame:"feminine",muscle:.63,chest:.99,waist:.78,shoulders:.97,hips:1.06,neck:.92,head:"none",hair:"ponytail",beard:0,ears:"human",top:"explorer",bare:.32,sleeves:.24,armor:.26,cape:0,skirt:0,gear:"backpack",weapon:"dagger",back:"backpack"},
  "zed":{frame:"lean",muscle:.74,chest:1.03,waist:.84,shoulders:1.03,hips:.95,neck:1.01,head:"hoodMask",hair:"hood",beard:0,ears:"human",top:"leather",bare:0,sleeves:.94,armor:.5,cape:.16,skirt:.24,gear:"quiver",weapon:"dagger",back:"bow"},
  "nyx":{frame:"feminine",muscle:.62,chest:.98,waist:.78,shoulders:.96,hips:1.05,neck:.9,head:"none",hair:"bob",beard:0,ears:"human",top:"techCrop",bare:.3,sleeves:.32,armor:.32,cape:0,skirt:0,gear:"techpack",weapon:"wrench",back:"techpack"},
  "vorak":{frame:"colossus",muscle:1.3,chest:1.36,waist:1.07,shoulders:1.36,hips:1.11,neck:1.44,head:"none",hair:"mohawk",beard:.28,ears:"human",top:"bare",bare:1,sleeves:0,armor:.22,cape:0,skirt:.44,gear:"boneNecklace",weapon:"axe",back:"none",fur:1},
  "aerin":{frame:"feminine",muscle:.55,chest:.95,waist:.74,shoulders:.93,hips:1.05,neck:.88,head:"none",hair:"long",beard:0,ears:"elf",top:"ranger",bare:.12,sleeves:.56,armor:.34,cape:.62,skirt:.46,gear:"quiver",weapon:"dagger",back:"bow"},
  "korben":{frame:"athlete",muscle:.8,chest:1.09,waist:.94,shoulders:1.09,hips:1,neck:1.08,head:"goggles",hair:"short",beard:.26,ears:"human",top:"spacesuit",bare:0,sleeves:1,armor:.64,cape:0,skirt:0,gear:"techpack",weapon:"wrench",back:"techpack"},
  "lyra":{frame:"feminine",muscle:.49,chest:.97,waist:.73,shoulders:.94,hips:1.07,neck:.9,head:"halo",hair:"long",beard:0,ears:"human",top:"gown",bare:.06,sleeves:.76,armor:.17,cape:.54,skirt:1,gear:"sun",weapon:"staff",back:"none"},
  "drakesh":{frame:"alien",muscle:.82,chest:1.07,waist:.88,shoulders:1.11,hips:.98,neck:1.09,head:"none",hair:"alien",beard:0,ears:"horns",top:"longCoat",bare:0,sleeves:.96,armor:.46,cape:.26,skirt:.6,gear:"holsters",weapon:"rifle",back:"rifle"},
  "selene":{frame:"feminine",muscle:.63,chest:1.01,waist:.78,shoulders:.97,hips:1.08,neck:.92,head:"none",hair:"bob",beard:0,ears:"human",top:"pirateArmor",bare:.2,sleeves:.52,armor:.6,cape:0,skirt:.2,gear:"holsters",weapon:"rifle",back:"sword"},
  "taiko":{frame:"lean",muscle:.73,chest:1.03,waist:.84,shoulders:1.03,hips:.96,neck:1,head:"hoodMask",hair:"hood",beard:0,ears:"human",top:"robe",bare:0,sleeves:.92,armor:.36,cape:.24,skirt:.57,gear:"sash",weapon:"sword",back:"sword"},
  "vex":{frame:"cyborg",muscle:1.2,chest:1.3,waist:1.03,shoulders:1.3,hips:1.08,neck:1.34,head:"implants",hair:"shaved",beard:0,ears:"robot",top:"bareCyborg",bare:.72,sleeves:.92,armor:.78,cape:0,skirt:.18,gear:"cables",weapon:"axe",back:"core"},
  "elara":{frame:"feminine",muscle:.43,chest:.93,waist:.7,shoulders:.9,hips:1.05,neck:.86,head:"circlet",hair:"long",beard:0,ears:"human",top:"gown",bare:.05,sleeves:.82,armor:.06,cape:.68,skirt:1,gear:"crystal",weapon:"staff",back:"none"},
  "brax":{frame:"colossus",muscle:1.28,chest:1.35,waist:1.12,shoulders:1.35,hips:1.12,neck:1.42,head:"none",hair:"long",beard:1,ears:"human",top:"fur",bare:.45,sleeves:.28,armor:.46,cape:.18,skirt:.5,gear:"belt",weapon:"axe",back:"none",fur:1},
  "kazu":{frame:"lean",muscle:.78,chest:1.05,waist:.86,shoulders:1.06,hips:.97,neck:1.03,head:"none",hair:"topknot",beard:0,ears:"human",top:"samurai",bare:0,sleeves:.8,armor:.7,cape:0,skirt:.6,gear:"sash",weapon:"katana",back:"sword"},
  "sera":{frame:"feminine",muscle:.57,chest:.96,waist:.76,shoulders:.94,hips:1.05,neck:.9,head:"headset",hair:"bob",beard:0,ears:"human",top:"techJacket",bare:.08,sleeves:.78,armor:.2,cape:0,skirt:.12,gear:"techpack",weapon:"device",back:"techpack"},
  "vorga":{frame:"feminine",muscle:.61,chest:.97,waist:.78,shoulders:.97,hips:1.06,neck:.92,head:"wraps",hair:"wraps",beard:0,ears:"human",top:"bandages",bare:.18,sleeves:.68,armor:.15,cape:.18,skirt:.64,gear:"wraps",weapon:"spear",back:"none"},
  "nox":{frame:"feminine",muscle:.51,chest:.95,waist:.73,shoulders:.93,hips:1.06,neck:.88,head:"antlers",hair:"long",beard:0,ears:"elf",top:"leafArmor",bare:.18,sleeves:.36,armor:.3,cape:.34,skirt:.68,gear:"vines",weapon:"staff",back:"none"},
  "raven":{frame:"feminine",muscle:.63,chest:.98,waist:.78,shoulders:.97,hips:1.05,neck:.92,head:"visor",hair:"short",beard:0,ears:"human",top:"bodysuit",bare:0,sleeves:.94,armor:.48,cape:0,skirt:0,gear:"holsters",weapon:"rifle",back:"rifle"},
  "zep":{frame:"suit",muscle:.94,chest:1.21,waist:1.05,shoulders:1.21,hips:1.07,neck:1.16,head:"dome",hair:"none",beard:0,ears:"robot",top:"diveSuit",bare:0,sleeves:1,armor:.9,cape:0,skirt:0,gear:"tanks",weapon:"spear",back:"tanks"},
  "astrid":{frame:"feminine",muscle:.59,chest:1,waist:.76,shoulders:.98,hips:1.08,neck:.92,head:"crown",hair:"long",beard:0,ears:"human",top:"royalArmor",bare:.05,sleeves:.72,armor:.64,cape:.94,skirt:.74,gear:"jewel",weapon:"sword",back:"none"},
  "selenia":{frame:"feminine",muscle:.56,chest:.96,waist:.75,shoulders:.94,hips:1.06,neck:.89,head:"none",hair:"long",beard:0,ears:"elf",top:"ranger",bare:.1,sleeves:.54,armor:.36,cape:.5,skirt:.42,gear:"quiver",weapon:"dagger",back:"bow"},
  "drakar":{frame:"colossus",muscle:1.16,chest:1.28,waist:1.05,shoulders:1.3,hips:1.09,neck:1.35,head:"none",hair:"long",beard:.9,ears:"human",top:"furArmor",bare:.28,sleeves:.68,armor:.74,cape:.24,skirt:.52,gear:"shield",weapon:"axe",back:"shield",fur:1},
  "nyx-ombre":{frame:"feminine",muscle:.59,chest:.98,waist:.76,shoulders:.95,hips:1.06,neck:.9,head:"hoodMask",hair:"hood",beard:0,ears:"human",top:"assassin",bare:.06,sleeves:.82,armor:.52,cape:.36,skirt:.5,gear:"holsters",weapon:"dagger",back:"sword"},
  "Kairos":{frame:"athlete",muscle:.76,chest:1.06,waist:.86,shoulders:1.07,hips:.98,neck:1.03,head:"none",hair:"short",beard:.1,ears:"human",top:"mageCoat",bare:0,sleeves:.92,armor:.36,cape:.16,skirt:.84,gear:"rune",weapon:"staff",back:"none"},
  "Zara-nova":{frame:"feminine",muscle:.67,chest:1.01,waist:.8,shoulders:1,hips:1.06,neck:.94,head:"goggles",hair:"bun",beard:0,ears:"human",top:"engineerSuit",bare:0,sleeves:.96,armor:.57,cape:0,skirt:0,gear:"techpack",weapon:"wrench",back:"techpack"},
  "brutus":{frame:"powerArmor",muscle:1.22,chest:1.38,waist:1.13,shoulders:1.4,hips:1.15,neck:1.26,head:"helmet",hair:"none",beard:0,ears:"robot",top:"powerArmor",bare:0,sleeves:1,armor:1,cape:0,skirt:.12,gear:"shield",weapon:"rifle",back:"shield"},
  "aria":{frame:"feminine",muscle:.49,chest:.96,waist:.72,shoulders:.93,hips:1.07,neck:.89,head:"halo",hair:"long",beard:0,ears:"human",top:"gown",bare:.05,sleeves:.82,armor:.19,cape:.8,skirt:1,gear:"sun",weapon:"staff",back:"none"},
  "krak":{frame:"orc",muscle:1.32,chest:1.38,waist:1.09,shoulders:1.38,hips:1.13,neck:1.47,head:"none",hair:"mohawk",beard:.15,ears:"orc",top:"bare",bare:1,sleeves:0,armor:.2,cape:0,skirt:.46,gear:"skullBelt",weapon:"club",back:"none",fur:1},
  "luna":{frame:"robot",muscle:.58,chest:1.01,waist:.78,shoulders:1.02,hips:.94,neck:.96,head:"robot",hair:"none",beard:0,ears:"robot",top:"robot",bare:0,sleeves:1,armor:.92,cape:0,skirt:0,gear:"core",weapon:"device",back:"core"},
  "velen":{frame:"lean",muscle:.77,chest:1.06,waist:.86,shoulders:1.08,hips:.98,neck:1.04,head:"hoodMask",hair:"hood",beard:0,ears:"human",top:"assassinCoat",bare:0,sleeves:.96,armor:.54,cape:.3,skirt:.52,gear:"holsters",weapon:"dagger",back:"sword"},
  "lyra-azur":{frame:"feminine",muscle:.65,chest:1.01,waist:.78,shoulders:1,hips:1.08,neck:.94,head:"circlet",hair:"ponytail",beard:0,ears:"human",top:"dragonArmor",bare:.05,sleeves:.74,armor:.8,cape:.24,skirt:.64,gear:"capeClasp",weapon:"sword",back:"none"},
  "orion":{frame:"lean",muscle:.63,chest:1.01,waist:.9,shoulders:1,hips:.98,neck:.99,head:"glasses",hair:"short",beard:.08,ears:"human",top:"labCoat",bare:0,sleeves:.92,armor:.08,cape:0,skirt:.86,gear:"tablet",weapon:"device",back:"techpack"}
};
const BOARD_MODEL3D_FALLBACK={frame:"athlete",muscle:.75,chest:1.05,waist:.88,shoulders:1.05,hips:1,neck:1,head:"none",hair:"short",beard:.1,ears:"human",top:"jacket",bare:.05,sleeves:.55,armor:.25,cape:0,skirt:0,gear:"belt",weapon:"none",back:"none"};
function boardModel3D(f){
  const rawId=String((f&&f.char&&f.char.id)||"gideon");
  return BOARD_MODEL3D[rawId]||BOARD_MODEL3D[rawId.toLowerCase()]||BOARD_MODEL3D_FALLBACK;
}
const DETAIL3_Low={sector:10,rings:7,cyl:8},DETAIL3_MICRO={sector:6,rings:4,cyl:6};
function detailLow3(){ return qualityLevel===0?{sector:8,rings:6,cyl:7}:qualityLevel===1?{sector:9,rings:6,cyl:7}:DETAIL3_Low; }
function addMuscle3D(b,center,radius,rot,color){
  addSphere3D(b,center,radius,rot,color,bodyDetail3());
}
function addTaperedLimb3D(b,a,bp,r1,r2,color,bulge,bulgeT){
  addCylinder3D(b,a,bp,r1,r2,color,qualityLevel===0?10:qualityLevel===1?12:14);
  if(bulge>1.01)addMuscle3D(b,mix3(a,bp,bulgeT==null?.38:bulgeT),[(r1+r2)*.72*bulge,(r1+r2)*.58*bulge,(r1+r2)*.62*bulge],[0,0,0],color);
}
function addLoftedTube3D(b,points,radii,color,segments,sideHint){
  if(!b||!points||points.length<2)return;
  const seg=Math.max(5,segments||(qualityLevel===0?8:qualityLevel===1?12:18)),rings=[],cosT=[],sinT=[]; let distance=0;
  for(let j=0;j<=seg;j++){ const a=j/seg*Math.PI*2; cosT.push(Math.cos(a)); sinT.push(Math.sin(a)); }
  const radiusAt=i=>{ const r=radii&&radii.length?radii[Math.min(i,radii.length-1)]:.05; return Array.isArray(r)?r:[r,r]; };
  for(let i=0;i<points.length;i++){
    const p0=points[Math.max(0,i-1)],p1=points[Math.min(points.length-1,i+1)],tangent=norm3(sub3(p1,p0));
    if(i>0)distance+=len3(sub3(points[i],points[i-1]));
    let ref=sideHint||[0,0,1]; if(Math.abs(tangent[0]*ref[0]+tangent[1]*ref[1]+tangent[2]*ref[2])>.92)ref=[1,0,0];
    const u=norm3(cross3(tangent,ref)),v=norm3(cross3(u,tangent)),rr=radiusAt(i),ring=[];
    const invRX=1/Math.max(.004,rr[0]),invRZ=1/Math.max(.004,rr[1]);
    for(let j=0;j<=seg;j++){
      const ca=cosT[j],sa=sinT[j];
      let nx=u[0]*ca*invRX+v[0]*sa*invRZ,ny=u[1]*ca*invRX+v[1]*sa*invRZ,nz=u[2]*ca*invRX+v[2]*sa*invRZ;
      const nl=Math.hypot(nx,ny,nz)||1;
      ring.push(vertRaw3(b,points[i][0]+u[0]*ca*rr[0]+v[0]*sa*rr[1],points[i][1]+u[1]*ca*rr[0]+v[1]*sa*rr[1],points[i][2]+u[2]*ca*rr[0]+v[2]*sa*rr[1],nx/nl,ny/nl,nz/nl,color,j/seg*2,distance*1.7));
    }
    rings.push(ring);
  }
  for(let i=0;i<rings.length-1;i++)for(let j=0;j<seg;j++){
    const a=rings[i][j],bp=rings[i][j+1],c=rings[i+1][j+1],d=rings[i+1][j]; b.idx.push(a,bp,d,bp,c,d);
  }
  const firstTangent=norm3(sub3(points[1],points[0])),lastTangent=norm3(sub3(points[points.length-1],points[points.length-2]));
  const c0=vert3(b,points[0],scale3(firstTangent,-1),color,[.5,0]),c1=vert3(b,points[points.length-1],lastTangent,color,[.5,1]);
  for(let j=0;j<seg;j++){ b.idx.push(c0,rings[0][j+1],rings[0][j]); b.idx.push(c1,rings[rings.length-1][j],rings[rings.length-1][j+1]); }
}
function addAnatomyLimb3D(b,a,bp,r1,r2,color,kind,muscle){
  const profiles={
    thigh:{t:[0,.16,.36,.58,.8,1],f:[.98,1.1,1.18,1.04,.9,.81],e:[1.08,.94]},
    calf:{t:[0,.15,.34,.56,.79,1],f:[.92,1.05,1.2,.96,.74,.62],e:[1.02,.9]},
    upper:{t:[0,.16,.36,.58,.8,1],f:[.97,1.1,1.2,1.03,.87,.79],e:[1,.92]},
    forearm:{t:[0,.15,.34,.56,.79,1],f:[.9,1.06,1.14,.94,.77,.66],e:[.96,.9]}
  };
  const pr=profiles[kind]||profiles.forearm,muscleBoost=.94+(muscle||.75)*.13;
  const points=pr.t.map(t=>mix3(a,bp,t));
  const radii=pr.t.map((t,i)=>{ const r=lerp(r1,r2,t)*pr.f[i]*muscleBoost; return [r*pr.e[0],r*pr.e[1]]; });
  addLoftedTube3D(b,points,radii,color,qualityLevel===0?10:qualityLevel===1?14:20,[0,0,1]);
  const axis=norm3(sub3(bp,a)); let side=norm3(cross3(axis,[0,0,1])); if(len3(side)<.1)side=[1,0,0];
  const front=norm3(cross3(side,axis)),baseR=(r1+r2)*.5*muscleBoost;
  const lobe=(t,off,scale)=>{
    const center=add3(mix3(a,bp,t),off);
    addSphere3D(b,center,[baseR*.7*scale,baseR*.98*scale,baseR*.65*scale],[0,0,0],color,detailLow3());
  };
  if(kind==="thigh"){ lobe(.34,scale3(front,baseR*.34),1.02); lobe(.56,scale3(side,baseR*.22),.88); }
  else if(kind==="calf"){ lobe(.3,add3(scale3(front,-baseR*.12),scale3(side,baseR*.28)),.92); lobe(.38,add3(scale3(front,-baseR*.12),scale3(side,-baseR*.28)),.92); }
  else if(kind==="upper"){ lobe(.34,scale3(front,baseR*.32),1); lobe(.5,scale3(front,-baseR*.22),.82); }
  else { lobe(.28,scale3(front,baseR*.25),.94); lobe(.44,scale3(side,baseR*.18),.78); }
}
function addLoftedTorso3D(b,pose,model,color,S){
  const L=pose.local,breath=pose.breathScale||1;
  const mixLP=(a,bp,t)=>[lerp(a[0],bp[0],t),lerp(a[1],bp[1],t),0];
  const levels=[
    {c:[L.pelvis[0],L.pelvis[1]-.075,0],r:[.205*(model.hips||1),.27*(model.hips||1)]},
    {c:L.pelvis,r:[.222*(model.hips||1),.29*(model.hips||1)]},
    {c:mixLP(L.pelvis,L.chest,.18),r:[.191*(model.waist||1),.255*(model.waist||1)]},
    {c:mixLP(L.pelvis,L.chest,.38),r:[.205*(model.waist||1),.275*(model.hips||1)]},
    {c:mixLP(L.pelvis,L.chest,.6),r:[.232*(model.chest||1)*breath,.292*(model.shoulders||1)*breath]},
    {c:L.chest,r:[.252*(model.chest||1)*breath,.318*(model.shoulders||1)*breath]},
    {c:mixLP(L.chest,L.neck,.22),r:[.224*(model.chest||1),.302*(model.shoulders||1)]},
    {c:mixLP(L.chest,L.neck,.46),r:[.18*(model.neck||1),.266*(model.shoulders||1)]},
    {c:L.neck,r:[.12*(model.neck||1),.186*(model.neck||1)]}
  ];
  const seg=qualityLevel===0?12:qualityLevel===1?16:22,rings=[],circle=[];
  for(let j=0;j<=seg;j++){ const a=j/seg*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a); circle.push([ca,sa,ca*(1-.09*Math.pow(Math.abs(ca),3)),sa*(1-.05*Math.pow(Math.abs(sa),3))]); }
  levels.forEach((levelRow,i)=>{
    const ring=[],centerW=pose.toWorld(levelRow.c);
    for(let j=0;j<=seg;j++){
      const ca=circle[j][0],sa=circle[j][1],rx=levelRow.r[0]*S,rz=levelRow.r[1]*S;
      const shapedX=circle[j][2],shapedZ=circle[j][3];
      const local=[levelRow.c[0]+shapedX*levelRow.r[0],levelRow.c[1],shapedZ*levelRow.r[1]];
      const nLocal=[levelRow.c[0]+ca/Math.max(.02,levelRow.r[0])*.08,levelRow.c[1],sa/Math.max(.02,levelRow.r[1])*.08];
      const world=pose.toWorld(local),normal=norm3(sub3(pose.toWorld(nLocal),centerW));
      ring.push(vertRaw3(b,world[0],world[1],world[2],normal[0],normal[1],normal[2],color,j/seg*2,i*.42));
    }
    rings.push(ring);
  });
  for(let i=0;i<rings.length-1;i++)for(let j=0;j<seg;j++){ const a=rings[i][j],bp=rings[i][j+1],c=rings[i+1][j+1],d=rings[i+1][j]; b.idx.push(a,bp,d,bp,c,d); }
  const bottom=vert3(b,pose.toWorld(levels[0].c),norm3(sub3(pose.toWorld([levels[0].c[0],levels[0].c[1]-.1,0]),pose.toWorld(levels[0].c))),color,[.5,0]);
  const top=vert3(b,pose.toWorld(levels[levels.length-1].c),norm3(sub3(pose.toWorld([levels[levels.length-1].c[0],levels[levels.length-1].c[1]+.1,0]),pose.toWorld(levels[levels.length-1].c))),color,[.5,1]);
  for(let j=0;j<seg;j++){ b.idx.push(bottom,rings[0][j+1],rings[0][j]); b.idx.push(top,rings[rings.length-1][j],rings[rings.length-1][j+1]); }
}
function addHand3D(b,pose,side,color,S,armored){
  const L=pose.local,hand=side<0?L.handBack:L.handFront,elbow=side<0?L.elbowBack:L.elbowFront;
  let fx=hand[0]-elbow[0],fy=hand[1]-elbow[1]; const fl=Math.hypot(fx,fy)||1; fx/=fl; fy/=fl;
  let dx=fx*.42,dy=fy*.42-.72; const dl=Math.hypot(dx,dy)||1; dx/=dl; dy/=dl;
  const scale=armored?1.16:1,palm=pose.toWorld([hand[0]+fx*.025,hand[1]+fy*.025,hand[2]]);
  addSphere3D(b,palm,[.073*S*scale,.058*S*scale,.082*S*scale],[0,pose.yaw,pose.roll],color,detailLow3());
  const offsets=[-.049,-.017,.017,.049],lengths=[.064,.082,.086,.068];
  offsets.forEach((zOff,i)=>{
    const base=[hand[0]+fx*.052,hand[1]+fy*.052,hand[2]+zOff*S];
    const mid=[base[0]+fx*lengths[i]*.58,base[1]+fy*lengths[i]*.58,base[2]];
    const tip=[mid[0]+dx*lengths[i]*.5,mid[1]+dy*lengths[i]*.5,base[2]];
    addLoftedTube3D(b,[pose.toWorld(base),pose.toWorld(mid),pose.toWorld(tip)],[.015*S*scale,.013*S*scale,.0085*S*scale],color,qualityLevel===0?5:7,[0,1,0]);
    if(armored)addSphere3D(b,pose.toWorld(mid),.014*S,[0,pose.yaw,pose.roll],color,DETAIL3_MICRO);
  });
  const thumbBase=[hand[0]+fx*.018,hand[1]+fy*.018,hand[2]-side*.056*S];
  const thumbTip=[thumbBase[0]+fx*.045+dx*.025,thumbBase[1]+fy*.045+dy*.025,thumbBase[2]+side*.018*S];
  addLoftedTube3D(b,[pose.toWorld(thumbBase),pose.toWorld(thumbTip)],[.012*S*scale,.008*S*scale],color,qualityLevel===0?5:7,[0,1,0]);
}
function addBoot3D(b,pose,localFoot,color,soleColor,S,armored){
  const y=localFoot[1],baseY=Math.max(.032,y+.035);
  const points=[
    pose.toWorld([localFoot[0]-.025,baseY+.035,localFoot[2]]),
    pose.toWorld([localFoot[0]+.055,baseY+.018,localFoot[2]]),
    pose.toWorld([localFoot[0]+.14,baseY+.008,localFoot[2]]),
    pose.toWorld([localFoot[0]+.225,baseY+.002,localFoot[2]])
  ];
  const boost=armored?1.14:1;
  addLoftedTube3D(b,points,[[.066*S*boost,.063*S],[.086*S*boost,.071*S],[.071*S*boost,.061*S],[.043*S*boost,.048*S]],color,qualityLevel===0?9:12,[0,1,0]);
  addBox3D(b,pose.toWorld([localFoot[0]+.095,Math.max(.014,y+.012),localFoot[2]]),[(armored?.35:.31)*S,.026*S,.118*S],[0,pose.yaw,pose.roll],soleColor);
  addSphere3D(b,points[3],[.055*S*boost,.04*S,.052*S],[0,pose.yaw,pose.roll],color,detailLow3());
  if(armored)addBox3D(b,pose.toWorld([localFoot[0]+.02,baseY+.085,localFoot[2]]),[.1*S,.09*S,.105*S],[0,pose.yaw,pose.roll],color);
}
function addSculptedHead3D(b,pose,human,color,S,headR){
  const H=pose.local.head,unitScale=headR/Math.max(.001,S)/.145,jawScale=.78+(human.jaw||.65)*.34;
  const levels=[
    {y:-.122,x:.052,r:[.045,.058]},{y:-.098,x:.045,r:[.072,.088*jawScale]},{y:-.062,x:.052,r:[.09,.102]},
    {y:-.018,x:.042,r:[.104,.116]},{y:.026,x:.032,r:[.108,.12]},{y:.066,x:.026,r:[.11,.122]},
    {y:.104,x:.008,r:[.104,.117]},{y:.138,x:-.018,r:[.082,.096]},{y:.162,x:-.032,r:[.038,.048]}
  ];
  const seg=headDetail3().sector,rings=[],cosT=[],sinT=[];
  for(let j=0;j<=seg;j++){ const a=j/seg*Math.PI*2; cosT.push(Math.cos(a)); sinT.push(Math.sin(a)); }
  levels.forEach((level,i)=>{
    const ring=[],center=[H[0]+level.x*unitScale,H[1]+level.y*unitScale,0],centerW=pose.toWorld(center);
    for(let j=0;j<=seg;j++){
      const ca=cosT[j],sa=sinT[j],rx=level.r[0]*unitScale,rz=level.r[1]*unitScale;
      const local=[center[0]+ca*rx,center[1],sa*rz];
      const nLocal=[center[0]+ca/Math.max(.02,rx)*.055,center[1],sa/Math.max(.02,rz)*.055];
      const world=pose.toWorld(local),normal=norm3(sub3(pose.toWorld(nLocal),centerW));
      ring.push(vertRaw3(b,world[0],world[1],world[2],normal[0],normal[1],normal[2],color,j/seg*1.4,i*.22));
    }
    rings.push(ring);
  });
  for(let i=0;i<rings.length-1;i++)for(let j=0;j<seg;j++){ const a=rings[i][j],bp=rings[i][j+1],c=rings[i+1][j+1],d=rings[i+1][j]; b.idx.push(a,bp,d,bp,c,d); }
  const bottomCenter=[H[0]+levels[0].x*unitScale,H[1]+levels[0].y*unitScale,0],topLevel=levels[levels.length-1],topCenter=[H[0]+topLevel.x*unitScale,H[1]+topLevel.y*unitScale,0];
  const bottom=vert3(b,pose.toWorld(bottomCenter),norm3(sub3(pose.toWorld([bottomCenter[0],bottomCenter[1]-.08,0]),pose.toWorld(bottomCenter))),color,[.5,0]);
  const top=vert3(b,pose.toWorld(topCenter),norm3(sub3(pose.toWorld([topCenter[0],topCenter[1]+.08,0]),pose.toWorld(topCenter))),color,[.5,1]);
  for(let j=0;j<seg;j++){ b.idx.push(bottom,rings[0][j+1],rings[0][j]); b.idx.push(top,rings[rings.length-1][j],rings[rings.length-1][j+1]); }
  addSphere3D(b,pose.toWorld([H[0]-.032,H[1]+.052,0]),[headR*.74,headR*.8,headR*.84],[0,pose.headYaw||pose.yaw,pose.roll],color,headDetail3());
}
function addFaceDetails3D(b,pose,model,sk,mat,S,headR){
  const H=pose.local.head,P=(x,y,z)=>pose.toWorld([H[0]+x,H[1]+y,z||0]);
  const skin=mat(sk.skin,1,0,"skin"),skinShade=mat(shade(sk.skin,-12),1,0,"skin"),skinDeep=mat(shade(sk.skin,-42),1,0,"skin");
  [-1,1].forEach(side=>{
    addSphere3D(b,P(.104,-.026,side*.066),[headR*.3,headR*.26,headR*.3],[0,pose.headYaw||pose.yaw,pose.roll],mat(shade(sk.skin,2),1,0,"skin"),detailLow3());
    addSphere3D(b,P(.139,.018,side*.055),[.0085*S,.0105*S,.018*S],[0,pose.headYaw||pose.yaw,pose.roll],mat("#f7f3e8",1,.02,"plain"),DETAIL3_MICRO);
    addSphere3D(b,P(.147,.017,side*.055),[.006*S,.0085*S,.010*S],[0,pose.headYaw||pose.yaw,pose.roll],mat(model.frame==="cyborg"||model.frame==="robot"?sk.accent:"#17120e",1,model.frame==="cyborg"?.35:.02,"plain"),DETAIL3_MICRO);
    addSphere3D(b,P(.154,.023,side*.05),.0026*S,[0,0,0],mat("#ffffff",1,.55,"energy"),DETAIL3_MICRO);
    addBox3D(b,P(.134,.043,side*.055),[.017*S,.011*S,.048*S],[0,pose.headYaw||pose.yaw,pose.roll],skinShade);
    addBox3D(b,P(.132,.06,side*.055),[.017*S,.0105*S,.052*S],[0,pose.headYaw||pose.yaw,pose.roll],mat(sk.hair,1,0,"hair"));
    if(model.ears==="human"||model.ears==="robot"){
      addMuscle3D(b,P(-.012,-.002,side*.128),[.018*S,.031*S,.018*S],[0,pose.headYaw||pose.yaw,pose.roll],model.ears==="robot"?mat(sk.dark,1,.05,"tech"):skinShade);
      addSphere3D(b,P(-.007,-.003,side*.14),[.0075*S,.016*S,.0075*S],[0,pose.headYaw||pose.yaw,pose.roll],skinDeep,DETAIL3_MICRO);
    }
  });
  addLoftedTube3D(b,[P(.122,.032,0),P(.152,.0,0),P(.166,-.022,0),P(.144,-.046,0)],[.010*S,.012*S,.0145*S,.0125*S],skin,qualityLevel===0?6:8,[0,0,1]);
  addSphere3D(b,P(.146,-.049,0),[.017*S,.0105*S,.025*S],[0,pose.headYaw||pose.yaw,pose.roll],skinShade,DETAIL3_MICRO);
  addBox3D(b,P(.137,-.074,0),[.015*S,.0075*S,.052*S],[0,pose.headYaw||pose.yaw,pose.roll],skinDeep);
  addSphere3D(b,P(.137,-.086,0),[.0125*S,.0085*S,.03*S],[0,pose.headYaw||pose.yaw,pose.roll],mat(shade(sk.skin,-24),1,0,"skin"),DETAIL3_MICRO);
}
function addHairLocks3D(b,pose,model,sk,mat,S,headR){
  const H=pose.local.head,hair=model.hair,color=mat(sk.hair,1,0,"hair"),sway=pose.hairSway||0;
  const P=(x,y,z)=>pose.toWorld([H[0]+x,H[1]+y,z||0]);
  if(hair==="short"||hair==="shaved"){
    [-.075,-.038,0,.038,.075].forEach((z,i)=>{
      const lift=hair==="shaved"?.006:.018+(i===2?.008:0);
      addLoftedTube3D(b,[P(-.11,.105,z),P(-.035,.16+lift,z*.94),P(.055,.122+lift,z*.8)],[.022*S,.026*S,.015*S],color,qualityLevel===0?5:7,[0,1,0]);
    });
  }else if(hair==="bob"){
    [-1,1].forEach(side=>[-.025,0,.025].forEach(off=>{
      addLoftedTube3D(b,[P(-.02,.145,side*(.105+off)),P(.055,.035,side*(.128+off)),P(.045,-.115,side*(.12+off))],[.021*S,.023*S,.013*S],color,6,[1,0,0]);
    }));
  }else if(hair==="long"){
    [-.075,-.038,0,.038,.075].forEach((z,i)=>{
      const endY=lerp(H[1],pose.local.pelvis[1],.72+((i%2)*.07));
      addLoftedTube3D(b,[P(-.085,.06,z),pose.toWorld([pose.local.chest[0]-.16+sway*.35,(H[1]+pose.local.chest[1])/2,z*1.15]),pose.toWorld([pose.local.pelvis[0]-.18+sway,endY,z*1.2])],[.024*S,.022*S,.011*S],color,qualityLevel===0?6:8,[0,0,1]);
    });
  }else if(hair==="ponytail"||hair==="topknot"){
    const knot=P(-.105,hair==="topknot"?.17:.095,0); addSphere3D(b,knot,.038*S,[0,pose.headYaw||pose.yaw,pose.roll],color,detailLow3());
    [-.035,-.012,.012,.035].forEach(z=>addLoftedTube3D(b,[knot,P(-.19+sway*.4,hair==="topknot"?.03:-.16,z),P(-.25+sway,hair==="topknot"?-.12:-.42,z*1.25)],[.018*S,.016*S,.007*S],color,qualityLevel===0?5:7,[0,0,1]));
  }else if(hair==="mohawk"){
    for(let i=0;i<7;i++){ const x=-.105+i*.035,h=.11+Math.sin(i/6*Math.PI)*.075; addCylinder3D(b,P(x,.135,0),P(x-.018,.135+h,0),.025*S,.002*S,color,5); }
  }
}
function addFurTufts3D(b,center,pose,color,S,count,spread){
  const n=qualityLevel===0?Math.ceil(count*.55):count;
  for(let i=0;i<n;i++){
    const a=i/Math.max(1,n-1)-.5,base=pose.toWorld([center[0]+(.5-Math.abs(a))*.04,center[1]+.015,center[2]+a*spread]);
    const tip=pose.toWorld([center[0]-.035,center[1]-.075-(i%3)*.018,center[2]+a*(spread+.045)]);
    addCylinder3D(b,base,tip,.021*S,.002*S,color,5);
  }
}
function localPoint3D(pose,x,y,z){ return pose.toWorld([x,y,z]); }
function addBoardGearDetails3D(b,pose,W3,model,sk,mat,S){
  const L=pose.local,gear=model.gear;
  if(gear==="pouches"||gear==="holsters"||gear==="backpack"||gear==="techpack"||gear==="swordBelt"){
    [-1,1].forEach(side=>addBox3D(b,localPoint3D(pose,L.pelvis[0]+.03,L.pelvis[1]+.01,side*.2),[.13*S,.14*S,.075*S],[0,pose.yaw,pose.roll],mat(side<0?sk.dark:"#3e2f22")));
    addBox3D(b,mix3(W3.hipFront,W3.kneeFront,.28),[.1*S,.15*S,.06*S],[0,pose.yaw,pose.roll],mat(sk.dark));
  }
  if(gear==="boneNecklace"){
    for(let i=0;i<5;i++){ const t=i/4-.5; addSphere3D(b,localPoint3D(pose,L.neck[0]+.1-Math.abs(t)*.03,L.neck[1]-.05-Math.abs(t)*.02,t*.18),.021*S,[0,0,0],mat("#fff8e1"),DETAIL3_MICRO); }
  }
  if(gear==="skullBelt")addMuscle3D(b,localPoint3D(pose,L.pelvis[0]+.15,L.pelvis[1]+.07,0),[.055*S,.065*S,.07*S],[0,pose.yaw,pose.roll],mat("#e8e0cc"));
  if(gear==="cables"){
    addCylinder3D(b,localPoint3D(pose,L.chest[0]-.1,L.chest[1]+.02,-.19),localPoint3D(pose,L.pelvis[0]+.06,L.pelvis[1]+.05,-.2),.018*S,.015*S,mat("#263238"),6);
    addCylinder3D(b,localPoint3D(pose,L.chest[0]-.08,L.chest[1]-.02,.2),localPoint3D(pose,L.pelvis[0]+.08,L.pelvis[1]+.04,.19),.015*S,.012*S,mat("#ff5252",1,.35),6);
  }
  if(gear==="wraps"){
    [.34,.58,.8].forEach(t=>{ addCylinder3D(b,mix3(W3.elbowFront,W3.handFront,t-.05),mix3(W3.elbowFront,W3.handFront,t+.05),.073*S,.07*S,mat("#d7ccc8"),7); addCylinder3D(b,mix3(W3.kneeFront,W3.footFront,t-.05),mix3(W3.kneeFront,W3.footFront,t+.05),.083*S,.078*S,mat("#bcaaa4"),7); });
  }
  if(gear==="vines"){
    [.3,.55,.78].forEach(t=>addCylinder3D(b,mix3(W3.shoulderFront,W3.handFront,t-.03),mix3(W3.shoulderFront,W3.handFront,t+.03),.064*S,.06*S,mat("#33691e"),7));
    addSphere3D(b,W3.handBack,.045*S,[0,0,0],mat("#aeea00",1,.55),DETAIL3_MICRO);
  }
  if(gear==="orb"||gear==="crystal"||gear==="sun"){
    const p=add3(W3.handBack,[0,.09*S,0]); addSphere3D(b,p,.052*S,[0,0,0],mat(sk.accent,1,.65),detailLow3());
    addCylinder3D(b,W3.handBack,p,.012*S,.008*S,mat(sk.accent,1,.35),5);
  }
  if(gear==="tablet")addBox3D(b,W3.handBack,[.16*S,.1*S,.025*S],[0,pose.yaw,pose.roll],mat("#00b0ff",1,.45));
  if(model.bare>.8){
    [-1,1].forEach(side=>{ addBox3D(b,localPoint3D(pose,L.chest[0]+.02,L.chest[1]-.02,side*.245),[.2*S,.026*S,.018*S],[.55,pose.yaw,pose.roll],mat("#8e2418")); addBox3D(b,localPoint3D(pose,L.chest[0]-.01,L.chest[1]-.17,side*.235),[.17*S,.021*S,.018*S],[-.4,pose.yaw,pose.roll],mat("#4a1710")); });
    addCylinder3D(b,mix3(W3.shoulderFront,W3.elbowFront,.28),mix3(W3.shoulderFront,W3.elbowFront,.38),.104*S,.1*S,mat("#8e2418"),8);
  }
  if(model.top==="samurai"||model.top==="plate"||model.top==="furArmor"||model.top==="dragonArmor"){
    [.28,.5,.72].forEach((t,i)=>addCylinder3D(b,mix3(W3.pelvis,W3.chest,t),mix3(W3.pelvis,W3.chest,t+.035),(.19-i*.008)*S,(.19-i*.008)*S,mat(i%2?sk.accent:sk.dark),9));
  }
}
function addWeapon3D(b,pose,W3,model,sk,mat,S){
  const kind=model.weapon; if(!kind||kind==="none")return;
  const hand=W3.handFront,dirRaw=sub3(hand,W3.elbowFront),dir=len3(dirRaw)>.001?norm3(dirRaw):norm3(sub3(W3.handFront,W3.chest));
  const along=(dist,from)=>add3(from||hand,scale3(dir,dist)),gripA=along(-.055*S),gripB=along(.075*S);
  const metal=mat(model.frame==="powerArmor"||model.frame==="robot"?sk.accent:"#aebfd0",1,.06,model.frame==="powerArmor"||model.frame==="robot"?"tech":"metal"),dark=mat("#18120e",1,0,"leather"),accent=mat(sk.accent,1,.18,"energy");
  if(kind==="sword"||kind==="katana"||kind==="dagger"){
    const blade=kind==="dagger"?.34:kind==="katana"?.78:.72,tip=along(blade*S);
    addCylinder3D(b,gripA,gripB,.026*S,.026*S,dark,6); addSphere3D(b,gripA,.035*S,[0,pose.yaw,0],accent,DETAIL3_MICRO);
    addCylinder3D(b,gripB,mix3(gripB,tip,.1),.052*S,.046*S,accent,8);
    addLoftedTube3D(b,[gripB,mix3(gripB,tip,.58),tip],[[(kind==="dagger"?.042:.055)*S,.011*S],[(kind==="dagger"?.037:.048)*S,.009*S],[.002*S,.002*S]],metal,6,[0,1,0]);
  }else if(kind==="staff"||kind==="spear"){
    const top=along((kind==="spear"?1.02:.86)*S),bottom=along(-.62*S);
    addCylinder3D(b,bottom,top,.022*S,.019*S,mat(sk.dark),7);
    if(kind==="spear")addCylinder3D(b,top,along(1.2*S),.032*S,.002*S,metal,4);
    else { addSphere3D(b,top,.062*S,[0,0,0],mat(sk.accent,1,.5),detailLow3()); [-1,1].forEach(side=>addCylinder3D(b,top,localPoint3D(pose,pose.local.handFront[0]+.72,pose.local.handFront[1]+.15,pose.local.handFront[2]+side*.08),.011*S,.002*S,accent,5)); }
  }else if(kind==="axe"||kind==="club"){
    const top=along(.72*S),bottom=along(-.3*S);
    addCylinder3D(b,bottom,top,.03*S,.026*S,dark,7);
    if(kind==="club"){ addLoftedTube3D(b,[bottom,mix3(bottom,top,.58),top,along(.86*S)],[.026*S,.042*S,.082*S,.058*S],mat("#5d4037",1,0,"leather"),10,[0,1,0]); [-.05,0,.05].forEach(off=>addCylinder3D(b,top,add3(top,[off*.3,.08*S,off]),.012*S,.002*S,metal,5)); }
    else { addBox3D(b,top,[.18*S,.26*S,.035*S],[0,pose.yaw,pose.roll],metal); addCylinder3D(b,top,along(.88*S),.018*S,.002*S,metal,5); }
  }else if(kind==="rifle"||kind==="device"||kind==="wrench"){
    if(kind==="wrench"){ addCylinder3D(b,gripA,along(.34*S),.021*S,.018*S,metal,6); addSphere3D(b,along(.37*S),.045*S,[0,0,0],accent,DETAIL3_MICRO); }
    else {
      const mid=along((kind==="rifle"?.25:.12)*S),len=kind==="rifle"?.72:.28;
      addBox3D(b,mid,[len*S,(kind==="rifle"?.075:.11)*S,.065*S],[0,pose.yaw,pose.roll],mat("#20262e"));
      addCylinder3D(b,along((kind==="rifle"?.5:.2)*S),along((kind==="rifle"?.72:.28)*S),.018*S,.014*S,metal,6);
      addSphere3D(b,along((kind==="rifle"?.72:.28)*S),.028*S,[0,0,0],mat(sk.accent,1,.5),DETAIL3_MICRO);
    }
  }
}
function addBackGear3D(b,pose,W3,model,sk,mat,S){
  const kind=model.back; if(!kind||kind==="none")return;
  const L=pose.local,backX=L.chest[0]-.24,center=localPoint3D(pose,backX,(L.chest[1]+L.pelvis[1])/2,0);
  if(kind==="backpack"||kind==="techpack"||kind==="tanks"||kind==="core"){
    addBox3D(b,center,[.18*S,.48*S,.34*S],[0,pose.yaw,pose.roll],mat(kind==="backpack"?"#4b4632":sk.dark));
    if(kind==="tanks")[-1,1].forEach(side=>addCylinder3D(b,localPoint3D(pose,backX-.03,L.pelvis[1]+.12,side*.1),localPoint3D(pose,backX-.03,L.chest[1]+.05,side*.1),.055*S,.055*S,mat("#78909c"),8));
    else addSphere3D(b,localPoint3D(pose,backX-.105,(L.chest[1]+L.pelvis[1])/2,0),.075*S,[0,0,0],mat(sk.accent,1,kind==="backpack"?.08:.58),detailLow3());
    [-1,1].forEach(side=>addBox3D(b,localPoint3D(pose,backX-.02,L.pelvis[1]+.05,side*.2),[.1*S,.14*S,.07*S],[0,pose.yaw,pose.roll],mat(sk.primary)));
  }else if(kind==="bow"){
    let prev=null; for(let i=0;i<=5;i++){ const t=i/5,p=localPoint3D(pose,backX-.04-Math.sin(t*Math.PI)*.13,L.pelvis[1]+.05+t*.78,-.12+t*.24); if(prev)addCylinder3D(b,prev,p,.017*S,.015*S,mat("#4e342e"),5); prev=p; }
    addCylinder3D(b,localPoint3D(pose,backX-.02,L.pelvis[1]+.02,.1),localPoint3D(pose,backX-.08,L.chest[1]+.1,.12),.045*S,.038*S,mat("#3e2723"),7);
    [-.03,0,.03].forEach(z=>addCylinder3D(b,localPoint3D(pose,backX-.08,L.chest[1]+.08,.12+z),localPoint3D(pose,backX-.12,L.chest[1]+.3,.13+z),.006*S,.002*S,mat("#d7ccc8"),4));
  }else if(kind==="sword"||kind==="rifle"){
    const a=localPoint3D(pose,backX-.03,L.pelvis[1]+.02,-.13),c=localPoint3D(pose,backX-.08,L.chest[1]+.22,.13);
    addCylinder3D(b,a,c,kind==="rifle"?.04*S:.019*S,kind==="rifle"?.034*S:.002*S,mat(kind==="rifle"?sk.dark:"#aebfd0"),kind==="rifle"?7:4);
    addSphere3D(b,a,.035*S,[0,0,0],mat(sk.accent),DETAIL3_MICRO);
  }else if(kind==="shield"){
    addSphere3D(b,center,[.07*S,.31*S,.24*S],[0,pose.yaw,pose.roll],mat(sk.primary,1,.08),detailLow3());
    addSphere3D(b,localPoint3D(pose,backX-.09,(L.chest[1]+L.pelvis[1])/2,0),.065*S,[0,0,0],mat(sk.accent,1,.2),DETAIL3_MICRO);
  }else if(kind==="wings"){
    [-1,1].forEach(side=>{
      const root=localPoint3D(pose,backX,L.chest[1],side*.1),tip=localPoint3D(pose,backX-.52,L.chest[1]+.2,side*.54),low=localPoint3D(pose,backX-.42,L.pelvis[1]+.02,side*.4);
      tri3(b,root,tip,low,mat(sk.accent,.9,.12)); addCylinder3D(b,root,tip,.018*S,.008*S,mat(sk.dark),5);
    });
  }
}
function addClothGrid3D(b,rows,color){
  if(!rows||rows.length<2||!rows[0]||rows[0].length<2)return;
  for(let i=0;i<rows.length-1;i++)for(let j=0;j<rows[i].length-1;j++)quad3(b,rows[i][j],rows[i][j+1],rows[i+1][j+1],rows[i+1][j],color);
}
function addBoardCloth3D(b,pose,W3,model,sk,mat,S){
  const L=pose.local,wave=(pose.clothSway||0)+Math.sin(renderTicker*.08+(pose.motion?pose.motion.breath:0))*.018-(pose.motion?pose.motion.dash*.045:0);
  if(model.cape>.03){
    const len=model.cape,topY=L.chest[1]+.05,botY=lerp(topY,.08,len),cols=[-.2,-.1,0,.1,.2],rows=[];
    [0,.28,.56,.8,1].forEach((t,rowIndex)=>{
      const y=lerp(topY,botY,t),x=lerp(L.chest[0]-.13,L.pelvis[0]-.36,t)+wave*t;
      rows.push(cols.map((z,colIndex)=>{
        const ripple=Math.sin(renderTicker*.11+colIndex*1.37+rowIndex*.8)*.014*t;
        return localPoint3D(pose,x+ripple,y,z*(1+t*.12));
      }));
    });
    addClothGrid3D(b,rows,mat(shade(sk.dark,-8),1,0,"fabric"));
    [-1,1].forEach(side=>addSphere3D(b,localPoint3D(pose,L.chest[0]+.1,L.chest[1]+.07,side*.16),.032*S,[0,0,0],mat(sk.accent,1,.15,"metal"),DETAIL3_MICRO));
  }
  if(model.skirt>.03){
    const drop=(foot,hip)=>mix3(hip,foot,model.skirt>=.85?.72:model.skirt>=.5?.5:.28);
    const lb=drop(W3.footBack,W3.hipBack),lf=drop(W3.footFront,W3.hipFront);
    const ob=add3(lb,[wave*.25,0,-.085*S]),of=add3(lf,[wave*.25,0,.085*S]);
    const topRow=[],midRow=[],botRow=[];
    [0,.25,.5,.75,1].forEach((t,i)=>{
      const top=mix3(W3.hipBack,W3.hipFront,t),bot=mix3(ob,of,t),mid=mix3(top,bot,.52);
      mid[0]+=wave*.35+Math.sin(renderTicker*.1+i)*.006; bot[0]+=wave*.65+Math.sin(renderTicker*.1+i*1.3)*.009;
      topRow.push(top); midRow.push(mid); botRow.push(bot);
    });
    addClothGrid3D(b,[topRow,midRow,botRow],mat(shade(sk.primary,-10),1,0,"fabric"));
    if(model.skirt>=.45){
      const cols=[-.19,-.095,0,.095,.19],rows=[];
      [0,.38,.72,1].forEach((t,rowIndex)=>{
        rows.push(cols.map((z,colIndex)=>localPoint3D(pose,lerp(L.pelvis[0]-.1,L.pelvis[0]-.25,t)+wave*t+Math.sin(renderTicker*.1+colIndex+rowIndex)*.008*t,lerp(L.pelvis[1]+.03,Math.max(.1,L.pelvis[1]-model.skirt*.78),t),z)));
      });
      addClothGrid3D(b,rows,mat(shade(sk.dark,-8),1,0,"fabric"));
    }
    if(model.top==="plate"||model.frame==="colossus"||model.armor>.58){
      [-1,1].forEach(side=>addBox3D(b,localPoint3D(pose,L.pelvis[0]+.05,L.pelvis[1]-.12,side*.13),[.2*S,.28*S,.11*S],[0,pose.yaw,pose.roll],mat(side<0?sk.dark:sk.accent,1,.05,"metal")));
    }
  }
  if(model.gear==="sash"||model.top==="plate"&&model.skirt>=.3){
    addBox3D(b,localPoint3D(pose,L.pelvis[0]+.12,L.pelvis[1]-.1,0),[.08*S,.34*S,.15*S],[0,pose.yaw,pose.roll],mat(model ===BOARD_MODEL3D.kael?"#b71c1c":sk.accent,1,0,"fabric"));
  }
}
function addHeadGear3D(b,pose,W3,model,sk,mat,S,headR){
  const L=pose.local,H=L.head,kind=model.head;
  const P=(x,y,z)=>localPoint3D(pose,H[0]+x,H[1]+y,z);
  if(model.ears==="elf"||model.ears==="orc")[-1,1].forEach(side=>addCylinder3D(b,P(-.02,.015,side*.13),P(-.08,.07,side*.22),.018*S,.002*S,mat(sk.skin),5));
  if(model.ears==="horns")[-1,1].forEach(side=>addCylinder3D(b,P(-.03,.1,side*.1),P(-.12,.25,side*.17),.026*S,.002*S,mat("#263238"),6));
  if(model.beard>.06){
    addMuscle3D(b,P(.105,-.105-(model.beard>.7?.035:0),0),[headR*.58,headR*(.42+model.beard*.42),headR*.72],[0,pose.yaw,pose.roll],mat(sk.hair));
  }
  if(kind==="hoodMask"||model.hair==="hood"){
    addMuscle3D(b,P(-.055,.045,0),[headR*1.18,headR*1.12,headR*1.16],[0,pose.yaw,pose.roll],mat(sk.dark));
    addBox3D(b,P(.142,-.055,0),[.035*S,.075*S,.17*S],[0,pose.yaw,pose.roll],mat(shade(sk.dark,-18)));
  }else if(kind==="wizard"){
    addCylinder3D(b,P(0,.105,0),P(0,.135,0),headR*1.55,headR*1.55,mat("#4a227a"),12);
    addCylinder3D(b,P(-.015,.13,0),P(-.09,.48,0),headR*.72,.012*S,mat("#5e35b1"),10);
    addSphere3D(b,P(-.095,.49,0),.025*S,[0,0,0],mat("#ffc400",1,.25),DETAIL3_MICRO);
  }else if(kind==="robot"||kind==="helmet"||kind==="dome"){
    addMuscle3D(b,P(-.015,.025,0),[headR*1.08,headR*1.1,headR*1.06],[0,pose.yaw,pose.roll],mat(kind==="dome"?"#546e7a":sk.primary,1,.06));
    addBox3D(b,P(.142,.005,0),[.032*S,.055*S,.18*S],[0,pose.yaw,pose.roll],mat(sk.accent,1,.72));
    [-1,1].forEach(side=>addCylinder3D(b,P(-.01,0,side*.14),P(-.01,0,side*.175),.032*S,.032*S,mat(sk.dark),8));
    if(kind==="helmet")addBox3D(b,P(-.03,.16,0),[.16*S,.045*S,.025*S],[0,pose.yaw,pose.roll],mat(sk.accent));
  }else if(kind==="crown"){
    addCylinder3D(b,P(0,.105,0),P(0,.15,0),.09*S,.09*S,mat("#ffc400",1,.3),10);
    [-.06,0,.06].forEach(z=>addCylinder3D(b,P(0,.145,z),P(0,.235,z),.019*S,.003*S,mat("#ffc400",1,.3),6));
  }else if(kind==="halo"){
    for(let i=0;i<10;i++){ const a=i/10*Math.PI*2; addSphere3D(b,P(Math.cos(a)*.11,.2+Math.sin(a)*.11,0),.014*S,[0,0,0],mat("#ffd54f",1,.55),DETAIL3_MICRO); }
  }else if(kind==="antlers"){
    [-1,1].forEach(side=>{ const base=P(-.03,.1,side*.09),mid=P(-.1,.28,side*.18),tip=P(-.17,.43,side*.24); addCylinder3D(b,base,mid,.018*S,.011*S,mat("#6d4c41"),6); addCylinder3D(b,mid,tip,.011*S,.002*S,mat("#8d6e63"),5); addCylinder3D(b,mid,P(.02,.38,side*.23),.009*S,.002*S,mat("#8d6e63"),5); });
  }else if(kind==="goggles"||kind==="glasses"||kind==="visor"||kind==="headset"){
    const y=kind==="goggles"?.105:.015;
    addBox3D(b,P(.14,y,0),[.025*S,(kind==="visor"?.055:.04)*S,.19*S],[0,pose.yaw,pose.roll],mat(kind==="glasses"?"#263238":sk.accent,1,kind==="glasses"?.05:.5));
    if(kind==="headset")[-1,1].forEach(side=>addCylinder3D(b,P(-.01,0,side*.14),P(-.01,0,side*.175),.038*S,.038*S,mat(sk.accent,1,.2),8));
  }else if(kind==="circlet"){
    addCylinder3D(b,P(-.01,.118,0),P(-.01,.142,0),headR*.8,headR*.8,mat(sk.accent,1,.35),12);
    addSphere3D(b,P(.12,.125,0),.018*S,[0,0,0],mat(sk.accent,1,.6),DETAIL3_MICRO);
  }else if(kind==="implants"){
    [-.07,0,.07].forEach(z=>addSphere3D(b,P(-.03,.115,z),.021*S,[0,0,0],mat("#ff5252",1,.65),DETAIL3_MICRO));
    addBox3D(b,P(.1,.115,0),[.11*S,.025*S,.16*S],[0,pose.yaw,pose.roll],mat("#37474f"));
  }else if(kind==="wraps"){
    addCylinder3D(b,P(0,.045,0),P(0,.105,0),headR*1.02,headR*1.02,mat("#d7ccc8"),10);
    addBox3D(b,P(.13,-.045,0),[.035*S,.045*S,.18*S],[0,pose.yaw,pose.roll],mat("#bcaaa4"));
  }
  const hair=model.hair;
  if(hair==="ponytail"||hair==="topknot"||hair==="braids"){
    if(hair==="braids")[-1,1].forEach(side=>{
      const pts=[]; for(let i=0;i<6;i++){ const t=i/5; pts.push(P(-.08-t*.1,.04-t*.46,side*(.09+t*.035)+Math.sin(i*1.8)*.008)); }
      addLoftedTube3D(b,pts,pts.map((_,i)=>(.027-i*.0025)*S),mat(sk.hair,1,0,"hair"),7,[1,0,0]);
      pts.forEach((pt,i)=>{ if(i>0)addSphere3D(b,pt,(.026-i*.002)*S,[0,pose.headYaw||pose.yaw,pose.roll],mat(i%2?shade(sk.hair,-12):sk.hair,1,0,"hair"),DETAIL3_MICRO); });
    });
    else addCapsule3D(b,P(-.1,hair==="topknot"?.13:.05,0),P(-.24,hair==="topknot"?-.08:-.38,0),.04*S,.018*S,mat(sk.hair));
  }else if(hair==="long"){
    addCapsule3D(b,P(-.11,.03,-.035),localPoint3D(pose,L.pelvis[0]-.17,L.pelvis[1]+.15,-.04),.05*S,.026*S,mat(sk.hair));
    [-1,1].forEach(side=>addCapsule3D(b,P(-.035,-.02,side*.105),localPoint3D(pose,L.chest[0]-.08,L.chest[1]-.28,side*.13),.026*S,.015*S,mat(sk.hair)));
  }else if(hair==="mohawk"){
    addBox3D(b,P(-.01,.105,0),[.2*S,.035*S,.038*S],[0,pose.headYaw||pose.yaw,pose.roll],mat(shade(sk.hair,-10),1,0,"hair"));
  }else if(hair==="bob"){
    addMuscle3D(b,P(-.055,-.015,0),[headR*.92,headR*.96,headR*1.04],[0,pose.yaw,pose.roll],mat(sk.hair));
  }else if(hair==="alien"){
    [-1,1].forEach(side=>addCylinder3D(b,P(-.04,.07,side*.08),P(-.14,.15,side*.13),.018*S,.002*S,mat(sk.skin),5));
  }
  if(model.frame==="orc")[-1,1].forEach(side=>addCylinder3D(b,P(.15,-.105,side*.055),P(.17,-.045,side*.055),.011*S,.002*S,mat("#fff8e1"),5));
  if(model.gear==="scarf"){
    addCylinder3D(b,localPoint3D(pose,L.neck[0],L.neck[1]-.025,0),localPoint3D(pose,L.neck[0],L.neck[1]+.035,0),.085*S,.085*S,mat(sk.accent),10);
    addBox3D(b,localPoint3D(pose,L.neck[0]-.12,L.neck[1]-.16,-.07),[.12*S,.3*S,.045*S],[0,pose.yaw,pose.roll+.12],mat(shade(sk.accent,-12)));
  }
}
function addGarmentDetails3D(b,pose,W3,model,sk,mat,S,armorKind){
  const L=pose.local;
  if(model.bare<=.65){
    const collarCenter=mix3(L.chest,L.head,.36);
    addSphere3D(b,localPoint3D(pose,collarCenter[0],collarCenter[1],0),[.145*(model.neck||1)*S,.072*S,.2*(model.neck||1)*S],[0,pose.yaw,pose.roll],mat(model.armor>.45?sk.dark:shade(sk.primary,-24),1,model.armor>.45?.04:0,model.armor>.45?armorKind:"fabric"),detailLow3());
    const seamCenter=mix3(L.pelvis,L.chest,.54);
    addBox3D(b,localPoint3D(pose,seamCenter[0]+.262*(model.chest||1),seamCenter[1],0),[.026*S,.46*S,.02*S],[0,pose.yaw,pose.roll],mat(shade(sk.primary,-34),1,0,"fabric"));
    const hemCenter=mix3(L.pelvis,L.chest,.16);
    addSphere3D(b,localPoint3D(pose,hemCenter[0],hemCenter[1],0),[.214*(model.waist||1)*S,.028*S,.282*(model.waist||1)*S],[0,pose.torsoYaw||pose.yaw,pose.roll],mat(shade(sk.primary,-18),1,0,"fabric"),detailLow3());
    if(model.sleeves>.18){
      [[W3.shoulderBack,W3.elbowBack],[W3.shoulderFront,W3.elbowFront]].forEach(pair=>addCylinder3D(b,mix3(pair[0],pair[1],.78),mix3(pair[0],pair[1],.94),.082*S,.076*S,mat(shade(sk.primary,-22),1,0,"fabric"),12));
    }
  }
  [[L.kneeBack,W3.kneeBack,-1],[L.kneeFront,W3.kneeFront,1]].forEach(item=>{
    addMuscle3D(b,localPoint3D(pose,item[0][0]+.108,item[0][1],item[0][2]),[.056*S,.072*S,.082*S],[0,pose.yaw,pose.roll],mat(model.armor>.42?sk.accent:shade(sk.pants,-24),1,model.armor>.42?.08:0,model.armor>.42?armorKind:"leather"));
  });
  [[W3.elbowBack,-1],[W3.elbowFront,1]].forEach(item=>addSphere3D(b,item[0],[.074*S,.068*S,.074*S],[0,pose.yaw,pose.roll],mat(model.armor>.42?sk.dark:shade(sk.primary,-26),1,model.armor>.42?.04:0,model.armor>.42?armorKind:"leather"),detailLow3()));
  [[W3.kneeBack,W3.footBack],[W3.kneeFront,W3.footFront]].forEach(pair=>addCylinder3D(b,mix3(pair[0],pair[1],.8),mix3(pair[0],pair[1],.96),.072*S,.066*S,mat(model.armor>.45?sk.dark:sk.accent,1,model.armor>.45?.04:0,model.armor>.45?armorKind:"leather"),12));
  if(model.frame==="robot"||model.frame==="cyborg"||model.frame==="powerArmor"||model.frame==="suit"){
    const waist=mix3(L.pelvis,L.chest,.18);
    addSphere3D(b,localPoint3D(pose,waist[0],waist[1],0),[.205*S,.045*S,.27*S],[0,pose.yaw,pose.roll],mat(sk.dark,1,.12,"tech"),detailLow3());
    [-1,1].forEach(side=>addBox3D(b,localPoint3D(pose,L.chest[0]+.21,L.chest[1]-.02,side*.13),[.035*S,.2*S,.045*S],[0,pose.yaw,pose.roll],mat(sk.accent,1,.45,"energy")));
  }
  [[L.hipBack,L.kneeBack,-1],[L.hipFront,L.kneeFront,1]].forEach(item=>{
    const p=mix3(item[0],item[1],.34);
    addBox3D(b,localPoint3D(pose,p[0]+.055,p[1],p[2]+item[2]*.055),[.09*S,.13*S,.045*S],[0,pose.yaw,pose.roll],mat(shade(sk.pants,-14),1,0,"fabric"));
  });
  if(model.top==="jacket"||model.top==="leatherJacket"||model.top==="labCoat"||model.top==="assassinCoat"){
    [-1,1].forEach(side=>addBox3D(b,localPoint3D(pose,L.chest[0]+.19,L.chest[1]-.12,side*.11),[.055*S,.28*S,.12*S],[0,pose.yaw,pose.roll+side*.08],mat(side<0?shade(sk.primary,-18):shade(sk.primary,6),1,0,String(model.top).includes("leather")?"leather":"fabric")));
  }
}
function buildFighterPose3D(f){
  const ch=f.char,human=humanProfile(f),model=boardModel3D(f),motion=fighterMotion(f),atk=f.attack,phase=motion.attack||0,S=ch.scale||1;
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
  const shoulderHalf=(human.shoulder/95)*(1.02+ch.bulk*.2)*(model.shoulders||1),hipHalf=(human.hip/95)*(.98+ch.bulk*.18)*(model.hips||1);
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
  const twistSign=Math.sign(visualFace||1);
  const twistForY=y=>{
    const t=clamp((y-.82)/.72,0,1),smooth=t*t*(3-2*t);
    return twistSign*.5*smooth;
  };
  const poseCr=Math.cos(roll),poseSr=Math.sin(roll),poseCy=Math.cos(yaw),poseSy=Math.sin(yaw);
  let cachedTwistY=Number.NaN,cachedTwist=0,cachedCt=1,cachedSt=0;
  const toWorld=p=>{
    if(p[1]!==cachedTwistY){ cachedTwistY=p[1]; cachedTwist=twistForY(p[1]); cachedCt=Math.cos(cachedTwist); cachedSt=Math.sin(cachedTwist); }
    const sx0=p[0]*S,sy=p[1]*S,sz0=p[2]*S;
    const sx=sx0*cachedCt-sz0*cachedSt,sz=sx0*cachedSt+sz0*cachedCt;
    const rx=sx*poseCr-sy*poseSr,ry=sx*poseSr+sy*poseCr;
    return [root[0]+rx*poseCy+sz*poseSy,root[1]+ry,root[2]-rx*poseSy+sz*poseCy];
  };
  const world={}; Object.keys(local).forEach(k=>world[k]=toWorld(local[k]));
  const velocityLag=clamp(-(((f.vx||0)+(f.kvx||0))*(f.facing||1))*.007,-.075,.075);
  const hairSway=clamp(velocityLag+Math.sin(renderTicker*.09+(f.id||0)*1.7)*.008-motion.dash*.035,-.11,.11);
  const clothSway=clamp(velocityLag*1.2+Math.sin(renderTicker*.075+(f.id||0))*.012-motion.dash*.06,-.13,.13);
  return {motion,human,model,cb,phase,yaw,torsoYaw:yaw-twistSign*.43,headYaw:yaw-twistSign*.52+clamp((motion.head||0)*.1,-.16,.16),twist:twistSign*.5,roll,root,visualFace,local,world,toWorld,punchExt,kickExt,upperExt,breathScale:1+Math.sin(motion.breath)*.014,hairSway,clothSway};
}
function strideSign3(f){ return Math.sign(((f.vx||0)+(f.kvx||0))*(f.facing||1))||1; }
function addFighter3D(opaque,trans,f){
  const pose=buildFighterPose3D(f),ch=f.char,sk=f.skin,human=pose.human,model=pose.model||boardModel3D(f),W3=pose.world,L=pose.local,S=ch.scale||1;
  const mat=(hex,alpha,emi,kind)=>withMaterial3(parseColor3(f.hitFlash>0&&typeof shade==="function"?shade(hex,42):hex,alpha==null?1:alpha,(emi||0)+(f.hitFlash>0?.22:0)),kind||"plain");
  const vertexStart3d=opaque.count+trans.count;
  const muscle=model.muscle||.75,limbScale=(human.limb||1)*(.82+muscle*.24);
  const torsoHex=model.bare>.65?sk.skin:sk.primary;
  const upperArmHex=model.bare>.5?sk.skin:(model.sleeves>.22?sk.primary:sk.skin);
  const forearmHex=(model.armor>.48||model.sleeves>.72)?sk.dark:sk.skin;
  const legHex=(model.frame==="robot"||model.frame==="powerArmor"||model.frame==="suit")?sk.primary:(model.skirt>.82&&model.bare>.2)?sk.skin:sk.pants;
  const armorHex=(model.frame==="robot"||model.frame==="powerArmor"||model.frame==="suit")?sk.primary:(model.armor>.58?"#8fa8ba":sk.dark);
  const furHex="#6d5849";
  const techFrame=model.frame==="robot"||model.frame==="powerArmor"||model.frame==="cyborg"||model.frame==="suit";
  const armorKind=techFrame?"tech":"metal";
  const torsoKind=model.bare>.65?"skin":(model.armor>.55?armorKind:(String(model.top).includes("leather")||String(model.top).includes("jacket")?"leather":"fabric"));
  const upperArmKind=upperArmHex===sk.skin?"skin":(model.armor>.55?armorKind:"fabric");
  const forearmKind=forearmHex===sk.skin?"skin":(model.armor>.48?armorKind:"fabric");
  const legKind=legHex===sk.skin?"skin":(model.armor>.55?armorKind:"fabric");
  renderStats.boardModel3d=ch.id+":"+model.frame+"/"+model.top+"/"+model.weapon;
  renderStats.boardModels3d=Object.keys(BOARD_MODEL3D).length;
  const air=Math.max(0,pose.root[1]),heightFactor=clamp(1-air/2.6,.25,1),vec=typeof arenaShadowVector==="function"?arenaShadowVector():{x:-.4,len:1};
  addSphere3D(trans,[pose.root[0]+vec.x*(.22+air*.18),.022,.02],[.58*vec.len*(.55+heightFactor*.45)*S,.025,.34*S],[0,vec.x*.08,0],parseColor3("#000000",.34*heightFactor,0),detailLow3());
  if(f.grounded)[W3.footBack,W3.footFront].forEach(ft=>addSphere3D(trans,[ft[0],.018,ft[2]],[.17*S,.018,.09*S],[0,pose.yaw,0],parseColor3("#000000",.3,0),DETAIL3_MICRO));
  if(!f.dead)addBoardCloth3D(opaque,pose,W3,model,sk,mat,S);
  addBackGear3D(opaque,pose,W3,model,sk,mat,S);

  const legR=.084*limbScale*S,armR=.066*limbScale*S;
  addAnatomyLimb3D(opaque,W3.hipBack,W3.kneeBack,legR*1.13,legR*.9,mat(shade(legHex,-18),1,0,legKind),"thigh",muscle);
  addAnatomyLimb3D(opaque,W3.kneeBack,W3.footBack,legR*.88,legR*.62,mat(shade(legHex,-18),1,0,legKind),"calf",muscle);
  addAnatomyLimb3D(opaque,W3.hipFront,W3.kneeFront,legR*1.16,legR*.92,mat(legHex,1,0,legKind),"thigh",muscle);
  addAnatomyLimb3D(opaque,W3.kneeFront,W3.footFront,legR*.9,legR*.64,mat(legHex,1,0,legKind),"calf",muscle);
  addMuscle3D(opaque,W3.kneeBack,legR*1.03,[0,pose.yaw,0],mat(shade(legHex,-34)));
  addMuscle3D(opaque,W3.kneeFront,legR*1.05,[0,pose.yaw,0],mat(shade(legHex,-24)));
  if(model.armor>.42){
    addCylinder3D(opaque,mix3(W3.hipBack,W3.kneeBack,.1),mix3(W3.hipBack,W3.kneeBack,.56),legR*1.08,legR*.98,mat(shade(armorHex,-16),1,.04,armorKind),12);
    addCylinder3D(opaque,mix3(W3.hipFront,W3.kneeFront,.1),mix3(W3.hipFront,W3.kneeFront,.56),legR*1.1,legR,mat(armorHex,1,.05,armorKind),12);
    addCylinder3D(opaque,mix3(W3.kneeBack,W3.footBack,.1),mix3(W3.kneeBack,W3.footBack,.83),legR*.94,legR*.76,mat(shade(armorHex,-14),1,.04,armorKind),12);
    addCylinder3D(opaque,mix3(W3.kneeFront,W3.footFront,.1),mix3(W3.kneeFront,W3.footFront,.83),legR*.96,legR*.78,mat(armorHex,1,.05,armorKind),12);
  }
  if(model.fur){
    [W3.footBack,W3.footFront].forEach(ft=>addMuscle3D(opaque,[ft[0],ft[1]+.09*S,ft[2]],[.11*S,.13*S,.1*S],[0,pose.yaw,0],mat(furHex)));
  }
  [L.footBack,L.footFront].forEach(localFoot=>addBoot3D(opaque,pose,localFoot,mat(model.armor>.55?armorHex:sk.accent,1,model.armor>.55?.05:0,model.armor>.55?armorKind:"leather"),mat("#151923",1,0,"rubber"),S,model.armor>.45));

  addMuscle3D(opaque,W3.shoulderBack,[armR*1.28,armR*1.16,armR*1.28],[0,pose.torsoYaw||pose.yaw,0],mat(shade(upperArmHex,-14),1,0,upperArmKind));
  addAnatomyLimb3D(opaque,W3.shoulderBack,W3.elbowBack,armR*1.12,armR*.9,mat(shade(upperArmHex,-14),1,0,upperArmKind),"upper",muscle);
  addAnatomyLimb3D(opaque,W3.elbowBack,W3.handBack,armR*.9,armR*.7,mat(shade(forearmHex,-14),1,0,forearmKind),"forearm",muscle);
  addCylinder3D(opaque,mix3(W3.elbowBack,W3.handBack,.76),mix3(W3.elbowBack,W3.handBack,.94),armR*.9,armR*.84,mat(sk.dark,1,0,"leather"),10);
  addHand3D(opaque,pose,-1,mat(sk.glove,1,0,model.armor>.55?armorKind:"leather"),S,model.armor>.6);

  addSphere3D(opaque,mix3(W3.hipBack,W3.hipFront,.5),[.225*(model.hips||1)*S,.165*S,.285*(model.hips||1)*S],[0,pose.yaw,pose.roll],mat(sk.pants,1,0,"fabric"),bodyDetail3());
  [-1,1].forEach(side=>addMuscle3D(opaque,localPoint3D(pose,L.pelvis[0]-.12,L.pelvis[1]-.02,side*.125*(model.hips||1)),[.105*S,.115*S,.105*(model.hips||1)*S],[0,pose.yaw,pose.roll],mat(shade(sk.pants,-8),1,0,"fabric")));
  addLoftedTorso3D(opaque,pose,model,mat(torsoHex,1,techFrame?.04:0,torsoKind),S);
  addMuscle3D(opaque,mix3(W3.neck,W3.chest,.38),[.178*(model.neck||1)*S,.118*S,.275*(model.shoulders||1)*S],[0,pose.torsoYaw||pose.yaw,pose.roll],mat(shade(torsoHex,-12),1,0,torsoKind));
  [-1,1].forEach(side=>{
    const pecR=model.frame==="feminine"?[.056*(model.chest||1)*S,.074*S,.064*S]:[.1*(model.chest||1)*S,.088*S,.108*S];
    addMuscle3D(opaque,localPoint3D(pose,L.chest[0]+(model.frame==="feminine"?.205:.192),L.chest[1]-(model.frame==="feminine"?.045:.005),side*.098*(model.shoulders||1)),pecR,[0,pose.torsoYaw||pose.yaw,pose.roll],mat(shade(torsoHex,4),1,techFrame?.04:0,torsoKind));
  });
  if(model.bare>.5){
    [.3,.44,.58].forEach(t=>[-1,1].forEach(side=>{
      const p=mix3(L.pelvis,L.chest,t); addMuscle3D(opaque,localPoint3D(pose,p[0]+.19,p[1],side*.058),[.047*S,.055*S,.046*S],[0,pose.yaw,pose.roll],mat(shade(sk.skin,-7),1,0,"skin"));
    }));
  }
  if(model.armor>.3){
    addMuscle3D(opaque,localPoint3D(pose,L.chest[0]+.19,L.chest[1],0),[.112*S,.23*S,.27*(model.shoulders||1)*S],[0,pose.torsoYaw||pose.yaw,pose.roll],mat(shade(armorHex,-6),1,.06,armorKind));
    addMuscle3D(opaque,localPoint3D(pose,L.chest[0]-.19,L.chest[1],0),[.108*S,.22*S,.26*(model.shoulders||1)*S],[0,pose.torsoYaw||pose.yaw,pose.roll],mat(shade(armorHex,-24),1,.04,armorKind));
    addBox3D(opaque,localPoint3D(pose,L.chest[0]+.285,L.chest[1],0),[.038*S,.36*S,.03*S],[0,pose.yaw,pose.roll],mat(shade(armorHex,18),1,.08,armorKind));
    [.32,.44,.56].forEach((t,i)=>{ const pp=mix3(L.pelvis,L.chest,t); addBox3D(opaque,localPoint3D(pose,pp[0]+.205,pp[1],0),[.075*S,.028*S,.34*(model.hips||1)*S],[0,pose.yaw,pose.roll],mat(i===1?sk.accent:shade(armorHex,-14),1,i===1?.12:.04,armorKind)); });
    [.36,.52].forEach((t,i)=>{ const p=mix3(L.pelvis,L.chest,t); addBox3D(opaque,localPoint3D(pose,p[0],p[1],0),[.25*S,.034*S,.4*(model.hips||1)*S],[0,pose.yaw,pose.roll],mat(i?sk.accent:armorHex,1,i?.08:.04,armorKind)); });
  }
  if(model.fur||model.top==="fur"||model.top==="furArmor"){
    addMuscle3D(opaque,mix3(W3.neck,W3.chest,.24),[.21*S,.15*S,.34*(model.shoulders||1)*S],[0,pose.yaw,pose.roll],mat(furHex,1,0,"fur"));
    [-.18,-.09,0,.09,.18].forEach(z=>addMuscle3D(opaque,localPoint3D(pose,L.chest[0]-.02,L.chest[1]-.13,z),[.085*S,.09*S,.07*S],[0,pose.yaw,pose.roll],mat(shade(furHex,z===0?8:-8),1,0,"fur")));
    addFurTufts3D(opaque,[L.chest[0]+.02,L.chest[1]+.08,0],pose,mat(shade(furHex,-8),1,0,"fur"),S,qualityLevel===2?11:8,.34*(model.shoulders||1));
  }
  if(model.frame==="robot"||model.frame==="cyborg"||model.frame==="powerArmor"||model.frame==="suit"){
    [-1,1].forEach(side=>addBox3D(opaque,localPoint3D(pose,L.chest[0],L.chest[1],side*.332*(model.shoulders||1)),[.2*S,.31*S,.04*S],[0,pose.yaw,pose.roll],mat(side<0?sk.dark:sk.accent,1,side>0?.18:.03,"tech")));
    if(model.gear==="core")addSphere3D(opaque,localPoint3D(pose,L.chest[0]+.19,L.chest[1]+.02,0),.047*S,[0,0,0],mat(sk.accent,1,.7),DETAIL3_MICRO);
  }
  addBox3D(opaque,pose.toWorld([L.pelvis[0],L.pelvis[1]+.1,0]),[.31*S,.062*S,.47*(model.hips||1)*S],[0,pose.yaw,pose.roll],mat("#111827",1,0,"leather"));
  addBox3D(opaque,pose.toWorld([L.pelvis[0]+.15,L.pelvis[1]+.1,0]),[.07*S,.09*S,.16*S],[0,pose.yaw,pose.roll],mat(sk.accent,1,.12));
  addGarmentDetails3D(opaque,pose,W3,model,sk,mat,S,armorKind);
  addBoardGearDetails3D(opaque,pose,W3,model,sk,mat,S);

  addMuscle3D(opaque,W3.shoulderFront,[armR*1.32,armR*1.18,armR*1.32],[0,pose.torsoYaw||pose.yaw,0],mat(upperArmHex,1,0,upperArmKind));
  if(model.armor>.34){
    [[W3.shoulderBack,L.shoulderBack],[W3.shoulderFront,L.shoulderFront]].forEach(pair=>{
      const sw=pair[0],sl=pair[1],size=(.086+model.armor*.042)*limbScale*S;
      addMuscle3D(opaque,[sw[0],sw[1]+.045*S,sw[2]],[size*.82,size*.58,size],[0,pose.yaw,0],mat(armorHex,1,.07));
      addMuscle3D(opaque,localPoint3D(pose,sl[0],sl[1]-.055,sl[2]),[size*.72,size*.42,size*.88],[0,pose.yaw,0],mat(shade(armorHex,-18),1,.04));
    });
  }
  addAnatomyLimb3D(opaque,W3.shoulderFront,W3.elbowFront,armR*1.14,armR*.92,mat(upperArmHex,1,0,upperArmKind),"upper",muscle);
  addAnatomyLimb3D(opaque,W3.elbowFront,W3.handFront,armR*.92,armR*.72,mat(forearmHex,1,0,forearmKind),"forearm",muscle);
  addCylinder3D(opaque,mix3(W3.elbowFront,W3.handFront,.76),mix3(W3.elbowFront,W3.handFront,.94),armR*.94,armR*.87,mat(model.armor>.45?armorHex:sk.accent,1,model.armor>.45?.05:0,model.armor>.45?armorKind:"leather"),10);
  addHand3D(opaque,pose,1,mat(sk.glove,1,0,model.armor>.55?armorKind:"leather"),S,model.armor>.6);

  const neckR=((human.neck||9)/138)*(model.neck||1)*S;
  addCylinder3D(opaque,W3.neck,W3.head,neckR,neckR*1.08,mat(model.frame==="robot"||model.frame==="powerArmor"?sk.dark:shade(sk.skin,-12),1,0,model.frame==="robot"||model.frame==="powerArmor"?"tech":"skin"),12);
  addMuscle3D(opaque,mix3(W3.neck,W3.head,.18),neckR*1.12,[0,pose.headYaw||pose.yaw,pose.roll],mat(model.frame==="robot"||model.frame==="powerArmor"?sk.dark:shade(sk.skin,-12),1,0,model.frame==="robot"||model.frame==="powerArmor"?"tech":"skin"));
  [-1,1].forEach(side=>addLoftedTube3D(opaque,[localPoint3D(pose,L.neck[0]-.02,L.neck[1]-.03,side*.055),localPoint3D(pose,L.head[0]+.015,L.head[1]-.085,side*.045)],[neckR*.42,neckR*.3],mat(shade(sk.skin,-16),1,0,"skin"),7,[1,0,0]));
  const headR=(human.headR||15)/95*S*.86;
  addSculptedHead3D(opaque,pose,human,mat(sk.skin,1,0,"skin"),S,headR);
  addSphere3D(opaque,localPoint3D(pose,L.head[0]+.088,L.head[1]-.108,0),[headR*.24,headR*.17,headR*.3],[0,pose.headYaw||pose.yaw,pose.roll],mat(shade(sk.skin,-3),1,0,"skin"),detailLow3());
  const coveredHead=model.head==="robot"||model.head==="helmet"||model.head==="dome"||model.head==="hoodMask"||model.head==="wraps";
  if(!coveredHead)addFaceDetails3D(opaque,pose,model,sk,mat,S,headR);
  if(!coveredHead&&model.hair!=="none"&&model.hair!=="alien"){
    addMuscle3D(opaque,pose.toWorld([L.head[0]-.055,L.head[1]+.098,0]),[headR*1.02,headR*.83,headR*1.05],[0,pose.headYaw||pose.yaw,pose.roll],mat(sk.hair,1,0,"hair"));
    addMuscle3D(opaque,pose.toWorld([L.head[0]-.115,L.head[1]+.008,0]),[headR*.55,headR*.8,headR*.94],[0,pose.headYaw||pose.yaw,pose.roll],mat(shade(sk.hair,-8),1,0,"hair"));
    addHairLocks3D(opaque,pose,model,sk,mat,S,headR);
  }
  addHeadGear3D(opaque,pose,W3,model,sk,mat,S,headR);
  addWeapon3D(opaque,pose,W3,model,sk,mat,S);
  const motif=typeof boardOutfitMotif==="function"?boardOutfitMotif(f):"eclair";
  if(model.gear==="core"||model.gear==="orb"||model.gear==="crystal"||model.gear==="sun"||model.gear==="jewel"||motif==="circuit"||motif==="rune"){
    addCylinder3D(opaque,[W3.chest[0],W3.chest[1]+.045*S,W3.chest[2]+.325*(model.shoulders||1)*S],[W3.chest[0],W3.chest[1]+.045*S,W3.chest[2]+.375*(model.shoulders||1)*S],.062*S,.062*S,mat(sk.dark,1,.08,"tech"),12);
    addCylinder3D(opaque,[W3.chest[0],W3.chest[1]+.045*S,W3.chest[2]+.375*(model.shoulders||1)*S],[W3.chest[0],W3.chest[1]+.045*S,W3.chest[2]+.4*(model.shoulders||1)*S],.052*S,.052*S,mat(sk.accent,1,.42,"energy"),12);
  }
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
  renderStats.lastFighterVertices3d=(opaque.count+trans.count)-vertexStart3d;
  renderStats.anatomie3d="loftée AAA";
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
const R3D_POINT_DATA={pos:[],col:[],sizes:[],count:0};
function buildParticles3D(){
  const pos=R3D_POINT_DATA.pos,col=R3D_POINT_DATA.col,sizes=R3D_POINT_DATA.sizes;
  pos.length=0; col.length=0; sizes.length=0;
  if(typeof particles==="undefined"){ R3D_POINT_DATA.count=0; return R3D_POINT_DATA; }
  particles.forEach((p,i)=>{
    const wp=worldFromGame3D(p.x,p.y,(rand3(i*31+p.life)-.5)*.35),c=parseColor3(p.c,clamp(p.life/(p.max||30),0,1),0);
    pos.push(wp[0],wp[1],wp[2]); col.push(c[0],c[1],c[2],c[3]); sizes.push(Math.max(.025,(p.r||3)*2/95));
  });
  R3D_POINT_DATA.count=particles.length; return R3D_POINT_DATA;
}
function computeCamera3D(){
  const midGame=(p1.rx+p2.rx)/2,mid=(midGame-640)*R3D_WORLD,avgAir=((GROUND-p1.ry)+(GROUND-p2.ry))/2*R3D_WORLD;
  const shakeAmt=(typeof shake!=="undefined"?shake:0)*(SETTINGS.shake/100);
  const eye=[mid*.9+(Math.random()-.5)*shakeAmt*.012,1.94+clamp(avgAir,.0,1.4)*.15+(Math.random()-.5)*shakeAmt*.008,clamp(7.35/Math.max(.75,cam.zoom||1),5.2,9.2)];
  const target=[mid,1.04+clamp(avgAir,0,1.4)*.26,0];
  R3D.camPos=eye; renderer3DState.camera={x:eye[0],y:eye[1],z:eye[2]};
  const proj=mat4Perspective3(42*Math.PI/180,W/H,.1,70); R3D.view=mat4LookAt3(eye,target,[0,1,0]); R3D.vp=mat4Multiply3(proj,R3D.view);
  const mood=arenaMoodTheme();
  R3D.fogColor=parseColor3(mood.sky[mood.sky.length-1][1]).slice(0,3);
  if(currentArenaMood==="jour"){ R3D.lightDir=[-.38,.9,.34]; R3D.lightColor=[1,.94,.78]; R3D.fillColor=[.42,.62,.9]; }
  else if(currentArenaMood==="nuit"){ R3D.lightDir=[.32,.72,.45]; R3D.lightColor=[.62,.74,1]; R3D.fillColor=[.92,.38,.72]; }
  else { R3D.lightDir=[-.72,.38,.3]; R3D.lightColor=[1,.68,.42]; R3D.fillColor=[.3,.48,.95]; }
}
function drawPoints3D(points){
  if(!points.count)return;
  const gl=R3D.gl,prog=R3D.pointProgram,st=R3D.points._dyn||(R3D.points._dyn={}); gl.useProgram(prog.prog);
  gl.uniformMatrix4fv(prog.uniforms.uVP,false,R3D.vp); gl.uniform1f(prog.uniforms.uScale,(R3D.canvas.height||720)*1.0);
  _uploadDynamicAttr3D(gl,gl.ARRAY_BUFFER,R3D.points.pos,st,"pos",points.pos,Float32Array); gl.enableVertexAttribArray(prog.attribs.aPos); gl.vertexAttribPointer(prog.attribs.aPos,3,gl.FLOAT,false,0,0);
  _uploadDynamicAttr3D(gl,gl.ARRAY_BUFFER,R3D.points.col,st,"col",points.col,Float32Array); gl.enableVertexAttribArray(prog.attribs.aColor); gl.vertexAttribPointer(prog.attribs.aColor,4,gl.FLOAT,false,0,0);
  _uploadDynamicAttr3D(gl,gl.ARRAY_BUFFER,R3D.points.size,st,"size",points.sizes,Float32Array); gl.enableVertexAttribArray(prog.attribs.aSize); gl.vertexAttribPointer(prog.attribs.aSize,1,gl.FLOAT,false,0,0);
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
    const opaque=resetBatch3D(R3D_DYN_OPAQUE),trans=resetBatch3D(R3D_DYN_TRANS);
    const first=p1.ry>=p2.ry?p1:p2,second=first===p1?p2:p1;
    addFighter3D(opaque,trans,first); addFighter3D(opaque,trans,second); addProjectilesAndEffects3D(trans);
    uploadBatch3D(gl,R3D.dyn,opaque,gl.DYNAMIC_DRAW); uploadBatch3D(gl,R3D.dynTrans,trans,gl.DYNAMIC_DRAW);
    renderShadowMap3D(gl);
    const mood=arenaMoodTheme(),sky=parseColor3(mood.sky[mood.sky.length-1][1]);
    gl.clearColor(sky[0],sky[1],sky[2],1); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.disable(gl.CULL_FACE); gl.disable(gl.BLEND);
    disableVertexAttribs3D(gl); gl.useProgram(R3D.program.prog);
    gl.activeTexture(gl.TEXTURE0); if(R3D.materialTexture)gl.bindTexture(gl.TEXTURE_2D,R3D.materialTexture); gl.uniform1i(R3D.program.uniforms.uAtlas,0);
    gl.activeTexture(gl.TEXTURE1); if(R3D.shadow)gl.bindTexture(gl.TEXTURE_2D,R3D.shadow.texture); gl.uniform1i(R3D.program.uniforms.uShadowMap,1); gl.activeTexture(gl.TEXTURE0);
    if(!R3D.lightVP)computeLightVP3D();
    gl.uniformMatrix4fv(R3D.program.uniforms.uVP,false,R3D.vp); gl.uniformMatrix4fv(R3D.program.uniforms.uLightVP,false,R3D.lightVP); gl.uniform3fv(R3D.program.uniforms.uCamPos,R3D.camPos);
    gl.uniform3fv(R3D.program.uniforms.uLightDir,R3D.lightDir); gl.uniform3fv(R3D.program.uniforms.uLightColor,R3D.lightColor); gl.uniform3fv(R3D.program.uniforms.uFillColor,R3D.fillColor); gl.uniform3fv(R3D.program.uniforms.uFogColor,R3D.fogColor);
    gl.uniform1f(R3D.program.uniforms.uShadowEnabled,R3D.shadowEnabled&&R3D.shadow?1:0); gl.uniform1f(R3D.program.uniforms.uShadowTexel,R3D.shadow?1/R3D.shadow.size:.001);
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
