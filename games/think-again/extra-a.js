(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.ThinkAgainPacks = root.ThinkAgainPacks || {}; root.ThinkAgainPacks.a = api; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const p = (en,hu) => ({en,hu});
  const clone = x => JSON.parse(JSON.stringify(x));
  const clamp = (x,a,b) => Math.max(a,Math.min(b,x));
  const esc = x => String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const txt = (x,y,value,size=18,more='') => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" stroke="none" ${more}>${esc(value)}</text>`;
  const object = (id,shape,x,y,w,h,en,hu,kind='ink') => ({id,shape:'a-'+shape,x,y,w,h,label:p(en,hu),kind});
  const step = (en,hu,action) => ({text:p(en,hu),action});
  const control = (id,en,hu,action) => ({id,label:p(en,hu),action});
  const levels = [
    {
      id:'p02-owl', pack:'a', title:p('Night owl','Éjjeli bagoly'), objective:p('Wake the owl.','Ébreszd fel a baglyot.'),
      hints:[p('Owls are night birds.','A bagoly éjszakai madár.'),p('It is still daytime.','Még nappal van.'),p('Move the sun behind the hill.','Tedd a napot a domb mögé.')],
      initial:{sun:0},
      objects:[object('sun','sun',144,59,72,72,'Paper sun','Papírnap','move'),object('hill','hill',70,305,660,125,'Printed hill','Nyomtatott domb'),object('branch','branch',480,353,210,48,'Printed branch','Nyomtatott ág'),object('owl','owl',510,231,110,130,'Sleeping owl in a plain nightcap','Alvó bagoly egyszerű hálósapkában')],
      test:{type:'custom',objects:['sun','hill','owl']},
      solution:[step('Move the sun down its arc and behind the hill.','Vidd le a napot az ívén, a domb mögé.',{type:'move',id:'sun',target:'hill',x:620,y:400})],
      payoff:p('Night falls. The owl is wide awake.','Leszáll az éj. A bagoly már ébren van.')
    },
    {
      id:'p04-fish',pack:'a',title:p('Face to face','Szemtől szemben'),objective:p('Make the paper fish face each other.','Fordítsd egymás felé a papírhalakat.'),
      hints:[p('These are paper cards.','Ezek papírkártyák.'),p('Try the other side of a card.','Próbáld meg egy kártya másik oldalát.'),p('Use Flip on the right card so it faces left.','Fordítsd át a jobb oldali kártyát, hogy a hal balra nézzen.')],
      initial:{flipL:false,flipR:false,turnL:0,turnR:0},
      objects:[object('cardL','fishCard',130,177,210,155,'Left fish card','Bal oldali halkártya','use'),object('cardR','fishCard',460,177,210,155,'Right fish card','Jobb oldali halkártya','use')],
      controls:[control('flipL','Flip left card','Bal kártya átfordítása',{type:'flip',id:'cardL'}),control('turnL','Rotate left card','Bal kártya forgatása',{type:'rotate',id:'cardL'}),control('flipR','Flip right card','Jobb kártya átfordítása',{type:'flip',id:'cardR'}),control('turnR','Rotate right card','Jobb kártya forgatása',{type:'rotate',id:'cardR'})],
      test:{type:'custom',objects:['cardL','cardR']},
      solution:[step('Turn the right card over. A half-turn works too.','Fordítsd át a jobb kártyát. Egy félfordulat is jó.',{type:'flip',id:'cardR'})],
      payoff:p('Hello from the other side of the paper.','Helló a papír másik oldaláról!')
    },
    {
      id:'p03-post',pack:'a',title:p('Special delivery','Különleges küldemény'),objective:p('Deliver the letter dry.','Juttasd célba szárazon a levelet.'),
      hints:[p('What could make the letter wet?','Mitől ázhat el a levél?'),p('The umbrella handle fits the little bracket.','Az esernyő nyele beleillik a kis tartóba.'),p("Put the umbrella in the trolley's bracket.",'Tedd az esernyőt a kocsi tartójába.')],
      initial:{attached:false,delivered:false,splash:false},
      objects:[object('cloud','cloud',332,86,198,120,'Fixed rain cloud','Rögzített esőfelhő'),object('rail','rail',80,385,660,40,'Trolley rail','Kocsisín'),object('postbox','postbox',650,224,90,153,'Postbox','Postaláda'),object('trolley','trolley',100,310,150,90,'Postal trolley on a rail','Postakocsi a sínen','move'),object('letter','letter',124,270,88,64,'Letter held by a fixed clip','Rögzített csipesszel tartott levél'),object('clip','clip',183,260,42,45,'Fixed letter clip','Rögzített levélcsipesz'),object('bracket','bracket',214,275,56,60,'Umbrella bracket','Esernyőtartó'),object('umbrella','umbrella',80,135,90,115,'Loose umbrella','Különálló esernyő','move')],
      test:{type:'custom',objects:['trolley','letter','umbrella','bracket','postbox','cloud']},
      solution:[step('Seat the umbrella in the matching bracket. It opens over the letter.','Tedd az esernyőt a hozzá illő tartóba. A levél fölött kinyílik.',{type:'move',id:'umbrella',target:'bracket',x:242,y:305}),step('Roll the covered trolley through the rain to the postbox.','Told a fedett kocsit az esőn át a postaládához.',{type:'move',id:'trolley',target:'postbox',x:695,y:350})],
      payoff:p('One dry letter. Special delivery complete.','Egy száraz levél. A különleges küldemény célba ért.')
    },
    {
      id:'p10-boat',pack:'a',title:p('A tiny harbour','Apró kikötő'),objective:p('Float the paper boat.','Ússzon a papírhajó!'),
      hints:[p('What is stopping the boat from floating?','Mi akadályozza, hogy a hajó ússzon?'),p('Look at the cork.','Nézd meg a dugót.'),p('Put the cork in the drain.','Tedd a dugót a lefolyóba.')],
      initial:{water:0,boatPlace:'side',soggy:false,cork:false},
      objects:[object('basin','basin',240,185,390,215,'Basin','Medence'),object('line','waterline',260,239,350,32,'Blue target water line','Kék célvízszint'),object('drain','drain',518,327,70,62,'Open drain','Nyitott lefolyó'),object('tap','tap',490,83,115,95,'Water tap','Vízcsap','use'),object('cork','cork',114,172,58,62,'Loose cork','Különálló dugó','move'),object('boat','boat',88,293,115,75,'Paper boat','Papírhajó','move')],
      controls:[control('lift','Lift boat out','Hajó kiemelése',{type:'lift',id:'boat'})],
      test:{type:'custom',objects:['boat','cork','drain','basin','tap','line']},
      solution:[step('Put the cork in the drain.','Tedd a dugót a lefolyóba.',{type:'move',id:'cork',target:'drain',x:553,y:358}),step('Put the intact boat in the basin.','Tedd az ép hajót a medencébe.',{type:'move',id:'boat',target:'basin',x:375,y:290}),step('Turn the tap once.','Nyisd meg egyszer a csapot.',{type:'use',id:'tap'}),step('Add another step of water.','Engedj még egy adag vizet.',{type:'use',id:'tap'}),step('Fill to the blue line. The tap stops there.','Töltsd a kék vonalig. A csap ott megáll.',{type:'use',id:'tap'})],
      payoff:p('A cork does the plugging. A boat does the floating.','A dugó tömít. A hajó úszik.')
    },
    {
      id:'p16-server',pack:'a',title:p('Ultra cool','Szuper hűvös'),objective:p('Help the little server cool down.','Hűljön le a kis szerver.'),
      hints:[p('The fan is already working hard.','A ventilátor már most is erősen dolgozik.'),p('Can the air get through the vent?','Átjut a levegő a szellőzőn?'),p('Peel the sticker away from the vent.','Húzd le a matricát a szellőzőről.')],
      initial:{},
      objects:[object('server','server',257,117,260,290,'Warm cartoon NMAI server','Meleg rajzolt NMAI-szerver'),object('vent','vent',286,211,206,111,'Server vent','Szerver szellőzője'),object('fan','fan',357,216,126,98,'Working fan','Működő ventilátor'),object('dial','dial',552,230,78,78,'Fan dial already at maximum','Ventilátorszabályzó a legnagyobb fokozaton','use'),object('sticker','sticker',278,198,180,132,'Ultra cool sticker with a loose corner','Szuper hűtés matrica felpöndörödött sarokkal','move')],
      controls:[control('peel','Peel sticker','Matrica lehúzása',{type:'peel',id:'sticker'})],
      test:{type:'custom',objects:['sticker','vent','server','fan','dial']},
      solution:[step('Peel the loose sticker away from the vent.','Húzd le a különálló matricát a szellőzőről.',{type:'move',id:'sticker',x:126,y:244})],
      payoff:p('A clear vent. A much calmer little server.','Szabad szellőző. Sokkal nyugodtabb kis szerver.')
    },
    {
      id:'p09-cups',pack:'a',title:p('A matching pair','Egyforma rajzok'),objective:p('Make a matching pair.','Legyen két rajz egyforma.'),
      hints:[p('Look closely at the two cups.','Nézd meg jól a két csészét.'),p('On this sheet, only pencil marks rub out.','Ezen a lapon csak a ceruzavonalakat lehet kiradírozni.'),p('Erase the pencil steam.','Radírozd ki a ceruzával rajzolt gőzt.')],
      initial:{erased:false,picks:[]},
      objects:[object('cupL','cup',157,235,110,130,'Left ink cup drawing','Bal oldali tintás csészerajz'),object('cupR','cup',355,235,110,130,'Right ink cup drawing','Jobb oldali tintás csészerajz'),object('steam','steam',382,152,74,83,'Pencil steam belonging to the right cup','A jobb csészéhez tartozó ceruzás gőz'),object('leaf','leaf',527,250,100,94,'Ink leaf drawing','Tintás levélrajz'),object('flower','flower',654,242,86,116,'Ink flower drawing','Tintás virágrajz'),object('eraser','eraser',141,112,105,57,'Loose eraser','Különálló radír','move')],
      test:{type:'custom',objects:['cupL','cupR','steam','eraser','leaf','flower']},
      solution:[step('Rub out the light pencil steam above the right cup.','Radírozd ki a halvány ceruzás gőzt a jobb csésze fölött.',{type:'move',id:'eraser',target:'steam',x:419,y:193}),step('Choose one of the matching cups.','Válaszd ki az egyik egyforma csészét.',{type:'use',id:'cupL'}),step('Choose the other cup. Either order works.','Válaszd ki a másik csészét. Bármelyik sorrend jó.',{type:'use',id:'cupR'})],
      payoff:p('Two matching ink drawings. Just a little less pencil.','Két egyforma tintarajz. Csak egy kicsivel kevesebb ceruzavonal.')
    }
  ];
  function custom(level,state) { return state.custom || level.initial; }
  function centre(o) { return {x:o.x+o.w/2,y:o.y+o.h/2}; }
  function close(a,b,dx=75,dy=75) { return Math.abs(a.x-b.x)<=dx && Math.abs(a.y-b.y)<=dy; }
  function overlaps(a,b) { return a.x < b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y; }
  function move(o,action) {
    if(action.type==='nudge') {
      if(!Number.isFinite(action.dx)||!Number.isFinite(action.dy))return false;
      o.x=clamp(o.x+action.dx,35,765-o.w);o.y=clamp(o.y+action.dy,75,425-o.h);
    } else {
      if(!Number.isFinite(action.x)||!Number.isFinite(action.y))return false;
      o.x=clamp(action.x-o.w/2,35,765-o.w);o.y=clamp(action.y-o.h/2,75,425-o.h);
    }
    return true;
  }
  function facing(c,side) { return (c['flip'+side]?-1:1)*(c['turn'+side]%2?-1:1); }
  function bounds(level,state,id) {
    const o=state.objects[id], c=custom(level,state);
    if(!o)return undefined;
    if(level.id==='p02-owl'&&id==='sun')return {...o,x:144+430*c.sun,y:59+310*c.sun*c.sun};
    if(level.id==='p03-post') {
      const trolley=state.objects.trolley, dx=trolley.x-100;
      if(id==='letter'&&c.delivered)return {...o,x:state.objects.postbox.x+1,y:state.objects.postbox.y+31};
      if(['letter','clip','bracket'].includes(id))return {...o,x:o.x+dx};
      if(id==='umbrella'&&c.attached)return {...o,x:trolley.x-12,y:167,w:192,h:151};
    }
    if(level.id==='p10-boat'&&id==='boat') {
      if(c.boatPlace==='drain')return {...o,x:496,y:332,w:115,h:c.soggy?37:75};
      if(c.boatPlace==='basin')return {...o,x:325,y:315-c.water*35};
    }
    return undefined;
  }
  function success(level,state) {
    const c=custom(level,state);
    switch(level.id) {
      case 'p02-owl': return 59+310*c.sun*c.sun>=310;
      case 'p04-fish': return facing(c,'L')===1&&facing(c,'R')===-1;
      case 'p03-post': return c.attached&&c.delivered&&state.objects.trolley.x>=535;
      case 'p10-boat': return c.boatPlace==='basin'&&!c.soggy&&c.cork&&c.water===3;
      case 'p16-server': return !overlaps(state.objects.sticker,state.objects.vent);
      case 'p09-cups': return c.erased&&c.picks.length===2&&c.picks.includes('cupL')&&c.picks.includes('cupR');
      default:return false;
    }
  }
  function apply(level,state,action,final=true) {
    const o=state.objects[action.id];
    if(!o)return undefined;
    state.custom=state.custom||clone(level.initial);
    const c=state.custom;
    if(['select','release'].includes(action.type))return undefined;
    if(action.type==='nudge'&&(!Number.isFinite(action.dx)||!Number.isFinite(action.dy)))return state;
    if(level.id==='p02-owl') {
      if(action.id==='sun'&&['move','nudge'].includes(action.type)) {
        const next=action.type==='nudge' ? c.sun+(action.dx||action.dy)/160 :
          action.target==='hill' ? 1 : Number.isFinite(action.x) ? (action.x-180)/430 : c.sun;
        c.sun=clamp(next,0,1);state.feedback='move';return state;
      }
      if(action.id==='owl'){state.effect={type:'wobble',id:'owl'};state.feedback=success(level,state)?p('Good evening!','Jó estét!'):p('Zzz… It is still daytime.','Zzz… Még nappal van.');return state;}
    }
    if(level.id==='p04-fish'&&['cardL','cardR'].includes(action.id)) {
      const side=action.id==='cardL'?'L':'R';
      if(final&&['use','flip','rotate'].includes(action.type)) {
        if(action.type==='rotate')c['turn'+side]=(c['turn'+side]+1)%2;
        else c['flip'+side]=!c['flip'+side];
      }
      state.feedback=p('The card turns. The fish stays printed on it.','A kártya elfordul. A hal rajta marad.');return state;
    }
    if(level.id==='p03-post') {
      if(action.id==='umbrella'&&['move','nudge'].includes(action.type)) {
        const bracket=bounds(level,state,'bracket')||state.objects.bracket;
        if(!move(o,action))return state;
        if(final&&(action.target==='bracket'||action.target==='trolley'||close(centre(o),centre(bracket),105,100))) {
          c.attached=true;c.splash=false;state.feedback=p('The umbrella clicks into the bracket and opens.','Az esernyő a tartóba kattan, és kinyílik.');
        } else if(final)c.attached=false;
        return state;
      }
      if(action.id==='trolley'&&['move','nudge'].includes(action.type)) {
        const next=action.type==='nudge'?o.x+action.dx:action.target==='postbox'?560:action.x-o.w/2;
        if(!Number.isFinite(next))return state;
        const x=clamp(next,80,560);
        if(final&&!c.attached&&x>=255){o.x=100;o.y=310;c.delivered=false;c.splash=true;state.feedback=p('A splash! The trolley returns with a fresh dry letter.','Egy csobbanás! A kocsi friss, száraz levéllel visszatér.');}
        else {o.x=x;o.y=310;c.delivered=c.attached&&x>=535;c.splash=false;state.feedback='move';}
        return state;
      }
      if(action.id==='letter'||action.id==='clip'){state.feedback=p('The letter stays held by its clip.','A levelet a csipesz a helyén tartja.');return state;}
    }
    if(level.id==='p10-boat') {
      if(action.type==='lift'&&action.id==='boat') {
        c.boatPlace='side';c.soggy=false;o.x=88;o.y=293;
        if(!c.cork)c.water=0;
        state.feedback=p('The boat dries beside the basin, ready to float again.','A hajó megszárad a medence mellett, és újra úszhat.');return state;
      }
      if(action.id==='tap'&&action.type==='use') {
        if(!final)return state;
        if(c.cork||c.boatPlace==='drain')c.water=Math.min(3,c.water+1);else c.water=0;
        if(c.boatPlace==='drain'){c.soggy=true;state.feedback=p('The drain is blocked, but the paper boat is flat and soggy.','A lefolyó eldugult, de a papírhajó lapos és átázott.');}
        else state.feedback=c.water?p('The water rises one step.','A vízszint egy lépéssel emelkedik.'):p('The water runs out through the drain.','A víz kifolyik a lefolyón.');
        return state;
      }
      if(['cork','boat'].includes(action.id)&&['move','nudge'].includes(action.type)) {
        if(!move(o,action))return state;
        if(!final)return state;
        const atDrain=action.target==='drain'||close(centre(o),centre(state.objects.drain),62,62);
        const atBasin=action.target==='basin'||(centre(o).x>=250&&centre(o).x<=625&&centre(o).y>=190&&centre(o).y<=405);
        if(action.id==='cork') {
          c.cork=atDrain;
          if(atDrain){o.x=524;o.y=327;state.feedback=p('The cork fits the drain.','A dugó beleillik a lefolyóba.');}
          else if(c.boatPlace!=='drain')c.water=0;
        } else {
          c.boatPlace=atDrain?'drain':atBasin?'basin':'side';
          if(c.boatPlace==='side')c.soggy=false;
          if(c.boatPlace==='drain'&&c.water>0)c.soggy=true;
          if(c.boatPlace!=='drain'&&!c.cork)c.water=0;
        }
        return state;
      }
    }
    if(level.id==='p16-server') {
      if(action.id==='dial'){state.effect={type:'wobble',id:'dial'};state.feedback=p('Already at maximum. The fan is trying very hard.','Már a legnagyobb fokozaton van. A ventilátor nagyon igyekszik.');return state;}
      if(action.id==='sticker') {
        if(['peel','use'].includes(action.type)&&final){o.x=45;o.y=178;state.feedback='move';return state;}
        if(['move','nudge'].includes(action.type)){move(o,action);state.feedback='move';return state;}
      }
    }
    if(level.id==='p09-cups') {
      if(action.id==='eraser') {
        if(action.type==='use'){state.selected='eraser';state.feedback=p('Choose a pencil mark to rub out.','Válassz egy kiradírozandó ceruzavonalat.');return state;}
        if(['move','nudge'].includes(action.type)) {
          if(!move(o,action))return state;
          const nearSteam=action.target==='steam'||close(centre(o),centre(state.objects.steam),85,85);
          if(final&&nearSteam){c.erased=true;o.x=141;o.y=112;state.feedback=p('The pencil steam rubs out. The ink stays.','A ceruzás gőz eltűnik. A tinta megmarad.');}
          else if(final)state.feedback=p('The ink stays on this page.','A tinta ezen a lapon megmarad.');
          return state;
        }
      }
      if(['cupL','cupR','leaf','flower'].includes(action.id)&&action.type==='use'&&final) {
        const at=c.picks.indexOf(action.id);
        if(at>=0)c.picks.splice(at,1);else {if(c.picks.length===2)c.picks.shift();c.picks.push(action.id);}
        state.feedback=c.picks.includes('cupL')&&c.picks.includes('cupR')&&!c.erased?p('Almost the same… Look at the pencil steam.','Majdnem egyformák… Nézd meg a ceruzás gőzt.'):p('A drawing is marked. Tap it again to release it.','Megjelöltél egy rajzot. Újabb koppintással feloldhatod.');
        if(!c.erased&&c.picks.includes('cupL')&&c.picks.includes('cupR'))state.effect={type:'wobble',id:action.id};
        return state;
      }
    }
    if(o.kind==='ink'){state.feedback='ink';return state;}
    if(o.kind==='move'&&action.type==='use'){state.selected=o.id;state.feedback='move';return state;}
    return undefined;
  }
  const fish = (cx,cy,dir,upside=false) => `<g transform="translate(${cx} ${cy}) scale(${dir} ${upside?-1:1})"><path d="M-54 0 L-83 -28 L-83 28 Z" fill="#c99c79"/><path d="M-55 0 Q-20 -46 47 -17 Q75 0 47 17 Q-20 46 -55 0 Z" fill="#b8c9bb"/><circle cx="42" cy="-5" r="4" fill="#3d4741" stroke="none"/><path d="M3 -24 L-8 -40 L-20 -23 M-2 25 L-13 40 L-27 25" fill="#d9ba77"/></g>`;
  function drawing(o,state,solved,ui,lang,level) {
    if(!o.shape.startsWith('a-'))return undefined;
    const c=custom(level,state), key=o.shape.slice(2), pick=c.picks?.includes(o.id);
    switch(key) {
      case 'sun':return '<circle cx="36" cy="36" r="25" fill="#e8c36d"/><path d="M36 0 V7 M36 65 V72 M0 36 H7 M65 36 H72 M10 10 L16 16 M57 57 L63 63 M10 63 L16 57 M57 16 L63 10" fill="none"/>';
      case 'hill':return '<path d="M0 125 V55 Q70 0 160 0 H520 Q600 0 660 55 V125 Z" fill="#a9bb94"/>';
      case 'branch':return '<path d="M0 22 Q88 27 204 3 M140 16 L174 43" fill="none" stroke-width="10"/>';
      case 'owl':return `<path d="M24 38 Q10 115 58 121 Q107 119 94 40 Z" fill="#cbb597"/><path d="M22 43 Q54 13 96 38 L88 13 Q56 -17 30 14 Z" fill="#d5c4dc"/><circle cx="89" cy="12" r="9" fill="#eee7ed"/><path d="M19 59 Q52 35 58 68 Q70 37 98 59" fill="#ead8b6"/>${solved?'<circle cx="40" cy="68" r="13" fill="#faf5df"/><circle cx="78" cy="68" r="13" fill="#faf5df"/><circle cx="42" cy="68" r="5" fill="#3d4741"/><circle cx="76" cy="68" r="5" fill="#3d4741"/>':'<path d="M28 68 Q40 77 52 68 M66 68 Q78 77 90 68" fill="none"/>'}<path d="M53 81 L60 94 L67 81 Z" fill="#c2965d"/><path d="M35 117 V130 M77 117 V130"/>`;
      case 'fishCard': {
        const side=o.id==='cardL'?'L':'R';
        return `<rect width="210" height="155" rx="5" fill="${c['flip'+side]?'#e5e9df':'#fff9e7'}"/><path d="M184 155 V129 L210 129" fill="#e9dbc0"/><g opacity=".15">${fish(105,77,-facing(c,side))}</g>${fish(105,77,facing(c,side),c['turn'+side]%2===1)}`;
      }
      case 'cloud':return '<path d="M16 70 Q-7 50 13 32 Q26 16 46 28 Q55 -1 85 4 Q113 -8 134 23 Q169 9 180 40 Q209 67 177 79 H29 Z" fill="#c8d0d4"/><path d="M38 96 L25 118 M79 96 L67 118 M122 96 L111 118 M165 96 L154 118" fill="none" stroke="#8ba5b2"/>';
      case 'rail':return '<path d="M0 6 H660 M0 24 H660" fill="none" stroke="#8d8d7e"/><path d="M30 2 V29 M110 2 V29 M190 2 V29 M270 2 V29 M350 2 V29 M430 2 V29 M510 2 V29 M590 2 V29" fill="none" stroke="#c2b79e"/>';
      case 'postbox':return `<path d="M14 139 V29 Q14 0 45 0 Q76 0 76 29 V139 Z" fill="#c68370"/><rect x="23" y="36" width="44" height="15" rx="3" fill="#665f52"/><path d="M1 143 H89"/>${solved?txt(45,94,'✓',30):txt(45,94,'✉',28)}`;
      case 'trolley':return '<path d="M3 4 H147 L132 46 H20 Z" fill="#b8c6bd"/><path d="M7 7 L-8 -35 H-25 M27 48 V62 H123" fill="none" stroke-width="5"/><circle cx="34" cy="68" r="13" fill="#cdb78c"/><circle cx="119" cy="68" r="13" fill="#cdb78c"/>';
      case 'letter':return `<rect width="88" height="64" rx="2" fill="#fffaf0"/><path d="M1 2 L44 31 L87 2 M1 63 L29 35 M87 63 L59 35" fill="none"/>${c.splash?'<path d="M10 -8 L2 -20 M38 -10 V-23 M70 -8 L80 -20" stroke="#91afbe"/>':''}`;
      case 'clip':return '<path d="M8 33 V10 Q8 -1 20 1 Q32 1 32 14 V35 Q32 45 20 44 Q11 44 12 33 V12" fill="none" stroke="#828b88" stroke-width="5"/>';
      case 'bracket':return '<path d="M11 0 V45 Q28 63 45 45 V0 M12 15 H44" fill="none" stroke-width="7" stroke="#a58d66"/>';
      case 'umbrella':return c.attached?'<path d="M4 65 Q98 -15 188 65 Q167 48 143 65 Q118 47 96 65 Q72 47 48 65 Q24 48 4 65 Z" fill="#d6ae6c"/><path d="M96 15 V134 Q96 153 116 141" fill="none" stroke-width="5"/>':'<path d="M45 3 L20 74 L58 80 Z" fill="#d6ae6c"/><path d="M45 4 V99 Q45 116 65 103" fill="none" stroke-width="5"/>';
      case 'basin': {
        const height=c.water*35, surface=165-height;
        return `<path d="M0 0 H390 L368 210 H22 Z" fill="#e2e5d8"/><path d="M21 ${surface} H369 L361 198 H29 Z" fill="#a9c9d0" fill-opacity="${c.water?.85:0}" stroke="none"/><path d="M7 12 H383" fill="none"/>`;
      }
      case 'waterline':return '<path d="M0 9 H350" fill="none" stroke="#618fa8" stroke-dasharray="8 7" stroke-width="3"/>';
      case 'drain':return `<ellipse cx="35" cy="31" rx="31" ry="23" fill="#83877c"/><path d="M15 19 L53 42 M15 42 L53 19 M34 9 V53" stroke="#c3c6b5"/>`;
      case 'tap':return '<path d="M10 21 H56 V36 H87 V63 H58 V53 H12 Z" fill="#c0c7bd"/><path d="M43 20 V6 M24 5 H66" fill="none" stroke-width="7"/><path d="M71 76 L66 92" fill="none" stroke="#83aebe" stroke-width="5"/>';
      case 'cork':return '<path d="M9 6 H49 L43 58 H15 Z" fill="#b89870"/><ellipse cx="29" cy="8" rx="20" ry="7" fill="#d7bc8c"/><path d="M20 27 H25 M34 39 H41 M22 48 H28" stroke="#896e4b"/>';
      case 'boat':return c.soggy?'<path d="M3 22 Q18 4 32 23 L50 10 L68 24 L87 14 L112 25 L93 35 H20 Z" fill="#d7c6a6"/><path d="M18 27 L31 19 M59 25 L73 34" fill="none"/>':'<path d="M3 39 H111 L88 70 H26 Z" fill="#fff8df"/><path d="M21 38 L58 3 L94 38 Z" fill="#e8d6b1"/><path d="M58 3 L59 39 L22 56" fill="none"/>';
      case 'server':return `<rect width="260" height="290" rx="18" fill="#b7c7bc"/><path d="M14 51 H245" fill="none"/>${txt(129,35,'NMAI',19)}<circle cx="84" cy="250" r="6" fill="#3d4741" stroke="none"/><circle cx="169" cy="250" r="6" fill="#3d4741" stroke="none"/><path d="M108 270 ${solved?'Q128 287 148 270':'Q128 253 148 270'}" fill="none"/>${!solved?'<path d="M224 73 Q205 96 226 109 Q245 99 224 73" fill="#b9826f"/>':''}`;
      case 'vent':return '<rect width="206" height="111" rx="7" fill="#69776c"/><path d="M12 18 H194 M12 36 H194 M12 54 H194 M12 72 H194 M12 90 H194" stroke="#c0c7b4" stroke-width="5"/>';
      case 'fan':return '<circle cx="63" cy="48" r="41" fill="none" stroke="#a4b8a6"/><path d="M63 48 Q20 5 60 10 Q80 20 63 48 Q112 11 104 48 Q90 69 63 48 Q105 92 65 88 Q45 74 63 48 Q15 84 21 45 Q39 27 63 48" fill="#c1cbb7"/><circle cx="63" cy="48" r="8" fill="#8a9e88"/><path d="M12 27 Q7 51 21 72 M108 19 Q127 45 113 71" fill="none" stroke="#e0d9b9"/>';
      case 'dial':return `<circle cx="39" cy="39" r="34" fill="#ead8af"/><path d="M39 38 L61 15" stroke-width="6"/><path d="M6 16 Q43 -6 72 24" fill="none" stroke-dasharray="3 5"/>${txt(39,88,'MAX',17)}`;
      case 'sticker':return `<path d="M0 0 H180 V105 L151 132 H0 Z" fill="#d3ab70"/><path d="M151 132 V105 H180" fill="#f3dfb5"/>${txt(89,45,lang==='hu'?'SZUPER':'ULTRA',23)}${txt(89,78,lang==='hu'?'HŰTÉS':'COOL',23)}`;
      case 'cup':return `<path d="M11 18 H78 V78 Q44 104 11 78 Z" fill="#f5f1db"/><path d="M79 27 Q119 21 106 62 Q98 77 79 70" fill="none"/><path d="M0 105 H96" fill="none"/>${pick?'<circle cx="50" cy="121" r="8" fill="#8ba78c" stroke="none"/>':''}`;
      case 'steam':return c.erased?'': '<path d="M32 78 Q7 55 38 43 Q68 24 36 4" fill="none" stroke="#a29e91" stroke-width="2"/><path d="M46 76 Q74 55 54 42" fill="none" stroke="#c3bcaa" stroke-width="1.5"/>';
      case 'leaf':return `<path d="M12 80 Q-1 13 88 3 Q103 68 12 80 Z" fill="#b9c89e"/><path d="M4 92 L79 14 M29 64 L29 36 M49 45 H74" fill="none"/>${pick?'<circle cx="49" cy="94" r="8" fill="#8ba78c" stroke="none"/>':''}`;
      case 'flower':return `<path d="M41 104 V39 M41 75 Q8 49 17 82 L41 89 M41 61 Q77 44 63 75 L41 80" fill="#a4b592"/><path d="M37 30 Q13 31 16 13 Q25 -1 41 13 Q51 -5 66 7 Q78 24 59 33 Q74 50 55 57 Q39 62 35 44 Q14 54 10 35 Q14 23 37 30" fill="#d9aa8e"/><circle cx="42" cy="31" r="11" fill="#e7c66c"/>${pick?'<circle cx="41" cy="112" r="8" fill="#8ba78c" stroke="none"/>':''}`;
      case 'eraser':return '<path d="M0 13 L21 0 H104 V45 L84 57 H0 Z" fill="#d4a49d"/><path d="M44 0 V57 H0 V13 L21 0 Z" fill="#e5d8ba"/><path d="M1 43 H104" fill="none"/>';
      default:return undefined;
    }
  }
  function background(level,state,lang) {
    if(level.id==='p02-owl')return `<rect width="800" height="480" fill="${success(level,state)?'#ced0d7':'#f7f0d9'}"/>${success(level,state)?'<g fill="#faf6df" stroke="none"><circle cx="118" cy="110" r="4"/><circle cx="390" cy="95" r="4"/><circle cx="573" cy="151" r="4"/><circle cx="712" cy="95" r="4"/></g>':''}<path d="M180 95 Q410 95 610 405" fill="none" stroke="#aa9f83" stroke-dasharray="5 9" stroke-width="2"/>`;
    if(level.id==='p16-server'&&success(level,state))return '<path d="M520 236 Q565 214 610 237 M521 263 Q572 240 625 265 M520 291 Q571 275 612 296" fill="none" stroke="#87a6a5" stroke-width="4"/>';
    return '';
  }
  const cases = [
    {levelId:'p02-owl',name:'owl taps before sunset',actions:[{type:'use',id:'owl'},{type:'move',id:'sun',target:'hill',x:620,y:400}],solved:true},
    {levelId:'p02-owl',name:'owl tap is harmless',actions:[{type:'use',id:'owl'}],solved:false},
    {levelId:'p04-fish',name:'right card half turn',actions:[{type:'rotate',id:'cardR'}],solved:true},
    {levelId:'p04-fish',name:'equivalent flip rotation combination',actions:[{type:'flip',id:'cardL'},{type:'rotate',id:'cardL'},{type:'flip',id:'cardR'}],solved:true},
    {levelId:'p04-fish',name:'outward fish not accepted',actions:[{type:'flip',id:'cardL'}],solved:false},
    {levelId:'p03-post',name:'unprotected crossing returns dry then recovers',actions:[{type:'move',id:'trolley',target:'postbox',x:695,y:350},{type:'move',id:'umbrella',target:'bracket',x:242,y:305},{type:'move',id:'trolley',target:'postbox',x:695,y:350}],solved:true},
    {levelId:'p03-post',name:'attach after partial journey before shower',actions:[{type:'move',id:'trolley',x:290,y:350},{type:'move',id:'umbrella',target:'bracket',x:350,y:305},{type:'move',id:'trolley',target:'postbox',x:695,y:350}],solved:true},
    {levelId:'p03-post',name:'unprotected arrival does not count',actions:[{type:'move',id:'trolley',target:'postbox',x:695,y:350}],solved:false},
    {levelId:'p10-boat',name:'fill before placing boat',actions:[{type:'move',id:'cork',target:'drain',x:553,y:358},{type:'use',id:'tap'},{type:'use',id:'tap'},{type:'use',id:'tap'},{type:'move',id:'boat',target:'basin',x:380,y:290}],solved:true},
    {levelId:'p10-boat',name:'boat before cork',actions:[{type:'move',id:'boat',target:'basin',x:380,y:290},{type:'move',id:'cork',target:'drain',x:553,y:358},{type:'use',id:'tap'},{type:'use',id:'tap'},{type:'use',id:'tap'}],solved:true},
    {levelId:'p10-boat',name:'soggy boat recovery without restart',actions:[{type:'move',id:'boat',target:'drain',x:553,y:358},{type:'use',id:'tap'},{type:'lift',id:'boat'},{type:'move',id:'cork',target:'drain',x:553,y:358},{type:'move',id:'boat',target:'basin',x:380,y:290},{type:'use',id:'tap'},{type:'use',id:'tap'},{type:'use',id:'tap'}],solved:true},
    {levelId:'p10-boat',name:'boat stopper is not floating',actions:[{type:'move',id:'boat',target:'drain',x:553,y:358},{type:'use',id:'tap'},{type:'use',id:'tap'},{type:'use',id:'tap'}],solved:false},
    {levelId:'p16-server',name:'maximum dial then peel',actions:[{type:'use',id:'dial'},{type:'peel',id:'sticker'}],solved:true},
    {levelId:'p16-server',name:'dial alone cannot cool',actions:[{type:'use',id:'dial'},{type:'use',id:'dial'}],solved:false},
    {levelId:'p09-cups',name:'select cups before erasure',actions:[{type:'use',id:'cupL'},{type:'use',id:'cupR'},{type:'move',id:'eraser',target:'steam',x:419,y:193}],solved:true},
    {levelId:'p09-cups',name:'reverse cup order',actions:[{type:'move',id:'eraser',target:'steam',x:419,y:193},{type:'use',id:'cupR'},{type:'use',id:'cupL'}],solved:true},
    {levelId:'p09-cups',name:'before erasure not identical',actions:[{type:'use',id:'cupL'},{type:'use',id:'cupR'}],solved:false},
    {levelId:'p09-cups',name:'unrelated drawings not a pair',actions:[{type:'move',id:'eraser',target:'steam',x:419,y:193},{type:'use',id:'leaf'},{type:'use',id:'flower'}],solved:false}
  ];
  return {levels,apply,success,bounds,drawing,background,cases};
});
