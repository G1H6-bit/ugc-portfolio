/* =====================================================================
   js/intro.js
   The entrance animation (3D phone, turning rings, countdown).
   ===================================================================== */
/* =====================================================================
   intro.js: the entrance animation
   - A 3D phone plays a video in the middle.
   - A ring of video cards (outer) and a ring of TikTok / Instagram icons (inner) turn around it.
   - Cards on the near half of a ring live in the FRONT layer, the far half in the BACK layer,
     and the phone sits between them, so nothing can ever cut through the phone.
   Edit the media paths and the lists at the top; the rest can stay as it is.
   ===================================================================== */

/* ---------- 1. SETTINGS (edit me) ---------- */

/* Small icon drawings (white, filled) */
const TIKTOK = '<path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9.1a7.3 7.3 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6z"/>';
const INSTA  = '<path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.3-3.3a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/>';
const SHAPES = {
  star:  "M12 2l3 6.9 7.5.7-5.7 5 1.7 7.3L12 17.8 5.5 21.9l1.7-7.3-5.7-5 7.5-.7z",
  spark: "M12 2l2 7 7 3-7 3-2 7-2-7-7-3 7-3z",
};
const COLORS = ["var(--a1)", "var(--a2)", "var(--a3)", "var(--a4)", "var(--a1)", "var(--a2)"];   // taken from css/theme.css

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
// Builds one phone-shaped video card (picture first; the clip plays while the mouse is on it)
function makeCard(i) {
  const src = POSTERS[i % POSTERS.length];
  const el = document.createElement("div");
  el.className = "i-c3d";
  el.style.backgroundImage = `url(${src})`;
  const video = document.createElement("video");
  const k = i % CARD_VIDEOS.length;
  withFallback(video, [CARD_VIDEOS[k], `videos/card-${k + 1}.mp4`, `videos/video-${k + 1}.mp4`]);
  video.poster = src;
  video.muted = true; video.loop = true; video.playsInline = true; video.preload = "auto";
  el.appendChild(video);
  const card = { el, video, face: false, target: 0, h: 0, active: false };
  // Mouse: hover plays the video (and zooms the card); moving away pauses it. Touch: tap plays / stops.
  // (a short delay before stopping keeps the video playing if the card wobbles a little under the mouse)
  el.addEventListener("pointerenter", (e) => {
    if (e.pointerType !== "mouse") return;
    clearTimeout(card.timer);
    if (!card.over) { card.over = true; hovered++; }
    play(card); card.target = 1;
  });
  el.addEventListener("pointerleave", (e) => {
    if (e.pointerType !== "mouse") return;
    card.timer = setTimeout(() => {
      if (card.over) { card.over = false; hovered = Math.max(0, hovered - 1); }
      stop(card);
    }, 250);
  });
  el.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") (card.active ? stop(card) : play(card)); });
  return card;
}
let hovered = 0;                                                     // how many cards the mouse is on (the ring slows down while > 0)
// The ring: one card style for all 7 videos
const cards = POSTERS.map((_, n) => {
  const c = makeCard(n);
  c.base = n * 360 / POSTERS.length;
  c.y = n % 2 ? -36 : 32;
  return c;
});
const MAX_PLAYING = 3;                                               // at most 3 cards play at once (the oldest one pauses)
const playing = [];
function play(card) {
  if (card.active) return;
  card.active = true; card.el.classList.add("playing");
  card.video.currentTime = 0; card.video.play().catch(() => {});
  playing.push(card);
  while (playing.length > MAX_PLAYING) stop(playing.shift());
}
function stop(card) {
  card.active = false; card.target = 0; card.el.classList.remove("playing"); card.video.pause();
  const i = playing.indexOf(card); if (i >= 0) playing.splice(i, 1);
}
// Inner ring: social icons. face=true means each icon always faces the camera.
const SOCIAL = (typeof CONTACT !== "undefined") ? CONTACT : {};          // her links come from js/main.js
const tiles = Array.from({ length: 8 }, (_, i) => {
  const el = document.createElement("a");                              // the small icons are real links
  el.href = (i % 2 ? SOCIAL.instagram : SOCIAL.tiktok) || "#"; el.target = "_blank"; el.rel = "noopener";
  el.setAttribute("aria-label", i % 2 ? "Instagram" : "TikTok");
  el.className = "i-ico" + (i % 2 ? " i-ig" : "");
  el.innerHTML = `<svg viewBox="0 0 24 24">${i % 2 ? INSTA : TIKTOK}</svg>`;
  return { el, base: i * 45 + 22, y: i % 2 ? -78 : 64, face: true };
});
// Floating hearts, stars, play buttons... placed around the phone (far ones behind it, near ones in front)
const KEYS = Object.keys(SHAPES);
for (let i = 0; i < 10; i++) {
  const p = document.createElement("div");
  p.className = "i-p";
  const x = (i % 2 ? 1 : -1) * (170 + rnd() * 330), y = (rnd() - .5) * 560, z = (rnd() - .4) * 700, w = 26 + rnd() * 34;
  p.style.cssText = `transform:translate3d(${x}px,${y}px,${z}px) rotate(${(rnd() - .5) * 50}deg);color:${COLORS[i % COLORS.length]};--w:${w}px;--d:${OFF + 3.2 + i * 0.12}s;--t:${3 + rnd() * 3}s`;
  p.innerHTML = `<svg viewBox="0 0 24 24"><path d="${SHAPES[KEYS[i % KEYS.length]]}"/></svg>`;
  (z < 0 ? partsBack : partsFront).appendChild(p);
}

