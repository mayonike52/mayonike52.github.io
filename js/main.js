import { PROFILE, PROJECTS, SKILLS, COMBAT } from "./data.js";

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ─────────────────────────────────────────────────────────────
//  Content builders (shared by the 3D panels and the standard view)
// ─────────────────────────────────────────────────────────────
const tagsHTML = tags => tags.map((t, i) => `<span class="tag${i === 0 ? " accent" : ""}">${esc(t)}</span>`).join("");
const statusHTML = p => p.status === "in-progress" ? `<span class="status wip">● in progress</span>` : `<span class="status done">● complete</span>`;

function projectCards() {
  return `<div class="cards">${PROJECTS.map((p, i) => `
    <button class="card" data-project="${p.id}">
      <div class="card-top"><span class="card-num">0${i + 1}</span>${statusHTML(p)}</div>
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.desc)}</p>
      <div class="tags">${tagsHTML(p.tags)}</div>
      <span class="card-cta">${p.status === "in-progress" ? "Peek at progress →" : "Open mission log →"}</span>
    </button>`).join("")}</div>`;
}
function skillsHTML() {
  return `<div class="skills">${SKILLS.map(s => `
    <div class="skill-group"><div class="label">${esc(s.group)}</div>
    <div class="skill-items">${s.items.map(i => `<span class="skill">${esc(i)}</span>`).join("")}</div></div>`).join("")}</div>`;
}
function contactHTML() {
  return `<div class="contact">
    <a class="contact-row" href="mailto:${PROFILE.email}"><span class="ci">✉</span><span><b>Email</b><small>${PROFILE.email}</small></span><span class="arrow">↗</span></a>
    <a class="contact-row" href="${PROFILE.linkedin}" target="_blank" rel="noopener"><span class="ci">in</span><span><b>LinkedIn</b><small>sughosh-desai</small></span><span class="arrow">↗</span></a>
    <a class="contact-row" href="${PROFILE.github}" target="_blank" rel="noopener"><span class="ci">gh</span><span><b>GitHub</b><small>mayonike52</small></span><span class="arrow">↗</span></a>
  </div>`;
}
const PANELS = {
  about: () => `
    <div class="label">// unit specs</div>
    <h2>Hi, I'm Sughosh.</h2>
    <p class="lead">${esc(PROFILE.tagline)}</p>
    ${PROFILE.about.map(p => `<p>${esc(p)}</p>`).join("")}
    <dl class="specs">
      <div><dt>Base</dt><dd>University of Waterloo</dd></div>
      <div><dt>Program</dt><dd>Nanotechnology Engineering</dd></div>
      <div><dt>Focus</dt><dd>Robotics · Embedded · TinyML</dd></div>
      <div><dt>Design team</dt><dd>WATBOT · Bitflip</dd></div>
    </dl>
    <div class="row-btns"><button class="btn" data-go="combat">Combat robotics</button><button class="btn ghost" data-go="projects">Projects</button><a class="btn ghost" href="${PROFILE.resume}" target="_blank" rel="noopener">Resume ↗</a></div>`,
  projects: () => `<div class="label">// mission logs</div><h2>Projects</h2>${projectCards()}`,
  skills: () => `<div class="label">// installed modules</div><h2>Skills</h2>${skillsHTML()}`,
  contact: () => `<div class="label">// comm channel open</div><h2>Get in touch</h2>
    <p>Reach out about projects, opportunities, or anything robotics.</p>${contactHTML()}`,
  resume: () => `<div class="label">// documents</div><h2>Resume</h2>
    <p>The full rundown of my experience, projects and skills.</p>
    <div class="row-btns"><a class="btn" href="${PROFILE.resume}" target="_blank" rel="noopener">Open resume ↗</a><a class="btn ghost" href="${PROFILE.resume}" download>Download PDF</a></div>`
};

