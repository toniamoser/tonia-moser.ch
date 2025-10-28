// js/about-teaser.js
gsap.registerPlugin(ScrollTrigger);

(() => {
  const section = document.querySelector("#about-teaser");
  const stage   = section?.querySelector(".about-teaser__stage");
  const items   = gsap.utils.toArray(".about-teaser__item");
  const content = section?.querySelector(".about-teaser__content");
  const para    = content?.querySelector("p");
  const btn     = content?.querySelector(".about-teaser__btn");

  if (!section || !stage || !content || !items.length) return;

  // ---- Helpers: Einheiten auflösen (px, %, vw, vh). % bezieht sich auf Stage (x -> width, y -> height)
  function resolveUnit(val, axis, stageRect) {
    if (typeof val !== "string") return 0;
    val = val.trim();
    const num = parseFloat(val);
    if (val.endsWith("px")) return num;
    if (val.endsWith("vw")) return (num / 100) * window.innerWidth;
    if (val.endsWith("vh")) return (num / 100) * window.innerHeight;
    if (val.endsWith("%"))  return (num / 100) * (axis === "x" ? stageRect.width : stageRect.height);
    // Fallback: Zahl ohne Einheit -> als px behandeln
    return isNaN(num) ? 0 : num;
  }

  // Breakpoint-Auswahl: lg >= 1024, md >= 768, sonst sm
  function pickEndAttr(el) {
    const w = window.innerWidth;
    if (w >= 1024 && el.dataset.end)      return el.dataset.end;
    if (w >= 768  && el.dataset.endMd)    return el.dataset.endMd;
    if (el.dataset.endSm)                 return el.dataset.endSm;
    return el.dataset.end || "0,0";
  }

  // Zielwerte (in px) aus den data-end* Attributen berechnen
  function getTargetPx(el, stageRect) {
    const raw = pickEndAttr(el);
    const [rawX, rawY] = raw.split(",");
    return {
      x: resolveUnit((rawX || "0").trim(), "x", stageRect),
      y: resolveUnit((rawY || "0").trim(), "y", stageRect),
    };
  }

  let tl;
  const START_FACTOR = 0.35;  // 0 = ganz übereinander, 1 = bereits Endposition
  const EARLY_START  = 160;   // Effekt etwas früher triggern

  function build() {
    if (tl) tl.kill();

    const stageRect = stage.getBoundingClientRect();
    const secTop    = section.getBoundingClientRect().top + window.pageYOffset;
    const cr        = content.getBoundingClientRect();
    const contentCenter = cr.top + window.pageYOffset + cr.height / 2;
    const startOffset   = Math.max(0, Math.round(contentCenter - secTop - EARLY_START));

    // Startzustände
    gsap.set(items, { opacity: 1, scale: 0.85, zIndex: i => items.length - i });
    if (para) gsap.set(para, { autoAlpha: 0, y: 10 });
    if (btn)  gsap.set(btn,  { autoAlpha: 0, y: 10 });

    // für jedes Bild Zielkoordinaten (px) berechnen
    const targets = items.map(el => getTargetPx(el, stageRect));

    tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: `top+=${startOffset} center`,
        end: "+=120%",
        scrub: 0.65,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        // markers: true
      }
    });

    // Von (END * START_FACTOR) -> END (direkt, ohne extra Drift)
    tl.fromTo(items,
      {
        x: (i) => targets[i].x * START_FACTOR,
        y: (i) => targets[i].y * START_FACTOR,
        scale: 0.85
      },
      {
        x: (i) => targets[i].x,
        y: (i) => targets[i].y,
        scale: 1,
        ease: "power2.out",
        duration: 0.9,
        stagger: 0.05
      },
      0
    );

    // p + Button einblenden beim Start der Bewegung
    tl.to([para, btn], {
      autoAlpha: 1,
      y: 0,
      duration: 0.35,
      ease: "power2.out",
      stagger: 0.05
    }, 0.35);
  }

  build();

  // bei Resize ALLES neu berechnen (weil %/vw/vh sich ändern)
  window.addEventListener("resize", () => {
    build();
    ScrollTrigger.refresh();
  });
})();