// Low-poly models built from three.js primitives. Each part carries a vertex colour and a tint mask:
// tinted parts take the instance colour, the rest keep their own colour.
import * as THREE from '../three.module.min.js';
import { placeModel } from './place-models.js';

const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();

function part(geo, color, { p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1], tint = false } = {}) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  m4.compose(v.set(...p), q.setFromEuler(e.set(...r)), sc.set(...s));
  g.applyMatrix4(m4);
  g.computeVertexNormals();
  const n = g.attributes.position.count, c = new THREE.Color(color);
  const col = new Float32Array(n * 3), tm = new Float32Array(n);
  for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; tm[i] = tint ? 1 : 0; }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setAttribute('aTint', new THREE.BufferAttribute(tm, 1));
  return g;
}

function merge(parts) {
  const names = ['position', 'normal', 'color', 'aTint'];
  const total = parts.reduce((a, g) => a + g.attributes.position.count, 0);
  const out = new THREE.BufferGeometry();
  for (const nm of names) {
    const size = parts[0].attributes[nm].itemSize, arr = new Float32Array(total * size);
    let o = 0;
    for (const g of parts) { arr.set(g.attributes[nm].array, o); o += g.attributes[nm].array.length; }
    out.setAttribute(nm, new THREE.BufferAttribute(arr, size));
  }
  out.computeBoundingSphere();
  return out;
}

const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt, rb, h, seg = 8, open = false) => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open);
const oct = r => new THREE.OctahedronGeometry(r, 0);
const ico = (r, d = 0) => new THREE.IcosahedronGeometry(r, d);
const cone = (r, h, seg = 8) => new THREE.ConeGeometry(r, h, seg);

const WHITE = 0xffffff, DARK = 0x2b2f3a, GLASS = 0x34465e, WOOD = 0x9a6a3c, TRUNK = 0x7a5232, LEAF = 0x5fae4f;

function wheels(xs, zs, r, y = r, w = 0.25) {
  const out = [];
  for (const x of xs) for (const z of zs) out.push(part(cyl(r, r, w, 10), 0x1d1f24, { p: [x, y, z], r: [0, 0, Math.PI / 2] }));
  return out;
}

