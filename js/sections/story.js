/* =========================================================
   BIOVITA · story.js
   Responsable: DEV 2
   - Medidor de DQO animado (Problema)
   - Switch Modelo lineal / circular (Solución)
   - Efecto tilt + luz en tarjetas de Beneficios
   ========================================================= */
(function () {
  'use strict';
  const B = window.BIOVITA || {};
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Medidor DQO ---------- */
  const meter = document.querySelector('[data-meter]');
  if (meter) {
    new IntersectionObserver((entries, obs) => {
      if (!entries[0].isIntersecting) return;
      meter.classList.add('is-on');
      meter.querySelectorAll('.meter__bar i').forEach((bar) => {
        const pct = (parseFloat(bar.dataset.value) / parseFloat(bar.dataset.max)) * 100;
        bar.style.width = Math.max(pct, 1.5) + '%';
      });
      obs.disconnect();
    }, { threshold: 0.5 }).observe(meter);
  }

  /* ---------- Modelo lineal vs circular ---------- */
  const switchEl = document.querySelector('.model-switch');
  const stage = document.querySelector('.model-stage');
  if (switchEl && stage) {
    const buttons = [...switchEl.querySelectorAll('[data-model]')];
    let userInteracted = false;

    const setModel = (model) => {
      stage.dataset.active = model;
      switchEl.classList.toggle('is-circular', model === 'circular');
      buttons.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.model === model)));
      stage.querySelector('.model--linear').setAttribute('aria-hidden', String(model !== 'linear'));
      stage.querySelector('.model--circular').setAttribute('aria-hidden', String(model !== 'circular'));
    };

    buttons.forEach((b) => b.addEventListener('click', () => { userInteracted = true; setModel(b.dataset.model); }));

    // Narrativa: al ver la sección, primero se muestra el modelo lineal
    // y luego se transforma automáticamente en el modelo circular.
    new IntersectionObserver((entries, obs) => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      setTimeout(() => { if (!userInteracted) setModel('circular'); }, 2600);
    }, { threshold: 0.6 }).observe(stage);
  }

  /* ---------- Tilt en tarjetas de beneficios ---------- */
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.b-card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', px * 100 + '%');
        card.style.setProperty('--my', py * 100 + '%');
        card.style.transform = `rotateX(${(0.5 - py) * 10}deg) rotateY(${(px - 0.5) * 12}deg) translateY(-6px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }
})();
