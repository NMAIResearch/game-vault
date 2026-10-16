// Game-logic checks shared by `node game/tests/run.mjs` and `index.html?selftest`.
import {
  START_R, GROWTH_K, TIERS, TYPES, grow, fits, tierForSize, tierOfObject, tierProgress, captureDistance, pullReach,
  MAPS, generateMap, generateCity, World, Stopwatch, Store, BestTimes, LOOKS, newUnlocks, formatTime, insideSolid,
  EraseConfirmation, SaveThrottle,
} from './logic.js';
import * as THREE from '../three.module.min.js';
import { ENDGAME_LEFT, CUT_NEAR, SPECK_IN, SPECK_OUT, speckMode, screenSize, viewDistance, depthRange, frameCamera, viewFrustum, shouldDraw, inView } from './view.js';

function assert(cond, msg) { if (!cond) throw new Error(msg); }
const near = (a, b, e = 1e-9) => Math.abs(a - b) <= e;

// A world with nothing in it except what the check places.
function emptyWorld(seed = 1) {
  const map = generateCity(seed);
  map.objects = [];
  return new World(map);
}
function place(w, typeId, dx, dz, s) {
  const type = TYPES.findIndex(t => t.id === typeId);
  const o = { type, x: w.hole.x + dx, z: w.hole.z + dz, s: s ?? TYPES[type].s, rot: 0, v: 0, id: w.objs.length,
    alive: true, tier: 0, hop: 0, panic: 0, bump: -9, vx: 0, vz: 0 };
  o.tier = tierOfObject(o.s);
  w.objs.push(o); w.grid.insert(o); w.total++; w.left++;
  return o;
}

