FACE.snore = { eye: ["dash", "dash"], brow: [0, -1], mouth: "o" };
FACE.stubborn = { eye: ["lid", "lid"], brow: [4, -3], mouth: "frown" };
FACE.squint = { eye: ["slit", "slit"], brow: [3, -2], mouth: "dash" };

// ---------------- Roman-era cast (our own designs), built on the Pen / blob / face helpers above ----------------
const STEEL = "#aeb6bf", BRASS = "#d9a845", LEATHER = "#7a4a2a";
export const OUTFITS = {
  legion: { tunic: "#b8322f", cape: "#8f2228", skin: SKIN, helmet: true, armor: true, spear: true, shield: true },
  old: { tunic: "#9c4a3c", cape: "#6e3330", skin: "#f3d6bb", helmet: "old", armor: true, spear: true, shield: false, beard: "#f4f1ea", brows: "#f4f1ea" },
  toga: { tunic: "#f1ead8", skin: "#f5c9a0", toga: "#6b3c8f", hair: "#3b2a20", stout: true },
  civA: { tunic: "#4f7fb8", skin: "#f5c9a0", hair: "#5a3b2a" },
  civB: { tunic: "#d9a441", skin: SKIN, hair: "#2b211c", dress: "#c25a7a" },
  civC: { tunic: "#5d8a3a", skin: "#c99067", hair: "#1e1714", stout: true },
  workA: { tunic: "#8a5d3b", skin: "#f5c9a0", cap: "#c2733a", apron: "#d8c9a6" },
  workB: { tunic: "#3f6a6f", skin: "#ecd0b6", cap: "#5b4a8a", moustache: "#4a3020" },
  yama: { tunic: "#2c3a63", skin: "#f8d6b4", hair: "#1c1618", suit: true, tie: "#b32d2d" },
  yamaOld: { tunic: "#b49a72", skin: "#f3d4b8", hair: "#f3f3f3", suit: true, glasses: true, tie: "#7a3b2e" },
  boss: { tunic: "#6e4a34", skin: "#f2cba8", bald: true, glasses: true, moustache: "#3c3028", suit: true, stout: true, tie: "#2f6b4f" },
  wife: { tunic: "#d86a82", skin: "#f8d6b4", hair: "#1c1618", dress: "#d86a82", bun: true },
  kid: { tunic: "#4f86c6", skin: "#f8d6b4", hair: "#1c1618" },
  kid2: { tunic: "#e0a23c", skin: "#f8d6b4", hair: "#241a18" },
  clerk: { tunic: "#46604a", skin: "#f2cba8", hair: "#2a2220", glasses: true, suit: true, tie: "#d9a845" },
  juli: { tunic: "#f0c64e", skin: "#fbdcc0", hair: "#7a5234", ribbon: "#e8436a" },
  dad: { tunic: "#b8a073", skin: "#f6d3b2", hair: "#5a4634", moustache: "#5a4634", glasses: true },
  local1: { tunic: "#ece5d2", skin: "#c48a5e", cap: "#d7b062" },
  local2: { tunic: "#6f8f4a", skin: "#b07a50", cap: "#8a5a3a", moustache: "#2a1e18" },
};

