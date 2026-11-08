/* =========================================================
   BIOVITA · experience.js
   Responsable: DEV 3
   - Línea de tiempo del proceso ligada al scroll
   - Selector de sabores (actualiza colores globales y emite
     el evento "biovita:flavor" que escuchan las escenas 3D)
   - Contadores animados de Impacto
   ========================================================= */
(function () {
  'use strict';
  const B = window.BIOVITA || {};
  const flavors = B.flavors || [];
  const root = document.documentElement;

  /* ---------- Timeline del proceso ---------- */
  const timeline = document.getElementById('timeline');
  if (timeline) {
    const steps = [...timeline.querySelectorAll('.step')];
    let ticking = false;
    const update = () => {
      const r = timeline.getBoundingClientRect();
      const trigger = window.innerHeight * 0.6;
      const p = Math.min(1, Math.max(0, (trigger - r.top) / r.height));
      timeline.style.setProperty('--progress', p.toFixed(4));
      steps.forEach((s) => {
        const dot = s.querySelector('.step__dot').getBoundingClientRect();
        s.classList.toggle('is-active', dot.top + dot.height / 2 < trigger);
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- Selector de sabores ---------- */
  const detail = document.getElementById('flavorDetail');
  const bgWord = document.getElementById('flavorBgWord');
  const swatches = [...document.querySelectorAll('.swatch[data-flavor]')];
  const section = document.getElementById('sabores');

  function renderDetail(f) {
    detail.querySelector('[data-field="tagline"]').textContent = f.tagline;
    detail.querySelector('[data-field="name"]').textContent = f.name;
    detail.querySelector('[data-field="description"]').textContent = f.description;
    detail.querySelector('[data-field="notes"]').innerHTML = f.notes.map((n) => `<li>${n}</li>`).join('');
  }

  function setFlavor(id, { silent = false } = {}) {
    const f = flavors.find((x) => x.id === id);
    if (!f || (B.currentFlavor && B.currentFlavor.id === id && !silent)) return;
    B.currentFlavor = f;

    // Colores globales (transicionan gracias a @property en base.css)
    root.style.setProperty('--flavor', f.color);
    root.style.setProperty('--flavor-2', f.light);
    root.style.setProperty('--flavor-soft', f.soft);

    swatches.forEach((s) => {
      const on = s.dataset.flavor === id;
      s.classList.toggle('is-active', on);
      s.setAttribute('aria-pressed', String(on));
    });

    if (silent) { renderDetail(f); bgWord.textContent = f.name; return; }

    // Transición de salida → cambio de contenido → entrada
    detail.classList.add('is-swapping');
    bgWord.classList.add('is-swapping');
    setTimeout(() => {
      renderDetail(f);
      bgWord.textContent = f.name;
      detail.classList.remove('is-swapping');
      bgWord.classList.remove('is-swapping');
    }, 380);

    B.emit && B.emit('flavor', f);
  }
  B.setFlavor = setFlavor;

  if (detail && flavors.length) {
    setFlavor(flavors[0].id, { silent: true });

    // Autoplay mientras la sección está visible y el usuario no ha elegido
    let autoplay = true, timer = null;
    const next = () => {
      const i = flavors.findIndex((f) => f.id === B.currentFlavor.id);
      setFlavor(flavors[(i + 1) % flavors.length].id);
    };
    const stopAuto = () => { autoplay = false; clearInterval(timer); };

    swatches.forEach((s) => s.addEventListener('click', () => { stopAuto(); setFlavor(s.dataset.flavor); }));

    if (!B.reduceMotion) {
      new IntersectionObserver((entries) => {
        clearInterval(timer);
        if (entries[0].isIntersecting && autoplay) timer = setInterval(next, 4500);
      }, { threshold: 0.4 }).observe(section);
    }
  }

  // Si el usuario elige sabor en el formulario, sincronizamos (detalle de UX)
  document.querySelectorAll('input[name="flavor"]').forEach((r) =>
    r.addEventListener('change', () => r.checked && setFlavor(r.value))
  );

  /* ---------- Contadores ---------- */
  const counters = document.querySelectorAll('.counter[data-to]');
  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      B.animateNumber(el, parseFloat(el.dataset.to), {
        decimals: parseInt(el.dataset.decimals || '0', 10),
        duration: 2200,
        from: 0
      });
      obs.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach((c) => counterObserver.observe(c));
})();
