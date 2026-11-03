// Bot Hollow: an original top-down pixel village. All art is drawn in code.
const W=400,H=288,T=8,COLS=W/T,ROWS=H/T;
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
const low=document.createElement('canvas');low.width=W;low.height=H;const g=low.getContext('2d');
const bg=document.createElement('canvas');bg.width=W;bg.height=H;const b=bg.getContext('2d');
let S=3;
let MOBILE=false,K=1; // K = canvas backing px per CSS px (1 on desktop)
const MQ=window.matchMedia('(max-width: 800px), (max-height: 500px)');
const RMQ=window.matchMedia('(prefers-reduced-motion: reduce)');let RM=RMQ.matches;if(RMQ.addEventListener)RMQ.addEventListener('change',()=>{RM=RMQ.matches;}); // reduced motion: no bouncing, strobing, confetti or fireworks
function fit(){const st=document.getElementById('stage');MOBILE=MQ.matches;
 if(!MOBILE){ // desktop: fill the stage at any (non-integer) scale; the pixels stay sharp (nearest-neighbour + image-rendering:pixelated), backing store at devicePixelRatio
  const sc=Math.max(1,Math.min((st.clientWidth-16)/W,(st.clientHeight-16)/H)),cssW=Math.floor(W*sc),cssH=Math.round(cssW*H/W),dpr=window.devicePixelRatio||1;
  cv.width=Math.round(cssW*dpr);cv.height=Math.round(cssH*dpr);cv.style.width=cssW+'px';cv.style.height=cssH+'px';S=cv.width/W;K=cv.width/cssW;return;}
 // mobile: fill container width, keep aspect, fit viewport height, crisp at devicePixelRatio
 const bw=6,avail=Math.max(160,st.clientWidth-bw);const vh=(window.visualViewport?window.visualViewport.height:window.innerHeight);
 const cssW=Math.floor(Math.min(avail,Math.max(200,(vh-24)*W/H)));const dpr=window.devicePixelRatio||1;
 S=Math.max(1,Math.ceil(cssW*dpr/W));cv.width=W*S;cv.height=H*S;cv.style.width=cssW+'px';cv.style.height=Math.round(cssW*H/W)+'px';K=cv.width/cssW;}
window.addEventListener('resize',fit);window.addEventListener('orientationchange',()=>setTimeout(fit,150));
if(window.visualViewport)window.visualViewport.addEventListener('resize',fit);
if(MQ.addEventListener)MQ.addEventListener('change',fit);
// seeded rng
let seed=1337;function rnd(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;}
function px(c,x,y,w=1,h=1,col){c.fillStyle=col;c.fillRect(x|0,y|0,w,h);}
const P={g1:'#5fae4a',g2:'#6fbe52',g3:'#4e9a40',g4:'#89cf5e',d1:'#e2c387',d2:'#c9a565',d3:'#f0d9a2',w1:'#3f8fd8',w2:'#5cb0ec',w3:'#2c6fb4',out:'#2a1d14',
 t1:'#2f7a3a',t2:'#3f9446',t3:'#5bb04e',t4:'#1f5a2c',tr:'#6b4526',skin:'#f6c9a0',stone:'#b8b0a0',stone2:'#8f8778'};
// ---- map ----
// Layout (from the project's direction): top row = Friday's command center, Clima's weather station,
// communal garden, Coach's dojo + running track. Middle row = Luke's cottage, Mark's cafe, fountain plaza,
// Dos's newsstand, outdoor kitchen + fire pit. Bottom row = Gladdus's library, ResI's office, chopping area,
// hammocks, pond with a little dock. Two streets (rows 10-11 and 20-21) tie everything together.
// Round 3: the map is 48px taller; the pond is much bigger (fishing + swimming), with a long dock and a little beach.
const map=[];for(let y=0;y<ROWS;y++){map.push(new Array(COLS).fill(0));}
const HOUSES={ // px coords of top-left, size in px
 Friday:{x:24,y:36,w:52,h:40},Clima:{x:96,y:36,w:36,h:40},Coach:{x:240,y:36,w:44,h:38},
 Luke:{x:24,y:116,w:38,h:38},Mark:{x:84,y:114,w:42,h:36},Dos:{x:262,y:114,w:40,h:34},
 Gladdus:{x:24,y:186,w:46,h:36},ResI:{x:104,y:188,w:42,h:34},
 Peter:{x:74,y:184,w:26,h:38,winY:193}}; // round 5: Peter's Build-ing, in the gap between the library and the ResI-dence
function door(h){return {x:h.x+h.w/2,y:h.y+h.h};}
const winY=h=>h.winY||h.y+Math.floor(h.h*.5)+3; // window row (the tall Build-ing sets its own)
function homeOf(h){const d=door(h);return d.y>200?{x:d.x,y:168}:{x:d.x,y:d.y+12};} // bottom-row houses use the lower street
function carve(x0,y0,x1,y1){for(let y=Math.min(y0,y1);y<=Math.max(y0,y1);y++)for(let x=Math.min(x0,x1);x<=Math.max(x0,x1);x++)if(map[y]&&map[y][x]!==undefined&&map[y][x]!==3&&map[y][x]!==2)map[y][x]=1;}
// forest border
for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){if(y<3||x<2||x>=COLS-2||(y>=ROWS-1))map[y][x]=3;}
for(let x=0;x<COLS;x++){if(rnd()<.5)map[3][x]=3;}
// pond (bottom right) + dock
const pond={cx:330,cy:230,rx:50,ry:34};
for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const dx=(x*T+4-pond.cx)/pond.rx,dy=(y*T+4-pond.cy)/pond.ry;if(dx*dx+dy*dy<1)map[y][x]=2;}
const DOCK={x:319,y:190,w:11,h:36},DOCK_END={x:324,y:223},CANNON_LAND={x:324,y:241};
// streets and plaza
carve(2,10,COLS-3,11);carve(2,20,COLS-3,21);
const plaza={x:200,y:128};carve(21,13,28,18);carve(24,12,25,12);carve(24,19,25,19);
for(const k in HOUSES){const d=door(HOUSES[k]);const tx=Math.floor(d.x/T),ty=Math.floor(d.y/T);
 if(ty<=10)carve(tx,ty,tx,10);else if(ty<=20)carve(tx,ty,tx,20);else carve(tx,21,tx,ty);}
carve(40,22,40,24);for(let y=25;y<=27;y++)map[y][40]=1; // street to the long dock
carve(41,12,42,13); // street to kitchen
carve(38,9,38,9);   // street to track
carve(2,28,33,28);carve(19,22,19,27);carve(33,29,33,31); // round 3b: south lane under the bottom-row houses, to mini golf, the market and the beach
// props that block walking (garden, fountain, kitchen, woodpile, hammocks, stands)
const GARDEN={x:148,y:40,w:78,h:34};
const TRACK={cx:338,cy:58,rx:32,ry:16};
const FIRE={x:340,y:132};
const OBST=[GARDEN,{x:326,y:104,w:30,h:10},{x:166,y:194,w:42,h:14},{x:214,y:190,w:32,h:8},{x:236,y:210,w:32,h:8},
 {x:244,y:134,w:12,h:12},{x:132,y:134,w:16,h:12},{x:150,y:98,w:14,h:10},
 {x:359,y:121,w:20,h:19}, // picnic table + benches (bots only enter at the seats)
 {x:183,y:214,w:15,h:11},{x:238,y:112,w:20,h:9}]; // chopping stump, news bench
const TABLE={x:360,y:126,w:18,h:6};
function walkable(x,y){const tx=Math.floor(x/T),ty=Math.floor(y/T);if(!map[ty]||map[ty][tx]===undefined)return false;if(map[ty][tx]>=2)return false;
 for(const k in HOUSES){const h=HOUSES[k];if(x>h.x-3&&x<h.x+h.w+3&&y>h.y-2&&y<h.y+h.h+2)return false;}
 for(const o of OBST){if(x>o.x-2&&x<o.x+o.w+2&&y>o.y-1&&y<o.y+o.h+2)return false;}
 if(Math.hypot(x-plaza.x,(y-plaza.y)*1.5)<17)return false;
 if(Math.hypot(x-FIRE.x,(y-FIRE.y)*1.3)<10)return false;return true;}
// tile pathfinding (8-way, no corner cutting) + line-of-sight smoothing
const PASS=[];function buildPass(){for(let y=0;y<ROWS;y++){PASS[y]=[];for(let x=0;x<COLS;x++)PASS[y][x]=walkable(x*T+4,y*T+4);}}
function clearLine(a,b){const d=Math.hypot(b.x-a.x,b.y-a.y),n=Math.ceil(d/2);for(let i=1;i<=n;i++){const x=a.x+(b.x-a.x)*i/n,y=a.y+(b.y-a.y)*i/n;if(!walkable(x,y))return false;}return true;}
function nearTile(x,y){const tx=Math.floor(x/T),ty=Math.floor(y/T);for(let r=0;r<4;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const a=tx+dx,c=ty+dy;if(PASS[c]&&PASS[c][a])return [a,c];}return null;}
function findPath(from,to){const s=nearTile(from.x,from.y),e=nearTile(to.x,to.y);if(!s||!e)return null;
 const key=(x,y)=>y*COLS+x,prev=new Map([[key(s[0],s[1]),-1]]),q=[s];let found=false;
 while(q.length){const [x,y]=q.shift();if(x===e[0]&&y===e[1]){found=true;break;}
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const nx=x+dx,ny=y+dy;if(!PASS[ny]||!PASS[ny][nx]||prev.has(key(nx,ny)))continue;
   if(dx&&dy&&(!PASS[y][nx]||!PASS[ny][x]))continue;prev.set(key(nx,ny),key(x,y));q.push([nx,ny]);}}
 if(!found)return null;const pts=[];let k=key(e[0],e[1]);while(k!==-1){pts.unshift({x:(k%COLS)*T+4,y:Math.floor(k/COLS)*T+4});k=prev.get(k);}
 pts.push({x:to.x,y:to.y});const out=[];let cur={x:from.x,y:from.y},i=0;
 while(i<pts.length){let j=pts.length-1;while(j>i&&!clearLine(cur,pts[j]))j--;out.push(pts[j]);cur=pts[j];i=j+1;}return out;}
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
 for(let y=13;y<=18;y++)for(let x=21;x<=28;x++){const X=x*T,Y=y*T;px(b,X,Y,T,T,'#d9cdb2');px(b,X,Y,T,1,'#c2b494');px(b,X,Y,1,T,'#c2b494');px(b,X+(y%2?4:0),Y+4,1,4,'#c2b494');}
 // pond
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(map[y][x]===2){const X=x*T,Y=y*T;px(b,X,Y,T,T,P.w1);
  if(tileAt(x,y-1)!==2){px(b,X,Y,T,2,'#9a7a4a');px(b,X,Y+2,T,1,P.w3);}
  if(tileAt(x,y+1)!==2)px(b,X,Y+7,T,1,'#2c6fb4');if(tileAt(x-1,y)!==2)px(b,X,Y,1,T,'#9a7a4a');if(tileAt(x+1,y)!==2)px(b,X+7,Y,1,T,'#9a7a4a');}
 // water under the dock, then lily pads
 px(b,320,200,8,24,P.w1);
 [[288,232],[340,258],[368,240]].forEach(([x,y])=>{px(b,x,y,5,3,'#3f9a3a');px(b,x+1,y-1,3,1,'#3f9a3a');px(b,x+2,y,1,1,P.w1);});px(b,369,239,2,1,'#f5a0c0');
 // flowers
 const fc=['#f5e050','#ff8fb0','#ffffff','#ff6a5a','#b98cf0'];
 for(let i=0;i<185;i++){const x=rnd()*W,y=rnd()*H;if(!walkable(x,y)||tileAt(Math.floor(x/T),Math.floor(y/T))!==0)continue;
  if(Math.abs(((x-TRACK.cx)/TRACK.rx)**2+((y-TRACK.cy)/TRACK.ry)**2-1)<.45)continue;const c=fc[(rnd()*fc.length)|0];
  px(b,x,y+1,1,2,P.g3);px(b,x-1,y,1,1,c);px(b,x+1,y,1,1,c);px(b,x,y-1,1,1,c);px(b,x,y+1,1,1,c);px(b,x,y,1,1,'#f8d040');}
 drawBeach();
 // reeds on the pond banks
 [[284,206],[286,222],[374,210],[378,222],[304,264],[358,262]].forEach(([x,y])=>{px(b,x,y,1,6,'#3f7a30');px(b,x+2,y+1,1,5,'#4e9a40');px(b,x,y-2,1,2,'#7a4a24');px(b,x+2,y-1,1,2,'#7a4a24');});
}
function fencePost(x,y){px(b,x,y,2,6,'#a8703c');px(b,x,y,2,1,'#c89058');px(b,x,y+5,2,1,P.out);}
function tree(c,x,y,s=1){ // round canopy tree, original design
 px(c,x-6*s,y+9*s,12*s,3*s,'rgba(0,0,0,.18)');
 px(c,x-1*s,y+4*s,3*s,7*s,P.tr);px(c,x-1*s,y+4*s,1*s,7*s,'#8a5a34');
 const r=8*s,pl=treePal(x,y);for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const d=dx*dx+dy*dy*1.15;if(d<=r*r){let col=pl.t2;if(d>r*r*.72)col=pl.t4;else if(dx+dy<-r*.6)col=pl.t3;else if(dx+dy>r*.5)col=pl.t1;px(c,x+dx,y+dy-2*s,1,1,col);treeDot(c,x,y,dx,dy,r,s);}}
 px(c,x-4*s,y-6*s,2,1,pl.hi);px(c,x-2*s,y-7*s,2,1,pl.hi);
}function drawForest(){const list=[];for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(map[y][x]===3&&rnd()<.55)list.push([x*T+4+rnd()*4-2,y*T+rnd()*4]);
 for(let x=0;x<W;x+=11)list.push([x+rnd()*4,-2+rnd()*6]);
 list.sort((a,b)=>a[1]-b[1]).forEach(([x,y])=>tree(b,x,y));
 // a few interior trees
 [[84,206],[308,104],[374,132],[292,184]].forEach(([x,y])=>{if(walkable(x,y+8))tree(b,x,y);});
}
// houses: distinct roofs, all original
function house(c,name,h,look){const {x,y,w,h:hh}=h;const roofH=Math.floor(hh*.5),wallY=y+roofH,wallH=hh-roofH;
 px(c,x+2,y+hh-1,w,3,'rgba(0,0,0,.22)');
 if(look.house==='build'){buildHouse(c,h);return;} // Peter's Build-ing has its own (unfinished) look
 // walls
 const wall={build:'#e4d2b0',library:'#efe2c4',gym:'#f0d8b8',tower:'#e8e4dc',workshop:'#d8b48a',cafe:'#f4e0d0',shop:'#f2e6c8',manor:'#f6ead0',study:'#e9e2d6'}[look.house]||'#efe2c4';
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
 if(look.house!=='tower'&&look.house!=='study'){px(c,x+w-12,y-4,5,8,'#9a6a4a');px(c,x+w-13,y-5,7,2,'#6b4526');}
 if(look.house==='tower'){px(c,x+w/2-1,y-10,2,10,'#6a6a70');px(c,x+w/2-5,y-10,10,1,'#6a6a70');px(c,x+w/2+4,y-12,3,3,'#f0f0f0');px(c,x+w/2-7,y-12,3,3,'#f0f0f0');} // anemometer
 if(look.house==='library'){px(c,x+w/2-6,wallY-6,12,5,'#f6ead0');px(c,x+w/2-6,wallY-6,12,1,P.out);px(c,x+w/2-4,wallY-5,3,3,'#c84a3a');px(c,x+w/2,wallY-5,3,3,'#3a72c8');}
 if(look.house==='gym'){px(c,x+w/2-7,wallY-5,14,3,'#555');px(c,x+w/2-9,wallY-7,3,7,'#333');px(c,x+w/2+6,wallY-7,3,7,'#333');}
 if(look.house==='cafe'){for(let i=x+2;i<x+w-2;i+=4){px(c,i,wallY+1,2,3,'#ffffff');px(c,i+2,wallY+1,2,3,rc);}}
 if(look.house==='shop'){px(c,x+w+1,wallY+4,6,6,'#e8d090');px(c,x+w+1,wallY+4,6,1,P.out);px(c,x+w+3,wallY+6,2,2,'#c83a50');}
 if(look.house==='manor'){px(c,x+w/2-1,y-8,2,8,'#7a5a3a');px(c,x+w/2+1,y-8,6,4,'#ffd34a');px(c,x+w/2+1,y-8,6,1,'#c8962a');}
 if(look.house==='study'){ // little stone study house: a clock in the gable, square window, book sign
  const cx=x+w/2;px(c,cx-2,y+1,5,9,P.out);px(c,cx-3,y+2,7,7,P.out);px(c,cx-4,y+3,9,5,P.out); // clock face (round-ish, 9px)
  px(c,cx-1,y+2,3,7,'#f8f2e2');px(c,cx-2,y+3,5,5,'#f8f2e2');px(c,cx-3,y+4,7,3,'#f8f2e2');px(c,cx,y+2,1,1,'#b8a888');px(c,cx-3,y+5,1,1,'#b8a888');px(c,cx+3,y+5,1,1,'#b8a888');px(c,cx,y+8,1,1,'#b8a888');
  px(c,cx-2,y+4,1,1,'#2a1d14');px(c,cx-1,y+5,1,1,'#2a1d14');px(c,cx+1,y+5,1,1,'#2a1d14');px(c,cx+2,y+4,1,1,'#2a1d14');px(c,cx,y+5,1,1,'#c84a3a'); // hands at ten past ten
  px(c,cx-3,wallY+1,6,5,P.out);px(c,cx-2,wallY+2,4,3,'#9ad0f0');px(c,cx-1,wallY+2,1,3,P.out);px(c,cx-2,wallY+3,4,1,P.out);px(c,cx-2,wallY+2,1,1,'#d8f4ff'); // square window
  px(c,x+w+1,wallY+3,2,12,'#7a4a24');px(c,x+w-1,wallY+3,8,1,'#7a4a24'); // sign post + arm
  px(c,x+w+2,wallY+5,8,6,P.out);px(c,x+w+3,wallY+6,3,4,'#ffffff');px(c,x+w+6,wallY+6,3,4,'#f4eee0');px(c,x+w+6,wallY+6,1,4,'#b84a3a');px(c,x+w+4,wallY+7,1,1,'#8a8a8a');px(c,x+w+7,wallY+8,1,1,'#8a8a8a');} // open book
 if(look.house==='workshop'){px(c,x-6,y+hh-8,6,6,'#b07a40');px(c,x-6,y+hh-8,6,1,P.out);px(c,x-5,y+hh-5,4,1,'#8a5a30');px(c,x-10,y+hh-4,4,4,'#9a9aa0');}
}
function shade(hex,amt){const n=parseInt(hex.slice(1),16);let r=(n>>16)+amt,g2=((n>>8)&255)+amt,bb=(n&255)+amt;r=Math.max(0,Math.min(255,r));g2=Math.max(0,Math.min(255,g2));bb=Math.max(0,Math.min(255,bb));return '#'+((1<<24)+(r<<16)+(g2<<8)+bb).toString(16).slice(1);}// ---- village props (all original, drawn in code) ----
function drawTrack(c){const {cx,cy,rx,ry}=TRACK;
 for(let y=-ry-3;y<=ry+3;y++)for(let x=-rx-3;x<=rx+3;x++){const o=(x/(rx+3))**2+(y/(ry+3))**2,i=(x/(rx-4))**2+(y/(ry-4))**2;if(o<=1&&i>1)px(c,cx+x,cy+y,1,1,(o>.82||i<1.12)?'#a8503a':'#c8664a');}
 for(let a=0;a<Math.PI*2;a+=0.22)px(c,cx+Math.cos(a)*(rx-0.5),cy+Math.sin(a)*(ry-0.5),2,1,'#f4e6d0'); // lane dashes
 px(c,cx-1,cy+ry-4,2,8,'#ffffff');px(c,cx,cy+ry-4,1,1,P.out);px(c,cx,cy+ry-2,1,1,P.out);px(c,cx,cy+ry,1,1,P.out); // start line
 // infield: tiny bench + water cooler
 px(c,cx-10,cy-1,14,2,'#8a5a30');px(c,cx-9,cy+1,1,2,'#6b4526');px(c,cx+2,cy+1,1,2,'#6b4526');
 px(c,cx+8,cy-5,5,7,'#3a72c8');px(c,cx+8,cy-5,5,1,'#ffffff');px(c,cx+9,cy-7,3,2,'#a8d8f8');}
function drawGarden(c){const {x,y,w,h}=GARDEN;px(c,x+2,y+2,w-4,h-4,'#7a5232');
 for(let r=0;r<4;r++){const ry=y+5+r*7;px(c,x+4,ry+3,w-8,1,'#5e3e22');
  for(let i=x+6;i<x+w-8;i+=6){if(r===0){px(c,i,ry-3,1,6,'#3f8a30');px(c,i-1,ry-5,3,3,'#f5c830');px(c,i,ry-4,1,1,'#7a4a24');} // sunflowers
   else if(r===1){px(c,i-1,ry,4,3,'#9ad86a');px(c,i,ry+1,2,1,'#6fb04a');} // cabbages
   else if(r===2){px(c,i,ry-1,1,2,'#4ea040');px(c,i+1,ry-2,1,2,'#4ea040');px(c,i,ry+1,2,2,'#f08a30');} // carrots
   else if((i<156||i>178)&&(i<196||i>218)){px(c,i-1,ry,3,2,'#3f9446');px(c,i,ry-1,1,1,'#e84040');px(c,i+1,ry+1,1,1,'#e84040');}}} // tomatoes
 for(const q of [165,199]){px(c,q,62,10,6,'#5e3e22');for(let j=0;j<3;j++)px(c,q+1,63+j*2,8,1,'#4a2e18');} // tilled work plots (crops drawn live)
 for(let i=x;i<=x+w;i+=6)if(i<x+w/2-6||i>x+w/2+4){fencePost(i,y-2);} for(let i=x;i<=x+w;i+=6)if(i!==160&&i!==214)fencePost(i,y+h-4); // two little gates
 for(let j=y+4;j<y+h-4;j+=6){fencePost(x,j);fencePost(x+w-2,j);}
 px(c,x,y,w/2-6,1,'#8a5a30');px(c,x+w/2+6,y,w/2-6,1,'#8a5a30');px(c,x,y+h-2,8,1,'#8a5a30');px(c,165,y+h-2,44,1,'#8a5a30');px(c,219,y+h-2,x+w-219,1,'#8a5a30');
 // scarecrow
 const sx=x+w/2,sy=y+16;px(c,sx,sy,1,14,'#7a4a24');px(c,sx-6,sy+4,13,1,'#7a4a24');px(c,sx-3,sy+3,7,6,'#3a72c8');px(c,sx-2,sy-4,5,6,'#f0d9a2');
 px(c,sx-4,sy-5,9,2,'#c89a30');px(c,sx-2,sy-7,5,2,'#c89a30');px(c,sx-1,sy-2,1,1,P.out);px(c,sx+1,sy-2,1,1,P.out);px(c,sx-7,sy+4,1,2,'#f5e050');px(c,sx+7,sy+4,1,2,'#f5e050');
 // (the cheeky crow is drawn live now)
}
function drawFountain(c){const x=plaza.x,y=plaza.y;
 for(let dy=-9;dy<=9;dy++)for(let dx=-16;dx<=16;dx++){const d=(dx/16)**2+(dy/9)**2;if(d<=1)px(c,x+dx,y+dy,1,1,d>.62?(dy>2?P.stone2:P.stone):P.w1);}
 for(let dx=-16;dx<=16;dx++){const dy=Math.round(Math.sqrt(Math.max(0,1-(dx/16)**2))*9);px(c,x+dx,y+dy,1,1,P.out);px(c,x+dx,y-dy,1,1,'#d8d0c0');}
 px(c,x-2,y-10,4,10,P.stone);px(c,x-2,y-10,1,10,P.stone2);px(c,x-6,y-12,12,3,P.stone);px(c,x-6,y-12,12,1,'#d8d0c0');px(c,x-5,y-10,10,1,P.stone2);px(c,x-4,y-12,8,1,P.w2);
 px(c,x-18,y+8,36,3,'rgba(0,0,0,.18)');}
function drawKitchen(c){const fx=FIRE.x,fy=FIRE.y;
 // prep counter with cutting board, pots, spice jars
 px(c,327,106,28,8,'#a8703c');px(c,327,106,28,1,'#c89058');px(c,327,113,28,1,P.out);px(c,328,114,2,4,'#6b4526');px(c,352,114,2,4,'#6b4526');
 px(c,331,103,8,3,'#e8d090');px(c,333,102,1,1,'#f08a30');px(c,335,102,2,1,'#9ad86a');px(c,342,101,6,5,'#5a5a64');px(c,342,101,6,1,'#8a8a94');px(c,349,103,2,3,'#c83a50');px(c,352,103,2,3,'#f5e050');
 // stone ring + logs
 for(let a=0;a<Math.PI*2;a+=0.5)px(c,fx+Math.cos(a)*8-1,fy+Math.sin(a)*4,3,2,a>Math.PI?P.stone:P.stone2);
 px(c,fx-5,fy-1,10,2,'#6b4526');px(c,fx-3,fy-2,6,1,'#8a5a34');px(c,fx-1,fy,2,1,'#3a2416');
 // tripod + hanging pot
 px(c,fx-7,fy-13,1,13,'#5a3a20');px(c,fx+7,fy-13,1,13,'#5a3a20');px(c,fx-7,fy-14,15,1,'#5a3a20');px(c,fx,fy-14,1,4,'#9a9aa0');
 px(c,fx-4,fy-10,9,6,'#3a3a44');px(c,fx-5,fy-10,11,1,'#5a5a64');px(c,fx-3,fy-5,7,1,'#24242c');
 // log seats
 px(c,fx-20,fy+12,10,4,'#8a5a30');px(c,fx-20,fy+12,10,1,'#a8703c');px(c,fx-21,fy+12,2,4,'#c89058');
 px(c,fx+10,fy+12,10,4,'#8a5a30');px(c,fx+10,fy+12,10,1,'#a8703c');px(c,fx+19,fy+12,2,4,'#c89058');}
function hammock(c,x,y,col){px(c,x,y-10,2,14,'#6b4526');px(c,x+30,y-10,2,14,'#6b4526');px(c,x,y-11,2,1,'#8a5a30');px(c,x+30,y-11,2,1,'#8a5a30');
 px(c,x-1,y+3,4,2,'rgba(0,0,0,.18)');px(c,x+29,y+3,4,2,'rgba(0,0,0,.18)');
 for(let i=0;i<24;i++){const s=Math.round(Math.sin(i/23*Math.PI)*5);px(c,x+16-12+i,y+s+1,1,2,'rgba(0,0,0,.12)');}
 for(let i=0;i<4;i++){px(c,x+2+i,y-9+i*2,1,2,'#d8c8a0');px(c,x+29-i,y-9+i*2,1,2,'#d8c8a0');}
 for(let i=0;i<24;i++){const s=Math.round(Math.sin(i/23*Math.PI)*5),X=x+4+i,Y=y-4+s;px(c,X,Y,1,1,col);px(c,X,Y+1,1,1,'#fff6dc');px(c,X,Y+2,1,1,col);px(c,X,Y+3,1,1,'rgba(0,0,0,.25)');}}
function drawDock(c){const {x,y,w,h}=DOCK;px(c,x+1,y+h,w,2,'rgba(0,0,0,.25)');for(let j=y;j<y+h;j+=3){px(c,x,j,w,3,'#b07a44');px(c,x,j+2,w,1,'#8a5a30');}
 px(c,x-1,y+h-3,2,5,'#6b4526');px(c,x+w-1,y+h-3,2,5,'#6b4526');px(c,x+w-4,y+4,3,4,'#c8a060');px(c,x+w-4,y+4,3,1,'#8a5a30');} // bait bucket
function drawStands(c){ // Dos's newsstand rack + Mark's cafe table + signpost + Clima's rain gauge
 px(c,244,134,12,12,'#7a4a24');px(c,245,135,10,3,'#f4eee0');px(c,245,139,10,3,'#e8e0c8');px(c,245,143,10,2,'#f4eee0');
 for(let i=0;i<3;i++){px(c,246,136+i*4,3,1,'#8a8a8a');px(c,250,136+i*4,4,1,['#c83a50','#3a72c8','#8a4cc8'][i]);}
 px(c,244,131,12,3,'#8a4cc8');px(c,244,131,12,1,P.out);
 px(c,132,141,16,2,'#c89058');px(c,139,143,2,4,'#6b4526');px(c,139,128,1,13,'#7a7a80');for(let i=0;i<5;i++)px(c,133+i,129-i+4,14-2*i,1,i%2?'#ffffff':'#c83a50');
 px(c,135,139,2,2,'#ffffff');px(c,143,139,2,2,'#f4eee0');px(c,129,142,3,4,'#8a5a30');px(c,148,142,3,4,'#8a5a30');
 px(c,156,100,2,9,'#7a4a24');px(c,150,98,14,5,'#c89058');px(c,150,98,14,1,P.out);px(c,152,100,9,1,'#7a4a24');px(c,163,99,2,3,'#c89058');
 px(c,136,62,1,12,'#6a6a70');px(c,135,73,3,1,'#6a6a70'); // windsock pole (sock animates)
}
function drawPicnic(c){const {x,y,w,h}=TABLE; // original picnic table: plank top, gingham cloth, two benches, soft shadow
 px(c,x+2,y+h+2,w,3,'rgba(0,0,0,.2)');px(c,x+2,y+13,w,2,'rgba(0,0,0,.18)');px(c,x+2,y-1,w,1,'rgba(0,0,0,.12)');
 const bench=(by,legs)=>{px(c,x,by,w,2,'#b07a44');px(c,x,by,w,1,'#c89058');px(c,x,by+2,w,1,'#7a4a24');if(legs){px(c,x+1,by+3,2,2,'#6b4526');px(c,x+w-3,by+3,2,2,'#6b4526');}};
 bench(y-4,false);
 px(c,x,y,w,h,'#b07a44');for(let i=x+4;i<x+w;i+=5)px(c,i,y,1,h,'#9a6438');px(c,x,y,w,1,'#c89058');px(c,x,y+h,w,2,'#7a4a24');px(c,x,y+h+1,w,1,P.out);
 px(c,x+1,y+h+2,2,2,'#6b4526');px(c,x+w-3,y+h+2,2,2,'#6b4526');
 for(let j=0;j<4;j++)for(let i=0;i<6;i++)px(c,x+6+i,y+1+j,1,1,(i+j)%2?'#ffffff':'#e05060'); // gingham cloth
 px(c,x+2,y+1,2,3,'#a8d8f8');px(c,x+2,y+1,2,1,'#ffffff'); // jug
 bench(y+10,true);}
