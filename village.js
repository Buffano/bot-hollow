// Bot Hollow: an original top-down pixel village. All art is drawn in code.
const W=400,H=240,T=8,COLS=W/T,ROWS=H/T;
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
const low=document.createElement('canvas');low.width=W;low.height=H;const g=low.getContext('2d');
const bg=document.createElement('canvas');bg.width=W;bg.height=H;const b=bg.getContext('2d');
let S=3;
let MOBILE=false,K=1; // K = canvas backing px per CSS px (1 on desktop)
const MQ=window.matchMedia('(max-width: 800px), (max-height: 500px)');
function fit(){const st=document.getElementById('stage');MOBILE=MQ.matches;
 if(!MOBILE){cv.style.width='';cv.style.height='';K=1;S=Math.max(2,Math.floor(Math.min((st.clientWidth-16)/W,(st.clientHeight-16)/H)));cv.width=W*S;cv.height=H*S;return;}
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
const map=[];for(let y=0;y<ROWS;y++){map.push(new Array(COLS).fill(0));}
const HOUSES={ // px coords of top-left, size in px
 Friday:{x:24,y:36,w:52,h:40},Clima:{x:96,y:36,w:36,h:40},Coach:{x:240,y:36,w:44,h:38},
 Luke:{x:24,y:116,w:38,h:38},Mark:{x:84,y:114,w:42,h:36},Dos:{x:262,y:114,w:40,h:34},
 Gladdus:{x:24,y:186,w:46,h:36},ResI:{x:104,y:188,w:42,h:34}};
function door(h){return {x:h.x+h.w/2,y:h.y+h.h};}
function homeOf(h){const d=door(h);return d.y>200?{x:d.x,y:168}:{x:d.x,y:d.y+12};} // bottom-row houses use the lower street
function carve(x0,y0,x1,y1){for(let y=Math.min(y0,y1);y<=Math.max(y0,y1);y++)for(let x=Math.min(x0,x1);x<=Math.max(x0,x1);x++)if(map[y]&&map[y][x]!==undefined&&map[y][x]!==3&&map[y][x]!==2)map[y][x]=1;}
// forest border
for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){if(y<3||x<2||x>=COLS-2||(y>=ROWS-1))map[y][x]=3;}
for(let x=0;x<COLS;x++){if(rnd()<.5)map[3][x]=3;}
// pond (bottom right) + dock
const pond={cx:338,cy:204,rx:34,ry:18};
for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const dx=(x*T+4-pond.cx)/pond.rx,dy=(y*T+4-pond.cy)/pond.ry;if(dx*dx+dy*dy<1)map[y][x]=2;}
const DOCK={x:335,y:180,w:11,h:20};map[23][42]=1;map[24][42]=1;
// streets and plaza
carve(2,10,COLS-3,11);carve(2,20,COLS-3,21);
const plaza={x:200,y:128};carve(21,13,28,18);carve(24,12,25,12);carve(24,19,25,19);
for(const k in HOUSES){const d=door(HOUSES[k]);const tx=Math.floor(d.x/T),ty=Math.floor(d.y/T);
 if(ty<=10)carve(tx,ty,tx,10);else if(ty<=20)carve(tx,ty,tx,20);else carve(tx,21,tx,ty);}
