/* vehiculos, servicios, tecnicos stubs ya están en clientes.js — aquí el resto */

/* ══════════════════════════════════════════════════════════════
   ventas.js
══════════════════════════════════════════════════════════════ */
async function renderVentas(el) {
  el.innerHTML = `
    <div class="page-header"><h1 class="page-title">Ventas <span>/ Comprobantes</span></h1>
      <button class="btn btn-orange" onclick="modalNuevaVenta()">+ Nuevo comprobante</button></div>
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Serie-Número</th><th>Tipo</th><th>Cliente</th><th>Método pago</th><th>Total</th><th>Fecha</th><th></th></tr></thead>
          <tbody id="vtTbody">${skeletonRows(7)}</tbody>
        </table>
      </div>
    </div>`;
  loadVentas();
}

async function loadVentas() {
  const data = await Api.get('/ventas?limit=50');
  const tbody = document.getElementById('vtTbody');
  if (!data?.success||!data.data.length) { tbody.innerHTML=`<tr><td colspan="7">${emptyState()}</td></tr>`; return; }
  tbody.innerHTML = data.data.map(v=>`
    <tr>
      <td class="fw700 text-accent">${v.serie_numero}</td>
      <td><span class="badge badge-normal">${v.tipo}</span></td>
      <td>${v.cliente}</td>
      <td class="text-muted">${v.metodo_pago}</td>
      <td class="fw700">${fmtCurrency(v.total)}</td>
      <td class="text-muted">${fmtDatetime(v.fecha_emision)}</td>
      <td>${!v.anulado ? `<button class="btn btn-danger btn-sm" onclick="anularVenta(${v.id},'${v.serie_numero}')">Anular</button>` : '<span class="text-muted">Anulado</span>'}</td>
    </tr>`).join('');
}

async function modalNuevaVenta() {
  const cliData = await Api.get('/clientes?limit=200');
  openModal(`
    <div class="modal-header"><h3>Nuevo Comprobante</h3><button class="modal-close btn-icon">✕</button></div>
    <div class="modal-body">
      <div class="form-row">
        <div class="form-group"><label>Cliente *</label><select class="form-control" id="vtCliente"><option value="">Seleccionar…</option>${cliData?.data?.map(c=>`<option value="${c.id}">${c.nombre}</option>`).join('')}</select></div>
        <div class="form-group"><label>Tipo comprobante</label><select class="form-control" id="vtTipo"><option value="boleta">Boleta</option><option value="factura">Factura</option><option value="nota_venta">Nota de Venta</option></select></div>
      </div>
      <div class="form-group"><label>Método de pago</label>
        <div style="display:flex;gap:8px;flex-wrap:wrap" id="vtPagos">
          ${['efectivo','yape','plin','tarjeta','transferencia'].map(m=>`<label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:8px 14px;border:1px solid var(--border);border-radius:8px;font-size:.85rem">
            <input type="radio" name="vtPago" value="${m}" ${m==='efectivo'?'checked':''}> ${m.charAt(0).toUpperCase()+m.slice(1)}
          </label>`).join('')}
        </div>
      </div>
      <div class="fw600 mb8">Items *</div>
      <div id="vtItems"></div>
      <button class="btn btn-ghost btn-sm mt8" onclick="addItemVenta()">+ Agregar línea</button>
      <div style="margin-top:12px;text-align:right">
        <span class="fw700" style="font-size:1.1rem">Total: <span class="text-accent" id="vtTotal">S/ 0.00</span></span>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-orange" onclick="emitirComprobante()">Emitir</button>
    </div>`);
  addItemVenta();
}

function addItemVenta() {
  const c = document.getElementById('vtItems');
  const idx = c.children.length;
  const row = document.createElement('div');
  row.style = 'display:grid;grid-template-columns:3fr 1fr 1fr auto;gap:8px;margin-bottom:8px;align-items:center';
  row.innerHTML = `
    <input class="form-control" placeholder="Descripción" oninput="calcVtTotal()">
    <input type="number" class="form-control" placeholder="Cant" value="1" min="1" oninput="calcVtTotal()">
    <input type="number" class="form-control" placeholder="Precio" value="0" step="0.01" oninput="calcVtTotal()">
    <button class="btn-icon" style="color:var(--red)" onclick="this.parentElement.remove();calcVtTotal()">✕</button>`;
  c.appendChild(row);
}

