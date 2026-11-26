// EXTERIOR — a classic black starfield and the ship dropping out of hyperspace.
import { THREE, P, mat, shadow, box, cyl, sph, at, canvasTex, glow, dotTex } from "./lib.js";

export function buildSpace({ root, register }) {
  root.add(new THREE.AmbientLight(0x8090b8, 0.35));
  const sun = new THREE.DirectionalLight(0xffeef2, 2.2); sun.position.set(-8, 5, 6); root.add(sun);
  const rimL = new THREE.DirectionalLight(0x9fb2e6, 1.2); rimL.position.set(8, -2, -6); root.add(rimL);

  // classic starfield: pure black, crisp white dots in three brightness layers
  const starTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 32; const g = c.getContext("2d"); const r = g.createRadialGradient(16, 16, 0, 16, 16, 16); r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.25, "rgba(255,255,255,.9)"); r.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = r; g.fillRect(0, 0, 32, 32); return new THREE.CanvasTexture(c); })();
  const starLayers = [];
  for (const [n, size, op] of [[2600, 0.35, 0.75], [700, 0.6, 0.95], [90, 1.1, 1]]) {
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const v = new THREE.Vector3().randomDirection().multiplyScalar(90 + Math.random() * 30); pos.set([v.x, v.y, v.z], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size, map: starTex, transparent: true, opacity: op, depthWrite: false, fog: false }));
    pts.userData.op = op; root.add(pts); starLayers.push(pts);
  }
  const stars = { material: { set opacity(v) { starLayers.forEach(l => (l.material.opacity = l.userData.op * v)); } } };

  // hyperspace streaks (only during the arrival)
  const S = 700, streakPos = new Float32Array(S * 6), seeds = [];
  for (let i = 0; i < S; i++) { const a = Math.random() * Math.PI * 2, r = 2.5 + Math.random() * 34; seeds.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, z: -Math.random() * 170 }); }
  const streakGeo = new THREE.BufferGeometry(); streakGeo.setAttribute("position", new THREE.BufferAttribute(streakPos, 3));
  const streaks = new THREE.LineSegments(streakGeo, new THREE.LineBasicMaterial({ color: 0xeef3ff, transparent: true, opacity: 0.9, fog: false }));
  root.add(streaks);

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

  // arrival: in hyperspace (streaks) → flash → ship snaps out of its stretch and coasts in
  const IN_HYPER = 1.9, SNAP = 0.55, COAST = 1.6;
  let introT = -1, introDur = IN_HYPER + SNAP + COAST, flashed = false, onFlash = null;
  const ease = t => 1 - Math.pow(1 - t, 3);
  const heading = new THREE.Vector3();
  function setStreaks(len, speed, dt, alpha) {
    const a = streakGeo.attributes.position.array;
    seeds.forEach((s, i) => {
      s.z += speed * dt; if (s.z > 10) s.z -= 170;
      a[i * 6] = s.x; a[i * 6 + 1] = s.y; a[i * 6 + 2] = s.z; a[i * 6 + 3] = s.x; a[i * 6 + 4] = s.y; a[i * 6 + 5] = s.z - len;
    });
    streakGeo.attributes.position.needsUpdate = true; streaks.material.opacity = alpha; streaks.visible = alpha > 0.01;
  }
  setStreaks(0, 0, 0, 0);

  const rest = new THREE.Vector3(0, 0, 0);
  return {
    key: "space", title: "Deep space", sub: "the ship",
    bg: 0x000000, fog: [200, 400], exposure: 1.05,
    home: { pos: [0, 2.6, 14], target: [0, 0.2, 0] },
    portal: [0.2, -0.5, 0.8],
    shipGroup: ship,
    set onFlash(fn) { onFlash = fn; },
    startIntro() { introT = 0; flashed = false; ship.visible = false; },
    skipIntro() { introT = introDur; ship.visible = true; ship.scale.set(1, 1, 1); },
    get introDone() { return introT < 0 || introT >= introDur; },
    update(t, dt, s) {
      heading.set(1, 0, 0).applyQuaternion(ship.quaternion);
      if (introT >= 0 && introT < introDur) {
        introT += dt;
        if (introT < IN_HYPER) {
          // still in hyperspace: tunnel of streaks, no stars, no ship
          const k = introT / IN_HYPER;
          setStreaks(26 + 10 * Math.sin(k * 3), 230, dt, Math.min(1, k * 3));
          stars.material.opacity = 0; ship.visible = false;
        } else if (introT < IN_HYPER + SNAP) {
          // drop out: streaks collapse into stars, ship un-stretches and decelerates hard
          if (!flashed) { flashed = true; onFlash && onFlash(); }
          const k = (introT - IN_HYPER) / SNAP, e = ease(k);
          setStreaks(26 * (1 - e) + 0.05, 230 * (1 - e) + 2, dt, 1 - e);
          stars.material.opacity = e;
          ship.visible = true; ship.scale.set(1 + 14 * Math.pow(1 - e, 2), 1, 1);
          ship.position.copy(rest).addScaledVector(heading, -26 * Math.pow(1 - e, 2) + 2.2);
        } else {
          // coast to a stop
          const k = (introT - IN_HYPER - SNAP) / COAST, e = ease(k);
          if (streaks.visible) setStreaks(0, 0, 0, 0);
          stars.material.opacity = 1; ship.scale.set(1, 1, 1);
          ship.position.copy(rest).addScaledVector(heading, 2.2 * (1 - e));
        }
      } else {
        if (streaks.visible) setStreaks(0, 0, 0, 0); stars.material.opacity = 1; ship.visible = true; ship.scale.set(1, 1, 1);
        ship.position.set(0, Math.sin(t * 0.6) * 0.06, 0);
      }
      const hot = s.hovered === ship;
      ship.rotation.y = -0.6 + Math.sin(t * 0.2) * 0.04; ship.rotation.z = 0.06 + Math.sin(t * 0.5) * 0.015;
      engineGlows.forEach((g, i) => { if (g.isSprite) g.material.opacity = 0.6 + Math.sin(t * 9 + i) * 0.12; });
      nav.forEach((n, i) => (n.visible = Math.sin(t * 3 + i * Math.PI) > 0));
      ramp.material.opacity += ((hot ? 0.8 : 0.15 + Math.sin(t * 2) * 0.1) - ramp.material.opacity) * 0.1;
    }
  };
}
