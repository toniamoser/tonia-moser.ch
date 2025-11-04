// js/principle-media.js
gsap.set(frame, { xPercent: -200, autoAlpha: 0 });

(() => {
  const section = document.querySelector(".principle-media");
  const frame   = section?.querySelector(".principle-media__frame");
  if (!section || !frame) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // PRESTATE: garantiert unsichtbar & off-screen, bevor irgendwas misst/rendered
  frame.classList.add("pm-pre");

  if (reduced) {
    frame.classList.remove("pm-pre");
    gsap.set(frame, { x: 0, clearProps: "transform" });
    return;
  }

  // 1) Scroll-Tween: kompletter Rahmen fährt von links rein (scrub)
  const tween = gsap.fromTo(
    frame,
    { xPercent: -150 }, // immer links außerhalb (relativ zur Rahmenbreite)
    { xPercent: 0, ease: "none", paused: true }
  );

  // 2) ScrollTrigger: steuert Tween + Sichtbarkeit
  ScrollTrigger.create({
  trigger: section,
  start: "top 80%",
  end: "+=200%",
  scrub: true,
  onEnter: () => {
    gsap.to(frame, {
      autoAlpha: 1,
      duration: 0.2
    });
  },
  onLeaveBack: () => {
    gsap.set(frame, { autoAlpha: 0 });
  },
  onUpdate: self => {
    gsap.set(frame, {
      xPercent: gsap.utils.mapRange(0, 1, -200, 0, self.progress)
    });
  }
});

  // robust bei Resize
  window.addEventListener("resize", () => ScrollTrigger.refresh());
})();