const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const assetByKind = {
  mystery: './assets/images/Images-1.png',
  coupon: './assets/images/Images-2.png',
  item: './assets/images/Image-1.png',
};

// Load state from localStorage
function loadState() {
  try {
    const saved = localStorage.getItem('lastbite-state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        favorites: new Set(parsed.favorites || []),
        subscriptions: new Set(parsed.subscriptions || []),
      };
    }
  } catch (_) {}
  return null;
}

function saveState() {
  try {
    const toSave = {
      ...state,
      favorites: Array.from(state.favorites),
      subscriptions: Array.from(state.subscriptions),
      cart: Array.from(state.cart),
    };
    localStorage.setItem('lastbite-state', JSON.stringify(toSave));
  } catch (_) {}
}

const state = loadState() || {
  view: 'consumer',
  activeDealsTab: 'available', // 'available' | 'soon'
  favorites: new Set(), // vendorId strings
  subscriptions: new Set(), // vendorId strings
  cart: [], // [{ vendorId, title, price, qty, entry }]
  searchQuery: '',
  sortBy: 'distance', // 'distance' | 'price' | 'discount' | 'name'
  priceRange: { min: 0, max: 100 },
  darkMode: false,
  vendor: {
    id: 'self',
    name: 'Maple & Crust Bakery',
    closesAt: '18:00',
    saleWindowHours: 2,
    openForDeals: true,
    metric: 'item', // 'item' | 'weight'
    lastHourActive: false,
    inventory: [
      { id: 'm1', type: 'mystery', size: 'small', title: 'Mystery Pack (Small)', price: 6, original: 12, qty: 5, distanceKm: 1.2 },
      { id: 'c1', type: 'coupon', discountPercent: 50, title: '10 x 50% Coupons', price: 15, original: 30, qty: 10, distanceKm: 1.2 },
    ],
    metrics: { revenue: 0, sold: 0, wasteKg: 0 },
  },
  consumersNearby: [
    { id: 'v1', vendor: 'Urban Grain Bakehouse', distanceKm: 2.1, openForDeals: true, offers: [
      { kind: 'mystery', title: 'Mystery Box', price: 7, original: 15, qty: 5 },
      { kind: 'coupon', title: '6 x 50% Coupons', price: 10, original: 20, qty: 6 }
    ] },
    { id: 'v2', vendor: 'Golden Crumb Boulangerie', distanceKm: 4.6, openForDeals: false, offers: [
      { kind: 'mystery', title: 'Evening Surprise Box', price: 8, original: 16, qty: 3 },
      { kind: 'coupon', title: '10 x 40% Coupons', price: 14, original: 28, qty: 10 }
    ] },
    { id: 'v3', vendor: 'Riverside Bagels', distanceKm: 3.2, openForDeals: true, offers: [
      { kind: 'coupon', title: '12 x 30% Coupons', price: 12, original: 24, qty: 12 }
    ] },
    { id: 'v4', vendor: 'Seaside Sourdough', distanceKm: 6.8, openForDeals: false, offers: [
      { kind: 'mystery', title: 'Sourdough Sampler', price: 5, original: 12, qty: 4 }
    ] },
    { id: 'v5', vendor: 'Cedar Grove Pastry Co.', distanceKm: 1.4, openForDeals: true, offers: [
      { kind: 'mystery', title: 'Morning-Leftovers Box', price: 6, original: 13, qty: 6 }
    ] },
    { id: 'v6', vendor: 'Little Finch Cafe', distanceKm: 2.9, openForDeals: true, offers: [
      { kind: 'coupon', title: '8 x 50% Coupons', price: 12, original: 24, qty: 8 }
    ] },
    { id: 'v7', vendor: 'Harvest Hearth Deli', distanceKm: 5.3, openForDeals: false, offers: [
      { kind: 'coupon', title: '5 x 60% Coupons', price: 11, original: 22, qty: 5 }
    ] },
  ],
};