/** galea: iron bowl, brass brow band, cheek guards, transverse red crest */
const galea = (p, H, cx, hc, light, thick, ow, old, u) => {
  const crest = old ? "#8d4b3f" : "#d2372f", bowl = old ? "#8f8a7e" : STEEL;
  // crest (behind the bowl top)
  const cy0 = hc - H.b * 0.98;
  const cr = ellPts(cx, cy0, 0.66 * 2 * H.a, 0.42 * 2 * H.b, 180, 360, 0, 40);
  cr.push([cx + 0.66 * 2 * H.a * 0.98, cy0 + 4 * u], [cx - 0.66 * 2 * H.a * 0.98, cy0 + 4 * u]);
  const crP = [...ellPts(cx, cy0 + 2 * u, 0.62 * 2 * H.a, 0.36 * 2 * H.b, 180, 360, 0, 40)];
  p.shadedFill(crP, crest, mul(crest, [0.7, 0.62, 0.7]), light, 0.62 * 2 * H.a, 0.3);
  p.clip(crP, () => { for (let i = -9; i <= 9; i++) p.stroke([[cx + i * 7.4 * u, cy0], [cx + i * 9.4 * u, cy0 - 0.62 * H.b * Math.cos(i / 11)]], 1.4 * u, mul(crest, [0.62, 0.55, 0.62])); });
  if (old) p.clip(crP, () => { for (let i = 0; i < 6; i++) p.ell(cx + (i - 3) * 22 * u, cy0 - 18 * u - (i % 2) * 10 * u, 9 * u, 5 * u, "#6f6a5e", 0); });
  p.inkRing(crP, ow * 0.85, thick);
  p.poly(rrect(cx - 10 * u, cy0 - 6 * u, cx + 10 * u, cy0 + 6 * u, 3 * u), BRASS, 2 * u);
  // bowl: upper head cap
  const bandY = hc - H.b * 0.42;
  const bp = ellPts(cx, bandY, H.a * 1.05, H.b * 0.66, 180, 360, 0, 48);
  p.shadedFill(bp, bowl, mul(bowl, [0.62, 0.64, 0.72]), light, H.a, 0.4);
  p.clip(bp, () => {
    p.stroke(ellPts(cx - 20 * u, bandY - 0.3 * H.b, 0.25 * H.a, 0.18 * H.b, 200, 300, 0, 16), 4 * u, "#ffffff55");
    if (old) for (let i = 0; i < 9; i++) p.ell(cx + Math.sin(i * 2.3) * 0.8 * H.a, bandY - (0.08 + 0.5 * ((i * 0.37) % 1)) * H.b, (3 + (i % 3) * 2) * u, (2 + (i % 2)) * u, "#8a4b22", 0);
  });
  p.inkRing(bp, ow * 0.9, thick);
  p.band([[cx - H.a * 1.04, bandY], [cx + H.a * 1.04, bandY]], old ? "#a88a4a" : BRASS, 7 * u, 1.8 * u, "round");
  for (const s of [-1, 1]) p.dot(cx + s * 0.55 * H.a, bandY, 2.2 * u, "#fff3c4");
};
const cheeks = (p, H, cx, hc, light, ow, old, u) => {
  const bowl = old ? "#8f8a7e" : STEEL;
  for (const s of [-1, 1]) {
    const x0 = cx + s * 0.78 * H.a, x1 = cx + s * 1.07 * H.a, y0 = hc - H.b * 0.42, y1 = hc + H.b * 0.48;
    const pts = [[x0, y0], [x1, y0], [x1 - s * 0.04 * H.a, y1 - 0.1 * H.b], [x0 + s * 0.06 * H.a, y1], [x0 - s * 0.05 * H.a, (y0 + y1) / 2]];
    p.shadedFill(pts, bowl, mul(bowl, [0.62, 0.64, 0.72]), light, 0.2 * H.a, 0.3);
    p.poly(pts, null, ow * 0.8);
    p.dot((x0 + x1) / 2, (y0 + y1) / 2 - 0.05 * H.b, 2.2 * u, BRASS);
  }
};
const cobweb = (p, cx, cy, r, u) => {
  const g = p.g; g.save(); g.globalAlpha = 0.8;
  for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.05 + 0.9 * i / 6); p.stroke([[cx, cy], [cx + Math.cos(a) * r, cy + Math.sin(a) * r]], 1.1 * u, "#f2f2f2"); }
  for (let k = 1; k <= 4; k++) { const rr = r * k / 4.3, pts = []; for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.05 + 0.9 * i / 6); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } p.stroke(pts, 1 * u, "#f2f2f2"); }
  g.restore();
};

