/* =====================================================================
   js/main.js
   Builds the page: video phones, brand logos, links, tap-to-play.
   ===================================================================== */
/* Video source helper: tries each address in turn (the built-in link first, then the files in the videos/ folder).
   If none of them loads, the "failed" callback runs so the page can say the file was not found. */
function withFallback(video, urls, failed) {
  let n = 0;
  const next = () => { if (n < urls.length) { video.src = urls[n++]; video.load && video.load(); } else if (failed) failed(); };
  video.addEventListener("error", next);
  next();
}
/* =====================================================================
   main.js: builds the repeating parts of the page from simple lists.
   To change content, edit the DATA section below. No other code needed.
   ===================================================================== */

/* ---------- 1. DATA (edit me) ---------- */

// HER LINKS: change these three lines and every icon on the site (and the small icons in the intro) is linked
const CONTACT = {
  email: "romabusiness28@gmail.com",                          // e.g. "roma@gmail.com"
  instagram: "https://www.instagram.com/roma_with_curly",   // her Instagram page link
  tiktok: "https://www.tiktok.com/@mimocurls",        // her TikTok page link
};

// Videos live in /videos/video-N.mp4 with a preview picture in /images/posters/poster-N.jpg
const VIDEOS = {
  1: { title: "Product review",    sub: "Hair care" },
  2: { title: "Hair talk",         sub: "Beach lifestyle" },
  3: { title: "Product reveal",    sub: "Hair care" },
  4: { title: "Hair tips",         sub: "Hair education" },
  5: { title: "Get ready with me", sub: "Tips & stories" },
  6: { title: "Creator collab",    sub: "Lifestyle" },
  7: { title: "Seasonal campaign", sub: "Hair care" },
  8: { title: "New styling",       sub: "Hair care" },
  9: { title: "Hair growth tips",  sub: "Hair education" },
};

// Which videos appear in which row (data-row="..." in index.html)
const ROWS = {
  hair:     [1, 3, 4, 7, 8, 9],
  life:     [2, 5, 6],
  services: [4, 7],       // shown as two overlapping phones (first = back, second = front)
};

// Brands by category. Format: [name, optional note, true if international]
const BRANDS = {
  "Hair care": [
    ["4myhair"], ["Clary"], ["Booth of Beauty"], ["Divol"], ["Curlit"], ["Root to End"], ["Centara"], ["Orb"],
    ["Curlyana"], ["Shi Curly (Skala)", "", true], ["Uzuri"], ["Sunny Isle", "", true], ["So Berry"],
    ["Zero Frizz"], ["Dusk & Dawn"], ["Lazy Republic"], ["Vatika"], ["Tharaa"], ["Root to Tip"],
  ],
  "Skin care": [["Bobai", "sunscreen"], ["Starville"], ["Medicube", "", true], ["Shaan"]],
  "Fashion": [["Bros"], ["Vecoress"], ["Yosy"], ["M.H Handmade"], ["Cozy Nest"]],
  "Wellness & more": [
    ["Amikie", "brushes", true], ["Breathday", "tooth care"], ["Dreamzz", "senses care"],
    ["Numa", "chocolate caffeine"], ["Bloom Ville", "health care"], ["Ginipin", "health care"], ["Eva Senses", "senses care"],
  ],
  "Marketing": [["Bliphub", "marketing agency"]],
};