function formatPrice(v) { return `$${v.toFixed(2).replace(/\.00$/, '')}`; }

// Apply dark mode
function applyDarkMode(enabled) {
  state.darkMode = enabled;
  document.documentElement.classList.toggle('dark-mode', enabled);
  saveState();
}

// Initialize dark mode from state
if (state.darkMode) applyDarkMode(true);

function setView(next) {
  state.view = next;
  const consumer = $('#consumer-view');
  const vendor = $('#vendor-view');
  const btnC = $('#btn-consumer');
  const btnV = $('#btn-vendor');
  const isConsumer = next === 'consumer';

  consumer.classList.toggle('hidden', !isConsumer);
  vendor.classList.toggle('hidden', isConsumer);
  btnC.classList.toggle('active', isConsumer);
  btnV.classList.toggle('active', !isConsumer);
  btnC.setAttribute('aria-selected', String(isConsumer));
  btnV.setAttribute('aria-selected', String(!isConsumer));

  if (isConsumer) renderDeals(); else renderVendor();
}

function renderDeals() {
  const available = $('#deals-available');
  const soon = $('#deals-soon');
  available.setAttribute('aria-busy', 'true');
  soon.setAttribute('aria-busy', 'true');

  const showMystery = $('#filter-mystery').checked;
  const showItems = $('#filter-items').checked; // includes coupons
  const maxKm = Number($('#filter-distance').value);
  const searchQuery = (state.searchQuery || '').toLowerCase();
  const minPrice = state.priceRange?.min || 0;
  const maxPrice = state.priceRange?.max || 100;

  const vendorSelf = {
    id: state.vendor.id,
    name: state.vendor.name,
    distanceKm: 1.2,
    openForDeals: state.vendor.openForDeals,
    entries: state.vendor.inventory
      .filter(i => (i.type === 'mystery' ? showMystery : showItems))
      .filter(i => 1.2 <= maxKm)
      .map(i => ({ kind: i.type, title: i.title, price: i.price, original: i.original, qty: i.qty, img: assetByKind[i.type] })),
  };

  const blocks = [vendorSelf, ...state.consumersNearby.map(v => ({
    id: v.id,
    name: v.vendor,
    distanceKm: v.distanceKm,
    openForDeals: v.openForDeals,
    entries: v.offers
      .filter(o => (o.kind === 'mystery' ? showMystery : showItems))
      .filter(() => v.distanceKm <= maxKm)
      .map(o => ({ ...o, img: assetByKind[o.kind], vendorId: v.id }))
  }))].map(block => ({
    ...block,
    entries: block.entries
      .filter(e => {
        const matchesSearch = !searchQuery || 
          e.title.toLowerCase().includes(searchQuery) ||
          block.name.toLowerCase().includes(searchQuery);
        const matchesPrice = e.price >= minPrice && e.price <= maxPrice;
        return matchesSearch && matchesPrice;
      })
  }));

  // Sort entries based on sortBy
  blocks.forEach(block => {
    block.entries.sort((a, b) => {
      switch (state.sortBy) {
        case 'price':
          return a.price - b.price;
        case 'discount':
          const pctA = Math.round((1 - a.price / (a.original || (a.price*2))) * 100);
          const pctB = Math.round((1 - b.price / (b.original || (b.price*2))) * 100);
          return pctB - pctA;
        case 'name':
          return a.title.localeCompare(b.title);
        case 'distance':
        default:
          return block.distanceKm - block.distanceKm;
      }
    });
  });

  const [availableBlocks, comingBlocks] = [
    blocks.filter(b => b.openForDeals && b.entries.length),
    blocks.filter(b => !b.openForDeals && b.entries.length),
  ];

  function renderCards(list) {
    if (list.length === 0) {
      return '<div class="empty-state"><p>No deals found. Try adjusting your filters or search query.</p></div>';
    }
    return list.flatMap(block => block.entries.map(entry => {
      const pct = Math.round((1 - entry.price / (entry.original || (entry.price*2))) * 100);
      const fav = state.favorites.has(block.id) ? 'active' : '';
      const sub = state.subscriptions.has(block.id) ? 'active' : '';
      const kindLabel = entry.kind === 'mystery' ? 'Mystery Box' : (entry.kind === 'coupon' ? 'Coupon Pack' : 'Discounted Item');
      const cartQty = state.cart.filter(c => c.title === entry.title && c.vendorId === block.id).length;
      return `
        <article class="deal-card fade-in" data-vendor-id="${block.id}" data-entry-id="${entry.kind}-${block.id}">
          ${entry.img ? `<img class="deal-img" src="${entry.img}" alt="">` : ''}
          <div class="card-top">
            <h4>${block.name}</h4>
            <div>
              <button class="icon-btn heart ${fav}" title="Favorite" data-action="fav">❤</button>
              <button class="icon-btn sub ${sub}" title="Subscribe" data-action="sub">🔔</button>
            </div>
          </div>
          <div class="deal-meta">
            <span class="chip">${block.distanceKm.toFixed(1)} km</span>
            <span class="chip alt">${kindLabel}</span>
            <span class="chip">${pct}% off</span>
            <span class="chip">${entry.qty} left</span>
          </div>
          <div>
            <span class="price">${formatPrice(entry.price)}</span>
            ${entry.original ? `<span class="strike">${formatPrice(entry.original)}</span>` : ''}
          </div>
          <div style="margin-top:10px; display:flex; gap:8px;">
            <button class="primary" data-action="view-details" data-title="${entry.title}" data-price="${entry.price}" data-original="${entry.original || ''}" data-kind="${entry.kind}" data-vendor="${block.name}">View Details</button>
            <button class="secondary" data-action="share" data-title="${entry.title}">Share</button>
          </div>
        </article>`;
    })).join('');
  }

  available.innerHTML = renderCards(availableBlocks);
  soon.innerHTML = renderCards(comingBlocks).replaceAll('class="primary"', 'class="secondary" disabled');

  available.setAttribute('aria-busy', 'false');
  soon.setAttribute('aria-busy', 'false');

  // Toggle tab visibility
  $('#deals-available').classList.toggle('hidden', state.activeDealsTab !== 'available');
  $('#deals-soon').classList.toggle('hidden', state.activeDealsTab !== 'soon');
}

