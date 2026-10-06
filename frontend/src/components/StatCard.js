/**
 * StatCard.js — Stats grid component (dashboard + sales-reports)
 * Flat design, matches dashboard.css .stats / .stat-card
 * Supports: label, value, change, trend, icon, variant
 */

/**
 * @typedef {Object} StatCardOptions
 * @property {string} label - e.g. "Total Revenue"
 * @property {string|number} value - display value
 * @property {string} [change] - e.g. "12%" or "+4.2%" (null hides)
 * @property {'up'|'down'|'neutral'} [trend] - trend direction
 * @property {string} [icon] - Phosphor icon class without `ph-` prefix, e.g. "currency-dollar"
 * @property {'default'|'dark'|'green'|'amber'|'red'} [variant] - icon background variant
 */

/**
 * Single stat card HTML
 * @param {StatCardOptions} opts
 * @returns {string}
 */
export function createStatCard({ label, value, change = null, trend = 'up', icon = null, variant = 'default' }) {
  const changeHtml =
    change !== null && change !== undefined && String(change).trim() !== ''
      ? `
    <div class="stat-change ${trend}" aria-label="Change ${escapeHtml(String(change))}">
      <i class="ph ${trend === 'up' ? 'ph-trend-up' : trend === 'down' ? 'ph-trend-down' : 'ph-minus'}" aria-hidden="true"></i> ${escapeHtml(String(change))}
    </div>`
      : '';

  // Optional icon header (matches dashboard.css .stat-top / .stat-icon)
  const iconHtml = icon
    ? `
    <div class="stat-top">
      <div class="stat-icon ${variant !== 'default' ? variant : ''}"><i class="ph ph-${escapeHtml(icon)}"></i></div>
      <i class="ph ph-dots-three stat-menu" aria-hidden="true"></i>
    </div>`
    : '';

  return `
    <div class="stat-card" role="group" aria-label="${escapeHtml(label)}">
      ${iconHtml}
      <div class="stat-label">${escapeHtml(label)}</div>
      <div class="stat-value">${escapeHtml(String(value))}</div>
      ${changeHtml}
    </div>
  `;
}

/**
 * Render stats grid
 * @param {string|HTMLElement} container - selector or element
 * @param {StatCardOptions[]} stats
 */
export function renderStats(container, stats) {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el) return;
  if (!stats || stats.length === 0) {
    el.innerHTML = `<div class="text-muted" style="padding:16px; font-size:13px;">No stats available.</div>`;
    return;
  }
  el.className = 'stats';
  el.setAttribute('role', 'region');
  el.setAttribute('aria-label', 'Statistics');
  el.innerHTML = stats.map(createStatCard).join('');
}

/**
 * Helper: format currency PHP
 * @param {number} n
 * @returns {string}
 */
export function formatPeso(n) {
  const num = Number(n) || 0;
  return `₱ ${num.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/**
 * Helper: build common dashboard stats from raw numbers
 * @param {{ revenue:number, orders:number, pending:number }} data
 * @returns {StatCardOptions[]}
 */
export function buildDashboardStats(data) {
  return [
    { label: 'Total Revenue', value: formatPeso(data.revenue), change: data.revenueChange ?? null, trend: 'up', icon: 'currency-dollar', variant: 'green' },
    { label: 'Orders', value: String(data.orders ?? 0), change: data.ordersChange ?? null, trend: 'up', icon: 'shopping-bag', variant: 'dark' },
    { label: 'Pending', value: String(data.pending ?? 0), change: data.pendingChange ?? null, trend: 'down', icon: 'clock', variant: 'amber' },
  ];
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

export default { createStatCard, renderStats, formatPeso, buildDashboardStats };
