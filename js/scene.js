// ─────────────────────────────────────────────────────────────
//  "Scales" engine: four levels (1 m → 1 mm → 1 µm → 1 nm),
//  zoom transitions between them, hover/click picking, camera focus.
// ─────────────────────────────────────────────────────────────
import { THREE } from "./three/lib.js";
import { buildWorkshop } from "./three/workshop.js";
import { buildCircuit } from "./three/circuit.js";
import { buildCell } from "./three/cell.js";
import { buildNano } from "./three/nano.js";

const BUILDERS = [buildWorkshop, buildCircuit, buildCell, buildNano];
const BASE_FOV = 34;

export function createWorld(container, { onSelect, onHover, onReady, onLevel } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xffffff, 18, 34);
  const camera = new THREE.PerspectiveCamera(BASE_FOV, 1, 0.05, 120);

  // ── build levels ──
  const levels = BUILDERS.map((build, index) => {
    const root = new THREE.Group(); root.visible = false; scene.add(root);
    const interactables = [];
    const register = (group, id, label, focus) => {
      group.traverse(o => { if (o.isMesh && o.material && !Array.isArray(o.material)) { o.material = o.material.clone(); o.userData.baseEmissive = o.material.emissive ? o.material.emissive.clone() : null; o.userData.baseEI = o.material.emissiveIntensity; } });
      group.userData.interactive = { id, label, focus };
      interactables.push(group); return group;
    };
    const L = build({ root, register });
    Object.assign(L, { index, root, interactables });
    L.home.pos = new THREE.Vector3(...L.home.pos); L.home.target = new THREE.Vector3(...L.home.target); L.portal = new THREE.Vector3(...L.portal);
    return L;
  });

  let cur = 0;
  function applyLevel(L) {
    levels.forEach(l => (l.root.visible = l === L));
    scene.background = new THREE.Color(L.bg); scene.fog.color.setHex(L.bg); scene.fog.near = L.fog[0]; scene.fog.far = L.fog[1];
    renderer.toneMappingExposure = L.exposure || 1;
  }
  applyLevel(levels[0]);

  // ── camera state ──
  const camTarget = levels[0].home.target.clone();
  camera.position.copy(levels[0].home.pos);
  const tween = { active: false, t: 0, dur: 1, fromPos: new THREE.Vector3(), toPos: new THREE.Vector3(), fromTgt: new THREE.Vector3(), toTgt: new THREE.Vector3(), fromFov: BASE_FOV, toFov: BASE_FOV, ease: null, done: null };
  const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeIn = t => t * t * t;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  function fly(pos, tgt, { dur = 1.1, fov = BASE_FOV, ease = easeInOut } = {}) {
    return new Promise(res => {
      Object.assign(tween, { active: true, t: 0, dur, ease, done: res, fromFov: camera.fov, toFov: fov });
      tween.fromPos.copy(camera.position); tween.fromTgt.copy(camTarget); tween.toPos.copy(pos); tween.toTgt.copy(tgt);
    });
  }
  function fitHome(L = levels[cur]) {
    const p = L.home.pos.clone(), a = camera.aspect;
    if (a < 1.6) p.sub(L.home.target).multiplyScalar(1 + (1.6 - a) * 0.6).add(L.home.target);
    return p;
  }

  // ── level transitions ──
  let transitioning = false, focused = null, enabled = true;
  async function goTo(i) {
    i = Math.max(0, Math.min(levels.length - 1, i));
    if (i === cur || transitioning) return;
    transitioning = true; focused = null; setHover(null);
    const from = levels[cur], to = levels[i], deeper = i > cur;
    onLevel && onLevel(to, "out", deeper);
    if (deeper) {
      // dive into this level's portal
      const dir = camera.position.clone().sub(from.portal).normalize();
      await fly(from.portal.clone().addScaledVector(dir, 0.25), from.portal, { dur: 1.0, fov: 12, ease: easeIn });
    } else {
      const back = camera.position.clone().sub(camTarget).multiplyScalar(2.6).add(camTarget);
      await fly(back, camTarget, { dur: 0.9, fov: 60, ease: easeIn });
    }
    cur = i; applyLevel(to);
    const home = fitHome(to);
    if (deeper) {
      // arrive zoomed-in on the middle of the new level and pull back
      camera.position.copy(home.clone().sub(to.home.target).multiplyScalar(0.12).add(to.home.target)); camTarget.copy(to.home.target); camera.fov = 75;
    } else {
      // arrive from inside the new level's portal and pull back out
      const dir = home.clone().sub(to.portal).normalize();
      camera.position.copy(to.portal.clone().addScaledVector(dir, 0.3)); camTarget.copy(to.portal); camera.fov = 14;
    }
    camera.updateProjectionMatrix();
    onLevel && onLevel(to, "in", deeper);
    await fly(home, to.home.target, { dur: 1.3, fov: BASE_FOV, ease: easeOut });
    transitioning = false;
    onLevel && onLevel(to, "done", deeper);
  }

  function findInteractable(id) {
    const here = levels[cur].interactables.find(g => g.userData.interactive.id === id && g.userData.interactive.focus);
    if (here) return { level: cur, g: here };
    let best = null;
    for (const L of levels) { const g = L.interactables.find(o => o.userData.interactive.id === id && o.userData.interactive.focus); if (g && (!best || Math.abs(L.index - cur) < Math.abs(best.level - cur))) best = { level: L.index, g }; }
    return best;
  }
  async function focus(id) {
    const hit = findInteractable(id); if (!hit) return false;
    if (hit.level !== cur) await goTo(hit.level);
    focused = hit.g; const f = hit.g.userData.interactive.focus;
    await fly(new THREE.Vector3(...f.pos), new THREE.Vector3(...f.target));
    return true;
  }
  function reset() { focused = null; return fly(fitHome(), levels[cur].home.target); }

  // ── picking ──
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(9, 9), pSmooth = new THREE.Vector2();
  const lookPoint = new THREE.Vector3();
  let hovered = null, lastClient = { x: 0, y: 0 };
  function pick() {
    if (Math.abs(pointer.x) > 2) return null;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(levels[cur].interactables, true);
    for (const h of hits) { let o = h.object; while (o && !o.userData.interactive) o = o.parent; if (o) return o; }
    return null;
  }
  function setHighlight(group, on) {
    group.traverse(o => {
      if (!o.isMesh || !o.userData.baseEmissive) return;
      if (on) { o.material.emissive.setHex(0xd49aae); o.material.emissiveIntensity = 0.3; }
      else { o.material.emissive.copy(o.userData.baseEmissive); o.material.emissiveIntensity = o.userData.baseEI; }
    });
  }
  function setHover(g) {
    if (g === hovered) { if (g && onHover) onHover(g.userData.interactive, lastClient); return; }
    if (hovered) setHighlight(hovered, false);
    hovered = g; if (g) setHighlight(g, true);
    el.style.cursor = g ? "pointer" : "default";
    onHover && onHover(g ? g.userData.interactive : null, lastClient);
  }

  const el = renderer.domElement;
  const setPointer = e => { const r = el.getBoundingClientRect(); pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); lastClient = { x: e.clientX, y: e.clientY }; };
  el.addEventListener("pointermove", setPointer);
  el.addEventListener("pointerleave", () => pointer.set(9, 9));
  el.addEventListener("click", e => {
    if (!enabled || transitioning) return; setPointer(e);
    const g = pick(); if (!g) return;
    const { id } = g.userData.interactive;
    if (id === "dive") { goTo(cur + 1); return; }
    if (id === "about") levels[cur].droid && levels[cur].droid.hop();
    onSelect && onSelect(id);
  });
  // scroll / swipe to change scale
  let wheelAcc = 0, wheelLock = 0;
  el.addEventListener("wheel", e => {
    e.preventDefault(); if (!enabled || transitioning || performance.now() < wheelLock) return;
    wheelAcc += e.deltaY; if (Math.abs(wheelAcc) > 90) { const d = Math.sign(wheelAcc); wheelAcc = 0; wheelLock = performance.now() + 900; goTo(cur + d); }
  }, { passive: false });
  let touchY = null;
  el.addEventListener("touchstart", e => { touchY = e.touches[0].clientY; }, { passive: true });
  el.addEventListener("touchend", e => { if (touchY == null || !enabled || transitioning) return; const dy = touchY - e.changedTouches[0].clientY; if (Math.abs(dy) > 70) goTo(cur + Math.sign(dy)); touchY = null; }, { passive: true });

  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    if (!focused && !tween.active) camera.position.copy(fitHome());
  }
  window.addEventListener("resize", resize); resize();

  // ── loop ──
  const clock = new THREE.Clock();
  const state = { hovered: null, focused: null, lookPoint, pointer };
  const zero = new THREE.Vector2();
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    setHover(enabled && !tween.active && !transitioning ? pick() : null);
    pSmooth.lerp(Math.abs(pointer.x) > 2 ? zero : pointer, 0.04);
    if (tween.active) {
      tween.t = Math.min(1, tween.t + dt / tween.dur); const k = tween.ease(tween.t);
      camera.position.lerpVectors(tween.fromPos, tween.toPos, k); camTarget.lerpVectors(tween.fromTgt, tween.toTgt, k);
      camera.fov = tween.fromFov + (tween.toFov - tween.fromFov) * k; camera.updateProjectionMatrix();
      if (tween.t >= 1) { tween.active = false; tween.done && tween.done(); }
    } else if (!focused && !transitioning) {
      const base = fitHome();
      camera.position.x += (base.x + pSmooth.x * 0.7 - camera.position.x) * 0.06;
      camera.position.y += (base.y + pSmooth.y * 0.35 - camera.position.y) * 0.06;
      camera.position.z += (base.z - camera.position.z) * 0.06;
    }
    camera.lookAt(camTarget);
    raycaster.setFromCamera(Math.abs(pointer.x) > 2 ? zero : pointer, camera);
    lookPoint.copy(raycaster.ray.origin).addScaledVector(raycaster.ray.direction, 9);
    state.hovered = hovered; state.focused = focused;
    levels[cur].update(t, dt, state);
    renderer.render(scene, camera);
  }
  // compile every level once up front so the first dive doesn't hitch
  levels.forEach(l => { applyLevel(l); renderer.compile(scene, camera); }); applyLevel(levels[0]);
  renderer.setAnimationLoop(frame);
  requestAnimationFrame(() => { onLevel && onLevel(levels[0], "done", true); onReady && onReady(); });

  return {
    levels: levels.map(l => ({ key: l.key, scale: l.scale, title: l.title, sub: l.sub })),
    get level() { return cur; },
    goTo, focus, reset,
    levelOf(id) { const h = findInteractable(id); return h ? h.level : -1; },
    setEnabled(v) { enabled = v; if (!v) setHover(null); },
    pause() { renderer.setAnimationLoop(null); },
    resume() { clock.getDelta(); renderer.setAnimationLoop(frame); },
    droidScreenPos() {
      const d = levels[cur].droid; if (!d) return { x: -999, y: -999 };
      const v = new THREE.Vector3(); d.head.getWorldPosition(v); v.y += 0.35 * d.group.scale.y; v.project(camera);
      const r = el.getBoundingClientRect(); return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height };
    }
  };
}