carve(42,22,42,22); // street to dock
carve(41,12,42,13); // street to kitchen
carve(38,9,38,9);   // street to track
// props that block walking (garden, fountain, kitchen, woodpile, hammocks, stands)
const GARDEN={x:148,y:40,w:78,h:34};
const TRACK={cx:338,cy:58,rx:32,ry:16};
const FIRE={x:340,y:132};
const OBST=[GARDEN,{x:326,y:104,w:30,h:10},{x:166,y:196,w:42,h:16},{x:214,y:190,w:32,h:8},{x:236,y:210,w:32,h:8},
 {x:244,y:134,w:12,h:12},{x:132,y:134,w:16,h:12},{x:150,y:98,w:14,h:10}];
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
 px(b,336,184,8,16,P.w1);
 [[318,214],[360,196],[352,216]].forEach(([x,y])=>{px(b,x,y,5,3,'#3f9a3a');px(b,x+1,y-1,3,1,'#3f9a3a');px(b,x+2,y,1,1,P.w1);});px(b,361,195,2,1,'#f5a0c0');
 // flowers
 const fc=['#f5e050','#ff8fb0','#ffffff','#ff6a5a','#b98cf0'];
 for(let i=0;i<150;i++){const x=rnd()*W,y=rnd()*H;if(!walkable(x,y)||tileAt(Math.floor(x/T),Math.floor(y/T))!==0)continue;
  if(Math.abs(((x-TRACK.cx)/TRACK.rx)**2+((y-TRACK.cy)/TRACK.ry)**2-1)<.45)continue;const c=fc[(rnd()*fc.length)|0];
  px(b,x,y+1,1,2,P.g3);px(b,x-1,y,1,1,c);px(b,x+1,y,1,1,c);px(b,x,y-1,1,1,c);px(b,x,y+1,1,1,c);px(b,x,y,1,1,'#f8d040');}
 // reeds on the pond banks
 [[306,196],[310,214],[368,206],[372,198],[326,222]].forEach(([x,y])=>{px(b,x,y,1,6,'#3f7a30');px(b,x+2,y+1,1,5,'#4e9a40');px(b,x,y-2,1,2,'#7a4a24');px(b,x+2,y-1,1,2,'#7a4a24');});
}
function fencePost(x,y){px(b,x,y,2,6,'#a8703c');px(b,x,y,2,1,'#c89058');px(b,x,y+5,2,1,P.out);}
function tree(c,x,y,s=1){ // round canopy tree, original design
 px(c,x-6*s,y+9*s,12*s,3*s,'rgba(0,0,0,.18)');
 px(c,x-1*s,y+4*s,3*s,7*s,P.tr);px(c,x-1*s,y+4*s,1*s,7*s,'#8a5a34');
 const r=8*s;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const d=dx*dx+dy*dy*1.15;if(d<=r*r){let col=P.t2;if(d>r*r*.72)col=P.t4;else if(dx+dy<-r*.6)col=P.t3;else if(dx+dy>r*.5)col=P.t1;px(c,x+dx,y+dy-2*s,1,1,col);}}
 px(c,x-4*s,y-6*s,2,1,'#7fcc62');px(c,x-2*s,y-7*s,2,1,'#7fcc62');
}function drawForest(){const list=[];for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(map[y][x]===3&&rnd()<.55)list.push([x*T+4+rnd()*4-2,y*T+rnd()*4]);
 for(let x=0;x<W;x+=11)list.push([x+rnd()*4,-2+rnd()*6]);
 list.sort((a,b)=>a[1]-b[1]).forEach(([x,y])=>tree(b,x,y));
 // a few interior trees
 [[84,206],[238,104],[308,104],[374,132],[292,184]].forEach(([x,y])=>{if(walkable(x,y+8))tree(b,x,y);});
}
// houses: distinct roofs, all original
function house(c,name,h,look){const {x,y,w,h:hh}=h;const roofH=Math.floor(hh*.5),wallY=y+roofH,wallH=hh-roofH;
 px(c,x+2,y+hh-1,w,3,'rgba(0,0,0,.22)');
 // walls
 const wall={library:'#efe2c4',gym:'#f0d8b8',tower:'#e8e4dc',workshop:'#d8b48a',cafe:'#f4e0d0',shop:'#f2e6c8',manor:'#f6ead0',study:'#e9e2d6'}[look.house]||'#efe2c4';
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
 if(look.house==='study'){ // little stone study house: bell-cote, round window, arched door, book sign
  const cx=x+w/2;px(c,cx-4,y-12,8,13,'#d8d0c2');px(c,cx-4,y-12,1,13,P.out);px(c,cx+3,y-12,1,13,P.out); // bell-cote
  for(let r=0;r<5;r++){px(c,cx-5+r,y-13-r+1,10-2*r,1,r%2?rc:shade(rc,-30));}
  px(c,cx-1,y-18,2,2,'#e8c050'); // finial knob
  px(c,cx-2,y-9,4,5,'#3a2a20');px(c,cx-1,y-8,2,3,'#e8c050');px(c,cx-1,y-5,2,1,'#c89a30'); // bell
  px(c,cx-3,wallY+1,6,5,P.out);px(c,cx-2,wallY+2,4,3,'#f0c860');px(c,cx-1,wallY+1,2,1,P.out);px(c,cx-1,wallY+2,2,3,'#9ad0f0'); // round window
  const ddx=x+w/2-3,ddy=y+hh-9;px(c,ddx,ddy-1,6,1,P.out);px(c,ddx+1,ddy-2,4,1,P.out);px(c,ddx+1,ddy-1,4,1,'#8a5228'); // arched door top
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
   else {px(c,i-1,ry,3,2,'#3f9446');px(c,i,ry-1,1,1,'#e84040');px(c,i+1,ry+1,1,1,'#e84040');}}} // tomatoes
 for(let i=x;i<=x+w;i+=6)if(i<x+w/2-6||i>x+w/2+4){fencePost(i,y-2);} for(let i=x;i<=x+w;i+=6)fencePost(i,y+h-4);
 for(let j=y+4;j<y+h-4;j+=6){fencePost(x,j);fencePost(x+w-2,j);}
 px(c,x,y,w/2-6,1,'#8a5a30');px(c,x+w/2+6,y,w/2-6,1,'#8a5a30');px(c,x,y+h-2,w,1,'#8a5a30');
 // scarecrow
 const sx=x+w/2,sy=y+16;px(c,sx,sy,1,14,'#7a4a24');px(c,sx-6,sy+4,13,1,'#7a4a24');px(c,sx-3,sy+3,7,6,'#3a72c8');px(c,sx-2,sy-4,5,6,'#f0d9a2');
 px(c,sx-4,sy-5,9,2,'#c89a30');px(c,sx-2,sy-7,5,2,'#c89a30');px(c,sx-1,sy-2,1,1,P.out);px(c,sx+1,sy-2,1,1,P.out);px(c,sx-7,sy+4,1,2,'#f5e050');px(c,sx+7,sy+4,1,2,'#f5e050');
 px(c,sx+9,sy-6,3,2,P.out);px(c,sx+11,sy-7,1,1,P.out); // a cheeky crow
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
function drawWoodpile(c){ // chopping area: stump + axe, split-log stack, chips
 for(let r=0;r<4;r++)for(let i=0;i<6-r;i++){const x=168+i*6+r*3,y=204-r*4;px(c,x,y,6,4,'#8a5a30');px(c,x,y,6,1,P.out);px(c,x+1,y+1,4,2,'#e0b878');px(c,x+2,y+2,2,1,'#b08048');}
 px(c,196,200,10,6,'#8a5a30');px(c,196,199,10,3,'#e0b878');px(c,198,200,6,1,'#b08048');px(c,196,205,10,1,P.out);
 px(c,203,193,1,8,'#7a4a24');px(c,200,193,5,3,'#a8a8b0');px(c,200,193,5,1,'#e0e0e8');
 [[192,210],[208,206],[186,212],[210,212]].forEach(([x,y])=>px(c,x,y,2,1,'#e0b878'));}
