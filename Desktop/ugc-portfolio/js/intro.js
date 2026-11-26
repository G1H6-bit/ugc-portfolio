/* =====================================================================
   intro.js: the entrance animation
   - A 3D phone plays a video in the middle.
   - A ring of video cards (outer) and a ring of TikTok / Instagram icons (inner) turn around it.
   - Cards on the near half of a ring live in the FRONT layer, the far half in the BACK layer,
     and the phone sits between them, so nothing can ever cut through the phone.
   Edit the media paths and the lists at the top; the rest can stay as it is.
   ===================================================================== */

/* ---------- 1. SETTINGS (edit me) ---------- */
const INTRO_VIDEO  = "videos/intro-clip.mp4";            // plays on the phone screen
const INTRO_POSTER = "images/posters/intro-poster.jpg";  // shown until the video starts
const POSTERS = [                                         // pictures on the turning cards
  "images/posters/poster-1.jpg", "images/posters/poster-2.jpg", "images/posters/poster-3.jpg", "images/posters/poster-4.jpg",
  "images/posters/poster-5.jpg", "images/posters/poster-6.jpg", "images/posters/poster-7.jpg",
];

/* Small icon drawings (white, filled) */
const TIKTOK = '<path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9.1a7.3 7.3 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6z"/>';
const INSTA  = '<path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.3-3.3a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/>';
const SHAPES = {
  heart: "M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 5 6.4 5c2 0 3.6 1.1 4.6 2.7h2C14 6.1 15.6 5 17.6 5 21 5 23.1 8.4 21.6 11.8 19.5 16.4 12 21 12 21z",
  star:  "M12 2l3 6.9 7.5.7-5.7 5 1.7 7.3L12 17.8 5.5 21.9l1.7-7.3-5.7-5 7.5-.7z",
  play:  "M7 4l13 8-13 8z",
  chat:  "M3 4h18v12H9l-6 5z",
  spark: "M12 2l2 7 7 3-7 3-2 7-2-7-7-3 7-3z",
};
const COLORS = ["#ff5fa2", "#ffc44d", "#3de0cf", "#ffffff", "#ff5fa2", "#ffc44d"];

/* ---------- 2. FIND THE PAGE PIECES ---------- */
const root  = document.documentElement;
const intro = document.getElementById("intro");
const vid   = document.getElementById("vid");
const rwBack = document.getElementById("rwBack"), rwFront = document.getElementById("rwFront");
const partsBack = document.getElementById("partsBack"), partsFront = document.getElementById("partsFront");
const stages = document.querySelectorAll(".i-stage"), tilts = document.querySelectorAll(".i-tilt");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 3. BUILD THE SCENE (once) ---------- */
let seed = 7;                                                     // same "random" layout every time
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// Outer ring: video cards. face=false means each card turns to face outward.
const cards = POSTERS.map((src, i) => {
  const el = document.createElement("div");
  el.className = "i-c3d";
  el.style.backgroundImage = `url(${src})`;
  return { el, base: i * 360 / POSTERS.length, y: i % 2 ? -36 : 32, face: false };
});
// Inner ring: social icons. face=true means each icon always faces the camera.
const tiles = Array.from({ length: 8 }, (_, i) => {
  const el = document.createElement("div");
  el.className = "i-ico" + (i % 2 ? " i-ig" : "");
  el.innerHTML = `<svg viewBox="0 0 24 24">${i % 2 ? INSTA : TIKTOK}</svg>`;
  return { el, base: i * 45 + 22, y: i % 2 ? -78 : 64, face: true };
});
// Floating hearts, stars, play buttons... placed around the phone (far ones behind it, near ones in front)
const KEYS = Object.keys(SHAPES);
for (let i = 0; i < 16; i++) {
  const p = document.createElement("div");
  p.className = "i-p";
  const x = (i % 2 ? 1 : -1) * (170 + rnd() * 330), y = (rnd() - .5) * 560, z = (rnd() - .4) * 700, w = 26 + rnd() * 34;
  p.style.cssText = `transform:translate3d(${x}px,${y}px,${z}px) rotate(${(rnd() - .5) * 50}deg);color:${COLORS[i % COLORS.length]};--w:${w}px;--d:${3.2 + i * 0.12}s;--t:${3 + rnd() * 3}s`;
  p.innerHTML = `<svg viewBox="0 0 24 24"><path d="${SHAPES[KEYS[i % KEYS.length]]}"/></svg>`;
  (z < 0 ? partsBack : partsFront).appendChild(p);
}