/** front-facing Roman-era character. opts: expr, blink, look, facing, seed, L/R arm poses, tilt, headTilt, bob, nohelmet, light */
export const romanFront = (p, key, opts = {}) => {
  const O = typeof key === "string" ? OUTFITS[key] : key;
  const { expr = "neutral", blink = 0, look = 0, facing = 0, seed = 3, L = "hang", R = O.spear ? "spear" : "hang", tilt = 0, headTilt = 0,
    bob = 0, nohelmet = false, light = rad(-120), web = false, step = 0 } = opts;
  const lid = lidOf(blink), skin = O.skin ?? SKIN;
  const H = headBlob(seed, 118, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const torsoL = O.stout ? 1.12 : 1.08, legsL = 1.38, sole = 975;
  const torsoBot = sole - legsL * HH - bob * HH, chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u, cx = 300;
  const legCol = mix(O.tunic, INK, 0.62), armCol = mix(O.tunic, INK, 0.5);
  const helmet = !!O.helmet && !nohelmet, old = O.helmet === "old";
  p.rot = null;
  if (O.longHair) { const lh = blobPts(cx, hc + 0.22 * HH, { ...H, a: H.a * 1.16, b: H.b * 1.3, egg: -0.05 }); p.shadedFill(lh, O.hair, mul(O.hair, [0.72, 0.68, 0.7]), light, H.a); p.inkRing(lh, ow * 0.85, thick); }
  // ---- cape behind everything ----
  if (O.cape) {
    const cp = [[cx - 0.48 * W, chin + 0.08 * HH], [cx + 0.48 * W, chin + 0.08 * HH], [cx + 0.62 * W, sole - 0.55 * HH], [cx + 0.2 * W, sole - 0.45 * HH], [cx - 0.2 * W, sole - 0.5 * HH], [cx - 0.62 * W, sole - 0.55 * HH]];
    p.gradFill(cp, O.cape, mul(O.cape, [0.6, 0.6, 0.7]), light); p.inkRing(cp, ow * 0.8, thick);
  }
  // ---- legs ----
  const dress = !!O.dress;
  for (const side of [-1, 1]) {
    const up = Math.max(0, Math.sin(Math.PI * 2 * (step + (side > 0 ? 0.5 : 0)))) * 30 * (step ? 1 : 0);
    const hx = cx + side * 16 * u, fx = cx + side * 22 * u, fy = sole - 4 * u - up;
    p.stroke(curve([hx, hipY], [(hx + fx) / 2 + side * 2 * u, (hipY + fy) / 2], [fx, fy]), 5.8 * u, legCol);
    const sandal = O.helmet ? LEATHER : "#5a3b2a";
    p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.5 * u + 3, INK);
    p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.5 * u, sandal);
    if (O.helmet) for (let k = 1; k <= 3; k++) p.stroke([[fx - 4 * u, fy - k * 0.07 * HH], [fx + 4 * u, fy - k * 0.07 * HH - 2 * u]], 2 * u, LEATHER);
  }
  // ---- upper body ----
  p.rot = tilt ? [rad(tilt), cx, hipY] : null;
  const T = { a: (0.4 * W) / 1.06 * (O.stout ? 1.12 : 1), b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.6, egg: O.stout ? 0.17 : 0.12, asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = cx + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const S = (side) => [tcx + side * 0.85 * T.a, chin + 0.12 * HH];
  const arm = (side, pose) => {
    const s = S(side), X = (k) => tcx + side * (T.a * 1.1 + k * u);
    switch (pose) {
      case "spear": return { pts: [s, [X(6), s[1] + 0.42 * HH], [X(10), s[1] + 0.2 * HH]], front: false };
      case "point": return { pts: [s, [X(28), s[1] - 0.02 * HH], [X(62), s[1] - 0.1 * HH]], front: false, finger: true };
      case "up": return { pts: [s, [X(14), s[1] - 0.3 * HH], [X(22), s[1] - 0.75 * HH]], front: false };
      case "wave": return { pts: [s, [X(16), s[1] - 0.2 * HH], [X(30 + 10 * Math.sin(opts.wv || 0)), s[1] - 0.62 * HH]], front: false };
      case "hip": return { pts: [s, [X(22), s[1] + 0.3 * HH], [tcx + side * T.a * 0.95, torsoBot - 0.3 * HH]], front: false };
      case "belly": return { pts: [s, [X(8), s[1] + 0.45 * HH], [tcx + side * 0.25 * T.a, torsoBot - 0.35 * HH]], front: true };
      case "temple": return { pts: [s, [X(26), s[1] + 0.05 * HH], [cx + side * (H.a + 16 * u), hc - 0.1 * HH]], front: false, swirl: true };
      case "lift": return { pts: [s, [X(20), s[1] - 0.25 * HH], [X(4), s[1] - 0.82 * HH]], front: false };
      case "shield": return { pts: [s, [X(4), s[1] + 0.4 * HH], [tcx + side * 0.6 * T.a, torsoBot - 0.1 * HH]], front: true };
      case "cross": return { pts: [s, [X(2), s[1] + 0.38 * HH], [tcx - side * 0.45 * T.a, s[1] + 0.32 * HH]], front: true };
      case "reach": { const lf = (opts.lift || 0) * 0.62 * HH; return { pts: [s, [X(42), s[1] - 0.12 * HH - lf * 0.6], [X(82), s[1] - 0.5 * HH - lf]], front: false }; }
      case "cheek": return { pts: [s, [X(16), s[1] + 0.05 * HH], [cx + side * (H.a + 2 * u), hc + 0.25 * H.b]], front: false };
      case "thumb": return { pts: [s, [X(20), s[1] + 0.12 * HH], [X(44), s[1] - 0.12 * HH]], front: false, thumb: true };
      default: return { pts: [s, [X(4), s[1] + 0.48 * HH], [X(3), chin + 1.04 * HH]], front: false };
    }
  };
  const arms = [arm(-1, L), arm(1, R)];
  const drawArm = (a) => {
    p.stroke(curve(a.pts[0], a.pts[1], a.pts[2]), 5.2 * u, armCol);
    const [hx, hy] = a.pts[2];
    p.dot(hx, hy, 5.5 * u);
    if (a.finger) { const dx = a.pts[2][0] - a.pts[1][0], dy = a.pts[2][1] - a.pts[1][1], l = Math.hypot(dx, dy); p.stroke([[hx, hy], [hx + dx / l * 14 * u, hy + dy / l * 14 * u]], 2.6 * u); }
    if (a.thumb) p.stroke([[hx, hy], [hx + Math.sign(hx - cx) * 6 * u, hy - 12 * u]], 2.6 * u);
  };
  // spear behind
  if (O.spear && R === "spear") {
    const [hx, hy] = arms[1].pts[2], s0 = [hx + 2 * u, sole - 2 * u], s1 = [hx - 3 * u, 70];
    p.band([s0, s1], old ? "#6d5236" : "#8a5a34", 4.2 * u, 1.4 * u, "round");
    const tip = [[s1[0] - 7 * u, s1[1] + 6 * u], [s1[0], s1[1] - 34 * u], [s1[0] + 7 * u, s1[1] + 6 * u], [s1[0], s1[1] + 14 * u]];
    p.poly(tip, old ? "#8b7c6a" : "#c9cfd6", 2 * u);
    if (web) cobweb(p, s1[0] - 2 * u, s1[1] + 60 * u, 70 * u, u);
  }
  for (const a of arms) if (!a.front) drawArm(a);
  // torso
  if (dress) {
    const D = { a: 0.5 * W * 0.98, b: 0.5 * ((sole - 0.35 * HH) - (chin - 0.2 * HH)), nTop: 2.0, nBot: 3.0, egg: 0.35, asym: 0, rot: 0, noise: 0.006, seed: seed + 9 };
    const dp = blobPts(cx, sole - 0.35 * HH - D.b, D);
    p.gradFill(dp, O.dress, mul(O.dress, SH_CLOTH), light); p.inkRing(dp, ow, thick);
  }
  // skirt / pteruges below the torso
  if (!dress) {
    const sk = [[tcx - 0.92 * T.a, torsoBot - 0.2 * HH], [tcx + 0.92 * T.a, torsoBot - 0.2 * HH], [tcx + 1.0 * T.a, torsoBot + 0.3 * HH], [tcx - 1.0 * T.a, torsoBot + 0.3 * HH]];
    p.gradFill(sk, O.tunic, mul(O.tunic, SH_CLOTH), light); p.poly(sk, null, ow * 0.8);
    if (O.armor) for (let i = -3; i <= 3; i++) { const x = tcx + i * 0.27 * T.a, st = [[x - 9 * u, torsoBot - 0.05 * HH], [x + 9 * u, torsoBot - 0.05 * HH], [x + 9 * u, torsoBot + 0.22 * HH], [x - 9 * u, torsoBot + 0.22 * HH]]; p.poly(st, old ? "#5e4632" : LEATHER, 1.6 * u); }
  }
  p.gradFill(tp, O.tunic, mul(O.tunic, SH_CLOTH), light);
  p.clip(tp, () => {
    if (O.armor) {
      const top = chin - 0.1 * HH, bot = torsoBot - 0.25 * HH, n = 5;
      for (let i = 0; i < n; i++) {
        const y0 = top + (bot - top) * i / n, y1 = top + (bot - top) * (i + 1) / n;
        const c = old ? (i % 2 ? "#8d8679" : "#9a9384") : (i % 2 ? "#a7b0ba" : "#bcc4cc");
        p.poly([[tcx - 1.5 * T.a, y0], [tcx + 1.5 * T.a, y0 + 3 * u], [tcx + 1.5 * T.a, y1 + 3 * u], [tcx - 1.5 * T.a, y1]], c, 1.8 * u);
      }
      p.band([[tcx - 1.4 * T.a, torsoBot - 0.2 * HH], [tcx + 1.4 * T.a, torsoBot - 0.2 * HH]], LEATHER, 0.08 * HH, 1.5 * u);
      for (let i = -2; i <= 2; i++) p.dot(tcx + i * 0.3 * T.a, torsoBot - 0.2 * HH, 2.4 * u, BRASS);
      if (old) for (let i = 0; i < 5; i++) p.ell(tcx + Math.sin(i * 1.7) * 0.7 * T.a, top + (bot - top) * ((i * 0.31) % 1), 6 * u, 3 * u, "#8a4b22", 0);
    } else {
      p.band([[tcx - 1.4 * T.a, torsoBot - 0.24 * HH], [tcx + 1.4 * T.a, torsoBot - 0.24 * HH]], O.apron ? "#5a3b2a" : "#e2c27a", 0.05 * HH, 1.2 * u);
      if (O.toga) p.band([[tcx - 1.0 * T.a, chin - 0.1 * HH], [tcx + 1.1 * T.a, torsoBot - 0.1 * HH]], O.toga, 0.16 * HH, 1.6 * u);
      if (O.apron) p.poly([[tcx - 0.55 * T.a, torsoBot - 0.2 * HH], [tcx + 0.55 * T.a, torsoBot - 0.2 * HH], [tcx + 0.6 * T.a, torsoBot + 0.2 * HH], [tcx - 0.6 * T.a, torsoBot + 0.2 * HH]], O.apron, 1.6 * u);
      p.stroke([[tcx - 0.2 * T.a, chin + 0.02 * HH], [tcx, chin + 0.16 * HH], [tcx + 0.2 * T.a, chin + 0.02 * HH]], 2 * u);
      if (O.suit) {
        p.poly([[tcx - 0.3 * T.a, chin - 0.04 * HH], [tcx + 0.3 * T.a, chin - 0.04 * HH], [tcx, chin + 0.55 * HH]], "#f7f5ee", 2 * u);
        p.poly([[tcx - 4.5 * u, chin + 0.05 * HH], [tcx + 4.5 * u, chin + 0.05 * HH], [tcx + 6.5 * u, chin + 0.4 * HH], [tcx, chin + 0.54 * HH], [tcx - 6.5 * u, chin + 0.4 * HH]], O.tie || "#b32d2d", 1.6 * u);
      }
    }
    if (opts.sash) p.band([[tcx - 1.1 * T.a, chin - 0.02 * HH], [tcx + 1.1 * T.a, chin + 0.78 * HH]], "#f6f3ea", 0.15 * HH, 1.8 * u);
    if (opts.soot) for (let i = 0; i < 4; i++) p.ell(tcx + Math.sin(i * 2.1) * 0.75 * T.a, chin + 0.1 * HH + ((i * 0.19) % 1) * 0.95 * HH, (10 + (i % 3) * 7) * u, (8 + (i % 2) * 7) * u, "rgba(28,22,24,0.3)", 0);
  });
  p.inkRing(tp, ow, thick);
  if (O.armor) for (const s of [-1, 1]) { // shoulder plates
    const sp = ellPts(tcx + s * 0.72 * T.a, chin + 0.1 * HH, 0.42 * T.a, 0.13 * HH, 180, 360, s * 8, 20);
    p.poly(sp, old ? "#9a9384" : "#c5ccd3", 1.8 * u);
  }
  if (opts.belt) { p.band([[tcx - 1.15 * T.a, torsoBot - 0.18 * HH], [tcx + 1.15 * T.a, torsoBot - 0.18 * HH]], "#7a7f8a", 0.09 * HH, 1.8 * u); p.poly(rrect(tcx - 9 * u, torsoBot - 0.18 * HH - 7 * u, tcx + 9 * u, torsoBot - 0.18 * HH + 7 * u, 2 * u), "#d0d4dc", 1.6 * u); }
  if (O.moss) {/* reserved */}
  for (const a of arms) if (a.front) drawArm(a);
  // shield in front, held by the left hand
  if (O.shield && L === "shield") {
    const sx = tcx - 0.55 * T.a, sy = torsoBot + 0.05 * HH, sw = 0.36 * W, sh = 0.78 * HH;
    const sp = rrect(sx - sw, sy - sh, sx + sw, sy + sh, 8 * u);
    p.gradFill(sp, "#c0302c", "#7d1d22", light);
    p.clip(sp, () => {
      p.band([[sx - sw, sy], [sx + sw, sy]], BRASS, 6 * u, 1.2 * u);
      p.band([[sx, sy - sh], [sx, sy + sh]], BRASS, 6 * u, 1.2 * u);
      for (const s of [-1, 1]) { p.stroke([[sx + s * 12 * u, sy - 14 * u], [sx + s * 34 * u, sy - 46 * u], [sx + s * 22 * u, sy - 44 * u], [sx + s * 46 * u, sy - 74 * u]], 3.5 * u, BRASS); p.stroke([[sx + s * 12 * u, sy + 14 * u], [sx + s * 34 * u, sy + 46 * u], [sx + s * 22 * u, sy + 44 * u], [sx + s * 46 * u, sy + 74 * u]], 3.5 * u, BRASS); }
      p.stroke(ellPts(sx - sw * 0.5, sy - sh * 0.7, sw * 0.3, sh * 0.1, 200, 320, 0, 10), 3 * u, "#ffffff44");
    });
    p.ell(sx, sy, 13 * u, 13 * u, "#e6c068", 2.2 * u);
    p.inkRing(sp, ow, thick);
  }
  // ---- head ----
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt), [cx, hipY]);
  const Ah = tilt + headTilt;
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;
  if (helmet) galea(p, H, cx, hc, light, thick, ow, old, u);
  const hp = blobPts(cx, hc, H);
  if (O.hair && !helmet) { const hb = blobPts(cx, hc - 0.03 * HH, { ...H, a: H.a * 1.04, b: H.b * 1.05 }); p.poly(hb, O.hair, 0); }
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  if (helmet) {
    const bandY = hc - H.b * 0.42, bp = ellPts(cx, bandY, H.a * 1.05, H.b * 0.66, 180, 360, 0, 48);
    p.shadedFill(bp, old ? "#8f8a7e" : STEEL, mul(old ? "#8f8a7e" : STEEL, [0.62, 0.64, 0.72]), light, H.a, 0.4);
    p.clip(bp, () => { p.stroke(ellPts(cx - 20 * u, bandY - 0.3 * H.b, 0.25 * H.a, 0.18 * H.b, 200, 300, 0, 16), 5 * u, "#ffffff66");
      if (old) for (let i = 0; i < 9; i++) p.ell(cx + Math.sin(i * 2.3) * 0.8 * H.a, bandY - (0.08 + 0.5 * ((i * 0.37) % 1)) * H.b, (4 + (i % 3) * 2) * u, (2.5 + (i % 2)) * u, "#8a4b22", 0); });
    p.poly(bp, null, ow * 0.9);
    p.band([[cx - H.a * 1.05, bandY], [cx + H.a * 1.05, bandY]], old ? "#a88a4a" : BRASS, 7 * u, 1.8 * u, "round");
    p.poly(rrect(cx - 4 * u, bandY - 0.55 * H.b, cx + 4 * u, bandY - 3 * u, 2 * u), old ? "#a88a4a" : BRASS, 1.5 * u);
    cheeks(p, H, cx, hc, light, ow, old, u);
  } else if (O.cap) hatOn(p, { hat: "cap", cap: O.cap, jacket: O.tunic }, hp, H, cx, hc, light, seed, facing, false);
  else if (O.hair) hatOn(p, { hat: "hair", hair: O.hair, jacket: O.tunic }, hp, H, cx, hc, light, seed, facing, false);
  else if (O.bald) { for (const s_ of [-1, 1]) p.ell(cx + s_ * 0.9 * H.a, hc - 0.05 * H.b, 0.2 * H.a, 0.3 * H.b, "#d8d4ce", 3 * u); }
  else if (O.helmet && nohelmet) { // bald old head with white side tufts
    for (const s of [-1, 1]) p.ell(cx + s * 0.9 * H.a, hc - 0.1 * H.b, 0.22 * H.a, 0.3 * H.b, "#f4f1ea", 3 * u);
  }
  if (O.beard) {
    const bd = blobPts(cx + 6 * u * facing, hc + 0.85 * H.b, { a: 0.62 * H.a, b: 0.75 * H.b, nTop: 2.4, nBot: 1.6, egg: -0.35, asym: 0, rot: 0, noise: 0.02, seed: seed + 4 });
    p.shadedFill(bd, O.beard, mul(O.beard, [0.86, 0.86, 0.92]), light, 0.6 * H.a, 0.3);
    p.clip(bd, () => { for (let i = -3; i <= 3; i++) p.stroke([[cx + i * 9 * u, hc + 0.45 * H.b], [cx + i * 7 * u, hc + 1.35 * H.b]], 1.2 * u, "#c9c4bb"); });
    p.inkRing(bd, ow * 0.8, thick);
  }
  faceFront(p, cx, hc, W, expr, facing, look, lid, helmet, skin, O.beard ? O.beard : O.moustache, !!O.stout);
  if (O.brows) for (const s of [-1, 1]) p.ell(cx + 7 * u * facing + s * 14 * u, hc - 20 * u, 11 * u, 5 * u, O.brows, 2 * u);
  if (O.bun) p.ell(cx, hc - H.b * 1.02, 0.34 * H.a, 0.3 * H.a, O.hair, 3 * u);
  if (O.ribbon) { const bx = cx + 0.5 * H.a, by = hc - 0.86 * H.b, rc = O.ribbon;
    p.poly([[bx, by], [bx - 36 * u, by - 24 * u], [bx - 40 * u, by + 2 * u], [bx - 30 * u, by + 20 * u]], rc, 2.6 * u);
    p.poly([[bx, by], [bx + 36 * u, by - 24 * u], [bx + 40 * u, by + 2 * u], [bx + 30 * u, by + 20 * u]], rc, 2.6 * u);
    p.ell(bx, by, 9 * u, 9 * u, mul(rc, [0.8, 0.75, 0.8]), 2.4 * u); }
  if (O.glasses) {
    for (const s_ of [-1, 1]) p.stroke(ellPts(cx + 7 * u * facing + s_ * 13 * u, hc, 15 * u, 15 * u, 0, 360, 0, 28), 2.6 * u, INK);
    p.stroke([[cx + 7 * u * facing - 3 * u, hc - 2 * u], [cx + 7 * u * facing + 3 * u, hc - 2 * u]], 2.4 * u, INK);
  }
  if (opts.bandage) {
    p.band([[cx - H.a * 1.0, hc - H.b * 0.5], [cx + H.a * 1.0, hc - H.b * 0.56]], "#f6f3ea", 0.2 * H.b, 2 * u, "round");
    p.band([[cx + 0.25 * H.a, hc - H.b * 0.95], [cx + 0.78 * H.a, hc + H.b * 0.1]], "#efeade", 0.16 * H.b, 2 * u, "round");
    p.poly(rrect(cx - 0.8 * H.a, hc + 0.18 * H.b, cx - 0.5 * H.a, hc + 0.46 * H.b, 3 * u), "#f6f3ea", 2.2 * u);
  }
  if (opts.burn) { p.ell(cx + 0.58 * H.a, hc + 0.3 * H.b, 11 * u, 8 * u, "#d95f48", 0); p.ell(cx + 0.55 * H.a, hc + 0.28 * H.b, 5 * u, 3.5 * u, "#f2a08a", 0); p.ell(cx - 0.62 * H.a, hc + 0.02 * H.b, 7 * u, 6 * u, "#d95f48", 0); }
  if (opts.soot) for (const [a_, b_, r_] of [[-0.45, -0.25, 16], [0.5, 0.35, 18], [0.05, 0.62, 12], [-0.6, 0.4, 10]]) p.ell(cx + a_ * H.a, hc + b_ * H.b, r_ * u, r_ * 0.75 * u, "rgba(30,24,26,0.38)", 0);
  if (opts.cuts) { for (const [a_, b_, l_] of [[-0.5, 0.25, 14], [0.55, -0.15, 12], [0.35, 0.5, 9]]) p.stroke([[cx + a_ * H.a - l_ * 0.5 * u, hc + b_ * H.b - 3 * u], [cx + a_ * H.a + l_ * 0.5 * u, hc + b_ * H.b + 3 * u]], 2.6 * u, "#c0392f"); }
  if (opts.sweat) p.poly([[cx + 0.92 * H.a, hc - 0.5 * H.b], [cx + 0.8 * H.a, hc - 0.28 * H.b], [cx + 0.92 * H.a, hc - 0.18 * H.b], [cx + 1.04 * H.a, hc - 0.28 * H.b]], "#9fd4ff", 2.2 * u);
  if (O.beard) { // re-draw the mouth over the beard for open mouths
    if (expr === "shock" || expr === "snore") p.ell(cx + 8 * u * facing, hc + 22 * u, 6 * u, 7 * u, "#5a1e28", 2 * u);
  }
  p.rot = null;
  if (arms.some((a) => a.swirl)) { // cuckoo swirl next to the temple
    const a = arms.find((x) => x.swirl), [hx, hy] = a.pts[2], ph = opts.swirl || 0, pts = [];
    for (let i = 0; i < 40; i++) { const t = i / 40 * Math.PI * 4 + ph, r = (4 + i * 0.7) * u; pts.push([hx + Math.cos(t) * r, hy - 40 * u + Math.sin(t) * r]); }
    p.stroke(pts, 3 * u, "#ffffff"); p.stroke(pts, 1.4 * u, INK);
  }
};

