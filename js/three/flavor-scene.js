/* =========================================================
   BIOVITA · flavor-scene.js
   Responsable: DEV 3
   Botella interactiva de la sección Sabores:
   - arrastrar para girar (con inercia)
   - giro de 360° + cambio de color al cambiar de sabor
   - frutas/gotas flotantes del color del sabor activo
   ========================================================= */
import * as THREE from 'three';
import { isWebGLAvailable, createRenderer, setupEnvironment, createBottle, createShadow, getCurrentFlavor } from './bottle.js';

const stage = document.getElementById('flavorStage');

if (stage && isWebGLAvailable()) init();

function init() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = createRenderer(stage);
  const scene = new THREE.Scene();
  setupEnvironment(renderer, scene);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.1, 8.8);

  const flavor = getCurrentFlavor();
  const bottle = createBottle(renderer, flavor);
  const pivot = new THREE.Group();
  pivot.add(bottle.group);
  pivot.scale.setScalar(1.08);
  scene.add(pivot);

  const shadow = createShadow(2.8);
  shadow.position.y = -1.85;
  scene.add(shadow);

  /* ----- "Frutas" flotantes (icosaedros suaves) ----- */
  const FRUITS = 14;
  const fruitMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(flavor.color), roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1 });
  const fruits = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 3), fruitMat, FRUITS);
  const fruitData = Array.from({ length: FRUITS }, (_, i) => {
    const a = (i / FRUITS) * Math.PI * 2;
    return {
      a, r: 1.35 + Math.random() * 0.7, y: -1.4 + Math.random() * 2.9,
      s: 0.08 + Math.random() * 0.14, sp: 0.15 + Math.random() * 0.2, ph: Math.random() * Math.PI * 2
    };
  });
  scene.add(fruits);

  // Hojitas (verde menta) para dar frescura
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x3ad29f, roughness: 0.4, side: THREE.DoubleSide });
  const leafGeo = new THREE.SphereGeometry(1, 16, 8);
  leafGeo.scale(0.5, 0.06, 1);
  const LEAVES = 6;
  const leaves = new THREE.InstancedMesh(leafGeo, leafMat, LEAVES);
  const leafData = Array.from({ length: LEAVES }, (_, i) => ({
    a: (i / LEAVES) * Math.PI * 2 + 0.3, r: 1.6 + Math.random() * 0.4, y: -1 + Math.random() * 2.4, ph: Math.random() * 6
  }));
  scene.add(leaves);

  const dummy = new THREE.Object3D();
  const targetFruit = new THREE.Color(flavor.color);

  /* ----- Arrastrar para girar ----- */
  let dragging = false, lastX = 0, velocity = 0, userRot = 0, tiltX = 0, tiltTarget = 0;
  stage.addEventListener('pointerdown', (e) => {
    dragging = true; lastX = e.clientX; stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    velocity = dx * 0.006;
    userRot += velocity;
    const r = stage.getBoundingClientRect();
    tiltTarget = ((e.clientY - r.top) / r.height - 0.5) * 0.5;
  });
  const endDrag = () => { dragging = false; tiltTarget = 0; };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  /* ----- Cambio de sabor: giro + color ----- */
  let spin = 0, spinFrom = 0, spinTo = 0, spinT = 1;
  let pulse = 0;
  window.addEventListener('biovita:flavor', (e) => {
    bottle.setFlavor(e.detail);
    targetFruit.set(e.detail.color);
    spinFrom = spin;
    spinTo = spin + Math.PI * 2;
    spinT = 0;
    pulse = 1;
  });

  /* ----- Tamaño ----- */
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = camera.aspect < 0.8 ? 8.8 / (camera.aspect / 0.8) * 0.92 : 8.8;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  /* ----- Bucle ----- */
  const clock = new THREE.Clock();
  let visible = false, rafId = null;
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !rafId) { clock.getDelta(); loop(); }
  }, { rootMargin: '100px' }).observe(stage);

  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function loop() {
    if (!visible || document.hidden) { rafId = null; return; }
    rafId = requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    // Inercia del arrastre + giro automático suave
    if (!dragging) {
      velocity *= 0.94;
      userRot += velocity + (reduceMotion ? 0 : dt * 0.25);
    }
    if (spinT < 1) {
      spinT = Math.min(1, spinT + dt / 1.1);
      spin = spinFrom + (spinTo - spinFrom) * easeInOut(spinT);
    }
    tiltX += (tiltTarget - tiltX) * 0.08;
    pulse *= 0.93;

    pivot.rotation.y = userRot + spin;
    pivot.rotation.x = tiltX;
    pivot.position.y = reduceMotion ? 0 : Math.sin(t * 1.1) * 0.07;
    pivot.scale.setScalar(1.08 + Math.sin(pulse * Math.PI) * 0.06);

    bottle.update(dt);
    fruitMat.color.lerp(targetFruit, 0.06);

    for (let i = 0; i < FRUITS; i++) {
      const f = fruitData[i];
      const a = f.a + t * f.sp * (reduceMotion ? 0 : 1);
      const burst = 1 + pulse * 0.2;
      dummy.position.set(Math.cos(a) * f.r * burst, f.y + Math.sin(t * 1.3 + f.ph) * 0.18, Math.sin(a) * f.r * 0.7 * burst);
      dummy.rotation.set(t * 0.3 + f.ph, t * 0.4, 0);
      dummy.scale.setScalar(f.s * (1 + pulse * 0.3));
      dummy.updateMatrix();
      fruits.setMatrixAt(i, dummy.matrix);
    }
    fruits.instanceMatrix.needsUpdate = true;

    for (let i = 0; i < LEAVES; i++) {
      const l = leafData[i];
      const a = l.a - t * 0.12 * (reduceMotion ? 0 : 1);
      dummy.position.set(Math.cos(a) * l.r, l.y + Math.sin(t + l.ph) * 0.2, Math.sin(a) * l.r * 0.7);
      dummy.rotation.set(Math.sin(t + l.ph) * 0.6, a, Math.cos(t * 0.8 + l.ph) * 0.5);
      dummy.scale.setScalar(0.22);
      dummy.updateMatrix();
      leaves.setMatrixAt(i, dummy.matrix);
    }
    leaves.instanceMatrix.needsUpdate = true;

    renderer.render(scene, camera);
  }

  document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && !rafId) { clock.getDelta(); loop(); } });
}
