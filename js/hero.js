(function(){
  const hero    = document.getElementById('hero');
  const box     = hero?.querySelector('.hero__box');
  const title   = hero?.querySelector('.hero__title');
  const sticker = hero?.querySelector('.hero-sticker');
  if (!hero || !box || !title || !sticker) return;

  // 1) erste sichtbare Textzeile im h1
  function firstLineRect(el){
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: n => n.nodeValue.trim().length ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
    });
    const t = walker.nextNode();
    if (!t) return el.getBoundingClientRect();
    const range = document.createRange();
    range.setStart(t, 0);
    range.setEnd(t, 1);
    const rects = range.getClientRects();
    return rects.length ? rects[0] : el.getBoundingClientRect();
  }

  // 2) Zielkoordinaten relativ zur .hero__box
  function computeTarget(){
    const b  = box.getBoundingClientRect();
    const r  = firstLineRect(title);

    // Stickerbreite auch bei visibility:hidden ermitteln
    const sw = parseFloat(getComputedStyle(sticker).width) || 80;

    const lineH  = parseFloat(getComputedStyle(title).lineHeight) || r.height;
    const baseY  = r.top + lineH * 0.72;      // leicht über „Baseline“

    const offsetX = sw * -2.00;                // horizontaler Abstand von der Textkante
    const offsetY = sw * 1.29;                // vertikaler Abstand über Baseline

    const tx = (r.left - b.left) - offsetX;   // Ziel X relativ zu .hero__box
    const ty = (baseY  - b.top)  - offsetY;   // Ziel Y relativ zu .hero__box
    return { tx, ty, sw, boxW: b.width };
  }

  // 3) Startposition: weit links, gleiche Ziel-Y
  function placeAtStart(pos){
    const { tx, ty, boxW, sw } = pos;
    const offLeft = Math.max(window.innerWidth, boxW) + sw; // genug Offscreen-Weg
    const startX  = tx - offLeft;
    const startY  = ty;

    sticker.style.visibility = 'visible';
    sticker.style.opacity    = '0';
    sticker.style.transform  = `translate(${startX}px, ${startY}px) rotate(-540deg) scale(.9)`;
    return { startX, startY, endX: pos.tx, endY: pos.ty };
  }

  // 4) nur horizontal reinrollen (Web Animations API)
  function animateFromTo(coords){
    const { startX, startY, endX, endY } = coords;
    const anim = sticker.animate([
      { transform:`translate(${startX}px, ${startY}px) rotate(-540deg) scale(.9)`, opacity:0 },
      { transform:`translate(${endX}px, ${endY}px) rotate(-12deg) scale(1)`,        opacity:1 }
    ], { duration: 1600, easing:'cubic-bezier(.22,.9,.2,1)', fill:'forwards' });

    anim.onfinish = () => {
      sticker.style.transform = `translate(${endX}px, ${endY}px) rotate(0) scale(1)`;
      sticker.style.opacity   = '1';
    };
  }

  // 5) Ablauf: messen → parken → 1s warten → animieren
  function run(){
    const pos    = computeTarget();
    const coords = placeAtStart(pos);
    setTimeout(() => animateFromTo(coords), 400);
  }

  // Start nach vollständigem Laden (inkl. Bild)
  if (document.readyState === 'complete') {
    run();
  } else {
    window.addEventListener('load', run);
  }

  // Bei Resize Ziel ggf. nachführen, ohne neu zu animieren
  window.addEventListener('resize', () => {
    const { tx, ty } = computeTarget();
    sticker.style.transform = `translate(${tx}px, ${ty}px) rotate(0) scale(1)`;
    sticker.style.opacity   = '1';
  });
})();