function calcVtTotal() {
  let t = 0;
  document.querySelectorAll('#vtItems > div').forEach(row => {
    const inputs = row.querySelectorAll('input');
    t += parseFloat(inputs[2]?.value||0) * parseInt(inputs[1]?.value||1);
  });
  document.getElementById('vtTotal').textContent = fmtCurrency(t);
}

async function emitirComprobante() {
  const items = [];
  document.querySelectorAll('#vtItems > div').forEach(row => {
    const inputs = row.querySelectorAll('input');
    const desc = inputs[0]?.value?.trim();
    if (desc) items.push({ descripcion: desc, cantidad: parseInt(inputs[1]?.value||1), precio_unitario: parseFloat(inputs[2]?.value||0) });
  });
  if (!items.length) { toast('Agrega al menos un item','warning'); return; }
  const body = {
    cliente_id: parseInt(document.getElementById('vtCliente').value),
    tipo: document.getElementById('vtTipo').value,
    metodo_pago: document.querySelector('input[name="vtPago"]:checked')?.value||'efectivo',
    items,
  };
  if (!body.cliente_id) { toast('Selecciona un cliente','warning'); return; }
  const data = await Api.post('/ventas', body);
  if (data?.success) { toast(`Comprobante emitido: ${data.serie_numero}`,'success'); closeModal(); loadVentas(); }
  else toast(data?.message||'Error','error');
}

async function anularVenta(id, sn) {
  confirm(`¿Anular comprobante ${sn}?`, async () => {
    const data = await Api.delete(`/ventas/${id}`);
    if (data?.success) { toast('Anulado','success'); loadVentas(); }
    else toast(data?.message||'Error','error');
  });
}


/* ══════════════════════════════════════════════════════════════
   caja.js
══════════════════════════════════════════════════════════════ */
async function renderCaja(el) {
  const sesion = await Api.get('/caja/sesion-activa');
  const activa = sesion?.data;

  el.innerHTML = `
    <div class="page-header"><h1 class="page-title">Caja</h1>
      ${activa
        ? `<button class="btn btn-danger" onclick="cerrarCaja(${activa.id})">Cerrar caja</button>`
        : `<button class="btn btn-orange" onclick="abrirCaja()">Abrir caja</button>`}
    </div>
    ${activa
      ? `<div class="stats-grid">
          <div class="stat-card"><div class="stat-icon green">💵</div><div><div class="stat-value">${fmtCurrency(activa.monto_apertura)}</div><div class="stat-label">Apertura</div></div></div>
          <div class="stat-card"><div class="stat-icon blue">⏰</div><div><div class="stat-value" style="font-size:1rem">${fmtDatetime(activa.fecha_apertura)}</div><div class="stat-label">Hora apertura</div></div></div>
        </div>`
      : `<div class="card" style="text-align:center;padding:32px"><p class="text-muted">No hay caja abierta</p></div>`}
    ${activa ? `
    <div class="card">
      <div class="card-header"><span class="card-title">Movimientos de hoy</span>
        <button class="btn btn-ghost btn-sm" onclick="modalMovimiento(${activa.id})">+ Movimiento</button>
      </div>
      <div class="table-wrap" id="cajaMov">${skeletonRows(4)}</div>
    </div>` : ''}`;

  if (activa) loadMovimientos();
}

async function loadMovimientos() {
  const data = await Api.get('/caja/movimientos');
  const el = document.getElementById('cajaMov');
  if (!el) return;
  if (!data?.success||!data.data.length) { el.innerHTML=emptyState('Sin movimientos hoy'); return; }
  el.innerHTML = `<table><thead><tr><th>Tipo</th><th>Descripción</th><th>Método</th><th class="text-right">Monto</th><th>Hora</th></tr></thead><tbody>
    ${data.data.map(m=>`<tr>
      <td><span class="badge badge-${m.tipo==='ingreso'?'aprobado':'rechazado'}">${m.tipo}</span></td>
      <td>${m.descripcion||'—'}</td><td class="text-muted">${m.metodo_pago}</td>
      <td class="text-right fw700 ${m.tipo==='ingreso'?'text-green':'text-red'}">${m.tipo==='ingreso'?'+':'−'} ${fmtCurrency(m.monto)}</td>
      <td class="text-muted">${fmtDatetime(m.created_at)}</td>
    </tr>`).join('')}
  </tbody></table>`;
}

