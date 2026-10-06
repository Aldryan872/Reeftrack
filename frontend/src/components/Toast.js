/**
 * Toast.js — Simple toast notification component
 * Usage:
 *   import { showToast } from './Toast.js';
 *   showToast('Product saved!', { type: 'success' });
 */

const TOAST_CONTAINER_ID = 'toast-container';

/**
 * Ensure container exists
 * @returns {HTMLElement}
 */
function ensureContainer() {
  let el = document.getElementById(TOAST_CONTAINER_ID);
  if (el) return el;
  el = document.createElement('div');
  el.id = TOAST_CONTAINER_ID;
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('aria-atomic', 'true');
  el.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 8px;
    pointer-events: none;
  `;
  // Inject minimal styles for toast items
  const style = document.createElement('style');
  style.textContent = `
    .toast-item {
      min-width: 280px;
      max-width: 420px;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.12);
      border: 1px solid var(--border);
      background: white;
      color: var(--text);
      pointer-events: auto;
      animation: toastIn 0.2s ease;
    }
    .toast-item.success { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
    .toast-item.error { background: #fef2f2; border-color: #fecaca; color: #991b1b; }
    .toast-item.info { background: #eff6ff; border-color: #bfdbfe; color: #1e40af; }
    .toast-item.warning { background: #fffbeb; border-color: #fde68a; color: #92400e; }
    @keyframes toastIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
    @keyframes toastOut { from { opacity:1; } to { opacity:0; transform: translateY(4px); } }
  `;
  document.head.appendChild(style);
  document.body.appendChild(el);
  return el;
}

/**
 * Show toast
 * @param {string} message
 * @param {{ type?: 'success'|'error'|'info'|'warning', duration?: number }} [options]
 */
export function showToast(message, options = {}) {
  const { type = 'info', duration = 2800 } = options;
  const container = ensureContainer();
  const toast = document.createElement('div');
  toast.className = `toast-item ${type}`;
  const icons = {
    success: 'ph-check-circle',
    error: 'ph-warning-circle',
    info: 'ph-info',
    warning: 'ph-warning',
  };
  toast.innerHTML = `<i class="ph ${icons[type] || icons.info}" style="font-size:18px; flex-shrink:0;"></i><span style="flex:1;">${escapeHtml(message)}</span><button aria-label="Close" style="background:none;border:none;cursor:pointer;color:inherit;opacity:0.7;"><i class="ph ph-x"></i></button>`;
  const closeBtn = toast.querySelector('button');
  let timer = setTimeout(() => dismiss(), duration);

  function dismiss() {
    toast.style.animation = 'toastOut 0.18s ease forwards';
    setTimeout(() => toast.remove(), 180);
    clearTimeout(timer);
  }

  closeBtn.addEventListener('click', dismiss);
  toast.addEventListener('mouseenter', () => clearTimeout(timer));
  toast.addEventListener('mouseleave', () => {
    timer = setTimeout(() => dismiss(), 1200);
  });

  container.appendChild(toast);
}

export function showSuccess(msg, duration) { showToast(msg, { type: 'success', duration }); }
export function showError(msg, duration) { showToast(msg, { type: 'error', duration }); }
export function showInfo(msg, duration) { showToast(msg, { type: 'info', duration }); }
export function showWarning(msg, duration) { showToast(msg, { type: 'warning', duration }); }

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

export default { showToast, showSuccess, showError, showInfo, showWarning };
