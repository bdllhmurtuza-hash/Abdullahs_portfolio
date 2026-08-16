// script.js — portfolio interactivity
// All effects are built with touch devices in mind: anything that relies on
// hover has a sensible fallback for touch, and nothing here blocks scrolling
// or interferes with tap targets on mobile.

(function () {
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initNavActiveTracking();
    initStatCountUp();
    initCardGlow();
    initSkillShine();
    initMobileMenu();
  });

  // Mobile hamburger menu toggle
  function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('mobileMenu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      menu.classList.toggle('open');
    });

    // Close menu after tapping a link
    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        menu.classList.remove('open');
      });
    });
  }

  // 1. Scroll-reveal fade-ins — works identically on any screen size
  function initScrollReveal() {
    const targets = document.querySelectorAll(
      '.track, .exp-card, .skill-tile, .edu-card, .cert-card, .about-body p, .tag-pill'
    );
    if (!targets.length) return;

    if (prefersReducedMotion) return; // respect user preference, skip animation entirely

    targets.forEach((el) => el.classList.add('reveal-init'));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach((el) => observer.observe(el));
  }

  // 2. Nav pill active-state tracking — scroll-position based, same on all devices
  function initNavActiveTracking() {
    const navLinks = document.querySelectorAll('nav.links a[href^="#"]');
    if (!navLinks.length) return;

    const sections = Array.from(navLinks)
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = '#' + entry.target.id;
            navLinks.forEach((link) => {
              link.classList.toggle('active', link.getAttribute('href') === id);
            });
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
  }

  // 3. Stat count-up — pure on-load animation, no interaction dependency
  function initStatCountUp() {
    const statNums = document.querySelectorAll('.stat .num');
    if (!statNums.length) return;

    if (prefersReducedMotion) return;

    const animateValue = (el) => {
      const raw = el.textContent.trim();
      const match = raw.match(/^([\d.]+)(.*)$/); // split leading number from any suffix (e.g. "7mo+", "02")
      if (!match) return;

      const targetNum = parseFloat(match[1]);
      const suffix = match[2] || '';
      const isDecimal = match[1].includes('.');
      const decimals = isDecimal ? match[1].split('.')[1].length : 0;
      const duration = 900;
      const start = performance.now();

      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = targetNum * eased;
        el.textContent = current.toFixed(decimals) + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = raw; // snap to exact original value at the end
        }
      };
      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateValue(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNums.forEach((el) => observer.observe(el));
  }

  // 4. Cursor-follow glow on project cards — true cursor-follow on desktop,
  //    static centered glow on touch devices (no cursor to track there)
  function initCardGlow() {
    const cards = document.querySelectorAll('.track');
    if (!cards.length) return;

    cards.forEach((card) => {
      const glow = document.createElement('div');
      glow.className = 'card-glow';
      card.appendChild(glow);

      if (isTouch) {
        // No pointer on touch - just show a soft static glow, no listeners needed
        glow.style.left = '50%';
        glow.style.top = '30%';
        glow.classList.add('card-glow-static');
        return;
      }

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        glow.style.left = x + '%';
        glow.style.top = y + '%';
      });
    });
  }

  // 5. Skill tile shine sweep — CSS hover handles desktop automatically via
  //    :hover in the stylesheet; here we add a tap-triggered version for touch
  function initSkillShine() {
    if (!isTouch) return; // desktop uses pure CSS :hover, nothing to do here

    const tiles = document.querySelectorAll('.skill-tile');
    tiles.forEach((tile) => {
      tile.addEventListener('touchstart', () => {
        tile.classList.add('tile-tapped');
        setTimeout(() => tile.classList.remove('tile-tapped'), 700);
      }, { passive: true });
    });
  }
})();

function openCertificate(file) {
  const modal = document.getElementById("certificateModal");
  const frame = document.getElementById("certificateFrame");

  if (!modal || !frame) {
    console.error("Certificate modal elements not found.");
    return;
  }

  frame.classList.remove("certificate-landscape");

  if (file.includes("agratas-industrial-training")) {
    frame.classList.add("certificate-landscape");
  }

  frame.src = file + "#view=Fit";
  modal.classList.add("active");
}

function closeCertificate() {
  const modal = document.getElementById("certificateModal");
  const frame = document.getElementById("certificateFrame");

  if (!modal || !frame) {
    console.error("Certificate modal elements not found.");
    return;
  }

  modal.classList.remove("active");
  frame.src = "";
}

function openResumeModal() {
  const modal = document.getElementById("resumeModal");
  if (!modal) {
    console.error("Resume modal element not found.");
    return;
  }
  modal.classList.add("active");
}

function closeResumeModal() {
  const modal = document.getElementById("resumeModal");
  if (!modal) return;
  modal.classList.remove("active");
}

// Click outside the box (on the dark backdrop) closes either modal
document.addEventListener('click', (e) => {
  if (e.target.id === 'certificateModal') closeCertificate();
  if (e.target.id === 'resumeModal') closeResumeModal();
});

// Escape key closes whichever modal is open
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCertificate();
    closeResumeModal();
  }
});