function hammock(c,x,y,col){px(c,x,y-10,2,14,'#6b4526');px(c,x+30,y-10,2,14,'#6b4526');px(c,x,y-11,2,1,'#8a5a30');px(c,x+30,y-11,2,1,'#8a5a30');
 px(c,x-1,y+3,4,2,'rgba(0,0,0,.18)');px(c,x+29,y+3,4,2,'rgba(0,0,0,.18)');
 for(let i=0;i<24;i++){const s=Math.round(Math.sin(i/23*Math.PI)*5);px(c,x+16-12+i,y+s+1,1,2,'rgba(0,0,0,.12)');}
 for(let i=0;i<4;i++){px(c,x+2+i,y-9+i*2,1,2,'#d8c8a0');px(c,x+29-i,y-9+i*2,1,2,'#d8c8a0');}
 for(let i=0;i<24;i++){const s=Math.round(Math.sin(i/23*Math.PI)*5),X=x+4+i,Y=y-4+s;px(c,X,Y,1,1,col);px(c,X,Y+1,1,1,'#fff6dc');px(c,X,Y+2,1,1,col);px(c,X,Y+3,1,1,'rgba(0,0,0,.25)');}}
function drawDock(c){const {x,y,w,h}=DOCK;px(c,x+1,y+h,w,2,'rgba(0,0,0,.25)');for(let j=y;j<y+h;j+=3){px(c,x,j,w,3,'#b07a44');px(c,x,j+2,w,1,'#8a5a30');}
 px(c,x-1,y+h-3,2,5,'#6b4526');px(c,x+w-1,y+h-3,2,5,'#6b4526');px(c,x+w+1,y+h-8,3,4,'#c8a060');px(c,x+w+1,y+h-8,3,1,'#8a5a30');} // bait bucket
function drawStands(c){ // Dos's newsstand rack + Mark's cafe table + signpost + Clima's rain gauge
 px(c,244,134,12,12,'#7a4a24');px(c,245,135,10,3,'#f4eee0');px(c,245,139,10,3,'#e8e0c8');px(c,245,143,10,2,'#f4eee0');
 for(let i=0;i<3;i++){px(c,246,136+i*4,3,1,'#8a8a8a');px(c,250,136+i*4,4,1,['#c83a50','#3a72c8','#8a4cc8'][i]);}
 px(c,244,131,12,3,'#8a4cc8');px(c,244,131,12,1,P.out);
 px(c,132,141,16,2,'#c89058');px(c,139,143,2,4,'#6b4526');px(c,139,128,1,13,'#7a7a80');for(let i=0;i<5;i++)px(c,133+i,129-i+4,14-2*i,1,i%2?'#ffffff':'#c83a50');
 px(c,135,139,2,2,'#ffffff');px(c,143,139,2,2,'#f4eee0');px(c,129,142,3,4,'#8a5a30');px(c,148,142,3,4,'#8a5a30');
 px(c,156,100,2,9,'#7a4a24');px(c,150,98,14,5,'#c89058');px(c,150,98,14,1,P.out);px(c,152,100,9,1,'#7a4a24');px(c,163,99,2,3,'#c89058');
 px(c,136,62,1,12,'#6a6a70');px(c,135,73,3,1,'#6a6a70'); // windsock pole (sock animates)
}
function lamp(c,x,y){px(c,x,y,2,10,'#3a3030');px(c,x-1,y-3,4,4,'#3a3030');px(c,x,y-2,2,2,'#ffe080');}
const LAMPS=[[86,70],[236,70],[298,70],[76,150],[158,150],[236,150],[312,150]];
function buildBG(cfg){seed=1337;drawGround();drawTrack(b);drawGarden(b);drawKitchen(b);drawWoodpile(b);hammock(b,214,198,'#3f9a7a');hammock(b,236,218,'#c83a50');drawDock(b);drawStands(b);
 drawForest();drawFountain(b);for(const k in HOUSES){const look=(cfg[k]&&cfg[k].look)||{house:'shop',roof:'#a85a3a'};house(b,k,HOUSES[k],look);}
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
}// ---- state ----
const LOOKS={
 Friday:{hat:'#e8b830',shirt:'#d9a020',house:'manor',roof:'#c8962a'},
 Gladdus:{hat:'#5a3e8c',shirt:'#7a5aa8',house:'library',roof:'#6b4c9a',glasses:true},
 Coach:{hat:'#d04030',shirt:'#e05a3a',house:'gym',roof:'#b83a2a',band:true},
 Clima:{hat:'#7d8a99',shirt:'#9fb0c0',house:'tower',roof:'#5f7385',umbrella:true},
 ResI:{hat:'#f0c020',shirt:'#3a72c8',house:'workshop',roof:'#2f5fa8',hardhat:true},
 Dos:{hat:'#8a4cc8',shirt:'#a86ad8',house:'shop',roof:'#7a3cb0',scarf:true},
 Mark:{hat:'#c83a50',shirt:'#d85a6a',house:'cafe',roof:'#a83040',satchel:true},
 Luke:{hat:'#6b4a2a',shirt:'#3f9a7a',house:'study',roof:'#b8683a',book:true}};