async function abrirCaja() {
  openModal(`
    <div class="modal-header"><h3>Abrir Caja</h3><button class="modal-close btn-icon">✕</button></div>
    <div class="modal-body"><div class="form-group"><label>Monto de apertura</label><input type="number" class="form-control" id="aperturaMonto" value="0" step="0.01"></div></div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-orange" onclick="confirmarApertura()">Abrir</button>
    </div>`, 'modal-sm');
}

async function confirmarApertura() {
  const data = await Api.post('/caja/abrir', { monto_apertura: parseFloat(document.getElementById('aperturaMonto').value)||0 });
  if (data?.success) { toast('Caja abierta','success'); closeModal(); renderCaja(document.getElementById('pageContainer')); }
  else toast(data?.message||'Error','error');
}

async function cerrarCaja(id) {
  openModal(`
    <div class="modal-header"><h3>Cerrar Caja</h3><button class="modal-close btn-icon">✕</button></div>
    <div class="modal-body"><div class="form-group"><label>Monto de cierre (contado)</label><input type="number" class="form-control" id="cierreMonto" value="0" step="0.01"></div></div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-danger" onclick="confirmarCierre(${id})">Cerrar caja</button>
    </div>`, 'modal-sm');
}

async function confirmarCierre(id) {
  const data = await Api.post(`/caja/cerrar/${id}`, { monto_cierre: parseFloat(document.getElementById('cierreMonto').value)||0 });
  if (data?.success) { toast('Caja cerrada','success'); closeModal(); renderCaja(document.getElementById('pageContainer')); }
  else toast(data?.message||'Error','error');
}

async function modalMovimiento(sesionId) {
  openModal(`
    <div class="modal-header"><h3>Nuevo Movimiento</h3><button class="modal-close btn-icon">✕</button></div>
    <div class="modal-body">
      <div class="form-row">
        <div class="form-group"><label>Tipo</label><select class="form-control" id="movTipo"><option value="ingreso">Ingreso</option><option value="egreso">Egreso</option></select></div>
        <div class="form-group"><label>Método</label><select class="form-control" id="movMetodo"><option>efectivo</option><option>yape</option><option>plin</option><option>tarjeta</option></select></div>
      </div>
      <div class="form-group"><label>Monto</label><input type="number" class="form-control" id="movMonto" step="0.01" value="0"></div>
      <div class="form-group"><label>Descripción</label><input class="form-control" id="movDesc"></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-orange" onclick="guardarMovimiento(${sesionId})">Guardar</button>
    </div>`, 'modal-sm');
}

async function guardarMovimiento(sesionId) {
  const data = await Api.post('/caja/movimiento', {
    sesion_id: sesionId,
    tipo: document.getElementById('movTipo').value,
    metodo_pago: document.getElementById('movMetodo').value,
    monto: parseFloat(document.getElementById('movMonto').value)||0,
    descripcion: document.getElementById('movDesc').value,
  });
  if (data?.success) { toast('Movimiento registrado','success'); closeModal(); loadMovimientos(); }
  else toast('Error','error');
}


/* ══════════════════════════════════════════════════════════════
   compras.js
══════════════════════════════════════════════════════════════ */
async function renderCompras(el) {
  el.innerHTML = `
    <div class="page-header"><h1 class="page-title">Compras <span>/ Proveedores</span></h1>
      <button class="btn btn-orange" onclick="modalNuevaCompra()">+ Nueva compra</button></div>
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>#</th><th>Proveedor</th><th>Estado</th><th>Total</th><th>Fecha</th></tr></thead>
          <tbody id="ocTbody">${skeletonRows(5)}</tbody>
        </table>
      </div>
    </div>`;
  const data = await Api.get('/compras');
  const tbody = document.getElementById('ocTbody');
  if (!data?.success||!data.data.length) { tbody.innerHTML=`<tr><td colspan="5">${emptyState()}</td></tr>`; return; }
  tbody.innerHTML = data.data.map(o=>`
    <tr>
      <td class="fw700 text-accent">#${o.id}</td>
      <td>${o.proveedor_nombre||'Sin proveedor'}</td>
      <td>${badgeEstado(o.estado)||o.estado}</td>
      <td class="fw700">${fmtCurrency(o.total)}</td>
      <td class="text-muted">${fmtDate(o.created_at)}</td>
    </tr>`).join('');
}

