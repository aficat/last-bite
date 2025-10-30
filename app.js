const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const assetByKind = {
  mystery: './assets/roll.png',
  coupon: './assets/loaf.png',
  item: './assets/bread.png',
};

const state = {
  view: 'consumer',
  activeDealsTab: 'available', // 'available' | 'soon'
  favorites: new Set(), // vendorId strings
  subscriptions: new Set(), // vendorId strings
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
      .map(o => ({ ...o, img: assetByKind[o.kind] }))
  }))];

  const [availableBlocks, comingBlocks] = [
    blocks.filter(b => b.openForDeals && b.entries.length),
    blocks.filter(b => !b.openForDeals && b.entries.length),
  ];

  function renderCards(list) {
    return list.flatMap(block => block.entries.map(entry => {
      const pct = Math.round((1 - entry.price / (entry.original || (entry.price*2))) * 100);
      const fav = state.favorites.has(block.id) ? 'active' : '';
      const sub = state.subscriptions.has(block.id) ? 'active' : '';
      const kindLabel = entry.kind === 'mystery' ? 'Mystery Box' : (entry.kind === 'coupon' ? 'Coupon Pack' : 'Item');
      return `
        <article class="deal-card" data-vendor-id="${block.id}">
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
            <button class="primary" data-action="buy" data-title="${entry.title}">Buy</button>
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
  list.innerHTML = state.vendor.inventory.map(item => `
    <li class="item">
      <div>
        <div style="font-weight:600;">${item.title}</div>
        <div class="muted">${item.type === 'mystery' ? 'Mystery Pack' : (item.type === 'coupon' ? 'Coupon Pack' : 'Item')} • ${item.qty} ${item.type === 'coupon' ? 'remaining' : 'left'}</div>
      </div>
      <div class="actions">
        <span class="price">${formatPrice(item.price)}</span>
        ${item.original ? `<span class="strike">${formatPrice(item.original)}</span>` : ''}
        <button class="secondary" data-action="sell-one" data-id="${item.id}">Sell 1</button>
        <button class="secondary" data-action="restock" data-id="${item.id}">+5</button>
        <button class="secondary" data-action="delete" data-id="${item.id}">Remove</button>
      </div>
    </li>
  `).join('');

  $('#m-revenue').textContent = formatPrice(state.vendor.metrics.revenue);
  $('#m-sold').textContent = String(state.vendor.metrics.sold);
  $('#m-waste').textContent = (state.vendor.metrics.wasteKg).toFixed(1);
}

function bindEvents() {
  $('#btn-consumer').addEventListener('click', () => setView('consumer'));
  $('#btn-vendor').addEventListener('click', () => setView('vendor'));

  $('#filter-mystery').addEventListener('change', renderDeals);
  $('#filter-items').addEventListener('change', renderDeals);
  $('#filter-distance').addEventListener('change', renderDeals);

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
    const title = btn.getAttribute('data-title');
    if (action === 'buy') alert('Demo purchase: ' + title);
    if (action === 'share') navigator.share?.({ title: 'LastBite deal', text: 'Check this: ' + title, url: location.href }).catch(() => {});
    if (action === 'fav' && vendorId) {
      if (state.favorites.has(vendorId)) state.favorites.delete(vendorId); else state.favorites.add(vendorId);
      renderDeals();
    }
    if (action === 'sub' && vendorId) {
      try { await Notification.requestPermission(); } catch(_) {}
      if (state.subscriptions.has(vendorId)) state.subscriptions.delete(vendorId); else state.subscriptions.add(vendorId);
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
}

init();


