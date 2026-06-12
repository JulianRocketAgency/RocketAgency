/* ═══════════════════════════════════════════════════════
   ROCKET AGENCY — GLOBAL JS (v2)
   Cursor · Navbar · Mobiel menu · Particles-fallback
═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── WEBGL SUPPORT TEST ──────────────────────────── */
  window.RA_WEBGL = (function () {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  })();

  /* ── CURSOR ──────────────────────────────────────── */
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursor-ring');
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  if (cursor && ring && finePointer && !reducedMotion) {
    let mx = -100, my = -100, rx = -100, ry = -100;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    const animCursor = () => {
      rx += (mx - rx) * .18;
      ry += (my - ry) * .18;
      cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
      ring.style.left   = rx + 'px'; ring.style.top   = ry + 'px';
      requestAnimationFrame(animCursor);
    };
    animCursor();
  } else if (cursor && ring) {
    cursor.style.display = 'none';
    ring.style.display = 'none';
    document.body.style.cursor = 'auto';
  }

  /* ── NAVBAR ──────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Active link op basis van pad
    const path = location.pathname.replace(/\/$/, '') || '/';
    navbar.querySelectorAll('.nav-links a').forEach(a => {
      const href = a.getAttribute('href').replace(/\/$/, '') || '/';
      if (href === path) a.classList.add('active');
    });
  }

  /* ── MOBIEL MENU (dynamisch geïnjecteerd) ────────── */
  if (navbar && !document.getElementById('mobile-menu')) {
    const burger = document.createElement('button');
    burger.className = 'nav-burger';
    burger.setAttribute('aria-label', 'Menu openen');
    burger.setAttribute('aria-expanded', 'false');
    burger.innerHTML = '<span></span><span></span><span></span>';
    navbar.appendChild(burger);

    const menu = document.createElement('div');
    menu.id = 'mobile-menu';
    menu.setAttribute('aria-hidden', 'true');
    const links = [
      { href: '/',         label: 'Home',     num: '01' },
      { href: '/diensten', label: 'Diensten', num: '02' },
      { href: '/over',     label: 'Over ons', num: '03' },
      { href: '/blog',     label: 'Insights', num: '04' }
    ];
    menu.innerHTML =
      '<ul class="mm-links">' +
      links.map(l => `<li><a href="${l.href}"><em>${l.num}</em>${l.label}</a></li>`).join('') +
      '</ul>' +
      '<div class="mm-cta"><a href="/contact" class="btn-primary"><span>Start project</span></a></div>' +
      '<div class="mm-footer"><span>Rocket Agency</span><span>Otterlo, NL</span></div>';
    document.body.appendChild(menu);

    const toggle = (open) => {
      burger.classList.toggle('open', open);
      menu.classList.toggle('open', open);
      document.body.classList.toggle('menu-locked', open);
      // Nav boven de overlay zodat logo + burger (X) klikbaar blijven
      navbar.style.zIndex = open ? '1002' : '';
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
      menu.setAttribute('aria-hidden', String(!open));
    };
    burger.addEventListener('click', () => toggle(!menu.classList.contains('open')));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));
    window.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
  }

  /* ── 2D PARTICLES — alleen als fallback ──────────── */
  // Wanneer WebGL beschikbaar is neemt hero3d.js (Three.js) het over.
  const canvas = document.getElementById('stars');
  function start2D() {
    if (!canvas || window.__RA_3D) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * W; this.y = Math.random() * H;
        this.r = Math.random() * 1.1 + .2;
        this.a = Math.random() * .55 + .08;
        this.vx = (Math.random() - .5) * .12;
        this.vy = (Math.random() - .5) * .12;
        this.gold = Math.random() > .68;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.gold
          ? `rgba(201,168,76,${this.a})`
          : `rgba(242,237,230,${this.a * .38})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < 120; i++) particles.push(new Particle());

    const drawFrame = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
    };

    if (reducedMotion) {
      drawFrame(); // één statisch frame
    } else {
      const anim = () => { drawFrame(); requestAnimationFrame(anim); };
      anim();
    }
  }
  // Start direct als WebGL sowieso ontbreekt, anders na load checken
  if (!window.RA_WEBGL || reducedMotion) {
    window.addEventListener('DOMContentLoaded', start2D);
  } else {
    window.addEventListener('load', start2D);
  }

  /* ── SCROLL REVEAL — fallback zonder GSAP ────────── */
  // effects.js (GSAP) zet window.RA_GSAP_REVEAL en neemt dit over.
  window.addEventListener('DOMContentLoaded', () => {
    if (window.RA_GSAP_REVEAL) return;
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;
    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(el => el.classList.add('visible'));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: .1 });
    revealEls.forEach(el => obs.observe(el));
  });

  /* ── SMOOTH SCROLL (anchor links) ───────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }); }
    });
  });

})();
