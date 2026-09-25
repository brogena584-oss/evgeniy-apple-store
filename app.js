const TELEGRAM_ORDER_URL = 'https://web.telegram.org/k/#-1071485171768';
const ADMIN_PASSWORD = 'tipNug-bazzux-fybma5';
const PRODUCTS_KEY = 'evgeniy-apple-products';
const CART_KEY = 'evgeniy-apple-cart';

const DEFAULT_PRODUCTS = [
  { id: 'iphone-16-pro', name: 'iPhone 16 Pro', category: 'Смартфоны', price: 3890, meta: '256 GB · Black Titanium', tag: 'Хит', image: './assets/iphone-black.jpg', description: 'Флагман с титановым корпусом, камерой Pro и запасом мощности на каждый день.' },
  { id: 'iphone-16-air', name: 'iPhone Air', category: 'Смартфоны', price: 2990, meta: '256 GB · Natural Titanium', tag: 'Новинка', image: './assets/iphone-silver.jpg', description: 'Лёгкий корпус, яркий дисплей и всё необходимое для быстрой современной жизни.' },
  { id: 'iphone-15-pro', name: 'iPhone 15 Pro', category: 'Смартфоны', price: 2890, meta: '256 GB · Deep Burgundy', tag: 'В наличии', image: './assets/iphone-burgundy.jpg', description: 'Проверенный Pro-флагман с выразительным цветом и камерой, которая всегда готова.' },
  { id: 'macbook-air', name: 'MacBook Air', category: 'Ноутбуки', price: 4290, meta: 'M3 · 16 / 512 GB', tag: 'Хит', image: './assets/iphone-side.jpg', description: 'Тихий, лёгкий и быстрый ноутбук для работы, творчества и свободного графика.' },
  { id: 'airpods-pro', name: 'AirPods Pro', category: 'Аксессуары', price: 890, meta: 'USB-C · 2nd gen', tag: 'Новинка', image: './assets/iphone-side.jpg', description: 'Чистый звук и активное шумоподавление в компактном кейсе.' },
  { id: 'watch-ultra', name: 'Apple Watch Ultra', category: 'Аксессуары', price: 2390, meta: 'Titanium · GPS + Cellular', tag: 'В наличии', image: './assets/iphone-black.jpg', description: 'Надёжный помощник для спорта, путешествий и насыщенных дней.' }
];

let products = load(PRODUCTS_KEY, DEFAULT_PRODUCTS);
let cart = load(CART_KEY, []);
let activeFilter = 'all';
let toastTimer;

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function money(value) { return new Intl.NumberFormat('ru-RU').format(value) + ' BYN'; }
function byId(id) { return document.getElementById(id); }
function showToast(message) {
  const toast = byId('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3600);
}

function renderProducts() {
  const grid = byId('products-grid');
  const visible = activeFilter === 'all' ? products : products.filter(item => item.category === activeFilter);
  grid.innerHTML = visible.map((item, index) => `
    <article class="product-card tilt reveal visible" data-id="${item.id}" style="transition-delay:${index * 70}ms">
      <div>
        <div class="product-card-media">
          <img src="${item.image}" alt="${item.name}" />
          <span class="product-tag">${item.tag || 'В наличии'}</span>
        </div>
        <div class="product-info">
          <div class="product-category">${item.category}</div>
          <h3 class="product-name">${item.name}</h3>
          <div class="product-meta">${item.meta || 'Оригинальная техника'}</div>
        </div>
      </div>
      <div class="product-bottom">
        <strong class="product-price">${money(item.price)}</strong>
        <button class="buy-button" data-buy="${item.id}">В корзину +</button>
      </div>
    </article>`).join('');
  grid.querySelectorAll('[data-buy]').forEach(button => button.addEventListener('click', () => addToCart(button.dataset.buy)));
  grid.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', event => {
      if (!event.target.closest('[data-buy]')) openProduct(card.dataset.id);
    });
    addTilt(card);
  });
}

