// Map definitions, shaped shores and deterministic placement for the additional places.
// Downtown's generator and type indices are preserved in logic.js.
import { WORLD_MAPS, WORLD_TYPES, WORLD_FOOD, worldLandAt } from './worlds.js';
export const MAP_DEFS = {
  harbour: { id: 'harbour', name: 'Sunny Harbour', defaultSeed: 7, colour: '#37c9da', icon: '⚓',
    description: 'A crescent coast and bobbing boats. Your void crosses water.', look: 'captain' },
  farm: { id: 'farm', name: 'Riverside Farm', defaultSeed: 7, colour: '#a9d84d', icon: '✿',
    description: 'Crop rows, wandering sheep and barns across a winding river.', look: 'scarecrow' },
  fair: { id: 'fair', name: 'Whirligig Fair', defaultSeed: 7, colour: '#ff8ab6', icon: '✦',
    description: 'An oval island of candy stalls, teacups and giant fairground rides.', look: 'jester' },
  ...WORLD_MAPS,
};
export const EXTRA_TYPES = [
  { id: 'shell', label: 'shells', s: 0.26, h: 0.22 },
  { id: 'crab', label: 'crabs', s: 0.42, h: 0.35, mover: 'animal' },
  { id: 'buoy', label: 'buoys', s: 0.65, h: 1.2 },
  { id: 'parasol', label: 'parasols', s: 1.65, h: 2.4 },
  { id: 'dinghy', label: 'dinghies', s: 2.6, h: 2, mover: 'boat' },
  { id: 'beachhut', label: 'beach huts', s: 4.6, h: 5.8, solid: [3.0, 3.0] },
  { id: 'boathouse', label: 'boathouses', s: 8.6, h: 10, solid: [5.6, 5.6] },
  { id: 'lighthouse', label: 'lighthouses', s: 13.2, h: 34, solid: [8.4, 8.4] },
  { id: 'liner', label: 'liners', s: 13.2, h: 14, solid: [5.5, 11.5] },
  { id: 'carrot', label: 'carrots', s: 0.24, h: 0.6 },
  { id: 'cabbage', label: 'cabbages', s: 0.45, h: 0.5 },
  { id: 'chicken', label: 'chickens', s: 0.42, h: 0.65, mover: 'bird' },
  { id: 'sheep', label: 'sheep', s: 0.76, h: 1.1, mover: 'animal' },
  { id: 'hay', label: 'hay bales', s: 1.65, h: 1.8 },
  { id: 'tractor', label: 'parked tractors', s: 2.7, h: 3.0, solid: [1.6, 2.0] },
  { id: 'barn', label: 'barns', s: 5.3, h: 8, solid: [3.5, 3.5] },
  { id: 'windmill', label: 'windmills', s: 8.6, h: 17, solid: [5.0, 5.0] },
  { id: 'granary', label: 'great granaries', s: 13.2, h: 25, solid: [8.6, 8.6] },
  { id: 'popcorn', label: 'popcorn tubs', s: 0.26, h: 0.6 },
  { id: 'pinwheel', label: 'pinwheels', s: 0.5, h: 1.3 },
  { id: 'balloon', label: 'balloons', s: 0.65, h: 2.2 },
  { id: 'teacup', label: 'teacups', s: 1.65, h: 1.5 },
  { id: 'cart', label: 'candy carts', s: 2.7, h: 3.5, solid: [1.7, 1.7] },
  { id: 'tent', label: 'striped tents', s: 5.3, h: 7, solid: [3.5, 3.5] },
  { id: 'carousel', label: 'carousels', s: 8.6, h: 10, solid: [5.6, 5.6] },
  { id: 'wheel', label: 'big wheels', s: 13.2, h: 31, solid: [10, 5.5] },
  ...WORLD_TYPES,
];

export function riverX(z) { return 15 * Math.sin(z / 32); }
export function landAt(id, x, z) {
  const worldLand = worldLandAt(id, x, z);
  if (worldLand !== null) return worldLand;
  if (id === 'harbour') return x * x / (135 * 135) + z * z / (133 * 133) < 1 && x < 28 + 0.004 * z * z;
  if (id === 'farm') return Math.abs(x) < 134 && Math.abs(z) < 134 &&
    (Math.abs(x - riverX(z)) > 8 || [-72, 0, 72].some(b => Math.abs(z - b) < 5));
  if (id === 'fair') return x * x / (128 * 128) + z * z / (138 * 138) < 1 && Math.hypot(x, z + 45) > 27;
  return Math.abs(x) <= 140 && Math.abs(z) <= 140;
}
function fitsLand(id, x, z, s) {
  if (!landAt(id, x, z)) return false;
  for (let a = 0; a < 8; a++) if (!landAt(id, x + Math.cos(a * Math.PI / 4) * s, z + Math.sin(a * Math.PI / 4) * s)) return false;
  return true;
}

