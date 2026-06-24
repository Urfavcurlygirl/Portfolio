document.addEventListener('DOMContentLoaded', () => {

  // ===== THEME TOGGLE =====
  const htmlEl = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
  htmlEl.setAttribute('data-theme', savedTheme);
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = htmlEl.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      htmlEl.setAttribute('data-theme', next);
      localStorage.setItem('portfolio-theme', next);
    });
  }

  // ===== PRELOADER (pill → WELCOME → expand reveal) =====
  const preloader = document.getElementById('preloader');
  const prePill = document.getElementById('prePill');
  const preCounter = document.getElementById('preCounter');
  const alreadyVisited = sessionStorage.getItem('portfolio-loaded');

  function finishLoader() {
    // Force scroll to top after loader finishes
    window.scrollTo(0, 0);
    document.body.style.overflow = '';
    sessionStorage.setItem('portfolio-loaded', '1');
    // Re-init canvas size
    resizeCanvas();
    // Start typing effect in hero
    startTyping();
  }

  if (alreadyVisited) {
    // Skip loader entirely
    if (preloader) {
      preloader.style.display = 'none';
    }
    document.body.style.overflow = '';
    window.scrollTo(0, 0);
    // Start typing immediately (with short delay for page render)
    setTimeout(startTyping, 300);
  } else {
    document.body.style.overflow = 'hidden';
    const startTime = performance.now();
    const totalDuration = 2200;

    function updateLoader() {
      const elapsed = performance.now() - startTime;
      const linear = Math.min(elapsed / totalDuration, 1);
      const pct = Math.round(easeInOutCubic(linear) * 100);
      preCounter.textContent = pct + '%';

      if (pct < 100) {
        requestAnimationFrame(updateLoader);
      } else {
        // Show WELCOME
        setTimeout(() => {
          preCounter.innerHTML = 'WELCOME <span class="pre-cursor"></span>';
          // Start reveal — pill expands
          setTimeout(() => {
            preloader.classList.add('reveal-anim');
            setTimeout(() => {
              preloader.style.display = 'none';
              finishLoader();
            }, 1000);
          }, 800);
        }, 400);
      }
    }
    requestAnimationFrame(updateLoader);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // ===== TYPING EFFECT (hero tagline) =====
  function startTyping() {
    const lines = document.querySelectorAll('.tagline-line');
    if (!lines.length) return;
    let lineIdx = 0;

    function typeLine() {
      if (lineIdx >= lines.length) return;
      const el = lines[lineIdx];
      const text = el.dataset.text;
      el.style.opacity = '1';
      let i = 0;
      el.innerHTML = '<span class="typed-cursor">|</span>';
      const t = setInterval(() => {
        el.innerHTML = text.substring(0, i + 1) + '<span class="typed-cursor">|</span>';
        i++;
        if (i >= text.length) {
          clearInterval(t);
          el.innerHTML = text;
          lineIdx++;
          setTimeout(typeLine, 350);
        }
      }, 65);
    }
    // Small delay before starting
    setTimeout(typeLine, 700);
  }

  // ===== CUSTOM CURSOR (simple circle with lag) =====
  const cursor = document.getElementById('cursor');
  let cx = 0, cy = 0, tx = 0, ty = 0;

  if (window.innerWidth > 768 && cursor) {
    document.addEventListener('mousemove', e => {
      tx = e.clientX;
      ty = e.clientY;
    });

    // Smooth lag follow
    (function animCursor() {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
      requestAnimationFrame(animCursor);
    })();

    // Click feedback
    document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
    document.addEventListener('mouseup', () => cursor.classList.remove('clicking'));

    // Hover: text shifts color — detect white text and use black instead
    let lastHovered = null;
    function isLightColor(el) {
      const c = getComputedStyle(el).color;
      const m = c.match(/\d+/g);
      if (!m || m.length < 3) return false;
      const [r, g, b] = m.map(Number);
      // Luminance > 180 means light/white text
      return (r * 0.299 + g * 0.587 + b * 0.114) > 180;
    }
    document.addEventListener('mouseover', e => {
      const target = e.target.closest('a, button, .btn, .project-card h3, .project-link, .contact-icon, .nav-links a, .cloud-tag');
      if (target && target !== lastHovered) {
        if (lastHovered) {
          lastHovered.classList.remove('cursor-hovered');
          lastHovered.classList.remove('cursor-hovered-dark');
        }
        // Use dark hover for white/light text, accent for dark text
        if (isLightColor(target)) {
          target.classList.add('cursor-hovered-dark');
        } else {
          target.classList.add('cursor-hovered');
        }
        lastHovered = target;
      }
    });
    document.addEventListener('mouseout', e => {
      const target = e.target.closest('a, button, .btn, .project-card h3, .project-link, .contact-icon, .nav-links a, .cloud-tag');
      if (target) {
        target.classList.remove('cursor-hovered');
        target.classList.remove('cursor-hovered-dark');
        if (target === lastHovered) lastHovered = null;
      }
    });
  }

  // ===== SPARKLE TRAIL (contact section — CONTINUOUS) =====
  const canvas = document.getElementById('sparkleCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let sparkles = [];

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const contactSec = document.getElementById('contact');
  const heroSec = document.getElementById('hero');

  if (canvas && ctx) {
    // Sparkle handler — fires in both Hero and Contact sections
    function handleSparkleMove(e) {
      let active = false;
      // Check Contact section
      if (contactSec) {
        const cr = contactSec.getBoundingClientRect();
        if (e.clientY >= cr.top && e.clientY <= cr.bottom) active = true;
      }
      // Check Hero section
      if (!active && heroSec) {
        const hr = heroSec.getBoundingClientRect();
        if (e.clientY >= hr.top && e.clientY <= hr.bottom) active = true;
      }
      if (active) {
        const count = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
          sparkles.push({
            x: e.clientX,
            y: e.clientY,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1,
            size: Math.random() * 3 + 1.5,
            color: ['#6366f1', '#8b5cf6', '#06b6d4', '#a78bfa', '#fff'][Math.floor(Math.random() * 5)]
          });
        }
      }
    }

    // Attach with capture phase to ensure it always fires
    window.addEventListener('mousemove', handleSparkleMove, true);

    // Separate render loop — never stops
    function renderSparkles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.02;
        s.life -= 0.018;
        if (s.life <= 0) {
          sparkles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = s.life * 0.8;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(renderSparkles);
    }
    renderSparkles();
  }

  // ===== NAVBAR =====
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const spans = navToggle.querySelectorAll('span');
      const o = navLinks.classList.contains('open');
      spans[0].style.transform = o ? 'rotate(45deg) translate(5px,5px)' : 'none';
      spans[1].style.opacity = o ? '0' : '1';
      spans[2].style.transform = o ? 'rotate(-45deg) translate(5px,-5px)' : 'none';
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.querySelectorAll('span').forEach(s => { s.style.transform = 'none'; s.style.opacity = '1'; });
    }));
  }

  // ===== SCROLL REVEAL (staggered — works everywhere) =====
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        // Find siblings for stagger
        const parent = e.target.parentElement;
        const siblings = parent ? Array.from(parent.querySelectorAll(':scope > .reveal')) : [];
        const idx = siblings.indexOf(e.target);
        const delay = idx >= 0 ? idx * 100 : 0;
        e.target.style.transitionDelay = delay + 'ms';
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  // ===== SKILL BARS (animate on scroll) =====
  const barObs = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) {
      // Small delay so bar fills after the reveal animation
      setTimeout(() => {
        e.target.style.width = e.target.dataset.width;
      }, 200);
      barObs.unobserve(e.target);
    }
  }), { threshold: 0.2 });
  document.querySelectorAll('.skill-bar-fill').forEach(b => barObs.observe(b));

  // ===== STAT COUNTERS =====
  const ctrObs = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, tgt = +el.dataset.target;
    let cur = 0;
    const iv = setInterval(() => {
      cur++;
      if (cur >= tgt) { cur = tgt; clearInterval(iv); }
      el.textContent = cur;
    }, 80);
    ctrObs.unobserve(el);
  }), { threshold: 0.5 });
  document.querySelectorAll('.stat-number').forEach(el => ctrObs.observe(el));

  // ===== PROJECT CARD TILT =====
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.transform = `perspective(800px) rotateX(${((y - r.height / 2) / (r.height / 2)) * -3}deg) rotateY(${((x - r.width / 2) / (r.width / 2)) * 3}deg) translateY(-4px)`;
      card.style.setProperty('--mx', (x / r.width * 100).toFixed(0) + '%');
      card.style.setProperty('--my', (y / r.height * 100).toFixed(0) + '%');
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ===== SCROLL-LOCKED HORIZONTAL SECTIONS =====
  const hscrollSections = [
    { sectionId: 'projects', trackId: 'projectsTrack', barId: 'hscrollBar' },
    { sectionId: 'certificates', trackId: 'certsTrack', barId: 'certsScrollBar' }
  ];

  let hscrollHandlers = [];
  let hscrollTimers = [];

  hscrollSections.forEach((cfg, index) => {
    const section = document.getElementById(cfg.sectionId);
    const track = document.getElementById(cfg.trackId);
    const bar = document.getElementById(cfg.barId);
    if (!section || !track) return;

    const cards = track.querySelectorAll('.project-card');
    const cardCount = cards.length;
    if (cardCount === 0) return;
    
    let scrollHandler = null;

    function setupScrollLock() {
      if (scrollHandler) {
        window.removeEventListener('scroll', scrollHandler);
        scrollHandler = null;
      }

      // Reset styles to calculate natural height
      section.style.height = '';
      track.style.transform = '';

      if (window.innerWidth <= 768) {
        track.style.overflowX = 'auto';
        track.style.scrollSnapType = 'x mandatory';
        cards.forEach(c => c.style.scrollSnapAlign = 'center');
        return;
      }

      const cardWidth = cards[0] ? cards[0].offsetWidth : 400;
      const gap = 32;
      const trackWidth = cardCount * cardWidth + (cardCount - 1) * gap;
      const viewportWidth = window.innerWidth;
      const overflow = Math.max(0, trackWidth - viewportWidth + 64);

      if (overflow === 0) return;

      const naturalHeight = section.getBoundingClientRect().height;
      const deadZoneStart = 300; // Scroll distance before track starts moving
      const deadZoneEnd = 150;   // Scroll distance at the end before section un-sticks
      const extraScroll = overflow + deadZoneStart + deadZoneEnd;

      section.style.height = (naturalHeight + extraScroll) + 'px';

      track.style.overflowX = 'hidden';
      track.style.scrollSnapType = 'none';

      scrollHandler = function() {
        const hscrollEl = section.querySelector('.projects-hscroll') || section.querySelector('.hscroll-wrapper') || section.children[1];
        const stickyRect = hscrollEl.getBoundingClientRect();
        const sectionRect = section.getBoundingClientRect();

        const distanceScrolledWhileStuck = Math.max(0, extraScroll - (sectionRect.bottom - stickyRect.bottom));

        let progress = 0;
        if (stickyRect.top <= 1) { 
           if (distanceScrolledWhileStuck <= deadZoneStart) {
             progress = 0;
           } else if (distanceScrolledWhileStuck >= extraScroll - deadZoneEnd) {
             progress = 1;
           } else {
             progress = (distanceScrolledWhileStuck - deadZoneStart) / overflow;
           }
        }

        progress = Math.max(0, Math.min(1, progress));
        const translateX = -progress * overflow;
        track.style.transform = `translateX(${translateX}px)`;
        if (bar) bar.style.width = (progress * 100) + '%';
      };

      window.addEventListener('scroll', scrollHandler, { passive: true });
      scrollHandler();
      hscrollHandlers[index] = scrollHandler;
    }

    setupScrollLock();
    window.addEventListener('resize', () => {
      clearTimeout(hscrollTimers[index]);
      hscrollTimers[index] = setTimeout(setupScrollLock, 150);
    });
  });

  // ===== MAGNETIC HOVER =====
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) * 0.2;
      const dy = (e.clientY - r.top - r.height / 2) * 0.2;
      el.style.transform = `translate(${dx}px,${dy}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });

  // ===== SCROLL-DRIVEN TIMELINE =====
  const timeline = document.getElementById('timeline');
  const tlFill = document.getElementById('tlLineFill');
  const tlItems = document.querySelectorAll('.tl-item');
  if (timeline && tlFill) {
    window.addEventListener('scroll', () => {
      const rect = timeline.getBoundingClientRect();
      const tlH = timeline.offsetHeight;
      const viewH = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (viewH - rect.top) / (tlH + viewH * 0.5)));
      tlFill.style.height = (progress * 100) + '%';
      tlItems.forEach(item => {
        const itemTop = item.offsetTop / tlH;
        if (progress >= itemTop * 0.85) item.classList.add('tl-visible');
      });
    }, { passive: true });
  }

  // ===== SCROLL PROGRESS RING =====
  const spWrap = document.getElementById('scrollProgress');
  const spFill = document.getElementById('spFill');
  const spPct = document.getElementById('spPct');
  const circ = 2 * Math.PI * 16;
  if (spFill) {
    spFill.style.strokeDasharray = circ;
    spFill.style.strokeDashoffset = circ;
  }
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h > 0 ? window.scrollY / h : 0;
    if (spFill) spFill.style.strokeDashoffset = circ - circ * p;
    if (spPct) spPct.textContent = Math.round(p * 100) + '%';
    if (spWrap) spWrap.classList.toggle('show', window.scrollY > 200);
  }, { passive: true });

  // ===== ACTIVE NAV =====
  const sections = document.querySelectorAll('section[id]');
  const anchors = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', () => {
    const y = window.scrollY + 140;
    const atBottom = (window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 50;
    if (atBottom) {
      anchors.forEach(a => a.classList.remove('active'));
      const last = anchors[anchors.length - 1];
      if (last) last.classList.add('active');
      return;
    }
    sections.forEach(s => {
      const link = document.querySelector(`.nav-links a[href="#${s.id}"]`);
      if (link && y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) {
        anchors.forEach(a => a.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { passive: true });

  // ===== IMAGE MODAL =====
  const modal = document.createElement('div');
  modal.id = 'imageModal';
  modal.className = 'modal';
  modal.innerHTML = `
    <span class="close-modal">&times;</span>
    <img class="modal-content" id="modalImg">
    <div id="modalCaption"></div>
  `;
  document.body.appendChild(modal);

  const modalImg = document.getElementById('modalImg');
  const captionText = document.getElementById('modalCaption');

  modal.addEventListener('click', () => modal.classList.remove('active'));

  document.querySelectorAll('.project-card .project-cover img').forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', function(e) {
      e.stopPropagation();
      modal.classList.add('active');
      modalImg.src = this.src;
      const titleEl = this.closest('.project-card').querySelector('h3');
      captionText.innerHTML = titleEl ? titleEl.innerHTML : this.alt;
    });
  });

});
