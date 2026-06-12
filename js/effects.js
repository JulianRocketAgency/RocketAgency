/* ═══════════════════════════════════════════════════════
   ROCKET AGENCY — EFFECTS (GSAP + ScrollTrigger)
   Char-reveal · Scroll-choreografie · Counters ·
   Magnetic buttons · Card-tilt · Parallax · Progress
═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.gsap) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  // Vlag voor global.js: GSAP neemt de reveals over
  window.RA_GSAP_REVEAL = true;

  /* ── REDUCED MOTION: alles direct zichtbaar ──────── */
  if (reducedMotion) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }

  /* ── SCROLL PROGRESS BAR ─────────────────────────── */
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.appendChild(bar);
  if (window.ScrollTrigger) {
    gsap.to(bar, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: .3 }
    });
  }

  /* ── HERO H1 CHAR REVEAL (homepage) ──────────────── */
  const heroH1 = document.querySelector('.hero-h1');
  if (heroH1) {
    // CSS-keyframe uitschakelen; GSAP neemt het over
    heroH1.style.animation = 'none';
    heroH1.style.opacity = '1';

    const splitChars = (root) => {
      const walk = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          for (const ch of node.textContent) {
            if (ch === ' ') { frag.appendChild(document.createTextNode(' ')); continue; }
            const mask = document.createElement('span');
            mask.className = 'ch-mask';
            const inner = document.createElement('span');
            inner.className = 'ch';
            inner.textContent = ch;
            mask.appendChild(inner);
            frag.appendChild(mask);
          }
          node.parentNode.replaceChild(frag, node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          [...node.childNodes].forEach(walk);
        }
      };
      [...root.childNodes].forEach(walk);
    };
    splitChars(heroH1);

    gsap.fromTo(heroH1.querySelectorAll('.ch'),
      { yPercent: 115, rotate: 4 },
      {
        yPercent: 0, rotate: 0,
        duration: 1.1, ease: 'power4.out',
        stagger: { each: .028, from: 'start' },
        delay: .45
      }
    );

    // Hero zachte parallax-uitfade bij scrollen
    if (window.ScrollTrigger) {
      gsap.to('#home > *:not(canvas)', {
        yPercent: -12, opacity: 0, ease: 'none', stagger: 0,
        scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom 40%', scrub: .5 }
      });
    }
  }

  /* ── SCROLL REVEALS via ScrollTrigger ────────────── */
  if (window.ScrollTrigger) {
    const reveals = gsap.utils.toArray('.reveal');
    reveals.forEach(el => {
      // CSS-transition uitschakelen zodat GSAP exclusief stuurt
      el.style.transition = 'none';
      el.classList.add('visible'); // CSS-eindstaat; GSAP doet de from-animatie
      gsap.from(el, {
        y: 44, opacity: 0,
        duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    /* ── COUNTERS (resultaten) ───────────────────── */
    document.querySelectorAll('.result-num').forEach(el => {
      const m = el.textContent.trim().match(/^(\d+)(.*)$/);
      if (!m) return;
      const end = parseInt(m[1], 10);
      const suffix = m[2] || '';
      const obj = { v: 0 };
      el.textContent = '0' + suffix;
      gsap.to(obj, {
        v: end, duration: 1.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; }
      });
    });

    /* ── PARALLAX accenten ───────────────────────── */
    gsap.utils.toArray('.step-bg-num').forEach(el => {
      gsap.fromTo(el, { y: 30 }, {
        y: -30, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: .6 }
      });
    });

    /* ── Sectiekoppen: zachte line-reveal ────────── */
    gsap.utils.toArray('.section-label').forEach(el => {
      gsap.from(el, {
        opacity: 0, x: -18, duration: .9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });
  }

  /* ── MAGNETIC BUTTONS ────────────────────────────── */
  if (finePointer) {
    document.querySelectorAll('.btn-primary, .btn-outline, .nav-cta').forEach(btn => {
      const xTo = gsap.quickTo(btn, 'x', { duration: .4, ease: 'power3.out' });
      const yTo = gsap.quickTo(btn, 'y', { duration: .4, ease: 'power3.out' });
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * .28);
        yTo((e.clientY - r.top - r.height / 2) * .35);
      });
      btn.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });

    /* ── CARD TILT (diensten) ────────────────────── */
    document.querySelectorAll('.dienst-card').forEach(card => {
      const rxTo = gsap.quickTo(card, 'rotationX', { duration: .5, ease: 'power3.out' });
      const ryTo = gsap.quickTo(card, 'rotationY', { duration: .5, ease: 'power3.out' });
      gsap.set(card, { transformPerspective: 900 });
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5;
        const py = (e.clientY - r.top) / r.height - .5;
        rxTo(-py * 4);
        ryTo(px * 4);
      });
      card.addEventListener('mouseleave', () => { rxTo(0); ryTo(0); });
    });
  }

})();
