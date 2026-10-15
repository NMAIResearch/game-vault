import { MAP_DEFS, EXTRA_TYPES, generatePlace, landAt } from './places.js';

// Game rules with no DOM and no three.js, shared by the game, ?selftest and the Node tests.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------- sizes and growth

export const START_R = 0.55;
export const GROWTH_K = 0.1;

// A size tier opens when the hole's radius reaches r. Every object belongs to the first tier whose r it fits.
export const TIERS = [
  { name: 'Speck', r: 0.55 },
  { name: 'Puddle', r: 0.8 },
  { name: 'Pothole', r: 1.8 },
  { name: 'Crater', r: 3.2 },
  { name: 'Sinkhole', r: 5.6 },
  { name: 'Chasm', r: 9.2 },
  { name: 'Abyss', r: 14 },
];

// s is the footprint radius in metres. Instances are jittered down to 92% of s, which stays inside the tier.
export const TYPES = [
  { id: 'flower', label: 'flowers', s: 0.22, h: 0.4 },
  { id: 'cone', label: 'cones', s: 0.26, h: 0.6 },
  { id: 'hydrant', label: 'hydrants', s: 0.3, h: 0.7 },
  { id: 'pigeon', label: 'pigeons', s: 0.32, h: 0.4, mover: 'bird' },
  { id: 'bin', label: 'bins', s: 0.4, h: 0.9 },
  { id: 'cat', label: 'cats', s: 0.46, h: 0.6, mover: 'animal' },
  { id: 'sapling', label: 'little trees', s: 0.52, h: 1.5 },
  { id: 'mailbox', label: 'post boxes', s: 0.62, h: 1.3 },
  { id: 'person', label: 'people', s: 0.7, h: 1.8, mover: 'walker' },
  { id: 'dog', label: 'dogs', s: 0.76, h: 0.9, mover: 'animal' },
  { id: 'lamp', label: 'lamp posts', s: 0.8, h: 4.5 },
  { id: 'bench', label: 'benches', s: 1.25, h: 1.0 },
  { id: 'car', label: 'cars', s: 1.55, h: 1.5, mover: 'car' },
  { id: 'tree', label: 'trees', s: 1.65, h: 4.5 },
  { id: 'kiosk', label: 'kiosks', s: 2.3, h: 3.0 },
  { id: 'van', label: 'vans', s: 2.5, h: 2.4, mover: 'car' },
  { id: 'bigtree', label: 'big trees', s: 2.7, h: 7.5 },
  { id: 'bus', label: 'buses', s: 3.1, h: 3.2, mover: 'car' },
  { id: 'fountain', label: 'fountains', s: 3.15, h: 2.2 },
  { id: 'house', label: 'houses', s: 4.6, h: 6.5 },
  { id: 'shop', label: 'shops', s: 5.3, h: 6.0 },
  { id: 'apartment', label: 'apartment blocks', s: 8.6, h: 24 },
  { id: 'tower', label: 'towers', s: 13.2, h: 60 },
];
TYPES.push(...EXTRA_TYPES);
export const TYPE_INDEX = Object.fromEntries(TYPES.map((t, i) => [t.id, i]));

// Solid footprints (half widths in x and z at the type's own size, before rotation). Nothing walks through these.
const SOLID = { kiosk: [1.6, 1.3], fountain: [3.0, 3.0], house: [3.1, 3.1], shop: [3.6, 3.6], apartment: [6.0, 6.0], tower: [8.6, 8.6] };
TYPES.forEach(t => { if (SOLID[t.id]) t.solid = SOLID[t.id]; });

// Is the point (x, z), padded by pad, inside the solid footprint of object b?
export function insideSolid(b, x, z, pad = 0) {
  const t = TYPES[b.type];
  if (!t.solid) return false;
  const k = b.s / t.s, dx = x - b.x, dz = z - b.z;
  if (t.id === 'fountain') return Math.hypot(dx, dz) < t.solid[0] * k + pad;
  const c = Math.cos(b.rot || 0), s = Math.sin(b.rot || 0);
  const lx = dx * c - dz * s, lz = dx * s + dz * c;
  return Math.abs(lx) < t.solid[0] * k + pad && Math.abs(lz) < t.solid[1] * k + pad;
}

export function grow(R, s) { return Math.sqrt(R * R + GROWTH_K * s * s); }
export function fits(R, s) { return s <= R; }
export function captureDistance(R, s) { return R - 0.25 * s; }
// Things that fit and sit just outside the rim slide in, so a near miss still counts.
export function pullReach(R) { return R + 0.6 + 0.35 * R; }
export function pullSpeed(R) { return 1.6 + 1.2 * R; }
export function holeSpeed(R) { return 5.2 + 2.3 * Math.pow(R, 0.8); }

