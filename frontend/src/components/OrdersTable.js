/**
 * OrdersTable.js — Orders table component for sales-reports
 * Handles rendering, empty state, CSV/PDF export.
 * Usage:
 *   import { renderOrdersTable, exportCSV, exportPDF } from './OrdersTable.js';
 *   renderOrdersTable('#ordersTableBody', orders);
 */

/**
 * @typedef {Object} Order
 * @property {string} id - Order ID
 * @property {string} customer
 * @property {string} date - ISO or locale string
 * @property {string|number} amount
 * @property {'paid'|'pending'|'failed'|string} status
 */

/**
 * Render orders into tbody.
 * @param {string|HTMLElement} container - tbody selector or element
 * @param {Order[]} orders
 * @param {{ emptyMessage?:string }} [options]
 */
export function renderOrdersTable(container, orders, options = {}) {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el) return;
  const table = el.closest('table');
  // Find empty state via table parent or fallback
  const emptyEl = document.getElementById('ordersEmptyState') || null;

  if (!orders || orders.length === 0) {
    el.innerHTML = '';
    if (table) table.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'block';
    // If no dedicated emptyEl, insert row placeholder
    if (!emptyEl && table) {
      const wrap = table.closest('.card-body') || table.parentElement;
      if (wrap && !wrap.querySelector('.empty-state-orders')) {
        const div = document.createElement('div');
        div.className = 'empty-state-orders';
        div.style.cssText = 'text-align:center;padding:32px 16px;color:var(--text-muted);font-size:13px;';
        div.innerHTML = `<i class="ph ph-receipt" style="font-size:28px;color:var(--text-light);"></i><p style="margin-top:8px;">${escapeHtml(options.emptyMessage || 'No orders yet.')}</p>`;
        wrap.appendChild(div);
      }
    }
    return;
  }

  // Clear empty states
  if (table) table.style.display = 'table';
  const existingEmpty = document.querySelector('.empty-state-orders');
  if (existingEmpty) existingEmpty.remove();
  if (emptyEl) emptyEl.style.display = 'none';

  el.innerHTML = orders
    .map(
      (o) => `
    <tr>
      <td style="font-weight:600;">${escapeHtml(o.id)}</td>
      <td>
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="width:28px;height:28px;border-radius:50%;background:var(--surface-hover);border:1px solid var(--border);display:grid;place-items:center;font-size:12px;font-weight:700;">${escapeHtml((o.customer || '?').charAt(0).toUpperCase())}</div>
          ${escapeHtml(o.customer)}
        </div>
      </td>
      <td style="color:var(--text-muted);">${escapeHtml(formatDate(o.date))}</td>
      <td style="font-weight:600;">${escapeHtml(formatAmount(o.amount))}</td>
      <td><span class="badge ${getStatusClass(o.status)}">${escapeHtml(o.status)}</span></td>
    </tr>
  `
    )
    .join('');
}

function getStatusClass(status) {
  const s = String(status).toLowerCase();
  if (['paid', 'completed', 'success'].includes(s)) return 'paid';
  if (['pending', 'processing'].includes(s)) return 'pending';
  if (['failed', 'cancelled', 'canceled'].includes(s)) return 'failed';
  return 'pending';
}

function formatDate(d) {
  if (!d) return '-';
  try {
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return String(d);
    return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return String(d);
  }
}

function formatAmount(a) {
  if (a === null || a === undefined) return '-';
  const n = Number(String(a).replace(/[^0-9.-]/g, ''));
  if (Number.isNaN(n)) return String(a);
  return `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
}

/**
 * Export table to CSV (same logic as sales-reports.html but reusable)
 * @param {string} tableId - e.g. 'ordersTable'
 * @param {string} [filenamePrefix]
 */
export function exportCSV(tableId = 'ordersTable', filenamePrefix = 'orders') {
  const table = document.getElementById(tableId);
  if (!table) return;
  const csv = [];
  for (const row of table.rows) {
    const rowData = [];
    for (const cell of row.cells) {
      let text = cell.innerText.replace(/"/g, '""');
      rowData.push('"' + text + '"');
    }
    csv.push(rowData.join(','));
  }
  const csvContent = csv.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export table to PDF using jsPDF + autoTable if available, fallbacks otherwise.
 * @param {string} tableId
 * @param {string} [filenamePrefix]
 * @param {string} [title]
 */
export function exportPDF(tableId = 'ordersTable', filenamePrefix = 'orders', title = 'Order Report') {
  const table = document.getElementById(tableId);
  if (!table) return;

  if (window.jspdf && window.jspdf.jsPDF && typeof window.jspdf.jsPDF.prototype.autoTable === 'function') {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`${title} - ${new Date().toLocaleDateString()}`, 14, 15);
    doc.autoTable({
      html: `#${tableId}`,
      startY: 20,
      theme: 'grid',
      headStyles: { fillColor: [0, 123, 255] },
      styles: { fontSize: 10, cellPadding: 3 },
    });
    doc.save(`${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.pdf`);
    return;
  }

  if (window.jspdf && window.jspdf.jsPDF) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`${title} - ${new Date().toLocaleDateString()}`, 14, 15);
    let y = 25;
    doc.setFontSize(10);
    const headers = Array.from(table.rows[0].cells).map((c) => c.innerText);
    doc.setFont(undefined, 'bold');
    doc.text(headers.join(' | '), 14, y);
    y += 7;
    doc.setFont(undefined, 'normal');
    for (let i = 1; i < table.rows.length; i++) {
      const row = Array.from(table.rows[i].cells).map((c) => c.innerText).join(' | ');
      doc.text(row, 14, y);
      y += 7;
      if (y > 280) {
        doc.addPage();
        y = 15;
      }
    }
    doc.save(`${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.pdf`);
    return;
  }

  // Print fallback
  const html = `<h2 style="font-family:Inter,sans-serif;">${escapeHtml(title)} - ${new Date().toLocaleDateString()}</h2>` + table.outerHTML;
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(
      `<html><head><title>${escapeHtml(title)} PDF</title><style>table{width:100%;border-collapse:collapse;font-family:Inter,sans-serif}th,td{border:1px solid #ddd;padding:8px;font-size:12px;text-align:left}th{background:#f5f5f5}</style></head><body>${html}</body></html>`
    );
    win.document.close();
    win.focus();
    win.print();
  } else {
    alert('Please allow popups to export PDF');
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

export default { renderOrdersTable, exportCSV, exportPDF };
