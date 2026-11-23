// LEVEL 4 · 1 nm — molecules (nanotech + who I am)
import { THREE, P, mat, at, canvasTex, glow, particles, buildDroid } from "./lib.js";

// atoms + bonds as instanced meshes
function lattice(points, bondMax, atomR, atomColor, bondColor, emissive = 0.35) {
  const g = new THREE.Group();
  const aMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(atomR, 16, 12), mat(atomColor, { emissive: atomColor, emissiveIntensity: emissive, roughness: 0.35, metalness: 0.1 }), points.length);
  const m = new THREE.Matrix4();
  points.forEach((p, i) => { m.makeTranslation(p.x, p.y, p.z); aMesh.setMatrixAt(i, m); });
  g.add(aMesh);
  const bonds = [];
  for (let i = 0; i < points.length; i++) for (let j = i + 1; j < points.length; j++) if (points[i].distanceTo(points[j]) < bondMax) bonds.push([points[i], points[j]]);
  const bMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(atomR * 0.28, atomR * 0.28, 1, 6), mat(bondColor, { roughness: 0.5 }), bonds.length);
  const up = new THREE.Vector3(0, 1, 0), q = new THREE.Quaternion(), s = new THREE.Vector3(), mid = new THREE.Vector3(), dir = new THREE.Vector3();
  bonds.forEach(([a, b], i) => { dir.subVectors(b, a); const len = dir.length(); q.setFromUnitVectors(up, dir.normalize()); mid.addVectors(a, b).multiplyScalar(0.5); s.set(1, len, 1); m.compose(mid, q, s); bMesh.setMatrixAt(i, m); });
  g.add(bMesh);
  g.userData.atoms = aMesh;
  return g;
}

function buckyPoints(scale) {
  const t = (1 + Math.sqrt(5)) / 2;
  const v = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map(a => new THREE.Vector3(...a));
  const pts = [];
  for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) if (Math.abs(v[i].distanceTo(v[j]) - 2) < 0.01) {
    pts.push(v[i].clone().lerp(v[j], 1 / 3).multiplyScalar(scale), v[i].clone().lerp(v[j], 2 / 3).multiplyScalar(scale));
  }
  return pts; // edge length = 2/3 · scale
}

