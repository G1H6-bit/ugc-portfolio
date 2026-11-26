/* =====================================================================
   js/gate.js
   Decides if the intro should play (once per visit). Loaded in <head> so it runs first.
   ===================================================================== */
try { if (!sessionStorage.getItem("introSeen")) document.documentElement.classList.add("intro-on"); }
catch (e) { document.documentElement.classList.add("intro-on"); }