function addToCart(id) {
  const item = products.find(product => product.id === id);
  if (!item) return;
  const found = cart.find(row => row.id === id);
  found ? found.qty++ : cart.push({ id, qty: 1 });
  save(CART_KEY, cart);
  renderCart();
  openCart();
  showToast(`${item.name} добавлен в корзину`);
}
function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  byId('cart-count').textContent = count;
  const items = cart.map(row => ({ ...row, product: products.find(item => item.id === row.id) })).filter(row => row.product);
  byId('cart-items').innerHTML = items.map(row => `
    <div class="cart-item">
      <img src="${row.product.image}" alt="${row.product.name}" />
      <div><h4>${row.product.name}</h4><small>${row.qty} × ${money(row.product.price)}</small></div>
      <div><strong>${money(row.product.price * row.qty)}</strong><button class="remove-item" data-remove="${row.id}" aria-label="Удалить">×</button></div>
    </div>`).join('');
  byId('cart-empty').style.display = items.length ? 'none' : 'flex';
  byId('cart-items').style.display = items.length ? 'block' : 'none';
  byId('cart-total').textContent = money(items.reduce((sum, row) => sum + row.product.price * row.qty, 0));
  byId('cart-items').querySelectorAll('[data-remove]').forEach(button => button.addEventListener('click', () => {
    cart = cart.filter(row => row.id !== button.dataset.remove);
    save(CART_KEY, cart);
    renderCart();
  }));
}
function openCart() { byId('cart-drawer').classList.add('open'); byId('drawer-backdrop').classList.add('open'); }
function closeCart() { byId('cart-drawer').classList.remove('open'); byId('drawer-backdrop').classList.remove('open'); }

function openProduct(id) {
  const item = products.find(product => product.id === id);
  if (!item) return;
  byId('product-modal-content').innerHTML = `
    <button class="close-button modal-close">×</button>
    <div class="eyebrow">${item.category} / ${item.tag || 'EA SELECTION'}</div>
    <h3>${item.name}</h3>
    <div class="modal-product"><img src="${item.image}" alt="${item.name}" /><div><p>${item.description || 'Оригинальная техника с проверкой перед покупкой и поддержкой после.'}</p><strong>${money(item.price)}</strong></div></div>
    <button class="button full modal-buy" data-buy="${item.id}" style="margin-top:25px">Добавить в корзину <span>+</span></button>`;
  byId('product-modal').classList.add('open');
  byId('product-modal-content').querySelector('.modal-close').addEventListener('click', () => byId('product-modal').classList.remove('open'));
  byId('product-modal-content').querySelector('.modal-buy').addEventListener('click', () => {
    addToCart(item.id);
    byId('product-modal').classList.remove('open');
  });
}

function checkout() {
  if (!cart.length) return showToast('Сначала добавьте товар в корзину');
  const lines = cart.map(row => {
    const item = products.find(product => product.id === row.id);
    return `— ${item.name} × ${row.qty} (${money(item.price * row.qty)})`;
  });
  const total = cart.reduce((sum, row) => sum + (products.find(item => item.id === row.id)?.price || 0) * row.qty, 0);
  const order = `Здравствуйте! Хочу оформить заказ в Evgeniy Apple.\n\n${lines.join('\n')}\n\nИтого: ${money(total)}\n\nИмя: \nТелефон: \nСпособ получения: `;
  navigator.clipboard?.writeText(order).then(() => showToast('Текст заказа скопирован — вставьте его в Telegram')).catch(() => showToast('Telegram открыт. Скопируйте состав заказа вручную.'));
  window.open(TELEGRAM_ORDER_URL, '_blank', 'noopener,noreferrer');
}

function addTilt(element) {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  element.addEventListener('pointermove', event => {
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    element.style.transform = `perspective(900px) rotateX(${y * -5}deg) rotateY(${x * 5}deg) translateY(-5px)`;
  });
  element.addEventListener('pointerleave', () => { element.style.transform = ''; });
}

