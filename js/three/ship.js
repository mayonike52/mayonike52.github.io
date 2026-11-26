// INTERIOR — cutaway of the ship: cockpit · lounge · workbench · terrarium
import { THREE, P, hex, mat, shadow, box, cyl, sph, at, canvasTex, plane, wire, glow, MONO, SANS, signTex, stripeTex, particles, dotTex, buildDroid } from "./lib.js";

const ROOMS = [
  { key: "cockpit", x: -10, title: "Cockpit", sub: "flight log · comms" },
  { key: "lounge", x: 0, title: "Lounge", sub: "crew quarters · about" },
  { key: "workbench", x: 10, title: "Workbench", sub: "projects · lightsaber" },
  { key: "terrarium", x: 20, title: "Terrarium", sub: "bio · next" }
];

export function buildShip({ root, register }) {
  const C = { wall: 0x4e5874, wallD: 0x3a4259, rib: 0x2d3346, floor: 0x343b4f, trim: 0x6b7591, amber: 0xffc9a0 };
  const steel = { metalness: 0.7, roughness: 0.35 };
  const XMIN = -15, XMAX = 25, LEN = XMAX - XMIN, XC = (XMIN + XMAX) / 2, BACK = -3, FRONT = 3, H = 4.4;

  // ── lighting ──
  root.add(new THREE.HemisphereLight(0xb9c6e6, 0x2a2f40, 0.55));
  const key = new THREE.DirectionalLight(0xffe6d6, 0.9); key.position.set(XC, 9, 9); key.target.position.set(XC, 0, -1);
  key.castShadow = true; key.shadow.mapSize.set(4096, 1024); Object.assign(key.shadow.camera, { left: -22, right: 22, top: 6, bottom: -2, near: 1, far: 30 }); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.03;
  root.add(key, key.target);
  ROOMS.forEach(r => {
    const a = new THREE.PointLight(C.amber, 9, 9, 1.6); a.position.set(r.x, 3.9, 0); root.add(a);
    const b = new THREE.PointLight(0x9fb8ee, 4, 7, 2); b.position.set(r.x + 2.5, 0.6, 1.5); root.add(b);
  });

  // ── shell textures ──
  const panelTex = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = hex(C.wall); g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? "20,24,40" : "200,210,235"},${0.03 + Math.random() * 0.05})`; g.fillRect(Math.random() * w, Math.random() * h, 60 + Math.random() * 200, 40 + Math.random() * 140); }
    g.strokeStyle = "rgba(20,24,40,.55)"; g.lineWidth = 3;
    for (const y of [0, 170, 340]) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    for (const x of [0, 256]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    g.fillStyle = "rgba(20,24,40,.6)"; for (const y of [12, 182, 352]) for (let x = 14; x < w; x += 40) { g.beginPath(); g.arc(x, y, 2.5, 0, 7); g.fill(); }
    g.fillStyle = "rgba(201,127,152,.35)"; g.fillRect(300, 400, 90, 12); g.fillStyle = "rgba(230,214,168,.35)"; g.fillRect(40, 220, 40, 40);
  });
  panelTex.wrapS = panelTex.wrapT = THREE.RepeatWrapping; panelTex.repeat.set(LEN / 3, 1.5);
  const grateTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = hex(C.floor); g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(10,12,22,.7)"; g.lineWidth = 4; for (let i = 0; i <= w; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); } g.fillStyle = "rgba(200,210,235,.06)"; g.fillRect(0, 0, w, 6); });
  grateTex.wrapS = grateTex.wrapT = THREE.RepeatWrapping; grateTex.repeat.set(LEN / 1.2, 6 / 1.2);

  // ── shell ──
  at(root, shadow(new THREE.Mesh(new THREE.BoxGeometry(LEN, 0.2, FRONT - BACK), new THREE.MeshStandardMaterial({ map: grateTex, roughness: 0.6, metalness: 0.4 })), false, true), XC, -0.1, 0);
  const wall = shadow(new THREE.Mesh(new THREE.PlaneGeometry(LEN, 3.6), new THREE.MeshStandardMaterial({ map: panelTex, roughness: 0.75, metalness: 0.2 })), false, true); at(root, wall, XC, 1.8, BACK);
  const cham = shadow(new THREE.Mesh(new THREE.PlaneGeometry(LEN, 1.13), mat(C.wallD, { roughness: 0.7 })), false, true); at(root, cham, XC, 4.0, BACK + 0.4); cham.rotation.x = Math.PI / 4;
  const ceil = shadow(new THREE.Mesh(new THREE.PlaneGeometry(LEN, FRONT - BACK - 0.8), mat(0x2c3244)), false, true); at(root, ceil, XC, H, (FRONT + BACK + 0.8) / 2); ceil.rotation.x = Math.PI / 2;
  for (let x = XMIN + 1.25; x < XMAX; x += 2.5) {
    at(root, box(0.22, 3.6, 0.16, C.rib, 0.03, { metalness: 0.4 }), x, 1.8, BACK + 0.08);
    const cr = at(root, box(0.22, 1.13, 0.16, C.rib, 0.03), x, 4.0, BACK + 0.45); cr.rotation.x = Math.PI / 4;
    at(root, box(0.22, 0.16, 5.2, C.rib, 0.03), x, H - 0.08, 0.4);
  }
  // pipes + cable runs + floor light strips
  at(root, cyl(0.07, 0.07, LEN, P.navy, 12, steel), XC, 3.45, BACK + 0.2).rotation.z = Math.PI / 2;
  at(root, cyl(0.05, 0.05, LEN, 0x8a6a80, 12, steel), XC, 3.3, BACK + 0.25).rotation.z = Math.PI / 2;
  at(root, box(LEN, 0.03, 0.05, glow(0x9fc3f0), 0), XC, 0.03, FRONT - 0.08);
  at(root, box(LEN, 0.03, 0.05, glow(0xffc9a0), 0), XC, 3.38, BACK + 0.04);
  // hull cut-away rim (front)
  at(root, box(LEN + 0.6, 0.5, 0.4, 0x1c2132, 0.05), XC, -0.35, FRONT + 0.05);
  at(root, box(LEN + 0.6, 0.6, 0.4, 0x1c2132, 0.05), XC, H + 0.25, FRONT + 0.05);
  // bulkheads with doorways + end caps
  const bulk = (x, door) => {
    const g = new THREE.Group(); g.position.x = x; root.add(g);
    const T = 0.35, m = mat(C.wallD, { roughness: 0.7 });
    if (!door) { at(g, box(T, H, FRONT - BACK, m, 0.02), 0, H / 2, 0); return; }
    at(g, box(T, H, 1.8, m, 0.02), 0, H / 2, BACK + 0.9);
    at(g, box(T, H, 2.4, m, 0.02), 0, H / 2, FRONT - 1.2);
    at(g, box(T, H - 2.6, 1.8, m, 0.02), 0, 2.6 + (H - 2.6) / 2, -0.3);
    const frame = at(g, new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.08, 8, 24, Math.PI), mat(C.trim, steel)), 0.19, 1.7, -0.3); frame.rotation.y = Math.PI / 2;
    at(g, box(0.05, 0.03, 1.8, glow(0xffc9a0), 0), 0.19, 2.62, -0.3);
    at(g, box(T + 0.04, 0.08, 1.8, 0x23283a, 0.01), 0, 0.04, -0.3);
  };
  bulk(XMIN, false); bulk(-5, true); bulk(5, true); bulk(15, true); bulk(XMAX, false);

  const updaters = [];

  // ════════════════ COCKPIT (x = -10) ════════════════
  {
    const X = -10;
    // viewport with animated hyperspace texture
    const vp = canvasTex(1024, 400, () => {});
    const vStreaks = Array.from({ length: 160 }, () => ({ a: Math.random() * Math.PI * 2, r: Math.random(), s: 0.2 + Math.random() * 0.8 }));
    const drawVP = (t) => {
      const { ctx: g, canvas } = vp.userData, w = canvas.width, h = canvas.height;
      const gr = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.6); gr.addColorStop(0, "#c9d8ff"); gr.addColorStop(0.15, "#5670a8"); gr.addColorStop(0.6, "#1b2240"); gr.addColorStop(1, "#0b0e1a");
      g.fillStyle = gr; g.fillRect(0, 0, w, h); g.lineCap = "round";
      vStreaks.forEach(st => { st.r += st.s * 0.012; if (st.r > 1.1) st.r = 0.02; const r1 = st.r * w * 0.7, r0 = Math.max(0, r1 - 40 - st.r * 160); g.strokeStyle = `rgba(220,232,255,${Math.min(1, st.r * 1.4)})`; g.lineWidth = 1 + st.r * 2.5;
        g.beginPath(); g.moveTo(w / 2 + Math.cos(st.a) * r0, h / 2 + Math.sin(st.a) * r0 * 0.6); g.lineTo(w / 2 + Math.cos(st.a) * r1, h / 2 + Math.sin(st.a) * r1 * 0.6); g.stroke(); });
      vp.needsUpdate = true;
    };
    const win = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 2.3), glow(0xffffff, { map: vp })); at(root, win, X, 2.35, BACK + 0.02);
    for (const [w, h, x, y] of [[6.7, 0.18, 0, 3.55], [6.7, 0.22, 0, 1.15], [0.18, 2.5, -3.25, 2.35], [0.18, 2.5, 3.25, 2.35], [0.12, 2.3, -1.1, 2.35], [0.12, 2.3, 1.1, 2.35]]) at(root, box(w, h, 0.14, C.rib, 0.03, { metalness: 0.4 }), X + x, y, BACK + 0.08);
    const winLight = new THREE.PointLight(0x9fb8ee, 8, 8, 2); winLight.position.set(X, 2.3, BACK + 1.2); root.add(winLight);
    // console
    at(root, box(6.2, 0.95, 1.0, 0x2a3044, 0.06), X, 0.48, BACK + 0.6);
    const dash = at(root, box(6.2, 0.08, 0.9, 0x232838, 0.03), X, 1.02, BACK + 0.95); dash.rotation.x = -0.35;
    const buttons = [];
    for (let i = 0; i < 46; i++) { const c = [P.rose, 0x9fd0f0, P.butter, 0x9bb5a8][i % 4]; const b = at(root, box(0.08, 0.03, 0.06, mat(c, { emissive: c, emissiveIntensity: 0.6 }), 0.01), X - 2.8 + (i % 23) * 0.25, 1.08 + Math.floor(i / 23) * 0.02, BACK + 0.85 + Math.floor(i / 23) * 0.22); b.rotation.x = -0.35; buttons.push(b); }
    for (const dx of [-0.6, 0.6]) { const lv = at(root, box(0.05, 0.35, 0.05, P.metal, 0.02, steel), X + dx, 1.25, BACK + 1.2); lv.rotation.x = -0.4; at(root, sph(0.06, P.rose), X + dx, 1.42, BACK + 1.27); }
    // pilot seats (backs to camera)
    const seat = (sx) => { const s = new THREE.Group(); s.position.set(X + sx, 0, 0.2); root.add(s);
      at(s, cyl(0.12, 0.2, 0.5, P.darkMetal, 12), 0, 0.25, 0);
      at(s, box(0.85, 0.18, 0.8, 0x6f5a72, 0.08), 0, 0.6, 0);
      const back = at(s, box(0.85, 1.05, 0.2, 0x6f5a72, 0.08), 0, 1.2, 0.36); back.rotation.x = 0.12;
      at(s, box(0.5, 0.3, 0.16, 0x5a4763, 0.06), 0, 1.85, 0.42);
      for (const ax of [-0.47, 0.47]) at(s, box(0.08, 0.08, 0.6, P.darkMetal, 0.02), ax, 0.85, 0.05); };
    seat(-1.3); seat(1.3);
    // lucky gold dice hanging from the ceiling
    const dice = new THREE.Group(); dice.position.set(X + 1.8, 3.9, -1.6); root.add(dice);
    at(dice, cyl(0.006, 0.006, 0.7, 0x222222, 4), 0, -0.35, 0);
    for (const dx of [-0.06, 0.06]) at(dice, box(0.1, 0.1, 0.1, mat(0xc8a96a, { metalness: 0.8, roughness: 0.3 }), 0.015), dx, -0.75, 0).rotation.set(0.4, dx * 8, 0.3);
    register(dice, "deco-dice", "Lucky dice (every ship needs a pair)", null);
    updaters.push((t) => { dice.rotation.z = Math.sin(t * 1.3) * 0.08; });

    // comm console (Contact) — side terminal on the left
    const term = makeTerminal();
    const comm = new THREE.Group(); comm.position.set(X - 2.7, 0, 1.7); comm.rotation.y = Math.PI / 2 - 0.75; root.add(comm);
    at(comm, box(1.1, 1.1, 0.6, 0x2a3044, 0.05), 0, 0.55, 0);
    at(comm, box(1.2, 0.8, 0.08, P.ink, 0.03), 0, 1.55, -0.1).rotation.x = -0.15;
    const scr = at(comm, new THREE.Mesh(new THREE.PlaneGeometry(1.08, 0.68), glow(0xffffff, { map: term.tex })), 0, 1.555, -0.055); scr.rotation.x = -0.15;
    at(comm, box(0.8, 0.04, 0.3, P.mist, 0.02), 0, 1.12, 0.12);
    register(comm, "contact", "Comm console — Contact", { pos: [X - 0.8, 2.2, 4.2], target: [X - 2.9, 1.4, 1.5] });
    updaters.push((t) => term.update(t));

    // flight log datapad on the dash (Experience)
    const pad = new THREE.Group(); pad.position.set(X + 2.3, 1.15, BACK + 1.2); pad.rotation.set(0.25, -0.3, 0); pad.scale.setScalar(1.35); root.add(pad);
    at(pad, box(0.6, 0.04, 0.42, P.ink, 0.03), 0, 0, 0);
    const padScr = at(pad, new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.34), glow(0xffffff, { map: canvasTex(256, 168, (g, w, h) => { g.fillStyle = "#1e2540"; g.fillRect(0, 0, w, h); g.fillStyle = "#e3a9bd"; g.font = `bold 22px ${MONO}`; g.fillText("FLIGHT LOG", 14, 34); g.fillStyle = "#c9d6ee"; g.font = `15px ${MONO}`; ["WATBOT ........ 2026", "MICROART ...... 2024", "KUMON ......... 2023", "AQUATICS ...... 2023"].forEach((l, i) => g.fillText(l, 14, 70 + i * 24)); }) })), 0, 0.025, 0);
    padScr.rotation.x = -Math.PI / 2;
    register(pad, "experience", "Flight log — Experience", { pos: [X + 2.6, 2.6, 1.6], target: [X + 2.0, 1.1, BACK + 1.1] });

    // resume clipboard on the right bulkhead
    const clip = new THREE.Group(); clip.position.set(X + 4.1, 2.4, BACK + 0.08); clip.rotation.y = 0; root.add(clip);
    at(clip, box(0.8, 1.05, 0.04, P.mauve, 0.02), 0, 0, 0);
    at(clip, plane(0.68, 0.9, canvasTex(300, 400, (g, w, h) => { g.fillStyle = hex(P.cream); g.fillRect(0, 0, w, h); g.fillStyle = hex(P.navy); g.font = `700 34px ${SANS}`; g.fillText("RESUME", 28, 60); g.fillStyle = hex(P.rose); g.fillRect(28, 74, 60, 5); let y = 110; for (let s = 0; s < 4; s++) { g.fillStyle = hex(P.slate); g.fillRect(28, y, 100, 9); y += 22; g.fillStyle = hex(P.powder); for (let l = 0; l < 3; l++) { g.fillRect(28, y, 180 + Math.random() * 60, 6); y += 15; } y += 12; } })), 0, -0.04, 0.03);
    at(clip, box(0.3, 0.08, 0.05, P.metal, 0.02, steel), 0, 0.49, 0.04);
    register(clip, "resume", "Resume", { pos: [X + 3.6, 2.4, 1.6], target: [X + 4.1, 2.4, BACK] });

    updaters.push((t) => { if (Math.floor(t * 30) % 2 === 0) drawVP(t); buttons.forEach((b, i) => { b.material.emissiveIntensity = 0.3 + (Math.sin(t * 2 + i * 1.7) > 0.6 ? 1.2 : 0); }); });
  }

  // ════════════════ LOUNGE (x = 0) ════════════════
  let sd, droid, holoTable;
  {
    const X = 0;
    // curved sofa around the holo-table
    const TX = X + 0.7, TZ = -1.0;
    const sofaM = mat(0x9a6f86, { roughness: 0.85 });
    const seatRing = shadow(new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.38, 12, 48, Math.PI * 1.15), sofaM)); seatRing.rotation.x = Math.PI / 2; seatRing.rotation.z = Math.PI * 0.92; seatRing.scale.z = 0.55; at(root, seatRing, TX, 0.45, TZ);
    const backRing = shadow(new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.2, 10, 48, Math.PI * 1.15), mat(0x7f5a72, { roughness: 0.85 }))); backRing.rotation.x = Math.PI / 2; backRing.rotation.z = Math.PI * 0.92; backRing.scale.z = 2.6; at(root, backRing, TX, 0.85, TZ);
    for (let i = 0; i < 4; i++) { const a = Math.PI * (0.98 + i * 0.27); at(root, box(0.42, 0.32, 0.18, [P.rose, P.powder, P.butter, P.blush][i], 0.08), TX + Math.cos(a) * 1.95, 0.85, TZ - Math.sin(a) * 1.95).rotation.y = a + Math.PI / 2; }
    // holo-game table (original game: 4 holographic creatures)
    holoTable = new THREE.Group(); holoTable.position.set(TX, 0, TZ); root.add(holoTable);
    at(holoTable, cyl(0.25, 0.4, 0.62, P.darkMetal, 20), 0, 0.31, 0);
    at(holoTable, cyl(0.95, 0.95, 0.1, 0x2a3044, 40), 0, 0.67, 0);
    const boardTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#1a2038"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(159,208,240,.6)"; g.lineWidth = 2; for (let r = 30; r < 128; r += 30) { g.beginPath(); g.arc(128, 128, r, 0, 7); g.stroke(); } for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.cos(a) * 120, 128 + Math.sin(a) * 120); g.stroke(); } for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8 + 0.2; g.fillStyle = i % 2 ? "rgba(212,154,174,.5)" : "rgba(159,208,240,.4)"; g.beginPath(); g.arc(128 + Math.cos(a) * 75, 128 + Math.sin(a) * 75, 9, 0, 7); g.fill(); } });
    const board = at(holoTable, new THREE.Mesh(new THREE.CircleGeometry(0.88, 48), glow(0xffffff, { map: boardTex })), 0, 0.725, 0); board.rotation.x = -Math.PI / 2;
    const holoM = (c) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending });
    const pieces = [];
    const mk = (geo, c, a, s = 1) => { const m = at(holoTable, new THREE.Mesh(geo, holoM(c)), Math.cos(a) * 0.5, 0.95, Math.sin(a) * 0.5); m.scale.setScalar(s); pieces.push({ m, a, base: a }); return m; };
    mk(new THREE.OctahedronGeometry(0.13, 0), 0x9fd0f0, 0.3);                 // crystal golem
    mk(new THREE.TorusKnotGeometry(0.07, 0.025, 48, 6), 0xe3a9bd, 1.9);        // coil serpent
    mk(new THREE.ConeGeometry(0.09, 0.26, 5), 0x9fd0f0, 3.4);                  // spike beetle
    mk(new THREE.IcosahedronGeometry(0.1, 1), 0xe3a9bd, 4.8);                  // blob
    const beam = at(holoTable, new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.88, 0.5, 40, 1, true), new THREE.MeshBasicMaterial({ color: 0x9fd0f0, transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false })), 0, 0.98, 0);
    register(holoTable, "deco-holo", "Holo-game (house rule: let the droid win)", null);
    updaters.push((t, dt, s) => {
      const hot = s.hovered === holoTable;
      pieces.forEach((p, i) => { p.m.rotation.y += dt * (hot ? 3 : 1); p.m.position.y = 0.95 + Math.sin(t * 2 + i) * 0.03; p.m.material.opacity = 0.45 + Math.random() * 0.15 + (hot ? 0.2 : 0);
        const step = Math.floor(t / 3.5); const tgt = p.base + step * 0.8 * (i % 2 ? 1 : -1); p.a += (tgt - p.a) * 0.03; p.m.position.x = Math.cos(p.a) * 0.5; p.m.position.z = Math.sin(p.a) * 0.5; });
      beam.material.opacity = 0.05 + Math.sin(t * 7) * 0.01 + (hot ? 0.05 : 0);
    });

    // galley counter (right side): coffee, chips, water bottle
    const galley = new THREE.Group(); galley.position.set(X + 3.7, 0, -1.6); root.add(galley);
    at(galley, box(1.6, 1.05, 2.4, 0x5a6480, 0.04), 0, 0.52, 0);
    at(galley, box(1.7, 0.07, 2.5, 0x8a93ad, 0.02, steel), 0, 1.08, 0);
    for (let i = 0; i < 3; i++) at(galley, box(0.02, 0.28, 0.7, 0x707a96, 0.01), -0.81, 0.35 + i * 0.32 - 0.2, -0.6 + (i % 2) * 1.2);
    at(galley, box(0.9, 0.5, 0.06, 0x2a3044, 0.02), 0.2, 2.2, -1.2);
    const shelfItems = [[P.rose, 0.18], [P.powder, 0.22], [P.butter, 0.16]]; shelfItems.forEach(([c, h], i) => at(galley, cyl(0.07, 0.07, h, c, 12), -0.1 + i * 0.22, 2.0 + h / 2, -1.17));
    at(galley, box(1.0, 0.04, 0.3, 0x707a96, 0.01), 0.1, 1.98, -1.17);
    const coffee = new THREE.Group(); coffee.position.set(X + 3.4, 1.12, -1.2); root.add(coffee);
    at(coffee, cyl(0.1, 0.085, 0.22, P.rose), 0, 0.11, 0); at(coffee, new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.018, 8, 16), mat(P.rose)), 0.11, 0.12, 0); at(coffee, cyl(0.088, 0.088, 0.01, 0x5a4048, 20), 0, 0.205, 0);
    const steam = particles(14, [0.12, 0.1, 0.12], 0xffffff, 0.09, 0.35); at(coffee, steam, 0, 0.32, 0);
    register(coffee, "deco-coffee", "Coffee #3 today", null);
    const chips = new THREE.Group(); chips.position.set(X + 3.85, 1.12, -0.7); chips.rotation.y = 0.6; root.add(chips);
    at(chips, box(0.45, 0.11, 0.33, P.blue, 0.05, { roughness: 0.35, metalness: 0.3 }), 0, 0.06, 0); at(chips, box(0.08, 0.06, 0.34, 0x6f86b0, 0.02), -0.25, 0.06, 0); at(chips, box(0.2, 0.005, 0.18, P.rose, 0.01), 0.04, 0.12, 0);
    const chipM = mat(P.butter, { flatShading: true }); for (let i = 0; i < 6; i++) { const c = at(root, new THREE.Mesh(new THREE.IcosahedronGeometry(0.03, 0), chipM), X + 3.4 + Math.random() * 0.5, 1.125, -0.45 + Math.random() * 0.3); c.scale.y = 0.25; }
    register(chips, "deco-chips", "Fuel (chips)", null);
    const bottle = new THREE.Group(); bottle.position.set(X + 4.15, 1.12, -2.2); root.add(bottle);
    at(bottle, cyl(0.09, 0.09, 0.56, P.slate, 24, { metalness: 0.5, roughness: 0.35 }), 0, 0.28, 0); at(bottle, cyl(0.09, 0.09, 0.09, P.rose, 24), 0, 0.24, 0); at(bottle, cyl(0.065, 0.078, 0.07, P.ink, 20), 0, 0.6, 0);
    register(bottle, "deco-water", "Hydration check", null);
    updaters.push((t, dt) => { const a = steam.geometry.attributes.position; for (let i = 0; i < a.count; i++) { let y = a.getY(i) + dt * 0.12; if (y > 0.35) y = -0.05; a.setY(i, y); a.setX(i, Math.sin(t * 2 + i) * 0.03); } a.needsUpdate = true; });

    // guitar against the left bulkhead
    const guitar = new THREE.Group(); guitar.position.set(X - 4.45, 0, 0.9); guitar.rotation.set(0, Math.PI / 2 - 0.3, -0.16); root.add(guitar);
    const wood = mat(0xa97f86, { roughness: 0.45 });
    at(guitar, cyl(0.36, 0.36, 0.15, wood, 32), 0, 0.46, 0).rotation.x = Math.PI / 2;
    at(guitar, cyl(0.28, 0.28, 0.15, wood, 32), 0, 0.88, 0).rotation.x = Math.PI / 2;
    at(guitar, cyl(0.09, 0.09, 0.01, P.ink, 24), 0, 0.74, 0.08).rotation.x = Math.PI / 2;
    at(guitar, box(0.08, 0.85, 0.05, 0x5a4048, 0.01), 0, 1.5, 0.03); at(guitar, box(0.15, 0.24, 0.05, 0x5a4048, 0.02), 0, 2.02, 0.02);
    for (let i = 0; i < 6; i++) at(guitar, box(0.003, 1.6, 0.003, P.mist, 0), -0.03 + i * 0.012, 1.22, 0.085);
    register(guitar, "deco-guitar", "Off-hours: guitar", null);
    // dumbbell
    const db = new THREE.Group(); db.position.set(X - 2.6, 0.11, 1.8); db.rotation.y = 0.5; root.add(db);
    at(db, cyl(0.022, 0.022, 0.55, P.metal, 10, steel), 0, 0, 0).rotation.z = Math.PI / 2;
    for (const x of [-0.2, 0.2]) at(db, cyl(0.11, 0.11, 0.09, P.navy, 6), x, 0, 0).rotation.z = Math.PI / 2;
    register(db, "deco-gym", "Gym > skipping leg day", null);
    // retro travel poster (original planet)
    at(root, box(1.1, 1.5, 0.04, P.ink, 0.01), X - 2.6, 2.3, BACK + 0.06);
    at(root, plane(1.0, 1.4, canvasTex(300, 420, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#2a3158"); gr.addColorStop(1, "#c98ea3"); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = "#e9c9d4"; g.beginPath(); g.arc(150, 220, 80, 0, 7); g.fill(); g.strokeStyle = "rgba(240,230,240,.7)"; g.lineWidth = 6; g.beginPath(); g.ellipse(150, 220, 130, 26, -0.2, 0, 7); g.stroke(); g.fillStyle = "#f3eef5"; g.font = `700 30px ${SANS}`; g.textAlign = "center"; g.fillText("VISIT THE", 150, 60); g.font = `700 38px ${SANS}`; g.fillText("OUTER RIM", 150, 100); g.font = `16px ${MONO}`; g.fillText("ringed worlds · good food", 150, 380); })), X - 2.6, 2.3, BACK + 0.09);
    // ceiling plants (hanging)
    for (const [px, pz] of [[X - 1.2, 0.8], [X + 2.6, 1.2]]) { at(root, cyl(0.005, 0.005, 0.8, 0x222222, 4), px, 3.95, pz); at(root, cyl(0.18, 0.14, 0.22, P.rose, 16), px, 3.45, pz); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; at(root, wire([[px, 3.55, pz], [px + Math.cos(a) * 0.2, 3.3, pz + Math.sin(a) * 0.2], [px + Math.cos(a) * 0.3, 2.9 - Math.random() * 0.3, pz + Math.sin(a) * 0.3]], P.sage, 0.02)); } }

    // the scrappy suit frame, tucked in the back-left corner behind the poster
    const suit = new THREE.Group(); suit.position.set(X - 4.1, 0, -2.3); suit.rotation.y = 0.6; suit.scale.setScalar(0.72); root.add(suit);
    const fm = mat(0x6c7386, { metalness: 0.6, roughness: 0.5 });
    at(suit, cyl(0.4, 0.45, 0.06, P.ink, 24), 0, 0.03, 0); at(suit, cyl(0.035, 0.035, 2.1, fm, 10), 0, 1.08, 0); at(suit, cyl(0.03, 0.03, 0.9, fm, 8), 0, 2.4, -0.06);
    for (let i = 0; i < 4; i++) { const rib = at(suit, new THREE.Mesh(new THREE.TorusGeometry(0.26 - i * 0.02, 0.016, 6, 24, Math.PI * 1.25), fm), 0, 2.15 + i * 0.16, -0.02); rib.rotation.x = Math.PI / 2; rib.rotation.z = -Math.PI * 0.12; rib.scale.set(1.15, 0.8, 1); }
    at(suit, cyl(0.025, 0.025, 0.85, fm, 8), 0, 2.8, 0).rotation.z = Math.PI / 2;
    const plate = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.25, 0.42, 20, 1, true, -0.2, 1.4), mat(0x8a90a0, { side: THREE.DoubleSide }))); at(suit, plate, 0, 2.55, 0); plate.rotation.y = 0.6;
    at(suit, cyl(0.025, 0.025, 0.5, fm, 8), -0.47, 2.52, 0.02).rotation.z = 0.12; at(suit, wire([[0.4, 2.78, 0], [0.48, 2.5, 0.05], [0.42, 2.25, 0.02]], P.rose, 0.01));
    register(suit, "suit", "??? — 8% complete", null);

    // SD-01 roams the lounge floor
    sd = buildDroid("rover"); droid = sd.group; droid.scale.setScalar(1.25); droid.position.set(X - 1.6, 0, 1.4); root.add(droid);
    register(droid, "about", "SD-01, ship droid — say hi", { pos: [X - 0.6, 1.6, 4.6], target: [X - 1.2, 0.8, 1.4] });
  }

  // ════════════════ WORKBENCH (x = 10) ════════════════
  let trashBot, tiny, bb, saber, r2;
  {
    const X = 10, BY = 1.1, BZ = -2.2;
    at(root, box(8.6, 0.1, 1.4, 0x8394b3, 0.03, { metalness: 0.3, roughness: 0.5 }), X, BY - 0.05, BZ);
    for (const dx of [-4.1, 4.1]) at(root, box(0.12, BY - 0.1, 1.2, P.navy, 0.02), X + dx, (BY - 0.1) / 2, BZ);
    at(root, box(1.4, BY - 0.12, 1.25, 0xc4919f, 0.03), X + 2.8, (BY - 0.12) / 2, BZ);
    for (let i = 0; i < 3; i++) at(root, box(1.25, 0.24, 0.02, 0xd3a5b2, 0.02), X + 2.8, 0.22 + i * 0.3, BZ + 0.63);
    const lampBar = at(root, box(6, 0.06, 0.12, glow(0xffe2c8), 0.01), X, 3.2, BZ + 0.2);
    const benchLight = new THREE.SpotLight(0xffe2cc, 14, 5, 1.0, 0.6, 1.5); benchLight.position.set(X, 3.15, BZ + 0.4); benchLight.target.position.set(X, BY, BZ); root.add(benchLight, benchLight.target);

    // pegboard (Skills)
    const peg = new THREE.Group(); peg.position.set(X - 1.6, 2.3, BACK + 0.06); root.add(peg);
    at(peg, box(2.6, 1.5, 0.05, P.slate, 0.01), 0, 0, 0);
    at(peg, plane(2.52, 1.42, canvasTex(512, 280, (g, w, h) => { g.fillStyle = "#7f8fb0"; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(30,36,60,.55)"; for (let x = 16; x < w; x += 24) for (let y = 16; y < h; y += 24) { g.beginPath(); g.arc(x, y, 3.2, 0, 7); g.fill(); } })), 0, 0, 0.03);
    const wrench = new THREE.Group(); at(peg, wrench, -0.95, 0, 0.08); wrench.rotation.z = 0.15;
    at(wrench, box(0.07, 0.8, 0.03, P.metal, 0.01, steel)); at(wrench, new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.03, 8, 20, Math.PI * 1.5), mat(P.metal, steel)), 0, 0.44, 0).rotation.z = -Math.PI * 0.25;
    [[-0.55, P.rose], [-0.35, P.blue], [-0.15, P.butter]].forEach(([x, c]) => { at(peg, box(0.09, 0.3, 0.07, c, 0.035), x, 0.3, 0.09); at(peg, cyl(0.013, 0.013, 0.4, P.metal, 8, steel), x, -0.05, 0.09); });
    at(peg, box(0.045, 0.6, 0.03, P.berry, 0.02), 0.2, 0.05, 0.09).rotation.z = 0.12; at(peg, box(0.045, 0.6, 0.03, P.berry, 0.02), 0.29, 0.05, 0.09).rotation.z = -0.12;
    at(peg, cyl(0.17, 0.17, 0.1, P.slate, 24), 0.7, 0.35, 0.1).rotation.x = Math.PI / 2; at(peg, cyl(0.1, 0.1, 0.11, P.mist, 24), 0.7, 0.35, 0.1).rotation.x = Math.PI / 2;
    at(peg, box(0.28, 0.42, 0.07, P.butter, 0.035), 0.75, -0.35, 0.09); at(peg, box(0.2, 0.12, 0.02, P.navy, 0.01), 0.75, -0.25, 0.13);
    register(peg, "skills", "Tool wall — Skills", { pos: [X - 1.2, 2.4, 2.6], target: [X - 1.4, 2.2, BACK] });

    // R2 blueprint on the wall
    at(root, plane(1.8, 1.15, canvasTex(512, 330, (g, w, h) => { g.fillStyle = "#3d5687"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(255,255,255,.12)"; for (let x = 0; x < w; x += 20) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 20) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } g.strokeStyle = "#e6ebf7"; g.lineWidth = 3; g.beginPath(); g.moveTo(190, 280); g.lineTo(190, 150); g.arc(256, 150, 66, Math.PI, 0); g.lineTo(322, 280); g.stroke(); g.strokeRect(160, 170, 30, 110); g.strokeRect(322, 170, 30, 110); g.beginPath(); g.arc(256, 120, 12, 0, 7); g.stroke(); g.fillStyle = "#e6ebf7"; g.font = `600 22px ${SANS}`; g.fillText("R2 BUILD · REV A", 20, 34); g.font = `14px ${MONO}`; g.fillText("dome gears ???", 360, 300); })), X + 1.6, 2.35, BACK + 0.04);

    // trash collection robot on the bench
    trashBot = new THREE.Group(); trashBot.position.set(X - 3.0, BY, BZ + 0.1); trashBot.rotation.y = -0.3; trashBot.scale.setScalar(0.85); root.add(trashBot);
    at(trashBot, box(0.95, 0.22, 0.62, P.sage, 0.04), 0, 0.2, 0); at(trashBot, box(0.85, 0.05, 0.55, P.navy, 0.01), 0, 0.33, 0);
    for (const [x, z] of [[-0.32, 0.34], [0.32, 0.34], [-0.32, -0.34], [0.32, -0.34]]) { at(trashBot, cyl(0.12, 0.12, 0.08, P.ink, 20), x, 0.12, z).rotation.x = Math.PI / 2; at(trashBot, cyl(0.05, 0.05, 0.09, P.butter, 12), x, 0.12, z).rotation.x = Math.PI / 2; }
    for (const z of [-0.09, 0.09]) at(trashBot, cyl(0.045, 0.045, 0.07, P.metal, 16), 0.5, 0.24, z).rotation.z = Math.PI / 2;
    const armBase = at(trashBot, new THREE.Group(), 0.18, 0.36, -0.08); at(armBase, cyl(0.08, 0.1, 0.08, P.darkMetal), 0, 0.04, 0);
    const shoulder = at(armBase, new THREE.Group(), 0, 0.08, 0); at(shoulder, box(0.06, 0.42, 0.06, P.rose, 0.02), 0, 0.21, 0);
    const elbow = at(shoulder, new THREE.Group(), 0, 0.42, 0); at(elbow, sph(0.045, P.darkMetal)); at(elbow, box(0.36, 0.05, 0.05, P.rose, 0.02), 0.18, 0, 0);
    const claw = at(elbow, new THREE.Group(), 0.37, 0, 0); at(claw, box(0.04, 0.06, 0.12, P.darkMetal, 0.01));
    const fA = at(claw, box(0.1, 0.02, 0.02, P.metal, 0.005), 0.05, -0.02, 0.05), fB = at(claw, box(0.1, 0.02, 0.02, P.metal, 0.005), 0.05, -0.02, -0.05);
    register(trashBot, "trash-robot", "Trash Collection Robot", { pos: [X - 2.2, 2.0, 1.2], target: [X - 2.8, 1.3, BZ] });
    updaters.push((t, dt, s) => { const ab = s.hovered === trashBot ? 1 : 0.4; armBase.rotation.y = Math.sin(t * 0.7) * 0.5 * ab; shoulder.rotation.z = 0.35 + Math.sin(t * 0.9) * 0.25 * ab; elbow.rotation.z = -0.9 + Math.sin(t * 0.9 + 1) * 0.3 * ab; const g = (Math.sin(t * 1.8) + 1) * 0.5 * ab; fA.position.z = 0.03 + g * 0.03; fB.position.z = -0.03 - g * 0.03; });

    // lightsaber build in a vise (centre of the bench)
    saber = new THREE.Group(); saber.position.set(X - 0.6, BY, BZ + 0.15); root.add(saber);
    at(saber, box(0.5, 0.12, 0.3, P.darkMetal, 0.02, steel), 0, 0.06, 0);
    for (const dx of [-0.12, 0.12]) at(saber, box(0.08, 0.22, 0.26, P.slate, 0.02, steel), dx, 0.22, 0);
    const hilt = at(saber, new THREE.Group(), 0, 0.3, 0); hilt.rotation.z = Math.PI / 2;
    at(hilt, cyl(0.055, 0.055, 0.55, 0xb8c0d0, 24, { metalness: 0.85, roughness: 0.25 }), 0, 0, 0);
    for (const y of [-0.18, -0.1, 0.04]) at(hilt, cyl(0.06, 0.06, 0.035, P.ink, 24), 0, y, 0);
    at(hilt, cyl(0.065, 0.058, 0.08, 0x6c7386, 24, steel), 0, 0.3, 0);
    at(hilt, box(0.03, 0.08, 0.02, P.rose, 0.005), 0.055, 0.12, 0);
    const crystal = at(saber, new THREE.Mesh(new THREE.OctahedronGeometry(0.05, 0), glow(0x9fd0f0)), -0.45, 0.2, 0.05);
    crystal.scale.y = 1.8;
    const blade = at(hilt, new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 1.5, 16), glow(0xcfe6ff)), 0, 1.1, 0);
    const bladeGlow = at(hilt, new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 1.55, 16), new THREE.MeshBasicMaterial({ color: 0x7fb4ff, transparent: true, opacity: 0.25, depthWrite: false, blending: THREE.AdditiveBlending })), 0, 1.1, 0);
    const saberLight = new THREE.PointLight(0x8fbaff, 0, 3, 2); saberLight.position.set(X + 0.3, BY + 0.35, BZ + 0.4); root.add(saberLight);
    at(root, wire([[X - 0.85, BY + 0.3, BZ + 0.15], [X - 1.1, BY + 0.05, BZ + 0.4], [X - 1.4, BY + 0.01, BZ + 0.1]], P.rose, 0.01));
    register(saber, "deco-saber", "Lightsaber build (hover to ignite)", null);
    let ign = 0;
    updaters.push((t, dt, s) => { const want = s.hovered === saber ? 1 : 0; ign += (want - ign) * 0.12; blade.scale.y = Math.max(0.001, ign); blade.position.y = 0.3 + 0.75 * ign; bladeGlow.scale.y = blade.scale.y; bladeGlow.position.y = blade.position.y; blade.visible = bladeGlow.visible = ign > 0.02; bladeGlow.material.opacity = 0.22 + Math.random() * 0.06; saberLight.intensity = ign * (5 + Math.random()); crystal.rotation.y += dt * 1.5; });

    // TinyML board + oscilloscope
    tiny = new THREE.Group(); tiny.position.set(X + 1.2, BY, BZ + 0.15); tiny.rotation.y = 0.15; root.add(tiny);
    at(tiny, box(0.62, 0.03, 0.44, 0x3f6f8f, 0.01), 0, 0.015, 0); at(tiny, box(0.22, 0.05, 0.09, P.ink, 0.005), 0.05, 0.05, 0.02);
    for (let i = 0; i < 9; i++) at(tiny, box(0.02, 0.06, 0.02, P.ink, 0), -0.22 + i * 0.05, 0.06, -0.19);
    at(tiny, box(0.7, 0.045, 0.3, P.cream, 0.01), 0.05, 0.022, 0.42);
    const leds = []; for (let i = 0; i < 6; i++) { const c = [P.rose, P.butter, 0x9fd0f0][i % 3]; leds.push(at(tiny, sph(0.022, mat(c, { emissive: c, emissiveIntensity: 0.3 })), -0.22 + i * 0.09, 0.07, 0.42)); }
    at(tiny, wire([[-0.18, 0.05, -0.17], [-0.22, 0.17, 0.18], [-0.18, 0.06, 0.4]], 0xd06a7c, 0.009));
    const scope = at(tiny, new THREE.Group(), 0.85, 0, -0.15);
    at(scope, box(0.62, 0.42, 0.4, P.slate, 0.04), 0, 0.21, 0);
    const scopeTex = canvasTex(256, 160, () => {});
    const sScr = at(scope, new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.24), glow(0xffffff, { map: scopeTex })), -0.08, 0.24, 0.205);
    for (let i = 0; i < 4; i++) at(scope, cyl(0.025, 0.025, 0.02, P.rose, 12), 0.19, 0.32 - i * 0.07, 0.21).rotation.x = Math.PI / 2;
    register(tiny, "tinyml", "Neural net on an Arduino UNO", { pos: [X + 1.9, 2.0, 1.0], target: [X + 1.5, 1.25, BZ] });
    updaters.push((t, dt, s) => {
      leds.forEach((l, i) => { const v = (Math.sin(t * 5 - i * 0.8) + 1) / 2; l.material.emissiveIntensity = 0.15 + v * v * (s.hovered === tiny ? 4 : 2); });
      if (Math.floor(t * 20) % 2 === 0) { const { ctx: g, canvas } = scopeTex.userData; g.fillStyle = "#14202a"; g.fillRect(0, 0, canvas.width, canvas.height); g.strokeStyle = "rgba(159,208,240,.15)"; for (let x = 0; x < 256; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 160); g.stroke(); } g.strokeStyle = "#9fe0c8"; g.lineWidth = 2.5; g.beginPath(); for (let x = 0; x <= 256; x += 4) { const y = 80 + Math.sin(x * 0.06 + t * 6) * 30 * Math.sin(t * 0.7 + x * 0.01); x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); scopeTex.needsUpdate = true; }
    });

    // R2 build on a turntable (floor, front-left)
    r2 = new THREE.Group(); r2.position.set(X - 2.7, 0, 1.2); r2.rotation.y = 0.5; r2.scale.setScalar(0.9); root.add(r2);
    at(r2, cyl(0.55, 0.6, 0.06, P.slate, 32), 0, 0.03, 0);
    const frameM = mat(P.metal, steel), bodyG = at(r2, new THREE.Group(), 0, 0.28, 0);
    for (const y of [0, 0.62]) { const rr = at(bodyG, new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.018, 8, 40), frameM), 0, y, 0); rr.rotation.x = Math.PI / 2; }
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; at(bodyG, cyl(0.014, 0.014, 0.62, frameM, 6), Math.cos(a) * 0.3, 0.31, Math.sin(a) * 0.3); }
    for (const [st, len, c] of [[-0.2, 0.9, P.cream], [1.2, 0.5, P.cream], [2.6, 0.7, P.mist]]) at(bodyG, shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.305, 0.305, 0.58, 24, 1, true, st, len), mat(c, { side: THREE.DoubleSide }))), 0, 0.31, 0);
    for (const [a, y] of [[0.2, 0.42], [0.45, 0.2], [1.45, 0.35]]) { const b = at(bodyG, box(0.1, 0.12, 0.012, P.blue, 0.005), Math.sin(a) * 0.312, y, Math.cos(a) * 0.312); b.rotation.y = a; }
    const dome = shadow(new THREE.Mesh(new THREE.SphereGeometry(0.31, 32, 16, 0, Math.PI * 1.4, 0, Math.PI / 2), mat(0xb8c0d0, { metalness: 0.75, roughness: 0.3, side: THREE.DoubleSide }))); at(r2, dome, 0, 0.91, 0); dome.rotation.y = -0.6;
    at(r2, sph(0.05, P.ink), 0.12, 1.1, 0.24);
    const leg = () => { const g = new THREE.Group(); at(g, box(0.1, 0.8, 0.16, P.cream, 0.03), 0, 0.4, 0); at(g, box(0.18, 0.12, 0.3, P.slate, 0.03), 0, 0.06, 0.03); at(g, box(0.06, 0.4, 0.08, P.blue, 0.02), 0.051, 0.45, 0); return g; };
    at(r2, leg(), -0.38, 0.06, 0); at(r2, leg(), 0.75, 0, 0.25).rotation.z = -0.35;
    const r2sign = at(r2, plane(0.42, 0.26, signTex(["R2", "build in progress"], hex(P.blush), hex(P.navy))), 0, 0.2, 0.62); r2sign.material.side = THREE.DoubleSide; r2sign.rotation.x = -0.5;
    register(r2, "r2", "R2 build — in progress", { pos: [X - 1.8, 1.6, 4.4], target: [X - 2.5, 0.7, 1.2] });

    // Batmobile test box (floor, front-right)
    bb = new THREE.Group(); bb.position.set(X + 2.6, 0, 1.15); bb.rotation.y = -0.35; bb.scale.setScalar(0.85); root.add(bb);
    at(bb, box(2.2, 0.12, 1.6, P.navy, 0.02), 0, 0.06, 0); at(bb, box(2.08, 0.01, 1.48, mat(0xcdb98f, { roughness: 0.95 }), 0), 0, 0.125, 0);
    const caution = stripeTex(); caution.repeat.set(6, 1);
    for (const [w, x, z, ry] of [[2.2, 0, 0.81, 0], [2.2, 0, -0.81, Math.PI], [1.6, 1.11, 0, Math.PI / 2], [1.6, -1.11, 0, -Math.PI / 2]]) { const s = at(bb, new THREE.Mesh(new THREE.PlaneGeometry(w, 0.1), new THREE.MeshStandardMaterial({ map: caution })), x, 0.06, z); s.rotation.y = ry; }
    const glass = new THREE.MeshStandardMaterial({ color: 0xe3ecff, transparent: true, opacity: 0.14, roughness: 0.05, depthWrite: false });
    for (const [w, x, z, ry] of [[2.2, 0, 0.8, 0], [2.2, 0, -0.8, 0], [1.6, 1.1, 0, Math.PI / 2], [1.6, -1.1, 0, Math.PI / 2]]) { const p = at(bb, new THREE.Mesh(new THREE.PlaneGeometry(w, 0.9), glass), x, 0.57, z); p.rotation.y = ry; }
    for (const [x, z] of [[-1.1, -0.8], [1.1, -0.8], [-1.1, 0.8], [1.1, 0.8]]) at(bb, box(0.05, 0.95, 0.05, P.slate, 0.01), x, 0.57, z);
    const bot = at(bb, new THREE.Group(), 0.05, 0.12, -0.05); bot.rotation.y = 0.85;
    const blk = mat(0x23273a, { roughness: 0.6 });
    at(bot, box(0.42, 0.17, 0.46, blk, 0.02), -0.33, 0.12, 0); at(bot, box(0.42, 0.17, 0.46, blk, 0.02), 0.33, 0.12, 0);
    for (const x of [-0.5, -0.16, 0.16, 0.5]) { const fs = new THREE.Shape(); fs.moveTo(0, 0); fs.lineTo(0.34, 0); fs.lineTo(0, 0.12); fs.lineTo(0, 0); const f = shadow(new THREE.Mesh(new THREE.ExtrudeGeometry(fs, { depth: 0.05, bevelEnabled: false }), blk)); at(bot, f, x - 0.025, 0.04, 0.23); f.rotation.y = -Math.PI / 2; }
    for (const x of [-0.6, 0.6]) at(bot, cyl(0.13, 0.13, 0.1, P.cream, 24), x, 0.13, -0.05).rotation.z = Math.PI / 2;
    const spinner = at(bot, new THREE.Group(), 0, 0.2, 0.12);
    const ws = new THREE.Shape(); for (let i = 0; i <= 64; i++) { const a = (i / 64) * Math.PI * 2, ph = a % Math.PI, r = 0.11 + 0.1 * Math.max(0, 1 - ph / 1.1); const p = [Math.cos(a) * r, Math.sin(a) * r]; i ? ws.lineTo(...p) : ws.moveTo(...p); }
    const wGeo = new THREE.ExtrudeGeometry(ws, { depth: 0.035, bevelEnabled: false }); wGeo.center();
    const weapon = shadow(new THREE.Mesh(wGeo, mat(0x2d3042, { metalness: 0.5, roughness: 0.4 }))); weapon.rotation.y = Math.PI / 2; spinner.add(weapon);
    const sign = at(bb, plane(0.6, 0.37, signTex(["4TH", "WATBOTS 2026"])), -0.75, 0.75, 0.82); sign.material.side = THREE.DoubleSide;
    register(bb, "combat", "Batmobile — Combat Robotics", { pos: [X + 2.0, 1.9, 4.4], target: [X + 2.6, 0.6, 1.15] });
    updaters.push((t, dt, s) => { spinner.rotation.x -= dt * (s.hovered === bb || s.focused === bb ? 28 : 1.5); });
  }

  // ════════════════ TERRARIUM (x = 20) ════════════════
  let tank, critter;
  {
    const X = 20;
    const grow = new THREE.PointLight(0xe0a0d0, 10, 7, 2); grow.position.set(X - 0.6, 3.1, -1.6); root.add(grow);
    tank = new THREE.Group(); tank.position.set(X - 0.6, 0, -1.7); root.add(tank);
    at(tank, box(3.4, 0.7, 1.7, 0x3a4259, 0.04), 0, 0.35, 0);
    at(tank, box(3.3, 0.25, 1.6, mat(0x5a4a52, { roughness: 1 }), 0.02), 0, 0.82, 0);
    const glassM = new THREE.MeshPhysicalMaterial({ color: 0xdfeaff, transparent: true, opacity: 0.16, roughness: 0.05, metalness: 0, depthWrite: false, side: THREE.DoubleSide });
    at(tank, new THREE.Mesh(new THREE.BoxGeometry(3.3, 1.7, 1.6), glassM), 0, 1.55, 0);
    for (const [x, z] of [[-1.65, -0.8], [1.65, -0.8], [-1.65, 0.8], [1.65, 0.8]]) at(tank, box(0.06, 1.75, 0.06, C.trim, 0.01, steel), x, 1.55, z);
    at(tank, box(3.4, 0.08, 1.7, C.rib, 0.02), 0, 2.42, 0);
    at(tank, box(3.0, 0.06, 0.16, glow(0xe8b3d8), 0.02), 0, 2.38, 0);
    // glowing alien plants
    const bulbs = [];
    for (let i = 0; i < 9; i++) {
      const px = -1.3 + i * 0.32 + (Math.random() - 0.5) * 0.1, pz = (Math.random() - 0.5) * 1.0, h = 0.4 + Math.random() * 0.8;
      at(tank, wire([[px, 0.95, pz], [px + (Math.random() - 0.5) * 0.2, 0.95 + h * 0.5, pz], [px + (Math.random() - 0.5) * 0.3, 0.95 + h, pz + (Math.random() - 0.5) * 0.2]], i % 2 ? P.sage : 0x7f9a8c, 0.025));
      const c = i % 3 === 0 ? 0x9fd0f0 : 0xe3a9bd;
      bulbs.push(at(tank, sph(0.07 + Math.random() * 0.04, mat(c, { emissive: c, emissiveIntensity: 1.2 })), px, 0.95 + h, pz));
    }
    for (let i = 0; i < 5; i++) at(tank, new THREE.Mesh(new THREE.DodecahedronGeometry(0.1 + Math.random() * 0.12, 0), mat(0x6c6478, { flatShading: true })), -1.4 + Math.random() * 2.8, 0.98, (Math.random() - 0.5) * 1.2);
    const mist = particles(60, [3, 1.2, 1.4], 0xf3dce9, 0.08, 0.35); at(tank, mist, 0, 1.6, 0);
    // the critter (original): round fuzzy body, big eyes, antennae
    critter = at(tank, new THREE.Group(), 0.3, 0.95, 0.15);
    const bodyM = mat(0xc9a7d9, { roughness: 0.95 });
    const cb = at(critter, new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 3), bodyM), 0, 0.22, 0); cb.scale.y = 0.85; cb.castShadow = true;
    const eyes = [];
    for (const z of [-0.08, 0.08]) { const e = at(critter, sph(0.07, mat(0xf4f1f6)), 0.17, 0.28, z); const p = at(e, sph(0.035, mat(P.ink)), 0.045, 0, 0); eyes.push(e); void p; }
    for (const z of [-0.06, 0.06]) { at(critter, wire([[0, 0.38, z], [0.04, 0.5, z * 1.8], [0.02, 0.58, z * 2.4]], 0x8a6aa0, 0.008)); at(critter, sph(0.025, glow(0x9fd0f0)), 0.02, 0.59, z * 2.4); }
    for (const [x, z] of [[0.08, -0.12], [0.08, 0.12], [-0.1, -0.1], [-0.1, 0.1]]) at(critter, sph(0.045, mat(0xa98ac0)), x, 0.03, z);
    critter.rotation.y = -Math.PI / 2 + 0.4;
    register(tank, "bio", "Terrarium — where I'm headed: bio-robotics", { pos: [X + 0.6, 2.2, 3.2], target: [X - 0.2, 1.5, -1.7] });
    // specimen shelf on the right
    const jars = new THREE.Group(); jars.position.set(X + 3.4, 0, -2.4); root.add(jars);
    for (const y of [1.0, 1.8, 2.6]) at(jars, box(1.3, 0.06, 0.55, 0x707a96, 0.01, steel), 0, y, 0);
    const jarList = [];
    [[1.0, 0x9bb5a8], [1.0, P.rose], [1.0, 0x9fd0f0], [1.8, P.butter], [1.8, 0xc9a7d9], [2.6, 0x9fd0f0], [2.6, P.rose]].forEach(([y, c], i) => {
      const xx = -0.4 + (i % 3) * 0.4;
      at(jars, new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.42, 20), new THREE.MeshStandardMaterial({ color: 0xe8eef8, transparent: true, opacity: 0.22, roughness: 0.05, depthWrite: false })), xx, y + 0.24, 0);
      jarList.push(at(jars, cyl(0.12, 0.12, 0.3, mat(c, { emissive: c, emissiveIntensity: 0.4, transparent: true, opacity: 0.8 }), 20), xx, y + 0.2, 0));
      at(jars, cyl(0.15, 0.15, 0.05, P.slate, 20), xx, y + 0.47, 0);
    });
    register(jars, "deco-jars", "Specimen jars (labels pending)", null);
    // datapad on the wall with the bio note
    const note = at(root, new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.9), glow(0xffffff, { map: canvasTex(400, 240, (g, w, h) => { g.fillStyle = "#1e2540"; g.fillRect(0, 0, w, h); g.fillStyle = "#e3a9bd"; g.font = `bold 26px ${MONO}`; g.fillText("BIO-ROBOTICS", 22, 46); g.fillStyle = "#c9d6ee"; g.font = `18px ${MONO}`; ["status ..... next", "bridge ..... nanotech", "specimen #1 friendly", "projects ... soon"].forEach((l, i) => g.fillText(l, 22, 96 + i * 32)); }) })), X - 2.3, 3.0, BACK + 0.05);
    void note;
    let hopT = 0;
    updaters.push((t, dt, s) => {
      bulbs.forEach((b, i) => { b.material.emissiveIntensity = 0.8 + Math.sin(t * 1.5 + i) * 0.4 + (s.hovered === tank ? 0.8 : 0); });
      jarList.forEach((j, i) => { j.material.emissiveIntensity = 0.3 + Math.sin(t + i * 1.3) * 0.15; });
      const ma = mist.geometry.attributes.position; for (let i = 0; i < ma.count; i++) { let x = ma.getX(i) + dt * 0.05; if (x > 1.5) x = -1.5; ma.setX(i, x); } ma.needsUpdate = true;
      hopT -= dt; if (hopT < 0) hopT = 3 + Math.random() * 3;
      const hop = hopT > 2.6 ? Math.sin((3 - hopT) / 0.4 * Math.PI) : 0;
      critter.position.y = 0.95 + Math.max(0, hop) * 0.18; critter.position.x = 0.3 + Math.sin(t * 0.3) * 0.6;
      critter.rotation.y = -Math.PI / 2 + 0.4 + Math.sin(t * 0.3 + 1.2) * 0.8;
      const blink = Math.sin(t * 1.7) > 0.97 ? 0.15 : 1; eyes.forEach(e => (e.scale.y = blink));
    });
  }

  // ── room camera poses ──
  const rooms = ROOMS.map((r, i) => ({ ...r, index: i, home: { pos: new THREE.Vector3(r.x, 2.45, 8.4), target: new THREE.Vector3(r.x, 1.7, -0.6) } }));

  let dir = 1, pause = 0;
  return {
    rooms,
    droid: sd,
    roomOf(id) { const map = { contact: 0, experience: 0, resume: 0, "deco-dice": 0, about: 1, suit: 1, skills: 2, "trash-robot": 2, tinyml: 2, r2: 2, combat: 2, "deco-saber": 2, bio: 3, "deco-jars": 3 }; return map[id] ?? -1; },
    update(t, dt, s) {
      const hov = s.hovered === droid, foc = s.focused === droid;
      if (!hov && !foc) { if (pause > 0) pause -= dt; else { droid.position.x += dir * dt * 0.3; if (droid.position.x > -0.6) { dir = -1; pause = 1.5 + Math.random() * 2; } if (droid.position.x < -2.6) { dir = 1; pause = 1.5 + Math.random() * 2; } } }
      const moving = pause <= 0 && !hov && !foc;
      const want = hov || foc ? -Math.PI / 2 + 0.2 : moving ? (dir > 0 ? 0 : -Math.PI) : -Math.PI / 2 + 0.35;
      droid.rotation.y += (want - droid.rotation.y) * 0.08;
      sd.update(t, dt, { lookAt: s.lookPoint, happy: hov, moving });
      updaters.forEach(u => u(t, dt, s));
    }
  };
}

function makeTerminal() {
  const tex = canvasTex(512, 320, () => {});
  const lines = ["$ whoami", "sughosh desai", "$ ./comm --open", "channel ready.", "click to contact"];
  let shown = 0, chars = 0, idle = 0, last = 0;
  function draw(t) {
    const { ctx: g, canvas } = tex.userData, w = canvas.width, h = canvas.height;
    g.fillStyle = "#1e2540"; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(159,178,209,0.06)"; for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 2);
    g.font = `26px ${MONO}`;
    for (let i = 0; i <= shown && i < lines.length; i++) { const txt = i < shown ? lines[i] : lines[i].slice(0, chars); g.fillStyle = lines[i].startsWith("$") ? "#e3a9bd" : "#c9d6ee"; g.fillText(txt, 28, 54 + i * 46); }
    if (Math.floor(t * 2) % 2 === 0) { const i = Math.min(shown, lines.length - 1); const txt = shown < lines.length ? lines[i].slice(0, chars) : lines[i]; g.fillStyle = "#e3a9bd"; g.fillRect(28 + g.measureText(txt).width + 4, 32 + i * 46, 14, 28); }
    tex.needsUpdate = true;
  }
  return { tex, update(t) { if (t - last < 0.06) return; last = t; if (shown < lines.length) { chars++; if (chars > lines[shown].length) { shown++; chars = 0; } } else if (++idle > 120) { shown = 0; chars = 0; idle = 0; } draw(t); } };
}