function lamp(c,x,y){px(c,x,y,2,10,'#3a3030');px(c,x-1,y-3,4,4,'#3a3030');px(c,x,y-2,2,2,'#ffe080');}
const LAMPS=[[86,70],[236,70],[298,70],[76,150],[158,150],[236,150],[312,150]];
function buildBG(cfg){seed=1337;drawGround();drawTrack(b);drawGarden(b);drawKitchen(b);drawWoodpile(b);hammock(b,214,198,'#3f9a7a');hammock(b,236,218,'#c83a50');drawDock(b);drawStands(b);drawBench(b);drawGolf(b);drawMarket(b);
 drawForest();drawPicnic(b);drawFountain(b);for(const k in HOUSES){const look=(cfg[k]&&cfg[k].look)||{house:'shop',roof:'#a85a3a'};house(b,k,HOUSES[k],look);}
 LAMPS.forEach(([x,y])=>lamp(b,x,y));
 const f=HOUSES.Friday;px(b,f.x+8,f.y-7,1,8,'#5a5a64');px(b,f.x+6,f.y-7,5,1,'#5a5a64'); // command-center antenna (tip blinks)
}
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
 if(L.book){p(-3,-7+bob,6,5,P.out);p(-2,-6+bob,4,4,'#b84a3a');p(-2,-6+bob,4,1,'#d86a50');p(-1,-5+bob,1,3,'#f4eee0');p(1,-5+bob,1,3,'#e8c050');} // carried book
 if(L.hoodie){p(-3,-8+bob,6,1,shade(sh,-28));p(-3,-5+bob,6,1,sh);p(-2,-6+bob,4,1,shade(sh,-18));} // hood bunched at the neck, front pocket (no belt)
 if(L.vest){p(-3,-8+bob,1,4,'#f08a30');p(2,-8+bob,1,4,'#f08a30');p(-3,-6+bob,1,1,'#fff0a0');p(2,-6+bob,1,1,'#fff0a0');} // orange safety vest
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
 if(L.headset){p(-4,hy-2,8,1,'#f08a30');p(-5,hy-1,1,3,'#f08a30');p(4,hy-1,1,3,'#f08a30');p(-6,hy+2,2,3,'#f08a30');p(4,hy+2,2,3,'#f08a30');p(3,hy+5,1,1,'#3a3a40');p(2,hy+6,1,1,'#3a3a40');} // orange headset + mic
 if(ch.active&&Math.floor(t/250)%2){p(6,hy-2,1,1,'#fff6a0');p(-7,hy+1,1,1,'#fff6a0');}
}// ---- state ----
const LOOKS={
 Friday:{hat:'#e8b830',shirt:'#d9a020',house:'manor',roof:'#c8962a'},
 Gladdus:{hat:'#5a3e8c',shirt:'#7a5aa8',house:'library',roof:'#6b4c9a',glasses:true},
 Coach:{hat:'#d04030',shirt:'#e05a3a',house:'gym',roof:'#b83a2a',band:true},
 Clima:{hat:'#7d8a99',shirt:'#9fb0c0',house:'tower',roof:'#5f7385',umbrella:true},
 ResI:{hat:'#f0c020',shirt:'#3a72c8',house:'workshop',roof:'#2f5fa8',hardhat:true},
 Dos:{hat:'#8a4cc8',shirt:'#a86ad8',house:'shop',roof:'#7a3cb0',scarf:true},
 Mark:{hat:'#c83a50',shirt:'#d85a6a',house:'cafe',roof:'#a83040',satchel:true},
 Luke:{hat:'#6b4a2a',shirt:'#3f9a7a',house:'study',roof:'#b8683a',book:true},
 Peter:{hat:'#5a3a22',shirt:'#3f8a3a',house:'build',roof:'#e07a2a',hoodie:true,headset:true,vest:true}};
let bots=[],selected=null,lastData=null;
const CHATTER={Friday:['Checking the schedule','Coffee for the team?','Morning huddle!'],Gladdus:['Shelving books','Indexing…','Shh, reading'],Coach:['Stretch first!','Hydrate!','Go for a walk?'],
 Clima:['Clouds rolling in','Checking radar','Wind check'],ResI:['Reading the news','Fresh headlines','Site walk'],Dos:["What's hot today?",'Scouting trends','Ooh, new idea'],Mark:['Ad trends…','Taking notes','Market stroll'],Luke:['Reading up','Making notes','Study time!'],Peter:['Pushing pixels','Fixing a typo','Ship it! 🚀','One more tweak…']};
const STATE_LABEL={working:'● working now',filed:'📜 filed a report',idle:'idle',asleep:'asleep'};
let pollRetry=0;
function netMsg(bad){let el=document.getElementById('net');if(!el){if(!bad)return;const l=document.getElementById('list');if(!l)return;el=document.createElement('div');el.id='net';el.setAttribute('role','status');l.parentNode.insertBefore(el,l);}
 el.textContent=bad?'⚠️ Couldn\'t reach the village, retrying…':'';el.classList.toggle('hide',!bad);}
