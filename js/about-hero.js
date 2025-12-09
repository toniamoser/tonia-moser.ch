// js/about-hero.js
gsap.registerPlugin(ScrollTrigger);

(() => {
  const section = document.querySelector('#about-hero');
  if (!section) return;

  const frame   = section.querySelector('.about-hero__frame');
  const sticker = section.querySelector('.about-hero__sticker');

  // 1) Hier deine 5 Bilder eintragen (Reihenfolge = Reihenfolge im Scroll)
  const IMAGES = [
    'img/me/me-1.jpg',
    'img/me/me-2.jpg',
    'img/me/me-3.jpg',
    'img/me/me-4.jpg',
    'img/me/me-5.jpg',
    'img/me/me-6.jpg',

  ];

  // Bilder in den Frame legen
  const imgs = IMAGES.map(src => {
    const el = document.createElement('img');
    el.src = src;
    el.alt = '';
    frame.appendChild(el);
    return el;
  });
  if (imgs[0]) imgs[0].style.opacity = 1;

  // Sticker poppt leicht verzögert (wie auf der Startseite)
  gsap.fromTo(sticker,
    { opacity: 0, scale: 0.8, y: 10 },
    { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)', delay: 0.35,
      scrollTrigger: { trigger: section, start: 'top 75%', once: true }
    }
  );

  // ----------------------------
  // Pin + Bewegung des Frames:
  // Start: leicht unter H1 (y = +6vh)
  // Ende: größer und nach oben weg (y = -12vh)
  // ----------------------------
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: '+=190%',        // Länge des Pins
      scrub: 0.6,
      pin: true,
      anticipatePin: 1
      // markers: true
    }
  });

  // Anfangsposition setzen (leicht unter H1)
  gsap.set(frame, { y: '6vh', scale: 1 });

  // während des Pins hoch & größer
  tl.to(frame, {
    y: '-12vh',
    scale: 1.12,
    ease: 'none',
    duration: 1
  }, 0);

  // Optional: Sticker an den Frame "koppeln", damit er subtil mitwandert
  // (falls du ihn statisch lassen willst, diesen Block einfach löschen)
  tl.to(sticker, {
    y: '-6vh',
    ease: 'none',
    duration: 1
  }, 0);

  // --- Bildwechsel ohne Fade & ohne Blitzen ---
let lastIndex = 0;
let zCursor   = 1;          // wächst mit, damit jedes neue Bild ganz oben liegt
// const cycles  = 3;       // NICHT MEHR NÖTIG

// Startzustände: nur Bild 0 sichtbar, ganz oben
imgs.forEach((img, i) => {
  gsap.set(img, { opacity: i === 0 ? 1 : 0, zIndex: i === 0 ? zCursor : 0 });
});

tl.eventCallback('onUpdate', () => {
  const p   = tl.progress();          // 0..1
  const n   = imgs.length || 1;

  // verteilt 0..1 einmal auf 0..n-1
  const raw = Math.floor(p * n);
  const idx = Math.min(n - 1, raw);   // bleibt am Ende auf dem letzten Bild

  if (idx !== lastIndex) {
    const next = imgs[idx];
    const prev = imgs[lastIndex];

    // neues Bild zuerst sichtbar + nach ganz oben
    zCursor += 1;
    gsap.set(next, { opacity: 1, zIndex: zCursor });

    // altes Bild sofort deaktivieren (kein Fade)
    gsap.set(prev, { opacity: 0 });

    lastIndex = idx;
  }
});
})();