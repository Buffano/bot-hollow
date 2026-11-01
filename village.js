// Bot Hollow: an original top-down pixel village. All art is drawn in code.
const W=400,H=240,T=8,COLS=W/T,ROWS=H/T;
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
const low=document.createElement('canvas');low.width=W;low.height=H;const g=low.getContext('2d');
const bg=document.createElement('canvas');bg.width=W;bg.height=H;const b=bg.getContext('2d');
let S=3;
function fit(){const st=document.getElementById('stage');S=Math.max(2,Math.floor(Math.min((st.clientWidth-16)/W,(st.clientHeight-16)/H)));cv.width=W*S;cv.height=H*S;}
window.addEventListener('resize',fit);
// seeded rng
let seed=1337;function rnd(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;}
function px(c,x,y,w=1,h=1,col){c.fillStyle=col;c.fillRect(x|0,y|0,w,h);}
const P={g1:'#5fae4a',g2:'#6fbe52',g3:'#4e9a40',g4:'#89cf5e',d1:'#e2c387',d2:'#c9a565',d3:'#f0d9a2',w1:'#3f8fd8',w2:'#5cb0ec',w3:'#2c6fb4',out:'#2a1d14',
 t1:'#2f7a3a',t2:'#3f9446',t3:'#5bb04e',t4:'#1f5a2c',tr:'#6b4526',skin:'#f6c9a0',stone:'#b8b0a0',stone2:'#8f8778'};
// ---- map ----
const map=[];for(let y=0;y<ROWS;y++){map.push(new Array(COLS).fill(0));}
const HOUSES={ // tile coords of top-left, size in px
 Friday:{x:176,y:34,w:48,h:40},Gladdus:{x:56,y:42,w:42,h:36},Coach:{x:300,y:42,w:42,h:36},
 Clima:{x:30,y:112,w:36,h:42},ResI:{x:330,y:110,w:42,h:36},Dos:{x:96,y:166,w:40,h:34},Mark:{x:236,y:166,w:40,h:34}};
function door(h){return {x:h.x+h.w/2,y:h.y+h.h};}
function carve(x0,y0,x1,y1){for(let y=Math.min(y0,y1);y<=Math.max(y0,y1);y++)for(let x=Math.min(x0,x1);x<=Math.max(x0,x1);x++)if(map[y]&&map[y][x]!==undefined&&map[y][x]!==3)map[y][x]=1;}
// forest border
for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){if(y<3||x<2||x>=COLS-2||(y>=ROWS-1))map[y][x]=3;}
for(let x=0;x<COLS;x++){if(rnd()<.5)map[3][x]=3;}
// pond
const pond={cx:340,cy:196,rx:30,ry:16};
for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const dx=(x*T+4-pond.cx)/pond.rx,dy=(y*T+4-pond.cy)/pond.ry;if(dx*dx+dy*dy<1)map[y][x]=2;}
// main street rows 18-19 and plaza
carve(2,18,COLS-3,19);
const plaza={x:200,y:118};carve(21,12,28,17);
for(const k in HOUSES){const d=door(HOUSES[k]);const tx=Math.floor(d.x/T),ty=Math.floor(d.y/T);carve(tx,ty,tx,ty<18?18:ty);if(ty>19)carve(tx,19,tx,ty);}
carve(24,9,25,12); // to Friday
carve(2,18,2,19);
function walkable(x,y){const tx=Math.floor(x/T),ty=Math.floor(y/T);if(!map[ty]||map[ty][tx]===undefined)return false;if(map[ty][tx]>=2)return false;
 for(const k in HOUSES){const h=HOUSES[k];if(x>h.x-3&&x<h.x+h.w+3&&y>h.y-2&&y<h.y+h.h+2)return false;}
 if(Math.hypot(x-plaza.x,(y-plaza.y-14)*1.4)<12)return false;return true;}
