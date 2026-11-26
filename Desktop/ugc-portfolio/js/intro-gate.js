/* Runs in the <head> before the page is drawn.
   The intro plays once per visit: if this browser tab has not seen it yet, turn it on. */
try {
  if (!sessionStorage.getItem("introSeen")) document.documentElement.classList.add("intro-on");
} catch (e) {
  document.documentElement.classList.add("intro-on");   // storage blocked: just play the intro
}
