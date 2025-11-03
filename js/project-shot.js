// js/project-shot.js
gsap.registerPlugin(ScrollTrigger);

(() => {
  const section  = document.querySelector("#project-shot-1");
  if (!section) return;

  const frame    = section.querySelector(".project-shot__frame");
  const scribble = section.querySelector(".project-shot__scribble");

  // FRAME bewegt sich zusätzlich → wirkt schneller als die Seite
  // (Summe aus normalem Scroll + transform)
  gsap.fromTo(frame,
    { yPercent: -12 },                 // Start leicht höher
    { yPercent:  -20, ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",           // sobald Section unten einläuft
        end:   "bottom top",           // bis sie oben raus ist
        scrub: true
      }
    }
  );

  // SCRIBBLE darüber: langsamere Gegenbewegung → mehr Tiefe
  if (scribble){
    gsap.fromTo(scribble,
      { y: 10 },
      { y: -10, ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end:   "bottom top",
          scrub: true
        }
      }
    );
  }
})();