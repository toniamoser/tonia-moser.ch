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