export const CHECKS = [
  ['growth adds area: new radius squared = old + K * s squared', () => {
    const r = grow(2, 1);
    assert(near(r * r, 4 + GROWTH_K * 1), `got ${r}`);
    assert(grow(1, 0) === 1, 'zero-size object changes nothing');
  }],
  ['growth slows as the hole gets bigger (same snack, smaller radius gain)', () => {
    const small = grow(1, 0.5) - 1, big = grow(5, 0.5) - 5;
    assert(small > big && big > 0, `small gain ${small}, big gain ${big}`);
  }],
  ['fits: only objects no wider than the hole', () => {
    assert(fits(1, 0.99) && fits(1, 1) && !fits(1, 1.01), 'fit boundary wrong');
  }],
  ['only things that fit fall in: a too-big object at the centre stays', () => {
    const w = emptyWorld();
    const big = place(w, 'person', 0, 0);
    const small = place(w, 'flower', 0.1, 0);
    w.step(1 / 60);
    assert(big.alive, 'person should not fit a starting hole');
    assert(!small.alive, 'flower at the centre should fall in');
  }],
  ['something that fits but is far away does not fall in', () => {
    const w = emptyWorld();
    const f = place(w, 'flower', 5, 0);
    for (let i = 0; i < 30; i++) w.step(1 / 60);
    assert(f.alive, 'distant flower was eaten');
  }],
  ['a near miss that fits is pulled in by gravity', () => {
    const w = emptyWorld();
    const f = place(w, 'flower', captureDistance(START_R, 0.22) + 0.4, 0, 0.22);
    for (let i = 0; i < 60 && f.alive; i++) w.step(1 / 60);
    assert(!f.alive, 'flower at the rim was not pulled in');
  }],
  ['tiers open in order, one at a time, never skipped', () => {
    const w = emptyWorld();
    const seen = [];
    for (let k = 0; k < 400 && w.hole.tier < TIERS.length - 1; k++) {
      const o = place(w, 'flower', 0, 0, w.hole.r * 0.9);
      for (const e of w.step(1 / 60)) if (e.type === 'tier') seen.push(e.tier);
      assert(!o.alive, 'snack not eaten');
    }
    assert(seen.join() === TIERS.slice(1).map((_, i) => i + 1).join(), `tier events ${seen.join()}`);
  }],
  ['each tier opens a new kind of prey that did not fit before', () => {
    for (let k = 1; k < TIERS.length; k++) {
      const prey = TYPES.filter(t => tierOfObject(t.s) === k);
      assert(prey.length > 0, `tier ${k} has no prey`);
      for (const t of prey) {
        assert(!fits(TIERS[k - 1].r, t.s * 0.92), `${t.id} already fits at ${TIERS[k - 1].name}`);
        assert(fits(TIERS[k].r, t.s), `${t.id} does not fit at ${TIERS[k].name}`);
      }
    }
    assert(tierForSize(START_R) === 0 && tierForSize(TIERS[3].r) === 3, 'tierForSize wrong');
    assert(tierProgress(TIERS[1].r) === 0 && tierProgress(TIERS[TIERS.length - 1].r) === 1, 'progress ends wrong');
  }],
  ['stopwatch runs, pauses, resumes and stops', () => {
    let now = 1000;
    const sw = new Stopwatch(() => now);
    sw.start(); now += 2500;
    assert(near(sw.elapsed, 2.5), `running ${sw.elapsed}`);
    sw.pause(); now += 10000;
    assert(near(sw.elapsed, 2.5), 'counted while paused');
    sw.resume(); now += 500; sw.stop(); now += 9000;
    assert(near(sw.elapsed, 3), `after stop ${sw.elapsed}`);
    sw.resume();
    assert(!sw.running, 'resumed after stop');
    assert(formatTime(83.44) === '1:23.4', formatTime(83.44));
  }],
  ['best time keeps the fastest clear per map and seed', () => {
    const mem = new Map();
    const backend = { getItem: k => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)) };
    const bt = new BestTimes(new Store(backend));
    let r = bt.submit('downtown', 7, 300);
    assert(r.isNew && !r.beatPrevious && bt.get('downtown', 7) === 300, 'first time');
    r = bt.submit('downtown', 7, 320);
    assert(!r.isNew && bt.get('downtown', 7) === 300, 'slower run replaced the best');
    r = bt.submit('downtown', 7, 250);
    assert(r.isNew && r.beatPrevious && bt.get('downtown', 7) === 250, 'faster run not kept');
    assert(bt.get('downtown', 8) === null, 'seeds share a best time');
    assert(new BestTimes(new Store(backend)).get('downtown', 7) === 250, 'not persisted');
  }],
  ['blocked storage never throws and the game still keeps a best time', () => {
    const boom = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
    const bt = new BestTimes(new Store(boom));
    bt.submit('downtown', 7, 200);
    assert(bt.get('downtown', 7) === 200, 'in-memory fallback missing');
    const st = new Store(null);
    assert(st.get('x', 5) === 5 && st.set('x', 1) === false, 'null storage');
  }],
  ['objects left counts down by one per swallow and reaches zero with a cleared event', () => {
    const w = emptyWorld();
    for (let i = 0; i < 5; i++) place(w, 'flower', 0.05 * i, 0);
    assert(w.left === 5 && w.total === 5, 'start count');
    const ev = w.step(1 / 60).map(e => e.type);
    assert(w.left === 0, `left ${w.left}`);
    assert(ev.filter(t => t === 'eat').length === 5 && ev.includes('cleared'), ev.join());
  }],
  ['the same seed builds the same map; another seed builds a different one', () => {
    const a = JSON.stringify(generateCity(123).objects), b = JSON.stringify(generateCity(123).objects);
    const c = JSON.stringify(generateCity(124).objects);
    assert(a === b, 'seed 123 differs between builds');
    assert(a !== c, 'seed 124 equals seed 123');
  }],
  ['every object on the map can be swallowed eventually, with enough food to get there', () => {
    const map = generateCity(7);
    const top = TIERS[TIERS.length - 1].r;
    let below = START_R * START_R;
    for (const o of map.objects) {
      assert(o.s <= top, `object too big to ever eat: ${TYPES[o.type].id} ${o.s}`);
      if (tierOfObject(o.s) < TIERS.length - 1) below += GROWTH_K * o.s * o.s;
    }
    assert(Math.sqrt(below) >= top * 1.15, `not enough food to reach ${top}: ${Math.sqrt(below)}`);
  }],
  ['the start is next to things a new hole can eat', () => {
    const map = generateCity(7);
    const n = map.objects.filter(o => o.s <= START_R && Math.hypot(o.x - map.start.x, o.z - map.start.z) < 6).length;
    assert(n >= 10, `only ${n} snacks within 6 m of the start`);
  }],
  ['looks unlock only from play milestones, spread over runs', () => {
    const base = { maxTier: 0, people: 0, cleared: false, beatPrevious: false, time: 999, clears: 0, abyssAt: 0 };
    assert(newUnlocks([], base).length === 0, 'something unlocked for nothing');
    assert(newUnlocks([], { ...base, maxTier: 2 }).join() === 'googly', 'Pothole should unlock googly');
    assert(!newUnlocks(['googly'], { ...base, maxTier: 2 }).includes('googly'), 'unlocked twice');
    const first = newUnlocks([], { ...base, maxTier: 6, cleared: true, clears: 1, time: 285, abyssAt: 195 });
    assert(first.join() === 'googly,chomp,donut', `a slow first clear unlocked ${first.join()}`);
    assert(newUnlocks(first, { ...base, maxTier: 6, cleared: true, clears: 2, time: 285, abyssAt: 195 }).join() === 'duck', 'second clear');
    const all = newUnlocks([], { maxTier: 6, people: 99, cleared: true, beatPrevious: true, time: 200, clears: 2, abyssAt: 150 });
    assert(all.length === LOOKS.filter(l => !['classic', 'captain', 'scarecrow', 'jester'].includes(l.id)).length, `got ${all.length}`);
  }],
];

