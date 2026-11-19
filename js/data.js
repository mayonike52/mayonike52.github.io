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
// To add the battle bot later: fill in its video / schematics / github and
// change status to "complete".
export const PROJECTS = [
  {
    id: "battlebot",
    title: "Battle Bot",
    status: "in-progress",
    tags: ["Combat Robotics", "Mechanical Design", "Motor Control"],
    desc: "A combat robot currently being designed and built. Build log, CAD and fight footage coming soon.",
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
    desc: "Optimized a neural network to run in under 2 KB of RAM on an Arduino UNO microcontroller.",
    video: "videos/tinyml.mp4",
    videoCaption: "Network running on Arduino hardware.",
    schematics: [],
    schematicCaption: "",
    github: "https://github.com/mayonike52/Optimized-Neural-Network-on-Arduino-UNO",
    links: []
  }
];

export const SKILLS = [
  { group: "Languages", items: ["C++", "Python", "MATLAB"] },
  { group: "ML / AI",   items: ["MediaPipe", "OpenCV"] },
  { group: "Hardware",  items: ["Arduino", "Raspberry Pi"] }
];
