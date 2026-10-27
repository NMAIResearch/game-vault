(function (root, factory) {
  'use strict';
  const pack = factory();
  if (typeof module === 'object' && module.exports) module.exports = pack;
  else { root.ThinkAgainPacks = root.ThinkAgainPacks || {}; root.ThinkAgainPacks.b = pack; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const pair = (en, hu) => ({ en, hu });
  const clone = value => JSON.parse(JSON.stringify(value));
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
  const txt = (x, y, value, size = 18, extra = '') => `<text x="${x}" y="${y}" font-size="${size}" stroke="none" fill="#303d36" ${extra}>${esc(value)}</text>`;
  const obj = (id, shape, x, y, w, h, en, hu, kind = 'ink', extra = {}) => ({ id, shape:'b-'+shape, x, y, w, h, label:pair(en,hu), kind, ...extra });
  const step = (en, hu, action) => ({ text:pair(en,hu), action });
  const control = (id, en, hu, action) => ({ id, label:pair(en,hu), action });
  const stars = ['star1','star2','star3','badge'];
  const levels = [
    {
      id:'p15-sum', pack:'b', chapter:3,
      title:pair('A turn for the better','Egy jó fordulat'),
      objective:pair('Make this sum true.','Legyen igaz ez az összeadás.'),
      hints:[pair('Which number looks wrong?','Melyik szám tűnik rossznak?'), pair('A six can look like another number.','A hatos egy másik számnak is látszhat.'), pair('Rotate the last 6 halfway around to make 9.','Forgasd el fél fordulattal az utolsó hatost, hogy kilences legyen.')],
      objects:[
        obj('left','number',160,185,110,145,'Left number card','Bal oldali számkártya','use',{digit:6}),
        obj('plus','symbol',292,220,50,70,'Printed plus sign','Nyomtatott pluszjel','ink',{symbol:'+'}),
        obj('middle','number',355,185,110,145,'Middle number card','Középső számkártya','use',{digit:3}),
        obj('equals','symbol',487,220,50,70,'Printed equals sign','Nyomtatott egyenlőségjel','ink',{symbol:'='}),
        obj('right','number',550,185,110,145,'Last number card','Utolsó számkártya','use',{digit:6})
      ],
      initial:{ rotations:{left:0,middle:0,right:0} },
      test:{type:'custom',objects:['left','middle','right']},
      controls:[control('rotate-left','Rotate left card','Bal kártya forgatása',{type:'rotate',id:'left'}),control('rotate-middle','Rotate middle card','Középső kártya forgatása',{type:'rotate',id:'middle'}),control('rotate-right','Rotate last card','Utolsó kártya forgatása',{type:'rotate',id:'right'})],
      solution:[step('Turn the final card through half a turn: 6 + 3 = 9.','Forgasd el az utolsó kártyát fél fordulattal: 6 + 3 = 9.',{type:'rotate',id:'right'})],
      payoff:pair('The numbers had another side to them.','A számoknak másik oldaluk is volt.')
    },
    {
      id:'p11-count', pack:'b', chapter:3,
      title:pair('Very confident counting','Nagyon magabiztos számolás'),
      objective:pair('Count every star inside the dotted box.','Számold meg az összes csillagot a pontozott keretben.'),
      hints:[pair('What did the robot tick?','Mit pipált ki a robot?'),pair('A star can be worn, too.','Csillagot viselni is lehet.'),pair('Make sure all four stars are ticked, including the badge.','Mind a négy csillag legyen megjelölve, a jelvényen lévő is.')],
      objects:[
        obj('star1','star',145,125,76,84,'Left hanging star','Bal oldali függő csillag'),
        obj('star2','star',290,115,76,84,'Middle hanging star','Középső függő csillag'),
        obj('star3','star',435,125,76,84,'Right hanging star','Jobb oldali függő csillag'),
        obj('robot','counterRobot',520,180,145,165,'Doodle robot','Firkarobot'),
        obj('badge','star',562,245,65,72,'Star badge','Csillagjelvény'),
        obj('answer','answer',145,375,390,64,'Robot answer card','A robot válaszkártyája'),
        obj('done','done',575,375,115,64,'Done','Kész','use')
      ],
      initial:{ticks:['star1','star2','star3'],recounted:false},
      test:{type:'custom',objects:['star1','star2','star3','badge','answer','done']},
      controls:[control('count-done','Done','Kész',{type:'use',id:'done'})],
      solution:[step('Include the star on the robot’s badge in the same set of ticks.','Jelöld meg a robot jelvényén lévő csillagot is.',{type:'use',id:'badge'}),step('Press Done. The robot checks all four stars and changes its answer.','Nyomd meg a Kész gombot. A robot ellenőrzi mind a négy csillagot, és javítja a válaszát.',{type:'use',id:'done'})],
      payoff:pair('Four stars. The robot checks its badge and blushes.','Négy csillag. A robot megnézi a jelvényét, és elpirul.')
    },
    {
      id:'p13-ribbon', pack:'b', chapter:3,
      title:pair('No scissors needed','Nem kell olló'),
      objective:pair('Free the ribbon from the ring. Do not cut the ribbon.','Szabadítsd ki a díszszalagot a gyűrűből. Ne vágd el a szalagot.'),
      hints:[pair('What keeps the ribbon inside the ring?','Mi tartja a szalagot a gyűrűben?'),pair('A little paper tab holds the ring closed.','Egy kis papírfül tartja zárva a gyűrűt.'),pair('Pull the paper tab out of its slot.','Húzd ki a papírfület a nyílásból.')],
      objects:[
        obj('ribbon','ribbon',130,235,540,160,'Fabric ribbon','Díszszalag','move'),
        obj('ring','ring',330,210,140,130,'Stiff card ring','Merev kartongyűrű','move'),
        obj('bookLeft','book',85,220,110,100,'Left printed book','Bal oldali nyomtatott könyv'),
        obj('bookRight','book',605,220,110,100,'Right printed book','Jobb oldali nyomtatott könyv'),
        obj('scissors','scissors',635,105,65,65,'Printed scissors drawing','Nyomtatott ollórajz'),
        obj('tab','tab',425,190,58,58,'Paper tab: open ring','Papírfül: gyűrű kinyitása','use')
      ],
      initial:{open:false,ribbonFree:false},
      test:{type:'custom',objects:['ribbon','ring','tab','bookLeft','bookRight']},
      controls:[control('ring-open','Open ring','Gyűrű kinyitása',{type:'use',id:'tab'}),control('ribbon-clear','Slide ribbon clear','Díszszalag kiszabadítása',{type:'use',id:'ribbon'})],
      solution:[step('Open the join by pulling out its paper tab.','Nyisd ki az illesztést a papírfül kihúzásával.',{type:'use',id:'tab'}),step('Ease the middle of the ribbon clear of the open ring. The ends stay under the books.','Emeld ki a díszszalag közepét a nyitott gyűrűből. A végek a könyvek alatt maradnak.',{type:'use',id:'ribbon'})],
      payoff:pair('An open join, an uncut ribbon.','Nyitott illesztés, sértetlen díszszalag.')
    },
    {
      id:'p12-recipe', pack:'b', chapter:3,
      title:pair('Just like the menu','Pont, mint az étlapon'),
      objective:pair('Help the bear make a new cake that matches the menu.','Segíts a macinak olyan új tortát készíteni, amilyen az étlapon látható.'),
      hints:[pair('Does the cake match the menu?','Olyan a torta, mint az étlapon?'),pair('Look at the cut edge of the recipe card.','Nézd meg a receptkártya vágott szélét.'),pair('Join the two halves of the recipe card.','Illeszd össze a receptkártya két felét.')],
      objects:[
        obj('menu','menu',80,100,155,130,'Printed menu: three cherries','Nyomtatott étlap: három cseresznye'),
        obj('fridge','fridge',580,100,165,255,'Fridge door','Hűtőajtó'),
        obj('oven','oven',420,320,125,95,'Oven','Sütő'),
        obj('bear','bear',160,215,155,160,'Paper bear chef','Papírmaci szakács'),
        obj('cake','cake',185,290,130,82,'Bear’s cake','A maci tortája'),
        obj('top','recipeTop',350,225,130,85,'Top recipe half: two cherries','Felső receptrész: két cseresznye','move'),
        obj('bottom','recipeBottom',610,180,130,75,'Lower recipe half: one more cherry','Alsó receptrész: még egy cseresznye','move'),
        obj('magnet','magnet',653,152,40,40,'Fridge magnet','Hűtőmágnes')
      ],
      initial:{joined:false,baked:false},
      test:{type:'custom',objects:['top','bottom','bear','cake','menu']},
      solution:[step('Bring the lower recipe half to the matching top half. Two cherries, plus one more.','Illeszd az alsó receptrészt a hozzá tartozó felső részhez. Két cseresznye, és még egy.',{type:'move',id:'bottom',target:'top',x:415,y:267.5})],
      payoff:pair('A complete recipe. A new cake with three cherries.','Teljes recept. Új torta három cseresznyével.')
    },
    {
      id:'p17-balance', pack:'b', chapter:3,
      title:pair('A different balance','Másféle egyensúly'),
      objective:pair('Balance the beam without taking anything off.','Egyensúlyozd ki a rudat anélkül, hogy levennél róla bármit.'),
      hints:[pair('The fruit can stay where it is.','A gyümölcsök maradhatnak a helyükön.'),pair('The triangle has a sliding grip.','A háromszögön csúsztató fogantyú van.'),pair('Slide the support towards the pear until the beam is level.','Csúsztasd a támaszt a körte felé, amíg a rúd vízszintbe kerül.')],
      objects:[
        obj('rail','rail',150,402,500,30,'Marked sliding rail','Megjelölt csúszósín'),
        obj('beam','beam',160,300,480,100,'Beam with fixed fruit','Rúd rögzített gyümölcsökkel'),
        obj('pear','pear',185,230,90,105,'Fixed paper pear','Rögzített papírkörte'),
        obj('plum','plum',550,255,65,75,'Fixed paper plum','Rögzített papírszilva'),
        obj('support','support',410,330,90,80,'Triangular sliding support','Csúsztatható háromszögletű támasz','move')
      ],
      initial:{},
      test:{type:'custom',objects:['support','beam','pear','plum']},
      solution:[step('Move the support towards the pear. The fruit stays attached while the beam levels.','Csúsztasd a támaszt a körte felé. A gyümölcsök a rúdon maradnak, miközben az vízszintbe kerül.',{type:'move',id:'support',x:300,y:370})],
      payoff:pair('The same fruit. A different point of balance.','Ugyanazok a gyümölcsök. Másik egyensúlyi pont.')
    }
  ];
  function custom(level, state) { return state.custom || clone(level.initial || {}); }
  function angle(state, id) { return ((state.custom.rotations[id] || 0) % 360 + 360) % 360; }
  function allTicked(state) {
    return Array.isArray(state.custom.ticks) && state.custom.ticks.length === 4 &&
      new Set(state.custom.ticks).size === 4 && stars.every(id => state.custom.ticks.includes(id));
  }
  function beamSlope(state) {
    const x = state.objects.support.x + state.objects.support.w / 2;
    return Math.abs(x - 300) <= 35 ? 0 : clamp((300 - x) / 650, -.18, .18);
  }
  function ribbonClear(state) {
    const ring = state.objects.ring, ribbon = state.objects.ribbon;
    const middleY = ribbon.y + (state.custom.ribbonFree ? 140 : 45);
    return state.custom.open && (state.custom.ribbonFree || ring.y + ring.h < middleY - 12 ||
      ring.y > middleY + 12 || ring.x + ring.w < ribbon.x + 30 || ring.x > ribbon.x + ribbon.w - 30);
  }
  function success(level, state) {
    if (!state.custom) return false;
    if (level.id === 'p15-sum') {
      const left = angle(state,'left') === 0 ? 6 : angle(state,'left') === 180 ? 9 : NaN;
      const middle = angle(state,'middle') === 0 ? 3 : NaN;
      const right = angle(state,'right') === 0 ? 6 : angle(state,'right') === 180 ? 9 : NaN;
      return left + middle === right;
    }
    if (level.id === 'p11-count') return state.custom.recounted && allTicked(state);
    if (level.id === 'p13-ribbon') return ribbonClear(state);
    if (level.id === 'p12-recipe') return state.custom.joined && state.custom.baked;
    if (level.id === 'p17-balance') return beamSlope(state) === 0;
    return false;
  }
  function move(o, action) {
    if (action.type === 'nudge') {
      if (!Number.isFinite(action.dx) || !Number.isFinite(action.dy)) return false;
      o.x = clamp(o.x + action.dx,35,765-o.w); o.y = clamp(o.y + action.dy,85,425-o.h);
    } else {
      if (!Number.isFinite(action.x) || !Number.isFinite(action.y)) return false;
      o.x = clamp(action.x-o.w/2,35,765-o.w); o.y = clamp(action.y-o.h/2,85,425-o.h);
    }
    return true;
  }
  function recipePresent(state) {
    const top = state.objects.top, bear = state.objects.bear;
    return Math.abs(top.x + top.w/2 - bear.x - bear.w/2) < 215 && top.y >= 85 && top.y <= 310;
  }
  function apply(level, state, action, final = true) {
    state.custom = state.custom || clone(level.initial || {});
    const o = state.objects[action.id], c = state.custom;
    if (!o) return state;
    if (action.type === 'select' || action.type === 'release') return undefined;
    if (level.id === 'p15-sum') {
      if (o.shape === 'b-number') {
        if (final && ['use','rotate','nudge'].includes(action.type)) {
          c.rotations[o.id] = (angle(state,o.id)+180)%360;
          state.feedback = pair('A half-turn. What does the sum say now?','Fél fordulat. Mit mutat most az összeadás?');
        } else state.feedback = pair('The cards stay in their slots. They can turn.','A kártyák a helyükön maradnak. Forgatni lehet őket.');
      } else state.feedback = 'ink';
      return state;
    }
    if (level.id === 'p11-count') {
      if (stars.includes(o.id) && final && action.type === 'use') {
        const at = c.ticks.indexOf(o.id);
        if (at < 0) c.ticks.push(o.id); else c.ticks.splice(at,1);
        c.recounted = false;
        state.feedback = pair('The pencil tick changes. Count the whole box.','A ceruzával tett jel megváltozik. Számold végig a teljes keretet.');
      } else if (o.id === 'done' && final && action.type === 'use') {
        c.recounted = allTicked(state);
        state.feedback = c.recounted ? pair('I counted four!','Négyet számoltam!') : pair('The robot looks again. There is still something to check.','A robot újra körülnéz. Még van mit ellenőrizni.');
      } else state.feedback = 'ink';
      return state;
    }
    if (level.id === 'p13-ribbon') {
      if (o.id === 'tab') {
        if (final) c.open = true;
        state.feedback = pair('The paper tab is out. The stiff ring is open.','A papírfül kicsúszott. A merev gyűrű kinyílt.');
      } else if (o.id === 'ribbon') {
        if (!c.open) state.feedback = pair('The books hold the ends; the closed ring keeps the ribbon in.','A könyvek tartják a végeket; a zárt gyűrű fogja a díszszalagot.');
        else {
          if (final && ['use','move','nudge'].includes(action.type)) c.ribbonFree = true;
          state.feedback = pair('The ribbon bends clear; both ends stay pinned.','A díszszalag kihajlik; mindkét vége rögzítve marad.');
        }
      } else if (o.id === 'ring') {
        if (!c.open) {
          state.feedback = pair('The stiff card ring wobbles. Its join stays shut.','A merev kartongyűrű megremeg. Az illesztés zárva marad.');
          state.effect = {type:'wobble',id:'ring'};
        }
        else if (['move','nudge'].includes(action.type)) { move(o,action); state.feedback = 'move'; }
        else state.feedback = pair('The join is open. Move the ring or ease the ribbon clear.','Az illesztés nyitva van. Mozdítsd el a gyűrűt, vagy emeld ki a díszszalagot.');
      } else state.feedback = 'ink';
      return state;
    }
    if (level.id === 'p12-recipe') {
      if (['top','bottom'].includes(o.id) && ['move','nudge'].includes(action.type)) {
        const old = { x:o.x,y:o.y };
        if (!move(o,action)) return state;
        const top = state.objects.top, bottom = state.objects.bottom;
        if (c.joined) {
          const other = state.objects[o.id === 'top' ? 'bottom' : 'top'];
          other.x += o.x-old.x; other.y += o.y-old.y;
          if (final && (action.target === 'bear' || recipePresent(state))) c.baked = true;
        } else if (final) {
          const near = Math.abs(top.x + top.w/2-bottom.x-bottom.w/2) <= 90 &&
            Math.abs(top.y + top.h/2-bottom.y-bottom.h/2) <= 115;
          const toBear = o.id === 'bottom' && action.target === 'bear';
          if (near || action.target === (o.id === 'top' ? 'bottom' : 'top') || toBear) {
            if (toBear) { top.x=335; top.y=200; }
            else if (o.id === 'top') { top.x=bottom.x; top.y=bottom.y-top.h; }
            bottom.x=top.x; bottom.y=top.y+top.h;
            c.joined=true;
            if (recipePresent(state)) c.baked=true;
          }
        }
        state.feedback = c.baked ? pair('Two cherries, plus one more. The bear bakes a new cake.','Két cseresznye, és még egy. A maci új tortát süt.') : c.joined ? pair('The card is whole. Bring it to the bear.','A kártya teljes. Vidd a macihoz.') : pair('The cut edges belong together.','A vágott szélek összeillenek.');
      } else if (['cake','menu','oven','bear'].includes(o.id)) {
        state.feedback = pair('The bear points at the recipe card. Nothing is taken from the menu.','A maci a receptkártyára mutat. Az étlapról semmi sem vehető le.');
        state.effect = {type:'wobble',id:'bear'};
      }
      else state.feedback = 'ink';
      return state;
    }
    if (level.id === 'p17-balance') {
      if (o.id === 'support' && ['move','nudge'].includes(action.type)) {
        const x = action.type === 'nudge' ? o.x+o.w/2+action.dx : action.x;
        if (Number.isFinite(x)) { o.x=clamp(x,210,590)-o.w/2; o.y=330; }
        state.feedback = pair('The support slides. The fruit stays on the beam.','A támasz csúszik. A gyümölcsök a rúdon maradnak.');
      } else state.feedback = pair('The fruit is fixed to the beam. The triangle has a grip.','A gyümölcsök a rúdhoz vannak rögzítve. A háromszögön fogantyú van.');
      return state;
    }
    return undefined;
  }
  function bounds(level, state, id) {
    const o = state.objects[id];
    if (!o) return undefined;
    if (level.id === 'p13-ribbon' && id === 'tab') {
      const ring = state.objects.ring;
      return { ...o, x:ring.x+95+(state.custom.open?26:0), y:ring.y-20-(state.custom.open?20:0) };
    }
    if (level.id === 'p17-balance' && ['pear','plum'].includes(id)) {
      const anchor = id === 'pear' ? 230 : 582.5;
      const pivot = state.objects.support.x+state.objects.support.w/2;
      return { ...o, y:330+(anchor-pivot)*beamSlope(state)-o.h };
    }
    return undefined;
  }
  function starPath(w,h) {
    const out=[];
    for(let i=0;i<10;i++) {
      const radius=i%2?Math.min(w,h)*.21:Math.min(w,h)*.46;
      const a=-Math.PI/2+i*Math.PI/5;
      out.push((i?'L':'M')+(w/2+Math.cos(a)*radius).toFixed(2)+' '+(h/2+Math.sin(a)*radius).toFixed(2));
    }
    return out.join(' ')+' Z';
  }
  function cherry(x,y,r=8) {
    return `<path d="M${x} ${y} Q${x-2} ${y-17} ${x+10} ${y-20}" fill="none" stroke="#587449" stroke-width="2"/><circle cx="${x}" cy="${y}" r="${r}" fill="#be705e"/>`;
  }
  function cake(count,w=130,h=82) {
    let out=`<path d="M8 ${h-8} H${w-8} M15 ${h-13} V${h*.45} Q${w/2} ${h*.3} ${w-15} ${h*.45} V${h-13} Z" fill="#dfba87"/><path d="M15 ${h*.45} Q${w/2} ${h*.25} ${w-15} ${h*.45} L${w-15} ${h*.57} Q${w/2} ${h*.4} 15 ${h*.57} Z" fill="#fff4d8"/>`;
    for(let i=0;i<count;i++)out+=cherry(w/2+(i-(count-1)/2)*25,h*.28,7);
    return out;
  }
  function drawing(o, state, solved, ui, lang, level) {
    const c = custom(level,state);
    switch(o.shape) {
      case 'b-number': {
        const r=angle(state,o.id);
        let glyph;
        if(o.digit===6) glyph='<path d="M77 35 C55 14 28 35 29 77 C30 119 81 124 82 87 C83 49 29 52 29 86" fill="none" stroke="#303d36" stroke-width="8"/>';
        else glyph=txt(55,106,'3',100,'text-anchor="middle" font-family="Georgia,serif"');
        return `<rect width="110" height="145" rx="5" fill="#ead5a9"/><path d="M8 137 H102" stroke="#c7ae7e"/><g transform="rotate(${r} 55 72.5)">${glyph}</g><path d="M84 6 H104 V26 Z" fill="#fff8e8"/>`;
      }
      case 'b-symbol': return txt(o.w/2,54,o.symbol,54,'text-anchor="middle"');
      case 'b-star': return `<path d="${starPath(o.w,o.h)}" fill="#e0bd69"/>${c.ticks.includes(o.id)?`<path d="M${o.w*.27} ${o.h*.5} L${o.w*.44} ${o.h*.67} L${o.w*.75} ${o.h*.3}" fill="none" stroke="#45694f" stroke-width="5"/>`:''}`;
      case 'b-counterRobot': return `<path d="M29 140 L17 163 M116 140 L128 163" fill="none" stroke-width="7"/><rect x="10" width="125" height="145" rx="20" fill="#aebfb6"/><path d="M55 0 V-12 H89 V0" fill="none"/><rect x="27" y="22" width="92" height="49" rx="9" fill="#faf4d7"/><circle cx="53" cy="43" r="4" fill="#303d36"/><circle cx="93" cy="43" r="4" fill="#303d36"/><path d="M52 58 ${c.recounted?'Q73 72 95 58':'H95'}" fill="none"/>${c.recounted?'<circle cx="31" cy="80" r="8" fill="#d98d7a" stroke="none"/><circle cx="113" cy="80" r="8" fill="#d98d7a" stroke="none"/>':''}`;
      case 'b-answer': return `<rect width="${o.w}" height="${o.h}" rx="4" fill="#f1e7ce"/>${txt(o.w/2,41,lang==='hu'?(c.recounted?'Négyet számoltam!':'Hármat számoltam!'):(c.recounted?'I counted four!':'I counted three!'),23,'text-anchor="middle"')}`;
      case 'b-done': return `<rect width="${o.w}" height="${o.h}" rx="7" fill="#abc19c"/>${txt(o.w/2,41,lang==='hu'?'Kész':'Done',22,'text-anchor="middle"')}`;
      case 'b-ribbon': {
        const middle=c.ribbonFree?140:45;
        return `<path d="M0 45 C145 45 190 ${middle} 270 ${middle} S420 45 540 45" fill="none" stroke="#a36e72" stroke-width="31"/><path d="M0 45 C145 45 190 ${middle} 270 ${middle} S420 45 540 45" fill="none" stroke="#d5a4a5" stroke-width="23"/><path d="M7 36 H65 M475 36 H533" stroke="#e4c1bb"/>`;
      }
      case 'b-ring': return c.open ? '<path d="M108 15 C61 -10 11 15 11 63 C11 118 105 135 128 82" fill="none" stroke="#7f795e" stroke-width="23"/><path d="M108 15 C61 -10 11 15 11 63 C11 118 105 135 128 82" fill="none" stroke="#e1d5b4" stroke-width="17"/>' : '<ellipse cx="70" cy="65" rx="59" ry="53" fill="none" stroke="#7f795e" stroke-width="23"/><ellipse cx="70" cy="65" rx="59" ry="53" fill="none" stroke="#e1d5b4" stroke-width="17"/><path d="M106 15 L123 32" stroke="#817d6a"/>';
      case 'b-tab': return `<path d="M8 14 L48 4 L52 42 L14 51 Z" fill="${c.open?'#e5c791':'#c9ae7c'}"/><path d="M19 18 L41 13 M20 25 L42 20" stroke="#897349"/>`;
      case 'b-book': return '<path d="M4 10 L95 0 L109 83 L17 96 Z" fill="#a3b5a5"/><path d="M17 96 L19 85 L109 73 V83 Z" fill="#f5edda"/><path d="M17 12 L27 78 M31 17 L80 12 M34 24 L82 19" fill="none"/>';
      case 'b-scissors': return '<g fill="none" stroke="#a2a196"><circle cx="16" cy="43" r="11"/><circle cx="42" cy="47" r="11"/><path d="M23 33 L48 3 M35 36 L17 4"/></g>';
      case 'b-fridge': return '<rect width="165" height="255" rx="10" fill="#c3d1cd"/><path d="M0 93 H165 M138 37 V75 M138 123 V174" fill="none"/><path d="M13 253 V264 M152 253 V264" stroke-width="6"/>';
      case 'b-magnet': return '<path d="M5 3 H35 V18 Q35 40 20 40 Q5 40 5 18 Z" fill="#bf8274"/><path d="M12 3 V19 Q12 30 20 30 Q28 30 28 19 V3" fill="#eee8d5"/>';
      case 'b-oven': return '<rect width="125" height="95" rx="6" fill="#b7bfbc"/><circle cx="25" cy="15" r="5" fill="#e7ca8e"/><circle cx="48" cy="15" r="5" fill="#e7ca8e"/><rect x="14" y="33" width="96" height="51" rx="6" fill="#626e68"/><path d="M29 43 H96" stroke="#e8e4d7"/>';
      case 'b-bear': return '<circle cx="37" cy="33" r="22" fill="#c5a17e"/><circle cx="122" cy="33" r="22" fill="#c5a17e"/><path d="M39 72 Q22 100 28 150 H133 Q140 100 116 73" fill="#d8bd9b"/><ellipse cx="80" cy="58" rx="53" ry="43" fill="#d5b18c"/><ellipse cx="80" cy="75" rx="24" ry="17" fill="#e4ceb1"/><circle cx="58" cy="51" r="4" fill="#303d36"/><circle cx="101" cy="51" r="4" fill="#303d36"/><path d="M73 69 L80 75 L88 69 M80 75 V83" fill="none"/><path d="M37 27 L34 7 Q10 -3 27 -19 Q42 -32 56 -16 Q65 -40 86 -22 Q106 -32 117 -12 Q137 -8 125 9 L122 27 Z" fill="#fff9e9"/>';
      case 'b-cake': return cake(c.baked?3:2,o.w,o.h);
      case 'b-menu': return `<rect width="155" height="130" rx="3" fill="#eadab7"/>${txt(77.5,24,lang==='hu'?'ÉTLAP':'MENU',16,'text-anchor="middle"')}<g transform="translate(12 33)">${cake(3,130,82)}</g>`;
      case 'b-recipeTop': return `<path d="M0 0 H130 V85 H0 Z" fill="#fff7e4"/><path d="M0 83 H130" stroke-dasharray="4 5"/>${txt(65,23,lang==='hu'?'RECEPT':'RECIPE',15,'text-anchor="middle"')}${cherry(45,57,8)}${cherry(82,57,8)}`;
      case 'b-recipeBottom': return `<rect width="130" height="75" fill="#fff7e4"/><path d="M0 2 H130" stroke-dasharray="4 5"/>${txt(32,48,'+',34,'text-anchor="middle"')}${cherry(83,43,10)}`;
      case 'b-rail': return '<path d="M0 12 H500 M10 3 V22 M490 3 V22" fill="none" stroke="#aaa993"/><path d="M30 6 V18 M80 6 V18 M130 6 V18 M180 6 V18 M230 6 V18 M280 6 V18 M330 6 V18 M380 6 V18 M430 6 V18" stroke="#c4bfab"/>';
      case 'b-beam': {
        const pivot=state.objects.support.x+45, slope=beamSlope(state);
        const left=30+(160-pivot)*slope, right=30+(640-pivot)*slope;
        return `<path d="M0 ${left-9} L480 ${right-9} V${right+9} L0 ${left+9} Z" fill="#ba9f79"/><path d="M10 ${left-4} L470 ${right-4}" fill="none" stroke="#dac59d"/>`;
      }
      case 'b-pear': return '<path d="M42 20 C21 17 33 44 16 58 C-5 89 18 104 46 103 C86 103 98 83 76 56 C59 39 63 20 42 20 Z" fill="#d5bf75"/><path d="M45 23 Q41 4 55 1" fill="none"/><path d="M50 9 Q82 -2 79 15 Q61 25 50 9" fill="#9fb285"/>';
      case 'b-plum': return '<path d="M29 16 Q-2 19 5 46 Q8 74 34 73 Q66 68 59 38 Q57 11 29 16" fill="#a494b0"/><path d="M32 18 L35 3 M39 14 Q57 -2 60 11 Q55 23 39 14" fill="#9aaf8b"/>';
      case 'b-support': return '<path d="M45 0 L90 78 H0 Z" fill="#c9b27b"/><circle cx="45" cy="50" r="17" fill="#fff5dc"/><path d="M33 50 H57 M38 45 L33 50 L38 55 M52 45 L57 50 L52 55" fill="none" stroke-width="2"/>';
      default:return undefined;
    }
  }
  function background(level,state) {
    if(level.id==='p15-sum')return '<path d="M146 344 H284 M341 344 H479 M536 344 H674" stroke="#aaa48e" stroke-width="2" fill="none"/>';
    if(level.id==='p11-count')return '<rect x="100" y="90" width="600" height="265" rx="12" fill="#f3efdd" stroke="#a6aa93" stroke-dasharray="5 8" stroke-width="2"/><path d="M183 91 V129 M328 91 V118 M473 91 V129" stroke="#a6aa93" fill="none"/>';
    return '';
  }
  const cases = [
    {level_id:'p15-sum',name:'right half-turn',actions:[{type:'rotate',id:'right'}],solved:true},
    {level_id:'p15-sum',name:'wrong digit then recover',actions:[{type:'rotate',id:'middle'},{type:'rotate',id:'right'},{type:'rotate',id:'middle'}],solved:true},
    {level_id:'p15-sum',name:'repeated invalid final turns',actions:[{type:'rotate',id:'right'},{type:'rotate',id:'right'}],solved:false},
    {level_id:'p15-sum',name:'fixed cards reject moving',actions:[{type:'move',id:'left',x:600,y:250}],solved:false},
    {level_id:'p11-count',name:'add just missing badge',actions:[{type:'use',id:'badge'},{type:'use',id:'done'}],solved:true},
    {level_id:'p11-count',name:'initial three is not enough',actions:[{type:'use',id:'done'}],solved:false},
    {level_id:'p11-count',name:'all four without Done not yet recounted',actions:[{type:'use',id:'badge'}],solved:false},
    {level_id:'p11-count',name:'toggle and remark in another order',actions:[{type:'use',id:'star1'},{type:'use',id:'star2'},{type:'use',id:'star3'},{type:'use',id:'badge'},{type:'use',id:'star2'},{type:'use',id:'star1'},{type:'use',id:'star3'},{type:'use',id:'done'}],solved:true},
    {level_id:'p11-count',name:'wrong Done then repair',actions:[{type:'use',id:'star1'},{type:'use',id:'done'},{type:'use',id:'badge'},{type:'use',id:'star1'},{type:'use',id:'done'}],solved:true},
    {level_id:'p13-ribbon',name:'tab then ribbon',actions:[{type:'use',id:'tab'},{type:'use',id:'ribbon'}],solved:true},
    {level_id:'p13-ribbon',name:'tab then move ring clear',actions:[{type:'use',id:'tab'},{type:'move',id:'ring',x:400,y:150}],solved:true},
    {level_id:'p13-ribbon',name:'closed stiff ring does not tear',actions:[{type:'move',id:'ring',x:400,y:150},{type:'use',id:'ribbon'}],solved:false},
    {level_id:'p13-ribbon',name:'wrong pull then recovery',actions:[{type:'move',id:'ring',x:300,y:150},{type:'use',id:'tab'},{type:'nudge',id:'ring',dx:0,dy:-96}],solved:true},
    {level_id:'p12-recipe',name:'lower half onto top',actions:[{type:'move',id:'bottom',target:'top',x:415,y:267.5}],solved:true},
    {level_id:'p12-recipe',name:'lower half offered to bear',actions:[{type:'move',id:'bottom',target:'bear',x:237.5,y:295}],solved:true},
    {level_id:'p12-recipe',name:'join on fridge then present',actions:[{type:'move',id:'top',target:'bottom',x:675,y:217.5},{type:'move',id:'top',target:'bear',x:330,y:230}],solved:true},
    {level_id:'p12-recipe',name:'join away is not already delivered',actions:[{type:'move',id:'top',target:'bottom',x:675,y:217.5}],solved:false},
    {level_id:'p12-recipe',name:'cake and menu cannot donate cherries',actions:[{type:'use',id:'cake'},{type:'use',id:'menu'},{type:'use',id:'oven'}],solved:false},
    {level_id:'p12-recipe',name:'wrong cake then recovery',actions:[{type:'use',id:'cake'},{type:'move',id:'bottom',target:'top',x:415,y:267.5}],solved:true},
    {level_id:'p17-balance',name:'support near left end of stable band',actions:[{type:'move',id:'support',x:270,y:100}],solved:true},
    {level_id:'p17-balance',name:'support near right end of stable band',actions:[{type:'move',id:'support',x:330,y:420}],solved:true},
    {level_id:'p17-balance',name:'support towards plum is wrong',actions:[{type:'move',id:'support',x:570,y:350}],solved:false},
    {level_id:'p17-balance',name:'fruit try then keyboard support recovery',actions:[{type:'move',id:'pear',x:600,y:100},...Array.from({length:6},()=>({type:'nudge',id:'support',dx:-24,dy:0}))],solved:true}
  ];
  return { levels, apply, success, bounds, drawing, background, cases };
});