export function tierForSize(R) {
  let t = 0;
  for (let k = 0; k < TIERS.length; k++) if (R >= TIERS[k].r - 1e-9) t = k;
  return t;
}
export function tierOfObject(s) {
  for (let k = 0; k < TIERS.length; k++) if (s <= TIERS[k].r) return k;
  return TIERS.length; // never edible: the generator must not make these
}
export function tierLabels(k, map = null) {
  const present = map && new Set(map.objects.map(o => o.type));
  return TYPES.filter((t, i) => (!present || present.has(i)) && tierOfObject(t.s) === k).map(t => t.label);
}
// Progress from the current tier to the next, 0..1 by area, 1 at the top tier.
export function tierProgress(R) {
  const t = tierForSize(R);
  if (t >= TIERS.length - 1) return 1;
  const a = TIERS[t].r ** 2, b = TIERS[t + 1].r ** 2;
  return Math.min(1, Math.max(0, (R * R - a) / (b - a)));
}

// ---------------------------------------------------------------- the city map

export const MAPS = {
  downtown: { id: 'downtown', name: 'Downtown', blocks: 5, pitch: 54, road: 10, defaultSeed: 7, colour: '#b48cff', icon: '▥', description: 'The original city. Streets, parks and towers.' },
  ...MAP_DEFS,
};

export function generateMap(seed, def = MAPS.downtown) {
  if (typeof def === 'string') def = Object.hasOwn(MAPS, def) ? MAPS[def] : MAPS.downtown;
  return def.id === 'downtown' ? generateCity(seed, def) : generatePlace(seed, def, TYPES, mulberry32(seed));
}

