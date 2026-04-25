/* ── utils.js ────────────────────────────────────────────────────────────── */

// Toast
function toast(msg, type = 'success', dur = 3000) {
  const c = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icons = { success: '✓', error: '✕', warning: '⚠' };
  el.innerHTML = `<span style="font-weight:700">${icons[type]||'ℹ'}</span> ${msg}`;
  c.appendChild(el);
  setTimeout(() => el.remove(), dur);
}

// Modal
function openModal(html, size = '') {
  const container = document.getElementById('modalContainer');
  container.innerHTML = `<div class="modal-overlay" id="activeOverlay">
    <div class="modal ${size}">${html}</div></div>`;
  document.getElementById('activeOverlay').addEventListener('click', e => {
    if (e.target.id === 'activeOverlay') closeModal();
  });
  document.querySelectorAll('.modal-close').forEach(b => b.addEventListener('click', closeModal));
}
function closeModal() {
  document.getElementById('modalContainer').innerHTML = '';
}

// Formatters
function fmtCurrency(n) {
  return `S/ ${parseFloat(n || 0).toFixed(2)}`;
}
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function fmtDatetime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function timeAgo(d) {
  const diff = Math.floor((Date.now() - new Date(d)) / 1000);
  if (diff < 60) return 'hace un momento';
  if (diff < 3600) return `hace ${Math.floor(diff/60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff/3600)} h`;
  return `hace ${Math.floor(diff/86400)} días`;
}

// Badge OT estado
function badgeEstado(estado) {
  const labels = {
    pendiente:'Pendiente', diagnostico:'Diagnóstico', aprobado:'Aprobado',
    rechazado:'Rechazado', en_proceso:'En Proceso', terminado:'Terminado',
    facturado:'Facturado', entregado:'Entregado', cancelado:'Cancelado',
  };
  return `<span class="badge badge-${estado}">${labels[estado]||estado}</span>`;
}
function badgePrioridad(p) {
  return `<span class="badge badge-${p}">${p.charAt(0).toUpperCase()+p.slice(1)}</span>`;
}

// Empty state
function emptyState(msg = 'Sin resultados') {
  return `<div class="empty-state">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 15s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
    <p>${msg}</p></div>`;
}

// Skeleton rows
function skeletonRows(cols, rows = 5) {
  return Array(rows).fill('').map(() =>
    `<tr>${Array(cols).fill('<td><div class="skeleton" style="height:16px;border-radius:4px"></div></td>').join('')}</tr>`
  ).join('');
}

// Confirm dialog
function confirm(msg, onYes) {
  openModal(`
    <div class="modal-header"><h3>Confirmar</h3><button class="modal-close btn-icon">✕</button></div>
    <div class="modal-body"><p>${msg}</p></div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-danger" id="confirmYes">Confirmar</button>
    </div>`, 'modal-sm');
  document.getElementById('confirmYes').onclick = () => { closeModal(); onYes(); };
}

// WhatsApp link
function waLink(phone, msg) {
  const p = phone ? phone.replace(/\D/g,'') : '';
  const num = p.startsWith('51') ? p : `51${p}`;
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
}
