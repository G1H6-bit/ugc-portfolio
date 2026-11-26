/* =====================================================================
   js/effects.js
   Contact photo rises in when you scroll to it.
   ===================================================================== */
/* Contact photo: rises in when you scroll to it */
(function () {
  var w = document.querySelector(".archwrap"), box = document.querySelector("#contact");
  if (!w || !box || !("IntersectionObserver" in window)) return;   // old browsers just see the photo
  var shown = false;
  function show() { if (shown) return; shown = true; w.classList.add("in"); }
  w.classList.add("reveal-ready");
  new IntersectionObserver(function (e, o) {
    if (e[0].isIntersecting) { show(); o.disconnect(); }
  }, { threshold: 0.1 }).observe(box);                              // the section is never clipped, so this always fires
  setTimeout(function () {                                         // safety net: the photo can never stay hidden
    var r = box.getBoundingClientRect();
    if (r.top < innerHeight) show();
  }, 1500);
  addEventListener("scroll", function () {
    if (box.getBoundingClientRect().top < innerHeight * 0.85) show();
  }, { passive: true });
})();