export function generateCity(seed, def = MAPS.downtown) {
  const rnd = mulberry32(seed);
  const R = (a, b) => a + (b - a) * rnd();
  const pick = arr => arr[Math.floor(rnd() * arr.length)];
  const N = def.blocks, P = def.pitch, half = N * P / 2;
  const edge = half + def.road / 2;
  const lines = []; for (let i = 0; i <= N; i++) lines.push(-half + i * P);
  const centres = []; for (let i = 0; i < N; i++) centres.push(-half + P / 2 + i * P);
  const bh = (P - def.road) / 2;          // block half width, 22
  const walk = bh - 1.5;                  // sidewalk centreline
  const inner = bh - 3.3;                 // interior half width

  const objects = [];
  const blocks = [];
  const add = (id, x, z, extra = {}) => {
    const t = TYPES[TYPE_INDEX[id]];
    const o = { type: TYPE_INDEX[id], x: +x.toFixed(3), z: +z.toFixed(3), s: +(t.s * R(0.92, 1)).toFixed(3),
      rot: +R(0, Math.PI * 2).toFixed(3), v: +rnd().toFixed(3), ...extra };
    if (t.mover) o.mover = t.mover;
    objects.push(o);
    return o;
  };

  // Rejection packing inside one block interior.
  function packer(cx, cz, lim = inner) {
    const placed = [];
    const free = (x, z, r) => {
      if (Math.abs(x - cx) > lim - r * 0.75 || Math.abs(z - cz) > lim - r * 0.75) return false;
      for (const p of placed) if (Math.hypot(p.x - x, p.z - z) < p.r + r + 0.3) return false;
      return true;
    };
    return {
      placed,
      reserve(x, z, r) { placed.push({ x, z, r }); },
      put(id, n, opts = {}) {
        const r0 = TYPES[TYPE_INDEX[id]].s * 0.85;
        let made = 0;
        for (let k = 0; k < n; k++) {
          for (let tries = 0; tries < 40; tries++) {
            const x = opts.near ? opts.near.x + R(-opts.near.r, opts.near.r) : cx + R(-lim, lim);
            const z = opts.near ? opts.near.z + R(-opts.near.r, opts.near.r) : cz + R(-lim, lim);
            if (!free(x, z, r0)) continue;
            placed.push({ x, z, r: r0 });
            add(id, x, z, opts.extra ? opts.extra() : {});
            made++;
            break;
          }
        }
        return made;
      },
    };
  }

  const kindAt = (i, j) => {
    const c = (N - 1) / 2;
    const di = Math.abs(i - c), dj = Math.abs(j - c);
    if (di === 0 && dj === 0) return 'plaza';
    if (di <= 1 && dj <= 1) return di === 1 && dj === 1 ? 'downtown' : 'commercial';
    if ((i === 0 && j === c) || (i === N - 1 && j === c) || (i === c && j === 0)) return 'park';
    return 'residential';
  };

  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const cx = centres[i], cz = centres[j], kind = kindAt(i, j);
    const b = { cx, cz, kind, half: bh, inner };
    blocks.push(b);
    const region = { x0: cx - inner, x1: cx + inner, z0: cz - inner, z1: cz + inner };
    const pk = packer(cx, cz);
    const wander = () => ({ region });

    if (kind === 'plaza') {
      add('fountain', cx, cz); pk.reserve(cx, cz, 3.6);
      // Flower beds and little things right next to the start, so the first swallow comes within seconds.
      for (const [bx, bz] of [[0, 9], [-6, 12], [6, 12], [0, 15], [-9, 5], [9, 5], [-12, -8], [12, -8], [0, -12]]) {
        const bed = { x: cx + bx, z: cz + bz, r: 2.2 };
        pk.put('flower', 9, { near: bed });
        pk.put('cone', 1, { near: bed });
      }
      pk.put('bin', 8); pk.put('hydrant', 4); pk.put('sapling', 14); pk.put('bench', 8); pk.put('tree', 6);
      pk.put('lamp', 6); pk.put('mailbox', 3); pk.put('kiosk', 2); pk.put('bigtree', 2);
      pk.put('pigeon', 22, { extra: wander }); pk.put('person', 10, { extra: wander }); pk.put('dog', 3, { extra: wander });
    } else if (kind === 'park') {
      pk.put('fountain', 1); pk.put('bigtree', 6); pk.put('kiosk', 1); pk.put('tree', 14); pk.put('bench', 8);
      pk.put('lamp', 4); pk.put('sapling', 12); pk.put('bin', 5);
      for (let k = 0; k < 4; k++) pk.put('flower', 7, { near: { x: cx + R(-14, 14), z: cz + R(-14, 14), r: 2.5 } });
      pk.put('pigeon', 12, { extra: wander }); pk.put('person', 8, { extra: wander }); pk.put('dog', 5, { extra: wander });
      pk.put('cat', 2, { extra: wander });
    } else if (kind === 'downtown') {
      const q = pick([[-1, -1], [1, -1], [-1, 1], [1, 1]]);
      const tx = cx + q[0] * 8.6, tz = cz + q[1] * 8.6;
      add('tower', tx, tz, { rot: pick([0, Math.PI / 2]) }); pk.reserve(tx, tz, 12.4);
      const ax = cx - q[0] * 10.5, az = cz + q[1] * 10.5;
      add('apartment', ax, az, { rot: pick([0, Math.PI / 2]) }); pk.reserve(ax, az, 8.2);
      const bx = cx + q[0] * 10.5, bz = cz - q[1] * 10.5;
      add('apartment', bx, bz, { rot: pick([0, Math.PI / 2]) }); pk.reserve(bx, bz, 8.2);
      pk.put('kiosk', 2); pk.put('bench', 4); pk.put('tree', 4); pk.put('lamp', 3); pk.put('sapling', 6);
      pk.put('bin', 4); pk.put('flower', 10); pk.put('hydrant', 2);
      pk.put('person', 5, { extra: wander }); pk.put('pigeon', 4, { extra: wander });
    } else if (kind === 'commercial') {
      const along = rnd() < 0.5;
      for (const sgn of [-1, 1]) {
        const ax = cx + (along ? sgn * 10 : -9.5), az = cz + (along ? -9.5 : sgn * 10);
        add('apartment', ax, az, { rot: pick([0, Math.PI / 2]) }); pk.reserve(ax, az, 8.2);
      }
      for (const sgn of [-1, 1]) {
        const sx = cx + (along ? sgn * 11 : 11), sz = cz + (along ? 11 : sgn * 11);
        add('shop', sx, sz, { rot: pick([0, Math.PI / 2]) }); pk.reserve(sx, sz, 5);
      }
      pk.put('kiosk', 2); pk.put('bench', 4); pk.put('lamp', 3); pk.put('tree', 3); pk.put('sapling', 5);
      pk.put('bin', 4); pk.put('flower', 8); pk.put('cone', 4); pk.put('hydrant', 2);
      pk.put('person', 5, { extra: wander }); pk.put('dog', 1, { extra: wander });
    } else {
      // Residential: a loose 3 by 3 grid of houses, some swapped for a shop or a garden.
      const slots = [];
      for (const a of [-1, 0, 1]) for (const c of [-1, 0, 1]) slots.push([a, c]);
      for (const [a, c] of slots) {
        const roll = rnd();
        if (roll < 0.12) continue; // garden gap
        const id = roll < 0.22 ? 'shop' : 'house';
        const x = cx + a * 12.4 + R(-0.8, 0.8), z = cz + c * 12.4 + R(-0.8, 0.8);
        add(id, x, z, { rot: pick([0, Math.PI / 2, Math.PI, Math.PI * 1.5]) });
        pk.reserve(x, z, TYPES[TYPE_INDEX[id]].s * 0.82);
      }
      pk.put('tree', 4); pk.put('sapling', 8); pk.put('bench', 1); pk.put('mailbox', 2); pk.put('bin', 3);
      for (let k = 0; k < 3; k++) pk.put('flower', 7, { near: { x: cx + R(-15, 15), z: cz + R(-15, 15), r: 2 } });
      pk.put('flower', 8); pk.put('bigtree', 1); pk.put('cone', 1);
      pk.put('cat', 2, { extra: wander }); pk.put('dog', 1, { extra: wander }); pk.put('person', 2, { extra: wander });
    }

    // Sidewalk ring: street furniture at even spacing and people walking laps.
    const per = 8 * walk, step = 7.4;
    const along = (u) => {
      const side = Math.floor(u / (2 * walk)) % 4, f = (u % (2 * walk)) - walk;
      return side === 0 ? [cx + f, cz - walk] : side === 1 ? [cx + walk, cz + f] : side === 2 ? [cx - f, cz + walk] : [cx - walk, cz - f];
    };
    const street = ['lamp', 'sapling', 'bin', 'hydrant', 'sapling', 'bench', 'mailbox', 'sapling'];
    let n = 0;
    for (let u = 3.5; u < per - 2; u += step) {
      const local = u % (2 * walk);
      if (local < 2.5 || local > 2 * walk - 2.5) continue; // keep corners clear
      const [x, z] = along(u);
      const id = street[(n++ + i * 3 + j) % street.length];
      if (id === 'bench' && kind === 'residential') continue;
      add(id, x, z, id === 'bench' ? { rot: Math.floor(u / (2 * walk)) * Math.PI / 2 } : {});
    }
    for (let k = 0; k < 5; k++) {
      const [x, z] = along(R(0, per));
      add('pigeon', x, z, { region: { x0: cx - bh, x1: cx + bh, z0: cz - bh, z1: cz + bh } });
    }
    for (let k = 0; k < 6; k++) {
      const u = R(0, per);
      const [x, z] = along(u);
      add('person', x, z, { walk: { cx, cz, w: walk, dir: rnd() < 0.5 ? 1 : -1 } });
    }
  }

  // Traffic. Each vehicle starts mid-segment on a random road.
  const veh = [['car', 34], ['van', 10], ['bus', 6]];
  for (const [id, count] of veh) {
    for (let k = 0; k < count; k++) {
      const axis = rnd() < 0.5 ? 'x' : 'z';
      const line = Math.floor(rnd() * lines.length);
      const seg = Math.floor(rnd() * N);
      const p = lines[seg] + R(8, P - 8);
      let dir = rnd() < 0.5 ? 1 : -1;
      const off = 2.5 * dir;
      const x = axis === 'x' ? p : lines[line] - off;
      const z = axis === 'x' ? lines[line] + off : p;
      add(id, x, z, { road: { axis, line, p, dir } });
    }
  }
  // A few cones at road works on the outer ring, for early cone-hunting.
  for (let k = 0; k < 6; k++) {
    const x = R(-half + 10, half - 10), z = pick([-1, 1]) * (half - 3.8);
    for (let c = 0; c < 4; c++) add('cone', x + c * 1.4, z);
  }

  return {
    id: def.id, name: def.name, seed, half, edge, lines, centres, blocks, objects, pitch: P, road: def.road,
    start: { x: centres[(N - 1) / 2], z: centres[(N - 1) / 2] + 11 },
  };
}