async function poll(){clearTimeout(pollRetry);try{const r=await fetch('status.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('status '+r.status);const d=await r.json();if(!Array.isArray(d))throw new Error('bad status');lastData=d;netMsg(false);sync();}
 catch(e){netMsg(true);pollRetry=setTimeout(poll,30000);}} // the village keeps running; the list says we are retrying
function sync(){lastData.forEach((d,i)=>{if(!d||!HOUSES[d.name])return;let ch=bots.find(c=>c.key===d.name);
  if(!ch){const h=HOUSES[d.name],hm=homeOf(h);ch={key:d.name,x:hm.x+(i%2?6:-6),y:hm.y-2,tx:0,ty:0,dir:1,moving:false,wait:(DEMO?300:Math.random()*2000),phase:i*1.7,home:hm,look:LOOKS[d.name],
   act:null,path:null,cool:DEMO?0:10000+Math.random()*50000};bots.push(ch);}
  ch.name=String(d.name);ch.role=String(d.role||'');ch.state=String(d.state||'idle');ch.bucket=String(d.last_active_bucket||'');ch.active=ch.state==='working';});
 const u=lastData[0]&&lastData[0].updated_at;document.getElementById('upd').textContent=u?('Status updated '+new Date(u).toLocaleString('en-US',{timeZone:'America/New_York',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+' ET'):'';
 renderList();}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
// ---- daily life: idle activities (fishing, cooking, Coach's laps) ----
const QS=new URLSearchParams(location.search),DEMO=QS.has('demo')||QS.has('fast'),FORCE=DEMO?QS.get('force'):null; // ?demo/?fast: testing only, activities start right away
const ACT_LINES={fish:['🎣 Gone fishin\'','Here fishy fishy…','Bobber watch','Patience…','🎣 Any bites?'],cook:['🍲 Stew time!','Needs more salt…','Smells great!','Taste test… 😋','Secret recipe 🤫'],
 laps:['🏃 One more lap!','Keep the pace!','Lap time!','Feel the burn 💪'],walk:['🚶 Nice day for a walk','Fresh air!','Steady pace','Lovely out here'],
 seat:['🥪','😂','☕','🍎','😄'],nap:['Zzz…','💤','Zzz…'],toss:['✨','🤞','Make a wish…','✨ Lucky token'],inside:['…']};
const SPOTS={fish:[{x:324,y:208,dir:1,bob:{x:342,y:214}},{x:278,y:214,dir:1,bob:{x:298,y:222}}],cook:[{x:324,y:137,dir:1},{x:354,y:137,dir:-1}],
 // picnic seats: x,y = where the bot steps off the path; sx,sy = the seat itself (inside the blocked table area)
 seat:[{x:364,y:117,sx:364,sy:131,row:'n',dir:1},{x:374,y:117,sx:374,sy:131,row:'n',dir:-1},{x:364,y:146,sx:364,sy:138,row:'s',dir:1},{x:374,y:146,sx:374,sy:138,row:'s',dir:-1}],
 nap:[{x:230,y:204,sx:230,sy:203,hx:214,hy:198,col:'#3f9a7a'},{x:252,y:206,sx:252,sy:223,hx:236,hy:218,col:'#c83a50'}],
 toss:[{x:182,y:131,dir:1,tx:193,ty:129},{x:218,y:131,dir:-1,tx:207,ty:130}]};
const WL={rx:TRACK.rx+1,ry:TRACK.ry+1},MAX_WALKERS=3; // walkers use the outer lane, Coach jogs the inner one
let lapsBy=null,clock=0;const fx=[],smoke=[];
function rint(a,b){return a+Math.random()*(b-a);}
function freeSpots(type){return SPOTS[type].filter(s=>!s.by&&(!s.need||s.need()));}
function users(type){return bots.filter(o=>o.act&&o.act.type===type).length;}
// a bot sitting or napping leaves through its step-off point first, so paths never cut through the table or hammock
function route(ch,to){const e=ch.exit,p=findPath(e||ch,to);if(!p)return null;if(e){ch.exit=null;p.unshift({x:e.x,y:e.y});}return p;}
function trySpot(ch,type,spot,target){const path=route(ch,target||spot);if(!path)return false;spot.by=ch.key;if(spot.inner)path.push({x:spot.sx,y:spot.sy});
 ch.act={type,spot,phase:'go',until:0,next:0,say:null,sayUntil:0,item:null,itemUntil:0,dip:0};ch.path=path;ch.moving=true;return true;}
function lanePoint(ch,R){const a=Math.atan2((ch.y-TRACK.cy)/R.ry,(ch.x-TRACK.cx)/R.rx);return {x:TRACK.cx+Math.cos(a)*R.rx,y:TRACK.cy+Math.sin(a)*R.ry,a};}
function tryActivity(ch,skip){const opts=[];
 for(const k of ['fish','cook','seat','nap','toss','farm','chop','news','swim','golf','vend','shop','lemon','board'])if(freeSpots(k).length&&!(raining()&&(k==='swim'||k==='nap')))opts.push(k);
 if(ch.key==='Coach'){if(!lapsBy)opts.push('laps');}else if(users('walk')<MAX_WALKERS)opts.push('walk');
 if(ch.key==='Peter'&&SPOTS.build&&freeSpots('build').length)opts.push('build'); // only Peter works on the Build-ing
 opts.push('inside');
 // least-busy activity first (random tie-break) so the village stays varied
 let order=opts.filter(k=>k!==skip).map(k=>({k,n:k==='build'&&Math.random()<.6?-1:users(k)+Math.random()*.9})).sort((p,q)=>p.n-q.n).map(o=>o.k);
 if(FORCE){const fl=FORCE.split(',').map(f=>f==='cannon'?'swim':f).filter(f=>order.includes(f));order=[...fl,...order.filter(k=>!fl.includes(k))];} // ?demo&force=swim or a list like force=vend,golf (testing only)
 for(const type of order){
  if(type==='laps'){const p=lanePoint(ch,{rx:TRACK.rx-1,ry:TRACK.ry-1});if(walkable(p.x,p.y)&&trySpot(ch,'laps',p)){lapsBy=ch.key;return true;}continue;}
  if(type==='walk'){const p=lanePoint(ch,WL);if(walkable(p.x,p.y)&&trySpot(ch,'walk',p))return true;continue;}
  if(type==='inside'){const d=door(HOUSES[ch.key]);if(trySpot(ch,'inside',{x:d.x,y:d.y+4,dir:1})){ch.act.house=HOUSES[ch.key];return true;}continue;}
  if(type==='swim'){const fr=freeSpots('swim'),s=fr[(Math.random()*fr.length)|0];const cannon=(FORCE==='cannon'||Math.random()<.35)&&!bots.some(o=>o.act&&o.act.cannon);
   if(trySpot(ch,'swim',s,cannon?DOCK_END:null)){ch.act.cannon=cannon;return true;}continue;}
  const fr=freeSpots(type);const s=fr[(Math.random()*fr.length)|0];if(trySpot(ch,type,s))return true;}
 return false;}
function say(ch,s,ms){ch.act.say=s;ch.act.sayUntil=clock+(ms||3500);}
function endAct(ch,force){const a=ch.act;if(!a)return;if(a.type==='chop'){if(a.hold==='log'||a.log)WOOD.logs++;if(a.hold==='halves'||a.cs==='split')WOOD.halves=Math.min(20,WOOD.halves+2);}if(a.type==='golf'&&GOLF.turn===ch.key)GOLF.turn=null;if(a.spot)a.spot.by=null;if(a.type==='laps')lapsBy=null;
 const doing=a.phase==='do',wasCook=doing&&a.type==='cook';
 if(doing&&(a.type==='seat'||a.type==='nap'))ch.exit={x:a.spot.x,y:a.spot.y};
 else if(a.spot&&a.spot.x!=null&&['farm','news','swim','vend'].includes(a.type)&&!walkable(ch.x,ch.y))ch.exit={x:a.spot.x,y:a.spot.y}; // step out of the garden, off the bench, or swim to shore
 if(a.type==='inside'&&ch.inside){ch.inside=false;fx.push({k:'door',h:a.house,t0:clock,d:700});}
 ch.act=null;ch.carry=null;if(a.bought){ch.carry=a.bought;ch.carryUntil=clock+30000;}ch.cool=clock+(DEMO?20000:rint(60000,150000));ch.wait=1500;
 if(!force&&!ch.active&&ch.state!=='asleep'){
  // a cook may carry a bowl over to the picnic table; otherwise sometimes pick another activity right away
  if(wasCook&&Math.random()<.6){const fr=freeSpots('seat');if(fr.length){ch.carry='bowl';if(trySpot(ch,'seat',fr[(Math.random()*fr.length)|0]))return;ch.carry=null;}}
  if(Math.random()<.35&&tryActivity(ch,a.type))return;}
 ch.path=route(ch,ch.home);ch.moving=!!ch.path;}
function startDoing(ch){const a=ch.act,s=a.spot;if(ch.carry&&ch.carry!=='bowl')ch.carry=null;a.phase='do';a.until=clock+rint(20000,60000);a.next=clock+rint(3000,7000);ch.moving=a.type==='laps'||a.type==='walk';
 if(s.dir)ch.dir=s.dir;a.ang=s.a||0;a.lap=1;
 if(a.type==='seat'||a.type==='nap'){ch.x=s.sx;ch.y=s.sy;}
 if(a.type==='fish')say(ch,'🎣 Gone fishin\'',3000);else if(a.type==='cook'){say(ch,'🍲 Stew time!',3000);WOOD.halves=Math.max(0,WOOD.halves-2);}else if(a.type==='laps')say(ch,'🏃 Laps!',3000);
 else if(a.type==='walk'){say(ch,'🚶 Walk time!',3000);a.hold=!walkGap(ch);}
 else if(a.type==='seat'){if(ch.carry==='bowl'){a.bowl=true;ch.carry=null;say(ch,'🥣 Soup\'s on!',3000);}else say(ch,['🥪','☕','😄'][(Math.random()*3)|0],2500);}
 else if(a.type==='nap')say(ch,'💤',2500);
 else if(a.type==='toss'){a.next=clock+rint(1200,2500);}
 else if(a.type==='farm'){a.next=clock+rint(800,1600);say(ch,'🌱 Garden time!',2500);}
 else if(a.type==='chop'){a.cs='get';a.goals=[CHOPPTS.get];a.log=false;a.hit=false;a.hold=null;say(ch,'🪓 Chop chop!',2500);}
 else if(a.type==='news'){a.next=clock+rint(3000,6000);say(ch,'📰 Extra! Extra!',2500);}
 else if(a.type==='swim'){a.sub=a.cannon?'jump':'swimto';a.j0=clock;a.jx=ch.x;a.jy=ch.y;a.ang=Math.random()*Math.PI*2;say(ch,a.cannon?'CANNONBALL!':'🏊 Splish splash!',2200);}
 else if(a.type==='golf')initGolf(ch,a);
 else if(a.type==='vend'){a.start=clock;a.lines=VLINES[s.stall];a.next=clock+rint(5000,9000);say(ch,a.lines[0],2600);}
 else if(a.type==='shop'){a.until=clock+rint(20000,35000);a.buyAt=a.until-3500;a.next=clock+rint(2500,4500);say(ch,'🛍️ Market time!',2200);}
 else if(a.type==='lemon'){a.pourAt=clock+rint(800,1600);a.next=clock+rint(4000,6000);say(ch,'🍋 One lemonade, please!',2200);}
 else if(a.type==='build'){a.t0=clock;a.k=0;a.rest=0;a.next=clock+rint(4000,8000);say(ch,'🔨 Back to building!',2500);}
 else if(a.type==='inside'){ch.inside=true;a.until=clock+rint(10000,30000);a.next=clock+rint(1500,3000);fx.push({k:'door',h:a.house,t0:clock,d:700});}}
function angOf(o){return ((o.act.ang%(Math.PI*2))+Math.PI*2)%(Math.PI*2);}
function walkGap(ch){const me=angOf(ch);return !bots.some(o=>o!==ch&&o.act&&o.act.type==='walk'&&o.act.phase==='do'&&!o.act.hold&&(d=>Math.min(d,Math.PI*2-d))(Math.abs(angOf(o)-me))<1.7);}
const WISH=['✨','🤞','✨ Make a wish','🍀','🤞 Fingers crossed'];
function tickAct(ch,dt){const a=ch.act;
 if(clock>a.until){if((a.type==='fish'||a.type==='farm')&&a.item)return;if(a.type==='chop'&&a.phase==='do'&&a.cs&&a.cs!=='get'&&a.cs!=='ret'&&clock-a.until<20000){tickChop(ch,a,dt);return;}if(a.type==='swim'&&a.sub==='jump'){tickSwim(ch,a,dt);return;}
  if(a.type==='inside'&&!a.out){a.out=true;ch.inside=false;fx.push({k:'door',h:a.house,t0:clock,d:700});a.until=clock+700;return;}
  endAct(ch);return;}
 if(a.type==='fish'){const bob=a.spot.bob;
  if(a.dip&&clock>a.dip){a.dip=0;const r=Math.random();
   if(r<.12){a.item='boot';say(ch,Math.random()<.5?'👢 …a boot?!':'👢 Not again!');}
   else if(r<.62){a.item='fish';say(ch,['🐟 Got one!','🐟 A whopper!','Tiny fish, big pride'][(Math.random()*3)|0]);fx.push({k:'splash',x:bob.x,y:bob.y,t0:clock,d:600});}
   else say(ch,['So close!','It got away…','Nibble…'][(Math.random()*3)|0],2500);
   a.itemUntil=clock+2500;}
  if(a.item&&clock>a.itemUntil)a.item=null;
  if(clock>a.next&&!a.dip&&!a.item){if(Math.random()<.55){a.dip=clock+1200;}
   else fx.push({k:'jump',x:bob.x+(Math.random()<.5?-9:9),y:bob.y+(Math.random()*4-2),t0:clock,d:800,dir:Math.random()<.5?-1:1});
   a.next=clock+rint(5000,10000);}}
 else if(a.type==='cook'){if(clock>a.next){if(Math.random()<.22){fx.push({k:'flare',t0:clock,d:1300});say(ch,'🔥 Whoa, too hot!',2500);
    smoke.push({x:FIRE.x,y:FIRE.y-14,t0:clock,dark:true});}else say(ch,ACT_LINES.cook[(Math.random()*5)|0],3000);a.next=clock+rint(7000,13000);}}
 else if(a.type==='laps'||a.type==='walk'){const jog=a.type==='laps',R=jog?{rx:TRACK.rx-1,ry:TRACK.ry-1}:WL;
  if(a.hold){ch.moving=false;if(walkGap(ch)){a.hold=false;ch.moving=true;}else{if(clock>a.next){say(ch,'Stretching…',2000);a.next=clock+4000;}return;}}
  const sp=(DEMO?2:1)*(jog?26:14)*dt/1000,L=Math.PI*(R.rx+R.ry);const pa=a.ang;a.ang+=sp/L*Math.PI*2;
  const nx=TRACK.cx+Math.cos(a.ang)*R.rx,ny=TRACK.cy+Math.sin(a.ang)*R.ry;if(Math.abs(nx-ch.x)>.05)ch.dir=nx<ch.x?-1:1;ch.x=nx;ch.y=ny;
  if(Math.floor(pa/(Math.PI*2))!==Math.floor(a.ang/(Math.PI*2))){a.lap++;say(ch,(jog?'🏃 Lap ':'🚶 Lap ')+a.lap+'!',2500);}}
 else if(a.type==='seat'){if(clock>a.next){say(ch,['🥪','😂','☕','🍎','😄','🥤'][(Math.random()*6)|0],2500);a.next=clock+rint(5000,11000);}}
 else if(a.type==='nap'){if(clock>a.next){if(Math.random()<.4)say(ch,'💤',2000);a.next=clock+rint(8000,14000);}}
 else if(a.type==='toss'){
  if(clock>a.next){a.toss=clock;fx.push({k:'token',x0:ch.x+ch.dir*5,y0:ch.y-15,x1:a.spot.tx,y1:a.spot.ty,t0:clock+250,d:700});
   a.wish=Math.random()<.6?clock+1300:0;a.next=clock+rint(6000,11000);}
  if(a.wish&&clock>a.wish){a.wish=0;say(ch,WISH[(Math.random()*WISH.length)|0],2800);}}
 else if(a.type==='farm')tickFarm(ch,a);else if(a.type==='chop')tickChop(ch,a,dt);else if(a.type==='board')tickBoard(ch,a);else if(a.type==='news')tickNews(ch,a);else if(a.type==='swim')tickSwim(ch,a,dt);
 else if(a.type==='build')tickBuild(ch,a);
 else if(a.type==='golf')tickGolf(ch,a,dt);else if(a.type==='vend')tickVend(ch,a);else if(a.type==='shop')tickShop(ch,a);else if(a.type==='lemon')tickLemon(ch,a);
 else if(a.type==='inside'&&ch.inside){if(clock>a.next){const h=a.house;if(ch.look.house!=='tower'&&ch.look.house!=='study'&&ch.look.house!=='build')smoke.push({x:h.x+h.w-10,y:h.y-6,t0:clock});a.next=clock+rint(1800,3200);}}}
// wandering + real state always wins (working = busy near the house, asleep = home, Zzz; a napping bot may keep sleeping in its hammock)
function followPath(ch,dt){const p=ch.path[0],dx=p.x-ch.x,dy=p.y-ch.y,d=Math.hypot(dx,dy),sp=(DEMO?2.5:1)*(ch.active?22:14)*dt/1000;
 if(d<=sp){ch.x=p.x;ch.y=p.y;ch.path.shift();}else{ch.x+=dx/d*sp;ch.y+=dy/d*sp;}if(Math.abs(dx)>.3)ch.dir=dx<0?-1:1;ch.moving=true;
 if(!ch.path.length){ch.path=null;ch.moving=false;if(ch.act&&ch.act.phase==='go')startDoing(ch);else ch.wait=1500+Math.random()*3000;}}
function update(dt){clock+=dt;petsUpdate(dt);if(clock<DANCE.until)return;for(const ch of bots){
 const napping=ch.act&&ch.act.type==='nap'&&ch.act.phase==='do';
 if(ch.act&&(ch.state==='working'||(ch.state==='asleep'&&!napping)))endAct(ch,true);
 if(napping&&ch.state==='asleep')ch.act.until=clock+60000; // asleep in the hammock: stay put
 if(ch.path){followPath(ch,dt);continue;}
 if(ch.act){tickAct(ch,dt);continue;}
 if(ch.state==='asleep'){ch.moving=false;if(Math.hypot(ch.x-ch.home.x,ch.y-ch.home.y)>14){ch.path=route(ch,ch.home);}continue;}
 if(ch.exit){ch.path=route(ch,ch.home);if(ch.path)continue;}
 if(ch.moving){const dx=ch.tx-ch.x,dy=ch.ty-ch.y,d=Math.hypot(dx,dy),sp=(ch.active?22:12)*dt/1000;
  if(d<1){ch.moving=false;ch.wait=1500+Math.random()*4000;continue;}const nx=ch.x+dx/d*sp,ny=ch.y+dy/d*sp;if(!walkable(nx,ny)){ch.moving=false;ch.wait=500;continue;}
  ch.x=nx;ch.y=ny;if(Math.abs(dx)>.3)ch.dir=dx<0?-1:1;}else{ch.wait-=dt;if(ch.wait<=0){
  if(!ch.active&&(ch.state==='idle'||ch.state==='filed')&&clock>ch.cool&&Math.random()<(DEMO?1:.05)&&tryActivity(ch))continue;
  for(let k=0;k<12;k++){const base=Math.random()<.2?{x:plaza.x,y:plaza.y+20}:ch.home;const tx=base.x+(Math.random()-.5)*60,ty=base.y+(Math.random()-.5)*30;
   if(walkable(tx,ty)&&clearLine(ch,{x:tx,y:ty})){ch.tx=tx;ch.ty=ty;ch.moving=true;break;}}if(!ch.moving)ch.wait=800;}}}}
// ---- animated overlays ----
function line(c,x0,y0,x1,y1,col){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))|0;for(let i=0;i<=n;i++)px(c,x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,1,1,col);}
function drawActProps(c,ch,t){drawCarry(c,ch,t);const a=ch.act;if(!a||a.phase!=='do')return;const x=Math.round(ch.x),y=Math.round(ch.y),f=ch.dir;
 if(a.type==='fish'){const hx=x+f*5,hy=y-6,tx=x+f*12,ty=y-16,bob=a.spot.bob;
  const bend=a.dip?2:0;line(c,hx,hy,tx,ty+bend,'#7a4a24');px(c,hx-1,hy,2,2,'#5a3a20');
  const by=bob.y+(a.dip?2:(Math.floor(t/500)%2));
  for(let i=1;i<10;i++){const p=i/10,lx=tx+(bob.x-tx)*p,ly=ty+bend+(by-ty-bend)*p+Math.sin(p*Math.PI)*3;px(c,lx,ly,1,1,'rgba(255,255,255,.75)');}
  px(c,bob.x-1,by-1,3,2,'#e83a3a');px(c,bob.x-1,by+1,3,1,'#ffffff');
  if(a.dip){px(c,bob.x-3,by+2,1,1,P.w2);px(c,bob.x+3,by+2,1,1,P.w2);}
  if(a.item){const ix=x,iy=y-26;if(a.item==='fish'){px(c,ix-3,iy,6,3,'#f0903a');px(c,ix-3,iy+1,6,1,'#ffb060');px(c,ix+3,iy-1,2,5,'#e07020');px(c,ix-2,iy,1,1,P.out);}
   else{px(c,ix-2,iy-3,3,5,'#6b4526');px(c,ix-2,iy+2,6,2,'#6b4526');px(c,ix-2,iy+3,6,1,'#3a2416');px(c,ix-2,iy-3,3,1,'#8a5a34');px(c,ix-4,iy+3,1,2,P.w2);}
   px(c,ix,iy+4,1,(y-6)-(iy+4),'rgba(255,255,255,.6)');}}
 if(a.type==='cook'){const sx=x+f*5,s=Math.floor(t/300)%2;line(c,sx,y-6,sx+f*(3+s),y-12+s,'#c89058');}
 if(a.type==='golf')drawPutter(c,ch,a,x,y,f);if(a.type==='shop'&&a.item)drawItem(c,x,y-27,a.item);if(a.type==='lemon')drawLemonCup(c,ch,a,x,y,f);if(a.type==='vend')drawPitcher(c,ch,a,x,y,f);
 if(a.type==='build')drawHammer(c,ch,a,x,y,f);
 if(a.type==='farm')drawFarmTool(c,ch,a,x,y,f,t);if(a.type==='chop')drawAxe(c,ch,a,x,y,f,t);if(a.type==='news'&&a.phase==='do')drawPaper(c,ch,a,x,y,f,t);
 if(a.type==='toss'&&a.toss&&clock-a.toss<800){const dt=clock-a.toss,ax=x+(f>0?3:-5),ay=dt<250?y-13:y-16;px(c,ax,ay,2,5,P.skin);if(dt<250)px(c,ax,ay-2,2,2,'#ffd34a');}}
function drawCarry(c,ch,t){if(!ch.carry||ch.inside)return;if(ch.carry!=='bowl'){if(clock>ch.carryUntil){ch.carry=null;return;}if(!ch.act||ch.act.phase!=='do')drawItem(c,Math.round(ch.x)+ch.dir*5,Math.round(ch.y)-9,ch.carry);return;}const x=Math.round(ch.x)+ch.dir*2-2,y=Math.round(ch.y)-8;px(c,x,y,5,2,'#b05a30');px(c,x,y,5,1,'#f0c060');px(c,x+1,y+2,3,1,'#8a4020');
 if(Math.floor(t/400)%2)px(c,x+2,y-2,1,1,'rgba(255,255,255,.7)');}
function hairOf(L){return L.glasses||L.hardhat?'#6b4526':L.band?'#5a3a20':L.umbrella?'#d0d8e0':(L.hat||'#6b4526');}
function drawBot(c,ch,t){const a=ch.act,doing=a&&a.phase==='do';
 const posed=doing&&['nap','seat','news','swim','vend'].includes(a.type)||inWater(ch),oy=ch.y,od=ch.dir,R=ch.react&&clock-ch.react.t0<ch.react.d?ch.react:null;
 if(!posed){const rp=R?(clock-R.t0)/R.d:0;
  if(R&&R.k==='jump')ch.y-=Math.abs(Math.sin(rp*Math.PI*2))*6;if(R&&R.k==='spin')ch.dir=Math.floor(rp*10)%2?-od:od;
  if(clock<DANCE.until&&!RM){ch.y-=Math.abs(Math.sin(t/140+ch.phase))*3;ch.dir=Math.floor(t/350+ch.phase)%2?-1:1;}}
 drawBot0(c,ch,t,a,doing);if(rainUmb(ch))drawUmb(c,ch,t);
 if(R&&R.k==='wave'&&!posed){const x=Math.round(ch.x),y=Math.round(ch.y),up=Math.floor((clock-R.t0)/180)%2;px(c,ch.dir>0?x+3:x-5,y-13-(up?3:1),2,4,P.skin);px(c,ch.dir>0?x+3+(up?1:0):x-5-(up?1:0),y-16-(up?3:1),2,2,P.skin);}
 ch.y=oy;ch.dir=od;}
function drawBot0(c,ch,t,a,doing){
 if(doing&&a.type==='swim'&&a.sub==='jump'){drawBall(c,ch,t);return;}
 if(inWater(ch)){drawSwim(c,ch,t);return;}
 if(doing&&a.type==='news'){c.save();c.beginPath();c.rect(0,0,W,120);c.clip();drawChar(c,ch,t);c.restore();return;}
 if(doing&&a.type==='vend'){c.save();c.beginPath();c.rect(0,0,W,247);c.clip();drawChar(c,ch,t);c.restore();return;} // the stall counter hides the legs
 if(doing&&a.type==='lemon'&&clock<a.sour){const ox=ch.x;ch.x+=Math.floor(t/60)%2?.6:-.6;drawChar(c,ch,t);drawSour(c,ch,t);ch.x=ox;return;} // sour face + shiver
 if(doing&&a.type==='nap'){drawNap(c,ch,t);return;}
 if(doing&&a.type==='seat'){const n=a.spot.row==='n';c.save();c.beginPath();c.rect(0,0,W,n?TABLE.y:TABLE.y+10);c.clip();drawChar(c,ch,t); // the table (north) or bench (south) hides the legs
  if(!n){const x=Math.round(ch.x),y=Math.round(ch.y),bob=Math.floor(t/600+ch.phase)%2,hy=y-17+bob;px(c,x-4,hy+1,8,5,hairOf(ch.look));px(c,x-4,hy+6,8,1,shade(P.skin,-18));} // seen from behind
  c.restore();return;}
 drawChar(c,ch,t);}
function drawNap(c,ch,t){const s=ch.act.spot,L=ch.look,sw=Math.round(Math.sin(t/900+ch.phase)),bx=s.hx+7+sw,by=s.hy;
 px(c,bx+6,by-5,13,6,P.out);px(c,bx+7,by-4,11,4,L.shirt||'#4a8a3a');px(c,bx+7,by-1,11,1,shade(L.shirt||'#4a8a3a',-40));px(c,bx+11,by-4,3,2,P.skin); // body, hands on tummy
 px(c,bx+18,by-4,3,2,'#5a3a20');px(c,bx+18,by-2,3,2,'#5a3a20'); // feet
 px(c,bx-1,by-8,9,8,P.out);px(c,bx,by-7,7,6,P.skin);px(c,bx,by-7,2,6,hairOf(L));px(c,bx-1,by-8,3,8,shade(hairOf(L),-20)); // head, hair on the pillow side
 px(c,bx+4,by-6,1,2,'#2a1d14');px(c,bx+4,by-3,1,2,'#2a1d14');px(c,bx+6,by-6,1,1,'#f39a8a'); // closed eyes
 for(let i=2;i<22;i++){const q=Math.round(Math.sin(i/23*Math.PI)*5),X=s.hx+4+i,Y=s.hy-4+q;px(c,X,Y+1,1,1,'#fff6dc');px(c,X,Y+2,1,1,s.col);px(c,X,Y+3,1,1,'rgba(0,0,0,.25)');} // hammock wraps round
 for(let i=0;i<3;i++){const p=((t/2600)+i/3)%1,zx=bx+3+p*7+Math.sin(p*6+i)*1.5,zy=by-11-p*14,a=(1-p).toFixed(2),col=`rgba(255,255,255,${a})`,sh=`rgba(40,30,60,${(a*.6).toFixed(2)})`;
  if(p<.45){px(c,zx+1,zy+1,2,1,sh);px(c,zx,zy,2,1,col);px(c,zx,zy+1,1,1,col);px(c,zx,zy+2,2,1,col);}
  else{px(c,zx+1,zy+1,3,1,sh);px(c,zx,zy,3,1,col);px(c,zx+1,zy+1,1,1,col);px(c,zx,zy+2,3,1,col);}}}
function drawTableItems(c,t){for(const s of SPOTS.seat){const o=s.by&&bots.find(b2=>b2.key===s.by);if(!o||!o.act||o.act.phase!=='do'||!o.act.bowl)continue;
 const x=s.sx-2,y=s.row==='n'?TABLE.y+2:TABLE.y+4;px(c,x,y,5,2,'#b05a30');px(c,x,y,5,1,'#f0c060');px(c,x+1,y+2,3,1,'#8a4020');
 if(Math.floor(t/400)%2)px(c,x+2,y-2,1,1,'rgba(255,255,255,.7)');else px(c,x+1,y-3,1,1,'rgba(255,255,255,.6)');}}
function drawHouseFx(c,t){for(const e of fx){if(e.k!=='door'||clock<e.t0||clock>e.t0+e.d)continue;const h=e.h,dx=h.x+h.w/2-3,dy=h.y+h.h-9; // door swings open
  px(c,dx,dy,6,9,'#2a1d14');px(c,dx+1,dy+3,4,6,'#6a4422');px(c,dx+1,dy+7,4,2,'#c89050');px(c,dx-2,dy,2,9,'#8a5228');px(c,dx-2,dy,2,1,'#a86a38');}
 for(const ch of bots){if(!ch.inside||!ch.act||!ch.act.house)continue;const h=ch.act.house,wallH=h.h-Math.floor(h.h*.5),wy=winY(h);if(wallH<12)continue;
  const f=.35+.25*Math.sin(t/180+ch.phase)+.12*Math.sin(t/53);[[h.x+6,wy],[h.x+h.w-12,wy]].forEach(([x,y])=>{c.fillStyle=`rgba(255,214,110,${f.toFixed(2)})`;c.fillRect(x,y,6,5);});}}
function drawFire(c,t){const cooking=SPOTS.cook.some(s=>s.by&&bots.find(b2=>b2.key===s.by&&b2.act&&b2.act.phase==='do'));
 const flare=fx.some(e=>e.k==='flare');const fx0=FIRE.x,fy0=FIRE.y-1;
 if(cooking){const hgt=flare?10:4;for(let i=-3;i<=3;i++){const h=Math.max(1,Math.round(hgt-Math.abs(i)*.9+Math.sin(t/90+i*2.1)*1.6));px(c,fx0+i,fy0-h,1,h,Math.abs(i)<2?'#ffd34a':'#ff7a2a');px(c,fx0+i,fy0-h,1,1,'#ff4a1a');}
  for(let i=0;i<3;i++){const p=((t/1400+i/3)%1);px(c,fx0-2+i*2+Math.sin(t/400+i)*1.5,FIRE.y-16-p*6,1,1,'rgba(255,255,255,'+(.8-p*.7).toFixed(2)+')');} // steam
  if(!smoke.lastT||clock-smoke.lastT>800){smoke.push({x:fx0+rint(-2,2),y:FIRE.y-16,t0:clock});smoke.lastT=clock;}}
 else if(Math.floor(t/700)%2)px(c,fx0-1,fy0,2,1,'#ff6a2a');}
function drawSmoke(c){for(let i=smoke.length-1;i>=0;i--){const s=smoke[i],p=(clock-s.t0)/3200;if(p>=1){smoke.splice(i,1);continue;}
 const r=Math.round(1+p*3),x=s.x+Math.sin(p*5+s.t0)*3+p*6,y=s.y-p*26;c.fillStyle=s.dark?`rgba(60,50,50,${(.7-p*.6).toFixed(2)})`:`rgba(220,220,225,${(.6-p*.55).toFixed(2)})`;c.fillRect(Math.round(x-r),Math.round(y-r),r*2,r*2);}}
function drawFx(c){for(let i=fx.length-1;i>=0;i--){const e=fx[i],p=(clock-e.t0)/e.d;if(p<0)continue;
 if(p>=1){fx.splice(i,1);if(e.k==='token'){fx.push({k:'ripple',x:e.x1,y:e.y1,t0:clock,d:1000},{k:'sparkle',x:e.x1,y:e.y1-4,t0:clock,d:900},{k:'splash',x:e.x1,y:e.y1,t0:clock,d:400});}continue;}
 if(FX3[e.k]){FX3[e.k](c,e,p);continue;}
 if(e.k==='door')continue;
 if(e.k==='token'){const x=e.x0+(e.x1-e.x0)*p,y=e.y0+(e.y1-e.y0)*p-Math.sin(p*Math.PI)*10;px(c,x-1,y-1,2,2,'#ffd34a');px(c,x-1,y-1,1,1,'#fff6a0');px(c,x,y,1,1,'#c8962a');}
 else if(e.k==='ripple'){const r=1+p*6,a=(.85-p*.8).toFixed(2);for(let k=0;k<14;k++){const q=k/14*Math.PI*2;px(c,e.x+Math.cos(q)*r,e.y+Math.sin(q)*r*.45,1,1,`rgba(230,248,255,${a})`);}}
 else if(e.k==='sparkle'){const on=Math.floor(p*6)%2===0,r=on?2:1;px(c,e.x,e.y-r,1,r*2+1,'#fff6a0');px(c,e.x-r,e.y,r*2+1,1,'#fff6a0');px(c,e.x,e.y,1,1,'#ffffff');if(on){px(c,e.x+4,e.y-3,1,1,'#ffe68a');px(c,e.x-4,e.y+2,1,1,'#ffe68a');}}
 if(e.k==='jump'){const x=e.x+e.dir*(p*10-5),y=e.y-Math.sin(p*Math.PI)*9;px(c,x-2,y-1,4,2,'#f0903a');px(c,x-e.dir*3,y-2,1,3,'#e07020');px(c,x+e.dir*1,y-1,1,1,P.out);
  if(p<.15||p>.85){const sx=e.x+e.dir*(p<.5?-5:5);px(c,sx-2,e.y,1,1,'#ffffff');px(c,sx+2,e.y,1,1,'#ffffff');px(c,sx,e.y-2,1,1,'#ffffff');}}
 else if(e.k==='splash'){const r=Math.round(2+p*5);px(c,e.x-r,e.y,1,1,'#ffffff');px(c,e.x+r,e.y,1,1,'#ffffff');px(c,e.x,e.y-r+1,1,1,P.w2);px(c,e.x-r+1,e.y-2,1,1,P.w2);px(c,e.x+r-1,e.y-2,1,1,P.w2);}}}
function drawAmbient(c,t){ // fountain spray, duck, windsock, antenna blink
 const x=plaza.x,y=plaza.y-12;for(let i=0;i<6;i++){const p=((t/900)+i/6)%1,d=i%2?1:-1,ax=x+d*(1+p*7),ay=y-2-Math.sin(p*Math.PI)*5+p*8;px(c,ax,ay,1,1,i%3?P.w2:'#ffffff');}
 px(c,x-1,y-4+Math.floor(t/250)%2,2,2,'#d8f0ff');
 const da=t/9000+DUCKX.off,dx=362+Math.cos(da)*10,dy=226+Math.sin(da)*5,dd=-Math.sin(da)>=0?1:-1;DUCK.x=dx;DUCK.y=dy-1;
 if(clock<EGGFX.ducklings)for(let k=1;k<=3;k++){const q=da-k*.32,kx=362+Math.cos(q)*10,ky=226+Math.sin(q)*5,kd=-Math.sin(q)>=0?1:-1;px(c,kx-1,ky-1,3,2,'#f8e060');px(c,kx+kd*2,ky-2,2,2,'#f8e060');px(c,kx+kd*3,ky-1,1,1,'#f0a020');px(c,kx-1,ky+1,3,1,P.w3);}
 px(c,dx-3,dy-2,6,3,'#ffffff');px(c,dx+dd*2,dy-4,3,3,'#ffffff');px(c,dx+dd*4,dy-3,2,1,'#f0a020');px(c,dx+dd*3,dy-4,1,1,P.out);px(c,dx-3,dy+1,6,1,P.w3);
 const w=Math.floor(t/220)%3;for(let i=0;i<6;i++)px(c,137+i,62+Math.round(Math.sin(t/200+i*.9)*(i/3))+(i>3?w>>1:0),1,2,i%2?'#ffffff':'#ff7a2a');
 const f=HOUSES.Friday;if(Math.floor(t/600)%2)px(c,f.x+8,f.y-8,1,1,'#ff4040');else px(c,f.x+8,f.y-8,1,1,'#7a2020');}
// sky / tint by ET hour
function etHour(){const q=DEMO?QS.get('hour'):null;if(q!==null&&q!==''&&!isNaN(+q))return +q;return +new Date().toLocaleString('en-US',{timeZone:'America/New_York',hour:'numeric',hour12:false})%24;}
function tint(h){if(h>=7&&h<17)return null;if(h>=17&&h<19)return 'rgba(255,140,60,.16)';if(h>=5&&h<7)return 'rgba(255,170,120,.14)';return 'rgba(30,40,110,.38)';}
let last=0;
function frame(t){requestAnimationFrame(frame); // schedule first so the loop never stops, even if a frame throws or status.json hasn't loaded
 if((MOBILE||RM)&&t-last<28)return; // phones (and reduced motion) run at ~30 fps: plenty for pixel art, kinder to batteries
 const dt=Math.max(0,Math.min(100,t-last));last=t;update(dt);
 g.drawImage(bg,0,0);
 // water shimmer
 for(let i=0;i<14;i++){const a=(t/900+i*1.3),sx=pond.cx-44+((i*29+Math.floor(a*3))%88),sy=pond.cy-22+(i*7)%46;if(tileAt(Math.floor(sx/T),Math.floor(sy/T))===2&&tileAt(Math.floor((sx+3)/T),Math.floor(sy/T))===2&&!(sx>316&&sx<332&&sy<228))px(g,sx,sy,3,1,P.w2);}
 drawPlots(g,t);drawChopArea(g,t);drawBuildLive(g,t);drawGolfLive(g,t);drawGround4(g,t);drawCrow(g,t);drawAmbient(g,t);drawFire(g,t);drawFx(g);
 // characters sorted by y
 drawHouseFx(g,t);drawTableItems(g,t);
 [...bots,...PETS].sort((a,c)=>a.y-c.y).forEach(ch=>{if(ch.pet){drawPet(g,ch,t);return;}if(ch.inside)return;drawBot(g,ch,t);drawActProps(g,ch,t);});
 drawSmoke(g);drawEggFx(g,t);drawSky4(g,t);
 const h=etHour(),tn=tint(h);if(tn){g.fillStyle=tn;g.fillRect(0,0,W,H);
  if(h>=18||h<6){g.globalCompositeOperation='lighter';LAMPS.forEach(([x,y])=>glow(g,x+1,y-1,14,'rgba(255,200,90,.35)'));
   for(const k in HOUSES){const hh=HOUSES[k],wy=winY(hh);if(hh.h*.5>=12){glow(g,hh.x+9,wy+2,6,'rgba(255,210,110,.5)');glow(g,hh.x+hh.w-9,wy+2,6,'rgba(255,210,110,.5)');}}
   glow(g,plaza.x,plaza.y-2,22,clock<EGGFX.show?`hsla(${(t/8)%360|0},90%,60%,.55)`:'rgba(110,190,255,.45)');glow(g,plaza.x,plaza.y-12,8,'rgba(200,240,255,.5)'); // fountain lights
   glow(g,FIRE.x,FIRE.y-3,SPOTS.cook.some(s=>s.by)?22:8,'rgba(255,140,50,.45)');
   g.globalCompositeOperation='source-over';if(fliesOK())for(let i=0;i<8;i++){const fx2=(i*53+Math.sin(t/1500+i)*12)%W,fy=60+(i*37)%200+Math.cos(t/1200+i)*6;px(g,fx2,fy,1,1,'#f8ff90');}}}
 drawNight4(g,t,h);ctx.imageSmoothingEnabled=false;ctx.drawImage(low,0,0,W*S,H*S);
 // labels and bubbles at screen res
 ctx.textAlign='center';ctx.textBaseline='middle';const fs=Math.round(Math.max(MOBILE?11:10,S/K*3.6)*K);ctx.font=`bold ${fs}px "Trebuchet MS",Verdana,sans-serif`;
 const placedL=[];drawSigns(placedL);bots.filter(ch=>!ch.inside).sort((a,c)=>(c===selected)-(a===selected)||a.y-c.y).forEach(ch=>label(ch.name,ch.x*S,ch.y*S+fs*0.9,ch===selected,null,placedL,true));
 const placed=placedL.map(r=>({x:r.x-r.w/2,y:r.y-r.h/2,w:r.w,h:r.h}));bots.filter(ch=>!ch.inside).sort((a,c)=>(c===selected)-(a===selected)||c.y-a.y).forEach(ch=>{const sx=ch.x*S,sy=ch.y*S;
  const bt=bubbleText(ch,t),evt=(ch.act&&ch.act.say&&clock<ch.act.sayUntil)||(ch.quip&&clock<ch.quip.until);
  if(bt&&(!MOBILE||ch===selected||ch.active||evt||bots.indexOf(ch)===Math.floor(t/6000)%Math.max(1,bots.length)))bubble(bt.length>30?bt.slice(0,29)+'…':bt,sx,sy-bubOff(ch)*S,fs,ch.active,placed);});
 petBubbles(fs,placed);drawTexts(fs,placed);
 ctx.font=`bold ${fs}px "Trebuchet MS",Verdana,sans-serif`;placedL.forEach(r=>{if(!r.sign)drawLabel(r.x,r.y,r.w,r.h,r.s,r.sel,r.col);}); // names on top so bubble tails never hide them
 // title
 ctx.font=`bold ${Math.round(fs*1.1)}px "Trebuchet MS",Verdana,sans-serif`;label('Bot Hollow',W*S/2,13*S,false,'#ffe68a');placeCard();}
const GLOWS=new Map(); // radial-gradient sprites cached by radius+colour (night glows used to rebuild gradients every frame)
function glow(c,x,y,r,col){r=Math.max(1,Math.round(r));const key=r+'|'+col;let sp=GLOWS.get(key);
 if(!sp){if(GLOWS.size>320)GLOWS.clear();sp=document.createElement('canvas');sp.width=sp.height=r*2;const q=sp.getContext('2d'),gr=q.createRadialGradient(r,r,0,r,r,r);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');q.fillStyle=gr;q.fillRect(0,0,r*2,r*2);GLOWS.set(key,sp);}
 c.drawImage(sp,x-r,y-r);}
function label(s,x,y,sel,col,placed,defer){const w=ctx.measureText(s).width+12,h=parseInt(ctx.font.match(/(\d+)px/)[1])+6;x=Math.min(Math.max(x,w/2+2),cv.width-w/2-2);y=Math.min(y,cv.height-h/2-2);
 if(placed){for(let n=0;n<6;n++){const o=placed.find(r=>Math.abs(r.x-x)<(r.w+w)/2+2&&Math.abs(r.y-y)<(r.h+h)/2+1);if(!o)break;y=o.y+(o.h+h)/2+2;if(y>cv.height-h/2-2)y=o.y-(o.h+h)/2-2;}placed.push({x,y,w,h,s,sel,col});if(defer)return;}drawLabel(x,y,w,h,s,sel,col);}
function drawLabel(x,y,w,h,s,sel,col){ctx.fillStyle=sel?'rgba(120,70,10,.9)':'rgba(30,20,10,.72)';rr(x-w/2,y-h/2,w,h,h/2);ctx.fill();ctx.fillStyle=col||(sel?'#ffe68a':'#fff6dc');ctx.fillText(s,x,y+1);}
function bubble(s,x,y,fs,act,placed){ctx.font=`${Math.round(fs*0.9)}px "Trebuchet MS",Verdana,sans-serif`;const w=ctx.measureText(s).width+16*K,h=fs*1.6;const tx=x,ty=y;x=Math.min(Math.max(x,w/2+2),cv.width-w/2-2);y=Math.max(y,h+3);const y0=y;
 // nudge up (or, at the top edge, down) so bubbles never cover each other
 if(placed){for(let n=0;n<8;n++){const o=placed.find(r=>x-w/2<r.x+r.w+3&&x+w/2>r.x-3&&y-h<r.y+r.h+3&&y>r.y-3);if(!o)break;y=o.y-4;if(y-h<2)y=o.y+o.h+h+4;}
  if(!act&&Math.abs(y-y0)>h*2.2)return; // too crowded: skip this bubble for now (bubbles rotate, it comes back later)
  placed.push({x:x-w/2,y:y-h,w,h});}
 const c2=8*K+Math.max(0,ty-y);
 ctx.fillStyle=act?'#fff6c0':'#fffdf4';ctx.strokeStyle='#3a2a1a';ctx.lineWidth=Math.max(2,S*.7);rr(x-w/2,y-h,w,h,6);ctx.fill();ctx.stroke();
 {const a=5*K,c=Math.min(c2,8*K+h*3),q=Math.min(Math.max(tx,x-w/2+a+4),x+w/2-a-4);ctx.beginPath();ctx.moveTo(q-a,y-1);ctx.lineTo(q,y+c);ctx.lineTo(q+a,y-1);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(q-a,y);ctx.lineTo(q,y+c);ctx.lineTo(q+a,y);ctx.stroke();}
 ctx.fillStyle='#3a2a1a';ctx.fillText(s,x,y-h/2+1);ctx.font=`bold ${fs}px "Trebuchet MS",Verdana,sans-serif`;}
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
(function(){const p=document.getElementById('panel'),l=document.getElementById('list');if(!p||!l)return;const b=document.createElement('button');b.id='tgl';b.type='button';
 const set=c=>{p.classList.toggle('collapsed',c);b.textContent=c?'Show villagers ▾':'Hide villagers ▴';b.setAttribute('aria-expanded',String(!c));};set(false);b.onclick=()=>set(!p.classList.contains('collapsed'));l.parentNode.insertBefore(b,l);})();
// ===================== Round 3 =====================
// farming, wood chopping, the news bench, swimming + cannonballs, house signs, bot cards, and six easter eggs
const SIGNS={Friday:"Friday's Command Center",Clima:'Cloud Nine Station',Coach:"Coach's Corner Dojo",Luke:"Luke's Lookout",Mark:'On Your Mark Café',Dos:"Dos & Don'ts Newsstand",Gladdus:'Glad You Came Library',ResI:'The ResI-dence',Peter:"Peter's Build-ing"};
const FARM={plots:[{stage:2},{stage:0}]},CHOP={x:190,y:216},DUCK={x:362,y:226},CROW={x:197,y:50},FROGPAD={x:370,y:240};
const DANCE={until:0},EGGFX={crowAway:0,ducklings:0,show:0,ufo:0,frog:0},TEXTS=[],SIGNSHOW={};
const LSEQ=LAMPS.filter(l=>l[1]===150).sort((p,q)=>p[0]-q[0]),LFL=[],ANT={taps:[],flash:0},LS={i:0,t:0};
Object.assign(ACT_LINES,{farm:['🌱 Grow, little buddy!','Hoe hoe hoe! 😄','Garden time','Weeds, begone!','🥕 Looking good!'],
 chop:['🪓 Chop chop!','Timber!','Firewood for the stew 🔥','Splinters!','One more log…'],
 news:['📰 Duck wins pond race!','📰 Crow steals hat… again','📰 Wishes up 12%!','📰 Hammock shortage!','📰 Carrots: bigger than ever','Hmm, interesting…','No way! 😮','Crossword time ✏️'],
 swim:['🏊 Splish splash!','Water\'s great!','Doggy paddle!','Float break 😎','Brr, refreshing!']});
Object.assign(SPOTS,{farm:[{x:160,y:84,sx:160,sy:67,dir:1,plot:0,px:166,inner:true},{x:214,y:84,sx:214,sy:67,dir:-1,plot:1,px:200,inner:true}],
 chop:[{x:204,y:223,dir:-1}],
 news:[{x:246,y:128,sx:243,sy:123,dir:1,inner:true},{x:252,y:128,sx:253,sy:123,dir:-1,inner:true}],
 swim:[{x:282,y:256,cx:306,cy:246,rx:11,ry:4},{x:346,y:270,cx:346,cy:248,rx:11,ry:4}]});
function inWater(ch){const tx=Math.floor(ch.x/T),ty=Math.floor(ch.y/T);return !!(map[ty]&&map[ty][tx]===2);}
// ---- static props ----
function drawBench(c){const x=238,y=112; // news bench beside the newsstand: backrest, seat, legs
 px(c,x+1,y+11,20,2,'rgba(0,0,0,.18)');px(c,x,y,20,2,'#8a5a30');px(c,x,y,20,1,'#a8703c');px(c,x,y+3,20,2,'#8a5a30');px(c,x,y+3,20,1,'#a8703c');
 px(c,x+1,y+1,1,7,'#6b4526');px(c,x+18,y+1,1,7,'#6b4526');px(c,x-1,y+7,22,3,'#b07a44');px(c,x-1,y+7,22,1,'#c89058');px(c,x-1,y+9,22,1,'#7a4a24');
 px(c,x+1,y+10,2,3,'#5a3a20');px(c,x+17,y+10,2,3,'#5a3a20');}
function drawBeach(){ // little sandy beach on the south-west shore, with a towel and a beach ball
 for(let y=240;y<274;y++)for(let x=258;x<300;x++){const d=((x-284)/24)**2+((y-262)/13)**2;if(d>1||tileAt(Math.floor(x/T),Math.floor(y/T))===2)continue;px(b,x,y,1,1,d>.8?'#e8d49a':((x*7+y*13)%11?'#f2e0a8':'#e0c88a'));}
 for(let i=0;i<10;i++)px(b,262+i,262,1,6,i%4<2?'#e05060':'#ffffff');px(b,262,262,10,1,'rgba(0,0,0,.12)');
 px(b,268,247,5,5,'#ffffff');px(b,268,247,2,2,'#e84040');px(b,271,249,2,3,'#3a72c8');px(b,268,251,5,1,'rgba(0,0,0,.2)');}
// ---- farming ----
function tickFarm(ch,a){const pl=FARM.plots[a.spot.plot];
 if(a.tool&&clock>a.toolEnd){const tool=a.tool;a.tool=null;
  if(tool==='hoe')pl.stage=1;
  else if(tool==='water'){pl.stage=Math.min(3,pl.stage+1);fx.push({k:'sparkle',x:a.spot.px+4,y:61,t0:clock,d:800});}
  else{pl.stage=0;const r=Math.random();a.item=r<.12?'giant':r<.55?'carrot':r<.8?'beet':'pumpkin';a.itemUntil=clock+2600;
   say(ch,a.item==='giant'?'🥕 WHOA, a giant one!':['🥕 Fresh!','Look at this one!','Dinner! 😋'][(Math.random()*3)|0],2600);}}
 if(a.item&&clock>a.itemUntil)a.item=null;
 if(!a.tool&&!a.item&&clock>a.next){a.tool=pl.stage===0?'hoe':pl.stage<3?'water':'pull';a.toolT=clock;a.toolEnd=clock+(a.tool==='pull'?900:2100);
  if(Math.random()<.45)say(ch,a.tool==='hoe'?(Math.random()<.5?'Hoe hoe hoe! 😄':'Tilling…'):a.tool==='water'?(Math.random()<.5?'💧 Drink up!':'🌱 Grow, little buddy!'):'Heave-ho!',2200);
  a.next=clock+rint(3200,5600);}}
function drawPlots(c,t){SPOTS.farm.forEach((s,i)=>{const st=FARM.plots[i].stage,x=s.px,y=64;
 if(st>=1){px(c,x,y+1,8,2,'#6e4626');px(c,x+1,y,6,1,'#8a5a34');}
 if(st===1){px(c,x+3,y-1,1,1,'#7fcc62');px(c,x+5,y-1,1,1,'#7fcc62');}
 if(st===2){for(const q of [1,4,7]){px(c,q+x-1,y-2,1,2,'#4ea040');px(c,q+x,y-3,1,2,'#6fbe52');}}
 if(st===3){for(const q of [1,4,7]){px(c,q+x-1,y-4,1,4,'#3f8a30');px(c,q+x,y-5,1,5,'#5bb04e');px(c,q+x-1,y,2,2,'#f08a30');}}});}
function drawVeg(c,x,y,k){if(k==='carrot'){px(c,x-1,y,3,2,'#f08a30');px(c,x,y+2,2,2,'#f08a30');px(c,x,y+4,1,1,'#d06a20');px(c,x-1,y-2,1,2,'#4ea040');px(c,x+1,y-3,1,3,'#4ea040');}
 else if(k==='giant'){px(c,x-3,y-4,7,4,'#f08a30');px(c,x-2,y,5,4,'#f08a30');px(c,x-1,y+4,3,3,'#e07a28');px(c,x,y+7,1,2,'#d06a20');px(c,x-2,y-3,1,6,'#ffb060');px(c,x-3,y-9,2,5,'#4ea040');px(c,x,y-10,2,6,'#3f8a30');px(c,x+2,y-8,2,4,'#4ea040');}
 else if(k==='beet'){px(c,x-2,y,5,4,'#a83a6a');px(c,x-1,y+4,3,1,'#a83a6a');px(c,x,y+5,1,1,'#7a2a4a');px(c,x-1,y-3,1,3,'#4ea040');px(c,x+1,y-3,1,3,'#3f8a30');}
 else{px(c,x-3,y,7,5,'#f08a30');px(c,x-3,y,7,1,'#ffb060');px(c,x-1,y,1,5,'#d06a20');px(c,x+1,y,1,5,'#d06a20');px(c,x,y-2,1,2,'#5a3a20');}}
function drawFarmTool(c,ch,a,x,y,f,t){const hx=x+f*5,hy=y-7,plx=a.spot.px+4,ply=65;
 if(a.tool==='hoe'){const p=((clock-a.toolT)%700)/700,up=p<.55;const ex=up?hx+f*1:plx,ey=up?y-21:ply;line(c,hx,hy,ex,ey,'#8a5a30');px(c,ex-1,ey,3,1,'#a8a8b0');px(c,hx-1,hy,2,2,P.skin);
  if(!up&&p<.8){px(c,plx-2,ply-2,1,1,'#5e3e22');px(c,plx+3,ply-3,1,1,'#5e3e22');px(c,plx+1,ply-4,1,1,'#7a5232');}}
 else if(a.tool==='water'){const cx=hx,cy=y-11;px(c,cx-2,cy,5,4,'#7aa0c0');px(c,cx-2,cy,5,1,'#a8c8e0');line(c,cx+f*2,cy+1,cx+f*5,cy-1,'#7aa0c0');px(c,cx-f*3,cy+1,1,2,'#5a7a98');
  for(let i=0;i<3;i++){const q=((t/320)+i/3)%1;px(c,cx+f*5+(i-1),cy+q*(ply-cy),1,1,'#8fd0f0');}}
 else if(a.tool==='pull'){px(c,x+f*4,y-5+(Math.floor(t/120)%2),2,3,P.skin);px(c,x+f*6,y-3,2,2,'#4ea040');}
 if(a.item)drawVeg(c,x,y-27,a.item);}
// ---- chopping wood ----
// ---- the news bench ----
function tickNews(ch,a){if(a.blown&&clock>a.blown){a.blown=0;say(ch,'Good thing I had a spare 😅',2200);}
 if(clock>a.next){const r=Math.random();
  if(r<.1&&!a.blown){a.blown=clock+3000;fx.push({k:'paper',x:ch.x,y:ch.y-12,t0:clock,d:2600});say(ch,'Hey! Come back! 📰',2500);}
  else if(r<.45){a.peek=clock+2500;say(ch,['Hmm, interesting…','No way! 😮','Psst, did you hear?'][(Math.random()*3)|0],2200);}
  else say(ch,ACT_LINES.news[(Math.random()*5)|0],3000);
  a.next=clock+rint(5000,9000);}}
function drawPaper(c,ch,a,x,y,f,t){if(a.blown)return;const low=clock<a.peek,py=low?y-10:y-15;
 px(c,x-6,py,12,8,P.out);px(c,x-5,py+1,10,6,'#f4eee0');px(c,x,py+1,1,6,'#c8c0b0');px(c,x-4,py+2,3,1,'#c83a50');px(c,x+2,py+2,3,1,'#3a3a44');
 for(let i=0;i<2;i++){px(c,x-4,py+4+i,3,1,'#9a9a9a');px(c,x+2,py+4+i,3,1,'#9a9a9a');}px(c,x-7,py+3,2,2,P.skin);px(c,x+5,py+3,2,2,P.skin);}
// ---- swimming + cannonballs ----
function tickSwim(ch,a,dt){const s=a.spot;
 if(a.sub==='jump'){const p=(clock-a.j0)/750,L=CANNON_LAND;
  if(p>=1){ch.x=L.x;ch.y=L.y;a.sub='swimto';fx.push({k:'bigsplash',x:L.x,y:L.y,t0:clock,d:900},{k:'ripple',x:L.x,y:L.y+1,t0:clock+100,d:1400},{k:'ripple',x:L.x,y:L.y+1,t0:clock+450,d:1400});
   say(ch,'💦 SPLASH!',2200);for(const o of bots)if(o!==ch&&o.act&&o.act.phase==='do'&&Math.hypot(o.x-L.x,o.y-L.y)<80&&Math.random()<.75)o.quip={s:o.act.type==='fish'?'Hey, the fish! 😂':'Ha! Nice one! 👏',until:clock+2500};return;}
  ch.x=a.jx+(L.x-a.jx)*p;ch.y=a.jy+(L.y-a.jy)*p-Math.sin(p*Math.PI)*12;return;}
 const tx=s.cx+Math.cos(a.ang)*s.rx,ty=s.cy+Math.sin(a.ang)*s.ry;
 if(a.sub==='swimto'){const dx=tx-ch.x,dy=ty-ch.y,d=Math.hypot(dx,dy),sp=(DEMO?2:1)*9*dt/1000;ch.moving=true;if(d<=sp){ch.x=tx;ch.y=ty;a.sub='paddle';}else{ch.x+=dx/d*sp;ch.y+=dy/d*sp;if(Math.abs(dx)>.3)ch.dir=dx<0?-1:1;}return;}
 ch.moving=false;
 if(!(a.float&&clock<a.float)){const sp=(DEMO?2:1)*7*dt/1000,Lp=Math.PI*(s.rx+s.ry);a.ang+=sp/Lp*Math.PI*2;const nx=s.cx+Math.cos(a.ang)*s.rx;if(Math.abs(nx-ch.x)>.02)ch.dir=nx<ch.x?-1:1;ch.x=nx;ch.y=s.cy+Math.sin(a.ang)*s.ry;
  if(!a.rip||clock-a.rip>1100){a.rip=clock;fx.push({k:'ripple',x:ch.x,y:ch.y+1,t0:clock,d:1200});}}
 if(clock>a.next){if(Math.random()<.25){a.float=clock+4000;say(ch,'Float break 😎',3000);}else say(ch,ACT_LINES.swim[(Math.random()*5)|0],2600);a.next=clock+rint(6000,11000);}}
function drawSwim(c,ch,t){const x=Math.round(ch.x),y=Math.round(ch.y),oy=ch.y,om=ch.moving;
 c.save();c.beginPath();c.rect(0,0,W,y+1);c.clip();ch.y=y+9;ch.moving=false;drawChar(c,ch,t);ch.y=oy;ch.moving=om;c.restore();
 const k=Math.floor(t/260+ch.phase)%2;px(c,x-6,y+1,12,1,'rgba(225,246,255,.85)');px(c,x-5,y+2,10,1,P.w3);
 px(c,x-7,y-1+k,2,2,P.skin);px(c,x+5,y-k,2,2,P.skin);px(c,x-8,y+(k?0:1),1,1,'#ffffff');px(c,x+7,y+(k?1:0),1,1,'#ffffff');}
function drawBall(c,ch,t){const x=Math.round(ch.x),y=Math.round(ch.y),oy=ch.y,om=ch.moving;
 c.save();c.beginPath();c.rect(0,0,W,y-6);c.clip();ch.y=y+2;ch.moving=false;drawChar(c,ch,t);ch.y=oy;ch.moving=om;c.restore();
 const sh=ch.look.shirt||'#4a8a3a';px(c,x-5,y-7,10,8,P.out);px(c,x-4,y-6,8,6,sh);px(c,x-4,y-2,8,2,shade(sh,-40));px(c,x-5,y-5,2,3,P.skin);px(c,x+3,y-5,2,3,P.skin);px(c,x-2,y,4,2,'#5a3a20');}
// ---- click reactions + the bot card ----
const REACTS=['wave','jump','spin','heart','notes','surprise'];
const QUIPS={wave:['Hi there! 👋','Hey hey! 👋','Howdy! 👋'],jump:['Boing!','Whoa, hi!','Jump for joy!'],spin:['Wheee!','Ta-da! ✨','Spin move!'],heart:['Aww, thanks! 💛','You\'re sweet! 💛','💛💛💛'],
 notes:['♪ La la la ♪','♪ Hum-de-dum ♪','♪ Doo-bee-doo ♪'],surprise:['Oh! You startled me!','Eep!','Boop! 😄']};
function reactBot(ch){const a=ch.act,posed=a&&a.phase==='do'&&['nap','seat','news','swim','vend'].includes(a.type)||inWater(ch);const pool=posed?['heart','notes','surprise']:REACTS;
 let k=pool[(Math.random()*pool.length)|0];if(k===ch.lastReact)k=pool[(pool.indexOf(k)+1)%pool.length];ch.lastReact=k;ch.react={k,t0:clock,d:1500};
 let s=QUIPS[k][(Math.random()*QUIPS[k].length)|0];
 if(a&&a.phase==='do'){if(a.type==='nap')s='Five more minutes… 😴';else if(a.type==='swim'&&Math.random()<.5)s='Come on in, the water\'s fine!';else if(a.type==='news'&&Math.random()<.5)s='Shh, I\'m reading! 📰';else if(a.type==='vend'&&Math.random()<.5)s='Fresh today! 😊';else if(a.type==='golf'&&Math.random()<.5)s='Shh, I\'m putting! ⛳';else if(a.type==='lemon'&&Math.random()<.4)s='Want a sip? 🍋';}
 if(ch.state==='working'&&Math.random()<.5)s='Busy busy! 💼';
 ch.quip={s,until:clock+2600};const hx=ch.x,hy=ch.y-(inWater(ch)?12:22);
 if(k==='heart')for(let i=0;i<3;i++)fx.push({k:'heart',x:hx+(i-1)*5,y:hy,t0:clock+i*180,d:1300});
 if(k==='notes')for(let i=0;i<3;i++)fx.push({k:'note',x:hx+(i-1)*5,y:hy,t0:clock+i*220,d:1300});
 if(k==='surprise')fx.push({k:'bang',ch,t0:clock,d:1200});
 if(k==='spin'||k==='jump'||k==='wave')fx.push({k:'sparkle',x:hx+7,y:hy+2,t0:clock,d:900});}
const ACT_DESC={fish:'Fishing at the pond',cook:'Cooking at the fire pit',seat:'Hanging out at the picnic table',nap:'Napping in a hammock',toss:'Tossing a token in the fountain',laps:'Jogging laps',walk:'Walking the track',
 inside:'Popping home',farm:'Farming in the garden',chop:'Chopping wood',news:'Reading the news',swim:'Swimming in the pond',build:'Building the Build-ing (still)'};
const ACT_GO={fish:'the pond',cook:'the fire pit',seat:'the picnic table',nap:'the hammocks',toss:'the fountain',laps:'the track',walk:'the track',inside:'home',farm:'the garden',chop:'the woodpile',news:'the news bench',swim:'the pond',build:'the building site'};
function actText(ch){if(ch.state==='working')return 'Working on a task';const a=ch.act;
 if(ch.state==='asleep')return a&&a.type==='nap'?'Asleep in a hammock':'Asleep';if(ch.inside)return 'Popped inside for a bit';
 if(!a)return inWater(ch)?'Swimming back to shore':ch.carry&&ITEM_NAME[ch.carry]?'Strolling home with '+ITEM_NAME[ch.carry]:'Strolling around the village';
 if(a.phase==='do'&&ACT_TXT[a.type])return ACT_TXT[a.type](ch,a);
 if(a.type==='swim'&&a.cannon)return a.phase==='go'?'Heading to the dock (cannonball!)':'Swimming (after a cannonball!)';
 return a.phase==='go'?'Heading to '+ACT_GO[a.type]:ACT_DESC[a.type];}
let card,toast,eggEl,cardFor=null,cardTxt='';
function selectBot(ch,react){selected=ch;cardFor=ch;renderList();if(react&&!ch.inside)reactBot(ch);cardTxt='';card.classList.remove('hide');fillCard();placeCard();}
function closeCard(){if(!cardFor&&!selected)return;cardFor=null;selected=null;card.classList.add('hide');renderList();}
function placeCard(){if(!cardFor||!card)return;if(Math.floor(clock/400)!==placeCard.k){placeCard.k=Math.floor(clock/400);fillCard();}
 const ch=cardFor,st=card.parentNode,r=cv.getBoundingClientRect(),sr=st.getBoundingClientRect();
 let bx=ch.x,by=ch.y-(inWater(ch)?12:22);if(ch.inside){const d=door(HOUSES[ch.key]);bx=d.x;by=d.y-10;}
 const X=r.left-sr.left+cv.clientLeft+bx/W*cv.clientWidth,Y=r.top-sr.top+cv.clientTop+by/H*cv.clientHeight,cw=card.offsetWidth,chh=card.offsetHeight;
 const below=r.top-sr.top+cv.clientTop+(ch.inside?by+12:ch.y+9)/H*cv.clientHeight+6; // under the name tag, so the reaction bubble above the bot stays visible
 let L=X-cw/2,Tp=below;if(Tp+chh>Math.max(st.clientHeight,r.bottom-sr.top)-2)Tp=Y-chh-(8+bubOff(ch)/H*cv.clientHeight*1.1);L=Math.max(2,Math.min(st.clientWidth-cw-2,L));
 const k=Math.round(L)+','+Math.round(Tp);if(card._k!==k){card._k=k;card.style.left=Math.round(L)+'px';card.style.top=Math.round(Tp)+'px';}}
// ---- house signs (desktop: always shown; phones: tap a house to show its sign for a few seconds) ----
function drawSigns(placedL){const sfs=Math.round(Math.max(11,S/K*(MOBILE?3.4:3.3))*K);ctx.font=`bold ${sfs}px "Trebuchet MS",Verdana,sans-serif`;
 const R=[];for(const k in HOUSES){if(MOBILE&&!(SIGNSHOW[k]>clock))continue;const h=HOUSES[k],s=SIGNS[k],w=ctx.measureText(s).width+10*K,hh=sfs+6*K;
  R.push({k,s,w,hh,x:(h.x+h.w/2+(k==='Dos'?16:0))*S,y:(h.y+(k==='Luke'?12:6))*S});}
 for(let n=0;n<3;n++)for(let i=0;i<R.length;i++)for(let j=0;j<R.length;j++){if(i===j)continue;const A=R[i],B=R[j];if(A.x>B.x||Math.abs(A.y-B.y)>(A.hh+B.hh)/2+2*K)continue;
  const ov=(A.w+B.w)/2+6*K-(B.x-A.x);if(ov>0){A.x-=ov/2;B.x+=ov/2;}} // push neighbouring signs apart so they never touch
 for(const r of R){const {s,w,hh,y}=r;const x=Math.min(Math.max(r.x,w/2+4*K),cv.width-w/2-4*K);const L=Math.round(x-w/2),Tq=Math.round(y-hh/2);
  ctx.fillStyle='#2a1d14';ctx.fillRect(L-K*2,Tq-K*2,w+K*4,hh+K*4);ctx.fillStyle='#8a5a30';ctx.fillRect(L,Tq,w,hh);ctx.fillStyle='#a8703c';ctx.fillRect(L,Tq,w,Math.max(1,K*2));
  ctx.fillStyle='#5a3a20';ctx.fillRect(L,Tq+hh-Math.max(1,K*2),w,Math.max(1,K*2));ctx.fillStyle='#d8c49a';ctx.fillRect(L+K*2,Tq+hh/2-K,K*2,K*2);ctx.fillRect(L+w-K*4,Tq+hh/2-K,K*2,K*2);
  ctx.fillStyle='#2a1d14';ctx.fillText(s,x+K,y+K*2);ctx.fillStyle='#ffe9b0';ctx.fillText(s,x,y+K);placedL.push({x,y,w:w+K*4,h:hh+K*4,sign:true});}
 drawPlaque(placedL);
 ctx.font=`bold ${Math.round(Math.max(MOBILE?11:10,S/K*3.6)*K)}px "Trebuchet MS",Verdana,sans-serif`;}
// ---- floating texts (egg moments) ----
function ftext(s,x,y,d){TEXTS.push({s,x,y,t0:clock,d:d||1800});}
// ---- extra effects (hooked into drawFx) ----
const FX3={
 chips(c,e,p){for(let i=0;i<5;i++){const q=i/5*Math.PI*2+1;px(c,e.x+Math.cos(q)*p*9,e.y-Math.abs(Math.sin(q))*p*7+p*p*6,1,1,'#e0b878');}},
 bonk(c,e,p){const x=e.ch.x,y=e.ch.y-21;for(let i=0;i<3;i++){const q=p*Math.PI*4+i*2.1;px(c,x+Math.cos(q)*6,y+Math.sin(q)*2,1,1,'#ffe040');px(c,x+Math.cos(q)*6-1,y+Math.sin(q)*2,3,1,'rgba(255,224,64,.6)');}},
 paper(c,e,p){const x=e.x+p*70,y=e.y-p*40+Math.sin(p*20)*4;const w=Math.floor(p*12)%2;px(c,x-3,y-2,6+w,4-w,'#f4eee0');px(c,x-2,y-1,3,1,'#9a9a9a');},
 bigsplash(c,e,p){const r=3+p*16,a=(1-p).toFixed(2);for(let k=0;k<20;k++){const q=k/20*Math.PI*2,h=Math.sin(p*Math.PI)*(k%2?14:22)*Math.abs(Math.sin(q*1.5+1));px(c,e.x+Math.cos(q)*r,e.y-h,2,2,k%3?`rgba(230,248,255,${a})`:`rgba(92,176,236,${a})`);}
  px(c,e.x-3,e.y-Math.sin(p*Math.PI)*22,2,3,'#ffffff');px(c,e.x+2,e.y-Math.sin(p*Math.PI)*20,2,3,'#ffffff');},
 heart(c,e,p){const x=e.x+Math.sin(p*8)*2,y=e.y-p*12;c.globalAlpha=1-p*p;px(c,x-2,y,2,1,'#ff5a7a');px(c,x+1,y,2,1,'#ff5a7a');px(c,x-2,y+1,5,1,'#ff5a7a');px(c,x-1,y+2,3,1,'#ff5a7a');px(c,x,y+3,1,1,'#ff5a7a');c.globalAlpha=1;},
 note(c,e,p){const x=e.x+Math.sin(p*7)*3,y=e.y-p*12;c.globalAlpha=1-p*p;px(c,x,y,1,4,'#3a2a8a');px(c,x-2,y+3,2,2,'#3a2a8a');px(c,x+1,y,2,1,'#3a2a8a');c.globalAlpha=1;},
 bang(c,e,p){const x=e.ch.x,y=e.ch.y-(inWater(e.ch)?16:26)-Math.min(1,p*5)*2;px(c,x,y,2,5,'#ff4040');px(c,x,y+6,2,2,'#ff4040');},
 confetti(c,e,p){if(RM)return;const C=['#ff5a7a','#ffe040','#5cb0ec','#7fcc62','#c87af0','#ffffff'];for(let i=0;i<34;i++){const q=i*2.4,v=8+(i*7)%22;px(c,e.x+Math.cos(q)*v*p,e.y-Math.sin(q)*v*p*.8-18*p+40*p*p,2,1+(i%2),C[i%6]);}},
 feather(c,e,p){const x=e.x+Math.sin(p*9)*5,y=e.y+p*20;px(c,x-1,y,3,1,P.out);px(c,x,y+1,2,1,'#4a4a58');}};
function crowPos(t){const p=EGGFX.crowAway?(clock-EGGFX.crowAway)/25000:1;if(p<1){const f=Math.min(1,p*25000/2500);if(f>=1)return null;return {x:CROW.x+f*170,y:CROW.y-f*48+Math.sin(f*12)*3,fly:true};}
 return {x:CROW.x,y:CROW.y,fly:false};}
function drawCrow(c,t){const q=crowPos(t);if(!q)return;const x=Math.round(q.x),y=Math.round(q.y);
 if(q.fly){const up=Math.floor(t/110)%2;px(c,x-1,y,4,2,P.out);px(c,x+3,y-1,2,2,P.out);px(c,x+5,y,1,1,'#e0a020');px(c,x-4,y-(up?2:-1),4,1,P.out);px(c,x+1,y-(up?3:-2),3,1,P.out);return;}
 const hop=Math.floor(t/2700)%5===0?1:0;px(c,x-1,y-hop,3,2,P.out);px(c,x+1,y-1-hop,1,1,P.out);px(c,x+2,y-hop,1,1,'#e0a020');px(c,x-2,y+1-hop,1,1,P.out);}
const DISCO=['#ff5a7a','#ffe040','#5cb0ec','#7fcc62','#c87af0'];
function drawEggFx(c,t){
 // fountain light show
 if(clock<EGGFX.show){const x=plaza.x,y=plaza.y-12;for(let i=0;i<16;i++){const p=((t/700)+i/16)%1,a=i/16*Math.PI*2,r=2+p*16;px(c,x+Math.cos(a)*r,y-Math.sin(p*Math.PI)*16+p*10,1,2,`hsl(${(i*22+t/6)%360|0},95%,65%)`);}}
 // disco lamps while the whole village dances
 if(clock<DANCE.until){LAMPS.forEach(([x,y],i)=>{const col=DISCO[((RM?0:Math.floor(t/220))+i)%5];px(c,x-1,y-9,4,3,col);c.globalAlpha=.35;px(c,x-5,y-12,12,10,col);c.globalAlpha=1;});}
 LFL.forEach(l=>{if(clock<l.until){px(c,l.x-1,l.y-9,4,3,'#fff6a0');c.globalAlpha=.4;px(c,l.x-4,l.y-12,10,9,'#fff6a0');c.globalAlpha=1;}});
 if(clock<ANT.flash){const on=Math.floor(t/120)%2;px(c,31,23,3,3,on?'#ff4040':'#ffe040');}
 // UFO borrowing a cabbage
 if(EGGFX.ufo){const p=(clock-EGGFX.ufo)/7000;if(p>=1)EGGFX.ufo=0;else{const cx=176,cy=50;let ux,uy,cabY=cy;
   if(p<.2){const f=p/.2;ux=-20+f*(cx+20);uy=8+f*10;}else if(p<.8){ux=cx+Math.sin(t/300);uy=18;}else{const f=(p-.8)/.2;ux=cx+f*260;uy=18-f*20;}
   if(p>=.25&&p<.75){c.globalAlpha=.35;for(let yy=uy+3;yy<cy+2;yy++){const w=4+(yy-uy)*.35;px(c,ux-w/2,yy,w,1,'#b8ffb0');}c.globalAlpha=1;}
   if(p>=.3&&p<.5)cabY=cy-(cy-uy-4)*((p-.3)/.2);else if(p>=.5&&p<.6)cabY=uy+4;else if(p>=.6&&p<.72)cabY=uy+4+(cy-uy-4)*((p-.6)/.12);
   if(p>=.3&&p<.72){px(c,ux-2,cabY-2,5,4,'#7fcc62');px(c,ux-1,cabY-2,3,1,'#b0e890');px(c,ux,cabY-1,1,2,'#4ea040');}
   px(c,ux-8,uy,16,3,'#9aa8b8');px(c,ux-8,uy+2,16,1,'#5a6878');px(c,ux-3,uy-3,6,3,'#8fe0ff');px(c,ux-2,uy-3,2,1,'#ffffff');
   const bl=Math.floor(t/150)%3;for(let i=0;i<3;i++)px(c,ux-6+i*5,uy+1,2,1,i===bl?'#ffe040':'#ff5a7a');}}
 // the frog prince (just a frog)
 if(EGGFX.frog&&clock-EGGFX.frog<14000){const x=FROGPAD.x,y=FROGPAD.y,hop=Math.floor((clock-EGGFX.frog)/1800)%3===0&&(clock-EGGFX.frog)%1800<300?2:0;
  px(c,x-3,y-2-hop,6,3,'#4ea040');px(c,x-3,y-4-hop,2,2,'#4ea040');px(c,x+1,y-4-hop,2,2,'#4ea040');px(c,x-3,y-4-hop,1,1,P.out);px(c,x+2,y-4-hop,1,1,P.out);px(c,x-1,y-hop,2,1,'#ff8080');
  px(c,x-2,y-7-hop,5,2,'#ffd34a');px(c,x-2,y-8-hop,1,1,'#ffd34a');px(c,x,y-8-hop,1,1,'#ffd34a');px(c,x+2,y-8-hop,1,1,'#ffd34a');px(c,x,y-7-hop,1,1,'#e84040');}
 else if(EGGFX.frog)EGGFX.frog=0;}
// ---- easter eggs ----
const EGG_NAMES={build:'Grand opening (for 10 seconds)',crow:'Crow-ccupied!',duck:'Make way for ducklings!',fountain:'Fountain light show',ufo:'Cabbage abduction',shuffle:'The Bot Hollow Shuffle',frog:'Frog royalty',scarecrow:'Scarecrow\'s big moment',trophy:'Acceptance speech',bottle:'Message in a bottle',fetch:'Fetch!',catsplash:'Cat-astrophe',duet:'Meow-woof duet'};
let EGGS=[];try{if(DEMO&&QS.has('eggreset'))localStorage.removeItem('bhEggs');EGGS=JSON.parse(localStorage.getItem('bhEggs')||'[]').filter(k=>EGG_NAMES[k]);}catch(e){EGGS=[];}
function showToast(s,ms){toast.textContent=s;toast.classList.remove('hide');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.add('hide'),ms||3200);}
function isNight(){const h=etHour();return h>=19||h<6;}
function eggTap(mx,my,hs){const near=(x,y,r)=>Math.hypot(mx-x,my-y)<r*hs;
 const cq=crowPos(clock);if(cq&&!cq.fly&&near(CROW.x+1,CROW.y,6)){EGGFX.crowAway=clock;fx.push({k:'feather',x:CROW.x,y:CROW.y,t0:clock+200,d:2200});ftext('CAW!',CROW.x+6,CROW.y-6);foundEgg('crow',CROW.x,CROW.y);return true;}
 if(near(DUCK.x,DUCK.y,6)){EGGFX.ducklings=clock+40000;ftext('QUACK!',DUCK.x,DUCK.y-8);fx.push({k:'ripple',x:DUCK.x,y:DUCK.y+2,t0:clock,d:1000});foundEgg('duck',DUCK.x,DUCK.y);return true;}
 if(near(32,27,5)){ANT.taps=ANT.taps.filter(q=>clock-q<3000);ANT.taps.push(clock);ANT.flash=clock+400;
  if(ANT.taps.length>=5&&!EGGFX.ufo){ANT.taps=[];EGGFX.ufo=clock;snd('ufo');setTimeout(()=>ftext('👽 Just borrowing a cabbage!',176,30,2600),1800);setTimeout(()=>ftext('👽 …never mind, it\'s too leafy.',176,30,2400),4500);foundEgg('ufo',176,40);}return true;}
 for(let i=0;i<LSEQ.length;i++){const [lx,ly]=LSEQ[i];if(near(lx+1,ly-5,6)){LFL.push({x:lx,y:ly,until:clock+500});if(LFL.length>8)LFL.shift();
   if(i===LS.i&&(LS.i===0||clock-LS.t<4000)){LS.i++;LS.t=clock;}else{LS.i=i===0?1:0;LS.t=clock;}
   if(LS.i>=LSEQ.length){LS.i=0;DANCE.until=clock+6500;snd('hio');ftext('💃 The Bot Hollow Shuffle! 🕺',200,40,3500);for(const o of bots)if(!o.inside)o.quip={s:['Shuffle! 🕺','Dance break! 💃','♪ Boogie! ♪','Look at my moves!'][(Math.random()*4)|0],until:clock+6500};foundEgg('shuffle',200,150);}
   return true;}}
 if(Math.hypot(mx-plaza.x,(my-(plaza.y-4))*1.4)<14*hs){if(isNight()){EGGFX.show=clock+8000;ftext('✨ Ooooh! ✨',plaza.x,plaza.y-26);foundEgg('fountain',plaza.x,plaza.y-10);}
  else{fx.push({k:'splash',x:plaza.x+(Math.random()*10-5),y:plaza.y-4,t0:clock,d:400});}return true;}
 return false;}
// ---- pointer input: bots, eggs, houses, water ----
let down=null;
function toLow(e){const r=cv.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H};}
function pickBot(mx,my,lim){let best=null,bd=lim;for(const ch of bots){if(ch.inside)continue;const d=Math.hypot(ch.x-mx,ch.y-(inWater(ch)?3:8)-my);if(d<bd){bd=d;best=ch;}}return best;}
cv.addEventListener('pointerdown',e=>{const q=toLow(e);down={x:e.clientX,y:e.clientY,lx:q.x,ly:q.y,held:false};
 if(Math.hypot(q.x-FROGPAD.x,q.y-FROGPAD.y)<6*(MOBILE?1.8:1)){const d=down;d.hold=setTimeout(()=>{if(down!==d)return;d.held=true;
   EGGFX.frog=clock;snd('ribbit');ftext('Ribbit! 👑',FROGPAD.x,FROGPAD.y-14,2200);setTimeout(()=>ftext('Frog prince? Nope, just a frog.',FROGPAD.x-30,FROGPAD.y-14,2800),2300);
   fx.push({k:'ripple',x:FROGPAD.x,y:FROGPAD.y+1,t0:clock,d:1200});foundEgg('frog',FROGPAD.x,FROGPAD.y);},1400);}});
cv.addEventListener('pointerup',e=>{const d=down;down=null;if(!d)return;clearTimeout(d.hold);if(d.held)return;if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>12)return;handleTap(d.lx,d.ly);});
cv.addEventListener('pointercancel',()=>{if(down)clearTimeout(down.hold);down=null;});
cv.addEventListener('contextmenu',e=>{if(down&&down.hold)e.preventDefault();});
(function(){const st=document.getElementById('stage');
 card=document.createElement('div');card.id='card';card.className='hide';card.setAttribute('role','dialog');card.setAttribute('aria-label','Villager card');
 card.innerHTML='<button class="cx" type="button" aria-label="Close">×</button><div class="cn"><i></i><b></b></div><div class="cr"></div><div class="ca"></div><div class="cs"></div><div class="ch"></div>';
 st.appendChild(card);card.querySelector('.cx').onclick=e=>{e.stopPropagation();closeCard();};
 toast=document.createElement('div');toast.id='toast';toast.className='hide';toast.setAttribute('aria-live','polite');st.appendChild(toast);
 eggEl=document.createElement('div');eggEl.id='eggs';const sub=document.querySelector('#panel .sub');if(sub)sub.after(eggEl);else document.getElementById('panel').prepend(eggEl);eggCount();
 document.addEventListener('pointerdown',e=>{if(!cardFor)return;if(card.contains(e.target)||e.target===cv||e.target.closest('#list'))return;closeCard();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCard();});})();