export function buildNano({ root, register }) {
  root.add(new THREE.HemisphereLight(0xc9d6f0, 0x2a2440, 0.9));
  const key = new THREE.DirectionalLight(0xf0e6f5, 1.1); key.position.set(-5, 8, 6); root.add(key);
  const pinkL = new THREE.PointLight(0xd49aae, 14, 16, 2); pinkL.position.set(4, 3, 1); root.add(pinkL);
  const blueL = new THREE.PointLight(0x7f97bf, 14, 16, 2); blueL.position.set(-5, 3, -1); root.add(blueL);

  // graphene floor (zigzag honeycomb)
  const a = 0.5;
  const honey = [];
  for (let i = -14; i <= 14; i++) for (let j = -10; j <= 10; j++) {
    const cx = i * a * 3, cz = j * a * Math.sqrt(3);
    for (const [dx, dz] of [[0, 0], [a, 0], [a * 1.5, a * Math.sqrt(3) / 2], [a * 2.5, a * Math.sqrt(3) / 2]]) honey.push(new THREE.Vector3(cx + dx, 0, cz + dz));
  }
  const floor = lattice(honey, a * 1.05, 0.08, 0x3d4a72, 0x34405f, 0.25); floor.position.set(0, -0.3, -2); root.add(floor);

  // carbon nanotube (About / nanotech)
  const tube = new THREE.Group(); tube.position.set(-3.6, 2.2, -1.5); tube.rotation.z = 0.35; root.add(tube);
  const tp = []; const M = 14, R = 0.95, dy = 0.25;
  for (let j = 0; j < 22; j++) for (let k = 0; k < M; k++) { const ang = ((k + (j % 2) * 0.5) / M) * Math.PI * 2; tp.push(new THREE.Vector3(Math.cos(ang) * R, (j - 11) * dy, Math.sin(ang) * R)); }
  const tubeLat = lattice(tp, 0.36, 0.075, P.powder, 0x8fa3c6, 0.5); tube.add(tubeLat);
  register(tube, "about", "Carbon nanotube — About me (Nanotech @ Waterloo)", { pos: [-1.0, 3.0, 5.0], target: [-2.6, 2.2, -1.5] });

  // buckyball (Skills)
  const bucky = new THREE.Group(); bucky.position.set(3.4, 2.0, -0.8); root.add(bucky);
  const bp = buckyPoints(0.95); bucky.add(lattice(bp, (2 / 3) * 0.95 * 1.08, 0.09, P.rose, 0xb98aa0, 0.55));
  register(bucky, "skills", "Buckyball — Skills", { pos: [4.6, 2.8, 4.4], target: [4.1, 2.0, -0.8] });

  // DNA helix (Education & honors)
  const dna = new THREE.Group(); dna.position.set(0.2, 0.2, -4.2); root.add(dna);
  const bb = mat(P.mist, { emissive: P.powder, emissiveIntensity: 0.3 });
  for (let i = 0; i < 24; i++) {
    const y = i * 0.2, ang = i * 0.42;
    const p1 = new THREE.Vector3(Math.cos(ang) * 0.75, y, Math.sin(ang) * 0.75), p2 = p1.clone().multiply(new THREE.Vector3(-1, 1, -1));
    at(dna, new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), bb), p1.x, p1.y, p1.z); at(dna, new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), bb), p2.x, p2.y, p2.z);
    if (i % 2 === 0) {
      const mid = p1.clone().add(p2).multiplyScalar(0.5); const len = p1.distanceTo(p2);
      for (const [from, col] of [[p1, i % 4 ? P.rose : P.blue], [p2, i % 4 ? P.blue : P.rose]]) {
        const half = from.clone().add(mid).multiplyScalar(0.5);
        const rung = at(dna, new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, len / 2, 6), mat(col, { emissive: col, emissiveIntensity: 0.4 })), half.x, half.y, half.z);
        rung.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), mid.clone().sub(from).normalize());
      }
    }
  }
  register(dna, "education", "DNA — Education & honors", { pos: [1.8, 3.0, 3.6], target: [1.1, 2.6, -4.2] });

  // tiny SD-01
  const sd = buildDroid("nano"); const droid = sd.group; droid.position.set(0.4, 1.4, 1.8); droid.scale.setScalar(0.9); droid.rotation.y = -Math.PI / 2 + 0.3; root.add(droid);
  register(droid, "about", "SD-01 at 1 nm (how?)", { pos: [1.2, 1.9, 4.6], target: [0.4, 1.6, 1.8] });

  // electron-cloud sparkles
  const sparks = particles(260, [18, 8, 12], 0xd9c3e6, 0.12, 0.5); sparks.position.set(0, 2.5, -1); root.add(sparks);

  return {
    key: "nano", scale: "1 nm", title: "Molecules", sub: "nanotech · about me",
    bg: 0x1c2136, fog: [12, 30], exposure: 1.1, shadows: false,
    home: { pos: [0, 3.6, 10], target: [0, 2.2, -1.5] },
    portal: [0.2, 2, -4.2],
    droid: sd,
    update(t, dt, s) {
      tube.rotation.y += dt * (s.hovered === tube ? 0.9 : 0.25);
      bucky.rotation.y += dt * (s.hovered === bucky ? 1.2 : 0.3); bucky.rotation.x += dt * 0.1;
      dna.rotation.y += dt * (s.hovered === dna ? 0.9 : 0.3);
      droid.position.y = 1.4 + Math.sin(t * 1.3) * 0.12;
      sd.update(t, dt, { lookAt: s.lookPoint, happy: s.hovered === droid });
      sparks.rotation.y += dt * 0.02;
      pinkL.intensity = 12 + Math.sin(t) * 3; blueL.intensity = 12 + Math.cos(t) * 3;
    }
  };
}
