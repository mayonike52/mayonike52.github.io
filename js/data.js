// ─────────────────────────────────────────────────────────────
//  All site content lives here. Edit this file to update the site.
// ─────────────────────────────────────────────────────────────

export const PROFILE = {
  name: "Sughosh Desai",
  role: "Nanotechnology Engineering · University of Waterloo",
  tagline: "Building robots and embedded systems.",
  about: [
    "I design and build hardware and software systems focused on robotics and embedded devices. I enjoy making and prototyping machines that are both useful in real life and push my limits.",
    "I'm currently studying Nanotechnology Engineering at the University of Waterloo, where I get to think about the very, very small problems in engineering."
  ],
  email: "s55desai@uwaterloo.ca",
  github: "https://github.com/mayonike52",
  linkedin: "https://www.linkedin.com/in/sughosh-desai-6a04b528a",
  resume: "resume.pdf"
};

// status: "complete" | "in-progress"
export const PROJECTS = [
  {
    id: "r2",
    title: "R2 Astromech Build",
    status: "in-progress",
    tags: ["Robotics", "Fabrication", "Personal build"],
    desc: "An astromech-style droid I'm building at home right now. Frame, dome and panels are underway. Build log and photos coming soon.",
    video: "",
    videoCaption: "",
    schematics: [],
    schematicCaption: "",
    github: "",
    links: []
  },
  {
    id: "trash-robot",
    title: "Trash Collection Robot",
    status: "complete",
    tags: ["Robotics", "Computer Vision", "Autonomous"],
    desc: "Semi-autonomous robot built on Arduino with obstacle avoidance and a built-in robotic arm that picks up trash. Controlled from a phone over a Bluetooth module.",
    video: "videos/trash-robot.mp4",
    videoCaption: "",
    schematics: ["schematics/trash-robot-wiring.jpg"],
    schematicCaption: "Wiring diagram for motors, sensors, and controller.",
    github: "https://github.com/mayonike52/Trash-Collection-Robot",
    links: []
  },
  {
    id: "tinyml",
    title: "Optimized Neural Network on Arduino UNO",
    status: "complete",
    tags: ["TinyML", "Neural Networks", "Optimization"],
    desc: "Trained a 2-4-3 neural network in Python to classify ambient light into three categories from two LDR sensors, then deployed the optimized weights in embedded C for real-time inference within the Arduino UNO's 2 KB of RAM.",
    video: "videos/tinyml.mp4",
    videoCaption: "Network running on Arduino hardware.",
    schematics: [],
    schematicCaption: "",
    github: "https://github.com/mayonike52/Optimized-Neural-Network-on-Arduino-UNO",
    links: []
  }
];

export const SKILLS = [
  { group: "Languages & Software", items: ["Embedded C / Arduino", "Python", "Pandas", "NumPy", "OpenCV", "MediaPipe"] },
  { group: "CAD",                  items: ["SOLIDWORKS"] },
  { group: "Hardware & Electrical", items: ["PCB Assembly & Testing", "Circuit Debugging", "Sensor Integration", "Microcontrollers", "Soldering"] }
];