// A greedy player in the rules alone: head for the nearest thing that fits, until the map is clear.
// Every 0.1 s it also checks that movers stay in the play area, that none is trapped inside a standing
// building (inside one for over 1 s), and that vehicles in a lane never overlap.
function sweepToClear(seed, capSeconds = 900, mapId = 'downtown') {
  const w = new World(generateMap(seed, mapId));
  const tiers = [];
  const dt = 1 / 30, lim = w.map.edge - 1, inside = new Map(), q = [];
  let target = null;
  const problems = [];
  for (let n = 0; w.left > 0 && w.t < capSeconds && !problems.length; n++) {
    if (n % 3 === 0 || !target || !target.alive) target = w.nearestAlive(true);
    let ix = 0, iz = 0;
    if (target) { const dx = target.x - w.hole.x, dz = target.z - w.hole.z, d = Math.hypot(dx, dz) || 1; ix = dx / d; iz = dz / d; }
    for (const e of w.step(dt, ix, iz)) if (e.type === 'tier') tiers.push(e.tier);
    if (n % 3) continue;
    for (const m of w.movers) {
      if (!m.alive) continue;
      if (Math.abs(m.x) > lim + 1e-6 || Math.abs(m.z) > lim + 1e-6) problems.push(`${TYPES[m.type].id} left the play area`);
      if (m.mover === 'car') continue;
      // Something being sucked into the hole may pass under a building on its way down; that is the swallow itself.
      const falling = m.s <= w.hole.r && Math.hypot(m.x - w.hole.x, m.z - w.hole.z) < pullReach(w.hole.r) + 0.5;
      const inBuilding = !falling && w.solids.query(m.x, m.z, 14, q).some(b => b.alive && insideSolid(b, m.x, m.z, -0.05));
      if (!inBuilding) { inside.delete(m); continue; }
      if (!inside.has(m)) inside.set(m, w.t);
      else if (w.t - inside.get(m) > 1) problems.push(`${TYPES[m.type].id} trapped inside a building at ${m.x.toFixed(1)},${m.z.toFixed(1)}`);
    }
    for (const a of w.vehicles) for (const b of w.vehicles) {
      if (a.id >= b.id || !a.alive || !b.alive || a.road.axis !== b.road.axis || a.road.line !== b.road.line || a.road.dir !== b.road.dir) continue;
      if (Math.abs(a.road.p - b.road.p) < (a.s + b.s) * 0.6) problems.push(`${TYPES[a.type].id} and ${TYPES[b.type].id} overlap in a lane`);
    }
  }
  return { w, problems, tiers };
}

