// ─────────────────────────────────────────────────────────────
//  3D workshop scene (three.js). Every object is built from code.
// ─────────────────────────────────────────────────────────────
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const C = {
  wall: 0xd5dde4, wainscot: 0xa9b8c6, trim: 0xf2f4f6, floor: 0xb99d80,
  desk: 0xc89f72, deskLeg: 0x5b636d, metal: 0x9aa3ad, darkMetal: 0x3a4048,
  orange: 0xff7a3d, teal: 0x37c3b2, cream: 0xf4ede2, ink: 0x2a2f36,
  pcb: 0x1f8a7a, primer: 0x8c958b, gunmetal: 0x5d646c
};

// ── helpers ──────────────────────────────────────────────────
const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.05, ...o });
const shadow = (m, cast = true, recv = true) => { m.castShadow = cast; m.receiveShadow = recv; return m; };
function box(w, h, d, color, r = 0.035, o) {
  const geo = r > 0 ? new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2)) : new THREE.BoxGeometry(w, h, d);
  return shadow(new THREE.Mesh(geo, color instanceof THREE.Material ? color : mat(color, o)));
}
function cyl(rt, rb, h, color, seg = 24, o) {
  return shadow(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), color instanceof THREE.Material ? color : mat(color, o)));
}
function sph(r, color, o, ws = 24, hs = 16) {
  return shadow(new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), color instanceof THREE.Material ? color : mat(color, o)));
}
function at(parent, obj, x = 0, y = 0, z = 0) { obj.position.set(x, y, z); parent.add(obj); return obj; }
function canvasTex(w, h, draw) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d"); draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  t.userData = { canvas: c, ctx }; return t;
}
function plane(w, h, tex, o = {}) {
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, ...o }));
}
function wire(points, color = 0x222222, r = 0.012) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  return shadow(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, r, 6), mat(color, { roughness: 0.5 })), true, false);
}

// ── textures ─────────────────────────────────────────────────
const MONO = '"JetBrains Mono", ui-monospace, monospace';
const SANS = '"Space Grotesk", system-ui, sans-serif';

