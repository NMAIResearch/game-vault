// Everything drawn: city ground, instanced objects, the hole, falling animation, markers, particles, looks.
import * as THREE from '../three.module.min.js';
import { paintPlace } from './place-ground.js';
import { TYPES, TIERS } from './logic.js';
import { modelFor, speckModel, makeObjectMaterial, TINTS, SPECK_COLOURS, cutU } from './models.js';
import { ENDGAME_LEFT, CUT_RANGE, viewDistance, frameCamera, viewFrustum, shouldDraw, inView, speckMode, screenSize } from './view.js';

const holeU = { value: new THREE.Vector3(0, 0, 0.5) };
const timeU = { value: 0 };
const swirlU = { value: 1 };
const rimW = { value: 0.435 };

// Cut a round hole in ground-level surfaces where the black hole is.
function withHoleCut(mat) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uHole = holeU;
    sh.vertexShader = 'varying vec3 vHoleW;\n' + sh.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
      vec4 hw = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        hw = instanceMatrix * hw;
      #endif
      vHoleW = (modelMatrix * hw).xyz;`);
    sh.fragmentShader = 'uniform vec3 uHole;\nvarying vec3 vHoleW;\n' +
      sh.fragmentShader.replace('void main() {', 'void main() {\n  if (distance(vHoleW.xz, uHole.xy) < uHole.z) discard;');
  };
  return mat;
}

class InstSet {
  constructor(geo, mat, cap, key) {
    this.mesh = new THREE.InstancedMesh(geo, mat, Math.max(1, cap));
    this.mesh.count = 0;
    this.mesh.frustumCulled = false;
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.key = key; this.owners = []; this.dirty = false; this.cap = cap;
  }
  add(o, color) {
    if (this.mesh.count >= this.cap) return -1;
    const i = this.mesh.count++;
    this.owners[i] = o; o[this.key] = i;
    if (color) { this.mesh.setColorAt(i, color); this.mesh.instanceColor.needsUpdate = true; }
    return i;
  }
  set(o, m) { const i = o[this.key]; if (i >= 0) { this.mesh.setMatrixAt(i, m); this.dirty = true; } }
  remove(o) {
    const i = o[this.key];
    if (i === undefined || i < 0) return;
    const last = this.mesh.count - 1;
    if (i !== last) {
      const a = this.mesh.instanceMatrix.array; a.copyWithin(i * 16, last * 16, last * 16 + 16);
      if (this.mesh.instanceColor) { const c = this.mesh.instanceColor.array; c.copyWithin(i * 3, last * 3, last * 3 + 3); this.mesh.instanceColor.needsUpdate = true; }
      const mv = this.owners[last]; this.owners[i] = mv; mv[this.key] = i;
    }
    this.owners[last] = undefined;
    this.mesh.count = last; o[this.key] = -1; this.dirty = true;
  }
  clear() { for (let i = 0; i < this.mesh.count; i++) if (this.owners[i]) this.owners[i][this.key] = -1; this.mesh.count = 0; this.owners.length = 0; }
  flush() { if (this.dirty) { this.mesh.instanceMatrix.needsUpdate = true; this.dirty = false; } }
}

function canvasTex(size, draw) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------------------------------------------------------------- ground

const GROUND_SPAN = 300, GROUND_PX = 2048;
function drawGround(map) {
  return canvasTex(GROUND_PX, (g, S) => {
    if (map.shaped) { paintPlace(g, S, map); return; }
    const k = S / GROUND_SPAN, X = x => (x + GROUND_SPAN / 2) * k;
    const rect = (x0, z0, x1, z1, col) => { g.fillStyle = col; g.fillRect(X(x0), X(z0), (x1 - x0) * k, (z1 - z0) * k); };
    rect(-150, -150, 150, 150, '#5fb4d6');
    g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 2;
    for (let n = 0; n < 220; n++) { const x = Math.random() * S, y = Math.random() * S; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 14, y); g.stroke(); }
    rect(-map.edge - 6, -map.edge - 6, map.edge + 6, map.edge + 6, '#ecdcae');
    rect(-map.edge - 2.5, -map.edge - 2.5, map.edge + 2.5, map.edge + 2.5, '#5c9a48');
    rect(-map.edge, -map.edge, map.edge, map.edge, '#4b5059');
    const half = map.road / 2;
    // Lane dashes
    g.fillStyle = '#e9e4cf';
    for (const L of map.lines) {
      for (let p = -map.edge; p < map.edge; p += 4) {
        if (map.lines.some(c => Math.abs(p + 1 - c) < half + 1.5)) continue;
        g.fillRect(X(p), X(L - 0.12), 2 * k, 0.24 * k);
        g.fillRect(X(L - 0.12), X(p), 0.24 * k, 2 * k);
      }
    }
    // Zebra crossings next to each intersection
    g.fillStyle = '#f2efe6';
    for (const A of map.lines) for (const B of map.lines) {
      for (const sgn of [-1, 1]) {
        const c = A + sgn * (half + 1.6);
        if (Math.abs(c) > map.edge) continue;
        for (let w = -half + 0.6; w < half - 0.4; w += 1.2) {
          g.fillRect(X(c - 0.9), X(B + w), 1.8 * k, 0.6 * k);
          g.fillRect(X(B + w), X(c - 0.9), 0.6 * k, 1.8 * k);
        }
      }
    }
    for (const b of map.blocks) {
      const { cx, cz, half: bh, inner } = b;
      rect(cx - bh, cz - bh, cx + bh, cz + bh, '#8d8a85');
      rect(cx - bh + 0.25, cz - bh + 0.25, cx + bh - 0.25, cz + bh - 0.25, '#d3cfc6');
      // sidewalk slabs
      g.strokeStyle = 'rgba(0,0,0,0.07)'; g.lineWidth = 1;
      for (let p = -bh; p <= bh; p += 1.5) {
        g.beginPath(); g.moveTo(X(cx + p), X(cz - bh)); g.lineTo(X(cx + p), X(cz + bh)); g.stroke();
        g.beginPath(); g.moveTo(X(cx - bh), X(cz + p)); g.lineTo(X(cx + bh), X(cz + p)); g.stroke();
      }
      const i0 = inner + 0.4;
      const fill = { plaza: '#e4d8c2', downtown: '#cdc6ba', commercial: '#d6cdbd', park: '#7cc05c', residential: '#94cf70' }[b.kind];
      rect(cx - i0, cz - i0, cx + i0, cz + i0, fill);
      if (b.kind === 'plaza' || b.kind === 'downtown' || b.kind === 'commercial') {
        g.strokeStyle = 'rgba(80,60,40,0.10)';
        for (let p = -i0; p <= i0; p += 2.5) {
          g.beginPath(); g.moveTo(X(cx + p), X(cz - i0)); g.lineTo(X(cx + p), X(cz + i0)); g.stroke();
          g.beginPath(); g.moveTo(X(cx - i0), X(cz + p)); g.lineTo(X(cx + i0), X(cz + p)); g.stroke();
        }
      }
      if (b.kind === 'plaza') {
        g.fillStyle = '#d2c3a8';
        g.beginPath(); g.arc(X(cx), X(cz), 7.5 * k, 0, Math.PI * 2); g.fill();
        g.strokeStyle = '#bfae90'; g.lineWidth = 0.4 * k;
        for (const r of [9, 13, 17]) { g.beginPath(); g.arc(X(cx), X(cz), r * k, 0, Math.PI * 2); g.stroke(); }
      }
      if (b.kind === 'park' || b.kind === 'residential') {
        g.strokeStyle = b.kind === 'park' ? '#e2d4b0' : '#c9c0ad'; g.lineWidth = (b.kind === 'park' ? 2.2 : 1.4) * k; g.lineCap = 'round';
        g.beginPath(); g.moveTo(X(cx - i0), X(cz)); g.bezierCurveTo(X(cx - 6), X(cz - 10), X(cx + 6), X(cz + 10), X(cx + i0), X(cz)); g.stroke();
        g.beginPath(); g.moveTo(X(cx), X(cz - i0)); g.bezierCurveTo(X(cx + 10), X(cz - 4), X(cx - 10), X(cz + 4), X(cx), X(cz + i0)); g.stroke();
      }
    }
    // Soft speckle so big flat areas are not dead flat
    for (let n = 0; n < 9000; n++) {
      const x = Math.random() * S, y = Math.random() * S;
      g.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
      g.fillRect(x, y, 2, 2);
    }
  });
}

// ---------------------------------------------------------------- hole visuals

function holeMeshes() {
  const group = new THREE.Group();
  const well = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1.7, 64, 1, true).translate(0, -0.85, 0), new THREE.ShaderMaterial({
    side: THREE.BackSide, uniforms: { uTime: timeU, uSwirl: swirlU },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform float uTime; uniform float uSwirl; varying vec2 vUv;
      void main(){
        float d = 1.0 - vUv.y;
        vec3 top = vec3(0.20, 0.09, 0.34);
        float band = 0.5 + 0.5 * sin(vUv.x * 6.2831 * 10.0 + d * 9.0 - uTime * 2.2 * uSwirl);
        vec3 c = mix(top, vec3(0.0), pow(d, 0.55)) + vec3(0.10, 0.04, 0.16) * band * (1.0 - d);
        gl_FragColor = vec4(c, 1.0);
      }`,
  }));
  const floor = new THREE.Mesh(new THREE.CircleGeometry(1.02, 64).rotateX(-Math.PI / 2).translate(0, -1.7, 0), new THREE.ShaderMaterial({
    uniforms: { uTime: timeU, uSwirl: swirlU },
    vertexShader: 'varying vec2 vP; void main(){ vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform float uTime; uniform float uSwirl; varying vec2 vP;
      void main(){
        float r = length(vP), a = atan(vP.y, vP.x);
        float arms = smoothstep(0.2, 1.0, sin(a * 3.0 + r * 9.0 - uTime * 1.6 * uSwirl));
        float ring = smoothstep(0.12, 0.5, r) * (1.0 - smoothstep(0.85, 1.02, r));
        vec3 c = vec3(0.30, 0.10, 0.52) * arms * ring * 0.75 + vec3(0.05, 0.18, 0.35) * ring * 0.35;
        gl_FragColor = vec4(c, 1.0);
      }`,
  }));
  const rim = new THREE.Mesh(new THREE.RingGeometry(0.985, 2.0, 96, 1).rotateX(-Math.PI / 2).translate(0, 0.03, 0), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: timeU, uSwirl: swirlU, uW: rimW },
    vertexShader: 'varying vec2 vP; void main(){ vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform float uTime; uniform float uSwirl; uniform float uW; varying vec2 vP;
      void main(){
        float r = length(vP), a = atan(vP.y, vP.x);
        float t = (r - 0.985) / uW;
        float streak = 0.75 + 0.25 * sin(a * 7.0 - uTime * 2.5 * uSwirl + t * 9.0);
        float glow = exp(-t * 9.0) * 1.1 + exp(-t * 3.0) * 0.28 * streak;
        vec3 c = mix(vec3(0.62, 0.32, 1.0), vec3(0.32, 0.86, 1.0), 0.5 + 0.5 * sin(a * 2.0 + uTime * 0.6 * uSwirl));
        gl_FragColor = vec4(c * glow, 1.0);
      }`,
  }));
  rim.renderOrder = 2;
  group.add(well, floor, rim);
  return { group, rim };
}

