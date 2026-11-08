/* =========================================================
   BIOVITA · main.js  (núcleo)
   Responsable: DEV 1
   - Utilidades globales y bus de eventos (window.BIOVITA)
   - Preloader, navegación, barra de progreso
   - Animaciones de aparición (data-reveal / data-split)
   - Botones magnéticos
   ========================================================= */
(function () {
  'use strict';

  const B = (window.BIOVITA = window.BIOVITA || {});
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  B.reduceMotion = reduceMotion;

  /* ---------- Bus de eventos: biovita:ready, biovita:flavor ---------- */
  B.emit = (name, detail) => window.dispatchEvent(new CustomEvent('biovita:' + name, { detail }));
  B.on = (name, fn) => window.addEventListener('biovita:' + name, (e) => fn(e.detail));

  /* ---------- Utilidad: animar números ---------- */
  const fmt = (n, decimals) =>
    n.toLocaleString('es-MX', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  B.animateNumber = function (el, to, opts = {}) {
    const { duration = 1800, decimals = 0, from = parseFloat(el.dataset.current || 0) || 0 } = opts;
    if (reduceMotion) { el.textContent = fmt(to, decimals); el.dataset.current = to; return; }
    const start = performance.now();
    cancelAnimationFrame(el._raf);
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - t, 4); // easeOutQuart
      el.textContent = fmt(from + (to - from) * e, decimals);
      if (t < 1) el._raf = requestAnimationFrame(tick);
      else el.dataset.current = to;
    };
    el._raf = requestAnimationFrame(tick);
  };

  B.clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ---------- Preloader ---------- */
  const t0 = performance.now();
  let loaded = false;
  function finishLoading() {
    if (loaded) return;
    loaded = true;
    const wait = Math.max(0, 1100 - (performance.now() - t0));
    setTimeout(() => {
      body.classList.add('is-loaded');
      body.classList.remove('is-locked');
      B.loaded = true;
      B.emit('ready');
    }, wait);
  }
  if (document.readyState === 'complete') finishLoading();
  else window.addEventListener('load', finishLoading);
  setTimeout(finishLoading, 4000); // seguridad si un recurso externo tarda

  /* ---------- Navegación ---------- */
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links = [...document.querySelectorAll('.nav__links a')];
  links.forEach((a, i) => a.style.setProperty('--i', i));

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    nav.classList.remove('is-hidden');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    body.classList.toggle('is-locked', open);
  }
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  links.forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('is-open')) setMenu(false); });

  // Scroll: estado de la nav + barra de progreso
  const progress = document.getElementById('scrollProgress');
  let lastY = window.scrollY, ticking = false;
  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 20);
    if (!nav.classList.contains('is-open')) nav.classList.toggle('is-hidden', y > lastY && y > 500);
    lastY = y;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // Link activo según la sección visible
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => activeObserver.observe(s));

  /* ---------- Dividir títulos en palabras ---------- */
  function splitWords(el) {
    let index = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'w';
            const inner = document.createElement('span');
            inner.textContent = part;
            inner.style.setProperty('--wi', index++);
            w.appendChild(inner);
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
        }
      });
    };
    walk(el);
  }
  document.querySelectorAll('[data-split]').forEach(splitWords);

  /* ---------- Aparición al hacer scroll ---------- */
  // Escalonado automático para hijos de [data-stagger]
  document.querySelectorAll('[data-stagger]').forEach((parent) => {
    [...parent.querySelectorAll(':scope > [data-reveal]')].forEach((child, i) => {
      if (!child.style.getPropertyValue('--d')) child.style.setProperty('--d', i * 90 + 'ms');
    });
  });

  const revealEls = document.querySelectorAll('[data-reveal], [data-split]');
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('is-visible');
      obs.unobserve(el);
      // Al terminar, se retira data-reveal para que el elemento recupere
      // sus propios transform/hover definidos en el CSS de cada sección.
      if (el.hasAttribute('data-reveal')) {
        const delay = parseFloat(el.style.getPropertyValue('--d')) || 0;
        setTimeout(() => { el.removeAttribute('data-reveal'); el.classList.remove('is-visible'); }, 1200 + delay);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---------- Botones magnéticos ---------- */
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.22}px, ${y * 0.35}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Varios ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
