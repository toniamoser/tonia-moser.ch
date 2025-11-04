// js/what-i-do.js
gsap.registerPlugin(ScrollTrigger);

(() => {
  const section  = document.querySelector("#what-i-do");
  if (!section) return;

  const viewport = section.querySelector(".wim__viewport");
  const track    = section.querySelector(".wim__track");
  const cards    = gsap.utils.toArray(".wcard");
  if (!viewport || !track || !cards.length) return;

  // ---- Overlay-Layer über dem Track (für Sticker außerhalb der Karten) ----
  let overlay = section.querySelector(".wim__overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "wim__overlay";
    // oberhalb vom Track platzieren
    viewport.appendChild(overlay);
  }

  /* ---------- Utils ---------- */
  const num  = v => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
  const rand = (min, max) => Math.random() * (max - min) + min;

  // Karten als Bezugsrahmen (falls nötig)
  cards.forEach(card => {
    if (getComputedStyle(card).position === "static") {
      card.style.position = "relative";
    }
  });

  /* ---------- State (genau 1 Karte offen) ---------- */
  let lastOpen = -1;
  const popped = new Set();

  function openCard(i){
    if (i === lastOpen) return;
    lastOpen = i;

    cards.forEach((c, idx) => c.classList.toggle("is-open", idx === i));

    const st = overlay.querySelector(`.wcard__sticker[data-card-index="${i}"]`);
    if (st && !popped.has(i)){
      popped.add(i);
      gsap.fromTo(st,
        { opacity: 0, scale: 0.85, y: "+=10" },
        { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: "back.out(1.8)" }
      );
    }
  }

  /* ---------- Sticker ins Overlay umziehen & zufällig platzieren ---------- */
  function sizeReady(imgEl){
    return new Promise(resolve => {
      if (!imgEl) return resolve();
      if (imgEl.complete && imgEl.naturalWidth > 0) return resolve();
      imgEl.addEventListener("load", () => resolve(), { once: true });
      imgEl.addEventListener("error", () => resolve(), { once: true });
    });
  }

  function moveStickerToOverlay(card, cardIndex){
    const st = card.querySelector(".wcard__sticker");
    if (!st) return null;

    // Falls Sticker noch kein Parent im Overlay hat: klonen oder umhängen
    // Wir hängen **das Original** um, damit src etc. erhalten bleiben.
    // Aber vorher Größe abwarten, damit wir sinnvoll platzieren können.
    return sizeReady(st).then(() => {
      // Zufalls-Offset **relativ zur Card**
      const safetyX = 16;
      const safetyY = 16;

      const cardRect = card.getBoundingClientRect();
      const stW = st.naturalWidth  || st.width  || 64;
      const stH = st.naturalHeight || st.height || 64;

      const usableW = Math.max(0, cardRect.width  - stW - safetyX * 2);
      const usableH = Math.max(0, cardRect.height - stH - safetyY * 2);

      const offX = safetyX + rand(0, usableW);
      const offY = safetyY + rand(0, usableH);
      const rot  = rand(-14, 14);
      const scl  = rand(0.9, 1.15);

      // Daten-Attribute für spätere Reposition bei Scroll
      st.dataset.offsetX = String(offX);
      st.dataset.offsetY = String(offY);
      st.dataset.cardIndex = String(cardIndex);
      st.style.position = "absolute";
      st.style.pointerEvents = "none";

      // In Overlay verschieben (DOM re-parent)
      overlay.appendChild(st);

      // Start-Styles (Rotation/Scale bleiben am Element)
      gsap.set(st, { rotate: rot, scale: scl, opacity: 0 });
      return st;
    });
  }

  function positionStickerForCard(st){
    // Card-Index & Offsets lesen
    const cardIndex = parseInt(st.dataset.cardIndex, 10);
    if (isNaN(cardIndex)) return;

    const card = cards[cardIndex];
    const offX = parseFloat(st.dataset.offsetX || "0");
    const offY = parseFloat(st.dataset.offsetY || "0");

    // Card-Rect relativ zum Viewport
    const r = card.getBoundingClientRect();

    // Overlay ist absolut in viewport, also left/top = Card-Viewport-Pos + Offsets
    const left = r.left + offX;
    const top  = r.top  + offY;

    gsap.set(st, { left, top });
  }

  async function setupStickers(){
    // Alle vorhandenen Sticker der Cards ins Overlay holen
    const stickers = [];
    for (let i = 0; i < cards.length; i++){
      const s = cards[i].querySelector(".wcard__sticker");
      if (s) stickers.push(await moveStickerToOverlay(cards[i], i));
    }

    // Erste Positionierung
    stickers.filter(Boolean).forEach(positionStickerForCard);

    // Bei jedem Scroll/Resize neu positionieren (damit sie mit den Cards „mitfahren“)
    const reposition = () => {
      const all = overlay.querySelectorAll(".wcard__sticker");
      all.forEach(positionStickerForCard);
    };
    // ScrollTrigger Ticker ist performant:
    ScrollTrigger.addEventListener("refresh", reposition);
    ScrollTrigger.addEventListener("scrollEnd", reposition);
    window.addEventListener("resize", reposition);
  }

  /* ---------- Messen für Horizontalfahrt ---------- */
  function measure(){
    const cs   = getComputedStyle(track);
    const gap  = num(cs.gap);
    const padL = num(cs.paddingLeft);
    const padR = num(cs.paddingRight);

    const vpW    = viewport.clientWidth;
    const widths = cards.map(c => c.getBoundingClientRect().width);

    const centers = [];
    let cursor = padL;
    widths.forEach((w, i) => {
      centers.push(cursor + w / 2);
      cursor += w + (i < widths.length - 1 ? gap : 0);
    });

    const startX = -(centers[0]                - vpW / 2);
    const endX   = -(centers[centers.length-1] - vpW / 2);

    return { vpW, centers, startX, endX };
  }

  function indexFromX(data, xTrack){
    const viewCenter = -xTrack + data.vpW / 2;
    let best = 0, bestD = Infinity;
    for (let i = 0; i < data.centers.length; i++){
      const d = Math.abs(viewCenter - data.centers[i]);
      if (d < bestD){ bestD = d; best = i; }
    }
    return best;
  }

  /* ---------- Build ---------- */
  function build(){
    // unsere Triggers killen
    ScrollTrigger.getAll().forEach(t => {
      if (t.vars && t.vars._wimTag) t.kill();
    });

    const data = measure();

    gsap.set(track, { x: data.startX });
    openCard(0);

    const tween = gsap.fromTo(track,
      { x: data.startX },
      { x: data.endX, ease: "none", paused: true }
    );

    ScrollTrigger.create({
      trigger: section,
      start: "center center",
      end:   `+=${Math.max(900, cards.length * 150)}%`,
      scrub: 1,
      pin: section,
      pinSpacing: true,
      anticipatePin: 1,
      animation: tween,
      _wimTag: true,
      onToggle: (st) => {
        section.classList.toggle("wim--pinned", st.isActive);
      },
      onUpdate: () => {
        const x = gsap.getProperty(track, "x");
        const idx = indexFromX(data, x);
        openCard(idx);

        // bei jeder Bewegung die Sticker-Positionen updaten
        const all = overlay.querySelectorAll(".wcard__sticker");
        all.forEach(positionStickerForCard);
      }
    });
  }

  const init = async () => {
    await setupStickers();          // Sticker ins Overlay + initial platzieren
    build();                        // Horizontal-Scroll aufsetzen
    ScrollTrigger.refresh();
  };

  // Fonts/Layout abwarten (Breiten + Stickergrößen)
  if (document.fonts && document.fonts.ready){
    document.fonts.ready.then(() => requestAnimationFrame(init));
  } else {
    window.addEventListener("load", () => requestAnimationFrame(init));
  }

  // Rebuild bei Resize (Fahrt neu messen, Sticker neu positionieren)
  window.addEventListener("resize", () => {
    requestAnimationFrame(() => {
      build();
      // Positionen der Sticker nach neuem Layout korrigieren
      const all = overlay.querySelectorAll(".wcard__sticker");
      all.forEach(positionStickerForCard);
      ScrollTrigger.refresh();
    });
  });
})();