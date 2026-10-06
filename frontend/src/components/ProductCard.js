/**
 * ProductCard.js — Product card (grid style from products.html)
 * Supports image, category, stock, status, price, edit/delete
 * Now decoupled: handlers via callbacks, no window globals required.
 */

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {string|number} stock
 * @property {string|number} price
 * @property {'Available'|'Out of Stock'|string} status
 * @property {string} [image] - data URL or http URL
 * @property {string} [description]
 */

/**
 * Create single card HTML string
 * @param {Product} product
 * @param {{ onEdit?: (id:string)=>void, onDelete?: (id:string)=>void }} [handlers] - unused in string mode, kept for API compat
 * @returns {string}
 */
export function createProductCard(product, handlers = {}) {
  const isAvailable = product.status === 'Available';
  const statusClass = isAvailable ? 'available' : 'outofstock';
  const statusIcon = isAvailable ? 'ph-check-circle' : 'ph-x-circle';
  const stockNum = parseInt(String(product.stock), 10);
  const stockClass = !Number.isNaN(stockNum) && stockNum <= 5 ? 'low' : '';
  const imgPart = product.image
    ? `<img src="${escapeAttr(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" />`
    : `<i class="ph ph-image product-card-img-placeholder" aria-hidden="true"></i>`;

  const description = product.description?.trim()
    ? escapeHtml(product.description)
    : 'Vimplysimply dummy text of the printing and typesetting.';

  const priceLabel = formatPrice(product.price);

  return `
    <div class="product-card" data-id="${escapeAttr(product.id)}" role="group" aria-label="${escapeHtml(product.name)}">
      <div class="card-actions" role="toolbar" aria-label="Card actions">
        <button class="action-btn" data-action="edit" data-id="${escapeAttr(product.id)}" title="Edit ${escapeHtml(product.name)}" aria-label="Edit ${escapeHtml(product.name)}"><i class="ph ph-pencil" aria-hidden="true"></i></button>
        <button class="action-btn delete-btn" data-action="delete" data-id="${escapeAttr(product.id)}" title="Delete ${escapeHtml(product.name)}" aria-label="Delete ${escapeHtml(product.name)}"><i class="ph ph-trash" aria-hidden="true"></i></button>
      </div>
      <div class="product-card-img-wrap" aria-hidden="true">${imgPart}</div>
      <div class="product-card-content">
        <div class="product-card-title" title="${escapeHtml(product.name)}">${escapeHtml(product.name)}</div>
        <div class="product-card-desc">${description}</div>
        <div class="product-card-meta">
          <span class="meta-pill category">${escapeHtml(product.category)}</span>
          <span class="meta-pill stock ${stockClass}">Stock: ${escapeHtml(String(product.stock))}</span>
          <span class="status-badge ${statusClass}"><i class="ph ${statusIcon}" aria-hidden="true"></i> ${escapeHtml(product.status)}</span>
        </div>
        <div class="product-card-footer">
          <span class="price-pill">${priceLabel}</span>
          <button class="cart-pill" data-action="edit" data-id="${escapeAttr(product.id)}" aria-label="Edit ${escapeHtml(product.name)}">EDIT</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render product grid with delegated handlers.
 * @param {string|HTMLElement} container - selector or element for grid
 * @param {Product[]} products
 * @param {{ onEdit?: (id:string)=>void, onDelete?: (id:string)=>void, emptySelector?: string }} [options]
 */
export function renderProductGrid(container, products, options = {}) {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  const emptyEl = options.emptySelector
    ? document.querySelector(options.emptySelector)
    : document.getElementById('emptyState');
  if (!el) return;

  const onEdit = options.onEdit || window.openEditById;
  const onDelete = options.onDelete || window.deleteById;

  if (!products || products.length === 0) {
    el.innerHTML = '';
    el.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';
  el.style.display = 'grid';
  el.className = 'products-grid';
  el.setAttribute('role', 'list');
  el.innerHTML = products.map((p) => createProductCard(p)).join('');

  // Single delegated listener — better than per-button listeners
  el.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id || btn.closest('.product-card')?.dataset.id;
    if (!id) return;
    if (action === 'edit' && typeof onEdit === 'function') onEdit(id);
    if (action === 'delete' && typeof onDelete === 'function') onDelete(id);
  }, { once: false });

  // For backward compat, also keep window handlers if not overridden
  if (!options.onEdit && !window.openEditById) {
    // no-op, Products.js will provide handlers
  }
}

/**
 * Render empty state helper (call instead of duplicating logic)
 * @param {string|HTMLElement} gridEl
 * @param {string|HTMLElement} emptyEl
 * @param {boolean} isEmpty
 */
export function toggleEmptyState(gridEl, emptyEl, isEmpty) {
  const grid = typeof gridEl === 'string' ? document.querySelector(gridEl) : gridEl;
  const empty = typeof emptyEl === 'string' ? document.querySelector(emptyEl) : emptyEl;
  if (!grid || !empty) return;
  if (isEmpty) {
    grid.style.display = 'none';
    empty.style.display = 'block';
  } else {
    grid.style.display = 'grid';
    empty.style.display = 'none';
  }
}

function formatPrice(price) {
  const n = Number(price);
  if (Number.isNaN(n)) return `₱${escapeHtml(String(price))}`;
  return `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function escapeAttr(str) {
  return String(str ?? '').replace(/"/g, '&quot;');
}

export default { createProductCard, renderProductGrid, toggleEmptyState };
