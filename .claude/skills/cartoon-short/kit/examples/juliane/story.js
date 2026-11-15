// Shot plan: Juliane Koepcke (1971, LANSA 508) — timed to voice (63.40 s, 30 fps).
import { M, clamp, lerp, lerp3, ramp, camFromKeys, idle, blinkAt, q, walk } from './motion.js';
import { riverX, HUT } from './world.js';
export const FPS = 30, TOTAL = 1902;
export const SHOTS = [
  { id: 'fall', a: 0, b: 179, light: 'sky', sets: ['sky'] },
  { id: 'alive', a: 180, b: 266, light: 'jungle', sets: ['jungle'] },
  { id: 'portrait', a: 267, b: 350, light: 'studio', sets: ['studio'] },
  { id: 'aerial', a: 351, b: 551, light: 'aerial', sets: ['jungle'] },
  { id: 'storm', a: 552, b: 683, light: 'storm', sets: ['storm'] },
  { id: 'tumble', a: 684, b: 782, light: 'stormsky', sets: ['sky'] },
  { id: 'canopy', a: 783, b: 879, light: 'jungle', sets: ['jungle'] },
  { id: 'land', a: 880, b: 932, light: 'jungle', sets: ['jungle'] },
  { id: 'stand', a: 933, b: 1013, light: 'jungle', sets: ['jungle'] },
  { id: 'hurt', a: 1014, b: 1188, light: 'jungle', sets: ['jungle'] },
  { id: 'dad', a: 1189, b: 1265, light: 'memory', sets: ['jungle'] },
  { id: 'crane', a: 1266, b: 1397, light: 'memory', sets: ['jungle'] },
  { id: 'trekA', a: 1398, b: 1470, light: 'jday', sets: ['jungle'] },
  { id: 'trekB', a: 1471, b: 1530, light: 'golden', sets: ['jungle'] },
  { id: 'trekC', a: 1531, b: 1570, light: 'jnight', sets: ['jungle'] },
  { id: 'trekD', a: 1571, b: 1611, light: 'jday', sets: ['jungle'] },
  { id: 'found', a: 1612, b: 1748, light: 'golden', sets: ['jungle'] },
  { id: 'seats', a: 1749, b: 1901, light: 'seats', sets: ['seats'] },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const sm = M.smooth;
// ---------- lights ----------
const BASE = { az: 140, el: 46, sky: '#c4d6f2', ground: '#8a8262', hemi: 1.15, sun: '#fff1dc', sunI: 2.5, fog: '#cadcf0', fogNear: 60, fogFar: 700,
  skyTop: '#3f80d4', skyHor: '#c3daf2', sat: 1.1, waterDeep: '#3c6a5a', waterShal: '#7fa88a', glint: '#effaff', vig: 0.2, shadowExt: 16 };
export const LIGHTS = {
  sky: { ...BASE, az: 150, el: 40, fog: '#d6e6f6', fogNear: 300, fogFar: 2600, skyTop: '#3d78d0', skyHor: '#d6e8f8', hemi: 1.2, sunI: 2.4 },
  stormsky: { ...BASE, az: 150, el: 30, sky: '#8a92aa', ground: '#3a3f4a', hemi: 1.0, sun: '#c8d0e8', sunI: 1.3, fog: '#7a8296', fogNear: 120, fogFar: 1400, skyTop: '#3a4058', skyHor: '#8a92a8', sat: 0.95, vig: 0.3 },
  storm: { ...BASE, az: 160, el: 35, sky: '#6a72a0', ground: '#20222e', hemi: 0.95, sun: '#b8c4e8', sunI: 1.2, fog: '#2a3048', fogNear: 70, fogFar: 420, skyTop: '#121628', skyHor: '#3a4260', sat: 0.95, vig: 0.34 },
  jungle: { ...BASE, az: 120, el: 66, sky: '#d0eab0', ground: '#3a3a1e', hemi: 1.3, sun: '#fff0c8', sunI: 2.4, fog: '#a3c48a', fogNear: 18, fogFar: 170, skyTop: '#7fb0d8', skyHor: '#d8eac0', sat: 1.12, vig: 0.24, shadowExt: 30 },
  aerial: { ...BASE, az: 140, el: 50, fog: '#cfe0e8', fogNear: 140, fogFar: 760, skyTop: '#4a86d6', skyHor: '#d2e4ee', sat: 1.12, shadowExt: 90 },
  jday: { ...BASE, az: 110, el: 60, sky: '#d0eab0', ground: '#4a4a2a', hemi: 1.25, sun: '#fff2d0', sunI: 2.5, fog: '#b8d4a4', fogNear: 30, fogFar: 260, skyTop: '#5f9ad8', skyHor: '#d4e8d0', sat: 1.12, shadowExt: 30 },
  golden: { ...BASE, az: 20, el: 12, sky: '#9a90c8', ground: '#6a4c40', hemi: 1.0, sun: '#ffb46c', sunI: 2.8, fog: '#f0b88c', fogNear: 30, fogFar: 300, skyTop: '#6f6eb0', skyHor: '#ffc27e', sunDisc: '#fff0c8', sunSize: 0.0035, sat: 1.12, gain: '#fff2e2', vig: 0.26, waterDeep: '#4a5a7a', waterShal: '#d99a6e', glint: '#ffe2a8', shadowExt: 30 },
  jnight: { ...BASE, az: 60, el: 40, sky: '#4a5a9a', ground: '#1a1a2a', hemi: 0.85, sun: '#a8c0ff', sunI: 1.3, fog: '#1e2a4a', fogNear: 12, fogFar: 140, skyTop: '#0e1430', skyHor: '#2a3a6a', sat: 0.92, gain: '#d8e4ff', vig: 0.36, waterDeep: '#1a2a4a', waterShal: '#3a5a8a', glint: '#c8d8ff', shadowExt: 26 },
  memory: { ...BASE, az: 120, el: 55, sky: '#f0e6c8', ground: '#5a4a2e', hemi: 1.3, sun: '#fff0d0', sunI: 2.2, fog: '#e6dcbc', fogNear: 30, fogFar: 300, skyTop: '#a8c0d8', skyHor: '#f0e6c8', sat: 0.86, gain: '#fff0dc', vig: 0.3, shadowExt: 40 },
  studio: { ...BASE, az: 200, el: 52, sky: '#ffffff', ground: '#e8d9bc', hemi: 1.35, sun: '#fff6e4', sunI: 1.9, fog: '#eaf0dc', fogNear: 60, fogFar: 200, skyTop: '#eaf0dc', skyHor: '#eaf0dc', sat: 1.05, vig: 0.16, shadowExt: 10 },
  seats: { ...BASE, az: 180, el: 72, sky: '#4a3f7a', ground: '#14102a', hemi: 0.55, sun: '#fff0c8', sunI: 1.5, fog: '#0c0a1e', fogNear: 20, fogFar: 90, skyTop: '#0c0a1e', skyHor: '#171230', sat: 1.05, vig: 0.4, shadowExt: 22 },
};
export const lightFor = (S) => ({ ...LIGHTS[S.light] });
// ---------- motion paths ----------
const fallY = (f) => -(f * 0.36);
const tumbleY = (f) => -(f - 684) * 0.42;
const canopyY = (f) => (f < 867 ? lerp(46, 21, ramp(f, 783, 867) ** 1.4) : lerp(21, 17, ramp(f, 867, 879)));
const landY = (f) => (f < 892 ? lerp(5.5, 0, ramp(f, 880, 892) ** 2) : 0);
const HURT_Z = (f) => lerp(-3.5, -11.5, ramp(f, 1014, 1188));
const RZ = -30, RX = riverX(RZ) - 10.2; // girl at the bank
const TREK = { trekA: [-22, -14], trekB: [8, 13], trekC: [28, 31], trekD: [48, 52] };
const trekPos = (S, f) => { const [z0, z1] = TREK[S.id], z = lerp(z0, z1, ramp(f, S.a, S.b)); return [riverX(z) - 9.2, 0, z]; };
const GIRL_F = [HUT[0] + 3.0, 0, HUT[2] - 7.5];
// ---------- cameras ----------
const CAMS = {
  portrait: [{ f: 267, pos: [-0.8, 1.4, -3.2], look: [0, 1.5, 0], fov: 34 }, { f: 350, pos: [0.6, 1.45, -2.9], look: [0, 1.55, 0], fov: 32 }],
  aerial: [{ f: 351, pos: [-70, 150, -150], look: [30, 0, 40], fov: 46 }, { f: 551, pos: [-30, 115, -95], look: [30, 0, 90], fov: 42 }],
  storm: [{ f: 552, pos: [30, 7, -27], look: [0, -0.5, 0], fov: 44 }, { f: 640, pos: [26, 5.5, -23], look: [0, -0.5, 0], fov: 42 }, { f: 683, pos: [28, 3, -30], look: [-2, -7, 0], fov: 48, roll: 6 }],
  stand: [{ f: 933, pos: [0.6, 1.15, -3.4], look: [-0.4, 1.0, 0], fov: 40 }, { f: 1013, pos: [3.2, 6.5, -9.5], look: [-0.4, 1.4, 0], fov: 44, roll: -2 }],
  dad: [{ f: 1189, pos: [RX - 7.5, 1.7, RZ - 5.5], look: [RX + 2, 1.3, RZ + 1], fov: 40 }, { f: 1265, pos: [RX - 6.2, 1.65, RZ - 4.6], look: [RX + 1.6, 1.3, RZ + 1], fov: 37 }],
  crane: [{ f: 1266, pos: [RX - 6.2, 1.65, RZ - 4.6], look: [RX + 1.6, 1.3, RZ + 1], fov: 37 }, { f: 1397, pos: [RX - 26, 62, RZ - 70], look: [riverX(80), 0, 80], fov: 44, ease: 'smooth' }],
  found: [{ f: 1612, pos: [GIRL_F[0] + 8, 1.7, GIRL_F[2] - 9], look: [GIRL_F[0] - 1.5, 1.3, GIRL_F[2] + 2.5], fov: 42 }, { f: 1748, pos: [GIRL_F[0] + 6, 1.6, GIRL_F[2] - 6.5], look: [GIRL_F[0] - 1.0, 1.3, GIRL_F[2] + 2], fov: 38 }],
  seats: [{ f: 1749, pos: [-1.2, 5.2, 2.2], look: [-1.6, 0.9, 3.85], fov: 40 }, { f: 1800, pos: [-0.6, 8.5, -0.5], look: [-1.2, 0.6, 5], fov: 44 }, { f: 1901, pos: [6, 15, -12], look: [0, 0, 13], fov: 50, roll: 0 }],
};
const KICKS = [{ f: 624, a: 0.05 }, { f: 642, a: 0.08 }, { f: 652, a: 0.05 }, { f: 867, a: 0.08 }, { f: 892, a: 0.09 }, { f: 898, a: 0.04 }];
export const camAt = (f) => {
  const S = shotAt(f); let c;
  switch (S.id) {
    case 'fall': { const y = fallY(f), u = ramp(f, 0, 179); c = { pos: [lerp(2.4, -1.2, sm(u)), y + lerp(1.6, 0.9, u), lerp(-3.4, -3.0, u)], look: [0, y + 1.0, 0], fov: lerp(38, 44, u), roll: lerp(-6, 5, u) }; break; }
    case 'alive': { const u = ramp(f, 180, 266); c = { pos: [lerp(1.0, 0.5, u), lerp(0.95, 1.05, u), lerp(-3.4, -2.6, sm(u))], look: [0, 0.95, 0], fov: lerp(40, 36, u), roll: 0 }; break; }
    case 'tumble': { const y = tumbleY(f), u = ramp(f, 684, 782); c = { pos: [lerp(-2.2, 1.6, u), y + 1.3, lerp(-4.6, -3.9, u)], look: [0, y + 0.8, 0], fov: 44, roll: lerp(8, -8, u) }; break; }
    case 'canopy': { const y = canopyY(f); c = { pos: [-7.5, Math.max(25.5, y + 2.5), -13], look: [0, Math.max(19, y + 0.8), 0], fov: 44, roll: -3 }; break; }
    case 'land': { const u = ramp(f, 880, 932); c = { pos: [lerp(1.6, 1.0, u), 1.35, lerp(-4.4, -3.6, u)], look: [0, 1.0, 0], fov: 40, roll: 0 }; break; }
    case 'hurt': { const z = HURT_Z(f), u = ramp(f, 1014, 1188), hi = sm(ramp(f, 1110, 1188)); c = { pos: [-3 + lerp(1.4, 2.4, hi), lerp(1.6, 9, hi), z - lerp(4.2, 8.5, hi)], look: [-3, lerp(1.4, 1.0, hi), z], fov: lerp(40, 46, hi), roll: 0 }; break; }
    case 'trekA': case 'trekB': case 'trekC': case 'trekD': { const p = trekPos(S, f); c = { pos: [p[0] - 5.2, 1.6, p[2] - 3.8], look: [p[0] + 1.2, 1.25, p[2] + 1.2], fov: 40, roll: 0 }; break; }
    default: c = camFromKeys(CAMS[S.id], f, { creep: 0.0012, kicks: [] });
  }
  for (const k of KICKS) { const d = f - k.f; if (d >= 0 && d < 7) { const s = (d % 2 ? -1 : 1) * k.a * (1 - d / 7); c.look = [c.look[0], c.look[1] + s * 3, c.look[2] + s * 2]; c.roll = (c.roll || 0) + s * 20; } }
  let fl = 0;
  const pulse = (a, n, k) => { if (f >= a && f < a + n) fl = Math.max(fl, k * (1 - (f - a) / n)); };
  pulse(180, 8, 0.5); pulse(267, 6, 0.35); pulse(552, 6, 0.3); pulse(624, 7, 0.95); pulse(631, 4, 0.5); pulse(642, 10, 0.7); pulse(867, 6, 0.4);
  pulse(1189, 10, 0.6); pulse(1471, 6, 0.7); pulse(1531, 6, 0.7); pulse(1571, 6, 0.7); 
  c.flash = fl;
  return c;
};
// ---------- lens ----------
const d3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  const at = (p, cinf) => ({ focus: d3(C.pos, p), cinf });
  switch (S.id) {
    case 'fall': return at([0, fallY(f) + 1.2, 0], 9);
    case 'alive': return at([0, 1.1, 0], 13);
    case 'portrait': return at([0, 1.4, 0], 11);
    case 'aerial': return { focus: 200, cinf: 0 };
    case 'storm': return { focus: 45, cinf: 0 };
    case 'tumble': return at([0, tumbleY(f) + 1.1, 0], 9);
    case 'canopy': return at([0, canopyY(f) + 1, 0], 6);
    case 'land': return at([0, 1.0, 0], 11);
    case 'stand': return at([-0.9, 1.2, -0.3], 9);
    case 'hurt': return at([-3, 1.2, HURT_Z(f)], f < 1110 ? 11 : 5);
    case 'dad': case 'crane': return at([RX, 1.3, RZ], S.id === 'dad' ? 10 : 3);
    case 'found': return at([GIRL_F[0], 1.2, GIRL_F[2]], 9);
    case 'seats': return at([-1.6, 1.1, 3.9], f < 1800 ? 12 : 3);
    default: { const p = trekPos(S, f); return at([p[0], 1.2, p[2]], 10); }
  }
};
// ---------- world state ----------
export const worldAt = (f) => {
  const S = shotAt(f), W = { brk: 0, seat: null };
  if (S.id === 'storm') W.brk = M.easeOut(ramp(f, 642, 683)) * 1.0;
  const sp = (p, roll = 0) => ({ p, roll });
  switch (S.id) {
    case 'fall': W.seat = sp([0, fallY(f), 0], q(0.12 * Math.sin(f * 0.07), 3)); break;
    case 'tumble': W.seat = sp([0, tumbleY(f), 0], q(0.55 * Math.sin((f - 684) * 0.09), 3)); break;
    case 'alive': W.seat = sp([0, 0, 0], 0.08); break;
    case 'canopy': W.seat = sp([0, canopyY(f), 0], q(f < 867 ? (f - 783) * 0.03 : 2.5 + (f - 867) * 0.02, 3)); break;
    case 'land': W.seat = sp([0, landY(f), 0], q(f < 892 ? 0.4 - ramp(f, 880, 892) * 0.32 : 0.08, 3)); break;
    case 'stand': W.seat = sp([0.4, 0, 0.3], 0.08); break;
  }
  return W;
};
// ---------- actors ----------
const R = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
const TINT = { sky: '#ffffff', stormsky: '#dfe2ec', storm: '#c8cfe8', jungle: '#f2f6e6', aerial: '#ffffff', jday: '#ffffff', golden: '#ffe2c8', jnight: '#b8c8f0', memory: '#fff1de', studio: '#ffffff', seats: '#fff4dc' };
const GS = 0.85; // girl scale
export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [], tint = TINT[S.light], bl = (s) => blinkAt(f, s), id = idle(f, 4);
  const J = (o, pos, extra = {}) => out.push(R(T, 'juli', { seed: 4, blink: bl(4), bob: q(id.bob, 3), headTilt: q(id.headTilt, 1), ...o }, pos, { tint, s: GS, ...extra }));
  const hurt = { cuts: true, sash: true };
  switch (S.id) {
    case 'fall': J({ expr: f < 60 ? 'shock' : 'pained', L: 'up', R: 'up', belt: true, blink: 0, mouth: 1, headTilt: q(4 * Math.sin(f * 0.3), 1) }, [0, fallY(f), 0], { roll: q(0.12 * Math.sin(f * 0.07), 3), blob: false }); break;
    case 'alive': { const ok = f >= 237; J({ expr: ok ? 'relief' : 'dazed', L: 'hang', R: ok ? 'hip' : 'hang', belt: true, cuts: true, blink: ok ? bl(4) : 0 }, [0, 0, 0], { roll: 0.08 }); break; }
    case 'portrait': J({ expr: f < 290 ? 'neutral' : 'smile', L: 'hang', R: f > 300 && (f % 50) < 32 ? 'wave' : 'hang', wv: q(f * 0.35, 1) }, [0, 0, 0], { s: 0.95 }); break;
    case 'tumble': J({ expr: 'shock', L: 'up', R: 'up', belt: true, blink: 0 }, [0, tumbleY(f), 0], { roll: q(0.55 * Math.sin((f - 684) * 0.09), 3), blob: false }); break;
    case 'canopy': J({ expr: 'shock', L: 'up', R: 'up', belt: true, blink: 0 }, [0, canopyY(f), 0], { roll: q(f < 867 ? (f - 783) * 0.03 : 2.5 + (f - 867) * 0.02, 3), blob: false }); break;
    case 'land': J({ expr: f < 900 ? 'dazed' : 'pained', L: 'hang', R: 'hang', belt: true, cuts: true, blink: 0 }, [0, landY(f), 0], { roll: q(f < 892 ? 0.4 - ramp(f, 880, 892) * 0.32 : 0.08, 3) }); break;
    case 'stand': { const look = Math.sin(f * 0.07) * 0.8; J({ expr: f < 960 ? 'pained' : 'nervous', L: 'hang', R: 'hang', ...hurt, look: q(look, 1), headTilt: q(look * 6, 1) }, [-0.9, 0, -0.3]); break; }
    case 'hurt': { const w = walk(f, 1014, 0.8, 0.5); J({ expr: 'pained', L: 'hang', R: 'hang', ...hurt, step: q(w.phase, 2), tilt: q(4 * Math.sin(w.phase * Math.PI * 2), 1), facing: 0 }, [-3, 0, HURT_Z(f)]); break; }
    case 'dad': case 'crane': {
      J({ expr: f < 1215 ? 'nervous' : 'neutral', L: 'hang', R: 'hang', ...hurt, look: 0.7, facing: 1 }, [RX, 0, RZ]);
      const a = S.id === 'dad' ? clamp((f - 1195) / 20) : clamp(1 - (f - 1330) / 30);
      if (a > 0.02) out.push(R(T, 'dad', { seed: 12, expr: 'smile', L: 'hang', R: 'point', facing: 1, look: 0.8, blink: bl(12) }, [RX + 0.7, 0, RZ - 1.0], { tint: '#e8f0ff', alpha: q(a * 0.85, 2), s: 1.0 }));
      break; }
    case 'trekA': case 'trekB': case 'trekC': case 'trekD': {
      const p = trekPos(S, f), w = walk(f, S.a, 0.7, 0.45);
      J({ expr: S.id === 'trekD' ? 'pained' : S.id === 'trekC' ? 'nervous' : 'neutral', L: 'hang', R: 'hang', ...hurt, step: q(w.phase, 2), facing: 1, look: 0.4, tilt: q(3 * Math.sin(w.phase * Math.PI * 2), 1) }, p);
      break; }
    case 'found': {
      J({ expr: f < 1665 ? 'pained' : 'relief', L: 'hang', R: f > 1700 ? 'wave' : 'hang', wv: q(f * 0.3, 1), ...hurt, look: -0.5 }, GIRL_F);
      const u = sm(ramp(f, 1650, 1715)), w = walk(f, 1650, 1.0, 0.7);
      out.push(R(T, 'local1', { seed: 21, expr: f < 1665 ? 'shock' : 'smile', L: f > 1715 ? 'reach' : 'hang', R: 'hang', step: u < 0.99 ? q(w.phase, 2) : 0, facing: -1, blink: bl(21) }, [lerp(HUT[0] - 1, GIRL_F[0] - 1.1, u), 0, lerp(HUT[2] - 2, GIRL_F[2] + 0.6, u)], { tint }));
      out.push(R(T, 'local2', { seed: 22, expr: f < 1665 ? 'shock' : 'grin', L: 'hang', R: f > 1720 ? 'point' : 'hang', step: u < 0.99 ? q((w.phase + 0.5) % 1, 2) : 0, facing: -1, blink: bl(22) }, [lerp(HUT[0] + 1.2, GIRL_F[0] - 2.3, u), 0, lerp(HUT[2] - 1, GIRL_F[2] + 1.6, u)], { tint }));
      break; }
    case 'seats': J({ expr: 'neutral', L: 'hang', R: 'hang', look: 0, blink: bl(4) }, [-1.6, -0.03, 3.7], { s: 0.8 }); break;
  }
  return out;
};
// ---------- 2D effects ----------
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  const hash = (n) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
  if (S.id === 'storm') {
    for (let i = 0; i < 3; i++) out.push(FX('rain' + i, (p) => T.fxRain(p), [-14 + i * 14, 6 - ((f * 2.4 + i * 9) % 18), -20], 9, { alpha: 0.6, order: 6 }));
    if (f >= 624 && f < 634) out.push(FX('bolt', (p) => T.fxBolt(p), [3.5, 2, 2], 11, { order: 6 }));
    if (f >= 642) for (let i = 0; i < 14; i++) { const t = (f - 642) / 30; out.push(FX('deb', (p) => T.fxShard(p), [(hash(i) - 0.5) * 20 + (hash(i + 9) - 0.5) * t * 14, -t * 8 * hash(i + 3) + (hash(i + 5) - 0.5) * 4, (hash(i + 7) - 0.5) * 8], 1.6, { roll: q(t * 6 + i, 1), tint: '#c8ccd8' })); }
    if (f >= 642) for (let i = 0; i < 3; i++) { const t = clamp((f - 642) / 40); out.push(FX('sm' + i + q(t, 2), (p) => T.fxSmoke(p, t, '#3a3a44'), [-2 + i * 2, -3, 1], 7, { alpha: 0.8 })); }
  }
  if (S.id === 'tumble') for (let i = 0; i < 10; i++) { const y = tumbleY(f) + 2 - ((f * 0.5 + i * 3) % 8); out.push(FX('dbt', (p) => (i % 2 ? T.fxPaper(p) : T.fxShard(p)), [(hash(i) - 0.5) * 6, y, (hash(i + 3) - 0.2) * 5], 0.5, { roll: q(f * 0.1 + i, 1) })); }
  if (S.id === 'canopy' && f >= 862) { const t = clamp((f - 862) / 18); for (let i = 0; i < 16; i++) { const a = hash(i) * 6.28; out.push(FX('lf', (p) => T.fxLeaf(p, ['#4f8f3a', '#6aa848', '#3b7030'][i % 3]), [Math.cos(a) * t * 4, 21 + Math.sin(a) * t * 3 - t * t * 2, Math.sin(a * 1.7) * 2], 0.32, { roll: q(t * 8 + i, 1) })); } }
  if (S.id === 'alive' || S.id === 'land' || S.id === 'stand') for (let i = 0; i < 10; i++) { const t = ((f * 0.006 + i / 10) % 1); out.push(FX('lf2', (p) => T.fxLeaf(p, ['#4f8f3a', '#6aa848', '#8a9a3a'][i % 3]), [-2.5 + hash(i) * 5 + Math.sin(t * 7 + i) * 0.5, 4.5 - t * 4.5, -1.5 + hash(i + 4) * 3], 0.12, { roll: q(t * 9 + i, 1) })); }
  if (S.id === 'land' && f >= 892 && f < 912) { const t = q((f - 892) / 20, 2); out.push(FX('dust' + t, (p) => T.fxDust(p, t, '#9a8a6a'), [0, 0, 0.9], 0.9, { order: 6, alpha: 0.8 })); }
  if (S.id === 'dad' && f >= 1195 && f < 1215) { const t = q((f - 1195) / 20, 2); out.push(FX('sp' + t, (p) => T.fxBurst(p, t, '#fff6c8', 12, 40, 220), [RX + 0.7, 1.4, RZ - 1.0], 1.6, { order: 6 })); }
  if (S.id === 'crane' || S.id === 'found') for (let i = 0; i < 3; i++) { const t = ((f * 0.008 + i / 3) % 1); out.push(FX('hs' + i + q(t, 2), (p) => T.fxSmoke(p, t, '#d8d4cc'), [HUT[0] + 3, 4 + i * 2, HUT[2] + 2], 4 + i, { alpha: 0.7 })); }
  if (S.id === 'trekD' || (S.id === 'trekC' && f > 1555)) { const p0 = trekPos(S, f); for (let i = 0; i < 5; i++) { const a = f * 0.25 + i * 1.3; out.push(FX('fly' + (f % 2), (p) => T.fxFly(p, f * 0.5 + i), [p0[0] + Math.cos(a) * 0.45, 1.2 + Math.sin(a * 1.7) * 0.25, p0[2] + Math.sin(a) * 0.3 - 0.2], 0.07, { order: 6 })); } }
  if (S.id === 'found' && f >= 1690) for (let i = 0; i < 4; i++) { const t = ((f - 1690) * 0.02 + i * 0.25) % 1; out.push(FX('heart', (p) => T.fxHeart(p), [GIRL_F[0] - 1.2 + Math.sin(i * 2 + f * 0.1) * 0.8, 2.3 + t * 1.4, GIRL_F[2] + 0.5], 0.25, { alpha: 1 - t })); }
  return out;
};