// ─────────────────────────────────────────────────────────────
//  Combat robotics section (full-screen "fight card" + standard view)
// ─────────────────────────────────────────────────────────────
function combatHTML(compact = false) {
  const c = COMBAT;
  return `
  <header class="cb-hero">
    <div class="cb-hero-text">
      <div class="label">// combat robotics · ${esc(c.team)}</div>
      <h2 class="cb-name">${esc(c.robot.toUpperCase())}</h2>
      <p class="cb-role">${esc(c.role)} · ${esc(c.dates)}</p>
      <div class="cb-badge"><span>🏆</span><b>4th Place · Semifinalist</b><small>WATBOTS Combat Robotics Tournament 2026</small></div>
      <p class="cb-summary">${esc(c.summary)}</p>
    </div>
    <figure class="cb-photo"><img src="${esc(c.photo)}" alt="Bitflip, a black vertical-spinner combat robot with forks and foam wheels" loading="lazy"></figure>
  </header>
  <div class="cb-stats">${c.stats.map(s => `<div><dt>${esc(s.k)}</dt><dd>${esc(s.v)}</dd></div>`).join("")}</div>

  <section class="cb-block">
    <div class="label">// fight footage</div>
    <h3>${esc(c.video.title)}</h3>
    <div class="media cb-video"><video controls playsinline preload="none" poster="${esc(c.video.poster)}" src="${esc(c.video.src)}"></video></div>
    <p class="caption">${esc(c.video.caption)}</p>
  </section>

  <section class="cb-block">
    <div class="label">// by the numbers</div>
    <div class="cb-numbers">${c.numbers.map(n => `<div class="cb-num"><b data-count="${esc(n.n)}">${esc(n.n)}</b><i>${esc(n.unit)}</i><span>${esc(n.label)}</span></div>`).join("")}</div>
  </section>

  <section class="cb-block cb-split">
    <div>
      <div class="label">// what I did</div>
      <h3>My contributions</h3>
      <ul class="cb-list">${c.contributions.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
    </div>
    ${compact ? "" : `<div class="cb-rig">
      <div class="rig-stage" id="rigStage" title="Drag to flick the spinner">
        <div class="rig-ring"></div>
        ${weaponSVG()}
      </div>
      <div class="rig-ui">
        <span class="label">// weapon test rig</span>
        <div class="rig-meter"><span id="rigBar"></span></div>
        <button class="btn" id="rigSpin">Spin up ⟳</button>
        <small>or drag the weapon to flick it</small>
      </div>
    </div>`}
  </section>

  <section class="cb-block">
    <div class="label">// CAD · SOLIDWORKS</div>
    <h3>Design files</h3>
    <div class="cb-gallery">${c.gallery.map(g => `
      <button class="cb-shot" data-lightbox="${esc(g.src)}" data-caption="${esc(g.title)} — ${esc(g.caption)}">
        <img src="${esc(g.src)}" alt="${esc(g.title)}" loading="lazy">
        <span><b>${esc(g.title)}</b>${esc(g.caption)}</span>
      </button>`).join("")}</div>
  </section>`;
}

// vector spinner (two hooked teeth, 180° symmetric) — same profile as the 3D model
function weaponSVG() {
  const pts = [];
  for (let i = 0; i <= 160; i++) {
    const a = (i / 160) * Math.PI * 2, ph = a % Math.PI;
    const r = 46 + 46 * Math.pow(Math.max(0, 1 - ph / 1.35), 1.5);
    pts.push(`${(100 + Math.cos(a) * r).toFixed(1)},${(100 + Math.sin(a) * r).toFixed(1)}`);
  }
  return `<svg id="rigWeapon" viewBox="0 0 200 200" role="img" aria-label="Bitflip spinner weapon">
    <defs><linearGradient id="wg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c9cfd6"/><stop offset=".5" stop-color="#8b939c"/><stop offset="1" stop-color="#5d646c"/></linearGradient></defs>
    <polygon points="${pts.join(" ")}" fill="url(#wg)" stroke="#e9ecef" stroke-opacity=".35" stroke-width="1.2"/>
    <circle cx="100" cy="100" r="13" fill="#14171b" stroke="#ffcf33" stroke-width="2"/>
    <circle cx="100" cy="100" r="3" fill="#ffcf33"/>
  </svg>`;
}

const combatEl = $("#combat");
let rigRAF = null;
function openCombat() {
  $("#combatBody").innerHTML = combatHTML();
  combatEl.classList.add("open"); combatEl.setAttribute("aria-hidden", "false"); combatEl.scrollTop = 0;
  workshop && workshop.pause();
  countUp(combatEl); startRig();
}
function closeCombat() {
  combatEl.classList.remove("open"); combatEl.setAttribute("aria-hidden", "true");
  cancelAnimationFrame(rigRAF); combatEl.querySelectorAll("video").forEach(v => v.pause());
  setTimeout(() => { $("#combatBody").innerHTML = ""; }, 350);
  if (workshop) { workshop.resume(); workshop.reset(); workshop.setEnabled(true); }
}
$("#combatClose").onclick = closeCombat;

