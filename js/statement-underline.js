// js/statement-underline.js
(function () {
  const section = document.getElementById('statement');
  if (!section) return;

  const svg  = section.querySelector('.underline-svg');
  const path = section.querySelector('.underline-svg path'); // dein EIN Pfad

  let prepared = false;

  // SVG so framen, dass der Pfad proportional & zentriert dargestellt wird
  function fitViewBoxToPath() {
    const bb  = path.getBBox();
    const pad = 2; // ganz kleine Luft
    svg.setAttribute('viewBox', `${bb.x - pad} ${bb.y - pad} ${bb.width + pad*2} ${bb.height + pad*2}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  }

  // Start: unsichtbar OHNE Transition (kein Flackern)
  function prepareDash() {
    path.style.transition = 'none';

    const len = path.getTotalLength();
    const sw  = parseFloat(getComputedStyle(path).strokeWidth) || 3;

    // Großzügiger Puffer, damit sicher bis ganz rechts gezeichnet wird
    const pad = Math.max(48, sw * 12);
    const dash = Math.ceil(len + pad);

    // "ein Dash + eine Lücke" → Start garantiert links bei 0
    path.style.strokeDasharray  = `${dash} ${dash}`;
    path.style.strokeDashoffset = `${dash}`;

    // Reflow erzwingen, damit die Styles sicher angewendet sind
    void path.getBoundingClientRect();

    prepared = true;
  }

  // Zeichnen erst bei Sichtbarkeit; Transition jetzt aktivieren
  function drawLine() {
    if (!prepared) prepareDash();
    path.style.transition = 'stroke-dashoffset 1.35s cubic-bezier(.25,.9,.25,1) .15s';
    path.style.strokeDashoffset = '0';
  }

  function observe() {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          drawLine();
          section.classList.add('is-visible'); // falls du Sticker-Pop nutzt
          io.disconnect();
          break;
        }
      }
    }, {
      threshold: 0.6,                 // erst wenn ~60% sichtbar
      rootMargin: '0px 0px -10% 0px'  // leicht später
    });
    io.observe(section);
  }

  function init() {
    if (!svg || !path) return;
    fitViewBoxToPath();
    prepareDash();   // Start unsichtbar & ohne Transition
    observe();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Stabil bei Resize (nicht neu zeichnen)
  window.addEventListener('resize', () => {
    if (!svg || !path) return;
    const alreadyDrawn = getComputedStyle(path).strokeDashoffset === '0px';
    fitViewBoxToPath();

    // Dash-Werte nachziehen (ohne Transition)
    const len = path.getTotalLength();
    const sw  = parseFloat(getComputedStyle(path).strokeWidth) || 3;
    const pad = Math.max(48, sw * 12);
    const dash = Math.ceil(len + pad);

    path.style.transition = 'none';
    path.style.strokeDasharray  = `${dash} ${dash}`;
    path.style.strokeDashoffset = alreadyDrawn ? '0' : `${dash}`;
    void path.getBoundingClientRect();
  });
})();