// ---------------------------------------------------------------- spatial grid

export class Grid {
  constructor(edge, cell = 10) {
    this.cell = cell; this.o = -edge - cell; this.w = Math.ceil((2 * edge + 2 * cell) / cell);
    this.cells = Array.from({ length: this.w * this.w }, () => []);
  }
  key(x, z) {
    const i = Math.min(this.w - 1, Math.max(0, Math.floor((x - this.o) / this.cell)));
    const j = Math.min(this.w - 1, Math.max(0, Math.floor((z - this.o) / this.cell)));
    return i + j * this.w;
  }
  insert(o) { o.cell = this.key(o.x, o.z); const c = this.cells[o.cell]; o.ci = c.length; c.push(o); }
  // For a static index next to the main grid: files o without touching its own cell fields.
  file(o) { this.cells[this.key(o.x, o.z)].push(o); }
  remove(o) {
    const c = this.cells[o.cell], last = c.pop();
    if (last !== o) { c[o.ci] = last; last.ci = o.ci; }
    o.cell = -1;
  }
  move(o) { if (this.key(o.x, o.z) !== o.cell) { this.remove(o); this.insert(o); } }
  query(x, z, r, out) {
    out.length = 0;
    const i0 = Math.max(0, Math.floor((x - r - this.o) / this.cell)), i1 = Math.min(this.w - 1, Math.floor((x + r - this.o) / this.cell));
    const j0 = Math.max(0, Math.floor((z - r - this.o) / this.cell)), j1 = Math.min(this.w - 1, Math.floor((z + r - this.o) / this.cell));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) for (const o of this.cells[i + j * this.w]) out.push(o);
    return out;
  }
}

// ---------------------------------------------------------------- the running world

const VEH_SPEED = { car: 7.5, van: 6.5, bus: 5 };