let bots=[],selected=null,lastData=null;
const CHATTER={Friday:['Checking the schedule','Coffee for the team?','Morning huddle!'],Gladdus:['Shelving books','Indexing…','Shh, reading'],Coach:['Stretch first!','Hydrate!','Go for a walk?'],
 Clima:['Clouds rolling in','Checking radar','Wind check'],ResI:['Reading the news','Fresh headlines','Site walk'],Dos:["What's hot today?",'Scouting trends','Ooh, new idea'],Mark:['Ad trends…','Taking notes','Market stroll'],Luke:['Reading up','Making notes','Study time!']};
const STATE_LABEL={working:'● working now',filed:'📜 filed a report',idle:'idle',asleep:'asleep'};
async function poll(){try{const r=await fetch('status.json?t='+Date.now(),{cache:'no-store'});const d=await r.json();if(!Array.isArray(d))return;lastData=d;sync();}catch(e){}}
function sync(){lastData.forEach((d,i)=>{if(!d||!HOUSES[d.name])return;let ch=bots.find(c=>c.key===d.name);
  if(!ch){const h=HOUSES[d.name],hm=homeOf(h);ch={key:d.name,x:hm.x+(i%2?6:-6),y:hm.y-2,tx:0,ty:0,dir:1,moving:false,wait:(DEMO?300:Math.random()*2000),phase:i*1.7,home:hm,look:LOOKS[d.name],
   act:null,path:null,cool:DEMO?0:10000+Math.random()*50000};bots.push(ch);}
  ch.name=String(d.name);ch.role=String(d.role||'');ch.state=String(d.state||'idle');ch.bucket=String(d.last_active_bucket||'');ch.active=ch.state==='working';});
 const u=lastData[0]&&lastData[0].updated_at;document.getElementById('upd').textContent=u?('Status updated '+new Date(u).toLocaleString('en-US',{timeZone:'America/New_York',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+' ET'):'';
 renderList();}
function renderList(){const el=document.getElementById('list');el.innerHTML='';bots.forEach(ch=>{const div=document.createElement('div');div.className='bot'+(selected===ch?' sel':'');
  div.innerHTML=`<div class="dot" style="background:${ch.look.shirt}"></div><div><div class="nm">${esc(ch.name)} <span class="rl">· ${esc(ch.role)}</span></div><div class="la ${ch.active?'':'old'}">${esc(STATE_LABEL[ch.state]||ch.state)} · last active ${esc(ch.bucket)}</div></div>`;
  div.onclick=()=>{selected=selected===ch?null:ch;renderList();};el.appendChild(div);});}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function bubbleText(ch,t){if(ch.state==='working')return 'Working…';if(ch.state==='asleep')return 'Zzz…';
 const slot=Math.floor((t/1000+ch.phase*4)/7)%3;
 if(ch.act){if(ch.act.say&&clock<ch.act.sayUntil)return ch.act.say;if(ch.act.phase==='do'){if(ch.state==='filed'&&slot===2)return '📜 Filed a report';
   if(slot!==1){const a=ACT_LINES[ch.act.type];return a[Math.floor(t/9000+ch.phase)%a.length];}return null;}}
 if(ch.state==='filed'&&slot!==2)return '📜 Filed a report';
 if(slot===1){const a=CHATTER[ch.key]||['Hello!'];return a[Math.floor(t/21000+ch.phase)%a.length];}return null;}
// ---- daily life: idle activities (fishing, cooking, Coach's laps) ----
const QS=new URLSearchParams(location.search),DEMO=QS.has('demo')||QS.has('fast'); // ?demo/?fast: testing only, activities start right away
const ACT_LINES={fish:['🎣 Gone fishin\'','Here fishy fishy…','Bobber watch','Patience…','🎣 Any bites?'],cook:['🍲 Stew time!','Needs more salt…','Smells great!','Taste test… 😋','Secret recipe 🤫'],
 laps:['🏃 One more lap!','Keep the pace!','Lap time!','Feel the burn 💪']};
const SPOTS={fish:[{x:340,y:197,dir:1,bob:{x:357,y:207}},{x:300,y:205,dir:1,bob:{x:318,y:211}}],cook:[{x:324,y:137,dir:1},{x:356,y:137,dir:-1}]};
let lapsBy=null,clock=0;const fx=[],smoke=[];
function rint(a,b){return a+Math.random()*(b-a);}
function freeSpots(type){return SPOTS[type].filter(s=>!s.by);}
function trySpot(ch,type,spot){const path=findPath(ch,spot);if(!path)return false;if(spot.x!==undefined)spot.by=ch.key;
 ch.act={type,spot,phase:'go',until:0,next:0,say:null,sayUntil:0,item:null,itemUntil:0,dip:0};ch.path=path;ch.moving=true;return true;}
function tryActivity(ch){const opts=[];if(freeSpots('fish').length)opts.push('fish');if(freeSpots('cook').length)opts.push('cook');
 if(ch.key==='Coach'&&!lapsBy){opts.push('laps','laps');}
 while(opts.length){const i=(Math.random()*opts.length)|0,type=opts.splice(i,1)[0];
  if(type==='laps'){const a=Math.atan2((ch.y-TRACK.cy)/TRACK.ry,(ch.x-TRACK.cx)/TRACK.rx),p={x:TRACK.cx+Math.cos(a)*(TRACK.rx-1),y:TRACK.cy+Math.sin(a)*(TRACK.ry-1),a};
   if(walkable(p.x,p.y)&&trySpot(ch,'laps',p)){lapsBy=ch.key;return true;}continue;}
  const fr=freeSpots(type);const s=fr[(Math.random()*fr.length)|0];if(trySpot(ch,type,s))return true;}
 return false;}
function say(ch,s,ms){ch.act.say=s;ch.act.sayUntil=clock+(ms||3500);}
function endAct(ch){const a=ch.act;if(!a)return;if(a.spot)a.spot.by=null;if(a.type==='laps')lapsBy=null;ch.act=null;
 ch.cool=clock+(DEMO?20000:rint(60000,150000));ch.path=findPath(ch,ch.home);ch.moving=!!ch.path;ch.wait=1500;}
function startDoing(ch){const a=ch.act;a.phase='do';a.until=clock+rint(20000,60000);a.next=clock+rint(3000,7000);ch.moving=a.type==='laps';
 if(a.type!=='laps')ch.dir=a.spot.dir;a.ang=a.spot.a||0;a.lap=1;
 say(ch,a.type==='fish'?'🎣 Gone fishin\'':a.type==='cook'?'🍲 Stew time!':'🏃 Laps!',3000);}
function tickAct(ch,dt){const a=ch.act;
 if(clock>a.until){if(a.type==='fish'&&a.item)return;endAct(ch);return;}
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
 else if(a.type==='laps'){const sp=(DEMO?2:1)*26*dt/1000,L=Math.PI*(TRACK.rx+TRACK.ry);const pa=a.ang;a.ang+=sp/L*Math.PI*2;
  const nx=TRACK.cx+Math.cos(a.ang)*(TRACK.rx-1),ny=TRACK.cy+Math.sin(a.ang)*(TRACK.ry-1);if(Math.abs(nx-ch.x)>.05)ch.dir=nx<ch.x?-1:1;ch.x=nx;ch.y=ny;
  if(Math.floor(pa/(Math.PI*2))!==Math.floor(a.ang/(Math.PI*2))){a.lap++;say(ch,'🏃 Lap '+a.lap+'!',2500);}}}
// wandering + real state always wins (working = busy near the house, asleep = home, Zzz)
function followPath(ch,dt){const p=ch.path[0],dx=p.x-ch.x,dy=p.y-ch.y,d=Math.hypot(dx,dy),sp=(DEMO?2.5:1)*(ch.active?22:14)*dt/1000;
 if(d<=sp){ch.x=p.x;ch.y=p.y;ch.path.shift();}else{ch.x+=dx/d*sp;ch.y+=dy/d*sp;}if(Math.abs(dx)>.3)ch.dir=dx<0?-1:1;ch.moving=true;
 if(!ch.path.length){ch.path=null;ch.moving=false;if(ch.act&&ch.act.phase==='go')startDoing(ch);else ch.wait=1500+Math.random()*3000;}}
function update(dt){clock+=dt;for(const ch of bots){
 if((ch.state==='working'||ch.state==='asleep')&&ch.act)endAct(ch);
 if(ch.path){followPath(ch,dt);continue;}
 if(ch.act){tickAct(ch,dt);continue;}
 if(ch.state==='asleep'){ch.moving=false;if(Math.hypot(ch.x-ch.home.x,ch.y-ch.home.y)>14){ch.path=findPath(ch,ch.home);}continue;}
 if(ch.moving){const dx=ch.tx-ch.x,dy=ch.ty-ch.y,d=Math.hypot(dx,dy),sp=(ch.active?22:12)*dt/1000;
  if(d<1){ch.moving=false;ch.wait=1500+Math.random()*4000;continue;}const nx=ch.x+dx/d*sp,ny=ch.y+dy/d*sp;if(!walkable(nx,ny)){ch.moving=false;ch.wait=500;continue;}
  ch.x=nx;ch.y=ny;if(Math.abs(dx)>.3)ch.dir=dx<0?-1:1;}else{ch.wait-=dt;if(ch.wait<=0){
  if(!ch.active&&(ch.state==='idle'||ch.state==='filed')&&clock>ch.cool&&Math.random()<(DEMO?1:.05)&&tryActivity(ch))continue;
  for(let k=0;k<12;k++){const base=Math.random()<.2?{x:plaza.x,y:plaza.y+20}:ch.home;const tx=base.x+(Math.random()-.5)*60,ty=base.y+(Math.random()-.5)*30;
   if(walkable(tx,ty)&&clearLine(ch,{x:tx,y:ty})){ch.tx=tx;ch.ty=ty;ch.moving=true;break;}}if(!ch.moving)ch.wait=800;}}}}
// ---- animated overlays ----
function line(c,x0,y0,x1,y1,col){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))|0;for(let i=0;i<=n;i++)px(c,x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,1,1,col);}
function drawActProps(c,ch,t){const a=ch.act;if(!a||a.phase!=='do')return;const x=Math.round(ch.x),y=Math.round(ch.y),f=ch.dir;
 if(a.type==='fish'){const hx=x+f*5,hy=y-6,tx=x+f*12,ty=y-16,bob=a.spot.bob;
  const bend=a.dip?2:0;line(c,hx,hy,tx,ty+bend,'#7a4a24');px(c,hx-1,hy,2,2,'#5a3a20');
  const by=bob.y+(a.dip?2:(Math.floor(t/500)%2));
  for(let i=1;i<10;i++){const p=i/10,lx=tx+(bob.x-tx)*p,ly=ty+bend+(by-ty-bend)*p+Math.sin(p*Math.PI)*3;px(c,lx,ly,1,1,'rgba(255,255,255,.75)');}
  px(c,bob.x-1,by-1,3,2,'#e83a3a');px(c,bob.x-1,by+1,3,1,'#ffffff');
  if(a.dip){px(c,bob.x-3,by+2,1,1,P.w2);px(c,bob.x+3,by+2,1,1,P.w2);}
  if(a.item){const ix=x,iy=y-26;if(a.item==='fish'){px(c,ix-3,iy,6,3,'#f0903a');px(c,ix-3,iy+1,6,1,'#ffb060');px(c,ix+3,iy-1,2,5,'#e07020');px(c,ix-2,iy,1,1,P.out);}
   else{px(c,ix-2,iy-3,3,5,'#6b4526');px(c,ix-2,iy+2,6,2,'#6b4526');px(c,ix-2,iy+3,6,1,'#3a2416');px(c,ix-2,iy-3,3,1,'#8a5a34');px(c,ix-4,iy+3,1,2,P.w2);}
   px(c,ix,iy+4,1,(y-6)-(iy+4),'rgba(255,255,255,.6)');}}
 if(a.type==='cook'){const sx=x+f*5,s=Math.floor(t/300)%2;line(c,sx,y-6,sx+f*(3+s),y-12+s,'#c89058');}}