/** loose helmet prop card (lifted off the old soldier) */
export const helmetCard = (p) => {
  const H = headBlob(3, 118, 0), u = 2 * H.a / 100, hc = 560, light = rad(-120), thick = thickAngle(light), ow = 5 * u;
  galea(p, H, 300, hc, light, thick, ow, true, u);
  const bandY = hc - H.b * 0.42, bp = ellPts(300, bandY, H.a * 1.05, H.b * 0.66, 180, 360, 0, 48);
  // dark inside visible from below
  p.ell(300, bandY, H.a * 1.05, 0.12 * H.b, "#2a221e", 0);
  p.shadedFill(bp, "#8f8a7e", mul("#8f8a7e", [0.62, 0.64, 0.72]), light, H.a, 0.4);
  p.clip(bp, () => { for (let i = 0; i < 9; i++) p.ell(300 + Math.sin(i * 2.3) * 0.8 * H.a, bandY - (0.08 + 0.5 * ((i * 0.37) % 1)) * H.b, (4 + (i % 3) * 2) * u, (2.5 + (i % 2)) * u, "#8a4b22", 0); });
  p.poly(bp, null, ow * 0.9);
  p.band([[300 - H.a * 1.05, bandY], [300 + H.a * 1.05, bandY]], "#a88a4a", 7 * u, 1.8 * u, "round");
  cheeks(p, H, 300, hc, light, ow, true, u);
};

