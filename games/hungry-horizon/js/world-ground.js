import { WORLD_MAPS, MOON_CRATERS, ALIEN_POOLS, jungleRiverX } from './worlds.js';

export function paintWorld(g, S, map, rnd) {
  const def = WORLD_MAPS[map.id];
  if (!def) return false;
  const k=S/300, X=x=>(x+150)*k;
  const rect=(x,z,w,h,c)=>{g.fillStyle=c;g.fillRect(X(x),X(z),w*k,h*k);};
  const oval=(x,z,rx,rz,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(X(x),X(z),rx*k,rz*k,0,0,Math.PI*2);g.fill();};
  const line=(pts,c,w)=>{g.strokeStyle=c;g.lineWidth=w*k;g.lineCap='round';g.beginPath();pts.forEach(([x,z],n)=>n?g.lineTo(X(x),X(z)):g.moveTo(X(x),X(z)));g.stroke();};
  const ring=(x,z,r,c,w)=>{g.strokeStyle=c;g.lineWidth=w*k;g.beginPath();g.arc(X(x),X(z),r*k,0,Math.PI*2);g.stroke();};
  rect(-150,-150,300,300,def.water);
  g.save();g.beginPath();
  if(map.id==='jurassic') g.ellipse(X(0),X(0),137*k,135*k,0,0,Math.PI*2);
  else if(map.id==='alien') {
    for(let n=0;n<=180;n++){const a=n*Math.PI/90,r=129+7*Math.cos(a*3),x=X(Math.cos(a)*r),z=X(Math.sin(a)*r);n?g.lineTo(x,z):g.moveTo(x,z);}g.closePath();
  } else g.arc(X(0),X(0),(map.id==='moonbase'?137:138)*k,0,Math.PI*2);
  g.fillStyle=def.land;g.fill();g.clip();
  if(map.id==='moonbase') {
    for(let n=0;n<95;n++){const x=rnd()*270-135,z=rnd()*270-135,r=1+rnd()*4;oval(x,z,r,r*.8,'#929bb5');oval(x+.4,z+.5,r*.75,r*.6,'#aeb5c9');}
    for(const z of [-80,0,80]) {line([[-130,z],[130,z]],'#8490ac',5);line([[-130,z],[130,z]],'#c6cde0',.3);}
    for(const x of [-82,0,82]) line([[x,-130],[x,130]],'#8490ac',4);
    for(const [x,z] of def.landmarks) {oval(x,z,15,15,'#717e9a');ring(x,z,14,'#f1d888',.5);}
    for(const [x,z,r] of MOON_CRATERS) {oval(x,z,r+2,r+2,'#d0d3e1');oval(x,z,r,r,'#656e8b');oval(x+2,z+2,r-3,r-3,'#7d86a1');}
    for(let n=0;n<50;n++){const x=-18+Math.sin(n*.23)*4,z=35-n*.85;oval(x-.5,z,.16,.28,'#d9deeb');oval(x+.5,z-.4,.16,.28,'#d9deeb');}
  } else if(map.id==='jurassic') {
    for(let n=0;n<110;n++){const x=rnd()*280-140,z=rnd()*280-140;oval(x,z,2+rnd()*10,2+rnd()*9,n%2?'#6c973d':'#8eb453');}
    for(const [x,z] of def.landmarks) {oval(x,z,18,18,'#b6a479');ring(x,z,16,'#d2bd84',1);}
    const river=[];for(let z=-150;z<=150;z+=2)river.push([jungleRiverX(z),z]);
    line(river,'#d6c38b',18);line(river,def.water,12);line(river.map(([x,z])=>[x-2,z]),'#80d9bf',.7);
    for(const z of [-72,0,72]) {line([[-125,z],[125,z]],'#c3b67a',3);rect(jungleRiverX(z)-10,z-6,20,12,'#bba47b');
      for(let x=-8;x<=8;x+=3)line([[jungleRiverX(z)+x,z-6],[jungleRiverX(z)+x,z+6]],'#decaa0',.5);}
    for(let n=0;n<30;n++){const z=-100+n*6,x=70+Math.sin(n*.3)*12;oval(x-1,z,.5,1,'#678738');oval(x+1,z+2,.5,1,'#678738');}
  } else if(map.id==='alien') {
    for(let n=0;n<65;n++){const x=rnd()*280-140,z=rnd()*280-140;oval(x,z,3+rnd()*9,2+rnd()*9,n%2?'#ad87c5':'#8d68a7');}
    for(const r of [43,76,111])ring(0,0,r,'#ca9fd4',2);
    for(let n=0;n<6;n++){const a=n*Math.PI/3;line([[0,0],[Math.cos(a)*140,Math.sin(a)*140]],'#b6a1d3',2.2);}
    for(const [x,z,r] of ALIEN_POOLS) {oval(x,z,r+2,r+2,'#c0ead5');oval(x,z,r,r,'#58658c');ring(x,z,r-3,'#85e4c7',.6);}
    for(let n=0;n<320;n++){const x=rnd()*270-135,z=rnd()*270-135;oval(x,z,.15+rnd()*.3,.15+rnd()*.3,n%2?'#d6f9c7':'#f1c1ed');}
  } else {
    for(let n=0;n<65;n++){const z=-140+n*4.5,pts=[];for(let x=-150;x<=150;x+=5)pts.push([x,z+Math.sin(x/10+n)*1.5]);line(pts,'#c6d9af',.35);}
    for(const r of [45,76,112])ring(0,0,r,'#729e9a',5);
    for(let n=0;n<8;n++){const a=n*Math.PI/4;line([[Math.cos(a)*35,Math.sin(a)*35],[Math.cos(a)*138,Math.sin(a)*138]],'#bed4b5',4);}
    for(const [x,z] of def.landmarks) {rect(x-14,z-14,28,28,'#7aa7a0');ring(x,z,13,'#cce3be',.7);}
    for(let n=0;n<100;n++){const x=rnd()*270-135,z=rnd()*270-135;oval(x,z,1+rnd()*2,.5+rnd(),n%2?'#88b798':'#c7d0a2');}
    oval(0,-24,31,31,'#d7e1b7');oval(0,-24,28,28,def.water);ring(0,-24,23,'#4297a3',.8);
  }
  for(let n=0;n<4000;n++){g.fillStyle=n%2?'rgba(255,255,255,.07)':'rgba(34,41,58,.05)';g.fillRect(rnd()*S,rnd()*S,2,2);}
  g.restore();
  return true;
}
