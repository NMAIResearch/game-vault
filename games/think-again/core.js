(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ThinkAgain = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const clone = value => JSON.parse(JSON.stringify(value));
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const packs = {};
  function packFor(level) {
    if (!level.pack) return null;
    if (typeof module === 'object' && module.exports) return packs[level.pack] ||= require('./extra-'+level.pack+'.js');
    return globalThis.ThinkAgainPacks?.[level.pack];
  }
  const centre = r => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
  const inside = (a, b, t = 0) => a.x >= b.x - t && a.y >= b.y - t &&
    a.x + a.w <= b.x + b.w + t && a.y + a.h <= b.y + b.h + t;
  function initial(level) {
    return { objects: Object.fromEntries(level.objects.map(o => [o.id, clone(o)])),
      arc: 0, folded: false, direction: -1, selected: null, holding:false, feedback: 'nothing', custom:clone(level.initial||{}) };
  }
  function catLayout(level, state) {
    const p = level.paper, strip = p.creaseB - p.creaseA;
    const shift = state.folded ? 2 * strip : 0;
    const rightward = state.direction > 0;
    const offset = state.folded ? (rightward ? -strip : strip) : 0;
    const leftShift = state.folded && rightward ? shift : 0;
    const rightShift = state.folded && !rightward ? -shift : 0;
    const rect = (x, w) => ({ x: x + offset, y: p.y, w, h: p.h });
    const left = rect(p.x + leftShift, p.creaseA - p.x);
    const right = rect(p.creaseB + rightShift, p.x + p.w - p.creaseB);
    const cats = ['leftCat', 'rightCat'].map((id, i) => {
      const o = state.objects[id];
      return { ...o, x: o.x + offset + (i ? rightShift : leftShift) };
    });
    const visible = { x: left.x, y: p.y, w: right.x + right.w - left.x, h: p.h };
    const foldedStrip = rect(rightward ? p.creaseB + leftShift - strip : p.creaseA - strip, strip);
    return { left, right, cats, visible, strip: state.folded ? foldedStrip : rect(p.creaseA, strip),
      front: rightward ? 'left' : 'right' };
  }
  function bounds(level, state, id) {
    const o = state.objects[id];
    if (!o) return null;
    const extra = packFor(level)?.bounds?.(level,state,id,api);
    if (extra) return extra;
    if (o.kind === 'resize') {
      const f = state.objects[o.parent];
      return { ...o, x: f.x + (o.corner.includes('e') ? f.w : 0) - 26,
        y: f.y + (o.corner.includes('s') ? f.h : 0) - 26 };
    }
    if (o.kind === 'arc') {
      const a = o.arc, theta = state.arc * Math.PI / 2;
      return { ...o, x: a.cx + a.rx * Math.sin(theta) - o.w / 2,
        y: a.cy - a.ry * Math.cos(theta) - o.h / 2 };
    }
    if (level.test.type === 'cats') {
      const layout = catLayout(level, state);
      if (o.shape === 'cat') return layout.cats.find(c => c.id === id);
      if (o.kind === 'fold') return { ...o, ...layout.strip };
    }
    return o;
  }
  function shadowLength(level, state) {
    return level.test.base + level.test.gain * Math.abs(state.arc);
  }
  function success(level, state) {
    const pack = packFor(level);
    if (pack) return !!pack.success(level,state,api);
    const t = level.test, [aId, bId] = t.objects;
    const a = bounds(level, state, aId), b = bounds(level, state, bId);
    if (t.type === 'contains') return inside(a, b);
    if (t.type === 'near') {
      const dx = a.x + a.w * t.anchorA[0] - b.x - b.w * t.anchorB[0];
      const dy = a.y + a.h * t.anchorA[1] - b.y - b.h * t.anchorB[1];
      return Math.abs(dx) <= t.dx && Math.abs(dy) <= t.dy;
    }
    if (t.type === 'shadow') return shadowLength(level, state) > t.guideLength;
    if (t.type === 'cats') {
      const g = catLayout(level, state), [left, right] = g.cats;
      const gap = right.x - left.x - left.w;
      const rear = g.front === 'right' ? left : right;
      const front = g[g.front];
      const covered = rear.x < front.x + front.w && rear.x + rear.w > front.x;
      return state.folded && g.cats.every(cat => inside(cat, g.visible)) &&
        gap >= 0 && gap <= t.maxGap && left.y < right.y + right.h && right.y < left.y + left.h && !covered;
    }
    return false;
  }
  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
  function apply(level, previous, action, final = true) {
    const s = clone(previous), o = s.objects[action.id];
    delete s.effect;
    if (action.type === 'release') { s.selected = null; s.holding=false; s.feedback = 'nothing'; return s; }
    if (!o) return s;
    if (action.type === 'select') {
      s.selected = o.id;
      s.holding=true;
      s.feedback = o.kind === 'resize' ? 'resize' : ['move', 'arc'].includes(o.kind) ? 'move' : 'harmless';
      return s;
    }
    if (action.type === 'nudge' && (!Number.isFinite(action.dx) || !Number.isFinite(action.dy))) return s;
    if (['move','resize'].includes(action.type) && (!Number.isFinite(action.x) || !Number.isFinite(action.y))) return s;
    const extra = packFor(level)?.apply?.(level,s,action,final,api);
    if (extra) return extra;
    if (o.kind === 'ink') { s.feedback = 'ink'; return s; }
    if (o.kind === 'use') { s.feedback = 'sleepy'; return s; }
    if (o.kind === 'fold') {
      s.folded = !s.folded;
      s.direction = action.direction > 0 ? 1 : -1;
      s.feedback = s.folded ? 'folded' : 'unfolded';
      return s;
    }
    if (action.type === 'use') {
      s.selected = o.id; s.feedback = o.kind === 'resize' ? 'resize' : 'move'; return s;
    }
    if (action.type === 'nudge' && (!Number.isFinite(action.dx) || !Number.isFinite(action.dy))) return s;
    if (['move','resize'].includes(action.type) && (!Number.isFinite(action.x) || !Number.isFinite(action.y))) return s;
    if (action.type === 'arc' && !Number.isFinite(action.value)) return s;
    if (o.kind === 'arc') {
      const centreX = o.arc.cx;
      const value = action.type === 'nudge' ? (action.dx ? s.arc + action.dx/120 :
        (Math.sign(s.arc)||1)*Math.max(0,Math.abs(s.arc)+action.dy/120)) :
        action.type === 'arc' ? action.value : Math.asin(clamp((action.x - centreX) / o.arc.rx, -1, 1)) / (Math.PI / 2);
      s.arc = clamp(value, o.arc.min, o.arc.max);
    } else if (o.kind === 'resize') {
      const f = s.objects[o.parent], east = o.corner.includes('e'), south = o.corner.includes('s');
      const oldX = f.x + (east ? f.w : 0), oldY = f.y + (south ? f.h : 0);
      const x = action.type === 'nudge' ? oldX + action.dx : action.x;
      const y = action.type === 'nudge' ? oldY + action.dy : action.y;
      const right = f.x + f.w, bottom = f.y + f.h;
      if (east) f.w = clamp(x - f.x, 70, 750 - f.x);
      else { f.x = clamp(x, 50, right - 70); f.w = right - f.x; }
      if (south) f.h = clamp(y - f.y, 70, 425 - f.y);
      else { f.y = clamp(y, 105, bottom - 70); f.h = bottom - f.y; }
    } else if (o.kind === 'move') {
      o.x = clamp(action.type === 'nudge' ? o.x + action.dx : action.x - o.w / 2, 35, 765 - o.w);
      o.y = clamp(action.type === 'nudge' ? o.y + action.dy : action.y - o.h / 2, 100, 425 - o.h);
    }
    if (final && level.test.type === 'contains') {
      const elephant = s.objects.elephant, frame = s.objects.frame;
      if (frame.w >= elephant.w && frame.h >= elephant.h && inside(elephant,frame,level.test.tolerance)) {
        elephant.x = clamp(elephant.x,frame.x,frame.x+frame.w-elephant.w);
        elephant.y = clamp(elephant.y,frame.y,frame.y+frame.h-elephant.h);
      } else if (o.id === 'elephant' && action.type!=='nudge' && overlaps(elephant,frame)) {
        s.objects.elephant = clone(previous.objects.elephant);
        s.feedback = 'smallFrame';
        return s;
      }
    }
    s.feedback = 'move';
    if (final && success(level, s) && level.test.snap) {
      const [a, b] = level.test.objects, pos = centre(s.objects[b]);
      s.objects[a].x = pos.x - s.objects[a].w / 2;
      s.objects[a].y = pos.y - s.objects[a].h / 2;
    }
    return s;
  }
  function readPrefs(storage) {
    try {
      const p = JSON.parse(storage.getItem('think-again:preferences:v1')) || {};
      return { ok: true, language: p.language === 'hu' ? 'hu' : 'en',
        music: p.music === true, volume: Number.isFinite(p.volume) ? clamp(p.volume, 0, 1) : 0.35 };
    } catch { return { ok: false, language: 'en', music: false, volume: 0.35 }; }
  }
  function writePrefs(storage, prefs) {
    try { storage.setItem('think-again:preferences:v1', JSON.stringify(prefs)); return true; }
    catch { return false; }
  }
  function restore(level,saved) {
    const fresh = initial(level);
    if (!saved || !saved.objects || !saved.custom) return fresh;
    const safe = (v,depth=0) => depth<9 && (v===null || typeof v==='boolean' ||
      typeof v==='number' && Number.isFinite(v) && Math.abs(v)<=10000 || typeof v==='string' && v.length<300 ||
      Array.isArray(v) && v.length<100 && v.every(x=>safe(x,depth+1)) ||
      typeof v==='object' && Object.keys(v).length<100 && Object.entries(v).every(([k,x])=>!['__proto__','constructor','prototype'].includes(k)&&safe(x,depth+1)));
    if (!safe(saved.custom)) return fresh;
    const compatible=(template,value)=>{
      if(Array.isArray(template))return Array.isArray(value)&&(!template.length||value.every(v=>compatible(template[0],v)));
      if(template && typeof template==='object')return value && typeof value==='object' && !Array.isArray(value) && Object.entries(template).every(([k,v])=>Object.hasOwn(value,k)&&compatible(v,value[k]));
      return typeof template===typeof value;
    };
    if(!compatible(fresh.custom,saved.custom))return fresh;
    if (Object.keys(fresh.objects).some(id=>!saved.objects[id])) return fresh;
    for (const [id,o] of Object.entries(fresh.objects)) {
      const v=saved.objects[id];
      if (!['x','y','w','h'].every(k=>Number.isFinite(v[k])) || v.w<1 || v.h<1 || v.w>800 || v.h>480 || v.x < -100 || v.x>900 || v.y < -100 || v.y>600) return initial(level);
      for(const k of ['x','y','w','h']) o[k]=v[k];
    }
    for(const [k,v] of Object.entries(fresh.custom)) {
      const incoming=saved.custom[k];
      if (incoming===undefined || Array.isArray(v)!==Array.isArray(incoming) || typeof incoming!==typeof v) return initial(level);
    }
    fresh.custom=clone(saved.custom);
    fresh.arc=Number.isFinite(saved.arc)?clamp(saved.arc,-1,1):0;
    fresh.folded=saved.folded===true; fresh.direction=saved.direction>0?1:-1;
    return fresh;
  }
  const api = { initial, bounds, centre, inside, catLayout, shadowLength, success, apply, readPrefs, writePrefs, clamp, restore, packFor };
  return api;
});