// ===================== Round 3b: mini golf, market stalls + lemonade stand =====================
// The southern strip (below the library, the ResI-dence, the woodpile and the hammocks) gets a lane, a 3-hole mini golf
// course (windmill, water hazard, flags, putter rack) and a little market: a bakery stall, a flower & veggie stall and a lemonade stand.
const HOLES=[{tee:{x:26,y:250},cup:{x:52,y:248},wait:{x:38,y:269},flag:'#e84040'},
 {tee:{x:66,y:250},cup:{x:95,y:250},wait:{x:92,y:269},flag:'#3a72c8',mill:true},
 {tee:{x:108,y:246},cup:{x:135,y:247},wait:{x:110,y:269},flag:'#f5c830',haz:{x:122,y:256}}];
const GOLF={hole:0,turn:null},WM={a:0,fast:0,last:0,x:81,y:240};
const STALLS=[{x:152,w:26,stripe:'#e05060',items:['loaf','pie'],name:'bakery stall',desc:'Running the bakery stall'},
 {x:186,w:26,stripe:'#3f9a5a',items:['flowers','bag'],name:'flower & veggie stall',desc:'Running the flower & veggie stall'},
 {x:222,w:22,stripe:'#f0c020',items:['cup'],name:'lemonade stand',desc:'Selling lemonade'}];
const VLINES=[['🍞 Fresh bread!','🥧 Pies! Warm pies!','Just out of the oven!','Crusty and fresh 😋'],
 ['💐 Fresh flowers!','🥕 Garden-fresh veggies!','Flowers for a friend?','Picked this morning 🌼'],
 ['🍋 Lemonade! Ice cold!','One smile per cup 😊','Fresh-squeezed!','🍋 Get it while it\'s cold!']];
const ITEM_NAME={loaf:'a fresh loaf',pie:'a pie',flowers:'some flowers',bag:'a bag of veggies',cup:'a lemonade'};
const BUYQ={loaf:['🍞 Mmm, still warm!','Bread for the picnic!'],pie:['🥧 Pie for dessert!','Smells amazing! 🥧'],flowers:['💐 So pretty!','For the library desk 💐'],bag:['🥕 Veggies for the stew!','Crunchy! 🥕']};
OBST.push({x:77,y:238,w:10,h:15},{x:143,y:244,w:7,h:12}); // windmill, putter rack
STALLS.forEach(s=>OBST.push({x:s.x,y:246,w:s.w,h:9})); // stall counters (the vendor steps in behind)

Object.assign(ACT_LINES,{golf:['⛳ Mini golf time!','Fore! ⛳','Watch this putt…','Easy does it','Respect the windmill 😤'],vend:VLINES[0],
 shop:['Hmm… 🤔','Ooh, that looks good!','So many choices…','Just browsing 😊','What do you recommend?'],
 lemon:['🍋 Refreshing!','Ahh, that hits the spot','*sip*','Perfect day for this 😎']});
const vendorOf=i=>bots.find(o=>o.act&&o.act.type==='vend'&&o.act.phase==='do'&&o.act.spot.stall===i);
const staffed=i=>!!SPOTS.vend[i].by;
Object.assign(SPOTS,{golf:[{x:30,y:228,dir:1},{x:40,y:228,dir:1}],
 vend:STALLS.map((s,i)=>({x:s.x+s.w/2,y:240,sx:s.x+s.w/2,sy:250,dir:i?-1:1,inner:true,stall:i})),
 shop:[{x:163,y:270,dir:1,stall:0,need:()=>staffed(0)},{x:197,y:270,dir:1,stall:1,need:()=>staffed(1)}],
 lemon:[{x:226,y:270,dir:1,stall:2,need:()=>staffed(2)},{x:243,y:270,dir:-1,stall:2,need:()=>staffed(2)}]});
