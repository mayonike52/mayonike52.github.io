// EXTERIOR — hyperspace drop-out, the ship, and a few quiet easter eggs.
import { THREE, P, mat, shadow, box, cyl, sph, at, canvasTex, glow, dotTex } from "./lib.js";

export function buildSpace({ root, register }) {
  root.add(new THREE.AmbientLight(0x8090b8, 0.35));
  const sun = new THREE.DirectionalLight(0xffeef2, 2.2); sun.position.set(-8, 5, 6); root.add(sun);
  const rimL = new THREE.DirectionalLight(0x9fb2e6, 1.2); rimL.position.set(8, -2, -6); root.add(rimL);

  // starfield (static points) + streaks for the hyperspace intro
  const N = 1400, sp = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { const v = new THREE.Vector3().randomDirection().multiplyScalar(80 + Math.random() * 40); sp.set([v.x, v.y, v.z], i * 3); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xdfe6f5, size: 0.5, map: dotTex(), transparent: true, depthWrite: false, sizeAttenuation: true }));
  root.add(stars);

  const S = 600, streakPos = new Float32Array(S * 6), seeds = [];
  for (let i = 0; i < S; i++) { const a = Math.random() * Math.PI * 2, r = 3 + Math.random() * 30; seeds.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, z: -Math.random() * 160 }); }
  const streakGeo = new THREE.BufferGeometry(); streakGeo.setAttribute("position", new THREE.BufferAttribute(streakPos, 3));
  const streaks = new THREE.LineSegments(streakGeo, new THREE.LineBasicMaterial({ color: 0xc9d8ff, transparent: true, opacity: 0.9 }));
  root.add(streaks);

  // nebula sprites
  for (const [x, y, z, s, c] of [[-40, 18, -70, 60, 0xb5627f], [45, -12, -80, 70, 0x5670a8], [10, 30, -90, 50, 0x8a6aa0]]) {
    const n = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex(), color: c, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending }));
    n.position.set(x, y, z); n.scale.setScalar(s); root.add(n);
  }

  // planet + ring
  const planetTex = canvasTex(512, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#5a6d9c"); gr.addColorStop(0.5, "#9a7a9e"); gr.addColorStop(1, "#c98ea3"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? "238,210,220" : "60,70,110"},${0.08 + Math.random() * 0.15})`; g.fillRect(0, Math.random() * h, w, 2 + Math.random() * 10); }
  });
  const planet = at(root, new THREE.Mesh(new THREE.SphereGeometry(16, 64, 40), new THREE.MeshStandardMaterial({ map: planetTex, roughness: 0.9 })), 26, -16, -55);
  planet.rotation.z = 0.25;
  const ring = at(root, new THREE.Mesh(new THREE.RingGeometry(20, 28, 96), new THREE.MeshBasicMaterial({ color: 0xd9c3d6, transparent: true, opacity: 0.25, side: THREE.DoubleSide })), 26, -16, -55);
  ring.rotation.set(1.2, 0.2, 0.3);
  // twin suns, far away (quiet nod)
  for (const [x, s] of [[-60, 9], [-52, 6]]) { const g = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex(), color: 0xffe2c8, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending })); g.position.set(x, 26, -95); g.scale.setScalar(s); root.add(g); }

  // "that's no moon" — tiny grey sphere with a trench and a dish, very far off
  const moon = new THREE.Group(); moon.position.set(-24, 12, -60); root.add(moon);
  at(moon, sph(2.2, mat(0x8a90a0, { roughness: 0.8 }), undefined, 48, 32));
  at(moon, new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.06, 6, 64), mat(0x4a5064)), 0, 0, 0).rotation.x = Math.PI / 2;
  const dish = at(moon, new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 12, 0, Math.PI * 2, 0, 0.9), mat(0x5d6478, { side: THREE.DoubleSide })), 0.9, 0.9, 1.75);
  dish.lookAt(new THREE.Vector3(3, 3, 9));
  register(moon, "egg-moon", "…that's no moon", null);

  // asteroid cluster (quiet nod #2)
  const rocks = new THREE.Group(); rocks.position.set(-20, -10, -34); rocks.scale.setScalar(0.8); root.add(rocks);
  const rockM = mat(0x6c6478, { flatShading: true, roughness: 0.95 });
  const rockList = [];
  for (let i = 0; i < 14; i++) { const r = at(rocks, new THREE.Mesh(new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.9, 0), rockM), (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 6); r.rotation.set(Math.random() * 3, Math.random() * 3, 0); rockList.push(r); }
  register(rocks, "egg-rocks", "Asteroid field (don't tell me the odds)", null);

  // ── the ship: an original light freighter ──
  const ship = new THREE.Group(); root.add(ship);
  const hull = mat(0xb9bfcc, { roughness: 0.55, metalness: 0.35 }), hullD = mat(0x8e95a6, { roughness: 0.6, metalness: 0.3 }), dark = mat(0x2a2f40, { roughness: 0.5 });
  // wide, flat freighter hull
  const body = shadow(new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), hull)); body.scale.set(3.1, 0.6, 2.1); ship.add(body);
  const belly = shadow(new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), hullD)); belly.scale.set(2.8, 0.42, 1.9); belly.position.y = -0.22; ship.add(belly);
  const ringBand = at(ship, new THREE.Mesh(new THREE.TorusGeometry(1, 0.035, 8, 96), mat(P.rose, { roughness: 0.6 })), 0, 0.02, 0); ringBand.rotation.x = Math.PI / 2; ringBand.scale.set(3.05, 2.06, 1);
  // nose wedge
  const noseShape = new THREE.Shape(); noseShape.moveTo(0, -0.35); noseShape.lineTo(1.8, -0.12); noseShape.lineTo(1.8, 0.06); noseShape.lineTo(0, 0.35); noseShape.lineTo(0, -0.35);
  const nose = shadow(new THREE.Mesh(new THREE.ExtrudeGeometry(noseShape, { depth: 1.4, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 2 }), hull)); at(ship, nose, 2.4, -0.05, -0.7);
  // cockpit canopy
  const canopy = at(ship, new THREE.Mesh(new THREE.SphereGeometry(0.75, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x2b3550, { roughness: 0.15, metalness: 0.6, emissive: 0x9fd0f0, emissiveIntensity: 0.15 })), 1.5, 0.45, 0);
  canopy.scale.set(1.3, 0.7, 0.95);
  for (let i = -2; i <= 2; i++) at(ship, box(0.04, 0.36, 0.04, hullD, 0.01), 1.5 + i * 0.18, 0.62, 0.62 - Math.abs(i) * 0.05);
  // engines
  const engineGlows = [];
  for (const z of [-1.15, 1.15]) {
    const eng = at(ship, cyl(0.42, 0.5, 1.8, hull, 32), -2.5, 0.0, z); eng.rotation.z = Math.PI / 2;
    at(ship, cyl(0.47, 0.47, 0.14, dark, 32), -3.42, 0.0, z).rotation.z = Math.PI / 2;
    const g = at(ship, new THREE.Mesh(new THREE.CircleGeometry(0.38, 32), glow(0x9fd0f0)), -3.5, 0.0, z); g.rotation.y = -Math.PI / 2; engineGlows.push(g);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex(), color: 0x9fc3f0, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending }));
    halo.position.set(-3.7, 0.0, z); halo.scale.setScalar(1.8); ship.add(halo); engineGlows.push(halo);
  }
  // dorsal fin + dish + rose stripe + greebles
  const fin = new THREE.Shape(); fin.moveTo(0, 0); fin.lineTo(1.4, 0); fin.lineTo(0.3, 1.0); fin.lineTo(0, 1.0);
  at(ship, shadow(new THREE.Mesh(new THREE.ExtrudeGeometry(fin, { depth: 0.1, bevelEnabled: false }), hullD)), -2.3, 0.4, -0.05).scale.set(0.8, 0.7, 1);
  const dsh = at(ship, new THREE.Mesh(new THREE.SphereGeometry(0.35, 20, 10, 0, Math.PI * 2, 0, 1.0), mat(0xd3d8e2, { side: THREE.DoubleSide, metalness: 0.4 })), -0.6, 0.85, 0.9); dsh.rotation.x = -0.5;
  at(ship, cyl(0.03, 0.03, 0.35, dark, 6), -0.6, 0.7, 0.9);
    for (let i = 0; i < 40; i++) {
    const g = at(ship, box(0.1 + Math.random() * 0.35, 0.05 + Math.random() * 0.1, 0.1 + Math.random() * 0.35, Math.random() < 0.5 ? hullD : mat(0x6c7386, { roughness: 0.6, metalness: 0.3 }), 0.01), -2.2 + Math.random() * 3.2, 0.5 + Math.random() * 0.06, (Math.random() - 0.5) * 2.2);
    if (Math.abs(g.position.x - 1.5) < 0.8 && Math.abs(g.position.z) < 0.8) g.visible = false;
  }
  // running lights
  const nav = [at(ship, sph(0.07, glow(P.rose)), 0.4, 0.0, 2.1), at(ship, sph(0.07, glow(0x9fd0f0)), 0.4, 0.0, -2.1)];
  // boarding ramp glow (click target hint)
  const ramp = at(ship, new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.6), glow(0xffd7b0, { transparent: true, opacity: 0.0 })), 0.2, -0.6, 0.6); ramp.rotation.x = Math.PI / 2;
  register(ship, "board", "Board the ship →", null);
  ship.rotation.set(0.32, -0.6, 0.06);

  // intro state
  let introT = -1, introDur = 3.2;
  const ease = t => 1 - Math.pow(1 - t, 3);
  function setStreaks(len, speed, dt, alpha) {
    const a = streakGeo.attributes.position.array;
    seeds.forEach((s, i) => {
      s.z += speed * dt; if (s.z > 10) s.z -= 170;
      a[i * 6] = s.x; a[i * 6 + 1] = s.y; a[i * 6 + 2] = s.z; a[i * 6 + 3] = s.x; a[i * 6 + 4] = s.y; a[i * 6 + 5] = s.z - len;
    });
    streakGeo.attributes.position.needsUpdate = true; streaks.material.opacity = alpha; streaks.visible = alpha > 0.01;
  }
  setStreaks(0, 0, 0, 0);

  return {
    key: "space", title: "Deep space", sub: "the ship",
    bg: 0x0b0e1a, fog: [200, 400], exposure: 1.05,
    home: { pos: [0, 2.6, 14], target: [0, 0.2, 0] },
    portal: [0.2, -0.5, 0.8],
    shipGroup: ship,
    startIntro() { introT = 0; },
    skipIntro() { introT = introDur; },
    get introDone() { return introT < 0 || introT >= introDur; },
    update(t, dt, s) {
      if (introT >= 0 && introT < introDur) {
        introT += dt; const k = Math.min(1, introT / introDur);
        const slow = ease(Math.min(1, k * 1.3));
        setStreaks(40 * (1 - slow) + 0.1, 220 * (1 - slow) + 4, dt, 1 - slow);
        stars.material.opacity = slow;
        ship.position.z = -40 * (1 - ease(k)); ship.position.x = 6 * (1 - ease(k));
      } else { if (streaks.visible) setStreaks(0, 0, 0, 0); stars.material.opacity = 1; ship.position.set(0, Math.sin(t * 0.6) * 0.08, 0); }
      const hot = s.hovered === ship;
      ship.rotation.y = -0.6 + Math.sin(t * 0.2) * 0.06; ship.rotation.z = 0.06 + Math.sin(t * 0.5) * 0.02;
      engineGlows.forEach((g, i) => { if (g.isSprite) g.material.opacity = 0.6 + Math.sin(t * 9 + i) * 0.12; });
      nav.forEach((n, i) => (n.visible = Math.sin(t * 3 + i * Math.PI) > 0));
      ramp.material.opacity += ((hot ? 0.8 : 0.15 + Math.sin(t * 2) * 0.1) - ramp.material.opacity) * 0.1;
      rockList.forEach((r, i) => { r.rotation.x += dt * 0.1 * ((i % 3) + 1); r.rotation.y += dt * 0.07; });
      planet.rotation.y += dt * 0.01; moon.rotation.y += dt * 0.05;
    }
  };
}
