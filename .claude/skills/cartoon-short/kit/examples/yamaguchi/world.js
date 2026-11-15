// World for the Yamaguchi short: nine sets built from primitives + painted canvas textures. Sets are toggled per shot.
import * as THREE from './lib/three.module.js';
import * as P from './paint.js';

export function buildWorld(ctx) {
  const { scene, add, tbox, box, toon, M, waterMat } = ctx;
  const SETS = {};
  const mk = (name) => { const g = new THREE.Group(); g.visible = false; scene.add(g); SETS[name] = g; return g; };
  const col = (c) => toon({ color: c });
  const R = P.rng;
  const MT = {
    wall: col('#efe2c8'), wall2: col('#e6cfa6'), wallG: col('#c9c6bd'), woodD: col('#4f3a2b'), wood: col('#8d6642'), roofJ: col('#46526b'), roofR: col('#b0482f'),
    window: col('#2b2a3a'), door: col('#5a3a24'), asphalt: col('#74747f'), walk: col('#b9b2a2'), grassG: col('#7fae4c'), dirtB: col('#9a7a58'), char: col('#2f2623'), charD: col('#1f1a19'),
    rubble: col('#6a5f58'), rubble2: col('#8a7a6a'), red: col('#c33a2f'), cream: col('#f3ead4'), navy: col('#2a3c6b'), steel: col('#59606e'), steelL: col('#9aa3b3'), gold: col('#e0b04a'),
    pink: col('#f6b6cb'), pinkD: col('#e891ae'), trunk: col('#5f4332'), leaf: col('#5f9a3c'), leafD: col('#487a30'), ink: col('#1d1624'), carpet: col('#9a5a4a'), paper: col('#fbf8ee'),
  };
  // facade painter: window grid on a wall colour
  const facadeTex = (wall, glass, cols, rows, seed = 1, lit = 0.25) => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 512; const g = c.getContext('2d'), r = R(seed);
    g.fillStyle = wall; g.fillRect(0, 0, 256, 512);
    for (let k = 0; k < 160; k++) { g.fillStyle = `rgba(60,50,40,${0.03 + r() * 0.05})`; g.fillRect(r() * 256, r() * 512, 2 + r() * 14, 1 + r() * 3); }
    const cw = 256 / cols, rh = 512 / rows;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const x = i * cw + cw * 0.22, y = j * rh + rh * 0.2, w = cw * 0.56, h = rh * 0.58;
      g.fillStyle = r() < lit ? '#ffe3a0' : glass; g.fillRect(x, y, w, h);
      g.fillStyle = 'rgba(25,20,30,.9)'; g.fillRect(x - 3, y - 3, w + 6, 4); g.fillRect(x - 3, y + h - 1, w + 6, 4); g.fillRect(x - 3, y - 3, 4, h + 6); g.fillRect(x + w - 1, y - 3, 4, h + 6); g.fillRect(x + w / 2 - 1, y, 3, h);
      g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(x + 4, y + 4, w * 0.3, h * 0.35);
    }
    g.fillStyle = 'rgba(30,22,26,.95)'; g.fillRect(0, 0, 256, 6); g.fillRect(0, 506, 256, 6);
    return c;
  };
  const facMat = (wall, glass, cols, rows, seed, lit) => toon({ map: P.tex(facadeTex(wall, glass, cols, rows, seed, lit)), color: '#ffffff' });
  const modern = (g, x, z, w, d, h, seed, wall = '#d8cbb0', glass = '#6f8fb0', lit = 0.12) => {
    const sm = facMat(wall, glass, Math.max(2, Math.round(w / 2.4)), Math.max(2, Math.round(h / 3)), seed, lit);
    const mats = [sm, sm, col('#7a7468'), col('#7a7468'), sm, sm];
    const b = add(box(w, h, d), mats, x, h / 2, z, g); return b;
  };
  const jhouse = (g, x, z, w, d, h, rot = 0, wall = MT.wall, roof = MT.roofJ, burnt = false) => {
    const hg = new THREE.Group(); hg.position.set(x, 0, z); hg.rotation.y = rot; g.add(hg);
    add(tbox(w, h, d, 2.2), burnt ? MT.char : wall, 0, h / 2, 0, hg);
    add(tbox(w + 0.06, 0.9, d + 0.06, 1.6), MT.woodD, 0, 0.45, 0, hg);
    const rf = add(new THREE.ConeGeometry(0.5, 1, 4), burnt ? MT.charD : roof, 0, h + 0.8, 0, hg); rf.rotation.y = Math.PI / 4; rf.scale.set((w + 1.8) * 1.414, 1.7, (d + 1.8) * 1.414);
    if (!burnt) {
      for (const s of [-1, 1]) add(box(w * 0.2, h * 0.3, 0.08), MT.window, s * w * 0.26, h * 0.62, d / 2 + 0.04, hg, { cast: false });
      add(box(0.95, 1.95, 0.08), MT.door, 0, 0.98, d / 2 + 0.04, hg, { cast: false });
    }
    return hg;
  };
  const pole = (g, x, z, h = 7) => { add(new THREE.CylinderGeometry(0.1, 0.13, h, 8), MT.trunk, x, h / 2, z, g); add(tbox(2.0, 0.12, 0.12, 1), MT.trunk, x, h - 0.7, z, g); add(tbox(1.4, 0.1, 0.1, 1), MT.trunk, x, h - 1.4, z, g); };
  const tree = (g, x, z, h = 4.5, c = MT.leaf) => { add(new THREE.CylinderGeometry(0.14, 0.2, h * 0.5, 7), MT.trunk, x, h * 0.25, z, g); const s = add(new THREE.SphereGeometry(1, 12, 9), c, x, h * 0.72, z, g); s.scale.set(h * 0.42, h * 0.36, h * 0.42); return s; };
  const hills = (g, seed, n = 12, d0 = 120, hs = 0.5) => { const r = R(seed); for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + r() * 0.3, d = d0 + r() * 90, rad = 30 + r() * 40; const h = add(new THREE.SphereGeometry(rad, 18, 10), i % 2 ? M.hill : M.hillFar, Math.cos(a) * d, -rad * 0.55, Math.sin(a) * d, g, { cast: false }); h.scale.y = hs + r() * 0.3; } };
  const mountains = (g, seed, n = 9, d0 = 420) => { const r = R(seed); for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + r() * 0.4, d = d0 + r() * 160, hh = 90 + r() * 80, rr = 90 + r() * 50; const m = new THREE.Group(); m.position.set(Math.cos(a) * d, -4, Math.sin(a) * d); g.add(m); add(new THREE.ConeGeometry(rr, hh, 7), M.mount, 0, hh / 2, 0, m, { cast: false }); add(new THREE.ConeGeometry(rr * 0.28, hh * 0.28, 7), M.snow, 0, hh * 0.87, 0, m, { cast: false }); } };
  const ground = (g, c, size = 900) => { const m = add(new THREE.PlaneGeometry(size, size), c, 0, 0, 0, g, { cast: false }); m.rotation.x = -Math.PI / 2; return m; };
  const flat = (g, w, d, c, x, y, z, cast = false) => { const m = add(new THREE.PlaneGeometry(w, d), c, x, y, z, g, { cast }); m.rotation.x = -Math.PI / 2; return m; };
  const canvasTex = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), c); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const signTex = (txt, bg = '#f6efd8', fg = '#1d1624') => canvasTex(1024, 256, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, 1024, 256); g.lineWidth = 14; g.strokeStyle = '#1d1624'; g.strokeRect(10, 10, 1004, 236);
    g.font = '900 150px Arial Black, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = fg; g.fillText(txt, 512, 140);
  });

  // ================= city (Hiroshima street) =================
  const city = mk('city');
  ground(city, col('#8a9a6a'));
  flat(city, 400, 7.2, MT.asphalt, 0, 0.02, 0); flat(city, 400, 2.4, MT.walk, 0, 0.03, 5.2); flat(city, 400, 2.4, MT.walk, 0, 0.03, -5.2);
  for (let x = -190; x < 190; x += 7) flat(city, 3, 0.18, col('#e8dfa0'), x, 0.04, 3.0);
  for (const z of [0.55, 1.35]) add(tbox(400, 0.09, 0.1, 1), MT.steel, 0, 0.07, z, city, { cast: false });
  for (let x = -190; x < 190; x += 1.2) add(tbox(0.18, 0.06, 2.2, 1), MT.woodD, x, 0.04, 0.95, city, { cast: false });
  { const r = R(12);
    for (let i = 0; i < 26; i++) { const x = -150 + i * 11.8 + r() * 3; const kind = r();
      if (kind < 0.62) jhouse(city, x, 11 + r() * 3, 5 + r() * 3.5, 5 + r() * 2.5, 3.4 + r() * 2, 0, i % 2 ? MT.wall : MT.wall2, i % 3 ? MT.roofJ : MT.roofR);
      else modern(city, x, 13 + r() * 3, 6 + r() * 3, 8, 8 + r() * 7, i + 3, i % 2 ? '#d8ccb0' : '#c9c6bd');
      const x2 = -150 + i * 11.8 + 5 + r() * 3, k2 = r();
      if (k2 < 0.6) jhouse(city, x2, -11 - r() * 3, 5 + r() * 3, 5 + r() * 2.5, 3.4 + r() * 2, Math.PI, i % 2 ? MT.wall2 : MT.wall, i % 3 ? MT.roofJ : MT.roofR);
      else modern(city, x2, -13 - r() * 3, 6 + r() * 3, 8, 8 + r() * 6, i + 40, '#d8ccb0'); }
    for (let x = -180; x < 180; x += 15) { pole(city, x, -4.6); if ((x / 15) % 2 === 0) tree(city, x + 7, 4.4, 4.6 + R(x + 9)() * 1.6, (x / 15) % 4 === 0 ? MT.leafD : MT.leaf); }
  }
  hills(city, 5, 14, 170); mountains(city, 6, 9, 480);
  const tram = new THREE.Group(); city.add(tram);
  { add(tbox(9, 2.4, 2.4, 2), col('#d65a46'), 0, 1.9, 0, tram); add(tbox(9.05, 0.9, 2.45, 2), col('#f1e8cf'), 0, 1.2, 0, tram); add(tbox(9.1, 0.9, 2.5, 2), col('#9fd0e6'), 0, 2.2, 0, tram);
    for (let i = -3; i <= 3; i++) add(tbox(0.12, 0.92, 2.52, 1), MT.ink, i * 1.2, 2.2, 0, tram, { cast: false });
    add(tbox(9.4, 0.3, 2.5, 2), MT.steel, 0, 3.25, 0, tram); add(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 6), MT.ink, 0, 4.0, 0, tram);
    for (const x of [-3, 3]) for (const z of [-0.9, 0.9]) { const w = add(new THREE.CylinderGeometry(0.42, 0.42, 0.2, 14), MT.ink, x, 0.45, z, tram); w.rotation.x = Math.PI / 2; } }
  tram.position.set(0, 0, 0.95);

  // ================= ruins (burnt Hiroshima) =================
  const ruins = mk('ruins');
  ground(ruins, col('#6f6258'));
  flat(ruins, 400, 7.2, col('#5d5750'), 0, 0.02, 0);
  { const r = R(77);
    for (let i = 0; i < 70; i++) { const x = -60 + r() * 120, z = 5 + r() * 30, w = 0.8 + r() * 2.8, h = 0.3 + r() * 1.4;
      const b = add(tbox(w, h, 0.8 + r() * 2, 1.4), r() < 0.5 ? MT.rubble : MT.rubble2, x, h / 2, z, ruins); b.rotation.set((r() - 0.5) * 0.4, r() * 3, (r() - 0.5) * 0.4); }
    for (let i = 0; i < 24; i++) { const x = -60 + r() * 120, z = -22 - r() * 14, w = 0.8 + r() * 2.8, h = 0.3 + r() * 1.2;
      const b = add(tbox(w, h, 0.8 + r() * 2, 1.4), r() < 0.5 ? MT.rubble : MT.rubble2, x, h / 2, z, ruins); b.rotation.set((r() - 0.5) * 0.4, r() * 3, (r() - 0.5) * 0.4); }
    // jagged standing walls
    for (let i = 0; i < 16; i++) { const x = -70 + i * 9 + r() * 4, z = 14 + r() * 16, w = 2 + r() * 4, h = 2 + r() * 5;
      const wl = add(tbox(w, h, 0.5, 1.4), r() < 0.5 ? MT.char : MT.rubble2, x, h / 2, z, ruins); wl.rotation.y = r() * 0.6 - 0.3; wl.rotation.z = (r() - 0.5) * 0.1; }
    for (let i = 0; i < 6; i++) { const x = -45 + i * 18 + r() * 5, z = 16 + r() * 12; const w = add(tbox(8, 7 + r() * 4, 6, 2), MT.charD, x, 4, z, ruins); w.rotation.y = 0.2; add(tbox(7, 1.4, 5, 2), MT.rubble, x + 0.5, 8.4 + r() * 2, z, ruins).rotation.z = 0.3; }
    for (let i = 0; i < 18; i++) { const x = -60 + r() * 120, z = (r() < 0.5 ? 1 : -1) * (10 + r() * 20); const h = 3 + r() * 4; const t = add(new THREE.CylinderGeometry(0.09, 0.16, h, 6), MT.charD, x, h / 2, z, ruins); t.rotation.z = (r() - 0.5) * 0.35; }
    for (let i = 0; i < 12; i++) { const x = -70 + i * 12 + r() * 4, z = 22 + r() * 22, h = 4 + r() * 5; add(new THREE.CylinderGeometry(0.4, 0.5, h, 8), MT.rubble2, x, h / 2, z, ruins); } }
  hills(ruins, 8, 10, 190, 0.4);

  // ================= valley (Nagasaki) =================
  const valley = mk('valley');
  ground(valley, col('#7a8f55'));
  { const r = R(33);
    for (let i = 0; i < 46; i++) { const x = -70 + r() * 140, z = 10 + r() * 55, y = 0; jhouse(valley, x, z, 4 + r() * 3, 4 + r() * 2.5, 3.2 + r() * 2.2, r() * 0.8, r() < 0.5 ? MT.wall : MT.wall2, r() < 0.6 ? MT.roofJ : MT.roofR); }
    for (let i = 0; i < 18; i++) tree(valley, -60 + r() * 120, 6 + r() * 60, 4 + r() * 3, r() < 0.5 ? MT.leaf : MT.leafD);
    for (const [x, z, rad] of [[-90, 60, 38], [70, 80, 44], [-30, 130, 60], [20, 160, 70], [-120, 120, 50], [120, 130, 55]]) { const h = add(new THREE.SphereGeometry(rad, 20, 12), M.hill, x, -rad * 0.4, z, valley, { cast: false }); h.scale.y = 0.55 + r() * 0.2; }
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(900, 300), waterMat); sea.rotation.x = -Math.PI / 2; sea.position.set(0, -0.15, -190); sea.receiveShadow = false; valley.add(sea); sea.userData.nd = ctx.waterNd;
    for (let i = 0; i < 4; i++) { const sh = new THREE.Group(); sh.position.set(-60 + i * 40, 0, -70 - r() * 30); valley.add(sh); add(tbox(9, 2, 3, 2), MT.steel, 0, 0.6, 0, sh); add(tbox(3, 3, 2.4, 2), MT.cream, -1, 2.5, 0, sh); add(new THREE.CylinderGeometry(0.35, 0.4, 3, 8), MT.red, 1.4, 3, 0, sh); } }
  mountains(valley, 9, 7, 520);

  // ================= studio (portrait) =================
  const studio = mk('studio');
  { const wall = add(new THREE.PlaneGeometry(60, 30), col('#f1e7d1'), 0, 8, 12, studio, { cast: false });
    const floor = flat(studio, 60, 40, col('#e5d6b7'), 0, 0, -2);
    const sun = add(new THREE.CircleGeometry(7.6, 64), toon({ color: '#cc2a31' }), 0, 4.6, 11.8, studio, { cast: false });
    const ring = add(new THREE.RingGeometry(8.2, 8.6, 64), col('#1d1624'), 0, 4.6, 11.79, studio, { cast: false });
    for (let i = -6; i <= 6; i++) add(tbox(0.12, 30, 0.1, 1), col('#e6d8bd'), i * 3.2, 8, 11.9, studio, { cast: false });
    const poster = add(new THREE.PlaneGeometry(2.6, 0.65), new THREE.MeshBasicMaterial({ map: canvasTex(1024, 256, (g) => { g.fillStyle = '#f6efd8'; g.fillRect(0, 0, 1024, 256); g.lineWidth = 12; g.strokeStyle = '#1d1624'; g.strokeRect(8, 8, 1008, 240); g.fillStyle = '#cc2a31'; g.fillRect(8, 8, 1008, 56); g.font = '900 38px Arial Black, Arial'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText('PRIA JEPANG · 1945', 512, 46); g.font = '900 104px Arial Black, Arial'; g.fillStyle = '#1d1624'; g.fillText('YAMAGUCHI', 512, 170); g.font = '900 44px Arial Black, Arial'; g.fillText('TSUTOMU', 512, 232); }) }), 0, 3.5, 7, studio, { cast: false });
    for (const m of studio.children) if (m.geometry && m.geometry.type !== 'BoxGeometry' && m.rotation.x === 0) m.rotation.y = Math.PI;
    studio.userData.poster = poster; }

  // ================= rail (the train) =================
  const rail = mk('rail');
  ground(rail, col('#86a45a'));
  flat(rail, 600, 9, col('#8c7b62'), 0, 0.03, 0);
  for (const z of [-0.72, 0.72]) add(tbox(600, 0.14, 0.12, 1), MT.steel, 0, 0.22, z, rail, { cast: false });
  for (let x = -280; x < 320; x += 1.0) add(tbox(0.24, 0.12, 2.4, 1), MT.woodD, x, 0.1, 0, rail, { cast: false });
  { const r = R(21);
    for (let x = -280; x < 320; x += 5 + r() * 4) { tree(rail, x, -9 - r() * 10, 3.8 + r() * 3, r() < 0.5 ? MT.leaf : MT.leafD); tree(rail, x + 2, 9 + r() * 16, 4 + r() * 3.4, r() < 0.5 ? MT.leaf : MT.leafD); }
    for (let x = -280; x < 320; x += 24) pole(rail, x, -5.6, 7.5);
    for (let i = 0; i < 14; i++) jhouse(rail, -250 + i * 42 + r() * 12, 24 + r() * 12, 5 + r() * 3, 5 + r() * 2, 3.4 + r() * 1.6, 0, i % 2 ? MT.wall : MT.wall2, MT.roofJ); }
  hills(rail, 16, 16, 150, 0.55); mountains(rail, 17, 11, 440);
  const train = new THREE.Group(); rail.add(train);
  { const carLen = 11.5;
    for (let c = 0; c < 3; c++) { const cg = new THREE.Group(); cg.position.x = c * (carLen + 0.5); train.add(cg);
      const body = c === 1 ? col('#e0553f') : col('#5b8fb4');
      add(tbox(carLen, 0.7, 2.7, 2), body, 0, 0.95, 0, cg); add(tbox(carLen, 0.55, 2.7, 2), body, 0, 3.05, 0, cg); // lower + upper band
      for (let i = 0; i < 5; i++) add(tbox(0.7, 1.15, 2.7, 1), body, -carLen / 2 + 0.35 + i * (carLen - 0.7) / 4, 2.1, 0, cg); // pillars
      add(tbox(carLen, 1.15, 0.2, 1), col('#e9cf98'), 0, 2.1, 0, cg); // dark interior back wall
      add(tbox(carLen, 0.12, 2.6, 1), col('#f6e9c6'), 0, 3.4, 0, cg);
      const roof = add(new THREE.CylinderGeometry(1.4, 1.4, carLen, 12, 1, false, 0, Math.PI), col('#c9d0dc'), 0, 3.35, 0, cg); roof.rotation.z = Math.PI / 2; roof.rotation.y = Math.PI / 2; roof.scale.set(1, 1, 0.52);
      add(tbox(carLen, 0.14, 2.7, 1), col('#f1d27a'), 0, 1.35, 0, cg);
      for (const x of [-3.8, -2.4, 2.4, 3.8]) for (const z of [-1.0, 1.0]) { const w = add(new THREE.CylinderGeometry(0.5, 0.5, 0.2, 14), MT.ink, x, 0.55, z, cg); w.rotation.x = Math.PI / 2; } }
    // seat backs visible through windows
    for (let c = 0; c < 3; c++) for (let i = 0; i < 6; i++) add(tbox(0.3, 0.9, 1.5, 1), col('#8a4a3a'), c * 12 + -4.5 + i * 1.8, 1.8, 0.2, train, { cast: false }); }
  train.userData.carLen = 11.5;

  // ================= station =================
  const station = mk('station');
  ground(station, col('#a08e72'));
  { flat(station, 200, 14, col('#c9bba0'), 0, 0.04, -3.5);
    add(tbox(200, 1.1, 7, 2), col('#b9aa8d'), 0, 0.55, 2.5, station);
    add(tbox(200, 0.12, 7.2, 2), col('#e8dcc0'), 0, 1.15, 2.5, station, { cast: false });
    for (const z of [-7.8, -6.3]) add(tbox(200, 0.14, 0.14, 1), MT.steel, 0, 0.1, z, station, { cast: false });
    // building
    add(tbox(18, 7.2, 8, 2), col('#d9c7a2'), 0, 4.7, 9.5, station); add(tbox(20.4, 0.6, 9.6, 2), MT.woodD, 0, 8.5, 9.5, station);
    const roof = add(new THREE.ConeGeometry(0.5, 1, 4), MT.roofJ, 0, 9.6, 9.5, station); roof.rotation.y = Math.PI / 4; roof.scale.set(24, 2.6, 13);
    add(tbox(4, 3.3, 0.2, 1), col('#3a2c2c'), -4, 3.3, 5.45, station); add(tbox(4, 3.3, 0.2, 1), col('#3a2c2c'), 4, 3.3, 5.45, station);
    for (const x of [-7.5, 7.5]) add(tbox(2.4, 2.4, 0.15, 1), col('#ffe9a8'), x, 4, 5.45, station);
    // canopy
    add(tbox(26, 0.3, 6.5, 2), MT.woodD, 0, 6.2, 2.4, station); for (const x of [-12, -4, 4, 12]) add(new THREE.CylinderGeometry(0.2, 0.2, 5.1, 8), MT.steel, x, 3.6, -0.2, station);
    // sign board (swappable texture)
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 1.4), new THREE.MeshBasicMaterial({ map: signTex('?????', '#e8e3d2', '#9a9588') })); sign.position.set(0, 5.2, 5.3); sign.rotation.y = Math.PI; station.add(sign);
    add(tbox(5.9, 0.2, 0.25, 1), MT.woodD, 0, 6.0, 5.25, station); add(tbox(5.9, 0.2, 0.25, 1), MT.woodD, 0, 4.4, 5.25, station);
    station.userData.sign = sign; station.userData.signQ = sign.material.map; station.userData.signN = signTex('NAGASAKI', '#f6efd8', '#1d1624');
    // clock
    const ck = add(new THREE.CylinderGeometry(0.9, 0.9, 0.2, 24), col('#ffffff'), 7, 6.2, 5.4, station); ck.rotation.x = Math.PI / 2;
    // bench + lamp
    add(tbox(2.6, 0.12, 0.7, 1), MT.wood, -9, 1.7, 0.3, station); add(tbox(2.6, 0.7, 0.1, 1), MT.wood, -9, 2.1, 0.6, station); for (const x of [-10, -8]) add(tbox(0.12, 0.6, 0.6, 1), MT.woodD, x, 1.45, 0.3, station);
    for (const x of [-15, 15]) { add(new THREE.CylinderGeometry(0.08, 0.1, 4, 8), MT.steel, x, 3.1, 0.2, station); add(new THREE.SphereGeometry(0.4, 12, 8), col('#fff2c0'), x, 5.2, 0.2, station); }
    // train car edge (left) + trees + hills
    const carStub = add(tbox(14, 3.4, 2.7, 2), col('#3f6c8e'), -24, 2.0, -6.8, station); add(tbox(14, 1.15, 2.72, 1), col('#f1d27a'), -24, 2.3, -6.8, station, { cast: false });
    const r = R(51); for (let i = 0; i < 18; i++) tree(station, -90 + r() * 180, 24 + r() * 30, 4 + r() * 3.4, r() < 0.5 ? MT.leaf : MT.leafD); }
  hills(station, 19, 14, 150, 0.5); mountains(station, 20, 9, 460);

  // ================= office (1945) =================
  const office = mk('office');
  { flat(office, 14, 12, col('#8a5c3d'), 0, 0, 0, false);
    for (let x = -7; x < 7; x += 1.4) add(tbox(0.04, 0.02, 12, 1), col('#6e4630'), x, 0.01, 0, office, { cast: false });
    add(tbox(14, 6, 0.4, 2), col('#e4d3ae'), 0, 3, 6.2, office);      // back wall
    add(tbox(0.4, 6, 12, 2), col('#e4d3ae'), -7, 3, 0, office); add(tbox(0.4, 6, 12, 2), col('#e4d3ae'), 7, 3, 0, office);
    add(tbox(14, 0.4, 12, 2), col('#d6c49c'), 0, 6.1, 0, office, { cast: false });
    add(tbox(14, 0.9, 0.1, 1), col('#7a5236'), 0, 0.45, 5.95, office, { cast: false });
    // window opening on the back wall (frame boxes) + glass + outside
    const win = new THREE.MeshBasicMaterial({ color: '#9ec8ee' }); const glass = add(new THREE.PlaneGeometry(4.4, 3.3), win, 3.2, 3.4, 5.98, office, { cast: false }); glass.rotation.y = Math.PI; office.userData.win = win;
    add(tbox(4.7, 0.2, 0.3, 1), MT.woodD, 3.2, 5.12, 5.9, office); add(tbox(4.7, 0.2, 0.3, 1), MT.woodD, 3.2, 1.72, 5.9, office); add(tbox(0.2, 3.5, 0.3, 1), MT.woodD, 0.92, 3.4, 5.9, office); add(tbox(0.2, 3.5, 0.3, 1), MT.woodD, 5.5, 3.4, 5.9, office); add(tbox(0.12, 3.3, 0.3, 1), MT.woodD, 3.2, 3.4, 5.9, office); add(tbox(4.4, 0.12, 0.3, 1), MT.woodD, 3.2, 3.4, 5.9, office);
    { const r = R(60); for (let i = 0; i < 7; i++) { const h = 1.2 + r() * 2; add(box(0.7, h, 0.3), col(i % 2 ? '#5c6f98' : '#7487ad'), 1.4 + i * 0.62, 1.72 + h / 2, 6.05, office, { cast: false }); } }
    // clock on wall
    const clk = add(new THREE.CylinderGeometry(0.75, 0.75, 0.15, 28), col('#fffdf5'), -3.2, 4.4, 5.9, office); clk.rotation.x = Math.PI / 2; add(tbox(1.6, 0.1, 0.12, 1), MT.ink, -3.2, 4.4, 5.8, office).visible = false;
    office.userData.clkH = add(tbox(0.08, 0.36, 0.05, 1), MT.ink, -3.2, 4.52, 5.78, office, { cast: false }); office.userData.clkM = add(tbox(0.05, 0.56, 0.05, 1), col('#c33a2f'), -3.2, 4.55, 5.76, office, { cast: false });
    // desk
    add(tbox(4.6, 0.18, 1.8, 1.5), MT.wood, 0.4, 1.55, 3.4, office); add(tbox(4.6, 1.5, 0.12, 1.5), MT.woodD, 0.4, 0.78, 2.55, office); add(tbox(0.14, 1.5, 1.7, 1), MT.woodD, -1.8, 0.78, 3.4, office); add(tbox(0.14, 1.5, 1.7, 1), MT.woodD, 2.6, 0.78, 3.4, office);
    add(tbox(0.9, 0.04, 0.7, 1), MT.paper, -0.1, 1.66, 3.3, office, { cast: false }); add(tbox(0.9, 0.04, 0.7, 1), MT.paper, 1.2, 1.66, 3.5, office, { cast: false });
    add(new THREE.CylinderGeometry(0.2, 0.18, 0.4, 12), col('#2f5d4a'), 2.0, 1.82, 3.3, office);
    add(tbox(1.3, 1.6, 0.18, 1), MT.woodD, -0.95, 1.6, 5.2, office); add(tbox(1.2, 0.14, 1.0, 1), MT.wood, -0.95, 0.85, 4.7, office);
    // shelves
    add(tbox(2.4, 3.2, 0.7, 1.5), MT.woodD, -5.4, 1.6, 5.6, office); for (let i = 0; i < 4; i++) add(tbox(2.2, 0.1, 0.72, 1), MT.wood, -5.4, 0.5 + i * 0.8, 5.55, office, { cast: false });
    const r = R(61); for (let i = 0; i < 12; i++) add(tbox(0.2, 0.6, 0.4, 1), col(['#b6483c', '#3f6a8e', '#d3a23f', '#4f7a4a'][i % 4]), -6.2 + (i % 6) * 0.35, 0.8 + Math.floor(i / 6) * 0.8, 5.5, office, { cast: false });
    add(tbox(3.2, 0.06, 2.2, 1), col('#9a3c34'), -1.2, 0.03, 0.4, office, { cast: false }); }

  // ================= park (cherry blossom) =================
  const park = mk('park');
  ground(park, col('#86bd5a'));
  { flat(park, 6, 120, col('#d8c79e'), -2, 0.03, 20);
    const sakura = (x, z, s = 1) => { add(new THREE.CylinderGeometry(0.28 * s, 0.4 * s, 4.6 * s, 8), MT.trunk, x, 2.3 * s, z, park); const br = add(new THREE.CylinderGeometry(0.12 * s, 0.2 * s, 2.6 * s, 6), MT.trunk, x + 0.8 * s, 4.6 * s, z, park); br.rotation.z = -0.7;
      for (const [dx, dy, dz, rr] of [[0, 6.2, 0, 2.7], [-2.2, 5.5, 0.4, 2.1], [2.4, 5.6, -0.3, 2.2], [0.4, 7.6, 0.3, 1.9], [-1.2, 6.8, 1.4, 1.8], [1.6, 6.9, -1.2, 1.8]]) { const b = add(new THREE.SphereGeometry(rr * s, 14, 10), (dx + dz) > 0 ? MT.pink : MT.pinkD, x + dx * s, dy * s, z + dz * s, park); b.scale.y = 0.82; } };
    sakura(5.5, 13, 1.1); sakura(-9, 22, 1.0); sakura(12, 30, 1.2); sakura(-14, 40, 1.0); sakura(8, 48, 1.1);
    add(tbox(2.4, 0.12, 0.7, 1), MT.wood, -6, 0.7, 8, park); add(tbox(2.4, 0.7, 0.1, 1), MT.wood, -6, 1.05, 8.3, park); for (const x of [-7, -5]) add(tbox(0.12, 0.7, 0.6, 1), MT.woodD, x, 0.35, 8, park);
    const r = R(71); for (let i = 0; i < 22; i++) tree(park, -70 + r() * 140, 30 + r() * 60, 4 + r() * 3, r() < 0.5 ? MT.leaf : MT.leafD);
    for (let i = 0; i < 10; i++) jhouse(park, -60 + i * 14 + r() * 5, 70 + r() * 16, 5 + r() * 3, 5 + r() * 2, 3.4 + r() * 2, 0, MT.wall, MT.roofJ); }
  hills(park, 24, 14, 150, 0.55); mountains(park, 25, 9, 420);

  // ================= stage (the scale) =================
  const stage = mk('stage');
  { const floor = add(new THREE.CircleGeometry(40, 48), col('#171330'), 0, 0, 0, stage, { cast: false }); floor.rotation.x = -Math.PI / 2;
    const pool = add(new THREE.CircleGeometry(3.4, 40), new THREE.MeshBasicMaterial({ color: '#f1e3bf' }), 0, 0.02, 2.2, stage, { cast: false }); pool.rotation.x = -Math.PI / 2; pool.userData.ndSkip = true;
    const spot = add(new THREE.CylinderGeometry(0.5, 2.7, 14, 28, 1, true), new THREE.MeshBasicMaterial({ color: '#fff0c0', transparent: true, opacity: 0.025, side: THREE.DoubleSide, depthWrite: false, fog: false }), 0, 7, 2.2, stage, { cast: false }); spot.userData.ndSkip = true;
    const sg = new THREE.Group(); sg.scale.setScalar(0.5); sg.position.set(0, 0, 3.8 - 5.2 * 0.5); stage.add(sg);
    add(new THREE.CylinderGeometry(0.28, 0.4, 4.2, 14), MT.steelL, 0, 2.1, 5.2, sg); add(new THREE.CylinderGeometry(1.4, 1.6, 0.35, 24), MT.steel, 0, 0.18, 5.2, sg);
    const beam = new THREE.Group(); beam.position.set(0, 4.3, 5.2); sg.add(beam); stage.userData.beam = beam;
    add(tbox(5.4, 0.28, 0.4, 1), MT.gold, 0, 0, 0, beam); add(new THREE.SphereGeometry(0.34, 14, 10), MT.gold, 0, 0, -0.2, beam);
    const pans = [];
    for (const [sx, lab, c1, c2] of [[-1, 'SIAL', '#4b2f7a', '#e2d2ff'], [1, 'BERUNTUNG', '#e8b93a', '#241726']]) {
      const pg = new THREE.Group(); pg.position.set(sx * 2.6, 0, 0); beam.add(pg);
      for (const dx of [-1.2, 1.2]) { const ch = add(new THREE.CylinderGeometry(0.03, 0.03, 2.7, 5), MT.steelL, dx * 0.45, -1.3, 0, pg); ch.rotation.z = -dx * 0.2 * 0.5; }
      add(new THREE.CylinderGeometry(1.15, 0.95, 0.34, 28), toon({ color: c1 }), 0, -2.7, 0, pg);
      const lt = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.5), new THREE.MeshBasicMaterial({ map: canvasTex(512, 128, (g) => { g.fillStyle = 'rgba(0,0,0,0)'; g.font = '900 78px Arial Black, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 12; g.strokeStyle = '#1d1624'; g.strokeText(lab, 256, 70); g.fillStyle = c2; g.fillText(lab, 256, 70); }), transparent: true })); lt.position.set(0, -2.7, -1.25); lt.rotation.y = Math.PI; pg.add(lt);
      pans.push(pg); }
    stage.userData.pans = pans; }

  // ================= void (calendar backdrop) =================
  const voidS = mk('void');
  { const back = add(new THREE.PlaneGeometry(60, 40), new THREE.MeshBasicMaterial({ color: '#17204a' }), 0, 4, 14, voidS, { cast: false }); back.rotation.y = Math.PI;
    const f = flat(voidS, 60, 60, col('#1b2552'), 0, -0.02, 0); const r = R(5);
    for (let i = 0; i < 30; i++) { const m = add(new THREE.SphereGeometry(0.06 + r() * 0.08, 6, 4), new THREE.MeshBasicMaterial({ color: '#8fa6ff' }), -8 + r() * 16, 0.5 + r() * 7, 3 + r() * 8, voidS, { cast: false }); m.userData.ndSkip = true; m.userData.fl = r() * 6; voidS.userData['p' + i] = m; } }

  // ---- update per frame ----
  const update = (f, S, W) => {
    for (const k in SETS) SETS[k].visible = false;
    for (const k of S.sets) if (SETS[k]) SETS[k].visible = true;
    tram.position.x = W.tram ?? 30;
    train.position.x = W.train ?? 0;
    if (W.sign) { const sg = station.userData.sign; sg.material.map = W.sign === 'N' ? station.userData.signN : station.userData.signQ; sg.material.needsUpdate = true; }
    if (stage.visible) { const b = stage.userData.beam; b.rotation.z = W.beam || 0; stage.userData.pans.forEach((pg, i) => { pg.rotation.z = -(W.beam || 0); }); }
    if (office.visible) { office.userData.win.color.set(W.winFlash > 0 ? '#ffffff' : '#9ec8ee'); }
    if (voidS.visible) for (let i = 0; i < 30; i++) { const m = voidS.userData['p' + i]; if (m) m.position.y = 0.5 + ((m.userData.fl * 1.3 + f * 0.012) % 7.5); }
  };
  return { SETS, update };
}