CHECKS.push(
  ['erase progress: request and cancel preserve data; only a pending confirmation erases once', () => {
    let erasures = 0;
    const progress = { best: 100, looks: ['classic', 'googly'], settings: { music: false }, run: { eaten: [1] } };
    const before = JSON.stringify(progress);
    const confirmation = new EraseConfirmation(() => { erasures++; for (const key of Object.keys(progress)) delete progress[key]; });
    assert(!confirmation.confirm() && erasures === 0, 'unrequested erasure');
    confirmation.request();
    assert(JSON.stringify(progress) === before, 'request erased data');
    confirmation.cancel();
    assert(!confirmation.confirm() && JSON.stringify(progress) === before, 'cancel did not preserve data');
    confirmation.request();
    assert(confirmation.confirm() && erasures === 1 && Object.keys(progress).length === 0, 'confirmed erasure missing');
    assert(!confirmation.confirm() && erasures === 1, 'duplicate erasure');
  }],
  ['run saves: at most once per second during play, with immediate lifecycle flushes', () => {
    const throttle = new SaveThrottle();
    assert(throttle.due(0), 'first save missing');
    for (let now = 1; now < 1000; now++) assert(!throttle.due(now), 'saved too often');
    assert(throttle.due(1000), 'one-second save missing');
    assert(throttle.due(1001, true), 'pause/menu/pagehide/hidden flush suppressed');
    assert(!throttle.due(2000) && throttle.due(2001), 'flush did not reset interval');
    const blocked = new Store({ setItem() { throw new Error('storage unavailable'); } });
    assert(!blocked.set('run', {}), 'blocked storage should fail without throwing');
    assert(!throttle.due(2002), 'storage failure must not cause a frame-by-frame retry');
  }],
  ['reachability: every object starts inside the play area and outside every building', () => {
    for (const seed of [7, 123, 5]) {
      const map = generateCity(seed), lim = map.edge - 1, top = TIERS[TIERS.length - 1].r;
      const solids = map.objects.filter(o => TYPES[o.type].solid);
      for (const o of map.objects) {
        // The hole's centre is held inside the play area, so measure from the nearest point it can reach.
        const cx = Math.max(-lim, Math.min(lim, o.x)), cz = Math.max(-lim, Math.min(lim, o.z));
        assert(Math.hypot(o.x - cx, o.z - cz) <= captureDistance(top, o.s), `seed ${seed}: ${TYPES[o.type].id} at ${o.x},${o.z} is out of reach`);
        for (const b of solids) assert(b === o || !insideSolid(b, o.x, o.z), `seed ${seed}: ${TYPES[o.type].id} starts inside a ${TYPES[b.type].id}`);
      }
    }
  }],
  ['reachability: a greedy player swallows every object on seeds 7 and 123, and nothing gets trapped', () => {
    for (const seed of [7, 123]) {
      const { w, problems } = sweepToClear(seed);
      assert(!problems.length, `seed ${seed}: ${problems.slice(0, 3).join('; ')}`);
      assert(w.left === 0, `seed ${seed}: ${w.left}/${w.total} left after ${w.t.toFixed(0)} s, e.g. ${w.remaining().slice(0, 3).map(o => `${TYPES[o.type].id} at ${o.x.toFixed(1)},${o.z.toFixed(1)}`).join('; ')}`);
    }
  }],
  ['leftovers are never culled: in the endgame every one is drawn, wherever it is, at any zoom', () => {
    const w = new World(generateCity(7));
    const cam = new THREE.PerspectiveCamera(50, 1280 / 800, 0.3, 3000);
    for (const o of w.objs) o.alive = false;
    const keep = [];
    for (let i = 0; i < w.objs.length && keep.length < ENDGAME_LEFT; i += 47) keep.push(w.objs[i]);
    for (const o of keep) o.alive = true;
    w.left = keep.length;
    assert(keep.some(o => TYPES[o.type].s < 0.3), 'the sample should include tiny things');
    for (const r of [0.55, 3, 9, 14, 23]) {
      w.hole.r = r;
      for (const aspect of [1280 / 800, 390 / 844]) {
        cam.aspect = aspect; cam.updateProjectionMatrix();
        frameCamera(cam, w.hole, viewDistance(r, aspect), w.map.edge, 'play');
        const fr = viewFrustum(cam);
        const culled = keep.filter(o => !shouldDraw(o, fr, w.left));
        assert(culled.length === 0, `r ${r}: ${culled.length} leftovers culled`);
      }
    }
  }],
  ['size never hides anything: a flower at the edge of the view is drawn while zoomed right out', () => {
    const w = new World(generateCity(7));
    const cam = new THREE.PerspectiveCamera(50, 1280 / 800, 0.3, 3000);
    w.hole.r = 20;
    frameCamera(cam, w.hole, viewDistance(20, cam.aspect), w.map.edge, 'play');
    const fr = viewFrustum(cam);
    let tinyInView = 0;
    for (const o of w.objs) {
      if (!inView(o, fr, 0)) continue;
      assert(shouldDraw(o, fr, w.left), `${TYPES[o.type].id} in view but not drawn`);
      if (TYPES[o.type].id === 'flower') tinyInView++;
    }
    assert(tinyInView > 100, `only ${tinyInView} flowers in view; the camera setup is wrong`);
  }],
  ['far-off specks: only things a few pixels tall become stand-in blocks, never a leftover in the endgame', () => {
    assert(speckMode(1, false, 2000) && !speckMode(3, false, 2000) && speckMode(3, true, 2000) && !speckMode(5, true, 2000), 'hysteresis wrong');
    assert(!speckMode(0.1, false, ENDGAME_LEFT) && !speckMode(0.1, true, ENDGAME_LEFT), 'a leftover became a speck in the endgame');
    const flower = { type: TYPES.findIndex(t => t.id === 'flower'), s: 0.22, x: 0, z: 0 };
    assert(screenSize(flower, 0, 10, 10, 800) > SPECK_OUT, 'a flower near the camera should be a full model');
    assert(screenSize(flower, 0, 160, 120, 800) < SPECK_IN, 'a flower 200 m away should be a speck');
  }],
  ['depth precision over the visible ground stays finer than a quarter of the 2 cm decal gap at every zoom', () => {
    const cam = new THREE.PerspectiveCamera(50, 1280 / 800, 0.3, 3000);
    const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), ray = new THREE.Ray(), hit = new THREE.Vector3();
    for (let r = START_R; r <= 30; r += 0.5) {
      const dist = viewDistance(r, cam.aspect);
      frameCamera(cam, { x: 40, z: -60 }, dist, 140, 'play');
      let zMax = 0;
      for (const [sx, sy] of [[-1, 1], [1, 1], [-1, -1], [1, -1], [0, 1]]) {
        ray.origin.copy(cam.position);
        ray.direction.set(sx, sy, 0.5).unproject(cam).sub(cam.position).normalize();
        const p = ray.intersectPlane(ground, hit);
        const fwd = new THREE.Vector3(); cam.getWorldDirection(fwd);
        zMax = Math.max(zMax, p ? hit.clone().sub(cam.position).dot(fwd) : cam.far);
      }
      const { near, far } = depthRange(dist);
      const step = zMax * zMax * (far - near) / (far * near * 2 ** 24);  // 24-bit depth buffer
      assert(step < 0.005, `r ${r}: depth step ${step.toFixed(4)} m at ${zMax.toFixed(0)} m`);
      assert(near < CUT_NEAR * dist, `r ${r}: near plane ${near} could slice something before the cutaway hides it`);
    }
  }],
);

