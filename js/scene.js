// ─────────────────────────────────────────────────────────────
//  Ship engine: hyperspace intro → exterior → board → interior rooms.
//  "Stops" for the room bar: 0 = exterior, 1..4 = ship rooms.
// ─────────────────────────────────────────────────────────────
import { THREE } from "./three/lib.js";
import { buildSpace } from "./three/space.js";
import { buildShip } from "./three/ship.js";

const BASE_FOV = 38;

export function createWorld(container, { onSelect, onHover, onReady, onLevel } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 200, 400);
  const camera = new THREE.PerspectiveCamera(BASE_FOV, 1, 0.05, 400);

  const makeWorld = (build) => {
    const root = new THREE.Group(); root.visible = false; scene.add(root);
    const interactables = [];
    const register = (group, id, label, focus) => {
      group.traverse(o => { if (o.isMesh && o.material && !Array.isArray(o.material)) { o.material = o.material.clone(); o.userData.baseEmissive = o.material.emissive ? o.material.emissive.clone() : null; o.userData.baseEI = o.material.emissiveIntensity; } });
      group.userData.interactive = { id, label, focus }; interactables.push(group); return group;
    };
    const w = build({ root, register }); w.root = root; w.interactables = interactables; return w;
  };
  const space = makeWorld(buildSpace);
  const ship = makeWorld(buildShip);
  space.onFlash = () => onLevel && onLevel(STOPS_FLASH, "flash");
  const STOPS_FLASH = { key: "space", index: 0 };
  space.home.pos = new THREE.Vector3(...space.home.pos); space.home.target = new THREE.Vector3(...space.home.target);

  const STOPS = [
    { key: "space", index: 0, title: "Exterior", sub: "deep space", bg: 0x000000, home: space.home },
    ...ship.rooms.map(r => ({ key: r.key, index: r.index + 1, title: r.title, sub: r.sub, bg: 0x10131f, home: r.home }))
  ];
  let stop = 0;
  const inShip = () => stop > 0;
  function applyWorld(isShip) {
    space.root.visible = !isShip; ship.root.visible = isShip;
    const bg = isShip ? 0x10131f : 0x000000;
    scene.background = new THREE.Color(bg); scene.fog.color.setHex(bg);
    scene.fog.near = isShip ? 14 : 200; scene.fog.far = isShip ? 32 : 400;
    renderer.toneMappingExposure = isShip ? 1.15 : 1.05;
  }
  applyWorld(false);

  // ── camera ──
  const camTarget = space.home.target.clone();
  camera.position.copy(space.home.pos);
  const tween = { active: false };
  const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeIn = t => t * t * t, easeOut = t => 1 - Math.pow(1 - t, 3);
  function fly(pos, tgt, { dur = 1.1, fov = BASE_FOV, ease = easeInOut } = {}) {
    return new Promise(res => Object.assign(tween, { active: true, t: 0, dur, ease, done: res, fromFov: camera.fov, toFov: fov, fromPos: camera.position.clone(), toPos: pos.clone(), fromTgt: camTarget.clone(), toTgt: tgt.clone() }));
  }
  function fitHome(s = STOPS[stop]) {
    const p = s.home.pos.clone(), a = camera.aspect;
    if (a < 1.6) p.sub(s.home.target).multiplyScalar(1 + (1.6 - a) * 0.75).add(s.home.target);
    return p;
  }

  let transitioning = false, focused = null, enabled = false;
  async function goTo(i) {
    i = Math.max(0, Math.min(STOPS.length - 1, i));
    if (transitioning) return;
    if (i === stop) { if (focused) { focused = null; await fly(fitHome(), STOPS[stop].home.target); } return; }
    transitioning = true; focused = null; setHover(null);
    const to = STOPS[i];
    if (!inShip() && i > 0) {
      // board: dive into the hatch
      onLevel && onLevel(to, "out");
      const portal = space.shipGroup.localToWorld(new THREE.Vector3(...space.portal));
      await fly(portal.clone().add(new THREE.Vector3(0.6, 0.4, 1.2)), portal, { dur: 1.1, fov: 14, ease: easeIn });
      stop = i; applyWorld(true);
      const home = fitHome(to);
      camera.position.copy(home.clone().add(new THREE.Vector3(0, 0.6, 7))); camTarget.copy(to.home.target); camera.fov = 60; camera.updateProjectionMatrix();
      onLevel && onLevel(to, "in");
      await fly(home, to.home.target, { dur: 1.4, ease: easeOut });
    } else if (inShip() && i === 0) {
      // exit: pull out of the hull into space
      onLevel && onLevel(to, "out");
      await fly(camera.position.clone().add(new THREE.Vector3(0, 1.5, 9)), camTarget, { dur: 0.9, fov: 60, ease: easeIn });
      stop = 0; applyWorld(false);
      const portal = space.shipGroup.localToWorld(new THREE.Vector3(...space.portal));
      camera.position.copy(portal.clone().add(new THREE.Vector3(0.4, 0.3, 0.9))); camTarget.copy(portal); camera.fov = 16; camera.updateProjectionMatrix();
      onLevel && onLevel(to, "in");
      await fly(fitHome(to), to.home.target, { dur: 1.5, ease: easeOut });
    } else {
      // walk between rooms: lateral dolly
      stop = i; onLevel && onLevel(to, "walk");
      await fly(fitHome(to), to.home.target, { dur: 1.2 });
    }
    transitioning = false;
    onLevel && onLevel(to, "done");
  }

  const allInteractables = () => (inShip() ? ship.interactables : space.interactables);
  async function focus(id) {
    const r = ship.roomOf(id);
    if (r < 0) return false;
    if (stop !== r + 1) await goTo(r + 1);
    const g = ship.interactables.find(o => o.userData.interactive.id === id && o.userData.interactive.focus);
    if (!g) return false;
    focused = g; const f = g.userData.interactive.focus;
    await fly(new THREE.Vector3(...f.pos), new THREE.Vector3(...f.target));
    return true;
  }
  function reset() { focused = null; return fly(fitHome(), STOPS[stop].home.target); }

  // ── picking ──
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2(9, 9), pSmooth = new THREE.Vector2(), zero = new THREE.Vector2();
  const lookPoint = new THREE.Vector3();
  let hovered = null, lastClient = { x: 0, y: 0 };
  function pick() {
    if (Math.abs(pointer.x) > 2) return null;
    raycaster.setFromCamera(pointer, camera);
    for (const h of raycaster.intersectObjects(allInteractables(), true)) { let o = h.object; while (o && !o.userData.interactive) o = o.parent; if (o) return o; }
    return null;
  }
  function setHighlight(group, on) {
    group.traverse(o => { if (!o.isMesh || !o.userData.baseEmissive) return;
      if (on) { o.material.emissive.setHex(0xd49aae); o.material.emissiveIntensity = Math.max(0.3, o.userData.baseEI || 0); }
      else { o.material.emissive.copy(o.userData.baseEmissive); o.material.emissiveIntensity = o.userData.baseEI; } });
  }
  const el = renderer.domElement;
  function setHover(g) {
    if (g === hovered) { if (g && onHover) onHover(g.userData.interactive, lastClient); return; }
    if (hovered) setHighlight(hovered, false);
    hovered = g; if (g && g.userData.interactive.id !== "deco-saber") setHighlight(g, true);
    el.style.cursor = g ? "pointer" : "default";
    onHover && onHover(g ? g.userData.interactive : null, lastClient);
  }
  const setPointer = e => { const r = el.getBoundingClientRect(); pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); lastClient = { x: e.clientX, y: e.clientY }; };
  el.addEventListener("pointermove", setPointer);
  el.addEventListener("pointerleave", () => pointer.set(9, 9));
  el.addEventListener("click", e => {
    if (!space.introDone) { space.skipIntro(); return; }
    if (!enabled || transitioning) return; setPointer(e);
    const g = pick(); if (!g) return;
    const { id } = g.userData.interactive;
    if (id === "board") { goTo(2); return; }
    if (id === "about") ship.droid.hop();
    onSelect && onSelect(id);
  });
  // arrow keys walk between stops
  window.addEventListener("keydown", e => { if (!enabled || transitioning || document.body.classList.contains("panel-open")) return; if (e.key === "ArrowRight") goTo(stop + 1); if (e.key === "ArrowLeft") goTo(stop - 1); });

  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    if (!focused && !tween.active) camera.position.copy(fitHome());
  }
  window.addEventListener("resize", resize); resize();

  // ── loop ──
  const clock = new THREE.Clock();
  const state = { hovered: null, focused: null, lookPoint, pointer };
  let introNotified = false;
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    setHover(enabled && space.introDone && !tween.active && !transitioning ? pick() : null);
    pSmooth.lerp(Math.abs(pointer.x) > 2 ? zero : pointer, 0.04);
    if (tween.active) {
      tween.t = Math.min(1, tween.t + dt / tween.dur); const k = tween.ease(tween.t);
      camera.position.lerpVectors(tween.fromPos, tween.toPos, k); camTarget.lerpVectors(tween.fromTgt, tween.toTgt, k);
      camera.fov = tween.fromFov + (tween.toFov - tween.fromFov) * k; camera.updateProjectionMatrix();
      if (tween.t >= 1) { tween.active = false; tween.done && tween.done(); }
    } else if (!focused && !transitioning) {
      const base = fitHome(), amt = inShip() ? 0.45 : 0.9;
      camera.position.x += (base.x + pSmooth.x * amt - camera.position.x) * 0.06;
      camera.position.y += (base.y + pSmooth.y * amt * 0.5 - camera.position.y) * 0.06;
      camera.position.z += (base.z - camera.position.z) * 0.06;
    }
    camera.lookAt(camTarget);
    raycaster.setFromCamera(Math.abs(pointer.x) > 2 ? zero : pointer, camera);
    lookPoint.copy(raycaster.ray.origin).addScaledVector(raycaster.ray.direction, 6);
    state.hovered = hovered; state.focused = focused;
    (inShip() ? ship : space).update(t, dt, state);
    if (!introNotified && space.introDone && enabled) { introNotified = true; onLevel && onLevel(STOPS[0], "intro-done"); }
    renderer.render(scene, camera);
  }
  // compile both worlds up front
  applyWorld(true); renderer.compile(scene, camera); applyWorld(false); renderer.compile(scene, camera);
  renderer.setAnimationLoop(frame);
  requestAnimationFrame(() => { onLevel && onLevel(STOPS[0], "done"); onReady && onReady(); });

  return {
    levels: STOPS.map(s => ({ key: s.key, title: s.title, sub: s.sub })),
    get level() { return stop; },
    goTo, focus, reset,
    levelOf(id) { const r = ship.roomOf(id); return r < 0 ? -1 : r + 1; },
    startIntro() { enabled = true; introNotified = false; space.startIntro(); },
    setEnabled(v) { enabled = v; if (!v) setHover(null); },
    pause() { renderer.setAnimationLoop(null); },
    resume() { clock.getDelta(); renderer.setAnimationLoop(frame); },
    droidScreenPos() {
      if (!inShip()) return { x: -999, y: -999 };
      const d = ship.droid, v = new THREE.Vector3(); d.head.getWorldPosition(v); v.y += 0.35 * d.group.scale.y; v.project(camera);
      const r = el.getBoundingClientRect(); return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height };
    }
  };
}
