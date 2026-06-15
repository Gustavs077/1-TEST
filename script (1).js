/* ============================================================
   ELITE ROOFING — script.js
   Handles: nav scroll, mobile menu, testimonial slider,
   scroll-reveal (AOS-style), contact form, back-to-top
   ============================================================ */

(function () {
  'use strict';

  /* ===== HELPERS ===== */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ===== DOM READY ===== */
  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initMobileMenu();
    initScrollReveal();
    initTestimonialSlider();
    initContactForm();
    initBackToTop();
    initSmoothScroll();
  });

  /* ============================================================
     NAVIGATION — sticky + style-on-scroll
     ============================================================ */
  function initNav() {
    const header = $('#nav-header');
    if (!header) return;

    let lastY = window.scrollY;

    function onScroll() {
      const y = window.scrollY;
      if (y > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      lastY = y;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  }

  /* ============================================================
     MOBILE MENU
     ============================================================ */
  function initMobileMenu() {
    const btn = $('#hamburger');
    const nav = $('#nav-links');
    if (!btn || !nav) return;

    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close on link click
    $$('a', nav).forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !btn.contains(e.target)) {
        nav.classList.remove('open');
        btn.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ============================================================
     SCROLL REVEAL (lightweight AOS replacement)
     ============================================================ */
  function initScrollReveal() {
    const items = $$('[data-aos]');
    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    items.forEach(el => observer.observe(el));
  }

  /* ============================================================
     TESTIMONIAL SLIDER
     ============================================================ */
  function initTestimonialSlider() {
    const track = $('#testimonials-track');
    const dotsContainer = $('#t-dots');
    const prevBtn = $('#t-prev');
    const nextBtn = $('#t-next');

    if (!track) return;

    const cards = $$('.testimonial-card', track);
    if (!cards.length) return;

    let current = 0;
    let autoplayTimer;
    let visibleCount = getVisibleCount();

    // Build dots
    const totalSlides = cards.length - visibleCount + 1;
    const dotCount = Math.max(1, totalSlides);

    if (dotsContainer) {
      for (let i = 0; i < cards.length; i++) {
        const dot = document.createElement('button');
        dot.className = 't-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      }
    }

    function getVisibleCount() {
      const w = window.innerWidth;
      if (w <= 768) return 1;
      if (w <= 1024) return 2;
      return 3;
    }

    function goTo(index) {
      visibleCount = getVisibleCount();
      const max = Math.max(0, cards.length - visibleCount);
      current = Math.min(Math.max(index, 0), max);

      const cardWidth = cards[0].offsetWidth + 24; // gap = 24px
      track.style.transform = `translateX(-${current * cardWidth}px)`;

      // Update dots
      $$('.t-dot', dotsContainer).forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    if (prevBtn) prevBtn.addEventListener('click', () => { clearAutoplay(); prev(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { clearAutoplay(); next(); });

    // Touch/swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) {
        clearAutoplay();
        dx < 0 ? next() : prev();
      }
    }, { passive: true });

    // Autoplay
    function startAutoplay() {
      autoplayTimer = setInterval(() => {
        visibleCount = getVisibleCount();
        const max = cards.length - visibleCount;
        if (current >= max) {
          goTo(0);
        } else {
          next();
        }
      }, 5000);
    }

    function clearAutoplay() { clearInterval(autoplayTimer); }

    startAutoplay();

    // Pause on hover
    track.parentElement.addEventListener('mouseenter', clearAutoplay);
    track.parentElement.addEventListener('mouseleave', startAutoplay);

    // Reflow on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        goTo(0);
      }, 200);
    });

    goTo(0); // init position
  }

  /* ============================================================
     CONTACT FORM
     ============================================================ */
  function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;

    const submitBtn = $('#submit-btn');
    const successMsg = $('#form-success');
    const btnText = $('.btn-text', submitBtn);
    const btnLoading = $('.btn-loading', submitBtn);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!validateForm(form)) return;

      // Show loading state
      submitBtn.disabled = true;
      if (btnText)    btnText.style.display = 'none';
      if (btnLoading) btnLoading.style.display = 'inline-flex';

      // Simulate async submission (replace with real fetch in production)
      await new Promise(resolve => setTimeout(resolve, 1600));

      // Success
      submitBtn.style.display = 'none';
      if (successMsg) successMsg.style.display = 'block';

      // Reset form
      form.reset();

      // Re-enable for re-submission after 6s
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.style.display = '';
        if (btnText)    btnText.style.display = '';
        if (btnLoading) btnLoading.style.display = 'none';
        if (successMsg) successMsg.style.display = 'none';
      }, 6000);
    });

    // Real-time validation feedback
    $$('input, textarea, select', form).forEach(field => {
      field.addEventListener('blur', () => {
        if (field.required && !field.value.trim()) {
          field.style.borderColor = '#ef4444';
        } else if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
          field.style.borderColor = '#ef4444';
        } else {
          field.style.borderColor = '';
        }
      });

      field.addEventListener('input', () => {
        if (field.style.borderColor === 'rgb(239, 68, 68)') {
          field.style.borderColor = '';
        }
      });
    });
  }

  function validateForm(form) {
    let valid = true;
    const required = $$('[required]', form);

    required.forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#ef4444';
        valid = false;
      }
    });

    const emailField = $('#email', form);
    if (emailField && emailField.value && !isValidEmail(emailField.value)) {
      emailField.style.borderColor = '#ef4444';
      valid = false;
    }

    if (!valid) {
      // Scroll to first error
      const firstError = form.querySelector('[style*="border-color: rgb(239"]');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return valid;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* ============================================================
     BACK TO TOP
     ============================================================ */
  function initBackToTop() {
    const btn = $('#back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================================
     SMOOTH SCROLL (for anchor links with offset for sticky nav)
     ============================================================ */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        const navH = document.querySelector('.nav-header')?.offsetHeight || 70;
        const top = target.getBoundingClientRect().top + window.scrollY - navH - 8;

        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

})();
