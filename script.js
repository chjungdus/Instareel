/* ============================================================
   Estrellas de Colores – Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar scroll shadow ─────────────────────────────── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });


  /* ── Hamburger menu ───────────────────────────────────── */
  const hamburger  = document.getElementById('hamburger');
  const navLinks   = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close on link click
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  // Mobile dropdown toggle
  navLinks.querySelectorAll('.dropdown > .nav-link').forEach(link => {
    link.addEventListener('click', e => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        link.parentElement.classList.toggle('open');
      }
    });
  });


  /* ── Active nav link on scroll ────────────────────────── */
  const sections = document.querySelectorAll('section[id], div[id]');
  const allNavLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        allNavLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => observer.observe(s));


  /* ── Back to top ──────────────────────────────────────── */
  const backBtn = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backBtn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));


  /* ── Star Rating (Review Form) ────────────────────────── */
  const starBtns    = document.querySelectorAll('.star-btn');
  const ratingInput = document.getElementById('ratingValue');

  starBtns.forEach(btn => {
    btn.addEventListener('mouseenter', () => highlightStars(+btn.dataset.val));
    btn.addEventListener('mouseleave', () => highlightStars(+ratingInput.value));
    btn.addEventListener('click', () => {
      ratingInput.value = btn.dataset.val;
      highlightStars(+btn.dataset.val);
    });
  });

  function highlightStars(val) {
    starBtns.forEach(b => b.classList.toggle('active', +b.dataset.val <= val));
  }


  /* ── Review Form Submit ───────────────────────────────── */
  const reviewForm    = document.getElementById('reviewForm');
  const reviewSuccess = document.getElementById('reviewSuccess');

  if (reviewForm) {
    reviewForm.addEventListener('submit', e => {
      e.preventDefault();
      const rating = +document.getElementById('ratingValue').value;
      if (rating === 0) {
        alert('Selecteer alstublieft een beoordeling (aantal sterren).');
        return;
      }
      reviewForm.style.display = 'none';
      reviewSuccess.style.display = 'block';

      // Smooth scroll to success
      reviewSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }


  /* ── Contact Form Submit ──────────────────────────────── */
  const contactForm    = document.getElementById('contactForm');
  const contactSuccess = document.getElementById('contactSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      contactForm.style.display = 'none';
      contactSuccess.style.display = 'block';
      contactSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }


  /* ── Newsletter Form Submit ───────────────────────────── */
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', e => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input[type="email"]');
      const btn   = newsletterForm.querySelector('button');
      btn.textContent = '✅ Aangemeld!';
      btn.disabled = true;
      input.disabled = true;
    });
  }


  /* ── Smooth scroll for anchor links ──────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 100; // header height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* ── Reveal on scroll (fade-in) ──────────────────────── */
  const revealEls = document.querySelectorAll(
    '.category-card, .product-card, .review-card, .about-hl, .usp-item, .info-card'
  );

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 60);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity .5s ease, transform .5s ease';
    revealObserver.observe(el);
  });

});
