// Coloured primitive models for the moon, dinosaur valley, alien planet and seabed.
export function worldModel(id, { part: p, box: b, cyl: c, cone: co, ico: i, wheels, THREE }) {
  const white = 0xffffff, ink = 0x25374f, gold = 0xffc65c, mint = 0x72efd5;
  const B = (w,h,d,col,x=0,y=h/2,z=0,tint=false) => p(b(w,h,d),col,{p:[x,y,z],tint});
  const C = (r,h,col,x=0,y=h/2,z=0) => p(c(r,r,h,10),col,{p:[x,y,z]});
  const I = (r,col,x=0,y=r,z=0,s=[1,1,1],tint=false) => p(i(r),col,{p:[x,y,z],s,tint});
  const K = (r,h,col,x=0,y=h/2,z=0) => p(co(r,h,6),col,{p:[x,y,z]});
  const ring = (r,t,col,x,y,z,rot=[Math.PI/2,0,0]) => p(new THREE.TorusGeometry(r,t,4,16),col,{p:[x,y,z],r:rot});
  const eyes = (size,x,y,z) => [-1,1].flatMap(sign => [I(size,white,x+sign*size*1.8,y,z),I(size*.5,ink,x+sign*size*1.8,y,z+size*.85)]);
  const crystal = (r,h,col,x=0,z=0) => [p(c(r,r,h*.65,5),col,{p:[x,h*.325,z]}),K(r,h*.35,0xdbfff8,x,h*.825,z)];
  function dinosaur(s, kind) {
    const col = kind === 'triceratops' ? 0x79b9ad : kind === 'stegosaurus' ? 0x98bb58 : 0x65b9ae;
    const neck = kind === 'longneck';
    const a = [I(s*.6,col,0,s*.58,0,[.8,.75,1]),
      ...[-1,1].flatMap(x=>[-1,1].map(z=>C(s*.12,s*.53,col,x*s*.27,s*.265,z*s*.35))),
      p(co(s*.19,s*.7,5),col,{p:[0,s*.47,-s*.64],r:[-Math.PI/2-.2,0,0]})];
    if (neck) a.push(C(s*.17,s*1.1,col,0,s*1.05,s*.35),I(s*.24,col,0,s*1.68,s*.48,[1,.8,1.4]),...eyes(s*.045,0,s*1.73,s*.76));
    else a.push(I(s*.28,col,0,s*.85,s*.56,[1,.9,1.25]),...eyes(s*.055,0,s*.96,s*.81));
    if (kind === 'stegosaurus') for (let n=0;n<5;n++) a.push(K(s*.16,s*.45,0xffbf6a,0,s*1.04,(n-2)*s*.22));
    if (kind === 'triceratops') a.push(I(s*.36,0x529b94,0,s*.94,s*.34,[1.3,1,.23]),
      ...[-1,1].map(x=>p(co(s*.055,s*.34,5),0xffedbf,{p:[x*s*.14,s*1.05,s*.74],r:[Math.PI/3,0,0]})),K(s*.05,s*.22,0xffedbf,0,s*.95,s*.88));
    return a;
  }
  switch (id) {
    case 'moonrock': return [I(.24,white,0,.15,0,[1,.65,1],true),I(.08,0x656d88,.08,.27,.04)];
    case 'sample': return [C(.32,.6,0x8ce1f0),C(.38,.1,ink,0,.66),I(.18,gold,0,.25,0),B(.22,.16,.02,white,0,.38,.32)];
    case 'battery': return [C(.43,1,0xe3e8f7),C(.45,.18,0x657691,0,.14),C(.18,.15,gold,0,1.08),B(.45,.56,.02,mint,0,.57,.43)];
    case 'astronaut': return [B(.55,.72,.4,white,0,.91),I(.38,white,0,1.56),I(.29,0xf1be58,0,1.57,.2,[1,.7,.6]),
      ...[-1,1].flatMap(s=>[B(.2,.48,.25,0xd6e0ee,s*.17,.28),B(.2,.5,.22,white,s*.39,1.02)]),B(.55,.6,.27,0x7293b4,0,1,-.3),B(.18,.12,.05,0xff7e66,0,1.08,.24)];
    case 'solar': return [C(.12,1.2,0xb7c9e4),B(1.3,.13,1.3,0xcbd6e6,0,.07),
      p(b(2.7,.12,1.6),0x304d91,{p:[0,1.45,0],r:[.28,0,0]}),
      ...[-1,-.5,0,.5,1].map(x=>p(b(.035,.14,1.6),0x83d4ed,{p:[x,1.45,0],r:[.28,0,0]}))];
    case 'rover': return [B(2.6,.8,3.2,white,0,1.1),...wheels([-1.35,1.35],[-1.1,1.1],.52,.52,.35),
      B(1.7,1.1,1.6,0x68bacd,0,1.95,-.4),B(1.9,.16,1.8,white,0,2.55,-.4),C(.06,1.4,gold,.9,2.05,.8),I(.17,mint,.9,2.8,.8),B(1.8,.12,.2,gold,0,1.3,1.65)];
    case 'habitat': return [C(4.8,.5,0x657591),I(4.6,0xe2e8f7,0,1.8,0,[1,.85,1]),C(3.7,.7,0x709abf,0,2.5),
      B(2.6,3.1,1.8,0xe1e9ee,0,1.65,3.6),B(1.5,2.3,.1,0x304765,0,1.3,4.55),B(.8,.3,.13,mint,0,2.9,4.6),C(.14,1.8,gold,0,5.1,0)];
    case 'dish': return [C(4.5,.6,0x6d839c),p(c(1.5,3.3,7,8),white,{p:[0,4,0]}),
      p(new THREE.SphereGeometry(6,12,6,0,Math.PI*2,0,Math.PI/2),0xc5d4e7,{p:[0,12,0],r:[Math.PI+.45,0,0],s:[1,.5,1]}),
      C(.12,6,gold,0,11,0),I(.6,mint,0,14,0)];
    case 'rocket': return [C(9,.5,0x69728d),C(4.3,18,white,0,13),K(4.3,9,0xffa15f,0,26.5),C(4.4,2,0xd9e4f2,0,9),
      ...[-1,1].map(s=>p(co(3,9,3),0x8fadd4,{p:[s*5.4,5,0],r:[0,Math.PI/2,0]})),
      I(1.6,0x5bbdd9,0,18,4,[1,1,.3]),C(3,3,ink,0,2),B(1.6,4,.15,0xffa15f,0,12,4.35)];
    case 'spore': return [I(.22,0xffc24b,0,.18,0,[1,.8,1]),K(.13,.23,0xa8d64a,0,.33)];
    case 'fossil': return [I(.45,0xcbb88e,0,.11,0,[1,.3,.8]),B(.52,.08,.1,0xffedc0,0,.25),...[-.2,0,.2].map(x=>B(.06,.07,.32,0xffedc0,x,.25))];
    case 'egg': return [I(.51,0xffe4b0,0,.63,0,[.85,1.25,.85]),...[-1,1].map(x=>I(.1,0xbfa582,x*.28,.84,.24,[1,.8,.3]))];
    case 'hatchling': return dinosaur(.76,'hatchling');
    case 'triceratops': return dinosaur(2.7,'triceratops');
    case 'stegosaurus': return dinosaur(5.3,'stegosaurus');
    case 'longneck': return dinosaur(8.6,'longneck');
    case 'fern': return [C(.12,2.3,0x6a7640),...Array.from({length:7},(_,n)=>{
      const a=n*Math.PI*2/7;return p(i(1),n%2?0x62a64a:0x95ca57,{p:[Math.cos(a)*.7,1.8,Math.sin(a)*.7],s:[.35,.18,1.2],r:[-.3,a-Math.PI/2,0]});})];
    case 'volcano': return [p(c(3.6,12,19,9),0x796963,{p:[0,9.5,0]}),p(c(3.2,6,5,9),0xbba087,{p:[0,18,0]}),
      C(3.1,.25,0xffca72,0,20.55),I(2,0xeee3c4,0,23,0,[1,.6,1])];
    case 'stardust': return [p(new THREE.OctahedronGeometry(.25),mint,{p:[0,.25,0]}),I(.09,0xffd3fb,0,.48,0)];
    case 'pod': return [I(.4,white,0,.44,0,[.8,1.1,.8],true),ring(.32,.05,mint,0,.4,0),I(.12,gold,0,.9,0)];
    case 'crystal': return [...crystal(.33,1.8,mint),...crystal(.2,1,0xcba3ff,.35,.12)];
    case 'blob': return [I(.65,white,0,.58,0,[.9,.8,.9],true),...eyes(.13,0,.85,.46),I(.15,mint,0,1.23,0),C(.04,.3,ink,0,1.07)];
    case 'mushroom': return [C(.27,2.6,0xceacf5),I(1.55,white,0,2.5,0,[1,.45,1],true),
      ...[-1,1].map(x=>I(.24,mint,x*.7,2.96,.3,[1,.3,1]))];
    case 'saucer': return [I(2.5,0xb7a9e0,0,1.2,0,[1,.23,1]),I(1.2,mint,0,1.8,0,[1,.85,1]),
      ring(2.1,.14,gold,0,1.2,0),...Array.from({length:3},(_,n)=>{const a=n*Math.PI*2/3;return C(.1,.8,ink,Math.cos(a)*1.5,.4,Math.sin(a)*1.5);})];
    case 'nest': return [C(4.5,.5,0x60538f),I(4.4,0xd5a1dc,0,3.3,0,[1,.8,1]),
      ...Array.from({length:5},(_,n)=>{const a=n*Math.PI*2/5;return I(.9,mint,Math.cos(a)*3.5,3.1,Math.sin(a)*3.5);}),I(1,0xffde97,0,7.1,0)];
    case 'spire': return [...crystal(3,21,0xb6a4fb),...crystal(2.6,13,mint,3.2,1),...crystal(2,10,0xffc4ea,-3.1,1),C(6,.5,0x746196)];
    case 'bloom': return [C(1.5,18,0x67b59e),...Array.from({length:7},(_,n)=>{const a=n*Math.PI*2/7;return I(5.8,n%2?0xe7a4ed:0xaeb5ff,Math.cos(a)*5.8,20,Math.sin(a)*5.8,[1,.45,1]);}),
      I(3.3,gold,0,22,0),I(2.2,mint,0,25,0),...[-1,1].map(x=>I(4.5,0x6ecba3,x*4,9,0,[1,.2,.5]))];
    case 'pearl': return [I(.23,0xfff2e7,0,.19,0,[1,.8,1]),I(.07,white,-.06,.34,.08)];
    case 'starfish': return Array.from({length:5},(_,n)=>{const a=n*Math.PI*2/5;return p(i(.28),n%2?0xffb580:0xff8e86,{p:[Math.sin(a)*.2,.12,Math.cos(a)*.2],s:[.38,.4,1.2],r:[0,a,0]});});
    case 'anemone': return [C(.45,.22,0x88d9bc),...Array.from({length:5},(_,n)=>{const a=n*Math.PI*2/5;return I(.15,0xf6a6d4,Math.cos(a)*.28,.8,Math.sin(a)*.28,[1,4,1]);})];
    case 'fish': return [I(.48,white,0,.65,0,[.55,.75,1.25],true),p(co(.32,.42,3),gold,{p:[0,.65,-.55],r:[-Math.PI/2,0,0],s:[.25,1,1]}),
      ...eyes(.08,0,.75,.52),K(.14,.3,gold,0,1.05,0)];
    case 'coral': return [C(.24,2.4,0xffb0a5),...[-1,1].flatMap(s=>[
      p(c(.14,.19,1.8,6),0xfa889e,{p:[s*.6,1.6,0],r:[0,0,-s*.55]}),I(.3,0xffd1ba,s*1,2.45,0),C(.12,1,0xfa889e,s*.6,2.5,.1)])];
    case 'chest': return [B(3.7,2.2,2.7,0xa26c42,0,1.1),I(2,0xb9854f,0,2,0,[1,.38,.7]),
      ...[-1.2,1.2].map(x=>B(.28,2.3,2.8,gold,x,1.2)),B(.65,.7,.15,gold,0,1.8,1.43)];
    case 'column': return [B(7,.7,7,0x7da599),C(2.6,7.6,0xd7ddba,0,4.4),B(6.7,.7,6.7,0xdde3bd,0,8.6),
      ...[-1,1].map(x=>C(.22,7.7,0xafc7aa,x*1.7,4.3,1.7)),I(1.3,0x70baa2,-2,1,2)];
    case 'arch': return [B(12,.6,6,0x79aaa5),...[-1,1].map(x=>C(1.7,10.5,0xc9d6b6,x*4.3,5.7)),
      B(11.8,2,4.5,0xdce4c3,0,11.6),B(9,1,4.3,0x8bbbab,0,13.1),I(.9,0xffafa2,-4.3,3,1.7)];
    case 'temple': return [B(18,1.4,18,0x7eaaa6),B(15,1,15,0xb5cbb3,0,1.9),
      ...[-1,1].flatMap(x=>[-1,0,1].map(z=>C(1.4,11,0xd4deba,x*5.6,8,z*5.6))),
      B(16,1.4,16,0xd7e2c0,0,14.2),p(co(11.4,5,4),0x74b5ae,{p:[0,17.4,0],r:[0,Math.PI/4,0]}),
      I(1.2,gold,0,20.5,0),B(5,6,3,0x5d9c97,0,5,-4)];
    default: return null;
  }
}