export function generatePlace(seed, def, TYPES, rnd) {
  const R = (a, b) => a + (b - a) * rnd();
  const index = Object.fromEntries(TYPES.map((t, i) => [t.id, i]));
  const id = def.id, objects = [], occupied = new Map();
  const start = def.start ? { ...def.start } : id === 'harbour' ? { x: -35, z: 24 } : id === 'farm' ? { x: -45, z: 20 } : { x: 0, z: 60 };
  const key = (x, z) => `${Math.floor(x / 12)},${Math.floor(z / 12)}`;
  function free(x, z, s) {
    for (let i = Math.floor((x - s - 14) / 12); i <= Math.floor((x + s + 14) / 12); i++)
      for (let j = Math.floor((z - s - 14) / 12); j <= Math.floor((z + s + 14) / 12); j++)
        for (const o of occupied.get(`${i},${j}`) || []) if (Math.hypot(o.x - x, o.z - z) < o.s + s + 0.3) return false;
    return true;
  }
  function add(type, x, z, extra = {}) {
    const t = TYPES[index[type]];
    const o = { type: index[type], x: +x.toFixed(3), z: +z.toFixed(3), s: +(t.s * R(0.92, 1)).toFixed(3),
      rot: +R(0, Math.PI * 2).toFixed(3), v: +rnd().toFixed(3), ...extra };
    if (t.mover) { o.mover = t.mover; o.region = { x0: x - 12, x1: x + 12, z0: z - 12, z1: z + 12 }; }
    objects.push(o);
    const k = key(x, z); if (!occupied.has(k)) occupied.set(k, []); occupied.get(k).push(o);
    return o;
  }
  function scatter(type, count, zone = null) {
    const t = TYPES[index[type]];
    for (let n = 0; n < count; n++) {
      let placed = false;
      for (let attempt = 0; attempt < 2500; attempt++) {
        let x = R(-126, 126), z = R(-126, 126);
        if (zone === 'start') { x = start.x + R(-7, 7); z = start.z + R(-7, 7); }
        // Crop rows and concentric beds give the places different spatial rhythms.
        if (id === 'farm' && ['carrot', 'cabbage'].includes(type) && zone !== 'start') {
          x = Math.round(x / 3) * 3 + R(-0.2, 0.2); z = Math.round(z / 2.4) * 2.4 + R(-0.2, 0.2);
        }
        if (id === 'fair' && type === 'pinwheel') {
          const a = R(0, Math.PI * 2), rr = [39, 70, 102][n % 3] + R(-9, 9); x = Math.cos(a) * rr; z = Math.sin(a) * rr;
        }
        if (!fitsLand(id, x, z, t.s + 0.5) || !free(x, z, t.s)) continue;
        // Leave a small clear starting patch, surrounded by edible things.
        if (t.s > 0.55 && Math.hypot(x - start.x, z - start.z) < 9 + t.s) continue;
        add(type, x, z, t.solid ? { rot: id === 'fair' ? Math.atan2(x, z) : 0 } : {});
        placed = true; break;
      }
      if (!placed) throw new Error(`Cannot place ${type} ${n}/${count} on ${id}`);
    }
  }
  if (id === 'harbour') {
    for (const [x, z] of [[-6, -102], [-6, 102], [-104, 0]]) add('lighthouse', x, z, { rot: 0 });
    add('liner', 100, 0, { rot: 0 });
    scatter('boathouse', 16); scatter('beachhut', 100); scatter('kiosk', 35);
    scatter('parasol', 150); scatter('bench', 90);
    scatter('buoy', 180); scatter('person', 100); scatter('lamp', 90);
    scatter('shell', 50, 'start'); scatter('shell', 590); scatter('crab', 90);
    scatter('sapling', 400); scatter('flower', 250); scatter('bin', 160);
    // One-way boat loop in the bay, with clear water around the liner and coast.
    for (let n = 0; n < 16; n++) {
      const a = n * Math.PI * 2 / 16;
      add('dinghy', 96 + Math.cos(a) * 16, Math.sin(a) * 70, { rot: 0, route: { a, cx: 96, cz: 0, rx: 16, rz: 70 } });
    }
  } else if (id === 'farm') {
    for (const [x, z] of [[-102, -103], [102, -103], [-102, 103], [102, 103]]) add('granary', x, z, { rot: 0 });
    scatter('windmill', 16); scatter('barn', 100); scatter('tractor', 40); scatter('bigtree', 20);
    scatter('hay', 160); scatter('tree', 80); scatter('sheep', 120); scatter('person', 60); scatter('lamp', 50); scatter('mailbox', 140);
    scatter('carrot', 50, 'start'); scatter('carrot', 590); scatter('cabbage', 400); scatter('sapling', 250); scatter('chicken', 100); scatter('flower', 220);
  } else if (WORLD_FOOD[id]) {
    const food = WORLD_FOOD[id];
    for (const [x, z] of def.landmarks) add(food[8], x, z, { rot: 0 });
    scatter(food[7], 16); scatter(food[6], 100); scatter(food[5], 60);
    scatter(food[4], 200); scatter(food[3], 120); scatter(food[2], 500);
    scatter(food[0], 50, 'start'); scatter(food[0], 590); scatter(food[1], 600);
  } else {
    for (const [x, z] of [[-80, -65], [80, -65], [-70, 85], [70, 85]]) add('wheel', x, z, { rot: 0 });
    scatter('carousel', 16); scatter('tent', 100); scatter('cart', 50); scatter('fountain', 10);
    scatter('teacup', 160); scatter('bench', 80); scatter('balloon', 190); scatter('person', 130); scatter('lamp', 60);
    scatter('popcorn', 50, 'start'); scatter('popcorn', 590); scatter('pinwheel', 380); scatter('flower', 250); scatter('bin', 180); scatter('pigeon', 80);
  }
  return { id, name: def.name, seed, half: 135, edge: 140, lines: [], centres: [], blocks: [], objects,
    pitch: 54, road: 10, start, shaped: true };
}
