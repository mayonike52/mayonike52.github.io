// Shared three.js helpers, palette, textures and the SD-01 droid builder.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export { THREE, RoundedBoxGeometry };

// Muted blues + pinks, light and dark. No pure white/black/peach.
export const P = {
  ink: 0x262b3d, navy: 0x2f3a56, slate: 0x4b5b7d, blue: 0x7f97bf, powder: 0xbfcde3, mist: 0xdde4ef,
  rose: 0xd49aae, mauve: 0xa98299, blush: 0xecd2dc, plum: 0x5a4763, berry: 0x9a5f7c,
  sage: 0x9bb5a8, butter: 0xe6d6a8, cream: 0xeeebf2, metal: 0x9aa3b5, darkMetal: 0x3a4154
};
export const hex = n => "#" + n.toString(16).padStart(6, "0");

export const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.05, ...o });
export const shadow = (m, cast = true, recv = true) => { m.castShadow = cast; m.receiveShadow = recv; return m; };
const asMat = (c, o) => (c instanceof THREE.Material ? c : mat(c, o));
export function box(w, h, d, color, r = 0.035, o) {
  const geo = r > 0 ? new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2)) : new THREE.BoxGeometry(w, h, d);
  return shadow(new THREE.Mesh(geo, asMat(color, o)));
}
export const cyl = (rt, rb, h, color, seg = 24, o) => shadow(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), asMat(color, o)));
export const sph = (r, color, o, ws = 24, hs = 16) => shadow(new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), asMat(color, o)));
export function at(parent, obj, x = 0, y = 0, z = 0) { obj.position.set(x, y, z); parent.add(obj); return obj; }
export function canvasTex(w, h, draw) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d"); draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  t.userData = { canvas: c, ctx }; return t;
}
export const plane = (w, h, tex, o = {}) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, ...o }));
export function wire(points, color = P.ink, r = 0.012) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  return shadow(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, r, 6), mat(color, { roughness: 0.5 })), true, false);
}
export const glow = (color, o = {}) => new THREE.MeshBasicMaterial({ color, toneMapped: false, ...o });

export const MONO = '"JetBrains Mono", ui-monospace, monospace';
export const SANS = '"Space Grotesk", system-ui, sans-serif';

export function signTex(lines, bg = hex(P.butter), fg = hex(P.ink)) {
  return canvasTex(256, 160, (g, w, h) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = fg; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16);
    g.fillStyle = fg; g.textAlign = "center"; g.font = `700 40px ${SANS}`; g.fillText(lines[0], w / 2, 72);
    g.font = `22px ${MONO}`; g.fillText(lines[1] || "", w / 2, 115);
  });
}
export function stripeTex(a = hex(P.butter), b = hex(P.navy)) {
  const t = canvasTex(256, 32, (g, w, h) => {
    g.fillStyle = a; g.fillRect(0, 0, w, h); g.fillStyle = b;
    for (let x = -32; x < w + 32; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 16, 0); g.lineTo(x - 16, h); g.lineTo(x - 32, h); g.fill(); }
  });
  t.wrapS = THREE.RepeatWrapping; return t;
}

