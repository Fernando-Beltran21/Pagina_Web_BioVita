/* =========================================================
   BIOVITA · bottle.js  (módulo compartido de Three.js)
   Responsable: DEV 1 (lo reutiliza DEV 3)
   Exporta utilidades para crear el renderer, el entorno de
   iluminación y la botella 3D procedimental de Biovita.
   ========================================================= */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const isWebGLAvailable = () => {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
};

export const getCurrentFlavor = () => {
  const B = window.BIOVITA || {};
  return B.currentFlavor || (B.flavors && B.flavors[0]) || {
    name: 'Guayaba', color: '#ef6f6c', light: '#ffc0b8', liquid: '#f4b6b0', labelAccent: '#ff7b6b'
  };
};

export function createRenderer(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);
  container.classList.add('has-webgl');
  return renderer;
}

export function setupEnvironment(renderer, scene) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const key = new THREE.DirectionalLight(0xffffff, 2.0);
  key.position.set(3, 5, 4);
  const rim = new THREE.DirectionalLight(0x8ff0c8, 1.4);
  rim.position.set(-4, 2, -3);
  scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.35));
}

/* Sombra suave bajo la botella (textura radial generada en canvas) */
export function createShadow(size = 2.4) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(13,38,32,0.35)');
  g.addColorStop(1, 'rgba(13,38,32,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size * 0.45),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

/* ---------------------------------------------------------
   Botella procedimental
   --------------------------------------------------------- */
const accentOf = (f) => f.labelAccent || f.color;
const LABEL_W = 2048;
const LABEL_H = 405;

/* Etiqueta basada en el diseño real de Biovita:
   fondo verde, "Bio" verde claro y "vita" en el color de acento del sabor. */
function drawLabel(ctx, accent, name) {
  const w = LABEL_W, h = LABEL_H, cx = w / 2;
  ctx.clearRect(0, 0, w, h);

  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#5a8c34');
  bg.addColorStop(1, '#3f6b24');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Textura sutil de puntos
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  for (let row = 0, y = 26; y < h + 20; y += 58, row++) {
    for (let x = row % 2 ? 29 : 0; x < w + 20; x += 58) {
      ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
    }
  }

  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e9f3d6';
  ctx.font = '700 28px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('BEBIDA FERMENTADA DE LACTOSUERO', cx, 66);

  // Logotipo "Bio" + "vita"
  ctx.font = '800 150px Fraunces, Georgia, serif';
  const wBio = ctx.measureText('Bio').width;
  const wVita = ctx.measureText('vita').width;
  let x = cx - (wBio + wVita) / 2;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#c4e08a';
  ctx.fillText('Bio', x, 212);
  ctx.fillStyle = accent;
  ctx.fillText('vita', x + wBio, 212);

  // Hojita sobre la "i"
  ctx.save();
  ctx.translate(x + wBio * 0.78, 78);
  ctx.fillStyle = '#9fd25a';
  ctx.beginPath(); ctx.ellipse(-12, 0, 11, 22, -0.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(12, -4, 11, 22, 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#e9f3d6';
  ctx.font = '600 26px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('Fortificada con probióticos, vitaminas y minerales', cx, 262);
  ctx.fillStyle = accent;
  ctx.font = '800 40px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(name.toUpperCase(), cx, 318);
  ctx.fillStyle = '#e9f3d6';
  ctx.font = '700 26px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('CONT. NET. 350 mL', cx, 366);
}

export function createBottle(renderer, flavor = getCurrentFlavor()) {
  const group = new THREE.Group();

  // Perfil de la botella (radio, altura) suavizado con spline
  const ctrl = [
    [0.0, 0.0], [0.5, 0.0], [0.68, 0.07], [0.72, 0.28], [0.72, 1.5],
    [0.69, 1.78], [0.52, 2.05], [0.33, 2.25], [0.28, 2.4], [0.28, 2.56]
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const profile = new THREE.SplineCurve(ctrl).getPoints(90).map((p) => new THREE.Vector2(Math.max(0, p.x), Math.max(0, p.y)));

  // Envase (PET translúcido)
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.12, metalness: 0, transparent: true, opacity: 0.28,
    clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.4, depthWrite: false, side: THREE.DoubleSide
  });
  const glass = new THREE.Mesh(new THREE.LatheGeometry(profile, 96), glassMat);
  glass.renderOrder = 2;

  // Líquido
  const FILL = 1.72;
  const liquidPts = profile.filter((p) => p.y <= FILL).map((p) => new THREE.Vector2(p.x * 0.94, p.y + 0.03));
  liquidPts.push(new THREE.Vector2(0, FILL + 0.03));
  const liquidMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(flavor.liquid), roughness: 0.35, metalness: 0, sheen: 0.6, sheenColor: new THREE.Color(0xffffff)
  });
  const liquid = new THREE.Mesh(new THREE.LatheGeometry(liquidPts, 96), liquidMat);

  // Etiqueta con textura dinámica
  const canvas = document.createElement('canvas');
  canvas.width = LABEL_W; canvas.height = LABEL_H;
  const ctx = canvas.getContext('2d');
  drawLabel(ctx, accentOf(flavor), flavor.name);
  const labelTex = new THREE.CanvasTexture(canvas);
  labelTex.colorSpace = THREE.SRGBColorSpace;
  labelTex.wrapS = THREE.RepeatWrapping;
  labelTex.offset.x = 0.5; // centra el logo hacia la cámara
  labelTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(0.728, 0.728, 0.92, 128, 1, true),
    new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.45, metalness: 0.05 })
  );
  label.position.y = 0.9;

  // Tapa
  const capMat = new THREE.MeshStandardMaterial({ color: 0x12493a, roughness: 0.38, metalness: 0.1 });
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.315, 0.32, 0.32, 48), capMat);
  cap.position.y = 2.62;
  const capTop = new THREE.Mesh(new THREE.SphereGeometry(0.315, 48, 12, 0, Math.PI * 2, 0, Math.PI / 2), capMat);
  capTop.scale.y = 0.18;
  capTop.position.y = 2.78;
  const ridges = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.322, 0.012, 8, 64), capMat);
    r.rotation.x = Math.PI / 2;
    r.position.y = 2.5 + i * 0.1;
    ridges.add(r);
  }

  const inner = new THREE.Group();
  inner.add(liquid, label, glass, cap, capTop, ridges);
  inner.position.y = -1.4; // centra la botella en el origen
  group.add(inner);

  // Redibuja la etiqueta cuando carguen las fuentes web
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { drawLabel(ctx, state.labelColor.getStyle(), state.name); labelTex.needsUpdate = true; });
  }

  /* ----- Transición de sabor ----- */
  const state = {
    t: 1,
    duration: 0.9,
    fromLiquid: new THREE.Color(flavor.liquid), toLiquid: new THREE.Color(flavor.liquid),
    fromLabel: new THREE.Color(accentOf(flavor)), toLabel: new THREE.Color(accentOf(flavor)),
    labelColor: new THREE.Color(accentOf(flavor)),
    name: flavor.name, nextName: flavor.name
  };

  function setFlavor(f) {
    state.fromLiquid.copy(liquidMat.color);
    state.fromLabel.copy(state.labelColor);
    state.toLiquid.set(f.liquid);
    state.toLabel.set(accentOf(f));
    state.nextName = f.name;
    state.t = 0;
  }

  function update(dt) {
    if (state.t >= 1) return;
    state.t = Math.min(1, state.t + dt / state.duration);
    const e = state.t < 0.5 ? 4 * state.t ** 3 : 1 - Math.pow(-2 * state.t + 2, 3) / 2;
    liquidMat.color.lerpColors(state.fromLiquid, state.toLiquid, e);
    state.labelColor.lerpColors(state.fromLabel, state.toLabel, e);
    if (state.t >= 0.5) state.name = state.nextName;
    drawLabel(ctx, state.labelColor.getStyle(), state.name);
    labelTex.needsUpdate = true;
  }

  return { group, setFlavor, update };
}