function drawFire(c,t){const cooking=SPOTS.cook.some(s=>s.by&&bots.find(b2=>b2.key===s.by&&b2.act&&b2.act.phase==='do'));
 const flare=fx.some(e=>e.k==='flare');const fx0=FIRE.x,fy0=FIRE.y-1;
 if(cooking){const hgt=flare?10:4;for(let i=-3;i<=3;i++){const h=Math.max(1,Math.round(hgt-Math.abs(i)*.9+Math.sin(t/90+i*2.1)*1.6));px(c,fx0+i,fy0-h,1,h,Math.abs(i)<2?'#ffd34a':'#ff7a2a');px(c,fx0+i,fy0-h,1,1,'#ff4a1a');}
  for(let i=0;i<3;i++){const p=((t/1400+i/3)%1);px(c,fx0-2+i*2+Math.sin(t/400+i)*1.5,FIRE.y-16-p*6,1,1,'rgba(255,255,255,'+(.8-p*.7).toFixed(2)+')');} // steam
  if(!smoke.lastT||clock-smoke.lastT>800){smoke.push({x:fx0+rint(-2,2),y:FIRE.y-16,t0:clock});smoke.lastT=clock;}}
 else if(Math.floor(t/700)%2)px(c,fx0-1,fy0,2,1,'#ff6a2a');}