// ---- background render ----
function tileAt(x,y){return map[y]&&map[y][x]!==undefined?map[y][x]:3;}
function drawGround(){
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const X=x*T,Y=y*T;
  px(b,X,Y,T,T,P.g1);
  for(let i=0;i<5;i++)px(b,X+rnd()*8,Y+rnd()*8,1,1,rnd()<.5?P.g2:P.g3);
  if(rnd()<.18){const a=X+rnd()*5,c=Y+rnd()*5;px(b,a,c+1,1,2,P.g3);px(b,a+2,c,1,3,P.g3);px(b,a+1,c+1,1,2,P.g4);} }
 // paths with soft edges
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(map[y][x]===1){const X=x*T,Y=y*T;px(b,X,Y,T,T,P.d1);
  for(let i=0;i<4;i++)px(b,X+rnd()*8,Y+rnd()*8,1,1,rnd()<.5?P.d2:P.d3);
  if(tileAt(x,y-1)!==1){px(b,X,Y,T,1,P.d2);for(let i=0;i<8;i+=2)px(b,X+i,Y-1,1,1,P.g3);}
  if(tileAt(x,y+1)!==1){px(b,X,Y+7,T,1,P.d2);}
  if(tileAt(x-1,y)!==1)px(b,X,Y,1,T,P.d2);
  if(tileAt(x+1,y)!==1)px(b,X+7,Y,1,T,P.d2);}
 // plaza stones
 for(let y=12;y<=17;y++)for(let x=21;x<=28;x++){const X=x*T,Y=y*T;px(b,X,Y,T,T,'#d9cdb2');px(b,X,Y,T,1,'#c2b494');px(b,X,Y,1,T,'#c2b494');px(b,X+(y%2?4:0),Y+4,1,4,'#c2b494');}
 // pond
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(map[y][x]===2){const X=x*T,Y=y*T;px(b,X,Y,T,T,P.w1);
  if(tileAt(x,y-1)!==2){px(b,X,Y,T,2,'#9a7a4a');px(b,X,Y+2,T,1,P.w3);}
  if(tileAt(x,y+1)!==2)px(b,X,Y+7,T,1,'#2c6fb4');if(tileAt(x-1,y)!==2)px(b,X,Y,1,T,'#9a7a4a');if(tileAt(x+1,y)!==2)px(b,X+7,Y,1,T,'#9a7a4a');}
 // lily pads
 [[326,192],[352,200],[338,204]].forEach(([x,y])=>{px(b,x,y,5,3,'#3f9a3a');px(b,x+1,y-1,3,1,'#3f9a3a');px(b,x+2,y,1,1,P.w1);});px(b,353,199,2,1,'#f5a0c0');
 // flowers
 const fc=['#f5e050','#ff8fb0','#ffffff','#ff6a5a','#b98cf0'];
 for(let i=0;i<140;i++){const x=rnd()*W,y=rnd()*H;if(!walkable(x,y)||tileAt(Math.floor(x/T),Math.floor(y/T))!==0)continue;const c=fc[(rnd()*fc.length)|0];
  px(b,x,y+1,1,2,P.g3);px(b,x-1,y,1,1,c);px(b,x+1,y,1,1,c);px(b,x,y-1,1,1,c);px(b,x,y+1,1,1,c);px(b,x,y,1,1,'#f8d040');}
 // fences around pond
 for(let x=304;x<=376;x+=6){fencePost(x,174);} px(b,304,176,74,1,'#8a5a30');
}
function fencePost(x,y){px(b,x,y,2,6,'#a8703c');px(b,x,y,2,1,'#c89058');px(b,x,y+5,2,1,P.out);}
function tree(c,x,y,s=1){ // round canopy tree, original design
 px(c,x-6*s,y+9*s,12*s,3*s,'rgba(0,0,0,.18)');
 px(c,x-1*s,y+4*s,3*s,7*s,P.tr);px(c,x-1*s,y+4*s,1*s,7*s,'#8a5a34');
 const r=8*s;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const d=dx*dx+dy*dy*1.15;if(d<=r*r){let col=P.t2;if(d>r*r*.72)col=P.t4;else if(dx+dy<-r*.6)col=P.t3;else if(dx+dy>r*.5)col=P.t1;px(c,x+dx,y+dy-2*s,1,1,col);}}
 px(c,x-4*s,y-6*s,2,1,'#7fcc62');px(c,x-2*s,y-7*s,2,1,'#7fcc62');
}
function drawForest(){const list=[];for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(map[y][x]===3&&rnd()<.55)list.push([x*T+4+rnd()*4-2,y*T+rnd()*4]);
 for(let x=0;x<W;x+=11)list.push([x+rnd()*4,-2+rnd()*6]);
 list.sort((a,b)=>a[1]-b[1]).forEach(([x,y])=>tree(b,x,y));
 // a few interior trees and bushes
 [[150,96],[262,94],[120,132],[290,140],[30,180],[190,200]].forEach(([x,y])=>{if(walkable(x,y+8))tree(b,x,y);});
}
// houses: distinct roofs, all original
function house(c,name,h,look){const {x,y,w,h:hh}=h;const roofH=Math.floor(hh*.5),wallY=y+roofH,wallH=hh-roofH;
 px(c,x+2,y+hh-1,w,3,'rgba(0,0,0,.22)');
 // walls
 const wall={library:'#efe2c4',gym:'#f0d8b8',tower:'#e8e4dc',workshop:'#d8b48a',cafe:'#f4e0d0',shop:'#f2e6c8',manor:'#f6ead0'}[look.house]||'#efe2c4';
 px(c,x+2,wallY,w-4,wallH,wall);px(c,x+2,wallY,1,wallH,P.out);px(c,x+w-3,wallY,1,wallH,P.out);px(c,x+2,wallY+wallH-1,w-4,1,P.out);
 for(let i=wallY+3;i<wallY+wallH-1;i+=4)px(c,x+3,i,w-6,1,'rgba(120,80,40,.12)');
 if(look.house==='workshop')for(let i=x+4;i<x+w-4;i+=5)px(c,i,wallY,1,wallH-1,'#b8915e');
 // roof: rounded thatch/shingle rows
 const rc=look.roof,dark=shade(rc,-30),lite=shade(rc,30);
 for(let r=0;r<roofH;r++){const inset=Math.max(0,Math.floor((roofH-r)*0.35)-1);const rx=x+inset,rw=w-inset*2;px(c,rx,y+r,rw,1,r%4===3?dark:rc);
  for(let i=rx+((r>>2)%2?2:0);i<rx+rw;i+=4)if(r%4===3)px(c,i,y+r-1,1,1,dark);
  px(c,rx,y+r,1,1,P.out);px(c,rx+rw-1,y+r,1,1,P.out);}
 px(c,x+Math.floor(roofH*.35),y,w-2*Math.floor(roofH*.35),1,P.out);
 px(c,x+4,y+2,w-8,1,lite);px(c,x,wallY-1,w,2,dark);px(c,x,wallY+1,w,1,'rgba(0,0,0,.25)');
 // door
 const dx=x+w/2-3,dy=y+hh-9;px(c,dx-1,dy-1,8,10,P.out);px(c,dx,dy,6,9,'#8a5228');px(c,dx,dy,6,1,'#a86a38');px(c,dx+4,dy+4,1,1,'#f0d060');
 px(c,dx-2,y+hh,10,2,P.stone);
 // windows (glow at night handled in overlay)
 const wy=wallY+3;[[x+6,wy],[x+w-12,wy]].forEach(([a,bq])=>{if(wallH<12)return;px(c,a-1,bq-1,8,7,P.out);px(c,a,bq,6,5,'#8fd0f0');px(c,a+3,bq,1,5,P.out);px(c,a,bq+2,6,1,P.out);px(c,a,bq,2,1,'#d8f4ff');px(c,a-1,bq+5,8,2,'#7a4a24');px(c,a,bq+5,1,1,'#ff8fb0');px(c,a+3,bq+5,1,1,'#f5e050');px(c,a+5,bq+5,1,1,'#ff6a5a');});
 // chimney + per-house flair
 if(look.house!=='tower'){px(c,x+w-12,y-4,5,8,'#9a6a4a');px(c,x+w-13,y-5,7,2,'#6b4526');}
 if(look.house==='tower'){px(c,x+w/2-1,y-10,2,10,'#6a6a70');px(c,x+w/2-5,y-10,10,1,'#6a6a70');px(c,x+w/2+4,y-12,3,3,'#f0f0f0');px(c,x+w/2-7,y-12,3,3,'#f0f0f0');} // anemometer
 if(look.house==='library'){px(c,x+w/2-6,wallY-6,12,5,'#f6ead0');px(c,x+w/2-6,wallY-6,12,1,P.out);px(c,x+w/2-4,wallY-5,3,3,'#c84a3a');px(c,x+w/2,wallY-5,3,3,'#3a72c8');}
 if(look.house==='gym'){px(c,x+w/2-7,wallY-5,14,3,'#555');px(c,x+w/2-9,wallY-7,3,7,'#333');px(c,x+w/2+6,wallY-7,3,7,'#333');}
 if(look.house==='cafe'){for(let i=x+2;i<x+w-2;i+=4){px(c,i,wallY+1,2,3,'#ffffff');px(c,i+2,wallY+1,2,3,rc);}}
 if(look.house==='shop'){px(c,x+w+1,wallY+4,6,6,'#e8d090');px(c,x+w+1,wallY+4,6,1,P.out);px(c,x+w+3,wallY+6,2,2,'#c83a50');}
 if(look.house==='manor'){px(c,x+w/2-1,y-8,2,8,'#7a5a3a');px(c,x+w/2+1,y-8,6,4,'#ffd34a');px(c,x+w/2+1,y-8,6,1,'#c8962a');}
 if(look.house==='workshop'){px(c,x-6,y+hh-8,6,6,'#b07a40');px(c,x-6,y+hh-8,6,1,P.out);px(c,x-5,y+hh-5,4,1,'#8a5a30');px(c,x-10,y+hh-4,4,4,'#9a9aa0');}
}
function shade(hex,amt){const n=parseInt(hex.slice(1),16);let r=(n>>16)+amt,g2=((n>>8)&255)+amt,bb=(n&255)+amt;r=Math.max(0,Math.min(255,r));g2=Math.max(0,Math.min(255,g2));bb=Math.max(0,Math.min(255,bb));return '#'+((1<<24)+(r<<16)+(g2<<8)+bb).toString(16).slice(1);}
function well(c){const x=plaza.x,y=plaza.y+10;px(c,x-10,y+8,20,3,'rgba(0,0,0,.2)');px(c,x-9,y,18,9,P.stone);for(let i=x-9;i<x+9;i+=4)px(c,i,y+4,1,5,P.stone2);px(c,x-9,y,18,1,P.out);px(c,x-7,y+1,14,3,'#2c6fb4');
 px(c,x-9,y-10,2,11,'#7a4a24');px(c,x+7,y-10,2,11,'#7a4a24');px(c,x-11,y-13,22,4,'#b83a2a');px(c,x-11,y-13,22,1,P.out);px(c,x-1,y-9,2,5,'#a8a8a8');}
