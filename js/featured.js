gsap.registerPlugin(ScrollTrigger);

const section   = document.querySelector("#featured");
const pinEl     = section.querySelector(".featured__pin");
const mediaEl   = section.querySelector(".featured__media");
const images    = gsap.utils.toArray(".featured__img");
const eyebrowEl = document.querySelector("#fp-eyebrow");
const titleEl   = document.querySelector("#fp-title");

const projects = [
  { eyebrow: "Branding & Website", title: "CUSTOMIZET" },
  { eyebrow: "Editorial & Web",    title: "PALM GARDENS" },
  { eyebrow: "Identity & Product", title: "STUDIO RAIN" }
];

/* ---- Parameter ---- */
const WAIT_SCALE   = 0.75;   // Größe des wartenden Bilds
const GAP_RATIO    = 1.1;    // dein aktueller Wert
const MIN_GAP_PX   = 10;     // dein aktueller Mindestabstand
const DUR          = 1.4;
const EASE         = "power2.inOut";

let GAP_PX = 0;
let tl;

/* Helper: Text mit kleinem Fade/Slide setzen */
function setTextByIndex(i) {
  eyebrowEl.textContent = projects[i].eyebrow;
  titleEl.textContent   = projects[i].title;
  gsap.fromTo([eyebrowEl, titleEl],
    { y: 10, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" }
  );
}

/* Startzustand komplett setzen (und bei Resize neu berechnen) */
function setStart() {
  // evtl. CSS-Transforms wegräumen
  gsap.set(images, { clearProps: "transform" });

  const H = mediaEl.clientHeight;
  GAP_PX  = Math.max(MIN_GAP_PX, Math.round(H * GAP_RATIO));

  // Text initial
  setTextByIndex(0);

  // Karten stapeln: oben aktiv, darunter mit konstantem Gap
  gsap.set(images[0], { zIndex: 3, scale: 1.00, y: 0,             autoAlpha: 1, transformOrigin: "center center" });
  if (images[1]) gsap.set(images[1], { zIndex: 2, scale: WAIT_SCALE, y: GAP_PX,      autoAlpha: 1, transformOrigin: "center top" });
  if (images[2]) gsap.set(images[2], { zIndex: 1, scale: WAIT_SCALE, y: GAP_PX * 2,  autoAlpha: 1, transformOrigin: "center top" });
}

function buildTimeline() {
  if (tl) tl.kill();

  tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: `+=${(images.length - 1) * 150}%`, // 2 Übergänge ≈ 300%
      scrub: 0.35,
      pin: pinEl,
      anticipatePin: 1
      // markers: true
    }
  });

  // Animations-Steps (1->2, 2->3)
  images.forEach((current, i) => {
    if (i === images.length - 1) return;

    const next      = images[i + 1];
    const afterNext = images[i + 2];

    const label = `step${i}`;
    tl.addLabel(label);

    // Aktuelles (oben): schrumpfen + komplett nach oben raus
    tl.to(current, { scale: WAIT_SCALE, yPercent: -100, ease: EASE, duration: DUR }, label);

    // Nächstes (unten): wächst auf 100% und rückt exakt nach oben (y:0)
    tl.to(next,    { scale: 1.00,       y: 0,          ease: EASE, duration: DUR }, label);

    // Übernächstes (falls vorhanden): auf denselben Warteslot (=> gleicher Gap wie am Anfang)
    if (afterNext) {
      tl.to(afterNext, { y: GAP_PX, ease: EASE, duration: DUR }, label);
    }

    // Nach dem Step: rausgeschobenes Bild endgültig "parken", Z-Order fixen
    tl.set(current, { autoAlpha: 0 }, `${label}+=${DUR}`);
    tl.set(next,    { zIndex: 3     }, `${label}+=${DUR}`);
    if (afterNext) tl.set(afterNext, { zIndex: 2 }, `${label}+=${DUR}`);
  });

  /* --- STABILER TEXT-SYNC: thresholds an der Timeline, Update je nach Zeit --- */
  const thresholds = [0]; // Zeitpunkte (in tl.time), ab denen Projekt i angezeigt wird
  for (let i = 0; i < images.length - 1; i++) {
    thresholds.push(tl.labels[`step${i}`] + DUR * 0.35); // ~35% nach Step-Beginn
  }
  // example: bei 3 Bildern -> thresholds: [0, t(step0)+0.35*DUR, t(step1)+0.35*DUR]

  let lastIndex = -1;

  tl.eventCallback("onUpdate", () => {
    const t = tl.time();
    // aktiven Index ermitteln: größter Index, dessen threshold <= t
    let idx = 0;
    for (let k = 0; k < thresholds.length; k++) {
      if (t >= thresholds[k]) idx = k;
    }
    // Schutz: clamp
    idx = Math.min(idx, projects.length - 1);

    if (idx !== lastIndex) {
      setTextByIndex(idx);
      lastIndex = idx;
    }
  });
}

/* initial + on resize */
setStart();
buildTimeline();
window.addEventListener("resize", () => {
  setStart();
  buildTimeline();
  ScrollTrigger.refresh();
});


