let otsFiltroEstado = '';
let otsSearch = '';

async function renderOTs(el) {
  el.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Órdenes de <span>Trabajo</span></h1>
      <button class="btn btn-orange" onclick="modalNuevaOT()">+ Nueva OT</button>
    </div>
    <div class="filters-bar">
      <div class="search-input">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input class="form-control" placeholder="Buscar por código, cliente o placa…" id="otsSearch" value="${otsSearch}">
      </div>
      <select class="form-control" style="width:auto" id="otsEstadoFilter">
        <option value="">Todos los estados</option>
        <option value="pendiente">Pendiente</option>
        <option value="diagnostico">Diagnóstico</option>
        <option value="aprobado">Aprobado</option>
        <option value="en_proceso">En Proceso</option>
        <option value="terminado">Terminado</option>
        <option value="facturado">Facturado</option>
        <option value="entregado">Entregado</option>
        <option value="cancelado">Cancelado</option>
      </select>
    </div>
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Código</th><th>Cliente</th><th>Vehículo</th><th>Técnico</th><th>Prioridad</th><th>Estado</th><th>Total</th><th>Fecha</th><th></th></tr></thead>
          <tbody id="otsTbody">${skeletonRows(9)}</tbody>
        </table>
      </div>
    </div>`;

  document.getElementById('otsEstadoFilter').value = otsFiltroEstado;

  await loadOTs();

  document.getElementById('otsSearch').addEventListener('input', e => {
    otsSearch = e.target.value; loadOTs();
  });
  document.getElementById('otsEstadoFilter').addEventListener('change', e => {
    otsFiltroEstado = e.target.value; loadOTs();
  });
}

async function loadOTs() {
  const params = new URLSearchParams({ q: otsSearch });
  if (otsFiltroEstado) params.set('estado', otsFiltroEstado);
  const data = await Api.get(`/ots?${params}`);
  const tbody = document.getElementById('otsTbody');
  if (!data?.success) { tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">Error al cargar</td></tr>`; return; }
  if (!data.data.length) { tbody.innerHTML = `<tr><td colspan="9">${emptyState('Sin órdenes')}</td></tr>`; return; }

  tbody.innerHTML = data.data.map(o => `
    <tr>
      <td class="fw700 text-accent" style="cursor:pointer" onclick="verOT(${o.id})">${o.codigo}</td>
      <td>
        <div class="fw600">${o.cliente}</div>
        <div class="text-muted" style="font-size:.75rem">${o.cliente_tel||''}</div>
      </td>
      <td>
        <div class="fw600">${o.placa}</div>
        <div class="text-muted" style="font-size:.75rem">${o.marca||''} ${o.modelo||''}</div>
      </td>
      <td>${o.tecnico||'<span class="text-muted">—</span>'}</td>
      <td>${badgePrioridad(o.prioridad)}</td>
      <td>${badgeEstado(o.estado)}</td>
      <td class="fw600">${fmtCurrency(o.total_estimado)}</td>
      <td class="text-muted" style="font-size:.8rem">${fmtDate(o.created_at)}</td>
      <td>
        <button class="btn-icon" onclick="verOT(${o.id})" title="Ver detalle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </td>
    </tr>`).join('');
}

