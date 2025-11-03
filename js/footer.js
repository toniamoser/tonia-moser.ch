// js/footer.js
gsap.registerPlugin(ScrollTrigger);

(() => {
  const footer = document.querySelector(".site-footer__headline");
  if (!footer) return;

  const ig = footer.querySelector(".footer-sticker--mail");
  const lin = footer.querySelector(".footer-sticker--in");

  // kleine „Pop“-Animation
  function pop(el, delay = 0){
    gsap.fromTo(el,
      { opacity: 0, scale: 0.7, y: 8 },
      { opacity: 1, scale: 1, y: 0, duration: 0.7, delay, ease: "back.out(1.8)" }
    );
  }

  ScrollTrigger.create({
    trigger: footer,
    start: "top 80%",
    once: true,
    onEnter: () => {
      pop(ig, 0.1);
      pop(lin, 0.35);
    }
  });
})();