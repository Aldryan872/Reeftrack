/**
 * Sidebar.js — Reusable sidebar navigation
 * Matches dashboard.html / products.html / sales-reports.html design.
 * Usage:
 *   import { renderSidebar, initSidebar, toggleSidebar } from './Sidebar.js';
 *   initSidebar('dashboard'); // or auto-detect: initSidebar()
 */

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'ph-squares-four', href: 'dashboard.html' },
  { id: 'products', label: 'Products', icon: 'ph-package', href: 'products.html' },
  { id: 'sales-reports', label: 'Sales Reports', icon: 'ph-chart-line', href: 'sales-reports.html' },
  { id: 'logout', label: 'Logout', icon: 'ph-sign-out', href: 'index.html', isLogout: true },
];

/**
 * Detect active id from current location if not provided.
 * @returns {string}
 */
function detectActiveId() {
  const file = window.location.pathname.split('/').pop() || 'dashboard.html';
  const found = NAV_ITEMS.find((n) => n.href === file);
  return found ? found.id : 'dashboard';
}

/**
 * Get display name/email from localStorage.
 */
function getUserInfo() {
  const name = localStorage.getItem('admin_name');
  const email = localStorage.getItem('admin_user');
  return {
    label: name || email || 'Admin',
    sublabel: name ? email || 'Administrator' : 'Administrator',
  };
}

/**
 * Handle logout - clears auth and redirects.
 * @param {Event} e
 */
function handleLogout(e) {
  e.preventDefault();
  localStorage.removeItem('admin_user');
  // Keep products etc, only clear auth. Optionally clear all:
  // localStorage.clear();
  window.location.href = 'index.html';
}

/**
 * Render sidebar into container.
 * @param {string|HTMLElement} container - selector or element
 * @param {string} activeId - one of NAV_ITEMS id (auto-detected if omitted)
 */
export function renderSidebar(container, activeId) {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el) return;

  const resolvedActive = activeId || detectActiveId();
  const user = getUserInfo();

  el.className = 'sidebar';
  el.id = 'sidebar';
  el.setAttribute('role', 'navigation');
  el.setAttribute('aria-label', 'Main navigation');

  el.innerHTML = `
    <div class="sidebar-top">
      <div class="sidebar-logo" aria-hidden="true"><i class="ph ph-shield-check"></i></div>
      <div class="sidebar-brand">Admin<span>Management System</span></div>
    </div>
    <nav class="sidebar-nav">
      ${NAV_ITEMS.map(
        (item) => `
        <a href="${item.href}" class="nav-item ${item.id === resolvedActive ? 'active' : ''}" data-id="${item.id}" ${item.isLogout ? 'data-logout="true"' : ''} aria-current="${item.id === resolvedActive ? 'page' : 'false'}">
          <i class="ph ${item.icon}" aria-hidden="true"></i> ${item.label}
        </a>
      `
      ).join('')}
    </nav>
    <div class="sidebar-bottom">
      <div class="user-mini" style="border:none; padding:8px 4px;">
        <div style="width:32px;height:32px;border-radius:50%;background:var(--primary);color:white;display:grid;place-items:center;font-size:14px;font-weight:700;flex-shrink:0;">
          ${escapeHtml(user.label.charAt(0).toUpperCase())}
        </div>
        <div class="user-mini-info">
          <strong title="${escapeHtml(user.label)}">${escapeHtml(user.label)}</strong>
          <span>${escapeHtml(user.sublabel)}</span>
        </div>
      </div>
    </div>
  `;

  // Bind logout handler
  const logoutLink = el.querySelector('[data-logout="true"]');
  if (logoutLink) {
    logoutLink.addEventListener('click', handleLogout);
  }

  // Close sidebar on nav click (mobile)
  el.querySelectorAll('.nav-item:not([data-logout])').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 760) toggleSidebar(false);
    });
  });
}

export function toggleSidebar(force) {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  if (typeof force === 'boolean') {
    sidebar?.classList.toggle('open', force);
    overlay?.classList.toggle('open', force);
  } else {
    sidebar?.classList.toggle('open');
    overlay?.classList.toggle('open');
  }
}

/**
 * Auto-bind mobile overlay and render. Call once per page.
 * @param {string} [activeId] - if omitted, auto-detect from URL
 */
export function initSidebar(activeId) {
  const resolved = activeId || detectActiveId();
  renderSidebar('#sidebar', resolved);

  const overlay = document.getElementById('overlay');
  if (overlay) {
    overlay.addEventListener('click', () => toggleSidebar(false));
  }

  // Optional: handle ESC to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleSidebar(false);
  });

  // Expose globally for inline onclick="toggleSidebar()" in HTML
  window.toggleSidebar = toggleSidebar;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

export const SIDEBAR_NAV_ITEMS = NAV_ITEMS;
export default { renderSidebar, toggleSidebar, initSidebar, NAV_ITEMS };