/* ---------- 4. THE TURNING RINGS (runs every frame while the intro is on screen) ---------- */
let t0 = 0, last = 0, spin = 0, spinRate = 1, running = false;
const ease = (x) => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 3);

function place(o, radius, spin, grow) {
  const angle = o.base + spin;
  const host = Math.cos(angle * Math.PI / 180) > 0 ? rwFront : rwBack;   // near half -> front layer, far half -> back layer
  if (o.host !== host) { host.appendChild(o.el); o.host = host; }          // the swap happens at the sides, far from the phone
  o.el.style.opacity = grow > .02 ? 1 : 0;
  o.h = (o.h || 0) + ((o.target || 0) - (o.h || 0)) * .2;                  // smooth zoom while hovered
  o.el.style.transform = `rotateY(${angle}deg) translateZ(${radius * grow}px) translateY(${o.y * grow}px)` +
                         (o.face ? ` rotateY(${-angle}deg)` : "") + ` scale(${(.3 + .7 * grow) * (1 + .16 * o.h)})`;
}
function frame(now) {
  if (!running) return;
  const dt = Math.min((now - last) / 1000, .1); last = now;
  const t = reduceMotion ? 20 : (now - t0) / 1000;                         // seconds since the intro started
  const radius = innerWidth < 700 ? 330 : 440;
  const growCards = ease((t - OFF - 2.7) / 1.7), growIcons = ease((t - OFF - 3.2) / 1.5);
  spinRate += ((hovered ? 0.1 : 1) - spinRate) * 0.12;
  if (!reduceMotion && t > OFF + 2.7) spin += dt * 12 * spinRate;                         // cards turn 12 degrees per second, always
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
addEventListener("pointermove", (e) => hovered || tilts.forEach((tl) => {   // the scene holds still while a card is hovered
  tl.style.setProperty("--ty", ((e.clientX / innerWidth) - .5) * 18 + "deg");
  tl.style.setProperty("--tx", (.5 - (e.clientY / innerHeight)) * 10 + "deg");
}));

/* ---------- 6. START / LEAVE / REPLAY ---------- */
function setInert(on) {   // while the intro covers the page, nothing behind it can be tabbed to
  document.querySelectorAll("body > :not(#intro):not(script)").forEach((el) => { el.inert = on; });
}
function start() {
  intro.classList.remove("gone", "leaving");
  intro.classList.add("run");
  setInert(true);
  if (!vid.getAttribute("src")) { withFallback(vid, [INTRO_VIDEO, "videos/intro-clip.mp4"]); vid.poster = INTRO_POSTER; }
  vid.currentTime = 0;
  vid.play().catch(() => {});
  t0 = last = performance.now(); spin = 0; spinRate = 1; hovered = 0;
  cards.slice().forEach((c) => c.active && stop(c));
  running = true;
  requestAnimationFrame(frame);
}
function leave(fast) {
  intro.classList.add("leaving");                                          // the camera zooms into the phone screen
  setTimeout(() => {
    intro.classList.add("gone");
    root.classList.remove("intro-on");                                     // the site can scroll again
    setInert(false);
    running = false;
    vid.pause();
    cards.slice().forEach((c) => c.active && stop(c));                      // stop every card video
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
else { intro.classList.add("gone"); setInert(false); }
