/**
 * Calendar.js — Reusable calendar widget
 * Extracted from dashboard.html inline script.
 * Usage:
 *   import { renderCalendar, initCalendar } from './Calendar.js';
 *   initCalendar('#calendarBody', '#calendarMonth');
 *   // or controlled:
 *   renderCalendar({ bodySelector: '#calendarBody', monthSelector: '#calendarMonth', date: new Date() });
 */

let currentDate = new Date();
let boundSelectors = null;

/**
 * Render calendar for given month.
 * @param {{ bodySelector:string|HTMLElement, monthSelector:string|HTMLElement, date?:Date, onDateClick?:(date:Date)=>void }} opts
 */
export function renderCalendar(opts) {
  const { bodySelector, monthSelector, date = currentDate, onDateClick } = opts;
  const bodyEl = typeof bodySelector === 'string' ? document.querySelector(bodySelector) : bodySelector;
  const monthEl = typeof monthSelector === 'string' ? document.querySelector(monthSelector) : monthSelector;
  if (!bodyEl) return;

  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0);
  const nextDays = 7 - lastDay.getDay() - 1;

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  let html = '';

  // Previous month days (muted) — use real Date to handle Jan/Dec boundary
  for (let x = firstDay.getDay(); x > 0; x--) {
    const dayNum = prevLastDay.getDate() - x + 1;
    const d = new Date(year, month - 1, dayNum);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    html += `<td style="padding:40px 12px; text-align:center; color:var(--text-light); border:1px solid var(--border); font-size:14px;" data-date="${iso}" data-muted="true">${dayNum}</td>`;
  }

  // Current month days
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const isToday = isCurrentMonth && day === today.getDate();
    const style = isToday
      ? 'background:#6f3b16; color:white; font-weight:700;'
      : 'font-weight:600;';
    const extra = isToday ? ' data-today="true"' : '';
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    html += `<td style="padding:40px 12px; text-align:center; border:1px solid var(--border); font-size:14px; ${style}" data-date="${iso}"${extra}>${day}</td>`;
    if ((firstDay.getDay() + day) % 7 === 0) html += '</tr><tr>';
  }

  // Next month days — also handled with Date for year wrap
  for (let day = 1; day <= nextDays; day++) {
    const d = new Date(year, month + 1, day);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    html += `<td style="padding:40px 12px; text-align:center; color:var(--text-light); border:1px solid var(--border); font-size:14px;" data-date="${iso}" data-muted="true">${day}</td>`;
  }

  bodyEl.innerHTML = '<tr>' + html + '</tr>';

  if (monthEl) {
    monthEl.textContent = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  // Optional click handler
  if (typeof onDateClick === 'function') {
    bodyEl.querySelectorAll('td[data-date]').forEach((td) => {
      td.style.cursor = 'pointer';
      td.addEventListener('click', () => {
        const [y, m, d] = td.dataset.date.split('-').map(Number);
        onDateClick(new Date(y, m - 1, d));
      });
    });
  }
}

/**
 * Initialize calendar with auto navigation (prev/next if buttons exist).
 * Expects HTML structure from dashboard.html:
 *   <h3 id="calendarMonth"></h3>
 *   <tbody id="calendarBody"></tbody>
 * @param {string} bodySelector
 * @param {string} monthSelector
 * @param {{ onDateClick?: (date:Date)=>void }} [options]
 */
export function initCalendar(bodySelector = '#calendarBody', monthSelector = '#calendarMonth', options = {}) {
  boundSelectors = { bodySelector, monthSelector, onDateClick: options.onDateClick };
  currentDate = new Date();
  renderCalendar({ bodySelector, monthSelector, date: currentDate, onDateClick: options.onDateClick });

  // Bind optional nav buttons if they exist: #calendarPrev, #calendarNext
  const prevBtn = document.getElementById('calendarPrev');
  const nextBtn = document.getElementById('calendarNext');
  if (prevBtn) prevBtn.addEventListener('click', () => navigateMonth(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => navigateMonth(1));

  // Expose for global usage (dashboard.html inline)
  window.renderCalendar = () => renderCalendar({ bodySelector, monthSelector, date: currentDate, onDateClick: options.onDateClick });
  window.navigateCalendar = navigateMonth;
}

export function navigateMonth(delta) {
  currentDate.setMonth(currentDate.getMonth() + delta);
  if (boundSelectors) {
    renderCalendar({ ...boundSelectors, date: currentDate });
  }
}

export function goToToday() {
  currentDate = new Date();
  if (boundSelectors) renderCalendar({ ...boundSelectors, date: currentDate });
}

export function getCurrentDate() {
  return new Date(currentDate);
}

export default { renderCalendar, initCalendar, navigateMonth, goToToday, getCurrentDate };