const BUILDERS = {
  flower: () => [
    part(cyl(0.025, 0.025, 0.3, 4, true), 0x3f8a3a, { p: [0, 0.15, 0] }),
    part(cyl(0.19, 0.15, 0.06, 6), WHITE, { p: [0, 0.32, 0], tint: true }),
    part(oct(0.075), 0xffd23f, { p: [0, 0.37, 0] }),
  ],
  cone: () => [
    part(box(0.42, 0.05, 0.42), 0xff7a1a, { p: [0, 0.025, 0] }),
    part(cone(0.18, 0.55, 10), 0xff7a1a, { p: [0, 0.32, 0] }),
    part(cyl(0.115, 0.135, 0.09, 10), WHITE, { p: [0, 0.33, 0] }),
  ],
  hydrant: () => [
    part(cyl(0.15, 0.17, 0.5, 8), WHITE, { p: [0, 0.27, 0], tint: true }),
    part(cyl(0.19, 0.19, 0.07, 8), WHITE, { p: [0, 0.54, 0], tint: true }),
    part(ico(0.12), WHITE, { p: [0, 0.6, 0], tint: true }),
    part(box(0.48, 0.08, 0.08), 0xd9d9d9, { p: [0, 0.36, 0] }),
  ],
  pigeon: () => [
    part(ico(0.15), WHITE, { p: [0, 0.2, 0], s: [0.9, 0.8, 1.4], tint: true }),
    part(ico(0.09), WHITE, { p: [0, 0.34, 0.15], tint: true }),
    part(cone(0.03, 0.08, 5), 0xf0a040, { p: [0, 0.33, 0.25], r: [Math.PI / 2, 0, 0] }),
    part(box(0.14, 0.03, 0.16), WHITE, { p: [0, 0.22, -0.22], r: [0.3, 0, 0], tint: true }),
    part(box(0.12, 0.1, 0.02), 0xf0a040, { p: [0, 0.05, 0] }),
  ],
  bin: () => [
    part(cyl(0.3, 0.26, 0.78, 10), WHITE, { p: [0, 0.39, 0], tint: true }),
    part(cyl(0.33, 0.33, 0.08, 10), 0x3a3f48, { p: [0, 0.82, 0] }),
    part(box(0.16, 0.05, 0.05), 0x3a3f48, { p: [0, 0.89, 0] }),
  ],
  cat: () => [
    part(box(0.26, 0.24, 0.52), WHITE, { p: [0, 0.3, 0], tint: true }),
    part(box(0.25, 0.22, 0.22), WHITE, { p: [0, 0.48, 0.3], tint: true }),
    part(cone(0.05, 0.1, 4), WHITE, { p: [0.08, 0.63, 0.3], tint: true }),
    part(cone(0.05, 0.1, 4), WHITE, { p: [-0.08, 0.63, 0.3], tint: true }),
    part(box(0.05, 0.36, 0.05), WHITE, { p: [0, 0.48, -0.3], r: [-0.3, 0, 0], tint: true }),
    ...[[0.09, 0.18], [-0.09, 0.18], [0.09, -0.18], [-0.09, -0.18]].map(([x, z]) => part(box(0.06, 0.2, 0.06), WHITE, { p: [x, 0.1, z], tint: true })),
    part(box(0.18, 0.04, 0.02), 0x222222, { p: [0, 0.52, 0.415] }),
  ],
  sapling: () => [
    part(cyl(0.05, 0.07, 0.8, 5, true), TRUNK, { p: [0, 0.4, 0] }),
    part(ico(0.42), WHITE, { p: [0, 1.05, 0], s: [1, 1.15, 1], tint: true }),
    part(cyl(0.3, 0.3, 0.06, 6), 0x6b4a2e, { p: [0, 0.03, 0] }),
  ],
  mailbox: () => [
    part(cyl(0.32, 0.34, 1.05, 10), 0xd2302c, { p: [0, 0.52, 0] }),
    part(cyl(0.38, 0.36, 0.14, 10), 0xd2302c, { p: [0, 1.11, 0] }),
    part(ico(0.18), 0xd2302c, { p: [0, 1.2, 0] }),
    part(box(0.3, 0.05, 0.05), 0x1a1a1a, { p: [0, 0.88, 0.32] }),
    part(box(0.2, 0.12, 0.05), 0xf3e6c0, { p: [0, 0.62, 0.32] }),
  ],
  person: () => [
    part(box(0.18, 0.75, 0.2), 0x2c3e66, { p: [0.13, 0.375, 0] }),
    part(box(0.18, 0.75, 0.2), 0x2c3e66, { p: [-0.13, 0.375, 0] }),
    part(box(0.58, 0.66, 0.34), WHITE, { p: [0, 1.08, 0], tint: true }),
    part(box(0.15, 0.6, 0.16), WHITE, { p: [0.4, 1.18, 0], r: [0, 0, 0.55], tint: true }),
    part(box(0.15, 0.6, 0.16), WHITE, { p: [-0.4, 1.18, 0], r: [0, 0, -0.55], tint: true }),
    part(ico(0.25), 0xf0c39a, { p: [0, 1.66, 0] }),
    part(box(0.4, 0.12, 0.36), 0x3b2a1e, { p: [0, 1.86, -0.02] }),
    part(box(0.05, 0.08, 0.02), 0x111111, { p: [0.08, 1.7, 0.225] }),
    part(box(0.05, 0.08, 0.02), 0x111111, { p: [-0.08, 1.7, 0.225] }),
  ],
  dog: () => [
    part(box(0.36, 0.34, 0.8), WHITE, { p: [0, 0.5, 0], tint: true }),
    part(box(0.32, 0.3, 0.34), WHITE, { p: [0, 0.78, 0.5], tint: true }),
    part(box(0.18, 0.14, 0.2), WHITE, { p: [0, 0.72, 0.74], tint: true }),
    part(box(0.07, 0.07, 0.04), 0x111111, { p: [0, 0.76, 0.85] }),
    part(box(0.08, 0.2, 0.14), 0x4a3320, { p: [0.18, 0.8, 0.45], r: [0, 0, 0.3] }),
    part(box(0.08, 0.2, 0.14), 0x4a3320, { p: [-0.18, 0.8, 0.45], r: [0, 0, -0.3] }),
    part(box(0.06, 0.3, 0.06), WHITE, { p: [0, 0.75, -0.45], r: [-0.6, 0, 0], tint: true }),
    ...[[0.12, 0.28], [-0.12, 0.28], [0.12, -0.28], [-0.12, -0.28]].map(([x, z]) => part(box(0.09, 0.34, 0.09), WHITE, { p: [x, 0.17, z], tint: true })),
    part(box(0.36, 0.05, 0.05), 0xd23a3a, { p: [0, 0.64, 0.38] }),
  ],
  lamp: () => [
    part(cyl(0.16, 0.2, 0.3, 8), 0x3a414c, { p: [0, 0.15, 0] }),
    part(cyl(0.07, 0.08, 4.2, 5, true), 0x3a414c, { p: [0, 2.2, 0] }),
    part(box(0.08, 0.08, 0.8), 0x3a414c, { p: [0, 4.25, 0.35] }),
    part(box(0.34, 0.16, 0.5), 0xfff2b0, { p: [0, 4.15, 0.7] }),
  ],
  bench: () => [
    part(box(2.2, 0.09, 0.55), WOOD, { p: [0, 0.48, 0.05] }),
    part(box(2.2, 0.42, 0.08), WOOD, { p: [0, 0.82, -0.24], r: [-0.12, 0, 0] }),
    ...[-0.9, 0.9].map(x => part(box(0.08, 0.48, 0.5), 0x33363d, { p: [x, 0.24, 0.02] })),
    ...[-0.9, 0.9].map(x => part(box(0.08, 0.5, 0.08), 0x33363d, { p: [x, 0.68, -0.22] })),
  ],
  car: () => [
    part(box(1.5, 0.62, 2.85), WHITE, { p: [0, 0.55, 0], tint: true }),
    part(box(1.3, 0.55, 1.5), WHITE, { p: [0, 1.12, -0.15], tint: true }),
    part(box(1.34, 0.34, 1.36), GLASS, { p: [0, 1.14, -0.15] }),
    part(box(0.3, 0.14, 0.04), 0xfff4c0, { p: [0.48, 0.62, 1.43] }),
    part(box(0.3, 0.14, 0.04), 0xfff4c0, { p: [-0.48, 0.62, 1.43] }),
    part(box(0.3, 0.12, 0.04), 0xd03030, { p: [0.5, 0.62, -1.43] }),
    part(box(0.3, 0.12, 0.04), 0xd03030, { p: [-0.5, 0.62, -1.43] }),
    ...wheels([0.72, -0.72], [0.9, -0.9], 0.3),
  ],
  tree: () => [
    part(cyl(0.16, 0.22, 2.0, 6, true), TRUNK, { p: [0, 1.0, 0] }),
    part(ico(1.35), WHITE, { p: [0, 2.7, 0], tint: true }),
    part(ico(0.95), WHITE, { p: [0.35, 3.6, 0.15], tint: true }),
    part(ico(0.8), WHITE, { p: [-0.5, 3.2, -0.3], tint: true }),
  ],
  kiosk: () => [
    part(box(3.0, 2.4, 2.4), WHITE, { p: [0, 1.2, 0], tint: true }),
    part(box(2.2, 0.9, 0.06), GLASS, { p: [0, 1.5, 1.21] }),
    part(box(2.4, 0.12, 0.5), 0xd8c8a8, { p: [0, 1.0, 1.4] }),
    ...[0, 1, 2, 3, 4].map(k => part(box(0.66, 0.08, 1.1), k % 2 ? WHITE : 0xe0473c, { p: [-1.32 + k * 0.66, 2.55, 1.55], r: [0.32, 0, 0] })),
    part(box(3.2, 0.2, 2.6), 0xeeeeee, { p: [0, 2.5, 0] }),
    part(box(1.6, 0.5, 0.1), 0xffd23f, { p: [0, 2.95, 0.6] }),
  ],
  van: () => [
    part(box(1.9, 1.9, 4.4), WHITE, { p: [0, 1.25, -0.1], tint: true }),
    part(box(1.92, 0.6, 0.9), GLASS, { p: [0, 1.65, 1.75] }),
    part(box(1.94, 0.25, 4.42), 0xf2f2f2, { p: [0, 0.9, -0.1] }),
    ...wheels([0.92, -0.92], [1.35, -1.4], 0.38),
  ],
  bigtree: () => [
    part(cyl(0.3, 0.45, 3.6, 7), TRUNK, { p: [0, 1.8, 0] }),
    part(ico(2.4, 1), WHITE, { p: [0, 4.7, 0], tint: true }),
    part(ico(1.7), WHITE, { p: [0.9, 6.3, 0.4], tint: true }),
    part(ico(1.5), WHITE, { p: [-1.1, 5.9, -0.6], tint: true }),
  ],
  bus: () => [
    part(box(2.4, 2.6, 6.0), WHITE, { p: [0, 1.65, 0], tint: true }),
    part(box(2.44, 0.8, 5.2), GLASS, { p: [0, 2.2, -0.2] }),
    part(box(2.0, 1.0, 0.06), GLASS, { p: [0, 2.0, 3.0] }),
    part(box(1.2, 0.3, 0.08), 0xffb020, { p: [0, 2.75, 3.01] }),
    part(box(2.42, 0.12, 6.02), 0xf5f5f5, { p: [0, 1.3, 0] }),
    ...wheels([1.12, -1.12], [2.0, -2.0], 0.5, 0.5, 0.3),
  ],
  fountain: () => [
    part(cyl(2.9, 3.0, 0.65, 14), 0xc9c2b4, { p: [0, 0.32, 0] }),
    part(cyl(2.6, 2.6, 0.08, 14), 0x5ab4e8, { p: [0, 0.6, 0] }),
    part(cyl(0.4, 0.5, 1.5, 8), 0xc9c2b4, { p: [0, 1.1, 0] }),
    part(cyl(1.1, 0.6, 0.3, 10), 0xc9c2b4, { p: [0, 1.85, 0] }),
    part(ico(0.38), 0x8fd3ff, { p: [0, 2.2, 0] }),
  ],
  house: () => {
    const p = [
      part(box(6, 3.8, 6), WHITE, { p: [0, 1.9, 0], tint: true }),
      part(cone(4.5, 2.8, 4), 0xb4533c, { p: [0, 5.2, 0], r: [0, Math.PI / 4, 0] }),
      part(box(0.6, 1.6, 0.6), 0x8c4a3a, { p: [1.6, 5.4, -1.2] }),
      part(box(1.1, 2.0, 0.08), 0x6a4026, { p: [0, 1.0, 3.01] }),
    ];
    for (const [x, z, ry] of [[-1.8, 3.01, 0], [1.8, 3.01, 0], [3.01, 0, Math.PI / 2], [-3.01, 0, Math.PI / 2], [-1.5, -3.01, 0], [1.5, -3.01, 0]])
      p.push(part(box(1.1, 1.0, 0.08), 0xbfe3f5, { p: [x, 2.5, z], r: [0, ry, 0] }));
    return p;
  },
  shop: () => [
    part(box(7, 4.6, 7), WHITE, { p: [0, 2.3, 0], tint: true }),
    part(box(7.2, 0.5, 7.2), 0xeeeeee, { p: [0, 4.85, 0] }),
    part(box(5.6, 2.0, 0.08), GLASS, { p: [0, 1.3, 3.51] }),
    ...[0, 1, 2, 3, 4, 5, 6].map(k => part(box(0.86, 0.08, 1.3), k % 2 ? WHITE : 0x2f8f6f, { p: [-2.58 + k * 0.86, 2.75, 4.0], r: [0.35, 0, 0] })),
    part(box(4.0, 0.8, 0.12), 0xffd23f, { p: [0, 3.7, 3.56] }),
  ],
  apartment: () => {
    const p = [part(box(11.5, 22, 11.5), WHITE, { p: [0, 11, 0], tint: true })];
    for (let f = 0; f < 7; f++) p.push(part(box(11.62, 1.2, 11.62), 0x3c4d63, { p: [0, 2.6 + f * 2.9, 0] }));
    for (const x of [-3.2, 0, 3.2]) p.push(part(box(0.5, 20.5, 11.8), WHITE, { p: [x, 10.6, 0], tint: true }));
    for (const z of [-3.2, 0, 3.2]) p.push(part(box(11.8, 20.5, 0.5), WHITE, { p: [0, 10.6, z], tint: true }));
    p.push(part(box(12, 0.6, 12), 0xd9d4cc, { p: [0, 22.2, 0] }));
    p.push(part(box(2.5, 1.6, 2.5), 0x9aa0a8, { p: [2.5, 23.3, -2] }));
    p.push(part(cyl(1.0, 1.0, 2.0, 8), 0x8a6a4a, { p: [-3, 23.5, 2.5] }));
    p.push(part(box(2.2, 2.6, 0.1), 0x5a3e2a, { p: [0, 1.3, 5.8] }));
    return p;
  },
  tower: () => {
    const p = [part(box(17, 46, 17), WHITE, { p: [0, 23, 0], tint: true })];
    for (let f = 0; f < 12; f++) p.push(part(box(17.15, 2.0, 17.15), 0x2b4866, { p: [0, 3.5 + f * 3.6, 0] }));
    p.push(part(box(13, 12, 13), WHITE, { p: [0, 52, 0], tint: true }));
    for (let f = 0; f < 3; f++) p.push(part(box(13.15, 1.8, 13.15), 0x2b4866, { p: [0, 48 + f * 3.4, 0] }));
    p.push(part(box(8, 2, 8), 0xd9d4cc, { p: [0, 59, 0] }));
    p.push(part(cyl(0.25, 0.35, 8, 6), 0xbcc4cc, { p: [0, 64, 0] }));
    p.push(part(ico(0.5), 0xff6a5a, { p: [0, 68.2, 0] }));
    p.push(part(box(6, 3.5, 0.15), GLASS, { p: [0, 1.75, 8.55] }));
    return p;
  },
};