CHECKS.push(['harbour: moving boats keep clear of one another and the liner for a full loop', () => {
  const m = generateMap(7, 'harbour');m.objects=m.objects.filter(o=>['dinghy','liner'].includes(TYPES[o.type].id));
  const w=new World(m), boats=w.movers;
  for(let n=0;n<4500;n++) {
    w.step(1/30);
    if(n%3)continue;
    for(const a of boats) {
      for(const b of boats)if(a.id<b.id) assert(Math.hypot(a.x-b.x,a.z-b.z)>a.s+b.s,'boats overlap');
      for(const b of w.objs)if(TYPES[b.type].id==='liner') assert(!insideSolid(b,a.x,a.z,a.s),'boat inside liner');
    }
  }
}]);

// Each additional map is checked independently, including its real progression to a clear.
for (const id of ['harbour', 'farm', 'fair']) {
  CHECKS.push(
    [`${id}: deterministic seeds and a different layout from Downtown`, () => {
      const a = JSON.stringify(generateMap(7, id)), b = JSON.stringify(generateMap(7, id));
      assert(a === b, 'same seed drift'); assert(a !== JSON.stringify(generateMap(123, id)), 'seed ignored');
      assert(a !== JSON.stringify(generateCity(7)), 'Downtown duplicated');
    }],
    [`${id}: all starting objects reachable, outside solids, with nearby first snacks`, () => {
      for (const seed of [7, 123, 5]) {
        const m = generateMap(seed, id), solids = m.objects.filter(o => TYPES[o.type].solid);
        assert(m.objects.length >= 2200 && m.objects.length <= 2600, 'object count outside target');
        assert(m.objects.filter(o => o.s <= START_R && Math.hypot(o.x-m.start.x,o.z-m.start.z)<6).length >= 10, 'empty start');
        for (const o of m.objects) {
          assert(Math.abs(o.x)<139 && Math.abs(o.z)<139, 'unreachable object');
          assert(o.s<=14, 'object never fits');
          for (const b of solids) assert(o === b || !insideSolid(b,o.x,o.z), `${TYPES[o.type].id} inside ${TYPES[b.type].id}`);
        }
      }
    }],
    [`${id}: simulated full clears on both seeds, tiers in order, no trapped movers`, () => {
      for (const seed of [7, 123]) {
        const {w,problems,tiers} = sweepToClear(seed, 600, id);
        assert(!problems.length, problems.join('; '));
        assert(w.left===0, `${w.left}/${w.total} left at ${w.t.toFixed(1)}s`);
        assert(tiers.join() === '1,2,3,4,5,6', `tiers ${tiers}`);
      }
    }],
    [`${id}: leftovers always drawn at every zoom and screen shape`, () => {
      const w = new World(generateMap(7, id)), cam = new THREE.PerspectiveCamera(50,1,.3,3000);
      for (const r of [.55,3,9,14,24]) for (const aspect of [1280/800,390/844]) {
        cam.aspect=aspect;cam.updateProjectionMatrix();
        frameCamera(cam,w.hole,viewDistance(r,aspect),w.map.edge,'play');const fr=viewFrustum(cam);
        for (const o of w.objs) {
          assert(shouldDraw(o,fr,50), 'endgame leftover culled');
          if(inView(o,fr,0)) assert(shouldDraw(o,fr,w.total), 'visible object culled');
        }
      }
    }],
    [`${id}: independent persistent bests and a clear-only map look`, () => {
      const mem=new Map(), backend={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v)};
      const bt=new BestTimes(new Store(backend));bt.submit('downtown',7,300);bt.submit(id,7,240);
      const reload=new BestTimes(new Store(backend));
      assert(reload.get('downtown',7)===300 && reload.get(id,7)===240, 'cross-map best corruption');
      assert(reload.get(id,123)===null, 'cross-seed best corruption');
      for (const other of Object.keys(MAPS)) if(other!==id && other!=='downtown') assert(reload.get(other,7)===null,'best leaked');
      const look=MAPS[id].look;
      assert(newUnlocks([], {map:id,cleared:true}).includes(look), 'map clear did not unlock');
      assert(!newUnlocks([], {map:id,cleared:false,maxTier:6}).includes(look), 'look granted before clear');
      assert(!newUnlocks([], {map:'downtown',cleared:true}).includes(look), 'wrong map granted look');
    }],
  );
}