function drawSmoke(c){for(let i=smoke.length-1;i>=0;i--){const s=smoke[i],p=(clock-s.t0)/3200;if(p>=1){smoke.splice(i,1);continue;}
 const r=Math.round(1+p*3),x=s.x+Math.sin(p*5+s.t0)*3+p*6,y=s.y-p*26;c.fillStyle=s.dark?`rgba(60,50,50,${(.7-p*.6).toFixed(2)})`:`rgba(220,220,225,${(.6-p*.55).toFixed(2)})`;c.fillRect(Math.round(x-r),Math.round(y-r),r*2,r*2);}}
function drawFx(c){for(let i=fx.length-1;i>=0;i--){const e=fx[i],p=(clock-e.t0)/e.d;if(p>=1){fx.splice(i,1);continue;}
 if(e.k==='jump'){const x=e.x+e.dir*(p*10-5),y=e.y-Math.sin(p*Math.PI)*9;px(c,x-2,y-1,4,2,'#f0903a');px(c,x-e.dir*3,y-2,1,3,'#e07020');px(c,x+e.dir*1,y-1,1,1,P.out);
  if(p<.15||p>.85){const sx=e.x+e.dir*(p<.5?-5:5);px(c,sx-2,e.y,1,1,'#ffffff');px(c,sx+2,e.y,1,1,'#ffffff');px(c,sx,e.y-2,1,1,'#ffffff');}}
 else if(e.k==='splash'){const r=Math.round(2+p*5);px(c,e.x-r,e.y,1,1,'#ffffff');px(c,e.x+r,e.y,1,1,'#ffffff');px(c,e.x,e.y-r+1,1,1,P.w2);px(c,e.x-r+1,e.y-2,1,1,P.w2);px(c,e.x+r-1,e.y-2,1,1,P.w2);}}}