// Soft round sprite texture for particles / glows.
let _dot;
export function dotTex() {
  if (_dot) return _dot;
  _dot = canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.4, "rgba(255,255,255,.5)"); r.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  return _dot;
}
export function particles(n, spread, color, size, opacity = 0.6) {
  const geo = new THREE.BufferGeometry(); const p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - 0.5) * spread[0]; p[i * 3 + 1] = (Math.random() - 0.5) * spread[1]; p[i * 3 + 2] = (Math.random() - 0.5) * spread[2]; }
  geo.setAttribute("position", new THREE.BufferAttribute(p, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({ color, size, map: dotTex(), transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
}

// ─────────────────────────────────────────────────────────────
//  SD-01 — the guide droid. variant: "rover" (treads) | "nano" (propeller tail)
// ─────────────────────────────────────────────────────────────
export function buildDroid(variant = "rover") {
  const droid = new THREE.Group();
  const body = at(droid, new THREE.Group());
  const shell = P.cream, accent = P.rose, dark = P.darkMetal;
  if (variant === "rover") {
    for (const z of [-0.17, 0.17]) {
      at(body, box(0.42, 0.13, 0.11, P.ink, 0.05), 0, 0.075, z);
      for (const x of [-0.14, 0, 0.14]) at(body, cyl(0.045, 0.045, 0.115, P.slate, 12), x, 0.075, z).rotation.x = Math.PI / 2;
    }
  }
  const torso = at(body, new THREE.Group(), 0, variant === "rover" ? 0.15 : 0, 0);
  at(torso, box(0.42, 0.36, 0.38, shell, 0.09), 0, 0.2, 0);
  at(torso, box(0.43, 0.08, 0.39, accent, 0.03), 0, 0.12, 0);
  at(torso, box(0.04, 0.12, 0.2, P.navy, 0.015), 0.21, 0.26, 0);
  const chestLed = at(torso, sph(0.018, glow(P.blue)), 0.225, 0.3, 0.05);
  for (const z of [-0.22, 0.22]) {
    const a = at(torso, new THREE.Group(), 0, 0.27, z);
    at(a, sph(0.04, P.slate), 0, 0, 0);
    at(a, box(0.06, 0.18, 0.05, shell, 0.025), 0.03, -0.09, 0).rotation.z = 0.35;
    at(a, box(0.07, 0.03, 0.06, accent, 0.01), 0.06, -0.18, 0);
  }
  at(torso, cyl(0.04, 0.05, 0.08, P.slate, 12), 0, 0.42, 0);
  const head = at(torso, new THREE.Group(), 0, 0.55, 0);
  at(head, box(0.34, 0.24, 0.36, shell, 0.08), 0, 0, 0);
  at(head, box(0.02, 0.17, 0.27, P.ink, 0.03), 0.17, 0, 0);
  const eyeMat = glow(0x9fd0f0);
  const eyes = [-0.06, 0.06].map(z => at(head, new THREE.Mesh(new RoundedBoxGeometry(0.01, 0.07, 0.045, 2, 0.008), eyeMat), 0.185, 0.005, z));
  for (const z of [-0.19, 0.19]) at(head, cyl(0.06, 0.06, 0.03, accent, 16), 0, 0, z).rotation.x = Math.PI / 2;
  at(head, cyl(0.008, 0.008, 0.18, P.slate, 6), -0.06, 0.2, 0.06);
  const antTip = at(head, sph(0.025, glow(P.rose)), -0.06, 0.3, 0.06);
  let prop = null;
  if (variant === "nano") {
    // flagellum-style tail + propeller instead of treads
    at(torso, wire([[0, 0.02, 0], [-0.1, -0.12, 0.04], [-0.05, -0.28, -0.05], [-0.14, -0.42, 0.02]], P.mauve, 0.018));
    prop = at(torso, new THREE.Group(), -0.14, -0.44, 0.02);
    for (let i = 0; i < 3; i++) { const b = at(prop, box(0.16, 0.012, 0.05, P.blue, 0.006), 0, 0, 0); b.rotation.y = (i / 3) * Math.PI * 2; b.position.set(Math.cos((i / 3) * Math.PI * 2) * 0.07, 0, -Math.sin((i / 3) * Math.PI * 2) * 0.07); }
    const bubble = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 20), new THREE.MeshStandardMaterial({ color: P.powder, transparent: true, opacity: 0.12, roughness: 0.1, depthWrite: false }));
    at(torso, bubble, 0, 0.32, 0);
  }

  let blinkT = 2, hop = 0;
  const lookLocal = new THREE.Vector3();
  function update(t, dt, { lookAt, happy = false, moving = false } = {}) {
    torso.position.y = (variant === "rover" ? 0.15 : 0) + (moving ? Math.abs(Math.sin(t * 10)) * 0.012 : Math.sin(t * 2) * 0.008);
    if (hop > 0) { hop = Math.max(0, hop - dt * 1.6); body.position.y = Math.sin((1 - hop) * Math.PI) * 0.22; torso.rotation.z = Math.sin((1 - hop) * Math.PI * 2) * 0.12; }
    if (lookAt) {
      lookLocal.copy(lookAt); droid.worldToLocal(lookLocal); lookLocal.sub(head.position).sub(torso.position);
      const yaw = THREE.MathUtils.clamp(Math.atan2(-lookLocal.z, lookLocal.x), -1, 1);
      const pitch = THREE.MathUtils.clamp(Math.atan2(lookLocal.y, Math.hypot(lookLocal.x, lookLocal.z)), -0.4, 0.5);
      head.rotation.y += (yaw - head.rotation.y) * 0.1; head.rotation.z += (pitch - head.rotation.z) * 0.1;
    }
    blinkT -= dt; let ey = happy ? 0.45 : 1;
    if (blinkT < 0) { ey = 0.1; if (blinkT < -0.12) blinkT = 2 + Math.random() * 3; }
    eyes.forEach(e => { e.scale.y += (ey - e.scale.y) * 0.4; });
    antTip.material.color.setHex(Math.sin(t * 3) > 0.6 ? P.blush : P.rose);
    chestLed.material.color.setHex(Math.sin(t * 4) > 0 ? P.blue : P.powder);
    if (prop) prop.rotation.y += dt * 14;
  }
  return { group: droid, head, update, hop: () => { hop = 1; } };
}