function lamp(c,x,y){px(c,x,y,2,10,'#3a3030');px(c,x-1,y-3,4,4,'#3a3030');px(c,x,y-2,2,2,'#ffe080');}
const LAMPS=[[170,140],[232,140],[100,140],[300,140]];
function buildBG(cfg){seed=1337;drawGround();drawForest();for(const k in HOUSES){const look=(cfg[k]&&cfg[k].look)||{house:'shop',roof:'#a85a3a'};house(b,k,HOUSES[k],look);}
 well(b);LAMPS.forEach(([x,y])=>lamp(b,x,y));
 // signposts
 px(b,190,150,2,8,'#7a4a24');px(b,183,146,16,6,'#c89058');px(b,183,146,16,1,P.out);px(b,185,148,12,1,'#7a4a24');px(b,185,150,8,1,'#7a4a24');}
// ---- characters ----
function drawChar(c,ch,t){const L=ch.look,x=Math.round(ch.x),y=Math.round(ch.y),f=ch.dir<0;const walk=ch.moving?Math.floor(t/140)%2:0,bob=ch.moving?0:(Math.floor(t/600+ch.phase)%2);
 const X=(dx)=>f?x-dx-1:x+dx; const p=(dx,dy,w,h,col)=>{for(let i=0;i<w;i++)px(c,X(dx+i),y+dy,1,h,col);};
 p(-5,-1,10,2,'rgba(0,0,0,.25)');
 // feet
 p(-3,-2-(walk?1:0),3,2,'#5a3a20');p(1,-2-(walk?0:1),3,2,'#5a3a20');
 // body
 const sh=L.shirt||'#4a8a3a';p(-4,-8+bob,8,6,P.out);p(-3,-8+bob,6,5,sh);p(-3,-4+bob,6,1,shade(sh,-40));p(-3,-5+bob,6,1,'#7a4a24');
 p(-5,-7+bob+(walk?1:0),2,3,P.skin);p(3,-7+bob+(walk?0:1),2,3,P.skin);
 if(L.scarf){p(-3,-9+bob,6,2,'#ffcc40');p(1,-8+bob,2,3,'#ffcc40');}
 if(L.satchel){p(2,-7+bob,3,4,'#8a5a30');p(-3,-8+bob,6,1,'#6b4526');}
 // head
 const hy=-17+bob;p(-5,hy,10,9,P.out);p(-4,hy+1,8,7,P.skin);p(-4,hy+6,8,1,shade(P.skin,-18));
 const blink=(Math.floor(t/90+ch.phase*37)%60)===0;
 if(!blink){p(f?-2:-2,hy+4,1,2,'#2a1d14');p(1,hy+4,1,2,'#2a1d14');}else{p(-2,hy+5,1,1,'#2a1d14');p(1,hy+5,1,1,'#2a1d14');}
 p(-3,hy+6,1,1,'#f39a8a');p(2,hy+6,1,1,'#f39a8a');
 // hair / hats
 const hat=L.hat||'#6b4526';
 if(L.hardhat){p(-5,hy-1,10,4,hat);p(-6,hy+2,12,1,shade(hat,-40));p(-1,hy-2,2,1,hat);p(-4,hy,2,1,'#fff6a0');}
 else if(L.band){p(-4,hy,8,3,'#5a3a20');p(-5,hy+2,10,1,hat);p(4,hy+2,2,3,hat);}
 else if(L.umbrella){p(-4,hy,8,3,'#d0d8e0');p(-5,hy+1,1,2,'#d0d8e0');p(4,hy+1,1,2,'#d0d8e0');
   p(0,hy-9,1,9,'#4a4a50');for(let r=0;r<4;r++)p(-6+r,hy-11+r-1,13-2*r,1,r%2?'#5a8ad8':'#ffd34a');p(-7,hy-8,15,1,'#2c4a80');}
 else if(L.glasses){p(-4,hy,8,3,'#6b4526');p(-2,hy-2,4,2,'#6b4526');p(-3,hy+4,3,2,'#e0f0ff');p(1,hy+4,3,2,'#e0f0ff');p(-3,hy+3,7,1,'#3a2a20');}
 else {p(-5,hy-1,10,4,hat);p(-3,hy-2,6,1,hat);p(-5,hy+3,2,2,hat);p(2,hy-1,3,1,shade(hat,40));if(L.house==='manor')p(-1,hy-3,2,1,'#fff3a0');}
 if(ch.active&&Math.floor(t/250)%2){p(6,hy-2,1,1,'#fff6a0');p(-7,hy+1,1,1,'#fff6a0');}
}
// ---- state ----
const LOOKS={
 Friday:{hat:'#e8b830',shirt:'#d9a020',house:'manor',roof:'#c8962a'},
 Gladdus:{hat:'#5a3e8c',shirt:'#7a5aa8',house:'library',roof:'#6b4c9a',glasses:true},
 Coach:{hat:'#d04030',shirt:'#e05a3a',house:'gym',roof:'#b83a2a',band:true},
 Clima:{hat:'#7d8a99',shirt:'#9fb0c0',house:'tower',roof:'#5f7385',umbrella:true},
 ResI:{hat:'#f0c020',shirt:'#3a72c8',house:'workshop',roof:'#2f5fa8',hardhat:true},
 Dos:{hat:'#8a4cc8',shirt:'#a86ad8',house:'cafe',roof:'#7a3cb0',scarf:true},
 Mark:{hat:'#c83a50',shirt:'#d85a6a',house:'shop',roof:'#a83040',satchel:true}};
