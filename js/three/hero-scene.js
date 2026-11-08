/* =========================================================
   BIOVITA · hero-scene.js
   Responsable: DEV 1
   Escena 3D del hero: botella flotante + "probióticos"
   orbitando, reacciona al mouse, al scroll y al sabor.
   ========================================================= */
import * as THREE from 'three';
import { isWebGLAvailable, createRenderer, setupEnvironment, createBottle, createShadow, getCurrentFlavor } from './bottle.js';

const stage = document.getElementById('heroStage');
const hero = document.getElementById('inicio');

if (stage && isWebGLAvailable()) init();

function init() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = createRenderer(stage);
  const scene = new THREE.Scene();
  setupEnvironment(renderer, scene);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0.25, 8.4);

  /* ----- Botella ----- */
  const bottle = createBottle(renderer, getCurrentFlavor());
  const pivot = new THREE.Group();
  pivot.add(bottle.group);
  bottle.group.rotation.z = -0.1;
  scene.add(pivot);

  const shadow = createShadow(2.6);
  shadow.position.y = -1.75;
  scene.add(shadow);

  /* ----- Probióticos (cápsulas instanciadas) ----- */
  const COUNT = 42;
  const capsules = new THREE.InstancedMesh(
    new THREE.CapsuleGeometry(0.055, 0.14, 6, 12),
    new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0 }),
    COUNT
  );
  const palette = [new THREE.Color('#3ad29f'), new THREE.Color('#ffffff'), new THREE.Color(getCurrentFlavor().light)];
  const particles = [];
  for (let i = 0; i < COUNT; i++) {
    particles.push({
      radius: 1.3 + Math.random() * 1.5,
      angle: Math.random() * Math.PI * 2,
      y: -1.8 + Math.random() * 3.8,
      speed: (0.12 + Math.random() * 0.25) * (Math.random() > 0.5 ? 1 : -1),
      bob: Math.random() * Math.PI * 2,
      spin: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
      scale: 0.6 + Math.random() * 0.9,
      group: i % 3
    });
    capsules.setColorAt(i, palette[i % 3]);
  }
  scene.add(capsules);

  /* ----- Burbujas ----- */
  const bubbleCount = 26;
  const bubbles = new THREE.InstancedMesh(
    new THREE.SphereGeometry(1, 16, 16),
    new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.35, clearcoat: 1, depthWrite: false }),
    bubbleCount
  );
  const bubbleData = Array.from({ length: bubbleCount }, () => ({
    x: (Math.random() - 0.5) * 4.5, y: -2.5 + Math.random() * 5, z: (Math.random() - 0.5) * 2,
    s: 0.04 + Math.random() * 0.1, v: 0.2 + Math.random() * 0.35
  }));
  scene.add(bubbles);

  const dummy = new THREE.Object3D();
  const quat = new THREE.Quaternion();

  /* ----- Interacción ----- */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', (e) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  let intro = 0;
  let ready = !!(window.BIOVITA && window.BIOVITA.loaded);
  window.addEventListener('biovita:ready', () => { ready = true; });
  window.addEventListener('biovita:flavor', (e) => {
    bottle.setFlavor(e.detail);
    palette[2].set(e.detail.light);
    for (let i = 0; i < COUNT; i++) if (particles[i].group === 2) capsules.setColorAt(i, palette[2]);
    capsules.instanceColor.needsUpdate = true;
  });

  /* ----- Tamaño ----- */
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = camera.aspect < 0.75 ? 8.4 / (camera.aspect / 0.75) * 0.9 : 8.4;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  /* ----- Bucle (solo corre cuando el hero es visible) ----- */
  let visible = true, rafId = null;
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !rafId) { clock.getDelta(); loop(); }
  }).observe(stage);

  const clock = new THREE.Clock();
  const easeOutBack = (t) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

  function loop() {
    if (!visible || document.hidden) { rafId = null; return; }
    rafId = requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    if (ready && intro < 1) intro = Math.min(1, intro + dt / 1.6);
    const e = reduceMotion ? 1 : easeOutBack(intro);

    // Progreso del scroll dentro del hero (0 → 1)
    const scrollP = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight || 1)));

    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;

    const float = reduceMotion ? 0 : Math.sin(t * 1.2) * 0.08;
    pivot.position.y = THREE.MathUtils.lerp(-4.5, 0, e) + float - scrollP * 1.2;
    pivot.scale.setScalar(THREE.MathUtils.lerp(0.5, 1, Math.min(1, e)));
    pivot.rotation.y = Math.sin(t * 0.45) * 0.55 + pointer.x * 0.5 + scrollP * Math.PI * 1.2 + (1 - Math.min(1, e)) * -3;
    pivot.rotation.x = pointer.y * 0.18;
    pivot.rotation.z = -pointer.x * 0.06;

    shadow.material.opacity = Math.min(1, e) * (1 - scrollP) * (1 - float * 2);
    shadow.scale.setScalar(1 - float * 1.5);

    bottle.update(dt);

    // Cápsulas en órbita
    for (let i = 0; i < COUNT; i++) {
      const p = particles[i];
      if (!reduceMotion) p.angle += p.speed * dt;
      const r = p.radius * Math.min(1, e);
      dummy.position.set(Math.cos(p.angle) * r, p.y + Math.sin(t + p.bob) * 0.15 - scrollP * 0.6, Math.sin(p.angle) * r * 0.6);
      quat.setFromAxisAngle(p.spin, t * 0.8 + p.bob);
      dummy.quaternion.copy(quat);
      dummy.scale.setScalar(p.scale * Math.min(1, e));
      dummy.updateMatrix();
      capsules.setMatrixAt(i, dummy.matrix);
    }
    capsules.instanceMatrix.needsUpdate = true;

    // Burbujas ascendentes
    for (let i = 0; i < bubbleCount; i++) {
      const b = bubbleData[i];
      if (!reduceMotion) b.y += b.v * dt;
      if (b.y > 2.8) { b.y = -2.6; b.x = (Math.random() - 0.5) * 4.5; }
      dummy.position.set(b.x + Math.sin(t + i) * 0.1, b.y, b.z);
      dummy.quaternion.identity();
      dummy.scale.setScalar(b.s * Math.min(1, e));
      dummy.updateMatrix();
      bubbles.setMatrixAt(i, dummy.matrix);
    }
    bubbles.instanceMatrix.needsUpdate = true;

    renderer.render(scene, camera);
  }

  document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && !rafId) { clock.getDelta(); loop(); } });
  loop();
}
