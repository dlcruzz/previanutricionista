(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasFx = !!(window.gsap && window.ScrollTrigger) && !reduce;

  /* ---------- header / menu ---------- */
  const top = $('#top');
  const onScroll = () => top.classList.toggle('scrolled', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const burger = $('#burger'), nav = $('#nav');
  const closeNav = () => { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); };
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('a', nav).forEach(a => a.addEventListener('click', closeNav));

  /* ---------- loader ---------- */
  const loader = $('#loader'), bar = $('#loaderBar'), num = $('#loaderNum');
  const heroImg = $('#heroImg');
  const imgReady = new Promise(r => {
    if (heroImg.complete) r(); else { heroImg.addEventListener('load', r, { once: true }); heroImg.addEventListener('error', r, { once: true }); }
    setTimeout(r, 2500);
  });
  let loaded = false; imgReady.then(() => (loaded = true));
  const t0 = performance.now();
  const loadTick = now => {
    const t = Math.min((now - t0) / 1100, loaded ? 1 : 0.9);
    const p = Math.round((1 - Math.pow(1 - t, 3)) * 100);
    bar.style.width = p + '%'; num.textContent = p;
    if (t < 1) requestAnimationFrame(loadTick);
    else setTimeout(() => { loader.classList.add('out'); window.intro && window.intro(); setTimeout(() => loader.remove(), 1100); }, 180);
  };
  requestAnimationFrame(loadTick);

  /* ---------- fallback sem animação ---------- */
  if (!hasFx) {
    root.classList.add('no-fx');
    $$('[data-count]').forEach(el => el.textContent = fmt(el, +el.dataset.count));
    window.intro = () => {};
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const mobile = () => innerWidth < 700;

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis && fine) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const el = id.length > 1 && $(id);
    if (!el) return;
    e.preventDefault();
    const y = id === '#inicio' ? 0 : el;
    lenis ? lenis.scrollTo(y, { offset: id === '#inicio' ? 0 : -60, duration: 1.6 }) : (y === 0 ? scrollTo({ top: 0, behavior: 'smooth' }) : el.scrollIntoView({ behavior: 'smooth' }));
  }));

  /* ---------- intro ---------- */
  gsap.set('.ht-line > span', { yPercent: 115 });
  gsap.set('#heroTilt', { scale: 0.86, autoAlpha: 0 });
  gsap.set(['.hero-kicker', '#heroScroll', '.top'], { autoAlpha: 0 });
  function intro() {
    lenis && lenis.start();
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to('#heroTilt', { scale: 1, autoAlpha: 1, duration: 1.8 }, 0)
      .to('.ht-line > span', { yPercent: 0, duration: 1.4, stagger: 0.09 }, 0.15)
      .to(['.hero-kicker', '#heroScroll', '.top'], { autoAlpha: 1, duration: 1 }, 0.7);
  }

  /* ---------- hero: quadro em arco que se abre ---------- */
  const frame = $('#heroFrame');
  const startClip = () => mobile()
    ? 'inset(19% 13% 17% 13% round 999px 999px 22px 22px)'
    : 'inset(14% 35.5% 10% 35.5% round 999px 999px 26px 26px)';
  const endClip = 'inset(0% 0% 0% 0% round 0px 0px 0px 0px)';
  let heroP = 0;
  const heroTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: 1,
      invalidateOnRefresh: true,
      onUpdate: s => (heroP = s.progress)
    }
  });
  heroTl
    .fromTo(frame, { clipPath: startClip }, { clipPath: endClip, ease: 'power2.inOut', duration: 1 }, 0)
    .fromTo(heroImg, { scale: 1.3 }, { scale: 1, ease: 'power2.inOut', duration: 1 }, 0)
    .to('.ht-l1, .ht-l2', { xPercent: -60, autoAlpha: 0, ease: 'power2.in', duration: 0.6, stagger: 0.05 }, 0.05)
    .to('.ht-l3, .ht-l4', { xPercent: 60, autoAlpha: 0, ease: 'power2.in', duration: 0.6, stagger: 0.05 }, 0.05)
    .to(['.hero-kicker', '#heroScroll'], { autoAlpha: 0, duration: 0.2 }, 0)
    .to('.hero-shade', { opacity: 1, duration: 0.35 }, 0.7)
    .to('#heroOver', { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 0.88)
    .to({}, { duration: 0.25 });

  // tilt 3D do quadro com o mouse (some quando a foto ocupa a tela)
  if (fine) {
    const rx = gsap.quickTo(frame, 'rotationX', { duration: 0.9, ease: 'power3.out' });
    const ry = gsap.quickTo(frame, 'rotationY', { duration: 0.9, ease: 'power3.out' });
    const ix = gsap.quickTo(heroImg, 'xPercent', { duration: 1.2, ease: 'power3.out' });
    const iy = gsap.quickTo(heroImg, 'yPercent', { duration: 1.2, ease: 'power3.out' });
    const tx = gsap.quickTo('.hero-title', 'x', { duration: 1.4, ease: 'power3.out' });
    const ty = gsap.quickTo('.hero-title', 'y', { duration: 1.4, ease: 'power3.out' });
    $('.hero').addEventListener('mousemove', e => {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      const k = Math.max(0, 1 - heroP * 1.4);
      rx(-ny * 14 * k); ry(nx * 18 * k);
      ix(-nx * 4 * k); iy(-ny * 3 * k);
      tx(nx * 30 * k); ty(ny * 20 * k);
    });
  }

  /* ---------- títulos palavra a palavra ---------- */
  $$('.split').forEach(el => {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('span'); i.textContent = part;
            w.appendChild(i); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    gsap.from($$('.w > span', el), {
      yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.035,
      scrollTrigger: { trigger: el, start: 'top 82%' }
    });
  });

  /* ---------- reveals ---------- */
  const revealSel = '.dupla .eyebrow, .lead, .doc, .esp-head > *, .metodo-side > *, .step, .depo-head > *, .quote, .clinica-info > *, .faq .eyebrow, .faq .h2, .faq-list details, .final-in > *, .foot-in > *';
  gsap.set(revealSel, { autoAlpha: 0, y: 46 });
  ScrollTrigger.batch(revealSel, {
    start: 'top 88%',
    onEnter: els => gsap.to(els, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, overwrite: true })
  });

  /* ---------- fotos com zoom no scroll ---------- */
  $$('.zoom-wrap').forEach(w => {
    gsap.fromTo($('.zoom-img', w), { scale: 1.4 }, {
      scale: 1, ease: 'none',
      scrollTrigger: { trigger: w, start: 'top bottom', end: 'bottom 30%', scrub: true }
    });
    gsap.fromTo(w, { rotationX: 14, transformPerspective: 1200, y: 60 }, {
      rotationX: 0, y: 0, ease: 'none',
      scrollTrigger: { trigger: w, start: 'top bottom', end: 'center center', scrub: true }
    });
  });

  /* ---------- especialidades: trilho horizontal 3D ---------- */
  const track = $('#espTrack');
  const cards = $$('.card3d', track);
  const dist = () => Math.max(0, track.scrollWidth - innerWidth);
  let espOn = false;
  gsap.to(track, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: {
      trigger: '.esp', start: 'top top', end: () => '+=' + dist() * 1.1, pin: true, scrub: 1,
      invalidateOnRefresh: true, anticipatePin: 1,
      onToggle: s => (espOn = s.isActive),
      onUpdate: s => gsap.set('#espBar', { scaleX: s.progress })
    }
  });
  ScrollTrigger.create({ trigger: '.esp', start: 'top bottom', end: 'bottom top', onToggle: s => (espOn = s.isActive) });
  const cardTick = () => {
    if (!espOn) return;
    const vw = innerWidth;
    cards.forEach(c => {
      const r = c.getBoundingClientRect();
      const d = (r.left + r.width / 2 - vw / 2) / vw;
      const cl = Math.max(-1, Math.min(1, d));
      c.style.transform = `translateZ(${-Math.abs(cl) * 260}px) rotateY(${cl * -38}deg) translateY(${Math.abs(cl) * 30}px)`;
      c.style.opacity = String(1 - Math.min(0.55, Math.abs(cl) * 0.55));
    });
  };
  gsap.ticker.add(cardTick);
  cards.forEach(c => {
    const inner = $('.card-in', c);
    c.addEventListener('mousemove', e => {
      const r = inner.getBoundingClientRect();
      inner.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
      inner.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
    });
  });

  /* ---------- método ---------- */
  const stepNum = $('#stepNum');
  $$('.step').forEach(s => ScrollTrigger.create({
    trigger: s, start: 'top 62%', end: 'bottom 62%',
    onToggle: self => {
      s.classList.toggle('active', self.isActive);
      if (self.isActive) {
        gsap.fromTo(stepNum, { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: 'expo.out' });
        stepNum.textContent = s.dataset.step;
      }
    }
  }));

  /* ---------- números ---------- */
  function fmt(el, v) {
    const dec = +(el.dataset.dec || 0);
    return v.toFixed(dec).replace('.', ',') + (el.dataset.suffix || '');
  }
  $$('[data-count]').forEach(el => {
    const o = { v: 0 };
    gsap.to(o, {
      v: +el.dataset.count, duration: 2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onUpdate: () => (el.textContent = fmt(el, o.v))
    });
  });

  /* ---------- resultado: imagem levanta da mesa ---------- */
  const r3d = $('#result3d');
  gsap.timeline({
    scrollTrigger: { trigger: '.result', start: 'top top', end: '+=130%', pin: true, scrub: 1 }
  })
    .fromTo(r3d, { rotationX: 68, scale: 0.6, yPercent: 45, autoAlpha: 0.2 }, { rotationX: 0, scale: 1, yPercent: 0, autoAlpha: 1, ease: 'power2.out', duration: 1 }, 0)
    .fromTo('.result-big', { scale: 1.5, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, ease: 'power2.out', duration: 1 }, 0)
    .fromTo('.result-copy', { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 0.7)
    .to({}, { duration: 0.3 });
  if (fine) {
    const rrx = gsap.quickTo(r3d, 'rotationY', { duration: 1, ease: 'power3.out' });
    $('.result').addEventListener('mousemove', e => rrx((e.clientX / innerWidth - 0.5) * 22));
  }

  /* ---------- cards de depoimento com tilt ---------- */
  if (fine) $$('.tilt').forEach(c => {
    c.addEventListener('mousemove', e => {
      const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      c.style.transform = `rotateX(${-y * 10}deg) rotateY(${x * 12}deg) translateZ(10px)`;
    });
    c.addEventListener('mouseleave', () => (c.style.transform = ''));
  });

  /* ---------- botão magnético ---------- */
  if (fine) $$('.magnetic').forEach(b => {
    const mx = gsap.quickTo(b, 'x', { duration: 0.6, ease: 'power3.out' });
    const my = gsap.quickTo(b, 'y', { duration: 0.6, ease: 'power3.out' });
    b.addEventListener('mousemove', e => {
      const r = b.getBoundingClientRect();
      mx((e.clientX - r.left - r.width / 2) * 0.35); my((e.clientY - r.top - r.height / 2) * 0.45);
    });
    b.addEventListener('mouseleave', () => { mx(0); my(0); });
  });

  /* ---------- cursor ---------- */
  if (fine) {
    const cur = $('#cursor');
    const cx = gsap.quickTo(cur, 'x', { duration: 0.35, ease: 'power3.out' });
    const cy = gsap.quickTo(cur, 'y', { duration: 0.35, ease: 'power3.out' });
    addEventListener('mousemove', e => { cur.classList.add('on'); cx(e.clientX); cy(e.clientY); });
    $$('[data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', () => cur.classList.add('big'));
      el.addEventListener('mouseleave', () => cur.classList.remove('big'));
    });
  }

  /* ---------- glow final segue o scroll ---------- */
  gsap.fromTo('.final-glow', { scale: 0.6, autoAlpha: 0.3 }, {
    scale: 1.15, autoAlpha: 1, ease: 'none',
    scrollTrigger: { trigger: '.final', start: 'top bottom', end: 'bottom bottom', scrub: true }
  });

  window.intro = intro;
  const refresh = () => ScrollTrigger.refresh();
  document.fonts && document.fonts.ready.then(refresh);
  addEventListener('load', refresh);
})();

