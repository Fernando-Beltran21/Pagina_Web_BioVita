/* =========================================================
   BIOVITA · conversion.js
   Responsable: DEV 4
   - Selector de botellas/semana con precio animado
   - Filtro del equipo con transición
   - Acordeón de FAQ
   - Validación y envío del formulario (simulado)
   - Botón "volver arriba"
   ========================================================= */
(function () {
  'use strict';
  const B = window.BIOVITA || {};

  /* ---------- Precio de suscripción ---------- */
  const priceEl = document.getElementById('subPrice');
  const saveEl = document.getElementById('subSave');
  const qtyButtons = [...document.querySelectorAll('.qty-toggle [data-qty]')];
  const UNIT_PRICE = 25;   // precio de botella individual
  const WEEKS = 4;

  if (priceEl) {
    const prices = JSON.parse(priceEl.dataset.prices);
    priceEl.dataset.current = prices['1'];

    const updateSave = (qty) => {
      const monthly = prices[qty];
      const perBottle = monthly / (qty * WEEKS);
      const saving = Math.round((1 - perBottle / UNIT_PRICE) * 100);
      saveEl.style.opacity = 0;
      setTimeout(() => {
        saveEl.textContent = `≈ $${perBottle.toFixed(2)} por botella · ahorras ${saving}%`;
        saveEl.style.opacity = 1;
      }, 250);
    };

    qtyButtons.forEach((btn) => btn.addEventListener('click', () => {
      const qty = btn.dataset.qty;
      qtyButtons.forEach((b) => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      B.animateNumber(priceEl, prices[qty], { duration: 800 });
      updateSave(qty);
    }));
  }

  /* ---------- Filtro del equipo ---------- */
  const filterButtons = [...document.querySelectorAll('.team-filter [data-filter]')];
  const members = [...document.querySelectorAll('.member')];

  filterButtons.forEach((btn) => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    filterButtons.forEach((b) => {
      b.classList.toggle('is-active', b === btn);
      b.setAttribute('aria-pressed', String(b === btn));
    });

    // 1) salida
    members.forEach((m) => {
      const show = f === 'all' || m.dataset.area === f;
      if (!show) m.classList.add('is-filtered-out');
    });
    // 2) reacomodo + entrada
    setTimeout(() => {
      members.forEach((m) => {
        const show = f === 'all' || m.dataset.area === f;
        m.classList.toggle('is-gone', !show);
        if (show) {
          m.classList.add('is-filtered-out');
          requestAnimationFrame(() => requestAnimationFrame(() => m.classList.remove('is-filtered-out')));
        }
      });
    }, 350);
  }));

  /* ---------- FAQ (acordeón) ---------- */
  const items = [...document.querySelectorAll('.acc-item')];
  items.forEach((item) => {
    const q = item.querySelector('.acc-item__q');
    q.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      items.forEach((other) => {
        other.classList.remove('is-open');
        other.querySelector('.acc-item__q').setAttribute('aria-expanded', 'false');
      });
      item.classList.toggle('is-open', open);
      q.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------- Formulario ---------- */
  const form = document.getElementById('leadForm');
  if (form) {
    const card = form.closest('.form-card');
    const rules = {
      name: (v) => v.trim().length >= 2 || 'Escribe tu nombre (mínimo 2 letras).',
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Escribe un correo válido.',
      city: (v) => v !== '' || 'Selecciona tu municipio.'
    };

    const validateField = (input) => {
      const rule = rules[input.name];
      if (!rule) return true;
      const result = rule(input.value);
      const field = input.closest('.field');
      const error = field.querySelector('.field__error');
      const ok = result === true;
      field.classList.remove('is-invalid');
      if (!ok) { void field.offsetWidth; field.classList.add('is-invalid'); }
      error.textContent = ok ? '' : result;
      input.setAttribute('aria-invalid', String(!ok));
      return ok;
    };

    Object.keys(rules).forEach((name) => {
      const input = form.elements[name];
      input.addEventListener('blur', () => input.value && validateField(input));
      input.addEventListener('input', () => input.closest('.field').classList.contains('is-invalid') && validateField(input));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputs = Object.keys(rules).map((n) => form.elements[n]);
      const valid = inputs.map(validateField).every(Boolean);
      if (!valid) { inputs.find((i) => i.getAttribute('aria-invalid') === 'true').focus(); return; }

      const data = Object.fromEntries(new FormData(form));
      // TODO (DEV 4): conectar con un backend real (Formspree, Google Forms, Firebase…)
      console.info('[Biovita] Nuevo registro', data);

      const btn = form.querySelector('[type="submit"]');
      btn.disabled = true;
      btn.firstChild.textContent = 'Enviando… ';
      setTimeout(() => {
        document.getElementById('successName').textContent = data.name.trim().split(' ')[0];
        card.classList.add('is-sent');
        btn.disabled = false;
        btn.firstChild.textContent = 'Unirme a la lista ';
      }, 900);
    });

    document.getElementById('formReset').addEventListener('click', () => {
      form.reset();
      card.classList.remove('is-sent');
      setTimeout(() => form.elements.name.focus(), 500);
    });
  }

  /* ---------- Volver arriba ---------- */
  const toTop = document.getElementById('toTop');
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();
