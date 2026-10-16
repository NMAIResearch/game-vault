// Camera framing and the draw decision, shared by the renderer and the checks. No DOM here.
import * as THREE from '../three.module.min.js';
import { TYPES } from './logic.js';

// From this many objects left, every leftover is drawn wherever it is, pinned on screen and shown on the radar.
export const ENDGAME_LEFT = 50;
// From this many left, the radar of the island and its count appear.
export const RADAR_LEFT = 150;

export function viewDistance(r, aspect) {
  return (11 + 8.2 * r) * (aspect < 1 ? Math.pow(1 / aspect, 0.62) : 1);
}

// The near plane moves out as the camera rises, so the depth buffer keeps its precision over a huge city.
// With a fixed 0.3 m near plane the ground, shadows, markers and sea (2 to 5 cm apart) fought for depth
// once the camera was 100 m or more away, and the sea striped through the streets.
export function depthRange(dist) {
  return { near: Math.max(0.3, dist * 0.06), far: dist * 8 + 400 };
}

// Places the camera for play or for the menu orbit and updates its matrices.
export function frameCamera(camera, hole, dist, edge, mode, menuAngle = 0, touchBias = 0) {
  if (mode === 'menu') {
    const pitch = 0.78;
    camera.position.set(hole.x + Math.sin(menuAngle) * Math.cos(pitch) * dist, Math.sin(pitch) * dist, hole.z + Math.cos(menuAngle) * Math.cos(pitch) * dist);
    camera.lookAt(hole.x, 0, hole.z);
  } else {
    const pitch = 0.93;
    // Near the shore the camera stops short, so the city fills the screen and the hole slides off-centre.
    // During touch play, touchBias > 0 shifts the camera target south so the hole stays higher on screen above the thumb.
    const halfW = dist * 0.47 * Math.max(0.5, camera.aspect);
    const span = (v, lo, hi) => lo > hi ? (lo + hi) / 2 : Math.max(lo, Math.min(hi, v));
    const bias = touchBias * dist;
    const cx = span(hole.x, -edge + halfW * 0.6, edge - halfW * 0.6);
    const cz = span(hole.z + bias, -edge + dist * 0.6, edge - dist * (0.2 - touchBias));
    camera.position.set(cx, Math.sin(pitch) * dist, cz + Math.cos(pitch) * dist);
    camera.lookAt(cx, 0, cz - dist * 0.04 + bias * 0.35);
  }
  const { near, far } = depthRange(dist);
  if (camera.near !== near || camera.far !== far) { camera.near = near; camera.far = far; camera.updateProjectionMatrix(); }
  camera.updateMatrixWorld();
}

const _frustum = new THREE.Frustum(), _pv = new THREE.Matrix4(), _sphere = new THREE.Sphere();
export function viewFrustum(camera) {
  _pv.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  return _frustum.setFromProjectionMatrix(_pv);
}

// Tall things nearer the lens than CUT_NEAR * dist are cut away (see makeObjectMaterial); the near plane sits inside that.
export const CUT_RANGE = 0.42, CUT_NEAR = CUT_RANGE * 0.55;

// Is any part of o inside the view? Size never matters: a flower at the far side of the screen is drawn.
export function inView(o, frustum, margin = 2) {
  const t = TYPES[o.type], h = t.h * (o.s / t.s);
  _sphere.center.set(o.x, h * 0.5, o.z);
  _sphere.radius = Math.hypot(o.s * 1.3, h * 0.5) + margin;
  return frustum.intersectsSphere(_sphere);
}

// The one rule for what the renderer draws: everything alive in view, and every leftover once few are left.
export function shouldDraw(o, frustum, left) {
  if (!o.alive) return false;
  return left <= ENDGAME_LEFT || inView(o, frustum);
}

// Far-off things only a few pixels tall are drawn as a small tinted block (36 vertices instead of 120 to 800),
// with hysteresis so nothing flips back and forth. Never in the endgame: every leftover gets its full model.
export const SPECK_IN = 2.5, SPECK_OUT = 4;
export function speckMode(px, wasSpeck, left) {
  if (left <= ENDGAME_LEFT) return false;
  return wasSpeck ? px < SPECK_OUT : px < SPECK_IN;
}
// Rough on-screen height in CSS pixels of o seen from a camera at (cx, cy, cz) with focal length f (pixels).
export function screenSize(o, cx, cy, cz, f) {
  const t = TYPES[o.type], h = t.h * (o.s / t.s);
  const d = Math.hypot(o.x - cx, h * 0.5 - cy, o.z - cz) || 1;
  return Math.max(o.s * 2, h) * f / d;
}
