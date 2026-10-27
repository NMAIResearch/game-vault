(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.ThinkAgainPacks ||= {}; root.ThinkAgainPacks.c = api; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const pair = (en,hu) => ({en,hu});
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  const centre = o => ({x:o.x+o.w/2,y:o.y+o.h/2});
  const esc = value => String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]);
  const txt = (x,y,value,size=17,attrs='') => `<text x="${x}" y="${y}" font-size="${size}" stroke="none" ${attrs}>${esc(value)}</text>`;
  const object = (id,shape,x,y,w,h,en,hu,kind='ink',extra={}) => ({id,shape:'c-'+shape,x,y,w,h,label:pair(en,hu),kind,...extra});
  const notice = (s,en,hu) => {s.feedback=pair(en,hu);return s;};
  const move = (o,a) => {
    if(a.type==='move' && Number.isFinite(a.x) && Number.isFinite(a.y)) {o.x=clamp(a.x-o.w/2,20,780-o.w);o.y=clamp(a.y-o.h/2,65,455-o.h);return true;}
    if(a.type==='nudge' && Number.isFinite(a.dx) && Number.isFinite(a.dy)) {o.x=clamp(o.x+a.dx,20,780-o.w);o.y=clamp(o.y+a.dy,65,455-o.h);return true;}
    return false;
  };
  const direction = i => ['→','↓','←','↑'][((i%4)+4)%4];
  const overlap = (a,b) => a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y;
  const arrows = {
    id:'p08-arrows',pack:'c',title:pair('Exactly as told','Szó szerint'),
    objective:pair('Get the robot to its charger.','Juttasd el a robotot a töltőjéhez.'),
    initial:{directions:[0,0,3,0],robot:{x:0,y:0},trace:[],ran:false,failed:false},
    hints:[pair('What route do the arrows describe?','Milyen útvonalat jelölnek ki a nyilak?'),pair("Compare each arrow with the charger's position.",'Hasonlítsd össze minden nyíl irányát a töltő helyével.'),pair('Turn the arrows to point right.','Forgasd a nyilakat úgy, hogy jobbra mutassanak.')],
    objects:[object('charger','charger',625,290,110,60,'Charger','Töltő'),object('robot','route-robot',85,190,105,120,'Doodle robot','Firkarobot'),object('flowerbed','flowerbed',365,115,120,85,'Printed flowerbed','Nyomtatott virágágyás'),...Array.from({length:4},(_,i)=>object('arrow'+(i+1),'arrow',225+i*115,350,85,70,'Arrow card '+(i+1),'Nyílkártya '+(i+1),'use',{cardIndex:i})),object('go','go',80,350,105,60,'GO: follow the four arrows','INDULJ: kövesd a négy nyilat','use')],
    test:{type:'custom',objects:['robot','charger','flowerbed','arrow1','arrow2','arrow3','arrow4','go']},
    controls:Array.from({length:4},(_,i)=>({id:'rotate-arrow'+(i+1),label:pair('Rotate card '+(i+1),'Kártya forgatása: '+(i+1)),action:{type:'rotate',id:'arrow'+(i+1)}})),
    solution:[{text:pair('Turn the third arrow a quarter-turn so it points right.','Forgasd el a harmadik nyilat negyed fordulattal, hogy jobbra mutasson.'),action:{type:'rotate',id:'arrow3'}},{text:pair('Press GO. One arrow moves the robot one space.','Nyomd meg az INDULJ gombot. Egy nyíl egy mezővel viszi tovább a robotot.'),action:{type:'use',id:'go'}}],
    payoff:pair('Good directions. One delighted robot.','Jó útmutatás. Egy boldog robot.')
  };
  const butterfly = {
    id:'p14-butterfly',pack:'c',title:pair('Half a butterfly','Fél pillangó'),
    objective:pair('Make both sides of the butterfly picture match.','Legyen egyforma a pillangó képének két oldala.'),
    initial:{mirrorFlipped:false},
    hints:[pair('Do the two sides match?','Egyforma a két oldal?'),pair("Look at the mirror's shiny side.",'Nézd meg a tükör fényes oldalát.'),pair("Align the mirror's edge with the butterfly's body.",'Illeszd a tükör szélét a pillangó testének vonalához.')],
    objects:[object('butterfly','half-wing',240,160,160,190,'Printed half butterfly','Nyomtatott fél pillangó'),object('body','body',390,160,20,190,'Butterfly body at the paper edge','A pillangó teste a papír szélén'),object('mirror','mirror',600,155,90,170,'Hand mirror','Kézitükör','move'),object('mothWing','moth-wing',560,340,125,85,'Loose striped moth wing','Különálló csíkos molylepkeszárny','move')],
    test:{type:'custom',objects:['butterfly','body','mirror','mothWing']},
    controls:[{id:'turn-mirror',label:pair('Turn the mirror over','Tükör átfordítása'),action:{type:'flip',id:'mirror'}}],
    solution:[{text:pair("Stand the mirror's edge along the body. The reflection matches the printed wing.",'Állítsd a tükör szélét a test vonalához. A tükörkép megegyezik a nyomtatott szárnnyal.'),action:{type:'move',id:'mirror',target:'body',x:400,y:255}}],
    payoff:pair('One wing, twice on paper.','Egy szárny, kétszer a papíron.')
  };
  const light = {
    id:'p18-light',pack:'c',title:pair("Where's the fish?",'Hol a hal?'),
    objective:pair('Make the goldfish visible in the bowl.','Tedd láthatóvá az aranyhalat a gömbakváriumban.'),
    initial:{lit:true},
    hints:[pair('This paper is very thin.','Ez a papír nagyon vékony.'),pair('Something is drawn on the back.','A lap hátoldalára is rajzoltak valamit.'),pair('Put the lamp behind the paper.','Tedd a lámpát a papír mögé.')],
    objects:[object('rear','rear-zone',250,85,300,95,'Space behind the sheet','A lap mögötti hely'),object('lamp','lamp',625,280,90,115,'Lit desk lamp','Világító asztali lámpa','move'),object('easel','easel',240,165,300,260,'Paper easel','Papírállvány'),object('sheet','sheet',260,180,260,195,'Thin paper sheet','Vékony papírlap'),object('bowl','bowl',300,220,180,140,'Printed round fishbowl','Nyomtatott gömbakvárium'),object('goldfish','goldfish',334,255,110,65,'Faint goldfish drawing','Halvány aranyhalrajz')],
    test:{type:'custom',objects:['rear','lamp','easel','sheet','bowl','goldfish']},
    solution:[{text:pair('Move the lit lamp into the space behind the paper.','Tedd a világító lámpát a papír mögötti helyre.'),action:{type:'move',id:'lamp',target:'rear',x:400,y:135}}],
    payoff:pair('There you are, little fish.','Megvagy, kis hal.')
  };
  const poster = {
    id:'p20-poster',pack:'c',title:pair('Opening night','Megnyitó'),
    objective:pair('Hang the NMAI poster in the frame for opening night.','Tedd be az NMAI-plakátot a keretbe a megnyitóra.'),
    initial:{minWidth:120,minHeight:140},
    hints:[pair('This frame is printed on the wall.','Ez a keret a falra van nyomtatva.'),pair("This time the frame stays. Look at the poster's corners.",'Most a keret marad. Nézd meg a plakát sarkait.'),pair('Pull a poster corner inward to make it smaller.','Húzd befelé a plakát egyik sarkát, hogy kisebb legyen.')],
    objects:[object('frame','printed-frame',490,165,210,230,'Printed gallery frame','Nyomtatott galériakeret'),object('artist','artist-robot',55,245,110,150,'Proud robot artist','Büszke robotművész'),object('poster','poster',145,120,280,285,'Flower-and-stars NMAI poster','Virágos-csillagos NMAI-plakát','move'),...['nw','ne','sw','se'].map(corner=>object('poster-grip-'+corner,'grip',0,0,52,52,({nw:'Top left poster grip',ne:'Top right poster grip',sw:'Bottom left poster grip',se:'Bottom right poster grip'})[corner],({nw:'Bal felső plakátfogantyú',ne:'Jobb felső plakátfogantyú',sw:'Bal alsó plakátfogantyú',se:'Jobb alsó plakátfogantyú'})[corner],'resize',{parent:'poster',corner}))],
    test:{type:'custom',objects:['frame','artist','poster','poster-grip-nw','poster-grip-ne','poster-grip-sw','poster-grip-se']},
    solution:[{text:pair('Pull a circular poster corner inward. Keep the whole picture.','Húzd befelé a plakát egyik kör alakú sarkát. A teljes kép maradjon meg.'),action:{type:'resize',id:'poster-grip-se',x:335,y:330}},{text:pair('Place the smaller poster in the printed frame.','Tedd a kisebb plakátot a nyomtatott keretbe.'),action:{type:'move',id:'poster',target:'frame',x:595,y:280}}],
    payoff:pair('The artist is ready for opening night.','A művész készen áll a megnyitóra.')
  };
  const levels=[arrows,butterfly,light,poster];
  function mirrorAligned(s) {
    const p=centre(s.objects.mirror);
    return Math.abs(p.x-400)<=65 && p.y>=150 && p.y<=370;
  }
  function lampBehind(s) {
    const p=centre(s.objects.lamp),r=s.objects.rear;
    return s.custom.lit && p.x>=r.x && p.x<=r.x+r.w && p.y>=r.y && p.y<=r.y+r.h;
  }
  function success(l,s,C) {
    if(l.id==='p08-arrows')return s.custom.ran && s.custom.robot.x===4 && s.custom.robot.y===0;
    if(l.id==='p14-butterfly')return mirrorAligned(s) && !s.custom.mirrorFlipped && !overlap(s.objects.mothWing,{x:400,y:160,w:160,h:190});
    if(l.id==='p18-light')return lampBehind(s);
    if(l.id==='p20-poster') {
      const p=s.objects.poster,f=s.objects.frame;
      return p.w>=s.custom.minWidth && p.h>=s.custom.minHeight && C.inside(p,f);
    }
    return false;
  }
  function rotateArrow(s,o,a) {
    const turns=a.type==='nudge'?(a.dx<0||a.dy<0?-1:1):(a.amount===undefined?1:a.amount/90);
    s.custom.directions[o.cardIndex]=((s.custom.directions[o.cardIndex]+turns)%4+4)%4;
    s.custom.ran=false;s.custom.failed=false;s.custom.trace=[];s.custom.robot={x:0,y:0};
    return notice(s,'The arrow turns. The robot waits for GO.','A nyíl elfordul. A robot az INDULJ gombra vár.');
  }
  function followArrows(s) {
    const moves=[[1,0],[0,1],[-1,0],[0,-1]],trace=[{x:0,y:0}];let p={x:0,y:0};
    for(const d of s.custom.directions) {const m=moves[d];p={x:p.x+m[0],y:p.y+m[1]};trace.push(p);}
    const arrived=p.x===4&&p.y===0;
    s.custom.trace=trace;s.custom.ran=arrived;s.custom.failed=!arrived;s.custom.robot=arrived?p:{x:0,y:0};
    return notice(s,arrived?'The four steps reach the charger.':'The robot follows the route, shrugs, and returns. The cards stay as you set them.',arrived?'A négy lépés a töltőhöz vezet.':'A robot követi az útvonalat, vállat von, és visszatér. A kártyák úgy maradnak, ahogy beállítottad őket.');
  }
  function resizePoster(s,o,a) {
    const p=s.objects.poster,east=o.corner.includes('e'),south=o.corner.includes('s');
    const right=p.x+p.w,bottom=p.y+p.h;
    const oldX=east?right:p.x,oldY=south?bottom:p.y;
    const x=a.type==='nudge'?oldX+a.dx:a.x,y=a.type==='nudge'?oldY+a.dy:a.y;
    if(!Number.isFinite(x)||!Number.isFinite(y))return s;
    if(east)p.w=clamp(x-p.x,s.custom.minWidth,Math.min(330,780-p.x));
    else{p.x=clamp(x,Math.max(20,right-330),right-s.custom.minWidth);p.w=right-p.x;}
    if(south)p.h=clamp(y-p.y,s.custom.minHeight,Math.min(310,455-p.y));
    else{p.y=clamp(y,Math.max(65,bottom-310),bottom-s.custom.minHeight);p.h=bottom-p.y;}
    return notice(s,'The whole poster changes size.','A teljes plakát mérete változik.');
  }
  function apply(l,s,a,final,C) {
    const o=s.objects[a.id];if(!o)return undefined;
    if(l.id==='p08-arrows') {
      if(o.cardIndex!==undefined && ['use','rotate','nudge','flip'].includes(a.type)) {
        if(!final)return s;
        return rotateArrow(s,o,a);
      }
      if(o.id==='go'&&a.type==='use')return final?followArrows(s):s;
      return undefined;
    }
    if(l.id==='p14-butterfly') {
      if(o.id==='mirror'&&a.type==='flip') {if(final)s.custom.mirrorFlipped=!s.custom.mirrorFlipped;return s;}
      if(['mirror','mothWing'].includes(o.id)&&move(o,a)) {
        if(final&&o.id==='mirror'&&mirrorAligned(s))s.custom.mirrorFlipped=false;
        if(o.id==='mothWing'&&overlap(o,{x:390,y:150,w:175,h:210}))return notice(s,'The pointed, striped wing does not match the rounded picture.','A hegyes, csíkos szárny nem egyezik a kerek rajzzal.');
        return notice(s,'The loose piece moves across the paper.','A különálló darab elmozdul a papíron.');
      }
      return undefined;
    }
    if(l.id==='p18-light') {
      if(o.id==='lamp'&&move(o,a))return notice(s,lampBehind(s)?'The fish on the back shines through.':'The lamp is on. Where could its light go?',lampBehind(s)?'A hátoldali halrajz átvilágít.':'A lámpa világít. Hová juthatna a fénye?');
      return undefined;
    }
    if(l.id==='p20-poster') {
      if(o.kind==='resize'&&['move','resize','nudge'].includes(a.type))return resizePoster(s,o,a);
      if(o.id==='poster'&&move(o,a)) {
        const f=s.objects.frame,p=centre(o);
        if(final && (a.target==='frame'||(Math.abs(p.x-centre(f).x)<65&&Math.abs(p.y-centre(f).y)<65))) {
          if(o.w>f.w||o.h>f.h){o.x=f.x;o.y=f.y;}
          else{o.x=clamp(o.x,f.x,f.x+f.w-o.w);o.y=clamp(o.y,f.y,f.y+f.h-o.h);}
        }
        return notice(s,'The frame stays put. The poster can still change size.','A keret a helyén marad. A plakát mérete továbbra is változtatható.');
      }
      return undefined;
    }
    return undefined;
  }
  function bounds(l,s,id) {
    const o=s.objects[id];if(!o)return undefined;
    if(l.id==='p08-arrows'&&id==='robot')return {...o,x:85+s.custom.robot.x*135,y:190+s.custom.robot.y*80};
    if(l.id==='p14-butterfly'&&id==='mirror'&&mirrorAligned(s))return {...o,x:400,y:160,w:160,h:190};
    if(l.id==='p20-poster'&&o.kind==='resize') {
      const p=s.objects.poster;
      return {...o,x:p.x+(o.corner.includes('e')?p.w:0)-26,y:p.y+(o.corner.includes('s')?p.h:0)-26};
    }
    return undefined;
  }
  const wing = (fill='#d6a3b2',pattern='#b77389') => `<path d="M156 94 Q88 -4 18 8 Q-7 82 124 100 Q20 133 57 178 Q123 204 156 100 Z" fill="${fill}"/><path d="M150 93 Q82 25 30 24 M150 101 Q81 143 66 169" fill="none" stroke="${pattern}" stroke-width="5"/><circle cx="66" cy="63" r="15" fill="#e7cc78"/><circle cx="89" cy="147" r="10" fill="#e7cc78"/>`;
  function robotDrawing(o,solved,artist=false,failed=false) {
    return `<path d="M18 102 L9 ${artist?139:118} M82 102 L91 ${artist?139:118}" stroke-width="7"/><rect x="7" y="12" width="88" height="90" rx="15" fill="#b5c7bc"/><path d="M42 12 V0 H61 V12" fill="none"/><rect x="17" y="28" width="68" height="43" rx="7" fill="#faf1cf"/><circle cx="34" cy="48" r="4" fill="#3d4741"/><circle cx="68" cy="48" r="4" fill="#3d4741"/><path d="M39 59 ${solved?'Q52 70 66 59':'H64'}" fill="none"/><path d="M8 80 ${failed?'L-3 65':'L-4 91'} M94 80 L110 ${failed?'65':'67'}" fill="none" stroke-width="6"/>${artist?txt(51,91,'NMAI',13,'text-anchor="middle"'):''}`;
  }
  function drawing(o,s,solved,ui,lang,l) {
    const type=o.shape.slice(2);
    if(!o.shape.startsWith('c-'))return undefined;
    if(type==='route-robot')return robotDrawing(o,solved,false,s.custom.failed);
    if(type==='artist-robot')return robotDrawing(o,solved,true);
    if(type==='charger')return `<rect x="2" y="14" width="106" height="39" rx="10" fill="#c9d4b8"/><ellipse cx="55" cy="17" rx="34" ry="8" fill="#e2e8cd"/><circle cx="16" cy="34" r="5" fill="${solved?'#6e9668':'#d8bf77'}"/><path d="M57 23 L48 36 H61 L53 46" fill="none" stroke-width="3"/>`;
    if(type==='arrow') {
      const d=s.custom.directions[o.cardIndex],trace=s.custom.trace;
      return `<rect width="85" height="70" rx="5" fill="${trace.length?'#e5e8cf':'#f4dfaa'}"/><path d="M63 1 L84 21 L63 21 Z" fill="#fff7df"/>${txt(42,45,direction(d),43,'text-anchor="middle"')}${txt(10,15,String(o.cardIndex+1),12)}${trace.length?txt(72,61,String(o.cardIndex+1),12,'text-anchor="middle" fill="#49654f"'):''}`;
    }
    if(type==='go')return `<rect width="105" height="60" rx="8" fill="#a8bea5"/>${txt(52,37,lang==='hu'?'INDULJ':'GO',20,'text-anchor="middle" font-weight="700"')}`;
    if(type==='flowerbed')return '<path d="M2 69 Q59 48 116 70 L111 83 H9 Z" fill="#bbc39c"/><path d="M26 68 V34 M61 65 V18 M94 69 V36" fill="none"/><g fill="#d6a3b2"><circle cx="26" cy="30" r="12"/><circle cx="61" cy="16" r="12"/><circle cx="94" cy="31" r="12"/></g><g fill="#e8cd73"><circle cx="26" cy="30" r="4"/><circle cx="61" cy="16" r="4"/><circle cx="94" cy="31" r="4"/></g>';
    if(type==='half-wing')return wing();
    if(type==='body')return '<path d="M10 30 V170" stroke-width="9"/><path d="M10 31 Q-5 4 -13 13 M10 31 Q25 4 32 13" fill="none"/>';
    if(type==='mirror') {
      if(mirrorAligned(s))return `<rect width="160" height="190" rx="7" fill="${s.custom.mirrorFlipped?'#c8b89e':'#d8e5df'}" fill-opacity=".55"/>${s.custom.mirrorFlipped?'<path d="M25 25 L135 165 M135 25 L25 165" stroke="#ab987b"/>':`<g transform="translate(160 0) scale(-1 1)">${wing()}</g>`}<path d="M0 6 V184" stroke="#8c9b98" stroke-width="5"/>`;
      return `<path d="M36 112 L29 164 H55 L52 112" fill="#cfb681"/><ellipse cx="45" cy="60" rx="40" ry="56" fill="${s.custom.mirrorFlipped?'#bcae9b':'#d7e6e4'}"/>${s.custom.mirrorFlipped?'<path d="M25 40 L65 80 M65 40 L25 80" stroke="#a9957c"/>':'<path d="M23 42 L40 21 M36 61 L62 27" stroke="#fff9eb" stroke-width="5"/>'}`;
    }
    if(type==='moth-wing')return '<path d="M3 8 L121 14 L85 83 L39 52 Z" fill="#baa8c5"/><path d="M26 14 L78 69 M51 15 L96 47 M76 17 L107 35" stroke="#776789" stroke-width="7"/>';
    if(type==='rear-zone')return '<path d="M15 85 L43 3 H251 L286 85" fill="none" stroke="#aaa58e" stroke-dasharray="5 8"/><path d="M15 85 H286" stroke="#aaa58e" stroke-dasharray="5 8"/>';
    if(type==='lamp')return '<path d="M9 109 H82 M45 106 L56 70 L32 35" fill="none" stroke-width="5"/><path d="M4 41 L18 11 H47 L64 41 Z" fill="#d9bd69"/><circle cx="34" cy="47" r="7" fill="#f5d983" stroke="#d9bd69"/><path d="M12 58 L2 71 M34 60 V78 M58 57 L73 71" fill="none" stroke="#d8b858"/>';
    if(type==='easel')return '<path d="M38 249 L72 27 L225 27 L264 249 M11 204 H290" fill="none" stroke="#9d896d" stroke-width="9"/>';
    if(type==='sheet')return `<path d="M0 0 L260 5 L255 195 L4 190 Z" fill="${lampBehind(s)?'#fff0bc':'#fffaf0'}" stroke="#b5ad9d"/>`;
    if(type==='bowl')return `<path d="M37 16 Q-6 42 6 88 Q24 137 90 136 Q156 137 174 88 Q186 42 143 16" fill="${lampBehind(s)?'#d6e9e3':'none'}" fill-opacity=".5"/><ellipse cx="90" cy="16" rx="56" ry="10" fill="none"/><path d="M16 70 Q90 61 167 71" fill="none" stroke="#99b6b0"/>`;
    if(type==='goldfish')return `<g opacity="${lampBehind(s)?'1':'.16'}"><path d="M16 32 Q49 0 83 27 L108 10 L106 54 L82 38 Q48 67 16 32 Z" fill="${lampBehind(s)?'#e2ad60':'#a6a79d'}"/><circle cx="32" cy="27" r="3" fill="#3d4741"/><path d="M56 18 L66 5 L76 23 M57 43 L69 57 L77 39" fill="${lampBehind(s)?'#d99951':'#a6a79d'}"/></g>`;
    if(type==='printed-frame')return `<path d="M-15 -15 H${o.w+15} V${o.h+15} H-15 Z M0 0 H${o.w} V${o.h} H0 Z" fill="#e1c69a" fill-rule="evenodd"/><path d="M-8 -8 H${o.w+8} V${o.h+8}" fill="none" stroke="#a18a68"/>`;
    if(type==='grip')return '<circle cx="26" cy="26" r="14" fill="#fff9e9"/><circle cx="26" cy="26" r="4" fill="#bf684d" stroke="none"/>';
    if(type==='poster') {
      const w=o.w,h=o.h,cx=w/2,cy=h*.52;
      return `<rect width="${w}" height="${h}" rx="3" fill="#e8d1ae"/><rect x="7" y="7" width="${w-14}" height="${h-14}" fill="#faf1d9" stroke="#b99176"/>${txt(cx,h*.2,'NMAI',Math.max(16,w*.11),'text-anchor="middle" font-family="Georgia,serif"')}<path d="M${cx} ${h*.79} V${cy+15} M${cx} ${h*.7} Q${w*.2} ${h*.51} ${w*.31} ${h*.72} L${cx} ${h*.76} M${cx} ${h*.65} Q${w*.8} ${h*.48} ${w*.7} ${h*.68}" fill="#a5bb8d"/><g transform="translate(${cx} ${cy}) scale(${w/200} ${h/220})"><path d="M0 -7 C-42 -48 -58 -7 -20 6 C-55 36 -11 58 1 23 C17 60 55 29 25 6 C66 -11 36 -49 13 -14 C8 -44 -15 -44 0 -7 Z" fill="#d9947d"/><circle r="12" fill="#e8c66e"/></g><g fill="#9faec1" stroke-width="1.5"><path d="M${w*.2} ${h*.28} l4 9 10 1 -8 6 2 10 -8 -5 -8 5 2 -10 -8 -6 10 -1 Z"/><path d="M${w*.79} ${h*.31} l4 9 10 1 -8 6 2 10 -8 -5 -8 5 2 -10 -8 -6 10 -1 Z"/></g>`;
    }
    return '';
  }
  function background(l,s,lang) {
    if(l.id==='p08-arrows') {
      let out=txt(400,80,lang==='hu'?'Egy nyíl, egy mező.':'One arrow, one space.',21,'text-anchor="middle" fill="#636856"')+'<path d="M137 310 H728" stroke="#aaa58e" stroke-dasharray="4 8" fill="none"/>';
      for(let i=0;i<5;i++)out+=`<circle cx="${137+i*135}" cy="310" r="7" fill="#f8f3e4" stroke="#aaa58e"/>`;
      if(s.custom.trace.length){
        const pts=s.custom.trace.map(p=>({x:137+p.x*135,y:310+p.y*80}));
        out+=`<polyline points="${pts.map(p=>p.x+','+p.y).join(' ')}" fill="none" stroke="${s.custom.failed?'#b4816e':'#7f9a72'}" stroke-width="4" stroke-dasharray="5 7"/>`;
        pts.slice(1).forEach((p,i)=>{out+=`<circle cx="${p.x}" cy="${p.y}" r="12" fill="#f8f3e4" stroke="#7f9a72"/>${txt(p.x,p.y+5,i+1,14,'text-anchor="middle"')}`;});
      }
      return out;
    }
    if(l.id==='p14-butterfly')return '<path d="M188 125 H400 V385 H188 Z" fill="#fff9e9" stroke="#b3ad9c" stroke-width="2"/><path d="M400 125 V385" stroke="#aaa38f" stroke-dasharray="4 7"/>';
    if(l.id==='p18-light')return lampBehind(s)?'<path d="M365 140 L295 355 H490 L440 140 Z" fill="#edcf70" fill-opacity=".12"/>':'';
    if(l.id==='p20-poster')return '<path d="M42 430 H754" stroke="#c5bead" stroke-width="2"/>';
    return '';
  }
  const cases=[
    {levelId:'p08-arrows',name:'wrong route retains cards and returns',actions:[{type:'use',id:'go'}],solved:false},
    {levelId:'p08-arrows',name:'third card repair',actions:[{type:'rotate',id:'arrow3'},{type:'use',id:'go'}],solved:true},
    {levelId:'p08-arrows',name:'wrong route then repair',actions:[{type:'use',id:'go'},{type:'rotate',id:'arrow3'},{type:'use',id:'go'}],solved:true},
    {levelId:'p08-arrows',name:'repeated rotations and a changed card restored',actions:[{type:'rotate',id:'arrow1',amount:180},{type:'rotate',id:'arrow3',amount:450},{type:'rotate',id:'arrow1',amount:180},{type:'use',id:'go'}],solved:true},
    {levelId:'p08-arrows',name:'no GO no movement',actions:[{type:'rotate',id:'arrow3'}],solved:false},
    {levelId:'p14-butterfly',name:'mirror broad low placement',actions:[{type:'move',id:'mirror',x:450,y:345}],solved:true},
    {levelId:'p14-butterfly',name:'mirror reversed before alignment',actions:[{type:'flip',id:'mirror'},{type:'move',id:'mirror',x:360,y:180}],solved:true},
    {levelId:'p14-butterfly',name:'mismatched physical wing',actions:[{type:'move',id:'mothWing',x:455,y:250}],solved:false},
    {levelId:'p14-butterfly',name:'mismatch moved clear then mirror',actions:[{type:'move',id:'mothWing',x:455,y:250},{type:'move',id:'mothWing',x:650,y:390},{type:'move',id:'mirror',x:400,y:255}],solved:true},
    {levelId:'p14-butterfly',name:'wing covers reflection',actions:[{type:'move',id:'mirror',x:400,y:255},{type:'move',id:'mothWing',x:455,y:250}],solved:false},
    {levelId:'p18-light',name:'left rear zone',actions:[{type:'move',id:'lamp',x:265,y:135}],solved:true},
    {levelId:'p18-light',name:'right rear zone',actions:[{type:'move',id:'lamp',x:535,y:135}],solved:true},
    {levelId:'p18-light',name:'lamp in front',actions:[{type:'move',id:'lamp',x:400,y:325}],solved:false},
    {levelId:'p18-light',name:'indirect path to rear',actions:[{type:'move',id:'lamp',x:180,y:340},{type:'move',id:'lamp',x:400,y:135}],solved:true},
    {levelId:'p20-poster',name:'too large at frame',actions:[{type:'move',id:'poster',target:'frame',x:595,y:280}],solved:false},
    {levelId:'p20-poster',name:'place before shrinking',actions:[{type:'move',id:'poster',target:'frame',x:595,y:280},{type:'resize',id:'poster-grip-se',x:680,y:375}],solved:true},
    ...['nw','ne','sw','se'].map(corner=>({levelId:'p20-poster',name:'shrink using '+corner,actions:[{type:'resize',id:'poster-grip-'+corner,x:corner.includes('w')?235:335,y:corner.includes('n')?195:330},{type:'move',id:'poster',x:595,y:280}],solved:true}))
  ];
  return {levels,apply,success,bounds,drawing,background,cases};
});
