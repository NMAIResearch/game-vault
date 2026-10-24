// Ground art for the additional maps. A single surface avoids overlapping water and land depth planes.
import { riverX } from './places.js';
import { mulberry32 } from './logic.js';
import { paintWorld } from './world-ground.js';
export function paintPlace(g, S, map) {
  const k = S / 300, X = x => (x + 150) * k, rnd = mulberry32(map.seed ^ 73421);
  if (paintWorld(g, S, map, rnd)) return;
  const rect = (x,z,w,h,c) => { g.fillStyle=c; g.fillRect(X(x),X(z),w*k,h*k); };
  const ellipse = (x,z,rx,rz,c) => {g.fillStyle=c;g.beginPath();g.ellipse(X(x),X(z),rx*k,rz*k,0,0,Math.PI*2);g.fill();};
  const line = (points,c,w) => {g.strokeStyle=c;g.lineWidth=w*k;g.lineCap='round';g.beginPath();points.forEach(([x,z],n)=>n?g.lineTo(X(x),X(z)):g.moveTo(X(x),X(z)));g.stroke();};
  rect(-150,-150,300,300,'#35bad1');
  for(let n=0;n<450;n++){const x=rnd()*300-150,z=rnd()*300-150;line([[x,z],[x+1.7,z]],'rgba(220,255,255,.22)',.12);}
  g.save();
  if(map.id==='harbour') {
    g.beginPath();g.ellipse(X(0),X(0),135*k,133*k,0,0,Math.PI*2);g.clip();
    const coast=[];for(let z=-150;z<=150;z+=2)coast.push([28+.004*z*z,z]);
    g.beginPath();g.moveTo(X(-150),X(-150));for(const [x,z] of coast)g.lineTo(X(x),X(z));g.lineTo(X(-150),X(150));g.closePath();g.clip();
    rect(-150,-150,300,300,'#f6d780');
    ellipse(-78,0,46,102,'#91cf62');
    line(coast.map(([x,z])=>[x-9,z]),'#dba56b',5);
    line([[-105,-70],[-72,-35],[-70,30],[-105,70]],'#f8edc9',5);
    for(const z of [-75,-25,25,75])line([[-120,z],[25+.004*z*z,z]],'#fff0c6',3.2);
    for(let z=-125;z<126;z+=3)line([[20+.004*z*z,z],[24+.004*z*z,z]],'#b97d48',.18);
  } else if(map.id==='farm') {
    rect(-136,-136,272,272,'#e0cd80');rect(-134,-134,268,268,'#80c44d');
    g.beginPath();g.rect(X(-136),X(-136),272*k,272*k);g.clip();
    for(const x of [-125,-83,-41,28,70])for(const z of [-124,-82,-40,8,50,92]){
      const w=32,h=30;rect(x,z,w,h,(Math.round(x+z)%3)?'#9fd657':'#b5d85c');
      for(let d=2;d<h;d+=2.4)line([[x+1,z+d],[x+w-1,z+d]],'#759c38',.3);
    }
    const river=[];for(let z=-150;z<=150;z+=2)river.push([riverX(z),z]);
    line(river,'#e7d490',21);line(river,'#3dc3e2',16);line(river.map(([x,z])=>[x-2,z]),'#8ae2ed',.45);
    for(const z of [-72,0,72]) {line([[-134,z],[134,z]],'#e8d298',4);rect(riverX(z)-13,z-5,26,10,'#b8844d');
      for(let x=-12;x<=12;x+=2)line([[riverX(z)+x,z-5],[riverX(z)+x,z+5]],'#ecd5a5',.3);}
    for(const x of [-70,70])line([[x,-134],[x,134]],'#e8d298',3.2);
  } else {
    ellipse(0,0,131,141,'#f7d391');
    g.beginPath();g.ellipse(X(0),X(0),128*k,138*k,0,0,Math.PI*2);g.clip();
    rect(-150,-150,300,300,'#8cd568');
    for(const r of [40,70,104]) {g.strokeStyle=r===70?'#fbdc99':'#ffe6b8';g.lineWidth=(r===70?8:4)*k;g.beginPath();g.arc(X(0),X(0),r*k,0,Math.PI*2);g.stroke();}
    for(let a=0;a<8;a++){const t=a*Math.PI/4;line([[0,0],[Math.cos(t)*145,Math.sin(t)*145]],'#ffe8b9',5);}
    ellipse(0,0,17,17,'#ffb1bf');ellipse(0,0,13,13,'#fce29f');
    ellipse(0,-45,30,30,'#f9d69d');ellipse(0,-45,27,27,'#45c8df');
    for(let a=0;a<24;a++){const t=a*Math.PI/12;ellipse(Math.cos(t)*118,Math.sin(t)*127,.6,.6,a%2?'#ffd94f':'#f86fb2');}
  }
  // Fine ground grain stays still for a seed.
  for(let n=0;n<4000;n++){g.fillStyle=n%2?'rgba(255,255,255,.07)':'rgba(68,62,32,.05)';g.fillRect(rnd()*S,rnd()*S,2,2);}
  g.restore();
}
