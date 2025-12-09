// featured.js
gsap.registerPlugin(ScrollTrigger);

const section   = document.querySelector("#featured");
const pinEl     = section?.querySelector(".featured__pin");
const mediaEl   = section?.querySelector(".featured__media");

const eyebrowEl = document.querySelector("#fp-eyebrow");
const titleEl   = document.querySelector("#fp-title");

// Gruppen: ein Wrapper je Projekt (Bild + Sticker)
const itemEls   = gsap.utils.toArray(".featured__item");

// Fallback (falls Wrapper fehlen): nutze Bilder ohne Sticker-Sync
const imageFallback = itemEls.length ? null : gsap.utils.toArray(".featured__img");

const projects = [
  { eyebrow: "Branding & Website",    title: "CUSTOMIZET" },
  { eyebrow: "konzept & design",      title: "lost in my 20's" },
  { eyebrow: "konzept & ux-design",   title: "Krimidinner" }
];

// ---- Parameter ----
const WAIT_SCALE   = 0.75;      // Größe des wartenden Projekts (nur Desktop benutzt)
const GAP_RATIO    = 1.1;       // vertikaler Abstand als Anteil der Media-Höhe
const MIN_GAP_PX   = 10;
const DUR          = 1.4;
const EASE         = "power2.inOut";

let GAP_PX = 0;
let tl;

// Helper: Breakpoint-Check für Mobile-Layout
function isMobile() {
  return window.matchMedia("(max-width: 900px)").matches;
}

