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
const WAIT_SCALE   = 0.75;    // Größe des wartenden Bilds
const GAP_RATIO    = 1.1;    // 20% der Medienhöhe fühlt sich gut an
const MIN_GAP_PX   = 10;      // Mindest-Weißraum (deine Anforderung)
const DUR          = 1.4;
const EASE         = "power2.inOut";

let GAP_PX = 0;
let tl;

/* Startzustand komplett setzen (und bei Resize neu berechnen) */
function setStart() {
  // evtl. CSS-Transforms wegräumen
  gsap.set(images, { clearProps: "transform" });

  const H = mediaEl.clientHeight;
  GAP_PX  = Math.max(MIN_GAP_PX, Math.round(H * GAP_RATIO));  // => mind. 40px

  // Text initial
  eyebrowEl.textContent = projects[0].eyebrow;
  titleEl.textContent   = projects[0].title;

  // Karten stapeln: oben aktiv, darunter mit konstantem Gap
  gsap.set(images[0], { zIndex: 3, scale: 1.00, y: 0,            autoAlpha: 1, transformOrigin: "center center" });
  if (images[1]) gsap.set(images[1], { zIndex: 2, scale: WAIT_SCALE, y: GAP_PX,         autoAlpha: 1, transformOrigin: "center top" });
  if (images[2]) gsap.set(images[2], { zIndex: 1, scale: WAIT_SCALE, y: GAP_PX * 2,     autoAlpha: 1, transformOrigin: "center top" });
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

  images.forEach((current, i) => {
    if (i === images.length - 1) return;

    const next      = images[i + 1];
    const afterNext = images[i + 2];
    const proj      = projects[i + 1];

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

    // Text früher wechseln (~35% im Step)
    tl.add(() => {
      eyebrowEl.textContent = proj.eyebrow;
      titleEl.textContent   = proj.title;
      gsap.fromTo([eyebrowEl, titleEl], { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" });
    }, `${label}+=${DUR * 0.35}`);

    // Nach dem Step: rausgeschobenes Bild endgültig "parken", Z-Order fixen
    tl.set(current, { autoAlpha: 0 }, `${label}+=${DUR}`);
    tl.set(next,    { zIndex: 3     }, `${label}+=${DUR}`);
    if (afterNext) tl.set(afterNext, { zIndex: 2 }, `${label}+=${DUR}`);
  });
}

/* initial + on resize */
setStart();
buildTimeline();
window.addEventListener("resize", () => {
  setStart();
  ScrollTrigger.refresh();
});