function drawAmbient(c,t){ // fountain spray, duck, windsock, antenna blink
 const x=plaza.x,y=plaza.y-12;for(let i=0;i<6;i++){const p=((t/900)+i/6)%1,d=i%2?1:-1,ax=x+d*(1+p*7),ay=y-2-Math.sin(p*Math.PI)*5+p*8;px(c,ax,ay,1,1,i%3?P.w2:'#ffffff');}
 px(c,x-1,y-4+Math.floor(t/250)%2,2,2,'#d8f0ff');
 const da=t/14000,dx=pond.cx+Math.cos(da)*14+4,dy=pond.cy+Math.sin(da)*5+2,dd=-Math.sin(da)>=0?1:-1;
 px(c,dx-3,dy-2,6,3,'#ffffff');px(c,dx+dd*2,dy-4,3,3,'#ffffff');px(c,dx+dd*4,dy-3,2,1,'#f0a020');px(c,dx+dd*3,dy-4,1,1,P.out);px(c,dx-3,dy+1,6,1,P.w3);
 const w=Math.floor(t/220)%3;for(let i=0;i<6;i++)px(c,137+i,62+Math.round(Math.sin(t/200+i*.9)*(i/3))+(i>3?w>>1:0),1,2,i%2?'#ffffff':'#ff7a2a');
 const f=HOUSES.Friday;if(Math.floor(t/600)%2)px(c,f.x+8,f.y-8,1,1,'#ff4040');else px(c,f.x+8,f.y-8,1,1,'#7a2020');}
// sky / tint by ET hour
function etHour(){const q=new URLSearchParams(location.search).get('hour');if(q!==null)return +q;return +new Date().toLocaleString('en-US',{timeZone:'America/New_York',hour:'numeric',hour12:false})%24;}
function tint(h){if(h>=7&&h<17)return null;if(h>=17&&h<19)return 'rgba(255,140,60,.16)';if(h>=5&&h<7)return 'rgba(255,170,120,.14)';return 'rgba(30,40,110,.38)';}
let last=0;
function frame(t){requestAnimationFrame(frame); // schedule first so the loop never stops, even if a frame throws or status.json hasn't loaded
 const dt=Math.max(0,Math.min(100,t-last));last=t;update(dt);
 g.drawImage(bg,0,0);
 // water shimmer
 for(let i=0;i<6;i++){const a=(t/900+i*1.3);px(g,pond.cx-20+((i*13+Math.floor(a*3))%40),pond.cy-6+(i*5)%12,3,1,P.w2);}
 drawAmbient(g,t);drawFire(g,t);drawFx(g);
 // characters sorted by y
 [...bots].sort((a,c)=>a.y-c.y).forEach(ch=>{drawChar(g,ch,t);drawActProps(g,ch,t);});
 drawSmoke(g);
 const h=etHour(),tn=tint(h);if(tn){g.fillStyle=tn;g.fillRect(0,0,W,H);
  if(h>=18||h<6){g.globalCompositeOperation='lighter';LAMPS.forEach(([x,y])=>glow(g,x+1,y-1,14,'rgba(255,200,90,.35)'));
   for(const k in HOUSES){const hh=HOUSES[k],wy=hh.y+Math.floor(hh.h*.5)+3;if(hh.h*.5>=12){glow(g,hh.x+9,wy+2,6,'rgba(255,210,110,.5)');glow(g,hh.x+hh.w-9,wy+2,6,'rgba(255,210,110,.5)');}}
   glow(g,plaza.x,plaza.y-2,22,'rgba(110,190,255,.45)');glow(g,plaza.x,plaza.y-12,8,'rgba(200,240,255,.5)'); // fountain lights
   glow(g,FIRE.x,FIRE.y-3,SPOTS.cook.some(s=>s.by)?22:8,'rgba(255,140,50,.45)');
   g.globalCompositeOperation='source-over';for(let i=0;i<8;i++){const fx2=(i*53+Math.sin(t/1500+i)*12)%W,fy=60+(i*37)%150+Math.cos(t/1200+i)*6;px(g,fx2,fy,1,1,'#f8ff90');}}}
 ctx.imageSmoothingEnabled=false;ctx.drawImage(low,0,0,W*S,H*S);
 // labels and bubbles at screen res
 ctx.textAlign='center';ctx.textBaseline='middle';const fs=MOBILE?Math.round(Math.max(11,S*3.6/K)*K):Math.max(10,Math.round(S*3.6));ctx.font=`bold ${fs}px "Trebuchet MS",Verdana,sans-serif`;
 const placedL=[];[...bots].sort((a,c)=>(c===selected)-(a===selected)||a.y-c.y).forEach(ch=>label(ch.name,ch.x*S,ch.y*S+fs*0.9,ch===selected,null,placedL));
 const placed=[];[...bots].sort((a,c)=>(c===selected)-(a===selected)||c.y-a.y).forEach(ch=>{const sx=ch.x*S,sy=ch.y*S;
  const bt=bubbleText(ch,t),evt=ch.act&&ch.act.say&&clock<ch.act.sayUntil;
  if(bt&&(!MOBILE||ch===selected||ch.active||evt||bots.indexOf(ch)===Math.floor(t/6000)%Math.max(1,bots.length)))bubble(bt.length>30?bt.slice(0,29)+'…':bt,sx,sy-(ch.look.umbrella?28:(ch.act&&ch.act.item?31:21))*S,fs,ch.active,placed);});
 // title
 ctx.font=`bold ${Math.round(fs*1.1)}px "Trebuchet MS",Verdana,sans-serif`;label('Bot Hollow',W*S/2,13*S,false,'#ffe68a');}
