// js/ribbon.js
(function () {
  const track = document.getElementById("ribbonTrack");
  if (!track) return;

  const SPEED = 0.35; // Pixel Bewegung pro Scrollpixel
  let seqWidth = 0;   // Breite der EINEN Sequenz (ohne Duplikat)
  let ticking = false;

  // 1) Original-Inhalt sichern und 1x duplizieren => ein Track, zweimal hintereinander
  const originalHTML = track.innerHTML;
  track.innerHTML = originalHTML + originalHTML; // seamless loop in einem Element

  function measure() {
    // Die Sequenzbreite = Hälfte der gesamten Trackbreite (weil wir 2x Inhalt haben)
    const total = Math.ceil(track.scrollWidth);
    seqWidth = Math.floor(total / 2);
    // Startposition neutral
    track.style.transform = "translateX(0px)";
  }

  function update() {
    // Scroll-basierte Verschiebung (nach rechts bei Scroll nach unten)
    const s = window.scrollY * SPEED;
    // modulo auf die ORIGINAL-Sequenzbreite -> perfekte Naht
    const offset = - (s % seqWidth);
    track.style.transform = `translateX(${offset}px)`;
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  function init() {
    measure();
    update();
  }

  // warten, bis Fonts/SVGs ihre Breite kennen
  window.addEventListener("load", () => {
    init();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { init(); });
    }
  });

  window.addEventListener("resize", init);
  window.addEventListener("scroll", onScroll, { passive: true });
})();