export class World {
  constructor(map) {
    this.map = map;
    this.rng = mulberry32((map.seed ^ 0x5bd1e995) >>> 0);
    this.objs = map.objects.map((o, id) => ({ ...o, road: o.road && { ...o.road }, route: o.route && { ...o.route }, id, alive: true, tier: tierOfObject(o.s),
      hop: 0, panic: 0, bump: -9, vx: 0, vz: 0 }));
    this.total = this.objs.length;
    this.left = this.total;
    this.hole = { x: map.start.x, z: map.start.z, r: START_R, tier: 0, vx: 0, vz: 0 };
    this.grid = new Grid(map.edge);
    for (const o of this.objs) this.grid.insert(o);
    this.movers = this.objs.filter(o => o.mover);
    this.vehicles = this.movers.filter(o => o.mover === 'car');
    this.solids = new Grid(map.edge);
    for (const o of this.objs) if (TYPES[o.type].solid) this.solids.file(o);
    this._sq = [];
    for (const m of this.movers) this.initMover(m);
    // Two vehicles can be generated in the same lane on top of each other; ease the later one back.
    for (const m of this.vehicles) {
      for (let tries = 0; tries < 20; tries++) {
        const hit = this.vehicles.find(o => o !== m && o.id < m.id && o.road.axis === m.road.axis && o.road.line === m.road.line
          && o.road.dir === m.road.dir && Math.abs(o.road.p - m.road.p) < (o.s + m.s) * 0.95 + 1.2);
        if (!hit) break;
        m.road.p = hit.road.p - m.road.dir * ((hit.s + m.s) * 0.95 + 1.3);
        if (Math.abs(m.road.p) > map.half - 2) m.road.p = hit.road.p + m.road.dir * ((hit.s + m.s) * 0.95 + 1.3);
        this.moveCar(m, 0, false, Infinity);
      }
    }
    this.t = 0;
    this.events = [];
    this.stats = { byType: new Array(TYPES.length).fill(0), people: 0, cars: 0, maxTier: 0 };
    this.lastEat = 0;
    this._q = [];
  }

  initMover(m) {
    const r = this.rng;
    m.speed = 1;
    m.wait = r() * 2;
    if (m.mover === 'walker' && m.walk) { m.speed = 1.1 + r() * 0.5; m.corner = this.nearestCorner(m); }
    else if (m.mover === 'walker') { m.speed = 1.0 + r() * 0.5; }
    else if (m.mover === 'animal') m.speed = TYPES[m.type].id === 'dog' ? 2.2 : 1.6;
    else if (m.mover === 'bird') m.speed = 0.7;
    else if (m.mover === 'boat') m.speed = 3;
    else if (m.mover === 'car') m.speed = VEH_SPEED[TYPES[m.type].id];
    m.cur = m.speed;
  }

  nearestCorner(m) {
    const { cx, cz, w } = m.walk;
    const cs = [[cx - w, cz - w], [cx + w, cz - w], [cx + w, cz + w], [cx - w, cz + w]];
    let best = 0, bd = Infinity;
    cs.forEach((c, k) => { const d = Math.hypot(c[0] - m.x, c[1] - m.z); if (d < bd) { bd = d; best = k; } });
    return best;
  }

  get tierName() { return TIERS[this.hole.tier].name; }

  step(dt, ix = 0, iz = 0) {
    const h = this.hole;
    this.events.length = 0;
    this.t += dt;
    const len = Math.hypot(ix, iz);
    if (len > 1) { ix /= len; iz /= len; }
    const sp = holeSpeed(h.r);
    h.vx = ix * sp; h.vz = iz * sp;
    const lim = this.map.edge - 1;
    h.x = Math.max(-lim, Math.min(lim, h.x + h.vx * dt));
    h.z = Math.max(-lim, Math.min(lim, h.z + h.vz * dt));

    for (const m of this.movers) if (m.alive) this.moveMover(m, dt);
    this.swallowCheck(dt);
    return this.events;
  }

  threat(m) {
    const h = this.hole;
    const d = Math.hypot(m.x - h.x, m.z - h.z);
    return { d, fits: m.s <= h.r };
  }