/* ---------- 4. THE TURNING RINGS (runs every frame while the intro is on screen) ---------- */
let t0 = 0, running = false;
const ease = (x) => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 3);

function place(o, radius, spin, grow) {
  const angle = o.base + spin;
  const host = Math.cos(angle * Math.PI / 180) > 0 ? rwFront : rwBack;   // near half -> front layer, far half -> back layer
  if (o.host !== host) { host.appendChild(o.el); o.host = host; }          // the swap happens at the sides, far from the phone
  o.el.style.opacity = grow > .02 ? 1 : 0;
  o.el.style.transform = `rotateY(${angle}deg) translateZ(${radius * grow}px) translateY(${o.y * grow}px)` +
                         (o.face ? ` rotateY(${-angle}deg)` : "") + ` scale(${.3 + .7 * grow})`;
}
function frame(now) {
  if (!running) return;
  const t = reduceMotion ? 20 : (now - t0) / 1000;                         // seconds since the intro started
  const radius = innerWidth < 700 ? 330 : 440;
  const growCards = ease((t - 2.7) / 1.7), growIcons = ease((t - 3.2) / 1.5);
  const spin = reduceMotion ? 0 : Math.max(t - 2.7, 0) * 12;               // cards turn 12 degrees per second
  cards.forEach((c) => place(c, radius, spin, growCards));
  tiles.forEach((c) => place(c, radius * .7, -spin * 1.8, growIcons));     // icons turn the other way, faster
  requestAnimationFrame(frame);
}

/* ---------- 5. FIT THE SCENE TO THE SCREEN + MOVE WITH THE POINTER ---------- */
function fit() {
  const narrow = innerWidth < 700;
  const s = Math.min(innerWidth / (narrow ? 640 : 1150), innerHeight / (narrow ? 1120 : 1080), 1.1);
  stages.forEach((st) => st.style.setProperty("--s", s));
}
addEventListener("resize", fit);
fit();
addEventListener("pointermove", (e) => tilts.forEach((tl) => {
  tl.style.setProperty("--ty", ((e.clientX / innerWidth) - .5) * 18 + "deg");
  tl.style.setProperty("--tx", (.5 - (e.clientY / innerHeight)) * 10 + "deg");
}));

/* ---------- 6. START / LEAVE / REPLAY ---------- */
function start() {
  intro.classList.remove("gone", "leaving");
  intro.classList.add("run");
  if (!vid.getAttribute("src")) { vid.src = INTRO_VIDEO; vid.poster = INTRO_POSTER; }
  vid.currentTime = 0;
  vid.play().catch(() => {});
  t0 = performance.now();
  running = true;
  requestAnimationFrame(frame);
}
function leave(fast) {
  intro.classList.add("leaving");                                          // the camera zooms into the phone screen
  setTimeout(() => {
    intro.classList.add("gone");
    root.classList.remove("intro-on");                                     // the site can scroll again
    running = false;
    vid.pause();
    try { sessionStorage.setItem("introSeen", "1"); } catch (e) {}         // do not show it again this visit
  }, fast ? 120 : 1200);
}
document.getElementById("enter").addEventListener("click", () => leave(false));
document.getElementById("skip").addEventListener("click", () => leave(true));

const replay = document.getElementById("replay-intro");                    // small button in the footer
if (replay) replay.addEventListener("click", () => {
  intro.classList.remove("run");
  root.classList.add("intro-on");
  window.scrollTo(0, 0);
  void intro.offsetWidth;                                                  // restart the CSS animations
  start();
});

if (root.classList.contains("intro-on")) start();                          // the gate script decided the intro should play
else intro.classList.add("gone");
