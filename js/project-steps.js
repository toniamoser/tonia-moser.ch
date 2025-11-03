// js/project-steps.js
gsap.registerPlugin(ScrollTrigger);

(() => {
  const section = document.querySelector("#project-steps");
  if (!section) return;

  const cards            = gsap.utils.toArray(".project-card");
  const leftSticker      = section.querySelector(".steps-sticker--left"); // links neben Copy
  const floatingSticker  = section.querySelector(".project-sticker");     // Sticker über Grid

  // Treppen-Konfig
  const travel = [80, 120, 160];                          // Start-Y pro Karte (px)
  const starts = ["top 85%", "top 80%", "top 75%"];       // Startpunkte pro Karte

  // Karten animieren
  cards.forEach((card, i) => {
    const idx = Math.min(i, travel.length - 1);

    // Startzustand
    gsap.set(card, { y: travel[idx], opacity: 0, scale: 0.98 });

    // „reinscrollen“ mit scrub
    gsap.to(card, {
      y: 0,
      opacity: 1,
      scale: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: card,
        start: starts[idx],
        end: "top 40%",
        scrub: true
      }
    });

    // leichter Drift, solange die Karte durch den Viewport läuft
    gsap.fromTo(card,
      { yPercent: 6 },
      {
        yPercent: 0,
        ease: "none",
        scrollTrigger: {
          trigger: card,
          start: "top bottom",
          end:   "bottom top",
          scrub: true
        }
      }
    );
  });

  // Linker Sticker poppt einmal beim Eintritt der Section
  if (leftSticker) {
    gsap.fromTo(leftSticker,
      { opacity: 0, scale: 0.8, y: 10 },
      {
        opacity: 1, scale: 1, y: 0,
        duration: 0.6, ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          once: true
        }
      }
    );
  }

  // Floating-Sticker über dem Grid – erst sichtbar, wenn im Viewport
  if (floatingSticker) {
    gsap.fromTo(floatingSticker,
      { opacity: 0, scale: 0.8, y: 10 },
      {
        opacity: 1, scale: 1, y: 0,
        duration: 0.6, ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: floatingSticker,
          start: "top 85%",
          once: true
        }
      }
    );

    // (optional) leichter Parallax-Drift des Stickers
    gsap.fromTo(floatingSticker,
      { yPercent: 4 },
      {
        yPercent: -2,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end:   "bottom top",
          scrub: true
        }
      }
    );
  }
})();