  moveMover(m, dt) {
    const h = this.hole, r = this.rng;
    const { d, fits } = this.threat(m);
    const scared = fits && d < h.r + 4 + m.s;
    m.hop = Math.max(0, m.hop - dt);
    if (m.mover === 'car') return this.moveCar(m, dt, scared, d);
    if (m.mover === 'boat') {
      const p = m.route, a = p.a + dt * 0.045;
      const x = p.cx + Math.cos(a) * p.rx, z = p.cz + Math.sin(a) * p.rz;
      m.rot = Math.atan2(x - m.x, z - m.z); m.x = x; m.z = z; p.a = a;
      this.grid.move(m); return;
    }

    let tx = m.x, tz = m.z, speed = m.speed;
    if (m.mover === 'bird' && d < h.r + 2.5) {
      if (m.panic <= 0) { m.panic = 0.7; this.events.push({ type: 'flutter', o: m }); }
    } else if (scared && m.panic <= 0) {
      m.panic = 0.9;
      this.events.push({ type: m.mover === 'walker' ? 'yelp' : 'yip', o: m });
    }
    if (m.panic > 0) {
      m.panic -= dt;
      if (scared || m.mover === 'bird') m.panic = Math.max(m.panic, scared ? 0.5 : 0);
      const ax = m.x - h.x, az = m.z - h.z, al = Math.hypot(ax, az) || 1;
      speed = m.mover === 'bird' ? 4 : m.mover === 'walker' ? 3.1 : 3.6;
      tx = m.x + ax / al; tz = m.z + az / al;
      m.hop = 0.3;
      if (m.panic <= 0 && m.walk) m.corner = this.nearestCorner(m);
    } else if (TYPES[m.type].id === 'dog' && !fits && d < 9 && d > h.r * 0.6) {
      // Dogs too big to fall in chase the hole and bark at it.
      // They stop a polite distance away, so they never sit on top of the hole.
      const keep = h.r + m.s + 1.0;
      if (d > keep) { tx = h.x; tz = h.z; } else { tx = m.x + (m.x - h.x) * 0.01; tz = m.z + (m.z - h.z) * 0.01; }
      speed = 2.8; m.hop = 0.15;
      if (r() < dt * 0.8) this.events.push({ type: 'bark', o: m });
    } else if (m.walk) {
      const { cx, cz, w, dir } = m.walk;
      const cs = [[cx - w, cz - w], [cx + w, cz - w], [cx + w, cz + w], [cx - w, cz + w]];
      const c = cs[m.corner];
      if (Math.hypot(c[0] - m.x, c[1] - m.z) < 0.4) m.corner = (m.corner + dir + 4) % 4;
      [tx, tz] = cs[m.corner];
    } else {
      if (m.wait > 0) { m.wait -= dt; return this.settle(m); }
      if (m.tx === undefined || Math.hypot(m.tx - m.x, m.tz - m.z) < 0.3) {
        const g = m.region;
        if (m.tx !== undefined) { m.wait = 0.5 + r() * 2.5; m.tx = undefined; return; }
        const span = m.mover === 'bird' ? 4 : 10;
        m.tx = Math.max(g.x0, Math.min(g.x1, m.x + (r() * 2 - 1) * span));
        m.tz = Math.max(g.z0, Math.min(g.z1, m.z + (r() * 2 - 1) * span));
      }
      tx = m.tx; tz = m.tz;
    }
    const dx = tx - m.x, dz = tz - m.z, dl = Math.hypot(dx, dz);
    if (dl > 1e-4) {
      const st = Math.min(dl, speed * dt);
      let nx = m.x + dx / dl * st, nz = m.z + dz / dl * st;
      // Buildings are solid: slide along a wall, or stop and pick somewhere else to go.
      if (this.blocked(m, nx, nz)) {
        if (!this.blocked(m, nx, m.z)) nz = m.z;
        else if (!this.blocked(m, m.x, nz)) nx = m.x;
        else { nx = m.x; nz = m.z; if (!m.walk) { m.tx = undefined; m.wait = 0.2; } }
      }
      m.vx = dt > 0 ? (nx - m.x) / dt : 0; m.vz = dt > 0 ? (nz - m.z) / dt : 0;
      if (nx !== m.x || nz !== m.z) m.rot = Math.atan2(nx - m.x, nz - m.z);
      m.x = nx; m.z = nz;
    }
    const lim = this.map.edge - 1;
    m.x = Math.max(-lim, Math.min(lim, m.x)); m.z = Math.max(-lim, Math.min(lim, m.z));
    this.grid.move(m);
  }

  settle(m) { m.vx = 0; m.vz = 0; }

  // Would moving m to (x, z) walk into a standing building? Leaving one it already overlaps is allowed.
  blocked(m, x, z) {
    const pad = m.s * 0.5;
    if (this.map.shaped) {
      if (!landAt(this.map.id, x, z)) return true;
      for (const b of this.grid.query(x, z, m.s + 14, this._mq ||= [])) {
        if (b === m || !b.alive) continue;
        const keep = (m.s + b.s) * 0.8, dx = x - b.x, dz = z - b.z, ox = m.x - b.x, oz = m.z - b.z;
        if (dx * dx + dz * dz < keep * keep && ox * ox + oz * oz >= keep * keep) return true;
      }
    }
    for (const b of this.solids.query(x, z, 14, this._sq)) {
      if (!b.alive || b === m) continue;
      if (insideSolid(b, x, z, pad) && !insideSolid(b, m.x, m.z, pad)) return true;
    }
    return false;
  }

