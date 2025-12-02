gsap.registerPlugin(ScrollTrigger);

(() => {
  const stickers = gsap.utils.toArray(".sticker-pop");
  if (!stickers.length) return;

  stickers.forEach(sticker => {
    gsap.fromTo(sticker,
      { opacity: 0, scale: 0.75, y: 10 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.6,
        ease: "back.out(1.8)",
        scrollTrigger: {
          trigger: sticker,
          start: "top 85%",
          once: true
        }
      }
    );
  });
})();