// Shot plan: "Orang yang selamat dari dua bom atom" (Tsutomu Yamaguchi) — timed to voice (49.56 s, 30 fps).
import { M, clamp, lerp, lerp3, ramp, camFromKeys, idle, blinkAt, q, walk } from './motion.js';
export const FPS = 30, TOTAL = 1487;
export const SHOTS = [
  { id: 'hook', a: 0, b: 92, light: 'dusk', sets: ['city'] },
  { id: 'cal', a: 93, b: 158, light: 'void', sets: ['void'] },
  { id: 'naga2', a: 159, b: 224, light: 'nagasaki', sets: ['valley'] },
  { id: 'portrait', a: 225, b: 341, light: 'studio', sets: ['studio'] },
  { id: 'hiro', a: 342, b: 506, light: 'day', sets: ['city'] },
  { id: 'ruin', a: 507, b: 635, light: 'ash', sets: ['ruins'] },
  { id: 'train', a: 636, b: 763, light: 'dawn', sets: ['rail'] },
  { id: 'family', a: 764, b: 812, light: 'dawn', sets: ['station'] },
  { id: 'sign', a: 813, b: 938, light: 'dusk2', sets: ['station'] },
  { id: 'office', a: 939, b: 1040, light: 'office', sets: ['office'] },
  { id: 'blast', a: 1041, b: 1163, light: 'office', sets: ['office'] },
  { id: 'rise', a: 1164, b: 1259, light: 'golden', sets: ['ruins'] },
  { id: 'park', a: 1260, b: 1346, light: 'day', sets: ['park'] },
  { id: 'scale', a: 1347, b: 1486, light: 'stage', sets: ['stage'] },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const sm = M.smooth;
// ---------- lights ----------
const BASE = { az: 140, el: 46, sky: '#c4d6f2', ground: '#8a8262', hemi: 1.15, sun: '#fff1dc', sunI: 2.5, fog: '#cadcf0', fogNear: 60, fogFar: 700,
  skyTop: '#3f80d4', skyHor: '#c3daf2', sat: 1.1, waterDeep: '#2c6c8c', waterShal: '#5aaec4', glint: '#effaff', vig: 0.2, shadowExt: 16 };
export const LIGHTS = {
  day: { ...BASE },
  dusk: { ...BASE, az: 200, el: 14, sky: '#c98aa8', ground: '#5a3a44', hemi: 1.0, sun: '#ff9a4e', sunI: 2.3, fog: '#e0906c', fogNear: 50, fogFar: 600, skyTop: '#3d2f66', skyHor: '#ff9d5c', sat: 1.12, gain: '#fff0e0', vig: 0.26 },
  dusk2: { ...BASE, az: 215, el: 10, sky: '#b87aa0', ground: '#5a3a44', hemi: 1.0, sun: '#ff8d48', sunI: 2.4, fog: '#d8805f', fogNear: 40, fogFar: 520, skyTop: '#33285a', skyHor: '#ff9552', sat: 1.12, vig: 0.28 },
  void: { ...BASE, az: 200, el: 40, sky: '#9fb0ff', ground: '#33406e', hemi: 1.3, sun: '#dfe6ff', sunI: 1.4, fog: '#17204a', fogNear: 30, fogFar: 90, skyTop: '#17204a', skyHor: '#1f2a5e', sat: 1.0, vig: 0.3 },
  nagasaki: { ...BASE, az: 200, el: 16, sky: '#d8a690', ground: '#5a4a44', hemi: 1.05, sun: '#ffb070', sunI: 2.2, fog: '#e8a880', fogNear: 60, fogFar: 640, skyTop: '#5a4a7a', skyHor: '#ffc080', sat: 1.1, vig: 0.26 },
  studio: { ...BASE, az: 200, el: 52, sky: '#ffffff', ground: '#e8d9bc', hemi: 1.35, sun: '#fff6e4', sunI: 1.9, fog: '#f1e7d1', fogNear: 60, fogFar: 200, skyTop: '#f1e7d1', skyHor: '#f1e7d1', sat: 1.05, vig: 0.16, shadowExt: 10 },
  ash: { ...BASE, az: 215, el: 22, sky: '#a8806e', ground: '#4a3a38', hemi: 0.95, sun: '#ffb07c', sunI: 1.6, fog: '#9a6a56', fogNear: 18, fogFar: 260, skyTop: '#4a2f3a', skyHor: '#c9805a', sat: 0.98, gain: '#ffe9dc', vig: 0.3, shadowExt: 14 },
  dawn: { ...BASE, az: 30, el: 11, sky: '#b6a8d8', ground: '#7a6a5a', hemi: 1.05, sun: '#ffc890', sunI: 2.6, fog: '#f6c9a0', fogNear: 50, fogFar: 600, skyTop: '#6f78c0', skyHor: '#ffd2a0', sunDisc: '#fff0c8', sunSize: 0.004, sat: 1.12, vig: 0.24 },
  golden: { ...BASE, az: 8, el: 9, sky: '#9a90c8', ground: '#6a4c40', hemi: 1.0, sun: '#ffb46c', sunI: 2.9, fog: '#f0b88c', fogNear: 40, fogFar: 520, skyTop: '#6f6eb0', skyHor: '#ffc27e', sunDisc: '#fff0c8', sunSize: 0.0035, sat: 1.12, gain: '#fff2e2', vig: 0.26, shadowExt: 14 },
  office: { ...BASE, az: -70, el: 38, sky: '#fff1d8', ground: '#a8805a', hemi: 1.3, sun: '#ffe2b8', sunI: 1.6, fog: '#e4d3ae', fogNear: 30, fogFar: 120, skyTop: '#9ec8ee', skyHor: '#cfe3f4', sat: 1.08, vig: 0.24, shadowExt: 9 },
  stage: { ...BASE, az: 180, el: 72, sky: '#4a3f7a', ground: '#14102a', hemi: 0.5, sun: '#fff0c8', sunI: 1.5, fog: '#0c0a1e', fogNear: 20, fogFar: 80, skyTop: '#0c0a1e', skyHor: '#171230', sat: 1.05, vig: 0.4, shadowExt: 10 },
};
export const lightFor = (S) => ({ ...LIGHTS[S.light] });
// ---------- cameras ----------
const HERO_EYE = 1.45;
const CAMS = {
  hook: [{ f: 0, pos: [0.25, 1.55, -3.2], look: [0, 1.45, 0], fov: 34 }, { f: 40, pos: [0.3, 1.58, -3.5], look: [-0.1, 1.5, 0], fov: 36 }, { f: 92, pos: [1.5, 1.9, -5.4], look: [0.2, 2.6, 0], fov: 44 }],
  cal: [{ f: 93, pos: [0, 1.05, -4.6], look: [0, 1.05, 0], fov: 38 }, { f: 158, pos: [0.1, 1.05, -3.8], look: [0, 1.08, 0], fov: 36, roll: 2 }],
  naga2: [{ f: 159, pos: [-0.7, 1.2, -4.2], look: [0, 1.5, 0], fov: 40 }, { f: 224, pos: [-0.3, 1.45, -3.0], look: [0, 1.55, 0], fov: 34, roll: 3 }],
  portrait: [{ f: 225, pos: [-1.5, 1.5, -3.6], look: [0, 1.7, 0], fov: 34 }, { f: 341, pos: [1.2, 1.55, -3.2], look: [0, 1.7, 0], fov: 32 }],
  ruin: [{ f: 507, pos: [0.5, 1.7, -4.8], look: [0, 1.5, 0], fov: 40 }, { f: 590, pos: [0.25, 1.62, -3.3], look: [0, 1.52, 0], fov: 34 }, { f: 635, pos: [0.1, 1.6, -2.6], look: [0, 1.55, 0], fov: 30, roll: -3 }],
  rise: [{ f: 1164, pos: [0.3, 1.0, -3.2], look: [0, 1.5, 0], fov: 38 }, { f: 1259, pos: [0.9, 1.7, -5.2], look: [0, 1.7, 0], fov: 42, roll: 2 }],
  park: [{ f: 1260, pos: [-0.8, 1.5, -4.6], look: [0, 1.6, 0], fov: 40 }, { f: 1346, pos: [0.8, 1.5, -3.8], look: [0, 1.6, 0], fov: 36 }],
  scale: [{ f: 1347, pos: [0, 2.0, -6.4], look: [0, 1.7, 3], fov: 42 }, { f: 1430, pos: [0, 1.9, -5.6], look: [0, 1.7, 3], fov: 40 }, { f: 1486, pos: [0, 1.8, -5.0], look: [0, 1.7, 3], fov: 38, roll: 2 }],
  family: [{ f: 764, pos: [0.4, 2.05, -3.4], look: [0.2, 2.0, 1], fov: 40 }, { f: 812, pos: [0.1, 2.0, -2.8], look: [0.1, 2.05, 1], fov: 36 }],
  sign: [{ f: 813, pos: [0.0, 1.5, -5.6], look: [0, 3.0, 3], fov: 54 }, { f: 890, pos: [0.0, 1.5, -5.3], look: [0, 3.4, 3], fov: 52, roll: -2 }, { f: 938, pos: [0.0, 1.6, -4.7], look: [0, 3.6, 3], fov: 48, roll: -4 }],
  office: [{ f: 939, pos: [0.0, 1.8, -3.4], look: [0, 1.9, 3], fov: 52 }, { f: 1040, pos: [0.0, 1.8, -2.8], look: [0, 1.95, 3], fov: 48 }],
  blast: [{ f: 1041, pos: [0.0, 1.8, -2.8], look: [0, 1.95, 3], fov: 48 }, { f: 1100, pos: [0.0, 1.75, -3.1], look: [0, 1.9, 3], fov: 50, roll: 4 }, { f: 1163, pos: [0.0, 1.7, -3.6], look: [0, 1.9, 3], fov: 52, roll: 2 }],
};
const TRAIN_V = 0.55, TRAIN_X0 = -20;
const trainX = (f) => TRAIN_X0 + (f - 636) * TRAIN_V;
const HIRO_X = (f) => -7 + (f - 342) * 0.045;
const KICKS = [{ f: 39, a: 0.05 }, { f: 159, a: 0.06 }, { f: 477, a: 0.06 }, { f: 891, a: 0.06 }, { f: 1041, a: 0.09 }, { f: 1050, a: 0.05 }, { f: 1062, a: 0.03 }];
export const camAt = (f) => {
  const S = shotAt(f);
  let c;
  if (S.id === 'train') {
    const tx = trainX(f) + 12 + 1.35; // middle car, window 2
    const u = ramp(f, 636, 763);
    c = { pos: [tx + lerp(4.0, 2.0, u), lerp(3.4, 2.9, u), lerp(-11.0, -8.5, u)], look: [tx - 0.1, 2.2, 0], fov: lerp(36, 28, sm(u)), roll: lerp(-2, 2, u) };
  } else if (S.id === 'hiro') {
    const hx = HIRO_X(f), u = ramp(f, 342, 506);
    c = f < 477 ? { pos: [hx + lerp(-0.6, 0.4, sm(u * 1.4)), lerp(1.55, 1.7, u), -7.8 + u * 1.6], look: [hx + 0.4, 1.45, -3], fov: lerp(36, 30, u), roll: 0 }
      : { pos: [hx + 0.3, 1.6, -5.5], look: [hx + 0.4, 1.7, -3], fov: 26 - (f - 477) * 0.1, roll: (f - 477) * 0.12 };
  } else c = camFromKeys(CAMS[S.id], f, { creep: 0.0012, kicks: [] });
  for (const k of KICKS) { const d = f - k.f; if (d >= 0 && d < 7) { const s = (d % 2 ? -1 : 1) * k.a * (1 - d / 7); c.look = [c.look[0], c.look[1] + s * 3, c.look[2] + s * 2]; c.roll = (c.roll || 0) + s * 20; } }
  // flashes
  let fl = 0;
  if (f >= 39 && f < 46) fl = 0.6 * (1 - (f - 39) / 7);
  if (f >= 159 && f < 168) fl = 0.9 * (1 - (f - 159) / 9);
  if (f >= 93 && f < 99) fl = Math.max(fl, 0.5 * (1 - (f - 93) / 6));
  if (f >= 477 && f < 484) fl = (f - 477) / 7; if (f >= 484 && f < 507) fl = 1;
  if (S.id === 'ruin' && f < 540) fl = Math.max(fl, 1 - (f - 507) / 33);
  if (f >= 1041 && f < 1046) fl = (f - 1041) / 5; if (f >= 1046 && f < 1090) fl = Math.max(fl, 1 - (f - 1046) / 44);
  if (S.id === 'rise' && f < 1190) fl = Math.max(fl, 0.5 * (1 - (f - 1164) / 26));
  if (f >= 228 && f < 234) fl = Math.max(fl, 0.4 * (1 - (f - 228) / 6));
  if (f >= 636 && f < 641) fl = Math.max(fl, 0.4 * (1 - (f - 636) / 5));
  c.flash = fl;
  if (S.id === 'hook') c.shadowAt = [0, 0, 0];
  return c;
};
// ---------- lens ----------
const d3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const HERO = { hook: [0, 1.45, 0], cal: [0, 0.95, 0], naga2: [0, 1.45, 0], portrait: [0, 1.5, 0], ruin: [0, 1.5, 0], rise: [0, 1.5, 0], park: [0, 1.45, 0] };
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  const eye = (p) => ({ focus: d3(C.pos, p) });
  switch (S.id) {
    case 'hook': return { ...eye(HERO.hook), cinf: f < 40 ? 13 : lerp(13, 4, sm(ramp(f, 40, 92))) };
    case 'cal': return { ...eye(HERO.cal), cinf: 6 };
    case 'naga2': return { ...eye(HERO.naga2), cinf: 12 };
    case 'portrait': return { ...eye(HERO.portrait), cinf: 11 };
    case 'hiro': return { focus: d3(C.pos, [HIRO_X(f) + 0.2, 1.4, -3]), cinf: f < 477 ? 7 : 11 };
    case 'ruin': return { ...eye(HERO.ruin), cinf: 12 };
    case 'train': return { focus: d3(C.pos, [trainX(f) + 13.35, 2.45, -0.5]), cinf: 8 };
    case 'family': return { focus: d3(C.pos, [0.2, 2.0, 1]), cinf: 9 };
    case 'sign': return { focus: d3(C.pos, f < 880 ? [-0.5, 2.5, 1.0] : [0, 5.4, 5.3]), cinf: f < 880 ? 10 : 5 };
    case 'office': case 'blast': return { focus: d3(C.pos, [0.65, 1.9, 1.5]), cinf: 7 };
    case 'rise': return { ...eye(HERO.rise), cinf: 11 };
    case 'park': return { ...eye(HERO.park), cinf: 8 };
    case 'scale': return { focus: d3(C.pos, [0, 1.9, 3]), cinf: 5 };
  }
  return { focus: 10, cinf: 0 };
};
// ---------- world state ----------
export const worldAt = (f) => {
  const W = { tram: 30, train: 0, sign: null, beam: 0, winFlash: f >= 1041 ? 1 : 0 };
  W.tram = -60 + (f - 342) * 0.6;
  W.train = trainX(f);
  W.sign = f >= 891 ? 'N' : 'Q';
  const t = Math.max(0, f - 1347) / 30;
  W.beam = Math.sin(t * 3.3) * Math.exp(-t * 0.55) * 0.36 + Math.sin(t * 1.1) * 0.05;
  return W;
};
// ---------- actors ----------
const R = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
const TINT = { dusk: '#ffe0c6', dusk2: '#ffd8bc', void: '#ffffff', nagasaki: '#ffe4cc', studio: '#ffffff', day: '#ffffff', ash: '#f0d4c0', dawn: '#ffeedd', golden: '#ffe2c8', office: '#fff6ea', stage: '#e8e4ff' };
export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [], tint = TINT[S.light];
  const bl = (seed) => blinkAt(f, seed), id = idle(f, 3);
  const Y = (o, pos, extra = {}) => out.push(R(T, o.who || 'yama', { seed: 5, blink: bl(5), bob: q(id.bob, 3), headTilt: q(id.headTilt, 1), ...o.o }, pos, { tint, ...extra }));
  switch (S.id) {
    case 'hook': {
      const pre = f < 39;
      Y({ o: { expr: pre ? 'neutral' : f < 70 ? 'shock' : 'dazed', L: 'hang', R: 'hang', look: 0, blink: pre ? bl(5) : 0, sweat: !pre && f > 55 } }, [0, 0, 0]);
      break;
    }
    case 'naga2': {
      const t = f - 159;
      Y({ o: { expr: 'shock', L: 'up', R: 'up', bandage: true, soot: 1, burn: true, sash: true, sweat: t > 20, blink: 0 } }, [0, 0, 0]);
      break;
    }
    case 'portrait': {
      const wv = q(Math.sin(f * 0.35) * 1.2, 1);
      Y({ o: { expr: f < 250 ? 'neutral' : 'smile', L: 'hang', R: (f % 60) < 40 && f > 260 ? 'wave' : 'hang', wv } }, [0, 0, 0], { s: 1.05 });
      break;
    }
    case 'hiro': {
      const hx = HIRO_X(f), w = walk(f, 342, 1.3, 0.8);
      const boom = f >= 477;
      Y({ o: { expr: boom ? 'shock' : f < 400 ? 'smile' : 'neutral', facing: boom ? 0 : 1, step: boom ? 0 : q(w.phase, 2), L: boom ? 'up' : 'hang', R: boom ? 'up' : 'hip', look: 0.5, sweat: boom } }, [hx, 0, -3]);
      break;
    }
    case 'ruin': {
      const up = M.smooth(ramp(f, 585, 612)), t = f - 507;
      Y({ o: { expr: up > 0.5 ? 'relief' : 'pained', L: 'hang', R: 'hang', bandage: true, soot: 1, burn: true, sash: true, tilt: q(-6 * (1 - up), 1), headTilt: q(8 * (1 - up), 1), blink: up > 0.5 ? bl(5) : 0, look: -0.3 }, who: 'yama' }, [0, 0, 0]);
      break;
    }
    case 'train': {
      const tx = trainX(f) + 12 + 1.35;
      Y({ o: { expr: f < 700 ? 'pained' : 'dazed', L: 'hang', R: 'hang', bandage: true, soot: 0.8, burn: true, sash: true, headTilt: q(3 * Math.sin(f * 0.6), 1), look: 0.5 } }, [tx, 1.3, -0.6], { s: 0.66, ground: 1.3, blob: false });
      break;
    }
    case 'family': {
      const u = M.smooth(ramp(f, 770, 800));
      out.push(R(T, 'wife', { seed: 8, expr: 'smile', L: 'hang', R: (f % 20) < 10 ? 'wave' : 'up', blink: bl(8), wv: q(f * 0.4, 1) }, [-0.6, 1.16, 1.2], { tint, ground: 1.16 }));
      out.push(R(T, 'kid', { seed: 9, expr: 'grin', L: 'up', R: 'up', blink: bl(9), bob: q(Math.abs(Math.sin(f * 0.4)) * 0.03, 3) }, [-0.05, 1.16, 1.15], { tint, s: 0.58, ground: 1.16 }));
      Y({ o: { expr: 'relief', L: 'up', R: 'up', bandage: true, soot: 0.5, sash: true, facing: -1, step: u > 0.99 ? 0 : q(walk(f, 770, 1.0, 0.8).phase, 2) } }, [lerp(2.4, 0.85, u), 1.16, 1.1], { tint, ground: 1.16, flip: true });
      break;
    }
    case 'sign': {
      const slam = f >= 891;
      Y({ o: { expr: slam ? 'shock' : f > 840 ? 'dazed' : 'neutral', L: 'hang', R: slam ? 'up' : 'hang', bandage: true, soot: 0.5, sash: true, burn: true, sweat: slam, look: 0.4, headTilt: q(-4, 1) } }, [0.0, 1.16, 0.4], { tint, s: 1.05, ground: 1.16 });
      break;
    }
    case 'office': case 'blast': {
      const bl_ = f >= 1041, u = f - 1041;
      const g = Math.sin(f * 0.22) * 0.5 + 0.5;
      out.push(R(T, 'boss', { seed: 14, expr: bl_ ? 'shock' : f < 1000 ? 'neutral' : 'nervous', L: bl_ ? 'up' : 'hang', R: bl_ ? 'up' : 'hang', blink: bl_ ? 0 : bl(14), look: -0.3, sweat: bl_, bob: bl_ ? q(Math.abs(Math.sin(u * 0.9)) * 0.02, 3) : 0 }, [-0.95 + (bl_ ? Math.sin(u * 1.7) * 0.04 : 0), 0.62, 4.4], { tint, s: 1.0, ground: 0.62 }));
      Y({ o: { expr: bl_ ? 'shock' : 'pained', L: bl_ ? 'up' : 'point', R: bl_ ? 'up' : 'wave', wv: q(f * 0.35, 1), bandage: true, soot: 0.5, sash: true, burn: true, sweat: bl_, mouth: bl_ ? 1 : q(g, 1), look: 0.5, bob: bl_ ? q(Math.abs(Math.sin(u * 0.9)) * 0.02, 3) : q(id.bob, 3) } }, [0.65 + (bl_ ? Math.sin(u * 1.5) * 0.05 : 0), 0, 1.5], { tint, s: 1.1 });
      break;
    }
    case 'rise': {
      const up = M.smooth(ramp(f, 1164, 1215));
      Y({ o: { expr: f < 1215 ? 'dazed' : 'relief', L: 'hang', R: f > 1225 ? 'wave' : 'hang', wv: q(f * 0.3, 1), bandage: true, soot: 0.8, burn: true, sash: true, tilt: q(8 * (1 - up), 1), headTilt: q(-6 * (1 - up), 1) }, who: 'yama' }, [0, -0.9 * (1 - up), 0]);
      break;
    }
    case 'park': {
      const old = f >= 1286;
      Y({ who: old ? 'yamaOld' : 'yama', o: { expr: 'smile', L: 'hang', R: 'hip', facing: 0, step: 0, tilt: q(-1.2, 1) } }, [0, 0, 0], { tint, s: 1.02 });
      out.push(R(T, 'kid', { seed: 31, expr: 'grin', L: 'up', R: 'up', bob: q(Math.abs(Math.sin(f * 0.35)) * 0.04, 3), blink: bl(31) }, [1.15, 0, -0.2], { tint, s: 0.6 }));
      if (f >= 1300) out.push(R(T, 'kid2', { seed: 32, expr: 'laugh', L: 'up', R: 'up', bob: q(Math.abs(Math.sin(f * 0.3 + 1)) * 0.04, 3), blink: bl(32) }, [-1.05, 0, -0.1], { tint, s: 0.55 }));
      break;
    }
    case 'scale': {
      const t = f - 1347;
      Y({ o: { expr: 'nervous', L: 'hang', R: 'temple', swirl: q(f * 0.3, 1), look: 0.4, tilt: q(Math.sin(f * 0.04) * 2, 1), blink: bl(5) } }, [0, 0, 0.6], { tint, s: 0.75 });
      break;
    }
  }
  return out;
};
// ---------- 2D effects ----------
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  const mush = (k, x, z, s, tt) => out.push(FX('mush' + q(k, 2), (p) => T.fxMushroom(p, k, tt), [x, 0, z], s, { tint: '#ffe8d0' }));
  if (S.id === 'hook' && f >= 39) mush(clamp((f - 39) / 52), 9, 230, 52, f / 30);
  if (S.id === 'naga2') mush(clamp((f - 159) / 46), -7, 250, 56, f / 30);
  if (S.id === 'cal') {
    const days = [[93, 6], [110, 7], [126, 8], [142, 9]]; let n = 6, fl = 1;
    for (const [f0, d] of days) if (f >= f0) { n = d; fl = d === 6 ? 1 : clamp((f - f0) / 7); }
    out.push(FX('cal' + n + q(fl, 2), (p) => T.fxCalendar(p, n, fl), [0, -0.15, 0], 1.25, { order: 3, tint: '#ffffff' }));
    if (f >= 140) { const k = M.back(clamp((f - 140) / 12)); out.push(FX('p3', (p) => T.fxText(p, '+3 HARI', 150, '#ffd84a', 20), [0.55, 1.9, -0.4], 0.75 * Math.max(0.01, k), { order: 6 })); }
  }
  if (S.id === 'hiro' && f >= 400 && f < 477) { const u = (f - 400) / 77; out.push(FX('plane', (p) => T.fxPlane(p), [HIRO_X(f) + 6 - u * 12, 14.5 - u * 2, 35], 4.2, { tint: '#ffffff', order: 3 })); }
  if (S.id === 'hiro' && f >= 477) { const t = q(clamp((f - 477) / 24), 2); out.push(FX('burst' + t, (p) => T.fxBurst(p, t, '#fff6c8', 14, 40, 240), [HIRO_X(f) + 0.2, 1.1, -2.6], 6.5, { order: 6 })); }
  if (S.id === 'ruin' || S.id === 'rise') {
    for (let i = 0; i < 4; i++) { const t = ((f * 0.012 + i * 0.27) % 1); out.push(FX('smoke' + i + q(t, 2), (p) => T.fxSmoke(p, t, '#4a3c3a'), [-9 + i * 6.5, 0, 14 + i * 2], 9 + i, { alpha: 0.8, order: 1, tint: '#d9a98a' })); }
    for (let i = 0; i < 12; i++) { const t = ((f * 0.01 + i / 12) % 1); out.push(FX('ember', (p) => T.fxEmber(p), [-3 + Math.sin(i * 3.1 + f * 0.02) * 2.2, 0.3 + t * 5, -1 + (i % 4) * 0.5], 0.05, { tint: '#ffb860' })); }
  }
  if (S.id === 'ruin' && f >= 553 && f < 600) { const t = q((f - 553) / 47, 2); out.push(FX('ring' + t, (p) => { p.g.translate(0, 120); T.fxRing(p, t); }, [0.5, 1.4, -0.4], 0.6, { order: 6 })); }
  if (S.id === 'family' && f >= 785) for (let i = 0; i < 5; i++) { const t = ((f - 785) * 0.025 + i * 0.2) % 1; out.push(FX('heart', (p) => T.fxHeart(p), [-0.3 + Math.sin(i * 2.2 + f * 0.1) * 0.7, 2.3 + t * 1.4, 0.7], 0.26, { alpha: 1 - t })); }
  if (S.id === 'sign' && f >= 891 && f < 920) { const t = q((f - 891) / 24, 2); out.push(FX('b' + t, (p) => T.fxBurst(p, t, '#ffd84a', 12, 40, 230), [0, 5.0, 4.6], 3.2, { order: 6 })); }
  if (S.id === 'sign' && f >= 810 && f < 891) { const k = M.back(clamp((f - 830) / 14)); if (f >= 830) out.push(FX('q', (p) => T.fxText(p, '?', 420, '#fff3b0', 24), [-0.9, 3.5, 0.4], 0.5 * Math.max(0.01, k), { order: 6 })); }
  if (S.id === 'office' && f >= 955 && f < 1030) { const k = M.back(clamp((f - 955) / 12)); out.push(FX('bub', (p) => T.fxBubbleMush(p), [0.1, 3.05, 1.7], 0.6 * Math.max(0.01, k), { order: 6 })); }
  if (S.id === 'blast') {
    const u = f - 1041; const r_ = (n) => { let s = n * 9301 + 49297; s = (s * 233280 + 49297) % 233280; return s / 233280; };
    for (let i = 0; i < 18; i++) { const t = u / 30; const x = lerp(-3, 3, r_(i)) + (r_(i + 50) - 0.5) * t * 5, y = 1.5 + r_(i + 10) * 2.4 + t * (r_(i + 20) - 0.3) * 2 - 0.5 * 4 * t * t * 0.3, z = 1.2 + r_(i + 30) * 2; out.push(FX('paper', (p) => T.fxPaper(p), [x, Math.max(0.2, y), z], 0.28, { roll: q(t * (2 + r_(i)) * 3, 1), order: 5 })); }
    for (let i = 0; i < 10; i++) { const t = u / 30; const x = 2.5 + r_(i + 70) * 2.6 - t * 1.5, y = 3 + r_(i + 80) * 1.5 - t * t * 3 - t * 1.2, z = 2.8 + r_(i + 90); if (y > 0) out.push(FX('shard', (p) => T.fxShard(p), [x, y, z], 0.22, { roll: q(t * 5 + i, 1) })); }
    if (u > 10) for (let i = 0; i < 4; i++) { const t = clamp((u - 10) / 90); out.push(FX('dust' + i + q(t, 2), (p) => T.fxSmoke(p, t, '#8a7a6a'), [-2.5 + i * 1.8, 0, 3.5], 3.2, { alpha: 0.7, tint: '#e8d4b8', order: 4 })); }
  }
  if (S.id === 'park') {
    for (let i = 0; i < 16; i++) { const t = ((f * 0.01 + i / 16) % 1); out.push(FX('petal', (p) => T.fxLeaf(p, '#ffc1d6'), [-4 + i * 0.55 + Math.sin(t * 9 + i) * 0.5, 4.8 - t * 4.8, -2 + (i % 5) * 0.7], 0.07, { roll: q(t * 9 + i, 1) })); }
    if (f >= 1286 && f < 1300) { const t = q((f - 1286) / 14, 2); out.push(FX('sp' + t, (p) => T.fxBurst(p, t, '#fff6c8', 12, 40, 220), [0, 1.4, -0.3], 2.2, { order: 6 })); }
  }
  if (S.id === 'scale') { for (let i = 0; i < 3; i++) { const k = M.back(clamp((f - 1372 - i * 10) / 12)); const x = [-1.9, 1.9, 0][i], y = [2.4, 2.4, 3.6][i]; if (k > 0) out.push(FX('q' + i, (p) => T.fxText(p, '?', 420, '#fff3b0', 24), [x, y + Math.sin(f * 0.08 + i) * 0.1, 0.4], 0.5 * Math.max(0.01, k), { order: 6 })); } }
  return out;
};