function renderVendor() {
  $('#vendor-name').textContent = state.vendor.name;
  $('#close-time').textContent = state.vendor.closesAt;
  $('#toggle-last-hour').checked = state.vendor.lastHourActive;
  $('#input-close').value = state.vendor.closesAt;
  $('#input-window').value = String(state.vendor.saleWindowHours);
  $('#toggle-open').checked = state.vendor.openForDeals;
  $('#metric-select').value = state.vendor.metric;

  const list = $('#inventory-list');
  list.innerHTML = state.vendor.inventory.map(item => {
    const typeLabel = item.type === 'mystery' ? 'Mystery Pack' : (item.type === 'coupon' ? 'Coupon Pack' : 'Discounted Item');
    const discountInfo = item.discountPercent ? ` • ${item.discountPercent}% off` : '';
    return `
    <li class="item">
      <div>
        <div style="font-weight:600;">${item.title}</div>
        <div class="muted">${typeLabel}${discountInfo} • ${item.qty} ${item.type === 'coupon' ? 'remaining' : 'left'}</div>
      </div>
      <div class="actions">
        <span class="price">${formatPrice(item.price)}</span>
        ${item.original ? `<span class="strike">${formatPrice(item.original)}</span>` : ''}
        <button class="secondary" data-action="sell-one" data-id="${item.id}">Sell 1</button>
        <button class="secondary" data-action="restock" data-id="${item.id}">+5</button>
        <button class="secondary" data-action="delete" data-id="${item.id}">Remove</button>
      </div>
    </li>
  `;
  }).join('');

  $('#m-revenue').textContent = formatPrice(state.vendor.metrics.revenue);
  $('#m-sold').textContent = String(state.vendor.metrics.sold);
  $('#m-waste').textContent = (state.vendor.metrics.wasteKg).toFixed(1);
  
  // Update cart badge
  updateCartBadge();
}

