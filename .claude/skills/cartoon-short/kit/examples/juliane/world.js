// World for the Juliane Koepcke short: sky fall, storm plane, Amazon jungle (instanced) with river + hut, 92 seats, studio.
import * as THREE from './lib/three.module.js';
import * as P from './paint.js';
import * as T from './toon.js';

export const riverX = (z) => 30 + 8 * Math.sin(z / 25);
export const HUT = [riverX(120) - 11, 0, 120];

export function buildWorld(ctx) {
  const { scene, add, tbox, box, toon, M, waterMat, waterNd } = ctx;
  const SETS = {};
  const mk = (name) => { const g = new THREE.Group(); g.visible = false; scene.add(g); SETS[name] = g; return g; };
  const col = (c) => toon({ color: c });
  const R = P.rng;
  const MT = {
    trunk: col('#6b4b34'), trunkD: col('#4a3424'), leaf: col('#4f8f3a'), leafD: col('#3b7030'), leafL: col('#6aa848'), fern: col('#5c9c3e'), mud: col('#7a5a3c'),
    litter: col('#6d5a3a'), seatB: col('#3f6fae'), seatD: col('#2c4f80'), steel: col('#8d95a3'), white: col('#eef1f5'), stripe: col('#c8433a'), ink: col('#1d1624'),
    thatch: col('#c9a45c'), wood: col('#8d6642'), woodD: col('#4f3a2b'), gold: col('#e8b93a'), navy: col('#26365e'),
  };
  const canvasTex = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), c); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const inst = (geo, mat, list, g, cast = true) => {
    const m = new THREE.InstancedMesh(geo, mat, list.length), d = new THREE.Object3D();
    list.forEach((it, i) => { d.position.set(...it.p); d.scale.set(...(it.s || [1, 1, 1])); d.rotation.set(...(it.r || [0, 0, 0])); d.updateMatrix(); m.setMatrixAt(i, d.matrix); if (it.c) m.setColorAt(i, new THREE.Color(it.c)); });
    m.castShadow = cast; m.receiveShadow = true; g.add(m); return m;
  };
  const cloudSprite = (seed, tint = '#ffffff') => {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400; const pen = new T.Pen(c.getContext('2d')); pen.ol = 0;
    pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, seed);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: true, depthWrite: false, color: tint }));
    m.userData.ndSkip = true; m.userData.billboard = true; return m;
  };
  const billboards = [];

  // ================= sky (the fall) =================
  const sky = mk('sky');
  { const gtex = canvasTex(1024, 1024, (g) => { g.fillStyle = '#3f7a34'; g.fillRect(0, 0, 1024, 1024); const r = R(3); for (let i = 0; i < 2600; i++) { g.fillStyle = ['#356c2e', '#4f8f3a', '#5ea245', '#2f6128'][i % 4]; g.beginPath(); g.arc(r() * 1024, r() * 1024, 6 + r() * 16, 0, 7); g.fill(); }
      g.strokeStyle = '#8a7a52'; g.lineWidth = 18; g.beginPath(); g.moveTo(0, 600); for (let x = 0; x < 1024; x += 32) g.lineTo(x, 600 + Math.sin(x / 90) * 80); g.stroke(); });
    gtex.wrapS = gtex.wrapT = THREE.RepeatWrapping; gtex.repeat.set(6, 6);
    const gnd = add(new THREE.PlaneGeometry(9000, 9000), toon({ map: gtex }), 0, -900, 0, sky, { cast: false }); gnd.rotation.x = -Math.PI / 2;
    const r = R(9);
    for (let i = 0; i < 46; i++) { const m = cloudSprite(i % 14 + 1); let x = -70 + r() * 140, z = -20 + r() * 110; if (Math.abs(x) < 9 && z < 14) x += 18 * Math.sign(x || 1); m.position.set(x, 30 - r() * 260, z); m.scale.setScalar(18 + r() * 34); sky.add(m); billboards.push(m); } }

  // ================= storm (plane) =================
  const storm = mk('storm');
  const plane = new THREE.Group(); storm.add(plane);
  const front = new THREE.Group(), rear = new THREE.Group(), wingR = new THREE.Group(); plane.add(front); plane.add(rear); plane.add(wingR);
  { const fus = add(new THREE.CylinderGeometry(1.7, 1.7, 15, 24), MT.white, 4.5, 0, 0, front); fus.rotation.z = Math.PI / 2;
    const nose = add(new THREE.SphereGeometry(1.7, 24, 16), MT.white, 12, 0, 0, front); nose.scale.set(1.6, 1, 1);
    const fus2 = add(new THREE.CylinderGeometry(1.7, 1.2, 14, 24), MT.white, -10, 0.1, 0, rear); fus2.rotation.z = Math.PI / 2;
    add(tbox(4.2, 4.2, 0.25, 1), MT.white, -15.5, 2.6, 0, rear).rotation.z = -0.35;
    add(tbox(4.2, 0.2, 9, 1), MT.white, -15.5, 0.6, 0, rear);
    for (const [g, x0, x1] of [[front, -3, 12], [rear, -17, -3]]) { add(tbox(x1 - x0, 0.35, 3.5, 1), MT.stripe, (x0 + x1) / 2, -0.2, 0, g); for (let x = x0 + 1; x < x1 - 1; x += 1.3) add(box(0.45, 0.55, 3.46), MT.ink, x, 0.75, 0, g, { cast: false }); }
    add(tbox(4.5, 0.4, 15, 1), MT.white, 1, -0.6, -8.5, front); // left wing
    add(tbox(4.5, 0.4, 15, 1), MT.white, 1, -0.6, 7.5, wingR); // right wing
    for (const [g, z] of [[front, -5], [front, -11], [wingR, 4], [wingR, 10]]) { const n = add(new THREE.CylinderGeometry(0.75, 0.6, 4, 14), MT.steel, 2.2, -0.9, z, g); n.rotation.z = Math.PI / 2; const pr = add(new THREE.CylinderGeometry(1.7, 1.7, 0.08, 20), new THREE.MeshBasicMaterial({ color: '#c8d0dc', transparent: true, opacity: 0.35 }), 4.3, -0.9, z, g, { cast: false }); pr.rotation.z = Math.PI / 2; pr.userData.ndSkip = true; }
    const r = R(14);
    for (let i = 0; i < 30; i++) { const m = cloudSprite(i % 14 + 1, '#5a6278'); m.position.set(-120 + r() * 240, -40 + r() * 80, 20 + r() * 160); m.scale.setScalar(40 + r() * 60); storm.add(m); billboards.push(m); } }

  // ================= jungle (crash site, river, hut) =================
  const jungle = mk('jungle');
  { const ltex = canvasTex(512, 512, (g) => { g.fillStyle = '#5e4a2e'; g.fillRect(0, 0, 512, 512); const r = R(5); for (let i = 0; i < 900; i++) { g.fillStyle = ['#7a5f38', '#4a3a24', '#6f7a34', '#8a6a3a', '#3f4a24'][i % 5]; g.beginPath(); g.ellipse(r() * 512, r() * 512, 4 + r() * 10, 2 + r() * 5, r() * 3, 0, 7); g.fill(); } });
    ltex.wrapS = ltex.wrapT = THREE.RepeatWrapping; ltex.repeat.set(70, 70);
    const floor = add(new THREE.PlaneGeometry(700, 700), toon({ map: ltex }), 0, 0, 0, jungle, { cast: false }); floor.rotation.x = -Math.PI / 2;
    // river ribbon
    const pos = [], idx = [], N = 160; for (let i = 0; i <= N; i++) { const z = -260 + i * (520 / N), x = riverX(z); pos.push(x - 7, 0.06, z, x + 7, 0.06, z); if (i < N) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
    const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); rg.setIndex(idx); rg.computeVertexNormals();
    const river = new THREE.Mesh(rg, waterMat); river.userData.nd = waterNd; jungle.add(river);
    const bpos = [], bidx = []; for (let i = 0; i <= N; i++) { const z = -260 + i * (520 / N), x = riverX(z); bpos.push(x - 10, 0.04, z, x + 10, 0.04, z); if (i < N) { const a = i * 2; bidx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
    const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(bpos, 3)); bg.setIndex(bidx); bg.computeVertexNormals();
    const bank = new THREE.Mesh(bg, MT.mud); bank.receiveShadow = true; jungle.add(bank);
    // vegetation
    const clear = (x, z) => Math.abs(x - riverX(z)) < 11 || (z > -48 && z < 70 && x < riverX(z) && x > riverX(z) - 24) || Math.hypot(x, z) < 6 || Math.hypot(x - HUT[0], z - HUT[2]) < 14 || (Math.abs(x - 2) < 3.5 && z < -2 && z > -16) || (x > -14 && x < 8 && z > -26 && z < 8 && Math.hypot(x + 3, z + 8) < 7);
    const r = R(41), trunks = [], crowns = [], ferns = [], vines = [], buttress = [];
    for (let i = 0; i < 1400; i++) { const x = -220 + r() * 440, z = -220 + r() * 440; if (clear(x, z)) continue;
      const h = 14 + r() * 12, rad = 0.35 + r() * 0.5; trunks.push({ p: [x, h / 2, z], s: [rad, h, rad] });
      if (r() < 0.4) buttress.push({ p: [x, 0.8, z], s: [rad * 2.4, 1.6, rad * 2.4], r: [0, r() * 3, 0] });
      const cs = 4 + r() * 4.5; crowns.push({ p: [x, h + cs * 0.4, z], s: [cs, cs * 0.62, cs], c: ['#4f8f3a', '#3b7030', '#5e9e40', '#447d33', '#6aa848'][i % 5] });
      if (r() < 0.6) crowns.push({ p: [x + (r() - 0.5) * 5, h - 2 + r() * 3, z + (r() - 0.5) * 5], s: [cs * 0.7, cs * 0.45, cs * 0.7], c: '#3b7030' });
      if (r() < 0.25) vines.push({ p: [x + 0.6, h * 0.55, z], s: [0.06, h * 0.9, 0.06], r: [0, 0, (r() - 0.5) * 0.2] }); }
    for (let i = 0; i < 1600; i++) { const x = -160 + r() * 320, z = -160 + r() * 320; if (clear(x, z)) continue; ferns.push({ p: [x, 0.3, z], s: [0.9 + r() * 1.3, 0.55 + r() * 0.7, 0.9 + r() * 1.3], c: ['#5c9c3e', '#4a8a34', '#6fae4a'][i % 3] }); }
    inst(new THREE.CylinderGeometry(1, 1.2, 1, 9), MT.trunk, trunks, jungle);
    inst(new THREE.ConeGeometry(1, 1, 7), MT.trunkD, buttress, jungle);
    inst(new THREE.SphereGeometry(1, 12, 9), toon({ color: '#ffffff' }), crowns, jungle);
    inst(new THREE.SphereGeometry(1, 9, 6), toon({ color: '#ffffff' }), ferns, jungle, false);
    inst(new THREE.CylinderGeometry(1, 1, 1, 5), col('#3f6a2e'), vines, jungle, false);
    // hut on stilts + canoe + fire smoke spot
    const hut = new THREE.Group(); hut.position.set(HUT[0], 0, HUT[2]); hut.rotation.y = 0.4; jungle.add(hut);
    for (const [x, z] of [[-2.5, -2], [2.5, -2], [-2.5, 2], [2.5, 2]]) add(new THREE.CylinderGeometry(0.15, 0.18, 1.6, 7), MT.woodD, x, 0.8, z, hut);
    add(tbox(5.6, 0.25, 4.6, 1.2), MT.wood, 0, 1.65, 0, hut); add(tbox(5.2, 2.0, 0.15, 1.2), MT.wood, 0, 2.75, -2.2, hut);
    for (const x of [-2.6, 2.6]) add(tbox(0.15, 2.0, 4.4, 1.2), MT.wood, x, 2.75, 0, hut);
    const roof = add(new THREE.ConeGeometry(0.5, 1, 4), MT.thatch, 0, 4.6, 0, hut); roof.rotation.y = Math.PI / 4; roof.scale.set(9.5, 2.4, 8.2);
    const canoe = add(new THREE.CylinderGeometry(0.5, 0.5, 6, 12, 1, false, 0, Math.PI), MT.woodD, riverX(116) - 6.2, 0.3, 116, jungle); canoe.rotation.set(Math.PI / 2, 0, Math.PI); canoe.scale.set(1, 1, 0.5);
    jungle.userData.hut = hut; }

  // ================= studio (portrait) =================
  const studio = mk('studio');
  { add(new THREE.PlaneGeometry(60, 30), col('#eaf0dc'), 0, 8, 12, studio, { cast: false });
    const fl = add(new THREE.PlaneGeometry(60, 40), col('#d9dfc4'), 0, 0, -2, studio, { cast: false }); fl.rotation.x = -Math.PI / 2;
    add(new THREE.CircleGeometry(7.6, 64), toon({ color: '#3f8f52' }), 0, 4.6, 11.8, studio, { cast: false });
    add(new THREE.RingGeometry(8.2, 8.6, 64), col('#1d1624'), 0, 4.6, 11.79, studio, { cast: false });
    for (let i = -6; i <= 6; i++) add(tbox(0.12, 30, 0.1, 1), col('#dfe6cc'), i * 3.2, 8, 11.9, studio, { cast: false });
    add(new THREE.PlaneGeometry(2.1, 0.52), new THREE.MeshBasicMaterial({ map: canvasTex(1024, 256, (g) => { g.fillStyle = '#f6efd8'; g.fillRect(0, 0, 1024, 256); g.lineWidth = 12; g.strokeStyle = '#1d1624'; g.strokeRect(8, 8, 1008, 240); g.fillStyle = '#3f8f52'; g.fillRect(8, 8, 1008, 56); g.font = '900 38px Arial Black, Arial'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText('17 TAHUN · 1971', 512, 46); g.font = '900 96px Arial Black, Arial'; g.fillStyle = '#1d1624'; g.fillText('KOEPCKE', 512, 170); g.font = '900 44px Arial Black, Arial'; g.fillText('JULIANE', 512, 232); }) }), 0.55, 3.5, 7, studio, { cast: false });
    for (const m of studio.children) if (m.geometry && m.geometry.type !== 'BoxGeometry' && m.rotation.x === 0) m.rotation.y = Math.PI; }

  // ================= seats (92 people) =================
  const seats = mk('seats');
  { const fl = add(new THREE.CircleGeometry(60, 48), col('#151229'), 0, 0, 0, seats, { cast: false }); fl.rotation.x = -Math.PI / 2;
    const cush = [], backs = [], HL = { row: 3, s: 1 };
    for (let row = 0; row < 23; row++) for (let s = 0; s < 4; s++) { const x = (s < 2 ? -1.6 - (1 - s) * 1.0 : 1.6 + (s - 2) * 1.0), z = row * 1.3; const hl = row === HL.row && s === HL.s; const c = hl ? '#e8b93a' : '#3a4a78';
      cush.push({ p: [x, 0.5, z], s: [0.85, 0.16, 0.6], c }); backs.push({ p: [x, 1.05, z + 0.32], s: [0.85, 1.1, 0.14], c }); }
    inst(new THREE.BoxGeometry(1, 1, 1), toon({ color: '#ffffff' }), cush, seats); inst(new THREE.BoxGeometry(1, 1, 1), toon({ color: '#ffffff' }), backs, seats);
    const pool = add(new THREE.CircleGeometry(1.4, 32), new THREE.MeshBasicMaterial({ color: '#f6e7bf' }), -1.6, 0.02, 3 * 1.3, seats, { cast: false }); pool.rotation.x = -Math.PI / 2; pool.userData.ndSkip = true; }

  // ================= the seat (follows the girl) =================
  const seat = new THREE.Group(); scene.add(seat); seat.visible = false;
  { add(tbox(0.9, 0.16, 0.6, 1), MT.seatB, 0, 0.52, -0.42, seat); add(tbox(0.9, 1.15, 0.15, 1), MT.seatB, 0, 1.07, -0.75, seat); add(tbox(0.94, 0.25, 0.16, 1), MT.seatD, 0, 1.6, -0.75, seat);
    for (const x of [-0.52, 0.52]) { add(tbox(0.08, 0.08, 0.55, 1), MT.seatD, x, 0.78, -0.45, seat); add(tbox(0.06, 0.5, 0.06, 1), MT.steel, x * 0.8, 0.22, -0.5, seat); } }

  const update = (f, S, W, cam) => {
    for (const k in SETS) SETS[k].visible = false;
    for (const k of S.sets) if (SETS[k]) SETS[k].visible = true;
    for (const b of billboards) if (b.parent.visible) b.quaternion.copy(cam.quaternion);
    // plane break
    const k = W.brk || 0;
    front.position.set(k * 3, -k * 6, 0); front.rotation.set(k * 0.3, 0, -k * 0.25);
    rear.position.set(-k * 6, -k * 14, -k * 2); rear.rotation.set(-k * 0.4, 0, k * 0.9);
    wingR.position.set(k * 2, -k * 4, k * 9); wingR.rotation.set(k * 1.6, k * 0.4, k * 0.6);
    plane.position.set(W.planeX || 0, 0, 0);
    // seat
    if (W.seat) { seat.visible = true; seat.position.set(...W.seat.p); seat.rotation.set(0, Math.atan2(cam.position.x - W.seat.p[0], cam.position.z - W.seat.p[2]), W.seat.roll || 0); }
    else seat.visible = false;
  };
  return { SETS, update };
}
