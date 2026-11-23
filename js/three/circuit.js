// LEVEL 2 · 1 mm — the circuit board (embedded work)
import { THREE, P, hex, mat, shadow, box, cyl, sph, at, canvasTex, glow, MONO, SANS, particles, buildDroid } from "./lib.js";

export function buildCircuit({ root, register }) {
  root.add(new THREE.HemisphereLight(0xd6def5, 0x2a2f45, 1.0));
  const key = new THREE.DirectionalLight(0xf3e6f0, 1.3); key.position.set(-6, 10, 6); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -14, right: 14, top: 10, bottom: -10, near: 1, far: 40 }); root.add(key);
  const rim = new THREE.PointLight(0xd49aae, 8, 20, 2); rim.position.set(6, 4, -6); root.add(rim);

  // board with traces drawn into a texture
  const traces = [];
  const BW = 34, BD = 22;
  const boardTex = canvasTex(2048, 1324, (g, w, h) => {
    g.fillStyle = "#2b3656"; g.fillRect(0, 0, w, h);
    const sx = w / BW, sz = h / BD;
    const toPx = ([x, z]) => [(x + BW / 2) * sx, (z + BD / 2) * sz];
    const path = (pts, col, wdt) => { g.strokeStyle = col; g.lineWidth = wdt; g.lineJoin = "round"; g.beginPath(); pts.map(toPx).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); };
    const rnd = (a, b) => a + Math.random() * (b - a);
    for (let i = 0; i < 70; i++) {
      let x = rnd(-16, 16), z = rnd(-10, 10); const pts = [[x, z]];
      for (let k = 0; k < 4; k++) { if (k % 2) x += rnd(-6, 6); else z += rnd(-4, 4); pts.push([x, z]); }
      const col = Math.random() < 0.5 ? "rgba(212,154,174,.55)" : "rgba(159,178,209,.5)";
      path(pts, col, rnd(4, 10));
      if (i < 14) traces.push(pts);
      pts.forEach(p => { const [px, py] = toPx(p); g.fillStyle = "rgba(230,214,168,.55)"; g.beginPath(); g.arc(px, py, 9, 0, 7); g.fill(); g.fillStyle = "#2b3656"; g.beginPath(); g.arc(px, py, 4, 0, 7); g.fill(); });
    }
    g.fillStyle = "rgba(238,235,242,.35)"; g.font = `bold 46px ${MONO}`;
    g.fillText("SD-01 MAIN  REV C", 120, h - 80); g.fillText("Made in a messy workshop", w - 820, 110);
  });
  const board = shadow(new THREE.Mesh(new THREE.BoxGeometry(BW, 0.4, BD), [mat(0x23304d), mat(0x23304d), new THREE.MeshStandardMaterial({ map: boardTex, roughness: 0.55, metalness: 0.1 }), mat(0x23304d), mat(0x23304d), mat(0x23304d)]), false, true);
  board.position.y = -0.2; root.add(board);

  // signal pulses travelling along a few traces
  const pulses = traces.map(pts => {
    const curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, 0.03, z)), false, "catmullrom", 0);
    const s = at(root, new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), glow(Math.random() < 0.5 ? P.rose : 0xb6c8ec)));
    return { curve, s, off: Math.random(), speed: 0.06 + Math.random() * 0.08 };
  });

  // scattered SMD parts
  for (let i = 0; i < 40; i++) {
    const x = (Math.random() - 0.5) * 30, z = (Math.random() - 0.5) * 18;
    if (Math.hypot(x + 4, z + 1) < 4 || Math.hypot(x - 4.5, z - 1.5) < 3.2 || Math.hypot(x - 0.5, z + 5) < 3.5) continue;
    if (Math.random() < 0.55) { const r = at(root, box(0.6, 0.18, 0.3, P.ink, 0.02), x, 0.09, z); r.rotation.y = Math.random() < 0.5 ? 0 : Math.PI / 2; for (const s of [-1, 1]) at(r, box(0.12, 0.2, 0.31, P.metal, 0.01, { metalness: 0.8, roughness: 0.3 }), s * 0.26, 0, 0); }
    else at(root, cyl(0.25, 0.25, 0.45, [P.slate, P.mauve, 0x8c7f9e][i % 3], 20), x, 0.22, z);
  }

  // ── MCU + floating 2-4-3 neural net (TinyML) ──
  const mcu = new THREE.Group(); mcu.position.set(-4, 0, -1); root.add(mcu);
  at(mcu, box(3, 0.4, 3, 0x1d2235, 0.05), 0, 0.2, 0);
  for (let i = 0; i < 12; i++) for (const s of [0, 1, 2, 3]) {
    const o = -1.32 + i * 0.24, pin = box(0.1, 0.06, 0.4, P.metal, 0.01, { metalness: 0.85, roughness: 0.25 });
    const [x, z, ry] = [[o, 1.65, 0], [o, -1.65, 0], [1.65, o, Math.PI / 2], [-1.65, o, Math.PI / 2]][s]; at(mcu, pin, x, 0.05, z).rotation.y = ry;
  }
  const lbl = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), new THREE.MeshStandardMaterial({ transparent: true, map: canvasTex(512, 512, (g) => {
    g.fillStyle = "rgba(220,228,239,.75)"; g.font = `600 52px ${SANS}`; g.fillText("ATmega328P", 40, 230); g.font = `30px ${MONO}`; g.fillText("2 KB SRAM", 40, 290); g.fillText("2-4-3 NN onboard", 40, 340);
    g.beginPath(); g.arc(60, 70, 18, 0, 7); g.fill();
  }) }));
  lbl.rotation.x = -Math.PI / 2; at(mcu, lbl, 0, 0.41, 0);
  const net = at(mcu, new THREE.Group(), 0, 2.6, 0);
  const layers = [2, 4, 3], nodes = [];
  layers.forEach((n, li) => { const col = []; for (let k = 0; k < n; k++) { const nd = at(net, sph(0.2, mat(li === 1 ? P.rose : P.powder, { emissive: li === 1 ? P.rose : P.blue, emissiveIntensity: 0.4 })), (li - 1) * 1.5, (k - (n - 1) / 2) * 0.62, 0); col.push(nd); } nodes.push(col); });
  const edges = [];
  for (let li = 0; li < 2; li++) for (const a of nodes[li]) for (const b of nodes[li + 1]) {
    const g = new THREE.BufferGeometry().setFromPoints([a.position, b.position]);
    const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xc9d6ee, transparent: true, opacity: 0.35 })); net.add(l); edges.push({ l, li });
  }
  const netBeam = at(mcu, new THREE.Mesh(new THREE.CylinderGeometry(0.05, 1.3, 2.2, 32, 1, true), glow(P.powder, { transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false })), 0, 1.5, 0);
  register(mcu, "tinyml", "Neural net on an Arduino UNO", { pos: [-1.6, 5.2, 6.2], target: [-3.4, 1.6, -1] });

  // ── QC inspection: magnifier over solder joints (Microart co-op) ──
  const qc = new THREE.Group(); qc.position.set(4.5, 0, 1.5); root.add(qc);
  for (let i = 0; i < 5; i++) {
    const r = at(qc, box(0.7, 0.2, 0.35, P.ink, 0.02), -1.2 + i * 0.6, 0.1, 0); r.rotation.y = Math.PI / 2;
    for (const s of [-1, 1]) at(qc, sph(0.14, mat(i === 3 && s > 0 ? P.rose : 0xc9ccd6, { metalness: 0.8, roughness: 0.3 }), undefined, 16, 10), -1.2 + i * 0.6, 0.08, s * 0.33).scale.y = 0.55;
  }
  const defect = at(qc, new THREE.Mesh(new THREE.RingGeometry(0.22, 0.27, 32), glow(P.rose, { transparent: true, side: THREE.DoubleSide })), 0.6, 0.06, 0.33); defect.rotation.x = -Math.PI / 2;
  const mag = at(qc, new THREE.Group(), 0, 1.7, 0.2); mag.rotation.x = -0.9;
  at(mag, new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.09, 12, 48), mat(P.rose, { metalness: 0.3, roughness: 0.4 })), 0, 0, 0);
  at(mag, new THREE.Mesh(new THREE.CircleGeometry(1.08, 48), new THREE.MeshStandardMaterial({ color: 0xdfe8ff, transparent: true, opacity: 0.18, roughness: 0.05, metalness: 0.2, side: THREE.DoubleSide, depthWrite: false })), 0, 0, 0);
  at(mag, box(0.18, 1.5, 0.12, P.navy, 0.05), 0, -1.85, 0);
  register(qc, "experience", "QC inspection — Microart co-op", { pos: [6.2, 4.2, 6.2], target: [5.3, 0.6, 1.5] });

  // ── lab-on-a-chip: microfluidic channel + droplet reservoir (PORTAL to the cell) ──
  const loc = new THREE.Group(); loc.position.set(0.5, 0, -5); root.add(loc);
  at(loc, box(5.2, 0.35, 2.6, new THREE.MeshStandardMaterial({ color: 0xe3ecff, transparent: true, opacity: 0.35, roughness: 0.1, depthWrite: false }), 0.08), 0, 0.18, 0);
  const chPts = []; for (let i = 0; i <= 80; i++) { const t = i / 80; chPts.push(new THREE.Vector3(-2.2 + t * 3.4, 0.36, Math.sin(t * Math.PI * 5) * 0.75)); }
  const chCurve = new THREE.CatmullRomCurve3(chPts);
  at(loc, new THREE.Mesh(new THREE.TubeGeometry(chCurve, 160, 0.09, 8), new THREE.MeshStandardMaterial({ color: 0x9fb2d1, transparent: true, opacity: 0.55, roughness: 0.2 })));
  const drops = []; for (let i = 0; i < 6; i++) drops.push({ m: at(loc, sph(0.12, mat(P.rose, { emissive: P.rose, emissiveIntensity: 0.4, roughness: 0.2 }))), off: i / 6 });
  const res = at(loc, new THREE.Mesh(new THREE.SphereGeometry(0.85, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: P.blush, transparent: true, opacity: 0.55, roughness: 0.1, emissive: P.rose, emissiveIntensity: 0.15 })), 1.7, 0.35, 0);
  const cellsIn = []; for (let i = 0; i < 7; i++) cellsIn.push(at(loc, sph(0.1, mat(P.berry, { emissive: P.berry, emissiveIntensity: 0.3 })), 1.7 + (Math.random() - 0.5) * 0.9, 0.55, (Math.random() - 0.5) * 0.9));
  const resRing = at(loc, new THREE.Mesh(new THREE.RingGeometry(1.0, 1.06, 48), glow(P.rose, { transparent: true, opacity: 0.6, side: THREE.DoubleSide })), 1.7, 0.37, 0); resRing.rotation.x = -Math.PI / 2;
  const lbl2 = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.5), new THREE.MeshBasicMaterial({ transparent: true, map: canvasTex(512, 100, (g) => { g.fillStyle = "rgba(236,210,220,.9)"; g.font = `28px ${MONO}`; g.fillText("lab-on-a-chip · bio sensor", 10, 60); }) }));
  lbl2.rotation.x = -Math.PI / 2; at(loc, lbl2, -1.0, 0.37, 1.05);
  register(loc, "dive", "Zoom into the droplet ↓", null);

  // ── mini SD-01 riding the board ──
  const sd = buildDroid("rover"); const droid = sd.group; droid.scale.setScalar(2.4); droid.position.set(-0.6, 0, 2.6); droid.rotation.y = -Math.PI / 2 + 0.4; root.add(droid);
  register(droid, "about", "SD-01 (shrunk ×1000)", { pos: [0.6, 3.0, 7.5], target: [-0.2, 1.2, 2.6] });

  const motes = particles(160, [30, 6, 20], 0xc9d6ee, 0.12, 0.35); motes.position.y = 3; root.add(motes);

  return {
    key: "circuit", scale: "1 mm", title: "The circuit", sub: "embedded systems",
    bg: 0x1f2740, fog: [16, 40], exposure: 1.1, shadows: true,
    home: { pos: [0, 9.5, 13], target: [0, 0.6, -1.2] },
    portal: [2.2, 0.6, -5],
    droid: sd,
    update(t, dt, s) {
      pulses.forEach(p => { p.s.position.copy(p.curve.getPointAt((t * p.speed + p.off) % 1)); });
      const hotNet = s.hovered === mcu || s.focused === mcu;
      net.rotation.y = Math.sin(t * 0.4) * 0.5;
      nodes.forEach((col, li) => col.forEach((n, k) => { const ph = (t * 1.6 - li * 0.6 + k * 0.2) % 3; n.material.emissiveIntensity = 0.25 + Math.max(0, 1 - Math.abs(ph - 1)) * (hotNet ? 2.5 : 1.2); }));
      edges.forEach(e => { e.l.material.opacity = 0.2 + Math.max(0, Math.sin(t * 3 - e.li * 1.5)) * (hotNet ? 0.7 : 0.35); });
      netBeam.material.opacity = 0.05 + (hotNet ? 0.08 : 0) + Math.sin(t * 2) * 0.02;
      mag.position.x = Math.sin(t * 0.5) * 0.6 + 0.3; mag.position.z = 0.2 + Math.cos(t * 0.5) * 0.2;
      defect.material.opacity = 0.5 + Math.sin(t * 4) * 0.4;
      drops.forEach(d => { d.m.position.copy(chCurve.getPointAt((t * 0.08 + d.off) % 1)); });
      cellsIn.forEach((c, i) => { c.position.y = 0.55 + Math.sin(t * 1.5 + i) * 0.08; });
      resRing.material.opacity = 0.35 + Math.sin(t * 2.5) * 0.25 + (s.hovered === loc ? 0.3 : 0); resRing.scale.setScalar(1 + Math.sin(t * 2.5) * 0.04);
      sd.update(t, dt, { lookAt: s.lookPoint, happy: s.hovered === droid });
      const ma = motes.geometry.attributes.position; for (let i = 0; i < ma.count; i++) { let y = ma.getY(i) + dt * 0.1; if (y > 3) y = -3; ma.setY(i, y); } ma.needsUpdate = true;
    }
  };
}