Object.assign(ACT_DESC,{golf:'Playing mini golf',vend:'Running a market stall',shop:'Browsing the market stalls',lemon:'Sipping lemonade'});
Object.assign(ACT_GO,{golf:'the mini golf course',vend:'the market',shop:'the market',lemon:'the lemonade stand'});
const ACT_TXT={golf:(ch,a)=>'Playing mini golf (hole '+(a.hole+1)+(golfPartner(ch)?', taking turns':'')+')',vend:(ch,a)=>a.spot.desc||STALLS[a.spot.stall].desc,
 shop:(ch,a)=>a.bought?'Just bought '+ITEM_NAME[a.bought]:'Browsing the '+STALLS[a.spot.stall].name,lemon:(ch,a)=>a.cup?'Sipping lemonade':'Ordering a lemonade'};
SPOTS.vend.forEach((s,i)=>s.desc=STALLS[i].desc);
// ---- static art ----
function drawGolf(c){const X0=18,Y0=236,X1=142,Y1=264;
 px(c,X0+1,Y1+1,X1-X0+1,2,'rgba(0,0,0,.2)');px(c,X0,Y0,X1-X0+1,Y1-Y0+1,'#a8703c');px(c,X0+1,Y0+1,X1-X0-1,Y1-Y0-1,'#4fb04a');
 for(let i=0;i<70;i++){const x=X0+2+((i*37)%(X1-X0-4)),y=Y0+2+((i*53)%(Y1-Y0-4));px(c,x,y,1,1,i%2?'#62c05a':'#43a040');}
 px(c,X0,Y0,X1-X0+1,1,'#c89058');px(c,X0,Y1,X1-X0+1,1,P.out);px(c,24,Y0,21,2,'#4fb04a'); // entrance gap on hole 1
 for(const dx of [59,101]){px(c,dx,Y0,2,Y1-Y0,'#a8703c');px(c,dx,Y0,1,Y1-Y0,'#c89058');}
 // hole 1: a little hill
 for(let dy=-3;dy<=3;dy++)for(let dx=-5;dx<=5;dx++)if((dx/5)**2+(dy/3)**2<=1)px(c,40+dx,250+dy,1,1,dy<0?'#68c862':'#43a040');
 // hole 3: water hazard
 for(let dy=-4;dy<=4;dy++)for(let dx=-7;dx<=7;dx++){const d=(dx/7)**2+(dy/4)**2;if(d<=1)px(c,122+dx,256+dy,1,1,d>.7?'#9a7a4a':P.w1);}px(c,119,255,3,1,P.w2);
 HOLES.forEach(H=>{const t=H.tee,u=H.cup;px(c,t.x-3,t.y-2,6,4,'#2f6a3a');px(c,t.x-3,t.y-2,6,1,'#3f8a4a');px(c,u.x-2,u.y-1,5,3,'#3f9a3a');px(c,u.x-1,u.y,3,1,'#1a1a1a');});
 // windmill (blades spin live)
 for(let y=238;y<=252;y++){const ins=Math.floor((252-y)/6),x=77+ins,w=10-ins*2;px(c,x,y,w,1,(y>=243&&y<=244)?'#c83a50':'#f0e6d8');px(c,x,y,1,1,P.out);px(c,x+w-1,y,1,1,P.out);}
 for(let r=0;r<4;r++)px(c,79+r,236-r,8-2*r,1,r%2?'#a83040':'#c83a50');px(c,78,237,10,1,'#7a2030');
 px(c,79,247,5,6,'#3a2416');px(c,80,246,3,1,'#3a2416');px(c,81,241,2,2,'#8fd0f0');px(c,76,252,12,1,P.out);
 // putter rack + a little course sign
 px(c,143,246,7,2,'#8a5a30');px(c,143,254,7,2,'#8a5a30');px(c,143,246,1,10,'#6b4526');px(c,149,246,1,10,'#6b4526');
 [144,146,148].forEach((x,i)=>{px(c,x,243,1,11,'#9a9aa0');px(c,x,254,2,1,['#c83a50','#3a72c8','#f5c830'][i]);px(c,x,243,1,2,'#3a3a44');});
 px(c,146,234,1,8,'#6b4526');px(c,142,233,9,6,'#c89058');px(c,142,233,9,1,P.out);px(c,142,238,9,1,'#8a5a30');px(c,145,234,1,4,'#ffffff');px(c,146,234,2,2,'#e84040');}
function drawMarket(c){STALLS.forEach((s,i)=>{const {x,w}=s;
 px(c,x+1,255,w,2,'rgba(0,0,0,.2)');px(c,x,233,1,22,'#6b4526');px(c,x+w-1,233,1,22,'#6b4526');
 px(c,x-1,231,w+2,1,P.out);for(let k=0;k<w+2;k++){const col=Math.floor(k/3)%2?'#ffffff':s.stripe;px(c,x-1+k,232,1,6,col);if(k%3!==2)px(c,x-1+k,238,1,1,col);}px(c,x-1,237,w+2,1,'rgba(0,0,0,.12)');
 px(c,x,246,w,2,'#c89058');px(c,x,248,w,7,i===2?'#f5d84a':'#a8703c');for(let k=x+4;k<x+w;k+=5)px(c,k,248,1,7,i===2?'#ffffff':'#8a5a30');px(c,x,254,w,1,P.out);px(c,x,246,w,1,'#e0b070');
 const cx=x+w/2;
 if(i===0){[[x+2,243],[x+6,244]].forEach(([a,b2])=>{px(c,a,b2,5,3,'#c8803a');px(c,a,b2,5,1,'#e0a050');px(c,a+1,b2+1,1,1,'#a05a20');px(c,a+3,b2+1,1,1,'#a05a20');});
  [[x+w-10,244],[x+w-5,244]].forEach(([a,b2])=>{px(c,a,b2,5,2,'#b8703a');px(c,a,b2,5,1,'#e8b060');px(c,a+1,b2,1,1,'#a04030');px(c,a+3,b2,1,1,'#a04030');});
  px(c,cx-3,249,7,4,'#2a3a2a');px(c,cx-2,250,2,1,'#e8e8e8');px(c,cx+1,251,2,1,'#e8e8e8');}
 if(i===1){[[x+2,'#ff8fb0'],[x+6,'#f5e050'],[x+w-8,'#b98cf0']].forEach(([a,col],j)=>{if(j===2){px(c,a,243,6,3,'#8a5a30');px(c,a+1,242,1,2,'#f08a30');px(c,a+3,242,2,2,'#9ad86a');px(c,a+5,241,1,2,'#f08a30');return;}
   px(c,a,243,4,3,'#7a8a9a');px(c,a+1,241,1,2,'#3f8a30');px(c,a+2,240,1,3,'#3f8a30');px(c,a,239,2,2,col);px(c,a+2,238,2,2,col);px(c,a+1,240,1,1,'#ffffff');});
  px(c,cx-1,249,3,3,'#ff8fb0');px(c,cx,250,1,1,'#f8d040');px(c,cx,252,1,2,'#3f8a30');}
 if(i===2){px(c,x+2,239,5,7,P.out);px(c,x+3,240,3,6,'#d8f0ff');px(c,x+3,242,3,4,'#ffe860');px(c,x+6,241,1,3,'#d8f0ff');
  for(let k=0;k<3;k++)px(c,x+w-6,241+k*0,3,5,'#ffffff');px(c,x+w-6,241,3,1,'#d8d8d8');px(c,x+w-3,243,3,3,'#ffffff');
  px(c,cx-2,249,5,4,'#ffe040');px(c,cx-3,250,1,2,'#ffe040');px(c,cx+3,250,1,2,'#ffe040');px(c,cx-1,249,2,1,'#fff6a0');px(c,cx+1,248,2,1,'#4ea040');}});
 px(c,180,249,5,6,'#8a5a30');px(c,180,249,5,1,'#a8703c');px(c,180,252,5,1,'#5a3a20');px(c,181,247,3,2,'#e84040'); // apple barrel
 px(c,216,251,4,4,'#c8925a');px(c,216,251,4,1,'#e8c48a');} // crate
function drawItem(c,x,y,k){x=Math.round(x);y=Math.round(y);
 if(k==='loaf'){px(c,x-3,y,6,3,'#c8803a');px(c,x-3,y,6,1,'#e0a050');px(c,x-2,y+1,1,1,'#a05a20');px(c,x+1,y+1,1,1,'#a05a20');}
 else if(k==='pie'){px(c,x-3,y+1,7,2,'#b8703a');px(c,x-3,y,7,1,'#e8b060');px(c,x-2,y,1,1,'#a04030');px(c,x+1,y,1,1,'#a04030');px(c,x-3,y+3,7,1,'#d8d8e0');}
 else if(k==='flowers'){px(c,x-1,y+1,3,4,'#f4eee0');px(c,x,y-1,1,3,'#3f8a30');px(c,x-2,y-3,2,2,'#ff8fb0');px(c,x+1,y-3,2,2,'#f5e050');px(c,x-1,y-4,2,2,'#b98cf0');}
 else if(k==='bag'){px(c,x-2,y,5,5,'#c8a070');px(c,x-2,y,5,1,'#a8804a');px(c,x-1,y-2,1,2,'#4ea040');px(c,x+1,y-3,1,3,'#4ea040');px(c,x+2,y-1,1,2,'#f08a30');}
 else if(k==='cup'){px(c,x-1,y,3,4,'#ffffff');px(c,x-1,y,3,1,'#ffe860');px(c,x+1,y-2,1,2,'#e05060');px(c,x-1,y+3,3,1,'#d8d8d8');}}
// ---- live art: windmill blades, flags, balls, the lemonade pitcher ----
function drawGolfLive(c,t){const d=WM.last?Math.min(100,clock-WM.last):0;WM.last=clock;WM.a+=d*(clock<WM.fast?.014:.0013);
 for(let k=0;k<4;k++){const q=WM.a+k*Math.PI/2,cs=Math.cos(q),sn=Math.sin(q);line(c,WM.x,WM.y,WM.x+cs*9,WM.y+sn*9,'#5a3a20');
  for(let i=3;i<=9;i++)px(c,WM.x+cs*i-sn*1.5,WM.y+sn*i+cs*1.5,1,1,'#f4eee0');}
 px(c,WM.x-1,WM.y-1,2,2,'#c83a50');
 HOLES.forEach((H,i)=>{const u=H.cup;px(c,u.x,u.y-10,1,10,'#e8e8e8');for(let k=0;k<4;k++)px(c,u.x+1+k,u.y-10+(Math.floor(t/300+i+k*.5)%2&&k>1?1:0),1,3,H.flag);});
 for(const o of bots){const a=o.act;if(!a||a.type!=='golf'||a.phase!=='do')continue;const b=ballPos(a);if(!b)continue;px(c,b.x-1,b.y,3,1,'rgba(0,0,0,.25)');px(c,b.x-1,b.y-2,2,2,'#ffffff');px(c,b.x,b.y-2,1,1,'#e8e8f0');}}
FX3.give=function(c,e,p){drawItem(c,e.x0+(e.x1-e.x0)*p,e.y0+(e.y1-e.y0)*p-Math.sin(p*Math.PI)*8,e.item);};
// ---- mini golf ----
function golfPartner(ch){return bots.find(o=>o!==ch&&o.act&&o.act.type==='golf'&&o.act.phase==='do');}
const holeOf=x=>x<59?0:x<101?1:2,stand=b=>({x:b.x-6,y:b.y+1});
function golfGo(ch,a,to){const direct=holeOf(ch.x)===holeOf(to.x)&&!(holeOf(to.x)===1&&(ch.x-81)*(to.x-81)<0)&&ch.y<266;
 a.goals=(direct?[to]:[{x:ch.x,y:266},{x:to.x,y:266},to]).filter((g,i,l)=>Math.hypot(g.x-(i?l[i-1].x:ch.x),g.y-(i?l[i-1].y:ch.y))>.5);}
function initGolf(ch,a){const pa=golfPartner(ch);a.hole=GOLF.hole;a.ball={...HOLES[a.hole].tee};a.st='wait';a.strokes=0;a.t=clock+900;
 if(!pa)GOLF.turn=ch.key;golfGo(ch,a,pa?HOLES[a.hole].wait:stand(a.ball));say(ch,pa?'Mind if I join? ⛳':'⛳ Mini golf time!',2400);
 if(pa&&Math.random()<.7)pa.quip={s:'Sure! You\'re up next 😄',until:clock+2400};}
function ballPos(a){if(a.st==='sunk'||!a.ball)return null;if(a.st!=='roll')return a.ball;const R=a.roll,p=Math.min(1,(clock-R.t0)/R.d),e=1-(1-p)*(1-p);
 const seg=[];let L=0;for(let i=1;i<R.pts.length;i++){const l=Math.hypot(R.pts[i].x-R.pts[i-1].x,R.pts[i].y-R.pts[i-1].y);seg.push(l);L+=l;}
 let s=L*e;for(let i=0;i<seg.length;i++){if(s<=seg[i]||i===seg.length-1){const f=seg[i]?Math.min(1,s/seg[i]):1,A=R.pts[i],B=R.pts[i+1];return {x:A.x+(B.x-A.x)*f,y:A.y+(B.y-A.y)*f};}s-=seg[i];}return R.pts[R.pts.length-1];}
function golfShot(ch,a,H){snd('putt');const r=Math.random(),b=a.ball,u=H.cup,d=Math.hypot(u.x-b.x,u.y-b.y);let res;
 if(a.strokes>=4)res='in';else if(d<9)res=r<.88?'in':'lip';else if(H.mill&&b.x<76&&r<.28)res='bonk';else if(H.haz&&b.x<116&&r<.28)res='splash';
 else if(a.strokes===1&&r>.86)res='in';else res=r>.72?'lip':'near';
 let pts;if(res==='in')pts=[b,u];else if(res==='near')pts=[b,{x:u.x-rint(3,6),y:u.y+rint(-2,2)}];else if(res==='lip')pts=[b,{x:u.x,y:u.y},{x:u.x+rint(2,4),y:u.y+(Math.random()<.5?-3:3)}];
 else if(res==='bonk')pts=[b,{x:75,y:250},{x:b.x+3,y:b.y+2}];else pts=[b,{x:H.haz.x,y:H.haz.y}];
 let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y);a.roll={pts,t0:clock,d:700+L*28,res};a.st='roll';}
function tickGolf(ch,a,dt){
 if(a.goals&&a.goals.length){const g=a.goals[0],dx=g.x-ch.x,dy=g.y-ch.y,d=Math.hypot(dx,dy),sp=(DEMO?2:1)*16*dt/1000;ch.moving=true;
  if(d<=sp){ch.x=g.x;ch.y=g.y;a.goals.shift();if(!a.goals.length){ch.moving=false;ch.dir=HOLES[a.hole].cup.x>=ch.x?1:-1;}}else{ch.x+=dx/d*sp;ch.y+=dy/d*sp;if(Math.abs(dx)>.3)ch.dir=dx<0?-1:1;}return;}
 ch.moving=false;const H=HOLES[a.hole],P2=golfPartner(ch),pa=P2&&P2.act.hole===a.hole?P2.act:null;
 if(a.st==='wait'){const busy=pa&&['aim','swing','roll'].includes(pa.st);
  const mine=!busy&&(!pa||pa.st==='sunk'||GOLF.turn===ch.key||!bots.some(o=>o.key===GOLF.turn&&o.act&&o.act.type==='golf'&&o.act.phase==='do'));
  if(mine){if(clock>a.t){GOLF.turn=ch.key;a.st='aim';a.t=clock+rint(900,1600);golfGo(ch,a,stand(a.ball));
    if(Math.random()<.4)say(ch,['Steady…','Fore! ⛳','Watch this!','Easy does it…'][(Math.random()*4)|0],1800);}}
  else{const w=H.wait;if(Math.hypot(ch.x-w.x,ch.y-w.y)>2)golfGo(ch,a,w);}}
 else if(a.st==='aim'){ch.dir=1;if(clock>a.t){a.st='swing';a.t=clock+500;}}
 else if(a.st==='swing'){if(clock>a.t){a.strokes++;golfShot(ch,a,H);}}
 else if(a.st==='roll'){const R=a.roll;if(clock<R.t0+R.d)return;const end=R.pts[R.pts.length-1];
  if(R.res==='in'){snd(a.strokes===1?'hio':'cup');a.ball=null;a.st='sunk';a.t=clock+1800;fx.push({k:'sparkle',x:H.cup.x,y:H.cup.y-3,t0:clock,d:900});
   if(a.strokes===1){say(ch,'⛳ HOLE IN ONE! 🎉',3000);ch.react={k:'jump',t0:clock,d:1500};fx.push({k:'confetti',x:H.cup.x,y:H.cup.y-4,t0:clock,d:1600});
    for(const o of bots)if(o!==ch&&!o.inside&&Math.hypot(o.x-ch.x,o.y-ch.y)<70&&Math.random()<.8)o.quip={s:['Whoa! 👏','No way! 😮','Show-off! 😄'][(Math.random()*3)|0],until:clock+2500};}
   else say(ch,['In! ⛳','Nice putt!','Got it! 😄','Sunk it!'][(Math.random()*4)|0],2200);}
  else if(R.res==='bonk'){a.ball=end;say(ch,'Bonk! The windmill wins 😤',2600);fx.push({k:'sparkle',x:75,y:248,t0:clock-500,d:900});}
  else if(R.res==='splash'){a.ball={...H.tee};fx.push({k:'splash',x:H.haz.x,y:H.haz.y,t0:clock,d:500},{k:'ripple',x:H.haz.x,y:H.haz.y,t0:clock,d:1100});say(ch,'Splash! 💦 Into the drink!',2600);
   if(P2&&Math.random()<.6)P2.quip={s:'Need a snorkel? 🤿',until:clock+2400};}
  else if(R.res==='lip'){a.ball=end;say(ch,'Lipped out! 😩',2200);}
  else{a.ball=end;if(Math.random()<.5)say(ch,['So close!','Tap-in time','Almost!'][(Math.random()*3)|0],2000);}
  if(a.st!=='sunk'){a.st='wait';a.t=clock+rint(600,1200);}
  GOLF.turn=pa&&pa.st!=='sunk'?P2.key:ch.key;}
 else if(a.st==='sunk'){if(!pa||pa.st==='sunk'){if(clock>a.t){const h=(a.hole+1)%3;GOLF.hole=h;GOLF.turn=ch.key;
    for(const o of [ch,pa?P2:null]){if(!o)continue;const q=o.act;q.hole=h;q.ball={...HOLES[h].tee};q.st='wait';q.strokes=0;q.t=clock+700;golfGo(o,q,o===ch?stand(q.ball):HOLES[h].wait);}
    if(Math.random()<.5)say(ch,'Next hole! ⛳',1800);}}
  else{const w=H.wait;if(Math.hypot(ch.x-w.x,ch.y-w.y)>2)golfGo(ch,a,w);}}}
function drawPutter(c,ch,a,x,y,f){const b=a.ball;
 if((a.st==='aim'||a.st==='swing')&&b&&!(a.goals&&a.goals.length)){const p=a.st==='swing'?Math.min(1,1-(a.t-clock)/500):0,back=Math.sin(Math.min(1,p*1.25)*Math.PI)*5;
  const hx=b.x-2-back,hy=b.y-1;line(c,x+4,y-7,hx,hy,'#9a9aa0');px(c,hx-1,hy,3,1,'#3a3a44');px(c,x+3,y-8,2,2,P.skin);}
 else{line(c,x+f*5,y-8,x+f*6,y-1,'#9a9aa0');px(c,x+f*6-(f<0?1:0),y-1,2,1,'#3a3a44');}}
// ---- market ----
function tickVend(ch,a){const i=a.spot.stall;if(!a.start)a.start=clock;
 const cust=bots.some(o=>o!==ch&&o.act&&o.act.spot&&o.act.spot.stall===i&&(o.act.type==='shop'||o.act.type==='lemon')&&!o.act.bought&&!(o.act.type==='lemon'&&o.act.cup));
 if(cust&&a.until-clock<1500&&clock-a.start<58000)a.until=clock+1500; // finish serving, but never past a minute
 if(i===2){if(a.pour){if(clock>a.pour.t0+1400){const o=a.pour.o;a.pour=null;if(o.act&&o.act.type==='lemon'&&!o.act.cup){o.act.cup=true;o.act.next=clock+1500;if(Math.random()<.5)o.act.bought='cup';
     fx.push({k:'give',x0:ch.x+ch.dir*5,y0:ch.y-10,x1:o.x+o.dir*4,y1:o.y-10,item:'cup',t0:clock,d:450});say(ch,['Here you go! 🍋','One lemonade!','Enjoy! 😊'][(Math.random()*3)|0],2200);}}}
  else{const o=bots.find(q=>q.act&&q.act.type==='lemon'&&q.act.phase==='do'&&!q.act.cup&&clock>q.act.pourAt);if(o){a.pour={o,t0:clock};if(Math.random()<.6)say(ch,'Coming right up! 🍋',1800);}}}
 if(clock>a.next){if(!a.pour)say(ch,a.lines[(Math.random()*a.lines.length)|0],2600);a.next=clock+rint(6000,11000);}}
function tickShop(ch,a){const i=a.spot.stall;if(a.item&&clock>a.itemUntil)a.item=null;if(a.bought)return;
 if(clock>a.buyAt){const v=vendorOf(i),it=STALLS[i].items[(Math.random()*STALLS[i].items.length)|0];a.bought=it;a.item=it;a.itemUntil=clock+2600;a.until=Math.max(a.until,clock+3200);
  if(v){say(v,['Here you go! 😊','Enjoy!','Thanks for stopping by!'][(Math.random()*3)|0],2200);fx.push({k:'give',x0:v.x,y0:v.y-14,x1:ch.x,y1:ch.y-24,item:it,t0:clock,d:500});
   a.say=null;setTimeout(()=>{if(ch.act===a)say(ch,BUYQ[it][(Math.random()*2)|0],2400);},500);}else say(ch,'Honor box! 🪙',2400);return;}
 if(clock>a.next){say(ch,ACT_LINES.shop[(Math.random()*5)|0],2400);a.next=clock+rint(5000,9000);}}
function tickLemon(ch,a){if(!a.cup){if(!staffed(2)&&clock>a.pourAt+3000){a.cup=true;a.next=clock+1500;say(ch,'Self-serve! 🍋',2000);}return;}
 if(a.sip&&clock>a.sip)a.sip=0;
 if(clock>a.next&&!a.sip){a.sip=clock+900;
  if(Math.random()<.22){a.sour=clock+1800;say(ch,['SOUR! 😖','Whoa, puckery! 😖','Lemony!! 😵'][(Math.random()*3)|0],2200);const v=vendorOf(2);if(v&&Math.random()<.6)setTimeout(()=>{if(v.act&&v.act.type==='vend')say(v,'Oops, extra lemons today 🍋',2400);},700);}
  else if(Math.random()<.5)say(ch,ACT_LINES.lemon[(Math.random()*4)|0],2400);a.next=clock+rint(4000,7000);}}
function drawLemonCup(c,ch,a,x,y,f){if(!a.cup)return;const up=clock<a.sip||clock<a.sour;drawItem(c,x+f*(up?3:5),up?y-13:y-8,'cup');px(c,x+f*(up?3:5)-(f<0?1:0),(up?y-10:y-5),2,2,P.skin);}
function drawPitcher(c,ch,a,x,y,f){if(!a.pour)return;const p=(clock-a.pour.t0)/1400,px0=x+f*6,py0=y-14;px(c,px0-2,py0,4,5,'#d8f0ff');px(c,px0-2,py0+2,4,3,'#ffe860');px(c,px0-2,py0,4,1,P.out);
 if(p>.2&&p<.9)for(let k=0;k<3;k++)px(c,px0+f*2,py0+5+k*2+(Math.floor(clock/80)%2),1,1,'#ffe040');px(c,px0+f*2-(f<0?1:0),y-6,3,3,'#ffffff');}
function drawSour(c,ch,t){const x=Math.round(ch.x),y=Math.round(ch.y),bob=ch.moving?0:(Math.floor(t/600+ch.phase)%2),hy=y-17+bob,d='#2a1d14';
 px(c,x-3,hy+4,3,3,P.skin);px(c,x+1,hy+4,3,3,P.skin);px(c,x-3,hy+4,1,1,d);px(c,x-2,hy+5,1,1,d);px(c,x-3,hy+6,1,1,d);px(c,x+3,hy+4,1,1,d);px(c,x+2,hy+5,1,1,d);px(c,x+3,hy+6,1,1,d);
 px(c,x-1,hy+6,2,2,'#c05050');px(c,x-5,hy+3,1,1,'#ffe040');px(c,x+5,hy+2,1,1,'#ffe040');}

// ======================= ROUND 4: woodpile chores, 12 eggs + clues, live weather, seasons, pets, bulletin board, sounds =======================
const hash2=(x,y)=>{let h=Math.imul(x|0,374761393)+Math.imul(y|0,668265263);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296;};
// ---- Eastern calendar date (?date=YYYY-MM-DD previews another day) ----
function etDate(){const q=DEMO?QS.get('date'):null;if(q&&/^\d{4}-\d{2}-\d{2}$/.test(q)){const [y,m,d]=q.split('-').map(Number);return {y,m,d};}
 const [y,m,d]=new Date().toLocaleDateString('en-CA',{timeZone:'America/New_York'}).split('-').map(Number);return {y,m,d};}
const DT=etDate(),MD=DT.m*100+DT.d,DAYN=Math.floor(Date.UTC(DT.y,DT.m-1,DT.d)/864e5),WEEKN=Math.floor((DAYN+3)/7);
function thanksDay(y){const f=new Date(Date.UTC(y,10,1)).getUTCDay();return 1+((4-f+7)%7)+21;} // 4th Thursday of November
const SEASON=MD>=1201||MD<301?'winter':MD<601?'spring':MD<922?'summer':'fall';
const HOL=MD>=1231||MD<=102?'newyear':MD>=207&&MD<=214?'valentine':MD>=310&&MD<=317?'stpat':MD>=701&&MD<=704?'july4':MD>=1018&&MD<=1031?'halloween':MD>=1101&&MD<=1100+thanksDay(DT.y)?'harvest':MD>=1201?'winterlights':null;
const LIGHTS=MD>=1201||MD<=101,SNOWMAN=DT.m===12||MD<=107,FWDATE=MD===703||MD===704||MD===1231||MD===101;
const SEASON_LINES={fall:['🍂 Crunchy leaves!','Sweater weather 🍂'],winter:['❄️ Cozy season','Hot cocoa time ☕'],spring:['🌸 Spring is here!','Achoo! Pollen 🌼'],summer:['☀️ Sunscreen on!','Ice pop time 🍦'],
 halloween:['🎃 Happy Halloween!','Boo! 👻'],harvest:['🥧 Pie season!','Grateful for snacks 🍂'],winterlights:['✨ Pretty lights!','☃️ The snowman says hi'],newyear:['🎉 Happy New Year!','New year, new naps'],
 valentine:['💌 Happy Valentine\'s!','You\'re all sweet 💛'],stpat:['🍀 Feeling lucky!','Wear green! 🍀'],july4:['🎆 Fireworks tonight!','Happy 4th! 🎆']};
// seasonal tree colours (picked by position so the forest is stable)
const FALLPAL=[{t1:'#a84a1c',t2:'#d0662a',t3:'#f09a3a',t4:'#7a3216',hi:'#ffc060'},{t1:'#b88a14',t2:'#dcb02c',t3:'#f6d85a',t4:'#8a6410',hi:'#fff09a'},{t1:'#8a2418',t2:'#b8382a',t3:'#e06a44',t4:'#601810',hi:'#ff9a70'}];
function treePal(x,y){const base={t1:P.t1,t2:P.t2,t3:P.t3,t4:P.t4,hi:'#7fcc62'};if(SEASON!=='fall')return base;const r=hash2(x,y);return r<.3?FALLPAL[0]:r<.55?FALLPAL[1]:r<.75?FALLPAL[2]:base;}
function treeDot(c,x,y,dx,dy,r,s){if(SEASON==='winter'&&dy<-r*.3&&hash2(x+dx,y+dy)<.5+(-dy/r)*.45)px(c,x+dx,y+dy-2*s,1,1,dy<-r*.65?'#ffffff':'#e4eef8');
 else if(SEASON==='spring'&&hash2(x+dx,y+dy)<.06)px(c,x+dx,y+dy-2*s,1,1,'#ffc0d8');}
const chatterFor=ch=>{const a=CHATTER[ch.key]||['Hello!'],w=WX.rain>.15?['☔ Lovely weather for ducks','Puddle jumping later?','Pitter patter ☔']:WX.snow>0?['❄️ Snow day!','Brr! ❄️']:[];return [...a,...w,...(SEASON_LINES[HOL]||SEASON_LINES[SEASON]||[])];};
function bubbleText(ch,t){if(ch.quip&&clock<ch.quip.until)return ch.quip.s;if(ch.state==='working')return 'Working…';if(ch.state==='asleep')return 'Zzz…';
 const slot=Math.floor((t/1000+ch.phase*4)/7)%3;
 if(ch.act){if(ch.act.say&&clock<ch.act.sayUntil)return ch.act.say;if(ch.act.phase==='do'){if(ch.state==='filed'&&slot===2)return '📜 Filed a report';
   if(slot!==1){const a=ch.act.lines||ACT_LINES[ch.act.type];return a[Math.floor(t/9000+ch.phase)%a.length];}return null;}}
 if(ch.state==='filed'&&slot!==2)return '📜 Filed a report';
 if(slot===1){const a=chatterFor(ch);return a[Math.floor(t/21000+ch.phase)%a.length];}return null;}

// ---- sound: tiny WebAudio synth, muted by default ----
const SND={on:false,ctx:null,last:{},amb:null};try{SND.on=localStorage.getItem('bhSound')==='1';}catch(e){}
function sndCtx(){if(SND.ctx)return SND.ctx;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;try{const c=new AC();SND.ctx=c;SND.out=c.createGain();SND.out.gain.value=.3;SND.out.connect(c.destination);
 const nb=c.createBuffer(1,c.sampleRate,c.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;SND.noise=nb;}catch(e){SND.ctx=null;}return SND.ctx;}
function tone(f,dur,type,vol,f2,d){const c=SND.ctx,t0=c.currentTime+(d||0),o=c.createOscillator(),gn=c.createGain();o.type=type||'sine';
 if(Array.isArray(f)){o.frequency.setValueAtTime(f[0],t0);f.slice(1).forEach((q,i)=>o.frequency.linearRampToValueAtTime(q,t0+dur*(i+1)/(f.length-1)));}else{o.frequency.setValueAtTime(f,t0);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t0+dur);}
 gn.gain.setValueAtTime(.0001,t0);gn.gain.exponentialRampToValueAtTime(vol,t0+.012);gn.gain.exponentialRampToValueAtTime(.0001,t0+dur);o.connect(gn);gn.connect(SND.out);o.start(t0);o.stop(t0+dur+.05);}