// Textwechsel mit kleinem Fade/Slide
function setTextByIndex(i) {
  if (!projects[i]) return;
  eyebrowEl.textContent = projects[i].eyebrow;
  titleEl.textContent   = projects[i].title;

  gsap.fromTo(
    [eyebrowEl, titleEl],
    { y: 10, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" }
  );
}

// Startzustand
function setStart() {
  if (!section || !pinEl || !mediaEl) return;

  const mobile = isMobile();

  // alte Transforms räumen
  if (itemEls.length) {
    gsap.set(itemEls, { clearProps: "transform,opacity" });
  } else if (imageFallback && imageFallback.length) {
    gsap.set(imageFallback, { clearProps: "transform,opacity" });
  }

  // Gap anhand der Media-Höhe
  const H = mediaEl.clientHeight || mediaEl.offsetHeight || 0;
  GAP_PX  = Math.max(MIN_GAP_PX, Math.round(H * GAP_RATIO));

  // Text initial
  setTextByIndex(0);

  const source = itemEls.length ? itemEls : imageFallback;
  if (!source || source.length === 0) return;

  const a = source[0];
  const b = source[1];
  const c = source[2];

  if (!mobile) {
    // ===== DESKTOP-Startzustand =====
    // aktuelles Projekt oben, dahinter gestapelte Projekte
    if (a) {
      gsap.set(a, {
        zIndex: 3,
        scale: 1.0,
        y: 0,
        autoAlpha: 1,
        transformOrigin: "center center"
      });
    }
    if (b) {
      gsap.set(b, {
        zIndex: 2,
        scale: WAIT_SCALE,
        y: GAP_PX,
        autoAlpha: 1,
        transformOrigin: "center top"
      });
    }
    if (c) {
      gsap.set(c, {
        zIndex: 1,
        scale: WAIT_SCALE,
        y: GAP_PX * 2,
        autoAlpha: 1,
        transformOrigin: "center top"
      });
    }
  } else {
    // ===== MOBILE-Startzustand =====
    // Bild 1 steht, 2 + 3 „darunter“, aber höherer zIndex
    if (a) {
      gsap.set(a, {
        zIndex: 1,
        scale: 1.0,
        y: 0,
        autoAlpha: 1,
        transformOrigin: "center center"
      });
    }
    if (b) {
      gsap.set(b, {
        zIndex: 2,
        scale: 1.0,          // kein Resize auf Mobile
        y: GAP_PX,
        autoAlpha: 1,
        transformOrigin: "center top"
      });
    }
    if (c) {
      gsap.set(c, {
        zIndex: 3,
        scale: 1.0,          // kein Resize auf Mobile
        y: GAP_PX * 2,
        autoAlpha: 1,
        transformOrigin: "center top"
      });
    }
  }

  // Sticker vorbereiten (nur, wenn Wrapper vorhanden)
  if (itemEls.length) {
    itemEls.forEach((el, i) => {
      const sticker = el.querySelector(".featured__sticker");
      if (!sticker) return;
      gsap.set(sticker, {
        opacity: 1,
        scale:   i === 0 ? 1 : 0.85,
        transformOrigin: "50% 50%"
      });
    });
  }
}

// Timeline
function buildTimeline() {
  // vorigen TL + ScrollTrigger aufräumen
  if (tl) {
    if (tl.scrollTrigger) tl.scrollTrigger.kill();
    tl.kill();
  }

  if (!section || !pinEl) return;

  const source = itemEls.length ? itemEls : imageFallback;
  const count  = source ? source.length : 0;
  if (!count || count < 2) return;

  const mobile = isMobile();
  let lastIndex = 0;

  tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: `+=${(count - 1) * 150}%`,
      scrub: 0.35,
      pin: pinEl,
      anticipatePin: 1,
      // Text immer passend zur Scroll-Position
      onUpdate(self) {
        const idx = Math.round(self.progress * (count - 1));
        if (idx !== lastIndex) {
          setTextByIndex(idx);
          lastIndex = idx;
        }
      }
      // markers: true
    }
  });

  for (let i = 0; i < count - 1; i++) {
    const label = `step${i}`;

    const currentItem   = source[i];
    const nextItem      = source[i + 1];
    const afterNextItem = source[i + 2] || null;

    const currentSticker = itemEls.length ? currentItem.querySelector(".featured__sticker") : null;
    const nextSticker    = itemEls.length ? nextItem.querySelector(".featured__sticker")    : null;

    tl.addLabel(label);

    // 1) Visuelle Kartenbewegung (Container animieren)
    if (mobile) {
      // ===== MOBILE =====
      // - aktuelles Bild bleibt unverändert
      // - nächstes Bild fährt von unten hoch nach y:0 und bleibt
      // - das danach rutscht in die „Warteschlange“ darunter
      tl.to(nextItem, {
        scale: 1.0,
        y: 0,
        ease: EASE,
        duration: DUR
      }, label);

      if (afterNextItem) {
        tl.to(afterNextItem, {
          y: GAP_PX,
          ease: EASE,
          duration: DUR
        }, label);
      }

    } else {
      // ===== DESKTOP =====
      // - aktuelles Bild fährt komplett nach oben aus dem Viewport (+ Fade)
      // - nächstes Bild rutscht in die Mitte und wird groß
      // - das danach rutscht eins nach
      tl.to(currentItem, {
        scale: WAIT_SCALE,
        yPercent: -120,       // weiter als -100, damit es sicher raus ist
        autoAlpha: 0,         // ausblenden
        ease: EASE,
        duration: DUR
      }, label);

      tl.to(nextItem, {
        scale: 1.0,
        y: 0,
        autoAlpha: 1,
        ease: EASE,
        duration: DUR
      }, label);

      if (afterNextItem) {
        tl.to(afterNextItem, {
          y: GAP_PX,
          ease: EASE,
          duration: DUR
        }, label);
      }
    }

    // 2) Sticker-Sync
    if (currentSticker) {
      tl.to(
        currentSticker,
        { opacity: 0, scale: 0.85, duration: DUR * 0.6, ease: "power1.inOut" },
        label
      );
    }

    if (nextSticker) {
      tl.fromTo(
        nextSticker,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1.0, duration: DUR * 0.4, ease: "power1.out" },
        `${label}+=${DUR * 0.6}`
      );
    }
  }
}

// init + resize
setStart();
buildTimeline();

window.addEventListener("resize", () => {
  setStart();
  buildTimeline();
  ScrollTrigger.refresh();
});