/* ══════════════════════════════════════════════════════════════
   whatsapp.js — Módulo WhatsApp con plantillas y portal cliente
══════════════════════════════════════════════════════════════ */

async function renderWhatsapp(el) {
  el.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">WhatsApp <span>/ Notificaciones</span></h1>
    </div>

    <!-- Tabs -->
    <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap">
      <button class="btn btn-orange btn-sm wa-tab active" data-tab="enviar">📤 Enviar mensaje</button>
      <button class="btn btn-ghost btn-sm wa-tab" data-tab="plantillas">📝 Plantillas</button>
      <button class="btn btn-ghost btn-sm wa-tab" data-tab="log">📜 Historial</button>
    </div>

    <div id="waTabContent"></div>`;

  document.querySelectorAll('.wa-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.wa-tab').forEach(b => b.classList.replace('btn-orange','btn-ghost'));
      btn.classList.replace('btn-ghost','btn-orange');
      btn.classList.add('active');
      loadWaTab(btn.dataset.tab);
    });
  });

  loadWaTab('enviar');
}

async function loadWaTab(tab) {
  const c = document.getElementById('waTabContent');
  c.innerHTML = `<div class="skeleton" style="height:300px;border-radius:12px"></div>`;
  if (tab === 'enviar')     await renderWaEnviar(c);
  if (tab === 'plantillas') await renderWaPlantillas(c);
  if (tab === 'log')        await renderWaLog(c);
}

/* ─── TAB ENVIAR ────────────────────────────────────────────── */
async function renderWaEnviar(c) {
  const [otsData, plantData] = await Promise.all([
    Api.get('/ots?limit=100'),
    Api.get('/whatsapp/plantillas'),
  ]);

  c.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">

      <!-- Izquierda: formulario -->
      <div class="card">
        <div class="card-header"><span class="card-title">Componer mensaje</span></div>

        <div class="form-group">
          <label>Seleccionar OT (opcional)</label>
          <select class="form-control" id="waOtSel" onchange="cargarDatosOT(this.value)">
            <option value="">— Sin OT, mensaje libre —</option>
            ${otsData?.data?.filter(o=>o.estado!=='entregado').map(o =>
              `<option value="${o.id}">${o.codigo} · ${o.cliente} · ${o.placa}</option>`
            ).join('')}
          </select>
        </div>

        <div id="waOtInfo" class="hidden" style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:14px;font-size:.85rem">
          <!-- Se llena con datos de la OT -->
        </div>

        <div class="form-group">
          <label>Plantilla rápida</label>
          <div style="display:flex;gap:6px;flex-wrap:wrap" id="waPlantButtons">
            ${plantData?.data?.map(p =>
              `<button class="btn btn-ghost btn-sm" onclick="aplicarPlantilla(${p.id})">${p.nombre}</button>`
            ).join('')}
          </div>
        </div>

        <div class="form-group">
          <label>Mensaje *</label>
          <textarea class="form-control" id="waMensaje" rows="7"
            placeholder="Escribe el mensaje o selecciona una plantilla…"
            oninput="actualizarPreview()"></textarea>
          <div class="text-muted" style="font-size:.75rem;margin-top:4px">
            Variables: {cliente} {placa} {marca} {modelo} {codigo} {estado} {total_estimado} {total_real} {tecnico} {portal_url}
          </div>
        </div>

        <button class="btn btn-green" style="width:100%;margin-top:4px;padding:12px;font-size:.95rem" onclick="enviarWhatsApp()">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" style="margin-right:6px">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5.014L2.01 22l5.121-1.343A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.657 0-3.208-.436-4.55-1.199l-.325-.193-3.046.799.813-2.972-.212-.344A7.96 7.96 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
          </svg>
          Abrir WhatsApp Web
        </button>
      </div>

      <!-- Derecha: preview -->
      <div>
        <div class="card" style="padding:0;overflow:hidden">
          <div style="background:#075e54;padding:14px 18px;display:flex;align-items:center;gap:10px">
            <div style="width:36px;height:36px;border-radius:50%;background:#25d366;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff" id="waPreviewAvatar">C</div>
            <div>
              <div style="color:#fff;font-weight:600;font-size:.9rem" id="waPreviewNombre">Cliente</div>
              <div style="color:#a0d6b4;font-size:.75rem" id="waPreviewTel">+51 999 000 000</div>
            </div>
          </div>
          <div style="background:#ece5dd;padding:16px;min-height:280px">
            <div style="background:#fff;border-radius:0 10px 10px 10px;padding:12px 14px;max-width:85%;box-shadow:0 1px 2px rgba(0,0,0,.15)">
              <div id="waPreviewMsg" style="color:#111;font-size:.88rem;line-height:1.5;white-space:pre-wrap;word-break:break-word">El mensaje aparecerá aquí…</div>
              <div style="text-align:right;color:#999;font-size:.7rem;margin-top:6px">${new Date().toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'})} ✓✓</div>
            </div>
          </div>
        </div>

        <div id="waPortalCard" class="card hidden" style="margin-top:16px;border-color:rgba(34,197,94,.3);background:rgba(34,197,94,.05)">
          <div class="fw600 mb8" style="font-size:.85rem;color:var(--green)">🔗 Link de seguimiento generado</div>
          <div id="waPortalUrl" style="font-size:.82rem;word-break:break-all;color:var(--text2);margin-bottom:10px"></div>
          <button class="btn btn-green btn-sm" onclick="copiarPortalUrl()">📋 Copiar link</button>
        </div>
      </div>
    </div>`;

  window._waData = {};
  window._plantillas = plantData?.data || [];
}