function glow(c,x,y,r,col){const gr=c.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=gr;c.fillRect(x-r,y-r,r*2,r*2);}
function label(s,x,y,sel,col,placed){const w=ctx.measureText(s).width+12,h=parseInt(ctx.font.match(/(\d+)px/)[1])+6;x=Math.min(Math.max(x,w/2+2),cv.width-w/2-2);y=Math.min(y,cv.height-h/2-2);
 if(placed){for(let n=0;n<6;n++){const o=placed.find(r=>Math.abs(r.x-x)<(r.w+w)/2+2&&Math.abs(r.y-y)<(r.h+h)/2+1);if(!o)break;y=o.y+(o.h+h)/2+2;if(y>cv.height-h/2-2)y=o.y-(o.h+h)/2-2;}placed.push({x,y,w,h});}ctx.fillStyle=sel?'rgba(120,70,10,.9)':'rgba(30,20,10,.72)';rr(x-w/2,y-h/2,w,h,h/2);ctx.fill();ctx.fillStyle=col||(sel?'#ffe68a':'#fff6dc');ctx.fillText(s,x,y+1);}
function bubble(s,x,y,fs,act,placed){ctx.font=`${Math.round(fs*0.9)}px "Trebuchet MS",Verdana,sans-serif`;const w=ctx.measureText(s).width+16*K,h=fs*1.6;const tx=x,ty=y;x=Math.min(Math.max(x,w/2+2),cv.width-w/2-2);y=Math.max(y,h+3);
 // nudge up (or, at the top edge, down) so bubbles never cover each other
 if(placed){for(let n=0;n<8;n++){const o=placed.find(r=>x-w/2<r.x+r.w+3&&x+w/2>r.x-3&&y-h<r.y+r.h+3&&y>r.y-3);if(!o)break;y=o.y-4;if(y-h<2)y=o.y+o.h+h+4;}placed.push({x:x-w/2,y:y-h,w,h});}
 const c2=8*K+Math.max(0,ty-y);
 ctx.fillStyle=act?'#fff6c0':'#fffdf4';ctx.strokeStyle='#3a2a1a';ctx.lineWidth=Math.max(2,S*.7);rr(x-w/2,y-h,w,h,6);ctx.fill();ctx.stroke();
 {const a=5*K,c=Math.min(c2,8*K+h*3),q=Math.min(Math.max(tx,x-w/2+a+4),x+w/2-a-4);ctx.beginPath();ctx.moveTo(q-a,y-1);ctx.lineTo(q,y+c);ctx.lineTo(q+a,y-1);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(q-a,y);ctx.lineTo(q,y+c);ctx.lineTo(q+a,y);ctx.stroke();}
 ctx.fillStyle='#3a2a1a';ctx.fillText(s,x,y-h/2+1);ctx.font=`bold ${fs}px "Trebuchet MS",Verdana,sans-serif`;}
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
cv.addEventListener('click',e=>{const r=cv.getBoundingClientRect(),mx=(e.clientX-r.left)/S*(cv.width/r.width),my=(e.clientY-r.top)/S*(cv.height/r.height);
 let best=null,bd=MOBILE?22:14;for(const ch of bots){const d=Math.hypot(ch.x-mx,ch.y-8-my);if(d<bd){bd=d;best=ch;}}selected=best;renderList();});
(function(){const p=document.getElementById('panel'),l=document.getElementById('list');if(!p||!l)return;const b=document.createElement('button');b.id='tgl';b.type='button';
 const set=c=>{p.classList.toggle('collapsed',c);b.textContent=c?'Show villagers ▾':'Hide villagers ▴';b.setAttribute('aria-expanded',String(!c));};set(false);b.onclick=()=>set(!p.classList.contains('collapsed'));l.parentNode.insertBefore(b,l);})();
fit();
// draw the village right away; status.json only adds the villagers (and refreshes every 5 minutes)
(function(){const byKey={};for(const k in LOOKS)byKey[k]={look:LOOKS[k]};buildBG(byKey);buildPass();requestAnimationFrame(frame);poll();setInterval(poll,5*60*1000);})();
