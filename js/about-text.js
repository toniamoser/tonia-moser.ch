// gsap + ScrollTrigger vorausgesetzt (nutzt du ja bereits)
gsap.registerPlugin(ScrollTrigger);

(() => {
  const blocks = gsap.utils.toArray("#about-text .about-text__block");
  blocks.forEach((el, i) => {
    gsap.fromTo(el,
      { y: 20, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.6, ease: "power2.out", delay: i * 0.08,
        scrollTrigger: { trigger: el, start: "top 80%", once: true }
      }
    );
  });
})();

// js/about-text-sticker.js
gsap.registerPlugin(ScrollTrigger);

(() => {
  const sticker = document.querySelector("#about-text .about-text__sticker");
  if (!sticker) return;

  gsap.fromTo(sticker,
    { opacity: 0, scale: 0.8, y: 8 },
    {
      opacity: 1, scale: 1, y: 0,
      duration: 0.6, delay: 0.65, ease: "back.out(1.8)",
      scrollTrigger: {
        trigger: "#about-text .about-text__blocks",
        start: "top 75%",   // erst wenn der Text gut im Viewport ist
        once: true
      }
    }
  );
})();