async function cargarDatosOT(otId) {
  const info = document.getElementById('waOtInfo');
  if (!otId) { info.classList.add('hidden'); window._waData = {}; actualizarPreview(); return; }

  const data = await Api.get(`/whatsapp/construir/${otId}`);
  if (!data?.success) return;
  const o = data.data;
  window._waData = o;

  info.classList.remove('hidden');
  info.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <div><span class="text-muted">Cliente:</span> <strong>${o.cliente}</strong></div>
      <div><span class="text-muted">Teléfono:</span> <strong>${o.telefono||'—'}</strong></div>
      <div><span class="text-muted">Vehículo:</span> <strong>${o.placa} ${o.marca||''} ${o.modelo||''}</strong></div>
      <div><span class="text-muted">Estado:</span> ${badgeEstado(o.estado)}</div>
      <div><span class="text-muted">OT:</span> <strong class="text-accent">${o.codigo}</strong></div>
      <div><span class="text-muted">Total:</span> <strong>${fmtCurrency(o.total_estimado)}</strong></div>
    </div>`;

  // Actualizar preview header
  document.getElementById('waPreviewNombre').textContent = o.cliente;
  document.getElementById('waPreviewTel').textContent    = o.telefono || '';
  document.getElementById('waPreviewAvatar').textContent = o.cliente?.charAt(0).toUpperCase();

  // Mostrar portal url si existe
  if (o.portal_url) {
    document.getElementById('waPortalCard').classList.remove('hidden');
    document.getElementById('waPortalUrl').textContent = o.portal_url;
    window._portalUrl = o.portal_url;
  }

  actualizarPreview();
}

async function aplicarPlantilla(id) {
  const p = window._plantillas?.find(x => x.id === id);
  if (!p) return;
  const o = window._waData || {};
  const BASE = window.location.origin + '/mecanica';

  // Generar token si hay OT y no tiene aún
  let portalUrl = o.portal_url || '';
  if (o.id && !portalUrl) {
    const resp = await Api.post('/whatsapp/enviar', {
      cliente_id: o.cliente_id || 0,
      ot_id: o.id,
      mensaje: '(generando token)'
    });
    if (resp?.token) {
      portalUrl = `${BASE}/seguimiento/${resp.token}`;
      window._portalUrl = portalUrl;
      document.getElementById('waPortalCard').classList.remove('hidden');
      document.getElementById('waPortalUrl').textContent = portalUrl;
    }
  }

  const msg = p.mensaje
    .replace(/{cliente}/g,        o.cliente       || '')
    .replace(/{placa}/g,          o.placa         || '')
    .replace(/{marca}/g,          o.marca         || '')
    .replace(/{modelo}/g,         o.modelo        || '')
    .replace(/{codigo}/g,         o.codigo        || '')
    .replace(/{estado}/g,         o.estado_label  || o.estado || '')
    .replace(/{total_estimado}/g, fmtCurrency(o.total_estimado))
    .replace(/{total_real}/g,     fmtCurrency(o.total_real))
    .replace(/{tecnico}/g,        o.tecnico       || 'nuestro técnico')
    .replace(/{portal_url}/g,     portalUrl       || '');

  document.getElementById('waMensaje').value = msg;
  actualizarPreview();
}

function actualizarPreview() {
  const msg = document.getElementById('waMensaje')?.value || '';
  document.getElementById('waPreviewMsg').textContent = msg || 'El mensaje aparecerá aquí…';
}

async function enviarWhatsApp() {
  const mensaje = document.getElementById('waMensaje').value.trim();
  if (!mensaje) { toast('Escribe un mensaje', 'warning'); return; }

  const o = window._waData || {};
  if (!o.cliente_id && !o.id) {
    toast('Selecciona una OT para continuar', 'warning');
    return;
  }

  const data = await Api.post('/whatsapp/enviar', {
    cliente_id: o.cliente_id || o.id,
    ot_id:      o.id || null,
    mensaje,
  });

  if (data?.success) {
    // Mostrar portal url
    if (data.token) {
      const url = `${window.location.origin}/mecanica/seguimiento/${data.token}`;
      window._portalUrl = url;
      document.getElementById('waPortalCard')?.classList.remove('hidden');
      if (document.getElementById('waPortalUrl'))
        document.getElementById('waPortalUrl').textContent = url;
    }
    // Abrir WhatsApp Web
    window.open(data.wa_link, '_blank');
    toast('Mensaje registrado — WhatsApp abierto', 'success');
  } else {
    toast(data?.message || 'Error', 'error');
  }
}

function copiarPortalUrl() {
  const url = window._portalUrl;
  if (!url) return;
  navigator.clipboard.writeText(url).then(() => toast('Link copiado al portapapeles', 'success'));
}

/* ─── TAB PLANTILLAS ────────────────────────────────────────── */
async function renderWaPlantillas(c) {
  const data = await Api.get('/whatsapp/plantillas');
  c.innerHTML = `
    <div class="card">
      <div class="card-header">
        <span class="card-title">Plantillas de mensaje</span>
        <button class="btn btn-orange btn-sm" onclick="modalPlantilla()">+ Nueva plantilla</button>
      </div>
      <div style="display:grid;gap:14px" id="plantGrid">
        ${data?.data?.length
          ? data.data.map(p => `
            <div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:16px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                <div>
                  <span class="fw700">${p.nombre}</span>
                  <span class="badge badge-normal" style="margin-left:8px">${p.tipo}</span>
                </div>
                <div style="display:flex;gap:6px">
                  <button class="btn btn-ghost btn-sm" onclick="modalPlantilla(${p.id})">✏️ Editar</button>
                  <button class="btn btn-danger btn-sm" onclick="eliminarPlantilla(${p.id})">🗑</button>
                </div>
              </div>
              <div style="font-size:.83rem;color:var(--text2);white-space:pre-wrap;background:var(--bg2);padding:10px 12px;border-radius:8px;line-height:1.5">${p.mensaje}</div>
            </div>`).join('')
          : `<div>${emptyState('Sin plantillas')}</div>`}
      </div>
    </div>`;
}

async function modalPlantilla(id = null) {
  let p = {};
  if (id) {
    const data = await Api.get('/whatsapp/plantillas');
    p = data?.data?.find(x => x.id === id) || {};
  }
  openModal(`
    <div class="modal-header"><h3>${id ? 'Editar' : 'Nueva'} Plantilla</h3><button class="modal-close btn-icon">✕</button></div>
    <div class="modal-body">
      <div class="form-group"><label>Nombre *</label><input class="form-control" id="pNombre" value="${p.nombre||''}"></div>
      <div class="form-group">
        <label>Tipo</label>
        <select class="form-control" id="pTipo">
          ${['ot_creada','presupuesto','en_proceso','listo','entregado','personalizado'].map(t =>
            `<option value="${t}" ${p.tipo===t?'selected':''}>${t}</option>`
          ).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Mensaje *</label>
        <textarea class="form-control" id="pMensaje" rows="8">${p.mensaje||''}</textarea>
        <div class="text-muted" style="font-size:.75rem;margin-top:4px">
          Variables: {cliente} {placa} {marca} {modelo} {codigo} {estado} {total_estimado} {total_real} {tecnico} {portal_url}
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-orange" onclick="guardarPlantilla(${id||'null'})">Guardar</button>
    </div>`);
}

async function guardarPlantilla(id) {
  const body = {
    nombre:  document.getElementById('pNombre').value.trim(),
    tipo:    document.getElementById('pTipo').value,
    mensaje: document.getElementById('pMensaje').value.trim(),
  };
  if (!body.nombre || !body.mensaje) { toast('Nombre y mensaje requeridos', 'warning'); return; }
  const data = id ? await Api.put(`/whatsapp/plantillas/${id}`, body) : await Api.post('/whatsapp/plantillas', body);
  if (data?.success) { toast('Plantilla guardada', 'success'); closeModal(); loadWaTab('plantillas'); }
  else toast(data?.message || 'Error', 'error');
}

async function eliminarPlantilla(id) {
  confirm('¿Eliminar esta plantilla?', async () => {
    const data = await Api.delete(`/whatsapp/plantillas/${id}`);
    if (data?.success) { toast('Eliminada', 'success'); loadWaTab('plantillas'); }
  });
}

/* ─── TAB LOG ───────────────────────────────────────────────── */
async function renderWaLog(c) {
  const data = await Api.get('/whatsapp/log');
  c.innerHTML = `
    <div class="card">
      <div class="card-header"><span class="card-title">Historial de mensajes enviados</span></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Cliente</th><th>Teléfono</th><th>OT</th><th>Mensaje</th><th>Enviado por</th><th>Fecha</th></tr></thead>
          <tbody>
            ${data?.data?.length
              ? data.data.map(l => `<tr>
                  <td class="fw600">${l.cliente}</td>
                  <td class="text-muted">${l.telefono||'—'}</td>
                  <td class="text-accent">${l.ot_codigo||'—'}</td>
                  <td style="max-width:240px;font-size:.8rem;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${l.mensaje}">${l.mensaje}</td>
                  <td class="text-muted">${l.usuario||'—'}</td>
                  <td class="text-muted" style="font-size:.8rem">${fmtDatetime(l.created_at)}</td>
                </tr>`).join('')
              : `<tr><td colspan="6">${emptyState('Sin mensajes enviados')}</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>`;
}
