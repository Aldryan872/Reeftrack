/**
 * Modal.js — Reusable modal component
 * Usage:
 *   import { createModal, openModal, closeModal } from './Modal.js';
 *   createModal({ id: 'addProductModal', title: 'Add product', contentHtml: '...' });
 *   openModal('addProductModal');
 *
 * Or use existing HTML modals via initModal():
 *   initModal('addProductModal');
 */

const activeModals = new Set();

/**
 * Create modal and inject into body if not exists.
 * @param {{ id:string, title:string, contentHtml:string, footerHtml?:string, onClose?:()=>void }} opts
 * @returns {HTMLElement}
 */
export function createModal({ id, title, contentHtml, footerHtml = '', onClose }) {
  let existing = document.getElementById(id);
  if (existing) return existing;

  const wrap = document.createElement('div');
  wrap.id = id;
  wrap.className = 'modal';
  wrap.style.display = 'none';
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');
  wrap.setAttribute('aria-label', title);
  wrap.innerHTML = `
    <div class="modal-content" role="document">
      <div class="modal-header">
        <h2>${escapeHtml(title)}</h2>
        <button class="modal-close" data-close-modal aria-label="Close"><i class="ph ph-x" aria-hidden="true"></i></button>
      </div>
      <div class="modal-body">${contentHtml}</div>
      ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
    </div>
  `;
  document.body.appendChild(wrap);
  initModal(id, onClose);
  return wrap;
}

/**
 * Initialize existing modal (bind close handlers, backdrop, ESC).
 * @param {string} id
 * @param {()=>void} [onClose]
 */
export function initModal(id, onClose) {
  const modal = document.getElementById(id);
  if (!modal || modal.dataset.initialized === 'true') return;
  modal.dataset.initialized = 'true';

  // Close buttons
  modal.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => closeModal(id, onClose));
  });

  // Backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(id, onClose);
  });
}

export function openModal(id, onClose) {
  const modal = document.getElementById(id);
  if (!modal) return;
  // Ensure initialized
  if (modal.dataset.initialized !== 'true') initModal(id, onClose);
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  activeModals.add(id);
  bindEsc();

  // Focus first input for a11y
  const firstInput = modal.querySelector('input, select, textarea, button');
  if (firstInput) setTimeout(() => firstInput.focus(), 50);
}

export function closeModal(id, onClose) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.style.display = 'none';
  activeModals.delete(id);
  if (activeModals.size === 0) document.body.style.overflow = '';
  if (typeof onClose === 'function') onClose();
  // Also call data-onclose if stored
  const stored = modal.dataset.onclose;
  if (stored && typeof window[stored] === 'function' && !onClose) window[stored]();
}

export function closeAllModals() {
  [...activeModals].forEach((id) => closeModal(id));
}

function bindEsc() {
  if (window.__modalEscBound) return;
  window.__modalEscBound = true;
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeModals.size > 0) {
      const last = [...activeModals].pop();
      closeModal(last);
    }
  });
}

/**
 * Helper for form modals: handle image preview
 * @param {HTMLInputElement} input
 * @param {string} previewImgId
 * @param {string} previewWrapId
 * @param {(dataUrl:string|null)=>void} onChange
 */
export function bindImageUpload(inputId, previewImgId, previewWrapId, onChange) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) {
      if (typeof onChange === 'function') onChange(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      const img = document.getElementById(previewImgId);
      const wrap = document.getElementById(previewWrapId);
      if (img) img.src = dataUrl;
      if (wrap) wrap.style.display = 'block';
      if (typeof onChange === 'function') onChange(dataUrl);
    };
    reader.readAsDataURL(file);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

export default { createModal, initModal, openModal, closeModal, closeAllModals, bindImageUpload };