// Instance colours (pale, so untinted details keep their own colour).
export const TINTS = {
  flower: [0xff5d8f, 0xffd23f, 0xff7a3d, 0xb07cff, 0xffffff, 0x63c5ff],
  hydrant: [0xd8352e, 0xf2c230, 0xd8352e],
  pigeon: [0x9aa3b0, 0xb8bec8, 0x7d8694, 0xd9d4cc],
  bin: [0x3f8f5a, 0x4f6f8f, 0x5b6470],
  cat: [0xf29a3a, 0x6b6b6b, 0x2e2e2e, 0xf4efe6, 0xc9a27a],
  sapling: [0x7cc45a, 0x5fae4f, 0x8bd16a],
  person: [0xff6b6b, 0x4fb3ff, 0xffd23f, 0x7ed957, 0xc58cff, 0xff9f43, 0xf5f5f5, 0x3d7dd8],
  dog: [0xc58a52, 0xf2e3c6, 0x3a2e28, 0xe0b060, 0xffffff],
  car: [0xe84a4a, 0x3f86e0, 0xf2c230, 0x5ac46a, 0xf4f4f4, 0x9a6ae0, 0xff8a3a, 0x40c8c8],
  tree: [0x5fae4f, 0x4c9c48, 0x76bf55, 0x89c45a],
  kiosk: [0x7fc8e8, 0xf2a7b8, 0xb8e08a, 0xf5d77a],
  van: [0xf4f4f4, 0x5a8fd0, 0xe8c050, 0xd65a5a],
  bigtree: [0x4f9e45, 0x3f8e40, 0x6aae4a, 0xd98a3a],
  bus: [0xf2b630, 0xe0473c, 0x3f86e0],
  house: [0xf6e7c9, 0xf2c7c0, 0xc8e0f0, 0xdcefc8, 0xf5d9a8, 0xe6d6f2],
  shop: [0xf7d6a0, 0xc9e6dc, 0xf2c4c4, 0xdad4f0],
  apartment: [0xe8dccb, 0xd4c4b0, 0xc8d6e0, 0xe0c8b8, 0xd8e0c8],
  tower: [0x9fc4e0, 0xbfd6e6, 0xd8d2c4, 0x8fb8b0],
};

