# Biovita · Landing page

Landing page promocional de **Biovita** — *Sabor con vida* —, una bebida fermentada de lactosuero fortificada con probióticos, vitaminas y minerales.

> La información del sitio está alineada con la presentación oficial del proyecto (problema, producto, diferenciadores, proceso de 10 pasos, TAM/SAM/SOM y estrategia de promoción).
Stack: **HTML + CSS + JavaScript (vanilla) + Three.js** (vía CDN, sin build).

---

## ▶️ Cómo correrla

Las escenas 3D usan *ES modules*, así que el navegador **no las carga si abres `index.html` con doble clic** (`file://`).
Usa un servidor local:

```bash
# Opción 1: VS Code → extensión "Live Server" → clic derecho en index.html → "Open with Live Server"
# Opción 2: Node
npx serve .
# Opción 3: Python
python -m http.server 5500
```

> Sin servidor, la página funciona igual, pero muestra una botella hecha con CSS en lugar de la 3D.

---

## 🧩 Secciones

| # | Sección | Objetivo | Interacción / transición |
|---|---------|----------|--------------------------|
| 0 | Preloader + Nav | Primera impresión, navegación | Gota que se llena, cortina con `clip-path`, nav que se oculta al bajar, menú móvil circular |
| 1 | **Hero** | Captar atención y explicar qué es | Botella 3D flotante con cápsulas probióticas y burbujas, reacciona al mouse y al scroll |
| 2 | **Problema** | Generar conciencia (lactosuero + salud digestiva) | Barras de DQO animadas, títulos palabra por palabra |
| 3 | **Solución** | Economía circular + ¿Qué nos hace diferentes? | Switch *Modelo lineal → Modelo Biovita* que se transforma solo al verlo |
| 4 | **Beneficios** | Propuesta de valor del producto | Tarjetas con efecto tilt 3D y luz que sigue el cursor |
| 5 | Marquee | Separador de marca | Banda inclinada en loop infinito |
| 6 | **Proceso** | Los 10 pasos de producción (NOM-251 / NOM-051, cadena de frío 2–6 °C) | Línea de tiempo en zig-zag que se llena con el scroll |
| 7 | **Sabor** | Deseo de producto | Botella 3D arrastrable con el sabor único: guayaba de Calvillo |
| 8 | **Mercado + ODS** | TAM (100,153), SAM (902,378 L/año) y SOM (35 clientes · 7,000 botellas/mes) | Embudo animado, contadores, tarjetas ODS 3, 9 y 12 |
| 9 | **Planes + Promoción** | Conversión y canales Online / Offline / Fidelizar | Selector de botellas/semana con precio animado |
| 10 | **Equipo** | Humanizar la marca | Filtro por carrera con transición |
| 11 | **FAQ** | Resolver objeciones (¿sabe a queso?, ¿lactosa?) | Acordeón con altura animada |
| 12 | **Contacto / lista de espera** | Captar leads | Validación en vivo, pantalla de éxito con check animado |
| 13 | Footer | Cierre y navegación | Volver arriba |

---

## 👥 División del trabajo (4 desarrolladores)

Cada dev es **dueño de sus archivos**, así casi no hay conflictos en Git. En `index.html` cada bloque está marcado con un comentario `DEV N`.

### DEV 1 · Líder técnico, base y 3D del hero
- `css/base.css` — tokens de diseño (colores, tipografías, sombras, *easing*), reset, botones, sistema de aparición `data-reveal` / `data-split`, preloader, nav.
- `css/hero.css`
- `js/core/main.js` — bus de eventos `window.BIOVITA`, preloader, nav, barra de progreso, observador de aparición, botones magnéticos.
- `js/three/bottle.js` — **módulo compartido**: renderer, iluminación y botella procedimental.
- `js/three/hero-scene.js`
- Revisa los *pull requests* y hace la integración final.

### DEV 2 · Historia: Problema, Solución, Beneficios
- `css/story.css`, `js/sections/story.js`
- Medidor DQO, diagrama lineal ↔ circular, tarjetas tilt y marquee.

### DEV 3 · Experiencia: Proceso, Sabores 3D, Impacto
- `css/experience.css`, `js/sections/experience.js`, `js/data/flavors.js`
- `js/three/flavor-scene.js` (reutiliza `bottle.js` de DEV 1)
- Timeline ligada al scroll, escena de sabor (guayaba), contadores.

### DEV 4 · Conversión: Planes, Equipo, FAQ, Contacto, Footer + QA
- `css/conversion.css`, `js/sections/conversion.js`
- Precios dinámicos, filtro del equipo, acordeón, formulario.
- **QA final**: responsive (360 px → 1440 px), accesibilidad (teclado, `aria-*`, contraste), Lighthouse.

### Contratos entre módulos (no romper)
| Contrato | Quién lo emite | Quién lo escucha |
|----------|---------------|------------------|
| `biovita:ready` (evento) | `main.js` al quitar el preloader | Escenas 3D (animación de entrada) |
| `biovita:flavor` (evento, `detail` = objeto sabor) | `experience.js` | `hero-scene.js`, `flavor-scene.js` |
| `--flavor`, `--flavor-2`, `--flavor-soft` (CSS vars) | `experience.js` | Todo el CSS (transicionan con `@property`) |
| `BIOVITA.animateNumber(el, to, opts)` | `main.js` | `experience.js`, `conversion.js` |
| `data-reveal="up|left|right|zoom|blur"` + `style="--d:200ms"` | Cualquier sección | `main.js` |

### Flujo sugerido en Git
```
main
 └─ develop
     ├─ feature/dev1-base-hero
     ├─ feature/dev2-story
     ├─ feature/dev3-experience
     └─ feature/dev4-conversion
```
1. **Día 1:** DEV 1 sube `base.css`, `main.js` y el esqueleto de `index.html` → todos hacen *pull*.
2. **Días 2–4:** cada quien trabaja solo en sus archivos y en su bloque del HTML.
3. **Día 5:** integración en `develop`, QA de DEV 4 y despliegue (GitHub Pages / Netlify / Firebase Hosting).

---

## 📁 Estructura
```
biovita-landing/
├── index.html
├── assets/favicon.svg
├── css/
│   ├── base.css         (DEV 1)
│   ├── hero.css         (DEV 1)
│   ├── story.css        (DEV 2)
│   ├── experience.css   (DEV 3)
│   └── conversion.css   (DEV 4)
└── js/
    ├── core/main.js             (DEV 1)
    ├── data/flavors.js          (DEV 3)
    ├── sections/story.js        (DEV 2)
    ├── sections/experience.js   (DEV 3)
    ├── sections/conversion.js   (DEV 4)
    └── three/
        ├── bottle.js            (DEV 1, compartido)
        ├── hero-scene.js        (DEV 1)
        └── flavor-scene.js      (DEV 3)
```

## ⚠️ Pendientes antes de publicar
- Precios ($25, $90/mes…) son **estimados**; validarlos con la encuesta (rango $15–$35).
- El formulario no envía a ningún servidor: conectar con Formspree, Google Forms o Firebase (`conversion.js`, línea marcada `TODO`).
- Enlaces de Instagram, TikTok y canal de WhatsApp en el footer apuntan a `#`.
- Las afirmaciones de salud deben revisarse conforme a la NOM-051-SCFI/SSA1-2010.