function updateCartBadge() {
  const badge = $('#cart-badge');
  const count = state.cart.length;
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'block' : 'none';
  }
}

function renderCartModal() {
  if (!state.cart.length) {
    $('#cart-modal')?.classList.add('hidden');
    return;
  }
  const modal = $('#cart-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  const items = state.cart.reduce((acc, item) => {
    const key = `${item.vendorId}-${item.title}`;
    if (!acc[key]) acc[key] = { ...item, count: 0 };
    acc[key].count++;
    return acc;
  }, {});
  
  const total = Object.values(items).reduce((sum, item) => sum + (item.price * item.count), 0);
  
  $('#cart-items').innerHTML = Object.values(items).map(item => `
    <div class="cart-item">
      <div>
        <div style="font-weight:600;">${item.title}</div>
        <div class="muted">${item.vendorName}</div>
      </div>
      <div class="cart-item-actions">
        <div class="qty-controls">
          <button class="qty-btn" data-action="dec-cart" data-key="${item.vendorId}-${item.title}">−</button>
          <span>${item.count}</span>
          <button class="qty-btn" data-action="inc-cart" data-key="${item.vendorId}-${item.title}">+</button>
        </div>
        <span class="price">${formatPrice(item.price * item.count)}</span>
        <button class="icon-btn" data-action="remove-cart" data-key="${item.vendorId}-${item.title}">🗑️</button>
      </div>
    </div>
  `).join('');
  $('#cart-total').textContent = formatPrice(total);
}

