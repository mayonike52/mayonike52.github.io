// LEVEL 3 · 1 µm — inside a cell (bio engineering: where I'm headed)
import { THREE, P, mat, shadow, at, canvasTex, glow, particles, buildDroid, sph } from "./lib.js";

function lumpy(radius, detail, amp, seed = 1) {
  const g = new THREE.SphereGeometry(radius, 96, 64); const p = g.attributes.position; const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = Math.sin(v.x * 2.1 + seed) * Math.sin(v.y * 2.7 + seed * 2) * Math.sin(v.z * 1.9 + seed * 3); v.multiplyScalar(1 + n * amp); p.setXYZ(i, v.x, v.y, v.z); }
  g.computeVertexNormals(); return g;
}

export function buildCell({ root, register }) {
  root.add(new THREE.HemisphereLight(0xf6e3ec, 0x6c5a7a, 1.25));
  const key = new THREE.DirectionalLight(0xffeef4, 1.1); key.position.set(-4, 8, 6); root.add(key);
  const inner = new THREE.PointLight(0x9fb2e6, 10, 12, 2); inner.position.set(0, 1.2, -2.2); root.add(inner);

  // membrane: a huge inside-out sphere with a lipid-dot texture
  const memTex = canvasTex(1024, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#e9cfdb"); gr.addColorStop(1, "#cdb3cf"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? "212,154,174" : "159,178,209"},${0.15 + Math.random() * 0.25})`; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 1.5 + Math.random() * 3, 0, 7); g.fill(); }
  });
  const membrane = new THREE.Mesh(new THREE.SphereGeometry(22, 48, 32), new THREE.MeshStandardMaterial({ map: memTex, side: THREE.BackSide, roughness: 1 }));
  root.add(membrane);

  // nucleus (Bio panel) with pores and a soft inner glow
  const nucleus = new THREE.Group(); nucleus.position.set(0.4, 1.4, -3); root.add(nucleus);
  const nucMesh = shadow(new THREE.Mesh(lumpy(2.2, 5, 0.05, 2), new THREE.MeshPhysicalMaterial({ color: 0x7f97c4, roughness: 0.35, transmission: 0, clearcoat: 0.6, emissive: 0x3d4f84, emissiveIntensity: 0.25 })));
  nucleus.add(nucMesh);
  const nucleolus = at(nucleus, sph(0.7, mat(P.plum, { emissive: P.berry, emissiveIntensity: 0.3 })), 0.3, 0.2, 1.0);
  for (let i = 0; i < 70; i++) { const v = new THREE.Vector3().randomDirection().multiplyScalar(2.23); const pore = at(nucleus, new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.025, 6, 12), mat(P.powder)), v.x, v.y, v.z); pore.lookAt(v.clone().multiplyScalar(2)); }
  const halo = at(nucleus, new THREE.Mesh(new THREE.SphereGeometry(2.6, 32, 20), glow(P.powder, { transparent: true, opacity: 0.08, depthWrite: false })));
  register(nucleus, "bio", "Nucleus — where I'm headed: bio-robotics", { pos: [4.4, 2.6, 6.4], target: [2.4, 1.4, -3] });

  // ER ribbons wrapping the nucleus
  for (let k = 0; k < 4; k++) {
    const pts = []; for (let i = 0; i <= 60; i++) { const a = (i / 60) * Math.PI * 1.1 + k * 1.6, r = 2.55 + Math.sin(i * 0.8) * 0.12; pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(i * 0.35 + k) * 0.35 + (k - 1.5) * 0.55, Math.sin(a) * r)); }
    at(nucleus, shadow(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.055, 8), mat(P.mauve, { roughness: 0.5 }))));
  }

  // mitochondria with cristae stripes
  const cristae = canvasTex(256, 64, (g, w, h) => { g.fillStyle = "#d49aae"; g.fillRect(0, 0, w, h); g.strokeStyle = "#a96882"; g.lineWidth = 5; for (let x = 10; x < w; x += 22) { g.beginPath(); g.moveTo(x, 6); g.quadraticCurveTo(x + 10, h / 2, x, h - 6); g.stroke(); } });
  const mitos = [];
  const mitoGroup = new THREE.Group(); root.add(mitoGroup);
  [[-4.6, 0.6, -1.2], [4.8, 2.6, -1.8], [-3.4, 3.3, -4.5], [3.8, -0.5, 0.8], [-5.2, -1.2, 0.4]].forEach(([x, y, z], i) => {
    const m = at(mitoGroup, shadow(new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 1.2, 8, 20), new THREE.MeshStandardMaterial({ map: cristae, roughness: 0.5 }))), x, y, z);
    m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3); mitos.push({ m, ph: i * 1.3 });
  });
  register(mitoGroup, "deco-mito", "Mitochondria (yes, the powerhouse)", null);

  // vesicles + ribosomes
  const vesicles = [];
  for (let i = 0; i < 14; i++) vesicles.push({ m: at(root, new THREE.Mesh(new THREE.SphereGeometry(0.18 + Math.random() * 0.22, 20, 14), new THREE.MeshStandardMaterial({ color: Math.random() < 0.5 ? P.blush : P.powder, transparent: true, opacity: 0.55, roughness: 0.1 })), (Math.random() - 0.5) * 14, Math.random() * 4.2 - 1.5, (Math.random() - 0.5) * 8), ph: Math.random() * 6 });
  const ribo = particles(500, [18, 9, 12], 0x8b6a9a, 0.09, 0.55); ribo.material.blending = THREE.NormalBlending; ribo.position.set(0, 1.5, -1); root.add(ribo);

  // SD-01 as a nanobot
  const sd = buildDroid("nano"); const droid = sd.group; droid.position.set(-1.9, 0.9, 3.4); droid.rotation.y = -Math.PI / 2 + 0.6; droid.scale.setScalar(1.05); root.add(droid);
  register(droid, "about", "SD-01, nanobot mode", { pos: [-0.6, 1.6, 6.4], target: [-1.3, 1.2, 3.4] });

  return {
    key: "cell", scale: "1 µm", title: "Inside a cell", sub: "bio-robotics · next",
    bg: 0xdcc3d3, fog: [10, 30], exposure: 1.0, shadows: false,
    home: { pos: [0, 2.4, 9.5], target: [0, 1.4, -1.5] },
    portal: [0.4, 1.4, -0.9],
    droid: sd,
    update(t, dt, s) {
      nucMesh.rotation.y += dt * 0.05; nucleolus.position.y = 0.2 + Math.sin(t) * 0.05;
      halo.material.opacity = 0.06 + (s.hovered === nucleus ? 0.08 : 0) + Math.sin(t * 1.5) * 0.02;
      mitos.forEach(({ m, ph }) => { m.rotation.x += dt * 0.1; m.rotation.z += dt * 0.07; m.position.y += Math.sin(t * 0.6 + ph) * dt * 0.08; });
      vesicles.forEach(v => { v.m.position.x += Math.sin(t * 0.3 + v.ph) * dt * 0.12; v.m.position.y += Math.cos(t * 0.4 + v.ph) * dt * 0.1; });
      ribo.rotation.y += dt * 0.01;
      droid.position.y = 0.9 + Math.sin(t * 1.2) * 0.15; droid.position.x = -1.9 + Math.sin(t * 0.5) * 0.3;
      sd.update(t, dt, { lookAt: s.lookPoint, happy: s.hovered === droid });
    }
  };
}