function countUp(scope) {
  scope.querySelectorAll("[data-count]").forEach(el => {
    const raw = el.dataset.count, neg = raw.startsWith("−"), num = parseFloat(raw.replace("−", ""));
    if (isNaN(num) || !/^−?[\d.]+$/.test(raw)) return;
    const dec = (raw.split(".")[1] || "").length, t0 = performance.now();
    const step = now => { const k = Math.min(1, (now - t0) / 1100), e = 1 - Math.pow(1 - k, 3);
      el.textContent = (neg ? "−" : "") + (num * e).toFixed(dec); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}

// draggable spinner: flick it or press spin-up; friction slows it down
function startRig() {
  const stage = $("#rigStage"), img = $("#rigWeapon"), bar = $("#rigBar"); if (!stage) return;
  let angle = 0, vel = 0, dragging = false, lastA = 0, lastT = 0;
  const MAX = 60;
  const ang = e => { const r = stage.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)); };
  stage.onpointerdown = e => { dragging = true; stage.setPointerCapture(e.pointerId); lastA = ang(e); lastT = performance.now(); vel = 0; };
  stage.onpointermove = e => { if (!dragging) return; const a = ang(e), now = performance.now();
    let d = a - lastA; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI;
    angle += d; vel = Math.max(-MAX, Math.min(MAX, d / Math.max(0.001, (now - lastT) / 1000))); lastA = a; lastT = now; };
  stage.onpointerup = stage.onpointercancel = () => { dragging = false; };
  $("#rigSpin").onclick = () => { vel = MAX; };
  let prev = performance.now();
  const loop = now => { const dt = Math.min(0.05, (now - prev) / 1000); prev = now;
    if (!dragging) { angle += vel * dt; vel *= Math.pow(0.55, dt); if (Math.abs(vel) < 0.02) vel = 0; }
    img.style.transform = `rotate(${angle}rad)`;
    const p = Math.min(1, Math.abs(vel) / MAX);
    bar.style.width = `${p * 100}%`; stage.classList.toggle("hot", p > 0.6);
    rigRAF = requestAnimationFrame(loop); };
  rigRAF = requestAnimationFrame(loop);
}

// lightbox for CAD shots
const lb = $("#lightbox");
function openLightbox(src, cap) { $("#lightboxImg").src = src; $("#lightboxCap").textContent = cap || ""; lb.classList.add("open"); }
lb.addEventListener("click", () => lb.classList.remove("open"));

// ─────────────────────────────────────────────────────────────
//  Project modal
// ─────────────────────────────────────────────────────────────
const modal = $("#modalBackdrop");
function openProject(id) {
  const p = PROJECTS.find(x => x.id === id); if (!p) return;
  $("#modalTitle").textContent = p.title;
  $("#modalDesc").textContent = p.desc;
  $("#modalTags").innerHTML = statusHTML(p) + tagsHTML(p.tags);
  const tabs = [];
  if (p.video) tabs.push(["video", "▶ Video"]);
  if (p.schematics.length) tabs.push(["schematics", "▦ Schematics"]);
  tabs.push(["links", "⌥ Code & links"]);
  $("#modalTabs").innerHTML = tabs.map(([k, l], i) => `<button class="${i === 0 ? "active" : ""}" data-tab="${k}">${l}</button>`).join("");
  const render = k => {
    const c = $("#modalContent");
    if (k === "video") c.innerHTML = `<div class="media"><video controls playsinline preload="metadata" src="${esc(p.video)}"></video></div>${p.videoCaption ? `<p class="caption">${esc(p.videoCaption)}</p>` : ""}`;
    else if (k === "schematics") c.innerHTML = p.schematics.map(s => `<div class="media"><img src="${esc(s)}" alt="${esc(p.title)} schematic" loading="lazy"></div>`).join("") + (p.schematicCaption ? `<p class="caption">${esc(p.schematicCaption)}</p>` : "");
    else {
      const links = [...(p.github ? [{ label: "GitHub repository", url: p.github }] : []), ...p.links];
      c.innerHTML = links.length
        ? `<div class="contact">${links.map(l => `<a class="contact-row" href="${esc(l.url)}" target="_blank" rel="noopener"><span class="ci">↗</span><span><b>${esc(l.label)}</b><small>${esc(l.url.replace(/^https?:\/\//, ""))}</small></span><span class="arrow">↗</span></a>`).join("")}</div>`
        : `<div class="wip-box"><div class="wip-stripe"></div><p><b>Build in progress.</b> CAD, build log and fight footage will land here soon.</p></div>`;
    }
  };
  render(tabs[0][0]);
  $("#modalTabs").onclick = e => {
    const b = e.target.closest("button[data-tab]"); if (!b) return;
    $("#modalTabs").querySelectorAll("button").forEach(x => x.classList.toggle("active", x === b));
    render(b.dataset.tab);
  };
  modal.classList.add("open");
}
function closeProject() { modal.classList.remove("open"); $("#modalContent").innerHTML = ""; }
$("#modalClose").onclick = closeProject;
modal.addEventListener("click", e => { if (e.target === modal) closeProject(); });

// delegated clicks for cards + go-buttons anywhere
document.addEventListener("click", e => {
  const shot = e.target.closest("[data-lightbox]"); if (shot) { openLightbox(shot.dataset.lightbox, shot.dataset.caption); return; }
  const card = e.target.closest("[data-project]"); if (card) { openProject(card.dataset.project); return; }
  const go = e.target.closest("[data-go]"); if (go) { e.preventDefault(); select(go.dataset.go); }
});

// ─────────────────────────────────────────────────────────────
//  Standard view
// ─────────────────────────────────────────────────────────────
$("#stdContent").innerHTML = `
  <section class="std-hero">
    <div class="label">// robotics · embedded · tinyml</div>
    <h1>${esc(PROFILE.tagline)}</h1>
    <p>${esc(PROFILE.role)}</p>
    <div class="row-btns"><a class="btn" href="#s-combat">Combat robotics</a><a class="btn ghost" href="#s-projects">Projects</a><a class="btn ghost" href="${PROFILE.github}" target="_blank" rel="noopener">GitHub ↗</a><a class="btn ghost" href="${PROFILE.linkedin}" target="_blank" rel="noopener">LinkedIn ↗</a></div>
  </section>
  <section id="s-about"><div class="label">// about</div><h2>About</h2>${PROFILE.about.map(p => `<p>${esc(p)}</p>`).join("")}</section>
  <section id="s-combat" class="std-combat">${combatHTML(true)}</section>
  <section id="s-projects"><div class="label">// projects</div><h2>Projects</h2>${projectCards()}</section>
  <section id="s-skills"><div class="label">// skills</div><h2>Skills</h2>${skillsHTML()}</section>
  <section id="s-contact"><div class="label">// contact</div><h2>Get in touch</h2>${contactHTML()}</section>
  <footer class="std-foot">Sughosh Desai · ${new Date().getFullYear()}</footer>`;

const std = $("#standard");
new IntersectionObserver((en, ob) => { if (en[0].isIntersecting) { countUp($("#s-combat")); ob.disconnect(); } }, { root: std, threshold: 0.3 }).observe($("#s-combat .cb-numbers"));
let workshop = null;
function showStandard(on) {
  std.classList.toggle("open", on); std.setAttribute("aria-hidden", String(!on));
  document.body.classList.toggle("std-mode", on);
  if (workshop) on ? workshop.pause() : workshop.resume();
  if (!on && !workshop) boot3D();
}
$("#toStandard").onclick = () => showStandard(true);
$("#to3d").onclick = () => showStandard(false);
std.addEventListener("click", e => {
  const a = e.target.closest('a[href^="#s-"]'); if (!a) return;
  e.preventDefault(); std.querySelector(a.getAttribute("href")).scrollIntoView({ behavior: "smooth" });
});

// ─────────────────────────────────────────────────────────────
//  Panel + selection logic
// ─────────────────────────────────────────────────────────────
const panel = $("#panel");
function openPanel(id) {
  $("#panelBody").innerHTML = PANELS[id]();
  panel.classList.add("open"); panel.setAttribute("aria-hidden", "false");
  document.body.classList.add("panel-open");
}
function closePanel() {
  panel.classList.remove("open"); panel.setAttribute("aria-hidden", "true");
  document.body.classList.remove("panel-open");
  workshop && workshop.reset(); workshop && workshop.setEnabled(true);
}
$("#panelClose").onclick = closePanel;
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (lb.classList.contains("open")) lb.classList.remove("open");
  else if (modal.classList.contains("open")) closeProject();
  else if (combatEl.classList.contains("open")) closeCombat();
  else if (panel.classList.contains("open")) closePanel();
});

const DROID_LINES = ["beep boop! I'm SD-01.", "my maker built me. here's the intel →", "bzzt. scanning visitor… friendly."];
let droidLine = 0;
function select(id) {
  if (document.body.classList.contains("std-mode")) {
    const map = { about: "#s-about", combat: "#s-combat", projects: "#s-projects", skills: "#s-skills", contact: "#s-contact" };
    if (map[id]) std.querySelector(map[id]).scrollIntoView({ behavior: "smooth" });
    return;
  }
  if (id === "suit") { toast("MK-0 — a side quest. 8% done, don't look too closely."); return; }
  if (id === "combat") {
    if (panel.classList.contains("open")) { panel.classList.remove("open"); panel.setAttribute("aria-hidden", "true"); document.body.classList.remove("panel-open"); }
    if (workshop) { workshop.focus("combat"); workshop.setEnabled(false); }
    setTimeout(openCombat, workshop ? 800 : 0);
    return;
  }
  const projectIds = PROJECTS.map(p => p.id);
  if (workshop) {
    workshop.focus(id === "projects" ? "trash-robot" : id);
    workshop.setEnabled(false);
  }
  if (id === "about") speak(DROID_LINES[droidLine++ % DROID_LINES.length]);
  if (projectIds.includes(id)) {
    setTimeout(() => { openProject(id); }, workshop ? 700 : 0);
    // when modal closes return the camera home
    const watch = setInterval(() => { if (!modal.classList.contains("open")) { clearInterval(watch); if (!panel.classList.contains("open")) { workshop && workshop.reset(); workshop && workshop.setEnabled(true); } } }, 300);
    return;
  }
  setTimeout(() => openPanel(id), workshop ? 550 : 0);
}

// ─────────────────────────────────────────────────────────────
//  HUD bits: tooltip, droid speech bubble, toast
// ─────────────────────────────────────────────────────────────
const tip = $("#tooltip");
function onHover(info, pos) {
  if (!info) { tip.classList.remove("show"); return; }
  tip.textContent = info.label; tip.classList.add("show");
  if (pos) tip.style.transform = `translate(${pos.x + 16}px, ${pos.y + 18}px)`;
}
const bubble = $("#bubble"); let bubbleTimer;
function speak(text) {
  if (!workshop) return;
  bubble.textContent = text; bubble.classList.add("show");
  clearTimeout(bubbleTimer);
  const follow = () => { if (!bubble.classList.contains("show")) return; const p = workshop.droidScreenPos(); bubble.style.left = p.x + "px"; bubble.style.top = p.y + "px"; requestAnimationFrame(follow); };
  follow();
  bubbleTimer = setTimeout(() => bubble.classList.remove("show"), 2600);
}
const toastEl = $("#toast"); let toastTimer;
function toast(t) { toastEl.textContent = t; toastEl.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2800); }

// ─────────────────────────────────────────────────────────────
//  Boot sequence + 3D init
// ─────────────────────────────────────────────────────────────
const bootEl = $("#boot");
const BOOT = ["> powering on workshop…", "> calibrating servos ........ ok", "> loading SD-01 personality ... ok", "> lights on."];
let bootDone = false;
function endBoot() { if (bootDone) return; bootDone = true; bootEl.classList.add("done"); setTimeout(() => bootEl.remove(), 700); setTimeout(() => speak("hi! click me."), 900); }
$("#bootSkip").onclick = endBoot;

function hasWebGL() { try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); } catch { return false; } }