function windowTex() {
  return canvasTex(512, 456, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#1b2140"); sky.addColorStop(0.65, "#4a3f73"); sky.addColorStop(1, "#c98a8a");
    g.fillStyle = sky; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      g.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.7})`;
      const s = Math.random() < 0.1 ? 2.2 : 1.2;
      g.fillRect(Math.random() * w, Math.random() * h * 0.6, s, s);
    }
    g.fillStyle = "#fff6dc"; g.shadowColor = "#fff2c0"; g.shadowBlur = 30;
    g.beginPath(); g.arc(w * 0.72, h * 0.24, 30, 0, Math.PI * 2); g.fill(); g.shadowBlur = 0;
    // skyline
    g.fillStyle = "#231d3a"; let x = 0;
    while (x < w) { const bw = 24 + Math.random() * 46, bh = 40 + Math.random() * 110; g.fillRect(x, h - bh, bw, bh);
      g.fillStyle = "#ffd98a";
      for (let wy = h - bh + 10; wy < h - 8; wy += 14) for (let wx = x + 5; wx < x + bw - 6; wx += 10) if (Math.random() < 0.18) g.fillRect(wx, wy, 4, 6);
      g.fillStyle = "#231d3a"; x += bw + 2; }
  });
}
function blueprintTex() {
  return canvasTex(768, 480, (g, w, h) => {
    g.fillStyle = "#2c5a96"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(255,255,255,0.12)"; g.lineWidth = 1;
    for (let x = 0; x < w; x += 24) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y < h; y += 24) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.strokeStyle = "#eaf2ff"; g.lineWidth = 3;
    // droid front + side views
    g.strokeRect(110, 150, 150, 120); g.strokeRect(125, 80, 120, 70);
    g.beginPath(); g.arc(165, 115, 12, 0, 7); g.stroke(); g.beginPath(); g.arc(205, 115, 12, 0, 7); g.stroke();
    g.beginPath(); g.moveTo(185, 80); g.lineTo(185, 50); g.stroke(); g.beginPath(); g.arc(185, 44, 6, 0, 7); g.stroke();
    g.strokeRect(95, 270, 70, 40); g.strokeRect(205, 270, 70, 40);
    g.setLineDash([6, 6]); g.beginPath(); g.moveTo(60, 310); g.lineTo(320, 310); g.stroke(); g.setLineDash([]);
    // arm linkage
    g.beginPath(); g.moveTo(430, 330); g.lineTo(520, 220); g.lineTo(640, 250); g.stroke();
    [[430, 330], [520, 220], [640, 250]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 10, 0, 7); g.stroke(); });
    g.beginPath(); g.moveTo(640, 250); g.lineTo(675, 230); g.moveTo(640, 250); g.lineTo(675, 275); g.stroke();
    g.beginPath(); g.arc(520, 220, 50, -2.3, -0.5); g.stroke();
    g.fillStyle = "#eaf2ff"; g.font = `600 30px ${SANS}`; g.fillText("SD-01  //  REV C", 40, 44);
    g.font = `16px ${MONO}`; g.fillText("θ1 = 52°   θ2 = −18°", 470, 380); g.fillText("SCALE 1:4", 640, 455);
    g.fillText("DROID ASSY", 40, 455);
  });
}
function resumeTex() {
  return canvasTex(360, 480, (g, w, h) => {
    g.fillStyle = "#fbfaf6"; g.fillRect(0, 0, w, h);
    g.fillStyle = C_hex(C.ink); g.font = `700 40px ${SANS}`; g.fillText("RESUME", 34, 72);
    g.fillStyle = "#ff7a3d"; g.fillRect(34, 88, 70, 6);
    g.fillStyle = "#9aa3ad";
    let y = 130;
    for (let s = 0; s < 4; s++) {
      g.fillStyle = "#5d646c"; g.fillRect(34, y, 120, 10); y += 26;
      g.fillStyle = "#c3c9cf";
      for (let l = 0; l < 3; l++) { g.fillRect(34, y, 220 + Math.random() * 70, 7); y += 18; }
      y += 16;
    }
  });
}
function whiteboardTex() {
  return canvasTex(640, 400, (g, w, h) => {
    g.fillStyle = "#fbfcfd"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#3a6fd8"; g.fillStyle = "#3a6fd8"; g.lineWidth = 3;
    g.font = `italic 30px Georgia, serif`;
    g.fillText("u(t) = Kₚe + Kᵢ∫e dt + K_d ė", 30, 70);
    // block diagram
    const bx = (x, y, t) => { g.strokeRect(x, y, 110, 54); g.font = `20px ${MONO}`; g.fillText(t, x + 18, y + 34); };
    bx(60, 150, "PID"); bx(260, 150, "MOTOR"); bx(460, 150, "ROBOT");
    g.beginPath(); g.moveTo(170, 177); g.lineTo(260, 177); g.moveTo(370, 177); g.lineTo(460, 177);
    g.moveTo(570, 177); g.lineTo(610, 177); g.lineTo(610, 290); g.lineTo(30, 290); g.lineTo(30, 177); g.lineTo(60, 177); g.stroke();
    g.strokeStyle = "#e0533d"; g.fillStyle = "#e0533d"; g.font = `22px ${MONO}`;
    g.fillText("battle bot: spinner rpm?", 40, 350);
    g.beginPath(); g.arc(380, 343, 16, 0, 7); g.stroke();
  });
}
function pegboardTex() {
  return canvasTex(512, 384, (g, w, h) => {
    g.fillStyle = "#cfa97c"; g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(60,40,20,0.55)";
    for (let x = 16; x < w; x += 24) for (let y = 16; y < h; y += 24) { g.beginPath(); g.arc(x, y, 3.2, 0, 7); g.fill(); }
  });
}
function cautionTex() {
  const t = canvasTex(256, 32, (g, w, h) => {
    g.fillStyle = "#ffcf33"; g.fillRect(0, 0, w, h); g.fillStyle = "#1d1d1d";
    for (let x = -32; x < w + 32; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 16, 0); g.lineTo(x + 16 - 32, h); g.lineTo(x - 32, h); g.fill(); }
  });
  t.wrapS = THREE.RepeatWrapping; return t;
}
function signTex(lines, bg = "#ffcf33", fg = "#1d1d1d") {
  return canvasTex(256, 160, (g, w, h) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = fg; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16);
    g.fillStyle = fg; g.textAlign = "center"; g.font = `700 40px ${SANS}`; g.fillText(lines[0], w / 2, 72);
    g.font = `22px ${MONO}`; g.fillText(lines[1] || "", w / 2, 115);
  });
}
function C_hex(n) { return "#" + n.toString(16).padStart(6, "0"); }

// ── terminal screen (animated) ───────────────────────────────
function makeTerminal() {
  const tex = canvasTex(512, 320, () => {});
  const lines = ["$ whoami", "sughosh desai", "$ ./comm --open", "channel ready.", "click to contact"];
  let shown = 0, chars = 0, blink = 0, last = 0;
  function draw(t) {
    const { ctx: g, canvas } = tex.userData, w = canvas.width, h = canvas.height;
    g.fillStyle = "#0e1a1f"; g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(55,195,178,0.06)"; for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 2);
    g.font = `26px ${MONO}`;
    for (let i = 0; i <= shown && i < lines.length; i++) {
      const txt = i < shown ? lines[i] : lines[i].slice(0, chars);
      g.fillStyle = lines[i].startsWith("$") ? "#37c3b2" : "#d6f5ef";
      g.fillText(txt, 28, 54 + i * 46);
    }
    if (Math.floor(t * 2) % 2 === 0) {
      const i = Math.min(shown, lines.length - 1);
      const txt = shown < lines.length ? lines[i].slice(0, chars) : lines[i];
      g.fillStyle = "#37c3b2"; g.fillRect(28 + g.measureText(txt).width + 4, 32 + i * 46, 14, 28);
    }
    tex.needsUpdate = true;
  }
  function update(t) {
    if (t - last < 0.06) return; last = t;
    if (shown < lines.length) { chars++; if (chars > lines[shown].length) { shown++; chars = 0; } }
    else if (++blink > 120) { shown = 0; chars = 0; blink = 0; }
    draw(t);
  }
  return { tex, update };
}

// ─────────────────────────────────────────────────────────────
export function createWorkshop(container, { onSelect, onHover, onReady } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xc7d1da);
  scene.fog = new THREE.Fog(0xc7d1da, 18, 34);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  const HOME = { pos: new THREE.Vector3(0, 3.15, 10.6), target: new THREE.Vector3(0, 2.6, -1.2) };
  camera.position.copy(HOME.pos);

  // lights
  scene.add(new THREE.HemisphereLight(0xe6eeff, 0xb59b80, 1.1));
  const key = new THREE.DirectionalLight(0xfff3e6, 1.5);
  key.position.set(-5, 9, 7); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -9, right: 9, top: 8, bottom: -3, near: 1, far: 30 });
  key.shadow.bias = -0.0006; key.shadow.normalBias = 0.02; key.shadow.radius = 4;
  scene.add(key);
  const windowLight = new THREE.PointLight(0x9db4ff, 6, 9, 2); windowLight.position.set(2.6, 3.8, -2.2); scene.add(windowLight);

  const root = new THREE.Group(); scene.add(root);

  // ── room ──
  const W = 14, D = 10, H = 8, BACK = -3;
  const floor = shadow(new THREE.Mesh(new THREE.PlaneGeometry(W, D), mat(C.floor, { roughness: 0.85 })), false, true);
  floor.rotation.x = -Math.PI / 2; floor.position.z = BACK + D / 2; root.add(floor);
  // floor planks
  for (let i = -6; i <= 6; i++) { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.015, D), mat(0x9c8166)); l.rotation.x = -Math.PI / 2; l.position.set(i * 1.05, 0.002, BACK + D / 2); root.add(l); }
  const backWall = shadow(new THREE.Mesh(new THREE.PlaneGeometry(W, H), mat(C.wall)), false, true);
  backWall.position.set(0, H / 2, BACK); root.add(backWall);
  for (const s of [-1, 1]) {
    const side = shadow(new THREE.Mesh(new THREE.PlaneGeometry(D, H), mat(0xc9d2da)), false, true);
    side.position.set(s * W / 2, H / 2, BACK + D / 2); side.rotation.y = -s * Math.PI / 2; root.add(side);
    at(root, box(0.08, 1.6, D, C.wainscot, 0), s * (W / 2 - 0.04), 0.8, BACK + D / 2);
  }
  at(root, box(W, 1.6, 0.08, C.wainscot, 0), 0, 0.8, BACK + 0.04);
  at(root, box(W, 0.08, 0.14, C.trim, 0.02), 0, 1.62, BACK + 0.07);
  at(root, box(W, 0.16, 0.12, C.trim, 0.02), 0, 0.08, BACK + 0.1);
  // rug
  const rug = shadow(new THREE.Mesh(new THREE.CircleGeometry(2.2, 48), mat(0xa39486, { roughness: 1 })), false, true);
  rug.rotation.x = -Math.PI / 2; rug.scale.set(1.5, 0.6, 1); rug.position.set(-0.6, 0.01, -0.2); root.add(rug);

  // ── interactables registry ──
  const interactables = [];
  function register(group, id, label, focus) {
    group.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.userData.baseEmissive = o.material.emissive ? o.material.emissive.clone() : null; o.userData.baseEI = o.material.emissiveIntensity; } });
    group.userData.interactive = { id, label, focus };
    interactables.push(group);
    return group;
  }

  // ── desk ──
  const DESK_Y = 1.5, DZ = -1.85;
  const desk = new THREE.Group(); root.add(desk);
  at(desk, box(7.8, 0.12, 1.75, C.desk, 0.03), -0.4, DESK_Y - 0.06, DZ);
  for (const [x, z] of [[-4.15, -2.6], [3.35, -2.6], [-4.15, -1.1], [3.35, -1.1]]) at(desk, box(0.1, DESK_Y - 0.12, 0.1, C.deskLeg, 0.02), x, (DESK_Y - 0.12) / 2, z);
  at(desk, box(7.6, 0.06, 0.06, C.deskLeg, 0.01), -0.4, 0.35, -2.6);
  // drawer unit
  const drawers = at(desk, box(1.2, 1.1, 1.5, 0x7b8794, 0.03), 2.6, 0.62, DZ);
  for (let i = 0; i < 3; i++) { at(desk, box(1.05, 0.28, 0.02, 0x8e9aa7, 0.02), 2.6, 0.3 + i * 0.34, DZ + 0.76); at(desk, box(0.3, 0.04, 0.04, C.metal, 0.01), 2.6, 0.36 + i * 0.34, DZ + 0.79); }
  void drawers;

  // ── monitor / comm terminal (Contact) ──
  const term = makeTerminal();
  const monitor = new THREE.Group(); monitor.position.set(-3.05, DESK_Y, -2.2); monitor.rotation.y = 0.28; root.add(monitor);
  at(monitor, box(0.5, 0.04, 0.36, C.ink, 0.02), 0, 0.02, 0);
  at(monitor, cyl(0.04, 0.04, 0.5, C.ink), 0, 0.27, -0.05);
  at(monitor, box(1.5, 0.98, 0.09, 0x2b3038, 0.04), 0, 0.92, 0);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.38, 0.86), new THREE.MeshBasicMaterial({ map: term.tex, toneMapped: false }));
  at(monitor, screen, 0, 0.92, 0.047);
  // keyboard
  at(monitor, box(1.0, 0.04, 0.32, 0xe9ecef, 0.02), 0.25, 0.02, 0.55);
  register(monitor, "contact", "Comm terminal — Contact", { pos: [-1.5, 2.6, 1.6], target: [-2.3, 2.3, -2.2] });

  // ── trash collection robot (Projects) ──
  const trashBot = new THREE.Group(); trashBot.position.set(0.15, DESK_Y, -1.95); trashBot.rotation.y = -0.35; root.add(trashBot);
  at(trashBot, box(0.95, 0.22, 0.62, 0x3f9b6e, 0.04), 0, 0.2, 0);
  at(trashBot, box(0.85, 0.05, 0.55, 0x2a2f36, 0.01), 0, 0.33, 0);
  for (const [x, z] of [[-0.32, 0.34], [0.32, 0.34], [-0.32, -0.34], [0.32, -0.34]]) { const w = at(trashBot, cyl(0.12, 0.12, 0.08, 0x23272d, 20), x, 0.12, z); w.rotation.x = Math.PI / 2; at(trashBot, cyl(0.05, 0.05, 0.09, 0xf0b429, 12), x, 0.12, z).rotation.x = Math.PI / 2; }
  // ultrasonic "eyes"
  for (const z of [-0.09, 0.09]) { const e = at(trashBot, cyl(0.045, 0.045, 0.07, C.metal, 16), 0.5, 0.24, z); e.rotation.z = Math.PI / 2; }
  at(trashBot, box(0.04, 0.09, 0.3, 0x1f6fb5, 0.01), 0.47, 0.24, 0);
  // arduino on top
  at(trashBot, box(0.32, 0.02, 0.22, C.pcb, 0.005), -0.15, 0.37, 0.1);
  const led = at(trashBot, sph(0.02, mat(0xff4040, { emissive: 0xff2020, emissiveIntensity: 2 })), -0.05, 0.4, 0.15);
  // arm
  const armBase = at(trashBot, new THREE.Group(), 0.18, 0.36, -0.08);
  at(armBase, cyl(0.08, 0.1, 0.08, C.darkMetal), 0, 0.04, 0);
  const shoulder = at(armBase, new THREE.Group(), 0, 0.08, 0);
  at(shoulder, box(0.06, 0.42, 0.06, C.orange, 0.02), 0, 0.21, 0);
  const elbow = at(shoulder, new THREE.Group(), 0, 0.42, 0);
  at(elbow, sph(0.045, C.darkMetal), 0, 0, 0);
  at(elbow, box(0.36, 0.05, 0.05, C.orange, 0.02), 0.18, 0, 0);
  const claw = at(elbow, new THREE.Group(), 0.37, 0, 0);
  at(claw, box(0.04, 0.06, 0.12, C.darkMetal, 0.01), 0, 0, 0);
  const fingerA = at(claw, box(0.1, 0.02, 0.02, C.metal, 0.005), 0.05, -0.02, 0.05);
  const fingerB = at(claw, box(0.1, 0.02, 0.02, C.metal, 0.005), 0.05, -0.02, -0.05);
  shoulder.rotation.z = 0.35; elbow.rotation.z = -0.9;
  // crumpled paper
  const paper = at(root, new THREE.Mesh(new THREE.IcosahedronGeometry(0.09, 0), mat(0xf5f3ee, { flatShading: true })), 0.95, DESK_Y + 0.09, -1.55);
  paper.castShadow = true;
  register(trashBot, "trash-robot", "Trash Collection Robot", { pos: [1.2, 2.6, 1.3], target: [0.75, 1.75, -1.95] });

  // ── arduino + breadboard (TinyML) ──
  const tiny = new THREE.Group(); tiny.position.set(1.55, DESK_Y, -1.6); tiny.rotation.y = 0.2; root.add(tiny);
  at(tiny, box(0.7, 0.03, 0.5, C.pcb, 0.01), 0, 0.015, 0);
  at(tiny, box(0.24, 0.05, 0.1, 0x111111, 0.005), 0.05, 0.05, 0.02);
  at(tiny, box(0.14, 0.09, 0.12, C.metal, 0.005), -0.3, 0.06, 0.15);
  for (let i = 0; i < 10; i++) at(tiny, box(0.02, 0.06, 0.02, 0x111111, 0), -0.25 + i * 0.05, 0.06, -0.22);
  at(tiny, box(0.8, 0.05, 0.36, 0xf3f1ea, 0.01), 0.05, 0.025, 0.55);
  const tinyLeds = [];
  for (let i = 0; i < 6; i++) {
    const colr = [0xff4545, 0xffc23d, 0x37c3b2][i % 3];
    tinyLeds.push(at(tiny, sph(0.025, mat(colr, { emissive: colr, emissiveIntensity: 0.2 })), -0.25 + i * 0.1, 0.075, 0.55));
  }
  at(tiny, wire([[-0.2, 0.05, -0.2], [-0.25, 0.18, 0.2], [-0.2, 0.06, 0.5]], 0xd33a2c, 0.01));
  at(tiny, wire([[0.2, 0.05, -0.2], [0.28, 0.2, 0.2], [0.25, 0.06, 0.5]], 0x2a62d9, 0.01));
  register(tiny, "tinyml", "Neural net on Arduino UNO", { pos: [2.2, 2.4, 0.4], target: [1.55, 1.55, -1.5] });

  // ── desk props ──
  const lamp = new THREE.Group(); lamp.position.set(2.95, DESK_Y, -2.35); root.add(lamp);
  at(lamp, cyl(0.2, 0.22, 0.05, C.ink), 0, 0.025, 0);
  const lArm1 = at(lamp, box(0.04, 0.9, 0.04, C.orange, 0.015), -0.12, 0.45, 0.1); lArm1.rotation.z = 0.3;
  const lArm2 = at(lamp, box(0.04, 0.7, 0.04, C.orange, 0.015), -0.15, 1.0, 0.25); lArm2.rotation.z = -0.9; lArm2.rotation.x = 0.4;
  const shade = at(lamp, cyl(0.07, 0.22, 0.26, C.ink, 24, { side: THREE.DoubleSide }), -0.45, 1.15, 0.4); shade.rotation.z = 0.7; shade.rotation.x = 0.3;
  const bulb = at(lamp, sph(0.06, new THREE.MeshBasicMaterial({ color: 0xfff1c9 })), -0.5, 1.07, 0.43);
  const lampLight = new THREE.SpotLight(0xffd9a0, 18, 5, 0.75, 0.6, 1.6);
  lampLight.position.set(2.45, DESK_Y + 1.07, -1.92); lampLight.target.position.set(1.2, DESK_Y, -1.5);
  lampLight.castShadow = true; lampLight.shadow.mapSize.set(1024, 1024); lampLight.shadow.bias = -0.001;
  root.add(lampLight, lampLight.target);
  void bulb;
  // mug + soldering iron + parts tray
  const mug = at(root, cyl(0.11, 0.1, 0.24, C.orange), -1.95, DESK_Y + 0.12, -2.45);
  const handle = at(root, new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.02, 8, 16), mat(C.orange)), -1.82, DESK_Y + 0.13, -2.45); void mug; void handle;
  at(root, box(0.5, 0.06, 0.3, 0x2b3038, 0.02), -0.9, DESK_Y + 0.03, -2.5);
  const iron = at(root, cyl(0.025, 0.012, 0.5, 0xeeeeee), -0.9, DESK_Y + 0.2, -2.5); iron.rotation.z = 1.1;
  at(root, wire([[-1.1, DESK_Y + 0.1, -2.5], [-1.3, DESK_Y + 0.02, -2.2], [-1.6, DESK_Y + 0.01, -2.55]], 0x222222, 0.012));
  at(root, box(0.5, 0.05, 0.3, 0x5d646c, 0.02), 1.75, DESK_Y + 0.025, -2.45);
  for (let i = 0; i < 8; i++) at(root, cyl(0.025, 0.025, 0.05, [0xffc23d, 0x37c3b2, C.metal][i % 3], 10), 1.57 + (i % 4) * 0.12, DESK_Y + 0.07, -2.52 + Math.floor(i / 4) * 0.14);

  // ── logbook stack (Experience) ──
  const logTex = canvasTex(512, 320, (g, w, h) => {
    g.fillStyle = "#fbf8f0"; g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(0,0,0,.08)"; g.fillRect(w / 2 - 3, 0, 6, h);
    g.strokeStyle = "#c9d6e6"; g.lineWidth = 2;
    for (let y = 70; y < h; y += 26) { g.beginPath(); g.moveTo(18, y); g.lineTo(w / 2 - 14, y); g.moveTo(w / 2 + 14, y); g.lineTo(w - 18, y); g.stroke(); }
    g.fillStyle = "#2a2f36"; g.font = `700 30px ${SANS}`; g.fillText("LOGBOOK", 30, 48);
    g.fillStyle = "#e5602a"; g.font = `20px ${MONO}`; g.fillText("2023 → now", w / 2 + 30, 46);
    g.fillStyle = "#5d646c";
    [[30, 92, 150], [30, 118, 190], [30, 170, 120], [30, 196, 170], [w / 2 + 30, 92, 160], [w / 2 + 30, 144, 140], [w / 2 + 30, 170, 185], [w / 2 + 30, 222, 110]]
      .forEach(([x, y, l]) => g.fillRect(x, y - 10, l, 6));
  });
  const logbook = new THREE.Group(); logbook.position.set(2.45, DESK_Y, -1.42); logbook.rotation.y = -0.35; root.add(logbook);
  at(logbook, box(0.62, 0.07, 0.46, 0x2f5d8a, 0.015), 0, 0.035, 0);
  at(logbook, box(0.58, 0.06, 0.42, 0x8b3a2b, 0.015), 0.02, 0.1, -0.01).rotation.y = 0.12;
  at(logbook, box(0.7, 0.03, 0.48, 0x2a2f36, 0.01), 0, 0.145, 0);
  const pages = at(logbook, plane(0.66, 0.44, logTex), 0, 0.162, 0); pages.rotation.x = -Math.PI / 2; pages.receiveShadow = true;
  const pencil = at(logbook, cyl(0.012, 0.012, 0.42, 0xffc23d, 6), 0.08, 0.175, 0.05); pencil.rotation.z = Math.PI / 2; pencil.rotation.y = 0.5;
  register(logbook, "experience", "Logbook — Experience", { pos: [2.6, 2.75, 0.9], target: [3.05, 1.6, -1.42] });

  // ── wall: pegboard (Skills) ──
  const peg = new THREE.Group(); peg.position.set(-3.7, 3.4, BACK + 0.04); root.add(peg);
  at(peg, box(2.5, 1.8, 0.05, 0x8a6b4a, 0.01), 0, 0, 0);
  at(peg, plane(2.42, 1.72, pegboardTex()), 0, 0, 0.03);
  // wrench
  const wrench = new THREE.Group(); at(peg, wrench, -0.85, 0.05, 0.08); wrench.rotation.z = 0.15;
  at(wrench, box(0.08, 0.9, 0.03, C.metal, 0.01, { metalness: 0.7, roughness: 0.35 }), 0, 0, 0);
  at(wrench, new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.035, 8, 20, Math.PI * 1.5), mat(C.metal, { metalness: 0.7, roughness: 0.35 })), 0, 0.5, 0).rotation.z = -Math.PI * 0.25;
  // screwdrivers
  [[-0.45, 0xff7a3d], [-0.25, 0x37c3b2], [-0.05, 0xffc23d]].forEach(([x, c]) => {
    at(peg, box(0.1, 0.36, 0.08, c, 0.04), x, 0.35, 0.09);
    at(peg, cyl(0.015, 0.015, 0.45, C.metal, 8, { metalness: 0.8, roughness: 0.3 }), x, -0.05, 0.09);
  });
  // pliers
  const pliers = new THREE.Group(); at(peg, pliers, 0.35, 0.1, 0.09);
  const pa = at(pliers, box(0.05, 0.7, 0.03, 0xd33a2c, 0.02), -0.05, 0, 0); pa.rotation.z = 0.12;
  const pb = at(pliers, box(0.05, 0.7, 0.03, 0xd33a2c, 0.02), 0.05, 0, 0); pb.rotation.z = -0.12;
  // solder spool + calipers
  const spool = at(peg, cyl(0.2, 0.2, 0.12, 0x6e7680, 24), 0.85, 0.45, 0.1); spool.rotation.x = Math.PI / 2;
  at(peg, cyl(0.12, 0.12, 0.13, 0xc9ccd1, 24), 0.85, 0.45, 0.1).rotation.x = Math.PI / 2;
  at(peg, box(0.6, 0.06, 0.03, C.metal, 0.01, { metalness: 0.7, roughness: 0.3 }), 0.75, -0.3, 0.08);
  at(peg, box(0.06, 0.25, 0.03, C.metal, 0.01, { metalness: 0.7, roughness: 0.3 }), 0.5, -0.42, 0.08);
  // hanging multimeter
  at(peg, box(0.32, 0.5, 0.08, 0xffc23d, 0.04), 0.2, -0.5, 0.09);
  at(peg, box(0.24, 0.14, 0.02, 0x2b3038, 0.01), 0.2, -0.38, 0.14);
  register(peg, "skills", "Tool wall — Skills", { pos: [-2.7, 3.4, 3.2], target: [-2.85, 3.3, BACK] });

  // ── wall: resume clipboard ──
  const clip = new THREE.Group(); clip.position.set(-1.55, 3.55, BACK + 0.04); clip.rotation.z = 0.04; root.add(clip);
  at(clip, box(0.95, 1.25, 0.04, 0x9b7448, 0.02), 0, 0, 0);
  at(clip, plane(0.82, 1.08, resumeTex()), 0, -0.05, 0.03);
  at(clip, box(0.36, 0.1, 0.06, C.metal, 0.02, { metalness: 0.7, roughness: 0.35 }), 0, 0.58, 0.04);
  register(clip, "resume", "Resume", { pos: [-0.9, 3.45, 2.4], target: [-0.95, 3.45, BACK] });

  // ── wall: blueprint (decor) & whiteboard (decor) ──
  const bp = at(root, plane(2.0, 1.25, blueprintTex()), 0.35, 3.65, BACK + 0.02); bp.receiveShadow = true;
  for (const [x, y] of [[-0.6, 4.22], [1.3, 4.22], [-0.6, 3.08], [1.3, 3.08]]) at(root, box(0.16, 0.05, 0.01, 0xf1e5b3, 0), 0.35 + (x - 0.35) * 1.02, y, BACK + 0.03).rotation.z = 0.5;
  const wb = new THREE.Group(); wb.position.set(4.8, 3.65, BACK + 0.04); root.add(wb);
  at(wb, box(1.9, 1.25, 0.05, 0xdfe3e7, 0.02), 0, 0, 0);
  at(wb, plane(1.8, 1.15, whiteboardTex()), 0, 0, 0.03);
  at(wb, box(1.4, 0.04, 0.12, 0xdfe3e7, 0.01), 0, -0.66, 0.06);

  // ── window ──
  const win = new THREE.Group(); win.position.set(2.65, 3.7, BACK + 0.02); root.add(win);
  at(win, plane(1.7, 1.52, windowTex(), { emissive: 0xffffff, emissiveMap: null }), 0, 0, 0).material = new THREE.MeshBasicMaterial({ map: windowTex(), toneMapped: false });
  at(win, box(1.86, 0.09, 0.12, C.trim, 0.02), 0, 0.8, 0.04);
  at(win, box(1.96, 0.1, 0.22, C.trim, 0.02), 0, -0.8, 0.08);
  at(win, box(0.09, 1.6, 0.12, C.trim, 0.02), -0.89, 0, 0.04);
  at(win, box(0.09, 1.6, 0.12, C.trim, 0.02), 0.89, 0, 0.04);
  at(win, box(0.05, 1.52, 0.06, C.trim, 0.01), 0, 0, 0.03);
  at(win, box(1.7, 0.05, 0.06, C.trim, 0.01), 0, 0, 0.03);
  // little cactus on sill
  at(win, cyl(0.09, 0.07, 0.14, C.orange), 0.55, -0.68, 0.12);
  at(win, cyl(0.05, 0.05, 0.2, 0x5f9e6e, 12), 0.55, -0.52, 0.12);

  // ── string lights ──
  const bulbs = [];
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffd8a0 });
  for (let i = 0; i <= 26; i++) {
    const t = i / 26, x = -6.6 + t * 13.2, y = 5.05 - Math.sin(t * Math.PI * 3) ** 2 * 0.3;
    bulbs.push(at(root, new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), bulbMat.clone()), x, y, BACK + 0.08));
  }
  const strPts = []; for (let i = 0; i <= 120; i++) { const t = i / 120; strPts.push([-6.6 + t * 13.2, 5.1 - Math.sin(t * Math.PI * 3) ** 2 * 0.3, BACK + 0.06]); }
  root.add(wire(strPts, 0x2a2f36, 0.008));
  const glow = new THREE.PointLight(0xffc98a, 3, 8, 2); glow.position.set(0, 4.7, -2.3); root.add(glow);

  // ── shelf with parts bins (right) ──
  const shelf = new THREE.Group(); shelf.position.set(5.0, 2.35, BACK + 0.25); root.add(shelf);
  at(shelf, box(1.9, 0.06, 0.45, C.desk, 0.01), 0, 0, 0);
  [[-0.65, 0x37c3b2], [-0.2, C.orange], [0.25, 0xffc23d], [0.65, 0x8fa3a0]].forEach(([x, c]) => at(shelf, box(0.38, 0.28, 0.36, c, 0.03), x, 0.17, 0));

  // ── battle bot test box (floor, right) ──
  const bb = new THREE.Group(); bb.position.set(3.55, 0, 0.55); bb.rotation.y = -0.5; root.add(bb);
  at(bb, box(2.2, 0.12, 1.6, 0x2b3038, 0.02), 0, 0.06, 0);
  at(bb, box(2.08, 0.01, 1.48, mat(0xd2b27a, { roughness: 0.95 }), 0), 0, 0.125, 0);
  const caution = cautionTex(); caution.repeat.set(6, 1);
  for (const [w, x, z, ry] of [[2.2, 0, 0.81, 0], [2.2, 0, -0.81, Math.PI], [1.6, 1.11, 0, Math.PI / 2], [1.6, -1.11, 0, -Math.PI / 2]]) {
    const s = at(bb, new THREE.Mesh(new THREE.PlaneGeometry(w, 0.1), new THREE.MeshStandardMaterial({ map: caution, roughness: 0.8 })), x, 0.06, z); s.rotation.y = ry;
  }
  const glass = new THREE.MeshStandardMaterial({ color: 0xdff4ff, transparent: true, opacity: 0.16, roughness: 0.05, metalness: 0.1, depthWrite: false });
  for (const [w, h, x, z, ry] of [[2.2, 0.9, 0, 0.8, 0], [2.2, 0.9, 0, -0.8, 0], [1.6, 0.9, 1.1, 0, Math.PI / 2], [1.6, 0.9, -1.1, 0, Math.PI / 2]]) {
    const p = at(bb, new THREE.Mesh(new THREE.PlaneGeometry(w, h), glass), x, 0.12 + h / 2, z); p.rotation.y = ry;
  }
  for (const [x, z] of [[-1.1, -0.8], [1.1, -0.8], [-1.1, 0.8], [1.1, 0.8]]) at(bb, box(0.05, 0.95, 0.05, C.darkMetal, 0.01), x, 0.57, z);
  for (const z of [-0.8, 0.8]) at(bb, box(2.25, 0.04, 0.04, C.darkMetal, 0.01), 0, 1.05, z);
  for (const x of [-1.1, 1.1]) at(bb, box(0.04, 0.04, 1.65, C.darkMetal, 0.01), x, 1.05, 0);
  // the bot: Batmobile — black two-part chassis, 4 forks, foam wheels, vertical spinner
  const bot = at(bb, new THREE.Group(), 0.05, 0.12, -0.05); bot.rotation.y = 0.85;
  const blk = mat(0x1c1e22, { roughness: 0.6 });
  at(bot, box(0.42, 0.17, 0.46, blk, 0.02), -0.33, 0.12, 0);
  at(bot, box(0.42, 0.17, 0.46, blk, 0.02), 0.33, 0.12, 0);
  at(bot, box(1.08, 0.025, 0.46, mat(0x111316), 0.01), 0, 0.215, -0.02);
  // top-plate cutouts (lighter recess)
  for (const x of [-0.33, 0.33]) at(bot, box(0.24, 0.01, 0.2, mat(0x3a3e46), 0.005), x, 0.23, -0.04);
  // forks
  for (const x of [-0.5, -0.16, 0.16, 0.5]) {
    const fs = new THREE.Shape(); fs.moveTo(0, 0); fs.lineTo(0.34, 0); fs.lineTo(0, 0.12); fs.lineTo(0, 0);
    const f = shadow(new THREE.Mesh(new THREE.ExtrudeGeometry(fs, { depth: 0.05, bevelEnabled: false }), blk));
    at(bot, f, x - 0.025, 0.04, 0.23); f.rotation.y = -Math.PI / 2;
  }
  // foam wheels on the ends
  for (const x of [-0.6, 0.6]) {
    const w = at(bot, cyl(0.13, 0.13, 0.1, 0xefe3cf, 24), x, 0.13, -0.05); w.rotation.z = Math.PI / 2;
    const hub = at(bot, cyl(0.06, 0.06, 0.105, 0x1c1e22, 12), x, 0.13, -0.05); hub.rotation.z = Math.PI / 2;
  }
  // weapon motor between the halves + vertical spinner
  const wm = at(bot, cyl(0.07, 0.07, 0.2, 0x2a2e35, 16), 0, 0.15, -0.08); wm.rotation.z = Math.PI / 2;
  const spinner = at(bot, new THREE.Group(), 0, 0.2, 0.12);
  const ws = new THREE.Shape();
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2, ph = a % Math.PI;
    const r = 0.11 + 0.1 * Math.max(0, 1 - ph / 1.1);
    const P = [Math.cos(a) * r, Math.sin(a) * r]; i === 0 ? ws.moveTo(...P) : ws.lineTo(...P);
  }
  const wGeo = new THREE.ExtrudeGeometry(ws, { depth: 0.035, bevelEnabled: false }); wGeo.center();
  const weapon = shadow(new THREE.Mesh(wGeo, mat(0x2b2b2e, { metalness: 0.5, roughness: 0.4 })));
  weapon.rotation.y = Math.PI / 2; spinner.add(weapon);
  for (const sgn of [-1, 1]) { const tooth = at(spinner, box(0.04, 0.05, 0.02, 0x2f6fe0, 0.005), 0, 0.2 * sgn, 0.02 * sgn); void tooth; }
  // sign
  const sign = at(bb, plane(0.6, 0.37, signTex(["4TH", "WATBOTS 2026"])), -0.75, 0.75, 0.82); sign.material.side = THREE.DoubleSide;
  register(bb, "combat", "Batmobile — Combat Robotics", { pos: [2.7, 2.5, 4.4], target: [3.55, 0.6, 0.55] });

  // ── scrappy suit-in-progress (back-left corner, deliberately minor) ──
  const suit = new THREE.Group(); suit.position.set(-5.3, 0, -2.0); suit.rotation.y = 0.55; root.add(suit);
  const frameM = mat(0x6f767e, { metalness: 0.6, roughness: 0.5 });
  at(suit, cyl(0.4, 0.45, 0.06, C.ink, 24), 0, 0.03, 0);
  at(suit, cyl(0.035, 0.035, 2.1, frameM, 10), 0, 1.08, 0);
  // spine + ribs
  at(suit, cyl(0.03, 0.03, 0.9, frameM, 8), 0, 2.4, -0.06);
  for (let i = 0; i < 4; i++) {
    const rib = at(suit, new THREE.Mesh(new THREE.TorusGeometry(0.26 - i * 0.02, 0.016, 6, 24, Math.PI * 1.25), frameM), 0, 2.15 + i * 0.16, -0.02);
    rib.rotation.x = Math.PI / 2; rib.rotation.z = -Math.PI * 0.12; rib.scale.set(1.15, 0.8, 1); rib.castShadow = true;
  }
  at(suit, cyl(0.025, 0.025, 0.85, frameM, 8), 0, 2.8, 0).rotation.z = Math.PI / 2;
  // half chest plate (primer)
  const plate = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.25, 0.42, 20, 1, true, -0.2, 1.4), mat(C.primer, { side: THREE.DoubleSide, roughness: 0.85 })));
  at(suit, plate, 0, 2.55, 0); plate.rotation.y = 0.6;
  // one shoulder pauldron
  const paul = shadow(new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat(C.gunmetal, { metalness: 0.5, roughness: 0.5 })));
  at(suit, paul, -0.43, 2.82, 0);
  // skeletal left arm only
  at(suit, sph(0.05, frameM), -0.43, 2.78, 0);
  const ua = at(suit, cyl(0.025, 0.025, 0.5, frameM, 8), -0.47, 2.52, 0.02); ua.rotation.z = 0.12;
  at(suit, sph(0.04, frameM), -0.5, 2.26, 0.03);
  const fa = at(suit, cyl(0.022, 0.022, 0.45, frameM, 8), -0.5, 2.02, 0.12); fa.rotation.x = 0.4;
  at(suit, box(0.12, 0.06, 0.16, C.gunmetal, 0.02), -0.5, 1.8, 0.2);
  // right side: bare bracket + dangling wires
  at(suit, box(0.1, 0.06, 0.06, frameM, 0.01), 0.42, 2.8, 0);
  at(suit, wire([[0.4, 2.78, 0], [0.48, 2.5, 0.05], [0.42, 2.25, 0.02]], 0xd33a2c, 0.01));
  at(suit, wire([[0.36, 2.78, 0.02], [0.4, 2.45, 0.08], [0.33, 2.2, 0.1]], 0x222222, 0.01));
  // hip ring + one thigh strut
  const hip = at(suit, new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.02, 6, 24), frameM), 0, 1.95, 0); hip.rotation.x = Math.PI / 2; hip.scale.set(1.2, 0.85, 1);
  at(suit, cyl(0.025, 0.025, 0.6, frameM, 8), -0.14, 1.65, 0);
  // unfinished helmet shell on the floor
  const helm = shadow(new THREE.Mesh(new THREE.SphereGeometry(0.19, 20, 12, 0.9, Math.PI * 1.45, 0, Math.PI * 0.62), mat(C.primer, { side: THREE.DoubleSide, roughness: 0.85 })));
  at(suit, helm, 0.6, 0.17, 0.35); helm.rotation.set(-0.25, 0.4, 0);
  at(suit, box(0.22, 0.03, 0.05, C.gunmetal, 0.01), 0.6, 0.06, 0.52).rotation.y = 0.4;
  // tag
  const tag = at(suit, plane(0.28, 0.18, signTex(["MK-0", "8% done"], "#f4ede2", "#2a2f36")), 0.05, 2.0, 0.3); tag.material.side = THREE.DoubleSide; tag.rotation.z = -0.15;
  register(suit, "suit", "Side quest — 8% complete", null);

  // ── the droid: SD-01 (About) ──
  const droid = new THREE.Group(); root.add(droid);
  const D_Y = DESK_Y, D_Z = -1.35;
  droid.position.set(-1.4, D_Y, D_Z); droid.scale.setScalar(1.35);
  const body = at(droid, new THREE.Group(), 0, 0, 0);
  // treads
  for (const z of [-0.17, 0.17]) {
    at(body, box(0.42, 0.13, 0.11, 0x2a2f36, 0.05), 0, 0.075, z);
    for (const x of [-0.14, 0, 0.14]) { const w = at(body, cyl(0.045, 0.045, 0.115, 0x5d646c, 12), x, 0.075, z); w.rotation.x = Math.PI / 2; }
  }
  // torso
  const torso = at(body, new THREE.Group(), 0, 0.15, 0);
  at(torso, box(0.42, 0.36, 0.38, C.cream, 0.08), 0, 0.2, 0);
  at(torso, box(0.43, 0.08, 0.39, C.orange, 0.03), 0, 0.12, 0);
  at(torso, box(0.04, 0.12, 0.2, 0x2a2f36, 0.015), 0.21, 0.26, 0);
  const chestLed = at(torso, sph(0.018, mat(C.teal, { emissive: C.teal, emissiveIntensity: 2 })), 0.225, 0.3, 0.05);
  // arms
  for (const z of [-0.22, 0.22]) {
    const a = at(torso, new THREE.Group(), 0, 0.27, z);
    at(a, sph(0.04, 0x5d646c), 0, 0, 0);
    const lower = at(a, box(0.06, 0.18, 0.05, C.cream, 0.025), 0.03, -0.09, 0); lower.rotation.z = 0.35;
    at(a, box(0.07, 0.03, 0.06, C.orange, 0.01), 0.06, -0.18, 0);
  }
  // neck + head
  at(torso, cyl(0.04, 0.05, 0.08, 0x5d646c, 12), 0, 0.42, 0);
  const head = at(torso, new THREE.Group(), 0, 0.55, 0);
  at(head, box(0.34, 0.24, 0.36, C.cream, 0.07), 0, 0, 0);
  at(head, box(0.02, 0.17, 0.27, 0x0f1418, 0.03), 0.17, 0, 0);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x5ff2df, toneMapped: false });
  const eyes = [-0.06, 0.06].map(z => at(head, new THREE.Mesh(new RoundedBoxGeometry(0.01, 0.07, 0.045, 2, 0.008), eyeMat), 0.185, 0.005, z));
  // ear discs + antenna
  for (const z of [-0.19, 0.19]) { const e = at(head, cyl(0.06, 0.06, 0.03, C.orange, 16), 0, 0, z); e.rotation.x = Math.PI / 2; }
  at(head, cyl(0.008, 0.008, 0.18, 0x5d646c, 6), -0.06, 0.2, 0.06);
  const antTip = at(head, sph(0.025, new THREE.MeshBasicMaterial({ color: 0xff7a3d })), -0.06, 0.3, 0.06);
  register(droid, "about", "SD-01 — say hi", { pos: [-0.35, 2.4, 1.7], target: [-0.75, 2.0, -1.35] });

  // ── dust motes ──
  const dustGeo = new THREE.BufferGeometry(); const N = 140; const dp = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { dp[i * 3] = (Math.random() - 0.5) * 12; dp[i * 3 + 1] = Math.random() * 5.5; dp[i * 3 + 2] = -2.8 + Math.random() * 6; }
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.025, transparent: true, opacity: 0.55, depthWrite: false }));
  root.add(dust);

  // ─────────────────────────────────────────────────────────
  //  interaction
  // ─────────────────────────────────────────────────────────
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(9, 9);
  const pointerSmooth = new THREE.Vector2();
  let hovered = null, focused = null, enabled = true;

  const camTarget = HOME.target.clone();
  const tween = { active: false, t: 0, dur: 1.1, fromPos: new THREE.Vector3(), toPos: new THREE.Vector3(), fromTgt: new THREE.Vector3(), toTgt: new THREE.Vector3() };
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  function flyTo(pos, tgt, dur = 1.1) {
    tween.fromPos.copy(camera.position); tween.fromTgt.copy(camTarget);
    tween.toPos.copy(pos); tween.toTgt.copy(tgt); tween.t = 0; tween.dur = dur; tween.active = true;
  }

  function setHighlight(group, on) {
    group.traverse(o => {
      if (!o.isMesh || !o.material.emissive || !o.userData.baseEmissive) return;
      if (on) { o.material.emissive.setHex(0xff9a5c); o.material.emissiveIntensity = 0.28; }
      else { o.material.emissive.copy(o.userData.baseEmissive); o.material.emissiveIntensity = o.userData.baseEI; }
    });
  }
  function pick() {
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(interactables, true);
    for (const h of hits) { let o = h.object; while (o && !o.userData.interactive) o = o.parent; if (o) return o; }
    return null;
  }

  const el = renderer.domElement;
  let lastClient = { x: 0, y: 0 };
  el.addEventListener("pointermove", e => {
    const r = el.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    lastClient = { x: e.clientX, y: e.clientY };
  });
  el.addEventListener("pointerleave", () => { pointer.set(9, 9); });
  el.addEventListener("click", e => {
    if (!enabled) return;
    const r = el.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    const g = pick(); if (!g) return;
    const { id } = g.userData.interactive;
    if (id === "about") hop = 1;
    onSelect && onSelect(id);
  });

  function focus(id) {
    const g = interactables.find(o => o.userData.interactive.id === id);
    if (!g || !g.userData.interactive.focus) return;
    focused = g;
    const f = g.userData.interactive.focus;
    flyTo(new THREE.Vector3(...f.pos), new THREE.Vector3(...f.target));
  }
  function reset() { focused = null; flyTo(fitHome(), HOME.target); }

  // keep the room framed on any aspect ratio
  function fitHome() {
    const a = camera.aspect, p = HOME.pos.clone();
    if (a < 1.6) p.z += (1.6 - a) * 6.5;
    return p;
  }
  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    if (!focused && !tween.active) camera.position.copy(fitHome());
  }
  window.addEventListener("resize", resize); resize();

  // ─────────────────────────────────────────────────────────
  //  loop
  // ─────────────────────────────────────────────────────────
  const clock = new THREE.Clock();
  let hop = 0, droidDir = 1, droidPause = 0, blinkT = 2;
  const tmpV = new THREE.Vector3(), lookPt = new THREE.Vector3();
  const headWorld = new THREE.Vector3();

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;

    // hover
    const g = enabled && !tween.active ? pick() : null;
    if (g !== hovered) {
      if (hovered) setHighlight(hovered, false);
      hovered = g; if (hovered) setHighlight(hovered, true);
      el.style.cursor = hovered ? "pointer" : "default";
      onHover && onHover(hovered ? hovered.userData.interactive : null, lastClient);
    } else if (hovered && onHover) onHover(hovered.userData.interactive, lastClient);

    // camera: tween or gentle parallax
    pointerSmooth.lerp(Math.abs(pointer.x) > 2 ? new THREE.Vector2(0, 0) : pointer, 0.04);
    if (tween.active) {
      tween.t = Math.min(1, tween.t + dt / tween.dur); const k = ease(tween.t);
      camera.position.lerpVectors(tween.fromPos, tween.toPos, k); camTarget.lerpVectors(tween.fromTgt, tween.toTgt, k);
      if (tween.t >= 1) tween.active = false;
    } else if (!focused) {
      const base = fitHome();
      camera.position.x += (base.x + pointerSmooth.x * 0.7 - camera.position.x) * 0.06;
      camera.position.y += (base.y + pointerSmooth.y * 0.35 - camera.position.y) * 0.06;
      camera.position.z += (base.z - camera.position.z) * 0.06;
    }
    camera.lookAt(camTarget);

    // droid behaviour
    const droidHovered = hovered === droid;
    if (!droidHovered && focused !== droid) {
      if (droidPause > 0) droidPause -= dt;
      else {
        droid.position.x += droidDir * dt * 0.28;
        if (droid.position.x > -0.95) { droidDir = -1; droidPause = 1.5 + Math.random() * 2; }
        if (droid.position.x < -1.9) { droidDir = 1; droidPause = 1.5 + Math.random() * 2; }
      }
    }
    const moving = droidPause <= 0 && !droidHovered && focused !== droid;
    const wantYaw = droidHovered || focused === droid ? -Math.PI / 2 + 0.2 : (moving ? (droidDir > 0 ? 0 : -Math.PI) : -Math.PI / 2 + 0.35);
    droid.rotation.y += (wantYaw - droid.rotation.y) * 0.08;
    torso.position.y = 0.15 + (moving ? Math.abs(Math.sin(t * 10)) * 0.012 : Math.sin(t * 2) * 0.006);
    if (hop > 0) { hop = Math.max(0, hop - dt * 1.6); body.position.y = Math.sin((1 - hop) * Math.PI) * 0.22; torso.rotation.z = Math.sin((1 - hop) * Math.PI * 2) * 0.12; }
    // head tracks the cursor (projected into the room)
    raycaster.setFromCamera(Math.abs(pointer.x) > 2 ? new THREE.Vector2(0, 0) : pointer, camera);
    lookPt.copy(raycaster.ray.origin).addScaledVector(raycaster.ray.direction, 9);
    head.getWorldPosition(headWorld);
    tmpV.copy(lookPt); droid.worldToLocal(tmpV); tmpV.sub(head.position).sub(torso.position);
    const yaw = THREE.MathUtils.clamp(Math.atan2(-tmpV.z, tmpV.x), -1.0, 1.0);
    const pitch = THREE.MathUtils.clamp(Math.atan2(tmpV.y, Math.hypot(tmpV.x, tmpV.z)), -0.4, 0.5);
    head.rotation.y += (yaw - head.rotation.y) * 0.1;
    head.rotation.z += (pitch - head.rotation.z) * 0.1;
    // eyes: blink + happy squint on hover
    blinkT -= dt; let eyeY = droidHovered ? 0.45 : 1;
    if (blinkT < 0) { eyeY = 0.1; if (blinkT < -0.12) blinkT = 2 + Math.random() * 3; }
    eyes.forEach(e => { e.scale.y += (eyeY - e.scale.y) * 0.4; });
    antTip.material.color.setHex(Math.sin(t * 3) > 0.6 ? 0xffb38a : 0xff7a3d);
    chestLed.material.emissiveIntensity = 1 + Math.sin(t * 4) * 0.8;

    // trash bot arm idle (stronger when hovered)
    const ab = hovered === trashBot ? 1 : 0.4;
    armBase.rotation.y = Math.sin(t * 0.7) * 0.5 * ab;
    shoulder.rotation.z = 0.35 + Math.sin(t * 0.9) * 0.25 * ab;
    elbow.rotation.z = -0.9 + Math.sin(t * 0.9 + 1) * 0.3 * ab;
    const grip = (Math.sin(t * 1.8) + 1) * 0.5 * ab;
    fingerA.position.z = 0.03 + grip * 0.03; fingerB.position.z = -0.03 - grip * 0.03;
    led.material.emissiveIntensity = Math.sin(t * 6) > 0 ? 2.5 : 0.3;

    // tinyml leds: "inference" sweep
    tinyLeds.forEach((l, i) => { const s = (Math.sin(t * 5 - i * 0.8) + 1) / 2; l.material.emissiveIntensity = 0.15 + s * s * (hovered === tiny ? 4 : 2); });

    // battle bot spinner
    spinner.rotation.x -= dt * (hovered === bb || focused === bb ? 28 : 1.5);

    // string lights twinkle
    bulbs.forEach((b, i) => { const s = 0.75 + 0.25 * Math.sin(t * 1.5 + i * 1.7); b.material.color.setRGB(1 * s, 0.85 * s, 0.62 * s); });

    // dust drift
    const pa = dust.geometry.attributes.position;
    for (let i = 0; i < N; i++) { let y = pa.getY(i) + dt * 0.04; if (y > 5.6) y = 0.2; pa.setY(i, y); pa.setX(i, pa.getX(i) + Math.sin(t * 0.3 + i) * dt * 0.02); }
    pa.needsUpdate = true;

    term.update(t);
    renderer.render(scene, camera);
  }

  // first frame, then ready
  renderer.setAnimationLoop(frame);
  requestAnimationFrame(() => onReady && onReady());

  return {
    focus, reset,
    setEnabled(v) { enabled = v; if (!v && hovered) { setHighlight(hovered, false); hovered = null; el.style.cursor = "default"; onHover && onHover(null); } },
    pause() { renderer.setAnimationLoop(null); },
    resume() { clock.getDelta(); renderer.setAnimationLoop(frame); },
    droidScreenPos() {
      head.getWorldPosition(headWorld); headWorld.y += 0.35; headWorld.project(camera);
      const r = el.getBoundingClientRect();
      return { x: r.left + (headWorld.x + 1) / 2 * r.width, y: r.top + (1 - headWorld.y) / 2 * r.height };
    },
    hop() { hop = 1; }
  };
}
