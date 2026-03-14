/* ============================================================
   Estrellas de Colores – Main JavaScript (DE)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar scroll shadow (handled via #header.scrolled) ─ */


  /* ── Back to top ──────────────────────────────────────── */
  const backBtn = document.getElementById('backToTop');
  if (backBtn) {
    window.addEventListener('scroll', () => {
      backBtn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ── Sticky header scroll shadow ──────────────────────── */
  const headerEl = document.getElementById('header');
  if (headerEl) {
    window.addEventListener('scroll', () => {
      headerEl.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }


  /* ── Smooth scroll ────────────────────────────────────── */
  function scrollToEl(selector) {
    const el = document.querySelector(selector);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        scrollToEl(href);
      }
    });
  });


  /* ── Scroll reveal ────────────────────────────────────── */
  const revealEls = document.querySelectorAll(
    '.category-card, .review-card, .about-hl, .usp-item, .info-card'
  );
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 60);
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealEls.forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity .45s ease, transform .45s ease';
    revealObs.observe(el);
  });


  /* ============================================================
     MOBILE MENU
  ============================================================ */
  const hamburger      = document.getElementById('hamburger');
  const mobileMenu     = document.getElementById('mobileMenu');
  const mobileOverlay  = document.getElementById('mobileOverlay');
  const mobileClose    = document.getElementById('mobileMenuClose');

  function openMobileMenu() {
    mobileMenu.classList.add('open');
    mobileOverlay.classList.add('open');
    hamburger.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    mobileOverlay.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
  });
  mobileClose.addEventListener('click', closeMobileMenu);
  mobileOverlay.addEventListener('click', closeMobileMenu);

  // Close on nav item click (data-close attribute)
  mobileMenu.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', closeMobileMenu);
  });


  /* ============================================================
     CATEGORY FILTER
  ============================================================ */
  const filterBtns   = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');
  const shopTitle    = document.getElementById('shopTitle');
  const noProducts   = document.getElementById('noProducts');

  const categoryNames = {
    alle: 'Alle Produkte',
    maedchen: '👗 Mädchen',
    kleider: '👗 Kleider',
    jungen: '👕 Jungen',
    baby: '🍼 Baby',
    kleinkind: '🧒 Kleinkind',
    jogginghosen: '🩳 Jogginghosen',
    accessoires: '🎀 Accessoires',
  };

  function applyFilter(filter) {
    // Update active filter button
    filterBtns.forEach(b => b.classList.toggle('active', b.dataset.filter === filter));

    // Update shop title
    if (shopTitle) shopTitle.textContent = categoryNames[filter] || 'Alle Produkte';

    // Clear search input when filtering
    const navSearch   = document.getElementById('navSearch');
    const mobileSearch = document.getElementById('mobileSearch');
    if (navSearch)    navSearch.value    = '';
    if (mobileSearch) mobileSearch.value = '';

    // Show/hide product cards
    let visibleCount = 0;
    productCards.forEach((card, i) => {
      const match = filter === 'alle' || card.dataset.category === filter;
      if (match) {
        card.classList.remove('hidden');
        card.style.animationDelay = `${visibleCount * 50}ms`;
        card.classList.add('fade-in');
        visibleCount++;
        // Remove animation class after it plays so it can re-trigger
        card.addEventListener('animationend', () => card.classList.remove('fade-in'), { once: true });
      } else {
        card.classList.add('hidden');
      }
    });

    if (noProducts) noProducts.style.display = visibleCount === 0 ? 'block' : 'none';
  }

  /* ── Product Search ───────────────────────────────────── */
  function searchProducts(query) {
    const q = query.trim().toLowerCase();
    // Reset filter buttons to "alle" state visually
    filterBtns.forEach(b => b.classList.toggle('active', b.dataset.filter === 'alle'));
    if (shopTitle) shopTitle.textContent = q ? `🔍 Suche: "${query}"` : 'Alle Produkte';

    let visibleCount = 0;
    productCards.forEach(card => {
      const name = (card.dataset.name || '').toLowerCase();
      const desc = (card.querySelector('.product-desc')?.textContent || '').toLowerCase();
      const cat  = (card.dataset.category || '').toLowerCase();
      const match = !q || name.includes(q) || desc.includes(q) || cat.includes(q);
      if (match) {
        card.classList.remove('hidden');
        visibleCount++;
      } else {
        card.classList.add('hidden');
      }
    });
    if (noProducts) noProducts.style.display = visibleCount === 0 ? 'block' : 'none';
  }

  const navSearch    = document.getElementById('navSearch');
  const mobileSearch = document.getElementById('mobileSearch');

  function handleSearch(q) {
    // Sync both inputs
    if (navSearch)    navSearch.value    = q;
    if (mobileSearch) mobileSearch.value = q;

    if (q.trim()) {
      searchProducts(q);
      // Close mobile menu so results are visible
      if (mobileMenu && mobileMenu.classList.contains('open')) closeMobileMenu();
      // Scroll to shop if not already there
      const shopEl = document.getElementById('shop');
      if (shopEl) {
        const rect = shopEl.getBoundingClientRect();
        if (rect.top > window.innerHeight || rect.bottom < 0) {
          setTimeout(() => scrollToEl('#shop'), 60);
        }
      }
    } else {
      applyFilter('alle');
    }
  }

  if (navSearch)    navSearch.addEventListener('input',    () => handleSearch(navSearch.value));
  if (mobileSearch) mobileSearch.addEventListener('input', () => handleSearch(mobileSearch.value));

  // Filter bar button clicks
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      applyFilter(btn.dataset.filter);
    });
  });

  // "Zeig alle" button in empty state
  const showAllBtn = document.getElementById('showAllBtn');
  if (showAllBtn) {
    showAllBtn.addEventListener('click', () => applyFilter('alle'));
  }

  // Category cards & links with data-filter attribute
  function handleFilterLink(el) {
    const filter = el.dataset.filter;
    if (!filter) return;
    applyFilter(filter);
    // scroll to shop section
    setTimeout(() => scrollToEl('#shop'), 50);
  }

  document.querySelectorAll('[data-filter]').forEach(el => {
    if (el.tagName === 'BUTTON' && el.classList.contains('filter-btn')) return; // already handled
    el.addEventListener('click', e => {
      e.preventDefault();
      handleFilterLink(el);
    });
  });

  // Highlight cards (new section)
  document.querySelectorAll('.hc-link[data-filter]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      applyFilter(a.dataset.filter);
      setTimeout(() => scrollToEl('#shop'), 80);
    });
  });

  // Desktop dropdown category links
  document.querySelectorAll('.dropdown-menu a[data-filter]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      applyFilter(a.dataset.filter);
      setTimeout(() => scrollToEl('#shop'), 50);
    });
  });

  // Footer category links
  document.querySelectorAll('.footer-col a[data-filter]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      applyFilter(a.dataset.filter);
      setTimeout(() => scrollToEl('#shop'), 50);
    });
  });

  // Category strip pills
  document.querySelectorAll('.cat-pill[data-filter]').forEach(pill => {
    pill.addEventListener('click', e => {
      e.preventDefault();
      const filter = pill.dataset.filter;
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      applyFilter(filter);
      setTimeout(() => scrollToEl('#shop'), 80);
    });
  });

  // Mobile menu category links
  document.querySelectorAll('.mobile-nav-item.cat-link[data-filter]').forEach(a => {
    a.addEventListener('click', () => {
      const filter = a.dataset.filter;
      if (filter) {
        applyFilter(filter);
        setTimeout(() => scrollToEl('#shop'), 100);
      }
    });
  });

  // Active nav link on scroll
  const sections    = document.querySelectorAll('section[id]');
  const allNavLinks = document.querySelectorAll('.nav-link');
  const sectionObs  = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        allNavLinks.forEach(l => l.classList.remove('active'));
        const a = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(s => sectionObs.observe(s));


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
  let cart = loadCart();

  function loadCart() {
    try { return JSON.parse(localStorage.getItem('edc_cart')) || []; }
    catch { return []; }
  }
  function saveCart() { localStorage.setItem('edc_cart', JSON.stringify(cart)); }
  function cartKey(id, size) { return `${id}__${size}`; }

  function addToCart(id, name, price, emoji, size) {
    const key = cartKey(id, size);
    const existing = cart.find(i => cartKey(i.id, i.size) === key);
    if (existing) { existing.qty += 1; }
    else { cart.push({ id, name, price: parseFloat(price), emoji, size, qty: 1 }); }
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

  const cartTotal = () => cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = () => cart.reduce((s, i) => s + i.qty, 0);
  const fmtPrice  = n => '€' + n.toFixed(2).replace('.', ',');

  function updateCartUI() {
    const badge  = document.getElementById('cartBadge');
    const body   = document.getElementById('cartBody');
    const footer = document.getElementById('cartFooter');
    const count  = cartCount();

    badge.textContent  = count;
    badge.style.display = count > 0 ? 'flex' : 'none';

    if (cart.length === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <span>🛍️</span>
          <p>Dein Warenkorb ist leer.</p>
          <p>Füge ein Produkt hinzu, um zu starten!</p>
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
              <span class="cart-item-size">Größe: ${item.size}</span>
              <div class="cart-item-qty">
                <button class="qty-btn" data-key="${key}" data-delta="-1">−</button>
                <span>${item.qty}</span>
                <button class="qty-btn" data-key="${key}" data-delta="1">+</button>
              </div>
            </div>
            <div class="cart-item-right">
              <span class="cart-item-price">${fmtPrice(item.price * item.qty)}</span>
              <button class="cart-remove" data-key="${key}" aria-label="Entfernen">🗑</button>
            </div>
          </div>`;
      }).join('');

      footer.style.display = 'block';
      document.getElementById('cartSubtotal').textContent = fmtPrice(cartTotal());

      body.querySelectorAll('.qty-btn').forEach(btn =>
        btn.addEventListener('click', () => changeQty(btn.dataset.key, +btn.dataset.delta))
      );
      body.querySelectorAll('.cart-remove').forEach(btn =>
        btn.addEventListener('click', () => removeFromCart(btn.dataset.key))
      );
    }
  }

  // Add to cart buttons
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const card  = btn.closest('.product-card');
      const size  = card.querySelector('.size-btn.active')?.dataset.size || '?';
      addToCart(card.dataset.id, card.dataset.name, card.dataset.price, card.dataset.emoji, size);
      const orig = btn.innerHTML;
      btn.innerHTML = '✓ Hinzugefügt!';
      btn.style.background = '#4CAF50';
      setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; }, 1500);
    });
  });

  // Cart drawer
  const cartDrawer  = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');

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

  document.getElementById('cartBtn').addEventListener('click', () =>
    cartDrawer.classList.contains('open') ? closeCart() : openCart()
  );
  document.getElementById('cartClose').addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);
  document.getElementById('checkoutBtn').addEventListener('click', () => { closeCart(); openCheckout(); });


  /* ============================================================
     CHECKOUT MODAL
  ============================================================ */
  const checkoutModal   = document.getElementById('checkoutModal');
  const checkoutOverlay = document.getElementById('checkoutOverlay');

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

  document.getElementById('checkoutClose').addEventListener('click', closeCheckout);
  checkoutOverlay.addEventListener('click', closeCheckout);

  function showStep(n) {
    [1, 2, 3].forEach(i => {
      document.getElementById(`step${i}`).style.display = i === n ? 'block' : 'none';
    });
    checkoutModal.scrollTop = 0;
    if (n === 2) renderOrderSummary();
  }

  document.getElementById('checkoutForm1').addEventListener('submit', e => { e.preventDefault(); showStep(2); });
  document.getElementById('backToStep1').addEventListener('click', () => showStep(1));

  document.querySelectorAll('input[name="payment"]').forEach(r => {
    r.addEventListener('change', () => {
      document.getElementById('idealBanks').style.display = r.value === 'ideal' ? 'block' : 'none';
    });
  });

  function renderOrderSummary() {
    document.getElementById('orderSummary').innerHTML =
      cart.map(item => `
        <div class="order-line">
          <span>${item.emoji} ${item.name} <small>(Gr. ${item.size})</small> × ${item.qty}</span>
          <span>${fmtPrice(item.price * item.qty)}</span>
        </div>`).join('') +
      `<div class="order-line order-shipping">
        <span>🚚 Versandkosten</span><span>€4,95</span>
      </div>`;
    document.getElementById('checkoutTotal').textContent = fmtPrice(cartTotal() + 4.95);
  }

  document.getElementById('payNowBtn').addEventListener('click', () => {
    const method = document.querySelector('input[name="payment"]:checked').value;
    const bank   = document.getElementById('bankSelect').value;
    if (method === 'ideal' && !bank) { alert('Bitte wähle deine Bank für iDEAL aus.'); return; }
    startPayment(method, bank);
  });

  async function startPayment(method, bank) {
    const btn = document.getElementById('payNowBtn');
    btn.innerHTML = '⏳ Einen Moment...';
    btn.disabled  = true;
    await new Promise(r => setTimeout(r, 1500));
    simulateSuccess(method);
  }

  function simulateSuccess(method) {
    const names = { ideal: 'iDEAL', creditcard: 'Kreditkarte', paypal: 'PayPal', klarna: 'Klarna' };
    document.getElementById('confirmDetails').innerHTML = `
      <div class="confirm-row"><span>Zahlungsart</span><strong>${names[method]}</strong></div>
      <div class="confirm-row"><span>Gesamtbetrag</span><strong>${fmtPrice(cartTotal() + 4.95)}</strong></div>
      <div class="confirm-row"><span>E-Mail</span><strong>${document.getElementById('chkEmail').value}</strong></div>
    `;
    cart = []; saveCart(); updateCartUI(); showStep(3);
  }

  document.getElementById('confirmDone').addEventListener('click', () => {
    closeCheckout();
    if (window.location.pathname.includes('kontakt')) {
      window.location.href = 'index.html';
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });


  /* ── Bewertungsformular ───────────────────────────────── */
  const starBtns      = document.querySelectorAll('.star-btn');
  const ratingInput   = document.getElementById('ratingValue');

  starBtns.forEach(btn => {
    btn.addEventListener('mouseenter', () => highlightStars(+btn.dataset.val));
    btn.addEventListener('mouseleave', () => highlightStars(+ratingInput.value));
    btn.addEventListener('click', () => { ratingInput.value = btn.dataset.val; highlightStars(+btn.dataset.val); });
  });
  function highlightStars(val) {
    starBtns.forEach(b => b.classList.toggle('active', +b.dataset.val <= val));
  }

  const reviewForm    = document.getElementById('reviewForm');
  const reviewSuccess = document.getElementById('reviewSuccess');
  reviewForm?.addEventListener('submit', e => {
    e.preventDefault();
    if (+ratingInput.value === 0) { alert('Bitte wähle eine Bewertung aus.'); return; }
    reviewForm.style.display = 'none';
    reviewSuccess.style.display = 'block';
    reviewSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  /* ── Kontaktformular – sendet direkt an Carolina ─────── */
  const contactForm    = document.getElementById('contactForm');
  const contactSuccess = document.getElementById('contactSuccess');
  contactForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const origText = btn.innerHTML;
    btn.innerHTML = '⏳ Wird gesendet...';
    btn.disabled = true;

    const data = {
      name:    document.getElementById('contactName').value,
      email:   document.getElementById('contactEmail').value,
      phone:   document.getElementById('contactPhone').value || 'Nicht angegeben',
      subject: document.getElementById('contactSubject').value || 'Sonstiges',
      message: document.getElementById('contactMsg').value,
      _subject: `Neue Nachricht – Estrellas de Colores`,
      _captcha: 'false',
    };

    try {
      const res = await fetch('https://formsubmit.co/ajax/estrellas-de-colores@outlook.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success === 'true' || json.success === true) {
        contactForm.style.display = 'none';
        contactSuccess.style.display = 'block';
        contactSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        btn.innerHTML = '❌ Fehler – bitte direkt mailen';
        btn.disabled = false;
      }
    } catch {
      btn.innerHTML = origText;
      btn.disabled = false;
      alert('Verbindungsfehler. Bitte schreib uns direkt an estrellas-de-colores@outlook.com');
    }
  });

  /* ── Newsletter ───────────────────────────────────────── */
  document.getElementById('newsletterForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.textContent = '✅ Angemeldet!';
    btn.disabled = true;
    e.target.querySelector('input').disabled = true;
  });

  /* ── Init ─────────────────────────────────────────────── */
  updateCartUI();

});
