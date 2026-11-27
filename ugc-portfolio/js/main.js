/* =====================================================================
   main.js: builds the repeating parts of the page from simple lists.
   To change content, edit the DATA section below. No other code needed.
   ===================================================================== */

/* ---------- 1. DATA (edit me) ---------- */

// Videos live in /videos/video-N.mp4 with a preview picture in /images/posters/poster-N.jpg
const VIDEOS = {
  1: { title: "Product review",    sub: "Hair care" },
  2: { title: "Hair talk",         sub: "Beach lifestyle" },
  3: { title: "Product reveal",    sub: "Hair care" },
  4: { title: "Hair tips",         sub: "Hair education" },
  5: { title: "Get ready with me", sub: "Tips & stories" },
  6: { title: "Creator collab",    sub: "Lifestyle" },
  7: { title: "Seasonal campaign", sub: "Hair care" },
};

// Which videos appear in which row (data-row="..." in index.html)
const ROWS = {
  hair:     [1, 3, 4, 7],
  life:     [2, 5, 6],
  services: [4, 7],       // shown as two overlapping phones (first = back, second = front)
};

// Brands by category. Format: [name, optional note, true if international]
const BRANDS = {
  "Hair care": [
    ["4myhair"], ["Clary"], ["Booth of Beauty"], ["Divol"], ["Curlit"], ["Root to End"], ["Centara"], ["Orb"],
    ["Curlyana"], ["Shi Curly (Skala)", "", true], ["Uzori"], ["Sunny Isle", "", true], ["So Berry"],
    ["Zero Frizz"], ["Dusk & Dawn"], ["Lazy Republic"], ["Vatika"],
  ],
  "Skin care": [["Bobbi"], ["Starville"], ["Medicube", "", true], ["Shaan"]],
  "Fashion": [["Bros"], ["Vecoress"], ["Yosy"], ["M.H Handmade"], ["Cozy Nest"]],
  "Wellness & more": [
    ["Amikie", "brushes", true], ["Breathday", "tooth care"], ["Dreamzz", "senses care"],
    ["Numa", "chocolate caffeine"], ["Bloom Ville", "health care"], ["Ginipin", "health care"], ["Eva Senses", "senses care"],
  ],
};

// Social icons (small inline SVGs so no extra files are needed)
const ICONS = {
  mail: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#000"/><path d="M12 16h24v16H12z" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/><path d="M12.5 16.5 24 26l11.5-9.5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/></svg>',
  instagram: '<svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="11" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="24" cy="24" r="9" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="35" cy="13" r="2.6" fill="currentColor"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9.1a7.3 7.3 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6z"/></svg>',
};

/* ---------- 2. HELPERS ---------- */

// Makes text safe to put inside HTML (so "&" etc. display correctly)
const esc = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// Builds one phone: a poster picture first, the video loads only when tapped
function phoneHTML(id, { label = true, extraClass = "" } = {}) {
  const v = VIDEOS[id];
  return `
    <div class="phone ${extraClass}">
      <div class="screen">
        <video playsinline preload="none" poster="images/posters/poster-${id}.jpg" src="videos/video-${id}.mp4"></video>
        <i>▶</i>
      </div>
      ${label ? `<h3>${esc(v.title)}</h3><span>${esc(v.sub)}</span>` : ""}
    </div>`;
}

/* ---------- 3. BUILD THE PAGE ---------- */

// Video rows (hair, life, services)
document.querySelectorAll("[data-row]").forEach((row) => {
  const ids = ROWS[row.dataset.row] || [];
  const isServices = row.dataset.row === "services";
  row.innerHTML = ids
    .map((id, i) => phoneHTML(id, { label: !isServices, extraClass: isServices ? (i === 0 ? "back" : "front") : "" }))
    .join("");
});

// Brand chips, one group per category
const allBrands = Object.values(BRANDS).flat();
document.getElementById("brand-list").innerHTML = Object.entries(BRANDS)
  .map(([category, list]) => {
    const chips = list
      .map(([name, note, intl]) => `<span class="chip${intl ? " intl" : ""}">${esc(name)}${note ? `<small>${note}</small>` : ""}</span>`)
      .join("");
    return `<h3>${esc(category)} <span class="script">(${list.length})</span></h3>${chips}`;
  })
  .join("");

// Numbers used around the page (hero, summary box...)
const stats = {
  total: allBrands.length,
  hair: BRANDS["Hair care"].length,
  intl: allBrands.filter((b) => b[2]).length,
};
document.querySelectorAll("[data-stat]").forEach((el) => (el.textContent = stats[el.dataset.stat]));

// Donut charts: percentages are worked out from the brand list above
function donutHTML(title, slices) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  let start = 0;
  const stops = slices.map((s) => {
    const end = start + (s.value / total) * 100;
    const stop = `${s.color} ${start}% ${end}%`;
    start = end;
    return stop;
  });
  const legend = slices
    .map((s) => `<span class="sq" style="background:${s.color}"></span>${Math.round((s.value / total) * 100)}% ${esc(s.label)}`)
    .join("<br>");
  return `<div><div class="donut" style="background:conic-gradient(${stops.join(",")})"></div><div class="legend"><b>${title}</b>${legend}</div></div>`;
}
document.getElementById("donuts").innerHTML =
  donutHTML("Category", [
    { label: "Hair care", value: BRANDS["Hair care"].length, color: "#1f5a63" },
    { label: "Skin care", value: BRANDS["Skin care"].length, color: "#bfae8c" },
    { label: "Fashion", value: BRANDS["Fashion"].length, color: "#ffe9c7" },
    { label: "Wellness & more", value: BRANDS["Wellness & more"].length, color: "#7a4a24" },
  ]) +
  donutHTML("Reach", [
    { label: "Local brands", value: stats.total - stats.intl, color: "#ffe9c7" },
    { label: "International", value: stats.intl, color: "#7a4a24" },
  ]);

// Social icons
document.querySelectorAll("[data-icon]").forEach((el) => (el.innerHTML = ICONS[el.dataset.icon]));

/* ---------- 4. TAP-TO-PLAY VIDEOS + SERVICES SWAP ---------- */
// Tap a phone to play or pause; starting one video pauses the others.
// In the Services section, tapping the BACK phone brings it to the front instead.
const screens = document.querySelectorAll(".screen");

function stopVideo(screen) {
  screen.querySelector("video").pause();
  screen.classList.remove("playing");
}

function swapServicesPhones(backPhone) {
  const frontPhone = backPhone.parentElement.querySelector(".phone.front");
  if (!frontPhone) return;
  backPhone.classList.replace("back", "front");
  frontPhone.classList.replace("front", "back");
  stopVideo(frontPhone.querySelector(".screen"));   // the phone going to the back stops playing
}

screens.forEach((screen) => {
  const video = screen.querySelector("video");
  screen.addEventListener("click", () => {
    const phone = screen.closest(".phone");
    if (phone.closest(".duo2") && phone.classList.contains("back")) {
      swapServicesPhones(phone);
      return;
    }
    if (!video.paused) { stopVideo(screen); return; }
    screens.forEach(stopVideo);
    video.play().then(() => screen.classList.add("playing")).catch(() => {});
  });
  video.addEventListener("ended", () => screen.classList.remove("playing"));
});