function noise(dur,vol,freq,type,d,q){const c=SND.ctx,t0=c.currentTime+(d||0),s=c.createBufferSource(),fl=c.createBiquadFilter(),gn=c.createGain();s.buffer=SND.noise;fl.type=type||'lowpass';fl.frequency.value=freq||1200;if(q)fl.Q.value=q;
 gn.gain.setValueAtTime(.0001,t0);gn.gain.exponentialRampToValueAtTime(vol,t0+.01);gn.gain.exponentialRampToValueAtTime(.0001,t0+dur);s.connect(fl);fl.connect(gn);gn.connect(SND.out);s.start(t0,Math.random()*.5);s.stop(t0+dur+.05);}
const SFX={
 splash:d=>{noise(.35,.2,1400,'lowpass',d);noise(.18,.07,3500,'bandpass',d+.03,1);},
 bigsplash:d=>{noise(.8,.3,900,'lowpass',d);noise(.4,.1,2500,'bandpass',d+.05,1);},
 quack:d=>{tone(560,.1,'square',.045,360,d);tone(520,.12,'square',.045,330,d+.14);},
 caw:d=>{tone([760,520],.22,'sawtooth',.035,null,d);tone([700,480],.2,'sawtooth',.03,null,d+.28);},
 chop:d=>{noise(.07,.26,2600,'bandpass',d,2);tone(150,.14,'sine',.2,70,d);},
 thud:d=>{tone(110,.15,'sine',.15,60,d);noise(.06,.07,900,'lowpass',d);},
 putt:d=>{tone(1900,.05,'triangle',.11,null,d);noise(.03,.05,5000,'highpass',d);},
 cup:d=>{tone(1320,.1,'sine',.09,null,d);tone(1980,.16,'sine',.06,null,d+.07);},
 hio:d=>{[523,659,784,1047,1319].forEach((f,i)=>tone(f,.18,'triangle',.08,null,d+i*.09));},
 egg:d=>{[784,988,1175,1568].forEach((f,i)=>tone(f,.22,'sine',.09,null,d+i*.08));},
 finale:d=>{[523,659,784,1047,784,1047,1319,1568].forEach((f,i)=>tone(f,.3,'triangle',.075,null,d+i*.13));[262,330,392,523].forEach(f=>tone(f,1.5,'sine',.04,null,d+1.05));},
 meow:d=>{tone([620,900,560],.42,'sine',.08,null,d);tone([1240,1800,1120],.42,'sine',.015,null,d);},
 woof:d=>{tone(300,.11,'square',.045,130,d);noise(.08,.06,700,'lowpass',d);tone(280,.11,'square',.045,120,d+.18);noise(.08,.06,700,'lowpass',d+.18);},
 ribbit:d=>{tone(320,.07,'square',.04,220,d);tone(300,.09,'square',.04,200,d+.1);},
 boing:d=>{tone(200,.3,'sine',.09,600,d);},
 tap:d=>{tone(1650,.05,'square',.03,1200,d);noise(.03,.05,4500,'highpass',d);},
 clank:d=>{tone(330,.16,'square',.035,220,d);tone(990,.08,'triangle',.04,null,d);},
 ufo:d=>{tone([500,900,500,900,500],1.2,'sine',.045,null,d);},
 pop:d=>{noise(.3,.12,500,'lowpass',d);tone(90,.25,'sine',.08,40,d);},
 coin:d=>{tone(988,.08,'square',.025,null,d);tone(1319,.2,'square',.025,null,d+.08);},
 duet:d=>{[[659,330],[784,392],[880,440],[784,392],[1047,523]].forEach(([a,q],i)=>{tone([a,a*1.06,a],.3,'sine',.07,null,d+i*.3);tone(q,.28,'square',.025,null,d+i*.3);});}};
function snd(k,delayMs){if(!SND.on||!SND.ctx||!SFX[k])return;const now=performance.now();if(SND.last[k]&&now-SND.last[k]<200)return;SND.last[k]=now;
 try{if(SND.ctx.state==='suspended')SND.ctx.resume();SFX[k](Math.max(0,delayMs||0)/1000);}catch(e){}}
const FXSND={splash:'splash',bigsplash:'bigsplash',chips:'chop',token:'coin'};
fx.push=function(...a){for(const e of a){const k=e&&FXSND[e.k];if(k)snd(k,(e.t0||clock)-clock);}return Array.prototype.push.apply(this,a);};
function rainAmb(){if(!SND.ctx)return;const want=SND.on&&WX.rain>.15?.03+WX.rain*.04:0;
 if(!SND.amb&&want){const c=SND.ctx,s=c.createBufferSource(),f=c.createBiquadFilter(),h2=c.createBiquadFilter(),gn=c.createGain();s.buffer=SND.noise;s.loop=true;f.type='lowpass';f.frequency.value=1800;h2.type='highpass';h2.frequency.value=400;gn.gain.value=0;
  s.connect(f);f.connect(h2);h2.connect(gn);gn.connect(SND.out);s.start();SND.amb={s,gn};}
 if(SND.amb)SND.amb.gn.gain.setTargetAtTime(want,SND.ctx.currentTime,.5);}

// ---- live weather (Open-Meteo, no key; cached ~30 min; clear if it fails) ----
const WX={rain:0,snow:0,cloud:0,wind:0,temp:null,code:null,src:'clear (default)',wet:0};
const WXQ=DEMO?QS.get('weather'):null;
function wxSet(d,src){Object.assign(WX,{rain:0,snow:0,cloud:0,wind:0,temp:null,code:null,src});if(!d)return;
 const c=+d.weather_code,pr=+d.precipitation||0;WX.code=c;WX.temp=d.temperature_2m==null?null:+d.temperature_2m;WX.cloud=Math.max(0,Math.min(1,(+d.cloud_cover||0)/100));WX.wind=+d.wind_speed_10m||0;
 const snowC=(c>=71&&c<=77)||c===85||c===86,rainC=(c>=51&&c<=67)||(c>=80&&c<=82)||c>=95;
 if(snowC)WX.snow=c===75||c===86?1:.6;else if(rainC||pr>.05)WX.rain=(c>=95||c===65||c===67||c===82)?1:(c>=61||c>=80)?.7:.4;
 if(WX.rain&&WX.wet<.5)WX.wet=.5;}
function wxLoad(){
 if(WXQ){const o={rain:{weather_code:63,precipitation:2,cloud_cover:95,wind_speed_10m:9,temperature_2m:61},clear:{weather_code:0,cloud_cover:0,wind_speed_10m:4,temperature_2m:70},
   warmnight:{weather_code:0,cloud_cover:5,wind_speed_10m:3,temperature_2m:78},snow:{weather_code:73,cloud_cover:95,wind_speed_10m:6,temperature_2m:29},cloudy:{weather_code:3,cloud_cover:85,wind_speed_10m:18,temperature_2m:58}}[WXQ];
  if(o){wxSet(o,'test override: '+WXQ);if(WX.rain)WX.wet=1;return;}}
 try{const c=JSON.parse(localStorage.getItem('bhWx')||'null');if(c&&c.d&&Date.now()-c.t<30*60e3){wxSet(c.d,'live (cached)');return;}}catch(e){}
 fetch('https://api.open-meteo.com/v1/forecast?latitude=33.8&longitude=-84.4&current=temperature_2m,precipitation,weather_code,cloud_cover,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph')
  .then(r=>{if(!r.ok)throw new Error('wx '+r.status);return r.json();})
  .then(j=>{if(!j||!j.current)throw new Error('wx');try{localStorage.setItem('bhWx',JSON.stringify({t:Date.now(),d:j.current}));}catch(e){}wxSet(j.current,'live');})
  .catch(()=>wxSet(null,'clear (fallback)'));}
const raining=()=>WX.rain>.15;
const fliesOK=()=>!raining()&&!WX.snow&&SEASON!=='winter'&&!(WX.temp!=null&&WX.temp<50);
function rainUmb(ch){if(!raining()||ch.inside||ch.look.umbrella||inWater(ch))return false;const a=ch.act;return !(a&&a.phase==='do'&&['nap','vend','swim','inside','chop','farm','golf','build'].includes(a.type));}
function bubOff(ch){const a=ch.act;if(a&&a.type==='swim'&&a.sub==='jump')return 22;const u=ch.look.umbrella||rainUmb(ch);if(inWater(ch))return u?19:12;return u?28:(a&&a.item?31:21);}
function drawUmb(c,ch,t){const x=Math.round(ch.x),y=Math.round(ch.y),col=ch.look.shirt||'#c84a3a',dk=shade(col,-40),lt=shade(col,40);
 px(c,x,y-23,1,11,'#4a3020');px(c,x+1,y-13,1,1,'#4a3020');
 px(c,x-1,y-28,3,1,lt);px(c,x-4,y-27,9,1,col);px(c,x-6,y-26,13,1,col);px(c,x-7,y-25,15,1,col);px(c,x-7,y-24,15,1,dk);
 px(c,x-3,y-27,2,1,lt);px(c,x-5,y-26,2,1,lt);for(let i=-7;i<=7;i+=4)px(c,x+i,y-24,1,1,P.out);px(c,x,y-29,1,1,P.out);}

// ---- bigger woodpile: fetch a log, chop it on the stump, stack the halves ----
const WOOD={logs:7,halves:6};
const CHOPPTS={get:{x:202,y:213},stack:{x:176,y:213}};
function drawWoodpile(c){ // rack with a little roof (whole logs right, split halves left) + a big stump
 px(c,163,212,50,2,'rgba(0,0,0,.2)');px(c,167,192,42,19,'#4a3220');for(let i=168;i<208;i+=3)px(c,i,193,1,17,'#3e2a1a');
 px(c,165,190,2,23,'#6b4526');px(c,209,190,2,23,'#6b4526');px(c,186,192,1,19,'#5a3a20');px(c,165,211,46,2,'#5a3a20');px(c,165,211,46,1,'#7a4a24');
 px(c,161,186,54,4,'#8a5a30');px(c,161,186,54,1,'#b07a44');for(let i=163;i<214;i+=5)px(c,i,187,1,3,'#6b4526');px(c,161,189,54,1,P.out);px(c,161,186,1,4,P.out);px(c,214,186,1,4,P.out);
 px(c,182,226,17,2,'rgba(0,0,0,.22)');px(c,183,217,15,9,'#8a5a30');[185,189,193,196].forEach(i=>px(c,i,219,1,6,'#6b4526'));px(c,181,223,2,3,'#8a5a30');px(c,198,223,2,3,'#8a5a30');px(c,183,225,15,1,P.out);
 px(c,184,213,13,1,'#6b4526');px(c,183,214,15,4,'#e0b878');px(c,183,214,1,3,'#6b4526');px(c,197,214,1,3,'#6b4526');px(c,186,215,9,2,'#c89058');px(c,188,215,5,1,'#b08048');px(c,190,216,1,1,'#8a5a30');px(c,183,217,15,1,'#6b4526');
 [[179,227],[202,226],[177,230],[201,230],[192,229],[186,230],[206,228]].forEach(([x,y])=>px(c,x,y,2,1,'#e0b878'));}
function logEnd(c,x,y){px(c,x+1,y,3,1,'#3a2414');px(c,x,y+1,5,3,'#3a2414');px(c,x+1,y+4,3,1,'#3a2414');px(c,x+1,y+1,3,3,'#e0b878');px(c,x+2,y+2,1,1,'#a87840');px(c,x+1,y+1,1,1,'#f4d8a0');}
function halfEnd(c,x,y,up){px(c,x,y,5,3,'#3a2414');if(up){px(c,x+1,y+1,3,2,'#e0b878');px(c,x+1,y,3,1,'#f0d098');}else{px(c,x+1,y,3,2,'#e0b878');px(c,x+2,y+1,1,1,'#a87840');}}
function drawChopArea(c,t){const chopper=bots.find(o=>o.act&&o.act.type==='chop'&&o.act.phase==='do'),a=chopper&&chopper.act;
 let n=0;for(const [cnt,ly,x0] of [[4,206,188],[3,201,190],[2,196,193],[1,191,195]])for(let i=0;i<cnt;i++){if(n>=WOOD.logs)break;n++;logEnd(c,x0+i*5,ly);}
 for(let i=0;i<WOOD.halves;i++){const r=Math.floor(i/4),k=i%4;halfEnd(c,167+k*5,208-r*3,(r+k)%2===0);}
 if(a&&(a.log||a.stuck)){px(c,CHOP.x-3,CHOP.y-8,7,8,P.out);px(c,CHOP.x-2,CHOP.y-8,5,8,'#8a5a30');px(c,CHOP.x-2,CHOP.y-8,5,2,'#e0b878');px(c,CHOP.x-1,CHOP.y-7,3,1,'#b08048');px(c,CHOP.x,CHOP.y-5,1,4,'#6b4526');}
 if(a&&a.cs==='split'){const o=Math.min(3,Math.floor((clock-(a.t-1000))/90));px(c,CHOP.x-3-o,CHOP.y-7+o,3,7-o,'#8a5a30');px(c,CHOP.x-1-o,CHOP.y-7+o,1,7-o,'#e0b878');px(c,CHOP.x+1+o,CHOP.y-7+o,3,7-o,'#8a5a30');px(c,CHOP.x+1+o,CHOP.y-7+o,1,7-o,'#e0b878');}
 if(!a||(a.cs!=='chop'&&a.cs!=='split')){line(c,CHOP.x+1,CHOP.y-1,CHOP.x+6,CHOP.y-10,'#7a4a24');px(c,CHOP.x-2,CHOP.y-2,4,3,'#a8a8b0');px(c,CHOP.x-2,CHOP.y-2,4,1,'#e0e0e8');}}
function drawAxe(c,ch,a,x,y,f,t){if(a.phase!=='do')return;
 if(a.hold==='log'){const lx=x-5,ly=y-13;px(c,lx,ly,11,5,'#3a2414');px(c,lx+1,ly+1,9,3,'#8a5a30');px(c,lx+1,ly+1,9,1,'#b07a44');const ex=f>0?lx+8:lx;px(c,ex,ly,3,5,'#3a2414');px(c,ex+1,ly+1,1,3,'#e0b878');px(c,x-6,y-11,2,2,P.skin);px(c,x+5,y-11,2,2,P.skin);return;}
 if(a.hold==='halves'){halfEnd(c,x-6,y-14,true);halfEnd(c,x+1,y-14,true);halfEnd(c,x-3,y-11,false);px(c,x-7,y-10,2,2,P.skin);px(c,x+6,y-10,2,2,P.skin);return;}
 if(a.cs!=='chop'&&a.cs!=='split')return;const p=a.cs==='split'?1200:clock-a.cyc;
 const u=a.stuck||p<0||p>=1100?0:p<900?Math.min(1,p/500):1-(p-900)/200;const hx=x+f*4,hy=y-9;
 const dn={x:CHOP.x+(a.stuck?Math.round(Math.sin(t/50)):0),y:CHOP.y-(a.log||a.stuck?8:1)},up={x:x-f*3,y:y-25};
 const ex=dn.x+(up.x-dn.x)*u,ey=dn.y+(up.y-dn.y)*u;line(c,hx,hy,ex,ey,'#7a4a24');px(c,ex-2,ey-1,4,3,'#a8a8b0');px(c,ex-2,ey-1,4,1,'#e0e0e8');px(c,hx-1,hy,2,2,P.skin);}
function chopWalk(ch,a,dt){const g=a.goals[0],dx=g.x-ch.x,dy=g.y-ch.y,d=Math.hypot(dx,dy),sp=(DEMO?2:1)*(a.hold?12:15)*dt/1000;ch.moving=true;
 if(d<=sp){ch.x=g.x;ch.y=g.y;a.goals.shift();if(!a.goals.length)ch.moving=false;}else{ch.x+=dx/d*sp;ch.y+=dy/d*sp;if(Math.abs(dx)>.3)ch.dir=dx<0?-1:1;}}
function tickChop(ch,a,dt){if(!a.cs){a.cs='get';a.goals=[CHOPPTS.get];}
 if(a.goals&&a.goals.length){chopWalk(ch,a,dt||16);return;}
 ch.moving=false;const S0=a.spot;
 if(a.cs==='get'){if(!a.t){a.t=clock+700;ch.dir=1;return;}if(clock<a.t)return;a.t=0;
  if(WOOD.logs<=0){WOOD.logs=8;say(ch,'🪵 Fresh logs delivered!',2600);fx.push({k:'sparkle',x:198,y:200,t0:clock,d:900});snd('thud');}
  WOOD.logs--;a.hold='log';a.cs='back';a.goals=[{x:S0.x,y:S0.y}];if(Math.random()<.35)say(ch,['Heave-ho! 🪵','Got a big one','Oof, heavy!'][(Math.random()*3)|0],2000);return;}
 if(a.cs==='back'){a.hold=null;a.log=true;ch.dir=-1;a.cs='chop';a.cyc=clock+300;a.hit=false;snd('thud');return;}
 if(a.cs==='chop'){ch.dir=-1;const p=clock-a.cyc;
  if(a.stuck){if(clock>a.stuck){a.stuck=0;a.cyc=clock+500;a.hit=false;say(ch,'Got it! 💪',1800);}return;}
  if(p>=1100&&!a.hit){a.hit=true;const r=Math.random();
   if(r<.1){a.stuck=clock+2600;say(ch,'Stuck! 😅',2400);snd('thud');}
   else{a.log=false;a.cs='split';a.t=clock+1000;fx.push({k:'chips',x:CHOP.x,y:CHOP.y-2,t0:clock,d:500});
    if(r<.17){fx.push({k:'bonk',ch,t0:clock+250,d:1600});say(ch,'Ouch! ⭐',2200);snd('boing',250);}else if(Math.random()<.35)say(ch,ACT_LINES.chop[(Math.random()*5)|0],2400);}}
  return;}
 if(a.cs==='split'){if(clock<a.t)return;a.t=0;a.hold='halves';a.cs='stack';a.goals=[CHOPPTS.get,CHOPPTS.stack];return;}
 if(a.cs==='stack'){if(!a.t){a.t=clock+700;ch.dir=-1;return;}if(clock<a.t)return;a.t=0;a.hold=null;
  if(WOOD.halves>=20)say(ch,'That\'s a LOT of firewood!',2600);else{WOOD.halves=Math.min(20,WOOD.halves+2);if(Math.random()<.3)say(ch,['Stacked! 🪵','Neat and tidy','Ready for the stew 🔥'][(Math.random()*3)|0],2000);}
  fx.push({k:'sparkle',x:176,y:204,t0:clock,d:500});a.cs='ret';a.goals=[CHOPPTS.get,{x:S0.x,y:S0.y}];return;}
 if(a.cs==='ret'){a.cs='get';a.goals=[CHOPPTS.get];}}

// ---- bulletin board in the plaza: daily headline + Bot of the Week ----
const BOARD={x:193,y:136,w:16,h:18};OBST.push({x:193,y:142,w:16,h:11});
const HEADLINES=['Duck re-elected Pond Mayor for the 9th year in a row','Local crow denies stealing hat; hat unavailable for comment','Windmill remains undefeated against mini golfers',
 'Lemonade declared "extra lemony" by puckered taste testers','Scarecrow asks for a day off; request "still being considered"','Hammock shortage leaves everyone "very relaxed about it"',
 'Fountain wishes up 12% this week; fountain "a little tired"','Giant carrot spotted in garden; size of carrot disputed','Cat naps for 14 hours, calls it "a light day"',
 'Dog fetches stick, refuses to give stick back','Golf ball found in pond; fish say "finders keepers"','Woodpile reaches new heights, axe asks for a raise',
 'Market sells out of pies by noon, again, somehow','Weather station predicts weather, is correct','Breaking: nothing happened today and it was lovely',
 'Village votes 98 to 2 in favor of more snacks','News bench sets a new record for sitting','Frog claims to be royalty; offers no proof',
 'Newsstand sells out of newspapers about newspapers','Picnic table hosts surprise sandwich summit','Study partner reads 400 pages, asks for more pages',
 'Coach runs 50 laps; track reported "a little dizzy"','Mystery stew ingredient revealed: more stew','Bot tries to relax, gets very bored in 4 minutes',
 'Flowers bloom early; gardener takes all the credit','Antenna picks up strange signal; it was the toaster','Puddle stomping contest ends in a tie (and wet socks)',
 'Local ducks start a band called "The Quacktet"','Survey: the fountain is "the shiniest thing ever"','Mini golf windmill to be renamed "The Destroyer"',
 'Market adds exciting new item: slightly bigger bread','Cat and dog sign peace treaty; treaty already chewed','Fireflies vote to keep the night shift',
 'Village record: 3 bots in one hammock (briefly)','Leaf pile jumped in 47 times before lunch','Bobber watcher sees bobber; bobber sees bobber watcher',
 'Survey says 10 out of 10 bots prefer naps','Lost: one sock. Found: a different sock','Sandwich declared "perfectly fine" by expert panel',
 'Snail wins race against nobody, still very proud','Local bot says "beep"; neighbors agree'];
const HEADLINE=HEADLINES[((DAYN*31+7)%HEADLINES.length+HEADLINES.length)%HEADLINES.length];
// the original 8-bot rotation decides every week up to round 5 (week 2966), so adding Peter never changes a past or current winner; later weeks rotate through everyone
const BOTW_OLD=['Coach','Mark','Clima','Gladdus','Friday','Dos','Luke','ResI'],BOTW_R5=2966,BOTW_ORDER=[...BOTW_OLD,'Peter'].filter(k=>HOUSES[k]);
function botwFor(w){const m=(a,n)=>((a%n)+n)%n;if(w<=BOTW_R5)return BOTW_OLD[m(w,BOTW_OLD.length)];const s0=BOTW_ORDER.indexOf(BOTW_OLD[m(BOTW_R5,BOTW_OLD.length)]);return BOTW_ORDER[m(s0+w-BOTW_R5,BOTW_ORDER.length)];}
const BOTW=botwFor(WEEKN);
const BOTW_WHYS=['for catching (and releasing) the most fish','for world-class hammock technique','for never once losing to the windmill (allegedly)','for the tidiest woodpile in history',
 'for the friendliest wave in the village','for 1,000 cheerful hellos','for heroic snack sharing','for always holding the door','for reading every single headline',
 'for the happiest happy dance','for a record-breaking pie purchase','for keeping the fountain extra shiny'];
const BOTW_WHY=BOTW_WHYS[((WEEKN*7)%BOTW_WHYS.length+BOTW_WHYS.length)%BOTW_WHYS.length];
const botwName=()=>{const o=bots.find(q=>q.key===BOTW);return o?o.name:BOTW;};
function trophyPos(){const h=HOUSES[BOTW];return {x:Math.round(h.x+h.w/2+9),y:h.y+h.h-1};}
function drawBoard(c){const x=BOARD.x,y=BOARD.y;px(c,x+1,y+18,15,1,'rgba(0,0,0,.2)');px(c,x+2,y+11,1,8,'#5a3a20');px(c,x+13,y+11,1,8,'#5a3a20');
 px(c,x-1,y,18,2,'#8a5a30');px(c,x-1,y,18,1,'#b07a44');px(c,x,y+2,16,11,'#6b4526');px(c,x+1,y+3,14,9,'#c8965a');
 for(let i=0;i<9;i++)px(c,x+1+((i*5)%14),y+3+((i*3)%9),1,1,'#b08048');
 px(c,x+2,y+4,5,6,'#f4eee0');px(c,x+3,y+5,3,1,'#3a2a1a');px(c,x+3,y+7,3,1,'#9a9a9a');px(c,x+3,y+8,2,1,'#9a9a9a');
 px(c,x+8,y+4,4,4,'#fff0a0');px(c,x+9,y+5,2,2,'#e8b020');px(c,x+12,y+6,2,5,'#ffc0d0');px(c,x+8,y+9,3,2,'#c0e8ff');
 px(c,x+4,y+4,1,1,'#e84040');px(c,x+9,y+4,1,1,'#3a72c8');px(c,x+12,y+6,1,1,'#40a040');}
Object.assign(ACT_LINES,{board:['📌 What\'s new today?','Ha! 😂','Hmm, interesting…','No way! 😮','Good headline 📰']});
SPOTS.board=[{x:187,y:155,dir:1},{x:216,y:155,dir:-1}];
Object.assign(ACT_DESC,{board:'Reading the bulletin board'});Object.assign(ACT_GO,{board:'the bulletin board'});
function tickBoard(ch,a){if(!a.b){a.b=1;a.until=Math.min(a.until,clock+rint(16000,26000));say(ch,'📌 Ooh, village news!',2400);a.next=clock+4500;}
 if(clock>a.next){a.next=clock+rint(6000,9000);const L=[...ACT_LINES.board,ch.key===BOTW?'🏆 Bot of the Week? Me?! 😊':'🏆 Go, '+botwName()+'!','📰 "'+HEADLINE.split(/[;:,]/)[0]+'"'];say(ch,L[(Math.random()*L.length)|0],2800);}}

// ---- seasonal + holiday background decorations ----
const LEAFPILES=[[156,180],[150,113],[232,181],[70,104]];
function decoDoor(c,h){const cx=Math.round(h.x+h.w/2),by=h.y+h.h,L=h.w<30?cx+20:cx-6,wallY=h.y+Math.floor(h.h*.5);
 const pumpkin=(x,y,jack)=>{px(c,x,y+1,6,4,'#e07a20');px(c,x+1,y,4,6,'#e07a20');px(c,x+1,y+1,1,4,'#f09a3a');px(c,x+3,y,1,6,'#c86010');px(c,x+2,y-1,2,1,'#4a7a32');
  if(jack){px(c,x+1,y+2,1,1,'#3a1a08');px(c,x+4,y+2,1,1,'#3a1a08');px(c,x+1,y+4,4,1,'#3a1a08');}};
 if(HOL==='halloween'){pumpkin(L-7,by-6,true);pumpkin(L-13,by-5,false);}
 else if(HOL==='harvest'){px(c,L-14,by-4,9,4,'#e8c050');px(c,L-14,by-4,9,1,'#f6dc80');px(c,L-14,by-2,9,1,'#c89a30');px(c,L-14,by-1,9,1,'#a87a20');pumpkin(L-12,by-10,false);
  px(c,L-3,by-11,1,11,'#c8a040');px(c,L-4,by-9,1,9,'#d8b050');px(c,L-2,by-8,1,8,'#b89030');px(c,L-4,by-6,3,1,'#c83a30');}
 else if(SEASON==='fall')pumpkin(L-7,by-6,false);
 if(HOL==='winterlights'||HOL==='newyear'&&DT.m===12){const wx=cx-3,wy=by-8;px(c,wx+1,wy,4,1,'#2a7a3a');px(c,wx,wy+1,1,3,'#2a7a3a');px(c,wx+5,wy+1,1,3,'#2a7a3a');px(c,wx+1,wy+4,4,1,'#2a7a3a');px(c,wx+2,wy+1,1,1,'#e84040');px(c,wx+2,wy+5,2,1,'#e84040');}
 if(HOL==='valentine'){const x=cx-2,y=by-7;px(c,x,y,2,1,'#ff5a7a');px(c,x+3,y,2,1,'#ff5a7a');px(c,x,y+1,5,1,'#ff5a7a');px(c,x+1,y+2,3,1,'#ff5a7a');px(c,x+2,y+3,1,1,'#ff5a7a');}
 if(HOL==='stpat'){const x=cx-1,y=by-7;px(c,x,y,2,2,'#3aa040');px(c,x-2,y+1,2,2,'#3aa040');px(c,x+2,y+1,2,2,'#3aa040');px(c,x+1,y+3,1,3,'#2a7a30');}
 if(HOL==='july4'||HOL==='newyear'){const C=HOL==='july4'?['#e84040','#ffffff','#3a72c8']:['#ffd34a','#c87af0','#5cb0ec','#ff5a7a'];for(let i=h.x+3,k=0;i<h.x+h.w-4;i+=3,k++){px(c,i,wallY+1,3,1,C[k%C.length]);px(c,i+1,wallY+2,1,1,C[k%C.length]);}}}
function drawSeasonBG(c){const cw=c.canvas.width,chh=c.canvas.height;
 if(SEASON==='winter'||SEASON==='fall'){const id=c.getImageData(0,0,cw,chh),d=id.data,G=new Set([P.g1,P.g2,P.g3,P.g4].map(h=>parseInt(h.slice(1),16))),LF=[[214,110,40],[232,150,50],[190,70,40],[240,190,70]];
  for(let y=0;y<chh;y++)for(let x=0;x<cw;x++){const i=(y*cw+x)*4,v=(d[i]<<16)|(d[i+1]<<8)|d[i+2];if(!G.has(v))continue;const r=hash2(x,y);
   if(SEASON==='winter'){if(r<.3+hash2(x>>2,y>>2)*.35){const w=r<.12?255:236;d[i]=w;d[i+1]=w;d[i+2]=255;}}else if(r<.035){const L=LF[(r*1000|0)%4];d[i]=L[0];d[i+1]=L[1];d[i+2]=L[2];}}
  c.putImageData(id,0,0);}
 if(SEASON==='winter')for(const k in HOUSES){const h=HOUSES[k],roofH=Math.floor(h.h*.5);for(let r=0;r<3;r++){const ins=Math.max(0,Math.floor((roofH-r)*.35)-1);px(c,h.x+ins+1,h.y+r,h.w-2*ins-2,1,r<2?'#f6faff':'#dce8f4');}
  for(let i=h.x+3;i<h.x+h.w-3;i+=5)px(c,i,h.y+3,1,1+(i%3),'#e8f2ff');}
 if(SEASON==='fall'){const C=['#d0662a','#f09a3a','#b8382a','#dcb02c','#a84a1c'];for(const [x,y] of LEAFPILES){px(c,x-6,y+2,13,1,'rgba(0,0,0,.18)');
  for(let dy=-3;dy<=1;dy++)for(let dx=-6;dx<=6;dx++){if((dx/6.5)**2+((dy+1)/2.6)**2>1)continue;px(c,x+dx,y+dy,1,1,C[(hash2(x+dx,y+dy)*5)|0]);}}}
 for(const k in HOUSES)decoDoor(c,HOUSES[k]);
 if(SNOWMAN){const x=294,y=60;px(c,x-5,y,11,2,'rgba(0,0,0,.18)');const ball=(cy,r)=>{for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(dx*dx+dy*dy<=r*r+1)px(c,x+dx,cy+dy,1,1,dx+dy>r*.6?'#c8d8ec':'#f8fbff');};
  ball(y-4,5);ball(y-12,4);ball(y-18,3);px(c,x-1,y-19,1,1,P.out);px(c,x+1,y-19,1,1,P.out);px(c,x+1,y-18,3,1,'#f08a2a');px(c,x-3,y-15,7,2,'#e84040');px(c,x+2,y-14,2,3,'#e84040');
  px(c,x,y-12,1,1,P.out);px(c,x,y-10,1,1,P.out);line(c,x-4,y-12,x-8,y-15,'#6b4526');line(c,x+4,y-12,x+8,y-15,'#6b4526');px(c,x-3,y-22,7,1,P.out);px(c,x-2,y-25,5,3,'#2a2a30');}
 drawBoard(c);}
