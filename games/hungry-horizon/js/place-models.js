// Original low-poly props for the coast, farm and fairground, using the shared coloured-part builder.
export function placeModel(id, { part: p, box: b, cyl: c, cone: co, ico: i, wheels, THREE }) {
  const W = 0xffffff, wood = 0x925832, dark = 0x243347;
  const B = (w,h,d,col,x=0,y=h/2,z=0,tint=false) => p(b(w,h,d),col,{p:[x,y,z],tint});
  const C = (r,h,col,x=0,y=h/2,z=0,tint=false,n=10) => p(c(r,r,h,n),col,{p:[x,y,z],tint});
  const I = (r,col,x,y,z,s=[1,1,1],tint=false) => p(i(r),col,{p:[x,y,z],s,tint});
  const roof = (r,h,col,y) => p(co(r,h,4),col,{p:[0,y,0],r:[0,Math.PI/4,0]});
  const hut = (col,w,h,d,roofcol) => [B(w,h,d,col,0,h/2,0,true), roof(w*0.74,h*0.5,roofcol,h*1.25),
    B(w*.24,h*.7,.08,wood,0,h*.35,d/2+.03),B(w*.2,h*.23,.09,0x9ee5f4,-w*.3,h*.65,d/2+.04),B(w*.2,h*.23,.09,0x9ee5f4,w*.3,h*.65,d/2+.04)];
  switch(id) {
    case 'shell': return [p(co(.24,.12,6),W,{p:[0,.08,0],s:[1,1,1.2],tint:true}),B(.06,.05,.3,0xffe4bd,0,.13,0)];
    case 'crab': return [I(.24,0xff643e,0,.18,0,[1,.55,.8]), ...[-1,1].flatMap(s=>[
      B(.23,.05,.05,0xe64728,s*.26,.12,0), I(.1,0xff8d45,s*.32,.22,.18), B(.03,.18,.03,dark,s*.1,.3,.12), I(.045,W,s*.1,.4,.12)])];
    case 'buoy': return [C(.48,.35,0xffa527),C(.3,.5,W,0,.6),p(co(.3,.45,8),0xf45943,{p:[0,1.05,0]})];
    case 'parasol': return [C(.06,2.1,wood),p(co(1.5,.65,8),W,{p:[0,2.05,0],tint:true}),C(.2,.1,0xfff5d1,0,.05)];
    case 'dinghy': return [p(c(1.0,.7,.8,6),W,{p:[0,.5,0],s:[1,1,2.3],tint:true}),B(1.1,.12,3.2,0xf0d4a1,0,.94),
      C(.06,1.8,wood,0,1.1,-.3),p(co(.7,1.3,3),0xffeacc,{p:[0,1.5,-.3],s:[1,1,.12]})];
    case 'beachhut': return [...hut(W,5.5,3.9,5.5,0x177f9c),B(5.7,.35,5.7,0xffd261,0,.18)];
    case 'boathouse': return [...hut(W,10.8,6.5,10.8,0xe76443),B(7,4,.12,0x234f67,0,2,5.5),B(.2,4,.14,0xffe5bd,0,2,5.6)];
    case 'lighthouse': return [C(8.2,.7,0xecc989),C(5.8,7,0xffffff,0,4),C(5.4,6,0xf05248,0,10.5),C(5,6,W,0,16.5),
      C(4.6,6,0xf05248,0,22.5),C(5.4,.7,0xffcf61,0,26),C(3.7,4,0x256782,0,28),
      p(co(5.5,4,12),0xff7045,{p:[0,32,0]}),B(2,3,.15,wood,0,1.5,5.9)];
    case 'liner': return [p(c(5.4,3.8,4,6),0x225784,{p:[0,2,0],s:[1,1,2.1]}),B(9,1,21,W,0,4.3),
      B(7,4,15,0xfff7df,0,6.5,-1),B(7.1,1,13,0x326d88,0,7.2,-1),B(5,2,10,W,0,9.5,-2),
      ...[-4,1].map(z=>C(1.4,4,0xff6b47,0,12,z)),B(.2,6,.2,wood,0,7,9)];
    case 'carrot': return [p(co(.16,.4,6),0xff862f,{p:[0,.2,0],r:[Math.PI,0,0]}),
      p(co(.15,.35,4),0x58b840,{p:[0,.48,0]})];
    case 'cabbage': return [I(.43,W,0,.25,0,[1,.7,1],true),I(.25,0xb3ec58,0,.42,0,[1,.5,1])];
    case 'chicken': return [I(.24,0xfff3da,0,.3,0,[1,1,1.3]),I(.14,0xfff3da,0,.55,.2),
      p(co(.07,.14,4),0xffb32b,{p:[0,.54,.36],r:[Math.PI/2,0,0]}),B(.05,.13,.14,0xe54836,0,.7,.18),B(.2,.15,.04,0xf6b43b,0,.08,0)];
    case 'sheep': return [I(.6,0xfff5dd,0,.65,0,[.8,.75,1]),I(.24,0x574a58,0,.82,.56,[.8,1,1.1]),
      ...[-1,1].flatMap(x=>[-1,1].map(z=>B(.12,.4,.12,0x574a58,x*.28,.2,z*.35))),I(.12,0xffc2b1,-.22,.9,.55),I(.12,0xffc2b1,.22,.9,.55)];
    case 'hay': return [p(c(.85,.85,2.6,10),0xeebd3c,{p:[0,.9,0],r:[0,0,Math.PI/2]}),
      ...[-.8,.8].map(x=>p(c(.88,.88,.1,10),0x9c7434,{p:[x,.9,0],r:[0,0,Math.PI/2]}))];
    case 'tractor': return [B(2.4,1,3.4,W,0,1.1,0,true),B(1.8,1.5,1.5,0xa4e0e2,0,2.2,-.7),B(2.2,.15,1.9,0xffd25a,0,3,-.7),
      C(.12,1.2,dark,.65,2.3,1),...wheels([-1.1,1.1],[-1],.8,.8,.4),...wheels([-1.05,1.05],[1.15],.5,.5,.3)];
    case 'barn': return [...hut(W,6.8,5.5,6.8,0x254854),B(3.5,3.8,.14,0xfff4db,0,1.9,3.5),
      B(3.1,3.5,.16,0xc94336,0,1.8,3.6),p(b(.18,4.5,.18),0xfff4db,{p:[0,1.8,3.7],r:[0,0,.7]}),p(b(.18,4.5,.18),0xfff4db,{p:[0,1.8,3.7],r:[0,0,-.7]})];
    case 'windmill': return [p(c(2.8,4.8,12,8),0xffe4b3,{p:[0,6,0]}),p(co(3.8,3,8),0xdb6448,{p:[0,13.5,0]}),
      ...[0,1,2,3].map(n=>p(b(.8,8,.25),0xffffff,{p:[Math.sin(n*Math.PI/2)*3.2,10+Math.cos(n*Math.PI/2)*3.2,3],r:[0,0,-n*Math.PI/2-.3]})),I(.7,0xf7bd3d,0,10,3.3)];
    case 'granary': return [B(16,13,16,0xea6350,0,6.5,0),roof(11.7,6,0x325c6f,16),
      ...[-4,4].map(x=>C(3.2,21,0xe4c55c,x,10.5,-2)),...[-4,4].map(x=>p(co(3.6,4,10),0xf5edd0,{p:[x,23,-2]})),B(5,6,.15,0xfff3d2,0,3,8.05)];
    case 'popcorn': return [p(c(.2,.15,.4,6),W,{p:[0,.2,0],tint:true}),I(.22,0xffe5a3,0,.48,0,[1,.6,1])];
    case 'pinwheel': return [B(.04,1,.04,wood),...[0,1,2,3].map(n=>p(co(.22,.42,3),n%2?0xffdc59:0xff68ab,{p:[Math.sin(n*Math.PI/2)*.17,1+Math.cos(n*Math.PI/2)*.17,0],r:[0,0,-n*Math.PI/2]}))];
    case 'balloon': return [B(.018,1.6,.018,0xffefcc),I(.5,W,0,1.85,0,[.85,1.1,.85],true),C(.25,.1,0xdb7562,0,.05)];
    case 'teacup': return [C(1.3,.2,0xffd45f,0,.1,0,false,8),p(c(1.1,.7,1.2,8,true),W,{p:[0,.8,0],tint:true}),
      p(new THREE.TorusGeometry(.42,.1,4,8),0xffd45f,{p:[1.1,.8,0],r:[0,Math.PI/2,0]}),
      p(new THREE.RingGeometry(.85,1.1,8),W,{p:[0,1.4,0],r:[-Math.PI/2,0,0],tint:true}),
      p(new THREE.CircleGeometry(.85,8),0x754665,{p:[0,1.42,0],r:[-Math.PI/2,0,0]})];
    case 'cart': return [B(3,1.5,2.4,W,0,1.3,0,true),...wheels([-1.4,1.4],[-.8,.8],.4),
      ...[-1.3,1.3].map(x=>B(.09,2,.09,wood,x,2.1,0)),roof(2.4,1,0xffc74a,3.2),I(.45,0xffb5d0,0,2.4,0)];
    case 'tent': return [B(6.7,3.3,6.7,W,0,1.65,0,true),p(co(4.8,4,8),0xffcf4d,{p:[0,5.3,0]}),
      ...[-2,0,2].map(x=>B(.8,3.3,.07,0xfff3d5,x,1.65,3.4)),B(1.4,2.8,.09,0x673358,0,1.4,3.5),I(.3,0xff6d99,0,7.6,0)];
    case 'carousel': return [C(5.5,.7,0xeba93c),C(.4,7,0xffe8ae),p(co(6,3,10),0xff678e,{p:[0,8,0]}),
      ...Array.from({length:6},(_,n)=>{const a=n*Math.PI/3;return [B(.1,6,.1,0xffecb1,Math.cos(a)*3.8,3.5,Math.sin(a)*3.8),
        B(1.2,.7,1.8,n%2?0x77d5e9:0xffe05e,Math.cos(a)*3.8,2,Math.sin(a)*3.8)];}).flat()];
    case 'wheel': return [B(19,.8,10,0x9f72d7),...[-1,1].map(s=>p(b(.8,17,1),0xffd24d,{p:[s*4,8,0],r:[0,0,s*.45]})),
      p(new THREE.TorusGeometry(11,.5,5,24),0xff748d,{p:[0,18,0]}),
      ...Array.from({length:8},(_,n)=>{const a=n*Math.PI/4;return [...(n<4?[p(b(.22,22,.22),0xffe7b5,{p:[0,18,0],r:[0,0,a]})]:[]),
        B(2.8,2,2.4,n%2?0x58cce9:0xffb646,Math.sin(a)*11,18+Math.cos(a)*11,0)];}).flat(),C(1,1,0xffdd51,0,18,0)];
    default: throw new Error(`Unknown model ${id}`);
  }
}
