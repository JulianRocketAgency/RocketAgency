/* ═══════════════════════════════════════════════════════
   ROCKET AGENCY — GLOBAL JS
   Alle pagina's laden dit script
═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── CURSOR ──────────────────────────────────────── */
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursor-ring');
  if (cursor && ring) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    const animCursor = () => {
      rx += (mx - rx) * .18;
      ry += (my - ry) * .18;
      cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
      ring.style.left   = rx + 'px'; ring.style.top   = ry + 'px';
      requestAnimationFrame(animCursor);
    };
    animCursor();
  }

  /* ── NAVBAR ──────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    });
    // Active link
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    navbar.querySelectorAll('.nav-links a').forEach(a => {
      if (a.getAttribute('href') === currentPage ||
         (currentPage === '' && a.getAttribute('href') === 'index.html')) {
        a.classList.add('active');
      }
    });
  }

  /* ── PARTICLES ───────────────────────────────────── */
  const canvas = document.getElementById('stars');
  if (canvas) {
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

    for (let i = 0; i < 160; i++) particles.push(new Particle());

    const drawConnections = () => {
      const gp = particles.filter(p => p.gold);
      for (let i = 0; i < gp.length; i++) {
        for (let j = i + 1; j < gp.length; j++) {
          const dx = gp[i].x - gp[j].x, dy = gp[i].y - gp[j].y;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d < 140) {
            ctx.beginPath();
            ctx.moveTo(gp[i].x, gp[i].y);
            ctx.lineTo(gp[j].x, gp[j].y);
            ctx.strokeStyle = `rgba(201,168,76,${(1 - d/140) * .07})`;
            ctx.lineWidth = .5; ctx.stroke();
          }
        }
      }
    };

    const anim = () => {
      ctx.clearRect(0, 0, W, H);
      drawConnections();
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(anim);
    };
    anim();
  }

  /* ── SCROLL REVEAL ───────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: .1 });
    revealEls.forEach(el => obs.observe(el));
  }

  /* ── SMOOTH SCROLL (anchor links) ───────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

})();