async function verOT(id) {
  const data = await Api.get(`/ots/${id}`);
  if (!data?.success) { toast('Error al cargar OT', 'error'); return; }
  const o = data.data;

  const nextEstados = {
    pendiente: ['diagnostico','cancelado'],
    diagnostico: ['aprobado','rechazado'],
    aprobado: ['en_proceso','cancelado'],
    en_proceso: ['terminado'],
    terminado: ['facturado'],
    facturado: ['entregado'],
  };
  const next = nextEstados[o.estado] || [];

  openModal(`
    <div class="modal-header">
      <h3>${o.codigo} — ${o.placa}</h3>
      <button class="modal-close btn-icon">✕</button>
    </div>
    <div class="modal-body">
      <div class="grid2" style="margin-bottom:16px">
        <div><div class="text-muted" style="font-size:.78rem">CLIENTE</div><div class="fw600">${o.cliente}</div><div class="text-muted" style="font-size:.82rem">${o.cliente_tel||''}</div></div>
        <div><div class="text-muted" style="font-size:.78rem">VEHÍCULO</div><div class="fw600">${o.placa} · ${o.marca||''} ${o.modelo||''} ${o.anio||''}</div><div class="text-muted" style="font-size:.82rem">${o.color||''} · ${o.combustible||''}</div></div>
        <div><div class="text-muted" style="font-size:.78rem">ESTADO</div>${badgeEstado(o.estado)}</div>
        <div><div class="text-muted" style="font-size:.78rem">PRIORIDAD</div>${badgePrioridad(o.prioridad)}</div>
        <div><div class="text-muted" style="font-size:.78rem">TÉCNICO</div><div class="fw600">${o.tecnico||'No asignado'}</div></div>
        <div><div class="text-muted" style="font-size:.78rem">KM ENTRADA</div><div class="fw600">${o.km_entrada||0} km</div></div>
      </div>

      ${o.diagnostico ? `<div class="card" style="margin-bottom:12px"><div class="fw600 mb8">Diagnóstico</div><p style="font-size:.88rem;color:var(--text2)">${o.diagnostico}</p></div>` : ''}

      ${o.servicios?.length ? `
        <div class="fw600 mb8">Servicios</div>
        <table style="margin-bottom:16px"><thead><tr><th>Servicio</th><th>Técnico</th><th class="text-right">Precio</th></tr></thead>
        <tbody>${o.servicios.map(s=>`<tr><td>${s.servicio_nombre}</td><td class="text-muted">${s.tecnico_id||'—'}</td><td class="text-right fw600">${fmtCurrency(s.precio_cobrado)}</td></tr>`).join('')}</tbody>
        </table>` : ''}

      ${o.repuestos?.length ? `
        <div class="fw600 mb8">Repuestos</div>
        <table style="margin-bottom:16px"><thead><tr><th>Repuesto</th><th>Cant.</th><th class="text-right">Precio</th><th class="text-right">Total</th></tr></thead>
        <tbody>${o.repuestos.map(r=>`<tr><td>${r.repuesto_nombre}</td><td>${r.cantidad}</td><td class="text-right">${fmtCurrency(r.precio_unitario)}</td><td class="text-right fw600">${fmtCurrency(r.precio_unitario*r.cantidad)}</td></tr>`).join('')}</tbody>
        </table>` : ''}

      <div style="display:flex;justify-content:space-between;padding:12px 0;border-top:1px solid var(--border)">
        <span class="fw600">Total estimado</span>
        <span class="fw700 text-accent" style="font-size:1.1rem">${fmtCurrency(o.total_estimado)}</span>
      </div>

      ${o.evidencias?.length ? `
        <div class="fw600 mb8" style="margin-top:12px">Evidencias (${o.evidencias.length})</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${o.evidencias.map(ev=>`<img src="${ev.url}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid var(--border);cursor:pointer" onclick="window.open('${ev.url}','_blank')" title="${ev.descripcion||''}"/>`).join('')}
        </div>` : ''}

      ${o.historial?.length ? `
        <div class="fw600 mb8" style="margin-top:16px">Historial</div>
        <div>${o.historial.map(h=>`<div style="display:flex;gap:10px;padding:6px 0;border-bottom:1px solid var(--border);font-size:.82rem">
          <span class="text-muted">${fmtDatetime(h.created_at)}</span>
          <span>${h.estado_anterior ? `${badgeEstado(h.estado_anterior)} → ` : ''}${badgeEstado(h.estado_nuevo)}</span>
          <span class="text-muted">${h.descripcion||''}</span>
        </div>`).join('')}</div>` : ''}

      ${o.cliente_tel ? `
        <div style="margin-top:16px">
          <a class="btn btn-green" href="${waLink(o.cliente_tel, `Hola ${o.cliente}, le informamos sobre su vehículo ${o.placa} (${o.codigo}): estado actual *${o.estado.toUpperCase()}*. Total estimado: ${fmtCurrency(o.total_estimado)}`)}" target="_blank">
            💬 WhatsApp al cliente
          </a>
        </div>` : ''}
    </div>
    <div class="modal-footer">
      ${next.map(e=>`<button class="btn ${e==='cancelado'||e==='rechazado'?'btn-danger':'btn-orange'}" onclick="cambiarEstadoOT(${o.id},'${e}',this)">${e.replace('_',' ').toUpperCase()}</button>`).join('')}
      <button class="btn btn-ghost" onclick="closeModal()">Cerrar</button>
    </div>`, 'modal-lg');
}

