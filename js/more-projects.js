// js/more-projects.js
gsap.registerPlugin(ScrollTrigger);

(() => {
  const section = document.querySelector("#more-projects");
  if (!section) return;

  const cards   = [ ...section.querySelectorAll(".mp-card--left, .mp-card--right") ];
  const sticker = section.querySelector(".more-projects__sticker");

  // Cards pop-in
  gsap.fromTo(
    cards,
    { y: 80, opacity: 0, scale: 0.92 },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      stagger: 0.18,
      duration: 0.7,
      ease: "power3.out",
      scrollTrigger: {
        trigger: section,
        start: "top 70%",   // ✅ später → erst sichtbar & dann pop
        once: true
      }
    }
  );

  // Sticker Pop
  if (sticker) {
    gsap.fromTo(
      sticker,
      { opacity: 0, scale: 0.7, y: 12 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.9,
        delay: 0.25,            // <<––––– NEU: späteres Pop
        ease: "back.out(1.9)",
        scrollTrigger: {
          trigger: section,
          start: "top 10%", // ✅ ähnlich spät
          once: true
        }
      }
    );
  }
})();