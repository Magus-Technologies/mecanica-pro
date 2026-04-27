/* ══════════════════════════════════════════════════════════════
   sunat.js — Facturación Electrónica SUNAT
══════════════════════════════════════════════════════════════ */

async function renderSunat(el) {
  el.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Facturación <span>/ SUNAT</span></h1>
    </div>

    <div id="snKpis" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:18px"></div>

    <div class="card" style="margin-bottom:14px">
      <div class="card-body">
        <form id="snFiltros" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;align-items:end">
          <div class="form-group"><label>Desde</label><input type="date" id="snDesde" class="form-control" value="${snFirstDayOfMonth()}"></div>
          <div class="form-group"><label>Hasta</label><input type="date" id="snHasta" class="form-control" value="${snToday()}"></div>
          <div class="form-group"><label>Tipo</label>
            <select id="snTipo" class="form-control">
              <option value="">Todos</option><option value="boleta">Boleta</option><option value="factura">Factura</option>
            </select>
          </div>
          <div class="form-group"><label>Estado SUNAT</label>
            <select id="snEstado" class="form-control">
              <option value="">Todos</option>
              <option value="sin_emitir">Sin emitir</option>
              <option value="pendiente">Pendiente</option>
              <option value="aceptado">Aceptado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>
          <button type="submit" class="btn btn-orange">Aplicar</button>
        </form>
      </div>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>Serie-Número</th><th>Tipo</th><th>Cliente</th><th>Documento</th>
            <th>Total</th><th>Estado SUNAT</th><th>Fecha</th><th></th>
          </tr></thead>
          <tbody id="snTbody">${skeletonRows(8)}</tbody>
        </table>
      </div>
    </div>`;

  document.getElementById('snFiltros').addEventListener('submit', e => { e.preventDefault(); loadSunat(); });
  loadSunat();
}

function snFirstDayOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}
function snToday() { return new Date().toISOString().slice(0, 10); }

async function loadSunat() {
  const qs = new URLSearchParams({
    desde:  document.getElementById('snDesde').value,
    hasta:  document.getElementById('snHasta').value,
    tipo:   document.getElementById('snTipo').value,
    estado: document.getElementById('snEstado').value,
  }).toString();
  const data = await Api.get('/sunat?' + qs);
  if (!data?.success) {
    document.getElementById('snTbody').innerHTML = `<tr><td colspan="8">${emptyState('Error al cargar')}</td></tr>`;
    return;
  }

  // KPIs
  const k = data.kpis || {};
  document.getElementById('snKpis').innerHTML = `
    ${snKpi('Total',       k.total      || 0, '')}
    ${snKpi('Sin emitir',  k.sin_emitir || 0, 'muted')}
    ${snKpi('Pendientes',  k.pendientes || 0, 'yellow')}
    ${snKpi('Aceptados',   k.aceptados  || 0, 'green')}
    ${snKpi('Rechazados',  k.rechazados || 0, 'red')}
  `;

  const tbody = document.getElementById('snTbody');
  if (!data.data.length) {
    tbody.innerHTML = `<tr><td colspan="8">${emptyState('Sin comprobantes en el rango')}</td></tr>`;
    return;
  }
  tbody.innerHTML = data.data.map(v => `
    <tr>
      <td class="fw700 text-accent">${v.serie_numero}</td>
      <td><span class="badge badge-normal">${v.tipo}</span></td>
      <td>${v.cliente || '-'}</td>
      <td class="text-muted">${v.cliente_tipo_doc || ''} ${v.cliente_doc || ''}</td>
      <td class="fw700">${fmtCurrency(v.total)}</td>
      <td>${snBadgeEstado(v.sunat_estado)}</td>
      <td class="text-muted">${fmtDatetime(v.fecha_emision)}</td>
      <td><button class="btn btn-ghost btn-sm" onclick="snVerComprobante(${v.id})">Ver</button></td>
    </tr>`).join('');
}

function snKpi(label, value, color) {
  const colorMap = {
    green:  'color:#16a34a',
    yellow: 'color:#ca8a04',
    red:    'color:#dc2626',
    muted:  'color:#94a3b8',
    '':     '',
  };
  return `
    <div class="card" style="padding:14px">
      <div style="font-size:.7rem;text-transform:uppercase;letter-spacing:1px;color:#64748b">${label}</div>
      <div style="font-size:1.7rem;font-weight:800;${colorMap[color] || ''}">${value}</div>
    </div>`;
}

function snBadgeEstado(estado) {
  if (!estado) return `<span class="badge" style="background:#e2e8f0;color:#64748b">SIN EMITIR</span>`;
  const map = {
    pendiente: 'background:#fef3c7;color:#a16207',
    aceptado:  'background:#dcfce7;color:#16a34a',
    rechazado: 'background:#fee2e2;color:#dc2626',
  };
  return `<span class="badge" style="${map[estado] || ''}">${estado.toUpperCase()}</span>`;
}

async function snVerComprobante(id) {
  const data = await Api.get('/sunat/' + id);
  if (!data?.success) return toast('No se pudo cargar el comprobante', 'error');
  const c = data.data;
  const items = data.items || [];

  const acciones = snAccionesHtml(c);
  const itemsHtml = items.map(i => `
    <tr>
      <td>${i.descripcion}</td>
      <td style="text-align:right">${i.cantidad}</td>
      <td style="text-align:right">${fmtCurrency(i.precio_unitario)}</td>
      <td style="text-align:right">${fmtCurrency(i.subtotal)}</td>
    </tr>`).join('');

  openModal(`
    <div class="modal-header">
      <h3>${c.serie_numero} <span style="margin-left:8px">${snBadgeEstado(c.sunat_estado)}</span></h3>
      <button class="modal-close btn-icon">✕</button>
    </div>
    <div class="modal-body">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px">
        <div>
          <h4 style="font-size:.8rem;text-transform:uppercase;letter-spacing:1px;color:#f97316;margin-bottom:8px">Comprobante</h4>
          ${snRow('Tipo', c.tipo)}
          ${snRow('Serie / Correlativo', `${c.serie} / ${String(c.correlativo).padStart(8, '0')}`)}
          ${snRow('Subtotal', fmtCurrency(c.subtotal))}
          ${snRow('IGV', fmtCurrency(c.igv))}
          ${snRow('Total', `<b>${fmtCurrency(c.total)}</b>`)}
          ${snRow('Fecha', fmtDatetime(c.fecha_emision))}
          ${snRow('Emitido por', c.usuario_nombre || '-')}
        </div>
        <div>
          <h4 style="font-size:.8rem;text-transform:uppercase;letter-spacing:1px;color:#f97316;margin-bottom:8px">Cliente / SUNAT</h4>
          ${snRow('Cliente', c.cliente)}
          ${snRow('Documento', `${c.cliente_tipo_doc || ''} ${c.cliente_doc || ''}`)}
          ${snRow('Dirección', c.cliente_direccion || '-')}
          ${c.sunat_fecha ? snRow('Última gestión', fmtDatetime(c.sunat_fecha)) : ''}
          ${c.sunat_mensaje ? snRow('Mensaje', `<span style="font-size:.85rem">${c.sunat_mensaje}</span>`) : ''}
          ${c.sunat_qr ? `
            <div style="margin-top:6px">
              <div style="font-size:.7rem;text-transform:uppercase;color:#64748b;margin-bottom:4px">QR Info</div>
              <div style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;padding:8px;font-family:monospace;font-size:.7rem;word-break:break-all;max-height:80px;overflow:auto">${escapeHtml(c.sunat_qr)}</div>
            </div>` : ''}
        </div>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px">${acciones}</div>

      <h4 style="font-size:.8rem;text-transform:uppercase;letter-spacing:1px;color:#f97316;margin-bottom:8px">Detalle</h4>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Descripción</th><th style="text-align:right">Cant.</th><th style="text-align:right">P. Unit.</th><th style="text-align:right">Subtotal</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
      </div>
    </div>`, 'modal-lg');
}

function snAccionesHtml(c) {
  const acciones = [];
  if (!c.sunat_xml) {
    acciones.push(`<button class="btn btn-orange" onclick="snGenerar(${c.id})">⚡ Generar XML</button>`);
  } else {
    acciones.push(`<a class="btn btn-ghost" href="${snApiUrl('/sunat/' + c.id + '/xml')}" target="_blank">👁 Ver XML</a>`);
    acciones.push(`<a class="btn btn-ghost" href="${snApiUrl('/sunat/' + c.id + '/xml?download=1')}">⬇ Descargar XML</a>`);
    if (c.sunat_estado !== 'aceptado') {
      acciones.push(`<button class="btn btn-success" onclick="snEnviar(${c.id})">📤 Enviar a SUNAT</button>`);
      acciones.push(`<button class="btn btn-danger" onclick="snRegenerar(${c.id})">🔄 Regenerar</button>`);
    }
    if (c.sunat_estado === 'aceptado' && c.sunat_cdr) {
      acciones.push(`<a class="btn btn-ghost" href="${snApiUrl('/sunat/' + c.id + '/cdr')}">⬇ Descargar CDR</a>`);
    }
  }
  return acciones.join('');
}

function snApiUrl(path) {
  // Construye URL absoluta con token para descargas (window.open / target=_blank).
  // El backend espera Authorization header; los <a> normales no lo envían, así que
  // exponemos token en query si fuera necesario. Por simplicidad en GETs públicos
  // de XML/CDR pasamos el token vía query — pero el middleware actual no lo lee así.
  // Aquí los <a> abren la ruta y, si la sesión está activa en el mismo origen,
  // el navegador NO envía el JWT. Solución pragmática: usar fetch + blob download.
  // Para mantener simple este módulo, construimos la URL y manejamos descarga vía JS.
  return '#';
}

// Sobreescribimos los <a> con descarga via fetch+blob para incluir el JWT.
async function snDownload(path, filename) {
  const token = localStorage.getItem('mp_token');
  const apiBase = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? '/api' : '/mecanica/api';
  const res = await fetch(apiBase + path, { headers: { 'Authorization': 'Bearer ' + token } });
  if (!res.ok) { toast('Error al descargar', 'error'); return; }
  const blob = await res.blob();
  if (filename === '__view__') {
    window.open(URL.createObjectURL(blob), '_blank');
    return;
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename || 'archivo';
  document.body.appendChild(a); a.click(); a.remove();
}

// Reemplazamos snAccionesHtml para usar snDownload (override).
function snAccionesHtml(c) {
  const acciones = [];
  if (!c.sunat_xml) {
    acciones.push(`<button class="btn btn-orange" onclick="snGenerar(${c.id})">⚡ Generar XML</button>`);
  } else {
    acciones.push(`<button class="btn btn-ghost" onclick="snDownload('/sunat/${c.id}/xml','__view__')">👁 Ver XML</button>`);
    acciones.push(`<button class="btn btn-ghost" onclick="snDownload('/sunat/${c.id}/xml?download=1','${c.serie_numero}.xml')">⬇ Descargar XML</button>`);
    if (c.sunat_estado !== 'aceptado') {
      acciones.push(`<button class="btn btn-success" onclick="snEnviar(${c.id})">📤 Enviar a SUNAT</button>`);
      acciones.push(`<button class="btn btn-danger" onclick="snRegenerar(${c.id})">🔄 Regenerar</button>`);
    }
    if (c.sunat_estado === 'aceptado' && c.sunat_cdr) {
      acciones.push(`<button class="btn btn-ghost" onclick="snDownload('/sunat/${c.id}/cdr','R-${c.serie_numero}.zip')">⬇ Descargar CDR</button>`);
    }
  }
  return acciones.join('');
}

async function snGenerar(id) {
  toast('Generando XML…', 'info');
  const r = await Api.post('/sunat/' + id + '/generar', {});
  if (r?.success) { toast(r.mensaje || 'XML generado', 'success'); closeModal(); loadSunat(); }
  else { toast(r?.mensaje || 'Error al generar', 'error'); }
}

async function snEnviar(id) {
  toast('Enviando a SUNAT…', 'info');
  const r = await Api.post('/sunat/' + id + '/enviar', {});
  if (r?.success) { toast(r.mensaje || 'Aceptado por SUNAT', 'success'); closeModal(); loadSunat(); }
  else { toast(r?.mensaje || 'Error al enviar', 'error'); }
}

async function snRegenerar(id) {
  if (!window.confirm || !confirm('¿Regenerar XML? Reemplazará el existente.')) return;
  const r = await Api.post('/sunat/' + id + '/generar', {});
  if (r?.success) { toast(r.mensaje, 'success'); closeModal(); loadSunat(); }
  else { toast(r?.mensaje || 'Error', 'error'); }
}

function snRow(label, value) {
  return `
    <div style="display:grid;grid-template-columns:130px 1fr;padding:5px 0;font-size:.85rem;border-bottom:1px solid #f1f5f9">
      <b style="color:#64748b;font-weight:600">${label}</b>
      <span>${value || '-'}</span>
    </div>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