if(SNOWMAN)OBST.push({x:288,y:42,w:13,h:18});
{const _bb=buildBG;buildBG=function(cfg){_bb(cfg);drawSeasonBG(b);};}

// ---- live ground layer: puddles, bottle, trophy, lights, sunbeams ----
const PUDS=[[60,88],[140,90],[226,86],[312,92],[30,168],[118,170],[214,166],[290,172],[350,168],[222,139],[172,122],[150,84]].filter(([x,y])=>tileAt(Math.floor(x/T),Math.floor(y/T))===1);
const R4={scare:-1e9,trophy:-1e9,bottle:null,bottleNext:DEMO?6000:rint(60000,150000),stick:null,lastPet:null,rip:0,fwNext:0,party:-1e9};
const FW=[],FWCOL=['#ff5a7a','#ffe040','#5cb0ec','#7fcc62','#c87af0','#ffffff','#ff9a3a'];
function bottlePos(){const B=R4.bottle;if(!B)return null;const p=(clock-B.t0)/B.d;if(p>=1){R4.bottle=null;R4.bottleNext=clock+(DEMO?20000:rint(120000,240000));return null;}return {x:296+p*64,y:238+Math.sin(p*9)*1.5,p};}
function drawGround4(c,t){
 if(WX.wet>.03)for(const [x,y] of PUDS){const s=WX.wet*(.6+hash2(x,y)*.6),rx=Math.round(2+5*s),ry=Math.max(1,Math.round(1+1.6*s));
  for(let dy=-ry;dy<=ry;dy++){const w=Math.round(rx*Math.sqrt(1-(dy/(ry+.5))**2));px(c,x-w,y+dy,w*2+1,1,'rgba(80,130,190,.55)');}
  px(c,x-rx+2,y-ry+1,Math.max(1,rx-1),1,'rgba(220,240,255,.6)');if(raining()&&Math.floor(t/300+x)%5===0)px(c,x+((t/97+x)%(rx*2))-rx,y,1,1,'#e8f6ff');}
 const tp=trophyPos(),tb=Math.floor(t/2400)%3===0&&(t%2400)<300?1:0;px(c,tp.x-3,tp.y,7,1,'rgba(0,0,0,.25)');px(c,tp.x-2,tp.y-1,5,1,'#8a6420');px(c,tp.x-1,tp.y-2,3,1,'#c8962a');px(c,tp.x,tp.y-4,1,2,'#c8962a');
 px(c,tp.x-2,tp.y-7,5,3,'#ffd34a');px(c,tp.x-1,tp.y-5,3,1,'#e8b020');px(c,tp.x-3,tp.y-7,1,2,'#e8b020');px(c,tp.x+3,tp.y-7,1,2,'#e8b020');px(c,tp.x-1,tp.y-7,1,1,'#fff6c0');if(tb){px(c,tp.x+3,tp.y-10,1,3,'#fffbe0');px(c,tp.x+2,tp.y-9,3,1,'#fffbe0');}
 if(!R4.bottle&&clock>R4.bottleNext)R4.bottle={t0:clock,d:35000};const bp=bottlePos();
 if(bp){const x=Math.round(bp.x),y=Math.round(bp.y);px(c,x-3,y+1,8,1,P.w3);px(c,x-3,y-1,6,3,'#4a8a6a');px(c,x+3,y,2,1,'#4a8a6a');px(c,x+5,y,1,1,'#a87a40');px(c,x-2,y,3,1,'#f4eee0');px(c,x-2,y-1,4,1,'#8ad0b0');
  if(Math.floor(t/600)%3===0)px(c,x-1,y-3,1,1,'#ffffff');}
 if(R4.stick){const S2=R4.stick,p=Math.min(1,(clock-S2.t0)/S2.d),x=S2.x0+(S2.x1-S2.x0)*p,y=S2.y0+(S2.y1-S2.y0)*p-Math.sin(p*Math.PI)*14;if(p<1){const r=Math.floor(p*8)%2;if(r)px(c,x-1,y-2,2,5,'#7a4a24');else px(c,x-3,y,6,1,'#7a4a24');}else px(c,x-3,y-1,6,1,'#7a4a24');}
 for(const p of PETS)if(p.mode==='nap'&&!raining()){const h=etHour();if(h>=7&&h<18){c.globalAlpha=.35;px(c,p.x-6,p.y-5,12,1,'#fff0a0');px(c,p.x-8,p.y-4,16,5,'#fff0a0');px(c,p.x-6,p.y+1,12,1,'#fff0a0');c.globalAlpha=1;}}
 if(LIGHTS){const C=['#ff4a4a','#ffd34a','#4ac8ff','#7fea6a','#ff8ad8'];for(const k in HOUSES){const h=HOUSES[k],wy=h.y+Math.floor(h.h*.5)+1;let n=0;for(let i=h.x+2;i<h.x+h.w-2;i+=3,n++){const on=(Math.floor(t/600)+n)%3!==0;px(c,i,wy,1,1,on?C[n%5]:shade(C[n%5],-90));}}}
 if(clock-R4.scare<2600){const p=(clock-R4.scare)/2600,lift=Math.round(Math.sin(p*Math.PI)*10),sx=187,sy=56;px(c,sx-4,sy-5,9,2,'#f5e050');px(c,sx-3,sy-6,1,1,'#f5e050');px(c,sx+2,sy-6,1,1,'#f5e050');
  px(c,sx-4,sy-5-lift,9,2,'#c89a30');px(c,sx-2,sy-7-lift,5,2,'#c89a30');}}

// ---- sky layer (after characters): clouds, wind, rain, snow, leaves ----
function drawSky4(c,t){const wind=Math.min(30,WX.wind||0),sl=1+wind/12;
 if(WX.cloud>.2){const n=Math.round(2+WX.cloud*3);for(let i=0;i<n;i++){const x=((i*131+t/1000*(3+wind*.5))%(W+80))-40,y=40+(i*67)%200;glow(c,x,y,26+(i%3)*8,`rgba(20,30,60,${(.06+WX.cloud*.08).toFixed(3)})`);}
  for(let i=0;i<n;i++){const x=((i*97+40+t/1000*(4+wind*.6))%(W+60))-30,y=8+(i*11)%14;c.globalAlpha=.55+WX.cloud*.35;for(const [dx,dy,r] of [[0,0,6],[7,-2,5],[13,1,5],[-6,2,4]])for(let yy=-r;yy<=r;yy++){const w=Math.round(Math.sqrt(r*r-yy*yy)*1.4);px(c,x+dx-w,y+dy+yy,w*2,1,raining()?'#c8ccd4':'#ffffff');}c.globalAlpha=1;}}
 if(wind>10)for(let i=0;i<4;i++){const x=(i*113+t/6*(1+wind/20))%(W+40)-20,y=50+(i*59)%190;c.globalAlpha=.35;px(c,x,y,8+(i%3)*3,1,'#ffffff');c.globalAlpha=1;}
 if(raining()){const n=Math.round(40+WX.rain*70);for(let i=0;i<n;i++){const sp=.3+(i%5)*.04,x=(i*37.7+hash2(i,3)*W+t*sp*.25*sl)%W,y=(i*53+hash2(i,7)*H+t*sp)%H;px(c,x,y,1,3,'rgba(200,220,255,.5)');px(c,x+sl*.6,y+3,1,1,'rgba(200,220,255,.35)');}
  c.fillStyle=`rgba(40,60,90,${(.12+WX.rain*.08).toFixed(3)})`;c.fillRect(0,0,W,H);
  if(clock>R4.rip){R4.rip=clock+200/WX.rain;const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*.85;fx.push({k:'ripple',x:pond.cx+Math.cos(a)*pond.rx*r,y:pond.cy+Math.sin(a)*pond.ry*r,t0:clock,d:900});}}
 const snowN=WX.snow?Math.round(40+WX.snow*50):SEASON==='winter'?24:0;for(let i=0;i<snowN;i++){const sp=.012+(i%4)*.004,y=(i*53+hash2(i,11)*H+t*sp)%H,x=(i*71+hash2(i,5)*W+Math.sin(t/900+i)*6+t*sp*.4*sl)%W;px(c,x,y,i%5===0?2:1,i%5===0?2:1,'#ffffff');}
 if(SEASON==='fall'&&!raining())for(let i=0;i<9;i++){const sp=.008+(i%3)*.003,y=(i*41+hash2(i,2)*H+t*sp)%H,x=(i*89+hash2(i,9)*W+Math.sin(t/700+i*2)*9+t*sp*.5*sl)%W,C=['#d0662a','#f09a3a','#b8382a','#dcb02c'];px(c,x,y,2,1,C[i%4]);if(Math.floor(t/400+i)%2)px(c,x+1,y+1,1,1,C[(i+1)%4]);}
 if(SEASON==='spring'&&!raining())for(let i=0;i<6;i++){const sp=.01,y=(i*61+t*sp)%H,x=(i*97+Math.sin(t/800+i)*8+t*sp*.6)%W;px(c,x,y,1,1,'#ffc0d8');}}

// ---- night layer: warm fireflies, holiday lights, jack-o-lanterns, fireworks ----
function drawNight4(c,t,h){const night=h>=19||h<6;
 if(night){c.globalCompositeOperation='lighter';
  if(LIGHTS)for(const k in HOUSES){const hh=HOUSES[k];glow(c,hh.x+hh.w/2,hh.y+Math.floor(hh.h*.5)+1,hh.w*.6,'rgba(255,190,120,.18)');}
  if(HOL==='halloween')for(const k in HOUSES){const hh=HOUSES[k];glow(c,Math.round(hh.x+hh.w/2)-10,hh.y+hh.h-3,7,`rgba(255,150,40,${(.45+Math.sin(t/180+hh.x)*.12).toFixed(2)})`);}
  if(fliesOK()&&WX.temp!=null&&WX.temp>=65)for(let i=0;i<16;i++){const x=(i*61+Math.sin(t/1700+i*1.7)*16+W)%W,y=50+(i*43)%210+Math.cos(t/1300+i)*7,on=(Math.sin(t/500+i*2.3)+1)/2;if(on<.25)continue;glow(c,x,y,4,`rgba(220,255,120,${(on*.55).toFixed(2)})`);px(c,x,y,1,1,'#f8ffb0');}
  c.globalCompositeOperation='source-over';
  if(HOL==='halloween')for(let i=0;i<3;i++){const x=(i*140+t/40)%(W+40)-20,y=30+i*14+Math.sin(t/300+i)*5,w=Math.floor(t/120+i)%2;px(c,x-1,y,3,2,'#1a1020');px(c,x-4,y-w,3,1,'#1a1020');px(c,x+2,y-w,3,1,'#1a1020');}
  if(FWDATE&&(h>=20||h<1)&&clock>R4.fwNext){R4.fwNext=clock+rint(500,1200);FW.push({x:40+Math.random()*320,y:20+Math.random()*60,t0:clock,d:1700,col:FWCOL[(Math.random()*FWCOL.length)|0]});}}
 if(RM)FW.length=0;for(let i=FW.length-1;i>=0;i--){const f=FW[i],p=(clock-f.t0)/f.d;if(p<0)continue;if(p>=1){FW.splice(i,1);continue;}
  if(p<.3){const q=p/.3,y=H*.7+(f.y-H*.7)*q;px(c,f.x,y,1,2,'#fff0c0');px(c,f.x,y+2,1,1,'rgba(255,200,120,.5)');}
  else{if(!f.pop){f.pop=1;snd('pop');}const q=(p-.3)/.7,r=4+q*24;c.globalAlpha=Math.max(0,1-q*q);if(q<.35){c.globalCompositeOperation='lighter';glow(c,f.x,f.y,10+q*30,'rgba(255,230,160,.35)');c.globalCompositeOperation='source-over';}for(let k=0;k<24;k++){const a=k/24*Math.PI*2,rr=k%2?r:r*.7;px(c,Math.round(f.x+Math.cos(a)*rr),Math.round(f.y+Math.sin(a)*rr+q*q*10),2,2,k%3?f.col:'#ffffff');}c.globalAlpha=1;}}}

// ---- pets: Mochi the cat and Waffles the dog ----
const PETQ=DEMO?QS.get('pet'):null;
const PETS=[{pet:'cat',name:'Mochi',x:214,y:158,dir:-1,sp:12,mode:'idle',until:2500,phase:.3},{pet:'dog',name:'Waffles',x:120,y:178,dir:1,sp:15,mode:'idle',until:4000,phase:.7}];
const PNAP={cat:[[262,250],[214,158],[94,100],[230,104]],dog:[[316,156],[62,180],[138,182],[190,96]]};
const RUNTO=[[240,178],[150,178],[300,176],[222,272],[110,100]];
let CHASE=null;
function petInit(){for(const k in PNAP)PNAP[k]=PNAP[k].filter(([x,y])=>walkable(x,y)).map(([x,y])=>({x,y}));
 for(const x of [382,378,386,374])for(const y of [228,224,232]){if(walkable(x,y)&&findPath({x:300,y:176},{x,y})){CHASE={x,y};break;}}if(CHASE)return;CHASE={x:300,y:176};}
function petGo(p,to,goal,sp){const path=findPath(p,to);if(!path||!path.length)return false;path[path.length-1]={x:to.x,y:to.y};p.path=path;p.goal=goal;p.spd=sp||p.sp;p.mode='walk';return true;}
function petNext(p){const cat=p.pet==='cat',other=PETS.find(o=>o!==p);p.mode='idle';p.target=null;
 let k=null;if(PETQ&&!p.q&&(PETQ!=='fetch')){p.q=1;k=PETQ;}
 const fisher=bots.find(b=>!b.inside&&b.act&&b.act.type==='fish'&&b.act.phase==='do'&&other.target!==b);
 if(k==='beg'&&!fisher){p.q=0;p.until=clock+1500;return;}
 if(!k){const r=Math.random();if(fisher&&r<(cat?.3:.18))k='beg';else if(r<.48&&clock>(p.chaseCool||0)&&other.mode!=='chase'&&other.goal!=='chase')k='chase';else if(r<.72)k='nap';else k='wander';}
 if(k==='chase'){if(petGo(p,CHASE,'chase',p.sp*1.6))return;k='wander';}
 if(k==='beg'){const s=fisher.act.spot,c0=s.x===324?[[-14,-10],[14,-10],[-1,9]]:[[-9,-1],[-7,4],[7,5],[-10,2],[0,6],[10,2],[9,-1]];for(const [ox,oy] of c0){const to={x:s.x+ox,y:s.y+oy};if(walkable(to.x,to.y)&&petGo(p,to,'beg',p.sp*1.3)){p.target=fisher;return;}}if(PETQ==='beg')p.q=0;k='wander';}
 if(k==='nap'&&!raining()){const L=PNAP[p.pet].filter(s=>Math.hypot(s.x-other.x,s.y-other.y)>14);const s=L[(Math.random()*L.length)|0];if(s&&petGo(p,s,'nap'))return;}
 for(let i=0;i<10;i++){const to={x:Math.round(Math.max(24,Math.min(376,p.x+rint(-80,80)))),y:Math.round(Math.max(30,Math.min(276,p.y+rint(-50,50))))};if(walkable(to.x,to.y)&&petGo(p,to,'wander'))return;}
 p.until=clock+3000;}
function petArrive(p){const g=p.goal,cat=p.pet==='cat';p.goal=null;p.moving=false;
 if(g==='chase'){p.mode='chase';p.until=clock+rint(7000,10000);p.chaseCool=clock+(DEMO?15000:rint(90000,180000));p.quip={s:cat?'😼 Ducks…':'🐶 DUCKS!!',until:clock+2000};DUCKX.boost=p.until;snd(cat?'meow':'woof');p.nextQ=clock+2200;return;}
 if(g==='beg'){if(!p.target){petNext(p);return;}p.mode='beg';p.until=clock+rint(30000,45000);p.dir=p.target.x>p.x?1:-1;p.nextQ=clock+2000;p.seen=p.target.act&&p.target.act.itemUntil;return;}
 if(g==='nap'){p.mode='nap';p.until=clock+rint(20000,40000);return;}
 if(g==='run'){p.mode='eat';p.until=clock+4500;p.quip={s:cat?'😼 Nom nom nom':'🐶 *chomp chomp*',until:clock+2600};return;}
 if(g==='fetch'){p.carry='stick';R4.stick=null;p.quip={s:'🐶 Got it!!',until:clock+1500};if(!petGo(p,p.back,'fetchback',p.sp*2.2)){p.carry=null;p.fetching=false;p.mode='idle';p.until=clock+2500;}return;}
 if(g==='fetchback'){p.carry=null;p.fetching=false;p.quip={s:'🐶 Again? AGAIN?!',until:clock+2600};p.react={t0:clock,d:1500};p.mode='idle';p.until=clock+3000;return;}
 p.mode='idle';p.until=clock+rint(2500,7000);}
function petSteal(p,b){const cat=p.pet==='cat';b.act.item=null;say(b,cat?'HEY! My fish! 😤':'Hey! Come back with that! 😂',2800);b.react={k:'jump',t0:clock,d:1200};
 p.carry='fish';p.target=null;p.quip={s:cat?'😼 Mine now!':'🐶 Thank youuu!',until:clock+2200};snd(cat?'meow':'woof');
 const far=RUNTO.map(([x,y])=>({x,y})).filter(q=>walkable(q.x,q.y)).sort((q,r)=>Math.hypot(r.x-b.x,r.y-b.y)-Math.hypot(q.x-b.x,q.y-b.y));for(const q of far)if(petGo(p,q,'run',p.sp*2.4))return;p.mode='eat';p.until=clock+4000;}
function petTick(p,dt){const cat=p.pet==='cat',k=(DEMO?2:1)*dt/1000;
 if(p.mode==='splash'){catSplashTick(p);return;}
 if(p.path&&p.path.length){const g=p.path[0],dx=g.x-p.x,dy=g.y-p.y,d=Math.hypot(dx,dy),sp=p.spd*k;p.moving=true;if(Math.abs(dx)>.3)p.dir=dx<0?-1:1;
  if(d<=sp){p.x=g.x;p.y=g.y;p.path.shift();if(!p.path.length){p.path=null;petArrive(p);}}else{p.x+=dx/d*sp;p.y+=dy/d*sp;}return;}
 p.moving=false;
 if(p.mode==='chase'){const ty=Math.max(CHASE.y-8,Math.min(CHASE.y+8,DUCK.y+1)),dy=ty-p.y,sp=30*k;if(Math.abs(dy)>1&&walkable(p.x,p.y+Math.sign(dy)*2)){p.y+=Math.sign(dy)*Math.min(sp,Math.abs(dy));p.moving=true;}p.dir=DUCK.x<p.x?-1:1;
  if(clock>p.nextQ){p.nextQ=clock+rint(1800,2600);const L=cat?['😼 Hsssss…','Here, ducky ducky…','*wiggles butt*']:['Woof! Woof!','🐶 Ducks! Ducks!','Bark bark! 🦆'];p.quip={s:L[(Math.random()*3)|0],until:clock+1500};snd(cat?'meow':'woof');snd('quack',350);fx.push({k:'ripple',x:DUCK.x,y:DUCK.y+2,t0:clock,d:900});}}
 if(p.mode==='beg'){const b=p.target;if(!b||!b.act||b.act.type!=='fish'||b.act.phase!=='do'){petNext(p);return;}p.dir=b.x>p.x?1:-1;
  if(b.act.item==='fish'&&p.seen!==b.act.itemUntil){p.seen=b.act.itemUntil;if(Math.random()<(PETQ==='beg'?1:.5)){petSteal(p,b);return;}}
  if(clock>p.nextQ){p.nextQ=clock+rint(7000,11000);const L=cat?['😺 *stares at bobber*','Mrrrow? 🐟','Is that for me?']:['🐶 *puppy eyes*','Fish? For me? 🥺','*tail wag wag wag*'];p.quip={s:L[(Math.random()*3)|0],until:clock+2200};}}
 if(clock>p.until&&!p.fetching)petNext(p);}
function petsUpdate(dt){if(!CHASE)petInit();DUCKX.off+=clock<DUCKX.boost?dt/9000*2.2:0;
 if(raining())WX.wet=Math.min(1,WX.wet+dt/60000);else WX.wet=Math.max(0,WX.wet-dt/240000);
 for(const p of PETS){if(p.quip&&clock>p.quip.until)p.quip=null;petTick(p,dt);if(p.carry==='fish'&&p.mode==='idle')p.carry=null;if(p.mode!=='eat'&&p.carry==='fish'&&!p.path)p.carry=null;}}
const DUCKX={off:0,boost:0};
function catSplash(p){p.mode='splash';p.path=null;p.t0=clock;p.sx=p.x;p.sy=p.y;p.quip={s:'😼 !!!',until:clock+900};DUCKX.boost=0;}
function catSplashTick(p){const e=clock-p.t0,wx=p.sx-10;
 if(e<600){const q=e/600;p.x=p.sx+(wx-p.sx)*q;p.y=p.sy-Math.sin(q*Math.PI)*7;p.inWater=false;return;}
 if(!p.inWater&&e<2400){p.inWater=true;p.x=wx;p.y=p.sy+2;fx.push({k:'bigsplash',x:wx,y:p.sy+1,t0:clock,d:900});ftext('SPLASH!',wx,p.sy-14,1600);setTimeout(()=>ftext('🦆 Quack quack! 😂',DUCK.x,DUCK.y-12,1800),700);snd('quack',700);snd('meow',300);foundEgg('catsplash',wx,p.sy-6);}
 if(e<2400){p.y=p.sy+2+Math.round(Math.sin(e/160));return;}
 if(e<3000){const q=(e-2400)/600;p.inWater=false;p.x=wx+(p.sx-wx)*q;p.y=p.sy;return;}
 p.x=p.sx;p.y=p.sy;p.mode='idle';p.until=clock+5000;p.wet=clock+15000;p.quip={s:'😾 …I meant to do that.',until:clock+3200};}
function petDuet(){const [c0,d0]=PETS;c0.quip={s:'🎵 Meeeooow~',until:clock+3200};d0.quip={s:'🎵 Awoooo~',until:clock+3200};for(const p of PETS){p.react={t0:clock,d:1500};for(let i=0;i<4;i++)fx.push({k:'note',x:p.x+(i%2?3:-3),y:p.y-12,t0:clock+i*350,d:1400});}
 snd('duet');ftext('🎶 Meow-woof duet! 🎶',(c0.x+d0.x)/2,Math.min(c0.y,d0.y)-24,3000);foundEgg('duet',(c0.x+d0.x)/2,Math.min(c0.y,d0.y)-10);}
function petFetch(p){p.fetching=true;p.back={x:p.x,y:p.y};let to=null;for(let i=0;i<14&&!to;i++){const a=Math.random()*Math.PI*2,r=rint(30,55),q={x:Math.round(p.x+Math.cos(a)*r),y:Math.round(p.y+Math.sin(a)*r*.7)};if(q.x>20&&q.x<380&&q.y>30&&q.y<280&&walkable(q.x,q.y)&&findPath(p,q))to=q;}
 if(!to){p.fetching=false;return false;}R4.stick={x0:p.x,y0:p.y-8,x1:to.x,y1:to.y,t0:clock,d:700};p.quip={s:'🐶 STICK?! STICK!!',until:clock+1800};p.react={t0:clock,d:600};snd('woof');ftext('Fetch! 🦴',p.x,p.y-18,1600);
 setTimeout(()=>{if(!petGo(p,to,'fetch',p.sp*2.4)){p.fetching=false;R4.stick=null;}},550);foundEgg('fetch',p.x,p.y-8);return true;}
function petTap(mx,my,hs){let best=null,bd=6.5*hs;for(const p of PETS){const d=Math.hypot(mx-p.x,my-(p.y-(p.inWater?1:4)));if(d<bd){bd=d;best=p;}}if(!best)return false;
 const p=best,cat=p.pet==='cat';if(p.mode==='splash')return true;
 if(SND.on&&R4.lastPet&&R4.lastPet.p!==p&&clock-R4.lastPet.t<2500){R4.lastPet=null;petDuet();return true;}R4.lastPet={p,t:clock};
 if(cat&&p.mode==='chase'){catSplash(p);return true;}
 if(!cat&&!p.fetching){p.taps=(p.taps||[]).filter(q=>clock-q<4000);p.taps.push(clock);if(p.taps.length>=3){p.taps=[];if(petFetch(p))return true;}}
 const L=p.mode==='nap'?(cat?['…five more minutes 😾','*purrs in sleep*']:['*snore* …woof?','*sleepy tail thump*']):cat?['Meow! 😺','Mrrp?','Purrrr… 💛','*slow blink*','😺 Pet me more']:['Woof! 🐶','*tail wags*','Hi hi hi hi!','Ball? BALL?! 🎾','🐶 Good boy? Me?'];
 p.quip={s:p.name+': '+L[(Math.random()*L.length)|0],until:clock+2400};p.react={t0:clock,d:900};fx.push({k:'heart',x:p.x,y:p.y-10,t0:clock,d:1200});snd(cat?'meow':'woof');return true;}
function drawPet(c,p,t){let x=Math.round(p.x),y=Math.round(p.y);const f=p.dir,cat=p.pet==='cat';
 const R=p.react&&clock-p.react.t0<p.react.d?p.react:null;if(R&&p.mode!=='nap')y-=Math.round(Math.abs(Math.sin((clock-R.t0)/R.d*Math.PI*2))*3);
 if(clock<DANCE.until&&!RM&&p.mode!=='nap')y-=Math.round(Math.abs(Math.sin(t/140+p.phase*3))*2);
 const q=(dx,dy,w,h,col)=>px(c,f>0?x+dx:x-dx-w+1,y+dy,w,h,col),wet=clock<(p.wet||0);
 if(p.inWater){q(-3,-4,6,3,'#e8963a');q(-3,-5,1,1,'#e8963a');q(2,-5,1,1,'#e8963a');q(1,-3,1,1,P.out);px(c,x-6,y-1,13,1,'rgba(230,248,255,.8)');return;}
 if(!(p.mode==='chase'&&false))px(c,x-5,y,11,1,'rgba(0,0,0,.22)');
 const st=p.moving?Math.floor(t/110)%2:0;
 if(cat){const C=wet?'#c07a40':'#e8963a',D='#b8682a',Wt='#fff2dc';
  if(p.mode==='nap'){q(-4,-4,8,4,C);q(-3,-5,6,1,C);q(2,-6,4,3,C);q(2,-7,1,1,C);q(5,-7,1,1,C);q(3,-5,2,1,D);q(-5,-2,9,1,D);q(-2,-4,1,1,D);q(0,-4,1,1,D);q(-6,-2,2,1,C);
   const z=Math.floor(t/700)%3;px(c,x+2,y-10-z,2,1,'#ffffff');px(c,x+3,y-9-z,1,1,'#ffffff');px(c,x+2,y-8-z,2,1,'#ffffff');return;}
  q(-4,-6,7,4,C);q(-4,-3,7,1,D);q(-3,-6,1,1,D);q(-1,-6,1,1,D);
  q(-4,-2,1,2-st,D);q(-2,-2,1,1+st,D);q(1,-2,1,2-st,D);q(2,-2,1,1+st,D);
  q(2,-9,4,4,C);q(2,-10,1,1,C);q(5,-10,1,1,C);q(4,-8,1,1,P.out);q(5,-7,1,1,'#f39a8a');q(3,-6,2,1,Wt);
  const tf=Math.floor(t/400+p.phase*5)%2;q(-5,-9,1,4,C);q(tf?-6:-4,-10,1,1,C);
  if(p.carry==='fish'){q(5,-7,4,2,'#f0903a');q(9,-8,1,4,'#e07020');}
  if(wet&&Math.floor(t/300)%2)px(c,x+(f>0?-2:1),y-11,1,1,'#9ad0f0');}
 else{const C='#b07a44',E='#7a4a24',M='#f0dcc0';
  if(p.mode==='nap'){q(-5,-4,10,4,C);q(4,-5,4,3,C);q(4,-5,2,4,E);q(7,-4,1,1,P.out);q(6,-4,1,1,'#5a3a20');q(-6,-2,2,1,C);
   const z=Math.floor(t/700)%3;px(c,x+3,y-10-z,2,1,'#ffffff');px(c,x+4,y-9-z,1,1,'#ffffff');px(c,x+3,y-8-z,2,1,'#ffffff');return;}
  const sit=p.mode==='beg'||p.mode==='eat';
  if(sit){q(-3,-7,6,6,C);q(-3,-2,6,1,shade(C,-25));q(-4,-1,3,1,C);q(1,-1,3,1,C);q(2,-12,5,5,C);q(6,-9,2,2,M);q(7,-10,1,1,P.out);q(4,-11,1,1,P.out);q(2,-12,2,5,E);q(3,-7,2,1,'#e84040');}
  else{q(-5,-7,9,4,C);q(-5,-4,9,1,shade(C,-25));q(-5,-3,1,3-st,C);q(-3,-3,1,2+st,C);q(1,-3,1,3-st,C);q(3,-3,1,2+st,C);q(3,-11,5,5,C);q(7,-8,2,2,M);q(8,-9,1,1,P.out);q(5,-10,1,1,P.out);q(3,-11,2,5,E);q(3,-7,1,2,'#e84040');}
  const w=Math.floor(t/(p.mode==='beg'||R||p.fetching?90:240))%2;q(sit?-4:-6,-9+w,1,3,C);q(sit?-5:-7,-10+w*2,1,1,C);
  if(p.carry==='stick')q(5,-6,8,1,'#7a4a24');if(p.carry==='fish'){q(6,-8,4,2,'#f0903a');q(10,-9,1,4,'#e07020');}}}
function petBubbles(fs,placed){for(const p of PETS)if(p.quip&&clock<p.quip.until)bubble(p.quip.s.length>30?p.quip.s.slice(0,29)+'…':p.quip.s,p.x*S,(p.y-(p.inWater?8:14))*S,fs,false,placed);}