async function modalNuevaCompra() {
  const [provs, reps] = await Promise.all([Api.get('/compras/proveedores'), Api.get('/repuestos?limit=200')]);
  openModal(`
    <div class="modal-header"><h3>Nueva Compra / Ingreso</h3><button class="modal-close btn-icon">✕</button></div>
    <div class="modal-body">
      <div class="form-group"><label>Proveedor</label><select class="form-control" id="ocProv"><option value="">Sin proveedor</option>${provs?.data?.map(p=>`<option value="${p.id}">${p.nombre}</option>`).join('')}</select></div>
      <div class="fw600 mb8">Items *</div>
      <div id="ocItems"></div>
      <button class="btn btn-ghost btn-sm mt8" onclick="addItemCompra()">+ Agregar repuesto</button>
      <div style="margin-top:12px;text-align:right"><span class="fw700">Total: <span class="text-accent" id="ocTotal">S/ 0.00</span></span></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-orange" onclick="registrarCompra()">Registrar</button>
    </div>`);
  window._repsData = reps?.data||[];
  addItemCompra();
}

function addItemCompra() {
  const c = document.getElementById('ocItems');
  const row = document.createElement('div');
  row.style = 'display:grid;grid-template-columns:3fr 1fr 1fr auto;gap:8px;margin-bottom:8px;align-items:center';
  row.innerHTML = `
    <select class="form-control" onchange="calcOcTotal()">${(window._repsData||[]).map(r=>`<option value="${r.id}">${r.nombre}</option>`).join('')}</select>
    <input type="number" class="form-control" placeholder="Cant" value="1" min="1" oninput="calcOcTotal()">
    <input type="number" class="form-control" placeholder="P.Unit" value="0" step="0.01" oninput="calcOcTotal()">
    <button class="btn-icon" style="color:var(--red)" onclick="this.parentElement.remove();calcOcTotal()">✕</button>`;
  c.appendChild(row);
}

function calcOcTotal() {
  let t = 0;
  document.querySelectorAll('#ocItems > div').forEach(row => {
    const inputs = row.querySelectorAll('input');
    t += parseFloat(inputs[1]?.value||0) * parseFloat(inputs[0]?.value||1);
    // actually qty * price
    t -= parseFloat(inputs[1]?.value||0) * parseFloat(inputs[0]?.value||1); // reset
    t += parseInt(inputs[0]?.value||1) * parseFloat(inputs[1]?.value||0);
  });
  // redo properly
  t = 0;
  document.querySelectorAll('#ocItems > div').forEach(row => {
    const sel = row.querySelector('select');
    const inps = row.querySelectorAll('input');
    t += parseInt(inps[0]?.value||1) * parseFloat(inps[1]?.value||0);
  });
  document.getElementById('ocTotal').textContent = fmtCurrency(t);
}

async function registrarCompra() {
  const items = [];
  document.querySelectorAll('#ocItems > div').forEach(row => {
    const sel = row.querySelector('select');
    const inps = row.querySelectorAll('input');
    items.push({ repuesto_id: parseInt(sel.value), cantidad: parseInt(inps[0]?.value||1), precio_unitario: parseFloat(inps[1]?.value||0) });
  });
  if (!items.length) { toast('Sin items','warning'); return; }
  const data = await Api.post('/compras', {
    proveedor_id: parseInt(document.getElementById('ocProv').value)||null,
    items,
  });
  if (data?.success) { toast('Compra registrada y stock actualizado','success'); closeModal(); renderCompras(document.getElementById('pageContainer')); }
  else toast(data?.message||'Error','error');
}