function showItemModal(entry) {
  const modal = $('#item-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  const pct = Math.round((1 - entry.price / (entry.original || (entry.price*2))) * 100);
  $('#modal-title').textContent = entry.title;
  $('#modal-vendor').textContent = entry.vendor;
  $('#modal-price').textContent = formatPrice(entry.price);
  $('#modal-original').textContent = entry.original ? formatPrice(entry.original) : '';
  $('#modal-discount').textContent = `${pct}% off`;
  $('#modal-qty').textContent = entry.qty || 'Limited';
  $('#modal-kind').textContent = entry.kind === 'mystery' ? 'Mystery Box' : (entry.kind === 'coupon' ? 'Coupon Pack' : 'Discounted Item');
  $('#modal-img').src = entry.img || './assets/images/Image-1.png';
  
  // Store current entry for add to cart
  modal.dataset.entry = JSON.stringify(entry);
}

function bindEvents() {
  $('#btn-consumer').addEventListener('click', () => setView('consumer'));
  $('#btn-vendor').addEventListener('click', () => setView('vendor'));
  // CTA buttons
  const scrollToDeals = () => {
    setView('consumer');
    state.activeDealsTab = 'available';
    renderDeals();
    document.getElementById('deals-available')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  $('#cta-explore')?.addEventListener('click', scrollToDeals);
  $('#cta-favorites')?.addEventListener('click', () => {
    setView('consumer');
    state.activeDealsTab = 'available';
    renderDeals();
    document.getElementById('deals-available')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  $('#filter-mystery').addEventListener('change', renderDeals);
  $('#filter-items').addEventListener('change', renderDeals);
  $('#filter-distance').addEventListener('change', renderDeals);
  
  // Search functionality
  const searchInput = $('#search-deals');
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        state.searchQuery = e.target.value;
        saveState();
        renderDeals();
      }, 300);
    });
  }
  
  // Sort functionality
  const sortSelect = $('#sort-deals');
  if (sortSelect) {
    sortSelect.value = state.sortBy || 'distance';
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      saveState();
      renderDeals();
    });
  }
  
  // Price range filter
  const minPriceInput = $('#filter-price-min');
  const maxPriceInput = $('#filter-price-max');
  if (minPriceInput && maxPriceInput) {
    minPriceInput.value = state.priceRange?.min || 0;
    maxPriceInput.value = state.priceRange?.max || 100;
    const updatePriceRange = () => {
      state.priceRange = {
        min: Number(minPriceInput.value) || 0,
        max: Number(maxPriceInput.value) || 100,
      };
      saveState();
      renderDeals();
    };
    minPriceInput.addEventListener('change', updatePriceRange);
    maxPriceInput.addEventListener('change', updatePriceRange);
  }
  
  // Dark mode toggle
  const darkModeToggle = $('#dark-mode-toggle');
  if (darkModeToggle) {
    darkModeToggle.checked = state.darkMode || false;
    darkModeToggle.addEventListener('change', (e) => {
      applyDarkMode(e.target.checked);
    });
  }
  
  // Cart modal events
  $('#cart-btn')?.addEventListener('click', () => {
    $('#cart-modal')?.classList.toggle('hidden');
    renderCartModal();
  });
  
  $('#close-cart')?.addEventListener('click', () => {
    $('#cart-modal')?.classList.add('hidden');
  });
  
  $('#close-item-modal')?.addEventListener('click', () => {
    $('#item-modal')?.classList.add('hidden');
  });
  
  $('#cart-items')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const key = btn.getAttribute('data-key');
    const [vendorId, ...titleParts] = key.split('-');
    const title = titleParts.join('-');
    
    if (action === 'remove-cart') {
      state.cart = state.cart.filter(c => !(c.vendorId === vendorId && c.title === title));
      saveState();
      renderCartModal();
      updateCartBadge();
    } else if (action === 'dec-cart') {
      const idx = state.cart.findIndex(c => c.vendorId === vendorId && c.title === title);
      if (idx >= 0) state.cart.splice(idx, 1);
      saveState();
      renderCartModal();
      updateCartBadge();
    } else if (action === 'inc-cart') {
      const first = state.cart.find(c => c.vendorId === vendorId && c.title === title);
      if (first) state.cart.push(first);
      saveState();
      renderCartModal();
      updateCartBadge();
    }
  });
  
  $('#checkout-btn')?.addEventListener('click', () => {
    if (state.cart.length === 0) return;
    const total = state.cart.reduce((sum, item) => sum + item.price, 0);
    alert(`Demo checkout: ${state.cart.length} items for ${formatPrice(total)}`);
    state.cart = [];
    saveState();
    renderCartModal();
    updateCartBadge();
    $('#cart-modal')?.classList.add('hidden');
  });
  
  $('#add-to-cart-btn')?.addEventListener('click', () => {
    const modal = $('#item-modal');
    if (!modal || !modal.dataset.entry) return;
    const entry = JSON.parse(modal.dataset.entry);
    state.cart.push(entry);
    saveState();
    updateCartBadge();
    alert(`${entry.title} added to cart!`);
  });

  // Consumer inner tabs
  $('#tab-available').addEventListener('click', () => {
    state.activeDealsTab = 'available';
    $('#tab-available').classList.add('active');
    $('#tab-available').setAttribute('aria-selected', 'true');
    $('#tab-soon').classList.remove('active');
    $('#tab-soon').setAttribute('aria-selected', 'false');
    renderDeals();
  });
  $('#tab-soon').addEventListener('click', () => {
    state.activeDealsTab = 'soon';
    $('#tab-soon').classList.add('active');
    $('#tab-soon').setAttribute('aria-selected', 'true');
    $('#tab-available').classList.remove('active');
    $('#tab-available').setAttribute('aria-selected', 'false');
    renderDeals();
  });

  $('#create-mystery').addEventListener('click', () => {
    const id = 'm' + Math.random().toString(36).slice(2, 8);
    const size = $('#mystery-size').value;
    const price = Number($('#mystery-price').value || 6);
    const qty = Number($('#mystery-qty').value || 5);
    const title = `Mystery Pack (${size.charAt(0).toUpperCase()+size.slice(1)})`;
    const original = price * 2; // demo anchor
    state.vendor.inventory.unshift({ id, type: 'mystery', size, title, price, original, qty, distanceKm: 1.2 });
    renderVendor();
    if (state.view === 'consumer') renderDeals();
  });

  $('#sell-coupons').addEventListener('click', () => {
    const id = 'c' + Math.random().toString(36).slice(2, 8);
    const count = Math.max(1, Number($('#coupon-count').value || 10));
    const discountPercent = Math.min(90, Math.max(10, Number($('#coupon-discount').value || 50)));
    const price = Math.max(1, Number($('#coupon-price').value || 15));
    const title = `${count} x ${discountPercent}% Coupons`;
    state.vendor.inventory.unshift({ id, type: 'coupon', discountPercent, title, price, original: null, qty: count, distanceKm: 1.2 });
    renderVendor();
    if (state.view === 'consumer') renderDeals();
  });

  $('#add-discount-item').addEventListener('click', () => {
    const id = 'i' + Math.random().toString(36).slice(2, 8);
    const name = $('#item-name').value.trim() || 'Discounted Item';
    const originalPrice = Number($('#item-original-price').value || 5);
    const discountPct = Math.min(90, Math.max(10, Number($('#item-discount-pct').value || 50)));
    const qty = Math.max(1, Number($('#item-qty').value || 3));
    const discountedPrice = originalPrice * (1 - discountPct / 100);
    const title = `${name} (${discountPct}% off)`;
    state.vendor.inventory.unshift({ 
      id, 
      type: 'item', 
      title, 
      price: discountedPrice, 
      original: originalPrice, 
      discountPercent: discountPct,
      qty, 
      distanceKm: 1.2 
    });
    // Clear form
    $('#item-name').value = '';
    $('#item-original-price').value = 5;
    $('#item-discount-pct').value = 50;
    $('#item-qty').value = 3;
    renderVendor();
    if (state.view === 'consumer') renderDeals();
  });

  $('#inventory-list').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const action = btn.getAttribute('data-action');
    const item = state.vendor.inventory.find(x => x.id === id);
    if (!item) return;
    if (action === 'sell-one' && item.qty > 0) {
      item.qty -= 1;
      state.vendor.metrics.sold += 1;
      state.vendor.metrics.revenue += item.price;
      state.vendor.metrics.wasteKg = Math.max(0, state.vendor.metrics.wasteKg - 0.05);
    }
    if (action === 'restock') item.qty += 5;
    if (action === 'delete') state.vendor.inventory = state.vendor.inventory.filter(x => x.id !== id);
    renderVendor();
  });

  $('#toggle-last-hour').addEventListener('change', (e) => {
    state.vendor.lastHourActive = e.target.checked;
    if (state.vendor.lastHourActive) maybeNotify('Last-hour deals are LIVE!');
  });

  $('#toggle-open').addEventListener('change', (e) => {
    state.vendor.openForDeals = e.target.checked;
    if (state.view === 'consumer') renderDeals();
  });
  $('#input-close').addEventListener('change', (e) => {
    state.vendor.closesAt = e.target.value;
    $('#close-time').textContent = state.vendor.closesAt;
  });
  $('#input-window').addEventListener('change', (e) => {
    state.vendor.saleWindowHours = Number(e.target.value || 2);
  });
  $('#metric-select').addEventListener('change', (e) => {
    state.vendor.metric = e.target.value;
  });

  // Delegated actions on consumer cards (both tabs)
  const onDealsClick = async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const card = e.target.closest('.deal-card');
    const vendorId = card?.getAttribute('data-vendor-id');
    const entryId = card?.getAttribute('data-entry-id');
    
    if (action === 'view-details') {
      const title = btn.getAttribute('data-title');
      const price = Number(btn.getAttribute('data-price'));
      const original = btn.getAttribute('data-original') ? Number(btn.getAttribute('data-original')) : null;
      const kind = btn.getAttribute('data-kind');
      const vendor = btn.getAttribute('data-vendor');
      const img = assetByKind[kind] || './assets/images/Image-1.png';
      
      // Find full entry details
      const blocks = [{
        id: state.vendor.id,
        name: state.vendor.name,
        entries: state.vendor.inventory.map(i => ({ ...i, kind: i.type, img: assetByKind[i.type], vendorId: state.vendor.id }))
      }, ...state.consumersNearby.map(v => ({
        id: v.id,
        name: v.vendor,
        entries: v.offers.map(o => ({ ...o, img: assetByKind[o.kind], vendorId: v.id }))
      }))];
      
      const entry = blocks.flatMap(b => b.entries).find(e => e.title === title && e.vendorId === vendorId);
      
      if (entry) {
        showItemModal({
          ...entry,
          vendor: vendor || blocks.find(b => b.id === vendorId)?.name || 'Unknown',
          vendorId,
        });
      }
    }
    
    if (action === 'share') {
      const title = btn.getAttribute('data-title');
      navigator.share?.({ title: 'LastBite deal', text: 'Check this: ' + title, url: location.href }).catch(() => {});
    }
    
    if (action === 'fav' && vendorId) {
      if (state.favorites.has(vendorId)) state.favorites.delete(vendorId); else state.favorites.add(vendorId);
      saveState();
      renderDeals();
    }
    
    if (action === 'sub' && vendorId) {
      try { await Notification.requestPermission(); } catch(_) {}
      if (state.subscriptions.has(vendorId)) state.subscriptions.delete(vendorId); else state.subscriptions.add(vendorId);
      saveState();
      renderDeals();
      maybeNotify('Subscribed to deal alerts');
    }
  };
  $('#deals-available').addEventListener('click', onDealsClick);
  $('#deals-soon').addEventListener('click', onDealsClick);
}