async function boot3D() {
  if (workshop || !hasWebGL()) return;
  let ready = false;
  const lines = $("#bootLines"), bar = $("#bootBar");
  if (lines) {
    (async () => {
      for (let i = 0; i < BOOT.length && !bootDone; i++) {
        const d = document.createElement("div"); d.textContent = BOOT[i]; lines.appendChild(d);
        bar.style.width = `${((i + 1) / BOOT.length) * 100}%`;
        await new Promise(r => setTimeout(r, 380));
      }
      const wait = () => (ready ? setTimeout(endBoot, 250) : setTimeout(wait, 100)); wait();
    })();
  }
  try {
    const { createWorkshop } = await import("./scene.js");
    workshop = createWorkshop($("#scene"), { onSelect: select, onHover, onReady: () => { ready = true; } });
    if (document.body.classList.contains("std-mode")) workshop.pause();
  } catch (err) {
    console.error(err); endBoot(); showStandard(true);
    $("#to3d").style.display = "none";
  }
}

// phones / no WebGL → start in standard view (3D still one tap away on phones)
const small = window.matchMedia("(max-width: 760px)").matches;
if (!hasWebGL()) { bootEl.remove(); showStandard(true); $("#to3d").style.display = "none"; }
else if (small) { bootEl.remove(); bootDone = true; showStandard(true); }
else boot3D();
