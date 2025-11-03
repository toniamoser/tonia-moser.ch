// js/project-feature.js
gsap.registerPlugin(ScrollTrigger);

(() => {
  const section  = document.querySelector("#project-feature-1");
  if (!section) return;

  const scribble = section.querySelector(".project-feature__scribble");
  const sticker  = section.querySelector(".project-feature__sticker");

  // Sticker: Pop-in beim Eintritt
  if (sticker){
    gsap.fromTo(sticker,
      { opacity: 0, scale: 0.85, y: 10 },
      { opacity: 1, scale: 1, y: 0, duration: 0.65, ease: "back.out(1.8)",
        scrollTrigger: { trigger: section, start: "top 75%", once: true }
      }
    );
    // kleiner Drift beim Scrollen (optional)
    gsap.fromTo(sticker,
      { yPercent: 4 },
      { yPercent: -2, ease: "none",
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true }
      }
    );
  }

  // Scribble: dezentes Einblenden + langsamer Drift
  if (scribble){
    gsap.fromTo(scribble,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out",
        scrollTrigger: { trigger: section, start: "top 85%", once: true }
      }
    );
    gsap.fromTo(scribble,
      { y: 20 },
      { y: -10, ease: "none",
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true }
      }
    );
  }
})();