function renderAdminProducts() {
  byId('admin-products').innerHTML = products.map(item => `
    <div class="admin-row">
      <img src="${item.image}" alt="" />
      <div><h4>${item.name}</h4><small>${item.category} · ${item.meta || '—'}</small></div>
      <strong>${money(item.price)}</strong>
      <small>${item.image}</small>
      <div class="admin-row-actions"><button data-edit="${item.id}">Изменить</button><button data-delete="${item.id}">Удалить</button></div>
    </div>`).join('');
  byId('admin-products').querySelectorAll('[data-edit]').forEach(button => button.addEventListener('click', () => editAdminProduct(button.dataset.edit)));
  byId('admin-products').querySelectorAll('[data-delete]').forEach(button => button.addEventListener('click', () => {
    if (!confirm('Удалить этот товар из каталога?')) return;
    products = products.filter(item => item.id !== button.dataset.delete);
    save(PRODUCTS_KEY, products); renderAdminProducts(); renderProducts(); showToast('Товар удалён');
  }));
}
function editAdminProduct(id) {
  const item = products.find(product => product.id === id);
  if (!item) return;
  byId('admin-product-id').value = item.id;
  byId('admin-product-name').value = item.name;
  byId('admin-product-category').value = item.category;
  byId('admin-product-price').value = item.price;
  byId('admin-product-image').value = item.image;
  byId('admin-save-product').innerHTML = 'Сохранить изменения <span>✓</span>';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function renderAdmin() {
  const logged = sessionStorage.getItem('evgeniy-admin') === 'true';
  byId('admin-login').hidden = logged;
  byId('admin-dashboard').hidden = !logged;
  if (logged) renderAdminProducts();
}
function route() {
  const isAdmin = location.hash === '#admin';
  byId('admin-view').hidden = !isAdmin;
  if (isAdmin) renderAdmin();
}

document.addEventListener('DOMContentLoaded', () => {
  renderProducts(); renderCart(); route();
  const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('visible')), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  window.addEventListener('scroll', () => {
    byId('site-header').classList.toggle('scrolled', window.scrollY > 30);
    document.querySelectorAll('.parallax').forEach(element => {
      const rect = element.getBoundingClientRect();
      const shift = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * Number(element.dataset.depth || .1);
      element.style.setProperty('--scroll-shift', `${shift}px`);
    });
  }, { passive: true });
  byId('cart-trigger').addEventListener('click', openCart);
  byId('cart-close').addEventListener('click', closeCart);
  byId('drawer-backdrop').addEventListener('click', closeCart);
  byId('checkout-button').addEventListener('click', checkout);
  byId('menu-trigger').addEventListener('click', () => byId('mobile-menu').classList.toggle('open'));
  document.querySelectorAll('.mobile-menu a').forEach(link => link.addEventListener('click', () => byId('mobile-menu').classList.remove('open')));
  document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll('.filter').forEach(item => item.classList.toggle('active', item === button));
    renderProducts();
  }));
  byId('trade-open').addEventListener('click', () => byId('trade-modal').classList.add('open'));
  document.querySelectorAll('.modal').forEach(modal => modal.addEventListener('click', event => { if (event.target === modal) modal.classList.remove('open'); }));
  document.querySelectorAll('.modal-close').forEach(button => button.addEventListener('click', () => button.closest('.modal').classList.remove('open')));
  function updateTrade() {
    const base = Number(byId('trade-price').value) || 0;
    const condition = Number(byId('trade-condition').value);
    byId('trade-result').textContent = money(Math.round(base * .5 * condition));
  }
  byId('trade-price').addEventListener('input', updateTrade); byId('trade-condition').addEventListener('change', updateTrade);
  byId('admin-login-form').addEventListener('submit', event => {
    event.preventDefault();
    if (byId('admin-password').value === ADMIN_PASSWORD) { sessionStorage.setItem('evgeniy-admin', 'true'); byId('admin-error').textContent = ''; renderAdmin(); }
    else byId('admin-error').textContent = 'Неверный пароль. Попробуйте ещё раз.';
  });
  byId('admin-logout').addEventListener('click', () => { sessionStorage.removeItem('evgeniy-admin'); renderAdmin(); });
  byId('admin-product-form').addEventListener('submit', event => {
    event.preventDefault();
    const id = byId('admin-product-id').value || `product-${Date.now()}`;
    const next = { id, name: byId('admin-product-name').value, category: byId('admin-product-category').value, price: Number(byId('admin-product-price').value), image: byId('admin-product-image').value, meta: 'Оригинальная техника', tag: 'В наличии', description: 'Товар из каталога Evgeniy Apple.' };
    const existing = products.findIndex(item => item.id === id);
    existing >= 0 ? products[existing] = { ...products[existing], ...next } : products.push(next);
    save(PRODUCTS_KEY, products); renderAdminProducts(); renderProducts(); event.target.reset(); byId('admin-product-id').value = ''; byId('admin-save-product').innerHTML = 'Добавить товар <span>+</span>'; showToast('Каталог обновлён');
  });
});
window.addEventListener('hashchange', route);