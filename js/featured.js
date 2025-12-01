// featured.js
gsap.registerPlugin(ScrollTrigger);

const section   = document.querySelector("#featured");
const pinEl     = section?.querySelector(".featured__pin");
const mediaEl   = section?.querySelector(".featured__media");
const copyEl    = section?.querySelector(".featured__copy");

const eyebrowEl = document.querySelector("#fp-eyebrow");
const titleEl   = document.querySelector("#fp-title");

// Gruppen: ein Wrapper je Projekt (Bild + Sticker)
const itemEls   = gsap.utils.toArray(".featured__item");

// Fallback (falls Wrapper fehlen): nutze Bilder, Sticker-Sync wird dann übersprungen
const imageFallback = itemEls.length ? null : gsap.utils.toArray(".featured__img");

const projects = [
  { eyebrow: "Branding & Website", title: "CUSTOMIZET" },
  { eyebrow: "konzept & design", title: "lost in my 20's" },
  { eyebrow: "konzept & ux-design",    title: "Krimidinner" }

];

/* ---- Parameter ---- */
const WAIT_SCALE   = 0.75;      // Größe des wartenden Projekts
const GAP_RATIO    = 1.1;       // vertikaler Abstand der „wartenden“ Stapel
const MIN_GAP_PX   = 10;
const DUR          = 1.4;
const EASE         = "power2.inOut";

let GAP_PX = 0;
let tl;