Object.assign(TINTS, {
  shell: [0xffd4a3, 0xff9db2, 0xfff0c4], cabbage: [0x76c83f, 0xa0df4b],
  beachhut: [0xff9b75, 0x60c9d8, 0xffde73, 0xc39af5], boathouse: [0xffdb9e, 0x84c9d8],
  parasol: [0xff714f, 0xffd442, 0x58c6e5, 0xec80cf], dinghy: [0xffbd4a, 0xff6c5c, 0x64c9e0],
  barn: [0xf16a50, 0xd84b45, 0xf08250], tractor: [0x77bf4b, 0xffad35],
  balloon: [0xff658f, 0x58caee, 0xffcf43, 0xb488ee], teacup: [0xfc91c0, 0x6ed7e1, 0xae9cf5],
  cart: [0xff8eb4, 0x6acfd8], tent: [0xf471a7, 0x6cc9d8, 0xa78ce8], popcorn: [0xff6785, 0x6acfe5],
});

// Colour of the stand-in block for types whose main colour is not the instance tint.
export const SPECK_COLOURS = { cone: 0xff7a1a, mailbox: 0xd2302c, lamp: 0x3a414c, bench: 0x9a6a3c, fountain: 0xc9c2b4 };
let speck = null;
export function speckModel() { return speck ||= merge([part(box(1, 1, 1), WHITE, { p: [0, 0.5, 0], tint: true })]); }