/* ══════════════════════════════════════════════════════════════
   reportes.js
══════════════════════════════════════════════════════════════ */
async function renderReportes(el) {
  const now = new Date();
  const mes = now.getMonth()+1, anio = now.getFullYear();

  el.innerHTML = `
    <div class="page-header"><h1 class="page-title">Reportes</h1></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
      <div class="card">
        <div class="card-header"><span class="card-title">Ventas del mes</span></div>
        <div id="repVentas">${skeletonRows(4)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Productividad técnicos</span></div>
        <div id="repTec">${skeletonRows(4)}</div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">Ganancias por OT — ${mes}/${anio}</span></div>
      <div class="table-wrap" id="repGanancias">${skeletonRows(5)}</div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">Inventario valorizado</span></div>
      <div class="table-wrap" id="repInv">${skeletonRows(5)}</div>
    </div>`;

  const [ventas, tecs, ganancias, inv] = await Promise.all([
    Api.get('/reportes/ventas'),
    Api.get(`/reportes/tecnicos?mes=${mes}&anio=${anio}`),
    Api.get(`/reportes/ganancias?mes=${mes}&anio=${anio}`),
    Api.get('/reportes/inventario-valorizado'),
  ]);

  if (ventas?.success) {
    document.getElementById('repVentas').innerHTML = `
      <div style="margin-bottom:12px"><span class="fw700 text-accent" style="font-size:1.3rem">${fmtCurrency(ventas.resumen?.total_ventas)}</span> <span class="text-muted">total · ${ventas.resumen?.total_comp} comprobantes</span></div>
      <table><thead><tr><th>Fecha</th><th>Comp.</th><th class="text-right">Total</th></tr></thead><tbody>
      ${ventas.data?.map(d=>`<tr><td>${fmtDate(d.fecha)}</td><td>${d.comprobantes}</td><td class="text-right fw600">${fmtCurrency(d.total_ventas)}</td></tr>`).join('')||`<tr><td colspan="3">${emptyState('Sin ventas')}</td></tr>`}
      </tbody></table>`;
  }

  if (tecs?.success) {
    document.getElementById('repTec').innerHTML = tecs.data?.length
      ? `<table><thead><tr><th>Técnico</th><th>OTs</th><th>Ingresos</th><th>Comisión</th></tr></thead><tbody>
        ${tecs.data.map(t=>`<tr><td class="fw600">${t.tecnico}</td><td class="text-center">${t.total_ots}</td><td class="text-accent fw600">${fmtCurrency(t.ingresos)}</td><td>${fmtCurrency(t.comision)}</td></tr>`).join('')}
        </tbody></table>` : emptyState();
  }

  if (ganancias?.success) {
    document.getElementById('repGanancias').innerHTML = ganancias.data?.length
      ? `<table><thead><tr><th>OT</th><th>Cliente</th><th>Placa</th><th>Ingreso</th><th>Costo Rep.</th><th>Ganancia</th></tr></thead><tbody>
        ${ganancias.data.map(g=>{
          const gan = parseFloat(g.ingreso) - parseFloat(g.costo_repuestos) - parseFloat(g.costo_mo);
          return `<tr><td class="text-accent fw600">${g.codigo}</td><td>${g.cliente}</td><td>${g.placa}</td><td>${fmtCurrency(g.ingreso)}</td><td class="text-red">${fmtCurrency(g.costo_repuestos)}</td><td class="fw700 ${gan>=0?'text-green':'text-red'}">${fmtCurrency(gan)}</td></tr>`;
        }).join('')}
        </tbody></table>` : emptyState('Sin datos este mes');
  }

  if (inv?.success) {
    document.getElementById('repInv').innerHTML = `
      <div style="margin-bottom:12px"><span class="fw700">Valor costo total: <span class="text-red">${fmtCurrency(inv.totales?.total_costo)}</span></span> · <span>Valor venta: <span class="text-accent fw700">${fmtCurrency(inv.totales?.total_venta)}</span></span></div>
      <table><thead><tr><th>Repuesto</th><th>Stock</th><th>P.Compra</th><th>P.Venta</th><th>Valor costo</th><th>Valor venta</th></tr></thead><tbody>
      ${inv.data?.map(r=>`<tr><td class="fw600">${r.nombre}</td><td class="${r.stock_actual<=0?'text-red':''} fw600">${r.stock_actual}</td><td>${fmtCurrency(r.precio_compra)}</td><td class="text-accent">${fmtCurrency(r.precio_venta)}</td><td>${fmtCurrency(r.valor_costo)}</td><td class="fw700">${fmtCurrency(r.valor_venta)}</td></tr>`).join('')}
      </tbody></table>`;
  }
}