// ── Combat robotics section ──────────────────────────────────
export const COMBAT = {
  robot: "Batmobile",
  team: "WATBOT Design Team",
  role: "Design Team Engineer",
  dates: "Sept. 2026 – Present",
  summary: "Batmobile is our team's vertical-spinner combat robot. It finished 4th at the WATBOTS 2026 tournament. I work on its mechanical design: the spinner weapon and the motor-shaft mounts that hold it, modelled in SOLIDWORKS.",
  stats: [
    { k: "Result",  v: "4th place · Semifinalist", sub: "WATBOTS Combat Robotics Tournament 2026" },
    { k: "Weapon",  v: "Vertical spinner" },
    { k: "My role", v: "Weapon & mount design" },
    { k: "CAD",     v: "SOLIDWORKS" }
  ],
  numbers: [
    { n: "3",       unit: "",  label: "design iterations of the weapon and motor-shaft mounts" },
    { n: "−1.21",   unit: "g", label: "removed from the spinner by redesigning its geometry" },
    { n: "(0,0,0)", unit: "",  label: "centre of mass balanced at the origin, without hurting durability" },
    { n: "1",       unit: "cm", label: "clearance kept between the weapon tip and the floor" }
  ],
  contributions: [
    "Iterated on 3 designs of the weapon and motor-shaft mounts so the mount contacts the floor for added traction and stability, while keeping a 1 cm clearance from the weapon tip to the ground.",
    "Redesigned the vertical spinner's geometry in SOLIDWORKS, cutting 1.21 g to balance the centre of mass at (0, 0, 0) without impacting durability."
  ],
  video: { src: "videos/batmobile-vs-bitflip.mp4", poster: "images/batmobile/fight-poster.jpg", title: "Batmobile vs. Bitflip", caption: "Tournament fight. Batmobile (ours) is the black bot with the forks." },
  photo: "images/batmobile/batmobile-photo.jpg",
  gallery: [
    { src: "images/batmobile/cad-assembly.png", title: "Full assembly", caption: "Chassis, forks and spinner in SOLIDWORKS." },
    { src: "images/batmobile/cad-weapon.png",   title: "Spinner weapon", caption: "Redesigned geometry: −1.21 g, COM at the origin." },
    { src: "images/batmobile/cad-mount.png",    title: "Motor-shaft mount", caption: "One of 3 mount iterations; it touches the floor for traction." }
  ]
};

// ── Experience (newest first) ────────────────────────────────
export const EXPERIENCE = [
  {
    org: "WATBOT Design Team", role: "Design Team Engineer", place: "Waterloo, ON", dates: "Sept. 2026 – Present",
    tag: "Combat robotics", link: "combat",
    points: [
      "Iterated on 3 designs of the weapon and motor-shaft mounts so the mount contacts the floor for added traction and stability while keeping a 1 cm clearance from the weapon tip to the ground.",
      "Redesigned the vertical spinner's geometry in SOLIDWORKS, reducing mass by 1.21 g to balance the centre of mass at (0, 0, 0) without impacting durability."
    ]
  },
  {
    org: "Microart Services", role: "Hardware Test & Assembly Co-op", place: "Markham, ON", dates: "July 2024 – Aug. 2024",
    tag: "Hardware",
    points: [
      "Assembled, validated, and visually inspected 30 to 50 PCB, power, and control boards daily against technical product schematics.",
      "Identified and isolated defective units before shipment, diagnosing soldering defects, reversed component polarities, and faulty components."
    ]
  },
  {
    org: "Kumon", role: "Marking Assistant", place: "Markham, ON", dates: "Aug. 2023 – Aug. 2026",
    tag: "Teaching",
    points: [
      "Delivered individualized math and reading instruction to 10 students per hour, adapting explanations to target core learning gaps.",
      "Evaluated and graded coursework quickly, giving targeted feedback to reinforce fundamentals and move students to higher curricula."
    ]
  },
  {
    org: "Cornell Community Centre", role: "Aquatics Assistant", place: "Markham, ON", dates: "Sept. 2023 – Jan. 2024",
    tag: "Teaching",
    points: [
      "Instructed swimming and water-safety classes for groups of 4 to 8 children, teaching lifesaving maneuvers, self-rescue protocols, and water-survival skills.",
      "Evaluated individual swimming proficiency and structured progressive drills to improve stroke technique and safety in the water."
    ]
  }
];

export const EDUCATION = {
  school: "University of Waterloo", degree: "BASc, Nanotechnology Engineering", dates: "Sept. 2026 – Apr. 2031"
};

export const HONORS = [
  "President's Scholarship, University of Waterloo",
  "4th Place / Semifinalist, WATBOTS Combat Robotics Tournament (2026)",
  "Top 20 International Finalist, DECA ICDC (Project Management)"
];