function maybeNotify(message) {
  try { if (Notification.permission === 'granted') new Notification('LastBite', { body: message }); } catch (_) {}
}

function simulateRealtime() {
  // Every 7s: a nearby vendor adjusts quantities
  setInterval(() => {
    for (const v of state.consumersNearby) {
      if (v.offers.length === 0) continue;
      const offer = v.offers[Math.floor(Math.random() * v.offers.length)];
      if (offer.qty > 0 && Math.random() < 0.6) offer.qty -= 1; else offer.qty += 1;
      offer.qty = Math.max(0, Math.min(offer.qty, 12));
    }
    if (state.view === 'consumer') renderDeals();
  }, 7000);

  // Every 12s: auto-apply last-hour discount visual by lowering price a bit (demo only)
  setInterval(() => {
    if (!state.vendor.lastHourActive) return;
    for (const item of state.vendor.inventory) {
      const target = Math.max(1, item.original * 0.35);
      item.price = Math.max(target, Math.round((item.price * 0.98) * 100)/100);
    }
    renderVendor();
    if (state.view === 'consumer') renderDeals();
  }, 12000);
}

function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {});
    });
  }
}

function init() {
  bindEvents();
  setView('consumer');
  simulateRealtime();
  registerSW();
  updateCartBadge();
  
  // Load favorites/subscriptions from state
  if (state.favorites.size) {
    const favs = Array.from(state.favorites);
    state.favorites = new Set(favs);
  }
  if (state.subscriptions.size) {
    const subs = Array.from(state.subscriptions);
    state.subscriptions = new Set(subs);
  }
}

init();