// ---- easter eggs (EGG_TOTAL counts them: 13 as of round 5) ----
var EGG_LVL={crow:1,duck:1,scarecrow:1,trophy:1,fountain:2,frog:2,bottle:2,fetch:2,ufo:3,shuffle:3,catsplash:3,duet:3,build:2},EGG_TOTAL=Object.keys(EGG_LVL).length;
const LVL_NAME={1:'Easy',2:'Medium',3:'Hard'};
function eggCount(){if(eggEl)eggEl.textContent='🥚 Eggs found: '+EGGS.length+' of '+EGG_TOTAL;}
function foundEgg(k,x,y){if(EGGS.includes(k))return;EGGS.push(k);try{localStorage.setItem('bhEggs',JSON.stringify(EGGS));}catch(e){}eggCount();
 fx.push({k:'confetti',x,y,t0:clock,d:1600},{k:'confetti',x:x+20,y:y+10,t0:clock+250,d:1600},{k:'confetti',x:x-20,y:y+6,t0:clock+500,d:1600});
 eggEl.classList.remove('pop');void eggEl.offsetWidth;eggEl.classList.add('pop');snd('egg',150);
 if(EGGS.length>=EGG_TOTAL){showToast('🎉 All '+EGG_TOTAL+' eggs found! GRAND FINALE!',7000);grandFinale();}
 else{const half=EGGS.length===Math.ceil(EGG_TOTAL/2);showToast('🥚 Egg found: '+EGG_NAMES[k]+'! ('+EGGS.length+' of '+EGG_TOTAL+')'+(half?' Halfway there! 🎉':''),half?4500:3200);}
 clueUI();}
function grandFinale(){R4.party=clock;DANCE.until=clock+12000;EGGFX.show=clock+12000;EGGFX.ducklings=clock+40000;snd('finale',300);
 for(let i=0;i<14;i++)fx.push({k:'confetti',x:30+(i%7)*56,y:50+Math.floor(i/7)*110+(i%2)*30,t0:clock+i*300,d:1800});
 for(let i=0;i<16;i++)FW.push({x:30+Math.random()*340,y:22+Math.random()*70,t0:clock+400+i*650+Math.random()*300,d:1700,col:FWCOL[i%FWCOL.length]});
 for(const o of bots)if(!o.inside)o.quip={s:['Grand finale! 🎆','We did it! 🎉','Party time! 💃','Best village ever! 🕺',EGG_TOTAL+' out of '+EGG_TOTAL+'! 🥚'][(Math.random()*5)|0],until:clock+10000};
 for(const p of PETS){p.quip={s:p.pet==='cat'?'😺 Meow-velous!':'🐶 Best. Day. EVER!',until:clock+6000};p.react={t0:clock,d:4000};}
 ftext('🎆 Grand finale! You found all '+EGG_TOTAL+'! 🎆',200,42,5000);}
function eggTap4(mx,my,hs){const near=(x,y,r)=>Math.hypot(mx-x,my-y)<r*hs;
 const cq=crowPos(clock);if(cq&&!cq.fly&&near(CROW.x+1,CROW.y,6)){snd('caw');return false;}
 if(near(DUCK.x,DUCK.y,6)){snd('quack');return false;}
 const bp=bottlePos();if(bp&&near(bp.x,bp.y,7)){R4.bottle=null;R4.bottleNext=clock+(DEMO?20000:rint(120000,240000));fx.push({k:'ripple',x:bp.x,y:bp.y+1,t0:clock,d:900},{k:'sparkle',x:bp.x,y:bp.y-4,t0:clock,d:900});
  ftext('📜 "Help! I\'m stuck in a pixel village!"',bp.x,bp.y-14,2600);setTimeout(()=>ftext('…oh wait, that\'s everyone. 😄',bp.x,bp.y-14,2600),2700);snd('cup');foundEgg('bottle',bp.x,bp.y-6);return true;}
 const tp=trophyPos();if(near(tp.x,tp.y-4,5)){const o=bots.find(q=>q.key===BOTW);const nm=botwName();
  ftext('🎤 Acceptance speech!',tp.x,tp.y-16,2200);fx.push({k:'confetti',x:tp.x,y:tp.y-6,t0:clock,d:1600},{k:'sparkle',x:tp.x,y:tp.y-8,t0:clock,d:900});
  if(o&&!o.inside){o.quip={s:'🏆 I\'d like to thank the duck…',until:clock+2800};o.react={k:'jump',t0:clock,d:1200};setTimeout(()=>{o.quip={s:'…and my mom, the toaster 🥹',until:clock+3000};},2900);}
  else setTimeout(()=>ftext('('+nm+' is inside, practicing a speech) 🎤',tp.x,tp.y-16,2600),2300);
  snd('hio');foundEgg('trophy',tp.x,tp.y-6);return true;}
 if(near(187,57,6)){if(clock-R4.scare>3000){R4.scare=clock;ftext('Finally, someone noticed me! 🌾',187,40,2600);fx.push({k:'note',x:190,y:48,t0:clock,d:1200},{k:'heart',x:184,y:48,t0:clock+300,d:1200});snd('boing');foundEgg('scarecrow',187,52);}return true;}
 return false;}
function handleTap(mx,my){const hs=MOBILE?1.8:1;
 const close=pickBot(mx,my,7);if(close){selectBot(close,true);return;}
 if(petTap(mx,my,hs))return;
 if(eggTap4(mx,my,hs))return;
 if(eggTap(mx,my,hs))return;
 if(craneTap(mx,my,hs))return;
 if(mx>=BOARD.x-2*hs&&mx<=BOARD.x+BOARD.w+2*hs&&my>=BOARD.y-3*hs&&my<=BOARD.y+BOARD.h+2*hs){openNews();return;}
 const ch=pickBot(mx,my,MOBILE?22:14);if(ch){selectBot(ch,true);return;}
 if(Math.hypot(mx-WM.x,my-(WM.y+4))<9*hs){WM.fast=clock+3000;fx.push({k:'sparkle',x:WM.x+6,y:WM.y-6,t0:clock,d:900});snd('boing');return;}
 for(const k in HOUSES){const h=HOUSES[k];if(mx>=h.x&&mx<=h.x+h.w&&my>=h.y-6&&my<=h.y+h.h){SIGNSHOW[k]=clock+4000;closeCard();return;}}
 if(tileAt(Math.floor(mx/T),Math.floor(my/T))===2)fx.push({k:'ripple',x:mx,y:my,t0:clock,d:1100},{k:'splash',x:mx,y:my,t0:clock,d:400});
 closeCard();}
// villager list + card show the Bot of the Week trophy
function renderList(){const el=document.getElementById('list'),fk=document.activeElement&&el.contains(document.activeElement)?document.activeElement.dataset.k:null;el.innerHTML=''; // rows are real buttons (keyboard + screen readers)
 bots.forEach(ch=>{const div=document.createElement('button');div.type='button';div.className='bot'+(selected===ch?' sel':'');div.dataset.k=ch.key;div.setAttribute('aria-pressed',String(selected===ch));
  div.innerHTML=`<span class="dot" style="background:${ch.look.shirt}"></span><span class="bi"><span class="nm">${esc(ch.name)}${ch.key===BOTW?' <span title="Bot of the Week">🏆</span>':''} <span class="rl">· ${esc(ch.role)}</span></span><span class="la ${ch.active?'':'old'}">${esc(STATE_LABEL[ch.state]||ch.state)} · last active ${esc(ch.bucket)}</span><span class="hn">🏠 ${esc(SIGNS[ch.key]||'')}</span></span>`;
  div.onclick=()=>{if(selected===ch)closeCard();else selectBot(ch,true);};el.appendChild(div);if(fk===ch.key)div.focus();});}
function fillCard(){const ch=cardFor;if(!ch)return;const txt=[ch.name,ch.role,actText(ch),STATE_LABEL[ch.state]||ch.state,ch.bucket].join('|');if(txt===cardTxt)return;cardTxt=txt;
 card.querySelector('.cn i').style.background=ch.look.shirt;card.querySelector('.cn b').textContent=ch.name;card.querySelector('.cr').textContent=ch.role;
 card.querySelector('.ca').textContent='🎯 '+actText(ch);card.querySelector('.cs').textContent=(STATE_LABEL[ch.state]||ch.state)+(ch.bucket?' · last active '+ch.bucket:'');
 card.querySelector('.ch').textContent='🏠 '+(SIGNS[ch.key]||'');
 let cw=card.querySelector('.cw');if(!cw){cw=document.createElement('div');cw.className='cw';card.appendChild(cw);}cw.textContent=ch.key===BOTW?'🏆 Bot of the Week, '+BOTW_WHY:'';cw.style.display=ch.key===BOTW?'':'none';}

// ---- clues: one new hint every 5 minutes (saved), easiest unfound eggs first ----
const CLUES={
 crow:['Someone in the garden isn\'t paying rent… and has feathers.','Give the bird sitting on the garden fence a little tap.'],
 duck:['The pond\'s most important resident would love some attention.','Tap the duck. Quack happens.'],
 scarecrow:['Someone in the garden has been standing still for ages, hoping to be noticed.','The scarecrow would love a tap. Just one.'],
 trophy:['This week\'s winner keeps something shiny by their front door.','Find the little gold cup next to a door and give it a tap.'],
 fountain:['The fountain puts on a show… but only after dark.','Come back at night (after 7 PM Eastern) and tap the fountain.'],
 frog:['A tiny royal lives on the pond. Royalty rewards patience.','Press and HOLD the lily pad on the right side of the pond.'],
 bottle:['Watch the pond. Every few minutes, something floats by with mail inside.','A bottle drifts across the pond now and then. Tap it before it\'s gone.'],
 fetch:['Someone with a wagging tail really, really wants to play.','Tap the dog three times, quickly.'],
 ufo:['The antenna on the top-left roof is listening for… something. Something persistent.','Tap the antenna on the top-left house five times, fast.'],
 shuffle:['The street lamps on the lower street like to light up in order.','Tap the lower-street lamps one by one, from left to right.'],
 catsplash:['The cat gets a liiittle too excited about the ducks. A distraction might be… splashy.','Tap the cat while it\'s chasing the ducks by the pond.'],
 build:['Peter\'s Build-ing has been "coming soon" forever. Maybe the crane needs some encouragement.','Tap the little crane on top of Peter\'s Build-ing five times, quickly.'],
 duet:['Turn the sound on. The two pets have been practicing a song together.','With sound on, tap the cat and then the dog, one right after the other.']};
const CLUE_MS=5*60*1000;let CL={t:0,last:null,given:{}};
try{if(DEMO&&QS.has('cluereset'))localStorage.removeItem('bhClue');const s=JSON.parse(localStorage.getItem('bhClue')||'null');if(s&&typeof s==='object')CL={t:+s.t||0,last:s.last||null,given:s.given||{}};}catch(e){}
let clueBtn,sndBtn,clueEl,newsEl;
const mmss=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
function clueLeft(){return Math.max(0,CL.t+CLUE_MS-Date.now());}
function pickClue(){const left=Object.keys(EGG_LVL).filter(k=>!EGGS.includes(k));if(!left.length)return null;
 left.sort((a,b2)=>(EGG_LVL[a]+2*Math.min(2,CL.given[a]||0))-(EGG_LVL[b2]+2*Math.min(2,CL.given[b2]||0))||EGG_LVL[a]-EGG_LVL[b2]);const k=left[0];return {k,l:Math.min(1,CL.given[k]||0)};}
function showClue(html){clueEl.querySelector('.cb').innerHTML=html;clueEl.classList.remove('hide');clueUI();}
function clueClick(){sndUnlock();
 if(EGGS.length>=EGG_TOTAL){if(clock-R4.party>15000){grandFinale();showClue('<b>🎉 You found all '+EGG_TOTAL+' eggs!</b><br>Enjoy an encore dance party. 💃🕺');}else showClue('<b>🎉 You found all '+EGG_TOTAL+' eggs!</b><br>The party is still going!');return;}
 const left=clueLeft();
 if(left>0){const L=CL.last&&!EGGS.includes(CL.last.k)?clueHtml(CL.last):'<b>Nice, you found that one!</b>';showClue(L+'<div class="cn2">⏳ Next clue ready in <span class="cd">'+mmss(left)+'</span>. Clues recharge every 5 minutes.</div>');return;}
 const c=pickClue();if(!c)return;CL.given[c.k]=(CL.given[c.k]||0)+1;CL.last=c;CL.t=Date.now();try{localStorage.setItem('bhClue',JSON.stringify(CL));}catch(e){}snd('coin');
 showClue(clueHtml(c)+'<div class="cn2">⏳ Next clue in <span class="cd">'+mmss(CLUE_MS)+'</span>.</div>');}
function clueHtml(c){return '<div class="cl">💡 Clue · '+LVL_NAME[EGG_LVL[c.k]]+' egg'+(c.l?' (bigger hint)':'')+'</div>'+esc(CLUES[c.k][c.l]);}
function clueUI(){if(!clueBtn)return;const left=clueLeft(),all=EGGS.length>=EGG_TOTAL;clueBtn.textContent=all?'🎉 Encore':left>0?'💡 '+mmss(left):'💡 Clue';clueBtn.classList.toggle('ready',!all&&left<=0);
 clueBtn.title=all?'All eggs found! Tap for an encore':left>0?'Next clue in '+mmss(left)+' (tap to see your last clue)':'Get a clue for an egg you haven\'t found';
 const cd=clueEl&&clueEl.querySelector('.cd');if(cd){cd.textContent=mmss(left);if(left<=0)cd.parentNode.textContent='✨ A new clue is ready. Tap 💡 Clue!';}}
// ---- sound toggle ----
function sndUnlock(){if(SND.on&&!SND.ctx)sndCtx();if(SND.ctx&&SND.ctx.state==='suspended')SND.ctx.resume();}
function setSound(on){SND.on=on;try{localStorage.setItem('bhSound',on?'1':'0');}catch(e){}if(on){sndCtx();sndUnlock();snd('coin');}
 if(sndBtn){sndBtn.textContent=on?'🔊':'🔇';sndBtn.setAttribute('aria-pressed',String(on));sndBtn.title=on?'Sound on (tap to mute)':'Sound off (tap to turn on)';sndBtn.setAttribute('aria-label',sndBtn.title);}rainAmb();}
// ---- news popup ----
function openNews(){const dl=new Date(Date.UTC(DT.y,DT.m-1,DT.d)).toLocaleDateString('en-US',{timeZone:'UTC',weekday:'long',month:'long',day:'numeric'});
 newsEl.querySelector('.nd').textContent='📌 Village News · '+dl;newsEl.querySelector('.nh').textContent=HEADLINE;newsEl.querySelector('.nw').textContent='🏆 Bot of the Week: '+botwName()+', '+BOTW_WHY+'!';
 newsEl.classList.remove('hide');closeCard();snd('coin');}
(function(){const st=document.getElementById('stage'),pn=document.getElementById('panel');
 const row=document.createElement('div');row.id='eggrow';eggEl.after(row);row.appendChild(eggEl);
 clueBtn=document.createElement('button');clueBtn.id='cluebtn';clueBtn.type='button';clueBtn.onclick=clueClick;row.appendChild(clueBtn);
 sndBtn=document.createElement('button');sndBtn.id='sndbtn';sndBtn.type='button';sndBtn.onclick=()=>setSound(!SND.on);row.appendChild(sndBtn);
 clueEl=document.createElement('div');clueEl.id='clue';clueEl.className='hide';clueEl.setAttribute('role','status');clueEl.innerHTML='<button class="cx" type="button" aria-label="Close">×</button><div class="cb"></div>';row.after(clueEl);
 clueEl.querySelector('.cx').onclick=()=>clueEl.classList.add('hide');
 newsEl=document.createElement('div');newsEl.id='news';newsEl.className='hide';newsEl.setAttribute('role','dialog');newsEl.setAttribute('aria-label','Village bulletin board');
 newsEl.innerHTML='<button class="cx" type="button" aria-label="Close">×</button><div class="nd"></div><div class="nh"></div><div class="nw"></div><div class="nf">Pinned to the board in the plaza. New headline every day!</div>';st.appendChild(newsEl);
 newsEl.querySelector('.cx').onclick=e=>{e.stopPropagation();newsEl.classList.add('hide');};
 document.addEventListener('pointerdown',e=>{sndUnlock();if(!newsEl.classList.contains('hide')&&!newsEl.contains(e.target))newsEl.classList.add('hide');},true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){newsEl.classList.add('hide');clueEl.classList.add('hide');}});
 setSound(SND.on);eggCount();clueUI();setInterval(()=>{clueUI();rainAmb();},1000);
 wxLoad();setInterval(wxLoad,30*60*1000);})();
// floating texts also avoid each other and the bubbles/labels (round 4 has more of them)
function drawTexts(fs,placed){ctx.font=`bold ${fs}px "Trebuchet MS",Verdana,sans-serif`;const R=(placed||[]).slice(),tw=ctx.measureText('Bot Hollow').width*1.1+24*K;R.push({x:W*S/2-tw/2,y:13*S-fs,w:tw,h:fs*2});
 for(let i=TEXTS.length-1;i>=0;i--){const e=TEXTS[i],p=(clock-e.t0)/e.d;if(p>=1){TEXTS.splice(i,1);continue;}}
 for(let i=0;i<TEXTS.length;i++){const e=TEXTS[i],p=(clock-e.t0)/e.d;if(p<0)continue;
  const w=ctx.measureText(e.s).width+14*K,h=fs+8*K;let x=Math.min(Math.max(e.x*S,w/2+2),cv.width-w/2-2),y=Math.max(h,(e.y-p*8)*S);
  for(let n=0;n<10;n++){const o=R.find(r=>x-w/2<r.x+r.w+3&&x+w/2>r.x-3&&y-h/2<r.y+r.h+3&&y+h/2>r.y-3);if(!o)break;y=o.y+o.h+h/2+4;}
  R.push({x:x-w/2,y:y-h/2,w,h});ctx.globalAlpha=p>.8?(1-p)*5:1;
  ctx.fillStyle='#ffe68a';ctx.strokeStyle='#3a2a1a';ctx.lineWidth=Math.max(2,S*.7);rr(x-w/2,y-h/2,w,h,h/2);ctx.fill();ctx.stroke();ctx.fillStyle='#3a2a1a';ctx.fillText(e.s,x,y+1);ctx.globalAlpha=1;}}

// ===================== Round 5 =====================
// Peter's Build-ing: forever under construction (scaffold, a tiny crane lifting blocks, a "Coming soon" board); egg 13 finishes it for 10 seconds
const BUILD={ph:0,pu:0,last:0,placed:0,fin:0,taps:[],wob:-1e9};
OBST.push({x:74,y:172,w:10,h:8}); // the block pile beside the tower
Object.assign(SPOTS,{build:[{x:68,y:180,dir:1}]});
Object.assign(ACT_LINES,{build:['🔨 Tap tap tap!','Measure twice…','🚧 Coming soon!','Just one more floor','Almost done! (not really)','Level? Level. 📐']});
function buildHouse(c,h){const {x,y,w,h:hh}=h,top=y+4,wall='#e4d2b0',mort='#c8b088';
 px(c,x+2,top,w-4,y+hh-top,wall);px(c,x+2,top,1,y+hh-top,P.out);px(c,x+w-3,top,1,y+hh-top,P.out);px(c,x+2,y+hh-1,w-4,1,P.out);
 for(let r=top+2,k=0;r<y+hh-1;r+=3,k++){px(c,x+3,r,w-6,1,mort);for(let i=x+3+(k%2?2:4);i<x+w-3;i+=5)px(c,i,r+1,1,2,mort);} // block courses
 [[x+6,h.winY],[x+w-12,h.winY]].forEach(([a,bq])=>{px(c,a-1,bq-1,8,7,P.out);px(c,a,bq,6,5,'#8fd0f0');px(c,a+3,bq,1,5,P.out);px(c,a,bq+2,6,1,P.out);px(c,a,bq,2,1,'#d8f4ff');});
 const bx=x+3,by=y+17;px(c,bx,by,w-6,10,P.out);px(c,bx+1,by+1,w-8,8,'#ffd34a');for(let i=bx+1;i<bx+w-7;i+=4){px(c,i,by+1,2,1,'#2a1d14');px(c,i+2,by+8,2,1,'#2a1d14');} // the "Coming soon" board (words drawn in drawPlaque)
 const dx=x+w/2-3,dy=y+hh-9;px(c,dx-1,dy-1,8,10,P.out);px(c,dx,dy,6,9,'#8a5228');px(c,dx,dy,6,1,'#a86a38');px(c,dx+4,dy+4,1,1,'#f0d060');px(c,dx-2,y+hh,10,2,P.stone);}
function block(c,x,y){px(c,x,y,5,4,P.out);px(c,x+1,y+1,3,2,'#d8c8a8');px(c,x+1,y+1,3,1,'#f0e4c8');}
const buildBusy=()=>bots.some(o=>o.key==='Peter'&&o.act&&o.act.type==='build'&&o.act.phase==='do');
const lerp=(a,b2,q)=>a+(b2-a)*Math.max(0,Math.min(1,q));
function drawBuildLive(c,t){const h=HOUSES.Peter;if(!h)return;const {x,y,w}=h,d=BUILD.last?Math.max(0,Math.min(100,clock-BUILD.last)):0;BUILD.last=clock;
 const pk=bots.find(o=>o.key==='Peter');
 if(BUILD.fin&&clock>=BUILD.fin){BUILD.fin=0;BUILD.placed=0;ftext('…just kidding. Back to work! 🚧',x+w/2,y-30,3000);if(pk&&!pk.inside)pk.quip={s:'Okay, one more tweak… 🔨',until:clock+3200};}
 if(BUILD.fin){drawBuildDone(c,t,h);return;}
 // crane cycle: pick a block off the pile, swing it over, set it on the wall (faster while Peter is on site)
 BUILD.ph+=d/(buildBusy()?6000:12000);if(BUILD.ph>=1){BUILD.ph-=1;if(BUILD.placed>=3){BUILD.placed=0;fx.push({k:'chips',x:x+13,y:y-2,t0:clock,d:500});}}
 const u=BUILD.ph;if(BUILD.pu<.65&&u>=.65){BUILD.placed++;snd('thud');}BUILD.pu=u;
 px(c,x+2,y+1,w-4,4,'#a88a64');for(let i=x+3;i<x+w-3;i+=4)px(c,i,y,1,5,'#c8925a');px(c,x+2,y,w-4,1,'#8a5a30'); // open frame on top
 const slot=BUILD.placed-(u>=.65?1:0);for(let i=0;i<BUILD.placed;i++)block(c,x+4+i*5,y-4);
 block(c,74,176);block(c,79,176);const carry=u>=.15&&u<.65;if(!(u>=.15&&u<.95))block(c,76,172); // the pile
 // scaffold + ladder
 px(c,x-1,y-2,1,h.h,'#8a8a92');px(c,x+w,y-2,1,h.h,'#8a8a92');for(const py of [y+4,y+27]){px(c,x-2,py,w+4,2,'#b07a44');px(c,x-2,py,w+4,1,'#c89058');}
 px(c,x+w+2,y+4,1,h.h-4,'#8a5a30');for(let i=y+6;i<y+h.h;i+=3)px(c,x+w+1,i,1,1,'#8a5a30');
 // tiny crane
 const jy=y-20,mx=x+23,wb=clock-BUILD.wob<450?Math.round(Math.sin((clock-BUILD.wob)/35)*1.2):0;
 for(let yy=jy+3;yy<y+4;yy++){px(c,mx,yy,1,1,'#e8b020');px(c,mx+2,yy,1,1,'#e8b020');if(yy%2)px(c,mx+1,yy,1,1,'#b88010');}
 px(c,mx+1,jy-4,1,4,'#e8b020');line(c,mx+1,jy-4,x-6+wb,jy,'#7a7a80');line(c,mx+1,jy-4,x+w+4,jy,'#7a7a80');
 px(c,x-7+wb,jy,w+12,1,'#e8b020');px(c,x-7+wb,jy+2,w+12,1,'#e8b020');for(let i=x-7;i<x+w+5;i+=2)px(c,i+wb,jy+1,1,1,'#b88010');
 px(c,x+w+1,jy+3,4,4,'#6a6a70');px(c,x+w+1,jy+3,4,1,'#8a8a92');px(c,mx-4,jy+3,4,4,'#f08a30');px(c,mx-3,jy+4,2,2,'#9ad0f0');
 const pX=78,sX=x+6+Math.max(0,slot)*5;let tx=pX,hy=167;
 if(u<.15)hy=lerp(167,171,u/.15);else if(u<.3)hy=lerp(171,167,(u-.15)/.15);else if(u<.5)tx=lerp(pX,sX,(u-.3)/.2);else if(u<.65){tx=sX;hy=lerp(167,179,(u-.5)/.15);}
 else if(u<.8){tx=sX;hy=lerp(179,167,(u-.65)/.15);}else tx=lerp(sX,pX,(u-.8)/.2);
 tx=Math.round(tx)+wb;hy=Math.round(hy);px(c,tx-1,jy+2,3,1,'#3a3a40');px(c,tx,jy+3,1,hy-jy-3,'#3a3a40');px(c,tx-1,hy,3,1,'#3a3a40');if(carry)block(c,tx-2,hy+1);}
function drawBuildDone(c,t,h){const {x,y,w}=h,top=y-14,wall='#e4d2b0';
 px(c,x+2,top,w-4,y+5-top,wall);px(c,x+2,top,1,y+5-top,P.out);px(c,x+w-3,top,1,y+5-top,P.out);for(let r=top+2;r<y+5;r+=3)px(c,x+3,r,w-6,1,'#c8b088');
 [[x+6,top+4],[x+w-12,top+4]].forEach(([a,bq])=>{px(c,a-1,bq-1,8,7,P.out);px(c,a,bq,6,5,'#ffe9a0');px(c,a+3,bq,1,5,P.out);px(c,a,bq+2,6,1,P.out);});
 const rc='#e07a2a';for(let r=0;r<12;r++){const ins=Math.round((12-r)*1.05),rx=x+ins,rw=w-2*ins;px(c,rx,top-12+r,rw,1,r%3===2?shade(rc,-30):rc);px(c,rx,top-12+r,1,1,P.out);px(c,rx+rw-1,top-12+r,1,1,P.out);}
 const fx0=x+w/2,wv=Math.floor(t/200)%2;px(c,fx0,top-20,1,8,'#5a5a64');px(c,fx0+1,top-20+wv,5,3,'#e84040');px(c,fx0+1,top-20+wv,5,1,'#ff7a7a');
 const ry=y+h.h-6;px(c,x+w/2-6,ry,12,1,'#e84040');px(c,x+w/2-1,ry-1,2,3,'#ff7a7a'); // ribbon across the door
 for(let i=0;i<3;i++)if(Math.floor(t/260+i)%3===0)px(c,x+3+((i*7+(t/180|0))%(w-6)),top-6+((i*5+(t/130|0))%12),1,1,'#fff6a0');}
function drawPlaque(placedL){const h=HOUSES.Peter;if(!h||(MOBILE&&!(SIGNSHOW.Peter>clock)))return;const done=clock<BUILD.fin,L1=done?'Grand opening!':'Coming soon',L2=done?'(for 10 seconds)':'(since round 1)';
 const pf=Math.round(Math.max(9,S/K*2.3)*K),f0=ctx.font;ctx.font=`bold ${pf}px "Trebuchet MS",Verdana,sans-serif`;const w=Math.max(ctx.measureText(L1).width,ctx.measureText(L2).width)+8*K,hh=pf*2+5*K;
 const x=Math.min(Math.max((h.x+h.w/2)*S,w/2+4*K),cv.width-w/2-4*K),y=(h.y+21.5)*S,L=Math.round(x-w/2),Tq=Math.round(y-hh/2);
 ctx.fillStyle='#2a1d14';ctx.fillRect(L-K*2,Tq-K*2,w+K*4,hh+K*4);ctx.fillStyle=done?'#fff0a0':'#ffd34a';ctx.fillRect(L,Tq,w,hh);
 ctx.fillStyle='#2a1d14';ctx.fillText(L1,x,y-pf*.5);ctx.fillText(L2,x,y+pf*.6);placedL.push({x,y,w:w+K*4,h:hh+K*4,sign:true});ctx.font=f0;}
function tickBuild(ch,a){ch.dir=1;ch.moving=false;const k=Math.floor((clock-a.t0)/700);
 if(k!==a.k){a.k=k;if(clock>a.rest){fx.push({k:'sparkle',x:Math.round(ch.x)+8,y:Math.round(ch.y)-8,t0:clock,d:250});snd('tap');}}
 if(clock>a.next){if(Math.random()<.3){a.rest=clock+2600;say(ch,['Hmm… 🤔','*checks the plans*','Where did I put the level?'][(Math.random()*3)|0],2600);}
  else say(ch,ACT_LINES.build[(Math.random()*ACT_LINES.build.length)|0],2600);a.next=clock+rint(6000,11000);}}
function drawHammer(c,ch,a,x,y,f){const p=clock<a.rest?.5:((clock-a.t0)%700)/700,u=p<.35?p/.35:p<.6?1:p<.72?1-(p-.6)/.12:0;
 const hx=x+f*4,hy=y-9,ex=Math.round(x+f*8+(f*1-f*8)*u),ey=Math.round(y-7+(-20+7)*u);line(c,hx,hy,ex,ey,'#7a4a24');px(c,ex-1,ey-1,3,2,'#6a6a70');px(c,ex-1,ey-1,3,1,'#9a9aa2');px(c,hx-1,hy,2,2,P.skin);}
function craneTap(mx,my,hs){const h=HOUSES.Peter;if(!h)return false;const p=2*hs,jy=h.y-20,mx0=h.x+23;
 const onJib=mx>=h.x-7-p&&mx<=h.x+h.w+5+p&&my>=jy-6-p&&my<=jy+7+p,onMast=Math.abs(mx-(mx0+1))<=2+p&&my>=jy&&my<=h.y+4;if(!onJib&&!onMast)return false;
 if(BUILD.fin){fx.push({k:'sparkle',x:mx,y:my,t0:clock,d:500});return true;}
 BUILD.taps=BUILD.taps.filter(q=>clock-q<3000);BUILD.taps.push(clock);BUILD.wob=clock;snd('clank');fx.push({k:'sparkle',x:Math.round(mx),y:jy-2,t0:clock,d:450});
 if(BUILD.taps.length>=5){BUILD.taps=[];BUILD.fin=clock+10000;snd('hio');ftext('🎉 Ta-da! The Build-ing is finished!',h.x+h.w/2,h.y-30,3500);
  const pk=bots.find(o=>o.key==='Peter');if(pk&&!pk.inside){pk.quip={s:'It\'s… finished?! 😮',until:clock+3500};pk.react={k:'jump',t0:clock,d:1200};}
  foundEgg('build',h.x+h.w/2,h.y-6);}
 return true;}

fit();
// draw the village right away; status.json only adds the villagers (and refreshes every 5 minutes)
(function(){const byKey={};for(const k in LOOKS)byKey[k]={look:LOOKS[k]};buildBG(byKey);buildPass();requestAnimationFrame(frame);poll();setInterval(poll,5*60*1000);})();