/** ZZZ for the sleeping guard */
export const fxZ = (p, t) => {
  const g = p.g; g.save(); g.font = "900 120px Arial Black, Arial"; g.lineJoin = "round";
  for (let i = 0; i < 3; i++) {
    const k = (t + i / 3) % 1, x = 220 + i * 70 + Math.sin(k * 6) * 20, y = 700 - k * 500, s = 0.5 + k * 0.7;
    g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha = Math.min(1, (1 - k) * 2.5);
    g.lineWidth = 16; g.strokeStyle = INK; g.strokeText("Z", 0, 0); g.fillStyle = "#ffffff"; g.fillText("Z", 0, 0); g.restore();
  }
  g.restore();
};
/** falling leaf */
export const fxLeaf = (p, col) => { p.poly([[300, 380], [420, 470], [300, 620], [180, 470]], col, 14); p.stroke([[300, 400], [300, 600]], 8); };
/** dust cloud puff (k 0..1 growth) */
export const fxDust = (p, k, col = "#e8dcc4") => {
  const g = p.g; g.save(); g.globalAlpha = Math.max(0, 1 - k * k);
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, r = 90 + 150 * k; p.ell(300 + Math.cos(a) * r, 520 + Math.sin(a) * r * 0.6, 120 + 60 * k, 100 + 50 * k, col, 12); }
  p.ell(300, 520, 170 + 110 * k, 140 + 80 * k, col, 0);
  g.restore();
};
export const fxDrip = (p) => p.ell(300, 500, 40, 64, "#9fd4ff", 10);
export const fxWood = (p, seed) => { p.poly([[200, 420], [400, 400], [420, 560], [230, 600]], "#5b3d22", 14); p.stroke([[240, 450], [380, 440]], 6, "#3a2614"); p.ell(330, 520, 26, 18, "#4d7a32", 0); };