/* ══════════════════════════════════════════════════════════════
   config.js
══════════════════════════════════════════════════════════════ */
async function renderConfig(el) {
  const [cfg, users] = await Promise.all([Api.get('/config'), Api.get('/config/usuarios')]);
  const c = cfg?.data||{};

  el.innerHTML = `
    <div class="page-header"><h1 class="page-title">Configuración</h1></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
      <div class="card">
        <div class="card-header"><span class="card-title">Datos del taller</span></div>
        <div class="form-group"><label>Nombre del taller</label><input class="form-control" id="cfgNombre" value="${c.nombre_taller||''}"></div>
        <div class="form-group"><label>RUC</label><input class="form-control" id="cfgRuc" value="${c.ruc||''}"></div>
        <div class="form-group"><label>Teléfono</label><input class="form-control" id="cfgTel" value="${c.telefono||''}"></div>
        <div class="form-group"><label>Email</label><input class="form-control" id="cfgEmail" value="${c.email||''}"></div>
        <div class="form-group"><label>Dirección</label><textarea class="form-control" id="cfgDir">${c.direccion||''}</textarea></div>
        <div class="form-row">
          <div class="form-group"><label>Serie Boleta</label><input class="form-control" id="cfgSB" value="${c.serie_boleta||'B001'}"></div>
          <div class="form-group"><label>Serie Factura</label><input class="form-control" id="cfgSF" value="${c.serie_factura||'F001'}"></div>
        </div>
        <button class="btn btn-orange mt8" onclick="guardarConfig()">Guardar configuración</button>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Usuarios</span>
          <button class="btn btn-ghost btn-sm" onclick="modalNuevoUsuario()">+ Usuario</button></div>
        <div class="table-wrap">
          <table><thead><tr><th>Nombre</th><th>Usuario</th><th>Rol</th><th>Último acceso</th></tr></thead>
          <tbody>${users?.data?.map(u=>`<tr><td class="fw600">${u.nombre}</td><td class="text-muted">${u.username}</td><td><span class="badge badge-normal">${u.rol}</span></td><td class="text-muted" style="font-size:.78rem">${fmtDatetime(u.ultimo_acceso)}</td></tr>`).join('')||`<tr><td colspan="4">${emptyState()}</td></tr>`}
          </tbody></table>
        </div>
      </div>
    </div>`;
}

async function guardarConfig() {
  const data = await Api.put('/config', {
    nombre_taller: document.getElementById('cfgNombre').value,
    ruc: document.getElementById('cfgRuc').value,
    telefono: document.getElementById('cfgTel').value,
    email: document.getElementById('cfgEmail').value,
    direccion: document.getElementById('cfgDir').value,
    serie_boleta: document.getElementById('cfgSB').value,
    serie_factura: document.getElementById('cfgSF').value,
  });
  if (data?.success) toast('Configuración guardada','success');
  else toast(data?.message||'Error','error');
}

async function modalNuevoUsuario() {
  const roles = await Api.get('/config/roles');
  openModal(`
    <div class="modal-header"><h3>Nuevo Usuario</h3><button class="modal-close btn-icon">✕</button></div>
    <div class="modal-body">
      <div class="form-row"><div class="form-group"><label>Nombre</label><input class="form-control" id="nuNombre"></div><div class="form-group"><label>Username *</label><input class="form-control" id="nuUser"></div></div>
      <div class="form-group"><label>Email</label><input class="form-control" id="nuEmail"></div>
      <div class="form-row">
        <div class="form-group"><label>Contraseña *</label><input type="password" class="form-control" id="nuPass"></div>
        <div class="form-group"><label>Rol *</label><select class="form-control" id="nuRol">${roles?.data?.map(r=>`<option value="${r.id}">${r.nombre}</option>`).join('')}</select></div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-orange" onclick="crearUsuario()">Crear</button>
    </div>`, 'modal-sm');
}

async function crearUsuario() {
  const data = await Api.post('/config/usuarios', {
    nombre: document.getElementById('nuNombre').value,
    username: document.getElementById('nuUser').value,
    email: document.getElementById('nuEmail').value||null,
    password: document.getElementById('nuPass').value,
    rol_id: parseInt(document.getElementById('nuRol').value),
  });
  if (data?.success) { toast('Usuario creado','success'); closeModal(); renderConfig(document.getElementById('pageContainer')); }
  else toast(data?.message||'Error','error');
}