// ---------------------------------------------------------------- looks (cosmetic, goofy)

function buildLook(id) {
  const g = new THREE.Group();
  const L = c => new THREE.MeshLambertMaterial({ color: c });
  const B = c => new THREE.MeshBasicMaterial({ color: c });
  const parts = {};
  // A low annular body keeps the theme on the rim and the centre open.
  const ring = (radius, tube, colour, height = 0.08) => {
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 8, 40), L(colour));
    mesh.rotation.x = Math.PI / 2; mesh.position.y = height; g.add(mesh); return mesh;
  };
  if (id === 'googly') {
    ring(1.18, .17, 0x778ee0);
    for (const sx of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(.34, 16, 12), B(0xffffff));
      eye.position.set(sx * .42, .34, -.98); eye.scale.set(1, 1, .55);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(.16, 12, 10), B(0x111111));
      pupil.position.set(0, 0, .3); eye.add(pupil);
      g.add(eye); (parts.eyes ||= []).push({ eye, pupil });
    }
  } else if (id === 'chomp') {
    parts.teeth = [];
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2;
      const t = new THREE.Mesh(new THREE.ConeGeometry(.15, .46, 4), L(0xfdfbf2));
      const piv = new THREE.Group(); piv.position.set(Math.cos(a) * 1.02, 0, Math.sin(a) * 1.02); piv.rotation.y = -a;
      t.position.set(0, .12, 0); t.rotation.z = .5; piv.add(t); g.add(piv); parts.teeth.push(piv);
    }
  } else if (id === 'duck') {
    ring(1.2, .18, 0x67cfdd); ring(1.08, .045, 0xe5fbff, .24);
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      const rivet = new THREE.Mesh(new THREE.IcosahedronGeometry(.075, 0), B(0xffe783));
      rivet.position.set(Math.cos(a) * 1.2, .25, Math.sin(a) * 1.2); g.add(rivet);
    }
    const duck = new THREE.Group(), yellow = L(0xffd23f);
    const body = new THREE.Mesh(new THREE.SphereGeometry(.26, 14, 10), yellow); body.scale.set(1, .75, 1.25); body.position.y = .16;
    const head = new THREE.Mesh(new THREE.SphereGeometry(.16, 12, 10), yellow); head.position.set(0, .42, .2);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(.07, .16, 6), L(0xff8a1a)); beak.rotation.x = Math.PI / 2; beak.position.set(0, .4, .38);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(.03, 6, 6), B(0x111111)); eye.position.set(.09, .47, .32);
    const eye2 = eye.clone(); eye2.position.x = -.09;
    duck.add(body, head, beak, eye, eye2); duck.scale.setScalar(1.5); g.add(duck); parts.duck = duck;
  } else if (id === 'burp') {
    const lips = new THREE.Mesh(new THREE.TorusGeometry(1.06, .13, 8, 48), L(0xf06292)); lips.rotation.x = Math.PI / 2; lips.position.y = .06; g.add(lips); parts.lips = lips;
  } else if (id === 'donut') {
    const dough = new THREE.Mesh(new THREE.TorusGeometry(1.2, .26, 10, 48), L(0xd9a066)); dough.rotation.x = Math.PI / 2; dough.position.y = .08;
    const icing = new THREE.Mesh(new THREE.TorusGeometry(1.2, .22, 8, 48), L(0xff8fc0)); icing.rotation.x = Math.PI / 2; icing.position.y = .16; icing.scale.z = .8;
    g.add(dough, icing);
    const cols = [0xffffff, 0x63c5ff, 0xffd23f, 0x7ed957, 0xb07cff];
    for (let i = 0; i < 40; i++) {
      const a = i / 40 * Math.PI * 2 + (i % 3) * .05, rr = 1.2 + ((i * 7) % 5 - 2) * .06;
      const s = new THREE.Mesh(new THREE.BoxGeometry(.03, .03, .12), B(cols[i % cols.length]));
      s.position.set(Math.cos(a) * rr, .36, Math.sin(a) * rr); s.rotation.y = i * 1.7; g.add(s);
    }
  } else if (id === 'hat') {
    ring(1.2, .18, 0x65cde4);
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      const confetti = new THREE.Mesh(new THREE.BoxGeometry(.11, .06, .24), L(i % 2 ? 0xff75ad : 0xffd356));
      confetti.position.set(Math.cos(a) * 1.2, .27, Math.sin(a) * 1.2); confetti.rotation.y = -a; g.add(confetti);
    }
    const hat = new THREE.Group(), cone = new THREE.ConeGeometry(.5, 1.2, 16, 4, true);
    const cols = [], pos = cone.attributes.position;
    for (let i = 0; i < pos.count; i++) { const band = Math.floor((pos.getY(i) + .6) / .3) % 2; cols.push(...(band ? [1, .35, .6] : [.35, .8, 1])); }
    cone.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    const c = new THREE.Mesh(cone, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide, flatShading: true }));
    const pom = new THREE.Mesh(new THREE.IcosahedronGeometry(.15, 1), L(0xffd23f)); pom.position.y = .66;
    hat.add(c, pom); hat.scale.setScalar(.85); hat.position.set(0, .62, -1.23); hat.rotation.z = .2; g.add(hat); parts.hat = hat;
  } else if (id === 'stache') {
    ring(1.18, .17, 0x79553d); ring(1.18, .035, 0xe8c050, .26);
    const st = new THREE.Group(), material = L(0x2a1a12);
    for (const sx of [-1, 1]) {
      const curl = new THREE.Mesh(new THREE.TorusGeometry(.28, .09, 8, 16, Math.PI * 1.3), material);
      curl.position.set(sx * .3, 0, 0); curl.rotation.z = sx > 0 ? Math.PI * 1.15 : -Math.PI * .15 + Math.PI; curl.scale.x = sx; st.add(curl);
    }
    const mono = new THREE.Mesh(new THREE.TorusGeometry(.2, .035, 6, 20), L(0xe8c050)); mono.position.set(.35, .55, 0);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(.19, 16), new THREE.MeshBasicMaterial({ color: 0xcfefff, transparent: true, opacity: .35 })); lens.position.copy(mono.position);
    st.add(mono, lens); st.scale.setScalar(1.15); st.position.set(0, .24, -1.2); g.add(st); parts.stache = st;
  } else if (id === 'captain') {
    ring(1.2, .18, 0x204c70); ring(1.2, .055, 0xfff3cd, .28);
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4, trim = new THREE.Mesh(new THREE.BoxGeometry(.16, .07, .22), L(0xe9c45d));
      trim.position.set(Math.cos(a) * 1.2, .3, Math.sin(a) * 1.2); trim.rotation.y = -a; g.add(trim);
    }
    const hat = new THREE.Mesh(new THREE.CylinderGeometry(.4, .45, .2, 12), L(0xffffff)); hat.position.set(0, .4, -1.2);
    const brim = new THREE.Mesh(new THREE.BoxGeometry(.75, .06, .35), L(0x204c70)); brim.position.set(0, .3, -1.05); g.add(hat, brim);
    for (const s of [-1, 1]) { const claw = new THREE.Mesh(new THREE.TorusGeometry(.23, .1, 6, 12, Math.PI * 1.5), L(0xff6f40)); claw.position.set(s * 1.25, .3, .1); g.add(claw); }
  } else if (id === 'scarecrow') {
    ring(1.2, .2, 0xeab85d); ring(1.12, .05, 0xea7363, .27);
    const stalk = new THREE.BoxGeometry(.045, .035, .5), straw = [L(0xf9d374), L(0xd69b42), L(0xffe49a)];
    for (let i = 0; i < 24; i++) {
      const a = i / 24 * Math.PI * 2, s = new THREE.Mesh(stalk, straw[i % 3]);
      s.position.set(Math.cos(a) * 1.25, .22 + (i % 3) * .015, Math.sin(a) * 1.25); s.rotation.y = Math.PI / 2 - a; g.add(s);
    }
  } else if (id === 'jester') {
    ring(1.2, .17, 0x9975d9);
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2;
      const segment = new THREE.Mesh(new THREE.TorusGeometry(1.2, .19, 8, 4, Math.PI / 6 * .9), L([0xff6da8, 0x64d8e4, 0xffca46][i % 3]));
      segment.rotation.set(Math.PI / 2, 0, a); segment.position.y = .1; g.add(segment);
    }
    for (let i = 0; i < 3; i++) {
      const a = i / 3 * Math.PI * 2 - Math.PI / 2, pivot = new THREE.Group();
      pivot.position.set(Math.cos(a) * 1.2, .3, Math.sin(a) * 1.2); pivot.rotation.z = -Math.cos(a) * .35; pivot.rotation.x = Math.sin(a) * .35;
      const tip = new THREE.Mesh(new THREE.ConeGeometry(.2, .6, 8), L([0xff6da8, 0x64d8e4, 0xffca46][i])); tip.position.y = .25;
      const bell = new THREE.Mesh(new THREE.IcosahedronGeometry(.11, 0), L(0xffed96)); bell.position.y = .6; pivot.add(tip, bell); g.add(pivot);
    }
  }
  return { group: g, parts, id };
}

