(function (root, factory) {
  'use strict';
  const api = factory(typeof module === 'object' && module.exports ? require('./core.js') : root.ThinkAgain);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ThinkAgainRender = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (C) {
  'use strict';
  const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[ch]);
  const rect = (r, attrs = '') => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" ${attrs}/>`;
  const text = (x,y,s,attrs='') => `<text x="${x}" y="${y}" stroke="none" ${attrs}>${esc(s)}</text>`;
  function drawing(o, state, solved, ui, lang) {
    const t = key => ui[key][lang];
    switch (o.shape) {
      case 'elephant': return '<path fill="#a7b9ce" d="M20 52 Q11 16 50 18 Q87 4 114 35 Q142 30 142 60 L142 92 Q138 113 116 102 L120 85 Q131 91 130 72 L116 68 L112 122 L86 122 L84 92 L57 91 L54 122 L28 122 L28 85 Q5 88 6 66 Z"/><path fill="#c5d2e1" d="M72 40 Q40 13 38 48 Q33 77 65 78 Z"/><circle cx="116" cy="47" r="3.3" fill="#243545"/><path d="M16 56 Q-1 39 3 33" fill="none"/><path d="M32 117 H50 M89 117 H108"/>';
      case 'frame': return `<path d="M-13 -13 H${o.w+13} V${o.h+13} H-13 Z M0 0 H${o.w} V${o.h} H0 Z" fill="#e6b075" fill-rule="evenodd"/><path d="M-8 -7 L${o.w+8} -7 M${o.w+7} 0 V${o.h+6} M0 ${o.h+7} H${o.w}" stroke="#a06b3e" fill="none"/>`;
      case 'grip': return '<circle cx="26" cy="26" r="14" fill="#faf6eb"/><circle cx="26" cy="26" r="4" fill="#bf684d" stroke="none"/>';
      case 'path': return '<path d="M0 22 Q180 8 330 22 T670 22" fill="none" stroke-dasharray="3 12" stroke="#8b887d"/>';
      case 'snail': return '<path d="M7 70 Q18 49 58 56 L111 57 L122 37 Q133 23 135 38 L137 71 Q123 85 20 82 Z" fill="#c7d49c"/><circle cx="57" cy="39" r="36" fill="#e8b992"/><path d="M63 62 C21 69 20 9 60 15 C88 17 88 50 60 51 C38 50 44 26 61 31" fill="none"/><path d="M123 37 L120 15 M133 37 L138 18"/><circle cx="119" cy="14" r="4" fill="#29382f"/><circle cx="138" cy="17" r="4" fill="#29382f"/><path d="M122 57 Q129 63 135 55" fill="none"/>';
      case 'finish': return `<path d="M43 28 L48 123 H68 L61 28" fill="#d6b68b"/><rect x="0" y="3" width="100" height="49" rx="4" fill="#d48a75"/>${text(50,34,t('finishSign'),'text-anchor="middle" font-size="17" font-weight="700"')}<path d="M30 117 H80"/><circle cx="56" cy="80" r="12" fill="#fff9e9"/>`;
      case 'desk': return '<path d="M0 0 H380 V18 H0 Z" fill="#cfad87"/><path d="M32 19 L24 70 M344 19 L354 70" fill="none" stroke-width="8"/><path d="M255 -95 L370 -86 L359 0 L250 -4 Z" fill="#fffcf1"/>';
      case 'robot': return `<path d="M40 115 L24 166 M201 115 L220 165" stroke-width="9"/><rect x="12" y="0" width="216" height="151" rx="24" fill="#b5c7bc"/><path d="M87 0 V-14 H143 V0" fill="none"/><circle cx="60" cy="120" r="9" fill="#dba780"/><circle cx="182" cy="120" r="9" fill="#dba780"/>${solved ? '<path d="M75 100 Q120 128 166 100" fill="none"/>' : '<path d="M78 105 H162" fill="none"/>'}`;
      case 'screen': return `<rect width="160" height="48" rx="7" fill="#f6f2d6"/>${text(80,29,t(solved?'awake':'thinking'),`text-anchor="middle" font-size="${lang==='hu'?12:15}"`)} `;
      case 'harder': return `<rect width="190" height="56" rx="9" fill="#cf8b73"/>${text(95,34,t('harder'),`text-anchor="middle" font-size="${lang==='hu'?12:17}" font-weight="700"`)}`;
      case 'battery': return `<rect width="59" height="33" rx="3" fill="#fffcf1"/><path d="M60 10 H68 V23 H60" fill="#6c7965"/>${solved?'<rect x="6" y="6" width="47" height="21" fill="#8fa784" stroke="none"/>':'<path d="M9 24 L16 10 L24 24" fill="none" stroke="#b56d52"/>'}`;
      case 'socket': return '<rect width="80" height="86" rx="12" fill="#ebe4d6"/><circle cx="40" cy="43" r="28" fill="#fffaf0"/><path d="M29 35 V46 M51 35 V46" stroke-width="6"/>';
      case 'plug': return '<path d="M10 13 V0 M46 13 V0" stroke-width="5"/><path d="M3 14 H55 V36 Q30 54 3 36 Z" fill="#d7b866"/><path d="M20 46 V50"/>';
      case 'flower': return solved ? '<path d="M35 72 L37 27 M36 55 Q9 36 20 60 L35 66 M36 48 Q65 31 52 56 L37 61" fill="#9eb68b"/><path d="M34 20 C12 8 15 -5 33 6 C41 -11 59 -3 48 13 C71 13 68 35 48 28 C51 49 27 45 30 29 C11 37 7 18 28 18 Z" fill="#d89278"/><circle cx="38" cy="19" r="8" fill="#e8c565"/>' : '<path d="M13 59 Q35 54 57 63" fill="none" stroke="#c7c1b4"/>';
      case 'littleTree': case 'tallTree': return `<path d="M${o.w*.48} ${o.h*.45} L${o.w*.46} ${o.h} L${o.w*.64} ${o.h} L${o.w*.6} ${o.h*.4}" fill="#b99070"/><path d="M${o.w*.5} 3 Q${o.w*.08} 9 6 ${o.h*.37} Q-3 ${o.h*.66} ${o.w*.35} ${o.h*.64} Q${o.w*.6} ${o.h*.86} ${o.w*.81} ${o.h*.61} Q${o.w*1.05} ${o.h*.65} ${o.w*.95} ${o.h*.34} Q${o.w*.93} 6 ${o.w*.5} 3 Z" fill="${o.shape==='littleTree'?'#9ebc9a':'#bdc7a2'}"/><path d="M${o.w*.53} ${o.h*.7} L${o.w*.35} ${o.h*.49} M${o.w*.53} ${o.h*.57} L${o.w*.73} ${o.h*.35}" fill="none"/>`;
      case 'guide': return `<path d="M16 0 V62 M4 5 L16 -5 L28 5" fill="none" stroke-dasharray="4 5"/>`;
      case 'shadow': return `<path d="M0 0 Q${o.w*.6} -9 ${o.w} 12 Q${o.w*.6} 28 0 17 Z" fill="#777d72" fill-opacity=".27" stroke="#777d72"/>`;
      case 'lamp': return '<path d="M14 65 H65 M38 63 L47 40 L26 17" fill="none" stroke-width="5"/><path d="M4 28 L17 5 L40 5 L53 28 Z" fill="#d9bd69"/><path d="M9 32 H48" stroke="#d9a243" stroke-width="4"/>';
      case 'cat': return `<path d="M18 118 Q10 93 27 76 L27 45 L13 8 L40 23 Q48 17 58 23 L80 8 L75 50 Q84 71 62 80 Q80 89 73 119 Z" fill="${o.id==='leftCat'?'#d6a67f':'#9caeb4'}"/><path d="M68 108 Q94 101 82 83" fill="none" stroke-width="7"/><path d="M28 117 L43 115 L44 96 M55 98 L56 117 H69" fill="none"/><circle cx="37" cy="47" r="2.5" fill="#29382f"/><circle cx="60" cy="47" r="2.5" fill="#29382f"/><path d="M44 58 L49 62 L54 57 M49 62 V69 M25 60 L8 57 M26 66 L7 70 M68 60 L85 56 M69 66 L87 70" fill="none"/>`;
      case 'strip': return `${state.folded?'':`<rect x="-7" width="${o.w+14}" height="${o.h}" fill="#f0dfac" fill-opacity=".52" stroke="none"/>`}<path d="M0 0 V${o.h} M${o.w} 0 V${o.h}" stroke-dasharray="4 8"/><circle cx="${o.w/2}" cy="${o.h/2}" r="18" fill="#fff9ea"/>${text(o.w/2,o.h/2+7,'↔','text-anchor="middle" font-size="23"')}`;
      default: return '';
    }
  }
  function scene(level, state, lang, ui, options = {}) {
    const solved = C.success(level, state), t = k => ui[k][lang];
    let markup = '<defs><pattern id="paper-dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".65" fill="#c0b9a9" opacity=".4"/></pattern></defs><rect width="800" height="480" fill="url(#paper-dots)"/>';
    const pack = C.packFor(level);
    markup += pack?.background?.(level,state,lang,C) || '';
    if (level.test.type === 'cats') {
      const p = level.paper, g = C.catLayout(level, state);
      if (!state.folded) markup += rect(p,'fill="#fff9e7" stroke="#b5a991" stroke-width="2"');
      else {
        markup += rect(g.strip,'fill="#d6c7a3" stroke="#b5a991" stroke-width="2"');
        for (const id of g.front === 'right' ? ['left','right'] : ['right','left']) markup += rect(g[id],`fill="${id==='left'?'#fff9e7':'#f8f1df'}" stroke="#b5a991" stroke-width="2"`);
      }
    }
    if (level.test.type === 'near' && level.test.snap) {
      const plug = C.bounds(level,state,'plug'), end = C.centre(plug);
      markup += `<path d="M411 313 C448 400 470 417 509 403 Q${end.x} 422 ${end.x} ${end.y+18}" fill="none" stroke="#6c796c" stroke-width="7"/>`;
    }
    if (level.test.type === 'shadow') {
      const a = state.objects.lamp.arc;
      markup += `<path d="M${a.cx-a.rx} ${a.cy} A${a.rx} ${a.ry} 0 0 1 ${a.cx+a.rx} ${a.cy}" fill="none" stroke="#9e9b8d" stroke-dasharray="5 9" stroke-width="2"/><path d="M70 390 H734" stroke="#b7b6a7" stroke-width="2"/>`;
      markup += text(430,450,t('guideMark'),'text-anchor="middle" font-size="15"');
      markup += text(400,472,t('shadowNote'),'text-anchor="middle" font-size="13" fill="#666757"');
    }
    for (const spec of level.objects) {
      let o = C.bounds(level,state,spec.id);
      if (o.id === 'snail' && solved) o = { ...o, x:C.centre(state.objects.finish).x+12 };
      if (o.shape === 'shadow') o = { ...o, w: C.shadowLength(level,state) };
      const loose = o.kind !== 'ink', selected = state.selected === o.id;
      const label = o.label[lang];
      const className = `piece ${loose?'loose':'printed'} ${selected?'selected':''} ${o.id==='battery' && state.feedback==='sleepy'?'blink':''} ${o.id==='snail' && solved?'crossing':''}`;
      const inkWobble = state.feedback==='ink' && spec.kind==='ink' || state.effect?.type==='wobble' && state.effect.id===spec.id ? ' wobble' : '';
      const boxW = Math.max(o.w,options.targetSize||56), boxH = Math.max(o.h,options.targetSize||56);
      markup += `<g data-object="${o.id}" class="${className}${inkWobble}" role="button" tabindex="0" aria-label="${esc(label)}" aria-pressed="${selected}" transform="translate(${o.x} ${o.y})">`;
      markup += `<title>${esc(label)}</title><rect class="hit" x="${(o.w-boxW)/2}" y="${(o.h-boxH)/2}" width="${boxW}" height="${boxH}" rx="8" fill="transparent" stroke="none"/>`;
      markup += `<rect class="focus-ring" x="-5" y="-5" width="${o.w+10}" height="${o.h+10}" rx="7" fill="none" stroke="none"/>`;
      const customArt=pack?.drawing?.(o,state,solved,ui,lang,level,C);
      markup += `<g class="art" stroke="#3d4741" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${customArt===undefined?drawing(o,state,solved,ui,lang):customArt}</g></g>`;
    }
    if (solved && level.test.type === 'near' && !level.test.snap) {
      const f = C.centre(state.objects.finish);
      markup += `<g class="snail-celebration" aria-hidden="true"><path d="M110 375 Q${f.x} 410 ${f.x+60} 355" fill="none" stroke="#6d8a58" stroke-width="3" stroke-dasharray="7 8"/>${text(f.x+58,344,'✓','fill="#536c47" font-size="30"')}</g>`;
    }
    if (solved) {
      markup += '<g class="confetti" aria-hidden="true" fill="none" stroke-width="3">';
      for (let i=0;i<16;i++) {
        const x=70+(i*107)%660, y=30+(i*41)%65;
        markup += `<path d="M${x} ${y} l${i%2?7:-7} 9" stroke="${['#ad765d','#8ca389','#c6a44f','#8f9da9'][i%4]}"/>`;
      }
      markup += '</g>';
    }
    return markup;
  }
  return { scene, drawing, esc };
});
