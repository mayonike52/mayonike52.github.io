// LEVEL 1 · 1 m — the workshop (robots + the messy desk)
import { THREE, P, hex, mat, shadow, box, cyl, sph, at, canvasTex, plane, wire, glow, MONO, SANS, signTex, stripeTex, particles, dotTex, buildDroid } from "./lib.js";

export function buildWorkshop({ root, register }) {
  const C = {
    wall: 0xd3dbea, wainscot: 0x8ea3c6, trim: 0xe6e9f2, floor: 0xa99ba3, plank: 0x968792,
    desk: 0x8394b3, leg: P.navy, chest: 0xc4919f, rug: 0xc8a2b4
  };

  // lights
  root.add(new THREE.HemisphereLight(0xe3e9f7, 0xb7a3ad, 1.15));
  const key = new THREE.DirectionalLight(0xfff1ea, 1.4);
  key.position.set(-5, 9, 7); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -9, right: 9, top: 8, bottom: -3, near: 1, far: 30 });
  key.shadow.bias = -0.0006; key.shadow.normalBias = 0.02; root.add(key);
  const winLight = new THREE.PointLight(0xa9b8ff, 5, 9, 2); winLight.position.set(2.6, 3.8, -2.2); root.add(winLight);

  // room
  const W = 14, D = 10, H = 8, BACK = -3;
  const floor = shadow(new THREE.Mesh(new THREE.PlaneGeometry(W, D), mat(C.floor, { roughness: 0.85 })), false, true);
  floor.rotation.x = -Math.PI / 2; floor.position.z = BACK + D / 2; root.add(floor);
  for (let i = -6; i <= 6; i++) { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.015, D), mat(C.plank)); l.rotation.x = -Math.PI / 2; l.position.set(i * 1.05, 0.002, BACK + D / 2); root.add(l); }
  const backWall = shadow(new THREE.Mesh(new THREE.PlaneGeometry(W, H), mat(C.wall)), false, true); backWall.position.set(0, H / 2, BACK); root.add(backWall);
  for (const s of [-1, 1]) {
    const side = shadow(new THREE.Mesh(new THREE.PlaneGeometry(D, H), mat(0xc9d1e2)), false, true);
    side.position.set(s * W / 2, H / 2, BACK + D / 2); side.rotation.y = -s * Math.PI / 2; root.add(side);
    at(root, box(0.08, 1.6, D, C.wainscot, 0), s * (W / 2 - 0.04), 0.8, BACK + D / 2);
  }
  at(root, box(W, 1.6, 0.08, C.wainscot, 0), 0, 0.8, BACK + 0.04);
  at(root, box(W, 0.08, 0.14, C.trim, 0.02), 0, 1.62, BACK + 0.07);
  at(root, box(W, 0.16, 0.12, C.trim, 0.02), 0, 0.08, BACK + 0.1);
  const rug = shadow(new THREE.Mesh(new THREE.CircleGeometry(2.2, 48), mat(C.rug, { roughness: 1 })), false, true);
  rug.rotation.x = -Math.PI / 2; rug.scale.set(1.5, 0.6, 1); rug.position.set(-0.6, 0.01, -0.2); root.add(rug);

  // desk (blue-grey workbench) + pink tool chest
  const DESK_Y = 1.5, DZ = -1.85;
  at(root, box(7.8, 0.12, 1.75, C.desk, 0.03, { metalness: 0.25, roughness: 0.55 }), -0.4, DESK_Y - 0.06, DZ);
  for (const [x, z] of [[-4.15, -2.6], [3.35, -2.6], [-4.15, -1.1], [3.35, -1.1]]) at(root, box(0.1, DESK_Y - 0.12, 0.1, C.leg, 0.02), x, (DESK_Y - 0.12) / 2, z);
  at(root, box(7.6, 0.06, 0.06, C.leg, 0.01), -0.4, 0.35, -2.6);
  at(root, box(1.2, 1.1, 1.5, C.chest, 0.03), 2.6, 0.62, DZ);
  for (let i = 0; i < 3; i++) { at(root, box(1.05, 0.28, 0.02, 0xd3a5b2, 0.02), 2.6, 0.3 + i * 0.34, DZ + 0.76); at(root, box(0.3, 0.04, 0.04, P.metal, 0.01), 2.6, 0.36 + i * 0.34, DZ + 0.79); }

  // ── monitor / comm terminal (Contact) ──
  const term = makeTerminal();
  const monitor = new THREE.Group(); monitor.position.set(-3.05, DESK_Y, -2.2); monitor.rotation.y = 0.28; root.add(monitor);
  at(monitor, box(0.5, 0.04, 0.36, P.navy, 0.02), 0, 0.02, 0);
  at(monitor, cyl(0.04, 0.04, 0.5, P.navy), 0, 0.27, -0.05);
  at(monitor, box(1.5, 0.98, 0.09, P.ink, 0.04), 0, 0.92, 0);
  at(monitor, new THREE.Mesh(new THREE.PlaneGeometry(1.38, 0.86), glow(0xffffff, { map: term.tex })), 0, 0.92, 0.047);
  at(monitor, box(1.0, 0.04, 0.32, P.mist, 0.02), 0.25, 0.02, 0.55);
  // sticky notes on the monitor bezel
  at(monitor, box(0.14, 0.14, 0.005, P.rose, 0), 0.62, 1.3, 0.05).rotation.z = 0.1;
  at(monitor, box(0.14, 0.14, 0.005, P.powder, 0), -0.6, 0.5, 0.05).rotation.z = -0.12;
  register(monitor, "contact", "Comm terminal — Contact", { pos: [-1.5, 2.6, 1.6], target: [-2.3, 2.3, -2.2] });

  // ── messy desk: coffee, chips, water bottle ──
  const coffee = new THREE.Group(); coffee.position.set(-2.25, DESK_Y, -1.2); root.add(coffee);
  at(coffee, cyl(0.11, 0.095, 0.24, P.rose), 0, 0.12, 0);
  at(coffee, new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.02, 8, 16), mat(P.rose)), 0.12, 0.13, 0).rotation.y = 0;
  at(coffee, cyl(0.098, 0.098, 0.01, 0x5a4048, 20), 0, 0.225, 0);
  const steam = particles(14, [0.12, 0.1, 0.12], 0xffffff, 0.09, 0.35); at(coffee, steam, 0, 0.35, 0);
  at(root, cyl(0.12, 0.12, 0.012, 0x6f5a66, 20), -2.25, DESK_Y + 0.006, -1.2); // ring stain/coaster
  register(coffee, "deco-coffee", "Coffee #3 today", null);

  const chips = new THREE.Group(); chips.position.set(-0.75, DESK_Y, -2.35); chips.rotation.set(0, 0.5, 0); root.add(chips);
  const bag = at(chips, box(0.5, 0.12, 0.36, P.blue, 0.06, { roughness: 0.35, metalness: 0.3 }), 0, 0.07, 0); bag.rotation.z = 0.08;
  at(chips, box(0.08, 0.06, 0.37, 0x6f86b0, 0.02), -0.27, 0.07, 0);
  at(chips, box(0.22, 0.005, 0.2, P.rose, 0.01), 0.04, 0.135, 0);
  const chipM = mat(P.butter, { flatShading: true, roughness: 0.6 });
  for (let i = 0; i < 7; i++) { const c = at(root, new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 0), chipM), -0.4 + Math.random() * 0.4, DESK_Y + 0.012, -2.1 + Math.random() * 0.3); c.scale.y = 0.25; c.rotation.y = Math.random() * 6; c.castShadow = true; }
  register(chips, "deco-chips", "Fuel (chips)", null);

  const bottle = new THREE.Group(); bottle.position.set(1.0, DESK_Y, -2.4); root.add(bottle);
  at(bottle, cyl(0.1, 0.1, 0.62, P.slate, 24, { metalness: 0.5, roughness: 0.35 }), 0, 0.31, 0);
  at(bottle, cyl(0.1, 0.1, 0.1, P.rose, 24), 0, 0.27, 0);
  at(bottle, cyl(0.07, 0.085, 0.08, P.ink, 20), 0, 0.66, 0);
  at(bottle, new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 6, 16), mat(P.ink)), 0, 0.73, 0).rotation.y = Math.PI / 2;
  register(bottle, "deco-water", "Hydration check", null);

  // ── trash collection robot (project) ──
  const trashBot = new THREE.Group(); trashBot.position.set(0.15, DESK_Y, -1.95); trashBot.rotation.y = -0.35; root.add(trashBot);
  at(trashBot, box(0.95, 0.22, 0.62, P.sage, 0.04), 0, 0.2, 0);
  at(trashBot, box(0.85, 0.05, 0.55, P.navy, 0.01), 0, 0.33, 0);
  for (const [x, z] of [[-0.32, 0.34], [0.32, 0.34], [-0.32, -0.34], [0.32, -0.34]]) { at(trashBot, cyl(0.12, 0.12, 0.08, P.ink, 20), x, 0.12, z).rotation.x = Math.PI / 2; at(trashBot, cyl(0.05, 0.05, 0.09, P.butter, 12), x, 0.12, z).rotation.x = Math.PI / 2; }
  for (const z of [-0.09, 0.09]) at(trashBot, cyl(0.045, 0.045, 0.07, P.metal, 16), 0.5, 0.24, z).rotation.z = Math.PI / 2;
  at(trashBot, box(0.04, 0.09, 0.3, P.blue, 0.01), 0.47, 0.24, 0);
  const tbLed = at(trashBot, sph(0.02, glow(P.rose)), -0.05, 0.4, 0.15);
  const armBase = at(trashBot, new THREE.Group(), 0.18, 0.36, -0.08);
  at(armBase, cyl(0.08, 0.1, 0.08, P.darkMetal), 0, 0.04, 0);
  const shoulder = at(armBase, new THREE.Group(), 0, 0.08, 0);
  at(shoulder, box(0.06, 0.42, 0.06, P.rose, 0.02), 0, 0.21, 0);
  const elbow = at(shoulder, new THREE.Group(), 0, 0.42, 0);
  at(elbow, sph(0.045, P.darkMetal), 0, 0, 0);
  at(elbow, box(0.36, 0.05, 0.05, P.rose, 0.02), 0.18, 0, 0);
  const claw = at(elbow, new THREE.Group(), 0.37, 0, 0);
  at(claw, box(0.04, 0.06, 0.12, P.darkMetal, 0.01), 0, 0, 0);
  const fA = at(claw, box(0.1, 0.02, 0.02, P.metal, 0.005), 0.05, -0.02, 0.05);
  const fB = at(claw, box(0.1, 0.02, 0.02, P.metal, 0.005), 0.05, -0.02, -0.05);
  at(root, new THREE.Mesh(new THREE.IcosahedronGeometry(0.09, 0), mat(P.cream, { flatShading: true })), 0.95, DESK_Y + 0.09, -1.55).castShadow = true;
  register(trashBot, "trash-robot", "Trash Collection Robot", { pos: [1.2, 2.6, 1.3], target: [0.75, 1.75, -1.95] });

  // ── arduino on the desk = PORTAL to the circuit level ──
  const board = new THREE.Group(); board.position.set(1.6, DESK_Y, -1.55); board.rotation.y = 0.2; root.add(board);
  at(board, box(0.7, 0.03, 0.5, 0x3f6f8f, 0.01), 0, 0.015, 0);
  at(board, box(0.24, 0.05, 0.1, P.ink, 0.005), 0.05, 0.05, 0.02);
  at(board, box(0.14, 0.09, 0.12, P.metal, 0.005), -0.3, 0.06, 0.15);
  for (let i = 0; i < 10; i++) at(board, box(0.02, 0.06, 0.02, P.ink, 0), -0.25 + i * 0.05, 0.06, -0.22);
  const boardLeds = [P.rose, P.butter, P.blue].map((c, i) => at(board, sph(0.022, mat(c, { emissive: c, emissiveIntensity: 0.5 })), 0.2 + i * 0.06, 0.05, 0.18));
  const ring = at(board, new THREE.Mesh(new THREE.RingGeometry(0.42, 0.46, 48), glow(P.rose, { transparent: true, opacity: 0.6, side: THREE.DoubleSide })), 0, 0.04, 0); ring.rotation.x = -Math.PI / 2;
  register(board, "dive", "Zoom into the circuit ↓", null);

  // ── lamp ──
  const lamp = new THREE.Group(); lamp.position.set(2.95, DESK_Y, -2.35); root.add(lamp);
  at(lamp, cyl(0.2, 0.22, 0.05, P.navy), 0, 0.025, 0);
  at(lamp, box(0.04, 0.9, 0.04, P.rose, 0.015), -0.12, 0.45, 0.1).rotation.z = 0.3;
  const la2 = at(lamp, box(0.04, 0.7, 0.04, P.rose, 0.015), -0.15, 1.0, 0.25); la2.rotation.z = -0.9; la2.rotation.x = 0.4;
  const shade = at(lamp, cyl(0.07, 0.22, 0.26, P.navy, 24, { side: THREE.DoubleSide }), -0.45, 1.15, 0.4); shade.rotation.z = 0.7; shade.rotation.x = 0.3;
  at(lamp, sph(0.06, glow(0xfff0e6)), -0.5, 1.07, 0.43);
  const lampLight = new THREE.SpotLight(0xffe6dc, 16, 5, 0.75, 0.6, 1.6);
  lampLight.position.set(2.45, DESK_Y + 1.07, -1.92); lampLight.target.position.set(1.4, DESK_Y, -1.5);
  lampLight.castShadow = true; lampLight.shadow.mapSize.set(1024, 1024); root.add(lampLight, lampLight.target);
  // soldering iron + parts tray
  at(root, box(0.4, 0.05, 0.25, P.navy, 0.02), -1.55, DESK_Y + 0.025, -2.55);
  at(root, cyl(0.022, 0.01, 0.45, P.mist), -1.55, DESK_Y + 0.17, -2.55).rotation.z = 1.1;
  at(root, wire([[-1.7, DESK_Y + 0.08, -2.55], [-1.85, DESK_Y + 0.02, -2.3], [-2.05, DESK_Y + 0.01, -2.6]], P.ink, 0.012));
  at(root, box(0.5, 0.05, 0.3, P.slate, 0.02), 1.75, DESK_Y + 0.025, -2.45 + 0.0001);
  for (let i = 0; i < 8; i++) at(root, cyl(0.025, 0.025, 0.05, [P.butter, P.rose, P.blue][i % 3], 10), 1.57 + (i % 4) * 0.12, DESK_Y + 0.07, -2.52 + Math.floor(i / 4) * 0.14);

  // ── logbook stack (Experience) ──
  const logTex = canvasTex(512, 320, (g, w, h) => {
    g.fillStyle = hex(P.cream); g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(0,0,0,.08)"; g.fillRect(w / 2 - 3, 0, 6, h);
    g.strokeStyle = hex(P.powder); g.lineWidth = 2;
    for (let y = 70; y < h; y += 26) { g.beginPath(); g.moveTo(18, y); g.lineTo(w / 2 - 14, y); g.moveTo(w / 2 + 14, y); g.lineTo(w - 18, y); g.stroke(); }
    g.fillStyle = hex(P.navy); g.font = `700 30px ${SANS}`; g.fillText("LOGBOOK", 30, 48);
    g.fillStyle = hex(P.berry); g.font = `20px ${MONO}`; g.fillText("2023 → now", w / 2 + 30, 46);
    g.fillStyle = hex(P.slate);
    [[30, 92, 150], [30, 118, 190], [30, 170, 120], [30, 196, 170], [w / 2 + 30, 92, 160], [w / 2 + 30, 144, 140], [w / 2 + 30, 170, 185], [w / 2 + 30, 222, 110]].forEach(([x, y, l]) => g.fillRect(x, y - 10, l, 6));
  });
  const logbook = new THREE.Group(); logbook.position.set(2.45, DESK_Y, -1.42); logbook.rotation.y = -0.35; root.add(logbook);
  at(logbook, box(0.62, 0.07, 0.46, P.slate, 0.015), 0, 0.035, 0);
  at(logbook, box(0.58, 0.06, 0.42, P.berry, 0.015), 0.02, 0.1, -0.01).rotation.y = 0.12;
  at(logbook, box(0.7, 0.03, 0.48, P.navy, 0.01), 0, 0.145, 0);
  const pages = at(logbook, plane(0.66, 0.44, logTex), 0, 0.162, 0); pages.rotation.x = -Math.PI / 2;
  at(logbook, cyl(0.012, 0.012, 0.42, P.butter, 6), 0.08, 0.175, 0.05).rotation.set(0, 0.5, Math.PI / 2);
  register(logbook, "experience", "Logbook — Experience", { pos: [2.6, 2.75, 0.9], target: [3.05, 1.6, -1.42] });

  // ── wall: pegboard (Skills) ──
  const peg = new THREE.Group(); peg.position.set(-3.7, 3.4, BACK + 0.04); root.add(peg);
  at(peg, box(2.5, 1.8, 0.05, P.slate, 0.01), 0, 0, 0);
  at(peg, plane(2.42, 1.72, canvasTex(512, 384, (g, w, h) => { g.fillStyle = "#9fb2d1"; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(40,50,80,.5)"; for (let x = 16; x < w; x += 24) for (let y = 16; y < h; y += 24) { g.beginPath(); g.arc(x, y, 3.2, 0, 7); g.fill(); } })), 0, 0, 0.03);
  const steel = { metalness: 0.7, roughness: 0.35 };
  const wrench = new THREE.Group(); at(peg, wrench, -0.85, 0.05, 0.08); wrench.rotation.z = 0.15;
  at(wrench, box(0.08, 0.9, 0.03, P.metal, 0.01, steel), 0, 0, 0);
  at(wrench, new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.035, 8, 20, Math.PI * 1.5), mat(P.metal, steel)), 0, 0.5, 0).rotation.z = -Math.PI * 0.25;
  [[-0.45, P.rose], [-0.25, P.blue], [-0.05, P.butter]].forEach(([x, c]) => { at(peg, box(0.1, 0.36, 0.08, c, 0.04), x, 0.35, 0.09); at(peg, cyl(0.015, 0.015, 0.45, P.metal, 8, steel), x, -0.05, 0.09); });
  at(peg, box(0.05, 0.7, 0.03, P.berry, 0.02), 0.3, 0.1, 0.09).rotation.z = 0.12;
  at(peg, box(0.05, 0.7, 0.03, P.berry, 0.02), 0.4, 0.1, 0.09).rotation.z = -0.12;
  at(peg, cyl(0.2, 0.2, 0.12, P.slate, 24), 0.85, 0.45, 0.1).rotation.x = Math.PI / 2;
  at(peg, cyl(0.12, 0.12, 0.13, P.mist, 24), 0.85, 0.45, 0.1).rotation.x = Math.PI / 2;
  at(peg, box(0.32, 0.5, 0.08, P.butter, 0.04), 0.2, -0.5, 0.09);
  at(peg, box(0.24, 0.14, 0.02, P.navy, 0.01), 0.2, -0.38, 0.14);
  register(peg, "skills", "Tool wall — Skills", { pos: [-2.7, 3.4, 3.2], target: [-2.85, 3.3, BACK] });

  // ── resume clipboard ──
  const clip = new THREE.Group(); clip.position.set(-1.55, 3.55, BACK + 0.04); clip.rotation.z = 0.04; root.add(clip);
  at(clip, box(0.95, 1.25, 0.04, P.mauve, 0.02), 0, 0, 0);
  at(clip, plane(0.82, 1.08, canvasTex(360, 480, (g, w, h) => {
    g.fillStyle = hex(P.cream); g.fillRect(0, 0, w, h);
    g.fillStyle = hex(P.navy); g.font = `700 40px ${SANS}`; g.fillText("RESUME", 34, 72);
    g.fillStyle = hex(P.rose); g.fillRect(34, 88, 70, 6);
    let y = 130; for (let s = 0; s < 4; s++) { g.fillStyle = hex(P.slate); g.fillRect(34, y, 120, 10); y += 26; g.fillStyle = hex(P.powder); for (let l = 0; l < 3; l++) { g.fillRect(34, y, 220 + Math.random() * 70, 7); y += 18; } y += 16; }
  })), 0, -0.05, 0.03);
  at(clip, box(0.36, 0.1, 0.06, P.metal, 0.02, steel), 0, 0.58, 0.04);
  register(clip, "resume", "Resume", { pos: [-0.9, 3.45, 2.4], target: [-0.95, 3.45, BACK] });

  // ── decor: blueprint, window, whiteboard, shelf, string lights ──
  at(root, plane(2.0, 1.25, canvasTex(768, 480, (g, w, h) => {
    g.fillStyle = "#3d5687"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(255,255,255,.12)"; g.lineWidth = 1;
    for (let x = 0; x < w; x += 24) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y < h; y += 24) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.strokeStyle = "#e6ebf7"; g.lineWidth = 3;
    g.strokeRect(110, 150, 150, 120); g.strokeRect(125, 80, 120, 70);
    g.beginPath(); g.arc(165, 115, 12, 0, 7); g.stroke(); g.beginPath(); g.arc(205, 115, 12, 0, 7); g.stroke();
    g.strokeRect(95, 270, 70, 40); g.strokeRect(205, 270, 70, 40);
    // dome droid side sketch (the R2 build)
    g.beginPath(); g.moveTo(450, 340); g.lineTo(450, 200); g.arc(540, 200, 90, Math.PI, 0); g.lineTo(630, 340); g.stroke();
    g.strokeRect(430, 230, 20, 140); g.strokeRect(630, 230, 20, 140);
    g.beginPath(); g.arc(540, 165, 14, 0, 7); g.stroke();
    g.fillStyle = "#e6ebf7"; g.font = `600 28px ${SANS}`; g.fillText("SD-01  //  R2 BUILD", 40, 44);
    g.font = `16px ${MONO}`; g.fillText("dome Ø 46 cm ?", 470, 400); g.fillText("DROID ASSY", 40, 455);
  })), 0.35, 3.65, BACK + 0.02);
  const win = new THREE.Group(); win.position.set(2.65, 3.7, BACK + 0.02); root.add(win);
  at(win, new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.52), glow(0xffffff, { map: canvasTex(512, 456, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, "#232a4a"); sky.addColorStop(0.6, "#5a4a78"); sky.addColorStop(1, "#c9919f");
    g.fillStyle = sky; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(230,235,255,${0.3 + Math.random() * 0.6})`; const s = Math.random() < 0.1 ? 2.2 : 1.2; g.fillRect(Math.random() * w, Math.random() * h * 0.6, s, s); }
    g.fillStyle = "#f3eef5"; g.shadowColor = "#f0e6ff"; g.shadowBlur = 30; g.beginPath(); g.arc(w * 0.72, h * 0.24, 30, 0, 7); g.fill(); g.shadowBlur = 0;
    g.fillStyle = "#2a2542"; let x = 0;
    while (x < w) { const bw = 24 + Math.random() * 46, bh = 40 + Math.random() * 110; g.fillRect(x, h - bh, bw, bh); g.fillStyle = "#e9c9d4";
      for (let wy = h - bh + 10; wy < h - 8; wy += 14) for (let wx = x + 5; wx < x + bw - 6; wx += 10) if (Math.random() < 0.18) g.fillRect(wx, wy, 4, 6);
      g.fillStyle = "#2a2542"; x += bw + 2; }
  }) })), 0, 0, 0);
  for (const [w, h, x, y] of [[1.86, 0.09, 0, 0.8], [1.96, 0.1, 0, -0.8], [0.09, 1.6, -0.89, 0], [0.09, 1.6, 0.89, 0], [0.05, 1.52, 0, 0], [1.7, 0.05, 0, 0]]) at(win, box(w, h, 0.1, C.trim, 0.02), x, y, 0.04);
  at(win, cyl(0.09, 0.07, 0.14, P.rose), 0.55, -0.68, 0.12);
  at(win, cyl(0.05, 0.05, 0.2, P.sage, 12), 0.55, -0.52, 0.12);
  const wb = new THREE.Group(); wb.position.set(4.8, 3.65, BACK + 0.04); root.add(wb);
  at(wb, box(1.9, 1.25, 0.05, P.mist, 0.02), 0, 0, 0);
  at(wb, plane(1.8, 1.15, canvasTex(640, 400, (g) => {
    g.fillStyle = "#f3f1f6"; g.fillRect(0, 0, 640, 400);
    g.strokeStyle = "#5670a8"; g.fillStyle = "#5670a8"; g.lineWidth = 3; g.font = `italic 30px Georgia, serif`;
    g.fillText("cell ~ 10 µm   atom ~ 0.1 nm", 30, 70);
    const bx = (x, y, t) => { g.strokeRect(x, y, 120, 54); g.font = `20px ${MONO}`; g.fillText(t, x + 14, y + 34); };
    bx(40, 140, "ROBOT"); bx(250, 140, "SENSOR"); bx(460, 140, "CELL?");
    g.beginPath(); g.moveTo(160, 167); g.lineTo(250, 167); g.moveTo(370, 167); g.lineTo(460, 167); g.stroke();
    g.strokeStyle = "#b5627f"; g.fillStyle = "#b5627f"; g.font = `22px ${MONO}`;
    g.fillText("bio-robotics → someday", 40, 290); g.fillText("R2: dome gears!!", 40, 340);
  })), 0, 0, 0.03);
  const shelf = new THREE.Group(); shelf.position.set(5.0, 2.35, BACK + 0.25); root.add(shelf);
  at(shelf, box(1.9, 0.06, 0.45, C.desk, 0.01), 0, 0, 0);
  [[-0.65, P.blue], [-0.2, P.rose], [0.25, P.butter], [0.65, P.sage]].forEach(([x, c]) => at(shelf, box(0.38, 0.28, 0.36, c, 0.03), x, 0.17, 0));
  const bulbs = [];
  for (let i = 0; i <= 26; i++) { const t = i / 26; bulbs.push(at(root, new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), glow(i % 2 ? P.blush : P.powder)), -6.6 + t * 13.2, 5.05 - Math.sin(t * Math.PI * 3) ** 2 * 0.3, BACK + 0.08)); }
  const sp = []; for (let i = 0; i <= 120; i++) { const t = i / 120; sp.push([-6.6 + t * 13.2, 5.1 - Math.sin(t * Math.PI * 3) ** 2 * 0.3, BACK + 0.06]); }
  root.add(wire(sp, P.navy, 0.008));
  const fairy = new THREE.PointLight(0xf3c9d6, 2.5, 8, 2); fairy.position.set(0, 4.7, -2.3); root.add(fairy);

  // ── guitar leaning on the right wall ──
  const guitar = new THREE.Group(); guitar.position.set(5.55, 0, -2.5); guitar.rotation.set(-0.12, -0.5, 0.1); root.add(guitar);
  const wood = mat(0xa97f86, { roughness: 0.45 });
  const lower = at(guitar, cyl(0.4, 0.4, 0.16, wood, 32), 0, 0.5, 0); lower.rotation.x = Math.PI / 2; lower.scale.set(1, 1, 1);
  const upper = at(guitar, cyl(0.31, 0.31, 0.16, wood, 32), 0, 0.98, 0); upper.rotation.x = Math.PI / 2;
  at(guitar, cyl(0.1, 0.1, 0.01, P.ink, 24), 0, 0.82, 0.085).rotation.x = Math.PI / 2;
  at(guitar, box(0.09, 0.95, 0.06, 0x5a4048, 0.01), 0, 1.68, 0.03);
  at(guitar, box(0.16, 0.26, 0.05, 0x5a4048, 0.02), 0, 2.25, 0.02);
  at(guitar, box(0.24, 0.05, 0.04, P.ink, 0.01), 0, 0.42, 0.09);
  for (let i = 0; i < 6; i++) at(guitar, box(0.003, 1.75, 0.003, P.mist, 0), -0.03 + i * 0.012, 1.35, 0.09);
  at(guitar, wire([[0, 0.12, -0.05], [0.12, 0.9, -0.2], [0, 2.1, -0.06]], P.rose, 0.015));
  register(guitar, "deco-guitar", "Off-hours: guitar", null);

  // ── dumbbell on the floor ──
  const db = new THREE.Group(); db.position.set(-3.3, 0.12, -0.15); db.rotation.y = 0.6; root.add(db);
  at(db, cyl(0.025, 0.025, 0.6, P.metal, 10, steel), 0, 0, 0).rotation.z = Math.PI / 2;
  for (const x of [-0.22, 0.22]) at(db, cyl(0.12, 0.12, 0.1, P.navy, 6), x, 0, 0).rotation.z = Math.PI / 2;
  register(db, "deco-gym", "Gym > skipping leg day", null);

  // ── R2 build (in progress) on the floor ──
  const r2 = new THREE.Group(); r2.position.set(-2.55, 0, 0.35); r2.rotation.y = 0.5; root.add(r2);
  at(r2, cyl(0.55, 0.6, 0.06, P.slate, 32), 0, 0.03, 0); // build turntable
  const frameM = mat(P.metal, steel);
  const bodyG = at(r2, new THREE.Group(), 0, 0.28, 0);
  for (const y of [0, 0.62]) { const rr = at(bodyG, new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.018, 8, 40), frameM), 0, y, 0); rr.rotation.x = Math.PI / 2; rr.castShadow = true; }
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; at(bodyG, cyl(0.014, 0.014, 0.62, frameM, 6), Math.cos(a) * 0.3, 0.31, Math.sin(a) * 0.3); }
  // a few skin panels done, the rest bare
  for (const [start, len, c] of [[-0.2, 0.9, P.cream], [1.2, 0.5, P.cream], [2.6, 0.7, P.mist]]) {
    const pnl = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.305, 0.305, 0.58, 24, 1, true, start, len), mat(c, { side: THREE.DoubleSide, roughness: 0.6 }))); at(bodyG, pnl, 0, 0.31, 0);
  }
  for (const [a, y] of [[0.2, 0.42], [0.45, 0.2], [1.45, 0.35]]) { const b = at(bodyG, box(0.1, 0.12, 0.012, P.blue, 0.005), Math.sin(a) * 0.312, y, Math.cos(a) * 0.312); b.rotation.y = a; }
  // half-finished dome
  const dome = shadow(new THREE.Mesh(new THREE.SphereGeometry(0.31, 32, 16, 0, Math.PI * 1.4, 0, Math.PI / 2), mat(0xb8c0d0, { metalness: 0.75, roughness: 0.3, side: THREE.DoubleSide })));
  at(r2, dome, 0, 0.91, 0); dome.rotation.y = -0.6;
  at(r2, sph(0.05, P.ink), 0.12, 1.1, 0.24);
  at(r2, box(0.1, 0.07, 0.01, P.blue, 0.005), -0.05, 1.12, 0.27).rotation.x = -0.4;
  // one leg attached, one leaning beside
  const leg = () => { const g = new THREE.Group(); at(g, box(0.1, 0.8, 0.16, P.cream, 0.03), 0, 0.4, 0); at(g, box(0.18, 0.12, 0.3, P.slate, 0.03), 0, 0.06, 0.03); at(g, box(0.06, 0.4, 0.08, P.blue, 0.02), 0.051, 0.45, 0); return g; };
  at(r2, leg(), -0.38, 0.06, 0);
  const loose = at(r2, leg(), 0.75, 0.0, 0.25); loose.rotation.z = -0.35;
  at(r2, wire([[0.25, 0.5, 0.1], [0.45, 0.2, 0.3], [0.6, 0.06, 0.15]], P.rose, 0.012));
  const r2sign = at(r2, plane(0.42, 0.26, signTex(["R2", "build in progress"], hex(P.blush), hex(P.navy))), 0, 0.2, 0.62); r2sign.material.side = THREE.DoubleSide; r2sign.rotation.x = -0.5;
  register(r2, "r2", "R2 build — in progress", { pos: [-1.6, 1.9, 3.6], target: [-2.2, 0.8, 0.35] });

  // ── battle bot arena (Batmobile) ──
  const bb = new THREE.Group(); bb.position.set(3.55, 0, 0.55); bb.rotation.y = -0.5; root.add(bb);
  at(bb, box(2.2, 0.12, 1.6, P.navy, 0.02), 0, 0.06, 0);
  at(bb, box(2.08, 0.01, 1.48, mat(0xcdb98f, { roughness: 0.95 }), 0), 0, 0.125, 0);
  const caution = stripeTex(); caution.repeat.set(6, 1);
  for (const [w, x, z, ry] of [[2.2, 0, 0.81, 0], [2.2, 0, -0.81, Math.PI], [1.6, 1.11, 0, Math.PI / 2], [1.6, -1.11, 0, -Math.PI / 2]]) { const s = at(bb, new THREE.Mesh(new THREE.PlaneGeometry(w, 0.1), new THREE.MeshStandardMaterial({ map: caution })), x, 0.06, z); s.rotation.y = ry; }
  const glass = new THREE.MeshStandardMaterial({ color: 0xe3ecff, transparent: true, opacity: 0.16, roughness: 0.05, depthWrite: false });
  for (const [w, x, z, ry] of [[2.2, 0, 0.8, 0], [2.2, 0, -0.8, 0], [1.6, 1.1, 0, Math.PI / 2], [1.6, -1.1, 0, Math.PI / 2]]) { const p = at(bb, new THREE.Mesh(new THREE.PlaneGeometry(w, 0.9), glass), x, 0.57, z); p.rotation.y = ry; }
  for (const [x, z] of [[-1.1, -0.8], [1.1, -0.8], [-1.1, 0.8], [1.1, 0.8]]) at(bb, box(0.05, 0.95, 0.05, P.slate, 0.01), x, 0.57, z);
  for (const z of [-0.8, 0.8]) at(bb, box(2.25, 0.04, 0.04, P.slate, 0.01), 0, 1.05, z);
  for (const x of [-1.1, 1.1]) at(bb, box(0.04, 0.04, 1.65, P.slate, 0.01), x, 1.05, 0);
  const bot = at(bb, new THREE.Group(), 0.05, 0.12, -0.05); bot.rotation.y = 0.85;
  const blk = mat(0x23273a, { roughness: 0.6 });
  at(bot, box(0.42, 0.17, 0.46, blk, 0.02), -0.33, 0.12, 0); at(bot, box(0.42, 0.17, 0.46, blk, 0.02), 0.33, 0.12, 0);
  at(bot, box(1.08, 0.025, 0.46, mat(0x1b1e2c), 0.01), 0, 0.215, -0.02);
  for (const x of [-0.5, -0.16, 0.16, 0.5]) { const fs = new THREE.Shape(); fs.moveTo(0, 0); fs.lineTo(0.34, 0); fs.lineTo(0, 0.12); fs.lineTo(0, 0); const f = shadow(new THREE.Mesh(new THREE.ExtrudeGeometry(fs, { depth: 0.05, bevelEnabled: false }), blk)); at(bot, f, x - 0.025, 0.04, 0.23); f.rotation.y = -Math.PI / 2; }
  for (const x of [-0.6, 0.6]) { at(bot, cyl(0.13, 0.13, 0.1, P.cream, 24), x, 0.13, -0.05).rotation.z = Math.PI / 2; at(bot, cyl(0.06, 0.06, 0.105, blk, 12), x, 0.13, -0.05).rotation.z = Math.PI / 2; }
  at(bot, cyl(0.07, 0.07, 0.2, P.darkMetal, 16), 0, 0.15, -0.08).rotation.z = Math.PI / 2;
  const spinner = at(bot, new THREE.Group(), 0, 0.2, 0.12);
  const ws = new THREE.Shape();
  for (let i = 0; i <= 64; i++) { const a = (i / 64) * Math.PI * 2, ph = a % Math.PI, r = 0.11 + 0.1 * Math.max(0, 1 - ph / 1.1); const p = [Math.cos(a) * r, Math.sin(a) * r]; i ? ws.lineTo(...p) : ws.moveTo(...p); }
  const wGeo = new THREE.ExtrudeGeometry(ws, { depth: 0.035, bevelEnabled: false }); wGeo.center();
  const weapon = shadow(new THREE.Mesh(wGeo, mat(0x2d3042, { metalness: 0.5, roughness: 0.4 }))); weapon.rotation.y = Math.PI / 2; spinner.add(weapon);
  for (const s of [-1, 1]) at(spinner, box(0.04, 0.05, 0.02, P.blue, 0.005), 0, 0.2 * s, 0.02 * s);
  const sign = at(bb, plane(0.6, 0.37, signTex(["4TH", "WATBOTS 2026"])), -0.75, 0.75, 0.82); sign.material.side = THREE.DoubleSide;
  register(bb, "combat", "Batmobile — Combat Robotics", { pos: [2.7, 2.5, 4.4], target: [3.55, 0.6, 0.55] });

  // ── scrappy suit frame: tucked deep in the back-left corner ──
  const suit = new THREE.Group(); suit.position.set(-6.1, 0, -2.45); suit.rotation.y = 0.7; suit.scale.setScalar(0.85); root.add(suit);
  const fm = mat(0x6c7386, { metalness: 0.6, roughness: 0.5 });
  at(suit, cyl(0.4, 0.45, 0.06, P.ink, 24), 0, 0.03, 0);
  at(suit, cyl(0.035, 0.035, 2.1, fm, 10), 0, 1.08, 0);
  at(suit, cyl(0.03, 0.03, 0.9, fm, 8), 0, 2.4, -0.06);
  for (let i = 0; i < 4; i++) { const rib = at(suit, new THREE.Mesh(new THREE.TorusGeometry(0.26 - i * 0.02, 0.016, 6, 24, Math.PI * 1.25), fm), 0, 2.15 + i * 0.16, -0.02); rib.rotation.x = Math.PI / 2; rib.rotation.z = -Math.PI * 0.12; rib.scale.set(1.15, 0.8, 1); }
  at(suit, cyl(0.025, 0.025, 0.85, fm, 8), 0, 2.8, 0).rotation.z = Math.PI / 2;
  const plate = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.25, 0.42, 20, 1, true, -0.2, 1.4), mat(0x8a90a0, { side: THREE.DoubleSide, roughness: 0.85 }))); at(suit, plate, 0, 2.55, 0); plate.rotation.y = 0.6;
  at(suit, sph(0.05, fm), -0.43, 2.78, 0);
  at(suit, cyl(0.025, 0.025, 0.5, fm, 8), -0.47, 2.52, 0.02).rotation.z = 0.12;
  at(suit, cyl(0.022, 0.022, 0.45, fm, 8), -0.5, 2.02, 0.12).rotation.x = 0.4;
  at(suit, wire([[0.4, 2.78, 0], [0.48, 2.5, 0.05], [0.42, 2.25, 0.02]], P.rose, 0.01));
  const hip = at(suit, new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.02, 6, 24), fm), 0, 1.95, 0); hip.rotation.x = Math.PI / 2; hip.scale.set(1.2, 0.85, 1);
  register(suit, "suit", "??? — 8% complete", null);

  // ── SD-01 on the desk ──
  const sd = buildDroid("rover");
  const droid = sd.group; droid.position.set(-1.4, DESK_Y, -1.45); droid.scale.setScalar(1.35); root.add(droid);
  register(droid, "about", "SD-01 — say hi", { pos: [-0.35, 2.4, 1.7], target: [-0.75, 2.0, -1.35] });

  const dust = particles(120, [12, 5.5, 6], 0xffffff, 0.05, 0.4); dust.position.set(0, 2.8, 0); root.add(dust);

  let dir = 1, pause = 0;
  return {
    key: "workshop", scale: "1 m", title: "The workshop", sub: "robots I build",
    bg: 0xc3cde0, fog: [18, 34], exposure: 1.05, shadows: true,
    home: { pos: [0, 3.15, 10.6], target: [0, 2.6, -1.2] },
    portal: [1.6, 1.58, -1.55],
    droid: sd,
    update(t, dt, s) {
      const hov = s.hovered === droid, foc = s.focused === droid;
      if (!hov && !foc) {
        if (pause > 0) pause -= dt; else { droid.position.x += dir * dt * 0.28; if (droid.position.x > -0.95) { dir = -1; pause = 1.5 + Math.random() * 2; } if (droid.position.x < -1.8) { dir = 1; pause = 1.5 + Math.random() * 2; } }
      }
      const moving = pause <= 0 && !hov && !foc;
      const want = hov || foc ? -Math.PI / 2 + 0.2 : moving ? (dir > 0 ? 0 : -Math.PI) : -Math.PI / 2 + 0.35;
      droid.rotation.y += (want - droid.rotation.y) * 0.08;
      sd.update(t, dt, { lookAt: s.lookPoint, happy: hov, moving });
      const ab = s.hovered === trashBot ? 1 : 0.4;
      armBase.rotation.y = Math.sin(t * 0.7) * 0.5 * ab; shoulder.rotation.z = 0.35 + Math.sin(t * 0.9) * 0.25 * ab; elbow.rotation.z = -0.9 + Math.sin(t * 0.9 + 1) * 0.3 * ab;
      const grip = (Math.sin(t * 1.8) + 1) * 0.5 * ab; fA.position.z = 0.03 + grip * 0.03; fB.position.z = -0.03 - grip * 0.03;
      tbLed.material.color.setHex(Math.sin(t * 6) > 0 ? P.rose : P.plum);
      boardLeds.forEach((l, i) => { l.material.emissiveIntensity = 0.3 + ((Math.sin(t * 5 - i) + 1) / 2) * 2; });
      ring.material.opacity = 0.35 + Math.sin(t * 2.5) * 0.25 + (s.hovered === board ? 0.3 : 0); ring.scale.setScalar(1 + Math.sin(t * 2.5) * 0.04);
      spinner.rotation.x -= dt * (s.hovered === bb || s.focused === bb ? 28 : 1.5);
      bulbs.forEach((b, i) => b.scale.setScalar(0.85 + 0.2 * Math.sin(t * 1.5 + i * 1.7)));
      const sa = steam.geometry.attributes.position; for (let i = 0; i < sa.count; i++) { let y = sa.getY(i) + dt * 0.12; if (y > 0.35) y = -0.05; sa.setY(i, y); sa.setX(i, Math.sin(t * 2 + i) * 0.03); } sa.needsUpdate = true;
      const da = dust.geometry.attributes.position; for (let i = 0; i < da.count; i++) { let y = da.getY(i) + dt * 0.04; if (y > 2.7) y = -2.7; da.setY(i, y); } da.needsUpdate = true;
      term.update(t);
    }
  };
}

function makeTerminal() {
  const tex = canvasTex(512, 320, () => {});
  const lines = ["$ whoami", "sughosh desai", "$ ./comm --open", "channel ready.", "click to contact"];
  let shown = 0, chars = 0, idle = 0, last = 0;
  function draw(t) {
    const { ctx: g, canvas } = tex.userData, w = canvas.width, h = canvas.height;
    g.fillStyle = "#1e2540"; g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(159,178,209,0.06)"; for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 2);
    g.font = `26px ${MONO}`;
    for (let i = 0; i <= shown && i < lines.length; i++) { const txt = i < shown ? lines[i] : lines[i].slice(0, chars); g.fillStyle = lines[i].startsWith("$") ? "#e3a9bd" : "#c9d6ee"; g.fillText(txt, 28, 54 + i * 46); }
    if (Math.floor(t * 2) % 2 === 0) { const i = Math.min(shown, lines.length - 1); const txt = shown < lines.length ? lines[i].slice(0, chars) : lines[i]; g.fillStyle = "#e3a9bd"; g.fillRect(28 + g.measureText(txt).width + 4, 32 + i * 46, 14, 28); }
    tex.needsUpdate = true;
  }
  return { tex, update(t) { if (t - last < 0.06) return; last = t; if (shown < lines.length) { chars++; if (chars > lines[shown].length) { shown++; chars = 0; } } else if (++idle > 120) { shown = 0; chars = 0; idle = 0; } draw(t); } };
}