  moveCar(m, dt, scared, d) {
    const L = this.map.lines, rd = m.road, r = this.rng;
    if (scared) {
      if (m.panic <= 0) this.events.push({ type: 'honk', o: m });
      m.panic = 1.0; m.hop = 0.25;
    } else if (m.panic > 0) m.panic -= dt;
    let want = m.panic > 0 ? 0 : m.speed;
    // Queue behind the vehicle ahead in the same lane instead of driving through it.
    let lead = null, leadGap = Infinity;
    for (const o of this.vehicles) {
      if (o === m || !o.alive || o.road.axis !== rd.axis || o.road.line !== rd.line || o.road.dir !== rd.dir) continue;
      const ahead = (o.road.p - rd.p) * rd.dir;
      if ((ahead > 0 || (ahead === 0 && o.id < m.id)) && ahead < leadGap) { lead = o; leadGap = ahead; }
    }
    const keep = lead ? (m.s + lead.s) * 0.95 + 1.2 : 0;
    if (lead && leadGap < keep + 6) want = Math.min(want, leadGap <= keep ? 0 : lead.cur + (leadGap - keep) * 0.6);
    m.cur += (want - m.cur) * Math.min(1, dt * 4);
    const prev = rd.p;
    rd.p += rd.dir * m.cur * dt;
    if (lead && leadGap >= keep && (lead.road.p - rd.p) * rd.dir < keep) { rd.p = lead.road.p - rd.dir * keep; m.cur = Math.min(m.cur, lead.cur); }
    // Did we cross an intersection?
    for (let k = 0; k < L.length; k++) {
      const c = L[k];
      if ((prev - c) * (rd.p - c) <= 0 && prev !== c) {
        const opts = [];
        if (L[k + rd.dir] !== undefined) opts.push('straight', 'straight');
        const other = rd.line;
        for (const nd of [-1, 1]) if (L[other + nd] !== undefined) opts.push(nd);
        const choice = opts[Math.floor(r() * opts.length)];
        if (choice !== 'straight') {
          const over = Math.abs(rd.p - c), axis = rd.axis === 'x' ? 'z' : 'x', p = L[other] + choice * over;
          // Only turn into a lane with room at the merge point; otherwise go straight, or wait at the line.
          if (!this.laneBusy(m, axis, k, choice, p)) { rd.axis = axis; rd.p = p; rd.line = k; rd.dir = choice; }
          else if (L[k + rd.dir] === undefined) { rd.p = c - rd.dir * 0.01; m.cur = 0; }
        }
        break;
      }
    }
    const off = 2.5 * rd.dir;
    if (rd.axis === 'x') { m.x = rd.p; m.z = L[rd.line] + off; m.rot = rd.dir > 0 ? Math.PI / 2 : -Math.PI / 2; }
    else { m.x = L[rd.line] - off; m.z = rd.p; m.rot = rd.dir > 0 ? 0 : Math.PI; }
    m.vx = rd.axis === 'x' ? rd.dir * m.cur : 0; m.vz = rd.axis === 'z' ? rd.dir * m.cur : 0;
    this.grid.move(m);
  }

  walled(o, x, z) {
    const pad = o.s * 0.5;
    for (const b of this.solids.query(x, z, 14, this._sq)) {
      if (!b.alive || b === o) continue;
      if (insideSolid(b, x, z, pad) && !insideSolid(b, o.x, o.z, pad)) return true;
    }
    return false;
  }

  laneBusy(m, axis, line, dir, p) {
    return this.vehicles.some(o => o !== m && o.alive && o.road.axis === axis && o.road.line === line && o.road.dir === dir
      && Math.abs(o.road.p - p) < (o.s + m.s) * 0.95 + 1.2);
  }

  swallowCheck(dt = 0) {
    const h = this.hole;
    const near = this.grid.query(h.x, h.z, h.r + 9, this._q);
    const eat = [];
    const reach = pullReach(h.r), pull = pullSpeed(h.r) * dt;
    for (const o of near) {
      if (!o.alive) continue;
      const d = Math.hypot(o.x - h.x, o.z - h.z);
      if (o.s <= h.r) {
        const cap = captureDistance(h.r, o.s);
        if (d <= cap) eat.push(o);
        else if (d < reach && pull > 0 && o.mover !== 'car' && o.mover !== 'boat') {
          const k = Math.min(d - cap + 0.01, pull) / d;
          // The pull stops at the wall of a standing building (the building falls in first if it fits).
          if (this.walled(o, o.x - (o.x - h.x) * k, o.z - (o.z - h.z) * k)) continue;
          o.x -= (o.x - h.x) * k; o.z -= (o.z - h.z) * k;
          o.pulled = true;
          this.grid.move(o);
          if (d - pull <= cap) eat.push(o);
        }
      } else if (d < h.r + o.s * 0.55) {
        if (this.t - o.bump > 0.6) this.events.push({ type: 'bump', o });
        o.bump = this.t;
      }
    }
    for (const o of eat) this.swallow(o);
  }

  swallow(o) {
    const h = this.hole;
    if (!o.alive) return false;
    o.alive = false;
    this.grid.remove(o);
    this.left--;
    const before = h.r;
    h.r = grow(h.r, o.s);
    this.lastEat = this.t;
    this.stats.byType[o.type]++;
    const id = TYPES[o.type].id;
    if (id === 'person') this.stats.people++;
    if (id === 'car' || id === 'van' || id === 'bus') this.stats.cars++;
    this.events.push({ type: 'eat', o, dx: o.x - h.x, dz: o.z - h.z, from: before, to: h.r });
    while (h.tier < TIERS.length - 1 && h.r >= TIERS[h.tier + 1].r) {
      h.tier++;
      this.stats.maxTier = h.tier;
      this.events.push({ type: 'tier', tier: h.tier });
    }
    if (this.left === 0) this.events.push({ type: 'cleared' });
    return true;
  }

