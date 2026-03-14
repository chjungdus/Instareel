/* ============================================================
   Estrellas de Colores – Main JavaScript
   Includes: Cart, Checkout (Mollie-ready), UI interactions
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar scroll shadow ─────────────────────────────── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });


  /* ── Hamburger menu ───────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  navLinks.querySelectorAll('.dropdown > .nav-link').forEach(link => {
    link.addEventListener('click', e => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        link.parentElement.classList.toggle('open');
      }
    });
  });


  /* ── Active nav on scroll ─────────────────────────────── */
  const sections    = document.querySelectorAll('section[id]');
  const allNavLinks = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        allNavLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => sectionObserver.observe(s));


  /* ── Back to top ──────────────────────────────────────── */
  const backBtn = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backBtn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));


  /* ── Smooth scroll ────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* ── Scroll reveal ────────────────────────────────────── */
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


  /* ── Size selector ────────────────────────────────────── */
  document.querySelectorAll('.product-card').forEach(card => {
    card.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        card.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  });


  /* ============================================================
     SHOPPING CART
  ============================================================ */

  /**
   * Cart state: array of { id, name, price, emoji, size, qty }
   * Persisted in localStorage.
   */
  let cart = loadCart();

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem('edc_cart')) || [];
    } catch {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem('edc_cart', JSON.stringify(cart));
  }

  function cartKey(id, size) { return `${id}__${size}`; }

  function addToCart(id, name, price, emoji, size) {
    const key = cartKey(id, size);
    const existing = cart.find(i => cartKey(i.id, i.size) === key);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id, name, price: parseFloat(price), emoji, size, qty: 1 });
    }
    saveCart();
    updateCartUI();
    openCart();
  }

  function removeFromCart(key) {
    cart = cart.filter(i => cartKey(i.id, i.size) !== key);
    saveCart();
    updateCartUI();
  }

  function changeQty(key, delta) {
    const item = cart.find(i => cartKey(i.id, i.size) === key);
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    saveCart();
    updateCartUI();
  }

  function cartTotal() {
    return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function cartCount() {
    return cart.reduce((sum, i) => sum + i.qty, 0);
  }

  function fmtPrice(n) {
    return '€' + n.toFixed(2).replace('.', ',');
  }

  function updateCartUI() {
    const badge   = document.getElementById('cartBadge');
    const body    = document.getElementById('cartBody');
    const footer  = document.getElementById('cartFooter');
    const subtotal= document.getElementById('cartSubtotal');
    const count   = cartCount();

    // Badge
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';

    // Body
    if (cart.length === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <span>🛍️</span>
          <p>Uw winkelmandje is leeg.</p>
          <p>Voeg een product toe om te beginnen!</p>
        </div>`;
      footer.style.display = 'none';
    } else {
      body.innerHTML = cart.map(item => {
        const key = cartKey(item.id, item.size);
        return `
          <div class="cart-item">
            <div class="cart-item-emoji">${item.emoji}</div>
            <div class="cart-item-info">
              <strong>${item.name}</strong>
              <span class="cart-item-size">Maat: ${item.size}</span>
              <div class="cart-item-qty">
                <button class="qty-btn" data-key="${key}" data-delta="-1">−</button>
                <span>${item.qty}</span>
                <button class="qty-btn" data-key="${key}" data-delta="1">+</button>
              </div>
            </div>
            <div class="cart-item-right">
              <span class="cart-item-price">${fmtPrice(item.price * item.qty)}</span>
              <button class="cart-remove" data-key="${key}" aria-label="Verwijder">🗑</button>
            </div>
          </div>`;
      }).join('');

      footer.style.display = 'block';
      subtotal.textContent = fmtPrice(cartTotal());

      // Qty buttons
      body.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          changeQty(btn.dataset.key, parseInt(btn.dataset.delta));
        });
      });
      // Remove buttons
      body.querySelectorAll('.cart-remove').forEach(btn => {
        btn.addEventListener('click', () => removeFromCart(btn.dataset.key));
      });
    }
  }


  /* ── Add to cart buttons ──────────────────────────────── */
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const card  = btn.closest('.product-card');
      const id    = card.dataset.id;
      const name  = card.dataset.name;
      const price = card.dataset.price;
      const emoji = card.dataset.emoji;
      const activeSize = card.querySelector('.size-btn.active');
      const size  = activeSize ? activeSize.dataset.size : '?';

      addToCart(id, name, price, emoji, size);

      // Button feedback
      const original = btn.innerHTML;
      btn.innerHTML = '✓ Toegevoegd!';
      btn.style.background = '#4CAF50';
      setTimeout(() => {
        btn.innerHTML = original;
        btn.style.background = '';
      }, 1500);
    });
  });


  /* ── Cart Drawer open/close ───────────────────────────── */
  const cartDrawer  = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartBtn     = document.getElementById('cartBtn');
  const cartClose   = document.getElementById('cartClose');

  function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  cartBtn.addEventListener('click', () => {
    cartDrawer.classList.contains('open') ? closeCart() : openCart();
  });
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);


  /* ── Checkout button (cart → modal) ──────────────────── */
  document.getElementById('checkoutBtn').addEventListener('click', () => {
    closeCart();
    openCheckout();
  });


  /* ============================================================
     CHECKOUT MODAL
  ============================================================ */
  const checkoutModal   = document.getElementById('checkoutModal');
  const checkoutOverlay = document.getElementById('checkoutOverlay');
  const checkoutClose   = document.getElementById('checkoutClose');

  function openCheckout() {
    checkoutModal.classList.add('open');
    checkoutOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    showStep(1);
  }
  function closeCheckout() {
    checkoutModal.classList.remove('open');
    checkoutOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  checkoutClose.addEventListener('click', closeCheckout);
  checkoutOverlay.addEventListener('click', closeCheckout);

  function showStep(n) {
    [1, 2, 3].forEach(i => {
      document.getElementById(`step${i}`).style.display = i === n ? 'block' : 'none';
    });
    checkoutModal.scrollTop = 0;
    if (n === 2) renderOrderSummary();
  }

  // Step 1 → 2
  document.getElementById('checkoutForm1').addEventListener('submit', e => {
    e.preventDefault();
    showStep(2);
  });

  // Back step 2 → 1
  document.getElementById('backToStep1').addEventListener('click', () => showStep(1));

  // iDEAL bank visibility
  document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.getElementById('idealBanks').style.display =
        radio.value === 'ideal' ? 'block' : 'none';
    });
  });

  function renderOrderSummary() {
    const el = document.getElementById('orderSummary');
    const totalEl = document.getElementById('checkoutTotal');
    el.innerHTML = cart.map(item => `
      <div class="order-line">
        <span>${item.emoji} ${item.name} <small>(maat ${item.size})</small> × ${item.qty}</span>
        <span>${fmtPrice(item.price * item.qty)}</span>
      </div>`).join('') +
      `<div class="order-line order-shipping">
        <span>🚚 Verzendkosten</span>
        <span>€4,95</span>
      </div>`;

    const shipping = 4.95;
    totalEl.textContent = fmtPrice(cartTotal() + shipping);
  }

  /* ── Pay Now (Mollie integration point) ──────────────── */
  document.getElementById('payNowBtn').addEventListener('click', () => {
    const method = document.querySelector('input[name="payment"]:checked').value;
    const bank   = document.getElementById('bankSelect').value;

    if (method === 'ideal' && !bank) {
      alert('Selecteer alstublieft uw bank voor iDEAL betaling.');
      return;
    }

    startPayment(method, bank);
  });

  /**
   * startPayment – Mollie Integration
   *
   * HOW TO CONNECT MOLLIE (stap voor stap):
   * ─────────────────────────────────────────
   * 1. Maak een gratis account op https://mollie.com
   * 2. Ga naar Dashboard → Developers → API keys
   * 3. Kopieer uw LIVE API key (bijv. live_xxxxxxxxxxxx)
   * 4. Maak een backend endpoint (PHP/Node.js/Python) dat:
   *    - Een Mollie payment aanmaakt via de Mollie API
   *    - De checkoutUrl terugstuurt naar de frontend
   *    - Voorbeeld PHP: https://github.com/mollie/mollie-api-php
   * 5. Vervang de fetch() URL hieronder met uw backend URL
   *
   * Voorbeeld backend endpoint (PHP):
   * ──────────────────────────────────
   * $mollie = new \Mollie\Api\MollieApiClient();
   * $mollie->setApiKey('live_xxxxxx');
   * $payment = $mollie->payments->create([
   *   'amount'      => ['currency' => 'EUR', 'value' => '34.90'],
   *   'description' => 'Bestelling Estrellas de Colores',
   *   'redirectUrl' => 'https://uwwebsite.nl/bedankt',
   *   'method'      => 'ideal',
   *   'issuer'      => $_POST['bank'], // bijv. 'INGBNL2A'
   * ]);
   * echo json_encode(['checkoutUrl' => $payment->getCheckoutUrl()]);
   */
  async function startPayment(method, bank) {
    const payBtn = document.getElementById('payNowBtn');
    payBtn.innerHTML = '⏳ Even geduld...';
    payBtn.disabled  = true;

    /* ── DEMO MODE (geen echte betaling) ─────────────────────
       Verwijder dit blok en uncomment de fetch() hieronder
       zodra u een backend heeft aangesloten.                   */
    await new Promise(r => setTimeout(r, 1500)); // simuleer network
    simulateSuccess(method);
    /* ── EINDE DEMO MODE ─────────────────────────────────── */

    /* ── PRODUCTIE: uncomment dit blok + vul uw backend URL in
    try {
      const resp = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount:  (cartTotal() + 4.95).toFixed(2),
          method,
          bank,
          items: cart,
          customer: {
            name:  document.getElementById('chkFirstName').value + ' ' +
                   document.getElementById('chkLastName').value,
            email: document.getElementById('chkEmail').value,
          }
        })
      });
      const data = await resp.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl; // → Mollie hosted checkout
      } else {
        throw new Error(data.error || 'Onbekende fout');
      }
    } catch (err) {
      alert('❌ Betaling kon niet worden gestart: ' + err.message);
      payBtn.innerHTML = 'Nu betalen 🔒';
      payBtn.disabled  = false;
    }
    ── EINDE PRODUCTIE ──────────────────────────────────── */
  }

  function simulateSuccess(method) {
    const methodNames = {
      ideal: 'iDEAL', creditcard: 'Creditcard',
      paypal: 'PayPal', klarna: 'Klarna'
    };
    const confirmEl = document.getElementById('confirmDetails');
    confirmEl.innerHTML = `
      <div class="confirm-row"><span>Betaalwijze</span><strong>${methodNames[method]}</strong></div>
      <div class="confirm-row"><span>Totaalbedrag</span><strong>${fmtPrice(cartTotal() + 4.95)}</strong></div>
      <div class="confirm-row"><span>E-mail</span><strong>${document.getElementById('chkEmail').value}</strong></div>
    `;
    cart = [];
    saveCart();
    updateCartUI();
    showStep(3);
  }

  /* ── Confirm → close ──────────────────────────────────── */
  document.getElementById('confirmDone').addEventListener('click', () => {
    closeCheckout();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  /* ── Review Form ──────────────────────────────────────── */
  const starBtns    = document.querySelectorAll('.star-btn');
  const ratingInput = document.getElementById('ratingValue');
  const reviewForm  = document.getElementById('reviewForm');
  const reviewSuccess = document.getElementById('reviewSuccess');

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

  if (reviewForm) {
    reviewForm.addEventListener('submit', e => {
      e.preventDefault();
      if (+ratingInput.value === 0) { alert('Selecteer alstublieft een beoordeling.'); return; }
      reviewForm.style.display = 'none';
      reviewSuccess.style.display = 'block';
      reviewSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }


  /* ── Contact Form ─────────────────────────────────────── */
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


  /* ── Newsletter ───────────────────────────────────────── */
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = newsletterForm.querySelector('button');
      btn.textContent = '✅ Aangemeld!';
      btn.disabled = true;
      newsletterForm.querySelector('input').disabled = true;
    });
  }


  /* ── Init ─────────────────────────────────────────────── */
  updateCartUI();

});