export const headCenter = (seed = 3) => { const H = headBlob(seed, 118, 0), HH = 2 * H.b; return 975 - 1.38 * HH - 1.08 * HH - H.b; };

// ---------------- fx for the Yamaguchi short ----------------
const txtFx = (p, str, x, y, size, fill = "#ffffff", stroke = 16, font = "900") => {
  const g = p.g; g.save(); g.font = `${font} ${size}px Arial Black, Arial`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
  g.lineWidth = stroke; g.strokeStyle = INK; g.strokeText(str, x, y); g.fillStyle = fill; g.fillText(str, x, y); g.restore();
};
export const fxText = (p, str, size = 160, fill = "#ffffff", stroke = 18) => txtFx(p, str, 300, 520, size, fill, stroke);
/** atomic cloud, k = growth 0..1 (cartoon: inked blobs, orange fire core) */
export const fxMushroom = (p, k, t = 0) => {
  if (k <= 0.01) return;
  const base = 985, h = 760 * k, sw = 52 * (0.55 + 0.45 * k), capR = 70 + 215 * k;
  p.poly([[300 - sw * 2.2, base], [300 - sw * 0.7, base - h], [300 + sw * 0.7, base - h], [300 + sw * 2.2, base]], "#a8392c", 12);
  p.poly([[300 - sw * 1.1, base], [300 - sw * 0.35, base - h], [300 + sw * 0.35, base - h], [300 + sw * 1.1, base]], "#ef8a3a", 0);
  p.ell(300, base - 6, sw * 3.2, 38, "#f6b24a", 10);
  const cy = base - h - capR * 0.1;
  const ring = (n, rr, rad, col, ow, oy = 0, ph = 0) => { for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + ph, wob = 1 + 0.06 * Math.sin(t * 2.2 + i * 1.7); p.ell(300 + Math.cos(a) * rr * 1.18, cy + Math.sin(a) * rr * 0.7 + oy, rad * wob, rad * 0.92 * wob, col, ow); } };
  ring(13, capR * 0.66, capR * 0.42, "#8e3a30", 12);
  ring(11, capR * 0.5, capR * 0.34, "#d8552f", 0, capR * 0.05, 0.3);
  ring(9, capR * 0.34, capR * 0.26, "#f59a3c", 0, capR * 0.1, 0.6);
  p.ell(300, cy + capR * 0.14, capR * 0.3, capR * 0.2, "#ffe08a", 0);
};
/** calendar page: n = day number shown, flip 0..1 = previous page folding away */
export const fxCalendar = (p, n, flip = 1, small = "AGUSTUS 1945") => {
  const x0 = 60, x1 = 540, y0 = 250, y1 = 860;
  p.poly(rrect(x0 + 10, y0 + 12, x1 + 10, y1 + 12, 26), "rgba(0,0,0,0.35)", 0);
  p.poly(rrect(x0, y0, x1, y1, 26), "#f8f4ea", 12);
  p.poly(rrect(x0, y0, x1, y0 + 130, 26), "#d23a2e", 0); p.poly([[x0, y0 + 80], [x1, y0 + 80], [x1, y0 + 130], [x0, y0 + 130]], "#d23a2e", 0); p.poly(rrect(x0, y0, x1, y1, 26), null, 12);
  txtFx(p, small, 300, y0 + 68, 56, "#ffffff", 8);
  for (const x of [150, 300, 450]) { p.ell(x, y0 - 6, 14, 20, "#2a2230", 4); }
  txtFx(p, String(n), 300, 600, 380, "#241726", 0);
  if (flip < 1) {
    const g = p.g, hh = (y1 - (y0 + 130)) * (1 - flip); g.save();
    p.poly([[x0, y0 + 130], [x1, y0 + 130], [x1 - 6, y0 + 130 + hh], [x0 + 6, y0 + 130 + hh]], "#ece6d8", 8);
    txtFx(p, String(n - 1), 300, y0 + 130 + hh * 0.5, 380 * (1 - flip), "#241726", 0); g.restore();
  }
};
export const fxHeart = (p) => { const g = p.g; g.save(); g.beginPath(); g.moveTo(300, 560); g.bezierCurveTo(130, 430, 200, 300, 300, 400); g.bezierCurveTo(400, 300, 470, 430, 300, 560); g.closePath(); g.fillStyle = "#ee5a7a"; g.fill(); g.lineWidth = 16; g.strokeStyle = INK; g.stroke(); g.restore(); };
export const fxSmoke = (p, k, col = "#5a4a48") => { const g = p.g; g.save(); g.globalAlpha = Math.max(0, 0.85 - k * 0.5); for (let i = 0; i < 6; i++) p.ell(300 + Math.sin(i * 2) * 60, 800 - k * 260 - i * 70, 70 + i * 16 + k * 30, 60 + i * 12, col, 0); g.restore(); };
export const fxPaper = (p) => { p.poly([[190, 400], [420, 380], [430, 600], [200, 620]], "#fbfaf4", 12); for (let i = 0; i < 4; i++) p.stroke([[230, 440 + i * 36], [390, 430 + i * 36]], 6, "#8a8f9c"); };
export const fxShard = (p) => p.poly([[300, 380], [400, 560], [330, 640], [250, 520]], "rgba(190,225,250,0.85)", 10);
export const fxEmber = (p) => p.ell(300, 500, 46, 60, "#ffb04a", 0);
export const fxPlane = (p) => {
  p.poly([[120, 520], [420, 505], [520, 540], [420, 570], [120, 560]], "#e9edf2", 10);
  p.poly([[250, 530], [330, 400], [370, 410], [330, 535]], "#d3d9e0", 10); p.poly([[250, 550], [330, 690], [370, 680], [330, 545]], "#d3d9e0", 10);
  p.poly([[120, 520], [90, 450], [140, 455], [170, 520]], "#d3d9e0", 8);
  p.ell(470, 538, 22, 16, "#7fb8e8", 6);
};
export const fxBubbleMush = (p, t = 0) => {
  const g = p.g;
  for (const [x, y, r_] of [[190, 760, 26], [150, 830, 16]]) p.ell(x, y, r_, r_, "#ffffff", 9);
  p.ell(300, 470, 250, 210, "#ffffff", 12); p.ell(120, 520, 120, 110, "#ffffff", 0); p.ell(480, 520, 120, 110, "#ffffff", 0);
  p.ell(300, 470, 250, 210, null, 12);
  g.save(); g.translate(0, -120); g.scale(1, 0.62); g.translate(0, 340);
  const base = 760, h = 300, sw = 26, capR = 110;
  p.poly([[300 - sw * 2, base], [300 - sw * 0.7, base - h], [300 + sw * 0.7, base - h], [300 + sw * 2, base]], "#a8392c", 8);
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; p.ell(300 + Math.cos(a) * capR * 0.62, base - h - capR * 0.2 + Math.sin(a) * capR * 0.42, capR * 0.42, capR * 0.4, i % 2 ? "#d8552f" : "#f59a3c", 8); }
  p.ell(300, base - h - capR * 0.1, capR * 0.32, capR * 0.24, "#ffe08a", 0);
  g.restore();
};

export const fxBolt = (p) => {
  const pts = [[330, 20], [250, 360], [330, 360], [220, 700], [300, 690], [190, 990], [420, 600], [330, 610], [450, 320], [370, 330], [430, 20]];
  p.poly(pts, "#fff6b0", 16); p.poly([[340, 60], [282, 350], [350, 350], [262, 640], [300, 640]], "#ffffff", 0);
};
export const fxFly = (p, t = 0) => { const w = 60 + 30 * Math.sin(t * 40); p.ell(240, 470, w * 0.9, 40, "rgba(220,235,255,0.85)", 6); p.ell(360, 470, w * 0.9, 40, "rgba(220,235,255,0.85)", 6); p.ell(300, 520, 70, 54, "#2a2a30", 8); };
export const fxRain = (p) => { for (let i = 0; i < 26; i++) { const x = (i * 97) % 600, y = (i * 211) % 900; p.stroke([[x, y], [x - 30, y + 110]], 5, "rgba(200,215,240,0.75)"); } };