// ---------------------------------------------------------------- renderer

const SUN = new THREE.Vector3(-0.55, 1, 0.42).normalize();

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.gl.setClearColor(0xbfe6ff);
    this.maxPR = Math.min(window.devicePixelRatio || 1, 2);
    this.pr = this.maxPR;
    this.gl.setPixelRatio(this.pr);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xbfe6ff);
    this.scene.fog = new THREE.Fog(0xbfe6ff, 60, 260);
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.3, 3000);
    this.scene.add(new THREE.HemisphereLight(0xeaf6ff, 0x7a8a5a, 1.55));
    const sun = new THREE.DirectionalLight(0xfff3dc, 1.9); sun.position.copy(SUN).multiplyScalar(100); this.scene.add(sun);

    const { group, rim } = holeMeshes();
    this.holeGroup = group; this.rim = rim; this.scene.add(group);
    this.lookGroup = new THREE.Group(); this.scene.add(this.lookGroup);
    this.look = null;

    this.objMat = makeObjectMaterial();
    this.sets = [];
    this.m = new THREE.Matrix4(); this.q = new THREE.Quaternion(); this.q2 = new THREE.Quaternion();
    this.p = new THREE.Vector3(); this.s = new THREE.Vector3(); this.ax = new THREE.Vector3(); this.up = new THREE.Vector3(0, 1, 0);
    this.col = new THREE.Color();
    this.fallers = []; this.wobblers = new Set(); this.particles = [];
    this.calm = false;
    this.rv = 0.55; this.dist = 18; this.camX = 0; this.camZ = 0;
    this.markerTimer = 0; this.markedEdible = []; this.markedSoon = [];
    this.shock = null; this.menuAngle = 0;
    this.buildShared();
  }

  buildShared() {
    const shadowRound = canvasTex(64, (g, S) => {
      const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
      gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.55, 'rgba(0,0,0,0.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, S, S);
    });
    const shadowSquare = canvasTex(64, (g, S) => {
      g.filter = 'blur(5px)'; g.fillStyle = '#000'; g.fillRect(10, 10, S - 20, S - 20);
    });
    const plane = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
    const decal = { transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 };
    const smat = tex => withHoleCut(new THREE.MeshBasicMaterial({ ...decal, map: tex, opacity: 0.3, color: 0x1a2030 }));
    this.shadowR = new InstSet(plane, smat(shadowRound), 4000, '_shr');
    this.shadowS = new InstSet(plane, smat(shadowSquare), 400, '_shs');
    this.shadowR.mesh.renderOrder = 1; this.shadowS.mesh.renderOrder = 1;
    this.scene.add(this.shadowR.mesh, this.shadowS.mesh);

    // Readability markers: a solid ring with inward arrows means "fits now"; a dashed ring means "fits at the next size".
    const edibleTex = canvasTex(128, (g, S) => {
      const c = S / 2;
      g.lineWidth = 13; g.strokeStyle = 'rgba(20,30,40,0.55)'; g.beginPath(); g.arc(c, c, 48, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 7; g.strokeStyle = '#d8ffe6'; g.beginPath(); g.arc(c, c, 48, 0, Math.PI * 2); g.stroke();
      for (let i = 0; i < 4; i++) {
        g.save(); g.translate(c, c); g.rotate(i * Math.PI / 2);
        g.fillStyle = 'rgba(20,30,40,0.55)'; g.beginPath(); g.moveTo(-13, -63); g.lineTo(13, -63); g.lineTo(0, -46); g.closePath(); g.fill();
        g.fillStyle = '#d8ffe6'; g.beginPath(); g.moveTo(-9, -61); g.lineTo(9, -61); g.lineTo(0, -49); g.closePath(); g.fill();
        g.restore();
      }
    });
    const soonTex = canvasTex(128, (g, S) => {
      const c = S / 2;
      g.setLineDash([14, 12]);
      g.lineWidth = 11; g.strokeStyle = 'rgba(40,25,0,0.5)'; g.beginPath(); g.arc(c, c, 50, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 6; g.strokeStyle = '#ffd36b'; g.beginPath(); g.arc(c, c, 50, 0, Math.PI * 2); g.stroke();
    });
    const mmat = tex => withHoleCut(new THREE.MeshBasicMaterial({ ...decal, polygonOffsetUnits: -4, map: tex, opacity: 0.92 }));
    this.edibleM = new InstSet(plane, mmat(edibleTex), 220, '_me');
    this.soonM = new InstSet(plane, mmat(soonTex), 220, '_ms');
    this.edibleM.mesh.renderOrder = 3; this.soonM.mesh.renderOrder = 3;
    this.scene.add(this.edibleM.mesh, this.soonM.mesh);

    // Panic "!" above fleeing people and animals
    const bang = new THREE.BufferGeometry();
    const g1 = new THREE.BoxGeometry(0.16, 0.5, 0.16).translate(0, 0.42, 0).toNonIndexed(), g2 = new THREE.BoxGeometry(0.16, 0.16, 0.16).toNonIndexed();
    bang.setAttribute('position', new THREE.Float32BufferAttribute([...g1.attributes.position.array, ...g2.attributes.position.array], 3));
    this.bang = new InstSet(bang, new THREE.MeshBasicMaterial({ color: 0xff4757 }), 80, '_bang');
    this.scene.add(this.bang.mesh);

    // Particles
    this.parts = new InstSet(new THREE.OctahedronGeometry(1, 0), new THREE.MeshBasicMaterial({ color: 0xffffff }), 360, '_pi');
    this.scene.add(this.parts.mesh);
    this.partCols = [0xc59bff, 0x7fe0ff, 0xffffff, 0xff9ad5].map(c => new THREE.Color(c));

    // Beacons over the last few objects
    this.beacons = new InstSet(new THREE.CylinderGeometry(1, 1, 1, 12, 1, true).translate(0, 0.5, 0),
      new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.26, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false }), ENDGAME_LEFT + 4, '_bc');
    this.scene.add(this.beacons.mesh);

    // Tier-up shock ring
    this.shockMesh = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 96).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xd9c2ff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.shockMesh.position.y = 0.05; this.shockMesh.visible = false; this.scene.add(this.shockMesh);
  }

  setLook(id) {
    if (this.look) {
      this.lookGroup.remove(this.look.group);
      const geometries = new Set(), materials = new Set();
      this.look.group.traverse(o => { if (o.isMesh) { geometries.add(o.geometry); for (const m of (Array.isArray(o.material) ? o.material : [o.material])) materials.add(m); } });
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
    }
    this.look = buildLook(id || 'classic');
    this.lookGroup.add(this.look.group);
  }

  setCalm(c) { this.calm = c; swirlU.value = c ? 0.3 : 1; }

  setWorld(world) {
    this.world = world;
    const map = world.map;
    if (this.mapKey !== `${map.id}:${map.seed}`) {
      this.mapKey = `${map.id}:${map.seed}`;
      if (this.ground) {
        this.scene.remove(this.ground, this.outer); this.ground.material.map.dispose();
        this.ground.geometry.dispose(); this.ground.material.dispose(); this.outer.geometry.dispose(); this.outer.material.dispose();
      }
      const tex = drawGround(map);
      tex.anisotropy = Math.min(8, this.gl.capabilities.getMaxAnisotropy());
      this.ground = new THREE.Mesh(new THREE.PlaneGeometry(GROUND_SPAN, GROUND_SPAN).rotateX(-Math.PI / 2), withHoleCut(new THREE.MeshLambertMaterial({ map: tex })));
      // The open sea is a frame around the island ground, not a second plane under it, so the two never overlap.
      const sea = new THREE.Shape([[-4000, -4000], [4000, -4000], [4000, 4000], [-4000, 4000]].map(([x, y]) => new THREE.Vector2(x, y)));
      const g = GROUND_SPAN / 2 - 0.5;
      sea.holes.push(new THREE.Path([[-g, -g], [-g, g], [g, g], [g, -g]].map(([x, y]) => new THREE.Vector2(x, y))));
      this.outer = new THREE.Mesh(new THREE.ShapeGeometry(sea).rotateX(-Math.PI / 2), withHoleCut(new THREE.MeshLambertMaterial({ color: map.shaped ? 0x35bad1 : 0x5fb4d6 })));
      this.outer.position.y = -0.05;
      this.scene.add(this.ground, this.outer);
    }
    for (const s of this.sets) { this.scene.remove(s.mesh); s.mesh.dispose(); }
    if (this.specks) { this.scene.remove(this.specks.mesh); this.specks.mesh.dispose(); }
    this.sets = TYPES.map((t, i) => {
      const n = world.objs.filter(o => o.type === i).length;
      const set = new InstSet(n ? modelFor(t.id) : speckModel(), this.objMat, n, '_slot');
      this.scene.add(set.mesh);
      return set;
    });
    this.specks = new InstSet(speckModel(), this.objMat, world.objs.length, '_spk');
    this.scene.add(this.specks.mesh);
    for (const s of [this.shadowR, this.shadowS, this.edibleM, this.soonM, this.bang, this.parts, this.beacons]) s.clear();
    this.fallers.length = 0; this.wobblers.clear(); this.particles.length = 0; this.markedEdible = []; this.markedSoon = [];
    for (const o of world.objs) {
      const t = TYPES[o.type], pal = TINTS[t.id];
      o._col = new THREE.Color(pal ? pal[Math.floor(o.v * pal.length) % pal.length] : 0xffffff);
      o._sq = t.h > 5 && t.id !== 'lamp' && !t.id.includes('tree');
      o._spc = SPECK_COLOURS[t.id] !== undefined ? new THREE.Color(SPECK_COLOURS[t.id]) : o._col;
      o._slot = -1; o._spk = -1;
    }
    this.rv = world.hole.r;
    this.camX = world.hole.x; this.camZ = world.hole.z;
  }

  // Everything alive inside the view is drawn, whatever its size; in the endgame every leftover is drawn.
  // (Round one skipped small things while zoomed out, so leftovers vanished as the hole grew.)
  cull(t) {
    const w = this.world, fr = viewFrustum(this.camera), c = this.camera.position;
    const f = this.h / (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2));
    for (const o of w.objs) {
      if (!o.alive) continue;
      const vis = shouldDraw(o, fr, w.left);
      const full = o._slot >= 0, speck = o._spk >= 0;
      if (!vis) {
        if (full || speck) { this.sets[o.type].remove(o); this.specks.remove(o); this.shadowR.remove(o); this.shadowS.remove(o); }
        continue;
      }
      // The shaped maps pack more props into view. Use rendered pixels for their distant detail threshold.
      const detailScale = w.map.shaped ? Math.min(1, this.pr) : 1;
      const wantSpeck = speckMode(screenSize(o, c.x, c.y, c.z, f) * detailScale, speck, w.left);
      if (wantSpeck && !speck) { this.sets[o.type].remove(o); this.specks.add(o, o._spc); }
      else if (!wantSpeck && !full) { this.specks.remove(o); this.sets[o.type].add(o, o._col); }
      else if (full || speck) continue;
      if (!(o._shr >= 0) && !(o._shs >= 0)) (o._sq ? this.shadowS : this.shadowR).add(o);
      this.placeObject(o, t); this.placeShadow(o);
    }
  }

  placeObject(o, t, tilt = null) {
    const ty = TYPES[o.type], k = o.s / ty.s;
    let y = 0, roll = 0, pitch = 0;
    if (o.mover) {
      if (o.hop > 0) {
        const ph = t * 15 + o.id;
        y = o.mover === 'bird' ? 0.5 + 0.3 * Math.sin(ph) : Math.abs(Math.sin(ph)) * (o.mover === 'car' ? 0.25 : 0.35);
        if (o.mover === 'walker') roll = Math.sin(ph * 1.3) * 0.3;
      } else if (o.mover === 'walker' || o.mover === 'animal') {
        const sp = Math.hypot(o.vx, o.vz);
        if (sp > 0.1) y = Math.abs(Math.sin(t * 9 + o.id)) * 0.06;
      }
    }
    if (o.bump > -9 && this.world) {
      const a = this.world.t - o.bump;
      if (a < 0.7) { const amp = 0.09 / (1 + ty.h / 8); roll += Math.sin(a * 26) * amp * (1 - a / 0.7); pitch += Math.cos(a * 21) * amp * 0.6 * (1 - a / 0.7); }
    }
    this.q.setFromAxisAngle(this.up, o.rot);
    if (roll || pitch) { this.q2.setFromEuler(new THREE.Euler(pitch, 0, roll)); this.q.premultiply(this.q2); }
    if (tilt) this.q.premultiply(tilt);
    this.p.set(o.x, y, o.z);
    if (o._spk >= 0) { this.s.set(o.s * 1.1, ty.h * k * 0.8, o.s * 1.1); this.m.compose(this.p, this.q, this.s); this.specks.set(o, this.m); return; }
    this.s.set(k, k, k);
    this.m.compose(this.p, this.q, this.s);
    this.sets[o.type].set(o, this.m);
  }

  placeShadow(o) {
    const ty = TYPES[o.type];
    const sq = o._sq;
    const h = Math.min(ty.h, 30) * (o.s / ty.s);
    const off = sq ? h * 0.22 : Math.min(h * 0.12, o.s * 0.6);
    const w = sq ? o.s * 1.45 : o.s * (o.mover === 'car' ? 1.6 : 1.5);
    this.p.set(o.x + 0.6 * off, 0.02, o.z - 0.5 * off);
    this.q.setFromAxisAngle(this.up, sq ? o.rot : 0);
    this.s.set(w + off * 0.6, 1, w + off * 0.6);
    this.m.compose(this.p, this.q, this.s);
    (sq ? this.shadowS : this.shadowR).set(o, this.m);
  }

  // Events from World.step
  onEvents(events, t) {
    for (const e of events) {
      if (e.type === 'eat') {
        const o = e.o;
        this.shadowR.remove(o); this.shadowS.remove(o);
        this.edibleM.remove(o); this.soonM.remove(o); this.bang.remove(o); this.specks.remove(o);
        this.wobblers.delete(o);
        if (!(o._slot >= 0)) continue;
        const h = this.world.hole;
        const dx = o.x - h.x, dz = o.z - h.z, l = Math.hypot(dx, dz);
        const ax = l > 1e-3 ? new THREE.Vector3(-dz / l, 0, dx / l) : new THREE.Vector3(1, 0, 0);
        const rel = Math.min(1, o.s / h.r);
        this.fallers.push({ o, t0: t, dur: 0.45 + 0.5 * rel, dx, dz, ax, h: TYPES[o.type].h * (o.s / TYPES[o.type].s) });
        this.burst(o.x, o.z, o.s, this.calm ? 2 : 3 + Math.min(5, Math.round(o.s * 2)));
        if (this.look && this.look.parts.teeth) this.chomp = t;
      } else if (e.type === 'bump') {
        this.wobblers.add(e.o);
      } else if (e.type === 'tier') {
        this.shock = { t0: t };
        this.burst(this.world.hole.x, this.world.hole.z, this.world.hole.r, this.calm ? 6 : 16);
      }
    }
  }

  burst(x, z, s, n) {
    const h = this.world.hole;
    for (let i = 0; i < n; i++) {
      if (this.particles.length >= 340) break;
      const a = Math.random() * Math.PI * 2, sp = 1.5 + Math.random() * 2.5;
      const p = { x: x + (Math.random() - 0.5) * s, y: 0.3 + Math.random() * s, z: z + (Math.random() - 0.5) * s,
        vx: Math.cos(a) * sp, vy: 2 + Math.random() * 3, vz: Math.sin(a) * sp, life: 0.9 + Math.random() * 0.4, age: 0,
        size: Math.max(0.05, Math.min(0.5, 0.08 + h.r * 0.035)) };
      this.parts.add(p, this.partCols[i % 4]);
      this.particles.push(p);
    }
  }

  resize(w, h) {
    this.gl.setSize(w, h, false);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.w = w; this.h = h;
  }

  setPixelRatio(pr) {
    pr = Math.max(0.5, Math.min(this.maxPR, pr));
    if (Math.abs(pr - this.pr) < 0.01) return;
    this.pr = pr; this.gl.setPixelRatio(pr); this.gl.setSize(this.w, this.h, false);
  }

  viewDistance(r) { return viewDistance(r, this.camera.aspect); }

  // Read-only numbers for the play-test: alive objects in view that are not drawn must always be 0.
  diagnostics() {
    const w = this.world, fr = viewFrustum(this.camera);
    let drawn = 0, missedInView = 0, leftoverNotDrawn = 0;
    for (const o of w.objs) {
      if (!o.alive) continue;
      if (o._slot >= 0 || o._spk >= 0) drawn++;
      else { if (inView(o, fr, 0)) missedInView++; if (w.left <= ENDGAME_LEFT) leftoverNotDrawn++; }
    }
    return { alive: w.left, drawn, specks: this.specks.mesh.count, missedInView, leftoverNotDrawn, near: +this.camera.near.toFixed(2), far: Math.round(this.camera.far), dist: +this.dist.toFixed(1) };
  }

  // Screen position of a world point on the ground, in CSS pixels.
  project(x, z, y = 0) {
    this.p.set(x, y, z).project(this.camera);
    return { x: (this.p.x * 0.5 + 0.5) * this.w, y: (-this.p.y * 0.5 + 0.5) * this.h, behind: this.p.z > 1 };
  }

  frame(dt, t, mode) {
    const w = this.world, h = w.hole;
    timeU.value = t;
    // Visual radius eases quickly so growth is felt, not snapped.
    this.rv += (h.r - this.rv) * (1 - Math.exp(-dt * 7));
    holeU.value.set(h.x, h.z, this.rv * 0.995);
    rimW.value = Math.min(1, Math.max(0.435, 0.5 / this.rv));
    this.holeGroup.position.set(h.x, 0, h.z);
    this.holeGroup.scale.setScalar(this.rv);
    this.lookGroup.position.copy(this.holeGroup.position);
    this.lookGroup.scale.setScalar(this.rv);
    this.animateLook(dt, t);

    // Camera: follows the hole exactly (no lag); only the zoom eases.
    const want = mode === 'menu' ? 46 : this.viewDistance(h.r);
    this.dist += (want - this.dist) * (1 - Math.exp(-dt * (this.calm ? 1.2 : 2.2)));
    if (mode === 'menu') this.menuAngle += dt * (this.calm ? 0.03 : 0.06);
    frameCamera(this.camera, h, this.dist, w.map.edge, mode, this.menuAngle, this.touchBias || 0);
    this.scene.fog.near = this.dist * 1.6; this.scene.fog.far = this.dist * 5.5 + 60;
    // Tall things right in front of the lens fade out in a fine stipple instead of filling the screen or being sliced.
    cutU.value = mode === 'menu' ? 0 : this.dist * CUT_RANGE;

    // Objects
    this.cull(t);
    for (const m of w.movers) if (m.alive && (m._slot >= 0 || m._spk >= 0)) { this.placeObject(m, t); this.placeShadow(m); }
    for (const o of w.objs) if (o.pulled) { o.pulled = false; if (o.alive && (o._slot >= 0 || o._spk >= 0)) { this.placeObject(o, t); this.placeShadow(o); } }
    for (const o of this.wobblers) {
      if (!o.alive) { this.wobblers.delete(o); continue; }
      this.placeObject(o, t);
      if (w.t - o.bump > 0.7) this.wobblers.delete(o);
    }
    this.updateFallers(t);
    this.updateMarkers(dt, t, mode);
    this.updateParticles(dt);
    this.updateBeacons(t, mode);
    if (this.shock) {
      const u = (t - this.shock.t0) / 1.3;
      if (u >= 1) { this.shock = null; this.shockMesh.visible = false; }
      else {
        this.shockMesh.visible = true;
        this.shockMesh.position.set(h.x, 0.05, h.z);
        this.shockMesh.scale.setScalar(this.rv * (1.1 + 2.4 * (1 - (1 - u) ** 2)));
        this.shockMesh.material.opacity = 0.55 * (1 - u);
      }
    }
    for (const s of this.sets) s.flush();
    this.specks.flush();
    for (const s of [this.shadowR, this.shadowS, this.edibleM, this.soonM, this.bang, this.parts, this.beacons]) s.flush();
    this.gl.render(this.scene, this.camera);
  }

  updateFallers(t) {
    const h = this.world.hole;
    for (let i = this.fallers.length - 1; i >= 0; i--) {
      const f = this.fallers[i], o = f.o;
      const u = Math.min(1, (t - f.t0) / f.dur);
      const ease = 1 - (1 - u) * (1 - u);
      const ty = TYPES[o.type], k = o.s / ty.s * (1 - 0.6 * u);
      this.q2.setFromAxisAngle(f.ax, -1.25 * Math.min(1, u * 1.6));
      this.q.setFromAxisAngle(this.up, o.rot + u * 1.2).premultiply(this.q2);
      const depth = (f.h + this.rv * 1.7) * u * u * 1.15;
      this.p.set(h.x + f.dx * (1 - ease), -depth + (u < 0.15 ? u * 0.6 : 0), h.z + f.dz * (1 - ease));
      this.s.set(k, k, k);
      this.m.compose(this.p, this.q, this.s);
      this.sets[o.type].set(o, this.m);
      if (u >= 1) { this.sets[o.type].remove(o); this.fallers.splice(i, 1); }
    }
  }

  updateMarkers(dt, t, mode) {
    const w = this.world, h = w.hole;
    this.markerTimer -= dt;
    if (mode === 'menu') { this.edibleM.clear(); this.soonM.clear(); this.bang.clear(); return; }
    if (this.markerTimer <= 0) {
      this.markerTimer = 0.12;
      const reach = this.dist * 0.85;
      const near = w.grid.query(h.x, h.z, reach, []);
      const ed = [], soon = [];
      for (const o of near) {
        if (!o.alive) continue;
        const d = (o.x - h.x) ** 2 + (o.z - h.z) ** 2;
        if (d > reach * reach) continue;
        if (o.s <= h.r) { if (o.s >= h.r * 0.2) ed.push([d, o]); }
        else if (o.tier === h.tier + 1) soon.push([d, o]);
      }
      ed.sort((a, b) => a[0] - b[0]); soon.sort((a, b) => a[0] - b[0]);
      this.edibleM.clear(); this.soonM.clear();
      this.markedEdible = ed.slice(0, 200).map(x => x[1]);
      this.markedSoon = soon.slice(0, 200).map(x => x[1]);
      for (const o of this.markedEdible) this.edibleM.add(o);
      for (const o of this.markedSoon) this.soonM.add(o);
    }
    const spin = this.calm ? 0 : t * 0.8;
    for (const o of this.markedEdible) if (o.alive) {
      this.q.setFromAxisAngle(this.up, spin); this.p.set(o.x, 0.035, o.z); const sz = Math.max(0.5, o.s * 2.5); this.s.set(sz, 1, sz);
      this.m.compose(this.p, this.q, this.s); this.edibleM.set(o, this.m);
    }
    for (const o of this.markedSoon) if (o.alive) {
      this.q.identity(); this.p.set(o.x, 0.03, o.z); const sz = o.s * 2.5; this.s.set(sz, 1, sz);
      this.m.compose(this.p, this.q, this.s); this.soonM.set(o, this.m);
    }
    // Panic marks
    this.bang.clear();
    for (const m of w.movers) {
      if (!m.alive || m.panic <= 0 || m.mover === 'bird') continue;
      if (this.bang.add(m) < 0) break;
      const ty = TYPES[m.type], k = m.s / ty.s;
      this.q.setFromAxisAngle(this.up, t * 3 + m.id);
      this.p.set(m.x, ty.h * k + 0.5 + Math.abs(Math.sin(t * 10 + m.id)) * 0.25, m.z);
      const bs = Math.max(0.8, k * (m.mover === 'car' ? 2.2 : 1));
      this.s.set(bs, bs, bs);
      this.m.compose(this.p, this.q, this.s); this.bang.set(m, this.m);
    }
  }

  updateParticles(dt) {
    const h = this.world.hole;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.age += dt;
      const ax = h.x - p.x, az = h.z - p.z;
      p.vx += ax * 6 * dt; p.vz += az * 6 * dt; p.vy -= 9 * dt;
      p.vx *= 1 - 2 * dt; p.vz *= 1 - 2 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      const inside = Math.hypot(ax, az) < this.rv;
      if (p.y < 0 && !inside) { p.y = 0; p.vy = Math.abs(p.vy) * 0.3; }
      const u = p.age / p.life;
      if (u >= 1 || p.y < -this.rv * 1.5) { this.parts.remove(p); this.particles.splice(i, 1); continue; }
      const sz = p.size * (1 - u * 0.7);
      this.q.setFromAxisAngle(this.up, p.age * 6); this.p.set(p.x, p.y, p.z); this.s.set(sz, sz, sz);
      this.m.compose(this.p, this.q, this.s); this.parts.set(p, this.m);
    }
  }

  // A soft column of light over every leftover in the endgame, wide enough to see from high above.
  updateBeacons(t, mode) {
    const w = this.world;
    this.beacons.clear();
    if (mode === 'menu' || w.left > ENDGAME_LEFT || w.left === 0) { this.lastLeft = null; return; }
    if (this.lastLeft !== w.left) { this.lastLeft = w.left; this.beaconList = w.remaining(); }
    const minR = this.dist * 0.0045, tall = Math.min(60, 10 + this.dist * 0.2);
    for (const o of this.beaconList) {
      if (!o.alive) continue;
      this.beacons.add(o);
      const r = Math.max(0.6 + o.s * 0.6, minR);
      this.q.identity(); this.p.set(o.x, 0, o.z); this.s.set(r, tall, r);
      this.m.compose(this.p, this.q, this.s); this.beacons.set(o, this.m);
    }
  }

  animateLook(dt, t) {
    const L = this.look; if (!L) return;
    const h = this.world.hole, P = L.parts, calm = this.calm;
    if (P.eyes) {
      const sp = Math.hypot(h.vx, h.vz) || 1;
      const tx = h.vx / sp * 0.12, ty = (h.vz / sp) * 0.08;
      for (const { pupil } of P.eyes) {
        pupil.userData.vx = (pupil.userData.vx || 0) + ((tx - pupil.position.x) * 120 - (pupil.userData.vx || 0) * 8) * dt;
        pupil.userData.vy = (pupil.userData.vy || 0) + ((-ty - pupil.position.y) * 120 - (pupil.userData.vy || 0) * 8) * dt;
        pupil.position.x += pupil.userData.vx * dt * (calm ? 0.5 : 1);
        pupil.position.y += pupil.userData.vy * dt * (calm ? 0.5 : 1);
      }
    }
    if (P.teeth) {
      const a = this.chomp ? Math.max(0, 1 - (t - this.chomp) / 0.25) : 0;
      P.teeth.forEach((piv, i) => { piv.children[0].rotation.z = 0.5 + Math.sin(a * Math.PI) * 0.9; piv.children[0].position.y = 0.12 + Math.sin(a * Math.PI) * 0.06; });
    }
    if (P.duck) {
      const a = t * (calm ? 0.4 : 0.9);
      P.duck.position.set(Math.cos(a) * 1.18, Math.sin(t * 4) * 0.03, Math.sin(a) * 1.18);
      P.duck.rotation.y = -a + Math.PI;
      P.duck.rotation.z = Math.sin(t * 3) * 0.12;
    }
    if (P.lips) {
      const b = this.burpT ? Math.max(0, 1 - (t - this.burpT) / 0.6) : 0;
      P.lips.scale.set(1 + b * 0.18, 1 + b * 0.18, 1 + b * 0.6);
    }
    if (P.hat) {
      P.hat.position.y = .62 + Math.sin(t * 2.2) * (calm ? .025 : .05);
      P.hat.rotation.y = t * (calm ? 0.3 : 1);
    }
    if (P.stache) {
      P.stache.rotation.z = Math.sin(t * 3) * (calm ? 0.03 : 0.08);
      P.stache.position.y = .24 + Math.sin(t * 1.7) * .025;
    }
  }
}
