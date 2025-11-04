// js/statement-feature.js
gsap.registerPlugin(ScrollTrigger);

(() => {
  const section  = document.querySelector("#statement-feature");
  if (!section) return;

  const img     = section.querySelector(".statement-feature__img");
  const sticker = section.querySelector(".statement-feature__sticker");

  /* --- Startzustände --- */
  gsap.set(img, {
    xPercent: 120   // << weiter rechts außerhalb des Bildes
  });

  gsap.set(sticker, {
    autoAlpha: 0,
    scale: 0.7,
    y: 12
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "+=150%",
      scrub: 0.85,
      pin: true,
      anticipatePin: 1,
      // markers: true
    }
  });

  /* --- Phase 1 — Statement allein --- */
  tl.to({}, { duration: 0.45 });

  /* --- Phase 2 — Bild fährt rein --- */
  tl.to(img, {
    xPercent: 0,
    ease: "power2.out",
    duration: 1.4,
  });

  /* --- Phase 3 — Sticker poppt --- */
  tl.to(sticker, {
    autoAlpha: 1,
    scale: 1,
    y: 0,
    ease: "back.out(1.7)",
    duration: 0.45,
  }, ">-0.25");
})();