CHECKS.push(
  ['touch framing: touchBias shifts the hole into the upper half of the screen above the thumb area', () => {
    const w = new World(generateCity(7));
    const cam = new THREE.PerspectiveCamera(50, 390 / 844, 0.3, 3000);
    const dist = viewDistance(w.hole.r, cam.aspect);
    frameCamera(cam, w.hole, dist, w.map.edge, 'play', 0, 0);
    const pBase = new THREE.Vector3(w.hole.x, 0, w.hole.z).project(cam);
    const yBase = (-pBase.y * 0.5 + 0.5) * 844;
    frameCamera(cam, w.hole, dist, w.map.edge, 'play', 0, 0.16);
    const pTouch = new THREE.Vector3(w.hole.x, 0, w.hole.z).project(cam);
    const yTouch = (-pTouch.y * 0.5 + 0.5) * 844;
    assert(yTouch < yBase - 80, `touch hole y ${yTouch.toFixed(1)} not shifted well above base ${yBase.toFixed(1)}`);
    assert(yTouch < 844 * 0.45, `touch hole y ${yTouch.toFixed(1)} not in upper half of screen`);
  }],
  ['persistence: World.snapshot and World.restore preserve in-progress run state and Store.clear resets it', () => {
    const mem = new Map();
    const backend = {
      getItem: k => mem.get(k) ?? null,
      setItem: (k, v) => mem.set(k, v),
      removeItem: k => mem.delete(k),
      get length() { return mem.size; },
      key: i => [...mem.keys()][i] ?? null,
    };
    const store = new Store(backend);
    const map = generateMap(7, 'harbour');
    const w1 = new World(map);
    for (let i = 0; i < 60; i++) {
      const t = w1.nearestAlive(true);
      const dx = t.x - w1.hole.x, dz = t.z - w1.hole.z, d = Math.hypot(dx, dz) || 1;
      w1.step(1 / 20, dx / d, dz / d);
    }
    assert(w1.left < w1.total && w1.hole.r > START_R, 'w1 should have eaten objects');
    const snap = w1.snapshot({ elapsed: 14.2, eats: w1.total - w1.left });
    store.set('run', snap);
    store.set('map', 'harbour');
    const w2 = new World(generateMap(7, 'harbour'));
    assert(w2.restore(store.get('run')), 'restore should succeed');
    assert(w2.left === w1.left, `left mismatch ${w2.left} vs ${w1.left}`);
    assert(Math.abs(w2.hole.r - w1.hole.r) < 1e-3, 'hole radius mismatch');
    assert(Math.abs(w2.hole.x - w1.hole.x) < 1e-2 && Math.abs(w2.hole.z - w1.hole.z) < 1e-2, 'hole position mismatch');
    store.clear();
    assert(store.get('run') === null && store.get('map') === null, 'Store.clear should remove saved keys');
  }],
);

export function runChecks() {
  return CHECKS.map(([name, fn]) => {
    try { fn(); return { name, pass: true }; }
    catch (e) { return { name, pass: false, error: String(e && e.message || e) }; }
  });
}