const cache = {};
export function modelFor(id) {
  if (!cache[id]) cache[id] = merge(BUILDERS[id] ? BUILDERS[id]() : placeModel(id, { part, box, cyl, cone, ico, wheels, THREE }));
  return cache[id];
}

// Distance from the camera inside which objects fade out in a fixed stipple (0 turns it off).
export const cutU = { value: 0 };

// Lambert with per-part tinting; vertex colours carry the base colour.
export function makeObjectMaterial() {
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uCut = cutU;
    sh.vertexShader = 'attribute float aTint;\nvarying vec3 vCutW;\n' + sh.vertexShader.replace('#include <color_vertex>',
      THREE.ShaderChunk.color_vertex.replace('vColor.xyz *= instanceColor.xyz;', 'vColor.xyz *= mix(vec3(1.0), instanceColor.xyz, aTint);'))
      .replace('#include <project_vertex>', `#include <project_vertex>
      vec4 cw = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        cw = instanceMatrix * cw;
      #endif
      vCutW = (modelMatrix * cw).xyz;`);
    // Fragments close to the lens: fully cut nearest, then a 2 by 2 ordered stipple that thins out with distance.
    sh.fragmentShader = 'uniform float uCut;\nvarying vec3 vCutW;\n' + sh.fragmentShader.replace('void main() {', `void main() {
  if (uCut > 0.0) {
    float k = (distance(vCutW, cameraPosition) / uCut - 0.55) / 0.45;
    if (k < 1.0) {
      vec2 c = mod(floor(gl_FragCoord.xy), 2.0);
      if (k < 0.0 || (c.x * 2.0 + c.y + 0.5) / 4.0 > k) discard;
    }
  }`);
  };
  return mat;
}