  // Helpers for hints and scripted players.
  nearestAlive(edibleOnly = true, x = this.hole.x, z = this.hole.z) {
    let best = null, bd = Infinity;
    for (const o of this.objs) {
      if (!o.alive || (edibleOnly && o.s > this.hole.r)) continue;
      const d = (o.x - x) ** 2 + (o.z - z) ** 2;
      if (d < bd) { bd = d; best = o; }
    }
    return best;
  }
  remaining() { return this.objs.filter(o => o.alive); }
}

// ---------------------------------------------------------------- stopwatch, storage, best times, looks

export class Stopwatch {
  constructor(now = () => performance.now()) { this.now = now; this.reset(); }
  reset() { this.acc = 0; this.since = null; this.stopped = false; }
  start() { this.reset(); this.since = this.now(); }
  pause() { if (this.since !== null) { this.acc += this.now() - this.since; this.since = null; } }
  resume() { if (this.since === null && !this.stopped) this.since = this.now(); }
  stop() { this.pause(); this.stopped = true; }
  get running() { return this.since !== null; }
  get elapsed() { return (this.acc + (this.since !== null ? this.now() - this.since : 0)) / 1000; }
}

export function formatTime(sec) {
  if (!isFinite(sec)) return '--:--.-';
  const m = Math.floor(sec / 60), s = sec - m * 60;
  return `${m}:${s < 10 ? '0' : ''}${s.toFixed(1)}`;
}

// Every storage access sits in try/catch: the game must run when storage is blocked.
export class Store {
  constructor(backend, prefix = 'snackhole.') {
    this.prefix = prefix;
    try { this.backend = backend === undefined ? globalThis.localStorage : backend; } catch { this.backend = null; }
  }
  get(key, fallback = null) {
    try { const v = this.backend && this.backend.getItem(this.prefix + key); return v === null || v === undefined ? fallback : JSON.parse(v); }
    catch { return fallback; }
  }
  set(key, value) {
    try { if (!this.backend) return false; this.backend.setItem(this.prefix + key, JSON.stringify(value)); return true; }
    catch { return false; }
  }
}

export class BestTimes {
  constructor(store) { this.store = store; this.mem = {}; }
  key(mapId, seed) { return `best.${mapId}.${seed}`; }
  get(mapId, seed) {
    const k = this.key(mapId, seed);
    const v = this.store.get(k, null);
    const m = this.mem[k];
    const vals = [v, m].filter(x => typeof x === 'number' && isFinite(x) && x > 0);
    return vals.length ? Math.min(...vals) : null;
  }
  submit(mapId, seed, time) {
    const prev = this.get(mapId, seed);
    const isNew = prev === null || time < prev;
    if (isNew) { const k = this.key(mapId, seed); this.mem[k] = time; this.store.set(k, time); }
    return { prev, best: isNew ? time : prev, isNew, beatPrevious: isNew && prev !== null };
  }
}

export const LOOKS = [
  { id: 'classic', name: 'Plain Void', how: 'Yours from the start' },
  { id: 'googly', name: 'Googly Eyes', how: 'Reach Pothole size', test: r => r.maxTier >= 2 },
  { id: 'chomp', name: 'Chompers', how: 'Reach Sinkhole size', test: r => r.maxTier >= 4 },
  { id: 'donut', name: 'Sprinkle Donut', how: 'Swallow the whole city', test: r => r.cleared },
  { id: 'duck', name: 'Drain Duck', how: 'Swallow the whole city twice', test: r => r.cleared && r.clears >= 2 },
  { id: 'hat', name: 'Party Hat', how: 'Beat your own best time', test: r => r.beatPrevious },
  { id: 'burp', name: 'Burper', how: 'Reach Abyss size within 3:00', test: r => r.maxTier >= 6 && r.abyssAt > 0 && r.abyssAt <= 180 },
  { id: 'captain', name: 'Captain Crab', how: 'Clear Sunny Harbour', test: r => r.cleared && r.map === 'harbour' },
  { id: 'scarecrow', name: 'Straw Topper', how: 'Clear Riverside Farm', test: r => r.cleared && r.map === 'farm' },
  { id: 'jester', name: 'Jelly Jester', how: 'Clear Whirligig Fair', test: r => r.cleared && r.map === 'fair' },
  { id: 'stache', name: 'Distinguished', how: 'Swallow the whole city in under 4:30', test: r => r.cleared && r.time < 270 },
];

export function newUnlocks(owned, run) {
  return LOOKS.filter(l => l.test && !owned.includes(l.id) && l.test(run)).map(l => l.id);
}