async function cambiarEstadoOT(id, estado, btn) {
  btn.disabled = true; btn.textContent = '…';
  const data = await Api.patch(`/ots/${id}/estado`, { estado });
  if (data?.success) {
    toast(`OT cambiada a "${estado}"`, 'success');
    closeModal();
    loadOTs();
  } else {
    toast(data?.message || 'Error', 'error');
    btn.disabled = false;
  }
}

async function modalNuevaOT() {
  const [clientes, tecnicos] = await Promise.all([
    Api.get('/clientes?limit=200'),
    Api.get('/tecnicos'),
  ]);

  openModal(`
    <div class="modal-header"><h3>Nueva Orden de Trabajo</h3><button class="modal-close btn-icon">✕</button></div>
    <div class="modal-body">
      <div class="form-row">
        <div class="form-group">
          <label>Cliente *</label>
          <select class="form-control" id="otCliente" onchange="cargarVehiculos(this.value)">
            <option value="">Seleccionar cliente…</option>
            ${clientes?.data?.map(c=>`<option value="${c.id}">${c.nombre}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Vehículo *</label>
          <select class="form-control" id="otVehiculo"><option value="">Primero seleccione cliente</option></select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Técnico</label>
          <select class="form-control" id="otTecnico">
            <option value="">Sin asignar</option>
            ${tecnicos?.data?.map(t=>`<option value="${t.id}">${t.nombre}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Prioridad</label>
          <select class="form-control" id="otPrioridad">
            <option value="normal">Normal</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
            <option value="baja">Baja</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>KM entrada</label>
        <input type="number" class="form-control" id="otKm" placeholder="0" min="0">
      </div>
      <div class="form-group">
        <label>Diagnóstico / descripción del problema</label>
        <textarea class="form-control" id="otDiagnostico" rows="3" placeholder="Describe los problemas detectados…"></textarea>
      </div>
      <div class="form-group">
        <label>Observaciones</label>
        <textarea class="form-control" id="otObs" rows="2"></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-orange" onclick="crearOT()">Crear OT</button>
    </div>`);
}

async function cargarVehiculos(clienteId) {
  if (!clienteId) return;
  const data = await Api.get(`/vehiculos?cliente_id=${clienteId}&limit=50`);
  const sel = document.getElementById('otVehiculo');
  if (data?.success && data.data.length) {
    sel.innerHTML = `<option value="">Seleccionar vehículo…</option>` +
      data.data.map(v=>`<option value="${v.id}">${v.placa} — ${v.marca||''} ${v.modelo||''}</option>`).join('');
  } else {
    sel.innerHTML = `<option value="">Sin vehículos registrados</option>`;
  }
}

async function crearOT() {
  const body = {
    cliente_id:   parseInt(document.getElementById('otCliente').value),
    vehiculo_id:  parseInt(document.getElementById('otVehiculo').value),
    tecnico_id:   parseInt(document.getElementById('otTecnico').value) || null,
    prioridad:    document.getElementById('otPrioridad').value,
    km_entrada:   parseInt(document.getElementById('otKm').value)||0,
    diagnostico:  document.getElementById('otDiagnostico').value,
    observaciones:document.getElementById('otObs').value,
  };
  if (!body.cliente_id || !body.vehiculo_id) { toast('Cliente y vehículo requeridos', 'warning'); return; }

  const data = await Api.post('/ots', body);
  if (data?.success) {
    toast(`OT creada: ${data.codigo}`, 'success');
    closeModal();
    loadOTs();
  } else {
    toast(data?.message || 'Error', 'error');
  }
}
