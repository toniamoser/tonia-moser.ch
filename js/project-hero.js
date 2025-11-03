// js/project-hero.js
document.addEventListener("DOMContentLoaded", () => {
  const sticker = document.querySelector(".project-hero__sticker");
  if (!sticker) return;

  // GSAP Startzustand (unsichtbar, leicht verkleinert)
  gsap.set(sticker, {
    opacity: 0,
    scale: 0.75,
    y: 15,
    rotate: -10,
    transformOrigin: "center center"
  });

  // IntersectionObserver – robust, kein ScrollTrigger nötig
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        gsap.to(sticker, {
          opacity: 1,
          scale: 1,
          y: 0,
          rotate: -6,
          duration: 0.8,
          ease: "back.out(1.8)"
        });
        observer.disconnect(); // nur einmal ausführen
      }
    });
  }, { threshold: 0.4 }); // 40 % sichtbar

  observer.observe(sticker);
});