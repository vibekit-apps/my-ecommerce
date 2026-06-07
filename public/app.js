const store = (() => {
  function money(cents) {
    return `$${(cents / 100).toFixed(2)}`;
  }

  async function api(path, opts = {}) {
    const res = await fetch(path, {
      method: opts.method || 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    let data = null;
    try { data = await res.json(); } catch (_) {}
    return { ok: res.ok, status: res.status, data };
  }

  async function refreshCartCount() {
    const el = document.getElementById('cart-count');
    if (!el) return;
    const { ok, data } = await api('/api/cart');
    el.textContent = ok && data ? data.itemCount : 0;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }

  function productCard(p) {
    return `
      <a class="product-card" href="/product.html?slug=${p.slug}">
        <div class="product-image" style="background-image: url('${esc(p.image)}')"></div>
        <div class="product-info">
          <div class="product-name">${esc(p.name)}</div>
          <div class="product-price">${money(p.price)}</div>
        </div>
      </a>`;
  }

  async function bindHome() {
    refreshCartCount();
    const grid = document.getElementById('product-grid');
    const cats = document.querySelectorAll('.cat');

    async function render(cat) {
      const url = cat ? `/api/products?category=${cat}` : '/api/products';
      const { data } = await api(url);
      grid.innerHTML = data.products.map(productCard).join('');
    }

    cats.forEach((btn) => {
      btn.addEventListener('click', () => {
        cats.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        render(btn.dataset.cat);
      });
    });

    render('');
  }

  async function bindProductPage() {
    refreshCartCount();
    const params = new URLSearchParams(location.search);
    const slug = params.get('slug');
    const page = document.getElementById('product-page');
    if (!slug) {
      page.innerHTML = '<p>No product specified.</p>';
      return;
    }
    const { ok, data } = await api(`/api/products/${slug}`);
    if (!ok) {
      page.innerHTML = '<p>Product not found.</p>';
      return;
    }
    const p = data.product;
    page.innerHTML = `
      <div class="product-detail">
        <div class="product-hero" style="background-image: url('${esc(p.image)}')"></div>
        <div class="product-meta">
          <div class="muted">${esc(p.category)}</div>
          <h1>${esc(p.name)}</h1>
          <div class="product-price lg">${money(p.price)}</div>
          <p>${esc(p.description)}</p>
          <button class="btn primary lg" id="add-btn">Add to cart</button>
          <div id="add-status" class="muted small" hidden></div>
        </div>
      </div>`;
    document.getElementById('add-btn').addEventListener('click', async () => {
      const { ok } = await api('/api/cart', { method: 'POST', body: { productId: p.id, quantity: 1 } });
      const status = document.getElementById('add-status');
      status.hidden = false;
      status.textContent = ok ? 'Added to cart.' : 'Something went wrong.';
      refreshCartCount();
    });
  }

  async function bindCartPage() {
    await renderCart();
  }

  async function renderCart() {
    refreshCartCount();
    const { data } = await api('/api/cart');
    const body = document.getElementById('cart-body');
    if (!data.items.length) {
      body.innerHTML = `
        <div class="empty-cart">
          <p>Your cart is empty.</p>
          <a class="btn primary" href="/">Start shopping</a>
        </div>`;
      return;
    }
    body.innerHTML = `
      <ul class="cart-items">
        ${data.items.map((i) => `
          <li class="cart-item">
            <div class="ci-image" style="background-image: url('${esc(i.product.image)}')"></div>
            <div class="ci-meta">
              <div class="ci-name">${esc(i.product.name)}</div>
              <div class="muted small">${money(i.product.price)} each</div>
            </div>
            <div class="ci-qty">
              <button data-delta="-1" data-id="${i.productId}">−</button>
              <span>${i.quantity}</span>
              <button data-delta="1" data-id="${i.productId}">+</button>
            </div>
            <div class="ci-total">${money(i.lineTotal)}</div>
            <button class="ci-remove" data-remove="${i.productId}">×</button>
          </li>
        `).join('')}
      </ul>
      <div class="cart-summary">
        <div>Subtotal <strong>${money(data.subtotal)}</strong></div>
        <button class="btn primary lg" id="checkout-btn">Checkout</button>
        <div id="checkout-status" class="status" hidden></div>
      </div>`;

    body.querySelectorAll('[data-delta]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const delta = parseInt(btn.dataset.delta, 10);
        const item = data.items.find((i) => i.productId === id);
        await api(`/api/cart/${id}`, { method: 'PATCH', body: { quantity: item.quantity + delta } });
        renderCart();
      });
    });
    body.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        await api(`/api/cart/${btn.dataset.remove}`, { method: 'DELETE' });
        renderCart();
      });
    });

    document.getElementById('checkout-btn').addEventListener('click', async () => {
      const btn = document.getElementById('checkout-btn');
      const status = document.getElementById('checkout-status');
      btn.disabled = true;
      const { ok, data: result } = await api('/api/checkout', { method: 'POST' });
      btn.disabled = false;
      if (!ok) {
        status.hidden = false;
        status.textContent = 'Checkout failed.';
        return;
      }
      if (result.configured && result.url) {
        window.location.href = result.url;
      } else {
        status.hidden = false;
        status.textContent = result.message || 'Stripe not configured yet.';
      }
    });
  }

  return { bindHome, bindProductPage, bindCartPage };
})();
