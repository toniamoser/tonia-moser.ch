// js/principle.js
(() => {
  const section = document.querySelector("#principle");
  if (!section) return;

  const text    = section.querySelector(".principle__text");
  const sticker = section.querySelector(".principle__sticker");

  // Hilfsfunktion: Sticker-Pop
  function popSticker(){
    if (!sticker) return;
    sticker.animate(
      [
        { opacity: 0, transform: 'scale(0.85) rotate(-6deg)' },
        { opacity: 1, transform: 'scale(1.08) rotate(-6deg)' },
        { opacity: 1, transform: 'scale(1) rotate(-6deg)' }
      ],
      { duration: 600, easing: 'cubic-bezier(.22,.9,.34,1.2)', fill: 'forwards' }
    );
  }

  // Sobald die Section vollständig im Viewport ist (threshold: 1.0),
  // Klasse setzen (=> Text-Fade via CSS) + Sticker poppen
  const io = new IntersectionObserver((entries, obs) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        section.classList.add("is-inview");
        // Text ist im CSS verkabelt; Sticker kommt minimal verzögert
        setTimeout(popSticker, 120);
        obs.unobserve(e.target); // nur einmal
      }
    }
  }, { threshold: 1.0 });

  io.observe(section);
})();