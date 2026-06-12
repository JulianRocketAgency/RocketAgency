/* ═══════════════════════════════════════════════════════
   ROCKET AGENCY — HERO 3D (Three.js)
   "Neural constellation" — gouden puntenwolk met kern
   Draait als ambient laag op elke pagina.
═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.THREE || !window.RA_WEBGL) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  const isHome = !!document.querySelector('.hero-h1');

  /* ── SETUP ───────────────────────────────────────── */
  const canvas = document.createElement('canvas');
  canvas.id = 'webgl';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas, alpha: true, antialias: !isMobile, powerPreference: 'high-performance'
    });
  } catch (e) { canvas.remove(); return; }
  window.__RA_3D = true;
  const stars2d = document.getElementById('stars');
  if (stars2d) stars2d.style.display = 'none';
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x080808, 0.055);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, .1, 100);
  camera.position.set(0, 0, 11);

  const GOLD = new THREE.Color(0xc9a84c);
  const GOLD_LIGHT = new THREE.Color(0xe8c96a);
  const WARM_WHITE = new THREE.Color(0xf2ede6);

  /* ── PUNTENWOLK (galaxy-disc) ────────────────────── */
  const COUNT = isMobile ? 900 : 2400;
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const sizes = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    // Spiraalvormige disc met diepte — leest als melkweg / neuraal veld
    const radius = Math.pow(Math.random(), .6) * 14 + .6;
    const branch = (i % 4) / 4 * Math.PI * 2;
    const spin = radius * .32;
    const rand = () => (Math.random() - .5) * Math.pow(Math.random(), 1.6) * 5;

    positions[i * 3]     = Math.cos(branch + spin) * radius + rand();
    positions[i * 3 + 1] = rand() * .55;
    positions[i * 3 + 2] = Math.sin(branch + spin) * radius + rand();

    const c = Math.random();
    const col = c > .78 ? GOLD_LIGHT : (c > .42 ? GOLD : WARM_WHITE);
    const dim = c > .42 ? 1 : .45;
    colors[i * 3]     = col.r * dim;
    colors[i * 3 + 1] = col.g * dim;
    colors[i * 3 + 2] = col.b * dim;

    sizes[i] = Math.random() * 1.4 + .35;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

  const pointsMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: renderer.getPixelRatio() }
    },
    vertexShader: `
      attribute float aSize;
      uniform float uTime;
      uniform float uPixelRatio;
      varying vec3 vColor;
      varying float vTwinkle;
      void main() {
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        vTwinkle = .65 + .35 * sin(uTime * 1.4 + position.x * 3.7 + position.z * 2.3);
        gl_PointSize = aSize * uPixelRatio * (52.0 / -mv.z);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vTwinkle;
      void main() {
        float d = distance(gl_PointCoord, vec2(.5));
        float alpha = smoothstep(.5, .05, d) * vTwinkle;
        gl_FragColor = vec4(vColor, alpha * .9);
      }
    `
  });

  const galaxy = new THREE.Points(geo, pointsMat);
  galaxy.rotation.x = .42;
  galaxy.position.y = isHome ? -1.2 : -2.2;
  scene.add(galaxy);

  /* ── VERBINDINGSLIJNEN (neuraal netwerk) ─────────── */
  const linePositions = [];
  const MAXL = isMobile ? 40 : 110;
  let found = 0;
  for (let i = 0; i < COUNT && found < MAXL; i += 3) {
    for (let j = i + 1; j < Math.min(i + 60, COUNT); j++) {
      const dx = positions[i*3] - positions[j*3];
      const dy = positions[i*3+1] - positions[j*3+1];
      const dz = positions[i*3+2] - positions[j*3+2];
      if (dx*dx + dy*dy + dz*dz < 1.1) {
        linePositions.push(
          positions[i*3], positions[i*3+1], positions[i*3+2],
          positions[j*3], positions[j*3+1], positions[j*3+2]
        );
        found++;
        break;
      }
    }
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xc9a84c, transparent: true, opacity: .07,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  galaxy.add(lines);

  /* ── KERN (alleen homepage-hero) ─────────────────── */
  let core = null;
  if (isHome) {
    core = new THREE.Group();
    const ico = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.1, 1),
      new THREE.MeshBasicMaterial({
        color: 0xc9a84c, wireframe: true,
        transparent: true, opacity: .14,
        blending: THREE.AdditiveBlending, depthWrite: false
      })
    );
    const icoInner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.25, 0),
      new THREE.MeshBasicMaterial({
        color: 0xe8c96a, wireframe: true,
        transparent: true, opacity: .08,
        blending: THREE.AdditiveBlending, depthWrite: false
      })
    );
    core.add(ico, icoInner);
    core.position.set(0, .2, 2.5);
    scene.add(core);
  }

  /* ── INTERACTIE ──────────────────────────────────── */
  let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
  if (!isMobile) {
    window.addEventListener('mousemove', e => {
      targetX = (e.clientX / window.innerWidth - .5);
      targetY = (e.clientY / window.innerHeight - .5);
    }, { passive: true });
  }

  let scrollFactor = 0;
  window.addEventListener('scroll', () => {
    scrollFactor = Math.min(window.scrollY / window.innerHeight, 2.5);
  }, { passive: true });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    pointsMat.uniforms.uPixelRatio.value = renderer.getPixelRatio();
  });

  /* ── RENDER LOOP ─────────────────────────────────── */
  const clock = new THREE.Clock();
  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running && !reducedMotion) { clock.getDelta(); tick(); }
  });

  function render(t) {
    pointsMat.uniforms.uTime.value = t;

    galaxy.rotation.y = t * .025 + scrollFactor * .25;
    galaxy.position.y = (isHome ? -1.2 : -2.2) + scrollFactor * .9;

    mouseX += (targetX - mouseX) * .04;
    mouseY += (targetY - mouseY) * .04;
    camera.position.x = mouseX * 1.4;
    camera.position.y = -mouseY * .9;
    camera.position.z = 11 + scrollFactor * 1.6;
    camera.lookAt(0, 0, 0);

    if (core) {
      core.rotation.y = t * .12;
      core.rotation.x = t * .07;
      core.position.y = .2 + Math.sin(t * .6) * .12;
      const fade = Math.max(0, 1 - scrollFactor * 1.4);
      core.children[0].material.opacity = .14 * fade;
      core.children[1].material.opacity = .08 * fade;
      core.visible = fade > 0.01;
    }

    renderer.render(scene, camera);
  }

  function tick() {
    if (!running) return;
    render(clock.getElapsedTime());
    requestAnimationFrame(tick);
  }

  if (reducedMotion) {
    render(2); // één statisch frame, geen beweging
  } else {
    tick();
  }
})();