/* Textwechsel mit kleinem Fade/Slide */
function setTextByIndex(i) {
  eyebrowEl.textContent = projects[i].eyebrow;
  titleEl.textContent   = projects[i].title;
  gsap.fromTo([eyebrowEl, titleEl],
    { y: 10, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" }
  );
}

/* Startzustand */
function setStart() {
  if (!section || !pinEl || !mediaEl) return;

  // evtl. alte Transforms räumen
  if (itemEls.length) {
    gsap.set(itemEls, { clearProps: "transform,opacity" });
  } else {
    gsap.set(imageFallback, { clearProps: "transform,opacity" });
  }

  // Gap anhand der Media-Höhe
  const H = mediaEl.clientHeight;
  GAP_PX  = Math.max(MIN_GAP_PX, Math.round(H * GAP_RATIO));

  // Text initial
  setTextByIndex(0);

  // Stapel-Start
  if (itemEls.length) {
    // Wir animieren die CONTAINER -> Sticker laufen mit
    gsap.set(itemEls[0], { zIndex: 3, scale: 1.00, y: 0,             autoAlpha: 1, transformOrigin: "center center" });
    if (itemEls[1]) gsap.set(itemEls[1], { zIndex: 2, scale: WAIT_SCALE, y: GAP_PX,      autoAlpha: 1, transformOrigin: "center top" });
    if (itemEls[2]) gsap.set(itemEls[2], { zIndex: 1, scale: WAIT_SCALE, y: GAP_PX * 2,  autoAlpha: 1, transformOrigin: "center top" });

    // Sticker sanft vorbereiten: Aktiver voll sichtbar, andere leicht reduziert
    itemEls.forEach((el, i) => {
      const sticker = el.querySelector(".featured__sticker");
      if (!sticker) return;
      gsap.set(sticker, {
        opacity: i === 0 ? 1 : 1,        // erst sichtbar, wenn Bild final wird
        scale:   i === 0 ? 1 : 0.85,
        transformOrigin: "50% 50%"
      });
    });

  } else if (imageFallback?.length) {
    // Fallback auf Bilder (Sticker-Sync entfällt)
    gsap.set(imageFallback[0], { zIndex: 3, scale: 1.00, y: 0,             autoAlpha: 1, transformOrigin: "center center" });
    if (imageFallback[1]) gsap.set(imageFallback[1], { zIndex: 2, scale: WAIT_SCALE, y: GAP_PX,      autoAlpha: 1, transformOrigin: "center top" });
    if (imageFallback[2]) gsap.set(imageFallback[2], { zIndex: 1, scale: WAIT_SCALE, y: GAP_PX * 2,  autoAlpha: 1, transformOrigin: "center top" });
  }
}

/* Timeline */
function buildTimeline() {
  if (tl) tl.kill();
  if (!section || !pinEl) return;

  tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: `+=${((itemEls.length || imageFallback.length) - 1) * 150}%`,
      scrub: 0.35,
      pin: pinEl,
      anticipatePin: 1
      // markers: true
    }
  });

  const count = itemEls.length || imageFallback.length;

  for (let i = 0; i < count - 1; i++) {
    const label = `step${i}`;

    // Elemente je Step
    const currentItem   = itemEls.length ? itemEls[i]     : imageFallback[i];
    const nextItem      = itemEls.length ? itemEls[i + 1] : imageFallback[i + 1];
    const afterNextItem = (itemEls.length ? itemEls[i + 2] : imageFallback[i + 2]) || null;

    const currentSticker = itemEls.length ? currentItem.querySelector(".featured__sticker") : null;
    const nextSticker    = itemEls.length ? nextItem.querySelector(".featured__sticker")    : null;

    tl.addLabel(label);

    // 1) Visuelle Kartenbewegung (Container animieren, damit Sticker mitlaufen)
    tl.to(currentItem, { scale: WAIT_SCALE, yPercent: -100, ease: EASE, duration: DUR }, label);
    tl.to(nextItem,    { scale: 1.00,       y: 0,          ease: EASE, duration: DUR }, label);
    if (afterNextItem) {
      tl.to(afterNextItem, { y: GAP_PX, ease: EASE, duration: DUR }, label);
    }

    // 2) Sticker-Sync:
    //    - aktueller Sticker blendet aus, während das Bild weg schrumpft
    //    - nächster Sticker blendet gegen Ende des Steps ein (wenn Bild final wird)
    if (currentSticker) {
      tl.to(currentSticker,
        { opacity: 0, scale: 0.85, duration: DUR * 0.6, ease: "power1.inOut" },
        label
      );
    }
    if (nextSticker) {
      tl.fromTo(nextSticker,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1.0, duration: DUR * 0.4, ease: "power1.out" },
        `${label}+=${DUR * 0.6}` // erst sichtbar, wenn das Bild größtenteils „da“ ist
      );
    }

    // 3) Textwechsel etwas später im Step
    tl.add(() => setTextByIndex(i + 1), `${label}+=${DUR * 0.35}`);

    // 4) Z-Order nach dem Step parken
    tl.set(currentItem, { autoAlpha: 0 }, `${label}+=${DUR}`);
    tl.set(nextItem,    { zIndex: 3     }, `${label}+=${DUR}`);
    if (afterNextItem) tl.set(afterNextItem, { zIndex: 2 }, `${label}+=${DUR}`);
  }

  // (Optional) am Timeline-Ende den letzten Sticker minimal „settlen“
  if (itemEls.length) {
    const lastSticker = itemEls[itemEls.length - 1].querySelector(".featured__sticker");
    if (lastSticker) {
      tl.to(lastSticker, { scale: 1.0, opacity: 1, duration: 0.2, ease: "none" }, "+=0");
    }
  }

  // Stabiler Text-Sync bei Scrub (wie gehabt)
  const thresholds = [0];
  for (let i = 0; i < (count - 1); i++) {
    thresholds.push(tl.labels[`step${i}`] + DUR * 0.35);
  }

  let lastIndex = -1;
  tl.eventCallback("onUpdate", () => {
    const t = tl.time();
    let idx = 0;
    for (let k = 0; k < thresholds.length; k++) {
      if (t >= thresholds[k]) idx = k;
    }
    idx = Math.min(idx, projects.length - 1);

    if (idx !== lastIndex) {
      setTextByIndex(idx);
      lastIndex = idx;
    }
  });
}

/* init + resize */
setStart();
buildTimeline();

window.addEventListener("resize", () => {
  setStart();
  buildTimeline();
  ScrollTrigger.refresh();
});