// Social icons (small inline SVGs so no extra files are needed)
const ICONS = {
  mail: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" style="fill:var(--mail-bg)"/><path d="M12 16h24v16H12z" fill="none" style="stroke:var(--mail-fg)" stroke-width="2.4" stroke-linejoin="round"/><path d="M12.5 16.5 24 26l11.5-9.5" fill="none" style="stroke:var(--mail-fg)" stroke-width="2.4" stroke-linejoin="round"/></svg>',
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
      <div class="screen" role="button" tabindex="0" aria-label="Play or pause video: ${esc(v.title)}">
        <video playsinline preload="none" poster="${PREVIEW_POSTERS[id]}" data-id="${id}"></video>
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

// Brand logo wall, grouped by category. Each brand looks for its logo in /logos/<name-slug>.png
// (then .svg, .webp, .jpg). If no logo file exists yet, the brand name is shown in its place.
const LOGO_TYPES = ["png", "svg", "webp", "jpg"];
const slug = (name) => name.toLowerCase().replace(/&/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const allBrands = Object.values(BRANDS).flat();

function logoHTML([name, note, intl]) {
  return `
    <figure class="logo">
      <div class="logo-img">
        <img data-slug="${slug(name)}" src="${PREVIEW_LOGOS[slug(name)+'.png']||'data:,'}" alt="${esc(name)}">
        <span class="logo-fallback">${esc(name)}</span>
      </div>
      <figcaption>
        <span class="cap-name">${esc(name)}</span>
        ${note ? `<small>${esc(note)}</small>` : ""}
        ${intl ? `<small class="intl">INTERNATIONAL</small>` : ""}
      </figcaption>
    </figure>`;
}

document.getElementById("brand-list").innerHTML = Object.entries(BRANDS)
  .map(([category, list]) => `
    <h3>${esc(category)} <span class="script">(${list.length})</span></h3>
    <div class="logo-wall">${list.map(logoHTML).join("")}</div>`)
  .join("");

// If a logo file is missing, try the next file type; after the last one, show the name instead
document.querySelectorAll(".logo img").forEach((img) => {
  let attempt = 0;
  img.addEventListener("error", () => {
    attempt += 1;
    if (attempt < LOGO_TYPES.length) img.src = PREVIEW_LOGOS[img.dataset.slug+"."+LOGO_TYPES[attempt]] || "data:,";
    else img.closest(".logo").classList.add("no-logo");
  });
});

// Numbers used around the page (hero, summary box...)
const stats = {
  total: allBrands.length,
  hair: BRANDS["Hair care"].length,
  intl: allBrands.filter((b) => b[2]).length,
};
document.querySelectorAll("[data-stat]").forEach((el) => (el.textContent = stats[el.dataset.stat]));

// Social icons
document.querySelectorAll("[data-icon]").forEach((el) => (el.innerHTML = ICONS[el.dataset.icon]));

/* ---------- 4. TAP-TO-PLAY VIDEOS ---------- */
// Give every phone its video: the built-in link first, then videos/video-N.mp4 next to this page
document.querySelectorAll(".screen video").forEach((v) => {
  const id = v.dataset.id;
  withFallback(v, [PREVIEW_VIDEOS[id], `videos/video-${id}.mp4`], () => v.closest(".screen").classList.add("err"));
});
// Tap a phone to play or pause; starting one video pauses the others.
const screens = document.querySelectorAll(".screen");
screens.forEach((screen) => {
  const video = screen.querySelector("video");
  screen.addEventListener("click", () => {
    if (!video.paused) { video.pause(); screen.classList.remove("playing"); return; }
    screens.forEach((other) => {
      other.querySelector("video").pause();
      other.classList.remove("playing");
    });
    video.play().then(() => screen.classList.add("playing")).catch(() => { if (video.error || video.networkState === 3) screen.classList.add("err"); });
  });
  video.addEventListener("ended", () => screen.classList.remove("playing"));
});

/* ---------- DONUTS + AUDIENCE + KEYBOARD (added in the combined version) ---------- */
// AUDIENCE: fill in REAL numbers (leave a value "" to hide it). Brands look for these first.
const AUDIENCE = {
  "Followers": "",          // e.g. "24.5K"
  "Avg. views": "",         // e.g. "12K"
  "Engagement": "",         // e.g. "6.2%"
  "Top audience": "",       // e.g. "Women 18-34, Egypt"
};
const audEntries = Object.entries(AUDIENCE).filter(([, v]) => v);
if (audEntries.length) {
  const box = document.getElementById("audience");
  box.innerHTML = audEntries.map(([k, v]) => `<div><span class="big">${esc(v)}</span><small>${esc(k)}</small></div>`).join("");
  box.hidden = false;
}

// Phones work with the keyboard too (Enter or Space)
document.querySelectorAll(".screen").forEach((sc) => sc.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); sc.click(); }
}));

/* ---------- LINK THE ICONS TO HER ACCOUNTS ---------- */
document.querySelectorAll("[data-link]").forEach((a) => {
  const k = a.dataset.link;
  a.href = k === "email" ? "mailto:" + CONTACT.email : CONTACT[k];
});
// @handle text shown next to the icons, taken from the link itself
document.querySelectorAll("[data-handle]").forEach((el) => {
  const last = CONTACT[el.dataset.handle].replace(/\/+$/, "").split("/").pop();
  el.textContent = last.startsWith("@") ? last : "@" + last;
});