let bots=[],selected=null,lastData=null;
const CHATTER={Friday:['Checking the schedule','Coffee for the team?','Morning huddle!'],Gladdus:['Shelving books','Indexing…','Shh, reading'],Coach:['Stretch first!','Hydrate!','Go for a walk?'],
 Clima:['Clouds rolling in','Checking radar','Wind check'],ResI:['Reading the news','Fresh headlines','Site walk'],Dos:["What's hot today?",'Scouting trends','Ooh, new idea'],Mark:['Ad trends…','Taking notes','Market stroll']};
const STATE_LABEL={working:'● working now',filed:'📜 filed a report',idle:'idle',asleep:'asleep'};
async function poll(){try{const r=await fetch('status.json?t='+Date.now(),{cache:'no-store'});lastData=await r.json();sync();}catch(e){}}
function sync(){lastData.forEach((d,i)=>{if(!HOUSES[d.name])return;let ch=bots.find(c=>c.key===d.name);
  if(!ch){const h=HOUSES[d.name],dr=door(h);ch={key:d.name,x:dr.x+(i%2?6:-6),y:dr.y+10,tx:0,ty:0,dir:1,moving:false,wait:Math.random()*2000,phase:i*1.7,home:{x:dr.x,y:dr.y+12},look:LOOKS[d.name]};bots.push(ch);}
  ch.name=String(d.name);ch.role=String(d.role||'');ch.state=String(d.state||'idle');ch.bucket=String(d.last_active_bucket||'');ch.active=ch.state==='working';});
 const u=lastData[0]&&lastData[0].updated_at;document.getElementById('upd').textContent=u?('Status updated '+new Date(u).toLocaleString('en-US',{timeZone:'America/New_York',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+' ET'):'';
 renderList();}
function renderList(){const el=document.getElementById('list');el.innerHTML='';bots.forEach(ch=>{const div=document.createElement('div');div.className='bot'+(selected===ch?' sel':'');
  div.innerHTML=`<div class="dot" style="background:${ch.look.shirt}"></div><div><div class="nm">${esc(ch.name)} <span class="rl">· ${esc(ch.role)}</span></div><div class="la ${ch.active?'':'old'}">${esc(STATE_LABEL[ch.state]||ch.state)} · last active ${esc(ch.bucket)}</div></div>`;
  div.onclick=()=>{selected=selected===ch?null:ch;renderList();};el.appendChild(div);});}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function bubbleText(ch,t){if(ch.state==='working')return 'Working…';if(ch.state==='asleep')return 'Zzz…';
 const slot=Math.floor((t/1000+ch.phase*4)/7)%3;if(ch.state==='filed'&&slot!==2)return '📜 Filed a report';
 if(slot===1){const a=CHATTER[ch.key]||['Hello!'];return a[Math.floor(t/21000+ch.phase)%a.length];}return null;}
// wandering
function update(dt){for(const ch of bots){if(ch.moving){const dx=ch.tx-ch.x,dy=ch.ty-ch.y,d=Math.hypot(dx,dy),sp=(ch.active?22:12)*dt/1000;
  if(d<1){ch.moving=false;ch.wait=1500+Math.random()*4000;continue;}const nx=ch.x+dx/d*sp,ny=ch.y+dy/d*sp;if(!walkable(nx,ny)){ch.moving=false;ch.wait=500;continue;}
  ch.x=nx;ch.y=ny;if(Math.abs(dx)>.3)ch.dir=dx<0?-1:1;}else{ch.wait-=dt;if(ch.wait<=0){
  for(let k=0;k<12;k++){const base=Math.random()<.2?{x:plaza.x,y:plaza.y+32}:ch.home;const tx=base.x+(Math.random()-.5)*60,ty=base.y+(Math.random()-.5)*30;
   if(walkable(tx,ty)){ch.tx=tx;ch.ty=ty;ch.moving=true;break;}}if(!ch.moving)ch.wait=800;}}}}
// sky / tint by ET hour
function etHour(){const q=new URLSearchParams(location.search).get('hour');if(q!==null)return +q;return +new Date().toLocaleString('en-US',{timeZone:'America/New_York',hour:'numeric',hour12:false})%24;}
function tint(h){if(h>=7&&h<17)return null;if(h>=17&&h<19)return 'rgba(255,140,60,.16)';if(h>=5&&h<7)return 'rgba(255,170,120,.14)';return 'rgba(30,40,110,.38)';}
let last=0;
function frame(t){const dt=Math.min(100,t-last);last=t;update(dt);
 g.drawImage(bg,0,0);
 // water shimmer
 for(let i=0;i<6;i++){const a=(t/900+i*1.3);px(g,pond.cx-20+((i*13+Math.floor(a*3))%40),pond.cy-6+(i*5)%12,3,1,P.w2);}
 // characters sorted by y
 [...bots].sort((a,c)=>a.y-c.y).forEach(ch=>drawChar(g,ch,t));
 const h=etHour(),tn=tint(h);if(tn){g.fillStyle=tn;g.fillRect(0,0,W,H);
  if(h>=18||h<6){g.globalCompositeOperation='lighter';LAMPS.forEach(([x,y])=>glow(g,x+1,y-1,14,'rgba(255,200,90,.35)'));
   for(const k in HOUSES){const hh=HOUSES[k],wy=hh.y+Math.floor(hh.h*.5)+3;if(hh.h*.5>=12){glow(g,hh.x+9,wy+2,6,'rgba(255,210,110,.5)');glow(g,hh.x+hh.w-9,wy+2,6,'rgba(255,210,110,.5)');}}
   g.globalCompositeOperation='source-over';for(let i=0;i<8;i++){const fx=(i*53+Math.sin(t/1500+i)*12)%W,fy=60+(i*37)%150+Math.cos(t/1200+i)*6;px(g,fx,fy,1,1,'#f8ff90');}}}
 ctx.imageSmoothingEnabled=false;ctx.drawImage(low,0,0,W*S,H*S);
 // labels and bubbles at screen res
 ctx.textAlign='center';ctx.textBaseline='middle';const fs=Math.max(10,Math.round(S*3.6));ctx.font=`bold ${fs}px "Trebuchet MS",Verdana,sans-serif`;
 for(const ch of bots){const sx=ch.x*S,sy=ch.y*S;label(ch.name,sx,sy+fs*0.9,ch===selected);
  const bt=bubbleText(ch,t);if(bt)bubble(bt.length>30?bt.slice(0,29)+'…':bt,sx,sy-(ch.look.umbrella?28:21)*S,fs,ch.active);}
 // title
 ctx.font=`bold ${Math.round(fs*1.1)}px "Trebuchet MS",Verdana,sans-serif`;label('Bot Hollow',W*S/2,13*S,false,'#ffe68a');
 requestAnimationFrame(frame);}
function glow(c,x,y,r,col){const gr=c.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=gr;c.fillRect(x-r,y-r,r*2,r*2);}
function label(s,x,y,sel,col){const w=ctx.measureText(s).width+12,h=parseInt(ctx.font.match(/(\d+)px/)[1])+6;ctx.fillStyle=sel?'rgba(120,70,10,.9)':'rgba(30,20,10,.72)';rr(x-w/2,y-h/2,w,h,h/2);ctx.fill();ctx.fillStyle=col||(sel?'#ffe68a':'#fff6dc');ctx.fillText(s,x,y+1);}
function bubble(s,x,y,fs,act){ctx.font=`${Math.round(fs*0.9)}px "Trebuchet MS",Verdana,sans-serif`;const w=ctx.measureText(s).width+16,h=fs*1.6;
 ctx.fillStyle=act?'#fff6c0':'#fffdf4';ctx.strokeStyle='#3a2a1a';ctx.lineWidth=Math.max(2,S*.7);rr(x-w/2,y-h,w,h,6);ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.moveTo(x-5,y-1);ctx.lineTo(x,y+8);ctx.lineTo(x+5,y-1);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(x-5,y);ctx.lineTo(x,y+8);ctx.lineTo(x+5,y);ctx.stroke();
 ctx.fillStyle='#3a2a1a';ctx.fillText(s,x,y-h/2+1);ctx.font=`bold ${fs}px "Trebuchet MS",Verdana,sans-serif`;}
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
cv.addEventListener('click',e=>{const r=cv.getBoundingClientRect(),mx=(e.clientX-r.left)/S*(cv.width/r.width),my=(e.clientY-r.top)/S*(cv.height/r.height);
 let best=null,bd=14;for(const ch of bots){const d=Math.hypot(ch.x-mx,ch.y-8-my);if(d<bd){bd=d;best=ch;}}selected=best;renderList();});
fit();
(async()=>{await poll();const byKey={};for(const k in LOOKS)byKey[k]={look:LOOKS[k]};buildBG(byKey);setInterval(poll,5*60*1000);requestAnimationFrame(frame);})();
